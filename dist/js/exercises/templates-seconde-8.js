// Seconde generators, eighth file (chapters 13 to 15: raisonnement, probabilités, consolidation vers la Première): four-choice questions with one
// typical error per wrong option, true/false, find-the-error and multi-step generators with seeded parameters. Same contract as
// templates-seconde.js; every ok() recomputes the answer another way (brute-force enumeration, exact fractions, sampling).
import { F, add, sub, mul, div, val, eq, M, fracTex, numTex, polyTex, evalPoly, sgn, par, gcd, isPrime } from './engine.js';
import { tf, spot } from './premiere-kit.js';
import { dec, parT } from './seconde-kit.js';
import { qcmNum } from './seconde-kit-2.js';

const C = 'seconde';
const fr1 = (x) => String(x).replace('.', '{,}');
const up = (s) => s;
// "(x+h)^2+k" with no x+0 and no +0
const canon = (h, k) => `${h === 0 ? 'x' : `(x${sgn(h)})`}^{2}${k === 0 ? '' : sgn(k)}`;
const EVENTS = (f) => [
  ['pair', (n) => n % 2 === 0], ['impair', (n) => n % 2 === 1], ['multiple de 3', (n) => n % 3 === 0], ['multiple de 5', (n) => n % 5 === 0], ['premier', (n) => isPrime(n)],
  [`supérieur ou égal à ${Math.ceil(f / 2) + 1}`, (n) => n >= Math.ceil(f / 2) + 1], [`inférieur ou égal à ${Math.floor(f / 3)}`, (n) => n <= Math.floor(f / 3)], ['multiple de 4', (n) => n % 4 === 0],
];

export const seconde8 = [
  // ============================ 13 Raisonnement ============================
  { id: 's4-reason-qcm', cls: C, chapter: 'seconde-13', domain: 'nombres', skill: 'QCM de logique et de contre-exemples', fast: true,
    make(r, level) {
      if (r.next() < 0.5) {
        const k = r.int(3, 12), good = r.int(1, k - 1);
        return qcmNum(r, `On affirme : « pour tout réel ${M('x')}, ${M(`x^{2}\\geqslant ${k}x`)} ». Lequel de ces nombres est un contre-exemple ?`, [good, `${M(`${good}^{2}=${good * good}`)} et ${M(`${k}\\times ${good}=${k * good}`)} : ${M(`${good * good}<${k * good}`)}.`],
          [[k, 'a l’égalité ' + M(`x^{2}=${k}x`) + ' : ce n’est pas un contre-exemple.'], [k + r.int(1, 3), 'pour un réel plus grand que ' + M(k) + ', l’inégalité est vérifiée.'], [-r.int(1, 4), 'pour un réel négatif, ' + M('x^{2}') + ' est positif et ' + M(`${k}x`) + ' négatif : l’inégalité est vérifiée.'], [0, 'a l’égalité ' + M('0=0') + '.']], M, (x) => x * x < k * x);
      }
      const [a, b] = r.pick([[6, 2], [6, 3], [12, 4], [12, 3], [10, 5], [8, 4], [15, 5], [9, 3], [20, 4], [18, 6]]);
      const sent = (p, q) => `\\text{Si } n \\text{ est un multiple de } ${p}\\text{, alors } n \\text{ est un multiple de } ${q}`, notM = (p) => `\\text{ n’est pas un multiple de } ${p}`;
      const opts = {
        contra: { t: `\\text{Si } n${notM(b)}\\text{, alors } n${notM(a)}`, f: (n) => !(n % b !== 0) || n % a !== 0 }, conv: { t: sent(b, a), f: (n) => n % b !== 0 || n % a === 0 },
        inv: { t: `\\text{Si } n${notM(a)}\\text{, alors } n${notM(b)}`, f: (n) => n % a === 0 || n % b !== 0 }, conj: { t: `n \\text{ est un multiple de } ${a}\\text{ et un multiple de } ${b}`, f: (n) => n % a === 0 && n % b === 0 },
      };
      const orig = (n) => n % a !== 0 || n % b === 0, eqv = (o) => Array.from({ length: 120 }, (_, i) => i + 1).every((n) => o.f(n) === orig(n));
      return qcmNum(r, `La contraposée de la proposition ${M(sent(a, b))} est :`, [opts.contra, 'on inverse et on nie : « non Q implique non P ».'],
        [[opts.conv, 'écrit la réciproque.'], [opts.inv, 'écrit la proposition obtenue en niant les deux membres sans les inverser (la « contraire »).'], [opts.conj, 'confond implication et conjonction.']], (o) => M(o.t), eqv);
    } },

  { id: 's4-reason-tf', cls: C, chapter: 'seconde-13', domain: 'nombres', skill: 'Vrai ou faux : réciproque, existence', fast: false,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['recip', 'exist'] : ['recip', 'exist', 'recipt']);
      if (kind === 'recip') {
        const b = r.int(2, 14), a = b * r.int(2, 9);
        return tf({ s: `La réciproque de « si n est un multiple de ${a}, alors n est un multiple de ${b} » est vraie.`, v: false, c: () => { for (let n = 1; n <= 200; n++) if (n % b === 0 && n % a !== 0) return true; return false; },
          j: `La réciproque est « si ${M('n')} est un multiple de ${M(b)}, alors ${M('n')} est un multiple de ${M(a)} » : contre-exemple ${M(`n=${b}`)}, multiple de ${M(b)} mais pas de ${M(a)}.` });
      }
      if (kind === 'recipt') {
        const p = r.pick([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]);
        return tf({ s: `La réciproque de « si ${M('n')} est un multiple de ${M(p)}, alors ${M('n^{2}')} est un multiple de ${M(p)} » est vraie.`, v: true, c: () => Array.from({ length: 300 }, (_, i) => i + 1).every((n) => (n * n) % p !== 0 || n % p === 0),
          j: `Si ${M(`n^{2}`)} est un multiple du nombre premier ${M(p)}, alors ${M(p)} divise ${M('n\\times n')} donc divise ${M('n')} : la réciproque est vraie.` });
      }
      const m = r.int(1, 45), yes = r.next() < 0.5, k = yes ? m * (m + 1) : m * (m + 1) + r.pick([1, 2, 3].filter((d) => true)), ex = Array.from({ length: 60 }, (_, i) => i).some((n) => n * n + n === k);
      return tf({ s: `Il existe un entier naturel ${M('n')} tel que ${M(`n^{2}+n=${k}`)}.`, v: ex, c: () => ex === Array.from({ length: 200 }, (_, i) => i).some((n) => n * n + n === k),
        j: ex ? `Pour ${M(`n=${m}`)} : ${M(`${m}^{2}+${m}=${m * m}+${m}=${k}`)}.` : `${M('n^{2}+n=n(n+1)')} est un produit de deux entiers consécutifs : ${M(`${m * (m + 1)}`)} puis ${M(`${(m + 1) * (m + 2)}`)} encadrent ${M(k)} sans l’atteindre.` });
    } },

  { id: 's4-reason-error', cls: C, chapter: 'seconde-13', domain: 'nombres', skill: 'Trouver l’erreur dans un raisonnement', fast: false,
    make(r, level) {
      if (r.next() < 0.5) {
        const [a, b] = r.pick([[6, 2], [6, 3], [12, 4], [12, 6], [10, 5], [8, 4], [15, 5], [18, 6], [20, 4]]), t = r.int(2, 6), mm = b * t;
        if (mm % a === 0) return this.make(r, level);
        return spot(`Un élève veut montrer que ${M(mm)} est un multiple de ${M(a)}.`, [`On sait que tout multiple de ${M(a)} est un multiple de ${M(b)}`, `${M(mm)} est un multiple de ${M(b)} : ${M(`${mm}=${b}\\times ${t}`)}`, `donc ${M(mm)} est un multiple de ${M(a)}`], 2,
          'il utilise la réciproque de la propriété, qui n’est pas vraie.', `la propriété ne permet pas de conclure ; il faut tester la division : ${M(`${mm}\\div ${a}`)} n’est pas entier`, `${M(mm)} n’est pas un multiple de ${M(a)}`, () => mm % b === 0 && mm % a !== 0 && a % b === 0);
      }
      const p = r.pick([5, 11, 17, 41]), cap = Math.min(p - 2, 9), ns = r.shuffle(Array.from({ length: cap + 1 }, (_, i) => i)).slice(0, 3).sort((x, y) => x - y), f = (n) => n * n + n + p;
      if (!ns.every((n) => isPrime(f(n)))) return this.make(r, level);
      return spot(`Un élève affirme que ${M(`n^{2}+n+${p}`)} est premier pour tout entier naturel ${M('n')}.`, [ns.map((n) => `${M(`n=${n}`)} : ${M(f(n))}`).join(', '), `les nombres ${ns.map((n) => M(f(n))).join(', ')} sont premiers`, `donc ${M(`n^{2}+n+${p}`)} est premier pour tout ${M('n')}`], 2,
        `quelques vérifications ne prouvent pas une propriété universelle. Contre-exemple : ${M(`n=${p - 1}`)} donne ${M(`${p - 1}^{2}+${p - 1}+${p}=${p * p}`)}.`, 'un seul contre-exemple suffit à réfuter la propriété', `l’affirmation est fausse (${M(`${p * p}=${p}\\times ${p}`)} n’est pas premier)`,
        () => ns.every((n) => isPrime(f(n))) && !isPrime(f(p - 1)) && f(p - 1) === p * p);
    } },

  { id: 's4-reason-proof', cls: C, chapter: 'seconde-13', domain: 'nombres', skill: 'Démontrer une propriété par le calcul', fast: false,
    make(r, level) {
      if (r.next() < 0.5) {
        const a = r.int(1, 60);
        return { q: `Montrer que, pour tout entier ${M('n')}, ${M(`(n+${a})^{2}-(n-${a})^{2}`)} est un multiple de ${M(4 * a)}.`, a: `${M(`(n+${a})^{2}-(n-${a})^{2}=(n^{2}+${2 * a}n+${a * a})-(n^{2}-${2 * a}n+${a * a})=${4 * a}n=${4 * a}\\times n`)} : c’est un multiple de ${M(4 * a)}.`, s: 'Développer les deux carrés.',
          ok: () => Array.from({ length: 40 }, (_, n) => n).every((n) => (n + a) ** 2 - (n - a) ** 2 === 4 * a * n && ((n + a) ** 2 - (n - a) ** 2) % (4 * a) === 0) };
      }
      const m = r.int(1, 60);
      return { q: `Montrer que, pour tout entier ${M('n')}, ${M(`n(n+${2 * m})+${m * m}`)} est le carré d’un entier.`, a: `${M(`n(n+${2 * m})+${m * m}=n^{2}+${2 * m}n+${m * m}=(n+${m})^{2}`)}, carré de l’entier ${M(`n+${m}`)}.`, s: 'Reconnaître une identité remarquable.',
        ok: () => Array.from({ length: 40 }, (_, n) => n).every((n) => n * (n + 2 * m) + m * m === (n + m) ** 2) };
    } },

  // ============================ 14 Probabilités ============================
  { id: 's4-proba-qcm', cls: C, chapter: 'seconde-14', domain: 'stats-proba', skill: 'QCM de probabilités', fast: true,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['union', 'dice'] : ['union', 'dice', 'atleast']);
      if (kind === 'union') {
        const N = r.int(20, 60), a = r.int(5, 15), b = r.int(5, 15), i = r.int(1, Math.min(a, b) - 1), A = new Set(Array.from({ length: a }, (_, k) => k)), B = new Set(Array.from({ length: b }, (_, k) => a - i + k)), un = new Set([...A, ...B]);
        return qcmNum(r, `Une urne contient ${M(N)} boules numérotées. ${M('A')} compte ${M(a)} boules, ${M('B')} en compte ${M(b)} et ${M(i)} boules sont dans ${M('A')} et dans ${M('B')}. ${M('P(A\\cup B)')} vaut :`, [F(a + b - i, N), `${M(`P(A\\cup B)=\\dfrac{${a}+${b}-${i}}{${N}}`)} : on retranche une fois les boules comptées deux fois.`],
          [[F(a + b, N), 'additionne sans retrancher l’intersection.'], [F(a + b + i, N), 'ajoute l’intersection au lieu de la retrancher.'], [F(i, N), 'donne ' + M('P(A\\cap B)') + '.'], [mul(F(a, N), F(b, N)), 'multiplie les probabilités.']], (w) => M(fracTex(w)), (w) => eq(w, F(un.size, N)));
      }
      if (kind === 'dice') {
        const s = r.int(3, 11), cnt = Array.from({ length: 6 }, (_, x) => Array.from({ length: 6 }, (_, y) => x + y + 2)).flat().filter((v) => v === s).length;
        return qcmNum(r, `On lance deux dés équilibrés à six faces. La probabilité que la somme soit ${M(s)} est :`, [F(cnt, 36), `il y a ${M(cnt)} couples de somme ${M(s)} parmi les ${M(36)} couples équiprobables.`],
          [[F(1, 11), 'suppose que les 11 sommes possibles sont équiprobables.'], [F(cnt, 12), 'compte les couples parmi 12 issues (6 + 6).'], [F(1, 36), 'ne compte qu’un seul couple.'], [F(Math.min(s - 1, 12 - s + 1) + 1, 36), 'se trompe d’une unité dans le nombre de couples.']], (w) => M(fracTex(w)),
          (w) => { let c = 0; for (let x = 1; x <= 6; x++) for (let y = 1; y <= 6; y++) if (x + y === s) c++; return eq(w, F(c, 36)); });
      }
      const f = r.pick([4, 6, 8]), n = r.int(2, 3), good = sub(F(1), F((f - 1) ** n, f ** n));
      return qcmNum(r, `On lance ${M(n)} fois un dé équilibré à ${M(f)} faces. La probabilité d’obtenir au moins une fois la face ${M(f)} est :`, [good, `événement contraire : aucune face ${M(f)}, de probabilité ${M(`\\left(\\dfrac{${f - 1}}{${f}}\\right)^{${n}}`)} ; donc ${M(`1-\\left(\\dfrac{${f - 1}}{${f}}\\right)^{${n}}`)}.`],
        [[F((f - 1) ** n, f ** n), 'donne la probabilité de l’événement contraire.'], [F(n, f), 'additionne les probabilités sans tenir compte des cas communs.'], [F(1, f ** n), 'donne la probabilité de n’obtenir que des faces ' + M(f) + '.'], [sub(F(1), F(n * (f - 1), f ** n)), 'se trompe dans le calcul de l’événement contraire.']], (w) => M(fracTex(w)),
        (w) => { let c = 0; const tot = f ** n; for (let k = 0; k < tot; k++) { let z = k, has = false; for (let j = 0; j < n; j++) { if (z % f === f - 1) has = true; z = Math.floor(z / f); } if (has) c++; } return eq(w, F(c, tot)); });
    } },

  { id: 's4-proba-tf', cls: C, chapter: 'seconde-14', domain: 'stats-proba', skill: 'Vrai ou faux : événements incompatibles', fast: false,
    make(r, level) {
      const f = r.pick([6, 8, 10, 12, 20]), ev = EVENTS(f), [e1, e2] = r.shuffle(ev).slice(0, 2), U = Array.from({ length: f }, (_, i) => i + 1), common = U.filter((n) => e1[1](n) && e2[1](n));
      return tf({ s: `On lance un dé équilibré à ${f} faces numérotées de 1 à ${f}. Les événements « le numéro est ${e1[0]} » et « le numéro est ${e2[0]} » sont incompatibles.`, v: common.length === 0, c: () => (U.filter((n) => e1[1](n)).filter((n) => e2[1](n)).length === 0) === (common.length === 0),
        j: common.length === 0 ? `Aucune face ne réalise les deux événements : leur intersection est vide.` : `${common.length === 1 ? 'La face' : 'Les faces'} ${M(common.join(' ; '))} ${common.length === 1 ? 'réalise' : 'réalisent'} les deux événements : l’intersection n’est pas vide.` });
    } },

  { id: 's4-proba-error', cls: C, chapter: 'seconde-14', domain: 'stats-proba', skill: 'Trouver l’erreur sur un arbre pondéré', fast: false,
    make(r, level) {
      const pA = F(r.int(1, 9), 10), pBA = F(r.int(1, 9), 10), pBN = F(r.int(1, 9), 10), nA = sub(F(1), pA), kind = r.pick([0, 1]);
      const iA = mul(pA, pBA), iN = mul(nA, pBN), good = add(iA, iN);
      const lines = kind === 0 ? [M(`P(A\\cap B)=P(A)\\times P_A(B)=${fracTex(pA)}\\times ${fracTex(pBA)}=${fracTex(iA)}`), M(`P(\\overline{A}\\cap B)=P(\\overline{A})\\times P_{\\overline{A}}(B)=${fracTex(nA)}\\times ${fracTex(pBN)}=${fracTex(iN)}`), M(`P(B)=P_A(B)+P_{\\overline{A}}(B)=${fracTex(add(pBA, pBN))}`)]
        : [M(`P(A\\cap B)=P(A)+P_A(B)=${fracTex(pA)}+${fracTex(pBA)}=${fracTex(add(pA, pBA))}`), M(`P(\\overline{A}\\cap B)=${fracTex(nA)}\\times ${fracTex(pBN)}=${fracTex(iN)}`), M(`P(B)=${fracTex(add(pA, pBA))}+${fracTex(iN)}=${fracTex(add(add(pA, pBA), iN))}`)];
      const wrongB = kind === 0 ? add(pBA, pBN) : add(add(pA, pBA), iN);
      if (eq(wrongB, good)) return this.make(r, level);
      return spot(`${M('A')} a pour probabilité ${M(fracTex(pA))} ; sachant ${M('A')}, ${M('B')} a pour probabilité ${M(fracTex(pBA))} ; sachant ${M('\\overline{A}')}, ${M('B')} a pour probabilité ${M(fracTex(pBN))}. Un élève calcule ${M('P(B)')}.`, lines, kind === 0 ? 2 : 0,
        kind === 0 ? 'la formule des probabilités totales additionne les probabilités des chemins ' + M('P(A\\cap B)') + ' et ' + M('P(\\overline{A}\\cap B)') + ', pas les probabilités conditionnelles.' : 'la probabilité d’un chemin est le produit des probabilités le long des branches.',
        kind === 0 ? M(`P(B)=P(A\\cap B)+P(\\overline{A}\\cap B)=${fracTex(iA)}+${fracTex(iN)}`) : M(`P(A\\cap B)=${fracTex(pA)}\\times ${fracTex(pBA)}=${fracTex(iA)}`), M(`P(B)=${fracTex(good)}`),
        () => eq(good, add(mul(pA, pBA), mul(sub(F(1), pA), pBN))) && !eq(wrongB, good));
    } },

  { id: 's4-proba-draws', cls: C, chapter: 'seconde-14', domain: 'stats-proba', skill: 'Tirages successifs sans remise', fast: false,
    make(r, level) {
      const nr = r.int(2, 14), nb = r.int(2, 14), n = nr + nb, balls = [...Array(nr).fill('R'), ...Array(nb).fill('B')];
      const enumerate = (pred) => { let c = 0, t = 0; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j) { t++; if (pred(balls[i], balls[j])) c++; } return F(c, t); };
      const base = `Une urne contient ${M(nr)} boules rouges et ${M(nb)} boules bleues indiscernables. On tire successivement deux boules sans remise.`;
      if (level === 1) { const p = mul(F(nr, n), F(nr - 1, n - 1)); return { q: `${base} Quelle est la probabilité de tirer deux boules rouges ?`, a: `${M(`P=\\dfrac{${nr}}{${n}}\\times\\dfrac{${nr - 1}}{${n - 1}}=${fracTex(p)}`)}.`, ok: () => eq(p, enumerate((a, b) => a === 'R' && b === 'R')) }; }
      if (level === 2) { const p = add(mul(F(nr, n), F(nr - 1, n - 1)), mul(F(nb, n), F(nb - 1, n - 1))); return { q: `${base} Quelle est la probabilité que les deux boules soient de la même couleur ?`, a: `${M(`P=\\dfrac{${nr}\\times ${nr - 1}}{${n}\\times ${n - 1}}+\\dfrac{${nb}\\times ${nb - 1}}{${n}\\times ${n - 1}}=${fracTex(p)}`)}.`, ok: () => eq(p, enumerate((a, b) => a === b)) }; }
      const p = sub(F(1), mul(F(nb, n), F(nb - 1, n - 1)));
      return { q: `${base} Quelle est la probabilité d’obtenir au moins une boule rouge ? Justifier avec l’événement contraire.`, a: `Contraire : deux boules bleues, de probabilité ${M(`\\dfrac{${nb}}{${n}}\\times\\dfrac{${nb - 1}}{${n - 1}}=${fracTex(mul(F(nb, n), F(nb - 1, n - 1)))}`)}. Donc ${M(`P=1-${fracTex(mul(F(nb, n), F(nb - 1, n - 1)))}=${fracTex(p)}`)}.`, ok: () => eq(p, enumerate((a, b) => a === 'R' || b === 'R')) };
    } },

  // ============================ 15 Consolidation et transition ============================
  { id: 's4-trans-qcm', cls: C, chapter: 'seconde-15', domain: 'fonctions', skill: 'QCM : forme canonique, taux d’accroissement', fast: true,
    make(r, level) {
      const kind = r.pick(level === 1 ? ['canon', 'line'] : ['canon', 'rate', 'line']);
      if (kind === 'canon') {
        const b = 2 * r.nz(-5, 5), c = r.int(-9, 9), h = b / 2, k = c - h * h;
        return qcmNum(r, `La forme canonique de ${M(`x^{2}${sgn(b)}x${sgn(c)}`.replace('+0', ''))} est :`, [{ h, k }, `${M(`x^{2}${sgn(b)}x=(x${sgn(h)})^{2}-${h * h}`)} donc ${M(canon(h, k))}.`],
          [[{ h, k: c }, 'oublie de retrancher ' + M(h * h) + ' après avoir complété le carré.'], [{ h: b, k: c - b * b }, 'écrit ' + M(`(x${sgn(b)})^{2}`) + ' sans diviser ' + M('b') + ' par 2.'], [{ h: -h, k }, 'se trompe de signe dans le carré.'], [{ h, k: c + h * h }, 'ajoute ' + M(h * h) + ' au lieu de le retrancher.']], (w) => M(canon(w.h, w.k)),
          (w) => [-3, -1, 0, 2, 5].every((x) => (x + w.h) ** 2 + w.k === x * x + b * x + c));
      }
      if (kind === 'rate') {
        const a = r.nz(-3, 3), b = r.int(-5, 5), c = r.int(-5, 5), p = r.int(-4, 2), q = p + r.int(1, 4), f = (x) => a * x * x + b * x + c;
        return qcmNum(r, `Soit ${M(`f(x)=${polyTex([a, b, c])}`)}. Le taux d’accroissement de ${M('f')} entre ${M(p)} et ${M(q)} est :`, [(f(q) - f(p)) / (q - p), `${M(`\\dfrac{f(${q})-f(${p})}{${q}-${par(p)}}=\\dfrac{${f(q)}-${par(f(p))}}{${q - p}}`)}.`],
          [[f(q) - f(p), 'oublie de diviser par ' + M(q - p) + '.'], [(f(q) + f(p)) / (q + p || 1), 'additionne au lieu de soustraire.'], [a * (q - p) + b, 'écrit ' + M('a(q-p)+b') + ' au lieu de ' + M('a(q+p)+b') + '.'], [a * (q + p), 'oublie le terme ' + M('b') + '.']], (w) => M(fr1(Math.round(w * 1e6) / 1e6)), (w) => Math.abs(w - (f(q) - f(p)) / (q - p)) < 1e-9);
      }
      const m = F(r.nz(-4, 4), r.int(1, 3)), P = [r.int(-4, 4), r.int(-4, 4)], p = sub(F(P[1]), mul(m, F(P[0])));
      return qcmNum(r, `La droite de coefficient directeur ${M(fracTex(m))} passant par ${M(`P(${P[0]}\\,;\\,${P[1]})`)} a pour ordonnée à l’origine :`, [p, `${M(`p=y_P-m\\,x_P=${P[1]}-${parT(fracTex(m))}\\times ${par(P[0])}`)}.`],
        [[add(F(P[1]), mul(m, F(P[0]))), 'ajoute ' + M('m\\,x_P') + ' au lieu de le retrancher.'], [F(P[1]), 'prend l’ordonnée du point.'], [sub(mul(m, F(P[0])), F(P[1])), 'inverse la différence.'], [div(F(P[1]), m), 'divise l’ordonnée par le coefficient directeur.']], (w) => M(fracTex(w)), (w) => eq(add(mul(m, F(P[0])), w), F(P[1])));
    } },

  { id: 's4-trans-tf', cls: C, chapter: 'seconde-15', domain: 'fonctions', skill: 'Vrai ou faux : minimum et taux d’accroissement', fast: false,
    make(r, level) {
      if (r.next() < 0.5) {
        const b = 2 * r.nz(-5, 5), c = r.int(-6, 6), f = (x) => x * x - b * x + c, yes = r.next() < 0.5, claim = yes ? b / 2 : r.pick([b, -b / 2, b / 2 + 1]);
        const grid = Array.from({ length: 81 }, (_, i) => -10 + i * 0.25), best = grid.reduce((u, v) => (f(v) < f(u) ? v : u), grid[0]), ok = best === claim;
        return tf({ s: `La fonction ${M(`f:x\\mapsto ${polyTex([1, -b, c])}`)} atteint son minimum en ${M(`x=${fr1(claim)}`)}.`, v: ok, c: () => ok === (claim === b / 2), j: ok ? `${M(`f(x)=${canon(-b / 2, c - (b / 2) ** 2)}`)} : le minimum est atteint quand le carré s’annule, en ${M(`x=${fr1(b / 2)}`)}.` : `Le minimum est atteint en ${M(`x=${fr1(b / 2)}`)} : ${M(`f(${fr1(b / 2)})=${fr1(f(b / 2))}`)} est plus petit que ${M(`f(${fr1(claim)})=${fr1(f(claim))}`)}.` });
      }
      const a = r.nz(-3, 3), b = r.int(-4, 4), p = r.int(-3, 2), q = p + r.int(1, 4), yes = r.next() < 0.5, true_ = a * (p + q) + b, claim = yes ? true_ : true_ + r.pick([1, -1, a]), ok = claim === true_, f = (x) => a * x * x + b * x;
      return tf({ s: `Le taux d’accroissement de ${M(`f:x\\mapsto ${polyTex([a, b, 0])}`)} entre ${M(p)} et ${M(q)} vaut ${M(claim)}.`, v: ok, c: () => ok === ((f(q) - f(p)) / (q - p) === claim),
        j: `${M(`\\dfrac{f(${q})-f(${p})}{${q}-${par(p)}}=\\dfrac{${f(q)}-${par(f(p))}}{${q - p}}=${true_}`)}${ok ? '.' : `, et non ${M(claim)}.`}` });
    } },

  { id: 's4-trans-error', cls: C, chapter: 'seconde-15', domain: 'fonctions', skill: 'Trouver l’erreur sur une forme canonique', fast: false,
    make(r, level) {
      if (r.next() < 0.5) {
        const b = 2 * r.nz(-5, 5), c = r.nz(-9, 9), h = b / 2, k = c - h * h;
        if (k === c) return this.make(r, level);
        return spot(`Un élève met ${M(`x^{2}${sgn(b)}x${sgn(c)}`)} sous forme canonique.`, [M(`x^{2}${sgn(b)}x${sgn(c)}=(x^{2}${sgn(b)}x)${sgn(c)}`), M(`x^{2}${sgn(b)}x=(x${sgn(h)})^{2}-${h * h}`), M(`\\text{donc }x^{2}${sgn(b)}x${sgn(c)}=${canon(h, c)}`)], 2,
          `la ligne (L2) donne ${M(`(x${sgn(h)})^{2}-${h * h}`)} : on ne peut pas oublier le terme ${M(`-${h * h}`)} en ajoutant ${M(c)}.`, M(`x^{2}${sgn(b)}x${sgn(c)}=(x${sgn(h)})^{2}-${h * h}${sgn(c)}`), M(`${canon(h, k)}`),
          () => [-3, 0, 1, 4].every((x) => (x + h) ** 2 + k === x * x + b * x + c) && ![-3, 0, 1, 4].every((x) => (x + h) ** 2 + c === x * x + b * x + c));
      }
      const a = r.nz(-3, 3), b = r.int(-4, 4), p = r.int(-3, 2), q = p + r.int(2, 4), f = (x) => a * x * x + b * x, good = (f(q) - f(p)) / (q - p), bad = (f(q) - f(p)) / (q + p || 1);
      if (q + p === 0 || bad === good) return this.make(r, level);
      return spot(`Un élève calcule le taux d’accroissement de ${M(`f(x)=${polyTex([a, b, 0])}`)} entre ${M(p)} et ${M(q)}.`, [M(`f(${p})=${f(p)}\\text{ et }f(${q})=${f(q)}`), M(`t=\\dfrac{f(${q})-f(${p})}{${q}+${par(p)}}=\\dfrac{${f(q) - f(p)}}{${q + p}}`), M(`t=${fr1(Math.round(bad * 1e6) / 1e6)}`)], 1,
        `le dénominateur est la différence des abscisses ${M(`${q}-${par(p)}=${q - p}`)}, pas leur somme.`, M(`t=\\dfrac{${f(q) - f(p)}}{${q - p}}`), M(`t=${good}`), () => (f(q) - f(p)) / (q - p) === good && bad !== good);
    } },

  { id: 's4-trans-fence', cls: C, chapter: 'seconde-15', domain: 'fonctions', skill: 'Optimiser une aire (rectangle à périmètre fixé)', fast: false,
    make(r, level) {
      const k = r.int(2, 150);
      if (level < 3) { const P = 4 * k, area = (x) => x * (P / 2 - x), best = Math.max(...Array.from({ length: P / 2 + 1 }, (_, i) => area(i)));
        return { q: `Un enclos rectangulaire a un périmètre de ${M(`${P}\\ \\text{m}`)}. On note ${M('x')} la longueur d’un côté. Exprimer l’aire en fonction de ${M('x')}, puis déterminer les dimensions qui rendent l’aire maximale.`, a: `Le demi-périmètre est ${M(P / 2)} : l’autre côté vaut ${M(`${P / 2}-x`)} et ${M(`A(x)=x(${P / 2}-x)=-(x-${k * 1 * 1 === P / 4 ? k : P / 4})^{2}+${k * k}`)}. Maximum ${M(`${k * k}\\ \\text{m}^{2}`)} pour ${M(`x=${k}`)} : l’enclos est un carré de côté ${M(`${k}\\ \\text{m}`)}.`, s: 'Écrire l’aire sous forme canonique.',
          ok: () => best === k * k && area(k) === best && Array.from({ length: P / 2 + 1 }, (_, i) => i).every((x) => area(x) <= k * k) && P / 4 === k }; }
      const L = 4 * k, area = (x) => x * (L - 2 * x), best = Math.max(...Array.from({ length: L + 1 }, (_, i) => area(i / 2)));
      return { q: `Un éleveur dispose de ${M(`${L}\\ \\text{m}`)} de clôture pour enclore un pré rectangulaire adossé à un mur (le côté le long du mur n’est pas clôturé). On note ${M('x')} la longueur des deux côtés perpendiculaires au mur. Quelle aire maximale peut-il enclore, et pour quelles dimensions ?`,
        a: `Le côté parallèle au mur mesure ${M(`${L}-2x`)} et ${M(`A(x)=x(${L}-2x)=-2(x-${k})^{2}+${2 * k * k}`)}. Maximum ${M(`${2 * k * k}\\ \\text{m}^{2}`)} pour ${M(`x=${k}`)} : dimensions ${M(`${k}\\ \\text{m}\\times ${2 * k}\\ \\text{m}`)}.`,
        ok: () => best === 2 * k * k && area(k) === best && L - 2 * k === 2 * k };
    } },
];
