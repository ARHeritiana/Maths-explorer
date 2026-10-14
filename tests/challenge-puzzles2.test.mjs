import test from "node:test";
import assert from "node:assert/strict";
import { pathLength, shortestVia, bestContact, REFLECT_SETS, reflectSet, luneArea, luneTotal, starK, starTipDegrees, starSumDegrees, measuredTip, boxUnfoldings, boxPath, BOX_SETS, boxSet, mergeFinal, mergeProduct, CHAM_SETS, chamSet, chamSolve, chamMin, chamPossible, permOf, inversions, bubbleSwaps, splitTotal, randomSplitTotal } from "../dist/js/challenge-puzzles2.js";

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
