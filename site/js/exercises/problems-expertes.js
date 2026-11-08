// Seeded multi-part problems for Maths expertes (complexes, équations, congruences, Bézout, matrices, Markov): the numbers come from the seed, the
// correction is written with them, and ok() recomputes every quoted result another way. Same contract as problems.js: make(r) returns
// {intro, parts: [{w, q, hint, a}], ok()}.
import { F, add, sub, mul, div, val, eq, M, fracTex, numTex, sgn, par, gcd } from './engine.js';
import { cx, cxF, cmul, cadd, csub, conj, abs2, cdiv, ceq, mat, matF, mmul, mmulF, mF, meqF, madd, mpow, det2, egcd, modPow, posMod, solveF } from './expertes-kit.js';
import { tidyProblems } from './terminale-kit.js';

const C = 'expertes';
const d2 = (P, Q) => (Q[0] - P[0]) ** 2 + (Q[1] - P[1]) ** 2;
const quad = (b, c, z) => cadd(cadd(cmul(z, z), cmul([b, 0], z)), [c, 0]);

export const problemsExpertes = tidyProblems([
  { id: 'g-exp-triangle', cls: C, chapters: ['expertes-02', 'expertes-05'], domain: 'complexes', level: 3, minutes: 30, title: 'Un triangle dans le plan complexe',
    make(r) {
      const A = [r.int(-4, 3), r.int(-4, 3)], v = [r.nz(-3, 3), r.nz(-3, 3)], k = r.pick([1, 2]), B = [A[0] + v[0], A[1] + v[1]], Cc = [A[0] - k * v[1], A[1] + k * v[0]], Q = cdiv(csub(Cc, A), csub(B, A)), rot = cadd(A, cmul([0, 1], csub(B, A))), D = csub(cadd(B, Cc), A);
      return { intro: `Dans le plan complexe, on considère les points ${M('A')}, ${M('B')} et ${M('C')} d’affixes ${M(`a=${cx(...A)}`)}, ${M(`b=${cx(...B)}`)} et ${M(`c=${cx(...Cc)}`)}.`,
        parts: [
          { w: 1, q: `Calculer le quotient ${M('\\dfrac{c-a}{b-a}')} et le mettre sous forme algébrique.`, hint: 'Multiplier par le conjugué du dénominateur.', a: `${M(`\\dfrac{c-a}{b-a}=\\dfrac{${cx(...csub(Cc, A))}}{${cx(...csub(B, A))}}=${cxF(...Q)}`)}.` },
          { w: 2, q: 'En déduire la nature du triangle ' + M('ABC') + '.', hint: 'Le module est ' + M('AC/AB') + ' et l’argument est une mesure de ' + M('(\\overrightarrow{AB},\\overrightarrow{AC})') + '.', a: `Le quotient vaut ${M(cxF(...Q))} : ${k === 1 ? `de module ${M(1)} et d’argument ${M('\\dfrac{\\pi}{2}')}` : `imaginaire pur de module ${M(k)}`}. Donc ${M('ABC')} est rectangle en ${M('A')}${k === 1 ? ' et isocèle (' + M('AC=AB') + ')' : ' avec ' + M(`AC=${k}\\,AB`)}.` },
          { w: 1, q: `Déterminer l’affixe du point ${M('D')} tel que ${M('ABDC')} soit un parallélogramme.`, a: `${M('d=b+c-a')}, soit ${M(`d=${cx(...D)}`)}. Comme ${M('ABC')} est rectangle en ${M('A')}, ${M('ABDC')} est un rectangle${k === 1 ? ' (un carré)' : ''}.` },
          { w: 2, q: `Soit ${M('R')} la rotation de centre ${M('A')} et d’angle ${M('\\dfrac{\\pi}{2}')}. Déterminer l’affixe de l’image de ${M('B')}.`, hint: M('z\'-a=i(z-a)') + '.', a: `${M(`b'=a+i(b-a)=${cx(...A)}+i(${cx(...csub(B, A))})=${cx(...rot)}`)}${ceq(rot, Cc) ? ' : c’est le point ' + M('C') + '.' : '.'}` },
        ],
        ok: () => d2(A, B) * k * k === d2(A, Cc) && (B[0] - A[0]) * (Cc[0] - A[0]) + (B[1] - A[1]) * (Cc[1] - A[1]) === 0 && ceq(csub(B, A), csub(D, Cc)) && ceq(rot, k === 1 ? Cc : rot) && abs2(csub(rot, A)) === abs2(csub(B, A)) && Q[0].n === 0 && val(Q[1]) === k };
    } },

  { id: 'g-exp-cubique', cls: C, chapters: ['expertes-04', 'expertes-03'], domain: 'complexes', level: 3, minutes: 30, title: 'Une équation du troisième degré',
    make(r) {
      const rt = r.nz(-3, 3), p = r.int(-2, 3), q = r.int(1, 3), s1 = -2 * p, s2 = p * p + q * q, co = [1, s1 - rt, s2 - rt * s1, -rt * s2], P = (z) => co.reduce((acc, k) => cadd(cmul(acc, z), [k, 0]), [0, 0]);
      const poly = `z^{3}${co[1] === 0 ? '' : (co[1] < 0 ? '-' : '+') + (Math.abs(co[1]) === 1 ? '' : Math.abs(co[1])) + 'z^{2}'}${co[2] === 0 ? '' : (co[2] < 0 ? '-' : '+') + (Math.abs(co[2]) === 1 ? '' : Math.abs(co[2])) + 'z'}${co[3] === 0 ? '' : sgn(co[3])}`;
      return { intro: `On considère le polynôme ${M(`P(z)=${poly}`)}.`,
        parts: [
          { w: 1, q: `Vérifier que ${M(rt)} est racine de ${M('P')}.`, a: `${M(`P(${rt})=${co[0] * rt ** 3}${sgn(co[1] * rt ** 2)}${sgn(co[2] * rt)}${sgn(co[3])}=0`)}.` },
          { w: 2, q: `Déterminer deux réels ${M('a')} et ${M('b')} tels que ${M(`P(z)=(z${sgn(-rt)})(z^{2}+az+b)`)}.`, hint: 'Développer le produit et identifier les coefficients.', a: `${M(`a=${s1}`)} et ${M(`b=${s2}`)} : ${M(`P(z)=(z${sgn(-rt)})(z^{2}${s1 === 0 ? '' : sgn(s1) + 'z'}${sgn(s2)})`)}.` },
          { w: 2, q: `Résoudre ${M('P(z)=0')} dans ${M('\\mathbb{C}')}.`, a: `${M(`z^{2}${s1 === 0 ? '' : sgn(s1) + 'z'}${sgn(s2)}=0`)} a pour discriminant ${M(`${-4 * q * q}`)} et pour solutions ${M(`${cx(p, q)}`)} et ${M(`${cx(p, -q)}`)}. ${M(`S=\\{${rt}\\,;\\,${cx(p, q)}\\,;\\,${cx(p, -q)}\\}`)}.` },
          { w: 1, q: 'Calculer le module des deux solutions non réelles.', a: `${M(`|${cx(p, q)}|=\\sqrt{${p * p + q * q}}`)} pour les deux (elles sont conjuguées).` },
        ],
        ok: () => ceq(P([rt, 0]), [0, 0]) && ceq(P([p, q]), [0, 0]) && ceq(P([p, -q]), [0, 0]) && co[1] === s1 - rt && abs2([p, q]) === s2 };
    } },

  { id: 'g-exp-congruences', cls: C, chapters: ['expertes-06', 'expertes-08'], domain: 'arithmetique', level: 3, minutes: 30, title: 'Restes et petit théorème de Fermat',
    make(r) {
      const m = r.pick([5, 7, 11, 13]), a = r.int(2, m - 1), n = (m - 1) * r.int(3, 10) + r.int(1, m - 2), k = r.int(2, 5), tab = Array.from({ length: m }, (_, x) => (x * x) % m);
      return { intro: `Dans cet exercice, ${M(m)} est un nombre premier, ${M(`a=${a}`)} un entier et ${M(`n=${n}`)}.`,
        parts: [
          { w: 1, q: `Dresser le tableau des restes de ${M('n^{2}')} modulo ${M(m)} pour ${M(`n\\equiv 0,\\dots,${m - 1}`)}.`, a: `${M(`\\begin{array}{c|${'c'.repeat(m)}}n&${Array.from({ length: m }, (_, x) => x).join('&')}\\\\\\hline n^{2}&${tab.join('&')}\\end{array}`)}.` },
          { w: 2, q: `Déterminer les entiers ${M('n')} tels que ${M(`n^{2}\\equiv ${tab[k % m]}\\ [${m}]`)}.`, a: `D’après le tableau : ${M(`n\\equiv ${[...Array(m).keys()].filter((x) => tab[x] === tab[k % m]).join(`\\ [${m}]`)}\\ [${m}]`)}.` },
          { w: 2, q: `Énoncer le petit théorème de Fermat et en déduire le reste de ${M(`${a}^{${n}}`)} dans la division par ${M(m)}.`, hint: 'Écrire ' + M(n) + ' = ' + (m - 1) + 'q + s.', a: `Si ${M(m)} est premier et ne divise pas ${M('a')}, ${M(`a^{${m - 1}}\\equiv 1\\ [${m}]`)}. Ici ${M(`${n}=${m - 1}\\times ${Math.floor(n / (m - 1))}+${n % (m - 1)}`)} donc ${M(`${a}^{${n}}\\equiv ${a}^{${n % (m - 1)}}\\equiv ${modPow(a, n, m)}\\ [${m}]`)}.`.replace('^{1}', '') },
        ],
        ok: () => modPow(a, n, m) === ((x) => { let p = 1; for (let i = 0; i < n; i++) p = (p * a) % m; return p; })() && tab.every((v, x) => v === (x * x) % m) && n % (m - 1) !== 0 && modPow(a, m - 1, m) === 1 };
    } },

  { id: 'g-exp-engrenages', cls: C, chapters: ['expertes-07'], domain: 'arithmetique', level: 3, minutes: 30, title: 'Pièces de deux tailles',
    make(r) {
      const a = r.pick([7, 9, 11, 13, 15, 17]), b = r.pick([4, 5, 8, 10, 12]), g = gcd(a, b);
      if (g !== 1) return this.make(r);
      const c = r.int(40, 200), [dd, u, v] = egcd(a, b), x0 = u * c, y0 = v * c, sols = []; for (let t = -200; t <= 200; t++) { const x = x0 + b * t, y = y0 - a * t; if (x >= 0 && y >= 0) sols.push([x, y]); }
      const inv = (() => { for (let w = 1; w < b; w++) if ((a * w) % b === 1) return w; return null; })();
      return { intro: `Un atelier fabrique des plaques de ${M(a)} cm et de ${M(b)} cm. On veut obtenir exactement ${M(`${c}\\ \\text{cm}`)} en alignant ${M('x')} plaques de ${M(a)} cm et ${M('y')} plaques de ${M(b)} cm (${M('x')} et ${M('y')} entiers naturels).`,
        parts: [
          { w: 1, q: `Écrire l’équation et justifier qu’elle admet des solutions entières.`, a: `${M(`${a}x+${b}y=${c}`)}. ${M(`\\text{PGCD}(${a},${b})=1`)} divise ${M(c)} : il existe des solutions (théorème de Bézout).` },
          { w: 2, q: 'Déterminer une relation de Bézout entre ' + M(a) + ' et ' + M(b) + ' puis une solution particulière.', hint: 'Algorithme d’Euclide étendu.', a: `${M(`${a}\\times ${par(u)}+${b}\\times ${par(v)}=1`)} donc ${M(`(x_0,y_0)=(${x0},${y0})`)} convient.` },
          { w: 2, q: `Déterminer toutes les solutions entières puis celles qui conviennent pour l’atelier.`, a: `${M(`(x,y)=(${x0}+${b}t\\,;\\,${y0}-${a}t)`)}, ${M('t\\in\\mathbb{Z}')}. Avec ${M('x\\geqslant 0')} et ${M('y\\geqslant 0')} : ${sols.length ? sols.map(([x, y]) => M(`(${x},${y})`)).join(', ') : 'aucune solution'}.` },
          { w: 1, q: `Quel est l’inverse de ${M(a)} modulo ${M(b)} ?`, a: `${M(`${a}\\times ${inv}\\equiv 1\\ [${b}]`)} : l’inverse est ${M(inv)}.` },
        ],
        ok: () => g === 1 && a * u + b * v === 1 && a * x0 + b * y0 === c && sols.every(([x, y]) => a * x + b * y === c && x >= 0 && y >= 0) && (a * inv) % b === 1 };
    } },

  { id: 'g-exp-matrices', cls: C, chapters: ['expertes-09', 'expertes-11'], domain: 'matrices', level: 3, minutes: 30, title: 'Une matrice et ses puissances',
    make(r) {
      let A; do { A = [[r.int(0, 3), r.int(-2, 3)], [r.int(-2, 3), r.int(0, 3)]]; } while (det2(A) === 0 || Math.abs(det2(A)) > 5);
      const t = A[0][0] + A[1][1], d = det2(A), n = r.int(3, 5), A2 = mmul(A, A), rhs = madd(A.map((row) => row.map((x) => t * x)), [[-d, 0], [0, -d]]), inv = [[F(A[1][1], d), F(-A[0][1], d)], [F(-A[1][0], d), F(A[0][0], d)]];
      return { intro: `On considère la matrice ${M(`A=${mat(A)}`)}.`,
        parts: [
          { w: 1, q: `Calculer ${M('A^{2}')} et ${M('\\det A')}.`, a: `${M(`A^{2}=${mat(A2)}`)} ; ${M(`\\det A=${A[0][0]}\\times ${par(A[1][1])}-${par(A[0][1])}\\times ${par(A[1][0])}=${d}`)}.` },
          { w: 2, q: `Vérifier que ${M(`A^{2}=${t}A${sgn(-d)}I`)}.`, hint: 'Calculer le second membre coefficient par coefficient.', a: `${M(`${t}A${sgn(-d)}I=${mat(rhs)}`)}, égal à ${M('A^{2}')}.` },
          { w: 2, q: `En déduire l’inverse de ${M('A')}.`, a: `${M('\\det A\\neq 0')} donc ${M('A')} est inversible : ${M(`A^{-1}=${matF(inv)}`)}.` },
          { w: 1, q: `Calculer ${M(`A^{${n}}`)} à la calculatrice et vérifier avec la relation ${M('A^{n+1}=A^{n}A')}.`, a: `${M(`A^{${n}}=${mat(mpow(A, n))}`)} et ${M(`A^{${n + 1}}=${mat(mpow(A, n + 1))}`)}.` },
        ],
        ok: () => JSON.stringify(A2) === JSON.stringify(rhs) && meqF(mmulF(mF(A), inv), mF([[1, 0], [0, 1]])) && JSON.stringify(mmul(mpow(A, n), A)) === JSON.stringify(mpow(A, n + 1)) };
    } },

  { id: 'g-exp-operateurs', cls: C, chapters: ['expertes-11'], domain: 'matrices', level: 3, minutes: 30, title: 'Deux opérateurs téléphoniques',
    make(r) {
      const a = r.int(1, 8) * 5, b = r.int(1, 8) * 5, x0 = r.int(1, 9) * 10;
      if (a + b === 100 || a === b) return this.make(r);
      const P = [[F(100 - a, 100), F(a, 100)], [F(b, 100), F(100 - b, 100)]], pi0 = [F(x0, 100), F(100 - x0, 100)], n = r.int(2, 4);
      let st = pi0; for (let i = 0; i < n; i++) st = [add(mul(st[0], P[0][0]), mul(st[1], P[1][0])), add(mul(st[0], P[0][1]), mul(st[1], P[1][1]))];
      const stat = [F(b, a + b), F(a, a + b)];
      return { intro: `Deux opérateurs ${M('X')} et ${M('Y')} se partagent un marché. Chaque année, ${M(`${a}\\,\\%`)} des clients de ${M('X')} passent chez ${M('Y')} et ${M(`${b}\\,\\%`)} des clients de ${M('Y')} passent chez ${M('X')}. Au départ ${M(`${x0}\\,\\%`)} des clients sont chez ${M('X')}. On note ${M('\\pi_n=(x_n\\ \\ y_n)')} la répartition après ${M('n')} années.`,
        parts: [
          { w: 1, q: 'Écrire la matrice de transition ' + M('P') + ' et la relation entre ' + M('\\pi_{n+1}') + ' et ' + M('\\pi_n') + '.', a: `${M(`P=${matF(P)}`)} et ${M('\\pi_{n+1}=\\pi_nP')}.` },
          { w: 2, q: `Calculer la répartition après ${M(n)} années.`, hint: 'Itérer le produit ligne par matrice.', a: `${M(`\\pi_{${n}}=\\left(${numTex(st[0])}\\ \\ ${numTex(st[1])}\\right)`)}.` },
          { w: 2, q: 'Déterminer la répartition stationnaire.', hint: M('\\pi P=\\pi') + ' et ' + M('x+y=1') + '.', a: `${M(`${numTex(F(a, 100))}x=${numTex(F(b, 100))}y`)} avec ${M('x+y=1')} donne ${M(`\\pi=\\left(${fracTex(stat[0])}\\ \\ ${fracTex(stat[1])}\\right)`)}.` },
        ],
        ok: () => { let s = pi0; for (let i = 0; i < n; i++) { const x = add(mul(s[0], P[0][0]), mul(s[1], P[1][0])); s = [x, sub(F(1), x)]; } return eq(s[0], st[0]) && eq(add(mul(stat[0], P[0][0]), mul(stat[1], P[1][0])), stat[0]) && eq(add(stat[0], stat[1]), F(1)); } };
    } },
]);
