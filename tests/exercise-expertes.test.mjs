// The Maths expertes exercise bank added in November 2026 (templates-expertes-2..5.js, problems-expertes.js, expertes-kit.js, seconde-kit-2.js):
// coverage per chapter, formats (four-choice letter matches its option, true/false, find the error), ok() over seeded runs, formatting slips
// (no 1i, 0i, +-, e^1...), distinct questions, seeded problems, XeTeX compile (skipped without xelatex), and recomputations from the printed text.
import test from 'node:test';
import assert from 'node:assert/strict';
import { rng, gcd } from '../site/js/exercises/engine.js';
import { expertes } from '../site/js/exercises/templates-expertes.js';
import { expertes2 } from '../site/js/exercises/templates-expertes-2.js';
import { expertes3 } from '../site/js/exercises/templates-expertes-3.js';
import { expertes4 } from '../site/js/exercises/templates-expertes-4.js';
import { expertes5 } from '../site/js/exercises/templates-expertes-5.js';
import { problemsExpertes } from '../site/js/exercises/problems-expertes.js';
import { classSuite } from './exercise-class-suite.mjs';

const NEW = [...expertes2, ...expertes3, ...expertes4, ...expertes5];
const CHAPTERS = Array.from({ length: 11 }, (_, i) => `expertes-${String(i + 1).padStart(2, '0')}`);
classSuite({ cls: 'expertes', label: 'Expertes', chapters: CHAPTERS, NEW, ORIGINAL: expertes, problems: problemsExpertes, minPerChapter: 7, nProblems: 6 });

// printed complex number "a+bi" -> [a, b]
const parseCx = (s) => { const t = s.replace(/\s/g, ''); const m = /([+-]?\d*)i/.exec(t); const im = m ? (m[1] === '' || m[1] === '+' ? 1 : m[1] === '-' ? -1 : Number(m[1])) : 0; const rest = m ? t.replace(m[0], '') : t; if (rest !== '' && !/^-?\d+$/.test(rest)) return null; return [rest === '' ? 0 : Number(rest), im]; };

test('Expertes: the product four-choice answer is recomputed from the two printed complex numbers', () => {
  const t = expertes2.find((x) => x.id === 'e2-cx-qcm');
  let seen = 0;
  for (let s = 0; s < 500; s++) {
    const x = t.make(rng(`ind|${s}`), 1), m = /Le produit \\\(\(([^)]*)\)\(([^)]*)\)\\\) vaut/.exec(x.q);
    if (!m) continue; seen++;
    const z = parseCx(m[1]), w = parseCx(m[2]), ans = /^Réponse \([A-D]\) : \\\((.+?)\\\)\./.exec(x.a); assert.ok(z && w && ans, `${m[1]} ${m[2]} ${x.a}`);
    const got = parseCx(ans[1]); assert.deepEqual(got, [z[0] * w[0] - z[1] * w[1], z[0] * w[1] + z[1] * w[0]], x.q);
  }
  assert.ok(seen > 30, `${seen}`);
});
test('Expertes: the remainder four-choice answer is recomputed from the printed power and modulus (BigInt)', () => {
  const t = expertes4.find((x) => x.id === 'e4-cong-qcm');
  let seen = 0;
  for (let s = 0; s < 800; s++) {
    const x = t.make(rng(`rm|${s}`), 1), m = /Le reste de la division de \\\((\d+)\^\{(\d+)\}\\\) par \\\((\d+)\\\)/.exec(x.q);
    if (!m) continue; seen++;
    const want = (BigInt(m[1]) ** BigInt(m[2])) % BigInt(m[3]), ans = /^Réponse \([A-D]\) : \\\((\d+)\\\)/.exec(x.a);
    assert.equal(BigInt(ans[1]), want, x.q);
  }
  assert.ok(seen > 20, `${seen}`);
});
test('Expertes: the Euclid generator prints divisions that are all true and end on the PGCD', () => {
  const t = expertes4.find((x) => x.id === 'e4-gcd-euclid');
  for (let s = 0; s < 200; s++) {
    const x = t.make(rng(`eu|${s}`), 2), divs = [...x.a.matchAll(/\\\((\d+)=(\d+)\\times (\d+)\+(\d+)\\\)/g)].map((m) => m.slice(1).map(Number));
    assert.ok(divs.length >= 1);
    for (const [a, b, q, r] of divs) { assert.equal(a, b * q + r); assert.ok(r < b); }
    const g = /PGCD\}\(\d+,\d+\)=(\d+)/.exec(x.a); assert.ok(g); const first = divs[0]; assert.equal(Number(g[1]), gcd(first[0], first[1]));
  }
});
test('Expertes: matrix products printed by the find-the-error generator match a recomputation of the true product', () => {
  const t = expertes5.find((x) => x.id === 'e5-mat-error');
  for (let s = 0; s < 150; s++) {
    const x = t.make(rng(`me|${s}`), 1), nums = [...x.q.matchAll(/-?\d+/g)].map((m) => Number(m[0]));
    const entries = /Résultat juste : \\\(AB=\\begin\{pmatrix\}(-?\d+)&(-?\d+)\\\\(-?\d+)&(-?\d+)\\end\{pmatrix\}\\\)/.exec(x.a);
    assert.ok(entries, x.a);
    const mats = [...x.q.matchAll(/\\begin\{pmatrix\}(-?\d+)&(-?\d+)\\\\(-?\d+)&(-?\d+)\\end\{pmatrix\}/g)].map((m) => m.slice(1).map(Number));
    const [A, B] = mats; assert.ok(A && B && nums.length);
    assert.deepEqual(entries.slice(1).map(Number), [A[0] * B[0] + A[1] * B[2], A[0] * B[1] + A[1] * B[3], A[2] * B[0] + A[3] * B[2], A[2] * B[1] + A[3] * B[3]].map((v) => v + 0));
  }
});
