// The 3D GPU exhibits: hairy ball (zeros and Poincaré-Hopf), Banach-Tarski (exact free group, pieces, copies) and the matrix
// helpers of the shared WebGL2 stage. The GPU drawing itself is checked in the browser; everything it relies on is pure and tested here.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as H from '../dist/js/gallery/gallery-hairy-model.js';
import * as B from '../dist/js/gallery/gallery-banach-model.js';
import { perspective, lookAt, mul4, invert4, apply4, raySphere, rgb } from '../dist/js/gallery/gl3d.js';

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const unit = (a) => { const l = Math.hypot(...a); return a.map((x) => x / l); };

test('every preset field is tangent and its indices add up to χ(S²) = 2', () => {
  const expected = { dipole: [1, 1], vortex: [1, 1], single: [2], saddle: [-1, -1, 1, 1, 1, 1] };
  for (const [preset, indices] of Object.entries(expected)) {
    const st = { preset, strength: 1, strokes: [] };
    for (const p of H.geodesic(2).V) assert.ok(Math.abs(dot(H.field(st, p), p)) < 1e-12);
    const z = H.zeros(st);
    assert.equal(z.sum, 2, preset);
    assert.deepEqual(z.zeros.map((q) => q.index).sort((a, b) => a - b), indices, preset);
    for (const q of z.zeros) assert.ok(q.residual < 1e-12, `${preset} residual ${q.residual}`);
  }
});

test('the single-zero field vanishes only at the north pole, with index +2', () => {
  const z = H.zeros({ preset: 'single', strength: 1, strokes: [] });
  assert.equal(z.zeros.length, 1);
  assert.ok(dot(z.zeros[0].p, [0, 0, 1]) > 1 - 1e-12);
  // away from the pole the field is nonzero: |v| = (1 - z)·|...| > 0 on a fine mesh
  for (const p of H.geodesic(4).V) if (p[2] < 0.999) assert.ok(Math.hypot(...H.field({ preset: 'single', strength: 1 }, p)) > 1e-9);
});

test('parallel transport keeps a tangent vector tangent and its length', () => {
  const c = unit([0.3, -0.4, 0.8]), t = unit([0.8, 0.6, 0].map((x, i) => x - dot([0.8, 0.6, 0], c) * c[i]));
  for (const p of H.geodesic(2).V) {
    if (dot(c, p) < -0.9) continue;
    const q = H.transport(t, c, p);
    assert.ok(Math.abs(dot(q, p)) < 1e-12); assert.ok(Math.abs(Math.hypot(...q) - 1) < 1e-12);
  }
});

test('however it is combed, the indices still add up to 2', () => {
  let s = 12345; const rnd = () => (s = (s * 48271) % 2147483647) / 2147483647 - 0.5;
  for (let trial = 0; trial < 4; trial++) {
    const strokes = Array.from({ length: 40 }, () => { const c = unit([rnd(), rnd(), rnd()]), a = [rnd(), rnd(), rnd()], d = dot(a, c); return { c, t: unit(a.map((x, i) => x - d * c[i])) }; });
    const z = H.zeros({ preset: ['dipole', 'none', 'vortex', 'saddle'][trial], strength: 0.3, strokes });
    assert.equal(z.degenerate, false); assert.equal(z.sum, 2); assert.ok(z.zeros.length >= 1);
  }
  assert.equal(H.zeros({ preset: 'none', strength: 1, strokes: [] }).degenerate, true);
});

test('free group: exact rotations, all reduced words distinct, pieces and copies', () => {
  for (const n of [1, 2, 5, 7]) {
    const G = B.freeGroup(n);
    assert.equal(G.list.length, B.words(n));
    for (const l of B.LETTERS) assert.equal(G.list.filter((x) => x.first === l).length, B.pieceSize(n));
    assert.equal(B.distinctRotations(G), G.list.length);
    const c = B.copies(G); assert.ok(c.oneCovers && c.twoCovers);
    // floats agree with the exact entries
    G.list.forEach((x, i) => { const F = B.toFloat(G.exact[i], x.len).flat(); F.forEach((v, k) => assert.ok(Math.abs(v - G.float[i * 9 + k]) < 1e-5)); });
  }
  // the generators are rotations by arccos(1/3) about z and x
  const a = B.axisRotation(B.AXIS.a, B.THETA), b = B.axisRotation(B.AXIS.b, B.THETA);
  B.ROT.a.flat().forEach((v, k) => assert.ok(Math.abs(v - a[k]) < 1e-15)); B.ROT.b.flat().forEach((v, k) => assert.ok(Math.abs(v - b[k]) < 1e-15));
  assert.equal(B.moved('Aab'), 'ab'); assert.equal(B.moved('aB'), 'aB'); assert.equal(B.moved('B'), '');
});

test('stage matrices: inverse, projection of the target, ray hits the sphere', () => {
  const V = lookAt([4, 1, 2], [0, 0, 0], [0, 0, 1]), P = perspective(0.6, 1.5, 0.1, 50), M = mul4(P, V), I = mul4(M, invert4(M));
  I.forEach((v, k) => assert.ok(Math.abs(v - (k % 5 === 0 ? 1 : 0)) < 1e-12));
  const c = apply4(M, [0, 0, 0]); assert.ok(Math.abs(c[0] / c[3]) < 1e-12 && Math.abs(c[1] / c[3]) < 1e-12);
  const h = raySphere([4, 1, 2], unit([-4, -1, -2])); assert.ok(Math.abs(Math.hypot(...h) - 1) < 1e-12);
  assert.equal(raySphere([4, 0, 0], [0, 1, 0]), null);
  assert.deepEqual(rgb('#ffffff'), [1, 1, 1]); assert.deepEqual(rgb('nonsense', [0, 0, 0]), [0, 0, 0]);
});
