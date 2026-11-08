// Première generators, fourth file: chapters 09 (exponentielle) and 10 (trigonométrie). Same contract and formats as
// templates-premiere-2.js (calcul, QCM à quatre choix, vrai/faux, trouve l'erreur, contexte, question à l'envers, niveau 3 type examen).
import { F, add, sub, mul, div, val, eq, M, R, fracTex, numTex, roundTex, polyTex, evalPoly, sgn, par, gcd, sqrtTex } from './engine.js';
import { near, nd, coef, opt, mcq, tf, spot, xm } from './premiere-kit.js';
import { affTex } from './seconde-kit.js';
import { exactCosSin, piTex } from './templates-premiere.js';

const C = 'premiere';
const E = (t) => { t = String(t); return t === '0' ? '1' : t === '1' ? '\\mathrm{e}' : `\\mathrm{e}^{${t}}`; };   // e^t written without exponent 1 or 0
const ex = (a, b) => polyTex([a, b]);                                                      // ax + b
const exV = (a, b) => `\\mathrm{e}^{${ex(a, b)}}`;
const ek = (k) => (k === 1 ? 'x' : '-x');

export const premiere4 = [
  // ============================ 09 Exponentielle ============================
  { id: 'p-exp-simplify', cls: C, chapter: 'premiere-09', domain: 'analyse', skill: 'Simplifier des expressions avec exponentielle', fast: true,
    make(r, level) {
      if (level === 1) {
        const a = r.int(-9, 9), b = r.int(-9, 9), n = r.int(2, 5), form = r.pick(['prod', 'quot', 'pow']);
        if (form === 'prod') return { q: `Écrire ${M(`\\mathrm{e}^{${a}}\\times\\mathrm{e}^{${b}}`)} sous la forme ${M('\\mathrm{e}^{k}')}.`, a: M(`\\mathrm{e}^{${a}}\\times\\mathrm{e}^{${b}}=\\mathrm{e}^{${a}+${par(b)}}=${E(`${a + b}`)}`), ok: () => near(Math.exp(a) * Math.exp(b), Math.exp(a + b), 1e-9) };
        if (form === 'quot') return { q: `Écrire ${M(`\\dfrac{\\mathrm{e}^{${a}}}{\\mathrm{e}^{${b}}}`)} sous la forme ${M('\\mathrm{e}^{k}')}.`, a: M(`\\dfrac{\\mathrm{e}^{${a}}}{\\mathrm{e}^{${b}}}=\\mathrm{e}^{${a}-${par(b)}}=${E(`${a - b}`)}`), ok: () => near(Math.exp(a) / Math.exp(b), Math.exp(a - b), 1e-9) };
        return { q: `Écrire ${M(`\\left(\\mathrm{e}^{${a}}\\right)^{${n}}`)} sous la forme ${M('\\mathrm{e}^{k}')}.`, a: M(`\\left(\\mathrm{e}^{${a}}\\right)^{${n}}=\\mathrm{e}^{${a}\\times ${n}}=${E(`${a * n}`)}`), ok: () => near(Math.exp(a) ** n, Math.exp(a * n), 1e-9) };
      }
      if (level === 2) {
        const a = r.nz(-4, 4), b = r.int(-5, 5), c = r.nz(-4, 4), d = r.int(-5, 5), e = r.nz(-3, 3), f = r.int(-5, 5), form = r.pick(['pq', 'q']);
        if (form === 'pq') return { q: `Simplifier ${M(`\\mathrm{e}^{${ex(a, b)}}\\times\\mathrm{e}^{${ex(c, d)}}`)} sous la forme ${M('\\mathrm{e}^{\\ldots}')}.`, a: M(`\\mathrm{e}^{${ex(a, b)}}\\times\\mathrm{e}^{${ex(c, d)}}=\\mathrm{e}^{${ex(a + c, b + d)}}`), ok: () => [-1.3, 0, 0.7].every((x) => near(Math.exp(a * x + b) * Math.exp(c * x + d), Math.exp((a + c) * x + b + d), 1e-9)) };
        return { q: `Simplifier ${M(`\\dfrac{\\mathrm{e}^{${ex(a, b)}}\\times\\mathrm{e}^{${ex(c, d)}}}{\\mathrm{e}^{${ex(e, f)}}}`)}.`, a: M(`\\mathrm{e}^{${ex(a, b)}+(${ex(c, d)})-(${ex(e, f)})}=\\mathrm{e}^{${ex(a + c - e, b + d - f)}}`), ok: () => [-1.3, 0, 0.7].every((x) => near((Math.exp(a * x + b) * Math.exp(c * x + d)) / Math.exp(e * x + f), Math.exp((a + c - e) * x + b + d - f), 1e-9)) };
      }
      const a = r.int(1, 30), bb = r.int(1, 9), form = r.pick(['sq', 'fac']);
      const cf = (n) => (n === 1 ? '' : n);
      if (form === 'sq') return { q: `Montrer que, pour tout réel ${M('x')}, ${M(`\\left(${cf(bb)}\\mathrm{e}^{x}+${cf(a)}\\mathrm{e}^{-x}\\right)^{2}-\\left(${cf(bb)}\\mathrm{e}^{x}-${cf(a)}\\mathrm{e}^{-x}\\right)^{2}`)} est une constante que l’on précisera.`, a: `On développe : ${M(`${bb * bb === 1 ? '' : bb * bb}\\mathrm{e}^{2x}+${2 * a * bb}+${a * a === 1 ? '' : a * a}\\mathrm{e}^{-2x}-\\left(${bb * bb === 1 ? '' : bb * bb}\\mathrm{e}^{2x}-${2 * a * bb}+${a * a === 1 ? '' : a * a}\\mathrm{e}^{-2x}\\right)=${4 * a * bb}`)}. (Ou : ${M('(A+B)^{2}-(A-B)^{2}=4AB')} avec ${M(`AB=${a * bb}`)}.)`, ok: () => [-2, -0.3, 0, 1.1, 2.5].every((x) => near((bb * Math.exp(x) + a * Math.exp(-x)) ** 2 - (bb * Math.exp(x) - a * Math.exp(-x)) ** 2, 4 * a * bb, 1e-9)) };
      return { q: `Montrer que, pour tout réel ${M('x')}, ${M(`\\dfrac{\\mathrm{e}^{2x}-${a * a}}{\\mathrm{e}^{x}+${a}}=\\mathrm{e}^{x}-${a}`)}.`, a: `${M(`\\mathrm{e}^{2x}-${a * a}=(\\mathrm{e}^{x})^{2}-${a}^{2}=(\\mathrm{e}^{x}-${a})(\\mathrm{e}^{x}+${a})`)} et ${M(`\\mathrm{e}^{x}+${a}>0`)} : on simplifie par ${M(`\\mathrm{e}^{x}+${a}`)}.`, ok: () => [-3, -0.5, 0, 1, 2.7].every((x) => near((Math.exp(2 * x) - a * a) / (Math.exp(x) + a), Math.exp(x) - a, 1e-9)) };
    } },

  { id: 'p-exp-qcm', cls: C, chapter: 'premiere-09', domain: 'analyse', skill: 'QCM sur l’exponentielle', fast: true,
    make(r, level) {
      if (level === 1) {
        const a = r.int(2, 9), b = r.int(2, 9); if (a === b) return this.make(r, level);
        const cs = [[`\\mathrm{e}^{${a + b}}`, a + b, M('e^{a}e^{b}=e^{a+b}') + '.'], [`\\mathrm{e}^{${a * b}}`, a * b, 'multiplie les exposants au lieu de les additionner.'], [`\\mathrm{e}^{${a}}+\\mathrm{e}^{${b}}`, null, 'transforme un produit en somme.'], [`\\mathrm{e}^{${Math.abs(a - b)}}`, Math.abs(a - b), 'soustrait les exposants (c’est la règle du quotient).']];
        const val0 = (c) => (c[1] === null ? Math.exp(a) + Math.exp(b) : Math.exp(c[1]));
        if (new Set(cs.map((c) => c[0])).size < 4 || a + b === a * b) return this.make(r, level);
        return mcq(r, `${M(`\\mathrm{e}^{${a}}\\times\\mathrm{e}^{${b}}`)} est égal à :`, opt(M(cs[0][0]), cs[0][2], { w: val0(cs[0]) }), cs.slice(1).map((c) => opt(M(c[0]), c[2], { w: val0(c) })), (o) => near(o.w, Math.exp(a) * Math.exp(b), 1e-9));
      }
      if (level === 2) {
        const a = r.nz(-6, 6), b = r.int(-5, 5), f = (x) => Math.exp(a * x + b);
        const mk = (t, why, g) => opt(M(`f'(x)=${t}`), why, { g }), pa = a === 1 ? '' : a === -1 ? '-' : a;
        const cands = [mk(`${pa}\\mathrm{e}^{${ex(a, b)}}`, M('(\\mathrm{e}^{u})\'=u\'\\mathrm{e}^{u}') + ' avec ' + M(`u=${ex(a, b)}`) + '.', (x) => a * f(x)), mk(`\\mathrm{e}^{${ex(a, b)}}`, 'oublie la dérivée de l’exposant ' + M(`u'=${a}`) + '.', (x) => f(x)), mk(`${ex(a, b)}\\mathrm{e}^{${ex(a, b - 1)}}`.replace(/^1/, ''), 'dérive comme une puissance ' + M('x^{n}') + '.', (x) => (a * x + b) * Math.exp(a * x + b - 1)), mk(`${a === 1 ? '' : a}x\\mathrm{e}^{${ex(a, b)}}`.replace(/^-1x/, '-x'), 'multiplie par ' + M('x') + ' au lieu de ' + M(a) + '.', (x) => a * x * f(x))];
        if (a === 1 || a === -1) return this.make(r, level);
        return mcq(r, `Soit ${M(`f(x)=\\mathrm{e}^{${ex(a, b)}}`)}. Alors :`, cands[0], cands.slice(1), (o) => [-0.7, 0.3, 1.1].every((x) => near(o.g(x), nd(f, x), 1e-3)));
      }
      let a, b, k; do { a = r.nz(-4, 4); b = r.int(-4, 4); k = r.pick([1, -1, 2, -2, 3]); } while (a === 1 && false);
      const f = (x) => (a * x + b) * Math.exp(k * x), kk = k === 1 ? '' : k === -1 ? '-' : k, mk = (p, why, g) => opt(M(`f'(x)=(${polyTex(p)})\\mathrm{e}^{${kk}x}`), why, { g }), pa = [a * k, a + b * k], pb = [a * k, b * k], pc = [a * k, a], pd = [k * a, b * k + a * k];
      const cands = [mk(pa, M("(uv)'=u'v+uv'") + ' avec ' + M(`u=${ex(a, b)}`) + ' et ' + M(`v=\\mathrm{e}^{${kk}x}`) + '.', (x) => (pa[0] * x + pa[1]) * Math.exp(k * x)), mk(pb, 'oublie le terme ' + M("u'v") + '.', (x) => (pb[0] * x + pb[1]) * Math.exp(k * x)), mk(pc, 'oublie le facteur ' + M(k) + ' dans le terme ' + M("uv'") + '.', (x) => (pc[0] * x + pc[1]) * Math.exp(k * x)), mk([a * k, a * k + b], 'confond les termes ' + M("u'v") + ' et ' + M("uv'") + '.', (x) => (a * k * x + a * k + b) * Math.exp(k * x))];
      if (new Set(cands.map((c) => c.t)).size < 4) return this.make(r, level);
      return mcq(r, `Soit ${M(`f(x)=(${ex(a, b)})\\mathrm{e}^{${kk}x}`)}. Alors :`, cands[0], cands.slice(1), (o) => [-0.7, 0.3, 1.1].every((x) => near(o.g(x), nd(f, x), 1e-3)));
    } },

  { id: 'p-exp-tf', cls: C, chapter: 'premiere-09', domain: 'analyse', skill: 'Vrai ou faux sur l’exponentielle', fast: true,
    make(r, level) {
      const a = r.int(2, 90), b = r.int(2, 90), k = r.int(3, 60), x0 = r.nz(-39, 39);
      const fam = {
        1: [
          () => ({ s: `${M(`\\mathrm{e}^{${a}+${b}}=\\mathrm{e}^{${a}}+\\mathrm{e}^{${b}}`)}.`, v: false, j: `${M(`\\mathrm{e}^{${a}+${b}}=\\mathrm{e}^{${a}}\\times\\mathrm{e}^{${b}}`)}, ce n’est pas une somme (ordres de grandeur : ${M(`\\mathrm{e}^{1+1}\\approx 7{,}39`)} et ${M('\\mathrm{e}+\\mathrm{e}\\approx 5{,}44')}).`, c: () => Math.abs(Math.exp(a + b) - Math.exp(a) - Math.exp(b)) > 1 }),
          () => ({ s: `Pour tout réel ${M('x')}, ${M(`\\mathrm{e}^{x${sgn(x0)}}>0`)}.`, v: true, j: `La fonction exponentielle est strictement positive sur ${M(R)}, donc ${M(`\\mathrm{e}^{x${sgn(x0)}}>0`)}.`, c: () => [-30, -3, 0, 4].every((x) => Math.exp(x + x0) > 0) }),
          () => ({ s: `L’équation ${M(`\\mathrm{e}^{x}=-${k}`)} admet une solution dans ${M(R)}.`, v: false, j: `${M('\\mathrm{e}^{x}>0')} pour tout réel ${M('x')} : jamais égale à ${M(-k)}.`, c: () => [-9, 0, 3].every((x) => Math.exp(x) > -k) }),
          () => ({ s: `${M(`\\mathrm{e}^{-${a}}=\\dfrac{1}{\\mathrm{e}^{${a}}}`)}.`, v: true, j: `${M('\\mathrm{e}^{-x}=\\dfrac{1}{\\mathrm{e}^{x}}')} car ${M('\\mathrm{e}^{x}\\mathrm{e}^{-x}=\\mathrm{e}^{0}=1')}.`, c: () => near(Math.exp(-a), 1 / Math.exp(a), 1e-12) }),
        ],
        2: [
          () => ({ s: `La fonction ${M(`f(x)=\\mathrm{e}^{-${k}x}`)} est croissante sur ${M(R)}.`, v: false, j: `${M(`f'(x)=-${k}\\mathrm{e}^{-${k}x}<0`)} : ${M('f')} est décroissante.`, c: () => Math.exp(-k * 1) < Math.exp(-k * 0) }),
          () => ({ s: `Pour tout réel ${M('x')}, ${M('\\mathrm{e}^{x}\\geqslant 1+x')}.`, v: true, j: `Comme ${M('f(x)=\\mathrm{e}^{x}-1-x')} a pour dérivée ${M('\\mathrm{e}^{x}-1')}, elle admet un minimum ${M('f(0)=0')}. Exemple : ${M(`\\mathrm{e}^{-${a}}>1-${a}`)}.`, c: () => [-7, -1, 0, 1, 3].every((x) => Math.exp(x) >= 1 + x - 1e-12) }),
          () => ({ s: `${M(`\\left(\\mathrm{e}^{x}\\right)^{${k}}=\\mathrm{e}^{x^{${k}}}`)} pour tout réel ${M('x')}.`, v: false, j: `${M(`\\left(\\mathrm{e}^{x}\\right)^{${k}}=\\mathrm{e}^{${k}x}`)}. Avec ${M('x=2')} : ${M(`\\mathrm{e}^{${2 * k}}\\neq\\mathrm{e}^{${2 ** k}}`)}.`, c: () => 2 * k !== 2 ** k }),
          () => ({ s: `L’équation de la tangente à la courbe de ${M('\\exp')} au point d’abscisse ${M(0)} est ${M('y=x+1')}.`, v: true, j: `${M('\\exp(0)=1')} et ${M("\\exp'(0)=1")} : la tangente est ${M('y=1\\times x+1')}.`, c: () => near(nd(Math.exp, 0), 1, 1e-6) }),
        ],
        3: [
          () => ({ s: `Si ${M(`\\mathrm{e}^{a}<\\mathrm{e}^{b}`)} alors ${M('a<b')}. (Exemple : ${M(`\\mathrm{e}^{-${a}}<\\mathrm{e}^{-${a - 1}}`)}.)`, v: true, j: `La fonction exponentielle est strictement croissante : elle conserve l’ordre. Ici ${M(`-${a}<-${a - 1}`)}.`, c: () => Math.exp(-a) < Math.exp(-(a - 1)) && -a < -(a - 1) }),
          () => ({ s: `La fonction ${M(`f(x)=x\\mathrm{e}^{-x}`)} est décroissante sur ${M(R)}.`, v: false, j: `${M("f'(x)=(1-x)\\mathrm{e}^{-x}")} est positive pour ${M('x<1')} : ${M('f')} croît sur ${M(']-\\infty\\,;\\,1]')} puis décroît.`, c: () => 0 * Math.exp(0) < 0.5 * Math.exp(-0.5) }),
          () => ({ s: `Pour tout réel ${M('x')}, ${M(`\\mathrm{e}^{2x}-${2 * k}\\mathrm{e}^{x}+${k * k}\\geqslant 0`)}.`, v: true, j: `${M(`\\mathrm{e}^{2x}-${2 * k}\\mathrm{e}^{x}+${k * k}=\\left(\\mathrm{e}^{x}-${k}\\right)^{2}\\geqslant 0`)}.`, c: () => [-3, 0, Math.log(k), 2].every((x) => Math.exp(2 * x) - 2 * k * Math.exp(x) + k * k >= -1e-9) }),
          () => ({ s: `${M('0')} est solution de l’équation ${M(`\\mathrm{e}^{2x}-${k + 1}\\mathrm{e}^{x}+${k}=0`)}.`, v: true, j: `${M(`\\mathrm{e}^{0}=1`)} : ${M(`1-${k + 1}+${k}=0`)}. (En posant ${M('X=\\mathrm{e}^{x}')} : ${M(`X^{2}-${k + 1}X+${k}=(X-1)(X-${k})`)}.)`, c: () => Math.exp(0) ** 2 - (k + 1) + k === 0 }),
        ],
      };
      return tf(r.pick(fam[level])());
    } },

  { id: 'p-exp-error', cls: C, chapter: 'premiere-09', domain: 'analyse', skill: 'Trouver l’erreur dans un calcul avec exponentielle', fast: false,
    make(r, level) {
      if (level === 1) {
        let a, b, c, d, kind; do { a = r.nz(-5, 5); b = r.int(-6, 6); c = r.nz(-5, 5); d = r.int(-6, 6); kind = r.pick(['prod', 'sign', 'div']); } while (a === c || (a - c) === 0);
        const x0 = F(d - b, a - c), eqn = `\\mathrm{e}^{${ex(a, b)}}\\times\\mathrm{e}^{${ex(c, d)}}=\\mathrm{e}^{${d}}`.replace('\\times', '\\times');
        // equation e^{ax+b} e^{cx+d'} = e^{p}: exponents add
        const p = r.int(-5, 5), s = a + c, cst = b + d;
        if (s === 0) return this.make(r, level);
        const x = F(p - cst, s), good = [`\\mathrm{e}^{${ex(s, cst)}}=\\mathrm{e}^{${p}}`, `${ex(s, cst)}=${p}`, `x=${fracTex(x)}`];
        let lines = good, bad, why, fix, shown = x;
        if (kind === 'prod') { const sw = a * c; lines = [`\\mathrm{e}^{${ex(a * c, b * d)}}=\\mathrm{e}^{${p}}`.replace('x', 'x'), `${polyTex([a * c, b * d])}=${p}`, `x=${fracTex(F(p - b * d, a * c))}`]; bad = 0; why = `le produit de deux exponentielles s’écrit en additionnant les exposants : ${M('\\mathrm{e}^{u}\\mathrm{e}^{v}=\\mathrm{e}^{u+v}')}.`; fix = M(good[0]); shown = a * c === 0 ? F(0) : F(p - b * d, a * c); if (a * c === 0) return this.make(r, level); }
        else if (kind === 'sign') { const sh = F(p + cst, s); lines = [good[0], `${ex(s, cst)}=${p}`, `x=${fracTex(sh)}`]; bad = 2; why = `${M(`${ex(s, cst)}=${p}\\iff ${polyTex([s, 0])}=${p - cst}`)} : on retranche ${M(cst)} des deux côtés.`; fix = M(good[2]); shown = sh; if (cst === 0) return this.make(r, level); }
        else { const dv = F(p, s); lines = [good[0], `${ex(s, cst)}=${p}`, `x=${fracTex(dv)}`]; bad = 2; why = `il faut d’abord isoler ${M(polyTex([s, 0]))} : ${M(`${polyTex([s, 0])}=${p - cst}`)}.`; fix = M(good[2]); shown = dv; if (cst === 0) return this.make(r, level); }
        if (eq(shown, x)) return this.make(r, level);
        return spot(`Pour résoudre ${M(`\\mathrm{e}^{${ex(a, b)}}\\times\\mathrm{e}^{${ex(c, d)}}=\\mathrm{e}^{${p}}`)} dans ${M(R)}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(`S=\\left\\{${fracTex(x)}\\right\\}`), () => near((a * val(x) + b) + (c * val(x) + d), p, 1e-9) && !eq(shown, x) && x0 !== undefined);
      }
      if (level === 2) {
        let a, b, k, kind; do { a = r.nz(-4, 4); b = r.nz(-5, 5); k = r.pick([1, -1, 2, -2, 3]); kind = r.pick(['first', 'chain', 'sum']); } while (false);
        const f = (x) => (a * x + b) * Math.exp(k * x), kk = k === 1 ? '' : k === -1 ? '-' : k, pr = [a * k, a + b * k];
        const good = [`u=${ex(a, b)},\\ v=\\mathrm{e}^{${kk}x},\\ u'=${a},\\ v'=${coef(k) === '' ? '' : coef(k)}\\mathrm{e}^{${kk}x}`, `f'(x)=u'v+uv'=${par(a)}\\mathrm{e}^{${kk}x}+(${ex(a, b)})\\times ${coef(k) === '' ? '' : par(k) + '\\times '}\\mathrm{e}^{${kk}x}`, `f'(x)=(${polyTex(pr)})\\mathrm{e}^{${kk}x}`];
        let lines = good, bad, why, fix, g;
        if (kind === 'first') { lines = [`u=${ex(a, b)},\\ v=\\mathrm{e}^{${kk}x},\\ u'=${a},\\ v'=\\mathrm{e}^{${kk}x}`, `f'(x)=${par(a)}\\mathrm{e}^{${kk}x}+(${ex(a, b)})\\mathrm{e}^{${kk}x}`, `f'(x)=(${polyTex([a, a + b])})\\mathrm{e}^{${kk}x}`]; bad = 0; why = `${M(`v'=${k}\\mathrm{e}^{${kk}x}`)} : la dérivée de ${M(`\\mathrm{e}^{${kk}x}`)} contient la dérivée de l’exposant.`; fix = M(good[0]); g = (x) => (a * x + a + b) * Math.exp(k * x); if (k === 1) return this.make(r, level); }
        else if (kind === 'chain') { lines = [good[0], `f'(x)=u'v'=${par(a)}\\times ${par(k)}\\mathrm{e}^{${kk}x}`, `f'(x)=${a * k}\\mathrm{e}^{${kk}x}`]; bad = 1; why = `la dérivée d’un produit est ${M("u'v+uv'")}, pas ${M("u'v'")}.`; fix = M(good[1]); g = (x) => a * k * Math.exp(k * x); }
        else { lines = [good[0], good[1], `f'(x)=(${polyTex([a * k, a - b * k])})\\mathrm{e}^{${kk}x}`]; bad = 2; why = `en factorisant, ${M(`${a}+${par(b)}\\times ${par(k)}=${a + b * k}`)} : le terme ${M(`${b}\\times ${par(k)}`)} s’ajoute.`; fix = M(good[2]); g = (x) => (a * k * x + a - b * k) * Math.exp(k * x); if (b * k === 0) return this.make(r, level); }
        if (k === 1 && kind !== 'first' && false) return this.make(r, level);
        return spot(`Pour dériver ${M(`f(x)=(${ex(a, b)})\\mathrm{e}^{${kk}x}`)}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(good[2]), () => [-0.7, 0.3, 1.1].every((x) => near(nd(f, x), (pr[0] * x + pr[1]) * Math.exp(k * x), 1e-3)) && !near(g(0.3), nd(f, 0.3), 1e-3));
      }
      let a, c, b, d; do { a = r.nz(-4, 4); c = r.nz(-4, 4); b = r.int(-5, 5); d = r.int(-5, 5); } while (a >= 0 === c >= 0 || a === c);
      const op = r.pick(['\\geqslant ', '\\leqslant ']), dA = a - c, x0 = F(d - b, dA), geq = op.startsWith('\\geq'), upTrue = dA > 0;
      const good = [`\\mathrm{e}^{${ex(a, b)}}${op}\\mathrm{e}^{${ex(c, d)}}`, `${ex(a, b)}${op}${ex(c, d)}`, `${polyTex([dA, 0])}${op}${d - b}`, `x${(dA > 0) === geq ? '\\geqslant ' : '\\leqslant '}${fracTex(x0)}`];
      const wrongDir = (dA > 0) === geq ? '\\leqslant ' : '\\geqslant ';
      const lines = [good[0], good[1], good[2], `x${wrongDir}${fracTex(x0)}`];
      const trueSet = ((dA > 0) === geq) ? `\\left[${fracTex(x0)}\\,;\\,+\\infty\\right[` : `\\left]-\\infty\\,;\\,${fracTex(x0)}\\right]`;
      return spot(`Pour résoudre ${M(good[0])} dans ${M(R)}, un élève écrit une solution.`, lines.map(M), 3, `${dA > 0 ? 'on divise par un nombre positif : le sens de l’inégalité est conservé' : 'on divise par ' + M(dA) + ', nombre négatif : le sens de l’inégalité change'} (le passage de L1 à L2 est correct car ${M('\\exp')} est strictement croissante).`, M(good[3]), M(`S=${trueSet}`), () => { const f = (x) => a * x + b, g = (x) => c * x + d; for (let t = -40; t <= 40; t++) { const x = t / 4, holds = geq ? f(x) >= g(x) : f(x) <= g(x), inTrue = (dA > 0) === geq ? x >= val(x0) : x <= val(x0); if (holds !== inTrue) return false; } return a - c !== 0; });
    } },

  { id: 'p-exp-variation', cls: C, chapter: 'premiere-09', domain: 'analyse', skill: 'Étude d’une fonction (ax+b)e^{kx}', fast: false,
    make(r, level) {
      const k = level === 1 ? 1 : r.pick([1, -1]), a = r.pick(level === 1 ? [1, 2, 3, 4, -1, -2, -3] : [1, 2, 3, 4, 5, -1, -2, -3, -4, -5]), x0 = r.int(-9, 9), b = -a * (x0 + k), f = (x) => (a * x + b) * Math.exp(k * x), kk = k === 1 ? '' : '-', fp = (x) => (a * k * x + a + b * k) * Math.exp(k * x), val0 = -a * k;
      const body = `f(x)=(${ex(a, b)})\\mathrm{e}^{${kk}x}`, lin0 = polyTex([a * k, a + b * k]), up = a * k > 0;
      const info = `${M(`f'(x)=(${lin0})\\mathrm{e}^{${kk}x}`)}, et ${M(`\\mathrm{e}^{${kk}x}>0`)} donc ${M("f'")} a le signe de ${M(lin0)}, qui s’annule en ${M(`x=${x0}`)}`;
      const varTxt = `${M('f')} ${up ? 'décroît sur ' + M(`]-\\infty\\,;\\,${x0}]`) + ' puis croît sur ' + M(`[${x0}\\,;\\,+\\infty[`) : 'croît sur ' + M(`]-\\infty\\,;\\,${x0}]`) + ' puis décroît sur ' + M(`[${x0}\\,;\\,+\\infty[`)}`;
      const ext = `${up ? 'minimum' : 'maximum'} ${M(`f(${x0})=${val0 === 1 ? '' : val0 === -1 ? '-' : val0}${E(`${k * x0}`)}`)}`;
      const checkVar = () => near(nd(f, x0), 0, 1e-3) && (nd(f, x0 - 0.5) < 0) === up && (nd(f, x0 + 0.5) > 0) === up && near(f(x0), val0 * Math.exp(k * x0), 1e-9) && near(nd(f, 0.37), fp(0.37), 1e-3);
      if (level === 1) return { q: `Soit ${M(body)}. Calculer ${M("f'(x)")}, étudier son signe et donner les variations de ${M('f')}.`, a: `${info}. ${varTxt} ; ${ext}.`.replace(/\.\s*;/, ';'), ok: checkVar };
      if (level === 2) return { q: `Soit ${M(body)}. Montrer que ${M("f'(x)")} s’écrit ${M(`(${lin0})\\mathrm{e}^{${kk}x}`)}, dresser le tableau de variations de ${M('f')} et préciser son extremum.`, a: `${info}. ${varTxt} ; ${ext}.`, ok: checkVar };
      return { q: `Soit ${M(body)}. 1) Calculer ${M("f'(x)")} et étudier son signe. 2) Donner les variations de ${M('f')} et la valeur exacte de son extremum. 3) Résoudre ${M('f(x)\\geqslant 0')}.`, a: `1) ${info}. 2) ${varTxt} ; ${ext}. 3) ${M(`\\mathrm{e}^{${kk}x}>0`)} : ${M('f(x)\\geqslant 0')} équivaut à ${M(`${ex(a, b)}\\geqslant 0`)}, soit ${M(`x${a > 0 ? '\\geqslant ' : '\\leqslant '}${fracTex(F(-b, a))}`)}.`, ok: () => checkVar() && [-6, -2, 0, 3, 5].every((x) => (f(x) >= -1e-12) === (a > 0 ? x >= -b / a - 1e-12 : x <= -b / a + 1e-12)) };
    } },

  { id: 'p-exp-model', cls: C, chapter: 'premiere-09', domain: 'analyse', skill: 'Modèles continus avec exponentielle', fast: false,
    make(r, level) {
      const kk = r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.05, 0.15]), C0 = r.pick([20, 40, 50, 80, 100, 120, 150, 200, 250, 400, 500]), kt = numTex(F(Math.round(kk * 100), 100));
      const [what, unit, tu] = r.pick([['La concentration d’un médicament dans le sang', 'mg/L', 'heures'], ['La quantité d’une substance radioactive', 'mg', 'jours'], ['La température d’écart d’une boisson avec la pièce', '°C', 'minutes'], ['Le nombre de bactéries d’une culture (en milliers)', '', 'heures']]);
      const u = unit ? `\\ \\text{${unit}}` : '', t0 = r.int(1, 12);
      if (level === 1) {
        const f = (t) => C0 * Math.exp(-kk * t), v = f(t0);
        if (Math.abs(v * 100 - Math.round(v * 100) - 0.5) < 0.02 || Math.abs((v * 100) % 1 - 0.5) < 0.03) return this.make(r, level);
        return { q: `${what} est modélisé, en fonction du temps ${M('t')} (en ${tu}), par ${M(`C(t)=${C0}\\mathrm{e}^{-${kt}t}`)}. Calculer ${M(`C(0)`)} puis ${M(`C(${t0})`)} arrondi au centième.`, a: `${M(`C(0)=${C0}\\mathrm{e}^{0}=${C0}${u}`)}. ${M(`C(${t0})=${C0}\\mathrm{e}^{-${kt}\\times ${t0}}\\approx ${roundTex(v, 2)}${u}`)}.`, ok: () => near(f(0), C0) && near(C0 * Math.exp(-kk * t0), v) };
      }
      if (level === 2) {
        const n = r.int(2, 6), tn = n / kk, f = (t) => C0 * Math.exp(-kk * t);
        if (Math.abs(tn - Math.round(tn)) > 1e-9 && false) return this.make(r, level);
        const tTxt = numTex(F(Math.round(tn * 100), 100)), der = f(t0) * -kk;
        if (Math.abs(der * 100 - Math.round(der * 100)) % 1 > 0.47 && Math.abs(der * 100 - Math.round(der * 100) - 0.5) < 0.03) return this.make(r, level);
        return { q: `${what} est modélisé, en fonction du temps ${M('t')} (en ${tu}), par ${M(`C(t)=${C0}\\mathrm{e}^{-${kt}t}`)}. 1) Montrer que ${M('C')} est décroissante. 2) À quel instant ${M('t')} a-t-on ${M(`C(t)=${C0}\\mathrm{e}^{-${n}}`)} ? 3) Calculer la vitesse de variation ${M(`C'(${t0})`)} arrondie au centième.`, a: `1) ${M(`C'(t)=-${kt}\\times ${C0}\\mathrm{e}^{-${kt}t}<0`)}. 2) ${M(`\\mathrm{e}^{-${kt}t}=\\mathrm{e}^{-${n}}\\iff ${kt}t=${n}\\iff t=${tTxt}`)}. 3) ${M(`C'(${t0})=-${kt}C(${t0})\\approx ${roundTex(der, 2)}`)}.`, ok: () => near(nd(f, t0), der, 1e-4) && near(f(tn), C0 * Math.exp(-n), 1e-9) && f(1) < f(0) };
      }
      const A = r.int(2, 15), m = r.int(1, 8), k3 = 1 / m, f = (t) => A * t * Math.exp(-k3 * t), fmax = (A * m) / Math.E, kt3 = numTex(F(1, m));
      if (Math.abs(fmax * 100 - Math.round(fmax * 100) - 0.5) < 0.03) return this.make(r, level);
      const ex1 = m === 1 ? '\\mathrm{e}^{-t}' : `\\mathrm{e}^{-t/${m}}`;
      return { q: `Après injection, la concentration d’un médicament (en mg/L) est ${M(`C(t)=${A}t\\,${ex1}`)} pour ${M('t\\geqslant 0')} (${M('t')} en heures). 1) Montrer que ${M(`C'(t)=${A}\\left(1-\\dfrac{t}{${m}}\\right)${ex1}`.replace('\\dfrac{t}{1}', 't'))}. 2) Dresser le tableau de variations de ${M('C')}. 3) À quel instant la concentration est-elle maximale ? Donner sa valeur exacte puis arrondie au centième.`,
        a: `1) ${M(`C'(t)=${A}${ex1}+${A}t\\times\\left(-\\dfrac{1}{${m}}\\right)${ex1}=${A}\\left(1-\\dfrac{t}{${m}}\\right)${ex1}`.replace('\\left(-\\dfrac{1}{1}\\right)', '(-1)').replace('\\dfrac{t}{1}', 't'))}. 2) ${M(`${ex1}>0`)} : ${M("C'")} a le signe de ${M(`1-\\dfrac{t}{${m}}`.replace('\\dfrac{t}{1}', 't'))}, positive sur ${M(`[0\\,;\\,${m}]`)}, négative après : ${M('C')} croît puis décroît. 3) Maximum à l’instant ${M(`t=${m}`)} : ${M(`C(${m})=${A * m}\\mathrm{e}^{-1}\\approx ${roundTex(fmax, 2)}`)}.`,
        ok: () => near(nd(f, m), 0, 1e-3) && nd(f, m - 0.5) > 0 && nd(f, m + 0.5) < 0 && near(f(m), (A * m) / Math.E) && near(nd(f, 0.9), A * (1 - 0.9 / m) * Math.exp(-0.9 / m), 1e-3) };
    } },

  { id: 'p-exp-tangent', cls: C, chapter: 'premiere-09', domain: 'analyse', skill: 'Tangentes à la courbe d’une exponentielle', fast: false,
    make(r, level) {
      if (level === 1) {
        const k = r.nz(-9, 9), x0 = r.int(-6, 6), f = (x) => Math.exp(k * x);
        if (x0 === 0) return { q: `Déterminer l’équation de la tangente à la courbe de ${M(`f(x)=\\mathrm{e}^{${k === 1 ? '' : k === -1 ? '-' : k}x}`)} au point d’abscisse ${M(0)}.`, a: `${M(`f(0)=1`)}, ${M(`f'(x)=${k}\\mathrm{e}^{${k === 1 ? '' : k === -1 ? '-' : k}x}`.replace('=1\\mathrm', '=\\mathrm'))} donc ${M(`f'(0)=${k}`)} : ${M(`y=${k}x+1`.replace('=1x', '=x').replace('=-1x', '=-x'))}.`, ok: () => near(nd(f, 0), k, 1e-4) };
        return { q: `Déterminer l’équation réduite de la tangente à la courbe de ${M(`f(x)=\\mathrm{e}^{${k === 1 ? '' : k === -1 ? '-' : k}x}`)} au point d’abscisse ${M(x0)}.`, a: `${M(`f'(x)=${coef(k)}\\mathrm{e}^{${coef(k)}x}`)}, ${M(`f(${x0})=${E(`${k * x0}`)}`)} et ${M(`f'(${x0})=${coef(k)}${E(`${k * x0}`)}`)}. ${M(`y=${coef(k)}${E(`${k * x0}`)}(x${sgn(-x0)})+${E(`${k * x0}`)}`)}, soit ${M(`y=${coef(k)}${E(`${k * x0}`)}x${1 - k * x0 === 0 ? '' : `${1 - k * x0 > 0 ? '+' : '-'}${Math.abs(1 - k * x0) === 1 ? '' : Math.abs(1 - k * x0)}${E(`${k * x0}`)}`}`)}.`, ok: () => near(nd(f, x0), k * f(x0), 1e-3) };
      }
      if (level === 2) {
        const a = r.nz(-4, 4), b = r.int(-5, 5), k = r.pick([1, -1, 2, -2]), f = (x) => (a * x + b) * Math.exp(k * x), m = a + b * k, kk = k === 1 ? '' : k === -1 ? '-' : k;
        if (m === 0 && false) return this.make(r, level);
        return { q: `Soit ${M(`f(x)=(${ex(a, b)})\\mathrm{e}^{${kk}x}`)}. Déterminer l’équation réduite de la tangente à la courbe de ${M('f')} au point d’abscisse ${M(0)}.`, a: `${M(`f(0)=${b}\\mathrm{e}^{0}=${b}`)}. ${M(`f'(x)=(${polyTex([a * k, a + b * k])})\\mathrm{e}^{${kk}x}`)} donc ${M(`f'(0)=${m}`)}. ${M(`y=${polyTex([m, b])}`)}.`, ok: () => near(f(0), b) && near(nd(f, 0), m, 1e-4) };
      }
      const k = r.pick([1, -1, 2, -2, 3, -3, 4, -4, 5]), p = r.int(-9, 9), tcont = p + 1 / k, f = (x) => Math.exp(k * x), kk = k === 1 ? '' : k === -1 ? '-' : k, slopeExp = k * p + 1;
      return { q: `Soit ${M(`f(x)=\\mathrm{e}^{${kk}x}`)}. Déterminer l’équation de la tangente à la courbe de ${M('f')} qui passe par le point ${M(`P(${p}\\,;\\,0)`)}. (On notera ${M('t')} l’abscisse du point de contact.)`,
        a: `La tangente en ${M('t')} est ${M(`y=${coef(k)}\\mathrm{e}^{${kk}t}(x-t)+\\mathrm{e}^{${kk}t}`)}. Elle passe par ${M('P')} si ${M(`${coef(k)}\\mathrm{e}^{${kk}t}(${p}-t)+\\mathrm{e}^{${kk}t}=0`)}, soit ${M(`\\mathrm{e}^{${kk}t}\\left(${coef(k)}(${p}-t)+1\\right)=0`)} avec ${M(`\\mathrm{e}^{${kk}t}>0`)} : ${M(`${coef(k)}(${p}-t)+1=0`)}, d’où ${M(`t=${fracTex(F(k * p + 1, k))}`)}. La tangente est ${M(`y=${coef(k)}${E(`${slopeExp}`)}${xm(p)}`)}.`,
        ok: () => { const t = tcont, m = k * f(t), c0 = f(t) - m * t; return Math.abs(m * p + c0) <= 1e-9 * f(t) && near(nd(f, t), m, 1e-4) && near(m, k * Math.exp(k * p + 1), 1e-9) && near(t, (k * p + 1) / k, 1e-9); } };
    } },

  // ============================ 10 Trigonométrie ============================
  { id: 'p-trig-assoc', cls: C, chapter: 'premiere-10', domain: 'geometrie', skill: 'Angles associés', fast: true,
    make(r, level) {
      const T = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]]), sc = r.sign(), ss = r.sign(), swap = r.next() < 0.5;
      const c = F(sc * (swap ? T[1] : T[0]), T[2]), s = F(ss * (swap ? T[0] : T[1]), T[2]), x = Math.atan2(val(s), val(c));
      const forms = [['\\cos(\\pi-x)', (u) => Math.cos(Math.PI - u), mul(F(-1), c)], ['\\sin(\\pi-x)', (u) => Math.sin(Math.PI - u), s], ['\\cos(\\pi+x)', (u) => Math.cos(Math.PI + u), mul(F(-1), c)], ['\\sin(\\pi+x)', (u) => Math.sin(Math.PI + u), mul(F(-1), s)], ['\\cos(-x)', (u) => Math.cos(-u), c], ['\\sin(-x)', (u) => Math.sin(-u), mul(F(-1), s)], ['\\cos\\left(\\dfrac{\\pi}{2}-x\\right)', (u) => Math.cos(Math.PI / 2 - u), s], ['\\sin\\left(\\dfrac{\\pi}{2}-x\\right)', (u) => Math.sin(Math.PI / 2 - u), c], ['\\cos\\left(\\dfrac{\\pi}{2}+x\\right)', (u) => Math.cos(Math.PI / 2 + u), mul(F(-1), s)], ['\\sin\\left(\\dfrac{\\pi}{2}+x\\right)', (u) => Math.sin(Math.PI / 2 + u), c]];
      const given = `${M(`\\cos x=${fracTex(c)}`)} et ${M(`\\sin x=${fracTex(s)}`)}`;
      if (level === 1) { const picks = r.shuffle(forms).slice(0, 2); return { q: `On sait que ${given}. Calculer ${picks.map((p) => M(p[0])).join(' et ')}.`, a: picks.map((p) => M(`${p[0]}=${fracTex(p[2])}`)).join(' ; ') + '.', ok: () => near(val(c) ** 2 + val(s) ** 2, 1, 1e-12) && picks.every((p) => near(p[1](x), val(p[2]), 1e-9)) }; }
      if (level === 2) {
        const [p1, p2, p3] = r.shuffle(forms).slice(0, 3), tot = add(add(p1[2], p2[2]), p3[2]);
        return { q: `On sait que ${given}. Calculer ${M(`A=${p1[0]}+${p2[0]}+${p3[0]}`)}.`, a: `${M(`${p1[0]}=${fracTex(p1[2])}`)}, ${M(`${p2[0]}=${fracTex(p2[2])}`)}, ${M(`${p3[0]}=${fracTex(p3[2])}`)} donc ${M(`A=${fracTex(tot)}`)}.`, ok: () => near(p1[1](x) + p2[1](x) + p3[1](x), val(tot), 1e-9) };
      }
      const quad = sc > 0 ? (ss > 0 ? 'premier' : 'quatrième') : (ss > 0 ? 'deuxième' : 'troisième'), rng2 = sc > 0 ? (ss > 0 ? '\\left[0\\,;\\,\\dfrac{\\pi}{2}\\right]' : '\\left[-\\dfrac{\\pi}{2}\\,;\\,0\\right]') : (ss > 0 ? '\\left[\\dfrac{\\pi}{2}\\,;\\,\\pi\\right]' : '\\left[-\\pi\\,;\\,-\\dfrac{\\pi}{2}\\right]');
      const [p1, p2] = r.shuffle(forms).slice(0, 2), prod = mul(p1[2], p2[2]);
      return { q: `${M('x')} est un réel de ${M(rng2)} tel que ${M(`\\cos x=${fracTex(c)}`)}. Déterminer ${M('\\sin x')}, puis calculer ${M(`B=${p1[0]}\\times ${p2[0]}`)}.`, a: `${M(`\\sin^{2}x=1-\\cos^{2}x=1-${fracTex(mul(c, c))}=${fracTex(mul(s, s))}`)} ; ${M('x')} est dans le ${quad} quadrant : ${M(`\\sin x`)} est ${ss > 0 ? 'positif' : 'négatif'}, donc ${M(`\\sin x=${fracTex(s)}`)}. ${M(`${p1[0]}=${fracTex(p1[2])}`)} et ${M(`${p2[0]}=${fracTex(p2[2])}`)} : ${M(`B=${fracTex(prod)}`)}.`, ok: () => { const sx = Math.sign(val(s)) * Math.sqrt(1 - val(c) ** 2); return near(sx, val(s), 1e-9) && near(p1[1](x) * p2[1](x), val(prod), 1e-9) && (sc > 0 ? Math.abs(x) < Math.PI / 2 : Math.abs(x) > Math.PI / 2); } };
    } },

  { id: 'p-trig-qcm', cls: C, chapter: 'premiere-10', domain: 'geometrie', skill: 'QCM sur la trigonométrie', fast: true,
    make(r, level) {
      if (level === 1) {
        const forms = [['\\cos(\\pi-x)', (x) => Math.cos(Math.PI - x), '-\\cos x', (x) => -Math.cos(x)], ['\\sin(\\pi-x)', (x) => Math.sin(Math.PI - x), '\\sin x', Math.sin], ['\\cos(\\pi+x)', (x) => Math.cos(Math.PI + x), '-\\cos x', (x) => -Math.cos(x)], ['\\sin(\\pi+x)', (x) => Math.sin(Math.PI + x), '-\\sin x', (x) => -Math.sin(x)], ['\\cos\\left(\\dfrac{\\pi}{2}-x\\right)', (x) => Math.cos(Math.PI / 2 - x), '\\sin x', Math.sin], ['\\sin\\left(\\dfrac{\\pi}{2}-x\\right)', (x) => Math.sin(Math.PI / 2 - x), '\\cos x', Math.cos]];
        const f = r.pick(forms), pool = [['\\cos x', Math.cos, 'confond avec le cosinus de ' + M('x') + '.'], ['-\\cos x', (x) => -Math.cos(x), 'se trompe de signe ou de fonction (cosinus opposé).'], ['\\sin x', Math.sin, 'prend le sinus de ' + M('x') + ' : confond cosinus et sinus.'], ['-\\sin x', (x) => -Math.sin(x), 'prend le sinus opposé.']].filter((p) => p[0] !== f[2]);
        const rightWhy = f[0].includes('\\pi}{2}') ? 'les angles complémentaires échangent cosinus et sinus.' : f[0].includes('\\pi-') ? 'les angles supplémentaires ont le même sinus et des cosinus opposés.' : 'un demi-tour change le signe du cosinus et du sinus.';
        return mcq(r, `Pour tout réel ${M('x')}, ${M(f[0])} est égal à :`, opt(M(f[2]), rightWhy.replace(/^./, (c0) => c0.toUpperCase()), { g: f[3] }), pool.map((p) => opt(M(p[0]), p[2], { g: p[1] })), (o) => [0.3, 1.2, 2.5, -0.9].every((x) => near(f[1](x), o.g(x), 1e-9)));
      }
      if (level === 2) {
        const u = r.pick([2, 4, 8, 10, 14, 16, 20, 22]), ex1 = exactCosSin(u), kind = r.pick(['cos', 'sin']), ang = piTex(u, 12);
        const right = kind === 'cos' ? ex1.cos : ex1.sin, rightN = kind === 'cos' ? ex1.cosN : ex1.sinN, other = kind === 'cos' ? ex1.sin : ex1.cos, otherN = kind === 'cos' ? ex1.sinN : ex1.cosN, neg = (t) => (t.startsWith('-') ? t.slice(1) : `-${t}`);
        const cs = [[right, rightN, 'on ramène l’angle au premier quadrant et on applique les signes du quadrant.'], [neg(right), -rightN, 'se trompe de signe (quadrant).'], [other, otherN, 'échange le cosinus et le sinus (confond ' + M('\\dfrac{\\pi}{6}') + ' et ' + M('\\dfrac{\\pi}{3}') + ').'], [neg(other), -otherN, 'cumule l’échange cosinus/sinus et l’erreur de signe.']];
        if (new Set(cs.map((c) => c[0])).size < 4) return this.make(r, level);
        return mcq(r, `${M(`\\${kind}\\left(${ang}\\right)`)} vaut :`, opt(M(cs[0][0]), cs[0][2], { g: cs[0][1] }), cs.slice(1).map((c) => opt(M(c[0]), c[2], { g: c[1] })), (o) => near(o.g, kind === 'cos' ? Math.cos((u * Math.PI) / 12) : Math.sin((u * Math.PI) / 12), 1e-9));
      }
      const FM = [['\\cos(\\pi-x)', [-1, 0]], ['\\sin(\\pi-x)', [0, 1]], ['\\cos(\\pi+x)', [-1, 0]], ['\\sin(\\pi+x)', [0, -1]], ['\\cos(-x)', [1, 0]], ['\\sin(-x)', [0, -1]], ['\\cos\\left(\\dfrac{\\pi}{2}-x\\right)', [0, 1]], ['\\sin\\left(\\dfrac{\\pi}{2}-x\\right)', [1, 0]], ['\\cos\\left(\\dfrac{\\pi}{2}+x\\right)', [0, -1]], ['\\sin\\left(\\dfrac{\\pi}{2}+x\\right)', [1, 0]]];
      const fv = [(x) => Math.cos(Math.PI - x), (x) => Math.sin(Math.PI - x), (x) => Math.cos(Math.PI + x), (x) => Math.sin(Math.PI + x), (x) => Math.cos(-x), (x) => Math.sin(-x), (x) => Math.cos(Math.PI / 2 - x), (x) => Math.sin(Math.PI / 2 - x), (x) => Math.cos(Math.PI / 2 + x), (x) => Math.sin(Math.PI / 2 + x)];
      const i1 = r.int(0, 9); let i2; do { i2 = r.int(0, 9); } while (i2 === i1);
      const sign = r.pick([1, -1]), cf = [FM[i1][1][0] + sign * FM[i2][1][0], FM[i1][1][1] + sign * FM[i2][1][1]];
      const tex = (a, b) => { const parts = []; if (a !== 0) parts.push(`${a === 1 ? '' : a === -1 ? '-' : a}\\cos x`); if (b !== 0) parts.push(`${parts.length ? (b > 0 ? '+' : '-') : (b < 0 ? '-' : '')}${Math.abs(b) === 1 ? '' : Math.abs(b)}\\sin x`); return parts.length ? parts.join('') : '0'; };
      const cands = [[cf, 'on remplace chaque terme par son expression simplifiée puis on additionne.'], [[FM[i1][1][0] - sign * FM[i2][1][0], FM[i1][1][1] - sign * FM[i2][1][1]], 'se trompe de signe en combinant les deux termes.'], [[cf[1], cf[0]], 'échange le cosinus et le sinus dans le résultat.'], [[-cf[0], -cf[1]], 'se trompe de signe global.'], [[cf[0] + 1, cf[1]], 'oublie un terme lors de la simplification.']];
      if (new Set(cands.map((c) => tex(...c[0]))).size < 4) return this.make(r, level);
      return mcq(r, `Pour tout réel ${M('x')}, ${M(`${FM[i1][0]}${sign > 0 ? '+' : '-'}${FM[i2][0]}`)} est égal à :`, opt(M(tex(...cands[0][0])), cands[0][1], { c2: cands[0][0] }), cands.slice(1).map((c) => opt(M(tex(...c[0])), c[1], { c2: c[0] })), (o) => [0.4, 1.7, -2.2, 3.1].every((x) => near(fv[i1](x) + sign * fv[i2](x), o.c2[0] * Math.cos(x) + o.c2[1] * Math.sin(x), 1e-9)));
    } },

  { id: 'p-trig-tf', cls: C, chapter: 'premiere-10', domain: 'geometrie', skill: 'Vrai ou faux en trigonométrie', fast: true,
    make(r, level) {
      const n = r.int(1, 40), k = r.int(2, 30), u = r.pick([1, 2, 3, 4, 6, 8, 9, 10, 14, 15, 16, 18, 20, 21, 22, 23]), c0 = r.int(1, 40);
      const fam = {
        1: [
          () => ({ s: `Pour tout réel ${M('x')}, ${M('\\cos^{2}x+\\sin^{2}x=1')}.`, v: true, j: `C’est la relation fondamentale : ${M('M(\\cos x,\\sin x)')} est sur le cercle trigonométrique. Par exemple ${M(`\\cos^{2}\\left(${piTex(u, 12)}\\right)+\\sin^{2}\\left(${piTex(u, 12)}\\right)=1`)}.`, c: () => [0.2, 1, 3, -2].every((x) => near(Math.cos(x) ** 2 + Math.sin(x) ** 2, 1, 1e-12)) }),
          () => ({ s: `${M(`${n * 180}^{\\circ}`)} est égal à ${M(`${n}\\pi`)} radians.`, v: true, j: `${M(`180^{\\circ}=\\pi`)} rad donc ${M(`${n * 180}^{\\circ}=${n}\\pi`)}.`, c: () => near((n * 180 * Math.PI) / 180, n * Math.PI, 1e-12) }),
          () => ({ s: `Il existe un réel ${M('x')} tel que ${M(`\\cos x=${k}`)}.`, v: false, j: `Un cosinus est toujours compris entre ${M(-1)} et ${M(1)}.`, c: () => k > 1 }),
        ],
        2: [
          () => ({ s: `${M(`\\cos(2x)=2\\cos x`)} pour tout réel ${M('x')}.`, v: false, j: `Pour ${M('x=\\dfrac{\\pi}{3}')} : ${M('\\cos\\dfrac{2\\pi}{3}=-\\dfrac{1}{2}')} alors que ${M('2\\cos\\dfrac{\\pi}{3}=1')}.`, c: () => Math.abs(Math.cos(2 * Math.PI / 3) - 2 * Math.cos(Math.PI / 3)) > 1 }),
          () => ({ s: `${M(`\\sin(x+\\pi)=\\sin x`)} pour tout réel ${M('x')}.`, v: false, j: `${M('\\sin(x+\\pi)=-\\sin x')}. Pour ${M('x=\\dfrac{\\pi}{2}')} : ${M('\\sin\\dfrac{3\\pi}{2}=-1')} et ${M('\\sin\\dfrac{\\pi}{2}=1')}.`, c: () => Math.sin(1.5 * Math.PI) !== Math.sin(Math.PI / 2) }),
          () => ({ s: `Les réels ${M(piTex(u + 24 * c0, 12))} et ${M(piTex(u, 12))} ont le même cosinus et le même sinus.`, v: true, j: `Ils diffèrent de ${M(`${c0}\\times 2\\pi`)} : mêmes points sur le cercle trigonométrique.`, c: () => near(Math.cos(((u + 24 * c0) * Math.PI) / 12), Math.cos((u * Math.PI) / 12), 1e-9) && near(Math.sin(((u + 24 * c0) * Math.PI) / 12), Math.sin((u * Math.PI) / 12), 1e-9) }),
          () => ({ s: `Si ${M('\\cos x=\\cos y')}, alors ${M('x=y')}. (On teste ${M(`x=${piTex(u, 12)}`)} et ${M(`y=${piTex(-u, 12)}`)}.)`, v: false, j: `${M('\\cos(-t)=\\cos t')} : ${M(`\\cos x=\\cos y`)} sans que ${M('x=y')} (ici ${M(`x\\neq y`)}).`, c: () => near(Math.cos((u * Math.PI) / 12), Math.cos((-u * Math.PI) / 12), 1e-12) && u !== -u }),
        ],
        3: [
          () => { const fn = r.pick(['cos', 'sin']), f = fn === 'cos' ? Math.cos : Math.sin, vals = [['\\dfrac{1}{2}', 0.5], ['-\\dfrac{1}{2}', -0.5], ['\\dfrac{\\sqrt{2}}{2}', Math.SQRT1_2], ['-\\dfrac{\\sqrt{3}}{2}', -Math.sqrt(3) / 2], ['0', 0], ['1', 1], ['-1', -1]], [vt, vn] = r.pick(vals), doms = [['[0\\,;\\,2\\pi]', 0, 24], [']-\\pi\\,;\\,\\pi]', -11, 12], ['[0\\,;\\,\\pi]', 0, 12], ['[-\\pi\\,;\\,0]', -12, 0]], [dt, lo, hi] = r.pick(doms); let cnt = 0; for (let t = lo; t <= hi; t++) if (Math.abs(f((t * Math.PI) / 12) - vn) < 1e-9) cnt++; const claim = r.pick([cnt, cnt, cnt + 1, Math.max(0, cnt - 1)]);
            return { s: `L’équation ${M(`\\${fn} x=${vt}`)} a exactement ${claim === 0 ? 'aucune' : claim === 1 ? 'une' : claim === 2 ? 'deux' : 'trois'} solution${claim > 1 ? 's' : ''} dans ${M(dt)}.`, v: claim === cnt, j: `En résolvant (angle de référence puis symétries du cercle), on trouve ${cnt === 0 ? 'aucune solution' : `${cnt} solution${cnt > 1 ? 's' : ''}`} dans ${M(dt)}${cnt > 0 ? ' : ' + [...Array(hi - lo + 1).keys()].map((q) => q + lo).filter((t) => Math.abs(f((t * Math.PI) / 12) - vn) < 1e-9).map((t) => M(piTex(t, 12))).join(', ') : ''}.`, c: () => { let c2 = 0; for (let t = lo; t <= hi; t++) if (Math.abs(f((t * Math.PI) / 12) - vn) < 1e-9) c2++; return (claim === c2) === (claim === cnt); } }; },
          () => ({ s: `Pour tout réel ${M('x')}, ${M('\\cos^{4}x-\\sin^{4}x=\\cos(2x)')}. (On teste en ${M(`x=${piTex(u, 12)}`)}.)`, v: true, j: `${M('\\cos^{4}x-\\sin^{4}x=(\\cos^{2}x-\\sin^{2}x)(\\cos^{2}x+\\sin^{2}x)=\\cos^{2}x-\\sin^{2}x=\\cos 2x')}.`, c: () => [0.3, 1.1, (u * Math.PI) / 12].every((x) => near(Math.cos(x) ** 4 - Math.sin(x) ** 4, Math.cos(2 * x), 1e-12)) }),
          () => ({ s: `${M(`\\cos\\left(${piTex(u + 24 * c0 + 12, 12)}\\right)=-\\cos\\left(${piTex(u, 12)}\\right)`)}.`, v: true, j: `${M(piTex(u + 24 * c0 + 12, 12))} diffère de ${M(piTex(u, 12))} de ${M(`${c0}\\times 2\\pi+\\pi`)} : on change de signe pour le cosinus.`, c: () => near(Math.cos(((u + 24 * c0 + 12) * Math.PI) / 12), -Math.cos((u * Math.PI) / 12), 1e-9) }),
          () => ({ s: `Si ${M('\\sin x=\\sin y')} et ${M('\\cos x=\\cos y')}, alors ${M('x-y')} est un multiple de ${M('2\\pi')}. (Ici ${M(`x=${piTex(u, 12)}`)} et ${M(`y=${piTex(u + 24 * c0, 12)}`)}.)`, v: true, j: `Les deux réels correspondent au même point du cercle trigonométrique : ${M(`y-x=${c0}\\times 2\\pi`)}.`, c: () => near(Math.cos((u * Math.PI) / 12), Math.cos(((u + 24 * c0) * Math.PI) / 12), 1e-9) }),
        ],
      };
      return tf(r.pick(fam[level])());
    } },

  { id: 'p-trig-error', cls: C, chapter: 'premiere-10', domain: 'geometrie', skill: 'Trouver l’erreur en trigonométrie', fast: false,
    make(r, level) {
      if (level === 1) {
        const n = r.pick([3, 4, 6]);
        let m, kind, rem; do { m = r.int(2 * n + 1, 12 * n); rem = m % (2 * n); kind = r.pick(['half', 'noshift', 'pi']); } while (rem === 0 || (kind !== 'half' && rem <= n) || (kind === 'half' && ((m - rem) / (2 * n)) % 2 === 0));
        const q = (m - rem) / (2 * n), pr = rem > n ? rem - 2 * n : rem, good = [`${piTex(m, n)}=${piTex(rem, n)}+${q}\\times 2\\pi`, `x\\equiv ${piTex(rem, n)}\\ [2\\pi]`, `\\text{mesure principale : }${piTex(pr, n)}`];
        let lines = good, bad, why, fix, shown = pr;
        const prin = (v) => { let w = ((v % (2 * n)) + 2 * n) % (2 * n); if (w > n) w -= 2 * n; return w; };
        if (kind === 'half') { const rw = rem + n * q; lines = [`${piTex(m, n)}=${piTex(rw, n)}+${q}\\times \\pi`, `x\\equiv ${piTex(rw, n)}\\ [2\\pi]`, `\\text{mesure principale : }${piTex(prin(rw), n)}`]; bad = 1; why = `${M(`${q}\\pi`)} n’est pas un multiple de ${M('2\\pi')} (${M(q)} est impair) : on ne peut le supprimer modulo ${M('2\\pi')}.`; fix = M(good[0] + `,\\ ` + good[1]); shown = prin(rw); }
        else if (kind === 'noshift') { lines = [good[0], good[1], `\\text{mesure principale : }${piTex(rem, n)}`]; bad = 2; why = `${M(piTex(rem, n))} n’est pas dans ${M(']-\\pi\\,;\\,\\pi]')} car il dépasse ${M('\\pi')} : on retranche encore ${M('2\\pi')}.`; fix = M(good[2]); shown = rem; }
        else { lines = [good[0], good[1], `\\text{mesure principale : }${piTex(rem - n, n)}`]; bad = 2; why = `il faut retrancher ${M('2\\pi')} (un tour), pas ${M('\\pi')}.`; fix = M(good[2]); shown = rem - n; }
        return spot(`Pour trouver la mesure principale (dans ${M(']-\\pi\\,;\\,\\pi]')}) de ${M(`x=${piTex(m, n)}`)}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(`${piTex(pr, n)}`), () => { const mod = (v) => ((((v + n) % (2 * n)) + 2 * n) % (2 * n)) - n; const principal = (v) => { let w = ((v % (2 * n)) + 2 * n) % (2 * n); if (w > n) w -= 2 * n; return w; }; return principal(m) === pr && !(principal(m) === shown && Math.abs(shown) <= n) ? true : principal(m) === pr && (shown !== pr); });
      }
      if (level === 2) {
        const t = r.pick([[2, 'six'], [3, 'quatre'], [4, 'trois']]), tw = t[0] * 2 / 2, ang = [[1, 6], [1, 4], [1, 3]][r.int(0, 2)], fn = r.pick(['sin', 'cos']), kind = r.pick(['assoc', 'ref']);
        const tw2 = (ang[1] === 6 ? 2 : ang[1] === 4 ? 3 : 4), ex = exactCosSin(tw2), refV = fn === 'sin' ? ex.sin : ex.cos, refN = fn === 'sin' ? ex.sinN : ex.cosN, otherV = fn === 'sin' ? ex.cos : ex.sin;
        const u = 12 + tw2, trueV = `-${refV}`, trueN = -refN, theta = piTex(u, 12);
        const jj = r.int(0, 12), theta0 = piTex(u + 24 * jj, 12), good = [`${theta0}=\\pi+${piTex(tw2, 12)}${jj === 0 ? '' : `+${jj}\\times 2\\pi`}`, `\\${fn}(\\pi+t)=-\\${fn} t`, `\\${fn}\\left(${theta0}\\right)=-\\${fn}\\left(${piTex(tw2, 12)}\\right)=${trueV}`];
        let lines, bad, why, fix, shownN;
        if (kind === 'assoc') { lines = [good[0], `\\${fn}(\\pi+t)=\\${fn} t`, `\\${fn}\\left(${theta0}\\right)=\\${fn}\\left(${piTex(tw2, 12)}\\right)=${refV}`]; bad = 1; why = `ajouter ${M('\\pi')} fait faire un demi-tour : le point du cercle est symétrique par rapport à l’origine, cosinus et sinus changent de signe.`; fix = M(good[1]); shownN = refN; }
        else { lines = [good[0], good[1], `\\${fn}\\left(${theta0}\\right)=-\\${fn}\\left(${piTex(tw2, 12)}\\right)=-${otherV}`.replace('--', '')]; bad = 2; why = `${M(`\\${fn}\\left(${piTex(tw2, 12)}\\right)=${refV}`)}, pas ${M(otherV)} : on a échangé cosinus et sinus.`; fix = M(good[2]); shownN = otherV === refV ? refN : -(fn === 'sin' ? ex.cosN : ex.sinN); }
        if (otherV === refV || (otherV.startsWith('-') ? otherV.slice(1) : otherV) === refV) return this.make(r, level);
        return spot(`Pour calculer ${M(`\\${fn}\\left(${theta0}\\right)`)}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(`\\${fn}\\left(${theta0}\\right)=${trueV}`), () => near(fn === 'sin' ? Math.sin(((u + 24 * jj) * Math.PI) / 12) : Math.cos(((u + 24 * jj) * Math.PI) / 12), trueN, 1e-9) && !near(shownN, trueN, 1e-9));
      }
      const c = r.pick([[F(1, 2), 4], [F(-1, 2), 8]]), pp = r.pick([2, 4, 6, 8, 10, 12, 14, 16, 18]), pq = (pp * c[0].n) / c[0].d, kind = r.pick(['one', 'sin', 'ref']);
      const cv = val(c[0]), a1 = Math.round((Math.acos(cv) * 12) / Math.PI), a2 = 24 - a1;
      const good = [`\\cos x=\\dfrac{${pq}}{${pp}}=${fracTex(c[0])}=\\cos\\left(${piTex(a1, 12)}\\right)`, `x=${piTex(a1, 12)}+2k\\pi\\ \\text{ ou }\\ x=-${piTex(a1, 12)}+2k\\pi`, `S=\\left\\{${piTex(a1, 12)}\\,;\\,${piTex(a2, 12)}\\right\\}`];
      let lines = good, bad, why, fix, shown = [a1, a2];
      if (kind === 'one') { lines = [good[0], `x=${piTex(a1, 12)}+2k\\pi`, `S=\\left\\{${piTex(a1, 12)}\\right\\}`]; bad = 1; why = `${M('\\cos a=\\cos b')} équivaut à ${M('a=b+2k\\pi')} OU ${M('a=-b+2k\\pi')} : il y a deux familles.`; fix = M(good[1]); shown = [a1]; }
      else if (kind === 'sin') { lines = [good[0], good[1], `S=\\left\\{${piTex(a1, 12)}\\,;\\,${piTex(12 - a1, 12)}\\right\\}`]; bad = 2; why = `${M('-x+2\\pi')} avec ${M(`x=${piTex(a1, 12)}`)} donne ${M(piTex(a2, 12))} ; ${M('\\pi-a')} est la solution de l’équation en sinus.`; fix = M(good[2]); shown = [a1, 12 - a1]; }
      else { const wrongA = 12 - a1; lines = [`\\cos x=\\dfrac{${pq}}{${pp}}=${fracTex(c[0])}=\\cos\\left(${piTex(wrongA, 12)}\\right)`, `x=${piTex(wrongA, 12)}+2k\\pi\\ \\text{ ou }\\ x=-${piTex(wrongA, 12)}+2k\\pi`, `S=\\left\\{${piTex(wrongA, 12)}\\,;\\,${piTex(24 - wrongA, 12)}\\right\\}`]; bad = 0; why = `${M(`\\cos\\left(${piTex(wrongA, 12)}\\right)=${fracTex(F(-1, 1).n === 1 ? c[0] : mul(F(-1), c[0]))}`)} : l’angle de référence est ${M(piTex(a1, 12))}.`; fix = M(good[0]); shown = [wrongA, 24 - wrongA]; }
      return spot(`Pour résoudre ${M(`${pp}\\cos x=${pq}`)} dans ${M('[0\\,;\\,2\\pi]')}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(good[2]), () => { const sol = []; for (let t = 0; t <= 24; t++) if (Math.abs(Math.cos((t * Math.PI) / 12) - cv) < 1e-9) sol.push(t); return sol.join() === [a1, a2].sort((x, y) => x - y).join() && shown.join() !== sol.join(); });
    } },

  { id: 'p-trig-eq', cls: C, chapter: 'premiere-10', domain: 'geometrie', skill: 'Équations trigonométriques', fast: false,
    make(r, level) {
      const pool = [['0', 0, 6], ['\\dfrac{1}{2}', 0.5, 0], ['-\\dfrac{1}{2}', -0.5, 0], ['\\dfrac{\\sqrt{2}}{2}', Math.SQRT1_2, 0], ['-\\dfrac{\\sqrt{2}}{2}', -Math.SQRT1_2, 0], ['\\dfrac{\\sqrt{3}}{2}', Math.sqrt(3) / 2, 0], ['-\\dfrac{\\sqrt{3}}{2}', -Math.sqrt(3) / 2, 0], ['1', 1, 0], ['-1', -1, 0]];
      const solve = (fn, v, lo, hi) => { const s = []; for (let t = lo; t <= hi; t++) if (Math.abs(fn((t * Math.PI) / 12) - v) < 1e-9) s.push(t); return s; };
      const setTex = (s) => (s.length ? `\\left\\{${s.map((t) => piTex(t, 12)).join('\\,;\\,')}\\right\\}` : '\\varnothing');
      if (level <= 2) {
        const fn = r.pick(['cos', 'sin']), [vt, vn] = r.pick(pool), f = fn === 'cos' ? Math.cos : Math.sin;
        const [lo, hi, dom] = level === 1 ? r.pick([[0, 24, '[0\\,;\\,2\\pi]'], [0, 12, '[0\\,;\\,\\pi]'], [12, 24, '[\\pi\\,;\\,2\\pi]']]) : r.pick([[-11, 12, ']-\\pi\\,;\\,\\pi]'], [-12, 12, '[-\\pi\\,;\\,\\pi]'], [-24, 0, '[-2\\pi\\,;\\,0]'], [0, 36, '[0\\,;\\,3\\pi]']]);
        const sol = solve(f, vn, lo, hi), ang = (Math.round((Math.acos(vn) * 12) / Math.PI));
        return { q: `Résoudre dans ${M(dom)} l’équation ${M(`\\${fn} x=${vt}`)}.`, a: `${M(`S=${setTex(sol)}`)}${level === 2 ? `. (${fn === 'cos' ? M('\\cos x=\\cos a\\iff x=a+2k\\pi\\text{ ou }x=-a+2k\\pi') : M('\\sin x=\\sin a\\iff x=a+2k\\pi\\text{ ou }x=\\pi-a+2k\\pi')}, puis on garde les solutions de ${M(dom)}.)` : '.'}`, ok: () => sol.every((t) => near(f((t * Math.PI) / 12), vn, 1e-9)) && ang >= 0 };
      }
      const CV = [[-0.5, '-\\dfrac{1}{2}', 8], [0.5, '\\dfrac{1}{2}', 4], [0, '0', 6], [1, '1', 0], [-1, '-1', 12]], [c1, c2] = r.shuffle(CV).slice(0, 2);
      const num = (v) => (v === 0.5 ? [2, -1] : v === -0.5 ? [2, 1] : v === 1 ? [1, -1] : v === -1 ? [1, 1] : [1, 0]);
      const [p1, q1] = num(c1[0]), [p2, q2] = num(c2[0]), A = p1 * p2, Bq = p1 * q2 + p2 * q1, Cq = q1 * q2;
      const [lo3, hi3, dom3] = r.pick([[0, 24, '[0\\,;\\,2\\pi]'], [-11, 12, ']-\\pi\\,;\\,\\pi]'], [0, 12, '[0\\,;\\,\\pi]'], [-12, 12, '[-\\pi\\,;\\,\\pi]']]), sol = [...new Set([...solve(Math.cos, c1[0], lo3, hi3), ...solve(Math.cos, c2[0], lo3, hi3)])].sort((x, y) => x - y);
      const fac = (p, qq) => `${p === 1 ? '' : p}X${qq === 0 ? '' : sgn(qq)}`;
      return { q: `Résoudre dans ${M(dom3)} l’équation ${M(`${polyTex([A, Bq, Cq], '\\cos x').replace(/\\cos x\^\{2\}/, '\\cos^{2}x')}=0`)}. (On pourra poser ${M('X=\\cos x')}.)`, a: `Avec ${M('X=\\cos x')} : ${M(`${polyTex([A, Bq, Cq], 'X')}=(${fac(p1, q1)})(${fac(p2, q2)})`)}, donc ${M(`\\cos x=${c1[1]}`)} ou ${M(`\\cos x=${c2[1]}`)}. ${M(`S=${setTex(sol)}`)}.`, ok: () => { const f = (x) => A * Math.cos(x) ** 2 + Bq * Math.cos(x) + Cq; const brute = []; for (let t = lo3; t <= hi3; t++) if (Math.abs(f((t * Math.PI) / 12)) < 1e-9) brute.push(t); return brute.join() === sol.join() && A * 1 + Bq + Cq !== undefined; } };
    } },

  { id: 'p-trig-principal', cls: C, chapter: 'premiere-10', domain: 'geometrie', skill: 'Mesure principale et lecture sur le cercle', fast: false,
    make(r, level) {
      const prin = (u) => { let w = ((u % 24) + 24) % 24; return w > 12 ? w - 24 : w; };
      if (level === 1) {
        const n = r.pick([2, 3, 4, 6]), m = r.int(7, 60) * r.sign(), u = m * (12 / n), p = prin(u);
        if (m % (2 * n) === 0) return this.make(r, level);
        return { q: `Donner la mesure principale (dans ${M(']-\\pi\\,;\\,\\pi]')}) de l’angle ${M(piTex(m, n))}.`, a: `${M(`${piTex(m, n)}=${piTex(m - 2 * n * Math.round(m / (2 * n)), n)}${Math.round(m / (2 * n)) === 0 ? '' : `+${Math.round(m / (2 * n))}\\times 2\\pi`}`.replace('+-', '-'))} puis on ramène dans ${M(']-\\pi\\,;\\,\\pi]')} : ${M(piTex((p * n) / 12, n))}.`.replace(/^\\\(.*?\\\) puis/, (x0) => x0), ok: () => { const w = ((((u % 24) + 24) % 24) + 0); const pp = prin(u); return pp > -12 && pp <= 12 && ((u - pp) % 24 === 0) && pp === p; } };
      }
      if (level === 2) {
        const n = r.pick([2, 3, 4, 6]), m = r.int(7, 90) * r.sign(), u = m * (12 / n), p = prin(u), ex1 = exactCosSin(u);
        if (m % (2 * n) === 0) return this.make(r, level);
        return { q: `Soit ${M('M')} le point du cercle trigonométrique associé au réel ${M(piTex(m, n))}. Déterminer la mesure principale de cet angle, puis les coordonnées exactes de ${M('M')}.`, a: `${M(`${piTex(m, n)}\\equiv ${piTex((p * n) / 12, n)}\\ [2\\pi]`)} : mesure principale ${M(piTex((p * n) / 12, n))}. Donc ${M(`M\\left(${ex1.cos}\\,;\\,${ex1.sin}\\right)`)}.`, ok: () => near(Math.cos((u * Math.PI) / 12), ex1.cosN, 1e-9) && near(Math.sin((u * Math.PI) / 12), ex1.sinN, 1e-9) && p > -12 && p <= 12 && (u - p) % 24 === 0 };
      }
      let x1 = 0, x2 = 0; while (x1 === 0 || x2 === 0 || prin(x1 + x2) === 0) { x1 = r.int(-11, 12); x2 = r.int(-11, 12); }
      const uv = x1, vw = x2, uw = uv + vw, vu = -uv, mu_w = uw + 12;
      return { q: `${M('\\vec{u}')}, ${M('\\vec{v}')} et ${M('\\vec{w}')} sont des vecteurs unitaires du plan orienté tels que ${M(`(\\vec{u},\\vec{v})=${piTex(uv, 12)}\\ [2\\pi]`)} et ${M(`(\\vec{v},\\vec{w})=${piTex(vw, 12)}\\ [2\\pi]`)}. Donner la mesure principale de ${M('(\\vec{u},\\vec{w})')}, de ${M('(\\vec{v},\\vec{u})')} et de ${M('(-\\vec{u},\\vec{w})')}.`, a: `Relation de Chasles : ${M(`(\\vec{u},\\vec{w})=${piTex(uv, 12)}${vw < 0 ? '' : '+'}${piTex(vw, 12)}=${piTex(uw, 12)}${prin(uw) === uw ? '' : `\\equiv ${piTex(prin(uw), 12)}`}`)}. ${M(`(\\vec{v},\\vec{u})=-(\\vec{u},\\vec{v})=${piTex(prin(vu), 12)}`)}. ${M(`(-\\vec{u},\\vec{w})=(\\vec{u},\\vec{w})+\\pi\\equiv ${piTex(prin(mu_w), 12)}`)}.`.replace('+\\dfrac', '+\\dfrac'), ok: () => { const U = 0, V = (uv * Math.PI) / 12, W = V + (vw * Math.PI) / 12, same = (d, k) => near(Math.cos(d), Math.cos((k * Math.PI) / 12), 1e-9) && near(Math.sin(d), Math.sin((k * Math.PI) / 12), 1e-9), inRange = (k) => k > -12 && k <= 12; return same(W - U, prin(uw)) && same(U - V, prin(vu)) && same(W - (U + Math.PI), prin(mu_w)) && [prin(uw), prin(vu), prin(mu_w)].every(inRange); } };
    } },

  { id: 'p-trig-arc', cls: C, chapter: 'premiere-10', domain: 'geometrie', skill: 'Longueur d’arc, aire de secteur, vitesse angulaire', fast: false,
    make(r, level) {
      const rad = r.int(2, 30);
      if (level === 1) {
        const num = r.pick([1, 2, 3, 5]), den = r.pick([2, 3, 4, 6]), th = F(num, den), deg = (num * 180) / den;
        if (!Number.isInteger(deg) || (num >= den && den !== 2 && num / den > 2)) return this.make(r, level);
        const ell = mul(th, F(rad)), area = mul(th, F(rad * rad, 2));
        return { q: `Un secteur circulaire a pour rayon ${M(`${rad}\\ \\text{cm}`)} et pour angle au centre ${M(`${piTex(num, den)}`)} radians (soit ${M(`${deg}^{\\circ}`)}). Calculer la longueur de son arc et son aire, en valeur exacte.`, a: `${M(`\\ell=r\\theta=${rad}\\times ${piTex(num, den)}=${piTex(ell.n, ell.d)}\\ \\text{cm}`)}. ${M(`\\mathcal{A}=\\dfrac{1}{2}r^{2}\\theta=\\dfrac{1}{2}\\times ${rad * rad}\\times ${piTex(num, den)}=${piTex(area.n, area.d)}\\ \\text{cm}^{2}`)}.`, ok: () => near(val(ell) * Math.PI, rad * ((num / den) * Math.PI), 1e-9) && near(val(area) * Math.PI, 0.5 * rad * rad * (num / den) * Math.PI, 1e-9) };
      }
      if (level === 2) {
        const h = r.int(1, 12), m = r.int(0, 59), hh = (h % 12) * 30 + m * 0.5, mm = m * 6, ang = Math.abs(hh - mm), gap = ang > 180 ? 360 - ang : ang;
        const f = F(Math.round(gap * 2), 360), cl = r.int(5, 20);
        return { q: `Sur une horloge, il est ${M(`${h}\\ \\text{h}\\ ${m < 10 ? '0' + m : m}`)}. Calculer, en degrés puis en radians, l’angle géométrique (compris entre ${M('0')} et ${M('\\pi')}) entre la petite aiguille et la grande aiguille. (Le cadran compte ${M(12)} heures, la petite aiguille avance de façon continue.)`, a: `Petite aiguille : ${M(`${h % 12}\\times 30+${m}\\times 0{,}5=${hh}^{\\circ}`.replace('0{,}5=', '0{,}5=').replace(/=(\d+)\.5\^/, '=$1{,}5^'))} depuis midi ; grande aiguille : ${M(`${m}\\times 6=${mm}^{\\circ}`)}. Écart : ${M(`${gap}^{\\circ}`.replace(/(\d)\.5/, '$1{,}5'))}, soit ${M(`${gap}^{\\circ}=${piTex(Math.round(gap * 2), 360)}\\ \\text{rad}`)}.`, ok: () => { const small = (((h % 12) * 60 + m) / 720) * 360, big = (m / 60) * 360; let d = Math.abs(small - big); if (d > 180) d = 360 - d; return near(d, gap, 1e-9) && cl > 0 && near((f.n / f.d) * Math.PI, (gap * Math.PI) / 180, 1e-9); } };
      }
      const nTours = r.pick([30, 45, 60, 90, 120, 150]), R2 = r.pick([20, 25, 30, 35, 40, 45, 50]), tMin = r.pick([2, 3, 5, 10, 15]);
      const w = nTours * 2 / 60, vcm = (nTours * 2 * Math.PI * R2) / 60, dist = 2 * R2 * nTours * tMin;
      return { q: `Une roue de rayon ${M(`${R2}\\ \\text{cm}`)} tourne à ${M(`${nTours}`)} tours par minute. 1) Quelle est sa vitesse angulaire en radians par seconde (valeur exacte) ? 2) Quelle distance un point de la jante parcourt-il en ${M(`${tMin}`)} minutes (en mètres, valeur exacte puis arrondie au dixième) ?`,
        a: `1) Un tour fait ${M('2\\pi')} rad : ${M(`\\omega=\\dfrac{${nTours}\\times 2\\pi}{60}=${piTex(nTours * 2, 60)}\\ \\text{rad/s}`)}. 2) En ${M(tMin)} minutes : ${M(`${nTours * tMin}`)} tours, soit ${M(`${nTours * tMin}\\times 2\\pi\\times ${R2}=${2 * R2 * nTours * tMin}\\pi\\ \\text{cm}`)} ${M(`=${numTex(F(dist, 100))}\\pi\\ \\text{m}\\approx ${roundTex((dist * Math.PI) / 100, 1)}\\ \\text{m}`)}.`,
        ok: () => near(w, (nTours * 2) / 60, 1e-12) && near((dist * Math.PI) / 100, 2 * Math.PI * (R2 / 100) * nTours * tMin, 1e-9) && vcm > 0 && Math.abs(((dist * Math.PI) / 100) * 10 - Math.round(((dist * Math.PI) / 100) * 10) - 0.5) > 0.0001 };
    } },
];

// The trigonometry generators have a small parameter space; the name of the variable (x, t, theta, alpha) is drawn too, so that a
// series does not repeat the same statement in another dress. Only a lone `x` inside the maths is renamed.
const NAMES = ['x', 't', '\\theta', '\\alpha'];
const rename = (s, v) => (v === 'x' ? s : String(s).replace(/\\\((.+?)\\\)/gs, (m0, inner) => `\\(${inner.replace(/(?<![A-Za-z\\])x(?![A-Za-z])/g, () => v)}\\)`));
for (const t of premiere4) {
  if (!['p-trig-eq', 'p-trig-error', 'p-trig-tf', 'p-trig-qcm', 'p-trig-assoc'].includes(t.id)) continue;
  const make = t.make;
  t.make = function (r, level) { const v = r.pick(NAMES), out = make.call(this, r, level); return { ...out, q: rename(out.q, v), a: rename(out.a, v), s: out.s ? rename(out.s, v) : out.s }; };
}
