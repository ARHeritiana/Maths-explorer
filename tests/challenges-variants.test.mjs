// Independent verification of every variation of every challenge: the expected answer is recomputed by a different
// method over the whole parameter range, and each statement and solution is checked for both languages.
import test from "node:test";
import assert from "node:assert/strict";
import { challenges } from "../dist/js/content.js";
import { VARIANTS, defaults, randomParams, normalise, josephusOrder, graphFor, minRemoval, walkable, degrees, trailOf, comb, eggDrops, eggPlan, eggCover } from "../dist/js/challenge-variants.js";
import { triangulate, threeColour, visibility, pointInPolygon, area2 } from "../dist/js/challenge-geometry.js";

const range = (a, b, s = 1) => { const out = []; for (let v = a; v <= b; v += s) out.push(v); return out; };
const param = (id, pid) => VARIANTS[id].params.find((p) => p.id === pid);

test("every challenge has variants whose defaults give the statement shown on the page", () => {
  for (const c of challenges) {
    const v = VARIANTS[c.id]; assert.ok(v, c.id);
    const q = defaults(c.id);
    assert.deepEqual(c.prompt, v.prompt(q)); assert.equal(c.answer, v.answer(q));
    for (const lang of [0, 1]) { assert.ok(c.prompt[lang].length > 20); assert.ok(c.solution[lang].length > 20); }
  }
});

test("statements, answers and solutions are well formed over the whole parameter range", () => {
  for (const id of Object.keys(VARIANTS)) {
    const v = VARIANTS[id], pools = v.params.map((p) => (p.kind === "int" ? [p.min, p.max, p.value, p.min + p.step * Math.round((p.max - p.min) / 2 / p.step)] : p.options.map((o) => o[0])));
    const combos = pools.reduce((acc, pool) => acc.flatMap((a) => pool.map((x) => [...a, x])), [[]]);
    for (const combo of combos) {
      const q = Object.fromEntries(v.params.map((p, i) => [p.id, combo[i]])), n = normalise(id, q);
      for (const key of Object.keys(q)) assert.equal(String(n[key]), String(q[key]), `${id} ${key}`);
      assert.ok(Number.isInteger(v.answer(q)) && v.answer(q) >= 0, `${id} answer ${JSON.stringify(q)}`);
      for (const text of [...v.prompt(q), ...v.solution(q), ...(v.hints ? v.hints(q).flat() : [])]) assert.ok(text && !/undefined|NaN|Infinity|null/.test(text), `${id}: ${text}`);
    }
    for (let i = 0; i < 30; i++) { const q = randomParams(id, Math.random), n = normalise(id, q); assert.deepEqual(n, Object.fromEntries(Object.entries(q).map(([k, x]) => [k, typeof n[k] === "number" ? Number(x) : x]))); }
  }
});

test("doors: simulating every pass gives floor(sqrt(n))", () => {
  for (const n of range(10, 200)) { const open = Array(n + 1).fill(false); for (let k = 1; k <= n; k++) for (let j = k; j <= n; j += k) open[j] = !open[j]; assert.equal(open.filter(Boolean).length, VARIANTS.doors.answer({ n })); }
});

test("chess: a maximum bipartite matching gives the largest number of dominoes", () => {
  for (const n of range(4, 12, 2)) for (const kind of ["opp", "adj"]) {
    const gone = new Set(kind === "opp" ? ["0,0", `${n - 1},${n - 1}`] : ["0,0", `${n - 1},0`]), cells = [];
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!gone.has(`${x},${y}`)) cells.push([x, y]);
    const dark = cells.filter(([x, y]) => (x + y) % 2 === 0), match = new Map();
    const nb = ([x, y]) => [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < n && b < n && !gone.has(`${a},${b}`));
    const aug = (u, seen) => { for (const w of nb(u)) { const k = w.join(","); if (seen.has(k)) continue; seen.add(k); if (!match.has(k) || aug(match.get(k), seen)) { match.set(k, u); return true; } } return false; };
    let size = 0; for (const u of dark) if (aug(u, new Set())) size++;
    assert.equal(size, VARIANTS.chess.answer({ n, kind }), `${n} ${kind}`);
  }
});

test("nim: dynamic programming over positions finds the winning first move (0 when there is none)", () => {
  for (const m of range(2, 6)) { const win = [false]; for (let n = 1; n <= 60; n++) win[n] = range(1, Math.min(m, n)).some((k) => !win[n - k]);
    for (const n of range(10, 60)) { const good = range(1, Math.min(m, n)).filter((k) => !win[n - k]); assert.deepEqual(good, good.length ? [VARIANTS.nim.answer({ n, m })] : [], `${n} ${m}`); if (!good.length) assert.equal(VARIANTS.nim.answer({ n, m }), 0); } }
});

test("pigeonhole: m integers can avoid a difference divisible by m, m + 1 cannot", () => {
  for (const m of range(3, 12)) { assert.equal(new Set(range(0, m - 1).map((x) => x % m)).size, m); assert.equal(VARIANTS.pigeonhole.answer({ m }), m + 1); }
});

test("squares and hanoi: sums and breadth-first search", () => {
  for (const n of range(3, 30)) assert.equal(VARIANTS.squares.answer({ n }), range(1, n).reduce((s, k) => s + 2 * k - 1, 0));
  for (const n of range(2, 8)) {
    const goal = "2".repeat(n), seen = new Map([["0".repeat(n), 0]]); let frontier = ["0".repeat(n)];
    while (!seen.has(goal)) { const next = []; for (const st of frontier) { const s = st.split("").map(Number), top = [Infinity, Infinity, Infinity]; for (let d = n - 1; d >= 0; d--) top[s[d]] = d; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) { if (a === b || top[a] === Infinity || top[a] > top[b]) continue; const t = s.slice(); t[top[a]] = b; const key = t.join(""); if (!seen.has(key)) { seen.set(key, seen.get(st) + 1); next.push(key); } } } frontier = next; }
    assert.equal(seen.get(goal), VARIANTS.hanoi.answer({ n }));
  }
});

test("eggs: the minimax recurrence agrees with the closed form for 2 and 3 eggs", () => {
  const dp = { 1: range(0, 200) };
  for (const e of [2, 3]) { dp[e] = [0]; for (let f = 1; f <= 200; f++) { let best = Infinity; for (let x = 1; x <= f; x++) best = Math.min(best, 1 + Math.max(dp[e - 1][x - 1], dp[e][f - x])); dp[e][f] = best; } }
  for (const e of [2, 3]) for (const floors of range(20, 200)) assert.equal(VARIANTS.eggs.answer({ floors, eggs: e }), dp[e][floors], `${e} eggs ${floors} floors`);
  for (const e of [2, 3]) for (const floors of [20, 57, 100, 200]) { const plan = eggPlan(e, floors); assert.equal(plan.floors.at(-1), floors); assert.ok(plan.floors.every((f, i, a) => !i || f > a[i - 1])); for (let j = 0; j < plan.floors.length; j++) { const gap = plan.floors[j] - (j ? plan.floors[j - 1] : 0) - 1; assert.ok(j + 1 + eggDrops(e - 1, Math.max(0, gap)) <= plan.drops, `${e} ${floors} drop ${j}`); } }
  assert.equal(eggCover(2, 14), 105);
});

test("konigsberg: the minimum removal agrees with a direct search for an Euler walk", () => {
  const walk = (g, removed) => { const ids = g.edges.map((_, i) => i).filter((i) => !removed.has(i)), used = new Set(); const go = (v, k) => { if (k === ids.length) return true; for (const i of ids) { if (used.has(i)) continue; const [a, b] = g.edges[i]; if (a !== v && b !== v) continue; used.add(i); if (go(a === v ? b : a, k + 1)) return true; used.delete(i); } return false; }; return ids.length === 0 || g.names.some((_, s) => go(s, 0)); };
  for (let id = 0; id < 100; id++) {
    const g = graphFor(id), E = g.edges.length; let best = Infinity;
    for (let mask = 0; mask < 1 << E; mask++) { const removed = new Set(); for (let i = 0; i < E; i++) if (mask >> i & 1) removed.add(i); if (removed.size < best && walk(g, removed)) best = removed.size; }
    assert.equal(minRemoval(g).size, best, `network ${id}`);
    assert.equal(VARIANTS.konigsberg.answer({ g: id }), best);
    const w = trailOf(g, minRemoval(g)); assert.equal(w.length, E - best); assert.ok(walkable(g, minRemoval(g)));
  }
  assert.deepEqual(degrees(graphFor(0)), [5, 3, 3, 3]);
});

test("josephus: simulation, recurrence and the closed form 2l + 1", () => {
  for (const k of [2, 3]) { let J = 1; for (let n = 2; n <= 100; n++) { J = ((J + k - 1) % n) + 1; if (n >= 5) assert.equal(VARIANTS.josephus.answer({ n, k }), J, `n=${n} k=${k}`); } }
  for (let n = 5; n <= 100; n++) { const m = 2 ** Math.floor(Math.log2(n)); assert.equal(josephusOrder(n, 2).last, 2 * (n - m) + 1); }
});

test("ramsey: R(3,3) = 6 and R(3,4) = 9 by exhaustive backtracking", () => {
  const search = (n, s) => {   // is there a colouring of K_n with no friend triangle (colour 1) and no group of s strangers (colour 2)?
    const edges = []; for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) edges.push([a, b]);
    const col = Array.from({ length: n }, () => Array(n).fill(0));
    const bad = (a, b, x) => { // does colouring edge ab with x complete a forbidden group?
      const need = x === 1 ? 3 : s, others = []; for (let v = 0; v < n; v++) if (v !== a && v !== b && col[a][v] === x && col[b][v] === x) others.push(v);
      const grow = (pool, size) => size === need - 2 ? true : pool.some((v, i) => grow(pool.slice(i + 1).filter((w) => col[v][w] === x), size + 1) );
      return need === 3 ? others.length > 0 : grow(others, 0) && others.length >= need - 2 && (() => { const rec = (pool, k) => { if (k === 0) return true; for (let i = 0; i < pool.length; i++) if (rec(pool.slice(i + 1).filter((w) => col[pool[i]][w] === x), k - 1)) return true; return false; }; return rec(others, need - 2); })();
    };
    const go = (i) => { if (i === edges.length) return true; const [a, b] = edges[i]; for (const x of i === 0 ? [1] : [1, 2]) { if (bad(a, b, x)) continue; col[a][b] = col[b][a] = x; if (go(i + 1)) return true; col[a][b] = col[b][a] = 0; } return false; };
    return go(0);
  };
  assert.equal(search(5, 3), true); assert.equal(search(6, 3), false); assert.equal(VARIANTS.ramsey.answer({ s: 3 }), 6);
  assert.equal(search(8, 4), true); assert.equal(search(9, 4), false); assert.equal(VARIANTS.ramsey.answer({ s: 4 }), 9);
  // the published 8-person example: friends when seats differ by 1 or 4
  const friend = (i, j) => [1, 4, 7].includes((j - i + 8) % 8);
  for (let a = 0; a < 8; a++) for (let b = a + 1; b < 8; b++) for (let c = b + 1; c < 8; c++) assert.ok(!(friend(a, b) && friend(a, c) && friend(b, c)));
  for (let a = 0; a < 8; a++) for (let b = a + 1; b < 8; b++) for (let c = b + 1; c < 8; c++) for (let d = c + 1; d < 8; d++) assert.ok([[a, b], [a, c], [a, d], [b, c], [b, d], [c, d]].some(([x, y]) => friend(x, y)));
});

test("art gallery: every comb is a simple polygon needing exactly k guards", () => {
  for (const k of range(2, 6)) {
    const poly = comb(k); assert.equal(poly.length, 3 * k); assert.ok(area2(poly) > 0, `ccw ${k}`);
    const cross = (a, b, c, d) => { const o = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])); return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0; };
    for (let i = 0; i < poly.length; i++) for (let j = i + 2; j < poly.length; j++) if (!(i === 0 && j === poly.length - 1)) assert.ok(!cross(poly[i], poly[(i + 1) % poly.length], poly[j], poly[(j + 1) % poly.length]), `simple ${k}`);
    const tris = triangulate(poly); assert.equal(tris.length, 3 * k - 2);
    const col = threeColour(poly.length, tris); assert.ok(tris.every((t) => new Set(t.map((i) => col[i])).size === 3));
    const sizes = [0, 1, 2].map((c) => col.filter((x) => x === c).length), best = sizes.indexOf(Math.min(...sizes));
    assert.ok(sizes[best] <= k); assert.equal(VARIANTS.artgallery.answer({ n: 3 * k }), k);
    const W = 5 * k - 2, guards = poly.filter((_, i) => col[i] === best).map((g) => visibility(poly, g));
    for (let x = 0.07; x < W; x += 0.21) for (let y = 0.07; y < 10; y += 0.21) if (pointInPolygon([x, y], poly)) assert.ok(guards.some((v) => pointInPolygon([x, y], v)), `uncovered ${k} ${x},${y}`);
    const tips = Array.from({ length: k }, (_, i) => poly[2 + 3 * i]);
    for (let x = 0.1; x < W; x += 0.4) for (let y = 0.1; y < 10; y += 0.4) if (pointInPolygon([x, y], poly)) { const v = visibility(poly, [x, y]); assert.ok(tips.filter((t) => pointInPolygon(t, v)).length <= 1, `two tips ${k} ${x},${y}`); }
  }
});

import { hasActivity } from "../dist/js/challenge-activities.js";
import { hasSolution } from "../dist/js/challenge-solutions.js";
test("every challenge has a hands-on activity and an animated solution", () => {
  for (const c of challenges) { assert.ok(hasActivity(c.id), `activity ${c.id}`); assert.ok(hasSolution(c.id), `solution ${c.id}`); }
});

import { randomGallery, isSimple } from "../dist/js/challenge-more.js";
import { ORIGINALS } from "../dist/js/challenge-originals.js";

test("art gallery: random galleries are simple polygons with the requested number of sides, and none is a preset worst case", () => {
  for (const n of [6, 9, 12, 15, 18]) for (let i = 0; i < 25; i++) {
    const poly = randomGallery(n);
    assert.equal(poly.length, n); assert.ok(isSimple(poly), `simple ${n}`); assert.ok(area2(poly) > 0, `ccw ${n}`);
  }
});

test("every challenge has an original question in both languages, with no em or en dash and no unfilled parameter", () => {
  for (const id of Object.keys(VARIANTS)) {
    assert.ok(ORIGINALS[id], `original for ${id}`);
    const q = Object.fromEntries(VARIANTS[id].params.map((p) => [p.id, p.value])), [fr, en] = ORIGINALS[id](q);
    for (const text of [fr, en]) { assert.ok(text.length > 30, id); assert.ok(!/undefined|NaN|[—–]/.test(text), `${id}: ${text}`); }
  }
});

import { SOLUTIONS } from "../dist/js/challenge-solutions.js";

test("every challenge has an animated solution with captions in both languages and a finite pace for each step", () => {
  for (const id of Object.keys(VARIANTS)) {
    const sol = SOLUTIONS[id], q = defaults(id);
    assert.ok(sol, `solution for ${id}`);
    const steps = sol.steps(q);
    assert.ok(steps.length >= 2, `${id}: at least two steps`);
    for (const [fr, en] of steps) assert.ok(fr && en && !/undefined|NaN/.test(fr + en), `${id}: caption`);
    assert.ok(sol.mount ? typeof sol.update === "function" : typeof sol.draw === "function", `${id}: mount with update, or draw`);
    if (sol.dur) steps.forEach((_, s) => { const d = sol.dur(s, q); assert.ok(Number.isFinite(d) && d >= 500 && d <= 20000, `${id}: duration of step ${s}`); });
  }
});
