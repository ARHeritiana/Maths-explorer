import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { liveCourses, liveCatalog, liveCompanionCatalog, liveDiscovery, isLiveHash } from '../site/js/live-curriculum.js';
import { resourceCatalog } from '../dist/js/resources-data.js';
import { discoveryIndex } from '../site/js/discovery.js';
import { labs, challenges } from '../site/js/content.js';

test('the live catalogues retain every French chapter without changing the archived data', () => {
  const catalog = JSON.parse(readFileSync(new URL('../dist/resources/catalog.json', import.meta.url)));
  const before = JSON.stringify(catalog), companionBefore = JSON.stringify(resourceCatalog);
  const live = liveCatalog(catalog), companion = liveCompanionCatalog(resourceCatalog);
  assert.deepEqual(liveCourses.map(c => c.id), ['seconde', 'premiere', 'terminale', 'expertes', 'stmg']);
  assert.equal(companion.chapters.length, 58);
  assert.equal(resourceCatalog.chapters.length, 87);
  assert.ok(catalog.courses.some(c => c.id === 't10'));
  assert.ok(live.resources.length > 0);
  for (const list of [live.chapters, live.resources, companion.chapters, companion.supplements]) {
    assert.ok(list.every(item => liveCourses.some(c => c.id === item.course)));
  }
  assert.equal(JSON.stringify(catalog), before);
  assert.equal(JSON.stringify(resourceCatalog), companionBefore);
});

test('old hidden routes cannot reopen a different curriculum or collection', () => {
  for (const route of ['#resources/t10', '#slides/t11s', '#chapter/t10-01', '#library/t11s-01', '#pack/t10', '#bank/t11s', '#university', '#olympiad', '#gallery/fourier', '#history', '#basics/fractions', '#topics', '#lab/ferris-wheel']) {
    assert.equal(isLiveHash(route), false, route);
  }
  for (const route of ['#home', '#resources', '#resources/expertes', '#chapter/seconde-01/cours', '#bank/seconde/seconde-01', '#slides/stmg', '#pack/premiere', '#sources', '#lab/quadratic/vertex', '#lab/monte-carlo-pi']) {
    assert.equal(isLiveHash(route), true, route);
  }
  assert.equal(isLiveHash('#bank/seconde/premiere-01'), false);
});

test('search results and reciprocal recommendations stay within the live scope', () => {
  const complete = discoveryIndex({ labs, challenges, chapters: resourceCatalog.chapters });
  const visible = liveDiscovery(complete), routes = new Set(visible.map(x => x.route));
  assert.ok(complete.some(x => x.route.startsWith('#university/')));
  assert.ok(visible.some(x => x.route === '#chapter/premiere-01'));
  for (const item of visible) {
    assert.ok(isLiveHash(item.route), item.route);
    assert.ok(item.related.every(route => routes.has(route)));
  }
});
