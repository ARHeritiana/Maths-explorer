// Figure and console (site/js/figure-layout.js): the pure rules (which column a block goes to, choice or toggles), and the
// sorting of a mounted exhibit under jsdom (controls beside the figure, caption under it, a rebuild sorted again).
import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {columnOf, pressedKind, arrangeFigure} from '../site/js/figure-layout.js';

test('blocks go to the figure or to the console', () => {
  assert.equal(columnOf({classes: ['act-controls']}), 'console');
  assert.equal(columnOf({classes: ['exhibit-metrics']}), 'console');
  assert.equal(columnOf({classes: ['act-readout']}), 'main', 'the readout is the caption of the figure');
  assert.equal(columnOf({classes: ['obj-stage']}), 'main');
  assert.equal(columnOf({classes: ['act-controls'], hasCanvas: true}), 'main', 'a block holding a canvas stays with the figure');
});

test('one pressed button among several is a choice, otherwise toggles', () => {
  assert.equal(pressedKind(['true', 'false', 'false']), 'choice');
  assert.equal(pressedKind(['true', 'true']), 'toggle');
  assert.equal(pressedKind(['false', 'false']), 'toggle');
  assert.equal(pressedKind(['true']), 'toggle', 'a single button is an on/off toggle');
});

test('an exhibit is sorted into figure and console, and sorted again after a rebuild', () => {
  const {window: w} = new JSDOM('<section id="r"></section>');
  const root = w.document.querySelector('#r');
  root.innerHTML = '<p class="act-help">help</p><div class="obj-stage"><canvas></canvas></div><dl class="exhibit-metrics"></dl><figure class="exhibit-plot"></figure><div class="act-controls"><button aria-pressed="true">A</button><button aria-pressed="false">B</button></div><p class="act-readout"></p>';
  const stop = arrangeFigure(root);
  const main = root.querySelector('.fig-main'), side = root.querySelector('.fig-console');
  assert.ok(main.querySelector('.obj-stage') && main.querySelector('.act-readout'));
  // jsdom has no layout (width 0): the narrow order puts the plot after the console, in the page and the keyboard order
  const plot = root.querySelector('.exhibit-plot');
  assert.ok(plot.hasAttribute('data-fig-after') && side.compareDocumentPosition(plot) & w.Node.DOCUMENT_POSITION_FOLLOWING);
  assert.ok(side.querySelector('.act-controls') && side.querySelector('.exhibit-metrics') && side.querySelector('.act-help'));
  assert.equal(side.querySelector('button').dataset.fig, 'choice');
  stop();
  const again = w.document.createElement('section');
  again.innerHTML = '<div class="obj-stage"><canvas></canvas></div>';
  const stop2 = arrangeFigure(again);
  assert.ok(again.querySelector('.fig-split.fig-solo'), 'a figure with no controls takes the whole width');
  stop2();
});

test('an inset sits in the figure when wide and goes back to its place in the console when narrow', () => {
  const {window: w} = new JSDOM('<section id="r"></section>');
  const root = w.document.querySelector('#r');
  root.innerHTML = '<div class="exhibit-stage"><canvas></canvas></div><div class="act-controls"><button>A</button><figure data-fig-inset>map</figure><button>B</button></div>';
  let width = 1200;
  Object.defineProperty(root, 'clientWidth', {get: () => width});
  const stop = arrangeFigure(root);
  const inset = root.querySelector('[data-fig-inset]');
  assert.equal(inset.parentElement, root.querySelector('.exhibit-stage'), 'wide: in the corner of the figure');
  // narrow: a rebuild of the markup is not needed, a resize places it back between its neighbours
  width = 400;
  root.append(w.document.createElement('p'));   // any new block triggers a sort, as a resize would
  return new Promise((done) => setTimeout(() => {
    assert.equal(inset.closest('.fig-console .act-controls') !== null, true, 'narrow: back in the console');
    assert.equal(inset.previousElementSibling?.textContent, 'A');
    stop(); done();
  }, 0));
});
