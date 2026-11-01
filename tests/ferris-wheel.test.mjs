// Experiment `ferris-wheel` (idealised observation wheel): closed-form values, derivative by central difference, thresholds by
// bisection, wheel and graph agreeing on the height, controls, honest labelling, bilingual strings, registration and placement.
// Imports dist/js: run `make site` first.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as F from '../dist/js/lab/models/ferris-wheel.js';
import exp from '../dist/js/lab/experiments/ferris-wheel.js';
import { EXPERIMENTS, resolveRef, SECTION_INFO, INDEX_ORDER, groupOf } from '../dist/js/lab/registry.js';
import { makeFormat } from '../dist/js/lab/format.js';
import { pathways, pathwayStages } from '../dist/js/content.js';

const near = (a, b, tol, msg = '') => assert.ok(Math.abs(a - b) <= tol, `${msg} ${a} != ${b}`);
// An independent height: the y-coordinate of a point turning on the circle, a sine of the angle measured from the lowest point.
const geometric = (t) => 75 + 60 * Math.sin((2 * Math.PI * t) / 30 - Math.PI / 2);
const bisect = (f, lo, hi) => { for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; (f(lo) * f(mid) <= 0 ? (hi = mid) : (lo = mid)); } return (lo + hi) / 2; };

test('closed-form values of the model h(t) = 75 - 60 cos(pi t / 15)', () => {
  near(F.height(0), 15, 1e-12); near(F.height(15), 135, 1e-12); near(F.height(30), 15, 1e-12);
  near(F.height(5), 45, 1e-12); near(F.height(7.5), 75, 1e-12);
  assert.equal(F.A, -60); near(F.B, Math.PI / 15, 1e-15); assert.equal(F.D, 75);
  near(F.firstCrossing(), (15 / Math.PI) * Math.acos(-3 / 4), 1e-12);
  near(F.firstCrossing(), 11.549, 1e-3); near(F.secondCrossing(), 18.451, 1e-3);
  near(F.height(F.firstCrossing()), 120, 1e-9); near(F.height(F.secondCrossing()), 120, 1e-9);
  near(F.timeAtOrAbove(), 6.902, 1e-3); near(F.timeAtOrAbove(), F.secondCrossing() - F.firstCrossing(), 1e-12);
  near(F.rate(7.5), 4 * Math.PI, 1e-12); near(F.rate(22.5), -4 * Math.PI, 1e-12); near(F.MAX_RATE, 12.566, 1e-3);
  near(F.rate(0), 0, 1e-12); near(F.rate(15), 0, 1e-12);
});

test('h\' is the derivative of h: central differences, and the maximum rate 4 pi at t = 7.5', () => {
  let best = -Infinity, at = 0;
  for (let t = 0; t <= 30; t += 0.01) {
    const e = 1e-5, d = (F.height(t + e) - F.height(t - e)) / (2 * e);
    near(d, F.rate(t), 1e-6, `t = ${t}`);
    if (d > best) { best = d; at = t; }
  }
  near(best, 4 * Math.PI, 1e-3); near(at, 7.5, 0.02);
});

test('the thresholds found by bisection agree with the closed form', () => {
  const g = (t) => F.height(t) - 120;
  const t1 = bisect(g, 0, 15), t2 = bisect(g, 15, 30);
  near(t1, F.firstCrossing(), 1e-9); near(t2, F.secondCrossing(), 1e-9); near(t2 - t1, F.timeAtOrAbove(), 1e-9);
  // sampled: the time spent at or above 120 m
  let n = 0; const N = 300000; for (let i = 0; i < N; i++) if (F.height(((i + 0.5) / N) * 30) >= 120) n++;
  near((n / N) * 30, F.timeAtOrAbove(), 1e-3);
  // other levels: the symmetric pair always adds up to the period, and the extreme levels degenerate sensibly
  for (const level of [20, 45, 75, 100, 134]) near(F.firstCrossing(level) + F.secondCrossing(level), 30, 1e-12);
  assert.equal(F.timeAtOrAbove(136), 0); assert.equal(F.timeAtOrAbove(10), 30); near(F.timeAtOrAbove(75), 15, 1e-12);
});

test('the seat on the wheel and the point on the graph give the same height', () => {
  for (let t = 0; t <= 30; t += 0.05) {
    const p = F.seat(t), s = { t, aid: 'none' };
    near(p.y, F.height(t), 1e-12, `seat ${t}`);
    near(p.y, geometric(t), 1e-12, `geometric ${t}`);
    near(exp.controls.seat.at(s)[1], exp.controls.onGraph.at(s)[1], 1e-12);
    near(Math.hypot(p.x, p.y - 75), 60, 1e-12, 'the seat stays on the rim');
    assert.ok(F.model(s).h === F.height(t));
  }
  // the wheel turns clockwise from the lowest point: a quarter turn puts the seat level with the hub, on the left
  near(F.seat(7.5).x, -60, 1e-12); near(F.seat(7.5).y, 75, 1e-12); near(F.seat(22.5).x, 60, 1e-12);
});

test('timeAt inverts seat, and the handles round-trip, clamp and step', () => {
  for (let t = 0; t < 30; t += 0.05) near(F.timeAt(F.seat(t).x, F.seat(t).y), t, 1e-7, `t = ${t}`);
  const s = { t: 5, aid: 'none' };
  const { seat, onGraph } = exp.controls;
  assert.equal(seat.drag(s, ...seat.at({ t: 20, aid: 'none' })).t, 20);
  assert.equal(onGraph.drag(s, 12.34, 0).t, 12.35);
  assert.equal(onGraph.drag(s, 100, 0).t, 30); assert.equal(onGraph.drag(s, -100, 0).t, 0);
  for (const far of [[100, 100], [-100, -100], [0, 100], [0, 75]]) assert.ok(Number.isFinite(seat.drag(s, ...far).t));
  // arrow keys: one press is 0,25 min, forward then back returns, the wheel wraps round
  assert.equal(onGraph.nudge(s, 1, 0).t, 5.25); assert.equal(onGraph.nudge({ t: 5.25 }, -1, 0).t, 5);
  assert.equal(seat.nudge({ t: 0 }, -1, 0).t, 29.75); assert.equal(seat.nudge({ t: 29.75 }, 1, 0).t, 0);
  // the numeric alternative: the scrubber maps to the state and back, with a step fine enough to find the crossings
  const time = exp.controls.time;
  assert.equal(time.get({ t: 11.55 }), 11.55); assert.equal(time.set(s, 11.55).t, 11.55); assert.equal(time.set(s, 99).t, 30);
  assert.ok(time.step <= 0.05 && time.play.seconds > 0);
});

test('readouts and formula use honest labelling and the decimal comma', () => {
  const fr = makeFormat('fr'), en = makeFormat('en');
  const read = (s, fmt) => exp.views.readout(s, { fmt, lang: fmt.lang });
  assert.equal(read({ t: 5, aid: 'none' }, fr)[1][1], '45 m');                         // exact: no sign
  assert.match(read({ t: 11.55, aid: 'level' }, fr)[1][1], /^≈ 119,99 m$|^≈ 120 m$|^≈ 1[12]\d,\d+ m$/);
  assert.match(read({ t: 3.3, aid: 'none' }, fr)[2][1], /^≈ \d+,\d+ m\/min$/);
  assert.match(read({ t: 3.3, aid: 'none' }, en)[2][1], /^≈ \d+\.\d+ m\/min$/);
  assert.equal(read({ t: 0, aid: 'none' }, fr)[2][1], '0 m/min');
  assert.equal(read({ t: 15, aid: 'none' }, fr)[3][1], 'au-dessus de 120 m'); assert.equal(read({ t: 15, aid: 'none' }, en)[3][1], 'above 120 m');
  assert.equal(read({ t: 5, aid: 'none' }, en)[3][1], 'below 120 m');
  assert.match(exp.views.formula({ t: 5, aid: 'none' }, { fmt: fr }), /h\(5\) = 45$/);
  assert.match(exp.views.formula({ t: 3.3, aid: 'none' }, { fmt: fr }), /h\(3,3\) ≈ \d+,\d+$/);
  for (const s of [{ t: 0, aid: 'none' }, { t: 7.5, aid: 'tangent' }, { t: 30, aid: 'level' }])
    assert.equal(read(s, fr).length, 4, 'a fixed number of readout slots');
  // exactly 120 m is not "above"
  assert.equal(F.sideOf(120), 0); assert.equal(F.sideOf(120.01), 1); assert.equal(F.sideOf(119), -1);
});

// ---- bilingual strings: every string a [French, English] pair, no French in the English slot and no English in the French slot
const walk = (e) => {
  const out = [];
  const add = (p, where) => out.push([p, where]);
  for (const k of ['title', 'short', 'intro', 'level', 'prereq', 'group', 'conclusion']) add(e[k], k);
  add(e.history.title, 'history.title'); add(e.history.story, 'history.story');
  for (const [id, c] of Object.entries(e.controls)) { add(c.label, id); for (const o of c.options ?? []) add(o.label, `${id}.option`); }
  for (const m of e.missions) {
    for (const k of ['prompt', 'hint', 'done', 'because', 'argument']) if (m[k] !== undefined) add(m[k], `${m.id}.${k}`);
    for (const c of m.choices ?? []) add(c, `${m.id}.choice`);
  }
  return out;
};
const FRENCH_IN_ENGLISH = /[éèêàùçôîâ]|\b(le|la|les|des|une|un|est|sont|donc|pour|avec|quand|dans|de la|du)\b/i;
const ENGLISH_IN_FRENCH = /\b(the|is|are|with|when|and|which|that|of the|this)\b/i;
test('every string is a [French, English] pair, with no language leaking into the other slot', () => {
  assert.ok(walk(exp).length > 25);
  for (const [p, where] of walk(exp)) {
    assert.ok(Array.isArray(p) && p.length === 2 && p.every((x) => typeof x === 'string' && x.trim()), `${where} must be a pair`);
    assert.ok(!FRENCH_IN_ENGLISH.test(p[1]), `${where}: French in the English slot: ${p[1]}`);
    assert.ok(!ENGLISH_IN_FRENCH.test(p[0]), `${where}: English in the French slot: ${p[0]}`);
    for (const s of p) assert.ok(!/[–—]/.test(s), `${where}: dash`);
    assert.ok(!/\d\.\d/.test(p[0]), `${where}: French uses a decimal comma`);
    assert.ok(!/\d,\d/.test(p[1].replace(/\d,\d{3}\b/g, '')), `${where}: English uses a decimal point`);
  }
});

test('the idealisation is stated: published data, then assumptions that are not measurements', () => {
  const [fr, en] = exp.history.story;
  for (const s of [fr, en]) for (const k of ['135', '120', '32', '30', '15', '75']) assert.ok(s.includes(k), `${k} in the history box`);
  assert.match(en, /Data published by the operator/); assert.match(en, /Assumptions of the exercise, not measurements/);
  assert.match(fr, /Données publiées/); assert.match(fr, /ne sont pas des mesures/);
  assert.match(exp.conclusion[1], /assumptions of the exercise, not measurements/);
  assert.equal(exp.history.source, 'https://www.londoneye.com/about-us/history/');
});

test('registered in the laboratory, mission rules hold, and the experiment is placed in the International pathway', () => {
  assert.ok(EXPERIMENTS.includes(exp)); assert.equal(resolveRef('ferris-wheel/above').index, 4);
  assert.equal(exp.missions.length, 6); assert.equal(exp.missions[0].kind, 'predict'); assert.equal(exp.missions.at(-1).kind, 'explain');
  assert.equal(exp.template, 'process'); assert.ok(groupOf(exp) in SECTION_INFO && INDEX_ORDER.includes(groupOf(exp)));
  const ib = pathways.find((p) => p.id === 'int').programmes.find((p) => p.id === 'ib');
  const stage = ib.stages.find((st) => st.ids.includes('ferris-wheel'));
  assert.ok(stage, 'a stage of the IB programme of the International pathway');
  assert.match(stage.note[1], /Indicative placement/); assert.match(stage.note[1], /not a claim/);
  assert.ok(!pathwayStages(pathways.find((p) => p.id === 'mg')).some((st) => st.ids.includes('ferris-wheel')));
});

test('topic browser: calculus and modelling experiments are not filed under arithmetic (the word "calcul" in a text is not arithmetic)', async () => {
  const {discoveryIndex} = await import('../site/js/discovery.js');
  const {labs, challenges} = await import('../site/js/content.js');
  const index = discoveryIndex({labs, challenges, chapters: []});
  for (const id of ['ferris-wheel', 'monte-carlo-integral', 'derivative', 'integral']) {
    const rec = index.find((x) => x.route === '#lab/' + id);
    assert.ok(rec, id);
    assert.ok(!rec.memberships.includes('arithmetic/calculation'), id + ' ' + rec.memberships);
    assert.ok(rec.memberships.some((k) => k.startsWith('analysis/')), id + ' ' + rec.memberships);
  }
});
