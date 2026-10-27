import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {playSolution} from '../site/js/challenges/common/player.js';

test('changing solution data leaves only the current playback controls active', () => {
  const dom = new JSDOM('<div id="solution"></div>');
  const previous = {document:globalThis.document,cancelAnimationFrame:globalThis.cancelAnimationFrame};
  globalThis.document = dom.window.document;
  globalThis.cancelAnimationFrame = () => {};
  try {
    const root = document.querySelector('#solution');
    const paints = [0,0,0,0];
    let player;
    for (let generation=0; generation<paints.length; generation++) {
      player?.stop();
      player = playSolution({size:[100,100],steps:()=>[['Start','Start'],['End','End']],draw:()=>paints[generation]++},root,{lang:'en',reduced:true});
    }
    root.querySelector('[data-a="next"]').click();
    assert.equal(root.querySelector('.sol-count').textContent,'Step 2 / 2');
    root.querySelector('[data-a="restart"]').click();
    assert.equal(root.querySelector('.sol-count').textContent,'Step 1 / 2');
    assert.deepEqual(paints,[1,1,1,3],'controls must never repaint a discarded solution');
    player.stop();
  } finally {
    Object.assign(globalThis,previous);
    dom.window.close();
  }
});
