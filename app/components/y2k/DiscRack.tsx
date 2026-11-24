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

/**
 * The rack: one CD case per project with its logo as the cover art, so projects can be
 * told apart at a glance. The disc peeks out of the side and slides further out (and
 * spins) when it's the one playing.
 */
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
    <ul className="flex gap-6 sm:gap-8 xl:gap-4 overflow-x-auto sm:overflow-visible sm:flex-wrap xl:flex-nowrap sm:justify-center snap-x snap-mandatory no-scrollbar px-2 pt-3 pb-4">
      {projects.map((p) => {
        const selected = p.id === selectedId;
        const accent = p.colors?.[0] ?? '#ff2e93';
        return (
          <li key={p.id} className="snap-start shrink-0">
            <button
              type="button"
              onClick={() => onSelect(p)}
              onMouseEnter={() => retroAudio.playHover()}
              aria-pressed={selected}
              aria-label={`Play ${p.title}`}
              className={`cd-case group flex flex-col items-center gap-2 w-32 sm:w-36 xl:w-[132px] focus-visible:outline-none ${selected ? 'is-on' : ''}`}
              style={{ '--glow': accent } as React.CSSProperties}
            >
              <span className="relative block w-24 h-24 sm:w-28 sm:h-28">
                {/* the disc, tucked behind the case */}
                <span className="cd-disc absolute inset-y-[6%] left-[6%] aspect-square">
                  <Disc accent={accent} spinning={selected && isPlaying} className="w-full h-full" />
                </span>
                {/* the case, with the logo as its cover */}
                <span className="cd-cover absolute inset-0 rounded-[6px] overflow-hidden" style={{ background: p.logoBg ?? `color-mix(in srgb, ${accent} 10%, #fff)` }}>
                  {p.logo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.logo} alt="" className="absolute inset-[14%] w-[72%] h-[72%] object-contain" />
                  )}
                  <span className="cd-spine" aria-hidden />
                  <span className="cd-shine" aria-hidden />
                  <span className="absolute left-2.5 bottom-1 font-pixel text-sm leading-none" style={{ color: p.logoBg ? 'rgba(255,255,255,.75)' : 'rgba(26,15,31,.55)' }}>
                    0{p.id}
                  </span>
                </span>
              </span>
              <span
                className={`font-pixel text-lg leading-[0.95] text-center px-1.5 py-0.5 rounded ${
                  selected ? 'bg-ink text-white' : 'text-ink group-hover:bg-white/70'
                }`}
              >
                {p.title}
              </span>
              {p.pitch && <span className="text-[12.5px] leading-snug text-center text-ink/70 px-1">{p.pitch}</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
