'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { PROFILE } from '../../data/profile';
import { useBirthday } from '../../utils/birthday';
import { PROJECTS_DATA } from '../../data/projects';
import type { NowPlaying } from '../../utils/spotify';
import { retroAudio } from '../../utils/retroAudio';
import { OPEN_PHONE_EVENT } from '../RetroPhoneAssistant';
import { openGame, isBerryUnlocked, subscribeBerryUnlock, markBerryUnlocked } from './arcade';
import { OrigamiSwan, type SwanMode } from './OrigamiSwan';
import { setMusicBoxOpen } from '../../utils/skyAmbience';
import { SectionTitle } from './Decor';
import { Laptop } from './Laptop';
import { playLaptopOpen, playLaptopClose } from '../../utils/laptopSounds';

/**
 * About me: Sreeja's own bedazzled laptop, where she codes. Closed, it shows the silver
 * lid with rhinestone swirls; open it and the screen is a code editor with the about-me
 * notes as files (hello.md, now.json, wins.ts, fun.tsx, say-hi.sh, sreeja.jpg), while
 * soft lo-fi music plays. A plain one-line summary sits underneath for quick readers.
 * The origami swan version is kept behind ABOUT_STYLE.
 */

// colours the small pieces below share
const VARS = {
  '--sp-border': 'rgba(255, 143, 216, 0.55)',
  '--sp-head': '#ff5fb0',
  '--sp-head-text': '#ffffff',
  '--sp-muted': '#7a4a6a',
  '--sp-link': '#c2006f',
  '--sp-accent': '#ff2e93',
} as React.CSSProperties;

const WINS = [
  { t: 'Top 10 of 107', d: 'Girls Leading Tech hackathon, built in 4 hours' },
  { t: 'IBM Data Science', d: 'Professional Certificate' },
  { t: 'NPTEL', d: 'Natural Language Processing' },
  { t: 'Mentor', d: 'taught 20+ girls to code' },
];

/** A highlighter swipe over a few words. */
const Hl = ({ children, c = '#fff27a' }: { children: React.ReactNode; c?: string }) => (
  <mark className="nb-hl" style={{ '--hl': c } as React.CSSProperties}>
    {children}
  </mark>
);

function ProfileSong() {
  const [song, setSong] = useState<NowPlaying | null>(null);
  useEffect(() => {
    let alive = true;
    fetch('/api/now-playing')
      .then((r) => r.json())
      .then((j: NowPlaying) => alive && setSong(j))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  const [embed, setEmbed] = useState(false);
  const has = song?.configured && song.title;
  const trackId = song?.url?.match(/open\.spotify\.com\/track\/([A-Za-z0-9]+)/)?.[1];
  if (embed && trackId) {
    return (
      <div>
        {/* Spotify's own player: 30s previews for visitors, full songs if they're logged in */}
        <iframe
          title={`${song?.title} on Spotify`}
          src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator`}
          width="100%"
          height="80"
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          className="rounded-xl border-0 block"
        />
        <button type="button" onClick={() => setEmbed(false)} className="mt-1 text-[0.8em] hover:underline" style={{ color: 'var(--sp-muted)' }}>
          ✕ close player
        </button>
      </div>
    );
  }
  return (
    <div className="nb-cassette">
      <span className="nb-cassette-label">
        <span className="block font-pixel text-sm leading-none text-ink/60">side A · now playing</span>
        <span className="block truncate font-bold leading-tight">{has ? song.title : 'no song yet ♡'}</span>
        {has && <span className="block truncate text-[0.85em] text-ink/65">{song.artist}</span>}
      </span>
      <span className="nb-reels" aria-hidden>
        <span />
        <span />
      </span>
      {has && trackId && (
        <button
          type="button"
          onClick={() => {
            retroAudio.playButtonClack();
            setEmbed(true);
          }}
          aria-label={`Play ${song.title} here`}
          title="play it right here"
          className="absolute -right-2 -top-2 w-8 h-8 rounded-full grid place-items-center text-sm text-white bg-[#ff2e93] shadow-md"
        >
          ▶
        </button>
      )}
    </div>
  );
}

// "Block User" never works. Each click gets the next excuse.
const BLOCK_MESSAGES = [
  "you can't block me, you're literally on my page :(",
  'but what about the sparkles and the butterflies? :(',
  'Per my last email, blocking is not supported at this time. Best regards, Sreeja',
  'error 403: blocking forbidden. you are stuck with me 💗',
  'block me? in THIS economy?',
  'this action requires admin access. the admin is me ✿',
  'ok fine, blocked. (just kidding, refresh and see) ✦',
];

function FriendActions({ toast }: { toast: (msg: string) => void }) {
  const [blockCount, setBlockCount] = useState(0);
  const actions: { icon: string; label: string; onClick: () => void }[] = [
    {
      icon: '✉',
      label: 'Message',
      onClick: () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      icon: '➕',
      label: 'Add friend',
      onClick: () => window.open(PROFILE.links.linkedin, '_blank', 'noopener'),
    },
    {
      icon: '💬',
      label: 'IM',
      onClick: () => window.dispatchEvent(new Event(OPEN_PHONE_EVENT)),
    },
    {
      icon: '↪',
      label: 'Share',
      onClick: () => {
        navigator.clipboard?.writeText(window.location.origin).then(
          () => toast('profile link copied ✦ send it to your bestie'),
          () => toast(window.location.origin),
        );
      },
    },
    {
      icon: '⛔',
      label: 'Block',
      onClick: () => {
        toast(BLOCK_MESSAGES[blockCount % BLOCK_MESSAGES.length]);
        setBlockCount((c) => c + 1);
      },
    },
  ];
  return (
    <p className="nb-hand text-[22px] leading-tight text-[#c2006f]">
      {actions.map((a, i) => (
        <React.Fragment key={a.label}>
          {i > 0 && <span className="text-ink/30"> · </span>}
          <button
            type="button"
            onClick={() => {
              retroAudio.playHover();
              a.onClick();
            }}
            className="underline decoration-wavy decoration-[#ff8fd8] underline-offset-4 hover:text-ink"
          >
            {a.label.toLowerCase()}
            {a.label === 'Block' ? ' (try it)' : ''}
          </button>
        </React.Fragment>
      ))}
    </p>
  );
}

/* One game to play, one to find (Berry Basket unlocks once discovered). */
function Arcade() {
  const berry = useSyncExternalStore(subscribeBerryUnlock, isBerryUnlocked, () => false);
  const play = (id: 'berry' | 'stack') => {
    retroAudio.playCassetteInsert();
    openGame(id);
  };
  return (
    <div className="flex gap-3">
      <button type="button" onClick={() => play('stack')} className="nb-cart" style={{ '--cart': '#8fd3ff' } as React.CSSProperties}>
        <span className="nb-cart-label">
          <span aria-hidden className="text-xl">
            💿
          </span>
          <b>Disc Stacker</b>
          <span>▶ play</span>
        </span>
      </button>
      {berry ? (
        <button type="button" onClick={() => play('berry')} className="nb-cart" style={{ '--cart': '#ff9cc6' } as React.CSSProperties}>
          <span className="nb-cart-label">
            <span aria-hidden className="text-xl">
              🍓
            </span>
            <b>Berry Basket</b>
            <span>found it! ▶</span>
          </span>
        </button>
      ) : (
        <span className="nb-cart is-locked" title="psst… the pink banner up top is ticklish" style={{ '--cart': '#d9cfd8' } as React.CSSProperties}>
          <span className="nb-cart-label">
            <span aria-hidden className="text-xl">
              🔒
            </span>
            <b>???</b>
            <span>secret</span>
          </span>
        </span>
      )}
    </div>
  );
}

/* ── the origami swan ── */

const UNFOLD_URL = '/audio/unfolding_paper.mp3';

type Stage = 'away' | 'flying' | 'perched' | 'unfolding' | 'open' | 'folding';

let unfoldBuf: Promise<AudioBuffer | null> | null = null;
/** Your recorded paper-unfolding sound, through the site's output (so mute covers it). */
function playUnfoldSound(reverse = false) {
  const io = retroAudio.getOutput();
  if (!io) return;
  const { ctx, out } = io;
  unfoldBuf ??= fetch(UNFOLD_URL)
    .then((r) => r.arrayBuffer())
    .then((b) => ctx.decodeAudioData(b))
    .catch(() => null);
  unfoldBuf.then((buf) => {
    if (!buf) return;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    if (reverse) src.playbackRate.value = 1.6; // folding back up is quicker
    const g = ctx.createGain();
    g.gain.value = 0.8;
    src.connect(g).connect(out);
    src.start();
  });
}

/** Which About-me presentation to show: the laptop, or the origami swan (kept for comparison). */
const ABOUT_STYLE: 'laptop' | 'swan' = 'laptop';

/* ── the code editor on the laptop's screen ── */

// tiny syntax-highlighting pieces
const Kw = ({ children }: { children: React.ReactNode }) => <span className="ed-kw">{children}</span>;
const Key = ({ children }: { children: React.ReactNode }) => <span className="ed-key">{children}</span>;
const Str = ({ children }: { children: React.ReactNode }) => <span className="ed-str">{children}</span>;
const Num = ({ children }: { children: React.ReactNode }) => <span className="ed-num">{children}</span>;
const Com = ({ children }: { children: React.ReactNode }) => <span className="ed-com">{children}</span>;
const Hd = ({ children }: { children: React.ReactNode }) => <span className="ed-hd">{children}</span>;

type EdFile = { name: string; icon: string; lines?: React.ReactNode[] };

const FILES: EdFile[] = [
  {
    name: 'hello.md',
    icon: '✿',
    lines: [
      <Hd key="h"># hi, i&apos;m Sreeja ✿</Hd>,
      '',
      'I fell for computer science through creative coding,',
      'and I still build things that reward curiosity:',
      '- a photobooth that prints strips',
      '- a snow globe you blow on',
      '- a garden of 3D flowers for my friends',
      '',
      <>
        These days most of my time goes into <b className="ed-bold">**The Diecast Store**</b>,
      </>,
      <>
        which I built as a freelancer and now help run as <b className="ed-bold">**co-founder &amp; CTO**</b>.
      </>,
    ],
  },
  {
    name: 'now.json',
    icon: '{}',
    lines: [
      '{',
      <>
        {'  '}
        <Key>&quot;building&quot;</Key>: <Str>&quot;The Diecast Store (Co-Founder &amp; CTO)&quot;</Str>,
      </>,
      <>
        {'  '}
        <Key>&quot;studying&quot;</Key>: <Str>&quot;B.Tech CSE @ SRM, class of &apos;27&quot;</Str>,
      </>,
      <>
        {'  '}
        <Key>&quot;cgpa&quot;</Key>: <Num>9.05</Num>,
      </>,
      <>
        {'  '}
        <Key>&quot;openTo&quot;</Key>: [<Str>&quot;freelance&quot;</Str>, <Str>&quot;remote&quot;</Str>, <Str>&quot;flexible roles&quot;</Str>],
      </>,
      <>
        {'  '}
        <Key>&quot;basedIn&quot;</Key>: <Str>&quot;New Delhi, India&quot;</Str>,
      </>,
      <>
        {'  '}
        <Key>&quot;into&quot;</Key>: [<Str>&quot;WebGL toys&quot;</Str>, <Str>&quot;Web Audio&quot;</Str>, <Str>&quot;mental-health tech&quot;</Str>]
      </>,
      '}',
    ],
  },
  {
    name: 'wins.ts',
    icon: 'TS',
    lines: [
      <Com key="c">{'// little wins so far ✦'}</Com>,
      <>
        <Kw>export const</Kw> wins = [
      </>,
      ...WINS.map((w) => (
        <>
          {'  '}
          {'{ '}
          <Key>title</Key>: <Str>&quot;{w.t}&quot;</Str>, <Key>note</Key>: <Str>&quot;{w.d}&quot;</Str>
          {' },'}
        </>
      )),
      '];',
    ],
  },
  { name: 'fun.tsx', icon: '♫' },
  { name: 'say-hi.sh', icon: '$' },
  { name: 'sreeja.jpg', icon: '▣' },
];

/* ── the terminal at the bottom of the editor: type on the laptop's keyboard or your own ── */

const QUIZ_WIN_EVENT = 'about-quiz-win';

/* her birthday cake: blown out once per visit */
const CAKE_KEY = 'birthday_cake_blown';
// "happy birthday", as [note, beats]
const BIRTHDAY_TUNE: [number, number][] = [
  [392, 0.75],
  [392, 0.25],
  [440, 1],
  [392, 1],
  [523, 1],
  [494, 2],
  [392, 0.75],
  [392, 0.25],
  [440, 1],
  [392, 1],
  [587, 1],
  [523, 2],
  [392, 0.75],
  [392, 0.25],
  [784, 1],
  [659, 1],
  [523, 1],
  [494, 1],
  [440, 2],
  [698, 0.75],
  [698, 0.25],
  [659, 1],
  [523, 1],
  [587, 1],
  [523, 3],
];
const BEAT = 0.36;
const BIRTHDAY_TUNE_MS = BIRTHDAY_TUNE.reduce((t, [, b]) => t + b, 0) * BEAT * 1000;
/** Play the tune like a little music box, after `delay` ms; returns a stop function. */
function playBirthdayTune(delay = 0) {
  const timers: number[] = [];
  let at = delay;
  for (const [f, b] of BIRTHDAY_TUNE) {
    timers.push(window.setTimeout(() => retroAudio.playNote(f, 0.22, Math.min(0.9, b * BEAT * 1.4)), at));
    at += b * BEAT * 1000;
  }
  return () => timers.forEach(clearTimeout);
}

/** Confetti of hearts and sparkles, falling across the page for a few seconds. */
const CONFETTI = Array.from({ length: 44 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: ((i * 13) % 20) / 10,
  dur: 2.4 + ((i * 7) % 10) / 6,
  glyph: ['♡', '✦', '💗', '✿', '✧'][i % 5],
  color: ['#ff5fa2', '#ffd27a', '#c9a7ff', '#7fe3ff', '#ff8fc4'][i % 5],
  drift: ((i * 29) % 60) - 30,
}));
function Confetti() {
  return (
    <div className="qz-confetti" aria-hidden>
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          style={
            {
              left: `${c.left}%`,
              color: c.color,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.dur}s`,
              '--drift': `${c.drift}px`,
            } as React.CSSProperties
          }
        >
          {c.glyph}
        </span>
      ))}
    </div>
  );
}

type TermLine = { t: string; kind?: 'in' | 'ok' | 'err' | 'dim' | 'hi' };

// a little quiz about Sreeja; every answer is something true on this site
const QUIZ: { q: string; ok: (a: string) => boolean; yes: string }[] = [
  {
    q: "what's my favourite command to run?",
    ok: (a) => /npm\s+run\s+dev/.test(a),
    yes: 'npm run dev, every single time ♡',
  },
  {
    q: 'which store am I co-founder & CTO of?',
    ok: (a) => /diecast/.test(a),
    yes: 'The Diecast Store 🏎️',
  },
  {
    q: 'which of my projects placed top 10 of 107?',
    ok: (a) => /snow|globe|timeless|christmas/.test(a),
    yes: 'Timeless, the snow globe you blow on ❄',
  },
  { q: "what's my CGPA?", ok: (a) => /9\.?05/.test(a), yes: '9.05 ✦' },
];

const HELP: TermLine[] = [
  { t: 'commands:', kind: 'dim' },
  { t: '  whoami      who is this', kind: 'dim' },
  { t: '  projects    what I have built', kind: 'dim' },
  { t: '  skills      what I work with', kind: 'dim' },
  { t: '  contact     how to reach me', kind: 'dim' },
  { t: '  quiz        how well do you know me?', kind: 'dim' },
  { t: '  clear       start over', kind: 'dim' },
];

function respond(cmd: string): TermLine[] | 'clear' | 'quiz' | 'resume' {
  const c = cmd.trim().toLowerCase();
  if (!c) return [];
  if (c === 'help' || c === '?') return HELP;
  if (c === 'clear' || c === 'cls') return 'clear';
  if (c === 'quiz') return 'quiz';
  if (c === 'resume' || c === 'cv') return 'resume';
  if (c === 'whoami')
    return [
      {
        t: "Sreeja Das · Co-Founder & CTO @ The Diecast Store · B.Tech CSE '27 · New Delhi",
        kind: 'ok',
      },
    ];
  if (c === 'projects' || c === 'ls')
    return PROJECTS_DATA.map((p) => ({
      t: `  ${p.title.split(':')[0]}${p.pitch ? `  — ${p.pitch}` : ''}`,
    }));
  if (c === 'skills')
    return [
      {
        t: 'Next.js · React · TypeScript · Three.js · R3F · GLSL · Node · Postgres · Prisma · Firebase · Web Audio',
        kind: 'ok',
      },
    ];
  if (c === 'contact' || c === 'email')
    return [
      {
        t: `${PROFILE.email} · linkedin.com/in/sreeja-das · github.com/sparrowdex`,
        kind: 'ok',
      },
    ];
  if (/^npm\s+run\s+dev/.test(c))
    return [
      { t: '▲ ready on http://localhost:3000', kind: 'ok' },
      { t: 'my favourite command, how did you know? ♡', kind: 'hi' },
    ];
  if (/^(sudo|rm|del|format)\b/.test(c)) return [{ t: 'nice try ✿', kind: 'err' }];
  if (c === 'dir') return PROJECTS_DATA.map((p) => ({ t: `  ${p.title.split(':')[0]}` }));
  if (c === 'hi' || c === 'hello' || c === 'hey') return [{ t: 'hiii ✦ type help to look around', kind: 'hi' }];
  return [{ t: `command not found: ${c} · try help`, kind: 'err' }];
}

/** Everything the editor remembers, kept above it so it survives moving to the up-close view. */
type EdState = {
  active: string;
  lines: TermLine[];
  input: string;
  quiz: { i: number; score: number } | null;
  history: string[];
  histPos: number;
  candlesOut: boolean;
};
const BIRTHDAY_FILE: EdFile = { name: 'birthday.md', icon: '🎂' };

/**
 * Listen to the mic for a while; a breath into it calls `onBlow`. Blowing on a mic is a
 * low rumble, so this watches the lowest frequencies rather than overall loudness. The
 * AudioContext is made (and resumed) right in the click, before the permission prompt,
 * or the browser starts it paused and it only ever hears silence. The browser's own noise
 * suppression is off too, since it scrubs out exactly that sound.
 */
function useBlow(onBlow: () => void) {
  const [listening, setListening] = useState(false);
  const cb = useRef(onBlow);
  useEffect(() => {
    cb.current = onBlow;
  });
  const listen = async () => {
    if (listening) return;
    const ctx = new AudioContext();
    ctx.resume().catch(() => {});
    setListening(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      if (ctx.state !== 'running') await ctx.resume();
      const an = ctx.createAnalyser();
      an.fftSize = 512;
      an.smoothingTimeConstant = 0.3;
      ctx.createMediaStreamSource(stream).connect(an);
      const bins = new Uint8Array(an.frequencyBinCount);
      const started = performance.now();
      let loud = 0;
      const stopAll = () => {
        stream.getTracks().forEach((t) => t.stop());
        ctx.close();
        setListening(false);
      };
      const check = () => {
        an.getByteFrequencyData(bins);
        // the bottom ~1kHz, where the rush of breath on the mic lands
        let low = 0;
        for (let i = 0; i < 12; i++) low += bins[i];
        low /= 12;
        loud = low > 150 ? loud + 1 : Math.max(0, loud - 1);
        if (loud >= 6) {
          cb.current();
          return stopAll();
        }
        if (performance.now() - started > 15000) return stopAll();
        requestAnimationFrame(check);
      };
      check();
    } catch {
      ctx.close();
      setListening(false);
    }
  };
  return { listening, listen };
}

/** A cake with five candles; blow them out by typing `blow`, or by blowing into the mic. */
function BirthdayCake({ store }: { store: EdStore }) {
  const out = store.st.candlesOut;
  const blowOut = () => {
    if (store.st.candlesOut) return;
    retroAudio.playBell();
    store.set({
      ...store.st,
      candlesOut: true,
      lines: [...store.st.lines, { t: '🎂 *whoosh* you blew them out! make a wish ✦', kind: 'hi' }],
    });
  };
  const blowRef = useRef(blowOut);
  useEffect(() => {
    blowRef.current = blowOut;
  });
  const { listening, listen: useMic } = useBlow(() => blowRef.current());
  return (
    <div className="bd-file">
      <p className="ed-hd"># it&apos;s my birthday today 🎂</p>
      <p className="ed-com">{'// 4 December. thanks for stopping by ♡'}</p>
      <div
        className={`bd-cake ${out ? 'is-out' : ''}`}
        aria-label={out ? 'a birthday cake, candles blown out' : 'a birthday cake with five lit candles'}
        role="img"
      >
        <div className="bd-candles">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="bd-candle" style={{ '--i': i } as React.CSSProperties}>
              <i className="bd-flame" />
              <i className="bd-smoke" />
            </span>
          ))}
        </div>
        <div className="bd-tier is-top" />
        <div className="bd-tier is-bottom" />
        <div className="bd-plate" />
      </div>
      {out ? (
        <p className="ed-str">make a wish ✦ (type relight to try again)</p>
      ) : (
        <p>
          type <span className="ed-key">blow</span> in the terminal, or{' '}
          <button type="button" className="ed-zoom" onClick={useMic}>
            {listening ? '🎤 listening… blow!' : '🎤 blow into your mic'}
          </button>
        </p>
      )}
    </div>
  );
}

const ED_START: EdState = {
  active: 'hello.md',
  lines: [
    {
      t: 'just start typing, or tap my keys ✦  try help · psst… try quiz',
      kind: 'dim',
    },
  ],
  input: '',
  quiz: null,
  history: [],
  histPos: -1,
  candlesOut: false,
};
type EdStore = {
  st: EdState;
  set: React.Dispatch<React.SetStateAction<EdState>>;
};

/** Run one line typed into the terminal; returns the new state (pure, so it can't run twice by accident). */
function runLine(st: EdState, raw: string): EdState {
  const echo: TermLine = { t: `${st.quiz ? '?' : '$'} ${raw}`, kind: 'in' };
  const history = raw.trim() ? [...st.history, raw].slice(-30) : st.history;
  const base = { ...st, input: '', history, histPos: -1 };
  if (st.quiz) {
    const q = QUIZ[st.quiz.i];
    const right = q.ok(raw.trim().toLowerCase());
    const score = st.quiz.score + (right ? 1 : 0);
    const out: TermLine[] = [echo, right ? { t: `✓ ${q.yes}`, kind: 'ok' } : { t: `✗ it's ${q.yes}`, kind: 'err' }];
    if (st.quiz.i + 1 < QUIZ.length) {
      out.push({
        t: `${st.quiz.i + 2}/${QUIZ.length} · ${QUIZ[st.quiz.i + 1].q}`,
        kind: 'hi',
      });
      return {
        ...base,
        lines: [...st.lines, ...out],
        quiz: { i: st.quiz.i + 1, score },
      };
    }
    out.push({
      t:
        score === QUIZ.length
          ? `${score}/${QUIZ.length}! you know me so well ✦`
          : `${score}/${QUIZ.length} · now you know me a little better ♡ (type quiz to try again)`,
      kind: 'hi',
    });
    if (score === QUIZ.length)
      out.push({
        t: '🎁 prize unlocked: my secret game, Berry Basket. open fun.tsx to play it 🍓',
        kind: 'ok',
      });
    return { ...base, lines: [...st.lines, ...out], quiz: null };
  }
  if (/^\s*blow\s*$/i.test(raw))
    return st.candlesOut
      ? {
          ...base,
          lines: [
            ...st.lines,
            echo,
            {
              t: 'the candles are already out ♡ (type relight for another go)',
              kind: 'dim',
            },
          ],
        }
      : {
          ...base,
          candlesOut: true,
          lines: [
            ...st.lines,
            echo,
            {
              t: '🎂 *whoosh* all the candles are out! make a wish ✦',
              kind: 'hi',
            },
          ],
        };
  if (/^\s*relight\s*$/i.test(raw))
    return {
      ...base,
      candlesOut: false,
      lines: [...st.lines, echo, { t: '🕯️ candles relit', kind: 'ok' }],
    };
  const r = respond(raw);
  if (r === 'clear') return { ...base, lines: [] };
  if (r === 'quiz')
    return {
      ...base,
      lines: [...st.lines, echo, { t: `quiz time ✦ 1/${QUIZ.length} · ${QUIZ[0].q}`, kind: 'hi' }],
      quiz: { i: 0, score: 0 },
    };
  if (r === 'resume')
    return {
      ...base,
      lines: [...st.lines, echo, { t: 'opening my résumé ↗', kind: 'ok' }],
    };
  return { ...base, lines: [...st.lines, echo, ...r] };
}

/** Handle one key (from the laptop's keys or the visitor's keyboard). */
function pressKey(store: EdStore, k: string) {
  const { st, set } = store;
  if (k === 'Enter') {
    const raw = st.input;
    if (/^\s*(resume|cv)\s*$/i.test(raw) && !st.quiz) window.open('/resume', '_blank', 'noopener');
    // a perfect quiz: confetti, a chime, and the secret game unlocked
    if (st.quiz && st.quiz.i === QUIZ.length - 1 && QUIZ[st.quiz.i].ok(raw.trim().toLowerCase()) && st.quiz.score + 1 === QUIZ.length) {
      retroAudio.playBell();
      markBerryUnlocked();
      window.dispatchEvent(new Event(QUIZ_WIN_EVENT));
    }
    set(runLine(st, raw));
  } else if (k === 'Backspace') set({ ...st, input: st.input.slice(0, -1) });
  else if (k === 'ArrowUp' || k === 'ArrowDown') {
    // walk back and forth through the commands typed so far
    if (!st.history.length) return;
    const pos = k === 'ArrowUp' ? (st.histPos < 0 ? st.history.length - 1 : Math.max(0, st.histPos - 1)) : st.histPos < 0 ? -1 : st.histPos + 1;
    if (pos < 0 || pos >= st.history.length) set({ ...st, histPos: -1, input: '' });
    else set({ ...st, histPos: pos, input: st.history[pos] });
  } else if (k.length === 1) set({ ...st, input: (st.input + k).slice(0, 80) });
}

function Terminal({ store }: { store: EdStore }) {
  const { st } = store;
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [st.lines]);
  return (
    <div className="ed-term-panel">
      <div className="ed-term-h">
        <span className="is-on">TERMINAL</span>
        <span>{st.quiz ? 'quiz.ps1' : 'powershell'}</span>
        <span className="ed-term-tip">↑ ↓ history · scroll to read back</span>
      </div>
      {/* the log scrolls on its own (wheel, trackpad or a finger); the page doesn't steal it */}
      <div ref={logRef} className="ed-term-log" onWheel={(e) => e.stopPropagation()}>
        {st.lines.map((l, i) => (
          <p key={i} className={l.kind ? `t-${l.kind}` : undefined}>
            {l.t}
          </p>
        ))}
        <form
          className="ed-term-row"
          onSubmit={(e) => {
            e.preventDefault();
            pressKey(store, 'Enter');
          }}
        >
          <span className="t-prompt">{st.quiz ? '?' : 'PS C:\\Users\\sreeja>'}</span>
          <input
            value={st.input}
            onChange={(e) => store.set({ ...st, input: e.target.value.slice(0, 80) })}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                pressKey(store, e.key);
              }
            }}
            aria-label="Type a command"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
          />
        </form>
      </div>
    </div>
  );
}

function Editor({
  toast,
  store,
  zoomed,
  onZoom,
  onWin,
}: {
  toast: (msg: string) => void;
  store: EdStore;
  zoomed: boolean;
  onZoom: () => void;
  onWin: (w: 'min' | 'closed') => void;
}) {
  const active = store.st.active;
  const setActive = (name: string) => store.set({ ...store.st, active: name });
  const birthday = useBirthday();
  const files = birthday ? [BIRTHDAY_FILE, ...FILES] : FILES;
  const file = files.find((f) => f.name === active) ?? files[0];
  return (
    <div className="ed">
      {/* a little title bar */}
      <div className="ed-bar">
        <span className="ed-appicon" aria-hidden>
          ✿
        </span>
        <span>about-me — sreeja</span>
        <button type="button" className="ed-zoom" onClick={onZoom}>
          {zoomed ? '⤡ back to laptop' : '⤢ read up close'}
        </button>
        {/* Windows-style window buttons */}
        <span className="ed-winbtns">
          <button type="button" aria-label="Minimize" title="Minimize" onClick={() => onWin('min')}>
            ─
          </button>
          <button type="button" aria-label={zoomed ? 'Restore down' : 'Maximize'} title={zoomed ? 'Restore down' : 'Maximize'} onClick={onZoom}>
            {zoomed ? '❐' : '▢'}
          </button>
          <button type="button" className="is-x" aria-label="Close" title="Close" onClick={() => onWin('closed')}>
            ✕
          </button>
        </span>
      </div>
      <div className="ed-body">
        {/* the file list */}
        <nav className="ed-side" aria-label="About-me files">
          <p className="ed-side-h">ABOUT-ME</p>
          {files.map((f) => (
            <button
              key={f.name}
              type="button"
              onClick={() => setActive(f.name)}
              className={`ed-file ${f.name === active ? 'is-on' : ''}`}
              aria-pressed={f.name === active}
            >
              <span className="ed-icon">{f.icon}</span>
              {f.name}
            </button>
          ))}
        </nav>

        <div className="ed-main">
          <div className="ed-tabs">
            <span className="ed-tab is-on">
              {file.icon} {file.name}
            </span>
          </div>
          <div className="ed-code">
            {file.lines && (
              <ol className="ed-lines">
                {file.lines.map((l, i) => (
                  <li key={i}>{l === '' ? ' ' : l}</li>
                ))}
              </ol>
            )}
            {file.name === 'fun.tsx' && (
              <div className="ed-preview">
                <p className="ed-com">{'// my games and my music live on my desktop now ✦'}</p>
                <p className="mt-2">
                  <button type="button" className="ed-zoom" onClick={() => onWin('min')}>
                    ─ show my desktop
                  </button>
                </p>
              </div>
            )}
            {file.name === 'say-hi.sh' && (
              <div className="ed-term">
                <p>
                  <span className="ed-kw">$</span> echo &quot;working on something fun, or need a hand with a build?&quot;
                </p>
                <p className="ed-str">I&apos;d love to hear about it ♡</p>
                <p className="mt-2">
                  <span className="ed-kw">$</span> mail <span className="ed-str">{PROFILE.email}</span>
                </p>
                <div className="ed-actions">
                  <FriendActions toast={toast} />
                </div>
              </div>
            )}
            {file.name === 'birthday.md' && <BirthdayCake store={store} />}
            {file.name === 'sreeja.jpg' && (
              <figure className="ed-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/sreeja/sreeja_party.jpeg" alt="Sreeja" />
                <figcaption>sreeja.jpg · New Delhi</figcaption>
              </figure>
            )}
          </div>
          <Terminal store={store} />
          <div className="ed-status">
            <span>♡ main</span>
            <span>Ln {file.lines?.length ?? 1}, Col 1</span>
            <span>UTF-8</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** About Me: a closed, bedazzled laptop; open it to read the files on screen. */
function LaptopAbout() {
  const [open, setOpen] = useState(false);
  const [ed, setEd] = useState<EdState>(ED_START);
  const birthday = useBirthday();
  const [shownBirthday, setShownBirthday] = useState(false);
  if (birthday && !shownBirthday) {
    setShownBirthday(true);
    setEd((s) => ({ ...s, active: 'birthday.md' }));
  }
  const store: EdStore = { st: ed, set: setEd };
  const storeRef = useRef(store);
  useEffect(() => {
    storeRef.current = store;
  });
  // a key from the laptop's keys or the visitor's keyboard goes to the terminal
  const typeKey = (k: string) => {
    retroAudio.playHover();
    pressKey(storeRef.current, k);
  };
  const [won, setWon] = useState(false);
  // birthday: a cake on the closed lid, decorated with toppings that each lead to a project
  const [candles, setLitCandles] = useState([true, true, true, true, true]);
  const puff = (which: number | 'all') => {
    setLitCandles((prev) => {
      const next = prev.map((l, i) => (which === 'all' || i === which ? false : l));
      return next;
    });
    if (which !== 'all') retroAudio.playHover();
  };
  const { listening, listen } = useBlow(() => puff('all'));
  const candlesOut = candles.every((l) => !l);
  // once they're blown out: confetti, a little "happy birthday" tune, then the cake is
  // cleared away for the rest of this visit
  const [cakeGone, setCakeGone] = useState(() => {
    try {
      return sessionStorage.getItem(CAKE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [cakeLeaving, setCakeLeaving] = useState(false);
  useEffect(() => {
    if (!candlesOut || cakeGone) return;
    retroAudio.playBell();
    window.dispatchEvent(new Event(QUIZ_WIN_EVENT)); // confetti
    try {
      sessionStorage.setItem(CAKE_KEY, '1');
    } catch {
      /* storage blocked: it just comes back on reload */
    }
    const stopTune = playBirthdayTune(900);
    const leave = window.setTimeout(() => setCakeLeaving(true), BIRTHDAY_TUNE_MS + 1400);
    const gone = window.setTimeout(() => setCakeGone(true), BIRTHDAY_TUNE_MS + 2400);
    return () => {
      stopTune();
      clearTimeout(leave);
      clearTimeout(gone);
    };
  }, [candlesOut, cakeGone]);
  const showCake = birthday && !cakeGone;
  useEffect(() => {
    let t = 0;
    const win = () => {
      setWon(true);
      clearTimeout(t);
      t = window.setTimeout(() => setWon(false), 4500);
    };
    window.addEventListener(QUIZ_WIN_EVENT, win);
    return () => {
      window.removeEventListener(QUIZ_WIN_EVENT, win);
      clearTimeout(t);
    };
  }, []);
  // "read up close": the screen comes out of the laptop, big and flat
  const [zoom, setZoom] = useState(false);
  useEffect(() => {
    if (!zoom) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setZoom(false);
    window.addEventListener('keydown', esc);
    // the page underneath stays put while you read up close
    const root = document.documentElement;
    const prev = [root.style.overflow, document.body.style.overflow];
    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', esc);
      [root.style.overflow, document.body.style.overflow] = prev;
    };
  }, [zoom]);
  // the editor is a real window on her desktop: minimise it, close it, open it again
  const [win, setWin] = useState<'open' | 'min' | 'closed'>('open');
  const winTo = (w: 'min' | 'closed') => {
    setZoom(false);
    setWin(w);
  };
  const [lit, setLit] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const lightKey = (k: string) => {
    setLit(k);
    window.setTimeout(() => setLit(null), 140);
  };
  const zoomRef = useRef(zoom);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);
  // while the laptop is open and on screen, the visitor's own keyboard types into it
  useEffect(() => {
    if (!open) return;
    const el = wrapRef.current;
    let visible = true;
    const io = el
      ? new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
          threshold: 0.3,
        })
      : null;
    if (el && io) io.observe(el);
    const down = (e: KeyboardEvent) => {
      if ((!visible && !zoomRef.current) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (document.documentElement.dataset.overlay === 'true') return; // a game is open
      const target = e.target as HTMLElement | null;
      const inTerminal = !!target?.closest?.('.ed-term-panel');
      // typing in some other box on the page is left alone
      if (!inTerminal && target?.closest?.('input, textarea, [contenteditable="true"]')) return;
      const k = e.key;
      if (k.length !== 1 && k !== 'Backspace' && k !== 'Enter') return;
      lightKey(k);
      if (inTerminal) return; // the terminal's own input already takes it
      e.preventDefault(); // e.g. space would otherwise scroll the page
      typeKey(k);
    };
    window.addEventListener('keydown', down);
    return () => {
      window.removeEventListener('keydown', down);
      io?.disconnect();
    };
  }, [open]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!toastMsg) return;
    const id = setTimeout(() => setToastMsg(null), 2800);
    return () => clearTimeout(id);
  }, [toastMsg]);
  // the lo-fi music stops if you leave while it's open
  useEffect(() => () => setMusicBoxOpen(false), []);

  // the lo-fi beat: on while the laptop's open, unless you switch it off from the desktop
  const [musicOn, setMusicOn] = useState(true);
  const toggleMusic = () => {
    setMusicOn(!musicOn);
    setMusicBoxOpen(open && !musicOn);
  };
  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (!next) setZoom(false);
    if (next) playLaptopOpen();
    else playLaptopClose();
    setMusicBoxOpen(next && musicOn);
  };

  return (
    <>
      <SectionTitle kicker="profile" title="About Me" />
      <div ref={wrapRef} className="lp-about" style={VARS}>
        <Laptop
          open={open}
          lidTop={showCake ? <LidCake lit={candles} onPuff={puff} leaving={cakeLeaving} /> : undefined}
          onToggle={toggle}
          lit={lit}
          onKey={(k) => {
            lightKey(k);
            typeKey(k);
          }}
          screen={
            zoom ? (
              <button type="button" className="ed-away nb-hand" onClick={() => setZoom(false)}>
                reading up close ↗
              </button>
            ) : win === 'open' ? (
              <Editor toast={setToastMsg} store={store} zoomed={false} onZoom={() => setZoom(true)} onWin={winTo} />
            ) : (
              <Desktop minimized={win === 'min'} onOpen={() => setWin('open')} musicOn={musicOn} onMusic={toggleMusic} />
            )
          }
        />
        <div className={`lp-actions ${showCake && !open ? 'is-birthday' : ''}`}>
          <button type="button" onClick={toggle} className="lp-toggle nb-hand" aria-pressed={open}>
            {open ? 'close my laptop' : 'open my laptop ♪'}
          </button>
          {showCake && !open && <CakeTray candlesOut={candlesOut} listening={listening} onBlow={listen} />}
        </div>
      </div>
      {won && <Confetti />}
      {zoom && (
        <div className="ed-zoomed" style={VARS} onClick={(e) => e.target === e.currentTarget && setZoom(false)}>
          <div className="ed-zoomed-screen">
            <Editor toast={setToastMsg} store={store} zoomed onZoom={() => setZoom(false)} onWin={winTo} />
          </div>
        </div>
      )}
      {toastMsg && (
        <div
          role="status"
          className="fixed left-1/2 -translate-x-1/2 bottom-24 z-[80] max-w-[calc(100vw-2rem)] text-center font-pixel text-xl px-5 py-2 rounded-full bg-white text-ink shadow-[0_10px_30px_rgba(140,50,80,0.3)] animate-pop-in"
        >
          {toastMsg}
        </div>
      )}
    </>
  );
}

// sugar pearls scattered over the buttercream (x, y inside the tier, size)
const PEARLS = [
  [12, 30, 7],
  [40, 22, 5],
  [118, 18, 6],
  [160, 34, 7],
  [28, 62, 5],
  [92, 48, 4],
  [150, 70, 6],
  [8, 96, 6],
  [64, 88, 5],
  [126, 104, 7],
  [172, 112, 5],
  [36, 122, 7],
  [98, 132, 5],
  [146, 140, 4],
  [20, 150, 5],
  [80, 158, 6],
];

/** The cake itself, standing on the closed lid on a plate; tap a flame to put it out. */
function LidCake({ lit, onPuff, leaving }: { lit: boolean[]; onPuff: (i: number) => void; leaving: boolean }) {
  return (
    <>
      <div className={`ck-stand ${leaving ? 'is-leaving' : ''}`}>
        <div className="ck" role="img" aria-label={`a birthday cake with ${lit.filter(Boolean).length} lit candles`}>
          <span className="ck-board" />
          <div className="ck-tier">
            {PEARLS.map(([x, y, r], i) => (
              <i key={i} className="ck-pearl" style={{ left: x, top: y, width: r, height: r }} />
            ))}
          </div>
          <div className="ck-candles">
            {lit.map((on, i) => (
              <button
                type="button"
                key={i}
                className={`ck-candle ${on ? '' : 'is-out'}`}
                style={{ '--i': i } as React.CSSProperties}
                onClick={(e) => {
                  e.stopPropagation();
                  if (on) onPuff(i);
                }}
                aria-label={on ? `blow out candle ${i + 1}` : `candle ${i + 1} is out`}
              >
                <i className="ck-flame" />
                <i className="ck-smoke" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/** Under the laptop on her birthday: blow out the candles (mic, or tap the flames). */
function CakeTray({ candlesOut, listening, onBlow }: { candlesOut: boolean; listening: boolean; onBlow: () => void }) {
  if (candlesOut) return <span className="nb-hand ck-note">make a wish ✦</span>;
  return (
    <button type="button" className="ed-zoom ck-blow" onClick={onBlow} title="blow into your mic, or tap the flames">
      {listening ? '🎤 blow now!' : '🎂 blow my candles'}
    </button>
  );
}

/** Her song on repeat, as Spotify's own preview player sitting on the desktop like a widget. */
function SongWidget() {
  const [song, setSong] = useState<NowPlaying | null>(null);
  useEffect(() => {
    let alive = true;
    fetch('/api/now-playing')
      .then((r) => r.json())
      .then((j: NowPlaying) => alive && setSong(j))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  const trackId = song?.url?.match(/open\.spotify\.com\/track\/([A-Za-z0-9]+)/)?.[1];
  if (!trackId) return null;
  return (
    <div className="ed-widget">
      <iframe
        title={`${song?.title ?? 'my song'} on Spotify`}
        src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
        width="100%"
        height="80"
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      />
    </div>
  );
}

/**
 * Her desktop, behind the editor (minimised or closed), on her own wallpaper: icons for
 * the about-me app and her games, and her song as a Spotify widget. One click opens.
 */
function Desktop({ minimized, onOpen, musicOn, onMusic }: { minimized: boolean; onOpen: () => void; musicOn: boolean; onMusic: () => void }) {
  const berry = useSyncExternalStore(subscribeBerryUnlock, isBerryUnlocked, () => false);
  const play = (id: 'berry' | 'stack' | 'bugs') => {
    retroAudio.playCassetteInsert();
    openGame(id);
  };
  const icons: { key: string; icon: string; label: string; open?: () => void; hint?: string }[] = [
    { key: 'about', icon: '✿', label: 'about-me', open: onOpen },
    { key: 'bugs', icon: '🐞', label: 'Bug Squash', open: () => play('bugs') },
    { key: 'stack', icon: '💿', label: 'Disc Stacker', open: () => play('stack') },
    berry
      ? { key: 'berry', icon: '🍓', label: 'Berry Basket', open: () => play('berry') }
      : { key: 'berry', icon: '🔒', label: '???', hint: 'locked · the pink banner up top is ticklish' },
  ];
  return (
    <div className="ed-desk">
      <div className="ed-desk-icons">
        {icons.map((ic) => (
          <button
            type="button"
            key={ic.key}
            className={`ed-desk-icon ${ic.open ? '' : 'is-locked'}`}
            title={ic.hint ?? `open ${ic.label}`}
            onClick={() => ic.open?.()}
          >
            <span aria-hidden>{ic.icon}</span>
            {ic.label}
          </button>
        ))}
      </div>
      <SongWidget />
      {minimized && <p className="ed-desk-hint nb-hand">about-me is still open down there ↓</p>}
      <div className="ed-taskbar">
        <span className="ed-start" aria-hidden>
          ❀
        </span>
        {minimized && (
          <button type="button" className="ed-task" onClick={onOpen}>
            ✿ about-me — sreeja
          </button>
        )}
        <span className="ed-clock">
          <button
            type="button"
            className="ed-tray-btn"
            onClick={onMusic}
            aria-pressed={musicOn}
            title={musicOn ? 'turn the lo-fi beat off' : 'turn the lo-fi beat on'}
          >
            ♪ lo-fi
          </button>{' '}
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

export function AboutProfile() {
  return ABOUT_STYLE === 'laptop' ? <LaptopAbout /> : <SwanAbout />;
}

function SwanAbout() {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>('away');
  const stageRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (!toastMsg) return;
    const id = setTimeout(() => setToastMsg(null), 2800);
    return () => clearTimeout(id);
  }, [toastMsg]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // the swan flies in the first time the section comes into view
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        setStage(still ? 'perched' : 'flying');
        if (!still) later(() => setStage('perched'), 2600);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const unfold = () => {
    if (stage !== 'perched') return;
    playUnfoldSound();
    setStage('unfolding');
  };
  const foldBack = () => {
    if (stage !== 'open') return;
    playUnfoldSound(true);
    setStage('folding');
  };

  const showSwan = stage !== 'open';
  const swanMode: SwanMode =
    stage === 'flying' || stage === 'away' ? 'flying' : stage === 'unfolding' ? 'unfolding' : stage === 'folding' ? 'folding' : 'resting';

  return (
    <>
      <SectionTitle kicker="profile" title="About Me" className={`og-heading ${stage === 'away' ? 'is-waiting' : ''}`} />
      <div ref={stageRef} className="og-stage" style={VARS}>
        {showSwan && (
          <button
            type="button"
            onClick={unfold}
            disabled={stage !== 'perched'}
            className={`og-swan is-${stage}`}
            aria-label="Unfold the paper swan to read about me"
          >
            <OrigamiSwan
              mode={swanMode}
              size={460}
              onDone={() => {
                if (stage === 'unfolding') later(() => setStage('open'), 150);
                if (stage === 'folding') setStage('perched');
              }}
            />
            {stage === 'perched' && <span className="og-hint nb-hand">tap the swan to unfold it ✿</span>}
          </button>
        )}

        {stage === 'open' && (
          <article className="og-sheet">
            <div className="og-sheet-grid">
              <figure className="og-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/sreeja/sreeja_party.jpeg" alt="Sreeja" />
                <figcaption className="nb-hand">Sreeja Das · New Delhi</figcaption>
              </figure>

              <div className="og-story">
                <h3 className="og-h">Hello,</h3>
                <p>
                  I fell for computer science through creative coding, and I still build things that reward curiosity: a photobooth that prints strips, a snow
                  globe you blow on, a garden of 3D flowers for my friends.
                </p>
                <p>
                  These days most of my time goes into <Hl>The Diecast Store</Hl>, which I built as a freelancer and now help run as{' '}
                  <Hl>co-founder &amp; CTO</Hl>.
                </p>
              </div>

              <div>
                <h4 className="og-sub">Right now</h4>
                <dl className="og-facts">
                  <div>
                    <dt>studying</dt>
                    <dd>
                      B.Tech CSE at SRM, &apos;27 · <Hl c="#ffd2e6">9.05 CGPA</Hl>
                    </dd>
                  </div>
                  <div>
                    <dt>open to</dt>
                    <dd>
                      <Hl c="#cfefff">freelance, remote &amp; flexible</Hl> work
                    </dd>
                  </div>
                  <div>
                    <dt>into</dt>
                    <dd>WebGL toys, Web Audio, mental-health tech</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="og-sub">Little wins</h4>
                <ul className="og-wins">
                  {WINS.map((w) => (
                    <li key={w.t}>
                      <b>{w.t}</b> <span>{w.d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="og-fun">
              <div className="w-[250px] max-w-full">
                <ProfileSong />
              </div>
              <Arcade />
              <div className="flex-1 min-w-[220px]">
                <p className="nb-hand text-[20px] leading-none text-ink/50 mb-1">say hi ↓</p>
                <FriendActions toast={setToastMsg} />
              </div>
            </div>

            <button type="button" onClick={foldBack} className="og-refold nb-hand">
              fold it back into a swan ↺
            </button>
          </article>
        )}

        {toastMsg && (
          <div
            role="status"
            className="fixed left-1/2 -translate-x-1/2 bottom-24 z-[80] max-w-[calc(100vw-2rem)] text-center font-pixel text-xl px-5 py-2 rounded-full bg-white text-ink shadow-[0_10px_30px_rgba(140,50,80,0.3)] animate-pop-in"
          >
            {toastMsg}
          </div>
        )}
      </div>
    </>
  );
}
