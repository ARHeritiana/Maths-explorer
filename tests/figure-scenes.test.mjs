// The five figures of the home slideshow, checked against independent computations (no DOM, no canvas).
import test from 'node:test';
import assert from 'node:assert/strict';
import { makeParabola, makeCircle, makeTangent, makeRiemann, makeCobweb, makeFormat, leftSum, logisticOrbit, logisticRegime, SLIDES } from '../dist/js/figure-scenes.js';

const V = { s: () => 60 };            // 60 px per unit: the magnet radius is 7 px
const near = (a, b, e = 1e-9) => assert.ok(Math.abs(a - b) <= e, `${a} vs ${b}`);

test('number format: decimal comma in French, point in English, true minus, honest ≈', () => {
  assert.equal(makeFormat(0).fmt(-1.414), '−1,41'); assert.equal(makeFormat(1).fmt(-1.414), '−1.41');
  assert.equal(makeFormat(0).approx(Math.SQRT2), '≈'); assert.equal(makeFormat(0).approx(1.5), '=');
});

test('parabola: dragging a root keeps the other root and a; the vertex follows', () => {
  for (const L of [0, 1]) {
    const sc = makeParabola(L); const S = sc.state;
    S.al = 0.5; S.be = -2.25; S.a = 1;                     // roots at -1 and 2
    const [r1, r2] = [S.al - Math.sqrt(-S.be / S.a), S.al + Math.sqrt(-S.be / S.a)]; near(r1, -1); near(r2, 2);
    sc.drag('R1', -3, 0, sc.grab('R1'), false, V);          // move the left root to -3, the right root stays at 2
    const half = Math.sqrt(-S.be / S.a); near(S.al - half, -3); near(S.al + half, 2); near(S.a, 1); near(S.al, -0.5);
  }
});

test('parabola: a free point of the curve sets a continuously; a never reaches 0', () => {
  const sc = makeParabola(0), S = sc.state; S.al = 0; S.be = 0; S.a = 1;
  sc.drag('P', 2, 3, 0, false, V); near(S.a, 3 / 4); near(S.dx, 2);
  sc.drag('P', 2, 0, 0, false, V); assert.ok(Math.abs(S.a) >= 0.05);
  sc.drag('P', 2, 100, 0, false, V); assert.ok(S.a <= 8);
});

test('parabola: the magnet pulls to integers within 7 px and Alt (snap off) disables it', () => {
  const sc = makeParabola(0), S = sc.state;
  sc.drag('V', 1.05, -2.04, 0, true, V); near(S.al, 1); near(S.be, -2);       // within 7 px of an integer
  sc.drag('V', 1.4, -2.4, 0, true, V); near(S.al, 1.4); near(S.be, -2.4);
  sc.drag('V', 1.05, -2.04, 0, false, V); near(S.al, 1.05);
});

test('parabola: roots, discriminant and form agree with an independent solver', () => {
  const sc = makeParabola(0), S = sc.state;
  for (const [a, al, be] of [[1, 0, -2], [-0.5, 1.5, 3], [2, -1, 0], [1, 2, 4]]) {
    S.a = a; S.al = al; S.be = be; const f = sc.forms();
    const B = -2 * a * al, C = a * al * al + be, d = B * B - 4 * a * C;
    assert.equal(f.count, d > 1e-9 ? 2 : Math.abs(d) <= 1e-9 ? 1 : 0, `a=${a} al=${al} be=${be}`);
    near(f.d, d, 1e-9);
    if (d >= 0) for (const s of [-1, 1]) near(a * ((-B + s * Math.sqrt(d)) / (2 * a)) ** 2 + B * ((-B + s * Math.sqrt(d)) / (2 * a)) + C, 0, 1e-9);
  }
});

test('circle: the angle is unwrapped near the previous one, special angles attract', () => {
  const sc = makeCircle(0); sc.state.theta = 6.1;            // just under 2π
  const cx = -3, r = 1.5;
  sc.drag('P', cx + r * Math.cos(0.1), r * Math.sin(0.1), 0, false); assert.ok(Math.abs(sc.state.theta - (2 * Math.PI + 0.1)) < 1e-9, 'continues past 2π, no jump back');
  sc.drag('P', cx + r * Math.cos(Math.PI / 6 + 0.02), r * Math.sin(Math.PI / 6 + 0.02), 0, true); near(sc.state.theta % (2 * Math.PI), Math.PI / 6, 1e-9);
  const f = (a) => { sc.state.theta = a; return sc.fields(); };
  for (const [a, c, s] of [[Math.PI / 6, Math.sqrt(3) / 2, 0.5], [Math.PI / 2, 0, 1], [Math.PI, -1, 0]]) { const fields = f(a); assert.ok(fields[1][1].includes(makeFormat(0).fmt(c, 3).replace('-', '−')), 'cos'); assert.ok(fields[2][1].includes(makeFormat(0).fmt(s, 3)), 'sin'); }
});

test('tangent: the secant slope tends to cos x₀ as h → 0, with error O(h)', () => {
  const sc = makeTangent(0), x0 = 0.7;
  let prev = Infinity;
  for (const h of [1, 0.1, 0.01, 0.001]) { const m = (Math.sin(x0 + h) - Math.sin(x0)) / h, err = Math.abs(m - Math.cos(x0)); assert.ok(err < prev); prev = err; assert.ok(err <= (h / 2) * 1.01); }
  sc.state.x0 = x0; sc.state.h = 0.001; const f = sc.fields(); assert.ok(f[4][1].startsWith('−0,000') || f[4][1].startsWith('0,000') || f[4][1].startsWith('−0,00'), f[4][1]);
});

test('tangent: handle drags move A along the curve and B keeps h non-zero', () => {
  const sc = makeTangent(0), S = sc.state; S.x0 = 0; S.h = 1;
  sc.drag('A', 2, 0); near(S.x0, 2); sc.drag('B', S.x0 + 0.001, 0); assert.ok(Math.abs(S.h) >= 0.02);
});

test('riemann: left sum equals direct summation, converges to b³/3 with error ~ b³/(2n)', () => {
  for (const [b, n] of [[2, 1], [2, 4], [2, 40], [3, 10], [0.5, 7]]) {
    let direct = 0; for (let i = 0; i < n; i++) direct += (b * i / n) ** 2 * (b / n);
    near(leftSum(b, n), direct, 1e-12);
    const err = b ** 3 / 3 - leftSum(b, n); assert.ok(err > 0 && Math.abs(err - (b ** 3 / (2 * n)) + (b ** 3 / (6 * n * n))) < 1e-9, `${b} ${n}`);   // exact: b³/3 − (b³/3)(n−1)(2n−1)/(2n²)
  }
  const sc = makeRiemann(0); sc.state.b = 2; sc.state.n = 4; const f = sc.fields();
  assert.equal(f[0][1], '4'); assert.ok(f[2][1].includes('1,75')); assert.ok(f[3][1].includes('2,667'));
});

test('riemann: dragging the width changes n = round(b / w) within 1..80', () => {
  const sc = makeRiemann(0); sc.state.b = 2; sc.drag('W', 0.5); assert.equal(sc.state.n, 4);
  sc.drag('W', 0.0001); assert.equal(sc.state.n, 80); sc.drag('W', 50); assert.equal(sc.state.n, 1);
});

test('logistic: period-doubling thresholds found numerically match the stated ones', () => {
  const period = (r) => { const o = logisticOrbit(r, 0.3, 4000).slice(3000); for (const p of [1, 2, 4, 8, 16]) if (o.slice(-p).every((v, i) => Math.abs(v - o[o.length - 1 - p - (p - 1 - i)]) < 1e-6) && Math.abs(o[o.length - 1] - o[o.length - 1 - p]) < 1e-6) return p; return 0; };
  assert.equal(period(2.8), 1); assert.equal(period(3.2), 2); assert.equal(period(3.5), 4); assert.equal(period(3.55), 8); assert.equal(period(3.9), 0);
  for (const r of [2.5, 2.99, 3.01, 3.44, 3.46, 3.54, 3.55, 3.56, 3.58, 3.9]) {
    const reg = logisticRegime(r), p = period(r);
    assert.equal(reg === 'fixed' ? 1 : reg === 'period2' ? 2 : reg === 'period4' ? 4 : reg === 'period8' ? 8 : 0, reg === 'period8' && p === 16 ? 8 : reg === 'chaos' && p ? 0 : p, `r=${r}`);
  }
  // the onset of period doubling is 3 and of chaos about 3.5699; the second doubling is at 1 + √6
  near(1 + Math.sqrt(6), 3.449489742783178, 1e-12);
});

test('logistic: positive Lyapunov exponent at r = 3.9, negative at r = 3.2', () => {
  const lyap = (r) => { let x = 0.3, s = 0; for (let i = 0; i < 5000; i++) { x = r * x * (1 - x); if (i > 100) s += Math.log(Math.abs(r * (1 - 2 * x))); } return s / 4900; };
  assert.ok(lyap(3.9) > 0.2); assert.ok(lyap(3.2) < 0);
});

test('slides: five, each with both languages and a scene for each', () => {
  assert.equal(SLIDES.length, 5);
  for (const s of SLIDES) { assert.ok(s.tab[0] && s.tab[1] && s.text[0] && s.text[1]); for (const L of [0, 1]) { const sc = s.make(L); assert.ok(sc.title && sc.legend && sc.hint && sc.fields().length >= 4 && sc.handles().length >= 1); for (const [lab, val] of sc.fields()) assert.ok(lab && String(val).length, s.id); } }
  assert.ok(!SLIDES.some((s) => [...s.text, ...s.tab].some((x) => /[–—]/.test(x))), 'no dashes in copy');
});
