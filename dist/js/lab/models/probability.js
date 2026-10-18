// Pure maths of the binomial experiment: B(n, p) probabilities and a seeded simulation. No DOM, no Math.random.
// The simulation is a function of (seed, n, p, runs): the first N experiments of a series are the same whatever the
// button presses that led to N, and a series with another p reuses the same uniform draws (success when draw < p).
import { binomial } from "../../math.js";

export const MAX_RUNS = 5000;
export const SHOWN_ROWS = 6;

// mulberry32: a small seedable generator with a 32-bit state; returns uniform numbers in [0, 1).
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let memo = { key: "", value: null };
// `runs` experiments of n trials each. Returns the counts of successes (index k = experiments with k successes) and the
// last SHOWN_ROWS experiments as rows of 0 / 1 (for the tray).
export function simulate(seed, n, p, runs) {
  const key = `${seed}|${n}|${p}|${runs}`;
  if (memo.key === key) return memo.value;
  const next = rng(seed), counts = Array(n + 1).fill(0), rows = [];
  for (let i = 0; i < runs; i++) {
    const row = i >= runs - SHOWN_ROWS ? [] : null;
    let k = 0;
    for (let j = 0; j < n; j++) { const hit = next() < p ? 1 : 0; k += hit; row?.push(hit); }
    counts[k]++;
    if (row) rows.push(row);
  }
  memo = { key, value: { counts, rows } };
  return memo.value;
}

const argmax = (a) => a.reduce((best, v, i) => (v > a[best] ? i : best), 0);

// Everything derived from the state {n, p, runs, seed}.
export function model(s) {
  const { n, p, runs, seed } = s;
  const probs = binomial(n, p), { counts, rows } = simulate(seed, n, p, runs);
  const freq = counts.map((c) => (runs ? c / runs : 0));
  return {
    n, p, runs, probs, counts, freq, rows,
    mean: n * p,
    variance: n * p * (1 - p),
    sd: Math.sqrt(n * p * (1 - p)),
    mode: argmax(probs),
    observedMean: runs ? counts.reduce((sum, c, k) => sum + k * c, 0) / runs : null,
    observedMode: runs ? argmax(counts) : null,
    gap: runs ? Math.max(...freq.map((f, k) => Math.abs(f - probs[k]))) : null,
  };
}

// Named numbers a check mission may ask for; the test recomputes each one by another route.
export const quantities = {
  mean: (s) => model(s).mean,
  sd: (s) => model(s).sd,
  mode: (s) => model(s).mode,
  observedMode: (s) => model(s).observedMode,
};
export const quantity = (name, s) => quantities[name](s);
