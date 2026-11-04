'use client';

/**
 * Tiny arcade registry shared by the homepage (which mounts the games) and the
 * About profile's arcade box (which launches them / hints at the secret one).
 */

export type GameId = 'berry' | 'stack';
export const OPEN_GAME_EVENT = 'open-game';

export function openGame(id: GameId) {
  window.dispatchEvent(new CustomEvent<GameId>(OPEN_GAME_EVENT, { detail: id }));
}

/* Berry Basket stays "locked" in the arcade until it's been found once. */
const UNLOCK_KEY = 'berry_unlocked';
const listeners = new Set<() => void>();

export function markBerryUnlocked() {
  try {
    localStorage.setItem(UNLOCK_KEY, '1');
  } catch {
    /* storage blocked: it just stays a secret */
  }
  listeners.forEach((l) => l());
}
export function isBerryUnlocked() {
  try {
    return localStorage.getItem(UNLOCK_KEY) === '1';
  } catch {
    return false;
  }
}
export function subscribeBerryUnlock(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
