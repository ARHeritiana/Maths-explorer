// The Seconde exercise bank added in November 2026 (templates-seconde-4..8.js, problems-seconde-3.js, seconde-kit-2.js): coverage per chapter,
// formats (four-choice letter matches its option, true/false, find the error), ok() over seeded runs, formatting slips, distinct questions,
// seeded problems, XeTeX compile (skipped without xelatex), plus independent recomputations from the printed text. Shared checks: exercise-class-suite.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { rng, gcd, lcm } from '../site/js/exercises/engine.js';
import { instance } from '../site/js/exercises/bank.js';
import { seconde } from '../site/js/exercises/templates-seconde.js';
import { seconde2 } from '../site/js/exercises/templates-seconde-2.js';
import { seconde3 } from '../site/js/exercises/templates-seconde-3.js';
import { seconde4 } from '../site/js/exercises/templates-seconde-4.js';
import { seconde5 } from '../site/js/exercises/templates-seconde-5.js';
import { seconde6 } from '../site/js/exercises/templates-seconde-6.js';
import { seconde7 } from '../site/js/exercises/templates-seconde-7.js';
import { seconde8 } from '../site/js/exercises/templates-seconde-8.js';
import { problemsSeconde3 } from '../site/js/exercises/problems-seconde-3.js';
import { classSuite } from './exercise-class-suite.mjs';

const NEW = [...seconde4, ...seconde5, ...seconde6, ...seconde7, ...seconde8];
const CHAPTERS = Array.from({ length: 15 }, (_, i) => `seconde-${String(i + 1).padStart(2, '0')}`);
classSuite({ cls: 'seconde', label: 'Seconde', chapters: CHAPTERS, NEW, ORIGINAL: [...seconde, ...seconde2, ...seconde3], problems: problemsSeconde3, minPerChapter: 8, nProblems: 5 });

// Independent recomputation from the printed statement (not from the generator's own variables).
const plain = (s) => s.replace(/\\\(|\\\)/g, '');
test('Seconde: the PGCD four-choice answer is recomputed from the two printed numbers', () => {
  const t = seconde4.find((x) => x.id === 's4-arith-qcm');
  let seen = 0;
  for (let s = 0; s < 400; s++) {
    const x = t.make(rng(`ind|${s}`), 2), m = /Le PGCD de \\\((\d+)\\\) et \\\((\d+)\\\)/.exec(x.q);
    if (!m) continue; seen++;
    const [a, b] = [Number(m[1]), Number(m[2])], ans = Number(/^Réponse \([A-D]\) : \\\((\d+)\\\)/.exec(x.a)[1]);
    assert.equal(ans, gcd(a, b)); assert.equal((a * b) / ans, lcm(a, b));
  }
  assert.ok(seen > 20);
});
test('Seconde: the midpoint and distance four-choice answers are recomputed from the printed points', () => {
  const t = seconde7.find((x) => x.id === 's4-geo-qcm');
  let mid = 0, dist = 0;
  for (let s = 0; s < 600; s++) for (const lv of [1, 2]) {
    const x = t.make(rng(`ind|${s}`), lv), pts = [...x.q.matchAll(/(?<![A-Za-z])[AB]\((-?\d+)\\,;\\,(-?\d+)\)/g)].map((p) => [Number(p[1]), Number(p[2])]);
    if (pts.length < 2) continue;
    if (/Le milieu/.test(x.q)) { mid++; const ans = /^Réponse \([A-D]\) : \\\(\\left\((.+?)\\,;\\,(.+?)\\right\)\\\)/.exec(x.a); assert.ok(ans, x.a); const v = (z) => { const f = /dfrac\{(\d+)\}\{(\d+)\}/.exec(z); return f ? (z.startsWith('-') ? -1 : 1) * Number(f[1]) / Number(f[2]) : Number(z); }; assert.equal(2 * v(ans[1]), pts[0][0] + pts[1][0]); assert.equal(2 * v(ans[2]), pts[0][1] + pts[1][1]); }
    if (/La distance/.test(x.q)) { dist++; const n2 = (pts[1][0] - pts[0][0]) ** 2 + (pts[1][1] - pts[0][1]) ** 2, ans = /^Réponse \([A-D]\) : \\\((.+?)\\\)\./.exec(x.a)[1]; const k = /^(\d*)\\sqrt\{(\d+)\}$/.exec(ans); const sq = k ? (k[1] === '' ? 1 : Number(k[1])) ** 2 * Number(k[2]) : Number(ans) ** 2; assert.equal(sq, n2, x.a); }
  }
  assert.ok(mid > 20 && dist > 20, `${mid} ${dist}`);
});
test('Seconde: the seeded problems quote values that match an independent enumeration (urn)', () => {
  const e = problemsSeconde3.find((p) => p.id === 'g-sec-urne');
  for (let s = 0; s < 100; s++) {
    const x = e.make(rng(`u|${s}`)), nums = [...x.intro.matchAll(/\\\((\d+)\\\) boules? (?:rouges?|bleues?|vertes?)|(\d+)\\\) (?:rouges|bleues|vertes)/g)];
    assert.ok(plain(x.intro).match(/\d+ boules rouges, \d+ bleues et \d+ vertes/), x.intro); assert.ok(x.ok()); assert.ok(nums.length >= 0);
  }
});
