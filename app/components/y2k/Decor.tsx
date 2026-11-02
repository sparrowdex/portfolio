'use client';

import React from 'react';

/** Four-point Y2K sparkle. */
export function Sparkle({
  size = 24,
  color = '#ff2e93',
  className = '',
  delay = 0,
  animate = true,
  style,
}: {
  size?: number;
  color?: string;
  className?: string;
  delay?: number;
  animate?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`${animate ? 'animate-twinkle' : ''} pointer-events-none ${className}`}
      style={{ animationDelay: `${delay}s`, ...style }}
    >
      <path
        d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z"
        fill={color}
        stroke="#fff"
        strokeWidth="0.8"
      />
    </svg>
  );
}

/** Horizontal scrolling ticker, duplicated once for a seamless loop. */
export function Marquee({ items, className = '' }: { items: string[]; className?: string }) {
  const row = items.join('   ✦   ');
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`} aria-label={items.join('. ')}>
      <div className="inline-flex animate-marquee" aria-hidden>
        <span className="pr-12">{row}   ✦   </span>
        <span className="pr-12">{row}   ✦   </span>
      </div>
    </div>
  );
}

/** Segmented XP-style progress bar that fills over `duration` ms. */
export function LoadingBar({ duration = 1800, segments = 14 }: { duration?: number; segments?: number }) {
  return (
    <div className="flex gap-[3px] p-[3px] rounded-sm border border-current/60 w-full">
      {Array.from({ length: segments }).map((_, i) => (
        <span
          key={i}
          className="h-2.5 flex-1 rounded-[1px] bg-current opacity-0"
          style={{ animation: `y2k-pop-in 0.1s ${(i / segments) * (duration / 1000)}s forwards` }}
        />
      ))}
    </div>
  );
}

/** Section heading: small pixel kicker plus chrome bubble title. */
export function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="text-center mb-10">
      <span className="font-pixel text-xl text-hotpink tracking-widest uppercase inline-flex items-center gap-2">
        <Sparkle size={14} animate={false} />
        {kicker}
        <Sparkle size={14} animate={false} />
      </span>
      <h2 className="font-bubble y2k-chrome-text text-4xl sm:text-6xl leading-tight mt-1">{title}</h2>
    </div>
  );
}
