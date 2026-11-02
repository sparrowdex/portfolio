'use client';

import React, { useEffect, useState } from 'react';
import { PROFILE } from '../../data/profile';
import { ChromeButton } from './ChromeButton';
import { setViewMode, type ViewMode } from './viewMode';

const LINKS = [
  ['#deck', 'projects'],
  ['#about', 'about'],
  ['#skills', 'skills'],
  ['#contact', 'contact'],
] as const;

function Clock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 15_000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  return <span className="font-pixel text-xl tabular-nums min-w-[4.5rem] text-right">{time}</span>;
}

/** Two-segment Fun / Recruiter switch, shared by both modes. */
export function ModeSwitch({ mode, tone = 'y2k' }: { mode: ViewMode; tone?: 'y2k' | 'plain' }) {
  const opts: [ViewMode, string][] = [
    ['fun', '✦ fun'],
    ['recruiter', '💼 recruiter'],
  ];
  if (tone === 'plain') {
    return (
      <div role="radiogroup" aria-label="View mode" className="inline-flex border border-black text-sm font-mono">
        {opts.map(([m, label]) => (
          <button
            key={m}
            role="radio"
            aria-checked={mode === m}
            onClick={() => setViewMode(m)}
            className={`px-3 py-1 ${mode === m ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'}`}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }
  return (
    <div role="radiogroup" aria-label="View mode" className="inline-flex rounded-full border-2 border-ink/70 bg-white/70 p-0.5">
      {opts.map(([m, label]) => (
        <button
          key={m}
          role="radio"
          aria-checked={mode === m}
          onClick={() => setViewMode(m)}
          className={`font-pixel text-base min-[400px]:text-lg leading-none whitespace-nowrap px-2 min-[400px]:px-2.5 sm:px-3 py-1 rounded-full transition-colors ${
            mode === m ? 'bg-hotpink text-white' : 'text-ink/70 hover:text-ink'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function Taskbar({ mode }: { mode: ViewMode }) {
  return (
    <header
      className="sticky top-0 z-50 border-b-2 border-ink/70"
      style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f6e6f1 45%, #e6cfe0 55%, #f9eef6 100%)' }}
    >
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 min-[400px]:gap-2 sm:gap-3 px-2 min-[400px]:px-3 sm:px-4 h-14">
        <ChromeButton href="#top" size="sm" className="!px-3 shrink-0" aria-label="Back to top">
          ✿<span className="hidden min-[400px]:inline"> start</span>
        </ChromeButton>
        <nav aria-label="Sections" className="hidden md:flex items-center gap-1">
          {LINKS.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="font-pixel text-xl px-2.5 py-0.5 rounded-md text-ink/80 hover:bg-white hover:text-ink border border-transparent hover:border-ink/30"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex-1" />
        <ChromeButton href={PROFILE.resumeUrl} download={PROFILE.resumeFileName} size="sm" variant="silver" className="shrink-0">
          <span className="min-[400px]:hidden">cv</span>
          <span className="hidden min-[400px]:inline">
            résumé<span className="hidden sm:inline">.pdf</span>
          </span>{' '}
          ↓
        </ChromeButton>
        <ModeSwitch mode={mode} />
        <div className="hidden lg:flex items-center gap-2 pl-3 ml-1 border-l-2 border-ink/20 text-ink">
          <span aria-hidden>🔊</span>
          <Clock />
        </div>
      </div>
    </header>
  );
}
