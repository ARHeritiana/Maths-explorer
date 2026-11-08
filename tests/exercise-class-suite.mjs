// Shared checks of the Seconde, STMG and Maths expertes banks (exercise-seconde / exercise-stmg / exercise-expertes .test.mjs): coverage per
// chapter, the formats (four-choice letter matches its option, true/false, find the error), ok() over seeded runs, formatting slips,
// distinct questions, seeded problems, and an XeTeX compile of every new generator (skipped without xelatex). Not a test file itself.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { rng } from '../site/js/exercises/engine.js';
import { TEMPLATES, AUTHORED, instance } from '../site/js/exercises/bank.js';
import { tex } from '../site/js/exercises/export.js';

export const SLIPS = [/[+-]1[xyzn](?![a-z_^{])/, /\+-|--|-\+|\+\+/, /x\+0|y\+0|x-0|(?<!\})\^\{1\}/, /(?<![\d.,{])0[xyz]\b/, /undefined|NaN|Infinity/, /—|–|−/, / {2,}/, /\\\)\\\(/, /[\x00-\x1f]/, /\\dfrac\{\\dfrac/, /\\mathrm\{e\}\^\{1\}/, /\\dfrac\{-?\d+\}\{1\}/, /(?<![\d.,{])0{3,}\b/, /(?<![\d.,{])[01]i\b/];
let xelatex = true;
try { execFileSync('xelatex', ['--version'], { stdio: 'ignore' }); } catch { xelatex = false; }

export function classSuite({ cls, label, chapters, NEW, ORIGINAL, problems, minPerChapter, level3 = 2, distinct = 30, nProblems }) {
  const ALL = TEMPLATES.filter((t) => t.cls === cls);
  test(`${label}: at least ${minPerChapter} generators per chapter, level-3 items, starters, a four-choice, a true/false and a find-the-error generator per chapter`, () => {
    for (const t of ORIGINAL) assert.ok(ALL.includes(t), `${t.id}: original generator kept`);
    for (const c of chapters) {
      const own = ALL.filter((t) => t.chapter === c);
      assert.ok(own.length >= minPerChapter, `${c}: ${own.length} generators`);
      assert.ok(own.filter((t) => (t.levels || [1, 2, 3]).includes(3) && NEW.includes(t)).length >= level3, `${c}: level-3 generators`);
      assert.ok(own.filter((t) => t.fast).length >= 2, `${c}: starter-suitable generators`);
      for (const k of ['qcm', 'tf', 'error']) assert.ok(NEW.some((t) => t.chapter === c && t.id.endsWith(`-${k}`)), `${c}: a ${k} generator`);
    }
    assert.equal(new Set(TEMPLATES.map((t) => t.id)).size, TEMPLATES.length, 'unique ids');
    assert.ok(problems.length >= nProblems, `${problems.length} seeded problems`);
    assert.equal(new Set(AUTHORED.map((e) => e.id)).size, AUTHORED.length);
  });

  test(`${label} new generators: ok() true, deterministic, no formatting slip, ${distinct}+ distinct questions per level`, () => {
    for (const t of NEW) for (const level of t.levels || [1, 2, 3]) {
      const seen = new Set();
      for (let s = 0; s < 200; s++) {
        const x = t.make(rng(`${cls}|${s}`), level), y = t.make(rng(`${cls}|${s}`), level);
        assert.equal(x.q, y.q, `${t.id} not deterministic`); assert.equal(x.a, y.a);
        assert.ok(x.ok(), `${t.id} level ${level} seed ${s}: ${x.q} => ${x.a}`);
        for (const text of [x.q, x.a, x.s || '']) for (const re of SLIPS) assert.ok(!re.test(text), `${t.id} level ${level} seed ${s} slip ${re}: ${text}`);
        seen.add(x.q);
      }
      assert.ok(seen.size >= distinct, `${t.id} level ${level}: only ${seen.size} distinct questions`);
    }
  });

  test(`${label} formats: four-choice letter matches the option, true/false verdict, find-the-error names a line`, () => {
    for (const t of NEW.filter((x) => /-qcm$/.test(x.id))) for (const level of t.levels || [1, 2, 3]) for (let s = 0; s < 80; s++) {
      const x = t.make(rng(`fmt|${s}`), level);
      assert.match(x.q, /^QCM, une seule réponse exacte\./);
      const opts = [...x.q.matchAll(/\(([ABCD])\) (.+?)(?= ; \([ABCD]\) |\.$)/g)].map((m) => [m[1], m[2]]);
      assert.equal(opts.length, 4, x.q); assert.deepEqual(opts.map((o) => o[0]), ['A', 'B', 'C', 'D']);
      assert.equal(new Set(opts.map((o) => o[1])).size, 4, 'four different options');
      const ans = /^Réponse \(([ABCD])\) : (.+?\\\))\./.exec(x.a);
      assert.ok(ans, x.a);
      assert.equal(opts.find((o) => o[0] === ans[1])[1], ans[2], `${t.id}: the letter does not point at the stated option`);
      assert.match(x.a, /Erreurs des autres choix : /);
    }
    const verdicts = new Set();
    for (const t of NEW.filter((x) => /-tf$/.test(x.id))) for (const level of t.levels || [1, 2, 3]) for (let s = 0; s < 80; s++) {
      const x = t.make(rng(`tf|${s}`), level);
      assert.match(x.q, /^Vrai ou faux \? Justifier\. « .+ »$/); assert.match(x.a, /^(Vrai|Faux)\. .{10,}/); verdicts.add(x.a.slice(0, 4));
    }
    assert.equal(verdicts.size, 2, 'both verdicts occur');
    for (const t of NEW.filter((x) => /-error$/.test(x.id))) for (const level of t.levels || [1, 2, 3]) for (let s = 0; s < 80; s++) {
      const x = t.make(rng(`err|${s}`), level);
      assert.match(x.q, /\(L1\) .*\(L2\) /s); assert.match(x.a, /^La ligne \(L[1-5]\) est fausse : .+ Correction : .+ Résultat juste : /s);
      const k = Number(/^La ligne \(L(\d)\)/.exec(x.a)[1]); assert.ok(x.q.includes(`(L${k}) `), 'the named line exists');
    }
  });

  test(`${label} problems: numbers recomputed, hints, formatting, 40+ distinct versions`, () => {
    for (const e of problems) {
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

  test(`xelatex compiles every new ${label} generator at every level and every problem`, { skip: !xelatex && 'xelatex not installed', timeout: 600000 }, () => {
    const dir = mkdtempSync(join(tmpdir(), `mx-${cls}-`));
    try {
      const exercises = [];
      for (const t of NEW) for (const lv of t.levels || [1, 2, 3]) for (let s = 0; s < 3; s++) { const it = instance(t, lv, `x${s}`); exercises.push({ title: `${t.id} niveau ${lv}`, intro: '', parts: [{ q: it.q, a: it.a, s: it.s }] }); }
      for (const e of problems) for (let s = 0; s < 3; s++) { const x = e.make(rng(`x${s}`)); exercises.push({ title: e.title, intro: x.intro, parts: x.parts.map((p) => ({ q: p.q, a: p.a, s: '' })) }); }
      const body = exercises.flatMap((e) => [`\\subsection*{${tex(e.title.replace(/_/g, ' '))}}`, e.intro ? `${tex(e.intro)}\\par` : '', '\\begin{enumerate}', ...e.parts.map((q) => `\\item ${tex(q.q)}\\par\\smallskip ${tex(q.a)}${q.s ? `\\par ${tex(q.s)}` : ''}`), '\\end{enumerate}']).join('\n');
      writeFileSync(join(dir, 'c.tex'), `\\documentclass[11pt,a4paper]{article}\n\\usepackage{fontspec}\n\\usepackage{amsmath,amssymb}\n\\usepackage[french]{babel}\n\\usepackage{enumitem}\n\\usepackage[a4paper,margin=2cm]{geometry}\n\\begin{document}\n${body}\n\\end{document}\n`);
      try { execFileSync('xelatex', ['-interaction=nonstopmode', '-halt-on-error', 'c.tex'], { cwd: dir, stdio: 'pipe', timeout: 500000, maxBuffer: 64 * 1024 * 1024 }); }
      catch (error) { const log = readFileSync(join(dir, 'c.log'), 'utf8'); assert.fail((log.match(/^! [\s\S]*?\nl\.\d+.*$/m) || [`status ${error.status}; ${log.slice(-400)}`])[0]); }
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
}
