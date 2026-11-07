// Seeded problems for Première (online bank and sheets): multi-part exercises whose numbers come from the seed, one per chapter.
// Same contract as problems.js: make(r) returns {intro, parts: [{w, q, hint, a}], ok()}; ok() recomputes the quoted results independently.
import { F, add, sub, mul, div, val, eq, M, R, fracTex, numTex, roundTex, polyTex, evalPoly, mulPoly, sgn, par, sqrtTex } from './engine.js';
import { pt, vc, lin, affTex } from './seconde-kit.js';
import { piTex } from './templates-premiere.js';

const C = 'premiere';
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
const xf = (a) => (a === 0 ? 'x' : `(x${sgn(-a)})`);
const nd = (f, x) => (f(x + 1e-6) - f(x - 1e-6)) / 2e-6;

export const problemsPremiere = [
  { id: 'g-pre-versements', cls: C, chapters: ['premiere-01'], domain: 'suites', level: 3, minutes: 25, title: 'Un compte avec versements réguliers',
    make(r) {
      const t = r.pick([2, 4, 5, 10, 20, 25]), d = r.int(1, 6) * 10, u0 = r.int(2, 40) * 100, cN = F(100 + t, 100), l = -(100 * d) / t, step = (n) => u0 + 0 * n;
      const U = (n) => { let x = u0; for (let i = 0; i < n; i++) x = (x * (100 + t)) / 100 + d; return x; };
      const target = Math.round(U(r.int(6, 14)) * 0.97 / 10) * 10; let N = 0; while (U(N) < target && N < 200) N++;
      return { intro: `Le ${'1er'} janvier, on place ${M(`${u0}\\ \\text{€}`)} sur un compte rémunéré à ${M(`${t}\\,\\%`)} par an ; chaque année, juste après le versement des intérêts, on ajoute ${M(`${d}\\ \\text{€}`)}. On note ${M('u_n')} le capital après ${M('n')} années.`,
        parts: [
          { w: 1, q: `Justifier que ${M(`u_{n+1}=${numTex(cN)}\\,u_n+${d}`)} et calculer ${M('u_1')} et ${M('u_2')}.`, hint: `Les intérêts multiplient le capital par ${M(numTex(cN))}.`, a: `${M(`u_1=${numTex(cN)}\\times ${u0}+${d}=${numTex(F(U(1) * 100, 100))}`)}, ${M(`u_2=${numTex(F(Math.round(U(2) * 10000), 10000))}`)}.` },
          { w: 2, q: `On pose ${M(`v_n=u_n+${-l}`)}. Montrer que ${M('(v_n)')} est géométrique et préciser sa raison et ${M('v_0')}.`, hint: `Calculer ${M('v_{n+1}')} en remplaçant ${M('u_{n+1}')}.`, a: `${M(`v_{n+1}=${numTex(cN)}u_n+${d}+${-l}=${numTex(cN)}\\left(u_n+${-l}\\right)=${numTex(cN)}\\,v_n`)} car ${M(`${numTex(cN)}\\times ${-l}=${-l + d}`)}. Raison ${M(numTex(cN))}, ${M(`v_0=${u0 - l}`)}.` },
          { w: 1, q: `En déduire l’expression de ${M('u_n')} en fonction de ${M('n')}.`, a: M(`u_n=${u0 - l}\\times ${numTex(cN)}^{n}-${-l}`) },
          { w: 2, q: `À partir de combien d’années le capital dépasse-t-il ${M(`${target}\\ \\text{€}`)} ? (Justifier avec la calculatrice.)`, hint: 'Comparer les valeurs successives de la suite avec un tableau.', a: `${M(`u_{${N - 1}}\\approx ${roundTex(U(N - 1), 2)}`)} et ${M(`u_{${N}}\\approx ${roundTex(U(N), 2)}`)} : à partir de ${M(`${N}`)} années.` },
        ],
        ok: () => { let x = u0; for (let n = 0; n <= 8; n++) { if (!near(x, (u0 - l) * (1 + t / 100) ** n + l, 1e-9)) return false; x = x * (1 + t / 100) + d; } return Number.isInteger(l) && U(N) >= target && U(N - 1) < target && N > 0; } };
    } },

  { id: 'g-pre-ballon', cls: C, chapters: ['premiere-02'], domain: 'algebre', level: 2, minutes: 20, title: 'La trajectoire d’un ballon',
    make(r) {
      const a = r.pick([1, 2, 5]), p = r.int(1, 3), q = r.int(p + 3, 14), m = r.int(1, q - 2); if (q - p - m === m) return this.make(r); const H = (t) => -a * (t + p) * (t - q), co = [-a, a * (q - p), a * p * q];
      const Hm = H(m), other = q - p - m, al = F(q - p, 2), top = H(val(al));
      return { intro: `Un ballon est lancé d’un point au sol. Sa hauteur en mètres à l’instant ${M('t')} (en secondes, ${M('t\\geqslant 0')}) est donnée par ${M(`h(t)=${polyTex(co, 't')}`)}.`,
        parts: [
          { w: 1, q: `Vérifier que ${M(`h(t)=-${a === 1 ? '' : a}(t+${p})(t-${q})`)}.`, hint: 'Développer le produit.', a: `${M(`-${a === 1 ? '' : a}(t+${p})(t-${q})=-${a === 1 ? '' : a}(t^{2}-${q - p}t-${p * q})=${polyTex(co, 't')}`)}.` },
          { w: 2, q: 'À quel instant le ballon touche-t-il le sol ? Quelle est sa hauteur maximale et quand est-elle atteinte ?', hint: `Les racines de ${M('h')} et la forme ${M('-b/(2a)')}.`, a: `${M(`h(t)=0\\iff t=-${p}`)} ou ${M(`t=${q}`)} : le ballon retombe à ${M(`t=${q}\\ \\text{s}`)}. Maximum en ${M(`t=-\\dfrac{b}{2a}=${numTex(al)}`)}, ${M(`h(${numTex(al)})=${numTex(F(a * (q + p) * (q + p), 4))}\\ \\text{m}`)}.` },
          { w: 2, q: `Pendant combien de temps le ballon reste-t-il à plus de ${M(`${Hm}\\ \\text{m}`)} de hauteur ?`, hint: `Résoudre ${M(`h(t)\\geqslant ${Hm}`)} (trinôme de coefficient dominant négatif).`, a: `${M(`h(t)=${Hm}\\iff ${polyTex([-a, a * (q - p), a * p * q - Hm], 't')}=0`)} a pour racines ${M(Math.min(m, other))} et ${M(Math.max(m, other))} ; ${M(`h(t)\\geqslant ${Hm}`)} entre elles : durée ${M(`${Math.abs(other - m)}\\ \\text{s}`)}.` },
        ],
        ok: () => mulPoly([-a, -a * p], [1, -q]).every((c, i) => c === co[i]) && H(0) === a * p * q && H(q) === 0 && evalPoly(co, m) === Hm && evalPoly(co, other) === Hm && other !== m && Math.abs(top - (a * (q + p) ** 2) / 4) < 1e-9 && other > -p && other < q };
    } },

  { id: 'g-pre-triangle-scalaire', cls: C, chapters: ['premiere-03', 'premiere-07'], domain: 'geometrie', level: 2, minutes: 25, title: 'Un triangle dans un repère orthonormé',
    make(r) {
      const A = [r.int(-5, 3), r.int(-5, 3)]; let p, q; do { p = r.int(-4, 5); q = r.int(-4, 5); } while (p === 0 && q === 0);
      const k = r.int(1, 3), B = [A[0] + p, A[1] + q], Cc = [A[0] - k * q, A[1] + k * p + r.pick([0, 1, -1])], ab = [p, q], ac = [Cc[0] - A[0], Cc[1] - A[1]], dot = ab[0] * ac[0] + ab[1] * ac[1], nab = p * p + q * q, nac = ac[0] ** 2 + ac[1] ** 2, det = ab[0] * ac[1] - ab[1] * ac[0];
      if (det === 0) return this.make(r);
      const cosv = dot / Math.sqrt(nab * nac), ang = (Math.acos(cosv) * 180) / Math.PI, n = [-ac[1], ac[0]];
      const hLine = [ac[0], ac[1], -(ac[0] * B[0] + ac[1] * B[1])];
      return { intro: `Dans un repère orthonormé, on considère ${M(`A${pt(...A)}`)}, ${M(`B${pt(...B)}`)} et ${M(`C${pt(...Cc)}`)}.`,
        parts: [
          { w: 1, q: `Calculer ${M('\\overrightarrow{AB}\\cdot\\overrightarrow{AC}')}, ${M('AB')} et ${M('AC')}.`, hint: 'Coordonnées des vecteurs puis formule analytique.', a: `${M(`\\overrightarrow{AB}${vc(...ab)}`)}, ${M(`\\overrightarrow{AC}${vc(...ac)}`)} : ${M(`\\overrightarrow{AB}\\cdot\\overrightarrow{AC}=${dot}`)}, ${M(`AB=\\sqrt{${nab}}`)}, ${M(`AC=\\sqrt{${nac}}`)}.` },
          { w: 2, q: `En déduire une mesure de l’angle ${M('\\widehat{BAC}')} arrondie au dixième de degré.`, hint: `${M('\\cos\\widehat{BAC}=\\dfrac{\\overrightarrow{AB}\\cdot\\overrightarrow{AC}}{AB\\times AC}')}.`, a: `${M(`\\cos\\widehat{BAC}=\\dfrac{${dot}}{\\sqrt{${nab}}\\sqrt{${nac}}}\\approx ${roundTex(cosv, 4)}`)} donc ${M(`\\widehat{BAC}\\approx ${roundTex(ang, 1)}^{\\circ}`)}.` },
          { w: 2, q: `Déterminer une équation cartésienne de la hauteur du triangle issue de ${M('B')}.`, hint: `Un vecteur normal à cette hauteur est ${M('\\overrightarrow{AC}')}.`, a: `${M(`\\overrightarrow{AC}${vc(...ac)}`)} est normal à la hauteur issue de ${M('B')}, qui passe par ${M('B')} : ${M(`${lin([[hLine[0], 'x'], [hLine[1], 'y'], [hLine[2], '']])}=0`)}.` },
          { w: 1, q: 'Calculer l’aire du triangle.', a: `${M(`\\dfrac{|\\det(\\overrightarrow{AB},\\overrightarrow{AC})|}{2}=\\dfrac{${Math.abs(det)}}{2}=${numTex(F(Math.abs(det), 2))}`)}.` },
        ],
        ok: () => hLine[0] * B[0] + hLine[1] * B[1] + hLine[2] === 0 && hLine[0] * ac[0] + hLine[1] * ac[1] === ac[0] ** 2 + ac[1] ** 2 && near(Math.hypot(...ab) * Math.hypot(...ac) * Math.sin((ang * Math.PI) / 180) / 2, Math.abs(det) / 2, 1e-9) && Math.abs(Math.round(ang * 10) / 10 - ang) < 0.05 };
    } },

  { id: 'g-pre-tangente-position', cls: C, chapters: ['premiere-04'], domain: 'analyse', level: 3, minutes: 25, title: 'Tangente et position relative',
    make(r) {
      let x0, x1, m, pp; do { x0 = r.int(-3, 3); x1 = r.int(-4, 4); m = r.nz(-4, 4); pp = r.int(-6, 6); } while (x1 === x0);
      const cube = mulPoly(mulPoly([1, -x0], [1, -x0]), [1, -x1]), co = cube.map((c, i) => (i === 2 ? c + m : i === 3 ? c + pp : c)), f = (x) => evalPoly(co, x), d1 = [3, 2 * co[1], co[2]];
      const slope = evalPoly(d1, x0), y0 = f(x0), pT = y0 - slope * x0;
      return { intro: `Soit ${M(`f(x)=${polyTex(co)}`)} définie sur ${M(R)} et ${M('\\mathcal{C}')} sa courbe.`,
        parts: [
          { w: 1, q: `Calculer ${M("f'(x)")}.`, a: M(`f'(x)=${polyTex(d1)}`) },
          { w: 2, q: `Déterminer l’équation réduite de la tangente ${M('T')} à ${M('\\mathcal{C}')} au point d’abscisse ${M(x0)}.`, hint: `${M(`y=f'(${x0})${xf(x0)}+f(${x0})`)}.`, a: `${M(`f(${x0})=${y0}`)}, ${M(`f'(${x0})=${slope}`)} : ${M(`T:\\ y=${polyTex([slope, pT])}`)}.` },
          { w: 3, q: `Montrer que, pour tout réel ${M('x')}, ${M(`f(x)-(${polyTex([slope, pT])})=${xf(x0)}^{2}${xf(x1)}`)}.`, hint: 'Développer le membre de droite et comparer.', a: `${M(`${xf(x0)}^{2}${xf(x1)}=${polyTex(cube)}`)} ; en retirant la tangente, ${M(`f(x)-(${polyTex([slope, pT])})`)} redonne ce polynôme.` },
          { w: 2, q: `En déduire la position de ${M('\\mathcal{C}')} par rapport à ${M('T')}.`, a: `Le carré est positif : ${M(`f(x)-T(x)`)} a le signe de ${M(x1 === 0 ? 'x' : `x${sgn(-x1)}`)}. ${M('\\mathcal{C}')} est au-dessus de ${M('T')} pour ${M(`x>${x1}`)}, en dessous pour ${M(`x<${x1}`)} (avec contact en ${M(x0)}${x0 > x1 ? ', en dessous' : x0 < x1 ? ', en dessous' : ''}).`.replace(/ \(avec contact.*\)\./, `, et la coupe en ${M(x0)} (point de tangence) et en ${M(x1)}.`) },
        ],
        ok: () => { const T = (x) => slope * x + pT; return [-3, -1.5, 0, 2.5, 5].every((x) => near(f(x) - T(x), (x - x0) ** 2 * (x - x1), 1e-9)) && near(nd(f, x0), slope, 1e-3) && f(x0) === T(x0) && x0 !== x1; } };
    } },

  { id: 'g-pre-deux-urnes', cls: C, chapters: ['premiere-05'], domain: 'stats-proba', level: 2, minutes: 20, title: 'Deux urnes et un tirage',
    make(r) {
      const r1 = r.int(2, 8), b1 = r.int(2, 8), r2 = r.int(2, 8), b2 = r.int(2, 8), pU = r.pick([2, 3, 4, 5, 6, 7]) / 10, PU1 = F(Math.round(pU * 10), 10), N1 = r1 + b1, N2 = r2 + b2;
      const pr1 = F(r1, N1), pr2 = F(r2, N2), pR = add(mul(PU1, pr1), mul(sub(F(1), PU1), pr2)), bay = div(mul(PU1, pr1), pR);
      return { intro: `On choisit l’urne ${M('U_1')} avec la probabilité ${M(numTex(PU1))}, sinon l’urne ${M('U_2')}. ${M('U_1')} contient ${M(r1)} boules rouges et ${M(b1)} noires ; ${M('U_2')} contient ${M(r2)} boules rouges et ${M(b2)} noires. On tire ensuite une boule au hasard dans l’urne choisie. On note ${M('R')} l’événement « la boule est rouge ».`,
        parts: [
          { w: 1, q: `Représenter la situation par un arbre pondéré.`, hint: `Deux niveaux : choix de l’urne, puis couleur.`, a: `${M('P(U_1)=' + numTex(PU1))}, ${M('P(U_2)=' + numTex(sub(F(1), PU1)))} ; ${M(`P_{U_1}(R)=${fracTex(pr1)}`)} et ${M(`P_{U_2}(R)=${fracTex(pr2)}`)}.` },
          { w: 2, q: `Calculer ${M('P(R)')}.`, hint: 'Formule des probabilités totales.', a: `${M(`P(R)=${numTex(PU1)}\\times ${fracTex(pr1)}+${numTex(sub(F(1), PU1))}\\times ${fracTex(pr2)}=${fracTex(pR)}`)}.` },
          { w: 2, q: `La boule est rouge : quelle est la probabilité qu’elle vienne de ${M('U_1')} ?`, hint: `${M('P_R(U_1)=\\dfrac{P(U_1\\cap R)}{P(R)}')}.`, a: `${M(`P_R(U_1)=\\dfrac{${numTex(mul(PU1, pr1))}}{${fracTex(pR)}}=${fracTex(bay)}`)}${bay.d > 1 ? `, soit environ ${M(roundTex(val(bay), 3))}` : ''}.` },
        ],
        ok: () => near(val(pR), pU * (r1 / N1) + (1 - pU) * (r2 / N2), 1e-9) && near(val(bay) * val(pR), pU * (r1 / N1), 1e-9) };
    } },

  { id: 'g-pre-grillage-mur', cls: C, chapters: ['premiere-06'], domain: 'analyse', level: 2, minutes: 20, title: 'Une clôture de longueur minimale',
    make(r) {
      const m = r.int(2, 60), S = 2 * m * m, L = (x) => 2 * x + S / x, dL = (x) => 2 - S / (x * x);
      return { intro: `Un agriculteur veut clore un pré rectangulaire d’aire ${M(`${S}\\ \\text{m}^{2}`)} en utilisant un mur sur un côté (le mur ne demande pas de clôture). On note ${M('x')} la longueur en mètres des deux côtés perpendiculaires au mur (${M('x>0')}).`,
        parts: [
          { w: 1, q: `Montrer que la longueur de clôture est ${M(`L(x)=2x+\\dfrac{${S}}{x}`)}.`, hint: `Le côté parallèle au mur mesure ${M(`\\dfrac{${S}}{x}`)}.`, a: `Le côté parallèle au mur mesure ${M(`\\dfrac{${S}}{x}`)} car l’aire vaut ${M(S)}. La clôture couvre deux côtés de longueur ${M('x')} et un côté de longueur ${M(`\\dfrac{${S}}{x}`)}.` },
          { w: 2, q: `Calculer ${M("L'(x)")} et montrer que ${M(`L'(x)=\\dfrac{2(x-${m})(x+${m})}{x^{2}}`)}.`, a: `${M(`L'(x)=2-\\dfrac{${S}}{x^{2}}=\\dfrac{2x^{2}-${S}}{x^{2}}=\\dfrac{2(x-${m})(x+${m})}{x^{2}}`)}.` },
          { w: 2, q: 'Dresser le tableau de variations de ' + M('L') + ' et conclure : quelles dimensions minimisent la longueur de clôture ?', a: `${M("L'")} est négative sur ${M(`]0\\,;\\,${m}]`)} et positive sur ${M(`[${m}\\,;\\,+\\infty[`)} : minimum ${M(`L(${m})=${4 * m}\\ \\text{m}`)}. Dimensions : ${M(`${m}\\ \\text{m}`)} sur ${M(`${2 * m}\\ \\text{m}`)}.` },
        ],
        ok: () => near(nd(L, m), 0, 1e-4) && L(m) === 4 * m && dL(m - 0.2) < 0 && dL(m + 0.2) > 0 && S / m === 2 * m && [0.5, 1, m + 2, 40].every((x) => near(dL(x), (2 * (x - m) * (x + m)) / (x * x), 1e-9)) };
    } },

  { id: 'g-pre-cercle-tangente', cls: C, chapters: ['premiere-07'], domain: 'geometrie', level: 3, minutes: 25, title: 'Un cercle, une tangente et une droite',
    make(r) {
      const r2 = r.pick([25, 50, 65, 85]), L = []; for (let x = -9; x <= 9; x++) for (let y = -9; y <= 9; y++) if (x * x + y * y === r2) L.push([x, y]);
      const O = [r.int(-4, 4), r.int(-4, 4)], P1 = r.pick(L), P2 = r.pick(L); if (P1 === P2) return this.make(r);
      const A = [P1[0] + O[0], P1[1] + O[1]], B = [P2[0] + O[0], P2[1] + O[1]], tan = [P1[0], P1[1], -(P1[0] * A[0] + P1[1] * A[1])];
      const circ = `(x${sgn(-O[0])})^{2}+(y${sgn(-O[1])})^{2}=${r2}`.replace(/\(x\+0\)/, 'x').replace(/\(y\+0\)/, 'y');
      const ex = 0;
      return { intro: `Dans un repère orthonormé, le cercle ${M('\\mathcal{C}')} a pour centre ${M(`\\Omega${pt(...O)}`)} et passe par ${M(`A${pt(...A)}`)}. Le point ${M(`B${pt(...B)}`)} est aussi sur ce cercle.`,
        parts: [
          { w: 1, q: `Calculer ${M('R^{2}=\\Omega A^{2}')} et donner une équation de ${M('\\mathcal{C}')}.`, a: `${M(`\\Omega A^{2}=(${A[0]}${sgn(-O[0])})^{2}+(${A[1]}${sgn(-O[1])})^{2}=${r2}`)} donc ${M(circ)}.` },
          { w: 1, q: `Vérifier que ${M('B')} appartient à ${M('\\mathcal{C}')}.`, a: `${M(`\\Omega B^{2}=(${B[0]}${sgn(-O[0])})^{2}+(${B[1]}${sgn(-O[1])})^{2}=${r2}`)}.` },
          { w: 2, q: `Déterminer une équation de la tangente ${M('T')} à ${M('\\mathcal{C}')} en ${M('A')}.`, hint: `${M('T')} est perpendiculaire au rayon ${M('[\\Omega A]')}.`, a: `${M(`\\overrightarrow{\\Omega A}${vc(...P1)}`)} est normal à ${M('T')} : ${M(`${lin([[tan[0], 'x'], [tan[1], 'y'], [tan[2], '']])}=0`)}.` },
          { w: 2, q: `Calculer la distance de ${M('B')} à la tangente ${M('T')} et dire si ${M('B')} est du même côté de ${M('T')} que ${M('\\Omega')}.`, a: `${M(`d(B,T)=\\dfrac{|${par(tan[0])}\\times ${par(B[0])}+${par(tan[1])}\\times ${par(B[1])}${sgn(tan[2])}|}{\\sqrt{${r2}}}=\\dfrac{${Math.abs(tan[0] * B[0] + tan[1] * B[1] + tan[2])}}{\\sqrt{${r2}}}`)}. ${M('\\Omega')} et ${M('B')} ${(tan[0] * O[0] + tan[1] * O[1] + tan[2]) * (tan[0] * B[0] + tan[1] * B[1] + tan[2]) > 0 ? 'sont du même côté de ' + M('T') + ' (tout le disque l’est).' : 'sont de part et d’autre.'}` },
        ],
        ok: () => (A[0] - O[0]) ** 2 + (A[1] - O[1]) ** 2 === r2 && (B[0] - O[0]) ** 2 + (B[1] - O[1]) ** 2 === r2 && tan[0] * A[0] + tan[1] * A[1] + tan[2] === 0 && (tan[0] * O[0] + tan[1] * O[1] + tan[2]) * (tan[0] * B[0] + tan[1] * B[1] + tan[2]) >= 0 && ex === 0 };
    } },

  { id: 'g-pre-loterie', cls: C, chapters: ['premiere-08'], domain: 'stats-proba', level: 2, minutes: 20, title: 'Une loterie à trois lots',
    make(r) {
      const n = r.pick([20, 25, 40, 50]), a = r.int(1, 3), b = r.int(2, 6), g1 = r.int(2, 10) * 10, g2 = r.int(1, 5) * 10, mise = r.int(1, 5);
      const P = [F(a, n), F(b, n), F(n - a - b, n)], X = [g1 - mise, g2 - mise, -mise], E = P.reduce((s, p, i) => add(s, mul(p, F(X[i]))), F(0)), E2 = P.reduce((s, p, i) => add(s, mul(p, F(X[i] * X[i]))), F(0)), V = sub(E2, mul(E, E));
      return { intro: `Une loterie comporte ${M(n)} billets : ${M(a)} billet${a > 1 ? 's' : ''} gagne${a > 1 ? 'nt' : ''} ${M(`${g1}\\ \\text{€}`)}, ${M(b)} billets gagnent ${M(`${g2}\\ \\text{€}`)}, les autres ne gagnent rien. Un billet coûte ${M(`${mise}\\ \\text{€}`)}. On note ${M('G')} le gain algébrique (lot moins prix du billet) d’un joueur.`,
        parts: [
          { w: 2, q: `Donner la loi de probabilité de ${M('G')}.`, hint: 'Trois valeurs possibles.', a: `${M(`G=${X[0]}`)} avec ${M(fracTex(P[0]))}, ${M(`G=${X[1]}`)} avec ${M(fracTex(P[1]))}, ${M(`G=${X[2]}`)} avec ${M(fracTex(P[2]))}.` },
          { w: 2, q: `Calculer ${M('E(G)')} et dire si le jeu est favorable au joueur.`, a: `${M(`E(G)=${X.map((x, i) => `${par(x)}\\times ${fracTex(P[i])}`).join('+')}=${fracTex(E)}`)}${val(E) < 0 ? ' : le jeu est défavorable au joueur.' : val(E) > 0 ? ' : le jeu est favorable au joueur.' : ' : le jeu est équitable.'}` },
          { w: 2, q: `Calculer la variance ${M('V(G)')} et l’écart type ${M('\\sigma(G)')} (arrondi au dixième).`, hint: `${M('V(G)=E(G^{2})-E(G)^{2}')}.`, a: `${M(`E(G^{2})=${fracTex(E2)}`)} donc ${M(`V(G)=${fracTex(E2)}-\\left(${fracTex(E)}\\right)^{2}=${fracTex(V)}`)} et ${M(`\\sigma(G)\\approx ${roundTex(Math.sqrt(val(V)), 1)}`)}.` },
        ],
        ok: () => { let e = 0, e2 = 0; P.forEach((p, i) => { e += val(p) * X[i]; e2 += val(p) * X[i] ** 2; }); return near(e, val(E), 1e-9) && near(e2 - e * e, val(V), 1e-9) && n - a - b > 0 && Math.abs(Math.sqrt(val(V)) * 10 - Math.round(Math.sqrt(val(V)) * 10) - 0.5) > 1e-6; } };
    } },

  { id: 'g-pre-exp-etude', cls: C, chapters: ['premiere-09'], domain: 'analyse', level: 3, minutes: 25, title: 'Étude d’une fonction avec exponentielle',
    make(r) {
      const a = r.pick([1, 2, 3, -1, -2, -3]), x0 = r.int(-8, 8), b = -a * (x0 - 1), f = (x) => (a * x + b) * Math.exp(-x), fp = (x) => (-a * x + a - b) * Math.exp(-x);
      const lin0 = polyTex([-a, a - b]), up = -a > 0;
      return { intro: `Soit ${M(`f(x)=(${polyTex([a, b])})\\mathrm{e}^{-x}`)} définie sur ${M(R)}.`,
        parts: [
          { w: 2, q: `Montrer que ${M(`f'(x)=(${lin0})\\mathrm{e}^{-x}`)}.`, hint: `Produit ${M('uv')} avec ${M(`v=\\mathrm{e}^{-x}`)} et ${M("v'=-\\mathrm{e}^{-x}")}.`, a: `${M(`f'(x)=${a}\\mathrm{e}^{-x}-(${polyTex([a, b])})\\mathrm{e}^{-x}=(${lin0})\\mathrm{e}^{-x}`)}.` },
          { w: 2, q: `Étudier le signe de ${M("f'")} et dresser le tableau de variations de ${M('f')}.`, a: `${M('\\mathrm{e}^{-x}>0')} : ${M("f'")} a le signe de ${M(lin0)}, qui s’annule en ${M(`x=${x0}`)}. ${M('f')} ${up ? 'décroît sur ' + M(`]-\\infty\\,;\\,${x0}]`) + ' puis croît' : 'croît sur ' + M(`]-\\infty\\,;\\,${x0}]`) + ' puis décroît'}.` },
          { w: 1, q: `Donner la valeur exacte de l’extremum.`, a: `${M(`f(${x0})=${a * x0 + b === 1 ? '' : a * x0 + b === -1 ? '-' : a * x0 + b}\\mathrm{e}^{${-x0}}`.replace('^{0}', ''))}.`.replace(/\\mathrm\{e\}\^\{(-?\d+)\}/, (m0, e0) => (e0 === '1' ? '\\mathrm{e}' : m0)) },
          { w: 2, q: `Déterminer l’équation de la tangente à la courbe au point d’abscisse ${M(0)}.`, a: `${M(`f(0)=${b}`)}, ${M(`f'(0)=${a - b}`)} : ${M(`y=${polyTex([a - b, b])}`)}.` },
        ],
        ok: () => near(nd(f, x0), 0, 1e-3) && (nd(f, x0 - 0.5) < 0) === up && (nd(f, x0 + 0.5) > 0) === up && [-1, 0.4, 2].every((x) => near(nd(f, x), fp(x), 1e-3)) && near(nd(f, 0), a - b, 1e-3) && near(f(0), b) };
    } },

  { id: 'g-pre-trig-inequation', cls: C, chapters: ['premiere-10'], domain: 'geometrie', level: 2, minutes: 20, title: 'Équations et inéquations trigonométriques',
    make(r) {
      const pool = [['\\dfrac{1}{2}', 0.5, 4], ['\\dfrac{\\sqrt{2}}{2}', Math.SQRT1_2, 3], ['\\dfrac{\\sqrt{3}}{2}', Math.sqrt(3) / 2, 2], ['-\\dfrac{1}{2}', -0.5, 8], ['-\\dfrac{\\sqrt{2}}{2}', -Math.SQRT1_2, 9]];
      const [vt, vn, a1] = r.pick(pool), geq = r.next() < 0.5, n = r.int(2, 6), m = r.int(7, 40) * r.sign(), u = (m * 12) / 6;
      const sol = []; for (let t = 0; t <= 24; t++) if (Math.abs(Math.cos((t * Math.PI) / 12) - vn) < 1e-9) sol.push(t);
      const op = geq ? '\\geqslant ' : '\\leqslant ', inter = geq ? `\\left[0\\,;\\,${piTex(a1, 12)}\\right]\\cup\\left[${piTex(24 - a1, 12)}\\,;\\,2\\pi\\right]` : `\\left[${piTex(a1, 12)}\\,;\\,${piTex(24 - a1, 12)}\\right]`;
      const pr = (() => { let w = ((u % 24) + 24) % 24; return w > 12 ? w - 24 : w; })();
      return { intro: `On travaille avec le cercle trigonométrique, l’angle ${M(piTex(m, 6))} et la valeur ${M(vt)}.`,
        parts: [
          { w: 1, q: `Donner la mesure principale de ${M(piTex(m, 6))}.`, a: `${M(`${piTex(m, 6)}\\equiv ${piTex(pr, 12)}\\ [2\\pi]`)}.` },
          { w: 2, q: `Résoudre dans ${M('[0\\,;\\,2\\pi]')} l’équation ${M(`\\cos x=${vt}`)}.`, hint: `Chercher l’angle de référence puis utiliser la symétrie ${M('x\\mapsto -x')}.`, a: `${M(`S=\\left\\{${sol.map((t) => piTex(t, 12)).join('\\,;\\,')}\\right\\}`)}.` },
          { w: 3, q: `En déduire les solutions dans ${M('[0\\,;\\,2\\pi]')} de l’inéquation ${M(`\\cos x${op}${vt}`)}.`, hint: 'Lire sur le cercle trigonométrique les points dont l’abscisse convient.', a: `${M(`\\cos x${op}${vt}`)} équivaut à ${M(`x\\in${geq ? inter : inter}`)}${geq ? '' : ''}.` },
        ],
        ok: () => { const holds = (t) => (geq ? Math.cos((t * Math.PI) / 12) >= vn - 1e-9 : Math.cos((t * Math.PI) / 12) <= vn + 1e-9); const cov = (t) => (geq ? t <= a1 || t >= 24 - a1 : t >= a1 && t <= 24 - a1); for (let t = 0; t <= 24; t++) if (holds(t) !== cov(t)) return false; for (let k = 0; k < 240; k++) { const x = (k / 10) * (Math.PI / 12) * 1.2 * 0 + (k * Math.PI * 2) / 240; const h = geq ? Math.cos(x) >= vn : Math.cos(x) <= vn; const cc = geq ? x <= (a1 * Math.PI) / 12 || x >= ((24 - a1) * Math.PI) / 12 : x >= (a1 * Math.PI) / 12 && x <= ((24 - a1) * Math.PI) / 12; if (h !== cc && Math.abs(Math.cos(x) - vn) > 1e-9) return false; } return sol.join() === [a1, 24 - a1].join() && n > 0 && pr > -12 && pr <= 12 && (u - pr) % 24 === 0; } };
    } },
];
