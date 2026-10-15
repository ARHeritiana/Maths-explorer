import test from "node:test";
import assert from "node:assert/strict";
import { escape, mandelbrot, julia, MADAGASCAR, planar, resample, fourier, arms } from "../dist/js/gallery-math.js";

test("mandelbrot: known members and non-members", () => {
  assert.equal(mandelbrot(0, 0, 500), 500); assert.equal(mandelbrot(-1, 0, 500), 500);       // inside (period 2 bulb)
  assert.equal(mandelbrot(0.25, 0, 5000), 5000);                                              // the cusp is in the set
  assert.equal(mandelbrot(1, 0, 50), 3, "c = 1: z = 1, 2, 5, so |z| > 2 at the third step");
  assert.ok(mandelbrot(2, 2, 50) < 3);
  assert.ok(Number.isFinite(escape(0, 0, 0.5, 0.5, 100, true)));
});
test("julia: c = 0 gives the unit disk", () => {
  assert.equal(julia(0.5, 0.5, 0, 0, 200), 200); assert.ok(julia(1.5, 0, 0, 0, 200) < 5);
});
test("fourier: the first coefficients of a circle and full reconstruction of a polygon", () => {
  const circle = Array.from({ length: 64 }, (_, j) => [3 * Math.cos((2 * Math.PI * j) / 64), 3 * Math.sin((2 * Math.PI * j) / 64)]);
  const c = fourier(circle); assert.equal(c[0].k, 1); assert.ok(Math.abs(c[0].amp - 3) < 1e-9); assert.ok(c.slice(1).every((x) => x.amp < 1e-9));
  const pts = resample(planar(MADAGASCAR), 64), co = fourier(pts), n = pts.length;
  for (const j of [0, 7, 31, 50]) { const chain = arms(co, j / n, n), end = chain[chain.length - 1]; assert.ok(Math.hypot(end[0] - pts[j][0], end[1] - pts[j][1]) < 1e-8, `point ${j}`); }
});
test("fourier: more arms never increase the mean squared error (Madagascar outline)", () => {
  const pts = resample(planar(MADAGASCAR), 128), co = fourier(pts), err = (m) => pts.reduce((s, p, j) => { const e = arms(co, j / 128, m).at(-1); return s + (e[0] - p[0]) ** 2 + (e[1] - p[1]) ** 2; }, 0) / 128;   // mean squared error: Parseval makes it decrease with every added arm
  assert.ok(err(5) > err(15) && err(15) > err(40) && err(40) > err(128) && err(128) < 1e-8);
});
test("outline: the Madagascar outline spans about 1500 km north to south and 750 km west to east (coarse sanity check)", () => {
  const lat = MADAGASCAR.map((p) => p[1]), lon = MADAGASCAR.map((p) => p[0]);
  const ns = (Math.max(...lat) - Math.min(...lat)) * 111, ew = (Math.max(...lon) - Math.min(...lon)) * 111 * Math.cos((19 * Math.PI) / 180);
  assert.ok(ns > 1400 && ns < 1700, `${ns}`); assert.ok(ew > 650 && ew < 800, `${ew}`);
  const r = resample(MADAGASCAR, 100); assert.equal(r.length, 100);
});
