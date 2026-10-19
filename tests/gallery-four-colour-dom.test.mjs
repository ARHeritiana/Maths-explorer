// User actions, topology editing, country grouping and cleanup under jsdom; no claim of pixel/browser QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { fourColours } from '../site/js/gallery-four-colour.js';
import { installControlPolicy } from '../site/js/control-policy.js';

test('four-colour menu, drawing, undo, colouring, keyboard and gesture cancellation work in both languages', async () => {
  const dom = new JSDOM('<main></main>', { pretendToBeVisual: true }), w = dom.window;
  for (const key of ['window', 'document', 'CustomEvent', 'Event', 'MutationObserver']) globalThis[key] = w[key];
  globalThis.devicePixelRatio = 1; globalThis.getComputedStyle = w.getComputedStyle.bind(w);
  let id = 0; const frames = new Map();
  globalThis.requestAnimationFrame = (f) => { frames.set(++id, f); return id; };
  globalThis.cancelAnimationFrame = (i) => frames.delete(i);
  w.HTMLElement.prototype.getBoundingClientRect = () => ({ left: 0, top: 0, width: 640, height: 440 });
  w.HTMLElement.prototype.setPointerCapture = () => {};
  w.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, { get: (o, key) => o[key] || ((...args) => {
    for (const arg of args) if (typeof arg === 'number') assert.ok(Number.isFinite(arg));
  }), set: (o, key, v) => (o[key] = v, true) });
  const errors = []; w.addEventListener('error', (e) => errors.push(e.error || e.message));
  for (const lang of ['fr', 'en']) {
    const root = w.document.createElement('section'); w.document.body.append(root);
    const stop = fourColours(root, { t: (fr, en) => lang === 'fr' ? fr : en, reduced: () => true });
    const stopPolicy = installControlPolicy(root);
    const q = (s) => root.querySelector(s), cv = q('canvas'), text = () => q('.exhibit-readout').textContent;
    const change = (s, v) => { q(s).value = v; q(s).dispatchEvent(new w.Event('change')); };
    const pointer = (type, x, y, pointerId = 1, pointerType = 'mouse') => {
      const e = new w.MouseEvent(type, { clientX: x, clientY: y, button: 0, bubbles: true });
      Object.defineProperties(e, { pointerId: { value: pointerId }, pointerType: { value: pointerType } }); cv.dispatchEvent(e);
    };
    const key = (k) => cv.dispatchEvent(new w.KeyboardEvent('keydown', { key: k, bubbles: true }));
    assert.equal(q('#fc-example').options.length, 9);
    q('[data-c="2"]').click(); assert.equal(q('[data-c="2"]').getAttribute('aria-pressed'), 'true');
    assert.equal(q('[data-c="0"]').getAttribute('aria-pressed'), 'false');
    for (const name of ['grid', 'triangle', 'wheel', 'even-wheel', 'pizza', 'odd-pizza', 'random']) {
      change('#fc-example', name); assert.ok(q('#fc-description').textContent.length > 30);
      q('#fc-auto').click(); assert.match(text(), /bien coloriée|properly coloured/);
      assert.ok(q('[data-c="4"]').hidden); assert.equal(q('#fc-random-options').hidden, name !== 'random');
    }
    change('#fc-example', 'disconnected'); assert.match(text(), /^5 /); assert.ok(!q('[data-c="4"]').hidden);
    await new Promise((resolve) => w.setTimeout(resolve, 0));
    assert.ok(q('#fc-tool').hidden); assert.match(q('.select-value').textContent, /Colorier|Colour/);
    q('#fc-auto').click(); assert.match(text(), /Impossible/); assert.match(text(), /morcelés|disconnected/);
    q('#fc-five').click(); assert.match(text(), /bien coloriée|properly coloured/);
    q('#fc-clear').click(); q('[data-c="0"]').click(); pointer('pointerdown', 50, 150);
    assert.match(text(), /coloriés 1|coloured 1/, 'all pieces of A are counted as one country');
    change('#fc-example', 'custom'); assert.equal(q('#fc-tool').value, 'draw'); assert.match(text(), /^1 /);
    await new Promise((resolve) => w.setTimeout(resolve, 0)); assert.ok(!q('#fc-tool').hidden, 'multiple tools restore the selector');
    assert.ok(q('#fc-undo').disabled); assert.ok(q('.fc-palette').hidden);
    pointer('pointerdown', 160, 120); pointer('pointermove', 360, 320); pointer('pointerup', 360, 320);
    assert.match(text(), /^2 /); assert.equal(q('#fc-example').value, 'custom'); assert.ok(!q('#fc-undo').disabled);
    q('#fc-undo').click(); assert.match(text(), /^1 /); assert.ok(q('#fc-undo').disabled);
    key('Enter'); key('ArrowRight'); key('ArrowRight'); key('Enter'); assert.match(text(), /^2 /);
    q('#fc-undo').click();
    pointer('pointerdown', 160, 120); pointer('pointermove', 360, 320); cv.dispatchEvent(new w.Event('pointercancel')); pointer('pointerup', 360, 320);
    assert.match(text(), /^1 /, 'cancelled pointer cannot create a border');
    key('Enter'); key('ArrowDown'); key('Escape'); key('Enter'); key('ArrowRight'); key('Enter'); assert.match(text(), /^2 /);
    change('#fc-tool', 'paint'); assert.ok(!q('.fc-palette').hidden);
    key('1'); key('Enter'); key('ArrowRight'); key('Enter'); assert.match(text(), /conflit|clashing/);
    q('#fc-auto').click(); assert.match(text(), /bien coloriée|properly coloured/);
    q('#fc-undo').click(); assert.match(text(), /^1 /, 'undo restores the pre-cut map even after painting');
    change('#fc-tool', 'draw'); pointer('pointerdown', 160, 120); pointer('pointerup', 360, 320);
    q('#fc-blank').click(); assert.match(text(), /^1 /); assert.ok(q('#fc-undo').disabled, 'blank map starts a new editing history');
    change('#fc-example', 'custom');
    pointer('pointerdown', 160, 120, 11, 'touch'); pointer('pointerdown', 360, 320, 12, 'touch');
    pointer('pointerup', 360, 320, 12, 'touch'); pointer('pointerup', 160, 120, 11, 'touch'); assert.match(text(), /^1 /, 'pinch cancels drawing');
    assert.ok(!/undefined|NaN|Infinity/.test(root.textContent)); stopPolicy(); stop(); assert.equal(frames.size, 0); root.remove();
  }
  assert.deepEqual(errors, []); dom.window.close();
});
