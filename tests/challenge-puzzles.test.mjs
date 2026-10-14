// Independent verification of the classic puzzles (grid paths, horses, cake, queens, snail, bridge, light egg, fake coins).
import test from "node:test";
import assert from "node:assert/strict";
import { pascalGrid, gridPaths, horsesTop3, horsesTop1, horseRaces, squarePoint, cakeShares, unattacked, QUEENS, queensBest, snailDays, snailTrace, bridgePlans, bridgeBest, BRIDGE_SETS, bridgeTimes, eggWeighings, splitThree, minSample, classicSample, identifies } from "../dist/js/challenge-puzzles.js";

const rng = (seed) => () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const shuffle = (a, r) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

test("grid paths: counting every path agrees with the Pascal grid and with the binomial coefficient", () => {
  for (let m = 1; m <= 7; m++) for (let n = 1; n <= 7; n++) {
    const count = (i, j) => (i === m && j === n ? 1 : (i < m ? count(i + 1, j) : 0) + (j < n ? count(i, j + 1) : 0));
    assert.equal(count(0, 0), gridPaths(m, n), `${m}x${n}`);
    let c = 1; for (let k = 1; k <= n; k++) c = (c * (m + k)) / k;   // C(m + n, n) built multiplicatively
    assert.equal(Math.round(c), gridPaths(m, n));
  }
  assert.equal(gridPaths(6, 4), 210);
  assert.deepEqual(pascalGrid(3, 3).map((r) => r[3]), [1, 4, 10, 20]);
});

test("horses: the seven-race method finds the three fastest of every random order; five heats plus one race find the fastest", () => {
  const r = rng(7);
  for (let trial = 0; trial < 2000; trial++) {
    const perm = shuffle(Array.from({ length: 25 }, (_, i) => i), r), speed = (h) => perm[h];
    const res = horsesTop3(speed), truth = [...Array(25).keys()].sort((a, b) => speed(b) - speed(a)).slice(0, 3);
    assert.deepEqual(res.top3, truth); assert.equal(res.races, 7);
    assert.ok(res.log.every((l) => l.horses.length <= 5));
    assert.equal(horsesTop1(speed).top1, truth[0]); assert.equal(horsesTop1(speed).races, 6);
  }
  assert.equal(horseRaces(3), 7); assert.equal(horseRaces(1), 6);
});

test("cake: equally spaced cuts from any starting point share volume and cream equally; the shares always add up to 1", () => {
  const r = rng(11);
  for (let n = 2; n <= 12; n++) for (let trial = 0; trial < 20; trial++) {
    const t0 = r() * 4, shares = cakeShares(Array.from({ length: n }, (_, i) => t0 + (4 * i) / n));
    for (const s of shares) { assert.ok(Math.abs(s.volume - 1 / n) < 1e-12, `${n} volume`); assert.ok(Math.abs(s.cream - 1 / n) < 1e-12, `${n} cream`); }
  }
  for (let trial = 0; trial < 50; trial++) { const cuts = Array.from({ length: 5 }, () => r() * 4), s = cakeShares(cuts); assert.ok(Math.abs(s.reduce((a, x) => a + x.volume, 0) - 1) < 1e-12); assert.ok(Math.abs(s.reduce((a, x) => a + x.cream, 0) - 1) < 1e-12); }
  // cutting from the centre to the corners (n = 4) is fair; cutting a 5-piece cake at the corners is not
  assert.ok(cakeShares([0, 1, 2, 3, 3.5]).some((s) => Math.abs(s.volume - 0.2) > 0.01));
  assert.deepEqual(squarePoint(0.5), [0.5, 0]); assert.deepEqual(squarePoint(2.25), [0.75, 1]);
});

test("queens: exhaustive search over every placement gives the table, and each example reaches its maximum", () => {
  const combos = (n, k, from = 0, cur = [], out = []) => { if (cur.length === k) { out.push([...cur]); return out; } for (let s = from; s < n * n; s++) { cur.push(s); combos(n, k, s + 1, cur, out); cur.pop(); } return out; };
  for (const n of [4, 5, 6]) for (let k = 1; k <= n; k++) {
    let best = -1; for (const qs of combos(n, k)) best = Math.max(best, unattacked(n, qs).length);
    const [b, ex] = QUEENS[`${n},${k}`]; assert.equal(best, b, `${n}x${n} ${k} queens`); assert.equal(unattacked(n, ex).length, b); assert.equal(ex.length, k);
    assert.equal(queensBest(n, k), b);
  }
  assert.equal(queensBest(5, 5), 3);
});

test("snail: a day-by-day simulation gives the formula", () => {
  for (let up = 2; up <= 5; up++) for (let down = 1; down < up; down++) for (let h = 5; h <= 60; h++) {
    let y = 0, day = 0; for (;;) { day++; y += up; if (y >= h) break; y -= down; }
    assert.equal(snailDays(h, up, down), day, `${h} ${up} ${down}`);
    const tr = snailTrace(h, up, down); assert.equal(tr.length, day); assert.ok(tr.at(-1).done);
  }
  assert.equal(snailDays(10, 3, 2), 8); assert.equal(snailDays(3, 3, 2), 1);
});

test("bridge: a search over every sequence of crossings gives the best time", () => {
  const sets = [...BRIDGE_SETS.map(bridgeTimes)]; const r = rng(5); for (let i = 0; i < 40; i++) sets.push(Array.from({ length: 4 }, () => 1 + Math.floor(r() * 12)));
  for (const times of sets) {
    // Dijkstra over (who is on the far side, torch side)
    const dist = new Map([["0|0", 0]]), queue = [[0, 0, 0]];
    while (queue.length) {
      queue.sort((a, b) => a[0] - b[0]); const [d, mask, side] = queue.shift(); if (d > (dist.get(`${mask}|${side}`) ?? Infinity)) continue;
      const here = [0, 1, 2, 3].filter((i) => ((mask >> i) & 1) === side);
      const groups = []; for (const a of here) { groups.push([a]); for (const b of here) if (b > a) groups.push([a, b]); }
      for (const g of groups) { const nm = g.reduce((m, i) => m ^ (1 << i), mask), nd = d + Math.max(...g.map((i) => times[i])), key = `${nm}|${1 - side}`; if (nd < (dist.get(key) ?? Infinity)) { dist.set(key, nd); queue.push([nd, nm, 1 - side]); } }
    }
    assert.equal(dist.get("15|1"), bridgeBest(times), times.join());
    const p = bridgePlans(times); for (const k of ["A", "B"]) assert.equal(p[k].moves.reduce((s, m) => s + m[2], 0), p[k].total);
  }
  assert.equal(bridgeBest([1, 2, 5, 10]), 17); assert.equal(bridgeBest([1, 4, 5, 6]), 17);
});

test("light egg: dynamic programming over splits gives ceil(log3 n), and the three-group plan finds every egg", () => {
  const f = [0, 0]; for (let n = 2; n <= 100; n++) { let best = Infinity; for (let a = 1; a <= n / 2; a++) best = Math.min(best, 1 + Math.max(f[a], f[n - 2 * a])); f[n] = best; }
  for (let n = 1; n <= 100; n++) assert.equal(eggWeighings(n), f[n], `n=${n}`);
  assert.equal(eggWeighings(9), 2);
  for (let n = 2; n <= 100; n++) {   // follow the plan for every position of the light egg
    for (let light = 0; light < n; light++) {
      let lo = 0, size = n, k = eggWeighings(n), used = 0;
      while (size > 1) { const [a, , rest] = splitThree(size, k - used); const pos = light - lo; used++; if (pos < a) { size = a; } else if (pos < 2 * a) { lo += a; size = a; } else { lo += 2 * a; size = rest; } }
      assert.ok(used <= eggWeighings(n), `n=${n} egg ${light}`);
    }
  }
});

test("fake coins: only pairwise different counts identify the pile; the least total is n(n-1)/2", () => {
  for (let n = 2; n <= 5; n++) {
    let best = Infinity; const go = (i, cur) => { if (i === n) { // a design identifies the fake pile iff the n possible readings differ
      const deficits = cur; if (new Set(deficits).size === n) best = Math.min(best, cur.reduce((a, b) => a + b, 0)); return; } for (let c = 0; c <= n; c++) go(i + 1, [...cur, c]); };
    go(0, []);
    assert.equal(best, minSample(n)); assert.ok(identifies([...Array(n).keys()]));
    assert.ok(!identifies(Array.from({ length: n }, (_, i) => Math.min(i, 1))) || n === 2);
  }
  assert.equal(minSample(10), 45); assert.equal(classicSample(10), 55);
});
