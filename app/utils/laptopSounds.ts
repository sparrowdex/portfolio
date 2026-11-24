import { retroAudio } from './retroAudio';

/**
 * Laptop sounds, synthesised: the lid lifting (a soft hinge swish and a gentle,
 * original two-note start-up chime) and the lid closing (a soft click as it meets the base).
 */

function tone(ctx: AudioContext, out: AudioNode, f: number, at: number, vol: number, ring: number) {
  [
    [1, 1],
    [2, 0.15],
  ].forEach(([m, level]) => {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = f * m;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vol * level, at + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, at + ring);
    o.connect(g).connect(out);
    o.start(at);
    o.stop(at + ring + 0.05);
  });
}

function swish(ctx: AudioContext, out: AudioNode, at: number, len: number, from: number, to: number, vol: number) {
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / d.length);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = 1.2;
  f.frequency.setValueAtTime(from, at);
  f.frequency.linearRampToValueAtTime(to, at + len);
  const g = ctx.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(out);
  src.start(at);
}

/** The lid lifting, then the screen waking with a soft chime. */
export function playLaptopOpen() {
  const io = retroAudio.getOutput();
  if (!io) return;
  const { ctx, out } = io;
  const t = ctx.currentTime + 0.02;
  swish(ctx, out, t, 0.7, 500, 1400, 0.08);
  tone(ctx, out, 659.25, t + 0.8, 0.12, 1.6); // E5
  tone(ctx, out, 987.77, t + 0.98, 0.1, 2.2); // B5
}

/** The lid closing with a soft click. */
export function playLaptopClose() {
  const io = retroAudio.getOutput();
  if (!io) return;
  const { ctx, out } = io;
  const t = ctx.currentTime + 0.02;
  swish(ctx, out, t, 0.5, 1200, 500, 0.06);
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(300, t + 0.55);
  o.frequency.exponentialRampToValueAtTime(120, t + 0.62);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t + 0.55);
  g.gain.exponentialRampToValueAtTime(0.3, t + 0.556);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
  o.connect(g).connect(out);
  o.start(t + 0.55);
  o.stop(t + 0.75);
}
