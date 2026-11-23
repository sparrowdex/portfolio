import { retroAudio } from './retroAudio';

/**
 * Sound for each project's intro animation (components/y2k/intros), timed to what's on
 * screen, all synthesised with the Web Audio API. Replaces the single "disc in" thud.
 *
 *   1 Photobooth   shutter + flash whine, the strip printing, a "say cheese" chime
 *   2 Inner Voice  a Tamagotchi waking up: chirpy beeps, a heart pop, a happy trill
 *   3 Diecast      five start-light beeps over an idling engine, lights out, a car roaring past left to right
 *   4 Armatrix     digital rain blips, glitches, then a chord as the wordmark locks in
 *   5 Flowers      a rising chime as the stem grows, a glitter burst, a soft bell
 *   6 SpiceVault   microwave hum, keypad countdown beeps, DING
 *   7 Timeless     a snow globe rattling, then music-box notes as the snow settles
 */

type Ctx = { ctx: AudioContext; bus: GainNode; t0: number };

let current: { bus: GainNode; ctx: AudioContext } | null = null;

export function stopIntroSound() {
  if (!current) return;
  const { bus, ctx } = current;
  const t = ctx.currentTime;
  bus.gain.cancelScheduledValues(t);
  bus.gain.setValueAtTime(bus.gain.value, t);
  bus.gain.linearRampToValueAtTime(0, t + 0.25);
  setTimeout(() => bus.disconnect(), 400);
  current = null;
}

/* ── tiny synth helpers (times are seconds after the intro starts) ── */

function tone(
  { ctx, bus, t0 }: Ctx,
  at: number,
  freq: number,
  dur: number,
  { type = 'sine' as OscillatorType, vol = 0.2, attack = 0.005, to, pan = 0 }: { type?: OscillatorType; vol?: number; attack?: number; to?: number; pan?: number } = {},
) {
  const t = t0 + at;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  const p = ctx.createStereoPanner();
  p.pan.value = pan;
  o.connect(g).connect(p).connect(bus);
  o.start(t);
  o.stop(t + dur + 0.05);
}

let noiseBuf: AudioBuffer | null = null;
function noise(
  { ctx, bus, t0 }: Ctx,
  at: number,
  dur: number,
  { vol = 0.15, filter = 'bandpass' as BiquadFilterType, freq = 2000, q = 1, attack = 0.005 }: { vol?: number; filter?: BiquadFilterType; freq?: number; q?: number; attack?: number } = {},
) {
  if (!noiseBuf || noiseBuf.sampleRate !== ctx.sampleRate) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = t0 + at;
  const s = ctx.createBufferSource();
  s.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = filter;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(bus);
  s.start(t, Math.random());
  s.stop(t + dur + 0.05);
  return { f, g, t };
}

/** A struck bell: a few inharmonic partials with a long ring. */
function bell(c: Ctx, at: number, freq: number, vol = 0.18, ring = 1.6) {
  [1, 2.76, 5.4].forEach((m, i) => tone(c, at, freq * m, ring / (i + 1), { vol: vol / (i + 1.5), attack: 0.003 }));
}

const SCENES: Record<number, (c: Ctx) => void> = {
  // 1 · Photobooth
  1: (c) => {
    noise(c, 0.02, 0.05, { vol: 0.35, freq: 3500, q: 0.7 }); // shutter
    noise(c, 0.09, 0.04, { vol: 0.25, freq: 1800 });
    tone(c, 0.02, 1500, 0.7, { to: 7000, vol: 0.05, type: 'sine' }); // flash charging whine
    // the strip printing out: a stepping, buzzy motor
    for (let i = 0; i < 12; i++) noise(c, 0.35 + i * 0.12, 0.1, { vol: 0.1, freq: 900 + (i % 2) * 200, q: 4 });
    tone(c, 0.35, 140, 1.5, { type: 'sawtooth', vol: 0.03, attack: 0.1 });
    tone(c, 1.45, 1046.5, 0.35, { type: 'triangle', vol: 0.16 }); // say...
    tone(c, 1.62, 1568, 0.6, { type: 'triangle', vol: 0.16 }); // ...cheese!
  },
  // 2 · Inner Voice
  2: (c) => {
    [1046.5, 1318.5, 1568, 2093].forEach((f, i) => tone(c, 0.08 + i * 0.09, f, 0.09, { type: 'square', vol: 0.06 })); // wake-up beeps
    tone(c, 0.5, 600, 0.25, { to: 1400, vol: 0.14 }); // heart pops up
    tone(c, 0.52, 1200, 0.2, { to: 2400, vol: 0.06, type: 'triangle' });
    // a happy little trill as the mood shows
    [1568, 1760, 1568, 2093].forEach((f, i) => tone(c, 1.2 + i * 0.07, f, 0.08, { type: 'square', vol: 0.05 }));
  },
  // 3 · The Diecast Store
  3: (c) => {
    // idling engine, revving up under the lights
    const { ctx, bus, t0 } = c;
    const eng = ctx.createOscillator();
    eng.type = 'sawtooth';
    eng.frequency.setValueAtTime(55, t0);
    eng.frequency.linearRampToValueAtTime(80, t0 + 1.25);
    eng.frequency.linearRampToValueAtTime(140, t0 + 1.4);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 500;
    const eg = ctx.createGain();
    eg.gain.setValueAtTime(0.0001, t0);
    eg.gain.exponentialRampToValueAtTime(0.06, t0 + 0.2);
    eg.gain.setValueAtTime(0.06, t0 + 1.3);
    eg.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.55);
    eng.connect(lp).connect(eg).connect(bus);
    eng.start(t0);
    eng.stop(t0 + 1.6);
    // five lights, five beeps, then a higher "go"
    for (let i = 0; i < 5; i++) tone(c, 0.1 + i * 0.2, 880, 0.12, { type: 'square', vol: 0.06 });
    tone(c, 1.3, 1760, 0.25, { type: 'square', vol: 0.07 });
    // the car screaming past, left to right, pitch dropping as it goes
    const t = t0 + 1.35;
    const car = ctx.createOscillator();
    car.type = 'sawtooth';
    car.frequency.setValueAtTime(320, t);
    car.frequency.linearRampToValueAtTime(420, t + 0.4);
    car.frequency.exponentialRampToValueAtTime(150, t + 0.95);
    const cf = ctx.createBiquadFilter();
    cf.type = 'lowpass';
    cf.frequency.value = 1800;
    const cg = ctx.createGain();
    cg.gain.setValueAtTime(0.0001, t);
    cg.gain.exponentialRampToValueAtTime(0.12, t + 0.35);
    cg.gain.exponentialRampToValueAtTime(0.0001, t + 1);
    const pan = ctx.createStereoPanner();
    pan.pan.setValueAtTime(-0.9, t);
    pan.pan.linearRampToValueAtTime(0.9, t + 0.9);
    car.connect(cf).connect(cg).connect(pan).connect(bus);
    car.start(t);
    car.stop(t + 1.05);
    noise(c, 1.4, 0.8, { vol: 0.12, filter: 'bandpass', freq: 1200, q: 0.6, attack: 0.3 }); // the rush of air
  },
  // 4 · Armatrix
  4: (c) => {
    for (let i = 0; i < 26; i++) {
      const at = Math.random() * 1.6;
      tone(c, at, 1200 + Math.floor(Math.random() * 8) * 220, 0.04, { type: 'square', vol: 0.025, pan: Math.random() * 1.6 - 0.8 });
    }
    // glitches as the wordmark flickers in
    [1.1, 1.2, 1.32].forEach((at) => {
      for (let k = 0; k < 4; k++) tone(c, at + k * 0.018, 200 + Math.random() * 2000, 0.02, { type: 'square', vol: 0.05 });
    });
    // locked in: a cool, wide chord
    [220, 329.6, 440, 659.3].forEach((f, i) => tone(c, 1.45, f, 1, { type: 'triangle', vol: 0.07, attack: 0.02, pan: (i - 1.5) / 2 }));
  },
  // 5 · Flowers for Beloved
  5: (c) => {
    [523.3, 587.3, 659.3, 784, 880, 1046.5].forEach((f, i) => tone(c, 0.1 + i * 0.13, f, 0.6, { type: 'sine', vol: 0.09 })); // growing
    for (let i = 0; i < 14; i++) tone(c, 0.9 + Math.random() * 0.4, 2000 + Math.random() * 3500, 0.25, { vol: 0.04, pan: Math.random() * 2 - 1 }); // glitter
    bell(c, 1.5, 1046.5, 0.14, 1.4); // 4 u ♥
  },
  // 6 · SpiceVault
  6: (c) => {
    tone(c, 0, 120, 1.7, { type: 'sawtooth', vol: 0.025, attack: 0.15 }); // microwave hum
    tone(c, 0, 60, 1.7, { type: 'sine', vol: 0.05, attack: 0.15 });
    [0.02, 0.5, 0.98, 1.46].forEach((at) => tone(c, at, 1975, 0.07, { type: 'square', vol: 0.05 })); // keypad countdown
    bell(c, 1.62, 1760, 0.22, 1.8); // DING!
  },
  // 7 · Timeless
  7: (c) => {
    // the globe being shaken: rattles and sloshing glass
    [0.16, 0.32, 0.48, 0.64, 0.8].forEach((at, i) => {
      noise(c, at, 0.12, { vol: 0.12 - i * 0.015, freq: 2500, q: 2 });
      tone(c, at, 3000 + i * 300, 0.15, { vol: 0.03 });
    });
    // music box as the snow settles
    const notes = [1318.5, 1568, 1760, 1568, 2093, 1760];
    notes.forEach((f, i) => tone(c, 0.95 + i * 0.22, f, 0.9, { type: 'sine', vol: 0.08, attack: 0.003 }));
    noise(c, 0.9, 1.4, { vol: 0.03, filter: 'highpass', freq: 7000, attack: 0.4 }); // sleigh-bell shimmer
  },
};

/** Play the sound for project `id`'s intro, stopping any that's still going. */
export function playIntroSound(id: number) {
  stopIntroSound();
  const scene = SCENES[id];
  const io = retroAudio.getOutput();
  if (!scene || !io) return;
  const bus = io.ctx.createGain();
  bus.gain.value = 0.9;
  bus.connect(io.out);
  current = { bus, ctx: io.ctx };
  scene({ ctx: io.ctx, bus, t0: io.ctx.currentTime + 0.03 });
}

/* ── beach ── */

/** A shell dropped in the sea: a real recorded splash (public/audio), through the site's output. */
const SPLASH_URL = '/audio/universfield-water-splash-229315.mp3';
let splashBuf: Promise<AudioBuffer | null> | null = null;

export function playSplash(size = 1) {
  const io = retroAudio.getOutput();
  if (!io) return;
  const { ctx } = io;
  // fetch and decode once, then reuse
  splashBuf ??= fetch(SPLASH_URL)
    .then((r) => r.arrayBuffer())
    .then((b) => ctx.decodeAudioData(b))
    .catch(() => null);
  splashBuf.then((buf) => {
    if (!buf) return;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    // bigger shells splash a touch deeper; a little variety so repeats don't sound identical
    const big = Math.min(1.4, Math.max(0.6, size));
    src.playbackRate.value = (1.12 - big * 0.12) * (0.95 + Math.random() * 0.1);
    const g = ctx.createGain();
    g.gain.value = 0.55;
    src.connect(g).connect(io.out);
    src.start();
  });
}

/** A wave washing a shell back up the sand: a soft swell of surf. */
export function playWash() {
  const io = retroAudio.getOutput();
  if (!io) return;
  const bus = io.ctx.createGain();
  bus.gain.value = 0.6;
  bus.connect(io.out);
  const c = { ctx: io.ctx, bus, t0: io.ctx.currentTime + 0.01 };
  // a soft, low swell of water rolling up the sand (no bright fizz, so it stays muffled)
  noise(c, 0, 1.6, { vol: 0.16, filter: 'lowpass', freq: 700, q: 0.3, attack: 0.7 });
  noise(c, 0.25, 1.2, { vol: 0.05, filter: 'bandpass', freq: 1400, q: 0.4, attack: 0.6 });
  setTimeout(() => bus.disconnect(), 2000);
}
