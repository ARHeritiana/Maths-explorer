// Pure maths of the experiment `buffon`: needles of length L dropped on a floor of parallel lines one unit apart (d = 1, L ≤ 1).
// A needle crosses a line with probability 2L/(πd). Seeded simulation (rng of probability.js): the first N drops of a series
// are the same whatever the button presses that led to N, and changing L reuses the same centres and angles. No DOM.
import { rng } from "./probability.js";

export const MAX_RUNS = 5000;
export const SHOWN = 120;          // needles drawn on the floor (the last ones)
export const FLOOR = [8, 5];       // width and height of the floor drawn, lines at y = 0, 1, …, 5

let memo = { key: "", value: null };
// Centres (x, y) uniform on the floor, angles uniform in [0, π).
export function simulate(seed, L, runs) {
  const key = `${seed}|${L}|${runs}`;
  if (memo.key === key) return memo.value;
  const next = rng(seed), shown = [];
  let hits = 0;
  for (let i = 0; i < runs; i++) {
    const x = next() * FLOOR[0], y = next() * FLOOR[1], t = next() * Math.PI;
    const dy = (L / 2) * Math.sin(t), dx = (L / 2) * Math.cos(t);
    const hit = Math.floor(y - dy) !== Math.floor(y + dy) ? 1 : 0;
    hits += hit;
    if (i >= runs - SHOWN) shown.push({ a: [x - dx, y - dy], b: [x + dx, y + dy], hit });
  }
  memo = { key, value: { hits, shown } };
  return memo.value;
}

export function model(s) {
  const { L, runs, seed } = s, { hits, shown } = simulate(seed, L, runs);
  const freq = runs ? hits / runs : null;
  return {
    L, runs, hits, shown, freq,
    prob: (2 * L) / Math.PI,
    // estimate of π from the frequency: π ≈ 2L / f
    piEstimate: hits ? (2 * L * runs) / hits : null,
  };
}

export const quantities = {
  prob: (s) => model(s).prob,
};
export const quantity = (name, s) => quantities[name](s);
