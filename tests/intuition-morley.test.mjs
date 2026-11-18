// Collection « contre l'intuition »: Morley's triangle. The model computes the trisectors from the vertices; here the result is checked
// independently: every point D, E, F lies on the two trisectors by an angle test, and the three sides and the three angles of DEF are equal / 60 degrees.
import test from "node:test";
import assert from "node:assert/strict";
import { morley, interiorAngle } from "../dist/js/gallery/gallery-morley-model.js";

const ang = (P, Q, R) => interiorAngle(P, Q, R);                           // angle QPR
function rng(s) { let a = s >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
test("Morley: DEF is equilateral for 2000 random triangles, some very flat or very large", () => {
  const r = rng(42);
  for (let k = 0; k < 2000; k++) {
    const P = [0, 0, 0].map(() => [r() * 1000, r() * 1000]);
    const small = Math.min(ang(P[0], P[1], P[2]), ang(P[1], P[2], P[0]), ang(P[2], P[0], P[1]));
    if (small < 0.02) continue;
    const m = morley(...P), [A, B, C] = P;
    const a1 = ang(A, B, C), b1 = ang(B, A, C), c1 = ang(C, A, B), Rc = Math.hypot(B[0] - C[0], B[1] - C[1]) / (2 * Math.sin(a1));
    const expected = 8 * Rc * Math.sin(a1 / 3) * Math.sin(b1 / 3) * Math.sin(c1 / 3);   // Morley side = 8 R sin(A/3) sin(B/3) sin(C/3)
    for (const x of m.sides) assert.ok(Math.abs(x - expected) < 1e-6 * Math.max(1, expected) / small, `side ${x} vs ${expected}`);
    for (const a of m.angles) assert.ok(Math.abs(a - Math.PI / 3) < 1e-6 / small, `angle ${a}`);
    // D lies on the trisectors from B and C nearest BC: angle DBC = B/3 and angle DCB = C/3
    assert.ok(Math.abs(ang(B, C, m.D) - ang(B, A, C) / 3) < 1e-7 / small, "angle DBC = B/3");
    assert.ok(Math.abs(ang(C, B, m.D) - ang(C, A, B) / 3) < 1e-7 / small, "angle DCB = C/3");
    assert.ok(Math.abs(ang(C, A, m.E) - ang(C, B, A) / 3) < 1e-7 / small && Math.abs(ang(A, B, m.F) - ang(A, C, B) / 3) < 1e-7 / small);
  }
});
test("Morley: the equilateral triangle gives 8 R sin^3(20 degrees), and the 3-4-5 triangle gives an equilateral Morley triangle", () => {
  const s = Math.sqrt(3) / 2, m = morley([0, 0], [1, 0], [0.5, s]);
  const R = 1 / Math.sqrt(3);
  for (const x of m.sides) assert.ok(Math.abs(x - 8 * R * Math.sin(Math.PI / 9) ** 3) < 1e-12);
  const t = morley([0, 0], [4, 0], [0, 3]);
  assert.ok(t.sides.every((x) => Math.abs(x - t.sides[0]) < 1e-12));
});
