'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Y2KWindow } from './Y2KWindow';
import { useInView, useOverlayOpen } from './visibility';
import { retroAudio } from '../../utils/retroAudio';

/**
 * Flip-book of Sreeja's expressions, in two looks:
 *  - pixel (default): "Game Boy Camera" dithered frames made by
 *    scripts/make_pixel_avatars.py, swapped with a chunky CRT-refresh wipe
 *  - photo: the original cutouts
 *
 * The raised-eyebrows frame is not in the loop: it shows while someone drags
 * the window (desktop) or presses and holds the picture (touch).
 */

const FRAMES = [
  { src: '/images/sreeja/sreeja_think_left_cutout.webp', pixel: '/images/sreeja/pixel/hmm.png', name: 'hmm', say: "hi, i'm sreeja ✦ hmm…" },
  { src: '/images/sreeja/sreeja_think_right_cutout.webp', pixel: '/images/sreeja/pixel/idea.png', name: 'idea', say: 'what should i build next?' },
  { src: '/images/sreeja/sreeja_hello_cutout.png', pixel: '/images/sreeja/pixel/peace.png', name: 'peace', say: '✌ ok, got it!' },
  { src: '/images/sreeja/sreeja_showing_right_cutout.webp', pixel: '/images/sreeja/pixel/tada.png', name: 'tada', say: 'ta-da! my projects are below ↓' },
  { src: '/images/sreeja/sreeja_surprised_cutout.webp', pixel: '/images/sreeja/pixel/wait.png', name: 'wait', say: 'where are you taking me?!' },
];
const GRABBED_FRAME = FRAMES.length - 1;
const SEQ = FRAMES.length - 1; // frames in the auto loop
const HOLD_MS = 2400;
const LONG_PRESS_MS = 420;
const PIXEL_ASPECT = 144 / 130; // matches make_pixel_avatars.py output
const SCREEN_BG =
  'repeating-linear-gradient(0deg, rgba(255,46,147,0.06) 0 1px, transparent 1px 4px), linear-gradient(180deg, #fffafd, #ffe1f1)';

type View = 'pixel' | 'photo';

/* ── Water-break easter egg ──────────────────────────────────────────
   Once per visit, after a few minutes of browsing (and only when the
   portrait is on screen), a pastel-pink tumbler rises to Sreeja's lips on
   the "hmm" frame. Add ?water=now to the URL to see it after 3 seconds. */
const WATER_AFTER_MS = 150_000;
const WATER_SHOW_MS = 6500;
const WATER_KEY = 'water_break_done';
const WATER_SAY = "psst… you've been here a while. water break! 💧";

/** Pixel-art Stanley-style tumbler in the portrait's 144×130 pixel space, straw at the "hmm" frame's lips. */
function WaterBottle({ animate, box }: { animate: boolean; box: { top: number; left: number; width: number; height: number } }) {
  return (
    <div
      className={`absolute z-20 pointer-events-none ${animate ? 'animate-water-sip' : ''}`}
      style={{ top: box.top, left: box.left, width: box.width, height: box.height }}
      aria-hidden
    >
      {/* overflow visible: the tumbler pokes out past the window frame for a bit of 3D */}
      <svg
        viewBox="0 0 144 130"
        className="w-full h-full overflow-visible"
        style={{ shapeRendering: 'crispEdges', filter: 'drop-shadow(4px 6px 0 rgba(26,15,31,0.35))' }}
      >
        <g transform="translate(37 88) rotate(10) scale(1.4)" stroke="#1a0f1f" strokeWidth="1.2" strokeLinejoin="round">
          {/* straw */}
          <path d="M14 1 L21 -13" stroke="#1a0f1f" strokeWidth="4" strokeLinecap="round" />
          <path d="M14 1 L21 -13" stroke="#ffe1f1" strokeWidth="2" strokeLinecap="round" />
          {/* handle */}
          <path d="M3 10 C-9 10, -9 34, 3 34" fill="none" stroke="#1a0f1f" strokeWidth="5" />
          <path d="M3 10 C-9 10, -9 34, 3 34" fill="none" stroke="#ff8fd8" strokeWidth="2.6" />
          {/* body */}
          <path d="M1 6 L23 6 L20 48 L4 48 Z" fill="#ff8fd8" />
          <path d="M5 8 L8 8 L7 44 L5.5 44 Z" fill="#ffe1f1" stroke="none" />
          <path d="M18.5 8 L21.5 8 L19 44 L17 44 Z" fill="#ff5fb0" stroke="none" />
          <rect x="3.5" y="42" width="17" height="6" fill="#ff5fb0" />
          {/* lid */}
          <rect x="0" y="1" width="24" height="5.5" rx="1.5" fill="#ffd6ee" />
          <rect x="11" y="-0.5" width="6" height="2.5" fill="#ff8fd8" />
        </g>
      </svg>
      <span className="absolute left-[56%] top-[44%] font-pixel text-base sm:text-lg text-hotpink bg-white/90 rounded px-1.5 border-2 border-ink shadow-[2px_2px_0_#1a0f1f] animate-pop-in [animation-delay:0.9s]">
        glug glug 💧
      </span>
    </div>
  );
}

export function Portrait() {
  const [frames, setFrames] = useState({ cur: 0, prev: 0, resume: 0 });
  const [view, setView] = useState<View>('pixel');
  const [grabbed, setGrabbed] = useState(false);
  const [paused, setPaused] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef);
  const overlay = useOverlayOpen();
  const longPressed = useRef(false);
  const [waterDue, setWaterDue] = useState(false);
  const [water, setWater] = useState<null | { animate: boolean; box: { top: number; left: number; width: number; height: number } }>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const measure = () => {
    const a = rootRef.current?.getBoundingClientRect();
    const w = wrapRef.current?.getBoundingClientRect();
    return a && w ? { top: a.top - w.top, left: a.left - w.left, width: a.width, height: a.height } : { top: 0, left: 0, width: 0, height: 0 };
  };
  const frame = water ? 0 : frames.cur; // the water break plays on the "hmm" frame
  const f = FRAMES[frame];

  // After a grab, carry on from where the loop was.
  const advance = useCallback(
    () =>
      setFrames((p) => {
        const from = p.cur === GRABBED_FRAME ? p.resume : p.cur;
        return { prev: p.cur, cur: (from + 1) % SEQ, resume: p.resume };
      }),
    [],
  );

  const grab = () => {
    setGrabbed(true);
    setFrames((p) => (p.cur === GRABBED_FRAME ? p : { prev: p.cur, cur: GRABBED_FRAME, resume: p.cur }));
  };

  useEffect(() => {
    if (paused || grabbed || water || !inView || overlay) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setTimeout(advance, HOLD_MS);
    return () => clearTimeout(id);
  }, [frame, paused, grabbed, water, inView, overlay, advance]);

  // Count browsing time (only while the tab is visible), once per visit.
  useEffect(() => {
    let done = false;
    try {
      done = sessionStorage.getItem(WATER_KEY) === '1';
    } catch {
      /* storage blocked: still fine, just might repeat */
    }
    if (done) return;
    const target = new URLSearchParams(window.location.search).get('water') === 'now' ? 3000 : WATER_AFTER_MS;
    let elapsed = 0;
    const id = setInterval(() => {
      if (document.hidden) return;
      elapsed += 1000;
      if (elapsed >= target) {
        clearInterval(id);
        setWaterDue(true);
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Fire it when the portrait is actually visible and nothing else is going on.
  useEffect(() => {
    if (!waterDue || water || !inView || overlay || grabbed || view !== 'pixel') return;
    try {
      sessionStorage.setItem(WATER_KEY, '1');
    } catch {
      /* ignore */
    }
    const start = setTimeout(() => {
      setWaterDue(false);
      setWater({ animate: !window.matchMedia('(prefers-reduced-motion: reduce)').matches, box: measure() });
      retroAudio.playSmsChime();
    }, 0);
    return () => clearTimeout(start);
  }, [waterDue, water, inView, overlay, grabbed, view]);

  useEffect(() => {
    if (!water) return;
    const id = setTimeout(() => setWater(null), WATER_SHOW_MS);
    return () => clearTimeout(id);
  }, [water]);

  const next = () => {
    retroAudio.playHover();
    advance();
  };

  // Touch: press-and-hold = "grab".
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    longPressed.current = false;
    pressTimer.current = setTimeout(() => {
      longPressed.current = true;
      grab();
    }, LONG_PRESS_MS);
  };
  const endPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = null;
    if (longPressed.current) setGrabbed(false);
  };

  return (
    <div ref={wrapRef} className="relative">
    <Y2KWindow
      title={view === 'pixel' ? 'sreeja.bmp' : 'sreeja.jpg'}
      icon={view === 'pixel' ? '👾' : '🖼️'}
      draggable
      bodyClassName="p-0"
      onDragStart={grab}
      onDragEnd={() => setGrabbed(false)}
    >
      <div
        ref={rootRef}
        className="relative cursor-pointer select-none [-webkit-touch-callout:none]"
        style={{ aspectRatio: PIXEL_ASPECT }}
        onClick={() => {
          if (longPressed.current) {
            longPressed.current = false;
            return;
          }
          next();
        }}
        onPointerDown={onPointerDown}
        onPointerUp={endPress}
        onPointerCancel={endPress}
        onPointerLeave={endPress}
        onContextMenu={(e) => e.preventDefault()}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        role="button"
        tabIndex={0}
        aria-label={`Sreeja: ${water ? WATER_SAY : f.say} Click for the next expression.`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            next();
          }
        }}
      >
        {view === 'pixel' ? (
          <div className="absolute inset-0 overflow-hidden" style={{ background: SCREEN_BG }}>
            {/* previous frame underneath while the new one wipes in… */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={FRAMES[frames.prev].pixel} alt="" draggable={false} className="absolute inset-0 w-full h-full [image-rendering:pixelated]" />
            {/* …and the new frame has an opaque backing, so the old one never shows through */}
            <div key={`px-${frame}`} className="absolute inset-0 animate-pixel-wipe" style={{ background: SCREEN_BG }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.pixel} alt="" draggable={false} className="w-full h-full [image-rendering:pixelated]" />
            </div>
            <span key={`bar-${frame}`} className="absolute inset-x-0 h-1.5 bg-white/80 mix-blend-screen animate-scan-bar" aria-hidden />
            <span className="hidden">
              {FRAMES.map((fr) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={fr.pixel} src={fr.pixel} alt="" />
              ))}
            </span>
          </div>
        ) : (
          <div className="absolute inset-0 y2k-gingham">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.src} alt="" draggable={false} className="w-full h-full object-cover object-[50%_35%]" />
          </div>
        )}

        <span
          key={`${frame}-${grabbed}-${Boolean(water)}`}
          className="absolute top-3 left-3 max-w-[48%] font-pixel text-base sm:text-lg leading-tight px-3 py-1.5 rounded-2xl rounded-bl-none bg-white border-2 border-ink shadow-[3px_3px_0_#1a0f1f] animate-pop-in"
        >
          {water ? WATER_SAY : f.say}
        </span>
      </div>

      <div className="font-pixel text-lg px-3 py-1 bg-white border-t-2 border-ink/20 flex items-center justify-between gap-2">
        <span className="truncate">
          {frame === GRABBED_FRAME ? '!!' : String(frame + 1).padStart(2, '0')}/{String(SEQ).padStart(2, '0')} · {f.name}.
          {view === 'pixel' ? 'bmp' : 'jpg'}
        </span>
        <span className="flex items-center gap-1" aria-hidden>
          {FRAMES.slice(0, SEQ).map((_, i) => (
            <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === frame ? 'bg-hotpink' : 'bg-ink/20'}`} />
          ))}
        </span>
        <button
          type="button"
          onClick={() => {
            retroAudio.playButtonClack();
            setView((v) => (v === 'pixel' ? 'photo' : 'pixel'));
          }}
          className="text-hotpink hover:underline shrink-0"
        >
          {view === 'pixel' ? '◐ photo' : '👾 pixel'}
        </button>
      </div>
    </Y2KWindow>
    {water && <WaterBottle animate={water.animate} box={water.box} />}
    </div>
  );
}
