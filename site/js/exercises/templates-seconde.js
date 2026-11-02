// Seconde templates. Each make(r, level) returns {q, a, s?, ok}: statement, answer, optional solution line,
// and ok() recomputing the answer by another route (checked by tests/exercise-bank.test.mjs).
// Chapters are the ids of content/data/manifest.json; the level scale is 1 (routine), 2 (standard), 3 (demanding).
import { F, add, sub, mul, div, val, eq, M, R, fracTex, numTex, roundTex, polyTex, evalPoly, mulPoly, sgn, par, gcd, isPrime, interval, sameOnGrid, decimals } from './engine.js';

const C = 'seconde';
const expo = (list) => { const m = new Map(); list.forEach((p) => m.set(p, (m.get(p) || 0) + 1)); return [...m].sort((a, b) => a[0] - b[0]).map(([p, e]) => (e === 1 ? `${p}` : `${p}^{${e}}`)).join('\\times '); };
const factor = (n) => { const out = []; for (let p = 2; p * p <= n; p++) while (n % p === 0) { out.push(p); n /= p; } if (n > 1) out.push(n); return out; };
const decOrFrac = (f) => numTex(f);

export const seconde = [
  { id: 's-prime-factors', cls: C, chapter: 'seconde-01', domain: 'nombres', skill: 'Décomposer en facteurs premiers', fast: true,
    make(r, level) {
      const pool = level === 1 ? [2, 3, 5, 7] : level === 2 ? [2, 3, 5, 7, 11, 13] : [2, 3, 5, 7, 11, 13, 17, 19];
      const max = level === 1 ? 1000 : level === 2 ? 5000 : 30000;
      let n;
      do { const k = r.int(level === 1 ? 2 : 3, level === 1 ? 6 : level === 3 ? 6 : 5); n = 1; for (let i = 0; i < k; i++) n *= r.pick(pool); } while (n > max || n < 12 || isPrime(n));
      const f = factor(n);
      return { q: `Décomposer ${M(n)} en produit de facteurs premiers.`, a: M(`${n}=${expo(f)}`),
        ok: () => f.reduce((x, y) => x * y, 1) === n && f.every(isPrime) };
    } },
  { id: 's-pgcd', cls: C, chapter: 'seconde-01', domain: 'nombres', skill: 'PGCD et fraction irréductible', fast: true,
    make(r, level) {
      const g = level === 1 ? r.int(2, 6) : r.int(3, 15);
      let m, n;
      do { m = r.int(2, level === 1 ? 9 : 14); n = r.int(2, level === 1 ? 9 : 14); } while (m === n || gcd(m, n) !== 1);
      const a = g * m, b = g * n;
      const eu = (x, y) => { while (y) { [x, y] = [y, x % y]; } return x; };
      const q = level < 3 ? `Calculer le PGCD de ${M(a)} et ${M(b)}.` : `Calculer le PGCD de ${M(a)} et ${M(b)}, puis rendre irréductible la fraction ${M(`\\dfrac{${a}}{${b}}`)}.`;
      return { q, a: level < 3 ? M(`\\text{PGCD}(${a},${b})=${g}`) : M(`\\text{PGCD}(${a},${b})=${g}\\ \\text{ et }\\ \\dfrac{${a}}{${b}}=\\dfrac{${m}}{${n}}`),
        ok: () => eu(a, b) === g && gcd(m, n) === 1 && a * n === b * m };
    } },
  { id: 's-interval-ops', cls: C, chapter: 'seconde-04', domain: 'nombres', skill: 'Intersection et réunion d’intervalles', fast: true,
    make(r, level) {
      const a = r.int(-8, 0), c = a + r.int(1, 3), b = c + r.int(1, 4), d = b + r.int(1, 4);
      const b1 = level === 1 ? [true, true, true, true] : [r.next() < .5, r.next() < .5, r.next() < .5, r.next() < .5];
      const [l1, h1, l2, h2] = b1;
      const I = interval(a, b, l1, h1), J = interval(c, d, l2, h2);
      return { q: `Soit ${M(`I=${I}`)} et ${M(`J=${J}`)}. Écrire ${M('I\\cap J')} et ${M('I\\cup J')} sous forme d’intervalles.`,
        a: M(`I\\cap J=${interval(c, b, l2, h1)}\\ \\text{ et }\\ I\\cup J=${interval(a, d, l1, h2)}`),
        ok: () => { const inI = (x) => (x > a || (x === a && l1)) && (x < b || (x === b && h1)); const inJ = (x) => (x > c || (x === c && l2)) && (x < d || (x === d && h2)); const inter = (x) => (x > c || (x === c && l2)) && (x < b || (x === b && h1)); const uni = (x) => (x > a || (x === a && l1)) && (x < d || (x === d && h2)); for (let x = a - 1; x <= d + 1; x += 0.5) { if ((inI(x) && inJ(x)) !== inter(x)) return false; if ((inI(x) || inJ(x)) !== uni(x)) return false; } return true; } };
    } },
  { id: 's-vec-coords', cls: C, chapter: 'seconde-02', domain: 'geometrie', skill: 'Coordonnées de vecteurs et de points', fast: true,
    make(r, level) {
      let A, B, Cc;
      do { A = [r.int(-6, 6), r.int(-6, 6)]; B = [r.int(-6, 6), r.int(-6, 6)]; Cc = [r.int(-6, 6), r.int(-6, 6)]; } while ((B[0] - A[0]) * (Cc[1] - A[1]) - (B[1] - A[1]) * (Cc[0] - A[0]) === 0);
      const pt = (p) => `(${p[0]}\\,;\\,${p[1]})`;
      if (level === 1) return { q: `Dans un repère, ${M(`A${pt(A)}`)} et ${M(`B${pt(B)}`)}. Calculer les coordonnées de ${M('\\overrightarrow{AB}')}.`, a: M(`\\overrightarrow{AB}\\begin{pmatrix}${B[0] - A[0]}\\\\${B[1] - A[1]}\\end{pmatrix}`), ok: () => B[0] - A[0] === B[0] + -A[0] };
      if (level === 2) { const I = [F(A[0] + B[0], 2), F(A[1] + B[1], 2)]; return { q: `Dans un repère, ${M(`A${pt(A)}`)} et ${M(`B${pt(B)}`)}. Calculer les coordonnées du milieu ${M('I')} de ${M('[AB]')}.`, a: M(`I(${decOrFrac(I[0])}\\,;\\,${decOrFrac(I[1])})`), ok: () => val(I[0]) * 2 === A[0] + B[0] }; }
      const D = [A[0] + Cc[0] - B[0], A[1] + Cc[1] - B[1]];
      return { q: `Dans un repère, ${M(`A${pt(A)}`)}, ${M(`B${pt(B)}`)} et ${M(`C${pt(Cc)}`)}. Déterminer les coordonnées du point ${M('D')} tel que ${M('ABCD')} soit un parallélogramme.`, a: M(`D${pt(D)}`), s: M('\\overrightarrow{AB}=\\overrightarrow{DC}'),
        ok: () => B[0] - A[0] === Cc[0] - D[0] && B[1] - A[1] === Cc[1] - D[1] };
    } },
  { id: 's-line-two-points', cls: C, chapter: 'seconde-03', domain: 'geometrie', skill: 'Équation réduite d’une droite', fast: false,
    make(r, level) {
      const num = level === 1 ? r.nz(-4, 4) : r.nz(-5, 5), den = level === 1 ? 1 : r.pick([2, 3]);
      const p = r.int(-5, 5);
      const i = r.int(-2, 1), j = i + r.int(1, 3);
      const x1 = den * i, x2 = den * j;
      const y1 = num * i + p, y2 = num * j + p;
      const m = F(num, den);
      const body = `y=${m.d === 1 ? (m.n === 1 ? '' : m.n === -1 ? '-' : m.n) : `${m.n < 0 ? '-' : ''}\\dfrac{${Math.abs(m.n)}}{${m.d}}`}x${p === 0 ? '' : sgn(p)}`;
      return { q: `Déterminer l’équation réduite de la droite ${M('(AB)')} avec ${M(`A(${x1}\\,;\\,${y1})`)} et ${M(`B(${x2}\\,;\\,${y2})`)}.`, a: M(body),
        s: M(`m=\\dfrac{${y2}-${par(y1)}}{${x2}-${par(x1)}}=${fracTex(m)}`),
        ok: () => eq(div(F(y2 - y1), F(x2 - x1)), m) && eq(add(mul(m, F(x1)), F(p)), F(y1)) };
    } },
  { id: 's-line-intersect', cls: C, chapter: 'seconde-12', domain: 'geometrie', skill: 'Point d’intersection de deux droites', fast: false,
    make(r, level) {
      const x0 = r.int(-5, 5), y0 = r.int(-5, 5);
      const m1 = r.nz(-3, 3); let m2; do { m2 = r.nz(-3, 3); } while (m2 === m1);
      const p1 = y0 - m1 * x0, p2 = y0 - m2 * x0;
      return { q: `Déterminer les coordonnées du point d’intersection des droites ${M(`d_1:\\ y=${polyTex([m1, p1])}`)} et ${M(`d_2:\\ y=${polyTex([m2, p2])}`)}.`, a: M(`(${x0}\\,;\\,${y0})`),
        s: M(`${polyTex([m1, p1])}=${polyTex([m2, p2])}`), ok: () => m1 * x0 + p1 === y0 && m2 * x0 + p2 === y0 };
    } },
  { id: 's-func-evaluate', cls: C, chapter: 'seconde-06', domain: 'fonctions', skill: 'Image, antécédent, appartenance au graphe', fast: true,
    make(r, level) {
      if (level === 1) { const a = r.nz(-5, 5), b = r.int(-9, 9), k = r.int(-5, 5); return { q: `Soit ${M(`f(x)=${polyTex([a, b])}`)}. Calculer ${M(`f(${k})`)}.`, a: M(`f(${k})=${a * k + b}`), ok: () => evalPoly([a, b], k) === a * k + b }; }
      if (level === 2) { const a = r.nz(-5, 5), b = r.int(-9, 9), x0 = r.int(-6, 6), v = a * x0 + b; return { q: `Soit ${M(`f(x)=${polyTex([a, b])}`)}. Déterminer l’antécédent de ${M(v)} par ${M('f')}.`, a: M(`${x0}`), s: M(`${polyTex([a, b])}=${v}`), ok: () => evalPoly([a, b], x0) === v }; }
      const a = r.nz(-3, 3), b = r.int(-4, 4), c = r.int(-6, 6), k = -r.int(1, 4), y = a * k * k + b * k + c, off = r.pick([0, 0, 1, -1, 2]);
      return { q: `Soit ${M(`g(x)=${polyTex([a, b, c])}`)}. Le point ${M(`A(${k}\\,;\\,${y + off})`)} appartient-il à la courbe de ${M('g')} ?`, a: off === 0 ? `Oui : ${M(`g(${k})=${y}`)}.` : `Non : ${M(`g(${k})=${y}`)} et ${M(`${y}\\neq ${y + off}`)}.`, ok: () => evalPoly([a, b, c], k) === y };
    } },
  { id: 's-solve', cls: C, chapter: 'seconde-08', domain: 'algebre', skill: 'Résoudre une équation du premier degré', fast: true,
    make(r, level) {
      if (level === 1) { const a = r.nz(-6, 6), x0 = r.int(-8, 8), b = r.int(-9, 9), c = a * x0 + b; return { q: `Résoudre dans ${M(R)} : ${M(`${polyTex([a, b])}=${c}`)}.`, a: M(`S=\\{${x0}\\}`), ok: () => a * x0 + b === c }; }
      let a, c; do { a = r.nz(-6, 6); c = r.nz(-6, 6); } while (a === c);
      const x0 = r.int(-8, 8), b = r.int(-9, 9), d = a * x0 + b - c * x0;
      if (level === 2) return { q: `Résoudre dans ${M(R)} : ${M(`${polyTex([a, b])}=${polyTex([c, d])}`)}.`, a: M(`S=\\{${x0}\\}`), ok: () => a * x0 + b === c * x0 + d };
      const sol = F(d - b, a - c);
      return { q: `Résoudre dans ${M(R)} : ${M(`${polyTex([a, b])}=${polyTex([c, d])}`)}.`, a: M(`S=\\left\\{${fracTex(sol)}\\right\\}`), ok: () => eq(add(mul(F(a), sol), F(b)), add(mul(F(c), sol), F(d))) };
    } },
  { id: 's-inequation', cls: C, chapter: 'seconde-08', domain: 'algebre', skill: 'Résoudre une inéquation du premier degré', fast: true,
    make(r, level) {
      let a, c; do { a = r.nz(-5, 5); c = r.nz(-5, 5); } while (a === c);
      const b = r.int(-9, 9), d = r.int(-9, 9);
      const strict = r.next() < .5, rel = strict ? '<' : '\\leqslant ';
      const x0 = F(d - b, a - c), up = a - c > 0; // a x + b < c x + d  <=>  (a-c) x < d-b
      const set = up ? interval('-\\infty', fracTex(x0), false, !strict) : interval(fracTex(x0), '+\\infty', !strict, false);
      return { q: `Résoudre dans ${M(R)} : ${M(`${polyTex([a, b])}${rel}${polyTex([c, d])}`)}.`, a: M(`S=${set}`), s: a - c < 0 ? 'On change le sens de l’inégalité en divisant par un nombre négatif.' : '',
        ok: () => { for (let k = -40; k <= 40; k++) { const x = k / 2; const lhs = a * x + b, rhs = c * x + d; const holds = strict ? lhs < rhs : lhs <= rhs; const inS = up ? (strict ? x < val(x0) : x <= val(x0)) : (strict ? x > val(x0) : x >= val(x0)); if (holds !== inS) return false; } return true; } };
    } },
  { id: 's-expand', cls: C, chapter: 'seconde-08', domain: 'algebre', skill: 'Développer et réduire', fast: true,
    make(r, level) {
      let p, q, text;
      if (level === 1) { const k = r.nz(-5, 5), a = r.nz(-4, 4), b = r.nz(-6, 6); p = [k]; q = [a, b]; text = `${k < 0 ? `-${-k}` : k}(${polyTex(q)})`; text = `${par(k)}(${polyTex(q)})`; }
      else if (level === 2) { const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-4, 4), d = r.nz(-6, 6); p = [a, b]; q = [c, d]; text = `(${polyTex(p)})(${polyTex(q)})`; }
      else { const a = r.int(1, 6), b = r.nz(-9, 9); if (r.next() < .5) { p = [a, b]; q = [a, b]; text = `(${polyTex(p)})^{2}`; } else { p = [a, b]; q = [a, -b]; text = `(${polyTex(p)})(${polyTex(q)})`; } }
      const out = mulPoly(p, q);
      return { q: `Développer et réduire : ${M(text)}.`, a: M(polyTex(out)), ok: () => sameOnGrid((x) => evalPoly(p, x) * evalPoly(q, x), (x) => evalPoly(out, x)) };
    } },
  { id: 's-factor', cls: C, chapter: 'seconde-08', domain: 'algebre', skill: 'Factoriser', fast: true,
    make(r, level) {
      if (level === 1) { const k = r.int(2, 6), a = r.nz(-5, 5), b = r.nz(-7, 7); const e = [k * a, k * b]; return { q: `Factoriser : ${M(polyTex(e))}.`, a: M(`${k}(${polyTex([a, b])})`), ok: () => sameOnGrid((x) => evalPoly(e, x), (x) => k * evalPoly([a, b], x)) }; }
      if (level === 2) { const a = r.int(1, 9), b = r.int(1, 12); const e = [a * a, 0, -b * b]; return { q: `Factoriser : ${M(polyTex(e))}.`, a: M(`(${polyTex([a, -b])})(${polyTex([a, b])})`), ok: () => sameOnGrid((x) => evalPoly(e, x), (x) => evalPoly([a, -b], x) * evalPoly([a, b], x)) }; }
      const a = r.int(1, 7), b = r.nz(-12, 12), e = [a * a, 2 * a * b, b * b];
      return { q: `Factoriser : ${M(polyTex(e))}.`, a: M(`(${polyTex([a, b])})^{2}`), ok: () => sameOnGrid((x) => evalPoly(e, x), (x) => evalPoly([a, b], x) ** 2) };
    } },
  { id: 's-percent', cls: C, chapter: 'seconde-09', domain: 'nombres', skill: 'Évolutions en pourcentage', fast: true,
    make(r, level) {
      if (level === 1) { const p = 20 * r.int(2, 15), t = r.pick([5, 10, 20, 25, 50]) * r.sign(); const res = F(p * (100 + t), 100); return { q: `Un article coûte ${M(`${p}\\ \\text{€}`)}. Son prix ${t > 0 ? 'augmente' : 'baisse'} de ${M(`${Math.abs(t)}\\,\\%`)}. Calculer son nouveau prix.`, a: M(`${numTex(res)}\\ \\text{€}`), ok: () => Math.abs(val(res) - p * (1 + t / 100)) < 1e-9 }; }
      if (level === 2) { const t1 = r.pick([5, 10, 15, 20, 25, 30, 40, 50]) * r.sign(), t2 = r.pick([5, 10, 15, 20, 25, 30, 40, 50]) * r.sign(); const cm = mul(F(100 + t1, 100), F(100 + t2, 100)); const rate = mul(sub(cm, F(1)), F(100)); return { q: `Une quantité subit une évolution de ${M(`${t1 > 0 ? '+' : '-'}${Math.abs(t1)}\\,\\%`)} puis de ${M(`${t2 > 0 ? '+' : '-'}${Math.abs(t2)}\\,\\%`)}. Déterminer le taux d’évolution global.`, a: M(`CM=${numTex(cm)}\\ \\text{ donc }\\ ${val(rate) >= 0 ? '+' : ''}${numTex(rate)}\\,\\%`), ok: () => Math.abs(val(cm) - (1 + t1 / 100) * (1 + t2 / 100)) < 1e-12 }; }
      const up = r.next() < 0.6, t = up ? r.int(1, 150) : r.int(1, 80), cm = F(up ? 100 + t : 100 - t, 100);
      const back = F(100 * t, up ? 100 + t : 100 - t), k = decimals(back), exact = k >= 0 && k <= 2;
      const shown = exact ? `${numTex(back)}\\,\\%` : `\\approx ${roundTex(val(back), 1)}\\,\\%`;
      return { q: `Après une ${up ? 'hausse' : 'baisse'} de ${M(`${t}\\,\\%`)}, de quel pourcentage faut-il ${up ? 'baisser' : 'augmenter'} pour revenir à la valeur initiale ?`, a: M(`\\text{${up ? 'baisse' : 'hausse'} de }${shown}`), s: M(`CM=\\dfrac{1}{${numTex(cm)}}`) + (exact ? '' : ', valeur arrondie au dixième'),
        ok: () => Math.abs(val(cm) * (1 + (up ? -1 : 1) * val(back) / 100) - 1) < 1e-12 };
    } },
  { id: 's-stats', cls: C, chapter: 'seconde-07', domain: 'stats-proba', skill: 'Moyenne, médiane, quartiles', fast: false,
    make(r, level) {
      const n = level === 1 ? r.pick([5, 6]) : r.pick([7, 8, 9, 10]);
      let v; do { v = Array.from({ length: n }, () => r.int(3, 19)); const s = v.reduce((x, y) => x + y, 0); v[n - 1] += (n - (s % n)) % n; } while (v[n - 1] > 24 || v[n - 1] < 1);
      const sorted = [...v].sort((x, y) => x - y), mean = v.reduce((x, y) => x + y, 0) / n;
      const med = n % 2 ? F(sorted[(n - 1) / 2]) : F(sorted[n / 2 - 1] + sorted[n / 2], 2);
      const q1 = sorted[Math.ceil(n / 4) - 1], q3 = sorted[Math.ceil((3 * n) / 4) - 1];
      const list = v.join('\\ ;\\ ');
      if (level === 1) return { q: `Série : ${M(list)}. Calculer la moyenne et l’étendue.`, a: M(`\\bar{x}=${mean}\\ \\text{ et étendue }=${sorted[n - 1] - sorted[0]}`), ok: () => mean * n === v.reduce((x, y) => x + y, 0) };
      if (level === 2) return { q: `Série : ${M(list)}. Calculer la moyenne et la médiane.`, a: M(`\\bar{x}=${mean}\\ \\text{ et médiane }=${numTex(med)}`), ok: () => Math.abs(val(med) - (sorted[Math.floor((n - 1) / 2)] + sorted[Math.ceil((n - 1) / 2)]) / 2) < 1e-12 };
      return { q: `Série : ${M(list)}. Déterminer la médiane, les quartiles ${M('Q_1')} et ${M('Q_3')} puis l’écart interquartile.`, a: M(`\\text{Me}=${numTex(med)},\\ Q_1=${q1},\\ Q_3=${q3},\\ Q_3-Q_1=${q3 - q1}`), s: 'Q₁ est la plus petite valeur telle qu’au moins 25 % des données lui soient inférieures ou égales (idem pour Q₃ avec 75 %).',
        ok: () => sorted.filter((x) => x <= q1).length >= n / 4 && sorted.filter((x) => x < q1).length < n / 4 && sorted.filter((x) => x <= q3).length >= (3 * n) / 4 && sorted.filter((x) => x < q3).length < (3 * n) / 4 };
    } },
  { id: 's-min-square', cls: C, chapter: 'seconde-10', domain: 'fonctions', skill: 'Forme canonique et minimum', fast: false,
    make(r, level) {
      const al = r.nz(-5, 5), be = r.int(-9, 9), b = -2 * al, c = al * al + be;
      return { q: `Soit ${M(`f(x)=${polyTex([1, b, c])}`)}. Montrer que ${M(`f(x)=(x${sgn(-al)})^{2}${be === 0 ? '' : sgn(be)}`)}, puis en déduire le minimum de ${M('f')} sur ${M(R)} et la valeur où il est atteint.`,
        a: M(`f(x)=(x${sgn(-al)})^{2}${be === 0 ? '' : sgn(be)}\\ ;\\ \\text{minimum }${be}\\ \\text{atteint en }x=${al}`),
        ok: () => sameOnGrid((x) => evalPoly([1, b, c], x), (x) => (x - al) ** 2 + be) };
    } },
  { id: 's-proba-tree', cls: C, chapter: 'seconde-14', domain: 'stats-proba', skill: 'Arbre pondéré et probabilités', fast: false,
    make(r, level) {
      const p = r.int(1, 9), q = r.int(1, 9), s = r.int(1, 9);
      const pa = F(p, 10), pb_a = F(q, 10), pb_na = F(s, 10);
      const inter = mul(pa, pb_a), tot = add(inter, mul(sub(F(1), pa), pb_na));
      const given = `${M(`P(A)=${numTex(pa)}`)}, ${M(`P_A(B)=${numTex(pb_a)}`)} et ${M(`P_{\\overline{A}}(B)=${numTex(pb_na)}`)}`;
      if (level < 3) return { q: `On donne ${given}. Calculer ${M('P(A\\cap B)')}.`, a: M(`P(A\\cap B)=${numTex(pa)}\\times ${numTex(pb_a)}=${numTex(inter)}`), ok: () => Math.abs(val(inter) - (p * q) / 100) < 1e-12 };
      return { q: `On donne ${given}. Calculer ${M('P(B)')} avec la formule des probabilités totales.`, a: M(`P(B)=${numTex(inter)}+${numTex(sub(F(1), pa))}\\times ${numTex(pb_na)}=${numTex(tot)}`), ok: () => Math.abs(val(tot) - (p * q + (10 - p) * s) / 100) < 1e-12 };
    } },
  { id: 's-two-way', cls: C, chapter: 'seconde-11', domain: 'stats-proba', skill: 'Tableau croisé : fréquences marginales et conditionnelles', fast: false,
    make(r, level) {
      // two qualitative variables on one population; a, b / c, d are the four counts
      const [who, rows, cols] = r.pick([
        ['élèves d’un lycée', ['filles', 'garçons'], ['demi-pensionnaires', 'externes']],
        ['clients d’une salle de sport', ['clients de moins de 30 ans', 'clients de 30 ans ou plus'], ['abonnés', 'non-abonnés']],
        ['salariés d’une entreprise', ['salariés à temps plein', 'salariés à temps partiel'], ['télétravailleurs', 'non-télétravailleurs']],
        ['spectateurs d’un festival', ['spectateurs venus en train', 'spectateurs venus en voiture'], ['résidents de la région', 'visiteurs extérieurs']],
      ]);
      const a = r.int(12, 95), b = r.int(12, 95), c = r.int(12, 95), d = r.int(12, 95), N = a + b + c + d;
      const freq = (n, m) => { const f = F(n, m), k = decimals(f), p = mul(f, F(100)); return `\\dfrac{${n}}{${m}}${k >= 0 && k <= 3 ? `=${numTex(p)}\\,\\%` : `\\approx ${roundTex(val(p), 1)}\\,\\%`}`; };
      const cap = (s) => s[0].toUpperCase() + s.slice(1);
      const table = `\\begin{array}{l|cc|c}&\\text{${cols[0]}}&\\text{${cols[1]}}&\\text{Total}\\\\\\hline\\text{${cap(rows[0])}}&${a}&${b}&${a + b}\\\\\\text{${cap(rows[1])}}&${c}&${d}&${c + d}\\\\\\hline\\text{Total}&${a + c}&${b + d}&${N}\\end{array}`;
      const intro = `On a relevé deux caractères chez ${N} ${who} : ${M(table)}`;
      const kind = level === 1 ? r.pick(['marginal', 'joint']) : level === 2 ? 'cond' : 'compare';
      if (kind === 'marginal') return { q: `${intro} Quelle est la fréquence des ${cols[0]} dans l’ensemble ?`, a: M(freq(a + c, N)), ok: () => a + c + b + d === N };
      if (kind === 'joint') return { q: `${intro} Quelle est la fréquence des ${rows[1]} qui sont ${cols[1]}, parmi l’ensemble ?`, a: M(freq(d, N)), ok: () => d <= N && a + b + c + d === N };
      if (kind === 'cond') { const i = r.int(0, 1), n = i === 0 ? a : c, m = i === 0 ? a + b : c + d; return { q: `${intro} Parmi les ${rows[i]}, quelle est la fréquence des ${cols[0]} ?`, a: M(freq(n, m)), s: `On divise par l’effectif des ${rows[i]}, pas par l’effectif total.`, ok: () => n <= m && m < N }; }
      const f1 = a / (a + b), f2 = c / (c + d), more = f1 > f2 ? 0 : 1;
      if (Math.abs(f1 - f2) < 0.005) return this.make(r, level);
      return { q: `${intro} Les ${cols[0]} sont-ils proportionnellement plus nombreux chez les ${rows[0]} ou chez les ${rows[1]} ? Justifier.`,
        a: `${M(`f_{1}=${freq(a, a + b)}`)} chez les ${rows[0]} et ${M(`f_{2}=${freq(c, c + d)}`)} chez les ${rows[1]} : ils sont proportionnellement plus nombreux chez les ${rows[more]}.`,
        ok: () => (a * (c + d) > c * (a + b)) === (more === 0) };
    } },
];
