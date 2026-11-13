// Short generators (fast: suited to a timed starter) written for the weakest cells of the competency audit
// (docs/AUTOMATISMES_COMPETENCES.md): reading a table, a tree or a law (représenter), turning a described situation into an
// expression (modéliser), a short true/false (raisonner). Same contract as the class files: make(r, level) returns the
// statement, the answer and ok(), which recomputes the answer another way. Each generator carries its own class, so this
// file is not tied to one class; every id has its line in competencies.js.
import { F, add, sub, mul, eq, M, numTex, evalPoly, mulPoly } from './engine.js';
import { tf } from './premiere-kit.js';

const eur = (x) => `${x}\\ \\text{€}`;
const pc = (t) => `${t}\\,\\%`;                       // an integer rate
const pcF = (f) => `${numTex(f.n < 0 ? F(-f.n, f.d) : f)}\\,\\%`;   // the size of an exact rate (terminating decimal)
const ONE = F(1);
const tenth = (n) => F(n, 10);
const up = '\\nearrow', dn = '\\searrow';
const closed = (a, b) => `[${a}\\,;\\,${b}]`;
// exact number of solutions of g(x) = k for a continuous g, strictly monotone between consecutive nodes (xs, ys): each
// piece is replaced by the segment joining its ends (same number of solutions), and the distinct solutions are counted.
const countOnPieces = (xs, ys, k) => {
  const set = new Set();
  for (let i = 0; i + 1 < xs.length; i++) {
    const lo = Math.min(ys[i], ys[i + 1]), hi = Math.max(ys[i], ys[i + 1]);
    if (k < lo || k > hi) continue;
    const x = add(F(xs[i]), F((k - ys[i]) * (xs[i + 1] - xs[i]), ys[i + 1] - ys[i]));
    set.add(`${x.n}/${x.d}`);
  }
  return set.size;
};
const has = (n) => (n === 0 ? 'Elle n’a aucune solution' : n === 1 ? 'Elle a une seule solution' : `Elle a ${n} solutions`);
const sumTex = (terms, total) => (terms.length > 1 ? `${terms.join('+')}=${total}` : total);

export const competences = [
  // ---- Première : modéliser ----
  { id: 'p5-model-recurrence', cls: 'premiere', chapter: 'premiere-01', domain: 'suites', skill: 'Traduire une évolution par une relation de récurrence', fast: true,
    make(r, level) {
      if (level === 1) {
        const u0 = 10 * r.int(20, 95), d = r.int(2, 30), rise = r.next() < 0.5, what = r.pick(['Un abonnement annuel coûte', 'Une cotisation annuelle vaut', 'Un loyer mensuel vaut']);
        const step = (x) => (rise ? x + d : x - d), reason = rise ? d : -d;
        return { q: `${what} ${M(eur(u0))} la première année, puis ${rise ? 'augmente' : 'diminue'} de ${M(eur(d))} chaque année. On note ${M('u_n')} son montant l’année ${M('n')}. Exprimer ${M('u_{n+1}')} en fonction de ${M('u_n')} et donner la nature de la suite ${M('(u_n)')}.`, a: `${M(`u_{n+1}=u_n${rise ? '+' : '-'}${d}`)} : suite arithmétique de raison ${M(`${reason}`)}.`, ok: () => step(u0) - u0 === reason && step(step(u0)) - step(u0) === reason };
      }
      const t = r.pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25]), rise = r.next() < 0.5, q = F(rise ? 100 + t : 100 - t, 100);
      const change = (x) => (rise ? add(x, mul(x, F(t, 100))) : sub(x, mul(x, F(t, 100))));   // the evolution as the text says it
      if (level === 2) {
        const u0 = 100 * r.int(5, 90), what = r.pick(['Le nombre d’abonnés d’un journal est de', 'Un village compte', 'La production annuelle d’une usine est de']), unit = what.startsWith('Un village') ? 'habitants' : what.startsWith('Le nombre') ? 'personnes' : 'pièces';
        return { q: `${what} ${M(`${u0}`)} ${unit} cette année, et ce nombre ${rise ? 'augmente' : 'diminue'} de ${M(pc(t))} par an. On note ${M('u_n')} sa valeur dans ${M('n')} ans. Exprimer ${M('u_{n+1}')} en fonction de ${M('u_n')} et donner la nature de la suite ${M('(u_n)')}.`, a: `${M(`u_{n+1}=${numTex(q)}u_n`)} : suite géométrique de raison ${M(numTex(q))}.`, ok: () => eq(change(F(u0)), mul(q, F(u0))) && eq(change(change(F(u0))), mul(q, mul(q, F(u0)))) };
      }
      const u0 = 100 * r.int(20, 90), b = 10 * r.int(5, 40), plus = r.next() < 0.5, sb = plus ? b : -b;
      const next = (x) => add(change(x), F(sb)), u1 = next(F(u0)), u2 = next(u1);
      if (eq(u1, F(u0))) return this.make(r, level);   // a constant sequence would be both arithmetic and geometric
      return { q: `Une ville compte ${M(`${u0}`)} habitants. Chaque année, sa population ${rise ? 'augmente' : 'diminue'} de ${M(pc(t))}, puis ${M(`${b}`)} personnes ${plus ? 's’y installent' : 'la quittent'}. On note ${M('u_n')} la population dans ${M('n')} ans. Exprimer ${M('u_{n+1}')} en fonction de ${M('u_n')}. La suite ${M('(u_n)')} est-elle arithmétique ? géométrique ?`, a: `${M(`u_{n+1}=${numTex(q)}u_n${plus ? '+' : '-'}${b}`)}. Elle n’est ni arithmétique (${M('u_1-u_0\\neq u_2-u_1')}) ni géométrique (${M('\\dfrac{u_1}{u_0}\\neq\\dfrac{u_2}{u_1}')}).`, ok: () => eq(u1, add(mul(q, F(u0)), F(sb))) && !eq(sub(u1, F(u0)), sub(u2, u1)) && !eq(mul(u1, u1), mul(F(u0), u2)) };
    } },
  { id: 'p5-model-area', cls: 'premiere', chapter: 'premiere-06', domain: 'analyse', skill: 'Exprimer une grandeur à optimiser en fonction de x', fast: true,
    make(r, level) {
      const unit = r.pick(['cm', 'm', 'dm']), u = `\\ \\text{${unit}}`;
      if (level === 1) {
        const h = r.int(6, 45), P = 2 * h, shape = r.pick(['Un rectangle', 'Un cadre rectangulaire', 'Un enclos rectangulaire']);
        return { q: `${shape} a pour périmètre ${M(`${P}${u}`)}. On note ${M('x')} la longueur d’un de ses côtés (en ${unit}). Exprimer son aire ${M('A(x)')} en fonction de ${M('x')} et préciser les valeurs possibles de ${M('x')}.`, a: `L’autre côté mesure ${M(`${h}-x`)} : ${M(`A(x)=x(${h}-x)`)} pour ${M(`x\\in]0\\,;\\,${h}[`)}.`, ok: () => [1, 2, h - 1].every((x) => { const other = (P - 2 * x) / 2; return other > 0 && x * other === evalPoly([-1, h, 0], x); }) };
      }
      if (level === 2) {
        const h = r.int(5, 60), L = 2 * h, thing = r.pick(['un enclos', 'un potager', 'un parc à vélos']);
        return { q: `On construit ${thing} rectangulaire adossé à un mur avec ${M(`${L}${u}`)} de grillage pour les trois autres côtés. On note ${M('x')} la longueur (en ${unit}) de chacun des deux côtés perpendiculaires au mur. Exprimer l’aire ${M('A(x)')} en fonction de ${M('x')} et préciser les valeurs possibles de ${M('x')}.`, a: `Le côté parallèle au mur mesure ${M(`${L}-2x`)} : ${M(`A(x)=x(${L}-2x)`)} pour ${M(`x\\in]0\\,;\\,${h}[`)}.`, ok: () => [1, 2, h - 1].every((x) => { const side = L - x - x; return side > 0 && x * side === evalPoly([-2, L, 0], x); }) };
      }
      if (r.next() < 0.5) {   // rectangular sheet c × d: V(x) = x(c - 2x)(d - 2x), x below half the shorter side
        const h = r.int(5, 30), c = 2 * h, d = c + 2 * r.int(1, 15), cube = mulPoly([1, 0], mulPoly([-2, c], [-2, d]));
        return { q: `Dans une feuille rectangulaire de ${M(`${c}${u}`)} sur ${M(`${d}${u}`)}, on découpe à chaque coin un carré de côté ${M('x')} (en ${unit}), puis on relève les bords pour former une boîte sans couvercle. Exprimer le volume ${M('V(x)')} de la boîte en fonction de ${M('x')} et préciser les valeurs possibles de ${M('x')}.`, a: `Le fond est un rectangle de ${M(`${c}-2x`)} sur ${M(`${d}-2x`)} et la hauteur vaut ${M('x')} : ${M(`V(x)=x(${c}-2x)(${d}-2x)`)} pour ${M(`x\\in]0\\,;\\,${h}[`)}.`, ok: () => [1, 2, h - 1].every((x) => { const w = c - x - x, l = d - x - x; return w > 0 && l > w && w * l * x === evalPoly(cube, x); }) };
      }
      const h = r.int(5, 30), c = 2 * h, cube = mulPoly([1, 0], mulPoly([-2, c], [-2, c]));
      return { q: `Dans une feuille carrée de côté ${M(`${c}${u}`)}, on découpe à chaque coin un carré de côté ${M('x')} (en ${unit}), puis on relève les bords pour former une boîte sans couvercle. Exprimer le volume ${M('V(x)')} de la boîte en fonction de ${M('x')} et préciser les valeurs possibles de ${M('x')}.`, a: `Le fond est un carré de côté ${M(`${c}-2x`)} et la hauteur vaut ${M('x')} : ${M(`V(x)=x(${c}-2x)^{2}`)} pour ${M(`x\\in]0\\,;\\,${h}[`)}.`, ok: () => [1, 2, h - 1].every((x) => { const base = c - x - x; return base > 0 && base * base * x === evalPoly(cube, x); }) };
    } },
  // ---- Première : représenter ----
  { id: 'p5-read-variations', cls: 'premiere', chapter: 'premiere-06', domain: 'analyse', skill: 'Lire un tableau de variations : extremum, signe de la dérivée, nombre de solutions', fast: true,
    make(r, level) {
      const flip = r.next() < 0.5, s = flip ? -1 : 1, f = r.pick(['f', 'g', 'h']);
      const a = r.int(-9, 2), b = a + r.int(1, 5), c = b + r.int(1, 5);
      const top = r.int(3, 9), ya = s * r.int(-6, top - 1), yb = s * top, yc = s * r.int(-6, top - 1);
      const xs = [a, b, c], ys = [ya, yb, yc], a1 = flip ? dn : up, a2 = flip ? up : dn;
      const tab = `\\begin{array}{c|ccccc}x&${a}&&${b}&&${c}\\\\\\hline ${f}(x)&${ya}&${a1}&${yb}&${a2}&${yc}\\end{array}`;
      const head = `La fonction ${M(f)} est dérivable sur ${M(closed(a, c))} ; son tableau de variations est : ${M(tab)}`;
      const word = flip ? 'minimum' : 'maximum';
      if (level === 1) return { q: `${head} Donner le ${word} de ${M(f)} sur ${M(closed(a, c))} et la valeur de ${M('x')} où il est atteint.`, a: `Le ${word} vaut ${M(`${yb}`)}, atteint en ${M(`x=${b}`)}.`, ok: () => (flip ? Math.min(...ys) : Math.max(...ys)) === yb && ys.indexOf(yb) === xs.indexOf(b) && ys.filter((y) => y === yb).length === 1 };
      if (level === 2) {
        const want = r.next() < 0.5, on = want !== flip ? [a, b] : [b, c];   // want: where the derivative is positive or zero
        return { q: `${head} Sur quel intervalle a-t-on ${M(`${f}'(x)${want ? '\\geqslant ' : '\\leqslant '}0`)} ?`, a: `Sur ${M(closed(on[0], on[1]))}, où ${M(f)} est ${want ? 'croissante' : 'décroissante'}.`, ok: () => { const i = xs.indexOf(on[0]); return xs[i + 1] === on[1] && (want ? ys[i + 1] > ys[i] : ys[i + 1] < ys[i]); } };
      }
      const k = r.int(Math.min(...ys) - 1, Math.max(...ys) + 1), between = (u, v) => k >= Math.min(u, v) && k <= Math.max(u, v);
      const n = (between(ya, yb) ? 1 : 0) + (between(yb, yc) ? 1 : 0) - (k === yb ? 1 : 0);
      return { q: `${head} Combien l’équation ${M(`${f}(x)=${k}`)} a-t-elle de solutions dans ${M(closed(a, c))} ?`, a: `${has(n)} : on compare ${M(`${k}`)} aux valeurs ${M(`${ya}`)}, ${M(`${yb}`)} et ${M(`${yc}`)} du tableau, sur chaque intervalle où ${M(f)} est continue et strictement monotone.`, ok: () => n === countOnPieces(xs, ys, k) };
    } },
  { id: 'p5-read-tree', cls: 'premiere', chapter: 'premiere-05', domain: 'stats-proba', skill: 'Lire et compléter un arbre pondéré', fast: true,
    make(r, level) {
      const pn = r.int(1, 9), an = r.int(1, 9), bn = r.int(1, 9);
      if (an === bn) return this.make(r, level);
      const p = tenth(pn), pa = tenth(an), pb = tenth(bn), nA = '\\overline{A}', nB = '\\overline{B}';
      const head = `Un arbre pondéré a pour premières branches ${M('A')} et ${M(nA)}, suivies chacune des branches ${M('B')} et ${M(nB)}. On y lit ${M(`P(A)=${numTex(p)}`)}, ${M(`P_A(B)=${numTex(pa)}`)} et ${M(`P_{${nA}}(B)=${numTex(pb)}`)}.`;
      if (level === 1) return { q: `${head} Quelles probabilités portent la branche ${M(nA)}, puis la branche ${M(nB)} issue de ${M('A')} ?`, a: `${M(`P(${nA})=${numTex(sub(ONE, p))}`)} et ${M(`P_A(${nB})=${numTex(sub(ONE, pa))}`)} : la somme des probabilités des branches issues d’un même nœud vaut ${M('1')}.`, ok: () => eq(add(p, tenth(10 - pn)), ONE) && eq(add(pa, tenth(10 - an)), ONE) && eq(sub(ONE, p), tenth(10 - pn)) && eq(sub(ONE, pa), tenth(10 - an)) };
      if (level === 2) { const x = mul(sub(ONE, p), pb); return { q: `${head} Quel chemin de l’arbre donne ${M(`P(${nA}\\cap B)`)} ? Calculer cette probabilité.`, a: `Le chemin ${M(nA)} puis ${M('B')} : on multiplie le long du chemin, ${M(`P(${nA}\\cap B)=${numTex(sub(ONE, p))}\\times ${numTex(pb)}=${numTex(x)}`)}.`, ok: () => eq(x, F((10 - pn) * bn, 100)) }; }
      const x = add(mul(p, sub(ONE, pa)), mul(sub(ONE, p), sub(ONE, pb)));
      return { q: `${head} Quels chemins de l’arbre mènent à ${M(nB)} ? En déduire ${M(`P(${nB})`)}.`, a: `Les chemins ${M('A')} puis ${M(nB)}, et ${M(nA)} puis ${M(nB)} : ${M(`P(${nB})=${numTex(p)}\\times ${numTex(sub(ONE, pa))}+${numTex(sub(ONE, p))}\\times ${numTex(sub(ONE, pb))}=${numTex(x)}`)}.`, ok: () => eq(x, sub(ONE, F(pn * an + (10 - pn) * bn, 100))) };
    } },
  // ---- Terminale : représenter ----
  { id: 't5-read-limits-table', cls: 'terminale', chapter: 'terminale-04', domain: 'analyse', skill: 'Lire des limites, des asymptotes et un nombre de solutions sur un tableau de variations', fast: true,
    make(r, level) {
      const flip = r.next() < 0.5, s = flip ? -1 : 1, f = r.pick(['f', 'g', 'h']);
      const a = r.int(-7, 7), m = s * r.int(3, 9), l1 = s * r.int(-6, 2), l2 = s * r.int(-6, 2);
      const tab = `\\begin{array}{c|ccccc}x&-\\infty&&${a}&&+\\infty\\\\\\hline ${f}(x)&${l1}&${flip ? dn : up}&${m}&${flip ? up : dn}&${l2}\\end{array}`;
      const head = `La fonction ${M(f)} est continue sur ${M('\\mathbb{R}')} ; son tableau de variations, avec ses limites en ${M('-\\infty')} et en ${M('+\\infty')}, est : ${M(tab)}`;
      if (level === 1) {
        const cells = tab.split('\\hline ')[1].replace('\\end{array}', '').split('&');   // read back from the table itself
        return { q: `${head} Donner les équations des asymptotes horizontales à la courbe de ${M(f)}.`, a: l1 === l2 ? `Une seule droite : ${M(`y=${l1}`)}, asymptote en ${M('-\\infty')} et en ${M('+\\infty')}.` : `${M(`y=${l1}`)} en ${M('-\\infty')} et ${M(`y=${l2}`)} en ${M('+\\infty')}.`, ok: () => Number(cells[1]) === l1 && Number(cells[5]) === l2 && Number(cells[3]) === m };
      }
      // level 2: a value off the table; level 3: a limit or the extremum itself (a limit is not reached)
      const lo = Math.min(l1, l2, m), hi = Math.max(l1, l2, m);
      let k = level === 3 ? r.pick([l1, l2, m]) : r.int(lo - 1, hi + 1);
      if (level === 2 && [l1, l2, m].includes(k)) return this.make(r, level);
      const inside = (l) => (flip ? k >= m && k < l : k > l && k <= m);   // values taken on a branch: from the limit (excluded) to the extremum (included)
      const n = (inside(l1) ? 1 : 0) + (inside(l2) ? 1 : 0) - (k === m ? 1 : 0);
      // another way: on a branch the equation has a solution exactly when the ratio (k - limit)/(extremum - limit) lies in ]0 ; 1]
      const ratio = (l) => F(k - l, m - l), hit = (l) => { const q = ratio(l); return q.n > 0 && q.n <= q.d; };
      const why = k === m ? `${M(`${k}`)} est l’extremum, atteint une seule fois` : [l1, l2].includes(k) ? `une limite n’est pas atteinte sur une branche strictement monotone` : `on compare ${M(`${k}`)} aux valeurs du tableau sur chaque branche`;
      return { q: `${head} Combien l’équation ${M(`${f}(x)=${k}`)} a-t-elle de solutions dans ${M('\\mathbb{R}')} ?`, a: `${has(n)} : ${why}.`, ok: () => n === (k === m ? 1 : (hit(l1) ? 1 : 0) + (hit(l2) ? 1 : 0)) };
    } },
  { id: 't5-read-convexity', cls: 'terminale', chapter: 'terminale-06', domain: 'analyse', skill: 'Lire la convexité et les points d’inflexion sur le signe de la dérivée seconde', fast: true,
    make(r, level) {
      const f = r.pick(['f', 'g', 'h']), s0 = r.sign(), a = r.int(-12, 12), b = a + r.int(1, 6);
      // zeros of the second derivative and its sign on each interval; level 3 has a zero without change of sign
      const xs = level === 1 ? [a] : [a, b];
      const signs = level === 1 ? [s0, -s0] : level === 2 ? [s0, -s0, s0] : r.pick([[s0, s0, -s0], [s0, -s0, -s0]]);
      const sg = (v) => (v > 0 ? '+' : '-');
      const tab = `\\begin{array}{c|${'c'.repeat(2 * xs.length + 3)}}x&-\\infty&&${xs.join('&&')}&&+\\infty\\\\\\hline ${f}''(x)&&${signs.map(sg).join('&0&')}&\\end{array}`;
      const bounds = ['-\\infty', ...xs, '+\\infty'], pieces = [];
      signs.forEach((v, i) => { if (v < 0) return; const last = pieces[pieces.length - 1]; if (last && last[1] === i) last[1] = i + 1; else pieces.push([i, i + 1]); });
      const iv = ([i, j]) => `${i === 0 ? ']' : '['}${bounds[i]}\\,;\\,${bounds[j]}${j === bounds.length - 1 ? '[' : ']'}`;
      const infl = xs.filter((_, i) => signs[i] !== signs[i + 1]);
      // another way: the sign of an explicit second derivative s0 (x - a)^e1 (x - b)^e2 at test points
      const exps = xs.map((_, i) => (signs[i] !== signs[i + 1] ? 1 : 2)), d2 = (x) => xs.reduce((v, z, i) => v * (x - z) ** exps[i], signs[0] * (xs.reduce((v, _, i) => v * (-1) ** exps[i], 1)));
      const mids = [xs[0] - 1, ...xs.slice(1).map((z, i) => (z + xs[i]) / 2), xs[xs.length - 1] + 1];
      return { q: `La fonction ${M(f)} est deux fois dérivable sur ${M('\\mathbb{R}')} ; le signe de sa dérivée seconde est donné par : ${M(tab)} Sur quel(s) intervalle(s) ${M(f)} est-elle convexe ? Donner les abscisses des points d’inflexion de sa courbe.`, a: `${M(f)} est convexe sur ${pieces.map((p) => M(iv(p))).join(' et sur ')} (là où ${M(`${f}''\\geqslant 0`)}). ${infl.length === 1 ? `Un seul point d’inflexion, d’abscisse ${M(`${infl[0]}`)}` : `Deux points d’inflexion, d’abscisses ${M(`${infl[0]}`)} et ${M(`${infl[1]}`)}`} : ${M(`${f}''`)} s’y annule en changeant de signe${infl.length < xs.length ? ` (pas en ${M(`${xs.find((z) => !infl.includes(z))}`)}, où le signe ne change pas)` : ''}.`, ok: () => mids.every((x, i) => Math.sign(d2(x)) === signs[i]) && xs.every((z, i) => (Math.sign(d2(z - 0.5)) !== Math.sign(d2(z + 0.5))) === infl.includes(z)) && pieces.length >= 1 && pieces.every(([i, j]) => signs.slice(i, j).every((v) => v > 0)) };
    } },
  // ---- Maths expertes : modéliser ----
  { id: 'e5-model-transition', cls: 'expertes', chapter: 'expertes-11', domain: 'matrices', skill: 'Traduire une situation par une matrice de transition', fast: true,
    make(r, level) {
      const mt = (rows) => `\\begin{pmatrix}${rows.map((row) => row.map(numTex).join('&')).join('\\\\')}\\end{pmatrix}`;
      const rowsOk = (rows) => rows.every((row) => eq(row.reduce((x, y) => add(x, y), F(0)), ONE) && row.every((x) => x.n >= 0));
      const tail = (names) => `Écrire la matrice de transition ${M('P')} de cette chaîne de Markov (états dans l’ordre ${names.map((x) => M(x)).join(', ')} ; lignes : état de départ).`;
      if (level < 3) {
        const pn = r.int(1, 9), qn = r.int(1, 9), ctx = r.pick([['Chaque mois, un abonné de l’opérateur', 'passe chez'], ['Chaque année, un client de l’assureur', 'passe chez'], ['Chaque année, un salarié du site', 'est muté sur le site']]);
        const P = [[tenth(10 - pn), tenth(pn)], [tenth(qn), tenth(10 - qn)]];
        const text = level === 1
          ? `${ctx[0]} ${M('A')} ${ctx[1]} ${M('B')} avec la probabilité ${M(numTex(tenth(pn)))}, et un de ${M('B')} ${ctx[1]} ${M('A')} avec la probabilité ${M(numTex(tenth(qn)))} ; sinon il ne change pas.`
          : `${ctx[0]} ${M('A')} y reste avec la probabilité ${M(numTex(tenth(10 - pn)))} ; un de ${M('B')} ${ctx[1]} ${M('A')} dans ${M(pc(10 * qn))} des cas. Il n’y a que ces deux états.`;
        return { q: `${text} ${tail(['A', 'B'])}`, a: M(`P=${mt(P)}`), ok: () => rowsOk(P) && eq(P[0][1], sub(ONE, P[0][0])) && eq(P[1][0], tenth(qn)) && eq(sub(ONE, P[0][0]), tenth(pn)) };
      }
      const out = [0, 1, 2].map(() => { const x = r.int(1, 5), y = r.int(1, 4); return [x, y]; }), names = ['A', 'B', 'C'];
      const P = out.map(([x, y], i) => { const row = [0, 0, 0], others = [0, 1, 2].filter((j) => j !== i); row[others[0]] = tenth(x); row[others[1]] = tenth(y); row[i] = tenth(10 - x - y); return row; });
      const says = out.map(([x, y], i) => { const o = names.filter((_, j) => j !== i); return `depuis ${M(names[i])}, on passe en ${M(o[0])} avec la probabilité ${M(numTex(tenth(x)))} et en ${M(o[1])} avec la probabilité ${M(numTex(tenth(y)))}`; });
      return { q: `Un système a trois états ${M('A')}, ${M('B')} et ${M('C')}. À chaque étape : ${says.join(' ; ')} ; sinon on reste dans le même état. ${tail(names)}`, a: M(`P=${mt(P)}`), ok: () => rowsOk(P) && P.every((row, i) => eq(row[i], sub(ONE, add(...row.filter((_, j) => j !== i))))) && out.every(([x, y], i) => { const o = [0, 1, 2].filter((j) => j !== i); return eq(P[i][o[0]], F(x, 10)) && eq(P[i][o[1]], F(y, 10)); }) };
    } },
  // ---- Terminale STMG : raisonner, représenter, modéliser ----
  { id: 'm5-evol-vf', cls: 'stmg', chapter: 'stmg-02', domain: 'nombres', skill: 'Vrai ou faux rapide sur les évolutions', fast: true,
    make(r, level) {
      const cm = (t) => F(100 + t, 100), rate = (q) => sub(mul(q, F(100)), F(100));   // rate in percent of a multiplier
      if (level === 1) {
        const t = r.int(1, 95), v = r.next() < 0.5, q = cm(t), said = v ? t : 100 + t;
        return tf({ s: `Multiplier une grandeur par ${M(numTex(q))} revient à l’augmenter de ${M(pc(said))}.`, v, j: `${M(`${numTex(q)}=1+\\dfrac{${t}}{100}`)} : c’est une hausse de ${M(pc(t))}${v ? '' : `, pas de ${M(pc(said))}`}.`, c: () => eq(rate(q), F(said)) === v && eq(mul(q, F(200)), F(200 + 2 * t)) });
      }
      if (level === 2 && r.next() < 0.5) {
        const a = 5 * r.int(1, 12), b = 5 * r.int(1, 12), g = rate(mul(cm(a), cm(b)));
        return tf({ s: `Augmenter une grandeur de ${M(pc(a))} puis de ${M(pc(b))} revient à l’augmenter de ${M(pc(a + b))}.`, v: false, j: `${M(`${numTex(cm(a))}\\times ${numTex(cm(b))}=${numTex(mul(cm(a), cm(b)))}`)} : la hausse globale est de ${M(pcF(g))}, les taux ne s’ajoutent pas.`, c: () => (100 + a) * (100 + b) - 10000 !== 100 * (a + b) && eq(g, F((100 + a) * (100 + b) - 10000, 100)) });
      }
      if (level === 2) {
        const v = r.next() < 0.4, [t, h] = v ? r.pick([[20, 25], [50, 100], [60, 150], [75, 300], [80, 400]]) : (() => { const x = r.pick([5, 10, 15, 20, 25, 30, 40, 50]); return [x, x]; })(), q = mul(cm(-t), cm(h));
        return tf({ s: `Une baisse de ${M(pc(t))} est exactement compensée par une hausse de ${M(pc(h))}.`, v, j: `${M(`${numTex(cm(-t))}\\times ${numTex(cm(h))}=${numTex(q)}`)}${v ? ' : on retrouve la valeur de départ.' : ` : on ne retrouve pas la valeur de départ (il reste une baisse de ${M(pcF(rate(q)))}).`}`, c: () => ((100 - t) * (100 + h) === 10000) === v });
      }
      const t = r.int(2, 50), n = r.pick([2, 3]), rise = r.next() < 0.5, one = cm(rise ? t : -t), q = n === 2 ? mul(one, one) : mul(one, mul(one, one)), g = rate(q), gv = Math.abs(g.n / g.d);
      return tf({ s: `${rise ? 'Augmenter' : 'Diminuer'} une grandeur de ${M(pc(t))}, ${n === 2 ? 'deux' : 'trois'} fois de suite, revient à ${rise ? 'l’augmenter' : 'la diminuer'} de ${M(pc(n * t))}.`, v: false, j: `${M(`${numTex(one)}^{${n}}=${numTex(q)}`)} : l’évolution globale est une ${rise ? 'hausse' : 'baisse'} de ${M(pcF(g))}, pas de ${M(pc(n * t))}.`, c: () => { let x = F(1); for (let i = 0; i < n; i++) x = mul(x, F(rise ? 100 + t : 100 - t, 100)); const k = F(Math.round(gv * 10 ** 6), 10 ** 6); return eq(x, q) && !eq(rate(x), F(rise ? n * t : -n * t)) && eq(rate(x), rise ? k : F(-k.n, k.d)); } });   // exact product, independent of the display
    } },
  { id: 'm5-read-law', cls: 'stmg', chapter: 'stmg-07', domain: 'stats-proba', skill: 'Lire une probabilité dans le tableau d’une loi', fast: true,
    make(r, level) {
      const x0 = r.int(-3, 3), xs = [x0]; for (let i = 0; i < 3; i++) xs.push(xs[i] + r.int(1, 4));
      const cuts = r.shuffle(Array.from({ length: 19 }, (_, i) => i + 1)).slice(0, 3).sort((u, v) => u - v), w = [cuts[0], cuts[1] - cuts[0], cuts[2] - cuts[1], 20 - cuts[2]];   // twentieths
      const p = (n) => numTex(F(n, 20)), tab = `\\begin{array}{c|cccc}x_i&${xs.join('&')}\\\\\\hline P(X=x_i)&${w.map(p).join('&')}\\end{array}`;
      const head = `La loi de probabilité d’une variable aléatoire ${M('X')} est donnée par le tableau : ${M(tab)}`;
      const total = (keep) => xs.reduce((sum, x, i) => sum + (keep(x) ? w[i] : 0), 0);
      if (level === 1) { const j = r.int(0, 3); return { q: `${head} Lire ${M(`P(X=${xs[j]})`)}, puis donner ${M(`P(X\\neq ${xs[j]})`)}.`, a: `${M(`P(X=${xs[j]})=${p(w[j])}`)} et ${M(`P(X\\neq ${xs[j]})=1-${p(w[j])}=${p(20 - w[j])}`)}.`, ok: () => total((x) => x !== xs[j]) === 20 - w[j] && total(() => true) === 20 }; }
      if (level === 2) {
        const k = xs[r.int(1, 2)], ge = r.next() < 0.5, n = total((x) => (ge ? x >= k : x <= k)), terms = xs.map((x, i) => [x, w[i]]).filter(([x]) => (ge ? x >= k : x <= k)).map(([, v]) => p(v));
        return { q: `${head} Calculer ${M(`P(X${ge ? '\\geqslant ' : '\\leqslant '}${k})`)}.`, a: M(`P(X${ge ? '\\geqslant ' : '\\leqslant '}${k})=${sumTex(terms, p(n))}`), ok: () => n === 20 - total((x) => (ge ? x < k : x > k)) && n > 0 && n < 20 };
      }
      const k = xs[r.int(1, 2)], kind = r.int(0, 2), keep = [(x) => x > k, (x) => x < k, (x) => x !== k && x > xs[0]][kind];
      const said = [`strictement supérieure à ${M(`${k}`)}`, `strictement inférieure à ${M(`${k}`)}`, `différente de ${M(`${k}`)} et strictement supérieure à ${M(`${xs[0]}`)}`][kind];
      const n = total(keep), terms = xs.map((x, i) => [x, w[i]]).filter(([x]) => keep(x)).map(([, v]) => p(v));
      return { q: `${head} Quelle est la probabilité que ${M('X')} prenne une valeur ${said} ?`, a: `On additionne les probabilités des valeurs qui conviennent : ${M(sumTex(terms, p(n)))}.`, ok: () => n === 20 - total((x) => !keep(x)) && n > 0 && n < 20 };
    } },
  { id: 'm5-model-exp', cls: 'stmg', chapter: 'stmg-02', domain: 'fonctions', skill: 'Traduire une évolution à taux constant par une fonction exponentielle', fast: true,
    make(r, level) {
      const t = r.pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30]), C = 100 * r.int(5, 95);
      const model = (q) => `f(x)=${C}\\times ${numTex(q)}^{x}`;
      if (level === 1) {
        const q = F(100 + t, 100), ctx = r.pick([`Un capital de ${M(eur(C))} est placé à intérêts composés au taux annuel de ${M(pc(t))}`, `Un loyer annuel de ${M(eur(C))} augmente de ${M(pc(t))} par an`, `Le chiffre d’affaires d’une boutique, de ${M(eur(C))} cette année, augmente de ${M(pc(t))} par an`]);
        return { q: `${ctx}. Exprimer sa valeur ${M('f(x)')}, en euros, au bout de ${M('x')} années.`, a: `Coefficient multiplicateur ${M(numTex(q))} : ${M(model(q))}.`, ok: () => eq(mul(F(C), q), add(F(C), F(C * t, 100))) };
      }
      if (level === 2) {
        const q = F(100 - t, 100), ctx = r.pick([`Une machine achetée ${M(eur(C))} perd ${M(pc(t))} de sa valeur chaque année`, `Une voiture achetée ${M(eur(C))} se déprécie de ${M(pc(t))} par an`, `Un stock d’une valeur de ${M(eur(C))} diminue de ${M(pc(t))} par an`]);
        return { q: `${ctx}. Exprimer sa valeur ${M('f(x)')}, en euros, au bout de ${M('x')} années.`, a: `Coefficient multiplicateur ${M(numTex(q))} : ${M(model(q))}.`, ok: () => eq(mul(F(C), q), sub(F(C), F(C * t, 100))) };
      }
      const rise = r.next() < 0.5, q = F(rise ? 100 + t : 100 - t, 100), back = sub(mul(q, F(100)), F(100));
      return { q: `La valeur d’un bien, en euros, est modélisée par ${M(model(q))}, où ${M('x')} est le nombre d’années écoulées. Quelle valeur initiale et quelle évolution annuelle ce modèle décrit-il ?`, a: `Valeur initiale ${M(`f(0)=${eur(C)}`)} ; chaque année la valeur est multipliée par ${M(numTex(q))}, soit une ${rise ? 'hausse' : 'baisse'} de ${M(pc(t))} par an.`, ok: () => eq(back, F(rise ? t : -t)) && eq(mul(F(C), q), F(C * (rise ? 100 + t : 100 - t), 100)) };
    } },
];
