/**
 * Local Q&A engine for the phone assistant: no API calls, no cost.
 *
 * The knowledge base (app/data/assistantKnowledge.json) holds ~15 standard
 * questions per project (stack, challenge, role, impact…) plus a few general
 * ones. Answering = (1) work out WHICH project, (2) work out WHICH question
 * type, (3) pick the best entry. The last project discussed is remembered so
 * follow-ups like "what was the hardest part?" work.
 */

import KB from '../data/assistantKnowledge.json';
import { PROFILE } from '../data/profile';
import { PROJECTS_DATA } from '../data/projects';

type Entry = { projectId: string; question: string; tags: string[]; answer: string };
const ENTRIES = KB as Entry[];

export type ProjectKey = 'photobooth' | 'innervoice' | 'diecast' | 'armatrix' | 'flowers' | 'spicevault' | 'timeless';

const PROJECT_ALIASES: Record<ProjectKey, string[]> = {
  photobooth: ['photobooth', 'photo booth', 'photo strip', 'camera app', 'pink photobooth'],
  innervoice: ['inner voice', 'innervoice', 'mental health', 'wellness', 'journaling', 'trusted friends'],
  diecast: ['diecast', 'die cast', 'diecast store', 'the diecast store', 'scale model', 'f1 store', 'ecommerce', 'e commerce', 'cto', 'co founder', 'cofounder'],
  armatrix: ['armatrix', 'team page', 'robotic arm', 'robot arm'],
  flowers: ['flowers', 'flower', 'beloved', 'bouquet', 'botanical', 'garden'],
  spicevault: ['spicevault', 'spice vault', 'spice', 'recipe', 'recipes', 'culinary', 'food app'],
  timeless: ['timeless', 'snow globe', 'snowglobe', 'christmas', 'hackathon', 'ghosts of christmas', 'winter'],
};

const PROJECT_ID_BY_KEY: Record<ProjectKey, number> = {
  photobooth: 1, innervoice: 2, diecast: 3, armatrix: 4, flowers: 5, spicevault: 6, timeless: 7,
};

export const PROJECT_NAMES: Record<ProjectKey, string> = {
  photobooth: 'Photobooth', innervoice: 'Inner Voice', diecast: 'The Diecast Store', armatrix: 'Armatrix',
  flowers: 'Flowers for Beloved', spicevault: 'SpiceVault', timeless: 'Timeless',
};

const STOP = new Set(
  'a an the is are was were be been of to in on for and or with about me tell what whats which how did do does you your her she sreeja sreejas it its this that can could would please i my we us any so from at as by'.split(' '),
);

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // résumé → resume
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const stem = (w: string) => w.replace(/(ing|ed|es|s)$/, '') || w;

function editDistanceAtMost1(a: string, b: string) {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else { i++; j++; }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

/** Phrase present in text, allowing one typo per word for words of 5+ letters. */
function containsPhrase(textWords: string[], phrase: string) {
  const p = phrase.split(' ');
  for (let i = 0; i + p.length <= textWords.length; i++) {
    let ok = true;
    for (let k = 0; k < p.length && ok; k++) {
      const t = textWords[i + k];
      const w = p[k];
      ok = t === w || stem(t) === stem(w) || (w.length >= 5 && editDistanceAtMost1(t, w));
    }
    if (ok) return true;
  }
  return false;
}

export function detectProject(text: string): ProjectKey | null {
  const words = normalize(text).split(' ');
  let best: ProjectKey | null = null;
  let bestLen = 0;
  for (const [key, aliases] of Object.entries(PROJECT_ALIASES) as [ProjectKey, string[]][]) {
    for (const a of aliases) {
      if (containsPhrase(words, a) && a.length > bestLen) {
        best = key;
        bestLen = a.length;
      }
    }
  }
  return best;
}

// Words that only name a project. The project is already used as a filter,
// so these must not score, or every entry tagged "photobooth" ties.
const ALIAS_WORDS = new Set(
  Object.values(PROJECT_ALIASES)
    .flat()
    .flatMap((a) => a.split(' '))
    .filter((w) => !STOP.has(w))
    .map(stem),
);

function scoreEntry(entry: Entry, words: string[], content: Set<string>) {
  let score = 0;
  for (const tag of entry.tags) {
    const t = normalize(tag)
      .split(' ')
      .filter((w) => !ALIAS_WORDS.has(stem(w)))
      .join(' ');
    if (!t || t.split(' ').every((w) => STOP.has(w))) continue;
    if (containsPhrase(words, t)) score += 2 + t.split(' ').length * 2;
  }
  const qWords = new Set(normalize(entry.question).split(' ').filter((w) => !STOP.has(w)).map(stem).filter((w) => !ALIAS_WORDS.has(w)));
  for (const w of content) if (qWords.has(w)) score += 1.5;
  return score;
}

export interface Reply {
  text: string;
  /** Project the conversation is now about (for follow-ups). */
  context: ProjectKey | null;
  /** Suggested follow-up questions to show as chips. */
  suggestions: string[];
  /** Project to open in the player, if relevant. */
  projectId?: number;
}

const FOLLOW_UPS = ['What was the hardest part?', 'What tech stack?', 'What was your role?', 'Live link?'];

const GENERAL_SUGGESTIONS = ['Show me all projects', 'What are her skills?', 'Tell me about The Diecast Store', 'How do I contact her?'];

export function answer(query: string, context: ProjectKey | null): Reply {
  const norm = normalize(query);
  const words = norm.split(' ').filter(Boolean);
  const content = new Set(words.filter((w) => !STOP.has(w)).map(stem));

  if (!words.length) return { text: 'Type a question or press 1–4 ✦', context, suggestions: GENERAL_SUGGESTIONS };

  // ── Direct intents the KB doesn't cover well ──
  if (/\b(resume|cv)\b/.test(norm)) {
    return {
      text: `Here's her résumé (PDF): ${PROFILE.resumeUrl}\nOr flip the site to **recruiter mode** in the top bar for a one-page summary.`,
      context,
      suggestions: ['What is her experience?', 'What are her skills?', 'How do I contact her?'],
    };
  }
  if (/\b(contact|email|mail|hire|reach|linkedin|message|available|availability)\b/.test(norm)) {
    return {
      text: `📧 ${PROFILE.email}\n💼 LinkedIn: ${PROFILE.links.linkedin}\n💾 GitHub: ${PROFILE.links.github}\nShe's always up for cool collabs ✦`,
      context,
      suggestions: ['Download résumé', 'What are her skills?', 'Show me all projects'],
    };
  }

  const detected = detectProject(query);
  // A bare "github"/"link" etc. with no project → use context project if we have one.
  const project = detected ?? context;

  // ── Score candidates ──
  let best: Entry | null = null;
  let bestScore = 0;
  for (const e of ENTRIES) {
    if (e.question.includes('(Internal)')) continue;
    if (e.projectId !== 'general' && project && e.projectId !== project) continue;
    if (e.projectId !== 'general' && !project) continue;
    let s = scoreEntry(e, words, content);
    if (e.projectId !== 'general' && detected) s += 1; // explicit mention
    if (s > bestScore) {
      best = e;
      bestScore = s;
    }
  }

  // Project named but no specific question → give its summary.
  if (detected && (!best || best.projectId === 'general' || bestScore < 3)) {
    const summary =
      ENTRIES.find((e) => e.projectId === detected && /summary/i.test(e.question)) ??
      ENTRIES.find((e) => e.projectId === detected && /pitch/i.test(e.question));
    if (summary) {
      return {
        text: summary.answer,
        context: detected,
        suggestions: FOLLOW_UPS,
        projectId: PROJECT_ID_BY_KEY[detected],
      };
    }
  }

  if (best && bestScore >= 2) {
    const ctx = best.projectId === 'general' ? context : (best.projectId as ProjectKey);
    return {
      text: best.answer,
      context: ctx,
      suggestions: best.projectId === 'general' ? GENERAL_SUGGESTIONS : FOLLOW_UPS,
      projectId: ctx && best.projectId !== 'general' ? PROJECT_ID_BY_KEY[ctx] : undefined,
    };
  }

  // Project-type question with no project in sight → ask which one.
  const vague = ENTRIES.find((e) => e.question.includes('(Internal)'));
  if (vague && ENTRIES.filter((e) => e.question.includes('(Internal)')).some((e) => scoreEntry(e, words, content) >= 3)) {
    return {
      text: 'Which project? 🤔 She has 7 — ' + PROJECTS_DATA.map((p) => p.title.split(':')[0]).join(', ') + '.',
      context,
      suggestions: ['Diecast Store tech stack', 'Photobooth challenges', 'Timeless hackathon'],
    };
  }

  return {
    text: "Hmm, no signal for that one 📵 Try asking about a project (e.g. 'Armatrix challenges'), her skills, experience, or how to contact her.",
    context,
    suggestions: GENERAL_SUGGESTIONS,
  };
}
