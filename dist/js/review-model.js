// "Réviser" (#review): objective-based spaced repetition. Pure model: no DOM, no storage, no clock of its own
// (every function takes the day number, or a Date, from its caller). An objective is one exercise generator of
// exercises/bank.js TEMPLATES, known here only by {id, cls, chapter}. Every function returns a new state.
//
// STATE     {cards: {<objective id>: card}, settings: {newPerDay}}
// CARD      ivl     interval in whole days before the next review (0 = again today)        0..MAX_IVL
//           ease    growth factor of the interval, in percent                               MIN_EASE..MAX_EASE
//           due     day number of the next review: added while never seen, then last + ivl
//           seen    number of reviews; correct: reviews graded difficile, bien or facile
//           reps    successful reviews in a row (0 after a raté)
//           lapses  number of ratés after at least one success
//           last    day of the latest review, first: day of the first one (both null while never seen)
//           added   day the objective was chosen; off: true when it was unticked after being reviewed (kept, not asked)
//
// DAYS      A day number is the local calendar day of a Date, counted from its own year, month and day
//           (Date.UTC(y, m, d) / 86400000): midnight changes it, daylight saving time and time zones do not.
//
// RULE      (SM-2 with four grades, integers only; d = max(today, last), so a clock set back never shortens anything)
//   raté (0)       ease - 20, reps = 0, ivl = 0 (asked again the same day), one more lapse if reps was > 0
//   difficile (1)  ease - 15, first success: ivl = 1, otherwise ivl = h = max(ivl + 1, round(ivl × 1,2))
//   bien (2)       ease kept, first success: ivl = 1, otherwise ivl = g = max(h + 1, round(ivl × ease / 100))
//   facile (3)     ease + 15, first success: ivl = 4, otherwise ivl = max(g + 1, round(ivl × ease × 1,3 / 100))
//   "first success" means reps = 0 before the grade; ease stays in [130, 300] and starts at 250; the ease used in a
//   product is the one after its change; round is to the nearest integer, halves up; ivl never exceeds 365.
//   Then seen + 1, correct + 1 unless raté, last = d, due = d + ivl. Nothing is random.
//   A card is "acquis" (mastered) from ivl >= 21, "en apprentissage" below.
//
// DAILY CAP Cards never seen are offered after the reviews, at most settings.newPerDay per day (default 10); the number
//           already started today is the number of cards whose `first` is today, so it survives a reload.
// SEEDS     seedFor: `${id}|${seen}|${day}` changes at every review, so the same objective comes with other numbers.

export const APP = 'mx-review', VERSION = 1;
export const GRADES = ['rate', 'difficile', 'bien', 'facile'];
export const MIN_EASE = 130, MAX_EASE = 300, START_EASE = 250, MAX_IVL = 365, MASTERED_IVL = 21;
export const NEW_PER_DAY = 10, MAX_NEW_PER_DAY = 50, MAX_DAY = 200000, MAX_COUNT = 1000000, MAX_BYTES = 1000000, MAX_CARDS = 5000;
const ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/, FORBIDDEN = new Set(['__proto__', 'constructor', 'prototype']);
const int = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const plain = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const round = (num, den) => Math.floor((2 * num + den) / (2 * den));   // nearest integer, halves up, integers only
export const validId = (id) => typeof id === 'string' && ID.test(id) && !FORBIDDEN.has(id);

// ---- days ----
export function dayNumber(date) {
  const d = date instanceof Date ? date : new Date(date);
  const n = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000;
  return Number.isInteger(n) ? n : 0;
}
// {y, m, d} of a day number (m from 1), and its ISO form YYYY-MM-DD.
export function dayParts(day) { const d = new Date(day * 86400000); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() }; }
export const dayISO = (day) => { const p = dayParts(day); return `${String(p.y).padStart(4, '0')}-${String(p.m).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`; };
// A Date at noon of that local day (noon: never moved to another day by a time change).
export const dayDate = (day) => { const p = dayParts(day); return new Date(p.y, p.m - 1, p.d, 12); };

// ---- state ----
export const emptyState = () => ({ cards: {}, settings: { newPerDay: NEW_PER_DAY } });
export const newCard = (today) => ({ ivl: 0, ease: START_EASE, due: today, seen: 0, correct: 0, reps: 0, lapses: 0, last: null, first: null, added: today });
export const cardOf = (state, id) => (validId(id) && own(state.cards, id) ? state.cards[id] : null);
const ids = (state) => Object.keys(state.cards).filter(validId);
const active = (state, known) => ids(state).filter((id) => !state.cards[id].off && (!known || known.has(id)));
export const isEnrolled = (state, id) => { const c = cardOf(state, id); return !!c && !c.off; };
const withCards = (state, cards) => ({ cards, settings: { ...state.settings } });

// A clean card or null. Strict: every field typed and bounded, and the fields must agree with each other.
export function cleanCard(x) {
  if (!plain(x)) return null;
  const { ivl, ease, due, seen, correct, reps, lapses, added } = x, last = x.last ?? null, first = x.first ?? null;
  if (!int(ivl, 0, MAX_IVL) || !int(ease, MIN_EASE, MAX_EASE) || !int(due, 0, MAX_DAY) || !int(seen, 0, MAX_COUNT) || !int(added, 0, MAX_DAY)) return null;
  if (!int(correct, 0, seen) || !int(reps, 0, correct) || !int(lapses, 0, seen - correct)) return null;
  if (own(x, 'off') && typeof x.off !== 'boolean') return null;
  if (seen === 0) { if (last !== null || first !== null || ivl !== 0 || due !== added || x.off) return null; }
  else if (!int(last, 0, MAX_DAY) || !int(first, 0, last) || due !== last + ivl) return null;
  return { ivl, ease, due, seen, correct, reps, lapses, last, first, added, ...(x.off ? { off: true } : {}) };
}
export const cleanSettings = (x) => ({ newPerDay: plain(x) && int(x.newPerDay, 0, MAX_NEW_PER_DAY) ? x.newPerDay : NEW_PER_DAY });
// Lenient reading of stored data: keeps every valid card, drops the others. Returns {state, dropped}. Never throws.
export function sanitize(raw) {
  const state = emptyState(); let dropped = 0;
  if (!plain(raw)) return { state, dropped: raw == null ? 0 : 1 };
  state.settings = cleanSettings(raw.settings);
  if (plain(raw.cards)) for (const id of Object.keys(raw.cards).slice(0, MAX_CARDS)) {
    const c = validId(id) ? cleanCard(raw.cards[id]) : null;
    if (c) state.cards[id] = c; else dropped++;
  }
  return { state, dropped };
}
export function setNewPerDay(state, n) { return int(n, 0, MAX_NEW_PER_DAY) ? { cards: { ...state.cards }, settings: { ...state.settings, newPerDay: n } } : state; }

// ---- choosing objectives ----
// objectives: [{id, cls, chapter}] (the generators). Chapters of a class, in order, with their objective ids.
export function chaptersOf(objectives, cls) {
  const map = new Map();
  for (const o of objectives) if (o.cls === cls && validId(o.id)) { if (!map.has(o.chapter)) map.set(o.chapter, []); map.get(o.chapter).push(o.id); }
  return [...map].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)).map(([chapter, list]) => ({ chapter, ids: list }));
}
export const chapterIds = (objectives, chapter) => objectives.filter((o) => o.chapter === chapter && validId(o.id)).map((o) => o.id);
// Adds a new card for each id not yet chosen; an objective unticked earlier comes back with its history.
export function enrol(state, list, today) {
  const cards = { ...state.cards };
  for (const id of list) {
    if (!validId(id)) continue;
    const c = cardOf(state, id);
    if (!c) cards[id] = newCard(today);
    else if (c.off) { const { off, ...rest } = c; cards[id] = rest; }
  }
  return withCards(state, cards);
}
// Removes a card never reviewed; a reviewed one is kept aside (off) so that ticking it again loses nothing.
export function unenrol(state, list) {
  const cards = { ...state.cards };
  for (const id of list) { const c = cardOf(state, id); if (!c) continue; if (c.seen === 0) delete cards[id]; else cards[id] = { ...c, off: true }; }
  return withCards(state, cards);
}
export const enrolChapter = (state, objectives, chapter, today) => enrol(state, chapterIds(objectives, chapter), today);
export const unenrolChapter = (state, objectives, chapter) => unenrol(state, chapterIds(objectives, chapter));

// ---- scheduling ----
// The card after a grade (0 raté, 1 difficile, 2 bien, 3 facile). See RULE at the top.
export function schedule(card, grade, today) {
  const d = Math.min(MAX_DAY - MAX_IVL, Math.max(today, card.last ?? today)), first = card.reps === 0, p = card.ivl;
  let ease = card.ease, ivl = 0;
  if (grade === 0) ease -= 20; else if (grade === 1) ease -= 15; else if (grade === 3) ease += 15;
  ease = Math.max(MIN_EASE, Math.min(MAX_EASE, ease));
  if (grade > 0) {
    const h = Math.max(p + 1, round(p * 120, 100)), g = Math.max(h + 1, round(p * ease, 100)), e = Math.max(g + 1, round(p * ease * 130, 10000));
    ivl = Math.min(MAX_IVL, first ? (grade === 3 ? 4 : 1) : grade === 1 ? h : grade === 2 ? g : e);
  }
  return {
    ivl, ease, due: d + ivl, seen: Math.min(MAX_COUNT, card.seen + 1), correct: card.correct + (grade > 0 && card.seen < MAX_COUNT ? 1 : 0),
    reps: grade > 0 ? Math.min(card.reps + 1, card.correct + 1) : 0, lapses: card.lapses + (grade === 0 && card.reps > 0 && card.seen < MAX_COUNT ? 1 : 0),
    last: d, first: card.first ?? d, added: card.added, ...(card.off ? { off: true } : {}),
  };
}
// A new state where the card `id` has been graded. An unknown id or grade returns the state unchanged.
export function grade(state, id, g, today) {
  const c = cardOf(state, id);
  if (!c || !int(g, 0, 3) || !int(today, 0, MAX_DAY)) return state;
  return withCards(state, { ...state.cards, [id]: schedule(c, g, today) });
}
// Interval in days each grade would give, for the labels of the buttons.
export const preview = (card, today) => [0, 1, 2, 3].map((g) => schedule(card, g, today).ivl);
export const startedToday = (state, today) => ids(state).filter((id) => state.cards[id].first === today).length;
export const newLeftToday = (state, today) => Math.max(0, state.settings.newPerDay - startedToday(state, today));

// Ids to ask today: reviews first (the most overdue first, then the lowest ease, then the id), then the cards never
// seen, in the order of `rank` (id -> number, the order of the bank), up to the daily cap. `known`: a Set limiting
// the answer to the objectives that still exist.
export function dueToday(state, today, { known = null, rank = null } = {}) {
  const all = active(state, known), C = state.cards, byId = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  const reviews = all.filter((id) => C[id].seen > 0 && C[id].due <= today).sort((a, b) => C[a].due - C[b].due || C[a].ease - C[b].ease || byId(a, b));
  const r = (id) => (rank ? rank(id) ?? Infinity : 0);
  const fresh = all.filter((id) => C[id].seen === 0).sort((a, b) => C[a].added - C[b].added || r(a) - r(b) || byId(a, b));
  return [...reviews, ...fresh.slice(0, newLeftToday(state, today))];
}
// Counts over the chosen cards (or over `only`, a list of ids). due + learning + mastered = total; `fresh` (never
// seen) is part of due. nextDue: the next day something will be asked after today, or null.
export function stats(state, today, { known = null, only = null } = {}) {
  let list = active(state, known);
  if (only) { const s = new Set(only); list = list.filter((id) => s.has(id)); }
  const out = { total: list.length, due: 0, fresh: 0, learning: 0, mastered: 0, nextDue: null };
  for (const id of list) {
    const c = state.cards[id];
    if (c.seen === 0) { out.fresh++; out.due++; }
    else if (c.due <= today) out.due++;
    else if (c.ivl >= MASTERED_IVL) out.mastered++;
    else out.learning++;
    const next = c.seen === 0 || c.due <= today ? today + 1 : c.due;
    if (out.nextDue === null || next < out.nextDue) out.nextDue = next;
  }
  return out;
}
// One line per chapter of a class: {chapter, objectives, enrolled, ...stats}.
export const chapterStats = (state, objectives, cls, today) => chaptersOf(objectives, cls).map(({ chapter, ids: list }) => ({ chapter, objectives: list.length, enrolled: list.filter((id) => isEnrolled(state, id)).length, ...stats(state, today, { only: list }) }));

// ---- questions ----
export const seedFor = (id, card, today) => `${id}|${card ? card.seen : 0}|${today}`;
// Level of the question: routine while the objective is new, standard once it holds a few days, demanding when acquired.
export const levelFor = (card) => (!card || card.ivl < 3 ? 1 : card.ivl < MASTERED_IVL ? 2 : 3);

// ---- export, import ----
export function exportReview(state, now) {   // now: a Date from the caller (the model has no clock); none gives an empty exportedAt
  const clean = sanitize(state).state;
  return { app: APP, version: VERSION, exportedAt: now instanceof Date && !Number.isNaN(now.getTime()) ? now.toISOString() : '', cards: clean.cards, settings: clean.settings };
}
const fail = (error, detail = '') => ({ ok: false, error, detail });
// json: the text of a file, or the parsed object. mode: 'replace' or 'merge' (merge keeps, card by card, the record
// reviewed last; on a tie the one seen most, then the current one; the current settings are kept).
// known: iterable of the objective ids that exist; a card of another id is dropped and counted.
// Returns {ok: true, state, imported, kept, dropped, total} or {ok: false, error, detail}; `current` is never altered.
// Errors: too-large, not-json, not-object, wrong-app, wrong-version, bad-cards, bad-card, bad-settings, bad-mode.
export function importReview(json, current, mode = 'merge', { known = null } = {}) {
  try {
    if (mode !== 'replace' && mode !== 'merge') return fail('bad-mode');
    let data = json;
    if (typeof json === 'string') {
      if (json.length > MAX_BYTES) return fail('too-large');
      try { data = JSON.parse(json); } catch { return fail('not-json'); }
    }
    if (!plain(data)) return fail('not-object');
    if (data.app !== APP) return fail('wrong-app');
    if (data.version !== VERSION) return fail('wrong-version', String(data.version).slice(0, 20));
    if (!plain(data.cards)) return fail('bad-cards');
    const keys = Object.keys(data.cards);
    if (keys.length > MAX_CARDS) return fail('too-large');
    if (own(data, 'settings') && (!plain(data.settings) || (own(data.settings, 'newPerDay') && !int(data.settings.newPerDay, 0, MAX_NEW_PER_DAY)))) return fail('bad-settings');
    const knownSet = known ? new Set(known) : null, incoming = {};
    let dropped = 0;
    for (const id of keys) {
      if (!validId(id) || (knownSet && !knownSet.has(id))) { dropped++; continue; }
      const c = cleanCard(data.cards[id]);
      if (!c) return fail('bad-card', id);
      incoming[id] = c;
    }
    const base = sanitize(current).state, total = Object.keys(incoming).length;
    if (mode === 'replace') return { ok: true, state: { cards: incoming, settings: cleanSettings(data.settings) }, imported: total, kept: 0, dropped, total };
    const cards = { ...base.cards }; let imported = 0, kept = 0;
    for (const id of Object.keys(incoming)) {
      const a = own(base.cards, id) ? base.cards[id] : null, b = incoming[id];
      const newer = !a || (b.last ?? -1) > (a.last ?? -1) || ((b.last ?? -1) === (a.last ?? -1) && b.seen > a.seen);
      if (newer) { cards[id] = b; imported++; } else kept++;
    }
    return { ok: true, state: { cards, settings: base.settings }, imported, kept, dropped, total };
  } catch { return fail('not-object'); }
}
