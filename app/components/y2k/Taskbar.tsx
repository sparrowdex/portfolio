'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { retroAudio, MUTE_EVENT } from '../../utils/retroAudio';
import { PROFILE } from '../../data/profile';
import { ChromeButton } from './ChromeButton';

const LINKS = [
  ['#about', 'about'],
  ['#deck', 'projects'],
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

/** The speaker in the corner: click to mute or unmute every sound on the site (remembered). */
function SoundToggle() {
  const muted = useSyncExternalStore(
    (cb) => {
      window.addEventListener(MUTE_EVENT, cb);
      return () => window.removeEventListener(MUTE_EVENT, cb);
    },
    () => retroAudio.getMuted(),
    () => false,
  );
  return (
    <button
      type="button"
      onClick={() => {
        const nowMuted = retroAudio.toggleMute();
        if (!nowMuted) retroAudio.playNote(660, 0.4, 0.12);
      }}
      aria-pressed={muted}
      aria-label={muted ? 'Turn sound on' : 'Mute sound'}
      title={muted ? 'sound off · click to turn on' : 'sound on · click to mute'}
      className="w-8 h-8 grid place-items-center rounded-md hover:bg-white border border-transparent hover:border-ink/30"
    >
      <span aria-hidden>{muted ? '🔇' : '🔊'}</span>
    </button>
  );
}

export function Taskbar() {
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
        <ChromeButton href="/resume" size="sm" className="shrink-0 whitespace-nowrap">
          💼 recruiter<span className="hidden sm:inline"> view</span>
        </ChromeButton>
        <div className="hidden lg:flex items-center gap-2 pl-3 ml-1 border-l-2 border-ink/20 text-ink">
          <SoundToggle />
          <Clock />
        </div>
      </div>
    </header>
  );
}
