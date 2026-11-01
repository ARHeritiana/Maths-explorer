// Seeded problems: multi-part exercises with a full correction whose numbers are drawn from a seed (any seed, so a
// limitless supply). Each make(r) returns {intro, parts: [{w, q, a}], ok()}; ok() recomputes the quoted results.
// Same contract as the fixed exercises of authored.js (id, cls, chapters, domain, level, minutes, title).
import { F, add, sub, mul, div, val, eq, M, R, fracTex, numTex, roundTex, polyTex, binom, sgn } from './engine.js';

const pw = (t, k) => (k === 1 ? t : `${t}^{${k}}`);   // no exponent 1
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
const euro = (x) => `${Number.isInteger(x) ? x : roundTex(x, 2)}\\ \\text{€}`;

export const problems = [
  { id: 'g-sec-forfaits', cls: 'seconde', chapters: ['seconde-06', 'seconde-08'], domain: 'fonctions', level: 2, minutes: 15, title: 'Choisir un forfait',
    make(r) {
      const pa = r.int(1, 4), d = r.int(1, 3), pb = pa + d, n0 = r.int(6, 14), b0 = r.int(0, 10), a0 = b0 + d * n0;
      const f = (x) => a0 + pa * x, g = (x) => b0 + pb * x, k = Math.max(2, n0 - r.int(1, 3));
      const cheap = f(k) < g(k) ? 'A' : 'B';
      return { intro: `Une salle de sport propose deux formules. Formule A : ${a0} € d’inscription puis ${pa} € par séance. Formule B : ${b0} € d’inscription puis ${pb} € par séance. On note ${M('x')} le nombre de séances.`,
        parts: [
          { w: 1, q: `Exprimer en fonction de ${M('x')} le coût ${M('f(x)')} de la formule A et le coût ${M('g(x)')} de la formule B.`, a: M(`f(x)=${polyTex([pa, a0])}\\ \\text{ et }\\ g(x)=${polyTex([pb, b0])}`) },
          { w: 1, q: `Quelle formule est la moins chère pour ${M(k)} séances ?`, a: `${M(`f(${k})=${f(k)}`)} et ${M(`g(${k})=${g(k)}`)} : la formule ${cheap} est la moins chère.` },
          { w: 2, q: `Résoudre ${M('f(x)=g(x)')}. Interpréter.`, a: `${M(`${polyTex([pa, a0])}=${polyTex([pb, b0])}\\iff x=${n0}`)} : pour ${M(n0)} séances, les deux formules coûtent ${M(`${f(n0)}\\ \\text{€}`)}.` },
          { w: 2, q: `Résoudre ${M('f(x)<g(x)')} et conclure.`, a: `${M(`${polyTex([pa, a0])}<${polyTex([pb, b0])}\\iff ${n0}<x`)} : la formule A est avantageuse à partir de ${M(n0 + 1)} séances.` },
        ],
        ok: () => f(n0) === g(n0) && f(n0 + 1) < g(n0 + 1) && f(n0 - 1) > g(n0 - 1) && (f(k) < g(k)) === (cheap === 'A') && a0 > b0 && pa < pb };
    } },
  { id: 'g-sec-soldes', cls: 'seconde', chapters: ['seconde-09'], domain: 'nombres', level: 2, minutes: 12, title: 'Deux remises successives',
    make(r) {
      const p = r.pick([60, 80, 100, 120, 150, 200, 240]), t1 = r.pick([10, 20, 25, 30, 40, 50]); let t2; do { t2 = r.pick([10, 20, 25, 30, 40, 50]); } while (t2 === t1);
      const c1 = F(100 - t1, 100), c2 = F(100 - t2, 100), p1 = mul(F(p), c1), p2 = mul(p1, c2), cm = mul(c1, c2), loss = mul(sub(F(1), cm), F(100));
      return { intro: `Un article coûte ${p} €. Pendant les soldes, il subit une première remise de ${t1} %, puis une seconde remise de ${t2} % sur le prix déjà soldé.`,
        parts: [
          { w: 1, q: 'Calculer le prix après la première remise.', a: M(`${p}\\times ${numTex(c1)}=${numTex(p1)}\\ \\text{€}`) },
          { w: 1, q: 'Calculer le prix final.', a: M(`${numTex(p1)}\\times ${numTex(c2)}=${numTex(p2)}\\ \\text{€}`) },
          { w: 2, q: 'Déterminer le taux d’évolution global.', a: `${M(`CM=${numTex(c1)}\\times ${numTex(c2)}=${numTex(cm)}`)} donc une baisse de ${M(`${numTex(loss)}\\,\\%`)}.` },
          { w: 2, q: `Un client affirme : « ${t1} % puis ${t2} % de remise, cela fait ${t1 + t2} % ». A-t-il raison ? Expliquer.`, a: `Non : les pourcentages ne s’additionnent pas, car la seconde remise porte sur le prix déjà réduit. La baisse globale est ${M(`${numTex(loss)}\\,\\%`)}, pas ${M(`${t1 + t2}\\,\\%`)}.` },
        ],
        ok: () => near(val(p2), p * (1 - t1 / 100) * (1 - t2 / 100)) && near(val(loss), 100 - 100 * (1 - t1 / 100) * (1 - t2 / 100)) && val(loss) !== t1 + t2 };
    } },
  { id: 'g-pre-trinome', cls: 'premiere', chapters: ['premiere-02'], domain: 'algebre', level: 2, minutes: 20, title: 'Étude d’un trinôme',
    make(r) {
      let a, r1, m, al; do { a = r.pick([-3, -2, -1, 1, 2, 3]); r1 = r.int(-6, 4); m = r.int(1, 4); al = r1 + m; } while (al === 0);
      const r2 = r1 + 2 * m, c = [a, -2 * a * al, a * r1 * r2], f = (x) => a * x * x + c[1] * x + c[2], be = -a * m * m;
      const dl = c[1] * c[1] - 4 * a * c[2], can = `${a === 1 ? '' : a === -1 ? '-' : a}(x${sgn(-al)})^{2}${sgn(be)}`;
      return { intro: `On considère la fonction ${M(`f(x)=${polyTex(c)}`)} définie sur ${M(R)}.`,
        parts: [
          { w: 2, q: `Calculer le discriminant et résoudre ${M('f(x)=0')}.`, a: `${M(`\\Delta=${dl}`)}, ${M(`x_1=${r1}`)} et ${M(`x_2=${r2}`)}.` },
          { w: 2, q: `Écrire ${M('f(x)')} sous forme canonique.`, a: M(`f(x)=${can}`) },
          { w: 2, q: `Dresser le tableau de variations de ${M('f')}.`, a: a > 0 ? `${M('f')} est décroissante sur ${M(`]-\\infty\\,;\\,${al}]`)}, croissante sur ${M(`[${al}\\,;\\,+\\infty[`)} ; minimum ${M(`f(${al})=${be}`)}.` : `${M('f')} est croissante sur ${M(`]-\\infty\\,;\\,${al}]`)}, décroissante sur ${M(`[${al}\\,;\\,+\\infty[`)} ; maximum ${M(`f(${al})=${be}`)}.` },
          { w: 2, q: `Résoudre ${M('f(x)>0')}.`, a: a < 0 ? `${M('a<0')} et racines ${M(r1)} et ${M(r2)} : ${M(`S=]${r1}\\,;\\,${r2}[`)}.` : `${M('a>0')} et racines ${M(r1)} et ${M(r2)} : ${M(`S=]-\\infty\\,;\\,${r1}[\\,\\cup\\,]${r2}\\,;\\,+\\infty[`)}.` },
          { w: 2, q: `Résoudre ${M(`f(x)=${f(0)}`)}.`, a: `Les points d’abscisses ${M('0')} et ${M(`${2 * al}`)} sont symétriques par rapport à l’axe ${M(`x=${al}`)} : ${M(`S=\\{0\\,;\\,${2 * al}\\}`)}.` },
        ],
        ok: () => f(r1) === 0 && f(r2) === 0 && dl === a * a * 4 * m * m && [-4, 0, 3, 7].every((x) => f(x) === a * (x - al) ** 2 + be) && f(0) === f(2 * al) && ((f(al + 0.5 * 0) > 0) === (a < 0) || be === 0) };
    } },
  { id: 'g-stmg-cout', cls: 'stmg', chapters: ['stmg-04'], domain: 'fonctions', level: 2, minutes: 20, title: 'Coût moyen de fabrication',
    make(r) {
      const Fx = 100 * r.int(3, 15), u = r.int(2, 10);
      const divs = [30, 40, 50, 60, 75, 80, 100, 120, 125, 150, 200, 250].filter((x) => Fx % x === 0), x0 = r.pick(divs), kq = Fx / x0, tgt = u + kq;
      const C = (x) => u + Fx / x;
      return { intro: `Un artisan fabrique ${M('x')} objets par mois (${M('1\\leqslant x\\leqslant 300')}). Le coût mensuel est de ${Fx} € de frais fixes plus ${u} € par objet. Le coût moyen par objet est ${M('C_M(x)')}.`,
        parts: [
          { w: 2, q: `Montrer que ${M(`C_M(x)=${u}+\\dfrac{${Fx}}{x}`)}.`, a: `Le coût total est ${M(`${u}x+${Fx}`)} donc ${M(`C_M(x)=\\dfrac{${u}x+${Fx}}{x}=${u}+\\dfrac{${Fx}}{x}`)}.` },
          { w: 1, q: `Calculer le coût moyen pour ${M('10')} objets.`, a: M(`C_M(10)=${u}+${Fx / 10}=${u + Fx / 10}\\ \\text{€}`) },
          { w: 2, q: `Étudier les variations de ${M('C_M')} sur ${M('[1\\,;\\,300]')}.`, a: `La fonction inverse est décroissante sur ${M('[1\\,;\\,300]')} et ${M(`${Fx}>0`)} : ${M('C_M')} est décroissante.` },
          { w: 3, q: `Combien d’objets faut-il fabriquer pour que le coût moyen soit inférieur ou égal à ${M(`${tgt}\\ \\text{€}`)} ?`, a: `${M(`${u}+\\dfrac{${Fx}}{x}\\leqslant ${tgt}\\iff\\dfrac{${Fx}}{x}\\leqslant ${kq}\\iff x\\geqslant ${x0}`)} (car ${M('x>0')}) : au moins ${M(x0)} objets.` },
        ],
        ok: () => C(10) === u + Fx / 10 && near(C(x0), tgt) && C(x0 - 1) > tgt && [1, 40, 299].every((x) => C(x) > C(x + 1)) && x0 <= 300 };
    } },
  { id: 'g-ter-qcm', cls: 'terminale', chapters: ['terminale-07'], domain: 'stats-proba', level: 3, minutes: 25, title: 'Un QCM répondu au hasard',
    make(r) {
      for (;;) {
        const n = r.int(6, 20), m = r.pick([3, 4, 5, 6]), k = r.int(2, 5), p = 1 / m, q = 1 - p;
        const pk = binom(n, k) * p ** k * q ** (n - k), pa = 1 - q ** n, nStar = Math.ceil(Math.log(0.01) / Math.log(q)), x = Math.log(0.01) / Math.log(q);
        const safeR = (y, d) => Math.abs(y * 10 ** d - Math.floor(y * 10 ** d) - 0.5) > 1e-4;
        if (!safeR(pk, 3) || !safeR(pa, 3) || Math.abs(x - Math.round(x)) < 0.02) continue;
        return { intro: `Un QCM comporte ${n} questions, chacune avec ${m} réponses dont une seule est juste. Un élève répond au hasard. On note ${M('X')} le nombre de bonnes réponses.`,
          parts: [
            { w: 2, q: `Justifier que ${M('X')} suit une loi binomiale dont on donnera les paramètres.`, a: `${n} épreuves identiques et indépendantes à deux issues, de probabilité de succès ${M(`\\dfrac{1}{${m}}`)} : ${M(`X\\sim\\mathcal{B}\\left(${n}\\,;\\,\\dfrac{1}{${m}}\\right)`)}.` },
            { w: 2, q: `Calculer ${M('E(X)')}.`, a: M(`E(X)=${n}\\times\\dfrac{1}{${m}}=${fracTex(F(n, m))}`) },
            { w: 3, q: `Calculer ${M(`P(X=${k})`)} à ${M('10^{-3}')} près.`, a: M(`P(X=${k})=\\dbinom{${n}}{${k}}\\left(\\dfrac{1}{${m}}\\right)^{${k}}${pw(`\\left(\\dfrac{${m - 1}}{${m}}\\right)`, n - k)}\\approx ${roundTex(pk, 3)}`) },
            { w: 2, q: 'Calculer la probabilité d’avoir au moins une bonne réponse.', a: M(`P(X\\geqslant 1)=1-\\left(\\dfrac{${m - 1}}{${m}}\\right)^{${n}}\\approx ${roundTex(pa, 3)}`) },
            { w: 3, q: `Combien faudrait-il de questions pour que cette probabilité dépasse ${M('0{,}99')} ?`, a: `${M(`1-\\left(\\dfrac{${m - 1}}{${m}}\\right)^{n}\\geqslant 0{,}99\\iff\\left(\\dfrac{${m - 1}}{${m}}\\right)^{n}\\leqslant 0{,}01\\iff n\\geqslant\\dfrac{\\ln 0{,}01}{\\ln\\left(${m - 1}/${m}\\right)}\\approx ${roundTex(x, 2)}`)} : il faut ${M(nStar)} questions.` },
          ],
          ok: () => { let s = 0; for (let i = 0; i <= n; i++) s += binom(n, i) * p ** i * q ** (n - i); let pmf = q ** n; for (let i = 0; i < k; i++) pmf *= ((n - i) / (i + 1)) * (p / q); return near(s, 1) && near(pmf, pk, 1e-9) && q ** nStar <= 0.01 && q ** (nStar - 1) > 0.01; } };
      }
    } },
  { id: 'g-ter-integrale', cls: 'terminale', chapters: ['terminale-11'], domain: 'analyse', level: 2, minutes: 15, title: 'Une intégrale avec une exponentielle',
    make(r) {
      const c = r.int(1, 9), a = r.pick([-2, -1, 0, 0, 1, 2]), b = a + r.int(1, 5);
      const f = (x) => c * x * Math.exp(x), Fp = (x) => c * (x - 1) * Math.exp(x), I = Fp(b) - Fp(a);
      const eT = (k, e) => (k === 0 ? '' : e === 0 ? `${k}` : `${Math.abs(k) === 1 ? (k < 0 ? '-' : '') : k}\\mathrm{e}${e === 1 ? '' : `^{${e}}`}`);
      const kb = c * (b - 1), ka = -c * (a - 1);   // I = kb e^b + ka e^a
      const terms = [eT(kb, b), eT(ka, a)].filter(Boolean), exact = terms.length ? terms.reduce((acc, t) => (acc === '' ? t : acc + (t.startsWith('-') ? t : `+${t}`)), '') : '0';
      const n = 4000, h = (b - a) / n; let sm = f(a) + f(b); for (let i = 1; i < n; i++) sm += f(a + i * h) * (i % 2 ? 4 : 2);
      const coef = c === 1 ? '' : c;
      return { intro: `Soit ${M(`f(x)=${coef}x\\,\\mathrm{e}^{x}`)} sur ${M(`[${a}\\,;\\,${b}]`)} et ${M(`F(x)=${coef}(x-1)\\mathrm{e}^{x}`)}.`,
        parts: [
          { w: 2, q: `Montrer que ${M('F')} est une primitive de ${M('f')}.`, a: M(`F'(x)=${coef}\\mathrm{e}^{x}+${coef}(x-1)\\mathrm{e}^{x}=${coef}x\\,\\mathrm{e}^{x}=f(x)`) },
          { w: 2, q: `Calculer ${M(`I=\\displaystyle\\int_{${a}}^{${b}} f(x)\\,\\mathrm{d}x`)} (valeur exacte).`, a: M(`I=F(${b})-F(${a})=${exact}`) },
          { w: 1, q: `Donner une valeur approchée de ${M('I')} à ${M('10^{-2}')} près.`, a: M(`I\\approx ${roundTex(I, 2)}`) },
          { w: 1, q: `Le signe de ${M('f')} sur ${M(`[${a}\\,;\\,${b}]`)} permet-il d’interpréter ${M('I')} comme une aire ?`, a: a >= 0 ? `Oui : ${M('f')} est positive sur ${M(`[${a}\\,;\\,${b}]`)}, donc ${M('I')} est l’aire (en unités d’aire) sous la courbe.` : `Non : ${M('f')} change de signe en ${M('0')}. ${M('I')} est une aire algébrique : l’aire au-dessus de l’axe moins l’aire au-dessous.` },
        ],
        ok: () => [0.2, -0.4, 0.9].every((x) => near((Fp(x + 1e-6) - Fp(x - 1e-6)) / 2e-6, f(x), 1e-4)) && near((sm * h) / 3, I, 1e-8) && near(kb * Math.exp(b) + ka * Math.exp(a), I) && b > a };
    } },
];
