// Seconde generators, second file (chapters 01 to 07): same contract as templates-seconde.js. Each make(r, level)
// returns {q, a, s?, ok}; ok() recomputes the answer by another route (tests/exercise-bank.test.mjs, exercise-audit.test.mjs).
import { F, add, sub, mul, div, val, eq, M, fracTex, numTex, roundTex, polyTex, evalPoly, sgn, par, gcd, isPrime, sqrtTex, sqrtParts, decimals, comma, interval } from './engine.js';
import { pt, vc, setTex, lin, affTex, ivTex, ivHas, E, Einf, dec, normLine, parT } from './seconde-kit.js';

const C = 'seconde';
const sum = (l) => l.reduce((s, x) => s + x, 0);
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
const divisors = (n) => { const d = []; for (let k = 1; k <= n; k++) if (n % k === 0) d.push(k); return d; };
const expo = (ps, es) => ps.map((p, i) => (es[i] === 1 ? `${p}` : `${p}^{${es[i]}}`)).join('\\times ');

export const seconde2 = [
  // ---------------- 01 Arithmétique ----------------
  { id: 's-divisors', cls: C, chapter: 'seconde-01', domain: 'nombres', skill: 'Multiples et diviseurs', fast: true,
    make(r, level) {
      if (level === 1 && r.next() < 0.5) {
        const b = r.int(3, 15), k = r.int(4, 40), rest = r.next() < 0.5 ? 0 : r.int(1, b - 1), a = b * k + rest;
        return { q: `Le nombre ${M(a)} est-il un multiple de ${M(b)} ? Justifier.`,
          a: rest === 0 ? `Oui : ${M(`${a}=${b}\\times ${k}`)} avec ${M(k)} entier.` : `Non : ${M(`${b}\\times ${k}=${b * k}`)} et ${M(`${b}\\times ${k + 1}=${b * (k + 1)}`)}, donc ${M(a)} est strictement compris entre deux multiples consécutifs de ${M(b)}.`,
          ok: () => (a % b === 0) === (rest === 0) && Math.floor(a / b) === k };
      }
      if (level <= 2) {
        let n; do { n = level === 1 ? r.int(12, 99) : r.int(100, 360); } while (isPrime(n));
        const d = divisors(n), pairs = d.filter((k) => k * k <= n).map((k) => `${k}\\times ${n / k}`);
        return { q: `Lister tous les diviseurs positifs de ${M(n)}.`, a: M(d.join('\\ ;\\ ')), s: `On les cherche par paires : ${M(`${n}=${pairs.join('=')}`)}.`,
          ok: () => d.every((k) => n % k === 0) && d.length === d.filter((k) => k * k < n).length * 2 + (Number.isInteger(Math.sqrt(n)) ? 1 : 0) };
      }
      let ps, es, N;
      do { ps = r.shuffle([2, 3, 5, 7, 11]).slice(0, r.int(2, 3)).sort((a, b) => a - b); es = ps.map(() => r.int(1, 4)); N = ps.reduce((s, p, i) => s * p ** es[i], 1); } while (N > 200000);
      const count = es.reduce((s, e) => s * (e + 1), 1);
      return { q: `Combien de diviseurs positifs le nombre ${M(`N=${expo(ps, es)}`)} possède-t-il ? Justifier.`,
        a: `Par unicité de la décomposition, un diviseur positif de ${M('N')} s’écrit ${M(ps.map((p, i) => `${p}^{k_{${i + 1}}}`).join('\\times '))} avec ${M(es.map((e, i) => `0\\leqslant k_{${i + 1}}\\leqslant ${e}`).join(',\\ '))}. Il y a donc ${M(`${es.map((e) => e + 1).join('\\times ')}=${count}`)} diviseurs.`,
        ok: () => { let c = 0; for (let k = 1; k * k <= N; k++) if (N % k === 0) c += k * k === N ? 1 : 2; return c === count; } };
    } },
  { id: 's-fraction-calc', cls: C, chapter: 'seconde-01', domain: 'nombres', skill: 'Calculer avec des fractions, résultat irréductible', fast: true,
    make(r, level) {
      const fr = (n, d) => `\\dfrac{${n}}{${d}}`;
      if (level === 1) {
        const b = r.int(2, 12), k = r.int(1, 4), a = r.int(1, 20), c = r.int(1, 20), plus = r.next() < 0.6;
        const x = F(a, b), y = F(c, k * b), res = plus ? add(x, y) : sub(x, y);
        return { q: `Calculer et donner le résultat sous forme irréductible : ${M(`${fr(a, b)}${plus ? '+' : '-'}${fr(c, k * b)}`)}.`, a: M(`${fracTex(res)}`), s: k > 1 ? `Dénominateur commun ${M(k * b)}.` : '',
          ok: () => near(val(res), plus ? a / b + c / (k * b) : a / b - c / (k * b)) && gcd(res.n, res.d) === 1 };
      }
      if (level === 2) {
        let b, d; do { b = r.int(2, 15); d = r.int(2, 15); } while (b === d || b % d === 0 || d % b === 0);
        const a = r.int(1, 25), c = r.int(1, 25), plus = r.next() < 0.5, res = plus ? add(F(a, b), F(c, d)) : sub(F(a, b), F(c, d));
        return { q: `Calculer et donner le résultat sous forme irréductible : ${M(`${fr(a, b)}${plus ? '+' : '-'}${fr(c, d)}`)}.`, a: M(fracTex(res)), s: `Dénominateur commun : ${M(b * d / gcd(b, d))}.`,
          ok: () => near(val(res), plus ? a / b + c / d : a / b - c / d) && gcd(res.n, res.d) === 1 };
      }
      const [a, b, c, d, e, f] = [r.int(1, 12), r.int(2, 9), r.int(1, 9), r.int(2, 9), r.int(1, 9), r.int(2, 9)];
      if (r.next() < 0.5) {
        const res = sub(F(a, b), mul(F(c, d), F(e, f)));
        return { q: `Calculer et donner le résultat sous forme irréductible : ${M(`${fr(a, b)}-${fr(c, d)}\\times ${fr(e, f)}`)}.`, a: M(fracTex(res)), s: 'La multiplication est prioritaire.', ok: () => near(val(res), a / b - (c * e) / (d * f)) };
      }
      const res = div(add(F(a, b), F(c, d)), F(e, f));
      return { q: `Calculer et donner le résultat sous forme irréductible : ${M(`\\left(${fr(a, b)}+${fr(c, d)}\\right)\\div ${fr(e, f)}`)}.`, a: M(fracTex(res)), s: `Diviser par ${M(fr(e, f))}, c’est multiplier par ${M(e === 1 ? `${f}` : fr(f, e))}.`, ok: () => near(val(res), (a / b + c / d) * (f / e)) };
    } },
  { id: 's-prime-test', cls: C, chapter: 'seconde-01', domain: 'nombres', skill: 'Reconnaître un nombre premier', fast: true,
    make(r, level) {
      const [lo, hi] = level === 1 ? [20, 150] : level === 2 ? [150, 600] : [600, 3000];
      const wantPrime = r.next() < 0.45;
      let n; do { n = r.int(lo, hi); } while (isPrime(n) !== wantPrime || (level > 1 && (n % 2 === 0 || n % 5 === 0)));
      if (wantPrime) {
        const ps = []; for (let p = 2; p * p <= n; p++) if (isPrime(p)) ps.push(p);
        return { q: `Le nombre ${M(n)} est-il premier ? Justifier.`, a: `Oui : ${M(n)} n’est divisible par aucun nombre premier inférieur ou égal à ${M(`\\sqrt{${n}}\\approx ${roundTex(Math.sqrt(n), 1)}`)}, c’est-à-dire ${M(ps.join(',\\ '))}.`,
          ok: () => ps.every((p) => n % p !== 0) && divisors(n).length === 2 };
      }
      let p = 2; while (n % p) p++;
      return { q: `Le nombre ${M(n)} est-il premier ? Justifier.`, a: `Non : ${M(`${n}=${p}\\times ${n / p}`)}.`, ok: () => n % p === 0 && p < n && divisors(n).length > 2 };
    } },

  // ---------------- 02 Vecteurs ----------------
  { id: 's-vec-colinear', cls: C, chapter: 'seconde-02', domain: 'geometrie', skill: 'Déterminant et colinéarité', fast: true,
    make(r, level) {
      const v2 = () => [r.int(-7, 7), r.int(-7, 7)];
      const detTex = (u, v) => `${u[0]}\\times ${par(v[1])}-${par(u[1])}\\times ${par(v[0])}`;
      if (level === 1) {
        let u, v; do { u = v2(); v = v2(); } while ((!u[0] && !u[1]) || (!v[0] && !v[1]));
        const d = u[0] * v[1] - u[1] * v[0];
        return { q: `Calculer ${M('\\det(\\vec{u},\\vec{v})')} pour ${M(`\\vec{u}${vc(u[0], u[1])}`)} et ${M(`\\vec{v}${vc(v[0], v[1])}`)}.`, a: M(`\\det(\\vec{u},\\vec{v})=${detTex(u, v)}=${d}`), ok: () => d === -(v[0] * u[1] - v[1] * u[0]) };
      }
      if (level === 2) {
        let u, v; const yes = r.next() < 0.5;
        do { if (yes) { const w = [r.nz(-4, 4), r.int(-4, 4)], s = r.nz(-3, 3); let t; do { t = r.nz(-4, 4); } while (t === s); u = [s * w[0], s * w[1]]; v = [t * w[0], t * w[1]]; } else { u = v2(); v = v2(); } } while ((!u[0] && !u[1]) || (!v[0] && !v[1]) || ((u[0] * v[1] - u[1] * v[0] === 0) !== yes));
        const d = u[0] * v[1] - u[1] * v[0];
        return { q: `Les vecteurs ${M(`\\vec{u}${vc(u[0], u[1])}`)} et ${M(`\\vec{v}${vc(v[0], v[1])}`)} sont-ils colinéaires ? Justifier.`,
          a: `${M(`\\det(\\vec{u},\\vec{v})=${detTex(u, v)}=${d}`)} : ${d === 0 ? 'le déterminant est nul, les vecteurs sont colinéaires.' : 'le déterminant n’est pas nul, les vecteurs ne sont pas colinéaires.'}`,
          ok: () => (d === 0) === (u[0] * v[1] === u[1] * v[0]) };
      }
      const a = r.nz(-8, 8), b = r.nz(-8, 8), c = r.nz(-8, 8), m = F(a * b, c);
      return { q: `Déterminer le réel ${M('m')} tel que ${M(`\\vec{u}${vc('m', a)}`)} et ${M(`\\vec{v}${vc(b, c)}`)} soient colinéaires.`, a: `${M(`\\det(\\vec{u},\\vec{v})=${c === 1 ? '' : c === -1 ? '-' : c}m-${par(a)}\\times ${par(b)}`)} ; il est nul pour ${M(`m=${fracTex(m)}`)}.`,
        ok: () => eq(mul(m, F(c)), F(a * b)) };
    } },
  { id: 's-vec-norm', cls: C, chapter: 'seconde-02', domain: 'geometrie', skill: 'Norme, distance, nature d’un triangle', fast: false,
    make(r, level) {
      const P = () => [r.int(-6, 6), r.int(-6, 6)];
      const root = (n) => (sqrtTex(n) === `\\sqrt{${n}}` ? `\\sqrt{${n}}` : `\\sqrt{${n}}=${sqrtTex(n)}`);
      if (level === 1) {
        let u; do { u = P(); } while (!u[0] && !u[1]);
        const n2 = u[0] ** 2 + u[1] ** 2;
        return { q: `Dans un repère orthonormé, calculer la norme de ${M(`\\vec{u}${vc(u[0], u[1])}`)}.`, a: M(`\\|\\vec{u}\\|=\\sqrt{${par(u[0])}^{2}+${par(u[1])}^{2}}=${root(n2)}`), ok: () => near(Math.sqrt(n2), Math.hypot(u[0], u[1])) };
      }
      if (level === 2) {
        let A, B; do { A = P(); B = P(); } while (A[0] === B[0] && A[1] === B[1]);
        const n2 = (B[0] - A[0]) ** 2 + (B[1] - A[1]) ** 2;
        return { q: `Dans un repère orthonormé, calculer la distance ${M('AB')} avec ${M(`A${pt(A[0], A[1])}`)} et ${M(`B${pt(B[0], B[1])}`)}.`, a: M(`AB=\\sqrt{${par(B[0] - A[0])}^{2}+${par(B[1] - A[1])}^{2}}=${root(n2)}`), ok: () => near(Math.sqrt(n2), Math.hypot(A[0] - B[0], A[1] - B[1])) };
      }
      let A, u, w, kind;
      do {
        A = [r.int(-5, 3), r.int(-5, 3)]; u = [r.int(-4, 4), r.int(-4, 4)]; kind = r.pick(['right', 'iso', 'any']);
        const k = r.pick([1, 2, -1]);
        w = kind === 'right' ? [-k * u[1], k * u[0]] : kind === 'iso' ? [u[0], -u[1]] : [r.int(-5, 5), r.int(-5, 5)];
      } while ((!u[0] && !u[1]) || u[0] * w[1] - u[1] * w[0] === 0 || (kind === 'iso' && (u[0] * w[0] + u[1] * w[1] === 0)));
      const pts = [A, [A[0] + u[0], A[1] + u[1]], [A[0] + w[0], A[1] + w[1]]];
      const order = r.shuffle([0, 1, 2]), [Pa, Pb, Pc] = order.map((i) => pts[i]), N = ['A', 'B', 'C'];
      const d2 = (X, Y) => (X[0] - Y[0]) ** 2 + (X[1] - Y[1]) ** 2, ab = d2(Pa, Pb), ac = d2(Pa, Pc), bc = d2(Pb, Pc);
      const sides = [[bc, ab + ac, 'A'], [ac, ab + bc, 'B'], [ab, ac + bc, 'C']];
      const right = sides.find(([x, y]) => x === y)?.[2], iso = ab === ac ? 'A' : ab === bc ? 'B' : ac === bc ? 'C' : null;
      const concl = right && iso ? `rectangle et isocèle en ${M(right)}` : right ? `rectangle en ${M(right)} (réciproque du théorème de Pythagore)` : iso ? `isocèle en ${M(iso)}, non rectangle` : 'ni rectangle ni isocèle';
      return { q: `Dans un repère orthonormé, on donne ${M(`A${pt(...Pa)}`)}, ${M(`B${pt(...Pb)}`)} et ${M(`C${pt(...Pc)}`)}. Quelle est la nature du triangle ${M('ABC')} ?`,
        a: `${M(`AB^{2}=${ab}`)}, ${M(`AC^{2}=${ac}`)} et ${M(`BC^{2}=${bc}`)} : le triangle est ${concl}.`,
        ok: () => { const dot = (O, X, Y) => (X[0] - O[0]) * (Y[0] - O[0]) + (X[1] - O[1]) * (Y[1] - O[1]); const at = [[Pa, Pb, Pc], [Pb, Pa, Pc], [Pc, Pa, Pb]].findIndex(([O, X, Y]) => dot(O, X, Y) === 0); return (at < 0 ? undefined : N[at]) === right && N.length === 3; } };
    } },
  { id: 's-vec-combination', cls: C, chapter: 'seconde-02', domain: 'geometrie', skill: 'Combinaisons de vecteurs en coordonnées', fast: true,
    make(r, level) {
      const P = () => [r.int(-6, 6), r.int(-6, 6)];
      if (level === 1) {
        const u = P(), v = P(), k = r.nz(-4, 4), l = r.nz(-4, 4), w = [k * u[0] + l * v[0], k * u[1] + l * v[1]];
        const expr = `${k === 1 ? '' : k === -1 ? '-' : k}\\vec{u}${l < 0 ? '-' : '+'}${Math.abs(l) === 1 ? '' : Math.abs(l)}\\vec{v}`;
        return { q: `On donne ${M(`\\vec{u}${vc(u[0], u[1])}`)} et ${M(`\\vec{v}${vc(v[0], v[1])}`)}. Calculer les coordonnées de ${M(`\\vec{w}=${expr}`)}.`, a: M(`\\vec{w}${vc(w[0], w[1])}`), ok: () => w[0] - l * v[0] === k * u[0] && w[1] - l * v[1] === k * u[1] };
      }
      if (level === 2) {
        const A = P(), B = P(), k = r.pick([F(2), F(3), F(-1), F(-2), F(1, 2), F(3, 2), F(-1, 2), F(1, 3), F(2, 3)]);
        const Mx = add(F(A[0]), mul(k, F(B[0] - A[0]))), My = add(F(A[1]), mul(k, F(B[1] - A[1])));
        return { q: `On donne ${M(`A${pt(A[0], A[1])}`)} et ${M(`B${pt(B[0], B[1])}`)}. Déterminer les coordonnées du point ${M('M')} tel que ${M(`\\overrightarrow{AM}=${k.d === 1 ? (k.n === -1 ? '-' : k.n) : fracTex(k)}\\overrightarrow{AB}`)}.`,
          a: M(`M(${numTex(Mx)}\\,;\\,${numTex(My)})`), s: M(`x_{M}=x_{A}+${k.d === 1 ? par(k.n) : `\\left(${fracTex(k)}\\right)`}(x_{B}-x_{A})`),
          ok: () => near(val(Mx), A[0] * (1 - val(k)) + val(k) * B[0]) && near(val(My), A[1] * (1 - val(k)) + val(k) * B[1]) };
      }
      const A = P(), B = P(), Cc = P(), k = r.nz(-3, 3), l = r.nz(-3, 3);
      const Mx = A[0] + k * (B[0] - A[0]) + l * (Cc[0] - A[0]), My = A[1] + k * (B[1] - A[1]) + l * (Cc[1] - A[1]);
      const expr = `${k === 1 ? '' : k === -1 ? '-' : k}\\overrightarrow{AB}${l < 0 ? '-' : '+'}${Math.abs(l) === 1 ? '' : Math.abs(l)}\\overrightarrow{AC}`;
      return { q: `On donne ${M(`A${pt(...A)}`)}, ${M(`B${pt(...B)}`)} et ${M(`C${pt(...Cc)}`)}. Déterminer les coordonnées du point ${M('M')} tel que ${M(`\\overrightarrow{AM}=${expr}`)}.`, a: M(`M${pt(Mx, My)}`),
        s: `${M(`\\overrightarrow{AB}${vc(B[0] - A[0], B[1] - A[1])}`)} et ${M(`\\overrightarrow{AC}${vc(Cc[0] - A[0], Cc[1] - A[1])}`)}.`,
        ok: () => Mx - A[0] === k * B[0] + l * Cc[0] - (k + l) * A[0] && My - A[1] === k * B[1] + l * Cc[1] - (k + l) * A[1] };
    } },
  { id: 's-chasles', cls: C, chapter: 'seconde-02', domain: 'geometrie', skill: 'Relation de Chasles', fast: true,
    make(r, level) {
      const L = r.shuffle(['A', 'B', 'C', 'D', 'E', 'F', 'G']), k = level === 1 ? 2 : level === 2 ? 3 : r.int(3, 4);
      const path = L.slice(0, k + 1); if (level === 3 && r.next() < 0.35) path[k] = path[0];
      let terms = []; for (let i = 0; i < k; i++) { const neg = level > 1 && r.next() < 0.45; terms.push(neg ? { s: -1, v: path[i + 1] + path[i] } : { s: 1, v: path[i] + path[i + 1] }); }
      terms = r.shuffle(terms);
      const expr = terms.map((t, i) => (t.s < 0 ? '-' : i ? '+' : '') + `\\overrightarrow{${t.v}}`).join('');
      const closed = path[0] === path[k], res = closed ? '\\vec{0}' : `\\overrightarrow{${path[0]}${path[k]}}`;
      return { q: `Simplifier à l’aide de la relation de Chasles : ${M(expr)}.`, a: M(`${expr}=${res}`), s: terms.some((t) => t.s < 0) ? M(`-\\overrightarrow{XY}=\\overrightarrow{YX}`) : '',
        ok: () => { const w = {}; for (const t of terms) { w[t.v[1]] = (w[t.v[1]] || 0) + t.s; w[t.v[0]] = (w[t.v[0]] || 0) - t.s; } return Object.entries(w).every(([p, x]) => x === (closed ? 0 : p === path[k] ? 1 : p === path[0] ? -1 : 0)); } };
    } },

  // ---------------- 03 Droites ----------------
  { id: 's-line-cartesian', cls: C, chapter: 'seconde-03', domain: 'geometrie', skill: 'Équation cartésienne d’une droite', fast: false,
    make(r, level) {
      const P = () => [r.int(-6, 6), r.int(-6, 6)];
      let A, u, a, b, c, q;
      if (level === 1) { A = P(); do { u = [r.int(-5, 5), r.int(-5, 5)]; } while (!u[0] && !u[1]); q = `passant par ${M(`A${pt(...A)}`)} et de vecteur directeur ${M(`\\vec{u}${vc(...u)}`)}`; }
      else if (level === 2) { let B; do { A = P(); B = P(); } while (A[0] === B[0] && A[1] === B[1]); u = [B[0] - A[0], B[1] - A[1]]; q = `passant par ${M(`A${pt(...A)}`)} et ${M(`B${pt(...B)}`)}`; }
      else { A = P(); let a0, b0, c0; do { a0 = r.int(-5, 5); b0 = r.int(-5, 5); c0 = r.int(-9, 9); } while ((!a0 && !b0) || a0 * A[0] + b0 * A[1] + c0 === 0); [a0, b0, c0] = normLine(a0, b0, c0); u = [-b0, a0]; q = `passant par ${M(`A${pt(...A)}`)} et parallèle à la droite ${M(`d':\\ ${lin([[a0, 'x'], [b0, 'y'], [c0, '']])}=0`)}`; }
      [a, b, c] = normLine(u[1], -u[0], -u[1] * A[0] + u[0] * A[1]);
      return { q: `Déterminer une équation cartésienne de la droite ${M('d')} ${q}.`, a: M(`${lin([[a, 'x'], [b, 'y'], [c, '']])}=0`),
        s: `${M('M(x\\,;\\,y)\\in d')} si et seulement si ${M(level === 2 ? '\\det(\\overrightarrow{AM},\\overrightarrow{AB})=0' : '\\det(\\overrightarrow{AM},\\vec{u})=0')}${level === 3 ? `, avec ${M(`\\vec{u}${vc(...u)}`)} directeur de ${M("d'")}` : ''}. Toute équation proportionnelle convient.`,
        ok: () => a * A[0] + b * A[1] + c === 0 && a * u[0] + b * u[1] === 0 && (a || b) };
    } },
  { id: 's-line-reduced', cls: C, chapter: 'seconde-03', domain: 'geometrie', skill: 'De l’équation cartésienne à l’équation réduite', fast: true,
    make(r, level) {
      let a, b, c; do { a = r.int(-6, 6); b = level === 1 ? r.int(-6, 6) : r.next() < 0.15 ? 0 : r.nz(-6, 6); c = r.int(-9, 9); } while (!a && !b);
      [a, b, c] = normLine(a, b, c);
      const eqT = `${lin([[a, 'x'], [b, 'y'], [c, '']])}=0`;
      if (level === 1) return { q: `Donner un vecteur directeur de la droite ${M(`d:\\ ${eqT}`)}.`, a: `Par exemple ${M(`\\vec{u}${vc(-b, a)}`)}.`, s: M('ax+by+c=0\\ \\text{ est dirigée par }\\ \\vec{u}(-b\\,;\\,a)'), ok: () => a * -b + b * a === 0 && (a || b) };
      const red = b === 0 ? `x=${fracTex(F(-c, a))}` : `y=${affTex(F(-a, b), F(-c, b))}`;
      if (level === 2) return { q: `Déterminer l’équation réduite de la droite ${M(`d:\\ ${eqT}`)}.`, a: b === 0 ? `${M(red)} : la droite est parallèle à l’axe des ordonnées.` : M(red),
        ok: () => (b === 0 ? near(a * val(F(-c, a)) + c, 0) : [-2, 0, 3].every((x) => near(a * x + b * (val(F(-a, b)) * x + val(F(-c, b))) + c, 0))) };
      let Pm; const on = r.next() < 0.5;
      if (b === 0) { const x0 = F(-c, a); Pm = [on ? x0 : add(x0, F(1)), F(r.int(-5, 5))]; }
      else { const x = r.int(-4, 4), y = add(mul(F(-a, b), F(x)), F(-c, b)); Pm = [F(x), on ? y : add(y, F(r.pick([-1, 1])))]; }
      const inside = eq(add(add(mul(F(a), Pm[0]), mul(F(b), Pm[1])), F(c)), F(0));
      return { q: `Déterminer l’équation réduite de la droite ${M(`d:\\ ${eqT}`)}, puis dire si le point ${M(`M(${numTex(Pm[0])}\\,;\\,${numTex(Pm[1])})`)} appartient à ${M('d')}.`,
        a: `${M(red)} ; ${inside ? 'oui' : 'non'} : ${M(`${[[a, numTex(Pm[0])], [b, numTex(Pm[1])]].filter(([k]) => k).map(([k, t], i) => `${k < 0 ? '-' : i ? '+' : ''}${Math.abs(k) === 1 ? '' : `${Math.abs(k)}\\times `}${parT(t)}`).join('')}${c ? sgn(c) : ''}${inside ? '=0' : '\\neq 0'}`)}.`,
        ok: () => inside === on };
    } },
  { id: 's-line-relative', cls: C, chapter: 'seconde-03', domain: 'geometrie', skill: 'Positions relatives de deux droites', fast: true,
    make(r, level) {
      const kind = level === 1 ? r.pick(['sec', 'sec', 'par', 'par', 'same']) : r.pick(['sec', 'par', 'same']);
      const m1 = r.int(-5, 5), p1 = r.int(-9, 9); let m2 = m1, p2 = p1;
      if (kind === 'sec') do { m2 = r.int(-5, 5); } while (m2 === m1);
      if (kind !== 'same') p2 = kind === 'par' ? p1 + r.nz(-6, 6) : r.int(-9, 9);
      const word = kind === 'sec' ? 'sécantes' : kind === 'par' ? 'strictement parallèles' : 'confondues';
      if (level === 1) return { q: `Les droites ${M(`d_1:\\ y=${polyTex([m1, p1])}`)} et ${M(`d_2:\\ y=${polyTex([m2, p2])}`)} sont-elles sécantes, strictement parallèles ou confondues ?`,
        a: `${word[0].toUpperCase() + word.slice(1)} : ${kind === 'sec' ? `les pentes ${M(m1)} et ${M(m2)} sont différentes.` : kind === 'par' ? 'même pente, ordonnées à l’origine différentes.' : 'même pente et même ordonnée à l’origine.'}`,
        ok: () => (m1 !== m2) === (kind === 'sec') && ((m1 === m2 && p1 === p2) === (kind === 'same')) };
      // d2 written as k(y - m2 x - p2) = 0, rearranged: -k m2 x + k y - k p2 = 0
      const k = r.nz(-3, 3), [a2, b2, c2] = [-k * m2, k, -k * p2];
      const k1 = level === 3 ? r.nz(-3, 3) : 1, [a1, b1, c1] = [-k1 * m1, k1, -k1 * p1];
      const d1 = level === 3 ? `${lin([[a1, 'x'], [b1, 'y'], [c1, '']])}=0` : `y=${polyTex([m1, p1])}`;
      const det = a1 * b2 - a2 * b1;
      return { q: `Les droites ${M(`d_1:\\ ${d1}`)} et ${M(`d_2:\\ ${lin([[a2, 'x'], [b2, 'y'], [c2, '']])}=0`)} sont-elles sécantes, strictement parallèles ou confondues ?`,
        a: kind === 'sec' ? `Sécantes : ${M(`d_2`)} a pour équation réduite ${M(`y=${polyTex([m2, p2])}`)}, de pente différente de ${M(m1)}.` : `${word[0].toUpperCase() + word.slice(1)} : l’équation réduite de ${M('d_2')} est ${M(`y=${polyTex([m2, p2])}`)}${kind === 'par' ? `, même pente que ${M('d_1')} mais ordonnée à l’origine différente.` : `, la même que celle de ${M('d_1')}.`}`,
        s: level === 3 ? `On peut aussi calculer le déterminant de deux vecteurs directeurs : ${M(`\\det=${det}`)}.` : '',
        ok: () => (det === 0) === (kind !== 'sec') && (kind === 'sec' || ((a2 * 0 + b2 * p1 + c2 === 0) === (kind === 'same'))) };
    } },
  { id: 's-system', cls: C, chapter: 'seconde-03', domain: 'algebre', skill: 'Système de deux équations linéaires', fast: false,
    make(r, level) {
      const x0 = r.int(-6, 6), y0 = r.int(-6, 6), sys = (e1, e2) => `\\begin{cases}${e1}\\\\${e2}\\end{cases}`;
      if (level === 1) {
        const m = r.nz(-4, 4), p = y0 - m * x0; let a, b; do { a = r.nz(-5, 5); b = r.nz(-5, 5); } while (b * m === -a);
        const c = a * x0 + b * y0;
        return { q: `Résoudre le système ${M(sys(`y=${polyTex([m, p])}`, `${lin([[a, 'x'], [b, 'y']])}=${c}`))}.`, a: M(`S=\\{(${x0}\\,;\\,${y0})\\}`), s: 'On remplace y dans la seconde équation (substitution).',
          ok: () => y0 === m * x0 + p && a * x0 + b * y0 === c };
      }
      let a1, b1, a2, b2; const none = level === 3 && r.next() < 0.3;
      do { a1 = r.nz(-6, 6); b1 = r.nz(-6, 6); a2 = r.nz(-6, 6); b2 = r.nz(-6, 6); if (none) { const k = r.pick([-3, -2, 2, 3]); a2 = k * a1; b2 = k * b1; } } while (none ? false : a1 * b2 - a2 * b1 === 0);
      const D = a1 * b2 - a2 * b1;
      if (none) { const c1 = r.int(-9, 9), k = a2 / a1, c2 = k * c1 + r.nz(-4, 4);
        return { q: `Résoudre le système ${M(sys(`${lin([[a1, 'x'], [b1, 'y']])}=${c1}`, `${lin([[a2, 'x'], [b2, 'y']])}=${c2}`))}.`, a: `${M('S=\\varnothing')} : la seconde équation équivaut à ${M(`${lin([[a1, 'x'], [b1, 'y']])}=${fracTex(F(c2, k))}`)}, incompatible avec la première (droites strictement parallèles).`,
          ok: () => D === 0 && c2 !== k * c1 }; }
      let sx, sy, c1, c2;
      if (level === 2) { sx = F(x0); sy = F(y0); c1 = a1 * x0 + b1 * y0; c2 = a2 * x0 + b2 * y0; }
      else { c1 = r.int(-12, 12); c2 = r.int(-12, 12); sx = F(c1 * b2 - c2 * b1, D); sy = F(a1 * c2 - a2 * c1, D); }
      return { q: `Résoudre le système ${M(sys(`${lin([[a1, 'x'], [b1, 'y']])}=${c1}`, `${lin([[a2, 'x'], [b2, 'y']])}=${c2}`))}.`, a: M(`S=\\left\\{\\left(${numTex(sx)}\\,;\\,${numTex(sy)}\\right)\\right\\}`), s: 'Par combinaison : on multiplie les équations pour éliminer une inconnue.',
        ok: () => eq(add(mul(F(a1), sx), mul(F(b1), sy)), F(c1)) && eq(add(mul(F(a2), sx), mul(F(b2), sy)), F(c2)) };
    } },

  // ---------------- 04 Réels et intervalles ----------------
  { id: 's-abs-interval', cls: C, chapter: 'seconde-04', domain: 'nombres', skill: 'Valeur absolue, distance et intervalles', fast: true,
    make(r, level) {
      if (level === 1) {
        const a = F(r.int(-99, 99), 10); let b; do { b = F(r.int(-99, 99), 10); } while (eq(a, b));
        const d = F(Math.abs(b.n * a.d - a.n * b.d), a.d * b.d);
        return { q: `Calculer la distance entre les réels ${M(numTex(a))} et ${M(numTex(b))}.`, a: M(`|${numTex(b)}-${a.n < 0 ? `(${numTex(a)})` : numTex(a)}|=${numTex(d)}`), ok: () => near(val(d), Math.abs(val(a) - val(b))) };
      }
      const a = r.int(-9, 9), rr = r.int(1, 9), xa = a === 0 ? 'x' : `x${sgn(-a)}`;
      if (level === 2) {
        const strict = r.next() < 0.5, S = [{ lo: E(a - rr), hi: E(a + rr), lc: !strict, hc: !strict }];
        return { q: `Écrire l’ensemble des réels ${M('x')} tels que ${M(`|${xa}|${strict ? '<' : '\\leqslant '}${rr}`)} sous forme d’intervalle.`, a: M(`x\\in ${ivTex(S)}`), s: `Les réels à une distance ${strict ? 'strictement inférieure' : 'inférieure ou égale'} à ${M(rr)} de ${M(a)}.`,
          ok: () => [-12, -3.5, a - rr, a, a + rr, a + rr + 0.1, 15].every((x) => ivHas(S, x) === (strict ? Math.abs(x - a) < rr : Math.abs(x - a) <= rr)) };
      }
      if (r.next() < 0.5) {
        const strict = r.next() < 0.5, S = [{ lo: Einf, hi: E(a - rr), lc: false, hc: !strict }, { lo: E(a + rr), hi: Einf, lc: !strict, hc: false }];
        return { q: `Écrire l’ensemble des réels ${M('x')} tels que ${M(`|${xa}|${strict ? '>' : '\\geqslant '}${rr}`)} comme réunion d’intervalles.`, a: M(`x\\in ${ivTex(S)}`),
          ok: () => [-30, a - rr - 1, a - rr, a, a + rr, a + rr + 2, 40].every((x) => ivHas(S, x) === (strict ? Math.abs(x - a) > rr : Math.abs(x - a) >= rr)) };
      }
      const p = F(r.int(-60, 40), r.pick([1, 2, 10])); let q; do { q = add(p, F(r.int(1, 80), r.pick([1, 2, 10]))); } while (eq(q, p));
      const cc = div(add(p, q), F(2)), rad = div(sub(q, p), F(2));
      if (cc.n !== 0 && Math.abs(val(cc)) < 1) return this.make(r, level);
      const xc = cc.n === 0 ? 'x' : cc.n < 0 ? `x+${numTex(F(-cc.n, cc.d))}` : `x-${numTex(cc)}`;
      return { q: `Traduire ${M(`x\\in\\left[${numTex(p)}\\,;\\,${numTex(q)}\\right]`)} par une inégalité avec une valeur absolue.`, a: M(`|${xc}|\\leqslant ${numTex(rad)}`), s: `Centre ${M(`\\dfrac{${numTex(p)}+${q.n < 0 ? `(${numTex(q)})` : numTex(q)}}{2}=${numTex(cc)}`)}, rayon la demi-longueur ${M(numTex(rad))}.`,
        ok: () => near(val(cc) - val(rad), val(p)) && near(val(cc) + val(rad), val(q)) };
    } },
  { id: 's-number-sets', cls: C, chapter: 'seconde-04', domain: 'nombres', skill: 'Ensembles de nombres', fast: true,
    make(r, level) {
      // classify an exact rational, or an irrational square root
      const rat = (f, expr) => {
        const k = decimals(f);
        if (f.d === 1) return f.n >= 0 ? { w: 'N', a: `${M(`${expr}=${f.n}`)} est un entier naturel : ${M('x\\in\\mathbb{N}')}.` } : { w: 'Z', a: `${M(`${expr}=${f.n}`)} est un entier négatif : ${M('x\\in\\mathbb{Z}')} mais ${M('x\\notin\\mathbb{N}')}.` };
        if (k >= 0) return { w: 'D', a: `${M(`${expr}=${numTex(f)}`)} est un décimal non entier : ${M('x\\in\\mathbb{D}')} mais ${M('x\\notin\\mathbb{Z}')}.` };
        return { w: 'Q', a: `${M(`${expr}=${fracTex(f)}`)} : sous forme irréductible, le dénominateur ${M(f.d)} a un facteur premier autre que ${M(2)} et ${M(5)}, donc ${M('x\\in\\mathbb{Q}')} mais ${M('x\\notin\\mathbb{D}')}.` };
      };
      let expr, out, check;
      const kind = level === 1 ? 'frac' : level === 2 ? r.pick(['frac', 'root', 'root']) : r.pick(['prod', 'sum']);
      if (kind === 'frac') { const d = r.pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 40]), n = r.nz(-80, 80); expr = n < 0 ? `-\\dfrac{${-n}}{${d}}` : `\\dfrac{${n}}{${d}}`; if (d === 1) expr = `\\dfrac{${n * 4}}{4}`; const f = d === 1 ? F(n) : F(n, d); out = rat(f, expr); check = () => (f.n % f.d === 0 ? (f.n >= 0 ? 'N' : 'Z') : [1, 2, 3, 4, 5, 6, 7, 8].some((e) => (f.n * 10 ** e) % f.d === 0) ? 'D' : 'Q'); }
      else if (kind === 'root') { const n = r.int(2, 150), s = r.next() < 0.3 ? -1 : 1, [k, m] = sqrtParts(n); expr = `${s < 0 ? '-' : ''}\\sqrt{${n}}`; out = m === 1 ? rat(F(s * k), expr) : { w: 'R', a: `${M(`${expr}${k > 1 ? `=${s < 0 ? '-' : ''}${sqrtTex(n)}` : ''}`)} : ${M(n)} n’est pas un carré parfait, ce nombre est irrationnel : ${M('x\\in\\mathbb{R}')} mais ${M('x\\notin\\mathbb{Q}')}.` }; check = () => (Number.isInteger(Math.sqrt(n)) ? (s > 0 ? 'N' : 'Z') : 'R'); }
      else if (kind === 'prod') { const a = r.int(2, 30), b = r.int(2, 30), n = a * b, [k, m] = sqrtParts(n); expr = `\\sqrt{${a}}\\times\\sqrt{${b}}`; out = m === 1 ? { w: 'N', a: `${M(`${expr}=\\sqrt{${n}}=${k}`)} est un entier naturel : ${M('x\\in\\mathbb{N}')}.` } : { w: 'R', a: `${M(`${expr}=\\sqrt{${n}}${k > 1 ? `=${sqrtTex(n)}` : ''}`)} : ${M(n)} n’est pas un carré parfait, ce nombre est irrationnel : ${M('x\\in\\mathbb{R}')} mais ${M('x\\notin\\mathbb{Q}')}.` }; check = () => (Number.isInteger(Math.round(Math.sqrt(n))) && Math.round(Math.sqrt(n)) ** 2 === n ? 'N' : 'R'); }
      else { const b = r.int(2, 12), d = r.int(2, 12), a = r.int(1, 15), c = r.int(1, 15), f = add(F(a, b), F(c, d)); expr = `\\dfrac{${a}}{${b}}+\\dfrac{${c}}{${d}}`; out = rat(f, expr); check = () => { let q = f.d; while (q % 2 === 0) q /= 2; while (q % 5 === 0) q /= 5; return f.d === 1 ? 'N' : q === 1 ? 'D' : 'Q'; }; }
      return { q: `Quel est le plus petit des ensembles ${M('\\mathbb{N},\\ \\mathbb{Z},\\ \\mathbb{D},\\ \\mathbb{Q},\\ \\mathbb{R}')} contenant ${M(`x=${expr}`)} ? Justifier.`, a: out.a, ok: () => check() === out.w };
    } },
  { id: 's-encadrement', cls: C, chapter: 'seconde-04', domain: 'nombres', skill: 'Encadrements, troncature et arrondi', fast: true,
    make(r, level) {
      const fx = (n, k) => comma((n / 10 ** k).toFixed(k)), words = { 1: 'au dixième', 2: 'au centième', 3: 'au millième' };
      if (level === 1) {
        const k = r.int(1, 3); let N; do { N = r.int(10000, 999999); } while ((N % 10 ** (4 - k)) * 2 === 10 ** (4 - k));
        const lo = Math.floor(N / 10 ** (4 - k)), rd = Math.round(N / 10 ** (4 - k));
        return { q: `Donner la troncature et l’arrondi ${words[k]} de ${M(fx(N, 4))}.`, a: `Troncature : ${M(fx(lo, k))} ; arrondi : ${M(fx(rd, k))}.`, ok: () => lo * 10 ** (4 - k) <= N && N < (lo + 1) * 10 ** (4 - k) && Math.abs(rd * 10 ** (4 - k) - N) * 2 < 10 ** (4 - k) };
      }
      const k = r.int(1, 3), P = 10 ** k;
      if (level === 2) {
        let a, b; do { b = r.pick([3, 6, 7, 9, 11, 12, 13, 14, 15, 17, 18, 21]); a = r.int(1, 12 * b); } while (decimals(F(a, b)) >= 0);
        const lo = Math.floor((a * P) / b), rd = 2 * (a * P - lo * b) < b ? lo : lo + 1;
        return { q: `Encadrer ${M(`\\dfrac{${a}}{${b}}`)} entre deux décimaux consécutifs à ${M(`10^{-${k}}`)} près, puis donner son arrondi ${words[k]}.`, a: `${M(`${fx(lo, k)}<\\dfrac{${a}}{${b}}<${fx(lo + 1, k)}`)} ; arrondi : ${M(fx(rd, k))}.`,
          ok: () => lo * b < a * P && a * P < (lo + 1) * b && Math.abs(rd * b - a * P) * 2 < b };
      }
      let n; do { n = r.int(2, 999); } while (Number.isInteger(Math.sqrt(n)));
      let lo = Math.floor(Math.sqrt(n) * P); while (lo * lo > n * P * P) lo--; while ((lo + 1) ** 2 <= n * P * P) lo++;
      const rd = (2 * lo + 1) ** 2 < 4 * n * P * P ? lo + 1 : lo;
      return { q: `Encadrer ${M(`\\sqrt{${n}}`)} entre deux décimaux consécutifs à ${M(`10^{-${k}}`)} près, puis donner son arrondi ${words[k]}.`, a: `${M(`${fx(lo, k)}<\\sqrt{${n}}<${fx(lo + 1, k)}`)} car ${M(`${fx(lo, k)}^{2}<${n}<${fx(lo + 1, k)}^{2}`)} ; arrondi : ${M(fx(rd, k))}.`,
        ok: () => lo * lo < n * P * P && n * P * P < (lo + 1) ** 2 && Math.abs(Math.sqrt(n) * P - rd) < 0.5 };
    } },

  // ---------------- 05 Bilan de trimestre ----------------
  { id: 's-review-mix', cls: C, chapter: 'seconde-05', domain: 'nombres', skill: 'Bilan : nombres, intervalles, vecteurs et droites', fast: true,
    make(r, level) {
      const kind = level === 1 ? r.pick(['belong', 'slope']) : level === 2 ? r.pick(['sym', 'dist']) : r.pick(['align', 'irr']);
      if (kind === 'belong') {
        const a = r.int(-9, 5), b = a + r.int(1, 8), lc = r.next() < 0.5, hc = r.next() < 0.5, x = r.pick([F(a), F(b), F(10 * a - r.int(1, 9), 10), F(10 * b + r.int(-9, 9), 10), F(10 * a + r.int(1, 9), 10)]);
        const inI = (val(x) > a || (val(x) === a && lc)) && (val(x) < b || (val(x) === b && hc));
        return { q: `Le réel ${M(numTex(x))} appartient-il à l’intervalle ${M(interval(a, b, lc, hc))} ?`, a: inI ? 'Oui.' : 'Non.', s: 'Un crochet tourné vers l’intérieur inclut la borne.', ok: () => inI === (x.n * 1 >= a * x.d + (lc ? 0 : 1e-9) && x.n <= b * x.d - (hc ? 0 : 1e-9)) };
      }
      const P = () => [r.int(-7, 7), r.int(-7, 7)];
      if (kind === 'slope') { let A, B; do { A = P(); B = P(); } while (A[0] === B[0]); const m = F(B[1] - A[1], B[0] - A[0]);
        return { q: `Calculer la pente de la droite ${M('(AB)')} avec ${M(`A${pt(...A)}`)} et ${M(`B${pt(...B)}`)}.`, a: M(`m=\\dfrac{${B[1]}-${par(A[1])}}{${B[0]}-${par(A[0])}}=${fracTex(m)}`), ok: () => eq(mul(m, F(B[0] - A[0])), F(B[1] - A[1])) }; }
      if (kind === 'sym') { const A = P(), B = P(), S = [2 * B[0] - A[0], 2 * B[1] - A[1]];
        return { q: `Déterminer les coordonnées du symétrique ${M("A'")} de ${M(`A${pt(...A)}`)} par rapport à ${M(`B${pt(...B)}`)}.`, a: M(`A'${pt(...S)}`), s: `${M('B')} est le milieu de ${M("[AA']")}.`, ok: () => A[0] + S[0] === 2 * B[0] && A[1] + S[1] === 2 * B[1] }; }
      if (kind === 'dist') { const a = r.int(-40, 40); let b; do { b = r.int(-40, 40); } while (b === a); const c = F(a + b, 2);
        return { q: `Quel est le réel situé à égale distance de ${M(a)} et de ${M(b)} ?`, a: M(numTex(c)), s: 'C’est le centre de l’intervalle : la moyenne des deux nombres.', ok: () => near(Math.abs(val(c) - a), Math.abs(val(c) - b)) }; }
      if (kind === 'align') { const A = P(), u = [r.nz(-4, 4), r.int(-4, 4)], k = r.nz(-3, 3), yes = r.next() < 0.5, B = [A[0] + u[0], A[1] + u[1]], Cc = [A[0] + k * u[0], A[1] + k * u[1] + (yes ? 0 : r.pick([-1, 1]))];
        const d = (B[0] - A[0]) * (Cc[1] - A[1]) - (B[1] - A[1]) * (Cc[0] - A[0]);
        return { q: `Les points ${M(`A${pt(...A)}`)}, ${M(`B${pt(...B)}`)} et ${M(`C${pt(...Cc)}`)} sont-ils alignés ?`, a: `${M(`\\det(\\overrightarrow{AB},\\overrightarrow{AC})=${d}`)} : ${d === 0 ? 'oui, les points sont alignés.' : 'non, les points ne sont pas alignés.'}`, ok: () => (d === 0) === yes }; }
      const g = r.pick([12, 18, 24, 30, 36, 42, 45, 48, 60, 72, 84, 90]); let m, n; do { m = r.int(2, 19); n = r.int(2, 19); } while (m === n || gcd(m, n) !== 1);
      return { q: `Rendre irréductible la fraction ${M(`\\dfrac{${g * m}}{${g * n}}`)}.`, a: M(`\\dfrac{${g * m}}{${g * n}}=\\dfrac{${m}}{${n}}`), s: `On divise par le PGCD, ${M(g)}.`, ok: () => gcd(g * m, g * n) === g && gcd(m, n) === 1 };
    } },
  { id: 's-calc-program', cls: C, chapter: 'seconde-05', domain: 'algebre', skill: 'Programmes de calcul', fast: false,
    make(r, level) {
      // a programme is a list of steps acting on a polynomial (coefficients, ascending powers would be harder to print: descending)
      const step = (kind, k) => ({ kind, k });
      const apply = (p, s) => { if (s.kind === 'add') { const q = [...p]; q[q.length - 1] += s.k; return q; } if (s.kind === 'mul') return p.map((c) => c * s.k); if (s.kind === 'sq') return mulP(p, p); if (s.kind === 'mx') return [...p, 0]; return p; };
      const mulP = (p, q) => { const o = Array(p.length + q.length - 1).fill(0); p.forEach((a, i) => q.forEach((b, j) => { o[i + j] += a * b; })); return o; };
      const say = (s) => (s.kind === 'add' ? (s.k > 0 ? `ajouter ${M(s.k)}` : `soustraire ${M(-s.k)}`) : s.kind === 'mul' ? `multiplier par ${M(s.k)}` : s.kind === 'sq' ? 'élever au carré' : 'multiplier par le nombre de départ');
      const lin3 = () => [step('add', r.nz(-9, 9)), step('mul', r.pick([-3, -2, 2, 3, 4, 5])), step('add', r.nz(-9, 9))];
      const run = (steps, x) => steps.reduce((v, s) => (s.kind === 'add' ? v + s.k : s.kind === 'mul' ? v * s.k : s.kind === 'sq' ? v * v : v * x), x);
      const text = (steps) => `choisir un nombre ; ${steps.map(say).join(' ; ')}`;
      if (level === 1) {
        const steps = r.shuffle(lin3()), x = r.int(-9, 9);
        return { q: `Programme de calcul : ${text(steps)}. Quel résultat obtient-on en choisissant ${M(x)} ?`, a: M(run(steps, x)), ok: () => evalPoly(steps.reduce(apply, [1, 0]), x) === run(steps, x) };
      }
      if (level === 2) {
        const steps = [step('add', r.nz(-6, 6)), r.pick([step('mx'), step('sq')]), step('add', r.nz(-9, 9))];
        if (r.next() < 0.5) steps.splice(2, 0, step('mul', r.pick([-2, 2, 3])));
        const p = steps.reduce(apply, [1, 0]);
        return { q: `Programme de calcul : ${text(steps)}. Exprimer le résultat en fonction du nombre de départ ${M('x')}, sous forme développée et réduite.`, a: M(polyTex(p)), ok: () => [-3, -1, 0, 2, 5].every((x) => evalPoly(p, x) === run(steps, x)) };
      }
      let A, B, pa, pb; do { A = lin3(); B = [step('mul', r.pick([-2, 2, 3, 5])), step('add', r.nz(-9, 9))]; pa = A.reduce(apply, [1, 0]); pb = B.reduce(apply, [1, 0]); } while (pa[0] === pb[0]);
      const x0 = F(pb[1] - pa[1], pa[0] - pb[0]);
      return { q: `Programme A : ${text(A)}. Programme B : ${text(B)}. Quel nombre de départ donne le même résultat avec les deux programmes ?`, a: `A donne ${M(polyTex(pa))}, B donne ${M(polyTex(pb))} ; ${M(`${polyTex(pa)}=${polyTex(pb)}\\iff x=${fracTex(x0)}`)}.`,
        ok: () => near(run(A, val(x0)), run(B, val(x0))) };
    } },
  { id: 's-scientific', cls: C, chapter: 'seconde-05', domain: 'nombres', skill: 'Écriture scientifique', fast: true,
    make(r, level) {
      const sci = (D, e) => { const s = String(D); const m = s.length === 1 ? s : `${s[0]}{,}${s.slice(1)}`; return e === 0 ? m : `${m}\\times 10${e === 1 ? '' : `^{${e}}`}`; };
      const strip = (D) => { while (D % 10 === 0) D /= 10; return D; };
      if (level === 1) {
        const D = strip(r.int(11, 999)), len = String(D).length; let e; do { e = r.int(-6, 8); } while (e === 0 || e === 1);
        const shift = e - (len - 1); let dstr;
        if (shift >= 0) { dstr = String(D) + '0'.repeat(shift); dstr = dstr.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,'); }
        else { const s = String(D).padStart(-shift + 1, '0'); dstr = `${s.slice(0, s.length + shift)}{,}${s.slice(s.length + shift)}`; }
        return { q: `Donner l’écriture scientifique de ${M(dstr)}.`, a: M(sci(D, e)), ok: () => near(Number(dstr.replace(/\\,/g, '').replace('{,}', '.')), D / 10 ** (len - 1) * 10 ** e) };
      }
      const pick2 = () => { let x; do { x = r.int(11, 99); } while (x % 10 === 0); return x; };
      const a = pick2(), b = pick2(), m = r.int(-8, 8), n = r.int(-8, 8), P = a * b, len = String(P).length;
      if (level === 2) {
        const e = m + n + len - 3;
        return { q: `Calculer et donner le résultat en écriture scientifique : ${M(`(${sci(a, m)})\\times(${sci(b, n)})`)}.`, a: M(sci(strip(P), e)), s: 'On multiplie les mantisses, on additionne les exposants, puis on ramène la mantisse entre 1 et 10.',
          ok: () => near(P / 10 ** (len - 1) * 10 ** (e - (m + n)), (a / 10) * (b / 10), 1e-12) };
      }
      // the quotient (a x 10^m)(b x 10^n) / (b x 10^n) = a x 10^m: the numerator is the normalised product
      const e = m + n + len - 3;
      return { q: `Calculer et donner le résultat en écriture scientifique : ${M(`\\dfrac{${sci(strip(P), e)}}{${sci(b, n)}}`)}.`, a: M(sci(a, m)), s: 'On divise les mantisses et on soustrait les exposants.',
        ok: () => near((P / 10 ** (len - 1)) / (b / 10) * 10 ** (e - n - m), a / 10, 1e-12) };
    } },
  { id: 's-set-ops', cls: C, chapter: 'seconde-05', domain: 'nombres', skill: 'Ensembles : intersection, réunion, produit cartésien', fast: true,
    make(r, level) {
      const S = (l) => setTex([...new Set(l)].sort((a, b) => a - b));
      let A, B, da, db;
      if (level === 1) { const pick = () => r.shuffle([...Array(13).keys()]).slice(0, r.int(3, 6)); A = pick(); B = pick(); da = S(A); db = S(B); }
      else if (level === 2) {
        const props = [
          () => { const n = r.pick([12, 18, 20, 24, 28, 30, 36, 40]); return [divisors(n), `l’ensemble des diviseurs positifs de ${M(n)}`]; },
          () => { const k = r.int(2, 6), hi = r.int(18, 30); const l = []; for (let x = k; x <= hi; x += k) l.push(x); return [l, `l’ensemble des multiples de ${M(k)} compris entre ${M(1)} et ${M(hi)}`]; },
          () => { const hi = r.int(15, 30); const l = []; for (let x = 2; x < hi; x++) if (isPrime(x)) l.push(x); return [l, `l’ensemble des nombres premiers inférieurs à ${M(hi)}`]; },
          () => { const lo = r.int(0, 6), hi = lo + r.int(4, 9); const l = []; for (let x = lo; x < hi; x++) l.push(x); return [l, `l’ensemble des entiers ${M('n')} tels que ${M(`${lo}\\leqslant n<${hi}`)}`]; },
        ];
        let x, y; do { x = r.pick(props)(); y = r.pick(props)(); } while (x[1] === y[1]);
        [A, da] = x; [B, db] = y;
      } else {
        A = r.shuffle([...Array(9).keys()].map((k) => k + 1)).slice(0, r.int(2, 3)).sort((a, b) => a - b); B = r.shuffle([...Array(9).keys()].map((k) => k + 1)).slice(0, r.int(2, 4)).sort((a, b) => a - b);
        const a0 = r.pick(A), b0 = r.pick(B), swap = r.next() < 0.5, c = swap ? [b0, a0] : [a0, b0], inP = A.includes(c[0]) && B.includes(c[1]);
        return { q: `On pose ${M(`A=${S(A)}`)} et ${M(`B=${S(B)}`)}. Combien d’éléments contient ${M('A\\times B')} ? Le couple ${M(`(${c[0]}\\,;\\,${c[1]})`)} appartient-il à ${M('A\\times B')} ?`,
          a: `${M(`\\text{Card}(A\\times B)=${A.length}\\times ${B.length}=${A.length * B.length}`)} ; ${inP ? 'oui' : 'non'} : il faut une première composante dans ${M('A')} et une seconde dans ${M('B')}.`,
          ok: () => { let n = 0; A.forEach(() => B.forEach(() => { n++; })); return n === A.length * B.length && inP === (A.indexOf(c[0]) >= 0 && B.indexOf(c[1]) >= 0); } };
      }
      const I = A.filter((x) => B.includes(x)), U = [...A, ...B];
      return { q: `On note ${level === 1 ? M(`A=${da}`) : `${M('A')} ${da}`} et ${level === 1 ? M(`B=${db}`) : `${M('B')} ${db}`}. Écrire ${M('A\\cap B')} et ${M('A\\cup B')} en extension.`, a: M(`A\\cap B=${S(I)}\\ \\text{ et }\\ A\\cup B=${S(U)}`),
        ok: () => new Set(U).size === new Set(A).size + new Set(B).size - new Set(I).size };
    } },

  // ---------------- 06 Fonctions ----------------
  { id: 's-domain', cls: C, chapter: 'seconde-06', domain: 'fonctions', skill: 'Ensemble de définition', fast: true,
    make(r, level) {
      const a = r.nz(-5, 5), b = r.int(-9, 9), x0 = F(-b, a), k = r.nz(-9, 9), lp = polyTex([a, b]);
      const cut = (pt0) => [{ lo: Einf, hi: E(pt0), lc: false, hc: false }, { lo: E(pt0), hi: Einf, lc: false, hc: false }];
      const ray = (pt0, right, closed = true) => [right ? { lo: E(pt0), hi: Einf, lc: closed, hc: false } : { lo: Einf, hi: E(pt0), lc: false, hc: closed }];
      let expr, S, def;
      const kind = level === 1 ? r.pick(['inv', 'sqrt']) : level === 2 ? r.pick(['quot', 'sq2']) : 'mix';
      if (kind === 'inv') { expr = `\\dfrac{${k}}{${lp}}`; S = cut(x0); def = (x) => Math.abs(a * x + b) > 1e-12; }
      else if (kind === 'sqrt') { expr = `\\sqrt{${lp}}`; S = ray(x0, a > 0); def = (x) => a * x + b >= -1e-12; }
      else if (kind === 'quot') { const c = r.nz(-4, 4), d = r.int(-9, 9); expr = `\\dfrac{${polyTex([c, d])}}{${lp}}`; S = cut(x0); def = (x) => Math.abs(a * x + b) > 1e-12; }
      else if (kind === 'sq2') { const m = r.int(1, 9); expr = `\\dfrac{${k}}{x^{2}-${m * m}}`; S = [{ lo: Einf, hi: E(F(-m)), lc: false, hc: false }, { lo: E(F(-m)), hi: E(F(m)), lc: false, hc: false }, { lo: E(F(m)), hi: Einf, lc: false, hc: false }]; def = (x) => x * x !== m * m; }
      else {
        let x1; do { x1 = r.int(-8, 8); } while (x1 === val(x0));
        const xc = x1 === 0 ? 'x' : `x${sgn(-x1)}`; expr = `\\dfrac{\\sqrt{${lp}}}{${xc}}`; def = (x) => a * x + b >= -1e-12 && x !== x1;
        const inRay = a > 0 ? x1 > val(x0) : x1 < val(x0);
        S = !inRay ? ray(x0, a > 0) : a > 0 ? [{ lo: E(x0), hi: E(F(x1)), lc: true, hc: false }, { lo: E(F(x1)), hi: Einf, lc: false, hc: false }] : [{ lo: Einf, hi: E(F(x1)), lc: false, hc: false }, { lo: E(F(x1)), hi: E(x0), lc: false, hc: true }];
      }
      return { q: `Déterminer l’ensemble de définition de la fonction ${M(`f(x)=${expr}`)}.`, a: M(`D_f=${ivTex(S)}`), s: kind === 'sqrt' || kind === 'mix' ? 'Le nombre sous la racine doit être positif ou nul ; un dénominateur doit être non nul.' : 'Un dénominateur doit être non nul.',
        ok: () => { for (let t = -200; t <= 200; t++) { const x = t / 20; if (def(x) !== ivHas(S, x)) return false; } return def(val(x0)) === ivHas(S, val(x0)) || kind === 'inv' || kind === 'quot'; } };
    } },
  { id: 's-ref-equation', cls: C, chapter: 'seconde-06', domain: 'fonctions', skill: 'Équations et inéquations avec les fonctions de référence', fast: true,
    make(r, level) {
      const rootE = (k) => { const [p, m] = sqrtParts(k); return { t: sqrtTex(k), v: Math.sqrt(k), neg: { t: `-${sqrtTex(k)}`, v: -Math.sqrt(k) } }; };
      const fin = (list) => ({ fin: list });
      let q, S, pred;
      const kind = level === 1 ? r.pick(['sq', 'sqrt', 'abs']) : level === 2 ? r.pick(['sqle', 'sqge', 'absle', 'absge']) : 'inv';
      if (kind === 'sq' || kind === 'sqle' || kind === 'sqge') {
        const k = r.next() < 0.15 ? r.int(-9, -1) : r.next() < 0.1 ? 0 : r.int(1, 100), strict = r.next() < 0.5;
        if (kind === 'sq') { q = `x^{2}=${k}`; S = k < 0 ? fin([]) : k === 0 ? fin([{ t: '0', v: 0 }]) : fin([rootE(k).neg, rootE(k)]); pred = (x) => Math.abs(x * x - k) < 1e-9; }
        else if (kind === 'sqle') { q = `x^{2}${strict ? '<' : '\\leqslant '}${k}`; pred = (x) => (strict ? x * x < k - 1e-12 : x * x <= k + 1e-12); S = k < 0 || (k === 0 && strict) ? fin([]) : k === 0 ? fin([{ t: '0', v: 0 }]) : [{ lo: rootE(k).neg, hi: rootE(k), lc: !strict, hc: !strict }]; }
        else { q = `x^{2}${strict ? '>' : '\\geqslant '}${k}`; pred = (x) => (strict ? x * x > k + 1e-12 : x * x >= k - 1e-12); S = k < 0 || (k === 0 && !strict) ? [{ lo: Einf, hi: Einf, lc: false, hc: false }] : k === 0 ? [{ lo: Einf, hi: E(F(0)), lc: false, hc: false }, { lo: E(F(0)), hi: Einf, lc: false, hc: false }] : [{ lo: Einf, hi: rootE(k).neg, lc: false, hc: !strict }, { lo: rootE(k), hi: Einf, lc: !strict, hc: false }]; }
      } else if (kind === 'sqrt') { const k = r.int(-3, 15); q = `\\sqrt{x}=${k}`; S = k < 0 ? fin([]) : fin([{ t: `${k * k}`, v: k * k }]); pred = (x) => x >= 0 && Math.abs(Math.sqrt(x) - k) < 1e-9; }
      else if (kind === 'abs' || kind === 'absle' || kind === 'absge') {
        const k = r.next() < 0.15 ? r.int(-9, -1) : F(r.int(1, 99), r.pick([1, 1, 10])), kv = typeof k === 'number' ? k : val(k), kt = typeof k === 'number' ? `${k}` : numTex(k), strict = r.next() < 0.5;
        const pos = { t: kt, v: kv }, ng = { t: `-${kt}`, v: -kv };
        if (kind === 'abs') { q = `|x|=${kt}`; S = kv < 0 ? fin([]) : fin([ng, pos]); pred = (x) => Math.abs(Math.abs(x) - kv) < 1e-9; }
        else if (kind === 'absle') { q = `|x|${strict ? '<' : '\\leqslant '}${kt}`; S = kv < 0 ? fin([]) : [{ lo: ng, hi: pos, lc: !strict, hc: !strict }]; pred = (x) => (strict ? Math.abs(x) < kv - 1e-12 : Math.abs(x) <= kv + 1e-12); }
        else { q = `|x|${strict ? '>' : '\\geqslant '}${kt}`; S = kv < 0 ? [{ lo: Einf, hi: Einf, lc: false, hc: false }] : [{ lo: Einf, hi: ng, lc: false, hc: !strict }, { lo: pos, hi: Einf, lc: !strict, hc: false }]; pred = (x) => (strict ? Math.abs(x) > kv + 1e-12 : Math.abs(x) >= kv - 1e-12); }
      } else {
        const k = r.pick([F(r.nz(-9, 9)), F(r.pick([-1, 1]), r.int(2, 9)), F(r.pick([-3, -2, 2, 3]), r.pick([5, 7]))]), rel = r.pick(['<', '\\leqslant ', '>', '\\geqslant ']), inv = { t: fracTex(div(F(1), k)), v: 1 / val(k) }, Z = E(F(0));
        q = `\\dfrac{1}{x}${rel}${fracTex(k)}`; const lt = rel[0] === '<' || rel.startsWith('\\le'), st = rel === '<' || rel === '>';
        pred = (x) => { if (x === 0) return false; const y = 1 / x, kv = val(k); return lt ? (st ? y < kv - 1e-12 : y <= kv + 1e-12) : (st ? y > kv + 1e-12 : y >= kv - 1e-12); };
        if (val(k) > 0) S = lt ? [{ lo: Einf, hi: Z, lc: false, hc: false }, { lo: inv, hi: Einf, lc: !st, hc: false }] : [{ lo: Z, hi: inv, lc: false, hc: !st }];
        else S = lt ? [{ lo: inv, hi: Z, lc: !st, hc: false }] : [{ lo: Einf, hi: inv, lc: false, hc: !st }, { lo: Z, hi: Einf, lc: false, hc: false }];
      }
      const ans = S.fin ? (S.fin.length ? `S=\\left\\{${S.fin.map((e) => e.t).join('\\,;\\,')}\\right\\}` : 'S=\\varnothing') : `S=${ivTex(S)}`;
      const has = (x) => (S.fin ? S.fin.some((e) => Math.abs(e.v - x) < 1e-9) : ivHas(S, x));
      return { q: `Résoudre dans ${M('\\mathbb{R}')} : ${M(q)}.`, a: M(ans), s: kind === 'inv' ? `Distinguer ${M('x<0')} et ${M('x>0')} : ${M('\\dfrac{1}{x}')} a le signe de ${M('x')}.` : '',
        ok: () => { const grid = []; for (let t = -400; t <= 400; t++) grid.push(t / 20 + 0.0137);
          if (S.fin) return S.fin.every((e) => pred(e.v)) && grid.every((x) => !pred(x) || has(x));
          const b = S.flatMap((i) => [i.lo, i.hi]).filter(Boolean).map((e) => e.v);
          return [...grid, ...b.flatMap((p) => [p + 1e-4, p - 1e-4])].every((x) => has(x) === pred(x)) && b.every((p) => p === 0 || has(p) === pred(p)); } };
    } },
  { id: 's-affine-sign', cls: C, chapter: 'seconde-06', domain: 'fonctions', skill: 'Fonctions affines : zéro, signe, expression', fast: true,
    make(r, level) {
      if (level < 3) {
        const m = r.nz(-6, 6), p = r.int(-12, 12), x0 = F(-p, m), f = polyTex([m, p]);
        if (level === 1) return { q: `Résoudre ${M(`${f}=0`)} : en quelle valeur la fonction affine ${M(`f(x)=${f}`)} s’annule-t-elle ?`, a: M(`x=${fracTex(x0)}`), ok: () => eq(add(mul(F(m), x0), F(p)), F(0)) };
        const pos = m > 0 ? interval(fracTex(x0), '+\\infty', false, false) : interval('-\\infty', fracTex(x0), false, false), ng = m > 0 ? interval('-\\infty', fracTex(x0), false, false) : interval(fracTex(x0), '+\\infty', false, false);
        return { q: `Étudier le signe de ${M(`f(x)=${f}`)} selon les valeurs de ${M('x')}.`, a: `${M('f')} s’annule en ${M(fracTex(x0))} ; ${M('f(x)>0')} sur ${M(pos)} et ${M('f(x)<0')} sur ${M(ng)}.`, s: `Le coefficient ${M(m)} est ${m > 0 ? 'positif' : 'négatif'} : à droite du zéro, ${M('f(x)')} a son signe.`,
          ok: () => (m * (val(x0) + 1) + p > 0) === (m > 0) && near(m * val(x0) + p, 0) };
      }
      const a = r.int(-6, 4), c = a + r.int(1, 6), fa = r.int(-9, 9), fc = r.int(-9, 9), m = F(fc - fa, c - a), p = sub(F(fa), mul(m, F(a)));
      return { q: `Déterminer la fonction affine ${M('f')} telle que ${M(`f(${a})=${fa}`)} et ${M(`f(${c})=${fc}`)}.`, a: M(`f(x)=${affTex(m, p)}`), s: M(`m=\\dfrac{${fc}-${par(fa)}}{${c}-${par(a)}}=${fracTex(m)}`),
        ok: () => eq(add(mul(m, F(a)), p), F(fa)) && eq(add(mul(m, F(c)), p), F(fc)) };
    } },

  // ---------------- 07 Statistiques ----------------
  { id: 's-weighted-mean', cls: C, chapter: 'seconde-07', domain: 'stats-proba', skill: 'Moyenne pondérée, fréquences', fast: false,
    make(r, level) {
      const k = r.int(3, 5), xs = r.shuffle([...Array(16).keys()].map((i) => i + 4)).slice(0, k).sort((a, b) => a - b), ns = xs.map(() => r.int(1, 9));
      const table = (h1, h2, a, b) => `\\begin{array}{|l|${'c|'.repeat(a.length)}}\\hline\\text{${h1}}&${a.join('&')}\\\\\\hline\\text{${h2}}&${b.join('&')}\\\\\\hline\\end{array}`;
      const N = sum(ns), S = sum(xs.map((x, i) => x * ns[i])), mean = F(S, N);
      if (level === 1) return { q: `Calculer la moyenne de la série ${M(table('Valeur', 'Effectif', xs, ns))}`, a: M(`\\bar{x}=\\dfrac{${S}}{${N}}${dec(mean)}`), ok: () => near(val(mean), xs.reduce((s, x, i) => s + (x * ns[i]) / N, 0)) };
      if (level === 2) {
        const v = xs[r.int(0, k - 2)], c = sum(ns.filter((_, i) => xs[i] <= v)), f = mul(F(c, N), F(100));
        return { q: `Pour la série ${M(table('Valeur', 'Effectif', xs, ns))} calculer la fréquence (en %) des valeurs inférieures ou égales à ${M(v)}, puis la moyenne.`, a: `${M(`f=\\dfrac{${c}}{${N}}${dec(f, 1)}\\,\\%`)} ; ${M(`\\bar{x}=\\dfrac{${S}}{${N}}${dec(mean)}`)}.`,
          ok: () => near(val(f), (100 * xs.filter((x) => x <= v).reduce((s, x) => s + ns[xs.indexOf(x)], 0)) / N) && near(val(mean) * N, S) };
      }
      const notes = xs.slice(0, 3).map((x) => Math.min(20, x)), coefs = notes.map(() => r.int(1, 3)), c = r.int(1, 4), W = sum(coefs) + c, T = sum(notes.map((x, i) => x * coefs[i]));
      const ms = []; for (let x = 1; x <= 19; x++) if (x * W - T >= 0 && x * W - T <= 20 * c) ms.push(x);
      const m = r.pick(ms), need = F(m * W - T, c);
      const fmt = `\\dfrac{${m}\\times ${W}-${T}}{${c}}`;
      return { q: `Un élève a obtenu ${notes.map((x, i) => `${M(x)} (coefficient ${M(coefs[i])})`).join(', ')}. Quelle note doit-il obtenir au dernier devoir, de coefficient ${M(c)}, pour avoir exactement ${M(m)} de moyenne ?`,
        a: `${M(`\\dfrac{${T}+${c === 1 ? '' : c}x}{${W}}=${m}\\iff x=${fmt}`)}, soit ${M(`x=${numTex(need)}`)}${decimals(need) < 0 ? M(`\\approx ${roundTex(val(need), 2)}`) : ''}.`,
        ok: () => near((T + c * val(need)) / W, m) };
    } },
  { id: 's-variance', cls: C, chapter: 'seconde-07', domain: 'stats-proba', skill: 'Variance et écart type', fast: false,
    make(r, level) {
      if (level === 1) {
        const n = r.int(4, 6); let v; do { v = Array.from({ length: n }, () => r.int(2, 18)); } while (sum(v) % n);
        const m = sum(v) / n, V = F(sum(v.map((x) => (x - m) ** 2)), n);
        return { q: `Série : ${M(v.join('\\ ;\\ '))}. Calculer la moyenne, la variance et l’écart type (arrondi au centième).`, a: M(`\\bar{x}=${m},\\ V=${numTex(V)},\\ \\sigma=\\sqrt{${numTex(V)}}\\approx ${roundTex(Math.sqrt(val(V)), 2)}`),
          ok: () => near(val(V), sum(v.map((x) => x * x)) / n - m * m) };
      }
      if (level === 2) {
        const xs = r.shuffle([...Array(12).keys()].map((i) => i + 1)).slice(0, 3).sort((a, b) => a - b), ns = xs.map(() => r.int(1, 6)), N = sum(ns);
        const m = F(sum(xs.map((x, i) => x * ns[i])), N), V = sub(F(sum(xs.map((x, i) => x * x * ns[i])), N), mul(m, m));
        return { q: `Valeurs ${M(xs.join('\\ ;\\ '))} d’effectifs respectifs ${M(ns.join('\\ ;\\ '))}. Calculer la moyenne et la variance (valeurs exactes), puis l’écart type arrondi au centième.`, a: M(`\\bar{x}=${numTex(m)},\\ V=${numTex(V)},\\ \\sigma\\approx ${roundTex(Math.sqrt(val(V)), 2)}`), s: M('V=\\dfrac{\\sum n_ix_i^{2}}{N}-\\bar{x}^{2}'),
          ok: () => near(val(V), xs.reduce((s, x, i) => s + ns[i] * (x - val(m)) ** 2, 0) / N) };
      }
      const m = F(r.int(50, 180), 10), sd = F(r.int(5, 40), 10), k = r.pick([F(2), F(3), F(-1), F(1, 2), F(-2), F(3, 2)]), c = F(r.int(-20, 20));
      const m2 = add(mul(k, m), c), sd2 = mul(F(Math.abs(k.n), k.d), sd);
      const kT = k.d === 1 ? par(k.n) : `\\left(${fracTex(k)}\\right)`;
      return { q: `Une série a pour moyenne ${M(numTex(m))} et pour écart type ${M(numTex(sd))}. On remplace chaque valeur ${M('x_i')} par ${M(`y_i=${k.d === 1 ? (k.n === -1 ? '-' : k.n) : fracTex(k)}x_i${c.n ? sgn(c.n) : ''}`)}. Donner la moyenne, l’écart type et la variance de la nouvelle série.`,
        a: M(`\\bar{y}=${kT}\\times ${numTex(m)}${c.n ? sgn(c.n) : ''}=${numTex(m2)},\\ \\sigma_y=${numTex(F(Math.abs(k.n), k.d))}\\times ${numTex(sd)}=${numTex(sd2)},\\ V_y=${numTex(mul(sd2, sd2))}`), s: 'Ajouter une constante ne change pas l’écart type ; multiplier par k le multiplie par |k|.',
        ok: () => { const xs = [val(m) - val(sd), val(m) + val(sd)], ys = xs.map((x) => val(k) * x + val(c)), my = (ys[0] + ys[1]) / 2, sy = Math.sqrt(((ys[0] - my) ** 2 + (ys[1] - my) ** 2) / 2); return near(my, val(m2)) && near(sy, val(sd2)); } };
    } },
  { id: 's-mean-update', cls: C, chapter: 'seconde-07', domain: 'stats-proba', skill: 'Moyenne après ajout, retrait ou regroupement', fast: true,
    make(r, level) {
      if (level < 3) {
        const N = r.int(5, 30), m = F(r.int(80, 160), 10), a = r.int(2, 20), add1 = level === 1, nm = add1 ? div(add(mul(F(N), m), F(a)), F(N + 1)) : div(sub(mul(F(N), m), F(a)), F(N - 1));
        return { q: `Une série de ${M(N)} valeurs a pour moyenne ${M(numTex(m))}. ${add1 ? `On ajoute la valeur ${M(a)}.` : `On retire une valeur égale à ${M(a)}.`} Calculer la nouvelle moyenne${decimals(nm) >= 0 && decimals(nm) <= 2 ? '' : ' (arrondie au centième)'}.`,
          a: M(`\\bar{x}'=\\dfrac{${N}\\times ${numTex(m)}${add1 ? '+' : '-'}${a}}{${add1 ? N + 1 : N - 1}}${dec(nm)}`), s: 'On reconstitue la somme exacte des valeurs.',
          ok: () => near(val(nm), (N * val(m) + (add1 ? a : -a)) / (N + (add1 ? 1 : -1))) };
      }
      const n1 = r.int(8, 35), n2 = r.int(8, 35), m1 = F(r.int(60, 180), 10), m2 = F(r.int(60, 180), 10), g = div(add(mul(F(n1), m1), mul(F(n2), m2)), F(n1 + n2));
      return { q: `Dans une classe, les ${M(n1)} élèves du groupe A ont ${M(numTex(m1))} de moyenne et les ${M(n2)} élèves du groupe B ont ${M(numTex(m2))}. Quelle est la moyenne de la classe ?`, a: M(`\\dfrac{${n1}\\times ${numTex(m1)}+${n2}\\times ${numTex(m2)}}{${n1 + n2}}${dec(g)}`), s: 'Ce n’est pas la moyenne des deux moyennes quand les effectifs diffèrent.',
        ok: () => near(val(g), (n1 * val(m1) + n2 * val(m2)) / (n1 + n2)) };
    } },
];
