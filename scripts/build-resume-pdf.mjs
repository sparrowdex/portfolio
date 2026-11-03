/**
 * Prints the /resume page to public/assets/Sreeja-Resume.pdf with headless Chrome/Edge.
 *
 *   1. npm run dev            (or: npm run build && npm start)
 *   2. npm run resume:pdf     (optional: npm run resume:pdf -- http://localhost:3001/resume)
 *
 * Edit the content in app/data/resume.ts, then re-run this to refresh the download.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const url = process.argv[2] ?? 'http://localhost:3000/resume';
const out = resolve('public/assets/Sreeja-Resume.pdf');

const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const browser = candidates.find((p) => existsSync(p));
if (!browser) {
  console.error('Could not find Chrome or Edge. Set CHROME_PATH to its executable.');
  process.exit(1);
}

try {
  const res = await fetch(url);
  if (!res.ok) throw new Error(String(res.status));
} catch {
  console.error(`Can't reach ${url}. Start the site first (npm run dev).`);
  process.exit(1);
}

execFileSync(
  browser,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    `--user-data-dir=${mkdtempSync(join(tmpdir(), 'resume-pdf-'))}`,
    '--virtual-time-budget=4000',
    `--print-to-pdf=${out}`,
    url,
  ],
  { stdio: 'ignore' },
);

const pdf = readFileSync(out);
const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
console.log(`Wrote ${out} (${Math.round(pdf.length / 1024)} KB, ${pages} page${pages === 1 ? '' : 's'})`);
if (pages > 1) console.warn('⚠ The résumé spills onto a second page; trim app/data/resume.ts or tighten app/resume/resume.css.');
