// Independent checks of the challenges added in October 2026, and of the geometry behind the art gallery.
import test from "node:test";
import assert from "node:assert/strict";
import { challenges } from "../dist/js/content.js";
import { hasActivity } from "../dist/js/challenge-activities.js";
import { hasSolution } from "../dist/js/challenge-solutions.js";
import { josephusOrder } from "../dist/js/challenge-more.js";
import { COMB, triangulate, threeColour, visibility, pointInPolygon, area2 } from "../dist/js/challenge-geometry.js";

const answer = (id) => challenges.find((c) => c.id === id).answer;

test("every challenge has a hands-on activity and an animated solution", () => {
  for (const c of challenges) { assert.ok(hasActivity(c.id), `activity ${c.id}`); assert.ok(hasSolution(c.id), `solution ${c.id}`); }
});

test("Tower of Hanoi: breadth-first search over all states finds 2^n - 1 moves", () => {
  const n = 6, enc = (s) => s.join(""), goal = "2".repeat(n);   // state[i] = peg of disk i (0 smallest)
  const seen = new Map([["0".repeat(n), 0]]); let frontier = ["0".repeat(n)];
  while (!seen.has(goal)) {
    const next = [];
    for (const st of frontier) {
      const s = st.split("").map(Number), top = [Infinity, Infinity, Infinity];
      for (let d = n - 1; d >= 0; d--) top[s[d]] = d;
      for (let from = 0; from < 3; from++) for (let to = 0; to < 3; to++) {
        if (from === to || top[from] === Infinity || top[from] > top[to]) continue;
        const t = s.slice(); t[top[from]] = to; const key = enc(t);
        if (!seen.has(key)) { seen.set(key, seen.get(st) + 1); next.push(key); }
      }
    }
    frontier = next;
  }
  assert.equal(seen.get(goal), 2 ** n - 1);
  assert.equal(answer("hanoi"), 63);
});

test("eggs: dynamic programming gives 14 drops for 2 eggs and 100 floors", () => {
  const f = (eggs, drops) => (eggs === 0 || drops === 0 ? 0 : f(eggs - 1, drops - 1) + f(eggs, drops - 1) + 1);
  let n = 0; while (f(2, n) < 100) n++;
  assert.equal(n, answer("eggs")); assert.equal(f(2, 13), 91); assert.equal(f(2, 14), 105);
  // the published strategy has worst case 14 over every critical floor 0..100
  const floors = [14, 27, 39, 50, 60, 69, 77, 84, 90, 95, 99, 100];
  let worst = 0;
  for (let crit = 0; crit <= 100; crit++) {
    let drops = 0, lo = 0, hi = 101;
    for (const fl of floors) { drops++; if (fl > crit) { hi = fl; break; } lo = fl; }
    while (lo + 1 < hi) { lo++; drops++; if (lo > crit) break; }
    worst = Math.max(worst, drops);
  }
  assert.equal(worst, 14);
});

test("Königsberg: removing one bridge is enough, removing none is not (Euler trail search)", () => {
  const E = [["A", "B"], ["A", "B"], ["A", "C"], ["A", "C"], ["A", "D"], ["B", "D"], ["C", "D"]];
  const trail = (edges) => {   // exhaustive depth-first search for a walk using every edge exactly once
    const used = Array(edges.length).fill(false);
    const go = (v, k) => { if (k === edges.length) return true; for (let i = 0; i < edges.length; i++) { if (used[i]) continue; const [a, b] = edges[i]; if (a !== v && b !== v) continue; used[i] = true; if (go(a === v ? b : a, k + 1)) return true; used[i] = false; } return false; };
    return "ABCD".split("").some((s) => go(s, 0));
  };
  assert.equal(trail(E), false);
  assert.ok(E.some((_, i) => trail(E.filter((_, j) => j !== i))));
  assert.equal(answer("konigsberg"), 1);
  assert.ok(trail(E.filter((_, j) => j !== 5)));   // the bridge B-D removed
});

test("Josephus: survivor of 41 is 19 and follows 2l + 1", () => {
  assert.equal(josephusOrder(41).last, answer("josephus"));
  for (let n = 1; n <= 200; n++) { const m = 2 ** Math.floor(Math.log2(n)); assert.equal(josephusOrder(n).last, 2 * (n - m) + 1, `n=${n}`); }
});

test("Ramsey: some 2-colouring of K5 has no one-colour triangle, none of K6 does", () => {
  const free = (n) => {
    const edges = []; for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) edges.push([a, b]);
    const idx = (a, b) => edges.findIndex((e) => e[0] === a && e[1] === b);
    const tri = []; for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++) tri.push([idx(a, b), idx(a, c), idx(b, c)]);
    for (let bits = 0; bits < 2 ** edges.length; bits++) if (tri.every(([x, y, z]) => { const v = [(bits >> x) & 1, (bits >> y) & 1, (bits >> z) & 1]; return !(v[0] === v[1] && v[1] === v[2]); })) return true;
    return false;
  };
  assert.equal(free(5), true); assert.equal(free(6), false); assert.equal(answer("ramsey"), 6);
});

test("art gallery: triangulation, 3-colouring, guards and necessity on the 12-sided comb", () => {
  assert.equal(COMB.length, 12); assert.ok(area2(COMB) > 0);
  const tris = triangulate(COMB); assert.equal(tris.length, 10);
  const col = threeColour(12, tris);
  assert.ok(tris.every((t) => new Set(t.map((i) => col[i])).size === 3));
  const sizes = [0, 1, 2].map((c) => col.filter((x) => x === c).length);
  assert.equal(Math.min(...sizes), Math.floor(12 / 3)); assert.equal(answer("artgallery"), 4);
  // guards on the smallest colour class see every sampled point
  const best = sizes.indexOf(Math.min(...sizes)), guards = COMB.filter((_, i) => col[i] === best).map((g) => visibility(COMB, g));
  for (let x = 0.05; x < 18; x += 0.15) for (let y = 0.05; y < 10; y += 0.15) if (pointInPolygon([x, y], COMB)) assert.ok(guards.some((v) => pointInPolygon([x, y], v)), `uncovered ${x},${y}`);
  // necessity: no point of the comb sees two of the four tooth tips
  const tips = [2, 5, 8, 11].map((i) => COMB[i]);
  for (let x = 0.1; x < 18; x += 0.3) for (let y = 0.1; y < 10; y += 0.3) if (pointInPolygon([x, y], COMB)) { const v = visibility(COMB, [x, y]); assert.ok(tips.filter((t) => pointInPolygon(t, v)).length <= 1, `sees two tips from ${x},${y}`); }
});
