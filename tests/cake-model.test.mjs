// The cake sandbox: geometry of cuts drawn as segments, fairness, and the grid size offered by hint 2.
import test from "node:test";
import assert from "node:assert/strict";
import { perimeterParam, rayToOutline, cutsOfSegments, piecePolygons, isFair, niceSide, pieceDirections } from "../dist/js/challenges/cake/maths.js";

const area = (poly) => { let a = 0; for (let i = 0; i < poly.length; i++) { const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length]; a += x1 * y2 - x2 * y1; } return a / 2; };

test("cake: perimeter parameter inverts squarePoint and rejects interior points", () => {
  assert.equal(perimeterParam(0.3, 0), 0.3); assert.equal(perimeterParam(1, 0.25), 1.25); assert.equal(perimeterParam(0.25, 1), 2.75); assert.equal(perimeterParam(0, 0.25), 3.75);
  assert.equal(perimeterParam(0.5, 0.5), null); assert.equal(perimeterParam(0.2, 1.3), null);
});

test("cake: five cuts to the points 4 units apart on a side-5 grid are fair, any other spacing is not", () => {
  const g = 5, pts = [[0, 0], [4, 0], [5, 3], [3, 5], [0, 4]].map(([x, y]) => [x / g, y / g]);   // perimeter positions 0, 4, 8, 12, 16 of 20
  const cuts = cutsOfSegments(pts.map((p) => [[0.5, 0.5], p]));
  assert.equal(cuts.length, 5); assert.ok(isFair(cuts, 5));
  const bad = cutsOfSegments([[0, 0], [4, 0], [5, 3], [3, 5], [0, 1]].map(([x, y]) => [[0.5, 0.5], [x / g, y / g]]));
  assert.ok(!isFair(bad, 5));
  assert.ok(!isFair(cuts.slice(0, 4), 5), "four cuts make four pieces, not five");
});

test("cake: a segment through the centre with both ends on the outline makes two cuts; a segment that misses the centre makes none", () => {
  assert.equal(cutsOfSegments([[[0, 0.5], [1, 0.5]]]).length, 2);
  assert.equal(cutsOfSegments([[[0, 0.2], [1, 0.2]]]).length, 0);
  assert.equal(cutsOfSegments([[[0.5, 0.5], [0.7, 0.7]]]).length, 0, "ends inside the cake: not a cut");
});

test("cake: the pieces tile the square, and rays from the centre reach the outline", () => {
  for (const n of [3, 4, 5, 6, 10]) {
    const cuts = Array.from({ length: n }, (_, i) => 0.35 + (4 * i) / n), polys = piecePolygons(cuts);
    assert.equal(polys.length, n); assert.ok(Math.abs(polys.reduce((s, p) => s + area(p), 0) - 1) < 1e-12);
    for (const d of pieceDirections(polys)) assert.ok(Math.abs(Math.hypot(...d) - 1) < 1e-12);
  }
  for (let th = 0; th < 6.3; th += 0.37) { const [x, y] = rayToOutline(th); assert.ok(perimeterParam(x, y, 1e-9) !== null); }
});

test("cake: the grid size of hint 2 puts every equally spaced cut on grid points", () => {
  for (const n of [3, 4, 5, 6, 10]) {
    const g = niceSide(n); assert.ok(g >= 3 && g <= 12, `${n}`);
    const spacing = (4 * g) / n; assert.ok(Number.isInteger(spacing), `${n}: spacing ${spacing}`);
  }
  assert.equal(niceSide(5), 5);
});
