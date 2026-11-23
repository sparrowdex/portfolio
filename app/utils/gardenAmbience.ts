import { retroAudio } from './retroAudio';

/**
 * Faint birdsong for the skill garden: every so often a little bird on one side sings two
 * or three soft whistles. Synthesised, kept very quiet and sparse so it sits in the
 * background. Only plays while the garden is on screen and sound is on.
 */

let timer = 0;
let on = false;

/** Fired on window with the singing bird's index as detail, so it can open its beak. */
export const BIRD_SING_EVENT = 'garden-bird-sing';

/** Who sings next: returns a bird's index and its stereo position (-1 left … 1 right), or null if none can. */
let chooser: (() => { id: number; pan: number } | null) | null = null;
export function setBirdChooser(fn: typeof chooser) {
  chooser = fn;
}

/** One soft, unhurried call: two or three gentle, slightly falling whistles. */
function chirpCall() {
  const io = retroAudio.getOutput();
  if (!io) return;
  const { ctx, out } = io;
  // the song comes from an actual bird on the page, placed in stereo where it sits
  const bird = chooser?.() ?? null;
  const pan = ctx.createStereoPanner();
  pan.pan.value = bird ? Math.max(-1, Math.min(1, bird.pan)) : Math.random() * 1.6 - 0.8;
  const bus = ctx.createGain();
  bus.gain.value = 0.016 + Math.random() * 0.008;
  bus.connect(pan).connect(out);
  if (bird) window.dispatchEvent(new CustomEvent(BIRD_SING_EVENT, { detail: bird.id }));

  const base = 2300 + Math.random() * 900;
  const notes = 2 + Math.floor(Math.random() * 2);
  let t = ctx.currentTime + 0.02;
  for (let i = 0; i < notes; i++) {
    const f = base * (1 - i * 0.06);
    const len = 0.13 + Math.random() * 0.06;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(f * 1.12, t);
    o.frequency.exponentialRampToValueAtTime(f * 0.9, t + len);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(1, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + len + 0.02);
    t += len + 0.12 + Math.random() * 0.08;
  }
  setTimeout(() => pan.disconnect(), 2000);
}

function schedule() {
  clearTimeout(timer);
  if (!on) return;
  timer = window.setTimeout(() => {
    if (!on) return;
    chirpCall();
    schedule();
  }, 9000 + Math.random() * 9000);
}

/** Call with true while the garden is on screen, false when it leaves. */
export function setGardenAmbience(visible: boolean) {
  if (visible === on) return;
  on = visible;
  if (on) schedule();
  else clearTimeout(timer);
}

/** Wings as a bird takes off: a few soft, low, unhurried whooshes. */
export function playFlutter() {
  const io = retroAudio.getOutput();
  if (!io) return;
  const { ctx, out } = io;
  const len = 1.1;
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) {
    const t = i / ctx.sampleRate;
    const beat = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 7); // about 7 slow wingbeats a second
    d[i] = (Math.random() * 2 - 1) * beat ** 3 * Math.sin((Math.PI * t) / len);
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 480;
  f.Q.value = 0.3;
  const g = ctx.createGain();
  g.gain.value = 0.032;
  src.connect(f).connect(g).connect(out);
  src.start();
}
