// Regression: fmt(n, lang, 0) used to strip integer zeros ("60" -> "6", "0" -> ""), which broke the
// degree readout of the unit-circle widget (expertes-03, premiere-10, terminale-14). Audit 2026-10-17.
import test from 'node:test';
import assert from 'node:assert/strict';
import {fmt} from '../site/slides/widgets.js';

test('fmt keeps integer zeros when there are no decimals', () => {
  for (const n of [0, 10, 60, 90, 100, 180, 270, 300, 360, -30]) assert.equal(fmt(n, 1, 0), String(n));
  assert.equal(fmt(0, 0, 0), '0');
});

test('fmt strips only decimal zeros and uses the language separator', () => {
  assert.equal(fmt(2.5, 1), '2.5');
  assert.equal(fmt(2.5, 0), '2,5');
  assert.equal(fmt(3, 1), '3');
  assert.equal(fmt(20.0, 1, 2), '20');
  assert.equal(fmt(0.1 + 0.2, 1), '0.3');
  assert.equal(fmt(-0.001, 1), '0');
  assert.equal(fmt(Infinity, 1), '∞');
});
