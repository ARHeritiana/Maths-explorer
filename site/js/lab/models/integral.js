// Pure maths of Riemann sums for f(x) = x^2 on [a, b]. The sum uses n equal rectangles.
export const f = (x) => x * x;
export const antiderivative = (x) => (x * x * x) / 3;
export const exact = (a, b) => antiderivative(b) - antiderivative(a);
const OFFSET = { left: 0, right: 1, mid: 0.5 };
export function sum(a, b, n, method) {
  if (!(n >= 1) || !Number.isInteger(n) || !(method in OFFSET) || !(b > a)) throw new RangeError("Invalid rectangle configuration");
  const w = (b - a) / n;
  let total = 0;
  for (let i = 0; i < n; i++) total += f(a + (i + OFFSET[method]) * w) * w;
  return total;
}
// Rectangles as {x, w, h} for drawing.
export function rectangles(a, b, n, method) {
  const w = (b - a) / n;
  return Array.from({ length: n }, (_, i) => ({ x: a + i * w, w, h: f(a + (i + OFFSET[method]) * w) }));
}
export function model(s) {
  const value = sum(s.a, s.b, s.n, s.method), area = exact(s.a, s.b);
  return { ...s, sum: value, exact: area, error: value - area };
}
export const quantities = {
  exact: (s) => exact(s.a, s.b),
  sum: (s) => sum(s.a, s.b, s.n, s.method),
};
export const quantity = (name, s) => quantities[name](s);
