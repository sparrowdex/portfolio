'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PLAY_PROJECT_EVENT } from './components/RetroPhoneAssistant';
import { PROJECTS_DATA } from './data/projects';
import { PROFILE } from './data/profile';
import type { Project } from './types/project';
import { retroAudio } from './utils/retroAudio';

import { Y2KBackground } from './components/y2k/Y2KBackground';
import { Y2KWindow } from './components/y2k/Y2KWindow';
import { ChromeButton } from './components/y2k/ChromeButton';
import { Marquee, SectionTitle, Sparkle } from './components/y2k/Decor';
import { DiscRack } from './components/y2k/DiscRack';
import { MediaPlayer } from './components/y2k/MediaPlayer';
import { StarTrail } from './components/y2k/StarTrail';
import { NowPlayingDisc } from './components/y2k/NowPlayingDisc';
import { Portrait } from './components/y2k/Portrait';
import { AboutProfile } from './components/y2k/AboutProfile';
import { Keychain } from './components/y2k/Keychain';
import { Equalizer } from './components/y2k/Equalizer';
import { MessengerWindow } from './components/y2k/MessengerWindow';
import { Taskbar } from './components/y2k/Taskbar';
import { RecruiterView } from './components/y2k/RecruiterView';
import { useViewMode } from './components/y2k/viewMode';
import { useOffscreenPause } from './components/y2k/visibility';

const STICKERS = [
  { label: 'New Delhi ✈', bg: '#7fe3ff', pos: '-bottom-12 -left-10', rot: '-10deg' },
  { label: 'CTO @ The Diecast Store 🏎️', bg: '#ff8fd8', pos: '-top-12 -left-12', rot: '-6deg' },
  { label: "B.Tech CSE '27 🎓", bg: '#c9a7ff', pos: 'top-1/3 -right-16', rot: '8deg' },
  { label: 'open to collabs ✉', bg: '#ffffff', pos: 'top-[62%] -left-20', rot: '-4deg' },
];

export default function Home() {
  const mode = useViewMode();
  return mode === 'recruiter' ? <RecruiterView /> : <FunMode />;
}

function FunMode() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(PROJECTS_DATA[2]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [replayKey, setReplayKey] = useState(0);
  const deckRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  useOffscreenPause();

  // The phone assistant can load a project into the player.
  useEffect(() => {
    const onPlay = (e: Event) => {
      const project = PROJECTS_DATA.find((p) => p.id === (e as CustomEvent<number>).detail);
      if (!project) return;
      setSelectedProject(project);
      setIsPlaying(true);
      playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    window.addEventListener(PLAY_PROJECT_EVENT, onPlay);
    return () => window.removeEventListener(PLAY_PROJECT_EVENT, onPlay);
  }, []);

  const step = (dir: 1 | -1) => {
    const cur = selectedProject ? PROJECTS_DATA.findIndex((p) => p.id === selectedProject.id) : -1;
    const next = cur === -1 ? 0 : (cur + dir + PROJECTS_DATA.length) % PROJECTS_DATA.length;
    retroAudio.playTapeWhirr();
    setSelectedProject(PROJECTS_DATA[next]);
    setIsPlaying(true);
  };

  const handleSelectProject = (project: Project) => {
    if (project.id === selectedProject?.id) setReplayKey((k) => k + 1);
    setSelectedProject(project);
    setIsPlaying(true);
    // desktop: bring the player into view (on phones the rack sits right above it)
    if (window.matchMedia('(min-width: 768px)').matches) playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div id="top" className="relative min-h-screen text-ink overflow-x-clip pause-on-overlay">
      <Y2KBackground />
      <StarTrail />
      <NowPlayingDisc />
      <Taskbar mode="fun" />

      {/* ── HERO ── */}
      <section data-anim className="relative z-10 max-w-6xl mx-auto px-4 pt-12 sm:pt-20 pb-10 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
          <span className="inline-flex items-center gap-2 font-pixel text-xl px-3 py-0.5 rounded-full bg-white/80 border-2 border-ink/70 shadow-[3px_3px_0_#1a0f1f]">
            <Sparkle size={14} animate={false} /> welcome 2 my homepage <Sparkle size={14} animate={false} />
          </span>

          <h1 className="relative mt-5 font-bubble text-[4rem] leading-[0.9] sm:text-8xl lg:text-[8.5rem] lg:-ml-1">
            <span className="y2k-chrome-text block">Sreeja</span>
            <span className="y2k-chrome-text block lg:pl-[0.6em]">Das</span>
            <Sparkle size={44} className="absolute -top-3 -right-10" />
            <Sparkle size={24} delay={0.8} color="#7fe3ff" className="absolute bottom-4 -left-6 lg:left-2" />
          </h1>

          <p className="font-pixel text-2xl sm:text-3xl mt-5 text-ink/90 flex flex-wrap justify-center lg:justify-start gap-x-2.5">
            <span className="whitespace-nowrap">full-stack dev</span>
            <span className="text-hotpink">✦</span>
            <span className="whitespace-nowrap">creative technologist</span>
            <span className="text-hotpink">✦</span>
            <span className="whitespace-nowrap">co-founder &amp; CTO</span>
          </p>
          <p className="mt-3 text-base sm:text-lg text-ink/75 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Bridging logic and emotion through tactile software. CTO at The Diecast Store, builder of WebGL toys and
            production-grade full-stack systems.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
            <ChromeButton href="#player" size="lg">
              ▶ play my projects
            </ChromeButton>
            <ChromeButton href={PROFILE.resumeUrl} download={PROFILE.resumeFileName} size="lg" variant="silver">
              résumé.pdf ↓
            </ChromeButton>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-md">
            <Portrait />
            {/* sticker tags: scattered around the window on desktop */}
            {STICKERS.map((t, i) => (
              <span
                key={t.label}
                className={`hidden lg:inline-block absolute ${t.pos} font-bubble text-base xl:text-lg px-3 py-1 border-2 border-ink rounded-full shadow-[3px_3px_0_#1a0f1f] pointer-events-none whitespace-nowrap animate-y2k-float`}
                style={{ background: t.bg, '--r': t.rot, animationDelay: `${i * -1.1}s`, animationDuration: `${5 + (i % 3)}s` } as React.CSSProperties}
              >
                {t.label}
              </span>
            ))}
            {/* her keychain, clipped to the window corner like on her bag */}
            <div className="hidden md:block absolute -top-3 -right-10 z-30">
              <Keychain size={82} />
            </div>
          </div>
          {/* …and as a tidy row below it on smaller screens */}
          <div className="lg:hidden flex flex-wrap justify-center gap-2 mt-5 max-w-md">
            {STICKERS.map((t) => (
              <span
                key={t.label}
                className="font-bubble text-sm px-2.5 py-0.5 border-2 border-ink rounded-full shadow-[2px_2px_0_#1a0f1f]"
                style={{ background: t.bg, rotate: t.rot }}
              >
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div data-anim className="relative z-10 border-y-2 border-ink bg-hotpink text-white">
        <Marquee
          className="font-pixel text-2xl py-1.5"
          items={[
            'now playing: 7 projects on CD',
            'co-founder & CTO @ the diecast store',
            'b.tech CSE @ SRM · CGPA 9.05',
            'open to cool collabs',
          ]}
        />
      </div>

      {/* ── ABOUT ── */}
      <section data-anim id="about" className="relative z-10 max-w-6xl xl:max-w-[1360px] 2xl:max-w-[1600px] mx-auto px-4 lg:px-8 pt-20 pb-8 scroll-mt-16">
        <SectionTitle kicker="profile" title="About Me" />
        <AboutProfile />
      </section>

      {/* ── PROJECTS: MEDIA PLAYER ── */}
      <section data-anim id="deck" ref={deckRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-12 scroll-mt-16">
        <SectionTitle kicker="selected works" title="The Disc Player" />
        {/* phones: disc rack first so switching projects doesn't mean scrolling past the notes */}
        <div className="flex flex-col gap-6 md:gap-10">
        <div id="player" ref={playerRef} className="scroll-mt-[4.25rem]">
        <MediaPlayer
          project={selectedProject}
          replayKey={replayKey}
          trackCount={PROJECTS_DATA.length}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((p) => !p)}
          onNext={() => step(1)}
          onPrev={() => step(-1)}
          onEject={() => {
            retroAudio.playCassetteInsert();
            setSelectedProject(null);
            setIsPlaying(false);
          }}
        />
        </div>

        <Y2KWindow title={`disc_rack/  —  ${PROJECTS_DATA.length} items`} icon="📁" className="order-first md:order-none" bodyClassName="px-3 sm:px-6 py-3 md:py-4">
          <p className="font-pixel text-lg text-ink/70 mb-1 text-center">
            <span className="md:hidden">swipe & tap a disc ✦</span>
            <span className="hidden md:inline">click a disc to load it into the player ✦</span>
          </p>
          <DiscRack
            projects={PROJECTS_DATA}
            selectedId={selectedProject?.id ?? null}
            isPlaying={isPlaying}
            onSelect={handleSelectProject}
          />
        </Y2KWindow>
        </div>
      </section>

      {/* ── SKILLS: WINAMP EQ ── */}
      <section data-anim id="skills" className="relative z-10 max-w-4xl mx-auto px-4 py-16 scroll-mt-16">
        <SectionTitle kicker="stack frequencies" title="Equalizer" />
        <Equalizer />
      </section>

      {/* ── CONTACT: INSTANT MESSENGER ── */}
      <section data-anim id="contact" className="relative z-10 max-w-2xl mx-auto px-4 py-16 scroll-mt-16">
        <SectionTitle kicker="let's connect" title="Say Hi!" />
        <MessengerWindow />
      </section>

      <footer className="relative z-10 max-w-4xl mx-auto px-4 pb-24 pt-6">
        <p className="font-pixel text-lg text-ink/70 text-center">
          made with Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Web Audio API
        </p>
      </footer>
    </div>
  );
}
