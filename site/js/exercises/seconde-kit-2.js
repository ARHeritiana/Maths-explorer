// Shared helpers of the second Seconde, STMG and Maths expertes banks (templates-seconde-4/5.js, templates-stmg-2..4.js,
// templates-expertes-2..5.js and their problems files): numeric four-choice questions, exact data helpers for statistics,
// small formatting functions. Pure functions, no DOM. Four-choice, true/false and find-the-error builders are those of premiere-kit.js.
import { F, M, val, fracTex, numTex, roundTex, par } from './engine.js';
import { opt, mcq } from './premiere-kit.js';

// Four-choice question on a value: good = [value, reason], bads = [[value, error], ...] (the first three distinct are kept),
// fmt(value) writes the option (maths between \( \)), truth(value) re-derives the correctness of a value independently.
export function qcmNum(r, stem, good, bads, fmt, truth) {
  // a candidate that happens to be correct for this draw is dropped, so that exactly one option passes `truth`
  return mcq(r, stem, opt(fmt(good[0]), good[1], { v: good[0] }), bads.filter(([v]) => !truth(v)).map(([v, why]) => opt(fmt(v), why, { v })), (o) => truth(o.v));
}
export const cap = (s) => s[0].toUpperCase() + s.slice(1);
export const nearly = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
// exact fraction as a percentage, decimal comma ("12{,}5\,\%")
export const pcF = (f) => `${numTex(F(f.n * 100, f.d))}\\,\\%`;
// value rounded without "-0" and with a decimal comma
export const rt = roundTex;
// sorted copy, median (numbers), mean
export const sorted = (l) => [...l].sort((a, b) => a - b);
export const medianOf = (l) => { const s = sorted(l), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
export const meanOf = (l) => l.reduce((s, x) => s + x, 0) / l.length;
export const varianceOf = (l) => { const m = meanOf(l); return l.reduce((s, x) => s + (x - m) ** 2, 0) / l.length; };
// quartile by the French definition: smallest value of the series such that at least p of the values are at most equal to it
export const quantileOf = (l, p) => { const s = sorted(l); return s[Math.ceil(p * s.length) - 1]; };
// list written "a ; b ; c"
export const semi = (l) => l.join('\\ ;\\ ');
// the French way of writing an exact fraction in a statement
export const fr = (n, d) => fracTex(F(n, d));
export const numFr = (x) => String(x).replace('.', '{,}');
export { F, val, par };
