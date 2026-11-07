// Maths expertes templates; same contract as templates-seconde.js. Chapter ids: content/data/manifest.json.
import { F, add, sub, mul, div, val, eq, M, R, fracTex, numTex, sgn, par, gcd, isPrime, powMod, sqrtParts, sqrtTex } from './engine.js';
import { exactCosSin, piTex } from './templates-premiere.js';

const C = 'expertes';
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
const cmul = ([a, b], [c, d]) => [a * c - b * d, a * d + b * c];
// integer complex number a+bi
const cplx = (a, b) => { const im = b === 0 ? '' : (b < 0 ? '-' : (a === 0 ? '' : '+')) + (Math.abs(b) === 1 ? '' : Math.abs(b)) + 'i'; return a === 0 && b === 0 ? '0' : (a === 0 ? '' : `${a}`) + im; };
// complex number with fractional parts
const cplxF = (x, y) => { if (y.n === 0) return fracTex(x); const ay = F(Math.abs(y.n), y.d); const im = (y.n < 0 ? '-' : (x.n === 0 ? '' : '+')) + (eq(ay, F(1)) ? '' : fracTex(ay)) + 'i'; return (x.n === 0 ? '' : fracTex(x)) + im; };
const eq2 = (a, b) => { const t = (k, v) => (k === 0 ? '' : (k < 0 ? '-' : '') + (Math.abs(k) === 1 ? '' : Math.abs(k)) + v); const x = t(a, 'x'), y = t(b, 'y'); return x && y ? x + (b < 0 ? y : '+' + y) : x || y || '0'; };
const mat = (m) => `\\begin{pmatrix}${m.map((row) => row.join('&')).join('\\\\')}\\end{pmatrix}`;
const matF = (m) => mat(m.map((row) => row.map(fracTex)));
const mm = (A, B) => A.map((row) => B[0].map((_, j) => row.reduce((s, x, k) => s + x * B[k][j], 0)));
const egcd = (a, b) => { if (b === 0) return [a, 1, 0]; const [g, x, y] = egcd(b, a % b); return [g, y, x - Math.floor(a / b) * y]; };
const scaleExact = (t, r) => { const neg = t.startsWith('-'), b = neg ? t.slice(1) : t; let out; if (b === '0') return '0'; if (b === '1') out = `${r}`; else if (b === '\\dfrac{1}{2}') out = `${r / 2}`; else if (b === '\\dfrac{\\sqrt{2}}{2}') out = `${r / 2 === 1 ? '' : r / 2}\\sqrt{2}`; else out = `${r / 2 === 1 ? '' : r / 2}\\sqrt{3}`; return (neg ? '-' : '') + out; };
const exTex = (re, im) => (re === '0' ? '' : re) + (im === '0' ? '' : (im.startsWith('-') ? im : (re === '0' ? '' : '+') + im) + 'i') || '0';

export const expertes = [
  { id: 'e-complex-calc', cls: C, chapter: 'expertes-01', domain: 'complexes', skill: 'Calculs avec les nombres complexes', fast: true,
    make(r, level) {
      const a = r.int(-6, 6), b = r.nz(-6, 6), c = r.int(-6, 6), d = r.nz(-6, 6), z = `(${cplx(a, b)})`, w = `(${cplx(c, d)})`;
      if (level === 1) { const op = r.pick(['+', '-']); const res = op === '+' ? [a + c, b + d] : [a - c, b - d]; return { q: `Calculer ${M(`${z}${op}${w}`)}.`, a: M(cplx(...res)), ok: () => (op === '+' ? a + c : a - c) === res[0] }; }
      if (level === 2) { const [x, y] = cmul([a, b], [c, d]); return { q: `Calculer ${M(`${z}${w}`)}.`, a: M(cplx(x, y)), ok: () => x === a * c - b * d && y === a * d + b * c }; }
      const n = c * c + d * d, x = F(a * c + b * d, n), y = F(b * c - a * d, n);
      return { q: `Écrire sous forme algébrique ${M(`\\dfrac{${cplx(a, b)}}{${cplx(c, d)}}`)}.`, a: M(`\\dfrac{${cplx(a, b)}}{${cplx(c, d)}}=\\dfrac{(${cplx(a, b)})(${cplx(c, -d)})}{${n}}=${cplxF(x, y)}`.replace(/\(\)/g, '')), s: 'On multiplie numérateur et dénominateur par le conjugué du dénominateur.',
        ok: () => { const back = [val(x) * c - val(y) * d, val(x) * d + val(y) * c]; return near(back[0], a) && near(back[1], b); } };
    } },
  { id: 'e-modulus-arg', cls: C, chapter: 'expertes-03', domain: 'complexes', skill: 'Module, argument, forme exponentielle', fast: true,
    make(r, level) {
      if (level < 3) {
        const dirs = [['1', '1', '\\sqrt{2}', 1, 1, 1, 4], ['-1', '1', '\\sqrt{2}', 1, 3, 1, 4], ['-1', '-1', '\\sqrt{2}', 1, -3, 1, 4], ['1', '-1', '\\sqrt{2}', 1, -1, 1, 4], ['1', '\\sqrt{3}', '2', 2, 1, 1, 3], ['-1', '\\sqrt{3}', '2', 2, 2, 1, 3], ['1', '-\\sqrt{3}', '2', 2, -1, 1, 3], ['\\sqrt{3}', '1', '2', 2, 1, 1, 6]];
        const nums = { '1': 1, '-1': -1, '\\sqrt{3}': Math.sqrt(3), '-\\sqrt{3}': -Math.sqrt(3) };
        const k = level === 1 ? r.int(1, 3) : r.int(2, 6), [x, y, modTex, modN, an, ad0, ad] = r.pick(dirs);
        const kx = (t) => (t === '1' ? `${k}` : t === '-1' ? `-${k}` : (k === 1 ? '' : k) + t.replace('1', '1')), kt = (t) => { const neg = t.startsWith('-'); const b = neg ? t.slice(1) : t; return (neg ? '-' : '') + (b === '1' ? `${k}` : (k === 1 ? '' : `${k}`) + b); };
        const re = kt(x), im = kt(y); const zt = `${re}${im.startsWith('-') ? '' : '+'}${im.replace(/^(-?)1?(\\sqrt)/, '$1$2')}i`;
        const modK = modN === 1 ? (k === 1 ? '\\sqrt{2}' : `${k}\\sqrt{2}`) : `${2 * k}`; const modNum = modN === 1 ? k * Math.SQRT2 : 2 * k;
        const arg = piTex(an, ad), xn = nums[x] * k, yn = nums[y] * k;
        return { q: `Déterminer le module et un argument de ${M(`z=${zt}`)}.`, a: M(`|z|=${modK}\\ ;\\ \\arg z\\equiv ${arg}\\ [2\\pi]`), ok: () => near(Math.hypot(xn, yn), modNum) && near(Math.atan2(yn, xn), (an * Math.PI) / ad, 1e-9) };
      }
      const rad = r.pick([2, 4]), u = r.pick([2, 3, 4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22]), ex = exactCosSin(u);
      const re = scaleExact(ex.cos, rad), im = scaleExact(ex.sin, rad);
      return { q: `Écrire sous forme algébrique ${M(`z=${rad}\\,\\mathrm{e}^{i\\,${u === 0 ? '0' : piTex(u, 12)}}`)}.`.replace('i\\,', 'i'), a: M(`z=${exTex(re, im)}`), ok: () => near(rad * ex.cosN, rad * Math.cos((u * Math.PI) / 12)) && near(rad * ex.sinN, rad * Math.sin((u * Math.PI) / 12)) };
    } },
  { id: 'e-gaussian-power', cls: C, chapter: 'expertes-03', domain: 'complexes', skill: 'Puissances de nombres complexes', fast: true,
    make(r, level) {
      const family = r.next() < 0.5 ? 'unit' : 'gauss';
      if (family === 'unit') {
        const n = level === 1 ? r.int(2, 4) : r.int(5, 20), s = r.sign(), base = [1, s];
        let p = [1, 0]; for (let i = 0; i < n; i++) p = cmul(p, base);
        const mod = Math.SQRT2 ** n, arg = (s * n * Math.PI) / 4;
        return { q: `Calculer ${M(`(${cplx(1, s)})^{${n}}`)} sous forme algébrique (on pourra utiliser la forme exponentielle).`, a: M(`(${cplx(1, s)})^{${n}}=${cplx(...p)}`), s: M(`${cplx(1, s)}=\\sqrt{2}\\,\\mathrm{e}^{${s < 0 ? '-' : ''}i\\pi/4}`), ok: () => near(p[0], mod * Math.cos(arg), 1e-6) && near(p[1], mod * Math.sin(arg), 1e-6) };
      }
      const a = r.nz(-3, 3), b = r.nz(-3, 3), n = level === 1 ? 2 : r.int(2, 4);
      let p = [1, 0]; for (let i = 0; i < n; i++) p = cmul(p, [a, b]);
      const mod = Math.hypot(a, b) ** n, arg = n * Math.atan2(b, a);
      return { q: `Calculer ${M(`(${cplx(a, b)})^{${n}}`)} sous forme algébrique.`, a: M(`(${cplx(a, b)})^{${n}}=${cplx(...p)}`), ok: () => near(p[0], mod * Math.cos(arg), 1e-9) && near(p[1], mod * Math.sin(arg), 1e-9) };
    } },
  { id: 'e-quad-complex', cls: C, chapter: 'expertes-04', domain: 'complexes', skill: 'Équations du second degré dans C', fast: false,
    make(r, level) {
      if (level < 3) {
        const b2 = r.int(-4, 4), m = level === 1 ? r.pick([1, 4, 9, 16]) : r.pick([2, 3, 5, 6, 7, 8, 12, 18]), [k, mr] = sqrtParts(m), b = 2 * b2, c = b2 * b2 + m;
        const roots = `${-b2 === 0 ? '' : -b2}${'\\pm '}${mr === 1 ? (k === 1 ? '' : k) : (k === 1 ? '' : k) + `\\sqrt{${mr}}`}i`;
        return { q: `Résoudre dans ${M('\\mathbb{C}')} : ${M(`z^{2}${b === 0 ? '' : sgn(b) + 'z'}${sgn(c)}=0`.replace('+1z', '+z').replace('-1z', '-z'))}.`, a: M(`\\Delta=${-4 * m}\\ ;\\ z=${roots.replace(/^\\pm/, '\\pm')}`), s: M(`\\Delta=${b * b - 4 * c}<0`), ok: () => { const [re, im] = [-b2, Math.sqrt(m)]; return near(re * re - im * im + b * re + c, 0, 1e-9) && near(2 * re * im + b * im, 0, 1e-9); } };
      }
      const a = r.pick([2, 3, -2]), b = r.int(-6, 6); let c = Math.floor((b * b) / (4 * a)) + 1; if (a < 0) c = Math.ceil((b * b) / (4 * a)) - 1; else c = Math.floor((b * b) / (4 * a)) + r.int(1, 4);
      if (a < 0) c = Math.ceil((b * b) / (4 * a)) - r.int(1, 4);
      const dl = b * b - 4 * a * c; const [k, m] = sqrtParts(-dl), den = 2 * Math.abs(a), g = gcd(k, den);
      const re = F(-b, 2 * a), num = `${k / g === 1 && m !== 1 ? '' : k / g}${m === 1 ? '' : `\\sqrt{${m}}`}`, imTex = den / g === 1 ? `${num || '1'}` : `\\dfrac{${num || '1'}}{${den / g}}`;
      return { q: `Résoudre dans ${M('\\mathbb{C}')} : ${M(`${polyQ(a, b, c)}=0`)}.`, a: M(`\\Delta=${dl}\\ ;\\ z=${re.n === 0 ? '' : fracTex(re)}\\pm ${imTex}\\,i`), ok: () => { const x = val(re), y = Math.sqrt(-dl) / (2 * Math.abs(a)); return near(a * (x * x - y * y) + b * x + c, 0, 1e-9) && near(a * 2 * x * y + b * y, 0, 1e-9) && dl < 0; } };
    } },
  { id: 'e-complex-geometry', cls: C, chapter: 'expertes-05', domain: 'complexes', skill: 'Géométrie avec les affixes', fast: false,
    make(r, level) {
      const a = [r.int(-5, 5), r.int(-5, 5)]; let b; do { b = [r.int(-5, 5), r.int(-5, 5)]; } while (b[0] === a[0] && b[1] === a[1]);
      const za = cplx(...a), zb = cplx(...b);
      if (level === 1) { const m = [F(a[0] + b[0], 2), F(a[1] + b[1], 2)]; return { q: `${M(`A`)} et ${M('B')} ont pour affixes ${M(`z_A=${za}`)} et ${M(`z_B=${zb}`)}. Calculer l’affixe de ${M('\\overrightarrow{AB}')} et celle du milieu de ${M('[AB]')}.`, a: M(`z_{\\overrightarrow{AB}}=${cplx(b[0] - a[0], b[1] - a[1])}\\ ;\\ z_I=${cplxF(m[0], m[1])}`), ok: () => val(m[0]) * 2 === a[0] + b[0] }; }
      if (level === 2) { const d2 = (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2; return { q: `${M('A')} et ${M('B')} ont pour affixes ${M(`z_A=${za}`)} et ${M(`z_B=${zb}`)}. Calculer la distance ${M('AB')}.`, a: M(`AB=|z_B-z_A|=|${cplx(b[0] - a[0], b[1] - a[1])}|=${sqrtTex(d2)}`), ok: () => near(Math.hypot(b[0] - a[0], b[1] - a[1]) ** 2, d2) }; }
      const quarter = r.pick([1, -1]), dz = [b[0] - a[0], b[1] - a[1]], rot = cmul(dz, [0, quarter]), img = [a[0] + rot[0], a[1] + rot[1]];
      return { q: `Soit ${M('\\Omega')} d’affixe ${M(`\\omega=${za}`)} et ${M('B')} d’affixe ${M(`z_B=${zb}`)}. Déterminer l’affixe de l’image ${M('B\'')} de ${M('B')} par la rotation de centre ${M('\\Omega')} et d’angle ${M(`${quarter < 0 ? '-' : ''}\\dfrac{\\pi}{2}`)}.`, a: M(`z'-\\omega=${quarter < 0 ? '-' : ''}i\\,(z_B-\\omega)\\ \\text{ donc }z'=${cplx(...img)}`), ok: () => near(Math.hypot(...rot), Math.hypot(...dz)) && near(dz[0] * rot[0] + dz[1] * rot[1], 0, 1e-9) };
    } },
  { id: 'e-congruence-power', cls: C, chapter: 'expertes-06', domain: 'arithmetique', skill: 'Congruences et puissances', fast: true, levels: [1, 2],
    make(r, level) {
      const n = r.int(5, level === 1 ? 9 : 13), a = r.int(2, n + 6), k = level === 1 ? r.int(5, 15) : r.int(20, 60);
      const res = powMod(a, k, n);
      return { q: `Déterminer le reste de la division euclidienne de ${M(`${a}^{${k}}`)} par ${M(n)}.`, a: M(`${a}^{${k}}\\equiv ${res}\\ [${n}]`), s: 'On cherche la période des restes des puissances successives.', ok: () => (BigInt(a) ** BigInt(k)) % BigInt(n) === BigInt(res) };
    } },
  { id: 'e-fermat-power', cls: C, chapter: 'expertes-08', domain: 'arithmetique', skill: 'Petit théorème de Fermat', fast: false, levels: [2, 3],
    make(r, level) {
      const p = r.pick(level === 2 ? [5, 7, 11] : [11, 13, 17]), a = r.int(2, p - 1), k = r.int(60, 400);
      const res = powMod(a, k % (p - 1), p);
      return { q: `Soit ${M(`p=${p}`)}, nombre premier. Déterminer le reste de la division de ${M(`${a}^{${k}}`)} par ${M(p)}.`, a: M(`${a}^{${p - 1}}\\equiv 1\\ [${p}]\\ ;\\ ${k}=${p - 1}\\times ${Math.floor(k / (p - 1))}+${k % (p - 1)}\\ ;\\ \\text{reste }${res}`), ok: () => (BigInt(a) ** BigInt(k)) % BigInt(p) === BigInt(res) };
    } },
  { id: 'e-congruence-eq', cls: C, chapter: 'expertes-06', domain: 'arithmetique', skill: 'Équations de congruence', fast: true,
    make(r, level) {
      const n = level === 1 ? r.pick([5, 7]) : level === 2 ? r.pick([8, 9, 10, 12]) : r.int(11, 17);
      let a; do { a = r.int(2, n - 1); } while (gcd(a, n) !== 1); const b = r.int(1, n - 1);
      const x = [...Array(n).keys()].find((t) => (a * t) % n === b % n);
      return { q: `Résoudre dans ${M('\\mathbb{Z}')} : ${M(`${a}x\\equiv ${b}\\ [${n}]`)}.`, a: M(`x\\equiv ${x}\\ [${n}]`), s: `${a} et ${n} sont premiers entre eux, donc ${a} est inversible modulo ${n}.`, ok: () => [...Array(n).keys()].filter((t) => (a * t) % n === b % n).length === 1 && (a * x) % n === b % n };
    } },
  { id: 'e-bezout', cls: C, chapter: 'expertes-07', domain: 'arithmetique', skill: 'PGCD, Bézout, équation diophantienne', fast: false,
    make(r, level) {
      let a, b, g;
      do { g = level === 1 ? 1 : r.int(2, 5); a = g * r.int(3, 12); b = g * r.int(3, 12); } while (a === b || gcd(a, b) !== g);
      const [gg, u, v] = egcd(a, b);
      if (level < 3) return { q: `Calculer le PGCD de ${M(a)} et ${M(b)} avec l’algorithme d’Euclide, puis déterminer un couple ${M('(u\\,;\\,v)')} d’entiers tel que ${M(`${a}u+${b}v=\\text{PGCD}(${a},${b})`)}.`, a: M(`\\text{PGCD}=${g}\\ ;\\ ${a}\\times ${par(u)}+${b}\\times ${par(v)}=${g}`) + ' (un couple parmi une infinité).', ok: () => gg === g && a * u + b * v === g };
      const mult = r.int(1, 4), c = g * mult, x0 = u * mult, y0 = v * mult, bp = b / g, ap = a / g;
      return { q: `Résoudre dans ${M('\\mathbb{Z}^{2}')} : ${M(`${a}x+${b}y=${c}`)}.`, a: M(`(x\\,;\\,y)=(${x0}+${bp}k\\,;\\,${y0}-${ap}k),\\ k\\in\\mathbb{Z}`) + ' (forme équivalente selon la solution particulière choisie).', ok: () => a * x0 + b * y0 === c && [-2, 0, 3].every((k) => a * (x0 + bp * k) + b * (y0 - ap * k) === c) };
    } },
  { id: 'e-prime-test', cls: C, chapter: 'expertes-08', domain: 'arithmetique', skill: 'Reconnaître un nombre premier', fast: true,
    make(r, level) {
      const lo = level === 1 ? 20 : 60, hi = level === 1 ? 100 : level === 2 ? 200 : 400;
      let n, wantPrime = r.next() < .5;
      do { n = r.int(lo, hi); } while (isPrime(n) !== wantPrime || (!wantPrime && level > 1 && [2, 3, 5].some((p) => n % p === 0)));
      const small = []; for (let p = 2; p * p <= n; p++) if (isPrime(p)) small.push(p);
      const d = small.find((p) => n % p === 0);
      return { q: `Le nombre ${M(n)} est-il premier ? Justifier.`, a: d ? `Non : ${M(`${n}=${d}\\times ${n / d}`)}.` : `Oui : aucun des nombres premiers ${M(`\\leqslant ${Math.floor(Math.sqrt(n))}`)} (${small.join(', ')}) ne divise ${M(n)}.`, ok: () => isPrime(n) === !d && (!d || n % d === 0) };
    } },
  { id: 'e-matrix-product', cls: C, chapter: 'expertes-09', domain: 'matrices', skill: 'Produit de matrices', fast: true,
    make(r, level) {
      const rnd = () => [[r.int(-3, 4), r.int(-3, 4)], [r.int(-3, 4), r.int(-3, 4)]];
      let A, B;
      do { A = rnd(); B = rnd(); } while (level === 3 && JSON.stringify(mm(A, B)) === JSON.stringify(mm(B, A)));
      if (level === 1) return { q: `Calculer ${M(`AB`)} avec ${M(`A=${mat(A)}`)} et ${M(`B=${mat(B)}`)}.`, a: M(`AB=${mat(mm(A, B))}`), ok: () => mm(A, B)[0][1] === A[0][0] * B[0][1] + A[0][1] * B[1][1] };
      if (level === 2) return { q: `Calculer ${M('A^{2}')} avec ${M(`A=${mat(A)}`)}.`, a: M(`A^{2}=${mat(mm(A, A))}`), ok: () => mm(A, A)[1][0] === A[1][0] * A[0][0] + A[1][1] * A[1][0] };
      return { q: `Calculer ${M('AB')} et ${M('BA')} avec ${M(`A=${mat(A)}`)} et ${M(`B=${mat(B)}`)}. Conclure.`, a: M(`AB=${mat(mm(A, B))}\\ ;\\ BA=${mat(mm(B, A))}\\ ;\\ AB\\neq BA`), ok: () => JSON.stringify(mm(A, B)) !== JSON.stringify(mm(B, A)) };
    } },
  { id: 'e-matrix-inverse', cls: C, chapter: 'expertes-09', domain: 'matrices', skill: 'Inverse et système', fast: false,
    make(r, level) {
      let a, b, c, d, det;
      do { a = r.int(-4, 5); b = r.int(-4, 5); c = r.int(-4, 5); d = r.int(-4, 5); det = a * d - b * c; } while (level === 1 ? Math.abs(det) !== 1 : det === 0);
      const inv = [[F(d, det), F(-b, det)], [F(-c, det), F(a, det)]], A = [[a, b], [c, d]];
      if (level < 3) { const sg = det > 0 ? 1 : -1, adj = [[d, -b], [-c, a]].map((row) => row.map((x) => x * sg)); return { q: `Montrer que ${M(`A=${mat(A)}`)} est inversible et calculer ${M('A^{-1}')}.`, a: M(`\\det A=${det}\\neq 0\\ ;\\ A^{-1}=${Math.abs(det) === 1 ? '' : `\\dfrac{1}{${Math.abs(det)}}`}${mat(adj)}`), ok: () => { const p = A.map((row) => [0, 1].map((j) => row.reduce((acc, x, k) => acc + x * val(inv[k][j]), 0))); return near(p[0][0], 1) && near(p[1][1], 1) && near(p[0][1], 0) && near(p[1][0], 0) && eq(inv[0][0], F(adj[0][0], Math.abs(det))); } }; }
      const x = r.int(-4, 4), y = r.int(-4, 4), e = a * x + b * y, f = c * x + d * y;
      return { q: `Résoudre le système ${M(`\\begin{cases}${eq2(a, b)}=${e}\\\\${eq2(c, d)}=${f}\\end{cases}`)} en utilisant une matrice inverse.`, a: M(`(x\\,;\\,y)=(${x}\\,;\\,${y})`), ok: () => a * x + b * y === e && c * x + d * y === f && Math.abs(det) > 0 };
    } },
  { id: 'e-markov', cls: C, chapter: 'expertes-11', domain: 'matrices', skill: 'Chaînes de Markov à deux états', fast: false,
    make(r, level) {
      const a = F(r.int(1, 9), 10), b = F(r.int(1, 9), 10), P = [[sub(F(1), a), a], [b, sub(F(1), b)]];
      const x0 = F(r.int(1, 9), 10), pi0 = [x0, sub(F(1), x0)];
      const step = (pi) => [add(mul(pi[0], P[0][0]), mul(pi[1], P[1][0])), add(mul(pi[0], P[0][1]), mul(pi[1], P[1][1]))];
      const head = `Une chaîne de Markov à deux états ${M('A')} et ${M('B')} a pour matrice de transition ${M(`P=${matF(P)}`)} (lignes : état de départ ; états dans l’ordre ${M('A')}, ${M('B')}).`;
      if (level === 1) { const p1 = step(pi0); return { q: `${head} L’état initial est ${M(`\\pi_0=\\left(${numTex(pi0[0])}\\ \\ ${numTex(pi0[1])}\\right)`)}. Calculer ${M('\\pi_1=\\pi_0P')}.`, a: M(`\\pi_1=\\left(${numTex(p1[0])}\\ \\ ${numTex(p1[1])}\\right)`), ok: () => near(val(p1[0]) + val(p1[1]), 1) }; }
      if (level === 2) { const p2 = step(step(pi0)); return { q: `${head} L’état initial est ${M(`\\pi_0=\\left(${numTex(pi0[0])}\\ \\ ${numTex(pi0[1])}\\right)`)}. Calculer ${M('\\pi_2')}.`, a: M(`\\pi_2=\\left(${numTex(p2[0])}\\ \\ ${numTex(p2[1])}\\right)`), ok: () => near(val(p2[0]) + val(p2[1]), 1) }; }
      const s = [div(b, add(a, b)), div(a, add(a, b))], again = step(s);
      return { q: `${head} Déterminer l’état stable ${M('\\pi=(x\\ \\ y)')} tel que ${M('\\pi P=\\pi')} et ${M('x+y=1')}.`, a: M(`\\pi=\\left(${fracTex(s[0])}\\ \\ ${fracTex(s[1])}\\right)`), ok: () => eq(again[0], s[0]) && eq(again[1], s[1]) && eq(add(s[0], s[1]), F(1)) };
    } },
  { id: 'e-graph', cls: C, chapter: 'expertes-10', domain: 'graphes', skill: 'Graphes, degrés, chaînes eulériennes', fast: false,
    make(r, level) {
      const n = 4 + (level > 1 ? 1 : 0); let A;
      for (;;) {
        A = Array.from({ length: n }, () => Array(n).fill(0));
        for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (r.next() < .55) A[i][j] = A[j][i] = 1;
        const seen = new Set([0]), stack = [0]; while (stack.length) { const u = stack.pop(); A[u].forEach((x, v) => { if (x && !seen.has(v)) { seen.add(v); stack.push(v); } }); }
        if (seen.size === n) break;
      }
      const letters = 'ABCDE'.slice(0, n).split(''), deg = A.map((row) => row.reduce((s, x) => s + x, 0)), edges = deg.reduce((s, x) => s + x, 0) / 2;
      const head = `Un graphe non orienté de sommets ${M(letters.join(',\\,'))} (dans cet ordre) a pour matrice d’adjacence ${M(`M=${mat(A)}`)}.`;
      if (level === 1) return { q: `${head} Donner le degré de chaque sommet et le nombre d’arêtes.`, a: M(`${letters.map((l, i) => `d(${l})=${deg[i]}`).join(',\\ ')}\\ ;\\ ${edges}\\ \\text{arêtes}`), ok: () => deg.reduce((s, x) => s + x, 0) === 2 * edges };
      const odd = deg.filter((x) => x % 2).length;
      if (level === 2) return { q: `${head} Ce graphe admet-il une chaîne eulérienne ? un cycle eulérien ?`, a: odd === 0 ? 'Il est connexe et tous les degrés sont pairs : il admet un cycle eulérien (donc une chaîne eulérienne).' : odd === 2 ? 'Il est connexe avec exactement deux sommets de degré impair : il admet une chaîne eulérienne, mais pas de cycle eulérien.' : `Il y a ${odd} sommets de degré impair : ni chaîne ni cycle eulérien.`, ok: () => odd % 2 === 0 };
      const A3 = mm(mm(A, A), A), i = r.int(0, n - 1); let j; do { j = r.int(0, n - 1); } while (j === i);
      return { q: `${head} Combien y a-t-il de chaînes de longueur 3 reliant ${M(letters[i])} à ${M(letters[j])} ?`, a: M(`\\left(M^{3}\\right)_{${letters[i]}${letters[j]}}=${A3[i][j]}`), ok: () => { let c = 0; for (let k = 0; k < n; k++) for (let l = 0; l < n; l++) c += A[i][k] * A[k][l] * A[l][j]; return c === A3[i][j]; } };
    } },
];

function polyQ(a, b, c) { return `${a === 1 ? '' : a === -1 ? '-' : a}z^{2}${b === 0 ? '' : sgn(b) + (Math.abs(b) === 1 ? '' : '').replace('', '') + 'z'}${sgn(c)}`.replace(/([+-])1z/, '$1z'); }
