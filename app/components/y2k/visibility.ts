'use client';

/**
 * Keep decorative animation from running when nobody can see it.
 *
 *  - useInView(ref): is this element on screen?
 *  - overlay store: a full-screen window (bonus-track showcase) is open, so
 *    everything behind it should rest. Sets html[data-overlay="true"], which
 *    app/y2k.css uses to pause CSS animations under `.pause-on-overlay`.
 *  - useOffscreenPause(): tags `[data-anim]` sections with data-offscreen so
 *    their CSS animations pause while scrolled away.
 */

import { RefObject, useEffect, useState, useSyncExternalStore } from 'react';

export function useInView(ref: RefObject<Element | null>, rootMargin = '120px') {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

let overlays = 0;
const listeners = new Set<() => void>();

export function setOverlayOpen(open: boolean) {
  overlays = Math.max(0, overlays + (open ? 1 : -1));
  if (overlays > 0) document.documentElement.dataset.overlay = 'true';
  else delete document.documentElement.dataset.overlay;
  listeners.forEach((l) => l());
}

export function useOverlayOpen() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    () => overlays > 0,
    () => false,
  );
}

export function useOffscreenPause() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-anim]');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) delete (e.target as HTMLElement).dataset.offscreen;
          else (e.target as HTMLElement).dataset.offscreen = 'true';
        }
      },
      { rootMargin: '80px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
