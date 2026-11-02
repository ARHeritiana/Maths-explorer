// Seconde generators, third file (chapters 08 to 15): same contract as templates-seconde.js. Each make(r, level)
// returns {q, a, s?, ok}; ok() recomputes the answer by another route (tests/exercise-bank.test.mjs, exercise-audit.test.mjs).
import { F, add, sub, mul, div, val, eq, M, fracTex, numTex, roundTex, polyTex, evalPoly, sgn, par, gcd, decimals } from './engine.js';
import { pt, vc, lin, affTex, ivTex, ivHas, E, Einf, dec, parT } from './seconde-kit.js';

const C = 'seconde';
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const pc = (f) => `${numTex(f)}\\,\\%`;
const fset = (list) => { const u = []; list.forEach((f) => { if (!u.some((g) => eq(g, f))) u.push(f); }); u.sort((a, b) => val(a) - val(b)); return u; };
const solTex = (list) => (list.length ? `S=\\left\\{${list.map(fracTex).join('\\,;\\,')}\\right\\}` : 'S=\\varnothing');
const POP = [
  ['élèves d’un lycée', ['filles', 'garçons'], ['demi-pensionnaires', 'externes']],
  ['clients d’une salle de sport', ['clients de moins de 30 ans', 'clients de 30 ans ou plus'], ['abonnés', 'non-abonnés']],
  ['salariés d’une entreprise', ['salariés à temps plein', 'salariés à temps partiel'], ['télétravailleurs', 'non-télétravailleurs']],
  ['spectateurs d’un festival', ['spectateurs venus en train', 'spectateurs venus en voiture'], ['résidents de la région', 'visiteurs extérieurs']],
  ['pièces produites par une usine', ['pièces de la machine A', 'pièces de la machine B'], ['pièces défectueuses', 'pièces conformes']],
];
const tableTex = (rows, cols, a, b, c, d, hide = []) => {
  const v = (k, x) => (hide.includes(k) ? '\\ldots' : x);
  return `\\begin{array}{l|cc|c}&\\text{${cols[0]}}&\\text{${cols[1]}}&\\text{Total}\\\\\\hline\\text{${cap(rows[0])}}&${v('a', a)}&${v('b', b)}&${v('r0', a + b)}\\\\\\text{${cap(rows[1])}}&${v('c', c)}&${v('d', d)}&${v('r1', c + d)}\\\\\\hline\\text{Total}&${v('c0', a + c)}&${v('c1', b + d)}&${v('N', a + b + c + d)}\\end{array}`;
};
const freqTex = (n, m) => { const f = mul(F(n, m), F(100)); return `\\dfrac{${n}}{${m}}${dec(f, 1)}\\,\\%`; };

export const seconde3 = [
  // ---------------- 08 Calcul algébrique ----------------
  { id: 's-zero-product', cls: C, chapter: 'seconde-08', domain: 'algebre', skill: 'Équations produit nul et quotient', fast: true,
    make(r, level) {
      const a = r.nz(-5, 5), b = r.int(-9, 9), c = r.nz(-5, 5), d = r.int(-9, 9), ra = F(-b, a), rc = F(-d, c);
      const at = (p, x) => add(mul(F(p[0]), x), F(p[1]));
      if (level === 1) {
        const S = fset([ra, rc]);
        return { q: `Résoudre dans ${M('\\mathbb{R}')} : ${M(`(${polyTex([a, b])})(${polyTex([c, d])})=0`)}.`, a: M(solTex(S)), s: 'Un produit est nul si et seulement si l’un de ses facteurs est nul.',
          ok: () => S.every((x) => eq(mul(at([a, b], x), at([c, d], x)), F(0))) && S.length === (eq(ra, rc) ? 1 : 2) };
      }
      if (level === 2) {
        const kind = r.pick(['x', 'sq', 'diff']);
        if (kind === 'x') { const S = fset([F(0), ra]); return { q: `Résoudre dans ${M('\\mathbb{R}')} : ${M(`${polyTex([a, b, 0])}=0`)}.`, a: M(solTex(S)), s: `On factorise par ${M('x')} : ${M(`x(${polyTex([a, b])})=0`)}.`, ok: () => S.every((x) => eq(add(mul(F(a), mul(x, x)), mul(F(b), x)), F(0))) }; }
        if (kind === 'sq') { const k = r.int(1, 9), S = fset([F(k - b, a), F(-k - b, a)]); return { q: `Résoudre dans ${M('\\mathbb{R}')} : ${M(`(${polyTex([a, b])})^{2}=${k * k}`)}.`, a: M(solTex(S)), s: `${M(`(${polyTex([a, b])})^{2}-${k}^{2}=0`)} se factorise avec ${M('A^{2}-B^{2}=(A-B)(A+B)')}.`, ok: () => S.length === 2 && S.every((x) => eq(mul(at([a, b], x), at([a, b], x)), F(k * k))) }; }
        const p = r.int(1, 7), q0 = r.int(1, 9), S = fset([F(q0, p), F(-q0, p)]);
        return { q: `Résoudre dans ${M('\\mathbb{R}')} : ${M(`${polyTex([p * p, 0, -q0 * q0])}=0`)}.`, a: M(solTex(S)), s: M(`${polyTex([p * p, 0, -q0 * q0])}=(${polyTex([p, -q0])})(${polyTex([p, q0])})`), ok: () => S.every((x) => eq(sub(mul(F(p * p), mul(x, x)), F(q0 * q0)), F(0))) };
      }
      if (r.next() < 0.5) {
        const S = eq(ra, rc) ? [] : [ra];
        return { q: `Résoudre dans ${M('\\mathbb{R}')} : ${M(`\\dfrac{${polyTex([a, b])}}{${polyTex([c, d])}}=0`)}.`, a: `Valeur interdite ${M(fracTex(rc))} ; ${M(solTex(S))}${S.length ? '' : ' : le numérateur ne s’annule qu’en la valeur interdite'}.`,
          ok: () => (S.length === 0) === eq(at([c, d], ra), F(0)) && S.every((x) => !eq(at([c, d], x), F(0)) && eq(at([a, b], x), F(0))) };
      }
      const k = r.nz(-4, 4); let x0;
      if (a === k * c) return this.make(r, level);
      x0 = F(k * d - b, a - k * c);
      const S = eq(x0, rc) ? [] : [x0];
      return { q: `Résoudre dans ${M('\\mathbb{R}')} : ${M(`\\dfrac{${polyTex([a, b])}}{${polyTex([c, d])}}=${k}`)}.`, a: `Valeur interdite ${M(fracTex(rc))} ; on résout ${M(`${polyTex([a, b])}=${k}(${polyTex([c, d])})`)} : ${M(solTex(S))}.`,
        ok: () => S.every((x) => eq(at([a, b], x), mul(F(k), at([c, d], x))) && !eq(at([c, d], x), F(0))) && (S.length === 0) === eq(x0, rc) };
    } },
  { id: 's-sign-product', cls: C, chapter: 'seconde-08', domain: 'algebre', skill: 'Signe d’un produit ou d’un quotient, inéquations', fast: false,
    make(r, level) {
      let a, b, c, d; do { a = r.nz(-5, 5); b = r.int(-9, 9); c = r.nz(-5, 5); d = r.int(-9, 9); } while (eq(F(-b, a), F(-d, c)));
      const rel = r.pick(['>', '\\geqslant ', '<', '\\leqslant ']), strict = rel === '>' || rel === '<', posWanted = rel[0] === '>' || rel.startsWith('\\ge');
      let shown = `(${polyTex([a, b])})(${polyTex([c, d])})${rel}0`, quot = false;
      if (level === 2) { quot = true; shown = `\\dfrac{${polyTex([a, b])}}{${polyTex([c, d])}}${rel}0`; }
      let extra = '';
      if (level === 3) { // (ax+b)(cx+d) rel (ax+b)(ex+f): move everything to one side and factor by ax+b
        let e, f; do { e = r.int(-5, 5); f = r.int(-9, 9); } while (e === 0 && f === 0);
        const c2 = c + e, d2 = d + f; // (ax+b)(c2 x + d2) - (ax+b)(e x + f) = (ax+b)(cx+d)
        if (c2 === 0 && d2 === 0) return this.make(r, level);
        shown = `(${polyTex([a, b])})(${polyTex([c2, d2])})${rel}(${polyTex([a, b])})(${polyTex([e, f])})`;
        extra = `On se ramène à ${M(`(${polyTex([a, b])})(${polyTex([c, d])})${rel}0`)} en factorisant par ${M(polyTex([a, b]))}. `;
      }
      const r1 = F(-b, a), r2 = F(-d, c), [lo, hi] = val(r1) < val(r2) ? [r1, r2] : [r2, r1];
      const outside = a * c > 0; // sign of the product outside the roots
      const wantOutside = outside === posWanted;
      const closedAt = (x) => !strict && !(quot && eq(x, r2));
      const S = wantOutside ? [{ lo: Einf, hi: E(lo), lc: false, hc: closedAt(lo) }, { lo: E(hi), hi: Einf, lc: closedAt(hi), hc: false }] : [{ lo: E(lo), hi: E(hi), lc: closedAt(lo), hc: closedAt(hi) }];
      const g = (x) => (a * x + b) * (c * x + d), pred = (x) => (posWanted ? (strict ? g(x) > 0 : g(x) >= 0) : (strict ? g(x) < 0 : g(x) <= 0));
      return { q: `Résoudre dans ${M('\\mathbb{R}')} : ${M(shown)}.`, a: `${extra}${M(`S=${ivTex(S)}`)}`, s: quot ? `Tableau de signes ; la valeur interdite ${M(fracTex(r2))} est toujours exclue.` : 'Tableau de signes : chaque facteur affine change de signe en sa racine.',
        ok: () => { for (let t = -300; t <= 300; t++) { const x = t / 20 + 0.0123; if (ivHas(S, x) !== pred(x)) return false; } return [lo, hi].every((x) => ivHas(S, val(x)) === closedAt(x)); } };
    } },

  // ---------------- 09 Proportions et évolutions ----------------
  { id: 's-proportion', cls: C, chapter: 'seconde-09', domain: 'nombres', skill: 'Proportion, proportion de proportion', fast: true,
    make(r, level) {
      const ctx = r.pick([['des élèves d’un lycée', 'sont internes', 'des internes', 'font du sport', 'élèves internes qui font du sport'], ['des salariés d’une entreprise', 'sont cadres', 'des cadres', 'sont des femmes', 'femmes cadres'], ['des habitants d’une ville', 'ont moins de 25 ans', 'de ces jeunes', 'sont étudiants', 'jeunes étudiants'], ['des voitures vendues', 'sont électriques', 'des voitures électriques', 'sont des citadines', 'citadines électriques']]);
      if (level === 1) {
        const k = r.int(2, 40), p = r.int(1, 95), N = 100 * k, n = k * p;
        return { q: `Sur ${M(N)} personnes interrogées, ${M(n)} déclarent lire au moins un livre par mois. Quelle est la proportion de lecteurs, en pourcentage ?`, a: M(`\\dfrac{${n}}{${N}}=${numTex(F(p, 100))}=${p}\\,\\%`), ok: () => n * 100 === p * N };
      }
      if (level === 2) {
        const p1 = 5 * r.int(2, 18), p2 = 5 * r.int(1, 19), p = F(p1 * p2, 100);
        return { q: `${cap(`${M(`${p1}\\,\\%`)}`)} ${ctx[0]} ${ctx[1]} et ${M(`${p2}\\,\\%`)} ${ctx[2]} ${ctx[3]}. Quelle est la proportion de ${ctx[4]} parmi l’ensemble ?`, a: M(`${numTex(F(p1, 100))}\\times ${numTex(F(p2, 100))}=${numTex(div(p, F(100)))}`) + `, soit ${M(pc(p))}.`, s: 'La proportion d’une proportion est le produit des deux proportions.',
          ok: () => near(val(p), (p1 * p2) / 100) };
      }
      let x, N; do { x = r.pick([4, 5, 8, 12, 15, 16, 20, 24, 25, 30, 35, 40, 45, 60, 75]); N = 20 * r.int(5, 150); } while ((N * x) % 100);
      const n = (N * x) / 100;
      return { q: `Dans un sondage, ${M(`${x}\\,\\%`)} des personnes interrogées, soit ${M(n)} personnes, se disent favorables à un projet. Combien de personnes ont été interrogées ?`, a: M(`N=\\dfrac{${n}}{${numTex(F(x, 100))}}=${N}`), ok: () => N * x === n * 100 };
    } },
  { id: 's-rate', cls: C, chapter: 'seconde-09', domain: 'nombres', skill: 'Taux d’évolution et coefficient multiplicateur', fast: true,
    make(r, level) {
      if (level === 1) {
        const VI = r.int(20, 500); let VF; do { VF = r.int(10, 700); } while (VF === VI);
        const t = mul(F(VF - VI, VI), F(100));
        return { q: `Un prix passe de ${M(`${VI}\\ \\text{€}`)} à ${M(`${VF}\\ \\text{€}`)}. Calculer le taux d’évolution en pourcentage${decimals(t) >= 0 && decimals(t) <= 2 ? '' : ' (arrondi à 0,1 %)'}.`, a: M(`t=\\dfrac{${VF}-${VI}}{${VI}}${dec(t, 1)}\\,\\%`), ok: () => near(val(t), ((VF - VI) / VI) * 100) };
      }
      const t = r.pick([-1, 1]) * r.pick([2, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 35, 40, 50, 60, 75]), VI = 5 * r.int(4, 120), cm = F(100 + t, 100), VF = mul(F(VI), cm);
      const word = t > 0 ? `une hausse de ${M(`${t}\\,\\%`)}` : `une baisse de ${M(`${-t}\\,\\%`)}`;
      if (level === 2) return { q: `Un article coûte ${M(`${VI}\\ \\text{€}`)}. Il subit ${word}. Donner le coefficient multiplicateur et le nouveau prix.`, a: M(`CM=${numTex(cm)}\\ ;\\ ${VI}\\times ${numTex(cm)}=${numTex(VF)}\\ \\text{€}`), ok: () => near(val(VF), VI * (1 + t / 100)) };
      return { q: `Après ${word}, un article coûte ${M(`${numTex(VF)}\\ \\text{€}`)}. Quel était son prix initial ? Quelle est la variation absolue ?`, a: `${M(`V_I=\\dfrac{${numTex(VF)}}{${numTex(cm)}}=${VI}\\ \\text{€}`)} ; variation absolue ${M(`${numTex(sub(VF, F(VI)))}\\ \\text{€}`)}.`, s: 'On divise par le coefficient multiplicateur ; on ne retranche pas le pourcentage.',
        ok: () => near(val(VF) / (1 + t / 100), VI) };
    } },
  { id: 's-successive', cls: C, chapter: 'seconde-09', domain: 'nombres', skill: 'Évolutions successives', fast: false,
    make(r, level) {
      const rate = (cm) => { const t = (cm - 1) * 100; return `${t >= 0 ? '+' : '-'}${roundTex(Math.abs(t), 2)}\\,\\%`; };
      if (level === 1) {
        const t = r.pick([-1, 1, 1]) * r.int(1, 12), n = r.int(2, 6), cm = (1 + t / 100) ** n;
        return { q: `Une quantité ${t > 0 ? 'augmente' : 'diminue'} de ${M(`${Math.abs(t)}\\,\\%`)} par an pendant ${M(n)} ans. Déterminer le taux d’évolution global (arrondi à 0,01 %).`, a: `${M(`CM=${numTex(F(100 + t, 100))}^{${n}}\\approx ${roundTex(cm, 4)}`)}, soit ${M(rate(cm))}.`, s: 'On multiplie les coefficients ; on n’additionne pas les taux.',
          ok: () => { let c = 1; for (let i = 0; i < n; i++) c *= 1 + t / 100; return near(c, cm); } };
      }
      if (level === 2) {
        const ts = [0, 0, 0].map(() => r.pick([-1, 1]) * r.int(1, 30)), cms = ts.map((t) => F(100 + t, 100)), cm = cms.reduce(mul, F(1)), g = mul(sub(cm, F(1)), F(100));
        return { q: `Un prix subit trois évolutions successives : ${ts.map((t) => M(`${t > 0 ? '+' : '-'}${Math.abs(t)}\\,\\%`)).join(', ')}. Déterminer le taux d’évolution global.`, a: `${M(`CM=${cms.map(numTex).join('\\times ')}${dec(cm, 6)}`)}, soit un taux ${M(`t${dec(g, 4)}\\,\\%`)}.`,
          ok: () => near(val(cm), ts.reduce((c, t) => c * (1 + t / 100), 1)) };
      }
      const t1 = r.pick([-1, 1]) * r.int(2, 30); let T; do { T = r.int(-20, 40); } while (T === t1);
      const c2 = (1 + T / 100) / (1 + t1 / 100), t2 = (c2 - 1) * 100;
      return { q: `Un chiffre d’affaires évolue de ${M(`${t1 > 0 ? '+' : '-'}${Math.abs(t1)}\\,\\%`)} la première année. Quel taux faut-il la deuxième année pour une évolution globale de ${M(`${T >= 0 ? '+' : '-'}${Math.abs(T)}\\,\\%`)} sur les deux ans (arrondi à 0,01 %) ?`,
        a: `${M(`${numTex(F(100 + t1, 100))}\\times CM_2=${numTex(F(100 + T, 100))}`)} donne ${M(`CM_2=\\dfrac{${numTex(F(100 + T, 100))}}{${numTex(F(100 + t1, 100))}}\\approx ${roundTex(c2, 4)}`)}, soit ${M(`${t2 >= 0 ? '+' : '-'}${roundTex(Math.abs(t2), 2)}\\,\\%`)}.`,
        ok: () => near((1 + t1 / 100) * (1 + t2 / 100), 1 + T / 100) };
    } },

  // ---------------- 10 Variations et extrémums ----------------
  { id: 's-compare-images', cls: C, chapter: 'seconde-10', domain: 'fonctions', skill: 'Comparer des images par les variations', fast: true,
    make(r, level) {
      const num = (lo, hi) => F(r.int(lo, hi), 10);
      let kind = level === 1 ? r.pick(['sqrt', 'cube', 'aff']) : level === 2 ? r.pick(['sq', 'abs']) : r.pick(['inv', 'sqmix']);
      let x, y, m = 0, p = 0;
      const two = (lo, hi) => { let u, v; do { u = num(lo, hi); v = num(lo, hi); } while (eq(u, v)); return [u, v]; };
      if (kind === 'sqrt') [x, y] = two(1, 300);
      else if (kind === 'cube') [x, y] = two(-90, 90);
      else if (kind === 'aff') { [x, y] = two(-90, 90); m = r.nz(-6, 6); p = r.int(-9, 9); }
      else if (kind === 'sq' || kind === 'abs') { const s = r.sign(); [x, y] = two(1, 99).map((u) => mul(u, F(s))); }
      else if (kind === 'inv') { const s = r.sign(); [x, y] = two(1, 99).map((u) => mul(u, F(s))); }
      else { let u, v; do { u = num(1, 99); v = num(1, 99); } while (eq(u, v)); x = mul(u, F(-1)); y = v; if (r.next() < 0.5) [x, y] = [y, x]; }
      const T = (u) => numTex(u), P = (u) => (u.n < 0 ? `(${T(u)})` : T(u));
      const f = { sqrt: (u) => `\\sqrt{${T(u)}}`, cube: (u) => `${P(u)}^{3}`, aff: (u) => `f(${T(u)})`, sq: (u) => `${P(u)}^{2}`, sqmix: (u) => `${P(u)}^{2}`, abs: (u) => `|${T(u)}|`, inv: (u) => `\\dfrac{1}{${T(u)}}` }[kind];
      const g = { sqrt: Math.sqrt, cube: (u) => u ** 3, aff: (u) => m * u + p, sq: (u) => u * u, sqmix: (u) => u * u, abs: Math.abs, inv: (u) => 1 / u }[kind];
      const [lo, hi] = val(x) < val(y) ? [x, y] : [y, x];
      let incr, why;
      if (kind === 'sqrt') { incr = true; why = `la fonction racine carrée est strictement croissante sur ${M('[0\\,;\\,+\\infty[')}`; }
      else if (kind === 'cube') { incr = true; why = `la fonction cube est strictement croissante sur ${M('\\mathbb{R}')}`; }
      else if (kind === 'aff') { incr = m > 0; why = `${M('f')} est affine de coefficient ${M(m)}, donc strictement ${incr ? 'croissante' : 'décroissante'} sur ${M('\\mathbb{R}')}`; }
      else if (kind === 'sq' || kind === 'abs') { incr = val(x) > 0; why = `la fonction ${kind === 'sq' ? 'carré' : 'valeur absolue'} est strictement ${incr ? 'croissante sur [0 ; +∞[' : 'décroissante sur ]-∞ ; 0]'}`.replace('[0 ; +∞[', M('[0\\,;\\,+\\infty[')).replace(']-∞ ; 0]', M(']-\\infty\\,;\\,0]')); }
      else if (kind === 'inv') { incr = false; why = `la fonction inverse est strictement décroissante sur ${M(val(x) > 0 ? ']0\\,;\\,+\\infty[' : ']-\\infty\\,;\\,0[')}`; }
      const big = kind === 'sqmix' ? (Math.abs(val(x)) > Math.abs(val(y)) ? x : y) : incr ? hi : lo, small = eq(big, x) ? y : x;
      const ans = `${M(`${f(small)}<${f(big)}`)}`;
      const reason = kind === 'sqmix' ? `On compare les valeurs absolues : ${M(`|${T(x)}|=${T(F(Math.abs(x.n), x.d))}`)} et ${M(`|${T(y)}|=${T(F(Math.abs(y.n), y.d))}`)}. Comme ${M('u^{2}=|u|^{2}')} et que la fonction carré est strictement croissante sur ${M('[0\\,;\\,+\\infty[')}, le plus grand carré est celui du nombre de plus grande valeur absolue : ${ans}.` : `${M(`${T(lo)}<${T(hi)}`)} et ${why} : ${ans}.`;
      return { q: `Sans calculer${kind === 'aff' ? `, avec ${M(`f(x)=${polyTex([m, p])}`)}` : ''}, comparer ${M(f(x))} et ${M(f(y))}.`, a: reason, ok: () => g(val(small)) < g(val(big)) };
    } },
  { id: 's-affine-variation', cls: C, chapter: 'seconde-10', domain: 'fonctions', skill: 'Variations d’une fonction affine', fast: true,
    make(r, level) {
      if (level === 1) {
        const m = r.next() < 0.1 ? F(0) : r.next() < 0.5 ? F(r.nz(-9, 9)) : F(r.nz(-9, 9), r.pick([2, 3, 4, 5])), p = F(r.int(-20, 20));
        const word = m.n > 0 ? 'strictement croissante' : m.n < 0 ? 'strictement décroissante' : 'constante';
        return { q: `Donner le sens de variation sur ${M('\\mathbb{R}')} de ${M(`f(x)=${affTex(m, p)}`)}.`, a: `${cap(word)} : le coefficient de ${M('x')} vaut ${M(fracTex(m))}.`, ok: () => Math.sign(val(m) * 1 + val(p) - val(p)) === Math.sign(m.n) };
      }
      const a = r.int(-9, 4), b = a + r.int(1, 8), u = r.int(-15, 15); let v; do { v = r.int(-15, 15); } while (v === u);
      const m = F(v - u, b - a);
      if (level === 2) return { q: `Une fonction affine ${M('f')} vérifie ${M(`f(${a})=${u}`)} et ${M(`f(${b})=${v}`)}. Est-elle croissante ou décroissante ? Justifier.`, a: `${M(`m=\\dfrac{${v}-${par(u)}}{${b}-${par(a)}}=${fracTex(m)}`)} : ${m.n > 0 ? 'positif, f est strictement croissante.' : 'négatif, f est strictement décroissante.'}`, ok: () => (v > u) === (m.n > 0) };
      const [lo, hi] = u < v ? [u, v] : [v, u];
      return { q: `Une fonction affine ${M('f')} vérifie ${M(`f(${a})=${u}`)} et ${M(`f(${b})=${v}`)}. Encadrer ${M('f(x)')} pour ${M(`x\\in[${a}\\,;\\,${b}]`)} et préciser où sont atteints le minimum et le maximum.`,
        a: `${M('f')} est strictement ${v > u ? 'croissante' : 'décroissante'} : ${M(`${lo}\\leqslant f(x)\\leqslant ${hi}`)} ; minimum ${M(lo)} en ${M(lo === u ? a : b)}, maximum ${M(hi)} en ${M(hi === u ? a : b)}.`,
        ok: () => { for (let k = 0; k <= 10; k++) { const x = a + ((b - a) * k) / 10, y = u + val(m) * (x - a); if (y < lo - 1e-9 || y > hi + 1e-9) return false; } return true; } };
    } },
  { id: 's-extremum-interval', cls: C, chapter: 'seconde-10', domain: 'fonctions', skill: 'Extremums sur un intervalle', fast: false,
    make(r, level) {
      const kind = level === 1 ? r.pick(['sq', 'abs', 'aff']) : level === 2 ? r.pick(['sq', 'msq', 'inv']) : 'can';
      let a = r.int(-8, 2), b = a + r.int(2, 9), f, ft, cand, al = 0, be = 0, m = 0, p = 0, k = 1;
      if (kind === 'inv') { const s = r.sign(); a = r.int(1, 6); b = a + r.int(1, 8); if (s < 0) [a, b] = [-b, -a]; k = r.nz(-12, 12); }
      if (kind === 'sq') { f = (x) => x * x; ft = 'x^{2}'; cand = [a, b, 0]; }
      if (kind === 'msq') { f = (x) => -x * x; ft = '-x^{2}'; cand = [a, b, 0]; }
      if (kind === 'abs') { f = (x) => Math.abs(x); ft = '|x|'; cand = [a, b, 0]; }
      if (kind === 'aff') { m = r.nz(-5, 5); p = r.int(-9, 9); f = (x) => m * x + p; ft = polyTex([m, p]); cand = [a, b]; }
      if (kind === 'inv') { f = (x) => k / x; ft = `\\dfrac{${k}}{x}`; cand = [a, b]; }
      if (kind === 'can') { al = r.int(a - 2, b + 2); be = r.int(-9, 9); k = r.pick([1, 2, -1, -2, 3]); f = (x) => k * (x - al) ** 2 + be; ft = `${k === 1 ? '' : k === -1 ? '-' : k}(x${al === 0 ? '' : sgn(-al)})^{2}${be ? sgn(be) : ''}`; cand = [a, b, al]; }
      cand = cand.filter((x) => x >= a && x <= b);
      const vals = cand.map((x) => [x, f(x)]), mx = Math.max(...vals.map((v) => v[1])), mn = Math.min(...vals.map((v) => v[1]));
      const where = (y) => [...new Set(vals.filter((v) => near(v[1], y)).map((v) => v[0]))].sort((u, w) => u - w);
      const show = (y) => (Number.isInteger(y) ? `${y}` : fracTex(F(k * where(y)[0] === 0 ? 0 : k, where(y)[0])));
      return { q: `Déterminer le maximum et le minimum de ${M(`f(x)=${ft}`)} sur ${M(`[${a}\\,;\\,${b}]`)}, et les valeurs de ${M('x')} où ils sont atteints.`,
        a: `Maximum ${M(show(mx))} atteint en ${M(where(mx).join('\\text{ et }'))} ; minimum ${M(show(mn))} atteint en ${M(where(mn).join('\\text{ et }'))}.`, s: kind === 'can' ? `Le sommet de la parabole a pour abscisse ${M(al)}${al >= a && al <= b ? ', dans l’intervalle' : ', hors de l’intervalle'}.` : 'Utiliser le tableau de variations de la fonction sur l’intervalle.',
        ok: () => { for (let t = 0; t <= 400; t++) { const x = a + ((b - a) * t) / 400, y = f(x); if (y > mx + 1e-9 || y < mn - 1e-9) return false; } return where(mx).every((x) => near(f(x), mx)) && where(mn).every((x) => near(f(x), mn)); } };
    } },

  // ---------------- 11 Deux variables qualitatives ----------------
  { id: 's-two-way-complete', cls: C, chapter: 'seconde-11', domain: 'stats-proba', skill: 'Compléter un tableau croisé', fast: false,
    make(r, level) {
      const [who, rows, cols] = r.pick(POP);
      if (level === 1) {
        const a = r.int(10, 90), b = r.int(10, 90), c = r.int(10, 90), d = r.int(10, 90), cell = r.pick(['a', 'b', 'c', 'd']);
        const v = { a, b, c, d }[cell], hide = [cell, r.pick(['c0', 'c1', 'N'])];
        return { q: `Tableau croisé de ${a + b + c + d} ${who} (certaines cases sont effacées) : ${M(tableTex(rows, cols, a, b, c, d, hide))} Retrouver l’effectif de la case « ${cap(rows[cell === 'a' || cell === 'b' ? 0 : 1])}, ${cols[cell === 'a' || cell === 'c' ? 0 : 1]} ».`,
          a: `${M(v)} : on le retrouve par différence, à partir du total de la ligne ou de la colonne.`, ok: () => v === { a, b, c, d }[cell] && a + b + c + d > 0 };
      }
      const nA = 10 * r.int(4, 40), nB = 10 * r.int(4, 40), p = 5 * r.int(1, 19), q = 5 * r.int(1, 19);
      if ((nA * p) % 100 || (nB * q) % 100) return this.make(r, level);
      const a = (nA * p) / 100, c = (nB * q) / 100, b = nA - a, d = nB - c, N = nA + nB;
      if (level === 2) return { q: `Parmi ${M(N)} ${who}, on compte ${M(nA)} ${rows[0]} et ${M(nB)} ${rows[1]}. ${cap(`${M(`${p}\\,\\%`)}`)} des ${rows[0]} et ${M(`${q}\\,\\%`)} des ${rows[1]} sont des ${cols[0]}. Compléter le tableau croisé.`,
        a: M(tableTex(rows, cols, a, b, c, d)), s: `${M(`${numTex(F(p, 100))}\\times ${nA}=${a}`)} et ${M(`${numTex(F(q, 100))}\\times ${nB}=${c}`)}.`, ok: () => a + b === nA && c + d === nB && a * 100 === p * nA };
      return { q: `Parmi ${M(N)} ${who}, on compte ${M(nA)} ${rows[0]} et ${M(nB)} ${rows[1]}. ${cap(`${M(`${p}\\,\\%`)}`)} des ${rows[0]} et ${M(`${q}\\,\\%`)} des ${rows[1]} sont des ${cols[0]}. Parmi les ${cols[0]}, quelle est la fréquence des ${rows[0]} ?`,
        a: `Il y a ${M(`${a}+${c}=${a + c}`)} ${cols[0]}, dont ${M(a)} ${rows[0]} : ${M(a + c ? freqTex(a, a + c) : '0')}.`, s: 'Le dénominateur est l’effectif de la population introduite par « parmi ».',
        ok: () => a + c > 0 && near(a / (a + c), (nA * p) / (nA * p + nB * q)) };
    } },
  { id: 's-cond-inverse', cls: C, chapter: 'seconde-11', domain: 'stats-proba', skill: 'Fréquences conditionnelles : ne pas inverser', fast: false,
    make(r, level) {
      const [who, rows, cols] = r.pick(POP), a = r.int(10, 95), b = r.int(10, 95), c = r.int(10, 95), d = r.int(10, 95), N = a + b + c + d;
      const i = r.int(0, 1), j = r.int(0, 1), cell = [[a, b], [c, d]][i][j], rowT = i ? c + d : a + b, colT = j ? b + d : a + c;
      const intro = `Tableau croisé de ${N} ${who} : ${M(tableTex(rows, cols, a, b, c, d))}`;
      if (level === 1) return { q: `${intro} Parmi les ${rows[i]}, quelle est la fréquence des ${cols[j]} ?`, a: M(freqTex(cell, rowT)), ok: () => cell <= rowT };
      if (level === 2) return { q: `${intro} Calculer la fréquence des ${cols[j]} parmi les ${rows[i]}, puis celle des ${rows[i]} parmi les ${cols[j]}.`, a: `${M(freqTex(cell, rowT))} ; ${M(freqTex(cell, colT))}. Les deux fréquences n’ont pas le même dénominateur.`, ok: () => rowT !== colT || cell * 1 === cell };
      const claim = 2 * cell > colT;
      return { q: `${intro} Vrai ou faux : « La majorité des ${cols[j]} sont des ${rows[i]} » ? Justifier.`, a: `${claim ? 'Vrai' : 'Faux'} : parmi les ${cols[j]}, la fréquence des ${rows[i]} est ${M(freqTex(cell, colT))}${claim ? ', plus de la moitié' : ', pas plus de la moitié'}.`, s: `Attention : il s’agit de la fréquence parmi les ${cols[j]}, pas parmi les ${rows[i]}.`,
        ok: () => claim === cell / colT > 0.5 };
    } },
  { id: 's-freq-tree', cls: C, chapter: 'seconde-11', domain: 'stats-proba', skill: 'Fréquences en pourcentage : marginales et conditionnelles', fast: true,
    make(r, level) {
      const [who, rows, cols] = r.pick(POP), fA = 5 * r.int(2, 18), fBA = 5 * r.int(1, 19), fBnA = 5 * r.int(1, 19);
      const AB = F(fA * fBA, 100), B = add(AB, F((100 - fA) * fBnA, 100));
      const given = `Parmi les ${who}, ${M(`${fA}\\,\\%`)} sont des ${rows[0]} (les autres sont des ${rows[1]}). ${cap(`${M(`${fBA}\\,\\%`)}`)} des ${rows[0]} et ${M(`${fBnA}\\,\\%`)} des ${rows[1]} sont des ${cols[0]}.`;
      if (level === 1) return { q: `${given} Quel pourcentage de l’ensemble représentent les ${rows[0]} qui sont des ${cols[0]} ?`, a: M(`${numTex(F(fA, 100))}\\times ${numTex(F(fBA, 100))}=${numTex(div(AB, F(100)))}`) + `, soit ${M(pc(AB))}.`, ok: () => near(val(AB), (fA * fBA) / 100) };
      if (level === 2) return { q: `${given} Quel pourcentage de l’ensemble représentent les ${cols[0]} ?`, a: `${M(`${pc(AB)}+${numTex(F(100 - fA, 100))}\\times ${fBnA}\\,\\%=${pc(B)}`)}.`, ok: () => near(val(B), (fA * fBA + (100 - fA) * fBnA) / 100) };
      const fr = div(AB, B), frp = mul(fr, F(100));
      return { q: `${given} Parmi les ${cols[0]}, quel est le pourcentage de ${rows[0]} (arrondi à 0,1 %) ?`, a: `${M(`\\dfrac{${pc(AB)}}{${pc(B)}}${dec(frp, 1)}\\,\\%`)}.`, s: 'On divise la part des deux caractères à la fois par la part des ' + cols[0] + '.',
        ok: () => near(val(frp), (100 * fA * fBA) / (fA * fBA + (100 - fA) * fBnA)) };
    } },

  // ---------------- 12 Géométrie repérée : synthèse ----------------
  { id: 's-parallelogram-check', cls: C, chapter: 'seconde-12', domain: 'geometrie', skill: 'Reconnaître un parallélogramme, un rectangle, un losange', fast: false,
    make(r, level) {
      const A = [r.int(-6, 4), r.int(-6, 4)];
      if (level < 3) {
        let u, w; do { u = [r.int(-5, 5), r.int(-5, 5)]; w = [r.int(-5, 5), r.int(-5, 5)]; } while (u[0] * w[1] - u[1] * w[0] === 0);
        const yes = r.next() < 0.5, B = [A[0] + u[0], A[1] + u[1]], D = [A[0] + w[0], A[1] + w[1]], Cc = [B[0] + w[0] + (yes ? 0 : r.pick([-1, 1])), B[1] + w[1]];
        const isP = Cc[0] - D[0] === u[0] && Cc[1] - D[1] === u[1];
        const q = `Le quadrilatère ${M('ABCD')} avec ${M(`A${pt(...A)}`)}, ${M(`B${pt(...B)}`)}, ${M(`C${pt(...Cc)}`)} et ${M(`D${pt(...D)}`)} est-il un parallélogramme ?`;
        if (level === 1) return { q: `${q} Utiliser des vecteurs.`, a: `${M(`\\overrightarrow{AB}${vc(...u)}`)} et ${M(`\\overrightarrow{DC}${vc(Cc[0] - D[0], Cc[1] - D[1])}`)} : ${isP ? 'ils sont égaux, ABCD est un parallélogramme.' : 'ils sont différents, ABCD n’est pas un parallélogramme.'}`, ok: () => isP === yes };
        const I = [F(A[0] + Cc[0], 2), F(A[1] + Cc[1], 2)], J = [F(B[0] + D[0], 2), F(B[1] + D[1], 2)];
        return { q: `${q} Utiliser les milieux des diagonales.`, a: `Milieu de ${M('[AC]')} : ${M(`(${numTex(I[0])}\\,;\\,${numTex(I[1])})`)} ; milieu de ${M('[BD]')} : ${M(`(${numTex(J[0])}\\,;\\,${numTex(J[1])})`)}. ${isP ? 'Les diagonales ont le même milieu : c’est un parallélogramme.' : 'Les milieux sont différents : ce n’est pas un parallélogramme.'}`, ok: () => isP === (eq(I[0], J[0]) && eq(I[1], J[1])) };
      }
      let u, w, kind;
      do { u = [r.int(-4, 4), r.int(-4, 4)]; kind = r.pick(['rect', 'losange', 'carre', 'quel']); w = kind === 'carre' ? [-u[1], u[0]] : kind === 'rect' ? [-2 * u[1], 2 * u[0]] : kind === 'losange' ? [u[1], u[0]] : [r.int(-5, 5), r.int(-5, 5)]; } while ((!u[0] && !u[1]) || u[0] * w[1] - u[1] * w[0] === 0);
      const B = [A[0] + u[0], A[1] + u[1]], D = [A[0] + w[0], A[1] + w[1]], Cc = [B[0] + w[0], B[1] + w[1]];
      const d2 = (P, Q) => (P[0] - Q[0]) ** 2 + (P[1] - Q[1]) ** 2, ac = d2(A, Cc), bd = d2(B, D), ab = d2(A, B), ad = d2(A, D);
      const rect = ac === bd, los = ab === ad, nat = rect && los ? 'un carré' : rect ? 'un rectangle (non carré)' : los ? 'un losange (non carré)' : 'un parallélogramme quelconque';
      return { q: `On donne ${M(`A${pt(...A)}`)}, ${M(`B${pt(...B)}`)}, ${M(`C${pt(...Cc)}`)} et ${M(`D${pt(...D)}`)} dans un repère orthonormé ; ${M('ABCD')} est un parallélogramme. Est-ce un rectangle, un losange, un carré ?`,
        a: `${M(`AC^{2}=${ac}`)}, ${M(`BD^{2}=${bd}`)} (diagonales ${rect ? 'de même longueur' : 'de longueurs différentes'}) ; ${M(`AB^{2}=${ab}`)}, ${M(`AD^{2}=${ad}`)} (côtés consécutifs ${los ? 'égaux' : 'différents'}) : ${M('ABCD')} est ${nat}.`,
        ok: () => rect === (u[0] * w[0] + u[1] * w[1] === 0) && los === (u[0] ** 2 + u[1] ** 2 === w[0] ** 2 + w[1] ** 2) };
    } },
  { id: 's-aligned-points', cls: C, chapter: 'seconde-12', domain: 'geometrie', skill: 'Alignement et parallélisme par le déterminant', fast: true,
    make(r, level) {
      const P = () => [r.int(-7, 7), r.int(-7, 7)];
      let A, B; do { A = P(); B = P(); } while (A[0] === B[0] && A[1] === B[1]);
      const u = [B[0] - A[0], B[1] - A[1]];
      if (level === 1) {
        const k = r.nz(-3, 3), yes = r.next() < 0.5, e0 = yes ? 0 : r.pick([-1, 1]), Cc = [A[0] + k * u[0] - e0 * u[1], A[1] + k * u[1] + e0 * u[0]], w = [Cc[0] - A[0], Cc[1] - A[1]], d = u[0] * w[1] - u[1] * w[0];
        return { q: `Les points ${M(`A${pt(...A)}`)}, ${M(`B${pt(...B)}`)} et ${M(`C${pt(...Cc)}`)} sont-ils alignés ?`, a: `${M(`\\det(\\overrightarrow{AB},\\overrightarrow{AC})=${u[0]}\\times ${par(w[1])}-${par(u[1])}\\times ${par(w[0])}=${d}`)} : ${d === 0 ? 'oui.' : 'non.'}`, ok: () => (d === 0) === yes };
      }
      if (level === 2) {
        if (u[0] === 0) return this.make(r, level);
        const x0 = r.int(-9, 9), y = add(F(A[1]), mul(F(u[1], u[0]), F(x0 - A[0])));
        return { q: `On donne ${M(`A${pt(...A)}`)} et ${M(`B${pt(...B)}`)}. Déterminer le réel ${M('y')} tel que ${M(`C(${x0}\\,;\\,y)`)} appartienne à la droite ${M('(AB)')}.`, a: `${M(`\\det(\\overrightarrow{AB},\\overrightarrow{AC})=${u[0] === 1 ? '' : u[0] === -1 ? '-' : u[0]}${A[1] === 0 ? 'y' : `(y${sgn(-A[1])})`}-${par(u[1])}\\times ${par(x0 - A[0])}=0`)} donne ${M(`y=${fracTex(y)}`)}.`,
          ok: () => eq(mul(F(u[0]), sub(y, F(A[1]))), F(u[1] * (x0 - A[0]))) };
      }
      const Cc = P(), k = r.pick([F(1), F(2), F(-1), F(1, 2), F(-2), F(3)]), yes = r.next() < 0.5;
      let w = [mul(k, F(u[0])), mul(k, F(u[1]))]; if (!yes) { const e0 = r.pick([-1, 1]); w = [add(w[0], F(-e0 * u[1])), add(w[1], F(e0 * u[0]))]; }
      if (w.some((z) => z.d !== 1)) return this.make(r, level);
      const D = [Cc[0] + w[0].n, Cc[1] + w[1].n], v = [D[0] - Cc[0], D[1] - Cc[1]], d = u[0] * v[1] - u[1] * v[0];
      if (!v[0] && !v[1]) return this.make(r, level);
      return { q: `Les droites ${M('(AB)')} et ${M('(CD)')} sont-elles parallèles, avec ${M(`A${pt(...A)}`)}, ${M(`B${pt(...B)}`)}, ${M(`C${pt(...Cc)}`)} et ${M(`D${pt(...D)}`)} ?`, a: `${M(`\\det(\\overrightarrow{AB},\\overrightarrow{CD})=${d}`)} : ${d === 0 ? 'oui, elles sont parallèles.' : 'non, elles sont sécantes.'}`, ok: () => (d === 0) === yes };
    } },
  { id: 's-parallel-through', cls: C, chapter: 'seconde-12', domain: 'geometrie', skill: 'Droite parallèle, intersection de deux droites', fast: false,
    make(r, level) {
      const P = () => [r.int(-7, 7), r.int(-7, 7)], Cc = P();
      if (level === 1) {
        const m = r.nz(-6, 6), q0 = r.int(-9, 9), p = Cc[1] - m * Cc[0];
        return { q: `Déterminer l’équation réduite de la droite passant par ${M(`C${pt(...Cc)}`)} et parallèle à ${M(`d:\\ y=${polyTex([m, q0])}`)}.`, a: M(`y=${polyTex([m, p])}`), s: `Même pente ${M(m)} ; ${M(`${Cc[1]}=${m}\\times ${par(Cc[0])}+p`)}.`, ok: () => m * Cc[0] + p === Cc[1] };
      }
      let A, B; do { A = P(); B = P(); } while (A[0] === B[0]);
      const m = F(B[1] - A[1], B[0] - A[0]);
      if (level === 2) { const p = sub(F(Cc[1]), mul(m, F(Cc[0])));
        return { q: `On donne ${M(`A${pt(...A)}`)}, ${M(`B${pt(...B)}`)} et ${M(`C${pt(...Cc)}`)}. Déterminer l’équation réduite de la parallèle à ${M('(AB)')} passant par ${M('C')}.`, a: M(`y=${affTex(m, p)}`), s: `Pente de ${M('(AB)')} : ${M(fracTex(m))}.`, ok: () => eq(add(mul(m, F(Cc[0])), p), F(Cc[1])) && eq(mul(m, F(B[0] - A[0])), F(B[1] - A[1])) }; }
      let D; do { D = P(); } while (D[0] === Cc[0]);
      const m2 = F(D[1] - Cc[1], D[0] - Cc[0]);
      if (eq(m, m2)) return this.make(r, level);
      const p1 = sub(F(A[1]), mul(m, F(A[0]))), p2 = sub(F(Cc[1]), mul(m2, F(Cc[0]))), x = div(sub(p2, p1), sub(m, m2)), y = add(mul(m, x), p1);
      return { q: `Déterminer les coordonnées du point d’intersection des droites ${M('(AB)')} et ${M('(CD)')}, avec ${M(`A${pt(...A)}`)}, ${M(`B${pt(...B)}`)}, ${M(`C${pt(...Cc)}`)} et ${M(`D${pt(...D)}`)}.`,
        a: `${M(`(AB):\\ y=${affTex(m, p1)}`)} et ${M(`(CD):\\ y=${affTex(m2, p2)}`)} ; intersection ${M(`\\left(${numTex(x)}\\,;\\,${numTex(y)}\\right)`)}.`,
        ok: () => eq(mul(sub(x, F(A[0])), F(B[1] - A[1])), mul(sub(y, F(A[1])), F(B[0] - A[0]))) && eq(mul(sub(x, F(Cc[0])), F(D[1] - Cc[1])), mul(sub(y, F(Cc[1])), F(D[0] - Cc[0]))) };
    } },

  // ---------------- 13 Raisonnement ----------------
  { id: 's-true-false', cls: C, chapter: 'seconde-13', domain: 'algebre', skill: 'Vrai ou faux justifié, contre-exemple', fast: false,
    make(r, level) {
      const a = r.int(2, 30), t = r.int(5, 60), k = r.int(2, 20);
      const fams = {
        1: [
          () => ({ s: `Pour tout réel ${M('x')}, ${M(`(x+${a})^{2}=x^{2}+${a * a}`)}.`, v: false, j: `Pour ${M('x=1')} : ${M(`(1+${a})^{2}=${(1 + a) ** 2}`)} mais ${M(`1+${a * a}=${1 + a * a}`)}.`, c: () => (1 + a) ** 2 !== 1 + a * a }),
          () => ({ s: `Si ${M(`x^{2}=${a * a}`)}, alors ${M(`x=${a}`)}.`, v: false, j: `Pour ${M(`x=-${a}`)} : ${M(`(-${a})^{2}=${a * a}`)} mais ${M(`-${a}\\neq ${a}`)}.`, c: () => (-a) ** 2 === a * a }),
          () => ({ s: `Pour tout réel ${M('x')} positif, ${M('x^{2}\\geqslant x')}.`.replace('positif', k % 2 ? 'positif' : 'strictement positif'), v: false, j: `Pour ${M(`x=\\dfrac{1}{${k}}`)} : ${M(`x^{2}=\\dfrac{1}{${k * k}}<\\dfrac{1}{${k}}`)}.`, c: () => (1 / k) ** 2 < 1 / k }),
          () => ({ s: `Pour tout réel ${M('x')}, ${M('\\sqrt{x^{2}}=x')}. (On teste ${M(`x=-${a}`)}.)`, v: false, j: `Pour ${M(`x=-${a}`)} : ${M(`\\sqrt{(-${a})^{2}}=${a}\\neq -${a}`)} ; en fait ${M('\\sqrt{x^{2}}=|x|')}.`, c: () => Math.sqrt(a * a) !== -a }),
          () => ({ s: `Une hausse de ${M(`${t}\\,\\%`)} suivie d’une baisse de ${M(`${t}\\,\\%`)} ramène au prix initial.`, v: false, j: `${M(`CM=${numTex(F(100 + t, 100))}\\times ${numTex(F(100 - t, 100))}=${numTex(F((100 + t) * (100 - t), 10000))}\\neq 1`)} : le prix baisse globalement.`, c: () => (1 + t / 100) * (1 - t / 100) < 1 }),
        ],
        2: [
          () => ({ s: `Pour tout réel ${M('x')}, si ${M(`x<${a}`)} alors ${M(`x^{2}<${a * a}`)}.`, v: false, j: `Pour ${M(`x=-${a + 1}`)} : ${M(`-${a + 1}<${a}`)} mais ${M(`(-${a + 1})^{2}=${(a + 1) ** 2}>${a * a}`)}.`, c: () => -(a + 1) < a && (a + 1) ** 2 > a * a }),
          () => { const kk = r.int(0, 15); return { s: `Pour tout entier ${M('n')}, ${M(polyTex([1, 2 * kk + 1, 0], 'n'))} est pair.`, v: true, j: `${M(`${polyTex([1, 2 * kk + 1, 0], 'n')}=n(n+${2 * kk + 1})`)} : comme ${M(2 * kk + 1)} est impair, ${M('n')} et ${M(`n+${2 * kk + 1}`)} n’ont pas la même parité, l’un des deux est pair, donc le produit est pair.`, c: () => [...Array(21).keys()].every((n) => (n * n + (2 * kk + 1) * n) % 2 === 0) }; },
          () => { const p = r.int(2, 12), q = r.int(1, 15), val0 = (n) => p * n + q, always = p % 2 === 0 && q % 2 === 1, n0 = p % 2 ? (q % 2 ? 1 : 0) : 0; return { s: `Pour tout entier ${M('n')}, ${M(polyTex([p, q], 'n'))} est impair.`, v: always, j: always ? `${M(`${p}n`)} est pair car ${M(p)} est pair, et ${M(q)} est impair : la somme est impaire.` : `Pour ${M(`n=${n0}`)} : ${M(`${polyTex([p, q], 'n').replace('n', `\\times ${n0}`)}=${val0(n0)}`)} est pair.`, c: () => (always ? [...Array(20).keys()].every((n) => val0(n) % 2 === 1) : val0(n0) % 2 === 0) }; },
          () => { const lo = r.int(-6, 4); let hi; do { hi = lo + r.int(1, 7); } while (hi === -lo); const posLo = lo >= 0; return { s: `Pour tout réel ${M('x')}, si ${M(`${lo}<x<${hi}`)} alors ${M(`${lo * lo}<x^{2}<${hi * hi}`)}.`, v: posLo, j: posLo ? `La fonction carré est strictement croissante sur ${M('[0\\,;\\,+\\infty[')} et ${M(`0\\leqslant ${lo}<x<${hi}`)}.` : `Pour ${M('x=0')} : ${M(`${lo}<0<${hi}`)} mais ${M('0^{2}=0')} n’est pas strictement supérieur à ${M(lo * lo)}${lo === 0 ? '' : ''}.`, c: () => (posLo ? [...Array(50).keys()].map((i) => lo + ((hi - lo) * (i + 0.5)) / 50).every((x) => lo * lo < x * x && x * x < hi * hi) : !(lo * lo < 0)) }; },
        ],
        3: [
          () => ({ s: `Pour tout réel ${M('x')} non nul, ${M(`x+\\dfrac{${a * a}}{x}\\geqslant ${2 * a}`)}.`, v: false, j: `Pour ${M(`x=-${a}`)} : ${M(`-${a}+\\dfrac{${a * a}}{-${a}}=-${2 * a}<${2 * a}`)}. (L’inégalité est vraie pour ${M('x>0')}.)`, c: () => -a + (a * a) / -a < 2 * a }),
          () => { const q = r.int(1, 12); return { s: `Pour tout entier ${M('n')}, ${M(`n(n+${2 * q})+${q * q}`)} est le carré d’un entier.`, v: true, j: `${M(`n(n+${2 * q})+${q * q}=n^{2}+${2 * q}n+${q * q}=(n+${q})^{2}`)}, carré de l’entier ${M(`n+${q}`)}.`, c: () => [...Array(30).keys()].every((n) => Number.isInteger(Math.sqrt(n * (n + 2 * q) + q * q))) }; },
          () => { const sq = r.next() < 0.5; return { s: `Pour tout réel ${M('x')}, ${M(sq ? `(x-${a})^{2}=x^{2}-${a * a}` : `(x-${a})(x+${a})=x^{2}-${a * a}`)}.`, v: !sq, j: sq ? `Pour ${M('x=0')} : ${M(`(-${a})^{2}=${a * a}`)} mais ${M(`0-${a * a}=-${a * a}`)}.` : `C’est l’identité ${M('(x-a)(x+a)=x^{2}-a^{2}')} : en développant, ${M(`x^{2}+${a}x-${a}x-${a * a}=x^{2}-${a * a}`)}.`, c: () => (sq ? a * a !== -a * a : [-3, 0, 2, 7].every((x) => (x - a) * (x + a) === x * x - a * a)) }; },
          () => { const pos = r.next() < 0.5, b0 = F(r.int(1, 40), r.pick([1, 2, 10])); return { s: `Pour tout réel ${M('x')}, si ${M(`${pos ? '0<' : ''}x<${numTex(b0)}`)} alors ${M(`\\dfrac{1}{x}>\\dfrac{1}{${numTex(b0)}}`)}.`, v: pos, j: pos ? `La fonction inverse est strictement décroissante sur ${M(']0\\,;\\,+\\infty[')}.` : `Pour ${M('x=-1')} : ${M(`-1<${numTex(b0)}`)} mais ${M('\\dfrac{1}{-1}=-1')} n’est pas supérieur à ${M(`\\dfrac{1}{${numTex(b0)}}>0`)}.`, c: () => (pos ? [0.01, 0.3, 0.99].every((s) => 1 / (s * val(b0)) > 1 / val(b0)) : -1 < 1 / val(b0)) }; },
        ],
      };
      const x = r.pick(fams[level])();
      return { q: `Vrai ou faux ? Justifier. « ${x.s} »`, a: `${x.v ? 'Vrai' : 'Faux'}. ${x.v ? x.j : `Contre-exemple : ${x.j.replace(/^Pour/, 'pour')}`}`, s: x.v ? '' : 'Un seul contre-exemple suffit à montrer qu’une affirmation universelle est fausse.', ok: () => x.c() };
    } },
  { id: 's-converse', cls: C, chapter: 'seconde-13', domain: 'algebre', skill: 'Implication et réciproque', fast: false,
    make(r, level) {
      let P, Q, j1, j2, c;
      const pick = level === 1 ? r.pick(['mult', 'sq']) : level === 2 ? r.pick(['iv', 'gt']) : r.pick(['sqlt', 'abs', 'mult']);
      if (pick === 'mult') { const a = r.int(2, 12), b = r.int(2, 12); P = `${M('n')} est un multiple de ${M(a * b)}`; Q = `${M('n')} est un multiple de ${M(a)}`; j1 = `si ${M(`n=${a * b}k`)}, alors ${M(`n=${a}\\times(${b}k)`)}`; j2 = `${M(a)} est un multiple de ${M(a)} mais pas de ${M(a * b)}`; c = () => a % (a * b) !== 0 && (a * b * 7) % a === 0; }
      else if (pick === 'sq') { const a = r.int(1, 40); P = M(`x=${a}`); Q = M(`x^{2}=${a * a}`); j1 = `on élève au carré`; j2 = `${M(`x=-${a}`)} vérifie ${M(`x^{2}=${a * a}`)} mais pas ${M(`x=${a}`)}`; c = () => (-a) ** 2 === a * a; }
      else if (pick === 'iv') { const cc = r.int(-9, 0), d = cc + r.int(4, 12), a = r.int(cc + 1, d - 3), b = r.int(a + 1, d - 1); P = M(`x\\in[${a}\\,;\\,${b}]`); Q = M(`x\\in[${cc}\\,;\\,${d}]`); j1 = `${M(`[${a}\\,;\\,${b}]\\subset[${cc}\\,;\\,${d}]`)}`; j2 = `${M(`x=${d}`)} appartient à ${M(`[${cc}\\,;\\,${d}]`)} mais pas à ${M(`[${a}\\,;\\,${b}]`)}`; c = () => cc <= a && b <= d && d > b; }
      else if (pick === 'gt') { const b = r.int(-9, 9), a = b + r.int(2, 9), m = (a + b) / 2; P = M(`x>${a}`); Q = M(`x>${b}`); j1 = `${M(`x>${a}`)} et ${M(`${a}>${b}`)} donnent ${M(`x>${b}`)}`; j2 = `${M(`x=${numTex(F(a + b, 2))}`)} vérifie ${M(`x>${b}`)} mais pas ${M(`x>${a}`)}`; c = () => m > b && !(m > a); }
      else if (pick === 'abs') { const a = r.int(1, 40); P = M(`|x|<${a}`); Q = M(`x<${a}`); j1 = `${M(`|x|<${a}`)} équivaut à ${M(`-${a}<x<${a}`)}, donc ${M(`x<${a}`)}`; j2 = `${M(`x=-${a + 1}`)} vérifie ${M(`x<${a}`)} mais ${M(`|x|=${a + 1}`)}`; c = () => -(a + 1) < a && Math.abs(-(a + 1)) >= a; }
      else { const a = r.int(1, 40); P = M(`x^{2}<${a * a}`); Q = M(`x<${a}`); j1 = `${M(`x^{2}<${a * a}`)} équivaut à ${M(`-${a}<x<${a}`)}, donc ${M(`x<${a}`)}`; j2 = `${M(`x=-${a + 1}`)} vérifie ${M(`x<${a}`)} mais ${M(`x^{2}=${(a + 1) ** 2}\\geqslant ${a * a}`)}`; c = () => -(a + 1) < a && (a + 1) ** 2 >= a * a; }
      return { q: `On considère la proposition « Si ${P}, alors ${Q} ». Est-elle vraie ? Énoncer sa réciproque. Est-elle vraie ?`,
        a: `La proposition est vraie : ${j1}. Réciproque : « Si ${Q}, alors ${P} ». Elle est fausse : ${j2}.`, s: 'La réciproque d’une implication vraie n’est pas toujours vraie.', ok: c };
    } },
  { id: 's-parity-expr', cls: C, chapter: 'seconde-13', domain: 'nombres', skill: 'Parité d’une expression, disjonction de cas', fast: false,
    make(r, level) {
      let poly;
      if (level === 1) poly = [r.int(1, 12), r.int(-15, 15)];
      else if (level === 2) poly = [r.int(1, 5), r.int(-9, 9), r.int(-15, 15)];
      else { const a = r.int(-9, 9), b = r.int(-9, 9), c = r.int(-9, 9); poly = [1, a + b, a * b + c]; poly.form = `(n${a === 0 ? '' : sgn(a)})(n${b === 0 ? '' : sgn(b)})${c === 0 ? '' : sgn(c)}`; }
      const e = poly.form || polyTex(poly, 'n'), par0 = ((evalPoly(poly, 0) % 2) + 2) % 2, par1 = ((evalPoly(poly, 1) % 2) + 2) % 2, w = (p) => (p ? 'impair' : 'pair');
      const verdict = par0 === par1 ? `Dans les deux cas, ${M('E(n)')} est ${w(par0)} : il est toujours ${w(par0)}.` : `La parité de ${M('E(n)')} dépend de celle de ${M('n')}.`;
      return { q: `Pour un entier ${M('n')}, on pose ${M(`E(n)=${e}`)}. Étudier la parité de ${M('E(n)')} selon la parité de ${M('n')}.`,
        a: `Si ${M('n=2k')} est pair, ${M('E(n)')} est ${w(par0)} ; si ${M('n=2k+1')} est impair, ${M('E(n)')} est ${w(par1)}. ${verdict}`, s: 'On remplace n par 2k puis par 2k + 1 et on développe ; on peut contrôler avec n = 0 et n = 1.',
        ok: () => [...Array(13).keys()].map((i) => i - 6).every((n) => ((evalPoly(poly, n) % 2) + 2) % 2 === (Math.abs(n) % 2 ? par1 : par0)) };
    } },
  { id: 's-percent-equation', cls: C, chapter: 'seconde-13', domain: 'algebre', skill: 'Croiser pourcentages et équations', fast: true,
    make(r, level) {
      if (level === 1) {
        const t = r.pick([-1, 1]) * r.pick([5, 10, 15, 20, 25, 30, 40, 50]), x0 = 5 * r.int(2, 80), cm = F(100 + t, 100), R = mul(cm, F(x0));
        return { q: `Résoudre l’équation ${M(`${numTex(cm)}x=${numTex(R)}`)} et interpréter si ${M('x')} est un prix avant ${t > 0 ? 'une hausse' : 'une baisse'} de ${M(`${Math.abs(t)}\\,\\%`)}.`, a: `${M(`x=\\dfrac{${numTex(R)}}{${numTex(cm)}}=${x0}`)} : le prix initial était ${M(`${x0}\\ \\text{€}`)}.`, ok: () => near(val(R) / val(cm), x0) };
      }
      if (level === 2) {
        const t = r.pick([5, 10, 15, 20, 25, 30, 40]), P = 10 * r.int(3, 60), d = r.int(2, 30), R = sub(mul(F(P), F(100 + t, 100)), F(d));
        return { q: `Un prix augmente de ${M(`${t}\\,\\%`)}, puis on applique une réduction de ${M(`${d}\\ \\text{€}`)}. Le prix final est ${M(`${numTex(R)}\\ \\text{€}`)}. Quel était le prix initial ?`, a: `${M(`${numTex(F(100 + t, 100))}x-${d}=${numTex(R)}\\iff x=\\dfrac{${numTex(add(R, F(d)))}}{${numTex(F(100 + t, 100))}}=${P}`)} : ${M(`${P}\\ \\text{€}`)}.`, ok: () => near(P * (1 + t / 100) - d, val(R)) };
      }
      const t = r.pick([5, 8, 10, 12, 15, 20, 25, 30]), d = r.int(3, 60), th = F(100 * d, t);
      return { q: `Un magasin propose, sur un article de prix ${M('x')} euros, soit une remise de ${M(`${t}\\,\\%`)} (offre A), soit une remise de ${M(`${d}\\ \\text{€}`)} (offre B). Pour quels prix l’offre A est-elle la plus avantageuse ?`,
        a: `${M(`${numTex(F(100 - t, 100))}x<x-${d}\\iff ${d}<${numTex(F(t, 100))}x\\iff x>${numTex(th)}`)} : l’offre A est plus avantageuse pour un prix supérieur à ${M(`${decimals(th) >= 0 ? numTex(th) : `${fracTex(th)}\\approx ${roundTex(val(th), 2)}`}\\ \\text{€}`)}.`,
        ok: () => { const x1 = val(th) + 1, x2 = val(th) - 1; return x1 * (1 - t / 100) < x1 - d && !(x2 * (1 - t / 100) < x2 - d); } };
    } },

  // ---------------- 14 Probabilités ----------------
  { id: 's-proba-equiprob', cls: C, chapter: 'seconde-14', domain: 'stats-proba', skill: 'Probabilités en situation d’équiprobabilité', fast: true,
    make(r, level) {
      if (level === 1) {
        const n = [r.int(1, 12), r.int(1, 12), r.int(0, 12)], cols = ['rouges', 'vertes', 'bleues'], N = n[0] + n[1] + n[2], i = r.int(0, n[2] ? 2 : 1), p = F(n[i], N);
        return { q: `Une urne contient ${M(n[0])} boules rouges, ${M(n[1])} boules vertes${n[2] ? ` et ${M(n[2])} boules bleues` : ''}, indiscernables au toucher. On tire une boule au hasard. Calculer la probabilité qu’elle soit ${cols[i].slice(0, -1)}, puis qu’elle ne le soit pas.`,
          a: M(`P=\\dfrac{${n[i]}}{${N}}${p.d === N ? '' : `=${fracTex(p)}`}\\ ;\\ P(\\overline{A})=1-${fracTex(p)}=${fracTex(sub(F(1), p))}`), ok: () => near(val(p) + val(sub(F(1), p)), 1) && near(val(p), n[i] / N) };
      }
      if (level === 2) {
        const f = r.pick([4, 6, 8, 10]), kind = r.pick(['eq', 'ge', 'le', 'double']), s = kind === 'double' ? 0 : kind === 'eq' ? r.int(2, 2 * f) : r.int(3, 2 * f - 1);
        let cnt = 0; for (let x = 1; x <= f; x++) for (let y = 1; y <= f; y++) { const t = x + y; if (kind === 'eq' ? t === s : kind === 'ge' ? t >= s : kind === 'le' ? t <= s : x === y) cnt++; }
        const p = F(cnt, f * f), ev = kind === 'eq' ? `la somme vaut ${M(s)}` : kind === 'ge' ? `la somme est supérieure ou égale à ${M(s)}` : kind === 'le' ? `la somme est inférieure ou égale à ${M(s)}` : 'les deux dés donnent le même nombre';
        return { q: `On lance deux dés équilibrés à ${M(f)} faces numérotées de ${M(1)} à ${M(f)}. Calculer la probabilité de l’événement « ${ev} ».`, a: M(`P=\\dfrac{${cnt}}{${f * f}}${p.d === f * f || cnt === 0 ? '' : `=${fracTex(p)}`}`), s: `Il y a ${M(`${f}\\times ${f}=${f * f}`)} issues équiprobables (un tableau à double entrée aide à compter).`,
          ok: () => { let c2 = 0; for (let k = 0; k < f * f; k++) { const x = (k % f) + 1, y = Math.floor(k / f) + 1, t = x + y; c2 += (kind === 'eq' ? t === s : kind === 'ge' ? t >= s : kind === 'le' ? t <= s : x === y) ? 1 : 0; } return c2 === cnt; } };
      }
      let pa, pb, pab; do { pa = r.int(10, 80); pb = r.int(10, 80); pab = r.int(0, Math.min(pa, pb)); } while (pa + pb - pab > 100);
      const u = F(pa + pb - pab, 100), T = (x) => numTex(F(x, 100));
      if (r.next() < 0.5) return { q: `${M('A')} et ${M('B')} sont deux événements avec ${M(`P(A)=${T(pa)}`)}, ${M(`P(B)=${T(pb)}`)} et ${M(`P(A\\cap B)=${T(pab)}`)}. Calculer ${M('P(A\\cup B)')}.`, a: M(`P(A\\cup B)=${T(pa)}+${T(pb)}-${T(pab)}=${numTex(u)}`), ok: () => near(val(u), (pa + pb - pab) / 100) };
      return { q: `${M('A')} et ${M('B')} sont deux événements avec ${M(`P(A)=${T(pa)}`)}, ${M(`P(B)=${T(pb)}`)} et ${M(`P(A\\cup B)=${numTex(u)}`)}. Calculer ${M('P(A\\cap B)')}. Les événements sont-ils incompatibles ?`, a: `${M(`P(A\\cap B)=${T(pa)}+${T(pb)}-${numTex(u)}=${T(pab)}`)} : ${pab === 0 ? 'oui, ils sont incompatibles.' : 'non, ils ne sont pas incompatibles.'}`, ok: () => near(pa / 100 + pb / 100 - val(u), pab / 100) };
    } },
  { id: 's-proba-table', cls: C, chapter: 'seconde-14', domain: 'stats-proba', skill: 'Probabilités à partir d’un tableau croisé', fast: false,
    make(r, level) {
      const [who, rows, cols] = r.pick(POP), a = r.int(5, 90), b = r.int(5, 90), c = r.int(5, 90), d = r.int(5, 90), N = a + b + c + d;
      const intro = `On choisit au hasard un individu parmi les ${N} ${who} du tableau : ${M(tableTex(rows, cols, a, b, c, d))} On note ${M('A')} : « être parmi les ${rows[0]} » et ${M('B')} : « être parmi les ${cols[0]} ».`;
      const fr = (n, m) => { const f = F(n, m); return `\\dfrac{${n}}{${m}}${f.d === m ? '' : `=${fracTex(f)}`}`; };
      if (level === 1) return { q: `${intro} Calculer ${M('P(A\\cap B)')} et ${M('P(A\\cup B)')}.`, a: M(`P(A\\cap B)=${fr(a, N)}\\ ;\\ P(A\\cup B)=${fr(a + b + c, N)}`), s: M('P(A\\cup B)=P(A)+P(B)-P(A\\cap B)'), ok: () => (a + b) + (a + c) - a === a + b + c };
      if (level === 2) return { q: `${intro} Calculer ${M('P_A(B)')}.`, a: M(`P_A(B)=\\dfrac{P(A\\cap B)}{P(A)}=${fr(a, a + b)}`), s: 'On se restreint à la ligne de A.', ok: () => near((a / N) / ((a + b) / N), a / (a + b)) };
      return { q: `${intro} Calculer ${M('P_A(B)')} et ${M('P_B(A)')}. Sont-elles égales ?`, a: `${M(`P_A(B)=${fr(a, a + b)}`)} et ${M(`P_B(A)=${fr(a, a + c)}`)} : ${b === c ? 'elles sont égales ici, car les effectifs de A et de B sont égaux.' : 'elles sont différentes, car les effectifs de A et de B diffèrent.'}`, ok: () => (b === c) === eq(F(a, a + b), F(a, a + c)) };
    } },
  { id: 's-proba-inverse', cls: C, chapter: 'seconde-14', domain: 'stats-proba', skill: 'Arbre pondéré : compléter, probabilité totale, inverser', fast: false,
    make(r, level) {
      const pa = r.int(1, 19) * 5, pba = r.int(1, 19) * 5, pbn = r.int(1, 19) * 5, T = (x) => numTex(F(x, 100));
      const given = `On donne ${M(`P(A)=${T(pa)}`)}, ${M(`P_A(B)=${T(pba)}`)} et ${M(`P_{\\overline{A}}(B)=${T(pbn)}`)}.`;
      if (level === 1) return { q: `${given} Compléter l’arbre : donner ${M('P(\\overline{A})')}, ${M('P_A(\\overline{B})')} et ${M('P_{\\overline{A}}(\\overline{B})')}.`, a: M(`P(\\overline{A})=${T(100 - pa)},\\ P_A(\\overline{B})=${T(100 - pba)},\\ P_{\\overline{A}}(\\overline{B})=${T(100 - pbn)}`), s: 'La somme des probabilités des branches issues d’un même nœud vaut 1.', ok: () => pa + (100 - pa) === 100 && pba + (100 - pba) === 100 };
      const ab = F(pa * pba, 10000), nb = F((100 - pa) * pbn, 10000), pb = add(ab, nb);
      if (level === 2) { const nn = F((100 - pa) * (100 - pbn), 10000);
        return { q: `${given} Calculer ${M('P(\\overline{A}\\cap\\overline{B})')} puis ${M('P(B)')}.`, a: M(`P(\\overline{A}\\cap\\overline{B})=${T(100 - pa)}\\times ${T(100 - pbn)}=${numTex(nn)}\\ ;\\ P(B)=${T(pa)}\\times ${T(pba)}+${T(100 - pa)}\\times ${T(pbn)}=${numTex(pb)}`), ok: () => near(val(pb), (pa * pba + (100 - pa) * pbn) / 10000) && near(val(nn), (1 - pa / 100) * (1 - pbn / 100)) }; }
      const inv = div(ab, pb);
      return { q: `${given} Calculer ${M('P_B(A)')} (arrondir au millième si nécessaire).`, a: M(`P_B(A)=\\dfrac{P(A\\cap B)}{P(B)}=\\dfrac{${numTex(ab)}}{${numTex(pb)}}${dec(inv, 3)}`), s: 'On calcule d’abord P(B) par la formule des probabilités totales.', ok: () => near(val(inv), (pa * pba) / (pa * pba + (100 - pa) * pbn)) };
    } },

  // ---------------- 15 Consolidation et transition ----------------
  { id: 's-rate-of-change', cls: C, chapter: 'seconde-15', domain: 'fonctions', skill: 'Taux de variation entre deux valeurs', fast: true,
    make(r, level) {
      const u = r.int(-6, 6); let v; do { v = r.int(-6, 8); } while (v === u);
      if (level === 1) return { q: `Soit ${M('f(x)=x^{2}')}. Calculer le taux de variation ${M(`\\dfrac{f(${v})-f(${u})}{${v}-${par(u)}}`)}.`, a: M(`\\dfrac{${v * v}-${par(u * u)}}{${v - u}}=${(v * v - u * u) / (v - u)}`), s: M('\\dfrac{b^{2}-a^{2}}{b-a}=a+b'), ok: () => (v * v - u * u) / (v - u) === u + v };
      const a = r.nz(-3, 3), b = r.int(-6, 6), c = r.int(-9, 9), p = [a, b, c];
      if (level === 2) {
        if (r.next() < 0.3 && u * v !== 0) { const k = r.nz(-12, 12), t = F(-k, u * v); return { q: `Soit ${M(`f(x)=\\dfrac{${k}}{x}`)}. Calculer le taux de variation de ${M('f')} entre ${M(u)} et ${M(v)}.`, a: M(`\\dfrac{f(${v})-f(${u})}{${v}-${par(u)}}=${fracTex(t)}`), ok: () => near((k / v - k / u) / (v - u), val(t)) }; }
        const t = (evalPoly(p, v) - evalPoly(p, u)) / (v - u);
        return { q: `Soit ${M(`f(x)=${polyTex(p)}`)}. Calculer le taux de variation de ${M('f')} entre ${M(u)} et ${M(v)}.`, a: M(`\\dfrac{${evalPoly(p, v)}-${par(evalPoly(p, u))}}{${v - u}}=${t}`), ok: () => t === a * (u + v) + b };
      }
      const x0 = r.int(-5, 5);
      return { q: `Soit ${M(`f(x)=${polyTex(p)}`)} et ${M('h\\neq 0')}. Exprimer ${M(`\\dfrac{f(${x0}+h)-f(${x0})}{h}`)} en fonction de ${M('h')}.`, a: M(polyTex([a, 2 * a * x0 + b], 'h')), s: `Développer ${M(`f(${x0}+h)`)} puis simplifier par ${M('h')} ; quand ${M('h')} devient très petit, ce taux se rapproche de ${M(2 * a * x0 + b)}.`,
        ok: () => [1, -2, 0.5, 3].every((h) => near((evalPoly(p, x0 + h) - evalPoly(p, x0)) / h, a * h + 2 * a * x0 + b)) };
    } },
  { id: 's-canonical-vertex', cls: C, chapter: 'seconde-15', domain: 'fonctions', skill: 'Forme canonique : sommet, variations, forme développée', fast: false,
    make(r, level) {
      const a = r.pick([-3, -2, -1, 1, 2, 3, 4, F(1, 2), F(-1, 2)]), A = typeof a === 'number' ? F(a) : a, al = r.int(-7, 7), be = r.int(-12, 12);
      const aT = A.d === 1 ? (A.n === 1 ? '' : A.n === -1 ? '-' : `${A.n}`) : fracTex(A), can = `${aT}(x${al === 0 ? '' : sgn(-al)})^{2}${be ? sgn(be) : ''}`;
      const up = A.n > 0;
      if (level === 1) return { q: `Soit ${M(`f(x)=${can}`)}. Donner les coordonnées du sommet de la parabole et dire si ${M('f')} admet un minimum ou un maximum.`, a: `Sommet ${M(`S(${al}\\,;\\,${be})`)} ; ${up ? `minimum ${M(be)}` : `maximum ${M(be)}`} atteint en ${M(`x=${al}`)}, car ${M(`a=${fracTex(A)}`)} est ${up ? 'positif' : 'négatif'}.`, ok: () => (up ? [al - 1, al + 2].every((x) => val(A) * (x - al) ** 2 + be > be) : [al - 1, al + 2].every((x) => val(A) * (x - al) ** 2 + be < be)) };
      const c1 = mul(A, F(-2 * al)), c0 = add(mul(A, F(al * al)), F(be));
      const dev = `${affTex(A, F(0)).replace('x', 'x^{2}')}${c1.n ? (c1.n < 0 ? '-' : '+') + affTex(F(Math.abs(c1.n), c1.d), F(0)) : ''}${c0.n ? (c0.n < 0 ? '-' : '+') + fracTex(F(Math.abs(c0.n), c0.d)) : ''}`;
      if (level === 2) return { q: `Développer et réduire ${M(`f(x)=${can}`)}.`, a: M(`f(x)=${dev}`), ok: () => [-2, 0, 1, 3].every((x) => near(val(A) * (x - al) ** 2 + be, val(A) * x * x + val(c1) * x + val(c0))) };
      return { q: `Écrire ${M(`f(x)=${dev}`)} sous forme canonique, puis en déduire ${up ? 'son minimum' : 'son maximum'}.`, a: `${M(`f(x)=${can}`)} ; ${up ? 'minimum' : 'maximum'} ${M(be)} atteint en ${M(al)}.`, s: A.n === 1 && A.d === 1 ? `${M(`x^{2}${al ? sgn(-2 * al) + 'x' : ''}`)} est le début du développement de ${M(`(x${al === 0 ? '' : sgn(-al)})^{2}`)}.` : `Mettre ${M(fracTex(A))} en facteur dans les termes en ${M('x')}, puis compléter le carré.`,
        ok: () => [-3, 0, 2, 5].every((x) => near(val(A) * (x - al) ** 2 + be, val(A) * x * x + val(c1) * x + val(c0))) };
    } },
  { id: 's-step-model', cls: C, chapter: 'seconde-15', domain: 'nombres', skill: 'Modéliser une évolution année après année', fast: true,
    make(r, level) {
      const u0 = 10 * r.int(5, 200);
      if (level === 1) { const d = r.nz(-40, 60), n = r.int(3, 12), un = u0 + n * d;
        return { q: `Une association compte ${M(u0)} adhérents en 2026 et ${d > 0 ? 'gagne' : 'perd'} ${M(Math.abs(d))} adhérents chaque année. Combien en comptera-t-elle en ${M(2026 + n)} ?`, a: M(`${u0}${sgn(d)}\\times ${n}=${un}`), s: `On ajoute ${n} fois ${M(d)}.`, ok: () => { let x = u0; for (let i = 0; i < n; i++) x += d; return x === un; } }; }
      if (level === 2) { const t = r.pick([-1, 1]) * r.int(1, 20), n = r.int(2, 5), q = 1 + t / 100, un = u0 * q ** n;
        return { q: `Une population de ${M(u0)} individus ${t > 0 ? 'augmente' : 'diminue'} de ${M(`${Math.abs(t)}\\,\\%`)} par an. Quelle sera sa taille dans ${M(n)} ans (arrondie à l’unité) ?`, a: M(`${u0}\\times ${numTex(F(100 + t, 100))}^{${n}}\\approx ${Math.round(un)}`), s: 'Chaque année, on multiplie par le même coefficient.', ok: () => { let x = u0; for (let i = 0; i < n; i++) x *= q; return Math.round(x) === Math.round(un); } }; }
      const q = r.pick([F(1, 2), F(4, 5), F(9, 10), F(11, 10), F(6, 5), F(3, 2)]), b = r.nz(-50, 80);
      const us = [F(u0)]; for (let i = 0; i < 3; i++) us.push(add(mul(q, us[i]), F(b)));
      return { q: `Un stock vaut ${M(u0)} unités au départ. Chaque mois, il est multiplié par ${M(numTex(q))} puis on ${b > 0 ? 'ajoute' : 'retire'} ${M(Math.abs(b))} unités. Donner le stock après 1, 2 et 3 mois.`, a: M(us.slice(1).map((x, i) => `${numTex(x)}`).join('\\ ;\\ ')), s: `Après un mois : ${M(`${numTex(q)}\\times ${u0}${sgn(b)}=${numTex(us[1])}`)}.`,
        ok: () => { let x = u0; for (let i = 1; i <= 3; i++) { x = val(q) * x + b; if (!near(x, val(us[i]))) return false; } return true; } };
    } },
  { id: 's-line-slope-point', cls: C, chapter: 'seconde-15', domain: 'geometrie', skill: 'Droite de pente donnée passant par un point', fast: true,
    make(r, level) {
      const A = [r.int(-8, 8), r.int(-8, 8)];
      let m;
      if (level === 1) m = F(r.nz(-6, 6));
      else if (level === 2) m = F(r.nz(-9, 9), r.pick([2, 3, 4, 5]));
      else { let al, be; do { al = r.nz(-6, 6); be = r.int(-6, 6); } while (!be); m = F(be, al); const p = sub(F(A[1]), mul(m, F(A[0])));
        return { q: `Déterminer l’équation réduite de la droite passant par ${M(`A${pt(...A)}`)} et dirigée par ${M(`\\vec{u}${vc(al, be)}`)}.`, a: M(`y=${affTex(m, p)}`), s: `Pente ${M(`\\dfrac{${be}}{${al}}${F(be, al).d === al ? '' : `=${fracTex(m)}`}`)} (pour un vecteur directeur ${M('(\\alpha\\,;\\,\\beta)')} avec ${M('\\alpha\\neq 0')}, la pente vaut ${M('\\beta/\\alpha')}).`,
          ok: () => eq(add(mul(m, F(A[0])), p), F(A[1])) && eq(mul(m, F(al)), F(be)) }; }
      const p = sub(F(A[1]), mul(m, F(A[0])));
      return { q: `Déterminer l’équation réduite de la droite de pente ${M(fracTex(m))} passant par ${M(`A${pt(...A)}`)}.`, a: M(`y=${affTex(m, p)}`), s: `${M(`${A[1]}=${fracTex(m)}\\times ${par(A[0])}+p`)} donne ${M(`p=${fracTex(p)}`)}.`, ok: () => eq(add(mul(m, F(A[0])), p), F(A[1])) };
    } },
];
