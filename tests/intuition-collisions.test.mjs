// Collection « contre l'intuition », entry 1: colliding blocks. The count is checked three ways: the exhibit's event-driven simulation
// (floating point, with positions), an independent EXACT simulation in BigInt rationals (velocities only), and the angle formula.
import test from "node:test";
import assert from "node:assert/strict";
import { simulate, angleCount, collisionCount, energy } from "../dist/js/gallery/gallery-collisions-model.js";

// Exact: both velocities are integers a/D, b/D over a common denominator D that is never reduced (so no gcd is needed).
// Light block mass 1, heavy block mass M arriving at speed -1; the light one rests. A block collision happens iff vA > vB, a wall one iff vA < 0.
function exactCount(M) {
  const Mb = BigInt(M);
  let a = 0n, b = -1n, n = 0;
  for (;;) {
    if (a > b) { const na = (1n - Mb) * a + 2n * Mb * b, nb = (Mb - 1n) * b + 2n * a; a = na; b = nb; n++; }   // D is multiplied by M + 1
    else if (a < 0n) { a = -a; n++; }
    else break;
  }
  return n;
}
test("collision counts: 1, 100, 10^4, 10^6 give 3, 31, 314, 3141 (exact rational simulation)", () => {
  const expected = { 1: 3, 100: 31, 10000: 314, 1000000: 3141 };
  for (const [M, n] of Object.entries(expected)) {
    assert.equal(exactCount(M), n, `exact ${M}`);
    assert.equal(collisionCount(Number(M)), n, `event-driven ${M}`);
    assert.equal(angleCount(Number(M)), n, `angle formula ${M}`);
  }
});
test("the three methods agree for other ratios too", () => {
  for (const M of [2, 3, 4, 5, 7, 10, 16, 50, 1000, 100000]) {
    assert.equal(collisionCount(M), exactCount(M), `ratio ${M}`);
    assert.equal(angleCount(M), exactCount(M), `angle ${M}`);
  }
});
test("energy is conserved at every collision and positions are consistent (no penetration)", () => {
  for (const ratio of [1, 100, 10000]) {
    const s = simulate({ ratio }), E0 = energy(s.events[0], ratio);
    s.events.forEach((e, i) => {
      assert.ok(Math.abs(energy(e, ratio) - E0) < 1e-9 * E0, `energy ${ratio} #${i}`);
      assert.ok(e.xA >= 0.5 - 1e-6 && e.xB - 0.5 >= e.xA + 0.5 - 1e-6, `no overlap ${ratio} #${i}`);
    });
    assert.equal(s.block + s.wall, s.total);
  }
});
test("the count does not depend on the starting positions", () => {
  for (const [xA, xB] of [[1, 3], [2, 8], [3, 11]]) assert.equal(simulate({ ratio: 10000, xA, xB }).total, 314);
});
