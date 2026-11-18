// Collection « contre l'intuition »: the missing square (lab `tiles`, Curry's triangle). Exact slopes and areas by integer arithmetic,
// independent of the lab model except for the piece coordinates it is checking.
import test from "node:test";
import assert from "node:assert/strict";
import { CURRY, area } from "../dist/js/lab/models/tiles.js";

const cross = (x1, y1, x2, y2) => x1 * y2 - x2 * y1;
test("the three 'hypotenuses' have different slopes: 3/8 < 5/13 < 2/5, so the long side is bent", () => {
  assert.ok(3 * 13 < 5 * 8, "3/8 < 5/13");
  assert.ok(5 * 5 < 2 * 13, "5/13 < 2/5");
  assert.equal(2 * 13 - 5 * 5, 1);
  assert.equal(5 * 8 - 3 * 13, 1);
});
test("both arrangements use the same four pieces (area 32) while the big triangle has area 32.5; the bent boundary accounts for the half unit each way", () => {
  const sum = (arr, skip) => Object.entries(arr).filter(([k, p]) => p && k !== skip).reduce((t, [, p]) => t + Math.abs(area(p)), 0);
  assert.equal(sum(CURRY.A, "hole"), 32); assert.equal(sum(CURRY.B, "hole"), 32);
  assert.equal(Math.abs(area(CURRY.B.hole)), 1);
  assert.equal(13 * 5 / 2 - Math.abs(cross(8, 3, 13, 5)) / 2, 32, "A: triangle minus the sliver (0,0),(8,3),(13,5)");
  assert.equal(13 * 5 / 2 + Math.abs(cross(5, 2, 13, 5)) / 2, 33, "B: triangle plus the sliver (0,0),(5,2),(13,5) = pieces (32) + hole (1)");
});
test("Fibonacci family: the sliver always has area 1/2 (legs F(k+1) x F(k-1) and F(k+2) x F(k))", () => {
  const F = [0, 1]; for (let i = 2; i < 40; i++) F.push(F[i - 1] + F[i - 2]);
  for (let k = 3; k < 38; k++) assert.equal(Math.abs(cross(F[k + 1], F[k - 1], F[k + 2], F[k])), 1, `k=${k}`);
});
