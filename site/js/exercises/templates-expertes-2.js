// Maths expertes generators, second file (chapters 01 to 03: nombres complexes sous forme algébrique, géométrique, trigonométrique et exponentielle):
// four-choice questions with one typical error per wrong option, true/false, find-the-error and multi-step generators with seeded parameters.
// Same contract as templates-expertes.js; every ok() recomputes the answer another way (substitution, floating-point complex arithmetic, lattice sampling).
// Helpers: expertes-kit.js, premiere-kit.js (tf, spot), seconde-kit-2.js (qcmNum).
import { F, add, sub, mul, div, val, eq, M, fracTex, sgn, par, sqrtTex } from './engine.js';
const kx = (k, v = 'x') => (k === 1 ? v : k === -1 ? `-${v}` : `${k}${v}`);
const imTex = (a) => (a === 1 ? 'i' : a === -1 ? '-i' : `${a}i`);
import { tf, spot } from './premiere-kit.js';
import { qcmNum } from './seconde-kit-2.js';
import { cx, cxF, cmul, cadd, csub, conj, abs2, cpow, cdiv, ceq, cmulF, toF, algExp, normU, thetaTex, exactCosSin } from './expertes-kit.js';

const C = 'expertes';
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
const pc = (z) => `(${cx(...z)})`;
// floating complex multiplication through modulus and argument (another route than the algebraic product)
const polar = ([a, b]) => [Math.hypot(a, b), Math.atan2(b, a)];
const fromPolar = ([r, t]) => [r * Math.cos(t), r * Math.sin(t)];
const cnear = (z, w) => Math.abs(z[0] - w[0]) <= 1e-9 * (1 + Math.hypot(...w)) && Math.abs(z[1] - w[1]) <= 1e-9 * (1 + Math.hypot(...w));
// a sum of terms [coefficient, symbol] written without 0, 1 or +-: sumTerms([[3, ''], [-1, 'i'], [0, 'i']]) = '3-i'
const sumTerms = (terms) => { let out = ''; for (const [k, v] of terms) { if (k === 0) continue; const abs = Math.abs(k), body = v && abs === 1 ? v : `${abs}${v}`; out += (k < 0 ? '-' : out ? '+' : '') + body; } return out || '0'; };
const cz = (r, lo = -6, hi = 6) => [r.int(lo, hi), r.nz(lo, hi)];
const fmtPair = (p) => cxF(p[0], p[1]);
// cos + i sin of an angle u*pi/12 with exact values
const expTex = (u) => { const e = exactCosSin(u), im = e.sin; return `${e.cos === '0' ? '' : e.cos}${im === '0' ? '' : `${im.startsWith('-') ? '' : e.cos === '0' ? '' : '+'}${im === '1' ? '' : im === '-1' ? '-' : im}i`}` || '0'; };

export const expertes2 = [
  // ============================ 01 Forme algébrique ============================
  { id: 'e2-cx-qcm', cls: C, chapter: 'expertes-01', domain: 'complexes', skill: 'QCM : produit, quotient et puissances de i', fast: true,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['mul', 'ipow'] : ['mul', 'div', 'ipow']);
      if (kind === 'mul') {
        const z = cz(r), w = cz(r), [a, b] = z, [c, d] = w, good = cmul(z, w);
        return qcmNum(r, `Le produit ${M(`${pc(z)}${pc(w)}`)} vaut :`, [good, `${M(`ac-bd=${a * c - b * d}`)} et ${M(`ad+bc=${a * d + b * c}`)}.`],
          [[[a * c + b * d, a * d + b * c], 'prend ' + M('i^{2}=1') + '.'], [[a * c, b * d], 'multiplie les parties réelles entre elles et les parties imaginaires entre elles.'], [[a * c - b * d, a * d - b * c], 'se trompe de signe dans le coefficient de ' + M('i') + '.'], [[a * c - b * d, b * c], 'oublie un produit croisé.']], (p) => M(cx(...p)), (p) => ceq(p, cmul(z, w)));
      }
      if (kind === 'div') {
        let z = cz(r), w = cz(r, -5, 5); const [a, b] = z, [c, d] = w, n = c * c + d * d, good = cdiv(z, w);
        return qcmNum(r, `Le quotient ${M(`\\dfrac{${cx(...z)}}{${cx(...w)}}`)} vaut :`, [good, `on multiplie par le conjugué ${M(cx(c, -d))} : numérateur ${M(cx(a * c + b * d, b * c - a * d))}, dénominateur ${M(`${par(c)}^{2}+${par(d)}^{2}=${n}`)}.`],
          [[[F(a * c + b * d, n), F(a * d - b * c, n)], 'se trompe de signe pour la partie imaginaire.'], [[F(a * c - b * d, n), F(a * d + b * c, n)], 'multiplie par ' + M('w') + ' au lieu de son conjugué.'], [[F(a * c + b * d, c + d || 1), F(b * c - a * d, c + d || 1)], 'divise par ' + M('c+d') + ' au lieu de ' + M('c^{2}+d^{2}') + '.'], [[F(a, c || 1), F(b, d)], 'divise les parties entre elles.']], (p) => M(fmtPair(p)),
          (p) => { const back = cmulF(p, toF(w)); return eq(back[0], F(a)) && eq(back[1], F(b)); });
      }
      const n = r.int(2, 99), q = n % 4, good = [[1, 0], [0, 1], [-1, 0], [0, -1]][q];
      return qcmNum(r, `${M(`i^{${n}}`)} est égal à :`, [good, `${M(`i^{4}=1`)} et ${M(`${n}=4\\times ${(n - q) / 4}+${q}`)} : ${M(`i^{${n}}=i^{${q}}`)}.`.replace('i^{0}', '1').replace('i^{1}', 'i')],
        [[[1, 0], '1'], [[0, 1], 'i'], [[-1, 0], '-1'], [[0, -1], '-i']].filter(([v]) => !ceq(v, good)).map(([v, why]) => [v, `utilise un reste de la division de ${M(n)} par ${M(4)} différent de ${M(q)}.`]), (p) => M(cx(...p)), (p) => ceq(p, cpow([0, 1], n)));
    } },

  { id: 'e2-cx-tf', cls: C, chapter: 'expertes-01', domain: 'complexes', skill: 'Vrai ou faux sur les nombres complexes', fast: false,
    make(r, level) {
      const z = cz(r, -7, 7), [a, b] = z, kind = r.pick(level === 1 ? ['zzbar', 'sum'] : ['zzbar', 'sum', 'sq', 'inv']), yes = r.next() < 0.5;
      if (kind === 'zzbar') { const right = a * a + b * b, claim = yes ? right : r.pick([a * a - b * b, (a + b) ** 2, a * a + b * b + 1]); const ok = claim === right;
        return tf({ s: `Pour ${M(`z=${cx(...z)}`)}, on a ${M(`z\\bar{z}=${claim}`)}.`, v: ok, c: () => { const p = cmul(z, conj(z)); return (p[1] === 0 && p[0] === claim) === ok; }, j: `${M(`z\\bar{z}=a^{2}+b^{2}=${a * a}+${b * b}=${right}`)}${ok ? '.' : `, et non ${M(claim)}.`}` }); }
      if (kind === 'sum') { const claim = yes ? 2 * a : r.pick([2 * b, a, 2 * a + 1]); const ok = claim === 2 * a;
        return tf({ s: `Pour ${M(`z=${cx(...z)}`)}, on a ${M(`z+\\bar{z}=${claim}`)}.`, v: ok, c: () => { const s = cadd(z, conj(z)); return (s[1] === 0 && s[0] === claim) === ok; }, j: `${M(`z+\\bar{z}=2\\,\\text{Re}(z)=${2 * a}`)}${ok ? '.' : `, et non ${M(claim)}.`}` }); }
      if (kind === 'sq') { const sq = cmul(z, z), claim = yes ? sq : [a * a + b * b, 2 * a * b], ok = ceq(claim, sq);
        return tf({ s: `Pour ${M(`z=${cx(...z)}`)}, on a ${M(`z^{2}=${cx(...claim)}`)}.`, v: ok, c: () => ceq(cpow(z, 2), claim) === ok, j: `${M(`z^{2}=a^{2}-b^{2}+2abi=${cx(...sq)}`)}${ok ? '.' : `, et non ${M(cx(...claim))} (on a oublié que ${M('i^{2}=-1')}).`}` }); }
      const n = a * a + b * b, correct = [F(a, n), F(-b, n)], claim = yes ? correct : [F(a, n), F(b, n)], ok = eq(claim[1], correct[1]);
      return tf({ s: `Pour ${M(`z=${cx(...z)}`)}, l’inverse de ${M('z')} est ${M(cxF(...claim))}.`, v: ok, c: () => { const back = cmulF(claim, toF(z)); return (eq(back[0], F(1)) && back[1].n === 0) === ok; }, j: `${M(`\\dfrac{1}{z}=\\dfrac{\\bar{z}}{|z|^{2}}=\\dfrac{${cx(a, -b)}}{${n}}=${cxF(...correct)}`)}${ok ? '.' : `, et non ${M(cxF(...claim))}.`}` });
    } },

  { id: 'e2-cx-error', cls: C, chapter: 'expertes-01', domain: 'complexes', skill: 'Trouver l’erreur sur un calcul complexe', fast: false,
    make(r, level) {
      if (r.next() < 0.5) {
        const z = cz(r, -5, 5), w = cz(r, -5, 5), [a, b] = z, [c, d] = w, good = cmul(z, w), bad = [a * c + b * d, a * d + b * c];
        if (b * d === 0 || ceq(good, bad)) return this.make(r, level);
        return spot(`Un élève calcule ${M(`${pc(z)}${pc(w)}`)}.`, [M(`${pc(z)}${pc(w)}=${sumTerms([[a * c, ''], [a * d, 'i'], [b * c, 'i'], [b * d, 'i^{2}']])}`), M(`=${sumTerms([[a * c, ''], [b * d, '']])}+(${sumTerms([[a * d, ''], [b * c, '']])})i`), M(`=${cx(...bad)}`)], 1, `${M('i^{2}=-1')} et non ${M(1)} : le terme ${M(sumTerms([[b * d, 'i^{2}']]))} vaut ${M(-b * d)}.`, M(`=${sumTerms([[a * c, ''], [-b * d, '']])}+(${sumTerms([[a * d, ''], [b * c, '']])})i`), M(`=${cx(...good)}`), () => ceq(good, [a * c - b * d, a * d + b * c]) && !ceq(good, bad));
      }
      const z = cz(r, -6, 6), w = [r.nz(-4, 4), r.nz(-4, 4)];
      if (Math.abs(w[0]) === Math.abs(w[1])) return this.make(r, level);
      const [a, b] = z, [c, d] = w, num = cmul(z, conj(w)), nBad = c * c - d * d, good = cdiv(z, w), bad = [F(num[0], nBad), F(num[1], nBad)];
      return spot(`Un élève calcule ${M(`\\dfrac{${cx(...z)}}{${cx(...w)}}`)}.`, [M(`\\dfrac{${cx(...z)}}{${cx(...w)}}=\\dfrac{(${cx(...z)})(${cx(c, -d)})}{(${cx(...w)})(${cx(c, -d)})}`), M(`\\text{dénominateur}=${par(c)}^{2}-${par(d)}^{2}=${nBad}`), M(`\\text{numérateur}=${cx(...num)}`), M(`\\text{quotient}=${cxF(...bad)}`)], 1,
        `${M('(c+di)(c-di)=c^{2}-(di)^{2}=c^{2}+d^{2}')}.`, M(`\\text{dénominateur}=${par(c)}^{2}+${par(d)}^{2}=${c * c + d * d}`), M(`\\text{quotient}=${cxF(...good)}`), () => { const back = cmulF(good, toF(w)); return eq(back[0], F(a)) && eq(back[1], F(b)); });
    } },

  { id: 'e2-cx-solve', cls: C, chapter: 'expertes-01', domain: 'complexes', skill: 'Équations dans C', fast: false,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['lin'] : level === 2 ? ['lin', 'conj'] : ['conj', 'sqrt', 'lin']);
      if (kind === 'lin') { const A = cz(r, -4, 4), B = [r.int(-6, 6), r.int(-6, 6)], c = [r.int(-5, 5), r.int(-5, 5)], z = cdiv(csub(B, c), A);
        return { q: `Résoudre dans ${M('\\mathbb{C}')} l’équation ${M(`(${cx(...A)})z+${cx(...c) === '0' ? '0' : `(${cx(...c)})`}=${cx(...B)}`)}.`, a: `${M(`z=\\dfrac{${cx(...csub(B, c))}}{${cx(...A)}}=${cxF(...z)}`)}.`, ok: () => { const back = cmulF(toF(A), z); return eq(add(back[0], F(c[0])), F(B[0])) && eq(add(back[1], F(c[1])), F(B[1])); } }; }
      if (kind === 'conj') { const x = r.int(-5, 5), y = r.nz(-5, 5), k = r.pick([2, 3]), rhs = [(1 + k) * x, (1 - k) * y];
        return { q: `Résoudre dans ${M('\\mathbb{C}')} l’équation ${M(`z+${k}\\bar{z}=${cx(...rhs)}`)}.`, a: `Avec ${M('z=x+iy')} : ${M(`(1+${k})x+(1-${k})iy=${cx(...rhs)}`)} donc ${M(`x=${x}`)} et ${M(`y=${y}`)} : ${M(`z=${cx(x, y)}`)}.`, ok: () => ceq(cadd([x, y], [k * x, -k * y]), rhs) && rhs[0] % (1 + k) === 0 && rhs[1] % (1 - k) === 0 }; }
      const s = cz(r, -4, 4), w = cmul(s, s);
      return { q: `Résoudre dans ${M('\\mathbb{C}')} l’équation ${M(`z^{2}=${cx(...w)}`)}.`, a: `On cherche ${M('z=x+iy')} : ${M(`x^{2}-y^{2}=${w[0]}`)}, ${M(`2xy=${w[1]}`)} et ${M(`x^{2}+y^{2}=${abs2(w) ** 0.5}`)}. Les solutions sont ${M(`z=${cx(...s)}`)} et ${M(`z=${cx(-s[0], -s[1])}`)}.`, ok: () => ceq(cmul(s, s), w) && ceq(cmul([-s[0], -s[1]], [-s[0], -s[1]]), w) && near(Math.sqrt(abs2(w)), abs2(s)) };
    } },

  { id: 'e2-cx-power', cls: C, chapter: 'expertes-01', domain: 'complexes', skill: 'Puissances d’un nombre complexe simple', fast: false,
    make(r, level) {
      const k = r.int(1, 14), z = r.pick([[k, k], [k, -k], [-k, k], [-k, -k]]), sq = cmul(z, z), n = level === 1 ? r.int(2, 5) : 2 * r.int(2, k === 1 ? 7 : k <= 3 ? 4 : 3) + (level === 3 ? r.pick([0, 1]) : 0);
      const half = Math.floor(n / 2), base = cpow(sq, half), good = n % 2 ? cmul(base, z) : base;
      return { q: `Calculer ${M(`(${cx(...z)})^{${n}}`)}.`, a: `${M(`(${cx(...z)})^{2}=${cx(...sq)}`)} donc ${M(`(${cx(...z)})^{${n}}=${n % 2 ? `(${cx(...sq)})^{${half}}\\times (${cx(...z)})` : `(${cx(...sq)})^{${half}}`}=${cx(...good)}`)}.`.replace('^{1}', ''), ok: () => { let p = [1, 0]; for (let i = 0; i < n; i++) p = cmul(p, z); const pol = fromPolar([(k * Math.SQRT2) ** n, n * polar(z)[1]]); return ceq(p, good) && cnear(pol, good); } };
    } },

  { id: 'e2-cx-real', cls: C, chapter: 'expertes-01', domain: 'complexes', skill: 'Paramètre réel pour un nombre réel ou imaginaire pur', fast: false,
    make(r, level) {
      const a = r.nz(-5, 5), b = r.nz(-5, 5), c = r.nz(-5, 5), real = r.next() < 0.5;
      // z = (m + a i)(b + c i): Im = m c + a b, Re = m b - a c
      const m = real ? F(-a * b, c) : F(a * c, b), at = (mm) => cmulF([mm, F(a)], toF([b, c]));
      return { q: `Pour quel réel ${M('m')} le nombre ${M(`z=(m${a < 0 ? '-' : '+'}${imTex(Math.abs(a))})(${cx(b, c)})`)} est-il ${real ? 'réel' : 'imaginaire pur'} ?`, a: `${M(`z=(mb-ac)+(mc+ab)i=(${kx(b, 'm')}${sgn(-a * c)})+(${kx(c, 'm')}${sgn(a * b)})i`)}. ${real ? `Partie imaginaire nulle : ${M(`${kx(c, 'm')}${sgn(a * b)}=0`)}` : `Partie réelle nulle : ${M(`${kx(b, 'm')}${sgn(-a * c)}=0`)}`}, soit ${M(`m=${fracTex(m)}`)}.`, ok: () => { const z = at(m); return real ? z[1].n === 0 && z[0].n !== 0 || z[1].n === 0 : z[0].n === 0; } };
    } },

  // ============================ 02 Point de vue géométrique ============================
  { id: 'e2-geo-qcm', cls: C, chapter: 'expertes-02', domain: 'complexes', skill: 'QCM : module, distance, argument', fast: true,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['mod', 'arg'] : ['mod', 'dist', 'arg']);
      if (kind === 'mod') { const z = cz(r, -7, 7), n = abs2(z), [a, b] = z;
        return qcmNum(r, `Le module de ${M(`z=${cx(...z)}`)} est :`, [{ t: sqrtTex(n), sq: n }, `${M(`|z|=\\sqrt{${par(a)}^{2}+${par(b)}^{2}}=\\sqrt{${n}}`)}.`],
          [[{ t: `${Math.abs(a) + Math.abs(b)}`, sq: (Math.abs(a) + Math.abs(b)) ** 2 }, 'additionne les valeurs absolues.'], [{ t: sqrtTex(Math.abs(a * a - b * b) + 1), sq: Math.abs(a * a - b * b) + 1 }, 'soustrait les carrés.'], [{ t: `${n}`, sq: n * n }, 'oublie la racine carrée.'], [{ t: sqrtTex(n + 2 * Math.abs(a * b)), sq: n + 2 * Math.abs(a * b) }, 'calcule ' + M('(a+b)^{2}') + ' sous la racine.']], (o) => M(o.t), (o) => o.sq === n); }
      if (kind === 'dist') { const A = cz(r, -6, 6), B = cz(r, -6, 6), n = abs2(csub(B, A));
        if (n === 0) return this.make(r, level);
        return qcmNum(r, `Les points ${M('A')} et ${M('B')} ont pour affixes ${M(`z_A=${cx(...A)}`)} et ${M(`z_B=${cx(...B)}`)}. La distance ${M('AB')} est :`, [{ t: sqrtTex(n), sq: n }, `${M(`AB=|z_B-z_A|=|${cx(...csub(B, A))}|=\\sqrt{${n}}`)}.`],
          [[{ t: sqrtTex(abs2(cadd(A, B)) || 1), sq: abs2(cadd(A, B)) || 1 }, 'utilise ' + M('|z_A+z_B|') + '.'], [{ t: sqrtTex(Math.abs(abs2(B) - abs2(A)) || 1), sq: Math.abs(abs2(B) - abs2(A)) || 1 }, 'soustrait les modules au carré.'], [{ t: `${Math.abs(Math.abs(B[0] - A[0]) + Math.abs(B[1] - A[1]))}`, sq: (Math.abs(B[0] - A[0]) + Math.abs(B[1] - A[1])) ** 2 }, 'additionne les écarts.'], [{ t: sqrtTex(abs2(csub(A, B)) + 1), sq: abs2(csub(A, B)) + 1 }, 'se trompe d’une unité.']], (o) => M(o.t), (o) => o.sq === n); }
      const k = r.int(1, 5), dirs = [[1, 1, 1], [-1, 1, 3], [-1, -1, -3], [1, -1, -1]], [sx, sy, nn] = r.pick(dirs), z = [sx * k, sy * k], good = nn;
      const ang = (n) => Math.atan2(Math.sin((n * Math.PI) / 4), Math.cos((n * Math.PI) / 4));
      return qcmNum(r, `Un argument de ${M(`z=${cx(...z)}`)} est :`, [good, `${M('z')} est dans le ${sx > 0 ? (sy > 0 ? 'premier' : 'quatrième') : sy > 0 ? 'deuxième' : 'troisième'} quadrant, ${M(`|\\text{Re}|=|\\text{Im}|`)} : ${M(`\\arg z=${thetaTex(good * 3)}\\ [2\\pi]`)}.`],
        [[-good, 'se trompe de signe (symétrique par rapport à l’axe réel).'], [good > 0 ? good - 4 : good + 4, 'oublie d’ajouter ' + M('\\pi') + ' (arctan seul donne l’angle dans le mauvais quadrant).'], [good === 1 ? 3 : good === 3 ? 1 : good === -1 ? -3 : -1, 'échange les rôles de ' + M('\\cos') + ' et ' + M('\\sin') + '.']], (n) => M(`${n === 0 ? '0' : thetaTex(n * 3)}`), (n) => Math.abs((((ang(n) - Math.atan2(z[1], z[0])) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) < 1e-9 || Math.abs((((ang(n) - Math.atan2(z[1], z[0])) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) - 2 * Math.PI) < 1e-9);
    } },

  { id: 'e2-geo-tf', cls: C, chapter: 'expertes-02', domain: 'complexes', skill: 'Vrai ou faux sur le module et l’argument', fast: false,
    make(r, level) {
      const kind = r.pick(['tri', 'prod', 'conjarg']);
      if (kind === 'tri') { const z1 = cz(r, -5, 5), same = r.next() < 0.3, z2 = same ? [z1[0] * 2, z1[1] * 2] : cz(r, -5, 5), lhs = Math.sqrt(abs2(cadd(z1, z2))), rhs = Math.sqrt(abs2(z1)) + Math.sqrt(abs2(z2)), ok = near(lhs, rhs);
        return tf({ s: `Pour ${M(`z_1=${cx(...z1)}`)} et ${M(`z_2=${cx(...z2)}`)}, on a ${M('|z_1+z_2|=|z_1|+|z_2|')}.`, v: ok, c: () => ok === (Math.abs(z1[0] * z2[1] - z1[1] * z2[0]) === 0 && z1[0] * z2[0] + z1[1] * z2[1] > 0), j: `${M(`|z_1+z_2|=\\sqrt{${abs2(cadd(z1, z2))}}`)} et ${M(`|z_1|+|z_2|=\\sqrt{${abs2(z1)}}+\\sqrt{${abs2(z2)}}`)}${ok ? ' : égalité, car les vecteurs ont même direction et même sens.' : ' : l’inégalité triangulaire est stricte.'}` }); }
      if (kind === 'prod') { const z1 = cz(r, -4, 4), z2 = cz(r, -4, 4), claim = r.pick([abs2(z1) * abs2(z2), abs2(z1) + abs2(z2), abs2(cadd(z1, z2))]), ok = claim === abs2(cmul(z1, z2));
        return tf({ s: `Pour ${M(`z_1=${cx(...z1)}`)} et ${M(`z_2=${cx(...z2)}`)}, on a ${M(`|z_1z_2|^{2}=${claim}`)}.`, v: ok, c: () => ok === (abs2(cmul(z1, z2)) === claim), j: `${M(`|z_1z_2|^{2}=|z_1|^{2}|z_2|^{2}=${abs2(z1)}\\times ${abs2(z2)}=${abs2(z1) * abs2(z2)}`)}${ok ? '.' : `, et non ${M(claim)}.`}` }); }
      const z = cz(r, -6, 6), claim = r.pick([true, false]), sym = [z[0], -z[1]], t = Math.atan2(z[1], z[0]), t2 = Math.atan2(sym[1], sym[0]), ok = claim ? near(t2, -t) : near(t2, t);
      return tf({ s: `Pour ${M(`z=${cx(...z)}`)}, on a ${M(claim ? '\\arg\\bar{z}\\equiv-\\arg z\\ [2\\pi]' : '\\arg\\bar{z}\\equiv\\arg z\\ [2\\pi]')}.`, v: ok, c: () => ok === (claim && (Math.abs(((t2 + t + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI) < 1e-9)), j: ok ? `${M('\\bar{z}')} est le symétrique de ${M('z')} par rapport à l’axe des réels : ${M('\\arg\\bar{z}=-\\arg z')}.` : `${M('\\bar{z}')} est le symétrique de ${M('z')} par rapport à l’axe des réels : son argument est l’opposé, pas le même (sauf si ${M('z')} est réel).` });
    } },

  { id: 'e2-geo-error', cls: C, chapter: 'expertes-02', domain: 'complexes', skill: 'Trouver l’erreur sur un module ou un argument', fast: false,
    make(r, level) {
      if (r.next() < 0.5) {
        const k = r.int(1, 5), [sx, sy, nn] = r.pick([[-1, 1, 3], [-1, -1, -3]]), z = [sx * k, sy * k], naive = -sx * sy > 0 ? -1 : 1;
        return spot(`Un élève cherche un argument de ${M(`z=${cx(...z)}`)}.`, [M(`|z|=${k}\\sqrt{2}`), M(`\\tan\\theta=\\dfrac{\\text{Im}\\,z}{\\text{Re}\\,z}=\\dfrac{${z[1]}}{${par(z[0])}}=${sx * sy}`), M(`\\theta=${sx * sy > 0 ? '\\dfrac{\\pi}{4}' : '-\\dfrac{\\pi}{4}'}`)], 2,
          `${M('\\tan\\theta')} ne détermine ${M('\\theta')} qu’à ${M('\\pi')} près : ici ${M('\\text{Re}\\,z<0')} impose le deuxième ou le troisième quadrant.`, M(`\\cos\\theta=\\dfrac{${z[0]}}{${k}\\sqrt{2}}<0`), M(`\\theta=${thetaTex(nn * 3)}`), () => Math.cos(nn * Math.PI / 4) * z[0] > 0 && Math.sin(nn * Math.PI / 4) * z[1] > 0 && naive !== 0);
      }
      const z = cz(r, -7, 7), n = abs2(z), [a, b] = z;
      if (Math.abs(a) + Math.abs(b) === Math.round(Math.sqrt(n))) return this.make(r, level);
      return spot(`Un élève calcule le module de ${M(`z=${cx(...z)}`)}.`, [M(`|z|=\\sqrt{(${a})^{2}-(${b})^{2}}`), M(`|z|=\\sqrt{${a * a - b * b}}`)], 0, `${M('|z|^{2}=a^{2}+b^{2}')} : on additionne les carrés (le conjugué donne ${M('z\\bar{z}=a^{2}+b^{2}')}).`, M(`|z|=\\sqrt{(${a})^{2}+(${b})^{2}}`), M(`|z|=\\sqrt{${n}}`), () => Math.abs(Math.hypot(a, b) ** 2 - n) < 1e-9 && a * a - b * b !== n);
    } },

  { id: 'e2-geo-affix', cls: C, chapter: 'expertes-02', domain: 'complexes', skill: 'Affixes de vecteurs, milieux, parallélogrammes', fast: false,
    make(r, level) {
      const A = cz(r, -5, 5), B = cz(r, -5, 5), Cc = cz(r, -5, 5), vAB = csub(B, A), D = csub(cadd(A, Cc), B);
      if (ceq(A, B) || ceq(B, Cc) || ceq(A, Cc)) return this.make(r, level);
      const mid = [F(A[0] + B[0], 2), F(A[1] + B[1], 2)];
      return { q: `Dans le plan complexe, ${M('A')}, ${M('B')} et ${M('C')} ont pour affixes ${M(`z_A=${cx(...A)}`)}, ${M(`z_B=${cx(...B)}`)} et ${M(`z_C=${cx(...Cc)}`)}. Déterminer l’affixe du vecteur ${M('\\overrightarrow{AB}')}, celle du milieu ${M('I')} de ${M('[AB]')}, puis celle du point ${M('D')} tel que ${M('ABCD')} soit un parallélogramme.`,
        a: `${M(`z_{\\overrightarrow{AB}}=z_B-z_A=${cx(...vAB)}`)} ; ${M(`z_I=\\dfrac{z_A+z_B}{2}=${cxF(...mid)}`)} ; ${M('\\overrightarrow{AB}=\\overrightarrow{DC}')} donne ${M(`z_D=z_A+z_C-z_B=${cx(...D)}`)}.`,
        ok: () => ceq(csub(B, A), vAB) && eq(mul(mid[0], F(2)), F(A[0] + B[0])) && eq(mul(mid[1], F(2)), F(A[1] + B[1])) && ceq(csub(B, A), csub(Cc, D)) && ceq(cadd(D, csub(B, A)), Cc) };
    } },

  { id: 'e2-geo-set', cls: C, chapter: 'expertes-02', domain: 'complexes', skill: 'Ensembles de points définis par un module', fast: false,
    make(r, level) {
      const A = cz(r, -4, 4), kind = r.pick(level === 1 ? ['circle'] : ['circle', 'disk', 'bisector']), rad = r.int(1, 6);
      const pts = []; for (let x = -12; x <= 12; x++) for (let y = -12; y <= 12; y++) pts.push([x, y]);
      if (kind === 'circle' || kind === 'disk') { const strict = kind === 'disk', f = ([x, y]) => (strict ? Math.hypot(x - A[0], y - A[1]) <= rad + 1e-9 : Math.abs(Math.hypot(x - A[0], y - A[1]) - rad) < 1e-9), g = ([x, y]) => (strict ? (x - A[0]) ** 2 + (y - A[1]) ** 2 <= rad * rad : (x - A[0]) ** 2 + (y - A[1]) ** 2 === rad * rad);
        return { q: `Déterminer l’ensemble des points ${M('M')} d’affixe ${M('z')} tels que ${M(`|z${A[0] === 0 && A[1] === 0 ? '' : `-(${cx(...A)})`}|${strict ? '\\leqslant ' : '='}${rad}`)}.`, a: `${M(`|z-z_A|=AM`)} avec ${M(`A${`(${A[0]}\\,;\\,${A[1]})`}`)} : c’est ${strict ? 'le disque fermé' : 'le cercle'} de centre ${M('A')} et de rayon ${M(rad)}.`, ok: () => pts.every((p) => f(p) === g(p)) };
      }
      const B = cz(r, -4, 4);
      if (ceq(A, B)) return this.make(r, level);
      const mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], f = ([x, y]) => Math.abs(Math.hypot(x - A[0], y - A[1]) - Math.hypot(x - B[0], y - B[1])) < 1e-9, g = ([x, y]) => (B[0] - A[0]) * (x - mid[0]) + (B[1] - A[1]) * (y - mid[1]) === 0;
      return { q: `Déterminer l’ensemble des points ${M('M')} d’affixe ${M('z')} tels que ${M(`|z-(${cx(...A)})|=|z-(${cx(...B)})|`)}.`, a: `${M('AM=BM')} : ${M('M')} est équidistant de ${M('A')} et ${M('B')}, donc l’ensemble est la médiatrice du segment ${M('[AB]')} (la droite perpendiculaire à ${M('(AB)')} passant par le milieu ${M(`I\\left(${mid[0]}\\,;\\,${mid[1]}\\right)`)}).`, ok: () => pts.every((p) => f(p) === g(p)) };
    } },

  { id: 'e2-geo-modarg', cls: C, chapter: 'expertes-02', domain: 'complexes', skill: 'Module d’un produit, d’un quotient et d’une puissance', fast: false,
    make(r, level) {
      const z1 = cz(r, -5, 5), z2 = cz(r, -5, 5), n = r.int(2, 4), [a, b] = z1, [c, d] = z2, n1 = abs2(z1), n2 = abs2(z2), pr = abs2(cmul(z1, z2));
      return { q: `Soit ${M(`z_1=${cx(...z1)}`)} et ${M(`z_2=${cx(...z2)}`)}. Calculer ${M('|z_1|^{2}')}, ${M('|z_2|^{2}')}, puis ${M('|z_1z_2|')} et ${M(`|z_1^{${n}}|`)} sous forme exacte, en justifiant avec les propriétés du module.`,
        a: `${M(`|z_1|^{2}=${n1}`)} et ${M(`|z_2|^{2}=${n2}`)}. ${M(`|z_1z_2|=|z_1|\\,|z_2|=\\sqrt{${n1}\\times ${n2}}=\\sqrt{${n1 * n2}}`)}${sqrtTex(n1 * n2) === `\\sqrt{${n1 * n2}}` ? '' : ` ${M(`=${sqrtTex(n1 * n2)}`)}`}. ${M(`|z_1^{${n}}|=|z_1|^{${n}}=\\left(\\sqrt{${n1}}\\right)^{${n}}=${sqrtTex(n1 ** n)}`)}.`.replace('}}}}', '}}}'),
        ok: () => pr === n1 * n2 && abs2(cmul(z1, z2)) === abs2(cmul(z2, z1)) && Math.abs(Math.hypot(...cpow(z1, n)) - Math.hypot(a, b) ** n) < 1e-6 * Math.max(1, Math.hypot(a, b) ** n) && (c !== undefined && d !== undefined) };
    } },

  { id: 'e2-geo-sym', cls: C, chapter: 'expertes-02', domain: 'complexes', skill: 'Symétriques de points dans le plan complexe', fast: true,
    make(r, level) {
      const z = cz(r, -7, 7), [a, b] = z, which = r.pick(['réels', 'imaginaires', 'origine', 'bissectrice']), res = { réels: [a, -b], imaginaires: [-a, b], origine: [-a, -b], bissectrice: [b, a] }[which];
      const desc = { réels: 'par rapport à l’axe des réels', imaginaires: 'par rapport à l’axe des imaginaires purs', origine: 'par rapport à l’origine', bissectrice: 'par rapport à la droite d’équation ' + M('y=x') }[which];
      const formula = { réels: '\\bar{z}', imaginaires: '-\\bar{z}', origine: '-z', bissectrice: 'i\\bar{z}' }[which];
      return { q: `Quelle est l’affixe du symétrique du point ${M(`M(${cx(...z)})`)} ${desc} ?`, a: `${M(`z'=${formula}=${cx(...res)}`)}.`,
        ok: () => { const ref = which === 'réels' ? conj(z) : which === 'imaginaires' ? [-a, b] : which === 'origine' ? cmul([-1, 0], z) : cmul([0, 1], conj(z)); const mid = [(a + res[0]) / 2, (b + res[1]) / 2]; return ceq(ref, res) && (which !== 'bissectrice' || (mid[0] === mid[1])) && (which !== 'réels' || mid[1] === 0) && (which !== 'imaginaires' || mid[0] === 0) && (which !== 'origine' || (mid[0] === 0 && mid[1] === 0)); } };
    } },

  // ============================ 03 Trigonométrie et forme exponentielle ============================
  { id: 'e2-trig-qcm', cls: C, chapter: 'expertes-03', domain: 'complexes', skill: 'QCM : de la forme exponentielle à la forme algébrique', fast: true,
    make(r, level) {
      const mode = r.pick(['2', 'r2']), us = mode === '2' ? [2, 4, 6, 8, 10, 14, 16, 18, 20, 22] : [3, 9, 15, 21], u = r.pick(us), k = r.int(1, 4), r_ = mode === '2' ? 2 * k : k * Math.SQRT2, rTex = mode === '2' ? `${2 * k}` : `${k === 1 ? '' : k}\\sqrt{2}`;
      const good = algExp(u, mode, k), swapU = u === 6 || u === 18 ? (u === 6 ? 18 : 6) : 12 - u, other = (uu) => { try { return algExp(uu, mode, k); } catch (e) { return null; } };
      const wrongs = [[algExp(u, mode, k), '']].slice(0, 0);
      const swap = { re: good.im, im: good.re }, neg = { re: { t: good.re.t.startsWith('-') ? good.re.t.slice(1) : good.re.n === 0 ? '0' : `-${good.re.t}`, n: -good.re.n }, im: good.im };
      const mk = (re, im) => ({ re, im, t: `${re.n === 0 ? '' : re.t}${im.n === 0 ? '' : `${im.t.startsWith('-') ? '-' : re.n === 0 ? '' : '+'}${im.t.replace(/^-/, '') === '1' ? '' : im.t.replace(/^-/, '')}i`}` || '0' });
      const cands = [[mk(swap.re, swap.im), 'échange le cosinus et le sinus.'], [mk(neg.re, neg.im), 'se trompe de signe pour la partie réelle.'], [mk(good.im, good.re.n === 0 ? good.re : { t: good.re.t.startsWith('-') ? good.re.t.slice(1) : '-' + good.re.t, n: -good.re.n }), 'tourne l’angle de ' + M('\\dfrac{\\pi}{2}') + ' par erreur.'], [mk({ t: good.re.t, n: good.re.n / 1 }, { t: good.im.t.startsWith('-') ? good.im.t.slice(1) : good.im.n === 0 ? '0' : '-' + good.im.t, n: -good.im.n }), 'prend le conjugué (angle opposé).']];
      void wrongs; void swapU; void other; void r_;
      return qcmNum(r, `L’écriture algébrique de ${M(`${rTex}\\,\\mathrm{e}^{i${thetaTex(u)}}`)} est :`, [good, `${M(`r\\cos\\theta=${good.re.t}`)} et ${M(`r\\sin\\theta=${good.im.t}`)}.`], cands, (o) => M(o.t || '0'),
        (o) => Math.abs(o.re.n - r_ * Math.cos((u * Math.PI) / 12)) < 1e-9 && Math.abs(o.im.n - r_ * Math.sin((u * Math.PI) / 12)) < 1e-9);
    } },

  { id: 'e2-trig-tf', cls: C, chapter: 'expertes-03', domain: 'complexes', skill: 'Vrai ou faux sur la forme exponentielle', fast: false,
    make(r, level) {
      const kind = r.pick(['pow', 'euler', 'uniq']);
      if (kind === 'pow') { const m = r.pick([2, 3, 4, 6]), n = r.int(2, 12), claimIdx = r.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]), re = Math.cos((n * Math.PI) / m), im = Math.sin((n * Math.PI) / m), ok = Math.abs(re - claimIdx[0]) < 1e-9 && Math.abs(im - claimIdx[1]) < 1e-9;
        return tf({ s: `On a ${M(`\\left(\\mathrm{e}^{i\\pi/${m}}\\right)^{${n}}=${cx(...claimIdx)}`)}.`, v: ok, c: () => { let p = [1, 0]; const base = [Math.cos(Math.PI / m), Math.sin(Math.PI / m)]; for (let i = 0; i < n; i++) p = [p[0] * base[0] - p[1] * base[1], p[0] * base[1] + p[1] * base[0]]; return (Math.abs(p[0] - claimIdx[0]) < 1e-9 && Math.abs(p[1] - claimIdx[1]) < 1e-9) === ok; },
          j: `${M(`\\left(\\mathrm{e}^{i\\pi/${m}}\\right)^{${n}}=\\mathrm{e}^{i${thetaTex((12 * n) / m)}}=${expTex((12 * n) / m)}`)}${ok ? '.' : `, et non ${M(cx(...claimIdx))}.`}` }); }
      if (kind === 'euler') { const claim = r.pick([-1, 1, 0]), ok = claim === -1; return tf({ s: `On a ${M(`\\mathrm{e}^{i\\pi}=${claim}`)}.`, v: ok, c: () => (Math.abs(Math.cos(Math.PI) - claim) < 1e-9 && Math.abs(Math.sin(Math.PI)) < 1e-9) === ok, j: `${M('\\mathrm{e}^{i\\pi}=\\cos\\pi+i\\sin\\pi=-1')}${ok ? ' (identité d’Euler).' : `, et non ${M(claim)}.`}` }); }
      const t = r.pick([2, 3, 4, 6]), ok = r.next() < 0.5, other = ok ? 2 * Math.PI : 2 * Math.PI * 0 + Math.PI;
      return tf({ s: `Pour tous réels ${M('\\theta')} et ${M("\\theta'")}, si ${M("\\mathrm{e}^{i\\theta}=\\mathrm{e}^{i\\theta'}")}, alors ${M("\\theta=\\theta'")}.`, v: false, c: () => Math.abs(Math.cos(2 * Math.PI) - Math.cos(0)) < 1e-12 && 2 * Math.PI !== 0, j: `Contre-exemple : ${M('\\mathrm{e}^{i2\\pi}=1=\\mathrm{e}^{i0}')} alors que ${M('2\\pi\\neq 0')} : deux arguments égaux seulement modulo ${M('2\\pi')}.` });
    } },

  { id: 'e2-trig-error', cls: C, chapter: 'expertes-03', domain: 'complexes', skill: 'Trouver l’erreur sur une puissance en forme exponentielle', fast: false,
    make(r, level) {
      const mode = r.pick(['2', 'r2']), k = r.int(1, 9), u = mode === '2' ? r.pick([2, 4, 8, 10, 14, 16, 20, 22]) : r.pick([3, 9, 15, 21]), n = mode === '2' ? r.int(2, 6) : 2 * r.int(1, 3), z = algExp(u, mode, k);
      const modTex = mode === '2' ? `${2 * k}` : `${k === 1 ? '' : k}\\sqrt{2}`, modN = mode === '2' ? 2 * k : k * Math.SQRT2, rn = Math.round(modN ** n), nu = u * n;
      return spot(`Un élève calcule ${M(`z^{${n}}`)} pour ${M(`z=${z.t}`)}.`, [M(`z=${modTex}\\,\\mathrm{e}^{i${thetaTex(u)}}`), M(`z^{${n}}=${modTex}\\,\\mathrm{e}^{i${thetaTex(nu)}}`)], 1, `la formule de Moivre élève aussi le module à la puissance ${M(n)} : ${M(`\\left(${modTex}\\right)^{${n}}=${rn}`)}.`, M(`z^{${n}}=\\left(${modTex}\\right)^{${n}}\\mathrm{e}^{i${thetaTex(nu)}}=${rn}\\,\\mathrm{e}^{i${thetaTex(nu)}}`), M(`z^{${n}}=${rn}\\,\\mathrm{e}^{i${thetaTex(nu)}}`),
        () => { let p = [1, 0]; for (let i = 0; i < n; i++) p = [p[0] * z.re.n - p[1] * z.im.n, p[0] * z.im.n + p[1] * z.re.n]; const th = (normU(nu) * Math.PI) / 12; return Math.abs(p[0] - rn * Math.cos(th)) < 1e-6 && Math.abs(p[1] - rn * Math.sin(th)) < 1e-6 && rn !== 1 && Math.abs(Math.hypot(...p) - rn) < 1e-6; });
    } },

  { id: 'e2-trig-conv', cls: C, chapter: 'expertes-03', domain: 'complexes', skill: 'Produit et quotient en forme exponentielle', fast: false,
    make(r, level) {
      const us = [2, 3, 4, 6, 8, 9, 10, 12, -2, -3, -4, -6], u1 = r.pick(us), u2 = r.pick(us), r1 = r.int(1, 5), r2 = r.int(1, 4), prod = r.next() < 0.5;
      const rr = prod ? r1 * r2 : null, num = r1 / r2, uu = prod ? u1 + u2 : u1 - u2;
      const rTexQ = F(r1, r2);
      const z1 = [r1 * Math.cos((u1 * Math.PI) / 12), r1 * Math.sin((u1 * Math.PI) / 12)], z2 = [r2 * Math.cos((u2 * Math.PI) / 12), r2 * Math.sin((u2 * Math.PI) / 12)];
      return { q: `Soit ${M(`z_1=${r1}\\,\\mathrm{e}^{i${thetaTex(u1)}}`)} et ${M(`z_2=${r2}\\,\\mathrm{e}^{i${thetaTex(u2)}}`)}. Écrire ${M(prod ? 'z_1z_2' : '\\dfrac{z_1}{z_2}')} sous forme exponentielle (avec un argument dans ${M(']-\\pi\\,;\\,\\pi]')}).`,
        a: `${prod ? M(`z_1z_2=${r1}\\times ${r2}\\,\\mathrm{e}^{i(${thetaTex(u1)}+${normU(u2) < 0 ? `(${thetaTex(u2)})` : thetaTex(u2)})}`) : M(`\\dfrac{z_1}{z_2}=\\dfrac{${r1}}{${r2}}\\,\\mathrm{e}^{i(${thetaTex(u1)}-${normU(u2) < 0 ? `(${thetaTex(u2)})` : thetaTex(u2)})}`)} ${M(`=${prod ? rr : fracTex(rTexQ)}\\,\\mathrm{e}^{i${thetaTex(uu)}}`)}.`,
        ok: () => { const w = prod ? [z1[0] * z2[0] - z1[1] * z2[1], z1[0] * z2[1] + z1[1] * z2[0]] : (() => { const n2 = z2[0] ** 2 + z2[1] ** 2; return [(z1[0] * z2[0] + z1[1] * z2[1]) / n2, (z1[1] * z2[0] - z1[0] * z2[1]) / n2]; })(); const mod = prod ? rr : num, th = (normU(uu) * Math.PI) / 12; return Math.abs(w[0] - mod * Math.cos(th)) < 1e-9 && Math.abs(w[1] - mod * Math.sin(th)) < 1e-9; } };
    } },

  { id: 'e2-trig-power', cls: C, chapter: 'expertes-03', domain: 'complexes', skill: 'Puissance par la forme exponentielle (formule de Moivre)', fast: false,
    make(r, level) {
      const fam = r.pick(level === 1 ? ['s3', 'c3'] : ['s3', 'c3', 'c1']), kk = r.int(1, 12), base = { s3: { z: [3 ** 0.5, 1], tex: '\\sqrt{3}+i', u: 2, mod: 2, mt: '2' }, c3: { z: [1, 3 ** 0.5], tex: '1+i\\sqrt{3}', u: 4, mod: 2, mt: '2' }, c1: { z: [1, 1], tex: '1+i', u: 3, mod: Math.SQRT2, mt: '\\sqrt{2}' } }[fam];
      const n = fam === 'c1' ? 2 * r.int(1, kk === 1 ? 6 : 3) : r.int(2, kk === 1 ? 12 : kk <= 3 ? 7 : 5), nu = base.u * n, modn = Math.round((kk * base.mod) ** n), thetaNorm = thetaTex(nu);
      const ex = fam === 'c1' ? algExp(nu, 'k', modn) : algExp(nu, '2', modn / 2), zTex = kk === 1 ? base.tex : `${kk}\\left(${base.tex}\\right)`, mTex = kk === 1 ? base.mt : fam === 'c1' ? `${kk}\\sqrt{2}` : `${2 * kk}`;
      return { q: `Calculer ${M(`\\left(${zTex}\\right)^{${n}}`)} à l’aide de la forme exponentielle, sous forme exponentielle puis algébrique.`, a: `${M(`${zTex}=${mTex}\\,\\mathrm{e}^{i${thetaTex(base.u)}}`)} donc ${M(`\\left(${zTex}\\right)^{${n}}=\\left(${mTex}\\right)^{${n}}\\mathrm{e}^{i${thetaNorm}}=${modn}\\,\\mathrm{e}^{i${thetaNorm}}`)}, soit ${M(ex.t)}.`,
        ok: () => { let p = [1, 0]; const z = [kk * base.z[0], kk * base.z[1]]; for (let i = 0; i < n; i++) p = [p[0] * z[0] - p[1] * z[1], p[0] * z[1] + p[1] * z[0]]; return Math.abs(p[0] - ex.re.n) < 1e-6 * modn && Math.abs(p[1] - ex.im.n) < 1e-6 * modn && Math.abs(Math.hypot(...p) - modn) < 1e-6 * modn; } };
    } },
];
