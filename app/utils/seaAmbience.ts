import { retroAudio, MUTE_EVENT } from './retroAudio';

/**
 * Gentle sea ambience for the beach: a 42-second stretch of a real recording
 * (public/audio/sea-loop.mp3, cut from freesound_community's "night cyprus sea"),
 * played on a loop while the beach is on screen. Each pass overlaps the next by a few
 * seconds with a crossfade, so the loop point is never heard. It fades in and out with
 * the beach, follows the site's mute switch, and goes through the same output (and
 * laptop enhancer) as every other sound.
 */

const URL = '/audio/sea-loop.mp3';
const LEVEL = 0.3;
const XFADE = 4; // seconds of overlap between passes

let buf: Promise<AudioBuffer | null> | null = null;
let wanted = false;
let running: { ctx: AudioContext; bus: GainNode; timer: number; sources: AudioBufferSourceNode[] } | null = null;

function begin() {
  if (running || !wanted) return;
  const io = retroAudio.getOutput();
  if (!io) return; // muted: we'll try again when sound is turned on
  const { ctx } = io;
  buf ??= fetch(URL)
    .then((r) => r.arrayBuffer())
    .then((b) => ctx.decodeAudioData(b))
    .catch(() => null);
  const bus = ctx.createGain();
  bus.gain.value = 0;
  bus.connect(io.out);
  const me = { ctx, bus, timer: 0, sources: [] as AudioBufferSourceNode[] };
  running = me;

  buf.then((b) => {
    if (!b || running !== me) return;
    bus.gain.setValueAtTime(0, ctx.currentTime);
    bus.gain.linearRampToValueAtTime(LEVEL, ctx.currentTime + 2.5);
    // schedule pass after pass, each fading in while the previous fades out
    const pass = (at: number) => {
      if (running !== me) return;
      const src = ctx.createBufferSource();
      src.buffer = b;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(1, at + XFADE);
      g.gain.setValueAtTime(1, at + b.duration - XFADE);
      g.gain.linearRampToValueAtTime(0, at + b.duration);
      src.connect(g).connect(bus);
      src.start(at);
      src.stop(at + b.duration);
      me.sources = [...me.sources.slice(-1), src];
      const next = at + b.duration - XFADE;
      me.timer = window.setTimeout(() => pass(next), Math.max(0, (next - ctx.currentTime - 1) * 1000));
    };
    pass(ctx.currentTime + 0.05);
  });
}

function end() {
  const me = running;
  if (!me) return;
  running = null;
  clearTimeout(me.timer);
  const t = me.ctx.currentTime;
  me.bus.gain.cancelScheduledValues(t);
  me.bus.gain.setValueAtTime(me.bus.gain.value, t);
  me.bus.gain.linearRampToValueAtTime(0, t + 1.5);
  setTimeout(() => {
    me.sources.forEach((s) => {
      try {
        s.stop();
      } catch {
        /* already stopped */
      }
    });
    me.bus.disconnect();
  }, 1700);
}

// muted while the beach is showing, then unmuted: start then
if (typeof window !== 'undefined') {
  window.addEventListener(MUTE_EVENT, () => {
    if (retroAudio.getMuted()) end();
    else begin();
  });
}

/** Call with true while the beach is on screen, false when it leaves. */
export function setSeaAmbience(on: boolean) {
  wanted = on;
  if (on) begin();
  else end();
}
