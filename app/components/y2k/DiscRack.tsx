'use client';

import React from 'react';
import type { Project } from '../../types/project';
import { retroAudio } from '../../utils/retroAudio';

/** A holographic CD whose label ring is the project's colour. */
export function Disc({
  accent,
  label,
  spinning = false,
  className = 'w-24 sm:w-28',
}: {
  accent: string;
  label?: string;
  spinning?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative aspect-square rounded-full y2k-holo border-2 border-white shadow-[0_6px_14px_rgba(122,0,68,0.25)] ${
        spinning ? 'animate-disc-spin' : ''
      } ${className}`}
    >
      {/* coloured printed label */}
      <div
        className="absolute inset-[16%] rounded-full"
        style={{ background: `radial-gradient(circle, transparent 0 30%, ${accent} 31% 100%)`, opacity: 0.9 }}
      />
      {/* specular sweep */}
      <div className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.85)_0%,transparent_35%,transparent_65%,rgba(255,255,255,0.4)_100%)]" />
      {/* centre hole */}
      <div className="absolute inset-[40%] rounded-full bg-[#ffe1f1] border-2 border-white shadow-inner" />
      {label && (
        <span className="absolute top-[20%] inset-x-0 text-center font-pixel text-sm text-white [text-shadow:1px_1px_0_rgba(0,0,0,0.4)]">
          {label}
        </span>
      )}
    </div>
  );
}

export function DiscRack({
  projects,
  selectedId,
  isPlaying,
  onSelect,
}: {
  projects: Project[];
  selectedId: number | null;
  isPlaying: boolean;
  onSelect: (p: Project) => void;
}) {
  return (
    <ul className="flex gap-5 sm:gap-7 overflow-x-auto sm:overflow-visible sm:flex-wrap sm:justify-center snap-x snap-mandatory no-scrollbar px-1 py-3">
      {projects.map((p) => {
        const selected = p.id === selectedId;
        const accent = p.colors?.[0] ?? '#ff2e93';
        return (
          <li key={p.id} className="snap-start shrink-0">
            <button
              type="button"
              onClick={() => {
                retroAudio.playCassetteInsert();
                onSelect(p);
              }}
              onMouseEnter={() => retroAudio.playHover()}
              aria-pressed={selected}
              aria-label={`Play ${p.title}`}
              className="group flex flex-col items-center gap-2 w-28 sm:w-32 focus-visible:outline-none"
            >
              <div
                className={`transition-transform duration-300 group-hover:-translate-y-1.5 group-focus-visible:-translate-y-1.5 ${
                  selected ? '-translate-y-2 drop-shadow-[0_0_12px_var(--glow)]' : ''
                }`}
                style={{ '--glow': accent } as React.CSSProperties}
              >
                <Disc accent={accent} label={`0${p.id}`} spinning={selected && isPlaying} />
              </div>
              <span
                className={`font-pixel text-lg leading-[0.95] text-center px-1.5 rounded ${
                  selected ? 'bg-ink text-white' : 'text-ink group-hover:bg-white/70'
                }`}
              >
                {p.title}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
