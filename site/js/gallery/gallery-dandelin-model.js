// Dandelin's spheres (issue #31): a plane cuts a cone in an ellipse; the two spheres tangent to the cone and to the plane
// touch the plane at the foci. Pure geometry, no DOM. Cone: apex at the origin, axis z upwards, half-angle alpha
// (sqrt(x² + y²) = z tan alpha). Plane: through (0, 0, c), normal n = (0, sin beta, cos beta), so it is tilted by beta;
// it cuts a closed ellipse while beta < 90° − alpha. Angles in radians. Tested in tests/gallery-dandelin.test.mjs.

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k], len = (a) => Math.hypot(...a);

// Unit direction of the generator at angle theta around the axis.
export const generator = (alpha, theta) => [Math.sin(alpha) * Math.cos(theta), Math.sin(alpha) * Math.sin(theta), Math.cos(alpha)];
export const isEllipse = (alpha, beta) => beta >= 0 && beta < Math.PI / 2 - alpha;

export function setup({ alpha, beta, c = 1 }) {
  const n = [0, Math.sin(beta), Math.cos(beta)], P0 = [0, 0, c];
  // spheres centred on the axis at height z: radius z sin(alpha) (tangent to the cone); tangent to the plane when
  // |cos(beta) (z − c)| = z sin(alpha): the small sphere below the plane and the large one above
  const zLow = (c * Math.cos(beta)) / (Math.cos(beta) + Math.sin(alpha)), zHigh = (c * Math.cos(beta)) / (Math.cos(beta) - Math.sin(alpha));
  const sphere = (z) => { const C = [0, 0, z], r = z * Math.sin(alpha), F = sub(C, mul(n, dot(n, sub(C, P0)))); return { C, r, F, t: z * Math.cos(alpha) }; };
  return { alpha, beta, c, n, P0, low: sphere(zLow), high: sphere(zHigh) };
}

// The point of the ellipse on the generator at angle theta: t g with n · (t g − P0) = 0.
export function ellipsePoint(S, theta) { const g = generator(S.alpha, theta), t = dot(S.n, S.P0) / dot(S.n, g); return { P: mul(g, t), t, g }; }
export const ellipse = (S, k = 120) => Array.from({ length: k }, (_, i) => ellipsePoint(S, (2 * Math.PI * i) / k).P);

// Facts at the point of angle theta: distances to both foci, the points T1, T2 where its generator meets the two circles
// of contact (at distances t of the spheres from the apex), and the constant T1T2.
export function facts(S, theta) {
  const { P, t, g } = ellipsePoint(S, theta), d1 = len(sub(P, S.low.F)), d2 = len(sub(P, S.high.F));
  return { P, d1, d2, sum: d1 + d2, T1: mul(g, S.low.t), T2: mul(g, S.high.t), PT1: Math.abs(t - S.low.t), PT2: Math.abs(S.high.t - t), T1T2: S.high.t - S.low.t };
}
// Length of the major axis 2a, from the two ends of the ellipse (theta = ±90°, in the plane of symmetry x = 0).
export function majorAxis(S) { const a = ellipsePoint(S, Math.PI / 2).P, b = ellipsePoint(S, -Math.PI / 2).P; return len(sub(a, b)); }
export const point = { dot, sub, add, mul, len };
