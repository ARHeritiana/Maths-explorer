// Runs the Maths expertes widgets (the unit circle moved to the laboratory) under jsdom with the real number formatter, sweeps
// every handle and slider, and checks that each calculation printed with "=" is arithmetically true.
// Added after the two independent audits of 2026-10-17 (findings: cquad and complex rounded with "=", markov limit
// claimed for p = q = 1, unit-circle degrees "60" printed as "6"); the earlier verification script never ran the widgets.
import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';

const dom = new JSDOM('<!doctype html><body></body>', {pretendToBeVisual: true});
for (const k of ['window', 'document', 'Node', 'NodeFilter', 'HTMLElement', 'Image', 'XMLSerializer', 'getComputedStyle']) globalThis[k] ??= dom.window[k];
globalThis.matchMedia ??= () => ({matches: false, addEventListener() {}, removeEventListener() {}});
globalThis.ResizeObserver ??= class { observe() {} disconnect() {} };
globalThis.requestAnimationFrame ??= () => 0;
const {W2} = await import('../site/slides/widgets-2d.js');
const {tnum} = await import('../site/slides/widgets.js');

// Canvas stub: records nothing, fails on a non-finite numeric argument.
const canvas = bad => new Proxy({}, {get: (t, p) => (p in t ? t[p] : (...a) => { for (const v of a) if (typeof v === 'number' && !Number.isFinite(v)) bad.push(`canvas ${String(p)} ${v}`); }), set: (t, p, v) => { t[p] = v; return true; }});

// Drive one widget in English (decimal point) and return every distinct readout reached.
function sweep(type, spec = {}, joint = false) {   // joint: move both handles together (all pairs)
  const bad = [], controls = document.createElement('div'), readout = document.createElement('div');
  const o = {W: 900, H: 560, spec: {type, ...spec}, L: 1, lang: 1, controls, readout, t: 0, redraw() {},
    num: n => tnum(n, 1), tn: (n, d) => tnum(n, 1, d), pair: (fr, en) => en};
  const g = canvas(bad); o.g = g; const w = W2[type](o); o.redraw = () => w.draw(g);
  const seen = new Set(), look = () => { w.draw(g); seen.add(readout._html || ''); };
  look();
  for (const s of controls.querySelectorAll('input[type=range]')) for (let v = +s.min; v <= +s.max + 1e-9; v += +s.step) { s.value = v; s.dispatchEvent(new window.Event('input')); look(); }
  const n = w.handles ? w.handles().length : 0;
  if (joint && n === 2) for (let X = 0; X <= o.W; X += 30) for (let Y = 0; Y <= o.H; Y += 30) { w.handles()[0].move(X, Y); for (let X2 = 0; X2 <= o.W; X2 += 30) for (let Y2 = 0; Y2 <= o.H; Y2 += 30) { w.handles()[1].move(X2, Y2); look(); } }
  for (let h = 0; h < n; h++) for (let X = 0; X <= o.W; X += 23) for (let Y = 0; Y <= o.H; Y += 23) { const hd = w.handles()[h]; if (hd) { hd.move(X, Y); look(); } }
  return {readouts: [...seen], bad};
}
const num = s => Number(s.replace(/[(){}\\left\\right]/g, ''));
const close = (a, b) => Math.abs(a - b) < 1e-9;

test('expertes widgets never print NaN, undefined or a non-finite value', () => {
  const specs = {complex: [{mode: 'alg'}, {mode: 'polar'}, {mode: 'product'}], cquad: [{}], roots: [{n: 6}], modclock: [{mode: 'powers', n: 9, a: 2}, {mode: 'inverse', n: 26, a: 7}], walks: [{}], markov: [{}]};
  for (const [type, list] of Object.entries(specs)) for (const spec of list) {
    const {readouts, bad} = sweep(type, spec);
    assert.deepEqual(bad, [], type);
    for (const r of readouts) assert.doesNotMatch(r.replace(/tan\\theta\\\)\}?: undefined/, ''), /NaN|undefined|Infinity/, `${type}: ${r.slice(0, 120)}`); // the word "undefined" for tan(pi/2) is intended
  }
});

test('cquad: the printed discriminant equals the printed arithmetic', () => {
  let n = 0;
  for (const r of sweep('cquad').readouts) {
    const m = r.match(/\\Delta=\\left\((-?[\d.]+)\\right\)\^2-4\\times(?:\\left\()?(-?[\d.]+)(?:\\right\))?=(-?[\d.]+)/) || r.match(/\\Delta=(-?[\d.]+)\^2-4\\times(?:\\left\()?(-?[\d.]+)(?:\\right\))?=(-?[\d.]+)/);
    if (!m) continue; n++;
    const [s, p, d] = m.slice(1).map(Number);
    assert.ok(close(s * s - 4 * p, d), `${s}^2 - 4 x ${p} != ${d}`);
  }
  assert.ok(n > 50, `only ${n} discriminant readouts parsed`);
});

test('complex product: |z| x |w| printed with "=" is exact', () => {
  let n = 0;
  for (const r of sweep('complex', {mode: 'product'}, true).readouts) {
    const m = r.match(/\|z\|\\times\|w\|=([\d.]+)\\times([\d.]+)(=|\\approx)([\d.]+)/);
    if (!m) continue; n++;
    if (m[3] === '=') assert.ok(close(+m[1] * +m[2], +m[4]), `${m[1]} x ${m[2]} = ${m[4]}`);
  }
  assert.ok(n > 100, `only ${n} product readouts parsed`);
});

test('markov: no limit is claimed when p = q = 1', () => {
  const {readouts} = sweep('markov');
  const swap = readouts.filter(r => /T=\\begin\{pmatrix\}0&1\\\\1&0\\end\{pmatrix\}/.test(r));
  assert.ok(swap.length > 0, 'the state p = q = 1 is reachable');
  for (const r of swap) { assert.doesNotMatch(r, /Limit/); assert.match(r, /no limit/); }
  for (const r of readouts.filter(r => !swap.includes(r))) assert.match(r, /Limit/);
});

// The unit circle widget moved to the laboratory (trig experiment, 18 October 2026): the same check on its readout.
test('unit circle (laboratory trig experiment): degrees and radians agree', async () => {
  const {experimentById} = await import('../dist/js/lab/registry.js'), {makeFormat} = await import('../dist/js/lab/format.js');
  const trig = experimentById('trig'), fmt = makeFormat('en');
  let n = 0;
  for (let deg = 0; deg <= 360; deg += 5) {
    const text = trig.views.readout({deg, assoc: 'none', fn: 'sin'}, {fmt, lang: 'en', unlocked: () => true})[0][1];
    const m = text.match(/^(\d+)° = (?:(\d*)π(?:\/(\d+))?|0) rad$/);
    assert.ok(m, text); n++;
    assert.equal(+m[1], deg);
    const rad = m[2] === undefined && !/π/.test(text) ? 0 : (m[2] === '' ? 1 : +m[2]) / (m[3] ? +m[3] : 1);
    assert.ok(close(((deg % 360) + 360) % 360, ((rad * 180) % 360 + 360) % 360), `${deg} deg vs ${rad} pi rad`);
  }
  assert.equal(n, 73);
});
