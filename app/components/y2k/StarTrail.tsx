'use client';

import React, { useEffect, useRef } from 'react';
import { BUTTERFLY_SPRITE } from './Ornaments';

/**
 * Cursor trail: little butterflies flutter off the cursor (with the odd
 * sparkle). Pairs with the butterfly cursor set in app/y2k.css
 * (html.y2k-cursor). Desktop pointers only; off for reduced motion.
 */

const COLORS = [
  { fill: '#ffffff', glow: '#ff5fd0' },
  { fill: '#ff7be0', glow: '#c800a8' },
  { fill: '#e2c6ff', glow: '#b98cff' },
  { fill: '#ffd6f0', glow: '#ff2e93' },
];

interface Flyer {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  phase: number;
  flapSpeed: number;
  tilt: number;
  kind: 'butterfly' | 'sparkle';
  color: (typeof COLORS)[number];
  colorIndex: number;
}

/** Same sprite as the wallpaper butterflies, pre-tinted once per colour. */
function tintedSprites(img: HTMLImageElement) {
  return COLORS.map(({ fill }) => {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const x = c.getContext('2d')!;
    x.drawImage(img, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = fill;
    x.fillRect(0, 0, c.width, c.height);
    return c;
  });
}

function drawButterfly(ctx: CanvasRenderingContext2D, f: Flyer, sprite: HTMLCanvasElement | undefined) {
  if (!sprite) return;
  const r = f.size;
  ctx.save();
  // fly, don't squash: little bob + bank, sprite keeps its exact shape
  ctx.translate(f.x, f.y + Math.sin(f.phase) * 1.5);
  ctx.rotate(f.tilt + Math.sin(f.phase * 0.5) * 0.18);
  ctx.globalAlpha = Math.min(1, f.life * 1.4);
  ctx.shadowColor = f.color.glow;
  ctx.shadowBlur = 10;
  ctx.drawImage(sprite, -r, -r, r * 2, r * 2);
  ctx.restore();
}

function drawSparkle(ctx: CanvasRenderingContext2D, f: Flyer) {
  const r = f.size * f.life;
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate(f.phase);
  ctx.globalAlpha = f.life;
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#ff2e93';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.quadraticCurveTo(r * 0.15, -r * 0.15, r, 0);
  ctx.quadraticCurveTo(r * 0.15, r * 0.15, 0, r);
  ctx.quadraticCurveTo(-r * 0.15, r * 0.15, -r, 0);
  ctx.quadraticCurveTo(-r * 0.15, -r * 0.15, 0, -r);
  ctx.fill();
  ctx.restore();
}

export function StarTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // mouse: butterfly cursor + trail. touch: a burst of butterflies on each tap.
    const fine = window.matchMedia('(pointer: fine)').matches;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const flyers: Flyer[] = [];
    let sprites: HTMLCanvasElement[] = [];
    const img = new Image();
    img.onload = () => {
      sprites = tintedSprites(img);
    };
    img.src = BUTTERFLY_SPRITE;
    let last = 0;
    let n = 0;
    const spawn = (x: number, y: number, butterfly: boolean, burst = false) => {
      flyers.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + 6,
        vx: (Math.random() - 0.5) * (burst ? 4 : 1.4),
        vy: butterfly ? (burst ? -1 - Math.random() * 1.8 : -0.5 - Math.random() * 0.8) : 0.3,
        size: butterfly ? 8 + Math.random() * 6 : 4 + Math.random() * 3,
        life: 1,
        phase: Math.random() * Math.PI,
        flapSpeed: 0.28 + Math.random() * 0.12,
        tilt: (Math.random() - 0.5) * 0.6,
        kind: butterfly ? 'butterfly' : 'sparkle',
        colorIndex: Math.floor(Math.random() * COLORS.length),
        color: COLORS[0],
      });
      if (flyers.length > 40) flyers.shift();
      wake();
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const now = performance.now();
      if (now - last < 70) return;
      last = now;
      spawn(e.clientX, e.clientY, n++ % 3 !== 2);
    };
    const onTap = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      for (let i = 0; i < 6; i++) spawn(e.clientX, e.clientY, i !== 5, true);
    };

    // The loop only runs while something is flying; it sleeps otherwise.
    let raf = 0;
    let running = false;
    const tick = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = flyers.length - 1; i >= 0; i--) {
        const f = flyers[i];
        f.phase += f.flapSpeed;
        f.x += f.vx + Math.sin(f.phase * 0.25) * 0.4;
        f.y += f.vy;
        f.life -= f.kind === 'butterfly' ? 0.011 : 0.03;
        if (f.life <= 0) {
          flyers.splice(i, 1);
          continue;
        }
        if (f.kind === 'butterfly') drawButterfly(ctx, { ...f, color: COLORS[f.colorIndex] }, sprites[f.colorIndex]);
        else drawSparkle(ctx, f);
      }
      if (flyers.length) raf = requestAnimationFrame(tick);
      else running = false;
    };
    const wake = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    // butterfly cursor on while this is mounted (fun mode, mouse users only)
    if (fine) document.documentElement.classList.add('y2k-cursor');
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerdown', onTap, { passive: true });
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('y2k-cursor');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onTap);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="fixed inset-0 w-full h-full pointer-events-none z-[60]" />;
}
