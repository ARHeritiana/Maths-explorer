import test from 'node:test';
import assert from 'node:assert/strict';
import {labs} from '../site/js/content.js';
import {ART} from '../site/js/home-art.js';

test('every curiosity card has a registered illustration', () => {
  for (const item of labs.filter(item => item.custom)) {
    assert.equal(typeof ART[item.id], 'function', item.id);
  }
});
