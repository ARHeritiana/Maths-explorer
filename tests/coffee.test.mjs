// The coffee challenge, pure parts: exact fractions (BigInt) replay the spoonfuls, independently of maths.js, and check
// the answer and the equality "milk in coffee = coffee in milk" after any number of round trips.
import test from "node:test";
import assert from "node:assert/strict";
import { CUPS, cupsOf, roundTrip, start } from "../site/js/challenges/coffee/maths.js";
import { variant } from "../site/js/challenges/coffee/index.js";

const gcd = (a, b) => (b === 0n ? (a < 0n ? -a : a) : gcd(b, a % b));
const F = (n, d = 1n) => { const g = gcd(n, d) || 1n; return [n / g, d / g]; };
const add = ([a, b], [c, d]) => F(a * d + c * b, b * d), sub = ([a, b], [c, d]) => F(a * d - c * b, b * d), mul = ([a, b], [c, d]) => F(a * c, b * d), div = ([a, b], [c, d]) => F(a * d, b * c);
const eq = ([a, b], [c, d]) => a * d === c * b;

function exactTrips(V, v, trips) {
  let A = { c: F(BigInt(V)), m: F(0n) }, B = { c: F(0n), m: F(BigInt(V)) };
  const out = [], sv = F(BigInt(v));
  const spoon = (cup) => { const k = div(sv, add(cup.c, cup.m)); return { c: mul(cup.c, k), m: mul(cup.m, k) }; };
  for (let i = 0; i < trips; i++) {
    const s1 = spoon(A); A = { c: sub(A.c, s1.c), m: sub(A.m, s1.m) }; B = { c: add(B.c, s1.c), m: add(B.m, s1.m) };
    const s2 = spoon(B); B = { c: sub(B.c, s2.c), m: sub(B.m, s2.m) }; A = { c: add(A.c, s2.c), m: add(A.m, s2.m) };
    out.push({ A, B });
  }
  return out;
}

test("coffee: exact fractions give the answer V v / (V + v), a whole number for every preset", () => {
  for (const id of CUPS) {
    const [V, v] = cupsOf(id), [{ A }] = exactTrips(V, v, 1);
    assert.ok(eq(A.m, F(BigInt(V * v), BigInt(V + v))), id);
    assert.equal(A.m[1], 1n, `${id}: whole number`);
    assert.equal(variant.answer({ cups: id }), Number(A.m[0]), id);
    const [a] = roundTrip(V, v, start(V)); assert.ok(Math.abs(a.m - Number(A.m[0])) < 1e-9, `${id}: maths.js`);
  }
});

test("coffee: after every round trip, milk in the coffee equals coffee in the milk, and each mug is back to V", () => {
  for (const id of CUPS) {
    const [V, v] = cupsOf(id);
    for (const { A, B } of exactTrips(V, v, 6)) {
      assert.ok(eq(A.m, B.c), id);
      assert.ok(eq(add(A.c, A.m), F(BigInt(V))) && eq(add(B.c, B.m), F(BigInt(V))), id);
    }
  }
});

// The discrete version: sacks of white and red beans. Whatever the handfuls (drawn at random or chosen), after each
// round trip both sacks hold N beans and the red beans in the white sack equal the white beans in the red sack.
import { BEANS, beansOf, bagsStart, move, grab, count } from "../site/js/challenges/coffee/maths.js";
test("coffee, beans: any handfuls keep both sacks at N and the two foreign counts equal", () => {
  let seed = 3;
  const rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
  for (const id of BEANS) {
    const [N, k] = beansOf(id);
    assert.equal(variant.answer({ cups: id }), 0, id);
    for (let trial = 0; trial < 200; trial++) {
      let bags = bagsStart(N);
      for (let trip = 0; trip < 5; trip++) {
        const out = trial % 2 ? grab(bags[0], k, rnd) : { w: Math.min(k, bags[0].w), r: k - Math.min(k, bags[0].w) };   // random, or as white as possible
        bags = move(bags, 0, out);
        const back = grab(bags[1], k, rnd);
        bags = move(bags, 1, back);
        assert.equal(count(bags[0]), N); assert.equal(count(bags[1]), N);
        assert.equal(bags[0].r, bags[1].w, `${id} trial ${trial}`);
      }
    }
  }
});
