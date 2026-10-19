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
import { sharings, allSharings, code } from "../dist/js/challenges/cookies/maths.js";
import { JUG_PRESETS, parseJugs, jugsSolve, jugsMin, apply, reachable } from "../dist/js/challenges/jugs/maths.js";
import { VARIANTS as CV } from "../dist/js/challenges/registry.js";
import { NAIL_VARIANTS, SHORTEST, parseNails, meets } from "../dist/js/challenges/nails/maths.js";
import { FLY_PRESETS, parseFly, flyDistance, legs } from "../dist/js/challenges/fly/maths.js";
import { CHERYL_SETS, cherylAnswer } from "../dist/js/challenges/cheryl/maths.js";
import { SP_BOUNDS, spSolution } from "../dist/js/challenges/sumproduct/maths.js";

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

test("cookies: the count of sharings equals a direct enumeration (generating function), with and without the rule", () => {
  // coefficient of x^n in (sum_{j >= min} x^j)^k, by repeated polynomial multiplication: another route than C(n + k - 1, k - 1)
  const coeff = (n, k, min) => { let poly = [1]; for (let i = 0; i < k; i++) { const next = Array(n + 1).fill(0); poly.forEach((c, d) => { for (let j = min; d + j <= n; j++) next[d + j] += c; }); poly = next; } return poly[n] || 0; };
  for (let n = 3; n <= 15; n++) for (let k = 2; k <= 6; k++) {
    assert.equal(sharings(n, k), coeff(n, k, 0), `${n} ${k}`);
    assert.equal(sharings(n, k, true), coeff(n, k, 1), `${n} ${k} at least one`);
    assert.equal(CV.cookies.answer({ n, k, rule: "any" }), coeff(n, k, 0));
    assert.equal(CV.cookies.answer({ n, k, rule: "one" }), coeff(n, k, 1));
  }
  assert.equal(sharings(10, 5), 1001);
  // the coding by a row is one to one on the sharings listed
  const list = allSharings(6, 4), rows = new Set(list.map(code));
  assert.equal(list.length, sharings(6, 4)); assert.equal(rows.size, list.length);
  for (const r of rows) { assert.equal([...r].filter((c) => c === "●").length, 6); assert.equal([...r].filter((c) => c === "|").length, 3); }
});

test("jugs: the fewest operations agree with an independent relaxation, every listed sequence is legal, and the impossible presets are those outside gcd multiples", () => {
  // independent: relax distances over the whole (a + 1) x (b + 1) grid of states until nothing changes (no queue)
  const ids = (a, b, t) => {
    const dist = Array.from({ length: a + 1 }, () => Array(b + 1).fill(Infinity)); dist[0][0] = 0;
    const nexts = (x, y) => [[a, y], [x, b], [0, y], [x, 0], [x - Math.min(x, b - y), y + Math.min(x, b - y)], [x + Math.min(y, a - x), y - Math.min(y, a - x)]];
    for (let changed = true; changed;) { changed = false; for (let x = 0; x <= a; x++) for (let y = 0; y <= b; y++) if (dist[x][y] < Infinity) for (const [u, v] of nexts(x, y)) if (dist[x][y] + 1 < dist[u][v]) { dist[u][v] = dist[x][y] + 1; changed = true; } }
    let best = Infinity; for (let x = 0; x <= a; x++) for (let y = 0; y <= b; y++) if (x === t || y === t) best = Math.min(best, dist[x][y]);
    return best === Infinity ? 0 : best;
  };
  for (const p of JUG_PRESETS) {
    const [a, b, t] = parseJugs(p), path = jugsSolve(a, b, t);
    assert.equal(jugsMin(a, b, t), ids(a, b, t), p);
    assert.equal(!!path, reachable(a, b, t), p);
    if (path) { let s = [0, 0]; for (const step of path) { s = apply(step.move, s, a, b); assert.deepEqual(s, step.state); } assert.ok(s[0] === t || s[1] === t); }
  }
  assert.equal(jugsMin(3, 5, 4), 6);
});

test("nails: each stored winding meets its rule, and an exhaustive search finds no shorter word", () => {
  // independent free reduction and rule check (not the module's), then every word of smaller length (first letter fixed: by
  // renaming the nails and reversing a nail's direction, any word becomes one that starts with nail 1 clockwise)
  const red = (w) => { const out = []; for (const c of w) out.at(-1) === -c ? out.pop() : out.push(c); return out; };
  const good = (w, n, k) => { for (let m = 0; m < 1 << n; m++) { let c = 0; for (let i = 0; i < n; i++) c += (m >> i) & 1; const gone = red(w.filter((x) => !((m >> (Math.abs(x) - 1)) & 1))).length === 0; if (gone !== c >= k) return false; } return true; };
  for (const v of NAIL_VARIANTS) {
    const [n, k] = parseNails(v), w = SHORTEST[v];
    assert.ok(good(w, n, k) && meets(w, n, k), v);
    assert.equal(CV.nails.answer({ nails: v }), w.length);
    const letters = []; for (let i = 1; i <= n; i++) letters.push(i, -i);
    let shorter = false;
    const rec = (word, L) => { if (shorter) return; if (word.length === L) { if (good(word, n, k)) shorter = true; return; } for (const c of letters) { if (!word.length && c !== 1) continue; if (word.length && word.at(-1) === -c) continue; word.push(c); rec(word, L); word.pop(); } };
    for (let L = 1; L < w.length && !shorter; L++) rec([], L);
    assert.ok(!shorter, `${v}: a word shorter than ${w.length} works`);
  }
});

test("fly: the distance equals the sum of the legs (geometric series), for every preset", () => {
  for (const p of FLY_PRESETS) {
    const [D, v1, v2, w] = parseFly(p), d = flyDistance(D, v1, v2, w), L = legs(D, v1, v2, w, 1e-12, 2000);
    assert.ok(Number.isInteger(d), p);
    assert.ok(Math.abs(L.reduce((t, l) => t + l.length, 0) - d) < 1e-6, `${p}: legs add up to ${d}`);
    // each leg ends where the train it meets is at that time
    for (const [i, l] of L.slice(0, 6).entries()) { const train = i % 2 === 0 ? D - v2 * l.t1 : v1 * l.t1; assert.ok(Math.abs(l.to - train) < 1e-9); }
    assert.equal(CV.fly.answer({ trip: p }), d);
  }
});

test("Cheryl: an independent reading of the dialogue (knowledge sets) gives a single date for every list", () => {
  // model the knowledge explicitly: Albert's information set is the dates of his month, Bernard's the dates of his day
  for (const [id, D] of Object.entries(CHERYL_SETS)) {
    const same = (a, b) => a[0] === b[0] && a[1] === b[1];
    const A = (W, d) => W.filter((x) => x[0] === d[0]), B = (W, d) => W.filter((x) => x[1] === d[1]);
    const knows = (set) => set.length === 1;
    let W = D.filter((d) => !knows(A(D, d)) && A(D, d).every((e) => !knows(B(D, e))));
    W = W.filter((d) => !knows(B(D, d)) && knows(B(W, d)));
    W = W.filter((d) => knows(A(W, d)));
    assert.equal(W.length, 1, id);
    assert.ok(same(W[0], cherylAnswer(D)), id);
    assert.equal(CV.cheryl.answer({ set: id }), W[0][1]);
  }
  assert.deepEqual(cherylAnswer(CHERYL_SETS.orig), [7, 16]);
});

test("sum and product: brute force over the dialogue gives (4, 13) for N >= 65 and nothing for N = 62", () => {
  const solve = (N) => {
    const P = []; for (let x = 2; x < N; x++) for (let y = x + 1; x + y <= N; y++) P.push([x, y]);
    const prodSplits = (p, list) => list.filter(([a, b]) => a * b === p).length, sumPairs = (s, list) => list.filter(([a, b]) => a + b === s);
    const S1 = P.filter(([x, y]) => sumPairs(x + y, P).every(([a, b]) => prodSplits(a * b, P) > 1));
    const P2 = S1.filter(([x, y]) => prodSplits(x * y, S1) === 1);
    return P2.filter(([x, y]) => sumPairs(x + y, P2).length === 1);
  };
  for (const N of SP_BOUNDS) {
    const r = solve(N), mine = spSolution(N);
    assert.equal(r.length <= 1, true);
    assert.deepEqual(mine, r[0] || null, `N = ${N}`);
    assert.equal(CV.sumproduct.answer({ N }), r[0] ? r[0][0] * r[0][1] : 0);
  }
  assert.deepEqual(spSolution(100), [4, 13]);
});
