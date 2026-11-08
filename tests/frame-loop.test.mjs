// frameLoop (site/js/object-kit.js): the one loop of the animated exhibits stops when the tab is hidden, the canvas leaves the screen or the node leaves the page,
// ticks with dt = 0 under reduced motion, and stops for good once cancelled.
import test from 'node:test';
import assert from 'node:assert/strict';
let queue = [], id = 0, now = 0, listeners = {};
globalThis.requestAnimationFrame = (cb) => { queue.push([++id, cb]); return id; };
globalThis.cancelAnimationFrame = (i) => { queue = queue.filter(([k]) => k !== i); };
globalThis.performance = { now: () => now };
globalThis.document = { hidden: false, addEventListener: (t, f) => (listeners[t] = f), removeEventListener: (t) => delete listeners[t], documentElement: { dataset: {} } };
let io = null;
globalThis.IntersectionObserver = class { constructor(cb) { io = cb; } observe() {} disconnect() { io = null; } };
const { frameLoop } = await import('../site/js/object-kit.js');
const step = (ms) => { now += ms; const q = queue; queue = []; q.forEach(([, cb]) => cb(now)); };
const fresh = () => { queue = []; now = 1000; document.hidden = false; };

test('runs, pauses when hidden, resumes with a small dt', () => {
  fresh(); const dts = []; const stop = frameLoop((dt) => dts.push(dt), { target: { isConnected: true } });
  step(16); step(16); assert.equal(dts.length, 2);
  document.hidden = true; step(16); assert.equal(queue.length, 0); document.hidden = false; now += 60000; listeners.visibilitychange(); step(16);
  assert.ok(dts.at(-1) <= 0.05, 'no jump after a long pause'); stop();
});
test('off screen and detached nodes stop the loop', () => {
  fresh(); let n = 0; const target = { isConnected: true }; const stop = frameLoop(() => n++, { target });
  step(16); io([{ isIntersecting: false }]); assert.equal(queue.length, 0); io([{ isIntersecting: true }]); step(16); assert.equal(n, 2);
  target.isConnected = false; step(16); assert.equal(queue.length, 0); stop();
});
test('reduced motion: every tick has dt 0', () => {
  fresh(); const dts = []; const stop = frameLoop((dt) => dts.push(dt), { reduced: () => true });
  for (let i = 0; i < 20; i++) step(16); assert.equal(dts.length, 20); assert.ok(dts.every((d) => d === 0)); stop();
});
test('stop cancels everything', () => {
  fresh(); let n = 0; const stop = frameLoop(() => n++); step(16); stop(); step(16); step(16); assert.equal(n, 1); assert.equal(queue.length, 0);
});
