// The data behind the six chance pictures (models/inference.js) and the figures' drawing code against a no-op canvas.
import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import * as M from '../site/js/lab/models/inference.js';
const near = (a, b, t = 1e-10) => assert.ok(Math.abs(a - b) < t, `${a} != ${b}`);

test('birthday curve: one pass equals the closed form 1 - 365!/((365-n)! 365^n), n = 23 is the first above one half', () => {
  const c = M.birthdayCurve(365, null, 100);
  for (const n of [0, 1, 2, 10, 23, 50, 70, 100]) { let no = 1; for (let j = 0; j < n; j++) no *= (365 - j) / 365; near(c[n], 1 - no, 1e-12); near(c[n], M.birthdayProbability(n), 1e-12); }
  assert.equal(M.birthdayThreshold(c), 23); near(c[23], .5072972343239859);
  const p = Array.from({ length: 365 }, (_, i) => (1 + .6 * Math.cos(2 * Math.PI * i / 365)) / 365);
  near(M.birthdayCurve(365, p, 40)[30], M.birthdayProbability(30, 365, p), 1e-10);
  assert.equal(M.birthdayCurve(16, null, 100)[17], 1);
});
test('baker clouds: keeping the heaviest of five shifts the mean by about 1.163 sigma, the random cloud does not', () => {
  const a = M.bakerClouds({ mean: 980, sigma: 20, noise: 0, n: 1000, seed: 3 });
  near(a.meanRandom, 980, 2); near(a.shift, 20 * 1.1629644736, 2.5);
  assert.equal(a.random.length, 1000); assert.equal(a.selected.length, 1000);
  assert.deepEqual(M.bakerClouds({ n: 30, seed: 5 }), M.bakerClouds({ n: 30, seed: 5 }));
});
test('Monty tally converges to 2/3 and 1/3 for the informed host and 1/2 for the ignorant host', () => {
  const a = M.montyTally(11, 10000, 'informed'), i = 9999;
  assert.equal(a.eligible[i], 10000); near(a.switchWins[i] / a.eligible[i], 2 / 3, .015); near(a.stayWins[i] / a.eligible[i], 1 / 3, .015);
  assert.equal(a.switchWins[i] + a.stayWins[i], a.eligible[i]);
  const b = M.montyTally(11, 10000, 'random'); assert.ok(b.eligible[i] < 7500 && b.eligible[i] > 5800); near(b.switchWins[i] / b.eligible[i], .5, .03);
  for (let k = 1; k < 10000; k++) assert.ok(a.eligible[k] >= a.eligible[k - 1]);
});
test('German tank: the maximum is biased low, N-hat = M(1+1/k)-1 is unbiased (repeated draws)', () => {
  const t = M.tank({ N: 100, k: 5, runs: 4000, seed: 8 });
  near(t.maxima.reduce((a, b) => a + b, 0) / 4000, 5 * 101 / 6, 1); near(t.observedMean, 100, 1);
  assert.ok(t.maxima.every(m => m <= 100)); near(t.estimate, t.m + t.m / 5 - 1);
});
test('Benford presets: computed powers of 2 and Fibonacci follow log10(1+1/d), squares and ids do not', () => {
  for (const mode of ['pow2', 'fib']) { const b = M.benford({ mode, count: 1000 }); assert.equal(b.n, 1000); for (let d = 0; d < 9; d++) near(b.frequency[d], b.theory[d], .03); }
  assert.equal(M.benfordData(1, 5, 'pow2')[4], 32);
  const sq = M.benford({ mode: 'squares', count: 1000 }); assert.ok(Math.abs(sq.frequency[0] - Math.log10(2)) > .05);
});
test('secretary success curve p(r) peaks at about n/e with value about 1/e', () => {
  const o = M.secretaryThreshold(100); assert.ok(Math.abs(o.skip - 100 / Math.E) < 2); near(o.probability, 1 / Math.E, .01);
});

test('every figure draws through a canvas without throwing, in both languages, and cleans up', async () => {
  const dom = new JSDOM('<main></main>', { pretendToBeVisual: true }), w = dom.window;
  for (const key of ['window', 'document', 'Event', 'MouseEvent', 'KeyboardEvent', 'CustomEvent', 'HTMLElement']) globalThis[key] = w[key];
  const calls = []; const ctx = new Proxy({}, { get: (_, k) => (k === 'measureText' ? () => ({ width: 10 }) : (...a) => { calls.push(k); } ), set: () => true });
  w.HTMLCanvasElement.prototype.getContext = () => ctx;
  globalThis.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
  globalThis.getComputedStyle = w.getComputedStyle.bind(w);
  const frames = new Map(); let n = 0; globalThis.requestAnimationFrame = f => { frames.set(++n, f); return n; }; globalThis.cancelAnimationFrame = i => frames.delete(i);
  const { mountExperiment } = await import('../site/js/lab/mount.js');
  for (const lang of ['fr', 'en']) for (const id of ['secretary', 'tank', 'benford', 'baker', 'birthdays', 'monty']) {
    const root = w.document.createElement('section'); w.document.body.append(root);
    const api = mountExperiment(root, id, { mode: 'inline', lang }); await api.ready;
    for (let i = 0; i < 3; i++) { const f = [...frames.values()]; frames.clear(); f.forEach(fn => fn(100 + i * 50)); }
    assert.ok(root.querySelector('.inf-panel canvas'), id); assert.ok(!/NaN|undefined/.test(root.textContent), id);
    for (const c of root.querySelectorAll('.inf-panel canvas')) assert.ok(c.getAttribute('aria-label') || c.getAttribute('aria-hidden'), id);
    api.setState?.({ seed: 4 }); const f = [...frames.values()]; frames.clear(); f.forEach(fn => fn(400));
    api.destroy(); assert.ok(!root.querySelector('.inf-fig'), id + ' removed');
  }
  assert.ok(calls.includes('fillRect') && calls.includes('stroke'));
});
