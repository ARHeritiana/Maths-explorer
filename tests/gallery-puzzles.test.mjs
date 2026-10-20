// Moving sofa, inscribed square and opaque square: the maths of the three exhibits, by independent methods.
import test from "node:test";
import assert from "node:assert/strict";
import * as S from "../dist/js/gallery-sofa-model.js";
import * as I from "../dist/js/gallery-inscribed-model.js";
import * as O from "../dist/js/gallery-opaque-model.js";

test("moving sofa: Hammersley's family has the stated area and turns the corner; a bigger copy does not", () => {
  for (const r of [0, 0.25, S.HAMMERSLEY_R, 0.8, 1]) {
    assert.ok(Math.abs(S.area(S.hammersley(r, 400)) - S.hammersleyArea(r)) < 1e-4, `area r = ${r}`);
    const p = S.hammersley(r);   // the coarse polygon of the page
    for (let i = 0; i <= 300; i++) assert.ok(S.fits(p, S.hammersleyPose(r, (3 * i) / 300, 1.5), 1e-6), `r = ${r}, s = ${(3 * i) / 300}`);
    assert.ok(S.through(p, S.hammersleyPose(r, 3, 1.5)));
  }
  // the maximum of π/2 + 2r − πr²/2 by a scan, and the value of the record
  let best = 0, at = 0; for (let i = 0; i <= 100000; i++) { const r = i / 100000, a = S.hammersleyArea(r); if (a > best) { best = a; at = r; } }
  assert.ok(Math.abs(at - 2 / Math.PI) < 1e-4 && Math.abs(best - (Math.PI / 2 + 2 / Math.PI)) < 1e-9 && Math.abs(best - 2.2074) < 1e-4);
  const big = S.hammersley(S.HAMMERSLEY_R, 200).map(([x, y]) => [x * 1.01, y * 1.01]);
  assert.ok(Array.from({ length: 301 }, (_, i) => S.fits(big, S.hammersleyPose(S.HAMMERSLEY_R, (3 * i) / 300, 1.5), 1e-6)).includes(false));
  // walls: a unit square fits in the corner, a 1 × 1.2 rectangle across the corner does not
  assert.ok(S.fits(S.rectangle(1, 1), { x: 0.5, y: 0.5, a: 0 }));
  assert.ok(!S.fits(S.rectangle(1, 1.2), { x: 0.5, y: 0.5, a: Math.PI / 4 }));
  assert.ok(!S.fits(S.rectangle(0.5, 0.5), { x: -0.5, y: -0.5, a: 0 }), "inside the wall");
  // a drawn outline becomes a polygon of the same area (a circle of radius 0.4)
  const stroke = Array.from({ length: 300 }, (_, k) => [2 + 0.4 * Math.cos((2 * Math.PI * k) / 300), 0.5 + 0.4 * Math.sin((2 * Math.PI * k) / 300)]);
  const s = S.fromStroke(stroke); assert.ok(Math.abs(S.area(s.poly) - Math.PI * 0.16) < 2e-3 && Math.abs(s.at[0] - 2) < 1e-6);
});

test("inscribed squares: triangles have 3 or 1, the ellipse's square has side 2ab/√(a² + b²), every result is a square on the curve", () => {
  const dist = (pts, p) => Math.min(...pts.map((a, i) => { const b = pts[(i + 1) % pts.length], dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy, u = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l)); return Math.hypot(p[0] - a[0] - u * dx, p[1] - a[1] - u * dy); }));
  const run = (k) => { const P = I.PRESETS[k], pts = I.curve(P.ctrl, { corners: P.corners, n: P.corners ? 40 : 24 }); return [pts, I.inscribed(pts)]; };
  assert.equal(run("acute")[1].length, 3); assert.equal(run("obtuse")[1].length, 1);
  // the triangle squares have side ah/(a + h) on each side
  const [A, B, C] = I.PRESETS.acute.ctrl, side = (p, q, r) => { const a = Math.hypot(q[0] - p[0], q[1] - p[1]), h = Math.abs((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])) / a; return (a * h) / (a + h); };
  const expected = [side(A, B, C), side(B, C, A), side(C, A, B)].sort(), got = run("acute")[1].map((f) => f.side).sort();
  expected.forEach((s, i) => assert.ok(Math.abs(s - got[i]) < 1e-3, `${s} vs ${got[i]}`));
  for (const k of Object.keys(I.PRESETS)) {
    const [pts, found] = run(k); assert.ok(found.length >= 1, k); assert.ok(!I.selfCrossing(pts), k);
    for (const f of found) { const [p, q, r, s] = f.corners, d = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]); assert.ok(Math.abs(d(p, q) - d(q, r)) < 1e-9 && Math.abs(d(p, r) - d(q, s)) < 1e-9); f.corners.forEach((c) => assert.ok(dist(pts, c) < 1e-2, k)); }
  }
  const [, ell] = run("ellipse"); assert.ok(Math.abs(ell[0].side - (2 * 3.6 * 2) / Math.hypot(3.6, 2)) < 0.02);
  assert.ok(I.selfCrossing([[0, 0], [2, 2], [2, 0], [0, 2]]), "a bow tie crosses itself");
  // rectangles: the corners of fromDiagonal with angle 2 atan(1/2) have sides in ratio 2
  const R = I.fromDiagonal([0, 0], [3, 1], 2 * Math.atan(1 / 2)), d = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  assert.ok(Math.abs(Math.max(d(R[0], R[1]), d(R[1], R[2])) / Math.min(d(R[0], R[1]), d(R[1], R[2])) - 2) < 1e-9);
});

test("opaque square: preset barriers and their lengths; gaps agree with a direct line-by-line test", () => {
  const L = { sides: 3, diagonals: 2 * Math.SQRT2, steiner: 1 + Math.sqrt(3), best: Math.SQRT2 + Math.sqrt(6) / 2 };
  for (const [k, v] of Object.entries(L)) { assert.ok(Math.abs(O.length(O.BARRIERS[k].segs) - v) < 1e-12, k); assert.ok(O.check(O.BARRIERS[k].segs).opaque, k); }
  assert.ok(!O.check([]).opaque && !O.check([[[0, 0], [1, 0]], [[0, 0], [0, 1]]]).opaque && !O.check([[[0, 0], [1, 0]], [[0, 1], [1, 1]]]).opaque);
  const cut = O.BARRIERS.best.segs.map((s) => s.map((p) => [...p])); cut[3][1] = [0.6, 0.6]; assert.ok(!O.check(cut).opaque, "a shorter half diagonal leaks");
  // direct test: the line {p : n·p = c} meets segment ab when n·a − c and n·b − c have opposite signs (or vanish)
  let seed = 3; const rnd = () => ((seed = (seed * 48271) % 2147483647) / 2147483647);
  for (let trial = 0; trial < 40; trial++) {
    const segs = Array.from({ length: 1 + (trial % 4) }, () => [[rnd(), rnd()], [rnd(), rnd()]]), th = rnd() * Math.PI, nx = -Math.sin(th), ny = Math.cos(th);
    const open = O.gaps(segs, th), cs = [[0, 0], [1, 0], [1, 1], [0, 1]].map(([x, y]) => x * nx + y * ny);
    for (let i = 1; i < 200; i++) {
      const c = Math.min(...cs) + ((Math.max(...cs) - Math.min(...cs)) * i) / 200, blocked = segs.some(([a, b]) => (a[0] * nx + a[1] * ny - c) * (b[0] * nx + b[1] * ny - c) <= 0);
      const inGap = open.some(([u, v]) => c > u && c < v); assert.equal(inGap, !blocked, `trial ${trial}, c = ${c}`);
    }
  }
  // Cauchy: the mean projection of a segment of length l is 2l/π, the mean width of the unit square 4/π
  let seg = 0, sq = 0; const N = 20000; for (let k = 0; k < N; k++) { const th = (Math.PI * (k + 0.5)) / N; seg += Math.abs(Math.cos(th)); sq += Math.abs(Math.cos(th)) + Math.abs(Math.sin(th)); }
  assert.ok(Math.abs(seg / N - 2 / Math.PI) < 1e-6 && Math.abs(sq / N - 4 / Math.PI) < 1e-6);
});
