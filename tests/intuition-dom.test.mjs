// Collection « contre l'intuition »: the two new exhibits mount under jsdom with a recording canvas, react to their controls, keep finite
// readouts and stop their frames; the collection page lists live entries only and every link resolves. Not a substitute for browser QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {mountObject} from '../site/js/lab-objects.js';
import {ENTRIES} from '../site/js/intuition-data.js';
import {intuitionPage} from '../site/js/intuition-page.js';
import {describe} from '../site/js/reading.js';
test('colliding blocks and the napkin ring mount, react and clean up', async () => {
  const dom = new JSDOM('<main></main>', {pretendToBeVisual: true}), w = dom.window;
  for (const key of ['window', 'document', 'CustomEvent', 'Event', 'MouseEvent']) globalThis[key] = w[key];
  globalThis.devicePixelRatio = 1; globalThis.getComputedStyle = w.getComputedStyle.bind(w); let number = 0; const frames = new Map();
  globalThis.requestAnimationFrame = fn => { frames.set(++number, fn); return number; }; globalThis.cancelAnimationFrame = n => frames.delete(n);
  w.HTMLElement.prototype.getBoundingClientRect = () => ({left: 0, top: 0, width: 640, height: 440}); w.HTMLElement.prototype.setPointerCapture = () => {};
  w.Element.prototype.getBoundingClientRect = () => ({left: 0, top: 0, width: 640, height: 440});
  w.HTMLCanvasElement.prototype.getContext = function () { return new Proxy({}, {get: (target, p) => target[p] || ((...args) => args.forEach(x => { if (typeof x === 'number') assert.ok(Number.isFinite(x)); })), set: (target, p, v) => (target[p] = v, true)}); };
  let now = 0; const tick = (n = 1) => { for (let i = 0; i < n; i++) { const work = [...frames.values()]; frames.clear(); now += 40; work.forEach(fn => fn(now)); } };
  const read = root => root.querySelector('.exhibit-readout').textContent;
  const pointer = (el, type, x, y) => el.dispatchEvent(new w.MouseEvent(type, {clientX: x, clientY: y, bubbles: true}));
  for (const lang of ['fr', 'en']) {
    let root = w.document.createElement('section'); w.document.body.append(root);
    let stop = mountObject('collisions', root, {lang, reduced: false}); tick(2);
    assert.match(read(root), /100/); assert.match(read(root), /: 0/);
    root.querySelector('#co-play').click(); tick(700);
    assert.match(read(root), /31/, 'ratio 100 ends with 31 collisions');
    const e = root.querySelector('#co-e'); e.value = '6'; e.dispatchEvent(new w.Event('input')); tick();
    root.querySelector('#co-step').click(); tick(); assert.match(read(root), /: 1/);
    root.querySelector('#co-play').click(); tick(2000); assert.match(read(root), /3\s?141/);
    const cv = root.querySelector('canvas'); cv.dispatchEvent(new w.KeyboardEvent('keydown', {key: 'r', bubbles: true})); tick(); assert.match(read(root), /: 0/);
    pointer(cv, 'pointerdown', 40 + 8 * 48, 150); pointer(cv, 'pointermove', 40 + 9 * 48, 150); pointer(cv, 'pointerup', 40 + 9 * 48, 150); tick();
    assert.ok(!/NaN|undefined|Infinity/.test(root.textContent)); stop(); assert.equal(frames.size, 0, 'unmount cancels frames'); root.remove();
    root = w.document.createElement('section'); w.document.body.append(root);
    stop = mountObject('napkin-ring', root, {lang, reduced: false}); tick(2);
    assert.match(read(root), /113[.,]097/); assert.match(root.textContent, lang === 'fr' ? /Même volume|volume/ : /volume/);
    const rb = root.querySelector('#nr-rb'); rb.value = '5'; rb.dispatchEvent(new w.Event('input')); tick(); assert.match(read(root), /113[.,]097.*113[.,]097/);
    const mode = root.querySelector('#nr-mode'); mode.value = 'hole'; mode.dispatchEvent(new w.Event('change')); tick();
    const [left, right] = read(root).match(/\d+[.,]\d+/g).map(x => Number(x.replace(',', '.'))); assert.ok(left < right, 'same hole: volumes differ');
    root.querySelector('canvas').dispatchEvent(new w.KeyboardEvent('keydown', {key: 'ArrowLeft', bubbles: true})); tick();
    assert.ok(!/NaN|undefined|Infinity/.test(root.textContent)); stop(); assert.equal(frames.size, 0); root.remove();
    root = w.document.createElement('section'); w.document.body.append(root);
    stop = mountObject('morley', root, {lang, reduced: false}); tick(2);
    assert.match(read(root), /60[.,]00/); const mcv = root.querySelector('canvas');
    pointer(mcv, 'pointerdown', 250, 90); pointer(mcv, 'pointermove', 300, 120); pointer(mcv, 'pointerup', 300, 120); tick();
    mcv.dispatchEvent(new w.KeyboardEvent('keydown', {key: ']', bubbles: true})); mcv.dispatchEvent(new w.KeyboardEvent('keydown', {key: 'ArrowLeft', bubbles: true})); tick();
    root.querySelector('#mo-random').click(); tick(); assert.match(read(root), /60[.,]00/, 'equilateral for a random triangle'); root.querySelector('#mo-show').click(); root.querySelector('#mo-reset').click(); tick();
    assert.ok(!/NaN|undefined|Infinity/.test(root.textContent)); stop(); assert.equal(frames.size, 0); root.remove();
    root = w.document.createElement('section'); w.document.body.append(root);
    stop = mountObject('hundred-boxes', root, {lang, reduced: false}); tick(2);
    assert.equal(root.querySelectorAll('.hb-box').length, 10); assert.match(read(root), /0/);
    root.querySelector('.hb-box').click(); assert.equal(root.querySelectorAll('.hb-open').length, 1);
    for (let k = 0; k < 9; k++) root.querySelectorAll('.hb-box')[k].click(); assert.equal(root.querySelectorAll('.hb-open').length, 5, 'half of the boxes at most');
    root.querySelector('#hb-follow').click(); assert.match(read(root), /\/?10|10/); root.querySelector('#hb-rand').click();
    root.querySelector('#hb-1000').click(); assert.match(read(root), /1[ ,.]?000/);
    const sel = root.querySelector('#hb-n'); sel.value = '100'; sel.dispatchEvent(new w.Event('change')); assert.equal(root.querySelectorAll('.hb-box').length, 100);
    const v = root.querySelector('#hb-view'); v.value = 'cycles'; v.dispatchEvent(new w.Event('change')); tick(2);
    assert.ok(!/NaN|undefined|Infinity/.test(root.textContent)); stop(); assert.equal(frames.size, 0); root.remove();
  }
  dom.window.close();
});
test('the collection page lists entries that exist, with no dead link and no dash', () => {
  assert.ok(ENTRIES.length >= 9);
  const html = intuitionPage(p => p[0]);
  for (const e of ENTRIES) { assert.ok(describe(e.hash), `${e.id} resolves`); assert.ok(html.includes(`href="${e.hash}"`)); }
  assert.ok(!/[—–]/.test(JSON.stringify(ENTRIES)));
});
