// Terminale STMG generators, third file (chapters 04 to 06: fonction inverse, statistiques à deux variables, probabilités conditionnelles):
// four-choice questions with one typical error per wrong option, true/false, find-the-error, contexts and multi-step items with seeded
// parameters. Same contract as templates-stmg.js; every ok() recomputes the answer another way (exact fractions, normal equations, enumeration).
import { F, add, sub, mul, div, val, eq, M, fracTex, numTex, roundTex, polyTex, sgn, par } from './engine.js';
import { tf, spot } from './premiere-kit.js';
import { dec, parT } from './seconde-kit.js';
import { qcmNum } from './seconde-kit-2.js';
import { safeRound } from './stmg-kit.js';

const C = 'stmg';
const nf = (x) => (Number.isInteger(x) ? `${x}` : roundTex(x, 2));
const dcm = (f) => numTex(f);
const pc = (f) => `${numTex(F(f.n * 100, f.d))}\\,\\%`;
const inv = (a, x) => a / x;
// membership of x in a set given as a predicate, tested on a grid and next to the interesting points
const probe = (extra) => [...Array.from({ length: 161 }, (_, i) => -20 + i * 0.25).filter((x) => x !== 0), ...extra.flatMap((e) => [e - 1e-6, e + 1e-6])];
const agree = (f, g, extra = []) => probe(extra).every((x) => f(x) === g(x));
const same = (u, v) => Math.abs(u - v) < 1e-9;

export const stmg3 = [
  // ============================ 04 Fonction inverse ============================
  { id: 'm3-inv-qcm', cls: C, chapter: 'stmg-04', domain: 'fonctions', skill: 'QCM sur la fonction inverse', fast: true,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['mono', 'anteced'] : ['mono', 'anteced', 'image']);
      if (kind === 'mono') {
        const k = r.nz(-9, 9), a = r.int(1, 4), b = a + r.int(1, 4), word = k > 0 ? 'décroissante' : 'croissante', opts = ['croissante', 'décroissante', 'constante', 'ni croissante ni décroissante'];
        const f = (x) => k / x;
        return qcmNum(r, `La fonction ${M(`f(x)=\\dfrac{${k}}{x}`)} est, sur ${M(']0\\,;\\,+\\infty[')} :`, [word, k > 0 ? `${M(k)} est positif : comme la fonction inverse, ${M('f')} est décroissante.` : `${M(k)} est négatif : ${M('f')} renverse les variations de la fonction inverse, elle est croissante.`],
          opts.filter((o) => o !== word).map((o) => [o, o === (k > 0 ? 'croissante' : 'décroissante') ? 'ne tient pas compte du signe de ' + M(k) + '.' : 'ne correspond à aucun sens de variation de ' + M('f') + '.']), (o) => M(`\\text{${o}}`),
          (o) => { const v = [1, 2, 3, 4, 5].map(f); const inc = v.every((x, i) => i === 0 || x > v[i - 1]), de = v.every((x, i) => i === 0 || x < v[i - 1]); return o === 'croissante' ? inc : o === 'décroissante' ? de : o === 'constante' ? v.every((x) => x === v[0]) : !inc && !de; });
      }
      if (kind === 'anteced') {
        let a = r.nz(-12, 12), kk = r.nz(-6, 6); const good = F(a, kk);
        return qcmNum(r, `L’antécédent de ${M(kk)} par la fonction ${M(`f(x)=\\dfrac{${a}}{x}`)} est :`, [good, `${M(`\\dfrac{${a}}{x}=${kk}\\iff x=\\dfrac{${a}}{${kk}}`)}.`],
          [[F(kk, a), 'inverse le quotient : ' + M(`x=\\dfrac{${kk}}{${a}}`) + '.'], [F(a * kk), 'multiplie ' + M(a) + ' et ' + M(kk) + '.'], [F(a - kk), 'soustrait au lieu de diviser.'], [F(-a, kk), 'se trompe de signe.']], (w) => M(fracTex(w)), (w) => w.n !== 0 && eq(div(F(a), w), F(kk)));
      }
      const a = r.nz(-9, 9), b = r.int(-6, 6), x0 = r.nz(-6, 6), good = add(F(a, x0), F(b));
      return qcmNum(r, `Soit ${M(`f(x)=\\dfrac{${a}}{x}${b === 0 ? '' : sgn(b)}`)}. L’image de ${M(x0)} est :`, [good, `${M(`f(${x0})=\\dfrac{${a}}{${par(x0)}}${b === 0 ? '' : sgn(b)}`)}.`],
        [[F(a, x0 + b || 1), 'divise par ' + M(`x+b`) + ' au lieu de diviser par ' + M('x') + ' puis d’ajouter ' + M('b') + '.'], [add(F(x0, a), F(b)), 'inverse le quotient.'], [add(F(-a, x0), F(b)), 'se trompe de signe.'], [F(a * x0 + b), 'multiplie au lieu de diviser.']], (w) => M(fracTex(w)), (w) => eq(w, F((a + b * x0), x0)));
    } },

  { id: 'm3-inv-tf', cls: C, chapter: 'stmg-04', domain: 'fonctions', skill: 'Vrai ou faux sur la fonction inverse', fast: false,
    make(r, level) {
      const k = r.nz(-8, 8), a = r.nz(-6, 6); let b = r.nz(-6, 6); if (b <= a) b = a + r.int(1, 5); if (b === 0) b = 1;
      const claim = r.pick(['<', '>']), fa = k / a, fb = k / b, ok = claim === '<' ? fa < fb : fa > fb;
      return tf({ s: `Pour ${M(`f(x)=\\dfrac{${k}}{x}`)}, comme ${M(`${a}<${b}`)}, on a ${M(`f(${a})${claim}f(${b})`)}.`, v: ok, c: () => ok === (claim === '<' ? k / a < k / b : k / a > k / b),
        j: `${M(`f(${a})=${fracTex(F(k, a))}`)} et ${M(`f(${b})=${fracTex(F(k, b))}`)} : ${M(`f(${a})${fa < fb ? '<' : '>'}f(${b})`)}.${a < 0 && b > 0 ? ' Les deux nombres ne sont pas dans le même intervalle de monotonie : la fonction n’est pas monotone sur ' + M('\\mathbb{R}^{*}') + '.' : ''}` });
    } },

  { id: 'm3-inv-error', cls: C, chapter: 'stmg-04', domain: 'fonctions', skill: 'Trouver l’erreur sur la fonction inverse', fast: false,
    make(r, level) {
      if (r.next() < 0.5) {
        const a = r.nz(-9, 9), b = r.nz(-6, 6), good = F(a, b), bad = F(b, a);
        if (eq(good, bad)) return this.make(r, level);
        return spot(`Un élève résout ${M(`\\dfrac{${a}}{x}=${b}`)}.`, [M(`\\dfrac{${a}}{x}=${b}`), M(`x=\\dfrac{${b}}{${a}}`), M(`x=${fracTex(bad)}`)], 1, `on multiplie par ${M('x')} puis on divise par ${M(b)} : ${M('x')} est le quotient de ${M(a)} par ${M(b)}.`, M(`x=\\dfrac{${a}}{${b}}`), M(`x=${fracTex(good)}`), () => eq(div(F(a), good), F(b)) && !eq(div(F(a), bad), F(b)));
      }
      const k = r.int(2, 9), x1 = F(1, k);
      return spot(`Un élève résout ${M(`\\dfrac{1}{x}\\geqslant ${k}`)} sur ${M(']0\\,;\\,+\\infty[')}.`, [M(`\\dfrac{1}{x}\\geqslant ${k}`), M(`1\\geqslant ${k}x`), M(`x\\geqslant\\dfrac{1}{${k}}`), M(`S=\\left[\\dfrac{1}{${k}}\\,;\\,+\\infty\\right[`)], 2,
        `on divise par ${M(k)} positif : le sens ne change pas, ${M(`1\\geqslant ${k}x`)} donne ${M(`x\\leqslant\\dfrac{1}{${k}}`)}.`, M(`x\\leqslant\\dfrac{1}{${k}}`), M(`S=\\left]0\\,;\\,\\dfrac{1}{${k}}\\right]`),
        () => agree((x) => x > 0 && 1 / x >= k - 1e-12, (x) => x > 0 && x <= 1 / k + 1e-12, [1 / k]) && !agree((x) => x > 0 && 1 / x >= k, (x) => x >= 1 / k));
    } },

  { id: 'm3-inv-solve', cls: C, chapter: 'stmg-04', domain: 'fonctions', skill: 'Résoudre une inéquation avec la fonction inverse', fast: true,
    make(r, level) {
      const a = r.int(1, 12), k = r.int(1, 9), root = F(a, k);
      if (level === 1) { const op = r.pick(['\\geqslant', '\\leqslant']), geq = op === '\\geqslant', S = geq ? `\\left]0\\,;\\,${fracTex(root)}\\right]` : `\\left[${fracTex(root)}\\,;\\,+\\infty\\right[`;
        return { q: `Résoudre sur ${M(']0\\,;\\,+\\infty[')} l’inéquation ${M(`\\dfrac{${a}}{x}${op}${k}`)}.`, a: `${M('x>0')} : ${M(`\\dfrac{${a}}{x}${op}${k}\\iff ${a}${op}${k}x\\iff x${geq ? '\\leqslant' : '\\geqslant'}${fracTex(root)}`)} donc ${M(`S=${S}`)}.`,
          ok: () => agree((x) => x > 0 && (geq ? a / x >= k - 1e-12 : a / x <= k + 1e-12), (x) => x > 0 && (geq ? x <= val(root) + 1e-12 : x >= val(root) - 1e-12), [val(root)]) }; }
      if (level === 2) { const b = r.int(1, 6), c = b + k, root2 = F(a, k);
        return { q: `Résoudre sur ${M(']0\\,;\\,+\\infty[')} l’inéquation ${M(`\\dfrac{${a}}{x}+${b}\\leqslant ${c}`)}.`, a: `${M(`\\dfrac{${a}}{x}\\leqslant ${c}-${b}=${k}`)} donc ${M(`${a}\\leqslant ${k}x`)} (car ${M('x>0')}) et ${M(`x\\geqslant ${fracTex(root2)}`)} : ${M(`S=\\left[${fracTex(root2)}\\,;\\,+\\infty\\right[`)}.`,
          ok: () => agree((x) => x > 0 && a / x + b <= c + 1e-12, (x) => x > 0 && x >= val(root2) - 1e-12, [val(root2)]) }; }
      return { q: `Résoudre sur ${M('\\mathbb{R}^{*}')} l’inéquation ${M(`\\dfrac{${a}}{x}<${k}`)}.`, a: `Si ${M('x<0')}, ${M(`\\dfrac{${a}}{x}<0<${k}`)} : tout ${M('x<0')} convient. Si ${M('x>0')}, ${M(`\\dfrac{${a}}{x}<${k}\\iff x>${fracTex(root)}`)}. Donc ${M(`S=]-\\infty\\,;\\,0[\\,\\cup\\,\\left]${fracTex(root)}\\,;\\,+\\infty\\right[`)}.`,
        ok: () => agree((x) => a / x < k, (x) => x < 0 || x > val(root), [val(root)]) };
    } },

  { id: 'm3-inv-cost', cls: C, chapter: 'stmg-04', domain: 'fonctions', skill: 'Coût moyen et fonction inverse', fast: false,
    make(r, level) {
      const a = r.int(2, 12), b = 100 * r.int(2, 15), target = a + r.int(1, 6), q1 = r.int(1, 10) * 10;
      const C1 = (q) => a + b / q, n = Math.ceil(b / (target - a));
      const unit = r.pick(['pièces', 'repas', 'billets', 'exemplaires']);
      return { q: `Une entreprise fabrique des ${unit} avec un coût fixe de ${M(`${b}\\ \\text{€}`)} et un coût de ${M(`${a}\\ \\text{€}`)} par unité. Le coût moyen d’une unité pour ${M('q')} unités est ${M(`C_m(q)=\\dfrac{${b}+${a}q}{q}=${a}+\\dfrac{${b}}{q}`)}. 1) Calculer ${M(`C_m(${q1})`)}. 2) À partir de combien d’unités le coût moyen est-il inférieur ou égal à ${M(`${target}\\ \\text{€}`)} ?`,
        a: `1) ${M(`C_m(${q1})=${a}+\\dfrac{${b}}{${q1}}=${nf(C1(q1))}\\ \\text{€}`)}. 2) ${M(`${a}+\\dfrac{${b}}{q}\\leqslant ${target}\\iff\\dfrac{${b}}{q}\\leqslant ${target - a}\\iff q\\geqslant\\dfrac{${b}}{${target - a}}${dec(F(b, target - a), 2)}`)} : à partir de ${M(n)} unités.`,
        ok: () => { let q = 1; while (C1(q) > target + 1e-12) q++; return q === n && Math.abs(C1(q1) - (b + a * q1) / q1) < 1e-12; } };
    } },

  { id: 'm3-inv-table', cls: C, chapter: 'stmg-04', domain: 'fonctions', skill: 'Tableau de valeurs et variations', fast: false,
    make(r, level) {
      const k = r.nz(-12, 12), xs = r.shuffle([1, 2, 3, 4, 5, 6, 8, 10, 12]).slice(0, 4).sort((a, b) => a - b), vals = xs.map((x) => F(k, x));
      const dir = k > 0 ? 'décroissante' : 'croissante';
      return { q: `Soit ${M(`f(x)=\\dfrac{${k}}{x}`)} sur ${M(']0\\,;\\,+\\infty[')}. Compléter le tableau de valeurs ${M(`x=${xs.join(',\\ ')}`)}, puis donner le sens de variation de ${M('f')} et le signe de ${M('f(x)')}.`,
        a: `${vals.map((v, i) => M(`f(${xs[i]})=${fracTex(v)}`)).join(', ')}. ${M('f')} est ${dir} sur ${M(']0\\,;\\,+\\infty[')} et ${M('f(x)')} est ${k > 0 ? 'strictement positif' : 'strictement négatif'}.`,
        ok: () => xs.every((x, i) => eq(mul(vals[i], F(x)), F(k))) && vals.every((v, i) => i === 0 || (k > 0 ? val(v) < val(vals[i - 1]) : val(v) > val(vals[i - 1]))) };
    } },

  // ============================ 05 Statistiques à deux variables ============================
  { id: 'm3-reg-qcm', cls: C, chapter: 'stmg-05', domain: 'stats-proba', skill: 'QCM sur l’ajustement affine', fast: true,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['mean', 'forecast'] : ['mean', 'forecast', 'slope']);
      const n = r.int(4, 7), xs = Array.from({ length: n }, (_, i) => i + 1 + r.int(0, 2)), ys = xs.map((x) => 10 * x + r.int(0, 40));
      if (kind === 'mean') {
        const xm = F(xs.reduce((a, b) => a + b, 0), n), ym = F(ys.reduce((a, b) => a + b, 0), n);
        return qcmNum(r, `Une série statistique a pour valeurs ${M(`x_i:\\ ${xs.join(',\\ ')}`)} et ${M(`y_i:\\ ${ys.join(',\\ ')}`)}. Les coordonnées du point moyen sont (à ${M('10^{-2}')} près) :`, [[val(xm), val(ym)], `${M(`\\bar{x}=\\dfrac{${xs.reduce((a, b) => a + b, 0)}}{${n}}`)} et ${M(`\\bar{y}=\\dfrac{${ys.reduce((a, b) => a + b, 0)}}{${n}}`)}.`],
          [[[val(ym), val(xm)], 'échange les coordonnées.'], [[xs.reduce((a, b) => a + b, 0), ys.reduce((a, b) => a + b, 0)], 'prend les sommes sans diviser par l’effectif.'], [[val(F(xs.reduce((a, b) => a + b, 0), n + 1)), val(F(ys.reduce((a, b) => a + b, 0), n + 1))], 'divise par ' + M(n + 1) + ' au lieu de ' + M(n) + '.']], (w) => M(`(${roundTex(w[0], 2)}\\,;\\,${roundTex(w[1], 2)})`),
          (w) => { const sx = xs.reduce((a, b) => a + b, 0) / n, sy = ys.reduce((a, b) => a + b, 0) / n; return roundTex(w[0], 2) === roundTex(sx, 2) && roundTex(w[1], 2) === roundTex(sy, 2); });
      }
      if (kind === 'forecast') {
        const a = r.pick([1.5, 2, 2.5, 3.2, 4, 0.8]), b = r.pick([12, 20, 35, 48, 60]), x0 = r.int(8, 15), good = a * x0 + b;
        return qcmNum(r, `Une droite d’ajustement est ${M(`y=${String(a).replace('.', '{,}')}x+${b}`)}. L’estimation de ${M('y')} pour ${M(`x=${x0}`)} est :`, [good, `${M(`y=${String(a).replace('.', '{,}')}\\times ${x0}+${b}`)}.`],
          [[a * x0, 'oublie l’ordonnée à l’origine.'], [a + b + x0, 'additionne les trois nombres.'], [(x0 - b) / a, 'résout ' + M('y=x_0') + ' pour ' + M('x') + ' au lieu de remplacer.'], [a * (x0 + b), 'multiplie la somme ' + M('x_0+b') + ' par ' + M('a') + '.']], (w) => M(nf(Math.round(w * 100) / 100).replace('.', '{,}')), (w) => Math.abs(w - (a * x0 + b)) < 1e-9);
      }
      const P = [r.int(1, 5), r.int(20, 60)], Q = [P[0] + r.int(2, 6), 0], slope = r.nz(-9, 15);
      Q[1] = P[1] + slope * (Q[0] - P[0]);
      return qcmNum(r, `Une droite passe par ${M(`P(${P[0]}\\,;\\,${P[1]})`)} et ${M(`Q(${Q[0]}\\,;\\,${Q[1]})`)}. Son coefficient directeur est :`, [slope, `${M(`\\dfrac{${Q[1]}-${par(P[1])}}{${Q[0]}-${par(P[0])}}=${slope}`)}.`],
        [[(Q[0] - P[0]) / (Q[1] - P[1]), 'inverse le quotient des écarts.'], [-slope, 'se trompe de signe.'], [Q[1] - P[1], 'oublie de diviser par l’écart des abscisses.'], [(Q[1] + P[1]) / (Q[0] + P[0]), 'additionne au lieu de soustraire.']], (w) => M(nf(Math.round(w * 100) / 100).replace('.', '{,}')), (w) => Math.abs(w - slope) < 1e-9);
    } },

  { id: 'm3-reg-tf', cls: C, chapter: 'stmg-05', domain: 'stats-proba', skill: 'Vrai ou faux sur l’ajustement affine', fast: false,
    make(r, level) {
      const n = r.int(4, 6), xs = Array.from({ length: n }, (_, i) => 2010 + i), up = r.next() < 0.5, ys = xs.map((x, i) => 50 + (up ? 1 : -1) * 6 * i + r.int(-3, 3));
      const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n, sxy = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0), a = sxy / xs.reduce((s, x) => s + (x - mx) ** 2, 0);
      const kind = r.pick(['sign', 'pm']);
      if (kind === 'sign') { const claim = r.pick(['positif', 'négatif']), ok = claim === 'positif' ? a > 0 : a < 0; return tf({ s: `Les valeurs de ${M('x')} sont ${xs.join(', ')} et celles de ${M('y')} sont ${ys.join(', ')}. Le coefficient directeur de la droite de régression de ${M('y')} en ${M('x')} est ${claim}.`, v: ok, c: () => { const S = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0); return ok === (claim === 'positif' ? S > 0 : S < 0); }, j: `Les valeurs de ${M('y')} ${a > 0 ? 'augmentent' : 'diminuent'} globalement avec ${M('x')} : ${M(`\\sum (x_i-\\bar{x})(y_i-\\bar{y})${a > 0 ? '>' : '<'}0`)}, le coefficient directeur est ${a > 0 ? 'positif' : 'négatif'}.` }); }
      const claimX = r.pick([true, false]), shown = claimX ? mx : mx + 1, ok = claimX;
      return tf({ s: `Pour les années ${xs.join(', ')}, la droite de régression passe par le point d’abscisse ${String(shown).replace('.', '{,}')} dont l’ordonnée est la moyenne des ${M('y_i')} (le point moyen).`, v: ok, c: () => ok === (Math.abs(shown - xs.reduce((s, x) => s + x, 0) / n) < 1e-12),
        j: ok ? `La droite des moindres carrés passe par le point moyen ${M(`G(\\bar{x}\\,;\\,\\bar{y})`)} avec ${M(`\\bar{x}=${String(mx).replace('.', '{,}')}`)}.` : `Le point moyen a pour abscisse ${M(`\\bar{x}=${String(mx).replace('.', '{,}')}`)}, pas ${M(String(shown).replace('.', '{,}'))}.` });
    } },

  { id: 'm3-reg-error', cls: C, chapter: 'stmg-05', domain: 'stats-proba', skill: 'Trouver l’erreur sur un ajustement affine', fast: false,
    make(r, level) {
      const a = r.pick([2, 2.5, 3, 4, 1.5]), b = r.pick([10, 20, 30, 45]), y0 = Math.round((a * r.int(6, 14) + b) * 10) / 10, x = (y0 - b) / a, bad = (y0 + b) / a;
      if (Math.abs(x - bad) < 1e-9 || !Number.isFinite(x)) return this.make(r, level);
      const dc2 = (z) => String(Math.round(z * 100) / 100).replace('.', '{,}');
      return spot(`Une droite d’ajustement est ${M(`y=${dc2(a)}x+${b}`)}. Un élève cherche la valeur de ${M('x')} pour laquelle ${M(`y=${dc2(y0)}`)}.`, [M(`${dc2(a)}x+${b}=${dc2(y0)}`), M(`${dc2(a)}x=${dc2(y0)}+${b}=${dc2(y0 + b)}`), M(`x=\\dfrac{${dc2(y0 + b)}}{${dc2(a)}}\\approx ${dc2(bad)}`)], 1, `on retranche ${M(b)} aux deux membres : ${M(`${dc2(a)}x=${dc2(y0)}-${b}`)}.`, M(`${dc2(a)}x=${dc2(y0)}-${b}=${dc2(y0 - b)}`), M(`x=\\dfrac{${dc2(y0 - b)}}{${dc2(a)}}=${dc2(x)}`),
        () => Math.abs(a * x + b - y0) < 1e-9 && Math.abs(a * bad + b - y0) > 1e-6);
    } },

  { id: 'm3-reg-compute', cls: C, chapter: 'stmg-05', domain: 'stats-proba', skill: 'Calculer une droite de régression', fast: false,
    make(r, level) {
      const n = r.int(4, 6), xs = Array.from({ length: n }, (_, i) => i + 1), A = r.pick([3, 4, 5, 6, 8, 12, -3, -5]), B = r.int(20, 90), ys = xs.map((x) => A * x + B + r.int(-4, 4));
      const sx = xs.reduce((s, x) => s + x, 0), sy = ys.reduce((s, y) => s + y, 0), sxx = xs.reduce((s, x) => s + x * x, 0), sxy = xs.reduce((s, x, i) => s + x * ys[i], 0);
      const aF = div(F(n * sxy - sx * sy), F(n * sxx - sx * sx)), bF = div(sub(F(sy), mul(aF, F(sx))), F(n)), sa = safeRound(val(aF), 2), sb = safeRound(val(bF), 2);
      if (sa === null || sb === null) return this.make(r, level);
      const tab = `\\begin{array}{c|${'c'.repeat(n)}}x_i&${xs.join('&')}\\\\\\hline y_i&${ys.join('&')}\\end{array}`;
      return { q: `On donne ${M(tab)} Déterminer, à l’aide de la calculatrice ou des formules, l’équation de la droite de régression de ${M('y')} en ${M('x')} (coefficients arrondis au centième).`, a: `${M(`a=\\dfrac{n\\sum x_iy_i-\\sum x_i\\sum y_i}{n\\sum x_i^{2}-(\\sum x_i)^{2}}=\\dfrac{${n}\\times ${sxy}-${sx}\\times ${sy}}{${n}\\times ${sxx}-${sx * sx}}\\approx ${sa}`)} et ${M(`b=\\bar{y}-a\\bar{x}\\approx ${sb}`)} : ${M(`y\\approx ${sa}x${sb.startsWith('-') ? '' : '+'}${sb}`)}.`,
        ok: () => { // normal equations solved by Cramer, and the residuals sum to zero
          const det = n * sxx - sx * sx, a = (n * sxy - sx * sy) / det, b = (sxx * sy - sx * sxy) / det; const res = xs.reduce((s, x, i) => s + (ys[i] - a * x - b), 0); const resx = xs.reduce((s, x, i) => s + x * (ys[i] - a * x - b), 0);
          return roundTex(a, 2) === sa && roundTex(b, 2) === sb && Math.abs(res) < 1e-9 && Math.abs(resx) < 1e-9; } };
    } },

  { id: 'm3-reg-forecast', cls: C, chapter: 'stmg-05', domain: 'stats-proba', skill: 'Prévision avec une droite d’ajustement', fast: false,
    make(r, level) {
      const a = r.pick([1.5, 2.5, 3.5, 4.5, 6, 8, 12]), b = r.pick([40, 55, 120, 200]), y0 = 2015, T = Math.round(a * r.int(9, 20) + b + 3), rank = (x) => x - y0;
      const f = (x) => a * x + b; let n = 0; while (f(n) < T) n++;
      const dcs = (z) => String(z).replace('.', '{,}');
      return { q: `Le nombre de clients (en milliers) d’une enseigne est modélisé par la droite d’ajustement ${M(`y=${dcs(a)}x+${b}`)}, où ${M('x')} est le rang de l’année (${M('x=0')} en ${y0}). 1) Estimer le nombre de clients en ${y0 + 7}. 2) En quelle année ce nombre dépasserait-il ${M(T)} milliers ?`,
        a: `1) ${M(`x=7`)} : ${M(`y=${dcs(a)}\\times 7+${b}=${nf(f(7))}`)} milliers. 2) ${M(`${dcs(a)}x+${b}\\geqslant ${T}\\iff x\\geqslant\\dfrac{${T - b}}{${dcs(a)}}\\approx ${roundTex((T - b) / a, 2)}`)} : ${M(`x=${n}`)}, soit en ${y0 + n}.`,
        ok: () => Math.abs(f(rank(y0 + 7)) - (a * 7 + b)) < 1e-9 && f(n) >= T && (n === 0 || f(n - 1) < T) };
    } },

  { id: 'm3-reg-point', cls: C, chapter: 'stmg-05', domain: 'stats-proba', skill: 'Point moyen et ordonnée à l’origine', fast: true,
    make(r, level) {
      const n = r.int(4, 8), xs = Array.from({ length: n }, () => r.int(1, 12)), ys = Array.from({ length: n }, () => r.int(10, 80)), a = r.pick([1.5, 2, 2.5, 3, 4, -2, -1.5]);
      const mx = xs.reduce((s, x) => s + x, 0) / n, my = ys.reduce((s, y) => s + y, 0) / n, b = my - a * mx, sb = safeRound(b, 2);
      if (sb === null || safeRound(mx, 2) === null || safeRound(my, 2) === null) return this.make(r, level);
      const dcs = (z) => String(z).replace('.', '{,}');
      return { q: `Pour la série ${M(`x_i:\\ ${xs.join(',\\ ')}`)}, ${M(`y_i:\\ ${ys.join(',\\ ')}`)}, on admet que la droite d’ajustement a pour coefficient directeur ${M(dcs(a))} et passe par le point moyen. Déterminer le point moyen, puis l’ordonnée à l’origine (arrondie au centième).`,
        a: `${M(`\\bar{x}=${roundTex(mx, 2)}`)}, ${M(`\\bar{y}=${roundTex(my, 2)}`)}. La droite passe par ${M('G')} : ${M(`b=\\bar{y}-a\\bar{x}=${roundTex(my, 2)}-${parT(dcs(a))}\\times ${roundTex(mx, 2)}\\approx ${sb}`)}.`,
        ok: () => roundTex(my - a * mx, 2) === sb && Math.abs(a * mx + b - my) < 1e-9 };
    } },

  // ============================ 06 Probabilités conditionnelles ============================
  { id: 'm3-cond-qcm', cls: C, chapter: 'stmg-06', domain: 'stats-proba', skill: 'QCM sur les probabilités conditionnelles', fast: true,
    make(r, level) {
      const pA = F(r.int(2, 8), 10), pBA = F(r.int(1, 9), 10), pBN = F(r.int(1, 9), 10), nA = sub(F(1), pA), kind = r.pick(level === 1 ? ['inter', 'cond'] : ['inter', 'total', 'cond']);
      if (kind === 'inter') return qcmNum(r, `On a ${M(`P(A)=${dcm(pA)}`)} et ${M(`P_A(B)=${dcm(pBA)}`)}. Alors ${M('P(A\\cap B)')} vaut :`, [mul(pA, pBA), `${M('P(A\\cap B)=P(A)\\times P_A(B)')}.`],
        [[add(pA, pBA), 'additionne les probabilités.'], [div(pBA, pA), 'divise au lieu de multiplier.'], [pBA, 'confond avec ' + M('P_A(B)') + '.'], [mul(nA, pBA), 'utilise ' + M('P(\\overline{A})') + ' au lieu de ' + M('P(A)') + '.']], (w) => M(dcm(w)), (w) => eq(w, mul(F(pA.n * 10, pA.d * 10), pBA)));
      if (kind === 'total') { const good = add(mul(pA, pBA), mul(nA, pBN)); return qcmNum(r, `${M(`P(A)=${dcm(pA)}`)}, ${M(`P_A(B)=${dcm(pBA)}`)}, ${M(`P_{\\overline{A}}(B)=${dcm(pBN)}`)}. Alors ${M('P(B)')} vaut :`, [good, `${M('P(B)=P(A\\cap B)+P(\\overline{A}\\cap B)')} (formule des probabilités totales).`],
        [[add(pBA, pBN), 'additionne les probabilités conditionnelles.'], [mul(pA, pBA), 'ne compte que le chemin passant par ' + M('A') + '.'], [add(mul(pA, pBA), pBN), 'oublie de pondérer la seconde branche.'], [mul(add(pA, nA), pBA), 'oublie la branche ' + M('\\overline{A}') + '.']], (w) => M(dcm(w)), (w) => eq(w, add(mul(pA, pBA), mul(sub(F(1), pA), pBN)))); }
      const pAB = mul(pA, pBA), pB = F(r.int(5, 9), 10), pAB2 = mul(pB, F(r.int(1, 4), 10));
      return qcmNum(r, `${M(`P(B)=${dcm(pB)}`)} et ${M(`P(A\\cap B)=${dcm(pAB2)}`)}. Alors ${M('P_B(A)')} vaut :`, [div(pAB2, pB), `${M('P_B(A)=\\dfrac{P(A\\cap B)}{P(B)}')}.`],
        [[mul(pAB2, pB), 'multiplie au lieu de diviser.'], [div(pB, pAB2), 'inverse le quotient.'], [pAB2, 'confond avec ' + M('P(A\\cap B)') + '.'], [sub(pB, pAB2), 'soustrait au lieu de diviser.']], (w) => M(fracTex(w)), (w) => eq(mul(w, pB), pAB2));
    } },

  { id: 'm3-cond-tf', cls: C, chapter: 'stmg-06', domain: 'stats-proba', skill: 'Vrai ou faux : indépendance et conditionnement', fast: false,
    make(r, level) {
      const yes = r.next() < 0.5, a = r.int(2, 8), b = r.int(2, 8), k = r.pick([2, 3]), c = yes ? k * a : r.int(2, 24), d = yes ? k * b : r.int(2, 24), N = a + b + c + d;
      const ok = a * (c + d) === c * (a + b), kind = r.pick(['indep', 'sym']);
      const tab = `\\begin{array}{l|cc}&B&\\overline{B}\\\\\\hline A&${a}&${b}\\\\\\overline{A}&${c}&${d}\\end{array}`;
      if (kind === 'indep') return tf({ s: `Dans le tableau d’effectifs ${M(tab)} les événements ${M('A')} et ${M('B')} sont indépendants.`, v: (a + b) * (a + c) * 1 === a * N, c: () => ((a + b) * (a + c) === a * N) === eq(mul(F(a + b, N), F(a + c, N)), F(a, N)),
        j: `${M(`P(A)\\times P(B)=\\dfrac{${a + b}}{${N}}\\times\\dfrac{${a + c}}{${N}}`)} ${(a + b) * (a + c) === a * N ? 'égale' : 'ne vaut pas'} ${M(`P(A\\cap B)=\\dfrac{${a}}{${N}}`)}${(a + b) * (a + c) === a * N ? ' : indépendants.' : ' : les événements ne sont pas indépendants.'}` });
      const claim = r.pick([true, false]);
      return tf({ s: `Dans le tableau d’effectifs ${M(tab)} on a ${M('P_A(B)=P_B(A)')}.`, v: (a * (a + c) === a * (a + b)) , c: () => eq(F(a, a + b), F(a, a + c)) === (b === c),
        j: `${M(`P_A(B)=\\dfrac{${a}}{${a + b}}`)} et ${M(`P_B(A)=\\dfrac{${a}}{${a + c}}`)} : ${b === c ? 'ils sont égaux car ' + M(`${b}=${c}`) : 'ils sont différents car les effectifs ' + M(a + b) + ' et ' + M(a + c) + ' ne sont pas égaux'}.` });
    } },

  { id: 'm3-cond-error', cls: C, chapter: 'stmg-06', domain: 'stats-proba', skill: 'Trouver l’erreur sur un arbre pondéré', fast: false,
    make(r, level) {
      const pA = F(r.int(2, 8), 10), pBA = F(r.int(1, 9), 10), pBN = F(r.int(1, 9), 10), nA = sub(F(1), pA), pAB = mul(pA, pBA), pNB = mul(nA, pBN), pB = add(pAB, pNB), good = div(pAB, pB), kind = r.pick([0, 1]);
      const bad = kind === 0 ? pBA : div(pAB, pA);
      if (eq(bad, good)) return this.make(r, level);
      return spot(`${M(`P(A)=${dcm(pA)}`)}, ${M(`P_A(B)=${dcm(pBA)}`)}, ${M(`P_{\\overline{A}}(B)=${dcm(pBN)}`)}. Un élève calcule ${M('P_B(A)')}.`, [M(`P(A\\cap B)=${dcm(pA)}\\times ${dcm(pBA)}=${dcm(pAB)}`), M(`P(B)=${dcm(pAB)}+${dcm(nA)}\\times ${dcm(pBN)}=${dcm(pB)}`), kind === 0 ? M(`P_B(A)=P_A(B)=${dcm(pBA)}`) : M(`P_B(A)=\\dfrac{P(A\\cap B)}{P(A)}=${fracTex(bad)}`)], 2,
        kind === 0 ? 'on ne peut pas échanger ' + M('P_A(B)') + ' et ' + M('P_B(A)') + '.' : 'pour ' + M('P_B(A)') + ' on divise par ' + M('P(B)') + ' (la condition) et non par ' + M('P(A)') + '.', M(`P_B(A)=\\dfrac{P(A\\cap B)}{P(B)}=\\dfrac{${dcm(pAB)}}{${dcm(pB)}}`), M(`P_B(A)=${fracTex(good)}`), () => eq(mul(good, pB), pAB) && !eq(mul(bad, pB), pAB));
    } },

  { id: 'm3-cond-tree', cls: C, chapter: 'stmg-06', domain: 'stats-proba', skill: 'Arbre pondéré et probabilités totales', fast: false,
    make(r, level) {
      const ctx = r.pick([['un client achète en ligne', 'un client est un abonné', 'abonné', 'non abonné'], ['un salarié est cadre', 'un salarié est en télétravail', 'cadre', 'non cadre']]), pA = F(r.int(2, 8) * 5, 100), pBA = F(r.int(2, 9) * 10, 100), pBN = F(r.int(1, 5) * 10, 100), nA = sub(F(1), pA);
      const pAB = mul(pA, pBA), pNB = mul(nA, pBN), pB = add(pAB, pNB);
      return { q: `Dans une entreprise, ${M(pc(pA))} des personnes sont ${ctx[2]}s. Parmi les ${ctx[2]}s, ${M(pc(pBA))} répondent « oui » à un sondage ; parmi les ${ctx[3]}s, ${M(pc(pBN))} répondent « oui ». On interroge une personne au hasard. 1) Dessiner l’arbre pondéré. 2) Calculer la probabilité qu’elle réponde « oui ». 3) Sachant qu’elle a répondu « oui », quelle est la probabilité qu’elle soit ${ctx[2]} ? (arrondir au millième)`,
        a: `2) ${M(`P(B)=${dcm(pA)}\\times ${dcm(pBA)}+${dcm(nA)}\\times ${dcm(pBN)}=${dcm(pAB)}+${dcm(pNB)}=${dcm(pB)}`)}. 3) ${M(`P_B(A)=\\dfrac{${dcm(pAB)}}{${dcm(pB)}}${dec(div(pAB, pB), 3)}`)}.`, ok: () => eq(pB, F(Math.round(100 * 100 * (val(pA) * val(pBA) + val(nA) * val(pBN))), 10000)) && eq(mul(div(pAB, pB), pB), pAB) };
    } },

  { id: 'm3-cond-bayes', cls: C, chapter: 'stmg-06', domain: 'stats-proba', skill: 'Dépistage : probabilité d’être malade sachant le test positif', fast: false,
    make(r, level) {
      const prev = r.int(1, 15), se = r.int(80, 99), fp = r.int(1, 15), pM = F(prev, 100), pTM = F(se, 100), pTN = F(fp, 100), pT = add(mul(pM, pTM), mul(sub(F(1), pM), pTN)), post = div(mul(pM, pTM), pT);
      return { q: `Dans une population, ${M(`${prev}\\,\\%`)} des personnes ont une maladie. Un test est positif pour ${M(`${se}\\,\\%`)} des malades et pour ${M(`${fp}\\,\\%`)} des personnes non malades. 1) Quelle est la probabilité qu’une personne choisie au hasard ait un test positif ? 2) Un test est positif : quelle est la probabilité que la personne soit malade ? (arrondir au centième)`,
        a: `1) ${M(`P(T)=${dcm(pM)}\\times ${dcm(pTM)}+${dcm(sub(F(1), pM))}\\times ${dcm(pTN)}=${dcm(pT)}`)}. 2) ${M(`P_T(M)=\\dfrac{${dcm(mul(pM, pTM))}}{${dcm(pT)}}${dec(post, 2)}`)}.`, ok: () => { const t = (prev / 100) * (se / 100) + (1 - prev / 100) * (fp / 100); return Math.abs(val(pT) - t) < 1e-12 && Math.abs(val(post) - ((prev / 100) * (se / 100)) / t) < 1e-12; } };
    } },

  { id: 'm3-cond-table2', cls: C, chapter: 'stmg-06', domain: 'stats-proba', skill: 'Probabilités conditionnelles d’un tableau et indépendance', fast: true,
    make(r, level) {
      const a = r.int(5, 40), b = r.int(5, 40), c = r.int(5, 40), d = r.int(5, 40), N = a + b + c + d, pAB = F(a, N), pA = F(a + b, N), pB = F(a + c, N);
      const tab = `\\begin{array}{l|cc|c}&B&\\overline{B}&\\text{Total}\\\\\\hline A&${a}&${b}&${a + b}\\\\\\overline{A}&${c}&${d}&${c + d}\\\\\\hline\\text{Total}&${a + c}&${b + d}&${N}\\end{array}`;
      const indep = eq(mul(pA, pB), pAB);
      return { q: `Une enquête porte sur ${M(N)} personnes : ${M(tab)} Calculer ${M('P(A)')}, ${M('P_A(B)')}, ${M('P_B(A)')} puis dire si ${M('A')} et ${M('B')} sont indépendants.`, a: `${M(`P(A)=${fracTex(pA)}`)} ; ${M(`P_A(B)=\\dfrac{${a}}{${a + b}}=${fracTex(F(a, a + b))}`)} ; ${M(`P_B(A)=\\dfrac{${a}}{${a + c}}=${fracTex(F(a, a + c))}`)}. ${M(`P(A)\\times P(B)=${fracTex(mul(pA, pB))}`)} ${indep ? 'égale' : 'diffère de'} ${M(`P(A\\cap B)=${fracTex(pAB)}`)} : ${indep ? 'indépendants' : 'non indépendants'}.`,
        ok: () => eq(mul(pA, F(a, a + b)), mul(pA, div(pAB, pA))) && (indep === (a * N === (a + b) * (a + c))) && eq(F(a, a + c), div(pAB, pB)) };
    } },
];
