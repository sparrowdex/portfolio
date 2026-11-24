import { retroAudio } from './retroAudio';

/**
 * Music for the About section while Sreeja's laptop is open: a mellow lo-fi boom-bap beat,
 * all synthesised. A swung kick / snare / hi-hat groove at 88 BPM, a warm electric-piano
 * chord loop (Fmaj7 · Em7 · Dm7 · Cmaj7) with a soft bass line, and a little record
 * crackle, through a gentle low-pass so it sits in the background. It fades in when the
 * laptop opens and out when it closes or you scroll away.
 */

const BPM = 88;
const STEP = 60 / BPM / 4; // one 16th note
const SWING = 0.12; // push every second 16th a little late

// drums over one bar of 16 steps
const KICK = [0, 7, 10];
const SNARE = [4, 12];
const HAT = [0, 2, 4, 6, 8, 10, 12, 14];
const GHOST = [15]; // a soft extra snare before the bar repeats

// chords (one per bar) and their bass notes
const CHORDS = [
  [174.61, 220, 261.63, 329.63], // Fmaj7
  [164.81, 196, 246.94, 293.66], // Em7
  [146.83, 174.61, 220, 261.63], // Dm7
  [130.81, 164.81, 196, 246.94], // Cmaj7
];
const BASS = [87.31, 82.41, 73.42, 65.41];

let on = false;
let laptopOpen = false;
let rig: { ctx: AudioContext; bus: GainNode; timer: number; crackle: AudioBufferSourceNode } | null = null;

let noiseBuf: AudioBuffer | null = null;
function noise(ctx: AudioContext) {
  if (!noiseBuf || noiseBuf.sampleRate !== ctx.sampleRate) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = ctx.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

function env(ctx: AudioContext, at: number, peak: number, attack: number, decay: number) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay);
  return g;
}

function kick(ctx: AudioContext, out: AudioNode, at: number) {
  const o = ctx.createOscillator();
  o.frequency.setValueAtTime(130, at);
  o.frequency.exponentialRampToValueAtTime(46, at + 0.12);
  o.connect(env(ctx, at, 1, 0.004, 0.32)).connect(out);
  o.start(at);
  o.stop(at + 0.4);
}

function snare(ctx: AudioContext, out: AudioNode, at: number, vol = 0.55) {
  const n = noise(ctx);
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = 1900;
  f.Q.value = 0.7;
  n.connect(f).connect(env(ctx, at, vol, 0.003, 0.2)).connect(out);
  n.start(at, Math.random() * 0.5);
  n.stop(at + 0.25);
  const o = ctx.createOscillator();
  o.frequency.setValueAtTime(200, at);
  o.frequency.exponentialRampToValueAtTime(150, at + 0.08);
  o.connect(env(ctx, at, vol * 0.5, 0.003, 0.1)).connect(out);
  o.start(at);
  o.stop(at + 0.15);
}

function hat(ctx: AudioContext, out: AudioNode, at: number, vol: number) {
  const n = noise(ctx);
  const f = ctx.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = 7000;
  n.connect(f).connect(env(ctx, at, vol, 0.002, 0.05)).connect(out);
  n.start(at, Math.random() * 0.5);
  n.stop(at + 0.08);
}

/** A soft electric-piano note: two slightly detuned sines and a faint bell overtone. */
function keys(ctx: AudioContext, out: AudioNode, f: number, at: number, vol: number, len: number) {
  [
    [1, 1, -3],
    [1, 1, 3],
    [3, 0.06, 0],
  ].forEach(([m, level, cents]) => {
    const o = ctx.createOscillator();
    o.frequency.value = f * m;
    o.detune.value = cents;
    o.connect(env(ctx, at, vol * level, 0.012, len)).connect(out);
    o.start(at);
    o.stop(at + len + 0.05);
  });
}

function bass(ctx: AudioContext, out: AudioNode, f: number, at: number, len: number) {
  [f, f * 2].forEach((hz, i) => {
    const o = ctx.createOscillator();
    o.frequency.value = hz;
    o.connect(env(ctx, at, i ? 0.18 : 0.55, 0.02, len)).connect(out);
    o.start(at);
    o.stop(at + len + 0.05);
  });
}

function crackleBuffer(ctx: AudioContext) {
  const len = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    d[i] = (Math.random() * 2 - 1) * 0.03;
    if (Math.random() < 0.0005) d[i] += (Math.random() < 0.5 ? -1 : 1) * (0.3 + Math.random() * 0.5);
  }
  return buf;
}

function start() {
  if (rig) return;
  const io = retroAudio.getOutput();
  if (!io) return;
  const { ctx, out } = io;
  const now = ctx.currentTime;

  // the whole beat through a warm low-pass, faded in
  const bus = ctx.createGain();
  bus.gain.setValueAtTime(0.0001, now);
  bus.gain.exponentialRampToValueAtTime(0.16, now + 2.5);
  const warm = ctx.createBiquadFilter();
  warm.type = 'lowpass';
  warm.frequency.value = 3200;
  bus.connect(warm).connect(out);

  const drums = ctx.createGain();
  drums.gain.value = 0.9;
  drums.connect(bus);
  const music = ctx.createGain();
  music.gain.value = 0.5;
  const musicTone = ctx.createBiquadFilter();
  musicTone.type = 'lowpass';
  musicTone.frequency.value = 1800;
  music.connect(musicTone).connect(bus);

  const crackleGain = ctx.createGain();
  crackleGain.gain.value = 0.35;
  const crackle = ctx.createBufferSource();
  crackle.buffer = crackleBuffer(ctx);
  crackle.loop = true;
  crackle.connect(crackleGain).connect(bus);
  crackle.start(now);

  // schedule a little ahead, step by step
  let step = 0;
  let next = now + 0.1;
  const me = { ctx, bus, timer: 0, crackle };
  rig = me;
  me.timer = window.setInterval(() => {
    while (next < ctx.currentTime + 0.35) {
      const s = step % 16;
      const bar = Math.floor(step / 16) % CHORDS.length;
      const at = next + (s % 2 ? SWING * STEP : 0);
      if (KICK.includes(s)) kick(ctx, drums, at);
      if (SNARE.includes(s)) snare(ctx, drums, at);
      if (GHOST.includes(s) && bar % 2) snare(ctx, drums, at, 0.16);
      if (HAT.includes(s)) hat(ctx, drums, at, s % 4 === 2 ? 0.16 : 0.1);
      if (s === 0) {
        CHORDS[bar].forEach((f, i) => keys(ctx, music, f * 2, at + i * 0.012, 0.22, 2.2));
        bass(ctx, music, BASS[bar], at, 1.1);
      }
      if (s === 10) CHORDS[bar].slice(1).forEach((f) => keys(ctx, music, f * 2, at, 0.12, 0.9)); // a soft off-beat stab
      if (s === 8) bass(ctx, music, BASS[bar], at, 0.5);
      next += STEP;
      step++;
    }
  }, 90);
}

function stop() {
  const me = rig;
  if (!me) return;
  rig = null;
  clearInterval(me.timer);
  const t = me.ctx.currentTime;
  me.bus.gain.cancelScheduledValues(t);
  me.bus.gain.setValueAtTime(Math.max(0.0001, me.bus.gain.value), t);
  me.bus.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
  setTimeout(() => {
    me.crackle.stop();
    me.bus.disconnect();
  }, 1800);
}

function update() {
  if (on && laptopOpen) start();
  else stop();
}

/** Call with true while the About section is on screen, false when it leaves. */
export function setSkyAmbience(visible: boolean) {
  if (visible === on) return;
  on = visible;
  update();
}

/** The beat only plays while the laptop is open. */
export function setMusicBoxOpen(open: boolean) {
  laptopOpen = open;
  update();
}
