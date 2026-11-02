// Audit of the exercise bank by two methods the bank's own test (exercise-bank.test.mjs) does not use.
// 1. Read-back: the statement and answer as the learner sees them are parsed back into numbers and checked exactly. The bank's `ok()`
//    recomputes from the generator's own variables, so a slip in the printed form (a sign, a coefficient) would pass it.
// 2. Capacity: how many distinct questions a generator gives at one level. "Any seed gives a new exercise" is false when the parameter
//    space is small; the ratchet below keeps the count of small generators from growing and states the exact size where it can be derived.
import test from 'node:test';
import assert from 'node:assert/strict';
import { rng } from '../site/js/exercises/engine.js';
import { TEMPLATES } from '../site/js/exercises/bank.js';

const byId = (id) => TEMPLATES.find((t) => t.id === id);

// --- 1. read-back ---------------------------------------------------------------------------------------------------------
// Coefficients [a, b, c] of the polynomial printed by polyTex, e.g. "-2x^{2}+16x+32".
function readPoly(s) {
  const out = { a: 0, b: 0, c: 0 };
  for (const m of s.matchAll(/([+-]?)(\d*)(x\^\{2\}|x)?/g)) {
    if (!m[0]) continue;
    const k = (m[1] === '-' ? -1 : 1) * (m[2] === '' ? (m[3] ? 1 : 0) : Number(m[2]));
    if (m[3] === 'x^{2}') out.a += k; else if (m[3] === 'x') out.b += k; else out.c += k;
  }
  return out;
}
// A rational such as -4, \dfrac{3}{2} or -\dfrac{3}{2}, as [numerator, denominator].
const readRational = (s) => {
  const m = /^(-?)(?:(\d+)|\\dfrac\{(\d+)\}\{(\d+)\})$/.exec(s.trim());
  assert.ok(m, `unreadable number: ${s}`);
  const sign = m[1] ? -1 : 1;
  return m[2] !== undefined ? [sign * Number(m[2]), 1] : [sign * Number(m[3]), Number(m[4])];
};

test('p-quad-roots, read back from the printed text: discriminant, every listed root, and the sign rule', () => {
  const t = byId('p-quad-roots');
  const seen = { two: 0, double: 0, none: 0 };
  for (const level of [1, 2, 3]) for (let s = 0; s < 1500; s++) {
    const x = t.make(rng(`audit|${s}`), level);
    const poly = /\\\(([^]*?)=0\\\)\./.exec(x.q)?.[1];
    assert.ok(poly, `statement not readable: ${x.q}`);
    const { a, b, c } = readPoly(poly);
    assert.ok(a !== 0, `leading coefficient read as 0: ${x.q}`);
    const delta = Number(/\\Delta=(-?\d+)/.exec(x.a)[1]);
    assert.equal(delta, b * b - 4 * a * c, `printed discriminant disagrees with the printed polynomial: ${x.q} => ${x.a}`);
    const set = /S=\\\{([^]*)\\\}\\?\)?$|S=\\left\\\{([^]*)\\right\\\}/.exec(x.a);
    if (/S=\\varnothing/.test(x.a)) {
      assert.ok(delta < 0, x.a); seen.none++;
    } else {
      const body = (set[1] ?? set[2]).replace(/\\right$/, '');
      const roots = body.split('\\,;\\,').map(readRational);
      assert.equal(roots.length, delta > 0 ? 2 : 1, x.a);
      assert.equal(delta === 0 ? 1 : delta > 0 ? 2 : -1, roots.length, 'one root iff delta = 0, two iff delta > 0');
      for (const [n, d] of roots) assert.equal(a * n * n + b * n * d + c * d * d, 0, `${n}/${d} is not a root of ${poly}`);   // exact, no division
      if (roots.length === 2) assert.ok(roots[0][0] * roots[1][1] < roots[1][0] * roots[0][1], 'roots listed in increasing order');
      seen[roots.length === 2 ? 'two' : 'double']++;
    }
  }
  assert.ok(seen.two > 500 && seen.double > 100 && seen.none > 100, JSON.stringify(seen));
});

// --- 2. capacity ----------------------------------------------------------------------------------------------------------
const SEEDS = 5000;
const distinct = (t, level) => { const set = new Set(); for (let s = 0; s < SEEDS; s++) set.add(t.make(rng(`cap|${s}`), level).q); return set.size; };

test('capacity: the size of a parameter space that can be counted by hand is reached exactly', () => {
  // Level 1 of p-quad-roots: a = 1, an unordered pair of distinct roots in [-6, 6]: C(13, 2) = 78 equations.
  assert.equal(distinct(byId('p-quad-roots'), 1), 78);
});

test('capacity ratchet: generator-and-level pairs with few distinct questions must not become more numerous', () => {
  let pairs = 0, small = 0, tiny = [];
  for (const t of TEMPLATES) for (const level of t.levels || [1, 2, 3]) {
    pairs++;
    const n = distinct(t, level);
    if (n < 100) small++;
    if (n < 10) tiny.push(`${t.id}/${level}:${n}`);
  }
  // Measured on 1 November 2026 with 5000 seeds: 203 pairs, 52 under 100 questions, 10 under 10; after the widening of the same day
  // (t-counting, s-percent, m-cm, p-trig-exact, p-radians, m-exp-evolution, t-trig-deriv, t-ln-deriv, e-modulus-arg): 49 and 0.
  // 2 November 2026, Seconde completed (49 new generators, s-prime-factors, s-expand, s-factor, s-percent widened): 363 pairs, 42 and 0.
  // Lower the bounds when a generator is widened.
  assert.ok(pairs >= 363, `pairs: ${pairs}`);
  assert.ok(small <= SMALL_BOUND, `${small} pairs give fewer than 100 distinct questions (bound ${SMALL_BOUND})`);
  assert.ok(tiny.length <= TINY_BOUND, `${tiny.length} pairs give fewer than 10: ${tiny.join(', ')} (bound ${TINY_BOUND})`);
});
const SMALL_BOUND = 42, TINY_BOUND = 0;
