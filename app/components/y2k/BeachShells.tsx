'use client';

import React, { useEffect, useState } from 'react';
import { playSplash, playWash } from '../../utils/introSounds';

/**
 * The shells on the beach are toys: drag one into the sea and let go, and it floats,
 * bobbing and drifting on the current, until a wave carries it back up onto the sand.
 * Drop one on the sand and it just stays there.
 *
 * Positions are px inside this layer, which spans from the horizon down to the bottom
 * of the page: the sea is everything above `seaHeight`, the sand everything below.
 * The moving parts live in a small engine object outside React: while shells float, one
 * animation loop writes transforms straight to the DOM, and it stops when the sea is empty.
 */

type Spec = { n: number; side: 'left' | 'right'; pct: number; top: number; w: number; r: number };
type Shell = Spec & { x: number; y: number; rot: number; mode: 'sand' | 'drag' | 'float'; t: number; vx: number; phase: number };
type Geo = { seaHeight: number; sandTop: number; height: number };

// which cut-out (public/images/beach/shell-N.webp), where on the sand, how big, how it's lying
const SPECS: Spec[] = [
  { n: 7, side: 'left', pct: 5, top: 84, w: 82, r: -14 }, // scallop
  { n: 1, side: 'left', pct: 12, top: 58, w: 34, r: 62 }, // auger
  { n: 4, side: 'left', pct: 17, top: 120, w: 70, r: 16 }, // starfish
  { n: 11, side: 'left', pct: 23, top: 76, w: 50, r: 0 }, // moon snail
  { n: 9, side: 'left', pct: 28, top: 140, w: 40, r: 34 }, // cowrie
  { n: 12, side: 'left', pct: 33, top: 70, w: 34, r: -56 }, // murex
  { n: 6, side: 'right', pct: 28, top: 126, w: 74, r: 0 }, // sand dollar
  { n: 3, side: 'right', pct: 22, top: 40, w: 48, r: -68 }, // whelk
  { n: 2, side: 'right', pct: 17, top: 112, w: 56, r: 18 }, // banded snail
  { n: 8, side: 'right', pct: 12, top: 70, w: 54, r: -24 }, // small starfish
  { n: 10, side: 'right', pct: 7, top: 50, w: 42, r: 0 }, // turban snail
  { n: 5, side: 'right', pct: 3, top: 30, w: 48, r: 46 }, // spindle
];

const transformOf = (s: Shell) => `translate(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px) rotate(${s.rot.toFixed(1)}deg)`;

class BeachEngine {
  shells: Shell[] = [];
  els: (HTMLImageElement | null)[] = [];
  layer: HTMLDivElement | null = null;
  geo: Geo = { seaHeight: 0, sandTop: 0, height: 0 };
  raf = 0;
  drag: { i: number; dx: number; dy: number; lastX: number; vx: number } | null = null;

  visible = false;
  io: IntersectionObserver | null = null;
  setLayer = (el: HTMLDivElement | null) => {
    if (el === this.layer) return;
    this.io?.disconnect();
    this.layer = el;
    if (!el) return;
    this.io = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      if (this.visible && !this.raf && this.shells.some((s) => s.mode === 'float')) this.drift();
    });
    this.io.observe(el);
  };
  setEl = (i: number, el: HTMLImageElement | null) => {
    this.els[i] = el;
    this.paint(i);
  };
  setGeo(g: Geo) {
    const sandMoved = g.sandTop !== this.geo.sandTop;
    this.geo = g;
    // keep resting shells on the sand if the page changed height
    if (sandMoved)
      this.shells.forEach((s, i) => {
        if (s.mode === 'sand') {
          s.y = Math.max(s.y, g.sandTop + 20);
          this.paint(i);
        }
      });
  }
  layout() {
    const W = this.layer?.clientWidth ?? 1200;
    this.shells = SPECS.map((s, i) => ({
      ...s,
      x: s.side === 'left' ? (s.pct / 100) * W : W - (s.pct / 100) * W - s.w,
      y: this.geo.sandTop + s.top,
      rot: s.r,
      mode: 'sand',
      t: 0,
      vx: 0,
      phase: i * 1.7,
    }));
    this.shells.forEach((_, i) => this.paint(i));
  }
  paint(i: number) {
    const s = this.shells[i];
    const el = this.els[i];
    if (s && el) el.style.transform = transformOf(s);
  }
  stop() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  /** Float everything that's in the water; stops by itself once nothing is. */
  drift() {
    this.stop();
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // scrolled away from the beach: the sea holds its shells until you're back
      if (!this.visible) {
        this.raf = 0;
        return;
      }
      const { seaHeight: sea, sandTop: sand, height: h } = this.geo;
      const W = this.layer?.clientWidth ?? 1200;
      let afloat = false;
      this.shells.forEach((s, i) => {
        if (s.mode !== 'float') return;
        afloat = true;
        s.t += dt;
        // a lazy current sideways, swells up and down, and a slow pull toward the shore
        s.x = Math.max(0, Math.min(W - s.w, s.x + (s.vx + Math.sin(s.t * 0.6 + s.phase) * 14) * dt));
        s.y += (16 + Math.sin(s.t * 1.4 + s.phase) * 22) * dt;
        s.rot += Math.sin(s.t * 1.1 + s.phase) * 18 * dt;
        if (s.y > sea - 24) {
          // a wave carries it up the beach
          s.mode = 'sand';
          playWash();
          // it lands just past the waterline, not flung far up the sand
          s.y = Math.min(h - s.w - 20, sand - 16 + Math.random() * 46);
          s.rot += (Math.random() - 0.5) * 60;
          const el = this.els[i];
          if (el) {
            el.classList.remove('is-floating');
            el.classList.add('is-washing');
            setTimeout(() => el.classList.remove('is-washing'), 1300);
          }
        }
        this.paint(i);
      });
      this.raf = afloat ? requestAnimationFrame(step) : 0;
    };
    this.raf = requestAnimationFrame(step);
  }

  down = (i: number, e: React.PointerEvent<HTMLImageElement>) => {
    const s = this.shells[i];
    const box = this.layer?.getBoundingClientRect();
    if (!s || !box) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    s.mode = 'drag';
    e.currentTarget.classList.remove('is-floating', 'is-washing');
    e.currentTarget.classList.add('is-held');
    this.drag = { i, dx: e.clientX - box.left - s.x, dy: e.clientY - box.top - s.y, lastX: e.clientX, vx: 0 };
  };
  move = (e: React.PointerEvent<HTMLImageElement>) => {
    const d = this.drag;
    const s = d && this.shells[d.i];
    const box = this.layer?.getBoundingClientRect();
    if (!d || !s || !box) return;
    s.x = e.clientX - box.left - d.dx;
    s.y = Math.max(0, Math.min(this.geo.height - s.w, e.clientY - box.top - d.dy));
    d.vx = d.vx * 0.6 + (e.clientX - d.lastX) * 4; // remember a little of the throw
    d.lastX = e.clientX;
    this.paint(d.i);
  };
  up = (e: React.PointerEvent<HTMLImageElement>) => {
    const d = this.drag;
    const s = d && this.shells[d.i];
    this.drag = null;
    e.currentTarget.classList.remove('is-held');
    if (!d || !s) return;
    if (s.y < this.geo.seaHeight - 30) {
      // in the water: let it float
      s.mode = 'float';
      s.t = 0;
      s.vx = Math.max(-60, Math.min(60, d.vx * 0.15));
      e.currentTarget.classList.add('is-floating');
      playSplash(s.w / 50);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) s.y = this.geo.seaHeight; // washes straight back up
      this.drift();
    } else {
      s.mode = 'sand';
      s.y = Math.max(s.y, this.geo.sandTop + 10);
      this.paint(d.i);
    }
  };
}

export function BeachShells({ top, height, seaHeight, sandTop }: { top: number; height: number; seaHeight: number; sandTop: number }) {
  const [engine] = useState(() => new BeachEngine());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    engine.setGeo({ seaHeight, sandTop, height });
  }, [engine, seaHeight, sandTop, height]);

  // lay the shells out on the sand once we know how wide the beach is
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      engine.layout();
      setReady(true);
    });
    return () => {
      cancelAnimationFrame(id);
      engine.stop();
    };
  }, [engine]);

  return (
    <div ref={(el) => engine.setLayer(el)} className="absolute left-0 right-0" style={{ top, height }}>
      {ready && (
        <p className="beach-hint" style={{ top: sandTop + 190 }}>
          psst… throw a shell in the sea ✦
        </p>
      )}
      {SPECS.map((s, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- tiny decorative cut-outs (this site serves images unoptimized anyway)
        <img
          key={s.n}
          ref={(el) => engine.setEl(i, el)}
          src={`/images/beach/shell-${s.n}.webp`}
          alt=""
          draggable={false}
          className="beach-shell"
          style={{ width: s.w, visibility: ready ? 'visible' : 'hidden' }}
          onPointerDown={(e) => engine.down(i, e)}
          onPointerMove={engine.move}
          onPointerUp={engine.up}
          onPointerCancel={engine.up}
        />
      ))}
    </div>
  );
}
