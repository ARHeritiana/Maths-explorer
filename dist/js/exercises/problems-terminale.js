// Seeded problems for Terminale (online bank and sheets): multi-part exercises whose numbers come from the seed, one per chapter.
// Same contract as problems.js: make(r) returns {intro, parts: [{w, q, hint, a}], ok()}; ok() recomputes the quoted results independently.
import { F, add, sub, mul, div, val, eq, M, R, fracTex, numTex, roundTex, polyTex, evalPoly, mulPoly, sgn, par, binom } from './engine.js';
import { lin } from './seconde-kit.js';
import { tidyProblems } from './terminale-kit.js';

const C = 'terminale';
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
const nd = (f, x) => (f(x + 1e-6) - f(x - 1e-6)) / 2e-6;
const cf = (f) => (f.n === 1 && f.d === 1 ? '' : f.n === -1 && f.d === 1 ? '-' : fracTex(f));
const simpson = (f, a, b, n = 4000) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return (s * h) / 3; };
const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
const cross = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
const col = (v) => `\\begin{pmatrix}${v.join('\\\\')}\\end{pmatrix}`;
const P3 = (n, p) => `${n}(${p.join('\\,;\\,')})`;
const ls = (l) => (l.n < 0 ? `+${fracTex(F(-l.n, l.d))}` : l.n === 0 ? '' : `-${fracTex(l)}`);
const xs0 = (x0) => (x0 === 0 ? 'x' : `\\left(x${sgn(-x0)}\\right)`);
const iter = (u0, a, b, n) => { let x = u0; for (let i = 0; i < n; i++) x = a * x + b; return x; };

export const problemsTerminale = [
  { id: 'g-ter-suite-limite', cls: C, chapters: ['terminale-01', 'terminale-03'], domain: 'suites', level: 2, minutes: 25, title: 'Une suite récurrente et sa limite',
    make(r) {
      const a = r.pick([F(1, 2), F(1, 3), F(2, 3), F(3, 4), F(1, 4)]), l = r.nz(-9, 9), b = mul(F(l), sub(F(1), a)), u0 = l + r.nz(-12, 12), f = (x) => val(a) * x + val(b), eps = r.pick([1e-2, 1e-3, 1e-4]), et = { 0.01: '10^{-2}', 0.001: '10^{-3}', 0.0001: '10^{-4}' }[eps];
      let n = 0, y = u0; while (Math.abs(y - l) >= eps) { y = f(y); n++; }
      const aT = fracTex(a), bT = fracTex(b);
      return { intro: `On définit ${M('(u_n)')} par ${M(`u_0=${u0}`)} et ${M(`u_{n+1}=${aT}u_n${b.n < 0 ? '-' : '+'}${fracTex(F(Math.abs(b.n), b.d))}`)}.`,
        parts: [
          { w: 1, q: `Calculer ${M('u_1')} et ${M('u_2')}.`, hint: 'Appliquer la relation de récurrence deux fois.', a: `${M(`u_1=${fracTex(add(mul(a, F(u0)), b))}`)}, ${M(`u_2=${fracTex(add(mul(a, add(mul(a, F(u0)), b)), b))}`)}.` },
          { w: 2, q: `On pose ${M(`v_n=u_n${sgn(-l)}`)}. Montrer que ${M('(v_n)')} est géométrique et donner son expression, puis celle de ${M('u_n')}.`, hint: `Exprimer ${M('v_{n+1}')} en fonction de ${M('v_n')}.`, a: `${M(`v_{n+1}=${aT}u_n${sgn(0).slice(0, 0)}${b.n < 0 ? '-' : '+'}${fracTex(F(Math.abs(b.n), b.d))}${sgn(-l)}=${aT}\\left(u_n${sgn(-l)}\\right)`)} : raison ${M(aT)}, ${M(`v_0=${u0 - l}`)}. ${M(`v_n=${u0 - l}\\left(${aT}\\right)^{n}`)} et ${M(`u_n=${l}${u0 - l < 0 ? '-' : '+'}${Math.abs(u0 - l) === 1 ? '' : Math.abs(u0 - l)}\\left(${aT}\\right)^{n}`)}.` },
          { w: 1, q: `Déterminer la limite de ${M('(u_n)')}.`, hint: `Que vaut ${M('\\lim q^{n}')} pour ${M('|q|<1')} ?`, a: `${M(`\\left|${aT}\\right|<1`)} donc ${M(`\\lim u_n=${l}`)}.` },
          { w: 2, q: `Déterminer le plus petit entier ${M('n')} tel que ${M(`|u_n-${par(l)}|<${et}`)}.`, hint: 'Tableau de valeurs ou algorithme de seuil.', a: `${M(`|u_n-${par(l)}|=${Math.abs(u0 - l)}\\left|${aT}\\right|^{n}`)} : ${M(`n=${n}`)}.` },
        ],
        ok: () => { let x = u0; for (let k = 0; k <= 8; k++) { if (!near(x, l + (u0 - l) * val(a) ** k, 1e-9)) return false; x = f(x); } return eq(add(mul(a, F(l)), b), F(l)) && Math.abs(y - l) < eps && n > 0 && Math.abs(l + (u0 - l) * val(a) ** (n - 1) - l) >= eps; } };
    } },

  { id: 'g-ter-pyramide', cls: C, chapters: ['terminale-02', 'terminale-13'], domain: 'geometrie', level: 2, minutes: 25, title: 'Points, vecteurs et plan dans l’espace',
    make(r) {
      const A = [r.int(-4, 4), r.int(-4, 4), r.int(-4, 4)]; let u, v; do { u = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)]; v = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)]; } while (cross(u, v).every((x) => x === 0));
      const B = A.map((x, i) => x + u[i]), Cc = A.map((x, i) => x + v[i]), a = r.nz(-3, 3), b = r.nz(-3, 3), D = A.map((x, i) => x + a * u[i] + b * v[i]), n = cross(u, v), d = -dot(n, A);
      const E0 = A.map((x, i) => x + 2 * n[i] + 0), G = [0, 1, 2].map((i) => F(A[i] + B[i] + Cc[i], 3));
      return { intro: `Dans un repère de l’espace : ${M(P3('A', A))}, ${M(P3('B', B))}, ${M(P3('C', Cc))} et ${M(P3('D', D))}.`,
        parts: [
          { w: 1, q: `Calculer les coordonnées de ${M('\\overrightarrow{AB}')} et de ${M('\\overrightarrow{AC}')} ; ces vecteurs sont-ils colinéaires ?`, hint: 'Coordonnées proportionnelles ou non.', a: `${M(`\\overrightarrow{AB}${col(u)}`)}, ${M(`\\overrightarrow{AC}${col(v)}`)} ; non colinéaires (coordonnées non proportionnelles) : ${M('A')}, ${M('B')}, ${M('C')} définissent un plan.` },
          { w: 2, q: `Montrer que ${M('D')} appartient au plan ${M('(ABC)')} en exprimant ${M('\\overrightarrow{AD}')} en fonction de ${M('\\overrightarrow{AB}')} et ${M('\\overrightarrow{AC}')}.`, hint: `Chercher ${M('a')} et ${M('b')} avec ${M('\\overrightarrow{AD}=a\\overrightarrow{AB}+b\\overrightarrow{AC}')}.`, a: `${M(`\\overrightarrow{AD}=${coef0(a)}\\overrightarrow{AB}${b < 0 ? '-' : '+'}${Math.abs(b) === 1 ? '' : Math.abs(b)}\\overrightarrow{AC}`)} : ${M('\\overrightarrow{AD}')}, ${M('\\overrightarrow{AB}')}, ${M('\\overrightarrow{AC}')} sont coplanaires, donc ${M('D\\in(ABC)')}.` },
          { w: 2, q: `Déterminer les coordonnées du centre de gravité ${M('G')} du triangle ${M('ABC')}.`, hint: `${M('G=\\dfrac{A+B+C}{3}')} coordonnée par coordonnée.`, a: `${M(`G\\left(${G.map(fracTex).join('\\,;\\,')}\\right)`)}.` },
        ],
        ok: () => [0, 1, 2].every((i) => D[i] - A[i] === a * u[i] + b * v[i]) && G.every((g, i) => eq(g, F(A[i] + B[i] + Cc[i], 3))) && cross(u, v).some((x) => x !== 0) && E0.length === 3 && d + dot(n, A) === 0 };
      function coef0(k) { return k === 1 ? '' : k === -1 ? '-' : k; }
    } },

  { id: 'g-ter-limite-seuil', cls: C, chapters: ['terminale-03'], domain: 'suites', level: 2, minutes: 20, title: 'Variations, limite et seuil d’une suite homographique',
    make(r) {
      let a, b, c, d; do { a = r.nz(-6, 6); b = r.int(-8, 8); c = r.int(1, 5); d = r.int(1, 6); } while (a * d - b * c === 0);
      const u = (n) => (a * n + b) / (c * n + d), k = a * d - b * c, l = F(a, c), eps = r.pick([1e-1, 1e-2, 1e-3]), et = { 0.1: '10^{-1}', 0.01: '10^{-2}', 0.001: '10^{-3}' }[eps];
      let n = 0; while (Math.abs(u(n) - val(l)) >= eps) n++;
      return { intro: `Soit ${M('(u_n)')} définie pour tout entier ${M('n')} par ${M(`u_n=\\dfrac{${polyTex([a, b], 'n')}}{${polyTex([c, d], 'n')}}`)}.`,
        parts: [
          { w: 2, q: `Calculer ${M('u_{n+1}-u_n')} et en déduire le sens de variation de ${M('(u_n)')}.`, hint: 'Mettre au même dénominateur.', a: `${M(`u_{n+1}-u_n=\\dfrac{${k}}{(${polyTex([c, c + d], 'n')})(${polyTex([c, d], 'n')})}`)} : ${k > 0 ? 'positive, suite croissante' : 'négative, suite décroissante'}.` },
          { w: 1, q: `Déterminer la limite de ${M('(u_n)')}.`, hint: `Factoriser ${M('n')} au numérateur et au dénominateur.`, a: `${M(`\\lim u_n=\\dfrac{${a}}{${c}}=${fracTex(l)}`)}.` },
          { w: 2, q: `Déterminer le plus petit entier ${M('n')} tel que ${M(`|u_n${ls(l)}|<${et}`)}.`, hint: 'Tableau de valeurs à la calculatrice.', a: `${M(`n=${n}`)} (${M(`u_{${n}}\\approx ${roundTex(u(n), 4)}`)}).` },
        ],
        ok: () => [0, 1, 4, 12].every((m) => (u(m + 1) - u(m) > 0) === (k > 0) && near(u(m + 1) - u(m), k / ((c * (m + 1) + d) * (c * m + d)), 1e-9)) && Math.abs(u(n) - val(l)) < eps && (n === 0 || Math.abs(u(n - 1) - val(l)) >= eps) && Math.abs(u(1e7) - val(l)) < 1e-5 };
    } },

  { id: 'g-ter-asymptotes', cls: C, chapters: ['terminale-04'], domain: 'analyse', level: 2, minutes: 25, title: 'Asymptotes et position d’une courbe',
    make(r) {
      const a = r.nz(-3, 3), c = r.int(-5, 5), k = r.nz(-6, 6), b = r.int(-6, 6), f = (x) => a * x + b + k / (x - c);
      const num = mulPoly([a, b], [1, -c]).map((x, i, arr) => (i === arr.length - 1 ? x + k : x)), xc = c === 0 ? 'x' : `x${sgn(-c)}`;
      return { intro: `Soit ${M(`f(x)=\\dfrac{${polyTex(num, 'x')}}{${xc}}`)} définie sur ${M(R)} privé de ${M(c)}, et ${M('\\mathcal{C}')} sa courbe.`,
        parts: [
          { w: 2, q: `Montrer que, pour ${M(`x\\neq ${c}`)}, ${M(`f(x)=${polyTex([a, b], 'x')}+\\dfrac{${k}}{${xc}}`)}.`, hint: 'Mettre au même dénominateur le membre de droite.', a: `${M(`${polyTex([a, b], 'x')}+\\dfrac{${k}}{${xc}}=\\dfrac{(${polyTex([a, b], 'x')})(${xc})+${k}}{${xc}}=\\dfrac{${polyTex(num, 'x')}}{${xc}}`.replace(/\+-/g, '-'))}.` },
          { w: 2, q: `Étudier les limites de ${M('f')} en ${M('\\pm\\infty')} et en ${M(c)} et en déduire les asymptotes de ${M('\\mathcal{C}')}.`, hint: `${M('\\dfrac{k}{x-c}')} tend vers ${M(0)} en l’infini ; au voisinage de ${M(c)} regarder le signe.`, a: `${M(`f(x)-(${polyTex([a, b], 'x')})=\\dfrac{${k}}{${xc}}\\to 0`)} : asymptote oblique ${M(`y=${polyTex([a, b], 'x')}`)}. ${M(`\\lim_{x\\to ${c}^{\\pm}}f(x)=\\pm\\infty`)} : asymptote verticale ${M(`x=${c}`)}.` },
          { w: 1, q: `Étudier la position de ${M('\\mathcal{C}')} par rapport à son asymptote oblique.`, hint: `Signe de ${M(`\\dfrac{${k}}{${xc}}`)}.`, a: `${M('\\mathcal{C}')} est ${k > 0 ? 'au-dessus' : 'en dessous'} de l’asymptote pour ${M(`x>${c}`)} et ${k > 0 ? 'en dessous' : 'au-dessus'} pour ${M(`x<${c}`)}.` },
        ],
        ok: () => [-4, 0.5, 3, 7].filter((x) => x !== c).every((x) => near(f(x), evalPoly(num, x) / (x - c), 1e-9)) && Math.abs(f(1e9) - (a * 1e9 + b)) < 1e-6 && Math.abs(f(c + 1e-9)) > 1e6 && (f(c + 1) > a * (c + 1) + b) === (k > 0) };
    } },

  { id: 'g-ter-comite', cls: C, chapters: ['terminale-05', 'terminale-07'], domain: 'stats-proba', level: 2, minutes: 20, title: 'Comité et probabilités',
    make(r) {
      const h = r.int(5, 12), f = r.int(5, 12), k = r.int(3, 5), N = h + f, j = r.int(1, k - 1);
      const tot = binom(N, k), exact = binom(f, j) * binom(h, k - j), atLeast = tot - binom(h, k), pr = F(exact, tot);
      return { intro: `Une association compte ${M(h)} hommes et ${M(f)} femmes. On choisit au hasard un comité de ${M(k)} personnes.`,
        parts: [
          { w: 1, q: 'Combien de comités différents peut-on former ?', hint: 'L’ordre ne compte pas.', a: `${M(`\\dbinom{${N}}{${k}}=${tot}`)}.` },
          { w: 2, q: `Combien de comités comportent exactement ${M(j)} femme${j > 1 ? 's' : ''} ?`, hint: 'Deux choix indépendants : les femmes puis les hommes.', a: `${M(`\\dbinom{${f}}{${j}}\\times\\dbinom{${h}}{${k - j}}=${exact}`)}.` },
          { w: 2, q: `Combien de comités comportent au moins une femme ?`, hint: 'Passer par l’événement contraire.', a: `${M(`${tot}-\\dbinom{${h}}{${k}}=${atLeast}`)}.` },
          { w: 2, q: `Quelle est la probabilité d’avoir exactement ${M(j)} femme${j > 1 ? 's' : ''} ?`, hint: 'Tous les comités sont équiprobables.', a: `${M(`\\dfrac{${exact}}{${tot}}=${fracTex(pr)}\\approx ${roundTex(exact / tot, 3)}`)}.` },
        ],
        ok: () => { let c1 = 0, c2 = 0, c3 = 0; const go = (s, l, ff) => { if (l === 0) { c1++; if (ff === j) c2++; if (ff >= 1) c3++; return; } for (let i = s; i < N; i++) go(i + 1, l - 1, ff + (i >= h ? 1 : 0)); }; go(0, k, 0); return c1 === tot && c2 === exact && c3 === atLeast; } };
    } },

  { id: 'g-ter-convexite', cls: C, chapters: ['terminale-06'], domain: 'analyse', level: 3, minutes: 25, title: 'Convexité et point d’inflexion',
    make(r) {
      const a = r.pick([1, 2, -1, -2]), x0 = r.int(-3, 3), c = r.int(-6, 6), b = -3 * a * x0, f = (x) => a * x ** 3 + b * x * x + c * x, y0 = f(x0), m = 3 * a * x0 * x0 + 2 * b * x0 + c, p = y0 - m * x0;
      const cvxR = a > 0;
      return { intro: `Soit ${M(`f(x)=${polyTex([a, b, c, 0], 'x')}`)} définie sur ${M(R)}.`,
        parts: [
          { w: 1, q: `Calculer ${M("f'(x)")} et ${M("f''(x)")}.`, hint: 'Dériver deux fois chaque terme.', a: `${M(`f'(x)=${polyTex([3 * a, 2 * b, c])}`)} et ${M(`f''(x)=${polyTex([6 * a, 2 * b])}`)}.` },
          { w: 2, q: `Étudier la convexité de ${M('f')}.`, hint: `Signe de ${M("f''")} : une fonction affine.`, a: `${M("f''")} s’annule en ${M(x0)} : ${M('f')} est ${cvxR ? 'concave sur ' + M(`]-\\infty\\,;\\,${x0}]`) + ' et convexe sur ' + M(`[${x0}\\,;\\,+\\infty[`) : 'convexe sur ' + M(`]-\\infty\\,;\\,${x0}]`) + ' et concave sur ' + M(`[${x0}\\,;\\,+\\infty[`)}.` },
          { w: 1, q: 'Quel est le point d’inflexion de la courbe ?', hint: 'Là où la dérivée seconde s’annule en changeant de signe.', a: `${M(`I(${x0}\\,;\\,${y0})`)}.` },
          { w: 2, q: 'Donner l’équation de la tangente en ce point et étudier la position de la courbe par rapport à elle.', hint: `${M('f(x)-T(x)')} se factorise par ${M(`${xs0(x0)}^{3}`)}.`, a: `${M(`T:\\ y=${polyTex([m, p])}`)}. ${M(`f(x)-T(x)=${a === 1 ? '' : a === -1 ? '-' : a}${xs0(x0)}^{3}`)} : la courbe traverse sa tangente en ${M('I')}.` },
        ],
        ok: () => { const T = (x) => m * x + p; return near(f(x0), y0) && [-2, 0.5, 3.2].every((x) => near(f(x) - T(x), a * (x - x0) ** 3, 1e-9)) && near(nd(f, x0), m, 1e-3) && (6 * a * (x0 + 1) + 2 * b > 0) === cvxR; } };
    } },

  { id: 'g-ter-controle-binomial', cls: C, chapters: ['terminale-07'], domain: 'stats-proba', level: 2, minutes: 20, title: 'Un contrôle qualité binomial',
    make(r) {
      const n = r.int(8, 25), p = r.pick([0.02, 0.05, 0.08, 0.1, 0.15]), q = 1 - p, k = r.int(1, 3), pm = (i) => binom(n, i) * p ** i * q ** (n - i);
      const pt = numTex(F(Math.round(p * 100), 100)), ok0 = 1 - q ** n;
      let N = 1; while (1 - q ** N < 0.95) N++;
      return { intro: `Dans une production, chaque pièce est défectueuse avec la probabilité ${M(pt)}, indépendamment des autres. On prélève ${M(n)} pièces ; ${M('X')} est le nombre de pièces défectueuses.`,
        parts: [
          { w: 1, q: `Quelle est la loi de ${M('X')} ? Donner ${M('E(X)')} et ${M('V(X)')}.`, hint: 'Schéma de Bernoulli de paramètres ' + M('n') + ' et ' + M('p') + '.', a: `${M('X')} suit ${M(`\\mathcal{B}(${n}\\,;\\,${pt})`)} : ${M(`E(X)=${numTex(F(Math.round(n * p * 10000), 10000))}`)}, ${M(`V(X)=${numTex(F(Math.round(n * p * q * 10000), 10000))}`)}.` },
          { w: 2, q: `Calculer ${M(`P(X=${k})`)} (arrondi à ${M('10^{-4}')}).`, hint: `${M('P(X=k)=\\dbinom{n}{k}p^{k}(1-p)^{n-k}')}.`, a: `${M(`P(X=${k})=\\dbinom{${n}}{${k}}${pt}^{${k}}${numTex(F(Math.round(q * 100), 100))}^{${n - k}}\\approx ${roundTex(pm(k), 4)}`.replace('^{1}', ''))}.` },
          { w: 2, q: `Calculer la probabilité qu’il y ait au moins une pièce défectueuse.`, hint: 'Événement contraire : aucune défectueuse.', a: `${M(`P(X\\geqslant 1)=1-${numTex(F(Math.round(q * 100), 100))}^{${n}}\\approx ${roundTex(ok0, 4)}`)}.` },
          { w: 2, q: `Quel est le plus petit nombre de pièces à prélever pour que cette probabilité dépasse ${M('0{,}95')} ?`, hint: `Résoudre ${M(`1-${numTex(F(Math.round(q * 100), 100))}^{n}\\geqslant 0{,}95`)} à la calculatrice.`, a: `${M(`1-q^{${N - 1}}\\approx ${roundTex(1 - q ** (N - 1), 4)}`)} et ${M(`1-q^{${N}}\\approx ${roundTex(1 - q ** N, 4)}`)} : ${M(`n=${N}`)}.` },
        ],
        ok: () => { let s = 0; for (let i = 0; i <= n; i++) s += pm(i); return near(s, 1, 1e-9) && near(ok0, 1 - pm(0), 1e-9) && 1 - q ** N >= 0.95 && 1 - q ** (N - 1) < 0.95 && Math.abs(pm(k) * 1e4 - Math.round(pm(k) * 1e4) - 0.5) > 1e-6 && Math.abs(ok0 * 1e4 - Math.round(ok0 * 1e4) - 0.5) > 1e-6; } };
    } },

  { id: 'g-ter-ln-etude', cls: C, chapters: ['terminale-08'], domain: 'analyse', level: 3, minutes: 25, title: 'Étude d’une fonction avec logarithme',
    make(r) {
      const b = r.int(1, 12), c0 = r.nz(-9, 9), f = (x) => x * Math.log(x) - b * x + c0, fp = (x) => Math.log(x) + 1 - b, xm = Math.exp(b - 1);
      const ex = b - 1 === 0 ? '1' : b - 1 === 1 ? '\\mathrm{e}' : `\\mathrm{e}^{${b - 1}}`;
      return { intro: `Soit ${M(`f(x)=x\\ln x${b === 1 ? '-' : `-${b}`}x${sgn(c0)}`)} définie sur ${M(']0\\,;\\,+\\infty[')}.`,
        parts: [
          { w: 1, q: `Calculer ${M("f'(x)")}.`, hint: 'Dériver le produit ' + M('x\\ln x') + '.', a: `${M(`f'(x)=\\ln x+1${sgn(-b)}=\\ln x${sgn(1 - b)}`.replace('+0', ''))}.` },
          { w: 2, q: `Résoudre ${M("f'(x)>0")} et dresser le tableau de variations de ${M('f')}.`, hint: `${M('\\ln x>a\\iff x>\\mathrm{e}^{a}')}.`, a: `${M(`f'(x)>0\\iff\\ln x>${b - 1}\\iff x>${ex}`)} : ${M('f')} décroît sur ${M(`\\left]0\\,;\\,${ex}\\right]`)} puis croît.` },
          { w: 1, q: 'En déduire le minimum de ' + M('f') + ' (valeur exacte).', hint: `Calculer ${M(`f(${ex})`)}.`, a: `${M(`f(${ex})=${ex}\\left(${b - 1}-${b}\\right)${sgn(c0)}=-${ex}${sgn(c0)}`)}.` },
          { w: 2, q: `Déterminer l’équation de la tangente à la courbe au point d’abscisse ${M(1)}.`, hint: `${M("y=f'(1)(x-1)+f(1)")}.`, a: `${M(`f(1)=${c0 - b}`)}, ${M(`f'(1)=${1 - b}`)} : ${M(`y=${polyTex([1 - b, c0 - 1])}`)}.` },
        ],
        ok: () => near(fp(xm), 0, 1e-9) && fp(xm - 0.3) < 0 && fp(xm + 0.3) > 0 && near(f(xm), -xm + c0, 1e-9) && f(1) === c0 - b && near(nd(f, 1), 1 - b, 1e-3) && [0.4, 2.2].every((x) => near(nd(f, x), fp(x), 1e-3)) };
    } },

  { id: 'g-ter-plan-sphere', cls: C, chapters: ['terminale-09', 'terminale-13'], domain: 'geometrie', level: 3, minutes: 30, title: 'Un plan, une distance et une sphère tangente',
    make(r) {
      let A, B, Cc, n; do { A = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)]; B = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)]; Cc = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)]; n = cross(B.map((x, i) => x - A[i]), Cc.map((x, i) => x - A[i])); } while (n.every((x) => x === 0));
      const g = n.reduce((a0, b0) => { let x = Math.abs(a0), y = Math.abs(b0); while (y) [x, y] = [y, x % y]; return x; }, 0), nr = n.map((x) => x / g), d = -dot(nr, A), Om = [r.int(-4, 4), r.int(-4, 4), r.int(-4, 4)], num = Math.abs(dot(nr, Om) + d), N2 = dot(nr, nr), R2 = F(num * num, N2);
      if (num === 0) return this.make(r);
      const eq0 = `${lin([[nr[0], 'x'], [nr[1], 'y'], [nr[2], 'z'], [d, '']])}=0`, eqS = (c0, R) => `(x${c0[0] === 0 ? '' : sgn(-c0[0])})^{2}+(y${c0[1] === 0 ? '' : sgn(-c0[1])})^{2}+(z${c0[2] === 0 ? '' : sgn(-c0[2])})^{2}=${R}`;
      return { intro: `Dans un repère orthonormé : ${M(P3('A', A))}, ${M(P3('B', B))}, ${M(P3('C', Cc))} et ${M(P3('\\Omega', Om))}.`,
        parts: [
          { w: 2, q: `Montrer que ${M(`\\vec{n}${col(nr)}`)} est normal au plan ${M('(ABC)')}.`, hint: `Calculer ${M('\\vec{n}\\cdot\\overrightarrow{AB}')} et ${M('\\vec{n}\\cdot\\overrightarrow{AC}')}.`, a: `${M(`\\vec{n}\\cdot\\overrightarrow{AB}=${dot(nr, B.map((x, i) => x - A[i]))}`)} et ${M(`\\vec{n}\\cdot\\overrightarrow{AC}=${dot(nr, Cc.map((x, i) => x - A[i]))}`)} ; ${M('\\overrightarrow{AB}')} et ${M('\\overrightarrow{AC}')} sont non colinéaires.` },
          { w: 1, q: `En déduire une équation cartésienne de ${M('(ABC)')}.`, hint: `Utiliser ${M('A')} pour la constante.`, a: `${M(eq0)}.` },
          { w: 2, q: `Calculer la distance de ${M('\\Omega')} au plan ${M('(ABC)')}.`, hint: `${M('d=\\dfrac{|ax_0+by_0+cz_0+d|}{\\sqrt{a^{2}+b^{2}+c^{2}}}')}.`, a: `${M(`d=\\dfrac{${num}}{\\sqrt{${N2}}}`)}, soit ${M(`d^{2}=${fracTex(R2)}`)}.` },
          { w: 2, q: `Donner une équation de la sphère de centre ${M('\\Omega')} tangente au plan ${M('(ABC)')}.`, hint: 'Le rayon est la distance du centre au plan.', a: `${M(eqS(Om, fracTex(R2)))}.` },
        ],
        ok: () => [B, Cc].every((P) => dot(nr, P.map((x, i) => x - A[i])) === 0) && dot(nr, A) + d === 0 && near(num / Math.sqrt(N2), Math.abs(dot(nr, Om) + d) / Math.hypot(...nr), 1e-12) && n.length === 3 };
    } },

  { id: 'g-ter-refroidissement', cls: C, chapters: ['terminale-10', 'terminale-08'], domain: 'analyse', level: 3, minutes: 25, title: 'Refroidissement d’un liquide',
    make(r) {
      const Ta = r.int(5, 25), T0 = r.int(70, 95), k = r.pick([0.03, 0.04, 0.05, 0.06, 0.08, 0.1, 0.12]), kt = numTex(F(Math.round(k * 100), 100)), T = (t) => Ta + (T0 - Ta) * Math.exp(-k * t), thr = r.int(Ta + 8, Math.floor((T0 + Ta) / 2)), tt = Math.log((T0 - Ta) / (thr - Ta)) / k, t1 = r.int(3, 20);
      if (Math.abs(tt * 10 - Math.round(tt * 10) - 0.5) < 0.03 || Math.abs(T(t1) * 10 - Math.round(T(t1) * 10) - 0.5) < 0.03) return this.make(r);
      return { intro: `Un liquide à ${M(`${T0}\\ ^{\\circ}\\text{C}`)} est placé dans une pièce à ${M(`${Ta}\\ ^{\\circ}\\text{C}`)}. Sa température ${M('T(t)')} (en ${M('^{\\circ}\\text{C}')}, ${M('t')} en minutes) vérifie ${M(`T'(t)=-${kt}\\left(T(t)-${Ta}\\right)`)} avec ${M(`T(0)=${T0}`)}.`,
        parts: [
          { w: 2, q: `Montrer que ${M('T')} est solution d’une équation ${M("y'=ay+b")} puis la résoudre.`, hint: `Développer : ${M(`T'=-${kt}T+${numTex(F(Math.round(k * Ta * 100), 100))}`)} ; solution constante ${M(Ta)}.`, a: `${M(`T'=-${kt}T+${numTex(F(Math.round(k * Ta * 100), 100))}`)} : ${M(`T(t)=C\\mathrm{e}^{-${kt}t}+${Ta}`)} et ${M(`T(0)=${T0}`)} donne ${M(`C=${T0 - Ta}`)} : ${M(`T(t)=${Ta}+${T0 - Ta}\\mathrm{e}^{-${kt}t}`)}.` },
          { w: 1, q: `Calculer la température après ${M(t1)} minutes (arrondi au dixième).`, hint: 'Calculatrice.', a: `${M(`T(${t1})\\approx ${roundTex(T(t1), 1)}`)} °C.` },
          { w: 2, q: `Étudier le sens de variation de ${M('T')} et sa limite en ${M('+\\infty')}.`, hint: `${M("T'(t)")} est du signe de ${M(`-(T(t)-${Ta})`)}.`, a: `${M(`T'(t)=-${kt}\\times ${T0 - Ta}\\mathrm{e}^{-${kt}t}<0`)} : ${M('T')} décroît ; ${M(`\\lim T=${Ta}`)} (température de la pièce).` },
          { w: 2, q: `À partir de quel instant la température est-elle inférieure à ${M(`${thr}\\ ^{\\circ}\\text{C}`)} ? (valeur exacte puis arrondie au dixième)`, hint: `Résoudre ${M(`${Ta}+${T0 - Ta}\\mathrm{e}^{-${kt}t}<${thr}`)} avec le logarithme.`, a: `${M(`t>\\dfrac{1}{${kt}}\\ln\\dfrac{${T0 - Ta}}{${thr - Ta}}\\approx ${roundTex(tt, 1)}`)} minutes.` },
        ],
        ok: () => near(nd(T, 4), -k * (T(4) - Ta), 1e-4) && near(T(0), T0, 1e-9) && Math.abs(T(tt) - thr) < 1e-9 && T(tt + 0.2) < thr && T(tt - 0.2) > thr && Math.abs(T(1e4) - Ta) < 1e-9 };
    } },

  { id: 'g-ter-aire-integrale', cls: C, chapters: ['terminale-11'], domain: 'analyse', level: 3, minutes: 30, title: 'Intégrales : aire, valeur moyenne, intégration par parties',
    make(r) {
      const x1 = r.int(-4, 0), x2 = r.int(1, 5), a = r.int(1, 4), f = (x) => a * x * x, g = (x) => a * (x1 + x2) * x - a * x1 * x2, A = (a * (x2 - x1) ** 3) / 6, up = r.int(1, 3), e1 = r.int(1, 4), Ie = (e1 * up - e1 + 1) * Math.exp(up) - (1 - e1);
      return { intro: `Dans un repère orthonormé, ${M('\\mathcal{C}')} est la parabole d’équation ${M(`y=${a === 1 ? '' : a}x^{2}`)} et ${M('d')} la droite d’équation ${M(`y=${polyTex([a * (x1 + x2), -a * x1 * x2])}`)}.`,
        parts: [
          { w: 2, q: `Déterminer les abscisses des points d’intersection de ${M('\\mathcal{C}')} et ${M('d')}.`, hint: 'Résoudre ' + M('f(x)=g(x)') + '.', a: `${M(`${a === 1 ? '' : a}x^{2}=${polyTex([a * (x1 + x2), -a * x1 * x2])}\\iff ${a === 1 ? '' : a}\\left(${polyTex([1, -(x1 + x2), x1 * x2], 'x')}\\right)=0`)} : ${M(`x=${x1}`)} ou ${M(`x=${x2}`)}.` },
          { w: 2, q: `Calculer l’aire du domaine compris entre ${M('\\mathcal{C}')} et ${M('d')}.`, hint: `Sur ${M(`[${x1}\\,;\\,${x2}]`)}, la droite est au-dessus de la parabole.`, a: `${M(`\\mathcal{A}=\\int_{${x1}}^{${x2}}(g-f)=\\dfrac{${a}(${x2 - x1})^{3}}{6}=${fracTex(F(a * (x2 - x1) ** 3, 6))}`)} u.a.` },
          { w: 2, q: `Calculer à l’aide d’une intégration par parties ${M(`\\displaystyle\\int_{0}^{${up}}(${polyTex([e1, 1])})\\mathrm{e}^{x}\\,\\mathrm{d}x`)}.`, hint: `${M(`u=${polyTex([e1, 1])}`)} et ${M("v'=\\mathrm{e}^{x}")}.`, a: `${M(`\\left[(${polyTex([e1, 1])})\\mathrm{e}^{x}\\right]_{0}^{${up}}-${e1}\\left[\\mathrm{e}^{x}\\right]_{0}^{${up}}=(${e1 * up + 1 - e1})\\mathrm{e}^{${up}}-1+${e1}`)}.` },
        ],
        ok: () => Math.abs(f(x1) - g(x1)) < 1e-12 && Math.abs(f(x2) - g(x2)) < 1e-12 && Math.abs(simpson((x) => g(x) - f(x), x1, x2) - A) < 1e-6 && Math.abs(simpson((x) => (e1 * x + 1) * Math.exp(x), 0, up) - Ie) < 1e-6 * Math.max(1, Ie) };
    } },

  { id: 'g-ter-sondage', cls: C, chapters: ['terminale-12'], domain: 'stats-proba', level: 3, minutes: 25, title: 'Estimer une proportion par un sondage',
    make(r) {
      const p = F(r.int(2, 18), 20), n = r.pick([100, 200, 400, 500, 1000]), dl = r.pick([F(1, 10), F(1, 20)]), eps = r.pick([F(1, 10), F(5, 100)]);
      const v = mul(p, sub(F(1), p)), Vf = div(v, F(n)), bound = div(Vf, mul(dl, dl)), nmin = Math.ceil(val(div(v, mul(eps, mul(dl, dl)))) - 1e-12);
      if (nmin > 20000) return this.make(r);
      return { intro: `Dans une population, la proportion de personnes favorables à un projet est ${M(fracTex(p))}. On interroge ${M(n)} personnes au hasard et indépendamment ; ${M('F_n')} est la fréquence de personnes favorables dans l’échantillon.`,
        parts: [
          { w: 2, q: `Soit ${M('X_i')} la variable de Bernoulli valant ${M(1)} si la ${M('i')}-ième personne est favorable. Donner ${M('E(X_i)')} et ${M('V(X_i)')}.`, hint: 'Variable de Bernoulli de paramètre ' + M('p') + '.', a: `${M(`E(X_i)=${fracTex(p)}`)} et ${M(`V(X_i)=p(1-p)=${fracTex(v)}`)}.` },
          { w: 2, q: `Calculer ${M('E(F_n)')} et ${M('V(F_n)')} pour ${M(`n=${n}`)}.`, hint: `${M('F_n=\\dfrac{X_1+\\dots+X_n}{n}')} et indépendance.`, a: `${M(`E(F_n)=${fracTex(p)}`)} ; ${M(`V(F_n)=\\dfrac{${v.n}}{${v.d * n}}=${fracTex(Vf)}`)}.` },
          { w: 2, q: `Majorer ${M(`P\\left(|F_n-${fracTex(p)}|\\geqslant ${numTex(dl)}\\right)`)} avec l’inégalité de Bienaymé-Tchebychev.`, hint: `${M('P(|F-E(F)|\\geqslant\\delta)\\leqslant\\dfrac{V(F)}{\\delta^{2}}')}.`, a: `${M(`\\leqslant\\dfrac{${Vf.n}}{${Vf.d}\\times ${numTex(dl)}^{2}}=${fracTex(bound)}`)}.` },
          { w: 2, q: `Quelle taille d’échantillon garantit que cette probabilité soit au plus ${M(numTex(eps))} ?`, hint: `Résoudre ${M(`\\dfrac{${v.n}}{${v.d}\\,n\\times ${numTex(dl)}^{2}}\\leqslant ${numTex(eps)}`)}.`, a: `${M(`n\\geqslant ${fracTex(div(v, mul(eps, mul(dl, dl))))}`)}, donc ${M(`n=${nmin}`)}.` },
        ],
        ok: () => eq(v, mul(p, sub(F(1), p))) && eq(Vf, F(v.n, v.d * n)) && eq(bound, div(Vf, mul(dl, dl))) && nmin >= val(div(v, mul(eps, mul(dl, dl)))) - 1e-9 && nmin - 1 < val(div(v, mul(eps, mul(dl, dl)))) };
    } },

  { id: 'g-ter-droites-espace', cls: C, chapters: ['terminale-13'], domain: 'geometrie', level: 3, minutes: 25, title: 'Droites et plan : positions relatives',
    make(r) {
      const A = [r.int(-4, 4), r.int(-4, 4), r.int(-4, 4)]; let u, w; do { u = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)]; w = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)]; } while (cross(u, w).every((x) => x === 0) || u.every((x) => x === 0));
      const t0 = r.nz(-3, 3), s0 = r.nz(-3, 3), B = A.map((x, i) => x + t0 * u[i] - s0 * w[i]), K = A.map((x, i) => x + t0 * u[i]);
      let n, c0; do { n = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)]; c0 = r.int(-6, 6); } while (dot(n, u) === 0);
      const tt = F(-(dot(n, A) + c0), dot(n, u)), H = A.map((x, i) => add(F(x), mul(tt, F(u[i]))));
      const sys = (O, v, p) => `\\begin{cases}${['x', 'y', 'z'].map((c, i) => `${c}=${polyTex([v[i], O[i]], p)}`).join('\\\\')}\\end{cases}`;
      return { intro: `Dans un repère de l’espace, ${M(`d:\\ ${sys(A, u, 't')}`)} et ${M(`d':\\ ${sys(B, w, 's')}`)} (${M('t')}, ${M('s')} réels), et le plan ${M(`\\mathcal{P}:\\ ${lin([[n[0], 'x'], [n[1], 'y'], [n[2], 'z'], [c0, '']])}=0`)}.`,
        parts: [
          { w: 1, q: `Les droites ${M('d')} et ${M("d'")} sont-elles parallèles ?`, hint: 'Comparer leurs vecteurs directeurs.', a: `${M(`\\vec{u}${col(u)}`)} et ${M(`\\vec{w}${col(w)}`)} ne sont pas colinéaires : elles ne sont pas parallèles.` },
          { w: 2, q: `Montrer que ${M('d')} et ${M("d'")} sont sécantes et déterminer leur point d’intersection.`, hint: `Résoudre ${M('A+tu=B+sw')}.`, a: `Pour ${M(`t=${t0}`)} et ${M(`s=${s0}`)} on trouve les mêmes coordonnées : ${M(`K(${K.join('\\,;\\,')})`)} (les trois équations sont vérifiées).` },
          { w: 2, q: `Déterminer l’intersection de ${M('d')} et du plan ${M('\\mathcal{P}')}.`, hint: `Remplacer ${M('x,y,z')} par leur expression en ${M('t')} dans l’équation du plan.`, a: `${M(`${polyTex([dot(n, u), dot(n, A) + c0], 't')}=0`)} donne ${M(`t=${fracTex(tt)}`)} : ${M(`H\\left(${H.map(fracTex).join('\\,;\\,')}\\right)`)}.` },
        ],
        ok: () => [0, 1, 2].every((i) => A[i] + t0 * u[i] === B[i] + s0 * w[i]) && H.every((h, i) => Math.abs(val(h) - A[i] - val(tt) * u[i]) < 1e-9) && Math.abs(dot(n, H.map(val)) + c0) < 1e-9 && cross(u, w).some((x) => x !== 0) };
    } },

  { id: 'g-ter-trig-etude', cls: C, chapters: ['terminale-14'], domain: 'analyse', level: 3, minutes: 25, title: 'Étude d’une fonction trigonométrique',
    make(r) {
      const A = r.int(1, 60), f = (x) => A * (Math.sin(x) + Math.sin(2 * x) / 2), fp = (x) => A * (Math.cos(x) + Math.cos(2 * x));
      const co = A === 1 ? '' : A;
      return { intro: `Soit ${M(`f(x)=${co}\\left(\\sin x+\\dfrac{1}{2}\\sin 2x\\right)`)} définie sur ${M(R)}.`,
        parts: [
          { w: 2, q: `Étudier la parité de ${M('f')} et montrer que ${M('f')} est ${M('2\\pi')}-périodique. Sur quel intervalle suffit-il d’étudier ${M('f')} ?`, hint: `${M('\\sin(-x)=-\\sin x')} et ${M('\\sin(x+2\\pi)=\\sin x')}.`, a: `${M('f(-x)=-f(x)')} : ${M('f')} est impaire ; ${M('f(x+2\\pi)=f(x)')}. On étudie sur ${M('[0\\,;\\,\\pi]')}, puis on complète par symétrie centrale en ${M('O')} et par périodicité.` },
          { w: 2, q: `Montrer que ${M(`f'(x)=${co}(2\\cos x-1)(\\cos x+1)`)}.`, hint: `${M('\\cos 2x=2\\cos^{2}x-1')}.`, a: `${M(`f'(x)=${co}(\\cos x+\\cos 2x)=${co}\\left(2\\cos^{2}x+\\cos x-1\\right)=${co}(2\\cos x-1)(\\cos x+1)`)}.` },
          { w: 2, q: `Dresser le tableau de variations de ${M('f')} sur ${M('[0\\,;\\,\\pi]')}.`, hint: `${M('\\cos x+1\\geqslant 0')} ; signe de ${M('2\\cos x-1')}.`, a: `${M('2\\cos x-1>0\\iff x<\\dfrac{\\pi}{3}')} : ${M('f')} croît sur ${M('\\left[0\\,;\\,\\dfrac{\\pi}{3}\\right]')} puis décroît sur ${M('\\left[\\dfrac{\\pi}{3}\\,;\\,\\pi\\right]')}.` },
          { w: 1, q: 'Donner la valeur exacte du maximum de ' + M('f') + ' sur ' + M('[0\\,;\\,\\pi]') + '.', hint: `Calculer ${M('f\\left(\\dfrac{\\pi}{3}\\right)')}.`, a: `${M(`f\\left(\\dfrac{\\pi}{3}\\right)=${co}\\left(\\dfrac{\\sqrt{3}}{2}+\\dfrac{\\sqrt{3}}{4}\\right)=\\dfrac{${3 * A}\\sqrt{3}}{4}`)}.` },
        ],
        ok: () => [0.4, 1.3, 2.6].every((x) => near(nd(f, x), fp(x), 1e-3) && near(fp(x), A * (2 * Math.cos(x) - 1) * (Math.cos(x) + 1), 1e-9) && near(f(-x), -f(x), 1e-9) && near(f(x + 2 * Math.PI), f(x), 1e-9)) && near(f(Math.PI / 3), (3 * A * Math.sqrt(3)) / 4, 1e-9) && fp(Math.PI / 3 - 0.2) > 0 && fp(Math.PI / 3 + 0.2) < 0 };
    } },
];
tidyProblems(problemsTerminale);
