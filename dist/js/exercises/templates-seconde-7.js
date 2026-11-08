// Seconde generators, seventh file (chapters 10 to 12: variations et extremums, tableaux croisés, géométrie repérée): four-choice questions
// with one typical error per wrong option, true/false, find-the-error and multi-step generators with seeded parameters. Same contract as
// templates-seconde.js; every ok() recomputes the answer another way (piecewise model, brute force over a grid, exact fractions).
import { F, add, sub, mul, div, val, eq, M, fracTex, numTex, polyTex, evalPoly, sgn, par, sqrtTex } from './engine.js';
import { tf, spot } from './premiere-kit.js';
import { pt, vc, dec, parT } from './seconde-kit.js';
import { qcmNum } from './seconde-kit-2.js';

const C = 'seconde';
const fr1 = (x) => String(x).replace('.', '{,}');
const d2 = (P, Q) => (Q[0] - P[0]) ** 2 + (Q[1] - P[1]) ** 2;
// piecewise linear model of a table of variations: nodes xs (increasing) and values ys
const model = (xs, ys) => (x) => { for (let i = 0; i < xs.length - 1; i++) if (x >= xs[i] && x <= xs[i + 1]) return ys[i] + ((ys[i + 1] - ys[i]) * (x - xs[i])) / (xs[i + 1] - xs[i]); return NaN; };
const classify = (A, B, Cc) => {
  const s = [d2(A, B), d2(B, Cc), d2(A, Cc)].sort((x, y) => x - y), iso = s[0] === s[1] || s[1] === s[2], right = s[0] + s[1] === s[2];
  return right ? (iso ? 'rectangle et isocèle' : 'rectangle non isocèle') : iso ? 'isocèle non rectangle' : 'quelconque';
};
const collinear = (A, B, Cc) => (B[0] - A[0]) * (Cc[1] - A[1]) - (B[1] - A[1]) * (Cc[0] - A[0]) === 0;
const REL = { '<': 'f(u)<f(v)', '>': 'f(u)>f(v)', '=': 'f(u)=f(v)', '?': 'on ne peut pas conclure' };

function table(r, upDown) {
  const x0 = r.int(-6, 0), x1 = x0 + r.int(2, 5), x2 = x1 + r.int(2, 5), lo = r.int(-6, 4), top = lo + r.int(3, 9), end = lo + r.int(-2, 2);
  const ys = upDown ? [lo, top, end] : [top, lo, top - r.int(-2, 2)];
  if (ys[0] === ys[2]) return table(r, upDown);
  return { xs: [x0, x1, x2], ys, upDown };
}
const describe = (t) => `la fonction ${M('f')} est ${t.upDown ? 'croissante' : 'décroissante'} sur ${M(`[${t.xs[0]}\\,;\\,${t.xs[1]}]`)} puis ${t.upDown ? 'décroissante' : 'croissante'} sur ${M(`[${t.xs[1]}\\,;\\,${t.xs[2]}]`)}, avec ${M(`f(${t.xs[0]})=${t.ys[0]}`)}, ${M(`f(${t.xs[1]})=${t.ys[1]}`)} et ${M(`f(${t.xs[2]})=${t.ys[2]}`)}`;

export const seconde7 = [
  // ============================ 10 Variations et extremums ============================
  { id: 's4-var-qcm', cls: C, chapter: 'seconde-10', domain: 'fonctions', skill: 'QCM sur les variations et les extremums', fast: true,
    make(r, level) {
      if (r.next() < 0.5) {
        const t = table(r, r.next() < 0.5), second = r.next() < 0.5 && level > 1, i = second ? 1 : 0, a = t.xs[i], b = t.xs[i + 1], u = r.int(a, b - 1), v = r.int(u + 1, b), m = model(t.xs, t.ys), inc = (t.upDown ? 1 : -1) * (second ? -1 : 1) > 0, rel = inc ? '<' : '>';
        const fm = (w) => M(w === '?' ? '\\text{on ne peut pas conclure}' : REL[w].replace('f(u)', `f(${u})`).replace('f(v)', `f(${v})`));
        return qcmNum(r, `On sait que ${describe(t)}. Pour ${M(`${u}<${v}`)} dans ${M(`[${a}\\,;\\,${b}]`)}, on a :`, [rel, `${M('f')} est ${inc ? 'croissante' : 'décroissante'} sur cet intervalle : elle ${inc ? 'conserve' : 'renverse'} l’ordre.`],
          [[inc ? '>' : '<', 'se trompe sur le sens de variation de ' + M('f') + ' sur cet intervalle.'], ['=', 'croit que les images sont égales.'], ['?', 'croit qu’on ne peut pas comparer alors que les deux nombres sont dans un même intervalle de monotonie.']], fm,
          (w) => { if (w === '?') return false; const fu = m(u), fv = m(v); return w === '<' ? fu < fv : w === '>' ? fu > fv : fu === fv; });
      }
      const sign = r.pick([1, -1]), h = r.int(-4, 4), k = r.int(-6, 6), lo = h + (level > 1 ? r.pick([1, 2, 3, -4, -3]) : -r.int(1, 4)), hi = lo + r.int(3, 7), f = (x) => sign * (x - h) ** 2 + k;
      const isMin = sign > 0, inside = h >= lo && h <= hi, pts = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i), ext = (isMin ? Math.min : Math.max)(...pts.map(f));
      return qcmNum(r, `Soit ${M(`f(x)=${sign < 0 ? '-' : ''}(x${sgn(-h)})^{2}${sgn(k)}`.replace(/\(x\+0\)/, 'x').replace('(x)^', 'x^'))} sur ${M(`[${lo}\\,;\\,${hi}]`)}. Le ${isMin ? 'minimum' : 'maximum'} de ${M('f')} sur cet intervalle est :`,
        [ext, inside ? `atteint en ${M(`x=${h}`)}, où ${M(`(x${sgn(-h)})^{2}`.replace('(x+0)', 'x'))} s’annule : ${M(k)}.` : `${M(h)} n’est pas dans l’intervalle : ${M('f')} est monotone et l’extremum est atteint à une borne.`],
        [[k, 'donne la valeur en ' + M(h) + ' sans vérifier que ' + M(h) + ' appartient à l’intervalle.'], [f(lo), 'prend la valeur à la borne de gauche.'], [f(hi), 'prend la valeur à la borne de droite.'], [(isMin ? Math.max : Math.min)(...pts.map(f)), 'confond maximum et minimum.']], M, (w) => ext === w);
    } },

  { id: 's4-var-tf', cls: C, chapter: 'seconde-10', domain: 'fonctions', skill: 'Vrai ou faux sur un tableau de variations', fast: false,
    make(r, level) {
      const t = table(r, r.next() < 0.5), m = model(t.xs, t.ys), [x0, x1, x2] = t.xs, [y0, y1, y2] = t.ys, kind = r.pick(level === 1 ? ['ext', 'ends'] : ['ext', 'ends', 'order']);
      if (kind === 'ext') {
        const claim = r.pick([y0, y1, y2]), word = r.pick(['maximum', 'minimum']), real = word === 'maximum' ? Math.max(y0, y1, y2) : Math.min(y0, y1, y2), ok = real === claim;
        return tf({ s: `Sachant que ${describe(t)}, le ${word} de ${M('f')} sur ${M(`[${x0}\\,;\\,${x2}]`)} est ${claim}.`, v: ok, c: () => { const pts = []; for (let x = x0; x <= x2; x += 0.5) pts.push(m(x)); return ((word === 'maximum' ? Math.max(...pts) : Math.min(...pts)) === claim) === ok; },
          j: `${M('f')} ${t.upDown ? 'croît puis décroît' : 'décroît puis croît'} : on compare les valeurs ${M(y0)}, ${M(y1)} et ${M(y2)} aux deux bornes et en ${M(x1)}. Le ${word} vaut ${M(real)}${ok ? '.' : `, pas ${M(claim)}.`}` }); }
      if (kind === 'ends') { const claim = r.pick(['<', '>']), ok = (claim === '<') === (y0 < y2); return tf({ s: `Sachant que ${describe(t)}, on a ${M(`f(${x0})${claim}f(${x2})`)}.`, v: ok, c: () => (claim === '<' ? m(x0) < m(x2) : m(x0) > m(x2)) === ok,
        j: `${M(`f(${x0})=${y0}`)} et ${M(`f(${x2})=${y2}`)} : ${M(`${y0}${y0 < y2 ? '<' : '>'}${y2}`)}.` }); }
      const u = r.int(x0, x1 - 1), v = r.int(u + 1, x1), claim = r.pick(['<', '>']), inc = t.upDown, ok = (claim === '<') === inc;
      return tf({ s: `Sachant que ${describe(t)}, pour ${M(`${u}<${v}`)} on a ${M(`f(${u})${claim}f(${v})`)}.`, v: ok, c: () => (claim === '<' ? m(u) < m(v) : m(u) > m(v)) === ok, j: `${M('f')} est ${inc ? 'croissante' : 'décroissante'} sur ${M(`[${x0}\\,;\\,${x1}]`)}, donc ${M(`f(${u})${inc ? '<' : '>'}f(${v})`)}.` });
    } },

  { id: 's4-var-error', cls: C, chapter: 'seconde-10', domain: 'fonctions', skill: 'Trouver l’erreur sur un sens de variation', fast: false,
    make(r, level) {
      if (r.next() < 0.5) {
        const m = r.nz(-5, -1), p = r.int(-6, 6), u = r.int(-5, 2), v = u + r.int(1, 4), f = (x) => m * x + p;
        return spot(`Un élève compare ${M(`f(${u})`)} et ${M(`f(${v})`)} pour ${M(`f(x)=${polyTex([m, p])}`)}.`, [M(`f(x)=${polyTex([m, p])}\\text{ avec }m=${m}`), M(`m<0\\text{ donc }f\\text{ est croissante}`), M(`${u}<${v}\\text{ donc }f(${u})<f(${v})`)], 1,
          'un coefficient directeur négatif donne une fonction affine décroissante.', M(`m<0\\text{ donc }f\\text{ est décroissante}`), M(`f(${u})=${f(u)}>f(${v})=${f(v)}`), () => f(u) > f(v) && m < 0);
      }
      const t = table(r, true), m = model(t.xs, t.ys), u = r.int(t.xs[1], t.xs[2] - 1), v = r.int(u + 1, t.xs[2]);
      return spot(`Sachant que ${describe(t)}, un élève compare ${M(`f(${u})`)} et ${M(`f(${v})`)}.`, [M(`${t.xs[1]}\\leqslant ${u}<${v}\\leqslant ${t.xs[2]}`), M(`f\\text{ est décroissante sur }[${t.xs[1]}\\,;\\,${t.xs[2]}]`), M(`\\text{donc }f(${u})<f(${v})`)], 2,
        'une fonction décroissante renverse l’ordre : elle range les images dans l’ordre inverse des antécédents.', M(`f(${u})>f(${v})`), M(`f(${u})>f(${v})`), () => m(u) > m(v));
    } },

  { id: 's4-var-profit', cls: C, chapter: 'seconde-10', domain: 'fonctions', skill: 'Bénéfice maximal d’une fabrication', fast: false,
    make(r, level) {
      const h = r.int(3, 12), k = r.int(10, 80), a = r.pick([1, 2, 3]), co = [-a, 2 * a * h, k - a * h * h], B = (x) => evalPoly(co, x), cap = level === 3 ? h - r.int(1, 2) : h + r.int(2, 6);
      const best = level === 3 ? cap : h, pts = Array.from({ length: cap + 1 }, (_, i) => i), inside = h <= cap;
      return { q: `Un artisan fabrique ${M('x')} objets par jour (${M(`0\\leqslant x\\leqslant ${cap}`)}). Son bénéfice en euros est ${M(`B(x)=${polyTex(co)}`)}. Pour quel nombre d’objets le bénéfice est-il maximal, et quel est-il ?`,
        a: `${M(`B(x)=-${a === 1 ? '' : a}(x-${h})^{2}+${k}`)} (forme canonique) : ${inside ? `maximum en ${M(`x=${h}`)}, égal à ${M(`${k}\\ \\text{€}`)}` : `${M(h)} est hors de l’intervalle, ${M('B')} est croissante sur ${M(`[0\\,;\\,${cap}]`)} : maximum en ${M(`x=${cap}`)}, égal à ${M(`${B(cap)}\\ \\text{€}`)}`}.`, s: `Mettre ${M('B(x)')} sous la forme ${M('-a(x-h)^{2}+k')}.`,
        ok: () => Math.max(...pts.map(B)) === B(best) && (inside ? B(h) === k : true) && mulCheck(a, h, k, co) };
    } },

  // ============================ 11 Tableaux croisés ============================
  { id: 's4-twoway-qcm', cls: C, chapter: 'seconde-11', domain: 'stats-proba', skill: 'QCM sur les fréquences conditionnelles', fast: true,
    make(r, level) {
      const [a, b, c, d] = [r.int(3, 30), r.int(3, 30), r.int(3, 30), r.int(3, 30)], N = a + b + c + d, tab = `\\begin{array}{l|cc|c}&B&\\overline{B}&\\text{Total}\\\\\\hline A&${a}&${b}&${a + b}\\\\\\overline{A}&${c}&${d}&${c + d}\\\\\\hline\\text{Total}&${a + c}&${b + d}&${N}\\end{array}`;
      const kind = r.pick(level === 1 ? ['row', 'marg'] : ['row', 'col', 'marg']);
      if (kind === 'marg') return qcmNum(r, `Dans le tableau ${M(tab)}, la fréquence de la modalité ${M('A')} dans la population totale est :`, [F(a + b, N), `${M(`\\dfrac{${a + b}}{${N}}`)} : effectif de la ligne ${M('A')} sur l’effectif total.`],
        [[F(a, N), 'prend l’effectif de ' + M('A') + ' et ' + M('B') + ' seulement.'], [F(a + b, a + c), 'divise par le total de la colonne ' + M('B') + '.'], [F(a, a + b), 'calcule une fréquence conditionnelle.'], [F(a + c, N), 'prend la fréquence de ' + M('B') + '.']], (w) => M(fracTex(w)), (w) => eq(w, div(F(a + b), F(N))));
      if (kind === 'row') return qcmNum(r, `Dans le tableau ${M(tab)}, la fréquence de ${M('B')} parmi les individus de ${M('A')} est :`, [F(a, a + b), `on se restreint à la ligne ${M('A')} (${M(a + b)} individus) : ${M(`\\dfrac{${a}}{${a + b}}`)}.`],
        [[F(a, N), 'divise par l’effectif total au lieu de celui de ' + M('A') + '.'], [F(a, a + c), 'divise par l’effectif de la colonne ' + M('B') + ' (fréquence de ' + M('A') + ' parmi ' + M('B') + ').'], [F(b, a + b), 'calcule la fréquence de ' + M('\\overline{B}') + ' parmi ' + M('A') + '.'], [F(a + b, N), 'donne la fréquence de ' + M('A') + ' dans la population.']], (w) => M(fracTex(w)), (w) => eq(w, div(F(a), F(a + b))));
      return qcmNum(r, `Dans le tableau ${M(tab)}, la fréquence de ${M('A')} parmi les individus de ${M('B')} est :`, [F(a, a + c), `on se restreint à la colonne ${M('B')} (${M(a + c)} individus) : ${M(`\\dfrac{${a}}{${a + c}}`)}.`],
        [[F(a, a + b), 'divise par l’effectif de la ligne ' + M('A') + '.'], [F(a, N), 'divise par l’effectif total.'], [F(c, a + c), 'donne la fréquence de ' + M('\\overline{A}') + ' parmi ' + M('B') + '.'], [F(a + c, N), 'donne la fréquence de ' + M('B') + ' dans la population.']], (w) => M(fracTex(w)), (w) => eq(w, div(F(a), F(a + c))));
    } },

  { id: 's4-twoway-tf', cls: C, chapter: 'seconde-11', domain: 'stats-proba', skill: 'Vrai ou faux sur un tableau croisé', fast: false,
    make(r, level) {
      const yes = r.next() < 0.5, a = r.int(2, 12), b = r.int(2, 12), k = r.pick([2, 3]), c = yes ? k * a : r.int(2, 30), d = yes ? k * b : r.int(2, 30);
      const same = a * d === b * c, tab = `\\begin{array}{l|cc|c}&\\text{Oui}&\\text{Non}&\\text{Total}\\\\\\hline\\text{Filles}&${a}&${b}&${a + b}\\\\\\text{Garçons}&${c}&${d}&${c + d}\\end{array}`;
      return tf({ s: `Dans le tableau ${tab.replace(/^/, '').length ? M(tab) : ''}, la proportion de « Oui » est la même chez les filles et chez les garçons.`, v: same, c: () => same === eq(F(a, a + b), F(c, c + d)),
        j: `Chez les filles : ${M(`\\dfrac{${a}}{${a + b}}=${fracTex(F(a, a + b))}`)} ; chez les garçons : ${M(`\\dfrac{${c}}{${c + d}}=${fracTex(F(c, c + d))}`)}. ${same ? 'Les deux fractions sont égales.' : 'Elles sont différentes.'}` });
    } },

  { id: 's4-twoway-error', cls: C, chapter: 'seconde-11', domain: 'stats-proba', skill: 'Trouver l’erreur sur une fréquence conditionnelle', fast: false,
    make(r, level) {
      const [a, b, c, d] = [r.int(4, 25), r.int(4, 25), r.int(4, 25), r.int(4, 25)], N = a + b + c + d, bad = r.pick([0, 1]);
      const tab = `\\begin{array}{l|cc|c}&\\text{Abonnés}&\\text{Non-abonnés}&\\text{Total}\\\\\\hline\\text{Jeunes}&${a}&${b}&${a + b}\\\\\\text{Adultes}&${c}&${d}&${c + d}\\\\\\hline\\text{Total}&${a + c}&${b + d}&${N}\\end{array}`;
      const good = F(a, a + b), wrong = bad === 0 ? F(a, N) : F(a, a + c);
      if (eq(good, wrong)) return this.make(r, level);
      return spot(`Un élève cherche la proportion d’abonnés parmi les jeunes dans ${M(tab)}.`, [M(`\\text{Jeunes abonnés}=${a}`), M(`\\text{Dénominateur}=${bad === 0 ? N : a + c}`), M(`f=\\dfrac{${a}}{${bad === 0 ? N : a + c}}=${fracTex(wrong)}`)], 1,
        bad === 0 ? 'on divise par le nombre de jeunes (la ligne), pas par l’effectif total.' : 'on divise par le nombre de jeunes (la ligne), pas par le nombre d’abonnés (la colonne).', M(`\\text{Dénominateur}=${a}+${b}=${a + b}`), M(`f=\\dfrac{${a}}{${a + b}}=${fracTex(good)}`), () => eq(good, F(a, a + b)) && !eq(good, wrong));
    } },

  { id: 's4-twoway-union', cls: C, chapter: 'seconde-11', domain: 'stats-proba', skill: 'Réunion et intersection dans un tableau croisé', fast: false,
    make(r, level) {
      const [a, b, c, d] = [r.int(2, 20), r.int(2, 20), r.int(2, 20), r.int(2, 20)], N = a + b + c + d;
      const tab = `\\begin{array}{l|cc|c}&\\text{Sport}&\\text{Pas de sport}&\\text{Total}\\\\\\hline\\text{Musique}&${a}&${b}&${a + b}\\\\\\text{Pas de musique}&${c}&${d}&${c + d}\\\\\\hline\\text{Total}&${a + c}&${b + d}&${N}\\end{array}`;
      const u = F(a + b + c, N);
      return { q: `Dans un lycée on interroge ${M(N)} élèves : ${M(tab)} On choisit un élève au hasard. Quelle est la probabilité qu’il fasse du sport ou de la musique (ou les deux) ?`,
        a: `${M(`P=\\dfrac{${a + b}+${a + c}-${a}}{${N}}=\\dfrac{${a + b + c}}{${N}}=${fracTex(u)}`)} (ou ${M(`1-\\dfrac{${d}}{${N}}`)}).`, ok: () => eq(u, sub(F(1), F(d, N))) && a + b + a + c - a === a + b + c };
    } },

  // ============================ 12 Géométrie repérée ============================
  { id: 's4-geo-qcm', cls: C, chapter: 'seconde-12', domain: 'geometrie', skill: 'QCM de géométrie repérée', fast: true,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['mid', 'dist'] : ['mid', 'dist', 'nature']);
      const A = [r.int(-5, 5), r.int(-5, 5)], B = [A[0] + r.nz(-6, 6), A[1] + r.nz(-6, 6)];
      if (kind === 'mid') {
        const mx = F(A[0] + B[0], 2), my = F(A[1] + B[1], 2);
        return qcmNum(r, `Le milieu de ${M('[AB]')} avec ${M(`A${pt(...A)}`)} et ${M(`B${pt(...B)}`)} a pour coordonnées :`, [[mx, my], `${M(`\\left(\\dfrac{x_A+x_B}{2}\\,;\\,\\dfrac{y_A+y_B}{2}\\right)`)}.`],
          [[[F(B[0] - A[0], 2), F(B[1] - A[1], 2)], 'divise les écarts au lieu des sommes (coordonnées du vecteur moitié).'], [[F(A[0] + B[0]), F(A[1] + B[1])], 'oublie de diviser par 2.'], [[mx, F(A[1] - B[1], 2)], 'se trompe de signe pour l’ordonnée.'], [[F(A[0] + B[0], 2), F(A[1] + B[1], 4)], 'ne divise pas correctement par 2 l’ordonnée.']], (w) => M(`\\left(${fracTex(w[0])}\\,;\\,${fracTex(w[1])}\\right)`),
          (w) => eq(mul(F(2), w[0]), F(A[0] + B[0])) && eq(mul(F(2), w[1]), F(A[1] + B[1])));
      }
      if (kind === 'dist') {
        const n2 = d2(A, B), dx = B[0] - A[0], dy = B[1] - A[1];
        return qcmNum(r, `La distance ${M('AB')}, avec ${M(`A${pt(...A)}`)} et ${M(`B${pt(...B)}`)}, est égale à :`, [{ t: sqrtTex(n2), sq: n2 }, `${M(`AB=\\sqrt{(${B[0]}-${par(A[0])})^{2}+(${B[1]}-${par(A[1])})^{2}}=\\sqrt{${dx * dx}+${dy * dy}}=\\sqrt{${n2}}`)}.`],
          [[{ t: `${Math.abs(dx) + Math.abs(dy)}`, sq: (Math.abs(dx) + Math.abs(dy)) ** 2 }, 'additionne les écarts sans les élever au carré.'], [{ t: sqrtTex(Math.abs(dx * dx - dy * dy) + 1), sq: Math.abs(dx * dx - dy * dy) + 1 }, 'soustrait les carrés au lieu de les additionner.'], [{ t: `${n2}`, sq: n2 * n2 }, 'oublie la racine carrée.'], [{ t: sqrtTex((dx + dy) ** 2 + 1), sq: (dx + dy) ** 2 + 1 }, 'calcule le carré de la somme des écarts.']], (w) => M(w.t), (w) => w.sq === n2);
      }
      const p = r.nz(-4, 4), q = r.nz(-4, 4), type = r.pick(['ri', 'r', 'i', 'q']);
      let Cc;
      if (type === 'ri') Cc = [A[0] - q, A[1] + p]; else if (type === 'r') Cc = [A[0] - 2 * q, A[1] + 2 * p]; else if (type === 'i') Cc = [A[0] + q, A[1] + p]; else Cc = [A[0] + r.nz(-5, 5), A[1] + r.nz(-5, 5)];
      const Bt = [A[0] + p, A[1] + q];
      if (collinear(A, Bt, Cc)) return this.make(r, level);
      const truth = classify(A, Bt, Cc);
      const all = ['rectangle et isocèle', 'rectangle non isocèle', 'isocèle non rectangle', 'quelconque'];
      return qcmNum(r, `Avec ${M(`A${pt(...A)}`)}, ${M(`B${pt(...Bt)}`)} et ${M(`C${pt(...Cc)}`)} dans un repère orthonormé, le triangle ${M('ABC')} est :`, [truth, `${M(`AB^{2}=${d2(A, Bt)}`)}, ${M(`AC^{2}=${d2(A, Cc)}`)}, ${M(`BC^{2}=${d2(Bt, Cc)}`)} : on compare les longueurs et on teste la réciproque de Pythagore.`],
        all.filter((x) => x !== truth).map((x) => [x, 'ne correspond pas aux longueurs calculées ' + M(`AB^{2}=${d2(A, Bt)},\\ AC^{2}=${d2(A, Cc)},\\ BC^{2}=${d2(Bt, Cc)}`) + '.']), (w) => M(`\\text{${w}}`), (w) => classify(A, Bt, Cc) === w);
    } },

  { id: 's4-geo-tf', cls: C, chapter: 'seconde-12', domain: 'geometrie', skill: 'Vrai ou faux de géométrie repérée', fast: false,
    make(r, level) {
      const A = [r.int(-4, 4), r.int(-4, 4)], kind = r.pick(level === 1 ? ['align', 'mid'] : ['align', 'mid', 'right']), yes = r.next() < 0.5;
      if (kind === 'align') { const v = [r.nz(-3, 3), r.nz(-3, 3)], k = r.pick([2, 3, -1, -2]), B = [A[0] + v[0], A[1] + v[1]], Cc = [A[0] + k * v[0] + (yes ? 0 : 1), A[1] + k * v[1]], ok = collinear(A, B, Cc);
        return tf({ s: `Les points ${M(`A${pt(...A)}`)}, ${M(`B${pt(...B)}`)} et ${M(`C${pt(...Cc)}`)} sont alignés.`, v: ok, c: () => ok === (Math.abs((B[0] - A[0]) * (Cc[1] - A[1]) - (B[1] - A[1]) * (Cc[0] - A[0])) < 1e-12) && ok === yes,
          j: `${M(`\\overrightarrow{AB}${vc(B[0] - A[0], B[1] - A[1])}`)} et ${M(`\\overrightarrow{AC}${vc(Cc[0] - A[0], Cc[1] - A[1])}`)} : ${M(`${par(B[0] - A[0])}\\times ${par(Cc[1] - A[1])}-${par(B[1] - A[1])}\\times ${par(Cc[0] - A[0])}=${(B[0] - A[0]) * (Cc[1] - A[1]) - (B[1] - A[1]) * (Cc[0] - A[0])}`)}${ok ? ' : les vecteurs sont colinéaires.' : ', non nul : les points ne sont pas alignés.'}` }); }
      if (kind === 'mid') { const B = [A[0] + 2 * r.nz(-3, 3), A[1] + 2 * r.nz(-3, 3)], Mm = [(A[0] + B[0]) / 2 + (yes ? 0 : r.pick([1, -1])), (A[1] + B[1]) / 2], ok = Mm[0] * 2 === A[0] + B[0] && Mm[1] * 2 === A[1] + B[1];
        return tf({ s: `Le point ${M(`M${pt(...Mm)}`)} est le milieu de ${M('[AB]')} avec ${M(`A${pt(...A)}`)} et ${M(`B${pt(...B)}`)}.`, v: ok, c: () => ok === yes && ok === (d2(A, Mm) === d2(Mm, B) && collinear(A, Mm, B)),
          j: `Le milieu a pour coordonnées ${M(pt((A[0] + B[0]) / 2, (A[1] + B[1]) / 2))}${ok ? ' : c’est bien ' + M('M') + '.' : ', différent de ' + M(pt(...Mm)) + '.'}` }); }
      const p = r.nz(-4, 4), q = r.nz(-4, 4), B = [A[0] + p, A[1] + q], Cc = [A[0] - q * 2, A[1] + p * 2 + (yes ? 0 : 1)], ok = d2(A, B) + d2(A, Cc) === d2(B, Cc);
      return tf({ s: `Dans un repère orthonormé, le triangle ${M('ABC')} avec ${M(`A${pt(...A)}`)}, ${M(`B${pt(...B)}`)} et ${M(`C${pt(...Cc)}`)} est rectangle en ${M('A')}.`, v: ok, c: () => ok === ((B[0] - A[0]) * (Cc[0] - A[0]) + (B[1] - A[1]) * (Cc[1] - A[1]) === 0),
        j: `${M(`AB^{2}=${d2(A, B)}`)}, ${M(`AC^{2}=${d2(A, Cc)}`)}, ${M(`BC^{2}=${d2(B, Cc)}`)} : ${ok ? `${M(`AB^{2}+AC^{2}=BC^{2}`)}, donc rectangle en ${M('A')} (réciproque de Pythagore).` : `${M(`AB^{2}+AC^{2}=${d2(A, B) + d2(A, Cc)}\\neq ${d2(B, Cc)}`)} : pas de triangle rectangle en ${M('A')}.`}` });
    } },

  { id: 's4-geo-error', cls: C, chapter: 'seconde-12', domain: 'geometrie', skill: 'Trouver l’erreur en géométrie repérée', fast: false,
    make(r, level) {
      if (r.next() < 0.5) {
        const A = [r.int(-4, 3), r.int(-4, 3)], dx = r.int(1, 6), dy = r.int(1, 6);
        if (dx === 1 && dy === 1) return this.make(r, level);
        const B = [A[0] + dx, A[1] + dy], n2 = dx * dx + dy * dy;
        return spot(`Un élève calcule la distance ${M('AB')} avec ${M(`A${pt(...A)}`)} et ${M(`B${pt(...B)}`)}.`, [M(`x_B-x_A=${dx}\\text{ et }y_B-y_A=${dy}`), M(`AB^{2}=${dx}+${dy}=${dx + dy}`), M(`AB=\\sqrt{${dx + dy}}`)], 1,
          'dans la formule de la distance on additionne les carrés des écarts, pas les écarts.', M(`AB^{2}=${dx}^{2}+${dy}^{2}=${n2}`), M(`AB=\\sqrt{${n2}}`), () => d2(A, B) === n2 && n2 !== dx + dy);
      }
      const A = [r.int(-5, 5), r.int(-5, 5)], B = [A[0] + 2 * r.nz(-3, 3), A[1] + 2 * r.nz(-3, 3)], good = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], bad = [good[0], (A[1] - B[1]) / 2];
      if (bad[1] === good[1]) return this.make(r, level);
      return spot(`Un élève calcule le milieu ${M('I')} de ${M('[AB]')} avec ${M(`A${pt(...A)}`)} et ${M(`B${pt(...B)}`)}.`, [M(`x_I=\\dfrac{${A[0]}+${par(B[0])}}{2}=${good[0]}`), M(`y_I=\\dfrac{${A[1]}-${par(B[1])}}{2}=${bad[1]}`), M(`I${pt(...bad)}`)], 1,
        'l’ordonnée du milieu est la demi-somme des ordonnées, on n’en fait pas la différence.', M(`y_I=\\dfrac{${A[1]}+${par(B[1])}}{2}=${good[1]}`), M(`I${pt(...good)}`), () => good[0] * 2 === A[0] + B[0] && good[1] * 2 === A[1] + B[1] && bad[1] !== good[1]);
    } },

  { id: 's4-geo-circle', cls: C, chapter: 'seconde-12', domain: 'geometrie', skill: 'Cercle de diamètre donné', fast: false,
    make(r, level) {
      const [u, v] = r.pick([[3, 4], [4, 3], [1, 2], [2, 1], [2, 3], [1, 3], [5, 12], [6, 8], [2, 4]]), I = [r.int(-4, 4), r.int(-4, 4)], A = [I[0] - u, I[1] - v], B = [I[0] + u, I[1] + v], yes = r.next() < 0.5, P = yes ? [I[0] - v, I[1] + u] : [I[0] - v + r.pick([1, -1]), I[1] + u];
      const r2 = u * u + v * v, onC = d2(I, P) === r2;
      return { q: `Dans un repère orthonormé, ${M('[AB]')} est un diamètre d’un cercle ${M('\\mathcal{C}')}, avec ${M(`A${pt(...A)}`)} et ${M(`B${pt(...B)}`)}. Déterminer le centre et le rayon de ${M('\\mathcal{C}')}, puis dire si ${M(`P${pt(...P)}`)} appartient à ${M('\\mathcal{C}')}.`,
        a: `Centre : milieu ${M(`I${pt(...I)}`)}. ${M(`AB^{2}=${d2(A, B)}`)} donc ${M(`r=\\dfrac{AB}{2}=\\sqrt{${r2}}`)}${sqrtTex(r2).includes('sqrt') ? '' : ` ${M(`=${sqrtTex(r2)}`)}`}. ${M(`IP^{2}=${d2(I, P)}`)} ${onC ? `égal à ${M(`r^{2}=${r2}`)} : ${M('P')} appartient au cercle.` : `différent de ${M(`r^{2}=${r2}`)} : ${M('P')} n’appartient pas au cercle.`}`,
        ok: () => d2(A, B) === 4 * r2 && (A[0] + B[0]) / 2 === I[0] && (A[1] + B[1]) / 2 === I[1] && onC === yes && onC === (d2(P, A) + d2(P, B) === d2(A, B)) };
    } },
];

// ok of the profit generator: the canonical form a(x-h)^2+k expands to the printed polynomial
function mulCheck(a, h, k, co) { return [-2, 0, 3, 7].every((x) => -a * (x - h) ** 2 + k === evalPoly(co, x)); }
