'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { retroAudio } from '../../utils/retroAudio';
import { Handheld, GameCard, SCREEN_W as W, SCREEN_H as H, readBest, saveBest } from './Handheld';

/**
 * Disc Stacker: a one-tap timing game. A CD case slides across; tap to drop it
 * on the stack. Whatever hangs over the edge is sliced off, so the stack gets
 * narrower. Land it (nearly) exactly and you keep the full width.
 * Opened from the arcade box in the About profile.
 */

const LAYER = 8;
const BASE_W = 72;
const FLOOR = H - 8;
const PERFECT_PX = 2;
const BEST_KEY = 'disc_stacker_best';
// project-ish colourways, cycled up the stack
const CASES = ['#ff5fb0', '#c9a7ff', '#7fe3ff', '#ffd23f', '#ff8f6b', '#8fe3a8'];

interface Layer { x: number; w: number; color: string }
interface Chunk { x: number; y: number; w: number; color: string; vy: number; spin: number }
type Phase = 'title' | 'play' | 'over';

function drawCase(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, color: string) {
  x = Math.round(x);
  y = Math.round(y);
  w = Math.max(1, Math.round(w));
  ctx.fillStyle = '#3a1530';
  ctx.fillRect(x, y, w, LAYER); // outline
  ctx.fillStyle = color;
  ctx.fillRect(x + 1, y + 1, Math.max(0, w - 2), LAYER - 2);
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.fillRect(x + 1, y + 1, Math.max(0, w - 2), 1); // shine
  if (w > 8) {
    ctx.fillStyle = 'rgba(58,21,48,0.35)';
    ctx.fillRect(x + 3, y + 1, 1, LAYER - 2); // spine hinge
  }
}

function drawBg(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#ffe1ef';
  ctx.fillRect(0, 0, W, H);
  // scanlines
  ctx.fillStyle = 'rgba(255,111,168,0.08)';
  for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
}

export function DiscStacker({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>('title');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => readBest(BEST_KEY)); // client-only component (ssr: false)
  const [newBest, setNewBest] = useState(false);
  const [perfectAt, setPerfectAt] = useState(0); // bumps to re-trigger the "perfect!" pop
  const dropRef = useRef<() => void>(() => {});

  const start = useCallback(() => {
    retroAudio.playCassetteInsert();
    setScore(0);
    setNewBest(false);
    setPhase('play');
  }, []);

  useEffect(() => {
    if (!perfectAt) return;
    const id = setTimeout(() => setPerfectAt(0), 650);
    return () => clearTimeout(id);
  }, [perfectAt]);

  // Still frame between rounds.
  useEffect(() => {
    if (phase === 'play') return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    drawBg(ctx);
    for (let i = 0; i < 6; i++) drawCase(ctx, (W - BASE_W) / 2 + ((i * 7) % 11) - 5, FLOOR - (i + 1) * LAYER, BASE_W - i * 6, CASES[i % CASES.length]);
  }, [phase]);

  // Space / Enter / ↓ drops (or starts); Escape closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose();
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (e.repeat) return;
        if (phase === 'play') dropRef.current();
        else start();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, onClose, start]);

  useEffect(() => {
    if (phase !== 'play') return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const stack: Layer[] = [{ x: (W - BASE_W) / 2, w: BASE_W, color: '#5a2a48' }];
    let chunks: Chunk[] = [];
    let mover = { x: 0, w: BASE_W, dir: 1 };
    let cam = 0;
    let s = 0;
    let over = false;
    let raf = 0;
    let last = performance.now();

    const speed = () => Math.min(150, 55 + s * 4.5);
    const nextMover = () => {
      const top = stack[stack.length - 1];
      const dir = stack.length % 2 ? 1 : -1;
      mover = { x: dir > 0 ? -top.w / 2 : W - top.w / 2, w: top.w, dir }; // enters half on screen
    };
    nextMover();

    const finish = () => {
      over = true;
      const r = saveBest(BEST_KEY, s);
      setNewBest(r.isNew);
      setBest(r.best);
      retroAudio.playTapeWhirr();
      try {
        navigator.vibrate?.(120);
      } catch {
        /* no haptics */
      }
      // let the last case tumble for a moment before the card appears
      setTimeout(() => setPhase('over'), 700);
    };

    dropRef.current = () => {
      if (over) return;
      const top = stack[stack.length - 1];
      const color = CASES[stack.length % CASES.length];
      const y = FLOOR - (stack.length + 1) * LAYER;
      const L = Math.max(mover.x, top.x);
      const R = Math.min(mover.x + mover.w, top.x + top.w);
      if (R - L <= 0) {
        chunks.push({ x: mover.x, y, w: mover.w, color, vy: 0, spin: mover.dir });
        return finish();
      }
      if (Math.abs(mover.x - top.x) <= PERFECT_PX) {
        stack.push({ x: top.x, w: top.w, color });
        setPerfectAt(Date.now());
        retroAudio.playNote(880 + Math.min(s, 12) * 60, 0.3, 0.12);
      } else {
        stack.push({ x: L, w: R - L, color });
        // the sliced-off overhang falls away
        if (mover.x < L) chunks.push({ x: mover.x, y, w: L - mover.x, color, vy: 0, spin: -1 });
        if (mover.x + mover.w > R) chunks.push({ x: R, y, w: mover.x + mover.w - R, color, vy: 0, spin: 1 });
        retroAudio.playNote(440 + Math.min(s, 16) * 30, 0.22, 0.07);
      }
      s += 1;
      setScore(s);
      nextMover();
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!over) {
        mover.x += mover.dir * speed() * dt;
        // bounce at the walls (it can start off-screen, so only turn once it's heading out)
        if (mover.dir > 0 && mover.x + mover.w > W + 4) mover.dir = -1;
        if (mover.dir < 0 && mover.x < -4) mover.dir = 1;
      }

      // camera follows the top of the stack, keeping ~5 layers of headroom
      const topY = FLOOR - (stack.length + 1) * LAYER;
      const want = Math.max(0, 40 - topY);
      cam += (want - cam) * Math.min(1, dt * 6);

      chunks = chunks.filter((c) => c.y - cam < H + 20);
      for (const c of chunks) {
        c.vy += 260 * dt;
        c.y += c.vy * dt;
        c.x += c.spin * 12 * dt;
      }

      drawBg(ctx);
      ctx.save();
      ctx.translate(0, Math.round(cam));
      // floor
      ctx.fillStyle = '#ffc2dc';
      ctx.fillRect(0, FLOOR, W, H);
      stack.forEach((l, i) => drawCase(ctx, l.x, FLOOR - (i + 1) * LAYER, l.w, l.color));
      for (const c of chunks) drawCase(ctx, c.x, c.y, c.w, c.color);
      if (!over) drawCase(ctx, mover.x, topY, mover.w, CASES[stack.length % CASES.length]);
      ctx.restore();

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      dropRef.current = () => {};
    };
  }, [phase]);

  return (
    <Handheld
      brand="💿 DISC BOY"
      label="Disc Stacker mini game"
      active={phase === 'play'}
      hint="tap the screen to drop · space on a keyboard"
      onClose={onClose}
      screenProps={{ onPointerDown: () => phase === 'play' && dropRef.current() }}
    >
      <canvas ref={canvasRef} width={W} height={H} className="absolute inset-0 w-full h-full [image-rendering:pixelated]" />

      <div className="absolute inset-x-0 top-0 flex justify-between px-2 pt-1 font-pixel text-lg leading-none text-[#7a0044] pointer-events-none">
        <span>💿 {score}</span>
        <span className="opacity-60">best {best}</span>
      </div>
      {phase === 'play' && perfectAt > 0 && (
        <span key={perfectAt} className="absolute left-1/2 top-[22%] -translate-x-1/2 font-pixel text-xl text-[#ff2e6e] animate-pop-in pointer-events-none [text-shadow:0_0_4px_#fff]">
          perfect! ✦
        </span>
      )}

      {phase !== 'play' && (
        <GameCard title={phase === 'title' ? 'Disc Stacker' : 'stack fell!'} best={best} again={phase === 'over'} onStart={start}>
          {phase === 'title' ? (
            <p className="font-pixel text-base text-[#7a0044] leading-tight mt-1">
              tap to drop each CD case 💿
              <br />
              overhang gets sliced off!
            </p>
          ) : (
            <p className="font-pixel text-xl text-[#7a0044] leading-none mt-1">
              {score} discs high{newBest ? ' · NEW BEST!' : ''}
            </p>
          )}
        </GameCard>
      )}
    </Handheld>
  );
}
