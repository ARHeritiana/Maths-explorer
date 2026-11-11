// The real data behind the resource search: collects what the site publishes and hands it to the pure index builder.
// Only live routes survive (`isLiveHash`), so the limited edition never lists what it cannot open. Decks come from the
// slides index, which is fetched by the caller; without it no slide is claimed.
import {labs, challenges} from './content.js';
import {discoveryIndex} from './discovery.js';
import {resourceCatalog} from './resource-library.js';
import {liveDiscovery, isLiveHash, liveCourses, liveCompanionCatalog} from './live-curriculum.js';
import {resourceCatalog as completeCatalog} from './resources-data.js';
import {discoveryChapters} from './catalogue-data.js';
import {CLASSES, chaptersOf, templatesFor, DOMAINS} from './exercises/bank.js';
import {shownExercises, LEVEL} from './exercises/bank-select.js';
import {ANNALS} from './annals-bank.js';
import {assetHref} from './data-loader.js';
import {buildResourceIndex} from './resource-index.js';

export const deckHref = id => {const base = assetHref('./slides/player.html'); return base + (base.includes('?') ? '&' : '?') + 'deck=' + encodeURIComponent(id) + '&lang=fr';};
const SHORT = {seconde: 'Seconde', premiere: 'Première spécialité', terminale: 'Terminale spécialité', expertes: 'Maths expertes', stmg: 'Terminale STMG'};

export function collectSources({decks = null} = {}) {
  const liveIds = new Set(liveCourses.map(c => c.id));
  const classes = CLASSES.filter(c => liveIds.has(c.id)).map(c => ({id: c.id, title: [SHORT[c.id] || c.label, SHORT[c.id] || c.label]}));
  const chapters = discoveryChapters.map(c => ({id: c.id, course: c.course, title: c.title, topic: c.topic}));
  const live = new Set(chapters.filter(c => liveIds.has(c.course)).map(c => c.id));
  const exerciseChapters = {}, automatismes = {};
  for (const {id} of classes) {
    exerciseChapters[id] = chaptersOf(id).filter(c => live.has(c));
    for (const t of templatesFor(id)) if (live.has(t.chapter)) (automatismes[t.chapter] ||= new Set()).add(t.domain);
  }
  for (const k of Object.keys(automatismes)) automatismes[k] = [...automatismes[k]];
  // The very selection the bank page applies (bank-select.js), over the chapters the bank page lists (its own live catalogue).
  const bankCourses = new Set(liveCourses.filter(c => c.curriculum === 'fr' || c.curriculum === 'mg').map(c => c.id));
  const bankChapters = liveCompanionCatalog(completeCatalog).chapters.filter(c => bankCourses.has(c.course)).map(c => c.id);
  const exercises = shownExercises(bankChapters).map(({exercise: e, chapters: cs}) => ({id: e.id, title: e.title, cls: e.cls, chapters: cs, level: LEVEL[e.level] || LEVEL[2], minutes: e.minutes, domain: DOMAINS[e.domain] || e.domain}));
  const discovery = liveDiscovery(discoveryIndex({labs, challenges, chapters: resourceCatalog.chapters}));
  return {discovery, chapters, classes, decks, deckHref, exerciseChapters, exercises, automatismes, annals: ANNALS.filter(r => liveIds.has(r.cls)), isLive: isLiveHash};
}
export const buildLiveResourceIndex = options => buildResourceIndex(collectSources(options));
