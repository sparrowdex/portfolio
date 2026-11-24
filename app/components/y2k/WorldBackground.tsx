'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { paintCloud, type CloudSpec } from './CloudSky';
import { BeachShells } from './BeachShells';
import { BIRD_SING_EVENT, playFlutter, setBirdChooser } from '../../utils/gardenAmbience';

/**
 * One continuous world behind the home page, travelled top to bottom as you scroll:
 *   hero → open sky at dawn · about → among the clouds · projects → sunset
 *   skills → the greenhouse · contact → the beach (to come).
 * The curly motifs from the original pink wallpaper ride on top, tinted to each place.
 *
 * Cheap by design: colours are CSS gradients, clouds are painted once into small canvases
 * and then only slid sideways by CSS, the light beams and water move with CSS transforms.
 * Zone positions come from the real sections, measured on load and on resize.
 */

type Zones = { about: number; deck: number; skills: number; contact: number; total: number };
// first-paint guesses; replaced by measurements straight after
const GUESS: Zones = { about: 900, deck: 2600, skills: 4300, contact: 5600, total: 6600 };

/** Clouds for the sky and cloud zones. `at` is a fraction of the way from the top to the projects. */
const CLOUDS: (CloudSpec & { at: number })[] = [
  { w: 520, h: 200, top: '', at: 0.04, scale: 1.2, secs: 150, delay: -30, opacity: 0.9, seed: 3 },
  { w: 420, h: 170, top: '', at: 0.18, scale: 0.8, secs: 200, delay: -130, opacity: 0.7, seed: 11 },
  { w: 600, h: 220, top: '', at: 0.34, scale: 1.3, secs: 175, delay: -75, opacity: 0.95, seed: 19 },
  { w: 380, h: 150, top: '', at: 0.46, scale: 0.75, secs: 240, delay: -170, opacity: 0.7, seed: 27 },
  { w: 560, h: 210, top: '', at: 0.56, scale: 1.4, secs: 165, delay: -20, opacity: 0.95, seed: 41 },
  { w: 460, h: 180, top: '', at: 0.66, scale: 1.1, secs: 215, delay: -100, opacity: 0.9, seed: 53 },
  { w: 400, h: 160, top: '', at: 0.78, scale: 0.9, secs: 255, delay: -210, opacity: 0.8, seed: 67 },
  { w: 520, h: 200, top: '', at: 0.86, scale: 1.25, secs: 185, delay: -150, opacity: 0.75, seed: 79 },
];

const px = (n: number) => `${Math.round(n)}px`;

/** Paint a small repeating texture once and hand it back as an image URL. */
function paintTile(w: number, h: number, draw: (g: CanvasRenderingContext2D, rand: () => number) => void) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  if (!g) return '';
  let seed = 12345;
  const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  draw(g, rand);
  return `url(${c.toDataURL()})`;
}

/**
 * Pool-light caustics: the bright, wobbly web you see on shallow water. It's the
 * edges of a seamless Voronoi pattern (where the nearest two random points are almost
 * equally far), painted once into a tile that repeats without a seam.
 */
const SEA_TILE = 256;
function paintSea(g: CanvasRenderingContext2D, rand: () => number) {
  const N = SEA_TILE;
  const cells = 5;
  const size = N / cells;
  const pts = Array.from({ length: cells * cells }, (_, k) => ({
    x: ((k % cells) + 0.15 + rand() * 0.7) * size,
    y: (Math.floor(k / cells) + 0.15 + rand() * 0.7) * size,
  }));
  const img = g.createImageData(N, N);
  const TAU = Math.PI * 2;
  for (let py = 0; py < N; py++) {
    for (let px0 = 0; px0 < N; px0++) {
      // bend space with waves that repeat exactly once per tile, so the web wobbles like real water
      const x = px0 + 10 * Math.sin(TAU * (py / N) * 2 + 1.3) + 5 * Math.sin(TAU * (px0 / N) * 3);
      const y = py + 10 * Math.sin(TAU * (px0 / N) * 2 + 0.7) + 5 * Math.sin(TAU * (py / N) * 3 + 2.1);
      let f1 = 1e9;
      let f2 = 1e9;
      const cx = Math.floor(x / size);
      const cy = Math.floor(y / size);
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          const gx = cx + ox;
          const gy = cy + oy;
          const p = pts[(((gy % cells) + cells) % cells) * cells + (((gx % cells) + cells) % cells)];
          // wrap the point into this neighbour's position so the tile repeats seamlessly
          const px2 = p.x + Math.floor(gx / cells) * N;
          const py2 = p.y + Math.floor(gy / cells) * N;
          const d = Math.hypot(x - px2, y - py2);
          if (d < f1) {
            f2 = f1;
            f1 = d;
          } else if (d < f2) f2 = d;
        }
      }
      // bright, slightly thick lines where cells meet, fading fast away from them
      const edge = Math.max(0, 1 - (f2 - f1) / 8);
      // some stretches of the web glow brighter than others
      const shine = 0.55 + 0.45 * Math.sin(TAU * (px0 / N) + TAU * (py / N) * 2);
      const a = Math.pow(edge, 2.2) * shine;
      const k = (py * N + px0) * 4;
      img.data[k] = 255;
      img.data[k + 1] = 255;
      img.data[k + 2] = 255;
      img.data[k + 3] = a * 235;
    }
  }
  g.putImageData(img, 0, 0);
}

/** Sand grains: light and dark specks. */
function paintSand(g: CanvasRenderingContext2D, rand: () => number) {
  for (let i = 0; i < 2600; i++) {
    const light = rand() > 0.5;
    g.fillStyle = light ? `rgba(255,248,230,${(0.3 + rand() * 0.5).toFixed(2)})` : `rgba(150,110,60,${(0.12 + rand() * 0.25).toFixed(2)})`;
    const r = rand() * 1.3 + 0.3;
    g.fillRect(rand() * 256, rand() * 256, r, r);
  }
}

/**
 * Spots on the wallpaper's branches where a bird can sit, in px on the swirl tile
 * (public/images/bg/swirls.webp, 1600 wide, repeating every 1800 down the page).
 */
// tops of continuous vine strokes on the tile (not the dot patterns); the birds use
// whichever fall inside the greenhouse
const PERCHES: [x: number, y: number][] = [[1388,44], [154,106], [260,132], [1300,696], [1460,704], [42,718], [208,788], [1396,932], [52,946], [198,1006], [1416,1068], [1312,1098], [332,1598], [1484,1638], [1376,1752]];
// a little plumage variety across the flock (degrees of hue shift)
const BIRD_HUES = [0, -8, 10, 4];

/**
 * A small house sparrow, drawn after a reference photo but painted rather than cut out,
 * so it sits naturally on the illustrated vines: grey-brown crown, chestnut stripe behind
 * the eye, pale cheek, streaky brown back, two pale wing bars, buff belly, short orange
 * beak, pink legs. Faces right; CSS flips it. The wing is its own group so it can flap.
 */
function Sparrow({ hue = 0 }: { hue?: number }) {
  const id = useId().replace(/:/g, '');
  const g = (k: string) => `url(#${id}${k})`;
  return (
    <svg viewBox="0 0 64 48" className="bird" aria-hidden style={hue ? { filter: `hue-rotate(${hue}deg)` } : undefined}>
      <defs>
        <radialGradient id={`${id}belly`} cx="0.62" cy="0.55" r="0.7">
          <stop offset="0" stopColor="#f2eadb" />
          <stop offset="0.65" stopColor="#ddcdb3" />
          <stop offset="1" stopColor="#bca587" />
        </radialGradient>
        <linearGradient id={`${id}back`} x1="0.2" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#a6774c" />
          <stop offset="1" stopColor="#7b5232" />
        </linearGradient>
        <linearGradient id={`${id}wing`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b98a55" />
          <stop offset="1" stopColor="#6b4426" />
        </linearGradient>
      </defs>
      {/* tail, angled down behind */}
      <path className="bird-tail" d="M17 28 C 11 31 5 35 1 38 L 3 40.5 C 8 38 13 35 19 31.5 Z" fill="#5d3c23" />
      {/* one silhouette: crown, back, rump, belly, chest, throat */}
      <path
        d="M54 17 C 53 12 49 8.5 44 8.5 C 39 8.5 35 11 31 14.5 C 26 18.5 20 23 16 28 C 15 31 17 33 21 35.5 C 27 39.5 35 40.5 42 37.5 C 48 35 52 30 53.5 24 C 54 21.5 54.3 19 54 17 Z"
        fill={g('belly')}
      />
      {/* brown back from the nape to the rump */}
      <path d="M44 8.5 C 39 8.5 35 11 31 14.5 C 26 18.5 20 23 16 28 C 17 30 19 31 22 31 C 28 27 35 21 41 16.5 C 44 14.5 46 12 44 8.5 Z" fill={g('back')} />
      <path d="M30 17 l -3 3 M 26 20.5 l -3 3 M 34 14.5 l -2.5 2.5" stroke="#3d2614" strokeWidth="1.1" strokeLinecap="round" opacity=".7" />
      {/* faint streaks on the flank */}
      <path d="M33 34 l -2 3 M 37 33.5 l -1.6 3 M 41 32 l -1 2.6" stroke="rgba(120,90,60,.35)" strokeWidth="1" strokeLinecap="round" />
      {/* folded wing with dark feather centres and two pale wing bars */}
      <g className="bird-wing">
        <path d="M21 25 C 26 20 35 19.5 40 23.5 C 42 28 37 33 28 34 C 23 33.5 20 30 21 25 Z" fill={g('wing')} />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${25 + i * 3.4} ${23.5 + i * 0.3} q 1.6 4.2 -0.6 8`} stroke="#3a2414" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity=".72" />
        ))}
        <path d="M23 25.5 C 28 23 34 22.6 38.5 24.5" stroke="#f3ead8" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <path d="M23.5 29 C 28 27.2 33 27 37.5 28.4" stroke="#f3ead8" strokeWidth="1" fill="none" strokeLinecap="round" opacity=".8" />
      </g>
      <g className="bird-head">
        {/* grey-brown crown */}
        <path d="M54 17 C 53 12 49 8.5 44 8.5 C 41 8.5 38.5 9.6 36.5 11.2 C 41 11 46.5 12 51 14.8 C 52.5 15.5 53.4 16.2 54 17 Z" fill="#8d8076" />
        {/* chestnut stripe sweeping back from the eye */}
        <path d="M36.5 11.5 C 41 11.6 46 13 50 15.6 C 46 15.4 41 15.4 37.5 16.6 C 36.3 15 36 13 36.5 11.5 Z" fill="#8b4a25" />
        {/* pale cheek */}
        <path d="M38 17 C 42 15.8 47 16 51 17.4 C 50 21.5 46 23.5 41.5 22.5 C 39.5 21.5 38.4 19.4 38 17 Z" fill="#ece5da" />
        {/* small dark bib */}
        <path d="M51 19.5 C 52.5 21 53.3 23 53.2 25.5 C 51 26 48.6 24.5 47.6 22.5 C 49 22 50.3 21 51 19.5 Z" fill="#2c2420" />
        <circle cx="50.2" cy="14.6" r="1.7" fill="#1c1512" />
        <circle cx="50.75" cy="14.05" r="0.5" fill="#fff" />
        {/* short conical beak */}
        <path className="bird-beak" d="M53.8 15.6 C 56.8 15.9 59.8 17 62 18.2 C 59.6 19.2 56.6 19.6 54 19.3 Z" fill="#e2883c" />
        <path d="M54 17.6 L 61 18.3" stroke="#a65821" strokeWidth="0.5" />
      </g>
      {/* pink legs and toes gripping the branch */}
      <path d="M30 38.5 L 29.4 45.5 M 29.4 45.5 l -3 1.5 M 29.4 45.5 l 3 1.5 M 36 38.6 L 36.8 45.5 M 36.8 45.5 l -3 1.5 M 36.8 45.5 l 3 1.2" stroke="#d99a8f" strokeWidth="1.3" strokeLinecap="round" fill="none" />
    </svg>
  );
}
const TILE_W = 1600;
const TILE_H = 1800;

export function WorldBackground() {
  const rootRef = useRef<HTMLDivElement>(null);
  // the birds sit above the page content (so they can land on a jar), in the page itself
  const [page, setPage] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setPage(rootRef.current?.parentElement ?? null);
  }, []);
  const cloudRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const seaRef = useRef<HTMLDivElement>(null);
  const [z, setZ] = useState<Zones>(GUESS);
  const [tiles, setTiles] = useState({ sea: '', sand: '' });
  const [width, setWidth] = useState(0);
  const [singing, setSinging] = useState<number | null>(null);
  // what each bird is busy with right now (hop, preen, look, ruffle), set at random per bird
  const [doing, setDoing] = useState<Record<number, string>>({});
  // where each bird is sitting (an index into `spots`), and which are mid-flight
  const [seat, setSeat] = useState<number[]>([]);
  const [flying, setFlying] = useState<Record<number, boolean>>({});
  // the tops of the skill-garden jars, measured from the page: birds can land on those too
  const [jarTops, setJarTops] = useState<{ x: number; y: number }[]>([]);
  const shooRef = useRef<(i: number) => void>(() => {});
  const spotsRef = useRef<{ x: number; y: number }[]>([]);
  const [heading, setHeading] = useState<Record<number, number>>({});
  /** Bird `i` flies to a different free spot: another branch, or the top of a jar. */
  const shoo = (i: number) => {
    const spots = spotsRef.current;
    if (flying[i] || !spots.length) return;
    const taken = new Set(seat);
    const free = spots.map((_, k) => k).filter((k) => !taken.has(k));
    if (!free.length) return;
    const to = free[Math.floor(Math.random() * free.length)];
    playFlutter();
    const from = spots[seat[i]];
    setHeading((h) => ({ ...h, [i]: spots[to].x >= (from?.x ?? 0) ? 1 : -1 }));
    setFlying((f) => ({ ...f, [i]: true }));
    setSeat((s) => s.map((k, j) => (j === i ? to : k)));
    window.setTimeout(() => setFlying((f) => ({ ...f, [i]: false })), 2700);
  };
  useEffect(() => {
    shooRef.current = shoo;
  });

  // the bird that's singing opens its beak, and a little note rises from it
  useEffect(() => {
    let t = 0;
    const on = (e: Event) => {
      setSinging((e as CustomEvent<number>).detail);
      clearTimeout(t);
      t = window.setTimeout(() => setSinging(null), 1600);
    };
    window.addEventListener(BIRD_SING_EVENT, on);
    return () => {
      window.removeEventListener(BIRD_SING_EVENT, on);
      clearTimeout(t);
    };
  }, []);

  const birdsRef = useRef<{ x: number }[]>([]);
  const flightRef = useRef(flying);
  useEffect(() => {
    flightRef.current = flying;
  }, [flying]);
  useEffect(() => {
    setBirdChooser(() => {
      const perched = birdsRef.current.map((b, id) => ({ ...b, id })).filter((b) => !flightRef.current[b.id]);
      if (!perched.length || !width) return null;
      const b = perched[Math.floor(Math.random() * perched.length)];
      return { id: b.id, pan: (b.x / width) * 2 - 1 };
    });
    return () => setBirdChooser(null);
  }, [width]);

  // every bird keeps its own schedule: every few seconds one of them does something
  useEffect(() => {
    const acts = ['hop', 'preen', 'look', 'ruffle'];
    let t = 0;
    const tick = () => {
      const n = birdsRef.current.length;
      if (n) {
        const i = Math.floor(Math.random() * n);
        if (!flightRef.current[i]) {
          // now and then, one simply decides to take off on its own
          if (Math.random() < 0.14) shooRef.current(i);
          else {
            const act = acts[Math.floor(Math.random() * acts.length)];
            setDoing((d) => ({ ...d, [i]: act }));
            window.setTimeout(() => setDoing((d) => ({ ...d, [i]: '' })), 1600);
          }
        }
      }
      t = window.setTimeout(tick, 2500 + Math.random() * 4000);
    };
    t = window.setTimeout(tick, 3000);
    return () => clearTimeout(t);
  }, []);

  // water glints and sand grain: tiny tiles painted once, then repeated by CSS
  useEffect(() => {
    const id = requestAnimationFrame(() => setTiles({ sea: paintTile(SEA_TILE, SEA_TILE, paintSea), sand: paintTile(256, 256, paintSand) }));
    return () => cancelAnimationFrame(id);
  }, []);

  // Measure where each section starts so every place lines up with its section.
  useEffect(() => {
    const page = rootRef.current?.parentElement;
    if (!page) return;
    const measure = () => {
      const top = page.getBoundingClientRect().top;
      const at = (id: string, fallback: number) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top - top : fallback;
      };
      const next = {
        about: at('about', GUESS.about),
        deck: at('deck', GUESS.deck),
        skills: at('skills', GUESS.skills),
        contact: at('contact', GUESS.contact),
        total: page.scrollHeight,
      };
      setWidth(page.clientWidth);
      const left = page.getBoundingClientRect().left;
      const tops = [...document.querySelectorAll('.garden-glass')].map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left - left + r.width * 0.66, y: r.top - top + r.height * 0.03 };
      });
      setJarTops((prev) => (prev.length === tops.length && prev.every((p, i) => Math.abs(p.x - tops[i].x) < 2 && Math.abs(p.y - tops[i].y) < 2) ? prev : tops));
      setZ((prev) => (Object.keys(next).every((k) => Math.abs(prev[k as keyof Zones] - next[k as keyof Zones]) < 2) ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(page);
    return () => ro.disconnect();
  }, []);


  // Paint the clouds once, one per idle moment, so the page never stutters while they're drawn.
  useEffect(() => {
    const idle = (cb: () => void) => {
      if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(cb, { timeout: 800 });
      else setTimeout(cb, 60);
    };
    let i = 0;
    let cancelled = false;
    const next = () => {
      if (cancelled || i >= CLOUDS.length) return;
      const el = cloudRefs.current[i];
      if (el) paintCloud(el, CLOUDS[i]);
      i++;
      idle(next);
    };
    idle(next);
    return () => {
      cancelled = true;
    };
  }, []);

  // the beach: the sea starts below the contact heading, the sand under the footer
  // the greenhouse opens straight onto the sea (no empty band between), and the beach is deep
  const horizon = z.contact - 140;
  const shore = z.total - 400;

  // The sky's colours, pinned to the real sections (px from the top of the page).
  // sections change height (e.g. the projects rack vs the open player), so keep every
  // colour stop below the one before it; overlapping stops would make a hard band
  const ramp = (stops: [string, number][]) => {
    let last = -Infinity;
    return `linear-gradient(180deg, ${stops
      .map(([c, y]) => {
        last = Math.max(y, last + 60);
        return `${c} ${px(last)}`;
      })
      .join(', ')})`;
  };
  const sky = ramp([
    ['#9fcbff', 0],
    ['#c9d8ff', z.about * 0.45],
    ['#f6d2ea', z.about - 80],
    ['#ffe3ef', z.about + 260],
    ['#ffe6ea', z.deck - 420],
    ['#ffd3bd', Math.min(z.deck - 60, z.skills - 600)],
    ['#f9bccd', Math.min(z.deck + 520, z.skills - 360)],
    ['#e2bfe8', z.skills - 120],
    ['#e6dbf3', z.skills + 120],
    ['#dcefe4', horizon - 160],
    ['#d4efe9', horizon],
    ['#ffe9da', z.total],
  ]);

  // The wallpaper's curls, tinted to each place: white in the sky, gold at sunset, green in the greenhouse.
  const tint = `linear-gradient(180deg,
    #ffffff 0px,
    #ffffff ${px(z.deck - 300)},
    #fff0c4 ${px(z.deck + 100)},
    #ffe7b0 ${px(z.skills - 400)},
    #5fae6a ${px(z.skills - 80)},
    #4f9a3c ${px(horizon - 200)},
    #e8fbff ${px(horizon + 120)},
    #e8fbff ${px(shore - 40)},
    rgba(232,251,255,0) ${px(shore)})`;

  const cloudBand = z.deck - 120;

  // places a bird can sit: branch-tops that fall in the greenhouse at this width, and the jar tops
  const spots = (() => {
    if (!width) return [] as { x: number; y: number }[];
    const k = width / TILE_W;
    const found: { x: number; y: number }[] = [];
    for (let rep = 0; rep < 8; rep++)
      for (const [x, y] of PERCHES) {
        const py = (y + rep * TILE_H) * k;
        if (py > z.skills - 160 && py < horizon - 80 && found.every((f) => Math.hypot(f.x - x * k, f.y - py) > 90)) found.push({ x: x * k, y: py });
      }
    return [...found, ...jarTops];
  })();
  const BIRDS = Math.min(4, spots.length);
  // start with the birds spread over the branches (first two on the left, two on the right)
  if (seat.length !== BIRDS && spots.length) {
    const branches = spots.slice(0, spots.length - jarTops.length).map((s, k) => ({ ...s, k }));
    const left = branches.filter((s) => s.x < width / 2).map((s) => s.k);
    const right = branches.filter((s) => s.x >= width / 2).map((s) => s.k);
    const start = [...left.slice(0, 2), ...right.slice(0, 2)];
    for (let k = 0; start.length < BIRDS && k < spots.length; k++) if (!start.includes(k)) start.push(k);
    setSeat(start.slice(0, BIRDS));
  }
  const birds = seat.map((k) => spots[k]).filter(Boolean);
  useEffect(() => {
    birdsRef.current = birds;
    spotsRef.current = spots;
  });

  return (
    <div ref={rootRef} aria-hidden className="absolute inset-0 z-0 pointer-events-none overflow-hidden pause-on-overlay">
      <div className="absolute inset-0" style={{ background: sky }} />

      {/* dawn sun, high on the right */}
      <div className="world-glow" style={{ top: px(-80), right: '6%', width: '48vmin', height: '48vmin', '--c1': 'rgba(255,248,220,.95)', '--c2': 'rgba(255,214,230,.45)' } as React.CSSProperties} />
      {/* sunset sun, sitting low behind the projects */}
      <div className="world-glow" style={{ top: px(z.deck + 260), left: '-6%', width: '70vmin', height: '70vmin', '--c1': 'rgba(255,214,160,.9)', '--c2': 'rgba(255,170,190,.4)' } as React.CSSProperties} />

      {/* clouds through the sky and about zones */}
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="world-drift"
          style={{ top: px(c.at * cloudBand), opacity: c.opacity, animationDuration: `${c.secs}s`, animationDelay: `${c.delay}s` }}
        >
          <canvas
            ref={(el) => {
              cloudRefs.current[i] = el;
            }}
            style={{ width: c.w * c.scale, height: c.h * c.scale, display: 'block' }}
          />
        </div>
      ))}

      {/* the greenhouse: glass panes and slanting light */}
      <div className="world-greenhouse" style={{ WebkitMaskImage: 'linear-gradient(180deg, #000 70%, transparent)', maskImage: 'linear-gradient(180deg, #000 70%, transparent)', top: px(z.skills - 260), height: px(z.contact - z.skills + 220) }}>
        <div className="world-panes" />
        <div className="world-beam" style={{ left: '18%', animationDelay: '0s' }} />
        <div className="world-beam" style={{ left: '46%', width: '220px', animationDelay: '-4s' }} />
        <div className="world-beam" style={{ left: '72%', animationDelay: '-8s' }} />
      </div>

      {/* little birds sitting on the wallpaper's branches in the greenhouse (the swirl layer scales with the page width) */}
      {page &&
        createPortal(
          <div aria-hidden className="bird-layer">
      {birds.map((b, i) => {
            const f = flying[i];
            // perched, a bird looks toward the middle of the page; flying, toward where it's headed
            const face = f ? (heading[i] ?? 1) : b.x < width / 2 ? 1 : -1;
            return (
              <button
                key={i}
                type="button"
                tabIndex={-1}
                aria-label="Startle the bird"
                onClick={() => shoo(i)}
                className={`perch-bird ${singing === i && !f ? 'is-singing' : ''} ${f ? 'is-flying' : ''} ${!f && doing[i] ? `is-${doing[i]}` : ''}`}
                // each bird gets its own pace for idle movement, so they never move in sync
                style={{ left: b.x, top: b.y + 4, '--face': face, '--pace': `${5 + ((i * 2.3) % 4)}s`, '--offset': `${-i * 1.7}s` } as React.CSSProperties}
              >
                <Sparrow hue={BIRD_HUES[i % BIRD_HUES.length]} />
                {singing === i && !f && (
                  <span className="bird-note" aria-hidden>
                    ♪
                  </span>
                )}
              </button>
            );
          })}
          </div>,
          page,
        )}

      {/* the beach: clear water with shimmering pool-light, lapping onto the sand */}
      <div ref={seaRef} className="world-sea" style={{ top: px(horizon), height: px(shore - horizon + 40) }}>
        <div className="world-sun-glow" />
        {/* two layers of the same light web, different sizes, drifting different ways: the overlap shimmers like moving water */}
        <div className="world-caustics" style={{ backgroundImage: tiles.sea }} />
        <div className="world-caustics is-b" style={{ backgroundImage: tiles.sea }} />
      </div>
      {/* the sand sits over the sea's last stretch; its top edge is see-through, so the water laps onto it */}
      {/* the sand runs to the very bottom of the page. Colour and grain are separate layers, so the
          gradient can never pick up the grain tile's size and repeat into stripes */}
      <div className="world-sand" style={{ top: px(shore), bottom: 0, background: 'linear-gradient(180deg, rgba(217,185,140,0) 0px, #d9b98c 40px, #e8cda3 80px, #f1d9b2 160px, #efd2a6 100%)' }}>
        {tiles.sand && <div className="absolute inset-0" style={{ backgroundImage: tiles.sand, backgroundSize: '256px 256px', top: 30 }} />}
      </div>

      {/* the shells: toys you can throw in the sea (above the motifs, and clickable) */}
      <BeachShells top={horizon} height={z.total - horizon} seaHeight={shore - horizon + 40} sandTop={shore - horizon + 80} />

      {/* the original wallpaper's curls, dots and butterflies, recoloured for each place */}
      <div className="world-motifs" style={{ background: tint }} />
    </div>
  );
}
