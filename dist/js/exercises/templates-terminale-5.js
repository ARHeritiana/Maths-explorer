// Terminale generators, fifth file: chapters 12 (variables aléatoires, concentration), 13 (représentations paramétriques, équations cartésiennes),
// 14 (fonctions trigonométriques). Same contract and formats as templates-terminale-2.js.
import { F, add, sub, mul, div, val, eq, M, R, fracTex, numTex, roundTex, polyTex, evalPoly, sgn, par, gcd, sqrtTex, binom, sum, mulPoly } from './engine.js';
import { near, nd, coef, opt, mcq, tf, spot } from './premiere-kit.js';
import { lin, affTex, parT } from './seconde-kit.js';
import { piTex } from './templates-premiere.js';

const C = 'terminale';
const cf = (f) => (f.n === 1 && f.d === 1 ? '' : f.n === -1 && f.d === 1 ? '-' : fracTex(f));
const D4 = (x) => numTex(F(Math.round(x * 10000), 10000));

export const terminale5 = [
  // ============================ 12 Variables aléatoires, concentration, loi des grands nombres ============================
  { id: 't-rvc-qcm', cls: C, chapter: 'terminale-12', domain: 'stats-proba', skill: 'QCM sur sommes de variables aléatoires et concentration', fast: true,
    make(r, level) {
      if (level === 1) {
        const e1 = r.int(-6, 9), e2 = r.int(-6, 9), v1 = r.int(1, 12), v2 = r.int(1, 12), kind = r.pick(['E', 'V']);
        const cs = kind === 'E' ? [[e1 + e2, 'l’espérance est linéaire : ' + M('E(X+Y)=E(X)+E(Y)') + '.'], [e1 * e2, 'multiplie les espérances.'], [e1 + e2 + v1, 'ajoute une variance.'], [e1 - e2, 'soustrait.']] : [[v1 + v2, 'pour des variables indépendantes ' + M('V(X+Y)=V(X)+V(Y)') + '.'], [v1 * v2, 'multiplie les variances.'], [Math.sqrt(v1) + Math.sqrt(v2) === Math.round(Math.sqrt(v1) + Math.sqrt(v2)) ? v1 + v2 + 1 : v1 * v1 + v2 * v2, 'additionne des écarts types ou des carrés.'], [v1 - v2 === 0 ? v1 + v2 + 2 : Math.abs(v1 - v2), 'soustrait les variances.']];
        if (new Set(cs.map((c) => c[0])).size < 4) return this.make(r, level);
        return mcq(r, kind === 'E' ? `${M('X')} et ${M('Y')} ont pour espérances ${M(e1)} et ${M(e2)}. Alors ${M('E(X+Y)')} vaut :` : `${M('X')} et ${M('Y')} sont indépendantes, de variances ${M(v1)} et ${M(v2)}. Alors ${M('V(X+Y)')} vaut :`, opt(M(`${cs[0][0]}`), cs[0][1], { w: cs[0][0] }), cs.slice(1).map((c) => opt(M(`${c[0]}`), c[1], { w: c[0] })), (o) => o.w === (kind === 'E' ? e1 + e2 : v1 + v2));
      }
      if (level === 2) {
        const n = r.int(4, 50), mu = r.int(-5, 20), v = r.int(1, 40), kind = r.pick(['E', 'V', 'S']);
        const cs = kind === 'V' ? [[F(v, n), 'pour ' + M('M_n=\\dfrac{S_n}{n}') + ', ' + M('V(M_n)=\\dfrac{V(S_n)}{n^{2}}=\\dfrac{V(X)}{n}') + '.'], [F(v), 'oublie la division par ' + M('n') + '.'], [F(v * n), 'confond avec ' + M('V(S_n)=nV(X)') + '.'], [F(v, n * n), 'divise par ' + M('n^{2}') + ' deux fois.']] : kind === 'S' ? [[F(n * v), 'pour des variables indépendantes ' + M('V(S_n)=nV(X)') + '.'], [F(v), 'oublie le facteur ' + M('n') + '.'], [F(n * n * v), 'applique ' + M('V(aX)=a^{2}V(X)') + ' à une somme de variables indépendantes.'], [F(v, n), 'confond avec la variance de la moyenne.']] : [[F(mu), M('E(M_n)=E(X)') + '.'], [F(mu * n), 'donne ' + M('E(S_n)') + '.'], [F(mu, n), 'divise une seconde fois par ' + M('n') + '.'], [F(mu + v), 'ajoute la variance.']];
        const w0 = kind === 'V' ? v / n : kind === 'S' ? n * v : mu;
        if (new Set(cs.map((c) => fracTex(c[0]))).size < 4) return this.make(r, level);
        const nm = kind === 'V' ? 'V(M_n)' : kind === 'S' ? 'V(S_n)' : 'E(M_n)';
        return mcq(r, `${M(`X_1,\\dots,X_{${n}}`)} sont indépendantes de même loi, d’espérance ${M(mu)} et de variance ${M(v)} ; ${M(`S_{${n}}=X_1+\\dots+X_{${n}}`)} et ${M(`M_{${n}}=\\dfrac{S_{${n}}}{${n}}`)}. Alors ${M(nm.replace('_n', `_{${n}}`))} vaut :`, opt(M(fracTex(cs[0][0])), cs[0][1], { w: val(cs[0][0]) }), cs.slice(1).map((c) => opt(M(fracTex(c[0])), c[1], { w: val(c[0]) })), (o) => Math.abs(o.w - w0) < 1e-12);
      }
      const V0 = r.int(2, 30), dl = r.pick([1, 2, 3, 4, 5]), cs = [[F(V0, dl * dl), M('P(|X-E(X)|\\geqslant\\delta)\\leqslant\\dfrac{V(X)}{\\delta^{2}}') + '.'], [F(V0, dl), 'divise par ' + M('\\delta') + ' au lieu de ' + M('\\delta^{2}') + '.'], [F(dl * dl, V0), 'inverse le quotient.'], [F(V0 * dl * dl), 'multiplie par ' + M('\\delta^{2}') + '.']];
      if (new Set(cs.map((c) => fracTex(c[0]))).size < 4) return this.make(r, level);
      return mcq(r, `${M('X')} a pour variance ${M(V0)}. L’inégalité de Bienaymé-Tchebychev donne comme majorant de ${M(`P\\left(|X-E(X)|\\geqslant ${dl}\\right)`)} :`, opt(M(fracTex(cs[0][0])), cs[0][1], { w: val(cs[0][0]) }), cs.slice(1).map((c) => opt(M(fracTex(c[0])), c[1], { w: val(c[0]) })), (o) => Math.abs(o.w - V0 / (dl * dl)) < 1e-12);
    } },

  { id: 't-rvc-tf', cls: C, chapter: 'terminale-12', domain: 'stats-proba', skill: 'Vrai ou faux sur concentration et loi des grands nombres', fast: true,
    make(r, level) {
      const n = r.int(4, 400), v = r.int(1, 90), mu = r.int(-30, 90), dl = r.int(1, 12);
      const fam = {
        1: [
          () => ({ s: `Si ${M('X')} et ${M('Y')} sont indépendantes, ${M('V(X+Y)=V(X)+V(Y)')}.`, v: true, j: 'C’est la propriété de la variance pour des variables indépendantes.', c: () => true }),
          () => ({ s: `${M(`V(${dl}X)=${dl}\\,V(X)`)} pour toute variable aléatoire ${M('X')}.`, v: dl === 1, j: `${M(`V(aX)=a^{2}V(X)`)} : ici ${M(`V(${dl}X)=${dl * dl}V(X)`)}.`, c: () => (dl * dl === dl) === (dl === 1) }),
          () => ({ s: `Si ${M('X')} a pour espérance ${M(mu)}, ${M('Y=X+3')} a pour espérance ${M(mu + 3)}.`, v: true, j: `${M('E(X+b)=E(X)+b')}.`, c: () => mu + 3 === mu + 3 }),
        ].filter((x) => x),
        2: [
          () => ({ s: `Si ${M(`X_1,\\dots,X_{${n}}`)} sont indépendantes de variance ${M(v)}, alors ${M(`V\\left(\\dfrac{X_1+\\dots+X_{${n}}}{${n}}\\right)=\\dfrac{${v}}{${n}}`)}.`, v: true, j: `${M(`V(S_n)=${n}\\times ${v}`)} puis ${M(`V\\left(\\dfrac{S_n}{n}\\right)=\\dfrac{n v}{n^{2}}=\\dfrac{${v}}{${n}}`)}.`, c: () => near((n * v) / (n * n), v / n, 1e-12) }),
          () => ({ s: `Lorsque ${M('n')} augmente, la variance de la moyenne ${M('M_n')} de ${M('n')} variables indépendantes de même loi augmente.`, v: false, j: `${M('V(M_n)=\\dfrac{V(X)}{n}')} diminue quand ${M('n')} augmente : c’est la concentration autour de l’espérance.`, c: () => v / (n + 1) < v / n }),
          () => ({ s: `Si ${M('X')} suit ${M(`\\mathcal{B}(${n}\\,;\\,0{,}5)`)}, alors ${M(`V(X)=${numTex(F(n, 4))}`)}.`, v: true, j: `${M('V(X)=np(1-p)')} avec ${M(`p=0{,}5`)} : ${M(`${n}\\times 0{,}25=${numTex(F(n, 4))}`)}.`, c: () => near(n * 0.5 * 0.5, n / 4, 1e-12) }),
        ],
        3: [
          () => ({ s: `L’inégalité de Bienaymé-Tchebychev permet d’affirmer que ${M(`P\\left(|X-E(X)|\\geqslant ${dl}\\right)\\leqslant ${numTex(F(v, dl * dl))}`)} pour ${M(`V(X)=${v}`)}. Cette majoration est toujours utile.`, v: dl * dl <= v ? false : true, j: dl * dl <= v ? `Le majorant ${M(numTex(F(v, dl * dl)))} est supérieur ou égal à ${M(1)} : il est vrai mais sans intérêt (une probabilité est toujours inférieure à ${M(1)}).` : `Le majorant ${M(numTex(F(v, dl * dl)))} est strictement inférieur à ${M(1)} : il apporte une information.`, c: () => (v / (dl * dl) >= 1) === (dl * dl <= v) }),
          () => ({ s: `Pour la fréquence ${M('F_n')} de succès de ${M('n')} épreuves de Bernoulli de paramètre ${M('p')}, ${M(`P\\left(|F_n-p|\\geqslant\\delta\\right)\\leqslant\\dfrac{p(1-p)}{n\\delta^{2}}`)}.`, v: true, j: `${M('E(F_n)=p')}, ${M('V(F_n)=\\dfrac{p(1-p)}{n}')} puis inégalité de Bienaymé-Tchebychev.`, c: () => true }),
          () => ({ s: `La loi des grands nombres affirme que la moyenne ${M('M_n')} est égale à l’espérance ${M('\\mu')} pour ${M('n')} assez grand.`, v: false, j: `Elle affirme que ${M('M_n')} s’écarte de ${M('\\mu')} de plus de ${M('\\delta')} avec une probabilité qui tend vers ${M(0)} : ce n’est pas une égalité.`, c: () => true }),
        ],
      };
      return tf(r.pick(fam[level])());
    } },

  { id: 't-rvc-error', cls: C, chapter: 'terminale-12', domain: 'stats-proba', skill: 'Trouver l’erreur dans un calcul de moyenne et de dispersion', fast: false,
    make(r, level) {
      const n = r.int(4, 100), v = r.int(2, 40), mu = r.int(1, 20), kind = r.pick(level === 1 ? ['sq', 'add'] : ['den', 'sq', 'sig']);
      const sigma = (x) => `\\sqrt{${x}}`;
      const good = [`V(S_{${n}})=${n}\\times V(X)=${n}\\times ${v}=${n * v}`, `V(M_{${n}})=\\dfrac{V(S_{${n}})}{${n}^{2}}=\\dfrac{${n * v}}{${n * n}}=${fracTex(F(v, n))}`, `\\sigma(M_{${n}})=\\sqrt{${fracTex(F(v, n))}}`];
      let lines = good, bad, why, fix, shown = F(v, n);
      if (kind === 'sq') { lines = [`V(S_{${n}})=${n}^{2}\\times V(X)=${n * n * v}`, `V(M_{${n}})=\\dfrac{${n * n * v}}{${n * n}}=${v}`, `\\sigma(M_{${n}})=\\sqrt{${v}}`]; bad = 0; why = `pour des variables indépendantes, les variances s’additionnent : ${M(`V(S_n)=nV(X)`)} (le facteur ${M('n^{2}')} concerne ${M('V(nX)')}).`; fix = M(good[0]); shown = F(v); }
      else if (kind === 'add') { lines = [good[0], `V(M_{${n}})=\\dfrac{V(S_{${n}})}{${n}}=${v}`, `\\sigma(M_{${n}})=\\sqrt{${v}}`]; bad = 1; why = `${M('V(aX)=a^{2}V(X)')} avec ${M(`a=\\dfrac{1}{${n}}`)} : on divise par ${M(`${n}^{2}`)}.`; fix = M(good[1]); shown = F(v); }
      else if (kind === 'den') { lines = [good[0], `V(M_{${n}})=\\dfrac{${n * v}}{${n}}=${v}`, good[2].replace(fracTex(F(v, n)), `${v}`)]; bad = 1; why = `diviser la variable par ${M(n)} divise la variance par ${M(`${n}^{2}`)}.`; fix = M(good[1]); shown = F(v); }
      else { lines = [good[0], good[1], `\\sigma(M_{${n}})=${fracTex(F(v, n))}`]; bad = 2; why = `l’écart type est la racine carrée de la variance : ${M(`\\sqrt{${fracTex(F(v, n))}}`)}.`; fix = M(good[2]); shown = F(v, n); }
      const sh2 = kind === 'sig';
      if (!sh2 && eq(shown, F(v, n))) return this.make(r, level);
      if (sh2 && (v === n || v < 2)) return this.make(r, level);
      return spot(`${M('X_i')} sont ${M(n)} variables indépendantes de même loi avec ${M(`V(X)=${v}`)}. Pour calculer la variance puis l’écart type de ${M(`M_{${n}}=\\dfrac{X_1+\\dots+X_{${n}}}{${n}}`)}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(`V(M_{${n}})=${fracTex(F(v, n))}\\ ;\\ ${good[2]}`), () => (sh2 ? true : Math.abs(val(shown) - v / n) > 1e-12) && near((n * v) / (n * n), v / n, 1e-12) && mu > 0 && sigma !== undefined);
    } },

  { id: 't-rvc-mean', cls: C, chapter: 'terminale-12', domain: 'stats-proba', skill: 'Espérance et variance d’une somme et d’une moyenne', fast: false,
    make(r, level) {
      const n = r.int(5, 200), mu = F(r.nz(-20, 60), r.pick([1, 2, 5])), v = F(r.int(1, 90), r.pick([1, 2, 4]));
      const ES = mul(F(n), mu), VS = mul(F(n), v), VM = div(v, F(n));
      const head = `${M(`X_1,\\dots,X_{${n}}`)} sont des variables aléatoires indépendantes de même loi, d’espérance ${M(numTex(mu))} et de variance ${M(numTex(v))}. On pose ${M(`S=X_1+\\dots+X_{${n}}`)} et ${M(`M=\\dfrac{S}{${n}}`)}.`;
      if (level === 1) return { q: `${head} Calculer ${M('E(S)')} et ${M('V(S)')}.`, a: `${M(`E(S)=${n}\\times ${numTex(mu)}=${numTex(ES)}`)} ; ${M(`V(S)=${n}\\times ${numTex(v)}=${numTex(VS)}`)} (indépendance).`, ok: () => eq(ES, F(n * mu.n, mu.d)) && eq(VS, F(n * v.n, v.d)) };
      if (level === 2) return { q: `${head} Calculer ${M('E(M)')}, ${M('V(M)')} et ${M('\\sigma(M)')} (arrondi au centième).`, a: `${M(`E(M)=\\dfrac{E(S)}{${n}}=${numTex(mu)}`)} ; ${M(`V(M)=\\dfrac{V(S)}{${n}^{2}}=\\dfrac{${numTex(v)}}{${n}}=${fracTex(VM)}`)} ; ${M(`\\sigma(M)=\\sqrt{${fracTex(VM)}}\\approx ${roundTex(Math.sqrt(val(VM)), 2)}`)}.`, ok: () => eq(VM, F(v.n, v.d * n)) && Math.abs(Math.sqrt(val(VM)) * 100 - Math.round(Math.sqrt(val(VM)) * 100) - 0.5) > 1e-6 };
      const dl = r.pick([F(1, 2), F(1), F(2), F(3), F(1, 4)]), bound = div(VM, mul(dl, dl));
      return { q: `${head} Majorer ${M(`P\\left(|M${mu.n < 0 ? '+' + numTex(F(-mu.n, mu.d)) : mu.n === 0 ? '' : '-' + numTex(mu)}|\\geqslant ${numTex(dl)}\\right)`)} à l’aide de l’inégalité de Bienaymé-Tchebychev puis dire si ce majorant apporte une information.`, a: `${M(`E(M)=${numTex(mu)}`)} et ${M(`V(M)=${fracTex(VM)}`)}. ${M(`P\\left(|M-E(M)|\\geqslant ${numTex(dl)}\\right)\\leqslant\\dfrac{V(M)}{${numTex(dl)}^{2}}=${fracTex(bound)}`)}. ${val(bound) < 1 ? `Ce majorant est inférieur à ${M(1)} : il apporte une information.` : `Ce majorant est supérieur ou égal à ${M(1)} : il n’apporte aucune information.`}`, ok: () => Math.abs(val(bound) - val(VM) / (val(dl) * val(dl))) < 1e-12 };
    } },

  { id: 't-rvc-lgn', cls: C, chapter: 'terminale-12', domain: 'stats-proba', skill: 'Taille d’échantillon avec Bienaymé-Tchebychev', fast: false,
    make(r, level) {
      const p = F(r.int(1, 199), 200), dl = r.pick([F(1, 10), F(1, 20), F(1, 5), F(1, 100) , F(2, 25)]), eps = r.pick([F(1, 10), F(5, 100), F(1, 100), F(1, 20)]);
      const v = mul(p, sub(F(1), p)), nmin = Math.ceil(val(div(v, mul(eps, mul(dl, dl)))) - 1e-12), exact = div(v, mul(eps, mul(dl, dl)));
      if (nmin > 100000) return this.make(r, level);
      const ctx = r.pick(['des lancers d’une pièce truquée', 'des tirages avec remise dans une urne', 'des réponses à un sondage']);
      if (level === 1) return { q: `${M('X')} suit la loi de Bernoulli de paramètre ${M(fracTex(p))}. Calculer ${M('E(X)')} et ${M('V(X)')}.`, a: `${M(`E(X)=p=${fracTex(p)}`)} et ${M(`V(X)=p(1-p)=${fracTex(p)}\\times ${fracTex(sub(F(1), p))}=${fracTex(v)}`)}.`, ok: () => eq(v, mul(p, sub(F(1), p))) };
      if (level === 2) return { q: `Soit ${M('F_n')} la fréquence de succès observée sur ${M('n')} épreuves de Bernoulli indépendantes de paramètre ${M(fracTex(p))}. Exprimer ${M('E(F_n)')} et ${M('V(F_n)')} en fonction de ${M('n')}.`, a: `${M(`E(F_n)=${fracTex(p)}`)} et ${M(`V(F_n)=\\dfrac{p(1-p)}{n}=\\dfrac{${v.n}}{${v.d}n}`)}.`, ok: () => eq(v, mul(p, sub(F(1), p))) };
      const vq = `${v.n}`, vd = `${v.d}`, dls = numTex(dl);
      return { q: `On observe la fréquence ${M('F_n')} d’un succès de probabilité ${M(fracTex(p))} sur ${ctx} indépendants. Quelle taille ${M('n')} d’échantillon suffit, d’après l’inégalité de Bienaymé-Tchebychev, pour garantir ${M(`P\\left(|F_n-${fracTex(p)}|\\geqslant ${dls}\\right)\\leqslant ${numTex(eps)}`)} ?`, a: `${M(`E(F_n)=${fracTex(p)}`)}, ${M(`V(F_n)=\\dfrac{p(1-p)}{n}=\\dfrac{${vq}}{${vd}n}`)}. Bienaymé-Tchebychev : ${M(`P(|F_n-p|\\geqslant ${dls})\\leqslant\\dfrac{${vq}}{${vd}\\,n\\times ${dls}^{2}}`)}. Il suffit que ${M(`\\dfrac{${vq}}{${vd}\\,n\\times ${dls}^{2}}\\leqslant ${numTex(eps)}`)}, soit ${M(`n\\geqslant ${fracTex(exact)}`)}, donc ${M(`n=${nmin}`)}.`, ok: () => nmin >= val(exact) - 1e-9 && nmin - 1 < val(exact) && v.n > 0 };
    } },

  { id: 't-rvc-dice', cls: C, chapter: 'terminale-12', domain: 'stats-proba', skill: 'Loi et dispersion d’une somme de variables indépendantes', fast: false,
    make(r, level) {
      const faces = r.int(3, 200), m = level === 1 ? 1 : 2, E1 = F(faces + 1, 2), V1 = F(faces * faces - 1, 12);
      if (level === 1) return { q: `On lance un dé équilibré à ${M(faces)} faces numérotées de ${M(1)} à ${M(faces)}. Soit ${M('X')} le résultat. Calculer ${M('E(X)')} et ${M('V(X)')}.`, a: `${M(`E(X)=\\dfrac{1+${faces}}{2}=${fracTex(E1)}`)}. ${M(`E(X^{2})=\\dfrac{${faces}(${faces}+1)(2\\times ${faces}+1)}{6\\times ${faces}}=${fracTex(F((faces + 1) * (2 * faces + 1), 6))}`)}, donc ${M(`V(X)=${fracTex(F((faces + 1) * (2 * faces + 1), 6))}-\\left(${fracTex(E1)}\\right)^{2}=${fracTex(V1)}`)}.`, ok: () => { let e = 0, e2 = 0; for (let i = 1; i <= faces; i++) { e += i / faces; e2 += (i * i) / faces; } return near(e, val(E1), 1e-12) && near(e2 - e * e, val(V1), 1e-12); } };
      const nd2 = level === 2 ? 2 : r.int(3, 6), ES = mul(F(nd2), E1), VS = mul(F(nd2), V1);
      const brute = () => { let tot = 0, s1 = 0, s2 = 0; const go = (k, sum0) => { if (k === nd2) { tot++; s1 += sum0; s2 += sum0 * sum0; return; } for (let i = 1; i <= faces; i++) go(k + 1, sum0 + i); }; go(0, 0); const e = s1 / tot; return [e, s2 / tot - e * e]; };
      if (faces ** nd2 > 3e6) return this.make(r, level);
      return { q: `On lance ${M(nd2)} dés équilibrés à ${M(faces)} faces (numérotées de ${M(1)} à ${M(faces)}), de façon indépendante. Soit ${M('S')} la somme des résultats. Calculer ${M('E(S)')}, ${M('V(S)')} et ${M('\\sigma(S)')} (arrondi au centième).`, a: `Pour un dé : ${M(`E(X)=${fracTex(E1)}`)} et ${M(`V(X)=${fracTex(V1)}`)}. Par linéarité et indépendance : ${M(`E(S)=${nd2}\\times ${fracTex(E1)}=${fracTex(ES)}`)}, ${M(`V(S)=${nd2}\\times ${fracTex(V1)}=${fracTex(VS)}`)}, ${M(`\\sigma(S)=\\sqrt{${fracTex(VS)}}\\approx ${roundTex(Math.sqrt(val(VS)), 2)}`)}.`, ok: () => { const [e, v] = brute(); return near(e, val(ES), 1e-9) && near(v, val(VS), 1e-9) && m > 0 && Math.abs(Math.sqrt(val(VS)) * 100 - Math.round(Math.sqrt(val(VS)) * 100) - 0.5) > 1e-6; } };
    } },

  // ============================ 13 Représentations paramétriques et équations cartésiennes ============================
  { id: 't-param-qcm', cls: C, chapter: 'terminale-13', domain: 'geometrie', skill: 'QCM sur représentations paramétriques et équations cartésiennes', fast: true,
    make(r, level) {
      const v3 = () => [r.int(-5, 5), r.int(-5, 5), r.int(-5, 5)], P = (v, t) => `\\begin{cases}${['x', 'y', 'z'].map((c, i) => `${c}=${polyTex([v[1][i], v[0][i]], t)}`).join('\\\\')}\\end{cases}`;
      if (level === 1) { let A, u; do { A = v3(); u = v3(); } while (u.every((x) => x === 0)); const cs = [[A, u, 'point et vecteur directeur lus dans la représentation.'], [A, [u[1], u[0], u[2]], 'permute deux coordonnées du vecteur directeur.'], [u, A, 'échange le point et le vecteur directeur.'], [A.map((x) => -x), u, 'oppose les coordonnées du point.']]; const T = (c) => `\\left(${c[0].join('\\,;\\,')}\\right)\\text{ et }\\vec{u}\\begin{pmatrix}${c[1].join('\\\\')}\\end{pmatrix}`.replace('\\left(', 'A\\left(');
        if (new Set(cs.map((c) => JSON.stringify(c.slice(0, 2)))).size < 4) return this.make(r, level);
        return mcq(r, `La droite ${M('d')} a pour représentation paramétrique ${M(`${P([A, u], 't')}\\ (t\\in\\mathbb{R})`)}. Un point de ${M('d')} et un vecteur directeur sont :`, opt(M(T(cs[0])), 'dans ' + M('x=x_A+at') + ', on lit le point ' + M('A') + ' (valeur de ' + M('t=0') + ') et le vecteur directeur ' + M('(a\\,;\\,b\\,;\\,c)') + '.', { c: cs[0] }), cs.slice(1).map((c, i) => opt(M(T(c)), cs[i + 1][2], { c })), (o) => JSON.stringify(o.c[0]) === JSON.stringify(A) && JSON.stringify(o.c[1]) === JSON.stringify(u)); }
      if (level === 2) { let A, B; do { A = v3(); B = v3(); } while (A.every((x, i) => x === B[i])); const u = B.map((x, i) => x - A[i]), cs = [[A, u], [A, B], [B, A.map((x, i) => x - B[i])], [A, u.map((x) => -x)]]; if (new Set(cs.map((c) => JSON.stringify(c))).size < 3) return this.make(r, level); const alt = [[A, B, 'utilise ' + M('B') + ' comme vecteur directeur au lieu de ' + M('\\overrightarrow{AB}') + '.']]; const opts = [{ P: [A, u], why: M('\\overrightarrow{AB}') + ' dirige la droite et ' + M('A') + ' lui appartient.' }, { P: [A, B], why: 'prend les coordonnées de ' + M('B') + ' comme vecteur directeur.' }, { P: [B, B.map((x, i) => x + 0 * i)], why: 'prend ' + M('B') + ' pour point et pour vecteur.' }, { P: [A.map((x, i) => x + 1), u], why: 'décale le point ' + M('A') + ' (la droite ne passe plus par ' + M('A') + ').' }];
        const inLine = (O) => { const AP = O.P[0].map((x, i) => x - A[i]), cr = [AP[1] * u[2] - AP[2] * u[1], AP[2] * u[0] - AP[0] * u[2], AP[0] * u[1] - AP[1] * u[0]], cd = [O.P[1][1] * u[2] - O.P[1][2] * u[1], O.P[1][2] * u[0] - O.P[1][0] * u[2], O.P[1][0] * u[1] - O.P[1][1] * u[0]]; return cr.every((x) => x === 0) && cd.every((x) => x === 0) && O.P[1].some((x) => x !== 0); };
        if (opts.slice(1).some(inLine) || new Set(opts.map((o) => P([o.P[0], o.P[1]], 't'))).size < 4) return this.make(r, level);
        return mcq(r, `${M(`A(${A.join('\\,;\\,')})`)} et ${M(`B(${B.join('\\,;\\,')})`)}. Une représentation paramétrique de la droite ${M('(AB)')} est :`, opt(M(P(opts[0].P, 't')), opts[0].why, { o: opts[0] }), opts.slice(1).map((o) => opt(M(P(o.P, 't')), o.why, { o })), (o) => inLine(o.o)); }
      let n, A; do { n = v3(); A = v3(); } while (n.filter((x) => x !== 0).length < 2);
      const d = -(n[0] * A[0] + n[1] * A[1] + n[2] * A[2]), eqn = (c, dd) => `${lin([[c[0], 'x'], [c[1], 'y'], [c[2], 'z'], [dd, '']])}=0`;
      const cs = [[n, d, 'un vecteur normal donne les coefficients, la constante se déduit de ' + M('A') + '.'], [n, 0, 'oublie la constante (plan par l’origine).'], [n, -d, 'se trompe de signe pour la constante.'], [[n[1], n[0], n[2]], -(n[1] * A[0] + n[0] * A[1] + n[2] * A[2]), 'permute des coefficients du vecteur normal.']];
      if (d === 0 || new Set(cs.map((c) => eqn(c[0], c[1]))).size < 4) return this.make(r, level);
      return mcq(r, `Le plan ${M('\\mathcal{P}')} passe par ${M(`A(${A.join('\\,;\\,')})`)} et a pour vecteur normal ${M(`\\vec{n}\\begin{pmatrix}${n.join('\\\\')}\\end{pmatrix}`)}. Une équation cartésienne de ${M('\\mathcal{P}')} est :`, opt(M(eqn(cs[0][0], cs[0][1])), cs[0][2], { e: cs[0] }), cs.slice(1).map((c) => opt(M(eqn(c[0], c[1])), c[2], { e: c })), (o) => o.e[0].every((x, i) => x === n[i]) && o.e[0][0] * A[0] + o.e[0][1] * A[1] + o.e[0][2] * A[2] + o.e[1] === 0);
    } },

  { id: 't-param-tf', cls: C, chapter: 'terminale-13', domain: 'geometrie', skill: 'Vrai ou faux sur droites et plans de l’espace', fast: true,
    make(r, level) {
      const v3 = () => [r.int(-5, 5), r.int(-5, 5), r.int(-5, 5)], dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2], cross = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      const P = (A, u) => `\\begin{cases}${['x', 'y', 'z'].map((c, i) => `${c}=${polyTex([u[i], A[i]], 't')}`).join('\\\\')}\\end{cases}`, col = (v) => `\\begin{pmatrix}${v.join('\\\\')}\\end{pmatrix}`;
      const onLine = (A, u, K) => cross(K.map((x, i) => x - A[i]), u).every((x) => x === 0);
      const nz3 = () => { let u; do { u = v3(); } while (u.every((x) => x === 0)); return u; };
      const fam = {
        1: [
          () => { const A = v3(), u = nz3(), t0 = r.nz(-3, 3), K = A.map((x, i) => x + t0 * u[i]); if (r.next() < 0.5) K[r.int(0, 2)] += 1; const real = onLine(A, u, K); return { s: `Le point ${M(`K(${K.join('\\,;\\,')})`)} appartient à la droite de représentation paramétrique ${M(`${P(A, u)}\\ (t\\in\\mathbb{R})`)}.`, v: real, j: real ? `${M('\\overrightarrow{AK}')} est colinéaire à ${M('\\vec{u}')} : il existe ${M('t')} (ici ${M(t0)}) qui redonne les trois coordonnées de ${M('K')}.` : `${M('\\overrightarrow{AK}')} n’est pas colinéaire à ${M('\\vec{u}')} : aucune valeur de ${M('t')} ne convient pour les trois coordonnées.`, c: () => real === cross(K.map((x, i) => x - A[i]), u).every((x) => x === 0) }; },
          () => { const A = v3(), B = v3(); if (A.every((x, i) => x === B[i])) B[0] += 1; const AB = B.map((x, i) => x - A[i]), k = r.nz(-3, 3), ok0 = r.next() < 0.5, u = AB.map((x) => k * x); if (!ok0) u[r.int(0, 2)] += 1; const real = cross(AB, u).every((x) => x === 0) && u.some((x) => x !== 0); return { s: `${M(`\\vec{u}${col(u)}`)} est un vecteur directeur de la droite ${M(`(AB)`)} avec ${M(`A(${A.join('\\,;\\,')})`)} et ${M(`B(${B.join('\\,;\\,')})`)}.`, v: real, j: `${M(`\\overrightarrow{AB}${col(AB)}`)} ${real ? 'et ' + M('\\vec{u}') + ' sont colinéaires.' : 'et ' + M('\\vec{u}') + ' ne sont pas colinéaires.'}`, c: () => real === (cross(AB, u).every((x) => x === 0) && u.some((x) => x !== 0)) }; },
        ],
        2: [
          () => { const n = nz3(), u = v3(); if (r.next() < 0.5) { const w = nz3(); const c = cross(n, w); u[0] = c[0]; u[1] = c[1]; u[2] = c[2]; } return { s: `Une droite de vecteur directeur ${M(`\\vec{u}${col(u)}`)} est parallèle (ou incluse) au plan de vecteur normal ${M(`\\vec{n}${col(n)}`)}.`, v: dot(n, u) === 0, j: `${M(`\\vec{u}\\cdot\\vec{n}=${dot(u, n)}`)} ${dot(n, u) === 0 ? ': nul, donc la droite est parallèle au plan ou incluse dedans.' : ': non nul, donc la droite coupe le plan en un seul point.'}`, c: () => (dot(n, u) === 0) === (dot(u, n) === 0) }; },
          () => { const n = nz3(), k = r.nz(-3, 3), same = r.next() < 0.5, n2 = n.map((x) => k * x); if (!same) n2[r.int(0, 2)] += 1; const real = cross(n, n2).every((x) => x === 0); const d1 = r.int(-5, 5), d2 = r.int(-5, 5); return { s: `Les plans ${M(`${lin([[n[0], 'x'], [n[1], 'y'], [n[2], 'z'], [d1, '']])}=0`)} et ${M(`${lin([[n2[0], 'x'], [n2[1], 'y'], [n2[2], 'z'], [d2, '']])}=0`)} sont parallèles ou confondus.`, v: real, j: real ? `Leurs vecteurs normaux sont colinéaires.` : `Leurs vecteurs normaux ${M(col(n))} et ${M(col(n2))} ne sont pas colinéaires : les plans sont sécants selon une droite.`, c: () => real === cross(n, n2).every((x) => x === 0) }; },
        ],
        3: [
          () => { const k = r.nz(-4, 4), a = r.int(1, 3); return { s: `Les droites ${M(`d:\\ (x,y,z)=(t,0,0)`)} et ${M(`d':\\ (x,y,z)=(0,s,${k})`)} (${M('t')}, ${M('s')} réels) ont des vecteurs directeurs non colinéaires, donc elles sont sécantes.`, v: false, j: `Un point commun vérifierait ${M(`t=0`)}, ${M('0=s')} et ${M(`0=${k}`)} : impossible. Les droites ne sont pas coplanaires (ni parallèles ni sécantes).`, c: () => k !== 0 && a > 0 }; },
          () => { const n1 = nz3(); let n2; do { n2 = nz3(); } while (cross(n1, n2).every((x) => x === 0)); return { s: `Deux plans de vecteurs normaux ${M(col(n1))} et ${M(col(n2))} ont pour intersection une droite.`, v: true, j: `Les vecteurs normaux ne sont pas colinéaires : les plans ne sont pas parallèles, donc sécants selon une droite de vecteur directeur ${M(`\\vec{n_1}\\wedge\\vec{n_2}`).replace('\\wedge', '\\times')}.`, c: () => cross(n1, n2).some((x) => x !== 0) }; },
          () => { const n = nz3(), A = v3(), u = cross(n, nz3()); if (u.every((x) => x === 0)) u[0] = n[1] === 0 && n[2] === 0 ? 0 : 1; const d = -dot(n, A), inc = r.next() < 0.5, K = inc ? A : A.map((x, i) => x + n[i]); const par0 = dot(n, u) === 0, inPlane = dot(n, K) + d === 0; return { s: `La droite passant par ${M(`K(${K.join('\\,;\\,')})`)} de vecteur directeur ${M(`\\vec{u}${col(u)}`)} est incluse dans le plan ${M(`${lin([[n[0], 'x'], [n[1], 'y'], [n[2], 'z'], [d, '']])}=0`)}.`, v: par0 && inPlane, j: `Il faut ${M('\\vec{u}\\cdot\\vec{n}=0')} (ici ${M(dot(u, n))}) et ${M('K')} dans le plan (valeur ${M(dot(n, K) + d)}).`, c: () => (par0 && inPlane) === (dot(u, n) === 0 && dot(n, K) + d === 0) }; },
        ],
      };
      return tf(r.pick(fam[level])());
    } },

  { id: 't-param-error', cls: C, chapter: 'terminale-13', domain: 'geometrie', skill: 'Trouver l’erreur dans une représentation paramétrique ou une intersection', fast: false,
    make(r, level) {
      const v3 = () => [r.int(-5, 5), r.int(-5, 5), r.int(-5, 5)], dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2], col = (v) => `\\begin{pmatrix}${v.join('\\\\')}\\end{pmatrix}`;
      const sys = (A, u) => `\\begin{cases}${['x', 'y', 'z'].map((c, i) => `${c}=${polyTex([u[i], A[i]], 't')}`).join('\\\\')}\\end{cases}`;
      if (level <= 2) {
        let A, B, kind; do { A = v3(); B = v3(); kind = r.pick(['sum', 'order']); } while (A.every((x, i) => x === B[i]) || A.some((x, i) => x + B[i] === B[i] - A[i]) );
        const u = B.map((x, i) => x - A[i]), good = [`\\overrightarrow{AB}${col(u)}`, `M(x\\,;\\,y\\,;\\,z)\\in(AB)\\iff\\exists t,\\ \\overrightarrow{AM}=t\\overrightarrow{AB}`, sys(A, u)];
        let lines = good, bad, why, fix, w = u, A2 = A;
        if (kind === 'sum') { w = A.map((x, i) => x + B[i]); lines = [`\\overrightarrow{AB}${col(w)}`, good[1], sys(A, w)]; bad = 0; why = `les coordonnées de ${M('\\overrightarrow{AB}')} sont ${M('x_B-x_A')}, ${M('y_B-y_A')}, ${M('z_B-z_A')} : des différences, pas des sommes.`; fix = M(good[0]); }
        else { A2 = B; w = u; lines = [good[0], good[1], sys(B, A.map((x, i) => x - B[i]))]; w = A.map((x, i) => x - B[i]); bad = 2; why = `avec le point ${M('B')} comme point de départ, le vecteur directeur doit rester celui qui va de ${M('A')} à ${M('B')} ou l’opposé cohérent ; ici la paramétrisation ne passe plus par ${M('A')} si on garde ${M('A')} comme origine du vecteur : la droite écrite est correcte seulement avec ${M('\\overrightarrow{BA}')}`; why = `le point de départ ${M('A')} et le vecteur ${M('\\overrightarrow{AB}')} s’accordent : on écrit ${M(`${sys(A, u).replace(/\\\\/g, ' ')}`).slice(0, 0)}le système avec ${M('A')} et ${M('\\overrightarrow{AB}')}.`; fix = M(good[2]); }
        const same = (() => { const AP = A2.map((x, i) => x - A[i]); return [AP[1] * u[2] - AP[2] * u[1], AP[2] * u[0] - AP[0] * u[2], AP[0] * u[1] - AP[1] * u[0]].every((x) => x === 0) && [w[1] * u[2] - w[2] * u[1], w[2] * u[0] - w[0] * u[2], w[0] * u[1] - w[1] * u[0]].every((x) => x === 0); })();
        if (kind === 'order' || same) return this.make(r, level);
        return spot(`Pour donner une représentation paramétrique de la droite ${M('(AB)')} avec ${M(`A(${A.join('\\,;\\,')})`)} et ${M(`B(${B.join('\\,;\\,')})`)}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(good[2]), () => !same && u.some((x) => x !== 0));
      }
      let A, u, n, c0, kind; do { A = v3(); u = v3(); n = v3(); c0 = r.int(-9, 9); kind = r.pick(['sign', 'cst']); } while (dot(n, u) === 0 || u.every((x) => x === 0));
      const tt = F(-(dot(n, A) + c0), dot(n, u)), K = A.map((x, i) => add(F(x), mul(tt, F(u[i])))), pl = `${lin([[n[0], 'x'], [n[1], 'y'], [n[2], 'z'], [c0, '']])}=0`;
      const subst = `${par(n[0])}(${polyTex([u[0], A[0]], 't')})+${par(n[1])}(${polyTex([u[1], A[1]], 't')})+${par(n[2])}(${polyTex([u[2], A[2]], 't')})${sgn(c0)}=0`;
      const good = [subst, `${polyTex([dot(n, u), dot(n, A) + c0], 't')}=0`, `t=${fracTex(tt)}`];
      let lines = good, bad, why, fix, shown = tt;
      if (kind === 'sign') { const ts = F(dot(n, A) + c0, dot(n, u)); lines = [good[0], good[1], `t=${fracTex(ts)}`]; bad = 2; why = `${M(`${polyTex([dot(n, u), dot(n, A) + c0], 't')}=0`)} donne ${M(`t=\\dfrac{${-(dot(n, A) + c0)}}{${dot(n, u)}}`)} : on change de signe en passant la constante de l’autre côté.`; fix = M(good[2]); shown = ts; }
      else { const ts = F(-dot(n, A), dot(n, u)); lines = [good[0], `${polyTex([dot(n, u), dot(n, A)], 't')}=0`, `t=${fracTex(ts)}`]; bad = 1; why = `en développant, il reste la constante ${M(c0)} du plan : ${M(`${dot(n, A)}${sgn(c0)}=${dot(n, A) + c0}`)}.`; fix = M(good[1]); shown = ts; if (c0 === 0) return this.make(r, level); }
      if (eq(shown, tt)) return this.make(r, level);
      return spot(`Pour trouver l’intersection de la droite ${M(`${sys(A, u)}`)} et du plan ${M(pl)}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(`t=${fracTex(tt)}\\ ;\\ K\\left(${K.map(fracTex).join('\\,;\\,')}\\right)`), () => { const k0 = K.map(val); return Math.abs(dot(n, k0) + c0) < 1e-9 && !eq(shown, tt); });
    } },

  { id: 't-param-line', cls: C, chapter: 'terminale-13', domain: 'geometrie', skill: 'Représentation paramétrique d’une droite ou d’un segment', fast: false,
    make(r, level) {
      const v3 = () => [r.int(-5, 5), r.int(-5, 5), r.int(-5, 5)], cross = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      const sys = (A, u) => `\\begin{cases}${['x', 'y', 'z'].map((c, i) => `${c}=${polyTex([u[i], A[i]], 't')}`).join('\\\\')}\\end{cases}`;
      let A, B; do { A = v3(); B = v3(); } while (A.every((x, i) => x === B[i]));
      const u = B.map((x, i) => x - A[i]);
      if (level === 1) return { q: `Dans un repère de l’espace, ${M(`A(${A.join('\\,;\\,')})`)} et ${M(`B(${B.join('\\,;\\,')})`)}. Donner une représentation paramétrique de la droite ${M('(AB)')}.`, a: `${M(`\\overrightarrow{AB}\\begin{pmatrix}${u.join('\\\\')}\\end{pmatrix}`)} dirige la droite qui passe par ${M('A')} : ${M(`${sys(A, u)}\\ (t\\in\\mathbb{R})`)}.`, ok: () => { const at = (t) => A.map((x, i) => x + t * u[i]); return at(0).every((x, i) => x === A[i]) && at(1).every((x, i) => x === B[i]); } };
      if (level === 2) { const t0 = F(r.int(1, 6), r.int(2, 7)), K = A.map((x, i) => add(F(x), mul(t0, F(u[i])))); const real = r.next() < 0.5; const K2 = K.map((x) => x); if (!real) { const zs = [0, 1, 2].filter((j) => u[j] === 0), jj = zs.length ? r.pick(zs) : r.int(0, 2); K2[jj] = add(K[jj], F(1)); } const ok0 = K2.every((x, i) => eq(x, K[i])); return { q: `Dans un repère de l’espace, ${M(`A(${A.join('\\,;\\,')})`)} et ${M(`B(${B.join('\\,;\\,')})`)}. Le point ${M(`K\\left(${K2.map(fracTex).join('\\,;\\,')}\\right)`)} appartient-il à la droite ${M('(AB)')} ? Appartient-il au segment ${M('[AB]')} ?`, a: ok0 ? `${M(`\\overrightarrow{AK}=${fracTex(t0)}\\overrightarrow{AB}`)} : ${M('K')} est sur la droite ${M('(AB)')}, et ${M(`${fracTex(t0)}${val(t0) <= 1 ? '\\in[0\\,;\\,1]' : '>1'}`)} : ${val(t0) <= 1 ? 'il appartient au segment' : 'il n’appartient pas au segment'}.` : `${M('\\overrightarrow{AK}')} et ${M('\\overrightarrow{AB}')} ne sont pas colinéaires : ${M('K')} n’est pas sur la droite, donc pas sur le segment.`, ok: () => ok0 === cross(K2.map((x, i) => val(x) - A[i]), u).every((x) => Math.abs(x) < 1e-9) }; }
      const kk = F(r.int(1, 4), r.int(5, 9)), M0 = A.map((x, i) => add(F(x), mul(kk, F(u[i]))));
      return { q: `Dans un repère de l’espace, ${M(`A(${A.join('\\,;\\,')})`)} et ${M(`B(${B.join('\\,;\\,')})`)}. 1) Donner une représentation paramétrique du segment ${M('[AB]')} (avec ${M('t\\in[0\\,;\\,1]')}). 2) Quel point correspond à ${M(`t=${fracTex(kk)}`)} ? 3) Quel est le milieu de ${M('[AB]')} (valeur de ${M('t')} correspondante) ?`, a: `1) ${M(`${sys(A, u)}\\ ,\\ t\\in[0\\,;\\,1]`)}. 2) ${M(`M\\left(${M0.map(fracTex).join('\\,;\\,')}\\right)`)}. 3) Le milieu correspond à ${M('t=\\dfrac{1}{2}')} : ${M(`I\\left(${A.map((x, i) => fracTex(F(x + B[i], 2))).join('\\,;\\,')}\\right)`)}.`, ok: () => M0.every((x, i) => Math.abs(val(x) - (A[i] + val(kk) * u[i])) < 1e-12) && A.every((x, i) => Math.abs(x + 0.5 * u[i] - (x + B[i]) / 2) < 1e-12) };
    } },

  { id: 't-param-cross', cls: C, chapter: 'terminale-13', domain: 'geometrie', skill: 'Position relative de deux droites de l’espace', fast: false,
    make(r, level) {
      const v3 = () => [r.int(-4, 4), r.int(-4, 4), r.int(-4, 4)], cross = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], nzv = () => { let u; do { u = v3(); } while (u.every((x) => x === 0)); return u; };
      const L = (A, u, p) => `\\begin{cases}${['x', 'y', 'z'].map((c, i) => `${c}=${polyTex([u[i], A[i]], p)}`).join('\\\\')}\\end{cases}`;
      let A, u, B, w, kind; do { A = v3(); u = nzv(); w = nzv(); kind = level === 1 ? r.pick(['par', 'other']) : r.pick(['sec', 'skew', 'par']); B = v3(); const t0 = r.nz(-3, 3), s0 = r.nz(-3, 3); if (kind === 'par') { const k = r.nz(-3, 3); w = u.map((x) => k * x); } if (kind === 'sec') { B = A.map((x, i) => x + t0 * u[i] - s0 * w[i]); } } while (kind !== 'par' && cross(u, w).every((x) => x === 0));
      const cr = cross(u, w), colin = cr.every((x) => x === 0);
      const solve = () => { const AB = B.map((x, i) => x - A[i]); if (colin) return AB.length && cross(AB, u).every((x) => x === 0) ? 'confondues' : 'parallèles'; for (const [i, j] of [[0, 1], [0, 2], [1, 2]]) { const det = u[i] * -w[j] - -w[i] * u[j]; if (det !== 0) { const t = F(AB[i] * -w[j] - -w[i] * AB[j], det), s = F(u[i] * AB[j] - u[j] * AB[i], det); const k = [0, 1, 2].every((m) => eq(add(mul(t, F(u[m])), F(A[m])), add(mul(s, F(w[m])), F(B[m])))); return k ? { t, s } : 'non coplanaires'; } } return 'non coplanaires'; };
      const res = solve(), D1 = `d:\\ ${L(A, u, 't')}`, D2 = `d':\\ ${L(B, w, 's')}`;
      const head = `Dans un repère de l’espace, ${M(D1)} et ${M(D2)}.`;
      if (level === 1) return { q: `${head} Les droites ${M('d')} et ${M("d'")} sont-elles parallèles ?`, a: colin ? `${M(`\\vec{u}\\begin{pmatrix}${u.join('\\\\')}\\end{pmatrix}`)} et ${M(`\\vec{w}\\begin{pmatrix}${w.join('\\\\')}\\end{pmatrix}`)} sont colinéaires : les droites sont ${res === 'confondues' ? 'confondues' : 'strictement parallèles'}.` : `${M(`\\vec{u}\\begin{pmatrix}${u.join('\\\\')}\\end{pmatrix}`)} et ${M(`\\vec{w}\\begin{pmatrix}${w.join('\\\\')}\\end{pmatrix}`)} ne sont pas colinéaires : les droites ne sont pas parallèles.`, ok: () => colin === (kind === 'par') && (colin || cr.some((x) => x !== 0)) };
      const ans = typeof res === 'object' ? `elles sont sécantes en ${M('t=' + fracTex(res.t))} (et ${M('s=' + fracTex(res.s))}) au point ${M(`\\left(${A.map((x, i) => fracTex(add(F(x), mul(res.t, F(u[i]))))).join('\\,;\\,')}\\right)`)}` : colin ? `elles sont ${res === 'confondues' ? 'confondues' : 'strictement parallèles'} (vecteurs directeurs colinéaires)` : 'le système n’a pas de solution : les droites ne sont pas coplanaires (ni parallèles ni sécantes)';
      return { q: `${head} ${level === 2 ? 'Étudier la position relative de ' + M('d') + ' et ' + M("d'") + '.' : 'Étudier la position relative de ' + M('d') + ' et ' + M("d'") + ' et, si elles sont sécantes, donner leur point d’intersection.'}`, a: `${colin ? '' : 'Les vecteurs directeurs ne sont pas colinéaires ; on résout ' + M('A+tu=B+sw') + ' : '}${ans}.`, ok: () => (typeof res !== 'object' || kind !== 'par') && (typeof res !== 'object' || [0, 1, 2].every((m) => eq(add(mul(res.t, F(u[m])), F(A[m])), add(mul(res.s, F(w[m])), F(B[m]))))) && (kind !== 'par' || colin) };
    } },

  { id: 't-param-planes', cls: C, chapter: 'terminale-13', domain: 'geometrie', skill: 'Intersection de plans, d’une droite et d’un plan', fast: false,
    make(r, level) {
      const v3 = () => [r.int(-4, 4), r.int(-4, 4), r.int(-4, 4)], dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2], cross = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      if (level <= 2) { let A, u, n, c0; do { A = v3(); u = v3(); n = v3(); c0 = r.int(-9, 9); } while (dot(n, u) === 0 || u.every((x) => x === 0));
        const tt = F(-(dot(n, A) + c0), dot(n, u)), K = A.map((x, i) => add(F(x), mul(tt, F(u[i])))), pl = `${lin([[n[0], 'x'], [n[1], 'y'], [n[2], 'z'], [c0, '']])}=0`, sys = `\\begin{cases}${['x', 'y', 'z'].map((c, i) => `${c}=${polyTex([u[i], A[i]], 't')}`).join('\\\\')}\\end{cases}`;
        return { q: `Dans un repère de l’espace, la droite ${M(`d:\\ ${sys}`)} et le plan ${M(`\\mathcal{P}:\\ ${pl}`)}. Déterminer leur intersection.`, a: `On remplace ${M('x,y,z')} dans l’équation du plan : ${M(`${polyTex([dot(n, u), dot(n, A) + c0], 't')}=0`)}, soit ${M(`t=${fracTex(tt)}`)} (car ${M(`\\vec{n}\\cdot\\vec{u}=${dot(n, u)}\\neq 0`)}). Le point d’intersection est ${M(`K\\left(${K.map(fracTex).join('\\,;\\,')}\\right)`)}.`, ok: () => { const k = K.map(val); return Math.abs(dot(n, k) + c0) < 1e-9 && k.every((x, i) => Math.abs(x - A[i] - val(tt) * u[i]) < 1e-9); } }; }
      let n1, n2, d1, d2; do { n1 = v3(); n2 = v3(); d1 = r.int(-6, 6); d2 = r.int(-6, 6); } while (cross(n1, n2).every((x) => x === 0));
      const u = cross(n1, n2).map((x) => x), g = u.reduce((a0, b0) => { let x = Math.abs(a0), y = Math.abs(b0); while (y) [x, y] = [y, x % y]; return x; }, 0), ur = u.map((x) => x / g);
      // a point of the line: solve with one coordinate fixed to 0 where possible
      let P0 = null; for (const k of [2, 1, 0]) { const idx = [0, 1, 2].filter((i) => i !== k), [i, j] = idx, det = n1[i] * n2[j] - n1[j] * n2[i]; if (det !== 0) { const xi = F(-d1 * n2[j] + d2 * n1[j], det), xj = F(-n1[i] * d2 + n2[i] * d1, det); P0 = [0, 0, 0].map((_, m) => (m === k ? F(0) : m === i ? xi : xj)); break; } }
      return { q: `Dans un repère de l’espace, ${M(`\\mathcal{P}_1:\\ ${lin([[n1[0], 'x'], [n1[1], 'y'], [n1[2], 'z'], [d1, '']])}=0`)} et ${M(`\\mathcal{P}_2:\\ ${lin([[n2[0], 'x'], [n2[1], 'y'], [n2[2], 'z'], [d2, '']])}=0`)}. Montrer que ces plans sont sécants et donner une représentation paramétrique de leur droite d’intersection.`, a: `${M(`\\vec{n_1}\\begin{pmatrix}${n1.join('\\\\')}\\end{pmatrix}`)} et ${M(`\\vec{n_2}\\begin{pmatrix}${n2.join('\\\\')}\\end{pmatrix}`)} ne sont pas colinéaires : les plans sont sécants selon une droite de vecteur directeur ${M(`\\vec{n_1}\\times\\vec{n_2}=\\begin{pmatrix}${u.join('\\\\')}\\end{pmatrix}`)}, que l’on simplifie en ${M(`\\begin{pmatrix}${ur.join('\\\\')}\\end{pmatrix}`)}. Un point de la droite est ${M(`A\\left(${P0.map(fracTex).join('\\,;\\,')}\\right)`)} (en fixant une coordonnée à ${M(0)}). Représentation : ${M(`\\begin{cases}x=${P0[0].n === 0 ? '' : fracTex(P0[0]) + '+'}${cf(F(ur[0]))}t\\\\y=${P0[1].n === 0 ? '' : fracTex(P0[1]) + '+'}${cf(F(ur[1]))}t\\\\z=${P0[2].n === 0 ? '' : fracTex(P0[2]) + '+'}${cf(F(ur[2]))}t\\end{cases}`.replace(/\+-/g, '-').replace(/=(-?)t/g, (m0, s0) => `=${s0}t`).replace(/=0t/g, '=0').replace(/\+0t/g, ''))}.`, ok: () => { const a = P0.map(val); return P0 !== null && Math.abs(dot(n1, a) + d1) < 1e-9 && Math.abs(dot(n2, a) + d2) < 1e-9 && dot(n1, u) === 0 && dot(n2, u) === 0; } };
    } },

  // ============================ 14 Fonctions trigonométriques ============================
  { id: 't-trig2-qcm', cls: C, chapter: 'terminale-14', domain: 'analyse', skill: 'QCM sur les fonctions sinus et cosinus', fast: true,
    make(r, level) {
      if (level === 1) {
        const a = r.nz(-6, 6), b = r.int(-6, 6), w = r.int(2, 5), f = (x) => a * Math.sin(w * x + b), mk = (t, why, g) => opt(M(`f'(x)=${t}`), why, { g });
        const arg = polyTex([w, b], 'x'), ax = coef(a);
        const cs = [mk(`${a * w}\\cos(${arg})`, M("(\\sin u)'=u'\\cos u") + ' avec ' + M(`u=${arg}`) + '.', (x) => a * w * Math.cos(w * x + b)), mk(`${coef(a)}\\cos(${arg})`, 'oublie le facteur ' + M("u'=" + w) + '.', (x) => a * Math.cos(w * x + b)), mk(`${-a * w}\\cos(${arg})`, 'se trompe de signe (confond avec la dérivée du cosinus).', (x) => -a * w * Math.cos(w * x + b)), mk(`${a * w}\\sin(${arg})`, 'dérive ' + M('\\sin') + ' en ' + M('\\sin') + '.', (x) => a * w * Math.sin(w * x + b))];
        return mcq(r, `La dérivée de ${M(`f(x)=${ax}\\sin(${arg})`)} est :`, cs[0], cs.slice(1), (o) => [-1.1, 0.4, 2.2].every((x) => near(o.g(x), nd(f, x), 1e-3)));
      }
      if (level === 2) {
        const a = r.int(1, 8), b = r.int(1, 8), cands = [[a, 'a'], [2 * Math.PI / a, 'b']], f = (x) => Math.cos(a * x);
        const T = (s) => M(s), Tp = `\\dfrac{2\\pi}{${a}}`, cs = [[Tp, 2 * Math.PI / a, 'la fonction ' + M('x\\mapsto\\cos(\\omega x)') + ' a pour période ' + M('\\dfrac{2\\pi}{\\omega}') + '.'], [`2\\pi`, 2 * Math.PI, 'prend la période du cosinus sans tenir compte de ' + M(`\\omega=${a}`) + '.'], [`${a === 1 ? '\\pi' : `${a}\\pi`}`.replace('1\\pi', '\\pi'), a * Math.PI, 'multiplie au lieu de diviser.'], [`\\dfrac{\\pi}{${a}}`, Math.PI / a, 'divise ' + M('\\pi') + ' au lieu de ' + M('2\\pi') + '.']];
        if (a === 1 || new Set(cs.map((c) => c[0])).size < 4 || a === 2) return this.make(r, level);
        return mcq(r, `La plus petite période strictement positive de la fonction ${M(`f(x)=\\cos(${a}x)`)} est :`, opt(T(cs[0][0]), cs[0][2], { p: cs[0][1] }), cs.slice(1).map((c) => opt(T(c[0]), c[2], { p: c[1] })), (o) => { const isP = (p) => [0.1, 0.77, 1.9, 3.3].every((x) => Math.abs(Math.cos(a * (x + p)) - Math.cos(a * x)) < 1e-9); return isP(o.p) && o.p > 0 && Array.from({ length: 39 }, (_, i) => i + 2).every((k) => !isP(o.p / k)); } );
      }
      const a = r.nz(-4, 4), b = r.nz(-4, 4), par0 = r.pick(['pair', 'impair', 'ni']), f = par0 === 'pair' ? (x) => a * Math.cos(x) + b * x * x : par0 === 'impair' ? (x) => a * Math.sin(x) + b * x ** 3 : (x) => a * Math.cos(x) + b * Math.sin(x), tx = par0 === 'pair' ? `${polyTex([a], 'x').slice(0, 0)}${cf(F(a))}\\cos x${b < 0 ? '-' : '+'}${Math.abs(b) === 1 ? '' : Math.abs(b)}x^{2}` : par0 === 'impair' ? `${cf(F(a))}\\sin x${b < 0 ? '-' : '+'}${Math.abs(b) === 1 ? '' : Math.abs(b)}x^{3}` : `${cf(F(a))}\\cos x${b < 0 ? '-' : '+'}${Math.abs(b) === 1 ? '' : Math.abs(b)}\\sin x`;
      const cs = [['paire', (g) => [0.4, 1.3, 2.5].every((x) => near(g(-x), g(x), 1e-9))], ['impaire', (g) => [0.4, 1.3, 2.5].every((x) => near(g(-x), -g(x), 1e-9))], ['ni paire ni impaire', (g) => ![0.4, 1.3].every((x) => near(g(-x), g(x), 1e-9)) && ![0.4, 1.3].every((x) => near(g(-x), -g(x), 1e-9))], ['périodique', (g) => [0.4, 1.3].every((x) => near(g(x + 2 * Math.PI), g(x), 1e-6))]];
      const right = par0 === 'pair' ? 0 : par0 === 'impair' ? 1 : 2, why = ['paire : ' + M('f(-x)=f(x)') + '.', 'impaire : ' + M('f(-x)=-f(x)') + '.', 'ni paire ni impaire : ' + M('f(-x)') + ' n’est ni ' + M('f(x)') + ' ni ' + M('-f(x)') + '.'];
      const wrongs = [0, 1, 2, 3].filter((i) => i !== right);
      if (cs[3][1](f)) return this.make(r, level);
      const lab = (i) => (i === 3 ? '\\text{périodique de période }2\\pi' : `\\text{${cs[i][0]}}`);
      return mcq(r, `La fonction ${M(`f(x)=${tx}`)} est :`, opt(M(lab(right)), why[right], { i: right }), wrongs.map((i) => opt(M(lab(i)), i === 3 ? 'confond avec la périodicité (la partie polynomiale n’est pas périodique, ou la fonction n’est pas de cette période).' : 'se trompe sur la parité (calculer ' + M('f(-x)') + ').', { i })), (o) => cs[o.i][1](f) && (o.i === 3 ? false : true) === (o.i === right) || (o.i === right && cs[o.i][1](f)));
    } },

  { id: 't-trig2-tf', cls: C, chapter: 'terminale-14', domain: 'analyse', skill: 'Vrai ou faux sur les fonctions trigonométriques', fast: true,
    make(r, level) {
      const a = r.int(2, 99), b = r.nz(-9, 9), k = r.int(2, 99);
      const fam = {
        1: [
          () => ({ s: `La fonction cosinus est paire et la fonction sinus est impaire.`, v: true, j: `${M('\\cos(-x)=\\cos x')} et ${M('\\sin(-x)=-\\sin x')}.`, c: () => [0.3, 1.2].every((x) => near(Math.cos(-x), Math.cos(x), 1e-12) && near(Math.sin(-x), -Math.sin(x), 1e-12)) }),
          () => ({ s: `Pour tout réel ${M('x')}, ${M(`-${a}\\leqslant ${a}\\sin(x)\\leqslant ${a}`)}.`, v: true, j: `${M('-1\\leqslant\\sin x\\leqslant 1')}.`, c: () => [0.2, 1.5, 4].every((x) => Math.abs(a * Math.sin(x)) <= a) }),
          () => ({ s: `La dérivée de ${M('\\cos')} est ${M('\\sin')}.`, v: false, j: `${M("\\cos'=-\\sin")} et ${M("\\sin'=\\cos")}.`, c: () => Math.abs(nd(Math.cos, 1) - Math.sin(1)) > 0.1 }),
        ],
        2: [
          () => ({ s: `La fonction ${M(`x\\mapsto\\sin(${a}x)`)} est ${M('2\\pi')}-périodique.`, v: true, j: `${M(`\\sin(${a}(x+2\\pi))=\\sin(${a}x+${2 * a}\\pi)=\\sin(${a}x)`)} (${M('2\\pi')} est une période, la plus petite est ${M(`\\dfrac{2\\pi}{${a}}`)}).`, c: () => [0.3, 1.2].every((x) => near(Math.sin(a * (x + 2 * Math.PI)), Math.sin(a * x), 1e-6)) }),
          () => ({ s: `La fonction ${M(`f(x)=x+\\sin x`)} est périodique.`, v: false, j: `${M('f(x+T)-f(x)=T')} (car ${M('T')} est une période du sinus) : cette différence ne peut pas être nulle pour ${M('T\\neq 0')}.`.replace(/car .*période du sinus\)/, 'si T est une période du sinus'), c: () => Math.abs(1e3 + Math.sin(1e3) - (0 + Math.sin(0))) > 1 }),
          () => ({ s: `Pour tout réel ${M('x')}, ${M('\\cos(x+\\pi)=-\\cos x')}.`, v: true, j: 'Un demi-tour sur le cercle trigonométrique change le signe du cosinus.', c: () => [0.2, 1.3, 3].every((x) => near(Math.cos(x + Math.PI), -Math.cos(x), 1e-12)) }),
        ],
        3: [
          () => ({ s: `${M('\\lim_{x\\to 0}\\dfrac{\\sin x}{x}=0')}.`, v: false, j: `${M("\\lim_{h\\to 0}\\dfrac{\\sin h-\\sin 0}{h}=\\sin'(0)=\\cos 0=1")}.`, c: () => Math.abs(Math.sin(1e-6) / 1e-6 - 1) < 1e-9 }),
          () => ({ s: `${M(`\\lim_{x\\to 0}\\dfrac{\\sin(${k}x)}{x}=${k}`)}.`, v: true, j: `${M(`\\dfrac{\\sin(${k}x)}{x}=${k}\\times\\dfrac{\\sin(${k}x)}{${k}x}`)} et ${M('\\dfrac{\\sin X}{X}\\to 1')} quand ${M('X\\to 0')}.`, c: () => Math.abs(Math.sin(k * 1e-7) / 1e-7 - k) < 1e-6 }),
          () => ({ s: `La fonction ${M('f(x)=\\sin x')} est croissante sur ${M('[0\\,;\\,\\pi]')}.`, v: false, j: `${M("f'(x)=\\cos x")} est positive sur ${M('\\left[0\\,;\\,\\dfrac{\\pi}{2}\\right]')} puis négative : ${M('f')} croît puis décroît.`, c: () => Math.sin(1) < Math.sin(2) && Math.sin(3) < Math.sin(2) }),
          () => ({ s: `L’équation ${M('\\cos x=x')} admet une solution dans ${M('[0\\,;\\,1]')}.`, v: true, j: `${M('g(x)=\\cos x-x')} est continue, ${M('g(0)=1>0')} et ${M('g(1)=\\cos 1-1<0')} : théorème des valeurs intermédiaires.`, c: () => Math.cos(0) - 0 > 0 && Math.cos(1) - 1 < 0 }),
        ],
      };
      return tf(r.pick(fam[level])());
    } },

  { id: 't-trig2-error', cls: C, chapter: 'terminale-14', domain: 'analyse', skill: 'Trouver l’erreur dans l’étude d’une fonction trigonométrique', fast: false,
    make(r, level) {
      const A = r.int(1, 30), w = r.int(2, 9), kind = r.pick(level === 1 ? ['chain', 'sign'] : ['chain', 'sign', 'period']);
      const good = [`f(x)=${A === 1 ? '' : A}\\sin(${w}x)`, `f'(x)=${A * w}\\cos(${w}x)`, `f'(x)=0\\iff\\cos(${w}x)=0\\iff ${w}x=\\dfrac{\\pi}{2}+k\\pi\\iff x=\\dfrac{\\pi}{${2 * w}}+\\dfrac{k\\pi}{${w}}`];
      let lines = good, bad, why, fix, shown = 0;
      if (kind === 'chain') { lines = [good[0], `f'(x)=${A}\\cos(${w}x)`, `f'(x)=0\\iff\\cos(${w}x)=0\\iff x=\\dfrac{\\pi}{${2 * w}}+\\dfrac{k\\pi}{${w}}`]; bad = 1; why = `la dérivée d’une composée : ${M("(\\sin u)'=u'\\cos u")} avec ${M(`u'=${w}`)}, donc le facteur ${M(w)} apparaît.`; fix = M(good[1]); shown = 1; }
      else if (kind === 'sign') { lines = [good[0], `f'(x)=${-A * w}\\cos(${w}x)`, good[2]]; bad = 1; why = `la dérivée de ${M('\\sin')} est ${M('\\cos')} (c’est celle du cosinus qui porte un signe moins).`; fix = M(good[1]); shown = 2; }
      else { lines = [good[0], good[1], `f'(x)=0\\iff\\cos(${w}x)=0\\iff x=\\dfrac{\\pi}{2}+k\\pi`]; bad = 2; why = `il faut résoudre ${M(`${w}x=\\dfrac{\\pi}{2}+k\\pi`)} : on divise aussi ${M('k\\pi')} par ${M(w)}.`; fix = M(good[2]); shown = 3; }
      const f = (x) => A * Math.sin(w * x);
      return spot(`Pour chercher les réels où la dérivée de ${M(`f(x)=${A === 1 ? '' : A}\\sin(${w}x)`)} s’annule, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(good[2]), () => near(nd(f, 0.3), A * w * Math.cos(w * 0.3), 1e-3) && shown > 0 && Math.abs(A * w * Math.cos(w * (Math.PI / (2 * w)))) < 1e-9);
    } },

  { id: 't-trig2-study', cls: C, chapter: 'terminale-14', domain: 'analyse', skill: 'Étude de f(x) = A(sin x + sin(2x)/2) sur [0 ; π]', fast: false,
    make(r, level) {
      const A = r.int(1, 60), shape = r.pick(['sin', 'cos']);
      const f = shape === 'sin' ? (x) => A * (Math.sin(x) + Math.sin(2 * x) / 2) : (x) => A * (Math.cos(x) + Math.cos(2 * x) / 2), fp = shape === 'sin' ? (x) => A * (Math.cos(x) + Math.cos(2 * x)) : (x) => -A * (Math.sin(x) + Math.sin(2 * x));
      const Ft = shape === 'sin' ? `${A === 1 ? '' : A}\\left(\\sin x+\\dfrac{1}{2}\\sin 2x\\right)` : `${A === 1 ? '' : A}\\left(\\cos x+\\dfrac{1}{2}\\cos 2x\\right)`, fac = shape === 'sin' ? `${A === 1 ? '' : A}(2\\cos x-1)(\\cos x+1)` : `-${A === 1 ? '' : A}\\sin x(1+2\\cos x)`;
      const head = `Soit ${M(`f(x)=${Ft}`)} sur ${M('[0\\,;\\,\\pi]')}.`;
      const dtex = shape === 'sin' ? `f'(x)=${A === 1 ? '' : A}(\\cos x+\\cos 2x)=${A === 1 ? '' : A}(2\\cos^{2}x+\\cos x-1)` : `f'(x)=${A === 1 ? '' : -A === -1 ? '-' : -A}(\\sin x+\\sin 2x)=-${A === 1 ? '' : A}\\sin x(1+2\\cos x)`;
      if (level === 1) return { q: `${head} Calculer ${M("f'(x)")} et vérifier que ${M(`f'(x)=${fac}`)}.`, a: `${M(dtex)}. On utilise ${M('\\cos 2x=2\\cos^{2}x-1')}${shape === 'sin' ? `, soit ${M(`2\\cos^{2}x+\\cos x-1=(2\\cos x-1)(\\cos x+1)`)}` : ` et ${M('\\sin 2x=2\\sin x\\cos x')}`}. Donc ${M(`f'(x)=${fac}`)}.`, ok: () => [0.4, 1.1, 2.6].every((x) => near(nd(f, x), fp(x), 1e-3) && near(fp(x), shape === 'sin' ? A * (2 * Math.cos(x) - 1) * (Math.cos(x) + 1) : -A * Math.sin(x) * (1 + 2 * Math.cos(x)), 1e-9)) };
      const z = shape === 'sin' ? Math.PI / 3 : (2 * Math.PI) / 3, zt = shape === 'sin' ? '\\dfrac{\\pi}{3}' : '\\dfrac{2\\pi}{3}';
      const fz = f(z), exact = shape === 'sin' ? `\\dfrac{${3 * A}\\sqrt{3}}{4}` : `-\\dfrac{${3 * A}}{4}`;
      const incArr = shape === 'sin' ? [`f\\text{ croît sur }\\left[0\\,;\\,${zt}\\right]\\text{ puis décroît sur }\\left[${zt}\\,;\\,\\pi\\right]`] : [`f\\text{ décroît sur }\\left[0\\,;\\,${zt}\\right]\\text{ puis croît sur }\\left[${zt}\\,;\\,\\pi\\right]`];
      const rev = `${shape === 'sin' ? 'maximum' : 'minimum'}`;
      if (level === 2) return { q: `${head} On admet que ${M(`f'(x)=${fac}`)}. Étudier le signe de ${M("f'")} sur ${M('[0\\,;\\,\\pi]')} et dresser le tableau de variations de ${M('f')}.`, a: `${shape === 'sin' ? `${M('\\cos x+1\\geqslant 0')} et ${M('2\\cos x-1>0\\iff x<\\dfrac{\\pi}{3}')}` : `${M('\\sin x\\geqslant 0')} sur ${M('[0\\,;\\,\\pi]')} et ${M('1+2\\cos x>0\\iff x<\\dfrac{2\\pi}{3}')}`}. ${M(incArr[0])}. ${M(`f(0)=${shape === 'sin' ? 0 : fracTex(F(3 * A, 2))}`)}, ${M(`f(\\pi)=${shape === 'sin' ? 0 : fracTex(F(-A * 1 + A / 2 * 0, 1)).replace('0', '') || ''}`.replace(/=$/, `=${-A + A / 2}`))}`.replace(/, \\\(f\(\\pi\)=[^)]*\\\)/, `, ${M(`f(\\pi)=${shape === 'sin' ? 0 : fracTex(F(-A * 2 + A, 2))}`)}`) + '.', ok: () => (shape === 'sin' ? fp(z - 0.2) > 0 && fp(z + 0.2) < 0 : fp(z - 0.2) < 0 && fp(z + 0.2) > 0) && near(fp(z), 0, 1e-9) && fp(Math.PI - 0.01) * (shape === 'sin' ? 1 : 1) !== undefined };
      return { q: `${head} 1) Montrer que ${M(`f'(x)=${fac}`)}. 2) Dresser le tableau de variations de ${M('f')}. 3) En déduire que ${M('f')} admet un ${rev} sur ${M('[0\\,;\\,\\pi]')} et donner sa valeur exacte.`, a: `1) ${M(dtex)} puis factorisation. 2) ${M(incArr[0])}. 3) Le ${rev} est atteint en ${M(`x=${zt}`)} et vaut ${M(`f\\left(${zt}\\right)=${exact}`)}.`, ok: () => (shape === 'sin' ? fp(z - 0.2) > 0 && fp(z + 0.2) < 0 : fp(z - 0.2) < 0 && fp(z + 0.2) > 0) && near(fz, shape === 'sin' ? (3 * A * Math.sqrt(3)) / 4 : (-3 * A) / 4, 1e-9) };
    } },

  { id: 't-trig2-lim', cls: C, chapter: 'terminale-14', domain: 'analyse', skill: 'Limites et nombres dérivés avec sinus et cosinus', fast: false,
    make(r, level) {
      const a = r.int(2, 40), b = r.int(2, 40), c1 = r.int(1, 9);
      if (level === 1) { const f = (x) => (c1 * Math.sin(a * x)) / (b * x), lm = F(c1 * a, b); return { q: `Déterminer ${M(`\\lim_{x\\to 0}\\dfrac{${c1 === 1 ? '' : c1}\\sin(${a}x)}{${b}x}`)}.`, a: `${M(`\\dfrac{${c1 === 1 ? '' : c1}\\sin(${a}x)}{${b}x}=\\dfrac{${c1 * a}}{${b}}\\times\\dfrac{\\sin(${a}x)}{${a}x}`)} et ${M('\\lim_{X\\to 0}\\dfrac{\\sin X}{X}=1')} (nombre dérivé de ${M('\\sin')} en ${M(0)}) : la limite vaut ${M(fracTex(lm))}.`, ok: () => Math.abs(f(1e-8) - val(lm)) < 1e-5 }; }
      if (level === 2) { const f = (x) => Math.sin(a * x) / Math.sin(b * x), lim = F(a, b); return { q: `Déterminer ${M(`\\lim_{x\\to 0}\\dfrac{\\sin(${a}x)}{\\sin(${b}x)}`)}.`, a: `${M(`\\dfrac{\\sin(${a}x)}{\\sin(${b}x)}=\\dfrac{\\sin(${a}x)}{${a}x}\\times\\dfrac{${b}x}{\\sin(${b}x)}\\times\\dfrac{${a}}{${b}}`)} : les deux premiers facteurs tendent vers ${M(1)}, d’où ${M(`\\lim=${fracTex(lim)}`)}.`, ok: () => Math.abs(f(1e-7) - val(lim)) < 1e-6 }; }
      const f = (x) => (c1 * (1 - Math.cos(a * x))) / (b * x * x), lim = F(c1 * a * a, 2 * b);
      return { q: `Déterminer ${M(`\\lim_{x\\to 0}\\dfrac{${c1 === 1 ? '' : c1}\\left(1-\\cos(${a}x)\\right)}{${b}x^{2}}`)}. (On pourra utiliser ${M('1-\\cos t=2\\sin^{2}\\dfrac{t}{2}')}.)`, a: `${M(`1-\\cos(${a}x)=2\\sin^{2}\\left(\\dfrac{${a}x}{2}\\right)`)}, donc l’expression vaut ${M(`\\dfrac{${c1 === 1 ? '' : c1}\\times 2}{${b}}\\times\\dfrac{${a * a}}{4}\\times\\left(\\dfrac{\\sin\\frac{${a}x}{2}}{\\frac{${a}x}{2}}\\right)^{2}`)} qui tend vers ${M(`\\dfrac{${c1 * a * a}}{${2 * b}}=${fracTex(lim)}`)}.`, ok: () => Math.abs(f(1e-3) - val(lim)) < 2e-3 * Math.max(1, Math.abs(val(lim))) && Math.abs((c1 * 2 * Math.sin((a * 1e-3) / 2) ** 2) / (b * 1e-6) - f(1e-3)) < 1e-6 * Math.max(1, Math.abs(val(lim))) + 1e-6 };
    } },

  { id: 't-trig2-period', cls: C, chapter: 'terminale-14', domain: 'analyse', skill: 'Parité, périodicité et intervalle d’étude', fast: false,
    make(r, level) {
      const gcd2 = (x, y) => (y ? gcd2(y, x % y) : x);
      const isPeriod = (g, p) => [0.13, 0.77, 1.9, 3.3, 5.1].every((x) => Math.abs(g(x + p) - g(x)) < 1e-9);
      if (level === 1) { const kinds = [['\\sin x\\cos x', (x) => Math.sin(x) * Math.cos(x), 'impaire', 'produit d’une fonction impaire et d’une fonction paire'], ['\\cos x+\\sin^{2}x', (x) => Math.cos(x) + Math.sin(x) ** 2, 'paire', 'somme de deux fonctions paires'], ['\\sin x+\\sin 3x', (x) => Math.sin(x) + Math.sin(3 * x), 'impaire', 'somme de deux fonctions impaires'], ['x\\cos x', (x) => x * Math.cos(x), 'impaire', 'produit d’une impaire et d’une paire'], ['x\\sin x', (x) => x * Math.sin(x), 'paire', 'produit de deux impaires'], ['\\cos x+\\sin x', (x) => Math.cos(x) + Math.sin(x), 'ni paire ni impaire', '']];
        const [t, g, ans, why] = r.pick(kinds), k = r.int(1, 40); const h = (x) => k * g(x); const tx = `${k === 1 ? '' : k}${t.includes('+') ? `\\left(${t}\\right)` : t}`;
        const par0 = [0.4, 1.3, 2.2].every((x) => Math.abs(h(-x) - h(x)) < 1e-9), imp = [0.4, 1.3, 2.2].every((x) => Math.abs(h(-x) + h(x)) < 1e-9);
        return { q: `Étudier la parité de ${M(`f(x)=${tx}`)} sur ${M(R)}.`, a: `${M('f')} est définie sur ${M(R)}, symétrique par rapport à ${M(0)}. ${M(`f(-x)=${ans === 'paire' ? 'f(x)' : ans === 'impaire' ? '-f(x)' : '\\cos x-\\sin x'}`)} : ${why ? why + ', donc ' : ''}${M('f')} est ${ans}.`, ok: () => (ans === 'paire' ? par0 : ans === 'impaire' ? imp : !par0 && !imp) }; }
      const w1 = r.int(1, 8), w2 = r.int(1, 8), a = r.nz(-5, 5), b = r.nz(-5, 5), g0 = gcd2(w1, w2), T = F(2, g0), g = (x) => a * Math.cos(w1 * x) + b * Math.sin(w2 * x);
      const Ttex = g0 === 1 ? '2\\pi' : g0 === 2 ? '\\pi' : `\\dfrac{2\\pi}{${g0}}`;
      if (level === 2) return { q: `Quelle est la plus petite période strictement positive de ${M(`f(x)=${polyTex([a], 'x').slice(0, 0)}${cf(F(a))}\\cos(${w1 === 1 ? '' : w1}x)${b < 0 ? '-' : '+'}${Math.abs(b) === 1 ? '' : Math.abs(b)}\\sin(${w2 === 1 ? '' : w2}x)`)} ?`, a: `${M(`x\\mapsto\\cos(${w1}x)`)} a pour périodes les multiples de ${M(`\\dfrac{2\\pi}{${w1}}`)} et ${M(`x\\mapsto\\sin(${w2}x)`)} les multiples de ${M(`\\dfrac{2\\pi}{${w2}}`)} ; les périodes communes sont les multiples de ${M(`\\dfrac{2\\pi}{\\text{pgcd}(${w1},${w2})}`)} : la plus petite est ${M(Ttex)}.`, ok: () => { const p = (2 * Math.PI) / g0; return isPeriod(g, p) && Array.from({ length: 39 }, (_, i) => i + 2).every((k) => !isPeriod(g, p / k)); } };
      return { q: `Soit ${M(`f(x)=${cf(F(a))}\\cos(${w1 === 1 ? '' : w1}x)${b < 0 ? '-' : '+'}${Math.abs(b) === 1 ? '' : Math.abs(b)}\\sin(${w2 === 1 ? '' : w2}x)`)}. 1) Montrer que ${M('f')} est ${M(Ttex)}-périodique. 2) Sur quel intervalle de longueur ${M(Ttex)} suffit-il d’étudier ${M('f')} ?`, a: `1) ${M(`f\\left(x+${Ttex}\\right)=${cf(F(a))}\\cos\\left(${w1 === 1 ? '' : w1}x+${w1 / g0}\\times 2\\pi\\right)${b < 0 ? '-' : '+'}${Math.abs(b) === 1 ? '' : Math.abs(b)}\\sin\\left(${w2 === 1 ? '' : w2}x+${w2 / g0}\\times 2\\pi\\right)=f(x)`)} car ${M(`${w1}\\times\\dfrac{2\\pi}{${g0}}`)} et ${M(`${w2}\\times\\dfrac{2\\pi}{${g0}}`)} sont des multiples de ${M('2\\pi')}. 2) Il suffit d’étudier ${M('f')} sur ${M(`\\left[0\\,;\\,${Ttex}\\right]`)} (ou tout intervalle de cette longueur), puis de prolonger par périodicité.`, ok: () => isPeriod(g, (2 * Math.PI) / g0) && (w1 / g0) % 1 === 0 && (w2 / g0) % 1 === 0 && T.n > 0 };
    } },
];
