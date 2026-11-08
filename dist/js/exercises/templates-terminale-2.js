// Terminale generators, second file: chapters 01 (suites, récurrence), 02 (vecteurs de l'espace), 03 (limites de suites).
// Same contract as templates-terminale.js (make(r, level) returns {q, a, s?, ok}); formats: four-choice question with one typical error per wrong
// option, true/false with justification, find the error, reading, reverse questions, contexts, level-3 exam-style items.
import { F, add, sub, mul, div, val, eq, M, R, fracTex, numTex, roundTex, polyTex, evalPoly, sgn, par, gcd, sqrtTex } from './engine.js';
import { near, nd, coef, opt, mcq, tf, spot } from './premiere-kit.js';
import { lin } from './seconde-kit.js';

const C = 'terminale';
const cn = (k) => `${k === 1 ? '' : k}n`;
const U = (k) => `u_{${k}}`;
const pw = (b, n) => (n === 1 ? `${b}` : `${b}^{${n}}`);
const ip = (a, b) => (b === 0 ? `${a}` : `${a}${sgn(b)}`);   // a+b with b literal
// c1 t1 + c2 t2 written without 1, -1 or a double sign; a term with coefficient 0 disappears
const cT = (c, t) => `${Math.abs(c) === 1 ? '' : Math.abs(c)}${t}`;
const sumC = (c1, t1, c2, t2) => `${c1 < 0 ? '-' : ''}${cT(c1, t1)}${c2 === 0 ? '' : `${c2 < 0 ? '-' : '+'}${cT(c2, t2)}`}`;
const seqRec = (u0, a, b, n) => { let x = u0; for (let i = 0; i < n; i++) x = a * x + b; return x; };

export const terminale2 = [
  // ============================ 01 Suites et récurrence ============================
  { id: 't-seq-qcm', cls: C, chapter: 'terminale-01', domain: 'suites', skill: 'QCM sur les suites et la récurrence', fast: true,
    make(r, level) {
      if (level === 1) {
        const kind = r.pick(['ar', 'geo', 'alt']), u0 = r.nz(-6, 6);
        let q, f, text;
        if (kind === 'ar') { const d = r.nz(-5, 5); f = (n) => u0 + n * d; text = `${U('n')}=${polyTex([d, u0], 'n')}`; }
        else if (kind === 'geo') { const q0 = r.pick([F(1, 2), F(2, 3), F(3, 2), F(2, 1), F(1, 3)]); f = (n) => u0 * val(q0) ** n; text = `${U('n')}=${u0}\\times ${numTex(q0).replace(/^(\d+)\{,\}(\d+)$/, '$1{,}$2')}^{n}`; q = q0; }
        else { const q0 = r.pick([-2, -3, -1.5]); f = (n) => u0 * q0 ** n; text = `${U('n')}=${u0}\\times (${String(q0).replace('.', '{,}')})^{n}`; }
        const seq = [...Array(9).keys()].map(f), inc = seq.every((x, i) => i === 0 || x > seq[i - 1] - 1e-12), dec = seq.every((x, i) => i === 0 || x < seq[i - 1] + 1e-12);
        const kinds = [['croissante', (s) => s.every((x, i) => i === 0 || x > s[i - 1])], ['décroissante', (s) => s.every((x, i) => i === 0 || x < s[i - 1])], ['non monotone', (s) => !s.every((x, i) => i === 0 || x >= s[i - 1]) && !s.every((x, i) => i === 0 || x <= s[i - 1])], ['constante', (s) => s.every((x) => x === s[0])]];
        const right = kinds.find((k2) => k2[1](seq)); if (!right) return this.make(r, level);
        const why = { croissante: 'les termes augmentent d’un rang à l’autre.', décroissante: 'les termes diminuent d’un rang à l’autre.', 'non monotone': 'le signe de la raison négative fait alterner les termes.', constante: 'tous les termes sont égaux.' };
        return mcq(r, `La suite ${M(text)} est :`, opt(M(`\\text{${right[0]}}`), `Les premiers termes ${seq.slice(0, 4).map((x) => M(numTex(F(Math.round(x * 1000), 1000)))).join(', ')} le montrent : ${why[right[0]]}`, { w: right[0] }), kinds.filter((k2) => k2[0] !== right[0]).map((k2) => opt(M(`\\text{${k2[0]}}`), kind === 'alt' ? 'ne voit pas l’alternance des signes.' : `lit le sens de variation à l’envers ou sans comparer ${M(U(0))} et ${M(U(1))}.`, { w: k2[0] })), (o) => kinds.find((k2) => k2[0] === o.w)[1](seq));
      }
      if (level === 2) {
        const b = r.pick([3, 4, 5, 7, 8, 9, 10, 11]), a = b - 1, nameP = `${pw(b, 'n')}-1\\text{ est divisible par }${a}`;
        const Pn = `${M(`${b}^{n}-1`)} est divisible par ${M(a)}`, Pn1 = `${M(`${b}^{n+1}-1`)} l’est`;
        const cs = [[`supposer que ${Pn} pour un entier ${M('n')} fixé, puis montrer que ${Pn1}`, 'ok', 'c’est l’hérédité : on suppose ' + M('P(n)') + ' vraie et on démontre ' + M('P(n+1)') + '.'], [`supposer que ${Pn1}, puis montrer que ${Pn}`, 'bad', 'raisonne à l’envers (on suppose ce qu’il faut démontrer).'], [`vérifier que ${Pn} pour ${M('n=0')}, ${M('n=1')} et ${M('n=2')}`, 'bad', 'quelques vérifications ne démontrent rien : c’est tout au plus l’initialisation.'], [`montrer directement que ${M(`${b}^{n}-1`)} est un multiple de ${M(a)} pour toutes les valeurs de ${M('n')} en même temps sans hypothèse`, 'bad', 'ce n’est pas un raisonnement par récurrence : il n’y a pas d’hypothèse de récurrence.']];
        return mcq(r, `Pour démontrer par récurrence que ${M(`${b}^{n}-1`)} est divisible par ${M(a)} pour tout entier naturel ${M('n')}, l’étape d’hérédité consiste à :`, opt(cs[0][0], cs[0][2], { k: 'ok' }), cs.slice(1).map((c) => opt(c[0], c[2], { k: 'bad' })), (o) => o.k === 'ok' && nameP !== undefined && [0, 1, 2, 3, 4].every((n) => (b ** n - 1) % a === 0));
      }
      let a, b, u0; do { a = r.pick([2, 3, 4, -2, 5]); const l = r.nz(-5, 5); b = l * (1 - a); u0 = r.int(-6, 6); } while (u0 === b / (1 - a));
      const l = b / (1 - a), form = (c, k, ll) => `${U('n')}=${ll === 0 ? '' : ll}${c < 0 ? '-' : (ll === 0 ? '' : '+')}${Math.abs(c) === 1 ? '' : Math.abs(c)}\\times ${k < 0 ? `(${k})` : k}^{n}`.replace(/^u_\{n\}=\+/, 'u_{n}=');
      const ls = [[l, u0 - l, a], [-l, u0 + l, a], [l, u0, a], [l, u0 - l, 1 - a]];
      const mk = (x) => opt(M(form(x[1], x[2], x[0])), '', { x }), tr = (n) => seqRec(u0, a, b, n);
      const O = [mk(ls[0]), mk(ls[1]), mk(ls[2]), mk(ls[3])]; O[0].why = `${M(`\\ell=\\dfrac{b}{1-a}=${l}`)} et ${M(`v_n=u_n${sgn(-l)}`)} est géométrique de raison ${M(a)}.`; O[1].why = 'se trompe de signe sur la limite ' + M('\\ell') + ' du point fixe.'; O[2].why = 'oublie de retrancher ' + M('\\ell') + ' à ' + M(U(0)) + '.'; O[3].why = 'prend ' + M('1-a') + ' pour la raison.';
      return mcq(r, `La suite ${M('(u_n)')} vérifie ${M(`${U(0)}=${u0}`)} et ${M(`${U('n+1')}=${polyTex([a, b], 'u_n')}`)}. Pour tout entier ${M('n')} :`, O[0], O.slice(1), (o) => [0, 1, 2, 3, 4, 5].every((n) => near(tr(n), o.x[0] + o.x[1] * o.x[2] ** n, 1e-9)));
    } },

  { id: 't-seq-tf', cls: C, chapter: 'terminale-01', domain: 'suites', skill: 'Vrai ou faux sur les suites', fast: true,
    make(r, level) {
      const a = r.int(2, 60), b = r.nz(-40, 40), k = r.int(2, 99), u0 = ((x) => (x === 2 * b ? x + 1 : x))(r.int(-30, 30));
      const fam = {
        1: [
          () => ({ s: `La suite définie par ${M(`u_n=${polyTex([1, 0, -k], 'n').replace('n^{2}', 'n^{2}')}`)} est croissante pour ${M('n\\geqslant 0')}.`, v: true, j: `${M(`u_{n+1}-u_n=(n+1)^{2}-n^{2}=2n+1>0`)}.`, c: () => [0, 1, 2, 5, 9].every((n) => (n + 1) ** 2 - k > n * n - k) }),
          () => ({ s: `La suite ${M(`u_n=(-1)^{n}`)} est décroissante.`, v: false, j: `${M(`u_0=1`)}, ${M(`u_1=-1`)}, ${M(`u_2=1`)} : elle n’est pas monotone.`, c: () => 1 > -1 && -1 < 1 }),
          () => ({ s: `Si une suite est croissante, alors elle est minorée par son premier terme ${M(U(0))} (ici ${M(`${U(0)}=${u0}`)}).`, v: true, j: `${M(`u_n\\geqslant u_{n-1}\\geqslant\\dots\\geqslant u_0=${u0}`)}.`, c: () => true }),
          () => ({ s: `La suite géométrique de premier terme ${M(`${U(0)}=${k}`)} et de raison ${M('\\dfrac{1}{2}')} est décroissante.`, v: true, j: `${M(`u_{n+1}-u_n=u_n\\left(\\dfrac{1}{2}-1\\right)<0`)} car ${M('u_n>0')}.`, c: () => [0, 1, 2, 3].every((n) => k / 2 ** (n + 1) < k / 2 ** n) }),
        ],
        2: [
          () => ({ s: `Une suite majorée est convergente. (On teste ${M(`u_n=(-1)^{n}`)}.)`, v: false, j: `${M('(-1)^{n}')} est majorée par ${M(1)} mais ne converge pas : ses termes valent alternativement ${M(1)} et ${M(-1)}.`, c: () => true }),
          () => ({ s: `Pour tout entier ${M('n')}, ${M(`${a}^{n}\\geqslant 1+${cn(a - 1)}`)}.`, v: true, j: `Par récurrence : vrai pour ${M('n=0')} ; si ${M(`${a}^{n}\\geqslant 1+${cn(a - 1)}`)} alors ${M(`${a}^{n+1}\\geqslant ${a}+${cn(a * (a - 1))}\\geqslant 1+${a - 1 === 1 ? '' : a - 1}(n+1)`)}.`, c: () => [0, 1, 2, 3, 4, 5, 6].every((n) => a ** n >= 1 + (a - 1) * n) }),
          () => ({ s: `Si ${M(`${U('n+1')}=u_n+${k}`)} et ${M(`${U(0)}=${u0}`)}, alors ${M(`u_n=${polyTex([k, u0], 'n')}`)} pour tout ${M('n')}.`, v: true, j: `Suite arithmétique de raison ${M(k)} : ${M(`u_n=u_0+nr`)}.`, c: () => [0, 1, 2, 3, 6].every((n) => u0 + n * k === seqRec(u0, 1, k, n)) }),
          () => ({ s: `Si ${M(`u_n=\\dfrac{n}{n+${k}}`)}, alors ${M('(u_n)')} est strictement croissante.`, v: true, j: `${M(`u_{n+1}-u_n=\\dfrac{${k}}{(n+${k + 1})(n+${k})}>0`)}.`, c: () => [0, 1, 4, 10].every((n) => (n + 1) / (n + 1 + k) > n / (n + k)) }),
        ],
        3: [
          () => ({ s: `Si ${M(`u_n\\leqslant ${a}`)} pour tout ${M('n')} et ${M('(u_n)')} est croissante, alors ${M('(u_n)')} converge. (Ici ${M(`u_n=${a}-\\dfrac{1}{n+1}`)}.)`, v: true, j: `Théorème de la limite monotone : croissante et majorée implique convergente. Ici ${M(`u_n\\to ${a}`)}.`, c: () => [0, 1, 5, 40].every((n) => a - 1 / (n + 2) > a - 1 / (n + 1)) }),
          () => ({ s: `Si ${M('(u_n)')} converge vers ${M('\\ell')}, alors ${M('(u_n)')} est bornée. (On teste ${M(`u_n=${k}+\\dfrac{(-1)^{n}}{n+1}`)}.)`, v: true, j: `Une suite convergente est bornée ; ici ${M(`${k}-1\\leqslant u_n\\leqslant ${k}+1`)}.`, c: () => [0, 1, 2, 3, 4, 5, 10].every((n) => Math.abs(k + (-1) ** n / (n + 1) - k) <= 1) }),
          () => ({ s: `Si ${M(`u_{n+1}=\\dfrac{1}{2}u_n${sgn(b)}`)} avec ${M(`${U(0)}=${u0}`)}, alors ${M('(u_n)')} est géométrique.`, v: b === 0, j: b === 0 ? `Sans terme constant, ${M(`u_{n+1}=\\dfrac{1}{2}u_n`)} : géométrique de raison ${M('\\dfrac{1}{2}')}.` : `${M(`u_1=${numTex(F(u0 + 2 * b, 2))}`)}, ${M(`u_2=${numTex(F(u0 + 6 * b, 4))}`)} : le quotient ${M('\\dfrac{u_{n+1}}{u_n}')} n’est pas constant en général (il faut passer par ${M(`v_n=u_n${sgn(-2 * b)}`)}).`, c: () => { if (b === 0) return true; const u = [F(u0)]; for (let i = 0; i < 3; i++) u.push(add(mul(F(1, 2), u[i]), F(b))); return u[0].n === 0 || u[1].n === 0 || !eq(div(u[1], u[0]), div(u[2], u[1])); } }),
          () => ({ s: `Pour tout entier ${M('n')}, ${M(`${a}^{n}-1`)} est divisible par ${M(a - 1)}.`, v: true, j: `${M(`${a}^{n}-1=(${a}-1)(1+${a}+\\dots+${a}^{n-1})`)}.`, c: () => [0, 1, 2, 3, 4, 5, 6].every((n) => (a ** n - 1) % (a - 1) === 0) }),
        ],
      };
      return tf(r.pick(fam[level])());
    } },

  { id: 't-seq-error', cls: C, chapter: 'terminale-01', domain: 'suites', skill: 'Trouver l’erreur dans l’étude d’une suite récurrente', fast: false,
    make(r, level) {
      const as = level === 1 ? [2, 3, 4] : level === 2 ? [-2, -3, 5, 6] : [2, 3, -2, 4, 5, -3];
      let a, l, u0, k, kind; do { a = r.pick(as); l = r.nz(-8, 8); u0 = r.int(-9, 9); k = r.int(4, 7); kind = r.pick(['fix', 'vn', 'un']); } while (u0 === l);
      const b = l * (1 - a), uk = l + (u0 - l) * a ** k;
      const good = [`\\ell=\\dfrac{b}{1-a}=\\dfrac{${b}}{${1 - a}}=${l}`, `v_n=u_n-${par(l)}\\text{ vérifie }v_{n+1}=${a}v_n\\text{ et }v_0=${u0 - l}`, `u_n=${par(l)}+${par(u0 - l)}\\times ${par(a)}^{n}`.replace('+(-', '-(').replace(/\(-(\d+)\)\\times/, '(-$1)\\times').replace(/^u_n=\((-?\d+)\)/, 'u_n=$1').replace('=(', '=(')];
      const cl = `u_n=${l}${u0 - l < 0 ? '-' : '+'}${Math.abs(u0 - l) === 1 ? '' : Math.abs(u0 - l)}\\times ${par(a)}^{n}`;
      let lines = [good[0], good[1], cl], bad, why, fix, shown = uk;
      if (kind === 'fix') { const lw = -l; lines = [`\\ell=\\dfrac{b}{a-1}=\\dfrac{${b}}{${a - 1}}=${lw}`, `v_n=u_n-${par(lw)}\\text{ vérifie }v_{n+1}=${a}v_n\\text{ et }v_0=${u0 - lw}`, `u_n=${lw}${u0 - lw < 0 ? '-' : '+'}${Math.abs(u0 - lw) === 1 ? '' : Math.abs(u0 - lw)}\\times ${par(a)}^{n}`]; bad = 0; why = `le point fixe vérifie ${M('\\ell=a\\ell+b')}, soit ${M('\\ell=\\dfrac{b}{1-a}')}.`; fix = M(good[0]); shown = lw + (u0 - lw) * a ** k; }
      else if (kind === 'vn') { lines = [good[0], `v_n=u_n-${par(l)}\\text{ vérifie }v_{n+1}=${a}v_n\\text{ et }v_0=${u0}`, `u_n=${l}${u0 < 0 ? '-' : '+'}${Math.abs(u0) === 1 ? '' : Math.abs(u0)}\\times ${par(a)}^{n}`]; bad = 1; why = `${M(`v_0=u_0-${par(l)}=${u0 - l}`)} : on oublie de retrancher ${M('\\ell')}.`; fix = M(good[1]); shown = l + u0 * a ** k; }
      else { lines = [good[0], good[1], `u_n=${u0 - l}\\times ${par(a)}^{n}${l < 0 ? '-' : '+'}${Math.abs(l)}`.replace(/\+-/, '-')]; bad = 2; why = `${M('u_n=v_n+\\ell')} : on ajoute ${M(`\\ell=${l}`)} (ici avec le bon signe) à ${M('v_n')}.`; fix = M(cl); shown = (u0 - l) * a ** k - l; }
      if (shown === uk) return this.make(r, level);
      return spot(`${M('(u_n)')} est définie par ${M(`${U(0)}=${u0}`)} et ${M(`${U('n+1')}=${polyTex([a, b], 'u_n')}`)}. Pour calculer ${M(U(k))}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(`${cl.replace('u_n', `u_{${k}}`).replace('^{n}', `^{${k}}`)}=${uk}`), () => seqRec(u0, a, b, k) === uk && l * (1 - a) === b && shown !== uk);
    } },

  { id: 't-seq-bounded', cls: C, chapter: 'terminale-01', domain: 'suites', skill: 'Suite majorée, croissante, convergente', fast: false, levels: [2, 3],
    make(r, level) {
      const L = r.int(2, 25), a = L * L - L, u0 = r.int(0, L - 1), f = (x) => Math.sqrt(a + x);
      const terms = []; let x = u0; for (let i = 0; i < 4; i++) { terms.push(x); x = f(x); }
      const lim = (() => { let y = u0; for (let i = 0; i < 400; i++) y = f(y); return y; })();
      const head = `On définit ${M('(u_n)')} par ${M(`${U(0)}=${u0}`)} et ${M(`${U('n+1')}=\\sqrt{${U('n')}+${a}}`)}.`;
      const T = terms.map((t, i) => M(`${U(i)}\\approx ${roundTex(t, 3)}`)).join(', ');
      if (level === 2) return { q: `${head} Calculer ${M(U(1))}, ${M(U(2))} et ${M(U(3))} (valeurs approchées au millième) puis résoudre ${M(`\\ell=\\sqrt{\\ell+${a}}`)} avec ${M('\\ell\\geqslant 0')}.`, a: `${T.split(', ').slice(1).join(', ')}. ${M(`\\ell=\\sqrt{\\ell+${a}}\\iff\\ell^{2}-\\ell-${a}=0`)}, ${M(`\\Delta=${1 + 4 * a}=${2 * L - 1}^{2}`)} : ${M(`\\ell=${L}`)} (l’autre racine ${M(1 - L)} est négative).`, ok: () => near(lim, L, 1e-9) && L * L - L - a === 0 && 1 - L < 0 && terms.every((t) => t <= L) };
      return { q: `${head} 1) Démontrer par récurrence que, pour tout ${M('n')}, ${M(`0\\leqslant u_n\\leqslant ${L}`)}. 2) Montrer que ${M('(u_n)')} est croissante. 3) En déduire que ${M('(u_n)')} converge et déterminer sa limite.`,
        a: `1) Initialisation : ${M(`0\\leqslant ${u0}\\leqslant ${L}`)}. Hérédité : si ${M(`0\\leqslant u_n\\leqslant ${L}`)} alors ${M(`${a}\\leqslant u_n+${a}\\leqslant ${L * L}`)} et, la racine étant croissante, ${M(`0\\leqslant u_{n+1}\\leqslant ${L}`)}. 2) ${M(`u_{n+1}^{2}-u_n^{2}=u_n+${a}-u_n^{2}=-(u_n-${L})(u_n+${L - 1})\\geqslant 0`)} car ${M(`u_n\\leqslant ${L}`)}, donc ${M('u_{n+1}\\geqslant u_n')}. 3) Croissante et majorée par ${M(L)} : convergente, de limite ${M('\\ell')} avec ${M(`\\ell=\\sqrt{\\ell+${a}}`)}, soit ${M(`\\ell=${L}`)}.`,
        ok: () => { let y = u0; for (let i = 0; i < 50; i++) { const z = f(y); if (z < y - 1e-12 || z > L + 1e-12 || y < 0) return false; if (Math.abs(z * z - y * y - (y + a - y * y)) > 1e-9) return false; y = z; } return near(lim, L, 1e-9) && [0.3, 1.5, L - 0.1].every((t) => near(t + a - t * t, -(t - L) * (t + L - 1), 1e-9)) && u0 < L; } };
    } },

  { id: 't-seq-algo', cls: C, chapter: 'terminale-01', domain: 'suites', skill: 'Algorithme de seuil', fast: false,
    make(r, level) {
      let u0, a, b, S, name;
      const sim = (u0, a, b, S) => { let n = 0, u = u0; while (u < S && n < 1000) { u = a * u + b; n++; } return [n, u]; };
      if (level === 1) { u0 = r.int(1, 20); a = 1; b = r.int(2, 9); S = u0 + b * r.int(5, 25) + r.int(1, b - 1); }
      else if (level === 2) { u0 = r.int(1, 9); a = r.pick([2, 3]); b = 0; S = u0 * a ** r.int(3, 9) + r.int(1, 5); }
      else { u0 = r.int(1, 20); a = r.pick([2, 3]); b = r.int(1, 9); S = seqRec(u0, a, b, r.int(3, 8)) + r.int(1, 6); }
      const [n, u] = sim(u0, a, b, S);
      const upd = a === 1 ? `u\\leftarrow u+${b}` : b === 0 ? `u\\leftarrow ${a}\\times u` : `u\\leftarrow ${a}\\times u+${b}`;
      return { q: `On exécute l’algorithme : ${M(`n\\leftarrow 0`)} ; ${M(`u\\leftarrow ${u0}`)} ; tant que ${M(`u<${S}`)} : ${M(upd)} et ${M('n\\leftarrow n+1')}. Quelles sont les valeurs finales de ${M('n')} et de ${M('u')} ? Que représente ${M('n')} pour la suite ${M(`${U('n+1')}=${a === 1 ? `u_n+${b}` : b === 0 ? `${a}u_n` : `${a}u_n+${b}`}`)} de premier terme ${M(u0)} ?`, a: `L’algorithme calcule les termes successifs jusqu’à ce que ${M(`u\\geqslant ${S}`)} : on obtient ${M(`n=${n}`)} et ${M(`u=${u}`)}. ${M('n')} est le plus petit rang tel que ${M(`u_n\\geqslant ${S}`)} (avec ${M(`${U(n - 1)}=${n >= 1 ? seqRec(u0, a, b, n - 1) : u0}<${S}`)} si ${M('n\\geqslant 1')}).`.replace(M(`${U(-1)}=${u0}<${S}`), ''), ok: () => { let k = 0, v = u0; while (v < S) { v = (v * a) + b; k++; if (k > 1000) return false; } return k === n && v === u && (n === 0 || seqRec(u0, a, b, n - 1) < S) && seqRec(u0, a, b, n) >= S; } };
    } },

  { id: 't-seq-reverse', cls: C, chapter: 'terminale-01', domain: 'suites', skill: 'Retrouver les paramètres d’une suite récurrente', fast: false,
    make(r, level) {
      if (level === 1) { const a = r.pick([2, 3, -2, 4, 5, 6, -3, -4]), l = r.nz(-12, 12), b = l * (1 - a), u0 = r.int(-5, 5); return { q: `${M('(u_n)')} vérifie ${M(`${U('n+1')}=${coef(a)}u_n+b`)} avec ${M('b')} réel. On sait que la suite constante égale à ${M(l)} convient. Déterminer ${M('b')}.`, a: `Si ${M(`u_n=${l}`)} pour tout ${M('n')}, alors ${M(`${l}=${par(a)}\\times ${par(l)}+b`)}, donc ${M(`b=${b}`)}.`, ok: () => a * l + b === l && u0 === u0 }; }
      if (level === 2) { let a, b, u0, u1, u2; do { a = r.pick([2, 3, -2, 4, 5]); b = r.nz(-8, 8); u0 = r.int(-6, 6); u1 = a * u0 + b; u2 = a * u1 + b; } while (u1 === u0); return { q: `Une suite vérifie ${M(`${U('n+1')}=au_n+b`)}, avec ${M(`${U(0)}=${u0}`)}, ${M(`${U(1)}=${u1}`)} et ${M(`${U(2)}=${u2}`)}. Déterminer ${M('a')} et ${M('b')}, puis ${M(U(3))}.`, a: `${M(`a=\\dfrac{${u2}-${par(u1)}}{${u1}-${par(u0)}}=${a}`)}, ${M(`b=${u1}-${par(a)}\\times ${par(u0)}=${b}`)}. ${M(`${U(3)}=${par(a)}\\times ${par(u2)}${sgn(b)}=${a * u2 + b}`)}.`, ok: () => (u2 - u1) / (u1 - u0) === a && u1 - a * u0 === b && a * u2 + b === seqRec(u0, a, b, 3) }; }
      const a = r.pick([2, 3, 4, 5, -2]), l = r.nz(-6, 6), b = l * (1 - a), n = r.int(3, 6), d = r.nz(-3, 3), u0 = l + d, tgt = l + d * a ** n;
      return { q: `${M('(u_n)')} est définie par ${M(`${U('n+1')}=${coef(a)}u_n${sgn(b)}`)} et ${M(`${U(0)}=u`)} (réel inconnu). 1) Pour quelle valeur de ${M('u')} la suite est-elle constante ? 2) Déterminer ${M('u')} pour que ${M(`${U(n)}=${tgt}`)}.`, a: `1) ${M(`\\ell=\\dfrac{${b}}{${1 - a}}=${l}`)} : ${M(`u=${l}`)}. 2) ${M(`v_n=u_n-${par(l)}`)} est géométrique de raison ${M(a)} : ${M(`${U(n)}-${par(l)}=(u-${par(l)})\\times ${par(a)}^{${n}}`)}, soit ${M(`${tgt - l}=${a ** n}(u-${par(l)})`)} et ${M(`u=${u0}`)}.`, ok: () => a * l + b === l && seqRec(u0, a, b, n) === tgt && (tgt - l) / a ** n + l === u0 };
    } },

  { id: 't-seq-monotone', cls: C, chapter: 'terminale-01', domain: 'suites', skill: 'Sens de variation par différence ou quotient', fast: false,
    make(r, level) {
      if (level <= 2) {
        let a, b, c, d; do { a = r.nz(-6, 6); b = r.int(-8, 8); c = r.int(1, 5); d = r.int(1, 6); } while (a * d - b * c === 0);
        const u = (n) => (a * n + b) / (c * n + d), k = a * d - b * c;
        return { q: `Étudier le sens de variation de la suite définie par ${M(`u_n=\\dfrac{${polyTex([a, b], 'n')}}{${polyTex([c, d], 'n')}}`)} pour ${M('n\\geqslant 0')}${level === 1 ? '' : ' en calculant ' + M('u_{n+1}-u_n')}.`, a: `${M(`u_{n+1}-u_n=\\dfrac{${polyTex([a, a + b], 'n')}}{${polyTex([c, c + d], 'n')}}-\\dfrac{${polyTex([a, b], 'n')}}{${polyTex([c, d], 'n')}}=\\dfrac{${k}}{(${polyTex([c, c + d], 'n')})(${polyTex([c, d], 'n')})}`)} : le dénominateur est positif, donc la suite est ${k > 0 ? 'strictement croissante' : 'strictement décroissante'}.`, ok: () => [0, 1, 2, 5, 12].every((n) => (u(n + 1) - u(n) > 0) === (k > 0)) && [0, 3, 7].every((n) => near(u(n + 1) - u(n), k / ((c * (n + 1) + d) * (c * n + d)), 1e-9)) };
      }
      const q = r.int(2, 20), c0 = r.int(1, 20), u = (n) => (c0 * n) / q ** n;
      return { q: `Soit ${M(`u_n=\\dfrac{${coef(c0)}n}{${q}^{n}}`)} pour ${M('n\\geqslant 1')}. Calculer ${M('\\dfrac{u_{n+1}}{u_n}')} et en déduire le sens de variation de ${M('(u_n)')}.`, a: `${M(`\\dfrac{u_{n+1}}{u_n}=\\dfrac{${coef(c0)}(n+1)}{${q}^{n+1}}\\times\\dfrac{${q}^{n}}{${coef(c0)}n}=\\dfrac{n+1}{${q}n}`)}, et ${M(`\\dfrac{n+1}{${q}n}\\leqslant 1\\iff n+1\\leqslant ${q}n\\iff n\\geqslant\\dfrac{1}{${q - 1}}`)} : vrai pour tout ${M('n\\geqslant 1')}. Les termes sont positifs : ${M('(u_n)')} est décroissante.`, ok: () => [1, 2, 3, 8, 20].every((n) => u(n + 1) / u(n) <= 1 + 1e-12 && near(u(n + 1) / u(n), (n + 1) / (q * n), 1e-12)) };
    } },

  // ============================ 02 Vecteurs de l'espace ============================
  { id: 't-sp-qcm', cls: C, chapter: 'terminale-02', domain: 'geometrie', skill: 'QCM sur les vecteurs de l’espace', fast: true,
    make(r, level) {
      const col = (v) => `\\begin{pmatrix}${v.join('\\\\')}\\end{pmatrix}`, P = () => [r.int(-6, 6), r.int(-6, 6), r.int(-6, 6)], Pn = (n, p) => `${n}(${p.join('\\,;\\,')})`;
      if (level === 1) {
        let A, B; do { A = P(); B = P(); } while (A.every((x, i) => x === B[i]));
        const AB = B.map((x, i) => x - A[i]), cs = [[AB, 'on retranche les coordonnées de ' + M('A') + ' à celles de ' + M('B') + '.'], [AB.map((x) => -x), 'calcule ' + M('\\overrightarrow{BA}') + ' (soustraction dans l’autre sens).'], [AB.map((x, i) => (A[i] + B[i]) / 1), 'additionne les coordonnées au lieu de les soustraire.'], [AB.map((x, i) => (A[i] + B[i]) / 2), 'donne les coordonnées du milieu de ' + M('[AB]') + '.']];
        if (new Set(cs.map((c) => c[0].join())).size < 4) return this.make(r, level);
        return mcq(r, `Dans un repère de l’espace, ${M(Pn('A', A))} et ${M(Pn('B', B))}. Les coordonnées de ${M('\\overrightarrow{AB}')} sont :`, opt(M(col(cs[0][0])), cs[0][1], { v: cs[0][0] }), cs.slice(1).map((c) => opt(M(col(c[0].map((x) => (Number.isInteger(x) ? x : numTex(F(x * 2, 2)))))), c[1], { v: c[0] })), (o) => o.v.every((x, i) => x === B[i] - A[i]));
      }
      if (level === 2) {
        let u, k, m, det0; do { u = [r.nz(-5, 5), r.nz(-5, 5), r.nz(-5, 5)]; k = r.pick([2, 3, -2, -1, 4]); m = r.int(-6, 6); } while (false);
        const a0 = u[0], b0 = u[1], c0 = u[2], v = [k * a0, k * b0, 0]; v[2] = k * c0;
        const mm = k * b0, cs = [[mm, 'les coordonnées proportionnelles : ' + M(`${k}\\times ${par(b0)}`) + '.'], [b0 * a0 === 0 ? mm + 1 : (a0 * b0) / k, 'divise au lieu de multiplier par le coefficient de proportionnalité.'], [b0 + k, 'ajoute le coefficient au lieu de le multiplier.'], [-mm, 'se trompe de signe.']];
        if (new Set(cs.map((c) => c[0])).size < 4) return this.make(r, level);
        return mcq(r, `${M(`\\vec{u}${col([a0, b0, c0])}`)} et ${M(`\\vec{v}${col([k * a0, 'm', k * c0])}`)} sont colinéaires. Alors ${M('m')} vaut :`, opt(M(`${numTex(F(Math.round(cs[0][0] * 1000), 1000))}`), cs[0][1], { m: cs[0][0] }), cs.slice(1).map((c) => opt(M(`${numTex(F(Math.round(c[0] * 1000), 1000))}`), c[1], { m: c[0] })), (o) => near(o.m * a0, k * b0 * a0, 1e-9) && near(o.m, k * b0, 1e-9));
      }
      let u, v, a, b;
      do { u = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)]; v = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)]; a = r.nz(-3, 3); b = r.nz(-3, 3); } while (u[0] * v[1] - u[1] * v[0] === 0);
      const w = u.map((x, i) => a * x + b * v[i]);
      const cs = [[a, b, 'on identifie ' + M('\\vec{w}=a\\vec{u}+b\\vec{v}') + ' coordonnée par coordonnée.'], [b, a, 'échange les coefficients de ' + M('\\vec{u}') + ' et ' + M('\\vec{v}') + '.'], [-a, -b, 'se trompe de signe.'], [a, -b, 'se trompe de signe sur le coefficient de ' + M('\\vec{v}') + '.']];
      if (new Set(cs.map((c) => `${c[0]},${c[1]}`)).size < 4) return this.make(r, level);
      return mcq(r, `${M(`\\vec{u}${col(u)}`)}, ${M(`\\vec{v}${col(v)}`)} et ${M(`\\vec{w}${col(w)}`)}. On a ${M('\\vec{w}=a\\vec{u}+b\\vec{v}')} avec :`, opt(M(`(a\\,;\\,b)=(${cs[0][0]}\\,;\\,${cs[0][1]})`), cs[0][2], { ab: [cs[0][0], cs[0][1]] }), cs.slice(1).map((c) => opt(M(`(a\\,;\\,b)=(${c[0]}\\,;\\,${c[1]})`), c[2], { ab: [c[0], c[1]] })), (o) => [0, 1, 2].every((i) => o.ab[0] * u[i] + o.ab[1] * v[i] === w[i]));
    } },

  { id: 't-sp-tf', cls: C, chapter: 'terminale-02', domain: 'geometrie', skill: 'Vrai ou faux sur les vecteurs de l’espace', fast: true,
    make(r, level) {
      const col = (v) => `\\begin{pmatrix}${v.join('\\\\')}\\end{pmatrix}`, V = () => [r.int(-5, 5), r.int(-5, 5), r.int(-5, 5)];
      const det3 = (u, v, w) => u[0] * (v[1] * w[2] - v[2] * w[1]) - u[1] * (v[0] * w[2] - v[2] * w[0]) + u[2] * (v[0] * w[1] - v[1] * w[0]);
      const fam = {
        1: [
          () => { const u = V(), k = r.pick([2, 3, -2, -1]), same = r.next() < 0.5, v = u.map((x) => k * x); if (!same) v[2] += r.pick([-1, 1]); const col0 = [0, 1, 2].every((i) => u[(i + 1) % 3] * v[i] === u[i] * v[(i + 1) % 3]); if (u.every((x) => x === 0)) u[0] = 1; return { s: `Les vecteurs ${M(`\\vec{u}${col(u)}`)} et ${M(`\\vec{v}${col(v)}`)} sont colinéaires.`, v: col0, j: col0 ? `${M(`\\vec{v}=${k}\\vec{u}`)}.` : `Aucun réel ${M('k')} ne vérifie ${M('\\vec{v}=k\\vec{u}')} : les coordonnées ne sont pas proportionnelles.`, c: () => { const cr = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; return cr.every((x) => x === 0) === col0; } }; },
          () => { const A = V(), B = V(), C0 = V(), D = A.map((x, i) => B[i] - x + C0[i]); const par0 = r.next() < 0.5; if (!par0) D[0] += 1; return { s: `Avec ${M(`A(${A.join('\\,;\\,')})`)}, ${M(`B(${B.join('\\,;\\,')})`)}, ${M(`C(${C0.join('\\,;\\,')})`)} et ${M(`D(${D.join('\\,;\\,')})`)}, le quadrilatère ${M('ABDC')} est un parallélogramme.`, v: par0, j: `Dans ${M('ABDC')}, il faut ${M('\\overrightarrow{AB}=\\overrightarrow{CD}')}. Ici ${M(`\\overrightarrow{AB}${col(B.map((x, i) => x - A[i]))}`)} et ${M(`\\overrightarrow{CD}${col(D.map((x, i) => x - C0[i]))}`)}${par0 ? ' sont égaux : c’est bien un parallélogramme.' : ' ne sont pas égaux.'}`, c: () => ([0, 1, 2].every((i) => B[i] - A[i] === D[i] - C0[i])) === par0 }; },
        ],
        2: [
          () => { const u = V(), v = V(), a = r.nz(-3, 3), b = r.nz(-3, 3), cop = r.next() < 0.5, w = u.map((x, i) => a * x + b * v[i]); if (!cop) w[0] += r.pick([-2, -1, 1, 2]); const d = det3(u, v, w); return { s: `${M(`\\vec{u}${col(u)}`)}, ${M(`\\vec{v}${col(v)}`)} et ${M(`\\vec{w}${col(w)}`)} sont coplanaires.`, v: d === 0, j: d === 0 ? `${M('\\det(\\vec{u},\\vec{v},\\vec{w})=0')} (ici ${M(`\\vec{w}=${a}\\vec{u}+${par(b)}\\vec{v}`)} ou ${M('\\vec{u},\\vec{v}')} colinéaires).` : `Le déterminant des trois vecteurs vaut ${M(d)}, non nul : ils ne sont pas coplanaires.`, c: () => (d === 0) === (cop || (u[0] * v[1] - u[1] * v[0] === 0 && u[0] * v[2] - u[2] * v[0] === 0 && u[1] * v[2] - u[2] * v[1] === 0) || d === 0) && det3(u, v, w) === d }; },
          () => ({ s: `Si ${M('\\vec{u}')} et ${M('\\vec{v}')} sont colinéaires, alors, pour tout vecteur ${M('\\vec{w}')}, les vecteurs ${M('\\vec{u}')}, ${M('\\vec{v}')} et ${M('\\vec{w}')} sont coplanaires.`, v: true, j: `Deux vecteurs colinéaires dirigent une même droite ; avec ${M('\\vec{w}')}, on choisit un plan qui contient cette droite et une représentation de ${M('\\vec{w}')}.`, c: () => { const u = [1, 2, 3], v = [2, 4, 6], w = V(); return det3(u, v, w) === 0; } }),
        ],
        3: [
          () => { const u = V(), v = V(), w = V(), d = det3(u, v, w); return { s: `${M(`\\vec{u}${col(u)}`)}, ${M(`\\vec{v}${col(v)}`)} et ${M(`\\vec{w}${col(w)}`)} forment une base de l’espace.`, v: d !== 0, j: `${M(`\\det(\\vec{u},\\vec{v},\\vec{w})=${d}`)} ${d !== 0 ? 'est non nul : les trois vecteurs ne sont pas coplanaires, ils forment une base.' : 'est nul : ils sont coplanaires, ce n’est pas une base.'}`, c: () => (d !== 0) === (Math.abs(det3(u, v, w)) > 0) }; },
          () => { const u = V(), v = V(), a = r.nz(-4, 4), c1 = r.int(-4, 4); const w = u.map((x, i) => a * x + c1 * v[i]); const A = [0, 0, 0], tr = [u, v, w]; return { s: `Si ${M(`\\vec{w}=${a}\\vec{u}${sgn(c1)}\\vec{v}`)}, alors ${M('\\vec{u}')}, ${M('\\vec{v}')}, ${M('\\vec{w}')} ne forment pas une base.`, v: true, j: `${M('\\vec{w}')} est combinaison linéaire de ${M('\\vec{u}')} et ${M('\\vec{v}')} : les trois vecteurs sont coplanaires.`, c: () => det3(u, v, w) === 0 && A.length === 3 && tr.length === 3 }; },
        ],
      };
      return tf(r.pick(fam[level])());
    } },

  { id: 't-sp-error', cls: C, chapter: 'terminale-02', domain: 'geometrie', skill: 'Trouver l’erreur dans une preuve de coplanarité', fast: false,
    make(r, level) {
      const col = (v) => `\\begin{pmatrix}${v.join('\\\\')}\\end{pmatrix}`;
      let u, v, a, b, kind; do { u = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)]; v = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)]; a = r.nz(-4, 4); b = r.nz(-4, 4); kind = r.pick(['sign', 'swap', 'third']); } while (u[0] * v[1] - u[1] * v[0] === 0);
      const w = u.map((x, i) => a * x + b * v[i]), D = u[0] * v[1] - u[1] * v[0], da = w[0] * v[1] - w[1] * v[0], db = u[0] * w[1] - u[1] * w[0];
      const sys = `${lin([[u[0], 'a'], [v[0], 'b']])}=${w[0]}\\ \\text{ et }\\ ${lin([[u[1], 'a'], [v[1], 'b']])}=${w[1]}`;
      const good = [sys, `a=\\dfrac{${da}}{${D}}=${a}\\ \\text{ et }\\ b=\\dfrac{${db}}{${D}}=${b}`, `${par(a)}\\times ${par(u[2])}+${par(b)}\\times ${par(v[2])}=${w[2]}\\text{ : coplanaires}`];
      let lines = good, bad, why, fix, shown = a;
      if (kind === 'sign') { const a2 = -a; lines = [good[0], `a=\\dfrac{${-da}}{${D}}=${a2}\\ \\text{ et }\\ b=\\dfrac{${db}}{${D}}=${b}`, `${par(a2)}\\times ${par(u[2])}+${par(b)}\\times ${par(v[2])}=${a2 * u[2] + b * v[2]}\\neq ${w[2]}\\text{ : non coplanaires}`]; bad = 1; why = `${M('a=\\dfrac{w_xv_y-w_yv_x}{u_xv_y-u_yv_x}')} : le numérateur n’est pas ${M(-da)}.`; fix = M(good[1]); shown = a2; }
      else if (kind === 'swap') { lines = [good[0], `a=${b}\\ \\text{ et }\\ b=${a}`, `${par(b)}\\times ${par(u[2])}+${par(a)}\\times ${par(v[2])}=${b * u[2] + a * v[2]}${b * u[2] + a * v[2] === w[2] ? '' : `\\neq ${w[2]}`}\\text{ : ${b * u[2] + a * v[2] === w[2] ? 'coplanaires' : 'non coplanaires'}}`]; bad = 1; why = `${M('a')} est le coefficient de ${M('\\vec{u}')} et ${M('b')} celui de ${M('\\vec{v}')} : la résolution du système donne ${M(`a=${a}`)} et ${M(`b=${b}`)}.`; fix = M(good[1]); shown = b; }
      else { const wr = w[2] + r.pick([-2, -1, 1, 2]); lines = [good[0], good[1], `${par(a)}\\times ${par(u[2])}+${par(b)}\\times ${par(v[2])}=${wr}\\text{ : coplanaires}`]; bad = 2; why = `${M(`${par(a)}\\times ${par(u[2])}+${par(b)}\\times ${par(v[2])}=${a * u[2] + b * v[2]}`)}, et c’est égal à ${M(w[2])} : conclusion correcte, mais la valeur écrite est fausse.`; fix = M(good[2]); shown = a; }
      if ((kind === 'swap' && a === b) || (kind === 'sign' && a === 0)) return this.make(r, level);
      return spot(`${M(`\\vec{u}${col(u)}`)}, ${M(`\\vec{v}${col(v)}`)} et ${M(`\\vec{w}${col(w)}`)} : pour étudier la coplanarité, un élève cherche ${M('a')} et ${M('b')} avec ${M('\\vec{w}=a\\vec{u}+b\\vec{v}')} et écrit une solution.`, lines.map(M), bad, why, fix, M(`\\text{coplanaires}\\ (a=${a},\\ b=${b})`), () => [0, 1, 2].every((i) => a * u[i] + b * v[i] === w[i]) && D * a === da && D * b === db && (kind === 'third' || shown !== (kind === 'sign' ? a : a)));
    } },

  { id: 't-sp-cube', cls: C, chapter: 'terminale-02', domain: 'geometrie', skill: 'Vecteurs dans un cube', fast: false,
    make(r, level) {
      const V = { A: [0, 0, 0], B: [1, 0, 0], C: [1, 1, 0], D: [0, 1, 0], E: [0, 0, 1], F: [1, 0, 1], G: [1, 1, 1], H: [0, 1, 1] }, names = Object.keys(V);
      const dec = (v) => { const t = [['\\overrightarrow{AB}', v[0]], ['\\overrightarrow{AD}', v[1]], ['\\overrightarrow{AE}', v[2]]].filter((x) => x[1] !== 0); return t.length ? t.map((x, i) => `${x[1] < 0 ? '-' : i ? '+' : ''}${Math.abs(x[1]) === 1 ? '' : Math.abs(x[1])}${x[0]}`).join('') : '\\vec{0}'; };
      const vec = (p, q) => V[q].map((x, i) => x - V[p][i]);
      const mid = (p, q) => V[p].map((x, i) => F(x + V[q][i], 2));
      if (level === 1) { let p, q; do { p = r.pick(names); q = r.pick(names); } while (p === q); let v = vec(p, q); if (r.next() < 0.6) { let p3, q3; do { p3 = r.pick(names); q3 = r.pick(names); } while (p3 === q3); const v2 = vec(p3, q3), vs = v.map((x, i) => x + v2[i]); return { q: `${M('ABCDEFGH')} est un cube. Exprimer ${M(`\\overrightarrow{${p}${q}}+\\overrightarrow{${p3}${q3}}`)} en fonction de ${M('\\overrightarrow{AB}')}, ${M('\\overrightarrow{AD}')} et ${M('\\overrightarrow{AE}')}.`, a: `${M(`\\overrightarrow{${p}${q}}=${dec(v)}`)} et ${M(`\\overrightarrow{${p3}${q3}}=${dec(v2)}`)} donc la somme vaut ${M(dec(vs))}.`, ok: () => { const s = [0, 0, 0]; const comp = [vec('A', 'B'), vec('A', 'D'), vec('A', 'E')]; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s[j] += vs[i] * comp[i][j]; return s.join() === vec(p, q).map((x, i) => x + vec(p3, q3)[i]).join(); } }; } return { q: `${M('ABCDEFGH')} est un cube. Exprimer ${M(`\\overrightarrow{${p}${q}}`)} en fonction de ${M('\\overrightarrow{AB}')}, ${M('\\overrightarrow{AD}')} et ${M('\\overrightarrow{AE}')}.`, a: `Dans le repère ${M('\\left(A;\\overrightarrow{AB},\\overrightarrow{AD},\\overrightarrow{AE}\\right)')}, ${M(`${p}${q === p ? '' : ''}`)} et ${M(q)} ont pour coordonnées ${M(`(${V[p].join('\\,;\\,')})`)} et ${M(`(${V[q].join('\\,;\\,')})`)} : ${M(`\\overrightarrow{${p}${q}}=${dec(v)}`)}.`, ok: () => { const s = [0, 0, 0]; const comp = [vec('A', 'B'), vec('A', 'D'), vec('A', 'E')]; const coef0 = vec(p, q); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s[j] += coef0[i] * comp[i][j]; return s.join() === v.join() && V[p].join() !== V[q].join(); } }; }
      if (level === 2) { let p, q, p2, q2; do { p = r.pick(names); q = r.pick(names); p2 = r.pick(names); q2 = r.pick(names); } while (p === q || p2 === q2 || (p === p2 && q === q2)); const M1 = mid(p, q), M2 = mid(p2, q2), v = M1.map((x, i) => sub(M2[i], x)); const col = v.map((x) => fracTex(x)); const eqv = v.every((x) => x.n === 0); return { q: `${M('ABCDEFGH')} est un cube ; ${M('I')} est le milieu de ${M(`[${p}${q}]`)} et ${M('J')} celui de ${M(`[${p2}${q2}]`)}. Dans le repère ${M('\\left(A;\\overrightarrow{AB},\\overrightarrow{AD},\\overrightarrow{AE}\\right)')}, donner les coordonnées de ${M('I')}, ${M('J')} et ${M('\\overrightarrow{IJ}')}.`, a: `${M(`I\\left(${M1.map(fracTex).join('\\,;\\,')}\\right)`)}, ${M(`J\\left(${M2.map(fracTex).join('\\,;\\,')}\\right)`)}, ${M(`\\overrightarrow{IJ}\\begin{pmatrix}${col.join('\\\\')}\\end{pmatrix}`)}${eqv ? ' (I et J sont confondus).' : '.'}`, ok: () => { const mm = (a0, b0) => V[a0].map((x, i) => (x + V[b0][i]) / 2); const I = mm(p, q), J = mm(p2, q2); return v.every((x, i) => near(val(x), J[i] - I[i], 1e-12)) && M1.every((x, i) => near(val(x), I[i], 1e-12)); } }; }
      let p, q, p2; do { p = r.pick(names); q = r.pick(names); p2 = r.pick(names); } while (p === q || p2 === p || p2 === q);
      const k = r.pick([F(1, 2), F(1, 3), F(2, 3), F(1, 4), F(3, 4)]), Mv = V[p].map((x, i) => add(F(x), mul(k, F(V[q][i] - x)))), dv = Mv.map((x, i) => sub(x, F(V[p2][i])));
      return { q: `${M('ABCDEFGH')} est un cube et ${M('M')} est le point défini par ${M(`\\overrightarrow{${p}M}=${fracTex(k)}\\overrightarrow{${p}${q}}`)}. Déterminer, dans le repère ${M('\\left(A;\\overrightarrow{AB},\\overrightarrow{AD},\\overrightarrow{AE}\\right)')}, les coordonnées de ${M('M')} puis de ${M(`\\overrightarrow{${p2}M}`)}, et dire si ${M(`${p2}`)}, ${M('M')} et ${M(q)} sont alignés.`, a: `${M(`M\\left(${Mv.map(fracTex).join('\\,;\\,')}\\right)`)}, ${M(`\\overrightarrow{${p2}M}\\begin{pmatrix}${dv.map(fracTex).join('\\\\')}\\end{pmatrix}`)}. ${(() => { const a0 = dv.map((x) => val(x)), b0 = V[q].map((x, i) => x - V[p2][i]); const cr = [a0[1] * b0[2] - a0[2] * b0[1], a0[2] * b0[0] - a0[0] * b0[2], a0[0] * b0[1] - a0[1] * b0[0]]; return cr.every((x) => Math.abs(x) < 1e-12) ? `${M(`${p2}`)}, ${M('M')} et ${M(q)} sont alignés.` : `${M(`${p2}`)}, ${M('M')} et ${M(q)} ne sont pas alignés.`; })()}`, ok: () => { const P = V[p], Q = V[q], X = P.map((x, i) => x + val(k) * (Q[i] - x)); return Mv.every((x, i) => near(val(x), X[i], 1e-12)) && dv.every((x, i) => near(val(x), X[i] - V[p2][i], 1e-12)); } };
    } },

  { id: 't-sp-affine', cls: C, chapter: 'terminale-02', domain: 'geometrie', skill: 'Parallélogramme, centre de gravité, point défini par une relation vectorielle', fast: false,
    make(r, level) {
      const P = () => [r.int(-6, 6), r.int(-6, 6), r.int(-6, 6)], pt = (n, p) => `${n}\\left(${p.map((x) => (typeof x === 'number' ? x : fracTex(x))).join('\\,;\\,')}\\right)`, same = (a, b) => a.every((x, i) => x === b[i]);
      if (level === 1) { let A, B, C0; do { A = P(); B = P(); C0 = P(); } while (same(A, B) || same(B, C0) || same(A, C0)); const D = A.map((x, i) => C0[i] - B[i] + x); return { q: `Dans un repère de l’espace, ${M(pt('A', A))}, ${M(pt('B', B))} et ${M(pt('C', C0))}. Déterminer le point ${M('D')} tel que ${M('ABCD')} soit un parallélogramme.`, a: `${M('ABCD')} est un parallélogramme si et seulement si ${M('\\overrightarrow{AB}=\\overrightarrow{DC}')}, soit ${M('D=A+\\overrightarrow{BC}')} : ${M(pt('D', D))}.`, ok: () => [0, 1, 2].every((i) => B[i] - A[i] === C0[i] - D[i]) }; }
      if (level === 2) { let A, B, C0; do { A = P(); B = P(); C0 = P(); } while (same(A, B)); const G = [0, 1, 2].map((i) => F(A[i] + B[i] + C0[i], 3)), I = [0, 1, 2].map((i) => F(B[i] + C0[i], 2)); return { q: `Dans un repère de l’espace, ${M(pt('A', A))}, ${M(pt('B', B))} et ${M(pt('C', C0))}. Calculer les coordonnées du centre de gravité ${M('G')} du triangle ${M('ABC')} et du milieu ${M('I')} de ${M('[BC]')}, puis vérifier que ${M('\\overrightarrow{AG}=\\dfrac{2}{3}\\overrightarrow{AI}')}.`, a: `${M(pt('G', G))}, ${M(pt('I', I))}. ${M(`\\overrightarrow{AG}\\left(${G.map((x, i) => fracTex(sub(x, F(A[i])))).join('\\,;\\,')}\\right)`)} et ${M(`\\dfrac{2}{3}\\overrightarrow{AI}\\left(${I.map((x, i) => fracTex(mul(F(2, 3), sub(x, F(A[i]))))).join('\\,;\\,')}\\right)`)} : égalité vérifiée.`, ok: () => [0, 1, 2].every((i) => eq(sub(G[i], F(A[i])), mul(F(2, 3), sub(I[i], F(A[i]))))) }; }
      let A, B, C0; do { A = P(); B = P(); C0 = P(); } while (same(A, B) || same(A, C0));
      const k = r.nz(-3, 3), l = r.nz(-3, 3), Mp = [0, 1, 2].map((i) => A[i] + k * (B[i] - A[i]) + l * (C0[i] - A[i])), t = r.pick([1, 2]);
      return { q: `Dans un repère de l’espace, ${M(pt('A', A))}, ${M(pt('B', B))} et ${M(pt('C', C0))}. Le point ${M('M')} vérifie ${M(`\\overrightarrow{AM}=${coef(k)}\\overrightarrow{AB}${sgn(l)}\\overrightarrow{AC}`.replace('+1\\', '+\\').replace('-1\\overrightarrow{AC}', '-\\overrightarrow{AC}'))}. Calculer ses coordonnées, puis exprimer ${M('\\overrightarrow{BM}')} en fonction de ${M('\\overrightarrow{AB}')} et ${M('\\overrightarrow{AC}')}.`, a: `${M(pt('M', Mp))}. ${M(`\\overrightarrow{BM}=\\overrightarrow{BA}+\\overrightarrow{AM}=-\\overrightarrow{AB}+${coef(k)}\\overrightarrow{AB}${sgn(l)}\\overrightarrow{AC}=${coef(k - 1)}\\overrightarrow{AB}${sgn(l)}\\overrightarrow{AC}`.replace(/=(\+)/, '=').replace('=\\overrightarrow{AB}', '=\\overrightarrow{AB}').replace('=-\\overrightarrow{AB}+-', '=-\\overrightarrow{AB}-').replace(/=0\\overrightarrow\{AB\}\+?/, '=').replace('=+', '='))}.`.replace('+1\\overrightarrow{AC}', '+\\overrightarrow{AC}').replace('-1\\overrightarrow{AC}', '-\\overrightarrow{AC}'), ok: () => [0, 1, 2].every((i) => Mp[i] - A[i] === k * (B[i] - A[i]) + l * (C0[i] - A[i])) && t > 0 };
    } },

  { id: 't-sp-reverse', cls: C, chapter: 'terminale-02', domain: 'geometrie', skill: 'Paramètre de coplanarité ou de colinéarité', fast: false,
    make(r, level) {
      const col = (v) => `\\begin{pmatrix}${v.join('\\\\')}\\end{pmatrix}`, det3 = (u, v, w) => u[0] * (v[1] * w[2] - v[2] * w[1]) - u[1] * (v[0] * w[2] - v[2] * w[0]) + u[2] * (v[0] * w[1] - v[1] * w[0]);
      if (level === 1) { let u, v; do { u = [r.nz(-4, 4), r.nz(-4, 4), r.nz(-4, 4)]; } while (false); const k = r.pick([-3, -2, 2, 3, F(1, 2).d]), m = r.nz(-4, 4); v = [k * u[0], m * k, k * u[2]]; return { q: `Déterminer ${M('m')} pour que ${M(`\\vec{u}${col([u[0], m, u[2]])}`)} et ${M(`\\vec{v}${col(v)}`)} soient colinéaires.`, a: `${M(`\\vec{v}=${k}\\vec{u}`)} par les première et troisième coordonnées, donc ${M(`${v[1]}=${k}m`)} et ${M(`m=${m}`)}.`, ok: () => v[0] === k * u[0] && v[2] === k * u[2] && v[1] === k * m }; }
      let u, v, ca, cc, m0, a, b; do { u = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)]; v = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)]; a = r.int(-4, 4); b = r.int(-4, 4); const cof = u[1] * v[2] - u[2] * v[1]; ca = cof; } while (ca === 0);
      m0 = r.int(-5, 5); const w = [m0, a, b];
      // det(u,v,(m,a,b)) = m*(u1 v2 - u2 v1) - a*(u0 v2 - u2 v0) + b*(u0 v1 - u1 v0)  (expansion along the third column)
      const c1 = u[1] * v[2] - u[2] * v[1], c2 = -(u[0] * v[2] - u[2] * v[0]), c3 = u[0] * v[1] - u[1] * v[0], rest = c2 * a + c3 * b, mm = F(-rest, c1);
      return { q: `Déterminer le réel ${M('m')} pour que ${M(`\\vec{u}${col(u)}`)}, ${M(`\\vec{v}${col(v)}`)} et ${M(`\\vec{w}${col(['m', a, b])}`)} soient coplanaires.${level === 3 ? ' Pour cette valeur, exprimer ' + M('\\vec{w}') + ' comme combinaison linéaire de ' + M('\\vec{u}') + ' et ' + M('\\vec{v}') + ' quand c’est possible.' : ''}`.replace(/ Pour cette valeur.*$/, level === 3 ? ` Que vaut ${M('\\det(\\vec{u},\\vec{v},\\vec{w})')} pour ${M('m=0')} ?` : ''), a: `${M(`\\det(\\vec{u},\\vec{v},\\vec{w})=${c1}m${sgn(rest)}`.replace('1m', 'm').replace('-1m', '-m'))} (développement selon la dernière colonne). Coplanaires si ce déterminant est nul : ${M(`m=${fracTex(mm)}`)}.${level === 3 ? ` Pour ${M('m=0')} : ${M(`\\det=${rest}`)}.` : ''}`, ok: () => { const mv = val(mm); return Math.abs(det3(u, v, [mv, a, b])) < 1e-9 && det3(u, v, [0, a, b]) === rest && c1 !== 0 && m0 !== undefined && w.length === 3; } };
    } },

  // ============================ 03 Limites de suites ============================
  { id: 't-lim-qcm', cls: C, chapter: 'terminale-03', domain: 'suites', skill: 'QCM sur les limites de suites', fast: true,
    make(r, level) {
      const LIM = (v) => (v === Infinity ? '+\\infty' : v === -Infinity ? '-\\infty' : fracTex(F(Math.round(v * 1000), 1000)));
      const big = (f) => f(1e7);
      if (level === 1) {
        const a = r.nz(-6, 6), b = r.int(-9, 9), c = r.int(-9, 9), f = (n) => a * n * n + b * n + c, lim = a > 0 ? Infinity : -Infinity;
        const cs = [[lim, 'le terme de plus haut degré ' + M(`${a}n^{2}`) + ' impose sa limite.'], [-lim, 'se trompe de signe : le signe du coefficient dominant ' + M(a) + ' donne le signe de la limite.'], [0, 'croit qu’un polynôme tend vers ' + M(0) + '.'], [a, 'prend le coefficient dominant pour la limite.']];
        return mcq(r, `${M(`\\lim_{n\\to+\\infty}\\left(${polyTex([a, b, c], 'n')}\\right)`)} vaut :`, opt(M(LIM(cs[0][0])), cs[0][1], { l: cs[0][0] }), cs.slice(1).map(([l, w]) => opt(M(LIM(l)), w, { l })), (o) => (o.l === Infinity ? big(f) > 1e9 : o.l === -Infinity ? big(f) < -1e9 : Math.abs(big(f) - o.l) < 1e-3));
      }
      if (level === 2) {
        let a, b, c, d; do { a = r.nz(-8, 8); b = r.int(-9, 9); c = r.nz(-6, 6); d = r.int(-9, 9); } while (c * 1 === 0);
        const f = (n) => (a * n + b) / (c * n + d), l = F(a, c);
        const cs = [[val(l), M(`\\dfrac{${a}}{${c}}`).replace(/.*/, 'on met ' + M('n') + ' en facteur : le quotient des coefficients dominants.'), l], [a / 1, 'prend le numérateur seul.', F(a)], [b === 0 ? 1 : b / d || 0, 'prend le quotient des termes constants.', d === 0 ? F(b) : F(b, d)], [Infinity, 'conclut à ' + M('\\dfrac{\\infty}{\\infty}=\\infty') + ' sans lever l’indétermination.', null]];
        const tex = (c0) => (c0[2] === null ? '+\\infty' : fracTex(c0[2]));
        if (new Set(cs.map(tex)).size < 4) return this.make(r, level);
        return mcq(r, `${M(`\\lim_{n\\to+\\infty}\\dfrac{${polyTex([a, b], 'n')}}{${polyTex([c, d], 'n')}}`)} vaut :`, opt(M(tex(cs[0])), cs[0][1], { l: val(cs[0][2]) }), cs.slice(1).map((c0) => opt(M(tex(c0)), c0[1], { l: c0[2] === null ? Infinity : val(c0[2]) })), (o) => (o.l === Infinity ? Math.abs(f(1e8)) > 1e6 : Math.abs(f(1e8) - o.l) < 1e-6));
      }
      let q, a, b, c, d; do { q = r.pick([2, 3, F(1, 2).n / 2, 0.5, -0.5, 4]); a = r.nz(-5, 5); b = r.int(-5, 5); c = r.nz(-4, 4); d = r.nz(-5, 5); } while (false);
      const f = (n) => (a * q ** n + b) / (c * q ** n + d), big0 = Math.abs(q) > 1, lim = big0 ? a / c : b / d;
      const qt = q === 0.5 ? '\\dfrac{1}{2}' : q === -0.5 ? '-\\dfrac{1}{2}' : `${q}`, L2 = (x) => numTex(F(Math.round(x * 1000), 1000));
      const cs = [[lim, big0 ? 'on divise par ' + M(`${qt}^{n}`) + ' qui tend vers l’infini : restent les coefficients de ' + M(`${qt}^{n}`) + '.' : M(`${qt}^{n}\\to 0`) + ' : restent les termes constants.'], [big0 ? b / d : a / c, big0 ? 'oublie que ' + M(`${qt}^{n}`) + ' est dominant (garde les constantes).' : 'oublie que ' + M(`${qt}^{n}`) + ' tend vers ' + M(0) + '.'], [a / c * (big0 ? -1 : 1) + 0 || 1, 'se trompe de signe.'], [(a + b) / (c + d) || 0.5, 'remplace ' + M(`${qt}^{n}`) + ' par ' + M(1) + '.']];
      if (new Set(cs.map((x) => L2(x[0]))).size < 4 || c * 0 !== 0 || (c + d === 0) || d === 0) return this.make(r, level);
      return mcq(r, `${M(`\\lim_{n\\to+\\infty}\\dfrac{${coef(a)}\\times ${qt.includes('frac') ? `\\left(${qt}\\right)` : par(q)}^{n}${sgn(b)}}{${coef(c)}\\times ${qt.includes('frac') ? `\\left(${qt}\\right)` : par(q)}^{n}${sgn(d)}}`.replace('1\\times', '').replace(/^\\lim_\{n\\to\+\\infty\}\\dfrac\{-1\\times/, ''))} vaut :`.replace(/\\times \\times/g, '\\times '), opt(M(L2(cs[0][0])), cs[0][1], { l: cs[0][0] }), cs.slice(1).map(([l, w]) => opt(M(L2(l)), w, { l })), (o) => near(f(big0 ? 60 : 200), o.l, 1e-6) || Math.abs(f(big0 ? 40 : 100) - o.l) < 1e-6);
    } },

  { id: 't-lim-tf', cls: C, chapter: 'terminale-03', domain: 'suites', skill: 'Vrai ou faux sur les limites de suites', fast: true,
    make(r, level) {
      const a = r.int(2, 60), b = r.nz(-40, 40), k = r.int(2, 60), q = r.pick([2, 3, 4, 5, 6, 7, 8, 9]);
      const fam = {
        1: [
          () => ({ s: `${M(`\\lim_{n\\to+\\infty}\\left(${a}n-${b * b + 1}\\right)=+\\infty`)}.`, v: true, j: `Une fonction affine de pente positive tend vers ${M('+\\infty')}.`, c: () => a * 1e9 - b * b - 1 > 1e8 }),
          () => ({ s: `Si ${M('u_n\\to 0')}, alors ${M('(u_n)')} est décroissante. (Ici ${M(`u_n=\\dfrac{(-1)^{n}}{n+${k}}`)}.)`, v: false, j: `${M('u_n')} tend vers ${M(0)} mais change de signe : ${M(`u_0=\\dfrac{1}{${k}}>u_1=-\\dfrac{1}{${k + 1}}`)} et ${M(`u_1<u_2`)}, donc elle n’est pas monotone.`, c: () => 1 / k > -1 / (k + 1) && -1 / (k + 1) < 1 / (k + 2) }),
          () => ({ s: `${M(`\\lim_{n\\to+\\infty}\\left(\\dfrac{1}{${q}}\\right)^{n}=0`)}.`, v: true, j: `${M(`-1<\\dfrac{1}{${q}}<1`)} : une suite géométrique de raison dans ${M(']-1\\,;\\,1[')} converge vers ${M(0)}.`, c: () => (1 / q) ** 80 < 1e-9 }),
          () => ({ s: `La suite ${M(`u_n=(-${q})^{n}`)} converge.`, v: false, j: `Sa raison ${M(`-${q}<-1`)} : ses termes alternent de signe avec une valeur absolue qui tend vers ${M('+\\infty')}, elle n’a pas de limite.`, c: () => Math.abs((-q) ** 20) > 1e6 }),
        ],
        2: [
          () => ({ s: `Si ${M('u_n\\leqslant v_n')} pour tout ${M('n')} et ${M('u_n\\to+\\infty')}, alors ${M('v_n\\to+\\infty')}. (Ici ${M(`u_n=${a}n`)}, ${M(`v_n=${a}n+(-1)^{n}`)}.)`, v: true, j: `Théorème de comparaison : ${M(`v_n\\geqslant u_n`)} et ${M('u_n\\to+\\infty')}. On a bien ${M(`u_n\\leqslant v_n`)} pour ${M('n\\geqslant 1')}.`, c: () => [1, 2, 3, 9].every((n) => a * n + (-1) ** n >= a * n - 1) && a > 1 }),
          () => ({ s: `${M(`\\lim_{n\\to+\\infty}\\left(\\sqrt{n+${k}}-\\sqrt{n}\\right)=+\\infty`)}.`, v: false, j: `${M(`\\sqrt{n+${k}}-\\sqrt{n}=\\dfrac{${k}}{\\sqrt{n+${k}}+\\sqrt{n}}\\to 0`)} (quantité conjuguée).`, c: () => Math.abs(Math.sqrt(1e12 + k) - Math.sqrt(1e12)) < 1e-3 }),
          () => ({ s: `${M(`\\lim_{n\\to+\\infty}\\dfrac{${a}n^{2}+${b === 0 ? 1 : Math.abs(b)}}{n^{2}+n}=${a}`)}.`, v: true, j: `On factorise ${M('n^{2}')} : le quotient tend vers ${M(`\\dfrac{${a}}{1}=${a}`)}.`, c: () => near((a * 1e9 ** 2 + Math.abs(b === 0 ? 1 : b)) / (1e9 ** 2 + 1e9), a, 1e-6) }),
          () => ({ s: `Une suite croissante tend vers ${M('+\\infty')}. (On teste ${M(`u_n=${a}-\\dfrac{1}{n+1}`)}.)`, v: false, j: `${M(`u_n`)} est croissante mais majorée par ${M(a)} : elle converge vers ${M(a)}.`, c: () => a - 1 / 1e9 < a }),
        ],
        3: [
          () => ({ s: `Pour tout ${M('n\\geqslant 1')}, ${M(`${a - 1}\\leqslant \\dfrac{${a}n+(-1)^{n}}{n}\\leqslant ${a + 1}`)}, donc la suite ${M(`\\dfrac{${a}n+(-1)^{n}}{n}`)} converge vers ${M(a)}.`, v: true, j: `Les bornes ${M(a - 1)} et ${M(a + 1)} ne suffisent pas à donner la limite ; mais ${M(`\\dfrac{${a}n+(-1)^{n}}{n}=${a}+\\dfrac{(-1)^{n}}{n}\\to ${a}`)} (théorème des gendarmes avec ${M(`${a}-\\dfrac{1}{n}\\leqslant\\cdots\\leqslant ${a}+\\dfrac{1}{n}`)}).`, c: () => [1, 2, 7, 1e6].every((n) => (a * n + (-1) ** n) / n >= a - 1 && (a * n + (-1) ** n) / n <= a + 1) && Math.abs((a * 1e9 + 1) / 1e9 - a) < 1e-6 }),
          () => ({ s: `${M(`\\lim_{n\\to+\\infty}\\left(${q}^{n}-${q + 1}^{n}\\right)=0`)}.`, v: false, j: `${M(`${q + 1}^{n}`)} l’emporte sur ${M(`${q}^{n}`)} : ${M(`${q + 1}^{n}\\left(\\left(\\dfrac{${q}}{${q + 1}}\\right)^{n}-1\\right)\\to-\\infty`)}.`, c: () => (q ** 80 - (q + 1) ** 80) < -1e9 }),
          () => ({ s: `Si ${M(`u_{n+1}=\\dfrac{1}{${q}}u_n+${k}`)}, la suite ${M('(u_n)')} converge vers ${M(`\\dfrac{${k * q}}{${q - 1}}`)}.`, v: true, j: `${M(`\\ell=\\dfrac{1}{${q}}\\ell+${k}\\iff\\ell\\dfrac{${q - 1}}{${q}}=${k}\\iff\\ell=\\dfrac{${k * q}}{${q - 1}}`)} et ${M('\\left|\\dfrac{1}{' + q + '}\\right|<1')}.`, c: () => { let x = 1; for (let i = 0; i < 400; i++) x = x / q + k; return near(x, (k * q) / (q - 1), 1e-9); } }),
          () => ({ s: `Si ${M('(u_n)')} converge, alors ${M('(u_n)')} est monotone. (On teste ${M(`u_n=\\dfrac{(-1)^{n}}{n+${k}}`)}.)`, v: false, j: `Elle converge vers ${M(0)} mais ${M(`u_0>0>u_1`)} et ${M('u_1<0<u_2')} : pas monotone.`, c: () => 1 / k > -1 / (k + 1) && -1 / (k + 1) < 1 / (k + 2) }),
        ],
      };
      return tf(r.pick(fam[level])());
    } },

  { id: 't-lim-error', cls: C, chapter: 'terminale-03', domain: 'suites', skill: 'Trouver l’erreur dans un calcul de limite de suite', fast: false,
    make(r, level) {
      if (level <= 2) {
        let a, b, c, d, e, kind; do { a = r.nz(-6, 6); b = r.int(-6, 6); c = r.nz(-5, 5); d = r.int(-5, 5); e = r.int(-5, 5); kind = r.pick(level === 1 ? ['inf', 'lead'] : ['inf', 'lead', 'deg']); } while (a * c === 0);
        const eq2 = level === 1 ? `\\dfrac{${polyTex([a, b, 0], 'n')}}{${polyTex([c, d, e], 'n')}}` : `\\dfrac{${polyTex([a, b, 0], 'n')}}{${polyTex([c, d, e], 'n')}}`;
        const good = [`\\dfrac{${polyTex([a, b, 0], 'n')}}{${polyTex([c, d, e], 'n')}}=\\dfrac{n^{2}\\left(${a}${b === 0 ? '' : `+\\dfrac{${b}}{n}`}\\right)}{n^{2}\\left(${c}${d === 0 ? '' : `+\\dfrac{${d}}{n}`}${e === 0 ? '' : `+\\dfrac{${e}}{n^{2}}`}\\right)}`.replace(/\+\\dfrac\{-/g, '-\\dfrac{'), `\\text{or }\\dfrac{${b}}{n},\\ \\dfrac{${d}}{n},\\ \\dfrac{${e}}{n^{2}}\\to 0`, `\\lim=\\dfrac{${a}}{${c}}=${fracTex(F(a, c))}`];
        let lines = good, bad, why, fix, shown = F(a, c);
        if (kind === 'inf') { lines = [good[0], good[1], `\\lim=\\dfrac{+\\infty}{+\\infty}=1`]; bad = 2; why = `${M('\\dfrac{\\infty}{\\infty}')} est une forme indéterminée : on a factorisé justement pour la lever, la limite est ${M(`\\dfrac{${a}}{${c}}`)}.`; fix = M(good[2]); shown = F(1); }
        else if (kind === 'lead') { lines = [good[0], good[1], `\\lim=\\dfrac{${b}}{${d === 0 ? 1 : d}}=${fracTex(F(b, d === 0 ? 1 : d))}`]; bad = 2; why = `il faut diviser les coefficients dominants ${M(a)} et ${M(c)} (ceux de ${M('n^{2}')}), pas les coefficients de ${M('n')}.`; fix = M(good[2]); shown = F(b, d === 0 ? 1 : d); }
        else { lines = [good[0], `\\text{or }\\dfrac{${b}}{n}\\to ${b}\\ \\text{ et }\\ \\dfrac{${d}}{n}\\to ${d}`, `\\lim=\\dfrac{${a}${sgn(b)}}{${c}${sgn(d)}}`.replace(/\\lim=\\dfrac\{([^}]*)\}\{([^}]*)\}/, (m0, p, q2) => `\\lim=\\dfrac{${a + b}}{${c + d}}`)]; bad = 1; why = `${M('\\dfrac{k}{n}')} tend vers ${M(0)} quand ${M('n')} tend vers ${M('+\\infty')}, non vers ${M('k')}.`; fix = M(good[1]); shown = c + d === 0 ? F(0) : F(a + b, c + d); if (c + d === 0) return this.make(r, level); }
        if (eq(shown, F(a, c))) return this.make(r, level);
        return spot(`Pour calculer ${M(`\\lim_{n\\to+\\infty}${eq2}`)}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(good[2]), () => { const f = (n) => (a * n * n + b * n) / (c * n * n + d * n + e); return Math.abs(f(1e7) - a / c) < 1e-5 && !eq(shown, F(a, c)); });
      }
      let q, a, b, kind; do { q = r.pick([2, 3, 4, 5, 6, 7]); a = r.nz(-9, 9); b = r.int(-9, 9); kind = r.pick(['dom', 'lim', 'sign']); } while (b === 0);
      const f = (n) => a * q ** n + b * n, lim = a > 0 ? '+\\infty' : '-\\infty';
      const good = [`${sumC(a, `${q}^{n}`, b, 'n')}=${q}^{n}\\left(${a}${b < 0 ? '-' : '+'}${Math.abs(b) === 1 ? '' : Math.abs(b)}\\dfrac{n}{${q}^{n}}\\right)`, `\\text{or }${q}^{n}\\to+\\infty\\ \\text{ et }\\ \\dfrac{n}{${q}^{n}}\\to 0`, `\\lim=${lim}`];
      let lines = good, bad, why, fix, shown = a > 0 ? Infinity : -Infinity;
      if (kind === 'dom') { lines = [good[0], `\\text{or }${q}^{n}\\to+\\infty\\ \\text{ et }\\ \\dfrac{n}{${q}^{n}}\\to+\\infty`, `\\lim=${lim}`]; bad = 1; why = `les croissances comparées donnent ${M(`\\dfrac{n}{${q}^{n}}\\to 0`)} : l’exponentielle de base ${M(q)} l’emporte sur ${M('n')}.`; fix = M(good[1]); shown = 'x'; }
      else if (kind === 'lim') { lines = [good[0], good[1], `\\lim=${a}\\times 0=0`]; bad = 2; why = `${M(`${q}^{n}`)} tend vers ${M('+\\infty')} : le produit ${M(`${q}^{n}\\times(${a}+0)`)} a pour limite ${M(lim)}.`; fix = M(good[2]); shown = 0; }
      else { lines = [good[0], good[1], `\\lim=${a > 0 ? '-' : '+'}\\infty`]; bad = 2; why = `la limite a le signe de ${M(a)} (coefficient de ${M(`${q}^{n}`)}).`; fix = M(good[2]); shown = a > 0 ? -Infinity : Infinity; }
      return spot(`Pour calculer ${M(`\\lim_{n\\to+\\infty}\\left(${sumC(a, `${q}^{n}`, b, 'n')}\\right)`)}, un élève écrit une solution.`, lines.map(M), bad, why, fix, M(good[2]), () => (a > 0 ? f(40) > 1e9 : f(40) < -1e9) && shown !== (a > 0 ? Infinity : -Infinity));
    } },

  { id: 't-lim-geo', cls: C, chapter: 'terminale-03', domain: 'suites', skill: 'Limites avec une suite géométrique', fast: true,
    make(r, level) {
      if (level === 1) { const q = r.pick([F(1, 2), F(1, 3), F(2, 3), F(3, 4), F(1, 5), F(4, 5)]), a = r.nz(-9, 9), b = r.int(-9, 9), f = (n) => a * val(q) ** n + b; return { q: `Déterminer la limite de ${M(`u_n=${a}\\times\\left(${fracTex(q)}\\right)^{n}${sgn(b)}`.replace('+0', ''))}.`, a: `${M(`-1<${fracTex(q)}<1`)} donc ${M(`\\left(${fracTex(q)}\\right)^{n}\\to 0`)} et ${M(`u_n\\to ${b}`)}.`, ok: () => near(f(500), b, 1e-6) && val(q) < 1 }; }
      if (level === 2) { const q = r.pick([F(1, 2), F(1, 3), F(2, 3), F(3, 4), F(1, 5), F(-1, 2), F(-1, 3), F(-2, 3)]), u0 = r.nz(-9, 9), N = r.int(3, 8), S = (n) => { let s = 0; for (let i = 0; i <= n; i++) s += u0 * val(q) ** i; return s; }, lim = div(F(u0), sub(F(1), q)); return { q: `Soit ${M(`S_n=\\sum_{k=0}^{n}${par(u0)}\\times\\left(${fracTex(q)}\\right)^{k}`)}. Exprimer ${M('S_n')} en fonction de ${M('n')} puis donner ${M('\\lim S_n')}.`, a: `${M(`S_n=${u0}\\times\\dfrac{1-\\left(${fracTex(q)}\\right)^{n+1}}{1-${q.n < 0 ? `\\left(${fracTex(q)}\\right)` : fracTex(q)}}`)}. Comme ${M(`\\left(${fracTex(q)}\\right)^{n+1}\\to 0`)} : ${M(`\\lim S_n=\\dfrac{${u0}}{${fracTex(sub(F(1), q))}}=${fracTex(lim)}`)}.`, ok: () => near(S(400), val(lim), 1e-9) && Math.abs(val(q)) < 1 && near(S(N), u0 * (1 - val(q) ** (N + 1)) / (1 - val(q)), 1e-9) }; }
      let p, s0, a, c, rev; do { p = r.int(2, 6); s0 = r.int(p + 1, 7); a = r.nz(-6, 6); c = r.nz(-6, 6); rev = r.next() < 0.5; } while (false);
      const f = (n) => (rev ? (a * s0 ** n + p ** n) / (s0 ** n + c * p ** n) : (a * p ** n + s0 ** n) / (p ** n + c * s0 ** n)), lim = rev ? F(a) : F(1, c);
      const bn = `${s0}^{n}`, ln = rev ? `\\left(\\dfrac{${p}}{${s0}}\\right)^{n}` : `\\left(\\dfrac{${p}}{${s0}}\\right)^{n}`;
      const num = rev ? `${cT(a, `${s0}^{n}`)}+${p}^{n}` : `${cT(a, `${p}^{n}`)}+${s0}^{n}`, den = rev ? `${s0}^{n}${c < 0 ? '-' : '+'}${cT(Math.abs(c), `${p}^{n}`)}` : `${p}^{n}${c < 0 ? '-' : '+'}${cT(Math.abs(c), `${s0}^{n}`)}`;
      const nm2 = rev ? `${a}+${ln}` : `${a === 1 ? '' : a === -1 ? '-' : a}${ln}+1`, dn2 = rev ? `1${c < 0 ? '-' : '+'}${Math.abs(c) === 1 ? '' : Math.abs(c)}${ln}` : `${ln}${c < 0 ? '-' : '+'}${Math.abs(c) === 1 ? '' : Math.abs(c)}`;
      return { q: `Déterminer la limite de ${M(`u_n=\\dfrac{${num}}{${den}}`)}.`, a: `Le terme dominant est ${M(bn)} (car ${M(`${p}<${s0}`)}) : on divise numérateur et dénominateur par ${M(bn)}. ${M(`u_n=\\dfrac{${nm2}}{${dn2}}`)} avec ${M(`\\left(\\dfrac{${p}}{${s0}}\\right)^{n}\\to 0`)} : ${M(`\\lim u_n=${fracTex(lim)}`)}.`, ok: () => Math.abs(f(rev ? 120 : 120) - val(lim)) < 1e-6 && p < s0 };
    } },

  { id: 't-lim-squeeze', cls: C, chapter: 'terminale-03', domain: 'suites', skill: 'Théorèmes de comparaison et des gendarmes', fast: false,
    make(r, level) {
      const a = r.nz(-30, 30), k = r.int(1, 30);
      const c = r.int(2, 60), dd = r.int(1, 9); if (level === 1) { const u = (n) => n + (-1) ** n, kind = r.pick(['inf']); return { q: `Montrer que, pour tout ${M('n')}, ${M(`u_n=${polyTex([c, 0], 'n')}${dd === 1 ? '+' : `+${dd}`}(-1)^{n}\\geqslant ${c}n-${dd}`)}, puis déterminer ${M('\\lim u_n')}.`, a: `${M('(-1)^{n}\\geqslant -1')} donc ${M(`u_n\\geqslant ${c}n-${dd}`)} ; comme ${M(`${c}n-${dd}\\to+\\infty`)}, par comparaison ${M('u_n\\to+\\infty')}.`, ok: () => [0, 1, 2, 3, 50].every((n) => c * n + dd * (-1) ** n >= c * n - dd) && c * 1e9 - dd > 1e8 && kind === 'inf' && u(1) !== undefined }; }
      if (level === 2) { const u = (n) => (a * n + (-1) ** n * k) / n; return { q: `Pour ${M('n\\geqslant 1')}, ${M(`u_n=\\dfrac{${polyTex([a, 0], 'n')}${sgn(0)}}{n}`.replace('+0', ''))}`.length ? `Pour ${M('n\\geqslant 1')}, on pose ${M(`u_n=${a}+\\dfrac{${k}(-1)^{n}}{n}`)}. Encadrer ${M('u_n')} puis déterminer sa limite avec le théorème des gendarmes.`.replace('+\\dfrac', '+\\dfrac') : '', a: `${M('-1\\leqslant(-1)^{n}\\leqslant 1')} donne ${M(`${a}-\\dfrac{${k}}{n}\\leqslant u_n\\leqslant ${a}+\\dfrac{${k}}{n}`)}. Les deux bornes tendent vers ${M(a)} : ${M(`\\lim u_n=${a}`)}.`, ok: () => [1, 2, 3, 10, 77].every((n) => a + (k * (-1) ** n) / n >= a - k / n - 1e-12 && a + (k * (-1) ** n) / n <= a + k / n + 1e-12) && Math.abs(u(1e9) - a) < 1e-6 }; }
      const a0 = r.int(1, 9), u = (n) => (a0 * n + Math.sin(n)) / (n * n + c), lim = 0;
      return { q: `Pour ${M('n\\geqslant 1')}, on pose ${M(`u_n=\\dfrac{${coef(a0)}n+\\sin n}{n^{2}+${c}}`)}. Démontrer que ${M(`\\dfrac{${coef(a0)}n-1}{n^{2}+${c}}\\leqslant u_n\\leqslant\\dfrac{${coef(a0)}n+1}{n^{2}+${c}}`)} puis déterminer ${M('\\lim u_n')}.`, a: `${M('-1\\leqslant\\sin n\\leqslant 1')}, et ${M(`n^{2}+${c}>0`)}. Or ${M(`\\dfrac{${coef(a0)}n\\pm 1}{n^{2}+${c}}=\\dfrac{\\frac{${a0}}{n}\\pm\\frac{1}{n^{2}}}{1+\\frac{${c}}{n^{2}}}\\to 0`)} : par le théorème des gendarmes, ${M('\\lim u_n=0')}.`, ok: () => [1, 2, 5, 40, 1000].every((n) => u(n) >= (a0 * n - 1) / (n * n + c) - 1e-12 && u(n) <= (a0 * n + 1) / (n * n + c) + 1e-12) && Math.abs(u(1e7) - lim) < 1e-5 };
    } },

  { id: 't-lim-recur', cls: C, chapter: 'terminale-03', domain: 'suites', skill: 'Limite d’une suite arithmético-géométrique', fast: false,
    make(r, level) {
      const a = r.pick([F(1, 2), F(1, 3), F(2, 3), F(3, 4), F(1, 5), F(-1, 2), F(-1, 3)]), l = r.nz(-9, 9), b = mul(F(l), sub(F(1), a)), u0 = l + r.nz(-9, 9) * r.pick([1, 2]);
      const bT = fracTex(b), aT = fracTex(a), f = (x) => val(a) * x + val(b);
      const head = `${M('(u_n)')} est définie par ${M(`${U(0)}=${u0}`)} et ${M(`${U('n+1')}=${a.n < 0 ? `\\left(${aT}\\right)` : aT}u_n${b.n < 0 ? `-${fracTex(F(-b.n, b.d))}` : b.n === 0 ? '' : `+${bT}`}`)}.`;
      let x = u0; for (let i = 0; i < 600; i++) x = f(x);
      if (level === 1) return { q: `${head} On suppose que ${M('(u_n)')} converge vers ${M('\\ell')}. Déterminer ${M('\\ell')}.`, a: `En passant à la limite : ${M(`\\ell=${a.n < 0 ? `\\left(${aT}\\right)` : aT}\\ell${b.n < 0 ? `-${fracTex(F(-b.n, b.d))}` : `+${bT}`}`)}, soit ${M(`\\ell\\left(1-${a.n < 0 ? `\\left(${aT}\\right)` : aT}\\right)=${bT}`)} et ${M(`\\ell=${l}`)}.`, ok: () => near(x, l, 1e-9) && eq(add(mul(a, F(l)), b), F(l)) };
      if (level === 2) return { q: `${head} On pose ${M(`v_n=u_n${sgn(-l)}`)}. Montrer que ${M('(v_n)')} est géométrique, exprimer ${M('u_n')} en fonction de ${M('n')} et en déduire ${M('\\lim u_n')}.`, a: `${M(`v_{n+1}=u_{n+1}${sgn(-l)}=${aT}\\left(u_n${sgn(-l)}\\right)=${aT}v_n`.replace(`=${aT}\\left`, `=${a.n < 0 ? `\\left(${aT}\\right)` : aT}\\left`))} car ${M(`${l}=${a.n < 0 ? `\\left(${aT}\\right)` : aT}\\times ${par(l)}+${bT}`.replace('+-', '-'))}. ${M(`v_n=${u0 - l}\\times\\left(${aT}\\right)^{n}`)}, ${M(`u_n=${l}${u0 - l < 0 ? '-' : '+'}${Math.abs(u0 - l) === 1 ? '' : Math.abs(u0 - l)}\\times\\left(${aT}\\right)^{n}`)}, et ${M(`\\left|${aT}\\right|<1`)} donne ${M(`\\lim u_n=${l}`)}.`, ok: () => near(x, l, 1e-9) && near(f(u0) - l, val(a) * (u0 - l), 1e-9) && u0 !== l };
      const eps = r.pick([1e-1, 1e-2, 1e-3, 1e-4]), epsT = { 0.1: '10^{-1}', 0.01: '10^{-2}', 0.001: '10^{-3}', 0.0001: '10^{-4}' }[eps];
      let n = 0, y = u0; while (Math.abs(y - l) >= eps) { y = f(y); n++; if (n > 5000) break; }
      return { q: `${head} 1) Montrer que ${M(`|u_n-${par(l)}|=${Math.abs(u0 - l)}\\times\\left|${aT}\\right|^{n}`)}. 2) Déterminer, à la calculatrice, le plus petit entier ${M('n')} tel que ${M(`|u_n-${par(l)}|<${epsT}`)}.`, a: `1) ${M(`u_n-${par(l)}=(u_0-${par(l)})\\times${a.n < 0 ? `\\left(${aT}\\right)` : aT}^{n}=${u0 - l}\\times\\left(${aT}\\right)^{n}`)}, d’où la valeur absolue. 2) ${M(`|u_{${n - 1}}-${par(l)}|\\approx ${roundTex(Math.abs((u0 - l) * val(a) ** (n - 1)), 5)}\\geqslant ${epsT}`)} et ${M(`|u_{${n}}-${par(l)}|\\approx ${roundTex(Math.abs((u0 - l) * val(a) ** n), 5)}<${epsT}`)} : ${M(`n=${n}`)}.`, ok: () => { let z = u0, k = 0; while (Math.abs(z - l) >= eps) { z = f(z); k++; } return k === n && n > 0 && near(Math.abs(f(u0) - l), Math.abs(u0 - l) * Math.abs(val(a)), 1e-9) && Math.abs(Math.abs(y - l) - eps) > 1e-9; } };
    } },

  { id: 't-lim-threshold', cls: C, chapter: 'terminale-03', domain: 'suites', skill: 'Seuil pour une suite de limite infinie', fast: false,
    make(r, level) {
      const kinds = level === 1 ? ['arith'] : level === 2 ? ['geo'] : ['geo', 'mix'];
      const kind = r.pick(kinds);
      let nameTxt, f, S, n;
      if (kind === 'arith') { const a = r.int(2, 9), b = r.int(-9, 9), M0 = r.int(2, 9) * 100; f = (k) => a * k + b; nameTxt = `${U('n')}=${polyTex([a, b], 'n')}`; S = M0; n = 0; while (f(n) <= S) n++; }
      else if (kind === 'geo') { const q = r.pick([F(3, 2), F(5, 4), F(6, 5), F(2, 1), F(3, 1), F(7, 4)]), u0 = r.int(1, 9); f = (k) => u0 * val(q) ** k; nameTxt = `${U('n')}=${u0}\\times\\left(${fracTex(q)}\\right)^{n}`.replace('\\left(2\\right)', '2').replace('\\left(3\\right)', '3'); S = u0 * 10 ** r.int(2, 5); n = 0; while (f(n) <= S) n++; }
      else { const q = r.pick([2, 3]), c0 = r.int(1, 9); f = (k) => q ** k + c0 * k; nameTxt = `${U('n')}=${q}^{n}+${coef(c0)}n`; S = 10 ** r.int(3, 6); n = 0; while (f(n) <= S) n++; }
      const Sx = S.toLocaleString('fr-FR').replace(/\s| /g, '\\,');
      return { q: `La suite ${M(`${nameTxt}`)} tend vers ${M('+\\infty')}. Déterminer le plus petit entier ${M('n')} tel que ${M(`u_n>${Sx}`)}.`, a: `La suite est strictement croissante. À la calculatrice (ou par un algorithme) : ${M(`${U(n - 1)}\\approx ${roundTex(f(n - 1), 2)}\\leqslant ${Sx}`)} et ${M(`${U(n)}\\approx ${roundTex(f(n), 2)}>${Sx}`)} : ${M(`n=${n}`)}.`, ok: () => { let k = 0; while (!(f(k) > S)) { k++; if (k > 5000) return false; } return k === n && n > 0 && f(n - 1) <= S && f(n) > S && Math.abs(f(n) - S) > 1e-9; } };
    } },
];
