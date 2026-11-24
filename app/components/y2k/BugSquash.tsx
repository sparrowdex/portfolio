'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { retroAudio } from '../../utils/retroAudio';
import { Handheld, GameCard, readBest, saveBest } from './Handheld';

/**
 * Bug Squash: a typing game. Little bugs crawl down the screen, each carrying a word
 * from a coder's day (npm, async, prisma…). Type a bug's word to squash it before it
 * reaches the bottom of the screen. Three lives; it speeds up as you go. Squash a few in
 * a row without a typo for a combo. Works with a real keyboard, and on phones a tap on
 * the screen brings up the phone's keyboard.
 */

const BEST_KEY = 'bug_squash_best';
const WORDS = [
  'bug', 'npm', 'git', 'null', 'vite', 'json', 'lint', 'css', 'div', 'next', 'push', 'diff', 'node',
  'async', 'await', 'react', 'props', 'hooks', 'fetch', 'merge', 'deploy', 'commit', 'render', 'prisma',
  'shader', 'webgl', 'typo', 'cache', 'build', 'state',
];
// a one-line explanation for each word, shown when you squash it (so you learn a bit while playing)
const TIPS: Record<string, string> = {
  bug: 'a mistake in code that makes it misbehave',
  npm: "Node's package manager: installs libraries",
  git: 'tracks every change to your code',
  null: 'a value that means "nothing here"',
  vite: 'a fast tool that bundles and serves web apps',
  json: 'a text format for data: { "key": "value" }',
  lint: 'a tool that spots likely mistakes in code',
  css: 'the language that styles web pages',
  div: 'an HTML box for grouping things',
  next: 'Next.js: a React framework (this site uses it!)',
  push: 'send your commits up to GitHub',
  diff: 'the changes between two versions of a file',
  node: 'runs JavaScript outside the browser',
  async: 'lets code wait for something without freezing',
  await: 'pauses until a promise finishes',
  react: 'a library for building UIs from components',
  props: 'data passed into a React component',
  hooks: 'React functions like useState and useEffect',
  fetch: 'asks a server for data over the web',
  merge: 'combine one branch of code into another',
  deploy: 'put your app live on the internet',
  commit: 'a saved snapshot of your changes in git',
  render: 'turn data into what you see on screen',
  prisma: 'talks to a database with typed queries',
  shader: 'a tiny GPU program that colours pixels',
  webgl: 'draws 3D graphics in the browser',
  typo: 'a spelling slip; the most common bug of all',
  cache: 'saved data so things load faster next time',
  build: 'turn source code into a shippable app',
  state: "data a component remembers between renders",
};

const COLORS = ['#ff5fa2', '#c9a7ff', '#7fe3ff', '#ffd27a', '#8fe3a8'];

type Bug = { id: number; word: string; x: number; y: number; speed: number; color: string; wiggle: number };
type Splat = { id: number; x: number; y: number; color: string };
type Phase = 'title' | 'play' | 'over';

export function BugSquash({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>('title');
  // what's on screen: a copy of the game's state, refreshed every frame
  type View = { bugs: Bug[]; splats: Splat[]; typed: string; target: number; score: number; lives: number; combo: number; tip: string };
  const [view, setView] = useState<View>({ bugs: [], splats: [], typed: '', target: -1, score: 0, lives: 3, combo: 0, tip: '' });
  const [best, setBest] = useState(() => readBest(BEST_KEY));
  const [newBest, setNewBest] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const g = useRef({ bugs: [] as Bug[], splats: [] as Splat[], typed: '', target: -1, score: 0, lives: 3, combo: 0, next: 0, id: 0, t: 0, tip: '' });
  const snap = useCallback(() => {
    const x = g.current;
    setView({ bugs: [...x.bugs], splats: [...x.splats], typed: x.typed, target: x.target, score: x.score, lives: x.lives, combo: x.combo, tip: x.tip });
  }, []);

  const start = useCallback(() => {
    retroAudio.playCassetteInsert();
    g.current = { bugs: [], splats: [], typed: '', target: -1, score: 0, lives: 3, combo: 0, next: 0.4, id: 0, t: 0, tip: '' };
    setNewBest(false);
    setPhase('play');
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  /** One typed character: lock onto the bug whose word starts with what's typed. */
  const type = useCallback((ch: string) => {
    const s = g.current;
    const c = ch.toLowerCase();
    const attempt = s.typed + c;
    let target = s.bugs.find((b) => b.id === s.target);
    if (!target || !target.word.startsWith(attempt)) {
      // pick the lowest (most urgent) bug that matches
      target = [...s.bugs].sort((a, b) => b.y - a.y).find((b) => b.word.startsWith(attempt));
      if (!target && attempt.length > 1) target = [...s.bugs].sort((a, b) => b.y - a.y).find((b) => b.word.startsWith(c));
      if (!target) {
        s.combo = 0;
        retroAudio.playNote(160, 0.15, 0.08); // a little "nope"
        return;
      }
      s.typed = target.word.startsWith(attempt) ? attempt : c;
    } else s.typed = attempt;
    s.target = target.id;
    if (s.typed === target.word) {
      s.bugs = s.bugs.filter((b) => b.id !== target!.id);
      s.splats.push({ id: target.id, x: target.x, y: target.y, color: target.color });
      s.combo += 1;
      s.score += 1 + Math.floor(s.combo / 5);
      s.tip = `${target.word}: ${TIPS[target.word] ?? ''}`;
      s.typed = '';
      s.target = -1;
      retroAudio.playNote(660 + Math.min(s.combo, 10) * 50, 0.3, 0.1);
      const id = target.id;
      window.setTimeout(() => (g.current.splats = g.current.splats.filter((p) => p.id !== id)), 500);
    } else retroAudio.playNote(520, 0.08, 0.04);
    snap();
  }, [snap]);

  // keys: letters type, Escape closes, Enter / space starts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose();
      if (phase !== 'play') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          start();
        }
        return;
      }
      if (e.target === inputRef.current) return; // the hidden input handles it (phones)
      if (/^[a-z]$/i.test(e.key)) {
        e.preventDefault();
        type(e.key);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, onClose, start, type]);

  // the game loop
  useEffect(() => {
    if (phase !== 'play') return;
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = g.current;
      s.t += dt;
      // spawn: faster and more often as the score climbs
      s.next -= dt;
      if (s.next <= 0 && s.bugs.length < 6) {
        const used = new Set(s.bugs.map((b) => b.word[0]));
        const pool = WORDS.filter((w) => !used.has(w[0]) && w.length <= 3 + Math.floor(s.score / 6));
        const word = pool[Math.floor(Math.random() * pool.length)] ?? WORDS[0];
        s.bugs.push({ id: ++s.id, word, x: 8 + Math.random() * 74, y: -6, speed: 6 + Math.min(14, s.score * 0.5) + Math.random() * 3, color: COLORS[s.id % COLORS.length], wiggle: Math.random() * 6 });
        s.next = Math.max(0.7, 2.2 - s.score * 0.06);
      }
      for (const b of s.bugs) b.y += b.speed * dt;
      // a bug that reaches the bottom costs a life
      const escaped = s.bugs.filter((b) => b.y >= 92);
      if (escaped.length) {
        s.bugs = s.bugs.filter((b) => b.y < 92);
        s.lives -= escaped.length;
        s.combo = 0;
        if (escaped.some((b) => b.id === s.target)) {
          s.typed = '';
          s.target = -1;
        }
        retroAudio.playNote(110, 0.3, 0.2);
        try {
          navigator.vibrate?.(80);
        } catch {
          /* no haptics */
        }
      }
      if (s.lives <= 0) {
        const r = saveBest(BEST_KEY, s.score);
        setNewBest(r.isNew);
        setBest(r.best);
        retroAudio.playTapeWhirr();
        setPhase('over');
        return;
      }
      snap();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [phase, snap]);

  const s = view;
  return (
    <Handheld
      brand="🐞 BUG SQUASH"
      label="Bug Squash typing game"
      active={phase === 'play'}
      hint="type a bug's word to squash it · esc to quit"
      onClose={onClose}
      screenProps={{ onPointerDown: () => inputRef.current?.focus({ preventScroll: true }) }}
    >
      <div className="bs-screen">
        {/* faint code in the background */}
        <pre className="bs-code" aria-hidden>
          {'const app = () => {\n  fix(bugs);\n  ship();\n}\n// it works on my machine\nnpm run dev'}
        </pre>
        {s.bugs.map((b) => {
          const locked = b.id === s.target;
          return (
            <span key={b.id} className="bs-bug" style={{ left: `${b.x}%`, top: `${b.y}%`, '--c': b.color, '--w': `${b.wiggle}s` } as React.CSSProperties}>
              <span className="bs-body" aria-hidden>
                🐞
              </span>
              <span className={`bs-word ${locked ? 'is-locked' : ''}`}>
                {locked ? (
                  <>
                    <b>{s.typed}</b>
                    {b.word.slice(s.typed.length)}
                  </>
                ) : (
                  b.word
                )}
              </span>
            </span>
          );
        })}
        {s.splats.map((p) => (
          <span key={p.id} className="bs-splat" style={{ left: `${p.x}%`, top: `${p.y}%`, color: p.color }} aria-hidden>
            ✦
          </span>
        ))}
        {phase === 'play' && (
          <div className="bs-hud">
            <span>{'♥'.repeat(Math.max(0, s.lives))}</span>
            <span>
              {s.score}
              {s.combo >= 5 ? ` · x${1 + Math.floor(s.combo / 5)}` : ''}
            </span>
          </div>
        )}
        {phase === 'play' && s.tip && (
          <p key={s.tip} className="bs-tip">
            💡 {s.tip}
          </p>
        )}
        {/* phones: a hidden input so the phone's keyboard can come up */}
        <input
          ref={inputRef}
          className="bs-input"
          aria-label="Type the word on a bug"
          autoCapitalize="off"
          autoComplete="off"
          spellCheck={false}
          value=""
          onChange={(e) => [...e.target.value].forEach((ch) => /[a-z]/i.test(ch) && type(ch))}
        />
        {phase !== 'play' && (
          <GameCard title={phase === 'over' ? 'squashed!' : 'Bug Squash'} best={best} again={phase === 'over'} onStart={start}>
            {phase === 'over' ? (
              <p className="font-pixel text-lg text-[#7a0044]">
                {s.score} bugs {newBest ? '· new best ✦' : ''}
              </p>
            ) : (
              <p className="font-pixel text-base leading-tight text-[#7a0044]">type each bug&apos;s word before it reaches the bottom</p>
            )}
          </GameCard>
        )}
      </div>
    </Handheld>
  );
}
