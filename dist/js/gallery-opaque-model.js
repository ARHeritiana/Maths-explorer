// Pure mathematics of the opaque square exhibit (no DOM): a barrier is a list of segments; it is opaque for the unit
// square when every line meeting the square meets a segment. Lines of one direction are blocked exactly where the
// projections of the segments cover the projection of the square. Checked in tests/gallery-puzzles.test.mjs.

const SQUARE = [[0, 0], [1, 0], [1, 1], [0, 1]];
export const length = (segs) => segs.reduce((s, [a, b]) => s + Math.hypot(b[0] - a[0], b[1] - a[1]), 0);

// Lines of direction θ are the level sets of n·p with n = (−sin θ, cos θ). Returns the parts of the square's range
// that no segment covers (open gaps longer than eps): the lines through them miss the barrier.
export function gaps(segs, theta, eps = 1e-9) {
  const nx = -Math.sin(theta), ny = Math.cos(theta), proj = ([x, y]) => x * nx + y * ny;
  const sq = SQUARE.map(proj), lo = Math.min(...sq), hi = Math.max(...sq);
  const cover = segs.map(([a, b]) => { const u = proj(a), v = proj(b); return [Math.min(u, v), Math.max(u, v)]; }).sort((p, q) => p[0] - q[0]);
  const out = []; let reach = lo;
  for (const [u, v] of cover) { if (u > reach + eps && reach < hi) out.push([reach, Math.min(u, hi)]); reach = Math.max(reach, v); }
  if (reach < hi - eps) out.push([reach, hi]);
  return out.filter(([u, v]) => v - u > eps);
}
// Opaque when no direction lets light through. Directions are sampled finely, plus every direction through two
// endpoints or corners, where a gap can open or close.
export function check(segs, samples = 1440) {
  const pts = [...SQUARE, ...segs.flat()], dirs = [];
  for (let k = 0; k < samples; k++) dirs.push((Math.PI * k) / samples);
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) { const a = Math.atan2(pts[j][1] - pts[i][1], pts[j][0] - pts[i][0]); for (const d of [-1e-7, 0, 1e-7]) dirs.push((((a + d) % Math.PI) + Math.PI) % Math.PI); }
  let worst = null;
  for (const th of dirs) { for (const [u, v] of gaps(segs, th)) if (!worst || v - u > worst.width) worst = { theta: th, offset: (u + v) / 2, width: v - u }; }
  return { opaque: !worst || worst.width < 1e-6, worst };
}
// The line of direction θ at offset c, as a segment of half-length t around its point nearest the origin (for drawing).
export function lineAt(theta, c, t = 3) {
  const dx = Math.cos(theta), dy = Math.sin(theta), p = [-dy * c, dx * c];
  return [[p[0] - dx * t, p[1] - dy * t], [p[0] + dx * t, p[1] + dy * t]];
}

// Barriers to start from. The last is the shortest known: half a diagonal and the Steiner tree of the other three
// corners (the Fermat point F = (f, f) with f = (3 − √3)/6 sees the three corners at 120°); length √2 + √6/2.
const f = (3 - Math.sqrt(3)) / 6, e = 1 / (2 * Math.sqrt(3));
export const BARRIERS = {
  sides: { segs: [[[0, 0], [1, 0]], [[1, 0], [1, 1]], [[1, 1], [0, 1]]], exact: "3" },
  diagonals: { segs: [[[0, 0], [1, 1]], [[1, 0], [0, 1]]], exact: "2√2" },
  steiner: { segs: [[[0, 0], [e, 0.5]], [[0, 1], [e, 0.5]], [[e, 0.5], [1 - e, 0.5]], [[1 - e, 0.5], [1, 0]], [[1 - e, 0.5], [1, 1]]], exact: "1 + √3" },
  best: { segs: [[[f, f], [0, 0]], [[f, f], [1, 0]], [[f, f], [0, 1]], [[1, 1], [0.5, 0.5]]], exact: "√2 + √6/2" },
  empty: { segs: [], exact: "0" },
};
