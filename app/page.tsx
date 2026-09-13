'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PixelCursorTrail } from './components/PixelCursorTrail';
import SreejaPortrait from './components/SreejaPortrait';
import PinkCadillacEasterEgg from './components/PinkCadillacEasterEgg';

// ── PASTEL PAPER PALETTE & THEMES ──
interface ThemeColor {
  label: string;
  title: string;
  hex: string;
}

const CHROMATIC_PALETTE: Record<string, ThemeColor> = {
  default: { label: 'STUDIO', title: 'STUDIO', hex: '#ffffff' },
  projects: { label: 'POWDER BLUE', title: 'PROJECTS', hex: '#93c5fd' },
  about: { label: 'WARM SAND', title: 'ABOUT', hex: '#fcd34d' },
  contact: { label: 'DUSTY ROSE', title: 'CONTACT', hex: '#fda4af' },
};

// ── RIGHT-SIDE MINIMALIST NAVIGATION ITEMS (PASTEL ARTISANAL THEME) ──
const NAV_ITEMS = [
  {
    id: 'projects',
    title: 'PROJECTS',
    subtitle: 'SELECTED WORKS & BUILDS',
    index: '01',
    href: '/projects',
    colorHex: '#93c5fd', // Soft pastel powder blue
  },
  {
    id: 'about',
    title: 'ABOUT',
    subtitle: 'STORY, SKILLS & IDENTITY',
    index: '02',
    href: '/about',
    colorHex: '#fcd34d', // Soft pastel warm sand
  },
  {
    id: 'contact',
    title: 'CONTACT',
    subtitle: 'CONNECT & COLLABORATE',
    index: '03',
    href: '/contact',
    colorHex: '#fda4af', // Soft pastel dusty rose
  }
];

export default function Home() {
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);

  // ── SREEJA INTERACTIVE 5-POSE SEQUENCE & CAROUSEL STATE ──
  const [pose, setPose] = useState<'normal' | 'surprised' | 'hello' | 'showing' | 'think_left' | 'think_right'>('normal');
  const [thought, setThought] = useState('CLICK ME TO START EXPLORING ✨');
  const [isCarousel, setIsCarousel] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(1); // Starts on ABOUT (index 1) as requested

  // Touch swipe support for mobile carousel
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [hasCadillacAppeared, setHasCadillacAppeared] = useState(false);

  const slides = ['EXPLORE PROJECTS', 'GET TO KNOW ME', "LET'S CONNECT"];

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % slides.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [slides.length]);

  const activeItem = NAV_ITEMS[activeItemIndex];
  const activeTheme = isCarousel
    ? (CHROMATIC_PALETTE[activeItem.id] || CHROMATIC_PALETTE.default)
    : (hoveredNav ? CHROMATIC_PALETTE[hoveredNav] : CHROMATIC_PALETTE.default);

  // ── 1. CLICK REACTION: WIDESCREEN VS PHONE ──
  const handlePortraitClick = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    if (isMobile && hasCadillacAppeared) {
      setThought("QUICK, TAP THE CADILLAC BEFORE IT ZOOMS AWAY! 🏎️💨");
      return;
    }

    if (isMobile) {
      // Phone sequence: Surprise -> V-sign Hello -> Carousel selection with thinking eyes
      if (!isCarousel) {
        setPose('surprised');
        setThought('WOAH! YOU FOUND ME! 😳');

        setTimeout(() => {
          setPose('hello');
          setThought("HEY THERE! WELCOME TO MY WORLD 👋");

          setTimeout(() => {
            setIsCarousel(true);
            setActiveItemIndex(1); // ABOUT
            setPose('think_right');
            setThought("WHERE SHOULD WE EXPLORE FIRST? 💭");
          }, 1250);
        }, 550);
      } else {
        setThought("SWIPE TO SHIFT, TAP TITLE TO ENTER! ✨");
      }
    } else {
      // Widescreen sequence: Click sedentary state -> Hello image -> Showing/think pose
      if (pose === 'normal') {
        setPose('hello');
        setThought("HEY THERE! WELCOME TO MY WORLD 👋");

        setTimeout(() => {
          setPose('showing');
          setIsShowing(true);
          setThought("HOVER OVER THE SECTIONS ON THE RIGHT! 👉💭");
        }, 1800);
      } else if (pose === 'hello') {
        setPose('showing');
        setIsShowing(true);
        setThought("HOVER OVER THE SECTIONS ON THE RIGHT! 👉💭");
      } else {
        setThought("HOVER OVER THE SECTIONS ON THE RIGHT! 👉💭");
      }
    }
  };

  // ── 2. PREV NAVIGATION (EYES LOOK LEFT) ──
  const handlePrev = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setActiveItemIndex((prev) => {
      const nextIdx = (prev - 1 + NAV_ITEMS.length) % NAV_ITEMS.length;
      const thoughtsLeft: Record<string, string> = {
        projects: 'PONDERING WHICH BUILD TO SHOW YOU FIRST... 🚀',
        about: 'REFLECTING ON MY DESIGN & ARCHITECTURE ROOTS... 💭',
        contact: 'THINKING OF COOL COLLABORATIONS... ✉️',
      };
      setThought(thoughtsLeft[NAV_ITEMS[nextIdx].id] || 'THINKING WHAT TO EXPLORE NEXT... 💭');
      return nextIdx;
    });
    setPose('think_left'); // Eyes go left!
  };

  // ── 3. NEXT NAVIGATION (EYES LOOK RIGHT) ──
  const handleNext = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setActiveItemIndex((prev) => {
      const nextIdx = (prev + 1) % NAV_ITEMS.length;
      const thoughtsRight: Record<string, string> = {
        projects: 'EVALUATING INTERACTIVE BUILDS IN MY VAULT... ⚡',
        about: 'REFLECTING ON MY CREATIVE ARCHITECTURE JOURNEY... 📖',
        contact: 'PONDERING HOW WE CAN BUILD SOMETHING COOL... 💬',
      };
      setThought(thoughtsRight[NAV_ITEMS[nextIdx].id] || 'THINKING WHAT TO EXPLORE NEXT... 💭');
      return nextIdx;
    });
    setPose('think_right'); // Eyes go right!
  };

  // ── TOUCH SWIPE NAVIGATION FOR MOBILE CAROUSEL ──
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isCarousel) return;
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isCarousel) return;
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isCarousel || touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 35;
    if (distance > minSwipeDistance) {
      handleNext(); // Swiped left -> Next item
    } else if (distance < -minSwipeDistance) {
      handlePrev(); // Swiped right -> Prev item
    }
  };

  // ── KEYBOARD ARROW NAVIGATION (LEFT / RIGHT) ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCarousel) return;
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        setIsCarousel(false);
        setPose('normal');
        setThought('CLICK ME TO START EXPLORING ✨');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCarousel, activeItemIndex]);

  // ── 4. DRIFTING CURSOR TO LEFT: "WAIT, WHERE ARE YOU GOING?" + THINK RIGHT ──
  useEffect(() => {
    if (!isShowing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (hoveredNav) return;

      const isLeftSide = e.clientX < window.innerWidth * 0.44;

      if (isLeftSide) {
        setPose('think_right'); // Eyes glance sideways tracking cursor!
        setThought('WAIT, WHERE ARE YOU GOING? 👀💭');
      } else {
        setPose((prev) => (prev === 'think_right' ? 'showing' : prev));
        setThought((prev) => (prev === 'WAIT, WHERE ARE YOU GOING? 👀💭' ? 'HOVER OVER THE SECTIONS ON THE RIGHT! 👉💭' : prev));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isShowing, hoveredNav]);

  // ── 5. PINK CADILLAC 30s MOBILE EASTER EGG HANDLERS ──
  const handleCadillacTrigger = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (!isMobile) return;
    setHasCadillacAppeared(true);
    setPose('think_left');
    setThought("YOO WHAT'S THIS CAR? CATCH IT! 🏎️💨");
  };

  const handleCadillacCatch = () => {
    setPose('surprised');
    setThought("NICE CATCH! 🏁 SPEEDING TO THE DIECAST STORE...");
    setTimeout(() => {
      setHasCadillacAppeared(false);
    }, 2800);
  };

  const handleCadillacDirection = (dir: 'left' | 'right') => {
    if (!hasCadillacAppeared) return;
    setPose(dir === 'right' ? 'think_left' : 'think_right');
  };

  return (
    <main className="relative w-screen h-screen bg-[#09090b] text-white overflow-hidden select-none transition-colors duration-1000 cursor-none [&_*]:cursor-none">

      {/* ── FORCE HIDE DEFAULT OS CURSOR ACROSS PAGE ── */}
      <style dangerouslySetInnerHTML={{
        __html: `
          html, body, main, a, button, [role="button"], input {
            cursor: none !important;
          }
        `
      }} />

      {/* ── 1. FULL-SCREEN PASTEL PAPER TRANSITIONS ── */}
      <div
        className="absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #09090b 0%, #0d0d12 100%)',
          opacity: (hoveredNav || isCarousel) ? 0 : 1
        }}
      />
      <div
        className="absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #0f1522 0%, #161f32 100%)',
          opacity: (hoveredNav === 'projects' || (isCarousel && activeItem.id === 'projects')) ? 1 : 0
        }}
      />
      <div
        className="absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #1b1712 0%, #251f18 100%)',
          opacity: (hoveredNav === 'about' || (isCarousel && activeItem.id === 'about')) ? 1 : 0
        }}
      />
      <div
        className="absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #1c1318 0%, #271922 100%)',
          opacity: (hoveredNav === 'contact' || (isCarousel && activeItem.id === 'contact')) ? 1 : 0
        }}
      />

      {/* ── 2. FLORAL LACE TAPESTRY (FAINT & SOFTLY DISSOLVING TOWARDS RIGHT) ── */}
      <div
        className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none"
        style={{
          maskImage: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 18%, rgba(0,0,0,0.14) 38%, rgba(0,0,0,0.02) 58%, transparent 75%)',
          WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 18%, rgba(0,0,0,0.14) 38%, rgba(0,0,0,0.02) 58%, transparent 75%)',
        }}
      >
        <div
          className="w-full h-full opacity-22 md:opacity-30 mix-blend-screen transition-all duration-1000"
          style={{
            backgroundImage: 'url(/images/flower_lace.webp)',
            backgroundRepeat: 'repeat',
            backgroundSize: 'auto 100%',
            backgroundPosition: 'left top',
          }}
        />
      </div>

      {/* ── 3. MICRO-GRANULAR MATTE PAPER TEXTURE ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[3] pointer-events-none select-none opacity-[0.055] mix-blend-screen"
        style={{
          backgroundImage: 'url(/images/paper_grain_fine.webp)',
          backgroundRepeat: 'repeat',
          backgroundSize: '120px 120px',
        }}
      />

      {/* ── 4. SILKY SMOOTH BIOLUMINESCENT ORB CURSOR ── */}
      <PixelCursorTrail activeColor={activeTheme.hex} />

      {/* ── 5. HEADER (TOP NAVIGATION STAMP BADGES) ── */}
      <header className="absolute top-0 left-0 right-0 z-40 p-5 md:p-8 pointer-events-none flex justify-center md:justify-end items-center md:items-start">
        <nav className="flex gap-2 sm:gap-2.5 pointer-events-auto items-center">
          {[
            { href: '/projects', label: 'PROJECTS' },
            { href: '/about', label: 'ABOUT' },
            { href: '/contact', label: 'CONTACT' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-[3px] border border-white/25 hover:border-white/60 border-dashed bg-black/40 hover:bg-white/10 backdrop-blur-md transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 flex items-center select-none shadow-sm"
            >
              <span
                className="font-vtks text-[10.5px] sm:text-[11.5px] text-white/85 group-hover:text-white tracking-widest uppercase transition-colors"
                style={{
                  fontFamily: "'VTKS Psychedelic', cursive, sans-serif",
                  textShadow: "0 1px 8px rgba(255, 255, 255, 0.3)",
                }}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </header>

      {/* ── 6. GIANT MINIMALIST TYPOGRAPHY (WIDESCREEN: ALWAYS VISIBLE ON THE RIGHT - Z-20) ── */}
      <nav
        aria-label="Main Navigation"
        className="hidden md:flex absolute right-12 lg:right-20 xl:right-24 top-[54%] -translate-y-1/2 z-20 pointer-events-auto flex-col items-end gap-8 lg:gap-11 xl:gap-12"
      >
        {NAV_ITEMS.map((item) => {
          const isHovered = hoveredNav === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              onMouseEnter={() => {
                setHoveredNav(item.id);
                setPose('think_left'); // Thinking face engages!
                const thoughts: Record<string, string> = {
                  projects: 'EVALUATING INTERACTIVE BUILDS IN MY VAULT... 🚀',
                  about: 'REFLECTING ON MY CREATIVE ARCHITECTURE JOURNEY... 💭',
                  contact: 'PONDERING HOW WE CAN BUILD SOMETHING AMAZING... ✉️',
                };
                setThought(thoughts[item.id] || `CURIOUS ABOUT ${item.title}? CLICK TO EXPLORE! ✨`);
              }}
              onMouseLeave={() => {
                setHoveredNav(null);
                setPose(isShowing ? 'showing' : 'normal');
                setThought(isShowing ? 'HOVER OVER THE SECTIONS ON THE RIGHT! 👉💭' : 'CLICK ME TO START EXPLORING ✨');
              }}
              className="group relative flex flex-col items-end text-right transition-all duration-500 focus:outline-none"
            >
              <span
                className="font-signature text-5xl lg:text-[4.25rem] xl:text-[4.85rem] font-normal tracking-wide leading-none transition-all duration-500 group-hover:-translate-x-3 select-none"
                style={{
                  color: isHovered ? '#ffffff' : (hoveredNav ? '#666677' : '#e2e8f0'),
                  opacity: isHovered ? 1 : (hoveredNav ? 0.35 : 0.85),
                  textShadow: isHovered ? `0 0 25px ${item.colorHex}66, 0 2px 12px rgba(255,255,255,0.4)` : 'none',
                }}
              >
                {item.title.charAt(0).toUpperCase() + item.title.slice(1).toLowerCase()}
              </span>
              <div className="flex items-center gap-2.5 font-mono text-xs tracking-widest mt-1 transition-all duration-500">
                <span
                  className="text-[11px] font-bold transition-colors duration-500"
                  style={{ color: isHovered ? item.colorHex : '#777777' }}
                >
                  [ {item.index} ]
                </span>
                <span
                  className="tracking-wider uppercase text-[11px] font-medium transition-colors duration-500"
                  style={{ color: isHovered ? item.colorHex : '#888888' }}
                >
                  {item.subtitle}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* ── 7. EDITORIAL PORTRAIT (SHIFTED LEFT ON WIDESCREEN - Z-30) ── */}
      <div className="hidden md:flex absolute right-[260px] lg:right-[360px] xl:right-[450px] 2xl:right-[520px] bottom-0 z-30 pointer-events-auto items-end justify-center w-[520px] lg:w-[640px] xl:w-[740px] 2xl:w-[840px] h-[88vh] lg:h-[94vh] transition-all duration-700">
        <SreejaPortrait
          className="w-full h-full"
          pose={pose}
          thought={thought}
          shiftBubbleRight={hoveredNav === 'contact' || hoveredNav === 'about'}
          onPortraitClick={handlePortraitClick}
          onThoughtClick={handlePortraitClick}
        />
      </div>

      {/* ── MOBILE EDITORIAL PORTRAIT & CAROUSEL (ANCHORED TO BOTTOM, SWIPEABLE) ── */}
      <div
        className="flex md:hidden absolute inset-x-0 bottom-0 top-0 flex-col justify-between items-center pointer-events-auto z-20 px-4 pt-14 pb-0 select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Mobile Swipeable Carousel Title in Signature Script (No Arrows) */}
        {isCarousel ? (
          <div className="flex flex-col items-center mt-32 sm:mt-36 -translate-x-2 sm:-translate-x-2.5 z-50 select-none pointer-events-auto w-full px-6 text-center overflow-visible">
            <Link
              href={activeItem.href}
              className="font-signature text-[2.5rem] sm:text-[3.15rem] text-white tracking-wide leading-none whitespace-nowrap transition-all duration-300 active:scale-95 select-none overflow-visible px-4"
              style={{
                textShadow: "0 2px 18px rgba(255, 255, 255, 0.45)",
              }}
            >
              {activeItem.title.charAt(0).toUpperCase() + activeItem.title.slice(1).toLowerCase()}
            </Link>
            <div className="flex items-center gap-2 font-mono text-[10px] sm:text-[11px] tracking-widest mt-2 sm:mt-2.5 opacity-80">
              <span style={{ color: activeTheme.hex }}>[ {activeItem.index} ]</span>
              <span className="uppercase text-neutral-300">{activeItem.subtitle}</span>
            </div>
            {/* Subtle Carousel Progress Dots */}
            <div className="flex gap-1.5 mt-2.5">
              {NAV_ITEMS.map((item, idx) => (
                <div
                  key={item.id}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    idx === activeItemIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/25'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="relative mt-7 sm:mt-9 z-50 select-none flex items-center justify-center">
            {/* ── Circular Rotating Editorial Stamp Badge (Enlarged & Pushed Down with Safe Head Clearance) ── */}
            <div 
              onClick={handlePortraitClick}
              className="relative w-[210px] h-[210px] sm:w-[230px] sm:h-[230px] flex items-center justify-center pointer-events-auto cursor-pointer group transition-transform duration-300 active:scale-95"
            >
              {/* Outer Rotating Marquee Text Ring */}
              <svg 
                viewBox="0 0 200 200" 
                className="w-full h-full animate-[spin_28s_linear_infinite] select-none pointer-events-none"
              >
                <defs>
                  <path
                    id="stampTextCircle"
                    d="M 100, 100 m -74, 0 a 74,74 0 1,1 148,0 a 74,74 0 1,1 -148,0"
                    fill="none"
                  />
                </defs>
                <text className="font-mono text-[8.6px] font-semibold tracking-[0.20em] fill-neutral-300/85 uppercase">
                  <textPath href="#stampTextCircle" startOffset="0%">
                    SREEJA DAS ✦ FULL STACK ✦ CREATIVE DEVELOPER &amp; DESIGNER ✦ 2026 ✦ 
                  </textPath>
                </text>
              </svg>

              {/* Decorative Stamp Hairline Borders */}
              <div className="absolute inset-5 sm:inset-6 rounded-full border border-white/20 border-dashed pointer-events-none" />
              <div className="absolute inset-7 sm:inset-8 rounded-full border border-white/35 pointer-events-none" />

              {/* Stamp Center: VTKS Psychedelic Name Insignia (Matched Sreeja & Das Scale) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center -rotate-6 group-hover:rotate-0 transition-transform duration-500 select-none">
                <span 
                  className="font-vtks text-[1.55rem] sm:text-[1.72rem] text-white tracking-widest leading-none select-none uppercase drop-shadow-[0_2px_14px_rgba(255,255,255,0.45)]"
                  style={{
                    fontFamily: "'VTKS Psychedelic', cursive, sans-serif",
                  }}
                >
                  Sreeja
                </span>
                <span 
                  className="font-vtks text-[1.55rem] sm:text-[1.72rem] text-white tracking-[0.22em] leading-none select-none uppercase mt-1 drop-shadow-[0_2px_14px_rgba(255,255,255,0.45)]"
                  style={{
                    fontFamily: "'VTKS Psychedelic', cursive, sans-serif",
                  }}
                >
                  Das
                </span>
                <span className="font-mono text-[8.5px] sm:text-[9.5px] tracking-[0.3em] uppercase text-neutral-400 font-semibold mt-1.5">
                  FOLIO '26
                </span>
              </div>
            </div>

            {/* ── Mobile Info Assistant Trigger: Just below on the right side of the stamp with a big white search icon ── */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.dispatchEvent(new CustomEvent('open-info-assistant'));
              }}
              aria-label="Open Information Index Assistant"
              className="absolute top-9 right-0 sm:top-11 sm:right-0.5 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-neutral-900/95 border-2 border-white/40 hover:border-white shadow-[0_4px_16px_rgba(0,0,0,0.85),0_0_15px_rgba(255,255,255,0.18)] flex items-center justify-center text-white transition-all duration-300 active:scale-90 pointer-events-auto cursor-pointer group/search"
            >
              <svg 
                width="22" 
                height="22" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover/search:scale-110 drop-shadow-[0_2px_6px_rgba(255,255,255,0.5)]"
              >
                <circle cx="11" cy="11" r="7.5" />
                <line x1="21" y1="21" x2="16.5" y2="16.5" />
              </svg>
            </button>
          </div>
        )}

        {/* Hero Portrait Anchored Flush to Screen Bottom (Height-Adaptive) */}
        <div className="relative w-full max-w-[480px] sm:max-w-[540px] h-[58vh] min-[390px]:h-[64vh] sm:h-[68vh] max-h-[640px] flex items-end justify-center mb-0">
          <SreejaPortrait
            className="w-full h-full"
            pose={pose}
            thought={thought}
            shiftBubbleRight={hoveredNav === 'contact' || hoveredNav === 'about'}
            showPixelExclamation={hasCadillacAppeared}
            onPortraitClick={handlePortraitClick}
            onThoughtClick={handlePortraitClick}
          />
        </div>
      </div>

      {/* ── 8. INTRO TEXT & PORTFOLIO TITLE (WIDESCREEN ONLY - HIDDEN ON MOBILE) ── */}
      <div className="hidden md:flex absolute bottom-12 sm:bottom-14 md:bottom-12 left-6 md:left-14 z-20 pointer-events-auto max-w-[80%] sm:max-w-md lg:max-w-lg select-text flex-col gap-1.5 md:gap-3">
        
        {/* Widescreen Rotating Editorial Stamp Badge */}
        <div 
          onClick={handlePortraitClick}
          className="cursor-pointer group select-none pointer-events-auto transition-transform duration-300 hover:scale-105 active:scale-95 mb-1"
        >
          <div className="relative w-[190px] h-[190px] lg:w-[215px] lg:h-[215px] flex items-center justify-center">
            {/* Outer Rotating Marquee Text Ring */}
            <svg 
              viewBox="0 0 200 200" 
              className="w-full h-full animate-[spin_28s_linear_infinite] select-none pointer-events-none"
            >
              <defs>
                <path
                  id="widescreenStampTextCircle"
                  d="M 100, 100 m -74, 0 a 74,74 0 1,1 148,0 a 74,74 0 1,1 -148,0"
                  fill="none"
                />
              </defs>
              <text className="font-mono text-[8.6px] font-semibold tracking-[0.20em] fill-neutral-300/85 uppercase">
                <textPath href="#widescreenStampTextCircle" startOffset="0%">
                  SREEJA DAS ✦ FULL STACK ✦ CREATIVE DEVELOPER &amp; DESIGNER ✦ 2026 ✦ 
                </textPath>
              </text>
            </svg>

            {/* Decorative Stamp Hairline Borders */}
            <div className="absolute inset-5 sm:inset-6 rounded-full border border-white/20 border-dashed pointer-events-none" />
            <div className="absolute inset-7 sm:inset-8 rounded-full border border-white/35 pointer-events-none" />

            {/* Stamp Center: VTKS Psychedelic Name Insignia */}
            <div className="absolute inset-0 flex flex-col items-center justify-center -rotate-6 group-hover:rotate-0 transition-transform duration-500 select-none">
              <span 
                className="font-vtks text-[1.65rem] lg:text-[1.85rem] text-white tracking-widest leading-none select-none uppercase drop-shadow-[0_2px_14px_rgba(255,255,255,0.45)]"
                style={{
                  fontFamily: "'VTKS Psychedelic', cursive, sans-serif",
                }}
              >
                Sreeja
              </span>
              <span 
                className="font-vtks text-[1.65rem] lg:text-[1.85rem] text-white tracking-[0.22em] leading-none select-none uppercase mt-1 drop-shadow-[0_2px_14px_rgba(255,255,255,0.45)]"
                style={{
                  fontFamily: "'VTKS Psychedelic', cursive, sans-serif",
                }}
              >
                Das
              </span>
              <span className="font-mono text-[8.5px] lg:text-[9.5px] tracking-[0.3em] uppercase text-neutral-400 font-semibold mt-1.5">
                FOLIO '26
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic shifting descriptor line */}
        <div className="h-5 sm:h-6 overflow-hidden relative w-full my-0.5">
          <div
            className="transition-transform duration-700 ease-in-out flex flex-col"
            style={{ transform: `translateY(-${slideIdx * 24}px)` }}
          >
            {slides.map((text, i) => (
              <span
                key={i}
                className="font-mono text-xs tracking-widest font-semibold h-6 flex items-center transition-colors duration-500"
                style={{ color: hoveredNav ? activeTheme.hex : '#ffffff' }}
              >
                {text}
              </span>
            ))}
          </div>
        </div>

        <p className="text-neutral-400 text-xs sm:text-sm font-sans leading-relaxed opacity-85 max-w-sm pr-4">
          Engineering interactive systems, full-stack applications, and tactile digital experiences.
        </p>

        {/* Desktop Minimal Footer Stamp */}
        <div className="hidden md:flex items-center gap-4 font-mono text-[10px] text-neutral-500 tracking-wider pt-1">
          <span>PORTFOLIO 2026</span>
          <span className="opacity-30">|</span>
          <span 
            style={{ color: hoveredNav ? activeTheme.hex : '#e4e4e7' }} 
            className="transition-colors duration-500"
          >
            {activeTheme.label} TONE
          </span>
        </div>

      </div>

      {/* ── 9. PINK CADILLAC BIARRITZ 30-SECOND MOBILE EASTER EGG ── */}
      <PinkCadillacEasterEgg
        onTrigger={handleCadillacTrigger}
        onCatch={handleCadillacCatch}
        onDirectionChange={handleCadillacDirection}
      />

    </main>
  );
}