"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface PinkCadillacEasterEggProps {
  onTrigger?: () => void;
  onCatch?: () => void;
  onDirectionChange?: (dir: "left" | "right") => void;
}

export default function PinkCadillacEasterEgg({
  onTrigger,
  onCatch,
  onDirectionChange,
}: PinkCadillacEasterEggProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isCaught, setIsCaught] = useState(false);

  const carRef = React.useRef<HTMLDivElement>(null);
  const currentDirRef = React.useRef<"left" | "right" | null>(null);

  const onTriggerRef = React.useRef(onTrigger);
  const onCatchRef = React.useRef(onCatch);
  const onDirectionChangeRef = React.useRef(onDirectionChange);

  useEffect(() => {
    onTriggerRef.current = onTrigger;
    onCatchRef.current = onCatch;
    onDirectionChangeRef.current = onDirectionChange;
  });

  // Track car's real-time position across the screen to switch Sreeja's eyes
  useEffect(() => {
    if (!isVisible || isCaught) return;

    const checkInterval = setInterval(() => {
      if (!carRef.current) return;
      const rect = carRef.current.getBoundingClientRect();
      const carCenterX = rect.left + rect.width / 2;
      const screenCenterX = window.innerWidth / 2;
      const newDir: "left" | "right" = carCenterX >= screenCenterX ? "right" : "left";

      if (newDir !== currentDirRef.current) {
        currentDirRef.current = newDir;
        if (onDirectionChangeRef.current) {
          onDirectionChangeRef.current(newDir);
        }
      }
    }, 120);

    return () => clearInterval(checkInterval);
  }, [isVisible, isCaught]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Cadillac easter egg is strictly for mobile phone screens
    if (window.innerWidth >= 768) return;

    // 30 seconds timer on mobile homepage (never reset by parent re-renders)
    const timer = setTimeout(() => {
      setIsVisible(true);
      if (onTriggerRef.current) onTriggerRef.current();
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleCatchCar = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isCaught) return;

    setIsCaught(true);
    if (onCatch) onCatch();

    // Small celebration delay before opening store
    setTimeout(() => {
      window.open("https://thediecaststore.in", "_blank", "noopener,noreferrer");
    }, 650);
  };

  if (!isVisible) return null;

  return (
    <div className="md:hidden fixed inset-0 pointer-events-none z-50 overflow-hidden select-none">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes cadillacOrbit {
              0% {
                transform: translate3d(-20vw, 24vh, 0) rotate(15deg);
              }
              18% {
                transform: translate3d(20vw, 28vh, 0) rotate(22deg);
              }
              36% {
                transform: translate3d(52vw, 40vh, 0) rotate(35deg);
              }
              50% {
                transform: translate3d(76vw, 56vh, 0) rotate(135deg);
              }
              68% {
                transform: translate3d(45vw, 66vh, 0) rotate(195deg);
              }
              82% {
                transform: translate3d(18vw, 48vh, 0) rotate(285deg);
              }
              92% {
                transform: translate3d(36vw, 26vh, 0) rotate(350deg);
              }
              100% {
                transform: translate3d(120vw, 32vh, 0) rotate(375deg);
              }
            }

            .animate-cadillac-cruise {
              animation: cadillacOrbit 14s cubic-bezier(0.4, 0, 0.2, 1) infinite;
              will-change: transform;
            }

            @keyframes cadillacCaughtBurst {
              0% {
                transform: scale(1) rotate(0deg);
                opacity: 1;
              }
              50% {
                transform: scale(1.35) rotate(15deg);
                filter: brightness(1.6) drop-shadow(0 0 20px #ff69b4);
                opacity: 1;
              }
              100% {
                transform: scale(0.2) translate3d(100px, -200px, 0) rotate(45deg);
                opacity: 0;
              }
            }

            .animate-cadillac-caught {
              animation: cadillacCaughtBurst 0.65s forwards ease-out !important;
            }
          `,
        }}
      />

      {/* Floating Cruising Pink Cadillac Biarritz */}
      <div
        ref={carRef}
        className={`absolute top-0 left-0 cursor-pointer pointer-events-auto transition-transform active:scale-90 ${
          isCaught ? "animate-cadillac-caught" : "animate-cadillac-cruise"
        }`}
        onClick={handleCatchCar}
        onTouchEnd={handleCatchCar}
      >
        <div className="relative group flex flex-col items-center">
          {/* Cadillac Vector Graphic with retro pink aura */}
          <div
            className="w-32 sm:w-36 md:w-44 lg:w-48 h-auto transition-transform hover:scale-110"
            style={{
              filter:
                "drop-shadow(0 6px 12px rgba(0, 0, 0, 0.75)) drop-shadow(0 0 14px rgba(242, 162, 188, 0.55))",
            }}
          >
            <Image
              src="/images/pink_cadillac_biarritz.svg"
              alt="1959 Pink Cadillac Eldorado Biarritz"
              width={360}
              height={144}
              priority
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
