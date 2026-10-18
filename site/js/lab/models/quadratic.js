// Pure maths of the parabola workshop: f(x) = ax^2 + bx + c = a(x - alpha)^2 + beta. No DOM.
import { quadratic } from "../../math.js";

const clean = (x) => (Object.is(x, -0) || Math.abs(x) < 1e-12 ? 0 : x);

// Everything derived from the state {a, b, c}.
export function model(s) {
  const { a, b, c } = s;
  const q = quadratic(a, b, c);
  return {
    ...q,
    a, b, c,
    f: (x) => a * x * x + b * x + c,
    alpha: q.vertex ? clean(q.vertex[0]) : null,
    beta: q.vertex ? clean(q.vertex[1]) : null,
    rootCount: q.kind === "quadratic" ? q.roots.length : q.kind === "linear" ? 1 : q.allReal ? Infinity : 0,
  };
}

// Coefficients b and c of the parabola with leading coefficient a and vertex (alpha, beta).
export function fromVertex(a, alpha, beta) {
  return { b: clean(-2 * a * alpha), c: clean(a * alpha * alpha + beta) };
}

// Named numbers a check mission may ask for; the test recomputes each one by another route.
export const quantities = {
  rootCount: (s) => model(s).rootCount,
  alpha: (s) => model(s).alpha,
  beta: (s) => model(s).beta,
  delta: (s) => model(s).discriminant,
};
export const quantity = (name, s) => quantities[name](s);
