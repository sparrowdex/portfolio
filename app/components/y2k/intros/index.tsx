'use client';

/**
 * Per-project retro intros. Each one plays inside the media player's LCD
 * screen for INTRO_DURATION ms, tinted by the project's accent colour.
 * Pure CSS/SVG. Keyframes live in app/y2k.css (prefixed `intro-`).
 * Under prefers-reduced-motion every animation jumps to its final frame.
 */

import React, { useEffect, useState } from 'react';
import { Sparkle } from '../Decor';

export const INTRO_DURATION = 2400;

type IntroProps = { accent: string };

const Caption = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <p
    className="absolute bottom-[6%] inset-x-0 text-center font-pixel text-xl sm:text-2xl uppercase tracking-widest animate-pop-in"
    style={{ animationDelay: `${delay}s` }}
  >
    {children}
  </p>
);

/* 1 · Photobooth: flash, then a photo strip prints out of the slot */
function PhotoboothIntro({ accent }: IntroProps) {
  const faces = ['^_^', ':P', '<3', ';)'];
  return (
    <div className="absolute inset-0 flex flex-col items-center pt-[5%]">
      <div className="w-[40%] h-2.5 rounded-full bg-black border-2 z-10" style={{ borderColor: accent }} />
      <div className="relative w-[24%] h-[72%] overflow-hidden -mt-1">
        <div
          className="absolute inset-x-0 top-0 bg-white p-[6%] flex flex-col gap-[5%] shadow-lg"
          style={{ animation: 'intro-print 1.9s cubic-bezier(.3,.8,.4,1) both' }}
        >
          {faces.map((f) => (
            <div
              key={f}
              className="aspect-[5/3] flex items-center justify-center font-pixel text-lg text-[#1a0f1f] [text-shadow:none]"
              style={{ background: `color-mix(in srgb, ${accent} 45%, #fff)` }}
            >
              {f}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 bg-white" style={{ animation: 'intro-flash 1.9s ease-out both' }} />
      <Caption delay={1.4}>say cheese!</Caption>
    </div>
  );
}

/* 2 · Inner Voice: a Tamagotchi-style pet wakes up with a mood heart */
function InnerVoiceIntro({ accent }: IntroProps) {
  // 8×8 pixel blob pet
  const PET = ['..XXXX..', '.XXXXXX.', 'XX.XX.XX', 'XXXXXXXX', 'XX.XX.XX', 'XXX..XXX', '.XXXXXX.', '.X....X.'];
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div
        className="relative w-[34%] aspect-[4/5] rounded-[50%/56%] flex flex-col items-center justify-center gap-[6%] border-[3px] border-white/70 animate-pop-in"
        style={{ background: `radial-gradient(circle at 35% 25%, #fff 0 8%, ${accent} 40%, color-mix(in srgb, ${accent} 55%, #000))` }}
      >
        <div className="w-[64%] aspect-square rounded-lg bg-[#cfe3c8] border-2 border-black/60 flex items-center justify-center relative">
          <svg viewBox="0 0 8 8" className="w-[60%]" style={{ animation: 'intro-bounce 0.6s ease-in-out infinite', shapeRendering: 'crispEdges' }}>
            {PET.flatMap((row, y) =>
              row.split('').map((c, x) => (c === 'X' ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#24301f" /> : null)),
            )}
          </svg>
          <span
            className="absolute left-1/2 top-0 text-2xl"
            style={{ color: '#ff2e93', animation: 'intro-heart 1.8s ease-out 0.3s both', textShadow: 'none' }}
          >
            ♥
          </span>
        </div>
        <div className="flex gap-[10%] w-[50%] justify-center">
          {[0, 1, 2].map((i) => (
            <span key={i} className="w-[22%] aspect-square rounded-full bg-white/80 border border-black/40" />
          ))}
        </div>
      </div>
      <Caption delay={1.2}>mood: heard ♥</Caption>
    </div>
  );
}

/* 3 · Diecast Store: F1 start lights, lights out, car blasts past */
function DiecastIntro({ accent }: IntroProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center pt-[10%] gap-[6%]">
      <div className="flex gap-[3%] w-[70%] justify-center p-[2%] rounded-md bg-black border-2 border-neutral-700">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="w-[14%] aspect-square rounded-full"
            style={{
              background: '#3b0a0a',
              animation: `intro-light-on 0.12s ${0.1 + i * 0.2}s forwards, intro-lights-out 0.05s 1.3s forwards`,
            }}
          />
        ))}
      </div>
      <p className="font-pixel text-2xl sm:text-3xl tracking-widest animate-pop-in" style={{ animationDelay: '1.3s' }}>
        LIGHTS OUT!
      </p>
      <div className="relative w-full h-[22%] overflow-hidden border-y-2 border-dashed border-white/30">
        <svg
          viewBox="0 0 64 20"
          className="absolute top-1/2 -translate-y-1/2 left-0 w-[22%]"
          style={{ animation: 'intro-car 0.9s 1.35s cubic-bezier(.6,0,.9,.6) both', shapeRendering: 'crispEdges' }}
        >
          {/* speed lines */}
          <rect x="0" y="7" width="10" height="1" fill="#fff" opacity="0.6" />
          <rect x="2" y="11" width="8" height="1" fill="#fff" opacity="0.6" />
          {/* body */}
          <rect x="12" y="8" width="44" height="6" fill={accent} />
          <rect x="26" y="4" width="14" height="4" fill={accent} />
          <rect x="29" y="5" width="7" height="3" fill="#7fe3ff" />
          <rect x="54" y="10" width="8" height="3" fill={accent} />
          <rect x="10" y="5" width="4" height="9" fill="#111" />
          <rect x="18" y="13" width="7" height="6" fill="#111" />
          <rect x="44" y="13" width="7" height="6" fill="#111" />
        </svg>
      </div>
      <Caption delay={1.8}>P1 · 1:21.034</Caption>
    </div>
  );
}

/* 4 · Armatrix: code rain resolves into the wordmark */
function ArmatrixIntro({ accent }: IntroProps) {
  const cols = 16;
  const glyphs = 'アイウ01エオカ10キクケ0コサシ1スセソ';
  return (
    <div className="absolute inset-0 bg-black/60">
      <div className="absolute inset-0 flex justify-between px-[2%] overflow-hidden">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="font-pixel text-base leading-[1.05] flex flex-col"
            style={{
              color: accent,
              opacity: 0.35 + ((i * 37) % 60) / 100,
              animation: `intro-rain ${0.9 + ((i * 13) % 7) / 10}s linear ${-((i * 0.17) % 1)}s infinite`,
            }}
          >
            {Array.from({ length: 14 }).map((__, j) => (
              <span key={j}>{glyphs[(i * 5 + j * 3) % glyphs.length]}</span>
            ))}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <p
          className="font-pixel text-4xl sm:text-5xl tracking-[0.2em] px-4 py-1 bg-black border-2"
          style={{ borderColor: accent, color: accent, animation: 'intro-glitch-in 2s steps(1) both' }}
        >
          ARMATRIX
        </p>
      </div>
    </div>
  );
}

/* 5 · Flowers for Beloved: glitter burst, pixel flower blooms */
function FlowersIntro({ accent }: IntroProps) {
  const burst = Array.from({ length: 10 }).map((_, i) => {
    const a = (i / 10) * Math.PI * 2;
    return { dx: `${Math.round(Math.cos(a) * 110)}px`, dy: `${Math.round(Math.sin(a) * 75)}px` };
  });
  return (
    <div className="absolute inset-0">
      <div className="absolute left-1/2 bottom-[18%] -translate-x-1/2 flex flex-col items-center">
        <svg viewBox="0 0 10 10" className="w-16 sm:w-20 origin-center" style={{ animation: 'intro-bloom 2s cubic-bezier(.2,1.4,.4,1) both', shapeRendering: 'crispEdges' }}>
          <rect x="4" y="0" width="2" height="3" fill={accent} />
          <rect x="0" y="4" width="3" height="2" fill={accent} />
          <rect x="7" y="4" width="3" height="2" fill={accent} />
          <rect x="4" y="7" width="2" height="3" fill={accent} />
          <rect x="1" y="1" width="2" height="2" fill={accent} opacity="0.8" />
          <rect x="7" y="1" width="2" height="2" fill={accent} opacity="0.8" />
          <rect x="1" y="7" width="2" height="2" fill={accent} opacity="0.8" />
          <rect x="7" y="7" width="2" height="2" fill={accent} opacity="0.8" />
          <rect x="3" y="3" width="4" height="4" fill="#ffe14a" />
        </svg>
        <div className="w-1.5 h-16 sm:h-20 bg-[#84cc16] origin-bottom" style={{ animation: 'intro-grow 2s ease-out both' }} />
      </div>
      {burst.map((b, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-[45%]"
          style={{ '--dx': b.dx, '--dy': b.dy, animation: `intro-burst 1.3s ease-out ${0.9 + (i % 3) * 0.08}s both` } as React.CSSProperties}
        >
          <Sparkle size={18} animate={false} color={i % 2 ? '#fff' : accent} />
        </span>
      ))}
      <Caption delay={1.5}>4 u ♥</Caption>
    </div>
  );
}

/* Pixel ramen bowl for the microwave turntable (18×13).
   C chopsticks, N noodles, W egg white, Y yolk, G spring onion, R broth, B bowl, b bowl shade. */
const FOOD_COLORS: Record<string, string> = {
  C: '#c98a4b',
  N: '#ffe08a',
  W: '#ffffff',
  Y: '#ffb000',
  G: '#5ee08a',
  R: '#e8743b',
  B: '#ff5fb0',
  b: '#c2006f',
};
const RAMEN = [
  '.............C..C.',
  '............C..C..',
  '...........C..C...',
  '..NNWWYN..C..C.N..',
  '.RNNWYYWNGNCGCNNR.',
  'BBBBBBBBBBBBBBBBBB',
  'BBWBBBBBBBBBBBBBbB',
  '.BWBBBBBBBBBBBBbB.',
  '.BBBBBBBBBBBBBBbB.',
  '..BBBBBBBBBBBBbB..',
  '...BBBBBBBBBbbB...',
  '.....bbbbbbbb.....',
  '....bbbbbbbbbb....',
];

function PixelFood({ className = '' }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${RAMEN[0].length} ${RAMEN.length}`} className={className} style={{ shapeRendering: 'crispEdges' }} aria-hidden>
      {RAMEN.flatMap((row, y) =>
        row.split('').map((c, x) => (FOOD_COLORS[c] ? <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={FOOD_COLORS[c]} /> : null)),
      )}
    </svg>
  );
}

/* 6 · SpiceVault: microwave counts down, then DING */
function SpiceVaultIntro({ accent }: IntroProps) {
  const [t, setT] = useState(3);
  useEffect(() => {
    const id = setInterval(() => setT((v) => (v > 0 ? v - 1 : 0)), 480);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-[74%] aspect-[16/9] rounded-lg bg-[#e8dde6] border-[3px] border-[#5a4656] flex p-[3%] gap-[3%] shadow-xl">
        <div
          className="relative flex-[3] rounded-md border-2 border-[#5a4656] flex items-end justify-center overflow-hidden pb-[6%]"
          style={{ background: `radial-gradient(circle, color-mix(in srgb, ${accent} 60%, #ffdd88) 0%, #2a1205 90%)` }}
        >
          {/* glass turntable */}
          <div className="absolute bottom-[4%] left-1/2 -translate-x-1/2 w-[62%] h-[16%] rounded-[50%] border-2 border-white/50 bg-white/10" />
          {/* steam */}
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="absolute bottom-[52%] w-1 h-3 rounded-full bg-white/70"
              style={{ left: `${40 + i * 10}%`, animation: `intro-steam 1.4s ease-out ${i * 0.35}s infinite` }}
            />
          ))}
          {/* pixel ramen, turning on its own axis on the turntable */}
          <div className="relative w-[46%] aspect-[18/13] [perspective:240px]">
            <div className="absolute inset-0" style={{ animation: 'intro-spin-y 2s linear infinite' }}>
              <PixelFood className="w-full h-full" />
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center gap-[8%]">
          <div className="w-full rounded bg-[#12060f] font-pixel text-xl text-center py-0.5" style={{ color: accent }}>
            0:0{t}
          </div>
          <div className="grid grid-cols-2 gap-1 w-full">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="h-2 rounded-sm bg-[#bfaebb]" />
            ))}
          </div>
        </div>
        <span
          className="absolute -top-5 -right-4 font-bubble text-2xl px-3 py-1 rounded-full bg-white text-hotpink border-2 border-hotpink [text-shadow:none] rotate-12"
          style={{ animation: 'intro-ding 2s ease-out both' }}
        >
          DING!
        </span>
      </div>
      <Caption delay={1.7}>recipe ready</Caption>
    </div>
  );
}

/* 7 · Timeless: snow globe shakes, then pixel snow settles */
function TimelessIntro({ accent }: IntroProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pb-[8%]">
      <div className="flex flex-col items-center origin-bottom" style={{ animation: 'intro-shake 2s ease-in-out both' }}>
        <div
          className="relative w-32 sm:w-40 aspect-square rounded-full overflow-hidden border-2 border-white/70"
          style={{ background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.45) 0 12%, rgba(127,227,255,0.18) 40%, rgba(20,30,60,0.6) 100%)' }}
        >
          {/* pixel tree */}
          <div className="absolute left-1/2 bottom-[14%] -translate-x-1/2 w-[38%] aspect-square bg-[#4ade80] [clip-path:polygon(50%_0,100%_100%,0_100%)]" />
          <div className="absolute left-1/2 bottom-[8%] -translate-x-1/2 w-[8%] h-[7%] bg-[#7a4a2a]" />
          <div className="absolute inset-x-0 bottom-0 h-[10%] bg-white/90" />
          {Array.from({ length: 16 }).map((_, i) => (
            <span
              key={i}
              className="absolute top-0 w-1.5 h-1.5 bg-white"
              style={{ left: `${8 + ((i * 23) % 84)}%`, animation: `intro-snow ${1.2 + (i % 4) * 0.2}s linear ${0.7 + (i % 6) * 0.15}s infinite both` }}
            />
          ))}
        </div>
        <div className="w-28 sm:w-32 h-6 -mt-1 rounded-b-xl [clip-path:polygon(10%_0,90%_0,100%_100%,0_100%)]" style={{ background: accent }} />
      </div>
      <Caption delay={1.4}>past · present · future</Caption>
    </div>
  );
}

export const INTROS: Record<number, React.ComponentType<IntroProps>> = {
  1: PhotoboothIntro,
  2: InnerVoiceIntro,
  3: DiecastIntro,
  4: ArmatrixIntro,
  5: FlowersIntro,
  6: SpiceVaultIntro,
  7: TimelessIntro,
};
