"use client";

import React from "react";
import Image from "next/image";

export type PortraitPose = "normal" | "surprised" | "hello" | "showing" | "think_left" | "think_right";

interface SreejaPortraitProps {
  className?: string;
  pose: PortraitPose;
  thought: string;
  shiftBubbleRight?: boolean;
  isAboutHover?: boolean;
  showPixelExclamation?: boolean;
  onPortraitClick?: () => void;
  onThoughtClick?: () => void;
}

const POSE_CONFIG: Record<PortraitPose, { src: string; alt: string; scaleClass: string }> = {
  normal: { src: "/images/sreeja/sreeja_normal_cutout.webp", alt: "Sreeja - Calm Editorial", scaleClass: "scale-100" },
  surprised: { src: "/images/sreeja/sreeja_surprised_cutout.webp", alt: "Sreeja - Surprised Reaction", scaleClass: "scale-100" },
  hello: { src: "/images/sreeja/sreeja_full_hello_cutout.webp", alt: "Sreeja - Peace Sign Hello", scaleClass: "scale-100" },
  showing: { src: "/images/sreeja/sreeja_showing_right_cutout.webp", alt: "Sreeja - Showing Sections On Right", scaleClass: "scale-[1.02]" },
  think_left: { src: "/images/sreeja/sreeja_think_left_cutout.webp", alt: "Sreeja - Thinking Left (Eyes Right Toward Sections)", scaleClass: "scale-[1.10]" },
  think_right: { src: "/images/sreeja/sreeja_think_right_cutout.webp", alt: "Sreeja - Thinking Right (Eyes Left)", scaleClass: "scale-[1.10]" },
};

export default function SreejaPortrait({
  className = "",
  pose = "normal",
  thought,
  shiftBubbleRight = false,
  isAboutHover = false,
  showPixelExclamation = false,
  onPortraitClick,
  onThoughtClick,
}: SreejaPortraitProps) {
  const isShifted = shiftBubbleRight || isAboutHover;

  return (
    <div
      className={`relative select-none flex items-end justify-center ${className}`}
      onClick={onPortraitClick}
    >
      {/* ── RETRO 8-BIT ELONGATED PIXEL EXCLAMATION MARK (SNUG BY RIGHT SIDE OF HEAD ON MOBILE ONLY) ── */}
      {showPixelExclamation && (
        <div className="block md:hidden absolute top-[38%] sm:top-[40%] left-[58%] sm:left-[60%] z-50 pointer-events-none animate-bounce">
          <svg
            width="22"
            height="58"
            viewBox="0 0 14 42"
            fill="none"
            style={{ filter: "drop-shadow(3px 3px 0px rgba(0, 0, 0, 0.85))" }}
          >
            {/* Upper Exclamation Bar (3px Black Pixel Border with Crisp White Interior) */}
            <rect x="1" y="1" width="12" height="27" fill="black" />
            <rect x="0" y="3" width="14" height="23" fill="black" />
            <rect x="3" y="4" width="8" height="21" fill="white" />

            {/* Stepped Pixel Dot (3px Black Pixel Border with Crisp White Interior) */}
            <rect x="2" y="32" width="10" height="9" fill="black" />
            <rect x="1" y="33" width="12" height="7" fill="black" />
            <rect x="4" y="34" width="6" height="5" fill="white" />
          </svg>
        </div>
      )}

      {/* ── DESKTOP RETRO 8-BIT PIXEL SPEECH BUBBLE (NEXT TO HEAD WITH TAIL) ── */}
      <div
        className={`hidden md:block absolute top-[28%] sm:top-[30%] md:top-[32%] -right-4 sm:-right-8 md:-right-12 lg:-right-16 z-50 pointer-events-auto cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95 ${
          isShifted ? 'md:translate-x-10 lg:translate-x-14' : ''
        }`}
        style={{
          filter: "drop-shadow(4px 4px 0px rgba(0, 0, 0, 0.85))",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onThoughtClick ? onThoughtClick() : onPortraitClick && onPortraitClick();
        }}
      >
        <div className="relative group">
          {/* White Pixel Box with Black Border & Stepped Corners */}
          <div
            className="relative px-5 sm:px-6 py-2 sm:py-2.5 bg-white text-black font-mono font-bold text-xs sm:text-[13px] tracking-wider uppercase border-[3px] border-black select-none"
            style={{
              clipPath: "polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))"
            }}
          >
            <span className="whitespace-nowrap drop-shadow-none">{thought}</span>
          </div>

          {/* Stepped Pixel Tail pointing Down-Left toward Head */}
          <svg
            className="absolute -bottom-[14px] left-6 w-6 h-4 overflow-visible pointer-events-none"
            viewBox="0 0 24 16"
            fill="none"
          >
            <rect x="4" y="0" width="16" height="5" fill="white" />
            <rect x="2" y="5" width="14" height="5" fill="white" />
            <rect x="0" y="10" width="10" height="5" fill="white" />
            <rect x="20" y="0" width="3" height="5" fill="black" />
            <rect x="16" y="5" width="3" height="5" fill="black" />
            <rect x="10" y="10" width="3" height="6" fill="black" />
            <rect x="0" y="15" width="10" height="3" fill="black" />
            <rect x="0" y="10" width="3" height="5" fill="black" />
            <rect x="2" y="5" width="3" height="5" fill="black" />
          </svg>
        </div>
      </div>

      {/* ── MOBILE GAME CHARACTER DIALOGUE BOX (FLOATING OVER LOWER TORSO ABOVE CONTROLS) ── */}
      <div
        className="block md:hidden absolute bottom-3 sm:bottom-4 inset-x-2 z-50 pointer-events-auto cursor-pointer transition-all duration-300 active:scale-95"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
          filter: "drop-shadow(3px 3px 0px rgba(0, 0, 0, 0.95))",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onThoughtClick ? onThoughtClick() : onPortraitClick && onPortraitClick();
        }}
      >
        <div
          className="relative px-4 py-2.5 bg-white text-black font-mono font-bold text-[11px] sm:text-xs tracking-wider uppercase border-[3px] border-black text-center select-none"
          style={{
            clipPath: "polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))"
          }}
        >
          <span className="leading-tight block drop-shadow-none">{thought}</span>
        </div>
      </div>

      {/* ── ENLARGED PORTRAIT CUTOUTS (HEIGHT-ADAPTIVE TO SCREEN RESOLUTION) ── */}
      <div className="relative w-full h-full cursor-pointer group flex items-end justify-center scale-[1.20] sm:scale-[1.26] md:scale-100 portrait-mobile-adaptive origin-bottom translate-y-1 sm:translate-y-1.5 md:translate-y-0 transition-transform duration-500">
        
        {/* Soft Ambient Radial Backlight */}
        <div
          className="absolute inset-0 -inset-y-16 bg-radial from-white/[0.09] via-transparent to-transparent pointer-events-none rounded-full blur-3xl transition-opacity duration-500"
          style={{ opacity: pose === "surprised" ? 0.95 : 0.45 }}
        />

        {/* Render all poses flush to the bottom with smooth crossfading */}
        {(Object.keys(POSE_CONFIG) as PortraitPose[]).map((p) => {
          const isActive = pose === p;
          const { src, alt, scaleClass } = POSE_CONFIG[p];

          return (
            <div
              key={p}
              className={`absolute bottom-0 inset-x-0 w-full h-full transition-all duration-700 ease-in-out flex items-end justify-center origin-bottom ${
                isActive
                  ? `opacity-100 ${scaleClass} z-30 pointer-events-auto`
                  : "opacity-0 scale-[0.98] z-0 pointer-events-none"
              }`}
            >
              <Image
                src={src}
                alt={alt}
                width={1280}
                height={960}
                priority={p === "normal" || p === "surprised"}
                className="w-full h-full max-h-[92vh] object-contain object-bottom drop-shadow-2xl"
              />
            </div>
          );
        })}

      </div>
    </div>
  );
}
