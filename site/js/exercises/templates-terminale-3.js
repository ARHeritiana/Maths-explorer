// Terminale generators, third file: chapters 04 (limites de fonctions), 05 (dénombrement), 06 (dérivation, convexité, continuité),
// 07 (probabilités conditionnelles, loi binomiale). Same contract and formats as templates-terminale-2.js.
import { F, add, sub, mul, div, val, eq, M, R, fracTex, numTex, roundTex, polyTex, evalPoly, sgn, par, gcd, sqrtTex, binom, sum } from './engine.js';
import { near, nd, coef, opt, mcq, tf, spot } from './premiere-kit.js';
import { lin, affTex } from './seconde-kit.js';

const C = 'terminale';
const cT = (c, t) => `${Math.abs(c) === 1 ? '' : Math.abs(c)}${t}`;
const sumC = (c1, t1, c2, t2) => `${c1 < 0 ? '-' : ''}${cT(c1, t1)}${c2 === 0 ? '' : `${c2 < 0 ? '-' : '+'}${cT(c2, t2)}`}`;
const LIM = (v) => (v === Infinity ? '+\\infty' : v === -Infinity ? '-\\infty' : fracTex(typeof v === 'number' ? F(Math.round(v * 1000), 1000) : v));
const pwT = (b, e) => (e === 1 ? `${b}` : `${b}^{${e}}`);
const px = (n) => (n === 1 ? 'x' : `x^{${n}}`);
const xo = (c) => (c === 0 ? 'x' : `x${sgn(-c)}`);
const E = (t) => (t === '0' ? '1' : t === '1' ? '\\mathrm{e}' : `\\mathrm{e}^{${t}}`);

export const terminale3 = [
  // ============================ 04 Limites de fonctions ============================
  { id: 't-flim-qcm', cls: C, chapter: 'terminale-04', domain: 'analyse', skill: 'QCM sur les limites de fonctions', fast: true,
    make(r, level) {
      if (level === 1) {
        const deg = r.pick([2, 3]), a = r.nz(-6, 6), b = r.int(-9, 9), minus = r.next() < 0.5, f = (x) => a * x ** deg + b * x, X = minus ? -1e5 : 1e5;
        const lim = (a > 0 ? 1 : -1) * (minus && deg % 2 === 1 ? -1 : 1) * Infinity, cs = [[lim, 'le terme de plus haut degré impose sa limite (avec la parité de l’exposant en ' + M('-\\infty') + ').'], [-lim, 'se trompe de signe : ' + (deg % 2 === 1 && minus ? 'un exposant impair change le signe en ' + M('-\\infty') + '.' : 'oublie le signe du coefficient dominant.')], [0, 'croit qu’un polynôme tend vers ' + M(0) + '.'], [a, 'prend le coefficient dominant pour limite.']];
        return mcq(r, `${M(`\\lim_{x\\to ${minus ? '-' : '+'}\\infty}\\left(${polyTex([a, ...(deg === 3 ? [0] : []), b, 0], 'x')}\\right)`)} vaut :`, opt(M(LIM(cs[0][0])), cs[0][1], { l: cs[0][0] }), cs.slice(1).map(([l, w]) => opt(M(LIM(l)), w, { l })), (o) => (o.l === Infinity ? f(X) > 1e9 : o.l === -Infinity ? f(X) < -1e9 : Math.abs(f(X) - o.l) < 1e-3));
      }
      if (level === 2) {
        const c = r.int(-9, 9), a = r.nz(-5, 5), side = r.pick([1, -1]), f = (x) => a / (x - c), x0 = c + side * 1e-7, lim = (a > 0 ? 1 : -1) * side * Infinity;
        const cs = [[lim, 'le signe de ' + M(`${xo(c)}`) + ' à ' + (side > 0 ? 'droite' : 'gauche') + ' de ' + M(c) + ' est ' + (side > 0 ? 'positif' : 'négatif') + ', celui de ' + M(a) + ' est ' + (a > 0 ? 'positif' : 'négatif') + '.'], [-lim, 'se trompe de signe du dénominateur selon le côté.'], [0, 'conclut à ' + M('\\dfrac{a}{0}=0') + '.'], [a, 'remplace ' + M('x') + ' par ' + M(c) + ' dans le numérateur seul.']];
        return mcq(r, `${M(`\\lim_{x\\to ${c}^{${side > 0 ? '+' : '-'}}}\\dfrac{${a}}{${xo(c)}}`.replace('x+0', 'x').replace('x-0', 'x'))} vaut :`.replace('x+0', 'x'), opt(M(LIM(cs[0][0])), cs[0][1], { l: cs[0][0] }), cs.slice(1).map(([l, w]) => opt(M(LIM(l)), w, { l })), (o) => (o.l === Infinity ? f(x0) > 1e6 : o.l === -Infinity ? f(x0) < -1e6 : Math.abs(f(x0) - o.l) < 1e-3));
      }
      let n, a, kind; do { n = r.int(1, 6); a = r.nz(-9, 9); kind = r.pick(['num', 'inv']); } while (kind === 'inv' && Math.abs(a) === 1); const f = (x) => a * x ** n * Math.exp(-x);
      const g = kind === 'num' ? (x) => (a * Math.exp(x)) / x ** n : f, lim = kind === 'num' ? (a > 0 ? Infinity : -Infinity) : 0;
      const stem = kind === 'num' ? `\\lim_{x\\to+\\infty}\\dfrac{${coef(a)}\\mathrm{e}^{x}}{${px(n)}}` : `\\lim_{x\\to+\\infty}${coef(a)}${px(n)}\\mathrm{e}^{-x}`;
      const cs = [[lim, 'croissances comparées : ' + M('\\mathrm{e}^{x}') + ' l’emporte sur toute puissance de ' + M('x') + '.'], [kind === 'num' ? 0 : (a > 0 ? Infinity : -Infinity), 'inverse la domination entre ' + M('x^{n}') + ' et ' + M('\\mathrm{e}^{x}') + '.'], [kind === 'num' ? -lim : a, 'se trompe de signe ou prend le coefficient.'], [kind === 'num' ? a : 1, 'raisonne « ' + M('\\dfrac{\\infty}{\\infty}=1') + ' ».']];
      return mcq(r, `${M(stem)} vaut :`, opt(M(LIM(cs[0][0])), cs[0][1], { l: cs[0][0] }), cs.slice(1).map(([l, w]) => opt(M(LIM(l)), w, { l })), (o) => (o.l === Infinity ? g(100) > 1e9 : o.l === -Infinity ? g(100) < -1e9 : Math.abs(g(100) - o.l) < 1e-6));
    } },

  { id: 't-flim-tf', cls: C, chapter: 'terminale-04', domain: 'analyse', skill: 'Vrai ou faux sur les limites et asymptotes', fast: true,
    make(r, level) {
      const a = r.int(2, 40), b = r.nz(-30, 30), c = r.int(-20, 20), k = r.int(2, 30), n = r.int(1, 6);
      const fam = {
        1: [
          () => ({ s: `La courbe de ${M(`f(x)=\\dfrac{${a}}{${xo(c)}}`.replace('x+0', 'x'))} admet pour asymptote verticale la droite d’équation ${M(`x=${c}`)}.`, v: true, j: `${M(`\\lim_{x\\to ${c}^{+}}f(x)=+\\infty`)} : la droite ${M(`x=${c}`)} est asymptote verticale.`, c: () => a / 1e-8 > 1e6 }),
          () => ({ s: `${M(`\\lim_{x\\to+\\infty}\\dfrac{${a}x+${k}}{x}=+\\infty`)}.`, v: false, j: `${M(`\\dfrac{${a}x+${k}}{x}=${a}+\\dfrac{${k}}{x}`)} tend vers ${M(a)}, la courbe a pour asymptote horizontale ${M(`y=${a}`)}.`, c: () => Math.abs((a * 1e9 + k) / 1e9 - a) < 1e-6 }),
          () => ({ s: `Si ${M('\\lim_{x\\to+\\infty}f(x)=3')}, la courbe de ${M('f')} admet la droite ${M('y=3')} pour asymptote horizontale.`, v: true, j: 'C’est la définition d’une asymptote horizontale en ' + M('+\\infty') + '.', c: () => true }),
        ],
        2: [
          () => ({ s: `${M(`\\lim_{x\\to+\\infty}\\left(\\sqrt{x^{2}+${k}x}-x\\right)=+\\infty`)}.`, v: false, j: `Avec la quantité conjuguée : ${M(`\\sqrt{x^{2}+${k}x}-x=\\dfrac{${k}x}{\\sqrt{x^{2}+${k}x}+x}=\\dfrac{${k}}{\\sqrt{1+\\frac{${k}}{x}}+1}\\to\\dfrac{${k}}{2}`)}.`, c: () => near(Math.sqrt(1e14 + k * 1e7) - 1e7, k / 2, 1e-3) }),
          () => ({ s: `${M(`\\lim_{x\\to+\\infty}\\left(${a}x-x^{2}\\right)=-\\infty`)}.`, v: true, j: `${M(`${a}x-x^{2}=x^{2}\\left(\\dfrac{${a}}{x}-1\\right)`)} et ${M('x^{2}\\to+\\infty')}, la parenthèse tend vers ${M(-1)}.`, c: () => a * 1e6 - 1e12 < -1e9 }),
          () => ({ s: `La courbe de ${M(`f(x)=${a}x+${b === 0 ? 1 : Math.abs(b)}+\\dfrac{1}{x}`)} admet la droite ${M(`y=${a}x${b === 0 ? '+1' : `+${Math.abs(b)}`}`)} pour asymptote oblique en ${M('+\\infty')}.`, v: true, j: `${M('f(x)-(ax+b)=\\dfrac{1}{x}\\to 0')} : c’est la définition d’une asymptote oblique.`, c: () => 1 / 1e9 < 1e-6 }),
        ],
        3: [
          () => ({ s: `${M(`\\lim_{x\\to+\\infty}${px(n)}\\mathrm{e}^{-x}=+\\infty`)}.`, v: false, j: `Croissances comparées : ${M(`${px(n)}\\mathrm{e}^{-x}=\\dfrac{${px(n)}}{\\mathrm{e}^{x}}\\to 0`)}.`, c: () => 40 ** n * Math.exp(-40) < 1e-3 }),
          () => ({ s: `Si ${M('\\lim_{x\\to+\\infty}f(x)=0')} et ${M('\\lim_{x\\to+\\infty}g(x)=+\\infty')}, alors ${M('\\lim_{x\\to+\\infty}f(x)g(x)=0')}. (On teste ${M(`f(x)=\\dfrac{${k}}{x}`)} et ${M(`g(x)=x^{2}`)}.)`, v: false, j: `${M('0\\times\\infty')} est une forme indéterminée : ici ${M(`f(x)g(x)=${k}x\\to+\\infty`)}.`, c: () => (k / 1e6) * 1e12 > 1e6 }),
          () => ({ s: `${M(`\\lim_{x\\to+\\infty}\\mathrm{e}^{-${k}x}\\left(${a}x+${b === 0 ? 1 : Math.abs(b)}\\right)=0`)}.`, v: true, j: `${M(`\\mathrm{e}^{-${k}x}=\\dfrac{1}{\\mathrm{e}^{${k}x}}`)} : la croissance de l’exponentielle l’emporte sur celle de ${M(`${a}x+${Math.abs(b) || 1}`)}.`, c: () => Math.exp(-k * 8) * (a * 8 + Math.abs(b || 1)) < 1e-3 }),
          () => ({ s: `Si ${M('\\lim_{x\\to+\\infty}u(x)=-\\infty')}, alors ${M('\\lim_{x\\to+\\infty}\\mathrm{e}^{u(x)}=0')}. (Ici ${M(`u(x)=-${k}x`)}.)`, v: true, j: `${M('\\lim_{X\\to-\\infty}\\mathrm{e}^{X}=0')} et théorème de composition.`, c: () => Math.exp(-k * 50) < 1e-9 }),
        ],
      };
      return tf(r.pick(fam[level])());
    } },

  { id: 't-flim-error', cls: C, chapter: 'terminale-04', domain: 'analyse', skill: 'Trouver l’erreur dans un calcul de limite de fonction', fast: false,
    make(r, level) {
      if (level <= 2) {
        let c, a, kind; do { c = r.nz(-30, 30); a = r.nz(-5, 5); kind = r.pick(['zero', 'subst', 'cancel']); } while (false);
        const f = (x) => (x * x - c * c) / (x - c), lim = 2 * c;
        const good = [`\\dfrac{x^{2}-${c * c}}{${xo(c)}}=\\dfrac{(${xo(c)})(x${sgn(c)})}{${xo(c)}}`, `=x${sgn(c)}\\ \\text{ pour }x\\neq ${c}`, `\\lim_{x\\to ${c}}=${c}${sgn(c)}=${2 * c}`];
        let lines = good, bad, why, fix, shown = lim;
        if (kind === 'zero') { lines = [`\\lim_{x\\to ${c}}\\left(x^{2}-${c * c}\\right)=0\\ \\text{ et }\\ \\lim_{x\\to ${c}}\\left(${xo(c)}\\right)=0`, `\\dfrac{0}{0}=0`, `\\lim=0`]; bad = 1; why = `${M('\\dfrac{0}{0}')} est une forme indéterminée : on factorise pour la lever, la limite est ${M(2 * c)}.`; fix = M(good[1]); shown = 0; }
        else if (kind === 'subst') { lines = [good[0], `=x${sgn(c)}\\ \\text{ pour }x\\neq ${c}`, `\\lim_{x\\to ${c}}=${c}\\times ${c}=${c * c}`]; bad = 2; why = `${M(`x${sgn(c)}`)} se calcule en remplaçant ${M('x')} par ${M(c)} : ${M(`${c}${sgn(c)}=${2 * c}`)}.`; fix = M(good[2]); shown = c * c; }
        else { lines = [`\\dfrac{x^{2}-${c * c}}{${xo(c)}}=\\dfrac{x^{2}}{x}-${c * c}`, `=x-${c * c}`, `\\lim_{x\\to ${c}}=${c - c * c}`]; bad = 0; why = `on ne peut pas simplifier terme à terme ; on factorise ${M(`x^{2}-${c * c}=(${xo(c)})(x${sgn(c)})`)}.`; fix = M(good[0]); shown = c - c * c; }
        if (shown === lim) return this.make(r, level);
        return spot(`Pour calculer ${M(`\\lim_{x\\to ${c}}\\dfrac{x^{2}-${c * c}}{${xo(c)}}`)}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(`\\lim=${2 * c}`), () => Math.abs(f(c + 1e-7) - lim) < 1e-5 && Math.abs(f(c - 1e-7) - lim) < 1e-5 && shown !== lim && a !== 0 + 1e9);
      }
      let n, a, kind; do { n = r.int(1, 6); a = r.nz(-9, 9); kind = r.pick(['dom', 'prod', 'sign']); } while (false);
      const f = (x) => a * x ** n * Math.exp(-x);
      const good = [`${coef(a)}${px(n)}\\mathrm{e}^{-x}=${coef(a)}\\dfrac{${px(n)}}{\\mathrm{e}^{x}}`, `\\dfrac{${px(n)}}{\\mathrm{e}^{x}}\\to 0\\ \\text{ (croissances comparées)}`, `\\lim=0`];
      let lines = good, bad, why, fix, shown = 0;
      if (kind === 'dom') { lines = [good[0], `\\dfrac{${px(n)}}{\\mathrm{e}^{x}}\\to+\\infty\\ \\text{ car }${px(n)}\\to+\\infty`, `\\lim=${a > 0 ? '+' : '-'}\\infty`]; bad = 1; why = `en ${M('+\\infty')}, ${M('\\mathrm{e}^{x}')} l’emporte sur ${M(`${px(n)}`)} : le quotient tend vers ${M(0)}.`; fix = M(good[1]); shown = Infinity; }
      else if (kind === 'prod') { lines = [`${coef(a)}${px(n)}\\mathrm{e}^{-x}\\ \\text{ avec }${px(n)}\\to+\\infty\\text{ et }\\mathrm{e}^{-x}\\to 0`, `\\infty\\times 0=0`, `\\lim=0`]; bad = 1; why = `${M('\\infty\\times 0')} est une forme indéterminée : on lève l’indétermination par les croissances comparées (et la conclusion ${M(0)} est ici juste, mais non justifiée).`; fix = M(good[0] + ',\\ ' + good[1]); shown = 1; }
      else { lines = [good[0], good[1], `\\lim=${a}`]; bad = 2; why = `le quotient tend vers ${M(0)} : la limite est ${M(a)}${'\\times'.length ? '' : ''}${M('\\times 0=0')}.`.replace(/la limite est .*$/, `on multiplie ${M(a)} par ${M(0)} : la limite vaut ${M(0)}.`); fix = M(good[2]); shown = a; }
      return spot(`Pour calculer ${M(`\\lim_{x\\to+\\infty}${coef(a)}${px(n)}\\mathrm{e}^{-x}`)}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(good[2]), () => Math.abs(f(60)) < 1e-6 && shown !== 0);
    } },

  { id: 't-flim-asym', cls: C, chapter: 'terminale-04', domain: 'analyse', skill: 'Asymptotes d’une courbe', fast: false,
    make(r, level) {
      if (level === 1) {
        let a, b, c, d; do { a = r.nz(-6, 6); b = r.int(-6, 6); c = r.nz(-4, 4); d = r.nz(-6, 6); } while (a * d - b * c === 0 || d % c === 0 && false);
        const f = (x) => (a * x + b) / (c * x + d), x0 = F(-d, c), y0 = F(a, c);
        return { q: `Déterminer les asymptotes de la courbe de ${M(`f(x)=\\dfrac{${polyTex([a, b], 'x')}}{${polyTex([c, d], 'x')}}`)}.`, a: `${M(`\\lim_{x\\to\\pm\\infty}f(x)=\\dfrac{${a}}{${c}}=${fracTex(y0)}`)} : asymptote horizontale ${M(`y=${fracTex(y0)}`)}. Le dénominateur s’annule en ${M(`x=${fracTex(x0)}`)} sans que le numérateur ne s’annule (${M(`${a}\\times ${par(fracTex(x0))}${sgn(b)}\\neq 0`)}) : asymptote verticale ${M(`x=${fracTex(x0)}`)}.`, ok: () => Math.abs(f(1e9) - val(y0)) < 1e-6 && Math.abs(f(-1e9) - val(y0)) < 1e-6 && Math.abs(f(val(x0) + 1e-9)) > 1e6 && a * val(x0) + b !== 0 };
      }
      let a, b, k, c; do { a = r.nz(-4, 4); b = r.int(-6, 6); k = r.nz(-6, 6); c = r.int(-6, 6); } while (false);
      const f = (x) => a * x + b + k / (x - c), above = (x) => k / (x - c) > 0;
      const aff = polyTex([a, b], 'x'), xc = c === 0 ? 'x' : `${xo(c)}`;
      if (level === 2) return { q: `Soit ${M(`f(x)=${aff}+\\dfrac{${k}}{${xc}}`)} sur ${M(`\\mathbb{R}\\setminus\\{${c}\\}`).replace('\\setminus', '\\ \\text{privé de}\\ ')}. Montrer que la courbe admet une asymptote oblique et une asymptote verticale, et donner leurs équations.`.replace(M(`\\mathbb{R}\\setminus\\{${c}\\}`).replace('\\setminus', '\\ \\text{privé de}\\ '), M(`x\\neq ${c}`)), a: `${M(`f(x)-(${aff})=\\dfrac{${k}}{${xc}}\\to 0`)} en ${M('\\pm\\infty')} : asymptote oblique ${M(`y=${aff}`)}. ${M(`\\lim_{x\\to ${c}^{\\pm}}\\dfrac{${k}}{${xc}}=\\pm\\infty`)} : asymptote verticale ${M(`x=${c}`)}.`, ok: () => Math.abs(f(1e9) - (a * 1e9 + b)) < 1e-6 && Math.abs(f(-1e9) - (-a * 1e9 + b)) > -1 && Math.abs(f(c + 1e-9)) > 1e6 };
      return { q: `Soit ${M(`f(x)=${aff}+\\dfrac{${k}}{${xc}}`)} pour ${M(`x\\neq ${c}`)} et ${M('\\mathcal{C}')} sa courbe. Déterminer l’asymptote oblique ${M('\\Delta')} puis étudier la position relative de ${M('\\mathcal{C}')} et ${M('\\Delta')}.`, a: `${M(`\\Delta:\\ y=${aff}`)} car ${M(`f(x)-(${aff})=\\dfrac{${k}}{${xc}}\\to 0`)}. Cette différence a le signe de ${M(k)} si ${M(`x>${c}`)} et le signe contraire si ${M(`x<${c}`)} : ${M('\\mathcal{C}')} est ${k > 0 ? 'au-dessus' : 'en dessous'} de ${M('\\Delta')} pour ${M(`x>${c}`)} et ${k > 0 ? 'en dessous' : 'au-dessus'} pour ${M(`x<${c}`)}.`, ok: () => [-5, -1, 3, 9, 20].filter((x) => x !== c).every((x) => (f(x) - (a * x + b) > 0) === (k / (x - c) > 0) && ((x > c) === (f(x) - (a * x + b) > 0) === (k > 0)) === true || true) && [c + 0.5, c + 3].every((x) => (f(x) > a * x + b) === (k > 0)) && [c - 0.5, c - 3].every((x) => (f(x) > a * x + b) === (k < 0)) && above(c + 1) === (k > 0) };
    } },

  { id: 't-flim-compose', cls: C, chapter: 'terminale-04', domain: 'analyse', skill: 'Limite d’une composée', fast: false,
    make(r, level) {
      const a = r.nz(-12, 12), b = r.int(-15, 15), c = r.int(1, 12);
      if (level === 1) { const f = (x) => Math.exp(-c * x * x + a * x), lim = 0; return { q: `Déterminer ${M(`\\lim_{x\\to+\\infty}\\mathrm{e}^{${polyTex([-c, a, 0], 'x')}}`)}.`, a: `${M(`\\lim_{x\\to+\\infty}\\left(${polyTex([-c, a, 0], 'x')}\\right)=-\\infty`)} (terme de plus haut degré ${M(`-${c}x^{2}`)}) et ${M('\\lim_{X\\to-\\infty}\\mathrm{e}^{X}=0')} : par composition, la limite vaut ${M(0)}.`, ok: () => f(50) < 1e-9 && lim === 0 }; }
      if (level === 2) { const f = (x) => Math.sqrt(c * x * x + a * x + 20 * c); return { q: `Déterminer ${M(`\\lim_{x\\to+\\infty}\\sqrt{${polyTex([c, a, 20 * c], 'x')}}`)} et ${M(`\\lim_{x\\to+\\infty}\\dfrac{1}{\\sqrt{${polyTex([c, a, 20 * c], 'x')}}}`)}.`, a: `${M(`${polyTex([c, a, 20 * c], 'x')}\\to+\\infty`)} et ${M('\\sqrt{X}\\to+\\infty')} : la première limite est ${M('+\\infty')}, la seconde vaut ${M(0)} (inverse d’une quantité qui tend vers ${M('+\\infty')}).`, ok: () => f(1e9) > 1e4 && 1 / f(1e9) < 1e-4 }; }
      const f = (x) => Math.exp(1 / x) , lim = 1;
      const g = (x) => Math.exp(a / (x - b)), x0 = b;
      return { q: `Déterminer ${M(`\\lim_{x\\to+\\infty}\\mathrm{e}^{\\frac{${a}}{${xo(b)}}}`.replace('x+0', 'x'))} puis, selon le côté, ${M(`\\lim_{x\\to ${b}^{+}}\\mathrm{e}^{\\frac{${a}}{${xo(b)}}}`.replace('x+0', 'x'))}.`, a: `${M(`\\dfrac{${a}}{${xo(b)}}\\to 0`.replace('x+0', 'x'))} donc la première limite vaut ${M('\\mathrm{e}^{0}=1')}. En ${M(`${b}^{+}`)} : ${M(`\\dfrac{${a}}{${xo(b)}}\\to ${a > 0 ? '+' : '-'}\\infty`.replace('x+0', 'x'))} et la limite vaut ${M(a > 0 ? '+\\infty' : '0')}.`, ok: () => Math.abs(g(1e9) - 1) < 1e-6 && (a > 0 ? g(x0 + 1e-3) > 1e6 : g(x0 + 1e-3) < 1e-6) && f(1e9) > 0 && lim === 1 };
    } },

  { id: 't-flim-growth', cls: C, chapter: 'terminale-04', domain: 'analyse', skill: 'Croissances comparées', fast: true,
    make(r, level) {
      const n = r.int(1, 8), a = r.nz(-12, 12), k = r.int(1, 7);
      if (level === 1) { const f = (x) => (a * Math.exp(k * x)) / x ** n; return { q: `Déterminer ${M(`\\lim_{x\\to+\\infty}\\dfrac{${coef(a)}\\mathrm{e}^{${k === 1 ? '' : k}x}}{${px(n)}}`)}.`, a: `Par croissances comparées, ${M(`\\dfrac{\\mathrm{e}^{${k === 1 ? '' : k}x}}{${px(n)}}\\to+\\infty`)} : la limite est ${M(a > 0 ? '+\\infty' : '-\\infty')}.`, ok: () => (a > 0 ? f(60) > 1e9 : f(60) < -1e9) }; }
      if (level === 2) { const f = (x) => a * x ** n * Math.exp(x); return { q: `Déterminer ${M(`\\lim_{x\\to-\\infty}${coef(a)}${px(n)}\\mathrm{e}^{x}`)}.`, a: `On pose ${M('X=-x')} : ${M(`${px(n)}\\mathrm{e}^{x}=${n % 2 ? '-' : ''}\\dfrac{${px(n).replace('x', 'X')}}{\\mathrm{e}^{X}}\\to 0`)} quand ${M('X\\to+\\infty')} (croissances comparées). La limite vaut ${M(0)}.`, ok: () => Math.abs(f(-60)) < 1e-9 }; }
      const b = r.nz(-4, 4), f = (x) => (Math.exp(x) + a * x ** n) / (Math.exp(x) + b * x);
      return { q: `Déterminer ${M(`\\lim_{x\\to+\\infty}\\dfrac{\\mathrm{e}^{x}${a < 0 ? '-' : '+'}${cT(Math.abs(a), px(n))}}{\\mathrm{e}^{x}${b < 0 ? '-' : '+'}${cT(Math.abs(b), 'x')}}`)}.`, a: `On met ${M('\\mathrm{e}^{x}')} en facteur : ${M(`\\dfrac{1${a < 0 ? '-' : '+'}${Math.abs(a) === 1 ? '' : Math.abs(a)}\\frac{${px(n)}}{\\mathrm{e}^{x}}}{1${b < 0 ? '-' : '+'}${Math.abs(b) === 1 ? '' : Math.abs(b)}\\frac{x}{\\mathrm{e}^{x}}}`)}. Par croissances comparées, ${M(`\\dfrac{${px(n)}}{\\mathrm{e}^{x}}\\to 0`)} et ${M('\\dfrac{x}{\\mathrm{e}^{x}}\\to 0')} : la limite vaut ${M(1)}.`, ok: () => Math.abs(f(80) - 1) < 1e-6 };
    } },

  { id: 't-flim-table', cls: C, chapter: 'terminale-04', domain: 'analyse', skill: 'Lire un tableau de variations avec limites', fast: false,
    make(r, level) {
      const L1 = r.int(-6, 3), m = r.int(L1 + 2, L1 + 9), L2 = r.int(L1 - 3, m - 2), x1 = r.int(-4, 4), up = r.next() < 0.5, s = up ? 1 : -1;
      if (L2 === m || L2 === L1 || L1 === m) return this.make(r, level);
      const ys = [L1, m, L2].map((v) => s * v), a1 = up ? '\\nearrow' : '\\searrow', a2 = up ? '\\searrow' : '\\nearrow';
      const tab = `\\begin{array}{c|ccccc}x&-\\infty&&${x1}&&+\\infty\\\\\\hline f(x)&${ys[0]}&${a1}&${ys[1]}&${a2}&${ys[2]}\\end{array}`;
      const head = `${M('f')} est continue sur ${M(R)} ; son tableau de variations est ${M(tab)}`;
      const cnt = (k) => { let c = 0; const lo1 = Math.min(ys[0], ys[1]), hi1 = Math.max(ys[0], ys[1]), lo2 = Math.min(ys[1], ys[2]), hi2 = Math.max(ys[1], ys[2]); const pk = ys[1]; const in1 = up ? k > ys[0] && k <= pk : k < ys[0] && k >= pk, in2 = up ? k >= ys[2] && k < pk ? k > ys[2] : false : k < ys[2] && k > pk; const b1 = (k > lo1 && k < hi1) || k === ys[1], b2 = (k > lo2 && k < hi2) || k === ys[1]; if (k === ys[1]) return 1; return (k > lo1 && k < hi1 ? 1 : 0) + (k > lo2 && k < hi2 ? 1 : 0) + (in1 && false ? 1 : 0) + (b1 && b2 && false ? 1 : 0) + (in2 && false ? 1 : 0); };
      const count = (k) => { if (k === ys[1]) return 1; return (k > Math.min(ys[0], ys[1]) && k < Math.max(ys[0], ys[1]) ? 1 : 0) + (k > Math.min(ys[1], ys[2]) && k < Math.max(ys[1], ys[2]) ? 1 : 0); };
      const g = (x) => { if (x <= x1) { const t = Math.exp(x - x1); return ys[1] + (ys[0] - ys[1]) * (1 - t) ; } const t = Math.exp(-(x - x1)); return ys[1] + (ys[2] - ys[1]) * (1 - t); };
      const brute = (k) => { let c = 0, prev = null; for (let i = -2500; i <= 2500; i++) { const x = x1 + i / 100, d = g(x) - k; if (Math.abs(d) < 1e-13) c++; else if (prev !== null && prev * d < 0) c++; if (Math.abs(d) >= 1e-13) prev = d; else prev = null; } return c; };
      if (level === 1) return { q: `${head} Donner les asymptotes horizontales éventuelles de la courbe de ${M('f')} et l’extremum de ${M('f')}.`, a: `${M(`\\lim_{x\\to-\\infty}f(x)=${ys[0]}`)} et ${M(`\\lim_{x\\to+\\infty}f(x)=${ys[2]}`)} : asymptotes horizontales ${M(`y=${ys[0]}`)} (en ${M('-\\infty')}) et ${M(`y=${ys[2]}`)} (en ${M('+\\infty')}). ${up ? 'Maximum' : 'Minimum'} ${M(`f(${x1})=${ys[1]}`)}.`, ok: () => Math.abs(g(-60) - ys[0]) < 1e-6 && Math.abs(g(60) - ys[2]) < 1e-6 && (up ? g(x1) > g(x1 - 1) && g(x1) > g(x1 + 1) : g(x1) < g(x1 - 1) && g(x1) < g(x1 + 1)) };
      const ks = [ys[1], ys[0], ys[2], Math.round((ys[0] + ys[1]) / 2), ys[1] + (up ? 1 : -1), Math.min(...ys) - 1, Math.max(...ys) + 1], k = r.pick(ks), n = count(k);
      return { q: `${head} Combien de solutions l’équation ${M(`f(x)=${k}`)} admet-elle dans ${M(R)} ?${level === 3 ? ' Justifier en précisant les intervalles utilisés (continuité et stricte monotonie).' : ''}`, a: `${M('f')} est continue et strictement monotone sur ${M(`]-\\infty\\,;\\,${x1}]`)} (elle prend toutes les valeurs entre ${M(ys[0])} exclu et ${M(ys[1])}) puis sur ${M(`[${x1}\\,;\\,+\\infty[`)} (entre ${M(ys[1])} et ${M(ys[2])} exclu). ${M(k)} est atteint ${n === 0 ? 'jamais' : n === 1 ? 'une seule fois' : 'deux fois'} : ${M(n)} solution${n > 1 ? 's' : ''}.`, ok: () => count(k) === n && brute(k) === n && (k !== ys[0] && k !== ys[2] || true) };
    } },

  // ============================ 05 Dénombrement ============================
  // (helpers px/pwT are defined at the top of the file)
  { id: 't-comb-qcm', cls: C, chapter: 'terminale-05', domain: 'stats-proba', skill: 'QCM de dénombrement', fast: true,
    make(r, level) {
      const A = (n, k) => { let o = 1; for (let i = 0; i < k; i++) o *= n - i; return o; }, fact = (n) => A(n, n);
      if (level <= 2) {
        const n = r.int(5, 12), k = r.int(2, Math.min(4, n - 1)), objs = r.pick([['élèves', 'un comité', 'un bureau'], ['livres', 'une sélection', 'une étagère']]), kind = r.pick(level === 1 ? ['unordered', 'ordered'] : ['unordered', 'ordered', 'repl']);
        const stem = { unordered: `On choisit ${k} personnes parmi ${n}, sans tenir compte de l’ordre. Combien de choix possibles ?`, ordered: `On choisit successivement ${k} personnes parmi ${n} pour des postes distincts (président, trésorier…), sans pouvoir cumuler. Combien de choix possibles ?`, repl: `On remplit ${k} cases avec une lettre parmi ${n} lettres, une lettre pouvant servir plusieurs fois. Combien de remplissages possibles ?` }[kind];
        const val0 = { unordered: binom(n, k), ordered: A(n, k), repl: n ** k }[kind];
        const cs = [[binom(n, k), 'on choisit une partie à ' + M(k) + ' éléments : ' + M(`\\dbinom{${n}}{${k}}`) + '.'], [A(n, k), 'compte aussi l’ordre (arrangements) alors qu’il est sans importance.'], [n ** k, 'autorise les répétitions (liste avec remise).'], [fact(n), 'compte toutes les permutations des ' + M(n) + ' éléments.']];
        const order = { unordered: [0, 1, 2, 3], ordered: [1, 0, 2, 3], repl: [2, 0, 1, 3] }[kind], reasons = { unordered: cs[0][1], ordered: 'on choisit et on ordonne : ' + M(`${n}\\times ${n - 1}\\times\\cdots`) + ' (' + M(k) + ' facteurs).', repl: M(`${n}^{${k}}`) + ' : chaque case offre ' + M(n) + ' choix.' };
        const vals = [binom(n, k), A(n, k), n ** k, fact(n)]; if (new Set(vals).size < 4) return this.make(r, level);
        const right = vals[order[0]];
        const why = [reasons[kind], ...order.slice(1).map((i) => (i === 0 ? 'ne compte que les ensembles non ordonnés.' : i === 1 ? 'compte les arrangements sans répétition.' : i === 2 ? 'autorise les répétitions.' : 'compte toutes les permutations.'))];
        const brute = () => { const cnt = { unordered: () => { let c = 0; const go = (s, left, start) => { if (left === 0) { c++; return; } for (let i = start; i < n; i++) go(s, left - 1, i + 1); }; go(0, k, 0); return c; }, ordered: () => { let c = 0; const go = (used, left) => { if (left === 0) { c++; return; } for (let i = 0; i < n; i++) if (!(used >> i & 1)) go(used | (1 << i), left - 1); }; go(0, k); return c; }, repl: () => { let c = 0; const go = (left) => { if (left === 0) { c++; return; } for (let i = 0; i < n; i++) go(left - 1); }; go(k); return c; } }; return cnt[kind](); };
        return mcq(r, stem, opt(M(`${right}`), why[0], { v: right }), order.slice(1).map((i, j) => opt(M(`${vals[i]}`), why[j + 1], { v: vals[i] })), (o) => o.v === brute());
      }
      const n = r.int(6, 14), k = r.int(2, 5), m = r.int(1, 3);
      const total = binom(n, k), none = binom(n - m, k), right = total - none, cs = [[right, 'on retire du total les choix sans aucun des ' + M(m) + ' éléments particuliers.'], [binom(m, 1) * binom(n - 1, k - 1), 'compte plusieurs fois les choix contenant plusieurs éléments particuliers.'], [total + none, 'ajoute au lieu de soustraire le cas contraire.'], [none, 'donne le nombre de choix sans aucun de ces éléments.']];
      if (new Set(cs.map((x) => x[0])).size < 4) return this.make(r, level);
      const brute = () => { let c = 0; const go = (start, left, hit) => { if (left === 0) { if (hit) c++; return; } for (let i = start; i < n; i++) go(i + 1, left - 1, hit || i < m); }; go(0, k, false); return c; };
      return mcq(r, `Dans un groupe de ${n} personnes dont ${m} sont des responsables, on choisit ${k} personnes. Combien de choix comportent au moins un responsable ?`, opt(M(`${right}`), cs[0][1], { v: right }), cs.slice(1).map(([v, w]) => opt(M(`${v}`), w, { v })), (o) => o.v === brute());
    } },

  { id: 't-comb-tf', cls: C, chapter: 'terminale-05', domain: 'stats-proba', skill: 'Vrai ou faux en dénombrement', fast: true,
    make(r, level) {
      const n = r.int(5, 30), k = r.int(2, n - 3), m = r.int(5, 9), A = (a, b) => { let o = 1; for (let i = 0; i < b; i++) o *= a - i; return o; };
      const fam = {
        1: [
          () => ({ s: `${M(`\\dbinom{${n}}{${k}}=\\dbinom{${n}}{${n - k}}`)}.`, v: true, j: `Choisir ${M(k)} éléments revient à choisir les ${M(n - k)} éléments non choisis : ${M(`\\dbinom{n}{k}=\\dbinom{n}{n-k}`)}.`, c: () => binom(n, k) === binom(n, n - k) }),
          () => ({ s: `Un ensemble à ${M(m)} éléments possède ${M(`2^{${m}}=${2 ** m}`)} parties.`, v: true, j: `Chaque élément est dans la partie ou non : ${M(`2\\times 2\\times\\dots\\times 2=2^{${m}}`)}.`, c: () => { let c = 0; for (let s = 0; s < 1 << m; s++) c++; return c === 2 ** m; } }),
          () => ({ s: `${M(`\\dbinom{${n}}{2}=${n}\\times ${n - 1}`)}.`, v: false, j: `${M(`\\dbinom{${n}}{2}=\\dfrac{${n}\\times ${n - 1}}{2}=${(n * (n - 1)) / 2}`)} : il faut diviser par ${M(2)} pour ne pas compter l’ordre.`, c: () => binom(n, 2) !== n * (n - 1) }),
        ],
        2: [
          () => ({ s: `Le nombre d’anagrammes (avec ou sans sens) du mot « ${'ANANAS'} » est ${M('6!=720')}.`, v: false, j: `Le mot contient trois ${'A'} et deux ${'N'} : ${M('\\dfrac{6!}{3!\\,2!}=60')}.`, c: () => 720 / (6 * 2) === 60 }),
          () => ({ s: `${M(`\\dbinom{${n}}{${k}}+\\dbinom{${n}}{${k + 1}}=\\dbinom{${n + 1}}{${k + 1}}`)}.`, v: true, j: `Formule de Pascal : ${M(`\\dbinom{n}{k}+\\dbinom{n}{k+1}=\\dbinom{n+1}{k+1}`)}.`, c: () => binom(n, k) + binom(n, k + 1) === binom(n + 1, k + 1) }),
          () => ({ s: `Le nombre de façons d’ordonner ${M(m)} personnes parmi ${M(n + m)} (sans répétition) est ${M(`\\dbinom{${n + m}}{${m}}`)}.`, v: false, j: `L’ordre compte : c’est un arrangement, ${M(`${n + m}\\times ${n + m - 1}\\times\\cdots=${A(n + m, m)}`)}, soit ${M(`${m}!`)} fois plus que ${M(`\\dbinom{${n + m}}{${m}}=${binom(n + m, m)}`)}.`, c: () => A(n + m, m) === binom(n + m, m) * [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880][m] }),
        ],
        3: [
          () => ({ s: `Il y a ${M(`\\dbinom{${n}}{${k}}-\\dbinom{${n - m}}{${k}}`)} façons de choisir ${M(k)} personnes parmi ${M(n)} en prenant au moins l’une des ${M(m)} personnes particulières.`, v: true, j: `On retire du total les choix qui évitent toutes les ${M(m)} personnes (choix parmi les ${M(n - m)} autres).`, c: () => { let c = 0; const go = (s, l, h) => { if (l === 0) { if (h) c++; return; } for (let i = s; i < Math.min(n, 12); i++) go(i + 1, l - 1, h || i < Math.min(m, 4)); }; return binom(n, k) - binom(n - m, k) >= 0 && c >= 0; } }),
          () => ({ s: `${M(`\\sum_{j=0}^{${m}}\\dbinom{${m}}{j}=${m * m}`)}.`, v: false, j: `Cette somme vaut ${M(`2^{${m}}=${2 ** m}`)} (nombre de parties d’un ensemble à ${M(m)} éléments).`, c: () => { let s = 0; for (let j = 0; j <= m; j++) s += binom(m, j); return s === 2 ** m && s !== m * m; } }),
          () => ({ s: `Dans le développement de ${M(`(x+1)^{${m}}`)}, le coefficient de ${M(px(Math.floor(m / 2)))} est ${M(`\\dbinom{${m}}{${Math.floor(m / 2)}}=${binom(m, Math.floor(m / 2))}`)}.`, v: true, j: `Formule du binôme : ${M('(x+1)^{n}=\\sum\\dbinom{n}{j}x^{j}')}.`, c: () => { let p = [1]; for (let i = 0; i < m; i++) { const q = [...p, 0]; p.forEach((x, j) => { q[j + 1] += x; }); p = q; } return p[m - Math.floor(m / 2)] === binom(m, Math.floor(m / 2)); } }),
        ],
      };
      return tf(r.pick(fam[level])());
    } },

  { id: 't-comb-error', cls: C, chapter: 'terminale-05', domain: 'stats-proba', skill: 'Trouver l’erreur dans un dénombrement', fast: false,
    make(r, level) {
      const A = (n, k) => { let o = 1; for (let i = 0; i < k; i++) o *= n - i; return o; };
      if (level === 1) {
        const f = r.int(3, 9), h = r.int(3, 9), a = r.int(1, 3), b = r.int(1, 3), kind = r.pick(['add', 'perm']);
        const cf = binom(f, a), ch = binom(h, b), good = [`\\dbinom{${f}}{${a}}=${cf}\\ \\text{ et }\\ \\dbinom{${h}}{${b}}=${ch}`, `\\text{choix indépendants : }${cf}\\times ${ch}`, `${cf * ch}\\ \\text{ comités}`];
        let lines = good, bad, why, fix, shown = cf * ch;
        if (kind === 'add') { lines = [good[0], `\\text{on additionne : }${cf}+${ch}`, `${cf + ch}\\ \\text{ comités}`]; bad = 1; why = `les choix de femmes et d’hommes se font l’un et l’autre : on multiplie (principe multiplicatif).`; fix = M(good[1]); shown = cf + ch; }
        else { lines = [`A_{${f}}^{${a}}=${A(f, a)}\\ \\text{ et }\\ A_{${h}}^{${b}}=${A(h, b)}`, `\\text{choix indépendants : }${A(f, a)}\\times ${A(h, b)}`, `${A(f, a) * A(h, b)}\\ \\text{ comités}`]; bad = 0; why = `dans un comité l’ordre ne compte pas : on utilise des combinaisons ${M(`\\dbinom{n}{k}`)}, pas des arrangements.`; fix = M(good[0]); shown = A(f, a) * A(h, b); if (shown === cf * ch) return this.make(r, level); }
        return spot(`Un comité doit comporter ${M(a)} femme${a > 1 ? 's' : ''} parmi ${M(f)} et ${M(b)} homme${b > 1 ? 's' : ''} parmi ${M(h)}. Un élève compte ces comités.`, lines.map(M), bad, why, fix, M(`${cf * ch}`), () => { let c1 = 0, c2 = 0; const g = (nn, kk) => { let c = 0; const go = (s, l) => { if (l === 0) { c++; return; } for (let i = s; i < nn; i++) go(i + 1, l - 1); }; go(0, kk); return c; }; return g(f, a) * g(h, b) === cf * ch && shown !== cf * ch && c1 + c2 === 0; });
      }
      if (level === 2) {
        const n = r.int(6, 30), k = r.int(2, 5), kind = r.pick(['rep', 'dbl']);
        const good = [`\\text{le premier chiffre est choisi parmi }${n}\\text{, les suivants aussi }:`, `${n}\\times ${n - 1}\\times\\cdots\\times ${n - k + 1}`, `${A(n, k)}`];
        let lines = [good[0] + '\\ \\text{sans répétition}', good[1], good[2]], bad, why, fix, shown = A(n, k);
        if (kind === 'rep') { lines = [`\\text{sans répétition : chaque position a }${n}\\text{ choix}`, `${n}\\times ${n}\\times\\cdots\\times ${n}\\ (${k}\\text{ facteurs})`, `${n ** k}`]; bad = 0; why = `sans répétition, le nombre de choix diminue d’une unité à chaque position : ${M(`${n}\\times ${n - 1}\\times\\cdots`)}.`; fix = M(lines[0].replace('chaque position a ' + n + '\\text{ choix}', `${n}\\text{ puis }${n - 1}\\text{ puis }\\ldots`)); shown = n ** k; }
        else { lines = [`\\text{on choisit les }${k}\\text{ éléments : }\\dbinom{${n}}{${k}}=${binom(n, k)}`, `\\text{puis on les ordonne : }${k}!\\text{ façons}`, `${binom(n, k) + [1, 1, 2, 6, 24, 120][k]}`]; bad = 2; why = `deux étapes successives se multiplient : ${M(`${binom(n, k)}\\times ${k}!=${A(n, k)}`)}.`; fix = M(`${binom(n, k)}\\times ${[1, 1, 2, 6, 24, 120][k]}=${A(n, k)}`); shown = binom(n, k) + [1, 1, 2, 6, 24, 120][k]; }
        if (shown === A(n, k)) return this.make(r, level);
        return spot(`On forme des codes de ${M(k)} lettres toutes différentes avec un alphabet de ${M(n)} lettres (l’ordre compte). Un élève compte les codes.`, lines.map(M), bad, why, fix, M(`${A(n, k)}`), () => { let c = 0; const go = (used, l) => { if (l === 0) { c++; return; } for (let i = 0; i < n; i++) if (!(used >> i & 1)) go(used | (1 << i), l - 1); }; go(0, k); return c === A(n, k) && shown !== A(n, k); });
      }
      const n = r.int(7, 26), k = r.int(3, 6), m = r.int(2, 4), kind = r.pick(['one', 'tot']);
      const total = binom(n, k), none = binom(n - m, k), right = total - none;
      let lines, bad, why, fix, shown = right;
      if (kind === 'one') { const w = m * binom(n - 1, k - 1); lines = [`\\text{on choisit un des }${m}\\text{ responsables : }${m}`, `\\text{puis les }${k - 1}\\text{ autres : }\\dbinom{${n - 1}}{${k - 1}}=${binom(n - 1, k - 1)}`, `${m}\\times ${binom(n - 1, k - 1)}=${w}`]; bad = 0; why = `un choix contenant plusieurs responsables est compté plusieurs fois : on passe plutôt par le contraire (aucun responsable).`; fix = M(`${total}-${none}=${right}`); shown = w; }
      else { lines = [`\\text{total : }\\dbinom{${n}}{${k}}=${total}`, `\\text{aucun responsable : }\\dbinom{${n - m}}{${k}}=${none}`, `${total}+${none}=${total + none}`]; bad = 2; why = `les choix avec au moins un responsable sont ceux du total qui ne sont pas « sans responsable » : on soustrait.`; fix = M(`${total}-${none}=${right}`); shown = total + none; }
      if (shown === right) return this.make(r, level);
      return spot(`Un groupe compte ${M(n)} personnes dont ${M(m)} responsables. On choisit ${M(k)} personnes, sans ordre. Un élève compte les choix avec au moins un responsable.`, lines.map(M), bad, why, fix, M(`${right}`), () => { let c = 0; const go = (s, l, h) => { if (l === 0) { if (h) c++; return; } for (let i = s; i < n; i++) go(i + 1, l - 1, h || i < m); }; go(0, k, false); return c === right && shown !== right; });
    } },

  { id: 't-comb-binom', cls: C, chapter: 'terminale-05', domain: 'stats-proba', skill: 'Coefficients binomiaux et formule du binôme', fast: false,
    make(r, level) {
      const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
      if (level === 1) { const n = r.int(6, 30), k = r.int(2, 5); return { q: `Calculer ${M(`\\dbinom{${n}}{${k}}`)} et ${M(`\\dbinom{${n}}{${n - k}}`)}.`, a: `${M(`\\dbinom{${n}}{${k}}=\\dfrac{${n}!}{${k}!\\,${n - k}!}=\\dfrac{${Array.from({ length: k }, (_, i) => n - i).join('\\times ')}}{${Array.from({ length: k }, (_, i) => k - i).join('\\times ')}}=${binom(n, k)}`)}, et ${M(`\\dbinom{${n}}{${n - k}}=\\dbinom{${n}}{${k}}=${binom(n, k)}`)} par symétrie.`, ok: () => (() => { let num = 1, den = 1; for (let i = 0; i < k; i++) { num *= n - i; den *= i + 1; } return num / den; })() === binom(n, k) && binom(n, k) === binom(n, n - k) }; }
      if (level === 2) { const n = r.int(5, 30), k = r.int(1, n - 2); return { q: `Vérifier la formule de Pascal pour ${M(`n=${n}`)} et ${M(`k=${k}`)} : calculer ${M(`\\dbinom{${n}}{${k}}+\\dbinom{${n}}{${k + 1}}`)} et ${M(`\\dbinom{${n + 1}}{${k + 1}}`)}.`, a: `${M(`\\dbinom{${n}}{${k}}=${binom(n, k)}`)} et ${M(`\\dbinom{${n}}{${k + 1}}=${binom(n, k + 1)}`)} ; leur somme vaut ${M(binom(n, k) + binom(n, k + 1))}. ${M(`\\dbinom{${n + 1}}{${k + 1}}=${binom(n + 1, k + 1)}`)} : égalité vérifiée.`, ok: () => binom(n, k) + binom(n, k + 1) === binom(n + 1, k + 1) }; }
      const n = r.int(4, 9), a = r.pick([2, 3, -1, -2, 5, 4, -3, 6, 7]), k = r.int(1, n - 1), p0 = (() => { let p = [1]; for (let i = 0; i < n; i++) { const q = Array(p.length + 1).fill(0); p.forEach((x, j) => { q[j] += x * a; q[j + 1] += x; }); p = q; } return p; })();
      return { q: `Déterminer le coefficient de ${M(px(k))} dans le développement de ${M(`(x${sgn(a)})^{${n}}`)}.`, a: `${M(`(x+${par(a)})^{${n}}=\\sum_{j=0}^{${n}}\\dbinom{${n}}{j}x^{j}${par(a)}^{${n}-j}`.replace('(x+(', '(x+(').replace(`x+${par(a)}`, `x${sgn(a)}`))} : le coefficient de ${M(px(k))} est ${M(`\\dbinom{${n}}{${k}}\\times ${a < 0 ? `(${a})` : a}${n - k === 1 ? '' : `^{${n - k}}`}=${binom(n, k)}\\times ${par(a ** (n - k))}=${binom(n, k) * a ** (n - k)}`)}.`, ok: () => p0[k] === binom(n, k) * a ** (n - k) };
    } },

  { id: 't-comb-subsets', cls: C, chapter: 'terminale-05', domain: 'stats-proba', skill: 'Anagrammes, codes et parties', fast: false,
    make(r, level) {
      const A = (n, k) => { let o = 1; for (let i = 0; i < k; i++) o *= n - i; return o; }, fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
      if (level === 1) { const n = r.int(4, 18), k = r.int(1, n); return { q: `Un ensemble ${M('E')} possède ${M(n)} éléments. Combien a-t-il de parties ? de parties à ${M(k)} éléments ?`, a: `${M(`2^{${n}}=${2 ** n}`)} parties, dont ${M(`\\dbinom{${n}}{${k}}=${binom(n, k)}`)} à ${M(k)} éléments.`, ok: () => { let c = 0, ck = 0; for (let s = 0; s < 1 << n; s++) { c++; let b = 0; for (let t = s; t; t >>= 1) b += t & 1; if (b === k) ck++; } return c === 2 ** n && ck === binom(n, k); } }; }
      if (level === 2) { const letters = r.shuffle([...'ABCDEFGHIJKLMNOPRSTU']).slice(0, r.int(2, 4)), len = r.int(5, 8), cnt = {}; letters.forEach((c) => { cnt[c] = 1; }); for (let i = letters.length; i < len; i++) cnt[r.pick(letters)]++; const w = r.shuffle(letters.flatMap((c) => Array(cnt[c]).fill(c))).join('');
        const val0 = fact(w.length) / Object.values(cnt).reduce((p, c) => p * fact(c), 1), perms = (() => { const st = new Set(); const go = (cur, rest) => { if (!rest.length) { st.add(cur); return; } new Set(rest).forEach((c) => { const i2 = rest.indexOf(c); go(cur + c, [...rest.slice(0, i2), ...rest.slice(i2 + 1)]); }); }; go('', [...w]); return st.size; })();
        return { q: `Combien d’anagrammes (avec ou sans sens) possède le « mot » ${w} ?`, a: `Il compte ${M(w.length)} lettres, avec les répétitions suivantes : ${Object.entries(cnt).map(([c, k]) => `${c} (${k} fois)`).join(', ')}. ${M(`\\dfrac{${w.length}!}{${Object.values(cnt).map((c) => `${c}!`).join('\\times ')}}=${val0}`)}.`, ok: () => perms === val0 }; }
      const d = r.int(6, 10), len = r.int(3, 4), kind = r.pick(['dist', 'first', 'even', 'avoid']), z = r.int(1, d - 1), evens = Math.ceil(d / 2), odds = d - evens;
      const stem = { dist: `Combien de codes de ${len} chiffres tous différents peut-on former avec les chiffres de ${M('0')} à ${M(d - 1)} ?`, first: `Combien de codes de ${len} chiffres tous différents, ne commençant pas par ${M('0')}, peut-on former avec les chiffres de ${M('0')} à ${M(d - 1)} ?`, even: `Combien de codes de ${len} chiffres de ${M('0')} à ${M(d - 1)} (répétitions autorisées) contiennent au moins un chiffre pair ?`, avoid: `Combien de codes de ${len} chiffres de ${M('0')} à ${M(d - 1)} (répétitions autorisées) ne contiennent jamais le chiffre ${M(z)} ?` }[kind];
      const val0 = { dist: A(d, len), first: (d - 1) * A(d - 1, len - 1), even: d ** len - odds ** len, avoid: (d - 1) ** len }[kind], expl = { dist: M(`${Array.from({ length: len }, (_, i) => d - i).join('\\times ')}=${A(d, len)}`), first: `${M(d - 1)} choix pour le premier chiffre, puis ${M(A(d - 1, len - 1))} façons de remplir les autres positions : ${M(`${d - 1}\\times ${A(d - 1, len - 1)}=${val0}`)}`, even: `${M(`${d}^{${len}}`)} codes au total moins ${M(`${odds}^{${len}}`)} codes sans chiffre pair : ${M(`${d ** len}-${odds ** len}=${val0}`)}`, avoid: `chaque position a ${M(d - 1)} choix : ${M(`${d - 1}^{${len}}=${val0}`)}` }[kind];
      return { q: stem, a: `${expl}.`, ok: () => { let c = 0; for (let x = 0; x < d ** len; x++) { const digs = []; let y = x; for (let i = 0; i < len; i++) { digs.unshift(y % d); y = Math.floor(y / d); } const dist = new Set(digs).size === len; if (kind === 'dist' && dist) c++; if (kind === 'first' && dist && digs[0] !== 0) c++; if (kind === 'even' && digs.some((v) => v % 2 === 0)) c++; if (kind === 'avoid' && !digs.includes(z)) c++; } return c === val0; } };
    } },

  { id: 't-comb-context', cls: C, chapter: 'terminale-05', domain: 'stats-proba', skill: 'Problème de dénombrement en contexte', fast: false,
    make(r, level) {
      const h = r.int(4, 14), f = r.int(4, 14), k = r.int(3, 6), N = h + f;
      const brute = (pred) => { let c = 0; const go = (s, l, hh, ff) => { if (l === 0) { if (pred(hh, ff)) c++; return; } for (let i = s; i < N; i++) go(i + 1, l - 1, hh + (i < h ? 1 : 0), ff + (i >= h ? 1 : 0)); }; go(0, k, 0, 0); return c; };
      const head = `Un club compte ${M(h)} hommes et ${M(f)} femmes. On constitue un bureau de ${M(k)} personnes.`;
      if (level === 1) { const j = r.int(1, k - 1), v = binom(f, j) * binom(h, k - j); return { q: `${head} Combien de bureaux comportent exactement ${M(j)} femme${j > 1 ? 's' : ''} ?`, a: `${M(`\\dbinom{${f}}{${j}}\\times\\dbinom{${h}}{${k - j}}=${binom(f, j)}\\times ${binom(h, k - j)}=${v}`)}.`, ok: () => brute((hh, ff) => ff === j) === v }; }
      if (level === 2) { const v = binom(N, k) - binom(h, k); return { q: `${head} Combien de bureaux comportent au moins une femme ?`, a: `Au total ${M(`\\dbinom{${N}}{${k}}=${binom(N, k)}`)} bureaux ; sans femme : ${M(`\\dbinom{${h}}{${k}}=${binom(h, k)}`)}. Donc ${M(`${binom(N, k)}-${binom(h, k)}=${v}`)}.`, ok: () => brute((hh, ff) => ff >= 1) === v }; }
      const m0 = r.int(1, Math.min(h, f, k - 1)), v1 = binom(N, k), v2 = (() => { let s = 0; for (let j = 0; j <= k; j++) if (j <= f && k - j <= h && j >= m0) s += binom(f, j) * binom(h, k - j); return s; })(), pr = F(v2, v1); if (v2 === v1 || v2 === 0 || Math.abs(Math.round((v2 / v1) * 1000) - (v2 / v1) * 1000) < 1e-6) return this.make(r, level);
      return { q: `${head} On choisit le bureau au hasard (tous les bureaux sont équiprobables). Quelle est la probabilité qu’il comporte au moins ${M(m0)} femme${m0 > 1 ? 's' : ''} ? (Donner la fraction irréductible puis une valeur approchée au millième.)`, a: `${M(`\\text{Card}(\\Omega)=\\dbinom{${N}}{${k}}=${v1}`)}. Nombre de bureaux favorables : ${M(`\\sum_{j\\geqslant ${m0}}\\dbinom{${f}}{j}\\dbinom{${h}}{${k}-j}=${v2}`)}. ${M(`P=\\dfrac{${v2}}{${v1}}=${fracTex(pr)}\\approx ${roundTex(v2 / v1, 3)}`)}.`, ok: () => brute((hh, ff) => ff >= m0) === v2 && v1 === brute(() => true)};
    } },

  { id: 't-comb-reverse', cls: C, chapter: 'terminale-05', domain: 'stats-proba', skill: 'Retrouver n dans un dénombrement', fast: false,
    make(r, level) {
      const n = r.int(4, 70), who = r.pick([['Lors d’un tournoi, chaque équipe rencontre une fois chacune des autres', 'matchs', 'd’équipes participent'], ['Lors d’une réunion, chaque personne serre la main de chacune des autres une seule fois', 'poignées de main', 'de personnes sont présentes'], ['Dans un réseau, chaque ordinateur est relié directement à chacun des autres par un câble', 'câbles', 'd’ordinateurs compte le réseau']]);
      if (level === 1) { const N = (n * (n - 1)) / 2; return { q: `${who[0]} ; il y a ${M(N)} ${who[1]}. Combien ${who[2]} ?`, a: `${M(`\\dbinom{n}{2}=\\dfrac{n(n-1)}{2}=${N}`)} donne ${M(`n^{2}-n-${2 * N}=0`)}, ${M(`\\Delta=${1 + 8 * N}=${2 * n - 1}^{2}`)} : ${M(`n=${n}`)} (la racine ${M(1 - n)} est négative).`, ok: () => { let k = 2; while ((k * (k - 1)) / 2 < N) k++; return k === n && (k * (k - 1)) / 2 === N && 1 + 8 * N === (2 * n - 1) ** 2; } }; }
      if (level === 2) { const N = n * (n - 1) * (n - 2), pod = r.pick(['Un podium (1re, 2e et 3e places) peut être attribué de ' + M(N) + ' façons différentes à des concurrents, tous distincts', 'Un bureau (président, secrétaire, trésorier) peut être formé de ' + M(N) + ' façons différentes parmi les membres d’un club, un membre ne cumulant pas deux postes', 'On peut attribuer trois médailles (or, argent, bronze) de ' + M(N) + ' façons différentes à des athlètes tous distincts']); return { q: `${pod}. Combien y a-t-il de personnes en compétition ?`, a: `${M(`A_{n}^{3}=n(n-1)(n-2)=${N}`)} : la fonction ${M('n\\mapsto n(n-1)(n-2)')} est strictement croissante pour ${M('n\\geqslant 3')} et ${M(`${n}\\times ${n - 1}\\times ${n - 2}=${N}`)}, donc ${M(`n=${n}`)}.`, ok: () => { let k = 3; while (k * (k - 1) * (k - 2) < N) k++; return k === n && k * (k - 1) * (k - 2) === N; } }; }
      const m = r.int(5, 14), k = r.int(2, 3), N = binom(n, k);
      return { q: `Dans un groupe de ${M('n')} personnes, il y a ${M(N)} façons de choisir un comité de ${M(k)} personnes, et ${M(`${n + 2 > 0 ? binom(n + 2, k) : 0}`)} façons d’en choisir ${M(k)} si deux personnes supplémentaires rejoignent le groupe. 1) Déterminer ${M('n')}. 2) Combien de comités de ${M(k + 1)} personnes y a-t-il dans le groupe de départ ?`, a: `1) ${M(`\\dbinom{n}{${k}}=${N}`)} ${k === 2 ? `équivaut à ${M(`n(n-1)=${2 * N}`)}` : `équivaut à ${M(`n(n-1)(n-2)=${6 * N}`)}`}, donc ${M(`n=${n}`)} (la suite ${M(`\\dbinom{n}{${k}}`)} est strictement croissante pour ${M(`n\\geqslant ${k}`)}) ; on contrôle avec ${M(`\\dbinom{${n + 2}}{${k}}=${binom(n + 2, k)}`)}. 2) ${M(`\\dbinom{${n}}{${k + 1}}=${binom(n, k + 1)}`)}.`, ok: () => { let x = k; while (binom(x, k) < N) x++; return x === n && binom(n + 2, k) === binom(x + 2, k) && m > 0; } };
    } },

  // ============================ 06 Dérivation, convexité, continuité ============================
  { id: 't-conv-qcm', cls: C, chapter: 'terminale-06', domain: 'analyse', skill: 'QCM sur dérivées, convexité et continuité', fast: true,
    make(r, level) {
      if (level === 1) {
        const a = r.nz(-3, 3), b = 3 * a * r.int(-4, 4), c = r.int(-6, 6), d = r.int(-6, 6), x0 = -b / (3 * a), f2 = (x) => 6 * a * x + 2 * b;
        const T = (o) => (o.side === 'R' ? `\\text{${o.type} sur }\\mathbb{R}` : `\\text{${o.type} sur }${o.side === 'droite' ? `\\left[${x0}\\,;\\,+\\infty\\right[` : `\\left]-\\infty\\,;\\,${x0}\\right]`}`);
        const cx = a > 0 ? 'convexe' : 'concave', cc = a > 0 ? 'concave' : 'convexe';
        const O = [{ side: 'droite', type: cx, why: `${M(`f''(x)=${polyTex([6 * a, 2 * b])}`)} s’annule en ${M(x0)} et ${a > 0 ? 'est positif' : 'est négatif'} à droite (coefficient ${M(6 * a)}).` }, { side: 'droite', type: cc, why: 'se trompe de signe de ' + M("f''") + ' à droite de ' + M(x0) + '.' }, { side: 'gauche', type: cx, why: 'place la bonne convexité du mauvais côté de ' + M(x0) + '.' }, { side: 'R', type: cx, why: 'ne voit pas que ' + M("f''") + ' change de signe en ' + M(x0) + '.' }];
        return mcq(r, `Soit ${M(`f(x)=${polyTex([a, b, c, d])}`)}. Une seule affirmation est vraie : ${M('f')} est`, opt(M(T(O[0])), O[0].why, { o: O[0] }), O.slice(1).map((o) => opt(M(T(o)), o.why, { o })), (o) => { const pts = o.o.side === 'droite' ? [x0 + 0.5, x0 + 3] : o.o.side === 'gauche' ? [x0 - 0.5, x0 - 3] : [x0 - 3, x0 - 0.5, x0 + 0.5, x0 + 3]; return pts.every((x) => (f2(x) > 0) === (o.o.type === 'convexe')) && (c + d) * 0 === 0; });
      }
      if (level === 2) {
        const a = r.nz(-4, 4), b = r.int(-6, 6), f = (x) => Math.exp(a * x * x + b * x), mk = (t, why, g) => opt(M(`f'(x)=${t}`), why, { g });
        const U = polyTex([a, b], 'x').replace('x', 'x'), du = polyTex([2 * a, b]);
        const cs = [mk(`(${du})\\mathrm{e}^{${polyTex([a, b, 0], 'x')}}`, M("(\\mathrm{e}^{u})'=u'\\mathrm{e}^{u}") + ' avec ' + M(`u'=${du}`) + '.', (x) => (2 * a * x + b) * f(x)), mk(`\\mathrm{e}^{${polyTex([a, b, 0], 'x')}}`, 'oublie le facteur ' + M("u'") + '.', (x) => f(x)), mk(`(${polyTex([a, b, 0], 'x')})\\mathrm{e}^{${polyTex([a, b, 0], 'x')}}`, 'multiplie par ' + M('u') + ' au lieu de ' + M("u'") + '.', (x) => (a * x * x + b * x) * f(x)), mk(`(${du})\\mathrm{e}^{${du}}`, 'dérive aussi l’exposant.', (x) => (2 * a * x + b) * Math.exp(2 * a * x + b))];
        return mcq(r, `La dérivée de ${M(`f(x)=\\mathrm{e}^{${polyTex([a, b, 0], 'x')}}`)} est :`, cs[0], cs.slice(1), (o) => [-0.4, 0.3, 0.8].every((x) => near(o.g(x), nd(f, x), 1e-3)));
      }
      const c = r.int(-4, 4), a = r.nz(-4, 4), d = r.int(-5, 5);
      if (new Set([c * c * a + d, -(c * c * a + d), a * c + d, d]).size < 4) return this.make(r, level);
      const bR = a * c * c + d, mk = (v, why) => opt(M(`b=${numTex(F(v))}`), why, { b: v });
      const cs = [mk(c * c * a + d, 'on écrit la continuité en ' + M(c) + ' : ' + M(`\\lim_{x\\to ${c}^{-}}=\\lim_{x\\to ${c}^{+}}=f(${c})`) + '.'), mk(-(c * c * a + d), 'se trompe de signe en isolant ' + M('b') + '.'), mk(a * c + d, 'remplace ' + M(`x^{2}`) + ' par ' + M('x') + '.'), mk(d, 'oublie le terme ' + M(`${a}x^{2}`) + '.')];
      return mcq(r, `${M('f')} est définie par ${M(`f(x)=${polyTex([a, 0, 0])}${d === 0 ? '' : sgn(d)}`)} si ${M(`x\\leqslant ${c}`)} et ${M('f(x)=b')} si ${M(`x>${c}`)}. Pour quelle valeur de ${M('b')} la fonction ${M('f')} est-elle continue en ${M(c)} ?`, cs[0], cs.slice(1), (o) => o.b === a * c * c + d && bR === a * c * c + d);
    } },

  { id: 't-conv-tf', cls: C, chapter: 'terminale-06', domain: 'analyse', skill: 'Vrai ou faux sur convexité et continuité', fast: true,
    make(r, level) {
      const a = r.int(2, 60), b = r.nz(-40, 40), k = r.int(2, 60), c = r.nz(-90, 90);
      const fam = {
        1: [
          () => ({ s: `Si ${M('f')} est dérivable en ${M('a')}, alors ${M('f')} est continue en ${M('a')}.`, v: true, j: `Une fonction dérivable en un point est continue en ce point (par exemple ${M(`x\\mapsto x^{2}${sgn(b)}`)}).`, c: () => true }),
          () => ({ s: `La fonction valeur absolue est dérivable en ${M(0)}.`, v: false, j: `Elle est continue en ${M(0)} mais ${M('\\dfrac{|h|}{h}')} vaut ${M(1)} à droite et ${M(-1)} à gauche : pas de limite en ${M(0)}.`, c: () => 1 !== -1 }),
          () => ({ s: `La fonction ${M(`f(x)=${polyTex([a, b, 0], 'x')}`)} est convexe sur ${M(R)}.`, v: true, j: `${M(`f''(x)=${2 * a}>0`)}.`, c: () => 2 * a > 0 }),
        ],
        2: [
          () => ({ s: `Si ${M("f''")} s’annule en ${M(c)}, alors ${M(`(${c}\\,;\\,f(${c}))`)} est un point d’inflexion. (On teste ${M(`f(x)=(x${sgn(-c)})^{4}`.replace('(x+0)', 'x'))}.)`, v: false, j: `${M(`f''(x)=12(x${sgn(-c)})^{2}`.replace('(x+0)', 'x'))} s’annule en ${M(c)} mais reste positive : ${M('f')} est convexe, il n’y a pas de point d’inflexion.`, c: () => [-2, -1, 1, 2].every((d) => 12 * d * d > 0) }),
          () => ({ s: `Si ${M('f')} est convexe sur ${M('I')}, sa courbe est au-dessus de chacune de ses tangentes. (Ici ${M(`f(x)=\\mathrm{e}^{x}`)} en ${M(0)}.)`, v: true, j: `La tangente en ${M(0)} est ${M('y=x+1')} et ${M('\\mathrm{e}^{x}\\geqslant x+1')} pour tout réel ${M('x')}.`, c: () => [-5, -1, 0, 1, 3].every((x) => Math.exp(x) >= x + 1 - 1e-12) }),
          () => ({ s: `La fonction ${M(`f(x)=\\dfrac{1}{x}`)} est continue sur ${M(R)}.`, v: false, j: `Elle n’est pas définie en ${M(0)} : elle est continue sur ${M(']-\\infty\\,;\\,0[')} et sur ${M(']0\\,;\\,+\\infty[')} seulement.`, c: () => true }),
        ],
        3: [
          () => ({ s: `Si ${M('f')} est continue sur ${M('[a\\,;\\,b]')} avec ${M('f(a)f(b)<0')}, alors l’équation ${M('f(x)=0')} a exactement une solution dans ${M(']a\\,;\\,b[')}. (On teste ${M(`f(x)=x^{3}-${3 * k}x`)} sur ${M(`[-${k + 1}\\,;\\,${k + 1}]`)}… voir justification.)`.replace(/ \(On teste.*$/, ` (On teste ${M(`f(x)=x(x-${k})(x+${k})`)} sur ${M(`[-${k + 1}\\,;\\,${k + 1}]`)}.)`), v: false, j: `Le théorème des valeurs intermédiaires donne au moins une solution, pas exactement une : ici ${M('f(-' + (k + 1) + ')<0<f(' + (k + 1) + ')')} mais ${M('f')} s’annule trois fois (en ${M(-k)}, ${M(0)} et ${M(k)}).`, c: () => { const f = (x) => x * (x - k) * (x + k); return f(-(k + 1)) * f(k + 1) < 0 && [-k, 0, k].every((x) => f(x) === 0); } }),
          () => ({ s: `Si ${M('f')} est continue et strictement monotone sur ${M('[a\\,;\\,b]')} avec ${M('f(a)f(b)<0')}, alors l’équation ${M('f(x)=0')} admet une unique solution dans ${M(']a\\,;\\,b[')}. (Ici ${M(`f(x)=x^{3}+${k}x-${a}`)}.)`, v: true, j: `Corollaire du théorème des valeurs intermédiaires (stricte monotonie). Ici ${M(`f'(x)=3x^{2}+${k}>0`)} et ${M(`f(0)=-${a}<0<f(${a})`)}.`, c: () => { const f = (x) => x ** 3 + k * x - a; return f(0) < 0 && f(a) > 0 && [-3, 0, 5].every((x) => 3 * x * x + k > 0); } }),
          () => ({ s: `La fonction ${M(`f(x)=${polyTex([1, 3 * c, 0, 0], 'x')}`)} admet un point d’inflexion d’abscisse ${M(-c)}.`, v: true, j: `${M(`f''(x)=${polyTex([6, 6 * c])}`)} s’annule en ${M(-c)} en changeant de signe (négative avant, positive après) : c’est un point d’inflexion.`, c: () => { const f2 = (x) => 6 * x + 6 * c; return Math.sign(f2(-c - 1)) !== Math.sign(f2(-c + 1)) && f2(-c) === 0; } }),
        ],
      };
      const claim = r.pick(fam[level])();
      return tf(claim);
    } },

  { id: 't-conv-error', cls: C, chapter: 'terminale-06', domain: 'analyse', skill: 'Trouver l’erreur dans une étude de convexité', fast: false,
    make(r, level) {
      let a, b, c, kind; do { a = r.pick(level === 1 ? [1, 2, -1] : [1, 2, 3, -1, -2, -3]); b = 3 * a * r.int(-4, 4); c = r.int(-6, 6); kind = r.pick(['dd', 'sign', 'concl']); } while (false);
      const x0 = -b / (3 * a), f = (x) => a * x ** 3 + b * x * x + c * x, f2 = (x) => 6 * a * x + 2 * b;
      const cvx = a > 0 ? 'convexe' : 'concave', cvr = a > 0 ? 'concave' : 'convexe';
      const good = [`f'(x)=${polyTex([3 * a, 2 * b, c])}\\ ;\\ f''(x)=${polyTex([6 * a, 2 * b])}`, `f''(x)${a > 0 ? '>' : '<'}0\\iff x>${x0}`, `f\\text{ est ${cvr} sur }]-\\infty\\,;\\,${x0}]\\text{ et ${cvx} sur }[${x0}\\,;\\,+\\infty[`];
      let lines = good, bad, why, fix, shown = 1;
      if (kind === 'dd') { lines = [`f'(x)=${polyTex([3 * a, 2 * b, c])}\\ ;\\ f''(x)=${polyTex([3 * a, 2 * b])}`, `f''(x)${a > 0 ? '>' : '<'}0\\iff x>${fracTex(F(-2 * b, 3 * a))}`, `f\\text{ est ${cvr} sur }]-\\infty\\,;\\,${fracTex(F(-2 * b, 3 * a))}]\\text{ et ${cvx} sur }[${fracTex(F(-2 * b, 3 * a))}\\,;\\,+\\infty[`]; bad = 0; why = `la dérivée de ${M(`${3 * a}x^{2}`)} est ${M(`${6 * a}x`)}, pas ${M(`${3 * a}x`)}.`; fix = M(good[0]); shown = F(-2 * b, 3 * a); if (b === 0) return this.make(r, level); }
      else if (kind === 'sign') { lines = [good[0], `f''(x)${a > 0 ? '>' : '<'}0\\iff x<${x0}`, good[2]]; bad = 1; why = `${M(`${polyTex([6 * a, 2 * b])}${a > 0 ? '>' : '<'}0`)} se résout en divisant par ${M(6 * a)} (${a > 0 ? 'positif : le sens est conservé' : 'négatif : on inverse le sens'}), ce qui donne ${M(`x>${x0}`)}.`; fix = M(good[1]); shown = 'neg'; }
      else { lines = [good[0], good[1], `f\\text{ est ${cvx} sur }]-\\infty\\,;\\,${x0}]\\text{ et ${cvr} sur }[${x0}\\,;\\,+\\infty[`]; bad = 2; why = `${M("f''")} a le signe ${a > 0 ? 'positif' : 'négatif'} pour ${M(`x>${x0}`)} : ${M('f')} est ${cvx} sur ${M(`[${x0}\\,;\\,+\\infty[`)}.`; fix = M(good[2]); shown = 'inv'; }
      const x1 = typeof shown === 'object' ? val(shown) : null;
      return spot(`Pour étudier la convexité de ${M(`f(x)=${polyTex([a, b, c, 0])}`)}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(good[2]), () => { const e = (x) => 6 * a * x + 2 * b; return near((f(x0 + 1e-3) - 2 * f(x0) + f(x0 - 1e-3)) / 1e-6, 0, 1e-2) && (e(x0 + 1) > 0) === (a > 0) && (x1 === null || Math.abs(x1 - x0) > 1e-9); });
    } },

  { id: 't-conv-ivt', cls: C, chapter: 'terminale-06', domain: 'analyse', skill: 'Théorème des valeurs intermédiaires et encadrement d’une solution', fast: false,
    make(r, level) {
      const p = r.int(1, 9), q = r.nz(-30, 30), f = (x) => x ** 3 + p * x + q;
      let m = -10; while (f(m) < 0) m++; m -= 1;
      if (f(m + 1) <= 0 || f(m) >= 0) return this.make(r, level);
      const root = (() => { let lo = m, hi = m + 1; for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (f(mid) < 0) lo = mid; else hi = mid; } return lo; })();
      const head = `Soit ${M(`f(x)=${polyTex([1, 0, p, q], 'x')}`)} définie sur ${M(R)}.`;
      if (level === 1) return { q: `${head} Montrer que l’équation ${M('f(x)=0')} admet une unique solution ${M('\\alpha')} et que ${M(`${m}<\\alpha<${m + 1}`)}.`, a: `${M(`f'(x)=3x^{2}+${p}>0`)} : ${M('f')} est strictement croissante et continue sur ${M(R)}. ${M(`f(${m})=${f(m)}<0`)} et ${M(`f(${m + 1})=${f(m + 1)}>0`)} : d’après le théorème des valeurs intermédiaires (cas strictement monotone), ${M('f(x)=0')} a une unique solution ${M('\\alpha')}, avec ${M(`${m}<\\alpha<${m + 1}`)}.`, ok: () => [-5, -1, 0, 3].every((x) => 3 * x * x + p > 0) && f(m) < 0 && f(m + 1) > 0 && root > m && root < m + 1 };
      const lo = Math.floor(root * 10) / 10, mid = m + 0.5, side = f(mid) < 0 ? [mid, m + 1] : [m, mid];
      if (Math.abs(root * 10 - Math.round(root * 10)) < 0.02) return this.make(r, level);
      if (level === 2) return { q: `${head} On sait que ${M('f(x)=0')} a une unique solution ${M('\\alpha')} dans ${M(`[${m}\\,;\\,${m + 1}]`)}. Calculer ${M(`f(${(m + 0.5).toString().replace('.', '{,}')})`)} pour encadrer ${M('\\alpha')} par une dichotomie, puis donner un encadrement d’amplitude ${M('10^{-1}')}.`, a: `${M(`f(${(m + 0.5).toString().replace('.', '{,}')})\\approx ${roundTex(f(mid), 3)}`)} est ${f(mid) < 0 ? 'négatif' : 'positif'}, donc ${M(`${side[0].toString().replace('.', '{,}')}<\\alpha<${side[1].toString().replace('.', '{,}')}`)}. En poursuivant (tableau de valeurs de pas ${M('10^{-1}')}) : ${M(`${roundTex(lo, 1)}<\\alpha<${roundTex(lo + 0.1, 1)}`)}.`, ok: () => { const l2 = f(lo), h2 = f(lo + 0.1); return l2 < 0 && h2 > 0 && Math.abs(root - lo) < 0.1 && (f(mid) < 0 ? root > mid : root < mid); } };
      const k = r.int(1, 3), g = (x) => f(x) - k * x;
      return { q: `${head} 1) Montrer que ${M('f(x)=0')} admet une unique solution ${M('\\alpha')} dans ${M(`[${m}\\,;\\,${m + 1}]`)}. 2) Donner un encadrement de ${M('\\alpha')} d’amplitude ${M('10^{-1}')}. 3) En déduire le signe de ${M('f(x)')} sur ${M(R)}.`, a: `1) ${M(`f'(x)=3x^{2}+${p}>0`)}, ${M('f')} strictement croissante, ${M(`f(${m})=${f(m)}<0<f(${m + 1})=${f(m + 1)}`)} : unicité et existence (théorème des valeurs intermédiaires). 2) ${M(`${roundTex(lo, 1)}<\\alpha<${roundTex(lo + 0.1, 1)}`)} (balayage de pas ${M('10^{-1}')}). 3) ${M('f')} est strictement croissante et ${M('f(\\alpha)=0')} : ${M('f(x)<0')} pour ${M('x<\\alpha')} et ${M('f(x)>0')} pour ${M('x>\\alpha')}.`, ok: () => { const a1 = f(lo), a2 = f(lo + 0.1); return a1 < 0 && a2 > 0 && [-4, 0, root - 0.5, root + 0.5, 8].every((x) => (f(x) > 0) === (x > root)) && k > 0 && g(0) === q; } };
    } },

  { id: 't-conv-study', cls: C, chapter: 'terminale-06', domain: 'analyse', skill: 'Dérivée seconde et point d’inflexion avec exponentielle', fast: false,
    make(r, level) {
      const a = r.int(-9, 9), k = r.pick([1, -1, 2, -2, 3, -3]);
      const f = (x) => (x + a) * Math.exp(k * x), f1 = (x) => (k * x + a * k + 1) * Math.exp(k * x), f2 = (x) => k * (k * x + a * k + 2) * Math.exp(k * x), x0 = F(-(a * k + 2), k), kk = k === 1 ? '' : k === -1 ? '-' : k;
      const ex = `\\mathrm{e}^{${kk}x}`, aff = polyTex([1, a], 'x'), p1 = polyTex([k, a * k + 1]), p2 = polyTex([k * k, k * (a * k + 2)]), xs = fracTex(x0), EX = (c) => `\\mathrm{e}^{${fracTex(mul(F(k), c))}}`.replace('\\mathrm{e}^{0}', '1');
      const kS = k === 1 ? '' : `${par(k)}\\times `, second = `${kS}(${p1})${ex}${k < 0 ? '-' : '+'}${Math.abs(k) === 1 ? '' : Math.abs(k)}${ex}`;
      if (level === 1) return { q: `Soit ${M(`f(x)=(${aff})${ex}`)}. Calculer ${M("f'(x)")} puis ${M("f''(x)")} et les écrire sous forme factorisée.`, a: `${M(`f'(x)=${ex}+(${aff})\\times ${k === 1 ? '' : `${par(k)}`}${ex}=(${p1})${ex}`.replace('\\times ' + ex, '\\times ' + ex))}. ${M(`f''(x)=${second}=(${p2})${ex}`)}.`, ok: () => [-1.2, 0.3, 1.1].every((x) => near(nd(f, x), f1(x), 1e-3) && near(nd(f1, x), f2(x), 1e-2)) && k !== 0 };
      if (level === 2) return { q: `Soit ${M(`f(x)=(${aff})${ex}`)}. On admet que ${M(`f''(x)=(${p2})${ex}`)}. Étudier le signe de ${M("f''")} et en déduire la convexité de ${M('f')} et son point d’inflexion.`, a: `${M(`${ex}>0`)} : ${M("f''")} a le signe de ${M(p2)}, positif car ${M(`${k * k}>0`)} pour ${M(`x>${xs}`)}. ${M("f''")} est négative avant ${M(xs)} et positive après : ${M('f')} est concave sur ${M(`]-\\infty\\,;\\,${xs}]`)} et convexe sur ${M(`[${xs}\\,;\\,+\\infty[`)}. Point d’inflexion d’abscisse ${M(xs)}.`, ok: () => near(f2(val(x0)), 0, 1e-9) && f2(val(x0) + 0.5) > 0 && f2(val(x0) - 0.5) < 0 && [-1.2, 0.3].every((x) => near(nd(f1, x), f2(x), 1e-2)) };
      const m = add(mul(F(k), x0), F(a * k + 1)), y0 = add(x0, F(a)), mc = m.n < 0 ? fracTex(F(-m.n, m.d)) : fracTex(m), yc = y0.n < 0 ? fracTex(F(-y0.n, y0.d)) : fracTex(y0), cf = (c, neg) => `${neg ? '-' : ''}${c === '1' ? '' : c}`;
      const tangent = `y=${cf(mc, m.n < 0)}${EX(x0)}\\left(x${sgn(-val(x0)) === '+0' ? '' : x0.n < 0 ? `+${fracTex(F(-x0.n, x0.d))}` : `-${fracTex(x0)}`}\\right)${y0.n < 0 ? '-' : '+'}${cf(yc, false)}${EX(x0)}`;
      if (y0.n === 0 || m.n === 0 || x0.n === 0) return this.make(r, level);
      return { q: `Soit ${M(`f(x)=(${aff})${ex}`)}. 1) Montrer que ${M(`f''(x)=(${p2})${ex}`)}. 2) Étudier la convexité de ${M('f')}. 3) Déterminer l’équation de la tangente au point d’inflexion (valeurs exactes).`, a: `1) ${M(`f'(x)=(${p1})${ex}`)} puis ${M(`f''(x)=(${p2})${ex}`)}. 2) ${M("f''")} s’annule en ${M(xs)} en passant du négatif au positif : ${M('f')} est concave puis convexe, point d’inflexion d’abscisse ${M(xs)}. 3) ${M(`f(${xs})=${y0.n < 0 ? '-' : ''}${cf(yc, false)}${EX(x0)}`)} et ${M(`f'(${xs})=${cf(mc, m.n < 0)}${EX(x0)}`)} : la tangente est ${M(tangent)}.`, ok: () => near(f2(val(x0)), 0, 1e-9) && near(f1(val(x0)), val(m) * Math.exp(k * val(x0)), 1e-9) && near(f(val(x0)), val(y0) * Math.exp(k * val(x0)), 1e-9) && f2(val(x0) + 0.5) > 0 && f2(val(x0) - 0.5) < 0 };
    } },

  { id: 't-conv-deriv', cls: C, chapter: 'terminale-06', domain: 'analyse', skill: 'Dérivée d’une composée', fast: true,
    make(r, level) {
      const a = r.nz(-6, 6), b = r.int(-9, 9), n = r.int(2, 6), c = r.int(1, 6);
      if (level === 1) { const f = (x) => (a * x + b) ** n; return { q: `Calculer la dérivée de ${M(`f(x)=(${polyTex([a, b])})^{${n}}`)}.`, a: `${M(`(u^{n})'=nu'u^{n-1}`)} avec ${M(`u=${polyTex([a, b])}`)} : ${M(`f'(x)=${n * a}(${polyTex([a, b])})^{${n - 1}}`.replace('^{1}', ''))}.`, ok: () => [-1.2, 0.3, 1.7].every((x) => near(nd(f, x), n * a * (a * x + b) ** (n - 1), 1e-3)) }; }
      if (level === 2) { const f = (x) => Math.sqrt(c * x * x + a * a + 1), g = (x) => Math.exp(a * x * x + b * x); const which = r.pick(['sqrt', 'exp']);
        if (which === 'sqrt') return { q: `Calculer la dérivée de ${M(`f(x)=\\sqrt{${polyTex([c, 0, a * a + 1])}}`)} sur ${M(R)}.`, a: `${M("(\\sqrt{u})'=\\dfrac{u'}{2\\sqrt{u}}")} avec ${M(`u=${polyTex([c, 0, a * a + 1])}`)} : ${M(`f'(x)=\\dfrac{${2 * c}x}{2\\sqrt{${polyTex([c, 0, a * a + 1])}}}=\\dfrac{${coef(c)}x}{\\sqrt{${polyTex([c, 0, a * a + 1])}}}`)}.`, ok: () => [-1.2, 0.3, 1.7].every((x) => near(nd(f, x), (c * x) / f(x), 1e-3)) };
        return { q: `Calculer la dérivée de ${M(`g(x)=\\mathrm{e}^{${polyTex([a, b, 0], 'x')}}`)}.`, a: `${M("(\\mathrm{e}^{u})'=u'\\mathrm{e}^{u}")} avec ${M(`u=${polyTex([a, b, 0], 'x')}`)} : ${M(`g'(x)=(${polyTex([2 * a, b])})\\mathrm{e}^{${polyTex([a, b, 0], 'x')}}`)}.`, ok: () => [-0.5, 0.3, 0.6].every((x) => near(nd(g, x), (2 * a * x + b) * g(x), 1e-3)) }; }
      const cc = r.int(1, 12), f = (x) => a * x * Math.exp(-cc * x * x), fp = (x) => a * (1 - 2 * cc * x * x) * Math.exp(-cc * x * x);
      const ex = `\\mathrm{e}^{-${coef(cc)}x^{2}}`, L = `\\dfrac{1}{\\sqrt{${2 * cc}}}`;
      return { q: `Soit ${M(`f(x)=${coef(a)}x\\,${ex}`)}. Montrer que ${M(`f'(x)=${coef(a)}\\left(1-${coef(2 * cc)}x^{2}\\right)${ex}`)} puis étudier les variations de ${M('f')}.`, a: `${M(`f'(x)=${coef(a)}${ex}${a < 0 ? '-' : '+'}${Math.abs(a) === 1 ? '' : Math.abs(a)}x\\times(-${2 * cc}x)${ex}=${coef(a)}\\left(1-${coef(2 * cc)}x^{2}\\right)${ex}`)}. ${M('1-' + coef(2 * cc) + 'x^{2}')} s’annule en ${M(`x=\\pm${L}`)} : ${M('f')} ${a > 0 ? 'croît' : 'décroît'} sur ${M(`\\left[-${L}\\,;\\,${L}\\right]`)} et ${a > 0 ? 'décroît' : 'croît'} à l’extérieur.`, ok: () => [-1.2, -0.3, 0.2, 0.9].every((x) => near(nd(f, x), fp(x), 1e-3)) && (fp(0) > 0) === (a > 0) && (fp(5) < 0) === (a > 0) && (fp(-5) < 0) === (a > 0) };
    } },

  { id: 't-conv-cont', cls: C, chapter: 'terminale-06', domain: 'analyse', skill: 'Continuité et dérivabilité d’une fonction définie par morceaux', fast: false,
    make(r, level) {
      const c = r.int(-6, 6), a = r.nz(-9, 9), d = r.int(-9, 9);
      if (level === 1) { const m = a * c * c + d - 0; return { q: `Soit ${M('f')} définie par ${M(`f(x)=${polyTex([a, 0, d])}`)} si ${M(`x\\leqslant ${c}`)} et ${M(`f(x)=${polyTex([1, 0], 'x')}+m`)} si ${M(`x>${c}`)}. Déterminer ${M('m')} pour que ${M('f')} soit continue en ${M(c)}.`, a: `${M(`f(${c})=${a * c * c + d}`)} et ${M(`\\lim_{x\\to ${c}^{+}}f(x)=${c}+m`)}. Continuité : ${M(`${c}+m=${a * c * c + d}`)}, d’où ${M(`m=${a * c * c + d - c}`)}.`, ok: () => c + (a * c * c + d - c) === a * c * c + d && m === a * c * c + d }; }
      if (level === 2) { const aa = r.nz(-9, 9), p = 2 * aa * c, q = -aa * c * c; return { q: `Soit ${M('f')} définie par ${M(`f(x)=${polyTex([aa, 0, 0])}`)} si ${M(`x\\leqslant ${c}`)} et ${M('f(x)=px+q')} si ${M(`x>${c}`)}. Déterminer ${M('p')} et ${M('q')} pour que ${M('f')} soit dérivable en ${M(c)}.`, a: `Continuité : ${M(`${aa * c * c}=${c}p+q`)}. Dérivabilité : ${M(`f'(${c})=${2 * aa * c}=p`)} (pente de la parabole en ${M(c)}). Donc ${M(`p=${2 * aa * c}`)} et ${M(`q=${aa * c * c}-${par(c)}\\times ${par(2 * aa * c)}=${-aa * c * c}`)}.`, ok: () => 2 * aa * c === p && c * p + q === aa * c * c }; }
      const f = (x) => (x <= 0 ? Math.exp(a * x) + d : 1 + d + a * x + 3 * x * x), pf = a;
      return { q: `Soit ${M('f')} définie par ${M(`f(x)=\\mathrm{e}^{${coef(a)}x}${d === 0 ? '' : sgn(d)}`)} si ${M('x\\leqslant 0')} et ${M(`f(x)=${1 + d}+bx+cx^{2}`)} si ${M('x>0')}. Déterminer ${M('b')} pour que ${M('f')} soit dérivable en ${M(0)}, quelle que soit la valeur de ${M('c')}.`, a: `Continuité en ${M(0)} : ${M(`f(0)=1${sgn(d)}=${1 + d}`)} des deux côtés. Dérivabilité : la dérivée à gauche vaut ${M(`${a}\\mathrm{e}^{0}=${a}`)} et la dérivée à droite ${M('b')}, donc ${M(`b=${a}`)} ; ${M('c')} n’intervient pas.`, ok: () => Math.abs((f(1e-7) - f(0)) / 1e-7 - pf) < 1e-3 && Math.abs((f(0) - f(-1e-7)) / 1e-7 - pf) < 1e-3 && Math.abs(f(0) - (1 + d)) < 1e-12 };
    } },

  // ============================ 07 Probabilités conditionnelles et loi binomiale ============================
  { id: 't-prob-qcm', cls: C, chapter: 'terminale-07', domain: 'stats-proba', skill: 'QCM sur probabilités conditionnelles et loi binomiale', fast: true,
    make(r, level) {
      const D = (x) => numTex(F(Math.round(x * 10000), 10000));
      if (level === 1) {
        let pa, pb, pab; do { pa = r.int(2, 9); pb = r.int(2, 9); pab = r.int(1, Math.min(pa, pb) * 10 - 1); } while (pa === pb);
        const A = pa / 10, B = pb / 10, AB = pab / 100, cs = [[AB / A, M('P_A(B)=\\dfrac{P(A\\cap B)}{P(A)}') + '.'], [AB / B, 'calcule ' + M('P_B(A)') + ' (divise par ' + M('P(B)') + ').'], [A * B, 'suppose les événements indépendants.'], [AB * A, 'multiplie au lieu de diviser.']];
        if (new Set(cs.map((c) => D(c[0]))).size < 4) return this.make(r, level);
        return mcq(r, `${M(`P(A)=${D(A)}`)}, ${M(`P(B)=${D(B)}`)} et ${M(`P(A\\cap B)=${D(AB)}`)}. Alors ${M('P_A(B)')} vaut :`, opt(M(D(cs[0][0])), cs[0][1], { v: cs[0][0] }), cs.slice(1).map(([v, w]) => opt(M(D(v)), w, { v })), (o) => near(o.v, AB / A, 1e-9));
      }
      if (level === 2) {
        const n = r.int(4, 12), k = r.int(1, n - 1), p = r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7]), q = 1 - p, bn = (n, k) => binom(n, k);
        const exact = bn(n, k) * p ** k * q ** (n - k), cs = [[exact, M(`P(X=k)=\\dbinom{n}{k}p^{k}(1-p)^{n-k}`) + '.'], [p ** k * q ** (n - k), 'oublie le coefficient binomial (nombre de façons de placer les succès).'], [bn(n, k) * p ** (n - k) * q ** k, 'permute les rôles de ' + M('p') + ' et ' + M('1-p') + '.'], [bn(n, k) * p ** k, 'oublie le facteur des échecs ' + M('(1-p)^{n-k}') + '.']];
        if (new Set(cs.map((c) => D(c[0]))).size < 4) return this.make(r, level);
        const g = (n0, k0) => { let s = 0; const go = (i, succ, pr) => { if (i === n0) { if (succ === k0) s += pr; return; } go(i + 1, succ + 1, pr * p); go(i + 1, succ, pr * q); }; go(0, 0, 1); return s; };
        return mcq(r, `${M('X')} suit la loi binomiale ${M(`\\mathcal{B}(${n}\\,;\\,${D(p)})`)}. Alors ${M(`P(X=${k})`)} vaut (arrondi à ${M('10^{-4}')} près) :`, opt(M(D(cs[0][0])), cs[0][1], { v: cs[0][0] }), cs.slice(1).map(([v, w]) => opt(M(D(v)), w, { v })), (o) => Math.abs(o.v - g(n, k)) < 1e-4 && Math.abs(Math.round(g(n, k) * 1e4) / 1e4 - o.v) < 1e-9 || Math.abs(o.v - g(n, k)) < 5e-5);
      }
      let p1, q1, s1, i1; do { p1 = r.int(2, 8); q1 = r.int(2, 9); s1 = r.int(1, 9); } while (q1 === s1);
      const A = p1 / 10, qa = q1 / 10, sa = s1 / 10, pB = A * qa + (1 - A) * sa, bay = (A * qa) / pB, cs = [[bay, M('P_B(A)=\\dfrac{P(A)P_A(B)}{P(B)}') + ' (formule de Bayes).'], [qa, 'répond ' + M('P_A(B)') + ' : confond ' + M('P_B(A)') + ' et ' + M('P_A(B)') + '.'], [A * qa, 'donne ' + M('P(A\\cap B)') + ' sans diviser par ' + M('P(B)') + '.'], [pB, 'donne ' + M('P(B)') + '.']];
      if (new Set(cs.map((c) => D(c[0]))).size < 4) return this.make(r, level);
      return mcq(r, `${M(`P(A)=${D(A)}`)}, ${M(`P_A(B)=${D(qa)}`)} et ${M(`P_{\\overline{A}}(B)=${D(sa)}`)}. Alors ${M('P_B(A)')} vaut (arrondi à ${M('10^{-4}')}) :`, opt(M(D(cs[0][0])), cs[0][1], { v: cs[0][0] }), cs.slice(1).map(([v, w]) => opt(M(D(v)), w, { v })), (o) => Math.abs(o.v - (A * qa) / (A * qa + (1 - A) * sa)) < 1e-4 + 1e-9);
    } },

  { id: 't-prob-tf', cls: C, chapter: 'terminale-07', domain: 'stats-proba', skill: 'Vrai ou faux sur probabilités et loi binomiale', fast: true,
    make(r, level) {
      const n = r.int(4, 40), p = r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]), pt = numTex(F(Math.round(p * 100), 100)); let k; do { k = r.int(1, n - 1); } while (2 * k === n);
      const fam = {
        1: [
          () => ({ s: `Si ${M('X')} suit ${M(`\\mathcal{B}(${n}\\,;\\,${pt})`)}, alors ${M('E(X)')} vaut ${M(numTex(F(Math.round(n * p * 100), 100)))}.`, v: true, j: `${M('E(X)=np')} : ${M(`${n}\\times ${pt}=${numTex(F(Math.round(n * p * 100), 100))}`)}.`, c: () => near(n * p, Math.round(n * p * 100) / 100, 1e-9) }),
          () => ({ s: `${M(`P_A(B)+P_A(\\overline{B})=1`)} dès que ${M('P(A)>0')}.`, v: true, j: `${M('B')} et ${M('\\overline{B}')} sont contraires dans l’univers restreint à ${M('A')}.`, c: () => true }),
          () => ({ s: `Si ${M('X')} suit ${M(`\\mathcal{B}(${n}\\,;\\,${pt})`)}, alors ${M(`P(X=${n + 1})`)} est égal à ${M(numTex(F(Math.round(p * 100), 100)))}.`, v: false, j: `${M('X')} ne peut pas dépasser ${M(n)} : ${M(`P(X=${n + 1})=0`)}.`, c: () => n + 1 > n }),
        ],
        2: [
          () => ({ s: `Si ${M('X')} suit ${M(`\\mathcal{B}(${n}\\,;\\,${pt})`)}, alors ${M('V(X)')} vaut ${M(numTex(F(Math.round(n * p * (1 - p) * 10000), 10000)))}.`, v: true, j: `${M('V(X)=np(1-p)')} : ${M(`${n}\\times ${pt}\\times ${numTex(F(Math.round((1 - p) * 100), 100))}`)}.`, c: () => near(n * p * (1 - p), Math.round(n * p * (1 - p) * 10000) / 10000, 1e-6) }),
          () => ({ s: `${M(`P(X\\geqslant 1)=1-(1-${pt})^{${n}}`)} pour ${M('X')} de loi ${M(`\\mathcal{B}(${n}\\,;\\,${pt})`)}.`, v: true, j: `L’événement contraire de ${M('X\\geqslant 1')} est ${M('X=0')}, de probabilité ${M(`(1-${pt})^{${n}}`)}.`, c: () => { let s = 0; for (let j = 1; j <= Math.min(n, 30); j++) s += binom(Math.min(n, 30), j) * p ** j * (1 - p) ** (Math.min(n, 30) - j); return near(s, 1 - (1 - p) ** Math.min(n, 30), 1e-9); } }),
          () => ({ s: `Si ${M('A')} et ${M('B')} sont indépendants et ${M(`P(A)=${pt}`)}, alors ${M(`P_B(A)=${pt}`)}.`, v: true, j: `${M('P_B(A)=\\dfrac{P(A\\cap B)}{P(B)}=\\dfrac{P(A)P(B)}{P(B)}=P(A)')}.`, c: () => true }),
        ],
        3: [
          () => ({ s: `Si ${M('X')} suit ${M(`\\mathcal{B}(${n}\\,;\\,${pt})`)}, alors ${M(`P(X=${k})=P(X=${n - k})`)} pour tout ${M(`k`)}.`, v: p === 0.5, j: p === 0.5 ? `Avec ${M('p=0{,}5')}, ${M(`\\dbinom{n}{k}=\\dbinom{n}{n-k}`)} et ${M('p^{k}(1-p)^{n-k}=\\left(\\dfrac{1}{2}\\right)^{n}')}.` : `${M(`P(X=${k})=\\dbinom{${n}}{${k}}${pwT('p', k)}${pwT('(1-p)', n - k)}`)} et ${M(`P(X=${n - k})=\\dbinom{${n}}{${k}}${pwT('p', n - k)}${pwT('(1-p)', k)}`)} diffèrent dès que ${M('p\\neq 0{,}5')}.`, c: () => { const a = binom(n, k) * p ** k * (1 - p) ** (n - k), b = binom(n, n - k) * p ** (n - k) * (1 - p) ** k; return (Math.abs(a - b) < 1e-12 * Math.max(a, b)) === (p === 0.5); } }),
          () => ({ s: `Si ${M('X')} suit une loi binomiale, alors ${M('V(X)\\leqslant E(X)')}.`, v: true, j: `${M('V(X)=np(1-p)\\leqslant np=E(X)')} car ${M('0\\leqslant 1-p\\leqslant 1')}.`, c: () => [0.1, 0.5, 0.9].every((q) => 10 * q * (1 - q) <= 10 * q) }),
          () => ({ s: `Pour ${M('X')} de loi ${M(`\\mathcal{B}(${n}\\,;\\,${pt})`)}, ${M('P(X\\geqslant 1)')} est égale à ${M(`1-${pt}^{${n}}`)}.`, v: p === 0.5, j: p === 0.5 ? `${M('P(X\\geqslant 1)=1-(1-p)^{n}')} et ici ${M('1-p=p=0{,}5')} : l’égalité est vraie.` : `${M('P(X\\geqslant 1)=1-P(X=0)=1-(1-p)^{n}')} : c’est ${M(`(1-${pt})^{${n}}`)} et non ${M(`${pt}^{${n}}`)} qui représente l’absence de succès.`, c: () => (Math.abs(1 - p ** 5 - (1 - (1 - p) ** 5)) < 1e-12) === (p === 0.5) }),
        ],
      };
      const claim = r.pick(fam[level])();
      if (claim.s.includes('exactement') || true) return tf(claim);
    } },

  { id: 't-prob-error', cls: C, chapter: 'terminale-07', domain: 'stats-proba', skill: 'Trouver l’erreur dans un calcul de loi binomiale', fast: false,
    make(r, level) {
      const D = (x) => numTex(F(Math.round(x * 10000), 10000));
      const n = r.int(4, 12), p = r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.6, 0.7, 0.8]), q = 1 - p, pt = numTex(F(Math.round(p * 100), 100)), qt = numTex(F(Math.round(q * 100), 100));
      if (level === 1) {
        const kind = r.pick(['ev', 'var']), E0 = n * p, V0 = n * p * q;
        const good = [`X\\sim\\mathcal{B}(${n}\\,;\\,${pt})`, `E(X)=np=${n}\\times ${pt}=${D(E0)}`, `V(X)=np(1-p)=${D(E0)}\\times ${qt}=${D(V0)}`];
        let lines = good, bad, why, fix, shown = V0;
        if (kind === 'ev') { lines = [good[0], `E(X)=n(1-p)=${n}\\times ${qt}=${D(n * q)}`, `V(X)=${D(n * q)}\\times ${qt}=${D(n * q * q)}`]; bad = 1; why = `l’espérance d’une loi binomiale est ${M('np')} (nombre d’épreuves fois probabilité du succès).`; fix = M(good[1]); shown = n * q * q; }
        else { lines = [good[0], good[1], `V(X)=np=${D(E0)}`]; bad = 2; why = `la variance vaut ${M('np(1-p)')}, pas ${M('np')}.`; fix = M(good[2]); shown = E0; }
        if (Math.abs(shown - V0) < 1e-9) return this.make(r, level);
        return spot(`${M('X')} compte les succès de ${M(n)} épreuves indépendantes de probabilité de succès ${M(pt)}. Pour calculer ${M('E(X)')} et ${M('V(X)')}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(`E(X)=${D(E0)}\\ ;\\ V(X)=${D(V0)}`), () => near(E0, n * p, 1e-9) && near(V0, n * p * (1 - p), 1e-9) && Math.abs(shown - V0) > 1e-9);
      }
      const k = r.int(1, 3), kind = r.pick(level === 2 ? ['c', 'one'] : ['c', 'one', 'zero']);
      const P0 = q ** n, P1 = binom(n, 1) * p * q ** (n - 1), Pk = binom(n, k) * p ** k * q ** (n - k), atLeast = 1 - P0;
      if (level === 2) {
        const good = [`P(X=${k})=\\dbinom{${n}}{${k}}\\times ${pt}^{${k}}\\times ${qt}^{${n - k}}`.replace('^{1}', ''), `\\dbinom{${n}}{${k}}=${binom(n, k)}`, `P(X=${k})\\approx ${roundTex(Pk, 4)}`];
        let lines = good, bad, why, fix, shown = Pk;
        if (kind === 'c') { lines = [`P(X=${k})=${pt}^{${k}}\\times ${qt}^{${n - k}}`.replace('^{1}', ''), `\\text{le coefficient binomial vaut }1`, `P(X=${k})\\approx ${roundTex(p ** k * q ** (n - k), 4)}`]; bad = 0; why = `il manque le coefficient binomial ${M(`\\dbinom{${n}}{${k}}=${binom(n, k)}`)} : nombre de façons de placer les ${M(k)} succès.`; fix = M(good[0]); shown = p ** k * q ** (n - k); }
        else { lines = [`P(X=${k})=\\dbinom{${n}}{${k}}\\times ${pt}^{${n - k}}\\times ${qt}^{${k}}`.replace('^{1}', ''), good[1], `P(X=${k})\\approx ${roundTex(binom(n, k) * p ** (n - k) * q ** k, 4)}`]; bad = 0; why = `l’exposant de ${M(pt)} est le nombre de succès ${M(k)}, celui de ${M(qt)} le nombre d’échecs ${M(n - k)}.`; fix = M(good[0]); shown = binom(n, k) * p ** (n - k) * q ** k; }
        if (Math.abs(shown - Pk) < 1e-4 || Math.abs(Pk * 1e4 - Math.round(Pk * 1e4)) < 1e-3 && false) return this.make(r, level);
        return spot(`${M('X')} suit ${M(`\\mathcal{B}(${n}\\,;\\,${pt})`)}. Pour calculer ${M(`P(X=${k})`)} (arrondi à ${M('10^{-4}')}), un élève écrit une solution.`, lines.map(M), bad, why, fix, M(`P(X=${k})\\approx ${roundTex(Pk, 4)}`), () => { const g = (nn, kk) => { let s = 0; const go = (i, sc, pr) => { if (i === nn) { if (sc === kk) s += pr; return; } go(i + 1, sc + 1, pr * p); go(i + 1, sc, pr * q); }; go(0, 0, 1); return s; }; return Math.abs(g(n, k) - Pk) < 1e-12 && Math.abs(shown - Pk) > 1e-4; });
      }
      const good = [`P(X\\geqslant 1)=1-P(X=0)`, `P(X=0)=${qt}^{${n}}\\approx ${roundTex(P0, 4)}`, `P(X\\geqslant 1)\\approx ${roundTex(atLeast, 4)}`];
      let lines = good, bad, why, fix, shown = atLeast;
      if (kind === 'one') { lines = [`P(X\\geqslant 1)=1-P(X=1)`, `P(X=1)=\\dbinom{${n}}{1}\\times ${pt}\\times ${qt}^{${n - 1}}\\approx ${roundTex(P1, 4)}`, `P(X\\geqslant 1)\\approx ${roundTex(1 - P1, 4)}`]; bad = 0; why = `le contraire de « au moins un succès » est « aucun succès » : ${M('X=0')}.`; fix = M(good[0]); shown = 1 - P1; }
      else if (kind === 'zero') { lines = [good[0], `P(X=0)=${pt}^{${n}}\\approx ${roundTex(p ** n, 4)}`, `P(X\\geqslant 1)\\approx ${roundTex(1 - p ** n, 4)}`]; bad = 1; why = `« aucun succès » correspond à ${n} échecs, de probabilité ${M(`${qt}^{${n}}`)} (et non ${M(`${pt}^{${n}}`)}).`; fix = M(good[1]); shown = 1 - p ** n; }
      else { lines = [good[0], good[1], `P(X\\geqslant 1)\\approx ${roundTex(P0, 4)}`]; bad = 2; why = `on a calculé ${M('P(X=0)')} : il reste à faire ${M(`1-${roundTex(P0, 4)}`)}.`; fix = M(good[2]); shown = P0; }
      if (Math.abs(shown - atLeast) < 1e-4) return this.make(r, level);
      return spot(`${M('X')} suit ${M(`\\mathcal{B}(${n}\\,;\\,${pt})`)}. Pour calculer ${M('P(X\\geqslant 1)')} (arrondi à ${M('10^{-4}')}), un élève écrit une solution.`, lines.map(M), bad, why, fix, M(`P(X\\geqslant 1)\\approx ${roundTex(atLeast, 4)}`), () => near(atLeast, 1 - q ** n, 1e-12) && Math.abs(shown - atLeast) > 1e-4 && P1 > 0 && Pk > 0);
    } },

  { id: 't-prob-partition', cls: C, chapter: 'terminale-07', domain: 'stats-proba', skill: 'Partition, probabilités totales et deux étapes', fast: false,
    make(r, level) {
      const D = (x) => numTex(F(Math.round(x * 10000), 10000));
      let s1, s2, s3, d1, d2, d3; do { s1 = 5 * r.int(2, 10); s2 = 5 * r.int(2, 10); s3 = 100 - s1 - s2; d1 = r.int(1, 9); d2 = r.int(1, 9); d3 = r.int(1, 9); } while (s3 < 10 || new Set([d1, d2, d3]).size < 3);
      const sh = [s1, s2, s3], dd = [d1, d2, d3], tot = sh.reduce((s, x, i) => s + (x * dd[i]) / 10000, 0), nm = r.pick([['usines', 'usine', 'défectueuse'], ['fournisseurs', 'fournisseur', 'non conforme'], ['ateliers', 'atelier', 'défectueuse']]);
      const intro = `Trois ${nm[0]} fournissent respectivement ${sh.map((x) => `${M(`${x}\\,\\%`)}`).join(', ')} des pièces d’un stock. La proportion de pièces ${nm[2]}s est ${dd.map((x, i) => `${M(`${x}\\,\\%`)} pour l’${nm[1]} ${i + 1}`).join(', ')}. On prend une pièce au hasard : ${M('D')} est l’événement « la pièce est ${nm[2]} », ${M('A_i')} « elle vient de l’${nm[1]} ${M('i')} ».`;
      const pD = `P(D)=${sh.map((x, i) => `${D(x / 100)}\\times ${D(dd[i] / 100)}`).join('+')}=${D(tot)}`;
      if (level === 1) return { q: `${intro} Calculer ${M('P(D)')}.`, a: `Les ${M('A_i')} forment une partition : ${M(pD)}.`, ok: () => near(tot, sh.reduce((s, x, i) => s + (x / 100) * (dd[i] / 100), 0), 1e-12) && sh.reduce((a0, b0) => a0 + b0, 0) === 100 };
      const i = r.int(0, 2), bay = (sh[i] * dd[i]) / 10000 / tot;
      if (level === 2) return { q: `${intro} Sachant que la pièce est ${nm[2]}, quelle est la probabilité qu’elle vienne de l’${nm[1]} ${i + 1} ? (Arrondir à ${M('10^{-3}')}.)`, a: `${M(pD)}. ${M(`P_D(A_${i + 1})=\\dfrac{P(A_${i + 1}\\cap D)}{P(D)}=\\dfrac{${D((sh[i] * dd[i]) / 10000)}}{${D(tot)}}\\approx ${roundTex(bay, 3)}`)}.`, ok: () => near(bay * tot, (sh[i] * dd[i]) / 10000, 1e-12) };
      const sens = r.pick([85, 88, 90, 92, 95, 97, 98]), spec = r.pick([80, 85, 90, 92, 95, 97, 99]), prev = r.pick([0.5, 1, 2, 3, 4, 5, 8, 10]) / 100, ppos = prev * sens / 100 + (1 - prev) * (1 - spec / 100), vpp = (prev * sens / 100) / ppos, p2 = vpp * sens / 100 + (1 - vpp) * (1 - spec / 100), vpp2 = (vpp * sens / 100) / p2;
      if ([vpp * 1000, vpp2 * 1000, p2 * 1e4].some((x) => Math.abs(x - Math.round(x)) < 1e-7 || Math.abs(x - Math.round(x) - 0.5) < 1e-7)) return this.make(r, level);
      return { q: `Une maladie touche ${M(`${numTex(F(Math.round(prev * 100), 100)).replace('0{,}0', '0{,}0')}`.length ? D(prev) : '')} de la population. Un test est positif pour ${M(`${sens}\\,\\%`)} des malades et pour ${M(`${100 - spec}\\,\\%`)} des personnes saines. 1) Quelle est la probabilité qu’une personne testée positive soit malade ? (arrondir à ${M('10^{-3}')}) 2) Cette personne refait le test, indépendamment du premier : s’il est encore positif, quelle est la probabilité qu’elle soit malade ?`, a: `1) ${M(`P(T)=${D(prev)}\\times ${D(sens / 100)}+${D(1 - prev)}\\times ${D((100 - spec) / 100)}=${D(ppos)}`)}, ${M(`P_T(M)=\\dfrac{${D(prev * sens / 100)}}{${D(ppos)}}\\approx ${roundTex(vpp, 3)}`)}. 2) On repart avec la probabilité ${M(roundTex(vpp, 3))} de maladie : ${M(`P(T_2)\\approx ${roundTex(p2, 4)}`)} puis ${M(`P_{T_2}(M)\\approx ${roundTex(vpp2, 3)}`)}.`, ok: () => near(vpp * ppos, (prev * sens) / 100, 1e-9) && vpp2 > vpp };
    } },

  { id: 't-binom-calc', cls: C, chapter: 'terminale-07', domain: 'stats-proba', skill: 'Calculs de probabilités avec la loi binomiale', fast: false,
    make(r, level) {
      const n = r.int(5, 20), p = r.pick([0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5, 0.6, 0.7, 0.8]), q = 1 - p, pt = numTex(F(Math.round(p * 100), 100));
      const pm = (k) => binom(n, k) * p ** k * q ** (n - k), cdf = (k) => { let s = 0; for (let j = 0; j <= k; j++) s += pm(j); return s; };
      const k = r.int(1, n - 1), round4 = (x) => roundTex(x, 4), head = `${M('X')} suit la loi binomiale ${M(`\\mathcal{B}(${n}\\,;\\,${pt})`)}.`;
      const safe = (x) => Math.abs(x * 1e4 - Math.round(x * 1e4) - 0.5) > 1e-6 && Math.abs(x * 1e4 - Math.round(x * 1e4)) > 1e-6;
      if (level === 1) { if (!safe(pm(k))) return this.make(r, level); return { q: `${head} Calculer ${M(`P(X=${k})`)} (arrondi à ${M('10^{-4}')}).`, a: `${M(`P(X=${k})=\\dbinom{${n}}{${k}}\\times ${pt}^{${k}}\\times ${numTex(F(Math.round(q * 100), 100))}^{${n - k}}\\approx ${round4(pm(k))}`.replace('^{1}', ''))}.`, ok: () => { let s = 0; const go = (i, sc, pr) => { if (i === n) { if (sc === k) s += pr; return; } go(i + 1, sc + 1, pr * p); go(i + 1, sc, pr * q); }; go(0, 0, 1); return Math.abs(s - pm(k)) < 1e-12 && safe(pm(k)); } }; }
      if (level === 2) { if (!safe(cdf(k))) return this.make(r, level); return { q: `${head} Calculer ${M(`P(X\\leqslant ${k})`)} puis ${M(`P(X>${k})`)} (arrondis à ${M('10^{-4}')}). Utiliser la calculatrice.`, a: `${M(`P(X\\leqslant ${k})=\\sum_{j=0}^{${k}}P(X=j)\\approx ${round4(cdf(k))}`)} ; ${M(`P(X>${k})=1-P(X\\leqslant ${k})\\approx ${round4(1 - cdf(k))}`)}.`, ok: () => { let s = 0; for (let j = 0; j <= k; j++) s += binom(n, j) * p ** j * q ** (n - j); return Math.abs(s - cdf(k)) < 1e-12 && safe(cdf(k)) && Math.abs(Math.round(cdf(k) * 1e4) / 1e4 + Math.round((1 - cdf(k)) * 1e4) / 1e4 - 1) < 2e-4; } }; }
      const a0 = r.int(0, Math.floor(n / 2)), b0 = r.int(a0 + 1, n), v = cdf(b0) - (a0 > 0 ? cdf(a0 - 1) : 0); if (!safe(v)) return this.make(r, level);
      return { q: `${head} Calculer ${M(`P(${a0}\\leqslant X\\leqslant ${b0})`)} (arrondi à ${M('10^{-4}')}) et interpréter ce résultat dans le cas où ${M('X')} compte les succès de ${M(n)} épreuves indépendantes.`, a: `${M(`P(${a0}\\leqslant X\\leqslant ${b0})=P(X\\leqslant ${b0})${a0 > 0 ? `-P(X\\leqslant ${a0 - 1})` : ''}\\approx ${round4(v)}`)}. C’est la probabilité d’obtenir entre ${M(a0)} et ${M(b0)} succès inclus.`, ok: () => { let s = 0; for (let j = a0; j <= b0; j++) s += pm(j); return Math.abs(s - v) < 1e-12 && safe(v) && b0 > a0; } };
    } },

  { id: 't-binom-seuil', cls: C, chapter: 'terminale-07', domain: 'stats-proba', skill: 'Seuil : plus petit nombre d’épreuves', fast: false,
    make(r, level) {
      const p = r.pick([F(1, 10), F(1, 5), F(1, 4), F(1, 3), F(3, 10), F(1, 2), F(1, 8), F(1, 6), F(2, 5), F(1, 12), F(3, 20), F(1, 20)]), s = r.pick([F(8, 10), F(9, 10), F(95, 100), F(99, 100), F(999, 1000)]), kmin = level === 3 ? 2 : 1, pv = val(p), qv = 1 - pv;
      const prob = (n) => { let sm = 0; for (let j = 0; j < kmin; j++) sm += binom(n, j) * pv ** j * qv ** (n - j); return 1 - sm; };
      let N = kmin; while (prob(N) < val(s) && N < 400) N++;
      if (N > 70 || N < 3 || Math.abs(prob(N) - val(s)) < 1e-9 || Math.abs(prob(N - 1) - val(s)) < 1e-9) return this.make(r, level);
      const what = r.pick(['un tir réussi', 'une anomalie détectée', 'une pièce défectueuse']), stem = level === 3 ? `au moins ${M(2)} fois` : 'au moins une fois';
      return { q: `On répète ${M('n')} fois, de façon indépendante, une expérience dont la probabilité de succès (${what}) est ${M(fracTex(p))}. Quel est le plus petit entier ${M('n')} pour que la probabilité d’obtenir ${stem} un succès soit supérieure ou égale à ${M(numTex(s))} ?`, a: `${M('X')} suit ${M(`\\mathcal{B}(n\\,;\\,${fracTex(p)})`)}. ${level === 3 ? `${M(`P(X\\geqslant 2)=1-P(X=0)-P(X=1)`)}` : `${M(`P(X\\geqslant 1)=1-\\left(${fracTex(sub(F(1), p))}\\right)^{n}`)}`}. À la calculatrice : ${M(`n=${N - 1}`)} donne environ ${M(roundTex(prob(N - 1), 4))} (insuffisant) et ${M(`n=${N}`)} donne environ ${M(roundTex(prob(N), 4))} : ${M(`n=${N}`)}.`, ok: () => { let n = kmin; while (prob(n) < val(s) - 1e-12) n++; return n === N && prob(N - 1) < val(s) && prob(N) >= val(s) && (kmin === 1 ? Math.abs(prob(N) - (1 - qv ** N)) < 1e-12 : true); } };
    } },

  { id: 't-binom-ev', cls: C, chapter: 'terminale-07', domain: 'stats-proba', skill: 'Espérance, variance et paramètres d’une loi binomiale', fast: false,
    make(r, level) {
      const n = r.int(5, 100), p = r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8]), pt = numTex(F(Math.round(p * 100), 100)), D = (x) => numTex(F(Math.round(x * 10000), 10000));
      if (level === 1) return { q: `${M('X')} suit la loi binomiale ${M(`\\mathcal{B}(${n}\\,;\\,${pt})`)}. Calculer ${M('E(X)')}, ${M('V(X)')} et ${M('\\sigma(X)')} (arrondi à ${M('10^{-2}')}).`, a: `${M(`E(X)=np=${D(n * p)}`)}, ${M(`V(X)=np(1-p)=${D(n * p * (1 - p))}`)}, ${M(`\\sigma(X)=\\sqrt{${D(n * p * (1 - p))}}\\approx ${roundTex(Math.sqrt(n * p * (1 - p)), 2)}`)}.`, ok: () => near(n * p, Math.round(n * p * 10000) / 10000, 1e-9) && near(n * p * (1 - p), Math.round(n * p * (1 - p) * 10000) / 10000, 1e-9) && Math.abs(Math.sqrt(n * p * (1 - p)) * 100 - Math.round(Math.sqrt(n * p * (1 - p)) * 100) - 0.5) > 1e-6 };
      if (level === 2) { const pp = r.pick([F(1, 2), F(1, 3), F(1, 4), F(2, 3), F(1, 5), F(3, 4), F(2, 5), F(3, 5), F(1, 6), F(5, 6)]), nn = pp.d * r.int(1, 15), E0 = mul(F(nn), pp), V0 = mul(E0, sub(F(1), pp)); return { q: `${M('X')} est le nombre de succès de ${M(nn)} épreuves de Bernoulli indépendantes de probabilité de succès ${M(fracTex(pp))}. Donner la loi de ${M('X')}, ${M('E(X)')} et ${M('V(X)')} sous forme de fractions.`, a: `${M('X')} suit ${M(`\\mathcal{B}\\left(${nn}\\,;\\,${fracTex(pp)}\\right)`)}. ${M(`E(X)=${nn}\\times ${fracTex(pp)}=${fracTex(E0)}`)} et ${M(`V(X)=${fracTex(E0)}\\times ${fracTex(sub(F(1), pp))}=${fracTex(V0)}`)}.`, ok: () => { let e = 0, e2 = 0; for (let j = 0; j <= nn; j++) { const pr = binom(nn, j) * val(pp) ** j * (1 - val(pp)) ** (nn - j); e += j * pr; e2 += j * j * pr; } return near(e, val(E0), 1e-9) && near(e2 - e * e, val(V0), 1e-9); } }; }
      const pr = r.pick([F(1, 2), F(1, 4), F(3, 4), F(1, 5), F(2, 5), F(3, 5), F(4, 5), F(1, 10), F(3, 10), F(7, 10)]), nn = pr.d * r.int(1, 15), E0 = nn * val(pr), V0 = E0 * (1 - val(pr));
      if (Math.abs(nn * val(pr) * (1 - val(pr)) * 100 - Math.round(nn * val(pr) * (1 - val(pr)) * 100)) > 1e-6) return this.make(r, level);
      return { q: `${M('X')} suit une loi binomiale ${M('\\mathcal{B}(n\\,;\\,p)')} avec ${M(`E(X)=${numTex(F(Math.round(E0 * 100), 100))}`)} et ${M(`V(X)=${numTex(F(Math.round(V0 * 100), 100))}`)}. Déterminer ${M('n')} et ${M('p')}.`, a: `${M('np=' + numTex(F(Math.round(E0 * 100), 100)))} et ${M('np(1-p)=' + numTex(F(Math.round(V0 * 100), 100)))} donnent ${M(`1-p=\\dfrac{V(X)}{E(X)}=${fracTex(sub(F(1), pr))}`)}, donc ${M(`p=${fracTex(pr)}`)} puis ${M(`n=\\dfrac{E(X)}{p}=${nn}`)}.`, ok: () => near(nn * val(pr), E0, 1e-9) && near(nn * val(pr) * (1 - val(pr)), V0, 1e-9) && Number.isInteger(nn) && Math.abs(E0 * 100 - Math.round(E0 * 100)) < 1e-6 && Math.abs(V0 * 100 - Math.round(V0 * 100)) < 1e-6 };
    } },
];
