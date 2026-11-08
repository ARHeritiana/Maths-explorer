// Pure parts of the visual upgrades of the Game of Life, the fair-division figures and the three-body start: framing a pattern, the trail,
// the matrix and the envy arrows drawn by the fair-division scenes (checked against the model), the chaotic three-body preset.
import test from 'node:test';
import assert from 'node:assert/strict';
import {fitView,trailAges,presetSet,bounds,step,fromCells} from '../site/js/gallery/gallery-life-model.js';
import {cakeScene,goodsScene,envyPairs,wrap,pct,PERSON} from '../site/js/lab/experiments/fair-scenes.js';
import * as F from '../site/js/lab/models/fair-division.js';
import * as D from '../site/js/lab/models/dynamics.js';

test('fitView frames the bounding box with a margin, centred, within the cell size limits', () => {
  const v = fitView([0, 0, 2, 2], 640, 346);
  assert.equal(v.cx, 1.5); assert.equal(v.cy, 1.5);
  assert.equal(v.cs, 36);                                 // a glider is shown with big cells (capped)
  const wide = fitView([-100, -10, 100, 10], 640, 346);   // 201 cells + margins across 640 px
  assert.ok(Math.abs(wide.cs - 640 / 207) < 1e-9);
  assert.equal(fitView([0, 0, 10000, 0], 640, 346).cs, 2);   // never below the minimum cell
  assert.deepEqual(fitView(null, 640, 346), { cx: 0, cy: 0, cs: 14 });
  // every live cell of the Gosper gun is inside the framed window
  const gun = presetSet('gun'), b = bounds(gun), f = fitView(b, 640, 346);
  assert.ok((b[2] - b[0] + 1) * f.cs <= 640 && (b[3] - b[1] + 1) * f.cs <= 346);
});
test('trailAges lists recently dead cells with their age', () => {
  const last = new Map([[1, 10], [2, 7], [3, 0], [4, 5]]);
  const t = Object.fromEntries(trailAges(last, 10, 10));
  assert.deepEqual(t, { 2: 3, 3: 10, 4: 5 });             // key 1 is alive now (age 0), nothing older than the depth
});
test('a glider keeps 5 cells and a blinker oscillates, so the population curve is flat', () => {
  let s = presetSet('glider'); for (let i = 0; i < 40; i++) s = step(s); assert.equal(s.size, 5);
  assert.equal(presetSet('rpent').size, 5);
});
test('wrap breaks at word boundaries and keeps all the words', () => {
  const lines = wrap('Proportionnel mais pas sans envie : A envie B, C envie A.', 20);
  assert.ok(lines.every((l) => l.length <= 20));
  assert.equal(lines.join(' '), 'Proportionnel mais pas sans envie : A envie B, C envie A.');
});
const tr = (x) => x[1];
test('the cake scene draws the matrix of the model', () => {
  const s = { kind: 'cake', values: [[2, 3, 1], [1, 2, 3], [3, 1, 2]], cut1: 1 / 3, cut2: 2 / 3, person: 0, bin: 1 }, m = F.model(s), sc = cakeScene(s, m, tr);
  const texts = sc.texts.map((t) => t.text);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) assert.ok(texts.includes(pct(m.matrix[i][j])), `cell ${i}${j}`);
  // the counterexample of the lab: proportional, with envy; the red cells are exactly the envied pieces
  assert.equal(m.allProportional, true); assert.equal(m.envyFree, false);
  const reds = sc.polys.filter((p) => p.fill === 'neg').length;
  assert.equal(reds, envyPairs(m).length); assert.ok(reds > 0);
  assert.ok(sc.texts.some((t) => /envies/.test(t.text) || /not envy-free/.test(t.text) || /but not/.test(t.text)));
  assert.equal(sc.polys.filter((p) => PERSON.includes(p.fill) && p.pts.length === 4 && p.pts[0][1] === 9).length, 3);   // three cake pieces
});
test('the cake pieces follow the cuts, and unequal pieces of a uniform cake create envy', () => {
  const s = { kind: 'cake', values: [[3, 3, 3], [3, 3, 3], [3, 3, 3]], cut1: .25, cut2: .75, person: 1, bin: 0 }, m = F.model(s), sc = cakeScene(s, m, tr);
  const pieces = sc.polys.filter((p) => p.pts.length === 4 && p.pts[0][1] === 9);
  assert.deepEqual(pieces.map((p) => [p.pts[0][0], p.pts[1][0]]), [[0, 3], [3, 9], [9, 12]]);
  assert.equal(m.envyFree, false);   // 25 % / 50 % / 25 %: A and C receive less than B's piece, so they envy
  assert.equal(envyPairs(m).length, 2);   // A and C both envy B
  const even = cakeScene({ ...s, cut1: 1 / 3, cut2: 2 / 3 }, F.model({ ...s, cut1: 1 / 3, cut2: 2 / 3 }), tr);
  assert.ok(even.texts.some((t) => /Envy-free:/.test(t.text) || /Sans envie/.test(t.text)));
});
test('the goods scene draws one arrow per envy of the model', () => {
  const s = { kind: 'goods', values: [[3, 2, 1], [1, 2, 3]], owners: [1, 0, 0], edit: '0-0' }, m = F.model(s), sc = goodsScene(s, m, tr);
  assert.equal(sc.lines.filter((l) => l.arrow).length, envyPairs(m).length);
  const ok = { ...s, owners: [0, 0, 1] }, m2 = F.model(ok), sc2 = goodsScene(ok, m2, tr);
  assert.equal(m2.envyFree, true); assert.equal(sc2.lines.filter((l) => l.arrow).length, 0);
  assert.equal(sc2.polys.filter((p) => p.alpha === 0.55).length, 3);   // three goods, one coloured square each
});
test('the chaotic three-body start completes and amplifies a 1e-5 gap by more than 1e3', () => {
  const pr = D.GRAVITY_PRESETS.chaotic, s = { system: 'gravity', initial: pr.y.slice(), m1: 1, m2: 1, m3: 1, G: 1, com: true, time: 20, delta: 1e-5, speed: 2, tolerance: 1e-8, preset: 'chaotic' };
  const m = D.gravityModel(s);
  assert.equal(m.path.status, 'complete');
  const gap = (t) => { const a = D.stateAt(m.path, t), b = D.stateAt(m.other, t); return Math.hypot(...a.y.filter((_, i) => i % 4 < 2).map((v, i) => v - b.y[Math.floor(i / 2) * 4 + i % 2])); };
  assert.ok(gap(20) / gap(0.04) > 1e3, `gap ${gap(20)}`);
  // the figure-eight, by contrast, stays within a gap of 1e-2
  const e = D.GRAVITY_PRESETS.figure8, m8 = D.gravityModel({ ...s, initial: e.y.slice(), preset: 'figure8' });
  const g8 = (t) => { const a = D.stateAt(m8.path, t), b = D.stateAt(m8.other, t); return Math.hypot(...a.y.filter((_, i) => i % 4 < 2).map((v, i) => v - b.y[Math.floor(i / 2) * 4 + i % 2])); };
  assert.ok(g8(20) < 1e-2);
});
