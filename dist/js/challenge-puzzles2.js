// Pure mathematics of the second set of puzzles: Euclidean geometry (shortest path by reflection, Hippocrates'
// lunes, the angles of a star, the ant on the box) and invariants / monovariants (the numbers a + b + ab, the
// chameleons, inversions, the split piles). No DOM: tests/challenge-puzzles2.test.mjs checks each by another method.

/* ----------------------------------------- A: shortest path via a mirror */
// A and B stand at distances a and b from a straight river, d apart along it. Path A → point x of the river → B.
export const pathLength = (a, b, d, x) => Math.hypot(x, a) + Math.hypot(d - x, b);
// Reflect B in the river: the straight line from A to B' = (d, −b) has length √(d² + (a + b)²) and meets the river at x*.
export const shortestVia = (a, b, d) => Math.hypot(d, a + b);
export const bestContact = (a, b, d) => (a * d) / (a + b);
export const REFLECT_SETS = ["1,2,4", "2,3,12", "3,5,15", "4,4,6", "1,7,15", "5,7,9"];
export const reflectSet = (id) => String(id).split(",").map(Number);

/* ------------------------------------------------- B: Hippocrates' lunes */
// Right angle at C = (0, 0), A = (a, 0), B = (0, b). Semicircles on the legs are drawn away from the triangle; the
// big circle has the hypotenuse AB as diameter (it passes through C). A lune is a point of a leg semi-disc outside
// the big circle. Area by counting grid cells, independently of the theorem (area of both lunes = area of ABC).
export function luneArea(a, b, N = 1400) {
  const cx = a / 2, cy = b / 2, R2 = (a * a + b * b) / 4, x0 = -b / 2, x1 = a, y0 = -a / 2, y1 = b, dx = (x1 - x0) / N, dy = (y1 - y0) / N;
  let hits = 0;
  for (let i = 0; i < N; i++) {
    const x = x0 + (i + 0.5) * dx;
    for (let j = 0; j < N; j++) {
      const y = y0 + (j + 0.5) * dy;
      const inLegA = y < 0 && (x - a / 2) ** 2 + y * y <= (a / 2) ** 2, inLegB = x < 0 && x * x + (y - b / 2) ** 2 <= (b / 2) ** 2;
      if ((inLegA || inLegB) && (x - cx) ** 2 + (y - cy) ** 2 > R2) hits++;
    }
  }
  return hits * dx * dy;
}
export const luneTotal = (a, b) => (a * b) / 2;

/* ----------------------------------------------------- C: star polygons */
const gcd = (x, y) => (y ? gcd(y, x % y) : x);
// The star {n/k}: every vertex of a regular n-gon is joined to the k-th next one. k must satisfy gcd(n, k) = 1 and 2k < n.
export const starK = (n, k) => { for (let kk = Math.min(Math.max(1, k), Math.floor((n - 1) / 2)); kk >= 1; kk--) if (gcd(n, kk) === 1) return kk; return 1; };
export const starTipDegrees = (n, k) => 180 - (360 * k) / n;
export const starSumDegrees = (n, k) => 180 * (n - 2 * k);
// The tip angle measured from coordinates: at vertex 0, between the chords to the vertices k ahead and k behind.
export function measuredTip(n, k) {
  const P = (i) => [Math.cos((2 * Math.PI * i) / n), Math.sin((2 * Math.PI * i) / n)], o = P(0), u = P(k), v = P(n - k);
  const a = [u[0] - o[0], u[1] - o[1]], b = [v[0] - o[0], v[1] - o[1]];
  return (Math.acos((a[0] * b[0] + a[1] * b[1]) / (Math.hypot(...a) * Math.hypot(...b))) * 180) / Math.PI;
}

/* ------------------------------------------------------- D: ant on a box */
// Two adjacent faces unfolded into one rectangle (x + y) × z: the straight segment has length √((x + y)² + z²).
export function boxUnfoldings(a, b, c) {
  return [{ cross: [a, b], height: c }, { cross: [a, c], height: b }, { cross: [b, c], height: a }].map((u) => ({ ...u, length: Math.hypot(u.cross[0] + u.cross[1], u.height) }));
}
export const boxPath = (a, b, c) => Math.min(...boxUnfoldings(a, b, c).map((u) => u.length));
export const BOX_SETS = ["1,2,4", "2,3,12", "3,5,6", "4,5,12", "5,7,9", "1,5,8"];
export const boxSet = (id) => String(id).split(",").map(Number);

/* ------------------------------------------- E: erase two, write a+b+ab */
export const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));
export const mergeFinal = (n) => factorial(n + 1) - 1;
// ∏(x + 1) does not change when a, b are replaced by a + b + ab: the product of (x + 1) is the invariant.
export const mergeProduct = (nums) => nums.reduce((p, x) => p * (x + 1), 1);

/* ------------------------------------------------------- F: chameleons */
// (r, g, b): when two chameleons of different colours meet, both take the third colour.
export const CHAM_SETS = ["13,15,17", "8,5,2", "7,10,13", "4,7,9", "1,4,7", "3,5,7"];
export const chamSet = (id) => String(id).split(",").map(Number);
const chamNext = (s) => [[0, 1, 2], [0, 2, 1], [1, 2, 0]].filter(([i, j]) => s[i] > 0 && s[j] > 0).map(([i, j, k]) => { const t = [...s]; t[i]--; t[j]--; t[k] += 2; return { state: t, meet: [i, j] }; });
// Shortest sequence of meetings leading to a single colour (null when impossible), by breadth-first search.
export function chamSolve(r, g, b) {
  const key = (s) => s.join(","), start = [r, g, b], prev = new Map([[key(start), null]]); let frontier = [start];
  const single = (s) => s.filter((x) => x > 0).length === 1;
  while (frontier.length) {
    const next = [];
    for (const s of frontier) for (const { state, meet } of chamNext(s)) {
      const kk = key(state); if (prev.has(kk)) continue;
      prev.set(kk, { from: s, meet });
      if (single(state)) { const steps = []; let cur = state; while (prev.get(key(cur))) { const { from, meet: m } = prev.get(key(cur)); steps.unshift({ from, to: cur, meet: m }); cur = from; } return steps; }
      next.push(state);
    }
    frontier = next;
  }
  return null;
}
export const chamMin = (r, g, b) => (chamSolve(r, g, b) || []).length;
// Invariant: the differences of the three counts modulo 3. All one colour needs two counts equal to 0, so two counts congruent mod 3.
export const chamPossible = (r, g, b) => (r - g) % 3 === 0 || (g - b) % 3 === 0 || (r - b) % 3 === 0;

/* ----------------------------------------------------------- G: inversions */
const mulberry = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
export function permOf(n, seed) { const rnd = mulberry(seed * 7919 + 17 + n), p = Array.from({ length: n }, (_, i) => i + 1); for (let i = n - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } return p; }
export const inversions = (p) => { let c = 0; for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) if (p[i] > p[j]) c++; return c; };
// Bubble sort by adjacent swaps of out-of-order neighbours; returns the number of swaps and the list of swapped positions.
export function bubbleSwaps(p) { const a = [...p], log = []; let moved = true; while (moved) { moved = false; for (let i = 0; i + 1 < a.length; i++) if (a[i] > a[i + 1]) { [a[i], a[i + 1]] = [a[i + 1], a[i]]; log.push(i); moved = true; } } return { count: log.length, log, sorted: a }; }

/* ------------------------------------------------------------ H: split piles */
// Split a pile of n stones into two, scoring the product of the sizes, until only single stones remain: the total
// is n(n − 1)/2 whatever the splits, because each pair of stones is separated exactly once.
export const splitTotal = (n) => (n * (n - 1)) / 2;
export function randomSplitTotal(n, rnd = Math.random) { const piles = [n]; let total = 0; while (piles.some((x) => x > 1)) { const i = piles.findIndex((x) => x > 1), s = piles[i], a = 1 + Math.floor(rnd() * (s - 1)); piles.splice(i, 1, a, s - a); total += a * (s - a); } return total; }

/* --------------------------------------------------------- I: three pegs */
// Pegs a, b, c start at (0, 0), (1, 0), (0, 1). A peg jumps over another peg and lands on the point symmetric to its
// place about that peg (2B − A), if that point is free. Invariant: 2B − A ≡ A (mod 2) in both coordinates, so every
// peg keeps its parity class (x mod 2, y mod 2) for ever; a point of the fourth class, (1, 1), can never be reached.
export const PEGS_START = [[0, 0], [1, 0], [0, 1]];
export const PEG_TARGETS = ["1,1", "-1,1", "3,1", "2,0", "2,1", "3,0", "2,2", "4,0"];
export const pegTarget = (id) => String(id).split(",").map(Number);
const mod2 = (x) => ((x % 2) + 2) % 2;
export const pegClass = ([x, y]) => [mod2(x), mod2(y)];
export const pegLanding = (from, over) => [2 * over[0] - from[0], 2 * over[1] - from[1]];
// Every legal jump from a position: { peg, over, to } (indices into the position).
export function pegJumps(pos) {
  const out = [];
  for (let i = 0; i < pos.length; i++) for (let j = 0; j < pos.length; j++) {
    if (i === j) continue;
    const to = pegLanding(pos[i], pos[j]);
    if (!pos.some((p, k) => k !== i && p[0] === to[0] && p[1] === to[1])) out.push({ peg: i, over: j, to });
  }
  return out;
}
// Necessary condition from the invariant: the target must lie in the parity class of one of the three pegs.
export const pegsPossible = (target) => PEGS_START.some((p) => pegClass(p).join() === pegClass(target).join());
// Shortest sequence of jumps that puts some peg on the target, by breadth-first search (null when the invariant forbids it).
const pegCache = new Map();
export function pegsSolve(target, limit = 9) {
  const id = target.join(",");
  if (pegCache.has(id)) return pegCache.get(id);
  let result = null;
  if (pegsPossible(target)) {
    const key = (s) => s.map((p) => p.join(",")).join(";"), prev = new Map([[key(PEGS_START), null]]);
    let frontier = [PEGS_START];
    const on = (s) => s.some((p) => p[0] === target[0] && p[1] === target[1]);
    if (on(PEGS_START)) result = [];
    for (let d = 0; d < limit && !result; d++) {
      const next = [];
      for (const s of frontier) {
        for (const { peg, over, to } of pegJumps(s)) {
          const t = s.map((p) => [...p]); t[peg] = to;
          const kk = key(t); if (prev.has(kk)) continue;
          prev.set(kk, { from: s, peg, over });
          if (on(t)) {
            const steps = []; let cur = t;
            while (prev.get(key(cur))) { const { from, peg: pg, over: ov } = prev.get(key(cur)); steps.unshift({ peg: pg, over: ov, from: from[pg], to: cur[pg], state: cur }); cur = from; }
            result = steps; break;
          }
          next.push(t);
        }
        if (result) break;
      }
      frontier = next;
    }
  }
  pegCache.set(id, result);
  return result;
}
export const pegsMin = (target) => (pegsSolve(target) || []).length;

/* ------------------------------------------------------------------ nim: a scripted game for the animated solution */
// A scripted game. With r = n mod (m + 1) > 0 you open with r, then answer each opponent move k with m + 1 − k.
// With r = 0 you open with 1 and the opponent answers so that a multiple of m + 1 is left to you.
export function nimScript(q) {
  const b = q.m + 1, r = q.n % b, moves = [];
  let left = q.n, i = 0;
  if (r > 0) { moves.push([1, r]); left -= r; } else { moves.push([1, 1]); left -= 1; }
  while (left > 0) {
    const k = r > 0 ? Math.min(left, ((i * 2) % q.m) + 1) : left % b === 0 ? Math.min(left, 1) : left % b;   // opponent move (the perfect one when r = 0)
    i++; moves.push([2, k]); left -= k;
    if (left > 0) { const reply = Math.min(left, r > 0 ? b - k : 1 + ((i * 3) % q.m)); moves.push([1, reply]); left -= reply; }
  }
  return moves;
}
