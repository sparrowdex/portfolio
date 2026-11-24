import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { RESUME } from '../data/resume';
import { PROFILE } from '../data/profile';
import { CloudSky } from '../components/y2k/CloudSky';
import './resume.css';

const PILL = 'y2k-gloss inline-flex items-center rounded-full font-pixel text-xl leading-none uppercase tracking-wide px-4 py-1.5';

/**
 * Print-ready résumé, styled like the original Overleaf/LaTeX version, and the
 * site's recruiter view. On screen the sheet floats on a drifting pink sky. It's also the source of the downloadable PDF: `npm run resume:pdf` prints this
 * page to public/assets/Sreeja-Resume.pdf. Content lives in app/data/resume.ts.
 */

export const metadata: Metadata = {
  title: 'Sreeja Das — Résumé',
  description: 'Résumé of Sreeja Das: full-stack developer, Co-Founder & CTO of The Diecast Store.',
};

/** **bold** support for the few emphasised phrases. */
function Text({ children }: { children: string }) {
  return (
    <>
      {children.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
        p.startsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : <React.Fragment key={i}>{p}</React.Fragment>,
      )}
    </>
  );
}

const L = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer">
    {children}
  </a>
);

/** Links are written out in full so they still work on a printed copy. */
const show = (url: string) => url.replace(/^(mailto:|https?:\/\/(www\.)?)/, '').replace(/\/$/, '');

const Row = ({ left, right }: { left: React.ReactNode; right: React.ReactNode }) => (
  <div className="rs-row">
    <span>{left}</span>
    <span className="rs-right">{right}</span>
  </div>
);

export default function ResumePage() {
  const r = RESUME;
  return (
    <div className="rs-screen">
      {/* screen only: none of this reaches the printed PDF */}
      <CloudSky />

      <div className="rs-toolbar">
        <Link href="/" className={`${PILL} y2k-gloss-silver`}>
          ← back to the site
        </Link>
        <a href={PROFILE.resumeUrl} download={PROFILE.resumeFileName} className={PILL} style={{ '--btn': '#ff2e93' } as React.CSSProperties}>
          download pdf ↓
        </a>
      </div>

      <div className="rs-sheet">
      <main className="rs-page">
        <header className="rs-head">
          <h1>{r.name.toUpperCase()}</h1>
          <p>
            {r.location} | <L href={r.links.email}>{show(r.links.email)}</L> | <L href={r.links.linkedin}>{show(r.links.linkedin)}</L> |{' '}
            <L href={r.links.github}>{show(r.links.github)}</L>
          </p>
        </header>

        <section>
          <h2>Education</h2>
          {r.education.map((ed) => (
            <div key={ed.school} className="rs-entry">
              <Row left={<strong>{ed.school}</strong>} right={<em>{ed.dates}</em>} />
              <Row
                left={
                  <>
                    {ed.degree} | <strong>CGPA: {ed.cgpa}</strong>
                  </>
                }
                right={<em>{ed.place}</em>}
              />
            </div>
          ))}
        </section>

        <section>
          <h2>Technical Skills</h2>
          <ul>
            {r.skills.map((s) => (
              <li key={s.group}>
                <strong>{s.group}:</strong> {s.items}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Experience</h2>
          {r.experience.map((e) => (
            <div key={e.org} className="rs-entry">
              <Row
                left={
                  <>
                    <strong>
                      {e.org}
                      {e.orgNote ? ` ${e.orgNote}` : ''}
                    </strong>
                    {e.link && (
                      <>
                        {' '}
                        | <L href={e.link}>{show(e.link)}</L>
                      </>
                    )}
                  </>
                }
                right={<em>{e.dates}</em>}
              />
              <Row left={<em>{e.role}</em>} right={<em>{e.place}</em>} />
              <ul>
                {e.points.map((p) => (
                  <li key={p}>
                    <Text>{p}</Text>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section>
          <h2>Projects</h2>
          {r.projects.map((p) => (
            <div key={p.name} className="rs-entry">
              <Row
                left={
                  <>
                    <strong>{p.name}</strong> | <L href={p.link}>{show(p.link)}</L>
                  </>
                }
                right={<em>{p.date}</em>}
              />
              <Row left={<em>{p.stack}</em>} right="" />
              <ul>
                {p.points.map((pt) => (
                  <li key={pt}>
                    <Text>{pt}</Text>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section>
          <h2>Achievements &amp; Certifications</h2>
          <ul>
            {r.achievements.map((a) => (
              <li key={a.title}>
                <strong>{a.title}</strong> {a.link && <L href={a.link}>View Credential</L>} {a.text}
              </li>
            ))}
          </ul>
        </section>

      </main>
      </div>

    </div>
  );
}
