// Pure maths of arithmetic and geometric sequences. State: {mode, u0, r, q, n}; n is the last index shown.
import { sequence } from "../../math.js";
export const isGeom = (s) => s.mode === "geom";
export const step = (s) => (isGeom(s) ? s.q : s.r);
export const term = (s, k) => (isGeom(s) ? s.u0 * s.q ** k : s.u0 + s.r * k);
export const terms = (s, count) => sequence(s.u0, step(s), count, isGeom(s));
export function model(s) {
  const list = terms(s, s.n + 1);
  return { ...s, terms: list, last: list[s.n], total: list.reduce((x, y) => x + y, 0) };
}
export const quantities = {
  term: (s) => term(s, s.n),
  u4: (s) => term(s, 4),
  u5: (s) => term(s, 5),
  sum: (s) => model(s).total,
};
export const quantity = (name, s) => quantities[name](s);
