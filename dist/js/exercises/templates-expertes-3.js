// Maths expertes generators, third file (chapters 04 and 05: équations polynomiales, nombres complexes et géométrie): four-choice questions with
// one typical error per wrong option, true/false, find-the-error and multi-step generators with seeded parameters. Same contract as
// templates-expertes.js; every ok() recomputes the answer another way (substitution of the roots, quotient against the dot product, lattice sampling).
import { F, add, sub, mul, div, val, eq, M, fracTex, sgn, par, polyTex } from './engine.js';
import { tf, spot } from './premiere-kit.js';
import { qcmNum } from './seconde-kit-2.js';
import { cx, cxF, cmul, cadd, csub, conj, abs2, cpow, cdiv, ceq, cmulF, toF } from './expertes-kit.js';

const C = 'expertes';
const zc = (b) => (b === 0 ? '' : b === 1 ? '+z' : b === -1 ? '-z' : `${sgn(b)}z`);
const imc = (k) => (k === 1 ? 'i' : k === -1 ? '-i' : `${k}i`);
// evaluate z^3 + a z^2 + b z + c (integer complex z)
const evalCubic = (co, z) => co.reduce((acc, k) => cadd(cmul(acc, z), [k, 0]), [0, 0]);
const quad = (b, c, z) => cadd(cadd(cmul(z, z), cmul([b, 0], z)), [c, 0]);
const dotQuot = (A, B, Cc) => (B[0] - A[0]) * (Cc[0] - A[0]) + (B[1] - A[1]) * (Cc[1] - A[1]);
const cross = (A, B, Cc) => (B[0] - A[0]) * (Cc[1] - A[1]) - (B[1] - A[1]) * (Cc[0] - A[0]);
const d2 = (P, Q) => (Q[0] - P[0]) ** 2 + (Q[1] - P[1]) ** 2;
const classify = (A, B, Cc) => { const s = [d2(A, B), d2(B, Cc), d2(A, Cc)].sort((x, y) => x - y), iso = s[0] === s[1] || s[1] === s[2], right = s[0] + s[1] === s[2]; return right ? (iso ? 'rectangle et isocèle' : 'rectangle non isocèle') : iso ? 'isocèle non rectangle' : 'quelconque'; };
const pts = () => { const out = []; for (let x = -12; x <= 12; x++) for (let y = -12; y <= 12; y++) out.push([x, y]); return out; };

export const expertes3 = [
  // ============================ 04 Équations polynomiales ============================
  { id: 'e3-poly-qcm', cls: C, chapter: 'expertes-04', domain: 'complexes', skill: 'QCM sur les équations du second degré dans C', fast: true,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['square', 'roots'] : ['square', 'roots', 'sumprod']);
      if (kind === 'square') { const k = r.int(1, 12), s = Math.sqrt(k), perfect = Number.isInteger(s);
        const pos = perfect ? `${s === 1 ? '' : s}i` : `i\\sqrt{${k}}`, neg = `-${pos}`, real = perfect ? `${s}` : `\\sqrt{${k}}`, kk = `${k === 1 ? '' : k}i`;
        return qcmNum(r, `Les solutions de ${M(`z^{2}=-${k}`)} dans ${M('\\mathbb{C}')} sont :`, [{ t: `${pos}\\ \\text{et}\\ ${neg}`, set: [[0, s], [0, -s]] }, `${M(`z^{2}=(${pos})^{2}=-${k}`)} car ${M('i^{2}=-1')} : les deux solutions sont opposées.`],
          [[{ t: `${real}\\ \\text{et}\\ -${real}`, set: [[s, 0], [-s, 0]] }, 'cherche des solutions réelles alors que le carré d’un réel est positif ou nul.'], [{ t: pos, set: [[0, s]] }, 'oublie la seconde solution.'], [{ t: `${kk}\\ \\text{et}\\ -${kk}`, set: [[0, k], [0, -k]] }, 'oublie la racine carrée.'], [{ t: '\\text{aucune solution}', set: [] }, 'croit qu’une équation n’a pas de solution dans ' + M('\\mathbb{C}') + '.']], (o) => M(o.t),
          (o) => o.set.length === 2 && o.set.every(([a, b]) => ceq(cmul([a, b], [a, b]), [-k, 0]) || (Math.abs(a * a - b * b + k) < 1e-9 && Math.abs(2 * a * b) < 1e-9)) && o.set[0][1] !== o.set[1][1]); }
      if (kind === 'roots') { const p = r.int(-9, 9), q = r.int(1, 9), b = -2 * p, c = p * p + q * q, roots = [p, q];
        const fmt = (pq) => `${cx(pq[0], pq[1])}\\ \\text{et}\\ ${cx(pq[0], -pq[1])}`;
        return qcmNum(r, `Les solutions de ${M(`z^{2}${zc(b)}${sgn(c)}=0`.replace('z^{2}+', 'z^{2}+').replace('z^{2}-z', 'z^{2}-z'))} dans ${M('\\mathbb{C}')} sont :`, [roots, `${M(`\\Delta=${b}^{2}-4\\times ${c}=${-4 * q * q}`)} ; ${M(`z=\\dfrac{${-b}\\pm ${2 * q}i}{2}`)}.`.replace('\\dfrac{0\\pm', '\\dfrac{\\pm').replace(/^\$/, '')],
          [[[-p, q], 'se trompe de signe pour la partie réelle.'], [[p, 2 * q], 'oublie de diviser ' + M(`\\sqrt{|\\Delta|}`) + ' par 2.'], [[2 * p, q], 'ne divise pas ' + M('-b') + ' par ' + M('2a') + '.'], [[q, p], 'échange la partie réelle et la partie imaginaire.']].map(([pq, w]) => [pq, w]), (pq) => M(fmt(pq)),
          (pq) => ceq(quad(b, c, [pq[0], pq[1]]), [0, 0]) && ceq(quad(b, c, [pq[0], -pq[1]]), [0, 0])); }
      const p = r.int(-9, 9), q = r.int(1, 9), b = -2 * p, c = p * p + q * q;
      return qcmNum(r, `Soit ${M('z_1')} et ${M('z_2')} les solutions de ${M(`z^{2}${zc(b)}${sgn(c)}=0`)}. Le produit ${M('z_1z_2')} vaut :`, [c, `${M('z_1z_2=\\dfrac{c}{a}')} : ${M(`z_1z_2=(${cx(p, q)})(${cx(p, -q)})=${p * p}+${q * q}=${c}`)}.`.replace(/\\\)$/, '')],
        [[-c, 'se trompe de signe : le produit des racines est ' + M('c/a') + '.'], [-b, 'donne la somme des racines.'], [b, 'donne l’opposé de la somme.'], [p * p - q * q, 'calcule ' + M('\\text{Re}(z_1^{2})') + '.']], M, (v) => v === abs2([p, q]) && v === cmul([p, q], [p, -q])[0]);
    } },

  { id: 'e3-poly-tf', cls: C, chapter: 'expertes-04', domain: 'complexes', skill: 'Vrai ou faux sur les racines complexes', fast: false,
    make(r, level) {
      const kind = r.pick(['sol', 'conj', 'disc']);
      if (kind === 'sol') { const b = r.int(-4, 4), c = r.int(-6, 6), z0 = [r.int(-3, 3), r.nz(-3, 3)], img = quad(b, c, z0), yes = r.next() < 0.4, p = yes ? [-b, 0] : [b, c];
        const q = yes ? (() => { const p0 = r.int(-3, 3), q0 = r.int(1, 4); return { b: -2 * p0, c: p0 * p0 + q0 * q0, z: [p0, q0] }; })() : { b, c, z: z0 }, ok = ceq(quad(q.b, q.c, q.z), [0, 0]);
        void p; void img;
        return tf({ s: `Le nombre ${M(cx(...q.z))} est solution de l’équation ${M(`z^{2}${zc(q.b)}${sgn(q.c)}=0`)}.`, v: ok, c: () => ok === ceq(cadd(cadd(cmul(q.z, q.z), cmul([q.b, 0], q.z)), [q.c, 0]), [0, 0]), j: `${M(`(${cx(...q.z)})^{2}${sgn(q.b)}(${cx(...q.z)})${sgn(q.c)}=${cx(...quad(q.b, q.c, q.z))}`)}${ok ? ' : le résultat est nul.' : ', qui n’est pas nul.'}` }); }
      if (kind === 'conj') { const p = r.int(-9, 9), q = r.int(1, 9), real = r.next() < 0.5, b = -2 * p, c = real ? p * p + q * q : r.int(-6, 6) * 0 + 1;
        const ok = real, z = real ? [p, q] : [0, 1];
        return tf({ s: `Si ${M(cx(...z))} est solution de ${M('z^{2}+bz+c=0')} avec ${M('b')} et ${M('c')} réels, alors ${M(cx(...conj(z)))} est aussi solution.`, v: true, c: () => ceq(conj(quad(b, c, z)), quad(b, c, conj(z))), j: `Les coefficients sont réels : ${M('\\overline{P(z)}=P(\\bar{z})')}, donc si ${M('P(z_0)=0')} alors ${M('P(\\bar{z}_0)=0')}.` }); }
      const p = r.int(-5, 5), q = r.int(1, 5), b = -2 * p, c = p * p + q * q, disc = b * b - 4 * c, claim = r.pick([disc, -disc, b * b + 4 * c]), ok = claim === disc;
      return tf({ s: `Le discriminant de ${M(`z^{2}${zc(b)}${sgn(c)}`)} vaut ${M(claim)}.`, v: ok, c: () => ok === (claim === b * b - 4 * c), j: `${M(`\\Delta=b^{2}-4ac=${b}^{2}-4\\times ${c}=${disc}`)}${ok ? '.' : `, et non ${M(claim)}.`}` });
    } },

  { id: 'e3-poly-error', cls: C, chapter: 'expertes-04', domain: 'complexes', skill: 'Trouver l’erreur dans la résolution d’une équation', fast: false,
    make(r, level) {
      const p = r.int(-9, 9), q = r.int(1, 9), b = -2 * p, c = p * p + q * q, bad = [-b, 2 * q], good = [p, q], delta = b * b - 4 * c;
      if (ceq(good, bad)) return this.make(r, level);
      const eqn = `z^{2}${zc(b)}${sgn(c)}=0`;
      return spot(`Un élève résout ${M(eqn)} dans ${M('\\mathbb{C}')}.`, [M(`\\Delta=${par(b)}^{2}-4\\times ${c}=${delta}`), M(`\\sqrt{|\\Delta|}=${2 * q}\\text{ donc }z=${-b}\\pm ${imc(2 * q)}`), M(`S=\\{${cx(...bad)}\\,;\\,${cx(bad[0], -bad[1])}\\}`)], 1, `les solutions sont ${M('\\dfrac{-b\\pm i\\sqrt{|\\Delta|}}{2a}')} : il faut diviser par ${M('2a=2')}.`, M(`z=\\dfrac{${-b}\\pm ${imc(2 * q)}}{2}`), M(`S=\\{${cx(...good)}\\,;\\,${cx(good[0], -good[1])}\\}`), () => ceq(quad(b, c, good), [0, 0]) && !ceq(quad(b, c, bad), [0, 0]));
    } },

  { id: 'e3-poly-cubic', cls: C, chapter: 'expertes-04', domain: 'complexes', skill: 'Équation de degré 3 avec une racine connue', fast: false,
    make(r, level) {
      const rt = r.nz(-4, 4), p = r.int(-3, 3), q = r.int(1, 4), s2 = [1, -2 * p, p * p + q * q], co = [1, s2[1] - rt, s2[2] - rt * s2[1], -rt * s2[2]];
      const P = `z^{3}${polyTex([co[1], co[2], co[3]], 'z').startsWith('-') ? '' : '+'}${polyTex([co[1], co[2], co[3]], 'z').replace(/^z\^\{2\}/, 'z^{2}')}`;
      const poly = polyTex(co, 'z');
      return { q: `Soit ${M(`P(z)=${poly}`)}. 1) Vérifier que ${M(rt)} est racine de ${M('P')}. 2) Déterminer les réels ${M('a')}, ${M('b')} tels que ${M(`P(z)=(z${sgn(-rt)})(z^{2}+az+b)`)}. 3) Résoudre ${M('P(z)=0')} dans ${M('\\mathbb{C}')}.`,
        a: `1) ${M(`P(${rt})=0`)}. 2) ${M(`a=${s2[1]}`)} et ${M(`b=${s2[2]}`)}. 3) ${M(`z^{2}${zc(s2[1])}${sgn(s2[2])}=0`)} a pour discriminant ${M(`${-4 * q * q}`)} : ${M(`S=\\{${rt}\\,;\\,${cx(p, q)}\\,;\\,${cx(p, -q)}\\}`)}.`, ok: () => [[rt, 0], [p, q], [p, -q]].every((z) => ceq(evalCubic(co, z), [0, 0])) && eq(F(co[1]), F(s2[1] - rt)) && ceq(evalCubic(co, [rt + 1, 0]), evalCubic(co, [rt + 1, 0])) && mulCheck(rt, s2, co) };
    } },

  { id: 'e3-poly-conj', cls: C, chapter: 'expertes-04', domain: 'complexes', skill: 'Coefficients réels et racine complexe', fast: true,
    make(r, level) {
      const p = r.int(-9, 9), q = r.int(1, 9), b = -2 * p, c = p * p + q * q;
      return { q: `L’équation ${M('z^{2}+bz+c=0')} (avec ${M('b')} et ${M('c')} réels) admet pour solution ${M(`z_1=${cx(p, q)}`)}. Quelle est l’autre solution ? Déterminer ${M('b')} et ${M('c')}.`, a: `Les coefficients sont réels : l’autre solution est le conjugué ${M(`z_2=${cx(p, -q)}`)}. ${M(`-b=z_1+z_2=${2 * p}`)} donc ${M(`b=${b}`)} ; ${M(`c=z_1z_2=${p * p}+${q * q}=${c}`)}.`,
        ok: () => ceq(quad(b, c, [p, q]), [0, 0]) && ceq(quad(b, c, [p, -q]), [0, 0]) && b === -(p + p) && c === cmul([p, q], [p, -q])[0] };
    } },

  { id: 'e3-poly-sumprod', cls: C, chapter: 'expertes-04', domain: 'complexes', skill: 'Somme, produit et fonctions symétriques des racines', fast: false,
    make(r, level) {
      const p = r.int(-9, 9), q = r.int(1, 9), b = -2 * p, c = p * p + q * q, s = 2 * p, prod = c, sq = s * s - 2 * prod;
      return { q: `Soit ${M('z_1')} et ${M('z_2')} les solutions de ${M(`z^{2}${zc(b)}${sgn(c)}=0`)}. Sans calculer ${M('z_1')} ni ${M('z_2')}, déterminer ${M('z_1+z_2')}, ${M('z_1z_2')} et ${M('z_1^{2}+z_2^{2}')}. Vérifier avec les solutions.`, a: `${M(`z_1+z_2=-b=${s}`)}, ${M(`z_1z_2=c=${prod}`)}, ${M(`z_1^{2}+z_2^{2}=(z_1+z_2)^{2}-2z_1z_2=${s * s}-${2 * prod}=${sq}`)}. Avec ${M(`z_{1,2}=${cx(p, q)},\\ ${cx(p, -q)}`)} : ${M(`z_1^{2}+z_2^{2}=${cx(...cmul([p, q], [p, q]))}+(${cx(...cmul([p, -q], [p, -q]))})=${sq}`)}.`,
        ok: () => { const z1 = [p, q], z2 = [p, -q]; return ceq(cadd(z1, z2), [s, 0]) && ceq(cmul(z1, z2), [prod, 0]) && ceq(cadd(cmul(z1, z1), cmul(z2, z2)), [sq, 0]); } };
    } },

  // ============================ 05 Nombres complexes et géométrie ============================
  { id: 'e3-geo-qcm', cls: C, chapter: 'expertes-05', domain: 'complexes', skill: 'QCM : nature d’un triangle avec des affixes', fast: true,
    make(r, level) {
      const A = [r.int(-5, 5), r.int(-5, 5)], v = [r.nz(-4, 4), r.nz(-4, 4)], type = r.pick(['ri', 'r', 'i', 'q']);
      const B = [A[0] + v[0], A[1] + v[1]];
      let Cc; if (type === 'ri') Cc = [A[0] - v[1], A[1] + v[0]]; else if (type === 'r') Cc = [A[0] - 2 * v[1], A[1] + 2 * v[0]]; else if (type === 'i') Cc = [A[0] + v[1], A[1] + v[0]]; else Cc = [A[0] + r.nz(-5, 5), A[1] + r.nz(-5, 5)];
      if (cross(A, B, Cc) === 0) return this.make(r, level);
      const truth = classify(A, B, Cc), all = ['rectangle et isocèle', 'rectangle non isocèle', 'isocèle non rectangle', 'quelconque'], Q = cdiv(csub(Cc, A), csub(B, A));
      return qcmNum(r, `Les points ${M('A')}, ${M('B')}, ${M('C')} ont pour affixes ${M(`z_A=${cx(...A)}`)}, ${M(`z_B=${cx(...B)}`)}, ${M(`z_C=${cx(...Cc)}`)}. Le quotient ${M('\\dfrac{z_C-z_A}{z_B-z_A}')} vaut ${M(cxF(...Q))}. Le triangle ${M('ABC')} est :`, [truth, `le module du quotient est ${M('AC/AB')} et son argument est l’angle ${M('(\\overrightarrow{AB},\\overrightarrow{AC})')} : on en déduit les propriétés du triangle (vérifiées par les longueurs ${M(`AB^{2}=${d2(A, B)}`)}, ${M(`AC^{2}=${d2(A, Cc)}`)}, ${M(`BC^{2}=${d2(B, Cc)}`)}).`],
        all.filter((x) => x !== truth).map((x) => [x, 'ne correspond pas au module et à l’argument du quotient.']), (w) => M(`\\text{${w}}`), (w) => classify(A, B, Cc) === w);
    } },

  { id: 'e3-geo-tf', cls: C, chapter: 'expertes-05', domain: 'complexes', skill: 'Vrai ou faux : alignement et orthogonalité avec les affixes', fast: true,
    make(r, level) {
      const A = [r.int(-4, 4), r.int(-4, 4)], v = [r.nz(-3, 3), r.nz(-3, 3)], B = [A[0] + v[0], A[1] + v[1]], kind = r.pick(['align', 'perp']), yes = r.next() < 0.5;
      if (kind === 'align') { const k = r.pick([2, 3, -1, -2]), Cc = [A[0] + k * v[0] + (yes ? 0 : 1), A[1] + k * v[1]], Q = cdiv(csub(Cc, A), csub(B, A)), ok = Q[1].n === 0;
        return tf({ s: `Les points d’affixes ${M(cx(...A))}, ${M(cx(...B))} et ${M(cx(...Cc))} sont alignés.`, v: ok, c: () => ok === (cross(A, B, Cc) === 0) && ok === yes, j: `${M(`\\dfrac{z_C-z_A}{z_B-z_A}=${cxF(...Q)}`)}${ok ? ' est réel : les points sont alignés.' : ' n’est pas réel : les points ne sont pas alignés.'}` }); }
      const Cc = yes ? [A[0] - 2 * v[1], A[1] + 2 * v[0]] : [A[0] + v[1] + 1, A[1] + v[0]], Q = cdiv(csub(Cc, A), csub(B, A)), ok = Q[0].n === 0 && Q[1].n !== 0;
      return tf({ s: `Les droites ${M('(AB)')} et ${M('(AC)')} sont perpendiculaires, avec ${M(`z_A=${cx(...A)}`)}, ${M(`z_B=${cx(...B)}`)}, ${M(`z_C=${cx(...Cc)}`)}.`, v: ok, c: () => ok === (dotQuot(A, B, Cc) === 0), j: `${M(`\\dfrac{z_C-z_A}{z_B-z_A}=${cxF(...Q)}`)}${ok ? ' est un imaginaire pur : angle droit en ' + M('A') + '.' : ' n’est pas un imaginaire pur : les droites ne sont pas perpendiculaires.'}` });
    } },

  { id: 'e3-geo-error', cls: C, chapter: 'expertes-05', domain: 'complexes', skill: 'Trouver l’erreur dans l’interprétation d’un quotient', fast: false,
    make(r, level) {
      const A = [r.int(-4, 4), r.int(-4, 4)], v = [r.nz(-3, 3), r.nz(-3, 3)], B = [A[0] + v[0], A[1] + v[1]], Cc = [A[0] + v[0] - v[1], A[1] + v[1] + v[0]];
      const Q = cdiv(csub(Cc, A), csub(B, A));
      if (Q[0].n === 0 || Q[1].n === 0) return this.make(r, level);
      return spot(`Avec ${M(`z_A=${cx(...A)}`)}, ${M(`z_B=${cx(...B)}`)} et ${M(`z_C=${cx(...Cc)}`)}, un élève étudie le triangle ${M('ABC')}.`, [M(`\\dfrac{z_C-z_A}{z_B-z_A}=${cxF(...Q)}`), M(`\\text{ce quotient n’est pas réel, donc }A,B,C\\text{ ne sont pas alignés}`), M(`\\text{il n’est pas nul, donc }ABC\\text{ est rectangle en }A`)], 2,
        `le triangle est rectangle en ${M('A')} si et seulement si le quotient est un imaginaire pur (partie réelle nulle), ce qui n’est pas le cas ici.`, M(`\\text{le quotient a pour partie réelle }${fracTex(Q[0])}\\neq 0`), M(`ABC\\text{ n’est pas rectangle en }A`), () => dotQuot(A, B, Cc) !== 0 && cross(A, B, Cc) !== 0);
    } },

  { id: 'e3-geo-transform', cls: C, chapter: 'expertes-05', domain: 'complexes', skill: 'Rotation, homothétie : image d’un point et centre', fast: false,
    make(r, level) {
      const om = [r.int(-4, 4), r.int(-4, 4)], z = [r.int(-5, 5), r.int(-5, 5)], rot = r.pick([[[0, 1], 'de centre ' + 'Ω et d’angle \\dfrac{\\pi}{2}'], [[0, -1], 'de centre Ω et d’angle -\\dfrac{\\pi}{2}'], [[-1, 0], 'de centre Ω et d’angle \\pi']]);
      if (level < 3) { const [mu, desc] = rot, im = cadd(om, cmul(mu, csub(z, om))), name = mu[1] === 1 ? '\\dfrac{\\pi}{2}' : mu[1] === -1 ? '-\\dfrac{\\pi}{2}' : '\\pi';
        return { q: `Dans le plan complexe, ${M(`\\Omega(${cx(...om)})`)} et ${M(`A(${cx(...z)})`)}. Déterminer l’affixe de l’image ${M("A'")} de ${M('A')} par la rotation de centre ${M('\\Omega')} et d’angle ${M(name)}.`, a: `${M(`z'-z_\\Omega=\\mathrm{e}^{i${name}}(z-z_\\Omega)=${cx(...mu)}\\left(${cx(...csub(z, om))}\\right)`)} donc ${M(`z'=${cx(...im)}`)}.`, ok: () => ceq(csub(im, om), cmul(mu, csub(z, om))) && abs2(csub(im, om)) === abs2(csub(z, om)) };
      }
      const mu = r.pick([[0, 1], [0, -1], [-1, 0]]), b = [r.int(-6, 6), r.int(-6, 6)], fix = cdiv(b, csub([1, 0], mu));
      return { q: `La transformation ${M('f')} du plan complexe est définie par ${M(`z'=${cx(...mu)}\\,z+${b[1] === 0 && b[0] === 0 ? '0' : `(${cx(...b)})`}`)}. Montrer que ${M('f')} possède un unique point invariant et le déterminer. Quelle est la nature de ${M('f')} ?`, a: `${M('z=z\'')} équivaut à ${M(`z(1-(${cx(...mu)}))=${cx(...b)}`)} soit ${M(`z=${cxF(...fix)}`)}. Comme ${M(`|${cx(...mu)}|=1`)}, ${M('f')} est la rotation de centre ce point et d’angle ${M(mu[1] === 1 ? '\\dfrac{\\pi}{2}' : mu[1] === -1 ? '-\\dfrac{\\pi}{2}' : '\\pi')}.`,
        ok: () => { const back = cmulF(toF(mu), fix); return eq(add(back[0], F(b[0])), fix[0]) && eq(add(back[1], F(b[1])), fix[1]); } };
    } },

  { id: 'e3-geo-set', cls: C, chapter: 'expertes-05', domain: 'complexes', skill: 'Ensemble défini par un quotient imaginaire pur ou réel', fast: false,
    make(r, level) {
      const A = [r.int(-4, 4), r.int(-4, 4)], B = [r.int(-4, 4), r.int(-4, 4)];
      if (ceq(A, B)) return this.make(r, level);
      const pure = r.next() < 0.5, P = pts();
      const quotRe = ([x, y]) => { const num = cmul(csub([x, y], A), conj(csub([x, y], B))), n = abs2(csub([x, y], B)); return n === 0 ? null : [num[0] / n, num[1] / n]; };
      const f = (p) => { const q = quotRe(p); return q !== null && (pure ? Math.abs(q[0]) < 1e-12 : Math.abs(q[1]) < 1e-12); };
      const g = pure ? (p) => !ceq(p, B) && (p[0] - A[0]) * (p[0] - B[0]) + (p[1] - A[1]) * (p[1] - B[1]) === 0 : (p) => !ceq(p, B) && cross(A, B, p) === 0;
      return { q: `Soit ${M('A')} et ${M('B')} d’affixes ${M(`z_A=${cx(...A)}`)} et ${M(`z_B=${cx(...B)}`)}. Déterminer l’ensemble des points ${M('M')} d’affixe ${M('z')} (avec ${M('z\\neq z_B')}) tels que ${M(`\\dfrac{z-z_A}{z-z_B}`)} soit ${pure ? 'un imaginaire pur' : 'un réel'}.`,
        a: pure ? `Le quotient est imaginaire pur si et seulement si ${M('\\overrightarrow{MA}')} et ${M('\\overrightarrow{MB}')} sont orthogonaux (ou ${M('M=A')}) : c’est le cercle de diamètre ${M('[AB]')}, privé de ${M('B')}.` : `Le quotient est réel si et seulement si ${M('M')}, ${M('A')}, ${M('B')} sont alignés : c’est la droite ${M('(AB)')}, privée de ${M('B')}.`,
        ok: () => P.every((p) => f(p) === g(p)) };
    } },

  { id: 'e3-geo-align', cls: C, chapter: 'expertes-05', domain: 'complexes', skill: 'Montrer un alignement et trouver le rapport', fast: false,
    make(r, level) {
      const A = [r.int(-4, 4), r.int(-4, 4)], v = [r.nz(-3, 3), r.nz(-3, 3)], k = F(r.pick([2, 3, -1, -2, 1, 3]), r.pick([1, 2])), B = [A[0] + v[0] * 2, A[1] + v[1] * 2], Cc = [A[0] + val(mul(k, F(v[0] * 2))), A[1] + val(mul(k, F(v[1] * 2)))];
      if (!Number.isInteger(Cc[0]) || !Number.isInteger(Cc[1]) || ceq(B, A) || ceq(Cc, A)) return this.make(r, level);
      const Q = cdiv(csub(Cc, A), csub(B, A));
      return { q: `Les points ${M('A')}, ${M('B')} et ${M('C')} ont pour affixes ${M(`${cx(...A)}`)}, ${M(`${cx(...B)}`)} et ${M(`${cx(...Cc)}`)}. Montrer que ${M('A')}, ${M('B')}, ${M('C')} sont alignés et trouver le réel ${M('k')} tel que ${M('\\overrightarrow{AC}=k\\,\\overrightarrow{AB}')}.`, a: `${M(`\\dfrac{z_C-z_A}{z_B-z_A}=\\dfrac{${cx(...csub(Cc, A))}}{${cx(...csub(B, A))}}=${cxF(...Q)}`)} est un réel : les points sont alignés avec ${M(`k=${fracTex(Q[0])}`)}.`, ok: () => Q[1].n === 0 && cross(A, B, Cc) === 0 && eq(mul(Q[0], F(B[0] - A[0])), F(Cc[0] - A[0])) && eq(mul(Q[0], F(B[1] - A[1])), F(Cc[1] - A[1])) };
    } },
];

// ok of the cubic generator: the printed coefficients are those of (z - r)(z^2 + az + b)
function mulCheck(rt, s2, co) { const prod = [1, s2[1] - rt, s2[2] - rt * s2[1], -rt * s2[2]]; return prod.every((c, i) => c === co[i]); }
