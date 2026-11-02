'use client';

/**
 * The glowing butterfly from Sreeja's wallpaper (public/images/bg/global-bg.png),
 * cut out as public/images/bg/butterfly.png and used as a CSS mask so it can be
 * any colour. The same sprite drives the cursor + trail (StarTrail.tsx).
 * Flap keyframes live in app/y2k.css.
 */

import React from 'react';

export const BUTTERFLY_SPRITE = '/images/bg/butterfly.png';

export type ButterflyVariant = 'white' | 'magenta' | 'pink' | 'lilac';

export const BUTTERFLY_LOOKS: Record<ButterflyVariant, { color: string; glow: string; opacity: number }> = {
  white: { color: '#ffffff', glow: 'drop-shadow(0 0 2px #fff) drop-shadow(0 0 7px #ff4fc8) drop-shadow(0 0 14px #ff8fd8)', opacity: 1 },
  magenta: { color: '#ffc2ef', glow: 'drop-shadow(0 0 6px #ff3fd0) drop-shadow(0 0 18px #c800c8)', opacity: 0.95 },
  pink: { color: '#e46fb8', glow: 'none', opacity: 0.55 },
  lilac: { color: '#efe0ff', glow: 'drop-shadow(0 0 5px #fff) drop-shadow(0 0 12px #b98cff)', opacity: 0.95 },
};

export function Butterfly({
  size = 28,
  variant = 'white',
  flap = 0.32,
  className = '',
  style,
}: {
  size?: number;
  variant?: ButterflyVariant;
  /** seconds per half wing-beat */
  flap?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const look = BUTTERFLY_LOOKS[variant];
  return (
    <span
      aria-hidden
      className={`pointer-events-none inline-block ${className}`}
      style={{ width: size, height: size, filter: look.glow, opacity: look.opacity, ...style }}
    >
      <span
        className="block w-full h-full bfly-flap"
        style={{
          animationDuration: `${flap}s`,
          backgroundColor: look.color,
          WebkitMaskImage: `url(${BUTTERFLY_SPRITE})`,
          maskImage: `url(${BUTTERFLY_SPRITE})`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
      />
    </span>
  );
}
