'use client';

import React, { useEffect, useRef } from 'react';

interface GlowEmber {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export function PixelCursorTrail({ activeColor }: { activeColor?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Real mouse target position
  const targetPosRef = useRef<{ x: number; y: number; visible: boolean }>({
    x: -200,
    y: -200,
    visible: false,
  });

  // Smooth lerped position for butter-smooth gliding
  const smoothPosRef = useRef<{ x: number; y: number }>({ x: -200, y: -200 });
  const scaleRef = useRef(1);
  const embersRef = useRef<GlowEmber[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Only enable on pointer-fine (desktop mouse) devices
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const handlePointerMove = (e: PointerEvent) => {
      targetPosRef.current.x = e.clientX;
      targetPosRef.current.y = e.clientY;
      targetPosRef.current.visible = true;

      // Snap on first entry so it doesn't swoop across screen
      if (smoothPosRef.current.x < 0) {
        smoothPosRef.current.x = e.clientX;
        smoothPosRef.current.y = e.clientY;
      }

      // Occasionally release a soft luminous firefly ember
      if (Math.random() < 0.25) {
        const theme = activeColor || '#ffffff';
        embersRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 8,
          y: e.clientY + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -0.3 - Math.random() * 0.3, // gentle upward float
          size: Math.random() * 1.4 + 0.8,
          alpha: 0.8,
          decay: 0.016 + Math.random() * 0.01,
          color: theme,
        });

        if (embersRef.current.length > 35) {
          embersRef.current.shift();
        }
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      // Gentle expanding ripple of light on click
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 4,
        maxRadius: 42,
        alpha: 0.6,
        color: activeColor || '#ffffff',
      });
    };

    const handlePointerLeave = () => {
      targetPosRef.current.visible = false;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('mousedown', handlePointerDown, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const target = targetPosRef.current;
      const smooth = smoothPosRef.current;

      // ── 1. SMOOTH INERTIA LERP ──
      // 0.32 lerp speed gives a silky, responsive float
      smooth.x += (target.x - smooth.x) * 0.32;
      smooth.y += (target.y - smooth.y) * 0.32;

      // Smoothly expand orb slightly when hovering active navigation items
      const targetScale = activeColor ? 1.25 : 1.0;
      scaleRef.current += (targetScale - scaleRef.current) * 0.12;

      const theme = activeColor || '#ffffff';
      const curX = smooth.x;
      const curY = smooth.y;

      // ── 2. DRAW CLICK LIGHT RIPPLES ──
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += (r.maxRadius - r.radius) * 0.14;
        r.alpha -= 0.025;

        if (r.alpha <= 0) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, r.alpha);
        ctx.strokeStyle = r.color;
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 8;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // ── 3. DRAW SOFT BIOLUMINESCENT EMBERS ──
      const embers = embersRef.current;
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.x += e.vx;
        e.y += e.vy;
        e.alpha -= e.decay;

        if (e.alpha <= 0) {
          embers.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, e.alpha);
        ctx.fillStyle = e.color;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ── 4. DRAW COMPACT WHITE GLOWY ORB (DELICATE ILLUMINATION) ──
      if (target.visible && curX > 0 && curY > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        const orbScale = scaleRef.current;

        // Layer 1: Outer Soft Ambient Aura (Subtle & compact)
        const outerGrad = ctx.createRadialGradient(curX, curY, 0, curX, curY, 48 * orbScale);
        outerGrad.addColorStop(0, hexToRgba(theme, 0.22));
        outerGrad.addColorStop(0.5, hexToRgba(theme, 0.08));
        outerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = outerGrad;
        ctx.beginPath();
        ctx.arc(curX, curY, 48 * orbScale, 0, Math.PI * 2);
        ctx.fill();

        // Layer 2: Mid Luminous Bloom Halo
        const midGrad = ctx.createRadialGradient(curX, curY, 0, curX, curY, 18 * orbScale);
        midGrad.addColorStop(0, hexToRgba(theme, 0.55));
        midGrad.addColorStop(0.65, hexToRgba(theme, 0.18));
        midGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = midGrad;
        ctx.beginPath();
        ctx.arc(curX, curY, 18 * orbScale, 0, Math.PI * 2);
        ctx.fill();

        // Layer 3: Crisp Glowing Pearl Core
        const coreGrad = ctx.createRadialGradient(curX, curY, 0, curX, curY, 4.5 * orbScale);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.5, hexToRgba(theme, 0.95));
        coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = coreGrad;
        ctx.shadowColor = theme;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(curX, curY, 4.5 * orbScale, 0, Math.PI * 2);
        ctx.fill();

        // Layer 4: Focal Diamond Point
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(curX, curY, 1.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('mouseleave', handlePointerLeave);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeColor]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
    />
  );
}

// Utility: convert hex color string to rgba string with custom alpha
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgba(255, 255, 255, ${alpha})`;
}
