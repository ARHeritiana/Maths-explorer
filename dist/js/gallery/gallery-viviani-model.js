// Viviani's theorem (issue #33): in an equilateral triangle, the distances from any inside point to the three sides add
// up to the height. Pure: distances, the three small triangles' areas, the weighted sum that stays constant in any
// triangle (a·d1 + b·d2 + c·d3 = 2 × area), keeping a point inside, and an equilateral triangle moved by one vertex.
// Tested in tests/gallery-viviani.test.mjs.

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], cross = (u, v) => u[0] * v[1] - u[1] * v[0], len = (u) => Math.hypot(u[0], u[1]);
export const area = (A, B, C) => Math.abs(cross(sub(B, A), sub(C, A))) / 2;

// Distance from P to the line through U and V.
export const distToLine = (P, U, V) => Math.abs(cross(sub(V, U), sub(P, U))) / len(sub(V, U));

// The three sides (opposite A, B, C: BC, CA, AB), their lengths, the distances from P and the areas of PBC, PCA, PAB.
export function facts([A, B, C], P) {
  const sides = [[B, C], [C, A], [A, B]], L = sides.map(([U, V]) => len(sub(V, U))), d = sides.map(([U, V]) => distToLine(P, U, V));
  const parts = sides.map(([U, V]) => area(P, U, V)), S = area(A, B, C);
  return { L, d, sum: d[0] + d[1] + d[2], parts, area: S, heights: L.map((l) => (2 * S) / l), weighted: L[0] * d[0] + L[1] * d[1] + L[2] * d[2] };
}

// Foot of the perpendicular from P to the line UV (for drawing the three distances).
export function foot(P, U, V) { const u = sub(V, U), k = ((P[0] - U[0]) * u[0] + (P[1] - U[1]) * u[1]) / (u[0] ** 2 + u[1] ** 2); return [U[0] + k * u[0], U[1] + k * u[1]]; }

// Barycentric coordinates of P; the point is inside (or on the boundary) when all three are ≥ 0.
export function bary([A, B, C], P) { const S = cross(sub(B, A), sub(C, A)); return [cross(sub(B, P), sub(C, P)) / S, cross(sub(C, P), sub(A, P)) / S, cross(sub(A, P), sub(B, P)) / S]; }
export const inside = (T, P, eps = 1e-12) => bary(T, P).every((w) => w >= -eps);
// Bring P inside the triangle: clip its barycentric coordinates at 0 and rescale (a point of the triangle, near P).
export function clampInside(T, P) {
  let w = bary(T, P).map((x) => Math.max(0, x)); const s = w[0] + w[1] + w[2]; w = w.map((x) => x / s);
  return [w[0] * T[0][0] + w[1] * T[1][0] + w[2] * T[2][0], w[0] * T[0][1] + w[1] * T[1][1] + w[2] * T[2][1]];
}

// The equilateral triangle with centre G whose vertex number i is at V (dragging one vertex turns and resizes it).
export function equilateralFrom(G, V, i) {
  const r = sub(V, G), out = [];
  for (let k = 0; k < 3; k++) { const a = ((k - i) * 2 * Math.PI) / 3, c = Math.cos(a), s = Math.sin(a); out.push([G[0] + r[0] * c - r[1] * s, G[1] + r[0] * s + r[1] * c]); }
  return out;
}
export const centroid = (T) => [(T[0][0] + T[1][0] + T[2][0]) / 3, (T[0][1] + T[1][1] + T[2][1]) / 3];
// Is the triangle equilateral (sides equal to within a relative tolerance)?
export const isEquilateral = (T, tol = 1e-9) => { const { L } = facts(T, T[0]); return Math.max(...L) - Math.min(...L) <= tol * Math.max(...L); };
