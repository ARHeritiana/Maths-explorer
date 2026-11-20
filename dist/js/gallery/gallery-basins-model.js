// Iteration in the complex plane (issue #36), pure: the Multibrot sets (z → z^d + c, the Mandelbrot set for d = 2) and the
// basins of Newton's method for a few polynomials. Complex numbers are pairs [re, im]. Tested in tests/gallery-basins.test.mjs.
export const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
export const cdiv = (a, b) => { const q = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / q, (a[1] * b[0] - a[0] * b[1]) / q]; };
export const cabs = (a) => Math.hypot(a[0], a[1]);
export const cpow = (z, d) => { let r = [1, 0]; for (let k = 0; k < d; k++) r = cmul(r, z); return r; };

// Multibrot: the number of steps before |z| exceeds max(2, |c|) (from then on |z| grows without bound, see the test),
// or null when it has not escaped after N steps: that does not prove that c is in the set.
export function multibrotEscape(c, d, N) {
  const R = Math.max(2, cabs(c)); let z = [0, 0];
  for (let k = 0; k < N; k++) { z = cpow(z, d); z = [z[0] + c[0], z[1] + c[1]]; if (cabs(z) > R) return k + 1; }
  return null;
}
// The set is unchanged by a turn of 2π/(d − 1) about 0: if c' = ω c with ω^(d−1) = 1, every orbit turns with it.
export const symmetryOrder = (d) => d - 1;
// Every point of the set lies in the disc of radius 2^(1/(d−1)).
export const boundRadius = (d) => 2 ** (1 / (d - 1));

// Polynomials of the Newton exhibit: coefficients from the constant term up, and their roots (exact where known).
const unity = (n) => Array.from({ length: n }, (_, k) => [Math.cos((2 * Math.PI * k) / n), Math.sin((2 * Math.PI * k) / n)]);
export const POLYS = {
  'z3-1': { coef: [[-1, 0], [0, 0], [0, 0], [1, 0]], roots: unity(3), names: ['z³ − 1', 'z³ − 1'] },
  'z4-1': { coef: [[-1, 0], [0, 0], [0, 0], [0, 0], [1, 0]], roots: unity(4), names: ['z⁴ − 1', 'z⁴ − 1'] },
  'z5-1': { coef: [[-1, 0], [0, 0], [0, 0], [0, 0], [0, 0], [1, 0]], roots: unity(5), names: ['z⁵ − 1', 'z⁵ − 1'] },
  'z3-2z+2': { coef: [[2, 0], [-2, 0], [0, 0], [1, 0]], roots: null, names: ['z³ − 2z + 2', 'z³ − 2z + 2'], cycle: [[0, 0], [1, 0]] },
};
export function evalPoly(coef, z) { let p = [0, 0], dp = [0, 0]; for (let k = coef.length - 1; k >= 0; k--) { dp = [cmul(dp, z)[0] + p[0], cmul(dp, z)[1] + p[1]]; p = cmul(p, z); p = [p[0] + coef[k][0], p[1] + coef[k][1]]; } return { p, dp }; }
// Roots by the Durand-Kerner iteration (used for z³ − 2z + 2, whose roots have no simple closed form worth printing).
export function rootsOf(coef) {
  const n = coef.length - 1, lead = coef[n], monic = coef.map((c) => cdiv(c, lead));
  let r = Array.from({ length: n }, (_, k) => cpow([0.4, 0.9], k + 1));
  for (let it = 0; it < 500; it++) r = r.map((x, i) => { let q = [1, 0]; r.forEach((y, j) => { if (j !== i) q = cmul(q, [x[0] - y[0], x[1] - y[1]]); }); const v = evalPoly(monic, x).p, s = cdiv(v, q); return [x[0] - s[0], x[1] - s[1]]; });
  return r;
}
export const rootsFor = (id) => POLYS[id].roots || (POLYS[id].roots = rootsOf(POLYS[id].coef));
export const newtonStep = (coef, z) => { const { p, dp } = evalPoly(coef, z); const s = cdiv(p, dp); return [z[0] - s[0], z[1] - s[1]]; };
// Newton's method from z0: {root (index, or -1 when it did not settle on a root), steps, path}.
export function newton(id, z0, N = 60, tol = 1e-9, keepPath = false) {
  const coef = POLYS[id].coef, roots = rootsFor(id); let z = z0; const path = keepPath ? [z] : null;
  for (let k = 0; k < N; k++) {
    const { dp } = evalPoly(coef, z); if (cabs(dp) < 1e-14) return { root: -1, steps: k, path };
    z = newtonStep(coef, z); if (keepPath) path.push(z);
    for (let i = 0; i < roots.length; i++) if (cabs([z[0] - roots[i][0], z[1] - roots[i][1]]) < tol) return { root: i, steps: k + 1, path };
  }
  return { root: -1, steps: N, path };
}
