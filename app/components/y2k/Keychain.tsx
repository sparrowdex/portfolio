'use client';

import React, { useState } from 'react';
import { retroAudio } from '../../utils/retroAudio';

/**
 * Sreeja's favourite keychain, drawn from photos of the real thing:
 * gold split ring, pink braided loop with a gold end cap, gold jingle bell,
 * gold lobster clasp + chain holding the pink knitted bear (one gold button
 * eye, "ETERNAL LOVE" satin bow), and her pink pebble lip-tint case on a
 * silver chain. Swings gently; click it to jingle the bell.
 */
export function Keychain({ className = '', size = 84 }: { className?: string; size?: number }) {
  const [jingle, setJingle] = useState(0);

  return (
    <button
      type="button"
      aria-label="Sreeja's keychain charm. Click to jingle the bell."
      title="jingle jingle ✦"
      onClick={(e) => {
        e.stopPropagation();
        retroAudio.playBell();
        setJingle((j) => j + 1);
      }}
      className={`block origin-top ${className}`}
      style={{ width: size, height: size * 1.7 }}
    >
      <span key={jingle} className={`block w-full h-full origin-top ${jingle ? 'animate-charm-jingle' : 'animate-swing'}`}>
        <svg viewBox="0 0 100 170" className="w-full h-full overflow-visible drop-shadow-[2px_3px_0_rgba(122,0,68,0.3)]" aria-hidden>
          <defs>
            <linearGradient id="kc-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff2b8" />
              <stop offset="0.45" stopColor="#e2b450" />
              <stop offset="1" stopColor="#9c6e1c" />
            </linearGradient>
            <linearGradient id="kc-cap" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#a8792a" />
              <stop offset="0.35" stopColor="#fff0b3" />
              <stop offset="0.7" stopColor="#d9a744" />
              <stop offset="1" stopColor="#8f6420" />
            </linearGradient>
            <radialGradient id="kc-bell" cx="0.32" cy="0.28" r="0.85">
              <stop offset="0" stopColor="#fffbe0" />
              <stop offset="0.35" stopColor="#efc762" />
              <stop offset="1" stopColor="#7a520c" />
            </radialGradient>
            <linearGradient id="kc-silver" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.5" stopColor="#c8c4cc" />
              <stop offset="1" stopColor="#8a8690" />
            </linearGradient>
            <radialGradient id="kc-tint" cx="0.4" cy="0.35" r="0.75">
              <stop offset="0" stopColor="#ffd3ea" stopOpacity="0.95" />
              <stop offset="0.55" stopColor="#ff6fb5" stopOpacity="0.85" />
              <stop offset="1" stopColor="#d6006f" stopOpacity="0.95" />
            </radialGradient>
            {/* braided leather: little chevrons */}
            <pattern id="kc-braid" width="6" height="6" patternUnits="userSpaceOnUse">
              <rect width="6" height="6" fill="#f2b6d0" />
              <path d="M0 0 L3 3 L6 0 M0 3 L3 6 L6 3" stroke="#d98fb3" strokeWidth="0.9" fill="none" />
            </pattern>
            {/* crochet knit texture for the bear */}
            <pattern id="kc-knit" width="2.6" height="2.6" patternUnits="userSpaceOnUse">
              <rect width="2.6" height="2.6" fill="#ee8fb6" />
              <circle cx="1.3" cy="1.3" r="0.85" fill="#f6adca" />
            </pattern>
          </defs>

          {/* gold split ring */}
          <circle cx="50" cy="15" r="11" fill="none" stroke="url(#kc-gold)" strokeWidth="2.6" />
          <circle cx="50" cy="15" r="9.4" fill="none" stroke="#fff6cc" strokeWidth="0.5" opacity="0.7" />

          {/* braided loop, joined into a gold cap that pins to the ring */}
          <path
            d="M34 40 C24 62, 14 100, 20 124 C24 138, 40 136, 41 120 C42 96, 41 66, 40 40"
            fill="none"
            stroke="#c98aa8"
            strokeWidth="9.5"
            strokeLinecap="round"
          />
          <path
            d="M34 40 C24 62, 14 100, 20 124 C24 138, 40 136, 41 120 C42 96, 41 66, 40 40"
            fill="none"
            stroke="url(#kc-braid)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <line x1="40" y1="24" x2="37" y2="30" stroke="url(#kc-gold)" strokeWidth="2.2" />
          <rect x="31" y="29" width="12" height="13" rx="2.5" fill="url(#kc-cap)" stroke="#8f6420" strokeWidth="0.5" />
          <rect x="31" y="31.5" width="12" height="1.2" fill="#fff6cc" opacity="0.6" />

          {/* gold jingle bell */}
          <ellipse cx="51" cy="28.5" rx="1.8" ry="2.6" fill="none" stroke="url(#kc-gold)" strokeWidth="1.1" />
          <circle cx="51" cy="37" r="6.8" fill="url(#kc-bell)" stroke="#8f6420" strokeWidth="0.4" />
          <path d="M44.6 37.6 h12.8" stroke="#6b4506" strokeWidth="0.9" />
          <path d="M51 37.6 v4.5" stroke="#6b4506" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="51" cy="42.4" r="1.2" fill="#4a3004" />

          {/* gold lobster clasp + chain + swivel holding the bear */}
          <path
            d="M60 22 c6 -2 10 3 9 9 c-1 5 -5 7 -8 6 l-1 -3 c2 0 4 -2 4 -4 c0 -3 -2 -5 -4 -4 z"
            fill="url(#kc-gold)"
            stroke="#8f6420"
            strokeWidth="0.4"
          />
          <rect x="59.5" y="36" width="4" height="5" rx="1" fill="url(#kc-gold)" />
          {[44, 48.5, 53].map((y) => (
            <ellipse key={y} cx="62" cy={y} rx="1.5" ry="2.3" fill="none" stroke="url(#kc-gold)" strokeWidth="1" />
          ))}

          {/* pink knitted bear */}
          <g transform="translate(66 76)" stroke="#b9507f" strokeWidth="0.9">
            {/* ears */}
            <circle cx="-11" cy="-14" r="6.2" fill="url(#kc-knit)" />
            <circle cx="11" cy="-14" r="6.2" fill="url(#kc-knit)" />
            <circle cx="-11" cy="-14" r="3" fill="#e98fb4" />
            <circle cx="11" cy="-14" r="3" fill="#e98fb4" />
            {/* legs + body */}
            <rect x="-9" y="22" width="7" height="9" rx="3" fill="url(#kc-knit)" />
            <rect x="2" y="22" width="7" height="9" rx="3" fill="url(#kc-knit)" />
            <rect x="-11" y="8" width="22" height="18" rx="7" fill="url(#kc-knit)" />
            {/* arms */}
            <ellipse cx="-12" cy="15" rx="3" ry="5" fill="url(#kc-knit)" transform="rotate(15 -12 15)" />
            <ellipse cx="12" cy="15" rx="3" ry="5" fill="url(#kc-knit)" transform="rotate(-15 12 15)" />
            {/* head */}
            <ellipse cx="0" cy="-3" rx="14" ry="12.5" fill="url(#kc-knit)" />
            <ellipse cx="-4" cy="-8" rx="6" ry="3" fill="#ffffff" opacity="0.12" stroke="none" />
            {/* single gold button eye */}
            <circle cx="-3" cy="-1" r="2.6" fill="url(#kc-bell)" stroke="#6b4506" strokeWidth="0.5" />
            <circle cx="-3.8" cy="-1.8" r="0.8" fill="#fffbe0" />
            {/* satin ribbon with gold lettering */}
            <path d="M-13 7 Q0 12 13 7 L13 10 Q0 15 -13 10 Z" fill="#f48bb7" />
            <path d="M-1 10 C-12 2, -20 6, -16 12 C-13 15, -6 13, -1 10 Z" fill="#f79cc3" stroke="#e070a2" strokeWidth="0.5" />
            <path d="M1 10 C12 2, 20 6, 16 12 C13 15, 6 13, 1 10 Z" fill="#f79cc3" stroke="#e070a2" strokeWidth="0.5" />
            <path d="M-1 11 L-7 24 L-4 23 L-3 26 Z" fill="#f48bb7" />
            <path d="M1 11 L8 23 L5 23 L4 26 Z" fill="#f48bb7" />
            <circle cx="0" cy="10.5" r="2.3" fill="#ef7fae" />
            <text x="-18" y="9.4" fontSize="2.9" fontWeight="700" fill="#b8892b" fontFamily="Arial, sans-serif" transform="rotate(-18 -14 9)">
              ETERNAL
            </text>
            <text x="9.5" y="9.6" fontSize="2.9" fontWeight="700" fill="#b8892b" fontFamily="Arial, sans-serif" transform="rotate(16 12 9)">
              LOVE
            </text>
          </g>

          {/* silver swivel clasp + chain for the lip tint */}
          <path d="M46 24 c-3 2 -4 7 -2 10 l3 0 c1 -3 1 -7 -1 -10 z" fill="url(#kc-silver)" stroke="#77737c" strokeWidth="0.4" />
          <rect x="44" y="34" width="3.6" height="6" rx="1" fill="url(#kc-silver)" />
          {[44.5, 49, 53.5, 58, 62.5, 67, 71.5, 76, 80.5, 85, 89.5, 94, 98.5, 103].map((y, i) => (
            <ellipse key={y} cx={46 - i * 0.05} cy={y} rx="1.3" ry="2.1" fill="none" stroke="url(#kc-silver)" strokeWidth="0.9" />
          ))}
          <circle cx="46" cy="108" r="2" fill="none" stroke="url(#kc-silver)" strokeWidth="1" />

          {/* pink pebble lip-tint case (translucent, darker rim) */}
          <g transform="translate(46 128)">
            <path
              d="M0 -18 C11 -18, 18 -8, 17 2 C16 12, 8 17, 0 17 C-8 17, -16 12, -17 2 C-18 -8, -11 -18, 0 -18 Z"
              fill="url(#kc-tint)"
              stroke="#b8005a"
              strokeWidth="2"
            />
            <path d="M0 -12 C7 -12, 11 -6, 11 1 C11 8, 6 11, 0 11 C-6 11, -11 8, -11 1 C-11 -6, -7 -12, 0 -12 Z" fill="#ffb8d9" opacity="0.55" />
            <path d="M-11 -9 C-13 -3, -13 4, -10 9" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.65" />
            <circle cx="8" cy="-10" r="1.6" fill="#ffffff" opacity="0.6" />
          </g>
        </svg>
      </span>
    </button>
  );
}
