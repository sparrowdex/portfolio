'use client';

import React, { useEffect, useRef } from 'react';

/**
 * A soft pink-and-blue sky with drifting clouds, for the résumé page.
 *
 * Cheap on purpose: each cloud is painted ONCE on mount (a few blobs shaped by
 * fractal noise, lit from above, tinted pink underneath) into its own small
 * canvas. After that the only work is a CSS transform sliding each canvas
 * sideways, which the browser runs on the compositor. No per-frame JavaScript.
 */

export type CloudSpec = { w: number; h: number; top: string; scale: number; secs: number; delay: number; opacity: number; seed: number };

const CLOUDS: CloudSpec[] = [
  { w: 520, h: 200, top: '6%', scale: 1.15, secs: 140, delay: -20, opacity: 0.95, seed: 3 },
  { w: 420, h: 170, top: '22%', scale: 0.8, secs: 190, delay: -120, opacity: 0.75, seed: 11 },
  { w: 600, h: 220, top: '46%', scale: 1.3, secs: 170, delay: -70, opacity: 0.9, seed: 19 },
  { w: 380, h: 150, top: '64%', scale: 0.7, secs: 230, delay: -160, opacity: 0.65, seed: 27 },
  { w: 480, h: 190, top: '80%', scale: 1, secs: 160, delay: -40, opacity: 0.85, seed: 41 },
  { w: 460, h: 180, top: '32%', scale: 1.05, secs: 210, delay: -95, opacity: 0.9, seed: 53 },
  { w: 400, h: 160, top: '12%', scale: 0.85, secs: 250, delay: -200, opacity: 0.8, seed: 67 },
];

/** Small seeded random so every visit gets the same sky. */
function rng(seed: number) {
  let s = seed * 2654435761;
  return () => {
    s = (s ^ (s << 13)) >>> 0;
    s = (s ^ (s >>> 17)) >>> 0;
    s = (s ^ (s << 5)) >>> 0;
    return s / 4294967296;
  };
}

/** Smooth value noise in [0, 1], summed over a few octaves. */
function makeNoise(seed: number) {
  const rand = rng(seed);
  const N = 256;
  const table = Float32Array.from({ length: N * N }, () => rand());
  const at = (x: number, y: number) => table[(((y % N) + N) % N) * N + (((x % N) + N) % N)];
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const value = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const fx = smooth(x - xi);
    const fy = smooth(y - yi);
    const a = at(xi, yi) + (at(xi + 1, yi) - at(xi, yi)) * fx;
    const b = at(xi, yi + 1) + (at(xi + 1, yi + 1) - at(xi, yi + 1)) * fx;
    return a + (b - a) * fy;
  };
  return (x: number, y: number) => {
    let sum = 0;
    let amp = 0.5;
    let f = 1;
    for (let o = 0; o < 5; o++) {
      sum += value(x * f, y * f) * amp;
      amp *= 0.5;
      f *= 2;
    }
    return sum / 0.97;
  };
}

/** Paint one cumulus cloud into `canvas` (done once). */
export function paintCloud(canvas: HTMLCanvasElement, spec: CloudSpec) {
  const { w, h, seed } = spec;
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext('2d');
  if (!g) return;
  const rand = rng(seed + 7);
  const noise = makeNoise(seed);

  // a row of puffs: big in the middle, smaller at the ends, sitting on a flat-ish base
  const puffs = Array.from({ length: 7 }, (_, i) => {
    const t = i / 6;
    const r = h * (0.18 + 0.2 * Math.sin(t * Math.PI)) * (0.85 + rand() * 0.3);
    return { x: w * (0.2 + t * 0.6) + (rand() - 0.5) * w * 0.05, y: h * 0.68 - r * 0.55, r };
  });

  const img = g.createImageData(w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let shape = 0;
      for (const p of puffs) {
        const dx = (x - p.x) / p.r;
        const dy = (y - p.y) / p.r;
        shape = Math.max(shape, 1 - Math.sqrt(dx * dx + dy * dy));
      }
      // soften the flat underside
      const base = Math.min(1, Math.max(0, (h * 0.86 - y) / (h * 0.18)));
      const n = noise(x / 46, y / 46);
      const density = shape * 1.6 + (n - 0.5) * 0.9;
      // fade out before the canvas edge so no cloud ever shows a straight cut
      const edge = Math.min(1, Math.min(x, w - 1 - x, y, h - 1 - y) / (h * 0.14));
      const a = Math.max(0, Math.min(1, (density - 0.05) * 3.2)) * base * edge;
      if (a <= 0) continue;
      // lit from above: white tops, pink-lilac shadow underneath
      const lit = Math.max(0, Math.min(1, 1 - (y - h * 0.25) / (h * 0.6) + (n - 0.5) * 0.6));
      const k = (y * w + x) * 4;
      d[k] = 255 - (1 - lit) * 40;
      d[k + 1] = 255 - (1 - lit) * 95;
      d[k + 2] = 255 - (1 - lit) * 45;
      d[k + 3] = a * 255;
    }
  }
  g.putImageData(img, 0, 0);
}

export function CloudSky() {
  const refs = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    // paint after first paint so the page itself shows up instantly
    const id = requestAnimationFrame(() => {
      CLOUDS.forEach((c, i) => {
        const el = refs.current[i];
        if (el) paintCloud(el, c);
      });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="sky" aria-hidden>
      <div className="sky-sun" />
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="sky-drift"
          style={{ top: c.top, opacity: c.opacity, animationDuration: `${c.secs}s`, animationDelay: `${c.delay}s` } as React.CSSProperties}
        >
          <canvas
            ref={(el) => {
              refs.current[i] = el;
            }}
            style={{ width: c.w * c.scale, height: c.h * c.scale }}
          />
        </div>
      ))}
    </div>
  );
}
