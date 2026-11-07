// Seeded problems for Seconde (the online bank and the sheets): multi-part exercises whose numbers come from the seed.
// Same contract as problems.js: make(r) returns {intro, parts: [{w, q, hint?, a}], ok()}; ok() recomputes the quoted results.
// Chapter ids: content/data/manifest.json. Levels: 1 routine, 2 standard, 3 demanding.
import { F, add, sub, mul, div, val, eq, M, fracTex, numTex, roundTex, polyTex, evalPoly, sgn, par, gcd, lcm, isPrime, sqrtTex, sqrtParts, decimals } from './engine.js';
import { pt, vc, setTex, lin, affTex, ivTex, ivHas, E, Einf, dec, normLine, parT } from './seconde-kit.js';

const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
const divisors = (n) => { const d = []; for (let k = 1; k <= n; k++) if (n % k === 0) d.push(k); return d; };
const factor = (n) => { const out = []; for (let p = 2; p * p <= n; p++) while (n % p === 0) { out.push(p); n /= p; } if (n > 1) out.push(n); return out; };
const expo = (n) => { const m = new Map(); factor(n).forEach((p) => m.set(p, (m.get(p) || 0) + 1)); return [...m].map(([p, e]) => (e === 1 ? `${p}` : `${p}^{${e}}`)).join('\\times '); };
const list = (l) => l.join('\\ ;\\ ');
const P = (r, lo = -6, hi = 6) => [r.int(lo, hi), r.int(lo, hi)];
const C = 'seconde';
// k(v - a) written for a determinant: fac(-1, 'x', 0) = '-x', fac(3, 'y', -2) = '3(y+2)'
const fac = (k, v, a) => `${k === 1 ? '' : k === -1 ? '-' : k}${a === 0 ? v : `(${v}${sgn(-a)})`}`;
// minus k(v - a), as the second term of a determinant
const minusFac = (k, v, a) => (k === 1 ? `-${fac(1, v, a)}` : k === -1 ? `+${fac(1, v, a)}` : `-${par(k)}${a === 0 ? v : `(${v}${sgn(-a)})`}`);
const decomp = (n) => (isPrime(n) ? `${n}` : `${n}=${expo(n)}`);
// m x + p with decimal coefficients (prices)
const affDec = (m, p) => `${eq(m, F(1)) ? '' : numTex(m)}x${p.n === 0 ? '' : p.n < 0 ? `-${numTex(F(-p.n, p.d))}` : `+${numTex(p)}`}`;
const p10 = (k) => (k === 1 ? '10' : `10^{${k}}`);

export const problemsSeconde = [
  // ================= 01 Arithmétique =================
  { id: 'g-sec-diviseurs', cls: C, chapters: ['seconde-01'], domain: 'nombres', level: 1, minutes: 15, title: 'Diviseurs, multiples, nombres premiers',
    make(r) {
      let n; do { n = r.int(24, 150); } while (divisors(n).length < 6);
      const d = divisors(n), p = r.pick(d.filter((x) => x > 2 && x < n)); let q; do { q = r.int(4, 13); } while (n % q === 0);
      const k = Math.floor(n / q), m = r.int(2, 20);
      return { intro: `On considère l’entier ${M(`n=${n}`)}.`,
        parts: [
          { w: 2, q: `Lister tous les diviseurs positifs de ${M('n')}.`, hint: `Chercher les diviseurs par paires : si ${M('d')} divise ${M('n')}, alors ${M('\\dfrac{n}{d}')} aussi. On peut s’arrêter quand ${M('d\\times d>n')}.`, a: `${M(`${n}=${d.filter((x) => x * x <= n).map((x) => `${x}\\times ${n / x}`).join('=')}`)}, donc les diviseurs sont ${M(list(d))}.` },
          { w: 1, q: `${M('n')} est-il un multiple de ${M(p)} ? de ${M(q)} ? Justifier.`, a: `Oui pour ${M(p)} : ${M(`${n}=${p}\\times ${n / p}`)}. Non pour ${M(q)} : ${M(`${q}\\times ${k}=${q * k}`)} et ${M(`${q}\\times ${k + 1}=${q * (k + 1)}`)}, donc ${M(n)} est strictement compris entre deux multiples consécutifs de ${M(q)}.` },
          { w: 2, q: `Sans calculer la somme, montrer que ${M(`${n}+${p}\\times ${m}`)} est un multiple de ${M(p)}.`, hint: `Écrire chacun des deux termes sous la forme ${M(`${p}\\times(\\ldots)`)}.`, a: `${M(`${n}+${p}\\times ${m}=${p}\\times ${n / p}+${p}\\times ${m}=${p}\\times(${n / p}+${m})=${p}\\times ${n / p + m}`)} : c’est un multiple de ${M(p)} (la somme de deux multiples de ${M(p)} en est un).` },
          { w: 1, q: `Décomposer ${M('n')} en produit de facteurs premiers.`, a: M(`${n}=${expo(n)}`) },
        ],
        ok: () => d.every((x) => n % x === 0) && d.length === divisors(n).length && n % p === 0 && n % q !== 0 && q * k < n && n < q * (k + 1) && (n + p * m) % p === 0 && factor(n).reduce((a, b) => a * b, 1) === n };
    } },
  { id: 'g-sec-carrelage', cls: C, chapters: ['seconde-01'], domain: 'nombres', level: 2, minutes: 20, title: 'Carreler une pièce sans découpe',
    make(r) {
      let g, m, n; do { g = r.pick([12, 15, 18, 20, 24, 25, 30, 36, 40, 45, 48, 50, 60]); m = r.int(2, 11); n = r.int(2, 11); } while (m >= n || gcd(m, n) !== 1);
      const a = g * m, b = g * n, small = r.pick(divisors(g).filter((x) => x < g && x >= 3));
      return { intro: `On veut carreler une pièce rectangulaire de ${M(`${a}\\ \\text{cm}`)} sur ${M(`${b}\\ \\text{cm}`)} avec des carreaux carrés identiques, sans aucune découpe. Le côté d’un carreau est un nombre entier de centimètres.`,
        parts: [
          { w: 1, q: `Décomposer ${M(a)} et ${M(b)} en produits de facteurs premiers.`, a: `${M(`${a}=${expo(a)}`)} et ${M(`${b}=${expo(b)}`)}.` },
          { w: 2, q: `Expliquer pourquoi le côté d’un carreau doit être un diviseur commun de ${M(a)} et ${M(b)}. En déduire le plus grand côté possible.`, hint: 'Le long de chaque mur, on aligne un nombre entier de carreaux.', a: `Il faut un nombre entier de carreaux le long de chaque côté, donc le côté divise ${M(a)} et ${M(b)}. Le plus grand est ${M(`\\text{PGCD}(${a},${b})=${g}`)} : on prend les facteurs premiers communs avec le plus petit exposant.` },
          { w: 1, q: 'Combien de carreaux faut-il alors ?', a: `${M(`\\dfrac{${a}}{${g}}=${m}`)} carreaux sur la largeur et ${M(`\\dfrac{${b}}{${g}}=${n}`)} sur la longueur : ${M(`${m}\\times ${n}=${m * n}`)} carreaux.` },
          { w: 2, q: `Combien en faudrait-il avec des carreaux de ${M(`${small}\\ \\text{cm}`)} de côté ? Ce choix est-il possible ?`, a: `${M(small)} divise ${M(g)}, donc ${M(a)} et ${M(b)} : c’est possible, avec ${M(`${a / small}\\times ${b / small}=${(a / small) * (b / small)}`)} carreaux.` },
          { w: 1, q: `Rendre irréductible la fraction ${M(`\\dfrac{${a}}{${b}}`)}.`, a: `On divise par le PGCD : ${M(`\\dfrac{${a}}{${b}}=\\dfrac{${m}}{${n}}`)}.` },
        ],
        ok: () => gcd(a, b) === g && a % small === 0 && b % small === 0 && factor(a).reduce((x, y) => x * y, 1) === a && gcd(m, n) === 1 };
    } },
  { id: 'g-sec-fractions-premiers', cls: C, chapters: ['seconde-01', 'seconde-04'], domain: 'nombres', level: 2, minutes: 15, title: 'Fractions, décompositions et décimaux',
    make(r) {
      const base = r.pick([2, 3, 5, 6, 7, 10, 12, 14, 15]), b = base * r.pick([2, 4, 3, 5, 6]), d = base * r.pick([7, 9, 2, 5, 8, 3]);
      if (b === d) return this.make(r);
      let a; do { a = r.int(2, 3 * b); } while (gcd(a, b) === 1 || a % b === 0);
      const c = r.int(1, 2 * d), A = F(a, b), S = add(A, F(c, d)), L = lcm(b, d), isDec = decimals(S) >= 0;
      return { intro: `On pose ${M(`A=\\dfrac{${a}}{${b}}`)} et ${M(`B=\\dfrac{${c}}{${d}}`)}.`,
        parts: [
          { w: 1, q: `Décomposer ${M(b)} et ${M(d)} en produits de facteurs premiers.`, a: `${M(decomp(b))} et ${M(decomp(d))}.` },
          { w: 1, q: `Écrire ${M('A')} sous forme irréductible.`, a: `${M(`\\text{PGCD}(${a},${b})=${gcd(a, b)}`)}, donc ${M(`A=${fracTex(A)}`)}.` },
          { w: 2, q: `Calculer ${M('A+B')} en utilisant le plus petit dénominateur commun à ${M(b)} et ${M(d)}.`, hint: 'Le plus petit dénominateur commun contient chaque facteur premier avec le plus grand exposant rencontré.', a: `Le plus petit dénominateur commun est ${M(`${L}=${expo(L)}`)} ; ${M(`A+B=\\dfrac{${a * (L / b)}}{${L}}+\\dfrac{${c * (L / d)}}{${L}}=\\dfrac{${a * (L / b) + c * (L / d)}}{${L}}${S.d === L ? '' : `=${fracTex(S)}`}`)}.` },
          { w: 2, q: `Le nombre ${M('A+B')} est-il décimal ? Justifier.`, hint: 'Une fraction irréductible est décimale exactement quand son dénominateur n’a pas d’autre facteur premier que 2 et 5.', a: S.d === 1 ? `Oui, c’est même un entier : ${M(`A+B=${S.n}`)}.` : isDec ? `Oui : le dénominateur ${M(decomp(S.d))} ne contient que les facteurs ${M(2)} et ${M(5)}, et ${M(`A+B=${numTex(S)}`)}.` : `Non : sous forme irréductible, le dénominateur ${M(decomp(S.d))} contient un facteur premier autre que ${M(2)} et ${M(5)}.` },
        ],
        ok: () => near(val(S), a / b + c / d) && L % b === 0 && L % d === 0 && gcd(A.n, A.d) === 1 && isDec === [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].some((e) => (S.n * 10 ** e) % S.d === 0) };
    } },
  { id: 'g-sec-diviseurs-communs', cls: C, chapters: ['seconde-01'], domain: 'nombres', level: 3, minutes: 20, title: 'Diviseurs communs et produit cartésien',
    make(r) {
      let m, n; do { m = r.pick([12, 18, 20, 24, 28, 30, 36, 40, 42, 45, 48]); n = r.pick([8, 12, 15, 16, 18, 20, 27, 30, 32, 36, 54]); } while (m === n || gcd(m, n) < 2);
      const A = divisors(m), B = divisors(n), I = A.filter((x) => B.includes(x)), g = gcd(m, n);
      return { intro: `On note ${M('A')} l’ensemble des diviseurs positifs de ${M(m)} et ${M('B')} celui des diviseurs positifs de ${M(n)}.`,
        parts: [
          { w: 1, q: `Écrire ${M('A')} et ${M('B')} en extension.`, a: `${M(`A=${setTex(A)}`)} et ${M(`B=${setTex(B)}`)}.` },
          { w: 1, q: `Déterminer ${M('A\\cap B')}. Que représente son plus grand élément ?`, a: `${M(`A\\cap B=${setTex(I)}`)} : ce sont les diviseurs communs ; le plus grand, ${M(g)}, est ${M(`\\text{PGCD}(${m},${n})`)}.` },
          { w: 2, q: `Vérifier que ${M('A\\cap B')} est exactement l’ensemble des diviseurs de ${M(g)}.`, hint: 'Lister les diviseurs de ce PGCD et comparer.', a: `Les diviseurs de ${M(g)} sont ${M(setTex(divisors(g)))} : c’est bien ${M('A\\cap B')}. (Tout diviseur commun divise le PGCD.)` },
          { w: 2, q: `Combien d’éléments contient ${M('A\\times B')} ? Combien de couples ${M('(a\\,;\\,b)')} de ${M('A\\times B')} vérifient ${M('a=b')} ?`, hint: 'Un couple (a ; a) n’est possible que si a appartient aux deux ensembles.', a: `${M(`\\text{Card}(A\\times B)=${A.length}\\times ${B.length}=${A.length * B.length}`)}. Les couples ${M('(a\\,;\\,a)')} correspondent aux éléments de ${M('A\\cap B')} : il y en a ${M(I.length)}.` },
        ],
        ok: () => I.length === divisors(g).length && I.every((x, i) => x === divisors(g)[i]) && Math.max(...I) === g };
    } },

  // ================= 02 Vecteurs =================
  { id: 'g-sec-translation', cls: C, chapters: ['seconde-02'], domain: 'geometrie', level: 1, minutes: 15, title: 'Translation et règle du parallélogramme',
    make(r) {
      let A, B, Cc; do { A = P(r); B = P(r); Cc = P(r); } while ((B[0] - A[0]) * (Cc[1] - A[1]) - (B[1] - A[1]) * (Cc[0] - A[0]) === 0);
      const u = [B[0] - A[0], B[1] - A[1]], w = [Cc[0] - A[0], Cc[1] - A[1]], D = [Cc[0] + u[0], Cc[1] + u[1]], Ee = [A[0] + u[0] + w[0], A[1] + u[1] + w[1]];
      return { intro: `Dans un repère, on donne ${M(`A${pt(...A)}`)}, ${M(`B${pt(...B)}`)} et ${M(`C${pt(...Cc)}`)}.`,
        parts: [
          { w: 1, q: `Calculer les coordonnées de ${M('\\overrightarrow{AB}')} et de ${M('\\overrightarrow{AC}')}.`, a: `${M(`\\overrightarrow{AB}${vc(...u)}`)} et ${M(`\\overrightarrow{AC}${vc(...w)}`)}.` },
          { w: 2, q: `Déterminer les coordonnées du point ${M('D')}, image de ${M('C')} par la translation de vecteur ${M('\\overrightarrow{AB}')}.`, hint: `L’image ${M('D')} vérifie ${M('\\overrightarrow{CD}=\\overrightarrow{AB}')}.`, a: `${M('\\overrightarrow{CD}=\\overrightarrow{AB}')} donne ${M(`x_D=${Cc[0]}${sgn(u[0])}=${D[0]}`)} et ${M(`y_D=${Cc[1]}${sgn(u[1])}=${D[1]}`)} : ${M(`D${pt(...D)}`)}. Le quadrilatère ${M('ABDC')} est un parallélogramme.` },
          { w: 1, q: `Calculer les coordonnées du vecteur ${M('\\overrightarrow{AB}+\\overrightarrow{AC}')}.`, a: M(`\\overrightarrow{AB}+\\overrightarrow{AC}${vc(u[0] + w[0], u[1] + w[1])}`) },
          { w: 2, q: `Déterminer le point ${M('E')} tel que ${M('\\overrightarrow{AE}=\\overrightarrow{AB}+\\overrightarrow{AC}')}. Comparer avec ${M('D')} et expliquer.`, a: `${M(`E${pt(...Ee)}`)} : c’est le point ${M('D')}. D’après la règle du parallélogramme, ${M('\\overrightarrow{AD}=\\overrightarrow{AB}+\\overrightarrow{AC}')} car ${M('ABDC')} est un parallélogramme.` },
        ],
        ok: () => Ee[0] === D[0] && Ee[1] === D[1] && D[0] - Cc[0] === u[0] && D[1] - Cc[1] === u[1] };
    } },
  { id: 'g-sec-milieu-symetrique', cls: C, chapters: ['seconde-02'], domain: 'geometrie', level: 2, minutes: 15, title: 'Milieu, symétrique et distances',
    make(r) {
      let A, B; do { A = P(r); B = P(r); } while (A[0] === B[0] && A[1] === B[1]);
      const I = [F(A[0] + B[0], 2), F(A[1] + B[1], 2)], S = [2 * B[0] - A[0], 2 * B[1] - A[1]], ab2 = (B[0] - A[0]) ** 2 + (B[1] - A[1]) ** 2, as2 = (S[0] - A[0]) ** 2 + (S[1] - A[1]) ** 2;
      const IA = [sub(F(A[0]), I[0]), sub(F(A[1]), I[1])], IB = [sub(F(B[0]), I[0]), sub(F(B[1]), I[1])];
      return { intro: `Dans un repère orthonormé, on donne ${M(`A${pt(...A)}`)} et ${M(`B${pt(...B)}`)}.`,
        parts: [
          { w: 1, q: `Calculer les coordonnées du milieu ${M('I')} de ${M('[AB]')}.`, a: M(`I\\left(\\dfrac{${A[0]}+${par(B[0])}}{2}\\,;\\,\\dfrac{${A[1]}+${par(B[1])}}{2}\\right)=\\left(${numTex(I[0])}\\,;\\,${numTex(I[1])}\\right)`) },
          { w: 2, q: `Vérifier par le calcul que ${M('\\overrightarrow{IA}+\\overrightarrow{IB}=\\vec{0}')}.`, a: `${M(`\\overrightarrow{IA}${vc(numTex(IA[0]), numTex(IA[1]))}`)} et ${M(`\\overrightarrow{IB}${vc(numTex(IB[0]), numTex(IB[1]))}`)} : les coordonnées sont opposées, la somme est nulle.` },
          { w: 2, q: `Déterminer les coordonnées du point ${M('C')}, symétrique de ${M('A')} par rapport à ${M('B')}.`, hint: `${M('B')} est le milieu de ${M('[AC]')} : écrire ${M('x_B=\\dfrac{x_A+x_C}{2}')}.`, a: `${M('x_C=2x_B-x_A')} et ${M('y_C=2y_B-y_A')} : ${M(`C${pt(...S)}`)}.` },
          { w: 2, q: `Calculer ${M('AB')} et ${M('AC')}. Quelle relation retrouve-t-on ?`, a: `${M(`AB=\\sqrt{${ab2}}${sqrtTex(ab2) === `\\sqrt{${ab2}}` ? '' : `=${sqrtTex(ab2)}`}`)} et ${M(`AC=\\sqrt{${as2}}=${sqrtTex(as2)}`)} : ${M('AC=2AB')}, ce qui traduit ${M('\\overrightarrow{AC}=2\\overrightarrow{AB}')}.` },
        ],
        ok: () => eq(add(IA[0], IB[0]), F(0)) && eq(add(IA[1], IB[1]), F(0)) && as2 === 4 * ab2 && S[0] + A[0] === 2 * B[0] };
    } },
  { id: 'g-sec-alignement-parametre', cls: C, chapters: ['seconde-02', 'seconde-12'], domain: 'geometrie', level: 3, minutes: 20, title: 'Alignement et parallélisme avec un paramètre',
    make(r) {
      let A, B; do { A = P(r, -5, 5); B = P(r, -5, 5); } while (A[0] === B[0] || A[1] === B[1]);
      const u = [B[0] - A[0], B[1] - A[1]], c = r.int(-8, 8);
      // C(m ; c) aligned with A, B: u0 (c - yA) - u1 (m - xA) = 0
      const m = add(F(A[0]), F(u[0] * (c - A[1]), u[1])), k = div(sub(m, F(A[0])), F(u[0]));
      const Q = P(r, -6, 6), xd = Q[0] + r.nz(-5, 5), yd = add(F(Q[1]), mul(F(u[1], u[0]), F(xd - Q[0])));
      const lin1 = `${u[0]}\\times ${parT(c - A[1])}-${par(u[1])}(m${sgn(-A[0])})`.replace('(m+0)', 'm').replace('(m-0)', 'm');
      return { intro: `Dans un repère, on donne ${M(`A${pt(...A)}`)}, ${M(`B${pt(...B)}`)} et, pour un réel ${M('m')}, le point ${M(`C(m\\,;\\,${c})`)}.`,
        parts: [
          { w: 2, q: `Exprimer ${M('\\det(\\overrightarrow{AB},\\overrightarrow{AC})')} en fonction de ${M('m')}.`, hint: `${M('\\overrightarrow{AC}')} a pour coordonnées ${M(`(m-x_A\\,;\\,${c}-y_A)`)}.`, a: `${M(`\\overrightarrow{AB}${vc(...u)}`)}, ${M(`\\overrightarrow{AC}${vc(A[0] === 0 ? 'm' : `m${sgn(-A[0])}`, c - A[1])}`)} et ${M(`\\det(\\overrightarrow{AB},\\overrightarrow{AC})=${lin1}`)}.` },
          { w: 2, q: `Pour quelle valeur de ${M('m')} les points ${M('A')}, ${M('B')} et ${M('C')} sont-ils alignés ?`, a: `Le déterminant est nul pour ${M(`m=${fracTex(m)}`)}.` },
          { w: 1, q: `Pour cette valeur, trouver le réel ${M('k')} tel que ${M('\\overrightarrow{AC}=k\\overrightarrow{AB}')}.`, a: `${M(`k=\\dfrac{x_C-x_A}{x_B-x_A}=${fracTex(k)}`)} ; on vérifie que ${M(`${fracTex(k)}\\times ${par(u[1])}=${c - A[1]}`)}.` },
          { w: 2, q: `On donne ${M(`Q${pt(...Q)}`)}. Déterminer le réel ${M('y')} tel que la droite passant par ${M('Q')} et ${M(`R(${xd}\\,;\\,y)`)} soit parallèle à ${M('(AB)')}.`, hint: 'Deux droites sont parallèles quand le déterminant de leurs vecteurs directeurs est nul.', a: `${M(`\\det(\\overrightarrow{AB},\\overrightarrow{QR})=${fac(u[0], 'y', Q[1])}-${par(u[1])}\\times ${par(xd - Q[0])}=0`)}, donc ${M(`y=${fracTex(yd)}`)}.` },
        ],
        ok: () => eq(sub(mul(F(u[0]), F(c - A[1])), mul(F(u[1]), sub(m, F(A[0])))), F(0)) && eq(mul(k, F(u[1])), F(c - A[1])) && eq(sub(mul(F(u[0]), sub(yd, F(Q[1]))), F(u[1] * (xd - Q[0]))), F(0)) };
    } },

  // ================= 03 Droites =================
  { id: 'g-sec-droite-deux-points', cls: C, chapters: ['seconde-03'], domain: 'geometrie', level: 1, minutes: 15, title: 'Équation réduite d’une droite',
    make(r) {
      let A, B; do { A = P(r, -6, 6); B = P(r, -6, 6); } while (A[0] === B[0] || A[1] === B[1]);
      const m = F(B[1] - A[1], B[0] - A[0]), p = sub(F(A[1]), mul(m, F(A[0]))), xc = r.int(-6, 6), on = r.next() < 0.5, yc = add(add(mul(m, F(xc)), p), on ? F(0) : F(r.pick([-1, 1]))), x0 = div(mul(p, F(-1)), m);
      return { intro: `Dans un repère, on donne ${M(`A${pt(...A)}`)} et ${M(`B${pt(...B)}`)}.`,
        parts: [
          { w: 1, q: `Calculer la pente ${M('m')} de la droite ${M('(AB)')}.`, a: M(`m=\\dfrac{y_B-y_A}{x_B-x_A}=\\dfrac{${B[1]}-${par(A[1])}}{${B[0]}-${par(A[0])}}=${fracTex(m)}`) },
          { w: 2, q: `En déduire l’équation réduite de ${M('(AB)')}.`, hint: `Écrire ${M('y_A=mx_A+p')} pour trouver ${M('p')}.`, a: `${M(`${A[1]}=${fracTex(m)}\\times ${par(A[0])}+p`)} donne ${M(`p=${fracTex(p)}`)} : ${M(`(AB):\\ y=${affTex(m, p)}`)}.` },
          { w: 1, q: `Le point ${M(`C(${xc}\\,;\\,${numTex(yc)})`)} appartient-il à ${M('(AB)')} ?`, a: `${M(`${fracTex(m)}\\times ${par(xc)}${p.n < 0 ? '-' : '+'}${fracTex(F(Math.abs(p.n), p.d))}=${numTex(add(mul(m, F(xc)), p))}`)} : ${on ? 'oui, C appartient à la droite.' : `c’est différent de ${M(numTex(yc))}, donc non.`}`.replace('+0=', '=').replace('-0=', '=') },
          { w: 2, q: 'Déterminer les coordonnées des points d’intersection de la droite avec les deux axes.', a: `Avec l’axe des ordonnées : ${M(`(0\\,;\\,${fracTex(p)})`)}. Avec l’axe des abscisses : ${M(`${affTex(m, p)}=0`)} donne ${M(`x=${fracTex(x0)}`)}, soit ${M(`(${fracTex(x0)}\\,;\\,0)`)}.` },
        ],
        ok: () => eq(add(mul(m, F(B[0])), p), F(B[1])) && eq(add(mul(m, x0), p), F(0)) && on === eq(add(mul(m, F(xc)), p), yc) };
    } },
  { id: 'g-sec-droite-cartesienne', cls: C, chapters: ['seconde-03'], domain: 'geometrie', level: 2, minutes: 20, title: 'Équation cartésienne, vecteur directeur, parallèle',
    make(r) {
      const A = P(r); let u; do { u = [r.nz(-5, 5), r.int(-5, 5)]; } while (!u[1] || gcd(u[0], u[1]) !== 1);
      const [a, b, c] = normLine(u[1], -u[0], -u[1] * A[0] + u[0] * A[1]), m = F(-a, b), p = F(-c, b);
      const xb = A[0] + 2 * u[0], yb = A[1] + 2 * u[1], Q = P(r), cq = -a * Q[0] - b * Q[1];
      return { intro: `Dans un repère, ${M('d')} est la droite passant par ${M(`A${pt(...A)}`)} et dirigée par ${M(`\\vec{u}${vc(...u)}`)}.`,
        parts: [
          { w: 2, q: `Déterminer une équation cartésienne de ${M('d')}.`, hint: `${M('M(x\\,;\\,y)')} appartient à ${M('d')} si et seulement si ${M('\\overrightarrow{AM}')} et ${M('\\vec{u}')} sont colinéaires.`, a: `${M(`\\det(\\overrightarrow{AM},\\vec{u})=${fac(u[1], 'x', A[0])}${minusFac(u[0], 'y', A[1])}=0`)}, soit ${M(`${lin([[a, 'x'], [b, 'y'], [c, '']])}=0`)} (toute équation proportionnelle convient).` },
          { w: 1, q: `En déduire l’équation réduite de ${M('d')} et sa pente.`, a: `${M(`y=${affTex(m, p)}`)} ; pente ${M(fracTex(m))}, qui est aussi ${M(`\\dfrac{${u[1]}}{${u[0]}}`)}.` },
          { w: 1, q: `Le point ${M(`B(${xb}\\,;\\,${yb})`)} appartient-il à ${M('d')} ? Justifier de deux façons.`, a: `${M(`${a}\\times ${parT(xb)}${b < 0 ? '-' : '+'}${Math.abs(b)}\\times ${parT(yb)}${c === 0 ? '' : (c < 0 ? '-' : '+') + Math.abs(c)}=0`)} : oui. Autre justification : ${M('\\overrightarrow{AB}=2\\vec{u}')}, donc ${M('B')} est sur la droite passant par ${M('A')} dirigée par ${M('\\vec{u}')}.`.replace(/^\\\(\\times /, '\\(').replace('(-\\times ', '(-') },
          { w: 2, q: `Déterminer une équation cartésienne de la parallèle ${M("d'")} à ${M('d')} passant par ${M(`Q${pt(...Q)}`)}.`, a: `${M("d'")} a le même vecteur directeur, donc une équation ${M(`${lin([[a, 'x'], [b, 'y']])}+c'=0`)} ; ${M('Q')} donne ${M(`c'=${cq}`)} : ${M(`${lin([[a, 'x'], [b, 'y'], [cq, '']])}=0`)}.` },
        ],
        ok: () => a * A[0] + b * A[1] + c === 0 && a * u[0] + b * u[1] === 0 && a * xb + b * yb + c === 0 && a * Q[0] + b * Q[1] + cq === 0 && eq(mul(m, F(u[0])), F(u[1])) };
    } },
  { id: 'g-sec-intersection-systeme', cls: C, chapters: ['seconde-03', 'seconde-12'], domain: 'geometrie', level: 2, minutes: 15, title: 'Intersection de deux droites et système',
    make(r) {
      const x0 = r.int(-6, 6), y0 = r.int(-6, 6); let a1, b1, m2; do { a1 = r.nz(-5, 5); b1 = r.nz(-5, 5); m2 = r.nz(-4, 4); } while (F(-a1, b1).n * 1 === m2 * F(-a1, b1).d);
      const c1 = a1 * x0 + b1 * y0, p2 = y0 - m2 * x0, m1 = F(-a1, b1);
      return { intro: `On considère les droites ${M(`d_1:\\ ${lin([[a1, 'x'], [b1, 'y']])}=${c1}`)} et ${M(`d_2:\\ y=${polyTex([m2, p2])}`)}.`,
        parts: [
          { w: 1, q: `Déterminer la pente de ${M('d_1')}. Les droites sont-elles sécantes ?`, a: `${M(`y=${affTex(m1, F(c1, b1))}`)} : pente ${M(fracTex(m1))}, différente de ${M(m2)}, donc les droites sont sécantes.` },
          { w: 2, q: `Résoudre le système formé par les deux équations.`, hint: `Remplacer ${M('y')} par ${M(polyTex([m2, p2]))} dans l’équation de ${M('d_1')}.`, a: `${M(`${a1 === 1 ? '' : a1 === -1 ? '-' : a1}x${b1 < 0 ? '-' : '+'}${Math.abs(b1) === 1 ? '' : Math.abs(b1)}(${polyTex([m2, p2])})=${c1}`)} donne ${M(`x=${x0}`)}, puis ${M(`y=${y0}`)} : ${M(`S=\\{(${x0}\\,;\\,${y0})\\}`)}.` },
          { w: 1, q: 'Interpréter graphiquement et vérifier.', a: `Le point ${M(`(${x0}\\,;\\,${y0})`)} est le point d’intersection : ${M(`${a1}\\times ${par(x0)}${b1 < 0 ? '-' : '+'}${Math.abs(b1)}\\times ${par(y0)}=${c1}`)} et ${M(`${m2}\\times ${par(x0)}${sgn(p2)}=${y0}`)}.`.replace('+0=', '=').replace('-0=', '=') },
        ],
        ok: () => a1 * x0 + b1 * y0 === c1 && m2 * x0 + p2 === y0 && !eq(m1, F(m2)) };
    } },
  { id: 'g-sec-taxis', cls: C, chapters: ['seconde-03', 'seconde-08'], domain: 'fonctions', level: 3, minutes: 25, title: 'Deux compagnies de taxi',
    make(r) {
      const tA = F(r.int(10, 18), 10), pA = r.int(2, 5), tB = add(tA, F(r.int(2, 6), 10)), d0 = r.int(4, 20), pB = add(F(pA), mul(sub(tA, tB), F(d0)));
      if (val(pB) < 1) return this.make(r);
      const f = (x) => pA + val(tA) * x, g = (x) => val(pB) + val(tB) * x, near5 = r.int(1, d0 - 1), far = d0 + r.int(2, 10);
      return { intro: `Deux compagnies de taxi facturent un trajet de ${M('x')} kilomètres ainsi. Compagnie A : ${M(`${pA}\\ \\text{€}`)} de prise en charge puis ${M(`${numTex(tA)}\\ \\text{€}`)} par kilomètre. Compagnie B : ${M(`${numTex(pB)}\\ \\text{€}`)} de prise en charge puis ${M(`${numTex(tB)}\\ \\text{€}`)} par kilomètre.`,
        parts: [
          { w: 1, q: `Exprimer les prix ${M('f(x)')} et ${M('g(x)')} des compagnies A et B.`, a: M(`f(x)=${affDec(tA, F(pA))}\\ \\text{ et }\\ g(x)=${affDec(tB, pB)}`) },
          { w: 1, q: 'Dans un repère, ces prix sont représentés par deux droites. Que représentent leurs pentes et leurs ordonnées à l’origine ?', a: `Les pentes ${M(numTex(tA))} et ${M(numTex(tB))} sont les prix au kilomètre ; les ordonnées à l’origine ${M(pA)} et ${M(numTex(pB))} sont les prises en charge. Les pentes sont différentes : les droites sont sécantes.` },
          { w: 2, q: 'Déterminer les coordonnées du point d’intersection des deux droites et interpréter.', hint: `Résoudre ${M('f(x)=g(x)')}.`, a: `${M(`${affDec(tA, F(pA))}=${affDec(tB, pB)}\\iff ${numTex(sub(tB, tA))}x=${numTex(sub(F(pA), pB))}\\iff x=${d0}`)} ; ${M(`f(${d0})=${numTex(add(F(pA), mul(tA, F(d0))))}`)}. Pour ${M(`${d0}\\ \\text{km}`)}, les deux compagnies coûtent ${M(`${numTex(add(F(pA), mul(tA, F(d0))))}\\ \\text{€}`)}.` },
          { w: 2, q: `Résoudre ${M('f(x)<g(x)')}. Quelle compagnie choisir pour ${M(`${near5}\\ \\text{km}`)} ? pour ${M(`${far}\\ \\text{km}`)} ?`, a: `${M(`f(x)<g(x)\\iff ${numTex(sub(tB, tA))}x>${numTex(sub(F(pA), pB))}\\iff x>${d0}`)} : A est moins chère au-delà de ${M(`${d0}\\ \\text{km}`)}. Pour ${M(`${near5}\\ \\text{km}`)} on choisit B, pour ${M(`${far}\\ \\text{km}`)} on choisit A.` },
        ],
        ok: () => near(f(d0), g(d0)) && f(far) < g(far) && f(near5) > g(near5) };
    } },

  // ================= 04 Réels et intervalles =================
  { id: 'g-sec-intervalles', cls: C, chapters: ['seconde-04'], domain: 'nombres', level: 1, minutes: 12, title: 'Intervalles, intersection et réunion',
    make(r) {
      const a = r.int(-9, 2), b = a + r.int(3, 9), c = r.int(a + 1, b - 1), lc = r.next() < 0.5;
      const I = [{ lo: E(a), hi: E(b), lc: true, hc: false }], J = [{ lo: E(c), hi: Einf, lc: lc, hc: false }];
      const inter = [{ lo: E(c), hi: E(b), lc, hc: false }], uni = [{ lo: E(a), hi: Einf, lc: true, hc: false }], k = r.pick([c, b, a, c - 1, b - 1]);
      const inI = ivHas(inter, k);
      return { intro: `On note ${M('I')} l’ensemble des réels ${M('x')} tels que ${M(`${a}\\leqslant x<${b}`)} et ${M('J')} l’ensemble des réels ${M('x')} tels que ${M(`x${lc ? '\\geqslant ' : '>'}${c}`)}.`,
        parts: [
          { w: 1, q: `Écrire ${M('I')} et ${M('J')} sous forme d’intervalles.`, a: `${M(`I=${ivTex(I)}`)} et ${M(`J=${ivTex(J)}`)}.` },
          { w: 1, q: `Déterminer ${M('I\\cap J')}.`, hint: 'Placer les deux intervalles sur une même droite graduée et repérer la partie commune.', a: M(`I\\cap J=${ivTex(inter)}`) },
          { w: 1, q: `Déterminer ${M('I\\cup J')}.`, a: M(`I\\cup J=${ivTex(uni)}`) },
          { w: 1, q: `Le nombre ${M(k)} appartient-il à ${M('I\\cap J')} ?`, a: inI ? `Oui : ${M(`${a}\\leqslant ${k}<${b}`)} et ${M(`${k}${lc ? '\\geqslant ' : '>'}${c}`)}.` : `Non : ${M(k)} ne vérifie pas les deux conditions à la fois.` },
        ],
        ok: () => [a - 1, a, c - 0.5, c, b - 0.1, b, b + 3].every((x) => (ivHas(I, x) && ivHas(J, x)) === ivHas(inter, x) && (ivHas(I, x) || ivHas(J, x)) === ivHas(uni, x)) && inI === (k >= a && k < b && (lc ? k >= c : k > c)) };
    } },
  { id: 'g-sec-valeur-absolue', cls: C, chapters: ['seconde-04'], domain: 'nombres', level: 2, minutes: 15, title: 'Valeur absolue et distance',
    make(r) {
      const a = r.int(-9, 9), rr = r.int(1, 8), u = r.int(-20, 20), v = r.int(-20, 20), p = r.int(-12, 4), q = p + 2 * r.int(1, 8), cc = (p + q) / 2, rad = (q - p) / 2;
      const xa = a === 0 ? 'x' : `x${sgn(-a)}`, xc = cc === 0 ? 'x' : `x${sgn(-cc)}`;
      return { intro: `On rappelle que la distance entre deux réels ${M('u')} et ${M('v')} est ${M('|u-v|')}. Dans les questions 2 et 3, on pose ${M(`a=${a}`)} et ${M(`r=${rr}`)}.`,
        parts: [
          { w: 1, q: `Calculer la distance entre ${M(u)} et ${M(v)}.`, a: M(`|${u}-${par(v)}|=|${u - v}|=${Math.abs(u - v)}`) },
          { w: 2, q: `Résoudre ${M(`|${xa}|\\leqslant ${rr}`)} et donner l’ensemble des solutions sous forme d’intervalle.`, hint: `${M(`|${xa}|`)} est la distance entre ${M('x')} et ${M(a)}.`, a: `Les réels à distance au plus ${M(rr)} de ${M(a)} : ${M(`S=[${a - rr}\\,;\\,${a + rr}]`)}.` },
          { w: 2, q: `Résoudre ${M(`|${xa}|>${rr}`)}.`, a: `C’est le complémentaire du cas précédent, bornes exclues : ${M(`S=]-\\infty\\,;\\,${a - rr}[\\cup]${a + rr}\\,;\\,+\\infty[`)}.` },
          { w: 2, q: `Traduire ${M(`x\\in[${p}\\,;\\,${q}]`)} par une inégalité de la forme ${M('|x-c|\\leqslant \\rho')}.`, hint: 'Le centre est le milieu de l’intervalle, le rayon sa demi-longueur.', a: `Centre ${M(`c=\\dfrac{${p}+${par(q)}}{2}=${cc}`)}, rayon ${M(`\\rho=\\dfrac{${q}-${par(p)}}{2}=${rad}`)} : ${M(`|${xc}|\\leqslant ${rad}`)}.` },
        ],
        ok: () => [a - rr, a + rr, a, a - rr - 0.5].every((x) => (Math.abs(x - a) <= rr) === (x >= a - rr && x <= a + rr)) && cc - rad === p && cc + rad === q };
    } },
  { id: 'g-sec-encadrements', cls: C, chapters: ['seconde-04'], domain: 'nombres', level: 1, minutes: 12, title: 'Encadrements et arrondis',
    make(r) {
      let a, b; do { b = r.pick([3, 6, 7, 9, 11, 12, 13]); a = r.int(b + 1, 9 * b); } while (decimals(F(a, b)) >= 0);
      let n; do { n = r.int(5, 120); } while (Number.isInteger(Math.sqrt(n)));
      const lo = Math.floor((100 * a) / b), rd = 2 * (100 * a - lo * b) < b ? lo : lo + 1, s = Math.floor(Math.sqrt(n)), x = a / b, y = Math.sqrt(n);
      const fx = (k) => (k / 100).toFixed(2).replace('.', '{,}');
      return { intro: `On considère les nombres ${M(`x=\\dfrac{${a}}{${b}}`)} et ${M(`y=\\sqrt{${n}}`)}.`,
        parts: [
          { w: 1, q: `Donner un encadrement de ${M('x')} d’amplitude ${M('10^{-2}')}, puis sa valeur approchée par défaut et par excès à ${M('10^{-2}')} près.`, a: `${M(`${fx(lo)}<x<${fx(lo + 1)}`)} : par défaut ${M(fx(lo))}, par excès ${M(fx(lo + 1))}.` },
          { w: 1, q: `Donner l’arrondi de ${M('x')} au centième.`, a: `${M(`x\\approx ${fx(rd)}`)} (le chiffre des millièmes de ${M('x')} est ${(Math.floor((1000 * a) / b) % 10)}).` },
          { w: 2, q: `Encadrer ${M('y')} entre deux entiers consécutifs sans calculatrice.`, hint: 'Chercher les deux carrés parfaits consécutifs qui encadrent le nombre sous la racine.', a: `${M(`${s * s}<${n}<${(s + 1) ** 2}`)} et la racine carrée est croissante : ${M(`${s}<y<${s + 1}`)}.` },
          { w: 1, q: `Comparer ${M('x')} et ${M('y')}.`, a: x < y ? (Math.floor(x) < s || (lo + 1) / 100 <= s ? `${M(`x<${fx(lo + 1)}\\leqslant ${s}<y`)}, donc ${M('x<y')}.` : `À la calculatrice, ${M(`y\\approx ${roundTex(y, 3)}`)}, donc ${M('x<y')}.`) : (lo / 100 >= s + 1 ? `${M(`y<${s + 1}\\leqslant ${fx(lo)}<x`)}, donc ${M('y<x')}.` : `À la calculatrice, ${M(`y\\approx ${roundTex(y, 3)}`)}, donc ${M('y<x')}.`) },
        ],
        ok: () => lo / 100 < x && x < (lo + 1) / 100 && Math.abs(x - rd / 100) < 0.005 && s < y && y < s + 1 && Math.abs(x - y) > 1e-6 };
    } },
  { id: 'g-sec-encadrer-expression', cls: C, chapters: ['seconde-04', 'seconde-08'], domain: 'nombres', level: 3, minutes: 20, title: 'Encadrer une somme, une différence, un produit',
    make(r) {
      const a = r.int(1, 5), b = a + r.int(1, 4), c = -r.int(1, 5), d = r.int(1, 6), k = r.int(2, 4), l = r.int(2, 4);
      return { intro: `On sait que ${M(`${a}\\leqslant x\\leqslant ${b}`)} et ${M(`${c}\\leqslant y\\leqslant ${d}`)}.`,
        parts: [
          { w: 1, q: `Encadrer ${M('x+y')}.`, a: `On additionne membre à membre deux inégalités de même sens : ${M(`${a + c}\\leqslant x+y\\leqslant ${b + d}`)}.` },
          { w: 2, q: `Encadrer ${M('x-y')}.`, hint: `On ne soustrait pas des inégalités : encadrer d’abord ${M('-y')}, en multipliant par ${M('-1')}.`, a: `${M(`-${d}\\leqslant -y\\leqslant ${-c}`)}, puis ${M(`${a - d}\\leqslant x-y\\leqslant ${b - c}`)}.` },
          { w: 2, q: `Encadrer ${M(`${k}x-${l}y`)}.`, a: `${M(`${k * a}\\leqslant ${k}x\\leqslant ${k * b}`)} et ${M(`${-l * d}\\leqslant -${l}y\\leqslant ${-l * c}`)}, donc ${M(`${k * a - l * d}\\leqslant ${k}x-${l}y\\leqslant ${k * b - l * c}`)}.` },
          { w: 2, q: `Un élève affirme : « on a donc ${M(`${a * c}\\leqslant xy\\leqslant ${b * d}`)} ». Vrai ou faux ?`, hint: 'Essayer les valeurs extrêmes, en particulier une valeur négative de y.', a: `Faux : pour ${M(`x=${b}`)} et ${M(`y=${c}`)}, ${M(`xy=${b * c}<${a * c}`)}. On ne multiplie membre à membre que des inégalités entre nombres positifs.` },
        ],
        ok: () => { const xs = [a, b, (a + b) / 2], ys = [c, d, 0]; return xs.every((x) => ys.every((y) => x + y >= a + c && x + y <= b + d && x - y >= a - d && x - y <= b - c && k * x - l * y >= k * a - l * d && k * x - l * y <= k * b - l * c)) && b * c < a * c; } };
    } },

  // ================= 05 Bilan de trimestre =================
  { id: 'g-sec-bilan-calcul', cls: C, chapters: ['seconde-05', 'seconde-01'], domain: 'nombres', level: 1, minutes: 15, title: 'Bilan : fractions, puissances, écriture scientifique',
    make(r) {
      let b, d, a, c; do { b = r.int(2, 9); d = r.int(2, 9); a = r.int(1, 9); c = r.int(1, 9); } while (b === d || a % b === 0 || c % d === 0);
      const e = r.int(1, 9), f = r.int(2, 9), S = add(F(a, b), F(c, d)), Q = div(F(a, b), F(e, f));
      const ex = () => { let k; do { k = r.int(-6, 9); } while (k === 0 || k === 1); return k; }, m = ex(), n = ex(), p = ex(), pw = m + n - p, A = r.int(2, 9), B = r.int(2, 9), ex1 = r.int(2, 7), ex2 = r.int(-9, -2);
      const prod = A * B, sciM = prod >= 10 ? `${String(prod)[0]}${prod % 10 ? `{,}${prod % 10}` : ''}` : `${prod}`, sciE = ex1 + ex2 + (prod >= 10 ? 1 : 0);
      return { intro: `Calculs à mener sans calculatrice, en détaillant, avec ${M(`A=\\dfrac{${a}}{${b}}`)}.`,
        parts: [
          { w: 1, q: `Calculer ${M(`A+\\dfrac{${c}}{${d}}`)} et donner le résultat sous forme irréductible.`, a: M(`\\dfrac{${a * d}+${c * b}}{${b * d}}=${fracTex(S)}`) },
          { w: 1, q: `Calculer ${M(`A\\div\\dfrac{${e}}{${f}}`)}.`, hint: 'Diviser par une fraction non nulle, c’est multiplier par son inverse.', a: M(`\\dfrac{${a}}{${b}}\\times\\dfrac{${f}}{${e}}=${fracTex(Q)}`) },
          { w: 1, q: `Écrire sous la forme d’une seule puissance de ${M(10)} : ${M(`\\dfrac{${p10(m)}\\times ${p10(n)}}{${p10(p)}}`)}.`, a: M(`10^{${m}+${par(n)}-${par(p)}}=${p10(pw)}`) },
          { w: 2, q: `Donner l’écriture scientifique de ${M(`(${A}\\times ${p10(ex1)})\\times(${B}\\times ${p10(ex2)})`)}.`, a: M(`${prod}${ex1 + ex2 === 0 ? '' : `\\times ${p10(ex1 + ex2)}`}=${sciM}\\times ${p10(sciE)}`) },
        ],
        ok: () => near(val(S), a / b + c / d) && near(val(Q), (a * f) / (b * e)) && pw === m + n - p && near(prod * 10 ** (ex1 + ex2), Number(sciM.replace('{,}', '.')) * 10 ** sciE) };
    } },
  { id: 'g-sec-bilan-triangle', cls: C, chapters: ['seconde-05', 'seconde-02', 'seconde-03'], domain: 'geometrie', level: 2, minutes: 20, title: 'Bilan : un triangle dans un repère',
    make(r) {
      let A, B, Cc, I; do { A = P(r, -6, 6); B = P(r, -6, 6); Cc = P(r, -6, 6); I = [F(B[0] + Cc[0], 2), F(B[1] + Cc[1], 2)]; } while ((B[0] - A[0]) * (Cc[1] - A[1]) - (B[1] - A[1]) * (Cc[0] - A[0]) === 0 || eq(I[0], F(A[0])));
      const d = (B[0] - A[0]) * (Cc[1] - A[1]) - (B[1] - A[1]) * (Cc[0] - A[0]), m = div(sub(I[1], F(A[1])), sub(I[0], F(A[0]))), p = sub(F(A[1]), mul(m, F(A[0])));
      const ab = (B[0] - A[0]) ** 2 + (B[1] - A[1]) ** 2, ac = (Cc[0] - A[0]) ** 2 + (Cc[1] - A[1]) ** 2;
      return { intro: `Dans un repère orthonormé, on donne ${M(`A${pt(...A)}`)}, ${M(`B${pt(...B)}`)} et ${M(`C${pt(...Cc)}`)}.`,
        parts: [
          { w: 1, q: `Montrer que ${M('A')}, ${M('B')} et ${M('C')} ne sont pas alignés.`, a: `${M(`\\det(\\overrightarrow{AB},\\overrightarrow{AC})=${d}\\neq 0`)} : les vecteurs ne sont pas colinéaires, les points ne sont pas alignés.` },
          { w: 1, q: `Calculer les coordonnées du milieu ${M('I')} de ${M('[BC]')}.`, a: M(`I\\left(${numTex(I[0])}\\,;\\,${numTex(I[1])}\\right)`) },
          { w: 2, q: `Déterminer l’équation réduite de la médiane ${M('(AI)')}.`, hint: `Calculer la pente à partir des coordonnées de ${M('A')} et de ${M('I')}, puis utiliser ${M('A')}.`, a: `Pente ${M(`\\dfrac{y_I-y_A}{x_I-x_A}=${fracTex(m)}`)} ; ${M(`(AI):\\ y=${affTex(m, p)}`)}.` },
          { w: 2, q: `Le triangle ${M('ABC')} est-il isocèle en ${M('A')} ?`, a: `${M(`AB^{2}=${ab}`)} et ${M(`AC^{2}=${ac}`)} : ${ab === ac ? 'AB = AC, il est isocèle en A.' : 'les longueurs AB et AC sont différentes, il n’est pas isocèle en A.'}` },
        ],
        ok: () => d !== 0 && eq(add(mul(m, F(A[0])), p), F(A[1])) && eq(add(mul(m, I[0]), p), I[1]) };
    } },
  { id: 'g-sec-bilan-arith-reels', cls: C, chapters: ['seconde-05', 'seconde-01', 'seconde-04'], domain: 'nombres', level: 3, minutes: 20, title: 'Bilan : diviseurs, carrés et ensembles de nombres',
    make(r) {
      let es, N; do { es = [r.int(1, 5), r.int(0, 4), r.int(0, 2)]; N = 2 ** es[0] * 3 ** es[1] * 5 ** es[2]; } while (es[0] + es[1] + es[2] < 3 || N > 20000);
      const ps = [2, 3, 5].filter((_, i) => es[i] > 0), ex = es.filter((e) => e > 0), nd = ex.reduce((t, e) => t * (e + 1), 1), lo = r.int(2, 20), hi = lo + r.int(10, 40), inside = divisors(N).filter((x) => x >= lo && x <= hi);
      const pw = (p, e) => (e === 1 ? `${p}` : `${p}^{${e}}`), dec = ps.map((p, i) => pw(p, ex[i])).join('\\times '), sq = ex.every((e) => e % 2 === 0), k = ps.reduce((t, p, i) => t * (ex[i] % 2 ? p : 1), 1);
      const gen = ps.map((p, i) => `${p}^{${'abc'[i]}}`).join('\\times '), ranges = ps.map((p, i) => M(`0\\leqslant ${'abc'[i]}\\leqslant ${ex[i]}`)).join(', ');
      return { intro: `On pose ${M(`N=${dec}`)}, soit ${M(`N=${N}`)}.`,
        parts: [
          { w: 2, q: `Combien ${M('N')} a-t-il de diviseurs positifs ? Justifier.`, hint: `Un diviseur s’écrit ${M(gen)} : compter les choix possibles de chaque exposant.`, a: `Par unicité de la décomposition, un diviseur est ${M(gen)} avec ${ranges} : ${M(`${ex.map((e) => e + 1).join('\\times ')}=${nd}`)} diviseurs.` },
          { w: 1, q: `Lister les diviseurs de ${M('N')} appartenant à l’intervalle ${M(`[${lo}\\,;\\,${hi}]`)}.`, a: inside.length ? M(list(inside)) : 'Aucun.' },
          { w: 2, q: `${M('\\sqrt{N}')} est-il un entier ? À quel plus petit ensemble de nombres appartient-il ?`, a: sq ? `Oui : tous les exposants sont pairs, ${M(`\\sqrt{N}=${ps.map((p, i) => pw(p, ex[i] / 2)).join('\\times ')}=${Math.sqrt(N)}`)}, donc ${M('\\sqrt{N}\\in\\mathbb{N}')}.` : `Non : un exposant est impair, ${M('N')} n’est pas un carré parfait, donc ${M('\\sqrt{N}')} est irrationnel : ${M('\\sqrt{N}\\in\\mathbb{R}')} mais ${M('\\sqrt{N}\\notin\\mathbb{Q}')}.` },
          { w: 2, q: `Quel est le plus petit entier ${M('k\\geqslant 1')} tel que ${M('kN')} soit un carré parfait ?`, hint: 'Un carré parfait a tous ses exposants pairs dans sa décomposition.', a: k === 1 ? `${M('k=1')} : ${M('N')} est déjà un carré parfait.` : `Il faut rendre pairs les exposants impairs : ${M(`k=${k}`)}, et ${M(`${k}N=${k * N}=${Math.sqrt(k * N)}^{2}`)}.` },
        ],
        ok: () => divisors(N).length === nd && Number.isInteger(Math.sqrt(N)) === sq && Number.isInteger(Math.sqrt(k * N)) && [...Array(k - 1).keys()].every((j) => !Number.isInteger(Math.sqrt((j + 1) * N))) };
    } },
  { id: 'g-sec-programme-calcul', cls: C, chapters: ['seconde-05', 'seconde-08'], domain: 'algebre', level: 2, minutes: 15, title: 'Bilan : un programme de calcul',
    make(r) {
      const a = r.int(2, 9), b = r.nz(-9, 9), x1 = r.int(-5, 5), x2 = r.int(6, 12), f = (x) => (x + a) ** 2 - x * x + b, R = 2 * a * r.int(-6, 9) + a * a + b, xR = F(R - a * a - b, 2 * a), z = F(-a * a - b, 2 * a);
      const prog = `choisir un nombre ; lui ajouter ${M(a)} ; élever le résultat au carré ; soustraire le carré du nombre de départ ; ${b > 0 ? `ajouter ${M(b)}` : `soustraire ${M(-b)}`}`;
      return { intro: `Programme de calcul : ${prog}.`,
        parts: [
          { w: 1, q: `Quel résultat obtient-on en choisissant ${M(x1)} ? puis ${M(x2)} ?`, a: `${M(`(${x1}+${a})^{2}-${par(x1)}^{2}${sgn(b)}=${f(x1)}`)} et ${M(`(${x2}+${a})^{2}-${x2}^{2}${sgn(b)}=${f(x2)}`)}.` },
          { w: 2, q: `Montrer que, pour un nombre de départ ${M('x')}, le résultat est ${M(polyTex([2 * a, a * a + b]))}.`, hint: `Développer ${M(`(x+${a})^{2}`)} avec une identité remarquable.`, a: M(`(x+${a})^{2}-x^{2}${sgn(b)}=x^{2}+${2 * a}x+${a * a}-x^{2}${sgn(b)}=${polyTex([2 * a, a * a + b])}`) },
          { w: 2, q: `Quel nombre faut-il choisir pour obtenir ${M(R)} ?`, a: `${M(`${polyTex([2 * a, a * a + b])}=${R}\\iff x=${fracTex(xR)}`)}.` },
          { w: 1, q: `Peut-on obtenir ${M(0)} ? Si oui, avec quel nombre ?`, a: `Oui : ${M(`${polyTex([2 * a, a * a + b])}=0\\iff x=${fracTex(z)}`)}.` },
        ],
        ok: () => [x1, x2, -2, 0].every((x) => f(x) === 2 * a * x + a * a + b) && near(f(val(xR)), R) && near(f(val(z)), 0) };
    } },
];
