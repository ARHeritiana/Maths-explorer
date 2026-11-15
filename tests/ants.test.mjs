// The ants challenge, pure parts: the ghost model (maths.js) against a step-by-step simulation in which ants really
// collide and turn back, and the answer (L) against an exhaustive search over every start on short sticks.
import test from "node:test";
import assert from "node:assert/strict";
import { antStart, antsAt, lastFall, bumps } from "../site/js/challenges/ants/maths.js";
import { variant } from "../site/js/challenges/ants/index.js";

// Independent simulation: positions in whole cm, steps of half a second; ants meet exactly on a point and both turn.
function simulate(start, L) {
  const ants = start.map((a) => ({ x: a.x, d: a.d, fallT: null, side: 0 })), frames = [];
  let t = 0;
  const fall = () => { for (const a of ants) if (a.fallT === null && ((a.x <= 0 && a.d < 0) || (a.x >= L && a.d > 0))) { a.fallT = t; a.side = a.d; } };
  fall(); frames.push({ t, xs: ants.map((a) => (a.fallT === null ? a.x : null)) });
  let meetings = 0;
  while (ants.some((a) => a.fallT === null)) {
    for (const a of ants) if (a.fallT === null) a.x += a.d / 2;
    t += 0.5;
    const live = ants.filter((a) => a.fallT === null);
    for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length; j++) if (live[i].x === live[j].x && live[i].d !== live[j].d) { live[i].d *= -1; live[j].d *= -1; meetings++; }
    fall(); frames.push({ t, xs: ants.map((a) => (a.fallT === null ? a.x : null)) });
  }
  return { ants, frames, meetings, end: Math.max(...ants.map((a) => a.fallT)) };
}

test("ants: the ghost model gives the same positions and falls as a real simulation, for many starts", () => {
  for (const L of [20, 37, 100, 200]) for (let n = 2; n <= 12; n++) {
    const start = antStart(L, n), sim = simulate(start, L);
    assert.equal(lastFall(start, L), sim.end, `L=${L} n=${n} last fall`);
    sim.ants.forEach((a, i) => assert.equal(antsAt(start, L, a.fallT + 1e-9)[i].fallen, a.side, `L=${L} n=${n} ant ${i} falls on its side`));
    for (const f of sim.frames) {
      const st = antsAt(start, L, f.t + 1e-9);
      f.xs.forEach((x, i) => { if (x !== null) assert.ok(Math.abs(st[i].x - x) < 1e-6, `L=${L} n=${n} t=${f.t} ant ${i}: ${st[i].x} vs ${x}`); });
    }
    assert.equal(bumps(start, L).length, sim.meetings, `L=${L} n=${n} meetings`);
  }
});

test("ants: over every start on short sticks, the longest wait is exactly L (the answer)", () => {
  for (let L = 2; L <= 6; L++) for (let n = 1; n <= 3; n++) {
    let best = 0;
    const place = (k, used, acc) => {
      if (k === n) {
        for (let m = 0; m < 1 << n; m++) best = Math.max(best, simulate(acc.map((x, i) => ({ x, d: m >> i & 1 ? 1 : -1 })), L).end);
        return;
      }
      for (let x = 0; x <= L; x++) if (!used.has(x)) { used.add(x); place(k + 1, used, [...acc, x]); used.delete(x); }
    };
    place(0, new Set(), []);
    assert.equal(best, L, `L=${L} n=${n}`);
  }
  for (const L of [20, 100, 200]) assert.equal(variant.answer({ L, n: 5 }), L);
});
