// Première generators, second file: chapters 01 (suites), 02 (second degré), 03 (vecteurs, produit scalaire), 04 (dérivation).
// Same contract as templates-premiere.js. Formats: calcul, QCM à quatre choix (chaque faux choix vient d'une erreur type),
// vrai/faux justifié, « trouve l'erreur », lecture d'un tableau, contexte, question à l'envers, sujets de niveau 3 de type examen.
import { F, add, sub, mul, div, val, eq, M, R, fracTex, numTex, roundTex, polyTex, evalPoly, sgn, par, gcd, sqrtTex, mulPoly } from './engine.js';
import { near, nd, coef, opt, mcq, tf, spot, OPS, ineqSet, xm } from './premiere-kit.js';
import { pt, vc, lin, normLine, ivTex, affTex } from './seconde-kit.js';

const C = 'premiere';
const U = (k) => `u_{${k}}`;
const iter = (u0, a, b, n) => (n === 0 ? u0 : a * iter(u0, a, b, n - 1) + b);
const vals = (u0, r, n) => Array.from({ length: n + 1 }, (_, i) => u0 + i * r);

export const premiere2 = [
  // ============================ 01 Suites ============================
  { id: 'p-seq-recur', cls: C, chapter: 'premiere-01', domain: 'suites', skill: 'Suite définie par récurrence', fast: true,
    make(r, level) {
      const a = r.pick(level === 3 ? [2, 3, -2, 4, -3] : [2, 3, -1, -2, 4]);
      if (level === 1) {
        const b = r.nz(-6, 6), u0 = r.int(-5, 5), k = r.int(3, 5), v = Array.from({ length: k + 1 }, (_, i) => iter(u0, a, b, i));
        return { q: `La suite ${M('(u_n)')} est définie par ${M(`${U(0)}=${u0}`)} et ${M(`${U('n+1')}=${polyTex([a, b], 'u_n')}`)} pour tout entier ${M('n')}. Calculer ${M(`${U(1)}`)}, ..., ${M(U(k))}.`,
          a: M(v.slice(1).map((x, i) => `${U(i + 1)}=${x}`).join('\\ ;\\ ')), ok: () => { let x = u0; for (let i = 1; i <= k; i++) { x = a * x + b; if (x !== v[i]) return false; } return v.length === k + 1; } };
      }
      if (level === 2) {
        let b, u0; do { b = r.nz(-7, 7); u0 = r.int(-6, 6); } while ((a - 1) * u0 + b === 0);
        const u1 = a * u0 + b, u2 = a * u1 + b;
        return { q: `Une suite ${M('(u_n)')} vérifie ${M(`${U('n+1')}=a\\,u_n+b`)} pour tout ${M('n')}, avec ${M('a')} et ${M('b')} réels, et ${M(`${U(0)}=${u0}`)}, ${M(`${U(1)}=${u1}`)}, ${M(`${U(2)}=${u2}`)}. Déterminer ${M('a')} et ${M('b')}.`,
          a: M(`a=\\dfrac{${u2}-${par(u1)}}{${u1}-${par(u0)}}=${a}\\ ;\\ b=${U(1)}-a\\,${U(0)}=${u1}-${par(a)}\\times ${par(u0)}=${b}`), s: M(`${U(2)}-${U(1)}=a(${U(1)}-${U(0)})`),
          ok: () => u1 !== u0 && ((u2 - u1) / (u1 - u0)) === a && u1 - a * u0 === b && a * u1 + b === u2 };
      }
      let l, d; do { l = r.nz(-6, 6); d = r.nz(-4, 4); } while (false);
      const b = l * (1 - a), u0 = l + d, k = r.int(4, 6), uk = l + d * a ** k;
      const form = `${l}${d < 0 ? '-' : '+'}${Math.abs(d) === 1 ? '' : Math.abs(d)}\\times ${par(a)}^{n}`;
      return { q: `Soit ${M('(u_n)')} définie par ${M(`${U(0)}=${u0}`)} et ${M(`${U('n+1')}=${polyTex([a, b], 'u_n')}`)}. On pose ${M(`v_n=u_n${sgn(-l)}`)}. 1) Montrer que ${M('(v_n)')} est géométrique et donner sa raison. 2) Exprimer ${M('v_n')} puis ${M('u_n')} en fonction de ${M('n')}. 3) Calculer ${M(U(k))}.`,
        a: `${M(`v_{n+1}=${U('n+1')}${sgn(-l)}=${polyTex([a, b - l], 'u_n')}=${a}(u_n${sgn(-l)})=${a}v_n`)} : raison ${M(a)}. ${M(`v_0=${d}`)} donc ${M(`v_n=${d}\\times ${par(a)}^{n}`)} et ${M(`u_n=${form}`)}. ${M(`${U(k)}=${uk}`)}.`,
        ok: () => { for (let n = 0; n <= 6; n++) if (iter(u0, a, b, n) !== l + d * a ** n) return false; return b === l * (1 - a) && a * l + b === l && iter(u0, a, b, k) === uk; } };
    } },

  { id: 'p-seq-qcm', cls: C, chapter: 'premiere-01', domain: 'suites', skill: 'QCM sur les suites', fast: true,
    make(r, level) {
      if (level === 1 && r.next() < 0.5) {
        const a = r.nz(-6, 6); let b; do { b = r.nz(-9, 9); } while (b === a);
        const Un = (n) => a * n + b, dif = a, isAr = [0, 1, 2, 3].every((n) => Un(n + 1) - Un(n) === dif), isGeo = Un(0) !== 0 && [0, 1, 2].every((n) => Un(n + 1) * Un(0) === Un(1) * Un(n));
        const right = opt(M(`\\text{arithmétique de raison }${a}`), `En effet ${M(`${U('n+1')}-u_n=${a}`)} ne dépend pas de ${M('n')}.`, { k: 'ar', v: a });
        return mcq(r, `La suite définie par ${M(`u_n=${polyTex([a, b], 'n')}`)} est :`, right, [
          opt(M(`\\text{arithmétique de raison }${b}`), `confond la raison avec le terme constant ${M(b)}.`, { k: 'ar', v: b }),
          opt(M(`\\text{géométrique de raison }${a}`), `confond l’écriture ${M('an+b')} avec ${M('a^{n}')}.`, { k: 'geo', v: a }),
          opt(M('\\text{ni arithmétique ni géométrique}'), 'croit qu’une formule sans exposant ne décrit pas une suite arithmétique.', { k: 'none' })],
        (o) => (o.k === 'ar' ? isAr && o.v === dif : o.k === 'geo' ? isGeo && near(Un(1) / Un(0), o.v) : !isAr && !isGeo));
      }
      if (level === 1) {
        const q = r.pick([2, 3, 4, 5]); let u0; do { u0 = r.int(2, 9); } while (u0 === q); const rec = (n) => u0 * q ** n;
        const fs = [[`u_n=${u0}\\times ${q}^{n}`, (n) => u0 * q ** n], [`u_n=${u0}+${q}n`, (n) => u0 + q * n], [`u_n=${q}\\times ${u0}^{n}`, (n) => q * u0 ** n], [`u_n=${u0 * q}^{n}`, (n) => (u0 * q) ** n]];
        return mcq(r, `La suite ${M('(u_n)')} vérifie ${M(`${U(0)}=${u0}`)} et ${M(`${U('n+1')}=${q}u_n`)}. Alors :`, opt(M(fs[0][0]), 'suite géométrique de premier terme et de raison donnés.', { f: fs[0][1] }),
          [opt(M(fs[1][0]), 'confond arithmétique (on ajoute) et géométrique (on multiplie).', { f: fs[1][1] }), opt(M(fs[2][0]), 'échange le premier terme et la raison.', { f: fs[2][1] }), opt(M(fs[3][0]), 'multiplie le premier terme par la raison avant la puissance.', { f: fs[3][1] })],
          (o) => [0, 1, 2, 3, 4, 5].every((n) => o.f(n) === rec(n)));
      }
      if (level === 2 && r.next() < 0.5) {
        const rr = r.nz(-5, 5), p = r.int(2, 6), up = r.int(-9, 9) + p * rr, u0 = up - p * rr, trueF = (n) => up + (n - p) * rr;
        const fs = [[[rr, u0], (n) => rr * n + u0], [[rr, up], (n) => rr * n + up], [[rr, up + p * rr], (n) => rr * n + up + p * rr], [[up, rr], (n) => up * n + rr], [[rr, u0 + 1], (n) => rr * n + u0 + 1]];
        const t = (c) => M(`u_n=${polyTex(c, 'n')}`), mk = (i, why) => opt(t(fs[i][0]), why, { f: fs[i][1] });
        return mcq(r, `${M('(u_n)')} est arithmétique de raison ${M(rr)} et ${M(`${U(p)}=${up}`)}. Pour tout entier ${M('n')} :`, mk(0, `${M(`u_n=${U(p)}+(n-${p})\\times ${par(rr)}`)}, soit ${M(`u_0=${u0}`)}.`),
          [mk(1, `prend ${M(U(p))} pour le terme initial ${M(U(0))}.`), mk(2, `ajoute ${M(`${p}r`)} au lieu de le retrancher.`), mk(3, 'échange la raison et le terme constant.'), mk(4, 'se trompe d’une unité dans le terme constant.')], (o) => [2, 3, 4, 7].every((n) => o.f(n) === trueF(n)));
      }
      if (level === 2) {
        const q = r.pick([2, 3, -2]), u2 = r.nz(-4, 4), tr = (n) => u2 * q ** (n - 2);
        const fs = [[`${u2}\\times ${par(q)}^{n-2}`, tr], [`${u2}\\times ${par(q)}^{n}`, (n) => u2 * q ** n], [`${u2}\\times ${par(q)}^{n+2}`, (n) => u2 * q ** (n + 2)], [`${u2}\\times ${par(q)}^{n-1}`, (n) => u2 * q ** (n - 1)]];
        return mcq(r, `${M('(u_n)')} est géométrique de raison ${M(q)} et ${M(`${U(2)}=${u2}`)}. Pour tout entier ${M('n')} :`, opt(M(`u_n=${fs[0][0]}`), `de ${M(U(2))} à ${M(U('n'))} il y a ${M('n-2')} multiplications par ${M(q)}.`, { f: fs[0][1] }),
          fs.slice(1).map((f, i) => opt(M(`u_n=${f[0]}`), ['oublie de décaler l’indice de départ.', 'décale l’indice dans le mauvais sens.', 'se trompe d’une unité dans l’exposant.'][i], { f: f[1] })), (o) => [2, 3, 4, 5, 6].every((n) => o.f(n) === tr(n)));
      }
      if (r.next() < 0.5) {
        const q = r.pick([2, 3, -2, 4]), u0 = r.nz(-4, 4), n = r.int(4, 8), un = u0 * q ** n; let S = 0; for (let i = 0; i <= n; i++) S += u0 * q ** i;
        const opts = [S, (u0 * (q ** n - 1)) / (q - 1), ((n + 1) * (u0 + un)) / 2, -S, (u0 * (q ** (n + 1) - 1)) / (q + 1)];
        const why = ['la somme a ' + (n + 1) + ' termes : ' + M(`S=${u0}\\times\\dfrac{1-${par(q)}^{${n + 1}}}{1-${par(q)}}`) + '.', `utilise l’exposant ${M(n)} au lieu de ${M(n + 1)} (la somme compte ${M(n + 1)} termes).`, 'applique la formule des suites arithmétiques à une suite géométrique.', 'inverse le signe du dénominateur de la formule.', `écrit ${M('q+1')} au dénominateur au lieu de ${M('q-1')}.`];
        return mcq(r, `${M('(u_n)')} est géométrique, ${M(`${U(0)}=${u0}`)}, raison ${M(q)}. La somme ${M(`S=${U(0)}+${U(1)}+\\dots+${U(n)}`)} vaut :`, opt(M(`${opts[0]}`), why[0], { v: opts[0] }),
          opts.slice(1).map((v, i) => opt(M(`${v}`), why[i + 1], { v })), (o) => o.v === S);
      }
      let u0, rr, n, un; do { u0 = r.nz(-8, 8); rr = r.nz(-5, 5); n = r.int(8, 30); un = u0 + n * rr; } while (u0 + un === 0); let S = 0; for (let i = 0; i <= n; i++) S += u0 + i * rr;
      const opts = [S, (n * (u0 + un)) / 2, (n + 1) * (u0 + un), ((n + 1) * (u0 + un)) / 2 + u0, (n + 1) * un, ((n + 1) * (un - u0)) / 2];
      return mcq(r, `${M('(u_n)')} est arithmétique, ${M(`${U(0)}=${u0}`)} et raison ${M(rr)}. La somme ${M(`S=${U(0)}+${U(1)}+\\dots+${U(n)}`)} vaut :`, opt(M(`${opts[0]}`), `${M(`S=\\dfrac{(${n}+1)(${u0}+${par(un)})}{2}`)}.`, { v: opts[0] }),
        opts.slice(1).map((v, i) => opt(M(`${v}`), ['compte ' + n + ' termes au lieu de ' + (n + 1) + '.', 'oublie de diviser par 2.', 'ajoute une fois de trop le premier terme.', 'multiplie le nombre de termes par le dernier terme seulement.', 'fait la différence au lieu de la somme des termes extrêmes.'][i], { v })), (o) => o.v === S);
    } },

  { id: 'p-seq-tf', cls: C, chapter: 'premiere-01', domain: 'suites', skill: 'Vrai ou faux sur les suites', fast: true,
    make(r, level) {
      const a = r.int(2, 19), b = r.nz(-19, 19), q = r.pick([2, 3, 4, 5, -2, -3, -4]), u0 = r.int(1, 15), rr = r.int(2, 15);
      const fam = {
        1: [
          () => ({ s: `La suite définie par ${M(`u_n=${a}n^{2}${sgn(b)}`)} est arithmétique.`, v: false, j: `${M(`${U(1)}-${U(0)}=${a}`)} mais ${M(`${U(2)}-${U(1)}=${3 * a}`)} : l’écart n’est pas constant.`, c: () => { const u = (n) => a * n * n + b; return u(1) - u(0) !== u(2) - u(1); } }),
          () => ({ s: `La suite définie par ${M(`${U(0)}=${b}`)} et ${M(`${U('n+1')}=u_n+${a}`)} est arithmétique de raison ${M(a)}.`, v: true, j: `Chaque terme s’obtient en ajoutant ${M(a)} au précédent.`, c: () => { let x = b; for (let i = 0; i < 6; i++) { const y = x + a; if (y - x !== a) return false; x = y; } return true; } }),
          () => ({ s: `La suite définie par ${M(`u_n=${u0}\\times ${q}^{n}`)} est géométrique de raison ${M(q)}.`, v: true, j: `${M(`\\dfrac{${U('n+1')}}{u_n}=${q}`)} pour tout ${M('n')}.`, c: () => [0, 1, 2, 3].every((n) => u0 * q ** (n + 1) === q * (u0 * q ** n)) }),
          () => ({ s: `Une suite arithmétique de raison ${M(-rr)} est décroissante.`, v: true, j: `${M(`${U('n+1')}-u_n=${-rr}<0`)}.`, c: () => [0, 1, 2].every((n) => (n - 1) * -rr > n * -rr) }),
        ],
        2: [], 3: [],
      };
      const qn = r.pick([2, 3, 4, 5, 6]);
      fam[2] = [
        () => ({ s: `La suite géométrique de premier terme ${M(`${U(0)}=${u0}`)} et de raison ${M(-qn)} est décroissante.`, v: false, j: `${M(`${U(0)}=${u0}`)}, ${M(`${U(1)}=${-qn * u0}`)}, ${M(`${U(2)}=${qn * qn * u0}`)} : elle est décroissante au début puis croît, les signes alternent.`, c: () => { const u = (n) => u0 * (-qn) ** n; return u(1) < u(0) && u(2) > u(1); } }),
        () => ({ s: `Si ${M(`${U('n+1')}-u_n=n`)} pour tout ${M('n')}, alors ${M('(u_n)')} est arithmétique.`, v: false, j: `La différence ${M(`${U('n+1')}-u_n`)} vaut ${M(0)} puis ${M(1)} puis ${M(2)} : elle dépend de ${M('n')}.`, c: () => { const d = (n) => n; return d(0) !== d(1); } }),
        () => ({ s: `Si ${M('(u_n)')} est arithmétique de raison ${M(a)} et ${M('(v_n)')} arithmétique de raison ${M(rr)}, alors ${M('(u_n+v_n)')} est arithmétique de raison ${M(a + rr)}.`, v: true, j: `${M(`(${U('n+1')}+v_{n+1})-(u_n+v_n)=${a}+${rr}=${a + rr}`)}.`, c: () => [0, 1, 2, 3].every((n) => (a * (n + 1) + rr * (n + 1)) - (a * n + rr * n) === a + rr) }),
        () => ({ s: `Si ${M('(u_n)')} est géométrique de raison ${M(qn)} alors ${M('(u_n^{2})')} est géométrique de raison ${M(qn * qn)}.`, v: true, j: `${M(`\\dfrac{${U('n+1')}^{2}}{u_n^{2}}=\\left(\\dfrac{${U('n+1')}}{u_n}\\right)^{2}=${qn * qn}`)} (les termes sont non nuls).`, c: () => [0, 1, 2].every((n) => (u0 * qn ** (n + 1)) ** 2 === qn * qn * (u0 * qn ** n) ** 2) }),
      ];
      const p = r.int(5, 60);
      fam[3] = [
        () => ({ s: `Pour tout entier ${M('n')}, ${M(`${U(0)}+${U(1)}+\\dots+${U('n')}=\\dfrac{n(${U(0)}+u_n)}{2}`)} dans une suite arithmétique.`, v: false, j: `La somme compte ${M('n+1')} termes : le bon facteur est ${M('n+1')}. Avec ${M(`u_n=${rr}n`)} : pour ${M('n=1')} la somme vaut ${M(rr)} et la formule proposée ${M(`\\dfrac{1\\times ${rr}}{2}`)}.`, c: () => { const u = (n) => rr * n; return (u(0) + u(1)) !== (1 * (u(0) + u(1))) / 2; } }),
        () => ({ s: `Si ${M(`${U('n+1')}=\\dfrac{1}{${qn}}u_n+${p}`)} pour tout ${M('n')}, alors ${M('(u_n)')} est géométrique.`, v: false, j: `Avec ${M(`${U(0)}=1`)} : ${M(`${U(1)}=${fracTex(add(F(1, qn), F(p)))}`)} et ${M(`${U(2)}=${fracTex(add(F(1, qn * qn), add(F(p, qn), F(p))))}`)}, donc ${M(`\\dfrac{${U(1)}}{${U(0)}}\\neq\\dfrac{${U(2)}}{${U(1)}}`)} : une relation ${M('u_{n+1}=au_n+b')} avec ${M('b\\neq 0')} ne définit pas en général une suite géométrique.`, c: () => { const u = [F(1)]; for (let i = 0; i < 2; i++) u.push(add(mul(F(1, qn), u[i]), F(p))); return !eq(div(u[1], u[0]), div(u[2], u[1])); } }),
        () => ({ s: `Si ${M('(u_n)')} est géométrique de raison ${M(F(1, qn).d === 1 ? 1 : fracTex(F(1, qn)))} et de premier terme ${M(`${U(0)}=${u0}`)}, alors ${M('(u_n)')} est décroissante.`, v: true, j: `${M(`${U('n+1')}-u_n=u_n\\left(\\dfrac{1}{${qn}}-1\\right)<0`)} car ${M('u_n>0')} et ${M(`\\dfrac{1}{${qn}}<1`)}.`, c: () => [0, 1, 2, 3, 4].every((n) => u0 / qn ** (n + 1) < u0 / qn ** n) }),
        () => ({ s: `La somme ${M(`1+${qn}+${qn}^{2}+\\dots+${qn}^{n}`)} est égale à ${M(`\\dfrac{${qn}^{n+1}-1}{${qn - 1}}`)} pour tout entier ${M('n')}.`, v: true, j: `C’est ${M(`S=1\\times\\dfrac{1-${qn}^{n+1}}{1-${qn}}`)} : ${M('n+1')} termes, premier terme ${M(1)}, raison ${M(qn)}.`, c: () => [0, 1, 2, 3, 4, 5].every((n) => { let s = 0; for (let i = 0; i <= n; i++) s += qn ** i; return s === (qn ** (n + 1) - 1) / (qn - 1); }) }),
      ];
      const c = r.pick(fam[level])();
      return tf(c);
    } },

  { id: 'p-seq-error', cls: C, chapter: 'premiere-01', domain: 'suites', skill: 'Trouver l’erreur dans un calcul sur les suites', fast: false,
    make(r, level) {
      if (level === 1) {
        let u0, rr, N, uN; do { u0 = r.int(-9, 9); rr = r.nz(-6, 6); N = r.int(6, 20); uN = u0 + N * rr; } while (u0 + uN === 0);
        const S = ((N + 1) * (u0 + uN)) / 2, kind = r.pick(['n1', 'half', 'count']);
        const intro = `Pour calculer ${M(`S=${U(0)}+${U(1)}+\\dots+${U(N)}`)} avec ${M('(u_n)')} arithmétique de premier terme ${M(u0)} et de raison ${M(rr)}, un élève écrit une solution.`;
        let l1 = `${U(N)}=${u0}+${N}\\times ${par(rr)}=${uN}`, uShown = uN, l2 = `S=\\dfrac{${N + 1}\\times(${u0}+${par(uN)})}{2}`, l3 = `S=${S}`, bad, why, fix;
        if (kind === 'n1') { uShown = u0 + (N + 1) * rr; l1 = `${U(N)}=${u0}+${N + 1}\\times ${par(rr)}=${uShown}`; l2 = `S=\\dfrac{${N + 1}\\times(${u0}+${par(uShown)})}{2}`; l3 = `S=${((N + 1) * (u0 + uShown)) / 2}`; bad = 0; why = `${M(U(N))} s’obtient en ajoutant ${M(N)} fois la raison à ${M(U(0))}, pas ${M(N + 1)} fois.`; fix = M(`${U(N)}=${u0}+${N}\\times ${par(rr)}=${uN}`); }
        if (kind === 'half') { l3 = `S=${(N + 1) * (u0 + uN)}`; l2 = `S=${N + 1}\\times(${u0}+${par(uN)})`; bad = 1; why = `il manque la division par ${M(2)} : ${M('S=\\dfrac{(\\text{nombre de termes})(\\text{premier}+\\text{dernier})}{2}')}.`; fix = M(`S=\\dfrac{${N + 1}\\times(${u0}+${par(uN)})}{2}`); }
        if (kind === 'count') { l2 = `S=\\dfrac{${N}\\times(${u0}+${par(uN)})}{2}`; l3 = `S=${(N * (u0 + uN)) / 2}`; bad = 1; why = `la somme de ${M(U(0))} à ${M(U(N))} compte ${M(N + 1)} termes, pas ${M(N)}.`; fix = M(`S=\\dfrac{${N + 1}\\times(${u0}+${par(uN)})}{2}`); }
        const shown = kind === 'n1' ? ((N + 1) * (u0 + uShown)) / 2 : kind === 'half' ? (N + 1) * (u0 + uN) : (N * (u0 + uN)) / 2;
        return spot(intro, [M(l1), M(l2), M(l3)], bad, why, fix, M(`S=${S}`), () => { let t = 0; for (let i = 0; i <= N; i++) t += u0 + i * rr; return t === S && shown !== S && (kind !== 'n1' || uShown !== uN); });
      }
      if (level === 2) {
        const q = r.pick([2, 3, -2, 4]), u0 = r.nz(-4, 4), N = r.int(4, 8), S = (u0 * (1 - q ** (N + 1))) / (1 - q), kind = r.pick(['exp', 'sign']), uN = u0 * q ** N;
        const intro = `Pour calculer ${M(`S=${U(0)}+${U(1)}+\\dots+${U(N)}`)} avec ${M('(u_n)')} géométrique de premier terme ${M(u0)} et de raison ${M(q)}, un élève écrit une solution.`;
        const l1 = `${U(N)}=${u0}\\times ${par(q)}^{${N}}=${uN}`;
        const f = (e) => `S=${u0}\\times\\dfrac{1-${par(q)}^{${e}}}{1-${par(q)}}`;
        const shown = kind === 'exp' ? (u0 * (1 - q ** N)) / (1 - q) : -S;
        const lines = kind === 'exp' ? [l1, f(N), `S=${shown}`] : [l1, `${f(N + 1)}`, `S=${shown}`];
        return spot(intro, lines.map(M), kind === 'exp' ? 1 : 2,
          kind === 'exp' ? `la somme compte ${M(N + 1)} termes : l’exposant est ${M(N + 1)}.` : `${M(`1-${par(q)}=${1 - q}`)}, et le signe du résultat a été perdu à la dernière ligne.`,
          M(f(N + 1)), M(`S=${S}`), () => { let t = 0; for (let i = 0; i <= N; i++) t += u0 * q ** i; return t === S && shown !== S && (kind === 'sign' || (u0 * (1 - q ** N)) / (1 - q) !== S); });
      }
      const rr = r.nz(-6, 6), u0 = r.int(-9, 9), p = r.int(2, 5), q2 = p + r.int(2, 6), up = u0 + p * rr, uq = u0 + q2 * rr, kind = r.pick(['den', 'sign', 'shift']);
      const intro = `${M('(u_n)')} est arithmétique avec ${M(`${U(p)}=${up}`)} et ${M(`${U(q2)}=${uq}`)}. Pour trouver ${M('u_n')} en fonction de ${M('n')}, un élève écrit une solution.`;
      const good = [`r=\\dfrac{${uq}-${par(up)}}{${q2}-${p}}=${rr}`, `${U(0)}=${up}-${p}\\times ${par(rr)}=${u0}`, `u_n=${polyTex([rr, u0], 'n')}`];
      let lines = good, bad, why, fix, shownU, shownR = rr;
      if (kind === 'den') { const d = q2 + p, rs = (uq - up) / d, rF = F(uq - up, d), rt = fracTex(rF), cf = (f) => `${f.n < 0 ? '-' : '+'}${f.d === 1 && Math.abs(f.n) === 1 ? '' : fracTex(F(Math.abs(f.n), f.d))}`; lines = [`r=\\dfrac{${uq}-${par(up)}}{${q2}+${p}}=${rt}`, `${U(0)}=${up}-${p}\\times ${rF.n < 0 ? `\\left(${rt}\\right)` : rt}`, `u_n=${U(0)}${cf(rF)}n`]; bad = 0; why = `l’écart d’indices est ${M(`${q2}-${p}`)}, pas ${M(`${q2}+${p}`)}.`; fix = M(good[0]); shownR = rs; shownU = up - p * rs; }
      else if (kind === 'sign') { const u0w = up + p * rr; lines = [good[0], `${U(0)}=${up}+${p}\\times ${par(rr)}=${u0w}`, `u_n=${polyTex([rr, u0w], 'n')}`]; bad = 1; why = `${M(U(p))} est ${M(`${U(0)}+${p}r`)} donc ${M(U(0))} s’obtient par une soustraction.`; fix = M(good[1]); shownU = u0w; }
      else { lines = [good[0], `${U(0)}=${up}`, `u_n=${polyTex([rr, up], 'n')}`]; bad = 1; why = `${M(up)} est la valeur de ${M(U(p))}, pas celle de ${M(U(0))}.`; fix = M(good[1]); shownU = up; }
      return spot(intro, lines.map(M), bad, why, fix, M(good[2]), () => { const u = (n) => u0 + n * rr; return u(p) === up && u(q2) === uq && (shownU !== u0 || shownR !== rr) && (uq - up) / (q2 - p) === rr; });
    } },

  { id: 'p-seq-seuil', cls: C, chapter: 'premiere-01', domain: 'suites', skill: 'Modèle discret et seuil', fast: false,
    make(r, level) {
      const up = r.next() < 0.6, t = r.pick(level === 1 ? [2, 3, 4, 5, 6, 8, 10, 12, 15, 20] : [3, 4, 5, 6, 8, 10, 12]);
      const c100 = up ? 100 + t : 100 - t, cTex = numTex(F(c100, 100));
      const P0 = 100 * r.int(5, 90), who = up ? [['La population d’une ville', 'habitants', 'augmente'], ['Le nombre d’abonnés d’une chaîne', 'abonnés', 'augmente'], ['Le nombre de bactéries d’une culture', 'bactéries', 'augmente']] : [['Le nombre de poissons d’un lac', 'poissons', 'diminue'], ['Le nombre d’habitants d’un village', 'habitants', 'diminue'], ['La quantité d’un médicament dans le sang', 'unités', 'diminue']];
      const [subj, unit, verb] = r.pick(who);
      const u = (n) => (P0 * c100 ** n) / 100 ** n, exact = (n) => ({ num: BigInt(P0) * BigInt(c100) ** BigInt(n), den: 100n ** BigInt(n) });
      const intro = `${subj} vaut ${M(P0)} ${unit} aujourd’hui et ${verb} de ${M(`${t}\\,\\%`)} par an. On note ${M('u_n')} sa valeur au bout de ${M('n')} années.`;
      if (level === 1) {
        let n, x; do { n = r.int(3, 10); x = u(n); } while (Math.abs(x - Math.floor(x) - 0.5) < 0.02);
        return { q: `${intro} Exprimer ${M(`${U('n+1')}`)} en fonction de ${M('u_n')}, donner la nature de la suite, puis calculer ${M(U(n))} arrondi à l’unité.`,
          a: `${M(`${U('n+1')}=${cTex}\\,u_n`)} : suite géométrique de raison ${M(cTex)}. ${M(`${U(n)}=${P0}\\times ${cTex}^{${n}}\\approx ${Math.round(x)}`)}.`,
          ok: () => { let y = P0; for (let i = 0; i < n; i++) y = y * (up ? 1 + t / 100 : 1 - t / 100); return Math.round(y) === Math.round(x) && Math.abs(y - x) < 1e-6 * x; } };
      }
      if (level === 2) {
        let N, S, uN1, uN, tries = 0;
        do { N = r.int(4, 25); uN1 = u(N - 1); uN = u(N); S = Math.round((uN1 + uN) / 2); tries++; } while (!(up ? uN1 + 1 < S && S < uN - 1 : uN + 1 < S && S < uN1 - 1) && tries < 50);
        const hold = (n) => { const e = exact(n); return up ? e.num > BigInt(S) * e.den : e.num < BigInt(S) * e.den; };
        const cmp = up ? '>' : '<';
        return { q: `${intro} À partir de combien d’années ${up ? 'dépassera' : 'passera sous'}-t-on ${M(S)} ${unit} ? (Justifier avec la calculatrice ou un tableau de valeurs.)`,
          a: `${M(`u_n=${P0}\\times ${cTex}^{n}`)}. On cherche le plus petit ${M('n')} tel que ${M(`u_n${cmp}${S}`)}. ${M(`${U(N - 1)}\\approx ${roundTex(uN1, 1)}${up ? '<' : '>'}${S}`)} et ${M(`${U(N)}\\approx ${roundTex(uN, 1)}${cmp}${S}`)} : au bout de ${M(N)} ans.`,
          ok: () => { let n = 0; while (!hold(n) && n < 200) n++; return n === N && !hold(N - 1) && (up ? uN1 < S && S < uN : uN < S && S < uN1); } };
      }
      const t3 = r.pick([4, 5, 6, 8, 10]), P3 = 50 * r.int(4, 20), Nw = r.int(7, 22);
      const g = (P3 * (100 + t3) ** Nw) / 100 ** Nw, a = Math.round((g - P3) / Nw);
      const first = () => { for (let n = 1; n < 400; n++) if (BigInt(P3) * BigInt(100 + t3) ** BigInt(n) > BigInt(P3 + n * a) * 100n ** BigInt(n)) return n; return -1; };
      const N = first(), A = (n) => P3 + n * a, B = (n) => (P3 * (100 + t3) ** n) / 100 ** n;
      if (N < 3 || N > 40 || B(N) - A(N) < 1 || A(N - 1) - B(N - 1) < 1 || a <= (P3 * t3) / 100) return this.make(r, level);
      return { q: `Un capital de ${M(`${P3}\\ \\text{€}`)} est placé de deux façons. Plan A : on ajoute ${M(`${a}\\ \\text{€}`)} par an. Plan B : le capital augmente de ${M(`${t3}\\,\\%`)} par an. On note ${M('a_n')} et ${M('b_n')} les capitaux après ${M('n')} années. Donner la nature de chaque suite et son expression, puis déterminer à partir de quelle année le plan B est strictement meilleur.`,
        a: `${M(`a_n=${P3}+${a}n`)} (arithmétique de raison ${M(a)}), ${M(`b_n=${P3}\\times ${numTex(F(100 + t3, 100))}^{n}`)} (géométrique de raison ${M(numTex(F(100 + t3, 100)))}). ${M(`a_{${N - 1}}=${A(N - 1)}`)} et ${M(`b_{${N - 1}}\\approx ${roundTex(B(N - 1), 2)}`)} ; ${M(`a_{${N}}=${A(N)}`)} et ${M(`b_{${N}}\\approx ${roundTex(B(N), 2)}`)}. Le plan B l’emporte à partir de la ${N}${N === 1 ? 'ère' : 'e'} année.`,
        ok: () => { let x = P3, y = P3; for (let n = 1; n <= N; n++) { x += a; y *= 1 + t3 / 100; if (n < N && y > x) return false; if (n === N) return y > x; } return false; } };
    } },

  { id: 'p-seq-reverse', cls: C, chapter: 'premiere-01', domain: 'suites', skill: 'Retrouver un rang, une raison ou un nombre de termes', fast: false,
    make(r, level) {
      if (level === 1) {
        const u0 = r.int(-12, 12), rr = r.nz(-7, 7), n = r.int(6, 40);
        if (r.next() < 0.5) return { q: `${M('(u_n)')} est arithmétique de premier terme ${M(u0)} et de raison ${M(rr)}. Pour quel entier ${M('n')} a-t-on ${M(`u_n=${u0 + n * rr}`)} ?`, a: `${M(`${polyTex([rr, u0], 'n')}=${u0 + n * rr}\\iff n=\\dfrac{${u0 + n * rr}-${par(u0)}}{${par(rr)}}=${n}`)}.`, ok: () => u0 + n * rr === u0 + n * rr && (u0 + n * rr - u0) / rr === n && Number.isInteger(n) };
        return { q: `${M('(u_n)')} est arithmétique, ${M(`${U(0)}=${u0}`)} et ${M(`${U(n)}=${u0 + n * rr}`)}. Déterminer sa raison.`, a: M(`r=\\dfrac{${U(n)}-${U(0)}}{${n}}=\\dfrac{${u0 + n * rr}-${par(u0)}}{${n}}=${rr}`), ok: () => u0 + n * rr - u0 === n * rr && (n * rr) / n === rr };
      }
      if (level === 2) {
        if (r.next() < 0.5) { const q = r.pick([2, 3, 4, 5]), u0 = r.int(1, 6), n = r.int(3, 9); return { q: `${M('(u_n)')} est géométrique de premier terme ${M(u0)} et de raison ${M(q)}. Pour quel entier ${M('n')} a-t-on ${M(`u_n=${u0 * q ** n}`)} ?`, a: M(`${u0}\\times ${q}^{n}=${u0 * q ** n}\\iff ${q}^{n}=${q ** n}\\iff n=${n}`), ok: () => { let x = u0, k = 0; while (x < u0 * q ** n) { x *= q; k++; } return x === u0 * q ** n && k === n; } }; }
        const q = r.pick([2, 3, 4, 5]), u0 = r.int(1, 6), k = r.pick([2, 3, 4]);
        return { q: `${M('(u_n)')} est géométrique de raison strictement positive, ${M(`${U(0)}=${u0}`)} et ${M(`${U(k)}=${u0 * q ** k}`)}. Déterminer sa raison.`, a: M(`${U(k)}=${U(0)}\\,q^{${k}}\\iff q^{${k}}=${q ** k}\\iff q=${q}\\ (q>0)`), ok: () => u0 * q ** k === u0 * q ** k && q > 0 && [1, 2, 3, 4, 5].filter((c) => c ** k === q ** k).join() === `${q}` };
      }
      let u0, rr, n, S; do { u0 = r.int(1, 9); rr = r.int(1, 6); n = r.int(3, 14); S = ((n + 1) * (2 * u0 + n * rr)) / 2; } while (S % 1 !== 0);
      const disc = (2 * u0 + rr) ** 2 - 4 * rr * (2 * u0 - 2 * S), sq = Math.round(Math.sqrt(disc));
      return { q: `${M('(u_n)')} est arithmétique de premier terme ${M(u0)} et de raison ${M(rr)}. On sait que ${M(`${U(0)}+${U(1)}+\\dots+${U('n')}=${S}`)} avec ${M('n')} entier naturel. Déterminer ${M('n')}.`,
        a: `${M(`\\dfrac{(n+1)(${polyTex([rr, 2 * u0], 'n')})}{2}=${S}\\iff ${polyTex([rr, 2 * u0 + rr, 2 * u0 - 2 * S], 'n')}=0`)}. ${M(`\\Delta=${disc}=${sq}^{2}`)}, racines ${M(`n=${fracTex(F(-(2 * u0 + rr) + sq, 2 * rr))}`)} et ${M(`${fracTex(F(-(2 * u0 + rr) - sq, 2 * rr))}`)} ; seule la première est positive : ${M(`n=${n}`)}.`,
        ok: () => { let t = 0; for (let i = 0; i <= n; i++) t += u0 + i * rr; const rts = [(-(2 * u0 + rr) + sq) / (2 * rr), (-(2 * u0 + rr) - sq) / (2 * rr)]; return t === S && sq * sq === disc && rts[0] === n && rts[1] < 0; } };
    } },

  // ============================ 02 Second degré ============================
  { id: 'p-quad-qcm', cls: C, chapter: 'premiere-02', domain: 'algebre', skill: 'QCM sur le second degré', fast: true,
    make(r, level) {
      if (level === 1) {
        let a, b; do { a = r.pick([1, 2, 3, -1, -2, -3, 4]); b = r.nz(-12, 12); } while (false);
        const c = r.int(-8, 8), x0 = F(-b, 2 * a), cands = [x0, F(b, 2 * a), F(-b, a), F(b, a)];
        const why = [`${M('\\alpha=-\\dfrac{b}{2a}')}.`, 'oublie le signe moins de la formule.', 'oublie le facteur 2 du dénominateur.', 'oublie le signe moins et le facteur 2.'];
        return mcq(r, `Le sommet de la parabole d’équation ${M(`y=${polyTex([a, b, c])}`)} a pour abscisse :`, opt(M(numTex(cands[0])), why[0], { v: val(cands[0]) }),
          cands.slice(1).map((f, i) => opt(M(numTex(f)), why[i + 1], { v: val(f) })), (o) => near(nd((x) => a * x * x + b * x + c, o.v), 0, 1e-4));
      }
      if (level === 2) {
        if (r.next() < 0.5) {
          const a = r.nz(-3, 3), b = r.nz(-9, 9), c = r.nz(-9, 9), D = [b * b - 4 * a * c, b * b + 4 * a * c, b - 4 * a * c, -b * b - 4 * a * c];
          return mcq(r, `Le discriminant de ${M(polyTex([a, b, c]))} est :`, opt(M(`${D[0]}`), `${M(`\\Delta=b^{2}-4ac=${par(b)}^{2}-4\\times ${par(a)}\\times ${par(c)}`)}.`, { v: D[0] }),
            [opt(M(`${D[1]}`), 'se trompe de signe devant ' + M('4ac') + '.', { v: D[1] }), opt(M(`${D[2]}`), 'oublie de mettre ' + M('b') + ' au carré.', { v: D[2] }), opt(M(`${D[3]}`), 'calcule ' + M(`-${par(b)}^{2}`) + ' au lieu de ' + M(`(${b})^{2}`) + '.', { v: D[3] }), opt(M(`${b * b - 2 * a * c}`), 'écrit ' + M('2ac') + ' au lieu de ' + M('4ac') + '.', { v: b * b - 2 * a * c })], (o) => o.v === b * b - 4 * a * c);
        }
        let r1, r2, a, b, c, S;
        do { r1 = r.int(-7, 7); r2 = r.int(-7, 7); a = r.pick([1, 2, 3, -1, -2]); b = -a * (r1 + r2); c = a * r1 * r2; S = r1 + r2; } while (r1 === r2 || new Set([S, -S, S / 2, c / a, b]).size < 5);
        const cs = [F(S), F(-S), F(S, 2), F(-b, 1).n === S ? F(c, a) : F(c, a)];
        return mcq(r, `L’équation ${M(`${polyTex([a, b, c])}=0`)} a deux solutions réelles. Leur somme vaut :`, opt(M(numTex(F(S))), `${M(`-\\dfrac{b}{a}=-\\dfrac{${par(b)}}{${par(a)}}`)}.`, { v: S }),
          [opt(M(numTex(F(-S))), 'oublie le signe de la formule ' + M('-\\dfrac{b}{a}') + '.', { v: -S }), opt(M(numTex(F(S, 2))), 'donne l’abscisse du sommet (la moitié de la somme).', { v: S / 2 }), opt(M(numTex(F(c, a))), 'donne le produit des racines ' + M('\\dfrac{c}{a}') + '.', { v: c / a }), opt(M(numTex(F(b, 1))), 'donne ' + M('b') + ' sans diviser par ' + M('a') + '.', { v: b })],
          (o) => near(o.v, r1 + r2) && a * r1 * r1 + b * r1 + c === 0 && a * r2 * r2 + b * r2 + c === 0);
      }
      let r1 = r.int(-8, 6), r2; do { r2 = r1 + r.int(1, 7); } while (false);
      const a = r.pick([1, 2, -1, -2, 3]), op = r.pick(['>=', '<=', '>', '<']), b = -a * (r1 + r2), c = a * r1 * r2, f = (x) => a * x * x + b * x + c;
      const mkSet = (type) => { const e1 = { t: `${r1}`, v: r1 }, e2 = { t: `${r2}`, v: r2 }, closed = op === '>=' || op === '<='; const L = (hc) => [{ lo: null, hi: e1, hc }, { lo: e2, lc: hc, hi: null }]; return type === 'out' ? L(closed) : type === 'in' ? [{ lo: e1, lc: closed, hi: e2, hc: closed }] : type === 'outFlip' ? L(!closed) : [{ lo: e1, lc: !closed, hi: e2, hc: !closed }]; };
      const sets = { out: mkSet('out'), in: mkSet('in'), outFlip: mkSet('outFlip'), inFlip: mkSet('inFlip') };
      const want = ((a > 0) === (op === '>=' || op === '>')) ? 'out' : 'in', wantFlip = want === 'out' ? 'outFlip' : 'inFlip', wrongSide = want === 'out' ? 'in' : 'out', wrongSideFlip = want === 'out' ? 'inFlip' : 'outFlip';
      const T = (k) => M(ivTex(sets[k]));
      const ok = (o) => { for (let k = -40; k <= 40; k++) { const x = (k / 4) + 0; const holds = op === '>=' ? f(x) >= 0 : op === '<=' ? f(x) <= 0 : op === '>' ? f(x) > 0 : f(x) < 0; const inS = o.list.some((i) => (!i.lo || x > i.lo.v || (i.lc && x === i.lo.v)) && (!i.hi || x < i.hi.v || (i.hc && x === i.hi.v))); if (holds !== inS) return false; } return true; };
      const mk = (k, why) => opt(T(k), why, { list: sets[k] });
      return mcq(r, `L’ensemble des solutions de ${M(`${polyTex([a, b, c])}${OPS[op]}0`)} est :`, mk(want, `${M(`a=${a}`)} est ${a > 0 ? 'positif' : 'négatif'} : le trinôme est du signe de ${M('a')} ${want === 'out' ? 'à l’extérieur des' : 'entre les'} racines ${M(r1)} et ${M(r2)} ; les bornes ${op.length === 2 ? 'sont incluses' : 'sont exclues'}.`),
        [mk(wrongSide, `se trompe de côté : confond l’intérieur et l’extérieur des racines (oublie le signe de ${M('a')}).`), mk(wantFlip, 'a le bon côté mais se trompe sur les crochets (bornes incluses ou non).'), mk(wrongSideFlip, 'cumule l’erreur de côté et celle des crochets.')], ok);
    } },

  { id: 'p-quad-ineq', cls: C, chapter: 'premiere-02', domain: 'algebre', skill: 'Inéquations du second degré', fast: true,
    make(r, level) {
      const op = r.pick(['>=', '<=', '>', '<']);
      let a, roots, f, expl;
      if (level <= 2) {
        let r1 = r.int(-8, 6), r2; do { r2 = r.int(-8, 8); } while (r2 === r1);
        [r1, r2] = [Math.min(r1, r2), Math.max(r1, r2)];
        a = level === 1 ? 1 : r.pick([2, 3, -1, -2, -3]); roots = [F(r1), F(r2)];
        expl = [a, -a * (r1 + r2), a * r1 * r2]; f = (x) => evalPoly(expl, x);
      } else {
        const kind = r.pick(['rat', 'rat', 'zero', 'neg']);
        if (kind === 'rat') {
          let m1, n1, m2, n2; do { m1 = r.int(1, 3); n1 = r.nz(-7, 7); m2 = r.int(1, 3); n2 = r.nz(-7, 7); } while (m1 * n2 === m2 * n1 || (m1 === 1 && m2 === 1));
          const s = r.pick([1, -1]); a = s * m1 * m2;
          expl = mulPoly([m1, -n1], [s * m2, -s * n2]); roots = [F(n1, m1), F(n2, m2)].sort((x, y) => val(x) - val(y)); f = (x) => evalPoly(expl, x);
        } else if (kind === 'zero') { const h = r.int(-6, 6), s = r.pick([1, 2, 3, -1, -2]); a = s; expl = [s, -2 * s * h, s * h * h]; roots = [F(h)]; f = (x) => evalPoly(expl, x); }
        else { const h = r.int(-5, 5), k = r.int(1, 6), s = r.pick([1, 2, -1, -2, 3]); a = s; expl = [s, -2 * s * h, s * (h * h + k)]; roots = []; f = (x) => evalPoly(expl, x); }
      }
      const S = ineqSet(a, roots, op), disc = expl[1] ** 2 - 4 * expl[0] * expl[2];
      const rootTxt = roots.length === 2 ? `racines ${M(fracTex(roots[0]))} et ${M(fracTex(roots[1]))}` : roots.length === 1 ? `racine double ${M(fracTex(roots[0]))}` : 'pas de racine réelle';
      return { q: `Résoudre dans ${M(R)} l’inéquation ${M(`${polyTex(expl)}${OPS[op]}0`)}.`, a: `${M(`\\Delta=${disc}`)} : ${rootTxt}, ${M(`a=${a}`)} est ${a > 0 ? 'positif' : 'négatif'}. ${M(`S=${S.tex}`)}.`,
        ok: () => { if ((disc > 0 ? 2 : disc === 0 ? 1 : 0) !== roots.length) return false; for (const x of roots) if (f(val(x)) !== 0 && Math.abs(f(val(x))) > 1e-9) return false; for (let k = -80; k <= 80; k++) { const x = k / 6, v = f(x); const holds = op === '>=' ? v >= -1e-9 : op === '<=' ? v <= 1e-9 : op === '>' ? v > 1e-9 : v < -1e-9; const exactRoot = Math.abs(v) <= 1e-9; if (exactRoot && roots.some((q) => Math.abs(val(q) - x) < 1e-9) === false && false) return false; if (!exactRoot && holds !== S.has(x)) return false; if (exactRoot) { const should = op === '>=' || op === '<='; if (should !== S.has(val(roots.find((q) => Math.abs(val(q) - x) < 1e-9)))) return false; } } return true; } };
    } },

  { id: 'p-quad-tf', cls: C, chapter: 'premiere-02', domain: 'algebre', skill: 'Vrai ou faux sur le second degré', fast: true,
    make(r, level) {
      const m = r.int(1, 30), b = r.nz(-9, 9), c = r.nz(-9, 9); let k; do { k = r.int(2, 12); } while (k === m);
      const fam = {
        1: [
          () => ({ s: `L’équation ${M(`x^{2}+${m}=0`)} a deux solutions réelles.`, v: false, j: `${M(`x^{2}=-${m}`)} est impossible dans ${M(R)} car un carré est positif.`, c: () => [-8, -3, 0, 3, 8].every((x) => x * x + m > 0) }),
          () => ({ s: `Pour tout réel ${M('x')}, ${M(`${polyTex([1, 0, k])}\\geqslant ${k}`)}.`, v: true, j: `${M('x^{2}\\geqslant 0')} donc ${M(`x^{2}+${k}\\geqslant ${k}`)}.`, c: () => [-7, -1, 0, 2, 9].every((x) => x * x + k >= k) }),
          () => ({ s: `La parabole d’équation ${M(`y=${polyTex([-k, b, c])}`)} admet un maximum.`, v: true, j: `Le coefficient de ${M('x^{2}')} est ${M(-k)}, négatif : la parabole est tournée vers le bas.`, c: () => -k < 0 }),
          () => ({ s: `L’équation ${M(`(x-${k})(x+${m})=0`)} a pour solutions ${M(`${k}`)} et ${M(m)}.`, v: false, j: `Un produit est nul si l’un des facteurs l’est : ${M(`x=${k}`)} ou ${M(`x=-${m}`)}. Pour ${M(`x=${m}`)} le produit vaut ${M(`${m - k}\\times ${2 * m}\\neq 0`)}.`, c: () => (m - k) * (2 * m) !== 0 }),
        ],
        2: [
          () => { const neg = r.next() < 0.5, bb = r.int(-6, 6), cc = neg ? Math.floor((bb * bb) / 4) + r.int(1, 5) : Math.ceil((bb * bb) / 4) - r.int(1, 8); const D = bb * bb - 4 * cc, x0 = (-bb + (D > 0 ? 1 : 0)) / 2; return { s: `Pour tout réel ${M('x')}, ${M(`${polyTex([1, bb, cc])}>0`)}.`, v: D < 0, j: D < 0 ? `${M(`\\Delta=${D}<0`)} et le coefficient dominant est positif : le trinôme est toujours strictement positif.` : `${M(`\\Delta=${D}\\geqslant 0`)} : le trinôme s’annule ou change de signe, par exemple en ${M(`x=${numTex(F(-bb, 2))}`)} il vaut ${M(`${numTex(sub(F(cc), F(bb * bb, 4)))}`)}.`.replace(/par exemple.*$/, `par exemple pour ${M(`x=${numTex(F(-bb, 2))}`)} il vaut ${M(numTex(sub(F(cc), F(bb * bb, 4))))}, valeur qui n’est pas strictement positive.`), c: () => { const f = (x) => x * x + bb * x + cc; const allPos = [...Array(401).keys()].every((i) => f((i - 200) / 20) > 0); return allPos === (D < 0); } }; },
          () => { const a2 = r.pick([2, 3, 4, 5]), al = r.int(-6, 6), be = r.int(1, 9); const sq = al === 0 ? 'x' : `(x${sgn(-al)})`; return { s: `La fonction ${M(`f(x)=${a2}${sq}^{2}+${be}`)} s’annule au moins une fois sur ${M(R)}.`, v: false, j: `${M(`${a2}${sq}^{2}\\geqslant 0`)} donc ${M('f(x)\\geqslant ' + be)} avec ${M(`${be}>0`)} : jamais nulle.`, c: () => [...Array(81).keys()].every((i) => a2 * (((i - 40) / 4) - al) ** 2 + be > 0) }; },
          () => { const r1 = r.int(-6, 6), r2 = r.int(-6, 6), a2 = r.pick([1, 2, 3]); return { s: `La somme des solutions de ${M(`${polyTex([a2, -a2 * (r1 + r2), a2 * r1 * r2])}=0`)} est ${M(r1 + r2)}.`.replace(/\\\(\d*-?\d+\\\)\.$/, (x) => x), v: true, j: `${M(`-\\dfrac{b}{a}=\\dfrac{${a2 * (r1 + r2)}}{${a2}}=${r1 + r2}`)} (les solutions sont ${M(r1)} et ${M(r2)}).`, c: () => { const co = [a2, -a2 * (r1 + r2), a2 * r1 * r2]; return evalPoly(co, r1) === 0 && evalPoly(co, r2) === 0 && (r1 === r2 || r1 + r2 === r1 + r2); } }; },
          () => { const p2 = r.int(2, 9), q2 = r.int(1, 6); return { s: `L’équation ${M(`${polyTex([1, -p2, q2])}=0`)} a ${p2 * p2 - 4 * q2 > 0 ? 'une' : 'deux'} solution${''} réelle${p2 * p2 - 4 * q2 > 0 ? '' : 's'} double${''}.`.replace(/a (une|deux).*$/, ''), v: false, j: '', c: () => false }; },
        ].slice(0, 3),
        3: [
          () => { const aa = r.nz(-5, 5), cc = -Math.sign(aa) * r.int(1, 9), bb = r.int(-8, 8); return { s: `Si ${M('a')} et ${M('c')} sont de signes contraires, ${M('ax^{2}+bx+c=0')} a deux solutions réelles distinctes (exemple : ${M(`${polyTex([aa, bb, cc])}=0`)}).`, v: true, j: `${M('ac<0')} donc ${M('\\Delta=b^{2}-4ac>b^{2}\\geqslant 0')}. Ici ${M(`\\Delta=${bb * bb - 4 * aa * cc}>0`)}.`, c: () => aa * cc < 0 && bb * bb - 4 * aa * cc > 0 }; },
          () => { const s0 = r.pick([1, 2, 3, -1, -2]), h = r.int(-6, 6); return { s: `Si ${M('\\Delta=0')}, le trinôme garde un signe constant sur ${M(R)} (exemple : ${M(polyTex([s0, -2 * s0 * h, s0 * h * h]))}).`, v: true, j: `${M(`${polyTex([s0, -2 * s0 * h, s0 * h * h])}=${s0 === 1 ? '' : s0 === -1 ? '-' : s0}(x${sgn(-h)})^{2}`.replace('(x+0)', 'x'))} est du signe de ${M(s0)} partout (et nul en ${M(h)}).`, c: () => [...Array(61).keys()].every((i) => { const x = (i - 30) / 3, v = s0 * (x - h) ** 2; return s0 > 0 ? v >= 0 : v <= 0; }) }; },
          () => { const kk = r.int(3, 12), mm2 = r.int(1, kk - 1); const D = 4 * (kk - mm2); return { s: `Si ${M('f')} et ${M('g')} sont deux trinômes sans racine réelle, ${M('f+g')} n’a pas non plus de racine réelle. (On teste ${M(`f(x)=x^{2}+${kk}`)} et ${M(`g(x)=-2x^{2}-${mm2}`)}.)`, v: false, j: `${M(`f(x)+g(x)=-x^{2}+${kk - mm2}`)} s’annule pour ${M(`x=\\pm\\sqrt{${kk - mm2}}`)}, alors que ${M('f')} et ${M('g')} n’ont aucune racine réelle.`, c: () => kk - mm2 > 0 && D > 0 }; },
        ],
      };
      return tf(r.pick(fam[level])());
    } },

  { id: 'p-quad-error', cls: C, chapter: 'premiere-02', domain: 'algebre', skill: 'Trouver l’erreur dans une résolution du second degré', fast: false,
    make(r, level) {
      if (level === 1) {
        let r1, r2, a, b, c, D, s, kind, Dw, tries = 0;
        do {
          r1 = r.int(-6, 6); r2 = r.int(-6, 6); a = r.pick([1, 1, 2, 3, -1, -2]); b = -a * (r1 + r2); c = a * r1 * r2; D = b * b - 4 * a * c; s = Math.abs(a * (r1 - r2));
          kind = r.pick(['signb', 'den', 'delta']); Dw = b * b + 4 * a * c; tries++;
        } while (tries < 300 && (r1 === r2 || b === 0 || (kind === 'delta' && (c === 0 || !(Dw < 0 || (Math.sqrt(Dw) % 1 === 0 && Dw > 0)))) || (kind === 'den' && r1 * r2 === 0)));
        if (tries >= 300) { kind = 'signb'; }
        const eq0 = `${polyTex([a, b, c])}=0`, rt = (n, d) => fracTex(F(n, d));
        const good = [`\\Delta=${par(b)}^{2}-4\\times ${par(a)}\\times ${par(c)}=${D}`, `x_{1}=\\dfrac{${-b}-${s}}{${2 * a}}=${rt(-b - s, 2 * a)}\\ ;\\ x_{2}=\\dfrac{${-b}+${s}}{${2 * a}}=${rt(-b + s, 2 * a)}`, `S=\\{${[F(-b - s, 2 * a), F(-b + s, 2 * a)].sort((x, y) => val(x) - val(y)).map(fracTex).join('\\,;\\,')}\\}`];
        const sol = (xs) => `S=\\{${xs.sort((x, y) => val(x) - val(y)).map(fracTex).join('\\,;\\,')}\\}`;
        let lines = good, bad, why, fix, shown;
        if (kind === 'signb') { const y1 = F(b - s, 2 * a), y2 = F(b + s, 2 * a); lines = [good[0], `x_{1}=\\dfrac{${b}-${s}}{${2 * a}}=${fracTex(y1)}\\ ;\\ x_{2}=\\dfrac{${b}+${s}}{${2 * a}}=${fracTex(y2)}`, sol([y1, y2])]; bad = 1; why = `la formule commence par ${M('-b')}, ici ${M(`-b=${-b}`)} et non ${M(b)}.`; fix = M(good[1]); shown = [val(y1), val(y2)]; }
        else if (kind === 'den') { const y1 = F(-b - s, a), y2 = F(-b + s, a); lines = [good[0], `x_{1}=\\dfrac{${-b}-${s}}{${a}}=${fracTex(y1)}\\ ;\\ x_{2}=\\dfrac{${-b}+${s}}{${a}}=${fracTex(y2)}`, sol([y1, y2])]; bad = 1; why = `le dénominateur est ${M(`2a=${2 * a}`)}, pas ${M('a')}.`; fix = M(good[1]); shown = [val(y1), val(y2)]; }
        else if (Dw < 0) { lines = [`\\Delta=${par(b)}^{2}+4\\times ${par(a)}\\times ${par(c)}=${Dw}`, `\\Delta<0\\text{ : pas de solution réelle}`, 'S=\\varnothing']; bad = 0; why = `c’est ${M('b^{2}-4ac')} : le signe devant ${M('4ac')} est négatif.`; fix = M(good[0]); shown = []; }
        else { const sw = Math.sqrt(Dw), y1 = F(-b - sw, 2 * a), y2 = F(-b + sw, 2 * a); lines = [`\\Delta=${par(b)}^{2}+4\\times ${par(a)}\\times ${par(c)}=${Dw}`, `x_{1}=\\dfrac{${-b}-${sw}}{${2 * a}}=${fracTex(y1)}\\ ;\\ x_{2}=\\dfrac{${-b}+${sw}}{${2 * a}}=${fracTex(y2)}`, sol([y1, y2])]; bad = 0; why = `c’est ${M('b^{2}-4ac')} : le signe devant ${M('4ac')} est négatif.`; fix = M(good[0]); shown = [val(y1), val(y2)]; }
        return spot(`Pour résoudre ${M(eq0)} dans ${M(R)}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(good[2]), () => evalPoly([a, b, c], r1) === 0 && evalPoly([a, b, c], r2) === 0 && D === b * b - 4 * a * c && D === a * a * (r1 - r2) ** 2 && !(shown.length === 2 && [r1, r2].every((x) => shown.includes(x)) && shown.length === 2 && shown.sort((p, q) => p - q).join() === [r1, r2].sort((p, q) => p - q).join()));
      }
      if (level === 2) {
        const a = r.pick([1, 2, 3, -1, -2]); let al; do { al = r.nz(-6, 6); } while (false);
        const be = r.int(-9, 9), b = -2 * a * al, c = a * al * al + be, kind = r.pick(['alpha', 'beta', 'sign']);
        const f = (x) => a * x * x + b * x + c, can = (al2, be2) => `f(x)=${coef(a)}(x${sgn(-al2)})^{2}${be2 === 0 ? '' : sgn(be2)}`;
        const good = [`\\alpha=-\\dfrac{b}{2a}=-\\dfrac{${par(b)}}{${2 * a}}=${al}`, `\\beta=f(${al})=${polyTex([a, b, c]).replace(/x\^\{2\}/, `\\times ${par(al)}^{2}`)}`, can(al, be)];
        const evalLine = (al2) => `\\beta=f(${al2})=${f(al2)}`;
        let lines, bad, why, fix, shownAl = al, shownBe = be;
        if (kind === 'alpha') { const al2 = -al; lines = [`\\alpha=\\dfrac{b}{2a}=\\dfrac{${par(b)}}{${2 * a}}=${al2}`, evalLine(al2), can(al2, f(al2))]; bad = 0; why = `${M('\\alpha=-\\dfrac{b}{2a}')} : il y a un signe moins devant la fraction.`; fix = M(`\\alpha=-\\dfrac{${par(b)}}{${2 * a}}=${al}`); shownAl = al2; shownBe = f(al2); }
        else if (kind === 'beta') { const be2 = c; lines = [`\\alpha=-\\dfrac{b}{2a}=${al}`, `\\beta=c=${c}`, can(al, be2)]; bad = 1; why = `${M('\\beta')} est l’ordonnée du sommet ${M(`f(\\alpha)=f(${al})`)}, pas le terme constant ${M('c')}.`; fix = M(evalLine(al)); shownBe = be2; }
        else { lines = [`\\alpha=-\\dfrac{b}{2a}=${al}`, evalLine(al), `f(x)=${coef(a)}(x${sgn(al)})^{2}${be === 0 ? '' : sgn(be)}`]; bad = 2; why = `la forme canonique est ${M('a(x-\\alpha)^{2}+\\beta')} : on écrit ${M(`x${sgn(-al)}`)}.`; fix = M(can(al, be)); shownAl = -al; }
        return spot(`Pour mettre ${M(`f(x)=${polyTex([a, b, c])}`)} sous forme canonique, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(can(al, be)), () => [-3, 0, 2, 5].every((x) => f(x) === a * (x - al) ** 2 + be) && b === -2 * a * al && (shownAl !== al || shownBe !== be) && (kind !== 'beta' || c !== be || true));
      }
      let r1, r2; do { r1 = r.int(-7, 6); r2 = r1 + r.int(1, 8); } while (false);
      const a = r.pick([1, 2, 3, -1, -2, -3]), op = r.pick(['>=', '<=', '>', '<']), kind = r.pick(['strict', 'side', 'root']), b = -a * (r1 + r2), c = a * r1 * r2, f = (x) => a * x * x + b * x + c;
      const truth = ineqSet(a, [F(r1), F(r2)], op), strictOp = op === '>' || op === '<', flip = ineqSet(a, [F(r1), F(r2)], strictOp ? (op === '>' ? '>=' : '<=') : (op === '>=' ? '>' : '<'));
      const wantOut = (a > 0) === (op === '>=' || op === '>'), side = ineqSet(-a, [F(r1), F(r2)], op);
      const fac = `f(x)=${coef(a)}(x${sgn(-r1)})(x${sgn(-r2)})`.replace('(x+0)', 'x').replace('(x-0)', 'x'), facBad = `f(x)=${coef(a)}(x${sgn(r1)})(x${sgn(-r2)})`.replace('(x+0)', 'x').replace('(x-0)', 'x');
      const sg = `${M(`a=${a}`)} ${a > 0 ? 'positif' : 'négatif'} : ${M('f')} est du signe de ${M('a')} à l’extérieur des racines`;
      const mid = (flipSide) => `${sg}, donc ${M(`f(x)${OPS[op]}0`)} ${flipSide === wantOut ? 'à l’intérieur' : 'à l’extérieur'}`;
      let lines, bad, why, fix, shown;
      const root2 = (x) => (x === 0 ? 'x' : `(x${sgn(-x)})`);
      if (kind === 'strict') { lines = [M(fac), `${sg}, donc ${M(`f(x)${OPS[op]}0`)} ${wantOut ? 'à l’extérieur' : 'entre'} les racines`, M(`S=${flip.tex}`)]; bad = 2; why = `l’inégalité ${strictOp ? 'est stricte : les bornes sont exclues' : 'est large : les racines sont solutions'}, on ne doit pas changer les crochets.`; fix = M(`S=${truth.tex}`); shown = flip; }
      else if (kind === 'side') { lines = [M(fac), `${sg}, donc ${M(`f(x)${OPS[op]}0`)} ${wantOut ? 'entre' : 'à l’extérieur de'} les racines`, M(`S=${side.tex}`)]; bad = 1; why = `${M(`a=${a}`)} ${a > 0 ? 'positif' : 'négatif'} : ${M('f')} est ${(a > 0) === (op === '>=' || op === '>') ? 'du signe cherché' : 'du signe opposé'} à l’extérieur, donc ${wantOut ? 'l’extérieur' : 'l’intérieur'} convient.`; fix = `${sg}, donc ${M(`f(x)${OPS[op]}0`)} ${wantOut ? 'à l’extérieur' : 'entre'} les racines ; ${M(`S=${truth.tex}`)}`; shown = side; }
      else { const sF = ineqSet(a, [F(-r1), F(r2)].sort((x, y) => val(x) - val(y)), op); lines = [M(facBad), `${sg}, donc ${M(`f(x)${OPS[op]}0`)} ${wantOut ? 'à l’extérieur' : 'entre'} les racines`, M(`S=${sF.tex}`)]; bad = 0; why = `${M(`f(x)=0`)} pour ${M(`x=${r1}`)}, donc le facteur est ${M(`x${sgn(-r1)}`)} et non ${M(`x${sgn(r1)}`)}.`.replace('x+0', 'x'); fix = M(fac); shown = sF; if (r1 === 0) return this.make(r, level); }
      return spot(`Soit ${M(`f(x)=${polyTex([a, b, c])}`)}, dont les racines sont ${M(r1)} et ${M(r2)}. Pour résoudre ${M(`f(x)${OPS[op]}0`)}, un élève écrit une solution.`, lines, bad, why, fix, M(`S=${truth.tex}`), () => { if (f(r1) !== 0 || f(r2) !== 0) return false; let diff = false; for (let k = -60; k <= 60; k++) { const x = k / 4, v = f(x), isR = v === 0, holds = isR ? (op === '>=' || op === '<=') : op === '>=' || op === '>' ? v > 0 : v < 0; if (holds !== truth.has(x)) return false; if (shown.has(x) !== truth.has(x)) diff = true; } return diff; });
    } },

  { id: 'p-quad-param', cls: C, chapter: 'premiere-02', domain: 'algebre', skill: 'Trinôme à paramètre, somme et produit des racines', fast: false,
    make(r, level) {
      if (level === 1) {
        if (r.next() < 0.5) {
          let r1 = r.int(-6, 6), r2; do { r2 = r.int(-6, 6); } while (r2 === r1);
          const b = -(r1 + r2), m = r1 * r2;
          return { q: `${M(r1)} est solution de ${M(`${polyTex([1, b, 0])}+m=0`)} où ${M('m')} est un réel. Déterminer ${M('m')} puis l’autre solution.`, a: `${M(`${par(r1)}^{2}${b === 0 ? '' : sgn(b) + '\\times ' + par(r1)}+m=0\\iff m=${m}`)}. La somme des solutions vaut ${M(`-b=${-b}`)} donc l’autre solution est ${M(`${-b}-${par(r1)}=${r2}`)}.`, ok: () => r1 * r1 + b * r1 + m === 0 && r2 * r2 + b * r2 + m === 0 && r1 + r2 === -b && r1 * r2 === m };
        }
        const a = r.pick([1, 2, 3, -1, -2, 4]); let r1 = r.int(-7, 7), r2; do { r2 = r.int(-7, 7); } while (r2 === r1);
        const co = [a, -a * (r1 + r2), a * r1 * r2], D = co[1] ** 2 - 4 * co[0] * co[2];
        return { q: `Sans calculer le discriminant, donner la somme et le produit des solutions de ${M(`${polyTex(co)}=0`)} (on admet qu’elle a deux solutions réelles).`, a: M(`S=-\\dfrac{b}{a}=${r1 + r2}\\ ;\\ P=\\dfrac{c}{a}=${r1 * r2}`), ok: () => D > 0 && evalPoly(co, r1) === 0 && evalPoly(co, r2) === 0 };
      }
      if (level === 2) {
        const w = r.int(2, 12), h = r.int(w + 1, 25), S = w + h, P = w * h;
        return { q: `Un rectangle a pour périmètre ${M(`${2 * S}\\ \\text{cm}`)} et pour aire ${M(`${P}\\ \\text{cm}^{2}`)}. En considérant la somme et le produit de ses dimensions, déterminer sa longueur et sa largeur.`, a: `${M(`L+\\ell=${S}`)} et ${M(`L\\ell=${P}`)} : ${M('L')} et ${M('\\ell')} sont solutions de ${M(`t^{2}-${S}t+${P}=0`)}, ${M(`\\Delta=${S * S - 4 * P}=${h - w}^{2}`)}, donc ${M(`t=${w}`)} ou ${M(`t=${h}`)} : longueur ${M(`${h}\\ \\text{cm}`)}, largeur ${M(`${w}\\ \\text{cm}`)}.`, ok: () => { const rts = []; for (let t = 1; t <= S; t++) if (t * t - S * t + P === 0) rts.push(t); return rts.length === 2 && rts[0] === w && rts[1] === h && 2 * (w + h) === 2 * S && w * h === P; } };
      }
      let m1 = r.int(-12, 12), m2; do { m2 = r.int(-12, 12); } while (m2 === m1);
      const s = m1 + m2, p = m1 * m2, cm = [s, -p], D = (m) => 4 * m * m - 4 * (s * m - p);
      return { q: `Pour quelles valeurs du réel ${M('m')} l’équation ${M(`x^{2}-2mx+${polyTex(cm, 'm').replace(/^/, '(')})=0`)} admet-elle une unique solution ? Donner alors cette solution.`.replace('+(', '+(').replace(/\)=0/, ')=0'),
        a: `${M(`\\Delta=4m^{2}-4(${polyTex(cm, 'm')})=${polyTex([4, -4 * s, 4 * p], 'm')}=4(m${sgn(-m1)})(m${sgn(-m2)})`.replace('(m+0)', 'm').replace('(m-0)', 'm'))}. ${M('\\Delta=0')} pour ${M(`m=${m1}`)} ou ${M(`m=${m2}`)}. La solution double est ${M('x=m')} : ${M(`x=${m1}`)} (pour ${M(`m=${m1}`)}) et ${M(`x=${m2}`)} (pour ${M(`m=${m2}`)}).`,
        ok: () => { const zs = []; for (let m = -40; m <= 40; m++) if (D(m) === 0) zs.push(m); return zs.join() === [m1, m2].sort((x, y) => x - y).join() && [m1, m2].every((m) => evalPoly([1, -2 * m, s * m - p], m) === 0); } };
    } },

  { id: 'p-quad-opt', cls: C, chapter: 'premiere-02', domain: 'algebre', skill: 'Second degré en contexte : optimum et rentabilité', fast: false,
    make(r, level) {
      const [obj, uq, ub] = r.pick([['pièces', 'centaines de pièces', 'milliers d’euros'], ['objets', 'dizaines d’objets', 'centaines d’euros'], ['pots de confiture', 'centaines de pots', 'centaines d’euros'], ['places de concert', 'centaines de places', 'milliers d’euros']]);
      let r1, r2; do { r1 = r.int(1, 8); r2 = r1 + r.int(2, 12); } while (false);
      if (level <= 2) {
        const a = r.int(1, 4), B = [-a, a * (r1 + r2), -a * r1 * r2], al = F(r1 + r2, 2), be = evalPoly(B, val(al));
        const bF = F(a * (r1 + r2) * (r1 + r2), 4 * 1).n === 0 ? 0 : 0;
        const common = `Une entreprise fabrique et vend ${M('x')} ${uq} (${M(`0\\leqslant x\\leqslant ${r2 + 4}`)}). Son bénéfice, en ${ub}, est ${M(`B(x)=${polyTex(B)}`)}.`;
        if (level === 1) return { q: `${common} Pour quelle production le bénéfice est-il maximal ? Quel est ce bénéfice maximal ?`, a: `${M('B')} est un trinôme de coefficient dominant négatif : le maximum est atteint en ${M(`\\alpha=-\\dfrac{b}{2a}=\\dfrac{${B[1]}}{${2 * a}}=${numTex(al)}`)}, soit ${M(numTex(al))} ${uq}, et vaut ${M(`B(${numTex(al)})=${numTex(F(a * (r2 - r1) * (r2 - r1), 4))}`)} ${ub}.`, ok: () => { const f = (x) => evalPoly(B, x); return near(nd(f, val(al)), 0, 1e-4) && near(f(val(al)), a * (r2 - r1) ** 2 / 4) && f(val(al) + 0.5) < f(val(al)) && f(val(al) - 0.5) < f(val(al)); } };
        return { q: `${common} Déterminer les productions pour lesquelles l’entreprise réalise un bénéfice strictement positif, puis la production qui maximise le bénéfice.`, a: `${M(`B(x)=-${a === 1 ? '' : a}(x-${r1})(x-${r2})`)} : ${M(`\\Delta=${(a * (r2 - r1)) ** 2}`)}, racines ${M(r1)} et ${M(r2)}, ${M(`a<0`)} : ${M('B(x)>0')} sur ${M(`\\left]${r1}\\,;\\,${r2}\\right[`)}. Le maximum est en ${M(`\\alpha=\\dfrac{${r1}+${r2}}{2}=${numTex(al)}`)}, ${M(`B(${numTex(al)})=${numTex(F(a * (r2 - r1) * (r2 - r1), 4))}`)} ${ub}.`, ok: () => { const f = (x) => evalPoly(B, x); return f(r1) === 0 && f(r2) === 0 && f((r1 + r2) / 2) > 0 && f(r1 - 0.5) < 0 && f(r2 + 0.5) < 0 && near(f(val(al)), (a * (r2 - r1) ** 2) / 4); } };
      }
      const c = r.int(1, 3), d = r.int(0, 8), e = c * r1 * r2, p = d + c * (r1 + r2), Cc = [c, d, e], Bq = [-c, p - d, -e], al = F(r1 + r2, 2), be = F(c * (r2 - r1) * (r2 - r1), 4);
      return { q: `Une entreprise produit ${M('x')} ${uq} d’un article (${M(`0\\leqslant x\\leqslant ${r2 + 5}`)}). Le coût de production est ${M(`C(x)=${polyTex(Cc)}`)} et la recette est ${M(`R(x)=${p}x`)} (en ${ub}). 1) Exprimer le bénéfice ${M('B(x)')}. 2) Montrer que ${M(`B(x)=-${c === 1 ? '' : c}(x-${r1})(x-${r2})`)}. 3) En déduire l’intervalle de rentabilité et la production qui maximise le bénéfice ainsi que ce bénéfice.`,
        a: `1) ${M(`B(x)=R(x)-C(x)=${polyTex(Bq)}`)}. 2) ${M(`-${c === 1 ? '' : c}(x-${r1})(x-${r2})=-${c === 1 ? '' : c}(x^{2}-${r1 + r2}x+${r1 * r2})`)} qui redonne ${M('B(x)')}. 3) ${M('B(x)>0')} sur ${M(`\\left]${r1}\\,;\\,${r2}\\right[`)} ; le maximum est en ${M(`\\alpha=${numTex(al)}`)} et vaut ${M(`B(${numTex(al)})=${numTex(be)}`)} ${ub}.`,
        ok: () => { const f = (x) => p * x - evalPoly(Cc, x); return [0, 1, 2.5, 7, 13].every((x) => near(f(x), evalPoly(Bq, x)) && near(f(x), -c * (x - r1) * (x - r2))) && f(r1) === 0 && f(r2) === 0 && near(f((r1 + r2) / 2), val(be)) && f(r1 - 0.25) < 0 && f(r2 + 0.25) < 0; } };
    } },

  // ============================ 03 Vecteurs et produit scalaire ============================
  { id: 'p-dot-qcm', cls: C, chapter: 'premiere-03', domain: 'geometrie', skill: 'QCM sur le produit scalaire', fast: true,
    make(r, level) {
      const V = (u) => M(vc(u[0], u[1]));
      if (level === 1) {
        let u, v, c4;
        do { u = [r.int(-6, 6), r.int(-6, 6)]; v = [r.int(-6, 6), r.int(-6, 6)]; c4 = [u[0] * v[0] + u[1] * v[1], u[0] * v[1] - u[1] * v[0], u[0] * v[0] - u[1] * v[1], (u[0] + v[0]) * (u[1] + v[1])]; } while (new Set(c4).size < 4 || u[0] * u[1] * v[0] * v[1] === 0);
        return mcq(r, `Avec ${M(`\\vec{u}${vc(...u)}`)} et ${M(`\\vec{v}${vc(...v)}`)}, le produit scalaire ${M('\\vec{u}\\cdot\\vec{v}')} vaut :`, opt(M(`${c4[0]}`), `${M(`xx'+yy'=${par(u[0])}\\times ${par(v[0])}+${par(u[1])}\\times ${par(v[1])}`)}.`, { v: c4[0] }),
          [opt(M(`${c4[1]}`), 'calcule le déterminant ' + M('xy\'-yx\'') + ' au lieu du produit scalaire.', { v: c4[1] }), opt(M(`${c4[2]}`), 'soustrait les produits au lieu de les additionner.', { v: c4[2] }), opt(M(`${c4[3]}`), 'additionne les coordonnées avant de les multiplier.', { v: c4[3] })], (o) => o.v === u.reduce((s, x, i) => s + x * v[i], 0));
      }
      if (level === 2) {
        const T = r.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [7, 24, 25], [9, 12, 15]]);
        let a, b, n; if (r.next() < 0.5) { [a, b] = [T[0] * r.sign(), T[1] * r.sign()]; n = T[2]; } else { [a, b] = [T[1] * r.sign(), T[0] * r.sign()]; n = T[2]; }
        const nn = a * a + b * b, C4 = [[n, '\\|\\vec{u}\\|^{2}=x^{2}+y^{2}\\text{ puis la racine}', 'racine de la somme des carrés.'], [Math.abs(a) + Math.abs(b), '', 'additionne les valeurs absolues des coordonnées.'], [nn, '', 'donne le carré de la norme (oublie la racine).'], [Math.abs(a) - Math.abs(b), '', 'soustrait les coordonnées.']];
        return mcq(r, `La norme de ${M(`\\vec{u}${vc(...[a, b])}`)} vaut :`, opt(M(`${n}`), `${M(`\\sqrt{${par(a)}^{2}+${par(b)}^{2}}=\\sqrt{${nn}}=${n}`)}.`, { v: n }), C4.slice(1).map((x) => opt(M(`${x[0]}`), x[2], { v: x[0] })), (o) => o.v === Math.hypot(a, b));
      }
      const A = r.int(2, 9), B = r.int(2, 9), th = r.pick([60, 120]), s = th === 60 ? 1 : -1, ab = A * B, cands = [[F(s * ab, 2), `${M('\\vec{AB}\\cdot\\vec{AC}=AB\\times AC\\times\\cos\\theta')}.`], [F(-s * ab, 2), 'se trompe de signe pour le cosinus.'], [F(ab), 'oublie le cosinus.'], [null, 'utilise ' + M('\\sin\\theta') + ' au lieu de ' + M('\\cos\\theta') + '.']];
      const txt = (f, i) => (i === 3 ? `${numTex(F(ab, 2))}\\sqrt{3}` : numTex(f)), nv = (f, i) => (i === 3 ? (ab * Math.sqrt(3)) / 2 : val(f));
      return mcq(r, `Dans un triangle ${M('ABC')}, ${M(`AB=${A}`)}, ${M(`AC=${B}`)} et ${M(`\\widehat{BAC}=${th}^{\\circ}`)}. Alors ${M('\\overrightarrow{AB}\\cdot\\overrightarrow{AC}')} vaut :`, opt(M(txt(cands[0][0], 0)), cands[0][1], { v: nv(cands[0][0], 0) }),
        cands.slice(1).map((x, i) => opt(M(txt(x[0], i + 1)), x[1], { v: nv(x[0], i + 1) })), (o) => near(o.v, A * B * Math.cos((th * Math.PI) / 180)));
    } },

  { id: 'p-dot-norms', cls: C, chapter: 'premiere-03', domain: 'geometrie', skill: 'Produit scalaire avec normes et angle', fast: false,
    make(r, level) {
      if (level === 1) {
        const a = r.int(2, 9), b = r.int(2, 9), th = r.pick([0, 60, 90, 120, 180]), c = { 0: F(1), 60: F(1, 2), 90: F(0), 120: F(-1, 2), 180: F(-1) }[th], v = mul(F(a * b), c);
        return { q: `On donne ${M(`\\|\\vec{u}\\|=${a}`)}, ${M(`\\|\\vec{v}\\|=${b}`)} et une mesure ${M(`${th}^{\\circ}`)} de l’angle entre ${M('\\vec{u}')} et ${M('\\vec{v}')}. Calculer ${M('\\vec{u}\\cdot\\vec{v}')}.`, a: M(`\\vec{u}\\cdot\\vec{v}=${a}\\times ${b}\\times\\cos ${th}^{\\circ}=${numTex(v)}`), ok: () => near(val(v), a * b * Math.cos((th * Math.PI) / 180), 1e-9) };
      }
      if (level === 2) {
        const A = r.int(2, 30), B = r.int(2, 30), k2 = r.int(-Math.floor(Math.sqrt(A * B)), Math.floor(Math.sqrt(A * B)) + 3), k = F(k2, 2); const C2 = A + B + k2;
        if (C2 <= 0 || k2 === 0) return this.make(r, level);
        return { q: `Pour deux vecteurs ${M('\\vec{u}')} et ${M('\\vec{v}')}, on connaît ${M(`\\|\\vec{u}\\|^{2}=${A}`)}, ${M(`\\|\\vec{v}\\|^{2}=${B}`)} et ${M(`\\|\\vec{u}+\\vec{v}\\|^{2}=${C2}`)}. Calculer ${M('\\vec{u}\\cdot\\vec{v}')}.`, a: M(`\\vec{u}\\cdot\\vec{v}=\\dfrac{1}{2}\\left(\\|\\vec{u}+\\vec{v}\\|^{2}-\\|\\vec{u}\\|^{2}-\\|\\vec{v}\\|^{2}\\right)=\\dfrac{${C2}-${A}-${B}}{2}=${numTex(k)}`), s: M('\\|\\vec{u}+\\vec{v}\\|^{2}=\\|\\vec{u}\\|^{2}+2\\vec{u}\\cdot\\vec{v}+\\|\\vec{v}\\|^{2}'), ok: () => near(val(k), (C2 - A - B) / 2) && near(A + B + 2 * val(k), C2) };
      }
      let a, b, c; do { a = r.int(3, 12); b = r.int(3, 12); c = r.int(3, 12); } while (a + b <= c || a + c <= b || b + c <= a);
      const dot = F(b * b + c * c - a * a, 2), cosv = (b * b + c * c - a * a) / (2 * b * c), ang = (Math.acos(cosv) * 180) / Math.PI;
      if (Math.abs(ang * 10 - Math.round(ang * 10)) < 0.03 || cosv === 0) return this.make(r, level);
      return { q: `Dans un triangle ${M('ABC')}, ${M(`AB=${c}`)}, ${M(`AC=${b}`)} et ${M(`BC=${a}`)}. Calculer ${M('\\overrightarrow{AB}\\cdot\\overrightarrow{AC}')} sans repère, puis une valeur approchée au dixième de degré de l’angle ${M('\\widehat{BAC}')}.`,
        a: `${M(`\\overrightarrow{AB}\\cdot\\overrightarrow{AC}=\\dfrac{AB^{2}+AC^{2}-BC^{2}}{2}=\\dfrac{${c * c}+${b * b}-${a * a}}{2}=${numTex(dot)}`)}. ${M(`\\cos\\widehat{BAC}=\\dfrac{${numTex(dot)}}{${b * c}}=${fracTex(div(dot, F(b * c)))}`)} donc ${M(`\\widehat{BAC}\\approx ${roundTex(ang, 1)}^{\\circ}`)}.`,
        ok: () => { const A = [0, 0], B = [c, 0], Cx = (b * b + c * c - a * a) / (2 * c), Cy = Math.sqrt(b * b - Cx * Cx), P = [Cx, Cy]; return near(Math.hypot(P[0] - B[0], P[1]) , a, 1e-9) && near(B[0] * P[0] + B[1] * P[1], val(dot), 1e-9) && Math.abs(Math.round(ang * 10) / 10 - Math.atan2(Cy, Cx) * 180 / Math.PI) < 0.051; } };
    } },

  { id: 'p-dot-tf', cls: C, chapter: 'premiere-03', domain: 'geometrie', skill: 'Vrai ou faux sur le produit scalaire', fast: true,
    make(r, level) {
      const a = r.nz(-9, 9), b = r.nz(-9, 9), c = r.nz(1, 9), d = r.nz(-9, 9);
      const W = (u) => M(vc(u[0], u[1]));
      const fam = {
        1: [
          () => ({ s: `Les vecteurs ${M(`\\vec{u}${vc(...[a, b])}`)} et ${M(`\\vec{v}${vc(...[-b, a])}`)} sont orthogonaux.`, v: true, j: `${M(`\\vec{u}\\cdot\\vec{v}=${par(a)}\\times ${par(-b)}+${par(b)}\\times ${par(a)}=0`)}.`, c: () => a * -b + b * a === 0 }),
          () => ({ s: `Si ${M('\\vec{u}\\cdot\\vec{v}=0')}, alors ${M('\\vec{u}=\\vec{0}')} ou ${M('\\vec{v}=\\vec{0}')}.`, v: false, j: `Contre-exemple : ${M(`\\vec{u}${vc(...[c, 0])}`)} et ${M(`\\vec{v}${vc(...[0, c])}`)} sont non nuls et ${M(`\\vec{u}\\cdot\\vec{v}=0`)}.`, c: () => c * 0 + 0 * c === 0 && c !== 0 }),
          () => ({ s: `Pour ${M(`\\vec{u}${vc(...[a, b])}`)}, ${M('\\vec{u}\\cdot\\vec{u}')} vaut ${M(a * a + b * b)}.`, v: true, j: `${M(`\\vec{u}\\cdot\\vec{u}=${par(a)}^{2}+${par(b)}^{2}=${a * a + b * b}=\\|\\vec{u}\\|^{2}`)}.`, c: () => a * a + b * b === Math.hypot(a, b) ** 2 + 0 || Math.abs(a * a + b * b - Math.hypot(a, b) ** 2) < 1e-9 }),
          () => ({ s: `${M(`\\vec{u}${vc(...[a, b])}`)} et ${M(`\\vec{v}${vc(...[c, d])}`)} vérifient ${M(`\\vec{u}\\cdot\\vec{v}=${a * d - b * c}`)}.`, v: a * c + b * d === a * d - b * c, j: `${M(`\\vec{u}\\cdot\\vec{v}=${par(a)}\\times ${par(c)}+${par(b)}\\times ${par(d)}=${a * c + b * d}`)}, ${a * c + b * d === a * d - b * c ? 'valeur annoncée' : `et non ${M(a * d - b * c)} (qui est le déterminant)`}.`, c: () => (a * c + b * d === a * d - b * c) === (a * c + b * d === a * d - b * c) && a * c + b * d !== undefined }),
        ],
        2: [
          () => { const x = r.int(1, 5); return { s: `Si ${M('\\vec{u}\\cdot\\vec{v}=\\vec{u}\\cdot\\vec{w}')} avec ${M('\\vec{u}\\neq\\vec{0}')}, alors ${M('\\vec{v}=\\vec{w}')}.`, v: false, j: `Avec ${M(`\\vec{u}${vc(...[x, 0])}`)}, ${M(`\\vec{v}${vc(...[a, b])}`)} et ${M(`\\vec{w}${vc(...[a, b + 1])}`)} : ${M(`\\vec{u}\\cdot\\vec{v}=\\vec{u}\\cdot\\vec{w}=${x * a}`)} mais ${M('\\vec{v}\\neq\\vec{w}')}.`, c: () => x * a + 0 * b === x * a + 0 * (b + 1) && b !== b + 1 }; },
          () => { const A = [r.int(-5, 5), r.int(-5, 5)], p = r.nz(-4, 4), q = r.nz(-4, 4), rect = r.next() < 0.5, B = [A[0] + p, A[1] + q], Cc = rect ? [A[0] - q * c, A[1] + p * c] : [A[0] - q * c + 1, A[1] + p * c]; const ab = [p, q], ac = [Cc[0] - A[0], Cc[1] - A[1]]; return { s: `Dans un repère orthonormé, ${M(`A${pt(...A)}`)}, ${M(`B${pt(...B)}`)} et ${M(`C${pt(...Cc)}`)} forment un triangle rectangle en ${M('A')}.`, v: rect, j: `${M(`\\overrightarrow{AB}${vc(...ab)}`)}, ${M(`\\overrightarrow{AC}${vc(...ac)}`)} : ${M(`\\overrightarrow{AB}\\cdot\\overrightarrow{AC}=${ab[0] * ac[0] + ab[1] * ac[1]}`)}, ${rect ? 'nul : angle droit en ' + M('A') + '.' : 'non nul : l’angle en ' + M('A') + ' n’est pas droit.'}`, c: () => (ab[0] * ac[0] + ab[1] * ac[1] === 0) === rect }; },
          () => ({ s: `Si ${M('\\vec{u}\\cdot\\vec{v}<0')}, l’angle entre ${M('\\vec{u}')} et ${M('\\vec{v}')} est obtus.`, v: true, j: `${M('\\vec{u}\\cdot\\vec{v}=\\|\\vec{u}\\|\\|\\vec{v}\\|\\cos\\theta')} avec des normes positives : le cosinus est négatif, donc ${M('\\theta>90^{\\circ}')}.`, c: () => [91, 120, 179].every((t) => Math.cos((t * Math.PI) / 180) < 0) }),
        ],
        3: [
          () => ({ s: `Pour tous vecteurs ${M('\\vec{u}')} et ${M('\\vec{v}')}, ${M('\\|\\vec{u}+\\vec{v}\\|=\\|\\vec{u}\\|+\\|\\vec{v}\\|')}. (On teste ${M(`\\vec{u}${vc(...[c, 0])}`)} et ${M(`\\vec{v}${vc(...[0, c])}`)}.)`, v: false, j: `${M(`\\|\\vec{u}+\\vec{v}\\|=\\sqrt{${2 * c * c}}`)} alors que ${M(`\\|\\vec{u}\\|+\\|\\vec{v}\\|=${2 * c}`)} : ${M(`\\sqrt{${2 * c * c}}\\neq ${2 * c}`)}.`, c: () => Math.abs(Math.hypot(c, c) - 2 * c) > 1e-9 }),
          () => ({ s: `Pour tous vecteurs ${M('\\vec{u}')} et ${M('\\vec{v}')}, ${M('(\\vec{u}+\\vec{v})\\cdot(\\vec{u}-\\vec{v})=\\|\\vec{u}\\|^{2}-\\|\\vec{v}\\|^{2}')}.`, v: true, j: `${M('(\\vec{u}+\\vec{v})\\cdot(\\vec{u}-\\vec{v})=\\vec{u}\\cdot\\vec{u}-\\vec{u}\\cdot\\vec{v}+\\vec{v}\\cdot\\vec{u}-\\vec{v}\\cdot\\vec{v}=\\|\\vec{u}\\|^{2}-\\|\\vec{v}\\|^{2}')}. Vérification avec ${M(`\\vec{u}${vc(...[a, b])}`)} et ${M(`\\vec{v}${vc(...[c, d])}`)} : ${M(`${(a + c) * (a - c) + (b + d) * (b - d)}=${a * a + b * b}-${c * c + d * d}`)}.`, c: () => (a + c) * (a - c) + (b + d) * (b - d) === a * a + b * b - (c * c + d * d) }),
          () => ({ s: `Si ${M('\\|\\vec{u}+\\vec{v}\\|=\\|\\vec{u}-\\vec{v}\\|')}, alors ${M('\\vec{u}')} et ${M('\\vec{v}')} sont orthogonaux.`, v: true, j: `${M('\\|\\vec{u}+\\vec{v}\\|^{2}-\\|\\vec{u}-\\vec{v}\\|^{2}=4\\,\\vec{u}\\cdot\\vec{v}')} : l’égalité des normes donne ${M('\\vec{u}\\cdot\\vec{v}=0')}.`, c: () => { const u = [a, b], v = [-b * c, a * c]; return Math.abs(Math.hypot(u[0] + v[0], u[1] + v[1]) - Math.hypot(u[0] - v[0], u[1] - v[1])) < 1e-9 && u[0] * v[0] + u[1] * v[1] === 0; } }),
          () => ({ s: `Pour ${M(`\\vec{u}${vc(...[a, b])}`)} et ${M(`\\vec{v}${vc(...[c, d])}`)}, ${M('(\\vec{u}\\cdot\\vec{v})^{2}\\leqslant\\|\\vec{u}\\|^{2}\\|\\vec{v}\\|^{2}')} : ici ${M(`${(a * c + b * d) ** 2}\\leqslant ${(a * a + b * b) * (c * c + d * d)}`)}.`, v: true, j: `Car ${M('|\\cos\\theta|\\leqslant 1')} : ${M('(\\vec{u}\\cdot\\vec{v})^{2}=\\|\\vec{u}\\|^{2}\\|\\vec{v}\\|^{2}\\cos^{2}\\theta')}. Ici ${M(`(${a * c + b * d})^{2}=${(a * c + b * d) ** 2}`)} et ${M(`${a * a + b * b}\\times ${c * c + d * d}=${(a * a + b * b) * (c * c + d * d)}`)}.`, c: () => (a * c + b * d) ** 2 <= (a * a + b * b) * (c * c + d * d) }),
        ],
      };
      return tf(r.pick(fam[level])());
    } },

  { id: 'p-dot-error', cls: C, chapter: 'premiere-03', domain: 'geometrie', skill: 'Trouver l’erreur dans un calcul de produit scalaire', fast: false,
    make(r, level) {
      if (level === 1) {
        let u, v, kind;
        do { u = [r.int(-7, 7), r.int(-7, 7)]; v = [r.int(-7, 7), r.int(-7, 7)]; kind = r.pick(['det', 'sign', 'sum']); } while (u.some((x) => x === 0) || v.some((x) => x === 0) || (u[0] * v[0] > 0 && u[1] * v[1] > 0 && kind === 'sign'));
        const p1 = u[0] * v[0], p2 = u[1] * v[1], T = p1 + p2, good = [`\\vec{u}\\cdot\\vec{v}=${par(u[0])}\\times ${par(v[0])}+${par(u[1])}\\times ${par(v[1])}`, `\\vec{u}\\cdot\\vec{v}=${p1}${sgn(p2)}`, `\\vec{u}\\cdot\\vec{v}=${T}`];
        let lines = good, bad, why, fix, shown = T;
        if (kind === 'det') { const w1 = u[0] * v[1], w2 = u[1] * v[0], W = w1 - w2; lines = [`\\vec{u}\\cdot\\vec{v}=${par(u[0])}\\times ${par(v[1])}-${par(u[1])}\\times ${par(v[0])}`, `\\vec{u}\\cdot\\vec{v}=${w1}-${par(w2)}`, `\\vec{u}\\cdot\\vec{v}=${W}`]; bad = 0; why = `c’est le déterminant. Le produit scalaire est ${M('xx\'+yy\'')}.`; fix = M(good[0]); shown = W; }
        else if (kind === 'sign') { const q1 = p1 > 0 ? p1 : Math.abs(p1), q2 = p2 > 0 ? p2 : Math.abs(p2); lines = [good[0], `\\vec{u}\\cdot\\vec{v}=${q1}${sgn(q2)}`, `\\vec{u}\\cdot\\vec{v}=${q1 + q2}`]; bad = 1; why = `${M(`${par(u[0])}\\times ${par(v[0])}=${p1}`)} et ${M(`${par(u[1])}\\times ${par(v[1])}=${p2}`)} : la règle des signes n’a pas été appliquée.`; fix = M(good[1]); shown = q1 + q2; }
        else { const bb = p1 + p2 + (r.next() < 0.5 ? 1 : -1) * r.int(1, 3); lines = [good[0], good[1], `\\vec{u}\\cdot\\vec{v}=${bb}`]; bad = 2; why = `${M(`${p1}${sgn(p2)}=${T}`)}, erreur d’addition.`; fix = M(good[2]); shown = bb; }
        if (shown === T) return this.make(r, level);
        return spot(`Pour calculer ${M('\\vec{u}\\cdot\\vec{v}')} avec ${M(`\\vec{u}${vc(...u)}`)} et ${M(`\\vec{v}${vc(...v)}`)}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(good[2]), () => T === u[0] * v[0] + u[1] * v[1] && shown !== T);
      }
      if (level === 2) {
        const TR = [[3, 4, 5], [5, 12, 13], [8, 6, 10], [4, 3, 5], [12, 5, 13], [6, 8, 10]];
        let t1, t2, sx, sy, kind; do { t1 = r.pick(TR); t2 = r.pick(TR); sx = [r.sign(), r.sign()]; sy = [r.sign(), r.sign()]; kind = r.pick(['norm', 'mult']); } while (t1[0] * sx[0] * t2[0] * sy[0] + t1[1] * sx[1] * t2[1] * sy[1] === 0);
        const u = [t1[0] * sx[0], t1[1] * sx[1]], v = [t2[0] * sy[0], t2[1] * sy[1]], d = u[0] * v[0] + u[1] * v[1], n = t1[2] * t2[2], good = [`\\vec{u}\\cdot\\vec{v}=${par(u[0])}\\times ${par(v[0])}+${par(u[1])}\\times ${par(v[1])}=${d}`, `\\|\\vec{u}\\|\\|\\vec{v}\\|=\\sqrt{${t1[0] ** 2 + t1[1] ** 2}}\\times\\sqrt{${t2[0] ** 2 + t2[1] ** 2}}=${t1[2]}\\times ${t2[2]}=${n}`, `\\cos\\theta=\\dfrac{\\vec{u}\\cdot\\vec{v}}{\\|\\vec{u}\\|\\|\\vec{v}\\|}=${fracTex(F(d, n))}`];
        let lines, bad, why, fix, shown = F(d, n);
        if (kind === 'norm') { const n2 = (Math.abs(t1[0]) + Math.abs(t1[1])) * t2[2]; lines = [good[0], `\\|\\vec{u}\\|\\|\\vec{v}\\|=(${t1[0]}+${t1[1]})\\times ${t2[2]}=${n2}`, `\\cos\\theta=\\dfrac{${d}}{${n2}}=${fracTex(F(d, n2))}`]; bad = 1; why = `${M('\\|\\vec{u}\\|')} est ${M(`\\sqrt{${par(u[0])}^{2}+${par(u[1])}^{2}}=${t1[2]}`)}, pas la somme des coordonnées.`; fix = M(good[1]); shown = F(d, n2); }
        else { lines = [good[0], good[1], `\\cos\\theta=\\vec{u}\\cdot\\vec{v}\\times\\|\\vec{u}\\|\\|\\vec{v}\\|=${d * n}`]; bad = 2; why = `on divise par ${M('\\|\\vec{u}\\|\\|\\vec{v}\\|')}, on ne multiplie pas (un cosinus est compris entre ${M('-1')} et ${M(1)}).`; fix = M(good[2]); shown = F(d * n); }
        return spot(`Pour trouver le cosinus de l’angle ${M('\\theta')} entre ${M(`\\vec{u}${vc(...u)}`)} et ${M(`\\vec{v}${vc(...v)}`)}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(good[2]), () => d === u[0] * v[0] + u[1] * v[1] && Math.hypot(...u) * Math.hypot(...v) === n && !eq(shown, F(d, n)) && Math.abs(d / n) <= 1);
      }
      let a, b, c, kind; do { a = r.nz(-8, 8); b = r.nz(-8, 8); c = r.nz(-8, 8); kind = r.pick(['signk', 'prod']); } while ((a * c) % b !== 0);
      const k = -(a * c) / b, good = [`\\vec{u}\\cdot\\vec{v}=k\\times ${par(b)}+${par(a)}\\times ${par(c)}=${polyTex([b, a * c], 'k')}`, `${polyTex([b, a * c], 'k')}=0\\iff k=-\\dfrac{${par(a * c)}}{${par(b)}}`, `k=${k}`];
      let lines, bad, why, fix, shown = k;
      if (kind === 'signk') { const k2 = (a * c) / b; lines = [good[0], `${polyTex([b, a * c], 'k')}=0\\iff k=\\dfrac{${par(a * c)}}{${par(b)}}`, `k=${k2}`]; bad = 1; why = `on isole ${M('k')} : ${M(`${b}k=${-a * c}`)}, donc ${M(`k=\\dfrac{${par(-a * c)}}{${par(b)}}`)}.`; fix = M(good[1]); shown = k2; }
      else { lines = [`\\vec{u}\\cdot\\vec{v}=k\\times ${par(b)}\\times ${par(a)}\\times ${par(c)}`, `${coef(b * a * c)}k=0\\iff k=0`, 'k=0']; bad = 0; why = `le produit scalaire est une somme de produits de coordonnées : ${M('xx\'+yy\'')}.`; fix = M(good[0]); shown = 0; }
      if (shown === k) return this.make(r, level);
      return spot(`Pour déterminer ${M('k')} tel que ${M(`\\vec{u}${vc('k', a)}`)} et ${M(`\\vec{v}${vc(b, c)}`)} soient orthogonaux, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(good[2]), () => k * b + a * c === 0 && shown * b + a * c !== 0 && Number.isInteger(k));
    } },

  { id: 'p-dot-angle', cls: C, chapter: 'premiere-03', domain: 'geometrie', skill: 'Produit scalaire dans un triangle repéré', fast: false,
    make(r, level) {
      const P = () => [r.int(-6, 6), r.int(-6, 6)];
      if (level <= 2) {
        let A, B, Cc, ab, ac, dot, cosv, ang;
        do { A = P(); B = P(); Cc = P(); ab = [B[0] - A[0], B[1] - A[1]]; ac = [Cc[0] - A[0], Cc[1] - A[1]]; dot = ab[0] * ac[0] + ab[1] * ac[1]; cosv = dot / (Math.hypot(...ab) * Math.hypot(...ac)); ang = (Math.acos(cosv) * 180) / Math.PI; } while (!(ab[0] * ac[1] - ab[1] * ac[0] !== 0 && Math.abs(ang * 10 - Math.round(ang * 10)) > 0.03));
        const base = `Dans un repère orthonormé, ${M(`A${pt(...A)}`)}, ${M(`B${pt(...B)}`)} et ${M(`C${pt(...Cc)}`)}.`;
        if (level === 1) return { q: `${base} Calculer ${M('\\overrightarrow{AB}\\cdot\\overrightarrow{AC}')}.`, a: `${M(`\\overrightarrow{AB}${vc(...ab)}`)} et ${M(`\\overrightarrow{AC}${vc(...ac)}`)} donc ${M(`\\overrightarrow{AB}\\cdot\\overrightarrow{AC}=${par(ab[0])}\\times ${par(ac[0])}+${par(ab[1])}\\times ${par(ac[1])}=${dot}`)}.`, ok: () => dot === (B[0] - A[0]) * (Cc[0] - A[0]) + (B[1] - A[1]) * (Cc[1] - A[1]) };
        const nab = ab[0] ** 2 + ab[1] ** 2, nac = ac[0] ** 2 + ac[1] ** 2;
        return { q: `${base} Déterminer une valeur approchée au dixième de degré de l’angle ${M('\\widehat{BAC}')}.`, a: `${M(`\\overrightarrow{AB}\\cdot\\overrightarrow{AC}=${dot}`)}, ${M(`AB=\\sqrt{${nab}}`)}, ${M(`AC=\\sqrt{${nac}}`)}. ${M(`\\cos\\widehat{BAC}=\\dfrac{${dot}}{\\sqrt{${nab}}\\sqrt{${nac}}}\\approx ${roundTex(cosv, 3)}`)} donc ${M(`\\widehat{BAC}\\approx ${roundTex(ang, 1)}^{\\circ}`)}.`, ok: () => { const t1 = Math.atan2(ab[1], ab[0]), t2 = Math.atan2(ac[1], ac[0]); let d = Math.abs(t1 - t2); if (d > Math.PI) d = 2 * Math.PI - d; return Math.abs((d * 180) / Math.PI - ang) < 1e-6 && Math.abs(Math.round(ang * 10) / 10 - ang) < 0.05; } };
      }
      let xA, yA, xB, yB, yC, k;
      do { xA = r.int(-6, 6); yA = r.int(-6, 6); xB = r.int(-6, 6); yB = r.int(-6, 6); yC = r.int(-6, 6); k = xB - ((yA - yB) * (yC - yB)) / (xA - xB); } while (xA === xB || yA === yB || yC === yB || !Number.isInteger(k) || k === xB);
      return { q: `Dans un repère orthonormé, ${M(`A${pt(xA, yA)}`)}, ${M(`B${pt(xB, yB)}`)} et ${M(`C(k\\,;\\,${yC})`)} où ${M('k')} est un réel. Déterminer ${M('k')} pour que le triangle ${M('ABC')} soit rectangle en ${M('B')}, puis calculer l’aire de ce triangle.`,
        a: `${M(`\\overrightarrow{BA}${vc(xA - xB, yA - yB)}`)}, ${M(`\\overrightarrow{BC}${vc(xB === 0 ? 'k' : `k${sgn(-xB)}`, yC - yB)}`)}. ${M(`\\overrightarrow{BA}\\cdot\\overrightarrow{BC}=0\\iff ${par(xA - xB)}${xm(xB, 'k')}+${par(yA - yB)}\\times ${par(yC - yB)}=0\\iff k=${k}`)}. Alors ${M(`BA=\\sqrt{${(xA - xB) ** 2 + (yA - yB) ** 2}}`)}, ${M(`BC=\\sqrt{${(k - xB) ** 2 + (yC - yB) ** 2}}`)} et l’aire vaut ${M(`\\dfrac{BA\\times BC}{2}=${numTex(F(Math.abs((xA - xB) * (yC - yB) - (yA - yB) * (k - xB)), 2))}`)}.`,
        ok: () => { const ba = [xA - xB, yA - yB], bc = [k - xB, yC - yB]; return ba[0] * bc[0] + ba[1] * bc[1] === 0 && Math.abs(Math.sqrt(ba[0] ** 2 + ba[1] ** 2) * Math.sqrt(bc[0] ** 2 + bc[1] ** 2) / 2 - Math.abs(ba[0] * bc[1] - ba[1] * bc[0]) / 2) < 1e-9; } };
    } },

  { id: 'p-vect-collinear', cls: C, chapter: 'premiere-03', domain: 'geometrie', skill: 'Colinéarité et déterminant', fast: true,
    make(r, level) {
      const det = (u, v) => u[0] * v[1] - u[1] * v[0];
      if (level === 1) {
        let u, v, col = r.next() < 0.5;
        do { u = [r.nz(-6, 6), r.nz(-6, 6)]; const t = r.pick([2, 3, -1, -2, -3]); v = col ? [u[0] * t, u[1] * t] : [r.int(-8, 8), r.int(-8, 8)]; } while (!col && det(u, v) === 0);
        const d = det(u, v);
        return { q: `Les vecteurs ${M(`\\vec{u}${vc(...u)}`)} et ${M(`\\vec{v}${vc(...v)}`)} sont-ils colinéaires ?`, a: `${M(`\\det(\\vec{u},\\vec{v})=${par(u[0])}\\times ${par(v[1])}-${par(u[1])}\\times ${par(v[0])}=${d}`)} : ${d === 0 ? 'ils sont colinéaires' : 'ils ne sont pas colinéaires'}.`, ok: () => (d === 0) === (u[0] * v[1] === u[1] * v[0]) && (d === 0) === col };
      }
      if (level === 2) {
        let a, b, c, k; do { a = r.nz(-8, 8); b = r.nz(-8, 8); c = r.nz(-8, 8); k = (a * b) / c; } while (!Number.isInteger(k) || k === 0);
        return { q: `Déterminer le réel ${M('k')} pour que ${M(`\\vec{u}${vc('k', a)}`)} et ${M(`\\vec{v}${vc(b, c)}`)} soient colinéaires.`, a: M(`k\\times ${par(c)}-${par(a)}\\times ${par(b)}=0\\iff k=\\dfrac{${a * b}}{${par(c)}}=${k}`), ok: () => det([k, a], [b, c]) === 0 && Number.isInteger(k) };
      }
      let A, B, Cc, D, t, p, q;
      do { A = [r.int(-6, 6), r.int(-6, 6)]; p = r.nz(-4, 4); q = r.nz(-4, 4); t = r.pick([2, 3, -1, -2, -3]); B = [A[0] + p, A[1] + q]; Cc = [r.int(-6, 6), r.int(-6, 6)]; D = [Cc[0] + t * p, Cc[1] + t * q]; } while (Cc[0] === A[0] && Cc[1] === A[1]);
      const ab = [p, q], cd = [t * p, t * q], colAC = det(ab, [Cc[0] - A[0], Cc[1] - A[1]]) === 0;
      return { q: `Dans un repère, ${M(`A${pt(...A)}`)}, ${M(`B${pt(...B)}`)}, ${M(`C${pt(...Cc)}`)} et ${M(`D${pt(...D)}`)}. Montrer que ${M('(AB)')} et ${M('(CD)')} sont parallèles, exprimer ${M('\\overrightarrow{AB}')} en fonction de ${M('\\overrightarrow{CD}')}, puis dire si ${M('A')}, ${M('B')} et ${M('C')} sont alignés.`,
        a: `${M(`\\overrightarrow{AB}${vc(...ab)}`)}, ${M(`\\overrightarrow{CD}${vc(...cd)}`)} : ${M(`\\det=${par(p)}\\times ${par(t * q)}-${par(q)}\\times ${par(t * p)}=0`)}, donc ${M('(AB)\\parallel(CD)')} et ${M(`\\overrightarrow{AB}=${fracTex(F(1, t))}\\,\\overrightarrow{CD}`)}. ${M(`\\overrightarrow{AC}${vc(Cc[0] - A[0], Cc[1] - A[1])}`)} : ${M(`\\det(\\overrightarrow{AB},\\overrightarrow{AC})=${det(ab, [Cc[0] - A[0], Cc[1] - A[1]])}`)}, ${colAC ? 'les points sont alignés.' : 'les points ne sont pas alignés : les droites parallèles sont distinctes.'}`,
        ok: () => det(ab, cd) === 0 && cd[0] === t * ab[0] && cd[1] === t * ab[1] && D[0] - Cc[0] === cd[0] && colAC === (det([B[0] - A[0], B[1] - A[1]], [Cc[0] - A[0], Cc[1] - A[1]]) === 0) };
    } },

  { id: 'p-dot-line', cls: C, chapter: 'premiere-03', domain: 'geometrie', skill: 'Vecteur normal et équation de droite', fast: false,
    make(r, level) {
      const P = () => [r.int(-7, 7), r.int(-7, 7)];
      if (level === 1) {
        let n, A; do { n = [r.nz(-6, 6), r.nz(-6, 6)]; A = P(); } while (false);
        const c = -(n[0] * A[0] + n[1] * A[1]);
        return { q: `Dans un repère orthonormé, donner une équation cartésienne de la droite passant par ${M(`A${pt(...A)}`)} et de vecteur normal ${M(`\\vec{n}${vc(...n)}`)}.`, a: `${M(`M(x\\,;\\,y)\\in d\\iff\\overrightarrow{AM}\\cdot\\vec{n}=0\\iff ${par(n[0])}\\times ${xm(A[0])}+${par(n[1])}\\times ${xm(A[1], 'y')}=0`)}, soit ${M(`${lin([[n[0], 'x'], [n[1], 'y'], [c, '']])}=0`)}.`, ok: () => n[0] * A[0] + n[1] * A[1] + c === 0 && [[1, 0], [0, 1], [2, 3]].every(([s, t]) => { const x = A[0] + s * n[1], y = A[1] - s * n[0] + 0 * t; return n[0] * x + n[1] * y + c === 0; }) };
      }
      if (level === 2) {
        let A, B, Cc; do { A = P(); B = P(); Cc = P(); } while ((B[0] === Cc[0] && B[1] === Cc[1]));
        const n = [Cc[0] - B[0], Cc[1] - B[1]], c = -(n[0] * A[0] + n[1] * A[1]);
        return { q: `Dans un repère orthonormé, ${M(`A${pt(...A)}`)}, ${M(`B${pt(...B)}`)} et ${M(`C${pt(...Cc)}`)}. Déterminer une équation cartésienne de la perpendiculaire à ${M('(BC)')} passant par ${M('A')}.`, a: `${M(`\\overrightarrow{BC}${vc(...n)}`)} est un vecteur normal : ${M(`${lin([[n[0], 'x'], [n[1], 'y'], [c, '']])}=0`)}.`, ok: () => n[0] * A[0] + n[1] * A[1] + c === 0 && [-3, 2, 5].every((s) => { const x = A[0] + s * -n[1], y = A[1] + s * n[0]; return n[0] * x + n[1] * y + c === 0; }) };
      }
      let A, B; do { A = P(); B = P(); } while (A[0] === B[0] && A[1] === B[1]);
      const a2 = 2 * (B[0] - A[0]), b2 = 2 * (B[1] - A[1]), c2 = -(B[0] ** 2 + B[1] ** 2 - A[0] ** 2 - A[1] ** 2), [na, nb, nc] = normLine(a2, b2, c2);
      return { q: `Dans un repère orthonormé, ${M(`A${pt(...A)}`)} et ${M(`B${pt(...B)}`)}. Déterminer une équation cartésienne de la médiatrice de ${M('[AB]')}, de deux façons : avec le milieu et un vecteur normal, puis avec l’égalité ${M('MA^{2}=MB^{2}')}.`,
        a: `Milieu ${M(`I\\left(${numTex(F(A[0] + B[0], 2))}\\,;\\,${numTex(F(A[1] + B[1], 2))}\\right)`)}, vecteur normal ${M(`\\overrightarrow{AB}${vc(B[0] - A[0], B[1] - A[1])}`)}. Avec ${M('MA^{2}=MB^{2}')} : ${M(`(x${sgn(-A[0])})^{2}+(y${sgn(-A[1])})^{2}=(x${sgn(-B[0])})^{2}+(y${sgn(-B[1])})^{2}`.replace(/\(x\+0\)/g, 'x').replace(/\(y\+0\)/g, 'y').replace(/\(x-0\)/g, 'x'))}, d’où ${M(`${lin([[na, 'x'], [nb, 'y'], [nc, '']])}=0`)}.`,
        ok: () => { const MA = (x, y) => (x - A[0]) ** 2 + (y - A[1]) ** 2, MB = (x, y) => (x - B[0]) ** 2 + (y - B[1]) ** 2; const pts = nb !== 0 ? [-3, 0, 4].map((x) => [x, -(na * x + nc) / nb]) : [-3, 0, 4].map((y) => [-nc / na, y]); return pts.every(([x, y]) => near(MA(x, y), MB(x, y), 1e-9)) && na * (A[0] + B[0]) + nb * (A[1] + B[1]) + 2 * nc === 0; } };
    } },

  // ============================ 04 Dérivation ============================
  { id: 'p-deriv-qcm', cls: C, chapter: 'premiere-04', domain: 'analyse', skill: 'QCM sur le calcul de dérivées', fast: true,
    make(r, level) {
      const D = (f) => (x) => nd(f, x);
      if (level === 1) {
        const c = [r.nz(-4, 4), r.nz(-5, 5), r.nz(-6, 6), r.nz(-8, 8)], d = [3 * c[0], 2 * c[1], c[2]], f = (x) => evalPoly(c, x);
        const T = (p) => M(`f'(x)=${polyTex(p)}`), cs = [[d, 'on dérive terme à terme : ' + M("(x^{n})'=nx^{n-1}") + ' et la dérivée d’une constante est nulle.'], [[c[0], c[1], c[2]], 'oublie de multiplier par l’exposant.'], [[...d, c[3]], 'garde la constante au lieu de la supprimer.'], [[3 * c[0], 2 * c[1], c[2] + c[3]], 'ajoute la constante au coefficient de ' + M('x') + '.']];
        return mcq(r, `La dérivée de ${M(`f(x)=${polyTex(c)}`)} est :`, opt(T(cs[0][0]), cs[0][1], { p: cs[0][0] }), cs.slice(1).map(([p, w]) => opt(T(p), w, { p })), (o) => [-2, 0.5, 3].every((x) => near(nd(f, x), evalPoly(o.p, x), 1e-4)));
      }
      if (level === 2) {
        const a = r.nz(-4, 4), b = r.nz(-3, 3), c = r.nz(-5, 5), f = (x) => (x * x + a) * (b * x + c), t = (p) => M(`f'(x)=${polyTex(p)}`);
        const cs = [[[3 * b, 2 * c, a * b], 'dérivée d’un produit : ' + M("u'v+uv'") + ' avec ' + M("u'=2x") + ' et ' + M("v'=" + b) + '.'], [[2 * b, 0], 'calcule ' + M("u'v'") + ' : la dérivée d’un produit n’est pas le produit des dérivées.'], [[b, 2 * c, -a * b], 'utilise ' + M("u'v-uv'") + ' (formule du quotient).'], [[2 * b, 2 * c, 0], 'oublie le terme ' + M("uv'") + '.']];
        return mcq(r, `La dérivée de ${M(`f(x)=(x^{2}${sgn(a)})(${polyTex([b, c])})`)} est :`, opt(t(cs[0][0]), cs[0][1], { p: cs[0][0] }), cs.slice(1).map(([p, w]) => opt(t(p), w, { p })), (o) => [-2, 0.5, 3].every((x) => near(nd(f, x), evalPoly(o.p, x), 1e-4)));
      }
      let a, b, c, d; do { a = r.nz(-5, 5); b = r.nz(-5, 5); c = r.nz(-4, 4); d = r.nz(-5, 5); } while (a * d - b * c === 0 || a * d + b * c === 0 || c === 0 || a * d - b * c === b * c - a * d);
      const k = a * d - b * c, den = `(${polyTex([c, d])})`, f = (x) => (a * x + b) / (c * x + d), at = [-7.3, 2.2, 5.1];
      const T = (n, p) => M(`f'(x)=\\dfrac{${n}}{${p}}`);
      return mcq(r, `La dérivée de ${M(`f(x)=\\dfrac{${polyTex([a, b])}}{${polyTex([c, d])}}`)} est :`, opt(T(k, `${den}^{2}`), `${M("\\left(\\dfrac{u}{v}\\right)'=\\dfrac{u'v-uv'}{v^{2}}")}.`, { g: (x) => k / (c * x + d) ** 2 }),
        [opt(T(a * d + b * c, `${den}^{2}`), 'se trompe de signe dans le numérateur ' + M("u'v-uv'") + '.', { g: (x) => (a * d + b * c) / (c * x + d) ** 2 }), opt(T(-k, `${den}^{2}`), 'inverse l’ordre : ' + M("uv'-u'v") + '.', { g: (x) => -k / (c * x + d) ** 2 }), opt(T(k, den), 'oublie le carré au dénominateur.', { g: (x) => k / (c * x + d) }), opt(M(`f'(x)=${fracTex(F(a, c))}`), 'dérive le numérateur et le dénominateur séparément.', { g: () => a / c })],
        (o) => at.every((x) => near(nd(f, x), o.g(x), 1e-3)));
    } },

  { id: 'p-deriv-rate', cls: C, chapter: 'premiere-04', domain: 'analyse', skill: 'Taux d’accroissement et nombre dérivé', fast: false,
    make(r, level) {
      if (level === 1) {
        const a = r.nz(-4, 4), b = r.int(-6, 6), c = r.int(-6, 6), x0 = r.int(-4, 4), f = (x) => a * x * x + b * x + c, m = 2 * a * x0 + b;
        return { q: `Soit ${M(`f(x)=${polyTex([a, b, c])}`)}. Pour ${M('h\\neq 0')}, calculer et simplifier le taux d’accroissement ${M(`\\dfrac{f(${x0}+h)-f(${x0})}{h}`)}, puis en déduire ${M(`f'(${x0})`)}.`,
          a: `${M(`\\dfrac{f(${x0}+h)-f(${x0})}{h}=${polyTex([a, m], 'h')}`)}. Quand ${M('h')} tend vers ${M(0)}, on obtient ${M(`f'(${x0})=${m}`)}.`, ok: () => [1 / 2, 1 / 3, -2].every((h) => near((f(x0 + h) - f(x0)) / h, a * h + m, 1e-9)) && near(nd(f, x0), m, 1e-4)};
      }
      if (level === 2) {
        const a = r.nz(-3, 3), b = r.int(-6, 6), x0 = r.int(-3, 3), f = (x) => a * x ** 3 + b * x, m = 3 * a * x0 * x0 + b;
        return { q: `Soit ${M(`f(x)=${polyTex([a, 0, b, 0])}`)}. Pour ${M('h\\neq 0')}, montrer que ${M(`\\dfrac{f(${x0}+h)-f(${x0})}{h}=${polyTex([a, 3 * a * x0, m], 'h')}`)}, puis en déduire ${M(`f'(${x0})`)}.`,
          a: `${M(`f(${x0}+h)=${coef(a)}(${x0}+h)^{3}${b === 0 ? '' : sgn(b) + '(' + x0 + '+h)'}`)}. En développant, ${M(`\\dfrac{f(${x0}+h)-f(${x0})}{h}=${coef(a)}\\left(${polyTex([1, 3 * x0, 3 * x0 * x0], 'h')}\\right)${b === 0 ? '' : sgn(b)}=${polyTex([a, 3 * a * x0, m], 'h')}`)}. Quand ${M('h\\to 0')} : ${M(`f'(${x0})=${m}`)}.`, ok: () => [1 / 2, 1 / 3, -2].every((h) => near((f(x0 + h) - f(x0)) / h, a * h * h + 3 * a * x0 * h + m, 1e-9)) && near(nd(f, x0), m, 1e-4) };
      }
      const a = r.nz(-6, 6), b = r.int(-5, 5), x0 = r.pick([-4, -3, -2, -1, 1, 2, 3, 4]), f = (x) => a / x + b, m = F(-a, x0 * x0), T = F(-a, x0);
      return { q: `Soit ${M(`f(x)=\\dfrac{${a}}{x}${b === 0 ? '' : sgn(b)}`)} définie sur ${M('\\mathbb{R}^{*}')}. Pour ${M(`h\\neq 0`)} et ${M(`${x0}+h\\neq 0`)}, simplifier ${M(`\\dfrac{f(${x0}+h)-f(${x0})}{h}`)}, en déduire ${M(`f'(${x0})`)} puis l’équation réduite de la tangente en ${M(x0)}.`,
        a: `${M(`\\dfrac{f(${x0}+h)-f(${x0})}{h}=\\dfrac{1}{h}\\left(\\dfrac{${a}}{${x0}+h}-\\dfrac{${a}}{${x0}}\\right)=\\dfrac{${-a}}{${par(x0)}(${x0}+h)}`)} qui tend vers ${M(fracTex(m))} quand ${M('h\\to 0')}, donc ${M(`f'(${x0})=${fracTex(m)}`)}. Comme ${M(`f(${x0})=${fracTex(add(F(a, x0), F(b)))}`)}, la tangente a pour équation ${M(`y=${affTex(m, sub(add(F(a, x0), F(b)), mul(m, F(x0))))}`)}.`,
        ok: () => [1 / 2, 1 / 3, -1 / 5].every((h) => near((f(x0 + h) - f(x0)) / h, -a / (x0 * (x0 + h)), 1e-9)) && near(nd(f, x0), val(m), 1e-3) && eq(mul(F(x0), T), F(-a)) === true };
    } },

  { id: 'p-deriv-tf', cls: C, chapter: 'premiere-04', domain: 'analyse', skill: 'Vrai ou faux sur la dérivation', fast: true,
    make(r, level) {
      let a; do { a = r.nz(-40, 40); } while (a === 1); const b = r.nz(-40, 40), x0 = r.nz(-30, 30), n = r.int(3, 30), k = r.int(2, 90);
      const fam = {
        1: [
          () => ({ s: `La dérivée de ${M(`f(x)=x(${polyTex([1, a])})`)} est ${M(`f'(x)=1\\times 1`)}.`, v: false, j: `La dérivée d’un produit n’est pas le produit des dérivées : ${M(`f(x)=${polyTex([1, a, 0])}`)} donc ${M(`f'(x)=${polyTex([2, a])}`)}.`, c: () => [1, 2, 3].some((x) => 2 * x + a !== 1) && [1, 2, 3].every((x) => near(nd((t) => t * (t + a), x), 2 * x + a, 1e-4)) }),
          () => ({ s: `La dérivée de ${M(`f(x)=x^{${n}}`)} est ${M(`f'(x)=${n}x^{${n - 1}}`)}.`, v: true, j: `C’est la formule ${M("(x^{n})'=nx^{n-1}")}.`, c: () => [-2, 0.5, 3].every((x) => near(nd((t) => t ** n, x), n * x ** (n - 1), 1e-3)) }),
          () => ({ s: `La dérivée de la fonction constante ${M(`f(x)=${k}`)} est ${M(`f'(x)=${k}`)}.`, v: false, j: `Une constante ne varie pas : ${M("f'(x)=0")}.`, c: () => near(nd(() => k, 2), 0) && k !== 0 }),
          () => ({ s: `Si ${M(`f'(${x0})=0`)}, la tangente à la courbe de ${M('f')} au point d’abscisse ${M(x0)} est horizontale.`, v: true, j: `Son coefficient directeur est ${M(`f'(${x0})=0`)}, donc son équation est ${M(`y=f(${x0})`)}.`, c: () => true }),
        ],
        2: [
          () => ({ s: `Si ${M(`f'(x)>0`)} sur un intervalle ${M('I')}, alors ${M('f')} est strictement croissante sur ${M('I')}.`, v: true, j: 'C’est le théorème qui relie le signe de la dérivée aux variations (exemple : ' + M(`f(x)=${polyTex([k, a])}`) + ' avec ' + M(`f'(x)=${k}>0`) + ').', c: () => k > 0 && [1, 2].every((x) => k * (x + 1) + a > k * x + a) }),
          () => ({ s: `Si ${M(`f'(${x0})=0`)}, alors ${M('f')} admet un extremum local en ${M(x0)}. (On teste ${M(`f(x)=(x${sgn(-x0)})^{3}`.replace('(x+0)', 'x'))}.)`, v: false, j: `${M(`f'(x)=3(x${sgn(-x0)})^{2}`.replace('(x+0)', 'x'))} s’annule en ${M(x0)} mais reste positive de part et d’autre : ${M('f')} est strictement croissante, sans extremum.`, c: () => near(nd((t) => (t - x0) ** 3, x0), 0, 1e-4) && (x0 - 1 - x0) ** 3 < 0 && (1) ** 3 > 0 }),
          () => ({ s: `La dérivée de ${M(`f(x)=\\dfrac{1}{x}`)} sur ${M(']0\\,;\\,+\\infty[')} est ${M(`f'(x)=\\dfrac{1}{x^{2}}`)}.`, v: false, j: `${M(`f'(x)=-\\dfrac{1}{x^{2}}`)} : elle est négative, ce qui est cohérent avec la décroissance de la fonction inverse. Par exemple ${M("f'(1)=-1")}.`, c: () => near(nd((t) => 1 / t, 1), -1, 1e-4) }),
          () => ({ s: `L’équation réduite de la tangente à la courbe de ${M(`f(x)=${polyTex([1, 0, a])}`)} en ${M(x0)} est ${M(`y=${polyTex([2 * x0, a - x0 * x0])}`)}.`, v: true, j: `${M(`f(${x0})=${x0 * x0 + a}`)}, ${M(`f'(${x0})=${2 * x0}`)} : ${M(`y=${2 * x0}(x${sgn(-x0)})${sgn(x0 * x0 + a)}=${polyTex([2 * x0, a - x0 * x0])}`)}.`, c: () => { const m = 2 * x0, p = x0 * x0 + a - m * x0; return p === a - x0 * x0 && near(nd((t) => t * t + a, x0), m, 1e-4); } }),
        ],
        3: [
          () => ({ s: `Si ${M('f')} est croissante sur ${M('I')}, alors ${M(`f'(x)>0`)} pour tout ${M('x')} de ${M('I')}. (On teste ${M('f(x)=x^{3}')} en ${M(0)}.)`, v: false, j: `${M('f(x)=x^{3}')} est strictement croissante sur ${M(R)} mais ${M("f'(0)=0")} : on a seulement ${M("f'(x)\\geqslant 0")}.`, c: () => near(nd((t) => t ** 3, 0), 0, 1e-4) }),
          () => ({ s: `La dérivée de ${M(`f(x)=(${polyTex([a, b])})^{${n}}`)} est ${M(`f'(x)=${n}(${polyTex([a, b])})^{${n - 1}}`)}.`, v: false, j: `Il manque le facteur ${M(a)} (dérivée de l’intérieur) : ${M(`f'(x)=${n * a}(${polyTex([a, b])})^{${n - 1}}`)}. Vérification en ${M(0)} : ${M(`f'(0)=${n * a}\\times ${par(b)}^{${n - 1}}`)}.`, c: () => near(nd((t) => (a * t + b) ** n, 0.3), n * a * (a * 0.3 + b) ** (n - 1), 1e-3) && a !== 1 }),
          () => ({ s: `Pour ${M('g')} dérivable ne s’annulant pas, ${M("\\left(\\dfrac{1}{g}\\right)'=-\\dfrac{g'}{g^{2}}")}. (Ici ${M(`g(x)=${polyTex([a, b])}`)}, soit ${M(`\\left(\\dfrac{1}{g}\\right)'(x)=-\\dfrac{${a}}{(${polyTex([a, b])})^{2}}`)}.)`, v: true, j: `Quotient avec ${M('u=1')} et ${M('v=g')} : ${M("\\dfrac{0\\times g-1\\times g'}{g^{2}}")}.`, c: () => near(nd((t) => 1 / (a * t + b), 0.37), -a / (a * 0.37 + b) ** 2, 1e-3) }),
          () => ({ s: `Si ${M(`f(x)=x^{2}`)} et ${M(`g(x)=${polyTex([1, a])}`)}, la dérivée de ${M('f\\circ g')} est ${M(`2(x${sgn(a)})`)}.`, v: true, j: `${M(`(f\\circ g)(x)=(x${sgn(a)})^{2}`)}, dérivée ${M(`2(x${sgn(a)})\\times 1`)}.`, c: () => near(nd((t) => (t + a) ** 2, 1.3), 2 * (1.3 + a), 1e-3) }),
        ],
      };
      return tf(r.pick(fam[level])());
    } },

  { id: 'p-deriv-error', cls: C, chapter: 'premiere-04', domain: 'analyse', skill: 'Trouver l’erreur dans un calcul de dérivée ou de tangente', fast: false,
    make(r, level) {
      if (level === 1) {
        let a, b, c, x0, kind, m, y0, p;
        do { a = r.nz(-4, 4); b = r.int(-6, 6); c = r.nz(-6, 6); x0 = r.nz(-4, 4); kind = r.pick(['const', 'f0', 'swap']); m = 2 * a * x0 + b; y0 = a * x0 * x0 + b * x0 + c; p = y0 - m * x0; } while (m === 0 || (kind === 'f0' && a === 1));
        const f = (x) => a * x * x + b * x + c, tang = (mm, yy) => `y=${mm}(x${sgn(-x0)})${sgn(yy)}\\text{, soit }y=${polyTex([mm, yy - mm * x0])}`;
        const good = [`f'(x)=${polyTex([2 * a, b])}`, `f'(${x0})=${m}\\ ;\\ f(${x0})=${y0}`, tang(m, y0)];
        let lines = good, bad, why, fix, shown = p;
        if (kind === 'const') { const mw = m + c; lines = [`f'(x)=${polyTex([2 * a, b, c])}`, `f'(${x0})=${mw}\\ ;\\ f(${x0})=${y0}`, tang(mw, y0)]; bad = 0; why = `la dérivée d’une constante est ${M(0)}, le terme ${M(c)} disparaît.`; fix = M(good[0]); shown = y0 - mw * x0; }
        else if (kind === 'f0') { const yw = (a * x0) ** 2 + b * x0 + c; lines = [good[0], `f'(${x0})=${m}\\ ;\\ f(${x0})=${yw}`, tang(m, yw)]; bad = 1; why = `${M(`f(${x0})=${par(a)}\\times ${par(x0)}^{2}${sgn(b)}\\times ${par(x0)}${sgn(c)}`)} : le carré ne porte que sur ${M(x0)}.`; fix = M(good[1]); shown = yw - m * x0; }
        else { lines = [good[0], good[1], `y=${m}(x${sgn(x0)})${sgn(y0)}\\text{, soit }y=${polyTex([m, y0 + m * x0])}`]; bad = 2; why = `la tangente en ${M(x0)} s’écrit ${M(`y=f'(${x0})(x-${par(x0)})+f(${x0})`)}.`; fix = M(good[2]); shown = y0 + m * x0; }
        return spot(`Pour déterminer l’équation réduite de la tangente à la courbe de ${M(`f(x)=${polyTex([a, b, c])}`)} au point d’abscisse ${M(x0)}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(`y=${polyTex([m, p])}`), () => near(nd(f, x0), m, 1e-4) && f(x0) === y0 && m * x0 + p === y0 && shown !== p);
      }
      let a, b, c, d, kind;
      do { a = r.nz(-5, 5); b = r.nz(-5, 5); c = r.nz(-4, 4); d = r.nz(-5, 5); kind = r.pick(level === 2 ? ['uv', 'diff'] : ['order', 'den', 'sum']); } while (a * d - b * c === 0 || a * d + b * c === 0 || c === 0 || (level === 2 && (a * c === a * d - b * c || a * c === 0)));
      const fU = polyTex([a, b]), fV = polyTex([c, d]);
      if (level === 2) {
        const f = (x) => (a * x + b) * (c * x + d), good = [`u=${fU},\\ v=${fV},\\ u'=${a},\\ v'=${c}`, `f'(x)=u'v+uv'=${par(a)}(${fV})+(${fU})\\times ${par(c)}`, `f'(x)=${polyTex([2 * a * c, a * d + b * c])}`];
        let lines, bad, why, fix, shownP;
        if (kind === 'uv') { lines = [good[0], `f'(x)=u'v'=${par(a)}\\times ${par(c)}`, `f'(x)=${a * c}`]; bad = 1; why = `la dérivée d’un produit est ${M("u'v+uv'")}, pas ${M("u'v'")}.`; fix = M(good[1]); shownP = [a * c]; }
        else { lines = [good[0], `f'(x)=u'v-uv'=${par(a)}(${fV})-(${fU})\\times ${par(c)}`, `f'(x)=${a * d - b * c}`]; bad = 1; why = `pour un produit on additionne : ${M("(uv)'=u'v+uv'")} (le signe moins est celui du quotient).`; fix = M(good[1]); shownP = [a * d - b * c]; }
        return spot(`Pour dériver ${M(`f(x)=(${fU})(${fV})`)}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(good[2]), () => [-2, 0.5, 3].every((x) => near(nd(f, x), 2 * a * c * x + a * d + b * c, 1e-4)) && !(shownP.length === 2 ? false : [-2, 0.5, 3].every((x) => near(2 * a * c * x + a * d + b * c, shownP[0]))));
      }
      const k = a * d - b * c, f = (x) => (a * x + b) / (c * x + d), q2 = `(${fV})^{2}`;
      const good = [`u=${fU},\\ v=${fV},\\ u'=${a},\\ v'=${c}`, `f'(x)=\\dfrac{u'v-uv'}{v^{2}}=\\dfrac{${par(a)}(${fV})-(${fU})\\times ${par(c)}}{${q2}}`, `f'(x)=\\dfrac{${k}}{${q2}}`];
      let lines, bad, why, fix, g;
      if (kind === 'order') { lines = [good[0], `f'(x)=\\dfrac{uv'-u'v}{v^{2}}=\\dfrac{(${fU})\\times ${par(c)}-${par(a)}(${fV})}{${q2}}`, `f'(x)=\\dfrac{${-k}}{${q2}}`]; bad = 1; why = `le numérateur du quotient est ${M("u'v-uv'")}, dans cet ordre.`; fix = M(good[1]); g = (x) => -k / (c * x + d) ** 2; }
      else if (kind === 'den') { lines = [good[0], `f'(x)=\\dfrac{u'v-uv'}{v}=\\dfrac{${par(a)}(${fV})-(${fU})\\times ${par(c)}}{${fV}}`, `f'(x)=\\dfrac{${k}}{${fV}}`]; bad = 1; why = `le dénominateur du quotient est ${M('v^{2}')}.`; fix = M(good[1]); g = (x) => k / (c * x + d); }
      else { lines = [good[0], good[1], `f'(x)=\\dfrac{${a * d + b * c}}{${q2}}`]; bad = 2; why = `${M(`${a}(${fV})-(${fU})\\times ${par(c)}=${polyTex([a * c, a * d])}-(${polyTex([a * c, b * c])})=${k}`)} : on retranche aussi ${M(b * c)}.`; fix = M(good[2]); g = (x) => (a * d + b * c) / (c * x + d) ** 2; }
      return spot(`Pour dériver ${M(`f(x)=\\dfrac{${fU}}{${fV}}`)}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(good[2]), () => [-7.3, 2.2, 5.1].every((x) => near(nd(f, x), k / (c * x + d) ** 2, 1e-3)) && g(2.2) !== k / (c * 2.2 + d) ** 2);
    } },

  { id: 'p-deriv-graph', cls: C, chapter: 'premiere-04', domain: 'analyse', skill: 'Nombres dérivés lus sur un tableau ou un graphique', fast: false,
    make(r, level) {
      if (level === 1) {
        const a = r.int(-4, 4), ya = r.int(-5, 5); let dx, dy; do { dx = r.nz(-4, 4); dy = r.int(-8, 8); } while (dy === 0);
        const B = [a + dx, ya + dy], m = F(dy, dx), p = sub(F(ya), mul(m, F(a)));
        return { q: `Sur la courbe de ${M('f')}, le point ${M(`A${pt(a, ya)}`)} est tel que la tangente en ${M('A')} passe par le point ${M(`B${pt(...B)}`)}. Lire ${M(`f'(${a})`)} et donner l’équation réduite de cette tangente.`, a: `${M(`f'(${a})=\\dfrac{y_B-y_A}{x_B-x_A}=\\dfrac{${B[1]}-${par(ya)}}{${B[0]}-${par(a)}}=${fracTex(m)}`)}. ${M(`y=${affTex(m, p)}`)}.`, ok: () => eq(mul(m, F(B[0] - a)), F(B[1] - ya)) && eq(add(mul(m, F(a)), p), F(ya)) && eq(add(mul(m, F(B[0])), p), F(B[1])) };
      }
      let a = r.int(-3, 4), fa, ga, fp, gp;
      do { fa = r.int(-5, 5); ga = r.nz(-4, 4); fp = r.nz(-5, 5); gp = r.nz(-5, 5); } while (false);
      const tab = `\\begin{array}{c|cc}&f&g\\\\\\hline \\text{valeur en }${a}&${fa}&${ga}\\\\\\text{nombre dérivé en }${a}&${fp}&${gp}\\end{array}`;
      const head = `On donne, pour deux fonctions ${M('f')} et ${M('g')} dérivables en ${M(a)} : ${M(tab)}`;
      const sumD = fp + gp, prodD = fp * ga + fa * gp, prodV = fa * ga;
      if (prodD === 0 || a === 0) return this.make(r, level);
      if (level === 2) return { q: `${head}. Calculer ${M(`(f+g)'(${a})`)} et ${M(`(fg)'(${a})`)}, puis donner l’équation réduite de la tangente à la courbe de ${M('fg')} au point d’abscisse ${M(a)}.`, a: `${M(`(f+g)'(${a})=${fp}+${par(gp)}=${sumD}`)}. ${M(`(fg)'(${a})=f'(${a})g(${a})+f(${a})g'(${a})=${par(fp)}\\times ${par(ga)}+${par(fa)}\\times ${par(gp)}=${prodD}`)}. Tangente : ${M(`y=${prodD}(x${sgn(-a)})${sgn(prodV)}=${polyTex([prodD, prodV - prodD * a])}`.replace('(x+0)', 'x'))}.`, ok: () => sumD === fp + gp && prodD === fp * ga + fa * gp && prodV === fa * ga };
      const qD = F(fp * ga - fa * gp, ga * ga), qV = F(fa, ga), pq = sub(qV, mul(qD, F(a)));
      return { q: `${head}. Calculer ${M(`\\left(\\dfrac{f}{g}\\right)'(${a})`)} puis l’équation réduite de la tangente à la courbe de ${M('\\dfrac{f}{g}')} au point d’abscisse ${M(a)}.`, a: `${M(`\\left(\\dfrac{f}{g}\\right)'(${a})=\\dfrac{f'(${a})g(${a})-f(${a})g'(${a})}{g(${a})^{2}}=\\dfrac{${par(fp)}\\times ${par(ga)}-${par(fa)}\\times ${par(gp)}}{${par(ga)}^{2}}=${fracTex(qD)}`)}. ${M(`\\dfrac{f}{g}(${a})=${fracTex(qV)}`)} donc ${M(`y=${affTex(qD, pq)}`)}.`, ok: () => eq(qD, div(sub(mul(F(fp), F(ga)), mul(F(fa), F(gp))), mul(F(ga), F(ga)))) && eq(add(mul(qD, F(a)), pq), qV) };
    } },

  { id: 'p-deriv-param', cls: C, chapter: 'premiere-04', domain: 'analyse', skill: 'Déterminer des paramètres à partir de la tangente', fast: false,
    make(r, level) {
      if (level === 1) {
        const a = r.nz(-4, 4), b = r.nz(-6, 6), x0 = r.pick([1, 2, 3, -1, -2]), Y = a * x0 * x0 + b * x0, m = 2 * a * x0 + b;
        return { q: `La fonction ${M('f(x)=ax^{2}+bx')} vérifie ${M(`f(${x0})=${Y}`)} et ${M(`f'(${x0})=${m}`)}. Déterminer ${M('a')} et ${M('b')}.`, a: `${M(`f'(x)=2ax+b`)} : ${M(`${2 * x0}a+b=${m}`)} donne ${M(`b=${m}${sgn(-2 * x0)}a`)}. Dans ${M(`${coef(x0 * x0)}a${x0 < 0 ? '-' : '+'}${Math.abs(x0) === 1 ? '' : Math.abs(x0)}b=${Y}`)} : ${M(`${coef(-x0 * x0)}a${sgn(m * x0)}=${Y}`)}, d’où ${M(`a=\\dfrac{${m * x0}-${par(Y)}}{${x0 * x0}}=${a}`)} et ${M(`b=${b}`)}.`, ok: () => x0 * x0 * a + x0 * b === Y && 2 * a * x0 + b === m && (m * x0 - Y) / (x0 * x0) === a && m - 2 * x0 * a === b };
      }
      if (level === 2) {
        const a = r.nz(-3, 3), c = r.int(-7, 7), x0 = r.nz(-4, 4), b = -2 * a * x0, y0 = c - a * x0 * x0;
        if (x0 === 0) return this.make(r, level);
        return { q: `La parabole d’équation ${M('y=ax^{2}+bx+c')} passe par le point ${M(`A(0\\,;\\,${c})`)}, et sa tangente au point d’abscisse ${M(x0)} est horizontale. De plus ${M(`f(${x0})=${y0}`)} où ${M('f(x)=ax^{2}+bx+c')}. Déterminer ${M('a')}, ${M('b')} et ${M('c')}.`,
          a: `${M(`f(0)=c=${c}`)}. ${M(`f'(${x0})=0\\iff ${2 * x0}a+b=0\\iff b=${-2 * x0}a`)}. ${M(`f(${x0})=${x0 * x0}a${sgn(-2 * x0 * x0)}a${sgn(c)}=${y0}`.replace(`${x0 * x0}a${sgn(-2 * x0 * x0)}a`, `-${x0 * x0}a`))}, donc ${M(`a=\\dfrac{${c}-${par(y0)}}{${x0 * x0}}=${a}`)}, ${M(`b=${b}`)}.`, ok: () => { const f = (x) => a * x * x + b * x + c; return f(0) === c && near(nd(f, x0), 0, 1e-4) && f(x0) === y0 && (c - y0) / (x0 * x0) === a; } };
      }
      let a, t1, t2; do { a = r.pick([1, 2, 3, -1, -2]); t1 = r.int(-5, 5); t2 = r.int(-5, 5); } while (t1 >= t2 || (t1 + t2) % 2 !== 0);
      const p = (t1 + t2) / 2, q = a * t1 * t2, f = (x) => a * x * x;
      return { q: `On note ${M('\\mathcal{C}')} la courbe de ${M(`f(x)=${coef(a)}x^{2}`)} et ${M(`P(${p}\\,;\\,${q})`)}. Déterminer les équations des tangentes à ${M('\\mathcal{C}')} qui passent par ${M('P')}. (Indication : appeler ${M('t')} l’abscisse du point de tangence.)`,
        hint: '',
        a: `La tangente en ${M('t')} est ${M(`y=${2 * a}t(x-t)${a < 0 ? '-' : '+'}${Math.abs(a) === 1 ? '' : Math.abs(a)}t^{2}`)}. Elle passe par ${M('P')} si ${M(`${q}=${2 * a}t(${p}-t)${a < 0 ? '-' : '+'}${Math.abs(a) === 1 ? '' : Math.abs(a)}t^{2}`)}, soit ${M(`${polyTex([a, -2 * a * p, q], 't')}=0`)} : ${M(`t=${t1}`)} ou ${M(`t=${t2}`)}. Tangentes : ${M(`y=${polyTex([2 * a * t1, -a * t1 * t1])}`)} et ${M(`y=${polyTex([2 * a * t2, -a * t2 * t2])}`)}.`, ok: () => [t1, t2].every((t) => { const m = 2 * a * t, c0 = f(t) - m * t; return m * p + c0 === q && near(nd(f, t), m, 1e-4); }) && f(p) !== q && a * (t1 - p) * (t2 - p) !== 0 };
    } },
];
