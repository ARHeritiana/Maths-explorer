// Collection « contre l'intuition », entry 3: the hundred boxes. The win probability 1 - (1/(m+1) + ... + 1/n) (m = n/2) is checked by an
// exact count of permutations without a cycle longer than m (BigInt recurrence), by brute force for n = 6 and 8, and (roughly) by seeded simulation.
import test from "node:test";
import assert from "node:assert/strict";
import { cycleWinProbability, randomWinProbability, simulate, cycles, longestCycle, cycleSearch, randomPermutation, rng, runAll } from "../dist/js/gallery/gallery-boxes-model.js";

// a(n) = number of permutations of n elements with every cycle of length <= m: choose the cycle of element n (length k, (n-1)!/(n-k)! ways).
function countNoLongCycle(n, m) {
  const fact = [1n]; for (let i = 1; i <= n; i++) fact.push(fact[i - 1] * BigInt(i));
  const a = [1n];
  for (let i = 1; i <= n; i++) { let s = 0n; for (let k = 1; k <= Math.min(i, m); k++) s += (fact[i - 1] / fact[i - k]) * a[i - k]; a.push(s); }
  return { count: a[n], total: fact[n] };
}
test("the exact count of permutations without a cycle above n/2 gives 1 - H(n) + H(n/2)", () => {
  for (const n of [2, 4, 6, 10, 20, 50, 100]) {
    const { count, total } = countNoLongCycle(n, n / 2);
    const exact = Number((count * 10n ** 18n) / total) / 1e18;                 // the probability a(n)/n! to 18 digits
    assert.ok(Math.abs(exact - cycleWinProbability(n)) < 1e-12, `n=${n}: ${exact} vs ${cycleWinProbability(n)}`);
  }
  assert.ok(Math.abs(cycleWinProbability(100) - 0.3118278206898) < 1e-12, "31.18% for 100 prisoners");
  assert.ok(cycleWinProbability(100) > 1 - Math.log(2) && cycleWinProbability(1000) > 1 - Math.log(2));
  assert.equal(randomWinProbability(100), 2 ** -100);
});
test("brute force over all permutations of 6 and 8 elements agrees, and cycle search matches the cycle structure", () => {
  const perms = (k) => { const out = []; const rec = (a, rest) => { if (!rest.length) out.push(a); rest.forEach((x, i) => rec([...a, x], [...rest.slice(0, i), ...rest.slice(i + 1)])); }; rec([], Array.from({ length: k }, (_, i) => i)); return out; };
  for (const n of [6, 8]) {
    let good = 0, all = 0;
    for (const p of perms(n)) {
      all++;
      const everyone = p.every((_, i) => cycleSearch(p, i, n / 2).found);
      assert.equal(everyone, longestCycle(p) <= n / 2);
      if (everyone) good++;
    }
    assert.ok(Math.abs(good / all - cycleWinProbability(n)) < 1e-12, `n=${n}`);
  }
});
test("seeded simulations stay near the exact values (a simulation is not a proof)", () => {
  const games = 20000, w = simulate(100, "cycle", games, 7) / games;
  assert.ok(Math.abs(w - cycleWinProbability(100)) < 0.015, `cycle ${w}`);
  assert.ok(Math.abs(simulate(10, "random", games, 3) / games - randomWinProbability(10)) < 0.002);
  const p = randomPermutation(100, rng(5)); assert.equal(cycles(p).flat().length, 100);
  assert.equal(runAll(p, "cycle", rng(1)).win, longestCycle(p) <= 50);
});
