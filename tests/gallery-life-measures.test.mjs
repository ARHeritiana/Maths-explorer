// Measures of the Game of Life exhibit: births and deaths of a transition, and the observed repeat of a shape.
import test from 'node:test';
import assert from 'node:assert/strict';
import {presetSet,step,fromCells,transition,shapeOf,observedRepeat} from '../site/js/gallery/gallery-life-model.js';

const shapesOf = (id, gens) => { let s = presetSet(id); const out = [shapeOf(s)]; for (let i = 0; i < gens; i++) { s = step(s); out.push(shapeOf(s)); } return out; };

test('births and deaths of the blinker: two cells are born, two die, the population stays 3', () => {
  const a = presetSet('blinker'), b = step(a);
  assert.deepEqual(transition(a, b), { born: 2, died: 2 });
  assert.equal(a.size, b.size);
});
test('births and deaths of a lone cell and of an empty set', () => {
  assert.deepEqual(transition(fromCells([[0, 0]]), step(fromCells([[0, 0]]))), { born: 0, died: 1 });
  assert.deepEqual(transition(new Set(), new Set()), { born: 0, died: 0 });
});
test('a glider has population 5 in every generation but repeats its shape every 4 generations, shifted one cell diagonally', () => {
  let s = presetSet('glider');
  for (let i = 0; i < 12; i++) { assert.equal(s.size, 5); s = step(s); }
  const r = observedRepeat(shapesOf('glider', 8));
  assert.equal(r.period, 4);
  assert.equal(Math.abs(r.dx), 1); assert.equal(Math.abs(r.dy), 1);
});
test('a blinker repeats every 2 generations in place; a still life every generation', () => {
  assert.deepEqual(observedRepeat(shapesOf('blinker', 4)), { period: 2, dx: 0, dy: 0 });
  assert.deepEqual(observedRepeat([shapeOf(fromCells([[0,0],[1,0],[0,1],[1,1]])), shapeOf(fromCells([[0,0],[1,0],[0,1],[1,1]]))]), { period: 1, dx: 0, dy: 0 });
});
test('no repeat is claimed before it has been seen, nor for the R-pentomino early on', () => {
  assert.equal(observedRepeat(shapesOf('glider', 2)), null);
  assert.equal(observedRepeat(shapesOf('rpent', 30)), null);
});
test('a pattern above the size cap is not measured', () => {
  const big = fromCells(Array.from({ length: 300 }, (_, i) => [i * 2, 0]));
  assert.equal(shapeOf(big), null);
  assert.equal(observedRepeat([null, null]), null);
});
