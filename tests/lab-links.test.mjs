// Laboratory references (docs/LAB_DESIGN.md section 6): one reference, three places. Every reference of the manifest (chapter
// pages, library) and of the slide decks (`type: 'lab'` widgets, the WIDGETS table of scripts/build-slides.py, the authored
// decks) resolves to an experiment and a mission; every experiment is reachable from a chapter; the self-contained slide
// exports carry the laboratory code and it runs. Browser side (player mount, drag, chapter inline mount): tests/slides_lab_browser.py.
// Imports dist/js: run `make site` first.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { EXPERIMENTS, resolveRef, parseRef, allRefs } from '../dist/js/lab/registry.js';

const read = (p) => fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const manifest = JSON.parse(read('content/data/manifest.json'));
const chapters = manifest.catalog.chapters;
const decks = fs.readdirSync(new URL('../dist/slides/data/', import.meta.url)).filter((f) => f.endsWith('.json') && f !== 'index.json')
  .map((f) => JSON.parse(read('dist/slides/data/' + f)));

// The refs written in the WIDGETS table: lab('<ref>') (the source of the decks).
const tableRefs = [...read('scripts/build-slides.py').matchAll(/\blab\('([^']+)'\)/g)].map((m) => m[1]);
// Lab widgets of the built decks (the table placements and the authored slides).
const deckRefs = decks.flatMap((d) => d.slides.filter((s) => s.k === 'widget' && s.w?.type === 'lab').map((s) => ({ deck: d.id, ref: s.w.ref })));
const authoredRefs = fs.readdirSync(new URL('../content/slides/', import.meta.url)).filter((f) => f.endsWith('.json'))
  .flatMap((f) => JSON.parse(read('content/slides/' + f)).slides.filter((s) => s.k === 'widget' && s.w?.type === 'lab').map((s) => ({ deck: f, ref: s.w.ref })));

test('resolveRef: the one resolver of a lab reference', () => {
  const r = resolveRef('quadratic/vertex');
  assert.equal(r.experiment.id, 'quadratic'); assert.equal(r.mission.id, 'vertex'); assert.equal(r.index, 2); assert.equal(r.ref, 'quadratic/vertex'); assert.equal(r.explicit, true);
  const whole = resolveRef('statistics');
  assert.equal(whole.experiment.id, 'statistics'); assert.equal(whole.mission, whole.experiment.missions[0]); assert.equal(whole.index, 0); assert.equal(whole.explicit, false);
  for (const bad of ['', 'nope', 'quadratic/nope', 'quadratic/vertex/extra', '/vertex', null, undefined, 3]) assert.equal(resolveRef(bad), null, String(bad));
  assert.deepEqual(parseRef('trig/exact'), { id: 'trig', mission: 'exact' });
  for (const ref of allRefs()) assert.ok(resolveRef(ref), ref);
});

test('every lab reference of the manifest resolves, and a chapter names an experiment once', () => {
  let n = 0;
  for (const c of chapters) {
    assert.ok(Array.isArray(c.labs), c.id);
    for (const ref of c.labs) { n++; assert.ok(resolveRef(ref), `${c.id}: ${ref}`); }
    const ids = c.labs.map((r) => r.split('/')[0]);
    assert.equal(new Set(ids).size, ids.length, `${c.id} names an experiment twice: ${c.labs}`);
  }
  assert.ok(n > 60, `${n} references`);
});

test('every experiment is reachable from at least one chapter (none is lab-only)', () => {
  const reached = new Set(chapters.flatMap((c) => c.labs.map((r) => r.split('/')[0])));
  const labOnly = EXPERIMENTS.filter((e) => !reached.has(e.id)).map((e) => e.id);
  assert.deepEqual(labOnly, [], `lab-only experiments: ${labOnly}`);
});

test('every slide lab widget (WIDGETS table, built decks, authored decks) resolves', () => {
  assert.ok(tableRefs.length >= 17, `${tableRefs.length} placements in the table`);
  for (const ref of tableRefs) assert.ok(resolveRef(ref)?.explicit, `WIDGETS: ${ref} must name a mission`);
  assert.ok(deckRefs.length >= tableRefs.length, 'every placement of the table is in a built deck');
  for (const { deck, ref } of [...deckRefs, ...authoredRefs]) assert.ok(resolveRef(ref), `${deck}: ${ref}`);
  for (const ref of tableRefs) assert.ok(deckRefs.some((d) => d.ref === ref), `placement ${ref} is built`);
  // a chapter whose deck mounts an experiment names it in the manifest too (the chapter page mounts the first reference)
  for (const { deck, ref } of deckRefs) {
    const c = chapters.find((x) => x.id === deck);
    assert.ok(c.labs.some((r) => r.split('/')[0] === ref.split('/')[0]), `${deck}: ${ref} is not in the manifest labs`);
  }
});

test('the old widget types that an experiment replaced are gone from every deck', () => {
  const gone = new Set(['quad', 'seq', 'tangent', 'integral', 'stats', 'binom', 'circle', 'line', 'cobweb', 'matrix2', 'plane3d', 'line3d', 'lineplane']);
  for (const d of decks) for (const s of d.slides) if (s.k === 'widget') assert.ok(!gone.has(s.w.type), `${d.id}: ${s.w.type}`);
});

test('the self-contained export of a deck with a lab widget carries the laboratory code, and it runs', () => {
  const withLab = [...new Set(deckRefs.map((d) => d.deck))];
  assert.ok(withLab.length >= 8);
  const html = read(`dist/slides/export/${withLab[0]}.html`);
  assert.ok(html.includes('__d("lab/mount.js"') && html.includes('__d("lab/experiments/quadratic.js"') && html.includes('Promise.resolve(__r("lab/mount.js"))'));
  assert.ok(!/^\s*import\s/m.test(html.split('/* ---- laboratory ---- */')[1]), 'no import statement is left in the bundle');
  // the registry part of the bundle evaluates (experiments, models, formatter) without a DOM
  const script = html.slice(html.lastIndexOf('<script>\n(function(){') + 9);
  const registry = script.slice(script.indexOf('var __defs'), script.indexOf('/* ---- ../js/canvas-navigation.js'));
  const lab = script.slice(script.indexOf('/* ---- laboratory ---- */'), script.lastIndexOf('})();'));
  const sandbox = vm.runInNewContext(`(function(){ "use strict"; ${registry}; var canvasNavigation = function(){}; __d("canvas-navigation.js", function(e){ e.canvasNavigation = canvasNavigation; }); ${lab}; return { r: __r("lab/registry.js"), f: __r("lab/format.js") }; })()`, {});
  assert.equal(sandbox.r.EXPERIMENTS.length, EXPERIMENTS.length);
  assert.equal(sandbox.r.resolveRef('derivative/approach').index, 1);
  assert.equal(sandbox.f.makeFormat('fr').rel('x̄', 33 / 7), 'x̄ ≈ 4,71');
  // a deck without a lab widget does not carry it
  const plain = decks.find((d) => !withLab.includes(d.id));
  assert.ok(!read(`dist/slides/export/${plain.id}.html`).includes('__d("lab/mount.js"'));
});

test('the player import map reaches the laboratory modules (cache-busted like index.html)', () => {
  const html = read('dist/slides/player.html');
  for (const f of ['mount', 'shell', 'engine', 'format', 'registry', 'plot', 'templates/family', 'experiments/quadratic', 'models/num']) assert.match(html, new RegExp(`"\\.\\./js/lab/${f}\\.js": "\\.\\./js/lab/${f}\\.js\\?v=[0-9a-f]{10}"`), f);
  assert.match(html, /"\.\.\/js\/math\.js": "\.\.\/js\/math\.js\?v=/); assert.match(html, /"\.\.\/js\/object-kit\.js": /);
});
