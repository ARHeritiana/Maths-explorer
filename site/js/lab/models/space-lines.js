// Pure maths of the space-lines experiment: the plane P: x + y + 2z + d = 0 (normal vector n = (1 ; 1 ; 2)), the line through
// A with direction vector u (the points M(t) = A + t u), their common points, the orthogonal projection H of A on P and the
// distance AH. The plane and the line are cut to a box for drawing. No DOM, in an orthonormal frame.
export const N = [1, 1, 2];
// What the handles can reach (the clamps of the experiment) and the box the figure is fitted to.
export const BOX = [[-4, 4], [-4, 4], [-1, 6]];
const clean = (x) => (Object.is(x, -0) || Math.abs(x) < 1e-12 ? 0 : x);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const along = (a, u, t) => [a[0] + t * u[0], a[1] + t * u[1], a[2] + t * u[2]];

// The part of the line A + t u inside the box: [t0, t1], or null.
export function clipLine(A, u, box = BOX) {
  let lo = -Infinity, hi = Infinity;
  for (let k = 0; k < 3; k++) {
    if (u[k] === 0) { if (A[k] < box[k][0] || A[k] > box[k][1]) return null; continue; }
    const a = (box[k][0] - A[k]) / u[k], b = (box[k][1] - A[k]) / u[k];
    lo = Math.max(lo, Math.min(a, b)); hi = Math.min(hi, Math.max(a, b));
  }
  return lo < hi ? [lo, hi] : null;
}

// Sutherland-Hodgman against the half-space x_k >= bound (keepAbove) or x_k <= bound.
function clipHalf(poly, k, bound, keepAbove) {
  const inside = (p) => (keepAbove ? p[k] >= bound - 1e-12 : p[k] <= bound + 1e-12), out = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length];
    if (inside(p)) out.push(p);
    if (inside(p) !== inside(q)) { const t = (bound - p[k]) / (q[k] - p[k]); out.push(along(p, [q[0] - p[0], q[1] - p[1], q[2] - p[2]], t)); }
  }
  return out;
}
// The polygon in which the plane n . X + d = 0 cuts the box, in order around its boundary; null if it misses the box.
export function planePolygon(n, d, box = BOX) {
  const nn = dot(n, n), p0 = [-d * n[0] / nn, -d * n[1] / nn, -d * n[2] / nn];
  const seed = Math.abs(n[0]) < Math.abs(n[1]) ? [1, 0, 0] : [0, 1, 0];
  let e1 = [n[1] * seed[2] - n[2] * seed[1], n[2] * seed[0] - n[0] * seed[2], n[0] * seed[1] - n[1] * seed[0]];
  const l1 = Math.hypot(...e1); e1 = e1.map((v) => (v / l1) * 40);
  let e2 = [n[1] * e1[2] - n[2] * e1[1], n[2] * e1[0] - n[0] * e1[2], n[0] * e1[1] - n[1] * e1[0]];
  const l2 = Math.hypot(...e2); e2 = e2.map((v) => (v / l2) * 40);
  let poly = [along(along(p0, e1, 1), e2, 1), along(along(p0, e1, -1), e2, 1), along(along(p0, e1, -1), e2, -1), along(along(p0, e1, 1), e2, -1)];
  for (let k = 0; k < 3 && poly.length; k++) { poly = clipHalf(poly, k, box[k][0], true); if (poly.length) poly = clipHalf(poly, k, box[k][1], false); }
  return poly.length >= 3 ? poly.map((p) => p.map(clean)) : null;
}

export function model(s) {
  const A = [s.ax, s.ay, s.az], u = [s.ux, s.uy, s.uz], n = N, d = s.d;
  const nu = clean(dot(n, u)), sA = clean(dot(n, A) + d), degenerate = u.every((v) => v === 0);
  const relation = degenerate ? null : nu !== 0 ? "secant" : sA === 0 ? "inside" : "parallel";
  const tStar = relation === "secant" ? clean(-sA / nu) : null;
  const nn = dot(n, n);
  return {
    A, u, n, d, B: along(A, u, 1), M: along(A, u, s.t ?? 0), nu, sA, degenerate, relation, tStar,
    I: tStar === null ? null : along(A, u, tStar).map(clean),
    // projection of A on the plane along n, and the distance AH = |n . A + d| / |n|
    H: along(A, n, -sA / nn).map(clean), dist: Math.abs(sA) / Math.sqrt(nn),
    clip: degenerate ? null : clipLine(A, u),
    planePoly: planePolygon(n, d),
  };
}
export const quantities = {
  tStar: (s) => model(s).tStar,
  nu: (s) => model(s).nu,
  dist: (s) => model(s).dist,
  sA: (s) => model(s).sA,
};
export const quantity = (name, s) => quantities[name](s);
