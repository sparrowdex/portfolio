'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PROJECTS_DATA } from '../../data/projects';
import { PLAY_PROJECT_EVENT } from '../RetroPhoneAssistant';
import { retroAudio } from '../../utils/retroAudio';
import { useInView, useOverlayOpen } from './visibility';
import { playPlantSong, stopPlantSong } from '../../utils/plantSong';

/**
 * Skill Garden: one flower per skill area, grown in coloured ASCII, with every
 * skill listed underneath so the garden is the skills section, not decoration.
 *
 * How it draws: each frame the stems, leaves and flowers are painted as ordinary
 * canvas shapes onto a tiny offscreen canvas with one pixel per character cell.
 * Petals are outlined in black so they come out as separate shapes. Every lit
 * pixel is then re-drawn on the visible canvas as a glyph picked by its
 * brightness and tinted with its colour, over a soft blurred glow.
 * A flower opens wider the more of her projects use that area; tapping one
 * opens it fully.
 */

type Kind = 'tulip' | 'daisy' | 'sunflower' | 'lily' | 'rose';
type Skill = { name: string; used: number[] };
/** story: where this skill grew · top: the few skills on its seed packet · home: the project it blooms in most */
type Area = {
  label: string;
  kind: Kind;
  blurb: string;
  story: string;
  top: string[];
  home: number;
  petals: [light: string, mid: string, deep: string];
  skills: Skill[];
};

const s = (name: string, ...used: number[]): Skill => ({ name, used });

// Project ids match app/data/projects.ts (1 Photobooth · 2 Inner Voice · 3 Diecast · 4 Armatrix · 5 Flowers · 6 SpiceVault · 7 Timeless)
const AREAS: Area[] = [
  {
    label: 'Frontend',
    story: 'First sprouted in my Photobooth. Now it runs a live store.',
    top: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    home: 3,
    kind: 'tulip',
    blurb: 'Interfaces that feel good to touch, from a live store to tiny toys.',
    petals: ['#ffd6e6', '#ff6f9f', '#b0103f'],
    skills: [s('React', 2, 4, 5, 6, 7), s('Next.js', 2, 3), s('TypeScript', 3), s('Tailwind CSS', 3), s('Responsive UI'), s('Design systems')],
  },
  {
    label: '3D & WebGL',
    story: 'Grew from a birthday gift: a bouquet of 3D flowers for friends.',
    top: ['Three.js', 'React Three Fiber', 'GLSL shaders'],
    home: 5,
    kind: 'daisy',
    blurb: 'Scenes you can blow on, tap and watch bloom.',
    petals: ['#ffffff', '#dfe9ff', '#7fa6ff'],
    skills: [s('Three.js', 5), s('React Three Fiber', 5, 7), s('GLSL shaders', 4, 5, 7), s('Procedural meshes', 5), s('Particle physics', 7)],
  },
  {
    label: 'Backend',
    story: 'Learned the real way: real payments, real parcels, real customers.',
    top: ['Node.js', 'PostgreSQL (Neon)', 'Prisma ORM', 'Webhooks'],
    home: 3,
    kind: 'sunflower',
    blurb: 'The parts nobody sees, built so they never break.',
    petals: ['#fff3a8', '#ffd23f', '#d99a00'],
    skills: [
      s('Node.js', 6), s('PostgreSQL (Neon)', 3), s('Prisma ORM', 3), s('Docker', 3), s('FastAPI', 4), s('Webhooks', 3),
      s('MySQL', 6), s('Firebase', 5), s('ML recommendations', 6), s('Python'), s('Express'), s('REST APIs'),
    ],
  },
  {
    label: 'Creative tech',
    story: 'Things you blow on: a snow globe that snowed within 4 hours.',
    top: ['Web Audio API', 'Mic-reactive motion', 'GSAP', 'HTML5 Canvas'],
    home: 7,
    kind: 'lily',
    blurb: 'Mic, motion and canvas tricks that make people smile.',
    petals: ['#f4ebff', '#c09cff', '#6a2cd6'],
    skills: [s('Web Audio API', 2, 5, 7), s('Mic-reactive motion', 5, 7), s('GSAP', 1), s('HTML5 Canvas', 1), s('Framer Motion', 4), s('p5.js', 1)],
  },
  {
    label: 'Product',
    story: 'Co-founding means owning the roadmap, not just the code.',
    top: ['Installable PWA', 'Zero-trust payments', 'Logistics webhooks', 'Tech roadmap'],
    home: 3,
    kind: 'rose',
    blurb: 'Running a real store: payments, shipping and the roadmap.',
    petals: ['#ffd9c2', '#ff8a4c', '#a8410f'],
    skills: [s('Installable PWA', 3), s('Push notifications', 3), s('Zero-trust payments', 3), s('Logistics webhooks', 3), s('Tech roadmap', 3)],
  },
];

const AREA_PROJECTS = AREAS.map((a) => [...new Set(a.skills.flatMap((k) => k.used))].sort((x, y) => x - y));
const MOST = Math.max(...AREA_PROJECTS.map((p) => p.length));
/** How far each flower opens on its own: 0.35 (one project) to 1 (the most). */
const LEVEL = AREA_PROJECTS.map((p) => 0.35 + (0.65 * (p.length - 1)) / Math.max(1, MOST - 1));

const NOTES = [392, 440, 523.25, 587.33, 659.25];
// dark → bright; a glyph is chosen by how bright its cell is
const GLYPHS = ' .,:-~=+*ox%#@';
const STEM = '#6cc04a';
const LEAF: [string, string] = ['#8fd068', '#2f6e2c'];
const GAP = '#000';
/** How much a picked jar grows (keep in step with --zoom in y2k.css). */
const ZOOM = 1.6; // outlines between petals: black cells stay blank

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => {
  const k = clamp01(v);
  return k * k * (3 - 2 * k);
};
/** Light petal colours get dark packet text so it stays readable. */
const isLight = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255 > 0.6;
};
const projectTitle = (id: number) => (PROJECTS_DATA.find((p) => p.id === id)?.title ?? `track ${id}`).split(':')[0].replace(/ App$/, '');

type View = { w: number; h: number; font: number; cw: number; ch: number; cols: number; rows: number };

/** One petal pointing along `ang` (0 = straight up), shaded from its base to its tip. */
function petal(g: CanvasRenderingContext2D, x: number, y: number, ang: number, len: number, wid: number, [tip, mid, base]: [string, string, string], line: number) {
  g.save();
  g.translate(x, y);
  g.rotate(ang);
  const grad = g.createLinearGradient(0, 0, 0, -len);
  grad.addColorStop(0, base);
  grad.addColorStop(0.45, mid);
  grad.addColorStop(1, tip);
  g.fillStyle = grad;
  g.strokeStyle = GAP;
  g.lineWidth = line;
  g.beginPath();
  g.moveTo(0, 0);
  g.bezierCurveTo(wid, -len * 0.25, wid * 0.9, -len * 0.8, 0, -len);
  g.bezierCurveTo(-wid * 0.9, -len * 0.8, -wid, -len * 0.25, 0, 0);
  g.fill();
  g.stroke();
  g.restore();
}

function disc(g: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string, ring?: string, line = 0) {
  g.fillStyle = fill;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
  if (ring) {
    g.strokeStyle = ring;
    g.lineWidth = line;
    g.stroke();
  }
}

/** The flower head, with its base at (x, y). `o` is how open it is, 0 to 1. */
function flower(g: CanvasRenderingContext2D, kind: Kind, x: number, y: number, S: number, o: number, c: [string, string, string], line: number, t: number) {
  const open = 0.25 + 0.75 * o;
  switch (kind) {
    case 'tulip': {
      // a cup of three tall petals that lean apart as it opens
      const spread = 0.1 + 0.45 * o;
      const len = S * 0.95;
      const wid = S * 0.36;
      petal(g, x, y, 0, len * 1.02, wid, [c[0], c[1], c[2]], line);
      petal(g, x - S * 0.08, y, -spread, len, wid, [c[0], c[1], c[2]], line);
      petal(g, x + S * 0.08, y, spread, len, wid, [c[0], c[1], c[2]], line);
      break;
    }
    case 'daisy': {
      // face-on: a ring of long white petals round a yellow eye
      const cy = y - S * 0.5;
      const n = 14;
      for (let k = 0; k < n; k++) petal(g, x, cy, (k / n) * Math.PI * 2 + t * 0.05, S * 0.62 * open, S * 0.13, [c[0], c[1], c[2]], line);
      disc(g, x, cy, S * 0.17, '#ffd23f', '#a86a00', line);
      break;
    }
    case 'sunflower': {
      // two rings of pointed petals and a big seeded centre
      const cy = y - S * 0.6;
      const n = 18;
      for (let k = 0; k < n; k++) petal(g, x, cy, ((k + 0.5) / n) * Math.PI * 2, S * 0.62 * open, S * 0.12, [c[1], c[2], '#8a5a00'], line);
      for (let k = 0; k < n; k++) petal(g, x, cy, (k / n) * Math.PI * 2, S * 0.7 * open, S * 0.13, [c[0], c[1], c[2]], line);
      const r = S * 0.3;
      disc(g, x, cy, r, '#4a2a0e', GAP, line);
      g.fillStyle = '#9a6328';
      for (let k = 0; k < 40; k++) {
        const a = k * 2.39996; // golden angle: the sunflower seed spiral
        const d = Math.sqrt(k / 40) * r * 0.85;
        g.fillRect(x + Math.cos(a) * d - 1.5, cy + Math.sin(a) * d - 1.5, 3, 3);
      }
      break;
    }
    case 'lily': {
      // six pointed petals in a star, freckled, with stamens
      const cy = y - S * 0.45;
      for (let k = 0; k < 6; k++) petal(g, x, cy, (k / 6) * Math.PI * 2 + Math.PI / 6, S * 0.72 * open, S * 0.2, [c[0], c[1], c[2]], line);
      g.fillStyle = c[2];
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2 + Math.PI / 6;
        g.fillRect(x + Math.sin(a) * S * 0.28 * open - 1.5, cy - Math.cos(a) * S * 0.28 * open - 1.5, 3, 3);
      }
      g.strokeStyle = '#ffe08a';
      g.lineWidth = Math.max(1.5, line * 0.6);
      for (let k = 0; k < 5; k++) {
        const a = -0.7 + (k / 4) * 1.4;
        const ex = x + Math.sin(a) * S * 0.42 * open;
        const ey = cy - Math.cos(a) * S * 0.42 * open;
        g.beginPath();
        g.moveTo(x, cy);
        g.lineTo(ex, ey);
        g.stroke();
        disc(g, ex, ey, Math.max(2, S * 0.04), '#c9731a');
      }
      break;
    }
    case 'rose': {
      // a round bloom with its petals drawn as a spiral, and two sepals
      const r = S * 0.44 * (0.55 + 0.45 * o);
      const cy = y - r * 0.9;
      petal(g, x, y, -1.1, S * 0.35, S * 0.1, [LEAF[0], STEM, LEAF[1]], line);
      petal(g, x, y, 1.1, S * 0.35, S * 0.1, [LEAF[0], STEM, LEAF[1]], line);
      const grad = g.createRadialGradient(x, cy, 0, x, cy, r);
      grad.addColorStop(0, c[2]);
      grad.addColorStop(0.5, c[1]);
      grad.addColorStop(1, c[0]);
      disc(g, x, cy, r, grad as unknown as string, GAP, line);
      g.strokeStyle = GAP;
      g.lineWidth = line;
      g.beginPath();
      for (let k = 0; k <= 80; k++) {
        const a = (k / 80) * Math.PI * 5;
        const d = (k / 80) * r * 0.85;
        const px = x + Math.cos(a) * d;
        const py = cy + Math.sin(a) * d * 0.9;
        if (k === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.stroke();
      break;
    }
  }
}

/** Paint flower `i` growing in its own jar at time t (seconds since planting), in CSS px. */
function paintFlower(g: CanvasRenderingContext2D, v: View, i: number, t: number, o: number) {
  const { w, h } = v;
  const ground = h - 14;
  const line = Math.max(2, v.cw * 0.9);

  g.fillStyle = '#000';
  g.fillRect(0, 0, w, h);
  // a little mound of soil
  g.fillStyle = '#5a3a20';
  g.beginPath();
  g.ellipse(w / 2, ground + 14, w * 0.34, 16, 0, Math.PI, 0);
  g.fill();

  const S = Math.min(w * 0.46, h * 0.34);
  const delay = i * 0.18;
  const grow = ease((t - delay) / 2.2);
  if (grow <= 0) return;
  const baseX = w / 2;
  const height = (h - 30 - S * 1.25) * (0.62 + 0.38 * LEVEL[i]);
  const bend = (i % 2 ? -1 : 1) * w * 0.05;
  const swayAmp = w * 0.03;
  const at = (k: number) => {
    const lift = k * height * grow;
    const sway = Math.sin(t * 1.25 + i * 1.9) * swayAmp * Math.pow(k * grow, 1.6);
    return { x: baseX + bend * Math.sin(k * Math.PI * 0.9) * grow + sway, y: ground - lift };
  };

  g.strokeStyle = STEM;
  g.lineWidth = Math.max(4, w / 45);
  g.lineCap = 'round';
  g.beginPath();
  for (let k = 0; k <= 24; k++) {
    const p = at(k / 24);
    if (k === 0) g.moveTo(p.x, p.y);
    else g.lineTo(p.x, p.y);
  }
  g.stroke();

  const unfurl = ease((t - 1 - delay) / 1.4);
  if (unfurl > 0) {
    for (const [k, side, len] of [
      [0.2, -1, 0.55],
      [0.32, 1, 0.48],
      [0.52, -1, 0.4],
    ] as const) {
      const p = at(k);
      petal(g, p.x, p.y, side * 1.05, S * len * unfurl, S * 0.11, [LEAF[0], STEM, LEAF[1]], line * 0.8);
    }
  }

  const head = at(1);
  const bud = ease((t - 1.8 - delay) / 1);
  if (bud <= 0) return;
  const c = AREAS[i].petals;
  if (o < 0.06) {
    petal(g, head.x, head.y, 0, S * 0.45 * bud, S * 0.14, [c[1], LEAF[0], LEAF[1]], line);
    return;
  }
  flower(g, AREAS[i].kind, head.x, head.y, S, o, c, line, t);
}

/** Turn one painted jar into glyphs on its visible canvas. */
function drawGlyphs(out: CanvasRenderingContext2D, cells: HTMLCanvasElement, px: Uint8ClampedArray, v: View, t: number, still: boolean) {
  out.clearRect(0, 0, v.w, v.h);
  out.save();
  out.globalAlpha = 0.45;
  out.globalCompositeOperation = 'lighter';
  out.filter = `blur(${(v.ch * 0.5).toFixed(1)}px)`;
  out.imageSmoothingEnabled = true;
  out.drawImage(cells, 0, 0, v.cols * v.cw, v.rows * v.ch);
  out.restore();

  out.font = `bold ${v.font}px ui-monospace, Menlo, Consolas, "DejaVu Sans Mono", monospace`;
  out.textBaseline = 'top';
  const tick = Math.floor(t * 7);
  const top = GLYPHS.length - 1;
  for (let y = 0; y < v.rows; y++) {
    for (let x = 0; x < v.cols; x++) {
      const k = (y * v.cols + x) * 4;
      const r = px[k];
      const gg = px[k + 1];
      const b = px[k + 2];
      const m = Math.max(r, gg, b);
      if (m < 20) continue;
      const lum = m / 255;
      const shimmer = still ? 0 : (((x * 73856093) ^ (y * 19349663) ^ (tick * 83492791)) >>> 0) % 7 === 0 ? 1 : 0;
      const gi = Math.min(top, Math.max(1, Math.round(Math.pow(lum, 0.7) * top) - shimmer));
      const lift = (60 + 195 * lum) / m;
      out.fillStyle = `rgb(${(r * lift) | 0},${(gg * lift) | 0},${(b * lift) | 0})`;
      out.fillText(GLYPHS[gi], x * v.cw, y * v.ch);
    }
  }
}

/** The jar's knob: a tiny solid version of the flower inside. */
function JarKnob({ kind, c }: { kind: Kind; c: [string, string, string] }) {
  const ring = (n: number, rx: number, ry: number, dist: number, fill: string, offset = 0) =>
    Array.from({ length: n }, (_, k) => (
      <ellipse key={k} cx="16" cy={16 - dist} rx={rx} ry={ry} fill={fill} transform={`rotate(${(k * 360) / n + offset} 16 16)`} />
    ));
  return (
    <svg viewBox="0 0 32 32" className="garden-knob" aria-hidden>
      <g stroke="#1a0f1f" strokeWidth="1.2" strokeLinejoin="round">
        {kind === 'tulip' && (
          <>
            <path d="M16 29 C9 27 6 20 7 10 L11 14 L16 5 L21 14 L25 10 C26 20 23 27 16 29 Z" fill={c[1]} />
            <path d="M16 29 C13 24 13 14 16 5 C19 14 19 24 16 29 Z" fill={c[0]} />
          </>
        )}
        {kind === 'daisy' && (
          <>
            {ring(10, 3, 6.5, 8, '#fff')}
            <circle cx="16" cy="16" r="4.5" fill="#ffd23f" />
          </>
        )}
        {kind === 'sunflower' && (
          <>
            {ring(12, 2.8, 6.5, 8.5, c[1])}
            <circle cx="16" cy="16" r="6" fill="#5a3412" />
          </>
        )}
        {kind === 'lily' && (
          <>
            {Array.from({ length: 6 }, (_, k) => (
              <path key={k} d="M16 16 C10 12 12 5 16 1.5 C20 5 22 12 16 16 Z" fill={k % 2 ? c[1] : c[0]} transform={`rotate(${k * 60 + 30} 16 16)`} />
            ))}
            <circle cx="16" cy="16" r="2.2" fill="#ffe08a" />
          </>
        )}
        {kind === 'rose' && (
          <>
            {/* a rose from the side: two leaves, a cup of outer petals, and a tight furled bud on top */}
            <path d="M16 30 L16 22" stroke="#3f8a3a" strokeWidth="1.6" fill="none" />
            <path d="M16 26 C 11 27 8 24 7 21 C 11 21 14 23 16 26 Z" fill="#5fae4a" />
            <path d="M16 25 C 21 26 24 23 25 20 C 21 20 18 22 16 25 Z" fill="#4f9a3c" />
            <path d="M7 12 C 7 19 11 23 16 23 C 21 23 25 19 25 12 C 22 15 19 16 16 16 C 13 16 10 15 7 12 Z" fill={c[2]} />
            <path d="M9 11 C 9 17 12 20.5 16 20.5 C 20 20.5 23 17 23 11 C 20.5 13.5 18.5 14.3 16 14.3 C 13.5 14.3 11.5 13.5 9 11 Z" fill={c[1]} />
            <path d="M11 9 C 11 4 14 2 16 2 C 18 2 21 4 21 9 C 21 13 18.6 15 16 15 C 13.4 15 11 13 11 9 Z" fill={c[1]} />
            <path d="M16 3 C 14 5 13.6 8 15 10 C 16.6 12 19.6 11 20 8.5" fill="none" strokeWidth="1.1" />
            <path d="M12 9.5 C 13 12.5 16 13.6 18.8 12.4" fill="none" strokeWidth="0.9" />
            <path d="M12.5 5 C 13 4 14 3.4 15 3.2" stroke={c[0]} strokeWidth="1" fill="none" />
          </>
        )}
      </g>
    </svg>
  );
}

/** The seed packet for one area: its story, every skill, and where it blooms. */
function SeedPacket({ a, i }: { a: Area; i: number }) {
  const ink = isLight(a.petals[1]) ? '#1a0f1f' : '#fff';
  return (
    <article
      className="w-full rounded-lg overflow-hidden text-ink animate-pop-in"
      style={{ background: '#fff8ec', rotate: '1.5deg', boxShadow: `0 0 0 3px ${a.petals[1]}, 0 14px 26px rgba(122,0,68,.25)` }}
    >
      <div
        aria-hidden
        className="h-2.5"
        style={{ background: `radial-gradient(circle at 6px 0, transparent 5px, ${a.petals[1]} 5.5px) 0 0 / 12px 12px repeat-x` }}
      />
      <div className="px-4 py-2 flex items-center justify-between gap-2" style={{ background: a.petals[1], color: ink }}>
        <span className="font-pixel text-lg leading-none tracking-wider uppercase whitespace-nowrap">✿ {a.kind} seeds</span>
        <span className="font-pixel text-lg leading-none whitespace-nowrap">
          {AREA_PROJECTS[i].length} project{AREA_PROJECTS[i].length === 1 ? '' : 's'}
        </span>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <h3 className="font-bubble text-2xl leading-tight">{a.label}</h3>
        <p className="text-[14px] leading-snug text-ink/75 italic">&ldquo;{a.story}&rdquo;</p>
        <div className="flex flex-wrap gap-1.5">
          {a.skills.map((k) => (
            <span
              key={k.name}
              className="font-pixel text-base leading-none px-2 py-1 rounded border bg-white"
              style={{ borderColor: a.top.includes(k.name) ? a.petals[1] : 'rgba(26,15,31,.2)' }}
            >
              {k.name}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            retroAudio.playCassetteInsert();
            window.dispatchEvent(new CustomEvent(PLAY_PROJECT_EVENT, { detail: a.home }));
          }}
          className="text-left font-pixel text-lg leading-tight hover:underline"
          style={{ color: `color-mix(in srgb, ${a.petals[2]} 60%, #1a0f1f)` }}
        >
          ▶ see it in {projectTitle(a.home)}
        </button>
      </div>
    </article>
  );
}

export function AsciiGarden() {
  const [picked, setPicked] = useState<number | null>(null);
  const [watered, setWatered] = useState(false);
  const [plantedAt, setPlantedAt] = useState(0); // bump to replant

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const viewsRef = useRef<(View | null)[]>(AREAS.map(() => null));
  const pickRef = useRef({ picked, watered });
  const openRef = useRef<number[]>(AREAS.map(() => 0));
  const dirtyRef = useRef(true); // reduced motion: redraw only when something changed

  useEffect(() => {
    pickRef.current = { picked, watered };
    dirtyRef.current = true;
  }, [picked, watered]);

  const inView = useInView(wrapRef);
  const overlay = useOverlayOpen();
  const live = inView && !overlay;

  // faint birdsong only while the garden is in the middle of the screen, so each place's

  // Size each jar's canvas (and its character grid) to the jar. Jars never change layout size;
  // a picked jar only scales up, so its canvas is drawn at the big size up front to stay crisp.
  useEffect(() => {
    const fitOne = (i: number) => {
      const canvas = canvasRefs.current[i];
      if (!canvas) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      const font = Math.max(5.5, Math.min(8.5, w / 34));
      const cw = font * 0.62;
      const ch = font * 1.08;
      const dpr = Math.min(2, window.devicePixelRatio || 1) * ZOOM;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      viewsRef.current[i] = { w, h, font, cw, ch, cols: Math.ceil(w / cw), rows: Math.ceil(h / ch) };
      dirtyRef.current = true;
    };
    const fitAll = () => AREAS.forEach((_, i) => fitOne(i));
    fitAll();
    const ro = new ResizeObserver(fitAll);
    canvasRefs.current.forEach((c) => c && ro.observe(c));
    return () => ro.disconnect();
  }, []);

  // One animation loop for all five jars, only while they're on screen.
  useEffect(() => {
    if (!live) return;
    const cells = document.createElement('canvas');
    const g = cells.getContext('2d', { willReadFrequently: true });
    if (!g) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let start = -1;
    let last = 0;
    let raf = 0;
    dirtyRef.current = true;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now - last < 33) return; // ~30 fps is plenty for ASCII
      if (still && !dirtyRef.current) return;
      last = now;
      dirtyRef.current = false;
      if (start < 0) start = now;
      const t = still ? 60 : (now - start) / 1000;

      const { picked: p, watered: wet } = pickRef.current;
      openRef.current = openRef.current.map((o, i) => {
        const ready = t > 3 + i * 0.45;
        const target = !ready ? 0 : wet || i === p ? 1 : LEVEL[i];
        return still ? target : o + (target - o) * 0.06;
      });

      AREAS.forEach((_, i) => {
        const v = viewsRef.current[i];
        const canvas = canvasRefs.current[i];
        const out = canvas?.getContext('2d');
        if (!v || !canvas || !out) return;
        if (cells.width !== v.cols || cells.height !== v.rows) {
          cells.width = v.cols;
          cells.height = v.rows;
        }
        g.setTransform(1 / v.cw, 0, 0, 1 / v.ch, 0, 0);
        paintFlower(g, v, i, t, openRef.current[i]);
        const px = g.getImageData(0, 0, v.cols, v.rows).data;
        const dpr = canvas.width / v.w;
        out.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawGlyphs(out, cells, px, v, t, still);
      });
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [live, plantedAt]);

  const shelfRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (picked === null) return;
    const onDown = (e: PointerEvent) => {
      if (!shelfRef.current?.contains(e.target as Node)) {
        setPicked(null);
        stopPlantSong();
      }
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [picked]);

  // stop the plant's song if the garden goes away
  useEffect(() => stopPlantSong, []);

  const pick = (i: number) => {
    if (picked === i) {
      stopPlantSong();
      return setPicked(null);
    }
    setPicked(i);
    // each flower "sings": a generative melody from a simulated biodata signal (utils/plantSong.ts)
    playPlantSong(AREAS[i].kind);
  };

  return (
    <div ref={wrapRef}>
      {/* the specimen shelf. Every jar keeps its place in the layout; picking one only moves things
          with transforms (the jar scales up, its neighbours slide apart, the packet fades in), so
          nothing reflows and it stays smooth. Side-by-side only on wide screens. */}
      <div ref={shelfRef} className="garden-shelf">
        {AREAS.map((a, i) => {
          const on = picked === i;
          const side = picked === null ? 0 : i < picked ? -1 : i > picked ? 1 : 0;
          return (
            <div
              key={a.label}
              className={`garden-slot ${on ? 'is-open' : ''} ${picked !== null && !on ? 'is-dim' : ''}`}
              style={{ '--side': side } as React.CSSProperties}
            >
              <button
                type="button"
                aria-pressed={on}
                aria-label={`${a.label}: look closer at the ${a.kind}`}
                onClick={() => pick(i)}
                className="garden-jar relative w-full"
                style={{ '--glow': a.petals[1] } as React.CSSProperties}
              >
                <JarKnob kind={a.kind} c={a.petals} />
                <span className="garden-glass">
                  <canvas
                    ref={(el) => {
                      canvasRefs.current[i] = el;
                    }}
                    aria-hidden
                    className="absolute inset-0 w-full h-full"
                  />
                  <span aria-hidden className="garden-shine" />
                </span>
              </button>
              <span
                className="garden-name font-pixel text-lg leading-none text-center"
                style={{ color: on ? `color-mix(in srgb, ${a.petals[2]} 70%, #1a0f1f)` : 'rgba(26,15,31,.7)' }}
              >
                {a.label}
              </span>
            </div>
          );
        })}
        {/* wide screens: the packet sits beside the big jar */}
        {picked !== null && (
          <div className="garden-packet" style={{ '--at': picked } as React.CSSProperties}>
            <SeedPacket key={picked} a={AREAS[picked]} i={picked} />
          </div>
        )}
      </div>

      {/* phones and tablets: the packet sits under the shelf */}
      {picked !== null && (
        <div className="garden-packet-below mt-6 max-w-sm mx-auto">
          <SeedPacket key={picked} a={AREAS[picked]} i={picked} />
        </div>
      )}

      <div className="mt-8 max-w-3xl mx-auto flex flex-col items-center gap-3 text-center">
        <p
          className="font-pixel text-xl leading-tight text-ink/75"
          title="the melodies are inspired by plant biodata music: electrodes on real leaves turn a plant's tiny electrical changes into notes"
        >
          the more projects use a skill, the wider it blooms · tap a jar to hear it sing ♪
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              setWatered((w) => !w);
              NOTES.forEach((f, i) => setTimeout(() => retroAudio.playNote(f, 0.35, 0.18), i * 60));
            }}
            className="y2k-gloss rounded-full px-4 py-1.5 font-pixel text-lg leading-none"
            style={{ '--btn': '#3f9a4a' } as React.CSSProperties}
          >
            {watered ? 'let them rest' : '💧 water all'}
          </button>
          <button
            type="button"
            onClick={() => {
              openRef.current = AREAS.map(() => 0);
              setPlantedAt((n) => n + 1);
            }}
            className="y2k-gloss y2k-gloss-silver rounded-full px-4 py-1.5 font-pixel text-lg leading-none"
          >
            🌱 replant
          </button>
        </div>
      </div>
    </div>
  );
}
