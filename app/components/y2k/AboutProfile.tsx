'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { PROJECTS_DATA } from '../../data/projects';
import { PROFILE } from '../../data/profile';
import type { NowPlaying } from '../../utils/spotify';
import { retroAudio } from '../../utils/retroAudio';
import { OPEN_PHONE_EVENT, PLAY_PROJECT_EVENT } from '../RetroPhoneAssistant';
import { Y2KWindow } from './Y2KWindow';
import { openGame, isBerryUnlocked, subscribeBerryUnlock } from './arcade';

/**
 * "SreejaSpace": a 2006-style social profile for the About section.
 * Visitors can re-skin it Quotev-style (theme / font / glitter name); their
 * choice is remembered in localStorage.
 */

/* ── Customisation ─────────────────────────────────────────────────── */

type ThemeId = 'bubblegum' | 'classic' | 'lilac' | 'emo';
type FontId = 'default' | 'comic' | 'pixel';
type Custom = { theme: ThemeId; font: FontId; glitter: boolean };

const THEMES: Record<ThemeId, { label: string; swatch: string; vars: Record<string, string> }> = {
  bubblegum: {
    label: 'bubblegum',
    swatch: '#ff5fb0',
    vars: {
      '--sp-page': 'repeating-conic-gradient(#ffe1f1 0 25%, #ffd0ea 0 50%) 0 0 / 26px 26px',
      '--sp-head': '#ff5fb0',
      '--sp-head-text': '#ffffff',
      '--sp-panel': '#fff7fc',
      '--sp-text': '#1a0f1f',
      '--sp-muted': '#7a4a6a',
      '--sp-link': '#c2006f',
      '--sp-accent': '#ff2e93',
      '--sp-border': '#ff5fb0',
    },
  },
  classic: {
    label: 'classic blue',
    swatch: '#6699cc',
    vars: {
      '--sp-page': '#e5ecf7',
      '--sp-head': '#6699cc',
      '--sp-head-text': '#ffffff',
      '--sp-panel': '#ffffff',
      '--sp-text': '#000000',
      '--sp-muted': '#555555',
      '--sp-link': '#003399',
      '--sp-accent': '#ff6600',
      '--sp-border': '#6699cc',
    },
  },
  lilac: {
    label: 'lilac dream',
    swatch: '#9b6bff',
    vars: {
      '--sp-page': 'radial-gradient(#c9a7ff 1.5px, transparent 1.7px) 0 0 / 16px 16px, #f3ecff',
      '--sp-head': '#9b6bff',
      '--sp-head-text': '#ffffff',
      '--sp-panel': '#fbf8ff',
      '--sp-text': '#24123f',
      '--sp-muted': '#6b5a8a',
      '--sp-link': '#6a2cff',
      '--sp-accent': '#7a3cff',
      '--sp-border': '#9b6bff',
    },
  },
  emo: {
    label: 'emo night',
    swatch: '#1a0f1f',
    vars: {
      '--sp-page': 'repeating-linear-gradient(45deg, #1a0f1f 0 12px, #241626 12px 24px)',
      '--sp-head': '#000000',
      '--sp-head-text': '#ff8fd8',
      '--sp-panel': '#1f1420',
      '--sp-text': '#ffd6ee',
      '--sp-muted': '#c79ab8',
      '--sp-link': '#ff5fb0',
      '--sp-accent': '#ff2e93',
      '--sp-border': '#ff2e93',
    },
  },
};

const FONTS: Record<FontId, { label: string; family?: string; size?: string }> = {
  default: { label: 'normal' },
  comic: { label: 'comic sans', family: '"Comic Sans MS", "Comic Neue", "Chalkboard SE", cursive' },
  pixel: { label: 'pixel', family: 'var(--font-vt323), "Courier New", monospace', size: '1.18em' },
};

const KEY = 'sreejaspace_custom';
const DEFAULT: Custom = { theme: 'bubblegum', font: 'default', glitter: true };
const listeners = new Set<() => void>();
let cache: { raw: string | null; value: Custom } = { raw: null, value: DEFAULT };

function readCustom(): Custom {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    /* storage blocked */
  }
  if (raw !== cache.raw) {
    try {
      cache = { raw, value: { ...DEFAULT, ...(raw ? JSON.parse(raw) : {}) } };
    } catch {
      cache = { raw, value: DEFAULT };
    }
  }
  return cache.value;
}
function writeCustom(next: Custom) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    cache = { raw: JSON.stringify(next), value: next };
  }
  listeners.forEach((l) => l());
}
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

/* ── Content ───────────────────────────────────────────────────────── */

const DETAILS: [string, string][] = [
  ['Status', 'Building things ✦'],
  ['Here for', 'Collabs, cool projects, good people'],
  ['Hometown', 'New Delhi, India'],
  ['Education', "B.Tech CSE @ SRM IST ('23–'27) · CGPA 9.05"],
  ['Occupation', 'Co-Founder & CTO @ The Diecast Store · Founder @ Inner Voice'],
];

const INTERESTS: [string, string][] = [
  ['General', 'creative coding, hiding tiny surprises, mental-health tech'],
  ['Code', 'WebGL & shaders, mic-reactive toys, Web Audio'],
  ['Design', 'UI/UX, designing in Canva, e-commerce that feels premium'],
  ['Music', "whatever's playing on my profile song ♫"],
];

const AWARDS = [
  { icon: '🏆', t: 'Top 10 / 107', d: 'Girls Leading Tech Hackathon' },
  { icon: '🎓', t: 'IBM Data Science', d: 'Professional Certificate' },
  { icon: '📜', t: 'NPTEL', d: 'Natural Language Processing' },
  { icon: '💗', t: 'Mentor', d: '20+ girls taught to code' },
];

/* ── Pieces ────────────────────────────────────────────────────────── */

function Box({ title, children, className = '' }: { title: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`border-2 ${className}`} style={{ borderColor: 'var(--sp-border)', background: 'var(--sp-panel)' }}>
      <h4 className="px-3 py-1 font-bold text-[0.95em]" style={{ background: 'var(--sp-head)', color: 'var(--sp-head-text)' }}>
        {title}
      </h4>
      <div className="p-3">{children}</div>
    </section>
  );
}

function Table({ rows }: { rows: [string, string][] }) {
  return (
    <table className="w-full text-[0.92em] border-separate border-spacing-y-1">
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k}>
            <th
              scope="row"
              className="text-left align-top font-bold pr-2 py-1 px-2 w-[34%]"
              style={{ background: 'var(--sp-head)', color: 'var(--sp-head-text)', opacity: 0.85 }}
            >
              {k}:
            </th>
            <td className="align-top py-1 px-2" style={{ background: 'color-mix(in srgb, var(--sp-head) 12%, var(--sp-panel))' }}>
              {v}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

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
    <div className="flex items-center gap-3 p-2 rounded border" style={{ borderColor: 'var(--sp-border)' }}>
      {has && song.albumArt ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={song.albumArt} alt="" className="w-11 h-11 rounded object-cover shrink-0" />
      ) : (
        <span className="w-11 h-11 rounded grid place-items-center text-xl shrink-0" style={{ background: 'var(--sp-head)', color: 'var(--sp-head-text)' }}>
          ♫
        </span>
      )}
      <div className="min-w-0 flex-1 text-[0.9em] leading-tight">
        {has ? (
          <>
            <p className="font-bold truncate">{song.title}</p>
            <p className="truncate" style={{ color: 'var(--sp-muted)' }}>
              {song.artist}
            </p>
          </>
        ) : (
          <p style={{ color: 'var(--sp-muted)' }}>no profile song set (yet) ♡</p>
        )}
      </div>
      {has && trackId && (
        <button
          type="button"
          onClick={() => {
            retroAudio.playButtonClack();
            setEmbed(true);
          }}
          aria-label={`Play ${song.title} here`}
          title="play it right here"
          className="w-8 h-8 rounded-full grid place-items-center text-sm shrink-0 text-white"
          style={{ background: 'var(--sp-accent)' }}
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

function ContactBox({ toast }: { toast: (msg: string) => void }) {
  const [blockCount, setBlockCount] = useState(0);
  const actions: { icon: string; label: string; onClick: () => void }[] = [
    { icon: '✉', label: 'Send Message', onClick: () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: '➕', label: 'Add to Friends', onClick: () => window.open(PROFILE.links.linkedin, '_blank', 'noopener') },
    { icon: '💬', label: 'Instant Message', onClick: () => window.dispatchEvent(new Event(OPEN_PHONE_EVENT)) },
    { icon: '👥', label: 'Add to Group', onClick: () => window.open(PROFILE.links.github, '_blank', 'noopener') },
    {
      icon: '↪',
      label: 'Forward to Friend',
      onClick: () => {
        navigator.clipboard?.writeText(window.location.origin).then(
          () => toast('profile link copied ✦ send it to your bestie'),
          () => toast(window.location.origin),
        );
      },
    },
    {
      icon: '⛔',
      label: 'Block User',
      onClick: () => {
        toast(BLOCK_MESSAGES[blockCount % BLOCK_MESSAGES.length]);
        setBlockCount((c) => c + 1);
      },
    },
  ];
  return (
    <Box title="Contacting Sreeja">
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[0.92em]">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={() => {
              retroAudio.playHover();
              a.onClick();
            }}
            className="flex items-center gap-1.5 text-left hover:underline"
            style={{ color: 'var(--sp-link)' }}
          >
            <span aria-hidden className="w-5 text-center">
              {a.icon}
            </span>
            {a.label}
          </button>
        ))}
      </div>
    </Box>
  );
}

function TopFriends() {
  return (
    <Box title={<>Sreeja&apos;s Friend Space · <span className="font-normal">Sreeja has {PROJECTS_DATA.length} friends (projects)</span></>}>
      <p className="text-[0.85em] mb-2" style={{ color: 'var(--sp-muted)' }}>
        Sreeja&apos;s Top 8 · click one to play it in the disc player
      </p>
      <div className="grid grid-cols-4 2xl:grid-cols-8 gap-2 sm:gap-3">
        {PROJECTS_DATA.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              retroAudio.playCassetteInsert();
              window.dispatchEvent(new CustomEvent(PLAY_PROJECT_EVENT, { detail: p.id }));
            }}
            className="group flex flex-col items-center gap-1 text-center"
          >
            <span
              className="w-full aspect-square rounded border-2 overflow-hidden grid place-items-center transition-transform group-hover:-translate-y-0.5"
              style={{ borderColor: 'var(--sp-border)', background: p.logo ? (p.logoBg ?? '#fff') : p.colors[0] }}
            >
              {p.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.logo} alt="" className="w-3/4 h-3/4 object-contain" />
              ) : (
                <span className="font-bubble text-2xl text-white">{p.title[0]}</span>
              )}
            </span>
            <span className="text-[0.72em] leading-tight font-bold group-hover:underline line-clamp-2" style={{ color: 'var(--sp-link)' }}>
              {p.title.split(':')[0]}
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          className="group flex flex-col items-center gap-1 text-center"
        >
          <span
            className="w-full aspect-square rounded border-2 border-dashed grid place-items-center text-2xl"
            style={{ borderColor: 'var(--sp-border)', color: 'var(--sp-muted)' }}
          >
            ?
          </span>
          <span className="text-[0.72em] leading-tight font-bold group-hover:underline" style={{ color: 'var(--sp-link)' }}>
            your project here?
          </span>
        </button>
      </div>
    </Box>
  );
}

function Customizer({ custom }: { custom: Custom }) {
  const set = (patch: Partial<Custom>) => {
    retroAudio.playHover();
    writeCustom({ ...custom, ...patch });
  };
  return (
    <div className="font-pixel text-lg text-ink bg-white border-2 border-ink rounded-xl shadow-[3px_3px_0_#1a0f1f] p-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-16">theme:</span>
        {(Object.keys(THEMES) as ThemeId[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => set({ theme: id })}
            aria-pressed={custom.theme === id}
            title={THEMES[id].label}
            className={`flex items-center gap-1.5 px-2 rounded-full border-2 ${custom.theme === id ? 'border-ink bg-babypink' : 'border-transparent hover:border-ink/30'}`}
          >
            <span className="w-4 h-4 rounded-full border border-ink/40" style={{ background: THEMES[id].swatch }} />
            {THEMES[id].label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-16">font:</span>
        {(Object.keys(FONTS) as FontId[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => set({ font: id })}
            aria-pressed={custom.font === id}
            className={`px-2 rounded-full border-2 ${custom.font === id ? 'border-ink bg-babypink' : 'border-transparent hover:border-ink/30'}`}
            style={{ fontFamily: FONTS[id].family }}
          >
            {FONTS[id].label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-16">extras:</span>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={custom.glitter} onChange={(e) => set({ glitter: e.target.checked })} className="accent-hotpink" />
          glitter name
        </label>
        <button type="button" onClick={() => set(DEFAULT)} className="ml-auto underline text-ink/60 hover:text-ink">
          reset
        </button>
      </div>
    </div>
  );
}

/* Sreeja's Arcade: one game to play, one to find (Berry Basket unlocks once discovered). */
function Arcade() {
  const berry = useSyncExternalStore(subscribeBerryUnlock, isBerryUnlocked, () => false);
  const play = (id: 'berry' | 'stack') => {
    retroAudio.playCassetteInsert();
    openGame(id);
  };
  const row = 'flex items-center gap-3 border rounded px-2.5 py-2';
  const btn = 'shrink-0 font-bold text-[0.85em] px-2.5 py-1 rounded-full border-2 hover:brightness-110 active:translate-y-px';
  return (
    <Box title="🕹️ Sreeja's Arcade">
      <div className="space-y-2 text-[0.9em]">
        <div className={row} style={{ borderColor: 'var(--sp-border)' }}>
          <span className="text-2xl" aria-hidden>💿</span>
          <div className="flex-1 min-w-0 leading-tight">
            <p className="font-bold">Disc Stacker</p>
            <p style={{ color: 'var(--sp-muted)' }}>tap to stack CD cases. how high can you go?</p>
          </div>
          <button type="button" onClick={() => play('stack')} className={btn} style={{ background: 'var(--sp-head)', color: 'var(--sp-head-text)', borderColor: 'var(--sp-border)' }}>
            ▶ play
          </button>
        </div>
        {berry ? (
          <div className={row} style={{ borderColor: 'var(--sp-border)' }}>
            <span className="text-2xl" aria-hidden>🍓</span>
            <div className="flex-1 min-w-0 leading-tight">
              <p className="font-bold">Berry Basket <span className="font-normal" style={{ color: 'var(--sp-accent)' }}>✦ found it!</span></p>
              <p style={{ color: 'var(--sp-muted)' }}>catch berries, dodge beetles</p>
            </div>
            <button type="button" onClick={() => play('berry')} className={btn} style={{ background: 'var(--sp-head)', color: 'var(--sp-head-text)', borderColor: 'var(--sp-border)' }}>
              ▶ play
            </button>
          </div>
        ) : (
          <div className={`${row} border-dashed`} style={{ borderColor: 'var(--sp-border)' }}>
            <span className="text-2xl grayscale opacity-60" aria-hidden>🔒</span>
            <div className="flex-1 min-w-0 leading-tight">
              <p className="font-bold">??? <span className="font-normal" style={{ color: 'var(--sp-muted)' }}>· secret cartridge</span></p>
              <p style={{ color: 'var(--sp-muted)' }}>psst… the pink banner up top is ticklish 🍓</p>
            </div>
          </div>
        )}
      </div>
    </Box>
  );
}

/* ── Profile ───────────────────────────────────────────────────────── */

// Phones/tablets: one section at a time behind these tabs (laptops show everything).
const TABS = [
  ['blurbs', 'Blurbs'],
  ['details', 'Details'],
  ['song', 'Song'],
  ['friends', 'Friends'],
  ['arcade', 'Arcade'],
  ['awards', 'Awards'],
  ['contact', 'Contact'],
] as const;
type TabId = (typeof TABS)[number][0];

export function AboutProfile() {
  const custom = useSyncExternalStore(subscribe, readCustom, () => DEFAULT);
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<TabId>('blurbs');
  const show = (id: TabId) => (tab === id ? '' : 'hidden lg:block');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const theme = THEMES[custom.theme] ?? THEMES.bubblegum;
  const font = FONTS[custom.font] ?? FONTS.default;

  useEffect(() => {
    if (!toastMsg) return;
    const id = setTimeout(() => setToastMsg(null), 2800);
    return () => clearTimeout(id);
  }, [toastMsg]);

  return (
    <Y2KWindow title="sreejaspace.com/sreeja" icon="💖" bodyClassName="p-0">
      {/* fake browser address bar + customise toggle */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f4eef2] border-b-2 border-ink/15 font-pixel text-lg">
        <span className="flex-1 min-w-0 truncate rounded bg-white border border-ink/25 px-2 text-ink/70">http://www.sreejaspace.com/sreeja</span>
        <button
          type="button"
          onClick={() => {
            retroAudio.playButtonClack();
            setEditing((e) => !e);
          }}
          aria-expanded={editing}
          className="shrink-0 px-2.5 rounded-full border-2 border-ink bg-white hover:bg-babypink"
        >
          ✎ {editing ? 'done' : 'customize'}
        </button>
      </div>

      <div
        className="relative p-3 sm:p-5"
        style={{
          ...(theme.vars as React.CSSProperties),
          background: 'var(--sp-page)',
          color: 'var(--sp-text)',
          fontFamily: font.family,
          fontSize: font.size,
        }}
      >
        {editing && (
          <div className="mb-4">
            <Customizer custom={custom} />
          </div>
        )}

        {/* extended network banner */}
        <div
          className="hidden lg:block mb-4 px-3 py-2 border-2 text-center font-bold text-[1.05em]"
          style={{ borderColor: 'var(--sp-border)', background: 'var(--sp-panel)', color: 'var(--sp-accent)' }}
        >
          Sreeja is in your extended network ✦
        </div>

        <div className="grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)] gap-4 xl:gap-6 items-start">
          {/* ── left column ── */}
          <div className="space-y-4 min-w-0">
            <div className="border-2 p-3" style={{ borderColor: 'var(--sp-border)', background: 'var(--sp-panel)' }}>
              <h3 className={`font-bubble text-3xl leading-none ${custom.glitter ? 'sp-glitter' : ''}`} style={custom.glitter ? undefined : { color: 'var(--sp-accent)' }}>
                Sreeja ✦
              </h3>
              <div className="flex gap-3 mt-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/sreeja/sreeja_party.jpeg"
                  alt="Sreeja"
                  className="w-32 h-32 object-cover object-[64%_38%] border-2 shrink-0"
                  style={{ borderColor: 'var(--sp-border)' }}
                />
                <div className="text-[0.9em] leading-snug space-y-1 min-w-0">
                  <p className="italic">&ldquo;bridging logic &amp; emotion&rdquo;</p>
                  <p>New Delhi, India</p>
                  <p>
                    <span className="font-bold">Mood:</span> 💗 shipping
                  </p>
                  <p className="font-bold flex items-center gap-1" style={{ color: 'var(--sp-accent)' }}>
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-blink" aria-hidden />
                    Online Now!
                  </p>
                </div>
              </div>
              <p className="mt-3 text-[0.88em]">
                <span className="font-bold">View My: </span>
                <a href="#player" className="hover:underline" style={{ color: 'var(--sp-link)' }}>
                  Projects
                </a>{' '}
                |{' '}
                <a href="/resume" className="hover:underline" style={{ color: 'var(--sp-link)' }}>
                  Résumé
                </a>{' '}
                |{' '}
                <a href={PROFILE.links.github} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--sp-link)' }}>
                  Code
                </a>
              </p>
            </div>

            {/* MySpace-style section links (phones/tablets only) */}
            <nav
              aria-label="Profile sections"
              className="lg:hidden border-2 px-2 py-1.5 flex flex-wrap justify-center gap-x-1 gap-y-0.5 text-[0.9em]"
              style={{ borderColor: 'var(--sp-border)', background: 'var(--sp-panel)' }}
            >
              {TABS.map(([id, label], i) => (
                <React.Fragment key={id}>
                  {i > 0 && <span aria-hidden style={{ color: 'var(--sp-muted)' }}>|</span>}
                  <button
                    type="button"
                    aria-pressed={tab === id}
                    onClick={() => {
                      retroAudio.playHover();
                      setTab(id);
                    }}
                    className={`px-1 rounded-sm ${tab === id ? 'font-bold' : 'underline underline-offset-2'}`}
                    style={tab === id ? { background: 'var(--sp-head)', color: 'var(--sp-head-text)' } : { color: 'var(--sp-link)' }}
                  >
                    {label}
                  </button>
                </React.Fragment>
              ))}
            </nav>

            <Box title="♫ Sreeja's Profile Song" className={show('song')}>
              <ProfileSong />
            </Box>

            <div className={show('contact')}>
              <ContactBox toast={setToastMsg} />
            </div>

            <Box title="Sreeja's Details" className={show('details')}>
              <Table rows={DETAILS} />
            </Box>

            <Box title="Sreeja's Interests" className={show('details')}>
              <Table rows={INTERESTS} />
            </Box>
          </div>

          {/* ── right column ── */}
          <div className="space-y-4 min-w-0">
            <Box title="Sreeja's Blurbs" className={show('blurbs')}>
              <h5 className="font-bold text-[1.05em]" style={{ color: 'var(--sp-accent)' }}>
                About me:
              </h5>
              <div className="mt-1 space-y-2 leading-relaxed">
                <p>
                  My view of computer science changed the moment I found creative coding. Now I build interfaces that reward curiosity: a
                  photobooth that prints strips, a snow globe you blow on, a garden of 3D flowers made for friends.
                </p>
                <p>
                  I also love the unglamorous half. Most of my time goes into <b>The Diecast Store</b>, a diecast-car store I first built as
                  its freelance developer and now help run as Co-Founder &amp; CTO. The rest goes into building fun things, like the ones on
                  the disc player below.
                </p>
                <p style={{ color: 'var(--sp-muted)' }}>
                  what I care about: ✦ rewarding curiosity ✦ logic meets reliability ✦ the bigger picture
                </p>
              </div>
              <h5 className="font-bold text-[1.05em] mt-4" style={{ color: 'var(--sp-accent)' }}>
                Who I&apos;d like to meet:
              </h5>
              <ul className="mt-1 space-y-1">
                <li>♡ teams building tactile, delightful products</li>
                <li>♡ founders who care about UX as much as uptime</li>
                <li>♡ anyone who thinks a site deserves a personality as much as a design (they kinda go hand in hand)</li>
              </ul>
            </Box>

            <div className={show('friends')}>
              <TopFriends />
            </div>

            <div className={show('arcade')}>
              <Arcade />
            </div>

            <Box title="Sreeja's Awards" className={show('awards')}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {AWARDS.map((a) => (
                  <div key={a.t} className="text-center border rounded px-2 py-2" style={{ borderColor: 'var(--sp-border)' }}>
                    <div className="text-xl" aria-hidden>
                      {a.icon}
                    </div>
                    <div className="font-bold text-[0.85em] leading-tight mt-1">{a.t}</div>
                    <div className="text-[0.75em] leading-tight" style={{ color: 'var(--sp-muted)' }}>
                      {a.d}
                    </div>
                  </div>
                ))}
              </div>
            </Box>
          </div>
        </div>

        {toastMsg && (
          <div
            role="status"
            className="fixed left-1/2 -translate-x-1/2 bottom-24 z-[80] max-w-[calc(100vw-2rem)] text-center font-pixel text-xl px-5 py-2 rounded-full bg-white text-ink border-2 border-ink shadow-[3px_3px_0_#1a0f1f] animate-pop-in"
          >
            {toastMsg}
          </div>
        )}
      </div>
    </Y2KWindow>
  );
}
