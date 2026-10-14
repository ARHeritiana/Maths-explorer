import test from "node:test";
import assert from "node:assert/strict";
import { binomial, pascalRow, reuleaux, widthAt, inSquare, rolling, platonic, SOLIDS, vertexVerdict, PLATONIC_CASES, gonContraction, sierpinskiCount, sierpinskiArea } from "../dist/js/lab-objects.js";

test("Galton: the binomial law sums to 1 and matches Pascal's row", () => {
  for (const [n, p] of [[4, 0.5], [10, 0.3], [12, 0.8]]) assert.ok(Math.abs(binomial(n, p).reduce((a, b) => a + b, 0) - 1) < 1e-12);
  assert.ok(Math.abs(binomial(4, 0.5)[2] - 0.375) < 1e-12);
  assert.deepEqual(pascalRow(5), [1, 5, 10, 10, 5, 1]);
  const mean = binomial(10, 0.3).reduce((s, x, k) => s + k * x, 0);
  assert.ok(Math.abs(mean - 3) < 1e-12);
});
test("Reuleaux polygons have constant width, perimeter πw and the known area", () => {
  for (const n of [3, 5, 7, 9]) {
    const s = reuleaux(n, 2);
    for (let i = 0; i < 90; i++) assert.ok(Math.abs(widthAt(s, (i * Math.PI) / 45) - 2) < 2e-3, `n=${n} θ=${i}`);
    assert.ok(Math.abs(s.perimeter - 2 * Math.PI) < 1e-12);
    assert.ok(s.area < s.diskArea);
  }
  assert.ok(Math.abs(reuleaux(3, 1).area - (Math.PI - Math.sqrt(3)) / 2) < 1e-12);
});
test("A Reuleaux shape turns inside a square of the same side, touching all four sides", () => {
  const s = reuleaux(3, 1);
  for (let i = 0; i < 60; i++) {
    const psi = (i * 2 * Math.PI) / 60, [cx, cy] = inSquare(s, psi);
    assert.ok(Number.isFinite(cx) && Number.isFinite(cy));
    assert.ok(cx > -0.01 && cx < 1.01 && cy > -0.01 && cy < 1.01);
  }
  const r = rolling(s); assert.ok(Math.abs(r(1) - Math.PI) < 5e-3, `one turn rolls ${r(1)} (perimeter π)`);
});
test("Platonic solids: counts and Euler's formula, computed from coordinates", () => {
  const expect = { tetrahedron: [4, 6, 4], cube: [8, 12, 6], octahedron: [6, 12, 8], dodecahedron: [20, 30, 12], icosahedron: [12, 30, 20] };
  for (const name of SOLIDS) {
    const s = platonic(name), [V, E, F] = expect[name];
    assert.deepEqual([s.V, s.E, s.F], [V, E, F], name);
    assert.equal(s.V - s.E + s.F, 2);
    assert.ok(s.faces.every((f) => f.verts.length === s.p), name);
    assert.equal(2 * s.E, s.p * s.F); assert.equal(2 * s.E, s.q * s.V);
    const lens = s.edges.map(([a, b]) => Math.hypot(...s.verts[a].map((x, i) => x - s.verts[b][i])));
    assert.ok(Math.max(...lens) - Math.min(...lens) < 1e-9, "regular: equal edges");
  }
});
test("Exactly five (p,q) pairs make a solid corner", () => {
  const solid = PLATONIC_CASES.filter((c) => c.verdict === "solid").map((c) => `${c.p}${c.q}`).sort();
  assert.deepEqual(solid, ["33", "34", "35", "43", "53"]);
  assert.equal(vertexVerdict(3, 6), "flat"); assert.equal(vertexVerdict(4, 4), "flat"); assert.equal(vertexVerdict(6, 3), "flat");
});
test("Chaos game and Sierpiński", () => {
  assert.ok(Math.abs(gonContraction(3) - 0.5) < 1e-12);
  assert.equal(sierpinskiCount(3), 27);
  assert.ok(Math.abs(sierpinskiArea(2) - 0.5625) < 1e-12);
});
