import { retroAudio } from './retroAudio';

/**
 * Music for the About section up in the clouds: a quiet music-box lullaby with soft wind
 * chimes woven into it. The chimes are part of the arrangement, not a separate sound:
 *   - they play the notes of whatever chord the lullaby is on, so they always harmonise;
 *   - they sit just one octave above the melody, in the same sine timbre;
 *   - both go through the same soft filter and the same echo, so they share one space;
 *   - every note ends with a gentle vibrato that widens as it rings out, for depth.
 * Only plays while the music box is open, the section is on screen and sound is on.
 */

// notes (Hz)
const F3 = 174.61, G3 = 196, A3 = 220, C4 = 261.63;
const C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99, A5 = 880;
const C6 = 1046.5, D6 = 1174.66, E6 = 1318.51, F6 = 1396.91, G6 = 1567.98, A6 = 1760;

// a slow lullaby in four lines of 8 beats, over C, Am, F, G: [note, beats]
const LULLABY: [number, number][] = [
  [E5, 1], [G5, 1], [C5, 2], [D5, 1], [E5, 1], [G5, 2],
  [A5, 1], [G5, 1], [E5, 2], [D5, 1], [C5, 1], [D5, 2],
  [E5, 1], [D5, 1], [C5, 2], [A5, 1], [G5, 1], [E5, 2],
  [G5, 1], [E5, 1], [D5, 2], [C5, 4],
];
const ROOTS = [C4, A3, F3, G3];

// the chimes' answers, made only of each line's chord tones, one octave above the tune.
// They come in during the second half of a line, where the melody holds a long note.
const B6 = 1975.53;
// every answer is four notes, all in the same octave above the tune (never down in its
// range, where a chime would sound heavier and fight the melody)
const ANSWERS: number[][][] = [
  /* C  */ [[G6, E6, C6, E6], [C6, E6, G6, E6]],
  /* Am */ [[E6, C6, A6, E6], [A6, E6, C6, E6]],
  /* F  */ [[F6, C6, A6, C6], [A6, F6, C6, F6]],
  /* G  */ [[D6, B6, G6, D6], [G6, D6, B6, G6]],
];
// the chord under each line, for the light harp pulse: [root, fifth, octave]
const PULSE: number[][] = [
  [C4, 392, 523.25],
  [A3, 329.63, 440],
  [F3, 261.63, 349.23],
  [G3, 293.66, 392],
];

const BEAT = 1.2; // seconds: slow and dreamy

let on = false;
let bed: { ctx: AudioContext; bus: GainNode; chimes: GainNode; pulse: GainNode; timer: number; pass: number } | null = null;

/**
 * One soft note: a sine with a faint octave, a gentle attack and a long decay. As it rings
 * out, a slow vibrato fades in and widens, which gives the tail its shimmer and depth.
 */
function note(ctx: AudioContext, out: AudioNode, freq: number, at: number, vol: number, ring: number, bright = 0.1, attack = 0.03) {
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 4.6;
  const depth = ctx.createGain();
  depth.gain.setValueAtTime(0, at);
  depth.gain.linearRampToValueAtTime(0, at + ring * 0.25);
  depth.gain.linearRampToValueAtTime(freq * 0.007, at + ring);
  lfo.connect(depth);
  lfo.start(at);
  lfo.stop(at + ring + 0.1);
  [
    [1, 1],
    [2, bright],
  ].forEach(([m, level]) => {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq * m;
    depth.connect(o.frequency);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vol * level, at + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, at + ring);
    o.connect(g).connect(out);
    o.start(at);
    o.stop(at + ring + 0.1);
  });
}

function startBed() {
  if (bed) return;
  const io = retroAudio.getOutput();
  if (!io) return;
  const { ctx, out } = io;
  const now = ctx.currentTime;

  // one shared space: a soft filter and an echo on the beat, for the tune and the chimes alike
  const room = ctx.createBiquadFilter();
  room.type = 'lowpass';
  room.frequency.value = 2200;
  const echo = ctx.createDelay(2);
  echo.delayTime.value = BEAT * 0.75;
  const fb = ctx.createGain();
  fb.gain.value = 0.3;
  const wet = ctx.createGain();
  wet.gain.value = 0.45;
  room.connect(out);
  room.connect(echo).connect(fb).connect(echo);
  echo.connect(wet).connect(out);

  const fadeIn = (g: GainNode, level: number) => {
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(level, now + 4);
  };
  const bus = ctx.createGain(); // the lullaby
  fadeIn(bus, 0.022);
  bus.connect(room);
  // the chimes: softer than the tune, and muffled a little more so they have no hard edge
  const chimes = ctx.createGain();
  fadeIn(chimes, 0.01);
  const velvet = ctx.createBiquadFilter();
  velvet.type = 'lowpass';
  velvet.frequency.value = 1500;
  chimes.connect(velvet).connect(room);

  // the harp pulse: very quiet and muffled, just enough to keep the music walking forward
  const pulse = ctx.createGain();
  fadeIn(pulse, 0.012);
  const pluckSoft = ctx.createBiquadFilter();
  pluckSoft.type = 'lowpass';
  pluckSoft.frequency.value = 900;
  pulse.connect(pluckSoft).connect(room);

  const me = { ctx, bus, chimes, pulse, timer: 0, pass: 0 };
  bed = me;

  // the warm hum under each line
  const hum = (f: number, at: number, len: number) =>
    [1, 1.5].forEach((m) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f * m;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(m === 1 ? 0.5 : 0.22, at + len * 0.4);
      g.gain.exponentialRampToValueAtTime(0.0001, at + len + 0.6);
      o.connect(g).connect(bus);
      o.start(at);
      o.stop(at + len + 0.7);
    });

  // one pass of the lullaby, then queue the next just before it ends
  const pass = (at: number) => {
    if (bed !== me) return;
    let t = at;
    let beats = 0;
    LULLABY.forEach(([f, b]) => {
      if (beats % 8 === 0) {
        const line = beats / 8;
        hum(ROOTS[line], t, 8 * BEAT);
        // a light step: a muted harp softly picking the chord, one note per beat
        for (let k = 0; k < 8; k++) {
          const pf = PULSE[line][[0, 1, 2, 1][k % 4]];
          note(ctx, pulse, pf, t + k * BEAT, k % 4 === 0 ? 0.7 : 0.5, 1.1, 0.04, 0.012);
        }
        // one chime melody only: it answers in the second and fourth lines, every pass
        if (line === 1 || line === 3) {
          const phrase = ANSWERS[line][(me.pass + line) % ANSWERS[line].length];
          // in the line's second half, between the tune's beats, so they weave around it
          const start = t + 4.5 * BEAT;
          // one chime per beat (not per half beat), each swelling in softly and ringing long
          phrase.forEach((cf, i) => note(ctx, chimes, cf, start + i * BEAT, i === phrase.length - 1 ? 0.6 : 0.75, 3.8, 0.05, 0.2));
        }
      }
      note(ctx, bus, f, t, 0.9, 3.2);
      t += b * BEAT;
      beats += b;
    });
    me.pass++;
    me.timer = window.setTimeout(() => pass(t), (t - ctx.currentTime - 1) * 1000);
  };
  pass(now + 0.3);
}

function stopBed() {
  const me = bed;
  if (!me) return;
  bed = null;
  clearTimeout(me.timer);
  const t = me.ctx.currentTime;
  for (const g of [me.bus, me.chimes, me.pulse]) {
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.5); // slow fade out
  }
  setTimeout(() => {
    me.bus.disconnect();
    me.chimes.disconnect();
    me.pulse.disconnect();
  }, 3200);
}

let boxOpen = false;
function update() {
  if (on && boxOpen) startBed();
  else stopBed();
}

/** Call with true while the About section is on screen, false when it leaves. */
export function setSkyAmbience(visible: boolean) {
  if (visible === on) return;
  on = visible;
  update();
}

/** The About music box: the tune only plays while its lid is open. */
export function setMusicBoxOpen(open: boolean) {
  boxOpen = open;
  update();
}
