// Pure maths of the experiment `bertrand`: a "random chord" of the unit circle, chosen by three methods. The chord is longer
// than the side √3 of the inscribed equilateral triangle with probability 1/3 (two random endpoints), 1/2 (random point of a
// random radius) or 1/4 (random midpoint in the disc). Seeded simulation (rng of probability.js). No DOM.
import { rng } from "./probability.js";

export const MAX_RUNS = 5000;
export const SHOWN = 80;
export const METHODS = ["ends", "radius", "midpoint"];
export const THEORY = { ends: 1 / 3, radius: 1 / 2, midpoint: 1 / 4 };
const SIDE = Math.sqrt(3);

// One chord from three uniform draws u, v, w in [0, 1): endpoints [a, b].
export function chord(method, u, v, w) {
  if (method === "ends") {
    const t1 = 2 * Math.PI * u, t2 = 2 * Math.PI * v;
    return [[Math.cos(t1), Math.sin(t1)], [Math.cos(t2), Math.sin(t2)]];
  }
  // the chord perpendicular to the direction θ at distance d from the centre
  const th = 2 * Math.PI * u;
  const d = method === "radius" ? v : Math.sqrt(v);   // midpoint uniform in the disc: P(distance ≤ r) = r²
  const h = Math.sqrt(Math.max(0, 1 - d * d)), cx = d * Math.cos(th), cy = d * Math.sin(th), ex = -Math.sin(th), ey = Math.cos(th);
  return [[cx - h * ex, cy - h * ey], [cx + h * ex, cy + h * ey]];
}

let memo = { key: "", value: null };
export function simulate(seed, method, runs) {
  const key = `${seed}|${method}|${runs}`;
  if (memo.key === key) return memo.value;
  const next = rng(seed), shown = [];
  let long = 0;
  for (let i = 0; i < runs; i++) {
    const [a, b] = chord(method, next(), next(), next());
    const hit = Math.hypot(b[0] - a[0], b[1] - a[1]) > SIDE ? 1 : 0;
    long += hit;
    if (i >= runs - SHOWN) shown.push({ a, b, hit });
  }
  memo = { key, value: { long, shown } };
  return memo.value;
}

export function model(s) {
  const { method, runs, seed } = s, { long, shown } = simulate(seed, method, runs);
  return { method, runs, long, shown, freq: runs ? long / runs : null, prob: THEORY[method] };
}

export const quantities = {
  prob: (s) => model(s).prob,
};
export const quantity = (name, s) => quantities[name](s);
