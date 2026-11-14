// resource-index.js and resource-sources.js: the one search index (stable ids, honest actions, folding, synonyms, ranking,
// filters, shared relation registry) over the real live data. Imports the dist copies (run `make site` first).
import test from 'node:test';
import assert from 'node:assert/strict';
import {buildResourceIndex, searchResources, relatedTo, actionsOf, fold, tokens, RELATIONS, relationsForQuery, TYPE_IDS, primaryHref, publicItem} from '../dist/js/resource-index.js';
import {buildLiveResourceIndex, deckHref} from '../dist/js/resource-sources.js';
import {isLiveHash, FULL_EDITION} from '../dist/js/live-curriculum.js';

const decks = [{id: 'premiere-01', course: 'premiere', editions: {fr: {}}}, {id: 'premiere-02', course: 'premiere', editions: {}}, {id: 't10-01', course: 't10', editions: {fr: {}}}];
const index = buildLiveResourceIndex({decks});
const ids = index.map(i => i.id);

test('folding: accents, case, ligatures, apostrophes, plurals', () => {
  assert.equal(fold('Dérivée'), 'derivee');
  assert.equal(fold('  Œuvre d’Euler '), 'oeuvre d euler');
  assert.deepEqual(tokens('Suites numériques'), ['suite', 'numerique']);
});
test('stable, unique ids and a complete public shape', () => {
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(ids, buildLiveResourceIndex({decks}).map(i => i.id), 'rebuild gives the same ids in the same order');
  for (const i of index) {
    assert.match(i.id, /^[a-z]+:[^\s]+$/); assert.ok(TYPE_IDS.includes(i.type), i.type);
    const p = publicItem(i);
    for (const k of ['id', 'type', 'title', 'class', 'topics', 'concepts', 'synonyms', 'projectable', 'printable', 'hrefs']) assert.ok(k in p, k);
    assert.ok(i.title[0] && i.title[1]);
  }
  for (const id of ['chapter:premiere-01', 'lab:logistic', 'gallery:logistic-gallery', 'slides:premiere-01', 'exercises:premiere-04', 'automatismes:premiere-01', 'tool:sheets']) assert.ok(ids.includes(id), id);
  assert.ok(index.some(i => i.type === 'misconception') && index.some(i => i.type === 'history') && index.some(i => i.type === 'challenge') && index.some(i => i.type === 'annales'));
});
test('every action is a real, live address; nothing for other curricula', () => {
  for (const i of index) {
    assert.ok(actionsOf(i).length, i.id);
    for (const a of actionsOf(i)) assert.ok(a.href.startsWith('#') ? isLiveHash(a.href) : /player\.html/.test(a.href), `${i.id} ${a.key} ${a.href}`);
  }
  if (!FULL_EDITION) {
    assert.ok(!ids.some(id => /^(chapter|slides|exercises|automatismes):(t10|t11s|int|ib)/.test(id)));
    assert.ok(!ids.includes('slides:t10-01'), 'a deck of a hidden course is not indexed');
  } else assert.ok(ids.includes('chapter:t10-01') && ids.includes('chapter:t11s-01'), 'the full edition indexes the Malagasy curriculum');
  if (!FULL_EDITION) assert.ok(!index.some(i => Object.values(i.actions).some(a => /^#(olympiad|pathways|university)/.test(a.href))));
});
test('slides only when the deck index lists a French edition; none without the index', () => {
  assert.ok(ids.includes('slides:premiere-01') && !ids.includes('slides:premiere-02'));
  assert.equal(actionsOf(index.find(i => i.id === 'slides:premiere-01')).find(a => a.key === 'project').href, deckHref('premiere-01'));
  assert.ok(!buildLiveResourceIndex({decks: null}).some(i => i.type === 'slides'));
});
test('flags follow the real actions', () => {
  const by = id => index.find(i => i.id === id);
  assert.deepEqual([by('slides:premiere-01').projectable, by('slides:premiere-01').printable], [true, false]);
  assert.deepEqual([by('automatismes:premiere-01').projectable, by('automatismes:premiere-01').printable], [true, true]);
  assert.ok(by('exercises:premiere-04').printable && !by('exercises:premiere-04').projectable);
  assert.ok(by('lab:logistic').manipulable && !by('lab:logistic').projectable);
  assert.deepEqual(actionsOf(by('lab:logistic')).map(a => a.key), ['manipulate'], 'no duplicate Ouvrir beside Manipuler');
  assert.deepEqual(actionsOf(by('chapter:premiere-01')).map(a => a.key), ['open']);
  assert.deepEqual(actionsOf(by('automatismes:premiere-01')).map(a => a.key), ['open', 'project', 'print']);
});
test('accent, case and plural folding find the same things', () => {
  const a = searchResources(index, {query: 'dérivée'}).map(i => i.id), b = searchResources(index, {query: 'DERIVEE'}).map(i => i.id), c = searchResources(index, {query: 'dérivées'}).map(i => i.id);
  assert.ok(a.length > 3); assert.deepEqual(a, b); assert.deepEqual(a, c);
  assert.ok(a.includes('chapter:premiere-04'));
});
test('French and English, with synonyms', () => {
  const fr = searchResources(index, {query: 'suites'}).map(i => i.id), en = searchResources(index, {query: 'sequence'}).map(i => i.id);
  assert.ok(fr.includes('chapter:premiere-01') && en.includes('chapter:premiere-01') && en.includes('lab:sequences'));
  assert.ok(searchResources(index, {query: 'probability'}).some(i => i.id === 'chapter:premiere-05'));
  assert.ok(searchResources(index, {query: 'slides'}).some(i => i.id === 'slides:premiere-01'), 'type words are synonyms');
  assert.ok(searchResources(index, {query: 'interro'}).some(i => i.id === 'tool:sheets'));
});
test('ranking: title matches first, exact before prefix, stable order', () => {
  const r = searchResources(index, {query: 'second degré'}).map(i => i.id);
  assert.ok(r.slice(0, 6).some(id => id.startsWith('chapter:')), r.slice(0, 6).join());
  const one = searchResources(index, {query: 'logistique'}).map(i => i.id);
  assert.ok(one.slice(0, 4).some(id => /logistic/.test(id)), one.slice(0, 4).join());
  assert.deepEqual(searchResources(index, {query: 'suites'}), searchResources(index, {query: 'suites'}));
  assert.equal(searchResources(index, {query: 'suites', limit: 3}).length, 3);
});
test('filters: class, topic, type, projection, print', () => {
  assert.ok(searchResources(index, {query: 'suites', cls: 'premiere'}).every(i => !i.classes.length || i.classes.includes('premiere')));
  const proj = searchResources(index, {projectable: true});
  assert.ok(proj.length && proj.every(i => i.projectable));
  assert.ok(searchResources(index, {printable: true}).every(i => i.printable));
  assert.ok(searchResources(index, {type: 'lab', query: 'suites'}).every(i => i.type === 'lab'));
  assert.ok(searchResources(index, {topic: 'probability'}).length > 5);
  assert.ok(searchResources(index, {topic: 'rel.population-growth'}).some(i => i.id === 'lab:logistic'));
  assert.equal(searchResources(index, {query: 'suites', type: 'tool'}).length, 0);
  assert.equal(searchResources(index, {query: 'azertyqwx'}).length, 0, 'honest empty result');
});
test('the shared relation registry: stable ids, cross-resource results for a topic', () => {
  assert.equal(new Set(RELATIONS.map(r => r.id)).size, RELATIONS.length);
  for (const r of RELATIONS) assert.match(r.id, /^rel\.[a-z-]+$/);
  assert.deepEqual(relationsForQuery('croissance démographique'), ['rel.population-growth']);
  const hits = searchResources(index, {query: 'croissance démographique'});
  const types = new Set(hits.map(i => i.type));
  assert.ok(types.has('chapter') && types.has('lab') && types.has('gallery'), [...types].join());
  assert.ok(hits.some(i => i.id === 'chapter:premiere-09') && hits.some(i => i.id === 'chapter:premiere-01') && hits.some(i => i.id === 'lab:logistic'));
  assert.ok(hits.every(i => i.relations.includes('rel.population-growth') || /croissance|demograph/.test(i.titleFold)));
});
test('related resources: siblings of a chapter, linked labs, no self, only existing items', () => {
  const rel = relatedTo(index, 'chapter:premiere-01').map(i => i.id);
  assert.ok(rel.includes('slides:premiere-01') && rel.includes('exercises:premiere-01') && rel.includes('lab:sequences'), rel.join());
  assert.ok(!rel.includes('chapter:premiere-01'));
  assert.deepEqual(relatedTo(index, 'nope:none'), []);
});
test('absent resources are not invented (synthetic data)', () => {
  const small = buildResourceIndex({chapters: [{id: 'premiere-01', course: 'premiere', title: ['Suites', 'Sequences'], topic: 'sequences'}], classes: [{id: 'premiere', title: ['Première', 'Premiere']}],
    exerciseChapters: {premiere: ['premiere-01']}, automatismes: {}, annals: [], decks: [], isLive: h => !h.startsWith('#bank')});
  assert.ok(!small.some(i => i.type === 'exercises'), 'a not-live bank route is dropped');
  assert.ok(!small.some(i => i.type === 'slides' || i.type === 'automatismes'));
  assert.deepEqual(small.map(i => i.id), ['tool:sheets']);
  assert.equal(primaryHref(small[0]), '#sheets');
});
