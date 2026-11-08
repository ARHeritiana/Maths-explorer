// The Terminale exercise bank (templates-terminale-2..5.js, problems-terminale.js, terminale-kit.js): coverage per chapter, the formats
// (four-choice question, true/false, find the error), the letter of every four-choice answer, formatting, variety, and a XeTeX
// compile of every new generator (skipped when xelatex is not installed).
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { rng } from '../site/js/exercises/engine.js';
import { TEMPLATES, AUTHORED, instance } from '../site/js/exercises/bank.js';
import { terminale } from '../site/js/exercises/templates-terminale.js';
import { terminale2 } from '../site/js/exercises/templates-terminale-2.js';
import { terminale3 } from '../site/js/exercises/templates-terminale-3.js';
import { terminale4 } from '../site/js/exercises/templates-terminale-4.js';
import { terminale5 } from '../site/js/exercises/templates-terminale-5.js';
import { problemsTerminale } from '../site/js/exercises/problems-terminale.js';
import { tex } from '../site/js/exercises/export.js';

const NEW = [...terminale2, ...terminale3, ...terminale4, ...terminale5], ALL = TEMPLATES.filter((t) => t.cls === 'terminale');
const CHAPTERS = Array.from({ length: 14 }, (_, i) => `terminale-${String(i + 1).padStart(2, '0')}`);
const SEEDS = 200;
const SLIPS = [/[+-]1[xyzn](?![a-z_^{])/, /\+-|--|-\+|\+\+/, /x\+0|y\+0|x-0|(?<!\})\^\{1\}/, /(?<![\d.,{])0[xyz]\b/, /undefined|NaN|Infinity/, /—|–|−/, / {2,}/, /\\\)\\\(/, /[\x00-\x1f]/, /\\dfrac\{\\dfrac/, /\\mathrm\{e\}\^\{1\}/, /\\dfrac\{-?\d+\}\{1\}/];

test('Terminale: at least eight generators per chapter, three level-3 items and two starters per chapter, fourteen seeded problems', () => {
  assert.equal(terminale.length, 20, 'the original generators are untouched');
  for (const c of CHAPTERS) {
    const own = ALL.filter((t) => t.chapter === c);
    assert.ok(own.length >= 8, `${c}: ${own.length} generators`);
    assert.ok(own.filter((t) => (t.levels || [1, 2, 3]).includes(3) && NEW.includes(t)).length >= 3, `${c}: level-3 exam-style generators`);
    assert.ok(own.filter((t) => t.fast).length >= 2, `${c}: starter-suitable generators`);
    assert.ok(NEW.filter((t) => t.chapter === c).some((t) => /-qcm$/.test(t.id)) && NEW.some((t) => t.chapter === c && /-tf$/.test(t.id)) && NEW.some((t) => t.chapter === c && /-error$/.test(t.id)), `${c}: a QCM, a true/false and a find-the-error generator`);
  }
  assert.equal(problemsTerminale.length, 14);
  assert.ok(CHAPTERS.every((c) => problemsTerminale.some((p) => p.chapters.includes(c))), 'one seeded problem per chapter');
  assert.equal(new Set(AUTHORED.map((e) => e.id)).size, AUTHORED.length);
});

test('Terminale new generators: ok() true, deterministic, no formatting slip, at least 40 distinct questions per level over 200 seeds', () => {
  for (const t of NEW) for (const level of t.levels || [1, 2, 3]) {
    const seen = new Set();
    for (let s = 0; s < SEEDS; s++) {
      const x = t.make(rng(`prem|${s}`), level), y = t.make(rng(`prem|${s}`), level);
      assert.equal(x.q, y.q, `${t.id} not deterministic`); assert.equal(x.a, y.a);
      assert.ok(x.ok(), `${t.id} level ${level} seed ${s}: ${x.q} => ${x.a}`);
      for (const text of [x.q, x.a, x.s || '']) for (const re of SLIPS) assert.ok(!re.test(text), `${t.id} level ${level} seed ${s} slip ${re}: ${text}`);
      seen.add(x.q);
    }
    assert.ok(seen.size >= 40, `${t.id} level ${level}: only ${seen.size} distinct questions`);
  }
});

test('Terminale formats: four-choice letter matches the option, true/false verdict, find-the-error names a line', () => {
  for (const t of NEW.filter((x) => /-qcm$/.test(x.id))) for (const level of t.levels || [1, 2, 3]) for (let s = 0; s < 60; s++) {
    const x = t.make(rng(`fmt|${s}`), level);
    assert.match(x.q, /^QCM, une seule réponse exacte\./);
    const opts = [...x.q.matchAll(/\(([ABCD])\) (.+?)(?= ; \([ABCD]\) |\.$)/g)].map((m) => [m[1], m[2]]);
    assert.equal(opts.length, 4, x.q); assert.deepEqual(opts.map((o) => o[0]), ['A', 'B', 'C', 'D']);
    assert.equal(new Set(opts.map((o) => o[1])).size, 4, 'four different options');
    const ans = /^Réponse \(([ABCD])\) : (.+?\\\))\./.exec(x.a);
    assert.ok(ans, x.a);
    assert.ok(x.a.startsWith(`Réponse (${ans[1]}) : ${opts.find((o) => o[0] === ans[1])[1]}.`), `${t.id}: the letter does not point at the stated option`);
    assert.match(x.a, /Erreurs des autres choix : /);
  }
  for (const t of NEW.filter((x) => /-tf$/.test(x.id))) for (const level of t.levels || [1, 2, 3]) for (let s = 0; s < 40; s++) {
    const x = t.make(rng(`tf|${s}`), level);
    assert.match(x.q, /^Vrai ou faux \? Justifier\. « .+ »$/); assert.match(x.a, /^(Vrai|Faux)\. .{10,}/);
  }
  for (const t of NEW.filter((x) => /-error$/.test(x.id))) for (const level of t.levels || [1, 2, 3]) for (let s = 0; s < 40; s++) {
    const x = t.make(rng(`err|${s}`), level);
    assert.match(x.q, /\(L1\) .*\(L2\) /s); assert.match(x.a, /^La ligne \(L[1-4]\) est fausse : .+ Correction : .+ Résultat juste : /s);
    const k = Number(/^La ligne \(L(\d)\)/.exec(x.a)[1]); assert.ok(x.q.includes(`(L${k}) `), 'the named line exists');
  }
});

test('Terminale problems: numbers recomputed, hints, formatting, at least 40 distinct versions', () => {
  for (const e of problemsTerminale) {
    assert.ok(e.parts === undefined && typeof e.make === 'function' && e.minutes > 0 && e.title);
    const intros = new Set();
    for (let s = 0; s < 300; s++) {
      const x = e.make(rng(`prob|${s}`)), y = e.make(rng(`prob|${s}`));
      assert.deepEqual(x.parts, y.parts); assert.ok(x.ok(), `${e.id} seed ${s}`);
      for (const text of [x.intro, ...x.parts.flatMap((p) => [p.q, p.a, p.hint || ''])]) for (const re of SLIPS) assert.ok(!re.test(text), `${e.id} slip ${re}: ${text}`);
      intros.add(x.intro);
    }
    assert.ok(intros.size >= 40, `${e.id}: ${intros.size} versions`);
    assert.ok(e.make(rng('h')).parts.some((p) => p.hint), `${e.id}: a hint`);
  }
});

let xelatex = true;
try { execFileSync('xelatex', ['--version'], { stdio: 'ignore' }); } catch { xelatex = false; }
test('xelatex compiles every new Terminale generator at every level and every problem', { skip: !xelatex && 'xelatex not installed', timeout: 600000 }, () => {
  const dir = mkdtempSync(join(tmpdir(), 'mx-prem-'));
  try {
    const exercises = [];
    for (const t of NEW) for (const lv of t.levels || [1, 2, 3]) for (let s = 0; s < 3; s++) { const it = instance(t, lv, `x${s}`); exercises.push({ title: `${t.id} niveau ${lv}`, intro: '', minutes: 1, parts: [{ q: it.q, a: it.a, s: it.s, level: lv, w: 1 }] }); }
    for (const e of problemsTerminale) for (let s = 0; s < 3; s++) { const x = e.make(rng(`x${s}`)); exercises.push({ title: e.title, intro: x.intro, minutes: 1, parts: x.parts.map((p) => ({ q: p.q, a: p.a, s: '', level: 1, w: p.w || 1 })) }); }
    // own minimal XeTeX preamble: the sheet preamble of export.js is the one of the whole bank (checked by exercise-latex.test.mjs)
    const body = exercises.flatMap((e) => [`\\subsection*{${tex(e.title.replace(/_/g, ' '))}}`, e.intro ? `${tex(e.intro)}\\par` : '', '\\begin{enumerate}', ...e.parts.map((q) => `\\item ${tex(q.q)}\\par\\smallskip ${tex(q.a)}${q.s ? `\\par ${tex(q.s)}` : ''}`), '\\end{enumerate}']).join('\n');
    writeFileSync(join(dir, 'terminale.tex'), `\\documentclass[11pt,a4paper]{article}\n\\usepackage{fontspec}\n\\usepackage{amsmath,amssymb}\n\\usepackage[french]{babel}\n\\usepackage{enumitem}\n\\usepackage[a4paper,margin=2cm]{geometry}\n\\begin{document}\n${body}\n\\end{document}\n`);
    try { execFileSync('xelatex', ['-interaction=nonstopmode', '-halt-on-error', 'terminale.tex'], { cwd: dir, stdio: 'pipe', timeout: 500000, maxBuffer: 64 * 1024 * 1024 }); }
    catch (error) { const log = readFileSync(join(dir, 'terminale.log'), 'utf8'); assert.fail((log.match(/^! [\s\S]*?\nl\.\d+.*$/m) || [`status ${error.status}; ${log.slice(-400)}`])[0]); }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
