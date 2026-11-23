import { retroAudio } from './retroAudio';

/**
 * "Plant music" for the skill garden, in the spirit of biodata sonification (the
 * devices that clip electrodes to a leaf and turn tiny changes in its electrical
 * conductance into notes). There's no real plant here: each flower gets a simulated
 * conductance signal, a slow random drift with the occasional spike, and every
 * time the signal jumps enough, it plays a note from that flower's scale. Bigger
 * jumps play louder. A soft echo gives it the airy, wandering sound those
 * recordings have. Each flower has its own scale, voice and pace.
 */

type Voice = {
  /** scale steps in semitones above the root */
  scale: number[];
  root: number;
  wave: OscillatorType;
  /** ms between readings of the "plant" */
  tick: number;
  /** how far the signal must jump to play a note */
  threshold: number;
  attack: number;
  /** a low note humming under the melody */
  drone?: boolean;
  vibrato?: number;
  /** lowpass cutoff, Hz */
  tone: number;
  /** add a quieter copy an octave up, for small speakers */
  lift?: boolean;
};

// The low, warm voices keep their original pitch; `lift` doubles every note an octave up,
// quieter, so laptop speakers (which can't play deep notes) still carry the melody.
const VOICES: Record<string, Voice> = {
  // bright, plucky major pentatonic
  tulip: { scale: [0, 2, 4, 7, 9, 12, 14, 16], root: 261.63, wave: 'sine', tick: 230, threshold: 0.07, attack: 0.02, tone: 4200, lift: true },
  // high, sparkly, quick: already sits where every speaker can play it
  daisy: { scale: [0, 2, 4, 7, 9, 12, 14, 16, 19], root: 587.33, wave: 'triangle', tick: 180, threshold: 0.08, attack: 0.01, tone: 6000 },
  // warm and slow, lydian with a drone underneath
  sunflower: { scale: [0, 2, 4, 6, 7, 9, 11, 12], root: 196, wave: 'sine', tick: 340, threshold: 0.07, attack: 0.12, drone: true, tone: 2600, lift: true },
  // dreamy minor pentatonic with a little vibrato
  lily: { scale: [0, 3, 5, 7, 10, 12, 15, 17], root: 220, wave: 'sine', tick: 300, threshold: 0.07, attack: 0.08, vibrato: 5, tone: 3200, lift: true },
  // soft and velvety, major seventh colours
  rose: { scale: [0, 4, 7, 11, 12, 14, 16, 19], root: 174.61, wave: 'square', tick: 280, threshold: 0.07, attack: 0.05, tone: 1400, lift: true },
};

const LENGTH_MS = 9000;
let current: { stop: () => void } | null = null;

export function stopPlantSong() {
  current?.stop();
  current = null;
}

export function playPlantSong(kind: string) {
  stopPlantSong();
  const voice = VOICES[kind];
  const io = retroAudio.getOutput();
  if (!voice || !io) return; // muted, or no audio
  const { ctx, out } = io;

  // bus → lowpass → dry + echo → site output
  const bus = ctx.createGain();
  bus.gain.value = 0;
  bus.gain.linearRampToValueAtTime(0.32, ctx.currentTime + 0.4);
  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = voice.tone;
  const echo = ctx.createDelay(1);
  echo.delayTime.value = 0.33;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.38;
  const wet = ctx.createGain();
  wet.gain.value = 0.5;
  bus.connect(tone);
  // the octave-up layer: same fade in/out as the bus, straight to the echo and output
  const lift = ctx.createGain();
  lift.gain.value = 0;
  lift.gain.linearRampToValueAtTime(0.32, ctx.currentTime + 0.4);
  lift.connect(out);
  lift.connect(echo);
  tone.connect(out);
  tone.connect(echo);
  echo.connect(feedback);
  feedback.connect(echo);
  echo.connect(wet);
  wet.connect(out);

  const freq = (step: number) => voice.root * Math.pow(2, step / 12);
  const note = (f: number, vel: number, dur: number) => {
    const t = ctx.currentTime + 0.02;
    const osc = ctx.createOscillator();
    osc.type = voice.wave;
    osc.frequency.value = f;
    if (voice.vibrato) {
      const lfo = ctx.createOscillator();
      const depth = ctx.createGain();
      lfo.frequency.value = voice.vibrato;
      depth.gain.value = f * 0.006;
      lfo.connect(depth);
      depth.connect(osc.frequency);
      lfo.start(t);
      lfo.stop(t + dur + 0.1);
    }
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(Math.max(0.002, vel), t + voice.attack);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(env);
    env.connect(bus);
    osc.start(t);
    osc.stop(t + dur + 0.05);
    if (voice.lift) {
      // the octave-up copy skips the voice's lowpass so it stays clear on laptop speakers
      const hi = ctx.createOscillator();
      hi.type = 'triangle';
      hi.frequency.value = f * 2;
      const hiEnv = ctx.createGain();
      hiEnv.gain.setValueAtTime(0.0001, t);
      hiEnv.gain.exponentialRampToValueAtTime(Math.max(0.002, vel * 0.55), t + voice.attack);
      hiEnv.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.8);
      hi.connect(hiEnv);
      hiEnv.connect(lift);
      hi.start(t);
      hi.stop(t + dur + 0.05);
    }
  };

  // a hum under the sunflower
  let drone: OscillatorNode | null = null;
  if (voice.drone) {
    drone = ctx.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = voice.root / 2;
    const g = ctx.createGain();
    g.gain.value = 0.08;
    drone.connect(g);
    g.connect(bus);
    drone.start();
  }

  // the simulated conductance signal
  let level = 0.5;
  let prev = level;
  let drift = 0;
  const reading = () => {
    drift = drift * 0.85 + (Math.random() - 0.5) * 0.06;
    level += drift + (Math.random() - 0.5) * 0.05;
    if (Math.random() < 0.07) level += (Math.random() - 0.5) * 0.4; // the plant "responds"
    level = Math.min(1, Math.max(0, level));
    const jump = Math.abs(level - prev);
    prev = level;
    if (jump < voice.threshold) return;
    const step = voice.scale[Math.min(voice.scale.length - 1, Math.floor(level * voice.scale.length))];
    const vel = Math.min(0.5, 0.12 + jump * 1.2);
    note(freq(step), vel, 0.6 + Math.random() * 1.2);
    if (Math.random() < 0.18) note(freq(step + 12), vel * 0.4, 0.8); // an occasional shimmer an octave up
  };

  reading();
  const timer = setInterval(reading, voice.tick);
  const end = setTimeout(() => stopPlantSong(), LENGTH_MS);

  current = {
    stop: () => {
      clearInterval(timer);
      clearTimeout(end);
      const t = ctx.currentTime;
      bus.gain.cancelScheduledValues(t);
      bus.gain.setValueAtTime(bus.gain.value, t);
      bus.gain.linearRampToValueAtTime(0, t + 0.8);
      lift.gain.cancelScheduledValues(t);
      lift.gain.setValueAtTime(lift.gain.value, t);
      lift.gain.linearRampToValueAtTime(0, t + 0.8);
      drone?.stop(t + 0.9);
      // let the echo tail ring out, then let go of the nodes
      setTimeout(() => {
        bus.disconnect();
        lift.disconnect();
        wet.disconnect();
        tone.disconnect();
      }, 3000);
    },
  };
}
