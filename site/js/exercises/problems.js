// Seeded problems: multi-part exercises with a full correction whose numbers are drawn from a seed (any seed, so a
// limitless supply). Each make(r) returns {intro, parts: [{w, q, a}], ok()}; ok() recomputes the quoted results.
// Same contract as the fixed exercises of authored.js (id, cls, chapters, domain, level, minutes, title).
import { F, add, sub, mul, div, val, eq, M, R, fracTex, numTex, roundTex, polyTex, binom, sgn, par, gcd, sqrtTex } from './engine.js';

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
          { w: 2, q: `Résoudre ${M('f(x)=g(x)')}. Interpréter.`, hint: 'Regrouper les termes en x d’un même côté, puis diviser par le coefficient de x.', a: `${M(`${polyTex([pa, a0])}=${polyTex([pb, b0])}\\iff x=${n0}`)} : pour ${M(n0)} séances, les deux formules coûtent ${M(`${f(n0)}\\ \\text{€}`)}.` },
          { w: 2, q: `Résoudre ${M('f(x)<g(x)')} et conclure.`, hint: 'Même méthode que pour l’équation ; si l’on divise par un nombre négatif, le sens de l’inégalité change.', a: `${M(`${polyTex([pa, a0])}<${polyTex([pb, b0])}\\iff ${n0}<x`)} : la formule A est avantageuse à partir de ${M(n0 + 1)} séances.` },
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
          { w: 2, q: 'Déterminer le taux d’évolution global.', hint: 'Multiplier les deux coefficients multiplicateurs.', a: `${M(`CM=${numTex(c1)}\\times ${numTex(c2)}=${numTex(cm)}`)} donc une baisse de ${M(`${numTex(loss)}\\,\\%`)}.` },
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
  { id: 'g-exp-markov', cls: 'expertes', chapters: ['expertes-11', 'expertes-09'], domain: 'matrices', level: 2, minutes: 25, title: 'Deux boulangeries : une chaîne de Markov',
    make(r) {
      const a = r.int(1, 8), b = r.int(1, 8), p = F(a, 20), q = F(b, 20), mp = F(20 - a, 20), mq = F(20 - b, 20);
      const P1 = [mp, p], P2 = [add(mul(mp, mp), mul(p, q)), add(mul(mp, p), mul(p, mq))], x = F(b, a + b), y = F(a, a + b);
      const mat = `\\begin{pmatrix}${numTex(mp)}&${numTex(p)}\\\\${numTex(q)}&${numTex(mq)}\\end{pmatrix}`, row = (v) => `\\begin{pmatrix}${v.map(numTex).join('&')}\\end{pmatrix}`;
      return { intro: `Chaque jour, un client achète son pain dans l’une de deux boulangeries ${M('A')} ou ${M('B')}. S’il est allé chez ${M('A')} un jour, il va chez ${M('B')} le lendemain avec la probabilité ${M(numTex(p))} ; s’il est allé chez ${M('B')}, il va chez ${M('A')} le lendemain avec la probabilité ${M(numTex(q))}. Le premier jour (jour 0), il va chez ${M('A')}. On note ${M('P_{n}=\\begin{pmatrix}a_{n}&b_{n}\\end{pmatrix}')} l’état probabiliste du jour ${M('n')}.`,
        parts: [
          { w: 1, q: `Donner la matrice de transition ${M('M')} (dans l’ordre ${M('A')}, ${M('B')}) et l’état ${M('P_{0}')}.`, a: M(`M=${mat}\\ ;\\ P_{0}=\\begin{pmatrix}1&0\\end{pmatrix}`) },
          { w: 2, q: `Calculer ${M('P_{1}')} et ${M('P_{2}')}.`, a: M(`P_{1}=P_{0}M=${row(P1)}\\ ;\\ P_{2}=P_{1}M=${row(P2)}`) },
          { w: 2, q: `Déterminer l’état stable ${M('P=\\begin{pmatrix}x&y\\end{pmatrix}')}, c’est-à-dire tel que ${M('PM=P')} et ${M('x+y=1')}.`, a: `${M('PM=P')} donne ${M(`${numTex(p)}x=${numTex(q)}y`)} ; avec ${M('x+y=1')} : ${M(`x=${fracTex(x)}`)} et ${M(`y=${fracTex(y)}`)}.` },
          { w: 1, q: 'Interpréter ce résultat.', a: `À long terme, le client va chez ${M('A')} environ ${M(`${roundTex(100 * val(x), 1)}\\,\\%`)} des jours.` },
        ],
        ok: () => { const m = [[1 - a / 20, a / 20], [b / 20, 1 - b / 20]], st = (v) => [v[0] * m[0][0] + v[1] * m[1][0], v[0] * m[0][1] + v[1] * m[1][1]]; const p1 = st([1, 0]), p2 = st(p1), xs = st([val(x), val(y)]);
          return near(p1[0], val(P1[0])) && near(p2[0], val(P2[0])) && near(p2[1], val(P2[1])) && near(xs[0], val(x)) && near(xs[1], val(y)) && eq(add(x, y), F(1)); } };
    } },
  { id: 'g-exp-affine', cls: 'expertes', chapters: ['expertes-06', 'expertes-07'], domain: 'arithmetique', level: 2, minutes: 25, title: 'Un chiffrement affine',
    make(r) {
      const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', mod = (n) => ((n % 26) + 26) % 26;
      const a = r.pick([3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25]), b = r.int(1, 25), inv = [...Array(26).keys()].find((k) => mod(a * k) === 1), c = mod(-inv * b);
      const x1 = r.int(0, 25), y1 = mod(a * x1 + b); let x2; do { x2 = r.int(0, 25); } while (x2 === x1); const y2 = mod(a * x2 + b), kk = (a * inv - 1) / 26;
      return { intro: `Chaque lettre est remplacée par son rang ${M('x')} (${M('A')} : 0, ${M('B')} : 1, ..., ${M('Z')} : 25), puis par la lettre de rang ${M('y')}, reste de la division de ${M(`${a}x+${b}`)} par 26 : ${M(`y\\equiv ${a}x+${b}\\ [26]`)}.`,
        parts: [
          { w: 1, q: `Coder la lettre ${M(L[x1])}.`, a: `${M(L[x1])} a pour rang ${M(x1)} ; ${M(`${a}\\times ${x1}+${b}=${a * x1 + b}\\equiv ${y1}\\ [26]`)} : ${M(L[x1])} est codée ${M(L[y1])}.` },
          { w: 2, q: `Justifier que ${M(a)} et 26 sont premiers entre eux, puis trouver un entier ${M("a'")} compris entre 0 et 25 tel que ${M(`${a}a'\\equiv 1\\ [26]`)}.`, a: `${M(a)} est impair et n’est pas multiple de 13, donc ${M(`\\mathrm{PGCD}(${a},26)=1`)}. ${M(`${a}\\times ${inv}=${a * inv}=26\\times ${kk}+1`)} : ${M(`a'=${inv}`)}.` },
          { w: 2, q: `En déduire que ${M(`x\\equiv ${inv}y+${c}\\ [26]`)}.`, a: `En multipliant ${M(`y\\equiv ${a}x+${b}`)} par ${M(inv)} : ${M(`${inv}y\\equiv x+${inv * b}\\ [26]`)}, donc ${M(`x\\equiv ${inv}y-${inv * b}\\equiv ${inv}y+${c}\\ [26]`)}.` },
          { w: 1, q: `Décoder la lettre ${M(L[y2])}.`, a: `${M(L[y2])} a pour rang ${M(y2)} ; ${M(`${inv}\\times ${y2}+${c}=${inv * y2 + c}\\equiv ${x2}\\ [26]`)} : c’est la lettre ${M(L[x2])}.` },
        ],
        ok: () => gcd(a, 26) === 1 && mod(a * inv) === 1 && mod(inv * y2 + c) === x2 && mod(inv * y1 + c) === x1 && Number.isInteger(kk) && c !== 0 };
    } },
  { id: 'g-ter-exp-study', cls: 'terminale', chapters: ['terminale-06', 'terminale-04'], domain: 'analyse', level: 2, minutes: 25, title: 'Étude d’une fonction avec l’exponentielle',
    make(r) {
      const a = r.pick([-3, -2, -1, 1, 2, 3]), c = r.int(-5, 5), m = F(-(a + c), a), mv = val(m), f = (x) => (a * x + c) * Math.exp(x);
      const lin = polyTex([a, c]), lin1 = polyTex([a, a + c]), small = (q) => (q.d === 1 ? `${q.n}` : `${q.n < 0 ? '-' : ''}\\frac{${Math.abs(q.n)}}{${q.d}}`);
      const ex = m.n === 0 ? '' : `\\mathrm{e}^{${small(m)}}`, fm = m.n === 0 ? `${-a}` : `${a === 1 ? '-' : a === -1 ? '' : -a}${ex}`;
      const shown = c === 0 ? `${a === 1 ? '' : a === -1 ? '-' : a}x\\mathrm{e}^{x}` : `(${lin})\\mathrm{e}^{x}`;
      const down = `\\left]-\\infty\\,;\\,${fracTex(m)}\\right]`, up = `\\left[${fracTex(m)}\\,;\\,+\\infty\\right[`;
      return { intro: `Soit ${M('f')} la fonction définie sur ${M(R)} par ${M(`f(x)=${shown}`)}.`,
        parts: [
          { w: 1, q: `Montrer que pour tout réel ${M('x')}, ${M(`f'(x)=(${lin1})\\mathrm{e}^{x}`)}.`, a: `${M('f=uv')} avec ${M(`u(x)=${lin}`)} et ${M('v(x)=\\mathrm{e}^{x}')} : ${M(`f'(x)=${a}\\mathrm{e}^{x}+(${lin})\\mathrm{e}^{x}=(${lin1})\\mathrm{e}^{x}`)}.`.replace('=1\\mathrm{e}', '=\\mathrm{e}').replace('=-1\\mathrm{e}', '=-\\mathrm{e}') },
          { w: 2, q: `Étudier le signe de ${M("f'(x)")} et en déduire les variations de ${M('f')}.`, a: `${M('\\mathrm{e}^{x}>0')}, donc ${M("f'(x)")} a le signe de ${M(lin1)}, qui s’annule en ${M(fracTex(m))}. ${a > 0 ? `${M('f')} est décroissante sur ${M(down)} et croissante sur ${M(up)}.` : `${M('f')} est croissante sur ${M(down)} et décroissante sur ${M(up)}.`}` },
          { w: 1, q: `Donner la valeur exacte de l’extremum de ${M('f')} et préciser sa nature.`, a: `C’est un ${a > 0 ? 'minimum' : 'maximum'}, atteint en ${M(fracTex(m))} : ${M(`f\\left(${fracTex(m)}\\right)=${fm}`)}.` },
          { w: 1, q: `Déterminer une équation de la tangente à la courbe de ${M('f')} au point d’abscisse 0.`, a: `${M(`f(0)=${c}`)} et ${M(`f'(0)=${a + c}`)} : ${M(`y=${polyTex([a + c, c])}`)}.` },
          { w: 1, q: `Déterminer les limites de ${M('f')} en ${M('+\\infty')} et en ${M('-\\infty')} (on admet que ${M('\\lim_{x\\to-\\infty}x\\mathrm{e}^{x}=0')}).`, a: `En ${M('+\\infty')} : ${M(`\\lim f(x)=${a > 0 ? '+' : '-'}\\infty`)} (produit). En ${M('-\\infty')} : ${M(`f(x)=${a === 1 ? '' : a === -1 ? '-' : a}x\\mathrm{e}^{x}${c === 0 ? '' : `${sgn(c)}\\mathrm{e}^{x}`}`)} donc ${M('\\lim f(x)=0')}.` },
        ],
        ok: () => { const d = (x) => (f(x + 1e-6) - f(x - 1e-6)) / 2e-6; return near(d(0.3), (a * 0.3 + a + c) * Math.exp(0.3), 1e-5) && Math.sign(d(mv + 0.5)) === Math.sign(a) && Math.sign(d(mv - 0.5)) === -Math.sign(a) && near(f(mv), -a * Math.exp(mv), 1e-9) && near(d(0), a + c, 1e-5) && Math.abs(f(-60)) < 1e-20; } };
    } },
  { id: 'g-pre-epargne', cls: 'premiere', chapters: ['premiere-01'], domain: 'suites', level: 2, minutes: 20, title: 'Deux placements',
    make(r) {
      const C0 = 500 * r.int(2, 12), add0 = 10 * r.int(3, 20), t = r.pick([2, 3, 4, 5, 6]);
      const u = (n) => C0 + n * add0, v = (n) => C0 * (1 + t / 100) ** n;
      let N = 1; while (v(N) <= u(N)) N++;
      if (N < 3 || N > 30 || v(N) - u(N) < 0.5 || u(N - 1) - v(N - 1) < 0.5) return this.make(r);   // a clear crossing within 30 years
      const q = F(100 + t, 100);
      return { intro: `Le ${M('1^{\\text{er}}')} janvier 2026, on dispose de ${C0} €. Placement A : on ajoute ${add0} € chaque année. Placement B : le capital augmente de ${t} % par an (intérêts composés). On note ${M('u_{n}')} et ${M('v_{n}')} les capitaux (en euros) au bout de ${M('n')} années.`,
        parts: [
          { w: 1, q: `Calculer ${M('u_{1}')}, ${M('u_{2}')}, ${M('v_{1}')} et ${M('v_{2}')}.`, a: M(`u_{1}=${u(1)}\\ ;\\ u_{2}=${u(2)}\\ ;\\ v_{1}=${numTex(mul(F(C0), q))}\\ ;\\ v_{2}=${numTex(mul(mul(F(C0), q), q))}`) },
          { w: 2, q: `Quelle est la nature de chacune des suites ${M('(u_{n})')} et ${M('(v_{n})')} ? Exprimer ${M('u_{n}')} et ${M('v_{n}')} en fonction de ${M('n')}.`, a: `${M('(u_{n})')} est arithmétique de raison ${M(add0)} : ${M(`u_{n}=${C0}+${add0}n`)}. ${M('(v_{n})')} est géométrique de raison ${M(numTex(q))} : ${M(`v_{n}=${C0}\\times ${numTex(q)}^{n}`)}.` },
          { w: 2, q: `À l’aide de la calculatrice, déterminer à partir de combien d’années le placement B devient plus intéressant que le placement A.`, a: `${M(`u_{${N - 1}}=${u(N - 1)}`)} et ${M(`v_{${N - 1}}\\approx ${roundTex(v(N - 1), 2)}`)} ; ${M(`u_{${N}}=${u(N)}`)} et ${M(`v_{${N}}\\approx ${roundTex(v(N), 2)}`)} : le placement B est plus intéressant à partir de ${M(N)} ans.` },
        ],
        ok: () => v(N) > u(N) && v(N - 1) <= u(N - 1) && near(v(2), val(mul(mul(F(C0), q), q))) && Math.abs(v(N) - u(N)) > 0.005 && Math.abs(v(N - 1) - u(N - 1)) > 0.005 };
    } },
  { id: 'g-pre-boite', cls: 'premiere', chapters: ['premiere-06'], domain: 'analyse', level: 2, minutes: 25, title: 'Une boîte de volume maximal',
    make(r) {
      const L = 6 * r.int(2, 16), mat = r.pick(['carton', 'métal', 'papier cartonné']), V = (x) => x * (L - 2 * x) ** 2, x0 = L / 6, Vmax = V(x0);   // L multiple of 6: integer optimum
      return { intro: `Dans une plaque carrée de ${mat} de ${L} cm de côté, on découpe aux quatre coins un carré de côté ${M('x')} cm, puis on relève les bords pour former une boîte sans couvercle. On note ${M('V(x)')} son volume en cm³.`,
        parts: [
          { w: 1, q: `Justifier que ${M('x')} appartient à ${M(`\\left]0\\,;\\,${L / 2}\\right[`)} et que ${M(`V(x)=x(${L}-2x)^{2}`)}.`, a: `Il faut ${M('x>0')} et ${M(`${L}-2x>0`)}, soit ${M(`x<${L / 2}`)}. Le fond est un carré de côté ${M(`${L}-2x`)} et la hauteur vaut ${M('x')}.` },
          { w: 1, q: `Développer ${M('V(x)')}.`, a: M(`V(x)=${polyTex([4, -4 * L, L * L, 0])}`) },
          { w: 2, q: `Calculer ${M("V'(x)")} et vérifier que ${M(`V'(x)=(2x-${L})(6x-${L})`)}.`, a: M(`V'(x)=${polyTex([12, -8 * L, L * L])}=(2x-${L})(6x-${L})`) },
          { w: 2, q: `Étudier le signe de ${M("V'(x)")} sur ${M(`\\left]0\\,;\\,${L / 2}\\right[`)} et en déduire la valeur de ${M('x')} qui rend le volume maximal, ainsi que ce volume.`, a: `${M(`2x-${L}<0`)} sur l’intervalle ; ${M(`6x-${L}`)} s’annule en ${M(x0)}. ${M("V'")} est positive sur ${M(`\\left]0\\,;\\,${x0}\\right]`)} et négative sur ${M(`\\left[${x0}\\,;\\,${L / 2}\\right[`)} : le volume est maximal pour ${M(`x=${x0}`)}, et vaut ${M(`V(${x0})=${Vmax}`)} cm³.` },
        ],
        ok: () => { const d = (x) => (V(x + 1e-6) - V(x - 1e-6)) / 2e-6; return [1, 2.5, L / 3].every((x) => near(V(x), 4 * x ** 3 - 4 * L * x * x + L * L * x)) && near(d(1.3), (2 * 1.3 - L) * (6 * 1.3 - L), 1e-4) && d(x0 - 0.1) > 0 && d(x0 + 0.1) < 0 && Number.isInteger(Vmax) && Vmax === 2 * L ** 3 / 27; } };
    } },
  { id: 'g-sec-parallelogramme', cls: 'seconde', chapters: ['seconde-02', 'seconde-12'], domain: 'geometrie', level: 2, minutes: 20, title: 'Parallélogramme ou rectangle ?',
    make(r) {
      const A = [r.int(-5, 3), r.int(-5, 3)]; let p, q; do { p = r.int(-4, 5); q = r.int(-4, 5); } while (p === 0 && q === 0);
      const rect = r.next() < 0.5, k = r.pick([1, 2]), dl = rect ? 0 : r.pick([-1, 1]), w = [-k * q + dl * p, k * p + dl * q];   // a component along AB breaks the right angle
      const B = [A[0] + p, A[1] + q], D = [A[0] + w[0], A[1] + w[1]], C = [B[0] + w[0], B[1] + w[1]];
      const I = [F(A[0] + C[0], 2), F(A[1] + C[1], 2)], ac2 = (C[0] - A[0]) ** 2 + (C[1] - A[1]) ** 2, bd2 = (D[0] - B[0]) ** 2 + (D[1] - B[1]) ** 2;
      const pt = (n, P) => `${n}(${P.join('\\,;\\,')})`;
      return { intro: `Dans un repère orthonormé, on considère les points ${M(pt('A', A))}, ${M(pt('B', B))} et ${M(pt('C', C))}.`,
        parts: [
          { w: 1, q: `Calculer les coordonnées du vecteur ${M('\\overrightarrow{AB}')}.`, a: M(`\\overrightarrow{AB}\\begin{pmatrix}${p}\\\\${q}\\end{pmatrix}`) },
          { w: 2, q: `Déterminer les coordonnées du point ${M('D')} tel que ${M('ABCD')} soit un parallélogramme.`, hint: `Écrire l’égalité de vecteurs ${M('\\overrightarrow{DC}=\\overrightarrow{AB}')}, en respectant l’ordre des sommets.`, a: `${M('ABCD')} est un parallélogramme si ${M('\\overrightarrow{DC}=\\overrightarrow{AB}')}, soit ${M(`x_{D}=${C[0]}-${par(p)}=${D[0]}`)} et ${M(`y_{D}=${C[1]}-${par(q)}=${D[1]}`)} : ${M(pt('D', D))}.` },
          { w: 1, q: `Calculer les coordonnées du centre ${M('I')} du parallélogramme.`, a: `${M('I')} est le milieu de ${M('[AC]')} : ${M(`I(${I.map(numTex).join('\\,;\\,')})`)}.` },
          { w: 2, q: `Calculer les longueurs ${M('AC')} et ${M('BD')}. Le parallélogramme ${M('ABCD')} est-il un rectangle ?`, a: `${M(`AC=\\sqrt{${ac2}}${sqrtTex(ac2) === `\\sqrt{${ac2}}` ? '' : `=${sqrtTex(ac2)}`}`)} et ${M(`BD=\\sqrt{${bd2}}${sqrtTex(bd2) === `\\sqrt{${bd2}}` ? '' : `=${sqrtTex(bd2)}`}`)}. ${ac2 === bd2 ? 'Les diagonales ont la même longueur : c’est un rectangle.' : 'Les diagonales n’ont pas la même longueur : ce n’est pas un rectangle.'}` },
        ],
        ok: () => (ac2 === bd2) === rect && D[0] + p === C[0] && D[1] + q === C[1] && eq(add(I[0], I[0]), F(B[0] + D[0])) && (p * w[0] + q * w[1] === 0) === rect };
    } },
  { id: 'g-stmg-loyers', cls: 'stmg', chapters: ['stmg-01'], domain: 'suites', level: 2, minutes: 20, title: 'Deux contrats de location',
    make(r) {
      const L0 = 50 * r.int(7, 18), inc = r.int(5, 30), t = r.pick([2, 3, 4, 5]);
      const u = (n) => L0 + n * inc, v = (n) => L0 * (1 + t / 100) ** n;
      let N = 1; while (v(N) <= u(N)) N++;
      if (N < 3 || N > 25 || v(N) - u(N) < 0.5 || u(N - 1) - v(N - 1) < 0.5) return this.make(r);
      const n10 = 10, Su = 11 * (u(0) + u(10)) / 2, Sv = L0 * ((1 + t / 100) ** 11 - 1) / (t / 100);
      return { intro: `Un loyer mensuel vaut ${L0} € en 2026. Contrat A : il augmente de ${inc} € chaque année. Contrat B : il augmente de ${t} % chaque année. On note ${M('u_{n}')} et ${M('v_{n}')} le loyer mensuel en 2026 + ${M('n')} avec chaque contrat.`,
        parts: [
          { w: 1, q: `Donner la nature des suites ${M('(u_{n})')} et ${M('(v_{n})')}, puis exprimer ${M('u_{n}')} et ${M('v_{n}')} en fonction de ${M('n')}.`, a: `${M('(u_{n})')} est arithmétique de raison ${M(inc)} : ${M(`u_{n}=${L0}+${inc}n`)} ; ${M('(v_{n})')} est géométrique de raison ${M(numTex(F(100 + t, 100)))} : ${M(`v_{n}=${L0}\\times ${numTex(F(100 + t, 100))}^{n}`)}.` },
          { w: 1, q: `Calculer le loyer mensuel en 2036 avec chaque contrat (arrondi au centime).`, a: M(`u_{${n10}}=${u(n10)}\\ \\text{€}\\ ;\\ v_{${n10}}\\approx ${roundTex(v(n10), 2)}\\ \\text{€}`) },
          { w: 2, q: `À partir de quelle année le contrat B devient-il plus cher que le contrat A ?`, a: `À la calculatrice : ${M(`u_{${N - 1}}=${u(N - 1)}`)}, ${M(`v_{${N - 1}}\\approx ${roundTex(v(N - 1), 2)}`)} et ${M(`u_{${N}}=${u(N)}`)}, ${M(`v_{${N}}\\approx ${roundTex(v(N), 2)}`)} : le contrat B est plus cher à partir de ${2026 + N}.` },
          { w: 2, q: `Calculer la somme ${M('u_{0}+u_{1}+\\dots+u_{10}')} et interpréter.`, a: `${M(`u_{0}+\\dots+u_{10}=11\\times\\dfrac{${u(0)}+${u(10)}}{2}=${Su}`)} : avec le contrat A, la somme des loyers mensuels de 2026 à 2036 vaut ${Su} € (un mois par an).` },
        ],
        ok: () => v(N) > u(N) && v(N - 1) <= u(N - 1) && Su === [...Array(11).keys()].reduce((s, n) => s + u(n), 0) && Number.isInteger(Su) && Sv > 0 && Math.abs(v(N) - u(N)) > 0.005 && Math.abs(v(N - 1) - u(N - 1)) > 0.005 };
    } },
];
