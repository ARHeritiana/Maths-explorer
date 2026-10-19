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

test('four colours: all named examples have the claimed minimum; disconnected letters form K5', () => {
  const minima = { grid: 2, triangle: 4, wheel: 4, 'even-wheel': 3, pizza: 2, 'odd-pizza': 3, disconnected: 5, custom: 1 };
  for (const ex of FC.MAP_EXAMPLES.filter((e) => e.id !== 'random')) {
    const { map, groups = map.map((_, i) => i) } = ex.make(), n = new Set(groups).size;
    const edges = FC.countryEdges(map, groups), k = minima[ex.id];
    assert.equal(FC.chromatic(n, edges), k, ex.id);
    assert.ok(proper(edges, FC.colourWith(n, edges, k)), ex.id);
    if (k > 1) assert.equal(FC.colourWith(n, edges, k - 1), null, ex.id);
    // Independent exhaustive assignment check for the small examples; includes K5's 4^5 assignments.
    if (n <= 8) assert.equal(bruteChromatic(n, edges), k, ex.id);
  }
  const { map, groups } = FC.disconnectedMap(), edges = FC.countryEdges(map, groups);
  assert.equal(map.length, 11); assert.equal(edges.length, 10);
  for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) assert.ok(edges.some(([a, b]) => a === i && b === j));
  assert.equal(FC.chromatic(map.length, FC.neighbours(map)), 2, 'separate pieces are just a two-colour strip');
});

test('four colours: drawn borders preserve area, disjoint interiors and valid shared borders', () => {
  const original = FC.blankMap()[0]; let map = [original];
  for (let i = 0; i < 24; i++) {
    // Cut through the centre of the largest piece, changing direction each time.
    const poly = [...map].sort((a, b) => FC.polygonArea(b) - FC.polygonArea(a))[0];
    const c = poly.reduce((s, p) => s.map((v, j) => v + p[j] / poly.length), [0, 0]);
    const a = i * 2.399, parts = FC.splitCountry(poly, c, [c[0] + 100 * Math.cos(a), c[1] + 100 * Math.sin(a)]);
    assert.ok(parts); assert.equal(FC.countryEdges(parts).length, 1, 'new pieces share a positive-length border');
    assert.ok(Math.abs(parts.reduce((s, p) => s + FC.polygonArea(p), 0) - FC.polygonArea(poly)) < 1e-6);
    map = map.flatMap((p) => p === poly ? parts : [p]);
  }
  assert.equal(map.length, 25);
  assert.ok(Math.abs(map.reduce((s, p) => s + FC.polygonArea(p), 0) - 592 * 392) < 1e-6);
  // An independent point raster sees one and only one country almost everywhere away from borders.
  for (let x = 24.37; x < 616; x += 13.1) for (let y = 24.73; y < 416; y += 11.3) {
    assert.equal(map.filter((p) => FC.pointIn([x, y], p)).length, 1);
  }
  assert.ok(proper(FC.countryEdges(map), FC.colourWith(map.length, FC.countryEdges(map), 4)));
  assert.equal(FC.splitCountry(original, [100, 100], [101, 101]), null, 'ignore accidental taps');
  assert.equal(FC.splitCountry(original, [24, 24], [616, 24]), null, 'existing border does not add a country');
  assert.equal(FC.splitCountry(original, [24.01, 24], [24.01, 416]), null, 'reject unusably tiny slivers');
});
