// Independent check of the box geometry: the unfolded routes agree with a numerical search over surface paths.
import test from "node:test";
import assert from "node:assert/strict";
import { nets, shortest, netRoute, crossEdge, facesOf, polyLength, hingePosition, faceCorners, FACE_AXIS, faceValue } from "../dist/js/box-model.js";
import { BOX_SETS, boxSet, boxPath } from "../dist/js/challenge-puzzles2.js";

test("box: the three nets agree with boxPath and netRoute folds back to the same length", () => {
  for (const id of BOX_SETS) {
    const dims = boxSet(id);
    assert.ok(Math.abs(shortest(dims) - boxPath(...dims)) < 1e-12);
    for (const net of nets(dims)) {
      const r = netRoute(dims, net);
      assert.ok(Math.abs(polyLength(r.points) - net.length) < 1e-9, `${id} ${net.base}/${net.hinge}`);
      assert.ok(facesOf(dims, r.points[1]).includes(net.base) && facesOf(dims, r.points[1]).includes(net.hinge), "the crossing lies on the shared edge");
    }
  }
});

test("box: a brute-force scan of the crossing point never beats the straight route in a net", () => {
  for (const id of BOX_SETS) {
    const dims = boxSet(id), S = [0, 0, 0], T = dims;
    for (const net of nets(dims)) {
      const { base: f, hinge: g, edgeAxis: e } = net, onBase = facesOf(dims, S).includes(f);
      const from = onBase ? f : g, to = onBase ? g : f, edgePt = [0, 0, 0];
      edgePt[FACE_AXIS[f]] = faceValue(dims, f); edgePt[FACE_AXIS[g]] = faceValue(dims, g);
      let best = Infinity;
      for (let i = 0; i <= 4000; i++) { const m = edgePt.slice(); m[e] = (dims[e] * i) / 4000; best = Math.min(best, polyLength([S, m, T])); }
      assert.ok(best >= net.length - 1e-9 && best - net.length < 1e-3, `${id}`);
      void from; void to; void crossEdge;
    }
  }
});

test("box: an unfolded hinge face ends coplanar with the base face and keeps its shape", () => {
  const dims = [3, 5, 6];
  for (const net of nets(dims)) {
    const flat = faceCorners(dims, net.hinge).map((v) => hingePosition(dims, net.base, net.hinge, v, 1));
    const k = FACE_AXIS[net.base];
    for (const p of flat) assert.ok(Math.abs(p[k] - faceValue(dims, net.base)) < 1e-9, "in the plane of the base face");
    const closed = faceCorners(dims, net.hinge).map((v) => hingePosition(dims, net.base, net.hinge, v, 0));
    faceCorners(dims, net.hinge).forEach((v, i) => v.forEach((x, j) => assert.ok(Math.abs(closed[i][j] - x) < 1e-9, "closed = the box")));
    const d = (p, q) => Math.hypot(...p.map((x, i) => x - q[i])), orig = faceCorners(dims, net.hinge);
    for (let i = 0; i < 4; i++) assert.ok(Math.abs(d(flat[i], flat[(i + 1) % 4]) - d(orig[i], orig[(i + 1) % 4])) < 1e-9, "rigid");
  }
});
