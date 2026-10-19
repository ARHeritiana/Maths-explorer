// The four colour exhibit: neighbours share a border (a point is not enough), the solver's colourings are proper, the wheel
// needs four colours and the pizza two, and every random map of the exhibit is coloured with at most four.
import test from "node:test";
import assert from "node:assert/strict";
import * as FC from "../dist/js/gallery-four-colour-model.js";

// independent check of a colouring: every shared border has two different colours, by brute force over the edges
const proper = (edges, col) => edges.every(([i, j]) => col[i] !== col[j]);
// independent chromatic number by trying every assignment of k colours (small maps only)
function bruteChromatic(n, edges) {
  for (let k = 1; k <= 4; k++) {
    const col = Array(n).fill(0);
    for (let code = 0; code < k ** n; code++) { let c = code; for (let i = 0; i < n; i++) { col[i] = c % k; c = Math.floor(c / k); } if (proper(edges, col)) return k; }
  }
  return 5;
}

test("four colours: the wheel needs exactly four colours, the pizza two (slices touch only at the centre)", () => {
  const w = FC.wheelMap(), we = FC.neighbours(w);
  assert.equal(we.length, 10, "centre to 5 sectors and 5 sectors in a ring");
  assert.equal(FC.chromatic(w.length, we), 4); assert.equal(bruteChromatic(w.length, we), 4);
  const p = FC.pizzaMap(), pe = FC.neighbours(p);
  assert.equal(pe.length, 8, "each slice touches its two neighbours, not the opposite ones");
  assert.equal(FC.chromatic(p.length, pe), 2); assert.equal(bruteChromatic(p.length, pe), 2);
});

test("four colours: random maps of 6 to 30 countries are coloured properly with at most four colours", () => {
  for (let n = 6; n <= 30; n += 3) for (const seed of [1, 7, 19]) {
    const m = FC.randomMap(n, seed), e = FC.neighbours(m), col = FC.colourWith(m.length, e, 4);
    assert.ok(m.length >= n - 2, `${n} ${seed}: ${m.length} countries`);
    assert.ok(col && proper(e, col) && col.every((c) => c >= 0 && c < 4), `${n} ${seed}`);
    assert.deepEqual(FC.conflicts(e, col), []);
    if (m.length <= 9) assert.equal(FC.chromatic(m.length, e), bruteChromatic(m.length, e));
  }
});

test("four colours: two squares meeting at a corner are not neighbours; side by side they are", () => {
  const sq = (x, y) => [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]];
  assert.equal(FC.neighbours([sq(0, 0), sq(1, 1)]).length, 0);
  assert.equal(FC.neighbours([sq(0, 0), sq(1, 0)]).length, 1);
  assert.equal(FC.neighbours([sq(0, 0), sq(1, 0.5)]).length, 1, "a partial shared side counts");
  assert.ok(FC.pointIn([0.5, 0.5], sq(0, 0)) && !FC.pointIn([1.5, 0.5], sq(0, 0)));
});
