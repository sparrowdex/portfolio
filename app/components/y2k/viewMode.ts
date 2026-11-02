'use client';

import { useSyncExternalStore } from 'react';

export type ViewMode = 'fun' | 'recruiter';

const KEY = 'portfolio_view_mode';
const listeners = new Set<() => void>();

/** URL (?mode=recruiter / ?mode=fun) wins over the saved preference. */
function read(): ViewMode {
  const param = new URLSearchParams(window.location.search).get('mode');
  if (param === 'recruiter' || param === 'fun') return param;
  try {
    return localStorage.getItem(KEY) === 'recruiter' ? 'recruiter' : 'fun';
  } catch {
    return 'fun';
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener('popstate', cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('popstate', cb);
  };
}

export function setViewMode(mode: ViewMode) {
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    /* storage blocked: URL still carries the mode */
  }
  const url = new URL(window.location.href);
  if (mode === 'recruiter') url.searchParams.set('mode', 'recruiter');
  else url.searchParams.delete('mode');
  window.history.replaceState(null, '', url);
  window.scrollTo({ top: 0 });
  listeners.forEach((l) => l());
}

export function useViewMode(): ViewMode {
  return useSyncExternalStore(subscribe, read, () => 'fun');
}
