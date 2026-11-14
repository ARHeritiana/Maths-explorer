import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { liveCourses, liveLibraryCourses, liveCatalog, liveCompanionCatalog, liveDiscovery, isLiveHash, FULL_EDITION } from '../site/js/live-curriculum.js';
import { courses } from '../site/js/catalogue-data.js';
import { resourceCatalog } from '../dist/js/resources-data.js';
import { discoveryIndex } from '../site/js/discovery.js';
import { labs, challenges } from '../site/js/content.js';

test('the live catalogues retain every French chapter without changing the archived data', () => {
  const catalog = JSON.parse(readFileSync(new URL('../dist/resources/catalog.json', import.meta.url)));
  const before = JSON.stringify(catalog), companionBefore = JSON.stringify(resourceCatalog);
  const live = liveCatalog(catalog), companion = liveCompanionCatalog(resourceCatalog);
  // Limited edition: the French curriculum only. Full edition: every course of the catalogue.
  if (FULL_EDITION) {
    assert.deepEqual(liveCourses.map(c => c.id), courses.map(c => c.id));
    assert.ok(['t10', 't11s'].every(id => liveCourses.some(c => c.id === id)));
    assert.equal(companion.chapters.length, 87);
  } else {
    assert.deepEqual(liveCourses.map(c => c.id), ['seconde', 'premiere', 'terminale', 'expertes', 'stmg']);
    assert.equal(companion.chapters.length, 58);
  }
  assert.equal(resourceCatalog.chapters.length, 87);
  assert.ok(catalog.courses.some(c => c.id === 't10'));
  assert.ok(live.resources.length > 0);
  for (const list of [live.chapters, live.resources, companion.chapters, companion.supplements]) {
    assert.ok(list.every(item => liveLibraryCourses.some(c => c.id === item.course)));
  }
  assert.equal(JSON.stringify(catalog), before);
  assert.equal(JSON.stringify(resourceCatalog), companionBefore);
});

test('old hidden routes cannot reopen a different curriculum', () => {
  // Other curricula: hidden in the limited edition, live in the full edition. Unknown courses: never live.
  for (const route of ['#pathways', '#resources/t10', '#slides/t11s', '#chapter/t10-01', '#library/t11s-01', '#pack/t10', '#bank/t11s', '#university', '#olympiad']) {
    assert.equal(isLiveHash(route), FULL_EDITION, route);
  }
  for (const route of ['#resources/zz', '#chapter/zz-01', '#bank/zz', '#slides/zz']) assert.equal(isLiveHash(route), false, route);
  for (const route of ['#home', '#resources', '#resources/expertes', '#chapter/seconde-01/cours', '#bank/seconde/seconde-01', '#slides/stmg', '#pack/premiere', '#sources', '#lab/quadratic/vertex', '#lab/monte-carlo-pi', '#gallery/fourier', '#history', '#basics/fractions', '#topics', '#lab/ferris-wheel', '#challenges/fly', '#biographies/galois', '#stories']) {
    assert.equal(isLiveHash(route), true, route);
  }
  assert.equal(isLiveHash('#bank/seconde/premiere-01'), false);
});

test('search results and reciprocal recommendations stay within the live scope', () => {
  const complete = discoveryIndex({ labs, challenges, chapters: resourceCatalog.chapters });
  const visible = liveDiscovery(complete), routes = new Set(visible.map(x => x.route));
  assert.ok(complete.some(x => x.route.startsWith('#university/')));
  assert.ok(visible.some(x => x.route === '#chapter/premiere-01'));
  assert.ok(visible.some(x => x.route === '#gallery/fourier'));
  assert.ok(visible.some(x => x.route.startsWith('#basics/')));
  assert.ok(visible.some(x => x.route.startsWith('#library/explore-')));
  for (const item of visible) {
    assert.ok(isLiveHash(item.route), item.route);
    assert.ok(item.related.every(route => routes.has(route)));
  }
});
