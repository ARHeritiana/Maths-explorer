// The hiker challenge, pure parts: the meeting minute against a minute-by-minute search, and the claim of the original
// question (some place is passed at the same time on both days) on random walks with rests and backtracking.
import test from "node:test";
import assert from "node:assert/strict";
import { PAIRS, pairOf, up, down } from "../site/js/challenges/hiker/maths.js";
import { variant } from "../site/js/challenges/hiker/index.js";

test("hiker: the meeting minute is the only minute when both days put him at the same place", () => {
  for (const id of PAIRS) {
    const [T1, T2] = pairOf(id), hits = [];
    for (let m = 0; m <= 720; m++) if (m * (T1 + T2) === 60 * T1 * T2) hits.push(m);   // m/(60 T1) = 1 - m/(60 T2), in whole numbers
    assert.equal(hits.length, 1, id);
    assert.equal(variant.answer({ pair: id }), hits[0], id);
    assert.ok(Math.abs(up(hits[0] / 60, T1) - down(hits[0] / 60, T2)) < 1e-12, `${id}: maths.js agrees`);
  }
});

test("hiker: any two walks (rests, backtracking) from foot to top and from top to foot cross at some moment", () => {
  let seed = 7;
  const rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
  const walk = (from, to) => { const k = 12, pts = [from]; for (let i = 1; i < k; i++) pts.push(rnd()); pts.push(to); return (x) => { const s = Math.min(k - 1e-9, x * k), i = Math.floor(s); return pts[i] + (pts[i + 1] - pts[i]) * (s - i); }; };
  for (let trial = 0; trial < 500; trial++) {
    const day1 = walk(0, 1), day2 = walk(1, 0), gap = (x) => day1(x) - day2(x);
    let lo = 0, hi = 1;
    assert.ok(gap(lo) < 0 && gap(hi) > 0);
    for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (gap(mid) < 0) lo = mid; else hi = mid; }
    assert.ok(Math.abs(gap(lo)) < 1e-9, `trial ${trial}`);
  }
});
