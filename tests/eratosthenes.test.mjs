// Experiment `eratosthenes` (issue #32): the shadow angles against an independent ray computation on the drawn circle,
// the central angle recovered from two shadows wherever the Sun is, C = 360 s / theta and R = s / theta (radians) against
// the arc length formula, every check answer recomputed, the mission rules and both languages without dashes.
import test from "node:test";
import assert from "node:assert/strict";
import * as M from "../site/js/lab/models/eratosthenes.js";
import E from "../site/js/lab/experiments/eratosthenes.js";
import { EXPERIMENTS, resolveRef } from "../site/js/lab/registry.js";

const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} versus ${b}`);
const angleBetween = (u, v) => (Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / Math.hypot(...u) / Math.hypot(...v)))) * 180) / Math.PI;

test("shadow angle = angle between the stick (radius) and the direction of the Sun, computed from vectors", () => {
  for (let a = 0; a <= 40; a += 2.5) for (let sigma = -25; sigma <= 35; sigma += 2.5) {
    const stick = M.town(a), sun = [-Math.sin(sigma * M.RAD), Math.cos(sigma * M.RAD)];
    assert.ok(Math.abs(M.shadowAngle(a, sigma) - angleBetween(stick, sun)) < 1e-5);   // acos loses precision near 0
  }
});

test("two shadows give back the angle at the centre wherever the Sun is", () => {
  for (let phi = 1; phi <= 40; phi += 0.7) for (let sigma = -25; sigma <= 35; sigma += 1.3) near(M.angleFromShadows(phi, sigma), phi, 1e-9);
});

test("the shadow tip lies on the ray through the top of the stick (alternate angles in action)", () => {
  for (const [a, sigma] of [[7.2, 0], [7.2, -12], [20, 5], [3, 30]]) {
    const L = 0.45, p = M.town(a), top = [p[0] * (1 + L), p[1] * (1 + L)], tip = M.shadowTip(a, sigma, L), ray = [Math.sin(sigma * M.RAD), -Math.cos(sigma * M.RAD)];
    const w = [tip[0] - top[0], tip[1] - top[1]], cross = ray[0] * w[1] - ray[1] * w[0];
    if (Math.abs(Math.tan((sigma - a) * M.RAD)) * L < 1) near(cross, 0, 1e-9);
  }
});

test("circumference and radius against the arc length s = R × theta (radians)", () => {
  for (const [s, th] of [[5000, 7.2], [800, 7.2], [1234, 11.3], [100, 1]]) {
    const R = M.radius(s, th); near(R * th * Math.PI / 180, s); near(2 * Math.PI * R, M.circumference(s, th));
  }
  near(M.circumference(5000, 7.2), 250000); near(M.circumference(800, 7.2), 40000);
});

test("every check mission's answer is the model's value at its start state; missions follow the contract", () => {
  assert.ok(EXPERIMENTS.includes(E)); assert.equal(resolveRef("eratosthenes/km").mission.id, "km");
  const kinds = E.missions.map((m) => m.kind);
  assert.equal(kinds[0], "predict"); assert.equal(kinds.at(-1), "explain"); assert.ok(E.missions.length >= 4 && E.missions.length <= 6);
  for (const m of E.missions.filter((m) => m.kind === "check")) {
    const s = { ...E.state, ...m.set }; near(M.quantity(m.quantity, s), m.answer, 1e-9); near(s.k * 1000 * 360 / M.angleFromShadows(s.phi, s.sigma), m.answer, 1e-9);
    assert.equal(s.hide, 1, `${m.id}: the asked value is hidden`);
  }
  const ex = E.missions.find((m) => m.id === "shadow"); assert.ok(ex.goal({ ...E.state, phi: 7.2 }, M.model({ ...E.state, phi: 7.2 })));
  const c = E.missions.find((m) => m.id === "sun"), B = M.model({ ...E.state, ...c.set, ...c.variants[1].set });
  near(B.zS, 12); near(B.zA, 19.2); near(B.zA - B.zS, 7.2);
  // handles: a drag to the drawn town gives back its angle; the Sun handle too
  const city = E.controls.city, sun = E.controls.sun;
  near(city.drag(E.state, ...M.town(12.3)).phi, 12.3); near(sun.drag(E.state, ...M.town(-8)).sigma, -8);
});

test("strings: [fr, en] pairs everywhere, no em or en dash", () => {
  const walk = (v) => { if (Array.isArray(v) && v.length === 2 && v.every((x) => typeof x === "string")) { for (const x of v) assert.ok(!/[–—]/.test(x), x); return; } if (v && typeof v === "object") Object.values(v).forEach(walk); };
  walk(E);
});
