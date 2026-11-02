'use client';

import React from 'react';
import { Y2KWindow } from './Y2KWindow';
import { Sparkle } from './Decor';

/** MySpace-style "about me" profile. Facts come from the résumé (app/data/resume.ts) and project data. */

const DETAILS: [string, string][] = [
  ['location', 'New Delhi, India'],
  ['studying', "B.Tech CSE @ SRM IST ('23–'27)"],
  ['cgpa', '9.05'],
  ['building', 'Inner Voice (founder) · The Diecast Store (CTO)'],
  ['previously', 'Web Dev Intern @ NIC'],
];

const CARES = [
  { n: '01', t: 'rewarding curiosity', d: 'interfaces with hidden interactions, motion and texture.' },
  { n: '02', t: 'logic meets reliability', d: 'robust infrastructure is an act of care for users.' },
  { n: '03', t: 'the bigger picture', d: 'turning complex problems into intuitive experiences.' },
];

const INTERESTS = [
  'creative coding',
  'hiding tiny surprises',
  'WebGL & shaders',
  'mic-reactive toys',
  'Web Audio',
  'UI/UX & Figma',
  'designing in Canva',
  'mental-health tech',
  'e-commerce that feels premium',
];

const MEET = [
  'teams building tactile, delightful products',
  'founders who care about UX as much as uptime',
  'anyone who thinks a site deserves a personality as much as a design ✦ (they kinda go hand in hand)',
];

const TROPHIES = [
  { icon: '🏆', t: 'Top 10 / 90', d: 'Girls Leading Tech Hackathon (Christmas Spirit)' },
  { icon: '★', t: 'Most Creative Submission', d: 'Armatrix team-page challenge' },
  { icon: '🎓', t: 'IBM Data Science', d: 'Professional Certificate · Mar 2026' },
  { icon: '📜', t: 'NPTEL · NLP', d: 'Natural Language Processing certification' },
  { icon: '💗', t: 'Mentor (BAJSS)', d: '20+ girls taught coding & digital literacy' },
];

export function AboutProfile() {
  return (
    <div className="grid lg:grid-cols-[340px_minmax(0,1fr)] gap-8 items-start">
      {/* ── left: profile card + trophies ── */}
      <div className="space-y-8">
        <Y2KWindow title="sreeja's profile" icon="💖" draggable bodyClassName="p-0">
          <div className="p-4 flex gap-4 items-center bg-[#fff7fc]">
            <div className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/sreeja/sreeja_party.jpeg"
                alt="Sreeja"
                className="w-32 h-32 sm:w-36 sm:h-36 object-cover object-[64%_38%] rounded-lg border-2 border-ink shadow-[3px_3px_0_#1a0f1f] bg-babypink"
              />
              <Sparkle size={20} className="absolute -top-2 -right-2" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bubble text-2xl leading-none text-ink">Sreeja Das</h3>
              <p className="font-pixel text-lg text-ink/70 mt-1">&ldquo;bridging logic &amp; emotion&rdquo;</p>
              <p className="font-pixel text-lg mt-1 flex items-center gap-1.5 text-[#14a35a]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-blink" aria-hidden />
                online now!
              </p>
            </div>
          </div>
          <div className="px-4 py-2 border-y-2 border-ink/15 bg-babypink font-pixel text-lg text-ink">
            <span className="text-hotpink">status:</span> maintaining The Diecast Store ✦
          </div>
          <dl className="p-4 space-y-1.5 text-[15px]">
            {DETAILS.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[88px_1fr] gap-2">
                <dt className="font-pixel text-lg leading-tight text-hotpink">{k}:</dt>
                <dd className="text-ink/85 leading-snug">{v}</dd>
              </div>
            ))}
          </dl>
        </Y2KWindow>

        <Y2KWindow title="trophy_case/" icon="🏆" accent="#d9a400" draggable bodyClassName="p-3">
          <ul className="space-y-2">
            {TROPHIES.map((t) => (
              <li key={t.t} className="flex gap-3 items-start rounded-lg bg-white border border-ink/15 px-3 py-2">
                <span className="text-xl leading-none mt-0.5" aria-hidden>
                  {t.icon}
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-sm text-ink">{t.t}</span>
                  <span className="block text-sm text-ink/70 leading-snug">{t.d}</span>
                </span>
              </li>
            ))}
          </ul>
        </Y2KWindow>
      </div>

      {/* ── right: about me + interests + who i'd like to meet ── */}
      <div className="space-y-8 min-w-0">
        <Y2KWindow title="about_me.txt" icon="📝" draggable bodyClassName="p-5 sm:p-6">
          <h3 className="font-bubble text-2xl sm:text-3xl text-ink">hi, i&apos;m sreeja ✦</h3>
          <div className="mt-3 space-y-3 text-[15px] sm:text-base leading-relaxed text-ink/85">
            <p>
              My view of computer science changed the moment I found creative coding. Now I build interfaces that reward
              curiosity: a photobooth that prints strips, a snow globe you blow on, a garden of 3D flowers made for friends.
            </p>
            <p>
              I also love the unglamorous half. I founded <b>Inner Voice</b>, a mental-health platform built around anonymous
              support and a &quot;Trusted Friends&quot; network, and I&apos;m CTO of <b>The Diecast Store</b>, where I architected
              zero-trust payments, live logistics and an installable PWA. Before that I helped digitise government workflows at the{' '}
              <b>National Informatics Centre</b>.
            </p>
          </div>
          <div className="mt-5 grid sm:grid-cols-3 gap-3">
            {CARES.map((c) => (
              <div key={c.n} className="rounded-xl border-2 border-ink/80 bg-babypink/70 p-3">
                <p className="font-pixel text-lg leading-none text-hotpink">{c.n} · what i care about</p>
                <p className="font-bubble text-lg mt-1.5 leading-tight text-ink">{c.t}</p>
                <p className="text-sm text-ink/75 mt-1 leading-snug">{c.d}</p>
              </div>
            ))}
          </div>
        </Y2KWindow>

        <div className="grid sm:grid-cols-2 gap-8">
          <Y2KWindow title="interests.txt" icon="🦋" accent="#9b6bff" draggable bodyClassName="p-4">
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((x, i) => (
                <span
                  key={x}
                  className="font-pixel text-lg leading-none px-2.5 py-1 rounded-full border-2 border-ink bg-white shadow-[2px_2px_0_#1a0f1f]"
                  style={{ rotate: `${((i * 5) % 5) - 2}deg` }}
                >
                  {x}
                </span>
              ))}
            </div>
          </Y2KWindow>
          <Y2KWindow title="who_id_like_to_meet.txt" icon="💌" accent="#19b8e6" draggable bodyClassName="p-4">
            <ul className="space-y-2 text-[15px] text-ink/85">
              {MEET.map((m) => (
                <li key={m} className="flex gap-2">
                  <span className="text-hotpink" aria-hidden>
                    ♥
                  </span>
                  {m}
                </li>
              ))}
            </ul>
          </Y2KWindow>
        </div>
      </div>
    </div>
  );
}
