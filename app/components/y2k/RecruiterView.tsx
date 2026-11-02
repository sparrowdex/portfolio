'use client';

import React from 'react';
import { RESUME } from '../../data/resume';
import { PROJECTS_DATA } from '../../data/projects';
import { PROFILE } from '../../data/profile';
import { ModeSwitch } from './Taskbar';
import { setViewMode } from './viewMode';

/** **bold** support for the few emphasised phrases in the résumé text. */
function Text({ children }: { children: string }) {
  return (
    <>
      {children.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
        p.startsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : <React.Fragment key={i}>{p}</React.Fragment>,
      )}
    </>
  );
}

const Ext = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    target={href.startsWith('mailto:') ? undefined : '_blank'}
    rel="noopener noreferrer"
    className="underline decoration-neutral-300 underline-offset-2 hover:decoration-[#ff2e93] hover:text-black"
  >
    {children}
  </a>
);

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-playfair italic text-2xl text-black border-b border-black pb-1 mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 space-y-1.5 text-[15px] leading-relaxed text-neutral-800">
      {items.map((p) => (
        <li key={p} className="flex gap-2.5">
          <span aria-hidden className="mt-[0.6em] w-1.5 h-1.5 shrink-0 bg-black rounded-full" />
          <span>
            <Text>{p}</Text>
          </span>
        </li>
      ))}
    </ul>
  );
}

// Projects on this site that aren't on the one-page résumé.
const EXTRA = PROJECTS_DATA.filter((p) => [4, 5, 6].includes(p.id));

/** Clean one-pager mirroring the PDF résumé, for a 30-second skim. */
export function RecruiterView() {
  const r = RESUME;
  return (
    <div className="relative z-10 min-h-screen bg-[#fbfaf8] text-black font-sans">
      <div className="h-1 bg-[#ff2e93]" aria-hidden />
      <header className="sticky top-0 z-50 bg-[#fbfaf8]/95 backdrop-blur border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <span className="font-mono text-xs font-bold tracking-[0.2em]">SREEJA DAS · RÉSUMÉ</span>
          <ModeSwitch mode="recruiter" tone="plain" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
        {/* ── header ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b-2 border-black pb-8">
          <div>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight uppercase">{r.name}</h1>
            <p className="mt-3 text-lg text-neutral-700">{PROFILE.role}</p>
            <p className="mt-2 font-mono text-sm text-neutral-600 flex flex-wrap gap-x-3 gap-y-1">
              <span>{r.location}</span>
              <span aria-hidden>|</span>
              <Ext href={r.links.email}>{PROFILE.email}</Ext>
              <span aria-hidden>|</span>
              <Ext href={r.links.linkedin}>LinkedIn</Ext>
              <span aria-hidden>|</span>
              <Ext href={r.links.github}>GitHub</Ext>
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <a
              href={PROFILE.resumeUrl}
              download={PROFILE.resumeFileName}
              className="px-5 py-3 bg-black text-white font-mono text-sm font-bold hover:bg-[#ff2e93] transition-colors"
            >
              Download PDF ↓
            </a>
            <a href={r.links.email} className="px-5 py-3 border-2 border-black font-mono text-sm font-bold hover:bg-black hover:text-white transition-colors">
              Email me
            </a>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-x-14 gap-y-12 mt-10">
          {/* ── main column ── */}
          <div className="space-y-12 min-w-0">
            <Section title="Experience">
              <div className="space-y-8">
                {r.experience.map((e) => (
                  <article key={e.org}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <h3 className="text-lg font-bold">
                        {e.org} {e.orgNote && <span className="font-normal text-neutral-600">{e.orgNote}</span>}
                        {e.link && (
                          <>
                            {' '}
                            <span className="font-normal text-neutral-400">|</span>{' '}
                            <span className="font-normal text-sm">
                              <Ext href={e.link}>Live Link</Ext>
                            </span>
                          </>
                        )}
                      </h3>
                      <span className="font-playfair italic text-neutral-700">{e.dates}</span>
                    </div>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 text-neutral-700">
                      <span className="font-playfair italic">{e.role}</span>
                      <span className="font-playfair italic text-sm">{e.place}</span>
                    </div>
                    <Bullets items={e.points} />
                  </article>
                ))}
              </div>
            </Section>

            <Section title="Projects">
              <div className="space-y-8">
                {r.projects.map((p) => (
                  <article key={p.name}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <h3 className="text-lg font-bold">
                        {p.name} <span className="font-normal text-neutral-400">|</span>{' '}
                        <span className="font-normal text-sm">
                          <Ext href={p.link}>Live Link</Ext>
                        </span>
                      </h3>
                      <span className="font-playfair italic text-neutral-700">{p.date}</span>
                    </div>
                    <p className="font-playfair italic text-neutral-700">{p.stack}</p>
                    <Bullets items={p.points} />
                  </article>
                ))}
              </div>
            </Section>

            <Section title="Also on this site">
              <div className="grid sm:grid-cols-3 gap-3">
                {EXTRA.map((p) => {
                  const live = p.links?.find((l) => l.kind === 'live');
                  const code = p.links?.find((l) => l.kind === 'code');
                  return (
                    <div key={p.id} className="border border-neutral-300 bg-white p-4 flex flex-col">
                      <h3 className="font-bold">{p.title}</h3>
                      <p className="text-sm text-neutral-600 mt-1 flex-1">{p.desc}</p>
                      <p className="font-mono text-xs mt-3 flex gap-3">
                        {live && <Ext href={live.href}>Live ↗</Ext>}
                        {code && <Ext href={code.href}>Code ↗</Ext>}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Section>
          </div>

          {/* ── sidebar ── */}
          <aside className="space-y-12">
            <Section title="Education">
              {r.education.map((ed) => (
                <div key={ed.school}>
                  <h3 className="font-bold leading-snug">{ed.school}</h3>
                  <p className="font-playfair italic text-neutral-700">{ed.dates}</p>
                  <p className="text-[15px] text-neutral-800 mt-1">{ed.degree}</p>
                  <p className="mt-2 inline-block font-mono text-sm font-bold border-2 border-black px-2 py-0.5">CGPA: {ed.cgpa}</p>
                  <p className="font-playfair italic text-sm text-neutral-600 mt-1">{ed.place}</p>
                </div>
              ))}
            </Section>

            <Section title="Technical Skills">
              <dl className="space-y-3 text-[15px]">
                {r.skills.map((s) => (
                  <div key={s.group}>
                    <dt className="font-bold">{s.group}</dt>
                    <dd className="text-neutral-800">{s.items}</dd>
                  </div>
                ))}
              </dl>
            </Section>

            <Section title="Achievements & Certifications">
              <ul className="space-y-3 text-[15px] leading-relaxed text-neutral-800">
                {r.achievements.map((a) => (
                  <li key={a.title}>
                    <strong>{a.title}</strong>{' '}
                    {a.link && <Ext href={a.link}>View Credential</Ext>} {a.text}
                  </li>
                ))}
              </ul>
            </Section>
          </aside>
        </div>

        <footer className="mt-16 pt-6 border-t border-neutral-300 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-neutral-600">
          <span>
            Want the full experience?{' '}
            <button onClick={() => setViewMode('fun')} className="underline text-black hover:text-[#ff2e93]">
              Switch to fun mode ✦
            </button>
          </span>
          <span>© {r.name}</span>
        </footer>
      </main>
    </div>
  );
}
