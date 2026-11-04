'use client';

import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { retroAudio } from '../../utils/retroAudio';
import { Y2KWindow } from './Y2KWindow';
import { useInView, useOverlayOpen } from './visibility';
import { PROJECTS_DATA } from '../../data/projects';
import { PLAY_PROJECT_EVENT } from '../RetroPhoneAssistant';

/**
 * Winamp-style skills equalizer you can actually play with:
 * drag sliders (they sing), pick presets, watch the analyzer react.
 * Every skill is always listed; tap one to see (and play) the projects that use it.
 */

/** used: project ids on the disc rack that use it · note: where else it was used (not on the rack). */
type Skill = { name: string; used?: number[]; note?: string };
const sk = (name: string, ...used: number[]): Skill => ({ name, used });

const BANDS: { freq: string; label: string; note: number; skills: Skill[] }[] = [
  {
    freq: '60Hz',
    label: 'UI / Next.js',
    note: 261.63,
    skills: [sk('React', 2, 4, 5, 6, 7), sk('Next.js', 2, 3), sk('TypeScript', 3), sk('Tailwind CSS', 3), sk('Responsive UI'), sk('Design systems')],
  },
  {
    freq: '250Hz',
    label: 'WebGL / 3D',
    note: 329.63,
    skills: [sk('Three.js', 5), sk('React Three Fiber', 5, 7), sk('GLSL shaders', 4, 5, 7), sk('Procedural meshes', 5), sk('Particle physics', 7)],
  },
  {
    freq: '1kHz',
    label: 'Backend',
    note: 392.0,
    skills: [
      sk('Node.js', 6), sk('PostgreSQL (Neon)', 3), sk('Prisma ORM', 3), sk('Docker', 3), sk('FastAPI', 4), sk('Webhooks', 3), sk('MySQL', 6),
      sk('Firebase', 5), sk('ML recommendations', 6),
      { name: 'Python', note: 'her very first project: a grocery billing system with a Tkinter UI (class 12)' },
      sk('Express'), sk('REST APIs'), sk('Clerk auth'), sk('Postman'),
    ],
  },
  {
    freq: '4kHz',
    label: 'Creative Tech',
    note: 493.88,
    skills: [
      { name: 'GSAP', used: [1], note: '+ the animation workhorse in most of her other projects' },
      sk('Web Audio API', 2, 5, 7), sk('Mic-reactive motion', 5, 7), sk('WebGL', 5, 7), sk('HTML5 Canvas', 1), sk('Framer Motion', 4),
      sk('p5.js', 1), sk('Canva design'),
    ],
  },
  {
    freq: '16kHz',
    label: 'Product',
    note: 587.33,
    skills: [sk('Installable PWA', 3), sk('Push notifications', 3), sk('Zero-trust payments', 3), sk('Logistics webhooks', 3), sk('Tech roadmap', 3), sk('Security posture', 3)],
  },
];

/** Distinct projects behind each band. */
const BAND_PROJECTS = BANDS.map((b) => [...new Set(b.skills.flatMap((s) => s.used ?? []))]);
const MOST = Math.max(...BAND_PROJECTS.map((p) => p.length));
/** Her real mix: each band's level follows how many projects use it (never below 40). */
const REAL_MIX = BAND_PROJECTS.map((p) => Math.round(40 + (60 * p.length) / MOST));

const shortTitle = (id: number) => {
  const t = PROJECTS_DATA.find((p) => p.id === id)?.title ?? `track ${id}`;
  return t.split(':')[0].replace(/ App$/, '').replace(/^The /, '');
};

const PRESETS: { id: string; label: string; gains: number[]; blurb: string }[] = [
  { id: 'sreeja', label: "★ sreeja's mix", gains: REAL_MIX, blurb: 'the real levels: each band is set by how many of her projects use it.' },
  { id: 'frontend', label: 'frontend', gains: [100, 80, 40, 75, 30], blurb: 'pixel-perfect UI, buttery motion, React all day.' },
  { id: 'backend', label: 'backend', gains: [45, 20, 100, 35, 80], blurb: 'APIs, databases, webhooks and zero-trust payments.' },
  { id: 'creative', label: 'creative', gains: [70, 100, 30, 100, 20], blurb: 'WebGL, mic-reactive motion (blow on the screen!), canvas toys and Canva-made elements.' },
  { id: 'cto', label: 'cto mode', gains: [65, 40, 85, 45, 100], blurb: 'co-founder & CTO of The Diecast Store: a PWA with its own push notifications, zero-trust payments and live logistics.' },
  { id: 'flat', label: 'flat', gains: [50, 50, 50, 50, 50], blurb: 'reset. now push a slider ↑' },
];

const BAR_COUNT = 30;
const CENTERS = BANDS.map((_, i) => ((i + 0.5) / BANDS.length) * BAR_COUNT);

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
const pitch = (band: number, v: number) => BANDS[band].note * Math.pow(2, (v - 50) / 120);

// Phones get horizontal sliders (rows), bigger screens the classic vertical EQ.
const subscribeNarrow = (cb: () => void) => {
  const mq = window.matchMedia('(max-width: 639px)');
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
const useNarrow = () => useSyncExternalStore(subscribeNarrow, () => window.matchMedia('(max-width: 639px)').matches, () => false);

function Slider({
  band,
  value,
  active,
  horizontal,
  onChange,
}: {
  band: number;
  value: number;
  active: boolean;
  horizontal: boolean;
  onChange: (band: number, v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const fromPointer = (e: React.PointerEvent) => {
    const r = trackRef.current!.getBoundingClientRect();
    const k = horizontal ? (e.clientX - r.left) / r.width : 1 - (e.clientY - r.top) / r.height;
    onChange(band, clamp(k * 100));
  };

  const fill = active ? 'linear-gradient(var(--dir), #ff2e93, #ff8fd8, #7fe3ff)' : 'linear-gradient(var(--dir), #6b3a63, #b58aad)';
  const knob = { '--btn': active ? '#ff2e93' : '#bfaebb' } as React.CSSProperties;

  const track = (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label={`${BANDS[band].label} level`}
      aria-orientation={horizontal ? 'horizontal' : 'vertical'}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-valuetext={`${value}%`}
      className={`relative flex touch-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff8fd8] rounded-full ${
        horizontal ? 'flex-1 h-9 items-center cursor-ew-resize' : 'h-36 lg:h-32 w-10 justify-center cursor-ns-resize'
      }`}
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        fromPointer(e);
      }}
      onPointerMove={(e) => dragging.current && fromPointer(e)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
      onKeyDown={(e) => {
        const step = { ArrowUp: 5, ArrowRight: 5, ArrowDown: -5, ArrowLeft: -5, PageUp: 20, PageDown: -20 }[e.key];
        if (step) {
          e.preventDefault();
          onChange(band, clamp(value + step));
        } else if (e.key === 'Home' || e.key === 'End') {
          e.preventDefault();
          onChange(band, e.key === 'End' ? 100 : 0);
        }
      }}
    >
      {horizontal ? (
        <>
          <div className="relative w-full h-3 rounded-full bg-black/60 border border-white/15">
            <div className="absolute left-0 inset-y-0 rounded-full" style={{ width: `${value}%`, background: fill, '--dir': '90deg' } as React.CSSProperties} />
          </div>
          <div className="y2k-gloss absolute top-1/2 -translate-y-1/2 w-5 h-8 rounded-full pointer-events-none" style={{ left: `calc(${value}% - 10px)`, ...knob }} />
        </>
      ) : (
        <>
          <div className="relative h-full w-3 rounded-full bg-black/60 border border-white/15">
            <div className="absolute bottom-0 inset-x-0 rounded-full" style={{ height: `${value}%`, background: fill, '--dir': '0deg' } as React.CSSProperties} />
            {[25, 50, 75].map((t) => (
              <span key={t} className="absolute -left-2 w-1.5 h-px bg-white/25" style={{ bottom: `${t}%` }} />
            ))}
          </div>
          <div className="y2k-gloss absolute left-1/2 -translate-x-1/2 w-10 h-5 rounded-full pointer-events-none" style={{ bottom: `calc(${value}% - 10px)`, ...knob }} />
        </>
      )}
    </div>
  );

  if (horizontal) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-24 shrink-0 leading-none">
          <span className={`block font-pixel text-lg ${active ? 'text-[#ff8fd8]' : 'text-white'}`}>{BANDS[band].label}</span>
          <span className="block font-pixel text-sm text-white/50">{BANDS[band].freq}</span>
        </div>
        {track}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-2">
      {track}
      <span className="font-pixel text-xl leading-none text-white">{BANDS[band].freq}</span>
      <span className={`font-pixel text-base leading-none text-center ${active ? 'text-[#ff8fd8]' : 'text-white/60'}`}>{BANDS[band].label}</span>
    </div>
  );
}

export function Equalizer() {
  const [gains, setGains] = useState<number[]>(PRESETS[0].gains);
  const [activeBand, setActiveBand] = useState(0);
  const [preset, setPreset] = useState<string | null>('sreeja');
  const [picked, setPicked] = useState<string | null>(null);
  const narrow = useNarrow();
  const gainsRef = useRef(gains);
  const kickRef = useRef<number[]>(BANDS.map(() => 0));
  const barsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const peaksRef = useRef<(HTMLSpanElement | null)[]>([]);
  const lastNote = useRef(0);
  const tweenRef = useRef(0);

  useEffect(() => {
    gainsRef.current = gains;
  }, [gains]);

  // Only animate while the equalizer is on screen and nothing covers the page.
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef);
  const overlay = useOverlayOpen();
  const live = inView && !overlay;

  // Spectrum analyzer: bars follow the mix, with a bit of life and falling peak caps.
  useEffect(() => {
    if (!live) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const peaks = new Array(BAR_COUNT).fill(0);
    let raf = 0;
    const tick = (now: number) => {
      const t = now / 1000;
      const g = gainsRef.current;
      for (let i = 0; i < BAR_COUNT; i++) {
        let level = 0;
        for (let b = 0; b < BANDS.length; b++) {
          const d = i - CENTERS[b];
          level += (g[b] / 100 + kickRef.current[b]) * Math.exp(-(d * d) / 14);
        }
        const life = reduce ? 0.85 : 0.55 + 0.45 * Math.abs(Math.sin(t * (2.1 + (i % 7) * 0.37) + i * 1.7));
        const h = Math.min(1, level * life);
        peaks[i] = Math.max(h, peaks[i] - 0.012);
        const bar = barsRef.current[i];
        const cap = peaksRef.current[i];
        if (bar) bar.style.transform = `scaleY(${Math.max(0.03, h)})`;
        if (cap) cap.style.bottom = `${peaks[i] * 100}%`;
      }
      kickRef.current = kickRef.current.map((k) => k * 0.9);
      if (!reduce) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [live]);

  const setBand = useCallback((band: number, v: number) => {
    cancelAnimationFrame(tweenRef.current);
    setActiveBand(band);
    setPreset(null);
    setGains((prev) => {
      if (prev[band] === v) return prev;
      const next = [...prev];
      next[band] = v;
      return next;
    });
    kickRef.current[band] = 0.35;
    const now = performance.now();
    if (now - lastNote.current > 70) {
      lastNote.current = now;
      retroAudio.playNote(pitch(band, v), v / 100, 0.16);
    }
  }, []);

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    setPreset(p.id);
    setActiveBand(p.gains.indexOf(Math.max(...p.gains)));
    cancelAnimationFrame(tweenRef.current);
    const from = [...gainsRef.current];
    let start = -1;
    const step = (now: number) => {
      if (start < 0) start = now;
      const k = Math.min(1, (now - start) / 450);
      const e = 1 - Math.pow(1 - k, 3);
      setGains(from.map((f, i) => clamp(f + (p.gains[i] - f) * e)));
      if (k < 1) tweenRef.current = requestAnimationFrame(step);
    };
    tweenRef.current = requestAnimationFrame(step);
    // little arpeggio, loudest bands loudest
    p.gains.forEach((g, i) => setTimeout(() => retroAudio.playNote(pitch(i, g), g / 100, 0.22), i * 70));
    kickRef.current = p.gains.map((g) => g / 200);
  };

  // Highlight a band without touching the mix (from its heading or a skill).
  const focusBand = (bi: number) => {
    retroAudio.playNote(pitch(bi, gainsRef.current[bi]), 0.4, 0.12);
    kickRef.current[bi] = 0.35;
    setActiveBand(bi);
    setPreset(null);
  };
  const pickSkill = (bi: number, name: string) => {
    focusBand(bi);
    setPicked((p) => (p === name ? null : name));
  };

  const band = BANDS[activeBand];
  const activePreset = PRESETS.find((p) => p.id === preset);

  const picks = BANDS.flatMap((b) => b.skills).find((x) => x.name === picked);

  return (
    <div ref={rootRef}>
    <Y2KWindow title="equalizer.wsz" icon="🎚️" accent="#9b6bff" bodyClassName="p-0">
      {/* laptops: mixer on the left, every skill on the right (scrolls inside), so the whole thing fits one screen */}
      <div
        className="p-4 lg:p-5 grid gap-4 lg:gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]"
        style={{ background: 'linear-gradient(180deg, #2b1530 0%, #1a0f1f 100%)' }}
      >
        <div className="space-y-4 min-w-0">
          {/* analyzer + readout */}
          <div className="y2k-lcd rounded-md p-3" style={{ '--accent': '#ff8fd8' } as React.CSSProperties}>
            <div className="relative h-16 sm:h-20 lg:h-16 flex items-end gap-[3px]" aria-hidden>
              {Array.from({ length: BAR_COUNT }).map((_, i) => (
                <div key={i} className="relative flex-1 h-full">
                  <span
                    ref={(el) => {
                      barsRef.current[i] = el;
                    }}
                    className="absolute inset-0 origin-bottom"
                    style={{ background: 'linear-gradient(0deg, #ff2e93 0%, #ff8fd8 55%, #7fe3ff 100%)', transform: 'scaleY(0.05)' }}
                  />
                  <span
                    ref={(el) => {
                      peaksRef.current[i] = el;
                    }}
                    className="absolute inset-x-0 h-[3px] bg-white/90"
                    style={{ bottom: 0 }}
                  />
                </div>
              ))}
            </div>
            <p className="font-pixel text-lg mt-2 min-h-[2.5rem] leading-tight" aria-live="polite">
              {activePreset ? (
                <>
                  <span className="opacity-70">PRESET ▸ {activePreset.label.replace('★ ', '').toUpperCase()} · </span>
                  {activePreset.blurb}
                </>
              ) : (
                <>
                  <span className="opacity-70">
                    {band.freq} ▸ {band.label.toUpperCase()} {gains[activeBand]}% ·{' '}
                  </span>
                  {band.skills.length} skills, used across {BAND_PROJECTS[activeBand].length}/{PROJECTS_DATA.length} projects
                </>
              )}
            </p>
          </div>

          {/* presets */}
          <div className="flex lg:flex-wrap gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1" role="group" aria-label="Presets">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={preset === p.id}
                onClick={() => applyPreset(p)}
                className={`y2k-gloss shrink-0 rounded-full px-3 py-1 font-pixel text-lg leading-none ${preset === p.id ? '' : 'y2k-gloss-silver'}`}
                style={preset === p.id ? ({ '--btn': '#ff2e93' } as React.CSSProperties) : undefined}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* sliders */}
          <div className={narrow ? 'space-y-1' : 'grid grid-cols-5 gap-4'}>
            {BANDS.map((_, i) => (
              <Slider key={i} band={i} value={gains[i]} active={i === activeBand} horizontal={narrow} onChange={setBand} />
            ))}
          </div>
        </div>

        {/* every skill, always readable. Tap one to see where she used it. */}
        <div className="relative min-w-0 min-h-[12rem]">
          <div className="lg:absolute lg:inset-0 rounded-lg border border-white/10 bg-black/30 flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto y2k-scroll p-3 space-y-3">
              {BANDS.map((b, bi) => {
                const on = bi === activeBand;
                return (
                  <div key={b.label}>
                    <button
                      type="button"
                      onClick={() => focusBand(bi)}
                      className={`font-pixel text-lg leading-none mb-1.5 ${on ? 'text-[#ff8fd8]' : 'text-white/55 hover:text-white'}`}
                    >
                      {on ? '▶' : '·'} {b.label}
                    </button>
                    <div className="flex flex-wrap gap-1.5">
                      {b.skills.map((x) => {
                        const n = x.used?.length ?? 0;
                        const sel = picked === x.name;
                        const cls = `font-pixel text-base sm:text-lg leading-none px-2 py-1 rounded-md border transition-colors duration-300 ${
                          sel
                            ? 'bg-white border-white text-[#c2006f]'
                            : on
                              ? 'bg-[#ff2e93]/25 border-[#ff8fd8] text-white'
                              : 'bg-white/[0.04] border-white/15 text-white/75'
                        }`;
                        if (!n && !x.note) {
                          return (
                            <span key={x.name} className={cls}>
                              {x.name}
                            </span>
                          );
                        }
                        return (
                          <button
                            key={x.name}
                            type="button"
                            aria-expanded={sel}
                            onClick={() => pickSkill(bi, x.name)}
                            className={`${cls} hover:border-[#ff8fd8]`}
                          >
                            {x.name}
                            <sup className={`ml-0.5 ${sel ? 'text-[#c2006f]' : 'text-[#ff8fd8]'}`}>{n || '✦'}</sup>
                          </button>
                        );
                      })}
                    </div>
                    {picks && b.skills.includes(picks) && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 font-pixel text-base sm:text-lg leading-tight animate-pop-in">
                        <span className="text-white/60">{picks.name} →</span>
                        {picks.used?.map((id) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              retroAudio.playCassetteInsert();
                              window.dispatchEvent(new CustomEvent(PLAY_PROJECT_EVENT, { detail: id }));
                            }}
                            className="px-2 py-0.5 rounded-full border border-[#7fe3ff] text-[#7fe3ff] hover:bg-[#7fe3ff] hover:text-[#1a0f1f]"
                          >
                            💿 {shortTitle(id)} ▶
                          </button>
                        ))}
                        {picks.note && <span className="text-[#7fe3ff]">{picks.note}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="shrink-0 px-3 py-1.5 border-t border-white/10 font-pixel text-base leading-tight text-white/40">
              tap a skill with a <span className="text-[#ff8fd8]">number</span> to see the projects that use it
            </p>
          </div>
        </div>
      </div>
    </Y2KWindow>
    </div>
  );
}
