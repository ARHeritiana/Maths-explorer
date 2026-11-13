// The exercise bank: registry of templates and authored exercises, and the two composers used by the pages
// (buildStarter: short automatismes; buildSheet: worksheets, quizzes, supervised tests). Pure, seeded, no DOM.
import { courses } from '../catalogue-data.js';
import { rng, hashSeed } from './engine.js';
import { hasCompetency, mainCompetency } from './competencies.js';
import { seconde } from './templates-seconde.js';
import { seconde2 } from './templates-seconde-2.js';
import { seconde3 } from './templates-seconde-3.js';
import { premiere } from './templates-premiere.js';
import { premiere2 } from './templates-premiere-2.js';
import { premiere3 } from './templates-premiere-3.js';
import { premiere4 } from './templates-premiere-4.js';
import { terminale } from './templates-terminale.js';
import { terminale2 } from './templates-terminale-2.js';
import { terminale3 } from './templates-terminale-3.js';
import { terminale4 } from './templates-terminale-4.js';
import { terminale5 } from './templates-terminale-5.js';
import { expertes } from './templates-expertes.js';
import { stmg } from './templates-stmg.js';
import { authored } from './authored.js';
import { authoredExams } from './authored-exams.js';
import { problems } from './problems.js';
import { authoredSeconde } from './authored-seconde.js';
import { problemsSeconde } from './problems-seconde.js';
import { problemsSeconde2 } from './problems-seconde-2.js';
import { problemsPremiere } from './problems-premiere.js';
import { problemsTerminale } from './problems-terminale.js';
import { robust } from './premiere-kit.js';
import { tidy } from './terminale-kit.js';
import { seconde4 } from './templates-seconde-4.js';
import { seconde5 } from './templates-seconde-5.js';
import { seconde6 } from './templates-seconde-6.js';
import { seconde7 } from './templates-seconde-7.js';
import { seconde8 } from './templates-seconde-8.js';
import { expertes2 } from './templates-expertes-2.js';
import { expertes3 } from './templates-expertes-3.js';
import { expertes4 } from './templates-expertes-4.js';
import { expertes5 } from './templates-expertes-5.js';
import { stmg2 } from './templates-stmg-2.js';
import { stmg3 } from './templates-stmg-3.js';
import { stmg4 } from './templates-stmg-4.js';
import { problemsSeconde3 } from './problems-seconde-3.js';
import { problemsStmg } from './problems-stmg.js';
import { problemsExpertes } from './problems-expertes.js';
import { competences } from './templates-competences.js';

export const DOMAINS = {
  nombres: 'Nombres et calculs', algebre: 'Algèbre', fonctions: 'Fonctions', analyse: 'Analyse', suites: 'Suites', geometrie: 'Géométrie',
  'stats-proba': 'Statistiques et probabilités', complexes: 'Nombres complexes', arithmetique: 'Arithmétique', matrices: 'Matrices', graphes: 'Graphes',
};
export const LEVELS = [[1, 'Niveau 1 : routine'], [2, 'Niveau 2 : standard'], [3, 'Niveau 3 : exigeant']];
export const TEMPLATES = [...seconde, ...seconde2, ...seconde3, ...tidy(seconde4), ...tidy(seconde5), ...tidy(seconde6), ...tidy(seconde7), ...tidy(seconde8), ...premiere, ...robust(premiere2), ...robust(premiere3), ...robust(premiere4), ...terminale, ...tidy(terminale2), ...tidy(terminale3), ...tidy(terminale4), ...tidy(terminale5), ...expertes, ...tidy(expertes2), ...tidy(expertes3), ...tidy(expertes4), ...tidy(expertes5), ...stmg, ...tidy(stmg2), ...tidy(stmg3), ...tidy(stmg4), ...competences];
export const AUTHORED = [...authored, ...authoredExams, ...authoredSeconde, ...problems, ...problemsSeconde, ...problemsSeconde2, ...problemsSeconde3, ...problemsPremiere, ...problemsTerminale, ...problemsStmg, ...problemsExpertes];   // fixed exercises, then seeded problems (those have make(r))
// The classes offered by the generators: every course of the catalogue (content/data/manifest.json) that has at least one
// generator or worked exercise, in catalogue order, labelled by its catalogue title. Nothing is listed by hand: a new level
// appears as soon as its course is in the manifest and its exercises are registered above.
const usedClasses = new Set([...TEMPLATES.map((t) => t.cls), ...AUTHORED.map((e) => e.cls)]);
export const CLASSES = [
  ...courses.filter((c) => usedClasses.has(c.id)).map((c) => ({ id: c.id, label: c.title[0] })),
  ...[...usedClasses].filter((id) => !courses.some((c) => c.id === id)).map((id) => ({ id, label: id })),
];
export const MINUTES = { 1: 2, 2: 4, 3: 6 };           // estimated minutes of a generated part, by level

export const templatesFor = (cls) => TEMPLATES.filter((t) => t.cls === cls);
export const authoredFor = (cls) => AUTHORED.filter((e) => e.cls === cls);
export const chaptersOf = (cls) => [...new Set([...templatesFor(cls).map((t) => t.chapter), ...authoredFor(cls).flatMap((e) => e.chapters)])].sort();
export const domainsOf = (cls) => [...new Set([...templatesFor(cls).map((t) => t.domain), ...authoredFor(cls).map((e) => e.domain)])];
const supports = (t) => t.levels || [1, 2, 3];
const nearest = (t, level) => supports(t).reduce((best, l) => (Math.abs(l - level) < Math.abs(best - level) ? l : best), supports(t)[0]);

// One instance of a template: the same (template, level, seed) always gives the same statement and answer.
export function instance(t, level, seed) {
  const lv = nearest(t, level);
  const out = t.make(rng(`${seed}|${t.id}|${lv}`), lv);
  return { id: t.id, cls: t.cls, chapter: t.chapter, domain: t.domain, skill: t.skill, level: lv, competency: mainCompetency(t.id), q: out.q, a: out.a, s: out.s || '', ...(out.kind === 'qcm' ? { kind: 'qcm', stem: out.stem, choices: out.choices, short: out.short, correct: out.correct } : {}) };
}

const match = (item, o) => (!o.chapters?.length || o.chapters.includes(item.chapter)) && (!o.domains?.length || o.domains.includes(item.domain));
const allowedLevels = (o) => { const l = (o.levels?.length ? [...o.levels] : [1, 2, 3]).sort(); return l; };

// ---- automatismes ----
// Which main competencies the starter pool of a class can serve under the other filters (chapters, topics, short only):
// {competency: number of generators}. The page uses it to say that a ticked competency has nothing to offer.
export function starterCompetencies(o) {
  const pool = templatesFor(o.cls).filter((t) => match(t, o)), fast = pool.filter((t) => t.fast), n = {};
  for (const t of (o.fastOnly !== false && fast.length ? fast : pool)) { const c = mainCompetency(t.id); if (c) n[c] = (n[c] || 0) + 1; }
  return n;
}
export function buildStarter(o) {
  const count = Math.max(1, Math.min(40, o.count || 10)), seed = o.seed ?? 'starter';
  const levels = allowedLevels(o);
  // o.competencies (optional, main competencies of competencies.js): none given keeps the pool, the order and so the series
  // of a seed exactly as before. With a filter, `longOnly` tells the page that no short generator was left.
  let pool = templatesFor(o.cls).filter((t) => match(t, o) && hasCompetency(t.id, o.competencies));
  const fast = pool.filter((t) => t.fast);
  if (o.fastOnly !== false && fast.length) pool = fast;
  const base = { kind: 'starter', cls: o.cls, seed: String(seed), minutes: o.minutes || 5, levels, items: [] };
  if (o.competencies?.length) { base.competencies = [...o.competencies]; if (o.fastOnly !== false && pool.length && !fast.length) base.longOnly = true; }
  if (!pool.length) return { ...base, empty: true, secondsPerItem: 0 };
  const r = rng(`${seed}|starter|${o.cls}`);
  let order = r.shuffle(pool), cursor = 0;
  const seen = new Set();
  for (let i = 0; i < count; i++) {
    const target = o.order === 'mixed' ? r.pick(levels) : levels[Math.min(levels.length - 1, Math.floor((i * levels.length) / count))];
    let item = null;
    for (let attempt = 0; attempt < 12 && !item; attempt++) {
      if (cursor >= order.length) { order = r.shuffle(pool); cursor = 0; }
      const t = order[cursor++];
      const cand = instance(t, target, `${seed}|${i}|${attempt}`);
      // a four-choice question reads badly on a projected starter: skipped unless asked for (o.qcm), kept only as a last resort
      if (cand.kind === 'qcm' && !o.qcm && attempt < 11) continue;
      if (!seen.has(cand.q) || attempt === 11) item = cand;
    }
    seen.add(item.q);
    base.items.push({ n: i + 1, ...item });
  }
  base.secondsPerItem = Math.round((base.minutes * 60) / count);
  return base;
}

// ---- worksheets ----
const DEFAULTS = { sheet: { count: 5, parts: 3 }, interro: { count: 3, parts: 3 }, devoir: { count: 4, parts: 3 } };
export function buildSheet(o) {
  const kind = o.kind || 'sheet', seed = o.seed ?? 'sheet', def = DEFAULTS[kind] || DEFAULTS.sheet;
  const count = Math.max(1, Math.min(10, o.count || def.count)), parts = Math.max(1, Math.min(5, o.parts || def.parts));
  const levels = allowedLevels(o), r = rng(`${seed}|plan|${o.cls}`), title = o.chapterTitle || ((id) => id);
  const doc = { kind, cls: o.cls, seed: String(seed), levels, total: o.total || 20, exercises: [] };
  let chapters = (o.chapters?.length ? o.chapters : chaptersOf(o.cls)).filter((c) => templatesFor(o.cls).some((t) => t.chapter === c));
  if (!chapters.length) chapters = chaptersOf(o.cls).filter((c) => templatesFor(o.cls).some((t) => t.chapter === c));
  const pickAuthored = o.includeAuthored === false ? [] : r.shuffle(authoredFor(o.cls).filter((e) => (!o.chapters?.length || e.chapters.some((c) => o.chapters.includes(c))) && (!o.domains?.length || o.domains.includes(e.domain)) && (e.level >= levels[0] && e.level <= levels[levels.length - 1]) && (kind !== 'interro' || e.minutes <= 20)));
  const nAuth = Math.min(pickAuthored.length, Math.floor(count / 2));
  pickAuthored.slice(0, nAuth).forEach((e, j) => {
    const x = e.make ? e.make(rng(`${seed}|${e.id}|${j}`)) : e;   // a seeded problem draws its numbers here
    doc.exercises.push({ source: e.make ? 'problem' : 'authored', id: e.id, title: e.title, chapter: e.chapters[0], intro: x.intro, skills: [...(x.skills || e.skills || [])], minutes: e.minutes, parts: x.parts.map((p) => ({ q: p.q, a: p.a, s: '', level: e.level, w: p.w })) });
  });
  const chOrder = r.shuffle(chapters);
  let k = 0;
  while (doc.exercises.length < count && chOrder.length) {
    const chapter = chOrder[k % chOrder.length]; k++;
    let pool = templatesFor(o.cls).filter((t) => t.chapter === chapter && match(t, { domains: o.domains }));
    pool = r.shuffle(pool);
    if (pool.length && pool.length < parts) pool = Array.from({ length: parts }, (_, i) => pool[i % pool.length]);   // a short chapter repeats its templates at other levels, with other numbers
    pool = pool.slice(0, parts);
    if (!pool.length) { if (k > chOrder.length * 3) break; continue; }
    const items = pool.map((t, i) => instance(t, levels[Math.min(levels.length - 1, Math.floor((i * levels.length) / pool.length))], `${seed}|${doc.exercises.length}|${i}`)).sort((a, b) => a.level - b.level);
    doc.exercises.push({ source: 'generated', id: `${chapter}-${doc.exercises.length}`, title: title(chapter), chapter, intro: '', minutes: items.reduce((s, x) => s + MINUTES[x.level], 0), parts: items.map((x) => ({ q: x.q, a: x.a, s: x.s, level: x.level, w: x.level, id: x.id })) });
  }
  doc.exercises.forEach((e, i) => { e.n = i + 1; });
  doc.minutes = doc.exercises.reduce((s, e) => s + e.minutes, 0);
  scalePoints(doc);
  return doc;
}

// Marking scheme: weights are scaled to the total (default 20) in steps of 0.5, the largest remainders get the leftover halves.
export function scalePoints(doc) {
  const flat = doc.exercises.flatMap((e) => e.parts), W = flat.reduce((s, p) => s + p.w, 0) || 1, units = doc.total * 2;
  const raw = flat.map((p) => (p.w / W) * units), base = raw.map(Math.floor);
  let left = units - base.reduce((s, x) => s + x, 0);
  raw.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]).forEach(([, i]) => { if (left > 0) { base[i]++; left--; } });
  flat.forEach((p, i) => { p.pts = base[i] / 2; });
  doc.exercises.forEach((e) => { e.pts = e.parts.reduce((s, p) => s + p.pts, 0); });
  return doc;
}

export const describeLevels = (levels) => (levels.length === 3 ? 'niveaux 1 à 3' : levels.length === 1 ? `niveau ${levels[0]}` : `niveaux ${levels.join(' et ')}`);
export { hashSeed };
