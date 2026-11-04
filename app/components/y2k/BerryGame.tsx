'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { retroAudio } from '../../utils/retroAudio';
import { Handheld, GameCard, SCREEN_W, SCREEN_H, readBest, saveBest } from './Handheld';

/**
 * Hidden "strawberry mode": Berry Basket, a tiny Game Boy-sized catch game.
 * Drag (or arrow keys) to move the gingham basket, catch berries, dodge beetles.
 * Unlocked from page.tsx (tap the pink ticker 5×, type "berry", or ?berry in the URL).
 */

const W = SCREEN_W;
const H = SCREEN_H;
const BASKET_Y = H - 14;
const BASKET_W = 16;
const BEST_KEY = 'berry_basket_best';

const PALETTE: Record<string, string> = {
  r: '#ff2e6e', // berry
  s: '#ffe7a3', // seed
  g: '#3fbf6a', // leaf
  y: '#ffd23f', // golden berry
  o: '#ff9a1f', // golden shade
  k: '#3a1530', // beetle / outline
  w: '#ffffff',
  p: '#ff8fbf', // gingham pink
  d: '#7a0044', // basket rim
  h: '#ff2e93', // heart
};

const SPRITES = {
  berry: ['..g.g..', '.ggggg.', 'rrrrrrr', 'rsrrsrr', 'rrrrrsr', '.rsrrr.', '..rrr..', '...r...'],
  golden: ['..g.g..', '.ggggg.', 'yyyyyyy', 'ysyysyy', 'yyyyoyy', '.yoyyy.', '..yyy..', '...y...'],
  beetle: ['.k...k.', '..kkk..', '.kkkkk.', 'kkwkwkk', 'kkkkkkk', '.kkkkk.', 'k.k.k.k'],
  basket: [
    'dddddddddddddddd',
    'dpwpwpwpwpwpwpwd',
    'dwpwpwpwpwpwpwpd',
    '.dpwpwpwpwpwpwd.',
    '.dwpwpwpwpwpwpd.',
    '..dddddddddddd..',
  ],
};
type Kind = 'berry' | 'golden' | 'beetle';

function drawSprite(ctx: CanvasRenderingContext2D, rows: string[], x: number, y: number) {
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const c = PALETTE[row[i]];
      if (!c) continue;
      ctx.fillStyle = c;
      ctx.fillRect(Math.round(x) + i, Math.round(y) + j, 1, 1);
    }
  });
}

interface Item { x: number; y: number; kind: Kind; vy: number }
interface Spark { x: number; y: number; vx: number; vy: number; life: number; color: string }

type Phase = 'title' | 'play' | 'over';


export function BerryGame({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>('title');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [best, setBest] = useState(() => readBest(BEST_KEY)); // client-only component (ssr: false)
  const [newBest, setNewBest] = useState(false);
  const targetX = useRef<number | null>(null);
  const keys = useRef({ left: false, right: false });

  const start = useCallback(() => {
    retroAudio.playCassetteInsert();
    setScore(0);
    setLives(3);
    setNewBest(false);
    setPhase('play');
  }, []);

  // Draw a still frame (title / game-over backdrop).
  const drawIdle = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    drawBg(ctx);
    drawSprite(ctx, SPRITES.berry, 30, 40);
    drawSprite(ctx, SPRITES.golden, 120, 30);
    drawSprite(ctx, SPRITES.beetle, 80, 60);
    drawSprite(ctx, SPRITES.berry, 100, 90);
    drawSprite(ctx, SPRITES.basket, (W - BASKET_W) / 2, BASKET_Y);
  }, []);

  useEffect(() => {
    if (phase !== 'play') drawIdle();
  }, [phase, drawIdle]);

  // Keyboard: arrows/A-D move, Escape closes, Space/Enter starts.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose();
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keys.current.right = true;
      if ((e.key === ' ' || e.key === 'Enter') && phase !== 'play') {
        e.preventDefault();
        start();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') keys.current.right = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [phase, onClose, start]);

  // The game loop: runs only while playing.
  useEffect(() => {
    if (phase !== 'play') return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    let basketX = (W - BASKET_W) / 2;
    let items: Item[] = [];
    let sparks: Spark[] = [];
    let t = 0;
    let spawnIn = 0.6;
    let s = 0;
    let l = 3;
    let flash = 0;
    let raf = 0;
    let last = performance.now();
    targetX.current = null;

    const burst = (x: number, y: number, color: string, n = 8) => {
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n;
        sparks.push({ x, y, vx: Math.cos(a) * 40, vy: Math.sin(a) * 40 - 20, life: 0.5, color });
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;

      // difficulty ramps over ~90s
      const ramp = Math.min(1, t / 90);
      const fall = 38 + ramp * 70;
      const every = 0.85 - ramp * 0.48;
      const beetleChance = 0.14 + ramp * 0.22;

      // move basket
      const speed = 150;
      // keys win: drop the mouse/touch target until the pointer moves again
      if (keys.current.left || keys.current.right) targetX.current = null;
      if (targetX.current !== null) {
        const goal = Math.max(0, Math.min(W - BASKET_W, targetX.current - BASKET_W / 2));
        const d = goal - basketX;
        basketX += Math.sign(d) * Math.min(Math.abs(d), speed * 1.6 * dt);
      }
      if (keys.current.left) basketX -= speed * dt;
      if (keys.current.right) basketX += speed * dt;
      basketX = Math.max(0, Math.min(W - BASKET_W, basketX));

      // spawn
      spawnIn -= dt;
      if (spawnIn <= 0) {
        spawnIn = every * (0.7 + Math.random() * 0.6);
        const r = Math.random();
        const kind: Kind = r < beetleChance ? 'beetle' : r < beetleChance + 0.06 ? 'golden' : 'berry';
        items.push({ x: 4 + Math.random() * (W - 15), y: -8, kind, vy: fall * (0.85 + Math.random() * 0.3) });
      }

      // update items + catches
      const next: Item[] = [];
      for (const it of items) {
        it.y += it.vy * dt;
        const caught = it.y + 7 >= BASKET_Y && it.y <= BASKET_Y + 3 && it.x + 6 >= basketX && it.x <= basketX + BASKET_W - 1;
        if (caught) {
          if (it.kind === 'beetle') {
            l -= 1;
            flash = 0.25;
            setLives(l);
            burst(it.x + 3, BASKET_Y, PALETTE.k, 10);
            retroAudio.playButtonClack();
            try {
              navigator.vibrate?.(80);
            } catch {
              /* no haptics */
            }
          } else {
            const pts = it.kind === 'golden' ? 5 : 1;
            s += pts;
            setScore(s);
            burst(it.x + 3, BASKET_Y, it.kind === 'golden' ? PALETTE.y : PALETTE.p, it.kind === 'golden' ? 14 : 8);
            retroAudio.playNote(it.kind === 'golden' ? 1318 : 660 + (s % 5) * 110, 0.25, 0.08);
          }
          continue;
        }
        if (it.y < H) next.push(it);
      }
      items = next;

      sparks = sparks.filter((p) => (p.life -= dt) > 0);
      for (const p of sparks) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 120 * dt;
      }

      // draw
      drawBg(ctx);
      for (const it of items) drawSprite(ctx, SPRITES[it.kind], it.x, it.y);
      for (const p of sparks) {
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
      }
      drawSprite(ctx, SPRITES.basket, basketX, BASKET_Y);
      if (flash > 0) {
        flash -= dt;
        ctx.fillStyle = 'rgba(58,21,48,0.35)';
        ctx.fillRect(0, 0, W, H);
      }

      if (l <= 0) {
        const result = saveBest(BEST_KEY, s);
        setNewBest(result.isNew);
        setBest(result.best);
        retroAudio.playTapeWhirr();
        setPhase('over');
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const pointTo = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    targetX.current = ((e.clientX - rect.left) / rect.width) * W;
  };

  return (
    <Handheld
      brand="🍓 BERRY BOY"
      label="Berry Basket mini game"
      active={phase === 'play'}
      hint="drag on the screen · ← → on a keyboard"
      onClose={onClose}
      screenProps={{
        onPointerDown: pointTo,
        onPointerMove: (e) => (e.pointerType === 'mouse' || e.buttons) && pointTo(e),
      }}
    >
      <canvas ref={canvasRef} width={W} height={H} className="absolute inset-0 w-full h-full [image-rendering:pixelated]" />

      {/* HUD */}
      <div className="absolute inset-x-0 top-0 flex justify-between px-2 pt-1 font-pixel text-lg leading-none text-[#7a0044] pointer-events-none">
        <span>🍓 {score}</span>
        <span aria-label={`${lives} lives`}>
          {'♥'.repeat(Math.max(0, lives))}
          <span className="opacity-25">{'♥'.repeat(Math.max(0, 3 - lives))}</span>
        </span>
      </div>

      {phase !== 'play' && (
        <GameCard title={phase === 'title' ? 'Berry Basket' : 'game over'} best={best} again={phase === 'over'} onStart={start}>
          {phase === 'title' ? (
            <p className="font-pixel text-base text-[#7a0044] leading-tight mt-1">
              drag to catch berries 🍓
              <br />
              golden = +5 · dodge beetles!
            </p>
          ) : (
            <p className="font-pixel text-xl text-[#7a0044] leading-none mt-1">
              {score} berries{newBest ? ' · NEW BEST!' : ''}
            </p>
          )}
        </GameCard>
      )}
    </Handheld>
  );
}

/** Pale pink screen with faint gingham checks. */
function drawBg(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#ffe1ef';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,111,168,0.12)';
  for (let x = 0; x < W; x += 16) ctx.fillRect(x, 0, 8, H);
  for (let y = 0; y < H; y += 16) ctx.fillRect(0, y, W, 8);
  ctx.fillStyle = '#ffc2dc';
  ctx.fillRect(0, H - 6, W, 6);
}
