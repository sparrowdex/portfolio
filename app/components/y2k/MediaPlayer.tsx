'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { Project } from '../../types/project';
import { retroAudio } from '../../utils/retroAudio';
import { Y2KWindow } from './Y2KWindow';
import { ChromeButton } from './ChromeButton';
import { Disc } from './DiscRack';
import { Marquee } from './Decor';
import { INTROS, INTRO_DURATION } from './intros';
import { ShowcaseWindow } from './ShowcaseWindow';
import type { ProjectLink } from '../../types/project';

import { PhotoboothModal } from '../ProjectModals/PhotoboothModal';
import { InnerVoiceModal } from '../ProjectModals/InnerVoiceModal';
import { DiecastModal } from '../ProjectModals/DiecastModal';
import { ArmatrixModal } from '../ProjectModals/ArmatrixModal';
import { FlowersModal } from '../ProjectModals/FlowersModal';
import { SpiceVaultModal } from '../ProjectModals/SpiceVaultModal';
import { TimelessModal } from '../ProjectModals/TimelessModal';

const SHOWCASES: Record<number, React.ComponentType<{ selectedProject: Project }>> = {
  1: PhotoboothModal,
  2: InnerVoiceModal,
  3: DiecastModal,
  4: ArmatrixModal,
  5: FlowersModal,
  6: SpiceVaultModal,
  7: TimelessModal,
};

interface MediaPlayerProps {
  project: Project | null;
  /** Bump to replay the current disc's intro (e.g. re-clicking the loaded disc). */
  replayKey?: number;
  trackCount: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onEject: () => void;
}

// retroAudio keeps mute in localStorage; expose it as an external store (SSR-safe).
const muteListeners = new Set<() => void>();
const subscribeMute = (cb: () => void) => {
  muteListeners.add(cb);
  return () => {
    muteListeners.delete(cb);
  };
};

const LINK_ICON: Record<ProjectLink['kind'], string> = { live: '🌐', code: '💾', download: '📲', api: '🛰️' };
const LINK_LABEL: Record<ProjectLink['kind'], string> = { live: 'live', code: 'github', download: 'get', api: 'api' };

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export function MediaPlayer({ project, replayKey = 0, trackCount, isPlaying, onTogglePlay, onNext, onPrev, onEject }: MediaPlayerProps) {
  const accent = project?.colors?.[0] ?? '#ff2e93';
  const projectId = project?.id ?? null;
  const loadKey = `${projectId}:${replayKey}`;
  const [shownKey, setShownKey] = useState(loadKey);
  const [introFor, setIntroFor] = useState<number | null>(projectId);
  const [showcaseOpen, setShowcaseOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false); // phones only
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const muted = useSyncExternalStore(subscribeMute, () => retroAudio.getMuted(), () => false);

  // New disc inserted → reset and queue its intro (adjust-state-during-render pattern).
  if (loadKey !== shownKey) {
    setShownKey(loadKey);
    setIntroFor(projectId);
    setShowcaseOpen(false);
    setNotesOpen(false);
    setElapsed(0);
  }

  // End the intro. With reduced motion the CSS shows its final frame, so hold it briefly.
  useEffect(() => {
    if (introFor === null) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const id = setTimeout(() => setIntroFor(null), reduce ? 700 : INTRO_DURATION);
    return () => clearTimeout(id);
  }, [introFor, shownKey]);

  useEffect(() => {
    if (!isPlaying || !project) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [isPlaying, project]);

  const Intro = introFor !== null ? INTROS[introFor] : null;
  const Showcase = project ? SHOWCASES[project.id] : null;

  const transport = [
    { label: 'Previous project', glyph: '◂◂', onClick: onPrev },
    { label: isPlaying ? 'Pause' : 'Play', glyph: isPlaying ? '❚❚' : '▶', onClick: onTogglePlay, big: true },
    { label: 'Next project', glyph: '▸▸', onClick: onNext },
    { label: 'Eject', glyph: '⏏', onClick: onEject },
  ];

  return (
    <Y2KWindow
      title={`sreeja_media_player.exe${project ? ` — ${project.title}` : ''}`}
      icon="💿"
      accent={accent}
      bodyClassName="p-0 lg:flex-1 lg:min-h-0"
      // Laptops/desktops: the whole player fits on one screen; the liner notes scroll inside.
      className="transition-[border-color,box-shadow] duration-500 lg:flex lg:flex-col lg:h-[min(calc(100svh-5.5rem),820px)]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 lg:h-full">
        {/* ── Player body ── */}
        <div
          className="relative lg:col-span-5 p-3 sm:p-5 flex flex-col gap-2 sm:gap-3 lg:min-h-0 lg:justify-center"
          style={{
            background: `linear-gradient(160deg, #fdf6fb 0%, #e9dfe8 55%, color-mix(in srgb, ${accent} 22%, #e9dfe8) 100%)`,
          }}
        >
          {/* phones: the badge rides on the screen's corner like a sticker instead of taking a row in the notes */}
          {project?.specialBadge && (
            <span
              key={`badge-${project.id}`}
              className="md:hidden absolute top-1 right-1 z-10 font-pixel text-base leading-none px-2.5 py-1 rounded-full text-white border-2 border-ink rotate-6 shadow-[2px_2px_0_#1a0f1f] animate-pop-in"
              style={{ background: accent }}
            >
              ★ {project.specialBadge}
            </span>
          )}

          {/* Screen */}
          {/* touch: swipe the screen left/right to change project (vertical scrolling still works) */}
          <div
            className="y2k-lcd rounded-xl aspect-[16/10] sm:aspect-[4/3] border-[3px] sm:border-4 border-[#3a1530] touch-pan-y lg:w-[min(100%,calc((100svh-21rem)*4/3))] lg:mx-auto lg:shrink-0"
            style={{ '--accent': accent } as React.CSSProperties}
            onPointerDown={(e) => {
              if (e.pointerType !== 'mouse') swipeRef.current = { x: e.clientX, y: e.clientY };
            }}
            onPointerUp={(e) => {
              const start = swipeRef.current;
              swipeRef.current = null;
              if (!start) return;
              const dx = e.clientX - start.x;
              const dy = e.clientY - start.y;
              if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? onNext : onPrev)();
            }}
            onPointerCancel={() => (swipeRef.current = null)}
          >
            {!project && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <Disc accent="#ff2e93" className="w-24 opacity-60" />
                <p className="font-pixel text-2xl tracking-widest animate-blink">INSERT DISC</p>
              </div>
            )}

            {project && Intro && (
              <>
                <Intro key={loadKey} accent={accent} />
                <button
                  type="button"
                  onClick={() => setIntroFor(null)}
                  className="absolute top-2 right-2 z-10 font-pixel text-base px-2 rounded bg-black/60 hover:bg-black/80"
                >
                  skip ▸▸
                </button>
              </>
            )}

            {project && !Intro && (
              <div key={`${project.id}-np`} className="absolute inset-0 flex flex-col items-center justify-center gap-1 sm:gap-2 px-4 text-center animate-pop-in">
                {project.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.logo}
                    alt=""
                    className="w-12 h-12 sm:w-20 sm:h-20 object-contain rounded-xl sm:rounded-2xl p-1.5 sm:p-2 border-2"
                    style={{ borderColor: accent, background: project.logoBg ?? 'rgba(255,255,255,0.95)' }}
                  />
                ) : (
                  <Disc accent={accent} spinning={isPlaying} className="w-12 sm:w-20" />
                )}
                <p className="font-pixel text-xs sm:text-sm tracking-[0.3em] opacity-80">NOW PLAYING</p>
                <p className="font-pixel text-2xl sm:text-4xl leading-none">{project.title}</p>
                <p className="font-pixel text-base sm:text-lg leading-tight opacity-80 line-clamp-1 sm:line-clamp-2">{project.subtitle}</p>
                <div className="flex items-end gap-1 h-4 sm:h-6 mt-1" aria-hidden>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-full ${isPlaying ? 'animate-eq' : 'scale-y-25 origin-bottom'}`}
                      style={{ background: accent, animationDelay: `${(i * 0.13) % 0.9}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Track readout */}
          <div
            className="y2k-lcd rounded-md px-3 py-0.5 sm:py-1 font-pixel text-base sm:text-lg flex items-center justify-between"
            style={{ '--accent': accent } as React.CSSProperties}
          >
            <span>TRK {project ? `0${project.id}` : '--'}/0{trackCount}</span>
            <span>
              {isPlaying && project ? '▶' : '■'} {fmt(elapsed)}
            </span>
            <span className="md:hidden opacity-70">‹ swipe ›</span>
            <span className="hidden md:inline">STEREO</span>
          </div>

          {/* Transport */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 sm:pt-1">
            {transport.map((b) => (
              <ChromeButton
                key={b.label}
                aria-label={b.label}
                title={b.label}
                variant="accent"
                color={accent}
                onClick={b.onClick}
                className={`!p-0 !text-lg ${b.big ? 'w-12 h-12 sm:w-14 sm:h-14 !text-2xl' : 'w-10 h-10 sm:w-11 sm:h-11'}`}
              >
                {b.glyph}
              </ChromeButton>
            ))}
            <ChromeButton
              variant="silver"
              size="sm"
              aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
              onClick={() => {
                retroAudio.setMuted(!muted);
                muteListeners.forEach((l) => l());
              }}
              className="ml-1"
            >
              {muted ? '♪ off' : '♪ on'}
            </ChromeButton>
          </div>
        </div>

        {/* ── Liner notes / details ── */}
        <div className="lg:col-span-7 p-4 sm:p-7 border-t-2 lg:border-t-0 lg:border-l-2 border-[#3a1530]/15 bg-[#fff7fc] sm:min-h-[22rem] lg:min-h-0 lg:overflow-y-auto y2k-scroll">
          {!project ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-2 py-10">
              <p className="font-bubble text-3xl text-ink">no disc inserted</p>
              <p className="font-pixel text-xl text-ink/70">pick a CD from the rack below ↓</p>
            </div>
          ) : (
            <div key={project.id} className="animate-pop-in">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-pixel text-base sm:text-lg uppercase tracking-wider" style={{ color: `color-mix(in srgb, ${accent} 65%, #1a0f1f)` }}>
                    track 0{project.id} · {project.subtitle}
                  </p>
                  <h3 className="font-bubble text-2xl sm:text-4xl text-ink leading-tight">{project.title}</h3>
                </div>
                {project.specialBadge && (
                  <span
                    className="hidden md:inline-block font-pixel text-lg px-3 py-0.5 rounded-full text-white border-2 border-ink rotate-3 shadow-[2px_2px_0_#1a0f1f]"
                    style={{ background: accent }}
                  >
                    ★ {project.specialBadge}
                  </span>
                )}
              </div>

              {/* Links: live site / repo / downloads */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                {project.links?.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => retroAudio.playHover()}
                    className="inline-flex items-center gap-1.5 font-pixel text-base sm:text-lg leading-none px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full border-2 border-ink bg-white hover:bg-babypink shadow-[2px_2px_0_#1a0f1f] active:translate-y-0.5 active:shadow-none"
                  >
                    <span aria-hidden>{LINK_ICON[l.kind]}</span>
                    <span className="opacity-60">{LINK_LABEL[l.kind]}</span>
                    <span className="max-w-[10rem] sm:max-w-[16rem] truncate">{l.label}</span>
                    <span aria-hidden>↗</span>
                  </a>
                ))}
                {Showcase && (
                  <ChromeButton variant="accent" color={accent} size="sm" onClick={() => setShowcaseOpen(true)}>
                    ▶ bonus track
                  </ChromeButton>
                )}
              </div>

              <div className="space-y-4 sm:space-y-5 pt-4 sm:pt-5 mt-4 sm:mt-5 border-t-2 border-dashed border-ink/20">
                  <p className={`text-[15px] leading-relaxed text-ink/85 ${notesOpen ? '' : 'line-clamp-3 md:line-clamp-none'}`}>
                    {project.longDesc || project.desc}
                  </p>
                  {!notesOpen && (
                    <button
                      type="button"
                      onClick={() => setNotesOpen(true)}
                      className="md:hidden w-full font-pixel text-base py-1 rounded-lg border-2 border-dashed border-ink/30 text-ink/70"
                    >
                      read full liner notes ▾
                    </button>
                  )}
                  <div className={`space-y-5 ${notesOpen ? '' : 'hidden md:block'}`}>

                  {project.featuredHighlight && (
                    <div
                      className="relative rounded-xl p-3.5 pl-12 border-2 border-ink/80"
                      style={{ background: `color-mix(in srgb, ${accent} 14%, #fff)` }}
                    >
                      <span className="absolute left-3 top-3 text-2xl" aria-hidden>
                        💡
                      </span>
                      <p className="font-pixel text-lg uppercase leading-none mb-1 text-ink">key breakthrough</p>
                      <p className="text-sm leading-relaxed text-ink/85">{project.featuredHighlight}</p>
                    </div>
                  )}

                  <div>
                    <p className="font-pixel text-lg uppercase text-ink/70 mb-2">tracklist</p>
                    <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {project.features.map((f, i) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-ink/85 bg-white rounded-lg border border-ink/15 px-2.5 py-2">
                          <span className="font-pixel text-lg leading-none" style={{ color: `color-mix(in srgb, ${accent} 65%, #1a0f1f)` }}>
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          {f}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <p className="font-pixel text-lg uppercase text-ink/70 mb-2">recorded with</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((t, i) => (
                        <span
                          key={t}
                          className="font-pixel text-lg leading-none px-2.5 py-1 rounded-md border-2 border-ink bg-white shadow-[2px_2px_0_#1a0f1f]"
                          style={{ rotate: `${((i * 7) % 5) - 2}deg` }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  </div>

                  {Showcase && (
                    <button
                      type="button"
                      onClick={() => {
                        retroAudio.playCassetteInsert();
                        setShowcaseOpen(true);
                      }}
                      className="group w-full text-left y2k-lcd rounded-xl px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-3 sm:gap-4 border-2 border-ink"
                      style={{ '--accent': accent } as React.CSSProperties}
                    >
                      <Disc accent={accent} spinning className="w-9 sm:w-12 shrink-0" />
                      <span className="flex-1 min-w-0">
                        <span className="block font-pixel text-lg sm:text-xl leading-none">BONUS TRACK ▸ full interactive showcase</span>
                        <span className="block font-pixel text-base opacity-70 leading-tight mt-1">demos, videos, architecture &amp; lessons, in a full-screen window</span>
                      </span>
                      <span className="font-pixel text-2xl group-hover:translate-x-1 transition-transform">▶</span>
                    </button>
                  )}

                  <Marquee
                    items={[`now playing: ${project.title}`, ...project.colorLabels.map((c) => `colourway: ${c}`)]}
                    className={`font-pixel text-lg text-ink/60 border-y border-dashed border-ink/20 py-1 ${notesOpen ? '' : 'hidden md:block'}`}
                  />
              </div>

              {showcaseOpen && Showcase && (
                <ShowcaseWindow project={project} onClose={() => setShowcaseOpen(false)}>
                  <Showcase selectedProject={project} />
                </ShowcaseWindow>
              )}
            </div>
          )}
        </div>
      </div>
    </Y2KWindow>
  );
}
