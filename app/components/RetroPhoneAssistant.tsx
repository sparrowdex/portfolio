'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { retroAudio } from '../utils/retroAudio';
import { answer, type ProjectKey } from '../utils/assistantEngine';
import { usePathname } from 'next/navigation';
import { useViewMode } from './y2k/viewMode';
import { Keychain } from './y2k/Keychain';
import { PROJECTS_DATA } from '../data/projects';
import type { NowPlaying } from '../utils/spotify';

/* ── Accessibility prefs: big screen + text size, remembered per visitor ── */
type Prefs = { big: boolean; size: 0 | 1 | 2 };
const PREFS_KEY = 'phone_prefs';
const DEFAULT_PREFS: Prefs = { big: false, size: 0 };
const prefListeners = new Set<() => void>();
let prefCache: { raw: string | null; value: Prefs } = { raw: null, value: DEFAULT_PREFS };
function readPrefs(): Prefs {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(PREFS_KEY);
  } catch {
    /* storage blocked */
  }
  if (raw !== prefCache.raw) {
    try {
      prefCache = { raw, value: { ...DEFAULT_PREFS, ...(raw ? JSON.parse(raw) : {}) } };
    } catch {
      prefCache = { raw, value: DEFAULT_PREFS };
    }
  }
  return prefCache.value;
}
function writePrefs(next: Prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  } catch {
    prefCache = { raw: JSON.stringify(next), value: next };
  }
  prefListeners.forEach((l) => l());
}
const subscribePrefs = (cb: () => void) => {
  prefListeners.add(cb);
  return () => {
    prefListeners.delete(cb);
  };
};
const MSG_SIZE = ['text-[17px]', 'text-[21px]', 'text-[25px]'];
const OPT_SIZE = ['text-[15px]', 'text-[18px]', 'text-[21px]'];

/** Event the home page listens for to load a project into the disc player. */
export const PLAY_PROJECT_EVENT = 'portfolio:play-project';
/** Fire this to open the phone (e.g. the profile's "Instant Message" button). */
export const OPEN_PHONE_EVENT = 'portfolio:open-phone';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  projectId?: number;
}

const START_SUGGESTIONS = ['Show me all projects', 'Tell me about The Diecast Store', 'What are her skills?', 'How do I contact her?'];

const KEYS: [string, string][] = [
  ['1', 'opt'], ['2', 'opt'], ['3', 'opt'],
  ['4', 'opt'], ['5', '♫ song'], ['6', '🎲 rand'],
  ['7', '🥚 secret'], ['8', '😂 joke'], ['9', '💧 h2o'],
  ['*', 'clr'], ['0', '☰ help'], ['#', 'send'],
];

/* Fun keys 5–9: questions about the site itself (no made-up personal facts). */

const JOKES = [
  'why do programmers prefer dark mode? because light attracts bugs 🐛',
  "there are 10 kinds of people: those who understand binary and those who don't",
  'a CSS file walks into a bar… and a table falls over somewhere else 🍸',
  'why did the developer go broke? they used up all their cache 💸',
  "it works on my machine ✦ then we'll ship your machine 📦",
  "how many programmers does it take to change a light bulb? none, that's a hardware problem 💡",
  "why do java developers wear glasses? because they don't C# 👓",
  "i'd tell you a UDP joke, but you might not get it 📡",
  "i'd tell you a TCP joke, but i'd have to keep repeating it until you got it 🔁",
  'a SQL query walks into a bar, walks up to two tables and asks: "can i JOIN you?" 🍹',
  "why was the javascript developer sad? because they didn't Node how to Express themselves 😢",
  'my code has zero bugs. it just has a few surprise features ✨',
  'git commit -m "fixed it" … git commit -m "actually fixed it" … git commit -m "pls" 🙏',
  "why don't programmers like nature? too many bugs and no ctrl+z 🌳",
  'debugging: being the detective in a crime movie where you are also the murderer 🔍',
  'a QA engineer walks into a bar. orders 1 beer. orders 0 beers. orders 99999 beers. orders -1 beers. orders a lizard 🦎',
  '…then the first real customer walks in and asks where the bathroom is. the bar bursts into flames 🔥',
  "why did the function break up with the loop? it felt like they were going in circles 💔",
  'how do you comfort a javascript bug? you console it 🫂',
  "what is a programmer's favourite hangout spot? foo bar 🍸",
  "why are arrays so tired? they're always being indexed from zero 😴",
  'the two hardest problems in programming: cache invalidation, naming things, and off-by-one errors',
  "!false — it's funny because it's true",
  `a programmer's partner says "get a loaf of bread, and if they have eggs, get a dozen." they came back with 12 loaves 🍞`,
  'why did the react component feel lost? it had no sense of state 🧭',
  'roses are #ff0000, violets are #0000ff, all my base are belong to you 🌹',
  'there is no place like 127.0.0.1 🏠',
  "my css isn't broken, it's just expressing its feelings through overflow 💅",
  'why did the private class member never go out? it had no public life 🔒',
  'documentation is like a love letter to your future self… that you never write 💌',
  'tabs vs spaces? i just hit the keyboard until prettier fixes it ⌨️',
  "i asked the AI to fix my bug. now i have two bugs, but they're very polite 🤖",
];
let lastJoke = -1;
function nextJoke() {
  let i = Math.floor(Math.random() * JOKES.length);
  if (i === lastJoke) i = (i + 1) % JOKES.length; // never the same one twice in a row
  lastJoke = i;
  return JOKES[i];
}

const FUN_KEYS: Record<string, { q: string; reply: () => string | Promise<{ text: string; projectId?: number }> }> = {
  '5': {
    q: "what's she listening to rn?",
    reply: async () => {
      try {
        const j: NowPlaying = await (await fetch('/api/now-playing')).json();
        if (!j.configured || !j.title) return { text: "her playlist's on private mode rn 🎧 check back later!" };
        return {
          text: `${j.isPlaying ? '🎧 listening right now:' : '🎧 last played:'} **${j.title}** by ${j.artist} ♫
(the spinning disc in the bottom-left corner has it too)`,
        };
      } catch {
        return { text: 'no signal to the music satellite 📡 try again in a sec!' };
      }
    },
  },
  '6': {
    q: 'surprise me 🎲',
    reply: async () => {
      const p = PROJECTS_DATA[Math.floor(Math.random() * PROJECTS_DATA.length)];
      return { text: `🎲 you rolled… **${p.title}**!
${p.desc}`, projectId: p.id };
    },
  },
  '7': {
    q: 'any secrets on this site? 👀',
    reply: () =>
      [
        'psst… this site is full of tiny surprises 🥚',
        '- drag her portrait window (or press & hold it on your phone)',
        '- click the keychain charm, it jingles',
        '- stay a while… someone might remind you to hydrate',
        '- About Me → "Contacting Sreeja" box → try "Block User" 😈',
        '- tap anywhere on mobile for butterflies',
        'and there may be more ✦',
      ].join('\n'),
  },
  '8': {
    q: 'tell me a joke 😂',
    reply: nextJoke,
  },
  '9': {
    q: 'hydration check 💧',
    reply: () => 'this is your sign to drink some water 💧🥤 (she keeps her pink tumbler nearby for exactly this reason)',
  },
  '0': {
    q: 'help ☰',
    reply: () =>
      [
        '☰ keypad cheat sheet:',
        '- 1–4 → the numbered options on screen',
        "- 5 ♫ → what she's listening to",
        '- 6 🎲 → a random project',
        '- 7 🥚 → site secrets',
        '- 8 😂 → a dev joke',
        '- 9 💧 → hydration check',
        '- * clear · # send · or just type anything!',
      ].join('\n'),
  },
};

/* ── tiny, safe markdown-ish renderer for KB answers (no innerHTML) ── */
const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\)|`[^`]+`|https?:\/\/[^\s)]+|\/assets\/[^\s)]+|\*[^*\s][^*]*\*)/g;

function Inline({ text }: { text: string }) {
  const parts = text.split(INLINE);
  return (
    <>
      {parts.map((p, i) => {
        if (!p) return null;
        if (p.startsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
        if (p.startsWith('`')) return <code key={i} className="px-0.5 bg-[#1b2a4a]/10 rounded-sm">{p.slice(1, -1)}</code>;
        const md = p.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
        if (md) {
          const href = md[2].replace(/\.git$/, '');
          return (
            <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted text-[#c2006f]">
              {md[1]}
            </a>
          );
        }
        if (/^(https?:\/\/|\/assets\/)/.test(p)) {
          const href = p.replace(/\.git$/, '');
          return (
            <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted text-[#c2006f] break-all">
              {href.replace(/^https?:\/\/(www\.)?/, '')}
            </a>
          );
        }
        if (p.startsWith('*') && p.endsWith('*') && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
        return <React.Fragment key={i}>{p}</React.Fragment>;
      })}
    </>
  );
}

function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => {
        const t = line.trim();
        if (!t) return <span key={i} className="block h-1.5" />;
        const bullet = t.match(/^[-*•]\s+(.*)$/);
        if (bullet)
          return (
            <span key={i} className="block pl-3 -indent-3">
              › <Inline text={bullet[1]} />
            </span>
          );
        return (
          <span key={i} className="block">
            <Inline text={t} />
          </span>
        );
      })}
    </>
  );
}

function Clock() {
  const [t, setT] = useState('');
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  return <span>{t}</span>;
}

export function RetroPhoneAssistant() {
  const mode = useViewMode();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [context, setContext] = useState<ProjectKey | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(START_SUGGESTIONS);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "1 NEW MSG ✦ hiii! i'm Sreeja's phone. Ask me about her projects, skills, experience, or how to reach her. Press 1–4 for quick picks!\n(tip: keys 5–9 are fun ones ✦ ⤢ = big screen, Aa = bigger text)" },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const prefs = useSyncExternalStore(subscribePrefs, readPrefs, () => DEFAULT_PREFS);
  const { big, size } = prefs;

  // Fit the phone to the viewport height (with breathing room above and below).
  useEffect(() => {
    if (!isOpen) return;
    const fit = () => {
      const h = phoneRef.current?.offsetHeight; // offsetHeight ignores transforms
      if (!h) return;
      const room = window.innerHeight - 56; // ~28px clear above and below
      setScale(Math.max(0.55, Math.min(1, room / h)));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [isOpen, big, size]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, isOpen]);

  useEffect(() => {
    const open = () => {
      retroAudio.playSmsChime();
      setIsOpen(true);
    };
    window.addEventListener(OPEN_PHONE_EVENT, open);
    return () => window.removeEventListener(OPEN_PHONE_EVENT, open);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  // Not on the recruiter view or the print-ready /resume page.
  if (mode === 'recruiter' || pathname?.startsWith('/resume')) return null;

  const send = (raw?: string) => {
    const q = (raw ?? input).trim();
    if (!q || typing) return;
    retroAudio.playButtonClack();
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setInput('');
    setTyping(true);
    const reply = answer(q, context);
    setTimeout(() => {
      retroAudio.playSmsChime();
      setTyping(false);
      setContext(reply.context);
      setSuggestions(reply.suggestions.slice(0, 4));
      setMessages((m) => [...m, { role: 'assistant', text: reply.text, projectId: reply.projectId }]);
    }, 420 + Math.min(900, reply.text.length * 2));
  };

  /** Fixed "fun key" exchanges (keys 5–9, 0). */
  const sendFun = async (k: string) => {
    const fun = FUN_KEYS[k];
    if (!fun || typing) return;
    setMessages((m) => [...m, { role: 'user', text: fun.q }]);
    setTyping(true);
    // reply + a short "typing…" pause, whichever takes longer
    const [out] = await Promise.all([fun.reply(), new Promise((r) => setTimeout(r, 600))]);
    const reply = typeof out === 'string' ? { text: out } : out;
    retroAudio.playSmsChime();
    setTyping(false);
    setMessages((m) => [...m, { role: 'assistant', text: reply.text, projectId: reply.projectId }]);
  };

  const pressKey = (k: string) => {
    retroAudio.playPhoneTone(k);
    const n = Number(k);
    if (n >= 1 && n <= 4 && suggestions[n - 1]) send(suggestions[n - 1]);
    else if (k === '*') setInput('');
    else if (k === '#') send();
    else if (FUN_KEYS[k]) sendFun(k);
  };

  const playDisc = (id: number) => {
    retroAudio.playCassetteInsert();
    window.dispatchEvent(new CustomEvent(PLAY_PROJECT_EVENT, { detail: id }));
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => {
          retroAudio.playSmsChime();
          setIsOpen(true);
        }}
        className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-[65] group flex items-center gap-3 p-2 sm:pl-2 sm:pr-4 rounded-full border-2 border-[#7a0044] shadow-[4px_4px_0_#1a0f1f] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
        style={{ background: 'linear-gradient(180deg, #ffd6ec 0%, #ff8fd8 55%, #ff5fb8 100%)' }}
        aria-label="Open Sreeja's phone assistant"
      >
        <span className="relative w-9 h-11 rounded-lg border-2 border-[#7a0044] flex flex-col items-center justify-start pt-1 gap-0.5 bg-gradient-to-b from-white to-[#ffc4e6]">
          <span className="w-5 h-3 rounded-sm bg-[#cfe6ff] border border-[#1b2a4a]/40" />
          <span className="grid grid-cols-3 gap-[1px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="w-1 h-1 rounded-full bg-[#7a0044]/60" />
            ))}
          </span>
          <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#ff2e93] text-white text-[11px] font-bold flex items-center justify-center border-2 border-white animate-bounce [animation-iteration-count:3]">
            1
          </span>
        </span>
        <span className="hidden sm:block text-left leading-none">
          <span className="block font-pixel text-base text-[#7a0044]">1 new message</span>
          <span className="block font-bubble text-base text-[#1a0f1f]">ask my phone ✦</span>
        </span>
      </button>
    );
  }

  return (
    <div
      ref={phoneRef}
      className={`fixed bottom-7 right-4 sm:right-6 z-[65] ${big ? 'w-[min(480px,calc(100vw-2.5rem))]' : 'w-[min(316px,calc(100vw-2.5rem))]'} select-none origin-bottom-right transition-transform duration-200`}
      style={{ transform: `scale(${scale})` }}
      role="dialog"
      aria-label="Sreeja's phone assistant"
    >
      <div className="animate-pop-in origin-bottom-right">
      {/* antenna */}
      <div className="ml-7 -mb-1 w-3 h-7 rounded-t-full bg-gradient-to-r from-[#d9cfd8] via-white to-[#bfaebb] border-2 border-b-0 border-[#7a0044]" />

      <div
        className="relative rounded-[42px] p-3.5 border-[3px] border-[#7a0044] shadow-[6px_8px_0_#1a0f1f,0_20px_50px_rgba(122,0,68,0.35)]"
        style={{
          background:
            'radial-gradient(circle at 20% 15%, rgba(255,255,255,0.85) 0 6%, transparent 25%),' +
            'radial-gradient(rgba(255,255,255,0.55) 1px, transparent 1.5px) 0 0/9px 9px,' +
            'linear-gradient(165deg, #ffd6ec 0%, #ff9fd6 40%, #ff5fb8 100%)',
        }}
      >
        {/* earpiece + brand */}
        <div className="flex items-center justify-between px-3 pb-2">
          <span className="font-pixel text-base leading-none text-[#7a0044] tracking-widest">SREEJA·3310</span>
          <span className="w-12 h-1.5 rounded-full bg-[#7a0044]/70" />
          <button
            type="button"
            onClick={() => writePrefs({ ...prefs, size: ((size + 1) % 3) as Prefs['size'] })}
            aria-label={`Text size: ${['normal', 'large', 'extra large'][size]}. Click to change.`}
            title="Text size"
            className="font-pixel text-lg leading-none px-1.5 rounded-md border-2 border-[#7a0044] text-[#7a0044] bg-white/60 hover:bg-white"
          >
            A<span className="text-[0.7em]">a</span>
            <span className="ml-0.5 text-[0.7em]">{['', '+', '++'][size]}</span>
          </button>
          <button
            type="button"
            aria-label="Close phone"
            onClick={() => {
              retroAudio.playButtonClack();
              setIsOpen(false);
            }}
            className="font-pixel text-xl leading-none text-[#7a0044] hover:text-white px-1"
          >
            ✕
          </button>
        </div>

        {/* LCD */}
        <div className="rounded-[18px] p-1.5 bg-[#3a1530] shadow-inner">
          <div
            className="relative rounded-xl overflow-hidden text-[#1b2a4a] font-pixel"
            style={{ background: 'linear-gradient(180deg, #e3f1ff 0%, #c6dcf7 100%)' }}
          >
            <div className="flex items-center justify-between px-2 py-0.5 text-sm border-b border-[#1b2a4a]/25">
              <span className="flex items-end gap-[2px]" aria-hidden>
                {[3, 5, 7, 9].map((h) => (
                  <span key={h} className="w-[3px] bg-[#1b2a4a]" style={{ height: h }} />
                ))}
              </span>
              <span>✦ SREEJA-2G</span>
              <Clock />
              <span aria-hidden>▮▮▮▯</span>
            </div>

            <div
              ref={scrollRef}
              className={`${big ? '' : 'h-44'} overflow-y-auto px-2 py-2 space-y-2 ${MSG_SIZE[size]} leading-[1.1] select-text`}
              style={big ? { height: 'clamp(16rem, calc(100dvh - 380px), 38rem)' } : undefined}
              aria-live="polite"
            >
              {messages.map((m, i) =>
                m.role === 'user' ? (
                  <div key={i} className="flex justify-end">
                    <span className="max-w-[85%] px-2 py-1 rounded-lg rounded-br-none bg-[#1b2a4a] text-[#e3f1ff]">{m.text}</span>
                  </div>
                ) : (
                  <div key={i} className="max-w-[94%]">
                    <div className="px-2 py-1 rounded-lg rounded-bl-none bg-white/70 border border-[#1b2a4a]/25">
                      <Rich text={m.text} />
                    </div>
                    {m.projectId && (
                      <button
                        type="button"
                        onClick={() => playDisc(m.projectId!)}
                        className="mt-1 px-2 py-0.5 rounded bg-[#ff2e93] text-white text-base hover:bg-[#c2006f]"
                      >
                        ▶ play this disc
                      </button>
                    )}
                  </div>
                ),
              )}
              {typing && <p className="animate-blink">✉ typing…</p>}
            </div>

            {/* options menu (Nokia-style) */}
            <ol className={`border-t border-[#1b2a4a]/25 px-2 py-1 ${OPT_SIZE[size]} leading-tight bg-[#1b2a4a]/5`}>
              {suggestions.slice(0, 4).map((s, i) => (
                <li key={s}>
                  <button type="button" onClick={() => send(s)} className="w-full text-left truncate hover:bg-[#1b2a4a] hover:text-[#e3f1ff] px-1 rounded-sm">
                    {i + 1} › {s}
                  </button>
                </li>
              ))}
            </ol>

            <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(27,42,74,0.06)_0_1px,transparent_1px_3px)]" />
          </div>
        </div>

        {/* input */}
        <form
          className="mt-2.5 flex gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="type a question…"
            aria-label="Ask a question"
            className="flex-1 min-w-0 font-pixel text-lg px-3 py-1 rounded-full bg-white/90 border-2 border-[#7a0044] text-[#1a0f1f] placeholder:text-[#7a0044]/50 outline-none focus:bg-white"
          />
          <button type="submit" className="y2k-gloss rounded-full px-3 font-pixel text-lg" style={{ '--btn': '#22c55e' } as React.CSSProperties} aria-label="Send">
            ✉
          </button>
        </form>

        {/* soft keys */}
        <div className="mt-2 grid grid-cols-3 gap-2 items-center">
          <button type="button" onClick={() => send()} className="y2k-gloss rounded-full py-1 font-pixel text-base" style={{ '--btn': '#22c55e' } as React.CSSProperties}>
            ☎ send
          </button>
          <button
            type="button"
            onClick={() => {
              retroAudio.playButtonClack();
              writePrefs({ ...prefs, big: !big });
            }}
            aria-pressed={big}
            aria-label={big ? 'Normal screen' : 'Big screen'}
            title={big ? 'Normal screen' : 'Big screen (hides keypad)'}
            className="mx-auto w-11 h-11 rounded-full y2k-gloss y2k-gloss-silver flex items-center justify-center font-pixel text-xl"
          >
            {big ? '⤡' : '⤢'}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="y2k-gloss rounded-full py-1 font-pixel text-base"
            style={{ '--btn': '#ef4444' } as React.CSSProperties}
          >
            ⏻ end
          </button>
        </div>

        {/* keypad (folded away in big-screen mode) */}
        <div className={`mt-2 grid grid-cols-3 gap-1.5 ${big ? 'hidden' : ''}`}>
          {KEYS.map(([k, sub]) => (
            <button
              key={k}
              type="button"
              onClick={() => pressKey(k)}
              className="rounded-[14px] py-0.5 border-2 border-[#7a0044]/60 bg-gradient-to-b from-white to-[#ffd6ec] shadow-[0_2px_0_#7a0044] active:translate-y-0.5 active:shadow-none flex flex-col items-center leading-none"
              aria-label={Number(k) >= 1 && Number(k) <= 4 && suggestions[Number(k) - 1] ? `Option ${k}: ${suggestions[Number(k) - 1]}` : `Key ${k}`}
            >
              <span className="font-bubble text-base text-[#1a0f1f]">{k}</span>
              <span className="font-pixel text-[11px] text-[#7a0044]/70 uppercase">{sub}</span>
            </button>
          ))}
        </div>

        {/* strap lug on the phone's edge… */}
        <span
          aria-hidden
          className="absolute top-[34px] -left-[9px] w-4 h-4 rounded-full border-[3px] border-[#7a0044] bg-[#ffd6ec] z-[5]"
        />
        {/* …with Sreeja's keychain hooked through it (ring centre = lug centre) */}
        <div className="absolute top-[33px] -left-[32px] z-10">
          <Keychain size={62} />
        </div>
      </div>
      </div>
    </div>
  );
}
