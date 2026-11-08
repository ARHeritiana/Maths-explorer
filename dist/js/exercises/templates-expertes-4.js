// Maths expertes generators, fourth file (chapters 06 to 08: divisibilité et congruences, PGCD, Bézout et Gauss, nombres premiers et petit théorème de
// Fermat): four-choice questions with one typical error per wrong option, true/false, find-the-error and multi-step generators with seeded
// parameters. Same contract as templates-expertes.js; every ok() recomputes the answer another way (BigInt powers, brute force, substitution).
import { F, M, sgn, par, gcd, lcm, isPrime } from './engine.js';
import { tf, spot } from './premiere-kit.js';
import { qcmNum } from './seconde-kit-2.js';
import { egcd, modPow, modPowLoop, posMod, factorize, primeTex } from './expertes-kit.js';

const C = 'expertes';
const pw = (b, k) => (k === 0 ? '1' : k === 1 ? `${b}` : `${b}^{${k}}`);
const nextPrime = (n) => { let m = n + 1; while (!isPrime(m)) m++; return m; };
const inverse = (a, n) => { for (let u = 1; u < n; u++) if ((a * u) % n === 1) return u; return null; };
const PRIMES = [5, 7, 11, 13, 17, 19, 23, 29, 31, 37];
const eqW = (a, b, c) => `${a}x${b >= 0 ? '+' : '-'}${Math.abs(b) === 1 ? '' : Math.abs(b)}y=${c}`.replace(/^1x/, 'x');
const axy = (a, b, c) => `${a === 1 ? '' : a}x${b < 0 ? '-' : '+'}${Math.abs(b) === 1 ? '' : Math.abs(b)}y=${c}`;

export const expertes4 = [
  // ============================ 06 Divisibilité et congruences ============================
  { id: 'e4-cong-qcm', cls: C, chapter: 'expertes-06', domain: 'arithmetique', skill: 'QCM de congruences', fast: true,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['pow', 'rem'] : ['pow', 'lin', 'rem']);
      if (kind === 'rem') { const m = r.int(3, 12), n = r.int(m + 5, 200), good = posMod(n, m);
        return qcmNum(r, `Le reste de la division euclidienne de ${M(n)} par ${M(m)} est :`, [good, `${M(`${n}=${m}\\times ${Math.floor(n / m)}+${good}`)}.`], [[Math.floor(n / m), 'donne le quotient.'], [m - good, 'donne le complément à ' + M(m) + '.'], [(good + 1) % m, 'se trompe d’une unité.'], [n % (m + 1), 'divise par ' + M(m + 1) + '.']], M, (v) => v >= 0 && v < m && (n - v) % m === 0); }
      if (kind === 'pow') { const m = r.pick([5, 7, 9, 11, 13]), a = r.int(2, m + 4), n = r.int(m + 3, 150), good = modPow(a, n, m);
        return qcmNum(r, `Le reste de la division de ${M(`${a}^{${n}}`)} par ${M(m)} est :`, [good, `les puissances de ${M(a)} modulo ${M(m)} sont périodiques : on réduit l’exposant selon la période.`],
          [[modPow(a, n % m, m), `réduit l’exposant modulo ${M(m)} au lieu de la période.`], [posMod(a * n, m), 'multiplie ' + M(a) + ' par ' + M(n) + ' au lieu d’élever à la puissance.'], [posMod(a, m), `prend le reste de ${M(a)} modulo ${M(m)} sans élever.`], [posMod(a ** 2, m), 'ne garde que le carré.']], M, (v) => modPowLoop(a, n, m) === v); }
      const m = r.pick(PRIMES), a = r.int(2, m - 1), b = r.int(1, m - 1), good = (b * inverse(a, m)) % m;
      return qcmNum(r, `Dans ${M('\\mathbb{Z}')}, les solutions de ${M(`${a}x\\equiv ${b}\\ [${m}]`)} sont les entiers congrus modulo ${M(m)} à :`, [good, `l’inverse de ${M(a)} modulo ${M(m)} est ${M(inverse(a, m))} : ${M(`x\\equiv ${inverse(a, m)}\\times ${b}\\equiv ${good}`)}.`],
        [[Math.floor(b / a) % m, 'divise ' + M(b) + ' par ' + M(a) + ' comme dans ' + M('\\mathbb{R}') + '.'], [posMod(b - a, m), 'soustrait ' + M(a) + ' au lieu de multiplier par l’inverse.'], [posMod(-good, m), 'se trompe de signe.'], [posMod(b * a, m), 'multiplie par ' + M(a) + ' au lieu de son inverse.']], M, (v) => v >= 0 && v < m && (a * v) % m === b);
    } },

  { id: 'e4-cong-tf', cls: C, chapter: 'expertes-06', domain: 'arithmetique', skill: 'Vrai ou faux sur les congruences', fast: false,
    make(r, level) {
      const kind = r.pick(['fwd', 'bwd', 'squares']);
      if (kind === 'fwd') { const n = r.int(5, 40), a = r.int(1, n - 1), b = a + n * r.int(1, 5);
        return tf({ s: `On a ${M(`${a}\\equiv ${b}\\ [${n}]`)}, donc ${M(`${a}^{2}\\equiv ${b}^{2}\\ [${n}]`)}.`, v: true, c: () => (a * a - b * b) % n === 0 && (a - b) % n === 0, j: `Si ${M(`a\\equiv b\\ [n]`)}, alors ${M(`a^{2}-b^{2}=(a-b)(a+b)`)} est un multiple de ${M(n)} : ${M(`${a}^{2}\\equiv ${b}^{2}\\ [${n}]`)}.` }); }
      if (kind === 'bwd') { const n = r.int(5, 40), a = r.int(2, Math.floor((n - 1) / 2)), b = n - a;
        return tf({ s: `On a ${M(`${a}^{2}\\equiv ${b}^{2}\\ [${n}]`)}, donc ${M(`${a}\\equiv ${b}\\ [${n}]`)}.`, v: false, c: () => (a * a - b * b) % n === 0 && (a - b) % n !== 0, j: `${M(`${a}^{2}-${b}^{2}=(${a}-${b})(${a}+${b})=${a - b}\\times ${n}`)} est divisible par ${M(n)} mais ${M(`${a}-${b}=${a - b}`)} ne l’est pas : la réciproque est fausse.` }); }
      const m = r.pick([3, 4, 5, 7, 8]), res = [...new Set(Array.from({ length: m }, (_, k) => (k * k) % m))].sort((x, y) => x - y), yes = r.next() < 0.5, claim = yes ? res : res.filter((x, i) => i !== res.length - 1).concat([(res[res.length - 1] + 1) % m === res[0] ? res[res.length - 1] + 2 : (res[res.length - 1] + 1) % m]).sort((x, y) => x - y);
      const ok = claim.length === res.length && claim.every((x, i) => x === res[i]);
      return tf({ s: `Les restes possibles de la division de ${M('n^{2}')} par ${M(m)} (${M('n')} entier) sont exactement ${M(claim.join(',\\ '))}.`, v: ok, c: () => { const real = new Set(); for (let n = 0; n < 3 * m; n++) real.add((n * n) % m); return ok === (claim.length === real.size && claim.every((x) => real.has(x))); }, j: ok ? `En testant ${M('n=0,\\dots,' + (m - 1))} : ${M(Array.from({ length: m }, (_, k) => `${k}^{2}\\equiv ${(k * k) % m}`).join(',\\ '))}. Les restes sont ${M(res.join(',\\ '))}.` : `Les restes réellement obtenus sont ${M(res.join(',\\ '))} (on teste les ${M(m)} classes de ${M('n')}), pas ${M(claim.join(',\\ '))}.` });
    } },

  { id: 'e4-cong-error', cls: C, chapter: 'expertes-06', domain: 'arithmetique', skill: 'Trouver l’erreur dans une congruence', fast: false,
    make(r, level) {
      const m = r.pick([7, 11, 13, 17, 19]), a = r.int(2, m - 2), b = r.int(1, m - 1), u = inverse(a, m), bad = m - a, good = (b * u) % m;
      if (bad === u || (a * bad) % m === 1) return this.make(r, level);
      const xb = (b * bad) % m;
      if (xb === good || (a * xb) % m === b) return this.make(r, level);
      return spot(`Un élève résout ${M(`${a}x\\equiv ${b}\\ [${m}]`)}.`, [M(`${a}\\times ${bad}=${a * bad}\\equiv 1\\ [${m}]`), M(`\\text{donc ${bad} est l’inverse de ${a} modulo ${m}}`), M(`x\\equiv ${bad}\\times ${b}=${bad * b}\\equiv ${xb}\\ [${m}]`)], 0, `${M(`${a * bad}=${m}\\times ${Math.floor((a * bad) / m)}+${(a * bad) % m}`)} : le reste est ${M((a * bad) % m)}, pas ${M(1)}.`, M(`${a}\\times ${u}=${a * u}\\equiv 1\\ [${m}]`), M(`x\\equiv ${u}\\times ${b}\\equiv ${good}\\ [${m}]`), () => (a * u) % m === 1 && (a * good) % m === b && (a * bad) % m !== 1 && (a * xb) % m !== b);
    } },

  { id: 'e4-cong-table', cls: C, chapter: 'expertes-06', domain: 'arithmetique', skill: 'Table des restes et équation de congruence', fast: false,
    make(r, level) {
      const m = r.int(5, 30), pw = level === 1 ? 2 : r.pick([2, 3]), tab = Array.from({ length: m }, (_, k) => modPowLoop(k, pw, m)), rr = r.pick(tab), sol = tab.map((v, k) => (v === rr ? k : -1)).filter((k) => k >= 0);
      return { q: `Dresser le tableau des restes de ${M(`n^{${pw}}`)} modulo ${M(m)} pour ${M(`n\\equiv 0,\\ 1,\\ \\dots,\\ ${m - 1}\\ [${m}]`)}, puis résoudre ${M(`n^{${pw}}\\equiv ${rr}\\ [${m}]`)} dans ${M('\\mathbb{Z}')}.`, a: `${M(`\\begin{array}{c|${'c'.repeat(m)}}n&${Array.from({ length: m }, (_, k) => k).join('&')}\\\\\\hline n^{${pw}}&${tab.join('&')}\\end{array}`)} Les solutions sont les entiers congrus à ${sol.map((k) => M(k)).join(', ')} modulo ${M(m)}.`,
        ok: () => { const found = []; for (let n = 0; n < m; n++) if ((n ** pw) % m === rr) found.push(n); return found.length === sol.length && found.every((x, i) => x === sol[i]) && tab.every((v, k) => v === Number((BigInt(k) ** BigInt(pw)) % BigInt(m))); } };
    } },

  { id: 'e4-cong-digit', cls: C, chapter: 'expertes-06', domain: 'arithmetique', skill: 'Chiffre des unités d’une puissance', fast: false,
    make(r, level) {
      const a = r.pick([2, 3, 7, 8, 9, 13, 17, 19, 23]), n = r.int(15, 400), mod = level === 3 ? 100 : 10, good = modPow(a, n, mod);
      let per = 1, v = a % mod; while (v !== 1 && per < 100) { v = (v * a) % mod; per++; }
      const cyc = []; let x = 1; for (let i = 1; i <= per; i++) { x = (x * a) % mod; cyc.push(x); }
      return { q: `Déterminer ${mod === 10 ? 'le chiffre des unités' : 'les deux derniers chiffres'} de ${M(`${a}^{${n}}`)}.`, a: `${M(`${a}^{k}`)} modulo ${M(mod)} a pour période ${M(per)} : ${M(cyc.join(',\\ '))}. Comme ${M(`${n}=${per}\\times ${Math.floor(n / per)}+${n % per}`)}, ${M(`${a}^{${n}}\\equiv ${good}\\ [${mod}]`)}${mod === 10 ? '' : ` : les deux derniers chiffres sont ${M(String(good).padStart(2, '0'))}`}.`,
        ok: () => String(BigInt(a) ** BigInt(n) % BigInt(mod)) === String(good) && modPowLoop(a, n, mod) === good && per >= 1 };
    } },

  // ============================ 07 PGCD, Bézout, Gauss ============================
  { id: 'e4-gcd-qcm', cls: C, chapter: 'expertes-07', domain: 'arithmetique', skill: 'QCM : PGCD, Bézout, Gauss', fast: true,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['gcd', 'gauss'] : ['gcd', 'bezout', 'gauss']);
      if (kind === 'gcd') { const g = r.int(2, 14), p = r.int(2, 12), q = r.int(2, 12); if (gcd(p, q) !== 1 || p === q) return this.make(r, level); const a = g * p, b = g * q;
        return qcmNum(r, `Le PGCD de ${M(a)} et ${M(b)} est :`, [g, `l’algorithme d’Euclide donne ${M(g)} (et ${M(`${a}=${g}\\times ${p}`)}, ${M(`${b}=${g}\\times ${q}`)} avec ${M(p)} et ${M(q)} premiers entre eux).`], [[Math.abs(a - b) || 1, 'prend la différence.'], [lcm(a, b), 'donne le PPCM.'], [Math.min(a, b), 'prend le plus petit des deux.'], [gcd(a, b + 1), 'se trompe d’une unité dans un nombre.']], M, (v) => gcd(a, b) === v); }
      if (kind === 'bezout') { let a = r.int(5, 40), b = r.int(5, 40); if (a === b || gcd(a, b) !== 1) return this.make(r, level); const [g, u, v] = egcd(a, b);
        return qcmNum(r, `Quel couple ${M('(u,v)')} d’entiers vérifie ${M(`${a}u+${b}v=1`)} ?`, [[u, v], `${M(`${a}\\times ${par(u)}+${b}\\times ${par(v)}=${a * u + b * v}`)}.`], [[[v, u], 'échange ' + M('u') + ' et ' + M('v') + '.'], [[-u, v], 'se trompe de signe pour ' + M('u') + '.'], [[u, -v], 'se trompe de signe pour ' + M('v') + '.'], [[u + b, v + a], 'ajoute ' + M('b') + ' à ' + M('u') + ' et ' + M('a') + ' à ' + M('v') + ' (au lieu de retrancher).']].map(([c, w]) => [c, w]), ([x, y]) => M(`(${x},\\ ${y})`), ([x, y]) => a * x + b * y === 1); }
      const p = r.pick([2, 3, 5, 7]), q = r.pick([2, 3, 5, 7].filter((x) => x !== 0)); const a = p * q, b = p * r.int(2, 6), c = q * r.int(2, 6);
      const gc = gcd(a, b) === 1;
      return qcmNum(r, `On sait que ${M(`${a}`)} divise ${M(`${b}\\times ${c}=${b * c}`)}. Peut-on affirmer que ${M(a)} divise ${M(b)} ou ${M(c)} ?`, [{ t: a % b === 0 || a % c === 0 || (b % a === 0 || c % a === 0) ? 'oui' : 'non', real: b % a === 0 || c % a === 0 }, 'le théorème de Gauss ne s’applique que si les nombres sont premiers entre eux, ce qui doit être vérifié sur l’exemple.'], [[{ t: b % a === 0 || c % a === 0 ? 'non' : 'oui', real: !(b % a === 0 || c % a === 0) }, 'contredit le calcul direct des divisions.']], (o) => M(`\\text{${o.t}}`), (o) => (o.t === 'oui') === (b % a === 0 || c % a === 0) && (b * c) % a === 0 && gc !== undefined);
    } },

  { id: 'e4-gcd-tf', cls: C, chapter: 'expertes-07', domain: 'arithmetique', skill: 'Vrai ou faux sur PGCD, Bézout, Gauss', fast: false,
    make(r, level) {
      const kind = r.pick(['dioph', 'prod', 'gauss']);
      if (kind === 'dioph') { const g = r.int(2, 9), a = g * r.int(2, 8), b = g * r.int(2, 8), yes = r.next() < 0.5, c = yes ? g * r.int(1, 12) : g * r.int(1, 12) + r.int(1, g - 1), ok = c % gcd(a, b) === 0;
        return tf({ s: `L’équation ${M(`${a}x+${b}y=${c}`)} admet au moins une solution dans ${M('\\mathbb{Z}^{2}')}.`, v: ok, c: () => { let found = false; for (let x = -c; x <= c && !found; x++) if (Math.abs(c - a * x) % b === 0) found = true; return found === ok; }, j: `${M(`\\text{PGCD}(${a},${b})=${gcd(a, b)}`)}${ok ? ` divise ${M(c)} : il existe des solutions (Bézout).` : ` ne divise pas ${M(c)} : l’équation n’a pas de solution.`}` }); }
      if (kind === 'prod') { const p = r.pick([2, 3, 5, 7]), q = r.pick([2, 3, 5, 7].filter((x) => true)); if (p === q) return this.make(r, level); const a = p * q, b = p * r.int(2, 5), c = q * r.int(2, 5);
        if (b % a === 0 || c % a === 0) return this.make(r, level);
        return tf({ s: `${M(a)} divise ${M(`${b}\\times ${c}=${b * c}`)}, donc ${M(a)} divise ${M(b)} ou ${M(a)} divise ${M(c)}.`, v: false, c: () => (b * c) % a === 0 && b % a !== 0 && c % a !== 0, j: `Ce raisonnement n’est valable que si ${M(a)} est premier. Ici ${M(`${b * c}=${a}\\times ${(b * c) / a}`)} mais ${M(a)} ne divise ni ${M(b)} ni ${M(c)}.` }); }
      const a = r.int(3, 12), b = r.int(2, 15), c = r.int(2, 15); const cop = gcd(a, b) === 1, divides = (b * c) % a === 0, concl = c % a === 0, hyp = cop && divides;
      if (!hyp) return this.make(r, level);
      return tf({ s: `${M(a)} divise ${M(`${b}\\times ${c}`)} et ${M(a)} est premier avec ${M(b)}, donc ${M(a)} divise ${M(c)}.`, v: true, c: () => (b * c) % a === 0 && gcd(a, b) === 1 && c % a === 0, j: `C’est le théorème de Gauss : ${M(a)} divise ${M(`${b}\\times ${c}`)} et est premier avec ${M(b)}, donc divise ${M(c)}.` });
    } },

  { id: 'e4-gcd-error', cls: C, chapter: 'expertes-07', domain: 'arithmetique', skill: 'Trouver l’erreur dans l’algorithme d’Euclide', fast: false,
    make(r, level) {
      const a = r.int(60, 400), b = r.int(20, a - 10), r1 = a % b;
      if (r1 === 0) return this.make(r, level);
      const q1 = Math.floor(a / b), r2 = b % r1, q2 = Math.floor(b / r1), bad = r2 + 1;
      if (r2 === 0 || bad >= r1) return this.make(r, level);
      const lines = [M(`${a}=${b}\\times ${q1}+${r1}`), M(`${b}=${r1}\\times ${q2}+${bad}`)];
      let x = r1, y = bad, last = bad;
      while (y > 0 && lines.length < 4) { lines.push(M(`${x}=${y}\\times ${Math.floor(x / y)}+${x % y}`)); const t = x % y; x = y; y = t; last = x; }
      const good = gcd(a, b);
      if (y > 0 || last === good) return this.make(r, level);
      return spot(`Un élève calcule le PGCD de ${M(a)} et ${M(b)} avec l’algorithme d’Euclide.`, [...lines, M(`\\text{PGCD}(${a},${b})=${last}`)].slice(0, 5), 1, `${M(`${r1}\\times ${q2}+${bad}=${r1 * q2 + bad}`)} n’est pas égal à ${M(b)} : le reste de ${M(`${b}`)} par ${M(r1)} est ${M(r2)}.`, M(`${b}=${r1}\\times ${q2}+${r2}`), M(`\\text{PGCD}(${a},${b})=${good}`),
        () => r1 * q2 + bad !== b && r1 * q2 + r2 === b && gcd(a, b) === good && last !== good && lines.length + 1 <= 5);
    } },

  { id: 'e4-gcd-dioph', cls: C, chapter: 'expertes-07', domain: 'arithmetique', skill: 'Équation diophantienne ax + by = c', fast: false,
    make(r, level) {
      const g = r.pick([1, 1, 2, 3]), a = g * r.int(2, 11), b = g * r.int(2, 11), k = r.int(1, 6);
      const d = gcd(a, b); if (a === b || d !== g) return this.make(r, level);
      const c = g * k * r.int(1, 4), [dd, u, v] = egcd(a, b), x0 = (u * c) / dd, y0 = (v * c) / dd, sa = a / dd, sb = b / dd;
      if (level < 3) return { q: `Résoudre dans ${M('\\mathbb{Z}^{2}')} l’équation ${M(axy(a, b, c))}.`, a: `${M(`\\text{PGCD}(${a},${b})=${dd}`)} divise ${M(c)}. Une relation de Bézout : ${M(`${a}\\times ${par(u)}+${b}\\times ${par(v)}=${dd}`)}, donc ${M(`(x_0,y_0)=(${x0},${y0})`)} est solution particulière. Les solutions sont ${M(`(${x0}+${sb}t\\,;\\,${y0}-${sa}t)`)}, ${M('t\\in\\mathbb{Z}')}.`, ok: () => [-3, -1, 0, 2, 5].every((t) => a * (x0 + sb * t) + b * (y0 - sa * t) === c) && a * x0 + b * y0 === c && dd * Math.floor(c / dd) === c };
      const a2 = a, b2 = b; let best = null; for (let t = -400; t <= 400; t++) { const x = x0 + sb * t, y = y0 - sa * t; if (x > 0 && y > 0 && (best === null || x < best[0])) best = [x, y]; }
      if (!best) return this.make(r, level);
      return { q: `Déterminer toutes les solutions entières de ${M(axy(a, b, c))}, puis celles pour lesquelles ${M('x>0')} et ${M('y>0')}.`, a: `Solution particulière ${M(`(${x0},${y0})`)} ; solutions ${M(`(${x0}+${sb}t\\,;\\,${y0}-${sa}t)`)}. Positives : ${M(`${x0}+${sb}t>0`)} et ${M(`${y0}-${sa}t>0`)}, par exemple ${M(`(${best[0]},${best[1]})`)}.`,
        ok: () => a2 * best[0] + b2 * best[1] === c && best[0] > 0 && best[1] > 0 && a * (x0 + sb) + b * (y0 - sa) === c };
    } },

  { id: 'e4-gcd-inv', cls: C, chapter: 'expertes-07', domain: 'arithmetique', skill: 'Inverse modulaire par Bézout', fast: false,
    make(r, level) {
      const n = r.int(7, 60), a = r.int(2, n - 1);
      if (gcd(a, n) !== 1) return this.make(r, level);
      const [g, u, v] = egcd(a, n), inv = posMod(u, n), b = r.int(1, n - 1), x = (inv * b) % n;
      return { q: `Montrer que ${M(a)} est inversible modulo ${M(n)} et déterminer son inverse. En déduire les solutions de ${M(`${a}x\\equiv ${b}\\ [${n}]`)}.`, a: `${M(`\\text{PGCD}(${a},${n})=1`)} et l’algorithme d’Euclide étendu donne ${M(`${a}\\times ${par(u)}+${n}\\times ${par(v)}=1`)}, donc ${M(`${a}\\times ${par(u)}\\equiv 1\\ [${n}]`)} : l’inverse est ${M(inv)}. Alors ${M(`x\\equiv ${inv}\\times ${b}\\equiv ${x}\\ [${n}]`)}.`,
        ok: () => g === 1 && (a * inv) % n === 1 && a * u + n * v === 1 && (a * x) % n === b && inverse(a, n) === inv };
    } },

  { id: 'e4-gcd-euclid', cls: C, chapter: 'expertes-07', domain: 'arithmetique', skill: 'Algorithme d’Euclide en détail', fast: true,
    make(r, level) {
      const g = r.int(1, 12), a0 = g * r.int(8, 60), b0 = g * r.int(3, 40), a = Math.max(a0, b0), b = Math.min(a0, b0);
      if (a === b) return this.make(r, level);
      const rows = []; let x = a, y = b; while (y > 0) { rows.push([x, Math.floor(x / y), y, x % y]); const t = x % y; x = y; y = t; }
      const gg = x;
      return { q: `Calculer le PGCD de ${M(a)} et ${M(b)} par l’algorithme d’Euclide (écrire toutes les divisions) et dire s’ils sont premiers entre eux.`, a: `${rows.map(([p, qq, d, rr]) => M(`${p}=${d}\\times ${qq}+${rr}`)).join(' ; ')}. Le dernier reste non nul est ${M(gg)} : ${M(`\\text{PGCD}(${a},${b})=${gg}`)}${gg === 1 ? ' : les nombres sont premiers entre eux.' : '.'}`,
        ok: () => gcd(a, b) === gg && rows.every(([p, qq, d, rr]) => p === d * qq + rr && rr < d) && a % gg === 0 && b % gg === 0 };
    } },

  // ============================ 08 Nombres premiers et petit théorème de Fermat ============================
  { id: 'e4-prime-qcm', cls: C, chapter: 'expertes-08', domain: 'arithmetique', skill: 'QCM : nombres premiers et théorème de Fermat', fast: true,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['prime', 'fermat'] : ['prime', 'fermat', 'spf']);
      if (kind === 'prime') { const comps = [91, 119, 133, 143, 161, 169, 187, 203, 209, 217, 221, 247, 253, 259, 289, 299, 301, 319, 323, 341], primes = [101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197], good = r.pick(primes), bads = r.shuffle(comps);
        return qcmNum(r, 'Lequel de ces nombres est premier ?', [good, `aucun nombre premier inférieur ou égal à ${M(Math.floor(Math.sqrt(good)))} ne le divise.`], bads.map((c) => { const f = factorize(c); return [c, `${M(`${c}=${f.join('\\times ')}`)}.`]; }), M, (v) => isPrime(v)); }
      if (kind === 'fermat') { const p = r.pick([5, 7, 11, 13, 17, 19]), a = r.int(2, p - 1), s = r.int(0, p - 2), qk = r.int(3, 12), n = (p - 1) * qk + s, good = modPow(a, n, p);
        return qcmNum(r, `Le reste de la division de ${M(`${a}^{${n}}`)} par le nombre premier ${M(p)} est :`, [good, `${M(`${a}^{${p - 1}}\\equiv 1\\ [${p}]`)} (Fermat) et ${M(`${n}=${p - 1}\\times ${qk}+${s}`)} : ${M(`${a}^{${n}}\\equiv ${pw(a, s)}\\ [${p}]`)}.`],
          [[modPow(a, n % p, p), `réduit l’exposant modulo ${M(p)} au lieu de ${M(p - 1)}.`], [1, 'applique ' + M(`a^{p-1}\\equiv 1`) + ' sans tenir compte du reste de l’exposant.'], [a % p, 'applique ' + M('a^{p}\\equiv a') + ' sans réduire l’exposant.'], [posMod(good + 1, p), 'se trompe d’une unité.']], M, (v) => modPowLoop(a, n, p) === v); }
      const n = r.pick([91, 143, 221, 187, 247, 299, 323, 391, 437, 493, 551, 589]), f = factorize(n).sort((x, y) => x - y)[0];
      return qcmNum(r, `Le plus petit diviseur premier de ${M(n)} est :`, [f, `${M(`${n}=${f}\\times ${n / f}`)} et aucun nombre premier plus petit ne divise ${M(n)}.`], [[n / f, 'donne le plus grand facteur.'], [nextPrime(f), 'se trompe de nombre premier.'], [n, 'croit que ' + M(n) + ' est premier.'], [Math.max(2, f - 2), 'prend un nombre qui ne divise pas ' + M(n) + '.']], M, (v) => isPrime(v) && n % v === 0 && Array.from({ length: v - 2 }, (_, i) => i + 2).every((d) => n % d !== 0));
    } },

  { id: 'e4-prime-tf', cls: C, chapter: 'expertes-08', domain: 'arithmetique', skill: 'Vrai ou faux sur les nombres premiers', fast: false,
    make(r, level) {
      const kind = r.pick(['pseudo', 'sqrt', 'ferm']);
      if (kind === 'pseudo') { const n = r.pick([341, 561, 645, 1105, 1387, 1729]);
        return tf({ s: `On a ${M(`2^{${n - 1}}\\equiv 1\\ [${n}]`)}, donc ${M(n)} est un nombre premier.`, v: false, c: () => modPow(2, n - 1, n) === 1 && !isPrime(n), j: `La réciproque du petit théorème de Fermat est fausse : ${M(`${n}=${factorize(n).join('\\times ')}`)} n’est pas premier, bien que ${M(`2^{${n - 1}}\\equiv 1\\ [${n}]`)}.` }); }
      if (kind === 'sqrt') { const cands = []; for (let n = 101; n < 600; n++) if ([2, 3, 5, 7].every((p) => n % p !== 0)) cands.push(n); const n = r.pick(cands), ok = isPrime(n);
        return tf({ s: `Le nombre ${M(n)} n’est divisible ni par ${M(2)}, ni par ${M(3)}, ni par ${M(5)}, ni par ${M(7)} : il est premier.`, v: ok, c: () => ok === (Array.from({ length: Math.floor(Math.sqrt(n)) - 1 }, (_, i) => i + 2).every((d) => n % d !== 0)), j: ok ? `Aucun nombre premier inférieur ou égal à ${M(Math.floor(Math.sqrt(n)))} (${M('\\sqrt{' + n + '}\\approx ' + Math.sqrt(n).toFixed(1).replace('.', '{,}'))}) ne le divise, il est donc premier.` : `Il reste à tester les premiers jusqu’à ${M(Math.floor(Math.sqrt(n)))} : ${M(`${n}=${factorize(n).join('\\times ')}`)}.` }); }
      const p = r.pick([5, 7, 11, 13]), a = p * r.int(1, 4), yes = r.next() < 0.5, b = yes ? r.int(1, p - 1) : a;
      return tf({ s: `Pour ${M(`p=${p}`)} et ${M(`a=${b}`)}, on a ${M(`a^{${p - 1}}\\equiv 1\\ [${p}]`)}.`, v: b % p !== 0, c: () => (modPow(b, p - 1, p) === 1) === (b % p !== 0), j: b % p !== 0 ? `${M(p)} est premier et ne divise pas ${M(b)} : Fermat donne ${M(`${b}^{${p - 1}}\\equiv 1\\ [${p}]`)}.` : `${M(p)} divise ${M(b)} : ${M(`${b}^{${p - 1}}\\equiv 0\\ [${p}]`)}, le théorème ne s’applique pas.` });
    } },

  { id: 'e4-prime-error', cls: C, chapter: 'expertes-08', domain: 'arithmetique', skill: 'Trouver l’erreur dans l’emploi du petit théorème de Fermat', fast: false,
    make(r, level) {
      const p = r.pick([7, 11, 13, 17]), a = r.int(2, p - 1), qk = r.int(4, 12), s = r.int(1, p - 2), n = (p - 1) * qk + s, sBad = n % p, good = modPow(a, n, p), bad = modPow(a, sBad, p);
      if (sBad === s || bad === good) return this.make(r, level);
      return spot(`Un élève calcule le reste de ${M(`${a}^{${n}}`)} dans la division par ${M(p)} (premier).`, [M(`${p}\\text{ est premier et ne divise pas }${a}\\text{ donc }${a}^{${p - 1}}\\equiv 1\\ [${p}]`), M(`${n}=${p}\\times ${Math.floor(n / p)}+${sBad}`), M(`${a}^{${n}}\\equiv ${pw(a, sBad)}\\equiv ${bad}\\ [${p}]`)], 1, `l’exposant se réduit modulo ${M(p - 1)} (période donnée par Fermat) et non modulo ${M(p)}.`, M(`${n}=${p - 1}\\times ${qk}+${s}`), M(`${a}^{${n}}\\equiv ${pw(a, s)}\\equiv ${good}\\ [${p}]`), () => modPowLoop(a, n, p) === good && good !== bad && n === (p - 1) * qk + s);
    } },

  { id: 'e4-prime-factor', cls: C, chapter: 'expertes-08', domain: 'arithmetique', skill: 'Décomposition en facteurs premiers et nombre de diviseurs', fast: true,
    make(r, level) {
      const n = level === 1 ? r.int(30, 400) : level === 2 ? r.int(400, 2500) : (() => { let m; do { m = 2 ** r.int(1, 5) * 3 ** r.int(0, 3) * 5 ** r.int(0, 2) * 7 ** r.int(0, 2) * r.pick([1, 1, 11, 13]); } while (m < 300 || m > 12000); return m; })(), fs = factorize(n), exps = new Map(); fs.forEach((x) => exps.set(x, (exps.get(x) || 0) + 1));
      const nd = [...exps.values()].reduce((s, e) => s * (e + 1), 1);
      return { q: `Décomposer ${M(n)} en produit de facteurs premiers. Combien ${M(n)} a-t-il de diviseurs positifs ?`, a: `${M(`${n}=${primeTex(fs)}`)}. Le nombre de diviseurs est ${M(`${[...exps.values()].map((e) => `(${e}+1)`).join('\\times ')}=${nd}`)}.`,
        ok: () => fs.reduce((p, x) => p * x, 1) === n && fs.every((x) => isPrime(x)) && (() => { let c = 0; for (let d = 1; d <= n; d++) if (n % d === 0) c++; return c === nd; })() };
    } },

  { id: 'e4-prime-next', cls: C, chapter: 'expertes-08', domain: 'arithmetique', skill: 'Premier suivant et nombre de premiers dans un intervalle', fast: false,
    make(r, level) {
      const n = r.int(100, 3000), p = nextPrime(n);
      if (level < 3) return { q: `Quel est le plus petit nombre premier strictement supérieur à ${M(n)} ? Justifier.`, a: `Les entiers de ${M(n + 1)} à ${M(p - 1)} sont composés : ${p - n - 1 === 0 ? 'il n’y en a aucun à tester' : `chacun est divisible par un petit premier (par exemple ${M(n + 1)} par ${M(factorize(n + 1)[0])})`}. Et ${M(p)} est premier (aucun premier inférieur ou égal à ${M(Math.floor(Math.sqrt(p)))} ne le divise).`, ok: () => isPrime(p) && Array.from({ length: p - n - 1 }, (_, i) => n + 1 + i).every((m) => !isPrime(m)) && p > n };
      const lo = r.int(50, 500), hi = lo + 30, list = []; for (let m = lo; m <= hi; m++) if (isPrime(m)) list.push(m);
      return { q: `Donner la liste des nombres premiers compris entre ${M(lo)} et ${M(hi)} (inclus) et leur nombre.`, a: `${list.length === 0 ? 'Il n’y en a aucun.' : `${M(list.join(',\\ '))}, soit ${M(list.length)} nombre${list.length > 1 ? 's' : ''} premier${list.length > 1 ? 's' : ''}.`}`, ok: () => list.every((m) => { for (let d = 2; d * d <= m; d++) if (m % d === 0) return false; return m > 1; }) && list.length === Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).filter((m) => factorize(m).length === 1 && m > 1).length };
    } },
];
