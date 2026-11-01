// Première (spécialité) templates; same contract as templates-seconde.js. Chapter ids: content/data/manifest.json.
import { F, add, sub, mul, div, val, eq, M, R, fracTex, numTex, roundTex, polyTex, evalPoly, mulPoly, sgn, par, gcd, sameOnGrid, sum } from './engine.js';

const C = 'premiere';
const nd = (f, x) => (f(x + 1e-6) - f(x - 1e-6)) / 2e-6;           // central difference, for the checks only
const near = (a, b, tol = 1e-4) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

// Exact cosine and sine of an angle k*pi/12 (k a multiple of 2, 3 or 4), as LaTeX and as a number.
const REF = { 0: ['1', '0', 1, 0], 2: ['\\dfrac{\\sqrt{3}}{2}', '\\dfrac{1}{2}', Math.sqrt(3) / 2, 0.5], 3: ['\\dfrac{\\sqrt{2}}{2}', '\\dfrac{\\sqrt{2}}{2}', Math.SQRT1_2, Math.SQRT1_2], 4: ['\\dfrac{1}{2}', '\\dfrac{\\sqrt{3}}{2}', 0.5, Math.sqrt(3) / 2], 6: ['0', '1', 0, 1] };
export function exactCosSin(u) {
  const k = ((u % 24) + 24) % 24;
  let ref, sc, ss;
  if (k <= 6) { ref = k; sc = 1; ss = 1; } else if (k <= 12) { ref = 12 - k; sc = -1; ss = 1; } else if (k <= 18) { ref = k - 12; sc = -1; ss = -1; } else { ref = 24 - k; sc = 1; ss = -1; }
  const [c, s, cn, sn] = REF[ref];
  const tex = (t, sign) => (t === '0' ? '0' : (sign < 0 ? '-' : '') + t);
  return { cos: tex(c, sc), sin: tex(s, ss), cosN: sc * cn, sinN: ss * sn };
}
export const piTex = (n, d) => { const f = F(n, d); if (f.n === 0) return '0'; const abs = Math.abs(f.n), sign = f.n < 0 ? '-' : ''; const top = abs === 1 ? '\\pi' : `${abs}\\pi`; return f.d === 1 ? `${sign}${top}` : `${sign}\\dfrac{${top}}{${f.d}}`; };

export const premiere = [
  { id: 'p-arith-seq', cls: C, chapter: 'premiere-01', domain: 'suites', skill: 'Suites arithmétiques', fast: true,
    make(r, level) {
      const u0 = r.int(-10, 10), d = r.nz(-6, 6), u = (n) => u0 + n * d;
      if (level === 1) { const k = r.int(8, 20); return { q: `Soit ${M('(u_n)')} la suite arithmétique de premier terme ${M(`u_0=${u0}`)} et de raison ${M(`r=${d}`)}. Calculer ${M(`u_{${k}}`)}.`, a: M(`u_{${k}}=${u(k)}`), ok: () => { let x = u0; for (let i = 0; i < k; i++) x += d; return x === u(k); } }; }
      if (level === 2) { const p = r.int(1, 5), q = p + r.int(2, 7); return { q: `${M('(u_n)')} est arithmétique avec ${M(`u_{${p}}=${u(p)}`)} et ${M(`u_{${q}}=${u(q)}`)}. Déterminer sa raison puis ${M('u_0')}.`, a: M(`r=${d}\\ \\text{ et }\\ u_0=${u0}`), s: M(`r=\\dfrac{${u(q)}-${par(u(p))}}{${q}-${p}}`), ok: () => (u(q) - u(p)) / (q - p) === d && u(p) - p * d === u0 }; }
      const n = r.int(10, 30), tot = ((n + 1) * (u0 + u(n))) / 2;
      return { q: `Soit ${M('(u_n)')} arithmétique, ${M(`u_0=${u0}`)} et ${M(`r=${d}`)}. Calculer ${M(`S=u_0+u_1+\\dots+u_{${n}}`)}.`, a: M(`S=\\dfrac{${n + 1}\\,(${u0}+${par(u(n))})}{2}=${tot}`), ok: () => { let s = 0; for (let i = 0; i <= n; i++) s += u(i); return s === tot; } };
    } },
  { id: 'p-geo-seq', cls: C, chapter: 'premiere-01', domain: 'suites', skill: 'Suites géométriques', fast: true,
    make(r, level) {
      const q = r.pick([2, 3, -2]), u0 = r.nz(-5, 5);
      if (level === 1) { const k = r.int(3, 7); return { q: `Soit ${M('(u_n)')} la suite géométrique de premier terme ${M(`u_0=${u0}`)} et de raison ${M(`q=${q}`)}. Calculer ${M(`u_{${k}}`)}.`, a: M(`u_{${k}}=${u0 * q ** k}`), ok: () => { let x = u0; for (let i = 0; i < k; i++) x *= q; return x === u0 * q ** k; } }; }
      if (level === 2) { return { q: `${M('(u_n)')} est géométrique avec ${M(`u_2=${u0 * q * q}`)} et ${M(`u_3=${u0 * q ** 3}`)}. Déterminer sa raison puis ${M('u_0')}.`, a: M(`q=${q}\\ \\text{ et }\\ u_0=${u0}`), ok: () => (u0 * q ** 3) / (u0 * q * q) === q && (u0 * q * q) / (q * q) === u0 }; }
      const n = r.int(4, 8), tot = (u0 * (1 - q ** (n + 1))) / (1 - q);
      return { q: `Soit ${M('(u_n)')} géométrique, ${M(`u_0=${u0}`)} et ${M(`q=${q}`)}. Calculer ${M(`S=u_0+u_1+\\dots+u_{${n}}`)}.`, a: M(`S=${u0}\\times\\dfrac{1-${par(q)}^{${n + 1}}}{1-${par(q)}}=${tot}`), ok: () => { let s = 0, x = u0; for (let i = 0; i <= n; i++) { s += x; x *= q; } return s === tot; } };
    } },
  { id: 'p-quad-roots', cls: C, chapter: 'premiere-02', domain: 'algebre', skill: 'Résoudre une équation du second degré', fast: false,
    make(r, level) {
      if (level <= 2) {
        let r1 = r.int(-6, 6), r2; do { r2 = r.int(-6, 6); } while (r2 === r1);
        const a = level === 1 ? 1 : r.pick([2, 3, -1, -2]);
        const c = [a, -a * (r1 + r2), a * r1 * r2], dl = c[1] * c[1] - 4 * c[0] * c[2];
        const [lo, hi] = [Math.min(r1, r2), Math.max(r1, r2)];
        return { q: `Résoudre dans ${M(R)} : ${M(`${polyTex(c)}=0`)}.`, a: M(`\\Delta=${dl}\\ ;\\ S=\\{${lo}\\,;\\,${hi}\\}`), ok: () => c.length === 3 && evalPoly(c, r1) === 0 && evalPoly(c, r2) === 0 && dl === a * a * (r1 - r2) ** 2 };
      }
      const kind = r.pick(['neg', 'zero', 'neg']);
      let c;
      if (kind === 'zero') { const a = r.nz(-3, 3), x0 = r.int(-5, 5); c = [a, -2 * a * x0, a * x0 * x0]; }
      else { const a = r.nz(-3, 3), b = r.int(-6, 6); c = [a, b, a > 0 ? Math.floor((b * b) / (4 * a)) + r.int(1, 3) : Math.ceil((b * b) / (4 * a)) - r.int(1, 3)]; }
      const dl = c[1] * c[1] - 4 * c[0] * c[2];
      const ans = dl === 0 ? `\\Delta=0\\ ;\\ S=\\left\\{${fracTex(F(-c[1], 2 * c[0]))}\\right\\}` : `\\Delta=${dl}<0\\ ;\\ S=\\varnothing`;
      return { q: `Résoudre dans ${M(R)} : ${M(`${polyTex(c)}=0`)}.`, a: M(ans), ok: () => (dl === 0) === (kind === 'zero') && (dl < 0 || kind === 'zero') };
    } },
  { id: 'p-canonical', cls: C, chapter: 'premiere-02', domain: 'algebre', skill: 'Forme canonique et sommet', fast: false,
    make(r, level) {
      const a = r.pick(level === 1 ? [1, -1] : [1, 2, -1, -2, 3]), al = r.int(-5, 5), be = r.int(-8, 8);
      const c = [a, -2 * a * al, a * al * al + be];
      const can = `${a === 1 ? '' : a === -1 ? '-' : a}(x${sgn(-al)})^{2}${be === 0 ? '' : sgn(be)}`.replace('(x+0)', 'x');
      return { q: `Mettre ${M(`f(x)=${polyTex(c)}`)} sous forme canonique, puis donner les coordonnées du sommet de sa parabole et dire s’il s’agit d’un minimum ou d’un maximum.`, a: M(`f(x)=${can}\\ ;\\ S(${al}\\,;\\,${be})\\ ;\\ \\text{${a > 0 ? 'minimum' : 'maximum'} }${be}`), ok: () => sameOnGrid((x) => evalPoly(c, x), (x) => a * (x - al) ** 2 + be) };
    } },
  { id: 'p-circle', cls: C, chapter: 'premiere-07', domain: 'geometrie', skill: 'Équation d’un cercle', fast: false,
    make(r, level) {
      const a = r.int(-5, 5), b = r.int(-5, 5), rad = r.int(1, 6), c = a * a + b * b - rad * rad;
      const open = `(x${sgn(-a)})^{2}+(y${sgn(-b)})^{2}=${rad * rad}`.replace('(x+0)', 'x').replace('(y+0)', 'y');
      const expanded = `x^{2}+y^{2}${a === 0 ? '' : sgn(-2 * a) + 'x'}${b === 0 ? '' : sgn(-2 * b) + 'y'}${c === 0 ? '' : sgn(c)}=0`;
      if (level === 1) return { q: `Donner une équation du cercle de centre ${M(`\\Omega(${a}\\,;\\,${b})`)} et de rayon ${M(rad)}.`, a: M(open), ok: () => (a + rad - a) ** 2 + (b - b) ** 2 === rad * rad };
      return { q: `Montrer que ${M(`${expanded}`)} est l’équation d’un cercle dont on précisera le centre et le rayon.`, a: M(`${open}\\ :\\ \\text{centre }(${a}\\,;\\,${b}),\\ \\text{rayon }${rad}`), ok: () => a * a + b * b - c === rad * rad };
    } },
  { id: 'p-dot', cls: C, chapter: 'premiere-03', domain: 'geometrie', skill: 'Produit scalaire', fast: true,
    make(r, level) {
      if (level === 1) { const u = [r.int(-5, 5), r.int(-5, 5)], v = [r.int(-5, 5), r.int(-5, 5)]; return { q: `Calculer ${M('\\vec{u}\\cdot\\vec{v}')} avec ${M(`\\vec{u}\\begin{pmatrix}${u[0]}\\\\${u[1]}\\end{pmatrix}`)} et ${M(`\\vec{v}\\begin{pmatrix}${v[0]}\\\\${v[1]}\\end{pmatrix}`)}.`, a: M(`\\vec{u}\\cdot\\vec{v}=${u[0] * v[0] + u[1] * v[1]}`), ok: () => u.reduce((s, x, i) => s + x * v[i], 0) === u[0] * v[0] + u[1] * v[1] }; }
      if (level === 2) { const c = r.int(2, 5), d = r.nz(-5, 5), b = c * r.nz(-3, 3), k = (-b * d) / c; return { q: `Déterminer ${M('k')} pour que ${M(`\\vec{u}\\begin{pmatrix}k\\\\${b}\\end{pmatrix}`)} et ${M(`\\vec{v}\\begin{pmatrix}${c}\\\\${d}\\end{pmatrix}`)} soient orthogonaux.`, a: M(`k=${k}`), s: M(`${c}k${sgn(b * d)}=0`), ok: () => k * c + b * d === 0 }; }
      let a, v, ang;
      for (;;) { a = r.nz(-4, 4); const s = r.sign(), cc = r.nz(-5, 5); const u = [a, s * a]; v = r.next() < .5 ? [cc, 0] : [0, cc]; const cos = (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v)); ang = Math.round((Math.acos(cos) * 180) / Math.PI); a = u; break; }
      const cosv = (a[0] * v[0] + a[1] * v[1]) / (Math.hypot(...a) * Math.hypot(...v));
      return { q: `Déterminer une mesure, en degrés, de l’angle géométrique entre ${M(`\\vec{u}\\begin{pmatrix}${a[0]}\\\\${a[1]}\\end{pmatrix}`)} et ${M(`\\vec{v}\\begin{pmatrix}${v[0]}\\\\${v[1]}\\end{pmatrix}`)}.`, a: M(`\\cos\\theta=${ang === 45 ? '\\dfrac{\\sqrt{2}}{2}' : '-\\dfrac{\\sqrt{2}}{2}'}\\ \\text{ donc }\\theta=${ang}^{\\circ}`), ok: () => (ang === 45 || ang === 135) && near(Math.cos((ang * Math.PI) / 180), cosv, 1e-9) };
    } },
  { id: 'p-deriv', cls: C, chapter: 'premiere-04', domain: 'analyse', skill: 'Calculer une dérivée', fast: true,
    make(r, level) {
      if (level === 1) { const c = [r.nz(-4, 4), r.int(-5, 5), r.int(-6, 6), r.int(-8, 8)]; const d = [3 * c[0], 2 * c[1], c[2]]; return { q: `Calculer la dérivée de ${M(`f(x)=${polyTex(c)}`)} sur ${M(R)}.`, a: M(`f'(x)=${polyTex(d)}`), ok: () => [-2, 0, 3].every((x) => near(nd((t) => evalPoly(c, t), x), evalPoly(d, x))) }; }
      if (level === 2) { const a = r.nz(-3, 3), b = r.int(-4, 4), c = r.nz(-3, 3), d = r.int(-5, 5); const d1 = [3 * a * c, 2 * b * c, a * d]; return { q: `Calculer la dérivée de ${M(`f(x)=(${polyTex([a, b])})(${polyTex([c, 0, d])})`)}.`, a: M(`f'(x)=${polyTex(d1)}`), s: M("(uv)'=u'v+uv'"), ok: () => [-2, 1, 3].every((x) => near(nd((t) => evalPoly([a, b], t) * evalPoly([c, 0, d], t), x), evalPoly(d1, x))) }; }
      let a, b, c, d; do { a = r.nz(-4, 4); b = r.int(-5, 5); c = r.nz(-3, 3); d = r.nz(-5, 5); } while (a * d - b * c === 0);
      const k = a * d - b * c;
      return { q: `Calculer la dérivée de ${M(`f(x)=\\dfrac{${polyTex([a, b])}}{${polyTex([c, d])}}`)} sur son ensemble de définition.`, a: M(`f'(x)=\\dfrac{${k}}{(${polyTex([c, d])})^{2}}`), ok: () => [-7.3, 2.2, 5.1].every((x) => near(nd((t) => evalPoly([a, b], t) / evalPoly([c, d], t), x), k / evalPoly([c, d], x) ** 2, 1e-3)) };
    } },
  { id: 'p-tangent', cls: C, chapter: 'premiere-04', domain: 'analyse', skill: 'Tangente en un point', fast: false,
    make(r, level) {
      const x0 = r.int(-3, 3);
      let c, d1;
      if (level < 3) { const a = level === 1 ? 1 : r.nz(-3, 3), b = r.int(-5, 5), cc = r.int(-6, 6); c = [a, b, cc]; d1 = [2 * a, b]; }
      else { const a = r.nz(-2, 2), b = r.int(-4, 4), cc = r.int(-5, 5); c = [a, 0, b, cc]; d1 = [3 * a, 0, b]; }
      const m = evalPoly(d1, x0), y0 = evalPoly(c, x0), p = y0 - m * x0;
      return { q: `Déterminer l’équation réduite de la tangente à la courbe de ${M(`f(x)=${polyTex(c)}`)} au point d’abscisse ${M(x0)}.`, a: M(`y=${polyTex([m, p])}`), s: M(`f(${x0})=${y0}\\ ;\\ f'(${x0})=${m}`), ok: () => near(nd((t) => evalPoly(c, t), x0), m) && m * x0 + p === y0 };
    } },
  { id: 'p-variations', cls: C, chapter: 'premiere-06', domain: 'analyse', skill: 'Variations et extremums', fast: false,
    make(r, level) {
      const r1 = r.int(-6, 4), r2 = r1 + r.int(1, 5), k = r.pick([1, 1, -1, 2, -2]);
      const f = (x) => k * (2 * x ** 3 - 3 * (r1 + r2) * x * x + 6 * r1 * r2 * x);
      const c = [2 * k, -3 * k * (r1 + r2), 6 * k * r1 * r2, 0], d1 = [6 * k, -6 * k * (r1 + r2), 6 * k * r1 * r2];
      const up = k > 0, mx = up ? r1 : r2, mn = up ? r2 : r1;
      const fac = `${6 * k}(x${sgn(-r1)})(x${sgn(-r2)})`.replace('(x+0)', 'x').replace('(x-0)', 'x');
      return { q: `Soit ${M(`f(x)=${polyTex(c)}`)}. Calculer ${M("f'(x)")}, étudier son signe, dresser le tableau de variations de ${M('f')} et donner ses extremums locaux.`,
        a: M(`f'(x)=${polyTex(d1)}=${fac}`) + `. ${M('f')} ${up ? 'croît' : 'décroît'} sur ${M(`]-\\infty\\,;\\,${r1}]`)}, ${up ? 'décroît' : 'croît'} sur ${M(`[${r1}\\,;\\,${r2}]`)}, ${up ? 'croît' : 'décroît'} sur ${M(`[${r2}\\,;\\,+\\infty[`)} ; maximum local ${M(`f(${mx})=${f(mx)}`)}, minimum local ${M(`f(${mn})=${f(mn)}`)}.`,
        ok: () => near(nd(f, r1), 0) && near(nd(f, r2), 0) && f(mx) > f(mn) && (nd(f, r1 - 1) > 0) === up && (nd(f, (r1 + r2) / 2) < 0) === up && (nd(f, r2 + 1) > 0) === up };
    } },
  { id: 'p-proba-cond', cls: C, chapter: 'premiere-05', domain: 'stats-proba', skill: 'Probabilités conditionnelles', fast: false,
    make(r, level) {
      const p = r.int(1, 9), q = r.int(1, 9), s = r.int(1, 9);
      const pa = F(p, 10), pba = F(q, 10), pbna = F(s, 10), inter = mul(pa, pba), pb = add(inter, mul(sub(F(1), pa), pbna));
      if (level === 1) return { q: `${M(`P(A)=${numTex(pa)}`)} et ${M(`P_A(B)=${numTex(pba)}`)}. Calculer ${M('P(A\\cap B)')}.`, a: M(`P(A\\cap B)=${numTex(inter)}`), ok: () => near(val(inter), (p * q) / 100) };
      if (level === 2) { const m = r.int(1, 10 * p); const i2 = F(m, 100); return { q: `${M(`P(A)=${numTex(pa)}`)} et ${M(`P(A\\cap B)=${numTex(i2)}`)}. Calculer ${M('P_A(B)')}.`, a: M(`P_A(B)=\\dfrac{${numTex(i2)}}{${numTex(pa)}}=${numTex(div(i2, pa))}`), ok: () => near(val(div(i2, pa)) * val(pa), val(i2)) }; }
      const bayes = div(inter, pb);
      return { q: `${M(`P(A)=${numTex(pa)}`)}, ${M(`P_A(B)=${numTex(pba)}`)} et ${M(`P_{\\overline{A}}(B)=${numTex(pbna)}`)}. Calculer ${M('P(B)')} puis ${M('P_B(A)')}.`, a: M(`P(B)=${numTex(pb)}\\ ;\\ P_B(A)=\\dfrac{${numTex(inter)}}{${numTex(pb)}}=${fracTex(bayes)}`), ok: () => near(val(bayes) * val(pb), val(inter)) && near(val(pb), (p * q + (10 - p) * s) / 100) };
    } },
  { id: 'p-rv', cls: C, chapter: 'premiere-08', domain: 'stats-proba', skill: 'Espérance et variance', fast: false,
    make(r, level) {
      const xs = r.shuffle([-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 8, 10]).slice(0, 3).sort((a, b) => a - b);
      let ps; do { const a = r.int(1, 8), b = r.int(1, 9 - a); ps = [a, b, 10 - a - b]; } while (ps[2] < 1);
      const P = ps.map((x) => F(x, 10)), E = sum(xs.map((x, i) => mul(F(x), P[i]))), E2 = sum(xs.map((x, i) => mul(F(x * x), P[i]))), V = sub(E2, mul(E, E));
      const table = `\\begin{array}{c|ccc}x_i&${xs.join('&')}\\\\\\hline P(X=x_i)&${P.map(numTex).join('&')}\\end{array}`;
      return { q: `Loi de probabilité de ${M('X')} : ${M(table)}. Calculer ${level === 1 ? M('E(X)') : `${M('E(X)')} et ${M('V(X)')}`}.`, a: level === 1 ? M(`E(X)=${numTex(E)}`) : M(`E(X)=${numTex(E)}\\ ;\\ V(X)=${numTex(E2)}-(${numTex(E)})^{2}=${numTex(V)}`),
        ok: () => { let e = 0, e2 = 0; xs.forEach((x, i) => { e += (x * ps[i]) / 10; e2 += (x * x * ps[i]) / 10; }); const v = xs.reduce((s, x, i) => s + ((x - e) ** 2 * ps[i]) / 10, 0); return near(e, val(E), 1e-9) && near(v, val(V), 1e-9) && e2 - e * e > -1e-12; } };
    } },
  { id: 'p-exp-equation', cls: C, chapter: 'premiere-09', domain: 'analyse', skill: 'Équations et inéquations avec exponentielle', fast: true,
    make(r, level) {
      if (level === 1) { const a = r.int(-5, 5), b = r.int(-5, 5); return { q: `Résoudre dans ${M(R)} : ${M(`\\mathrm{e}^{x${sgn(a)}}=\\mathrm{e}${b === 1 ? '' : `^{${b}}`}`).replace('x+0', 'x')}.`, a: M(`S=\\{${b - a}\\}`), ok: () => b - a + a === b }; }
      let a, c; do { a = r.nz(-4, 4); c = r.nz(-4, 4); } while (a === c);
      const b = r.int(-5, 5), d = r.int(-5, 5), x0 = F(d - b, a - c);
      if (level === 2) return { q: `Résoudre dans ${M(R)} : ${M(`\\mathrm{e}^{${polyTex([a, b])}}=\\mathrm{e}^{${polyTex([c, d])}}`)}.`, a: M(`S=\\left\\{${fracTex(x0)}\\right\\}`), ok: () => eq(add(mul(F(a), x0), F(b)), add(mul(F(c), x0), F(d))) };
      const up = a - c > 0;
      return { q: `Résoudre dans ${M(R)} : ${M(`\\mathrm{e}^{${polyTex([a, b])}}\\geqslant \\mathrm{e}^{${polyTex([c, d])}}`)}.`, a: M(`S=${up ? `\\left[${fracTex(x0)}\\,;\\,+\\infty\\right[` : `\\left]-\\infty\\,;\\,${fracTex(x0)}\\right]`}`), s: 'La fonction exponentielle est strictement croissante.',
        ok: () => { for (let k = -30; k <= 30; k++) { const x = k / 2; const holds = a * x + b >= c * x + d; if (holds !== (up ? x >= val(x0) : x <= val(x0))) return false; } return true; } };
    } },
  { id: 'p-exp-deriv', cls: C, chapter: 'premiere-09', domain: 'analyse', skill: 'Dériver avec exponentielle', fast: true,
    make(r, level) {
      if (level === 1) { const a = r.nz(-5, 5), b = r.int(-4, 4); const f = (x) => Math.exp(a * x + b); return { q: `Calculer la dérivée de ${M(`f(x)=\\mathrm{e}^{${polyTex([a, b])}}`)}.`, a: M(`f'(x)=${a === 1 ? '' : a === -1 ? '-' : a}\\mathrm{e}^{${polyTex([a, b])}}`), ok: () => near(nd(f, 0.3), a * f(0.3), 1e-3) }; }
      if (level === 2) { const a = r.nz(-4, 4), b = r.int(-5, 5); const f = (x) => (a * x + b) * Math.exp(x); return { q: `Calculer la dérivée de ${M(`f(x)=(${polyTex([a, b])})\\mathrm{e}^{x}`)}.`, a: M(`f'(x)=(${polyTex([a, a + b])})\\mathrm{e}^{x}`), ok: () => near(nd(f, 0.7), (a * 0.7 + a + b) * Math.exp(0.7), 1e-3) }; }
      const a = r.nz(-3, 3), b = r.int(-4, 4), c = r.nz(-3, 3); const f = (x) => (a * x + b) * Math.exp(c * x);
      return { q: `Calculer la dérivée de ${M(`f(x)=(${polyTex([a, b])})\\mathrm{e}^{${c === 1 ? '' : c === -1 ? '-' : c}x}`)}.`, a: M(`f'(x)=(${polyTex([a * c, a + b * c])})\\mathrm{e}^{${c === 1 ? '' : c === -1 ? '-' : c}x}`), ok: () => near(nd(f, 0.4), (a * c * 0.4 + a + b * c) * Math.exp(c * 0.4), 1e-3) };
    } },
  { id: 'p-trig-exact', cls: C, chapter: 'premiere-10', domain: 'geometrie', skill: 'Valeurs exactes du cosinus et du sinus', fast: true,
    make(r, level) {
      const first = [0, 2, 3, 4, 6], all = [0, 2, 3, 4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22];
      let u = level === 1 ? r.pick([...first.slice(1), 8, 9, 10, 12]) : r.pick(all.slice(1));
      if (level === 3) u += 24 * r.nz(-3, 3);
      const ex = exactCosSin(u), ang = piTex(u, 12), ask = level === 1 ? r.pick(['both', 'cos', 'sin']) : 'both';
      const qc = M(`\\cos\\left(${ang}\\right)`), qs = M(`\\sin\\left(${ang}\\right)`), ac = `\\cos\\left(${ang}\\right)=${ex.cos}`, as = `\\sin\\left(${ang}\\right)=${ex.sin}`;
      return { q: ask === 'both' ? `Donner les valeurs exactes de ${qc} et ${qs}.` : `Donner la valeur exacte de ${ask === 'cos' ? qc : qs}.`, a: M(ask === 'both' ? `${ac}\\ ;\\ ${as}` : ask === 'cos' ? ac : as), ok: () => near(Math.cos((u * Math.PI) / 12), ex.cosN, 1e-9) && near(Math.sin((u * Math.PI) / 12), ex.sinN, 1e-9) };
    } },
  { id: 'p-radians', cls: C, chapter: 'premiere-10', domain: 'geometrie', skill: 'Degrés et radians', fast: true,
    make(r, level) {
      const base = level === 1 ? [30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360] : Array.from({ length: 49 }, (_, i) => 15 * (i - 24)).filter((x) => x !== 0);
      const d = r.pick(base), f = F(d, 180);
      if (level === 2 || r.next() < (level === 1 ? 0.6 : 0.4)) return { q: `Convertir ${M(`${d}^{\\circ}`)} en radians.`, a: M(`${d}^{\\circ}=${piTex(f.n, f.d)}\\ \\text{rad}`), ok: () => near((d * Math.PI) / 180, (f.n / f.d) * Math.PI, 1e-12) };
      return { q: `Convertir ${M(`${piTex(f.n, f.d)}\\ \\text{rad}`)} en degrés.`, a: M(`${d}^{\\circ}`), ok: () => near(((f.n / f.d) * 180), d, 1e-12) };
    } },
];
