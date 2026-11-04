'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { setOverlayOpen } from './visibility';

/**
 * The pink handheld console the mini games run in (BerryGame, DiscStacker):
 * full-screen overlay, page scroll locked, background animation paused.
 */

export const SCREEN_W = 160;
export const SCREEN_H = 144;

export function Handheld({
  brand,
  label,
  active,
  hint,
  onClose,
  screenProps,
  children,
}: {
  brand: string;
  label: string;
  /** power LED on (a round is in progress) */
  active: boolean;
  hint: string;
  onClose: () => void;
  /** pointer handlers etc. for the touch area (the screen) */
  screenProps?: React.HTMLAttributes<HTMLDivElement>;
  children: React.ReactNode;
}) {
  useEffect(() => {
    setOverlayOpen(true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      setOverlayOpen(false);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-[#3a1530]/70 backdrop-blur-sm animate-pop-in"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[380px] rounded-[28px] rounded-br-[64px] p-4 pb-6 border-[3px] border-ink bg-[linear-gradient(160deg,#ffd0e4,#ff8fbf)] shadow-[6px_8px_0_#1a0f1f]">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="font-pixel text-lg text-[#7a0044] tracking-widest">{brand}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close game"
            className="font-pixel text-lg leading-none px-2 py-0.5 rounded-full border-2 border-ink bg-white shadow-[2px_2px_0_#1a0f1f] active:translate-y-0.5 active:shadow-none"
          >
            ✕
          </button>
        </div>

        {/* screen bezel */}
        <div className="rounded-xl rounded-br-3xl bg-[#5a2a48] p-3 pt-2 border-2 border-ink">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className={`w-2 h-2 rounded-full ${active ? 'bg-[#ff2e6e] shadow-[0_0_6px_#ff2e6e]' : 'bg-black/40'}`} />
            <span className="font-pixel text-sm text-white/60">BATTERY</span>
          </div>
          <div
            {...screenProps}
            className="relative w-full overflow-hidden rounded-sm touch-none select-none"
            style={{ aspectRatio: `${SCREEN_W} / ${SCREEN_H}` }}
          >
            {children}
          </div>
        </div>

        {/* decorative controls (the screen itself is the touch area) */}
        <div className="flex items-center justify-between mt-4 px-2" aria-hidden>
          <div className="relative w-16 h-16">
            <span className="absolute left-1/2 -translate-x-1/2 top-0 w-5 h-16 rounded bg-[#3a1530]" />
            <span className="absolute top-1/2 -translate-y-1/2 left-0 w-16 h-5 rounded bg-[#3a1530]" />
          </div>
          <div className="flex gap-3 -rotate-[20deg]">
            <span className="w-9 h-9 rounded-full bg-[#ff2e6e] border-2 border-ink shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.25)]" />
            <span className="w-9 h-9 rounded-full bg-[#ff2e6e] border-2 border-ink shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.25)] -translate-y-3" />
          </div>
        </div>
        <p className="mt-3 text-center font-pixel text-base text-[#7a0044]/70">{hint}</p>
      </div>
    </div>,
    document.body,
  );
}

/** Title / game-over card shown over the screen between rounds. */
export function GameCard({
  title,
  children,
  best,
  again,
  onStart,
}: {
  title: string;
  children: React.ReactNode;
  best: number;
  again: boolean;
  onStart: () => void;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[#ffe1ef]/80 text-center px-4">
      <p className="font-bubble text-2xl text-[#c2185b] leading-none">{title}</p>
      {children}
      <p className="font-pixel text-base text-[#7a0044]/70">best: {best}</p>
      <button
        type="button"
        onClick={onStart}
        className="mt-2 font-pixel text-xl leading-none px-4 py-1.5 rounded-full text-white bg-[#ff2e6e] border-2 border-ink shadow-[2px_2px_0_#1a0f1f] active:translate-y-0.5 active:shadow-none animate-blink [animation-duration:1.4s]"
      >
        {again ? '↻ again' : '▶ press start'}
      </button>
    </div>
  );
}

/** Best score in localStorage (wrapped: storage can be blocked). */
export function readBest(key: string) {
  try {
    return Number(localStorage.getItem(key)) || 0;
  } catch {
    return 0;
  }
}
export function saveBest(key: string, score: number) {
  const prev = readBest(key);
  if (score > prev) {
    try {
      localStorage.setItem(key, String(score));
    } catch {
      /* storage blocked */
    }
  }
  return { best: Math.max(prev, score), isNew: score > prev && score > 0 };
}
