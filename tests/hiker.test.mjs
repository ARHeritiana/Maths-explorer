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

// The side view (plan.js): random mountains with ups and downs, irregular paces with rests and, when allowed, walking
// back; the crossing of the two days is found exactly and checked against a fine scan of the gap.
import { makeProfile, heightAt, makePace, paceAt, day1At, day2At, crossing } from "../site/js/challenges/hiker/plan.js";

test("hiker: every random mountain goes from the foot (0) to the summit (1) with at least one dip, inside [0, 1]", () => {
  for (let seed = 1; seed <= 300; seed++) {
    const h = makeProfile(seed);
    assert.equal(heightAt(h, 0), 0); assert.equal(heightAt(h, 1), 1);
    assert.ok(h.some((v, i) => i > 0 && i < h.length - 1 && v < h[i - 1]), `seed ${seed}: a dip`);
    for (let k = 0; k <= 200; k++) { const v = heightAt(h, k / 200); assert.ok(v >= 0 && v <= 1); }
  }
});

test("hiker: paces start at the foot and end at the top; without the toggle he never walks back, with it he sometimes does", () => {
  let backs = 0;
  for (let seed = 1; seed <= 300; seed++) {
    const fwd = makePace(seed), bk = makePace(seed, { back: true });
    for (const K of [fwd, bk]) { assert.equal(paceAt(K, 0).s, 0); assert.equal(paceAt(K, 1).s, 1); assert.ok(K.every(([, s]) => s >= 0 && s <= 1)); }
    assert.ok(fwd.every(([, s], i) => i === 0 || s >= fwd[i - 1][1]), `seed ${seed}: forward only`);
    if (bk.some(([, s], i) => i > 0 && s < bk[i - 1][1])) backs++;
  }
  assert.ok(backs > 150, `walking back happens often enough (${backs} / 300)`);
});

test("hiker: for any two irregular days, the crossing exists and is the first moment the gap changes sign", () => {
  for (const id of PAIRS) {
    const [T1, T2] = pairOf(id);
    for (let seed = 1; seed <= 80; seed++) {
      const K1 = makePace(seed, { back: seed % 2 === 0 }), K2 = makePace(seed + 500, { back: seed % 3 === 0 }), c = crossing(K1, T1, K2, T2);
      assert.ok(c, `${id} seed ${seed}`);
      assert.ok(Math.abs(day1At(K1, T1, c.hours).s - day2At(K2, T2, c.hours).s) < 1e-9);
      const gap = (t) => day1At(K1, T1, t).s - day2At(K2, T2, t).s;
      for (let i = 0; i < 400; i++) { const t = (c.hours * i) / 400; assert.ok(gap(t) < 1e-9, `no earlier crossing (${id}, ${seed})`); }
    }
  }
});
