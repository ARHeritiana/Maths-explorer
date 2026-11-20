// The braess challenge, pure parts: every answer recomputed by an independent method over the whole parameter range.
// Method 1: the equilibrium is the split where every used route is as fast as the fastest one (checked on the closed
// form). Method 2: brute force over every split of the drivers in units of 50, keeping the splits where no unit can
// save time by moving, and comparing their times with the answer.
import test from "node:test";
import assert from "node:assert/strict";
import { variant } from "../site/js/challenges/braess/index.js";
import { routeTimes, equilibrium, switchOnce, groupSize, before, after } from "../site/js/challenges/braess/maths.js";

const values = () => { const p = variant.params.find((x) => x.id === "n"); const out = []; for (let n = p.min; n <= p.max; n += p.step) out.push(n); return out; };

test("braess: the equilibrium makes every used route the fastest", () => {
  for (const n of values()) for (const open of [false, true]) {
    const { flows, time } = equilibrium(n, open), T = routeTimes(flows), routes = open ? ["top", "bottom", "short"] : ["top", "bottom"];
    assert.equal(flows.top + flows.bottom + flows.short, n);
    const fastest = Math.min(...routes.map((r) => T[r]));
    for (const r of routes) if (flows[r] > 0) assert.ok(Math.abs(T[r] - fastest) < 1e-9, `${n} ${open} ${r}`);
    assert.ok(Math.abs(time - fastest) < 1e-9);
  }
});

test("braess: brute force over splits in units of 50 drivers finds the same trip time", () => {
  const u = 50;
  for (const n of values()) for (const open of [false, true]) {
    const k = n / u, times = [];
    for (let a = 0; a <= k; a++) for (let b = 0; a + b <= k; b++) {
      const c = k - a - b;
      if (!open && c > 0) continue;
      const f = { top: a * u, bottom: b * u, short: c * u }, T = routeTimes(f);
      const routes = open ? ["top", "bottom", "short"] : ["top", "bottom"];
      let stable = true;
      for (const r of routes) if (f[r] > 0) for (const s of routes) if (s !== r && routeTimes({ ...f, [r]: f[r] - u, [s]: f[s] + u })[s] < T[r] - 1e-9) stable = false;
      if (stable) times.push(Math.max(...routes.filter((r) => f[r] > 0).map((r) => T[r])));
    }
    assert.ok(times.length > 0, `${n}: some stable split`);
    const target = open ? variant.answer({ n }) : before(n);
    for (const t of times) assert.ok(Math.abs(t - target) <= 1, `${n} ${open}: ${t} vs ${target}`);   // one unit of 50 cars moves a time by at most 1 minute
  }
});

test("braess: the textbook numbers, and the answer is a whole number for every value", () => {
  assert.equal(before(4000), 65); assert.equal(after(4000), 80); assert.equal(variant.answer({ n: 4000 }), 80);
  for (const n of values()) { assert.ok(Number.isInteger(variant.answer({ n })) && variant.answer({ n }) >= 0, String(n)); }
  // the shortcut slows everyone exactly when 3000 < N < 9000
  for (const n of values()) assert.equal(after(n) > before(n), n > 3000 && n < 9000, String(n));
});

test("braess: selfish switching in groups ends where nobody gains, at the answer", () => {
  for (const n of values()) for (const open of [false, true]) {
    let f = { top: n, bottom: 0, short: 0 }, steps = 0;
    for (let r; (r = switchOnce(f, open, groupSize(n))) && steps < 1000; steps++) f = r.flows;
    assert.ok(steps < 1000, "it stops");
    const T = routeTimes(f), routes = open ? ["top", "bottom", "short"] : ["top", "bottom"];
    const worst = Math.max(...routes.filter((r) => f[r] > 0).map((r) => T[r]));
    assert.ok(Math.abs(worst - (open ? after(n) : before(n))) <= groupSize(n) / 100 + 1e-9, `${n} ${open}: ${worst}`);
  }
});
