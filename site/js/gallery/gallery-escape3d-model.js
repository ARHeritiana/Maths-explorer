// Escape-time sets in space (issue #36), pure: the distance estimates used to draw them by ray marching (the same formulas
// as the shader of gallery-escape3d.js), and plain membership by iteration (no estimate) used by the tests to check them.
// None of these sets has an established dimension, and none is "the Mandelbrot set in 3D": there is no multiplication of
// 3D vectors behaving like that of complex numbers (Frobenius, 1878: R, C and the quaternions H are the only associative
// real division algebras), so each is a chosen formula. Tested in tests/gallery-escape3d.test.mjs.
export const SETS = {
  bulb: { names: ['Mandelbulb', 'Mandelbulb'], param: { min: 2, max: 12, step: 1, value: 8 } },          // power n
  box: { names: ['Mandelbox', 'Mandelbox'], param: { min: -2.5, max: 3, step: 0.05, value: -1.5 } },      // scale s
  julia: { names: ['Julia quaternionique (tranche)', 'Quaternion Julia (slice)'], param: { min: -0.6, max: 0.6, step: 0.01, value: 0 }, c: [-0.291, -0.399, 0.339, 0.437] },   // slice w
};
// Mandelbulb of power n (White and Nylander, 2009): in spherical coordinates, raise the radius to the power n and multiply
// both angles by n, then add the starting point.
function bulbStep(z, p, n) {
  const r = Math.hypot(z[0], z[1], z[2]); if (r === 0) return [p[0], p[1], p[2]];
  const th = Math.acos(Math.max(-1, Math.min(1, z[2] / r))) * n, ph = Math.atan2(z[1], z[0]) * n, rn = r ** n;
  return [rn * Math.sin(th) * Math.cos(ph) + p[0], rn * Math.sin(th) * Math.sin(ph) + p[1], rn * Math.cos(th) + p[2]];
}
export function bulbDE(p, n = 8, iters = 12) {
  let z = [p[0], p[1], p[2]], dr = 1, r = 0;
  for (let i = 0; i < iters; i++) { r = Math.hypot(z[0], z[1], z[2]); if (r > 2) break; dr = r ** (n - 1) * n * dr + 1; z = bulbStep(z, p, n); }
  r = Math.hypot(z[0], z[1], z[2]); return r < 1e-12 ? 0 : 0.5 * Math.log(r) * r / dr;
}
export function bulbInside(p, n = 8, iters = 40) { let z = [p[0], p[1], p[2]]; for (let i = 0; i < iters; i++) { z = bulbStep(z, p, n); if (Math.hypot(z[0], z[1], z[2]) > 2) return false; } return true; }
// Mandelbox of scale s (Lowe, 2010): fold the box [−1, 1]³, fold the sphere (radius 0.5 inside, 1 outside), scale, add.
const MIN_R2 = 0.25, FIX_R2 = 1;
function boxStep(z, p, s, dr) {
  let w = z.map((v) => (v > 1 ? 2 - v : v < -1 ? -2 - v : v)); const r2 = w[0] * w[0] + w[1] * w[1] + w[2] * w[2];
  const f = r2 < MIN_R2 ? FIX_R2 / MIN_R2 : r2 < FIX_R2 ? FIX_R2 / r2 : 1; w = w.map((v) => v * f * s + 0); dr = dr * f * Math.abs(s) + 1;
  return [[w[0] + p[0], w[1] + p[1], w[2] + p[2]], dr];
}
export function boxDE(p, s = -1.5, iters = 14) {
  let z = [p[0], p[1], p[2]], dr = 1;
  for (let i = 0; i < iters; i++) { [z, dr] = boxStep(z, p, s, dr); if (Math.hypot(...z) > 1e4) break; }
  return Math.hypot(...z) / Math.abs(dr);
}
export function boxInside(p, s = -1.5, iters = 40, R = 1e4) { let z = [p[0], p[1], p[2]], dr = 1; for (let i = 0; i < iters; i++) { [z, dr] = boxStep(z, p, s, dr); if (Math.hypot(...z) > R) return false; } return true; }
// Quaternion Julia set of q → q² + c: a set in four dimensions; the picture is its 3D slice at fourth coordinate w.
const qmul = (a, b) => [a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3], a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2], a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1], a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0]];
const qabs = (a) => Math.hypot(a[0], a[1], a[2], a[3]);
export function juliaDE(p, w = 0, c = SETS.julia.c, iters = 12) {
  let q = [p[0], p[1], p[2], w], dq = [1, 0, 0, 0];
  for (let i = 0; i < iters; i++) { dq = qmul(q, dq).map((v) => 2 * v); q = qmul(q, q).map((v, k) => v + c[k]); if (qabs(q) > 4) break; }
  const r = qabs(q); return r < 1e-12 ? 0 : 0.5 * r * Math.log(r) / qabs(dq);
}
export function juliaInside(p, w = 0, c = SETS.julia.c, iters = 40) { let q = [p[0], p[1], p[2], w]; for (let i = 0; i < iters; i++) { q = qmul(q, q).map((v, k) => v + c[k]); if (qabs(q) > 4) return false; } return true; }
export const DE = { bulb: (p, a) => bulbDE(p, a), box: (p, a) => boxDE(p, a), julia: (p, a) => juliaDE(p, a) };
export const INSIDE = { bulb: (p, a) => bulbInside(p, a), box: (p, a) => boxInside(p, a), julia: (p, a) => juliaInside(p, a) };
export { qmul };
