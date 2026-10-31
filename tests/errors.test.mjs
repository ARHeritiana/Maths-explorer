// Error correction collection: the mathematics (errors-model.js) and the page under jsdom (errors.js), both languages.
import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {ERRORS, DERIVATIONS, ROUTE, FAMILIES, all, find, grid, counterexample, checkRepair, coincidences, evaluateDerivation, show} from '../site/js/errors-model.js';
import {errorsPage, bindErrors} from '../site/js/errors.js';
import {describe} from '../site/js/reading.js';

test('every claim is false in general, and has exactly one correct repair among tempting ones', () => {
  for (const e of ERRORS) {
    assert.ok(counterexample(e), e.id + ' needs a counterexample on its domain');
    const verdicts = e.repairs.map(r => checkRepair(e, r).ok);
    assert.equal(verdicts.filter(Boolean).length, 1, e.id + ' needs exactly one correct repair');
    assert.ok(e.repairs.length >= 3, e.id);
    for (const r of e.repairs) assert.ok(r.text && typeof r.L === 'function' && ['=', '<='].includes(r.rel));
    for (const v of e.vars) assert.ok(e.range[v][0] <= e.range[v][1]);
    // the domain never makes a formula undefined
    for (const [x, y] of grid(e)) for (const f of [e.L, e.R, ...e.repairs.flatMap(r => [r.L, r.R])]) assert.ok(Number.isFinite(f(x, y)), e.id + ' ' + x + ',' + y);
  }
});
test('the counterexample really separates the two sides, and coincidences are real equalities', () => {
  for (const e of ERRORS) {
    const c = counterexample(e); assert.notEqual(c.left, c.right);
    for (const [x, y] of coincidences(e)) assert.equal(e.L(x, y), e.R(x, y));
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
