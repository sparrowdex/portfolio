'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { retroAudio } from '../../utils/retroAudio';
import { Y2KWindow } from './Y2KWindow';
import { useInView, useOverlayOpen } from './visibility';

/**
 * Winamp-style skills equalizer you can actually play with:
 * drag sliders (they sing), pick presets, watch the analyzer react,
 * and turn a band up to light up more of its skills.
 */

const BANDS = [
  { freq: '60Hz', label: 'UI / Next.js', note: 261.63, skills: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS', 'Responsive UI', 'Design systems'] },
  { freq: '250Hz', label: 'WebGL / 3D', note: 329.63, skills: ['Three.js', 'React Three Fiber', 'GLSL shaders', 'Procedural meshes', 'Particle physics'] },
  { freq: '1kHz', label: 'Backend', note: 392.0, skills: ['Node.js', 'Express', 'PostgreSQL (Neon)', 'SQL', 'Prisma ORM', 'REST APIs', 'Webhooks', 'Python', 'FastAPI', 'Docker', 'Firebase', 'MySQL', 'Clerk auth', 'Postman'] },
  { freq: '4kHz', label: 'Creative Tech', note: 493.88, skills: ['WebGL', 'Mic-reactive motion (blow to move snow)', 'Web Audio API', 'HTML5 Canvas', 'p5.js', 'GSAP', 'Framer Motion', 'Canva design'] },
  { freq: '16kHz', label: 'CTO · Diecast', note: 587.33, skills: ['The Diecast Store', 'Installable PWA', 'Push notifications', 'Zero-trust payments', 'Logistics webhooks', 'Tech roadmap', 'Security posture'] },
];

const PRESETS: { id: string; label: string; gains: number[]; blurb: string }[] = [
  { id: 'sreeja', label: "★ sreeja's mix", gains: [98, 92, 90, 95, 88], blurb: 'the real levels. this is what she ships with.' },
  { id: 'frontend', label: 'frontend', gains: [100, 80, 40, 75, 30], blurb: 'pixel-perfect UI, buttery motion, React all day.' },
  { id: 'backend', label: 'backend', gains: [45, 20, 100, 35, 80], blurb: 'APIs, Postgres, webhooks and zero-trust payments.' },
  { id: 'creative', label: 'creative', gains: [70, 100, 30, 100, 20], blurb: 'WebGL, mic-reactive motion (blow on the screen!), canvas toys and Canva-made elements.' },
  { id: 'cto', label: 'cto mode', gains: [65, 40, 85, 45, 100], blurb: 'co-founder & CTO of The Diecast Store: a PWA with its own push notifications, zero-trust payments and live logistics.' },
  { id: 'flat', label: 'flat', gains: [50, 50, 50, 50, 50], blurb: 'reset. now push a slider ↑' },
];

const BAR_COUNT = 30;
const CENTERS = BANDS.map((_, i) => ((i + 0.5) / BANDS.length) * BAR_COUNT);

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
const pitch = (band: number, v: number) => BANDS[band].note * Math.pow(2, (v - 50) / 120);

function Slider({
  band,
  value,
  active,
  onChange,
}: {
  band: number;
  value: number;
  active: boolean;
  onChange: (band: number, v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const fromPointer = (clientY: number) => {
    const r = trackRef.current!.getBoundingClientRect();
    onChange(band, clamp((1 - (clientY - r.top) / r.height) * 100));
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={`${BANDS[band].label} level`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-valuetext={`${value}%`}
        className="relative h-36 sm:h-44 w-10 flex justify-center cursor-ns-resize touch-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff8fd8] rounded-full"
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          fromPointer(e.clientY);
        }}
        onPointerMove={(e) => dragging.current && fromPointer(e.clientY)}
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
        <div className="relative h-full w-3 rounded-full bg-black/60 border border-white/15">
          <div
            className="absolute bottom-0 inset-x-0 rounded-full"
            style={{
              height: `${value}%`,
              background: active ? 'linear-gradient(0deg, #ff2e93, #ff8fd8, #7fe3ff)' : 'linear-gradient(0deg, #6b3a63, #b58aad)',
            }}
          />
          {/* tick marks */}
          {[25, 50, 75].map((t) => (
            <span key={t} className="absolute -left-2 w-1.5 h-px bg-white/25" style={{ bottom: `${t}%` }} />
          ))}
        </div>
        <div
          className="y2k-gloss absolute left-1/2 -translate-x-1/2 w-10 h-5 rounded-full pointer-events-none"
          style={{ bottom: `calc(${value}% - 10px)`, '--btn': active ? '#ff2e93' : '#bfaebb' } as React.CSSProperties}
        />
      </div>
      <span className="font-pixel text-lg sm:text-xl leading-none text-white">{BANDS[band].freq}</span>
      <span className="font-pixel text-sm sm:text-base leading-none text-white/60 text-center">{BANDS[band].label}</span>
    </div>
  );
}

export function Equalizer() {
  const [gains, setGains] = useState<number[]>(PRESETS[0].gains);
  const [activeBand, setActiveBand] = useState(0);
  const [preset, setPreset] = useState<string | null>('sreeja');
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

  const band = BANDS[activeBand];
  const lit = Math.ceil((band.skills.length * gains[activeBand]) / 100);
  const activePreset = PRESETS.find((p) => p.id === preset);

  return (
    <div ref={rootRef}>
    <Y2KWindow title="equalizer.wsz" icon="🎚️" accent="#9b6bff" bodyClassName="p-0">
      <div className="p-4 sm:p-6 space-y-5" style={{ background: 'linear-gradient(180deg, #2b1530 0%, #1a0f1f 100%)' }}>
        {/* analyzer + readout */}
        <div className="y2k-lcd rounded-md p-3" style={{ '--accent': '#ff8fd8' } as React.CSSProperties}>
          <div className="relative h-20 sm:h-24 flex items-end gap-[3px]" aria-hidden>
            {Array.from({ length: BAR_COUNT }).map((_, i) => (
              <div key={i} className="relative flex-1 h-full">
                <span
                  ref={(el) => {
                    barsRef.current[i] = el;
                  }}
                  className="absolute inset-0 origin-bottom"
                  style={{
                    background: 'linear-gradient(0deg, #ff2e93 0%, #ff8fd8 55%, #7fe3ff 100%)',
                    transform: 'scaleY(0.05)',
                  }}
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
          <p className="font-pixel text-lg sm:text-xl mt-2 min-h-[2.6rem] leading-tight" aria-live="polite">
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
                {lit}/{band.skills.length} skills unlocked
              </>
            )}
          </p>
        </div>

        {/* presets */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1" role="group" aria-label="Presets">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={preset === p.id}
              onClick={() => applyPreset(p)}
              className={`y2k-gloss shrink-0 rounded-full px-3.5 py-1 font-pixel text-lg leading-none ${preset === p.id ? '' : 'y2k-gloss-silver'}`}
              style={preset === p.id ? ({ '--btn': '#ff2e93' } as React.CSSProperties) : undefined}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* sliders */}
        <div className="grid grid-cols-5 gap-1 sm:gap-6">
          {BANDS.map((_, i) => (
            <Slider key={i} band={i} value={gains[i]} active={i === activeBand} onChange={setBand} />
          ))}
        </div>

        {/* skills for the active band: turn it up to light more of them */}
        <div className="rounded-lg border border-white/10 bg-black/30 p-3">
          <p className="font-pixel text-lg text-white/60 mb-2">
            {band.label} · <span className="text-[#ff8fd8]">turn it up to unlock more ↑</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {band.skills.map((s, i) => {
              const on = i < lit;
              return (
                <span
                  key={s}
                  className={`font-pixel text-lg leading-none px-2.5 py-1 rounded-md border-2 transition-all duration-300 ${
                    on
                      ? 'bg-[#ff2e93] border-white text-white shadow-[0_0_12px_rgba(255,46,147,0.6)]'
                      : 'bg-transparent border-white/15 text-white/25'
                  }`}
                >
                  {on ? s : s.replace(/[^\s]/g, '▒')}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </Y2KWindow>
    </div>
  );
}
