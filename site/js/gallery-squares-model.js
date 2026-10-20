// Pure mathematics of the square packing exhibit (no DOM): unit squares given by centre and angle, exact overlap test
// (separating axes), the smallest axis-parallel square containing them, the records table and the exact packings shown.
// Checked in tests/reading.test.mjs.
import { PACKINGS } from './gallery-squares-data.js';

export const EPS = 1e-9;   // touching is allowed: overlaps thinner than this are ignored

// A unit square: { x, y, a } with centre (x, y) and angle a in radians.
export function vertices({ x, y, a }) {
  const c = Math.cos(a) / 2, s = Math.sin(a) / 2;
  return [[x - c + s, y - s - c], [x + c + s, y + s - c], [x + c - s, y + s + c], [x - c - s, y - s + c]];
}
const axes = ({ a }) => [[Math.cos(a), Math.sin(a)], [-Math.sin(a), Math.cos(a)]];
const span = (pts, [ux, uy]) => { let lo = Infinity, hi = -Infinity; for (const [x, y] of pts) { const d = x * ux + y * uy; if (d < lo) lo = d; if (d > hi) hi = d; } return [lo, hi]; };

// Depth of the overlap of two squares (0 when they are disjoint or only touch): by the separating axis theorem two
// convex polygons are disjoint exactly when their projections on one of the edge normals do not overlap.
export function overlapDepth(p, q) {
  const vp = vertices(p), vq = vertices(q);
  let depth = Infinity;
  for (const u of [...axes(p), ...axes(q)]) {
    const [a0, a1] = span(vp, u), [b0, b1] = span(vq, u);
    depth = Math.min(depth, Math.min(a1, b1) - Math.max(a0, b0));
    if (depth <= EPS) return 0;
  }
  return depth;
}
export function overlaps(squares) {
  const out = [];
  for (let i = 0; i < squares.length; i++) for (let j = i + 1; j < squares.length; j++) if (overlapDepth(squares[i], squares[j]) > EPS) out.push([i, j]);
  return out;
}

// Smallest square with sides parallel to the axes that contains every square: [x0, y0, side].
export function frame(squares) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const sq of squares) for (const [x, y] of vertices(sq)) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return [x0, y0, Math.max(x1 - x0, y1 - y0)];
}

// Best known sides s(n) for n = 1 to 28 and their packings: gallery-squares-data.js (generated from the squares
// project, with E. Friedman's credits). `exact` adds the closed form where one is known (checked in the tests);
// `status` is proved, claimed (announced in 2026, not yet published) or open.
const R2 = Math.SQRT2;
const EXACT = { 5: "2 + 1/√2", 10: "3 + 1/√2", 18: "7/2 + √7/2", 19: "3 + 4√2/3", 26: "7/2 + 3/√2", 27: "5 + 1/√2" };
export const MAX_N = 28;
export const RECORDS = Object.fromEntries(Object.entries(PACKINGS).map(([n, p]) => [n, { side: p.side, exact: EXACT[n] || (Number.isInteger(p.side) ? String(p.side) : null), status: p.status, ref: p.ref, by: p.by }]));

// n squares in rows of k, from the lower left corner.
export function grid(n, k = Math.ceil(Math.sqrt(n))) {
  return Array.from({ length: n }, (_, i) => ({ x: (i % k) + 0.5, y: Math.floor(i / k) + 0.5, a: 0 }));
}
// Five squares: one in each corner of a square of side 2 + 1/√2 and one turned by 45° in the middle, touching all four.
export function five(dx = 0, dy = 0) {
  const s = 2 + 1 / R2;
  return [[0.5, 0.5], [s - 0.5, 0.5], [0.5, s - 0.5], [s - 0.5, s - 0.5]].map(([x, y]) => ({ x: x + dx, y: y + dy, a: 0 })).concat({ x: s / 2 + dx, y: s / 2 + dy, a: Math.PI / 4 });
}
// Ten squares in a square of side 3 + 1/√2: the five-square packing in one corner, then a column of three and a row of two.
export function ten() {
  const s = 3 + 1 / R2;
  return five(1, 0).concat([0.5, 1.5, 2.5].map((y) => ({ x: 0.5, y, a: 0 })), [1.5, 2.5].map((x) => ({ x, y: s - 0.5, a: 0 })));
}
// The best known packing of n squares (1 ≤ n ≤ 28), as centres and angles.
export function bestPacking(n) {
  const p = PACKINGS[n];
  return p ? p.squares.map(([x, y, a]) => ({ x, y, a })) : null;
}
