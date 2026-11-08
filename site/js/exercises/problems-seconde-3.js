// Seeded multi-part problems for Seconde, third set (one each for arithmétique, géométrie repérée, évolutions, statistiques, probabilités):
// the numbers come from the seed, the correction is written with them, and ok() recomputes every quoted result another way.
// Same contract as problems.js: make(r) returns {intro, parts: [{w, q, hint, a}], ok()}.
import { F, add, sub, mul, div, val, eq, M, fracTex, numTex, gcd, lcm, sqrtTex } from './engine.js';
import { pt, vc, parT } from './seconde-kit.js';
import { sorted, medianOf, meanOf, quantileOf } from './seconde-kit-2.js';

const C = 'seconde';
const d2 = (P, Q) => (Q[0] - P[0]) ** 2 + (Q[1] - P[1]) ** 2;
const fr1 = (x) => String(x).replace('.', '{,}');

export const problemsSeconde3 = [
  { id: 'g-sec-salle', cls: C, chapters: ['seconde-01'], domain: 'nombres', level: 2, minutes: 20, title: 'Carreler une salle',
    make(r) {
      const g = r.int(4, 15), [p, q] = r.pick([[3, 4], [4, 5], [5, 6], [3, 5], [5, 7], [7, 8], [2, 5]]), L = g * p, W = g * q, price = r.pick([2, 3, 4, 5]), n = p * q;
      return { intro: `Une salle rectangulaire mesure ${M(`${L}\\ \\text{dm}`)} sur ${M(`${W}\\ \\text{dm}`)}. On veut la recouvrir de carreaux carrés identiques, sans découpe, dont le côté en décimètres est un entier.`,
        parts: [
          { w: 1, q: `Quels côtés sont possibles ? Quel est le plus grand ?`, hint: 'Un côté possible divise à la fois les deux dimensions.', a: `Les côtés possibles sont les diviseurs communs de ${M(L)} et ${M(W)}. Le plus grand est leur PGCD : ${M(`${g}\\ \\text{dm}`)} (${M(`${L}=${g}\\times ${p}`)} et ${M(`${W}=${g}\\times ${q}`)} avec ${M(p)} et ${M(q)} premiers entre eux).` },
          { w: 1, q: `Combien de carreaux de ce plus grand côté faut-il ?`, hint: 'Aire de la salle divisée par l’aire d’un carreau, ou nombre par rangée fois nombre de rangées.', a: `${M(`\\dfrac{${L}}{${g}}\\times\\dfrac{${W}}{${g}}=${p}\\times ${q}=${n}`)} carreaux.` },
          { w: 1, q: `Un carreau coûte ${M(`${price}\\ \\text{€}`)}. Quel est le coût total ?`, a: `${M(`${n}\\times ${price}=${n * price}\\ \\text{€}`)}.` },
          { w: 2, q: `On veut former un carré en juxtaposant des dalles rectangulaires de ${M(`${L}\\ \\text{dm}`)} sur ${M(`${W}\\ \\text{dm}`)}, toutes posées dans le même sens. Quel est le plus petit côté possible ?`, hint: 'Le côté du carré est un multiple commun des deux dimensions.', a: `Le plus petit côté est le PPCM de ${M(L)} et ${M(W)} : ${M(`${g}\\times ${p}\\times ${q}=${lcm(L, W)}\\ \\text{dm}`)}.` },
        ],
        ok: () => { let s = Math.min(L, W); while (L % s || W % s) s--; let m = Math.max(L, W); while (m % L || m % W) m++; return s === g && gcd(L, W) === g && (L / s) * (W / s) === n && m === lcm(L, W) && m === g * p * q; } };
    } },

  { id: 'g-sec-triangle', cls: C, chapters: ['seconde-12', 'seconde-02'], domain: 'geometrie', level: 2, minutes: 25, title: 'Un triangle et son parallélogramme',
    make(r) {
      const A = [r.int(-4, 3), r.int(-4, 3)], p = r.nz(-4, 4), q = r.nz(-4, 4), B = [A[0] + p, A[1] + q], k = r.pick([1, 2]), Cc = [A[0] - k * q, A[1] + k * p], D = [B[0] + Cc[0] - A[0], B[1] + Cc[1] - A[1]], I = [(B[0] + Cc[0]) / 2, (B[1] + Cc[1]) / 2];
      const ab = d2(A, B), ac = d2(A, Cc), bc = d2(B, Cc), nature = k === 1 ? 'rectangle isocèle en A' : 'rectangle en A, non isocèle';
      return { intro: `Dans un repère orthonormé, on donne ${M(`A${pt(...A)}`)}, ${M(`B${pt(...B)}`)} et ${M(`C${pt(...Cc)}`)}.`,
        parts: [
          { w: 2, q: `Calculer ${M('AB^{2}')}, ${M('AC^{2}')} et ${M('BC^{2}')}. En déduire la nature du triangle ${M('ABC')}.`, hint: 'Formule de la distance, puis réciproque de Pythagore.', a: `${M(`AB^{2}=${ab}`)}, ${M(`AC^{2}=${ac}`)}, ${M(`BC^{2}=${bc}`)}. Comme ${M(`AB^{2}+AC^{2}=${ab + ac}=BC^{2}`)}, le triangle est ${nature}${k === 1 ? ` (${M(`AB=AC`)})` : ''}.` },
          { w: 1, q: `Déterminer les coordonnées du milieu ${M('I')} de ${M('[BC]')}.`, a: `${M(`I\\left(${fr1((B[0] + Cc[0]) / 2)}\\,;\\,${fr1((B[1] + Cc[1]) / 2)}\\right)`)}.` },
          { w: 2, q: `Déterminer les coordonnées du point ${M('D')} tel que ${M('ABDC')} soit un parallélogramme.`, hint: 'Dans un parallélogramme les diagonales ont le même milieu, ou ' + M('\\overrightarrow{AB}=\\overrightarrow{CD}') + '.', a: `${M('\\overrightarrow{AB}=\\overrightarrow{CD}')} donne ${M(`D=B+C-A=${pt(...D)}`)}. Le milieu de ${M('[AD]')} est bien ${M('I')}.` },
          { w: 1, q: `Quelle est la nature de ${M('ABDC')} ?`, a: `Parallélogramme avec un angle droit en ${M('A')} : c’est un rectangle${k === 1 ? ', et même un carré car ' + M('AB=AC') : ''}.` },
        ],
        ok: () => ab + ac === bc && (k === 1) === (ab === ac) && B[0] - A[0] === D[0] - Cc[0] && B[1] - A[1] === D[1] - Cc[1] && (A[0] + D[0]) / 2 === I[0] && (A[1] + D[1]) / 2 === I[1] && (B[0] - A[0]) * (Cc[0] - A[0]) + (B[1] - A[1]) * (Cc[1] - A[1]) === 0 };
    } },

  { id: 'g-sec-evolutions', cls: C, chapters: ['seconde-09'], domain: 'nombres', level: 2, minutes: 20, title: 'Hausses, baisses et prix de départ',
    make(r) {
      const P = r.int(4, 30) * 20, a = r.pick([5, 10, 15, 20, 25, 30]), b = r.pick([5, 10, 20, 25, 40]), c1 = F(100 + a, 100), c2 = F(100 - b, 100), cm = mul(c1, c2);
      if (eq(cm, F(1))) return this.make(r);
      const p1 = mul(F(P), c1), p2 = mul(F(P), cm), t = sub(cm, F(1));
      return { intro: `Un produit coûte ${M(`${P}\\ \\text{€}`)} en janvier. En février son prix augmente de ${M(`${a}\\,\\%`)}, puis en mars il baisse de ${M(`${b}\\,\\%`)}.`,
        parts: [
          { w: 1, q: 'Quel est son prix en février, puis en mars ?', hint: 'Coefficients multiplicateurs.', a: `Février : ${M(`${P}\\times ${numTex(c1)}=${numTex(p1)}\\ \\text{€}`)}. Mars : ${M(`${numTex(p1)}\\times ${numTex(c2)}=${numTex(p2)}\\ \\text{€}`)}.` },
          { w: 2, q: 'Quelle est l’évolution globale en pourcentage ? Pourquoi n’est-elle pas égale à la différence des deux taux ?', hint: 'Multiplier les deux coefficients.', a: `${M(`CM=${numTex(c1)}\\times ${numTex(c2)}=${numTex(cm)}`)}, soit une évolution de ${M(`${numTex(F(t.n * 100, t.d))}\\,\\%`)}. Les taux ne s’additionnent pas : le second s’applique à un prix déjà modifié.` },
          { w: 2, q: `Quel pourcentage de baisse en avril ramènerait le prix à ${M(`${P}\\ \\text{€}`)} ?`, hint: 'Le coefficient réciproque est l’inverse du coefficient global.', a: `${M(`CM'=\\dfrac{1}{${numTex(cm)}}`)} donne un prix ${M(`${numTex(p2)}\\times CM'=${P}`)} avec ${M(`CM'=${fracTex(div(F(1), cm))}`)}, soit une évolution de ${M(`${fracTex(sub(div(F(1), cm), F(1)))}`)} en valeur approchée ${M(`${(Math.round((val(div(F(1), cm)) - 1) * 10000) / 100).toFixed(2).replace('.', '{,}')}\\,\\%`)}.` },
        ],
        ok: () => eq(p1, F(P * (100 + a), 100)) && eq(p2, mul(F(P), mul(F((100 + a), 100), F(100 - b, 100)))) && eq(mul(p2, div(F(1), cm)), F(P)) && !eq(cm, F(100 + a - b, 100)) && Math.abs(val(p2) - P * (1 + a / 100) * (1 - b / 100)) < 1e-9 };
    } },

  { id: 'g-sec-notes', cls: C, chapters: ['seconde-07'], domain: 'stats-proba', level: 2, minutes: 20, title: 'Les notes d’un devoir',
    make(r) {
      const n = r.pick([12, 13, 14, 15, 16]), data = Array.from({ length: n }, () => r.int(4, 19)), s = sorted(data), k = r.int(1, 3), sh = data.map((x) => x + k);
      const q1 = quantileOf(data, 0.25), q3 = quantileOf(data, 0.75), med = medianOf(data), mean = meanOf(data);
      return { intro: `Voici les notes sur 20 de ${M(n)} élèves : ${data.join(' ; ')}.`,
        parts: [
          { w: 1, q: 'Calculer la moyenne (arrondie au centième) et l’étendue.', a: `Somme ${M(data.reduce((x, y) => x + y, 0))}, moyenne ${M(`\\dfrac{${data.reduce((x, y) => x + y, 0)}}{${n}}\\approx ${fr1(mean.toFixed(2))}`)} ; étendue ${M(`${s[n - 1]}-${s[0]}=${s[n - 1] - s[0]}`)}.` },
          { w: 2, q: 'Déterminer la médiane et les quartiles.', hint: 'Ranger les notes dans l’ordre croissant.', a: `Rangées : ${M(s.join('\\ ;\\ '))}. Médiane ${M(fr1(med))} ; ${M('Q_1')} (rang ${M(Math.ceil(n / 4))}) ${M(q1)} ; ${M('Q_3')} (rang ${M(Math.ceil((3 * n) / 4))}) ${M(q3)}.` },
          { w: 2, q: `Le professeur ajoute ${M(k)} point${k > 1 ? 's' : ''} à chaque copie. Que deviennent la moyenne, la médiane et l’étendue ?`, hint: 'Chaque valeur est translatée.', a: `La moyenne et la médiane augmentent de ${M(k)} (${M(fr1((mean + k).toFixed(2)))} et ${M(fr1(medianOf(sh)))}), l’étendue reste égale à ${M(s[n - 1] - s[0])}.` },
        ],
        ok: () => { const cnt = (v) => data.filter((x) => x <= v).length; return cnt(q1) * 4 >= n && cnt(q3) * 4 >= 3 * n && Math.abs(meanOf(sh) - mean - k) < 1e-9 && medianOf(sh) === med + k && Math.max(...sh) - Math.min(...sh) === s[n - 1] - s[0] && s.length === n; } };
    } },

  { id: 'g-sec-urne', cls: C, chapters: ['seconde-14'], domain: 'stats-proba', level: 3, minutes: 25, title: 'Tirages dans une urne',
    make(r) {
      const R = r.int(3, 8), B = r.int(3, 8), G = r.int(2, 5), n = R + B + G, balls = [...Array(R).fill('R'), ...Array(B).fill('B'), ...Array(G).fill('V')];
      const pairs = (pred) => { let c = 0, t = 0; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j) { t++; if (pred(balls[i], balls[j])) c++; } return F(c, t); };
      const pR = F(R, n), p2R = mul(F(R, n), F(R - 1, n - 1)), same = add(add(mul(F(R, n), F(R - 1, n - 1)), mul(F(B, n), F(B - 1, n - 1))), mul(F(G, n), F(G - 1, n - 1))), diff = sub(F(1), same);
      return { intro: `Une urne contient ${M(R)} boules rouges, ${M(B)} bleues et ${M(G)} vertes, indiscernables au toucher. On tire deux boules successivement et sans remise.`,
        parts: [
          { w: 1, q: 'Quelle est la probabilité que la première boule soit rouge ?', a: `${M(`\\dfrac{${R}}{${n}}=${fracTex(pR)}`)}.` },
          { w: 2, q: 'Quelle est la probabilité de tirer deux boules rouges ?', hint: 'Arbre pondéré : après un tirage il reste une boule de moins.', a: `${M(`\\dfrac{${R}}{${n}}\\times\\dfrac{${R - 1}}{${n - 1}}=${fracTex(p2R)}`)}.` },
          { w: 2, q: 'Quelle est la probabilité d’obtenir deux boules de la même couleur ?', a: `${M(`\\dfrac{${R}\\times ${R - 1}+${B}\\times ${B - 1}+${G}\\times ${G - 1}}{${n}\\times ${n - 1}}=${fracTex(same)}`)}.` },
          { w: 1, q: 'En déduire la probabilité d’obtenir deux couleurs différentes.', hint: 'Événement contraire.', a: `${M(`1-${fracTex(same)}=${fracTex(diff)}`)}.` },
        ],
        ok: () => eq(p2R, pairs((a, b) => a === 'R' && b === 'R')) && eq(same, pairs((a, b) => a === b)) && eq(diff, pairs((a, b) => a !== b)) && eq(pR, F(balls.filter((x) => x === 'R').length, n)) };
    } },
];
