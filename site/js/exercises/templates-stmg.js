// Terminale STMG templates; same contract as templates-seconde.js. Chapter ids: content/data/manifest.json.
// Money and rates are written in euros and percent; rounded results say so in the statement.
import { F, add, sub, mul, div, val, eq, M, fracTex, numTex, roundTex, polyTex, binom, sum, sgn, par, decimals } from './engine.js';

const C = 'stmg';
const pw = (t, k) => (k === 1 ? t : `${t}^{${k}}`);   // no exponent 1
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
const pct = (t) => `${t > 0 ? '+' : '-'}${Math.abs(t)}\\,\\%`;
const euro = (x) => `${Number.isInteger(x) ? x : roundTex(x, 2)}\\ \\text{€}`;
// a rounding that does not sit on a knife edge: x*10^k must stay away from a half-integer
const safe = (x, k) => Math.abs(x * 10 ** k - Math.floor(x * 10 ** k) - 0.5) > 1e-6;

export const stmg = [
  { id: 'm-arith-seq', cls: C, chapter: 'stmg-01', domain: 'suites', skill: 'Suites arithmétiques', fast: true,
    make(r, level) {
      const u0 = 100 * r.int(2, 20), d = 10 * r.nz(-9, 15), u = (n) => u0 + n * d;
      if (level === 1) { const k = r.int(3, 8); return { q: `Un loyer vaut ${M(euro(u0))} la première année puis ${d < 0 ? 'baisse' : 'augmente'} de ${M(euro(Math.abs(d)))} par an. On note ${M('u_n')} le loyer l’année ${M('n')} (${M('u_0=' + u0)}). Calculer ${M(`u_{${k}}`)}.`, a: M(`u_{${k}}=${u0}${sgn(d)}\\times ${k}=${u(k)}`), ok: () => { let x = u0; for (let i = 0; i < k; i++) x += d; return x === u(k); } }; }
      if (level === 2) { const n = r.int(8, 20), tot = ((n + 1) * (u0 + u(n))) / 2; return { q: `Suite arithmétique ${M('(u_n)')} avec ${M(`u_0=${u0}`)} et ${M(`r=${d}`)}. Calculer ${M(`S=u_0+u_1+\\dots+u_{${n}}`)}.`, a: M(`S=\\dfrac{${n + 1}(${u0}+${par(u(n))})}{2}=${tot}`), ok: () => { let s = 0; for (let i = 0; i <= n; i++) s += u(i); return s === tot; } }; }
      const dd = Math.abs(d) || 10, up = d > 0, T = up ? u0 + dd * r.int(6, 15) + Math.floor(dd / 2) : u0 - dd * r.int(1, Math.floor(u0 / (2 * dd)) + 0) - Math.floor(dd / 2); const n = Math.ceil((T - u0) / (up ? dd : -dd) + (T % dd === 0 ? 1e-9 : 0));
      let first = 0; while (up ? u(first) <= T : u(first) >= T) first++;
      return { q: `Suite arithmétique ${M('(u_n)')} avec ${M(`u_0=${u0}`)} et ${M(`r=${d}`)}. Déterminer le plus petit entier ${M('n')} tel que ${M(`u_n${up ? '>' : '<'}${T}`)}.`, a: M(`n=${first}`), ok: () => (up ? u(first) > T && u(first - 1) <= T : u(first) < T && u(first - 1) >= T) };
    } },
  { id: 'm-geometric-seq', cls: C, chapter: 'stmg-01', domain: 'suites', skill: 'Suites géométriques et pourcentages', fast: false,
    make(r, level) {
      const t = r.pick([2, 3, 5, 10, 20]) * r.pick([1, 1, -1]), q = 1 + t / 100, u0 = 100 * r.int(5, 50), u = (n) => u0 * q ** n;
      const head = `Une valeur de ${M(euro(u0))} évolue de ${M(pct(t) + '\\text{ par an}')}. On note ${M('u_n')} sa valeur après ${M('n')} années.`;
      if (level === 1) return { q: `${head} Donner la nature de ${M('(u_n)')}, sa raison et ${M('u_1')}.`, a: M(`\\text{géométrique de raison }q=${roundTex(q, 2)}\\ ;\\ u_1=${roundTex(u(1), 2)}`), ok: () => near(q * 100, 100 + t, 1e-12) };
      if (level === 2) { const k = r.int(3, 6); const x = u(k); return { q: `${head} Exprimer ${M('u_n')} en fonction de ${M('n')} puis calculer ${M(`u_{${k}}`)} à ${M('0{,}01')} près.`, a: M(`u_n=${u0}\\times ${roundTex(q, 2)}^{n}\\ ;\\ u_{${k}}\\approx ${roundTex(x, 2)}`), ok: () => { let y = u0; for (let i = 0; i < k; i++) y *= q; return near(y, x, 1e-9); } }; }
      const n = r.int(4, 7), S = (u0 * (q ** (n + 1) - 1)) / (q - 1);
      return { q: `${head} Calculer ${M(`S=u_0+u_1+\\dots+u_{${n}}`)} à ${M('0{,}01')} près.`, a: M(`S=${u0}\\times\\dfrac{${roundTex(q, 2)}^{${n + 1}}-1}{${roundTex(q, 2)}-1}\\approx ${roundTex(S, 2)}`), ok: () => { let s = 0, y = u0; for (let i = 0; i <= n; i++) { s += y; y *= q; } return near(s, S, 1e-9); } };
    } },
  { id: 'm-cm', cls: C, chapter: 'stmg-02', domain: 'nombres', skill: 'Coefficient multiplicateur et évolutions', fast: true,
    make(r, level) {
      if (level === 1) { const p = 20 * r.int(2, 20), t = r.pick([5, 8, 10, 15, 20, 25]) * r.sign(); const res = F(p * (100 + t), 100); return { q: `Un prix de ${M(euro(p))} subit une évolution de ${M(pct(t))}. Donner le coefficient multiplicateur et le nouveau prix.`, a: M(`CM=${numTex(F(100 + t, 100))}\\ ;\\ \\text{nouveau prix }${numTex(res)}\\ \\text{€}`), ok: () => near(val(res), p * (1 + t / 100), 1e-12) }; }
      if (level === 2) { const t1 = r.pick([5, 10, 20, 25, 50]) * r.sign(), t2 = r.pick([5, 10, 20, 25, 50]) * r.sign(), cm = mul(F(100 + t1, 100), F(100 + t2, 100)), rate = mul(sub(cm, F(1)), F(100)); return { q: `Une grandeur évolue de ${M(pct(t1))} puis de ${M(pct(t2))}. Calculer le taux d’évolution global.`, a: M(`CM=${numTex(cm)}\\ \\text{ donc }${val(rate) >= 0 ? '+' : ''}${numTex(rate)}\\,\\%`), ok: () => near(val(cm), (1 + t1 / 100) * (1 + t2 / 100), 1e-12) }; }
      const up = r.next() < 0.6, t = up ? 5 * r.int(1, 60) : 5 * r.int(1, 12), cm = F(up ? 100 + t : 100 - t, 100);
      const back = F(100 * t, up ? 100 + t : 100 - t), k = decimals(back), exact = k >= 0 && k <= 2;
      return { q: `Après une ${up ? 'hausse' : 'baisse'} de ${M(`${t}\\,\\%`)}, quel taux d’évolution ramène à la valeur initiale ?`, a: M(`CM=\\dfrac{1}{${numTex(cm)}}\\ \\text{ donc }${exact ? `${up ? '-' : '+'}${numTex(back)}` : `\\approx ${up ? '-' : '+'}${roundTex(val(back), 1)}`}\\,\\%`),
        ok: () => near(val(cm) * (1 + (up ? -1 : 1) * val(back) / 100), 1, 1e-12) };
    } },
  { id: 'm-exp-evolution', cls: C, chapter: 'stmg-02', domain: 'fonctions', skill: 'Taux moyen et fonctions exponentielles', fast: false,
    make(r, level) {
      if (level === 1) { const a = r.pick([2, 3, 4, 5, -2, -3]), qq = r.pick([2, 3]), k = r.int(2, 5); const f = (x) => a * qq ** x; return { q: `Soit ${M(`f(x)=${a}\\times ${qq}^{x}`)}. Calculer ${M(`f(${k})`)}.`, a: M(`f(${k})=${a}\\times ${qq ** k}=${f(k)}`), ok: () => { let y = a; for (let i = 0; i < k; i++) y *= qq; return y === f(k); } }; }
      const trim = (s) => s.replace(/(\{,\}\d*?)0+$/, '$1').replace(/\{,\}$/, '');
      let t, n, tot;
      do { t = r.pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50]) * (r.next() < 0.75 ? 1 : -1); n = level === 2 ? 2 : r.pick([3, 4, 5]); tot = (1 + t / 100) ** n - 1; } while (tot > 3);
      const shown = roundTex(Math.abs(tot) * 100, 2), exact = Math.abs(Math.abs(tot) * 100 - Number(shown.replace('{,}', '.'))) < 1e-9;
      const root = n === 2 ? '\\sqrt{' : `\\sqrt[${n}]{`;
      return { q: `Un prix ${t > 0 ? 'augmente' : 'baisse'} de ${M(`${trim(shown)}\\,\\%`)} en ${M(n)} ans, avec le même taux chaque année${exact ? '' : ' (pourcentage arrondi au centième)'}. Déterminer le taux annuel moyen.`,
        a: M(`CM_{\\text{global}}=${trim(roundTex(1 + tot, 4))}\\ ;\\ CM=${root}CM_{\\text{global}}}${exact ? '=' : '\\approx '}${numTex(F(100 + t, 100))}\\ \\text{ donc }${exact ? '' : '\\approx '}${t > 0 ? '+' : '-'}${Math.abs(t)}\\,\\%`), ok: () => near((1 + tot) ** (1 / n), 1 + t / 100, 1e-9) };
    } },
  { id: 'm-threshold', cls: C, chapter: 'stmg-03', domain: 'fonctions', skill: 'Seuil avec le logarithme décimal', fast: false,
    make(r, level) {
      for (;;) {
        const C0 = 100 * r.int(5, 40), t = r.pick([2, 3, 5, 10, 20]), q = 1 + t / 100, mult = r.pick([2, 3, 1.5, 2.5]), T = C0 * mult, x = Math.log(mult) / Math.log(q);
        if (Math.abs(x - Math.round(x)) < 1e-6 || x > 60) continue;
        const n = Math.floor(x) + 1;
        return { q: `Un capital de ${M(euro(C0))} est placé à intérêts composés au taux de ${M(`${t}\\,\\%`)} par an. À partir de combien d’années le capital dépasse-t-il ${M(euro(T))} ? On utilisera la fonction ${M('\\log')}.`, a: M(`${C0}\\times ${roundTex(q, 2)}^{n}>${T}\\iff n>\\dfrac{\\log(${roundTex(mult, 1)})}{\\log(${roundTex(q, 2)})}\\approx ${roundTex(x, 2)}\\ ;\\ n=${n}`), ok: () => C0 * q ** n > T && C0 * q ** (n - 1) <= T };
      }
    } },
  { id: 'm-inverse', cls: C, chapter: 'stmg-04', domain: 'fonctions', skill: 'Fonction inverse', fast: true,
    make(r, level) {
      const k = r.pick([1, 2, 3, 4, 5, 6, 8, 10, 12]), kk = k * r.sign();
      if (level === 1) { const x0 = r.pick([1, 2, 3, 4, 5, -1, -2, -4]); const res = F(kk, x0); return { q: `Soit ${M(`f(x)=\\dfrac{${kk}}{x}`)} sur ${M('\\mathbb{R}^{*}')}. Calculer ${M(`f(${x0})`)}.`, a: M(`f(${x0})=${fracTex(res)}`), ok: () => near(val(res) * x0, kk, 1e-12) }; }
      const c = r.int(1, 6), x0 = F(kk, c);
      if (level === 2) return { q: `Résoudre dans ${M('\\left]0\\,;\\,+\\infty\\right[')} : ${M(`\\dfrac{${kk}}{x}=${c}`)}.`, a: M(`S=\\left\\{${fracTex(x0)}\\right\\}`), ok: () => near(kk / val(x0), c, 1e-12) && val(x0) > 0 === kk > 0 };
      const resultKnown = kk > 0 ? `S=\\left[${fracTex(x0)}\\,;\\,+\\infty\\right[` : `S=\\left]0\\,;\\,+\\infty\\right[`;
      return { q: `Résoudre dans ${M('\\left]0\\,;\\,+\\infty\\right[')} : ${M(`\\dfrac{${kk}}{x}\\leqslant ${c}`)}.`, a: M(resultKnown), s: kk > 0 ? 'La fonction inverse est strictement décroissante sur ]0 ; +∞[.' : 'Un nombre négatif est toujours inférieur à un nombre strictement positif.', ok: () => { for (let i = 1; i <= 60; i++) { const x = i / 4; if ((kk / x <= c) !== (kk > 0 ? x >= val(x0) : true)) return false; } return true; } };
    } },
  { id: 'm-stats2', cls: C, chapter: 'stmg-05', domain: 'stats-proba', skill: 'Ajustement affine et point moyen', fast: false,
    make(r, level) {
      const n = 5, xs = [1, 2, 3, 4, 5].map((x) => x + (level === 3 ? 2018 - 1 : 0)), slope = r.nz(-4, 8); let ys; do { ys = xs.map((x, i) => 20 + slope * (i + 1) + r.int(-3, 3)); } while (false);
      const mx = xs.reduce((s, x) => s + x, 0) / n, my = ys.reduce((s, y) => s + y, 0) / n;
      const table = `\\begin{array}{c|ccccc}x_i&${xs.join('&')}\\\\\\hline y_i&${ys.join('&')}\\end{array}`;
      if (level === 1) return { q: `Série statistique : ${M(table)}. Calculer les coordonnées du point moyen ${M('G')}.`, a: M(`G\\left(${numTex(F(mx * 10, 10))}\\,;\\,${numTex(F(Math.round(my * 10), 10))}\\right)`), ok: () => near(xs.reduce((s, x) => s + x, 0), mx * n, 1e-12) && near(ys.reduce((s, y) => s + y, 0), my * n, 1e-12) };
      const a = r.nz(-3, 6), b = F(Math.round(my * 10) - a * Math.round(mx * 10), 10);
      if (level === 2) { const x1 = xs[4] + r.int(1, 3); const bb = r.int(-20, 40); return { q: `Un ajustement affine de la série est ${M(`y=${polyTex([a, bb])}`)}. Estimer ${M('y')} pour ${M(`x=${x1}`)}.`, a: M(`y=${a}\\times ${x1}${bb === 0 ? '' : sgn(bb)}=${a * x1 + bb}`), ok: () => a * x1 + bb === evalLine(a, bb, x1) }; }
      return { q: `Série statistique : ${M(table)}. La droite d’ajustement de coefficient directeur ${M(a)} passe par le point moyen ${M('G')}. Déterminer son équation réduite.`, a: M(`G(${numTex(F(Math.round(mx * 10), 10))}\\,;\\,${numTex(F(Math.round(my * 10), 10))})\\ ;\\ y=${a === 1 ? '' : a === -1 ? '-' : a}x${val(b) === 0 ? '' : (val(b) < 0 ? '-' : '+') + numTex(F(Math.abs(b.n), b.d))}`), ok: () => near(a * mx + val(b), my, 1e-9) };
    } },
  { id: 'm-proba-table', cls: C, chapter: 'stmg-06', domain: 'stats-proba', skill: 'Probabilités conditionnelles d’un tableau', fast: false,
    make(r, level) {
      const a = r.int(4, 30), b = r.int(4, 30), c = r.int(4, 30), d = r.int(4, 30), n = a + b + c + d;
      const table = `\\begin{array}{c|cc|c}&B&\\overline{B}&\\text{Total}\\\\\\hline A&${a}&${b}&${a + b}\\\\\\overline{A}&${c}&${d}&${c + d}\\\\\\hline \\text{Total}&${a + c}&${b + d}&${n}\\end{array}`;
      const pA = F(a + b, n), pB = F(a + c, n), pAB = F(a, n), pAgB = F(a, a + c), pBgA = F(a, a + b);
      const head = `Dans une population de ${M(n)} personnes : ${M(table)}. On choisit une personne au hasard.`;
      if (level === 1) return { q: `${head} Calculer ${M('P(A)')} et ${M('P(B)')}.`, a: M(`P(A)=${fracTex(pA)}\\ ;\\ P(B)=${fracTex(pB)}`), ok: () => near(val(pA) * n, a + b, 1e-12) };
      if (level === 2) return { q: `${head} Calculer ${M('P(A\\cap B)')} puis ${M('P_A(B)')}.`, a: M(`P(A\\cap B)=${fracTex(pAB)}\\ ;\\ P_A(B)=\\dfrac{${a}}{${a + b}}=${fracTex(pBgA)}`), ok: () => near(val(pBgA) * val(pA), val(pAB), 1e-12) };
      const indep = eq(mul(pA, pB), pAB);
      return { q: `${head} Calculer ${M('P_B(A)')}, puis dire si ${M('A')} et ${M('B')} sont indépendants.`, a: M(`P_B(A)=${fracTex(pAgB)}\\ ;\\ P(A)P(B)=${fracTex(mul(pA, pB))}\\ ${indep ? '=' : '\\neq'}\\ ${fracTex(pAB)}`) + (indep ? ' : indépendants.' : ' : non indépendants.'), ok: () => indep === (a * n === (a + b) * (a + c)) };
    } },
  { id: 'm-binomial', cls: C, chapter: 'stmg-07', domain: 'stats-proba', skill: 'Loi binomiale (calculatrice)', fast: false,
    make(r, level) {
      for (;;) {
        const n = r.int(4, 12), p = r.pick([0.2, 0.3, 0.4, 0.5, 0.6, 0.1]), k = r.int(1, n - 1);
        const head = `${M('X')} suit la loi binomiale ${M(`\\mathcal{B}(${n}\\,;\\,${roundTex(p, 1)})`)}.`;
        const pk = binom(n, k) * p ** k * (1 - p) ** (n - k), atLeast = 1 - (1 - p) ** n;
        if (level === 1) return { q: `${head} Calculer l’espérance ${M('E(X)')}.`, a: M(`E(X)=${n}\\times ${roundTex(p, 1)}=${roundTex(n * p, 1).replace('{,}0', '')}`), ok: () => near(n * p, [...Array(n + 1).keys()].reduce((s, i) => s + i * binom(n, i) * p ** i * (1 - p) ** (n - i), 0), 1e-9) };
        if (level === 2) { if (!safe(pk, 3)) continue; return { q: `${head} Calculer ${M(`P(X=${k})`)} à ${M('10^{-3}')} près.`, a: M(`P(X=${k})=\\dbinom{${n}}{${k}}\\times ${pw(roundTex(p, 1), k)}\\times ${pw(roundTex(1 - p, 1), n - k)}\\approx ${roundTex(pk, 3)}`), ok: () => { let pmf = (1 - p) ** n; for (let i = 0; i < k; i++) pmf *= ((n - i) / (i + 1)) * (p / (1 - p)); return near(pmf, pk, 1e-9); } }; }
        if (!safe(atLeast, 3)) continue;
        return { q: `${head} Calculer ${M('P(X\\geqslant 1)')} à ${M('10^{-3}')} près.`, a: M(`P(X\\geqslant 1)=1-P(X=0)=1-${roundTex(1 - p, 1)}^{${n}}\\approx ${roundTex(atLeast, 3)}`), ok: () => { let s = 0; for (let i = 1; i <= n; i++) s += binom(n, i) * p ** i * (1 - p) ** (n - i); return near(s, atLeast, 1e-9); } };
      }
    } },
];
const evalLine = (a, b, x) => a * x + b;
