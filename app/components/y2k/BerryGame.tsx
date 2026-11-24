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
  c: '#ff8fbf', // basket check pink
  d: '#7a0044', // basket rim
  h: '#ff2e93', // heart
};

const SPRITES = {
  berry: ['..g.g..', '.ggggg.', 'rrrrrrr', 'rsrrsrr', 'rrrrrsr', '.rsrrr.', '..rrr..', '...r...'],
  golden: ['..g.g..', '.ggggg.', 'yyyyyyy', 'ysyysyy', 'yyyyoyy', '.yoyyy.', '..yyy..', '...y...'],
  heart: ['.hh.hh.', 'hhhhhhh', 'hwhhhhh', 'hhhhhhh', '.hhhhh.', '..hhh..', '...h...'],
  beetle: ['.k...k.', '..kkk..', '.kkkkk.', 'kkwkwkk', 'kkkkkkk', '.kkkkk.', 'k.k.k.k'],
  basket: [
    'dddddddddddddddd',
    'dcwcwcwcwcwcwcwd',
    'dwcwcwcwcwcwcwcd',
    '.dcwcwcwcwcwcwd.',
    '.dwcwcwcwcwcwcd.',
    '..dddddddddddd..',
  ],
};
type Kind = 'berry' | 'golden' | 'beetle' | 'heart';

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

interface Item { x: number; y: number; kind: Kind; vy: number; x0: number; wob: number }
interface Pop { x: number; y: number; text: string; life: number }
interface Spark { x: number; y: number; vx: number; vy: number; life: number; color: string }

type Phase = 'title' | 'play' | 'over';


export function BerryGame({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>('title');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [banner, setBanner] = useState<string | null>(null);
  const [best, setBest] = useState(() => readBest(BEST_KEY)); // client-only component (ssr: false)
  const [newBest, setNewBest] = useState(false);
  const targetX = useRef<number | null>(null);
  const keys = useRef({ left: false, right: false });

  const start = useCallback(() => {
    retroAudio.playCassetteInsert();
    setScore(0);
    setLives(3);
    setCombo(0);
    setBanner(null);
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
    let pops: Pop[] = [];
    let c = 0; // combo: berries in a row without dropping one or touching a beetle
    let shower = 0; // seconds left of a berry shower
    let nextShower = 25; // points until the next one
    let shake = 0;
    const mult = () => 1 + Math.min(4, Math.floor(c / 5));
    const say = (text: string, ms = 1400) => {
      setBanner(text);
      window.setTimeout(() => setBanner((b) => (b === text ? null : b)), ms);
    };
    const breakCombo = () => {
      if (c >= 5) say('combo lost…', 900);
      c = 0;
      setCombo(0);
    };
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

      // difficulty ramps over ~60s
      const ramp = Math.min(1, t / 60);
      const fall = 44 + ramp * 80;
      const every = shower > 0 ? 0.12 : 0.75 - ramp * 0.42;
      const beetleChance = shower > 0 ? 0 : 0.16 + ramp * 0.22;
      if (shower > 0) shower -= dt;

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
        const kind: Kind =
          r < beetleChance ? 'beetle' : r < beetleChance + 0.06 ? 'golden' : r < beetleChance + 0.08 && l < 3 ? 'heart' : 'berry';
        const x = 10 + Math.random() * (W - 27);
        // later beetles zigzag, so you can't just park under a gap
        const wob = kind === 'beetle' && Math.random() < ramp ? 6 + Math.random() * 10 : 0;
        items.push({ x, x0: x, wob, y: -8, kind, vy: fall * (0.85 + Math.random() * 0.3) * (kind === 'heart' ? 1.3 : 1) });
      }

      // update items + catches
      const next: Item[] = [];
      for (const it of items) {
        it.y += it.vy * dt;
        if (it.wob) it.x = Math.max(0, Math.min(W - 7, it.x0 + Math.sin(it.y / 9) * it.wob));
        const caught = it.y + 7 >= BASKET_Y && it.y <= BASKET_Y + 3 && it.x + 6 >= basketX && it.x <= basketX + BASKET_W - 1;
        if (caught) {
          if (it.kind === 'beetle') {
            l -= 1;
            flash = 0.25;
            shake = 0.25;
            setLives(l);
            breakCombo();
            burst(it.x + 3, BASKET_Y, PALETTE.k, 10);
            retroAudio.playButtonClack();
            try {
              navigator.vibrate?.(80);
            } catch {
              /* no haptics */
            }
          } else if (it.kind === 'heart') {
            l = Math.min(3, l + 1);
            setLives(l);
            burst(it.x + 3, BASKET_Y, PALETTE.h, 12);
            pops.push({ x: it.x, y: BASKET_Y - 6, text: '+♥', life: 0.8 });
            retroAudio.playNote(988, 0.2, 0.08);
            window.setTimeout(() => retroAudio.playNote(1318, 0.3, 0.08), 110);
          } else {
            c += 1;
            setCombo(c);
            if (c % 5 === 0 && c <= 20) say(`combo x${mult()}!`, 900);
            const pts = (it.kind === 'golden' ? 5 : 1) * mult();
            s += pts;
            setScore(s);
            pops.push({ x: it.x, y: BASKET_Y - 6, text: `+${pts}`, life: 0.6 });
            if (s >= nextShower) {
              nextShower += 40;
              shower = 4;
              say('🍓 berry shower! 🍓', 1800);
            }
            burst(it.x + 3, BASKET_Y, it.kind === 'golden' ? PALETTE.y : PALETTE.c, it.kind === 'golden' ? 14 : 8);
            retroAudio.playNote(it.kind === 'golden' ? 1318 : 660 + (s % 5) * 110, 0.25, 0.08);
          }
          continue;
        }
        if (it.y < H) next.push(it);
        else if (it.kind === 'berry' || it.kind === 'golden') breakCombo(); // dropped one
      }
      items = next;

      sparks = sparks.filter((p) => (p.life -= dt) > 0);
      pops = pops.filter((p) => (p.life -= dt) > 0);
      for (const p of sparks) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 120 * dt;
      }

      // draw
      ctx.save();
      if (shake > 0) {
        shake -= dt;
        ctx.translate(Math.round((Math.random() - 0.5) * 4), Math.round((Math.random() - 0.5) * 4));
      }
      drawBg(ctx);
      if (shower > 0) {
        ctx.fillStyle = 'rgba(255,210,63,0.18)';
        ctx.fillRect(0, 0, W, H);
      }
      for (const it of items) drawSprite(ctx, SPRITES[it.kind], it.x, it.y);
      for (const p of sparks) {
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
      }
      drawSprite(ctx, SPRITES.basket, basketX, BASKET_Y);
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      for (const p of pops) {
        ctx.fillStyle = `rgba(122,0,68,${Math.min(1, p.life * 2)})`;
        ctx.fillText(p.text, p.x + 3, p.y - (0.8 - p.life) * 20);
      }
      ctx.restore();
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
        <span>
          🍓 {score}
          {combo >= 5 && <span className="ml-1 text-[#ff2e93]">x{1 + Math.min(4, Math.floor(combo / 5))}</span>}
        </span>
        <span aria-label={`${lives} lives`}>
          {'♥'.repeat(Math.max(0, lives))}
          <span className="opacity-25">{'♥'.repeat(Math.max(0, 3 - lives))}</span>
        </span>
      </div>

      {phase === 'play' && banner && (
        <p className="absolute inset-x-0 top-1/3 text-center font-pixel text-xl text-[#ff2e93] pointer-events-none animate-pulse [text-shadow:0_1px_0_#fff]">
          {banner}
        </p>
      )}

      {phase !== 'play' && (
        <GameCard title={phase === 'title' ? 'Berry Basket' : 'game over'} best={best} again={phase === 'over'} onStart={start}>
          {phase === 'title' ? (
            <p className="font-pixel text-base text-[#7a0044] leading-tight mt-1">
              drag to catch berries 🍓
              <br />
              golden = +5 · ♥ = extra life
              <br />
              chain catches for combos · dodge beetles!
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
