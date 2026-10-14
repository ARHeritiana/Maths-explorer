// Pure mathematics of the classic puzzles (grid paths, 25 horses, the cake, queens, the snail, the bridge, the light
// egg, the fake coins). No DOM: tests/challenge-puzzles.test.mjs checks each result by an independent method.

/* ------------------------------------------------------------ grid paths */
// Number of shortest paths to each lattice point of an m × n grid (moves right or up): the Pascal rule
// paths(i, j) = paths(i − 1, j) + paths(i, j − 1). Rows are indexed by j (height), columns by i.
export function pascalGrid(m, n) {
  const g = Array.from({ length: n + 1 }, () => Array(m + 1).fill(1));
  for (let j = 1; j <= n; j++) for (let i = 1; i <= m; i++) g[j][i] = g[j - 1][i] + g[j][i - 1];
  return g;
}
export const gridPaths = (m, n) => pascalGrid(m, n)[n][m];

/* ---------------------------------------------------------------- horses */
// The seven-race method for the three fastest of 25 horses (races of at most five, no clock: only the finishing
// order is seen). `speed(h)` is the hidden speed of horse h (0..24, larger = faster). Returns the answer and the log.
export function horsesTop3(speed) {
  const log = [], race = (hs, label) => { const order = [...hs].sort((a, b) => speed(b) - speed(a)); log.push({ label, horses: [...hs], order }); return order; };
  const heats = [0, 1, 2, 3, 4].map((g) => race([0, 1, 2, 3, 4].map((k) => 5 * g + k), `heat ${g + 1}`));
  const finalists = race(heats.map((h) => h[0]), "winners");
  const rank = finalists.map((w) => heats.findIndex((h) => h[0] === w));   // heat of the 1st, 2nd, ... fastest winner
  const [A, B, C] = [heats[rank[0]], heats[rank[1]], heats[rank[2]]];
  const last = race([A[1], A[2], B[0], B[1], C[0]], "candidates");
  return { top3: [A[0], last[0], last[1]], races: log.length, log, candidates: [A[1], A[2], B[0], B[1], C[0]] };
}
// With r = 1 only the winner is wanted: 24 horses must lose and a race of five creates at most 4 losers.
export const horseRaces = (top) => (Number(top) === 1 ? 6 : 7);
export function horsesTop1(speed) {
  const log = [], race = (hs, label) => { const order = [...hs].sort((a, b) => speed(b) - speed(a)); log.push({ label, horses: [...hs], order }); return order; };
  const heats = [0, 1, 2, 3, 4].map((g) => race([0, 1, 2, 3, 4].map((k) => 5 * g + k), `heat ${g + 1}`));
  const final = race(heats.map((h) => h[0]), "winners");
  return { top1: final[0], races: log.length, log };
}

/* ------------------------------------------------------------------ cake */
// A cube cake of side 1, cream on the top and the four sides. Cuts are vertical planes through the centre of the top
// face, meeting the edge of the top square at the perimeter positions `cuts` (0 ≤ t < 4, counted anticlockwise from
// the bottom-left corner, one unit per side). Returns, for each piece (between consecutive cuts), its share of the
// cake volume and its share of the cream.
export function squarePoint(t) {
  const s = ((t % 4) + 4) % 4, k = Math.floor(s), u = s - k;
  return [[u, 0], [1, u], [1 - u, 1], [0, 1 - u]][k];
}
export function cakeShares(cuts) {
  const ts = [...cuts].map((t) => ((t % 4) + 4) % 4).sort((a, b) => a - b), n = ts.length, out = [];
  for (let i = 0; i < n; i++) {
    const a = ts[i], b = i + 1 < n ? ts[i + 1] : ts[0] + 4, pts = [[0.5, 0.5], squarePoint(a)];
    for (let c = Math.floor(a) + 1; c < b; c++) pts.push(squarePoint(c));
    pts.push(squarePoint(b));
    let area = 0; for (let j = 0; j < pts.length; j++) { const [x1, y1] = pts[j], [x2, y2] = pts[(j + 1) % pts.length]; area += x1 * y2 - x2 * y1; }
    area = Math.abs(area) / 2;
    const arc = b - a;                      // length of its stretch of crust (each side has length 1, height 1)
    out.push({ volume: area, cream: (area + arc) / 5, arc });   // top area + side area, over the total cream 1 + 4 = 5
  }
  return out;
}
export const cakeCream = (a, n) => (5 * a * a) / n;

/* ---------------------------------------------------------------- queens */
// Squares that are neither occupied nor attacked (a queen's line of sight stops at the first piece).
export function unattacked(n, queens) {
  const occ = new Set(queens), out = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (occ.has(r * n + c)) continue;
    let hit = false;
    for (const q of queens) {
      const qr = Math.floor(q / n), qc = q % n, dr = r - qr, dc = c - qc;
      if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) continue;
      const sr = Math.sign(dr), sc = Math.sign(dc);
      let rr = qr + sr, cc = qc + sc, clear = true;
      while (rr !== r || cc !== c) { if (occ.has(rr * n + cc)) { clear = false; break; } rr += sr; cc += sc; }
      if (clear) { hit = true; break; }
    }
    if (!hit) out.push(r * n + c);
  }
  return out;
}
// Largest number of unattacked squares with k queens on an n × n board, with one placement reaching it (squares
// numbered row by row from 0). Found by exhaustive enumeration of every placement (see the tests).
export const QUEENS = {
  "4,1": [6, [0]], "4,2": [3, [0, 2]], "4,3": [2, [0, 1, 8]], "4,4": [1, [0, 1, 3, 5]],
  "5,1": [12, [0]], "5,2": [7, [0, 2]], "5,3": [5, [0, 1, 15]], "5,4": [4, [0, 2, 10, 12]], "5,5": [3, [1, 2, 6, 9, 14]],
  "6,1": [20, [0]], "6,2": [13, [0, 2]], "6,3": [9, [0, 1, 7]], "6,4": [8, [0, 2, 12, 14]], "6,5": [6, [0, 2, 3, 12, 14]], "6,6": [5, [0, 1, 7, 8, 24, 25]],
};
export const queensK = (n, k) => Math.min(Math.max(1, k), n);
export const queensBest = (n, k) => QUEENS[`${n},${queensK(n, k)}`][0];

/* ----------------------------------------------------------------- snail */
// Day on which a snail that climbs `up` metres each day and slips `down` metres each night first reaches height h.
export const snailDown = (up, down) => Math.min(Math.max(1, down), up - 1);
export const snailDays = (h, up, down) => { const d = snailDown(up, down); return h <= up ? 1 : Math.ceil((h - up) / (up - d)) + 1; };
export function snailTrace(h, up, down) {
  const d = snailDown(up, down), out = []; let y = 0, day = 0;
  while (day < 1000) { day++; y += up; out.push({ day, peak: Math.min(y, h), end: y >= h ? Math.min(y, h) : y - d, done: y >= h }); if (y >= h) break; y -= d; }
  return out;
}

/* ---------------------------------------------------------------- bridge */
// Four people with crossing times a ≤ b ≤ c ≤ d, one torch, at most two at a time. Two classical plans:
//   A: a+b go, a returns, c+d go, b returns, a+b go            → a + 3b + d
//   B: a+d go, a returns, a+c go, a returns, a+b go            → 2a + b + c + d
export function bridgePlans(times) {
  const [a, b, c, d] = [...times].sort((x, y) => x - y);
  return {
    A: { total: a + 3 * b + d, moves: [[[a, b], "over", b], [[a], "back", a], [[c, d], "over", d], [[b], "back", b], [[a, b], "over", b]] },
    B: { total: 2 * a + b + c + d, moves: [[[a, d], "over", d], [[a], "back", a], [[a, c], "over", c], [[a], "back", a], [[a, b], "over", b]] },
  };
}
export const bridgeBest = (times) => { const p = bridgePlans(times); return Math.min(p.A.total, p.B.total); };
export const bridgeBestPlan = (times) => { const p = bridgePlans(times); return p.A.total <= p.B.total ? "A" : "B"; };
export const BRIDGE_SETS = ["1,2,5,10", "1,3,6,8", "1,2,7,8", "1,4,5,6", "2,3,8,9", "3,4,5,6"];
export const bridgeTimes = (id) => String(id).split(",").map(Number);

/* ------------------------------------------------------------ light egg */
// Fewest weighings that always find the one lighter egg among n, on a two-pan balance: 3^k ≥ n.
export const eggWeighings = (n) => { let k = 0, cap = 1; while (cap < n) { cap *= 3; k++; } return k; };
// A weighing plan: sizes of the three groups (left pan, right pan, aside), as even as the capacity allows.
export function splitThree(n, weighingsLeft) {
  const cap = 3 ** (weighingsLeft - 1), a = Math.min(cap, Math.floor(n / 2));
  return [a, a, n - 2 * a];
}

/* ------------------------------------------------------------ fake coins */
// One weighing on a precise scale: the counts taken from the piles must be pairwise different, so the sum is at least
// 0 + 1 + … + (n − 1). The classical choice 1, 2, …, n uses n(n + 1)/2 coins.
export const minSample = (n) => (n * (n - 1)) / 2;
export const classicSample = (n) => (n * (n + 1)) / 2;
// Which pile (0-based) does a design identify from the deficit? Returns null when two piles give the same reading.
export const identifies = (counts) => new Set(counts).size === counts.length;
