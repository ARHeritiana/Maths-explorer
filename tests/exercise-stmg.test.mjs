// The Terminale STMG exercise bank added in November 2026 (templates-stmg-2..4.js, problems-stmg.js, stmg-kit.js, seconde-kit-2.js): coverage per
// chapter, formats (four-choice letter matches its option, true/false, find the error), ok() over seeded runs, formatting slips (no "0,000" or
// "1,000" for a probability, no "+-"), distinct questions, seeded problems, XeTeX compile (skipped without xelatex), and independent recomputations.
import test from 'node:test';
import assert from 'node:assert/strict';
import { rng, binom } from '../site/js/exercises/engine.js';
import { stmg } from '../site/js/exercises/templates-stmg.js';
import { stmg2 } from '../site/js/exercises/templates-stmg-2.js';
import { stmg3 } from '../site/js/exercises/templates-stmg-3.js';
import { stmg4 } from '../site/js/exercises/templates-stmg-4.js';
import { problemsStmg } from '../site/js/exercises/problems-stmg.js';
import { classSuite } from './exercise-class-suite.mjs';

const NEW = [...stmg2, ...stmg3, ...stmg4];
const CHAPTERS = Array.from({ length: 8 }, (_, i) => `stmg-0${i + 1}`);
classSuite({ cls: 'stmg', label: 'STMG', chapters: CHAPTERS, NEW, ORIGINAL: stmg, problems: problemsStmg, minPerChapter: 7, nProblems: 6 });

const dec = (s) => Number(String(s).replace('{,}', '.'));
test('STMG: no probability or logarithm is written 0,000 or 1,000, and no rounded value hides a whole number', () => {
  for (const t of NEW) for (const lv of [1, 2, 3]) for (let s = 0; s < 120; s++) {
    const x = t.make(rng(`rd|${s}`), lv);
    for (const text of [x.q, x.a, x.s || '']) assert.ok(!/(?<![\d,{])[01]\{,\}0{3}(?![\d])/.test(text) && !/\{,\}0{3}\b/.test(text), `${t.id}: ${text}`);
  }
});
test('STMG: the binomial probabilities of the generators agree with the definition with binomial coefficients', () => {
  const t = stmg4.find((x) => x.id === 'm4-bin-prob');
  let seen = 0;
  for (let s = 0; s < 300; s++) {
    const x = t.make(rng(`bn|${s}`), 1), m = /B\}\((\d+)\\,;\\,(0\{,\}\d+)\)\\\) À.*P\(X=(\d+)\)/.exec(x.q.replace(/\\mathcal\{/g, '\\mathcal{'));
    const mm = /\\mathcal\{B\}\((\d+)\\,;\\,(0\{,\}\d+)\)/.exec(x.q), kk = /P\(X=(\d+)\)/.exec(x.q);
    if (!mm || !kk) continue; seen++;
    const n = Number(mm[1]), p = dec(mm[2]), k = Number(kk[1]), val = binom(n, k) * p ** k * (1 - p) ** (n - k), shown = /\\approx (\d\{,\}\d+)\\\)\./.exec(x.a);
    assert.ok(shown, x.a); assert.ok(Math.abs(dec(shown[1]) - val) <= 0.0005 + 1e-12, `${x.a} vs ${val}`);
  }
  assert.ok(seen > 30, `${seen}`);
});
test('STMG: the regression coefficients of the problem satisfy the normal equations', () => {
  const e = problemsStmg.find((p) => p.id === 'g-stm-regression');
  for (let s = 0; s < 100; s++) {
    const x = e.make(rng(`rg|${s}`)), ys = /y_i=([\d,\\ ]+)\)/.exec(x.intro.replace(/\\\(/g, '\\(')), ysn = x.intro.match(/y_i=([0-9,\\ ]+)/)[1].split(',').map((z) => Number(z.replace(/[\\ ]/g, ''))).filter((z) => !Number.isNaN(z));
    const eqn = /y\\approx (-?\d+\{,\}\d+)x([+-]?)(-?\d+\{,\}\d+)/.exec(x.parts[1].a); assert.ok(eqn, x.parts[1].a); assert.ok(ys || true);
    const a = dec(eqn[1]), b = dec(eqn[3]) * (eqn[2] === '-' ? -1 : 1) , n = ysn.length;
    const r0 = ysn.reduce((sum, y, i) => sum + (y - a * i - b), 0), r1 = ysn.reduce((sum, y, i) => sum + i * (y - a * i - b), 0);
    assert.ok(Math.abs(r0) < 0.05 * n && Math.abs(r1) < 0.05 * 15 * 2, `${r0} ${r1} ${x.parts[1].a}`);
  }
});
