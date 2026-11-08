// Seconde generators, fourth file (chapters 01 to 03: arithmétique, vecteurs, droites): four-choice questions (each wrong option comes from a
// typical error), true/false, find-the-error items and a contextual or multi-step generator with seeded parameters. Same contract as
// templates-seconde.js; every ok() recomputes the answer another way. Helpers: premiere-kit.js (tf, spot), seconde-kit-2.js (qcmNum).
import { F, add, sub, mul, div, val, eq, M, fracTex, numTex, polyTex, sgn, par, gcd, lcm, sqrtTex, isPrime } from './engine.js';
import { tf, spot } from './premiere-kit.js';
import { pt, vc, affTex, parT } from './seconde-kit.js';
import { qcmNum } from './seconde-kit-2.js';

const C = 'seconde';
const PAIRS = [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [5, 6], [3, 7], [4, 7], [5, 7], [2, 9], [7, 8], [5, 8]];
const COMPOSITE = [21, 27, 33, 35, 39, 49, 51, 55, 57, 63, 65, 69, 77, 85, 87, 91, 93, 95, 111, 119, 133, 143, 161, 187];
const PRIMES = [23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113];
const smallestFactor = (n) => { for (let q = 2; q * q <= n; q++) if (n % q === 0) return q; return n; };
const countDivisors = (n) => { let c = 0; for (let d = 1; d <= n; d++) if (n % d === 0) c++; return c; };
const lcmBrute = (a, b) => { let m = Math.max(a, b); while (m % a || m % b) m++; return m; };
const noOne = (s) => s.replace(/\^\{1\}/g, '');
const eqLine = (m, p) => `y=${affTex(m, p)}`;
const onLine = (m, p, P) => eq(add(mul(m, F(P[0])), p), F(P[1]));
const rnd = (r, n) => Array.from({ length: n }, () => r.int(-6, 6));

export const seconde4 = [
  // ============================ 01 Arithmétique ============================
  { id: 's4-arith-qcm', cls: C, chapter: 'seconde-01', domain: 'nombres', skill: 'QCM d’arithmétique', fast: true,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['gcd', 'prime'] : level === 2 ? ['gcd', 'div', 'prime'] : ['div', 'prime', 'lcm']);
      if (kind === 'gcd' || kind === 'lcm') {
        const g = r.int(2, level === 1 ? 9 : 15), [p, q] = r.pick(PAIRS), a = g * p, b = g * q, good = kind === 'gcd' ? g : g * p * q;
        const wr = kind === 'gcd'
          ? [[g * p * q, 'donne le plus petit multiple commun au lieu du plus grand diviseur commun.'], [Math.min(a, b), 'prend le plus petit des deux nombres.'], [Math.abs(a - b), 'prend la différence des deux nombres.'], [p * q, 'multiplie les quotients au lieu de chercher le diviseur commun.']]
          : [[g, 'donne le plus grand diviseur commun au lieu du plus petit multiple commun.'], [a * b, 'prend le produit, qui est un multiple commun mais pas le plus petit.'], [a + b, 'additionne les deux nombres.'], [Math.max(a, b), 'prend le plus grand des deux nombres.']];
        return qcmNum(r, kind === 'gcd' ? `Le PGCD de ${M(a)} et ${M(b)} est :` : `Le PPCM de ${M(a)} et ${M(b)} est :`,
          [good, kind === 'gcd' ? `${M(a)} et ${M(b)} se divisent par ${M(g)} et les quotients ${M(p)} et ${M(q)} sont premiers entre eux.` : `${M(`${a}=${g}\\times ${p}`)} et ${M(`${b}=${g}\\times ${q}`)} : le PPCM est ${M(`${g}\\times ${p}\\times ${q}`)}.`], wr, M,
          (v) => (kind === 'gcd' ? gcd(a, b) === v : lcmBrute(a, b) === v));
      }
      if (kind === 'div') {
        const [p, q] = r.pick([[2, 3], [2, 5], [3, 5], [2, 7]]), al = r.int(1, level === 2 ? 3 : 4), be = r.int(1, level === 2 ? 3 : 4), n = p ** al * q ** be, d = (al + 1) * (be + 1);
        return qcmNum(r, `Le nombre ${M(noOne(`${n}=${p}^{${al}}\\times ${q}^{${be}}`))} a exactement … diviseurs positifs :`,
          [d, `les diviseurs sont les ${M(`${p}^{i}\\times ${q}^{j}`)} avec ${M(`0\\leqslant i\\leqslant ${al}`)} et ${M(`0\\leqslant j\\leqslant ${be}`)} : ${M(`(${al}+1)(${be}+1)=${d}`)}.`],
          [[al * be, 'multiplie les exposants sans ajouter 1.'], [al + be + 2, 'additionne les exposants augmentés de 1 au lieu de les multiplier.'], [al + be, 'additionne les exposants.'], [d + 1, 'compte un diviseur de trop.']], M, (v) => countDivisors(n) === v);
      }
      const pr = r.pick(PRIMES), others = r.shuffle(COMPOSITE.filter((c) => level === 1 || c % 2 === 1));
      return qcmNum(r, 'Lequel de ces nombres est premier ?', [pr, `${M(pr)} n’a aucun diviseur premier inférieur ou égal à ${M(Math.floor(Math.sqrt(pr)))} : il n’a que deux diviseurs, ${M(1)} et lui-même.`],
        others.map((c) => [c, `${M(`${c}=${smallestFactor(c)}\\times ${c / smallestFactor(c)}`)} n’est pas premier.`]), M, (v) => isPrime(v));
    } },

  { id: 's4-arith-tf', cls: C, chapter: 'seconde-01', domain: 'nombres', skill: 'Vrai ou faux en arithmétique', fast: false,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['both', 'euler', 'odd'] : ['both', 'euler', 'square', 'odd']);
      if (kind === 'both') {
        const d = r.int(2, 30), e = r.int(2, 30),  v = gcd(d, e) === 1, L = lcm(d, e);
        return tf({ s: `Si un entier est divisible par ${d} et par ${e}, alors il est divisible par ${d * e}.`, v,
          c: () => { let all = true; for (let n = 1; n <= 4 * d * e; n++) if (n % d === 0 && n % e === 0 && n % (d * e) !== 0) all = false; return all === v; },
          j: v ? `${M(d)} et ${M(e)} sont premiers entre eux : un entier divisible par les deux l’est par leur produit.` : `Contre-exemple : ${M(L)} est divisible par ${M(d)} et par ${M(e)} mais pas par ${M(d * e)} (le PGCD de ${M(d)} et ${M(e)} est ${M(gcd(d, e))}, pas ${M(1)}).` });
      }
      if (kind === 'euler') {
        const p = r.pick([5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]);
        return tf({ s: `Pour tout entier naturel ${M('n')}, le nombre ${M(`n^{2}+n+${p}`)} est premier.`, v: false, c: () => { const n = p - 1; return n * n + n + p === p * p && !isPrime(p * p); },
          j: `Contre-exemple : pour ${M(`n=${p - 1}`)}, ${M(`n^{2}+n+${p}=${(p - 1) ** 2}+${p - 1}+${p}=${p * p}=${p}^{2}`)} n’est pas premier.` });
      }
      if (kind === 'square') {
        const m = r.int(2, 90);
        const bad = (() => { for (let n = 1; n <= 2 * m; n++) if ((n * n) % m === 0 && n % m !== 0) return n; return 0; })();
        return tf({ s: `Pour tout entier naturel ${M('n')}, si ${M('n^{2}')} est divisible par ${M(m)}, alors ${M('n')} est divisible par ${M(m)}.`, v: bad === 0,
          c: () => { let holds = true; for (let n = 1; n <= 3 * m; n++) if ((n * n) % m === 0 && n % m !== 0) holds = false; return holds === (bad === 0); },
          j: bad === 0 ? `${M(m)} n’a aucun facteur premier répété : tous les exposants de ${M('n^{2}')} sont pairs, donc chaque facteur premier de ${M(m)} divise ${M('n')}.` : `Contre-exemple : ${M(`n=${bad}`)} donne ${M(`n^{2}=${bad * bad}=${m}\\times ${(bad * bad) / m}`)}, multiple de ${M(m)}, alors que ${M(bad)} n’est pas un multiple de ${M(m)}.` });
      }
      const k = r.int(2, 40);
      return tf({ s: `La somme de ${k} entiers impairs est toujours un nombre pair.`, v: k % 2 === 0,
        c: () => { const odd = Array.from({ length: k }, (_, i) => 2 * i + 1); return (odd.reduce((x, y) => x + y, 0) % 2 === 0) === (k % 2 === 0); },
        j: k % 2 === 0 ? `On regroupe par paires : ${M('(2a+1)+(2b+1)=2(a+b+1)')} est pair, donc la somme de ${M(k)} impairs est paire.` : `Contre-exemple : ${M(`${Array.from({ length: k }, (_, i) => 2 * i + 1).join('+')}=${k * k}`)} est impair.` });
    } },

  { id: 's4-arith-error', cls: C, chapter: 'seconde-01', domain: 'nombres', skill: 'Trouver l’erreur en arithmétique', fast: false,
    make(r, level) {
      if (r.next() < 0.5) {
        const e1 = r.int(1, 4), e2 = r.int(1, 4), f1 = r.int(1, 4), f2 = r.int(1, 4), [pa, pb] = r.pick([[5, 7], [7, 5], [5, 11], [11, 5], [7, 11], [11, 7], [5, 13], [13, 7]]);
        if (e1 === f1 || e2 === f2) return this.make(r, level);
        const a = 2 ** e1 * 3 ** e2 * pa, b = 2 ** f1 * 3 ** f2 * pb, good = 2 ** Math.min(e1, f1) * 3 ** Math.min(e2, f2), wrong = 2 ** Math.max(e1, f1) * 3 ** Math.max(e2, f2);
        return spot(`Un élève calcule le PGCD de ${M(a)} et ${M(b)} par décomposition en facteurs premiers.`,
          [M(noOne(`${a}=2^{${e1}}\\times 3^{${e2}}\\times ${pa}`)), M(noOne(`${b}=2^{${f1}}\\times 3^{${f2}}\\times ${pb}`)), M(noOne(`\\text{PGCD}=2^{${Math.max(e1, f1)}}\\times 3^{${Math.max(e2, f2)}}`)), M(`\\text{PGCD}(${a},${b})=${wrong}`)], 2,
          'pour chaque facteur premier commun il faut garder le plus petit exposant, pas le plus grand (on obtiendrait un multiple commun).',
          M(noOne(`\\text{PGCD}=2^{${Math.min(e1, f1)}}\\times 3^{${Math.min(e2, f2)}}`)), M(`\\text{PGCD}(${a},${b})=${good}`),
          () => gcd(a, b) === good && good !== wrong && a % good === 0 && b % good === 0 && lcm(a, b) % wrong === 0 && !(b % wrong === 0 && a % wrong === 0));
      }
      const sp = [7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43], p1 = r.pick(sp), p2 = r.pick(sp.filter((x) => x >= p1)), n = p1 * p2, f = smallestFactor(n);
      if ((level === 1 && n > 400) || (level > 1 && n < 100)) return this.make(r, level);
      const ds = String(n).split('').map(Number).reduce((x, y) => x + y, 0);
      return spot(`Un élève veut savoir si ${M(n)} est premier.`,
        [`${M(n)} est impair donc non divisible par ${M(2)}`, `la somme de ses chiffres est ${M(ds)}, qui n’est pas un multiple de ${M(3)} : ${M(n)} n’est pas divisible par ${M(3)}`, `${M(n)} ne se termine ni par ${M(0)} ni par ${M(5)} : il n’est pas divisible par ${M(5)}`, `${M(n)} n’est divisible ni par ${M(2)}, ni par ${M(3)}, ni par ${M(5)} : il est premier`], 3,
        `il reste à tester les nombres premiers jusqu’à ${M(Math.floor(Math.sqrt(n)))}, car ${M(`\\sqrt{${n}}\\approx ${Math.sqrt(n).toFixed(1).replace('.', '{,}')}`)}.`,
        `${M(n)} est divisible par ${M(f)}`, `${M(`${n}=${f}\\times ${n / f}`)} n’est pas premier`, () => !isPrime(n) && n % 2 && n % 3 && n % 5 && n % f === 0 && f * f <= n && ds % 3 !== 0);
    } },

  { id: 's4-arith-tiles', cls: C, chapter: 'seconde-01', domain: 'nombres', skill: 'Problème de carrelage et de rencontres', fast: false,
    make(r, level) {
      const g = r.int(3, level === 1 ? 12 : 25), [p, q] = r.pick(PAIRS), a = g * p, b = g * q;
      if (r.next() < 0.5) {
        return { q: `Un sol rectangulaire de ${M(`${a}\\ \\text{dm}`)} sur ${M(`${b}\\ \\text{dm}`)} est recouvert de dalles carrées identiques, sans découpe, de côté entier le plus grand possible. Quel est le côté d’une dalle ? Combien de dalles faut-il ?`,
          a: `Le côté est le PGCD de ${M(a)} et ${M(b)} : ${M(`${g}\\ \\text{dm}`)}. Il faut ${M(`\\dfrac{${a}}{${g}}\\times\\dfrac{${b}}{${g}}=${p}\\times ${q}=${p * q}`)} dalles.`,
          ok: () => { let s = Math.min(a, b); while (a % s || b % s) s--; return s === g && (a / s) * (b / s) === p * q && a * b === p * q * s * s; } };
      }
      const m = lcm(a, b), h = r.int(6, 9), t = h * 60 + m, hh = Math.floor(t / 60) % 24, mi = t % 60;
      return { q: `Deux bus partent ensemble d’une gare à ${M(`${h}\\ \\text{h}`)}. L’un repasse toutes les ${M(a)} minutes, l’autre toutes les ${M(b)} minutes. À quelle heure repartent-ils ensemble pour la première fois après ${M(`${h}\\ \\text{h}`)} ?`,
        a: `Il faut le PPCM de ${M(a)} et ${M(b)} : ${M(`${g}\\times ${p}\\times ${q}=${m}`)} minutes, soit à ${M(`${hh}\\ \\text{h}\\ ${String(mi).padStart(2, '0')}`)}.`,
        ok: () => { let k = 1; while (k % a || k % b) k++; return k === m && (h * 60 + k) % 1440 === hh * 60 + mi; } };
    } },

  // ============================ 02 Vecteurs ============================
  { id: 's4-vec-qcm', cls: C, chapter: 'seconde-02', domain: 'geometrie', skill: 'QCM sur les vecteurs', fast: true,
    make(r, level) {
      const [xa, ya, xb, yb, xc, yc] = rnd(r, 6), A = [xa, ya], B = [xb, yb], Cc = [xc, yc];
      const kind = r.pick(level === 1 ? ['coords', 'sum'] : ['coords', 'para', 'norm', 'sum']);
      if (kind === 'coords') {
        const v = [xb - xa, yb - ya];
        return qcmNum(r, `On donne ${M(`A${pt(...A)}`)} et ${M(`B${pt(...B)}`)}. Les coordonnées du vecteur ${M('\\overrightarrow{AB}')} sont :`, [v, `${M(`(x_B-x_A\\,;\\,y_B-y_A)=(${xb}-${par(xa)}\\,;\\,${yb}-${par(ya)})`)}.`],
          [[[-v[0], -v[1]], `calcule les coordonnées de ${M('\\overrightarrow{BA}')}.`], [[xa + xb, ya + yb], 'additionne les coordonnées au lieu de les soustraire.'], [[v[1], v[0]], 'inverse l’abscisse et l’ordonnée.'], [[v[0], ya - yb], 'soustrait dans le mauvais sens pour l’ordonnée seulement.']], (w) => M(vc(...w)),
          (w) => xa + w[0] === xb && ya + w[1] === yb);
      }
      if (kind === 'sum') {
        const u = [r.nz(-6, 6), r.nz(-6, 6)], v = [r.nz(-6, 6), r.nz(-6, 6)], k = r.pick([2, 3, -2]), op = k < 0 ? '-' : '+', K = Math.abs(k);
        return qcmNum(r, `Avec ${M(`\\vec u${vc(...u)}`)} et ${M(`\\vec v${vc(...v)}`)}, les coordonnées de ${M(`\\vec u${op}${K}\\vec v`)} sont :`, [[u[0] + k * v[0], u[1] + k * v[1]], `on multiplie chaque coordonnée de ${M('\\vec v')} par ${M(K)} puis on ${k < 0 ? 'retranche' : 'ajoute'} à celles de ${M('\\vec u')}.`],
          [[[u[0] + k * v[0], u[1] + v[1]], `ne multiplie que l’abscisse de ${M('\\vec v')} par ${M(K)}.`], [[u[0] - k * v[0], u[1] - k * v[1]], `se trompe de signe devant ${M('\\vec v')}.`], [[k * (u[0] + v[0]), k * (u[1] + v[1])], `multiplie la somme ${M('\\vec u+\\vec v')} par ${M(k)}.`], [[u[0] + v[0] + k, u[1] + v[1] + k], `ajoute ${M(k)} à chaque coordonnée au lieu de multiplier.`]], (x) => M(vc(...x)),
          (x) => x[0] === u[0] + k * v[0] && x[1] === u[1] + k * v[1]);
      }
      if (kind === 'para') {
        const D = [xa + xc - xb, ya + yc - yb];
        return qcmNum(r, `${M('ABCD')} est un parallélogramme avec ${M(`A${pt(...A)}`)}, ${M(`B${pt(...B)}`)} et ${M(`C${pt(...Cc)}`)}. Les coordonnées de ${M('D')} sont :`, [D, `${M('\\overrightarrow{AB}=\\overrightarrow{DC}')} donc ${M('D=A+C-B')}.`],
          [[[xb + xc - xa, yb + yc - ya], `utilise ${M('D=B+C-A')}.`], [[xa + xb - xc, ya + yb - yc], `utilise ${M('D=A+B-C')}.`], [[xc - xb, yc - yb], `donne les coordonnées de ${M('\\overrightarrow{BC}')} au lieu de celles de ${M('D')}.`], [[xa + xc, ya + yc], 'additionne A et C sans retrancher B.']], (w) => M(pt(...w)),
          (w) => xb - xa === xc - w[0] && yb - ya === yc - w[1]);
      }
      const u = [r.nz(-7, 7), r.nz(-7, 7)], n2 = u[0] ** 2 + u[1] ** 2, sum = u[0] + u[1];
      return qcmNum(r, `La norme du vecteur ${M(`\\vec u${vc(...u)}`)} est :`, [{ t: sqrtTex(n2), sq: n2 }, `${M(`\\|\\vec u\\|=\\sqrt{${par(u[0])}^{2}+${par(u[1])}^{2}}=\\sqrt{${n2}}`)}.`],
        [[{ t: `${Math.abs(u[0]) + Math.abs(u[1])}`, sq: (Math.abs(u[0]) + Math.abs(u[1])) ** 2 }, 'additionne les valeurs absolues des coordonnées au lieu d’utiliser Pythagore.'], [{ t: `${sum * sum}`, sq: sum ** 4 }, `calcule ${M('(a+b)^{2}')} au lieu de ${M('\\sqrt{a^{2}+b^{2}}')}.`], [{ t: sqrtTex(Math.abs(u[0] ** 2 - u[1] ** 2) + 1), sq: Math.abs(u[0] ** 2 - u[1] ** 2) + 1 }, 'soustrait les carrés des coordonnées.'], [{ t: `${n2}`, sq: n2 * n2 }, 'oublie la racine carrée.']],
        (w) => M(w.t), (w) => w.sq === n2);
    } },

  { id: 's4-vec-tf', cls: C, chapter: 'seconde-02', domain: 'geometrie', skill: 'Vrai ou faux sur les vecteurs', fast: false,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['colin', 'norm'] : ['colin', 'para', 'norm']);
      if (kind === 'colin') {
        const u = [r.nz(-5, 5), r.nz(-5, 5)], k = r.pick([2, 3, -1, -2]), yes = r.next() < 0.5, v = yes ? [k * u[0], k * u[1]] : [k * u[0] + r.pick([1, -1]), k * u[1]], det = u[0] * v[1] - u[1] * v[0];
        return tf({ s: `Les vecteurs ${M(`\\vec u${vc(...u)}`)} et ${M(`\\vec v${vc(...v)}`)} sont colinéaires.`, v: det === 0, c: () => (det === 0) === (u[0] * v[1] === u[1] * v[0]) && (det === 0) === yes,
          j: det === 0 ? `${M(`${par(u[0])}\\times ${par(v[1])}-${par(u[1])}\\times ${par(v[0])}=0`)} : les coordonnées sont proportionnelles (${M(`\\vec v=${k}\\vec u`)}).` : `${M(`${par(u[0])}\\times ${par(v[1])}-${par(u[1])}\\times ${par(v[0])}=${det}`)} est non nul : les vecteurs ne sont pas colinéaires.` });
      }
      if (kind === 'para') {
        const A = [r.int(-4, 4), r.int(-4, 4)], B = [A[0] + r.nz(-4, 4), A[1] + r.nz(-4, 4)], yes = r.next() < 0.5, d = yes ? 0 : r.pick([1, -1]), Dd = [r.int(-3, 3) + A[0], r.int(-3, 3) + A[1]], Cc = [Dd[0] + B[0] - A[0] + d, Dd[1] + B[1] - A[1]];
        const mid = (P, Q) => [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2], m1 = mid(A, Cc), m2 = mid(B, Dd), ok = m1[0] === m2[0] && m1[1] === m2[1];
        return tf({ s: `Avec ${M(`A${pt(...A)}`)}, ${M(`B${pt(...B)}`)}, ${M(`C${pt(...Cc)}`)} et ${M(`D${pt(...Dd)}`)}, le quadrilatère ${M('ABCD')} est un parallélogramme.`, v: ok, c: () => ok === (B[0] - A[0] === Cc[0] - Dd[0] && B[1] - A[1] === Cc[1] - Dd[1]) && ok === yes,
          j: ok ? `${M(`\\overrightarrow{AB}${vc(B[0] - A[0], B[1] - A[1])}`)} et ${M(`\\overrightarrow{DC}${vc(Cc[0] - Dd[0], Cc[1] - Dd[1])}`)} sont égaux.` : `${M(`\\overrightarrow{AB}${vc(B[0] - A[0], B[1] - A[1])}`)} et ${M(`\\overrightarrow{DC}${vc(Cc[0] - Dd[0], Cc[1] - Dd[1])}`)} sont différents.` });
      }
      const a = r.nz(-6, 6), b = r.nz(-6, 6);
      if (Math.abs(a) === Math.abs(b)) return this.make(r, level);
      const v = r.pick([[b, a], [-a, b], [a, -b]]);
      return tf({ s: `Si deux vecteurs ont la même norme, ils sont égaux : par exemple ${M(`\\vec u${vc(a, b)}`)} et ${M(`\\vec v${vc(...v)}`)} vérifient ${M('\\|\\vec u\\|=\\|\\vec v\\|')}, donc ${M('\\vec u=\\vec v')}.`, v: false,
        c: () => Math.hypot(a, b) === Math.hypot(...v) && !(a === v[0] && b === v[1]),
        j: `Les normes sont égales (${M(`\\sqrt{${a * a + b * b}}`)}) mais les coordonnées diffèrent : deux vecteurs égaux ont même norme, même direction et même sens.` });
    } },

  { id: 's4-vec-error', cls: C, chapter: 'seconde-02', domain: 'geometrie', skill: 'Trouver l’erreur sur les vecteurs', fast: false,
    make(r, level) {
      const A = [r.int(-4, 4), r.int(-4, 4)], B = [A[0] + r.nz(-4, 4), A[1] + r.nz(-4, 4)], k = r.pick([2, 3, -2]), w = [k * (B[0] - A[0]), k * (B[1] - A[1])], good = [A[0] + w[0], A[1] + w[1]], bad = w;
      if (A[0] === 0 && A[1] === 0) return this.make(r, level);
      return spot(`Un élève cherche le point ${M('M')} tel que ${M(`\\overrightarrow{AM}=${k}\\overrightarrow{AB}`)}, avec ${M(`A${pt(...A)}`)} et ${M(`B${pt(...B)}`)}.`,
        [M(`\\overrightarrow{AB}${vc(B[0] - A[0], B[1] - A[1])}`), M(`${k}\\overrightarrow{AB}${vc(...w)}`), M(`M${pt(...bad)}\\text{ car }\\overrightarrow{AM}=${k}\\overrightarrow{AB}`), M(`\\text{donc }M${pt(...bad)}`)], 2,
        `les coordonnées de ${M('\\overrightarrow{AM}')} sont ${M('(x_M-x_A\\,;\\,y_M-y_A)')}, et non celles de ${M('M')}.`,
        M(`x_M-${par(A[0])}=${w[0]}\\text{ et }y_M-${par(A[1])}=${w[1]}`), M(`M${pt(...good)}`), () => good[0] - A[0] === k * (B[0] - A[0]) && good[1] - A[1] === k * (B[1] - A[1]) && (good[0] !== bad[0] || good[1] !== bad[1]));
    } },

  { id: 's4-vec-ratio', cls: C, chapter: 'seconde-02', domain: 'geometrie', skill: 'Point défini par un rapport vectoriel', fast: false,
    make(r, level) {
      const A = [r.int(-6, 6), r.int(-6, 6)], B = [A[0] + r.nz(-8, 8), A[1] + r.nz(-8, 8)];
      const [p, q] = level === 1 ? [1, 2] : level === 2 ? r.pick([[1, 3], [2, 3], [1, 4], [3, 4]]) : r.pick([[2, 5], [3, 5], [4, 3], [5, 3], [-1, 2], [-1, 3]]);
      const k = F(p, q), M1 = [add(F(A[0]), mul(k, F(B[0] - A[0]))), add(F(A[1]), mul(k, F(B[1] - A[1])))];
      const word = level === 1 ? 'milieu' : '';
      return { q: `Dans un repère, ${M(`A${pt(...A)}`)} et ${M(`B${pt(...B)}`)}. Déterminer les coordonnées du point ${M('M')} tel que ${M(`\\overrightarrow{AM}=${fracTex(k)}\\overrightarrow{AB}`)}${word ? ' (c’est le milieu de ' + M('[AB]') + ')' : ''}.`,
        a: `${M(`\\overrightarrow{AB}${vc(B[0] - A[0], B[1] - A[1])}`)} donc ${M(`x_M=${A[0]}+${parT(fracTex(k))}\\times ${par(B[0] - A[0])}=${fracTex(M1[0])}`)} et ${M(`y_M=${A[1]}+${parT(fracTex(k))}\\times ${par(B[1] - A[1])}=${fracTex(M1[1])}`)} : ${M(`M\\left(${fracTex(M1[0])}\\,;\\,${fracTex(M1[1])}\\right)`)}.`,
        ok: () => { const x = M1[0], y = M1[1], dx = sub(x, F(A[0])), dy = sub(y, F(A[1])); return eq(mul(dx, F(B[1] - A[1])), mul(dy, F(B[0] - A[0]))) && eq(mul(dx, F(1)), mul(k, F(B[0] - A[0]))) && eq(mul(dy, F(1)), mul(k, F(B[1] - A[1]))); } };
    } },

  // ============================ 03 Droites ============================
  { id: 's4-line-qcm', cls: C, chapter: 'seconde-03', domain: 'fonctions', skill: 'QCM sur les droites', fast: true,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['point', 'slope'] : ['through', 'point', 'slope']);
      if (kind === 'through') {
        const A = [r.int(-5, 5), r.int(-5, 5)], B = [A[0] + r.nz(-4, 4), A[1] + r.nz(-5, 5)], m = F(B[1] - A[1], B[0] - A[0]), p = sub(F(A[1]), mul(m, F(A[0])));
        if (A[0] === 0) return this.make(r, level);
        const ok = (w) => onLine(w.m, w.p, A) && onLine(w.m, w.p, B);
        return qcmNum(r, `La droite ${M('(AB)')}, avec ${M(`A${pt(...A)}`)} et ${M(`B${pt(...B)}`)}, a pour équation :`, [{ m, p }, `coefficient directeur ${M(`\\dfrac{${B[1]}-${par(A[1])}}{${B[0]}-${par(A[0])}}=${fracTex(m)}`)}, puis l’ordonnée à l’origine se déduit de ${M('A')}.`],
          [[{ m: F(-m.n, m.d), p }, 'se trompe de signe pour le coefficient directeur.'], [{ m: F(B[0] - A[0], B[1] - A[1]), p }, 'inverse le quotient des écarts (abscisses sur ordonnées).'], [{ m, p: add(F(A[1]), mul(m, F(A[0]))) }, 'écrit ' + M('p=y_A+mx_A') + ' au lieu de ' + M('p=y_A-mx_A') + '.'], [{ m, p: F(-p.n, p.d) }, 'se trompe de signe pour l’ordonnée à l’origine.']],
          (w) => M(eqLine(w.m, w.p)), ok);
      }
      if (kind === 'point') {
        const a = r.nz(-4, 4), b = r.nz(-4, 4), x0 = r.int(-4, 4), y0 = r.int(-4, 4), c = -a * x0 - b * y0, eqn = `${polyTex([a, 0]).replace(/x/, 'x')}${b < 0 ? '' : '+'}${polyTex([b, 0]).replace(/x/, 'y')}${c === 0 ? '' : c < 0 ? c : '+' + c}=0`;
        return qcmNum(r, `La droite ${M('d')} a pour équation ${M(eqn)}. Lequel de ces points lui appartient ?`, [[x0, y0], `${M(`${a}\\times ${par(x0)}${sgn(b)}\\times ${par(y0)}${c === 0 ? '' : sgn(c)}=0`)}.`],
          [[[y0, x0], 'échange l’abscisse et l’ordonnée.'], [[x0, -y0], 'change le signe de l’ordonnée.'], [[-x0, y0], 'change le signe de l’abscisse.'], [[x0 + 1, y0], 'décale l’abscisse d’une unité.'], [[x0, y0 + 1], 'décale l’ordonnée d’une unité.']], (w) => M(pt(...w)), (w) => a * w[0] + b * w[1] + c === 0);
      }
      const a = r.nz(-5, 5), b = r.nz(-5, 5), c = r.int(-9, 9);
      if (Math.abs(a) === Math.abs(b)) return this.make(r, level);
      const m = F(-a, b);
      return qcmNum(r, `La droite d’équation ${M(`${polyTex([a, 0]).replace('x', 'x')}${b < 0 ? '' : '+'}${polyTex([b, 0]).replace('x', 'y')}=${c}`)} a pour coefficient directeur :`, [m, `${M(`y=\\dfrac{${polyTex([-a, c])}}{${b}}`)} donc le coefficient de ${M('x')} est ${M(fracTex(m))}.`],
        [[F(a, b), 'oublie le signe moins en isolant ' + M('y') + '.'], [F(-b, a), 'inverse le quotient.'], [F(b, a), 'inverse le quotient et oublie le signe.'], [F(a), 'prend le coefficient de ' + M('x') + ' sans diviser par celui de ' + M('y') + '.']], (w) => M(fracTex(w)),
        (w) => { const y0 = F(c, b), y1 = F(c - a, b); return eq(sub(y1, y0), w); });
    } },

  { id: 's4-line-tf', cls: C, chapter: 'seconde-03', domain: 'fonctions', skill: 'Vrai ou faux sur les droites', fast: false,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['point', 'parallel'] : ['point', 'parallel', 'secant']);
      if (kind === 'point') {
        const m = r.nz(-4, 4), p = r.int(-5, 5), x0 = r.int(-4, 4), yes = r.next() < 0.5, y0 = m * x0 + p + (yes ? 0 : r.pick([1, -1, 2]));
        return tf({ s: `Le point ${M(`P${pt(x0, y0)}`)} appartient à la droite d’équation ${M(`y=${polyTex([m, p])}`)}.`, v: yes, c: () => (m * x0 + p === y0) === yes,
          j: `Pour ${M(`x=${x0}`)}, ${M(polyTex([m, p]))} vaut ${M(m * x0 + p)}${yes ? ', qui est bien l’ordonnée de ' + M('P') : ', différent de ' + M(y0) + ', l’ordonnée de ' + M('P')}.` });
      }
      if (kind === 'parallel') {
        const a = r.nz(-4, 4), b = r.int(-5, 5), yes = r.next() < 0.5, c = yes ? a : a + r.pick([1, -1, 2]) || 3, d = b + r.nz(-4, 4);
        return tf({ s: `Les droites d’équations ${M(`y=${polyTex([a, b])}`)} et ${M(`y=${polyTex([c, d])}`)} sont parallèles.`, v: c === a, c: () => (c === a) === yes,
          j: c === a ? `Elles ont le même coefficient directeur ${M(a)} (et des ordonnées à l’origine différentes) : elles sont parallèles.` : `Les coefficients directeurs ${M(a)} et ${M(c)} sont différents : les droites sont sécantes.` });
      }
      const x0 = r.int(-3, 3), y0 = r.int(-3, 3), a = r.nz(-3, 3), c = a + r.nz(-3, 3), yes = r.next() < 0.5, b = y0 - a * x0, d = y0 - c * x0 + (yes ? 0 : 1);
      return tf({ s: `Les droites d’équations ${M(`y=${polyTex([a, b])}`)} et ${M(`y=${polyTex([c, d])}`)} se coupent au point ${M(`${pt(x0, y0)}`)}.`, v: yes, c: () => (a * x0 + b === y0 && c * x0 + d === y0) === yes,
        j: yes ? `Les deux équations sont vérifiées par ${M(pt(x0, y0))} : ${M(`${a}\\times ${par(x0)}${sgn(b)}=${y0}`)} et ${M(`${c}\\times ${par(x0)}${sgn(d)}=${y0}`)}.` : `L’une des deux équations n’est pas vérifiée : ${M(`${c}\\times ${par(x0)}${sgn(d)}=${c * x0 + d}\\neq ${y0}`)}.` });
    } },

  { id: 's4-line-error', cls: C, chapter: 'seconde-03', domain: 'fonctions', skill: 'Trouver l’erreur sur une équation de droite', fast: false,
    make(r, level) {
      const A = [r.nz(-5, 5), r.int(-5, 5)], B = [A[0] + r.nz(-4, 4), A[1] + r.nz(-5, 5)];
      if (A[1] === B[1]) return this.make(r, level);
      const m = F(B[1] - A[1], B[0] - A[0]), p = sub(F(A[1]), mul(m, F(A[0]))), bad = r.pick([0, 1]);
      const mb = bad === 0 ? F(B[1] - A[1], A[0] - B[0]) : m, pb = bad === 0 ? sub(F(A[1]), mul(mb, F(A[0]))) : add(F(A[1]), mul(m, F(A[0])));
      const lines = [M(`m=\\dfrac{y_B-y_A}{${bad === 0 ? 'x_A-x_B' : 'x_B-x_A'}}=${fracTex(mb)}`), M(`p=y_A${bad === 0 ? '-' : '+'}m\\,x_A=${bad === 0 ? `${A[1]}-${parT(fracTex(mb))}\\times ${par(A[0])}` : `${A[1]}+${parT(fracTex(m))}\\times ${par(A[0])}`}=${fracTex(pb)}`), M(eqLine(mb, pb))];
      return spot(`Un élève cherche l’équation réduite de la droite ${M('(AB)')} avec ${M(`A${pt(...A)}`)} et ${M(`B${pt(...B)}`)}.`, lines, bad,
        bad === 0 ? 'le dénominateur doit être ' + M('x_B-x_A') + ' (même ordre que le numérateur).' : 'l’ordonnée à l’origine est ' + M('p=y_A-m\\,x_A') + ' : le signe de ' + M('m\\,x_A') + ' est faux.',
        bad === 0 ? M(`m=\\dfrac{${B[1]}-${par(A[1])}}{${B[0]}-${par(A[0])}}=${fracTex(m)}`) : M(`p=${A[1]}-${parT(fracTex(m))}\\times ${par(A[0])}=${fracTex(p)}`), M(eqLine(m, p)),
        () => onLine(m, p, A) && onLine(m, p, B) && !(onLine(mb, pb, A) && onLine(mb, pb, B)));
    } },

  { id: 's4-line-param', cls: C, chapter: 'seconde-03', domain: 'fonctions', skill: 'Droite dépendant d’un paramètre', fast: false,
    make(r, level) {
      const k = r.nz(-4, 4), b = r.nz(-6, 6), kind = r.pick(level === 1 ? ['through'] : ['through', 'parallel', 'abscissa']);
      if (kind === 'through') {
        const P = [r.nz(-4, 4), r.int(-8, 8)], m = F(P[1] - b, P[0]) , mm = sub(m, F(k));
        return { q: `Pour quelle valeur du réel ${M('m')} la droite d’équation ${M(`y=(m${sgn(k)})x${sgn(b)}`)} passe-t-elle par ${M(`P${pt(...P)}`)} ?`,
          a: `${M(`${P[1]}=(m${sgn(k)})\\times ${par(P[0])}${sgn(b)}`)} donne ${M(`m${sgn(k)}=\\dfrac{${P[1]}${b < 0 ? '+' : '-'}${Math.abs(b)}}{${P[0]}}=${fracTex(m)}`)}, soit ${M(`m=${fracTex(mm)}`)}.`,
          ok: () => eq(add(mul(add(mm, F(k)), F(P[0])), F(b)), F(P[1])) };
      }
      if (kind === 'parallel') {
        const c = r.nz(-5, 5), e = r.int(-4, 4), a2 = r.pick([2, 3, -2]), mm = div(F(c - k), F(a2));
        return { q: `Pour quelle valeur du réel ${M('m')} les droites d’équations ${M(`y=(${a2 === 1 ? '' : a2}m${sgn(k)})x${sgn(b)}`)} et ${M(`y=${polyTex([c, e])}`)} sont-elles parallèles ?`,
          a: `Les coefficients directeurs sont égaux : ${M(`${a2}m${sgn(k)}=${c}`)}, soit ${M(`m=\\dfrac{${c}${k < 0 ? '+' : '-'}${Math.abs(k)}}{${a2}}=${fracTex(mm)}`)}.`,
          ok: () => eq(add(mul(F(a2), mm), F(k)), F(c)) };
      }
      const c = r.nz(-4, 4), e = r.int(-6, 6), x0 = r.int(-3, 3);
      if (k === c) return this.make(r, level);
      // the two lines y=(m+k)x+b and y=c x+e cross at abscissa x0: (m+k)x0+b = c x0 + e
      if (x0 === 0) return this.make(r, level);
      const mm = sub(div(F(c * x0 + e - b), F(x0)), F(k));
      return { q: `Pour quelle valeur du réel ${M('m')} les droites d’équations ${M(`y=(m${sgn(k)})x${sgn(b)}`)} et ${M(`y=${polyTex([c, e])}`)} se coupent-elles au point d’abscisse ${M(x0)} ?`,
        a: `En ${M(`x=${x0}`)} : ${M(`(m${sgn(k)})\\times ${par(x0)}${sgn(b)}=${c * x0 + e}`)}, soit ${M(`m=${fracTex(mm)}`)}.`,
        ok: () => eq(add(mul(add(mm, F(k)), F(x0)), F(b)), F(c * x0 + e)) };
    } },
];
