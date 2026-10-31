// Error correction collection: the mathematics (errors-model.js) and the page under jsdom (errors.js), both languages.
import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {ERRORS, DERIVATIONS, ROUTE, FAMILIES, all, find, grid, counterexample, checkRepair, coincidences, evaluateDerivation, show} from '../site/js/errors-model.js';
import {errorsPage, bindErrors} from '../site/js/errors.js';
import {describe} from '../site/js/reading.js';
import {errorsFor, holdsAt, claimAt} from '../site/js/errors-model.js';
import {buildDiscoveryIndex} from '../site/js/discovery-index.js';
import {render as renderCoverage, matrix} from '../scripts/error-coverage.mjs';
import fs from 'node:fs';

test('every claim is false in general, and has exactly one correct repair among tempting ones', () => {
  for (const e of ERRORS) {
    assert.ok(counterexample(e), e.id + ' needs a counterexample on its domain');
    const verdicts = e.repairs.map(r => checkRepair(e, r).ok);
    assert.equal(verdicts.filter(Boolean).length, 1, e.id + ' needs exactly one correct repair');
    assert.ok(e.repairs.length >= 3, e.id);
    for (const r of e.repairs) assert.ok(r.text && typeof r.L === 'function' && ['=', '<', '>', '<=', '>='].includes(r.rel));
    for (const v of e.vars) assert.ok(e.range[v][0] <= e.range[v][1]);
    // the domain never makes a formula undefined
    for (const [x, y] of grid(e)) for (const f of [e.L, e.R, ...e.repairs.flatMap(r => [r.L, r.R])]) assert.ok(Number.isFinite(f(x, y)), e.id + ' ' + x + ',' + y);
  }
});
test('the counterexample really separates the two sides, and coincidences are real equalities', () => {
  for (const e of ERRORS) {
    const c = counterexample(e); assert.ok(!holdsAt(e.rel || '=', c.left, c.right));
    for (const [x, y] of coincidences(e)) assert.ok(holdsAt(e.rel || '=', e.L(x, y), e.R(x, y)));
  }
  assert.deepEqual(coincidences(find('cancel-a-term')), [[2, 2]]);   // x + y = xy at (2, 2): an example proves nothing
  assert.equal(coincidences(find('square-of-sum')).length, 0);
});
test('independent checks of the stated identities', () => {
  for (let x = -5; x <= 5; x++) for (let y = -5; y <= 5; y++) {
    assert.ok((x + y) ** 2 - (x ** 2 + y ** 2) === 2 * x * y);
    assert.ok(3 * (x + y) - (3 * x + y) === 2 * y);
  }
  for (let x = -9; x <= 9; x++) assert.equal(((x ** 2 + 3 * x - 5) - (4 * x - 5)) - (x ** 2 + 3 * x - 5 - 4 * x - 5), 10);
  const d = find('lost-bracket-subtraction'); assert.equal(counterexample(d).left - counterexample(d).right, 10);
  for (let x = 1; x <= 9; x++) for (let y = 1; y <= 9; y++) assert.ok(Math.sqrt(x + y) < Math.sqrt(x) + Math.sqrt(y));
});
test('the faulty step of the 1 = 2 derivation is found by evaluation: line 5, whatever the common value', () => {
  const d = find('division-by-zero');
  for (let t = 1; t <= 9; t++) {
    const {rows, firstFalse} = evaluateDerivation(d, t);
    assert.equal(firstFalse, 4);
    assert.ok(rows.slice(0, 4).every(r => r.holds));
    assert.equal(rows[4].divisor, 0);          // the division by a - b = 0
    assert.equal(rows[3].left, 0); assert.equal(rows[3].right, 0);
  }
});
test('ids are unique, the route lists existing ids, families exist, links resolve', () => {
  const ids = all().map(e => e.id); assert.equal(new Set(ids).size, ids.length);
  for (const id of ROUTE) assert.ok(find(id), id);
  assert.equal(new Set(ROUTE).size, ROUTE.length);
  assert.deepEqual([...ROUTE].sort(), ids.slice().sort(), 'the route lists every activity once');
  for (const e of all()) { assert.ok(FAMILIES[e.family], e.id); for (const h of e.links) assert.ok(describe(h), e.id + ' ' + h); assert.ok(e.title.every(Boolean) && e.why.every(Boolean) && e.level.every(Boolean)); }
});
test('numbers: exact integers, rounded values marked with ≈', () => {
  assert.equal(show(-4), '−4'); assert.match(show(1 / 3, 'en'), /^≈ 0\.3333$/); assert.match(show(1 / 3, 'fr'), /^≈ 0,3333$/);
});

function setup() {
  const dom = new JSDOM('<main id="host"></main>', {url: 'http://localhost/'}), w = dom.window;
  for (const key of ['window', 'document', 'localStorage', 'Event']) globalThis[key] = w[key];
  return w;
}
test('the index and every page render in both languages without placeholders', () => {
  for (const lang of [0, 1]) {
    const t = p => p[lang];
    const index = errorsPage('', t);
    for (const e of all()) assert.ok(index.includes('#errors/' + e.id), e.id);
    assert.ok(!/undefined|NaN|\[object/.test(index));
    for (const e of all()) { const h = errorsPage(e.id, t); assert.ok(!/undefined|NaN|\[object/.test(h), e.id); assert.ok(h.includes('<h1>')); }
  }
});
test('claim page: sliders give a counterexample verdict, a wrong repair is refused with a computed counterexample, the right one accepted', () => {
  const w = setup();
  for (const lang of [0, 1]) {
    const t = p => p[lang], e = find('square-of-sum');
    w.document.body.innerHTML = errorsPage(e.id, t);
    const root = w.document.getElementById('main'), stop = bindErrors(root, t, e.id);
    assert.match(root.querySelector('#err-verdict').textContent, lang ? /counterexample/ : /contre-exemple/);
    assert.equal(root.querySelector('#err-left').textContent, '4'); assert.equal(root.querySelector('#err-right').textContent, '2');   // x = y = 1
    assert.ok(root.querySelector('#err-diagram svg'));
    const set = (id, v) => { const el = root.querySelector(id); el.value = v; el.dispatchEvent(new w.Event('input')); };
    set('#err-x', 3); set('#err-y', 4); assert.equal(root.querySelector('#err-left').textContent, '49'); assert.equal(root.querySelector('#err-right').textContent, '25');
    const radios = [...root.querySelectorAll('input[name=repair]')], text = r => r.nextElementSibling.textContent;
    root.querySelector('#err-check').click(); assert.ok(root.querySelector('#err-feedback').textContent);   // nothing chosen yet
    const wrong = radios.find(r => text(r) === '(x + y)² = x² + xy + y²'); wrong.checked = true; root.querySelector('#err-check').click();
    assert.match(root.querySelector('#err-feedback').textContent, /x = 1, y = 1/);
    assert.equal(w.localStorage.getItem('maths-explorer-errors-v1'), null);
    const right = radios.find(r => text(r) === '(x + y)² = x² + 2xy + y²'); right.checked = true; root.querySelector('#err-check').click();
    assert.match(root.querySelector('#err-feedback').textContent, /81/);
    assert.ok(root.querySelector('#err-why').open);
    assert.deepEqual(JSON.parse(w.localStorage.getItem('maths-explorer-errors-v1')), ['square-of-sum']);
    w.localStorage.clear(); stop();
  }
});
test('correct repairs are not always listed first', () => {
  const firsts = ERRORS.map(e => { const m = errorsPage(e.id, p => p[0]).match(/name="repair" value="(\d+)"/); return +m[1]; });
  assert.ok(new Set(firsts).size > 1, 'the correct option (index 0 in the data) must move');
});
test('derivation page: examining values only after a pick; wrong picks explained; the first false line accepted', () => {
  const w = setup(), t = p => p[1], d = find('division-by-zero');
  w.document.body.innerHTML = errorsPage(d.id, t);
  const root = w.document.getElementById('main'); bindErrors(root, t, d.id);
  const buttons = [...root.querySelectorAll('.error-step')];
  assert.ok(buttons.every(b => b.querySelector('.error-step-values').textContent === ''));
  buttons[1].click(); assert.match(root.querySelector('#err-feedback').textContent, /true for a = b = 3/);
  buttons[1].click(); assert.match(buttons[1].querySelector('.error-step-values').textContent, /=/);
  buttons[5].click(); assert.match(root.querySelector('#err-feedback').textContent, /earlier one already is/);
  buttons[4].click(); assert.match(root.querySelector('#err-feedback').textContent, /first false one.*dividing by a − b/);
  assert.match(buttons[4].querySelector('.error-step-values').textContent, /≠/);
  assert.deepEqual(JSON.parse(w.localStorage.getItem('maths-explorer-errors-v1')), ['division-by-zero']);
});

test('relations: strict and weak orders with a tolerance, hypotheses of a claim', () => {
  assert.ok(holdsAt('<', 1, 2) && !holdsAt('<', 2, 2) && holdsAt('<=', 2, 2) && holdsAt('>=', 2, 2) && holdsAt('>', 3, 2));
  const e = find('square-inequality');
  assert.equal(claimAt(e, 3, 2), null);          // hypothesis x < y not met
  assert.equal(claimAt(e, -3, 2), false);        // -3 < 2 but 9 > 4
  assert.equal(claimAt(e, 2, 3), true);
  assert.equal(claimAt(find('reciprocal-order'), -1, 1), true);   // the case that makes the claim look right
  assert.equal(claimAt(find('reciprocal-order'), 1, 2), false);
});
test('independent numerical checks of the calculus, probability and geometry statements', () => {
  const d = (f, x, h = 1e-5) => (f(x + h) - f(x - h)) / (2 * h);
  for (let x = -5; x <= 5; x++) {
    assert.ok(Math.abs(d(t => t ** 3, x) - 3 * x * x) < 1e-5, 'product rule: (x^3)′');
    assert.ok(Math.abs(d(t => (2 * t + 1) ** 2, x) - 4 * (2 * x + 1)) < 1e-4, 'chain rule');
  }
  const midpoint = (f, x, n = 20000) => { let s = 0; for (let i = 0; i < n; i++) s += f((i + .5) * x / n) * x / n; return s; };
  for (let x = 1; x <= 9; x++) {
    assert.ok(Math.abs(midpoint(t => t ** 3, x) - x ** 4 / 4) < 1e-3 * x ** 4);
    assert.ok(Math.abs(midpoint(t => t ** 3, x) - midpoint(t => t * t, x) * midpoint(t => t, x)) > 1e-3 || x === 1.5);
  }
  for (let r = 2; r <= 9; r++) {           // exhaustive ordered draws from 10 balls, r of them red
    let both = 0, all = 0;
    for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) if (i !== j) { all++; if (i < r && j < r) both++; }
    assert.ok(Math.abs(both / all - find('draw-without-replacement').L(r)) < 1e-12);
  }
  for (let x = 0; x <= 8; x++) { const A = new Set([...Array(10).keys()]), B = new Set(Array.from({length: 8}, (_, i) => 10 - x + i)); assert.equal([...B].filter(v => A.has(v)).length, x); assert.equal(new Set([...A, ...B]).size / 36, find('union-of-events').L(x)); }
  for (let a = 1; a <= 9; a++) for (let b = 1; b <= 9; b++) assert.ok(Math.hypot(a, b) < a + b);
  for (let x = 1; x <= 9; x++) assert.equal((2 * x) ** 2, 4 * x * x);
  for (let x = 1; x <= 9; x++) assert.ok(x * (10 - x) <= 25);
  assert.equal(Math.round(10 / 3 * 100) / 100 * 3, 9.99);
});
test('reverse links: every chapter an error points to lists that error, and unknown chapters list none', () => {
  for (const e of ERRORS) for (const h of e.links) assert.ok(errorsFor(h).some(x => x.id === e.id), e.id + ' ' + h);
  assert.equal(errorsFor('#chapter/nope').length, 0);
  assert.ok(errorsFor('#chapter/seconde-08').length >= 4);
});
test('discovery: the errors are searchable records related to their chapters, in both directions', () => {
  const chapters = [{id: 'seconde-08', title: ['Calcul algébrique', 'Algebra'], course: 'seconde', files: []}];
  const index = buildDiscoveryIndex({chapters, errors: all(), courses: [{id: 'seconde', title: ['Seconde', 'Year 10']}]});
  const rec = index.find(x => x.route === '#errors/square-of-sum');
  assert.equal(rec.format, 'error');
  assert.ok(rec.memberships.includes('algebra/equations'));
  assert.ok(rec.related.includes('#chapter/seconde-08'));
  assert.ok(index.find(x => x.route === '#chapter/seconde-08').related.includes('#errors/square-of-sum'));
  for (const e of all()) assert.ok(index.some(x => x.route === '#errors/' + e.id), e.id);
});
test('chapter pages and the slides index list the errors of their chapter', async () => {
  const {chapterSequencePage, mountChapterSequence} = await import('../site/js/chapter-sequence.js');
  assert.equal(typeof mountChapterSequence, 'function');
  const src = fs.readFileSync(new URL('../site/js/chapter-sequence.js', import.meta.url), 'utf8');
  assert.match(src, /errorBlock\(c,L\)/);
  assert.match(fs.readFileSync(new URL('../site/js/slides-page.js', import.meta.url), 'utf8'), /errorsFor\(/);
});
test('the coverage matrix is current, complete and honest', () => {
  assert.equal(fs.readFileSync(new URL('../docs/ERROR_COVERAGE.md', import.meta.url), 'utf8'), renderCoverage(), 'run node scripts/error-coverage.mjs');
  const {built, planned} = matrix();
  assert.equal(built.length, all().length);
  const ids = [...built, ...planned].map(r => r.id); assert.equal(new Set(ids).size, ids.length, 'no id is both built and planned');
  const data = JSON.parse(fs.readFileSync(new URL('../content/data/error-coverage.json', import.meta.url)));
  for (const r of [...built, ...planned]) assert.ok(data.topics[r.topic], r.id + ' needs a topic');
  for (const p of data.planned) { assert.ok(p.curricula.length); for (const c of p.curricula) assert.ok(data.curricula.some(x => x.id === c)); }
  assert.match(renderCoverage(), /\[VERIFY/);
});
test('English pages contain no French words in claims or repairs, and French pages no English ones', () => {
  for (const e of ERRORS) {
    const en = errorsPage(e.id, p => p[1]), fr = errorsPage(e.id, p => p[0]);
    const prose = en.match(/<p class="error-claim">[^<]*<\/p>|<span>[^<]*<\/span>/g).join(' ');
    assert.ok(!/\b(alors|avec|Si|sans|remise|aire|rouges|arrondi|équiprobables|degrés)\b/.test(prose), e.id + ': ' + prose);
    const proseFr = fr.match(/<p class="error-claim">[^<]*<\/p>|<span>[^<]*<\/span>/g).join(' ');
    assert.ok(!/\b(then|with|If|without|replacement|area|rounded|equally|degrees|two red)\b/.test(proseFr), e.id + ': ' + proseFr);
  }
});
