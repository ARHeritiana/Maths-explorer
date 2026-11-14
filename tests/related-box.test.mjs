// related-box.js and the page-level helpers of resource-index.js (routeBase, itemForRoute, relatedTo options, relatedForPage)
// over the real live data. Imports the dist copies (run `make site` first).
import test from 'node:test';
import assert from 'node:assert/strict';
import {relatedTo, relatedForPage, itemForRoute, routeBase, primaryHref} from '../dist/js/resource-index.js';
import {buildLiveResourceIndex} from '../dist/js/resource-sources.js';
import {relatedBoxHtml} from '../dist/js/related-box.js';
import {isLiveHash,FULL_EDITION} from '../dist/js/live-curriculum.js';

const index = buildLiveResourceIndex({decks: null});
const pages = type => index.filter(i => i.type === type);
const t = p => p[0];

test('routeBase and itemForRoute: a page address finds its item, tabs and missions included', () => {
  assert.equal(routeBase('#lab/trig/abc'), '#lab/trig');
  assert.equal(itemForRoute(index, '#chapter/premiere-01/manipuler').id, 'chapter:premiere-01');
  assert.equal(itemForRoute(index, '#gallery/logistic-gallery').id, 'gallery:logistic-gallery');
  assert.equal(itemForRoute(index, '#lab/exponential/some-mission').id, 'lab:exponential');
  assert.equal(itemForRoute(index, 'lab/exponential').id, 'lab:exponential');
  for (const h of ['#search', '#slides/premiere', '#lab', '#chapter/nope', '#lab/nope', '#bank/premiere/premiere-04', '']) assert.equal(itemForRoute(index, h), null, h);
});
test('relatedTo keeps its default behaviour and honours the new options', () => {
  const id = 'chapter:premiere-01', base = relatedTo(index, id);
  assert.ok(base.length && base.length <= 6);
  assert.deepEqual(relatedTo(index, id, {}).map(x => x.id), base.map(x => x.id));
  assert.ok(base.some(x => x.chapter === 'premiere-01'), 'siblings by default (search page)');
  assert.ok(!relatedTo(index, id, {excludeSameChapter: true, limit: 50}).some(x => x.chapter === 'premiere-01'));
  assert.ok(!relatedTo(index, id, {excludeTypes: ['lab', 'gallery'], limit: 50}).some(x => ['lab', 'gallery'].includes(x.type)));
  assert.ok(relatedTo(index, id, {types: ['lab'], limit: 50}).every(x => x.type === 'lab'));
  const one = relatedTo(index, id, {limit: 50, perType: 1}), kinds = one.map(x => x.type);
  assert.equal(new Set(kinds).size, kinds.length, 'one of each type');
  const hidden = primaryHref(base.find(x => x.type === 'lab'));
  assert.ok(!relatedTo(index, id, {limit: 50, excludeHrefs: [hidden + '/x']}).some(x => primaryHref(x) === hidden), 'hrefs compare by page');
  assert.deepEqual(relatedTo(index, 'nope:none'), []);
});
test('relatedForPage: widening resources only, varied, capped, live, never itself', () => {
  for (const type of ['chapter', 'gallery', 'lab']) for (const it of pages(type)) {
    const list = relatedForPage(index, it.route);
    assert.ok(list.length <= 6, it.id);
    const counts = {};
    for (const x of list) {
      assert.notEqual(x.id, it.id);
      assert.ok(!['slides', 'exercises', 'automatismes', 'annales', 'tool'].includes(x.type), `${it.id} -> ${x.id}`);
      assert.ok(isLiveHash(primaryHref(x)), primaryHref(x));
      counts[x.type] = (counts[x.type] || 0) + 1;
      assert.ok(counts[x.type] <= 2, `${it.id}: variety`);
      if (type === 'chapter') assert.ok(x.chapter !== it.chapter || !it.chapter, `${it.id} -> own sibling ${x.id}`);
    }
    assert.equal(new Set(list.map(x => x.id)).size, list.length);
  }
});
test('chapter example: a sequences chapter reaches the population growth experiment and curiosity', () => {
  const ids = [...relatedForPage(index, '#chapter/premiere-01', {limit: 12}), ...relatedForPage(index, '#chapter/stmg-01', {limit: 12})].map(x => x.id);
  assert.ok(ids.some(id => /^lab:(sequences|cobweb|logistic|exponential)$/.test(id)), ids.join());
  const wide = relatedTo(index, 'chapter:premiere-01', {limit: 40, excludeSameChapter: true}).map(x => x.id);
  assert.ok(wide.includes('lab:sequences') || wide.includes('lab:exponential'), wide.join());
});
test('exhibit and experiment examples reach chapters, experiments and history', () => {
  const g = relatedForPage(index, '#gallery/logistic-gallery').map(x => x.id);
  assert.ok(g.some(id => id.startsWith('chapter:')) && g.some(id => id.startsWith('lab:')), g.join());
  const l = relatedForPage(index, '#lab/exponential/anything').map(x => x.id);
  assert.ok(l.includes('chapter:premiere-09') && l.some(id => id.startsWith('gallery:')), l.join());
  assert.ok(relatedForPage(index, '#gallery/fourier', {limit: 12}).some(x => x.type === 'history'));
});
test('addresses the page already shows are not repeated; nothing related gives an empty list and no markup', () => {
  const all = relatedForPage(index, '#lab/exponential'), shown = all.map(primaryHref);
  const left = relatedForPage(index, '#lab/exponential', {excludeHrefs: shown});
  assert.ok(!left.some(x => shown.includes(primaryHref(x))));
  const nothing = pages('gallery').find(g => g.id === 'gallery:reuleaux');
  assert.ok(nothing && relatedForPage(index, nothing.route).length === 0);
  assert.equal(relatedBoxHtml([], t), '');
  assert.deepEqual(relatedForPage(index, '#search'), []);
});
test('box markup: a labelled aside, one live link per item with its type', () => {
  const items = relatedForPage(index, '#lab/exponential');
  const html = relatedBoxHtml(items, t);
  assert.match(html, /<aside class="related-box" aria-labelledby="related-box-title"><h2 id="related-box-title">Ressources liées<\/h2>/);
  assert.equal((html.match(/<li>/g) || []).length, items.length);
  assert.ok(!/[–—]/.test(html));
});
test('coverage: every lab, and every class chapter except the revision ones, has something to show', () => {
  const empty = type => pages(type).filter(i => !relatedForPage(index, i.route).length).map(i => i.id);
  assert.deepEqual(empty('lab'), []);
  // Full edition: five T11 chapters have nothing related yet (known gap, 14 November 2026); the list may only shrink.
  const gaps = FULL_EDITION ? ['chapter:t11s-01', 'chapter:t11s-02', 'chapter:t11s-03', 'chapter:t11s-11', 'chapter:t11s-19'] : [];
  const missing = empty('chapter').filter(id => !/revision|unsorted|shared-/.test(id));
  assert.deepEqual(missing.filter(id => !gaps.includes(id)), []);
  assert.ok(pages('gallery').length - empty('gallery').length >= 20);
});
