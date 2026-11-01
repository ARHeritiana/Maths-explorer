// Terminale (spécialité) templates; same contract as templates-seconde.js. Chapter ids: content/data/manifest.json.
// Where a template has no routine version, `levels` lists the levels it supports.
import { F, add, sub, mul, div, val, eq, M, R, fracTex, numTex, roundTex, polyTex, evalPoly, sgn, par, gcd, binom, sum, pow, interval } from './engine.js';
import { piTex } from './templates-premiere.js';

const C = 'terminale';
const pw = (t, k) => (k === 1 ? t : `${t}^{${k}}`);   // no exponent 1
const nd = (f, x) => (f(x + 1e-6) - f(x - 1e-6)) / 2e-6;
const near = (a, b, tol = 1e-4) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
// a x + b y + c z + d with the usual conventions for coefficients 0 and 1
const lin3 = (a, b, c, d) => { let s = ''; [[a, 'x'], [b, 'y'], [c, 'z']].forEach(([k, v]) => { if (k === 0) return; s += (k < 0 ? '-' : (s ? '+' : '')) + (Math.abs(k) === 1 ? '' : Math.abs(k)) + v; }); return s + (d === 0 ? '' : sgn(d)); };
const coef = (k) => (k === 1 ? '' : k === -1 ? '-' : `${k}`);
const simpson = (f, a, b, n = 2000) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return (s * h) / 3; };

const VALUES = [['1', 1], ['0', 0], ['-1', -1], ['\\dfrac{1}{2}', 0.5], ['-\\dfrac{1}{2}', -0.5], ['\\dfrac{\\sqrt{2}}{2}', Math.SQRT1_2], ['-\\dfrac{\\sqrt{2}}{2}', -Math.SQRT1_2], ['\\dfrac{\\sqrt{3}}{2}', Math.sqrt(3) / 2], ['-\\dfrac{\\sqrt{3}}{2}', -Math.sqrt(3) / 2]];

export const terminale = [
  { id: 't-seq-limit', cls: C, chapter: 'terminale-03', domain: 'suites', skill: 'Limite d’une suite', fast: true,
    make(r, level) {
      if (level === 1) { const a = r.nz(-6, 6), b = r.int(-5, 5), c = r.nz(-5, 5), d = r.int(1, 5) * Math.sign(c); const u = (n) => (a * n + b) / (c * n + d); const l = F(a, c); return { q: `Déterminer la limite de la suite ${M(`u_n=\\dfrac{${polyTex([a, b], 'n')}}{${polyTex([c, d], 'n')}}`)}.`, a: M(`\\lim_{n\\to+\\infty}u_n=${fracTex(l)}`), ok: () => near(u(1e7), val(l), 1e-5) }; }
      if (level === 2) { const a = r.nz(-5, 5), b = r.int(-4, 4), c = r.int(-3, 3), d = r.nz(-4, 4), type0 = r.pick(['eq', 'low', 'high']), e = r.int(1, 6) * Math.sign(d); const type = type0; let num, den, lim, f; if (type === 'eq') { num = [a, b, c]; den = [d, 0, e]; f = (n) => (a * n * n + b * n + c) / (d * n * n + e); lim = fracTex(F(a, d)); } else if (type === 'low') { num = [a, b]; den = [d, 0, e]; f = (n) => (a * n + b) / (d * n * n + e); lim = '0'; } else { num = [a, b, c]; den = [d, e]; f = (n) => (a * n * n + b * n + c) / (d * n + e); lim = (a * d > 0 ? '+' : '-') + '\\infty'; }
        return { q: `Déterminer la limite de la suite ${M(`u_n=\\dfrac{${polyTex(num, 'n')}}{${polyTex(den, 'n')}}`)}.`, a: M(`\\lim_{n\\to+\\infty}u_n=${lim}`), ok: () => (lim.includes('infty') ? (lim[0] === '+' ? f(1e6) > 1e4 : f(1e6) < -1e4) : near(f(1e7), lim === '0' ? 0 : val(F(a, d)), 1e-4)) }; }
      const a = r.nz(-4, 4), b = r.int(-6, 6), qn = r.pick([[1, 2], [3, 4], [2, 3], [3, 1], [2, 1], [5, 2]]); const q = qn[0] / qn[1]; const qt = qn[1] === 1 ? `${qn[0]}` : `\\dfrac{${qn[0]}}{${qn[1]}}`;
      const lim = q < 1 ? `${b}` : (a > 0 ? '+' : '-') + '\\infty';
      return { q: `Déterminer la limite de ${M(`u_n=${a === 1 ? '' : a === -1 ? '-' : a}\\left(${qt}\\right)^{n}${b === 0 ? '' : sgn(b)}`)}.`, a: M(`\\lim_{n\\to+\\infty}u_n=${lim}`), s: M(`${qt}${q < 1 ? '<1' : '>1'}`), ok: () => { const x = a * q ** 400 + b; return q < 1 ? near(x, b, 1e-9) : (a > 0 ? x > 1e30 : x < -1e30); } };
    } },
  { id: 't-fixed-seq', cls: C, chapter: 'terminale-01', domain: 'suites', skill: 'Suite arithmético-géométrique', fast: false,
    make(r, level) {
      const [num, den] = r.pick([[1, 2], [1, 3], [2, 3], [3, 4], [1, 4]]); const m = r.nz(-4, 4); const l = m * den, b = m * (den - num);
      const u0 = l + den * r.nz(-3, 3);
      const aTex = `\\dfrac{${num}}{${den}}`;
      const u = (n) => { let x = u0; for (let i = 0; i < n; i++) x = (num / den) * x + b; return x; };
      return { q: `La suite ${M('(u_n)')} est définie par ${M(`u_0=${u0}`)} et ${M(`u_{n+1}=${aTex}u_n${b === 0 ? '' : sgn(b)}`)}. Déterminer ${M('\\ell')} tel que ${M('\\ell=' + aTex + '\\ell' + (b === 0 ? '' : sgn(b)))}, puis exprimer ${M('u_n')} en fonction de ${M('n')} (on pourra poser ${M('v_n=u_n-\\ell')}) et calculer la limite de ${M('(u_n)')}.`,
        a: M(`\\ell=${l}\\ ;\\ u_n=${l}${sgn(u0 - l)}\\left(${aTex}\\right)^{n}\\ ;\\ \\lim u_n=${l}`), ok: () => [0, 1, 5, 12].every((n) => near(u(n), l + (u0 - l) * (num / den) ** n, 1e-9)) && near((num / den) * l + b, l, 1e-12) };
    } },
  { id: 't-func-limit', cls: C, chapter: 'terminale-04', domain: 'analyse', skill: 'Limite d’une fonction', fast: true,
    make(r, level) {
      if (level === 1) { const a = r.nz(-5, 5), b = r.int(-5, 5), c = r.int(-5, 5), d = r.nz(-5, 5), e = r.int(-4, 4), g = r.int(-4, 4); const f = (x) => (a * x * x + b * x + c) / (d * x * x + e * x + g + (e === 0 && g === 0 ? 1 : 0)); const gg = e === 0 && g === 0 ? 1 : g; return { q: `Déterminer ${M('\\lim_{x\\to+\\infty}f(x)')} pour ${M(`f(x)=\\dfrac{${polyTex([a, b, c])}}{${polyTex([d, e, gg])}}`)}.`, a: M(`\\lim_{x\\to+\\infty}f(x)=${fracTex(F(a, d))}`), ok: () => near(f(1e7), a / d, 1e-4) }; }
      if (level === 2) { const x0 = r.int(-4, 4); let a, b; do { a = r.nz(-4, 4); b = r.int(-6, 6); } while (a * x0 + b === 0); const k = a * x0 + b, right = r.next() < .5; const lim = (k > 0) === right ? '+\\infty' : '-\\infty'; const f = (x) => (a * x + b) / (x - x0);
        return { q: `Déterminer ${M(`\\lim_{x\\to ${x0}^{${right ? '+' : '-'}}}f(x)`)} pour ${M(`f(x)=\\dfrac{${polyTex([a, b])}}{${polyTex([1, -x0])}}`)}.`, a: M(`\\lim_{x\\to ${x0}^{${right ? '+' : '-'}}}f(x)=${lim}`), s: M(`${a}\\times ${par(x0)}${sgn(b)}=${k}`),
        ok: () => { const e = right ? 1e-7 : -1e-7; return lim[0] === '+' ? f(x0 + e) > 1e5 : f(x0 + e) < -1e5; } }; }
      const deg = r.pick([2, 3, 4]), a = r.nz(-4, 4), b = r.int(-5, 5), c = r.int(-5, 5); const co = Array(deg + 1).fill(0); co[0] = a; co[1] = b; co[2] = c; const f = (x) => evalPoly(co, x);
      const lim = (deg % 2 === 0 ? a > 0 : a < 0) ? '+\\infty' : '-\\infty';
      return { q: `Déterminer ${M('\\lim_{x\\to-\\infty}f(x)')} pour ${M(`f(x)=${polyTex(co)}`)}.`, a: M(`\\lim_{x\\to-\\infty}f(x)=${lim}`), s: 'On factorise par le terme de plus haut degré.', ok: () => (lim[0] === '+' ? f(-1e4) > 1e4 : f(-1e4) < -1e4) };
    } },
  { id: 't-counting', cls: C, chapter: 'terminale-05', domain: 'stats-proba', skill: 'Dénombrement', fast: true,
    make(r, level) {
      if (level === 1) { const n = r.int(6, 12), k = r.int(2, 4); return { q: `Calculer ${M(`\\dbinom{${n}}{${k}}`)}.`, a: M(`\\dbinom{${n}}{${k}}=${binom(n, k)}`), ok: () => { let s = 1; for (let i = 0; i < k; i++) s = (s * (n - i)) / (i + 1); return Math.round(s) === binom(n, k) && binom(n, k) === binom(n, n - k); } }; }
      if (level === 2) { const f = r.int(4, 8), h = r.int(4, 8), k = r.int(3, 4), j = r.int(1, k - 1); return { q: `Un groupe compte ${M(f)} filles et ${M(h)} garçons. On choisit un comité de ${M(k)} personnes. Combien y a-t-il de comités comportant exactement ${M(j)} fille${j > 1 ? 's' : ''} ?`, a: M(`\\dbinom{${f}}{${j}}\\times\\dbinom{${h}}{${k - j}}=${binom(f, j) * binom(h, k - j)}`), ok: () => { const pas = (n, k) => (k === 0 || k === n ? 1 : k < 0 || k > n ? 0 : pas(n - 1, k - 1) + pas(n - 1, k)); return pas(f, j) * pas(h, k - j) === binom(f, j) * binom(h, k - j) && pas(f + h, k) === Array.from({ length: k + 1 }, (_, g) => pas(f, g) * pas(h, k - g)).reduce((x, y) => x + y, 0); } }; }
      const k = r.int(3, 5); return { q: `On tire simultanément ${M(k)} cartes dans un jeu de ${M(32)} cartes. Combien de tirages contiennent au moins un cœur (il y a ${M(8)} cœurs) ?`, a: M(`\\dbinom{32}{${k}}-\\dbinom{24}{${k}}=${binom(32, k) - binom(24, k)}`), ok: () => binom(32, k) - binom(24, k) === Array.from({ length: k }, (_, i) => i + 1).reduce((s, h) => s + (h <= 8 ? binom(8, h) * binom(24, k - h) : 0), 0) };
    } },
  { id: 't-ln-equation', cls: C, chapter: 'terminale-08', domain: 'analyse', skill: 'Équations avec logarithme népérien', fast: false,
    make(r, level) {
      if (level === 1) { const p = r.int(-4, 4), q = r.int(1, 12); return { q: `Résoudre dans ${M(R)} : ${M(`\\ln(${polyTex([1, p])})=\\ln(${q})`)}.`, a: M(`D=\\left]${-p}\\,;\\,+\\infty\\right[\\ ;\\ S=\\{${q - p}\\}`), ok: () => q - p > -p }; }
      for (;;) {
        const p = r.int(-3, 4), q = r.int(-3, 4), x1 = r.int(-4, 6), rr = (x1 + p) * (x1 + q);
        if (x1 + p <= 0 || x1 + q <= 0 || rr <= 0) continue;
        const x2 = -(p + q) - x1; if (x2 === x1) continue;
        const lo = -Math.min(p, q), valid = [x1, x2].filter((x) => x > lo).sort((a, b) => a - b);
        if (level === 3 && Math.abs(x1) + Math.abs(x2) < 5) continue;
        return { q: `Résoudre dans ${M(R)} : ${M(`\\ln(${polyTex([1, p])})+\\ln(${polyTex([1, q])})=\\ln(${rr})`)}.`, a: M(`D=\\left]${lo}\\,;\\,+\\infty\\right[\\ ;\\ S=\\{${valid.join('\\,;\\,')}\\}`), s: 'Une seule des deux racines de l’équation du second degré est dans le domaine de définition.',
          ok: () => valid.every((x) => near(Math.log(x + p) + Math.log(x + q), Math.log(rr), 1e-9)) && [x1, x2].filter((x) => !valid.includes(x)).every((x) => x <= lo) };
      }
    } },
  { id: 't-ln-deriv', cls: C, chapter: 'terminale-08', domain: 'analyse', skill: 'Dériver avec le logarithme', fast: true,
    make(r, level) {
      if (level === 1) { let a, b; do { a = r.nz(-4, 4); b = r.int(1, 8); } while (false); const f = (x) => Math.log(a * x + b); const x0 = a > 0 ? 1 : -(b / (2 * a)) * 0.5 + 0; return { q: `Calculer la dérivée de ${M(`f(x)=\\ln(${polyTex([a, b])})`)} sur l’intervalle où elle est définie.`, a: M(`f'(x)=\\dfrac{${a}}{${polyTex([a, b])}}`), ok: () => { const x = a > 0 ? 1 : (-b / a) - 0.5; return near(nd(f, x), a / (a * x + b), 1e-3); } }; }
      if (level === 2) { const a = r.int(1, 9); const f = (x) => a * x * Math.log(x) - a * x; return { q: `Calculer la dérivée de ${M(`f(x)=${coef(a)}x\\ln x-${coef(a)}x`)} sur ${M('\\left]0\\,;\\,+\\infty\\right[')}.`, a: M(`f'(x)=${coef(a)}\\ln x`), ok: () => near(nd(f, 2.5), a * Math.log(2.5), 1e-3) }; }
      const a = r.int(1, 14), f = (x) => Math.log(x * x + a);
      return { q: `Calculer la dérivée de ${M(`f(x)=\\ln(x^{2}+${a})`)} sur ${M(R)}.`, a: M(`f'(x)=\\dfrac{2x}{x^{2}+${a}}`), ok: () => near(nd(f, 1.7), (2 * 1.7) / (1.7 * 1.7 + a), 1e-3) };
    } },
  { id: 't-binomial', cls: C, chapter: 'terminale-07', domain: 'stats-proba', skill: 'Loi binomiale', fast: false,
    make(r, level) {
      const p = r.pick([F(1, 2), F(1, 3), F(1, 4), F(2, 3), F(1, 5), F(3, 4), F(2, 5), F(1, 6)]), n = level === 1 ? r.int(4, 14) : r.int(3, p.d > 4 ? 5 : 6), k = r.int(1, n - 1), qn = sub(F(1), p);
      const head = `Soit ${M('X')} suivant la loi binomiale ${M(`\\mathcal{B}(${n}\\,;\\,${fracTex(p)})`)}.`;
      if (level === 1) return { q: `${head} Calculer ${M('E(X)')} et ${M('V(X)')}.`, a: M(`E(X)=${n}\\times ${fracTex(p)}=${fracTex(mul(F(n), p))}\\ ;\\ V(X)=${n}\\times ${fracTex(p)}\\times ${fracTex(qn)}=${fracTex(mul(mul(F(n), p), qn))}`), ok: () => near(val(mul(F(n), p)), n * val(p), 1e-12) };
      const pk = mul(mul(F(binom(n, k)), pow(p, k)), pow(qn, n - k)), atLeast = sub(F(1), pow(qn, n));
      if (level === 2) return { q: `${head} Calculer ${M(`P(X=${k})`)}.`, a: M(`P(X=${k})=\\dbinom{${n}}{${k}}${pw(`\\left(${fracTex(p)}\\right)`, k)}${pw(`\\left(${fracTex(qn)}\\right)`, n - k)}=${fracTex(pk)}`), ok: () => near(val(pk), binom(n, k) * val(p) ** k * val(qn) ** (n - k), 1e-12) };
      return { q: `${head} Calculer ${M('P(X\\geqslant 1)')}.`, a: M(`P(X\\geqslant 1)=1-\\left(${fracTex(qn)}\\right)^{${n}}=${fracTex(atLeast)}`), ok: () => { let s = 0; for (let i = 1; i <= n; i++) s += binom(n, i) * val(p) ** i * val(qn) ** (n - i); return near(s, val(atLeast), 1e-12); } };
    } },
  { id: 't-primitive', cls: C, chapter: 'terminale-10', domain: 'analyse', skill: 'Primitives', fast: true,
    make(r, level) {
      if (level === 1) { const a = r.nz(-3, 3), b = r.nz(-4, 4), c = r.int(-6, 6); const f = [3 * a, 2 * b, c], Fp = [a, b, c, 0]; return { q: `Déterminer une primitive de ${M(`f(x)=${polyTex(f)}`)} sur ${M(R)}.`, a: M(`F(x)=${polyTex(Fp)}`), ok: () => [-2, 0.5, 3].every((x) => near(nd((t) => evalPoly(Fp, t), x), evalPoly(f, x))) }; }
      if (level === 2) { const m = r.nz(-3, 3), k = m * r.nz(-3, 3), c = r.int(-5, 5); const f = (x) => k * Math.exp(m * x) + c; const Fn = (x) => (k / m) * Math.exp(m * x) + c * x; return { q: `Déterminer une primitive de ${M(`f(x)=${k}\\mathrm{e}^{${coef(m)}x}${c === 0 ? '' : sgn(c)}`)} sur ${M(R)}.`, a: M(`F(x)=${k / m === 1 ? '' : k / m === -1 ? '-' : k / m}\\mathrm{e}^{${coef(m)}x}${c === 0 ? '' : (c < 0 ? '-' : '+') + (Math.abs(c) === 1 ? '' : Math.abs(c)) + 'x'}`), ok: () => near(nd(Fn, 0.4), f(0.4), 1e-3) }; }
      const a = r.int(1, 5), y0 = r.int(-3, 3); const f = (x) => (2 * x) / (x * x + a), Fn = (x) => Math.log(x * x + a) + y0 - Math.log(a);
      return { q: `Déterminer la primitive ${M('F')} de ${M(`f(x)=\\dfrac{2x}{x^{2}+${a}}`)} sur ${M(R)} telle que ${M(`F(0)=${y0}`)}.`, a: M(`F(x)=\\ln(x^{2}+${a})${y0 === 0 ? '' : sgn(y0)}-\\ln ${a}`.replace(`-\\ln ${a}`, a === 1 ? '' : `-\\ln ${a}`)), ok: () => near(Fn(0), y0, 1e-12) && near(nd(Fn, 1.3), f(1.3), 1e-3) };
    } },
  { id: 't-integral', cls: C, chapter: 'terminale-11', domain: 'analyse', skill: 'Calcul d’intégrales', fast: false,
    make(r, level) {
      const lo = r.int(-2, 1), hi = lo + r.int(1, 3);
      if (level < 3) { const c = [r.nz(-3, 3), r.int(-4, 4), r.int(-5, 5)]; const Fa = (x) => add(add(mul(F(c[0], 3), F(x * x * x)), mul(F(c[1], 2), F(x * x))), mul(F(c[2]), F(x))); const v = sub(Fa(hi), Fa(lo)); return { q: `Calculer ${M(`\\displaystyle\\int_{${lo}}^{${hi}}\\left(${polyTex(c)}\\right)\\,\\mathrm{d}x`)}.`, a: M(`${fracTex(v)}`), ok: () => near(simpson((x) => evalPoly(c, x), lo, hi), val(v), 1e-9) }; }
      const c = [r.nz(-3, 3), r.int(-4, 4)]; const Fa = (x) => add(mul(F(c[0], 2), F(x * x)), mul(F(c[1]), F(x))); const v = sub(Fa(hi), Fa(lo)), mean = div(v, F(hi - lo));
      return { q: `Calculer la valeur moyenne de ${M(`f(x)=${polyTex(c)}`)} sur ${M(`[${lo}\\,;\\,${hi}]`)}.`, a: M(`\\mu=\\dfrac{1}{${hi - lo}}\\int_{${lo}}^{${hi}}f(x)\\,\\mathrm{d}x=${fracTex(mean)}`), ok: () => near(simpson((x) => evalPoly(c, x), lo, hi) / (hi - lo), val(mean), 1e-9) };
    } },
  { id: 't-ode', cls: C, chapter: 'terminale-10', domain: 'analyse', skill: 'Équations différentielles y′ = ay + b', fast: false,
    make(r, level) {
      const a = r.nz(-4, 4), y0 = r.int(-5, 5);
      if (level === 1) { const y = (x) => y0 * Math.exp(a * x); return { q: `Résoudre ${M(`y'=${coef(a)}y`)} avec ${M(`y(0)=${y0}`)}.`, a: M(`y(x)=${y0 === 1 ? '' : y0 === -1 ? '-' : y0}\\mathrm{e}^{${coef(a)}x}`), ok: () => near(nd(y, 0.3), a * y(0.3), 1e-3) && y(0) === y0 }; }
      const m = r.nz(-4, 4), b = a * m, y = (x) => (y0 + m) * Math.exp(a * x) - m;
      return { q: `Résoudre ${M(`y'=${coef(a)}y${sgn(b)}`)} avec ${M(`y(0)=${y0}`)}.`, a: M(`y(x)=${y0 + m}\\mathrm{e}^{${coef(a)}x}${sgn(-m)}`), s: M(`\\text{solution constante }y=${-m}`), ok: () => near(nd(y, 0.2), a * y(0.2) + b, 1e-3) && near(y(0), y0, 1e-12) };
    } },
  { id: 't-plane-eq', cls: C, chapter: 'terminale-13', domain: 'geometrie', skill: 'Équation cartésienne d’un plan', fast: false,
    make(r, level) {
      let n; do { n = [r.int(-4, 4), r.int(-4, 4), r.int(-4, 4)]; } while (n.every((x) => x === 0) || gcd(gcd(n[0], n[1]), n[2]) !== 1);
      const A = [r.int(-4, 4), r.int(-4, 4), r.int(-4, 4)], d = -(n[0] * A[0] + n[1] * A[1] + n[2] * A[2]);
      if (level === 1) return { q: `Déterminer une équation cartésienne du plan passant par ${M(`A(${A.join('\\,;\\,')})`)} et de vecteur normal ${M(`\\vec{n}\\begin{pmatrix}${n.join('\\\\')}\\end{pmatrix}`)}.`, a: M(`${lin3(...n, d)}=0`), ok: () => n[0] * A[0] + n[1] * A[1] + n[2] * A[2] + d === 0 };
      const inside = r.next() < .5, t = r.int(-2, 2), w = n[0] !== 0 || n[1] !== 0 ? [-n[1], n[0], 0] : [1, 0, 0];
      const B = [A[0] + t * w[0], A[1] + t * w[1], A[2] + t * w[2]];
      if (!inside) B[n.findIndex((x) => x !== 0)] += r.pick([-1, 1]);
      const v = n[0] * B[0] + n[1] * B[1] + n[2] * B[2] + d;
      return { q: `Le plan ${M('\\mathcal{P}')} a pour équation ${M(`${lin3(...n, d)}=0`)}. Le point ${M(`B(${B.join('\\,;\\,')})`)} appartient-il à ${M('\\mathcal{P}')} ?`, a: `Le membre de gauche vaut ${M(v)} en ${M('B')} : ${v === 0 ? 'oui' : 'non'}.`, ok: () => (v === 0) === inside };
    } },
  { id: 't-plane-distance', cls: C, chapter: 'terminale-09', domain: 'geometrie', skill: 'Distance d’un point à un plan', fast: false, levels: [2, 3],
    make(r, level) {
      const [a0, b0, c0, N] = r.pick([[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [4, 4, 7, 9], [2, 6, 9, 11], [6, 6, 7, 11]]);
      const [a, b, c] = [a0 * r.sign(), b0 * r.sign(), c0 * r.sign()], Mp = [r.int(-5, 5), r.int(-5, 5), r.int(-5, 5)];
      let d; if (level === 2) { const k = r.nz(-4, 4); d = N * k - (a * Mp[0] + b * Mp[1] + c * Mp[2]); } else d = r.int(-12, 12);
      const v = a * Mp[0] + b * Mp[1] + c * Mp[2] + d, dist = F(Math.abs(v), N);
      return { q: `Calculer la distance du point ${M(`M(${Mp.join('\\,;\\,')})`)} au plan d’équation ${M(`${lin3(a, b, c, d)}=0`)}.`, a: M(`d=\\dfrac{|${v}|}{\\sqrt{${a * a}+${b * b}+${c * c}}}=\\dfrac{${Math.abs(v)}}{${N}}=${fracTex(dist)}`), ok: () => N * N === a * a + b * b + c * c && near(Math.abs(v) / Math.sqrt(a * a + b * b + c * c), val(dist), 1e-12) };
    } },
  { id: 't-line-plane', cls: C, chapter: 'terminale-13', domain: 'geometrie', skill: 'Intersection d’une droite et d’un plan', fast: false, levels: [2, 3],
    make(r, level) {
      const A = [r.int(-4, 4), r.int(-4, 4), r.int(-4, 4)]; let u; do { u = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)]; } while (u.every((x) => x === 0));
      const t0 = r.nz(-3, 3), Mp = A.map((x, i) => x + t0 * u[i]); let n; do { n = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)]; } while (n.every((x) => x === 0) || n[0] * u[0] + n[1] * u[1] + n[2] * u[2] === 0);
      const d = -(n[0] * Mp[0] + n[1] * Mp[1] + n[2] * Mp[2]);
      const par3 = ['x', 'y', 'z'].map((v, i) => `${v}=${polyTex([u[i], A[i]], 't')}`).join(',\\ ');
      return { q: `La droite ${M('\\mathcal{D}')} a pour représentation paramétrique ${M(`\\begin{cases}${par3.split(',\\ ').join('\\\\')}\\end{cases}`)} ${M('(t\\in\\mathbb{R})')} et le plan ${M('\\mathcal{P}')} pour équation ${M(`${lin3(...n, d)}=0`)}. Déterminer leur intersection.`, a: M(`t=${t0}\\ \\text{ donc le point }(${Mp.join('\\,;\\,')})`), ok: () => { const t = -(n[0] * A[0] + n[1] * A[1] + n[2] * A[2] + d) / (n[0] * u[0] + n[1] * u[1] + n[2] * u[2]); return near(t, t0, 1e-12); } };
    } },
  { id: 't-trig-equation', cls: C, chapter: 'terminale-14', domain: 'analyse', skill: 'Équations trigonométriques', fast: true,
    make(r, level) {
      const fn = r.pick(['cos', 'sin']), pool = level === 1 ? VALUES.slice(0, 5) : VALUES, [tx, s] = r.pick(pool);
      const ks = level === 3 ? Array.from({ length: 24 }, (_, i) => i - 11) : Array.from({ length: 24 }, (_, i) => i);
      const f = fn === 'cos' ? Math.cos : Math.sin, sol = ks.filter((k) => near(f((k * Math.PI) / 12), s, 1e-9)).sort((a, b) => a - b);
      const interv = level === 3 ? '\\left]-\\pi\\,;\\,\\pi\\right]' : '\\left[0\\,;\\,2\\pi\\right[';
      return { q: `Résoudre dans ${M(interv)} : ${M(`\\${fn} x=${tx}`)}.`, a: M(`S=\\left\\{${sol.map((k) => piTex(k, 12)).join('\\,;\\,')}\\right\\}`), ok: () => sol.length >= 1 && sol.length <= 2 && sol.every((k) => near(f((k * Math.PI) / 12), s, 1e-9)) };
    } },
  { id: 't-trig-deriv', cls: C, chapter: 'terminale-14', domain: 'analyse', skill: 'Dériver avec sinus et cosinus', fast: true,
    make(r, level) {
      if (level === 1) { const a = r.nz(-4, 4), b = r.int(-3, 3), fn = r.pick(['sin', 'cos']); const f = (x) => Math[fn](a * x + b); return { q: `Calculer la dérivée de ${M(`f(x)=\\${fn}(${polyTex([a, b])})`)}.`, a: M(fn === 'sin' ? `f'(x)=${coef(a)}\\cos(${polyTex([a, b])})` : `f'(x)=${-a === 1 ? '' : -a === -1 ? '-' : -a}\\sin(${polyTex([a, b])})`), ok: () => near(nd(f, 0.5), fn === 'sin' ? a * Math.cos(a * 0.5 + b) : -a * Math.sin(a * 0.5 + b), 1e-3) }; }
      if (level === 2) { const a = r.nz(-3, 3), f = (x) => a * x * Math.sin(x); return { q: `Calculer la dérivée de ${M(`f(x)=${coef(a)}x\\sin x`)}.`, a: M(`f'(x)=${coef(a)}\\sin x${a < 0 ? '-' : '+'}${Math.abs(a) === 1 ? '' : Math.abs(a)}x\\cos x`), ok: () => near(nd(f, 0.8), a * Math.sin(0.8) + a * 0.8 * Math.cos(0.8), 1e-3) }; }
      const c = r.int(1, 9), kind = r.pick(['cos', 'sin']), f = (x) => c * Math[kind](x) ** 2, sg = kind === 'cos' ? -1 : 1; return { q: `Calculer la dérivée de ${M(`f(x)=${c === 1 ? '' : c}\\${kind}^{2}x`)} et l’écrire avec ${M('\\sin 2x')}.`, a: M(kind === 'cos' ? `f'(x)=-${c === 1 ? '' : 2 * c}${c === 1 ? '2' : ''}\\sin x\\cos x=-${c === 1 ? '' : c}\\sin 2x` : `f'(x)=${c === 1 ? '' : 2 * c}${c === 1 ? '2' : ''}\\sin x\\cos x=${c === 1 ? '' : c}\\sin 2x`), ok: () => near(nd(f, 0.9), sg * c * Math.sin(1.8), 1e-3) };
    } },
  { id: 't-convex', cls: C, chapter: 'terminale-06', domain: 'analyse', skill: 'Convexité et point d’inflexion', fast: false,
    make(r, level) {
      const a = r.nz(-3, 3), x0 = r.int(-3, 3), b = -3 * a * x0, c = r.int(-6, 6), d = r.int(-6, 6);
      const f = (x) => a * x ** 3 + b * x * x + c * x + d, f2 = [6 * a, 2 * b];
      return { q: `Soit ${M(`f(x)=${polyTex([a, b, c, d])}`)}. Calculer ${M("f''(x)")}, étudier la convexité de ${M('f')} sur ${M(R)} et préciser son point d’inflexion.`, a: M(`f''(x)=${polyTex(f2)}=${6 * a}(x${sgn(-x0)})`.replace('(x+0)', 'x').replace('(x-0)', 'x')) + `. ${M('f')} est ${a > 0 ? 'concave' : 'convexe'} sur ${M(`]-\\infty\\,;\\,${x0}]`)} et ${a > 0 ? 'convexe' : 'concave'} sur ${M(`[${x0}\\,;\\,+\\infty[`)} ; point d’inflexion ${M(`(${x0}\\,;\\,${f(x0)})`)}.`,
        ok: () => { const s2 = (x) => (nd((t) => nd(f, t), x)); return near(s2(x0), 0, 1e-1) && (s2(x0 + 1) > 0) === (a > 0) && (s2(x0 - 1) > 0) === (a < 0); } };
    } },
];
