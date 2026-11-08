// Seconde generators, sixth file (chapters 07 to 09: statistiques, calcul algébrique, proportions et évolutions): four-choice questions with one
// typical error per wrong option, true/false, find-the-error and multi-step contexts with seeded parameters. Same contract as
// templates-seconde.js; every ok() recomputes the answer another way (exact fractions, brute force, substitution, sampling).
import { F, add, sub, mul, div, val, eq, M, fracTex, numTex, roundTex, polyTex, evalPoly, mulPoly, sgn, par } from './engine.js';
import { tf, spot } from './premiere-kit.js';
import { dec, parT } from './seconde-kit.js';
import { qcmNum, sorted, medianOf, meanOf, varianceOf, quantileOf } from './seconde-kit-2.js';

const C = 'seconde';
const GRID = Array.from({ length: 161 }, (_, i) => -20 + i * 0.25);
const fr1 = (x) => String(x).replace('.', '{,}');
const list = (l) => l.join('\\ ;\\ ');
const pctS = (f) => `${f.n < 0 ? '-' : '+'}${numTex(F(Math.abs(f.n) * 100, f.d))}\\,\\%`;
const cmOf = (pct) => F(100 + pct, 100);
const fac = (a) => (a === 0 ? 'x' : `(x${sgn(-a)})`);
const kx = (k) => (k === 1 ? 'x' : k === -1 ? '-x' : `${k}x`);
const rates = [5, 10, 15, 20, 25, 30, 40, 50];

export const seconde6 = [
  // ============================ 07 Statistiques ============================
  { id: 's4-stat-qcm', cls: C, chapter: 'seconde-07', domain: 'stats-proba', skill: 'QCM de statistiques', fast: true,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['median', 'mean'] : ['median', 'quartile', 'mean']);
      if (kind === 'median' || kind === 'quartile') {
        const n = kind === 'median' ? r.int(6, 11) : 4 * r.int(2, 4) + r.pick([0, 1, 2]), data = Array.from({ length: n }, () => r.int(1, 20)), s = sorted(data);
        if (kind === 'median') {
          const med = medianOf(data), mean = Math.round(meanOf(data) * 10) / 10;
          return qcmNum(r, `On relève les valeurs ${list(data)}. La médiane de cette série est :`, [med, `on range les ${n} valeurs : ${M(list(s))} ; la médiane ${n % 2 ? 'est la valeur centrale' : 'est la moyenne des deux valeurs centrales'}.`],
            [[data[Math.floor(n / 2)], 'prend la valeur du milieu de la liste non rangée.'], [mean, 'calcule la moyenne au lieu de la médiane.'], [(s[0] + s[n - 1]) / 2, 'prend le milieu entre la plus petite et la plus grande valeur.'], [n % 2 ? s[(n - 1) / 2 - 1] : s[n / 2 - 1], 'se trompe de position dans la série rangée.']], (v) => M(fr1(v)),
            (v) => { const ord = [...data].sort((x, y) => x - y); let m = 0; for (let i = 0; i < n; i++) { const below = ord.filter((x) => x < ord[i]).length; if (n % 2 && below <= (n - 1) / 2 && ord.filter((x) => x <= ord[i]).length >= (n + 1) / 2) m = ord[i]; } return n % 2 ? m === v : (ord[n / 2 - 1] + ord[n / 2]) / 2 === v; });
        }
        const q1 = quantileOf(data, 0.25);
        return qcmNum(r, `On relève les valeurs ${list(data)}. Le premier quartile ${M('Q_1')} (plus petite valeur telle qu’au moins ${M('25\\,\\%')} des valeurs lui soient inférieures ou égales) est :`, [q1, `rangées : ${M(list(s))} ; ${M(`\\dfrac{${n}}{4}=${fr1(n / 4)}`)}, on prend la valeur de rang ${M(Math.ceil(n / 4))}.`],
          [[s[Math.floor(n / 4)], 'prend la valeur de rang ' + M(Math.floor(n / 4) + 1) + ' au lieu de l’entier supérieur du quart.'], [medianOf(data), 'donne la médiane.'], [quantileOf(data, 0.75), 'donne le troisième quartile.'], [s[0], 'donne la plus petite valeur.']], (v) => M(fr1(v)),
          (v) => { const cnt = (x) => s.filter((y) => y <= x).length; return s.includes(v) && cnt(v) * 4 >= n && s.every((x) => x >= v || cnt(x) * 4 < n); });
      }
      const xs = [r.int(1, 4), r.int(5, 8), r.int(9, 12), r.int(13, 16)].map((x) => x), ns = [r.int(1, 6), r.int(1, 6), r.int(1, 6), r.int(1, 6)], N = ns.reduce((a, b) => a + b, 0), S = xs.reduce((a, x, i) => a + x * ns[i], 0), ex = F(S, N);
      const tab = `\\begin{array}{c|cccc}\\text{Valeur}&${xs.join('&')}\\\\\\hline\\text{Effectif}&${ns.join('&')}\\end{array}`;
      return qcmNum(r, `Dans la série ${M(tab)}, la moyenne arrondie au centième est :`, [roundTex(val(ex), 2), `${M(`\\dfrac{${xs.map((x, i) => `${x}\\times ${ns[i]}`).join('+')}}{${N}}=\\dfrac{${S}}{${N}}`)}.`],
        [[roundTex(xs.reduce((a, b) => a + b, 0) / 4, 2), 'fait la moyenne des valeurs sans tenir compte des effectifs.'], [roundTex(S / 4, 2), 'divise par le nombre de valeurs différentes au lieu de l’effectif total.'], [roundTex(xs.reduce((a, b) => a + b, 0) / N, 2), 'additionne les valeurs seules et divise par l’effectif total.'], [roundTex(S / (N + 1), 2), 'divise par l’effectif total plus un.']], (v) => M(v),
        (v) => v === roundTex(xs.flatMap((x, i) => Array(ns[i]).fill(x)).reduce((a, b) => a + b, 0) / N, 2));
    } },

  { id: 's4-stat-tf', cls: C, chapter: 'seconde-07', domain: 'stats-proba', skill: 'Vrai ou faux en statistiques', fast: false,
    make(r, level) {
      const data = Array.from({ length: r.int(4, 7) }, () => r.int(1, 15)), k = r.int(2, 6), sh = data.map((x) => x + k), sc = data.map((x) => x * k);
      const kind = r.pick(level === 1 ? ['shiftmed', 'scalemean'] : ['shiftvar', 'scalevar', 'shiftmed', 'scalemean']);
      const v = varianceOf(data);
      if (kind === 'shiftvar') return tf({ s: `On ajoute ${k} à chaque valeur de la série ${list(data)}. La variance ne change pas.`.replace(list(data), data.join(' ; ')), v: true, c: () => Math.abs(varianceOf(sh) - v) < 1e-9, j: `La moyenne augmente de ${M(k)} comme chaque valeur, donc chaque écart à la moyenne est inchangé et la variance aussi.` });
      if (kind === 'scalevar') { const yes = r.next() < 0.5, claimed = yes ? k * k : k; return tf({ s: `On multiplie par ${k} chaque valeur de la série ${data.join(' ; ')}. La variance est multipliée par ${claimed}.`, v: claimed === k * k, c: () => (Math.abs(varianceOf(sc) - claimed * v) < 1e-6) === (claimed === k * k), j: claimed === k * k ? `Les écarts sont multipliés par ${M(k)}, leurs carrés par ${M(`${k}^{2}=${k * k}`)}.` : `Les écarts sont multipliés par ${M(k)}, donc la variance par ${M(`${k}^{2}=${k * k}`)} et non par ${M(k)}.` }); }
      if (kind === 'shiftmed') { const claim = r.pick([k, 2 * k]); return tf({ s: `On ajoute ${k} à chaque valeur de la série ${data.join(' ; ')}. La médiane augmente de ${claim}.`, v: claim === k, c: () => (Math.abs(medianOf(sh) - medianOf(data) - claim) < 1e-9) === (claim === k), j: claim === k ? `La médiane de la série ${data.length % 2 ? 'est une valeur de la série' : 'est la moyenne de deux valeurs'} : elle est augmentée de ${M(k)}.` : `L’ordre des valeurs est conservé : la médiane passe de ${M(fr1(medianOf(data)))} à ${M(fr1(medianOf(sh)))}, soit une augmentation de ${M(k)}, pas de ${M(claim)}.` }); }
      const claim = r.pick([k, k * k]);
      return tf({ s: `On multiplie par ${k} chaque valeur de la série ${data.join(' ; ')}. La moyenne est multipliée par ${claim}.`, v: claim === k, c: () => (Math.abs(meanOf(sc) - claim * meanOf(data)) < 1e-9) === (claim === k), j: claim === k ? `${M(`\\bar x'=\\dfrac{\\sum k x_i}{n}=k\\bar x`)} : la moyenne est multipliée par ${M(k)}.` : `La moyenne est multipliée par ${M(k)} et non par ${M(claim)} : ${M(`${fr1(meanOf(data))}\\times ${k}=${fr1(Math.round(meanOf(sc) * 1e6) / 1e6)}`)}.` });
    } },

  { id: 's4-stat-error', cls: C, chapter: 'seconde-07', domain: 'stats-proba', skill: 'Trouver l’erreur sur une moyenne', fast: false,
    make(r, level) {
      const xs = [r.int(1, 5), r.int(6, 9), r.int(10, 14), r.int(15, 20)], ns = [r.int(1, 6), r.int(2, 6), r.int(1, 6), r.int(1, 5)], N = ns.reduce((a, b) => a + b, 0), S = xs.reduce((a, x, i) => a + x * ns[i], 0), bad = r.pick([0, 1]);
      const Nb = bad === 0 ? 4 : N, Sb = bad === 1 ? xs.reduce((a, b) => a + b, 0) : S, good = F(S, N), wrong = F(Sb, Nb);
      if (eq(good, wrong)) return this.make(r, level);
      const tab = `\\begin{array}{c|cccc}\\text{Valeur}&${xs.join('&')}\\\\\\hline\\text{Effectif}&${ns.join('&')}\\end{array}`;
      return spot(`Un élève calcule la moyenne de la série ${M(tab)}.`, [M(`\\text{Effectif total}=${bad === 0 ? 4 : ns.join('+') + '=' + N}`), M(`\\text{Somme}=${bad === 1 ? xs.join('+') : xs.map((x, i) => `${x}\\times ${ns[i]}`).join('+')}=${Sb}`), M(`\\text{Moyenne}=\\dfrac{${Sb}}{${Nb}}${dec(wrong, 2)}`)], bad,
        bad === 0 ? 'l’effectif total est la somme des effectifs, pas le nombre de valeurs différentes.' : 'chaque valeur doit être multipliée par son effectif avant d’additionner.',
        bad === 0 ? M(`N=${ns.join('+')}=${N}`) : M(`\\text{Somme}=${xs.map((x, i) => `${x}\\times ${ns[i]}`).join('+')}=${S}`), M(`\\text{Moyenne}=\\dfrac{${S}}{${N}}${dec(good, 2)}`),
        () => { const all = xs.flatMap((x, i) => Array(ns[i]).fill(x)); return all.length === N && all.reduce((a, b) => a + b, 0) === S && !eq(good, wrong); });
    } },

  { id: 's4-stat-box', cls: C, chapter: 'seconde-07', domain: 'stats-proba', skill: 'Quartiles et écart interquartile', fast: false,
    make(r, level) {
      const n = level === 1 ? r.pick([8, 12]) : level === 2 ? r.int(9, 15) : r.int(12, 20), data = Array.from({ length: n }, () => r.int(2, 40)), s = sorted(data);
      const q1 = quantileOf(data, 0.25), q3 = quantileOf(data, 0.75), med = medianOf(data);
      return { q: `Les notes de ${M(n)} élèves sont : ${data.join(' ; ')}. Donner le minimum, le premier quartile, la médiane, le troisième quartile, le maximum et l’écart interquartile.`,
        a: `Série rangée : ${M(list(s))}. ${M(`Q_1`)} est la valeur de rang ${M(Math.ceil(n / 4))} : ${M(q1)} ; médiane ${M(fr1(med))} ; ${M(`Q_3`)} de rang ${M(Math.ceil((3 * n) / 4))} : ${M(q3)} ; minimum ${M(s[0])}, maximum ${M(s[n - 1])}. Écart interquartile ${M(`Q_3-Q_1=${q3 - q1}`)}.`,
        ok: () => { const cnt = (v) => data.filter((x) => x <= v).length; const first = (p) => s.find((x) => cnt(x) * 4 >= p * n); return first(1) === q1 && first(3) === q3 && q3 - q1 >= 0 && Math.min(...data) === s[0] && Math.max(...data) === s[n - 1] && cnt(med) * 2 >= n; } };
    } },

  // ============================ 08 Calcul algébrique, équations et inéquations ============================
  { id: 's4-alg-qcm', cls: C, chapter: 'seconde-08', domain: 'algebre', skill: 'QCM de calcul algébrique', fast: true,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['expand', 'solve'] : ['expand', 'solve', 'factor']);
      if (kind === 'expand') {
        const a = r.nz(-4, 4), b = r.nz(-6, 6), c = r.nz(-4, 4), d = r.nz(-6, 6), good = mulPoly([a, b], [c, d]);
        return qcmNum(r, `Le développement de ${M(`(${polyTex([a, b])})(${polyTex([c, d])})`)} est :`, [good, `double distributivité, puis réduction : ${M(`${polyTex(good)}`)}.`],
          [[[a * c, 0, b * d], 'oublie les produits croisés.'], [[a * c, a * d - b * c, b * d], 'se trompe de signe dans un produit croisé.'], [[a * c, a * d + b * c, -b * d], 'se trompe de signe pour le produit des termes constants.'], [[a + c, b + d, b * d], 'additionne les coefficients au lieu de les multiplier.']], (w) => M(polyTex(w)),
          (w) => [-3, -2, -1, 0, 1, 2, 4].every((x) => evalPoly(w, x) === (a * x + b) * (c * x + d)));
      }
      if (kind === 'solve') {
        let a, c; do { a = r.nz(-6, 6); c = r.nz(-6, 6); } while (a === c || a === -c);
        const b = r.int(-9, 9), d = r.int(-9, 9), x = F(d - b, a - c);
        return qcmNum(r, `La solution de ${M(`${polyTex([a, b])}=${polyTex([c, d])}`)} est :`, [x, `${M(`${kx(a - c)}=${d - b}`)}.`],
          [[F(b - d, a - c), 'change le signe en passant les termes constants.'], [F(d + b, a - c), 'ajoute ' + M('b') + ' au lieu de le retrancher.'], [F(d - b, a + c), 'additionne les coefficients de ' + M('x') + ' au lieu de les soustraire.'], [F(d - b, c - a), 'se trompe de signe dans le coefficient de ' + M('x') + '.']], (w) => M(fracTex(w)),
          (w) => eq(add(mul(F(a), w), F(b)), add(mul(F(c), w), F(d))));
      }
      const m = r.int(2, 9), good = [[1, -m], [1, m]], mk = (p) => p.map((q) => `(x${sgn(q[1])})`).join('');
      return qcmNum(r, `La forme factorisée de ${M(`x^{2}-${m * m}`)} est :`, [good, `${M(`x^{2}-${m}^{2}=(x-${m})(x+${m})`)}.`],
        [[[[1, -m], [1, -m]], 'écrit un carré ' + M(`(x-${m})^{2}`) + ' au lieu d’un produit conjugué.'], [[[1, m], [1, m]], 'écrit un carré ' + M(`(x+${m})^{2}`) + '.'], [[[1, -m * m], [1, m * m]], 'oublie de prendre la racine de ' + M(m * m) + '.'], [[[1, -m], [1, -m]].map((q, i) => (i ? [1, m * 2] : q)), 'se trompe sur le second facteur.']], (w) => M(mk(w)),
        (w) => mulPoly(w[0], w[1]).every((c, i) => c === [1, 0, -m * m][i]));
    } },

  { id: 's4-alg-tf', cls: C, chapter: 'seconde-08', domain: 'algebre', skill: 'Vrai ou faux en algèbre', fast: false,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['dev', 'nosol'] : ['dev', 'nosol', 'prod']);
      if (kind === 'dev') {
        const a = r.nz(-6, 6), b = r.nz(-6, 6), good = [1, a + b, a * b], yes = r.next() < 0.5, claim = yes ? good : r.pick([[1, a + b, a + b], [1, a * b, a + b], [1, a + b, 0], [1, a - b, a * b]]);
        const ok = claim.every((c, i) => c === good[i]);
        return tf({ s: `Pour tout réel x, ${M(`(x${sgn(a)})(x${sgn(b)})=${polyTex(claim)}`)}.`, v: ok, c: () => [-3, -1, 0, 2, 5].every((x) => (x + a) * (x + b) === evalPoly(claim, x)) === ok,
          j: ok ? `${M(`(x${sgn(a)})(x${sgn(b)})=x^{2}+(${a}${sgn(b)})x+${par(a)}\\times ${par(b)}`)}, soit ${M(polyTex(good))}.` : `Pour ${M('x=1')} : le produit vaut ${M((1 + a) * (1 + b))} et le second membre ${M(evalPoly(claim, 1))}. Le bon développement est ${M(polyTex(good))}.` });
      }
      if (kind === 'nosol') {
        const k = r.int(1, 12), yes = r.next() < 0.5, form = yes ? `x^{2}+${k}=0` : `x^{2}-${k}=0`, f = (x) => (yes ? x * x + k : x * x - k);
        return tf({ s: `L’équation ${M(form)} n’a aucune solution réelle.`, v: yes, c: () => (yes ? GRID.every((x) => f(x) > 0) : Math.abs(f(Math.sqrt(k))) < 1e-9 && Math.abs(f(-Math.sqrt(k))) < 1e-9),
          j: yes ? `${M(`x^{2}=-${k}`)} est impossible : un carré est positif ou nul.` : `${M(`x^{2}=${k}`)} a deux solutions réelles, ${M(`\\sqrt{${k}}`)} et ${M(`-\\sqrt{${k}}`)}.` });
      }
      const p = r.int(-5, 5), q = r.int(-5, 5), k = r.int(1, 6), g = (x) => (x - p) * (x - q), ok = g(p + k) === k && g(q + k) === k && p !== q;
      if (p === q) return this.make(r, level);
      const bad = g(p + k) !== k ? p + k : q + k;
      return tf({ s: `Les solutions de ${M(`${fac(p)}${fac(q)}=${k}`)} sont ${M(p + k)} et ${M(q + k)}.`, v: ok, c: () => ok === (g(p + k) === k && g(q + k) === k),
        j: ok ? `Par substitution : ${M(`${k}\\times ${par(p + k - q)}=${k}`)} et ${M(`${par(q + k - p)}\\times ${k}=${k}`)}, les deux valeurs conviennent (et un trinôme n’a pas plus de deux racines).` : `La règle du produit nul ne s’applique qu’à un produit égal à ${M(0)}. Ici ${M(`x=${bad}`)} donne ${M(`(${bad - p})(${bad - q})=${g(bad)}`)}, différent de ${M(k)}.` });
    } },

  { id: 's4-alg-error', cls: C, chapter: 'seconde-08', domain: 'algebre', skill: 'Trouver l’erreur en algèbre', fast: false,
    make(r, level) {
      if (r.next() < 0.5) {
        let a, c; do { a = r.nz(-6, 6); c = r.nz(-6, 6); } while (a === c);
        const b = r.nz(-9, 9), d = r.nz(-9, 9), x = F(d - b, a - c), xb = F(d + b, a - c);
        if (eq(x, xb)) return this.make(r, level);
        return spot(`Un élève résout ${M(`${polyTex([a, b])}=${polyTex([c, d])}`)}.`, [M(`${polyTex([a, b])}=${polyTex([c, d])}`), M(`${kx(a)}${c < 0 ? '+' : '-'}${kx(Math.abs(c))}=${d}${b < 0 ? '-' : '+'}${Math.abs(b)}`), M(`${kx(a - c)}=${d + b}`), M(`x=${fracTex(xb)}`)], 1,
          `en passant ${M(polyTex([b], 'x').replace(/x/, ''))} de l’autre côté on change son signe : on retranche ${M(b)}, donc ${M(`${d}${b < 0 ? '+' : '-'}${Math.abs(b)}`)}.`, M(`${kx(a - c)}=${d}${b < 0 ? '+' : '-'}${Math.abs(b)}=${d - b}`), M(`x=${fracTex(x)}`),
          () => eq(add(mul(F(a), x), F(b)), add(mul(F(c), x), F(d))) && !eq(add(mul(F(a), xb), F(b)), add(mul(F(c), xb), F(d))));
      }
      const a = r.int(1, 6), b = r.nz(-9, 9), c = r.nz(-9, 9), t = F(c - b, -a), wrongSet = `]-\\infty\\,;\\,${fracTex(t)}]`, rightSet = `[${fracTex(t)}\\,;\\,+\\infty[`, f = (x) => -a * x + b <= c;
      return spot(`Un élève résout ${M(`-${a === 1 ? '' : a}x${sgn(b)}\\leqslant ${c}`)}.`, [M(`-${kx(a)}\\leqslant ${c}${b < 0 ? '+' : '-'}${Math.abs(b)}`), M(`x\\leqslant\\dfrac{${c - b}}{-${a}}=${fracTex(t)}`), M(`S=${wrongSet}`)], 1,
        'on divise par un nombre négatif : le sens de l’inégalité doit être renversé.', M(`x\\geqslant ${fracTex(t)}`), M(`S=${rightSet}`),
        () => GRID.every((x) => f(x) === (x >= val(t))) && GRID.some((x) => f(x) !== (x <= val(t))));
    } },

  { id: 's4-alg-tariff', cls: C, chapter: 'seconde-08', domain: 'algebre', skill: 'Comparer deux tarifs (mise en équation)', fast: false,
    make(r, level) {
      const p1 = r.int(2, 9), extra = r.int(1, 6), p2 = p1 + extra, fixed = r.int(4, 40) * (level === 1 ? extra : 1), unit = r.pick(['séance', 'trajet', 'photocopie', 'location']);
      const x = F(fixed, extra), nmin = Math.floor(val(x)) + 1;
      const base = `Un club propose deux formules. Formule A : un abonnement de ${M(`${fixed}\\ \\text{€}`)} plus ${M(`${p1}\\ \\text{€}`)} par ${unit}. Formule B : ${M(`${p2}\\ \\text{€}`)} par ${unit}, sans abonnement.`;
      if (level === 1) return { q: `${base} Pour quel nombre de ${unit}s les deux formules coûtent-elles le même prix ?`, a: `${M(`${fixed}+${p1}n=${p2}n`)} donne ${M(`n=\\dfrac{${fixed}}{${extra}}${dec(x, 2)}`)}.`, ok: () => eq(add(F(fixed), mul(F(p1), x)), mul(F(p2), x)) };
      return { q: `${base} À partir de combien de ${unit}s la formule A est-elle strictement moins chère que la formule B ?`, a: `${M(`${fixed}+${p1}n<${p2}n \\iff n>\\dfrac{${fixed}}{${extra}}${dec(x, 2)}`)} : à partir de ${M(`n=${nmin}`)}.`,
        ok: () => { let m = 0; while (fixed + p1 * m >= p2 * m) m++; return m === nmin && fixed + p1 * (nmin - 1) >= p2 * (nmin - 1); } };
    } },

  // ============================ 09 Proportions et évolutions ============================
  { id: 's4-prop-qcm', cls: C, chapter: 'seconde-09', domain: 'nombres', skill: 'QCM sur les évolutions', fast: true,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['succ', 'part'] : ['succ', 'recip', 'part']);
      if (kind === 'succ') {
        const a = r.pick(rates), b = r.pick(rates), up = r.next() < 0.5, cm = mul(cmOf(a), up ? cmOf(-b) : cmOf(b)), rate = sub(cm, F(1));
        return qcmNum(r, `Une grandeur subit une hausse de ${M(`${a}\\,\\%`)} puis ${up ? `une baisse de ${M(`${b}\\,\\%`)}` : `une hausse de ${M(`${b}\\,\\%`)}`}. L’évolution globale est :`, [rate, `${M(`${fracTex(cmOf(a))}\\times ${fracTex(up ? cmOf(-b) : cmOf(b))}=${numTex(cm)}`)}.`],
          [[F(up ? a - b : a + b, 100), 'additionne (ou soustrait) les taux au lieu de multiplier les coefficients.'], [F(up ? a * b : a * b, 100 * 100) , 'multiplie les taux.'], [F(up ? -(a - b) : -(a + b), 100), 'se trompe de sens de l’évolution.'], [sub(cmOf(a), F(1)), 'ne tient compte que de la première évolution.']], (w) => M(pctS(w)),
          (w) => eq(mul(F(100), add(F(1), w)), mul(F(100), cm)));
      }
      if (kind === 'recip') {
        const t = r.pick([25, 60, 100, 150, 300, 400, 700, 900]), rec = sub(div(F(1), cmOf(t)), F(1));
        return qcmNum(r, `Après une hausse de ${M(`${t}\\,\\%`)}, quelle baisse ramène à la valeur de départ ?`, [rec, `il faut ${M(`CM\\times CM'=1`)} : ${M(`CM'=\\dfrac{1}{${numTex(cmOf(t))}}=${numTex(add(F(1), rec))}`)}.`],
          [[F(-t, 100), 'applique la baisse du même taux.'], [F(-t, 200), 'prend la moitié du taux.'], [F(-(100 - Math.min(99, t)), 100), 'prend le complément à 100 du taux.'], [F(-1, 1 + t), 'confond ' + M('1/(1+t)') + ' et ' + M('1/t') + '.']], (w) => M(pctS(w)),
          (w) => eq(mul(mul(F(100), cmOf(t)), add(F(1), w)), F(100)));
      }
      const p = r.pick([10, 20, 25, 30, 40, 50, 60, 75]), q = r.pick([10, 20, 25, 30, 40, 50, 60, 80]), good = F(p * q, 100);
      return qcmNum(r, `Dans un lycée, ${M(`${p}\\,\\%`)} des élèves sont en Seconde et ${M(`${q}\\,\\%`)} des élèves de Seconde font du latin. La proportion d’élèves du lycée qui font du latin en Seconde est :`, [good, `${M(`\\dfrac{${p}}{100}\\times\\dfrac{${q}}{100}`)}, soit ${M(`${numTex(good)}\\,\\%`)} (en pourcentage : ${M(`${p}\\,\\%\\times ${q}\\,\\%`)}).`],
        [[F(p + q, 1), 'additionne les pourcentages.'], [F(p * q, 1), 'multiplie les pourcentages sans diviser par 100.'], [F(q - p, 1), 'soustrait les pourcentages.'], [F(p * q, 10), 'se trompe d’un facteur 10.']], (w) => M(`${numTex(w)}\\,\\%`), (w) => eq(w, mul(F(p), F(q, 100))));
    } },

  { id: 's4-prop-tf', cls: C, chapter: 'seconde-09', domain: 'nombres', skill: 'Vrai ou faux sur les évolutions', fast: false,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['same', 'sum'] : ['same', 'sum', 'recip']);
      const t = r.int(2, 45);
      if (kind === 'same') return tf({ s: `Une hausse de ${t} % suivie d’une baisse de ${t} % ramène à la valeur initiale.`, v: false, c: () => !eq(mul(cmOf(t), cmOf(-t)), F(1)), j: `${M(`${numTex(cmOf(t))}\\times ${numTex(cmOf(-t))}=${numTex(mul(cmOf(t), cmOf(-t)))}`)} n’est pas égal à ${M(1)} : la valeur finale est inférieure de ${M(`${numTex(F(t * t, 100))}\\,\\%`)} à la valeur initiale.` });
      if (kind === 'sum') { const b = r.int(2, 45); return tf({ s: `Deux hausses successives de ${t} % puis ${b} % équivalent à une hausse de ${t + b} %.`, v: false, c: () => !eq(mul(cmOf(t), cmOf(b)), cmOf(t + b)), j: `${M(`${numTex(cmOf(t))}\\times ${numTex(cmOf(b))}=${numTex(mul(cmOf(t), cmOf(b)))}`)}, soit une hausse de ${M(pctS(sub(mul(cmOf(t), cmOf(b)), F(1))))} et non de ${M(`${t + b}\\,\\%`)}.` }); }
      const T = r.pick([25, 60, 100, 150, 300, 400, 700, 900]), exact = div(F(100 * T, 100 + T), F(1)), yes = r.next() < 0.5, S = yes ? exact : F(T), ok = eq(mul(cmOf(T), sub(F(1), div(S, F(100)))), F(1));
      return tf({ s: `Après une hausse de ${T} %, une baisse de ${numTex(S)} % ramène à la valeur initiale.`, v: ok, c: () => ok === (eq(S, exact)), j: ok ? `${M(`${numTex(cmOf(T))}\\times ${numTex(sub(F(1), div(S, F(100))))}=1`)}.` : `${M(`${numTex(cmOf(T))}\\times ${numTex(sub(F(1), div(S, F(100))))}=${numTex(mul(cmOf(T), sub(F(1), div(S, F(100)))))}`)} est différent de ${M(1)} : il faudrait une baisse de ${M(`${numTex(exact)}\\,\\%`)}.` });
    } },

  { id: 's4-prop-error', cls: C, chapter: 'seconde-09', domain: 'nombres', skill: 'Trouver l’erreur sur une évolution', fast: false,
    make(r, level) {
      if (r.next() < 0.5) {
        const a = r.pick(rates), b = r.pick(rates), P = r.int(2, 20) * 20, cm = mul(cmOf(a), cmOf(-b)), cmb = cmOf(a - b);
        if (eq(cm, cmb)) return this.make(r, level);
        return spot(`Le prix de ${M(`${P}\\ \\text{€}`)} augmente de ${M(`${a}\\,\\%`)} puis baisse de ${M(`${b}\\,\\%`)}. Un élève cherche le prix final.`,
          [M(`CM_1=${numTex(cmOf(a))}\\text{ et }CM_2=${numTex(cmOf(-b))}`), M(`\\text{évolution globale}=${a}\\,\\%-${b}\\,\\%=${a - b}\\,\\%`), M(`\\text{prix final}=${P}\\times ${numTex(cmb)}=${numTex(mul(F(P), cmb))}\\ \\text{€}`)], 1,
          'on ne soustrait pas les taux : on multiplie les coefficients multiplicateurs.', M(`CM=${numTex(cmOf(a))}\\times ${numTex(cmOf(-b))}=${numTex(cm)}`), M(`\\text{prix final}=${P}\\times ${numTex(cm)}=${numTex(mul(F(P), cm))}\\ \\text{€}`),
          () => Math.abs(P * (1 + a / 100) * (1 - b / 100) - val(mul(F(P), cm))) < 1e-9 && !eq(cm, cmb));
      }
      const vi = r.pick([20, 40, 50, 80, 100, 160, 200, 250]), vf = vi + r.pick([-1, 1]) * r.int(1, 8) * 5;
      if (vf <= 0 || vf === vi) return this.make(r, level);
      const bad = F(vf - vi, vf), good = F(vf - vi, vi);
      if (eq(bad, good)) return this.make(r, level);
      return spot(`Un article passe de ${M(`${vi}\\ \\text{€}`)} à ${M(`${vf}\\ \\text{€}`)}. Un élève calcule son taux d’évolution.`, [M(`V_I=${vi}\\text{ et }V_F=${vf}`), M(`t=\\dfrac{V_F-V_I}{V_F}=\\dfrac{${vf - vi}}{${vf}}`), M(`t=${fracTex(bad)}`)], 1,
        'le taux d’évolution se calcule par rapport à la valeur initiale.', M(`t=\\dfrac{V_F-V_I}{V_I}=\\dfrac{${vf - vi}}{${vi}}`), M(`t=${fracTex(good)}\\text{, soit }${pctS(good)}`), () => eq(mul(F(vi), add(F(1), good)), F(vf)) && !eq(mul(F(vi), add(F(1), bad)), F(vf)));
    } },

  { id: 's4-prop-chain', cls: C, chapter: 'seconde-09', domain: 'nombres', skill: 'Soldes successives et prix initial', fast: false,
    make(r, level) {
      const a = r.pick(rates), b = r.pick([5, 10, 15, 20]), P = r.int(2, 30) * 20, cm = mul(cmOf(-a), cmOf(-b)), fin = mul(F(P), cm);
      if (level < 3) return { q: `Un manteau coûte ${M(`${P}\\ \\text{€}`)}. Il est soldé de ${M(`${a}\\,\\%`)}, puis le prix soldé baisse encore de ${M(`${b}\\,\\%`)} (démarque). Quel est son prix final ? Quelle est la réduction globale en pourcentage ?`,
        a: `${M(`CM=${numTex(cmOf(-a))}\\times ${numTex(cmOf(-b))}=${numTex(cm)}`)} : prix final ${M(`${P}\\times ${numTex(cm)}=${numTex(fin)}\\ \\text{€}`)}, soit une baisse globale de ${M(`${numTex(F(Math.round((1 - val(cm)) * 10000), 100))}\\,\\%`)}.`,
        ok: () => Math.abs(P * (1 - a / 100) * (1 - b / 100) - val(fin)) < 1e-9 && Math.abs((1 - val(cm)) * 100 - (a + b - (a * b) / 100)) < 1e-9 };
      return { q: `Après une remise de ${M(`${a}\\,\\%`)} puis une seconde remise de ${M(`${b}\\,\\%`)} sur le prix remisé, un article coûte ${M(`${numTex(fin)}\\ \\text{€}`)}. Quel était son prix initial ?`,
        a: `${M(`CM=${numTex(cmOf(-a))}\\times ${numTex(cmOf(-b))}=${numTex(cm)}`)} ; prix initial ${M(`\\dfrac{${numTex(fin)}}{${numTex(cm)}}=${P}\\ \\text{€}`)}.`,
        ok: () => eq(div(fin, cm), F(P)) && Math.abs(P * (1 - a / 100) * (1 - b / 100) - val(fin)) < 1e-9 };
    } },
];
