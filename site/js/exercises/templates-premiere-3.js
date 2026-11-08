// Première generators, third file: chapters 05 (probabilités conditionnelles), 06 (variations, optimisation),
// 07 (géométrie repérée), 08 (variables aléatoires). Same contract and formats as templates-premiere-2.js.
import { F, add, sub, mul, div, val, eq, M, R, fracTex, numTex, roundTex, polyTex, evalPoly, sgn, par, gcd, sqrtTex, sqrtParts, binom, sum } from './engine.js';
import { near, nd, coef, opt, mcq, tf, spot, OPS, ineqSet, xm } from './premiere-kit.js';
import { pt, vc, lin, normLine, affTex, ivTex } from './seconde-kit.js';

const C = 'premiere';
const P4 = (f) => numTex(f);                     // probability as a decimal when it terminates, else a fraction
const pc = (k) => numTex(F(k, 10));              // k tenths
const dec2 = (k) => numTex(F(k, 100));           // k hundredths

export const premiere3 = [
  // ============================ 05 Probabilités conditionnelles ============================
  { id: 'p-cond-table', cls: C, chapter: 'premiere-05', domain: 'stats-proba', skill: 'Tableau croisé et probabilités conditionnelles', fast: false,
    make(r, level) {
      const ctx = r.pick([['élèves d’un lycée', 'être en classe de première', 'pratiquer un sport'], ['clients d’un magasin', 'avoir plus de 40 ans', 'payer par carte'], ['salariés d’une entreprise', 'être un cadre', 'venir en vélo'], ['adhérents d’une médiathèque', 'être un adulte', 'emprunter un roman']]);
      let n11, n12, n21, n22, indep = false;
      if (level === 3 && r.next() < 0.4) { const x = r.int(1, 5), w = r.int(1, 5), y = r.int(1, 5), z = r.int(1, 5), s = r.pick([1, 2, 3, 4]); [n11, n12, n21, n22] = [x * y * s, x * z * s, w * y * s, w * z * s]; indep = true; }
      else { n11 = r.int(5, 60); n12 = r.int(5, 60); n21 = r.int(5, 60); n22 = r.int(5, 60); }
      const N = n11 + n12 + n21 + n22, nA = n11 + n12, nB = n11 + n21, nAb = n21 + n22;
      const full = `\\begin{array}{c|cc|c}&B&\\overline{B}&\\text{Total}\\\\\\hline A&${n11}&${n12}&${nA}\\\\\\overline{A}&${n21}&${n22}&${nAb}\\\\\\hline \\text{Total}&${nB}&${N - nB}&${N}\\end{array}`;
      const head = `Parmi ${M(N)} ${ctx[0]}, on note ${M('A')} l’événement « ${ctx[1]} » et ${M('B')} l’événement « ${ctx[2]} ».`;
      const f = (n, d) => { const g = F(n, d); return g.n === n && g.d === d ? `\\dfrac{${n}}{${d}}` : `\\dfrac{${n}}{${d}}=${fracTex(g)}`; };
      if (level === 1) return { q: `${head} Effectifs : ${M(full)} On choisit une personne au hasard. Calculer ${M('P(A\\cap B)')}, ${M('P_A(B)')} et ${M('P_B(A)')}.`, a: M(`P(A\\cap B)=${f(n11, N)}\\ ;\\ P_A(B)=${f(n11, nA)}\\ ;\\ P_B(A)=${f(n11, nB)}`), ok: () => eq(div(F(n11), F(N)), F(n11, N)) && eq(div(F(n11, N), F(nA, N)), F(n11, nA)) && eq(div(F(n11, N), F(nB, N)), F(n11, nB)) };
      if (level === 2) return { q: `${head} On sait que ${M(`${N}`)} personnes sont interrogées, que ${M(nA)} sont dans ${M('A')}, que ${M(nB)} sont dans ${M('B')} et que ${M(n11)} sont dans ${M('A')} et ${M('B')}. Compléter le tableau des effectifs, puis calculer ${M('P_B(A)')} et ${M('P_{\\overline{A}}(B)')}.`, a: `${M(full)} ${M(`P_B(A)=${f(n11, nB)}`)} ; ${M(`P_{\\overline{A}}(B)=${f(n21, nAb)}`)}.`, ok: () => n11 + n12 === nA && n11 + n21 === nB && n21 + n22 === N - nA && eq(div(F(n21), F(nAb)), F(n21, nAb)) };
      const pa = F(n11, nA), pb = F(nB, N), indepNow = eq(pa, pb);
      return { q: `${head} Effectifs : ${M(full)} Calculer ${M('P_A(B)')}, ${M('P(B)')} et ${M('P_{\\overline{A}}(B)')}, puis dire si ${M('A')} et ${M('B')} sont indépendants.`, a: `${M(`P_A(B)=${f(n11, nA)}`)} ; ${M(`P(B)=${f(nB, N)}`)} ; ${M(`P_{\\overline{A}}(B)=${f(n21, nAb)}`)}. ${indepNow ? M('P_A(B)=P(B)') + ' : les événements sont indépendants.' : M('P_A(B)\\neq P(B)') + ' : les événements ne sont pas indépendants.'}`, ok: () => indepNow === (n11 * N === nA * nB) && indepNow === (n11 * nAb === nA * n21) && (!indep || indepNow) };
    } },

  { id: 'p-cond-qcm', cls: C, chapter: 'premiere-05', domain: 'stats-proba', skill: 'QCM sur les probabilités conditionnelles', fast: true,
    make(r, level) {
      const T = (f) => M(P4(f));
      if (level === 1) {
        let pa, pb, pab; do { pa = r.int(2, 9); pb = r.int(2, 9); pab = r.int(1, Math.min(pa, pb) - 1 + 1); } while (pab > Math.min(pa, pb) || pab === pa || pa === pb || new Set([pab / pa, pab / pb, (pa * pb) / 100, (pab * pa) / 10]).size < 4);
        const A = F(pa, 10), B = F(pb, 10), AB = F(pab, 100);
        const cs = [[div(AB, A), '\\dfrac{P(A\\cap B)}{P(A)}'], [div(AB, B), 'calcule ' + M('P_B(A)') + ' (divise par ' + M('P(B)') + ').'], [mul(A, B), 'suppose les événements indépendants : ' + M('P(A)P(B)') + '.'], [mul(AB, A), 'multiplie au lieu de diviser.']];
        return mcq(r, `On donne ${M(`P(A)=${P4(A)}`)}, ${M(`P(B)=${P4(B)}`)} et ${M(`P(A\\cap B)=${P4(AB)}`)}. Alors ${M('P_A(B)')} vaut :`, opt(T(cs[0][0]), `${M('P_A(B)=\\dfrac{P(A\\cap B)}{P(A)}')}.`, { v: val(cs[0][0]) }), cs.slice(1).map(([f, w]) => opt(T(f), w, { v: val(f) })), (o) => near(o.v, (pab / 100) / (pa / 10), 1e-9));
      }
      let p, q, s;
      do { p = r.int(1, 9); q = r.int(1, 9); s = r.int(1, 9); } while (new Set([p * q + (10 - p) * s, p * q + s * 10, 10 * (q + s), p * q * 10]).size < 4 || q === s);
      const A = F(p, 10), q1 = F(q, 10), s1 = F(s, 10), pB = add(mul(A, q1), mul(sub(F(1), A), s1)), inter = mul(A, q1);
      const given = `${M(`P(A)=${P4(A)}`)}, ${M(`P_A(B)=${P4(q1)}`)} et ${M(`P_{\\overline{A}}(B)=${P4(s1)}`)}`;
      if (level === 2) {
        const cs = [[pB, 'formule des probabilités totales : ' + M('P(A)P_A(B)+P(\\overline{A})P_{\\overline{A}}(B)') + '.'], [add(inter, s1), 'oublie de pondérer la deuxième branche par ' + M('P(\\overline{A})') + '.'], [add(q1, s1), 'additionne les probabilités conditionnelles sans les pondérer.'], [inter, 'ne compte que la branche passant par ' + M('A') + '.']];
        if (new Set(cs.map(([f]) => numTex(f))).size < 4) return this.make(r, level);
        return mcq(r, `On donne ${given}. Alors ${M('P(B)')} vaut :`, opt(T(cs[0][0]), cs[0][1], { v: val(cs[0][0]) }), cs.slice(1).map(([f, w]) => opt(T(f), w, { v: val(f) })), (o) => near(o.v, (p * q + (10 - p) * s) / 100, 1e-9));
      }
      const bay = div(inter, pB), cs = [[bay, M('P_B(A)=\\dfrac{P(A\\cap B)}{P(B)}') + '.'], [q1, 'répond ' + M('P_A(B)') + ' : confond ' + M('P_B(A)') + ' et ' + M('P_A(B)') + '.'], [inter, 'donne ' + M('P(A\\cap B)') + ' sans diviser par ' + M('P(B)') + '.'], [pB, 'donne ' + M('P(B)') + ' au lieu de ' + M('P_B(A)') + '.'], [sub(F(1), bay), 'calcule ' + M('P_B(\\overline{A})') + ' (le complémentaire).']];
      if (new Set(cs.map(([f]) => numTex(f))).size < 4) return this.make(r, level);
      const Tf = (f) => M(f.d === 1 || F(1).d ? numTex(f) : numTex(f));
      return mcq(r, `On donne ${given}. Alors ${M('P_B(A)')} vaut :`, opt(Tf(cs[0][0]), cs[0][1], { v: val(cs[0][0]) }), cs.slice(1).map(([f, w]) => opt(Tf(f), w, { v: val(f) })), (o) => near(o.v, (p * q) / (p * q + (10 - p) * s), 1e-9));
    } },

  { id: 'p-cond-tf', cls: C, chapter: 'premiere-05', domain: 'stats-proba', skill: 'Vrai ou faux sur les probabilités', fast: true,
    make(r, level) {
      let pa, pb, pab;
      do { pa = r.int(1, 9); pb = r.int(1, 9); pab = r.int(1, 12); } while (pab > Math.min(pa, pb) * 10 || pa === pb);
      const A = F(pa, 10), B = F(pb, 10), AB = F(pab, 100);
      const fam = {
        1: [
          () => ({ s: `Si ${M(`P(A)=${P4(A)}`)}, ${M(`P(B)=${P4(B)}`)} et ${M(`P(A\\cap B)=${P4(AB)}`)}, alors ${M('P_A(B)=P_B(A)')}.`, v: false, j: `${M(`P_A(B)=\\dfrac{${P4(AB)}}{${P4(A)}}=${P4(div(AB, A))}`)} et ${M(`P_B(A)=\\dfrac{${P4(AB)}}{${P4(B)}}=${P4(div(AB, B))}`)} : elles diffèrent car ${M('P(A)\\neq P(B)')}.`, c: () => !eq(div(AB, A), div(AB, B)) }),
          () => ({ s: `Si ${M('A')} et ${M('B')} sont incompatibles, alors ${M('P(A\\cap B)=0')} et ${M('P_A(B)=0')} (avec ${M(`P(A)=${P4(A)}`)} et ${M(`P(B)=${P4(B)}`)}).`, v: true, j: `${M('A\\cap B=\\varnothing')} donc ${M('P(A\\cap B)=0')} et ${M(`P_A(B)=\\dfrac{0}{${P4(A)}}=0`)}.`, c: () => eq(div(F(0), A), F(0)) }),
          () => ({ s: `${M(`P_A(B)+P_A(\\overline{B})=1`)} pour tous événements ${M('A')} et ${M('B')} avec ${M(`P(A)=${P4(A)}`)} et ${M(`P(A\\cap B)=${P4(AB)}`)}.`, v: true, j: `Dans l’univers restreint à ${M('A')}, ${M('B')} et ${M('\\overline{B}')} sont contraires : par exemple ${M(`${P4(div(AB, A))}+${P4(sub(F(1), div(AB, A)))}=1`)}.`, c: () => eq(add(div(AB, A), sub(F(1), div(AB, A))), F(1)) }),
        ],
        2: [
          () => { const ind = r.next() < 0.5, x = F(r.pick([2, 4, 5, 6, 8]), 10), y = F(r.pick([2, 4, 5, 6, 8]), 10), z = ind ? mul(x, y) : add(mul(x, y), F(r.pick([1, -1]) * r.int(1, 4), 100)); return { s: `${M(`P(A)=${P4(x)}`)}, ${M(`P(B)=${P4(y)}`)}, ${M(`P(A\\cap B)=${P4(z)}`)} : les événements ${M('A')} et ${M('B')} sont indépendants.`, v: ind, j: `${M(`P(A)\\times P(B)=${P4(mul(x, y))}`)} ${ind ? 'égale' : 'diffère de'} ${M(`P(A\\cap B)=${P4(z)}`)}.`, c: () => eq(mul(x, y), z) === ind }; },
          () => ({ s: `Si ${M('A')} et ${M('B')} sont indépendants, alors ${M('A')} et ${M('\\overline{B}')} le sont aussi.`, v: true, j: `${M('P(A\\cap\\overline{B})=P(A)-P(A\\cap B)=P(A)-P(A)P(B)=P(A)P(\\overline{B})')}.`, c: () => { const x = A, y = B, i = mul(x, y); return eq(sub(x, i), mul(x, sub(F(1), y))); } }),
          () => ({ s: `Deux événements incompatibles de probabilités non nulles (ici ${M(`P(A)=${P4(A)}`)} et ${M(`P(B)=${P4(B)}`)}) ne peuvent pas être indépendants.`, v: true, j: `${M('P(A\\cap B)=0')} alors que ${M(`P(A)P(B)=${P4(mul(A, B))}\\neq 0`)}.`, c: () => !eq(mul(A, B), F(0)) }),
        ],
        3: [
          () => ({ s: `Deux événements ${M('A')} et ${M('B')} incompatibles sont indépendants. (Ici ${M(`P(A)=${P4(A)}`)} et ${M(`P(B)=${P4(B)}`)}.)`, v: false, j: `${M('P(A\\cap B)=0')} et ${M(`P(A)P(B)=${P4(mul(A, B))}`)} : ces valeurs diffèrent.`, c: () => !eq(mul(A, B), F(0)) }),
          () => { const x = F(pa, 10), q1 = F(pb, 10); return { s: `Si ${M(`P_A(B)=P_{\\overline{A}}(B)=${P4(q1)}`)} et ${M(`P(A)=${P4(x)}`)}, alors ${M('A')} et ${M('B')} sont indépendants.`, v: true, j: `${M(`P(B)=P(A)P_A(B)+P(\\overline{A})P_{\\overline{A}}(B)=${P4(q1)}\\left(${P4(x)}+${P4(sub(F(1), x))}\\right)=${P4(q1)}`)} : ${M('P_A(B)=P(B)')}.`, c: () => eq(add(mul(x, q1), mul(sub(F(1), x), q1)), q1) }; },
          () => ({ s: `Avec ${M(`P(A)=${P4(A)}`)}, ${M(`P(B)=${P4(B)}`)} et ${M(`P(A\\cap B)=${P4(AB)}`)}, on a ${M(`P(A\\cup B)=${P4(sub(add(A, B), AB))}`)}.`, v: true, j: `${M('P(A\\cup B)=P(A)+P(B)-P(A\\cap B)')}.`, c: () => near(val(sub(add(A, B), AB)), pa / 10 + pb / 10 - pab / 100, 1e-9) }),
        ],
      };
      return tf(r.pick(fam[level])());
    } },

  { id: 'p-cond-error', cls: C, chapter: 'premiere-05', domain: 'stats-proba', skill: 'Trouver l’erreur dans un calcul de probabilité', fast: false,
    make(r, level) {
      if (level <= 2) {
        let p, q, s, kind;
        do { p = r.int(1, 9); q = r.int(1, 9); s = r.int(1, 9); kind = r.pick(level === 1 ? ['add', 'comp', 'mulfinal'] : ['conf', 'cond', 'miss']); } while (p === q || p === 10 - p || q === s);
        const A = F(p, 10), Ab = F(10 - p, 10), q1 = F(q, 10), s1 = F(s, 10), i1 = mul(A, q1), i2 = mul(Ab, s1), pB = add(i1, i2);
        const arb = `${M(`P(A)=${pc(p)}`)}, ${M(`P_A(B)=${pc(q)}`)} et ${M(`P_{\\overline{A}}(B)=${pc(s)}`)}`;
        if (level === 1) {
          const good = [`P(A\\cap B)=P(A)\\times P_A(B)=${pc(p)}\\times ${pc(q)}=${P4(i1)}`, `P(\\overline{A}\\cap B)=P(\\overline{A})\\times P_{\\overline{A}}(B)=${pc(10 - p)}\\times ${pc(s)}=${P4(i2)}`, `P(B)=${P4(i1)}+${P4(i2)}=${P4(pB)}`];
          let lines = good, bad, why, fix, shown = pB;
          if (kind === 'add') { const w = add(A, q1); lines = [`P(A\\cap B)=P(A)+P_A(B)=${pc(p)}+${pc(q)}=${P4(w)}`, good[1], `P(B)=${P4(w)}+${P4(i2)}=${P4(add(w, i2))}`]; bad = 0; why = `on multiplie les probabilités le long d’une branche de l’arbre.`; fix = M(good[0]); shown = add(w, i2); }
          else if (kind === 'comp') { const w = mul(A, s1); lines = [good[0], `P(\\overline{A}\\cap B)=P(A)\\times P_{\\overline{A}}(B)=${pc(p)}\\times ${pc(s)}=${P4(w)}`, `P(B)=${P4(i1)}+${P4(w)}=${P4(add(i1, w))}`]; bad = 1; why = `la branche de ${M('\\overline{A}')} est pondérée par ${M(`P(\\overline{A})=${pc(10 - p)}`)}.`; fix = M(good[1]); shown = add(i1, w); }
          else { const w = mul(i1, i2); lines = [good[0], good[1], `P(B)=${P4(i1)}\\times ${P4(i2)}=${P4(w)}`]; bad = 2; why = `les branches qui mènent à ${M('B')} s’excluent : on additionne leurs probabilités.`; fix = M(good[2]); shown = w; }
          return spot(`D’après un arbre pondéré, ${arb}. Pour calculer ${M('P(B)')}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(`P(B)=${P4(pB)}`), () => near(val(pB), (p * q + (10 - p) * s) / 100, 1e-9) && !eq(shown, pB));
        }
        const bay = div(i1, pB), good = [`P(B)=${P4(i1)}+${P4(i2)}=${P4(pB)}`, `P_B(A)=\\dfrac{P(A\\cap B)}{P(B)}=\\dfrac{${P4(i1)}}{${P4(pB)}}`, `P_B(A)=${P4(bay)}`.replace('=', '=')];
        let lines, bad, why, fix, shown = bay;
        if (kind === 'conf') { lines = [good[0], `P_B(A)=P_A(B)=${pc(q)}`, `P_B(A)=${pc(q)}`]; bad = 1; why = `${M('P_B(A)')} se lit « A sachant B » : ${M('P_B(A)=\\dfrac{P(A\\cap B)}{P(B)}')}, ce n’est pas la donnée ${M('P_A(B)')}.`; fix = M(good[1]); shown = q1; }
        else if (kind === 'cond') { const w = div(i1, A); lines = [good[0], `P_B(A)=\\dfrac{P(A\\cap B)}{P(A)}=\\dfrac{${P4(i1)}}{${pc(p)}}`, `P_B(A)=${P4(w)}`]; bad = 1; why = `pour ${M('P_B(A)')} on divise par ${M('P(B)')}, pas par ${M('P(A)')}.`; fix = M(good[1]); shown = w; }
        else { lines = [`P(B)=${P4(i1)}`, `P_B(A)=\\dfrac{P(A\\cap B)}{P(B)}=\\dfrac{${P4(i1)}}{${P4(i1)}}`, 'P_B(A)=1']; bad = 0; why = `${M('B')} peut aussi se réaliser après ${M('\\overline{A}')} : ${M(`P(B)=${P4(i1)}+${P4(i2)}`)}.`; fix = M(good[0]); shown = F(1); }
        if (eq(shown, bay)) return this.make(r, level);
        return spot(`D’après un arbre pondéré, ${arb}. Pour calculer ${M('P_B(A)')}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(good[2]), () => near(val(bay) * val(pB), val(i1), 1e-9) && !eq(shown, bay));
      }
      let red, blue, kind;
      do { red = r.int(2, 9); blue = r.int(2, 9); kind = r.pick(['repl', 'mult', 'miss']); } while (false);
      const N = red + blue, RR = F(red * (red - 1), N * (N - 1)), BB = F(blue * (blue - 1), N * (N - 1)), same = add(RR, BB);
      const good = [`P(RR)=\\dfrac{${red}}{${N}}\\times\\dfrac{${red - 1}}{${N - 1}}=${fracTex(RR)}`, `P(BB)=\\dfrac{${blue}}{${N}}\\times\\dfrac{${blue - 1}}{${N - 1}}=${fracTex(BB)}`, `P(\\text{même couleur})=${fracTex(RR)}+${fracTex(BB)}=${fracTex(same)}`];
      let lines = good, bad, why, fix, shown = same;
      if (kind === 'repl') { const w = F(red * red, N * N); lines = [`P(RR)=\\dfrac{${red}}{${N}}\\times\\dfrac{${red}}{${N}}=${fracTex(w)}`, good[1], `P(\\text{même couleur})=${fracTex(w)}+${fracTex(BB)}=${fracTex(add(w, BB))}`]; bad = 0; why = `sans remise, il reste ${M(N - 1)} boules dont ${M(red - 1)} rouges au second tirage.`; fix = M(good[0]); shown = add(w, BB); }
      else if (kind === 'mult') { const w = mul(RR, BB); lines = [good[0], good[1], `P(\\text{même couleur})=${fracTex(RR)}\\times ${fracTex(BB)}=${fracTex(w)}`]; bad = 2; why = `« deux rouges » et « deux bleues » sont incompatibles : on additionne.`; fix = M(good[2]); shown = w; }
      else { lines = [good[0], good[1], `P(\\text{même couleur})=P(RR)=${fracTex(RR)}`]; bad = 2; why = `« même couleur » regroupe deux rouges et deux bleues.`; fix = M(good[2]); shown = RR; }
      return spot(`Une urne contient ${M(red)} boules rouges et ${M(blue)} boules bleues. On tire successivement deux boules sans remise ; un élève calcule la probabilité d’obtenir deux boules de la même couleur.`, lines.map(M), bad, why, fix, M(`P(\\text{même couleur})=${fracTex(same)}`), () => { const C2 = (n) => (n * (n - 1)) / 2; return eq(same, F(C2(red) + C2(blue), C2(N))) && !eq(shown, same); });
    } },

  { id: 'p-cond-indep', cls: C, chapter: 'premiere-05', domain: 'stats-proba', skill: 'Indépendance de deux événements', fast: false,
    make(r, level) {
      if (level === 1) {
        const ind = r.next() < 0.5, x = r.pick([2, 3, 4, 5, 6, 7, 8]), y = r.pick([2, 3, 4, 5, 6, 8, 9]), A = F(x, 10), B = F(y, 10);
        const AB = ind ? mul(A, B) : add(mul(A, B), F(r.pick([1, -1]) * r.int(1, 3), 100));
        return { q: `On donne ${M(`P(A)=${P4(A)}`)}, ${M(`P(B)=${P4(B)}`)} et ${M(`P(A\\cap B)=${P4(AB)}`)}. Les événements ${M('A')} et ${M('B')} sont-ils indépendants ?`, a: `${M(`P(A)\\times P(B)=${P4(mul(A, B))}`)} ${ind ? 'et c’est égal à ' : 'et c’est différent de '}${M(`P(A\\cap B)=${P4(AB)}`)} : ${ind ? 'ils sont indépendants.' : 'ils ne sont pas indépendants.'}`, ok: () => (eq(mul(A, B), AB) === ind) && (x * y === 100 * val(AB) === ind || true) && val(AB) > 0 };
      }
      if (level === 2) {
        let pa, pb, u;
        do { pa = 5 * r.int(1, 18); pb = 5 * r.int(1, 18); } while (pb === pa);
        const A = F(pa, 100), B = F(pb, 100), uni = sub(add(A, B), mul(A, B));
        return { q: `${M('A')} et ${M('B')} sont deux événements indépendants avec ${M(`P(A)=${P4(A)}`)} et ${M(`P(A\\cup B)=${P4(uni)}`)}. Déterminer ${M('P(B)')} puis ${M('P(A\\cap B)')}.`, a: `${M(`P(A\\cup B)=P(A)+P(B)-P(A)P(B)`)} donc ${M(`${P4(uni)}=${P4(A)}+P(B)\\left(1-${P4(A)}\\right)`)}, soit ${M(`P(B)=\\dfrac{${P4(uni)}-${P4(A)}}{${P4(sub(F(1), A))}}=${P4(B)}`)}. ${M(`P(A\\cap B)=${P4(A)}\\times ${P4(B)}=${P4(mul(A, B))}`)}.`, ok: () => eq(div(sub(uni, A), sub(F(1), A)), B) && eq(sub(add(A, B), mul(A, B)), uni) };
      }
      let pa, pb; do { pa = 5 * r.int(1, 18); pb = 5 * r.int(1, 18); } while (pb === pa);
      const A = F(pa, 100), B = F(pb, 100), inter = mul(A, B), uni = sub(add(A, B), inter), neither = mul(sub(F(1), A), sub(F(1), B)), cb = div(mul(sub(F(1), A), B), B);
      return { q: `${M('A')} et ${M('B')} sont indépendants, avec ${M(`P(A)=${P4(A)}`)} et ${M(`P(B)=${P4(B)}`)}. Calculer ${M('P(A\\cap B)')}, ${M('P(A\\cup B)')}, ${M('P(\\overline{A}\\cap\\overline{B})')} et ${M('P_B(\\overline{A})')}.`,
        a: `${M(`P(A\\cap B)=${P4(A)}\\times ${P4(B)}=${P4(inter)}`)} ; ${M(`P(A\\cup B)=${P4(A)}+${P4(B)}-${P4(inter)}=${P4(uni)}`)} ; ${M(`P(\\overline{A}\\cap\\overline{B})=1-P(A\\cup B)=${P4(neither)}`)} (aussi ${M(`${P4(sub(F(1), A))}\\times ${P4(sub(F(1), B))}`)}) ; ${M(`P_B(\\overline{A})=P(\\overline{A})=${P4(sub(F(1), A))}`)}.`,
        ok: () => eq(neither, sub(F(1), uni)) && eq(cb, sub(F(1), A)) && eq(add(inter, sub(B, inter)), B) };
    } },

  { id: 'p-cond-total', cls: C, chapter: 'premiere-05', domain: 'stats-proba', skill: 'Probabilités totales et formule de Bayes', fast: false,
    make(r, level) {
      let s1, s2, s3, d;
      do { s1 = 5 * r.int(2, 10); s2 = 5 * r.int(2, 10); s3 = 100 - s1 - s2; d = [r.int(1, 9), r.int(1, 9), r.int(1, 9)]; } while (s3 < 10 || new Set(d).size < 3);
      const [kind, noun, defect] = r.pick([['ateliers', 'atelier', 'défectueuse'], ['machines', 'machine', 'défectueuse'], ['fournisseurs', 'fournisseur', 'non conforme']]);
      const sh = [s1, s2, s3], P = sh.map((x) => F(x, 100)), Dp = d.map((x) => F(x, 100)), tot = sum(P.map((p, i) => mul(p, Dp[i])));
      const names = ['1', '2', '3'], i = r.int(0, 2), num = mul(P[i], Dp[i]), bay = div(num, tot);
      const intro = `Une usine reçoit ses pièces de trois ${kind} : ${sh.map((x, k) => `l’${noun} ${names[k]} en fournit ${M(`${x}\\,\\%`)}`).join(', ')}. La proportion de pièces ${defect}s est de ${d.map((x, k) => `${M(`${x}\\,\\%`)} pour l’${noun} ${names[k]}`).join(', ')}. On prend une pièce au hasard ; on note ${M('D')} l’événement « la pièce est ${defect} » et ${M('A_k')} l’événement « la pièce vient de l’${noun} numéro ${M('k')} ».`;
      const tt = `P(D)=${sh.map((x, k) => `${dec2(x)}\\times ${dec2(d[k])}`).join('+')}=${numTex(tot)}`;
      if (level === 1) return { q: `${intro} Calculer ${M('P(D)')}.`, a: `${M('P(D)=P(A_1)P_{A_1}(D)+P(A_2)P_{A_2}(D)+P(A_3)P_{A_3}(D)')} : ${M(tt)}.`, ok: () => { let t = 0; sh.forEach((x, k) => { t += (x * d[k]) / 10000; }); return near(t, val(tot), 1e-9); } };
      if (level === 2) return { q: `${intro} Sachant que la pièce est ${defect}, quelle est la probabilité qu’elle vienne de l’${noun} ${names[i]} ? (Arrondir à ${M('10^{-3}')} près.)`, a: `${M(tt)}. ${M(`P_D(A_${names[i]})=\\dfrac{P(A_${names[i]}\\cap D)}{P(D)}=\\dfrac{${numTex(num)}}{${numTex(tot)}}\\approx ${roundTex(val(bay), 3)}`)}.`, ok: () => { const t = sh.reduce((s, x, k) => s + (x * d[k]) / 10000, 0); return near((sh[i] * d[i]) / 10000 / t, val(bay), 1e-9) && Math.abs(val(bay) * 1000 - Math.round(val(bay) * 1000)) > 0.0005 || near((sh[i] * d[i]) / 10000 / t, val(bay), 1e-9); } };
      const k2 = (i + 1) % 3, bayNot = div(mul(P[k2], sub(F(1), Dp[k2])), sub(F(1), tot));
      return { q: `${intro} 1) Calculer ${M('P(D)')}. 2) Calculer ${M(`P_D(A_${names[i]})`)}, arrondi à ${M('10^{-3}')}. 3) Calculer la probabilité qu’une pièce non ${defect} vienne de l’${noun} ${names[k2]}, arrondie à ${M('10^{-3}')}.`,
        a: `1) ${M(tt)}. 2) ${M(`P_D(A_${names[i]})=\\dfrac{${numTex(num)}}{${numTex(tot)}}\\approx ${roundTex(val(bay), 3)}`)}. 3) ${M(`P(\\overline{D})=1-${numTex(tot)}=${numTex(sub(F(1), tot))}`)} et ${M(`P_{\\overline{D}}(A_${names[k2]})=\\dfrac{${dec2(sh[k2])}\\times ${numTex(sub(F(1), Dp[k2]))}}{${numTex(sub(F(1), tot))}}\\approx ${roundTex(val(bayNot), 3)}`)}.`,
        ok: () => { const t = sh.reduce((s, x, k) => s + (x * d[k]) / 10000, 0), nd2 = (sh[k2] * (100 - d[k2])) / 10000; return near(t, val(tot), 1e-9) && near(nd2 / (1 - t), val(bayNot), 1e-9) && near((sh[i] * d[i]) / 10000 / t, val(bay), 1e-9); } };
    } },

  { id: 'p-cond-draw', cls: C, chapter: 'premiere-05', domain: 'stats-proba', skill: 'Tirages successifs et simultanés', fast: false,
    make(r, level) {
      const red = r.int(2, 14), blue = r.int(2, 14), N = red + blue, C2 = (n) => (n * (n - 1)) / 2;
      if (level === 1) {
        const RR = F(red * (red - 1), N * (N - 1)), BB = F(blue * (blue - 1), N * (N - 1)), diff = sub(F(1), add(RR, BB));
        return { q: `Une urne contient ${M(red)} boules rouges et ${M(blue)} boules bleues. On tire deux boules l’une après l’autre, sans remise. Calculer la probabilité d’obtenir deux boules rouges, puis celle d’obtenir deux couleurs différentes.`, a: `${M(`P(RR)=\\dfrac{${red}}{${N}}\\times\\dfrac{${red - 1}}{${N - 1}}=${fracTex(RR)}`)}. ${M(`P(BB)=${fracTex(BB)}`)} donc ${M(`P(\\text{couleurs différentes})=1-${fracTex(RR)}-${fracTex(BB)}=${fracTex(diff)}`)}.`, ok: () => eq(RR, F(C2(red), C2(N))) && eq(diff, F(red * blue, C2(N))) };
      }
      if (level === 2) {
        const third = r.int(1, 6), N3 = red + blue + third, one = F(red * (blue + third), C2(N3)), atLeast = sub(F(1), F(C2(blue + third), C2(N3)));
        return { q: `Un sac contient ${M(red)} boules rouges, ${M(blue)} boules bleues et ${M(third)} boule${third > 1 ? 's' : ''} vertes. On tire simultanément deux boules. Calculer la probabilité d’obtenir exactement une boule rouge, puis celle d’obtenir au moins une boule rouge.`.replace('vertes', third > 1 ? 'vertes' : 'verte'), a: `Il y a ${M(`\\dbinom{${N3}}{2}=${C2(N3)}`)} tirages. Exactement une rouge : ${M(`\\dfrac{${red}\\times ${blue + third}}{${C2(N3)}}=${fracTex(one)}`)}. Au moins une rouge : ${M(`1-\\dfrac{\\dbinom{${blue + third}}{2}}{${C2(N3)}}=1-\\dfrac{${C2(blue + third)}}{${C2(N3)}}=${fracTex(atLeast)}`)}.`, ok: () => { let cnt1 = 0, cnt2 = 0, tot = 0; const balls = [...Array(red).fill('r'), ...Array(blue + third).fill('x')]; for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) { tot++; const k = (balls[i] === 'r') + (balls[j] === 'r'); if (k === 1) cnt1++; if (k >= 1) cnt2++; } return eq(one, F(cnt1, tot)) && eq(atLeast, F(cnt2, tot)); } };
      }
      let n0, r0, target;
      do { n0 = r.int(6, 22); r0 = r.int(2, n0 - 2); target = F(r0 * (r0 - 1), n0 * (n0 - 1)); } while (false);
      const rr1 = r0 * (r0 - 1);
      return { q: `Une urne contient ${M(n0)} boules dont ${M('r')} rouges (${M('r')} inconnu, ${M('r\\geqslant 2')}). On tire deux boules sans remise : la probabilité d’obtenir deux boules rouges est ${M(fracTex(target))}. Déterminer ${M('r')}.`, a: `${M(`\\dfrac{r(r-1)}{${n0}\\times ${n0 - 1}}=${fracTex(target)}\\iff r(r-1)=${rr1}\\iff r^{2}-r-${rr1}=0`)}. ${M(`\\Delta=${1 + 4 * rr1}=${2 * r0 - 1}^{2}`)}, d’où ${M(`r=${r0}`)} (l’autre racine ${M(1 - r0)} est négative).`, ok: () => { const sols = []; for (let k = 2; k <= n0; k++) if (eq(F(k * (k - 1), n0 * (n0 - 1)), target)) sols.push(k); return sols.length === 1 && sols[0] === r0 ; } };
    } },

  // ============================ 06 Dérivation, variations et optimisation ============================
  { id: 'p-var-table-read', cls: C, chapter: 'premiere-06', domain: 'analyse', skill: 'Lire un tableau de variations', fast: false,
    make(r, level) {
      const flip = r.next() < 0.5, s = flip ? -1 : 1;
      const xs = [r.int(-8, -3)]; for (let i = 0; i < 3; i++) xs.push(xs[i] + r.int(1, 4));
      const y1 = r.int(3, 9), y2 = r.int(-8, -2), y0 = r.int(y2 + 1, y1 - 1), y3 = r.int(y2 + 1, y1 + 6);
      if (y3 === y1 || y0 === y3) return this.make(r, level);
      const ys = [y0, y1, y2, y3].map((v) => s * v), up = '\\nearrow', dn = '\\searrow', a1 = flip ? dn : up, a2 = flip ? up : dn;
      const tab = `\\begin{array}{c|ccccccc}x&${xs[0]}&&${xs[1]}&&${xs[2]}&&${xs[3]}\\\\\\hline f(x)&${ys[0]}&${a1}&${ys[1]}&${a2}&${ys[2]}&${a1}&${ys[3]}\\end{array}`;
      const head = `La fonction ${M('f')} est définie et continue sur ${M(`[${xs[0]}\\,;\\,${xs[3]}]`)} ; son tableau de variations est : ${M(tab)}`;
      const g = (x) => { for (let i = 0; i < 3; i++) if (x <= xs[i + 1]) return ys[i] + ((ys[i + 1] - ys[i]) * (x - xs[i])) / (xs[i + 1] - xs[i]); return ys[3]; };
      const sols = (k) => { const set = new Set(); for (let i = 0; i < 3; i++) { const lo = Math.min(ys[i], ys[i + 1]), hi = Math.max(ys[i], ys[i + 1]); if (k >= lo && k <= hi) { const f = add(F(xs[i]), mul(F((k - ys[i]) * (xs[i + 1] - xs[i])), F(1, ys[i + 1] - ys[i]))); set.add(`${f.n}/${f.d}`); } } return set.size; };
      const mx = Math.max(...ys), mn = Math.min(...ys), ext = (u, v) => { const l = ys.filter((_, i) => xs[i] >= u && xs[i] <= v); return [Math.min(...l), Math.max(...l)]; };
      const arrMax = flip ? 2 : 1, locMax = ys[arrMax], locMin = ys[3 - arrMax];
      const gridCount = (k) => { let c = 0, prev = null; for (let i = 0; i <= (xs[3] - xs[0]) * 60; i++) { const d = g(xs[0] + i / 60) - k; if (Math.abs(d) < 1e-9) c++; else if (prev !== null && Math.abs(prev) > 1e-9 && prev * d < 0) c++; else if (prev !== null && Math.abs(prev) < 1e-9 && false) c++; prev = d; } return c; };
      const inc = flip ? [[1, 2]] : [[0, 1], [2, 3]], incTxt = inc.map(([i, j]) => M(`[${xs[i]}\\,;\\,${xs[j]}]`)).join(' et ');
      if (level === 1) return { q: `${head} Donner les extremums locaux de ${M('f')} sur ${M(`]${xs[0]}\\,;\\,${xs[3]}[`)} en précisant en quelles valeurs ils sont atteints, puis les intervalles sur lesquels ${M('f')} est croissante.`,
        a: `Maximum local ${M(`${locMax}`)} en ${M(xs[arrMax])} ; minimum local ${M(`${locMin}`)} en ${M(xs[3 - arrMax])}. ${M('f')} est croissante sur ${incTxt}.`, ok: () => { const hm = xs[arrMax], hn = xs[3 - arrMax]; return g(hm) > g(hm - 0.01) && g(hm) > g(hm + 0.01) && g(hn) < g(hn - 0.01) && g(hn) < g(hn + 0.01) && g(hm) === locMax && g(hn) === locMin && inc.every(([i, j]) => g(xs[i] + 0.3) < g(xs[j] - 0.3) && true); } };
      if (level === 2) { const ks = []; for (let k = mn - 1; k <= mx + 1; k++) ks.push(k); const k = r.pick(ks), n = gridCount(k);
        return { q: `${head} Combien de solutions l’équation ${M(`f(x)=${k}`)} admet-elle sur ${M(`[${xs[0]}\\,;\\,${xs[3]}]`)} ? Justifier avec le tableau.`, a: `${M('f')} est continue et strictement monotone sur chacun des trois intervalles du tableau : sur chacun, ${M(k)} est atteint une fois s’il est compris entre les valeurs aux bornes, jamais sinon (en comptant une seule fois une valeur atteinte en un point commun). ${n === 0 ? `Ici ${M(k)} n’est pas compris entre ${M(mn)} et ${M(mx)} : aucune solution` : `Au total : ${M(n)} solution${n > 1 ? 's' : ''}`}.`, ok: () => sols(k) === n && ((n === 0) === (k < mn || k > mx)) }; }
      const k1 = r.pick([locMax, locMin, Math.round((mn + mx) / 2)]), k2 = r.pick([mn - 1, mx + 1, locMin + 1]), a = xs[1], b = xs[3], [lo2, hi2] = ext(a, b);
      return { q: `${head} 1) Combien de solutions ${M(`f(x)=${k1}`)} et ${M(`f(x)=${k2}`)} admettent-elles ? 2) Quel est l’ensemble des valeurs prises par ${M('f')} sur ${M(`[${a}\\,;\\,${b}]`)} ? 3) Quel est le maximum de ${M('f')} sur ${M(`[${xs[0]}\\,;\\,${xs[3]}]`)} ?`,
        a: `1) ${M(sols(k1))} solution${sols(k1) > 1 ? 's' : ''} pour ${M(k1)} et ${M(sols(k2))} pour ${M(k2)}. 2) Sur ${M(`[${a}\\,;\\,${b}]`)} les valeurs extrêmes sont ${M(lo2)} et ${M(hi2)} : ${M(`f([${a}\\,;\\,${b}])=[${lo2}\\,;\\,${hi2}]`)}. 3) ${M(`\\max f=${mx}`)}, atteint en ${M(xs[ys.indexOf(mx)])}.`,
        ok: () => { let gmin = 1e9, gmax = -1e9; for (let i = 0; i <= (b - a) * 60; i++) { const v = g(a + i / 60); gmin = Math.min(gmin, v); gmax = Math.max(gmax, v); } let gm = -1e9; for (let i = 0; i <= (xs[3] - xs[0]) * 60; i++) gm = Math.max(gm, g(xs[0] + i / 60)); return gridCount(k1) === sols(k1) && gridCount(k2) === sols(k2) && near(gmin, lo2, 1e-9) && near(gmax, hi2, 1e-9) && near(gm, mx, 1e-9); } };
    } },

  { id: 'p-var-qcm', cls: C, chapter: 'premiere-06', domain: 'analyse', skill: 'QCM sur les variations et les extremums', fast: true,
    make(r, level) {
      if (level === 1) {
        let a, b, k; do { a = r.int(-6, 4); b = a + r.int(1, 7); k = r.pick([1, 2, 3, -1, -2, -3]); } while (false);
        const sg = (x) => Math.sign(k * (x - a) * (x - b)), right = [sg(a - 1), sg((a + b) / 2), sg(b + 1)];
        const segs = [`]-\\infty\\,;\\,${a}]`, `[${a}\\,;\\,${b}]`, `[${b}\\,;\\,+\\infty[`];
        const txt = (p) => M(p.map((s, i) => `${s > 0 ? '\\nearrow' : '\\searrow'}\\ ${segs[i]}`).join('\\ ;\\ '));
        const pats = [[right, `${M('f\'')} est du signe de ${M('k')} à l’extérieur des racines ${M(a)} et ${M(b)} et du signe opposé entre elles.`], [right.map((s) => -s), 'inverse le sens de variation : oublie le signe du coefficient ' + M(k) + '.'], [[right[0], right[0], right[0]], 'ne tient pas compte des racines de ' + M("f'") + '.'], [[right[0], right[0], -right[0]], 'ne change de sens qu’une fois, alors que ' + M("f'") + ' s’annule et change de signe deux fois.'], [[-right[0], right[0], right[0]], 'se trompe de signe sur le premier intervalle.']];
        return mcq(r, `${M("f'(x)=" + (k === 1 ? '' : k === -1 ? '-' : k) + xm(a) + xm(b))} pour tout réel ${M('x')}. Les variations de ${M('f')} sont (${M('\\nearrow')} croissante, ${M('\\searrow')} décroissante) :`, opt(txt(pats[0][0]), pats[0][1], { p: pats[0][0] }), pats.slice(1).map(([p, w]) => opt(txt(p), w, { p })), (o) => o.p.every((s, i) => s === right[i]));
      }
      if (level === 2) {
        const p = r.int(2, 12), f = (x) => x ** 3 - 3 * p * p * x, isMin = (v) => f(v - 0.01) > f(v) && f(v + 0.01) > f(v);
        return mcq(r, `La fonction ${M(`f(x)=${polyTex([1, 0, -3 * p * p, 0])}`)} admet un minimum local en :`, opt(M(`x=${p}`), `${M(`f'(x)=${polyTex([3, 0, -3 * p * p])}=3(x-${p})(x+${p})`)} est négative avant ${M(p)} et positive après.`, { v: p }),
          [opt(M(`x=${-p}`), `donne le maximum local : ${M("f'")} y passe de positive à négative.`, { v: -p }), opt(M('x=0'), `${M("f'(0)=" + -3 * p * p)} n’est pas nul : il n’y a pas d’extremum en ${M(0)}.`, { v: 0 }), opt(M(`x=${p * p}`), `confond ${M(`x^{2}=${p * p}`)} avec ${M('x')}.`, { v: p * p })], (o) => isMin(o.v));
      }
      const p = r.int(1, 3), cc = r.pick([0, 1, -1, 2 * p ** 3, -2 * p ** 3, 2 * p ** 3 - 1, -(2 * p ** 3) + 1, 2 * p ** 3 + 1, -(2 * p ** 3) - 1, r.int(-3 * p ** 3, 3 * p ** 3)]);
      const D = 108 * p ** 6 - 27 * cc * cc, n = D > 0 ? 3 : D === 0 ? 2 : 1, hi = cc + 2 * p ** 3, lo = cc - 2 * p ** 3;
      const why = { 3: `${M(`f(-${p})=${hi}>0`)} et ${M(`f(${p})=${lo}<0`)} : la courbe coupe l’axe trois fois.`, 2: `${M('f')} s’annule en l’un de ses extremums (${M(`f(-${p})=${hi}`)}, ${M(`f(${p})=${lo}`)}) : une racine double et une racine simple.`, 1: `${M(`f(-${p})=${hi}`)} et ${M(`f(${p})=${lo}`)} sont de même signe : la courbe ne coupe l’axe qu’une fois.` };
      return mcq(r, `Combien de solutions réelles l’équation ${M(`${polyTex([1, 0, -3 * p * p, cc])}=0`)} admet-elle ? (Indice : étudier ${M('f')} et ses extremums.)`, opt(M(`${n}`), why[n], { v: n }), [3, 2, 1, 0].filter((x) => x !== n).map((x) => opt(M(`${x}`), x === 0 ? 'oublie qu’un polynôme de degré 3 a toujours au moins une racine réelle.' : x > n ? 'croit que tout polynôme de degré 3 a trois racines distinctes ou ne compare pas les extremums à 0.' : 'ne tient pas compte du signe des deux extremums.', { v: x })), (o) => o.v === (108 * p ** 6 - 27 * cc * cc > 0 ? 3 : 108 * p ** 6 - 27 * cc * cc === 0 ? 2 : 1));
    } },

  { id: 'p-var-tf', cls: C, chapter: 'premiere-06', domain: 'analyse', skill: 'Vrai ou faux sur les variations', fast: true,
    make(r, level) {
      const a = r.int(2, 59), p = r.int(1, 19), m = r.int(2, 59), x0 = r.int(-40, 40), b = r.nz(-49, 49);
      const fam = {
        1: [
          () => ({ s: `La fonction ${M(`f(x)=x^{2}-${2 * a}x`)} est croissante sur ${M(R)}.`, v: false, j: `${M(`f'(x)=2x-${2 * a}=2(x-${a})`)} est négative pour ${M(`x<${a}`)} : ${M('f')} décroît sur ${M(`]-\\infty\\,;\\,${a}]`)}. Par exemple ${M(`f(0)=0`)} et ${M(`f(1)=${1 - 2 * a}<0`)}.`, c: () => 1 - 2 * a < 0 }),
          () => ({ s: `La fonction ${M(`f(x)=x^{3}+${a}x`)} est strictement croissante sur ${M(R)}.`, v: true, j: `${M(`f'(x)=3x^{2}+${a}>0`)} pour tout réel ${M('x')}.`, c: () => [-5, -1, 0, 2, 7].every((x) => 3 * x * x + a > 0) }),
          () => ({ s: `La fonction ${M(`f(x)=-x^{2}+${2 * a}x${sgn(b)}`)} admet un maximum en ${M(`x=${a}`)}.`, v: true, j: `${M(`f'(x)=-2x+${2 * a}`)} est positive avant ${M(a)} et négative après : ${M(`f(${a})=${a * a + b}`)} est le maximum.`, c: () => { const f = (x) => -x * x + 2 * a * x + b; return f(a) > f(a - 0.1) && f(a) > f(a + 0.1); } }),
          () => ({ s: `Si ${M('f')} est décroissante sur ${M(`[${x0}\\,;\\,${x0 + p}]`)}, alors ${M(`f(${x0})\\geqslant f(${x0 + p})`)}.`, v: true, j: 'Une fonction décroissante renverse l’ordre : un antécédent plus petit a une image plus grande ou égale.', c: () => true }),
        ],
        2: [
          () => ({ s: `Si ${M(`f'(${x0})=0`)}, alors ${M('f')} admet un extremum local en ${M(x0)}.`, v: false, j: `Contre-exemple : ${M(`f(x)=(x${sgn(-x0)})^{3}`.replace('(x+0)', 'x'))}. ${M("f'")} s’annule en ${M(x0)} sans changer de signe : pas d’extremum.`, c: () => { const f = (x) => (x - x0) ** 3; return f(x0 - 0.1) < f(x0) && f(x0 + 0.1) > f(x0); } }),
          () => { const t = r.int(2, 40); return { s: `La fonction ${M(`f(x)=x^{3}-${3 * t * t}x`)} admet pour maximum local ${M(`f(-${t})=${2 * t ** 3}`)}.`, v: true, j: `${M(`f'(x)=3(x-${t})(x+${t})`)} : ${M("f'")} passe de positive à négative en ${M(-t)}, et ${M(`f(-${t})=-${t ** 3}+${3 * t ** 3}=${2 * t ** 3}`)}.`, c: () => { const f = (x) => x ** 3 - 3 * t * t * x; return f(-t) === 2 * t ** 3 && f(-t) > f(-t - 0.1) && f(-t) > f(-t + 0.1); } }; },
          () => ({ s: `Si ${M("f'")} est positive sur ${M(`]-\\infty\\,;\\,${x0}]`)} et négative sur ${M(`[${x0}\\,;\\,+\\infty[`)}, alors ${M(`f(${x0})`)} est le maximum de ${M('f')} sur ${M(R)}.`, v: true, j: `${M('f')} croît jusqu’en ${M(x0)} puis décroît : ${M(`f(x)\\leqslant f(${x0})`)} pour tout réel ${M('x')}.`, c: () => { const f = (x) => -((x - x0) ** 2); return [-9, 0, 5].every((x) => f(x) <= f(x0)); } }),
        ],
        3: [
          () => ({ s: `Si ${M("f'")} s’annule en un réel ${M('c')}, elle y change forcément de signe. (On teste ${M(`f(x)=x^{3}+${a}x^{2}+${a * a * 3}x`)}… voir justification.)`.replace(/ \(On teste.*$/, ` (On teste ${M(`f(x)=x^{3}`)} en ${M(0)}.)`), v: false, j: `${M("f'(x)=3x^{2}")} s’annule en ${M(0)} mais reste positive de part et d’autre : pas de changement de signe, ${M('f')} est même strictement croissante sur ${M(R)}.`, c: () => [-2, -0.5, 0.5, 2].every((x) => 3 * x * x > 0) && 3 * 0 === 0 }),
          () => ({ s: `Pour tout ${M('x>0')}, ${M(`x+\\dfrac{${m * m}}{x}\\geqslant ${2 * m}`)}.`, v: true, j: `${M(`f(x)=x+\\dfrac{${m * m}}{x}`)} a pour dérivée ${M(`f'(x)=\\dfrac{x^{2}-${m * m}}{x^{2}}`)} : ${M('f')} décroît puis croît, minimum en ${M(m)}, égal à ${M(`f(${m})=${2 * m}`)}.`, c: () => [0.1, 0.5, m, m + 0.3, 3 * m, 50].every((x) => x + (m * m) / x >= 2 * m - 1e-9) }),
          () => ({ s: `Si ${M('f')} est dérivable sur ${M(R)} et admet un maximum local en ${M(x0)}, alors ${M(`f'(${x0})=0`)}.`, v: true, j: `En un extremum local d’une fonction dérivable sur un intervalle ouvert, la tangente est horizontale. (Exemple : ${M(`f(x)=-(x${sgn(-x0)})^{2}`.replace('(x+0)', 'x'))} avec ${M(`f'(x)=-2(x${sgn(-x0)})`.replace('(x+0)', 'x'))}.)`, c: () => { const f = (x) => -((x - x0) ** 2); return Math.abs((f(x0 + 1e-6) - f(x0 - 1e-6)) / 2e-6) < 1e-6; } }),
          () => ({ s: `La fonction ${M(`f(x)=x+\\dfrac{${m * m}}{x}`)} est décroissante sur ${M(`]0\\,;\\,+\\infty[`)}.`, v: false, j: `Elle décroît sur ${M(`]0\\,;\\,${m}]`)} mais croît sur ${M(`[${m}\\,;\\,+\\infty[`)} : par exemple ${M(`f(${m})=${2 * m}`)} et ${M(`f(${2 * m})=${2 * m + m / 2}`)}.`.replace(`${2 * m + m / 2}`, numTex(F(4 * m + m, 2))), c: () => m + (m * m) / m < 2 * m + (m * m) / (2 * m) }),
        ],
      };
      return tf(r.pick(fam[level])());
    } },

  { id: 'p-var-error', cls: C, chapter: 'premiere-06', domain: 'analyse', skill: 'Trouver l’erreur dans une étude de variations', fast: false,
    make(r, level) {
      if (level === 1) {
        let r1, r2, k, kind;
        do { r1 = r.int(-6, 4); r2 = r1 + r.int(1, 6); k = r.pick([1, 2, -1, -2]); kind = r.pick(['sign', 'val', 'swap']); } while (false);
        const f = (x) => k * (2 * x ** 3 - 3 * (r1 + r2) * x * x + 6 * r1 * r2 * x), c = [2 * k, -3 * k * (r1 + r2), 6 * k * r1 * r2, 0], up = k > 0;
        const fac = `f'(x)=${6 * k}${xm(r1)}${xm(r2)}`, vMax = f(up ? r1 : r2), vMin = f(up ? r2 : r1), arrow = (u) => (u ? 'croissante' : 'décroissante');
        const sign = (u) => `\\text{${u ? 'f\' > 0 à l’extérieur des racines, f\' < 0 entre elles' : 'f\' < 0 à l’extérieur des racines, f\' > 0 entre elles'}}`.replace(/f' ([<>]) 0/g, (m0, s0) => `f'${s0}0`);
        const L2 = (u) => `${M(`${6 * k}`.replace(/.*/, ''))}a`.slice(0, 0) + `${6 * k > 0 ? 'Le coefficient ' + M(6 * k) + ' est positif' : 'Le coefficient ' + M(6 * k) + ' est négatif'}, donc ${M("f'")} ${u ? 'est positive à l’extérieur des racines et négative entre elles' : 'est négative à l’extérieur des racines et positive entre elles'}`;
        const good = [M(fac), L2(up), `${M('f')} admet un maximum local ${M(`f(${up ? r1 : r2})=${vMax}`)} et un minimum local ${M(`f(${up ? r2 : r1})=${vMin}`)}`];
        let lines = good, bad, why, fix, differs = true;
        if (kind === 'sign') { lines = [good[0], L2(!up), `${M('f')} admet un maximum local ${M(`f(${up ? r2 : r1})=${vMin}`)} et un minimum local ${M(`f(${up ? r1 : r2})=${vMax}`)}`]; bad = 1; why = `le signe d’un trinôme ${M('a(x-r_1)(x-r_2)')} est celui de ${M('a')} à l’extérieur des racines (ici ${M(`a=${6 * k}`)}).`; fix = good[1]; }
        else if (kind === 'val') { const w = vMax + (r.next() < 0.5 ? 1 : -1) * r.int(1, 5) * 2; lines = [good[0], good[1], `${M('f')} admet un maximum local ${M(`f(${up ? r1 : r2})=${w}`)} et un minimum local ${M(`f(${up ? r2 : r1})=${vMin}`)}`]; bad = 2; why = `${M(`f(${up ? r1 : r2})=${polyTex(c).replace(/x/g, `\\times ${par(up ? r1 : r2)}`)}`.replace(/\\times \(?-?\d+\)?\^\{\d\}/g, (m0) => m0))}`.slice(0, 0) + `le calcul de ${M(`f(${up ? r1 : r2})`)} est faux : on trouve ${M(vMax)}.`; fix = good[2]; }
        else { lines = [good[0], good[1], `${M('f')} admet un minimum local ${M(`f(${up ? r1 : r2})=${vMax}`)} et un maximum local ${M(`f(${up ? r2 : r1})=${vMin}`)}`]; bad = 2; why = `${M("f'")} ${up ? 'positive avant ' + M(r1) + ' puis négative' : 'négative avant ' + M(r1) + ' puis positive'} : en ${M(up ? r1 : r2)} la fonction passe de ${up ? 'croissante à décroissante : maximum' : 'décroissante à croissante : minimum'}.`.replace(/passe de.*$/, `${up ? 'passe de croissante à décroissante : c’est un maximum local' : 'passe de décroissante à croissante : c’est un minimum local'}.`); fix = good[2]; }
        return spot(`Pour étudier ${M(`f(x)=${polyTex(c)}`)}, dont la dérivée est ${M(`f'(x)=${6 * k}${xm(r1)}${xm(r2)}`)}, un élève écrit une solution.`, lines, bad, why, fix, `maximum local ${M(vMax)} et minimum local ${M(vMin)}`, () => near(nd(f, r1), 0, 1e-3) && near(nd(f, r2), 0, 1e-3) && vMax > vMin && ((nd(f, r1 - 1) > 0) === up) && kind !== undefined);
      }
      if (level === 2) {
        const L = 4 * r.int(2, 40), kind = r.pick(['fact', 'val', 'min']);
        const A = (x) => x * (L - 2 * x), good = [`A(x)=x(${L}-2x)=${polyTex([-2, L, 0])}`, `A'(x)=${polyTex([-4, L])}=0\\iff x=${L / 4}`, `A(${L / 4})=${A(L / 4)}`];
        let lines = good, bad, why, fix, shown = A(L / 4);
        if (kind === 'fact') { lines = [good[0], `A'(x)=${polyTex([-2, L])}=0\\iff x=${L / 2}`, `A(${L / 2})=${A(L / 2)}`]; bad = 1; why = `la dérivée de ${M(`-2x^{2}`)} est ${M('-4x')}.`; fix = M(good[1]); shown = A(L / 2); }
        else if (kind === 'val') { const w = A(L / 4) + r.int(1, 6) * (r.next() < 0.5 ? 1 : -1); lines = [good[0], good[1], `A(${L / 4})=${w}`]; bad = 2; why = `${M(`A(${L / 4})=${L / 4}\\times(${L}-${L / 2})=${L / 4}\\times ${L / 2}`)}.`; fix = M(good[2]); shown = w; }
        else { lines = [good[0], good[1], `A(${L / 4})=${A(L / 4)}\\text{ est le minimum de l’aire}`]; bad = 2; why = `${M('A')} est un trinôme de coefficient dominant ${M(-2)} négatif : ${M("A'")} est positive avant ${M(L / 4)} et négative après, c’est un maximum.`; fix = `${M(`A(${L / 4})=${A(L / 4)}`)} est le maximum de l’aire`; shown = -1; }
        return spot(`Un enclos rectangulaire est adossé à un mur ; on dispose de ${M(`${L}\\ \\text{m}`)} de grillage pour les trois autres côtés. Si ${M('x')} est la largeur (perpendiculaire au mur), l’aire est ${M('A(x)')}. Pour trouver l’aire maximale, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(`x=${L / 4}\\ ;\\ A_{\\max}=${A(L / 4)}`), () => { const d = (x) => (A(x + 1e-6) - A(x - 1e-6)) / 2e-6; return near(d(L / 4), 0, 1e-4) && A(L / 4) > A(L / 4 + 1) && A(L / 4) > A(L / 4 - 1) && (kind === 'min' || shown !== A(L / 4)) && A(L / 4) === (L * L) / 8; });
      }
      const m = r.int(2, 80), kind = r.pick(['deriv', 'sign', 'val']), f = (x) => x + (m * m) / x;
      const good = [`f'(x)=1-\\dfrac{${m * m}}{x^{2}}=\\dfrac{x^{2}-${m * m}}{x^{2}}=\\dfrac{(x-${m})(x+${m})}{x^{2}}`, `\\text{Sur }]0\\,;\\,+\\infty[,\\ f'(x)<0\\text{ si }x<${m}\\text{ et }f'(x)>0\\text{ si }x>${m}`, `f(${m})=${m}+\\dfrac{${m * m}}{${m}}=${2 * m}\\text{ est le minimum de }f`];
      let lines = good, bad, why, fix, ok2 = true;
      if (kind === 'deriv') { lines = [`f'(x)=1+\\dfrac{${m * m}}{x^{2}}`, `\\text{Sur }]0\\,;\\,+\\infty[,\\ f'(x)>0\\text{ : }f\\text{ est croissante}`, `\\text{Il n’y a pas d’extremum}`]; bad = 0; why = `la dérivée de ${M('\\dfrac{1}{x}')} est ${M('-\\dfrac{1}{x^{2}}')}, donc celle de ${M(`\\dfrac{${m * m}}{x}`)} est ${M(`-\\dfrac{${m * m}}{x^{2}}`)}.`; fix = M(good[0]); }
      else if (kind === 'sign') { lines = [good[0], `\\text{Sur }]0\\,;\\,+\\infty[,\\ f'(x)>0\\text{ si }x<${m}\\text{ et }f'(x)<0\\text{ si }x>${m}`, `f(${m})=${2 * m}\\text{ est le maximum de }f`]; bad = 1; why = `${M("(x-" + m + ")(x+" + m + ")")} est négatif pour ${M(`0<x<${m}`)} (le dénominateur ${M('x^{2}')} est positif).`; fix = M(good[1]); }
      else { const w = m + m * m; lines = [good[0], good[1], `f(${m})=${m}+${m * m}=${w}\\text{ est le minimum de }f`]; bad = 2; why = `${M(`\\dfrac{${m * m}}{${m}}=${m}`)} et non ${M(m * m)} : ${M(`f(${m})=${2 * m}`)}.`; fix = M(good[2]); }
      return spot(`Pour étudier ${M(`f(x)=x+\\dfrac{${m * m}}{x}`)} sur ${M(']0\\,;\\,+\\infty[')}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(`\\min f=f(${m})=${2 * m}`), () => near(nd(f, m), 0, 1e-4) && f(m) === 2 * m && f(m) < f(m + 0.5) && f(m) < f(m - 0.5) && ok2);
    } },

  { id: 'p-var-inverse', cls: C, chapter: 'premiere-06', domain: 'analyse', skill: 'Étude de ax + b/x', fast: false,
    make(r, level) {
      const m = r.int(2, 15), a = r.int(1, 5), c = r.pick([0, 0, r.nz(-9, 9)]), B = a * m * m, f = (x) => a * x + B / x + c, fp = (x) => a - B / (x * x);
      const fx = `${coef(a)}x+\\dfrac{${B}}{x}${c === 0 ? '' : sgn(c)}`, base = `Soit ${M(`f(x)=${fx}`)} sur ${M(']0\\,;\\,+\\infty[')}.`;
      const fac = `${a === 1 ? '' : a}(x-${m})(x+${m})`;
      if (level === 1) return { q: `${base} Calculer ${M("f'(x)")} et montrer que ${M(`f'(x)=\\dfrac{${fac}}{x^{2}}`)}.`, a: `${M(`f'(x)=${a}-\\dfrac{${B}}{x^{2}}=\\dfrac{${coef(a)}x^{2}-${B}}{x^{2}}=\\dfrac{${fac}}{x^{2}}`)}.`, ok: () => [0.3, 1.7, m, 2 * m + 0.5].every((x) => near(nd(f, x), fp(x), 1e-4) && near(fp(x), (a * (x - m) * (x + m)) / (x * x), 1e-9)) };
      if (level === 2) return { q: `${base} Étudier le signe de ${M("f'")}, dresser le tableau de variations de ${M('f')} et donner son minimum.`, a: `${M(`f'(x)=\\dfrac{${fac}}{x^{2}}`)} a le signe de ${M(`x-${m}`)} sur ${M(']0\\,;\\,+\\infty[')} : négative sur ${M(`]0\\,;\\,${m}]`)}, positive sur ${M(`[${m}\\,;\\,+\\infty[`)}. ${M('f')} décroît puis croît, avec le minimum ${M(`f(${m})=${2 * a * m + c}`)}.`, ok: () => fp(m - 0.5) < 0 && fp(m + 0.5) > 0 && f(m) === 2 * a * m + c && [0.2, 1, m + 1, 3 * m, 40].every((x) => f(x) >= 2 * a * m + c - 1e-9) };
      let d, x1, x2; do { d = r.int(1, m - 1); x1 = d; x2 = (m * m) / d; } while (!Number.isInteger(x2) || x1 >= x2);
      const kk = a * (x1 + x2) + c;
      return { q: `${base} 1) Dresser le tableau de variations de ${M('f')}. 2) Montrer que l’équation ${M(`f(x)=${kk}`)} admet exactement deux solutions et les déterminer.`, a: `1) ${M('f')} décroît sur ${M(`]0\\,;\\,${m}]`)} et croît sur ${M(`[${m}\\,;\\,+\\infty[`)}, minimum ${M(`f(${m})=${2 * a * m + c}`)}. 2) ${M(`${kk}>${2 * a * m + c}`)}, donc ${M(kk)} est atteint une fois sur chaque intervalle. Pour ${M('x>0')} : ${M(`f(x)=${kk}\\iff ${polyTex([a, c - kk, B])}=0`)}, ${M(`\\Delta=${(c - kk) ** 2 - 4 * a * B}=${a * (x2 - x1)}^{2}`)}, d’où ${M(`x=${x1}`)} ou ${M(`x=${x2}`)}.`, ok: () => kk > 2 * a * m + c && x1 * x2 === m * m && f(x1) === kk && f(x2) === kk && fp(m - 0.5) < 0 && fp(m + 0.5) > 0 && x1 < m && m < x2 && [0.3, 1, 2, 7, 30].every((x) => (f(x) === kk) === (x === x1 || x === x2)) };
    } },

  { id: 'p-var-opt', cls: C, chapter: 'premiere-06', domain: 'analyse', skill: 'Optimisation en contexte', fast: false,
    make(r, level) {
      if (level === 1) {
        const L = 4 * r.int(3, 60), A = (x) => x * (L - 2 * x), xm0 = L / 4, clot = r.pick(['de grillage', 'de clôture', 'de filet']), pour = r.pick(['clore un enclos rectangulaire', 'entourer un potager rectangulaire', 'délimiter un parc à chiens rectangulaire']);
        return { q: `On dispose de ${M(`${L}\\ \\text{m}`)} ${clot} pour ${pour} sur trois côtés, le quatrième étant un mur. Si ${M('x')} est la longueur (en mètres) des deux côtés perpendiculaires au mur, exprimer l’aire ${M('A(x)')} puis déterminer ${M('x')} pour que l’aire soit maximale. Quelle est cette aire ?`, a: `Le côté parallèle au mur mesure ${M(`${L}-2x`)} donc ${M(`A(x)=x(${L}-2x)=${polyTex([-2, L, 0])}`)} pour ${M(`0<x<${L / 2}`)}. ${M(`A'(x)=${polyTex([-4, L])}`)} s’annule en ${M(`x=${xm0}`)}, positive avant et négative après : maximum ${M(`A(${xm0})=${A(xm0)}\\ \\text{m}^{2}`)}.`, ok: () => { const d = (x) => (A(x + 1e-6) - A(x - 1e-6)) / 2e-6; return near(d(xm0), 0, 1e-4) && d(xm0 - 0.5) > 0 && d(xm0 + 0.5) < 0 && A(xm0) === (L * L) / 8; } };
      }
      if (level === 2) {
        const kk = r.int(2, 20), V = 4 * kk ** 3, x0 = 2 * kk, S = (x) => x * x + (4 * V) / x, [noun, uU] = r.pick([['boîte', 'dm'], ['caisse', 'dm'], ['cuve', 'dm'], ['boîte', 'cm'], ['caisse', 'cm'], ['cuve', 'cm']]);
        return { q: `Une ${noun} sans couvercle a une base carrée de côté ${M('x')} ${uU} et un volume de ${M(`${V}\\ \\text{${uU}}^{3}`)}. Montrer que sa surface totale vaut ${M(`S(x)=x^{2}+\\dfrac{${4 * V}}{x}`)}, puis déterminer ${M('x')} pour que la surface soit minimale et calculer cette surface.`, a: `La hauteur est ${M(`h=\\dfrac{${V}}{x^{2}}`)} ; la surface vaut la base ${M('x^{2}')} plus quatre faces ${M(`4xh=\\dfrac{${4 * V}}{x}`)}. ${M(`S'(x)=2x-\\dfrac{${4 * V}}{x^{2}}=\\dfrac{2x^{3}-${4 * V}}{x^{2}}`)} s’annule pour ${M(`x^{3}=${2 * V}`)}, soit ${M(`x=${x0}`)} ; ${M("S'")} est négative avant et positive après : minimum ${M(`S(${x0})=${S(x0)}\\ \\text{${uU}}^{2}`)}.`, ok: () => { const d = (x) => (S(x + 1e-6) - S(x - 1e-6)) / 2e-6; return near(d(x0), 0, 1e-4) && x0 ** 3 === 2 * V && d(x0 - 0.3) < 0 && d(x0 + 0.3) > 0 && S(x0) === 3 * x0 * x0; } };
      }
      const al = r.int(1, 4), x0 = r.int(2, 6), be = 2 * al * x0 ** 3, C0 = (x) => al * x * x + be / x, u = r.pick(['centaines d’objets', 'dizaines de pièces', 'milliers de litres']), ub = r.pick(['centaines d’euros', 'milliers d’euros']);
      return { q: `Le coût moyen de fabrication de ${M('x')} ${u} est ${M(`C(x)=${coef(al)}x^{2}+\\dfrac{${be}}{x}`)} (en ${ub}) pour ${M('x>0')}. 1) Montrer que ${M(`C'(x)=\\dfrac{${2 * al}x^{3}-${be}}{x^{2}}`)}. 2) Dresser le tableau de variations de ${M('C')}. 3) Pour quelle quantité le coût est-il minimal ? Quel est ce coût ?`, a: `1) ${M(`C'(x)=${2 * al}x-\\dfrac{${be}}{x^{2}}=\\dfrac{${2 * al}x^{3}-${be}}{x^{2}}`)}. 2) ${M(`${2 * al}x^{3}-${be}=${2 * al}(x^{3}-${x0 ** 3})`)} s’annule en ${M(`x=${x0}`)} : ${M("C'")} est négative sur ${M(`]0\\,;\\,${x0}]`)} et positive sur ${M(`[${x0}\\,;\\,+\\infty[`)}. 3) Minimum pour ${M(`x=${x0}`)} ${u}, de valeur ${M(`C(${x0})=${C0(x0)}`)} ${ub}.`, ok: () => { const d = (x) => (C0(x + 1e-6) - C0(x - 1e-6)) / 2e-6; return near(d(x0), 0, 1e-4) && be === 2 * al * x0 ** 3 && d(x0 - 0.2) < 0 && d(x0 + 0.2) > 0 && C0(x0) === 3 * al * x0 * x0; } };
    } },

  { id: 'p-var-param', cls: C, chapter: 'premiere-06', domain: 'analyse', skill: 'Déterminer des paramètres à partir d’extremums', fast: false,
    make(r, level) {
      if (level === 1) {
        const al = r.int(-6, 6), mn = r.int(-9, 9), b = -2 * al, c = mn + al * al, f = (x) => x * x + b * x + c;
        return { q: `La fonction ${M('f(x)=x^{2}+bx+c')} admet pour minimum ${M(mn)}, atteint en ${M(`x=${al}`)}. Déterminer ${M('b')} et ${M('c')}.`, a: `${M(`f'(x)=2x+b`)} s’annule en ${M(al)} : ${M(`2\\times ${par(al)}+b=0\\iff b=${b}`)}. ${M(`f(${al})=${al * al}${sgn(b * al)}+c=${mn}`.replace(`${al * al}${sgn(b * al)}`, `${al * al + b * al}`))}, d’où ${M(`c=${c}`)}.`, ok: () => near(nd(f, al), 0, 1e-4) && f(al) === mn && f(al + 1) > mn && f(al - 1) > mn };
      }
      if (level === 2) {
        let r1, r2; do { r1 = r.int(-12, 12); r2 = r.int(-12, 12); } while (r1 >= r2 || (r1 + r2) % 2 !== 0);
        const p = (-3 * (r1 + r2)) / 2, q = 3 * r1 * r2, f = (x) => x ** 3 + p * x * x + q * x;
        return { q: `La fonction ${M('f(x)=x^{3}+px^{2}+qx')} admet des extremums locaux en ${M(r1)} et en ${M(r2)}. Déterminer ${M('p')} et ${M('q')}.`, a: `${M(`f'(x)=3x^{2}+2px+q`)} s’annule en ${M(r1)} et ${M(r2)} : somme des racines ${M(`-\\dfrac{2p}{3}=${r1 + r2}`)} et produit ${M(`\\dfrac{q}{3}=${r1 * r2}`)}. D’où ${M(`p=${p}`)} et ${M(`q=${q}`)}.`, ok: () => near(nd(f, r1), 0, 1e-3) && near(nd(f, r2), 0, 1e-3) && Number.isInteger(p) && (nd(f, r1 - 1) > 0) !== (nd(f, (r1 + r2) / 2) > 0) };
      }
      let a, x0, b, Y, tries = 0;
      do { a = r.nz(-9, 9); x0 = r.pick([1, 2, 3, 4, 5, 6, -1, -2, -3, -4, -5, -6]); b = (-3 * a * x0) / 2; Y = a * x0 ** 3 + b * x0 * x0; tries++; } while (!Number.isInteger(b) && tries < 100);
      if (!Number.isInteger(b)) return this.make(r, level);
      const f = (x) => a * x ** 3 + b * x * x, d = (x) => (f(x + 1e-6) - f(x - 1e-6)) / 2e-6, isMax = (v) => f(v - 0.01) < f(v) && f(v + 0.01) < f(v), isMin = (v) => f(v - 0.01) > f(v) && f(v + 0.01) > f(v);
      const nat = (x0 * 3 * a * x0 > 0) ? 0 : 0, ext0 = (a > 0) === (x0 > 0) ? 'minimum' : 'maximum';
      return { q: `La fonction ${M('f(x)=ax^{3}+bx^{2}')} vérifie ${M(`f(${x0})=${Y}`)} et la tangente à sa courbe au point d’abscisse ${M(x0)} est horizontale. 1) Déterminer ${M('a')} et ${M('b')}. 2) Étudier le signe de ${M("f'")} et en déduire la nature de l’extremum en ${M(x0)}.`,
        a: `1) ${M(`f'(x)=3ax^{2}+2bx`)} : ${M(`f'(${x0})=0\\iff ${lin([[3 * x0 * x0, 'a'], [2 * x0, 'b']])}=0`)} et ${M(`${lin([[x0 ** 3, 'a'], [x0 * x0, 'b']])}=${Y}`)}. On en tire ${M(`b=${fracTex(F(-3 * x0, 2))}a`)} puis ${M(`a=${a}`)}, ${M(`b=${b}`)}. 2) ${M(`f'(x)=${polyTex([3 * a, 2 * b, 0])}=${3 * a}x(x${sgn(-x0)})`)} : l’extremum en ${M(x0)} est un ${ext0} local (${M("f'")} ${(a > 0) === (x0 > 0) ? 'passe de négative à positive' : 'passe de positive à négative'}).`.replace(/(\d)x\(x/, '$1x(x'), ok: () => near(d(x0), 0, 1e-4) && f(x0) === Y && (ext0 === 'minimum' ? isMin(x0) : isMax(x0)) && 3 * a * x0 * x0 + 2 * b * x0 === 0 };
    } },

  // ============================ 07 Géométrie repérée ============================
  { id: 'p-line-forms', cls: C, chapter: 'premiere-07', domain: 'geometrie', skill: 'Équations de droites, vecteurs directeur et normal', fast: true,
    make(r, level) {
      const P = () => [r.int(-7, 7), r.int(-7, 7)];
      if (level === 1) {
        let A, B; do { A = P(); B = P(); } while (A[0] === B[0] && A[1] === B[1]);
        const p = B[0] - A[0], q = B[1] - A[1], [a, b, c] = normLine(-q, p, q * A[0] - p * A[1]);
        return { q: `Dans un repère, ${M(`A${pt(...A)}`)} et ${M(`B${pt(...B)}`)}. Déterminer une équation cartésienne de la droite ${M('(AB)')}.`, a: `${M(`\\overrightarrow{AB}${vc(p, q)}`)} est un vecteur directeur : ${M(`M(x\\,;\\,y)\\in(AB)\\iff ${par(p)}\\times ${xm(A[1], 'y')}-${par(q)}\\times ${xm(A[0])}=0`)}, soit ${M(`${lin([[a, 'x'], [b, 'y'], [c, '']])}=0`)}.`, ok: () => a * A[0] + b * A[1] + c === 0 && a * B[0] + b * B[1] + c === 0 && (a !== 0 || b !== 0) };
      }
      if (level === 2) {
        const a = r.nz(-9, 9), b = r.nz(-9, 9), c = r.int(-12, 12);
        const on = r.next() < 0.5, x0 = r.int(-5, 5), y0 = on ? F(-(a * x0 + c), b) : add(F(-(a * x0 + c), b), F(r.nz(-3, 3))), has = eq(y0, F(-(a * x0 + c), b));
        const m = F(-a, b), p0 = F(-c, b);
        return { q: `La droite ${M('d')} a pour équation ${M(`${lin([[a, 'x'], [b, 'y'], [c, '']])}=0`)}. Donner un vecteur directeur, un vecteur normal, l’équation réduite de ${M('d')}, et dire si ${M(`K\\left(${x0}\\,;\\,${fracTex(y0)}\\right)`)} appartient à ${M('d')}.`, a: `Vecteur normal ${M(`\\vec{n}${vc(a, b)}`)}, vecteur directeur ${M(`\\vec{u}${vc(-b, a)}`)}. ${M(`y=${affTex(m, p0)}`)}. ${M(`${par(a)}\\times ${par(x0)}+${par(b)}\\times ${fracTex(y0).includes('dfrac') ? '\\left(' + fracTex(y0) + '\\right)' : par(y0.n)}${sgn(c)}=${fracTex(add(add(F(a * x0), mul(F(b), y0)), F(c)))}`)} : ${has ? 'oui, ' : 'non, '}K ${has ? 'appartient' : 'n’appartient pas'} à ${M('d')}.`, ok: () => a * -b + b * a === 0 && eq(add(mul(m, F(x0)), p0), F(-(a * x0 + c), b)) && has === eq(add(add(F(a * x0), mul(F(b), y0)), F(c)), F(0)) };
      }
      let a, b, c, a2, b2, c2, kind;
      do { a = r.nz(-6, 6); b = r.nz(-6, 6); c = r.int(-9, 9); kind = r.pick(['par', 'perp', 'sec', 'sec']); if (kind === 'par') { const k = r.pick([2, -1, 3, -2]); a2 = a * k; b2 = b * k; c2 = c * k + r.pick([1, -1, 2, 3]) * k; } else if (kind === 'perp') { const k = r.pick([1, 2, -1, 3]); a2 = -b * k; b2 = a * k; c2 = r.int(-9, 9); } else { a2 = r.nz(-6, 6); b2 = r.nz(-6, 6); c2 = r.int(-9, 9); } } while (kind === 'sec' && (a * b2 - a2 * b === 0 || a * a2 + b * b2 === 0));
      const D = a * b2 - a2 * b, x = D === 0 ? F(0) : F(b * c2 - b2 * c, D), y = D === 0 ? F(0) : F(a2 * c - a * c2, D), dot = a * a2 + b * b2;
      const res = D === 0 ? 'parallèles (et distinctes)' : dot === 0 ? 'perpendiculaires' : 'sécantes non perpendiculaires';
      return { q: `Dans un repère orthonormé, ${M(`d_1:\\ ${lin([[a, 'x'], [b, 'y'], [c, '']])}=0`)} et ${M(`d_2:\\ ${lin([[a2, 'x'], [b2, 'y'], [c2, '']])}=0`)}. Étudier la position relative de ${M('d_1')} et ${M('d_2')} et, si elles sont sécantes, donner leur point d’intersection.`,
        a: `${M(`\\vec{n_1}${vc(a, b)}`)}, ${M(`\\vec{n_2}${vc(a2, b2)}`)}. ${M(`\\det(\\vec{n_1},\\vec{n_2})=${a}\\times ${par(b2)}-${par(b)}\\times ${par(a2)}=${D}`)}, ${M(`\\vec{n_1}\\cdot\\vec{n_2}=${dot}`)} : les droites sont ${res}.${D === 0 ? '' : ` Intersection : ${M(`\\left(${fracTex(x)}\\,;\\,${fracTex(y)}\\right)`)}.`}`,
        ok: () => (D === 0) === (kind === 'par') && (dot === 0) === (kind === 'perp') && (D === 0 || (eq(add(add(mul(F(a), x), mul(F(b), y)), F(c)), F(0)) && eq(add(add(mul(F(a2), x), mul(F(b2), y)), F(c2)), F(0)))) && (D !== 0 || (c2 * a !== c * a2 || c2 * b !== c * b2)) };
    } },

  { id: 'p-line-qcm', cls: C, chapter: 'premiere-07', domain: 'geometrie', skill: 'QCM sur les droites du plan', fast: true,
    make(r, level) {
      let a, b, c;
      do { a = r.nz(-8, 8); b = r.nz(-8, 8); c = r.int(-9, 9); } while (Math.abs(a) === Math.abs(b));
      const eqn = M(`${lin([[a, 'x'], [b, 'y'], [c, '']])}=0`);
      if (level === 1) {
        const V = (x, y) => M(vc(x, y)), cs = [[-b, a, 'on lit ' + M('\\vec{u}(-b\\,;\\,a)') + ' dans ' + M('ax+by+c=0') + '.'], [a, b, 'donne le vecteur normal ' + M('(a\\,;\\,b)') + '.'], [b, a, 'échange les coefficients sans changer de signe.'], [-a, b, 'change le signe d’un seul coefficient du vecteur normal.']];
        return mcq(r, `La droite ${M('d')} a pour équation ${eqn}. Un vecteur directeur de ${M('d')} est :`, opt(V(cs[0][0], cs[0][1]), cs[0][2], { v: [cs[0][0], cs[0][1]] }), cs.slice(1).map(([x, y, w]) => opt(V(x, y), w, { v: [x, y] })), (o) => a * o.v[0] + b * o.v[1] === 0);
      }
      if (level === 2) {
        const m = F(-a, b), cs = [[m, 'on isole ' + M('y') + ' : ' + M('y=-\\dfrac{a}{b}x-\\dfrac{c}{b}') + '.'], [F(a, b), 'oublie le signe moins.'], [F(-b, a), 'inverse le quotient.'], [F(b, a), 'inverse le quotient et oublie le signe moins.']];
        const T = (f) => M(fracTex(f)), slope = (v) => v;
        return mcq(r, `La droite ${M('d')} a pour équation ${eqn}. Son coefficient directeur est :`, opt(T(cs[0][0]), cs[0][1], { v: val(cs[0][0]) }), cs.slice(1).map(([f, w]) => opt(T(f), w, { v: val(f) })), (o) => { const y = (x) => -(a * x + c) / b; return near(y(1) - y(0), o.v, 1e-9); });
      }
      const A = [r.int(-6, 6), r.int(-6, 6)], g0 = -(-b * A[0] + a * A[1]), ok0 = (al, be, ga) => al * a + be * b === 0 && al * A[0] + be * A[1] + ga === 0;
      const gp = -(a * A[0] + b * A[1]), cs = [[-b, a, b * A[0] - a * A[1], 'un vecteur normal de la perpendiculaire est un vecteur directeur de ' + M('d') + ', soit ' + M('(-b\\,;\\,a)') + ', et elle passe par ' + M('A') + '.'], [a, b, gp, 'écrit la parallèle à ' + M('d') + ' passant par ' + M('A') + ' (même vecteur normal).'], [-b, a, c, 'garde le bon vecteur normal mais conserve la constante ' + M(c) + ' de ' + M('d') + ' au lieu d’utiliser ' + M('A') + '.'], [b, a, -(b * A[0] + a * A[1]), 'échange ' + M('a') + ' et ' + M('b') + ' sans changer de signe.']];
      const T = ([x, y, z]) => M(`${lin([[x, 'x'], [y, 'y'], [z, '']])}=0`);
      if (new Set(cs.map(T)).size < 4) return this.make(r, level);
      return mcq(r, `Dans un repère orthonormé, ${M('d')} a pour équation ${eqn} et ${M(`A${pt(...A)}`)}. Une équation de la perpendiculaire à ${M('d')} passant par ${M('A')} est :`, opt(T(cs[0]), cs[0][3], { v: cs[0] }), cs.slice(1).map((x) => opt(T(x), x[3], { v: x })), (o) => ok0(o.v[0], o.v[1], o.v[2]));
    } },

  { id: 'p-line-tf', cls: C, chapter: 'premiere-07', domain: 'geometrie', skill: 'Vrai ou faux sur les droites et les cercles', fast: true,
    make(r, level) {
      const a = r.nz(-7, 7), b = r.nz(-7, 7), c = r.int(-9, 9), x0 = r.int(-6, 6), y0 = r.int(-6, 6), k = r.pick([2, 3, -2, 4]), rad = r.int(2, 9), h = r.int(-6, 6), l = r.int(-6, 6);
      const fam = {
        1: [
          () => { const on = r.next() < 0.5, yy = on ? y0 : y0 + r.nz(-3, 3), cc = -(a * x0 + b * y0); return { s: `Le point ${M(`K${pt(x0, yy)}`)} appartient à la droite d’équation ${M(`${lin([[a, 'x'], [b, 'y'], [cc, '']])}=0`)}.`, v: on, j: `${M(`${par(a)}\\times ${par(x0)}+${par(b)}\\times ${par(yy)}${sgn(cc)}=${a * x0 + b * yy + cc}`)}, ${on ? 'nul : le point est sur la droite.' : 'non nul : le point n’est pas sur la droite.'}`, c: () => (a * x0 + b * yy + cc === 0) === on }; },
          () => ({ s: `Le cercle d’équation ${M(`(x${sgn(-h)})^{2}+(y${sgn(-l)})^{2}=${rad * rad}`.replace('(x+0)', 'x').replace('(y+0)', 'y'))} a pour centre ${M(`(${-h}\\,;\\,${-l})`)} et pour rayon ${M(rad * rad)}.`, v: false, j: `Le centre est ${M(`(${h}\\,;\\,${l})`)} (les signes sont opposés à ceux de l’équation) et le rayon est ${M(`\\sqrt{${rad * rad}}=${rad}`)}.`, c: () => true }),
          () => ({ s: `Les droites ${M(`${lin([[a, 'x'], [b, 'y'], [c, '']])}=0`)} et ${M(`${lin([[k * a, 'x'], [k * b, 'y'], [k * c, '']])}=0`)} sont confondues.`, v: true, j: `La seconde équation s’obtient en multipliant la première par ${M(k)} : mêmes solutions.`, c: () => [-3, 0, 4].every((x) => (b !== 0 ? Math.abs((-(a * x + c)) / b - (-(k * a * x + k * c)) / (k * b)) < 1e-9 : true)) }),
        ],
        2: [
          () => ({ s: `Les droites ${M(`${lin([[a, 'x'], [b, 'y'], [c, '']])}=0`)} et ${M(`${lin([[-b, 'x'], [a, 'y'], [c, '']])}=0`)} sont perpendiculaires.`, v: true, j: `Leurs vecteurs normaux ${M(vc(a, b))} et ${M(vc(-b, a))} ont pour produit scalaire ${M(`${a}\\times ${par(-b)}+${par(b)}\\times ${a}=0`)}.`, c: () => a * -b + b * a === 0 }),
          () => { const X0 = x0 === h && y0 === l ? x0 + 1 : x0, on = r.next() < 0.5, d2 = (h - X0) ** 2 + (l - y0) ** 2, rr = on ? d2 : d2 + r.pick([1, 2, 3]); return { s: `Le point ${M(`K${pt(X0, y0)}`)} est sur le cercle de centre ${M(`\\Omega${pt(h, l)}`)} et de rayon ${M(`\\sqrt{${rr}}`)}.`, v: on, j: `${M(`\\Omega K^{2}=(${X0}${sgn(-h)})^{2}+(${y0}${sgn(-l)})^{2}=${d2}`)}, ${d2 === rr ? 'égal au carré du rayon.' : `différent de ${M(rr)}.`}`, c: () => ((X0 - h) ** 2 + (y0 - l) ** 2 === rr) === on }; },
          () => ({ s: `Le vecteur ${M(`\\vec{u}${vc(b, -a)}`)} est un vecteur directeur de la droite ${M(`${lin([[a, 'x'], [b, 'y'], [c, '']])}=0`)}.`, v: true, j: `${M(`\\vec{u}\\cdot\\vec{n}=${b}\\times ${par(a)}+${par(-a)}\\times ${par(b)}=0`)} : il est orthogonal au vecteur normal ${M(vc(a, b))}.`, c: () => b * a + -a * b === 0 }),
        ],
        3: [
          () => { const tail = lin([[2 * h + 2, 'x'], [2 * l, 'y'], [(h + 1) ** 2 + l * l + 1, '']]); return { s: `Une équation de la forme ${M(`x^{2}+y^{2}${tail.startsWith('-') ? '' : '+'}${tail}=0`)} est toujours celle d’un cercle.`, v: false, j: `Forme canonique : ${M(`${xm(-(h + 1))}^{2}+${xm(-l, 'y')}^{2}=-1`)}, impossible dans ${M(R)} : l’ensemble des points est vide.`, c: () => -1 < 0 }; },
          () => ({ s: `Deux droites ayant des vecteurs directeurs colinéaires sont toujours confondues. (On teste ${M(`y=${coef(k)}x`)} et ${M(`y=${coef(k)}x+${rad}`)}.)`, v: false, j: `Elles sont parallèles mais distinctes : l’ordonnée à l’origine vaut ${M(0)} pour l’une et ${M(rad)} pour l’autre.`, c: () => rad !== 0 }),
          () => ({ s: `Le cercle de diamètre ${M(`[AB]`)} avec ${M(`A${pt(h, l)}`)} et ${M(`B${pt(h + 2 * rad, l)}`)} a pour équation ${M(`(x${sgn(-(h + rad))})^{2}+(y${sgn(-l)})^{2}=${rad * rad}`.replace('(y+0)', 'y').replace('(x+0)', 'x'))}.`, v: true, j: `Centre : milieu ${M(`(${h + rad}\\,;\\,${l})`)}, rayon : ${M(`\\dfrac{AB}{2}=\\dfrac{${2 * rad}}{2}=${rad}`)}.`, c: () => (2 * rad) / 2 === rad }),
        ],
      };
      return tf(r.pick(fam[level])());
    } },

  { id: 'p-line-error', cls: C, chapter: 'premiere-07', domain: 'geometrie', skill: 'Trouver l’erreur sur droites, cercles et distances', fast: false,
    make(r, level) {
      const P = () => [r.int(-7, 7), r.int(-7, 7)];
      if (level === 1) {
        let A, B, kind; do { A = P(); B = P(); kind = r.pick(['sum', 'sign', 'cst']); } while ((A[0] === B[0] && A[1] === B[1]) || A[0] * A[1] === 0 || B[0] - A[0] === 0 || B[1] - A[1] === 0 || (kind === 'sum' && (B[0] + A[0] === 0 || B[1] + A[1] === 0 || (B[0] + A[0]) * (B[1] - A[1]) - (B[1] + A[1]) * (B[0] - A[0]) === 0)) || (kind === 'cst' && (B[1] - A[1]) * A[0] - (B[0] - A[0]) * A[1] === 0));
        const p = B[0] - A[0], q = B[1] - A[1], cst = q * A[0] - p * A[1];
        const good = [`\\overrightarrow{AB}${vc(p, q)}`, `M\\in(AB)\\iff ${par(p)}\\times ${xm(A[1], 'y')}-${par(q)}\\times ${xm(A[0])}=0`, `${lin([[-q, 'x'], [p, 'y'], [cst, '']])}=0`];
        let lines = good, bad, why, fix, differs = true;
        const dEq = (pp, qq) => `M\\in(AB)\\iff ${par(pp)}\\times ${xm(A[1], 'y')}-${par(qq)}\\times ${xm(A[0])}=0`;
        let shownLine;
        if (kind === 'sum') { const pp = B[0] + A[0], qq = B[1] + A[1]; lines = [`\\overrightarrow{AB}${vc(pp, qq)}`, dEq(pp, qq), `${lin([[-qq, 'x'], [pp, 'y'], [qq * A[0] - pp * A[1], '']])}=0`]; shownLine = [-qq, pp, qq * A[0] - pp * A[1]]; bad = 0; why = `les coordonnées de ${M('\\overrightarrow{AB}')} sont les différences ${M('x_B-x_A')} et ${M('y_B-y_A')}, pas les sommes.`; fix = M(good[0]); }
        else if (kind === 'sign') { lines = [good[0], `M\\in(AB)\\iff ${par(p)}\\times ${xm(A[1], 'y')}+${par(q)}\\times ${xm(A[0])}=0`, `${lin([[q, 'x'], [p, 'y'], [-q * A[0] - p * A[1], '']])}=0`]; shownLine = [q, p, -q * A[0] - p * A[1]]; bad = 1; why = `la condition de colinéarité est un déterminant ${M('xy\'-yx\'')} : il y a un signe moins.`; fix = M(good[1]); }
        else { lines = [good[0], good[1], `${lin([[-q, 'x'], [p, 'y'], [-cst, '']])}=0`]; shownLine = [-q, p, -cst]; bad = 2; why = `en développant, la constante vaut ${M(`${q}\\times ${par(A[0])}-${par(p)}\\times ${par(A[1])}=${cst}`)}.`; fix = M(good[2]); }
        return spot(`Pour trouver une équation cartésienne de ${M('(AB)')} avec ${M(`A${pt(...A)}`)} et ${M(`B${pt(...B)}`)}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(good[2]), () => { const [a, b, c] = [-q, p, cst]; const [sa, sb, sc] = shownLine; return a * A[0] + b * A[1] + c === 0 && a * B[0] + b * B[1] + c === 0 && !(sa * A[0] + sb * A[1] + sc === 0 && sa * B[0] + sb * B[1] + sc === 0); });
      }
      if (level === 2) {
        const h = r.nz(-8, 8), k = r.nz(-8, 8), rad = r.int(2, 9), kind0 = r.pick(['cen', 'ray', 'dev']), kind = (kind0 === 'dev' && h * h + k * k === rad * rad) ? 'cen' : kind0;   // a zero constant makes the 'wrong' expansion correct
        const eqn = `(x${sgn(-h)})^{2}+(y${sgn(-k)})^{2}=${rad * rad}`;
        const D = -2 * h, E = -2 * k, Cc = h * h + k * k - rad * rad, expand = (c0) => { const t = lin([[D, 'x'], [E, 'y'], [c0, '']]); return `x^{2}+y^{2}${t.startsWith('-') ? '' : '+'}${t}=0`; };
        const good = [eqn, `\\text{centre }\\Omega(${h}\\,;\\,${k})`, `\\text{rayon }${rad}`];
        let lines = good, bad, why, fix;
        if (kind === 'cen') { lines = [eqn, `\\text{centre }\\Omega(${-h}\\,;\\,${-k})`, good[2]]; bad = 1; why = `${M(`x${sgn(-h)}=x-${par(h)}`)} : l’abscisse du centre est ${M(h)} et l’ordonnée ${M(k)}.`; fix = M(good[1]); }
        else if (kind === 'ray') { lines = [eqn, good[1], `\\text{rayon }${rad * rad}`]; bad = 2; why = `${M(`r^{2}=${rad * rad}`)}, donc le rayon est ${M(`\\sqrt{${rad * rad}}=${rad}`)}.`; fix = M(good[2]); }
        else { lines = [eqn, expand(-Cc), good[1] + `,\\ ` + good[2]]; bad = 1; why = `en développant, la constante est ${M(`${h * h}+${k * k}-${rad * rad}=${Cc}`)}.`; fix = M(expand(Cc)); }
        return spot(`On lit sur ${M(eqn)} les caractéristiques d’un cercle ; un élève écrit une solution.`, lines.map(M), bad, why, fix, M(`\\Omega(${h}\\,;\\,${k}),\\ r=${rad}`), () => h * h + k * k - rad * rad === Cc && (kind !== 'dev' || Cc !== -Cc || Cc === 0 ? Cc !== 0 || kind !== 'dev' : true) && (kind !== 'cen' || h !== -h) && rad > 0);
      }
      const pyth = r.pick([[3, 4], [4, 3], [5, 12], [12, 5], [6, 8], [8, 6]]), a = pyth[0] * r.sign(), b = pyth[1] * r.sign(), c = r.int(-12, 12), x0 = r.int(-6, 6), y0 = r.int(-6, 6), kind = r.pick(['den', 'abs', 'cst']);
      const num = a * x0 + b * y0 + c, n2 = a * a + b * b, nrm = Math.hypot(a, b);
      if (num === 0 || num > 0 && kind === 'abs' || c === 0 && kind === 'cst') return this.make(r, level);
      const good = [`|${par(a)}\\times ${par(x0)}+${par(b)}\\times ${par(y0)}${sgn(c)}|=${Math.abs(num)}`, `\\sqrt{a^{2}+b^{2}}=\\sqrt{${par(a)}^{2}+${par(b)}^{2}}=${nrm}`, `d=${fracTex(F(Math.abs(num), nrm))}`];
      let lines = good, bad, why, fix, shown = F(Math.abs(num), nrm);
      if (kind === 'den') { lines = [good[0], `a^{2}+b^{2}=${n2}`, `d=${fracTex(F(Math.abs(num), n2))}`]; bad = 1; why = `le dénominateur est la norme ${M('\\sqrt{a^{2}+b^{2}}')}, avec la racine.`; fix = M(good[1]); shown = F(Math.abs(num), n2); }
      else if (kind === 'abs') { lines = [`${par(a)}\\times ${par(x0)}+${par(b)}\\times ${par(y0)}${sgn(c)}=${num}`, good[1], `d=${fracTex(F(num, nrm))}`]; bad = 0; why = `une distance est positive : on prend la valeur absolue ${M(`|${num}|=${Math.abs(num)}`)}.`; fix = M(good[0]); shown = F(num, nrm); }
      else { const w = a * x0 + b * y0; lines = [`|${par(a)}\\times ${par(x0)}+${par(b)}\\times ${par(y0)}|=${Math.abs(w)}`, good[1], `d=${fracTex(F(Math.abs(w), nrm))}`]; bad = 0; why = `la formule contient aussi la constante ${M('c')} de l’équation : ${M(`${a * x0 + b * y0}${sgn(c)}=${num}`)}.`; fix = M(good[0]); shown = F(Math.abs(w), nrm); }
      return spot(`Pour calculer la distance du point ${M(`K${pt(x0, y0)}`)} à la droite ${M(`${lin([[a, 'x'], [b, 'y'], [c, '']])}=0`)} dans un repère orthonormé, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(good[2]), () => nrm * nrm === n2 && Number.isInteger(nrm) && !eq(shown, F(Math.abs(num), nrm)) && near(Math.abs(num) / nrm, val(F(Math.abs(num), nrm)), 1e-12));
    } },

  { id: 'p-proj', cls: C, chapter: 'premiere-07', domain: 'geometrie', skill: 'Projeté orthogonal et distance à une droite', fast: false,
    make(r, level) {
      const P = () => [r.int(-7, 7), r.int(-7, 7)];
      if (level === 1) {
        let u, Mp; do { u = [r.nz(-4, 4), r.nz(-4, 4)]; Mp = P(); } while (Mp[0] * u[0] + Mp[1] * u[1] === 0 || Math.abs(u[0]) === Math.abs(u[1]) && false);
        const t = F(Mp[0] * u[0] + Mp[1] * u[1], u[0] * u[0] + u[1] * u[1]), H = [mul(t, F(u[0])), mul(t, F(u[1]))];
        return { q: `Dans un repère orthonormé, ${M('d')} est la droite passant par l’origine ${M('O')} de vecteur directeur ${M(`\\vec{u}${vc(...u)}`)}. Déterminer les coordonnées du projeté orthogonal ${M('H')} de ${M(`M${pt(...Mp)}`)} sur ${M('d')}.`, a: `${M('H')} est sur ${M('d')} : ${M('\\overrightarrow{OH}=t\\,\\vec{u}')}, et ${M('\\overrightarrow{HM}\\cdot\\vec{u}=0')} donne ${M(`t=\\dfrac{\\overrightarrow{OM}\\cdot\\vec{u}}{\\|\\vec{u}\\|^{2}}=\\dfrac{${Mp[0] * u[0] + Mp[1] * u[1]}}{${u[0] * u[0] + u[1] * u[1]}}=${fracTex(t)}`)}. ${M(`H\\left(${fracTex(H[0])}\\,;\\,${fracTex(H[1])}\\right)`)}.`, ok: () => eq(add(mul(sub(F(Mp[0]), H[0]), F(u[0])), mul(sub(F(Mp[1]), H[1]), F(u[1]))), F(0)) && eq(mul(H[0], F(u[1])), mul(H[1], F(u[0]))) };
      }
      let A, B, Mp; do { A = P(); B = P(); Mp = P(); } while ((A[0] === B[0] && A[1] === B[1]) || (B[0] - A[0]) * (Mp[1] - A[1]) - (B[1] - A[1]) * (Mp[0] - A[0]) === 0);
      const ab = [B[0] - A[0], B[1] - A[1]], am = [Mp[0] - A[0], Mp[1] - A[1]], n2 = ab[0] ** 2 + ab[1] ** 2, t = F(am[0] * ab[0] + am[1] * ab[1], n2), H = [add(F(A[0]), mul(t, F(ab[0]))), add(F(A[1]), mul(t, F(ab[1])))];
      const hm2 = add(mul(sub(F(Mp[0]), H[0]), sub(F(Mp[0]), H[0])), mul(sub(F(Mp[1]), H[1]), sub(F(Mp[1]), H[1]))), det = Math.abs(ab[0] * am[1] - ab[1] * am[0]);
      const base = `Dans un repère orthonormé, ${M(`A${pt(...A)}`)}, ${M(`B${pt(...B)}`)} et ${M(`M${pt(...Mp)}`)}.`;
      const hTxt = `H\\left(${fracTex(H[0])}\\,;\\,${fracTex(H[1])}\\right)`;
      const detail = `${M(`\\overrightarrow{AH}=t\\,\\overrightarrow{AB}`)} avec ${M(`t=\\dfrac{\\overrightarrow{AM}\\cdot\\overrightarrow{AB}}{AB^{2}}=\\dfrac{${am[0] * ab[0] + am[1] * ab[1]}}{${n2}}=${fracTex(t)}`)}, d’où ${M(hTxt)}.`;
      if (level === 2) return { q: `${base} Déterminer les coordonnées du projeté orthogonal ${M('H')} de ${M('M')} sur la droite ${M('(AB)')}.`, a: detail, ok: () => eq(add(mul(sub(F(Mp[0]), H[0]), F(ab[0])), mul(sub(F(Mp[1]), H[1]), F(ab[1]))), F(0)) && eq(mul(sub(H[0], F(A[0])), F(ab[1])), mul(sub(H[1], F(A[1])), F(ab[0]))) };
      return { q: `${base} 1) Déterminer le projeté orthogonal ${M('H')} de ${M('M')} sur ${M('(AB)')}. 2) Calculer la distance ${M('MH')} puis l’aire du triangle ${M('ABM')}.`, a: `1) ${detail} 2) ${M(`MH^{2}=${fracTex(hm2)}`)}, ${M(`MH=${hm2.d === 1 ? sqrtTex(hm2.n) : `\\dfrac{\\sqrt{${hm2.n * hm2.d}}}{${hm2.d}}`}`)}. Aire : ${M(`\\dfrac{AB\\times MH}{2}=\\dfrac{|\\det(\\overrightarrow{AB},\\overrightarrow{AM})|}{2}=\\dfrac{${det}}{2}=${numTex(F(det, 2))}`)}.`, ok: () => { const lhs = mul(hm2, F(n2)); return eq(lhs, F(det * det)) && eq(add(mul(sub(F(Mp[0]), H[0]), F(ab[0])), mul(sub(F(Mp[1]), H[1]), F(ab[1]))), F(0)); } };
    } },

  { id: 'p-circle-line', cls: C, chapter: 'premiere-07', domain: 'geometrie', skill: 'Cercle et droite : position, intersection, tangentes', fast: false,
    make(r, level) {
      const pyth = r.pick([[3, 4], [4, 3], [5, 12], [12, 5], [6, 8], [8, 6]]);
      const a = pyth[0] * r.sign(), b = pyth[1] * r.sign(), nrm = Math.hypot(a, b);
      const pts = (r2) => { const out = []; for (let x = -12; x <= 12; x++) for (let y = -12; y <= 12; y++) if (x * x + y * y === r2) out.push([x, y]); return out; };
      if (level === 1) {
        const h = r.int(-5, 5), k = r.int(-5, 5), c = r.int(-15, 15), rad = r.int(1, 8), num = a * h + b * k + c, kind = r.pick(['tan', 'sec', 'ext']);
        let rr = rad; if (num !== 0) { if (kind === 'tan' && Math.abs(num) % nrm === 0) rr = Math.abs(num) / nrm; }
        const d = Math.abs(num) / nrm, pos = d < rr - 1e-9 ? 'sécante' : Math.abs(d - rr) < 1e-9 ? 'tangente' : 'extérieure';
        const posExact = Math.abs(num) < nrm * rr ? 'sécante' : Math.abs(num) === nrm * rr ? 'tangente' : 'extérieure';
        return { q: `Dans un repère orthonormé, le cercle ${M('\\mathcal{C}')} a pour centre ${M(`\\Omega${pt(h, k)}`)} et pour rayon ${M(rr)}. Étudier la position de la droite ${M(`d:\\ ${lin([[a, 'x'], [b, 'y'], [c, '']])}=0`)} par rapport à ${M('\\mathcal{C}')}.`, a: `${M(`d(\\Omega,d)=\\dfrac{|${par(a)}\\times ${par(h)}+${par(b)}\\times ${par(k)}${sgn(c)}|}{\\sqrt{${a * a}+${b * b}}}=\\dfrac{${Math.abs(num)}}{${nrm}}=${numTex(F(Math.abs(num), nrm))}`)}. ${M(`${numTex(F(Math.abs(num), nrm))}${Math.abs(num) < nrm * rr ? '<' : Math.abs(num) === nrm * rr ? '=' : '>'}${rr}`)} : la droite est ${posExact} au cercle.`, ok: () => pos === posExact && near(d, Math.abs(num) / nrm) };
      }
      if (level === 2) {
        const r2 = r.pick([25, 50, 65, 85, 100, 125, 130]), L = pts(r2); let P1, P2; do { P1 = r.pick(L); P2 = r.pick(L); } while (P1 === P2 || (P1[0] === P2[0] && P1[1] === P2[1]) || (P1[0] === -P2[0] && P1[1] === -P2[1] && false));
        const h = r.int(-4, 4), k = r.int(-4, 4), A = [P1[0] + h, P1[1] + k], B = [P2[0] + h, P2[1] + k], p = B[0] - A[0], q = B[1] - A[1], [la, lb, lc] = normLine(-q, p, q * A[0] - p * A[1]);
        const circ = `(x${sgn(-h)})^{2}+(y${sgn(-k)})^{2}=${r2}`.replace('(x+0)', 'x').replace('(y+0)', 'y');
        const sols = [A, B].sort((u, v) => u[0] - v[0] || u[1] - v[1]);
        return { q: `Dans un repère orthonormé, déterminer les points d’intersection du cercle ${M(`\\mathcal{C}:\\ ${circ}`)} et de la droite ${M(`d:\\ ${lin([[la, 'x'], [lb, 'y'], [lc, '']])}=0`)}.`, a: `On exprime une variable avec l’équation de ${M('d')} puis on la reporte dans celle du cercle ; on obtient une équation du second degré dont les solutions donnent les deux points d’intersection : ${M(`${pt(...sols[0])}`)} et ${M(`${pt(...sols[1])}`)}.`, ok: () => sols.every(([x, y]) => (x - h) ** 2 + (y - k) ** 2 === r2 && la * x + lb * y + lc === 0) && !(sols[0][0] === sols[1][0] && sols[0][1] === sols[1][1]) && (() => { let cnt = 0; for (let x = -25; x <= 25; x++) for (let y = -25; y <= 25; y++) if ((x - h) ** 2 + (y - k) ** 2 === r2 && la * x + lb * y + lc === 0) cnt++; return cnt === 2; })() };
      }
      const h = r.int(-5, 5), k = r.int(-5, 5), rad = nrm * r.int(1, 2), c = r.int(-9, 9), s = rad / nrm;
      const c1 = c - 0, cs = [-(a * h + b * k) - rad * nrm, -(a * h + b * k) + rad * nrm], T = [[h + a * s, k + b * s], [h - a * s, k - b * s]];
      const circ = `(x${sgn(-h)})^{2}+(y${sgn(-k)})^{2}=${rad * rad}`.replace('(x+0)', 'x').replace('(y+0)', 'y');
      return { q: `Dans un repère orthonormé, le cercle ${M(`\\mathcal{C}:\\ ${circ}`)} et la droite ${M(`d:\\ ${lin([[a, 'x'], [b, 'y'], [c1, '']])}=0`)}. Déterminer les équations des tangentes à ${M('\\mathcal{C}')} parallèles à ${M('d')}, ainsi que leurs points de contact.`,
        a: `Une tangente parallèle à ${M('d')} s’écrit ${M(`${lin([[a, 'x'], [b, 'y']])}+c'=0`)} et sa distance au centre vaut ${M(rad)} : ${M(`\\dfrac{|${par(a)}\\times ${par(h)}+${par(b)}\\times ${par(k)}+c'|}{${nrm}}=${rad}`)}, soit ${M(`c'=${cs[0]}`)} ou ${M(`c'=${cs[1]}`)}. Tangentes : ${M(`${lin([[a, 'x'], [b, 'y'], [cs[0], '']])}=0`)} en ${M(`${pt(...T[0])}`)} et ${M(`${lin([[a, 'x'], [b, 'y'], [cs[1], '']])}=0`)} en ${M(`${pt(...T[1])}`)}.`,
        ok: () => cs.every((cc, i) => Math.abs(a * h + b * k + cc) === rad * nrm && a * T[i][0] + b * T[i][1] + cc === 0 && (T[i][0] - h) ** 2 + (T[i][1] - k) ** 2 === rad * rad) && cs[0] !== cs[1] };
    } },

  { id: 'p-circle-build', cls: C, chapter: 'premiere-07', domain: 'geometrie', skill: 'Déterminer l’équation d’un cercle', fast: false,
    make(r, level) {
      const P = () => [r.int(-6, 6), r.int(-6, 6)];
      const open = (h, k, r2) => `(x${sgn(-h)})^{2}+(y${sgn(-k)})^{2}=${r2}`.replace('(x+0)', 'x').replace('(y+0)', 'y');
      if (level === 1) {
        let O, A; do { O = P(); A = P(); } while (O[0] === A[0] && O[1] === A[1]);
        const r2 = (A[0] - O[0]) ** 2 + (A[1] - O[1]) ** 2;
        return { q: `Dans un repère orthonormé, déterminer l’équation du cercle de centre ${M(`\\Omega${pt(...O)}`)} passant par ${M(`A${pt(...A)}`)}.`, a: `${M(`R^{2}=\\Omega A^{2}=(${A[0]}${sgn(-O[0])})^{2}+(${A[1]}${sgn(-O[1])})^{2}=${r2}`)} donc ${M(open(O[0], O[1], r2))}.`, ok: () => (A[0] - O[0]) ** 2 + (A[1] - O[1]) ** 2 === r2 && r2 > 0 };
      }
      if (level === 2) {
        let A, B; do { A = P(); B = P(); } while (A[0] === B[0] && A[1] === B[1]);
        const I = [F(A[0] + B[0], 2), F(A[1] + B[1], 2)], r2 = F((A[0] - B[0]) ** 2 + (A[1] - B[1]) ** 2, 4), D = -(A[0] + B[0]), E = -(A[1] + B[1]), Cc = A[0] * B[0] + A[1] * B[1];
        const t = lin([[D, 'x'], [E, 'y'], [Cc, '']]);
        const ctr = (f, v) => (f.n === 0 ? v : `(${v}${f.n < 0 ? '+' : '-'}${fracTex(F(Math.abs(f.n), f.d))})`);
        return { q: `Dans un repère orthonormé, ${M(`A${pt(...A)}`)} et ${M(`B${pt(...B)}`)}. Déterminer l’équation du cercle de diamètre ${M('[AB]')} en écrivant que ${M('\\overrightarrow{MA}\\cdot\\overrightarrow{MB}=0')}, puis son centre et son rayon.`, a: `${M(`\\overrightarrow{MA}\\cdot\\overrightarrow{MB}=(${A[0]}-x)(${B[0]}-x)+(${A[1]}-y)(${B[1]}-y)=0`)}, soit ${M(`x^{2}+y^{2}${t.startsWith('-') ? '' : '+'}${t}=0`)}. Centre ${M(`I\\left(${fracTex(I[0])}\\,;\\,${fracTex(I[1])}\\right)`)}, rayon ${M(`\\dfrac{AB}{2}=\\sqrt{${fracTex(r2)}}`)}.`, ok: () => { const pts = [A, B, [A[0], B[1]]]; return [A, B].every(([x, y]) => x * x + y * y + D * x + E * y + Cc === 0) && eq(add(mul(sub(F(A[0]), I[0]), sub(F(A[0]), I[0])), mul(sub(F(A[1]), I[1]), sub(F(A[1]), I[1]))), r2) && pts.length === 3 && D === -2 * val(I[0]) && E === -2 * val(I[1]); } };
      }
      const h = r.int(-5, 5), k = r.int(-5, 5), r2 = r.pick([25, 50, 65, 85, 100, 125]), L = []; for (let x = -12; x <= 12; x++) for (let y = -12; y <= 12; y++) if (x * x + y * y === r2) L.push([x, y]);
      let P1, P2, P3, tries = 0; do { P1 = r.pick(L); P2 = r.pick(L); P3 = r.pick(L); tries++; } while (((P2[0] - P1[0]) * (P3[1] - P1[1]) - (P2[1] - P1[1]) * (P3[0] - P1[0]) === 0) && tries < 200);
      const A = [P1[0] + h, P1[1] + k], B = [P2[0] + h, P2[1] + k], Cc = [P3[0] + h, P3[1] + k];
      if (((B[0] - A[0]) * (Cc[1] - A[1]) - (B[1] - A[1]) * (Cc[0] - A[0])) === 0) return this.make(r, level);
      const D = -2 * h, E = -2 * k, G = h * h + k * k - r2;
      return { q: `Dans un repère orthonormé, ${M(`A${pt(...A)}`)}, ${M(`B${pt(...B)}`)} et ${M(`C${pt(...Cc)}`)} ne sont pas alignés. Déterminer le cercle qui passe par ces trois points (on pourra chercher son équation sous la forme ${M('x^{2}+y^{2}+Dx+Ey+F=0')}), puis son centre et son rayon.`,
        a: `En remplaçant les coordonnées de ${M('A')}, ${M('B')}, ${M('C')} on obtient un système de trois équations en ${M('D')}, ${M('E')}, ${M('F')} dont la solution est ${M(`D=${D}`)}, ${M(`E=${E}`)}, ${M(`F=${G}`)}. Le cercle a pour équation ${M(open(h, k, r2))} : centre ${M(`\\Omega${pt(h, k)}`)}, rayon ${M(`\\sqrt{${r2}}`)}.`,
        ok: () => [A, B, Cc].every(([x, y]) => x * x + y * y + D * x + E * y + G === 0) && D * D + E * E - 4 * G === 4 * r2 && ((B[0] - A[0]) * (Cc[1] - A[1]) - (B[1] - A[1]) * (Cc[0] - A[0]) !== 0) && new Set([A, B, Cc].map((p) => p.join())).size === 3 };
    } },

  // ============================ 08 Variables aléatoires ============================
  { id: 'p-rv-law', cls: C, chapter: 'premiere-08', domain: 'stats-proba', skill: 'Loi de probabilité : compléter, retrouver, construire', fast: false,
    make(r, level) {
      const tab = (xs, ps) => `\\begin{array}{c|${'c'.repeat(xs.length)}}x_i&${xs.join('&')}\\\\\\hline P(X=x_i)&${ps.join('&')}\\end{array}`;
      if (level === 1) {
        const xs = r.shuffle([-5, -3, -2, -1, 0, 1, 2, 3, 4, 6, 8, 10]).slice(0, 4).sort((x, y) => x - y);
        let ps; do { ps = [r.int(1, 5), r.int(1, 5), r.int(1, 5)]; } while (ps[0] + ps[1] + ps[2] >= 20);
        const rest = 20 - ps[0] - ps[1] - ps[2], pr = ps.map((k) => F(k, 20)), last = F(rest, 20), P = [...pr, last], E = sum(xs.map((x, i) => mul(F(x), P[i])));
        return { q: `La loi de probabilité de ${M('X')} est donnée par ${M(tab(xs, [...pr.map(numTex), 'a']))} Déterminer ${M('a')} puis calculer ${M('E(X)')}.`, a: `${M(`${pr.map(numTex).join('+')}+a=1`)} donc ${M(`a=${numTex(last)}`)}. ${M(`E(X)=${xs.map((x, i) => `${par(x)}\\times ${numTex(P[i])}`).join('+')}=${numTex(E)}`)}.`, ok: () => eq(sum(P), F(1)) && P.every((p) => val(p) > 0) && near(xs.reduce((s, x, i) => s + (x * [...ps, rest][i]) / 20, 0), val(E), 1e-9) };
      }
      if (level === 2) {
        const xs = [r.int(-4, 0), r.int(1, 4), r.int(5, 10)], a = r.int(1, 8), b = r.int(1, 9 - a), c = 10 - a - b;
        if (c < 1) return this.make(r, level);
        const P = [F(a, 10), F(b, 10), F(c, 10)], E = sum(xs.map((x, i) => mul(F(x), P[i])));
        return { q: `${M('X')} prend les valeurs ${M(xs[0])}, ${M(xs[1])} et ${M(xs[2])}. On sait que ${M(`P(X=${xs[2]})=${numTex(P[2])}`)} et que ${M(`E(X)=${numTex(E)}`)}. Déterminer ${M(`P(X=${xs[0]})`)} et ${M(`P(X=${xs[1]})`)}.`, a: `Avec ${M('p_1=P(X=' + xs[0] + ')')} et ${M('p_2=P(X=' + xs[1] + ')')} : ${M(`p_1+p_2=${numTex(sub(F(1), P[2]))}`)} et ${M(`${lin([[xs[0], 'p_1'], [xs[1], 'p_2']])}=${numTex(sub(E, mul(F(xs[2]), P[2])))}`)}. On résout : ${M(`p_1=${numTex(P[0])}`)}, ${M(`p_2=${numTex(P[1])}`)}.`, ok: () => { const s1 = sub(F(1), P[2]), s2 = sub(E, mul(F(xs[2]), P[2])); const p2 = div(sub(s2, mul(F(xs[0]), s1)), F(xs[1] - xs[0])); return eq(p2, P[1]) && eq(sub(s1, p2), P[0]) && eq(sum(P), F(1)); } };
      }
      const red = r.int(2, 14), blue = r.int(2, 14), N = red + blue, den = N * (N - 1), P = [F(blue * (blue - 1), den), F(2 * red * blue, den), F(red * (red - 1), den)], E = add(P[1], mul(F(2), P[2])), E2 = add(P[1], mul(F(4), P[2])), V = sub(E2, mul(E, E));
      return { q: `Une urne contient ${M(red)} boules rouges et ${M(blue)} boules bleues. On tire simultanément deux boules ; ${M('X')} est le nombre de boules rouges obtenues. Donner la loi de ${M('X')}, puis ${M('E(X)')} et ${M('V(X)')}.`, a: `${M(tab([0, 1, 2], P.map(fracTex)))} ${M(`E(X)=${fracTex(E)}`)} (on retrouve ${M(`2\\times\\dfrac{${red}}{${N}}`)}). ${M(`V(X)=E(X^{2})-E(X)^{2}=${fracTex(E2)}-\\left(${fracTex(E)}\\right)^{2}=${fracTex(V)}`)}.`, ok: () => { let cnt = [0, 0, 0], tot = 0; const balls = [...Array(red).fill(1), ...Array(blue).fill(0)]; for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) { cnt[balls[i] + balls[j]]++; tot++; } return P.every((p, k) => eq(p, F(cnt[k], tot))) && eq(E, F(2 * red, N)) && val(V) > 0; } };
    } },

  { id: 'p-rv-qcm', cls: C, chapter: 'premiere-08', domain: 'stats-proba', skill: 'QCM sur espérance et variance', fast: true,
    make(r, level) {
      const tab = (xs, ps) => `\\begin{array}{c|ccc}x_i&${xs.join('&')}\\\\\\hline P(X=x_i)&${ps.map(numTex).join('&')}\\end{array}`;
      const xs = r.shuffle([-4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 8]).slice(0, 3).sort((x, y) => x - y);
      const a = r.int(1, 6), b = r.int(1, 9 - a), P = [F(a, 10), F(b, 10), F(10 - a - b, 10)];
      if (10 - a - b < 1) return this.make(r, level);
      const E = sum(xs.map((x, i) => mul(F(x), P[i]))), E2 = sum(xs.map((x, i) => mul(F(x * x), P[i]))), V = sub(E2, mul(E, E)), mean = F(xs[0] + xs[1] + xs[2], 3);
      const T = (f) => M(numTex(f)), law = `${M(tab(xs, P))}`;
      if (level === 1) {
        const cs = [[E, M('E(X)=\\sum x_ip_i')], [mean, 'calcule la moyenne des valeurs sans tenir compte des probabilités.'], [E2, 'calcule ' + M('E(X^{2})') + ' (valeurs mises au carré).'], [sum(xs.map((x, i) => mul(F(Math.abs(x)), P[i]))), 'remplace chaque valeur par sa valeur absolue.']];
        if (new Set(cs.map((c) => numTex(c[0]))).size < 4) return this.make(r, level);
        return mcq(r, `La loi de ${M('X')} est ${law} L’espérance ${M('E(X)')} vaut :`, opt(T(cs[0][0]), cs[0][1] + '.', { v: val(cs[0][0]) }), cs.slice(1).map(([f, w]) => opt(T(f), w, { v: val(f) })), (o) => near(o.v, xs.reduce((s, x, i) => s + (x * [a, b, 10 - a - b][i]) / 10, 0), 1e-9));
      }
      if (level === 2) {
        const cs = [[V, M('V(X)=E(X^{2})-E(X)^{2}')], [E2, 'oublie de retrancher ' + M('E(X)^{2}') + ' : donne ' + M('E(X^{2})') + '.'], [sub(E2, E), 'retranche ' + M('E(X)') + ' au lieu de ' + M('E(X)^{2}') + '.'], [sub(mul(E, E), E2), 'inverse la soustraction.']];
        if (new Set(cs.map((c) => numTex(c[0]))).size < 4) return this.make(r, level);
        return mcq(r, `La loi de ${M('X')} est ${law} La variance ${M('V(X)')} vaut :`, opt(T(cs[0][0]), cs[0][1] + '.', { v: val(cs[0][0]) }), cs.slice(1).map(([f, w]) => opt(T(f), w, { v: val(f) })), (o) => { const e = xs.reduce((s, x, i) => s + (x * [a, b, 10 - a - b][i]) / 10, 0), v = xs.reduce((s, x, i) => s + ((x - e) ** 2 * [a, b, 10 - a - b][i]) / 10, 0); return near(o.v, v, 1e-9); });
      }
      const A = r.nz(-5, 5), B = r.nz(-9, 9), e0 = r.int(-6, 6), v0 = r.int(2, 12);
      const cs = [[A * A * v0, M("V(aX+b)=a^{2}V(X)")], [A * v0 + B, 'applique à la variance la règle de l’espérance ' + M('aV+b') + '.'], [A * v0, 'oublie le carré de ' + M('a') + '.'], [A * A * v0 + B, 'ajoute ' + M('b') + ' : une constante ne change pas la dispersion.']];
      if (new Set(cs.map((c) => c[0])).size < 4) return this.make(r, level);
      return mcq(r, `${M('X')} a pour variance ${M(`V(X)=${v0}`)} et pour espérance ${M(`E(X)=${e0}`)}. La variance de ${M(`Y=${polyTex([A, B], 'X')}`)} est :`, opt(M(`${cs[0][0]}`), cs[0][1] + '.', { v: cs[0][0] }), cs.slice(1).map(([v, w]) => opt(M(`${v}`), w, { v })), (o) => o.v === A * A * v0 && [0, 1, 2].every(() => true));
    } },

  { id: 'p-rv-tf', cls: C, chapter: 'premiere-08', domain: 'stats-proba', skill: 'Vrai ou faux sur les variables aléatoires', fast: true,
    make(r, level) {
      const tab = (xs, ps) => `\\begin{array}{c|${'c'.repeat(xs.length)}}x_i&${xs.join('&')}\\\\\\hline P(X=x_i)&${ps.join('&')}\\end{array}`;
      const a = r.int(2, 29), b = r.nz(-19, 19), v0 = r.int(2, 45), x1 = r.int(-9, -1), x2 = r.int(1, 9);
      const fam = {
        1: [
          () => { const ok = r.next() < 0.5, p1 = r.int(1, 4), p2 = r.int(1, 4), p3 = ok ? 10 - p1 - p2 : 10 - p1 - p2 + r.pick([1, -1]); return { s: `Le tableau ${M(tab([x1, 0, x2], [numTex(F(p1, 10)), numTex(F(p2, 10)), numTex(F(p3, 10))]))} définit une loi de probabilité.`, v: ok && p3 > 0, j: `La somme des probabilités vaut ${M(`${numTex(F(p1, 10))}+${numTex(F(p2, 10))}+${numTex(F(p3, 10))}=${numTex(F(p1 + p2 + p3, 10))}`)}, ${p1 + p2 + p3 === 10 ? 'égale à 1.' : 'différente de 1.'}`, c: () => ((p1 + p2 + p3 === 10) && p3 > 0) === (ok && p3 > 0) }; },
          () => ({ s: `L’espérance d’une variable aléatoire est toujours l’une de ses valeurs possibles. (On teste ${M('X')} valant ${M(0)} ou ${M(1)} avec la probabilité ${M('\\dfrac{1}{2}')} chacune.)`, v: false, j: `${M('E(X)=0\\times\\dfrac{1}{2}+1\\times\\dfrac{1}{2}=\\dfrac{1}{2}')} n’est ni ${M(0)} ni ${M(1)}.`, c: () => 0.5 !== 0 && 0.5 !== 1 }),
          () => ({ s: `Si ${M(`E(X)=${a}`)}, alors ${M(`E(X${sgn(b)})=${a + b}`)}.`, v: true, j: `${M('E(X+b)=E(X)+b')} : ${M(`${a}${sgn(b)}=${a + b}`)}.`, c: () => a + b === a + b }),
        ],
        2: [
          () => ({ s: `Pour toute variable aléatoire ${M('X')}, ${M('V(2X)=2V(X)')}. (On teste avec ${M(`V(X)=${v0}`)}.)`, v: false, j: `${M(`V(2X)=2^{2}V(X)=4\\times ${v0}=${4 * v0}`)} et non ${M(2 * v0)}.`, c: () => 4 * v0 !== 2 * v0 }),
          () => ({ s: `Si ${M(`E(X)=${a}`)} et ${M(`E(Y)=${v0}`)}, alors ${M(`E(X+Y)=${a + v0}`)}, même si ${M('X')} et ${M('Y')} ne sont pas indépendantes.`, v: true, j: `L’espérance est linéaire : ${M('E(X+Y)=E(X)+E(Y)')}.`, c: () => a + v0 === a + v0 }),
          () => ({ s: `Une variable aléatoire peut avoir une variance négative.`, v: false, j: `${M('V(X)=\\sum p_i(x_i-E(X))^{2}')} est une somme de termes positifs ou nuls.`, c: () => [1, 2, 3].every((x) => (x - 2) ** 2 >= 0) }),
        ],
        3: [
          () => ({ s: `Si ${M(`V(X)=${v0}`)}, alors ${M(`\\sigma(-3X)=-3\\sigma(X)`)}.`, v: false, j: `${M('\\sigma(aX)=|a|\\sigma(X)')} : l’écart type est positif. Ici ${M(`\\sigma(-3X)=3\\sqrt{${v0}}`)}.`, c: () => 3 * Math.sqrt(v0) > 0 }),
          () => { const nn = r.int(2, 6); return { s: `Une variable ${M('X')} qui vaut ${M(`-${a}`)} ou ${M(a)} avec la probabilité ${M('\\dfrac{1}{2}')} chacune a pour espérance ${M(0)} et pour variance ${M(a * a)}.`, v: true, j: `${M(`E(X)=\\dfrac{-${a}+${a}}{2}=0`)} et ${M(`V(X)=\\dfrac{(-${a})^{2}+${a}^{2}}{2}=${a * a}`)}.`, c: () => (-a + a) / 2 === 0 && (a * a + a * a) / 2 === a * a && nn > 0 }; },
          () => ({ s: `Si ${M('E(X)=0')} alors ${M('X=0')} avec probabilité 1. (On teste ${M(`X`)} valant ${M(-a)} ou ${M(a)} avec la probabilité ${M('\\dfrac{1}{2}')}.)`, v: false, j: `${M(`E(X)=\\dfrac{-${a}+${a}}{2}=0`)} alors que ${M('X')} ne prend jamais la valeur ${M(0)}.`, c: () => a !== 0 }),
        ],
      };
      return tf(r.pick(fam[level])());
    } },

  { id: 'p-rv-error', cls: C, chapter: 'premiere-08', domain: 'stats-proba', skill: 'Trouver l’erreur dans un calcul d’espérance ou de variance', fast: false,
    make(r, level) {
      const tab = (xs, ps) => `\\begin{array}{c|ccc}x_i&${xs.join('&')}\\\\\\hline P(X=x_i)&${ps.map(numTex).join('&')}\\end{array}`;
      if (level <= 2) {
        let xs, a, b, c, kind;
        do { xs = r.shuffle([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]).slice(0, 3).sort((x, y) => x - y); a = r.int(1, 7); b = r.int(1, 9 - a); c = 10 - a - b; kind = r.pick(level === 1 ? ['noP', 'sign', 'mean'] : ['sq', 'nosq', 'm']); } while (c < 1 || xs.every((x) => x > 0));
        const ps = [F(a, 10), F(b, 10), F(c, 10)], E = sum(xs.map((x, i) => mul(F(x), ps[i]))), E2 = sum(xs.map((x, i) => mul(F(x * x), ps[i]))), V = sub(E2, mul(E, E)), law = M(tab(xs, ps));
        const terms = (f) => xs.map((x, i) => f(x, i)).join('+').replace(/\+-/g, '-');
        if (level === 1) {
          const good = [terms((x, i) => `${par(x)}\\times ${numTex(ps[i])}`), `${terms((x, i) => numTex(mul(F(x), ps[i])))}`, `E(X)=${numTex(E)}`];
          let lines, bad, why, fix, shown = E;
          if (kind === 'noP') { const j = xs.findIndex((x) => x < 0) >= 0 ? 0 : 1, w = sum(xs.map((x, i) => (i === j ? F(x) : mul(F(x), ps[i])))); lines = [`E(X)=${terms((x, i) => (i === j ? `${par(x)}` : `${par(x)}\\times ${numTex(ps[i])}`))}`, `E(X)=${terms((x, i) => (i === j ? `${x}` : numTex(mul(F(x), ps[i]))))}`, `E(X)=${numTex(w)}`]; bad = 0; why = `chaque valeur doit être multipliée par sa probabilité, y compris ${M(xs[j])}.`; fix = M(`E(X)=${good[0]}`); shown = w; }
          else if (kind === 'sign') { const j = xs.findIndex((x) => x < 0), w = sum(xs.map((x, i) => (i === j ? mul(F(-x), ps[i]) : mul(F(x), ps[i])))); lines = [`E(X)=${good[0]}`, `E(X)=${terms((x, i) => (i === j ? numTex(mul(F(-x), ps[i])) : numTex(mul(F(x), ps[i]))))}`, `E(X)=${numTex(w)}`]; bad = 1; why = `${M(`${par(xs[j])}\\times ${numTex(ps[j])}=${numTex(mul(F(xs[j]), ps[j]))}`)} est négatif.`; fix = M(`E(X)=${good[1]}`); shown = w; }
          else { const w = div(sum(xs.map((x) => F(x))), F(3)); lines = [`E(X)=\\dfrac{${xs.map(par).join('+')}}{3}`, `E(X)=\\dfrac{${xs.reduce((s, x) => s + x, 0)}}{3}`, `E(X)=${numTex(w)}`]; bad = 0; why = `l’espérance est la moyenne pondérée par les probabilités ${M('\\sum x_ip_i')}, pas la moyenne des valeurs.`; fix = M(`E(X)=${good[0]}`); shown = w; }
          if (eq(shown, E)) return this.make(r, level);
          return spot(`La loi de ${M('X')} est ${law} Pour calculer ${M('E(X)')}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(good[2]), () => near(val(E), xs.reduce((s, x, i) => s + (x * [a, b, c][i]) / 10, 0), 1e-9) && !eq(shown, E));
        }
        const good = [`E(X)=${numTex(E)}`, `E(X^{2})=${terms((x, i) => `${x * x}\\times ${numTex(ps[i])}`)}=${numTex(E2)}`, `V(X)=${numTex(E2)}-(${numTex(E)})^{2}=${numTex(V)}`];
        let lines, bad, why, fix, shown = V;
        if (kind === 'sq') { const w = mul(E, E); lines = [good[0], `E(X^{2})=(${numTex(E)})^{2}=${numTex(w)}`, `V(X)=${numTex(w)}-(${numTex(E)})^{2}=0`]; bad = 1; why = `${M('E(X^{2})')} se calcule avec les valeurs au carré : ${M('\\sum x_i^{2}p_i')}.`; fix = M(good[1]); shown = F(0); }
        else if (kind === 'nosq') { const w = sub(E2, E); lines = [good[0], good[1], `V(X)=${numTex(E2)}-${numTex(E).startsWith('-') ? '(' + numTex(E) + ')' : numTex(E)}=${numTex(w)}`]; bad = 2; why = `la formule est ${M('V(X)=E(X^{2})-E(X)^{2}')} : on retranche le carré de l’espérance.`; fix = M(good[2]); shown = w; }
        else { const w = sum(xs.map((x, i) => mul(F(x * x), ps[i]))); lines = [good[0], good[1], `V(X)=E(X^{2})=${numTex(w)}`]; bad = 2; why = `il faut encore retrancher ${M(`E(X)^{2}=${numTex(mul(E, E))}`)}.`; fix = M(good[2]); shown = w; }
        if (eq(shown, V)) return this.make(r, level);
        return spot(`La loi de ${M('X')} est ${law} Pour calculer ${M('V(X)')}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(good[2]), () => { const e = xs.reduce((s, x, i) => s + (x * [a, b, c][i]) / 10, 0), v = xs.reduce((s, x, i) => s + ((x - e) ** 2 * [a, b, c][i]) / 10, 0); return near(val(V), v, 1e-9) && !eq(shown, V) && (kind !== 'sq' || val(mul(E, E)) !== val(E2)); });
      }
      let A, B, v0, kind; do { A = r.pick([-5, -4, -3, -2, 2, 3, 4, 5]); B = r.nz(-9, 9); v0 = r.pick([4, 9, 16, 25, 36, 2, 3, 5]); kind = r.pick(['lin', 'cst', 'abs']); } while (kind === 'abs' && A > 0);
      const good = [`V(Y)=${A}^{2}V(X)=${A * A}\\times ${v0}=${A * A * v0}`, `\\sigma(Y)=\\sqrt{${A * A * v0}}=${sqrtTex(A * A * v0)}`];
      let lines, bad, why, fix, same = false;
      if (kind === 'lin') { lines = [`V(Y)=${par(A)}V(X)=${par(A)}\\times ${v0}=${A * v0}`, `\\sigma(Y)=\\sqrt{${Math.abs(A * v0)}}`]; bad = 0; why = `${M('V(aX+b)=a^{2}V(X)')} : le coefficient est élevé au carré.`; fix = M(good[0]); }
      else if (kind === 'cst') { lines = [`V(Y)=${A * A}\\times ${v0}${sgn(B)}=${A * A * v0 + B}`, `\\sigma(Y)=\\sqrt{${A * A * v0 + B}}`]; bad = 0; why = `ajouter la constante ${M(B)} ne change pas la dispersion : ${M('V(aX+b)=a^{2}V(X)')}.`; fix = M(good[0]); if (A * A * v0 + B <= 0) return this.make(r, level); }
      else { lines = [good[0], `\\sigma(Y)=${A}\\sqrt{${v0}}`]; bad = 1; why = `un écart type est positif : ${M(`\\sigma(aX+b)=|a|\\sigma(X)=${-A}\\sqrt{${v0}}`)}.`; fix = M(`\\sigma(Y)=${-A}\\sqrt{${v0}}=${sqrtTex(A * A * v0)}`); }
      return spot(`${M('X')} a pour variance ${M(`V(X)=${v0}`)} ; on pose ${M(`Y=${polyTex([A, B], 'X')}`)}. Pour calculer ${M('V(Y)')} et ${M('\\sigma(Y)')}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(`V(Y)=${A * A * v0}\\ ;\\ ${good[1]}`), () => { const sd = Math.sqrt(v0), y = [A * -sd + B, A * sd + B], V = ((y[0] - B) ** 2 + (y[1] - B) ** 2) / 2; return near(V, A * A * v0) && (kind === 'lin' ? A * v0 !== A * A * v0 : kind === 'cst' ? B !== 0 : A < 0); });
    } },

  { id: 'p-rv-affine', cls: C, chapter: 'premiere-08', domain: 'stats-proba', skill: 'Transformation affine d’une variable aléatoire', fast: false,
    make(r, level) {
      const tab = (xs, ps) => `\\begin{array}{c|ccc}x_i&${xs.join('&')}\\\\\\hline P(X=x_i)&${ps.map(numTex).join('&')}\\end{array}`;
      if (level === 1) {
        const A = r.nz(-6, 6), B = r.nz(-9, 9), e = r.int(-8, 8), v = r.int(1, 12);
        return { q: `${M('X')} est une variable aléatoire d’espérance ${M(e)} et de variance ${M(v)}. On pose ${M(`Y=${polyTex([A, B], 'X')}`)}. Calculer ${M('E(Y)')}, ${M('V(Y)')} et ${M('\\sigma(Y)')}.`, a: `${M(`E(Y)=${A}E(X)${sgn(B)}=${A * e + B}`)} ; ${M(`V(Y)=${A}^{2}V(X)=${A * A * v}`)} ; ${M(`\\sigma(Y)=\\sqrt{${A * A * v}}=${sqrtTex(A * A * v)}`)}.`.replace(`${A}E(X)`, `${par(A)}\\times ${e}`), ok: () => near(Math.abs(A) * Math.sqrt(v), Math.sqrt(A * A * v)) && A * A * v > 0 };
      }
      let xs, a, b, c; do { xs = r.shuffle([-4, -3, -2, -1, 0, 1, 2, 3, 4, 5]).slice(0, 3).sort((x, y) => x - y); a = r.int(1, 7); b = r.int(1, 9 - a); c = 10 - a - b; } while (c < 1);
      const A = r.pick([2, 3, -1, -2, 5, 10, -3]), B = r.int(-5, 8), ps = [F(a, 10), F(b, 10), F(c, 10)], ys = xs.map((x) => A * x + B), E = sum(xs.map((x, i) => mul(F(x), ps[i]))), EY = sum(ys.map((y, i) => mul(F(y), ps[i]))), E2 = sum(xs.map((x, i) => mul(F(x * x), ps[i]))), V = sub(E2, mul(E, E)), VY = sum(ys.map((y, i) => mul(F(y * y), ps[i]))), VYv = sub(VY, mul(EY, EY));
      if (new Set(ys).size < 3) return this.make(r, level);
      if (level === 2) return { q: `La loi de ${M('X')} est ${M(tab(xs, ps))} On pose ${M(`Y=${polyTex([A, B], 'X')}`)}. Donner la loi de ${M('Y')}, calculer ${M('E(Y)')} directement puis avec ${M('E(X)')}.`, a: `${M(`Y`)} prend les valeurs ${ys.map((y) => M(y)).join(', ')} avec les mêmes probabilités. ${M(`E(Y)=${ys.map((y, i) => `${par(y)}\\times ${numTex(ps[i])}`).join('+')}=${numTex(EY)}`)}. Avec ${M(`E(X)=${numTex(E)}`)} : ${M(`E(Y)=${A}E(X)${sgn(B)}=${numTex(add(mul(F(A), E), F(B)))}`)}.`, ok: () => eq(EY, add(mul(F(A), E), F(B))) };
      return { q: `La loi de ${M('X')} est ${M(tab(xs, ps))} 1) Calculer ${M('E(X)')} et ${M('V(X)')}. 2) On pose ${M(`Y=${polyTex([A, B], 'X')}`)} : en déduire ${M('E(Y)')} et ${M('V(Y)')} sans refaire de tableau. 3) Vérifier ${M('V(Y)')} avec la loi de ${M('Y')}.`, a: `1) ${M(`E(X)=${numTex(E)}`)}, ${M(`V(X)=${numTex(E2)}-(${numTex(E)})^{2}=${numTex(V)}`)}. 2) ${M(`E(Y)=${numTex(EY)}`)}, ${M(`V(Y)=${A * A}\\times ${numTex(V)}=${numTex(mul(F(A * A), V))}`)}. 3) ${M(`E(Y^{2})-E(Y)^{2}=${numTex(VY)}-(${numTex(EY)})^{2}=${numTex(VYv)}`)}.`, ok: () => eq(VYv, mul(F(A * A), V)) && eq(EY, add(mul(F(A), E), F(B))) };
    } },

  { id: 'p-rv-game', cls: C, chapter: 'premiere-08', domain: 'stats-proba', skill: 'Jeu de hasard et mise équitable', fast: false,
    make(r, level) {
      if (level === 1) {
        const n = r.pick([6, 8, 10, 12]), g = r.int(2, 5) * 5, m = r.int(1, 6), win = r.int(1, n / 2), gain = g - m, loss = -m;
        const E = add(mul(F(win, n), F(gain)), mul(F(n - win, n), F(loss)));
        return { q: `Un jeu coûte ${M(`${m}\\ \\text{€}`)} par partie. On fait tourner une roue partagée en ${M(n)} secteurs identiques dont ${M(win)} font gagner ${M(`${g}\\ \\text{€}`)} (mise comprise). Soit ${M('G')} le gain algébrique du joueur. Donner la loi de ${M('G')}, son espérance, et dire si le jeu est favorable au joueur.`, a: `${M('G')} vaut ${M(gain)} avec la probabilité ${M(fracTex(F(win, n)))} et ${M(loss)} avec la probabilité ${M(fracTex(F(n - win, n)))}. ${M(`E(G)=${gain}\\times ${fracTex(F(win, n))}+${par(loss)}\\times ${fracTex(F(n - win, n))}=${fracTex(E)}`)} : le jeu est ${E.n > 0 ? 'favorable au joueur' : E.n === 0 ? 'équitable' : 'défavorable au joueur'}.`, ok: () => near((win * gain + (n - win) * loss) / n, val(E), 1e-9) };
      }
      if (level === 2) {
        const n = r.pick([4, 5, 8, 10, 20]), k1 = r.int(1, 2), p1 = F(k1, n);
        let gains, m, tot; do { gains = [r.int(2, 8) * 5, r.int(1, 4) * 5]; m = r.int(2, 9); } while (false);
        const P = [F(1, n), F(2, n), F(n - 3, n)];
        const E = sub(add(mul(P[0], F(gains[0])), mul(P[1], F(gains[1]))), F(0)), fair = E;
        return { q: `Pour participer à un jeu, on paie une mise de ${M('m')} euros. Une urne contient ${M(n)} jetons : ${M(1)} fait gagner ${M(`${gains[0]}\\ \\text{€}`)}, ${M(2)} font gagner ${M(`${gains[1]}\\ \\text{€}`)} et les autres ne rapportent rien. Déterminer la mise ${M('m')} pour que le jeu soit équitable.`, a: `Le gain algébrique ${M('G')} vaut ${M(`${gains[0]}-m`)}, ${M(`${gains[1]}-m`)} ou ${M('-m')} avec les probabilités ${M(fracTex(P[0]))}, ${M(fracTex(P[1]))}, ${M(fracTex(P[2]))}. ${M(`E(G)=${fracTex(E)}-m`)} : le jeu est équitable si ${M(`E(G)=0`)}, soit ${M(`m=${fracTex(fair)}`)} euros.`, ok: () => eq(add(add(mul(P[0], F(gains[0] - 0)), mul(P[1], F(gains[1]))), F(0)), fair) && eq(sum(P), F(1)) };
      }
      let a, b, cc;
      do { cc = r.int(1, 14); a = r.int(1, 20) * 2; b = 14 * cc - 3 * a; } while (b <= 0);
      const E = (c) => F(6 * a + 2 * b - 28 * c, 36);
      return { q: `On lance deux dés équilibrés à six faces et on note la somme ${M('S')}. Si ${M('S=7')}, on gagne ${M(`${a}\\ \\text{€}`)} ; si ${M('S=2')} ou ${M('S=12')}, on gagne ${M(`${b}\\ \\text{€}`)} ; sinon on perd ${M('c')} euros. 1) Donner la loi de probabilité du gain ${M('G')} en fonction de ${M('c')}. 2) Calculer ${M('E(G)')}. 3) Pour quelle valeur de ${M('c')} le jeu est-il équitable ?`,
        a: `1) ${M('P(S=7)=\\dfrac{6}{36}=\\dfrac{1}{6}')}, ${M('P(S=2\\text{ ou }S=12)=\\dfrac{2}{36}=\\dfrac{1}{18}')}, ${M('P(\\text{autre})=\\dfrac{28}{36}=\\dfrac{7}{9}')}. 2) ${M(`E(G)=\\dfrac{6\\times ${a}+2\\times ${b}-28c}{36}=\\dfrac{${6 * a + 2 * b}-28c}{36}`)}. 3) ${M(`E(G)=0\\iff c=\\dfrac{${6 * a + 2 * b}}{28}=${cc}`)}.`,
        ok: () => { let s7 = 0, s2 = 0, oth = 0; for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) { const s = i + j; if (s === 7) s7++; else if (s === 2 || s === 12) s2++; else oth++; } return s7 === 6 && s2 === 2 && oth === 28 && eq(E(cc), F(0)) && (6 * a + 2 * b) === 28 * cc && b > 0; } };
    } },

  { id: 'p-rv-binom', cls: C, chapter: 'premiere-08', domain: 'stats-proba', skill: 'Loi binomiale', fast: false,
    make(r, level) {
      const pf = r.pick([F(1, 2), F(1, 3), F(1, 4), F(2, 3), F(1, 5), F(3, 4), F(1, 6), F(5, 6), F(1, 10), F(3, 10), F(2, 5), F(3, 5), F(7, 10), F(1, 8), F(1, 7), F(2, 7), F(5, 7), F(1, 9), F(2, 9), F(4, 9), F(3, 8)]), q = sub(F(1), pf), pwt = (t, k) => (k === 1 ? `${t}` : `${t}^{${k}}`), pw = (f, k) => { let o = F(1); for (let i = 0; i < k; i++) o = mul(o, f); return o; };
      if (level === 1) {
        const n = r.int(3, 8), k = r.int(1, n - 1), P = mul(F(binom(n, k)), mul(pw(pf, k), pw(q, n - k)));
        return { q: `${M('X')} suit la loi binomiale ${M(`\\mathcal{B}\\left(${n}\\,;\\,${fracTex(pf)}\\right)`)}. Calculer ${M(`P(X=${k})`)}.`, a: `${M(`P(X=${k})=\\dbinom{${n}}{${k}}${pwt(`\\left(${fracTex(pf)}\\right)`, k)}${pwt(`\\left(${fracTex(q)}\\right)`, n - k)}=${binom(n, k)}\\times ${fracTex(pw(pf, k))}\\times ${fracTex(pw(q, n - k))}=${fracTex(P)}`)}.`, ok: () => { let s = F(0); for (let j = 0; j <= n; j++) s = add(s, mul(F(binom(n, j)), mul(pw(pf, j), pw(q, n - j)))); return eq(s, F(1)) && eq(P, mul(F(binom(n, k)), mul(pw(pf, k), pw(q, n - k)))) && P.n > 0; } };
      }
      if (level === 2) {
        const n = r.int(3, pf.d <= 4 ? 10 : 7), none = pw(q, n), atL = sub(F(1), none), E = mul(F(n), pf), V = mul(F(n), mul(pf, q));
        return { q: `Une épreuve de Bernoulli de probabilité de succès ${M(fracTex(pf))} est répétée ${M(n)} fois de façon indépendante ; ${M('X')} est le nombre de succès. Donner la loi de ${M('X')}, calculer ${M('P(X\\geqslant 1)')}, ${M('E(X)')} et ${M('V(X)')}.`, a: `${M('X')} suit ${M(`\\mathcal{B}\\left(${n}\\,;\\,${fracTex(pf)}\\right)`)}. ${M(`P(X\\geqslant 1)=1-P(X=0)=1-${pwt(`\\left(${fracTex(q)}\\right)`, n)}=${fracTex(atL)}`)}. ${M(`E(X)=np=${fracTex(E)}`)} ; ${M(`V(X)=np(1-p)=${fracTex(V)}`)}.`, ok: () => { let e = F(0), e2 = F(0), tot = F(0); for (let j = 0; j <= n; j++) { const p = mul(F(binom(n, j)), mul(pw(pf, j), pw(q, n - j))); tot = add(tot, p); e = add(e, mul(F(j), p)); e2 = add(e2, mul(F(j * j), p)); } return eq(tot, F(1)) && eq(e, E) && eq(sub(e2, mul(e, e)), V) && eq(sub(F(1), mul(F(1), none)), atL); } };
      }
      const pt3 = r.pick([F(1, 10), F(1, 5), F(1, 4), F(1, 3), F(3, 10), F(1, 2), F(1, 8), F(1, 6), F(2, 5), F(1, 12), F(3, 20), F(1, 20)]), seuil = r.pick([F(8, 10), F(9, 10), F(95, 100), F(99, 100), F(999, 1000)]), qq = sub(F(1), pt3), thr = sub(F(1), seuil);
      const first = () => { let n = 1, cur = qq; for (; n < 300; n++) { if (cur.n * thr.d < thr.n * cur.d) return n; cur = mul(cur, qq); } return -1; };
      const who = r.pick(['Un joueur réussit un tir', 'Un capteur détecte une anomalie', 'Un élève répond juste à une question tirée au hasard', 'Une machine produit une pièce défectueuse']), N = first(); if (N < 3 || N > 60) return this.make(r, level);
      const val1 = (n) => 1 - Math.pow(val(qq), n);
      return { q: `${who} avec la probabilité ${M(fracTex(pt3))}, de façon indépendante à chaque essai. Combien d’essais faut-il au minimum effectuer pour que la probabilité d’obtenir au moins un succès dépasse ${M(numTex(seuil))} ?`, a: `Avec ${M('n')} essais, ${M(`P(X\\geqslant 1)=1-\\left(${fracTex(qq)}\\right)^{n}`)}. On veut ${M(`1-\\left(${fracTex(qq)}\\right)^{n}>${numTex(seuil)}`)}, soit ${M(`\\left(${fracTex(qq)}\\right)^{n}<${numTex(thr)}`)}. À la calculatrice : ${M(`1-\\left(${fracTex(qq)}\\right)^{${N - 1}}\\approx ${roundTex(val1(N - 1), 4)}`)} et ${M(`1-\\left(${fracTex(qq)}\\right)^{${N}}\\approx ${roundTex(val1(N), 4)}`)} : il faut ${M(N)} essais.`, ok: () => { const big = (n) => BigInt(qq.n) ** BigInt(n) * BigInt(thr.d) < BigInt(thr.n) * BigInt(qq.d) ** BigInt(n); let n = 1; while (!big(n) && n < 400) n++; return n === N && !big(N - 1) && Math.abs(val1(N) - val(seuil)) > 1e-7; } };
    } },
];
