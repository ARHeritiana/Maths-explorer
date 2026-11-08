// Terminale STMG generators, fourth file (chapters 07 and 08: variables aléatoires et loi binomiale, révisions et consolidation): four-choice
// questions with one typical error per wrong option, true/false, find-the-error, contexts and multi-step items with seeded parameters. Same
// contract as templates-stmg.js; every ok() recomputes the answer another way (exact fractions, recurrence for binomial terms, brute force).
import { F, add, sub, mul, div, val, eq, M, fracTex, numTex, roundTex, sgn, par, binom } from './engine.js';
import { tf, spot } from './premiere-kit.js';
import { dec, parT } from './seconde-kit.js';
import { qcmNum } from './seconde-kit-2.js';
import { safeRound, binomP, binomCdf, euro } from './stmg-kit.js';

const C = 'stmg';
const pw = (b, k) => (k === 1 ? b : `${b}^{${k}}`);
// a probability written with its relation: '\\approx 0{,}058', '<10^{-3}' for a value that would round to 0, '>0{,}999' for one that would round to 1
const rel = (x, k = 3) => (x < 0.5 * 10 ** -k ? `<10^{-${k}}` : 1 - x < 0.5 * 10 ** -k ? `>${roundTex(1 - 10 ** -k, k)}` : `\\approx ${roundTex(x, k)}`);
const dcs = (z) => String(z).replace('.', '{,}');
const nf = (x) => (Number.isInteger(x) ? `${x}` : roundTex(x, 2));
// P(X = k) for B(n, p) by the ratio of consecutive terms (another route than the definition with binomial coefficients)
const binomRec = (n, p, k) => { let t = (1 - p) ** n; for (let i = 0; i < k; i++) t *= ((n - i) / (i + 1)) * (p / (1 - p)); return t; };
const lawTex = (xs, ps) => `\\begin{array}{c|${'c'.repeat(xs.length)}}x_i&${xs.join('&')}\\\\\\hline P(X=x_i)&${ps.map((p) => numTex(p)).join('&')}\\end{array}`;
const randomLaw = (r, k) => { const xs = Array.from({ length: k }, (_, i) => r.int(-4, 3) + 4 * i - 2 * i).sort((a, b) => a - b); const uniq = [...new Set(xs)]; if (uniq.length < k) return randomLaw(r, k); const cuts = r.shuffle(Array.from({ length: 19 }, (_, i) => i + 1)).slice(0, k - 1).sort((a, b) => a - b); const w = [cuts[0], ...cuts.slice(1).map((c, i) => c - cuts[i]), 20 - cuts[k - 2]]; return { xs: uniq, ps: w.map((x) => F(x, 20)) }; };
const mean = (xs, ps) => xs.reduce((s, x, i) => add(s, mul(F(x), ps[i])), F(0));

export const stmg4 = [
  // ============================ 07 Variables aléatoires et loi binomiale ============================
  { id: 'm4-rv-qcm', cls: C, chapter: 'stmg-07', domain: 'stats-proba', skill: 'QCM sur les variables aléatoires et la loi binomiale', fast: true,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['esp', 'ident'] : ['esp', 'ident', 'enp']);
      if (kind === 'esp') {
        const { xs, ps } = randomLaw(r, r.int(3, 4)), E = mean(xs, ps), mx = F(xs.reduce((a, b) => a + b, 0), xs.length);
        return qcmNum(r, `Soit ${M('X')} de loi ${M(lawTex(xs, ps))} L’espérance de ${M('X')} est :`, [E, `${M('E(X)=\\sum x_iP(X=x_i)')} : on multiplie chaque valeur par sa probabilité avant d’additionner.`],
          [[mx, 'fait la moyenne des valeurs sans les pondérer.'], [xs[ps.reduce((bi, p, i) => (val(p) > val(ps[bi]) ? i : bi), 0)] !== undefined ? F(xs[ps.reduce((bi, p, i) => (val(p) > val(ps[bi]) ? i : bi), 0)]) : F(0), 'donne la valeur la plus probable (le mode).'], [xs.reduce((s, x, i) => add(s, mul(F(x * x), ps[i])), F(0)), 'calcule ' + M('E(X^{2})') + '.'], [add(E, F(1)), 'se trompe d’une unité.']], (w) => M(fracTex(w)), (w) => { let s = 0; xs.forEach((x, i) => { s += x * val(ps[i]); }); return Math.abs(val(w) - s) < 1e-9; });
      }
      if (kind === 'ident') {
        const n = r.int(5, 12), p = r.pick([0.1, 0.2, 0.25, 0.3, 0.5]), what = r.pick([['pièces défectueuses', 'défectueuse'], ['clients qui achètent', 'achète'], ['réponses exactes', 'exacte']]);
        return qcmNum(r, `On prélève au hasard ${M(n)} éléments de façon indépendante ; chacun est ${what[1]} avec la probabilité ${M(dcs(p))}. Le nombre ${M('X')} de ${what[0]} suit la loi :`, [{ n, p }, `${M(n)} répétitions identiques et indépendantes d’une épreuve de Bernoulli de paramètre ${M(dcs(p))} : ${M(`\\mathcal{B}(${n}\\,;\\,${dcs(p)})`)}.`],
          [[{ n: p * 100, p: n / 100 }, 'échange les paramètres ' + M('n') + ' et ' + M('p') + '.'], [{ n, p: Math.round((1 - p) * 100) / 100 }, 'prend la probabilité du contraire.'], [{ n: n + 1, p }, 'se trompe sur le nombre de répétitions.']], (w) => M(`\\mathcal{B}(${w.n}\\,;\\,${dcs(Math.round(w.p * 1000) / 1000)})`), (w) => w.n === n && Math.abs(w.p - p) < 1e-12);
      }
      const n = r.int(5, 40), p = r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]), E = n * p;
      return qcmNum(r, `Si ${M('X')} suit la loi binomiale ${M(`\\mathcal{B}(${n}\\,;\\,${dcs(p)})`)}, l’espérance de ${M('X')} est :`, [E, `${M(`E(X)=np=${n}\\times ${dcs(p)}`)}.`],
        [[n + p, 'additionne ' + M('n') + ' et ' + M('p') + '.'], [n * (1 - p), 'utilise ' + M('n(1-p)') + '.'], [n * p * (1 - p), 'donne la variance.'], [n / p, 'divise au lieu de multiplier.']], (w) => M(dcs(Math.round(w * 1000) / 1000)), (w) => Math.abs(w - Array.from({ length: n }, () => p).reduce((s, x) => s + x, 0)) < 1e-9);
    } },

  { id: 'm4-rv-tf', cls: C, chapter: 'stmg-07', domain: 'stats-proba', skill: 'Vrai ou faux sur les lois de probabilité', fast: false,
    make(r, level) {
      const kind = r.pick(['law', 'p0', 'esp']);
      if (kind === 'law') { const k = r.int(3, 4), { xs, ps } = randomLaw(r, k), yes = r.next() < 0.5, shown = yes ? ps : ps.map((p, i) => (i === 0 ? add(p, F(1, 20)) : p)), sum = shown.reduce((s, p) => add(s, p), F(0)), ok = eq(sum, F(1));
        return tf({ s: `Le tableau ${M(lawTex(xs, shown))} définit une loi de probabilité.`, v: ok, c: () => ok === (Math.abs(shown.reduce((s, p) => s + val(p), 0) - 1) < 1e-12 && shown.every((p) => val(p) >= 0)), j: `La somme des probabilités vaut ${M(numTex(sum))}${ok ? ' : c’est bien ' + M(1) + '.' : ', différente de ' + M(1) + '.'}` }); }
      if (kind === 'p0') { const n = r.int(3, 6), p = r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]), right = r.next() < 0.5, claim = right ? (1 - p) ** n : 1 - (1 - p) ** n, ok = right;
        return tf({ s: `Si ${M('X')} suit la loi ${M(`\\mathcal{B}(${n}\\,;\\,${dcs(p)})`)}, alors ${M('P(X=0)')} vaut ${M(dcs(roundTex(claim, 4)))} (valeur arrondie au dix-millième).`, v: ok, c: () => (Math.abs(roundTex(binomRec(n, p, 0), 4).replace('{,}', '.') - roundTex(claim, 4).replace('{,}', '.')) < 1e-9) === ok && Math.abs(binomP(n, p, 0) - (1 - p) ** n) < 1e-12,
          j: `${M(`P(X=0)=\\binom{${n}}{0}\\times 1\\times ${dcs(1 - p)}^{${n}}=${dcs(1 - p)}^{${n}}\\approx ${roundTex((1 - p) ** n, 4)}`)}${ok ? '.' : `, et non ${M(roundTex(claim, 4))} (cette valeur est ${M('P(X\\geqslant 1)')}).`}` }); }
      const n = r.int(6, 30), p = r.pick([0.1, 0.2, 0.25, 0.4, 0.5]), claim = r.pick([n * p, n * (1 - p), n * p * (1 - p)]), ok = Math.abs(claim - n * p) < 1e-12;
      return tf({ s: `Si ${M('X')} suit la loi binomiale ${M(`\\mathcal{B}(${n}\\,;\\,${dcs(p)})`)}, son espérance est ${dcs(Math.round(claim * 1000) / 1000)}.`, v: ok, c: () => ok === (Math.abs(claim - Array.from({ length: n }, (_, i) => p).reduce((s, x) => s + x, 0)) < 1e-9),
        j: `${M(`E(X)=np=${n}\\times ${dcs(p)}=${dcs(Math.round(n * p * 1000) / 1000)}`)}${ok ? '.' : `, et non ${M(dcs(Math.round(claim * 1000) / 1000))}.`}` });
    } },

  { id: 'm4-rv-error', cls: C, chapter: 'stmg-07', domain: 'stats-proba', skill: 'Trouver l’erreur sur une espérance ou une loi binomiale', fast: false,
    make(r, level) {
      if (r.next() < 0.5) {
        const { xs, ps } = randomLaw(r, 3), E = mean(xs, ps), bad = F(xs.reduce((a, b) => a + b, 0), 3);
        if (eq(E, bad)) return this.make(r, level);
        return spot(`Un élève calcule l’espérance de ${M('X')} de loi ${M(lawTex(xs, ps))}`, [M(`E(X)=\\dfrac{${xs.map((x) => par(x)).join('+')}}{3}`), M(`E(X)=${fracTex(bad)}`)], 0, 'l’espérance est la moyenne pondérée par les probabilités.', M(`E(X)=${xs.map((x, i) => `${par(x)}\\times ${numTex(ps[i])}`).join('+')}`), M(`E(X)=${fracTex(E)}`), () => { let s = 0; xs.forEach((x, i) => { s += x * val(ps[i]); }); return Math.abs(s - val(E)) < 1e-12 && !eq(E, bad); });
      }
      const n = r.int(4, 8), k = r.int(1, n - 1), p = r.pick([0.3, 0.4, 0.5, 0.6]), good = binomRec(n, p, k), bad = p ** k * (1 - p) ** (n - k);
      if (Math.abs(good - bad) < 1e-9 || safeRound(good, 4) === null || safeRound(bad, 4) === null || bad < 0.001) return this.make(r, level);
      return spot(`${M('X')} suit ${M(`\\mathcal{B}(${n}\\,;\\,${dcs(p)})`)}. Un élève calcule ${M(`P(X=${k})`)}.`, [M(`P(X=${k})=${pw('p', k)}(1-p)^{${n - k}}`.replace('^{1}', '')), M(`P(X=${k})=${pw(dcs(p), k)}\\times ${pw(dcs(1 - p), n - k)}\\approx ${roundTex(bad, 4)}`)], 0, `il manque le coefficient binomial ${M(`\\binom{${n}}{${k}}=${binom(n, k)}`)} (nombre de chemins).`, M(`P(X=${k})=\\binom{${n}}{${k}}${pw('p', k)}(1-p)^{${n - k}}`.replace('^{1}', '')), M(`P(X=${k})=${binom(n, k)}\\times ${pw(dcs(p), k)}\\times ${pw(dcs(1 - p), n - k)}\\approx ${roundTex(good, 4)}`), () => Math.abs(good - binomP(n, p, k)) < 1e-12 && Math.abs(good / bad - binom(n, k)) < 1e-9);
    } },

  { id: 'm4-rv-law', cls: C, chapter: 'stmg-07', domain: 'stats-proba', skill: 'Espérance, variance et écart type', fast: true,
    make(r, level) {
      const { xs, ps } = randomLaw(r, level === 1 ? 3 : 4), E = mean(xs, ps);
      if (level === 1) return { q: `Une variable aléatoire ${M('X')} a pour loi ${M(lawTex(xs, ps))} Calculer ${M('E(X)')}.`, a: `${M(`E(X)=${xs.map((x, i) => `${par(x)}\\times ${numTex(ps[i])}`).join('+')}=${numTex(E)}`)}.`, ok: () => { let s = 0; xs.forEach((x, i) => { s += x * val(ps[i]); }); return Math.abs(s - val(E)) < 1e-12; } };
      const V = sub(xs.reduce((s, x, i) => add(s, mul(F(x * x), ps[i])), F(0)), mul(E, E)), sd = Math.sqrt(val(V)), s2 = safeRound(sd, 2);
      if (s2 === null) return this.make(r, level);
      if (level === 2) return { q: `Une variable aléatoire ${M('X')} a pour loi ${M(lawTex(xs, ps))} Calculer ${M('E(X)')}, ${M('V(X)')} et ${M('\\sigma(X)')} (arrondi au centième).`, a: `${M(`E(X)=${numTex(E)}`)} ; ${M(`V(X)=E(X^{2})-E(X)^{2}=${numTex(xs.reduce((s, x, i) => add(s, mul(F(x * x), ps[i])), F(0)))}-${numTex(mul(E, E))}=${numTex(V)}`)} ; ${M(`\\sigma(X)=\\sqrt{${numTex(V)}}\\approx ${s2}`)}.`,
        ok: () => { let v = 0; xs.forEach((x, i) => { v += val(ps[i]) * (x - val(E)) ** 2; }); return Math.abs(v - val(V)) < 1e-12 && roundTex(Math.sqrt(v), 2) === s2; } };
      const mise = r.int(1, 6), gains = xs.map((x) => x), jeu = gains.map((g) => g - mise), EG = sub(E, F(mise));
      return { q: `Un jeu coûte ${M(euro(mise))} à chaque partie. Le gain brut ${M('G')} (en euros) a pour loi ${M(lawTex(xs, ps))} 1) Calculer l’espérance du gain brut. 2) Quel est le gain algébrique moyen par partie, mise comprise ? Le jeu est-il favorable au joueur ?`, a: `1) ${M(`E(G)=${numTex(E)}`)}. 2) ${M(`E(G)-${mise}=${numTex(EG)}\\ \\text{€}`)} : le jeu est ${val(EG) > 0 ? 'favorable au joueur' : val(EG) < 0 ? 'défavorable au joueur' : 'équitable'}.`,
        ok: () => { let g = 0; jeu.forEach((x, i) => { g += x * val(ps[i]); }); return Math.abs(g - val(EG)) < 1e-12; } };
    } },

  { id: 'm4-bin-prob', cls: C, chapter: 'stmg-07', domain: 'stats-proba', skill: 'Probabilités de la loi binomiale', fast: true,
    make(r, level) {
      const n = r.int(5, 20), p = r.pick([0.05, 0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6]), k = r.int(1, Math.min(n - 1, 8)), what = r.pick(level === 1 ? ['eq'] : ['eq', 'atleast', 'atmost']);
      const stem = `${M('X')} suit la loi binomiale ${M(`\\mathcal{B}(${n}\\,;\\,${dcs(p)})`)}. À l’aide de la calculatrice, donner une valeur approchée au millième de `;
      if (what === 'eq') { const v = binomP(n, p, k), s = safeRound(v, 3); if (s === null || v < 0.001) return this.make(r, level); return { q: `${stem}${M(`P(X=${k})`)}.`, a: `${M(`P(X=${k})=\\binom{${n}}{${k}}\\times ${pw(dcs(p), k)}\\times ${pw(dcs(1 - p), n - k)}${rel(v)}`)}.`, ok: () => rel(binomRec(n, p, k)) === rel(v) }; }
      if (what === 'atleast') { const v = 1 - (1 - p) ** n, s = safeRound(v, 3); if (s === null || v > 0.999) return this.make(r, level); return { q: `${stem}${M('P(X\\geqslant 1)')}.`, a: `${M('P(X\\geqslant 1)=1-P(X=0)')} ${M(`=1-${dcs(1 - p)}^{${n}}${rel(v)}`)}.`, ok: () => { let t = 0; for (let i = 1; i <= n; i++) t += binomRec(n, p, i); return rel(t) === rel(v); } }; }
      const v = binomCdf(n, p, k), s = safeRound(v, 3); if (s === null || v > 0.999 || v < 0.001) return this.make(r, level);
      return { q: `${stem}${M(`P(X\\leqslant ${k})`)}.`, a: `${M(`P(X\\leqslant ${k})=P(X=0)+P(X=1)+\\dots+P(X=${k})${rel(v)}`)} (fonction de répartition de la calculatrice).`, ok: () => { let t = 0; for (let i = 0; i <= k; i++) t += binomRec(n, p, i); return rel(t) === rel(v); } };
    } },

  { id: 'm4-bin-ctx', cls: C, chapter: 'stmg-07', domain: 'stats-proba', skill: 'Contexte : lot de pièces, espérance et seuil', fast: false,
    make(r, level) {
      const p = r.int(1, 25) / 100, n = r.int(8, 40), E = n * p, P0 = (1 - p) ** n, s0 = safeRound(P0, 3), s1 = safeRound(1 - P0, 3);
      if (s0 === null || s1 === null || P0 < 0.001 || P0 > 0.999) return this.make(r, level);
      const base = `Dans une usine, chaque pièce est défectueuse avec la probabilité ${M(dcs(p))}, indépendamment des autres. On prélève un lot de ${M(n)} pièces ; ${M('X')} désigne le nombre de pièces défectueuses.`;
      if (level < 3) return { q: `${base} 1) Quelle est la loi de ${M('X')} ? 2) Calculer l’espérance de ${M('X')}. 3) Calculer la probabilité qu’aucune pièce ne soit défectueuse, puis qu’il y en ait au moins une (au millième).`, a: `1) ${M(`\\mathcal{B}(${n}\\,;\\,${dcs(p)})`)}. 2) ${M(`E(X)=${n}\\times ${dcs(p)}=${dcs(Math.round(E * 1e6) / 1e6)}`)}. 3) ${M(`P(X=0)=${dcs(1 - p)}^{${n}}\\approx ${s0}`)} ; ${M(`P(X\\geqslant 1)=1-P(X=0)\\approx ${s1}`)}.`, ok: () => Math.abs(E - n * p) < 1e-9 && roundTex(binomRec(n, p, 0), 3) === s0 && roundTex(1 - binomRec(n, p, 0), 3) === s1 };
      const target = r.pick([0.8, 0.85, 0.9, 0.93, 0.95, 0.99]); let m = 1; while (1 - (1 - p) ** m < target) m++;
      return { q: `${base.replace(`On prélève un lot de ${M(n)} pièces ; ${M('X')} désigne le nombre de pièces défectueuses.`, `On prélève un lot de ${M('m')} pièces.`)} Quel est le plus petit nombre ${M('m')} de pièces à prélever pour que la probabilité d’obtenir au moins une pièce défectueuse soit supérieure ou égale à ${M(dcs(target))} ?`, a: `${M(`1-${dcs(1 - p)}^{m}\\geqslant ${dcs(target)}\\iff ${dcs(1 - p)}^{m}\\leqslant ${dcs(Math.round((1 - target) * 100) / 100)}`)}. Avec la calculatrice : ${M(`m=${m - 1}`)} donne ${M(roundTex(1 - (1 - p) ** (m - 1), 3))} et ${M(`m=${m}`)} donne ${M(roundTex(1 - (1 - p) ** m, 3))} : ${M(`m=${m}`)}.`,
        ok: () => 1 - (1 - p) ** m >= target - 1e-12 && 1 - (1 - p) ** (m - 1) < target && Math.abs(Math.log(1 - target) / Math.log(1 - p) - (m - 1)) < 1 + 1e-9 };
    } },

  // ============================ 08 Révisions et consolidation ============================
  { id: 'm4-rev-qcm', cls: C, chapter: 'stmg-08', domain: 'nombres', skill: 'QCM de révision : indices, points de pourcentage, TVA', fast: true,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['index', 'tva'] : ['index', 'tva', 'points']);
      if (kind === 'index') {
        const I = r.pick([104, 108, 112, 115, 120, 125, 130, 140, 150, 80, 85, 90]), good = I - 100;
        return qcmNum(r, `L’indice d’un prix, de base 100 en 2015, vaut ${M(I)} en 2022. Entre 2015 et 2022 le prix a ${good > 0 ? 'augmenté' : 'diminué'} de :`, [Math.abs(good), `${M(`\\dfrac{${I}-100}{100}=${dcs(good / 100)}`)} soit ${M(`${Math.abs(good)}\\,\\%`)}.`],
          [[I, `confond l’indice ${M(I)} avec le taux d’évolution.`], [Math.abs(good) / 2, 'divise le taux par 2.'], [Math.round((Math.abs(good) / I) * 10000) / 100, 'divise par l’indice final au lieu de l’indice de base.'], [100 - Math.abs(good), 'prend le complément à 100.']], (w) => M(`${dcs(Math.round(Math.abs(w) * 100) / 100)}\\,\\%`), (w) => Math.abs(w - Math.abs(I - 100)) < 1e-9);
      }
      if (kind === 'tva') {
        const t = r.pick([5.5, 10, 20]), HT = r.pick([50, 80, 100, 120, 200, 250, 400]), TTC = HT * (1 + t / 100);
        return qcmNum(r, `Un produit coûte ${M(euro(Math.round(TTC * 100) / 100))} toutes taxes comprises (TVA à ${M(`${dcs(t)}\\,\\%`)}). Son prix hors taxes est :`, [HT, `${M(`\\text{prix HT}=\\dfrac{\\text{prix TTC}}{${dcs(1 + t / 100)}}=\\dfrac{${dcs(Math.round(TTC * 100) / 100)}}{${dcs(1 + t / 100)}}`)}.`],
          [[Math.round(TTC * (1 - t / 100) * 100) / 100, `retranche ${M(`${dcs(t)}\\,\\%`)} du prix TTC : ce n’est pas l’évolution réciproque.`], [Math.round((TTC - t) * 100) / 100, 'retranche le taux en euros.'], [Math.round(TTC * (1 + t / 100) * 100) / 100, 'applique encore la TVA.']], (w) => M(euro(w)), (w) => Math.abs(w * (1 + t / 100) - TTC) < 0.006);
      }
      const a = r.pick([8, 10, 12, 15, 20, 25]), b = a + r.pick([2, 3, 4, 5]), rel = ((b - a) / a) * 100;
      return qcmNum(r, `Le taux de chômage d’une région passe de ${M(`${a}\\,\\%`)} à ${M(`${b}\\,\\%`)}. La variation en points de pourcentage est :`, [{ t: `${b - a}\\text{ points}`, v: b - a, k: 'pts' }, `on soustrait les taux : ${M(`${b}-${a}=${b - a}`)} points de pourcentage.`],
        [[{ t: `${dcs(Math.round(rel * 100) / 100)}\\,\\%`, v: rel, k: 'pct' }, 'donne la variation relative (en pourcentage) et non la variation en points.'], [{ t: `${dcs(Math.round((b / a) * 100) / 100)}\\text{ points}`, v: b / a, k: 'pts' }, 'divise les taux au lieu de les soustraire.'], [{ t: `${a + b}\\text{ points}`, v: a + b, k: 'pts' }, 'additionne les taux.']], (o) => M(o.t), (o) => o.k === 'pts' && Math.abs(o.v - (b - a)) < 1e-9);
    } },

  { id: 'm4-rev-tf', cls: C, chapter: 'stmg-08', domain: 'nombres', skill: 'Vrai ou faux de révision : indices, TVA, taux moyen', fast: false,
    make(r, level) {
      const kind = r.pick(['tva', 'avg', 'index']);
      if (kind === 'tva') { const t = r.pick([5.5, 10, 20]), price = r.int(20, 500), right = r.next() < 0.5, claim = right ? `en divisant le prix TTC par ${dcs(1 + t / 100)}` : `en multipliant le prix TTC par ${dcs(Math.round((1 - t / 100) * 1000) / 1000)}`;
        return tf({ s: `Un article coûte ${price} € TTC, avec une TVA de ${dcs(t)} % : son prix hors taxes s’obtient ${claim}.`, v: right, c: () => right === (Math.abs(1 / (1 + t / 100) - (right ? 1 / (1 + t / 100) : 1 - t / 100)) < 1e-12) && (right || Math.abs(1 / (1 + t / 100) - (1 - t / 100)) > 1e-6), j: right ? `Le prix TTC est le prix HT multiplié par ${M(dcs(1 + t / 100))} : on divise donc par ${M(dcs(1 + t / 100))}.` : `Diviser par ${M(dcs(1 + t / 100))} n’est pas multiplier par ${M(dcs(Math.round((1 - t / 100) * 1000) / 1000))} : ${M(`\\dfrac{1}{${dcs(1 + t / 100)}}\\approx ${roundTex(1 / (1 + t / 100), 4)}`)}.` }); }
      if (kind === 'avg') { const a = r.int(2, 40), b = r.int(41, 90), arith = (a + b) / 2, geo = (Math.sqrt((1 + a / 100) * (1 + b / 100)) - 1) * 100;
        return tf({ s: `Un prix augmente de ${a} % la première année puis de ${b} % la seconde : le taux d’évolution annuel moyen est ${dcs(arith)} %.`, v: false, c: () => Math.abs(arith - geo) > 1e-6, j: `Le taux annuel moyen ${M('t')} vérifie ${M(`(1+t)^{2}=${numTex(cmF(a))}\\times ${numTex(cmF(b))}`)} : ${M(`t\\approx ${roundTex(geo, 2)}\\,\\%`)}, inférieur à la moyenne arithmétique ${M(`${dcs(arith)}\\,\\%`)}.` }); }
      const I0 = 100, I1 = r.int(101, 200), claim = r.pick([I1 - 100, I1, (I1 - 100) * 2]), ok = claim === I1 - 100;
      return tf({ s: `Un indice de base 100 en 2010 vaut ${I1} en 2020 : la grandeur a augmenté de ${claim} % entre 2010 et 2020.`, v: ok, c: () => ok === (Math.abs(claim - ((I1 - I0) / I0) * 100) < 1e-12), j: `${M(`\\dfrac{${I1}-100}{100}=${dcs((I1 - 100) / 100)}`)} : la hausse est de ${M(`${I1 - 100}\\,\\%`)}${ok ? '.' : `, pas de ${M(`${claim}\\,\\%`)}.`}` });
    } },

  { id: 'm4-rev-error', cls: C, chapter: 'stmg-08', domain: 'nombres', skill: 'Trouver l’erreur de révision', fast: false,
    make(r, level) {
      if (r.next() < 0.5) {
        const a = r.pick([10, 20, 30, 40]), b = r.pick([50, 60, 80]), V = r.int(2, 12) * 100, cm = (1 + a / 100) * (1 + b / 100), badRate = (a + b) / 2, good = Math.sqrt(cm) - 1;
        return spot(`Une valeur de ${M(euro(V))} augmente de ${M(`${a}\\,\\%`)} puis de ${M(`${b}\\,\\%`)}. Un élève cherche le taux annuel moyen sur ces deux années.`, [M(`t=\\dfrac{${a}+${b}}{2}=${dcs(badRate)}\\,\\%`), M(`V_2=${V}\\times ${numTex(cmF(badRate))}^{2}\\approx ${nf(V * (1 + badRate / 100) ** 2)}\\ \\text{€}`)], 0,
          `le taux moyen n’est pas la moyenne arithmétique : ${M(`${V}\\times ${numTex(cmF(a))}\\times ${numTex(cmF(b))}=${nf(V * cm)}`)} n’est pas ${M(nf(V * (1 + badRate / 100) ** 2))}.`, M(`(1+t)^{2}=${numTex(cmF(a))}\\times ${numTex(cmF(b))}`), M(`t=\\sqrt{${dcs(Math.round(cm * 10000) / 10000)}}-1\\approx ${roundTex(good * 100, 2)}\\,\\%`), () => Math.abs(V * (1 + good) ** 2 - V * cm) < 1e-9 && Math.abs(V * (1 + badRate / 100) ** 2 - V * cm) > 1e-6);
      }
      const t = r.pick([5.5, 10, 20]), HT = r.pick([80, 120, 150, 200, 250, 400]), TTC = Math.round(HT * (1 + t / 100) * 100) / 100, bad = Math.round(TTC * (1 - t / 100) * 100) / 100;
      return spot(`Un article coûte ${M(euro(TTC))} TTC avec une TVA de ${M(`${dcs(t)}\\,\\%`)}. Un élève cherche son prix HT.`, [M(`\\text{TTC}=\\text{HT}\\times ${dcs(1 + t / 100)}`), M(`\\text{HT}=\\text{TTC}\\times ${dcs(Math.round((1 - t / 100) * 1000) / 1000)}=${nf(bad)}\\ \\text{€}`)], 1, `de ${M(`\\text{TTC}=\\text{HT}\\times ${dcs(1 + t / 100)}`)} on tire ${M(`\\text{HT}=\\text{TTC}\\div ${dcs(1 + t / 100)}`)}.`, M(`\\text{HT}=\\dfrac{${dcs(TTC)}}{${dcs(1 + t / 100)}}`), M(`\\text{HT}=${nf(HT)}\\ \\text{€}`), () => Math.abs(TTC / (1 + t / 100) - HT) < 0.006 && Math.abs(bad - HT) > 0.01);
    } },

  { id: 'm4-rev-index', cls: C, chapter: 'stmg-08', domain: 'nombres', skill: 'Indices en base 100', fast: true,
    make(r, level) {
      const v = [r.int(8, 40) * 50, 0, 0]; v[1] = Math.round(v[0] * (1 + r.int(-12, 25) / 100)); v[2] = Math.round(v[1] * (1 + r.int(-12, 25) / 100));
      const idx = v.map((x) => (x / v[0]) * 100), s = idx.map((x) => safeRound(x, 1));
      if (s.includes(null) || v.some((x) => x <= 0) || v[1] === v[0]) return this.make(r, level);
      if (level === 1) return { q: `Le chiffre d’affaires d’une entreprise est de ${M(euro(v[0]))} en 2020, ${M(euro(v[1]))} en 2021 et ${M(euro(v[2]))} en 2022. Calculer les indices de 2021 et de 2022 en base 100 en 2020 (arrondis au dixième).`, a: `${M(`I_{2021}=\\dfrac{${v[1]}}{${v[0]}}\\times 100\\approx ${s[1]}`)} ; ${M(`I_{2022}=\\dfrac{${v[2]}}{${v[0]}}\\times 100\\approx ${s[2]}`)}.`, ok: () => roundTex((v[1] * 100) / v[0], 1) === s[1] && roundTex((v[2] * 100) / v[0], 1) === s[2] };
      const x1 = parseFloat(s[1].replace('{,}', '.')), x2 = parseFloat(s[2].replace('{,}', '.')), rate = (x2 / x1 - 1) * 100, sr = safeRound(rate, 1);
      if (sr === null || x1 === 100) return this.make(r, level);
      return { q: `Les indices d’une grandeur en base 100 en 2020 sont ${M(`I_{2021}=${s[1]}`)} et ${M(`I_{2022}=${s[2]}`)} (arrondis au dixième). Quel est le taux d’évolution entre 2021 et 2022, arrondi au dixième de pour cent ?`, a: `${M(`\\dfrac{I_{2022}}{I_{2021}}-1=\\dfrac{${s[2]}}{${s[1]}}-1\\approx ${sr}\\,\\%`)} (les indices se divisent ; on ne les soustrait pas).`,
        ok: () => roundTex(((x2 - x1) / x1) * 100, 1) === sr && Math.abs(rate - (v[2] / v[1] - 1) * 100) < 0.2 };
    } },

  { id: 'm4-rev-mean', cls: C, chapter: 'stmg-08', domain: 'nombres', skill: 'Taux global et taux annuel moyen', fast: false,
    make(r, level) {
      const n = r.int(3, 4), rates = Array.from({ length: n }, () => r.pick([-10, -5, 5, 8, 10, 12, 15, 20])), cm = rates.reduce((p, t) => p * (1 + t / 100), 1), glob = (cm - 1) * 100, avg = (cm ** (1 / n) - 1) * 100, sg = safeRound(glob, 2), sa = safeRound(avg, 2);
      if (sg === null || sa === null) return this.make(r, level);
      return { q: `Sur ${M(n)} années consécutives, les taux d’évolution annuels d’un chiffre d’affaires sont ${M(rates.map((t) => `${t > 0 ? '+' : '-'}${Math.abs(t)}\\,\\%`).join('\\ ;\\ '))}. Calculer le taux d’évolution global puis le taux annuel moyen (arrondis au centième de pour cent).`,
        a: `${M(`CM=${rates.map((t) => numTex(F(100 + t, 100))).join('\\times ')}\\approx ${roundTex(cm, 4)}`)}, soit un taux global de ${M(`${sg}\\,\\%`)}. Le taux annuel moyen vérifie ${M(`(1+t)^{${n}}=CM`)} : ${M(`t=CM^{1/${n}}-1\\approx ${sa}\\,\\%`)}.`,
        ok: () => { let p = 1; rates.forEach((t) => { p *= 1 + t / 100; }); const a = Math.exp(Math.log(p) / n) - 1; return roundTex((p - 1) * 100, 2) === sg && roundTex(a * 100, 2) === sa && Math.abs((1 + a) ** n - p) < 1e-12; } };
    } },

  { id: 'm4-rev-mix', cls: C, chapter: 'stmg-08', domain: 'suites', skill: 'Problème de synthèse : suite, logarithme, probabilités', fast: false,
    make(r, level) {
      const t = r.int(2, 12), C0 = 500 * r.int(2, 40), q = 1 + t / 100, d = 100 * r.int(1, 5);
      if (level < 3) { const n = Math.ceil(Math.log(2) / Math.log(q)); let c = C0, y = 0; while (c < 2 * C0 && y < 400) { c *= q; y++; }
        return { q: `On place ${M(euro(C0))} à ${M(`${t}\\,\\%`)} d’intérêts composés par an. 1) Exprimer le capital ${M('C_n')} après ${M('n')} années. 2) En combien d’années le capital double-t-il au minimum ? (utiliser le logarithme décimal)`, a: `1) ${M(`C_n=${C0}\\times ${dcs(q)}^{n}`)}. 2) ${M(`${dcs(q)}^{n}\\geqslant 2\\iff n\\geqslant\\dfrac{\\log 2}{\\log ${dcs(q)}}\\approx ${roundTex(Math.log10(2) / Math.log10(q), 2)}`)} : ${M(`n=${n}`)} ans.`, ok: () => y === n && C0 * q ** n >= 2 * C0 - 1e-6 && C0 * q ** (n - 1) < 2 * C0 }; }
      let c = C0, k = 0; while (c < 3 * C0 && k < 400) { c = c * q + d; k++; }
      return { q: `On place ${M(euro(C0))} à ${M(`${t}\\,\\%`)} par an et chaque année, juste après le versement des intérêts, on ajoute ${M(euro(d))}. On note ${M('u_n')} le capital après ${M('n')} années. 1) Exprimer ${M('u_{n+1}')} en fonction de ${M('u_n')}. 2) Calculer ${M('u_1')} et ${M('u_2')}. 3) À partir de quelle année le capital dépasse-t-il le triple du capital initial ?`,
        a: `1) ${M(`u_{n+1}=${dcs(q)}\\,u_n+${d}`)}. 2) ${M(`u_1=${dcs(q)}\\times ${C0}+${d}=${nf(C0 * q + d)}`)} et ${M(`u_2=${dcs(q)}\\times ${nf(C0 * q + d)}+${d}=${nf((C0 * q + d) * q + d)}`)}. 3) Tableau de valeurs : ${M(`u_{${k - 1}}\\approx ${nf(uN(C0, q, d, k - 1))}`)} puis ${M(`u_{${k}}\\approx ${nf(uN(C0, q, d, k))}>${3 * C0}`)} : dès l’année ${M(k)}.`, ok: () => uN(C0, q, d, k) >= 3 * C0 && uN(C0, q, d, k - 1) < 3 * C0 };
    } },

  { id: 'm4-rev-prop', cls: C, chapter: 'stmg-08', domain: 'nombres', skill: 'Proportion de proportion', fast: false,
    make(r, level) {
      const a = r.pick([20, 25, 30, 40, 50, 60, 75, 80]), b = r.pick([10, 20, 25, 30, 40, 50, 80]), N = r.pick([200, 400, 500, 800, 1000]), part = mul(F(a, 100), F(b, 100));
      if (level < 3) return { q: `Dans une entreprise de ${M(N)} salariés, ${M(`${a}\\,\\%`)} sont des cadres et ${M(`${b}\\,\\%`)} des cadres travaillent à temps partiel. Quelle proportion des salariés sont des cadres à temps partiel ? Combien de personnes cela représente-t-il ?`, a: `${M(`${a}\\,\\%\\times ${b}\\,\\%=\\dfrac{${a}}{100}\\times\\dfrac{${b}}{100}=${numTex(part)}`)} soit ${M(`${numTex(F(part.n * 100, part.d))}\\,\\%`)} des salariés, c’est-à-dire ${M(`${numTex(mul(part, F(N)))}`)} personnes.`, ok: () => Math.abs(val(part) - (a / 100) * (b / 100)) < 1e-12 && eq(mul(part, F(N)), F(a * b * N, 10000)) };
      const total = F(r.int(2, 19), 100), partA = F(a, 100), share = div(total, partA);
      if (val(share) > 1) return this.make(r, level);
      return { q: `Dans un lycée, ${M(`${a}\\,\\%`)} des élèves sont en Terminale et ${M(`${numTex(F(total.n * 100, total.d))}\\,\\%`)} de tous les élèves sont des terminales STMG. Quelle proportion des élèves de Terminale sont en STMG ?`, a: `${M(`\\dfrac{${numTex(F(total.n * 100, total.d))}}{${a}}=${fracTex(share)}`)}${dec(F(share.n * 100, share.d), 2) .startsWith('=') ? ` soit ${M(`${numTex(F(share.n * 100, share.d))}\\,\\%`)}` : ` soit environ ${M(`${roundTex(val(share) * 100, 2)}\\,\\%`)}`}.`, ok: () => eq(mul(share, partA), total) };
    } },
];

function cmF(t) { return F(Math.round((100 + t) * 10), 1000); }
function uN(C0, q, d, n) { let u = C0; for (let i = 0; i < n; i++) u = u * q + d; return u; }
