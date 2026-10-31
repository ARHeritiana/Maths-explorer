// Laboratory index: the domain filter. Every experiment is reachable under at least one field, a field shows exactly the
// experiments that belong to it, groups with nothing to show are hidden, and "All" restores everything.
import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<div id="root"></div>', { url: 'https://example.org/#lab' });
for (const key of ['window', 'document', 'location', 'history', 'localStorage', 'Node', 'Element', 'HTMLElement', 'Event']) {
  try { globalThis[key] = dom.window[key]; } catch { Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true }); }
}
globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
const { indexPage, bindLabIndex } = await import('../dist/js/lab/page.js');
const { EXPERIMENTS } = await import('../dist/js/lab/registry.js');
const { membershipsFor } = await import('../dist/js/topic-registry.js');

const t = (v) => (Array.isArray(v) ? v[0] : v), pair = (fr) => fr, link = (k, id = '') => `#${k}${id ? '/' + id : ''}`;
const mount = () => { const root = dom.window.document.getElementById('root'); root.innerHTML = indexPage({ t, pair, link, completed: new Set() }); bindLabIndex(root, pair); return root; };
const visible = (root) => [...root.querySelectorAll('.lab2-card-link')].filter((a) => !(a.closest('.lab2-sub') || a).hidden && !a.closest('.lab2-group').hidden);
const fieldsOf = (e) => new Set(membershipsFor(e, 'lab').map((m) => m.split('/')[0]));

test('every experiment appears under All and under at least one field', () => {
  const root = mount();
  assert.equal(visible(root).length, EXPERIMENTS.length);
  assert.ok(EXPERIMENTS.every((e) => fieldsOf(e).size >= 1));
});

test('a field shows exactly its experiments, and All restores the rest', () => {
  const root = mount();
  for (const btn of root.querySelectorAll('.domain-filter button[data-field]:not([data-field=""])')) {
    btn.click();
    const expected = EXPERIMENTS.filter((e) => fieldsOf(e).has(btn.dataset.field)).map((e) => e.id).sort();
    const shown = visible(root).map((a) => a.getAttribute('href').split('/').pop()).sort();
    assert.deepEqual(shown, expected, btn.dataset.field);
    assert.equal(btn.getAttribute('aria-pressed'), 'true');
    for (const g of root.querySelectorAll('.lab2-group')) assert.equal(g.hidden, ![...g.querySelectorAll('.lab2-card-link')].some((a) => !(a.closest('.lab2-sub') || a).hidden));
  }
  root.querySelector('.domain-filter button[data-field=""]').click();
  assert.equal(visible(root).length, EXPERIMENTS.length);
  assert.equal(root.querySelector('#domain-count').textContent, '');
});
