import React, { useId } from 'react';

/**
 * Rhinestone bits: a gem pattern for filling lettering, and the swirl decal of little crystals (like the ones on Sreeja's laptop lid).
 * Every position is precomputed with fixed decimals so server and browser output match.
 */

/** Rhinestones: a pattern of tiny faceted gems, used to fill lettering. */
export function GemPattern({ id, size = 9, colors = ['#ffffff', '#ff8fc4', '#c2006f'] }: { id: string; size?: number; colors?: string[] }) {
  const r = size * 0.4;
  return (
    <>
      <radialGradient id={`${id}-g`} cx="0.35" cy="0.3" r="0.75">
        <stop offset="0" stopColor={colors[0]} />
        <stop offset="0.45" stopColor={colors[1]} />
        <stop offset="1" stopColor={colors[2]} />
      </radialGradient>
      <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
        <rect width={size} height={size} fill={colors[2]} opacity="0.55" />
        <circle cx={size / 2} cy={size / 2} r={r} fill={`url(#${id}-g)`} />
        <circle cx={size / 2 - r * 0.35} cy={size / 2 - r * 0.35} r={r * 0.22} fill="#fff" opacity="0.9" />
      </pattern>
    </>
  );
}

/* ── the swirl decal: crystals set along a flourish of curls ── */

type Gem = [x: number, y: number, r: number];

function bezier(p: number[], t: number) {
  const u = 1 - t;
  return [
    u * u * u * p[0] + 3 * u * u * t * p[2] + 3 * u * t * t * p[4] + t * t * t * p[6],
    u * u * u * p[1] + 3 * u * u * t * p[3] + 3 * u * t * t * p[5] + t * t * t * p[7],
  ];
}

/** Gems along a cubic curve, evenly spaced, shrinking toward the tip. */
function alongCurve(p: number[], count: number, r0: number, r1: number): Gem[] {
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    const [x, y] = bezier(p, t);
    return [x, y, r0 + (r1 - r0) * t];
  });
}

/** Gems along a curl (a spiral winding inward), getting smaller as it tightens. */
function curl(cx: number, cy: number, r: number, start: number, turns: number, dir: 1 | -1, count: number, gem: number): Gem[] {
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    const a = start + dir * t * turns * Math.PI * 2;
    const rr = r * (1 - t * 0.78);
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, gem * (1 - t * 0.5)];
  });
}

const SWIRL: string[] = (
  [
    ...alongCurve([10, 150, 60, 150, 90, 90, 150, 80], 14, 3.4, 2.8),
    ...curl(168, 64, 26, Math.PI * 0.9, 0.95, 1, 13, 3),
    ...alongCurve([150, 80, 200, 70, 230, 110, 220, 150], 9, 2.8, 2.4),
    ...curl(205, 158, 16, -Math.PI * 0.2, 0.9, 1, 9, 2.4),
    ...alongCurve([90, 108, 100, 60, 70, 30, 40, 36], 10, 2.8, 2.2),
    ...curl(46, 52, 14, -Math.PI * 0.45, 0.85, -1, 8, 2.2),
    ...alongCurve([60, 150, 90, 180, 140, 190, 170, 175], 10, 2.6, 2.2),
    ...curl(160, 166, 11, Math.PI * 0.2, 0.8, -1, 7, 2),
  ] as Gem[]
).map(([x, y, r]) => `${x.toFixed(1)} ${y.toFixed(1)} ${r.toFixed(2)}`);

/** A flourish of tiny crystals, for decorating a surface. */
export function GemSwirl({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 250 210" className={className} style={style} aria-hidden>
      <defs>
        <radialGradient id={`${id}c`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.4" stopColor="#f6efe6" />
          <stop offset="0.75" stopColor="#c9b28a" />
          <stop offset="1" stopColor="#8f7a58" />
        </radialGradient>
      </defs>
      {SWIRL.map((g, i) => {
        const [x, y, r] = g.split(' ').map(Number);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill={`url(#${id}c)`} stroke="rgba(90,70,40,0.35)" strokeWidth="0.4" />
            <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.28} fill="#fff" />
          </g>
        );
      })}
    </svg>
  );
}
