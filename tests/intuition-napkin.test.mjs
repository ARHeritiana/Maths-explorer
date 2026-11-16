// Collection « contre l'intuition », entry 2: napkin ring. V = pi h^3 / 6 checked three independent ways: the drilled-sphere formula
// (sphere minus cylinder minus two caps), Simpson integration of the annulus areas, and the closed form.
import test from "node:test";
import assert from "node:assert/strict";
import { holeRadius, height, volume, volumeBySlices, sliceArea } from "../dist/js/gallery/gallery-napkin-model.js";

test("V = pi h^3 / 6 for very different spheres", () => {
  for (const h of [1, 2, 6, 9.5]) for (const R of [h / 2 + 1e-9, h, 3 * h, 50 * h]) {
    const r = holeRadius(R, h), k = R - h / 2;                          // k = height of each removed cap
    const direct = 4 / 3 * Math.PI * R ** 3 - Math.PI * r * r * h - 2 * (Math.PI * k * k * (3 * R - k) / 3);
    assert.ok(Math.abs(direct - volume(h)) < 1e-6 * Math.max(1, R ** 3) * 1e-3 + 1e-6 * volume(h), `sphere minus parts R=${R} h=${h}: ${direct} vs ${volume(h)}`);
    assert.ok(Math.abs(volumeBySlices(R, h) - volume(h)) < 1e-6 * volume(h) + 1e-9, `slices R=${R} h=${h}`);
  }
});
test("slice areas do not depend on R, and height/hole are inverse", () => {
  for (const z of [-2.5, 0, 1.3]) assert.ok(Math.abs(sliceArea(4, 6, z) - sliceArea(40, 6, z)) < 1e-6);
  assert.ok(Math.abs(height(5, holeRadius(5, 7)) - 7) < 1e-12);
  assert.ok(Math.abs(volume(6) - 36 * Math.PI) < 1e-12);
});
test("with the same hole the volumes differ (the lock matters)", () => {
  assert.ok(volume(height(4, 2)) < volume(height(8, 2)));
});
