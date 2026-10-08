import test from "node:test";
import assert from "node:assert/strict";
import { createLabMotion } from "../dist/js/motion.js";

function harness() {
  let time = 0, id = 0, reduced = false, visible = true;
  const queued = new Map(), painted = [];
  const motion = createLabMotion({
    request: callback => { queued.set(++id, callback); return id; },
    cancel: handle => queued.delete(handle), now: () => time,
    reduced: () => reduced, visible: () => visible,
    paint: (values, moving) => painted.push({ values: [...values], moving }),
  });
  return {
    motion, painted, queued,
    tick(value) { time = value; const callbacks = [...queued.values()]; queued.clear(); callbacks.forEach(callback => callback(time)); },
    reduce() { reduced = true; }, hide() { visible = false; },
  };
}

test("continuous motion converges to the exact target with no accumulated rounding", () => {
  const h = harness();
  h.motion.remember([45]); h.motion.move([135], [["θ", 0, 360, 1]]);
  h.tick(80);
  assert.equal(h.painted.at(-1).values[0], 123.75);
  assert.equal(h.painted.at(-1).moving, true);
  h.tick(160);
  assert.deepEqual(h.painted.at(-1), { values: [135], moving: false });
  assert.equal(h.queued.size, 0);
});

test("new slider targets cancel stale frames and resume from the displayed value", () => {
  const h = harness(), params = [["a", -3, 3, .25]];
  h.motion.remember([0]); h.motion.move([2], params); h.tick(80);
  const previous = h.painted.at(-1).values[0];
  h.motion.move([-2], params);
  assert.equal(h.queued.size, 1);
  h.tick(80);
  assert.equal(h.painted.at(-1).values[0], previous);
  h.tick(240);
  assert.deepEqual(h.painted.at(-1), { values: [-2], moving: false });
});

test("counts remain integers while continuous parameters interpolate", () => {
  const h = harness();
  h.motion.remember([2, .1, 2]);
  h.motion.move([11, .9, 99], [["n", 1, 12, 1], ["p", 0, 1, .05], ["N", 2, 100, 1]]);
  h.tick(40);
  const [n, p, N] = h.painted.at(-1).values;
  assert.equal(n, 11); assert.equal(N, 99); assert.ok(p > .1 && p < .9);
});

test("reduced motion and hidden tabs settle immediately and clear pending frames", () => {
  for (const preference of ["reduce", "hide"]) {
    const h = harness();
    h.motion.remember([0]); h.motion.move([1], [["x", -3, 3, .25]]);
    h[preference](); h.tick(40);
    assert.deepEqual(h.painted.at(-1), { values: [1], moving: false });
    assert.equal(h.queued.size, 0);
    h.motion.move([2], [["x", -3, 3, .25]]);
    assert.deepEqual(h.painted.at(-1), { values: [2], moving: false });
    assert.equal(h.queued.size, 0);
  }
});

test("navigation resets motion without painting a stale experiment", () => {
  const h = harness();
  h.motion.remember([0]); h.motion.move([1], [["x", -3, 3, .25]]);
  h.motion.reset(); h.tick(200); h.motion.settle();
  assert.equal(h.queued.size, 0); assert.equal(h.painted.length, 0);
});

test("release and direct model updates cancel animation and preserve exact endpoints", () => {
  const h = harness();
  h.motion.remember([0]); h.motion.move([.01], [["h", .01, 2, .01]]);
  h.motion.settle(); h.tick(200);
  assert.deepEqual(h.painted, [{ values: [.01], moving: false }]);
  h.motion.move([1], [["h", .01, 2, .01]]);
  h.motion.remember([2]); h.tick(400);
  assert.equal(h.painted.length, 1); assert.equal(h.queued.size, 0);
});
