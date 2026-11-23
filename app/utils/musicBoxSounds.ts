import { retroAudio } from './retroAudio';

/**
 * Wooden music-box sounds, synthesised: the lid's hinge creaking open with a soft latch
 * click, and the lid closing with a low wooden knock. Kept quiet and warm.
 */

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

/** A small wooden tap: a short burst of low, woody resonance. */
function knock(ctx: AudioContext, out: AudioNode, at: number, pitch: number, vol: number) {
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(pitch, at);
  o.frequency.exponentialRampToValueAtTime(pitch * 0.55, at + 0.12);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.16);
  o.connect(g).connect(out);
  o.start(at);
  o.stop(at + 0.2);
  const n = noise(ctx);
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = pitch * 4;
  f.Q.value = 2;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(vol * 0.5, at);
  ng.gain.exponentialRampToValueAtTime(0.0001, at + 0.05);
  n.connect(f).connect(ng).connect(out);
  n.start(at);
  n.stop(at + 0.08);
}

/** The lid opening: the latch clicks, then the hinge gives a soft, slow creak. */
export function playLidOpen() {
  const io = retroAudio.getOutput();
  if (!io) return;
  const { ctx, out } = io;
  const t = ctx.currentTime + 0.02;
  knock(ctx, out, t, 900, 0.12); // latch
  // the creak: a narrow band of friction noise whose pitch wobbles up as the hinge turns
  const n = noise(ctx);
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = 14;
  f.frequency.setValueAtTime(520, t + 0.1);
  f.frequency.linearRampToValueAtTime(760, t + 0.9);
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 26;
  const wobble = ctx.createGain();
  wobble.gain.value = 40;
  lfo.connect(wobble).connect(f.frequency);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t + 0.1);
  g.gain.exponentialRampToValueAtTime(0.16, t + 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1);
  n.connect(f).connect(g).connect(out);
  n.start(t + 0.1);
  n.stop(t + 1.05);
  lfo.start(t + 0.1);
  lfo.stop(t + 1.05);
}

/** The lid closing: a short creak, then a soft wooden knock as it settles, and the latch. */
export function playLidClose() {
  const io = retroAudio.getOutput();
  if (!io) return;
  const { ctx, out } = io;
  const t = ctx.currentTime + 0.02;
  const n = noise(ctx);
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = 14;
  f.frequency.setValueAtTime(700, t);
  f.frequency.linearRampToValueAtTime(500, t + 0.45);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.1, t + 0.15);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  n.connect(f).connect(g).connect(out);
  n.start(t);
  n.stop(t + 0.55);
  knock(ctx, out, t + 0.55, 160, 0.35); // the lid lands
  knock(ctx, out, t + 0.72, 900, 0.08); // the latch
}
