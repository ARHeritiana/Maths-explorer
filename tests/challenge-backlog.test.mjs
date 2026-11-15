import test from "node:test";
import assert from "node:assert/strict";
import { knightMoves, validTour, searchTour, closedTourExists } from "../site/js/challenges/knights/maths.js";
import { FIVE_ROOM_EDGES, eulerCriteria, eulerTrail } from "../site/js/challenges/rooms/maths.js";
import { factorialValuation, trailingZeros, valuationTerms } from "../site/js/challenges/factorials/maths.js";
import { variant as roomVariant, edgesFor } from "../site/js/challenges/rooms/index.js";
import { doorLine } from "../site/js/challenges/rooms/solution.js";
import { DOORS, STAND, HOUSE } from "../site/js/challenges/rooms/art.js";

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

// The rooms solution turns the plan into a sketch: a point per room, one point O for the outside, a line per door.
const O = [HOUSE.w / 2, HOUSE.h + 118];
const segs = (pts) => pts.slice(1).map((p, k) => [pts[k], p]);
const near = (p, q, r) => Math.hypot(p[0] - q[0], p[1] - q[1]) < r;
const segDist = (p, [a, b]) => { const dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1))); return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy); };
const sample = (pts, step = 1) => segs(pts).flatMap(([a, b]) => { const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step)); return Array.from({ length: n }, (_, k) => [a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]); });

test("rooms sketch: every door line runs from its room's point through its door to the other room's point or to O", () => {
  DOORS.forEach((d, k) => {
    const line = doorLine(k);
    assert.deepEqual(line[0], STAND[d.a], `door ${k} starts at its room`);
    assert.ok(segs(line).some((s) => segDist([d.x, d.y], s) < 1e-9), `door ${k} goes through its door`);
    assert.deepEqual(line.at(-1), d.b === 5 ? O : STAND[d.b], `door ${k} ends at ${d.b === 5 ? "O" : "the other room"}`);
  });
});

test("rooms sketch: outside lines never touch the house walls except at their own door, and stay outside it", () => {
  DOORS.forEach((d, k) => {
    if (d.b !== 5) return;
    const outside = sample(doorLine(k).slice(1)).slice(1);
    for (const p of outside) assert.ok(!(p[0] > 1 && p[0] < HOUSE.w - 1 && p[1] > 1 && p[1] < HOUSE.h - 1), `door ${k} line re-enters the house at ${p}`);
  });
});

test("rooms sketch (owner rule: lines to the outside each reach O, never meet elsewhere): no two door lines meet or come close except at a room point or at O", () => {
  const ends = [...STAND.slice(0, 5), O], R = 22, GAP = 6;   // R: radius of a drawn point in house units (14 px / 0.72 plus margin)
  for (let i = 0; i < DOORS.length; i++) for (let j = i + 1; j < DOORS.length; j++) {
    const A = doorLine(i), B = doorLine(j);
    for (const p of sample(A)) {
      if (ends.some((e) => near(p, e, R))) continue;
      const dmin = Math.min(...segs(B).map((s) => segDist(p, s)));
      assert.ok(dmin >= GAP, `lines of doors ${i} and ${j} come within ${dmin.toFixed(1)} at (${p.map((v) => v.toFixed(0))})`);
    }
  }
});
