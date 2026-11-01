// Monte Carlo experiments (site/js/lab/models/monte-carlo.js, experiments/monte-carlo.js, templates/monte-carlo.js).
// Statistical tests use fixed seeds, so they are deterministic; the tolerances below say how much sampling noise is allowed:
//  - unbiasedness: |mean - reference| < 4.5 standard errors of the mean over the repetitions (a fluke of probability about 7e-6 per
//    case for a true unbiased estimator, and the seeds are fixed anyway);
//  - coverage of the stated 95% interval at n = 1000: between 93% and 97% for 2000 repetitions (the Monte Carlo standard deviation of
//    an observed coverage is about 0.5 percentage point, so this is four standard deviations).
// The spiky function is the documented exception: its normal interval is too narrow at small n, and the test asserts that.
import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import * as M from '../site/js/lab/models/monte-carlo.js';
import { monteCarloExperiments } from '../site/js/lab/experiments/monte-carlo.js';

const near = (a, b, tol, msg = '') => assert.ok(Math.abs(a - b) <= tol, `${msg} ${a} vs ${b}`);
const midpoint = (f, a, b, n = 400000) => { let s = 0; const h = (b - a) / n; for (let i = 0; i < n; i++) s += f(a + (i + 0.5) * h) * h; return s; };
const ruin = (U, L) => { const h = new Map(); for (let i = -L; i <= U; i++) h.set(i, i === U ? 1 : 0); for (let k = 0; k < 20000; k++) for (let i = -L + 1; i < U; i++) h.set(i, (h.get(i - 1) + h.get(i + 1)) / 2); return h.get(0); };

test('closed-form references: pi, three integrals, gambler’s ruin', () => {
  near(M.integralReference('gauss'), 0.8820813908, 1e-9);
  near(M.integralReference('sine'), 0.5, 0);
  near(M.integralReference('spike'), 0.0695213598, 1e-9);
  // independent quadrature of the same three integrals
  near(midpoint((x) => Math.exp(-x * x), 0, 2), 0.8820813908, 1e-9);
  near(midpoint((x) => Math.sin(Math.PI * x) ** 2, 0, 1), 0.5, 1e-9);
  near(midpoint((x) => Math.exp(-650 * (x - 0.72) ** 2), 0, 1), 0.0695213598, 1e-9);
  for (const [U, L] of [[5, 3], [10, 2], [2, 10]]) { near(M.walkReference(U, L), L / (U + L), 0); near(ruin(U, L), L / (U + L), 1e-9, `${U}/${L}`); }
  near(M.pi({ runs: 0 }).reference, Math.PI, 0);
});

test('lake presets: exact polygon areas in km² (square 36, L shape 33) and the others against a fine grid', () => {
  near(M.lakeArea({ shape: 'square' }), 36, 1e-9);
  near(M.lakeArea({ shape: 'ell' }), 33, 1e-9);
  near(M.lakeArea({ shape: 'disc' }), 100 * 0.5 * 120 * 0.35 ** 2 * Math.sin((2 * Math.PI) / 120), 1e-9);
  near(M.lakeArea({ shape: 'disc' }), 38.47, 0.01);
  near(M.lakeArea({ shape: 'default' }), 29.84, 0.01);
  const N = 1000;   // even-odd count on a grid: independent of the shoelace formula
  for (const shape of ['default', 'disc', 'square', 'ell']) {
    const poly = M.LAKE_PRESETS[shape]; let inside = 0;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (M.pointInPolygon((i + 0.5) / N, (j + 0.5) / N, poly)) inside++;
    near((100 * inside) / (N * N), M.lakeArea({ shape }), 0.05, shape);
  }
  // a drawn polygon replaces the lake; a trace that is too short, too small or self-crossing is refused
  const square = [[0.2, 0.2], [0.8, 0.2], [0.8, 0.8], [0.2, 0.8]];
  const trace = []; for (const [a, b] of [[0, 1], [1, 2], [2, 3], [3, 0]]) for (let k = 0; k < 5; k++) trace.push([square[a][0] + (square[b][0] - square[a][0]) * k / 5, square[a][1] + (square[b][1] - square[a][1]) * k / 5]);
  const poly = M.polygonFromTrace(trace); assert.ok(poly); near(M.lakeArea({ shape: 'custom', poly }), 36, 1e-9);
  assert.ok(M.polygonFromTrace([...trace, trace[0]]), 'a loop closed on its starting point is accepted');
  assert.equal(M.polygonFromTrace(trace.slice(0, 5)), null);
  assert.equal(M.polygonFromTrace(Array.from({ length: 20 }, (_, i) => [0.5 + i * 1e-4, 0.5])), null);
  const bow = [[0.1, 0.1], [0.9, 0.9], [0.9, 0.1], [0.1, 0.9]]; assert.equal(M.selfIntersects(bow), true);
  assert.equal(M.polygonFromTrace(Array.from({ length: 16 }, (_, i) => bow[Math.floor(i / 4)].map((v, k) => v + (i % 4) * 0.01 * (k ? 1 : -1)))), null);
  assert.equal(M.selfIntersects(square), false);
});

test('the result is a function of (state, seed, runs): incremental, chunked and fresh samplers agree', () => {
  for (const [kind, params] of [['pi', {}], ['integral', { fn: 'spike' }], ['walk', { upper: 5, lower: 3 }], ['lake', { poly: M.LAKE_PRESETS.ell }]]) {
    const a = M.createSampler(kind, params, 7, { track: false }); a.advance(1234);
    const b = M.createSampler(kind, params, 7, { track: false }); for (let i = 0; i < 1234; i++) b.advance(1);
    assert.equal(a.hits, b.hits); assert.equal(a.mean, b.mean); assert.equal(a.m2, b.m2);
  }
  const s = { runs: 1500, seed: 3 }, big = M.pi(s), small = M.pi({ ...s, runs: 400 }), again = M.pi(s);
  assert.equal(big.hits, again.hits); assert.deepEqual(big.history, again.history);
  assert.equal(small.hits, M.pi({ runs: 400, seed: 3 }).hits);
  assert.ok(M.pi({ runs: 400, seed: 4 }).hits !== small.hits);
  assert.throws(() => M.pi({ runs: M.MAX_RUNS + 1 }), RangeError);
});

const reps = 1500, n = 1000;
function replicate(kind, params, truth, count = reps, size = n) {
  const est = [], hit = [];
  for (let r = 0; r < count; r++) {
    const S = M.createSampler(kind, params, 1000 + r, { track: false }); S.advance(size);
    const e = kind === 'pi' ? (4 * S.hits) / size : kind === 'lake' ? (100 * S.hits) / size : kind === 'walk' ? S.hits / size : S.mean;
    est.push(e);
    let iv;
    if (kind === 'integral') iv = M.normalInterval(S.mean, S.m2, size); else { const w = M.wilson(S.hits, size), k = kind === 'pi' ? 4 : kind === 'lake' ? 100 : 1; iv = [w[0] * k, w[1] * k]; }
    hit.push(iv[0] <= truth && truth <= iv[1]);
  }
  const mean = est.reduce((a, b) => a + b, 0) / count, sd = Math.sqrt(est.reduce((a, b) => a + (b - mean) ** 2, 0) / (count - 1));
  return { mean, sd, z: (mean - truth) / (sd / Math.sqrt(count)), coverage: hit.filter(Boolean).length / count };
}
const cases = [
  ['pi', {}, Math.PI], ['lake', { poly: M.LAKE_PRESETS.ell }, 33], ['integral', { fn: 'gauss' }, 0.8820813908], ['integral', { fn: 'sine' }, 0.5],
  ['integral', { fn: 'spike' }, 0.0695213598], ['walk', { upper: 5, lower: 3 }, 3 / 8], ['walk', { upper: 10, lower: 2 }, 2 / 12], ['walk', { upper: 2, lower: 10 }, 10 / 12],
];
test('estimators are unbiased: the mean over 1500 repetitions at n = 1000 is within 4.5 standard errors of the reference', () => {
  for (const [kind, params, truth] of cases) { const r = replicate(kind, params, truth); assert.ok(Math.abs(r.z) < 4.5, `${kind} ${JSON.stringify(params)} z = ${r.z}`); }
});
test('the approximate 95% interval covers 93% to 97% of the time at n = 1000 (2000 repetitions)', () => {
  for (const [kind, params, truth] of cases) { const r = replicate(kind, params, truth, 2000); assert.ok(r.coverage >= 0.93 && r.coverage <= 0.97, `${kind} ${JSON.stringify(params)} coverage ${r.coverage}`); }
});
test('for the narrow spike the normal interval is too narrow with few trials, as the page says', () => {
  const t = 0.0695213598;
  const c30 = replicate('integral', { fn: 'spike' }, t, 2000, 30).coverage, c100 = replicate('integral', { fn: 'spike' }, t, 2000, 100).coverage;
  assert.ok(c30 < 0.92 && c30 > 0.75, `n = 30 coverage ${c30}`);
  assert.ok(c100 < 0.95 && c100 > 0.85, `n = 100 coverage ${c100}`);
  const smooth = replicate('integral', { fn: 'sine' }, 0.5, 2000, 100).coverage;
  assert.ok(smooth > 0.93, `a smooth function is fine at n = 100: ${smooth}`);
});
test('the Wilson interval and the normal interval formulas', () => {
  const w = M.wilson(50, 100); near(w[0], 0.4038, 1e-4); near(w[1], 0.5962, 1e-4);
  assert.equal(M.wilson(0, 0), null); assert.deepEqual(M.wilson(0, 30)[0], 0); near(M.wilson(30, 30)[1], 1, 1e-12);
  const iv = M.normalInterval(1, 99 * 4, 100); near(iv[0], 1 - 1.959963984540054 * 0.2, 1e-12); near(iv[1], 1 + 1.959963984540054 * 0.2, 1e-12);
  assert.equal(M.normalInterval(1, 1, 1), null);
  assert.equal(M.pi({ runs: 29, seed: 1 }).interval, null); assert.ok(M.pi({ runs: 30, seed: 1 }).interval);
});

test('every user string is a [fr, en] pair; no French in the English slot, no English in the French slot, no dashes', () => {
  const frWords = /\b(le|la|les|des|une|est|sont|pour|avec|dans|essais|aléatoire|chaque|pourquoi|quelle|ces|aux|du)\b/i;
  const enWords = /\b(the|and|with|this|that|trials|random|area|lake|walk|speed|reference|estimate|interval|why|what|each|probability|which)\b/i;
  const strings = [];
  const walk = (v, where) => {
    if (Array.isArray(v) && v.length === 2 && v.every((x) => typeof x === 'string')) strings.push([v, where]);
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, where + '.' + i));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (typeof x !== 'function') walk(x, where + '.' + k);
  };
  for (const e of monteCarloExperiments) {
    const { model, views, ...rest } = e; walk(rest, e.id);
    for (const c of Object.values(e.controls)) for (const o of c.options || []) strings.push([o.label, e.id + ' option']);
  }
  assert.ok(strings.length > 100);
  for (const [[fr, en], where] of strings) {
    assert.ok(fr.trim() && en.trim(), where);
    assert.ok(!/[–—]/.test(fr + en), `${where}: dash`);
    assert.ok(!/\d\.\d/.test(fr), `${where}: decimal comma in French: ${fr}`);
    if (fr.length > 25) { assert.ok(!enWords.test(fr.replace(/e\^\(.*?\)/g, '')) || frWords.test(fr), `${where}: English in the French slot: ${fr}`); assert.ok(!frWords.test(en.replace(/[A-Za-z]*\(.*?\)/g, '')) , `${where}: French in the English slot: ${en}`); }
    if (!/^[+ 0-9,./]*$/.test(fr)) assert.notEqual(fr, en, where);
  }
  for (const e of monteCarloExperiments) {
    assert.equal(e.template, 'inference'); assert.equal(e.section, 'inference');
    assert.ok(e.missions.length >= 4 && e.missions.length <= 6); assert.equal(e.missions[0].kind, 'predict'); assert.equal(e.missions.at(-1).kind, 'explain');
  }
});

test('the run is time-based: 1 second gives the same number of trials at 60 Hz and at 144 Hz, and nothing runs under reduced motion', async () => {
  const dom = new JSDOM('<main></main>', { pretendToBeVisual: true }), w = dom.window;
  for (const key of ['window', 'document', 'Event', 'MouseEvent', 'KeyboardEvent', 'MutationObserver']) { try { globalThis[key] = w[key]; } catch { Object.defineProperty(globalThis, key, { value: w[key], configurable: true }); } }
  let reduced = false, number = 0; const frames = new Map();
  globalThis.matchMedia = () => ({ matches: reduced, addEventListener() {}, removeEventListener() {} });
  globalThis.requestAnimationFrame = (fn) => { frames.set(++number, fn); return number; };
  globalThis.cancelAnimationFrame = (id) => frames.delete(id);
  const tick = (now) => { const pending = [...frames.values()]; frames.clear(); for (const fn of pending) fn(now); };
  const { mountExperiment } = await import('../site/js/lab/mount.js');
  const trials = async (hz, seconds, speedKey = 'normal') => {
    const root = w.document.createElement('section'); w.document.body.append(root);
    const api = mountExperiment(root, 'monte-carlo-pi', { mode: 'full', lang: 'en' }); await api.ready; tick(0);
    const sel = root.querySelector('.mc-speed select'); sel.value = speedKey; sel.dispatchEvent(new w.Event('change', { bubbles: true }));
    root.querySelector('.mc-run').click();
    const dt = 1000 / hz; let now = 1000; tick(now);
    for (let k = 0; k < Math.round(seconds * hz); k++) { now += dt; tick(now); }
    const runs = api.getState().runs; root.querySelector('.mc-run').click(); const stopped = api.getState().runs; tick(now + 100); assert.equal(api.getState().runs, stopped, 'pause stops the run');
    api.destroy(); assert.equal(frames.size, 0, "destroy leaves no pending animation frame"); root.remove(); return runs;
  };
  const a = await trials(60, 1), b = await trials(144, 1), c = await trials(30, 1);
  for (const r of [a, b, c]) assert.ok(r >= 590 && r <= 610, `about 600 trials in one second, got ${r}`);
  assert.ok(Math.abs(a - b) <= 6 && Math.abs(a - c) <= 6, `${a} ${b} ${c}`);
  near(await trials(60, 1, 'fast'), 6000, 60);
  // a huge frame gap (hidden tab, breakpoint) is capped at 0.1 s
  reduced = true;
  const root = w.document.createElement('section'); w.document.body.append(root);
  const api = mountExperiment(root, 'monte-carlo-pi', { mode: 'full', lang: 'fr' }); await api.ready; tick(0);
  root.querySelector('.mc-run').click(); assert.equal(api.getState().runs, 100, 'reduced motion: one batch per press'); tick(500); tick(1000); assert.equal(api.getState().runs, 100);
  api.destroy();
});

test('a hand-drawn stroke must come back near its start: an open C is refused, a closed loop accepted', async () => {
  const M = await import('../site/js/lab/models/monte-carlo.js');
  const arc = (from, to, n = 80) => Array.from({ length: n }, (_, i) => { const a = from + (to - from) * i / (n - 1); return [0.5 + 0.3 * Math.cos(a), 0.5 + 0.3 * Math.sin(a)]; });
  assert.equal(M.polygonFromTrace(arc(0.4, 2 * Math.PI - 0.4)), null, 'an open C is not a lake');
  assert.ok(M.polygonFromTrace(arc(0, 2 * Math.PI)), 'a closed loop is accepted');
  assert.ok(M.polygonFromTrace(arc(0.05, 2 * Math.PI - 0.05)), 'a loop that stops just short of its start is closed');
});
