// The Olympiad strategies (site/js/olympiad-content.js, olympiad.js, olympiad-widgets.js): complete bilingual content,
// problems with level, hints and solution, balanced maths, no dashes in copy, links that resolve, and the figures' models
// checked against the mathematics they show (the snowball theorem, the inscribed angle, rectangle and square).
import test from 'node:test';
import assert from 'node:assert/strict';
import { STRATEGIES, LEVELS } from '../site/js/olympiad-content.js';
import { nearest, untargeted, angleAt, rectangle } from '../site/js/olympiad-widgets.js';
import { resolveRef } from '../site/js/lab/registry.js';
import { CHALLENGES } from '../site/js/challenges/registry.js';

const pair = (x) => Array.isArray(x) && x.length === 2 && x.every((s) => typeof s === 'string' && s.trim().length > 1);
const balanced = (s) => (s.match(/\\\(/g) || []).length === (s.match(/\\\)/g) || []).length && (s.match(/\\\[/g) || []).length === (s.match(/\\\]/g) || []).length;
const texts = (s) => [s.title, s.hook, s.theme, ...s.idea, s.example.q, s.example.s, ...s.problems.flatMap((p) => [p.title, p.q, p.s, ...p.hints, ...(p.source ? [p.source] : [])])];

test('ten strategies, each complete in French and English', () => {
  assert.equal(STRATEGIES.length, 10);
  assert.equal(new Set(STRATEGIES.map((s) => s.id)).size, 10);
  for (const s of STRATEGIES) {
    for (const x of texts(s)) {
      assert.ok(pair(x), `${s.id}: missing text in one language`);
      for (const t of x) {
        assert.ok(balanced(t), `${s.id}: unbalanced maths in ${t.slice(0, 60)}`);
        assert.ok(!/[–—]/.test(t), `${s.id}: dash in copy: ${t.slice(0, 60)}`);
        assert.ok(!/undefined|NaN/.test(t), s.id);
      }
    }
  }
});

test('every strategy has a ladder of problems with hints and solutions, from national to international level', () => {
  for (const s of STRATEGIES) {
    assert.ok(s.problems.length >= 5, s.id);
    const levels = new Set(s.problems.map((p) => p.level));
    for (const l of ['mg', 'pan', 'intl']) assert.ok(levels.has(l), `${s.id}: no ${l} problem`);
    for (const p of s.problems) { assert.ok(LEVELS[p.level], s.id); assert.ok(p.hints.length >= 1, `${s.id}: ${p.title[0]} has no hint`); }
    // the ladder climbs: no international problem before a national one
    const order = s.problems.map((p) => ['mg', 'pan', 'intl'].indexOf(p.level));
    assert.deepEqual(order, [...order].sort((a, b) => a - b), `${s.id}: problems out of level order`);
  }
});

test('every link names an existing experiment mission or challenge, and every figure exists', () => {
  const ids = new Set(CHALLENGES.map((c) => (c.card || c).id));
  for (const s of STRATEGIES) {
    for (const [kind, ref] of s.links) {
      if (kind === 'lab') assert.ok(resolveRef(ref)?.explicit, `${s.id}: lab ${ref}`);
      else { assert.equal(kind, 'challenge'); assert.ok(ids.has(ref), `${s.id}: challenge ${ref}`); }
    }
    if (s.widget) assert.ok(['nearest', 'inscribed', 'amgm'].includes(s.widget), s.id);
  }
});

test('figures: an odd crowd always leaves someone dry; the inscribed angle is constant and half the central angle; the square wins', () => {
  // seeded pseudo-random points, all distances distinct with probability one
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let k = 0; k < 300; k++) {
    const n = 3 + 2 * Math.floor(rnd() * 5), pts = Array.from({ length: n }, () => [rnd() * 600, rnd() * 400]);
    const t = nearest(pts);
    assert.ok(t.every((j, i) => j !== i && j >= 0));
    assert.ok(untargeted(pts).length >= 1, `odd crowd of ${n} with nobody dry`);
  }
  const C = [0, 0], at = (u) => [Math.cos(u), Math.sin(u)], A = at(3.6), B = at(5.8);
  const central = angleAt(C, A, B), values = [0.5, 1.2, 2.1, 2.9].map((u) => angleAt(at(u), A, B));
  for (const v of values) assert.ok(Math.abs(v - central / 2) < 1e-9, `${v} != ${central / 2}`);
  for (let w = 0.5; w <= 9.5; w += 0.1) { const r = rectangle(20, w); assert.ok(r.area <= r.square + 1e-12); assert.ok(Math.abs(r.square - r.area - (w - 5) ** 2) < 1e-9); }
});

test('the Olympiad pages render every strategy in both languages', async () => {
  const { olympiadPage, isOlympiadRoute } = await import('../site/js/olympiad.js');
  assert.ok(isOlympiadRoute(undefined) && isOlympiadRoute('invariants') && !isOlympiadRoute('nope'));
  for (const L of [0, 1]) {
    const t = (x) => x[L];
    const index = olympiadPage(undefined, t);
    for (const s of STRATEGIES) assert.ok(index.includes(`#olympiad/${s.id}`));
    for (const s of STRATEGIES) {
      const html = olympiadPage(s.id, t);
      assert.ok(!/undefined|NaN/.test(html), s.id);
      assert.equal((html.match(/class="olymp-problem /g) || []).length, s.problems.length);
    }
  }
});
