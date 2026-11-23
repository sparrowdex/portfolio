'use client';

import React, { useState } from 'react';
import { setMusicBoxOpen } from '../../utils/skyAmbience';
import { playLidOpen, playLidClose } from '../../utils/musicBoxSounds';
import { Ballerina3D } from './Ballerina3D';

/**
 * A wooden music box, built in CSS 3D: a carved front, brass latch, a side crank, and a
 * lid hinged at the back. Tap it and the lid swings open with a creak, the little dancer
 * rises and twirls, the crank turns and the About music starts. Inside, a row of small
 * cards stand in the velvet; tap one to read it. Close the lid and the music winds down.
 */

export type BoxCard = { id: string; label: string; tint: string };

const W = 380; // width
const D = 230; // depth
const H = 140; // height

/** A carved scroll ornament for the front panel. */
const Carving = () => (
  <svg viewBox="0 0 200 70" className="mb-carving" aria-hidden>
    <g fill="none" stroke="rgba(60, 25, 10, 0.55)" strokeWidth="2.2" strokeLinecap="round">
      <path d="M100 35 C 84 12 58 14 52 30 C 47 44 64 50 70 40 C 74 33 66 28 62 33" />
      <path d="M100 35 C 116 12 142 14 148 30 C 153 44 136 50 130 40 C 126 33 134 28 138 33" />
      <path d="M100 35 C 88 52 66 58 40 52 C 26 49 18 40 22 32" />
      <path d="M100 35 C 112 52 134 58 160 52 C 174 49 182 40 178 32" />
      <circle cx="100" cy="35" r="5" />
    </g>
    <g fill="none" stroke="rgba(255, 220, 180, 0.18)" strokeWidth="1.2" strokeLinecap="round" transform="translate(-0.8 -0.8)">
      <path d="M100 35 C 84 12 58 14 52 30 C 47 44 64 50 70 40" />
      <path d="M100 35 C 116 12 142 14 148 30 C 153 44 136 50 130 40" />
    </g>
  </svg>
);

export function MusicBox({ cards, onPick, picked }: { cards: BoxCard[]; onPick: (id: string | null) => void; picked: string | null }) {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) playLidOpen();
    else {
      playLidClose();
      onPick(null);
    }
    setMusicBoxOpen(next);
  };

  return (
    <div className="mb-wrap">
      <div className="mb-scene" style={{ '--w': `${W}px`, '--d': `${D}px`, '--h': `${H}px` } as React.CSSProperties}>
        <div className={`mb-box ${open ? 'is-open' : ''}`}>
          {/* walls */}
          <div className="mb-face mb-front">
            <Carving />
            <span className="mb-latch" aria-hidden />
          </div>
          <div className="mb-face mb-back" />
          <div className="mb-face mb-left" />
          <div className="mb-face mb-right">
            <span className="mb-crank" aria-hidden>
              <span />
            </span>
          </div>

          {/* inside: velvet, the dancer's mirror, and the cards */}
          <div className="mb-floor">
            {/* the dancer, a real 3D figure (Ballerina3D), turning while the music plays */}
            <div className="mb-dancer">
              {open && <Ballerina3D spinning={open} />}
            </div>
            <div className="mb-cards">
              {cards.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  tabIndex={open ? 0 : -1}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPick(picked === c.id ? null : c.id);
                  }}
                  className={`mb-card ${picked === c.id ? 'is-picked' : ''}`}
                  style={{ '--tint': c.tint, '--i': i } as React.CSSProperties}
                >
                  <span className="nb-hand">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* the lid, hinged along the back edge */}
          <div className="mb-hinge">
            <div className="mb-lid">
              <div className="mb-lid-out">
                <span className="mb-lid-inlay" aria-hidden />
              </div>
              <div className="mb-lid-in">
                <span className="nb-hand">for whoever opens this ♡</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button type="button" onClick={toggle} className="mb-toggle nb-hand" aria-pressed={open}>
        {open ? 'close the music box' : 'open the music box ♪'}
      </button>
    </div>
  );
}
