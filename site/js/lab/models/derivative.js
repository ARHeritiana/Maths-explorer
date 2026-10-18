// Pure maths of the secant that tends to a tangent, for f(x) = x^2.
export const f = (x) => x * x;
export const slope = (x, h) => {
  if (!Number.isFinite(x) || !Number.isFinite(h) || h === 0) throw new RangeError("A secant needs a finite, nonzero increment");
  return (f(x + h) - f(x)) / h;
};
export const tangentSlope = (x) => 2 * x;
// Everything derived from the state {x, h}. The secant slope is computed as a quotient, not as the formula 2x + h.
export function model(s) {
  const m = slope(s.x, s.h);
  return { x: s.x, h: s.h, ya: f(s.x), yb: f(s.x + s.h), secant: m, tangent: tangentSlope(s.x), gap: m - tangentSlope(s.x) };
}
export const quantities = {
  secant: (s) => slope(s.x, s.h),
  tangent: (s) => tangentSlope(s.x),
};
export const quantity = (name, s) => quantities[name](s);
