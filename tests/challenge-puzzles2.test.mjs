import test from "node:test";
import assert from "node:assert/strict";
import { pathLength, shortestVia, bestContact, REFLECT_SETS, reflectSet } from "../dist/js/challenges/reflect/maths.js";
import { luneArea, luneTotal } from "../dist/js/challenges/lunes/maths.js";
import { starK, starTipDegrees, starSumDegrees, measuredTip } from "../dist/js/challenges/star/maths.js";
import { boxUnfoldings, boxPath, BOX_SETS, boxSet } from "../dist/js/challenges/box/maths.js";
import { mergeFinal, mergeProduct } from "../dist/js/challenges/merge/maths.js";
import { CHAM_SETS, chamSet, chamSolve, chamMin, chamPossible } from "../dist/js/challenges/cham/maths.js";
import { PEGS_START, PEG_TARGETS, pegTarget, pegClass, pegJumps, pegsPossible, pegsSolve, pegsMin, pegsRun, PEGS_SHIFTS, pegsWithin, pegLanding } from "../dist/js/challenges/pegs/maths.js";
import { permOf, inversions, bubbleSwaps } from "../dist/js/challenges/inversions/maths.js";
import { splitTotal, randomSplitTotal } from "../dist/js/challenges/piles/maths.js";

test("reflection: a fine scan of the contact point finds the reflected length, at x = ad/(a+b); presets give whole answers", () => {
  for (const id of REFLECT_SETS) {
    const [a, b, d] = reflectSet(id); let best = Infinity, at = 0;
    for (let i = 0; i <= 200000; i++) { const x = (d * i) / 200000, L = pathLength(a, b, d, x); if (L < best) { best = L; at = x; } }
    assert.ok(Math.abs(best - shortestVia(a, b, d)) < 1e-6, id); assert.ok(Math.abs(at - bestContact(a, b, d)) < 1e-3, id);
    assert.ok(Number.isInteger(shortestVia(a, b, d)), `${id} whole`);
  }
});
test("Hippocrates: counting grid cells gives area of both lunes = area of the right triangle", () => {
  for (const [a, b] of [[3, 4], [6, 8], [2, 5], [10, 2], [7, 7]]) { const est = luneArea(a, b), exact = luneTotal(a, b); assert.ok(Math.abs(est - exact) / exact < 0.004, `${a},${b}: ${est} vs ${exact}`); }
});
test("stars: measured tip angle = 180 − 360k/n and the n tips add up to 180(n − 2k)", () => {
  for (let n = 5; n <= 13; n++) for (let k = 1; 2 * k < n; k++) { assert.ok(Math.abs(measuredTip(n, k) - starTipDegrees(n, k)) < 1e-9, `${n}/${k}`); assert.ok(Math.abs(n * starTipDegrees(n, k) - starSumDegrees(n, k)) < 1e-9); }
  assert.equal(starSumDegrees(5, 2), 180); assert.equal(starSumDegrees(7, 2), 540); assert.equal(starK(6, 2), 1); assert.equal(starK(9, 3), 2); assert.equal(starK(5, 5), 2);
});
test("box: the three unfoldings, whole answers for the presets, and the straight line through the box is shorter", () => {
  for (const id of BOX_SETS) { const [a, b, c] = boxSet(id), L = boxPath(a, b, c); assert.ok(Number.isInteger(L), id); assert.ok(L > Math.hypot(a, b, c)); assert.ok(Math.abs(L * L - (a * a + b * b + c * c + 2 * Math.min(a * b, b * c, a * c))) < 1e-9); }
  assert.equal(boxUnfoldings(1, 2, 4).length, 3);
  // independent check: Dijkstra on a fine grid of points of the surface (straight segments inside each face only)
  for (const [a, b, c, h] of [[1, 2, 4, 0.25], [3, 5, 6, 0.5], [2, 3, 5, 0.5]]) {
    const dims = [a, b, c], pts = new Map(), key = (p) => p.map((x) => Math.round(x / h)).join(",");
    const faces = [];
    for (let axis = 0; axis < 3; axis++) for (const v of [0, dims[axis]]) {
      const [u, w] = [0, 1, 2].filter((k) => k !== axis), list = [];
      for (let i = 0; i <= dims[u] / h; i++) for (let j = 0; j <= dims[w] / h; j++) { const p = [0, 0, 0]; p[axis] = v; p[u] = i * h; p[w] = j * h; list.push(p); if (!pts.has(key(p))) pts.set(key(p), p); }
      faces.push(list);
    }
    const ids = [...pts.keys()], index = new Map(ids.map((k, n) => [k, n])), adj = ids.map(() => []);
    for (const list of faces) for (const p of list) for (const q of list) { const d = Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); if (d > 0 && d <= 3.01 * h) adj[index.get(key(p))].push([index.get(key(q)), d]); }
    const dist = Array(ids.length).fill(Infinity), src = index.get(key([0, 0, 0])), dst = index.get(key([a, b, c])); dist[src] = 0;
    const done = Array(ids.length).fill(false);
    for (let step = 0; step < ids.length; step++) { let u = -1; for (let k = 0; k < ids.length; k++) if (!done[k] && (u < 0 || dist[k] < dist[u])) u = k; if (u < 0 || dist[u] === Infinity) break; done[u] = true; for (const [v, d] of adj[u]) if (dist[u] + d < dist[v]) dist[v] = dist[u] + d; }
    const L = boxPath(a, b, c); assert.ok(dist[dst] >= L - 1e-9, `${a},${b},${c}: grid ${dist[dst]} cannot beat ${L}`); assert.ok(dist[dst] <= L * 1.04, `${a},${b},${c}: grid ${dist[dst]} close to ${L}`);
  }
});
test("a + b + ab: every order of merging gives (n + 1)! − 1 and the product of (x + 1) never changes", () => {
  for (let n = 2; n <= 10; n++) for (let trial = 0; trial < 25; trial++) {
    let nums = Array.from({ length: n }, (_, i) => i + 1); const p0 = mergeProduct(nums);
    while (nums.length > 1) { const i = Math.floor(Math.random() * nums.length); let j; do j = Math.floor(Math.random() * nums.length); while (j === i); const a = nums[i], b = nums[j]; nums = nums.filter((_, k) => k !== i && k !== j); nums.push(a + b + a * b); assert.equal(mergeProduct(nums), p0); }
    assert.equal(nums[0], mergeFinal(n));
  }
  assert.equal(mergeFinal(5), 719);
});
test("chameleons: breadth-first search agrees with the mod-3 invariant, and each step really is a meeting", () => {
  for (let r = 0; r <= 9; r++) for (let g = 0; g <= 9; g++) for (let b = 0; b <= 9; b++) {
    if (r + g + b === 0 || [r, g, b].filter((x) => x > 0).length === 1) continue;
    const sol = chamSolve(r, g, b); assert.equal(sol !== null, chamPossible(r, g, b), `${r},${g},${b}`);
    if (sol) { for (const st of sol) assert.equal(st.to.reduce((x, y) => x + y), r + g + b); assert.equal(sol.at(-1).to.filter((x) => x > 0).length, 1); }
  }
  assert.equal(chamMin(13, 15, 17), 0); assert.equal(chamMin(8, 5, 2), 5); assert.equal(chamMin(1, 4, 7), 4);
  for (const id of CHAM_SETS) { const [r, g, b] = chamSet(id); assert.equal(chamMin(r, g, b) > 0, chamPossible(r, g, b)); }
});
test("inversions: bubble sort swaps exactly as many times as there are inversions, one fewer inversion per swap", () => {
  for (let n = 5; n <= 10; n++) for (let seed = 0; seed < 100; seed++) {
    const p = permOf(n, seed); assert.deepEqual([...p].sort((x, y) => x - y), Array.from({ length: n }, (_, i) => i + 1));
    const r = bubbleSwaps(p); assert.equal(r.count, inversions(p));
    const a = [...p]; let inv = inversions(a); for (const i of r.log) { [a[i], a[i + 1]] = [a[i + 1], a[i]]; assert.equal(inversions(a), --inv); }
  }
});
test("split piles: whatever the splits, the total is n(n − 1)/2", () => {
  for (let n = 2; n <= 60; n++) for (let t = 0; t < 10; t++) assert.equal(randomSplitTotal(n), splitTotal(n));
  assert.equal(splitTotal(10), 45);
});

test("three pegs: every jump keeps each peg's parity class, and (1, 1) is never reached (random walks and exhaustive search)", () => {
  const start = PEGS_START.map((p) => p.join()), same = (s) => s.every((p, i) => pegClass(p).join() === pegClass(PEGS_START[i]).join());
  // exhaustive: every position reachable in at most 7 jumps, written independently of pegsSolve
  let frontier = [PEGS_START.map((p) => [...p])];
  const seen = new Set([PEGS_START.map((p) => p.join()).join(";")]);
  for (let d = 0; d < 7; d++) {
    const next = [];
    for (const s of frontier) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      if (i === j) continue;
      const to = [2 * s[j][0] - s[i][0], 2 * s[j][1] - s[i][1]];
      if (s.some((p, k) => k !== i && p[0] === to[0] && p[1] === to[1])) continue;
      const t = s.map((p) => [...p]); t[i] = to; const key = t.map((p) => p.join()).join(";");
      if (seen.has(key)) continue;
      seen.add(key); next.push(t);
      assert.ok(same(t), `parity class changed: ${key}`);
      assert.ok(!t.some((p) => p[0] === 1 && p[1] === 1), `(1, 1) reached: ${key}`);
    }
    frontier = next;
  }
  assert.ok(seen.size > 10000, `searched ${seen.size} positions`);
  for (let w = 0; w < 200; w++) {   // long random walks, far beyond the exhaustive depth
    let s = PEGS_START.map((p) => [...p]);
    for (let k = 0; k < 60; k++) { const js = pegJumps(s); if (!js.length) break; const { peg, to } = js[Math.floor(Math.random() * js.length)]; s[peg] = to; assert.ok(same(s)); }
  }
  void start;
});
test("three pegs: the answers of the presets are the minimal numbers of jumps found by an independent search, and the impossible ones are exactly those outside the three classes", () => {
  const expect = { "1,1": 0, "-1,1": 0, "3,1": 0, "2,0": 1, "2,1": 2, "3,0": 2, "2,2": 3, "4,0": 3 };
  for (const id of PEG_TARGETS) {
    const T = pegTarget(id);
    assert.equal(pegsMin(T), expect[id], id); assert.equal(pegsPossible(T), expect[id] > 0, id);
    // independent: iterative deepening depth-first search for the smallest d that puts a peg on T
    const dfs = (s, d) => s.some((p) => p[0] === T[0] && p[1] === T[1]) ? true : d === 0 ? false : pegJumps(s).some(({ peg, to }) => { const t = s.map((p) => [...p]); t[peg] = to; return dfs(t, d - 1); });
    if (expect[id] > 0) { assert.ok(dfs(PEGS_START, expect[id])); assert.ok(!dfs(PEGS_START, expect[id] - 1)); }
    else assert.ok(!dfs(PEGS_START, 6), `${id} not reached within 6 jumps`);
    // the returned sequence is legal and ends on the target
    const steps = pegsSolve(T) || []; let s = PEGS_START.map((p) => [...p]);
    for (const st of steps) { assert.ok(pegJumps(s).some((j) => j.peg === st.peg && j.over === st.over && j.to.join() === st.to.join())); s[st.peg] = st.to; }
    if (steps.length) assert.ok(s.some((p) => p[0] === T[0] && p[1] === T[1]));
  }
});

test("three pegs: the two four-jump shifts slide the whole triple by (2, 0) and (0, 2); undoing and repeating them reaches every point of each peg's class, never blocked", () => {
  const eq = (s, t) => s.every((p, i) => p[0] === t[i][0] && p[1] === t[i][1]), add = (s, dx, dy) => s.map((p) => [p[0] + dx, p[1] + dy]);
  const sx = pegsRun(PEGS_SHIFTS.x), sy = pegsRun(PEGS_SHIFTS.y);
  assert.ok(eq(sx.at(-1).state, add(PEGS_START, 2, 0))); assert.ok(eq(sy.at(-1).state, add(PEGS_START, 0, 2)));
  // apply a macro, or its reverse (the same jumps in the opposite order), checking that each jump is legal
  const apply = (s, moves) => { for (const [peg, over] of moves) { const to = pegLanding(s[peg], s[over]); assert.ok(!s.some((p, k) => k !== peg && p[0] === to[0] && p[1] === to[1]), "blocked"); s = s.map((p, k) => (k === peg ? to : p)); } return s; };
  for (let m = -5; m <= 5; m++) for (let n = -5; n <= 5; n++) {
    let s = PEGS_START.map((p) => [...p]);
    for (let i = 0; i < Math.abs(m); i++) s = apply(s, m > 0 ? PEGS_SHIFTS.x : [...PEGS_SHIFTS.x].reverse());
    for (let i = 0; i < Math.abs(n); i++) s = apply(s, n > 0 ? PEGS_SHIFTS.y : [...PEGS_SHIFTS.y].reverse());
    assert.ok(eq(s, add(PEGS_START, 2 * m, 2 * n)), `${m},${n}`);
  }
});
test("three pegs: points occupied after at most 1, 2 and 3 jumps match an independent enumeration (lower bounds quoted in the solution)", () => {
  for (const k of [1, 2, 3]) {
    const pts = new Set(PEGS_START.map((p) => p.join())); let level = [PEGS_START.map((p) => [...p])];
    for (let d = 0; d < k; d++) { const next = []; for (const s of level) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (i !== j) { const to = [2 * s[j][0] - s[i][0], 2 * s[j][1] - s[i][1]]; if (s.some((p, q) => q !== i && p[0] === to[0] && p[1] === to[1])) continue; const t = s.map((p) => [...p]); t[i] = to; pts.add(to.join()); next.push(t); } level = next; }
    assert.deepEqual([...pegsWithin(k)].sort(), [...pts].sort(), `k=${k}`);
  }
});
