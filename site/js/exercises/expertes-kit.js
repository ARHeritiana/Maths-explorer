// Shared helpers of the second Maths expertes bank (templates-expertes-2..5.js, problems-expertes.js): integer and rational complex numbers
// (writing and arithmetic), exact trigonometric values, matrices (writing, product, power, inverse of a 2x2, Gaussian elimination in exact
// fractions), number theory by BigInt (power modulo n, extended Euclid), small graphs (walks, degrees, colouring). Pure functions, no DOM.
import { F, add, sub, mul, div, val, eq, M, fracTex, par, gcd } from './engine.js';
import { exactCosSin, piTex } from './templates-premiere.js';

export { exactCosSin, piTex };
// ---- complex numbers as [re, im] (integers) or as pairs of exact fractions ----
export const cx = (a, b) => { if (a === 0 && b === 0) return '0'; const im = b === 0 ? '' : `${b < 0 ? '-' : a === 0 ? '' : '+'}${Math.abs(b) === 1 ? '' : Math.abs(b)}i`; return `${a === 0 ? '' : a}${im}`; };
export const cxF = (x, y) => { if (y.n === 0) return fracTex(x); const ay = F(Math.abs(y.n), y.d), body = (ay.n === 1 && ay.d === 1 ? '' : fracTex(ay)) + 'i'; return `${x.n === 0 ? '' : fracTex(x)}${y.n < 0 ? '-' : x.n === 0 ? '' : '+'}${body}`; };
export const cmul = ([a, b], [c, d]) => [a * c - b * d, a * d + b * c];
export const cadd = ([a, b], [c, d]) => [a + c, b + d];
export const csub = ([a, b], [c, d]) => [a - c, b - d];
export const conj = ([a, b]) => [a, -b];
export const abs2 = ([a, b]) => a * a + b * b;
export const cpow = (z, n) => { let out = [1, 0]; for (let i = 0; i < n; i++) out = cmul(out, z); return out; };
// quotient of two integer complex numbers as a pair of exact fractions
export const cdiv = (z, w) => { const n = abs2(w), [a, b] = cmul(z, conj(w)); return [F(a, n), F(b, n)]; };
export const ceq = (z, w) => z[0] === w[0] && z[1] === w[1];
export const cmulF = ([a, b], [c, d]) => [sub(mul(a, c), mul(b, d)), add(mul(a, d), mul(b, c))];
export const toF = (z) => [F(z[0]), F(z[1])];
// ---- matrices (arrays of rows) ----
export const mat = (m) => `\\begin{pmatrix}${m.map((row) => row.join('&')).join('\\\\')}\\end{pmatrix}`;
export const matF = (m) => mat(m.map((row) => row.map(fracTex)));
export const mmul = (A, B) => A.map((row) => B[0].map((_, j) => row.reduce((s, x, k) => s + x * B[k][j], 0)));
export const madd = (A, B) => A.map((row, i) => row.map((x, j) => x + B[i][j]));
export const mpow = (A, n) => { let out = A.map((row, i) => row.map((_, j) => (i === j ? 1 : 0))); for (let i = 0; i < n; i++) out = mmul(out, A); return out; };
export const det2 = ([[a, b], [c, d]]) => a * d - b * c;
export const mmulF = (A, B) => A.map((row) => B[0].map((_, j) => row.reduce((s, x, k) => add(s, mul(x, B[k][j])), F(0))));
export const mF = (A) => A.map((row) => row.map((x) => F(x)));
export const meq = (A, B) => A.length === B.length && A.every((row, i) => row.every((x, j) => x === B[i][j]));
export const meqF = (A, B) => A.every((row, i) => row.every((x, j) => eq(x, B[i][j])));
// solve A x = b in exact fractions (A square, regular), by Gaussian elimination
export function solveF(A, b) {
  const n = A.length, a = A.map((row, i) => [...row.map((x) => (typeof x === 'number' ? F(x) : x)), typeof b[i] === 'number' ? F(b[i]) : b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; while (p < n && a[p][c].n === 0) p++;
    if (p === n) return null;
    [a[c], a[p]] = [a[p], a[c]];
    const piv = a[c][c]; a[c] = a[c].map((x) => div(x, piv));
    for (let r = 0; r < n; r++) if (r !== c && a[r][c].n !== 0) { const f = a[r][c]; a[r] = a[r].map((x, j) => sub(x, mul(f, a[c][j]))); }
  }
  return a.map((row) => row[n]);
}
// ---- number theory ----
export const egcd = (a, b) => { if (b === 0) return [Math.abs(a), a < 0 ? -1 : 1, 0]; const [g, x, y] = egcd(b, a % b); return [g, y, x - Math.floor(a / b) * y]; };
export const modPow = (a, n, m) => { let out = 1n, b = BigInt(a) % BigInt(m), e = BigInt(n); const mm = BigInt(m); while (e > 0n) { if (e & 1n) out = (out * b) % mm; b = (b * b) % mm; e >>= 1n; } return Number(out); };
export const modPowLoop = (a, n, m) => { let out = 1; for (let i = 0; i < n; i++) out = (out * (a % m)) % m; return out; };
export const posMod = (a, m) => ((a % m) + m) % m;
export const factorize = (n) => { const out = []; for (let p = 2; p * p <= n; p++) while (n % p === 0) { out.push(p); n /= p; } if (n > 1) out.push(n); return out; };
export const primeTex = (fs) => { const m = new Map(); fs.forEach((p) => m.set(p, (m.get(p) || 0) + 1)); return [...m].map(([p, e]) => (e === 1 ? `${p}` : `${p}^{${e}}`)).join('\\times '); };
// ---- graphs given by their adjacency matrix ----
export const degrees = (A) => A.map((row, i) => row.reduce((s, x, j) => s + (i === j ? 2 * x : x), 0));
export const walksDFS = (A, i, j, n) => (n === 0 ? (i === j ? 1 : 0) : A[i].reduce((s, x, k) => s + (x ? x * walksDFS(A, k, j, n - 1) : 0), 0));
export const connected = (A) => { const seen = new Set([0]), st = [0]; while (st.length) { const v = st.pop(); A[v].forEach((x, k) => { if (x && !seen.has(k)) { seen.add(k); st.push(k); } }); } return seen.size === A.length; };
export const chromatic = (A) => { const n = A.length; for (let k = 1; k <= n; k++) { const col = Array(n).fill(-1); const go = (v) => { if (v === n) return true; for (let c = 0; c < k; c++) { if (A[v].every((x, u) => !x || col[u] !== c)) { col[v] = c; if (go(v + 1)) return true; col[v] = -1; } } return false; }; if (go(0)) return k; } return n; };
// ---- exponential form: angle u*pi/12 (u a multiple of 2, 3 or 4) ----
export const normU = (u) => { let k = ((u % 24) + 24) % 24; if (k > 12) k -= 24; return k; };
export const thetaTex = (u) => piTex(normU(u), 12);
// r e^{i u pi/12} written in algebraic form with exact surds: r = 2k (mode '2', angles multiple of pi/6) or r = k sqrt(2) (mode 'r2', odd multiples of pi/4)
// or r = k (mode 'k', axes only); returns the LaTeX of the real and imaginary parts, their numeric values and the whole expression
export function algExp(u, mode, k) {
  const e = exactCosSin(u);
  const part = (t, nn) => {
    const sign = t.startsWith('-') ? '-' : '', b = sign ? t.slice(1) : t, abs = Math.abs(nn);
    if (b === '0') return { t: '0', n: 0 };
    let body;
    if (mode === 'k') body = b === '1' ? `${k}` : null;
    else if (mode === '2') body = b === '1' ? `${2 * k}` : b === '\\dfrac{1}{2}' ? `${k}` : b === '\\dfrac{\\sqrt{3}}{2}' ? `${k === 1 ? '' : k}\\sqrt{3}` : null;
    else body = b === '1' ? `${k === 1 ? '' : k}\\sqrt{2}` : b === '\\dfrac{\\sqrt{2}}{2}' ? `${k}` : null;
    if (body === null) throw new Error(`algExp: angle ${u} with mode ${mode}`);
    const r = mode === 'k' ? k : mode === '2' ? 2 * k : k * Math.SQRT2;
    return { t: sign + body, n: (sign ? -1 : 1) * Math.abs(r * nn) };
  };
  const re = part(e.cos, e.cosN), im = part(e.sin, e.sinN);
  const t = re.n === 0 && im.n === 0 ? '0' : `${re.n === 0 ? '' : re.t}${im.n === 0 ? '' : `${im.t.startsWith('-') ? '-' : re.n === 0 ? '' : '+'}${im.t.replace(/^-/, '') === '1' ? '' : im.t.replace(/^-/, '')}i`}`;
  return { re, im, t };
}
export { F, M, val, par, gcd };
