// Visual identity (docs/DESIGN_V5.md): every field has one stable hue, hues are defined for both themes
// and keep 3:1 contrast with their surface (they are marks, never text).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TOPICS } from '../site/js/topic-registry.js';

const css = readFileSync(new URL('../site/styles/explorer.css', import.meta.url), 'utf8');
const theme = (name) => css.slice(css.indexOf(name)).split('}')[0];
const tokens = (block) => Object.fromEntries([...block.matchAll(/--(c\d+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
const lum = (h) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((x) => x <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4); return .2126 * r + .7152 * g + .0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };

test('each field has a hue among c1..c11, used once', () => {
  const map = Object.fromEntries([...css.matchAll(/\[data-topic="([a-z]+)"\]\s*\{\s*--hue:\s*var\(--(c\d+)\)/g)].map((m) => [m[1], m[2]]));
  assert.deepEqual(Object.keys(map).sort(), TOPICS.map((t) => t.id).sort());
  assert.equal(new Set(Object.values(map)).size, TOPICS.length);
});

for (const [name, surface] of [[':root, :root[data-theme="jour"]', '#ffffff'], [':root[data-theme="nuit"]', '#131a28']]) {
  test(`eleven hues defined and visible on the surface (${name.includes('nuit') ? 'nuit' : 'jour'})`, () => {
    const t = tokens(theme(name));
    for (let i = 1; i <= 11; i++) {
      assert.ok(t['c' + i], 'c' + i);
      assert.ok(ratio(t['c' + i], surface) >= 3, `c${i} ${t['c' + i]} contrast ${ratio(t['c' + i], surface).toFixed(2)}`);
    }
  });
}

test('topicOf: a record is coloured by the field that names it, not by a word match', async () => {
  const { topicOf } = await import('../site/js/topic-registry.js');
  assert.equal(topicOf({ id: 'derivative', title: ['Tangente', 'Tangent'] }, 'lab'), 'analysis');
  assert.equal(topicOf({ id: 'quadratic' }, 'lab'), 'algebra');
  assert.equal(topicOf({ id: 'probability' }, 'lab'), 'probability');
  assert.equal(topicOf({ id: 'x', topics: ['topology/knots'] }, 'lab'), 'topology');
  assert.ok(TOPICS.some((t) => t.id === topicOf({ id: 'unknown-thing' }, 'lab')));
});
