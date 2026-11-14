// Page side of offline support (site/js/offline.js): inert where a service worker cannot exist, pure notice wording,
// and the worker source keeps its contract (placeholder for the build, no unconditional skipWaiting).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { installOffline, offlineNotice, canRegister } from '../site/js/offline.js';

const page = () => new JSDOM('<!doctype html><html lang="fr"><body></body></html>', { url: 'https://example.org/site/' }).window;

test('inert in Node, under file:// and without navigator.serviceWorker', () => {
  assert.equal(installOffline({}), null);
  assert.equal(installOffline(globalThis), null);
  assert.equal(canRegister({ location: { protocol: 'file:' }, navigator: { serviceWorker: {} } }), false);
  assert.equal(canRegister({ location: { protocol: 'https:' }, navigator: {} }), false);
  assert.equal(canRegister({ location: { protocol: 'http:' }, navigator: { serviceWorker: {} } }), true);
  const window = page();
  assert.ok(installOffline(window), 'the badge still installs');
  assert.equal(window.document.querySelector('.offline-bar'), null, 'nothing is shown while online');
});

test('the badge follows the online and offline events, in the language of the page', () => {
  const window = page();
  installOffline(window);
  window.dispatchEvent(new window.Event('offline'));
  const bar = window.document.querySelector('.offline-bar');
  assert.equal(bar.getAttribute('role'), 'status');
  assert.equal(bar.hidden, false);
  assert.equal(bar.textContent, 'Hors connexion');
  window.document.documentElement.lang = 'en';
  window.dispatchEvent(new window.Event('offline'));
  assert.equal(bar.textContent, 'Offline');
  window.dispatchEvent(new window.Event('online'));
  assert.equal(bar.hidden, true);
});

test('notice wording: update with a reload action, missing content, both languages', () => {
  assert.deepEqual(offlineNotice({ online: true }), []);
  const fr = offlineNotice({ online: false, update: true, miss: true }, 'fr');
  assert.deepEqual(fr.map(p => p.kind), ['offline', 'miss', 'update']);
  assert.equal(fr[2].text, 'Nouvelle version disponible');
  assert.equal(fr[2].action, 'Recharger');
  const en = offlineNotice({ update: true }, 'en');
  assert.equal(en[0].text, 'New version available');
  assert.equal(en[0].action, 'Reload');
});

test('worker source: one placeholder for the build, skipWaiting only on request, GET and same origin only', () => {
  const source = readFileSync(new URL('../site/sw.js', import.meta.url), 'utf8');
  assert.equal(source.split('self.__MX_SHELL = null;').length, 2);
  const active = source.slice(source.indexOf('if (SHELL) {'), source.indexOf('} else {'));
  assert.ok(active.length > 0 && !active.includes('skipWaiting()'), 'a built worker never skips waiting at install');
  assert.match(source, /type === 'mx-skip-waiting'\) self\.skipWaiting\(\)/);
  assert.match(source, /request\.method !== 'GET'\) return/);
  assert.match(source, /url\.origin !== self\.location\.origin/);
  assert.match(source, /response\.status !== 200 \|\| response\.type !== 'basic'/);
});
