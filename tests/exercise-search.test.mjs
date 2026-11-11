// One search result per worked exercise (type `exercise`, id `exercise:<id>`), opening on that exercise of the bank chapter page
// (#bank/<course>/<chapter>/<exercise id>). Over the real live data of the current edition (no hard-coded counts), plus a small
// synthetic build for the rules of the pure index. Imports the dist copies (run `make site` first).
import test from 'node:test';
import assert from 'node:assert/strict';
import {searchResources, relatedTo, relatedForPage, publicItem, buildResourceIndex, typeLabel, fold} from '../dist/js/resource-index.js';
import {buildLiveResourceIndex} from '../dist/js/resource-sources.js';
import {bankPage, isBankRoute} from '../dist/js/bank-page.js';
import {exercisesOf, shownExercises, findExercise} from '../dist/js/exercises/bank-select.js';
import {liveCourses} from '../dist/js/live-curriculum.js';
import {resourceCatalog} from '../dist/js/resources-data.js';

const index = buildLiveResourceIndex({decks: null});
const items = index.filter(i => i.type === 'exercise');
const t = p => p[0];
// the chapters the bank page lists (it uses its own live catalogue; `premiere-revision` and the like are not on it)
const liveChapters = resourceCatalog.chapters.filter(c => liveCourses.some(k => k.id === c.course && (k.curriculum === 'fr' || k.curriculum === 'mg')));

test('every worked exercise the bank page shows has exactly one item, at a live address that shows it', () => {
  const shown = new Map();
  for (const ch of liveChapters) {
    const html = bankPage(t, ch.course, ch.id);
    for (const e of exercisesOf(ch.id)) {
      assert.ok(html.includes(`id="ex-${e.id}"`), `${ch.id} shows ${e.id}`);
      shown.set(e.id, (shown.get(e.id) || 0) + 1);
    }
  }
  assert.equal(items.length, shown.size, 'one item per distinct exercise shown');
  assert.equal(new Set(items.map(i => i.id)).size, items.length, 'ids unique');
  for (const it of items) {
    const id = it.id.replace(/^exercise:/, '');
    assert.ok(shown.has(id), `${it.id} is shown by the page`);
    const [page, course, chapter, ex, extra] = it.actions.open.href.slice(1).split('/');
    assert.equal(page, 'bank'); assert.equal(extra, undefined);
    assert.equal(ex, id);
    assert.ok(isBankRoute(course, chapter, ex), it.id + ' address is a valid bank route');
    assert.ok(bankPage(t, course, chapter).includes(`id="ex-${id}"`), it.id + ' is on its own chapter page');
    assert.deepEqual(it.classes, [course]);
    assert.equal(it.chapter, chapter);
  }
});
test('the shared selection rule: a seeded twin replaces its fixed exercise, one canonical chapter, own class first', () => {
  const all = shownExercises(liveChapters.map(c => c.id));
  for (const {exercise: e, chapters} of all) {
    assert.ok(chapters.length >= 1);
    const it = items.find(i => i.id === 'exercise:' + e.id), home = liveChapters.find(c => c.id === it.chapter);
    const own = chapters.map(c => liveChapters.find(x => x.id === c)).find(c => c.course === e.cls);
    assert.equal(it.chapter, (own || liveChapters.find(c => c.id === chapters[0])).id, e.id);
    assert.equal(home.course, it.classes[0]);
  }
  for (const ch of liveChapters) {
    const list = exercisesOf(ch.id);
    for (const e of list) if (!e.make) assert.ok(!list.some(x => x.make && x.title === e.title), 'no fixed exercise next to its seeded twin');
  }
  assert.ok(!isBankRoute('seconde', 'seconde-01', 'no-such-exercise'));
  assert.ok(!isBankRoute('seconde', '', 'g-sec-forfaits'));
  assert.ok(findExercise('g-sec-forfaits'));
});
test('items carry no competency metadata and only honest actions', () => {
  for (const it of items) {
    assert.deepEqual(Object.keys(it.actions), ['open'], it.id);
    assert.ok(!it.printable && !it.projectable && !it.manipulable);
    const e = findExercise(it.id.replace(/^exercise:/, ''));
    const shownText = [...it.title, ...it.summary, ...it.concepts, ...it.tags, ...it.synonyms].join(' | ');
    for (const hidden of [].concat(e.skills || [], e.prerequisites || [])) if (String(hidden).length > 3) assert.ok(!shownText.includes(hidden), `${it.id} leaks ${hidden}`);
    assert.equal(it.summary[0].split(' · ').length, 3, 'summary is chapter, level, minutes only');
    assert.ok(!/\\|\$|\\\(|\\\[/.test(it.summary.join('')), 'no raw TeX in the summary');
    assert.match(it.summary[0], / · .* min$/);
  }
  assert.deepEqual(typeLabel('exercise'), ['Exercice corrigé', 'Worked exercise']);
  assert.notDeepEqual(typeLabel('exercises'), typeLabel('exercise'));
  assert.equal(publicItem(items[0]).id, items[0].id);
});
test('title searches reach the exact exercise first in its group, with and without accents', () => {
  for (const [q, id] of [['forfait', 'g-sec-forfaits'], ['remises successives', 'g-sec-soldes'], ['Étude d’une fonction trigonométrique', null], ['etude d une fonction trigonometrique', null], ['tirages sans remise', null]]) {
    const hits = searchResources(index, {query: q}).filter(i => i.type === 'exercise');
    assert.ok(hits.length, q);
    const target = id ? 'exercise:' + id : hits[0].id;
    assert.equal(hits[0].id, target, q);
    assert.ok(fold(hits[0].title[0]).split(' ').some(w => fold(q).split(' ').some(v => w.startsWith(v.slice(0, 4)))), q);
  }
  assert.ok(searchResources(index, {query: 'Deux remises successives', type: 'exercise'})[0].id === 'exercise:g-sec-soldes');
});
test('a chapter-title query still ranks chapter-level items before individual exercises', () => {
  const chapters = index.filter(i => i.type === 'chapter').slice(0, 40);
  let checked = 0;
  for (const ch of chapters) {
    const hits = searchResources(index, {query: ch.title[0]});
    const firstExercise = hits.findIndex(i => i.type === 'exercise');
    const own = hits.findIndex(i => i.id === ch.id), perChapter = hits.findIndex(i => i.id === 'exercises:' + ch.chapter);
    if (firstExercise < 0 || own < 0) continue;
    checked++;
    assert.ok(own < firstExercise, `${ch.id} before individual exercises`);
    if (perChapter >= 0) assert.ok(perChapter < firstExercise || hits[firstExercise].titleFold.includes(fold(ch.title[0])), `${ch.id} per-chapter exercises first`);
  }
  assert.ok(checked > 3, 'enough chapters had both');
});
test('related lists never fill up with individual exercises', () => {
  for (const it of index.filter(i => i.type !== 'exercise')) {
    assert.ok(!relatedTo(index, it.id, {limit: 50}).some(x => x.type === 'exercise'), it.id);
    assert.ok(!it.related.some(x => x.startsWith('exercise:')), it.id);
  }
  for (const it of index.filter(i => i.type === 'chapter')) assert.ok(!relatedForPage(index, it.route).some(x => x.type === 'exercise'));
  for (const it of items.slice(0, 60)) {
    const list = relatedTo(index, it.id, {limit: 50});
    assert.ok(!list.some(x => x.type === 'exercise'), it.id);
    assert.equal(it.related[0], 'chapter:' + it.chapter, it.id);
    assert.ok(it.related.includes('exercises:' + it.chapter));
    assert.ok(it.related.every(x => index.some(i => i.id === x)));
    assert.ok(it.related.every(x => /^(chapter|exercises|slides|lab):/.test(x)), it.related.join());
  }
});
test('the pure index: synthetic sources, nothing unpublished, no flood by relation', () => {
  const classes = [{id: 'seconde', title: ['Seconde', 'Seconde']}];
  const chapters = [{id: 'c1', course: 'seconde', title: ['Probabilités', 'Probability'], topic: 'probability'}, {id: 'c2', course: 'gone', title: ['Autre', 'Other'], topic: ''}];
  const e = (id, title, ch) => ({id, title, cls: 'seconde', chapters: ch, level: ['Standard', 'Standard'], minutes: 8, domain: 'Probabilités'});
  const ix = buildResourceIndex({classes, chapters, exerciseChapters: {seconde: ['c1']}, exercises: [e('a', 'Tirages sans remise', ['c2', 'c1']), e('b', 'Un jeu', ['c2']), e('c', 'Une urne', ['c1'])], isLive: h => !h.startsWith('#bank/gone')});
  assert.deepEqual(ix.filter(i => i.type === 'exercise').map(i => i.id).sort(), ['exercise:a', 'exercise:c']);
  assert.equal(ix.find(i => i.id === 'exercise:a').actions.open.href, '#bank/seconde/c1/a');
  assert.deepEqual(searchResources(ix, {query: 'tirage sans remise'}).map(i => i.id), ['exercise:a']);
  assert.equal(searchResources(ix, {query: 'probabilites'})[0].type, 'exercises');
});
