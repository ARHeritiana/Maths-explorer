// Terminale STMG generators, second file (chapters 01 to 03: suites, fonctions exponentielles, logarithme décimal): four-choice questions with one
// typical error per wrong option, true/false, find-the-error, contexts and multi-step items with seeded parameters. Same contract as
// templates-stmg.js; every ok() recomputes the answer another way (loops over the terms, floating point, brute-force search of a threshold).
// Helpers: stmg-kit.js, premiere-kit.js (tf, spot), seconde-kit-2.js (qcmNum).
import { F, add, sub, mul, div, val, eq, M, fracTex, numTex, roundTex, sgn, par } from './engine.js';
import { tf, spot } from './premiere-kit.js';
import { dec } from './seconde-kit.js';
import { qcmNum } from './seconde-kit-2.js';
import { euro, pctN, cmOf, safeRound, arith, geom, firstAbove, firstBelow } from './stmg-kit.js';

const C = 'stmg';
const nf = (x) => (Number.isInteger(x) ? `${x}` : roundTex(x, 2));
const lg = (x) => Math.log(x) / Math.LN10;           // log10 by another route than Math.log10, for the checks
const L3 = (x) => roundTex(Math.log10(x), 3);
// '=3' when the value is a whole number, '\approx 1{,}431' otherwise (never '3{,}000')
const al = (x, k = 3) => (Math.abs(x - Math.round(x)) < 1e-9 ? `=${Math.round(x)}` : `\\approx ${roundTex(x, k)}`);

export const stmg2 = [
  // ============================ 01 Suites numériques ============================
  { id: 'm2-seq-qcm', cls: C, chapter: 'stmg-01', domain: 'suites', skill: 'QCM sur les suites', fast: true,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['arith', 'geom'] : ['arith', 'geom', 'nature']);
      if (kind === 'arith') {
        const u0 = r.int(-10, 40), d = r.nz(-8, 12), n = r.int(5, 20), good = arith(u0, d, n);
        return qcmNum(r, `La suite arithmétique ${M('(u_n)')} a pour premier terme ${M(`u_0=${u0}`)} et pour raison ${M(d)}. Alors ${M(`u_{${n}}`)} vaut :`, [good, `${M(`u_n=u_0+nr=${u0}+${n}\\times ${par(d)}`)}.`],
          [[u0 + (n + 1) * d, 'utilise ' + M(`u_0+(n+1)r`) + '.'], [u0 + (n - 1) * d, 'utilise ' + M(`u_0+(n-1)r`) + '.'], [u0 * n * d, 'multiplie au lieu d’additionner.'], [u0 + d, 'ne fait qu’une seule addition de la raison.']], M, (v) => arith(u0, d, n) === v);
      }
      if (kind === 'geom') {
        const u0 = r.int(1, 9), q = r.pick([2, 3, -2, 4]), n = r.int(3, 7), good = geom(u0, q, n);
        return qcmNum(r, `La suite géométrique ${M('(u_n)')} a pour premier terme ${M(`u_0=${u0}`)} et pour raison ${M(q)}. Alors ${M(`u_{${n}}`)} vaut :`, [good, `${M(`u_n=u_0\\times q^{n}=${u0}\\times ${par(q)}^{${n}}`)}.`],
          [[u0 * q * n, 'multiplie ' + M('q') + ' par ' + M('n') + ' au lieu de l’élever à la puissance ' + M('n') + '.'], [(u0 * q) ** n, 'élève le produit ' + M('u_0q') + ' à la puissance ' + M('n') + '.'], [u0 * q ** (n - 1), 'utilise l’exposant ' + M('n-1') + '.'], [u0 + n * q, 'additionne comme dans une suite arithmétique.']], M, (v) => { let u = u0; for (let i = 0; i < n; i++) u = u * q; return u === v; });
      }
      const u0 = r.int(2, 9), isA = r.next() < 0.5, step = isA ? r.nz(-5, 8) : r.pick([2, 3, 4, -2]), t = Array.from({ length: 4 }, (_, i) => (isA ? u0 + i * step : u0 * step ** i));
      const opts = [{ t: `\\text{arithmétique de raison } ${step}`, k: 'a', v: step }, { t: `\\text{géométrique de raison } ${step}`, k: 'g', v: step }, { t: '\\text{ni arithmétique ni géométrique}', k: 'n' }, { t: `\\text{arithmétique de raison } ${t[1] / t[0]}`, k: 'a', v: t[1] / t[0] }];
      const trueK = isA ? { k: 'a', v: step } : { k: 'g', v: step };
      const good = isA ? opts[0] : opts[1], bads = opts.filter((o) => o !== good);
      return qcmNum(r, `Les premiers termes d’une suite sont ${M(t.join('\\ ;\\ '))}. Cette suite est (en supposant que le motif continue) :`, [good, isA ? `${M(`${t[1]}-${par(t[0])}=${t[2]}-${par(t[1])}=${step}`)} : on ajoute toujours ${M(step)}.` : `${M(`\\dfrac{${t[1]}}{${t[0]}}=\\dfrac{${t[2]}}{${t[1]}}=${step}`)} : on multiplie toujours par ${M(step)}.`],
        bads.map((o) => [o, o.k === 'n' ? 'ne reconnaît pas le motif.' : o.k === trueK.k ? 'se trompe sur la valeur de la raison.' : 'confond addition et multiplication.']), (o) => M(o.t),
        (o) => { const diffs = t.slice(1).map((x, i) => x - t[i]), ratios = t.slice(1).map((x, i) => x / t[i]); const isAr = diffs.every((x) => x === diffs[0]), isGe = ratios.every((x) => x === ratios[0]); return o.k === 'a' ? isAr && diffs[0] === o.v : o.k === 'g' ? isGe && ratios[0] === o.v : !isAr && !isGe; });
    } },

  { id: 'm2-seq-tf', cls: C, chapter: 'stmg-01', domain: 'suites', skill: 'Vrai ou faux sur les suites', fast: false,
    make(r, level) {
      if (r.next() < 0.5) {
        const t = r.pick([2, 3, 4, 5, 8, 10, 12, 15, 20, 25]), up = r.next() < 0.5, T = up ? t : -t, right = cmOf(T), opts = [right, F(Math.abs(t), 100), F(1 + t), cmOf(-T)], claim = r.pick(opts), ok = eq(claim, right);
        return tf({ s: `Un capital ${up ? 'augmente' : 'diminue'} de ${t} % par an. La suite des capitaux annuels est géométrique de raison ${numTex(claim)}.`, v: ok, c: () => ok === (Math.abs(val(claim) - (1 + T / 100)) < 1e-12),
          j: ok ? `Chaque année le capital est multiplié par ${M(`1${T > 0 ? '+' : '-'}\\dfrac{${t}}{100}=${numTex(right)}`)}.` : `La raison est le coefficient multiplicateur ${M(`1${T > 0 ? '+' : '-'}\\dfrac{${t}}{100}=${numTex(right)}`)} et non ${M(numTex(claim))}.` });
      }
      const u0 = r.int(1, 9), q = r.pick([2, 3, 5]), neg = r.next() < 0.5, u = neg ? -u0 : u0, grows = geom(u, q, 1) > u, ok = r.next() < 0.5;
      return tf({ s: `La suite géométrique de premier terme ${u} et de raison ${q} est ${ok ? 'croissante' : 'décroissante'}.`, v: ok === (geom(u, q, 3) > geom(u, q, 2) && geom(u, q, 2) > geom(u, q, 1) && geom(u, q, 1) > u), c: () => { const seq = [0, 1, 2, 3].map((n) => geom(u, q, n)); const inc = seq.every((x, i) => i === 0 || x > seq[i - 1]), dec_ = seq.every((x, i) => i === 0 || x < seq[i - 1]); return (ok ? inc : dec_) === (ok === grows); },
        j: `Les premiers termes sont ${M([0, 1, 2, 3].map((n) => geom(u, q, n)).join('\\ ;\\ '))} : la suite est ${grows ? 'croissante' : 'décroissante'} (une raison supérieure à ${M(1)} ${u > 0 ? 'fait croître' : 'fait décroître'} les termes ${u > 0 ? 'positifs' : 'négatifs'}).` });
    } },

  { id: 'm2-seq-error', cls: C, chapter: 'stmg-01', domain: 'suites', skill: 'Trouver l’erreur sur une suite', fast: false,
    make(r, level) {
      if (r.next() < 0.5) {
        const u1 = r.int(2, 30), d = r.nz(-6, 9), k = r.int(6, 15), good = u1 + (k - 1) * d, bad = u1 + k * d;
        return spot(`Une suite arithmétique ${M('(u_n)')} (qui commence à ${M('n=1')}) a pour premier terme ${M(`u_1=${u1}`)} et pour raison ${M(d)}. Un élève calcule ${M(`u_{${k}}`)}.`, [M(`u_n=u_1+n\\,r`), M(`u_{${k}}=${u1}+${k}\\times ${par(d)}`), M(`u_{${k}}=${bad}`)], 0,
          `de ${M('u_1')} à ${M('u_n')} on ajoute ${M('n-1')} fois la raison.`, M(`u_n=u_1+(n-1)\\,r`), M(`u_{${k}}=${u1}+${k - 1}\\times ${par(d)}=${good}`), () => arith(u1, d, k - 1) === good && good !== bad);
      }
      const u0 = r.int(1, 6), q = r.pick([2, 3]), n = r.int(3, 6), terms = n + 1, S = Array.from({ length: terms }, (_, i) => u0 * q ** i).reduce((a, b) => a + b, 0), bad = (u0 * (q ** n - 1)) / (q - 1);
      return spot(`Un élève calcule ${M(`S=u_0+u_1+\\dots+u_{${n}}`)} pour la suite géométrique de premier terme ${M(`u_0=${u0}`)} et de raison ${M(q)}.`, [M(`S\\text{ compte }${n}\\text{ termes}`), M(`S=u_0\\times\\dfrac{q^{${n}}-1}{q-1}=${u0}\\times\\dfrac{${q ** n}-1}{${q - 1}}`), M(`S=${bad}`)], 0,
        `de ${M('u_0')} à ${M(`u_{${n}}`)} il y a ${M(n + 1)} termes, donc l’exposant est ${M(n + 1)}.`, M(`S=u_0\\times\\dfrac{q^{${n + 1}}-1}{q-1}=${u0}\\times\\dfrac{${q ** (n + 1)}-1}{${q - 1}}`), M(`S=${S}`), () => { let s = 0, u = u0; for (let i = 0; i <= n; i++) { s += u; u *= q; } return s === S && bad !== S; });
    } },

  { id: 'm2-seq-sum', cls: C, chapter: 'stmg-01', domain: 'suites', skill: 'Somme de termes (loyers, versements)', fast: false,
    make(r, level) {
      if (level < 3 && r.next() < 0.6) {
        const u0 = 100 * r.int(4, 12), d = r.pick([10, 20, 25, 30, 40, 50]), n = r.int(5, 12), tot = ((n + 1) * (2 * u0 + n * d)) / 2;
        return { q: `Un loyer annuel est de ${M(euro(u0))} la première année (${M(`u_0=${u0}`)}) et augmente de ${M(euro(d))} chaque année. Quel est le total payé de l’année 0 à l’année ${M(n)} incluses ?`, a: `Suite arithmétique : ${M(`S=\\dfrac{(${n}+1)(u_0+u_{${n}})}{2}=\\dfrac{${n + 1}\\times (${u0}+${u0 + n * d})}{2}=${euro(tot)}`)}.`,
          ok: () => { let s = 0, u = u0; for (let i = 0; i <= n; i++) { s += u; u += d; } return s === tot; } };
      }
      const v = 50 * r.int(1, 30), q = r.pick([2, 3, 4]), n = r.int(3, 6), tot = (v * (q ** (n + 1) - 1)) / (q - 1);
      return { q: `Une chaîne de messages est lancée : ${M(v)} personnes la reçoivent le jour 0, puis chaque jour ${q} fois plus de personnes que la veille la reçoivent. Combien de messages ont été reçus au total du jour 0 au jour ${M(n)} ?`, a: `Suite géométrique de raison ${M(q)} : ${M(`S=${v}\\times\\dfrac{${q}^{${n + 1}}-1}{${q}-1}=${tot}`)} messages.`,
        ok: () => { let s = 0, u = v; for (let i = 0; i <= n; i++) { s += u; u *= q; } return s === tot; } };
    } },

  { id: 'm2-seq-threshold', cls: C, chapter: 'stmg-01', domain: 'suites', skill: 'Seuil de dépassement d’une suite', fast: true,
    make(r, level) {
      if (level === 1) {
        const u0 = 100 * r.int(2, 9), d = r.pick([15, 20, 25, 30, 40]), T = u0 + d * r.int(6, 25) + r.int(1, d - 1), n = firstAbove(u0, (u) => u + d, T);
        return { q: `Un abonnement coûte ${M(euro(u0))} la première année et augmente de ${M(euro(d))} chaque année. À partir de quelle année dépasse-t-il ${M(euro(T))} ? (On note ${M(`u_0=${u0}`)} l’année 0.)`, a: `${M(`u_n=${u0}+${d}n>${T}\\iff n>\\dfrac{${T - u0}}{${d}}=${nf((T - u0) / d)}`)} : dès l’année ${M(n)}.`, ok: () => arith(u0, d, n) > T && arith(u0, d, n - 1) <= T };
      }
      const t = r.pick([2, 3, 4, 5, 6, 8, 10]), up = r.next() < 0.7, u0 = 100 * r.int(2, 20), q = 1 + (up ? t : -t) / 100, T = up ? Math.round(u0 * (1.4 + r.int(0, 8) / 10)) : Math.round(u0 * (0.45 + r.int(0, 3) / 10));
      const n = (up ? firstAbove : firstBelow)(u0, (u) => u * q, up ? T : T), ok = up ? geom(u0, q, n) > T && geom(u0, q, n - 1) <= T : geom(u0, q, n) < T && geom(u0, q, n - 1) >= T;
      return { q: `Un capital de ${M(euro(u0))} ${up ? 'augmente' : 'diminue'} de ${M(`${t}\\,\\%`)} par an. À l’aide de la calculatrice (tableau de valeurs de ${M(`u_n=${u0}\\times ${numTex(F(Math.round(q * 100), 100))}^{n}`)}), déterminer à partir de quelle année il ${up ? 'dépasse' : 'devient inférieur à'} ${M(euro(T))}.`,
        a: `${M(`u_{${n - 1}}\\approx ${nf(geom(u0, q, n - 1))}`)} et ${M(`u_{${n}}\\approx ${nf(geom(u0, q, n))}`)} : dès l’année ${M(n)}.`, ok: () => ok && n > 0 };
    } },

  { id: 'm2-seq-model', cls: C, chapter: 'stmg-01', domain: 'suites', skill: 'Comparer deux modèles de croissance', fast: false,
    make(r, level) {
      const a0 = 1000 * r.int(10, 30), d = r.pick([500, 800, 1000, 1200, 1500]), b0 = a0 - 1000 * r.int(1, 4), t = r.pick([3, 4, 5, 6, 8]);
      const A = (n) => a0 + d * n, B = (n) => b0 * (1 + t / 100) ** n; let n = 0; while (B(n) <= A(n) && n < 200) n++;
      if (n >= 200 || n === 0) return this.make(r, level);
      return { q: `Deux salaires annuels de départ : l’entreprise A propose ${M(euro(a0))} avec une augmentation fixe de ${M(euro(d))} par an ; l’entreprise B propose ${M(euro(b0))} avec une augmentation de ${M(`${t}\\,\\%`)} par an. À partir de quelle année le salaire de B dépasse-t-il celui de A ? (Année 0 : salaire de départ.)`,
        a: `A : suite arithmétique ${M(`a_n=${a0}+${d}n`)} ; B : suite géométrique ${M(`b_n=${b0}\\times ${numTex(cmOf(t))}^{n}`)}. Le tableau de valeurs donne ${M(`b_{${n - 1}}\\approx ${nf(B(n - 1))}\\leqslant a_{${n - 1}}=${A(n - 1)}`)} puis ${M(`b_{${n}}\\approx ${nf(B(n))}>a_{${n}}=${A(n)}`)} : dès l’année ${M(n)}.`,
        ok: () => { for (let k = 0; k < n; k++) if (b0 * geomF(1 + t / 100, k) > a0 + d * k) return false; return b0 * geomF(1 + t / 100, n) > a0 + d * n; } };
    } },

  // ============================ 02 Fonctions exponentielles ============================
  { id: 'm2-exp-qcm', cls: C, chapter: 'stmg-02', domain: 'fonctions', skill: 'QCM sur les évolutions exponentielles', fast: true,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['mono', 'avg'] : ['mono', 'avg', 'global']);
      if (kind === 'mono') {
        const a = r.int(1, 9), q = r.pick([0.5, 0.8, 0.9, 1.1, 1.2, 1.5, 2, 3]), f = (x) => a * q ** x, dir = q > 1 ? 'croissante' : 'décroissante';
        const opts = ['croissante', 'décroissante', 'constante', 'tantôt croissante, tantôt décroissante'];
        return qcmNum(r, `La fonction ${M(`f(x)=${a}\\times ${dc(q)}^{x}`)} est :`, [dir, q > 1 ? `la base ${M(dc(q))} est supérieure à ${M(1)} et ${M(a)} est positif.` : `la base ${M(dc(q))} est comprise entre ${M(0)} et ${M(1)} et ${M(a)} est positif.`],
          opts.filter((o) => o !== dir).map((o) => [o, o === (q > 1 ? 'décroissante' : 'croissante') ? 'confond le rôle de la base (supérieure ou inférieure à 1).' : 'ne reconnaît pas une fonction exponentielle de base positive.']), (o) => M(`\\text{${o}}`),
          (o) => { const v = [0, 1, 2, 3].map(f); const inc = v.every((x, i) => i === 0 || x > v[i - 1]), de = v.every((x, i) => i === 0 || x < v[i - 1]); return o === 'croissante' ? inc : o === 'décroissante' ? de : o === 'constante' ? v.every((x) => x === v[0]) : !inc && !de; });
      }
      if (kind === 'avg') {
        const t = r.pick([5, 10, 20, 25, 50]), n = r.int(2, 4), total = sub(powF(cmOf(t), n), F(1));
        return qcmNum(r, `Une grandeur augmente de ${M(pctF(total))} en ${M(n)} ans, avec le même taux annuel. Ce taux annuel est :`, [t, `${M(`CM^{${n}}=${numTex(add(F(1), total))}`)} donc ${M(`CM=${numTex(cmOf(t))}`)} : ${M(`${t}\\,\\%`)} par an.`],
          [[val(total) * 100 / n, `divise le taux global par ${M(n)} : les taux ne s’additionnent pas.`], [val(total) * 100 / n + 1, 'ajoute 1 au taux moyen arithmétique.'], [t + 5, 'se trompe de coefficient multiplicateur.'], [val(add(F(1), total)) * 100 - 100 === 0 ? 1 : (val(add(F(1), total)) ** (1 / (n + 1)) - 1) * 100, `prend une racine ${M(n + 1)}-ième au lieu d’une racine ${M(n)}-ième.`]], (v) => M(`${nf(Math.round(v * 100) / 100)}\\,\\%`),
          (v) => Math.abs((1 + v / 100) ** n - val(add(F(1), total))) < 1e-9);
      }
      const a = r.pick([5, 10, 20, 25]), b = r.pick([5, 10, 20, 30]), cm = mul(cmOf(a), cmOf(-b)), tot = sub(cm, F(1));
      return qcmNum(r, `Un prix augmente de ${M(`${a}\\,\\%`)} puis diminue de ${M(`${b}\\,\\%`)}. L’évolution globale est :`, [tot, `${M(`${numTex(cmOf(a))}\\times ${numTex(cmOf(-b))}=${numTex(cm)}`)}.`],
        [[F(a - b, 100), 'soustrait les taux.'], [F(-(a * b), 10000), 'multiplie les taux.'], [F(a + b, 100), 'additionne les taux.'], [sub(cmOf(a), F(1)), 'ne tient compte que de la hausse.']], (w) => M(pctF(w)), (w) => eq(add(F(1), w), mul(cmOf(a), cmOf(-b))));
    } },

  { id: 'm2-exp-tf', cls: C, chapter: 'stmg-02', domain: 'fonctions', skill: 'Vrai ou faux sur les évolutions exponentielles', fast: false,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['cumul', 'scale'] : ['cumul', 'scale', 'sym']);
      const t = r.int(2, 60), n = r.int(2, 6);
      if (kind === 'cumul') { const up = r.next() < 0.6, T = up ? t : -t, glob = sub(powF(cmOf(T), n), F(1)); return tf({ s: `Une grandeur ${up ? 'augmente' : 'diminue'} de ${t} % par an pendant ${n} ans : l’évolution globale est une ${up ? 'hausse' : 'baisse'} de ${n * t} %.`, v: false, c: () => !eq(glob, F(T * n, 100)),
        j: `Le coefficient global est ${M(`${numTex(cmOf(T))}^{${n}}=${numTex(add(F(1), glob))}`)} : l’évolution est de ${M(pctF(glob))} et non de ${M(`${up ? '+' : '-'}${n * t}\\,\\%`)} (les taux ne s’additionnent pas).` }); }
      if (kind === 'scale') { const claim = r.pick([n * 2, 2 ** n, n + 2]); const ok = claim === 2 ** n; return tf({ s: `Une population double chaque année. Au bout de ${n} ans elle est multipliée par ${claim}.`, v: ok, c: () => ok === (geomI(2, n) === claim), j: `Elle est multipliée par ${M(`2^{${n}}=${2 ** n}`)}${ok ? '.' : ` et non par ${M(claim)}.`}` }); }
      const q = r.pick([0.5, 0.8, 2, 1.25, 1.5, 0.9]), claim = r.pick([true, false]), ok = claim === (q > 1);
      return tf({ s: `La fonction ${M(`x\\mapsto ${dc(q)}^{x}`)} est ${claim ? 'croissante' : 'décroissante'} sur ${M('\\mathbb{R}')}.`, v: ok, c: () => { const v = [0, 1, 2].map((x) => q ** x); return (claim ? v[2] > v[1] && v[1] > v[0] : v[2] < v[1] && v[1] < v[0]) === ok; },
        j: `La base ${M(dc(q))} est ${q > 1 ? 'supérieure' : 'comprise entre ' + M(0) + ' et ' + M(1) + ' ; elle est inférieure'} à ${M(1)} : la fonction est ${q > 1 ? 'croissante' : 'décroissante'}.`.replace('inférieure à', q > 1 ? 'à' : 'à') });
    } },

  { id: 'm2-exp-error', cls: C, chapter: 'stmg-02', domain: 'fonctions', skill: 'Trouver l’erreur sur une évolution', fast: false,
    make(r, level) {
      if (r.next() < 0.5) {
        const V = 100 * r.int(2, 20), t = r.pick([5, 10, 20, 25]), n = r.int(2, 5), good = V * (1 + t / 100) ** n, bad = V * (1 + (n * t) / 100);
        if (Math.abs(good - bad) < 1e-6) return this.make(r, level);
        return spot(`Un capital de ${M(euro(V))} augmente de ${M(`${t}\\,\\%`)} par an. Un élève calcule sa valeur après ${M(n)} ans.`, [M(`\\text{Hausse totale}=${n}\\times ${t}\\,\\%=${n * t}\\,\\%`), M(`CM=1+\\dfrac{${n * t}}{100}=${numTex(cmOf(n * t))}`), M(`V_{${n}}=${V}\\times ${numTex(cmOf(n * t))}=${nf(bad)}\\ \\text{€}`)], 0,
          'on ne multiplie pas le taux par le nombre d’années : on élève le coefficient multiplicateur à la puissance ' + M(n) + '.', M(`CM=${numTex(cmOf(t))}^{${n}}`), M(`V_{${n}}=${V}\\times ${numTex(cmOf(t))}^{${n}}\\approx ${nf(Math.round(good * 100) / 100)}\\ \\text{€}`), () => Math.abs(good - V * geomF(1 + t / 100, n)) < 1e-9 && Math.abs(good - bad) > 1e-6);
      }
      const t = r.pick([10, 20, 25, 30, 40]), V = r.int(2, 20) * 50, good = V * (1 - t / 100), bad = V * (1 + t / 100);
      return spot(`Un article de ${M(euro(V))} subit une baisse de ${M(`${t}\\,\\%`)}. Un élève cherche le nouveau prix.`, [M(`t=-${t}\\,\\%`), M(`CM=1+\\dfrac{${t}}{100}=${numTex(cmOf(t))}`), M(`\\text{prix}=${V}\\times ${numTex(cmOf(t))}=${nf(bad)}\\ \\text{€}`)], 1,
        `pour une baisse le coefficient multiplicateur est ${M(`1-\\dfrac{${t}}{100}`)} : le taux est négatif.`, M(`CM=1-\\dfrac{${t}}{100}=${numTex(cmOf(-t))}`), M(`\\text{prix}=${V}\\times ${numTex(cmOf(-t))}=${nf(good)}\\ \\text{€}`), () => Math.abs(good - V * (1 - t / 100)) < 1e-9 && good < V);
    } },

  { id: 'm2-exp-rate', cls: C, chapter: 'stmg-02', domain: 'fonctions', skill: 'Taux d’évolution annuel moyen', fast: true,
    make(r, level) {
      const n = r.int(2, 5);
      if (level < 3) {
        const t = r.pick([5, 10, 20, 25, 50]), V0 = 100 * r.int(2, 20), Vn = mul(F(V0), powF(cmOf(t), n));
        return { q: `La valeur d’un placement passe de ${M(euro(V0))} à ${M(`${numTex(Vn)}\\ \\text{€}`)} en ${M(n)} ans, avec un taux annuel constant. Quel est ce taux ?`, a: `${M(`CM^{${n}}=\\dfrac{${numTex(Vn)}}{${V0}}=${numTex(div(Vn, F(V0)))}`)} donc ${M(`CM=${numTex(cmOf(t))}`)} : le taux annuel est ${M(`${t}\\,\\%`)}.`,
          ok: () => eq(mul(F(V0), powF(cmOf(t), n)), Vn) && Math.abs((val(Vn) / V0) ** (1 / n) - (1 + t / 100)) < 1e-9 };
      }
      const V0 = 100 * r.int(5, 40), Vn = V0 + r.int(10, 90) * 10 * (r.next() < 0.5 ? 1 : -1) , rate = (Vn / V0) ** (1 / n) - 1, s = safeRound(rate * 100, 2);
      if (s === null || Vn <= 0) return this.make(r, level);
      return { q: `Le chiffre d’affaires d’une entreprise est passé de ${M(euro(V0))} à ${M(euro(Vn))} en ${M(n)} ans. Quel est le taux d’évolution annuel moyen, arrondi à ${M('0{,}01\\,\\%')} ?`, a: `${M(`CM=\\left(\\dfrac{${Vn}}{${V0}}\\right)^{1/${n}}\\approx ${roundTex((Vn / V0) ** (1 / n), 4)}`)}, soit un taux de ${M(`${s}\\,\\%`)} par an.`,
        ok: () => roundTex((Math.exp(Math.log(Vn / V0) / n) - 1) * 100, 2) === s && Math.abs(V0 * (1 + parseFloat(s.replace('{,}', '.')) / 100) ** n - Vn) < 0.01 * Vn };
    } },

  { id: 'm2-exp-recip', cls: C, chapter: 'stmg-02', domain: 'nombres', skill: 'Évolution réciproque', fast: false,
    make(r, level) {
      const t = r.int(3, 160), up = r.next() < 0.7 || level === 1, T = up ? t : -Math.min(t, 80), rec = sub(div(F(1), cmOf(T)), F(1));
      return { q: `Après ${T > 0 ? 'une hausse' : 'une baisse'} de ${M(`${Math.abs(T)}\\,\\%`)}, quelle évolution (en pourcentage) ramène à la valeur de départ ?`, a: `${M(`CM=${numTex(cmOf(T))}`)} donc l’évolution réciproque a pour coefficient ${M(`\\dfrac{1}{${numTex(cmOf(T))}}=${fracTex(div(F(1), cmOf(T)))}`)} : ${M(`t'${dec(F(rec.n * 100, rec.d), 2)}\\,\\%`)}${dec(F(rec.n * 100, rec.d), 2).startsWith('=') ? '' : ' (arrondi au centième)'}.`,
        ok: () => eq(mul(cmOf(T), add(F(1), rec)), F(1)) && (T > 0 ? val(rec) < 0 : val(rec) > 0) };
    } },

  { id: 'm2-exp-compare', cls: C, chapter: 'stmg-02', domain: 'fonctions', skill: 'Comparer deux évolutions exponentielles', fast: false,
    make(r, level) {
      const a = r.pick([2, 3, 4, 5]), b = a + r.pick([2, 3, 4, 5]), VA = 100 * r.int(15, 40), VB = VA - 100 * r.int(2, 8);
      let n = 0; while (VB * (1 + b / 100) ** n <= VA * (1 + a / 100) ** n && n < 300) n++;
      if (n === 0 || n >= 300) return this.make(r, level);
      return { q: `Deux villes ont aujourd’hui ${M(VA)} milliers d’habitants (ville A, croissance de ${M(`${a}\\,\\%`)} par an) et ${M(VB)} milliers (ville B, croissance de ${M(`${b}\\,\\%`)} par an). Au bout de combien d’années B dépasse-t-elle A ?`,
        a: `${M(`${VA}\\times ${numTex(cmOf(a))}^{n}`)} contre ${M(`${VB}\\times ${numTex(cmOf(b))}^{n}`)} : pour ${M(`n=${n - 1}`)}, ${M(`${nf(VB * geomF(1 + b / 100, n - 1))}\\leqslant ${nf(VA * geomF(1 + a / 100, n - 1))}`)} ; pour ${M(`n=${n}`)}, ${M(`${nf(VB * geomF(1 + b / 100, n))}>${nf(VA * geomF(1 + a / 100, n))}`)}. B dépasse A dès l’année ${M(n)}.`,
        ok: () => { for (let k = 0; k < n; k++) if (VB * geomF(1 + b / 100, k) > VA * geomF(1 + a / 100, k)) return false; return VB * geomF(1 + b / 100, n) > VA * geomF(1 + a / 100, n); } };
    } },

  // ============================ 03 Logarithme décimal ============================
  { id: 'm2-log-qcm', cls: C, chapter: 'stmg-03', domain: 'fonctions', skill: 'QCM sur le logarithme décimal', fast: true,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['sum', 'solve'] : ['sum', 'solve', 'pow']);
      if (kind === 'sum') {
        const [a, b, k] = r.pick([[4, 25, 2], [2, 50, 2], [5, 20, 2], [8, 125, 3], [20, 50, 3], [25, 40, 3], [2, 5, 1], [4, 250, 3], [16, 625, 4], [200, 50, 4]]);
        return qcmNum(r, `${M(`\\log ${a}+\\log ${b}`)} est égal à :`, [k, `${M(`\\log a+\\log b=\\log(ab)`)} : ${M(`\\log(${a}\\times ${b})=\\log ${k === 1 ? '10' : `10^{${k}}`}=${k}`)}.`],
          [[Math.log10(a + b), `calcule ${M(`\\log(${a}+${b})`)}.`], [k + 1, 'se trompe d’une puissance de 10.'], [Math.log10(a) * Math.log10(b), 'multiplie les logarithmes.'], [a * b, 'oublie le logarithme du produit.']], (v) => M(Number.isInteger(v) ? v : `\\approx ${roundTex(v, 3)}`), (v) => Math.abs(lg(a) + lg(b) - v) < 5e-4 && (Number.isInteger(v) ? true : true));
      }
      if (kind === 'solve') {
        const k = r.pick([100, 1000, 10000, 0.1, 0.01, 0.001, 1]), x = Math.round(Math.log10(k));
        return qcmNum(r, `La solution de l’équation ${M(`10^{x}=${dc(k)}`)} est :`, [x, `${M(`x=\\log ${dc(k)}=${x}`)} car ${M(`${dc(k)}=10^{${x}}`)}.`],
          [[-x || 1, 'se trompe de signe.'], [k, 'prend ' + M('x') + ' égal au second membre.'], [x + 1, 'se trompe d’une unité dans l’exposant.'], [Math.round(k / 10) || 2, 'divise par 10 au lieu de chercher l’exposant.']], M, (v) => Math.abs(10 ** v - k) < 1e-9);
      }
      const a = r.pick([2, 3, 5, 7]), n = r.int(2, 6), val10 = n * Math.log10(a);
      return qcmNum(r, `${M(`\\log(${a}^{${n}})`)} est égal à :`, [{ t: `${n}\\log ${a}`, v: val10 }, `${M(`\\log(a^{n})=n\\log a`)}.`],
        [[{ t: `(\\log ${a})^{${n}}`, v: Math.log10(a) ** n }, 'élève le logarithme à la puissance ' + M(n) + '.'], [{ t: `${a}\\log ${n}`, v: a * Math.log10(n) }, 'échange la base et l’exposant.'], [{ t: `\\log ${a}+${n}`, v: Math.log10(a) + n }, 'ajoute l’exposant au lieu de le multiplier.']], (o) => M(o.t), (o) => Math.abs(o.v - Math.log10(a ** n)) < 1e-9);
    } },

  { id: 'm2-log-tf', cls: C, chapter: 'stmg-03', domain: 'fonctions', skill: 'Vrai ou faux sur le logarithme décimal', fast: false,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['prod', 'pow'] : ['prod', 'pow', 'quot']);
      const a = r.int(2, 30), b = r.int(2, 30);
      if (kind === 'prod') { const right = r.next() < 0.5, rhs = right ? a * b : a + b, ok = rhs === a * b; return tf({ s: `${M(`\\log ${a}+\\log ${b}=\\log ${rhs}`)}.`.replace(/^\\\(|\\\)\.$/g, (m) => m), v: ok, c: () => ok === (Math.abs(lg(a) + lg(b) - lg(rhs)) < 1e-12),
        j: ok ? `${M(`\\log ${a}+\\log ${b}=\\log(${a}\\times ${b})=\\log ${a * b}`)}.` : `La somme de deux logarithmes est le logarithme du produit : ${M(`\\log ${a}+\\log ${b}=\\log ${a * b}`)}, et ${M(`${a * b}\\neq ${a + b}`)}.` }); }
      if (kind === 'pow') { const n = r.int(2, 5), p = r.pick([2, 3, 5]), right = r.next() < 0.5, rhs = right ? `${n}\\log ${p}` : `${p}\\log ${n}`, ok = right;
        if (!right && Math.abs(n * lg(p) - p * lg(n)) < 1e-12) return this.make(r, level); return tf({ s: `${M(`\\log(${p}^{${n}})=${rhs}`)}.`, v: ok, c: () => ok === (Math.abs(lg(p ** n) - (right ? n * lg(p) : p * lg(n))) < 1e-12),
        j: ok ? `${M(`\\log(a^{n})=n\\log a`)} : ${M(`\\log(${p}^{${n}})=${n}\\log ${p}`)}.` : `${M(`\\log(${p}^{${n}})=${n}\\log ${p}${al(n * Math.log10(p))}`)} alors que ${M(`${p}\\log ${n}${al(p * Math.log10(n))}`)}.` }); }
      const big = Math.max(a, b) + r.int(1, 20), small = Math.min(a, b) + 1, right = r.next() < 0.5, lhs = `\\log ${big}-\\log ${small}`, rhs = right ? big / small : big - small, ok = right && Math.abs(big / small - rhs) < 1e-12;
      return tf({ s: `${M(`${lhs}=\\log\\left(${right ? `\\dfrac{${big}}{${small}}` : `${big}-${small}`}\\right)`)}.`, v: ok, c: () => ok === (Math.abs(lg(big) - lg(small) - lg(rhs)) < 1e-12),
        j: ok ? `${M(`\\log a-\\log b=\\log\\dfrac{a}{b}`)}.` : `La différence de logarithmes est le logarithme du quotient : ${M(`\\log\\dfrac{${big}}{${small}}${al(Math.log10(big / small))}`)} alors que ${M(`\\log(${big - small})${al(Math.log10(big - small))}`)}.` });
    } },

  { id: 'm2-log-error', cls: C, chapter: 'stmg-03', domain: 'fonctions', skill: 'Trouver l’erreur dans une résolution avec log', fast: false,
    make(r, level) {
      if (r.next() < 0.5) {
        const t = r.int(2, 15), T = r.int(2, 9), q = 1 + t / 100, x = Math.log10(T) / Math.log10(q), n = Math.floor(x);
        if (Math.abs(x - Math.round(x)) < 0.05) return this.make(r, level);
        return spot(`Un élève cherche le plus petit entier ${M('n')} tel que ${M(`${numTex(F(Math.round(q * 100), 100))}^{n}\\geqslant ${T}`)}.`, [M(`${numTex(F(Math.round(q * 100), 100))}^{n}\\geqslant ${T}\\iff n\\log ${numTex(F(Math.round(q * 100), 100))}\\geqslant\\log ${T}`), M(`n\\geqslant\\dfrac{\\log ${T}}{\\log ${numTex(F(Math.round(q * 100), 100))}}\\approx ${roundTex(x, 2)}`), M(`\\text{donc }n=${n}`)], 2,
          `${M(roundTex(x, 2))} n’est pas atteint par ${M(n)} : le plus petit entier supérieur ou égal à ${M(roundTex(x, 2))} est ${M(n + 1)}.`, M(`n\\geqslant ${roundTex(x, 2)}`), M(`n=${n + 1}`), () => q ** (n + 1) >= T && q ** n < T);
      }
      const t = r.int(3, 40), q = 1 - t / 100, T = r.pick([0.5, 0.4, 0.3, 0.25, 0.2, 0.1]), x = Math.log10(T) / Math.log10(q), n = Math.ceil(x);
      if (Math.abs(x - Math.round(x)) < 0.05) return this.make(r, level);
      return spot(`Un élève cherche le plus petit entier ${M('n')} tel que ${M(`${dc(q)}^{n}\\leqslant ${dc(T)}`)}.`, [M(`${dc(q)}^{n}\\leqslant ${dc(T)}\\iff n\\log ${dc(q)}\\leqslant\\log ${dc(T)}`), M(`n\\leqslant\\dfrac{\\log ${dc(T)}}{\\log ${dc(q)}}\\approx ${roundTex(x, 2)}`), M(`\\text{donc }n=${Math.floor(x)}\\text{ ou moins}`)], 1,
        `${M(`\\log ${dc(q)}`)} est négatif : en divisant par ce nombre négatif on renverse l’inégalité.`, M(`n\\geqslant\\dfrac{\\log ${dc(T)}}{\\log ${dc(q)}}\\approx ${roundTex(x, 2)}`), M(`n=${n}`), () => q ** n <= T && q ** (n - 1) > T);
    } },

  { id: 'm2-log-solve', cls: C, chapter: 'stmg-03', domain: 'fonctions', skill: 'Résoudre q^n ≥ T avec le logarithme', fast: true,
    make(r, level) {
      if (level === 1) { const k = r.int(2, 4000); return { q: `Résoudre dans ${M('\\mathbb{R}')} l’équation ${M(`10^{x}=${k}`)} et donner la solution arrondie au millième.`, a: `${M(`x=\\log ${k}${al(Math.log10(k))}`)}.`, ok: () => roundTex(Math.log(k) / Math.LN10, 3) === L3(k) && Math.abs(10 ** Math.log10(k) - k) < 1e-6 * k }; }
      const t = r.pick([2, 3, 4, 5, 6, 8, 10, 12, 15]), up = r.next() < 0.75, q = 1 + (up ? t : -t) / 100, C0 = level === 3 ? 100 * r.int(2, 30) : 1, T = C0 === 1 ? (up ? r.pick([2, 3, 4, 5, 8, 10, 20]) : r.pick([0.5, 0.4, 0.3, 0.25, 0.2, 0.1])) : up ? Math.round(C0 * (1.3 + r.int(0, 15) / 10)) : Math.round(C0 * (0.3 + r.int(0, 4) / 10));
      const ratio = T / C0, x = Math.log10(ratio) / Math.log10(q), n = up ? Math.ceil(x) : Math.ceil(x);
      if (Math.abs(x - Math.round(x)) < 0.03 || ratio === 1) return this.make(r, level);
      const op = up ? '\\geqslant' : '\\leqslant';
      return { q: `${C0 === 1 ? '' : `Un capital de ${M(euro(C0))} ${up ? 'augmente' : 'diminue'} de ${M(`${t}\\,\\%`)} par an. `}Déterminer le plus petit entier ${M('n')} tel que ${M(`${C0 === 1 ? '' : C0 + '\\times '}${dc(q)}^{n}${op} ${T}`)}.`, a: `${M(`${dc(q)}^{n}${op}${C0 === 1 ? T : `\\dfrac{${T}}{${C0}}`}\\iff n\\log ${dc(q)}${op}\\log ${C0 === 1 ? T : `\\dfrac{${T}}{${C0}}`}`)}${up ? '' : ` (on divise par ${M(`\\log ${dc(q)}`)} négatif : l’inégalité change de sens)`} donc ${M(`n${up ? '\\geqslant' : '\\geqslant'}${roundTex(x, 2)}`)}, soit ${M(`n=${n}`)}.`,
        ok: () => (up ? C0 * q ** n >= T && C0 * q ** (n - 1) < T : C0 * q ** n <= T && C0 * q ** (n - 1) > T) };
    } },

  { id: 'm2-log-ctx', cls: C, chapter: 'stmg-03', domain: 'fonctions', skill: 'pH, décibels et échelles logarithmiques', fast: false,
    make(r, level) {
      const kind = r.pick(['ph', 'db']);
      if (kind === 'ph') { const m = r.int(11, 99) / 10, e = r.int(3, 9), pH = e - Math.log10(m), s = safeRound(pH, 2); if (s === null) return this.make(r, level);
        return { q: `Le pH d’une solution est ${M('\\text{pH}=-\\log[\\text{H}^{+}]')}. Calculer le pH d’une solution où ${M(`[\\text{H}^{+}]=${dc(m)}\\times 10^{-${e}}\\ \\text{mol/L}`)} (arrondir au centième).`, a: `${M(`\\text{pH}=-\\log(${dc(m)})-\\log(10^{-${e}})=${e}-\\log ${dc(m)}\\approx ${s}`)}.`, ok: () => roundTex(-(Math.log(m * 10 ** -e) / Math.LN10), 2) === s }; }
      const k = r.int(2, 300), L = 10 * Math.log10(k), s = safeRound(L, 1);
      if (s === null) return this.make(r, level);
      return { q: `Le niveau sonore en décibels est ${M('L=10\\log\\dfrac{I}{I_0}')}. Une source dont l’intensité est ${M(k)} fois l’intensité de référence ${M('I_0')} a quel niveau sonore (arrondi au dixième) ?`, a: `${M(`L=10\\log ${k}${al(L, 1)}\\ \\text{dB}`)}.`, ok: () => roundTex(10 * (Math.log(k) / Math.LN10), 1) === s };
    } },

  { id: 'm2-log-digits', cls: C, chapter: 'stmg-03', domain: 'nombres', skill: 'Nombre de chiffres d’une puissance', fast: true,
    make(r, level) {
      const a = r.pick([2, 3, 5, 7]), n = r.int(10, 80), x = n * Math.log10(a), d = Math.floor(x) + 1;
      if (Math.abs(x - Math.round(x)) < 0.002) return this.make(r, level);
      return { q: `Combien de chiffres s’écrit ${M(`${a}^{${n}}`)} en base dix ? (Utiliser ${M(`\\log ${a}\\approx ${roundTex(Math.log10(a), 4)}`)}.)`, a: `${M(`\\log(${a}^{${n}})=${n}\\log ${a}\\approx ${roundTex(x, 2)}`)} donc ${M(`10^{${Math.floor(x)}}\\leqslant ${a}^{${n}}<10^{${Math.floor(x) + 1}}`)} : ${M(d)} chiffres.`,
        ok: () => String(BigInt(a) ** BigInt(n)).length === d };
    } },
];

// exact helpers used above (kept local: they are the "other route" of several checks)
function dc(x) { return String(x).replace('.', '{,}'); }
function geomF(base, n) { let u = 1; for (let i = 0; i < n; i++) u *= base; return u; }
function geomI(b, n) { let u = 1; for (let i = 0; i < n; i++) u *= b; return u; }
function powF(f, n) { let out = F(1); for (let i = 0; i < n; i++) out = mul(out, f); return out; }
function pctF(f) { return `${f.n < 0 ? '-' : '+'}${numTex(F(Math.abs(f.n) * 100, f.d))}\\,\\%`; }
