// The real data behind the resource search: collects what the site publishes and hands it to the pure index builder.
// Only live routes survive (`isLiveHash`), so the limited edition never lists what it cannot open. Decks come from the
// slides index, which is fetched by the caller; without it no slide is claimed.
import {labs, challenges} from './content.js';
import {discoveryIndex} from './discovery.js';
import {resourceCatalog} from './resource-library.js';
import {liveDiscovery, isLiveHash, liveCourses} from './live-curriculum.js';
import {discoveryChapters} from './catalogue-data.js';
import {CLASSES, chaptersOf, templatesFor} from './exercises/bank.js';
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
  const discovery = liveDiscovery(discoveryIndex({labs, challenges, chapters: resourceCatalog.chapters}));
  return {discovery, chapters, classes, decks, deckHref, exerciseChapters, automatismes, annals: ANNALS.filter(r => liveIds.has(r.cls)), isLive: isLiveHash};
}
export const buildLiveResourceIndex = options => buildResourceIndex(collectSources(options));
