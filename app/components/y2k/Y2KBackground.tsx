'use client';

import React from 'react';
import { Butterfly, type ButterflyVariant } from './Ornaments';

/** Sreeja's pink wallpaper. Drop the file here; the gradient underneath is the fallback. */
const WALLPAPER = '/images/bg/global-bg.webp';

// A few live, flapping butterflies drifting over the wallpaper's static ones.
// Fixed positions (not random) so server and client render identically.
const BUTTERFLIES: { top: string; left: string; size: number; v: ButterflyVariant; dur: number; delay: number; mobile?: boolean }[] = [
  { top: '22%', left: '24%', size: 30, v: 'white', dur: 11, delay: 0, mobile: true },
  { top: '38%', left: '82%', size: 34, v: 'magenta', dur: 12, delay: -6, mobile: true },
  { top: '70%', left: '14%', size: 28, v: 'white', dur: 13, delay: -3 },
  { top: '58%', left: '60%', size: 26, v: 'lilac', dur: 14, delay: -8 },
  { top: '84%', left: '88%', size: 30, v: 'white', dur: 10, delay: -1 },
];

export function Y2KBackground() {
  return (
    <div aria-hidden className="fixed inset-0 z-0 pointer-events-none overflow-hidden pause-on-overlay">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${WALLPAPER}'), linear-gradient(160deg, #ffd6ee 0%, #fbb8df 42%, #f7a6d5 68%, #ffc8e7 100%)`,
        }}
      />
      {BUTTERFLIES.map((b, i) => (
        <div
          key={i}
          className={`absolute bfly-drift ${b.mobile ? '' : 'hidden md:block'}`}
          style={
            {
              top: b.top,
              left: b.left,
              animationDuration: `${b.dur + 6}s`,
              animationDelay: `${b.delay}s`,
              '--dx': `${(i % 2 ? 1 : -1) * (90 + (i % 3) * 40)}px`,
              '--dy': `${(i % 3 ? -1 : 1) * (60 + (i % 4) * 20)}px`,
            } as React.CSSProperties
          }
        >
          <Butterfly size={b.size} variant={b.v} flap={0.26 + (i % 4) * 0.05} />
        </div>
      ))}
    </div>
  );
}
