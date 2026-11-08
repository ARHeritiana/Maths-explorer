// Seconde generators, fifth file (chapters 04 to 06: réels et intervalles, bilan de trimestre, fonctions de référence): four-choice
// questions with one typical error per wrong option, true/false, find-the-error and multi-step generators. Same contract as
// templates-seconde.js; every ok() recomputes the answer another way (sampling on a grid, exact fractions, substitution).
import { F, add, sub, mul, div, val, eq, M, fracTex, numTex, polyTex, evalPoly, mulPoly, sgn, par, sqrtTex, sqrtParts } from './engine.js';
import { tf, spot } from './premiere-kit.js';
import { dec, parT } from './seconde-kit.js';
import { qcmNum } from './seconde-kit-2.js';

const C = 'seconde';
const GRID = Array.from({ length: 161 }, (_, i) => -20 + i * 0.25);
const sameSet = (f, g) => GRID.every((x) => f(x) === g(x));
const inIv = (x, v) => (v.lc ? x >= v.lo : x > v.lo) && (v.hc ? x <= v.hi : x < v.hi);
const ivT = (v) => `${v.lc ? '[' : ']'}${v.lo}\\,;\\,${v.hi}${v.hc ? ']' : '['}`;
const flip = (v) => ({ ...v, lc: !v.lc, hc: !v.hc });
const squareFree = (m) => sqrtParts(m)[0] === 1;
const radTex = (k, m) => (m === 1 ? `${k}` : `${k === 1 ? '' : k}\\sqrt{${m}}`);

export const seconde5 = [
  // ============================ 04 Nombres réels et intervalles ============================
  { id: 's4-real-qcm', cls: C, chapter: 'seconde-04', domain: 'nombres', skill: 'QCM sur les intervalles', fast: true,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['inter', 'abs'] : ['inter', 'union', 'abs']);
      if (kind === 'abs') {
        const c = r.nz(-6, 6), rad = r.int(1, 6), strict = r.next() < 0.5, op = strict ? '<' : '\\leqslant ', ref = (x) => (strict ? Math.abs(x - c) < rad : Math.abs(x - c) <= rad);
        const good = { lo: c - rad, hi: c + rad, lc: !strict, hc: !strict };
        return qcmNum(r, `L’ensemble des réels ${M('x')} tels que ${M(`|x${sgn(-c)}|${op}${rad}`)} est :`, [good, `${M(`|x-${par(c)}|${op}${rad}`)} signifie que ${M('x')} est à une distance ${strict ? 'strictement ' : ''}inférieure ${strict ? '' : 'ou égale '}à ${M(rad)} de ${M(c)}.`],
          [[{ lo: -rad, hi: rad, lc: !strict, hc: !strict }, 'centre l’intervalle en ' + M(0) + ' au lieu de ' + M(c) + '.'], [{ lo: rad - c, hi: rad + c, lc: !strict, hc: !strict }, `retranche ${M(c)} aux bornes au lieu de l’ajouter.`], [flip(good), 'se trompe sur les crochets (ouverts à la place de fermés, ou l’inverse).'], [{ lo: c - rad, hi: c, lc: !strict, hc: !strict }, 'ne prend que la moitié de l’intervalle.']],
          (v) => M(ivT(v)), (v) => sameSet((x) => inIv(x, v), ref));
      }
      const a = r.int(-8, 0), c = a + r.int(1, 4), b = c + r.int(1, 4), d = b + r.int(1, 4), A = { lo: a, hi: b, lc: r.next() < 0.5, hc: r.next() < 0.5 }, B = { lo: c, hi: d, lc: r.next() < 0.5, hc: r.next() < 0.5 };
      const inter = kind === 'inter', refF = (x) => (inter ? inIv(x, A) && inIv(x, B) : inIv(x, A) || inIv(x, B));
      const good = inter ? { lo: c, hi: b, lc: B.lc, hc: A.hc } : { lo: a, hi: d, lc: A.lc, hc: B.hc }, other = inter ? { lo: a, hi: d, lc: A.lc, hc: B.hc } : { lo: c, hi: b, lc: B.lc, hc: A.hc };
      return qcmNum(r, `Soit ${M(`A=${ivT(A)}`)} et ${M(`B=${ivT(B)}`)}. L’ensemble ${M(inter ? 'A\\cap B' : 'A\\cup B')} est :`, [good, inter ? `${M('x')} doit être dans ${M('A')} et dans ${M('B')} : de ${M(c)} à ${M(b)}, avec les crochets de la borne la plus restrictive.` : `${M('A')} et ${M('B')} se chevauchent : la réunion va de ${M(a)} à ${M(d)}.`],
        [[other, inter ? 'donne la réunion au lieu de l’intersection.' : 'donne l’intersection au lieu de la réunion.'], [flip(good), 'inverse les crochets aux deux bornes.'], [{ lo: c, hi: d, lc: B.lc, hc: B.hc }, 'confond avec l’intervalle ' + M('B') + '.'], [{ lo: a, hi: b, lc: A.lc, hc: A.hc }, 'confond avec l’intervalle ' + M('A') + '.']], (v) => M(ivT(v)), (v) => sameSet((x) => inIv(x, v), refF));
    } },

  { id: 's4-real-tf', cls: C, chapter: 'seconde-04', domain: 'nombres', skill: 'Vrai ou faux sur les réels', fast: false,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['abs', 'square'] : ['abs', 'square', 'sqrt']);
      if (kind === 'abs') {
        const c = r.nz(-6, 6), rad = r.int(1, 6), yes = r.next() < 0.5, claimed = yes ? { lo: c - rad, hi: c + rad } : r.pick([{ lo: -rad, hi: rad }, { lo: rad - c, hi: rad + c }, { lo: c - rad, hi: c + rad + 1 }]);
        const same = (x) => (Math.abs(x - c) < rad) === (x > claimed.lo && x < claimed.hi), ok = GRID.every(same), w = GRID.find((x) => !same(x));
        return tf({ s: `Pour tout réel x, ${M(`|x${sgn(-c)}|<${rad}`)} équivaut à ${M(`x\\in\\,]${claimed.lo}\\,;\\,${claimed.hi}[`)}.`, v: ok, c: () => ok === GRID.every(same) && (ok === (claimed.lo === c - rad && claimed.hi === c + rad)),
          j: ok ? `${M(`|x-${par(c)}|<${rad}`)} signifie que ${M('x')} est à une distance de ${M(c)} inférieure à ${M(rad)}, donc ${M(`x\\in\\,]${c - rad}\\,;\\,${c + rad}[`)}.` : `L’ensemble des solutions est ${M(`]${c - rad}\\,;\\,${c + rad}[`)}. Pour ${M(`x=${String(w).replace('.', '{,}')}`)}, une écriture est vraie et l’autre fausse.` });
      }
      if (kind === 'square') {
        const a = r.int(-7, 6), b = a + r.int(1, 6), ok = a * a < b * b;
        return tf({ s: `Comme ${M(`${a}<${b}`)}, on a ${M(`${par(a)}^{2}<${b}^{2}`)}.`, v: ok, c: () => ok === (Math.abs(a) < Math.abs(b)),
          j: ok ? `${M(`${par(a)}^{2}=${a * a}`)} et ${M(`${b}^{2}=${b * b}`)} : ${M(`${a * a}<${b * b}`)}.` : `${M(`${par(a)}^{2}=${a * a}`)} et ${M(`${b}^{2}=${b * b}`)} : ${a * a === b * b ? 'les deux carrés sont égaux' : M(`${a * a}>${b * b}`)}. La fonction carré n’est pas croissante sur ${M('\\mathbb{R}')}.` });
      }
      const k = r.int(2, 9);
      return tf({ s: `Pour tout réel x, ${M(`\\sqrt{(x-${k})^{2}}=x-${k}`)}.`, v: false, c: () => { const x = k - 1; return Math.sqrt((x - k) ** 2) !== x - k; },
        j: `Contre-exemple : pour ${M(`x=${k - 1}`)}, ${M(`\\sqrt{(-1)^{2}}=1`)} alors que ${M(`x-${k}=-1`)}. En fait ${M(`\\sqrt{a^{2}}=|a|`)}.` });
    } },

  { id: 's4-real-error', cls: C, chapter: 'seconde-04', domain: 'nombres', skill: 'Trouver l’erreur sur les intervalles', fast: false,
    make(r, level) {
      if (r.next() < 0.5) {
        const c = r.nz(-6, 6), rad = r.int(1, 6), bad = { lo: -rad - c, hi: rad - c }, good = { lo: c - rad, hi: c + rad };
        return spot(`Un élève résout ${M(`|x${sgn(-c)}|\\leqslant ${rad}`)}.`,
          [M(`|x${sgn(-c)}|\\leqslant ${rad}\\iff -${rad}\\leqslant x${sgn(-c)}\\leqslant ${rad}`), M(`\\iff -${rad}${c < 0 ? '+' : '-'}${Math.abs(c)}\\leqslant x\\leqslant ${rad}${c < 0 ? '+' : '-'}${Math.abs(c)}`), M(`S=[${bad.lo}\\,;\\,${bad.hi}]`)], 1,
          `pour isoler ${M('x')} dans ${M(`x${sgn(-c)}`)} il faut ajouter ${M(c)} aux trois membres, pas le retrancher.`, M(`${c - rad}\\leqslant x\\leqslant ${c + rad}`), M(`S=[${good.lo}\\,;\\,${good.hi}]`),
          () => sameSet((x) => x >= good.lo && x <= good.hi, (x) => Math.abs(x - c) <= rad) && !sameSet((x) => x >= bad.lo && x <= bad.hi, (x) => Math.abs(x - c) <= rad));
      }
      const a = r.nz(-6, -1), b = a + r.int(1, 6), k = r.nz(-3, 8);
      if (b === 0) return this.make(r, level);
      return spot(`On sait que ${M(`${a}\\leqslant x\\leqslant ${b}`)}. Un élève encadre ${M(`${k}-x`)}.`,
        [M(`${a}\\leqslant x\\leqslant ${b}`), M(`${-a}\\geqslant -x\\geqslant ${-b}`), M(`${k}${sgn(-a)}\\leqslant ${k}-x\\leqslant ${k}${sgn(-b)}`)], 2,
        `après multiplication par ${M(-1)} les inégalités sont renversées : la ligne (L2) donne ${M(`${-b}\\leqslant -x\\leqslant ${-a}`)}, et on additionne ${M(k)} à chaque membre sans changer l’ordre.`,
        M(`${k}${sgn(-b)}\\leqslant ${k}-x\\leqslant ${k}${sgn(-a)}`), M(`${k - b}\\leqslant ${k}-x\\leqslant ${k - a}`),
        () => { for (let x = a; x <= b; x += 0.5) if (k - x < k - b || k - x > k - a) return false; return k - a > k - b; });
    } },

  { id: 's4-real-order', cls: C, chapter: 'seconde-04', domain: 'nombres', skill: 'Ranger des réels', fast: false,
    make(r, level) {
      const pool = () => {
        const out = [];
        const n = r.pick([2, 3, 5, 6, 7, 8, 10, 11, 13]), p = r.int(-9, 9), q = r.int(2, 7), d = r.int(-29, 29) / 10;
        out.push({ t: `\\sqrt{${n}}`, v: Math.sqrt(n) }, { t: p === 0 ? '0' : fracTex(F(p, q)), v: p / q }, { t: String(d).replace('.', '{,}'), v: d }, { t: `-\\sqrt{${r.pick([2, 3, 5, 7])}}`, v: 0 });
        out[3].v = -Math.sqrt(Number(out[3].t.match(/\d+/)[0]));
        if (level === 3) out.push({ t: '\\dfrac{22}{7}', v: 22 / 7 }, { t: '\\pi', v: Math.PI }, { t: '3{,}14', v: 3.14 });
        return out;
      };
      let list;
      for (let i = 0; i < 60; i++) { const cand = pool(); const vs = cand.map((x) => x.v).sort((x, y) => x - y); if (cand.every((x, ix) => cand.findIndex((y) => y.t === x.t) === ix) && vs.every((x, ix) => ix === 0 || x - vs[ix - 1] > (level === 3 ? 0.001 : 0.03))) { list = cand; break; } }
      if (!list) return this.make(r, level);
      const shown = r.shuffle(list), ord = [...list].sort((x, y) => x.v - y.v);
      return { q: `Ranger dans l’ordre croissant les nombres ${shown.map((x) => M(x.t)).join(', ')}.`, a: M(ord.map((x) => x.t).join('<')), s: 'On compare avec des valeurs approchées assez précises ou on élève au carré les nombres positifs.',
        ok: () => ord.length === list.length && ord.every((x, i) => i === 0 || ord[i - 1].v < x.v) && shown.every((x) => ord.includes(x)) && ord.every((x) => ord.filter((y) => y.v < x.v).length === ord.indexOf(x)) };
    } },

  // ============================ 05 Bilan de trimestre et remédiation ============================
  { id: 's4-bilan-qcm', cls: C, chapter: 'seconde-05', domain: 'nombres', skill: 'QCM de remédiation (fractions, racines, priorités)', fast: true,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['frac', 'prio'] : ['frac', 'sqrt', 'prio']);
      if (kind === 'frac') {
        const [a, b, c, d] = [r.int(1, 7), r.int(2, 9), r.int(1, 7), r.int(2, 9)], tot = add(F(a, b), F(c, d));
        return qcmNum(r, `${M(`\\dfrac{${a}}{${b}}+\\dfrac{${c}}{${d}}`)} est égal à :`, [tot, `on réduit au même dénominateur ${M(b * d)} : ${M(`\\dfrac{${a * d}+${c * b}}{${b * d}}`)}, puis on simplifie.`],
          [[F(a + c, b + d), 'additionne les numérateurs et les dénominateurs.'], [F(a + c, b * d), 'additionne les numérateurs sans les multiplier par le bon facteur.'], [mul(F(a, b), F(c, d)), 'multiplie les fractions au lieu de les additionner.'], [F(a * d + c * b, b + d), 'met le bon numérateur sur la somme des dénominateurs.']],
          (w) => M(fracTex(w)), (w) => eq(w, F(a * d + c * b, b * d)) && val(w) === val(tot));
      }
      if (kind === 'sqrt') {
        const k = r.int(2, 6), m = r.pick([2, 3, 5, 6, 7, 10]), n = k * k * m;
        return qcmNum(r, `L’écriture simplifiée de ${M(`\\sqrt{${n}}`)} est :`, [{ k, m }, `${M(`${n}=${k * k}\\times ${m}`)} et ${M(`\\sqrt{${k * k}}=${k}`)}.`],
          [[{ k: m, m: k }, 'échange le facteur sorti et le nombre sous la racine.'], [{ k: k * k, m }, 'sort ' + M(k * k) + ' au lieu de sa racine ' + M(k) + '.'], [{ k: 1, m: n }, 'ne simplifie pas.'], [{ k, m: k * m }, 'ne divise pas le nombre sous la racine par le carré sorti.']],
          (w) => M(radTex(w.k, w.m)), (w) => w.k * w.k * w.m === n && squareFree(w.m));
      }
      const [a, b, c, d] = [r.int(2, 20), r.int(2, 9), r.int(2, 9), r.int(1, 15)], good = a - b * c + d;
      return qcmNum(r, `${M(`${a}-${b}\\times ${c}+${d}`)} est égal à :`, [good, `la multiplication est prioritaire : ${M(`${a}-${b * c}+${d}`)}.`],
        [[(a - b) * c + d, 'effectue la soustraction avant la multiplication.'], [a - b * (c + d), 'groupe ' + M(`${c}+${d}`) + ' sans parenthèses.'], [(a - b) * (c + d), 'effectue les opérations de gauche à droite.'], [a - b * c - d, 'se trompe de signe pour le dernier terme.']], M, (w) => [a, -b * c, d].reduce((x, y) => x + y, 0) === w);
    } },

  { id: 's4-bilan-tf', cls: C, chapter: 'seconde-05', domain: 'algebre', skill: 'Vrai ou faux sur le calcul littéral', fast: false,
    make(r, level) {
      const a = r.int(1, 15), s = r.pick([1, -1]), lhs = mulPoly([1, s * a], [1, s * a]), good = lhs, forms = [good, [1, 0, a * a], [1, s * a, a * a], [1, 2 * s * a, -a * a]];
      const yes = r.next() < 0.4, claim = yes ? good : r.pick(forms.slice(1)), ok = claim.every((c, i) => c === lhs[i]);
      return tf({ s: `Pour tout réel x, ${M(`(x${sgn(s * a)})^{2}=${polyTex(claim)}`)}.`, v: ok, c: () => [-3, -1, 0, 1, 2, 5].every((x) => (x + s * a) ** 2 === evalPoly(claim, x)) === ok,
        j: ok ? `${M(`(x${sgn(s * a)})^{2}=x^{2}${sgn(2 * s * a)}x+${a * a}`)} (identité remarquable).` : `Pour ${M('x=1')} : ${M(`(1${sgn(s * a)})^{2}=${(1 + s * a) ** 2}`)} alors que le second membre vaut ${M(evalPoly(claim, 1))}. Le bon développement est ${M(polyTex(lhs))}.` });
    } },

  { id: 's4-bilan-error', cls: C, chapter: 'seconde-05', domain: 'algebre', skill: 'Trouver l’erreur de calcul', fast: false,
    make(r, level) {
      const kind = r.pick(['dev', 'frac', 'neg']);
      if (kind === 'dev') {
        const a = r.int(2, 5), b = r.nz(-6, 6), bad = [a * a, 0, b * b], good = mulPoly([a, b], [a, b]);
        return spot(`Un élève développe ${M(`(${polyTex([a, b])})^{2}`)}.`, [M(`(${polyTex([a, b])})^{2}=(${a}x)^{2}${sgn(b * b)}`), M(`=${polyTex(bad)}`)], 0,
          `le carré d’une somme n’est pas la somme des carrés : il manque le double produit ${M(`2\\times ${a}x\\times ${par(b)}`)}.`, M(`(${polyTex([a, b])})^{2}=(${a}x)^{2}+2\\times ${a}x\\times ${par(b)}+${par(b)}^{2}`), M(polyTex(good)),
          () => [-2, -1, 0, 1, 3].every((x) => (a * x + b) ** 2 === evalPoly(good, x)) && bad.some((c, i) => c !== good[i]));
      }
      if (kind === 'frac') {
        const [a, b, c, d] = [r.int(1, 5), r.int(2, 7), r.int(1, 5), r.int(2, 7)], bad = F(a + c, b + d), good = add(F(a, b), F(c, d));
        return spot(`Un élève calcule ${M(`\\dfrac{${a}}{${b}}+\\dfrac{${c}}{${d}}`)}.`, [M(`\\dfrac{${a}}{${b}}+\\dfrac{${c}}{${d}}=\\dfrac{${a}+${c}}{${b}+${d}}`), M(`=\\dfrac{${a + c}}{${b + d}}`), M(`=${fracTex(bad)}`)], 0,
          'on n’additionne pas les dénominateurs : il faut d’abord un dénominateur commun.', M(`\\dfrac{${a * d}}{${b * d}}+\\dfrac{${c * b}}{${b * d}}=\\dfrac{${a * d + c * b}}{${b * d}}`), M(`${fracTex(good)}`),
          () => !eq(bad, good) && eq(good, F(a * d + c * b, b * d)) && Math.abs(val(good) - (a / b + c / d)) < 1e-12);
      }
      const p = r.int(2, 12), c = r.int(1, 30), good = p * p - c;
      return spot(`On pose ${M(`f(x)=x^{2}-${c}`)}. Un élève calcule ${M(`f(-${p})`)}.`, [M(`f(-${p})=-${p}^{2}-${c}`), M(`=-${p * p}-${c}`), M(`=-${p * p + c}`)], 0,
        `${M(`x^{2}`)} avec ${M(`x=-${p}`)} s’écrit ${M(`(-${p})^{2}`)} : le carré s’applique au nombre négatif et vaut ${M(p * p)}.`, M(`f(-${p})=(-${p})^{2}-${c}`), M(`f(-${p})=${p * p}-${c}=${good}`),
        () => ((x) => x * x - c)(-p) === good && good !== -(p * p + c));
    } },

  { id: 's4-bilan-speed', cls: C, chapter: 'seconde-05', domain: 'nombres', skill: 'Vitesse, durée et conversions', fast: false,
    make(r, level) {
      if (level === 1) {
        const v = r.int(2, 24) * 5, t = r.pick([12, 15, 20, 24, 30, 36, 40, 45, 48, 50, 60]), d = F(v * t, 60);
        return { q: `Un train roule à ${M(`${v}\\ \\text{km/h}`)} pendant ${M(`${t}\\ \\text{min}`)}. Quelle distance parcourt-il ?`, a: `${M(`d=v\\times t=${v}\\times\\dfrac{${t}}{60}=${numTex(d)}\\ \\text{km}`)}.`, ok: () => Math.abs(val(d) - (v / 60) * t) < 1e-9 && Math.abs(val(d) * 60 / v - t) < 1e-9 };
      }
      if (level === 2) {
        const k = r.int(2, 14), v = 18 * k, ms = 5 * k, nn = r.int(5, 20);
        return { q: `Convertir ${M(`${v}\\ \\text{km/h}`)} en mètres par seconde, puis donner la durée en secondes pour parcourir ${M(`${ms * nn}\\ \\text{m}`)} à cette vitesse.`, a: `${M(`${v}\\ \\text{km/h}=\\dfrac{${v}\\,000}{3\\,600}\\ \\text{m/s}=${ms}\\ \\text{m/s}`)} ; durée ${M(`\\dfrac{${ms * nn}}{${ms}}=${nn}\\ \\text{s}`)}.`, ok: () => (v * 1000) / 3600 === ms && (ms * nn) / ms === nn && v / 3.6 === ms };
      }
      const v1 = r.pick([30, 40, 60, 80]), v2 = r.pick([20, 50, 90, 120]), d1 = r.int(1, 4) * 60, d2 = r.int(1, 4) * 60;
      if (v1 === v2) return this.make(r, level);
      const t = add(F(d1, v1), F(d2, v2)), vm = div(F(d1 + d2), t);
      return { q: `Un cycliste parcourt ${M(`${d1}\\ \\text{km}`)} à ${M(`${v1}\\ \\text{km/h}`)} puis ${M(`${d2}\\ \\text{km}`)} à ${M(`${v2}\\ \\text{km/h}`)}. Quelle est sa vitesse moyenne sur l’ensemble du trajet ?`,
        a: `Durée totale ${M(`\\dfrac{${d1}}{${v1}}+\\dfrac{${d2}}{${v2}}=${fracTex(t)}\\ \\text{h}`)}, donc ${M(`v_{moy}=\\dfrac{${d1 + d2}}{${fracTex(t)}}${dec(vm, 1)}\\ \\text{km/h}`)} (et non la moyenne des deux vitesses).`,
        ok: () => eq(mul(vm, t), F(d1 + d2)) && Math.abs(val(vm) - (d1 + d2) / (d1 / v1 + d2 / v2)) < 1e-9 };
    } },

  // ============================ 06 Fonctions de référence ============================
  { id: 's4-func-qcm', cls: C, chapter: 'seconde-06', domain: 'fonctions', skill: 'QCM sur les fonctions', fast: true,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['image', 'root'] : ['image', 'domain', 'root']);
      if (kind === 'image') {
        const a = r.nz(-3, 3), b = r.int(-5, 5), c = r.int(-9, 9), x0 = -r.int(1, 5), f = [a, b, c], good = evalPoly(f, x0);
        return qcmNum(r, `Soit ${M(`f(x)=${polyTex(f)}`)}. L’image de ${M(x0)} par ${M('f')} est :`, [good, `${M(`f(${x0})=${a}\\times (${x0})^{2}${sgn(b)}\\times (${x0})${sgn(c)}`)}.`],
          [[a * -(x0 * x0) + b * x0 + c, `applique le carré sans les parenthèses : le signe moins reste devant le résultat.`], [(a * x0) ** 2 + b * x0 + c, `élève au carré le produit ${M(`${a}x`)} entier.`], [a * x0 * x0 - b * x0 + c, 'se trompe de signe pour le terme en ' + M('x') + '.'], [a * x0 * x0 + b * x0 - c, 'se trompe de signe pour la constante.']], M, (w) => evalPoly(f, x0) === w);
      }
      if (kind === 'domain') {
        const a = r.nz(-6, 6), root = r.next() < 0.5;
        const D = (x) => (root ? x >= a : x !== a);
        const opts = root ? [[{ t: `[${a}\\,;\\,+\\infty[`, f: (x) => x >= a }, 'la racine existe si et seulement si l’intérieur est positif ou nul.'], [{ t: `]${a}\\,;\\,+\\infty[`, f: (x) => x > a }, 'exclut ' + M(a) + ' alors que ' + M('\\sqrt{0}') + ' existe.'], [{ t: `[${-a}\\,;\\,+\\infty[`, f: (x) => x >= -a }, 'se trompe de signe pour la borne.'], [{ t: `]-\\infty\\,;\\,${a}]`, f: (x) => x <= a }, 'renverse le sens de l’inégalité.']]
          : [[{ t: `]-\\infty\\,;\\,${a}[\\,\\cup\\,]${a}\\,;\\,+\\infty[`, f: (x) => x !== a }, 'le dénominateur ne doit pas s’annuler : seule la valeur ' + M(a) + ' est interdite.'], [{ t: `]-\\infty\\,;\\,${-a}[\\,\\cup\\,]${-a}\\,;\\,+\\infty[`, f: (x) => x !== -a }, 'se trompe de signe pour la valeur interdite.'], [{ t: '\\mathbb{R}', f: () => true }, 'ne cherche pas de valeur interdite.'], [{ t: `]${a}\\,;\\,+\\infty[`, f: (x) => x > a }, 'confond avec le domaine d’une racine carrée.']];
        return qcmNum(r, `L’ensemble de définition de ${M(root ? `f(x)=\\sqrt{x${sgn(-a)}}` : `f(x)=\\dfrac{1}{x${sgn(-a)}}`)} est :`, [opts[0][0], opts[0][1]], opts.slice(1).map(([v, w]) => [v, w]), (v) => M(v.t), (v) => sameSet(v.f, D));
      }
      const k = r.pick([2, 3, 5, 6, 7, 10, 11, 13, 14]);
      return qcmNum(r, `Les solutions de l’équation ${M(`x^{2}=${k}`)} dans ${M('\\mathbb{R}')} sont :`, [{ t: `-\\sqrt{${k}}\\ \\text{et}\\ \\sqrt{${k}}`, s: [-Math.sqrt(k), Math.sqrt(k)] }, `la fonction carré prend la valeur ${M(k)} en deux réels opposés.`],
        [[{ t: `\\sqrt{${k}}`, s: [Math.sqrt(k)] }, 'oublie la solution négative.'], [{ t: `${k}\\ \\text{et}\\ -${k}`, s: [k, -k] }, 'confond ' + M('x') + ' et ' + M('x^{2}') + '.'], [{ t: `\\dfrac{${k}}{2}`, s: [k / 2] }, 'divise par 2 comme pour une équation affine.'], [{ t: 'aucune solution', s: [] }, 'croit qu’un carré ne peut pas être égal à un nombre non carré.']],
        (v) => (v.t === 'aucune solution' ? 'Aucune solution' : M(v.t)).replace(/^Aucune solution$/, M('\\varnothing')), (v) => v.s.length === 2 && v.s.every((x) => Math.abs(x * x - k) < 1e-9) && v.s[0] !== v.s[1]);
    } },

  { id: 's4-func-tf', cls: C, chapter: 'seconde-06', domain: 'fonctions', skill: 'Vrai ou faux sur les fonctions de référence', fast: false,
    make(r, level) {
      const sg = r.pick([2, -2]), fn = r.pick(level === 1 ? ['carré', 'inverse'] : ['carré', 'inverse', 'affine']), a = r.int(-8, 5), b = a + r.int(1, 7);
      if (a === 0 || b === 0) return this.make(r, level);
      const ff = { carré: (x) => x * x, inverse: (x) => 1 / x, affine: (x) => sg * x + 3 }[fn], fa = ff(a), fb = ff(b), ok = fa < fb;
      const label = fn === 'affine' ? `la fonction ${M(`f:x\\mapsto ${sg}x+3`)}` : `la fonction ${fn}`;
      const show = (x, v) => (fn === 'carré' ? `${par(x)}^{2}=${v}` : fn === 'inverse' ? `\\dfrac{1}{${par(x)}}=${numTex(F(1, x))}` : `${sg}\\times ${par(x)}+3=${v}`);
      return tf({ s: `Si ${M(`${a}<${b}`)}, alors, avec ${label}, l’image de ${M(a)} est inférieure à celle de ${M(b)}.`, v: ok, c: () => ok === (fn === 'carré' ? Math.abs(a) < Math.abs(b) : fn === 'inverse' ? (a < 0 && b > 0) : sg > 0),
        j: `${M(show(a, fa))} et ${M(show(b, fb))} : ${M(`${fn === 'inverse' ? numTex(F(1, a)) : fa}${ok ? '<' : '>'}${fn === 'inverse' ? numTex(F(1, b)) : fb}`)}.${ok ? '' : ' Cette fonction n’est pas croissante sur l’intervalle contenant ces deux nombres.'}` });
    } },

  { id: 's4-func-error', cls: C, chapter: 'seconde-06', domain: 'fonctions', skill: 'Trouver l’erreur sur les fonctions de référence', fast: false,
    make(r, level) {
      const kind = r.pick(['sq', 'neg', 'inv']);
      if (kind === 'sq') {
        const k = r.int(2, 90);
        if (Number.isInteger(Math.sqrt(k))) return this.make(r, level);
        return spot(`Un élève résout ${M(`x^{2}=${k}`)} dans ${M('\\mathbb{R}')}.`, [M(`x^{2}=${k}`), M(`x=\\sqrt{${k}}`), M(`S=\\{\\sqrt{${k}}\\}`)], 1, `deux réels ont pour carré ${M(k)} : ${M(`\\sqrt{${k}}`)} et son opposé.`, M(`x=\\sqrt{${k}}\\ \\text{ou}\\ x=-\\sqrt{${k}}`), M(`S=\\{-\\sqrt{${k}}\\,;\\,\\sqrt{${k}}\\}`),
          () => Math.abs(Math.sqrt(k) ** 2 - k) < 1e-9 && Math.abs((-Math.sqrt(k)) ** 2 - k) < 1e-9);
      }
      if (kind === 'neg') {
        const p = r.int(2, 12), c = r.int(1, 30), good = p * p - c;
        return spot(`On pose ${M(`f(x)=x^{2}-${c}`)}. Un élève calcule ${M(`f(-${p})`)}.`, [M(`f(-${p})=-${p}^{2}-${c}`), M(`=-${p * p}-${c}`), M(`=-${p * p + c}`)], 0, `${M('x^{2}')} avec ${M(`x=-${p}`)} s’écrit ${M(`(-${p})^{2}`)} et vaut ${M(p * p)}.`, M(`f(-${p})=(-${p})^{2}-${c}`), M(`f(-${p})=${p * p}-${c}=${good}`), () => ((x) => x * x - c)(-p) === good && good !== -(p * p + c));
      }
      const a = r.int(1, 12), b = a + r.int(1, 12);
      return spot(`Un élève compare ${M(`\\dfrac{1}{${a}}`)} et ${M(`\\dfrac{1}{${b}}`)} sachant que ${M(`0<${a}<${b}`)}.`, [M(`0<${a}<${b}`), M(`\\text{la fonction inverse est décroissante sur }]0\\,;\\,+\\infty[`), M(`\\text{donc }\\dfrac{1}{${a}}<\\dfrac{1}{${b}}`)], 2, `une fonction décroissante renverse l’ordre : ${M(`${a}<${b}`)} donne ${M(`\\dfrac{1}{${a}}>\\dfrac{1}{${b}}`)}.`, M(`\\dfrac{1}{${a}}>\\dfrac{1}{${b}}`), M(`\\dfrac{1}{${a}}>\\dfrac{1}{${b}}`), () => 1 / a > 1 / b && a < b);
    } },

  { id: 's4-func-intersect', cls: C, chapter: 'seconde-06', domain: 'fonctions', skill: 'Intersection d’une parabole et d’une droite', fast: false,
    make(r, level) {
      let p = r.int(-9, 9), q = r.int(-9, 9); while (p === q) q = r.int(-9, 9);
      const fac = (a) => (a === 0 ? 'x' : `(x${sgn(-a)})`);
      const s = p + q, t = -p * q, lo = Math.min(p, q), hi = Math.max(p, q), g = (x) => s * x + t;
      const base = `Dans un repère, on trace la parabole ${M('\\mathcal{P}')} de la fonction ${M('f:x\\mapsto x^{2}')} et la droite ${M('d')} d’équation ${M(`y=${polyTex([s, t])}`)}.`;
      if (level < 3) {
        return { q: `${base} Déterminer les abscisses de leurs points d’intersection.`, a: `${M(`x^{2}=${polyTex([s, t])}\\iff ${polyTex([1, -s, -t])}=0\\iff ${fac(p)}${fac(q)}=0`)} : ${M(`x=${lo}`)} ou ${M(`x=${hi}`)}.`, s: 'Se ramener à une équation produit nul.',
          ok: () => [p, q].every((x) => x * x === g(x)) && mulPoly([1, -p], [1, -q]).every((c, i) => c === [1, -s, -t][i]) };
      }
      return { q: `${base} Résoudre ${M(`f(x)\\leqslant ${polyTex([s, t])}`)}, c’est-à-dire déterminer quand la parabole est en dessous de la droite.`, a: `${M(`x^{2}-(${polyTex([s, t])})=${polyTex([1, -s, -t])}=${fac(p)}${fac(q)}`)} est négatif ou nul entre ses racines : ${M(`S=[${lo}\\,;\\,${hi}]`)}.`, s: 'Signe d’un produit de deux facteurs affines.',
        ok: () => sameSet((x) => x >= lo && x <= hi, (x) => x * x <= g(x)) };
    } },
];
