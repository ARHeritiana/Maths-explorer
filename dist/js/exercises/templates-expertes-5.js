// Maths expertes generators, fifth file (chapters 09 to 11: matrices, graphes, suites de matrices et chaînes de Markov): four-choice questions with
// one typical error per wrong option, true/false, find-the-error and multi-step generators with seeded parameters. Same contract as
// templates-expertes.js; every ok() recomputes the answer another way (entry by entry, enumeration of walks and colourings, exact fractions).
import { F, add, sub, mul, div, val, eq, M, fracTex, numTex, sgn, par } from './engine.js';
import { tf, spot } from './premiere-kit.js';
import { dec } from './seconde-kit.js';
import { qcmNum } from './seconde-kit-2.js';
import { mat, matF, mmul, madd, mpow, det2, mmulF, mF, meq, meqF, solveF, degrees, walksDFS, connected, chromatic } from './expertes-kit.js';

const C = 'expertes';
const rmat = (r, lo = -3, hi = 4) => [[r.int(lo, hi), r.int(lo, hi)], [r.int(lo, hi), r.int(lo, hi)]];
const I2 = [[1, 0], [0, 1]];
// a sum of terms [coefficient, symbol] written without 0, 1 or +-
const sumTerms = (terms) => { let out = ''; for (const [k, v] of terms) { if (k === 0) continue; const abs = Math.abs(k), body = v && abs === 1 ? v : `${abs}${v}`; out += (k < 0 ? '-' : out ? '+' : '') + body; } return out || '0'; };
const coefTex = (f) => (f.n === 1 && f.d === 1 ? '' : f.n === -1 && f.d === 1 ? '-' : fracTex(f));
const NAMES = 'ABCDEF';
const edgeList = (A) => { const out = []; for (let i = 0; i < A.length; i++) for (let j = i; j < A.length; j++) for (let k = 0; k < A[i][j]; k++) out.push(`${NAMES[i]}${NAMES[j]}`); return out; };
const edgesTex = (A) => edgeList(A).map((e) => M(`\\text{${e}}`)).join(', ');
function randGraph(r, n, p = 0.5) { const A = Array.from({ length: n }, () => Array(n).fill(0)); for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (r.next() < p) { A[i][j] = 1; A[j][i] = 1; } return A; }
const clique = (A) => { const n = A.length; let best = 1; for (let mask = 1; mask < 1 << n; mask++) { const vs = []; for (let i = 0; i < n; i++) if (mask & (1 << i)) vs.push(i); if (vs.every((u, a) => vs.every((v, b) => a === b || A[u][v]))) best = Math.max(best, vs.length); } return best; };
const colorable = (A, k) => { const n = A.length, col = Array(n).fill(0); const total = k ** n; for (let code = 0; code < total; code++) { let z = code; for (let i = 0; i < n; i++) { col[i] = z % k; z = Math.floor(z / k); } if (A.every((row, i) => row.every((x, j) => !x || col[i] !== col[j]))) return true; } return false; };

export const expertes5 = [
  // ============================ 09 Matrices ============================
  { id: 'e5-mat-qcm', cls: C, chapter: 'expertes-09', domain: 'matrices', skill: 'QCM : produit, déterminant, inverse de matrices 2×2', fast: true,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['prod', 'det'] : ['prod', 'det', 'inv']);
      if (kind === 'prod') { const A = rmat(r), B = rmat(r), good = mmul(A, B);
        return qcmNum(r, `Soit ${M(`A=${mat(A)}`)} et ${M(`B=${mat(B)}`)}. Le produit ${M('AB')} est :`, [good, 'chaque coefficient est le produit d’une ligne de ' + M('A') + ' par une colonne de ' + M('B') + '.'],
          [[mmul(B, A), 'calcule ' + M('BA') + ' (le produit n’est pas commutatif).'], [A.map((row, i) => row.map((x, j) => x * B[i][j])), 'multiplie coefficient par coefficient.'], [[[good[0][0], good[0][1]], [good[1][0] + 1, good[1][1]]], 'se trompe sur un coefficient.'], [madd(A, B), 'additionne les matrices.']], (m) => M(mat(m)), (m) => meq(m, A.map((_, i) => B[0].map((__, j) => A[i][0] * B[0][j] + A[i][1] * B[1][j]))));
      }
      if (kind === 'det') { const A = rmat(r, -5, 6), [[a, b], [c, d]] = A, good = a * d - b * c;
        return qcmNum(r, `Le déterminant de ${M(mat(A))} est :`, [good, `${M(`ad-bc=${par(a)}\\times ${par(d)}-${par(b)}\\times ${par(c)}`)}.`], [[a * d + b * c, 'additionne les produits.'], [a * c - b * d, 'mélange les lignes et les colonnes.'], [b * c - a * d, 'se trompe de signe.'], [a * d, 'oublie l’autre produit.']], M, (v) => v === det2(A)); }
      let A; do { A = rmat(r, -3, 4); } while (det2(A) === 0 || Math.abs(det2(A)) > 6);
      const d = det2(A), [[a, b], [c, e]] = A, good = [[F(e, d), F(-b, d)], [F(-c, d), F(a, d)]];
      return qcmNum(r, `Soit ${M(`A=${mat(A)}`)}. Son inverse est :`, [good, `${M(`\\det A=${d}`)} et ${M(`A^{-1}=\\dfrac{1}{${d}}\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}`)}.`],
        [[[[F(a, d), F(b, d)], [F(c, d), F(e, d)]], 'divise ' + M('A') + ' par son déterminant sans échanger ni changer de signe.'], [[[F(e), F(-b)], [F(-c), F(a)]], 'oublie de diviser par le déterminant.'], [[[F(e, d), F(b, d)], [F(c, d), F(a, d)]], 'oublie de changer les signes des coefficients ' + M('b') + ' et ' + M('c') + '.'], [[[F(a, -d), F(-b, -d)], [F(-c, -d), F(e, -d)]], 'se trompe de signe pour le déterminant.']], (m) => M(matF(m)), (m) => meqF(mmulF(mF(A), m), mF(I2)));
    } },

  { id: 'e5-mat-tf', cls: C, chapter: 'expertes-09', domain: 'matrices', skill: 'Vrai ou faux sur les matrices', fast: false,
    make(r, level) {
      const kind = r.pick(['comm', 'inv', 'binom']), A = rmat(r), yes = r.next() < 0.5;
      if (kind === 'inv') { const B = yes ? A : [[A[0][0], A[0][1]], [A[0][0] * 2, A[0][1] * 2]], ok = det2(B) !== 0;
        return tf({ s: `La matrice ${M(mat(B))} est inversible.`, v: ok, c: () => ok === (B[0][0] * B[1][1] - B[0][1] * B[1][0] !== 0), j: `${M(`\\det=${B[0][0]}\\times ${par(B[1][1])}-${par(B[0][1])}\\times ${par(B[1][0])}=${det2(B)}`)}${ok ? ', non nul : la matrice est inversible.' : ' : la matrice n’est pas inversible (lignes proportionnelles).'}` }); }
      const p = r.int(-3, 3), q = r.int(-3, 3), B = yes ? madd(A.map((row) => row.map((x) => x * p)), I2.map((row) => row.map((x) => x * q))) : rmat(r), AB = mmul(A, B), BA = mmul(B, A), ok = meq(AB, BA);
      if (kind === 'comm') return tf({ s: `Pour ${M(`A=${mat(A)}`)} et ${M(`B=${mat(B)}`)}, on a ${M('AB=BA')}.`, v: ok, c: () => ok === JSON.stringify(mmul(A, B)) === JSON.stringify(mmul(B, A)) || ok === (JSON.stringify(mmul(A, B)) === JSON.stringify(mmul(B, A))), j: `${M(`AB=${mat(AB)}`)} et ${M(`BA=${mat(BA)}`)}${ok ? ' : les deux produits sont égaux.' : ' : ils sont différents.'}` });
      const lhs = mmul(madd(A, B), madd(A, B)), rhs = madd(madd(mmul(A, A), mmul(A, B).map((row) => row.map((x) => 2 * x))), mmul(B, B)), okb = meq(lhs, rhs);
      return tf({ s: `Pour ${M(`A=${mat(A)}`)} et ${M(`B=${mat(B)}`)}, on a ${M('(A+B)^{2}=A^{2}+2AB+B^{2}')}.`, v: okb, c: () => okb === (meq(mmul(A, B), mmul(B, A))), j: `${M('(A+B)^{2}=A^{2}+AB+BA+B^{2}')}, égal à ${M('A^{2}+2AB+B^{2}')} si et seulement si ${M('AB=BA')}. Ici ${M(`AB=${mat(AB)}`)} et ${M(`BA=${mat(BA)}`)}${okb ? ' : égaux.' : ' : différents, l’égalité est fausse.'}` });
    } },

  { id: 'e5-mat-error', cls: C, chapter: 'expertes-09', domain: 'matrices', skill: 'Trouver l’erreur dans un produit de matrices', fast: false,
    make(r, level) {
      const A = rmat(r), B = rmat(r), good = mmul(A, B), bad = r.int(0, 3), i = Math.floor(bad / 2), j = bad % 2;
      const wrongV = A[i][0] * B[j][0] + A[i][1] * B[j][1];
      if (wrongV === good[i][j]) return this.make(r, level);
      const shown = good.map((row) => row.slice()); shown[i][j] = wrongV;
      const entry = (ii, jj, wrong) => (wrong ? `c_{${ii + 1}${jj + 1}}=${par(A[ii][0])}\\times ${par(B[jj][0])}+${par(A[ii][1])}\\times ${par(B[jj][1])}=${wrongV}` : `c_{${ii + 1}${jj + 1}}=${par(A[ii][0])}\\times ${par(B[0][jj])}+${par(A[ii][1])}\\times ${par(B[1][jj])}=${good[ii][jj]}`);
      const lines = [0, 1, 2, 3].map((k) => M(entry(Math.floor(k / 2), k % 2, k === bad))); lines.push(M(`AB=${mat(shown)}`));
      return spot(`Un élève calcule ${M('AB')} avec ${M(`A=${mat(A)}`)} et ${M(`B=${mat(B)}`)}.`, lines, bad, `le coefficient ${M(`c_{${i + 1}${j + 1}}`)} est le produit de la ligne ${M(i + 1)} de ${M('A')} par la colonne ${M(j + 1)} de ${M('B')}, non par la ligne ${M(j + 1)}.`, M(entry(i, j, false)), M(`AB=${mat(good)}`), () => meq(good, A.map((row) => B[0].map((_, jj) => row[0] * B[0][jj] + row[1] * B[1][jj]))) && wrongV !== good[i][j]);
    } },

  { id: 'e5-mat-cayley', cls: C, chapter: 'expertes-09', domain: 'matrices', skill: 'Relation de Cayley-Hamilton et inverse', fast: false,
    make(r, level) {
      let A; do { A = rmat(r, -3, 4); } while (det2(A) === 0 || Math.abs(det2(A)) > 8);
      const t = A[0][0] + A[1][1], d = det2(A), A2 = mmul(A, A), rhs = madd(A.map((row) => row.map((x) => t * x)), I2.map((row) => row.map((x) => -d * x))), inv = [[F(t - A[0][0], d), F(-A[0][1], d)], [F(-A[1][0], d), F(t - A[1][1], d)]];
      return { q: `Soit ${M(`A=${mat(A)}`)}. 1) Calculer ${M('A^{2}')}. 2) Vérifier que ${M(`A^{2}=${sumTerms([[t, 'A'], [-d, 'I']])}`)}. 3) En déduire que ${M('A')} est inversible et donner ${M('A^{-1}')}.`, a: `1) ${M(`A^{2}=${mat(A2)}`)}. 2) ${M(`${sumTerms([[t, 'A'], [-d, 'I']])}=${mat(rhs)}`)} : égal à ${M('A^{2}')}. 3) ${M(`A^{2}${t === 0 ? '' : sgn(-t) + 'A'}=${sumTerms([[-d, 'I']])}`)} soit ${M(`A\\left(${sumTerms([[1, 'A'], [-t, 'I']])}\\right)=${sumTerms([[-d, 'I']])}`)} donc ${M(`A^{-1}=${coefTex(F(1, -d))}\\left(${sumTerms([[1, 'A'], [-t, 'I']])}\\right)=${matF(inv)}`)}.`,
        ok: () => meq(A2, rhs) && meqF(mmulF(mF(A), inv), mF(I2)) && d !== 0 };
    } },

  { id: 'e5-mat-power', cls: C, chapter: 'expertes-09', domain: 'matrices', skill: 'Puissances d’une matrice', fast: false,
    make(r, level) {
      const n = r.int(3, 9), kind = r.pick(level === 1 ? ['diag'] : level === 2 ? ['diag', 'unip'] : ['unip', 'tri']);
      if (kind === 'diag') { const p = r.int(2, 4), q = r.int(-3, 3), A = [[p, 0], [0, q]], good = [[p ** n, 0], [0, q ** n]];
        return { q: `Soit ${M(`A=${mat(A)}`)}. Calculer ${M(`A^{${n}}`)}.`, a: `La matrice est diagonale : ${M(`A^{${n}}=\\begin{pmatrix}${p}^{${n}}&0\\\\0&${par(q)}^{${n}}\\end{pmatrix}=${mat(good)}`)}.`, ok: () => meq(mpow(A, n), good) }; }
      if (kind === 'unip') { const a = r.nz(-4, 5), A = [[1, a], [0, 1]], good = [[1, n * a], [0, 1]];
        return { q: `Soit ${M(`A=${mat(A)}`)}. Conjecturer puis démontrer par récurrence l’expression de ${M('A^{n}')}, et calculer ${M(`A^{${n}}`)}.`, a: `${M(`A^{2}=${mat(mmul(A, A))}`)}, ${M(`A^{3}=${mat(mpow(A, 3))}`)} : ${M(`A^{n}=\\begin{pmatrix}1&${a}n\\\\0&1\\end{pmatrix}`)}. Hérédité : ${M('A^{n+1}=A^{n}A')}. Donc ${M(`A^{${n}}=${mat(good)}`)}.`, ok: () => meq(mpow(A, n), good) && meq(mmul(mpow(A, n), A), mpow(A, n + 1)) }; }
      const a = r.int(2, 3), b = r.nz(-3, 3), A = [[a, b], [0, a]], good = [[a ** n, n * a ** (n - 1) * b], [0, a ** n]];
      return { q: `Soit ${M(`A=${mat(A)}`)}. En écrivant ${M(`A=${a}I+N`)} avec ${M('N')} à préciser, calculer ${M(`A^{${n}}`)}.`, a: `${M(`N=${mat([[0, b], [0, 0]])}`)} et ${M('N^{2}=0')}. Comme ${M(`${a}I`)} et ${M('N')} commutent : ${M(`A^{n}=(${a}I)^{n}+n(${a}I)^{n-1}N`)}, soit ${M(`A^{${n}}=${mat(good)}`)}.`, ok: () => meq(mpow(A, n), good) };
    } },

  // ============================ 10 Graphes ============================
  { id: 'e5-graph-qcm', cls: C, chapter: 'expertes-10', domain: 'graphes', skill: 'QCM sur les graphes', fast: true,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['hand', 'walk'] : ['hand', 'walk', 'euler']), n = r.int(4, 6), A = randGraph(r, n, 0.55), deg = degrees(A), m = deg.reduce((s, x) => s + x, 0) / 2;
      if (m === 0) return this.make(r, level);
      if (kind === 'hand') return qcmNum(r, `Un graphe a ${M(n)} sommets de degrés ${M(deg.join(',\\ '))}. Son nombre d’arêtes est :`, [m, `la somme des degrés vaut le double du nombre d’arêtes : ${M(`\\dfrac{${deg.reduce((s, x) => s + x, 0)}}{2}=${m}`)}.`], [[2 * m, 'donne la somme des degrés.'], [n, 'donne le nombre de sommets.'], [m + 1, 'se trompe d’une unité.'], [Math.max(...deg), 'donne le degré maximal.']], M, (v) => v * 2 === deg.reduce((s, x) => s + x, 0));
      if (kind === 'walk') { const i = 0, j = r.int(1, n - 1), good = walksDFS(A, i, j, 2), prod = mmul(A, A);
        return qcmNum(r, `Un graphe a pour matrice d’adjacence ${M(`A=${mat(A)}`)} (sommets ${NAMES.slice(0, n).split('').join(',')}). Le nombre de chaînes de longueur 2 de ${M('A')} à ${M(NAMES[j])} est :`, [good, `c’est le coefficient ${M(`(A^{2})_{1${j + 1}}=\\sum_k a_{1k}a_{k${j + 1}}`)}.`], [[A[0][j], 'lit le coefficient de ' + M('A') + ' (chaînes de longueur 1).'], [good + 1, 'se trompe d’une unité.'], [A[0].reduce((s, x, k) => s + x + A[k][j], 0), 'additionne au lieu de multiplier.'], [deg[0] * deg[j], 'multiplie les degrés.']], M, (v) => v === prod[i][j] && v === walksDFS(A, i, j, 2)); }
      const odd = deg.filter((d) => d % 2).length, con = connected(A), has = con && (odd === 0 || odd === 2), answer = !con ? 'non (graphe non connexe)' : odd === 0 ? 'oui (un cycle)' : odd === 2 ? 'oui (une chaîne)' : 'non';
      const opts = ['oui (un cycle)', 'oui (une chaîne)', 'non', 'non (graphe non connexe)'];
      return qcmNum(r, `Un graphe a pour matrice d’adjacence ${M(`A=${mat(A)}`)}. Admet-il une chaîne eulérienne ? Si oui, est-ce un cycle ?`, [answer, `degrés ${M(deg.join(',\\ '))} : ${odd} sommet${odd > 1 ? 's' : ''} de degré impair, graphe ${con ? 'connexe' : 'non connexe'}.`], opts.filter((o) => o !== answer).map((o) => [o, 'ne tient pas compte des degrés impairs ou de la connexité.']), (o) => M(`\\text{${o}}`),
        (o) => (o === 'non (graphe non connexe)') === !con && (!con || ((o === 'oui (un cycle)') === (odd === 0) && (o === 'oui (une chaîne)') === (odd === 2) && (o === 'non') === (odd !== 0 && odd !== 2))));
    } },

  { id: 'e5-graph-tf', cls: C, chapter: 'expertes-10', domain: 'graphes', skill: 'Vrai ou faux sur les degrés et les chaînes', fast: true,
    make(r, level) {
      const n = r.int(4, 6), A = randGraph(r, n, 0.55), deg = degrees(A), yes = r.next() < 0.5, shown = yes ? deg.slice() : deg.map((d, i) => (i === 0 ? d + 1 : d)), sum = shown.reduce((s, x) => s + x, 0);
      if (sum === 0) return this.make(r, level);
      return tf({ s: `Il existe un graphe simple à ${n} sommets dont les degrés sont ${shown.join(', ')}.`, v: sum % 2 === 0, c: () => (sum % 2 === 0) === yes && (!yes || degrees(A).every((d, i) => d === shown[i])), j: sum % 2 === 0 ? `La somme des degrés est ${M(sum)}, paire ; et ce graphe existe, par exemple celui d’arêtes ${edgesTex(A)}.` : `La somme des degrés vaut ${M(sum)}, qui est impair : elle devrait être égale au double du nombre d’arêtes.` });
    } },

  { id: 'e5-graph-error', cls: C, chapter: 'expertes-10', domain: 'graphes', skill: 'Trouver l’erreur dans le comptage de chaînes', fast: false,
    make(r, level) {
      const n = r.int(4, 5), A = randGraph(r, n, 0.6), j = r.int(1, n - 1), good = walksDFS(A, 0, j, 2), bad = A[0].reduce((s, x, k) => s + x + A[k][j], 0);
      if (good === bad) return this.make(r, level);
      return spot(`Un graphe a pour matrice d’adjacence ${M(`A=${mat(A)}`)}. Un élève cherche le nombre de chaînes de longueur 2 de ${M('A')} à ${M(NAMES[j])}.`, [M(`\\text{c’est le coefficient }(A^{2})_{1${j + 1}}`), M(`(A^{2})_{1${j + 1}}=\\sum_{k}\\left(a_{1k}+a_{k${j + 1}}\\right)=${bad}`)], 1, 'on passe par un sommet intermédiaire ' + M('k') + ' : il faut une arête de ' + M('A') + ' à ' + M('k') + ' ET une arête de ' + M('k') + ' à ' + M(NAMES[j]) + ', donc on multiplie.', M(`(A^{2})_{1${j + 1}}=\\sum_{k}a_{1k}\\times a_{k${j + 1}}`), M(`(A^{2})_{1${j + 1}}=${good}`), () => walksDFS(A, 0, j, 2) === good && mmul(A, A)[0][j] === good && bad !== good);
    } },

  { id: 'e5-graph-walks', cls: C, chapter: 'expertes-10', domain: 'graphes', skill: 'Nombre de chaînes de longueur n avec la matrice d’adjacence', fast: false,
    make(r, level) {
      const n = r.int(4, 5), A = randGraph(r, n, 0.6), len = level === 1 ? 2 : r.int(3, 4), j = r.int(1, n - 1), P = mpow(A, len);
      return { q: `Le graphe de sommets ${NAMES.slice(0, n).split('').map((x) => M(x)).join(', ')} a pour arêtes ${edgesTex(A) || 'aucune'}. Écrire sa matrice d’adjacence ${M('A')}, puis déterminer le nombre de chaînes de longueur ${M(len)} reliant ${M('A')} à ${M(NAMES[j])}.`, a: `${M(`A=${mat(A)}`)}. Le coefficient ligne 1, colonne ${M(j + 1)} de ${M(`A^{${len}}`)} vaut ${M(P[0][j])} : il y a ${M(P[0][j])} chaîne${P[0][j] > 1 ? 's' : ''} de longueur ${M(len)} de ${M('A')} à ${M(NAMES[j])}.`,
        ok: () => P[0][j] === walksDFS(A, 0, j, len) && A.every((row, i) => row.every((x, k) => x === A[k][i])) && edgeList(A).length === A.reduce((s, row, i) => s + row.slice(i).reduce((a, b) => a + b, 0), 0) };
    } },

  { id: 'e5-graph-euler', cls: C, chapter: 'expertes-10', domain: 'graphes', skill: 'Degrés, connexité et chaîne eulérienne', fast: false,
    make(r, level) {
      const n = r.int(4, 6), A = randGraph(r, n, 0.6), deg = degrees(A), odd = deg.map((d, i) => (d % 2 ? NAMES[i] : null)).filter(Boolean), con = connected(A);
      return { q: `Le graphe de sommets ${NAMES.slice(0, n).split('').map((x) => M(x)).join(', ')} a pour arêtes ${edgesTex(A) || 'aucune'}. Donner le degré de chaque sommet, dire s’il est connexe et s’il possède une chaîne eulérienne (théorème d’Euler).`, a: `Degrés : ${deg.map((d, i) => M(`${NAMES[i]} : ${d}`)).join(' ; ')}. Sommets de degré impair : ${odd.length ? odd.map((x) => M(x)).join(', ') : 'aucun'}. Le graphe est ${con ? 'connexe' : 'non connexe'}. ${con && odd.length === 0 ? 'Il admet un cycle eulérien.' : con && odd.length === 2 ? `Il admet une chaîne eulérienne d’extrémités ${odd.map((x) => M(x)).join(' et ')}.` : 'Il n’admet pas de chaîne eulérienne.'}`,
        ok: () => { const d2 = A.map((row, i) => row.reduce((s, x) => s + x, 0)); return d2.every((d, i) => d === deg[i]) && deg.reduce((s, x) => s + x, 0) % 2 === 0 && odd.length % 2 === 0 && (odd.length === 0 || odd.length === 2 || odd.length > 2) && connected(A) === con; } };
    } },

  { id: 'e5-graph-color', cls: C, chapter: 'expertes-10', domain: 'graphes', skill: 'Nombre chromatique d’un petit graphe', fast: false,
    make(r, level) {
      const n = r.int(4, 6), A = randGraph(r, n, 0.55), deg = degrees(A), k = chromatic(A), cl = clique(A), Dmax = Math.max(...deg);
      if (deg.every((d) => d === 0)) return this.make(r, level);
      return { q: `Le graphe de sommets ${NAMES.slice(0, n).split('').map((x) => M(x)).join(', ')} a pour arêtes ${edgesTex(A)}. Donner un encadrement de son nombre chromatique ${M('\\gamma')} avec la taille d’un sous-graphe complet et le degré maximal, puis déterminer sa valeur.`, a: `Plus grand sous-graphe complet : ${M(cl)} sommets, donc ${M(`\\gamma\\geqslant ${cl}`)} ; degré maximal ${M(Dmax)}, donc ${M(`\\gamma\\leqslant ${Dmax + 1}`)}. En essayant les colorations : ${M(`\\gamma=${k}`)}.`,
        ok: () => colorable(A, k) && (k === 1 || !colorable(A, k - 1)) && cl <= k && k <= Dmax + 1 };
    } },

  // ============================ 11 Suites de matrices et chaînes de Markov ============================
  { id: 'e5-markov-qcm', cls: C, chapter: 'expertes-11', domain: 'matrices', skill: 'QCM sur les chaînes de Markov', fast: true,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['step', 'stoch'] : ['step', 'stoch', 'stat']);
      if (kind === 'step') { const a = r.int(1, 9), b = r.int(1, 9), x0 = r.int(1, 9), P = [[F(10 - a, 10), F(a, 10)], [F(b, 10), F(10 - b, 10)]], pi0 = [F(x0, 10), F(10 - x0, 10)], good = [add(mul(pi0[0], P[0][0]), mul(pi0[1], P[1][0])), add(mul(pi0[0], P[0][1]), mul(pi0[1], P[1][1]))];
        return qcmNum(r, `La matrice de transition est ${M(`P=${matF(P)}`)} et l’état initial ${M(`\\pi_0=\\left(${numTex(pi0[0])}\\ \\ ${numTex(pi0[1])}\\right)`)}. L’état ${M('\\pi_1=\\pi_0P')} est :`, [good, `${M("\\pi_1")} est le produit de la ligne ${M("\\pi_0")} par la matrice ${M("P")} : première coordonnée ${M(`${numTex(pi0[0])}\\times ${numTex(P[0][0])}+${numTex(pi0[1])}\\times ${numTex(P[1][0])}`)}.`],
          [[[add(mul(P[0][0], pi0[0]), mul(P[0][1], pi0[1])), add(mul(P[1][0], pi0[0]), mul(P[1][1], pi0[1]))], 'calcule ' + M('P\\pi_0^{T}') + ' (mauvais ordre du produit).'], [[pi0[0], pi0[1]], 'ne tient pas compte de la transition.'], [[good[1], good[0]], 'échange les deux coordonnées.']], (v) => M(`\\left(${numTex(v[0])}\\ \\ ${numTex(v[1])}\\right)`), (v) => eq(v[0], add(mul(pi0[0], P[0][0]), mul(pi0[1], P[1][0]))) && eq(add(v[0], v[1]), F(1))); }
      if (kind === 'stoch') { const a = r.int(1, 9), b = r.int(1, 9), good = [[F(10 - a, 10), F(a, 10)], [F(b, 10), F(10 - b, 10)]];
        return qcmNum(r, 'Laquelle de ces matrices est la matrice de transition d’une chaîne de Markov ?', [good, 'les coefficients sont dans ' + M('[0,1]') + ' et la somme de chaque ligne vaut ' + M(1) + '.'],
          [[[[F(10 - a, 10), F(a, 10)], [F(b, 10), F(b, 10)]], 'une ligne a pour somme différente de 1.'], [[[F(10 - a, 10), F(b, 10)], [F(a, 10), F(10 - b, 10)]].map((row) => row), 'les colonnes (et non les lignes) ont pour somme 1.'], [[[F(11 - a, 10), F(-1, 10)], [F(b, 10), F(10 - b, 10)]], 'contient un coefficient négatif.']], (m) => M(matF(m)), (m) => m.every((row) => row.every((x) => val(x) >= 0 && val(x) <= 1) && eq(row.reduce((s, x) => add(s, x), F(0)), F(1))));
      }
      const a = r.int(1, 8), b = r.int(1, 8), pi = [F(b, a + b), F(a, a + b)], P = [[F(10 - a, 10), F(a, 10)], [F(b, 10), F(10 - b, 10)]];
      return qcmNum(r, `Pour ${M(`P=${matF(P)}`)}, l’état stationnaire ${M('\\pi=(x\\ \\ y)')} (avec ${M('x+y=1')}) est :`, [pi, `${M('\\pi P=\\pi')} donne ${M(`${numTex(F(a, 10))}x=${numTex(F(b, 10))}y`)} avec ${M('x+y=1')}.`],
        [[[F(a, a + b), F(b, a + b)], 'échange les deux coordonnées.'], [[F(b, 10), F(a, 10)], 'oublie la condition ' + M('x+y=1') + '.'], [[F(1, 2), F(1, 2)], 'suppose l’équiprobabilité.']], (v) => M(`\\left(${fracTex(v[0])}\\ \\ ${fracTex(v[1])}\\right)`), (v) => eq(add(mul(v[0], P[0][0]), mul(v[1], P[1][0])), v[0]) && eq(add(v[0], v[1]), F(1)));
    } },

  { id: 'e5-markov-tf', cls: C, chapter: 'expertes-11', domain: 'matrices', skill: 'Vrai ou faux sur les chaînes de Markov', fast: true,
    make(r, level) {
      const a = r.int(1, 8), b = r.int(1, 8), P = [[F(10 - a, 10), F(a, 10)], [F(b, 10), F(10 - b, 10)]], pi = [F(b, a + b), F(a, a + b)], yes = r.next() < 0.5, shown = yes ? pi : [F(a, a + b), F(b, a + b)];
      const ok = eq(add(mul(shown[0], P[0][0]), mul(shown[1], P[1][0])), shown[0]);
      if (a === b) return this.make(r, level);
      return tf({ s: `Pour la matrice de transition ${M(`P=${matF(P)}`)}, l’état ${M(`\\left(${fracTex(shown[0])}\\ \\ ${fracTex(shown[1])}\\right)`)} est invariant (c’est-à-dire ${M('\\pi P=\\pi')}).`, v: ok, c: () => ok === (eq(add(mul(shown[0], P[0][1]), mul(shown[1], P[1][1])), shown[1]) && eq(add(shown[0], shown[1]), F(1))), j: `${M(`\\pi P=\\left(${fracTex(add(mul(shown[0], P[0][0]), mul(shown[1], P[1][0])))}\\ \\ ${fracTex(add(mul(shown[0], P[0][1]), mul(shown[1], P[1][1])))}\\right)`)}${ok ? ', égal à ' + M('\\pi') + '.' : ', différent de ' + M('\\pi') + '.'}` });
    } },

  { id: 'e5-markov-error', cls: C, chapter: 'expertes-11', domain: 'matrices', skill: 'Trouver l’erreur dans le calcul d’un état stationnaire', fast: false,
    make(r, level) {
      const a = r.int(1, 19), b = r.int(1, 19);
      if (a === b || a + b === 20) return this.make(r, level);
      const P = [[F(20 - a, 20), F(a, 20)], [F(b, 20), F(20 - b, 20)]], good = [F(b, a + b), F(a, a + b)], bad = [F(b, 1), F(a, 1)];
      return spot(`Pour ${M(`P=${matF(P)}`)}, un élève cherche l’état stationnaire ${M('\\pi=(x\\ \\ y)')}.`, [M(`\\pi P=\\pi\\iff ${numTex(F(a, 20))}x=${numTex(F(b, 20))}y`), M(`\\text{donc }${a}x=${b}y\\text{, soit }(x,y)\\text{ proportionnel à }(${b},${a})`), M(`\\pi=(${b}\\ \\ ${a})`)], 2, `les coordonnées d’un état de probabilité doivent avoir pour somme ${M(1)} : on divise par ${M(`${b}+${a}=${a + b}`)}.`, M(`x+y=1\\text{ donne }x=\\dfrac{${b}}{${a + b}}\\text{ et }y=\\dfrac{${a}}{${a + b}}`), M(`\\pi=\\left(${fracTex(good[0])}\\ \\ ${fracTex(good[1])}\\right)`),
        () => eq(add(good[0], good[1]), F(1)) && eq(add(mul(good[0], P[0][0]), mul(good[1], P[1][0])), good[0]) && !eq(add(bad[0], bad[1]), F(1)));
    } },

  { id: 'e5-markov-iter', cls: C, chapter: 'expertes-11', domain: 'matrices', skill: 'État d’une chaîne de Markov après n étapes', fast: false,
    make(r, level) {
      const a = r.int(1, 9), b = r.int(1, 9), P = [[F(100 - 10 * a, 100), F(10 * a, 100)], [F(10 * b, 100), F(100 - 10 * b, 100)]], p0 = F(r.int(0, 10), 10), n = level === 1 ? 2 : r.int(3, 5);
      let st = [p0, sub(F(1), p0)]; const hist = [st];
      for (let i = 0; i < n; i++) { st = [add(mul(st[0], P[0][0]), mul(st[1], P[1][0])), add(mul(st[0], P[0][1]), mul(st[1], P[1][1]))]; hist.push(st); }
      return { q: `Un système a deux états ${M('1')} et ${M('2')}. À chaque étape, il passe de l’état 1 à l’état 2 avec la probabilité ${M(numTex(P[0][1]))} et de l’état 2 à l’état 1 avec la probabilité ${M(numTex(P[1][0]))}. Au départ, la probabilité d’être dans l’état 1 est ${M(numTex(p0))}. Écrire la matrice de transition et calculer la loi après ${M(n)} étapes.`, a: `${M(`P=${matF(P)}`)} ; ${M(`\\pi_{k+1}=\\pi_kP`)} donne ${hist.slice(1).map((h, i) => M(`\\pi_{${i + 1}}=\\left(${numTex(h[0])}\\ \\ ${numTex(h[1])}\\right)`)).join(', ')}.`,
        ok: () => { let x = [p0, sub(F(1), p0)]; for (let i = 0; i < n; i++) { const a2 = add(mul(x[0], P[0][0]), mul(x[1], P[1][0])); x = [a2, sub(F(1), a2)]; } return eq(x[0], st[0]) && eq(x[1], st[1]) && eq(add(st[0], st[1]), F(1)); } };
    } },

  { id: 'e5-markov-stat', cls: C, chapter: 'expertes-11', domain: 'matrices', skill: 'Distribution invariante d’une chaîne à trois états', fast: false,
    make(r, level) {
      const k = level === 3 ? 3 : 2;
      if (k === 2) { const a = r.int(1, 19), b = r.int(1, 19), P = [[F(20 - a, 20), F(a, 20)], [F(b, 20), F(20 - b, 20)]], pi = [F(b, a + b), F(a, a + b)];
        return { q: `Déterminer l’état stationnaire de la chaîne de matrice de transition ${M(`P=${matF(P)}`)}.`, a: `${M(`\\pi P=\\pi`)} équivaut à ${M(`${numTex(F(a, 20))}x=${numTex(F(b, 20))}y`)} avec ${M('x+y=1')} : ${M(`\\pi=\\left(${fracTex(pi[0])}\\ \\ ${fracTex(pi[1])}\\right)`)}.`, ok: () => eq(add(pi[0], pi[1]), F(1)) && eq(add(mul(pi[0], P[0][0]), mul(pi[1], P[1][0])), pi[0]) && eq(add(mul(pi[0], P[0][1]), mul(pi[1], P[1][1])), pi[1]) }; }
      let P, pi;
      for (let t = 0; t < 50; t++) { P = Array.from({ length: 3 }, () => { const w = [r.int(1, 6), r.int(1, 6), r.int(1, 6)], s = w.reduce((x, y) => x + y, 0); return w.map((x) => F(x, s)); }); const A = [[sub(P[0][0], F(1)), P[1][0], P[2][0]], [P[0][1], sub(P[1][1], F(1)), P[2][1]], [F(1), F(1), F(1)]]; pi = solveF(A, [F(0), F(0), F(1)]); if (pi && pi.every((x) => val(x) > 0)) break; }
      if (!pi) return this.make(r, level);
      return { q: `Soit ${M(`P=${matF(P)}`)} la matrice de transition d’une chaîne à trois états. Déterminer l’état stationnaire ${M('\\pi=(x\\ \\ y\\ \\ z)')}.`, a: `On résout ${M('\\pi P=\\pi')} avec ${M('x+y+z=1')} : ${M(`\\pi=\\left(${fracTex(pi[0])}\\ \\ ${fracTex(pi[1])}\\ \\ ${fracTex(pi[2])}\\right)`)}${pi.some((x) => dec(x, 3).startsWith('\\approx')) ? ` (environ ${M(`(${pi.map((x) => (val(x)).toFixed(3).replace('.', '{,}')).join('\\ \\ ')})`)})` : ''}.`,
        ok: () => { const sum = pi.reduce((s, x) => add(s, x), F(0)); const next = [0, 1, 2].map((j) => pi.reduce((s, x, i) => add(s, mul(x, P[i][j])), F(0))); return eq(sum, F(1)) && next.every((x, j) => eq(x, pi[j])) && P.every((row) => eq(row.reduce((s, x) => add(s, x), F(0)), F(1))); } };
    } },

  { id: 'e5-markov-system', cls: C, chapter: 'expertes-11', domain: 'matrices', skill: 'Suites couplées et écriture matricielle', fast: false,
    make(r, level) {
      const a = r.int(1, 4) * 10, b = r.int(1, 4) * 10, N = 100 * r.int(2, 8), u0 = r.int(1, N / 100 - 1) * 100, v0 = N - u0, n = r.int(3, 5);
      const A = [[F(100 - a, 100), F(b, 100)], [F(a, 100), F(100 - b, 100)]];
      let X = [F(u0), F(v0)]; const hist = [X];
      for (let i = 0; i < n; i++) { X = [add(mul(A[0][0], X[0]), mul(A[0][1], X[1])), add(mul(A[1][0], X[0]), mul(A[1][1], X[1]))]; hist.push(X); }
      return { q: `Deux villes ${M('U')} et ${M('V')} comptent ${M(u0)} et ${M(v0)} habitants. Chaque année, ${M(`${a}\\,\\%`)} des habitants de ${M('U')} partent vivre en ${M('V')} et ${M(`${b}\\,\\%`)} des habitants de ${M('V')} partent vivre en ${M('U')}. On note ${M('X_n=\\begin{pmatrix}u_n\\\\v_n\\end{pmatrix}')}. Déterminer ${M('A')} telle que ${M('X_{n+1}=AX_n')}, puis calculer ${M(`X_{${n}}`)}. Que vaut ${M('u_n+v_n')} ?`, a: `${M(`A=${matF(A)}`)}. ${hist.slice(1).map((h, i) => M(`X_{${i + 1}}=\\begin{pmatrix}${numTex(h[0])}\\\\${numTex(h[1])}\\end{pmatrix}`)).join(', ')}. La somme est constante, égale à ${M(N)} : les colonnes de ${M('A')} ont pour somme ${M(1)}.`,
        ok: () => { let Y = [F(u0), F(v0)]; for (let i = 0; i < n; i++) Y = [add(mul(A[0][0], Y[0]), mul(A[0][1], Y[1])), add(mul(A[1][0], Y[0]), mul(A[1][1], Y[1]))]; return eq(Y[0], X[0]) && eq(Y[1], X[1]) && eq(add(X[0], X[1]), F(N)) && eq(add(A[0][0], A[1][0]), F(1)) && eq(add(A[0][1], A[1][1]), F(1)); } };
    } },
];

function gcdNo(a, b) { return a === b; }
