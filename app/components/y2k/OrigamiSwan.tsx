'use client';

import React, { useEffect, useRef } from 'react';

/**
 * A paper swan drawn in code: 16 flat-shaded triangles (facets) of blush-pink paper.
 * The same 16 facets are rearranged into each stage of unfolding, and the animation
 * morphs every corner of every facet from one stage to the next:
 *
 *   swan → wings spread → folded diamond (bird base) → square base → flat creased sheet
 *
 * While the swan flies, its wing facets rotate up and down about the shoulder (flapping).
 * Everything is written straight to the SVG each frame, no React re-render per frame.
 */

type P = [number, number];
type Tri = [P, P, P];
type Stage = { tris: Tri[]; light: number[] };

const N = 16;

/* ── the flat sheet, and the folded stages made from it ── */

// a square cut into 16 triangles: 8 slices from the centre to the edge, each split in two.
// These are the creases you see when the paper is opened back out.
const RING: P[] = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];
function sheet(rot: number, sx: number, sy: number, k: number, dy = 0): Tri[] {
  const t = (p: P): P => {
    const x = p[0] * sx;
    const y = p[1] * sy;
    const c = Math.cos(rot);
    const s = Math.sin(rot);
    return [(x * c - y * s) * k, (x * s + y * c) * k + dy];
  };
  const out: Tri[] = [];
  for (let i = 0; i < 8; i++) {
    const a = RING[i];
    const b = RING[(i + 1) % 8];
    const m: P = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    out.push([t([0, 0]), t(a), t(m)], [t([0, 0]), t(m), t(b)]);
  }
  return out;
}

/* ── the swan, after a classic folded paper swan: a long flat boat of a body, the tail
      rising to a sharp point, a folded wing triangle on its side, a tall straight neck and a
      small pointed head. Drawn facing left, then mirrored so it faces the way it flies in. ── */
const SWAN_LEFT: Tri[] = [
  // folded wing on the near side (0–3): the triangle that sits on the body
  [[8, 44], [58, 6], [70, 40]],
  [[8, 44], [70, 40], [36, 52]],
  [[58, 6], [92, -16], [70, 40]],
  [[8, 44], [36, 52], [12, 52]],
  // far-side wing peeking over the back (4–7)
  [[-24, 40], [58, 4], [24, 22]],
  [[-24, 40], [24, 22], [-6, 40]],
  [[24, 22], [58, 4], [44, 16]],
  [[-6, 40], [24, 22], [6, 40]],
  // neck (8–9): a tall thin pleat, lit on the front, shaded on the side
  [[-42, 52], [-26, 52], [-46, -70]],
  [[-26, 52], [-38, -62], [-46, -70]],
  // head and beak (10–11), pointing forward and a little down
  [[-46, -70], [-38, -62], [-86, -54]],
  [[-46, -70], [-86, -54], [-62, -68]],
  // hull (12–13): the long boat, bottom edge nearly flat, rising to the tail
  [[-44, 54], [44, 60], [98, -16]],
  [[-44, 54], [98, -16], [-20, 40]],
  // tail tip (14–15)
  [[86, -8], [98, -16], [92, 2]],
  [[86, -8], [92, 2], [80, 4]],
];
const SWAN: Tri[] = SWAN_LEFT.map((tri) => tri.map(([x, y]) => [-x, y] as P) as Tri);
const SWAN_LIGHT = [0.8, 0.88, 0.72, 0.84, 0.7, 0.76, 0.66, 0.72, 0.95, 0.8, 0.9, 0.82, 0.86, 0.96, 0.78, 0.86];

/* ── wings spread wide, neck up, seen from the front ── */
const SPREAD: Tri[] = [
  [[-10, 20], [-98, -6], [-40, -30]],
  [[-10, 20], [-40, -30], [-12, -12]],
  [[-98, -6], [-60, 10], [-10, 20]],
  [[-98, -6], [-80, -20], [-40, -30]],
  [[10, 20], [98, -6], [40, -30]],
  [[10, 20], [40, -30], [12, -12]],
  [[98, -6], [60, 10], [10, 20]],
  [[98, -6], [80, -20], [40, -30]],
  [[-6, 18], [6, 18], [0, -62]],
  [[0, -62], [6, 18], [4, -56]],
  [[-5, -66], [5, -66], [0, -56]],
  [[5, -66], [0, -56], [14, -60]],
  [[-22, 24], [22, 24], [0, 44]],
  [[-22, 24], [0, 44], [-12, 40]],
  [[-12, 22], [-26, 34], [0, 30]],
  [[12, 22], [26, 34], [0, 30]],
];
const SPREAD_LIGHT = [0.9, 0.8, 0.84, 0.74, 0.92, 0.82, 0.86, 0.76, 0.95, 0.84, 0.97, 0.9, 0.86, 0.78, 0.8, 0.82];

const STAGES: Stage[] = [
  { tris: SWAN, light: SWAN_LIGHT },
  { tris: SPREAD, light: SPREAD_LIGHT },
  // folded diamond: the sheet, turned on its corner and squeezed narrow
  { tris: sheet(Math.PI / 4, 0.55, 1.05, 62), light: Array.from({ length: N }, (_, i) => (i % 2 ? 0.8 : 0.92)) },
  // square base: a diamond, a little wider
  { tris: sheet(Math.PI / 4, 0.9, 0.9, 70), light: Array.from({ length: N }, (_, i) => (i % 4 < 2 ? 0.86 : 0.93)) },
  // flat sheet: opened all the way, faint shading left in the creases
  { tris: sheet(0, 1, 1, 92), light: Array.from({ length: N }, (_, i) => 0.93 + (i % 2 ? 0.03 : 0) + (i % 4 === 0 ? 0.02 : 0)) },
];
// how long each step of the unfold takes (ms), adding up to about the sound's length
const STEP_MS = [1200, 1500, 1300, 1600];
export const UNFOLD_TOTAL = STEP_MS.reduce((a, b) => a + b, 0);
const FOLD_TOTAL = 2600;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
// blush pink paper, lightness from the facet's shading
const fill = (l: number) => `hsl(342, ${Math.round(mix(62, 80, l))}%, ${Math.round(mix(66, 95, l))}%)`;

/** Rotate the wing facets about the shoulder by `a` radians (flapping). */
function flap(tris: Tri[], a: number): Tri[] {
  if (!a) return tris;
  return tris.map((tri, i) => {
    if (i > 7) return tri;
    // the wings hinge where they meet the body
    const pivot: P = i < 4 ? [-20, 44] : [-4, 38];
    const ang = i < 4 ? a * 1.15 : a;
    return tri.map(([x, y]) => {
      const dx = x - pivot[0];
      const dy = y - pivot[1];
      // lift the wing tip: rotate, and squash a little as it swings toward/away from us
      const c = Math.cos(ang);
      const s = Math.sin(ang);
      return [pivot[0] + dx * c - dy * s, pivot[1] + (dx * s + dy * c) * (1 - Math.abs(a) * 0.3)] as P;
    }) as Tri;
  });
}

export type SwanMode = 'flying' | 'resting' | 'unfolding' | 'folding' | 'flat';

export function OrigamiSwan({ mode, size = 420, onDone }: { mode: SwanMode; size?: number; onDone?: () => void }) {
  const polys = useRef<(SVGPolygonElement | null)[]>([]);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const draw = (tris: Tri[], light: number[]) => {
      tris.forEach((tri, i) => {
        const el = polys.current[i];
        if (!el) return;
        el.setAttribute('points', tri.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' '));
        el.setAttribute('fill', fill(light[i]));
      });
    };
    const between = (a: Stage, b: Stage, t: number) => {
      const e = ease(t);
      draw(
        a.tris.map((tri, i) => tri.map((p, j) => [mix(p[0], b.tris[i][j][0], e), mix(p[1], b.tris[i][j][1], e)]) as Tri),
        a.light.map((l, i) => mix(l, b.light[i], e)),
      );
    };

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const start = performance.now();

    if (mode === 'flat') {
      draw(STAGES[4].tris, STAGES[4].light);
      return;
    }
    if (mode === 'flying' || mode === 'resting') {
      const tick = (now: number) => {
        const t = (now - start) / 1000;
        // flying: quick full wingbeats; resting: a slow, small stretch now and then
        const a = still ? 0 : mode === 'flying' ? Math.sin(t * 13) * 0.42 : Math.max(0, Math.sin(t * 1.3)) ** 6 * 0.18;
        draw(flap(SWAN, a), SWAN_LIGHT);
        if (!still) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }

    // unfolding forwards through the stages, or folding back up in reverse
    const order = mode === 'unfolding' ? [0, 1, 2, 3, 4] : [4, 3, 2, 1, 0];
    const steps = mode === 'unfolding' ? STEP_MS : STEP_MS.map((s) => (s / UNFOLD_TOTAL) * FOLD_TOTAL).reverse();
    const total = steps.reduce((a, b) => a + b, 0);
    const tick = (now: number) => {
      let t = still ? total : now - start;
      if (t >= total) {
        const last = STAGES[order[order.length - 1]];
        draw(last.tris, last.light);
        doneRef.current?.();
        return;
      }
      let k = 0;
      while (t > steps[k]) t -= steps[k++];
      between(STAGES[order[k]], STAGES[order[k + 1]], t / steps[k]);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  return (
    <svg viewBox="-105 -105 210 210" width={size} height={size} className="og-svg" aria-hidden>
      <defs>
        <filter id="og-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#8c3c64" floodOpacity="0.22" />
        </filter>
      </defs>
      <g filter="url(#og-soft)" strokeLinejoin="round">
        {/* back to front: hull and tail, the far wing, the near wing, then neck and head */}
        {[12, 13, 14, 15, 4, 5, 6, 7, 0, 1, 2, 3, 8, 9, 10, 11].map((i) => (
          <polygon
            key={i}
            ref={(el) => {
              polys.current[i] = el;
            }}
            points="0,0 0,0 0,0"
            fill={fill(0.9)}
            stroke="rgba(170, 90, 125, 0.28)"
            strokeWidth="0.5"
          />
        ))}
      </g>
    </svg>
  );
}
