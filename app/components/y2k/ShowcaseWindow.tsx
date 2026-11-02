'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Project } from '../../types/project';
import { retroAudio } from '../../utils/retroAudio';
import { Y2KWindow } from './Y2KWindow';
import { setOverlayOpen } from './visibility';

/**
 * The per-project showcases in ProjectModals/ were designed for a full-screen
 * black stage (white/zinc text, #0a0a0a cards, 60–70vh "slides"). This gives
 * them that stage back, framed as a maximised Y2K window.
 */
export function ShowcaseWindow({
  project,
  onClose,
  children,
}: {
  project: Project;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const accent = project.colors?.[0] ?? '#ff2e93';
  const slug = project.title.toLowerCase().split(':')[0].replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setOverlayOpen(true); // rest the page's animations behind this window
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      setOverlayOpen(false);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex p-2 sm:p-5 bg-[#1a0f1f]/70 backdrop-blur-sm animate-pop-in"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} — full showcase`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Y2KWindow
        title={`${slug}_showcase.exe`}
        icon="📀"
        accent={accent}
        onClose={() => {
          retroAudio.playButtonClack();
          onClose();
        }}
        className="w-full h-full flex flex-col"
        bodyClassName="relative flex-1 min-h-0 overflow-y-auto overscroll-contain bg-[#050305] text-white"
      >
        {/* header strip */}
        <div className="sticky top-0 z-20 border-b border-white/10 bg-[#050305]/90 backdrop-blur">
          <div className="max-w-6xl mx-auto px-5 sm:px-10 py-3 flex items-center gap-4">
            {project.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={project.logo}
                alt=""
                className="w-10 h-10 rounded-xl p-1 object-contain border border-white/20"
                style={{ background: project.logoBg ?? '#fff' }}
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-pixel text-lg leading-none tracking-widest" style={{ color: accent }}>
                BONUS TRACK · 0{project.id}
              </p>
              <h2 className="font-bubble text-xl sm:text-2xl truncate">{project.title}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="font-pixel text-lg px-3 py-1 rounded-full border border-white/25 hover:bg-white/10 shrink-0"
            >
              esc ✕
            </button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-5 sm:px-10 pt-6">{children}</div>
      </Y2KWindow>
    </div>,
    document.body,
  );
}
