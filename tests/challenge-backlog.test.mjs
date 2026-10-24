import test from "node:test";
import assert from "node:assert/strict";
import { knightMoves, validTour, searchTour, closedTourExists } from "../site/js/challenges/knights/maths.js";
import { FIVE_ROOM_EDGES, eulerCriteria, eulerTrail } from "../site/js/challenges/rooms/maths.js";
import { factorialValuation, trailingZeros, valuationTerms } from "../site/js/challenges/factorials/maths.js";
import { variant as roomVariant, edgesFor } from "../site/js/challenges/rooms/index.js";

function finish(g) { let r; do { r = g.next(); } while (!r.done); return r.value; }
test("knight graph edges agree with independent coordinate distance and are symmetric", () => {
  for (let w = 1; w <= 9; w++) for (let h = 1; h <= 8; h++) for (let v = 0; v < w * h; v++) {
    const expected = []; for (let z = 0; z < w * h; z++) if (Math.abs(v % w - z % w) * Math.abs(Math.floor(v / w) - Math.floor(z / w)) === 2) expected.push(z);
    assert.deepEqual(knightMoves(v, w, h).sort((a, b) => a - b), expected);
  }
});
test("knight search constructs verifiable tours and distinguishes bounded search", () => {
  for (const n of [5, 6, 8]) { const r = finish(searchTour(n, n, { limit: 200000 })); assert.equal(r.status, "found"); assert.ok(validTour(r.path, n)); }
  const c = finish(searchTour(6, 6, { closed: true, prefix: [1] })); assert.equal(c.status, "found"); assert.ok(validTour(c.path, 6, 6, true));
  assert.equal(finish(searchTour(8, 8, { limit: 1 })).status, "limit");
  assert.equal(finish(searchTour(3)).status, "impossible"); assert.equal(finish(searchTour(8, 8, { prefix: [0, 1] })).status, "invalid");
  assert.equal(closedTourExists(5), false); assert.equal(closedTourExists(6), true); assert.equal(closedTourExists(3, 8), false);
  const g = searchTour(8, 8, { batch: 1 }); assert.equal(g.next().done, false); assert.equal(g.return().done, true);
});
test("Euler criterion agrees with independent exhaustive edge-walk enumeration", () => {
  const possible = (edges) => { const go = (v, mask) => mask === (1 << edges.length) - 1 || edges.some(([a, b], i) => !(mask >> i & 1) && (a === v || b === v) && go(a === v ? b : a, mask | 1 << i)); return [0, 1, 2, 3].some((v) => go(v, 0)); };
  const all = [[0, 1], [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
  for (let mask = 0; mask < 1 << all.length; mask++) { const edges = all.filter((_, i) => mask >> i & 1), c = eulerCriteria(edges, 4); assert.equal(c.trail, possible(edges), String(mask)); const trail = eulerTrail(edges, 4); if (c.trail) { assert.equal(trail.length, edges.length); assert.equal(new Set(trail).size, edges.length); let starts = [0, 1, 2, 3]; for (const i of trail) starts = starts.flatMap((v) => edges[i][0] === v ? [edges[i][1]] : edges[i][1] === v ? [edges[i][0]] : []); assert.ok(starts.length); } else assert.equal(trail, null); }
  assert.deepEqual(eulerCriteria(FIVE_ROOM_EDGES).degrees, [5, 5, 4, 5, 4, 9]);
  assert.equal(eulerCriteria(FIVE_ROOM_EDGES).trail, false); assert.equal(eulerCriteria(FIVE_ROOM_EDGES.slice(1)).trail, true);
});
test("Legendre and arbitrary-base zeros agree with independently computed factorials", () => {
  let fact = 1n;
  for (let n = 0; n <= 100; n++) { if (n) fact *= BigInt(n); for (const p of [2, 3, 5, 7, 11]) { let v = fact, k = 0n; while (v % BigInt(p) === 0n) { v /= BigInt(p); k++; } assert.equal(factorialValuation(n, p), k); } for (let b = 2; b <= 40; b++) { let v = fact, k = 0n; while (v % BigInt(b) === 0n) { v /= BigInt(b); k++; } assert.equal(trailingZeros(n, b), k); } }
  assert.equal(factorialValuation(50, 3), 22n); assert.equal(trailingZeros(50), 12n);
  const n = 10n ** 30n, digitSum = n.toString(3).split("").reduce((a, b) => a + BigInt(b), 0n); assert.equal(factorialValuation(n, 3), (n - digitSum) / 2n);
  assert.deepEqual(valuationTerms(0, 3), []); assert.throws(() => factorialValuation(50, 9), RangeError); assert.throws(() => trailingZeros(-1, 10), RangeError);
});

test("the room checker asks for a minimal repair without exposing the parity method", () => {
  function trailExists(edges) {
    const failed = new Set();
    const go = (v, used) => {
      if (used === (1 << edges.length) - 1) return true;
      const key = v * (1 << edges.length) + used;
      if (failed.has(key)) return false;
      if (edges.some(([a, b], i) => !(used >> i & 1) && (a === v || b === v) && go(a === v ? b : a, used | 1 << i))) return true;
      failed.add(key); return false;
    };
    return [0,1,2,3,4,5].some(v => go(v, 0));
  }
  for (const layout of ['original', 'closed-door']) {
    const q = {layout}, edges = edgesFor(q);
    const minimum = trailExists(edges) ? 0 : edges.some((_, i) => trailExists(edges.filter((_, j) => j !== i))) ? 1 : 2;
    assert.equal(roomVariant.answer(q), minimum);
    assert.doesNotMatch(roomVariant.prompt(q).join(' '), /impair|odd|degr[ée]|Euler/i);
  }
});
