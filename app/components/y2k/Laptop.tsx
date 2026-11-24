'use client';

import React from 'react';
import { GemSwirl } from './Rhinestones';

/**
 * Sreeja's laptop, in CSS 3D: a rose-silver lid with rhinestone swirls and her monogram,
 * hinged at the back of a base with a real (clickable) keyboard and a trackpad. Closed,
 * it floats at a tilt; open, it zooms in and settles facing you, showing `screen`.
 * Keys send their character to `onKey`; `lit` lights up a key (e.g. while typing).
 */

const W = 700;
const D = 440;

type K = { k: string; label?: string; w?: number };
const row = (s: string) => [...s].map((c) => ({ k: c }));
const ROWS: K[][] = [
  Array.from({ length: 15 }, (_, i) => ({ k: `f${i}`, label: '' })),
  [...row('`1234567890-='), { k: 'Backspace', label: '⌫', w: 1.6 }],
  [{ k: 'Tab', label: '⇥', w: 1.4 }, ...row('qwertyuiop[]'), { k: '\\', w: 1.1 }],
  [{ k: 'Caps', label: '⇪', w: 1.7 }, ...row("asdfghjkl;'"), { k: 'Enter', label: '⏎', w: 1.9 }],
  [{ k: 'Shift', label: '⇧', w: 2.2 }, ...row('zxcvbnm,./'), { k: 'Shift', label: '⇧', w: 2.2 }],
  [
    { k: 'Fn', label: 'fn' },
    { k: 'Ctrl', label: 'ctrl' },
    { k: 'Alt', label: 'alt' },
    { k: ' ', label: '', w: 6 },
    { k: 'Alt', label: 'alt' },
    { k: 'ArrowLeft', label: '←' },
    { k: 'ArrowRight', label: '→' },
  ],
];

export function Laptop({
  open,
  onToggle,
  screen,
  onKey,
  lit,
  lidTop,
}: {
  open: boolean;
  onToggle: () => void;
  screen: React.ReactNode;
  onKey?: (k: string) => void;
  lit?: string | null;
  /** something standing on the closed lid (her birthday cake) */
  lidTop?: React.ReactNode;
}) {
  return (
    <div className="lp-scene" style={{ '--w': `${W}px`, '--d': `${D}px` } as React.CSSProperties}>
      <div className="lp-float">
        <div className={`lp ${open ? 'is-open' : ''}`}>
          {/* the base: a keyboard you can actually press, and the trackpad */}
          <div className="lp-deck">
            <div className="lp-keys">
              {ROWS.map((r, ri) => (
                <div key={ri} className="lp-key-row">
                  {r.map((key, ki) => {
                    const label = key.label ?? key.k;
                    const isLit = lit != null && lit.toLowerCase() === key.k.toLowerCase();
                    return (
                      <button
                        key={ki}
                        type="button"
                        tabIndex={-1}
                        aria-label={label || key.k}
                        disabled={!open || ri === 0}
                        onClick={() => onKey?.(key.k)}
                        className={`lp-key ${ri === 0 ? 'is-fn' : ''} ${isLit ? 'is-lit' : ''}`}
                        style={{ flex: key.w ?? 1 }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <span className="lp-pad" aria-hidden />
            <span className="lp-front" aria-hidden />
          </div>

          {/* the lid, hinged along the back edge of the deck */}
          <div className="lp-lid">
            <button type="button" className="lp-lid-out" onClick={onToggle} tabIndex={open ? -1 : 0} aria-label="Open the laptop to read about me">
              <GemSwirl className="lp-swirl is-tr" />
              <GemSwirl className="lp-swirl is-bl" />
              <span className="lp-logo" aria-hidden>
                sd
              </span>
            </button>
            {lidTop && <div className="lp-lid-top">{lidTop}</div>}
            <div className="lp-lid-in">
              <span className="lp-cam" aria-hidden />
              <div className="lp-screen">{screen}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
