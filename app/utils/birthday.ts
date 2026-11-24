import { useSyncExternalStore } from 'react';

/**
 * Sreeja's birthday is 4 December. On that day (by the visitor's own date) the site
 * dresses up: a crown on her portrait, a birthday sticker in the hero, and a cake in her
 * laptop's editor. Add ?birthday to the URL to preview it on any day.
 */
export function isBirthdayToday() {
  if (typeof window === 'undefined') return false;
  if (new URLSearchParams(window.location.search).has('birthday')) return true;
  const d = new Date();
  return d.getMonth() === 11 && d.getDate() === 4;
}

/** React hook: false on the server and first paint, then the real answer (no hydration mismatch). */
export function useBirthday() {
  return useSyncExternalStore(
    () => () => {},
    isBirthdayToday,
    () => false,
  );
}
