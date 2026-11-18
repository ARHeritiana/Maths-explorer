// Morley's trisector theorem. Pure maths, no DOM. For a triangle ABC, the two trisectors adjacent to each side meet at a point;
// the three points form an equilateral triangle (Frank Morley, 1899).
const sub = (p, q) => [p[0] - q[0], p[1] - q[1]], dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const rot = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
export const area2 = (A, B, C) => (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]);
export const interiorAngle = (V, U, W) => { const a = sub(U, V), b = sub(W, V); return Math.abs(Math.atan2(a[0] * b[1] - a[1] * b[0], a[0] * b[0] + a[1] * b[1])); };
// Direction of the trisector at V that is nearest to the side VW (U is the other neighbour): the side direction turned a third of the angle toward U.
export function trisector(V, W, U) {
  const th = interiorAngle(V, U, W) / 3, d = sub(W, V), toU = sub(U, V), s = Math.sign(d[0] * toU[1] - d[1] * toU[0]) || 1;
  return rot(d, s * th);
}
function meet(P, d, Q, e) {
  const det = d[0] * e[1] - d[1] * e[0], w = sub(Q, P), t = (w[0] * e[1] - w[1] * e[0]) / det;
  return [P[0] + t * d[0], P[1] + t * d[1]];
}
// The Morley triangle D, E, F (D near BC, E near CA, F near AB) and the six trisectors used.
export function morley(A, B, C) {
  const tb = trisector(B, C, A), tc = trisector(C, B, A), tc2 = trisector(C, A, B), ta = trisector(A, C, B), ta2 = trisector(A, B, C), tb2 = trisector(B, A, C);
  const D = meet(B, tb, C, tc), E = meet(C, tc2, A, ta), F = meet(A, ta2, B, tb2);
  return {D, E, F, lines: [[B, D], [C, D], [C, E], [A, E], [A, F], [B, F]], sides: [dist(E, F), dist(F, D), dist(D, E)],
    angles: [interiorAngle(D, E, F), interiorAngle(E, F, D), interiorAngle(F, D, E)]};
}
