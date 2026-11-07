import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { rng } from '../site/js/exercises/engine.js';
import { TEMPLATES, AUTHORED, CLASSES, chaptersOf, templatesFor, instance, buildStarter, buildSheet } from '../site/js/exercises/bank.js';
import { authored } from '../site/js/exercises/authored.js';
import { problems } from '../site/js/exercises/problems.js';
import { tex, html, sheetTex, starterTex, projectionHtml, starterHtml, sheetHtml, segments } from '../site/js/exercises/export.js';
import { stepSeed } from '../site/js/exercises/ui-kit.js';
import { automatismesPage, bindAutomatismes } from '../site/js/automatismes.js';
import { sheetsPage, bindSheets } from '../site/js/worksheets.js';

const manifest = JSON.parse(readFileSync(new URL('../content/data/manifest.json', import.meta.url), 'utf8'));
const chapterCourse = Object.fromEntries(manifest.catalog.chapters.map((c) => [c.id, c.course]));
const SEEDS = 150;
// formatting slips that read badly in class: +1x, "+-", exponent 1, x+0, double spaces, dashes, unresolved values
const SLIPS = [/[+-]1[xyzn](?![a-z_^{])/, /\+-|--|-\+|\+\+/, /x\+0|y\+0|x-0|(?<!\})\^\{1\}/, /(?<![\d.,{])0[xyz]\b/, /\\\(\s*\\\)/, /undefined|NaN|Infinity/, /—|–|−/, / {2,}/];
const balanced = (s) => (s.match(/\\\(/g) || []).length === (s.match(/\\\)/g) || []).length && (s.match(/\\\[/g) || []).length === (s.match(/\\\]/g) || []).length;

test('every template: exact answer re-derived another way, no formatting slip, valid chapter, deterministic', () => {
  assert.ok(TEMPLATES.length >= 60);
  const ids = new Set();
  for (const t of TEMPLATES) {
    assert.ok(!ids.has(t.id), `duplicate id ${t.id}`); ids.add(t.id);
    assert.equal(chapterCourse[t.chapter], t.cls, `${t.id}: chapter ${t.chapter} is not a ${t.cls} chapter`);
    for (const level of t.levels || [1, 2, 3]) {
      for (let s = 0; s < SEEDS; s++) {
        const x = t.make(rng(`test|${s}`), level), again = t.make(rng(`test|${s}`), level);
        assert.equal(x.q, again.q, `${t.id} is not deterministic`);
        assert.equal(x.a, again.a);
        assert.ok(x.ok(), `${t.id} level ${level} seed ${s}: ${x.q} => ${x.a}`);
        for (const text of [x.q, x.a, x.s || '']) {
          assert.ok(balanced(text), `${t.id}: unbalanced maths in ${text}`);
          for (const re of SLIPS) assert.ok(!re.test(text), `${t.id} level ${level} seed ${s} slip ${re}: ${text}`);
        }
      }
    }
  }
});

test('the supply is practically unlimited: distinct questions per generator over many seeds', () => {
  let low = [];
  for (const t of TEMPLATES) {
    const set = new Set();
    for (const level of t.levels || [1, 2, 3]) for (let s = 0; s < 600; s++) set.add(t.make(rng(`variety|${s}`), level).q);
    if (set.size < 20) low.push(`${t.id}:${set.size}`);
  }
  // the exact-value trigonometry and similar topics have a genuinely small parameter space; nothing below 20 is allowed
  assert.deepEqual(low, [], 'generators with fewer than 20 distinct questions');
  const many = TEMPLATES.filter((t) => { const set = new Set(); for (let s = 0; s < 1500; s++) set.add(t.make(rng(`v2|${s}`), 2).q); return set.size >= 500; });
  assert.ok(many.length >= TEMPLATES.length * 0.5, 'at least half of the generators give 500+ distinct level 2 questions in 1500 seeds');
});

test('seeded problems and fixed exercises: numbers in the correction recomputed', () => {
  assert.ok(authored.length >= 20 && problems.length >= 6);
  const ids = new Set();
  for (const e of AUTHORED) { assert.ok(!ids.has(e.id), `duplicate exercise id ${e.id}`); ids.add(e.id); assert.ok(e.chapters.every((c) => chapterCourse[c] === e.cls), `${e.id}: a chapter is not a ${e.cls} chapter`); assert.ok([1, 2, 3].includes(e.level) && e.minutes > 0 && e.title, e.id); }
  for (const e of AUTHORED.filter((x) => !x.make)) { assert.ok(e.ok(), e.id); for (const p of e.parts) { assert.ok(p.q && p.a && p.w > 0); for (const v of [p.q, p.a, p.hint || '', e.intro]) { assert.ok(balanced(v), e.id); for (const re of SLIPS.filter((r) => !/\^\\\{1/.test(r.source))) assert.ok(!re.test(v), `${e.id} slip ${re}: ${v}`); } } }
  for (const e of AUTHORED.filter((x) => x.make)) {
    assert.equal(chapterCourse[e.chapters[0]], e.cls);
    const intros = new Set();
    for (let s = 0; s < 300; s++) {
      const x = e.make(rng(`prob|${s}`)), again = e.make(rng(`prob|${s}`));
      assert.deepEqual(x.parts, again.parts); assert.ok(x.ok(), `${e.id} seed ${s}`);
      for (const text of [x.intro, ...x.parts.flatMap((p) => [p.q, p.a, p.hint || ''])]) { assert.ok(balanced(text), e.id); for (const re of SLIPS.filter((r) => !/\^\\\{1/.test(r.source))) assert.ok(!re.test(text), `${e.id} slip ${re}: ${text}`); }
      intros.add(x.intro);
    }
    assert.ok(intros.size >= 40, `${e.id} gives only ${intros.size} distinct versions`);
  }
});

test('original practice exercises retain their content but have no unsupported exam-type labels', () => {
  const exercises = AUTHORED.filter((e) => e.id.startsWith('exam-'));
  assert.equal(exercises.length, 24);
  assert.ok(exercises.every((e) => !('exam' in e) && !('source' in e)));
});

test('all five priority classes have generators, chapters and written exercises', () => {
  for (const c of CLASSES) {
    assert.ok(templatesFor(c.id).length >= 9, c.id);
    assert.ok(chaptersOf(c.id).length >= 5, c.id);
    assert.ok(AUTHORED.filter((e) => e.cls === c.id).length >= 3, c.id);
    assert.ok(templatesFor(c.id).some((t) => t.fast));
  }
});

// Coverage of a finished class in the online bank: every chapter has at least six worked exercises shown (a seeded
// problem replaces a fixed exercise of the same title), all three levels, and at least four generators. Add a class
// to FINISHED when its bank is complete (Seconde: 2 November 2026).
const FINISHED = ['seconde'];
test('finished classes: six worked exercises over three levels and four generators in every chapter', () => {
  for (const cls of FINISHED) for (const c of manifest.catalog.chapters.filter((x) => x.course === cls && x.number > 0)) {
    const all = AUTHORED.filter((e) => e.chapters.includes(c.id)), shown = all.filter((e) => e.make || !all.some((x) => x.make && x.title === e.title));
    assert.ok(shown.length >= 6, `${c.id}: ${shown.length} worked exercises`);
    assert.deepEqual([1, 2, 3].filter((l) => shown.some((e) => e.level === l)), [1, 2, 3], `${c.id}: a level is missing`);
    assert.ok(TEMPLATES.filter((t) => t.chapter === c.id).length >= 4, `${c.id}: fewer than four generators`);
    assert.ok(shown.every((e) => (e.make ? e.make(rng('cov')) : e).parts.some((p) => p.hint)), `${c.id}: an exercise without any hint`);
  }
});

test('starters: seeded, filtered, never empty for a valid choice', () => {
  for (const c of CLASSES) {
    const a = buildStarter({ cls: c.id, count: 10, seed: 's1', minutes: 5 }), b = buildStarter({ cls: c.id, count: 10, seed: 's1', minutes: 5 }), d = buildStarter({ cls: c.id, count: 10, seed: 's2', minutes: 5 });
    assert.equal(a.items.length, 10); assert.deepEqual(a.items, b.items); assert.notDeepEqual(a.items.map((i) => i.q), d.items.map((i) => i.q));
    assert.equal(a.secondsPerItem, 30);
    assert.equal(new Set(a.items.map((i) => i.q)).size, 10, 'no repeated question');
  }
  const only = buildStarter({ cls: 'terminale', chapters: ['terminale-08'], levels: [2], count: 6, seed: 'x' });
  assert.ok(only.items.every((i) => i.chapter === 'terminale-08' && i.level === 2));
  const geo = buildStarter({ cls: 'seconde', domains: ['geometrie'], count: 5, seed: 'x' });
  assert.ok(geo.items.every((i) => i.domain === 'geometrie'));
  const progressive = buildStarter({ cls: 'premiere', levels: [1, 2, 3], count: 9, seed: 'x', order: 'progressive' }).items.map((i) => i.level);
  assert.deepEqual(progressive, [...progressive].sort());
  assert.equal(buildStarter({ cls: 'seconde', chapters: ['terminale-01'], seed: 'x' }).empty, true);
});

test('sheets: exercises, minutes and a marking scheme that adds up exactly', () => {
  for (const kind of ['sheet', 'interro', 'devoir']) for (const c of CLASSES) {
    const d = buildSheet({ kind, cls: c.id, seed: `k-${kind}`, total: 20, chapterTitle: (id) => id }), e = buildSheet({ kind, cls: c.id, seed: `k-${kind}`, total: 20, chapterTitle: (id) => id });
    assert.deepEqual(d, e);
    assert.ok(d.exercises.length >= 1);
    const sum = d.exercises.flatMap((x) => x.parts).reduce((s, p) => s + p.pts, 0);
    assert.equal(sum, 20, `${kind} ${c.id}`);
    for (const x of d.exercises) { assert.ok(x.parts.length >= 1); for (const p of x.parts) { assert.ok(p.pts > 0 && (p.pts * 2) % 1 === 0, 'half points'); assert.ok(p.q && p.a); } }
    if (kind === 'interro') assert.ok(d.exercises.every((x) => x.source !== 'authored' || x.minutes <= 20));
  }
  const a = buildSheet({ kind: 'devoir', cls: 'terminale', seed: 'A' }), b = buildSheet({ kind: 'devoir', cls: 'terminale', seed: 'B' });
  assert.notDeepEqual(a.exercises.map((x) => x.parts.map((p) => p.q)), b.exercises.map((x) => x.parts.map((p) => p.q)));
  const one = buildSheet({ kind: 'sheet', cls: 'stmg', chapters: ['stmg-06'], includeAuthored: false, count: 2, parts: 3, seed: 'z' });
  assert.ok(one.exercises.every((x) => x.chapter === 'stmg-06' && x.parts.length === 3), 'a short chapter repeats its generators instead of mixing in another chapter');
  assert.equal(new Set(one.exercises.flatMap((x) => x.parts.map((p) => p.q))).size, 6);
});

test('LaTeX and HTML exports: balanced, escaped, anonymous, no unsupported characters', () => {
  assert.equal(tex('Taux de \\(5\\,\\%\\) et 5 % de remise & plus'), 'Taux de $5\\,\\%$ et 5 \\% de remise \\& plus');
  assert.equal(segments('a \\(b\\) c \\[d\\]').map((s) => s.t).join(), 'text,math,text,display');
  assert.ok(html('x < y \\(a<b\\)').includes('&lt;'));
  const st = buildStarter({ cls: 'premiere', count: 8, seed: 'tex' }), sh = buildSheet({ kind: 'devoir', cls: 'terminale', seed: 'tex', total: 20 });
  for (const src of [starterTex(st, { version: 'student' }), starterTex(st, { version: 'teacher' }), sheetTex(sh, { version: 'student', bareme: true }), sheetTex(sh, { version: 'teacher', bareme: true })]) {
    assert.ok(src.startsWith('\\documentclass') && src.trim().endsWith('\\end{document}'));
    assert.equal((src.match(/\\begin\{(enumerate|mdframed|center|array|pmatrix|cases)\}/g) || []).length, (src.match(/\\end\{(enumerate|mdframed|center|array|pmatrix|cases)\}/g) || []).length);
    assert.equal((src.replace(/\\\$/g, '').match(/\$/g) || []).length % 2, 0, 'even number of $');
    assert.ok(!/arheritiana|@|http/i.test(src));
    assert.ok(src.includes('newpxmath') && src.includes('mathpazo') && src.includes('\\newcounter{exo}'));
  }
  const proj = projectionHtml(st, { title: 'Automatismes' });
  assert.ok(proj.includes('<script id="data" type="application/json">') && proj.includes('mathjax/3.2.2'));
  const data = JSON.parse(/<script id="data" type="application\/json">([\s\S]*?)<\/script>/.exec(proj)[1].replace(/\\u003c/g, '<'));
  assert.equal(data.items.length, 8);
  assert.ok(starterHtml(st).includes('<ol') && sheetHtml(sh, { bareme: true }).includes('points'));
});


test('unverified competency labels stay out of exercise pages and printed documents', () => {
  const ex = { n: 1, title: 'Test', intro: 'Introduction conservée', skills: ['Étiquette trompeuse'],
    pts: 2, parts: [{ q: 'Question conservée', a: 'Correction conservée', pts: 2 }] };
  const doc = { kind: 'sheet', minutes: 5, total: 2, exercises: [ex] };
  const variants = [
    sheetHtml(doc), sheetHtml(doc, { teacher: true }),
    sheetTex(doc, { version: 'student' }), sheetTex(doc, { version: 'teacher' }),
  ];
  for (const output of variants) {
    assert.ok(output.includes('Introduction conservée') && output.includes('Question conservée'));
    assert.ok(!output.includes(['Compétences', 'visées'].join(' ')));
    assert.ok(!output.includes('Étiquette trompeuse'));
  }
  assert.ok(variants[1].includes('Correction conservée') && variants[3].includes('Correction conservée'));
  const bankSource = readFileSync(new URL('../site/js/bank-page.js', import.meta.url), 'utf8');
  assert.ok(!bankSource.includes('skillsHtml'), 'the online bank must not render the competency metadata');
});

test('seed stepping: any text is a seed, the arrows walk through series', () => {
  assert.equal(stepSeed('abc', 1), 'abc-2'); assert.equal(stepSeed('abc-2', 1), 'abc-3'); assert.equal(stepSeed('abc-3', -1), 'abc-2'); assert.equal(stepSeed('abc', -1), 'abc-1');
});

for (const language of [0, 1]) test(`pages: automatismes and sheets under jsdom, language ${language}`, () => {
  const t = (x) => x[language], pair = (fr, en) => t([fr, en]);
  const title = (id) => id;
  for (const [mk, bind, list, listSel] of [[() => automatismesPage(t, pair), bindAutomatismes, '#gen-list li', '#gen-list'], [() => sheetsPage(t), bindSheets, '.sheet-ex', '#gen-preview']]) {
    const dom = new JSDOM(`<body>${mk()}</body>`, { url: 'http://localhost/' });
    const win = dom.window; Object.assign(globalThis, { window: win, document: win.document, localStorage: win.localStorage });
    const root = win.document.querySelector('main'), stop = bind(root, t, { chapterTitle: title });
    const form = root.querySelector('#gen-form');
    assert.ok(root.querySelectorAll(list).length >= 1, 'a series is built on load');
    const before = root.querySelector(listSel).textContent;
    const next = root.querySelector('#gen-next');   // the fluency randomizer has no stepping arrows (owner, 6 Nov); worksheets keep them
    if (next) {
      next.click();
      assert.notEqual(root.querySelector(listSel).textContent, before, 'the next series is different');
      assert.match(form.elements.seed.value, /-2$/);
    }
    form.elements.cls.value = 'stmg'; form.elements.cls.dispatchEvent(new win.Event('change', { bubbles: true }));
    assert.ok(root.querySelectorAll('#gen-chapters input').length >= 5 && [...root.querySelectorAll('#gen-chapters input')].every((i) => i.value.startsWith('stmg')));
    const first = root.querySelector('#gen-chapters input'); first.checked = true; first.dispatchEvent(new win.Event('change', { bubbles: true }));
    assert.ok(root.querySelectorAll(list).length >= 1);
    for (const sel of ['[data-act]']) assert.ok(root.querySelectorAll(sel).length >= 4);
    stop();
  }
});
