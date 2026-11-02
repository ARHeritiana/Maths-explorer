// Small LaTeX and set helpers shared by the Seconde generators and problems (templates-seconde-2.js, -3.js,
// problems-seconde.js): points, column vectors, finite sets, linear forms, affine expressions with fractions,
// unions of intervals with exact endpoints (each endpoint keeps its TeX and its value).
import { F, val, fracTex, numTex, roundTex, decimals, gcd } from './engine.js';

export const pt = (x, y) => `(${x}\\,;\\,${y})`;
export const vc = (x, y) => `\\begin{pmatrix}${x}\\\\${y}\\end{pmatrix}`;
export const setTex = (l) => (l.length ? `\\{${l.join('\\,;\\,')}\\}` : '\\varnothing');
// a signed number written inside a product: parT('-3') = '(-3)'
export const parT = (s) => (String(s).startsWith('-') ? `(${s})` : `${s}`);

// linear form from [[k, 'x'], [k, 'y'], [k, '']]: lin([[2,'x'],[-1,'y'],[5,'']]) = '2x-y+5'
export function lin(terms) {
  let s = '';
  for (const [k, v] of terms) {
    if (k === 0) continue;
    const abs = Math.abs(k), body = (v && abs === 1 ? '' : `${abs}`) + v;
    s += (k < 0 ? '-' : s ? '+' : '') + body;
  }
  return s || '0';
}
// m x + p with exact fractions m, p
export function affTex(m, p, v = 'x') {
  let s = '';
  if (m.n !== 0) { const n = Math.abs(m.n); s = (m.n < 0 ? '-' : '') + (m.d === 1 ? (n === 1 ? '' : `${n}`) : `\\dfrac{${n}}{${m.d}}`) + v; }
  if (p.n !== 0) s += (p.n < 0 ? '-' : s ? '+' : '') + fracTex(F(Math.abs(p.n), p.d));
  return s || '0';
}
// ax+by+c=0 divided by the gcd of its coefficients, first non-zero coefficient positive
export function normLine(a, b, c) {
  const g = gcd(gcd(a, b), c) || 1, s = a < 0 || (a === 0 && b < 0) ? -1 : 1;
  return [(s * a) / g, (s * b) / g, (s * c) / g];
}
// exact value when it has at most k decimals, else a rounded value: '=7{,}5' or '\approx 7{,}33'
export function dec(f, k = 2) {
  const d = decimals(f);
  return d >= 0 && d <= k ? `=${numTex(f)}` : `\\approx ${roundTex(val(f), k)}`;
}

// intervals: {lo, hi, lc, hc}; lo / hi are endpoints {t, v} or null for an infinite bound
export const E = (f) => (typeof f === 'number' ? { t: `${f}`, v: f } : { t: fracTex(f), v: val(f) });
export const Einf = null;
export function ivTex(list) {
  if (!list.length) return '\\varnothing';
  if (list.length === 1 && !list[0].lo && !list[0].hi) return '\\mathbb{R}';
  return list.map((i) => `${i.lo && i.lc ? '[' : ']'}${i.lo ? i.lo.t : '-\\infty'}\\,;\\,${i.hi ? i.hi.t : '+\\infty'}${i.hi && i.hc ? ']' : '['}`).join('\\cup ');
}
export const ivHas = (list, x) => list.some((i) => (!i.lo || x > i.lo.v || (i.lc && x === i.lo.v)) && (!i.hi || x < i.hi.v || (i.hc && x === i.hi.v)));
