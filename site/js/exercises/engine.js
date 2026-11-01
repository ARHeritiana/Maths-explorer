// Exercise engine: seeded randomness, exact fractions and LaTeX formatting shared by every template of the bank.
// Pure module (no DOM). A statement or an answer is a French string whose maths sits between \( \) or \[ \].

export function hashSeed(s) {
  let h = 2166136261;
  for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// mulberry32; `int` is inclusive on both ends.
export function rng(seed) {
  let a = (typeof seed === 'number' ? seed : hashSeed(seed)) >>> 0;
  const next = () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const r = {
    next,
    int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
    pick: (list) => list[Math.floor(next() * list.length)],
    nz: (lo, hi) => { let v = 0; while (v === 0) v = r.int(lo, hi); return v; },
    sign: () => (next() < 0.5 ? -1 : 1),
    shuffle: (list) => { const l = [...list]; for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; } return l; },
  };
  return r;
}

// ---- exact fractions (small integers only) ----
export const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; };
export const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
export const F = (n, d = 1) => {
  if (d === 0) throw new Error('zero denominator');
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d) || 1;
  return { n: n / g, d: d / g };
};
export const add = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
export const sub = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d);
export const mul = (a, b) => F(a.n * b.n, a.d * b.d);
export const div = (a, b) => F(a.n * b.d, a.d * b.n);
export const neg = (a) => F(-a.n, a.d);
export const eq = (a, b) => a.n === b.n && a.d === b.d;
export const val = (a) => a.n / a.d;
export const pow = (a, k) => { let out = F(1); for (let i = 0; i < k; i++) out = mul(out, a); return out; };
export const sum = (list) => list.reduce((acc, x) => add(acc, x), F(0));

// ---- LaTeX helpers ----
export const M = (s) => '\\(' + s + '\\)';
export const D = (s) => '\\[' + s + '\\]';
export const R = '\\mathbb{R}';

export const fracTex = (f) => (f.d === 1 ? `${f.n}` : `${f.n < 0 ? '-' : ''}\\dfrac{${Math.abs(f.n)}}{${f.d}}`);

// decimal digits of a fraction when it terminates, else -1
export function decimals(f) {
  let d = f.d, a = 0, b = 0;
  while (d % 2 === 0) { d /= 2; a++; }
  while (d % 5 === 0) { d /= 5; b++; }
  return d === 1 ? Math.max(a, b) : -1;
}
export const comma = (s) => String(s).replace('.', '{,}');
// exact decimal writing of a terminating fraction (decimal comma), the fraction itself otherwise
export function numTex(f) {
  const k = decimals(f);
  if (k < 0) return fracTex(f);
  if (k === 0) return `${f.n}`;
  return comma((f.n / f.d).toFixed(k));
}
// rounded value, decimal comma, no "-0"
export function roundTex(x, k) {
  const s = x.toFixed(k);
  return comma(Number(s) === 0 ? (0).toFixed(k) : s);
}

// polynomial from descending integer coefficients: polyTex([2,-3,0,5]) = "2x^{3}-3x^{2}+5"
export function polyTex(c, v = 'x') {
  const n = c.length - 1;
  let s = '';
  c.forEach((a, i) => {
    const p = n - i;
    if (a === 0) return;
    const abs = Math.abs(a);
    const body = p === 0 ? `${abs}` : (abs === 1 ? '' : `${abs}`) + (p === 1 ? v : `${v}^{${p}}`);
    s += (a < 0 ? '-' : (s === '' ? '' : '+')) + body;
  });
  return s || '0';
}
export const evalPoly = (c, x) => c.reduce((acc, a) => acc * x + a, 0);
export const mulPoly = (p, q) => {
  const out = Array(p.length + q.length - 1).fill(0);
  p.forEach((a, i) => q.forEach((b, j) => { out[i + j] += a * b; }));
  return out;
};
// writes a signed number as a term to add: sgn(3) = "+3", sgn(-3) = "-3"
export const sgn = (n) => (n < 0 ? `-${-n}` : `+${n}`);
// a number inside a product or a power
export const par = (n) => (n < 0 ? `(${n})` : `${n}`);

// k^2 m simplification: sqrtTex(12) = "2\sqrt{3}", sqrtTex(9) = "3"
export function sqrtParts(n) {
  let k = 1, m = n;
  for (let q = 2; q * q <= m; q++) while (m % (q * q) === 0) { m /= q * q; k *= q; }
  return [k, m];
}
export function sqrtTex(n) {
  const [k, m] = sqrtParts(n);
  return m === 1 ? `${k}` : (k === 1 ? '' : `${k}`) + `\\sqrt{${m}}`;
}

export const isPrime = (n) => { if (n < 2) return false; for (let q = 2; q * q <= n; q++) if (n % q === 0) return false; return true; };
export const powMod = (a, k, n) => { let out = 1, b = ((a % n) + n) % n; for (let i = 0; i < k; i++) out = (out * b) % n; return out; };
export const binom = (n, k) => { if (k < 0 || k > n) return 0; let out = 1; for (let i = 1; i <= k; i++) out = (out * (n - k + i)) / i; return Math.round(out); };

// an interval written in French notation
export const interval = (lo, hi, lc = true, hc = true) => `${lc ? '[' : ']'}${lo}\\,;\\,${hi}${hc ? ']' : '['}`;

// Truth of a claim checked at several points: ok(f, g) compares two functions on integers from -5 to 5
export const sameOnGrid = (f, g, lo = -5, hi = 5) => { for (let x = lo; x <= hi; x++) if (Math.abs(f(x) - g(x)) > 1e-9) return false; return true; };
