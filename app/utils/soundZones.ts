import { setSkyAmbience } from './skyAmbience';
import { setGardenAmbience } from './gardenAmbience';
import { setSeaAmbience } from './seaAmbience';

/**
 * Each place in the world has its own background sound, and only one plays at a time:
 * wind chimes up in the clouds (About), birds in the greenhouse (Skill Garden), waves at
 * the beach (Contact and below). The place under the middle of the screen wins, so
 * scrolling from one place to the next hands the sound over instead of mixing them.
 */

type Zone = 'sky' | 'garden' | 'beach' | null;

let current: Zone = null;
let paused = false;

function apply(zone: Zone) {
  current = zone;
  setSkyAmbience(!paused && zone === 'sky');
  setGardenAmbience(!paused && zone === 'garden');
  setSeaAmbience(!paused && zone === 'beach');
}

function zoneAtCentre(): Zone {
  const mid = window.innerHeight / 2;
  const box = (id: string) => document.getElementById(id)?.getBoundingClientRect();
  const about = box('about');
  const deck = box('deck');
  const skills = box('skills');
  const contact = box('contact');
  if (about && about.top <= mid && about.bottom >= mid) return 'sky';
  if (skills && skills.top <= mid && skills.bottom >= mid) return 'garden';
  // the beach runs from the contact section to the bottom of the page
  if (contact && contact.top - 120 <= mid) return 'beach';
  if (deck && deck.top <= mid && deck.bottom >= mid) return null;
  return null;
}

/** Start watching the scroll position; returns a function that stops it. */
export function watchSoundZones() {
  let raf = 0;
  const check = () => {
    raf = 0;
    const z = zoneAtCentre();
    if (z !== current) apply(z);
  };
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(check);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  check();
  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    cancelAnimationFrame(raf);
    apply(null);
  };
}

/** Quiet every place's background sound (e.g. while a full-screen window is open). */
export function pauseSoundZones(p: boolean) {
  paused = p;
  apply(current);
}
