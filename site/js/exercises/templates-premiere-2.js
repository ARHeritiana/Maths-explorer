// Première generators, second file: chapters 01 (suites), 02 (second degré), 03 (vecteurs, produit scalaire), 04 (dérivation).
// Same contract as templates-premiere.js. Formats: calcul, QCM à quatre choix (chaque faux choix vient d'une erreur type),
// vrai/faux justifié, « trouve l'erreur », lecture d'un tableau, contexte, question à l'envers, sujets de niveau 3 de type examen.
import { F, add, sub, mul, div, val, eq, M, R, fracTex, numTex, roundTex, polyTex, evalPoly, sgn, par, gcd, sqrtTex } from './engine.js';
import { near, nd, coef, opt, mcq, tf, spot } from './premiere-kit.js';
import { pt, vc, lin, normLine } from './seconde-kit.js';

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
      let lines = good, bad, why, fix, shownU;
      if (kind === 'den') { const d = q2 + p, rs = (uq - up) / d, rF = F(uq - up, d), rt = fracTex(rF), cf = (f) => `${f.n < 0 ? '-' : '+'}${f.d === 1 && Math.abs(f.n) === 1 ? '' : fracTex(F(Math.abs(f.n), f.d))}`; lines = [`r=\\dfrac{${uq}-${par(up)}}{${q2}+${p}}=${rt}`, `${U(0)}=${up}-${p}\\times ${rF.n < 0 ? `\\left(${rt}\\right)` : rt}`, `u_n=${U(0)}${cf(rF)}n`]; bad = 0; why = `l’écart d’indices est ${M(`${q2}-${p}`)}, pas ${M(`${q2}+${p}`)}.`; fix = M(good[0]); shownU = rs; }
      else if (kind === 'sign') { const u0w = up + p * rr; lines = [good[0], `${U(0)}=${up}+${p}\\times ${par(rr)}=${u0w}`, `u_n=${polyTex([rr, u0w], 'n')}`]; bad = 1; why = `${M(U(p))} est ${M(`${U(0)}+${p}r`)} donc ${M(U(0))} s’obtient par une soustraction.`; fix = M(good[1]); shownU = u0w; }
      else { lines = [good[0], `${U(0)}=${up}`, `u_n=${polyTex([rr, up], 'n')}`]; bad = 1; why = `${M(up)} est la valeur de ${M(U(p))}, pas celle de ${M(U(0))}.`; fix = M(good[1]); shownU = up; }
      return spot(intro, lines.map(M), bad, why, fix, M(good[2]), () => { const u = (n) => u0 + n * rr; return u(p) === up && u(q2) === uq && shownU !== u0 && (uq - up) / (q2 - p) === rr; });
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
];
