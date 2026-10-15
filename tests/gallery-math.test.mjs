import test from "node:test";
import assert from "node:assert/strict";
import { escape, mandelbrot, julia, MADAGASCAR, resample, fourier, arms } from "../dist/js/gallery-math.js";

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
  const pts = resample(MADAGASCAR, 64), co = fourier(pts), n = pts.length;
  for (const j of [0, 7, 31, 50]) { const chain = arms(co, j / n, n), end = chain[chain.length - 1]; assert.ok(Math.hypot(end[0] - pts[j][0], end[1] - pts[j][1]) < 1e-8, `point ${j}`); }
});
test("fourier: more arms never increase the mean squared error (Madagascar outline)", () => {
  const pts = resample(MADAGASCAR, 128), co = fourier(pts), err = (m) => pts.reduce((s, p, j) => { const e = arms(co, j / 128, m).at(-1); return s + (e[0] - p[0]) ** 2 + (e[1] - p[1]) ** 2; }, 0) / 128;   // mean squared error: Parseval makes it decrease with every added arm
  assert.ok(err(5) > err(15) && err(15) > err(40) && err(40) > err(128) && err(128) < 1e-8);
});
test("outline: the traced Madagascar is a closed, simple, slim shape about twice as tall as wide", () => {
  const xs = MADAGASCAR.map((p) => p[0]), ys = MADAGASCAR.map((p) => p[1]), w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
  assert.equal(MADAGASCAR.length, 360); assert.ok(h / w > 1.8 && h / w < 2.2, `${h / w}`); assert.ok(Math.abs(h - 20) < 0.05);
  // simple: no two non-adjacent edges cross
  const n = MADAGASCAR.length, cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const hit = (a, b, c, d) => cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0;
  let crossings = 0; for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) { if (i === 0 && j === n - 1) continue; if (hit(MADAGASCAR[i], MADAGASCAR[(i + 1) % n], MADAGASCAR[j], MADAGASCAR[(j + 1) % n])) crossings++; }
  assert.equal(crossings, 0);
  const r = resample(MADAGASCAR, 100); assert.equal(r.length, 100);
});
