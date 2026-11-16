// Collection « contre l'intuition »: the circle regions (lab `circle-regions`). Independent check by Euler's formula on the drawing:
// V - E + F = 2 with the points, the crossings (merged when chords are concurrent) and the pieces of chords, and the closed form 1 + C(n,2) + C(n,4).
import test from "node:test";
import assert from "node:assert/strict";
import { model, formula, pointsOf, MAX_N } from "../dist/js/lab/models/circle-regions.js";

const seg = (p, q, r, s) => {                                           // strict interior crossing of segments pq and rs (chords of a circle)
  const d = (q[0] - p[0]) * (s[1] - r[1]) - (q[1] - p[1]) * (s[0] - r[0]); if (Math.abs(d) < 1e-12) return null;
  const t = ((r[0] - p[0]) * (s[1] - r[1]) - (r[1] - p[1]) * (s[0] - r[0])) / d, u = ((r[0] - p[0]) * (q[1] - p[1]) - (r[1] - p[1]) * (q[0] - p[0])) / d;
  return t > 1e-9 && t < 1 - 1e-9 && u > 1e-9 && u < 1 - 1e-9 ? [p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])] : null;
};
function eulerRegions(n, mode) {
  const pts = pointsOf(n, mode), chords = []; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) chords.push([i, j]);
  const nodes = [...pts.map((p) => p)]; const find = (x) => nodes.findIndex((o) => Math.hypot(o[0] - x[0], o[1] - x[1]) < 1e-7);
  const onChord = chords.map(() => new Set());
  chords.forEach(([i, j], a) => { onChord[a].add(i); onChord[a].add(j); });
  for (let a = 0; a < chords.length; a++) for (let b = a + 1; b < chords.length; b++) {
    const X = seg(pts[chords[a][0]], pts[chords[a][1]], pts[chords[b][0]], pts[chords[b][1]]); if (!X) continue;
    let k = find(X); if (k < 0) { nodes.push(X); k = nodes.length - 1; } onChord[a].add(k); onChord[b].add(k);
  }
  // edges: each chord is cut by its nodes into (count - 1) segments; the circle is cut by the n points into n arcs (n >= 2; one point gives a loop)
  let E = chords.reduce((s, _, a) => s + onChord[a].size - 1, 0) + (n >= 2 ? n : 1);
  const V = nodes.length, comp = 1;                                      // connected when n >= 2 (n = 1: a single point on the circle)
  const F = n === 1 ? 2 : comp + 1 + E - V;                              // V - E + F = 1 + comp (counting the outer face)
  return F - 1;                                                          // inner regions
}
test("regions of the disc: 1, 2, 4, 8, 16, 31, 57, 99, 163, 256 for points in general position", () => {
  const expected = [1, 2, 4, 8, 16, 31, 57, 99, 163, 256];
  for (let n = 1; n <= MAX_N; n++) {
    assert.equal(formula(n), expected[n - 1], `formula ${n}`);
    assert.equal(model({ n, mode: "general" }).regions, expected[n - 1], `model ${n}`);
    assert.ok(!model({ n, mode: "general" }).concurrent, `general position ${n}`);
    if (n >= 2) assert.equal(eulerRegions(n, "general"), expected[n - 1], `Euler ${n}`);
  }
});
test("the regular hexagon loses a region (three long diagonals concurrent); the model and Euler agree with each other", () => {
  assert.equal(model({ n: 6, mode: "regular" }).regions, 30);
  for (let n = 3; n <= MAX_N; n++) assert.equal(eulerRegions(n, "regular"), model({ n, mode: "regular" }).regions, `regular ${n}`);
});
