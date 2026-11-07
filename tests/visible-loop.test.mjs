// The shared animation loop (site/js/visible-loop.js): no frames offscreen or in a hidden tab, reduced motion draws once and
// then only while interacting, a frame returning false sleeps until an interaction, stop() releases everything.
import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { animationLoop } from "../site/js/visible-loop.js";

function env({ reducedMotion = false } = {}) {
  const dom = new JSDOM("<main><div id='stage'><canvas></canvas></div></main>", { pretendToBeVisual: true }), w = dom.window;
  const frames = new Map(); let n = 0, io = null, hidden = false;
  globalThis.requestAnimationFrame = (f) => { frames.set(++n, f); return n; };
  globalThis.cancelAnimationFrame = (i) => frames.delete(i);
  globalThis.IntersectionObserver = class { constructor(f) { io = f; } observe() {} disconnect() {} };
  globalThis.ResizeObserver = class { observe() {} disconnect() {} };
  w.matchMedia = () => ({ matches: reducedMotion, addEventListener() {}, removeEventListener() {} });
  Object.defineProperty(w.document, "hidden", { configurable: true, get: () => hidden });
  let t = performance.now();
  return {
    w, stage: w.document.querySelector("#stage"), pending: () => frames.size,
    run(k = 1) { for (let i = 0; i < k; i++) { const work = [...frames.values()]; frames.clear(); t += 16; work.forEach((f) => f(t)); } },
    setVisible(v) { io([{ isIntersecting: v }]); }, setHidden(h) { hidden = h; w.document.dispatchEvent(new w.Event("visibilitychange")); },
    advance(ms) { t += ms; },
  };
}

test("runs while visible, stops offscreen and in a hidden tab, resumes on return", () => {
  const e = env(); let calls = 0;
  const loop = animationLoop(e.stage, () => { calls++; });
  e.run(3); assert.equal(calls, 3); assert.equal(e.pending(), 1);
  e.setVisible(false); assert.equal(e.pending(), 0); const before = calls; e.run(5); assert.equal(calls, before);
  e.setVisible(true); assert.equal(e.pending(), 1); e.run(2); assert.equal(calls, before + 2);
  e.setHidden(true); assert.equal(e.pending(), 0); e.setHidden(false); assert.equal(e.pending(), 1);
  loop.stop(); assert.equal(e.pending(), 0);
});

test("a frame that returns false sleeps until an interaction or wake()", () => {
  const e = env(); let calls = 0, busy = true;
  const loop = animationLoop(e.stage, () => { calls++; return busy ? undefined : false; });
  e.run(2); busy = false; e.run(1); assert.equal(e.pending(), 0, "asleep");
  e.run(5); assert.equal(calls, 3);
  e.stage.dispatchEvent(new e.w.Event("pointerdown", { bubbles: true })); assert.equal(e.pending(), 1); e.run(1); assert.equal(calls, 4); assert.equal(e.pending(), 0);
  loop.wake(); assert.equal(e.pending(), 1); loop.stop();
});

test("reduced motion: dt is 0, one drawn frame, then frames only for a short while after an interaction", () => {
  const e = env({ reducedMotion: true }); const dts = [];
  const loop = animationLoop(e.stage, (dt) => { dts.push(dt); }, { grace: 100 });
  e.run(1); assert.deepEqual(dts, [0]);
  e.advance(500); e.run(1); e.run(3); assert.equal(e.pending(), 0, "idle by itself");
  e.stage.dispatchEvent(new e.w.Event("keydown", { bubbles: true })); assert.equal(e.pending(), 1);
  e.run(1); assert.ok(dts.every((d) => d === 0)); e.advance(300); e.run(1); assert.equal(e.pending(), 0, "grace over");
  loop.stop();
});

test("reduced motion: a frame that returns true (a run the user started) keeps going", () => {
  const e = env({ reducedMotion: true }); let calls = 0;
  const loop = animationLoop(e.stage, () => { calls++; return true; }, { grace: 10 });
  e.advance(500); e.run(10); assert.equal(calls, 10); assert.equal(e.pending(), 1); loop.stop();
});
