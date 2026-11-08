// Shared helpers of the second STMG bank (templates-stmg-2..4.js, problems-stmg.js): money and percent writing, rounding that never sits on a
// knife edge, geometric and arithmetic sequences computed by loops (for the independent checks), exact binomial probabilities. Pure functions.
import { F, M, val, numTex, roundTex, binom } from './engine.js';

export const euro = (x) => `${Number.isInteger(x) ? x : roundTex(x, 2)}\\ \\text{€}`;
export const pctN = (t) => `${t > 0 ? '+' : '-'}${numTex(F(Math.round(Math.abs(t) * 100), 100))}\\,\\%`;
export const cmOf = (t) => F(100 + t, 100);
// x rounded to k decimals, or null when x*10^k is too close to a half-integer (the rounding would be ambiguous)
export const safeRound = (x, k) => { const y = x * 10 ** k; return Math.abs(y - Math.floor(y) - 0.5) < 1e-6 ? null : roundTex(x, k); };
export const arith = (u0, d, n) => { let u = u0; for (let i = 0; i < n; i++) u += d; return u; };
export const geom = (u0, q, n) => { let u = u0; for (let i = 0; i < n; i++) u *= q; return u; };
export const firstAbove = (u0, step, target, max = 400) => { let u = u0, n = 0; while (u <= target && n < max) { u = step(u); n++; } return n; };
export const firstBelow = (u0, step, target, max = 400) => { let u = u0, n = 0; while (u >= target && n < max) { u = step(u); n++; } return n; };
// P(X = k) for X ~ B(n, p) with p a decimal, by the definition
export const binomP = (n, p, k) => binom(n, k) * p ** k * (1 - p) ** (n - k);
export const binomCdf = (n, p, k) => { let s = 0; for (let i = 0; i <= k; i++) s += binomP(n, p, i); return s; };
export const dc = (x) => String(x).replace('.', '{,}');
export { F, M, val };
