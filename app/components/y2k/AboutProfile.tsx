'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { PROFILE } from '../../data/profile';
import type { NowPlaying } from '../../utils/spotify';
import { retroAudio } from '../../utils/retroAudio';
import { OPEN_PHONE_EVENT } from '../RetroPhoneAssistant';
import { openGame, isBerryUnlocked, subscribeBerryUnlock } from './arcade';
import { OrigamiSwan, type SwanMode } from './OrigamiSwan';
import { setMusicBoxOpen } from '../../utils/skyAmbience';
import { SectionTitle } from './Decor';
import { MusicBox, type BoxCard } from './MusicBox';

/**
 * About me, up in the clouds: a blush-pink paper swan (drawn in code, OrigamiSwan.tsx)
 * flutters in. Tap it and it unfolds stage by stage, to the sound of real paper, into a flat creased sheet with the About-me notes written on it. It can fold
 * itself back into a swan. Faint wind chimes play while you're up here.
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
    { icon: '✉', label: 'Message', onClick: () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: '➕', label: 'Add friend', onClick: () => window.open(PROFILE.links.linkedin, '_blank', 'noopener') },
    { icon: '💬', label: 'IM', onClick: () => window.dispatchEvent(new Event(OPEN_PHONE_EVENT)) },
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
          <span aria-hidden className="text-xl">💿</span>
          <b>Disc Stacker</b>
          <span>▶ play</span>
        </span>
      </button>
      {berry ? (
        <button type="button" onClick={() => play('berry')} className="nb-cart" style={{ '--cart': '#ff9cc6' } as React.CSSProperties}>
          <span className="nb-cart-label">
            <span aria-hidden className="text-xl">🍓</span>
            <b>Berry Basket</b>
            <span>found it! ▶</span>
          </span>
        </button>
      ) : (
        <span className="nb-cart is-locked" title="psst… the pink banner up top is ticklish" style={{ '--cart': '#d9cfd8' } as React.CSSProperties}>
          <span className="nb-cart-label">
            <span aria-hidden className="text-xl">🔒</span>
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

/** Which About-me presentation to show: the music box, or the origami swan (kept for comparison). */
const ABOUT_STYLE: 'musicbox' | 'swan' = 'musicbox';

const BOX_CARDS: BoxCard[] = [
  { id: 'hello', label: 'hello', tint: '#ffd6e6' },
  { id: 'now', label: 'right now', tint: '#d9ecff' },
  { id: 'wins', label: 'little wins', tint: '#fff1b8' },
  { id: 'fun', label: 'for fun', tint: '#e6dcff' },
  { id: 'hi', label: 'say hi', tint: '#d8f3e3' },
];

/** The About-me music box, and the card that opens beside it. */
function MusicBoxAbout() {
  const [picked, setPicked] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!toastMsg) return;
    const id = setTimeout(() => setToastMsg(null), 2800);
    return () => clearTimeout(id);
  }, [toastMsg]);
  // the music box's tune stops if you leave while it's open
  useEffect(() => () => setMusicBoxOpen(false), []);

  const card = BOX_CARDS.find((c) => c.id === picked);
  return (
    <>
      <SectionTitle kicker="profile" title="About Me" />
      <div className={`mb-about ${card ? 'has-note' : ''}`} style={VARS}>
        <MusicBox cards={BOX_CARDS} picked={picked} onPick={setPicked} />
        {card && (
        <div key={card.id} className="mb-note is-open" style={{ '--tint': card.tint } as React.CSSProperties}>
          {/* the same card you picked from the box, grown big: its label on a ribbon tab, brass corners, a bar of music */}
          <span className="mb-note-tab nb-hand" aria-hidden>
            ♪ {card.label}
          </span>
          {['tl', 'tr', 'bl', 'br'].map((k) => (
            <span key={k} className={`mb-corner is-${k}`} aria-hidden />
          ))}
          <svg viewBox="0 0 240 70" className="mb-staff" aria-hidden>
            {[10, 20, 30, 40, 50].map((y) => (
              <line key={y} x1="0" x2="240" y1={y} y2={y} />
            ))}
            <g className="mb-staff-notes">
              <ellipse cx="40" cy="40" rx="6" ry="4.5" transform="rotate(-20 40 40)" />
              <line x1="45.5" y1="39" x2="45.5" y2="10" />
              <ellipse cx="90" cy="30" rx="6" ry="4.5" transform="rotate(-20 90 30)" />
              <line x1="95.5" y1="29" x2="95.5" y2="2" />
              <ellipse cx="150" cy="35" rx="6" ry="4.5" transform="rotate(-20 150 35)" />
              <ellipse cx="185" cy="25" rx="6" ry="4.5" transform="rotate(-20 185 25)" />
              <line x1="155.5" y1="34" x2="155.5" y2="6" />
              <line x1="190.5" y1="24" x2="190.5" y2="-4" />
              <line x1="155.5" y1="6" x2="190.5" y2="-4" strokeWidth="3" />
            </g>
          </svg>
          {card?.id === 'hello' && (
            <div className="og-story">
              <figure className="mb-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/sreeja/sreeja_party.jpeg" alt="Sreeja" />
              </figure>
              <h3 className="og-h">Hello,</h3>
              <p>
                I fell for computer science through creative coding, and I still build things that reward curiosity: a photobooth that
                prints strips, a snow globe you blow on, a garden of 3D flowers for my friends.
              </p>
              <p>
                These days most of my time goes into <Hl>The Diecast Store</Hl>, which I built as a freelancer and now help run as{' '}
                <Hl>co-founder &amp; CTO</Hl>.
              </p>
            </div>
          )}
          {card?.id === 'now' && (
            <div>
              <h3 className="og-h">Right now</h3>
              <dl className="og-facts">
                <div>
                  <dt>building</dt>
                  <dd>The Diecast Store, as Co-Founder &amp; CTO</dd>
                </div>
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
          )}
          {card?.id === 'wins' && (
            <div>
              <h3 className="og-h">Little wins</h3>
              <ul className="og-wins">
                {WINS.map((w) => (
                  <li key={w.t}>
                    <b>{w.t}</b> <span>{w.d}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {card?.id === 'fun' && (
            <div className="space-y-4">
              <h3 className="og-h">For fun</h3>
              <ProfileSong />
              <Arcade />
            </div>
          )}
          {card?.id === 'hi' && (
            <div>
              <h3 className="og-h">Say hi</h3>
              <p className="og-story">Working on something fun, or need a hand with a build? I&apos;d love to hear about it.</p>
              <FriendActions toast={setToastMsg} />
            </div>
          )}
        </div>
        )}
      </div>
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

export function AboutProfile() {
  return ABOUT_STYLE === 'musicbox' ? <MusicBoxAbout /> : <SwanAbout />;
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
                I fell for computer science through creative coding, and I still build things that reward curiosity: a photobooth that
                prints strips, a snow globe you blow on, a garden of 3D flowers for my friends.
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
