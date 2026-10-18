// Pure maths of the vectors experiment: u = (ux, uy), v = (vx, vy), the determinant as the signed area of the
// parallelogram (O, u, u + v, v), the dot product and collinearity. No DOM.
const clean = (x) => (Object.is(x, -0) || Math.abs(x) < 1e-12 ? 0 : x);

export function model(s) {
  const { ux, uy, vx, vy } = s;
  const det = clean(ux * vy - uy * vx), dot = clean(ux * vx + uy * vy);
  return {
    u: [ux, uy], v: [vx, vy], sum: [ux + vx, uy + vy],
    polygon: [[0, 0], [ux, uy], [ux + vx, uy + vy], [vx, vy]],
    det, area: Math.abs(det), dot,
    normU: Math.hypot(ux, uy), normV: Math.hypot(vx, vy),
    // the zero vector is collinear with every vector
    collinear: det === 0,
    orientation: det > 0 ? 1 : det < 0 ? -1 : 0,
  };
}

export const quantities = {
  det: (s) => model(s).det,
  area: (s) => model(s).area,
  dot: (s) => model(s).dot,
};
export const quantity = (name, s) => quantities[name](s);
