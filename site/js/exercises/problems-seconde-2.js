// Seeded problems for Seconde, chapters 06 to 15 (continuation of problems-seconde.js, same contract):
// make(r) returns {intro, parts: [{w, q, hint?, a}], ok()}; ok() recomputes the quoted results.
import { F, add, sub, mul, div, val, eq, M, fracTex, numTex, roundTex, polyTex, evalPoly, sgn, par, gcd, decimals, sqrtTex } from './engine.js';
import { pt, vc, setTex, lin, affTex, ivTex, ivHas, E, Einf, dec, parT } from './seconde-kit.js';

const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
const sum = (l) => l.reduce((s, x) => s + x, 0);
const list = (l) => l.join('\\ ;\\ ');
const P = (r, lo = -6, hi = 6) => [r.int(lo, hi), r.int(lo, hi)];
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const solTex = (l) => (l.length ? `S=\\left\\{${l.map(fracTex).join('\\,;\\,')}\\right\\}` : 'S=\\varnothing');
const sortF = (l) => { const u = []; l.forEach((f) => { if (!u.some((g) => eq(g, f))) u.push(f); }); return u.sort((a, b) => val(a) - val(b)); };
const pcT = (f) => `${numTex(f)}\\,\\%`;
const median = (s) => { const n = s.length; return n % 2 ? F(s[(n - 1) / 2]) : F(s[n / 2 - 1] + s[n / 2], 2); };
const C = 'seconde';
const POP = [
  ['élèves d’un lycée', ['filles', 'garçons'], ['demi-pensionnaires', 'externes']],
  ['clients d’une salle de sport', ['clients de moins de 30 ans', 'clients de 30 ans ou plus'], ['abonnés', 'non-abonnés']],
  ['salariés d’une entreprise', ['salariés à temps plein', 'salariés à temps partiel'], ['télétravailleurs', 'non-télétravailleurs']],
  ['pièces produites par une usine', ['pièces de la machine A', 'pièces de la machine B'], ['pièces défectueuses', 'pièces conformes']],
];
const tableTex = (rows, cols, a, b, c, d) => `\\begin{array}{l|cc|c}&\\text{${cols[0]}}&\\text{${cols[1]}}&\\text{Total}\\\\\\hline\\text{${cap(rows[0])}}&${a}&${b}&${a + b}\\\\\\text{${cap(rows[1])}}&${c}&${d}&${c + d}\\\\\\hline\\text{Total}&${a + c}&${b + d}&${a + b + c + d}\\end{array}`;
const freqTex = (n, m, k = 1) => `\\dfrac{${n}}{${m}}${dec(mul(F(n, m), F(100)), k)}\\,\\%`;

export const problemsSeconde2 = [
  // ================= 06 Fonctions =================
  { id: 'g-sec-image-antecedent', cls: C, chapters: ['seconde-06'], domain: 'fonctions', level: 1, minutes: 15, title: 'Images, antécédents, tableau de valeurs',
    make(r) {
      const a = r.nz(-3, 3), b = r.nz(-6, 6), c = r.int(-9, 9), f = (x) => a * x * x + b * x + c, k1 = r.int(-5, -1), k2 = r.int(1, 6), xs = [-2, -1, 0, 1, 2], z = F(-b, a);
      const xm = r.int(-4, 4), off = r.pick([0, 0, 1, -2]);
      return { intro: `On considère la fonction ${M('f')} définie sur ${M('\\mathbb{R}')} par ${M(`f(x)=${polyTex([a, b, c])}`)}.`,
        parts: [
          { w: 1, q: `Calculer les images de ${M(k1)} et de ${M(k2)} par ${M('f')}.`, hint: 'Remplacer x par le nombre entre parenthèses, en respectant les priorités : le carré avant le produit.', a: `${M(`f(${k1})=${a}\\times ${par(k1)}^{2}${b < 0 ? '-' : '+'}${Math.abs(b)}\\times ${par(k1)}${c ? sgn(c) : ''}=${f(k1)}`)} et ${M(`f(${k2})=${f(k2)}`)}.` },
          { w: 1, q: `Recopier et compléter le tableau de valeurs pour ${M('x')} allant de ${M(-2)} à ${M(2)}.`, a: M(`\\begin{array}{|c|c|c|c|c|c|}\\hline x&${xs.join('&')}\\\\\\hline f(x)&${xs.map(f).join('&')}\\\\\\hline\\end{array}`) },
          { w: 2, q: `Déterminer les antécédents de ${M(c)} par ${M('f')}.`, hint: `Résoudre ${M(`f(x)=${c}`)}, puis factoriser par ${M('x')}.`, a: `${M(`f(x)=${c}\\iff ${polyTex([a, b, 0])}=0\\iff x(${polyTex([a, b])})=0`)} : les antécédents sont ${M(0)} et ${M(fracTex(z))}.` },
          { w: 1, q: `Le point ${M(`M(${xm}\\,;\\,${f(xm) + off})`)} appartient-il à la courbe de ${M('f')} ?`, a: off === 0 ? `Oui : ${M(`f(${xm})=${f(xm)}`)}.` : `Non : ${M(`f(${xm})=${f(xm)}\\neq ${f(xm) + off}`)}.` },
        ],
        ok: () => f(0) === c && near(a * val(z) ** 2 + b * val(z) + c, c) && evalPoly([a, b, c], k1) === f(k1) };
    } },
  { id: 'g-sec-domaine-courbe', cls: C, chapters: ['seconde-06'], domain: 'fonctions', level: 2, minutes: 15, title: 'Une fonction homographique',
    make(r) {
      const p = r.nz(-4, 4), q = r.int(-9, 9), c = r.nz(-5, 5); if (q + p * c === 0) return this.make(r); let k; do { k = r.nz(-6, 6); } while (k === p);
      const x2 = c + 1 === 0 ? c + 2 : c + 1, f = (x) => F(p * x + q, x - c), x0 = F(q + k * c, k - p), num = polyTex([p, q]), den = `x${sgn(-c)}`;
      const D = [{ lo: Einf, hi: E(c), lc: false, hc: false }, { lo: E(c), hi: Einf, lc: false, hc: false }];
      return { intro: `On considère la fonction ${M(`f(x)=\\dfrac{${num}}{${den}}`)}.`,
        parts: [
          { w: 1, q: `Déterminer l’ensemble de définition ${M('D_f')}.`, a: `Le dénominateur s’annule en ${M(c)} : ${M(`D_f=${ivTex(D)}`)}.` },
          { w: 1, q: `Calculer ${M('f(0)')} et ${M(`f(${x2})`)}.`, a: `${M(`f(0)=\\dfrac{${q}}{${-c}}=${fracTex(f(0))}`)} et ${M(`f(${x2})=\\dfrac{${p * x2 + q}}{${x2 - c}}=${fracTex(f(x2))}`)}.` },
          { w: 2, q: `Déterminer le ou les antécédents de ${M(k)} par ${M('f')}.`, hint: `Pour ${M(`x\\neq ${c}`)}, l’équation ${M(`f(x)=${k}`)} équivaut à ${M(`${num}=${k}(${den})`)}.`, a: `Pour ${M(`x\\neq ${c}`)} : ${M(`${num}=${k}(${den})\\iff ${polyTex([p - k, q + k * c])}=0\\iff x=${fracTex(x0)}`)}, valeur autorisée : l’antécédent est ${M(fracTex(x0))}.` },
          { w: 1, q: `Le nombre ${M(p)} a-t-il un antécédent par ${M('f')} ?`, hint: `Écrire l’équation ${M(`f(x)=${p}`)} et la simplifier.`, a: `${M(`${num}=${p}(${den})\\iff ${q}=${-p * c}`)}, ce qui est faux : ${M(p)} n’a pas d’antécédent.` },
        ],
        ok: () => eq(mul(f(val(x0)) && F(p * val(x0) + q), F(1)), F(p * val(x0) + q)) && near((p * val(x0) + q) / (val(x0) - c), k) && !eq(x0, F(c)) && q !== -p * c };
    } },
  { id: 'g-sec-fonctions-reference', cls: C, chapters: ['seconde-06'], domain: 'fonctions', level: 2, minutes: 15, title: 'Équations et inéquations avec les fonctions de référence',
    make(r) {
      const a = r.int(2, 12) ** 2, b = r.int(2, 30), sb = Math.sqrt(b), c = r.int(2, 9), d = r.int(2, 15), e = r.int(1, 20);
      const rb = Number.isInteger(sb) ? `${sb}` : `\\sqrt{${b}}`;
      return { intro: `Résoudre dans ${M('\\mathbb{R}')}, en s’appuyant sur les courbes des fonctions de référence, les équations et inéquations ${M(`x^{2}=${a}`)}, ${M(`x^{2}<${b}`)}, ${M(`\\dfrac{1}{x}\\geqslant\\dfrac{1}{${c}}`)}, ${M(`\\sqrt{x}=${d}`)} et ${M(`|x|\\geqslant ${e}`)}.`,
        parts: [
          { w: 1, q: M(`x^{2}=${a}`), a: M(`S=\\{-${Math.sqrt(a)}\\,;\\,${Math.sqrt(a)}\\}`) },
          { w: 2, q: M(`x^{2}<${b}`), hint: 'La parabole est sous la droite horizontale entre les deux points d’intersection.', a: M(`S=]-${rb}\\,;\\,${rb}[`) },
          { w: 2, q: M(`\\dfrac{1}{x}\\geqslant\\dfrac{1}{${c}}`), hint: 'Pour x négatif, 1/x est négatif : distinguer les deux branches de l’hyperbole.', a: `Pour ${M('x<0')}, ${M('\\dfrac{1}{x}<0')} : aucune solution. Pour ${M('x>0')}, la fonction inverse est décroissante : ${M(`\\dfrac{1}{x}\\geqslant\\dfrac{1}{${c}}\\iff x\\leqslant ${c}`)}. ${M(`S=]0\\,;\\,${c}]`)}.` },
          { w: 1, q: M(`\\sqrt{x}=${d}`), a: M(`S=\\{${d * d}\\}`) },
          { w: 1, q: M(`|x|\\geqslant ${e}`), a: M(`S=]-\\infty\\,;\\,-${e}]\\cup[${e}\\,;\\,+\\infty[`) },
        ],
        ok: () => Number.isInteger(Math.sqrt(a)) && [0.5, 1, c].every((x) => 1 / x >= 1 / c - 1e-12) && 1 / (c + 0.5) < 1 / c && (sb - 1e-6) ** 2 < b };
    } },
  { id: 'g-sec-allee-jardin', cls: C, chapters: ['seconde-06', 'seconde-08'], domain: 'fonctions', level: 3, minutes: 25, title: 'Une allée dans un jardin',
    make(r) {
      const l = r.int(8, 20), L = l + r.int(2, 15), x0 = r.int(1, l - 1), T = (L - x0) * (l - x0), x1 = L + l - x0, f = (x) => (L - x) * (l - x), k = r.int(1, l - 1);
      return { intro: `Un jardin rectangulaire mesure ${M(`${L}\\ \\text{m}`)} sur ${M(`${l}\\ \\text{m}`)}. On trace le long de deux côtés consécutifs une allée de largeur ${M('x')} mètres : il reste un rectangle de côtés ${M(`${L}-x`)} et ${M(`${l}-x`)}. On note ${M('f(x)')} l’aire restante en ${M('\\text{m}^2')}.`,
        parts: [
          { w: 1, q: `Dans quel intervalle ${M('x')} peut-il varier ?`, a: `L’allée ne peut pas dépasser la largeur du jardin : ${M(`x\\in[0\\,;\\,${l}]`)}.` },
          { w: 1, q: `Exprimer ${M('f(x)')} puis le développer.`, a: M(`f(x)=(${L}-x)(${l}-x)=${polyTex([1, -(L + l), L * l])}`) },
          { w: 1, q: `Calculer ${M(`f(${k})`)} et interpréter.`, a: `${M(`f(${k})=${L - k}\\times ${l - k}=${f(k)}`)} : avec une allée de ${M(`${k}\\ \\text{m}`)}, il reste ${M(`${f(k)}\\ \\text{m}^2`)}.` },
          { w: 3, q: `On veut qu’il reste exactement ${M(`${T}\\ \\text{m}^2`)}. Vérifier que cela revient à ${M(`(x-${x0})(x-${x1})=0`)}, puis conclure.`, hint: `Développer ${M(`(x-${x0})(x-${x1})`)} et comparer avec ${M(`f(x)-${T}`)}.`, a: `${M(`f(x)-${T}=${polyTex([1, -(L + l), L * l - T])}`)} et ${M(`(x-${x0})(x-${x1})=${polyTex([1, -(x0 + x1), x0 * x1])}`)} : ce sont les mêmes. Les solutions sont ${M(x0)} et ${M(x1)} ; seule ${M(`x=${x0}`)} appartient à ${M(`[0\\,;\\,${l}]`)}. L’allée doit mesurer ${M(`${x0}\\ \\text{m}`)}.` },
        ],
        ok: () => f(x0) === T && f(x1) === T && x1 > l && x0 * x1 === L * l - T && x0 + x1 === L + l };
    } },
  { id: 'g-sec-altitude', cls: C, chapters: ['seconde-06', 'seconde-10'], domain: 'fonctions', level: 1, minutes: 12, title: 'Température et altitude',
    make(r) {
      const T0 = r.int(12, 30), k = r.pick([5, 6, 7]), h1 = 100 * r.int(5, 15), h2 = 100 * r.int(16, 40), T = (h) => T0 - (k * h) / 1000, hz = F(1000 * T0, k);
      return { intro: `Au pied d’une montagne (altitude ${M('0')}), la température est de ${M(T0)} degrés Celsius. On admet qu’elle baisse de ${M(numTex(F(k, 10)))} degré tous les ${M('100')} mètres. On note ${M('T(h)')} la température à l’altitude ${M('h')} mètres.`,
        parts: [
          { w: 1, q: `Justifier que ${M(`T(h)=${T0}-${numTex(F(k, 1000))}h`)}.`, a: `Pour ${M('h')} mètres, la baisse est ${M(`${numTex(F(k, 10))}\\times\\dfrac{h}{100}=${numTex(F(k, 1000))}h`)} : ${M('T')} est affine.` },
          { w: 1, q: `Calculer la température à ${M(h1)} m et à ${M(h2)} m.`, a: `${M(`T(${h1})=${numTex(F(1000 * T0 - k * h1, 1000))}`)} et ${M(`T(${h2})=${numTex(F(1000 * T0 - k * h2, 1000))}`)} degrés.` },
          { w: 2, q: 'À partir de quelle altitude la température devient-elle négative ? (arrondir au mètre)', hint: 'Résoudre T(h) < 0 : c’est une inéquation du premier degré.', a: `${M(`${T0}-${numTex(F(k, 1000))}h<0\\iff h>\\dfrac{${T0}}{${numTex(F(k, 1000))}}`)}, soit ${M(`h>${dec(hz, 0).replace(/^=/, '').replace('\\approx ', '')}`)} environ : au-dessus de ${M(`${Math.round(val(hz))}\\ \\text{m}`)}.` },
          { w: 1, q: `Quel est le sens de variation de ${M('T')} ? Pourquoi ?`, a: `${M('T')} est affine de coefficient ${M(`-${numTex(F(k, 1000))}<0`)} : elle est strictement décroissante.` },
        ],
        ok: () => near(T(h1), (1000 * T0 - k * h1) / 1000) && near(T(val(hz)), 0) && T(val(hz) + 1) < 0 };
    } },

  // ================= 07 Statistiques =================
  { id: 'g-sec-notes-classe', cls: C, chapters: ['seconde-07'], domain: 'stats-proba', level: 1, minutes: 12, title: 'Les notes d’un devoir',
    make(r) {
      const n = r.int(9, 13), v = Array.from({ length: n }, () => r.int(4, 20)), s = [...v].sort((x, y) => x - y), m = F(sum(v), n), me = median(s), add1 = r.int(0, 20);
      return { intro: `Voici les notes sur 20 obtenues par ${n} élèves : ${M(list(v))}.`,
        parts: [
          { w: 1, q: 'Ranger les notes dans l’ordre croissant et donner l’étendue.', a: `${M(list(s))} ; étendue ${M(`${s[n - 1]}-${s[0]}=${s[n - 1] - s[0]}`)}.` },
          { w: 2, q: 'Calculer la moyenne (arrondir au centième si besoin).', a: M(`\\bar{x}=\\dfrac{${sum(v)}}{${n}}${dec(m)}`) },
          { w: 1, q: 'Déterminer la médiane et l’interpréter.', hint: n % 2 ? `${n} est impair : la médiane est la valeur de rang ${(n + 1) / 2}.` : `${n} est pair : prendre la moyenne des valeurs de rangs ${n / 2} et ${n / 2 + 1}.`, a: `${M(`\\text{Me}=${numTex(me)}`)} : au moins la moitié des élèves ont une note inférieure ou égale à ${M(numTex(me))}, et au moins la moitié une note supérieure ou égale.` },
          { w: 1, q: `Un élève absent obtient ${M(add1)} au rattrapage. Calculer la nouvelle moyenne.`, a: M(`\\dfrac{${sum(v)}+${add1}}{${n + 1}}${dec(F(sum(v) + add1, n + 1))}`) },
        ],
        ok: () => near(val(m), v.reduce((a, b) => a + b, 0) / n) && s.filter((x) => x <= val(me)).length >= n / 2 && s.filter((x) => x >= val(me)).length >= n / 2 };
    } },
  { id: 'g-sec-quartiles', cls: C, chapters: ['seconde-07'], domain: 'stats-proba', level: 2, minutes: 20, title: 'Quartiles et diagramme en boîte',
    make(r) {
      const xs = [], ns = []; let x = r.int(1, 4); for (let i = 0; i < 6; i++) { xs.push(x); ns.push(r.int(2, 12)); x += r.int(1, 3); }
      const N = sum(ns), flat = xs.flatMap((v, i) => Array(ns[i]).fill(v)), q1 = flat[Math.ceil(N / 4) - 1], q3 = flat[Math.ceil((3 * N) / 4) - 1], me = median(flat), cum = ns.map((_, i) => sum(ns.slice(0, i + 1)));
      const ctx = r.pick(['le nombre de livres lus en un an par des adhérents d’une médiathèque', 'le nombre de buts marqués par match par une équipe sur une saison', 'le nombre de passagers par trajet d’un service de covoiturage', 'la durée en heures de travail personnel hebdomadaire d’élèves']);
      return { intro: `Le tableau donne ${ctx} : ${M(`\\begin{array}{|l|${'c|'.repeat(6)}}\\hline\\text{Valeur}&${xs.join('&')}\\\\\\hline\\text{Effectif}&${ns.join('&')}\\\\\\hline\\end{array}`)}`,
        parts: [
          { w: 1, q: 'Calculer l’effectif total et les effectifs cumulés croissants.', a: `${M(`N=${N}`)} ; effectifs cumulés : ${M(list(cum))}.` },
          { w: 2, q: `Déterminer la médiane.`, hint: N % 2 ? `Valeur de rang ${(N + 1) / 2}.` : `Moyenne des valeurs de rangs ${N / 2} et ${N / 2 + 1}.`, a: M(`\\text{Me}=${numTex(me)}`) },
          { w: 2, q: `Déterminer les quartiles ${M('Q_1')} et ${M('Q_3')}, puis l’écart interquartile.`, hint: `${M('Q_1')} est la valeur de rang ${M(`\\lceil N/4\\rceil`.replace('\\lceil N/4\\rceil', `${Math.ceil(N / 4)}`))}, ${M('Q_3')} celle de rang ${M(`${Math.ceil((3 * N) / 4)}`)}.`, a: `${M(`\\dfrac{N}{4}=${numTex(F(N, 4))}`)} donc ${M('Q_1')} est la valeur de rang ${M(Math.ceil(N / 4))} : ${M(`Q_1=${q1}`)}. ${M(`\\dfrac{3N}{4}=${numTex(F(3 * N, 4))}`)} donc ${M(`Q_3=${q3}`)} (rang ${M(Math.ceil((3 * N) / 4))}). ${M(`Q_3-Q_1=${q3 - q1}`)}.` },
          { w: 1, q: 'Donner les cinq valeurs nécessaires pour tracer le diagramme en boîte.', a: `Minimum ${M(xs[0])}, ${M(`Q_1=${q1}`)}, médiane ${M(numTex(me))}, ${M(`Q_3=${q3}`)}, maximum ${M(xs[5])}.` },
        ],
        ok: () => flat.length === N && flat.filter((y) => y <= q1).length >= N / 4 && flat.filter((y) => y < q1).length < N / 4 && flat.filter((y) => y <= q3).length >= (3 * N) / 4 && flat.filter((y) => y < q3).length < (3 * N) / 4 && cum[5] === N };
    } },
  { id: 'g-sec-moyenne-ajout', cls: C, chapters: ['seconde-07'], domain: 'stats-proba', level: 2, minutes: 15, title: 'Ajouter ou retirer une valeur',
    make(r) {
      const N = r.int(15, 35), m = F(r.int(90, 160), 10), S = mul(F(N), m), a = r.int(2, 20), b = r.int(2, 20), m1 = div(add(S, F(a)), F(N + 1)), m2 = div(sub(S, F(b)), F(N - 1)), target = add(m, F(1, 2)), need = sub(mul(target, F(N + 1)), S);
      return { intro: `Une classe de ${M(N)} élèves a obtenu une moyenne de ${M(numTex(m))} à un devoir.`,
        parts: [
          { w: 1, q: 'Quelle est la somme des notes de la classe ?', a: M(`${N}\\times ${numTex(m)}=${numTex(S)}`) },
          { w: 2, q: `Un nouvel élève arrive et obtient ${M(a)}. Calculer la nouvelle moyenne.`, hint: 'Ajouter la note à la somme, puis diviser par le nouvel effectif.', a: M(`\\dfrac{${numTex(S)}+${a}}{${N + 1}}${dec(m1)}`) },
          { w: 2, q: `On retire à la place la copie d’un élève qui avait ${M(b)}. Calculer la nouvelle moyenne.`, a: M(`\\dfrac{${numTex(S)}-${b}}{${N - 1}}${dec(m2)}`) },
          { w: 2, q: `Quelle note devrait avoir le nouvel élève pour que la moyenne devienne ${M(numTex(target))} ? Est-ce possible ?`, a: `${M(`\\dfrac{${numTex(S)}+x}{${N + 1}}=${numTex(target)}\\iff x=${numTex(target)}\\times ${N + 1}-${numTex(S)}=${numTex(need)}`)}. ${val(need) <= 20 ? 'C’est possible.' : 'C’est impossible, une note ne dépasse pas 20.'}` },
        ],
        ok: () => near(val(m1), (N * val(m) + a) / (N + 1)) && near(val(m2), (N * val(m) - b) / (N - 1)) && near((val(S) + val(need)) / (N + 1), val(target)) };
    } },
  { id: 'g-sec-ecart-type', cls: C, chapters: ['seconde-07'], domain: 'stats-proba', level: 3, minutes: 20, title: 'Deux séries de même moyenne',
    make(r) {
      const m = r.int(8, 14), d1 = [r.int(1, 2), r.int(0, 2)], d2 = [r.int(3, 6), r.int(2, 5)];
      const A = [m - d1[0], m - d1[1], m, m + d1[1], m + d1[0]], B = [m - d2[0], m - d2[1], m, m + d2[1], m + d2[0]];
      const V = (s) => F(sum(s.map((x) => (x - m) ** 2)), 5), VA = V(A), VB = V(B);
      return { intro: `Deux élèves ont obtenu les notes suivantes. Élève A : ${M(list(A))}. Élève B : ${M(list(B))}.`,
        parts: [
          { w: 1, q: 'Calculer la moyenne de chaque élève.', a: `${M(`\\bar{x}_A=\\dfrac{${sum(A)}}{5}=${m}`)} et ${M(`\\bar{x}_B=\\dfrac{${sum(B)}}{5}=${m}`)} : même moyenne.` },
          { w: 2, q: 'Calculer la variance et l’écart type de chaque série (arrondir l’écart type au centième).', hint: 'Faire un tableau des écarts à la moyenne et de leurs carrés.', a: `${M(`V_A=\\dfrac{${A.map((x) => `${par(x - m)}^{2}`).join('+')}}{5}=${numTex(VA)}`)}, ${M(`\\sigma_A\\approx ${roundTex(Math.sqrt(val(VA)), 2)}`)} ; ${M(`V_B=${numTex(VB)}`)}, ${M(`\\sigma_B\\approx ${roundTex(Math.sqrt(val(VB)), 2)}`)}.` },
          { w: 1, q: 'Quel élève a les résultats les plus réguliers ? Justifier.', a: `L’élève A : son écart type est plus petit, ses notes sont plus resserrées autour de la moyenne.` },
          { w: 2, q: `Chaque note de B est augmentée de ${M(2)} points. Que deviennent la moyenne et l’écart type de B ?`, a: `La moyenne augmente de ${M(2)} : ${M(m + 2)}. L’écart type ne change pas (${M(`\\approx ${roundTex(Math.sqrt(val(VB)), 2)}`)}) : ajouter une constante décale les notes sans les disperser davantage.` },
        ],
        ok: () => sum(A) === 5 * m && sum(B) === 5 * m && val(VA) < val(VB) && near(val(V(B.map((x) => x + 2).map((x) => x - 2))), val(VB)) };
    } },
  { id: 'g-sec-classes', cls: C, chapters: ['seconde-07'], domain: 'stats-proba', level: 1, minutes: 15, title: 'Données regroupées en classes',
    make(r) {
      const w = r.pick([5, 10, 20]), start = w * r.int(0, 3), ns = [r.int(2, 9), r.int(5, 15), r.int(8, 20), r.int(4, 12), r.int(1, 6)], N = sum(ns);
      const cl = ns.map((_, i) => [start + i * w, start + (i + 1) * w]), ctr = cl.map(([a, b]) => (a + b) / 2), S = sum(ctr.map((c, i) => c * ns[i])), m = F(S, N), k = r.int(1, 3), below = sum(ns.slice(0, k + 1));
      const ctx = r.pick(['la durée (en minutes) du trajet domicile-lycée', 'la masse (en grammes) de fruits récoltés', 'le temps (en minutes) passé sur un exercice']);
      return { intro: `On a relevé ${ctx} pour ${N} individus : ${M(`\\begin{array}{|c|c|}\\hline\\text{Classe}&\\text{Effectif}\\\\\\hline ${cl.map(([a, b], i) => `[${a}\\,;\\,${b}[&${ns[i]}`).join('\\\\\\hline ')}\\\\\\hline\\end{array}`)}`,
        parts: [
          { w: 1, q: 'Donner le centre de chaque classe.', a: M(list(ctr.map((c) => numTex(F(2 * c, 2))))) },
          { w: 2, q: 'Estimer la moyenne de la série à l’aide des centres des classes.', hint: 'On remplace chaque valeur d’une classe par le centre de la classe : on obtient une estimation, pas la moyenne exacte.', a: `Produits centre fois effectif : ${ctr.map((c, i) => M(`${numTex(F(2 * c, 2))}\\times ${ns[i]}=${numTex(F(2 * c * ns[i], 2))}`)).join(', ')} ; leur somme vaut ${M(numTex(F(2 * S, 2)))}. Donc ${M(`\\bar{x}\\approx\\dfrac{${numTex(F(2 * S, 2))}}{${N}}${dec(m)}`)}.` },
          { w: 1, q: `Quelle est la fréquence (en %) des individus dont la valeur est strictement inférieure à ${M(cl[k][1])} ?`, a: M(freqTex(below, N)) },
          { w: 1, q: 'Pourquoi ne peut-on pas calculer la moyenne exacte ?', a: 'Les valeurs individuelles sont perdues lors du regroupement en classes : on ne connaît que les effectifs de chaque classe.' },
        ],
        ok: () => near(val(m), cl.reduce((t, [a, b], i) => t + ((a + b) / 2) * ns[i], 0) / N) && below <= N };
    } },

  // ================= 08 Calcul algébrique =================
  { id: 'g-sec-dev-fact-resoudre', cls: C, chapters: ['seconde-08'], domain: 'algebre', level: 1, minutes: 15, title: 'Développer, factoriser, résoudre',
    make(r) {
      const a = r.int(1, 5), b = r.nz(-7, 7), c = r.int(1, 8), E0 = (x) => (a * x + b) ** 2 - c * c, S = sortF([F(c - b, a), F(-c - b, a)]);
      return { intro: `On considère l’expression ${M(`E(x)=(${polyTex([a, b])})^{2}-${c * c}`)}.`,
        parts: [
          { w: 1, q: `Développer et réduire ${M('E(x)')}.`, a: M(`E(x)=${polyTex([a * a, 2 * a * b, b * b])}-${c * c}=${polyTex([a * a, 2 * a * b, b * b - c * c])}`) },
          { w: 2, q: `Factoriser ${M('E(x)')}.`, hint: `Reconnaître ${M('A^{2}-B^{2}')} avec ${M(`B=${c}`)}.`, a: M(`E(x)=(${polyTex([a, b])}-${c})(${polyTex([a, b])}+${c})=(${polyTex([a, b - c])})(${polyTex([a, b + c])})`) },
          { w: 2, q: `Résoudre ${M('E(x)=0')}.`, a: `Produit nul : ${M(solTex(S))}.` },
          { w: 1, q: `Calculer ${M('E(0)')} en choisissant la forme la plus adaptée.`, a: `Avec la forme développée : ${M(`E(0)=${b * b - c * c}`)}.` },
        ],
        ok: () => [-3, 0, 2, 5].every((x) => E0(x) === evalPoly([a * a, 2 * a * b, b * b - c * c], x) && E0(x) === (a * x + b - c) * (a * x + b + c)) && S.every((x) => near(E0(val(x)), 0)) };
    } },
  { id: 'g-sec-produit-quotient', cls: C, chapters: ['seconde-08'], domain: 'algebre', level: 2, minutes: 15, title: 'Équations produit et quotient',
    make(r) {
      const a = r.nz(-5, 5), b = r.int(-9, 9), c = r.nz(-5, 5), d = r.int(-9, 9), k = r.int(1, 6), e = r.nz(-4, 4), f0 = r.int(-6, 6);
      if (eq(F(-b, a), F(-d, c))) return this.make(r);
      const S1 = sortF([F(-b, a), F(-d, c)]), S2 = sortF([F(0), F(k)]), xq = F(-b, a), forb = F(-f0, e), S3 = eq(xq, forb) ? [] : [xq];
      return { intro: `Résoudre dans ${M('\\mathbb{R}')} les trois équations ${M(`(${polyTex([a, b])})(${polyTex([c, d])})=0`)}, ${M(`x^{2}=${k === 1 ? '' : k}x`)} et ${M(`\\dfrac{${polyTex([a, b])}}{${polyTex([e, f0])}}=0`)}.`,
        parts: [
          { w: 1, q: M(`(${polyTex([a, b])})(${polyTex([c, d])})=0`), a: M(solTex(S1)) },
          { w: 2, q: M(`x^{2}=${k === 1 ? '' : k}x`), hint: 'Ne pas diviser par x (on perdrait une solution) : tout passer à gauche et factoriser.', a: `${M(`${polyTex([1, -k, 0])}=0\\iff x(x-${k})=0`)} : ${M(solTex(S2))}.` },
          { w: 2, q: M(`\\dfrac{${polyTex([a, b])}}{${polyTex([e, f0])}}=0`), hint: 'Chercher d’abord la valeur interdite.', a: `Valeur interdite ${M(fracTex(forb))}. Le quotient est nul quand le numérateur l’est : ${M(`x=${fracTex(xq)}`)}${S3.length ? ', valeur autorisée' : ', qui est interdite'} ; ${M(solTex(S3))}.` },
        ],
        ok: () => S1.every((x) => near((a * val(x) + b) * (c * val(x) + d), 0)) && S2.every((x) => near(val(x) ** 2, k * val(x))) && (S3.length === 0) === eq(xq, forb) };
    } },
  { id: 'g-sec-tableau-signes', cls: C, chapters: ['seconde-08'], domain: 'algebre', level: 2, minutes: 20, title: 'Inéquation et tableau de signes',
    make(r) {
      let a, b, c, d; do { a = r.nz(-4, 4); b = r.int(-9, 9); c = r.nz(-4, 4); d = r.int(-9, 9); } while (eq(F(-b, a), F(-d, c)));
      const r1 = F(-b, a), r2 = F(-d, c), [lo, hi] = val(r1) < val(r2) ? [r1, r2] : [r2, r1], out = a * c > 0;
      const Sle = out ? [{ lo: E(lo), hi: E(hi), lc: true, hc: true }] : [{ lo: Einf, hi: E(lo), lc: false, hc: true }, { lo: E(hi), hi: Einf, lc: true, hc: false }];
      const Sq = out ? [{ lo: Einf, hi: E(lo), lc: false, hc: !eq(lo, r2) }, { lo: E(hi), hi: Einf, lc: !eq(hi, r2), hc: false }] : [{ lo: E(lo), hi: E(hi), lc: !eq(lo, r2), hc: !eq(hi, r2) }];
      const g = (x) => (a * x + b) * (c * x + d);
      return { intro: `On pose ${M(`A(x)=(${polyTex([a, b])})(${polyTex([c, d])})`)} et ${M(`B(x)=\\dfrac{${polyTex([a, b])}}{${polyTex([c, d])}}`)}.`,
        parts: [
          { w: 1, q: `Étudier le signe de ${M(polyTex([a, b]))} et de ${M(polyTex([c, d]))} selon ${M('x')}.`, a: `${M(polyTex([a, b]))} s’annule en ${M(fracTex(r1))} et a le signe de ${M(a)} à sa droite ; ${M(polyTex([c, d]))} s’annule en ${M(fracTex(r2))} et a le signe de ${M(c)} à sa droite.` },
          { w: 2, q: `Dresser le tableau de signes de ${M('A(x)')} et résoudre ${M('A(x)\\leqslant 0')}.`, hint: 'Sur chaque intervalle délimité par les racines, multiplier les signes des deux facteurs.', a: `${M('A(x)')} est du signe de ${M(a * c)} à l’extérieur des racines et du signe contraire entre elles : ${M(`S=${ivTex(Sle)}`)}.` },
          { w: 2, q: `Résoudre ${M('B(x)\\geqslant 0')}.`, hint: 'Même tableau de signes, mais la valeur qui annule le dénominateur est interdite.', a: `Valeur interdite ${M(fracTex(r2))} (double barre dans le tableau) : ${M(`S=${ivTex(Sq)}`)}.` },
        ],
        ok: () => { for (let t = -300; t <= 300; t++) { const x = t / 20 + 0.0123; if (ivHas(Sle, x) !== (g(x) <= 0)) return false; if (ivHas(Sq, x) !== ((a * x + b) / (c * x + d) >= 0)) return false; } return ivHas(Sle, val(lo)) && ivHas(Sq, val(r1)) && !ivHas(Sq, val(r2)); } };
    } },
  { id: 'g-sec-carre-rectangle', cls: C, chapters: ['seconde-08', 'seconde-06'], domain: 'algebre', level: 3, minutes: 20, title: 'Un carré et un rectangle de même aire',
    make(r) {
      let a, b, c, x0; do { a = r.int(1, 8); b = r.int(0, 10); c = r.int(0, 12); x0 = (b * c - a * a) / (2 * a - b - c); } while (2 * a === b + c || !(x0 > 0) || !Number.isInteger(x0) || x0 > 40);
      const sq = (x) => (x + a) ** 2, re = (x) => (x + b) * (x + c), sqWins = 2 * a - b - c > 0;
      const side = (k) => (k === 0 ? 'x' : `x+${k}`);
      return { intro: `Pour un réel ${M('x>0')}, on considère un carré de côté ${M(side(a))} et un rectangle de côtés ${M(side(b))} et ${M(side(c))} (en centimètres).`,
        parts: [
          { w: 1, q: 'Exprimer, sous forme développée, l’aire du carré et celle du rectangle.', a: `Carré : ${M(`(x+${a})^{2}=${polyTex([1, 2 * a, a * a])}`)}. Rectangle : ${M(`${b === 0 ? 'x' : `(${side(b)})`}(${side(c)})=${polyTex([1, b + c, b * c])}`)}.` },
          { w: 2, q: 'Pour quelle valeur de x les deux aires sont-elles égales ?', hint: `Les termes en ${M('x^{2}')} se simplifient : l’équation devient du premier degré.`, a: `${M(`${polyTex([1, 2 * a, a * a])}=${polyTex([1, b + c, b * c])}\\iff ${polyTex([2 * a - b - c, 0])}=${b * c - a * a}\\iff x=${x0}`)}.` },
          { w: 1, q: 'Vérifier en calculant les deux aires pour cette valeur.', a: `${M(`(${x0}+${a})^{2}=${sq(x0)}`)} et ${M(`${x0 + b}\\times ${x0 + c}=${re(x0)}`)}.` },
          { w: 2, q: 'Pour quelles valeurs de x le carré a-t-il une aire strictement plus grande que le rectangle ?', a: `${M(`${polyTex([2 * a - b - c, 0])}>${b * c - a * a}`)}, donc ${sqWins ? M(`x>${x0}`) : M(`x<${x0}`)} (on divise par ${M(2 * a - b - c)}, ${sqWins ? 'positif' : 'négatif : le sens change'}).` },
        ],
        ok: () => sq(x0) === re(x0) && (sq(x0 + 1) > re(x0 + 1)) === sqWins && (sq(x0 - 0.5) > re(x0 - 0.5)) === !sqWins };
    } },

  // ================= 09 Proportions et évolutions =================
  { id: 'g-sec-proportions-lycee', cls: C, chapters: ['seconde-09'], domain: 'nombres', level: 1, minutes: 12, title: 'Proportions dans un lycée',
    make(r) {
      const N = 20 * r.int(30, 80), p1 = 5 * r.int(4, 14), p2 = 5 * r.int(2, 16), nF = (N * p1) / 100, nG = (nF * p2) / 100;
      if (!Number.isInteger(nG)) return this.make(r);
      return { intro: `Un lycée compte ${M(N)} élèves. ${cap(`${M(`${p1}\\,\\%`)}`)} d’entre eux sont en Seconde, et ${M(`${p2}\\,\\%`)} des élèves de Seconde suivent une option artistique.`,
        parts: [
          { w: 1, q: 'Combien d’élèves sont en Seconde ?', a: M(`${numTex(F(p1, 100))}\\times ${N}=${nF}`) },
          { w: 1, q: 'Combien d’élèves de Seconde suivent l’option artistique ?', a: M(`${numTex(F(p2, 100))}\\times ${nF}=${nG}`) },
          { w: 2, q: 'Quelle proportion de l’ensemble des élèves du lycée cela représente-t-il ?', hint: 'On peut diviser l’effectif obtenu par l’effectif total, ou multiplier les deux proportions.', a: `${M(`\\dfrac{${nG}}{${N}}=${numTex(F(nG, N))}`)}, soit ${M(pcT(mul(F(nG, N), F(100))))} ; c’est aussi ${M(`${numTex(F(p1, 100))}\\times ${numTex(F(p2, 100))}`)}.` },
        ],
        ok: () => near(nG / N, (p1 * p2) / 10000) && nF === (N * p1) / 100 };
    } },
  { id: 'g-sec-coef-multiplicateur', cls: C, chapters: ['seconde-09'], domain: 'nombres', level: 2, minutes: 15, title: 'Coefficient multiplicateur et prix',
    make(r) {
      const VI = 5 * r.int(6, 80), t = r.pick([-1, 1]) * r.pick([4, 5, 8, 10, 12, 15, 20, 25, 30, 40]), cm = F(100 + t, 100), VF = mul(F(VI), cm), VF2 = 5 * r.int(6, 80), back = F(-100 * t, 100 + t);
      const tr = mul(sub(F(VF2, VI), F(1)), F(100));
      return { intro: `Un article coûte ${M(`${VI}\\ \\text{€}`)}.`,
        parts: [
          { w: 1, q: `Son prix ${t > 0 ? 'augmente' : 'baisse'} de ${M(`${Math.abs(t)}\\,\\%`)}. Donner le coefficient multiplicateur puis le nouveau prix.`, a: `${M(`CM=1${t > 0 ? '+' : '-'}${numTex(F(Math.abs(t), 100))}=${numTex(cm)}`)} ; ${M(`${VI}\\times ${numTex(cm)}=${numTex(VF)}\\ \\text{€}`)}.` },
          { w: 2, q: `Quel taux faudrait-il ensuite appliquer pour revenir à ${M(`${VI}\\ \\text{€}`)} ?`, hint: 'Le coefficient réciproque est l’inverse du coefficient multiplicateur.', a: `${M(`CM'=\\dfrac{1}{${numTex(cm)}}`)} et ${M(`t'=\\dfrac{1}{${numTex(cm)}}-1${dec(div(back, F(100)), 4)}`)}, soit ${M(`${val(back) > 0 ? '+' : ''}${dec(back, 2).replace(/^=/, '')}\\,\\%`)}.` },
          { w: 2, q: `Si le prix était passé de ${M(`${VI}\\ \\text{€}`)} à ${M(`${VF2}\\ \\text{€}`)}, quel aurait été le taux d’évolution ?`, a: M(`t=\\dfrac{${VF2}-${VI}}{${VI}}${dec(div(tr, F(100)), 4)}`) + `, soit ${M(`${dec(tr, 2).replace(/^=/, '')}\\,\\%`)}.` },
        ],
        ok: () => near(val(VF), VI * (1 + t / 100)) && near(val(VF) * (1 + val(back) / 100), VI) && near(VI * (1 + val(tr) / 100), VF2) };
    } },
  { id: 'g-sec-reciproque', cls: C, chapters: ['seconde-09'], domain: 'nombres', level: 3, minutes: 15, title: 'Hausse puis baisse : retour au départ ?',
    make(r) {
      const t = r.pick([10, 20, 25, 30, 40, 50, 60, 75, 100]), cm = F(100 + t, 100), cmg = mul(cm, F(100 - t, 100)), back = F(100 * t, 100 + t);
      const V0 = 5 * r.int(4, 60);
      return { intro: `Une action en bourse vaut ${M(`${V0}\\ \\text{€}`)}. Elle gagne ${M(`${t}\\,\\%`)} un jour, puis perd ${M(`${t}\\,\\%`)} le lendemain.`,
        parts: [
          { w: 1, q: 'Retrouve-t-elle sa valeur de départ ? Calculer le taux d’évolution global.', hint: 'Multiplier les deux coefficients multiplicateurs.', a: `${M(`CM=${numTex(cm)}\\times ${numTex(F(100 - t, 100))}=${numTex(cmg)}`)} : baisse globale de ${M(pcT(mul(sub(F(1), cmg), F(100))))}. Elle vaut ${M(`${V0}\\times ${numTex(cmg)}=${numTex(mul(F(V0), cmg))}\\ \\text{€}`)} et ne retrouve pas sa valeur.` },
          { w: 2, q: `De quel pourcentage aurait-elle dû baisser le second jour pour retrouver exactement sa valeur de départ ?`, a: `${M(`CM'=\\dfrac{1}{${numTex(cm)}}`)} ; la baisse est ${M(`1-\\dfrac{1}{${numTex(cm)}}=\\dfrac{${t}}{${100 + t}}`)}, soit ${M(`${dec(back, 2).replace(/^=/, '')}\\,\\%`)}.` },
          { w: 2, q: 'Démontrer que, pour tout taux t compris entre 0 et 1, une hausse de t suivie d’une baisse de t donne toujours une baisse.', a: `${M('(1+t)(1-t)=1-t^{2}<1')} dès que ${M('t\\neq 0')} : le coefficient global est inférieur à ${M(1)}, il y a baisse de ${M('t^{2}')}, soit ${M(`${numTex(F(t * t, 100))}\\,\\%`)} ici.` },
        ],
        ok: () => near(val(cmg), 1 - (t / 100) ** 2) && near((1 + t / 100) * (1 - val(back) / 100), 1) };
    } },
  { id: 'g-sec-population', cls: C, chapters: ['seconde-09', 'seconde-15'], domain: 'nombres', level: 3, minutes: 20, title: 'Évolutions successives d’une population',
    make(r) {
      const P0 = 1000 * r.int(5, 80), t1 = r.int(2, 12), t2 = -r.int(1, 8), t3 = r.int(1, 15), cms = [t1, t2, t3].map((t) => F(100 + t, 100)), cmg = cms.reduce(mul, F(1)), P3 = mul(F(P0), cmg), tg = mul(sub(cmg, F(1)), F(100));
      const n = r.int(3, 6), q = F(100 + t1, 100), Pn = P0 * val(q) ** n;
      return { intro: `Une ville comptait ${M(P0)} habitants en 2020. Sa population a évolué de ${M(`+${t1}\\,\\%`)} en 2021, de ${M(`${t2}\\,\\%`)} en 2022 et de ${M(`+${t3}\\,\\%`)} en 2023.`,
        parts: [
          { w: 2, q: 'Calculer le coefficient multiplicateur global et la population fin 2023 (arrondir à l’unité).', a: `${M(`CM=${cms.map(numTex).join('\\times ')}${dec(cmg, 6)}`)} ; population ${M(`\\approx ${Math.round(val(P3))}`)} habitants.` },
          { w: 1, q: 'En déduire le taux d’évolution global sur les trois ans.', hint: 'Le taux global vaut CM - 1, à exprimer en pourcentage.', a: `${M(`t=CM-1${dec(div(tg, F(100)), 6)}`)}, soit ${M(`${val(tg) >= 0 ? '+' : ''}${dec(tg, 2).replace(/^=/, '').replace('\\approx ', '')}\\,\\%`)} environ.` },
          { w: 2, q: `Un élève additionne les taux et trouve ${M(`${t1 + t2 + t3}\\,\\%`)}. Expliquer son erreur.`, a: `Chaque taux s’applique à la population de l’année précédente, pas à celle de 2020 : on multiplie les coefficients. Le vrai taux est ${M(`${dec(tg, 2).replace(/^=/, '').replace('\\approx ', '')}\\,\\%`)}.` },
          { w: 2, q: `Si la population avait augmenté de ${M(`${t1}\\,\\%`)} chaque année pendant ${M(n)} ans, combien d’habitants aurait-elle ?`, a: M(`${P0}\\times ${numTex(q)}^{${n}}\\approx ${Math.round(Pn)}`) },
        ],
        ok: () => near(val(P3), P0 * (1 + t1 / 100) * (1 + t2 / 100) * (1 + t3 / 100)) && Math.abs(val(tg) - (t1 + t2 + t3)) > 1e-6 && near(Pn, P0 * (1 + t1 / 100) ** n) };
    } },

  // ================= 10 Variations et extrémums =================
  { id: 'g-sec-tableau-variations', cls: C, chapters: ['seconde-10'], domain: 'fonctions', level: 1, minutes: 15, title: 'Lire un tableau de variations',
    make(r) {
      const a = r.int(-8, -3), b = a + r.int(2, 4), c = b + r.int(2, 4), d = c + r.int(2, 4);
      let fa, fb, fc, fd; do { fb = r.int(2, 9); fa = fb - r.int(1, 7); fc = fb - r.int(3, 14); fd = fc + r.int(1, 14); } while (fd === fb || fa === fc || fa >= fd);
      const mx = Math.max(fb, fd), at = mx === fb ? b : d, mn = Math.min(fa, fc), atm = mn === fa ? a : c;
      const ks = []; for (let y = fc + 1; y < fb; y++) if (![fa, fd].includes(y)) ks.push(y);
      const k = r.pick(ks), nsol = (fa < k && k < fb ? 1 : 0) + (fc < k && k < fb ? 1 : 0) + (fc < k && k < fd ? 1 : 0);
      const T = `\\begin{array}{|c|ccccccc|}\\hline x&${a}&&${b}&&${c}&&${d}\\\\\\hline f(x)&${fa}&\\nearrow&${fb}&\\searrow&${fc}&\\nearrow&${fd}\\\\\\hline\\end{array}`;
      // a piecewise affine function with this table, to count the solutions another way
      const g = (x) => (x <= b ? fa + ((fb - fa) * (x - a)) / (b - a) : x <= c ? fb + ((fc - fb) * (x - b)) / (c - b) : fc + ((fd - fc) * (x - c)) / (d - c));
      return { intro: `Une fonction ${M('f')} définie sur ${M(`[${a}\\,;\\,${d}]`)} a le tableau de variations suivant (on admet qu’elle est continue et strictement monotone sur chaque intervalle du tableau) : ${M(T)}`,
        parts: [
          { w: 1, q: `Donner le maximum et le minimum de ${M('f')} sur ${M(`[${a}\\,;\\,${d}]`)}, et où ils sont atteints.`, hint: 'Comparer les valeurs aux extrémités de chaque flèche : les extremums sont parmi ces valeurs.', a: `Maximum ${M(mx)}, atteint en ${M(at)} (le plus grand de ${M(fb)} et ${M(fd)}) ; minimum ${M(mn)}, atteint en ${M(atm)} (le plus petit de ${M(fa)} et ${M(fc)}).` },
          { w: 1, q: `Comparer ${M(`f(${b + 1})`)} et ${M(`f(${c})`)}, puis ${M(`f(${b})`)} et ${M(`f(${b + 1})`)}.`, a: `${M(`${b}<${b + 1}<${c}`)} dans ${M(`[${b}\\,;\\,${c}]`)}, où ${M('f')} est strictement décroissante : ${M(`f(${b})>f(${b + 1})>f(${c})`)}.` },
          { w: 2, q: `Peut-on comparer ${M(`f(${a + 1})`)} et ${M(`f(${d - 1})`)} ?`, hint: 'Un tableau de variations ne donne pas toutes les images intermédiaires.', a: `Non : ces nombres sont sur des branches différentes. On sait seulement ${M(`${fa}<f(${a + 1})<${fb}`)} et ${M(`${fc}<f(${d - 1})<${fd}`)}, et ces deux intervalles se chevauchent : les deux ordres sont possibles.` },
          { w: 2, q: `Combien l’équation ${M(`f(x)=${k}`)} a-t-elle de solutions ?`, a: `On examine chaque intervalle : sur ${M(`[${a}\\,;\\,${b}]`)}, ${M(k)} ${fa < k ? 'est' : 'n’est pas'} entre ${M(fa)} et ${M(fb)} ; sur ${M(`[${b}\\,;\\,${c}]`)}, il est entre ${M(fc)} et ${M(fb)} ; sur ${M(`[${c}\\,;\\,${d}]`)}, il ${k < fd ? 'est' : 'n’est pas'} entre ${M(fc)} et ${M(fd)}. L’équation a ${M(nsol)} solution${nsol > 1 ? 's' : ''}.` },
        ],
        ok: () => { let n = 0; for (let t = 0; t < 4000; t++) { const x = a + ((d - a) * t) / 4000, y = a + ((d - a) * (t + 1)) / 4000; if (Math.abs(g(y) - k) < 1e-12 || ((g(x) - k) * (g(y) - k) < 0 && Math.abs(g(x) - k) >= 1e-12)) n++; } return n === nsol && Math.max(fa, fc) < Math.min(fb, fd) && g(at) === mx && g(atm) === mn; } };
    } },
  { id: 'g-sec-forme-canonique', cls: C, chapters: ['seconde-10', 'seconde-08'], domain: 'fonctions', level: 2, minutes: 15, title: 'Un minimum par la forme canonique',
    make(r) {
      const al = r.nz(-6, 6), be = r.int(-12, 12), b = -2 * al, c = al * al + be, f = (x) => x * x + b * x + c;
      return { intro: `On considère ${M(`f(x)=${polyTex([1, b, c])}`)} sur ${M('\\mathbb{R}')}.`,
        parts: [
          { w: 2, q: `Montrer que ${M(`f(x)=(x${sgn(-al)})^{2}${be ? sgn(be) : ''}`)}.`, hint: 'Développer le membre de droite et comparer.', a: M(`(x${sgn(-al)})^{2}${be ? sgn(be) : ''}=${polyTex([1, b, al * al])}${be ? sgn(be) : ''}=${polyTex([1, b, c])}`) },
          { w: 2, q: `En déduire que ${M(`f(x)\\geqslant ${be}`)} pour tout ${M('x')}, et le minimum de ${M('f')}.`, a: `Un carré est positif ou nul : ${M(`(x${sgn(-al)})^{2}\\geqslant 0`)}, donc ${M(`f(x)\\geqslant ${be}`)}, avec égalité pour ${M(`x=${al}`)}. Le minimum est ${M(be)}, atteint en ${M(al)}.` },
          { w: 1, q: `Donner les variations de ${M('f')}.`, a: `${M('f')} est décroissante sur ${M(`]-\\infty\\,;\\,${al}]`)} et croissante sur ${M(`[${al}\\,;\\,+\\infty[`)}.` },
          { w: 1, q: `Résoudre ${M(`f(x)=${c}`)}.`, a: `${M(`x^{2}${sgn(b)}x=0\\iff x(x${sgn(b)})=0`)} : ${M(`S=\\{${Math.min(0, -b)}\\,;\\,${Math.max(0, -b)}\\}`)}.` },
        ],
        ok: () => [-5, 0, 2, 7].every((x) => f(x) === (x - al) ** 2 + be) && f(al) === be && f(-b) === c };
    } },
  { id: 'g-sec-enclos', cls: C, chapters: ['seconde-10', 'seconde-06'], domain: 'fonctions', level: 3, minutes: 25, title: 'L’enclos le plus grand',
    make(r) {
      const L = 4 * r.int(10, 60), A = (x) => x * (L - 2 * x), xm = L / 4, Am = A(xm), k = r.int(1, L / 2 - 1);
      return { intro: `Avec ${M(`${L}\\ \\text{m}`)} de grillage, on veut clôturer un enclos rectangulaire adossé à un mur : le grillage forme deux largeurs de ${M('x')} mètres et une longueur. On note ${M('A(x)')} l’aire de l’enclos.`,
        parts: [
          { w: 1, q: `Exprimer la longueur en fonction de ${M('x')} et préciser les valeurs possibles de ${M('x')}.`, a: `Longueur ${M(`${L}-2x`)}, qui doit être positive : ${M(`x\\in]0\\,;\\,${L / 2}[`)}.` },
          { w: 1, q: `Montrer que ${M(`A(x)=-2x^{2}+${L}x`)}, puis calculer ${M(`A(${k})`)}.`, a: `${M(`A(x)=x(${L}-2x)=-2x^{2}+${L}x`)} ; ${M(`A(${k})=${A(k)}`)}.` },
          { w: 3, q: `Vérifier que ${M(`A(x)=-2(x-${xm})^{2}+${Am}`)}.`, hint: `Développer ${M(`(x-${xm})^{2}`)} puis multiplier par ${M('-2')}.`, a: M(`-2(x^{2}-${2 * xm}x+${xm * xm})+${Am}=-2x^{2}+${L}x-${2 * xm * xm}+${Am}=-2x^{2}+${L}x`) },
          { w: 2, q: 'En déduire les dimensions de l’enclos d’aire maximale et cette aire.', a: `${M(`-2(x-${xm})^{2}\\leqslant 0`)}, donc ${M(`A(x)\\leqslant ${Am}`)} avec égalité pour ${M(`x=${xm}`)} : largeur ${M(`${xm}\\ \\text{m}`)}, longueur ${M(`${L / 2}\\ \\text{m}`)}, aire ${M(`${Am}\\ \\text{m}^2`)}.` },
        ],
        ok: () => 2 * xm * xm === Am && [1, 5, xm, L / 2 - 1].every((x) => A(x) === -2 * (x - xm) ** 2 + Am) && A(xm) > A(xm - 1) };
    } },
  { id: 'g-sec-comparer-variations', cls: C, chapters: ['seconde-10'], domain: 'fonctions', level: 2, minutes: 12, title: 'Comparer sans calculer',
    make(r) {
      const u = F(r.int(11, 49), 10), v = add(u, F(r.int(1, 30), 10)), w = F(-r.int(11, 49), 10), z = sub(w, F(r.int(1, 30), 10)), p = F(r.int(1, 9), 10), q = add(p, F(r.int(1, 5), 100));
      const T = numTex;
      return { intro: `Comparer sans les calculer, en citant le sens de variation utilisé, les couples de nombres construits à partir de ${M(numTex(u))}, ${M(numTex(v))}, ${M(numTex(w))}, ${M(numTex(z))}, ${M(numTex(p))} et ${M(numTex(q))}.`,
        parts: [
          { w: 1, q: `${M(`${T(u)}^{2}`)} et ${M(`${T(v)}^{2}`)}`, a: `${M(`0\\leqslant ${T(u)}<${T(v)}`)} et la fonction carré est strictement croissante sur ${M('[0\\,;\\,+\\infty[')} : ${M(`${T(u)}^{2}<${T(v)}^{2}`)}.` },
          { w: 2, q: `${M(`(${T(w)})^{2}`)} et ${M(`(${T(z)})^{2}`)}`, hint: 'Les deux nombres sont négatifs : sur cet intervalle, la fonction carré est décroissante.', a: `${M(`${T(z)}<${T(w)}\\leqslant 0`)} et la fonction carré est strictement décroissante sur ${M(']-\\infty\\,;\\,0]')} : ${M(`(${T(z)})^{2}>(${T(w)})^{2}`)}.` },
          { w: 2, q: `${M(`\\dfrac{1}{${T(p)}}`)} et ${M(`\\dfrac{1}{${T(q)}}`)}`, a: `${M(`0<${T(p)}<${T(q)}`)} et la fonction inverse est strictement décroissante sur ${M(']0\\,;\\,+\\infty[')} : ${M(`\\dfrac{1}{${T(p)}}>\\dfrac{1}{${T(q)}}`)}.` },
          { w: 1, q: `${M(`\\sqrt{${T(v)}}`)} et ${M(`\\sqrt{${T(u)}}`)}`, a: `La racine carrée est strictement croissante sur ${M('[0\\,;\\,+\\infty[')} : ${M(`\\sqrt{${T(u)}}<\\sqrt{${T(v)}}`)}.` },
        ],
        ok: () => val(u) ** 2 < val(v) ** 2 && val(z) ** 2 > val(w) ** 2 && 1 / val(p) > 1 / val(q) && Math.sqrt(val(u)) < Math.sqrt(val(v)) };
    } },

  // ================= 11 Deux variables qualitatives =================
  { id: 'g-sec-marginales', cls: C, chapters: ['seconde-11'], domain: 'stats-proba', level: 1, minutes: 12, title: 'Tableau croisé : effectifs et fréquences marginales',
    make(r) {
      const [who, rows, cols] = r.pick(POP), a = r.int(10, 90), b = r.int(10, 90), c = r.int(10, 90), d = r.int(10, 90), N = a + b + c + d;
      return { intro: `On a interrogé ${N} ${who} : ${M(tableTex(rows, cols, a, b, c, d))}`,
        parts: [
          { w: 1, q: `Combien y a-t-il de ${cols[0]} ? de ${rows[1]} ?`, a: `${M(a + c)} ${cols[0]} et ${M(c + d)} ${rows[1]} (totaux de colonne et de ligne).` },
          { w: 1, q: `Calculer la fréquence marginale des ${cols[0]}.`, a: M(freqTex(a + c, N)) },
          { w: 1, q: `Calculer la fréquence des ${rows[0]} qui sont des ${cols[1]}, parmi l’ensemble.`, hint: 'Parmi l’ensemble : le dénominateur est l’effectif total.', a: M(freqTex(b, N)) },
          { w: 1, q: 'Vérifier que la somme des fréquences marginales des lignes vaut 100 %.', a: `${M(`\\dfrac{${a + b}}{${N}}+\\dfrac{${c + d}}{${N}}=\\dfrac{${N}}{${N}}=1`)}, soit ${M('100\\,\\%')}.` },
        ],
        ok: () => a + b + c + d === N && (a + b) + (c + d) === N };
    } },
  { id: 'g-sec-conditionnelles', cls: C, chapters: ['seconde-11'], domain: 'stats-proba', level: 2, minutes: 15, title: 'Fréquences conditionnelles',
    make(r) {
      const [who, rows, cols] = r.pick(POP), a = r.int(10, 90), b = r.int(10, 90), c = r.int(10, 90), d = r.int(10, 90), N = a + b + c + d, f0 = a / (a + b), f1 = c / (c + d);
      if (Math.abs(f0 - f1) < 0.01) return this.make(r);
      return { intro: `Répartition de ${N} ${who} : ${M(tableTex(rows, cols, a, b, c, d))}`,
        parts: [
          { w: 1, q: `Parmi les ${rows[0]}, quelle est la fréquence des ${cols[0]} ?`, hint: '« Parmi les ... » désigne la population de référence : c’est le dénominateur.', a: M(freqTex(a, a + b)) },
          { w: 1, q: `Même question parmi les ${rows[1]}.`, a: M(freqTex(c, c + d)) },
          { w: 2, q: `Parmi les ${cols[0]}, quelle est la fréquence des ${rows[0]} ? La comparer avec la réponse à la question 1.`, a: `${M(freqTex(a, a + c))} : ce n’est pas la même fréquence, car la population de référence n’est plus la même (${M(a + c)} au lieu de ${M(a + b)}).` },
          { w: 2, q: `Les ${cols[0]} sont-ils proportionnellement plus nombreux chez les ${rows[0]} ou chez les ${rows[1]} ?`, a: `Chez les ${rows[f0 > f1 ? 0 : 1]} : ${M(`${roundTex(100 * Math.max(f0, f1), 1)}\\,\\%`)} contre ${M(`${roundTex(100 * Math.min(f0, f1), 1)}\\,\\%`)}.` },
        ],
        ok: () => near(f0, a / (a + b)) && a / (a + c) !== f0 || a + c === a + b };
    } },
  { id: 'g-sec-completer-tableau', cls: C, chapters: ['seconde-11'], domain: 'stats-proba', level: 2, minutes: 20, title: 'Compléter un tableau à partir de pourcentages',
    make(r) {
      const [who, rows, cols] = r.pick(POP), N = 50 * r.int(4, 20), p = 5 * r.int(4, 16), nA = (N * p) / 100, q = 5 * r.int(2, 18), s = 5 * r.int(2, 18), a = (nA * q) / 100, c = ((N - nA) * s) / 100;
      if (!Number.isInteger(a) || !Number.isInteger(c)) return this.make(r);
      const b = nA - a, d = N - nA - c;
      return { intro: `On étudie ${N} ${who}. ${cap(`${M(`${p}\\,\\%`)}`)} sont des ${rows[0]} ; ${M(`${q}\\,\\%`)} des ${rows[0]} et ${M(`${s}\\,\\%`)} des ${rows[1]} sont des ${cols[0]}.`,
        parts: [
          { w: 1, q: `Calculer le nombre de ${rows[0]} et de ${rows[1]}.`, a: `${M(`${numTex(F(p, 100))}\\times ${N}=${nA}`)} ${rows[0]} et ${M(`${N}-${nA}=${N - nA}`)} ${rows[1]}.` },
          { w: 2, q: 'Compléter le tableau croisé des effectifs.', hint: `Les pourcentages ${M(`${q}\\,\\%`)} et ${M(`${s}\\,\\%`)} s’appliquent à chaque ligne, pas à l’effectif total.`, a: M(tableTex(rows, cols, a, b, c, d)) },
          { w: 1, q: `Quelle est la fréquence des ${cols[0]} dans l’ensemble ?`, a: M(freqTex(a + c, N)) },
          { w: 2, q: `Parmi les ${cols[0]}, quelle est la fréquence des ${rows[0]} ?`, a: a + c ? M(freqTex(a, a + c)) : 'Il n’y en a aucun.' },
        ],
        ok: () => a + b + c + d === N && a * 100 === q * nA && c * 100 === s * (N - nA) };
    } },
  { id: 'g-sec-deux-machines', cls: C, chapters: ['seconde-11', 'seconde-14'], domain: 'stats-proba', level: 3, minutes: 20, title: 'Deux machines, une production',
    make(r) {
      const nA = 100 * r.int(5, 30), nB = 100 * r.int(5, 30), pA = r.int(1, 9), pB = r.int(1, 9), dA = (nA * pA) / 100, dB = (nB * pB) / 100, D = dA + dB;
      if (pA === pB) return this.make(r);
      return { intro: `Une usine produit des pièces sur deux machines : ${M(nA)} pièces sur la machine A, dont ${M(`${pA}\\,\\%`)} sont défectueuses, et ${M(nB)} pièces sur la machine B, dont ${M(`${pB}\\,\\%`)} sont défectueuses.`,
        parts: [
          { w: 1, q: 'Construire le tableau croisé (machine, état de la pièce).', a: M(tableTex(['pièces de A', 'pièces de B'], ['défectueuses', 'conformes'], dA, nA - dA, dB, nB - dB)) },
          { w: 1, q: 'Quelle est la fréquence des pièces défectueuses dans toute la production ?', a: M(freqTex(D, nA + nB, 2)) },
          { w: 2, q: 'Parmi les pièces défectueuses, quelle proportion vient de la machine A ?', hint: 'La population de référence est celle des pièces défectueuses.', a: M(freqTex(dA, D)) },
          { w: 2, q: `Un responsable affirme : « la machine ${nA > nB ? 'A' : 'B'} produit le plus de pièces défectueuses, c’est donc la moins fiable ». Discuter.`, a: `${dA === dB ? 'Les deux machines produisent autant de pièces défectueuses.' : `La machine ${dA > dB ? 'A' : 'B'} produit le plus de pièces défectueuses (${M(Math.max(dA, dB))}).`} Mais la fiabilité se mesure par la fréquence des défauts parmi les pièces de chaque machine : ${M(`${pA}\\,\\%`)} pour A et ${M(`${pB}\\,\\%`)} pour B. La moins fiable est ${pA > pB ? 'A' : 'B'}.` },
        ],
        ok: () => near(D / (nA + nB), (nA * pA + nB * pB) / (100 * (nA + nB))) && Number.isInteger(dA) && Number.isInteger(dB) };
    } },

  // ================= 12 Géométrie repérée : synthèse =================
  { id: 'g-sec-centre-parallelogramme', cls: C, chapters: ['seconde-12'], domain: 'geometrie', level: 1, minutes: 12, title: 'Le quatrième sommet et le centre',
    make(r) {
      let A, B, Cc; do { A = P(r); B = P(r); Cc = P(r); } while ((B[0] - A[0]) * (Cc[1] - A[1]) - (B[1] - A[1]) * (Cc[0] - A[0]) === 0);
      const D = [A[0] + Cc[0] - B[0], A[1] + Cc[1] - B[1]], O = [F(A[0] + Cc[0], 2), F(A[1] + Cc[1], 2)];
      return { intro: `Dans un repère, on donne ${M(`A${pt(...A)}`)}, ${M(`B${pt(...B)}`)} et ${M(`C${pt(...Cc)}`)}.`,
        parts: [
          { w: 2, q: `Déterminer les coordonnées de ${M('D')} tel que ${M('ABCD')} soit un parallélogramme.`, hint: `Attention à l’ordre des sommets : ${M('ABCD')} parallélogramme équivaut à ${M('\\overrightarrow{AB}=\\overrightarrow{DC}')}.`, a: `${M('\\overrightarrow{DC}=\\overrightarrow{AB}')} donne ${M(`x_D=${Cc[0]}-${par(B[0] - A[0])}=${D[0]}`)} et ${M(`y_D=${Cc[1]}-${par(B[1] - A[1])}=${D[1]}`)} : ${M(`D${pt(...D)}`)}.` },
          { w: 1, q: `Calculer les coordonnées du centre ${M('O')} du parallélogramme.`, a: `C’est le milieu de ${M('[AC]')} : ${M(`O\\left(${numTex(O[0])}\\,;\\,${numTex(O[1])}\\right)`)}.` },
          { w: 1, q: `Vérifier que ${M('O')} est aussi le milieu de ${M('[BD]')}.`, a: M(`\\left(\\dfrac{${B[0]}+${par(D[0])}}{2}\\,;\\,\\dfrac{${B[1]}+${par(D[1])}}{2}\\right)=\\left(${numTex(O[0])}\\,;\\,${numTex(O[1])}\\right)`) },
        ],
        ok: () => eq(F(B[0] + D[0], 2), O[0]) && eq(F(B[1] + D[1], 2), O[1]) && Cc[0] - D[0] === B[0] - A[0] };
    } },
  { id: 'g-sec-theoreme-milieux', cls: C, chapters: ['seconde-12', 'seconde-02'], domain: 'geometrie', level: 2, minutes: 20, title: 'Le théorème des milieux en coordonnées',
    make(r) {
      let A, B, Cc; do { A = P(r, -7, 7); B = P(r, -7, 7); Cc = P(r, -7, 7); } while ((B[0] - A[0]) * (Cc[1] - A[1]) - (B[1] - A[1]) * (Cc[0] - A[0]) === 0);
      const I = [F(A[0] + B[0], 2), F(A[1] + B[1], 2)], J = [F(A[0] + Cc[0], 2), F(A[1] + Cc[1], 2)], IJ = [sub(J[0], I[0]), sub(J[1], I[1])], BC = [Cc[0] - B[0], Cc[1] - B[1]], bc2 = BC[0] ** 2 + BC[1] ** 2;
      return { intro: `Dans un repère orthonormé, on donne ${M(`A${pt(...A)}`)}, ${M(`B${pt(...B)}`)} et ${M(`C${pt(...Cc)}`)}. On note ${M('I')} et ${M('J')} les milieux de ${M('[AB]')} et ${M('[AC]')}.`,
        parts: [
          { w: 1, q: `Calculer les coordonnées de ${M('I')} et de ${M('J')}.`, a: `${M(`I\\left(${numTex(I[0])}\\,;\\,${numTex(I[1])}\\right)`)} et ${M(`J\\left(${numTex(J[0])}\\,;\\,${numTex(J[1])}\\right)`)}.` },
          { w: 2, q: `Calculer les coordonnées de ${M('\\overrightarrow{IJ}')} et de ${M('\\overrightarrow{BC}')}. Que constate-t-on ?`, a: `${M(`\\overrightarrow{IJ}${vc(numTex(IJ[0]), numTex(IJ[1]))}`)} et ${M(`\\overrightarrow{BC}${vc(...BC)}`)} : ${M('\\overrightarrow{IJ}=\\dfrac{1}{2}\\overrightarrow{BC}')}.` },
          { w: 1, q: 'En déduire que les droites (IJ) et (BC) sont parallèles et comparer les longueurs IJ et BC.', a: `Les vecteurs sont colinéaires, donc ${M('(IJ)\\parallel(BC)')}, et ${M('IJ=\\dfrac{1}{2}BC')}, avec ${M(`BC=\\sqrt{${bc2}}${sqrtTex(bc2) === `\\sqrt{${bc2}}` ? '' : `=${sqrtTex(bc2)}`}`)}.` },
          { w: 2, q: 'Démontrer ce résultat sans coordonnées, pour un triangle quelconque.', hint: `Utiliser la relation de Chasles : ${M('\\overrightarrow{IJ}=\\overrightarrow{IA}+\\overrightarrow{AJ}')}.`, a: `${M('\\overrightarrow{IJ}=\\overrightarrow{IA}+\\overrightarrow{AJ}=\\dfrac{1}{2}\\overrightarrow{BA}+\\dfrac{1}{2}\\overrightarrow{AC}=\\dfrac{1}{2}(\\overrightarrow{BA}+\\overrightarrow{AC})=\\dfrac{1}{2}\\overrightarrow{BC}')}.` },
        ],
        ok: () => eq(mul(IJ[0], F(2)), F(BC[0])) && eq(mul(IJ[1], F(2)), F(BC[1])) };
    } },
  { id: 'g-sec-medianes', cls: C, chapters: ['seconde-12', 'seconde-03'], domain: 'geometrie', level: 3, minutes: 25, title: 'Intersection de deux médianes',
    make(r) {
      let A, B, Cc, I, J; do { A = P(r, -6, 6); B = P(r, -6, 6); Cc = P(r, -6, 6); I = [F(B[0] + Cc[0], 2), F(B[1] + Cc[1], 2)]; J = [F(A[0] + Cc[0], 2), F(A[1] + Cc[1], 2)]; } while ((B[0] - A[0]) * (Cc[1] - A[1]) - (B[1] - A[1]) * (Cc[0] - A[0]) === 0 || eq(I[0], F(A[0])) || eq(J[0], F(B[0])) || (A[0] + B[0] + Cc[0]) % 3 || (A[1] + B[1] + Cc[1]) % 3);
      const m1 = div(sub(I[1], F(A[1])), sub(I[0], F(A[0]))), p1 = sub(F(A[1]), mul(m1, F(A[0]))), m2 = div(sub(J[1], F(B[1])), sub(J[0], F(B[0]))), p2 = sub(F(B[1]), mul(m2, F(B[0])));
      const x = div(sub(p2, p1), sub(m1, m2)), y = add(mul(m1, x), p1), G = [(A[0] + B[0] + Cc[0]) / 3, (A[1] + B[1] + Cc[1]) / 3];
      return { intro: `Dans un repère, on donne ${M(`A${pt(...A)}`)}, ${M(`B${pt(...B)}`)} et ${M(`C${pt(...Cc)}`)}. On note ${M('I')} le milieu de ${M('[BC]')} et ${M('J')} celui de ${M('[AC]')}.`,
        parts: [
          { w: 1, q: `Calculer les coordonnées de ${M('I')} et ${M('J')}.`, a: `${M(`I\\left(${numTex(I[0])}\\,;\\,${numTex(I[1])}\\right)`)}, ${M(`J\\left(${numTex(J[0])}\\,;\\,${numTex(J[1])}\\right)`)}.` },
          { w: 2, q: `Déterminer les équations réduites des médianes ${M('(AI)')} et ${M('(BJ)')}.`, a: `${M(`(AI):\\ y=${affTex(m1, p1)}`)} et ${M(`(BJ):\\ y=${affTex(m2, p2)}`)}.` },
          { w: 2, q: 'Calculer les coordonnées de leur point d’intersection G.', hint: 'Résoudre le système formé par les deux équations réduites (égaler les deux expressions de y).', a: `${M(`${affTex(m1, p1)}=${affTex(m2, p2)}`)} donne ${M(`x=${fracTex(x)}`)} puis ${M(`y=${fracTex(y)}`)} : ${M(`G${pt(fracTex(x), fracTex(y))}`)}.` },
          { w: 1, q: 'Comparer avec la moyenne des coordonnées des trois sommets. Que peut-on conjecturer ?', a: `${M(`\\left(\\dfrac{${A[0]}+${par(B[0])}+${par(Cc[0])}}{3}\\,;\\,\\dfrac{${A[1]}+${par(B[1])}+${par(Cc[1])}}{3}\\right)=${pt(G[0], G[1])}`)} : c’est ${M('G')}. On peut conjecturer que la troisième médiane passe aussi par ce point (centre de gravité).` },
        ],
        ok: () => eq(x, F(G[0])) && eq(y, F(G[1])) && eq(add(mul(m2, x), p2), y) };
    } },

  // ================= 13 Raisonnement et synthèse =================
  { id: 'g-sec-pourcentage-equation', cls: C, chapters: ['seconde-13', 'seconde-09', 'seconde-08'], domain: 'algebre', level: 2, minutes: 15, title: 'Pourcentages et équations',
    make(r) {
      const t = r.pick([5, 10, 15, 20, 25, 30, 40]), P0 = 10 * r.int(3, 50), d = r.int(2, 25), R = sub(mul(F(P0), F(100 + t, 100)), F(d)), cm = F(100 + t, 100), x2 = 10 * r.int(2, 30), R2 = mul(F(x2), F(100 - t, 100));
      return { intro: `Dans un magasin, le prix d’un article augmente de ${M(`${t}\\,\\%`)}, puis le gérant retire ${M(`${d}\\ \\text{€}`)} pour arrondir. On note ${M('x')} le prix initial en euros.`,
        parts: [
          { w: 1, q: `Exprimer le prix final en fonction de ${M('x')}.`, a: M(`${numTex(cm)}x-${d}`) },
          { w: 2, q: `Le prix final est ${M(`${numTex(R)}\\ \\text{€}`)}. Quel était le prix initial ?`, hint: 'Écrire une équation du premier degré, isoler x en deux étapes.', a: `${M(`${numTex(cm)}x-${d}=${numTex(R)}\\iff ${numTex(cm)}x=${numTex(add(R, F(d)))}\\iff x=${P0}`)} : ${M(`${P0}\\ \\text{€}`)}.` },
          { w: 2, q: `Un autre article, après une baisse de ${M(`${t}\\,\\%`)}, coûte ${M(`${numTex(R2)}\\ \\text{€}`)}. Un client affirme que le prix initial était ${M(`${numTex(add(R2, mul(R2, F(t, 100))))}\\ \\text{€}`)}. A-t-il raison ?`, a: `Non : il a ajouté ${M(`${t}\\,\\%`)} au prix réduit. Le prix initial vérifie ${M(`${numTex(F(100 - t, 100))}x=${numTex(R2)}`)}, soit ${M(`x=${x2}\\ \\text{€}`)}.` },
        ],
        ok: () => near(val(cm) * P0 - d, val(R)) && near(val(R2) / (1 - t / 100), x2) && !near(val(R2) * (1 + t / 100), x2) };
    } },
  { id: 'g-sec-choisir-offre', cls: C, chapters: ['seconde-13', 'seconde-06', 'seconde-08'], domain: 'fonctions', level: 3, minutes: 25, title: 'Choisir un abonnement',
    make(r) {
      const fixA = r.int(5, 20), uA = F(r.int(1, 9), 2), uB = add(uA, F(r.int(1, 6), 2)), n0 = r.int(6, 30), fixB = sub(F(fixA), mul(sub(uB, uA), F(n0))), t = r.pick([10, 20, 25]);
      if (val(fixB) < 1 && val(fixB) !== 0) return this.make(r);
      const cx = (q) => (eq(q, F(1)) ? '' : numTex(q));
      const f = (x) => fixA + val(uA) * x, g = (x) => val(fixB) + val(uB) * x, cm = F(100 - t, 100), n1 = sub(F(fixA), fixB), n1d = sub(mul(uB, cm), uA);
      const cross = val(n1d) > 0 ? div(sub(F(fixA), mul(fixB, cm)), n1d) : null;
      return { intro: `Une plateforme de musique propose deux formules mensuelles pour ${M('x')} téléchargements. Formule A : ${M(`${fixA}\\ \\text{€}`)} plus ${M(`${numTex(uA)}\\ \\text{€}`)} par téléchargement. Formule B : ${M(`${numTex(fixB)}\\ \\text{€}`)} plus ${M(`${numTex(uB)}\\ \\text{€}`)} par téléchargement.`,
        parts: [
          { w: 1, q: `Exprimer les coûts ${M('a(x)')} et ${M('b(x)')} des deux formules.`, a: M(`a(x)=${cx(uA)}x+${fixA}\\ ;\\ b(x)=${cx(uB)}x${val(fixB) ? `+${numTex(fixB)}` : ''}`) },
          { w: 2, q: 'Pour combien de téléchargements les deux formules coûtent-elles le même prix ?', a: `${M(`${cx(uA)}x+${fixA}=${cx(uB)}x${val(fixB) ? `+${numTex(fixB)}` : ''}\\iff ${cx(sub(uB, uA))}x=${numTex(n1)}\\iff x=${n0}`)}.` },
          { w: 2, q: 'Démontrer que la formule A est la plus avantageuse dès que le nombre de téléchargements dépasse cette valeur.', hint: 'Étudier le signe de b(x) - a(x), une fonction affine.', a: `${M(`b(x)-a(x)=${cx(sub(uB, uA))}x-${numTex(n1)}=${cx(sub(uB, uA))}(x-${n0})`)}, positif pour ${M(`x>${n0}`)} : alors ${M('a(x)<b(x)')}.` },
          { w: 2, q: `La formule B est désormais remisée de ${M(`${t}\\,\\%`)}. Que devient la conclusion ?`, a: cross ? `Nouveau coût ${M(`${numTex(cm)}\\,b(x)`)}. ${M(`${numTex(cm)}\\,b(x)=a(x)\\iff x=${fracTex(cross)}${decimals(cross) >= 0 ? '' : `\\approx ${roundTex(val(cross), 2)}`}`)} : A devient avantageuse à partir de ${M(Math.floor(val(cross)) + 1)} téléchargements.` : `Nouveau coût ${M(`${numTex(cm)}\\,b(x)`)} : le prix unitaire de B remisé ne dépasse plus celui de A, et B reste toujours au moins aussi avantageuse.` },
        ],
        ok: () => near(f(n0), g(n0)) && f(n0 + 1) < g(n0 + 1) && (cross ? near(f(val(cross)), val(cm) * g(val(cross))) && f(val(cross) + 1) < val(cm) * g(val(cross) + 1) : val(cm) * val(uB) <= val(uA) && val(cm) * val(fixB) <= fixA) };
    } },

  // ================= 14 Probabilités =================
  { id: 'g-sec-deux-des', cls: C, chapters: ['seconde-14'], domain: 'stats-proba', level: 1, minutes: 15, title: 'La somme de deux dés',
    make(r) {
      const f = r.pick([4, 6, 8]), s1 = r.int(3, 2 * f - 1), s2 = r.int(f + 1, 2 * f), N = f * f;
      let c1 = 0, c2 = 0, c3 = 0; for (let x = 1; x <= f; x++) for (let y = 1; y <= f; y++) { if (x + y === s1) c1++; if (x + y >= s2) c2++; if ((x + y) % 2 === 0) c3++; }
      const fr = (c) => `\\dfrac{${c}}{${N}}${F(c, N).d === N ? '' : `=${fracTex(F(c, N))}`}`;
      return { intro: `On lance deux dés équilibrés à ${M(f)} faces numérotées de ${M(1)} à ${M(f)}, et on note la somme des deux faces. On s’intéresse aux sommes égales à ${M(s1)} et aux sommes supérieures ou égales à ${M(s2)}.`,
        parts: [
          { w: 1, q: 'Combien d’issues équiprobables compte cette expérience ? Les sommes sont-elles équiprobables ?', hint: 'Distinguer les deux dés (un rouge, un bleu) et faire un tableau à double entrée.', a: `${M(`${f}\\times ${f}=${N}`)} couples équiprobables. Les sommes ne le sont pas : par exemple la somme ${M(2)} n’est obtenue que par ${M('(1\\,;\\,1)')}, la somme ${M(f + 1)} par ${M(f)} couples.` },
          { w: 1, q: `Calculer la probabilité d’obtenir une somme égale à ${M(s1)}.`, a: M(`P=${fr(c1)}`) },
          { w: 1, q: `Calculer la probabilité d’obtenir une somme supérieure ou égale à ${M(s2)}.`, a: M(`P=${fr(c2)}`) },
          { w: 2, q: 'Calculer la probabilité que la somme soit paire, puis celle de l’événement contraire.', a: `${M(`P=${fr(c3)}`)} ; somme impaire : ${M(`1-${fracTex(F(c3, N))}=${fracTex(F(N - c3, N))}`)}.` },
        ],
        ok: () => { let t = 0; for (let s = 2; s <= 2 * f; s++) { let c = 0; for (let x = 1; x <= f; x++) { const y = s - x; if (y >= 1 && y <= f) c++; } t += c; } return t === N && c3 === N / 2; } };
    } },
  { id: 'g-sec-proba-tableau', cls: C, chapters: ['seconde-14', 'seconde-11'], domain: 'stats-proba', level: 2, minutes: 15, title: 'Probabilités conditionnelles et tableau',
    make(r) {
      const [who, rows, cols] = r.pick(POP), a = r.int(10, 90), b = r.int(10, 90), c = r.int(10, 90), d = r.int(10, 90), N = a + b + c + d;
      const fr = (n, m) => `\\dfrac{${n}}{${m}}${F(n, m).d === m ? '' : `=${fracTex(F(n, m))}`}`;
      return { intro: `On choisit au hasard un individu parmi ${N} ${who} répartis ainsi : ${M(tableTex(rows, cols, a, b, c, d))} On note ${M('A')} : « l’individu est parmi les ${rows[0]} » et ${M('B')} : « l’individu est parmi les ${cols[0]} ».`,
        parts: [
          { w: 1, q: `Calculer ${M('P(A)')}, ${M('P(B)')} et ${M('P(A\\cap B)')}.`, a: M(`P(A)=${fr(a + b, N)},\\ P(B)=${fr(a + c, N)},\\ P(A\\cap B)=${fr(a, N)}`) },
          { w: 1, q: `En déduire ${M('P(A\\cup B)')}.`, a: M(`P(A\\cup B)=P(A)+P(B)-P(A\\cap B)=${fr(a + b + c, N)}`) },
          { w: 2, q: `Calculer ${M('P_A(B)')} et ${M('P_B(A)')}.`, hint: `${M('P_A(B)')} : on se restreint aux individus de ${M('A')}.`, a: `${M(`P_A(B)=\\dfrac{P(A\\cap B)}{P(A)}=${fr(a, a + b)}`)} et ${M(`P_B(A)=${fr(a, a + c)}`)}.` },
          { w: 1, q: 'Traduire chacune de ces deux probabilités par une phrase.', a: `${M('P_A(B)')} est la probabilité que l’individu soit parmi les ${cols[0]} sachant qu’il est parmi les ${rows[0]} ; ${M('P_B(A)')} celle qu’il soit parmi les ${rows[0]} sachant qu’il est parmi les ${cols[0]}.` },
        ],
        ok: () => near((a + b) / N + (a + c) / N - a / N, (a + b + c) / N) && near((a / N) / ((a + b) / N), a / (a + b)) };
    } },
  { id: 'g-sec-depistage', cls: C, chapters: ['seconde-14'], domain: 'stats-proba', level: 3, minutes: 25, title: 'Faux positifs : un test de contrôle',
    make(r) {
      const N = 10000, p = r.pick([1, 2, 3, 4, 5, 8, 10]), se = r.pick([90, 95, 98, 99]), fp = r.pick([2, 3, 4, 5, 8, 10]);
      const M1 = (N * p) / 100, TP = (M1 * se) / 100, FP = ((N - M1) * fp) / 100, Tpos = TP + FP, ppv = F(TP, Tpos);
      return { intro: `Dans une usine, ${M(`${p}\\,\\%`)} des pièces sont défectueuses. Un test de contrôle est positif pour ${M(`${se}\\,\\%`)} des pièces défectueuses et, par erreur, pour ${M(`${fp}\\,\\%`)} des pièces conformes. On imagine un lot de ${M('10\\,000')} pièces.`,
        parts: [
          { w: 2, q: 'Compléter le tableau croisé des effectifs (défectueuse ou non, test positif ou non).', hint: 'Commencer par le nombre de pièces défectueuses, puis appliquer chaque pourcentage à sa ligne.', a: M(tableTex(['pièces défectueuses', 'pièces conformes'], ['test positif', 'test négatif'], TP, M1 - TP, FP, N - M1 - FP)) },
          { w: 1, q: 'Quelle est la probabilité qu’une pièce choisie au hasard ait un test positif ?', a: M(`\\dfrac{${Tpos}}{10\\,000}=${numTex(F(Tpos, N))}`) },
          { w: 2, q: 'Une pièce a un test positif. Quelle est la probabilité qu’elle soit réellement défectueuse ? (arrondir au centième)', a: M(`P_{T}(D)=\\dfrac{${TP}}{${Tpos}}\\approx ${roundTex(val(ppv), 2)}`) },
          { w: 2, q: `Expliquer pourquoi ce résultat est très différent de ${M(`${se}\\,\\%`)}.`, a: `${M(`${se}\\,\\%`)} est la probabilité d’un test positif sachant que la pièce est défectueuse ; on a calculé la probabilité inverse, défectueuse sachant test positif. Comme les pièces conformes sont très nombreuses, leurs ${M(FP)} faux positifs pèsent lourd face aux ${M(TP)} vrais positifs.` },
        ],
        ok: () => Number.isInteger(TP) && Number.isInteger(FP) && near(val(ppv), (p * se) / (p * se + (100 - p) * fp)) };
    } },
  { id: 'g-sec-tirages-remise', cls: C, chapters: ['seconde-14'], domain: 'stats-proba', level: 2, minutes: 15, title: 'Deux tirages avec remise',
    make(r) {
      const R = r.int(1, 9), B = r.int(1, 9), N = R + B, pR = F(R, N), pB = F(B, N), RR = mul(pR, pR), BB = mul(pB, pB), mix = mul(F(2), mul(pR, pB));
      return { intro: `Une urne contient ${M(R)} boule${R > 1 ? 's' : ''} rouge${R > 1 ? 's' : ''} et ${M(B)} boule${B > 1 ? 's' : ''} bleue${B > 1 ? 's' : ''}. On tire une boule, on note sa couleur, on la remet, puis on tire une seconde boule.`,
        parts: [
          { w: 1, q: 'Construire l’arbre pondéré de l’expérience.', hint: 'Avec remise, la composition de l’urne est la même au second tirage.', a: `À chaque tirage : ${M('R')} avec ${M(fracTex(pR))} et ${M('B')} avec ${M(fracTex(pB))}, au premier comme au second niveau.` },
          { w: 1, q: 'Calculer la probabilité d’obtenir deux boules rouges.', a: M(`P(RR)=${fracTex(pR)}\\times ${fracTex(pR)}=${fracTex(RR)}`) },
          { w: 2, q: 'Calculer la probabilité d’obtenir deux boules de couleurs différentes.', a: `Deux chemins : ${M(`P(RB)+P(BR)=2\\times ${fracTex(pR)}\\times ${fracTex(pB)}=${fracTex(mix)}`)}.` },
          { w: 1, q: 'Vérifier que la somme des probabilités des issues vaut 1.', a: M(`${fracTex(RR)}+${fracTex(BB)}+${fracTex(mix)}=1`) },
        ],
        ok: () => eq(add(add(RR, BB), mix), F(1)) };
    } },

  // ================= 15 Consolidation et transition =================
  { id: 'g-sec-trinome-trois-formes', cls: C, chapters: ['seconde-15', 'seconde-08', 'seconde-10'], domain: 'fonctions', level: 2, minutes: 20, title: 'Synthèse : une fonction sous trois formes',
    make(r) {
      const a = r.pick([-2, -1, 1, 2]), x1 = r.int(-7, 3), x2 = x1 + 2 * r.int(1, 5), al = (x1 + x2) / 2, be = -a * ((x2 - x1) / 2) ** 2, c = [a, -a * (x1 + x2), a * x1 * x2], f = (x) => a * (x - x1) * (x - x2);
      const aT = a === 1 ? '' : a === -1 ? '-' : `${a}`, fac = `${aT}(x${sgn(-x1)})(x${sgn(-x2)})`.replace('(x+0)', 'x').replace('(x-0)', 'x'), can = `${aT}(x${al === 0 ? '' : sgn(-al)})^{2}${be ? sgn(be) : ''}`;
      return { intro: `On donne trois écritures d’une même fonction : ${M(`f(x)=${polyTex(c)}`)}, ${M(`f(x)=${fac}`)} et ${M(`f(x)=${can}`)}.`,
        parts: [
          { w: 2, q: 'Vérifier que les trois expressions sont égales.', hint: 'Développer la forme factorisée et la forme canonique.', a: `En développant : ${M(`${fac}=${polyTex(c)}`)} et ${M(`${can}=${polyTex(c)}`)}.` },
          { w: 1, q: `Choisir la forme la plus adaptée pour calculer ${M('f(0)')}, puis pour résoudre ${M('f(x)=0')}.`, a: `Forme développée : ${M(`f(0)=${c[2]}`)}. Forme factorisée : ${M(`f(x)=0\\iff x=${x1}\\text{ ou }x=${x2}`)}.` },
          { w: 2, q: `Choisir la forme adaptée pour trouver le ${a > 0 ? 'minimum' : 'maximum'} de ${M('f')} et les variations.`, a: `Forme canonique : ${a > 0 ? 'minimum' : 'maximum'} ${M(be)} atteint en ${M(al)} ; ${M('f')} est ${a > 0 ? 'décroissante' : 'croissante'} sur ${M(`]-\\infty\\,;\\,${al}]`)} et ${a > 0 ? 'croissante' : 'décroissante'} sur ${M(`[${al}\\,;\\,+\\infty[`)}.` },
          { w: 2, q: `Résoudre ${M('f(x)>0')}.`, a: `Tableau de signes de la forme factorisée : ${a > 0 ? M(`S=]-\\infty\\,;\\,${x1}[\\cup]${x2}\\,;\\,+\\infty[`) : M(`S=]${x1}\\,;\\,${x2}[`)}.` },
        ],
        ok: () => [-3, 0, 1, 4].every((x) => f(x) === evalPoly(c, x) && f(x) === a * (x - al) ** 2 + be) && (f(x2 + 1) > 0) === (a > 0) && (f(al) > 0) === (a < 0) };
    } },
  { id: 'g-sec-synthese-geometrie', cls: C, chapters: ['seconde-15', 'seconde-12'], domain: 'geometrie', level: 2, minutes: 20, title: 'Synthèse : un quadrilatère dans un repère',
    make(r) {
      const A = P(r, -5, 3); let u, w; do { u = [r.int(1, 5), r.int(-3, 3)]; w = r.next() < 0.4 ? [-u[1], u[0]] : [r.int(-3, 2), r.int(1, 5)]; } while (u[0] * w[1] - u[1] * w[0] === 0 || u[0] + w[0] === 0);
      const B = [A[0] + u[0], A[1] + u[1]], D = [A[0] + w[0], A[1] + w[1]], Cc = [B[0] + w[0], B[1] + w[1]], m = F(Cc[1] - A[1], Cc[0] - A[0]), p = sub(F(A[1]), mul(m, F(A[0])));
      const ac2 = (Cc[0] - A[0]) ** 2 + (Cc[1] - A[1]) ** 2, bd2 = (D[0] - B[0]) ** 2 + (D[1] - B[1]) ** 2;
      return { intro: `Dans un repère orthonormé, on donne ${M(`A${pt(...A)}`)}, ${M(`B${pt(...B)}`)}, ${M(`C${pt(...Cc)}`)} et ${M(`D${pt(...D)}`)}.`,
        parts: [
          { w: 1, q: `Montrer que ${M('ABCD')} est un parallélogramme.`, a: `${M(`\\overrightarrow{AB}${vc(...u)}`)} et ${M(`\\overrightarrow{DC}${vc(Cc[0] - D[0], Cc[1] - D[1])}`)} sont égaux.` },
          { w: 2, q: `Est-ce un rectangle ?`, hint: 'Un parallélogramme est un rectangle si et seulement si ses diagonales ont la même longueur.', a: `${M(`AC^{2}=${ac2}`)} et ${M(`BD^{2}=${bd2}`)} : ${ac2 === bd2 ? 'diagonales de même longueur, c’est un rectangle.' : 'les diagonales n’ont pas la même longueur, ce n’est pas un rectangle.'}` },
          { w: 2, q: `Déterminer l’équation réduite de la diagonale ${M('(AC)')}.`, a: M(`y=${affTex(m, p)}`) },
          { w: 1, q: `Le centre du parallélogramme appartient-il à ${M('(AC)')} ? Pourquoi ?`, a: `Oui : le centre est le milieu de ${M('[AC]')}, donc il est sur la droite ${M('(AC)')} ; on vérifie que ${M(`\\left(${numTex(F(A[0] + Cc[0], 2))}\\,;\\,${numTex(F(A[1] + Cc[1], 2))}\\right)`)} satisfait l’équation.` },
        ],
        ok: () => eq(add(mul(m, F(A[0] + Cc[0], 2)), p), F(A[1] + Cc[1], 2)) && (ac2 === bd2) === (u[0] * w[0] + u[1] * w[1] === 0) };
    } },
  { id: 'g-sec-synthese-donnees', cls: C, chapters: ['seconde-15', 'seconde-07', 'seconde-14'], domain: 'stats-proba', level: 3, minutes: 25, title: 'Synthèse : données et probabilités',
    make(r) {
      const xs = [0, 1, 2, 3, 4], ns = xs.map(() => r.int(3, 25)), N = sum(ns), S = sum(xs.map((x, i) => x * ns[i])), m = F(S, N), flat = xs.flatMap((x, i) => Array(ns[i]).fill(x)), me = median(flat), k = r.int(1, 3), atl = sum(ns.slice(k)), two = r.int(1, 3);
      return { intro: `On a demandé à ${N} élèves combien de frères et sœurs ils ont : ${M(`\\begin{array}{|l|c|c|c|c|c|}\\hline\\text{Nombre}&0&1&2&3&4\\\\\\hline\\text{Effectif}&${ns.join('&')}\\\\\\hline\\end{array}`)}`,
        parts: [
          { w: 1, q: 'Calculer la moyenne et la médiane de cette série.', a: `${M(`\\bar{x}=\\dfrac{${S}}{${N}}${dec(m)}`)} ; ${M(`\\text{Me}=${numTex(me)}`)}.` },
          { w: 2, q: `On choisit un élève au hasard. Quelle est la probabilité qu’il ait au moins ${M(k)} frère${k > 1 ? 's' : ''} ou sœur${k > 1 ? 's' : ''} ?`, a: M(`P=\\dfrac{${atl}}{${N}}${F(atl, N).d === N ? '' : `=${fracTex(F(atl, N))}`}`) },
          { w: 2, q: `On choisit au hasard un élève parmi ceux qui ont au moins un frère ou une sœur. Quelle est la probabilité qu’il en ait exactement ${M(two)} ?`, hint: 'C’est une probabilité conditionnelle : la population de référence change.', a: M(`P=\\dfrac{${ns[two]}}{${N - ns[0]}}${F(ns[two], N - ns[0]).d === N - ns[0] ? '' : `=${fracTex(F(ns[two], N - ns[0]))}`}`) },
          { w: 1, q: 'Si on choisissait 1000 fois un élève au hasard (avec remise), autour de quelle valeur la fréquence des enfants uniques devrait-elle se situer ?', a: `Autour de ${M(`\\dfrac{${ns[0]}}{${N}}\\approx ${roundTex(ns[0] / N, 3)}`)} : la fréquence observée fluctue autour de la probabilité.` },
        ],
        ok: () => near(val(m), flat.reduce((a, b) => a + b, 0) / N) && flat.filter((x) => x >= k).length === atl };
    } },
  { id: 'g-sec-automatismes-fin', cls: C, chapters: ['seconde-15', 'seconde-05'], domain: 'nombres', level: 1, minutes: 12, title: 'Automatismes de fin d’année',
    make(r) {
      const a = r.int(2, 9), b = r.int(2, 9), t = r.pick([10, 20, 25, 50]), P0 = 20 * r.int(2, 20), m = r.nz(-5, 5), p = r.int(-9, 9), k = r.int(-4, 4), n = r.int(2, 9);
      return { intro: `Cinq questions rapides, sans calculatrice. On utilise ${M(`f(x)=${polyTex([m, p])}`)} et un article à ${M(`${P0}\\ \\text{€}`)}.`,
        parts: [
          { w: 1, q: `Développer ${M(`(x+${a})(x-${b})`)}.`, hint: 'Double distributivité : chaque terme de la première parenthèse multiplie chaque terme de la seconde.', a: M(polyTex([1, a - b, -a * b])) },
          { w: 1, q: `Calculer ${M(`f(${k})`)}.`, a: M(`f(${k})=${m * k + p}`) },
          { w: 1, q: `L’article baisse de ${M(`${t}\\,\\%`)} : nouveau prix ?`, a: M(`${P0}\\times ${numTex(F(100 - t, 100))}=${numTex(mul(F(P0), F(100 - t, 100)))}\\ \\text{€}`) },
          { w: 1, q: `Résoudre ${M(`x^{2}=${n * n}`)}.`, a: M(`S=\\{-${n}\\,;\\,${n}\\}`) },
          { w: 1, q: `Le point ${M(`(0\\,;\\,${p})`)} est-il sur la courbe de ${M('f')} ?`, a: `Oui : ${M(`f(0)=${p}`)}.` },
        ],
        ok: () => evalPoly([1, a - b, -a * b], 3) === (3 + a) * (3 - b) && m * k + p === evalPoly([m, p], k) };
    } },
  { id: 'g-sec-evolution-seuil', cls: C, chapters: ['seconde-15', 'seconde-09'], domain: 'nombres', level: 3, minutes: 20, title: 'Modéliser une évolution annuelle',
    make(r) {
      const P0 = 50 * r.int(10, 60), t = r.int(2, 9), q = 1 + t / 100, target = Math.round(P0 * r.pick([1.3, 1.5, 1.8, 2]) / 10) * 10;
      let n = 0, v = P0; while (v < target) { v *= q; n++; }
      if (Math.abs(P0 * q ** n - target) < 0.5 || Math.abs(P0 * q ** (n - 1) - target) < 0.5) return this.make(r);
      const vals = [1, 2, 3].map((k) => P0 * q ** k);
      return { intro: `Une association compte ${M(P0)} adhérents en 2026. On prévoit une hausse de ${M(`${t}\\,\\%`)} par an. On note ${M('a_n')} le nombre d’adhérents prévu en 2026 + n.`,
        parts: [
          { w: 1, q: `Calculer les nombres prévus en 2027, 2028 et 2029 (arrondir à l’unité).`, a: M(vals.map((x, i) => `a_{${i + 1}}\\approx ${Math.round(x)}`).join('\\ ;\\ ')) },
          { w: 2, q: `Exprimer ${M('a_{n+1}')} en fonction de ${M('a_n')}, puis ${M('a_n')} en fonction de ${M('n')}.`, hint: 'Chaque année, on multiplie par le même coefficient multiplicateur.', a: `${M(`a_{n+1}=${numTex(F(100 + t, 100))}\\,a_n`)} et ${M(`a_n=${P0}\\times ${numTex(F(100 + t, 100))}^{n}`)}.` },
          { w: 2, q: `On veut savoir en quelle année l’association dépassera ${M(target)} adhérents. Écrire un algorithme (en langage naturel ou en Python) qui répond, puis donner la réponse.`, a: `On part de ${M(`a=${P0}`)} et ${M('n=0')} ; tant que ${M(`a\\leqslant ${target}`)}, on multiplie ${M('a')} par ${M(numTex(F(100 + t, 100)))} et on ajoute ${M(1)} à ${M('n')}. On obtient ${M(`n=${n}`)} : ${M(`a_{${n - 1}}\\approx ${roundTex(P0 * q ** (n - 1), 1)}`)} et ${M(`a_{${n}}\\approx ${roundTex(P0 * q ** n, 1)}`)}, donc en ${M(2026 + n)}.` },
        ],
        ok: () => P0 * q ** n > target && P0 * q ** (n - 1) <= target && vals.every((x, i) => near(x, P0 * q ** (i + 1))) };
    } },
];
