// Seeded multi-part problems for Terminale STMG (one per chapter 01 to 07): the numbers come from the seed, the correction is written with them,
// and ok() recomputes every quoted result another way. Same contract as problems.js: make(r) returns {intro, parts: [{w, q, hint, a}], ok()}.
import { F, add, sub, mul, div, val, eq, M, fracTex, numTex, roundTex, binom } from './engine.js';
import { dec } from './seconde-kit.js';
import { safeRound, binomP } from './stmg-kit.js';
import { tidyProblems } from './terminale-kit.js';

const C = 'stmg';
const nf = (x) => (Number.isInteger(x) ? `${x}` : roundTex(x, 2));
const dcs = (z) => String(z).replace('.', '{,}');
const eur = (x) => `${nf(x)}\\ \\text{€}`;

export const problemsStmg = tidyProblems([
  { id: 'g-stm-epargne', cls: C, chapters: ['stmg-01', 'stmg-02'], domain: 'suites', level: 2, minutes: 25, title: 'Deux placements',
    make(r) {
      const C0 = 500 * r.int(4, 16), d = r.pick([60, 80, 100, 120]), t = r.pick([2, 3, 4, 5]), q = 1 + t / 100, A = (n) => C0 + d * n, B = (n) => C0 * q ** n;
      let n = 1; while (B(n) <= A(n) && n < 300) n++;
      return { intro: `Léa dispose de ${M(eur(C0))}. Placement A : elle reçoit ${M(eur(d))} d’intérêts chaque année (le capital reste placé). Placement B : intérêts composés à ${M(`${t}\\,\\%`)} par an. On note ${M('a_n')} et ${M('b_n')} les capitaux après ${M('n')} années.`,
        parts: [
          { w: 1, q: `Quelle est la nature de chaque suite ? Exprimer ${M('a_n')} et ${M('b_n')} en fonction de ${M('n')}.`, hint: 'On ajoute la même somme, ou on multiplie par le même coefficient.', a: `${M('(a_n)')} est arithmétique de raison ${M(d)} : ${M(`a_n=${C0}+${d}n`)}. ${M('(b_n)')} est géométrique de raison ${M(dcs(q))} : ${M(`b_n=${C0}\\times ${dcs(q)}^{n}`)}.` },
          { w: 1, q: `Calculer les capitaux après ${M(5)} ans (arrondis au centime).`, a: `${M(`a_5=${nf(A(5))}\\ \\text{€}`)} ; ${M(`b_5\\approx ${nf(B(5))}\\ \\text{€}`)}.` },
          { w: 2, q: 'À partir de quelle année le placement B devient-il strictement plus avantageux que le placement A ?', hint: 'Tableau de valeurs de la calculatrice.', a: `${M(`b_{${n - 1}}\\approx ${nf(B(n - 1))}\\leqslant a_{${n - 1}}=${nf(A(n - 1))}`)} et ${M(`b_{${n}}\\approx ${nf(B(n))}>a_{${n}}=${nf(A(n))}`)} : dès l’année ${M(n)}.` },
          { w: 2, q: `Au bout de combien d’années le capital du placement B a-t-il doublé ?`, hint: 'Résoudre ' + M(`${dcs(q)}^{n}\\geqslant 2`) + ' avec le logarithme décimal.', a: `${M(`n\\geqslant\\dfrac{\\log 2}{\\log ${dcs(q)}}\\approx ${roundTex(Math.log10(2) / Math.log10(q), 2)}`)} : ${M(`n=${Math.ceil(Math.log10(2) / Math.log10(q))}`)} ans.` },
        ],
        ok: () => { let m = 0; while (C0 * q ** m < 2 * C0) m++; let k = 0; while (C0 * q ** k <= C0 + d * k) k++; return k === n && m === Math.ceil(Math.log(2) / Math.log(q)) && Math.abs(A(5) - (C0 + 5 * d)) < 1e-9; } };
    } },

  { id: 'g-stm-population', cls: C, chapters: ['stmg-03'], domain: 'fonctions', level: 2, minutes: 20, title: 'Une population qui croît',
    make(r) {
      const P0 = r.int(20, 90) * 1000, t = r.pick([2, 3, 4, 5, 6]), q = 1 + t / 100, T = Math.round((P0 * (1.5 + r.int(0, 10) / 10)) / 1000) * 1000, x = Math.log10(T / P0) / Math.log10(q), n = Math.ceil(x);
      return { intro: `Une ville compte ${M(P0)} habitants en 2020 et sa population augmente de ${M(`${t}\\,\\%`)} par an. On note ${M('p_n')} la population en ${M('2020+n')}.`,
        parts: [
          { w: 1, q: `Exprimer ${M('p_n')} en fonction de ${M('n')}. Quelle population prévoit-on en 2030 ?`, a: `${M(`p_n=${P0}\\times ${dcs(q)}^{n}`)} ; ${M(`p_{10}\\approx ${nf(Math.round(P0 * q ** 10))}`)} habitants.` },
          { w: 2, q: `Résoudre ${M(`p_n\\geqslant ${T}`)} avec le logarithme décimal.`, hint: M('\\log(a^{n})=n\\log a') + ' et ' + M(`\\log ${dcs(q)}>0`) + '.', a: `${M(`${dcs(q)}^{n}\\geqslant\\dfrac{${T}}{${P0}}`)} donc ${M(`n\\geqslant\\dfrac{\\log(${T}/${P0})}{\\log ${dcs(q)}}\\approx ${roundTex(x, 2)}`)} : ${M(`n=${n}`)}, soit en ${M(2020 + n)}.` },
          { w: 1, q: 'Vérifier à la calculatrice.', a: `${M(`p_{${n - 1}}\\approx ${nf(Math.round(P0 * q ** (n - 1)))}<${T}`)} et ${M(`p_{${n}}\\approx ${nf(Math.round(P0 * q ** n))}\\geqslant ${T}`)}.` },
        ],
        ok: () => P0 * q ** n >= T - 1e-6 && P0 * q ** (n - 1) < T && Math.abs(Math.exp(Math.log(T / P0) / 1) - T / P0) < 1e-9 && Math.abs(x - Math.log(T / P0) / Math.log(q)) < 1e-9 };
    } },

  { id: 'g-stm-cout-moyen', cls: C, chapters: ['stmg-04'], domain: 'fonctions', level: 2, minutes: 20, title: 'Le coût moyen de fabrication',
    make(r) {
      const a = r.int(3, 12), b = 100 * r.int(3, 20), target = a + r.int(1, 5), q1 = r.pick([10, 20, 25, 40, 50]), q2 = q1 * 2, Cm = (q) => a + b / q, n = Math.ceil(b / (target - a));
      return { intro: `Un artisan fabrique ${M('q')} objets (${M('q>0')}) pour un coût total ${M(`C(q)=${a}q+${b}`)} en euros. Le coût moyen par objet est ${M('C_m(q)=\\dfrac{C(q)}{q}')}.`,
        parts: [
          { w: 1, q: `Montrer que ${M(`C_m(q)=${a}+\\dfrac{${b}}{q}`)}.`, a: `${M(`C_m(q)=\\dfrac{${a}q+${b}}{q}=${a}+\\dfrac{${b}}{q}`)}.` },
          { w: 1, q: `Calculer ${M(`C_m(${q1})`)} et ${M(`C_m(${q2})`)}. Que constate-t-on ?`, a: `${M(`C_m(${q1})=${nf(Cm(q1))}\\ \\text{€}`)} et ${M(`C_m(${q2})=${nf(Cm(q2))}\\ \\text{€}`)} : le coût moyen diminue quand la production augmente.` },
          { w: 1, q: `Étudier le sens de variation de ${M('C_m')} sur ${M(']0\\,;\\,+\\infty[')}.`, hint: 'La fonction inverse est décroissante.', a: `${M(`\\dfrac{${b}}{q}`)} est décroissant (${M(b)} est positif), donc ${M('C_m')} est décroissante sur ${M(']0\\,;\\,+\\infty[')}.` },
          { w: 2, q: `Combien d’objets faut-il fabriquer pour que le coût moyen soit inférieur ou égal à ${M(eur(target))} ?`, a: `${M(`\\dfrac{${b}}{q}\\leqslant ${target - a}\\iff q\\geqslant\\dfrac{${b}}{${target - a}}${dec(F(b, target - a), 2)}`)} : au moins ${M(n)} objets.` },
        ],
        ok: () => { let q = 1; while (Cm(q) > target + 1e-12) q++; return q === n && Math.abs(Cm(q1) - (a * q1 + b) / q1) < 1e-12 && Cm(q2) < Cm(q1); } };
    } },

  { id: 'g-stm-regression', cls: C, chapters: ['stmg-05'], domain: 'stats-proba', level: 2, minutes: 25, title: 'Les ventes d’une boutique en ligne',
    make(r) {
      const n = 6, xs = [0, 1, 2, 3, 4, 5], A = r.pick([8, 10, 12, 15, 20]), B = r.int(40, 120), ys = xs.map((x) => A * x + B + r.int(-5, 5));
      const sx = 15, sy = ys.reduce((s, y) => s + y, 0), sxy = xs.reduce((s, x, i) => s + x * ys[i], 0), sxx = 55, a = (n * sxy - sx * sy) / (n * sxx - sx * sx), b = (sy - a * sx) / n, sa = safeRound(a, 2), sb = safeRound(b, 2);
      if (sa === null || sb === null) return this.make(r);
      const T = Math.round(a * 12 + b), nn = Math.ceil((T - b) / a);
      return { intro: `Les ventes mensuelles (en centaines d’articles) d’une boutique en ligne, pour les mois de rang ${M('x_i=0,\\ 1,\\ \\dots,\\ 5')}, sont ${M(`y_i=${ys.join(',\\ ')}`)}.`,
        parts: [
          { w: 1, q: 'Calculer les coordonnées du point moyen.', a: `${M(`\\bar{x}=\\dfrac{15}{6}=2{,}5`)} et ${M(`\\bar{y}=\\dfrac{${sy}}{6}\\approx ${roundTex(sy / 6, 2)}`)}.` },
          { w: 2, q: 'Déterminer à la calculatrice la droite de régression de ' + M('y') + ' en ' + M('x') + ' (coefficients arrondis au centième).', a: `${M(`y\\approx ${sa}x${sb.startsWith('-') ? '' : '+'}${sb}`)}.` },
          { w: 1, q: `Estimer les ventes au rang ${M(12)}.`, hint: 'Remplacer ' + M('x') + ' dans l’équation de la droite.', a: `${M(`y\\approx ${sa}\\times 12${sb.startsWith('-') ? '' : '+'}${sb}\\approx ${roundTex(a * 12 + b, 1)}`)}, soit environ ${M(T)} centaines d’articles.` },
          { w: 2, q: `À partir de quel rang les ventes dépasseront-elles ${M(T)} centaines d’articles selon ce modèle ?`, a: `${M(`${sa}x${sb.startsWith('-') ? '' : '+'}${sb}\\geqslant ${T}\\iff x\\geqslant\\dfrac{${T}-${sb.replace('{,}', '{,}')}}{${sa}}\\approx ${roundTex((T - b) / a, 2)}`)} : à partir du rang ${M(nn)}.` },
        ],
        ok: () => { const mx = xs.reduce((s, x) => s + x, 0) / n, my = sy / n; let num = 0, den = 0; xs.forEach((x, i) => { num += (x - mx) * (ys[i] - my); den += (x - mx) ** 2; }); const a2 = num / den, b2 = my - a2 * mx; return roundTex(a2, 2) === sa && roundTex(b2, 2) === sb && a2 * nn + b2 >= T - 1e-9 && a2 * (nn - 1) + b2 < T + 1e-9; } };
    } },

  { id: 'g-stm-depistage', cls: C, chapters: ['stmg-06'], domain: 'stats-proba', level: 3, minutes: 25, title: 'Un contrôle qualité',
    make(r) {
      const pA = F(r.int(2, 8) * 10, 100), pD1 = F(r.int(1, 4), 100), pD2 = F(r.int(5, 12), 100), nA = sub(F(1), pA), pD = add(mul(pA, pD1), mul(nA, pD2)), post = div(mul(nA, pD2), pD);
      return { intro: `Une usine a deux chaînes. La chaîne A fabrique ${M(`${numTex(F(pA.n * 100, pA.d))}\\,\\%`)} des pièces, la chaîne B le reste. ${M(`${numTex(F(pD1.n * 100, pD1.d))}\\,\\%`)} des pièces de A sont défectueuses, contre ${M(`${numTex(F(pD2.n * 100, pD2.d))}\\,\\%`)} de celles de B. On prélève une pièce au hasard.`,
        parts: [
          { w: 1, q: 'Représenter la situation par un arbre pondéré.', a: `Branches ${M('A')} (${M(numTex(pA))}) et ${M('B')} (${M(numTex(nA))}) ; puis défectueuse ${M(numTex(pD1))} / ${M(numTex(sub(F(1), pD1)))} sous ${M('A')}, ${M(numTex(pD2))} / ${M(numTex(sub(F(1), pD2)))} sous ${M('B')}.` },
          { w: 2, q: 'Calculer la probabilité que la pièce soit défectueuse.', hint: 'Formule des probabilités totales.', a: `${M(`P(D)=${numTex(pA)}\\times ${numTex(pD1)}+${numTex(nA)}\\times ${numTex(pD2)}=${numTex(pD)}`)}.` },
          { w: 2, q: 'La pièce est défectueuse : quelle est la probabilité qu’elle vienne de la chaîne B ? (arrondir au millième)', hint: M('P_D(B)=\\dfrac{P(B\\cap D)}{P(D)}') + '.', a: `${M(`P_D(B)=\\dfrac{${numTex(mul(nA, pD2))}}{${numTex(pD)}}${dec(post, 3)}`)}.` },
        ],
        ok: () => Math.abs(val(pD) - (val(pA) * val(pD1) + val(nA) * val(pD2))) < 1e-12 && eq(mul(post, pD), mul(nA, pD2)) && val(post) > 0 && val(post) < 1 };
    } },

  { id: 'g-stm-binomiale', cls: C, chapters: ['stmg-07'], domain: 'stats-proba', level: 3, minutes: 25, title: 'Un questionnaire à choix multiples',
    make(r) {
      const n = r.int(6, 20), c = r.pick([3, 4, 5]), p = 1 / c, k = r.int(2, Math.min(5, n - 2)), pk = binomP(n, p, k), sk = safeRound(pk, 3), E = n * p, atLeast = 1 - (1 - p) ** n;
      if (sk === null || safeRound(atLeast, 3) === null || atLeast > 0.998 || pk < 0.002) return this.make(r);
      return { intro: `Un questionnaire comporte ${M(n)} questions indépendantes, chacune avec ${M(c)} réponses proposées dont une seule est exacte. Un candidat répond au hasard. Soit ${M('X')} le nombre de bonnes réponses.`,
        parts: [
          { w: 1, q: `Justifier que ${M('X')} suit une loi binomiale et donner ses paramètres.`, a: `${M(n)} épreuves identiques et indépendantes, de succès (bonne réponse) de probabilité ${M(`\\dfrac{1}{${c}}`)} : ${M(`X\\sim\\mathcal{B}\\left(${n}\\,;\\,\\dfrac{1}{${c}}\\right)`)}.` },
          { w: 1, q: `Calculer l’espérance de ${M('X')}. Interpréter.`, a: `${M(`E(X)=np=\\dfrac{${n}}{${c}}\\approx ${roundTex(E, 2)}`)} : en moyenne le candidat obtient environ ${M(roundTex(E, 1))} bonnes réponses.` },
          { w: 2, q: `Calculer ${M(`P(X=${k})`)} au millième.`, hint: 'Formule ' + M('\\binom{n}{k}p^{k}(1-p)^{n-k}') + ' ou calculatrice.', a: `${M(`P(X=${k})=\\binom{${n}}{${k}}\\left(\\dfrac{1}{${c}}\\right)^{${k}}\\left(\\dfrac{${c - 1}}{${c}}\\right)^{${n - k}}\\approx ${sk}`)}.` },
          { w: 2, q: 'Calculer la probabilité d’obtenir au moins une bonne réponse (au millième).', a: `${M(`P(X\\geqslant 1)=1-P(X=0)=1-\\left(\\dfrac{${c - 1}}{${c}}\\right)^{${n}}\\approx ${safeRound(atLeast, 3)}`)}.` },
        ],
        ok: () => { let s = 0, t = (1 - p) ** n; for (let i = 0; i <= n; i++) { s += t; t *= ((n - i) / (i + 1)) * (p / (1 - p)); } let u = (1 - p) ** n; for (let i = 0; i < k; i++) u *= ((n - i) / (i + 1)) * (p / (1 - p)); return Math.abs(s - 1) < 1e-9 && roundTex(u, 3) === sk && roundTex(1 - (1 - p) ** n, 3) === safeRound(atLeast, 3) && Math.abs(binom(n, k) * p ** k * (1 - p) ** (n - k) - u) < 1e-12; } };
    } },
]);
