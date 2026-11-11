// Détente (#relax) model. Pure: no DOM, no storage. Picks "pages of the day" and a random page from injectable pools.
// Nothing is written here: titles and teasers are taken from existing texts (first sentence of the summary or intro,
// trimmed to TEASER_MAX characters). Every pick resolves to a live hash (`live`, isLiveHash by default).
// Strings are [French, English] pairs. Pools (all optional, empty is fine):
//   biographies [{id,name,dek}], stories [{id,title,dek}], curiosities [{id,title,intro}],
//   olympiad [{id,title,theme,problems:[{title,q,hints}]}], experiments [{id,title,intro}].
import {isLiveHash} from './live-curriculum.js';

export const TEASER_MAX = 200;
export const KINDS = ['biography', 'story', 'curiosity', 'olympiad', 'experiment'];
export const KIND_INFO = {
 biography: {label: ['Biographie', 'Biography'], action: ['Lire', 'Read']},
 story: {label: ['Histoire', 'Story'], action: ['Lire', 'Read']},
 curiosity: {label: ['Curiosité', 'Curiosity'], action: ['Manipuler', 'Explore']},
 olympiad: {label: ['Problème d’olympiade', 'Olympiad problem'], action: ['Chercher', 'Solve']},
 experiment: {label: ['Expérience du laboratoire', 'Laboratory experiment'], action: ['Manipuler', 'Explore']},
};

const clean = s => String(s || '').replace(/\s+/g, ' ').trim();
// First sentence of a text, at most `max` characters (cut at a word, then an ellipsis). The words are never changed.
export function teaser(text, max = TEASER_MAX) {
 const s = clean(text);
 if (!s) return '';
 const m = s.match(/^.*?[.!?…](?=\s+[A-ZÉÈÀÂÎÔÙ“«"(\\]|$)/);
 const first = m ? m[0] : s;
 if (first.length <= max) return first;
 const cut = first.slice(0, max - 1), at = cut.lastIndexOf(' ');
 return (at > max / 2 ? cut.slice(0, at) : cut).replace(/[\s,;:]+$/, '') + '…';
}
const pairOf = (p, f) => Array.isArray(p) ? [f(p[0]), f(p[1] ?? p[0])] : [f(p), f(p)];
const teaserPair = (p, max) => pairOf(p, x => teaser(x, max));
const ok = p => Array.isArray(p) && p.every(x => clean(x));

const make = (kind, id, hash, title, text, extra = {}) => {
 const item = {kind, id, hash, kindLabel: KIND_INFO[kind].label, action: KIND_INFO[kind].action, title, teaser: teaserPair(text), ...extra};
 return ok(item.title) && ok(item.teaser) ? item : null;
};

// All candidate items of one kind, live only.
export function candidates(kind, pools = {}, live = isLiveHash) {
 const list = [];
 if (kind === 'biography') for (const b of pools.biographies || []) list.push(make(kind, b.id, '#biographies/' + b.id, [b.name, b.name], b.dek));
 if (kind === 'story') for (const s of pools.stories || []) list.push(make(kind, s.id, '#stories/' + s.id, s.title, s.dek));
 if (kind === 'curiosity') for (const c of pools.curiosities || []) list.push(make(kind, c.id, '#gallery/' + c.id, c.title, c.intro));
 if (kind === 'experiment') for (const e of pools.experiments || []) list.push(make(kind, e.id, '#lab/' + e.id, e.title, e.intro));
 if (kind === 'olympiad') for (const s of pools.olympiad || []) (s.problems || []).forEach((p, i) => {
  if (!p || !p.q) return;
  const hint = (p.hints || [])[0] || null;
  list.push(make(kind, s.id + '/' + i, '#olympiad/' + s.id, p.title || s.title,
   [s.theme && s.title ? 'Stratégie : ' + s.title[0] : '', s.theme && s.title ? 'Strategy: ' + s.title[1] : ''],
   {strategy: s.id, index: i, problem: {q: p.q, hint}}));
 });
 return list.filter(x => x && live(x.hash));
}

// FNV-1a 32 bits, a stable seeded hash.
export function hash32(str) {
 let h = 0x811c9dc5;
 for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
 return h >>> 0;
}
// Local calendar day, so the picks change at the teacher's midnight.
export const isoDay = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// One pick per kind for the day: same day, same picks. A kind with no live candidate is absent from the result.
export function pageOfTheDay(date, pools = {}, {live = isLiveHash} = {}) {
 const day = isoDay(date instanceof Date ? date : new Date(date)), out = [];
 for (const kind of KINDS) {
  const list = candidates(kind, pools, live);
  if (list.length) out.push(list[hash32(day + '|' + kind) % list.length]);
 }
 return out;
}

// One page drawn at random: a kind first (each non-empty kind equally likely), then an item. `rng` returns [0, 1).
export function randomPage(pools = {}, rng = Math.random, {live = isLiveHash} = {}) {
 const lists = KINDS.map(k => candidates(k, pools, live)).filter(l => l.length);
 if (!lists.length) return null;
 const idx = (n) => Math.min(n - 1, Math.floor(rng() * n));
 const list = lists[idx(lists.length)];
 return list[idx(list.length)];
}

// Collections of "Pour aller plus loin" ([hash, French, English]); the page keeps the live ones.
export const COLLECTIONS = [
 ['#biographies', 'Biographies', 'Biographies'], ['#stories', 'Histoires', 'Stories'], ['#gallery', 'Curiosités', 'Curiosities'],
 ['#olympiad', 'Olympiades', 'Olympiads'], ['#lab', 'Laboratoire', 'Laboratory'], ['#challenges', 'Défis', 'Challenges'],
 ['#history', 'Chronologies', 'Timelines'], ['#topics', 'Domaines', 'Topics'], ['#errors', 'Erreurs fréquentes', 'Common errors'],
];
export const liveCollections = (live = isLiveHash) => COLLECTIONS.filter(c => live(c[0]));

// Pools from the site data (content.js labs, reading-content.js, olympiad-content.js): plain mapping, no new text.
export const buildPools = ({BIOGRAPHIES = [], STORIES = [], labs = [], STRATEGIES = []} = {}) => ({
 biographies: BIOGRAPHIES, stories: STORIES,
 curiosities: labs.filter(l => l.custom && l.intro), experiments: labs.filter(l => !l.custom && l.intro),
 olympiad: STRATEGIES,
});
