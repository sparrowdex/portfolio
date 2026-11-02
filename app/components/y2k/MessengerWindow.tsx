'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PROFILE } from '../../data/profile';
import { retroAudio } from '../../utils/retroAudio';
import { Y2KWindow } from './Y2KWindow';
import { ChromeButton } from './ChromeButton';

type Line = { from: 'sreeja' | 'you' | 'system'; text: string };

/**
 * AIM-style contact window. Visitors type a real message that's sent to
 * Sreeja through /api/contact (Resend). Falls back to mailto on failure.
 */
export function MessengerWindow() {
  const [lines, setLines] = useState<Line[]>([
    { from: 'sreeja', text: 'heyyy!! thx 4 stopping by :)' },
    { from: 'sreeja', text: 'wanna build something together? leave me a message right here ↓' },
  ]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [copied, setCopied] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [lines]);

  const say = (l: Line) => setLines((prev) => [...prev, l]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    if (!name.trim() || !email.trim() || !message.trim()) {
      say({ from: 'system', text: '✦ fill in your name, email and a message first' });
      return;
    }
    setStatus('sending');
    retroAudio.playButtonClack();
    say({ from: 'you', text: message.trim() });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'send failed');
      retroAudio.playSmsChime();
      setStatus('sent');
      setMessage('');
      say({ from: 'sreeja', text: `got it, ${name.trim().split(' ')[0]}!! ♥ i'll reply to ${email.trim()} soon` });
    } catch (err) {
      setStatus('idle');
      const msg = err instanceof Error && err.message !== 'send failed' ? err.message : 'connection dropped';
      say({ from: 'system', text: `⚠ ${msg}. you can email me directly at ${PROFILE.email}` });
    }
  };

  const field =
    'font-pixel text-xl px-3 py-1.5 rounded-md bg-white border-2 border-ink/30 focus:border-[#19b8e6] outline-none text-ink placeholder:text-ink/40 min-w-0';

  return (
    <Y2KWindow title="SreejaDas — Instant Message" icon="💬" accent="#19b8e6" bodyClassName="p-0">
      {/* chat log */}
      <div ref={logRef} className="p-4 space-y-2 bg-white font-pixel text-xl h-48 overflow-y-auto" aria-live="polite">
        {lines.map((l, i) => (
          <p key={i} className={l.from === 'system' ? 'text-ink/50' : ''}>
            {l.from === 'sreeja' && <span className="text-hotpink">sreeja✦: </span>}
            {l.from === 'you' && <span className="text-[#0f8fbf]">{name.trim() || 'you'}: </span>}
            {l.text}
          </p>
        ))}
        {status === 'sending' && (
          <p className="text-ink/50">
            <span className="animate-blink">▌</span> sending…
          </p>
        )}
      </div>

      {/* compose */}
      <form onSubmit={submit} className="p-3 sm:p-4 border-t-2 border-ink/15 bg-[#f1fbff] space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="your name" aria-label="Your name" autoComplete="name" maxLength={100} />
          <input
            className={field}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your email"
            aria-label="Your email"
            autoComplete="email"
            maxLength={200}
          />
        </div>
        <textarea
          className={`${field} w-full resize-none h-24 leading-tight`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="type your message…"
          aria-label="Message"
          maxLength={5000}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(e);
          }}
        />
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <span className="font-pixel text-base text-ink/50">ctrl + enter to send</span>
          <ChromeButton type="submit" disabled={status === 'sending'} className="disabled:opacity-60">
            {status === 'sending' ? 'sending…' : 'send ✉'}
          </ChromeButton>
        </div>
      </form>

      {/* direct links */}
      <div className="px-4 py-3 border-t-2 border-ink/15 flex flex-wrap gap-2 justify-center items-center bg-white">
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(PROFILE.email);
            retroAudio.playHover();
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="font-pixel text-lg px-2.5 py-0.5 rounded-md border-2 border-ink/25 hover:border-ink/60 bg-white"
          title="Copy email address"
        >
          {copied ? '✓ copied!' : `✉ ${PROFILE.email}`}
        </button>
        <ChromeButton href={PROFILE.links.github} target="_blank" rel="noopener noreferrer" variant="silver" size="sm">
          github ↗
        </ChromeButton>
        <ChromeButton href={PROFILE.links.linkedin} target="_blank" rel="noopener noreferrer" variant="silver" size="sm">
          linkedin ↗
        </ChromeButton>
        <ChromeButton href={PROFILE.links.diecast} target="_blank" rel="noopener noreferrer" variant="silver" size="sm">
          the diecast store ↗
        </ChromeButton>
      </div>
    </Y2KWindow>
  );
}
