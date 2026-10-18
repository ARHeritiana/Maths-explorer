// Pure maths of the complex-number experiment: the map p -> z p (rotation by arg z and scaling by |z|) or p -> p + z, with
// z given by its modulus r and its argument theta (degrees). Points are [x, y] = x + iy. No DOM.
const clean = (x) => (Object.is(x, -0) || Math.abs(x) < 1e-12 ? 0 : x);
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

export const multiply = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]].map(clean);
export const zOf = (s) => [clean(s.r * Math.cos(rad(s.theta))), clean(s.r * Math.sin(rad(s.theta)))];
// The map of the experiment: "multiply" (rotate and scale) or "translate" (add).
export const mapOf = (mode, z) => (mode === "translate" ? (p) => [p[0] + z[0], p[1] + z[1]] : (p) => multiply(z, p));
// Argument in degrees in ]-180, 180], or null for the origin.
export const arg = (p) => (Math.hypot(p[0], p[1]) < 1e-12 ? null : clean(deg(Math.atan2(p[1], p[0]))));

// The figure that is moved: a small house away from the origin, so that rotation and scaling about 0 are visible.
export const HOUSE = [[1.5, -1.5], [2.5, -1.5], [2.5, -0.5], [2, 0.1], [1.5, -0.5], [1.5, -1.5]];

export function model(s) {
  const z = zOf(s), t = [s.tx, s.ty], f = mapOf(s.mode, z), w = f(t);
  return {
    z, t, w, f,
    modZ: s.r, argZ: s.r > 0 ? clean(s.theta) : null,
    modT: Math.hypot(...t), argT: arg(t),
    modW: Math.hypot(...w), argW: arg(w),
    house: HOUSE.map(f),
  };
}

export const quantities = {
  modZ: (s) => model(s).modZ,
  modW: (s) => model(s).modW,
  reW: (s) => model(s).w[0],
  imW: (s) => model(s).w[1],
};
export const quantity = (name, s) => quantities[name](s);
