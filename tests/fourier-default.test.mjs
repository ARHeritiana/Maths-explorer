// The Fourier circles exhibit never opens on a single circle: Madagascar on 24, every other outline on at least 12, and nothing
// restarts by itself from one circle (the build-up plays only on request).
import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {mountObject} from '../site/js/lab-objects.js';
test('Fourier circles: the default number of circles is never 1, for every outline, in both languages', () => {
  const dom = new JSDOM('<main></main>', {pretendToBeVisual: true}), w = dom.window;
  for (const key of ['window', 'document', 'CustomEvent', 'Event', 'MouseEvent']) globalThis[key] = w[key];
  globalThis.devicePixelRatio = 1; globalThis.getComputedStyle = w.getComputedStyle.bind(w);
  let n = 0; const frames = new Map(); globalThis.requestAnimationFrame = (fn) => { frames.set(++n, fn); return n; }; globalThis.cancelAnimationFrame = (k) => frames.delete(k);
  w.HTMLElement.prototype.getBoundingClientRect = () => ({left: 0, top: 0, width: 640, height: 440}); w.Element.prototype.getBoundingClientRect = w.HTMLElement.prototype.getBoundingClientRect;
  w.HTMLElement.prototype.setPointerCapture = () => {};
  w.HTMLCanvasElement.prototype.getContext = function () { return new Proxy({}, {get: (target, p) => target[p] || (() => {}), set: (target, p, v) => { target[p] = v; return true; }}); };
  let now = 0; const tick = (k = 1) => { for (let i = 0; i < k; i++) { const work = [...frames.values()]; frames.clear(); now += 40; work.forEach((fn) => fn(now)); } };
  for (const lang of ['fr', 'en']) {
    const root = w.document.createElement('section'); w.document.body.append(root);
    const stop = mountObject('fourier', root, {lang, reduced: false}); tick(2);
    const count = () => +root.querySelector('#fr-n').value;
    assert.ok(count() >= 12, `${lang}: Madagascar opens on ${count()} circles`);
    const radios = [...root.querySelectorAll('input[name="fr-shape"]')].filter((r) => r.value !== 'mine');
    assert.ok(radios.length >= 3, 'the outline choices exist');
    for (const radio of radios) {
      radio.checked = true; radio.dispatchEvent(new w.Event('change', {bubbles: true})); tick(2);
      assert.ok(count() >= 12, `${lang}: outline ${radio.value} opens on ${count()} circles`);
      tick(400);   // a long run: the picture never falls back to one circle by itself
      assert.ok(count() >= 12, `${lang}: outline ${radio.value} fell back to ${count()} circles after a long run`);
    }
    stop(); root.remove();
  }
});
