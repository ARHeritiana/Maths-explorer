// Pure mathematics of the inscribed square exhibit (no DOM): a closed curve through control points (periodic
// Catmull-Rom spline), a self-crossing test, and a numerical search for inscribed squares, or rectangles whose
// diagonals meet at a given angle. Checked in tests/gallery-puzzles.test.mjs.

// Closed smooth curve through the control points, n samples per arc; `corners` keeps straight sides (polygons).
export function curve(ctrl, { n = 24, corners = false } = {}) {
  if (corners) { const out = []; ctrl.forEach((a, i) => { const b = ctrl[(i + 1) % ctrl.length]; for (let k = 0; k < n; k++) out.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]); }); return out; }
  const m = ctrl.length, out = [];
  for (let i = 0; i < m; i++) {
    const p0 = ctrl[(i - 1 + m) % m], p1 = ctrl[i], p2 = ctrl[(i + 1) % m], p3 = ctrl[(i + 2) % m];
    for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t; out.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3))); }
  }
  return out;
}
// Does the closed polyline cross itself? (A Jordan curve must not.)
export function selfCrossing(pts) {
  const n = pts.length, cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) {
    if (i === 0 && j === n - 1) continue;
    const a = pts[i], b = pts[(i + 1) % n], c = pts[j], d = pts[(j + 1) % n];
    if (cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0) return true;
  }
  return false;
}
// Point at arc-length parameter u ∈ [0, 1) of the closed polyline (with its cumulative lengths).
function measure(pts) { const L = [0]; for (let i = 1; i <= pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i % pts.length][0] - pts[i - 1][0], pts[i % pts.length][1] - pts[i - 1][1])); return L; }
function at(pts, L, u) { const d = (((u % 1) + 1) % 1) * L.at(-1); let lo = 0, hi = pts.length; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (L[m] <= d) lo = m; else hi = m; } const a = pts[lo], b = pts[(lo + 1) % pts.length], f = (d - L[lo]) / (L[lo + 1] - L[lo] || 1); return [a[0] + f * (b[0] - a[0]), a[1] + f * (b[1] - a[1])]; }
// Distance from a point to the polyline, with a uniform grid of segments so that each query is short.
function distanceField(pts, cell) {
  const grid = new Map(), key = (i, j) => i * 100003 + j;
  pts.forEach((a, s) => { const b = pts[(s + 1) % pts.length]; for (let i = Math.floor(Math.min(a[0], b[0]) / cell); i <= Math.floor(Math.max(a[0], b[0]) / cell); i++) for (let j = Math.floor(Math.min(a[1], b[1]) / cell); j <= Math.floor(Math.max(a[1], b[1]) / cell); j++) { const k = key(i, j); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(s); } });
  const seg = (p, s) => { const a = pts[s], b = pts[(s + 1) % pts.length], dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy, t = l ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l)) : 0; return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy); };
  return (p, limit) => { const i0 = Math.floor(p[0] / cell), j0 = Math.floor(p[1] / cell); let best = Infinity; for (let i = i0 - 1; i <= i0 + 1; i++) for (let j = j0 - 1; j <= j0 + 1; j++) for (const s of grid.get(key(i, j)) || []) best = Math.min(best, seg(p, s)); return best <= limit ? best : Infinity; };
}
// The rectangle with diagonal p → q whose other diagonal is turned by `angle` (π/2 for a square), corners in order.
export function fromDiagonal(p, q, angle = Math.PI / 2) {
  const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], h = [(q[0] - p[0]) / 2, (q[1] - p[1]) / 2], c = Math.cos(angle), s = Math.sin(angle), r = [h[0] * c - h[1] * s, h[0] * s + h[1] * c];
  return [p, [m[0] + r[0], m[1] + r[1]], q, [m[0] - r[0], m[1] - r[1]]];
}
// Search: every pair of samples as a diagonal, keep the pairs whose two other corners are near the curve, polish them
// by a small descent along the curve, keep those within `tol` (relative to the size of the curve), drop duplicates.
// A curve with straight parallel sides has whole families of squares: at most `limit` are kept.
export function inscribed(pts, { angle = Math.PI / 2, samples = 160, tol = 2e-3, minSide = 0.04, limit = 40 } = {}) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), size = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) || 1;
  const L = measure(pts), field = distanceField(pts, size / 24), coarse = 1.2 * L.at(-1) / samples;
  const err = (u, v) => { const r = fromDiagonal(at(pts, L, u), at(pts, L, v), angle); return Math.hypot(field(r[1], size), field(r[3], size)); };
  const found = [];
  for (let i = 0; i < samples; i++) for (let j = i + 1; j < samples; j++) {
    const u = i / samples, v = j / samples, r = fromDiagonal(at(pts, L, u), at(pts, L, v), angle);
    if (field(r[1], coarse) === Infinity || field(r[3], coarse) === Infinity) continue;
    if (found.length >= limit || found.some((f) => r.every((p) => f.corners.some((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.03 * size)))) continue;
    // polish (u, v): pattern search with a shrinking step
    let bu = u, bv = v, be = err(u, v);
    for (let step = 1 / samples; step > 1e-7; step /= 2) { let moved = true; while (moved) { moved = false; for (const [du, dv] of [[step, 0], [-step, 0], [0, step], [0, -step], [step, step], [-step, -step], [step, -step], [-step, step]]) { const e = err(bu + du, bv + dv); if (e < be) { be = e; bu += du; bv += dv; moved = true; } } } }
    if (be > tol * size) continue;
    const sq = fromDiagonal(at(pts, L, bu), at(pts, L, bv), angle), side = Math.hypot(sq[1][0] - sq[0][0], sq[1][1] - sq[0][1]);
    if (side < minSide * size) continue;
    const c = [(sq[0][0] + sq[2][0]) / 2, (sq[0][1] + sq[2][1]) / 2];
    // the same rectangle is found from either diagonal: compare centres and the set of corners
    if (found.some((f) => Math.hypot(f.centre[0] - c[0], f.centre[1] - c[1]) < 0.02 * size && sq.every((p) => f.corners.some((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.03 * size)))) continue;
    found.push({ corners: sq, centre: c, side, error: be / size });
  }
  return found.sort((a, b) => b.side - a.side);
}

// Starting curves (control points in a 10 × 7 box).
export const PRESETS = {
  blob: { ctrl: [[2, 2], [5, 1.2], [8, 2.2], [8.6, 4.6], [6.4, 6], [3.4, 5.6], [1.4, 4.4]] },
  ellipse: { ctrl: Array.from({ length: 12 }, (_, k) => [5 + 3.6 * Math.cos((k * Math.PI) / 6), 3.5 + 2 * Math.sin((k * Math.PI) / 6)]) },
  acute: { ctrl: [[1.5, 1], [8.5, 1.5], [5.5, 6.3]], corners: true },
  obtuse: { ctrl: [[1, 1.5], [9, 1.5], [3, 3.6]], corners: true },
  star: { ctrl: Array.from({ length: 10 }, (_, k) => { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 1.4 : 3.2; return [5 + r * Math.cos(a), 3.6 + r * Math.sin(a)]; }), corners: true },
  spiral: { ctrl: [[1, 1], [9, 1], [9, 6], [3, 6], [3, 3], [6.5, 3], [6.5, 4.4], [4.4, 4.4], [4.4, 5], [7.6, 5], [7.6, 2], [2, 2], [2, 6.4], [1, 6.4]], corners: true },
};

// A random closed curve for the 10 × 7 box: m points at increasing angles around the centre, each at a random distance;
// redrawn until the curve does not cross itself. `rnd` returns numbers in [0, 1) (injected for the tests).
export function randomCurve(rnd = Math.random, { corners = false } = {}) {
  for (let attempt = 0; attempt < 50; attempt++) {
    const m = 6 + Math.floor(rnd() * 9), start = rnd() * 2 * Math.PI, wild = rnd() < 0.5, ctrl = [];
    for (let k = 0; k < m; k++) { const a = start + ((k + 0.25 + 0.5 * rnd()) * 2 * Math.PI) / m, rr = wild ? 0.25 + 0.75 * rnd() : 0.6 + 0.4 * rnd(); ctrl.push([5 + 4.4 * rr * Math.cos(a), 3.5 + 3 * rr * Math.sin(a)]); }
    if (!selfCrossing(curve(ctrl, { corners, n: corners ? 40 : 24 }))) return ctrl;
  }
  return PRESETS.blob.ctrl.map((p) => [...p]);
}
// Index after which a point clicked near the curve should be inserted (the arc of control points i → i + 1 it is on).
export function insertionIndex(ctrl, p, { corners = false, n = 24 } = {}) {
  const pts = curve(ctrl, { corners, n: corners ? 40 : n }), per = corners ? 40 : n;
  let best = 0, bd = Infinity;
  pts.forEach((q, k) => { const d = Math.hypot(q[0] - p[0], q[1] - p[1]); if (d < bd) { bd = d; best = k; } });
  return { after: Math.floor(best / per), distance: bd };
}
