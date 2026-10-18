// Laboratory v2 (docs/LAB_DESIGN.md sections 3 to 7): registry consistency, the control-count rule of every mission, every
// string a [fr, en] pair without em or en dashes, every `check` answer recomputed independently from the maths, the goals
// reachable, the handles consistent with their models, and the pure models. Drawing and dragging are in dom-smoke.mjs and
// lab_browser.py.
import test from "node:test";
import assert from "node:assert/strict";
import { EXPERIMENTS, TEMPLATES, TEMPLATE_INFO, resolveRef, allRefs, parseRef, catalogue } from "../dist/js/lab/registry.js";
import { KINDS } from "../dist/js/lab/shell.js";
import { makeFormat } from "../dist/js/lab/engine.js";
import { snap } from "../dist/js/lab/models/num.js";
import * as Q from "../dist/js/lab/models/quadratic.js";
import * as T from "../dist/js/lab/models/trig.js";
import * as D from "../dist/js/lab/models/derivative.js";
import * as I from "../dist/js/lab/models/integral.js";
import * as S from "../dist/js/lab/models/sequences.js";

const near = (a, b, tol = 1e-9, msg = "") => assert.ok(Math.abs(a - b) <= tol, `${msg} ${a} != ${b}`);
const byId = Object.fromEntries(EXPERIMENTS.map((e) => [e.id, e]));
const DASH = /[–—]/;
const isPair = (p) => Array.isArray(p) && p.length === 2 && p.every((x) => typeof x === "string" && x.trim().length > 0);

test("the registry lists five experiments with consistent ids, templates and references", async () => {
  assert.deepEqual(EXPERIMENTS.map((e) => e.id), ["quadratic", "trig", "sequences", "derivative", "integral"]);
  assert.equal(new Set(EXPERIMENTS.map((e) => e.id)).size, EXPERIMENTS.length);
  for (const e of EXPERIMENTS) {
    assert.ok(e.template in TEMPLATES && e.template in TEMPLATE_INFO, e.id);
    assert.equal(typeof (await TEMPLATES[e.template]()).mount, "function", e.id);
    assert.ok(e.missions.length >= 4 && e.missions.length <= 6, `${e.id}: 4 to 6 missions`);
    assert.equal(new Set(e.missions.map((m) => m.id)).size, e.missions.length, `${e.id}: mission ids are unique`);
    for (const k of ["model", "state", "controls", "views", "missions", "conclusion", "history", "symbol", "duration"]) assert.ok(e[k] !== undefined, `${e.id}.${k}`);
    for (const k of ["model", "quantity", "quantities"]) assert.ok(e.model[k], `${e.id}.model.${k}`);
    for (const m of e.missions) assert.ok(m.kind in KINDS, `${e.id}/${m.id} kind`);
    assert.equal(resolveRef(e.id).experiment, e);
    for (const [i, m] of e.missions.entries()) assert.equal(resolveRef(`${e.id}/${m.id}`).index, i);
  }
  assert.equal(resolveRef("quadratic/nope"), null);
  assert.equal(resolveRef("nope"), null);
  assert.deepEqual(parseRef("quadratic/vertex"), { id: "quadratic", mission: "vertex" });
  assert.equal(allRefs().length, EXPERIMENTS.length + EXPERIMENTS.reduce((n, e) => n + e.missions.length, 0));
  assert.deepEqual(catalogue().map((c) => c.id), EXPERIMENTS.map((e) => e.id));
});

test("each experiment follows the research rules: predict first, a translation, explain last, evidence not proof", () => {
  for (const e of EXPERIMENTS) {
    const kinds = e.missions.map((m) => m.kind);
    assert.equal(kinds[0], "predict", `${e.id}: R3 predict first`);
    assert.deepEqual(e.missions[0].unlock ?? [], [], `${e.id}: controls are locked in the prediction`);
    assert.equal(kinds.at(-1), "explain", `${e.id}: ends with a Why?`);
    assert.equal(kinds.filter((k) => k === "explain").length, 1);
    assert.ok(kinds.includes("check"), `${e.id}: R4 at least one mission translates between views`);
    assert.ok(kinds.includes("explore"), e.id);
    assert.ok(e.missions.at(-1).prompt[0].startsWith("Pourquoi") && e.missions.at(-1).prompt[1].startsWith("Why"), `${e.id}: R2 the explain mission asks Why?`);
    assert.ok(isPair(e.missions.at(-1).argument), `${e.id}: the argument is revealed after an attempt`);
    for (const m of e.missions.filter((x) => x.kind === "predict")) {
      assert.ok(m.choices.length >= 2 && Number.isInteger(m.correct) && m.correct < m.choices.length, `${e.id}/${m.id}`);
    }
  }
});

test("a mission unlocks at most 2 handles, 1 slider and 1 choice (R6), and only controls that exist", () => {
  for (const e of EXPERIMENTS) {
    for (const m of e.missions) {
      const ids = m.unlock ?? [];
      const kinds = ids.map((id) => { assert.ok(e.controls[id], `${e.id}/${m.id}: unknown control ${id}`); return e.controls[id].kind; });
      const count = (k) => kinds.filter((x) => x === k).length;
      assert.ok(count("handle") <= 2, `${e.id}/${m.id}: handles`);
      assert.ok(count("slider") + count("scrubber") <= 1, `${e.id}/${m.id}: sliders`);
      // the A / B buttons of a contrast mission are its one choice
      assert.ok(count("choice") + (m.variants ? 1 : 0) <= 1, `${e.id}/${m.id}: choices`);
      assert.equal(new Set(ids).size, ids.length);
      if (m.kind === "predict") assert.equal(ids.length, 0);
      if (m.kind === "explore") assert.ok(ids.length > 0, `${e.id}/${m.id}: an exploration unlocks something`);
    }
    for (const [id, c] of Object.entries(e.controls)) {
      assert.ok(["handle", "slider", "scrubber", "choice"].includes(c.kind), `${e.id}.${id}`);
      assert.ok(isPair(c.label), `${e.id}.${id}.label`);
      if (c.kind === "handle") assert.ok(typeof c.at === "function" && typeof c.drag === "function");
      if (c.kind === "slider" || c.kind === "scrubber") assert.ok(c.key in e.state || (c.get && c.set), `${e.id}.${id}`);
      if (c.kind === "choice") for (const o of c.options) assert.ok(isPair(o.label) && "value" in o);
      if (c.play) assert.equal(c.kind, "scrubber", "only scrubbers play");
      if (c.play) assert.equal(e.template, "process", "play belongs to the process template");
    }
  }
});

test("every `set` key is a state key, and every mission starts from a complete state", () => {
  for (const e of EXPERIMENTS) {
    for (const m of e.missions) {
      for (const k of Object.keys(m.set ?? {})) assert.ok(k in e.state, `${e.id}/${m.id}: set.${k}`);
      for (const v of m.variants ?? []) {
        assert.equal(m.variants.length, 2, "A and B");
        assert.ok(isPair(v.label));
        for (const k of Object.keys(v.set)) assert.ok(k in e.state, `${e.id}/${m.id}: variant ${k}`);
      }
      const start = { ...e.state, ...m.set };
      const M = e.model.model(start);
      assert.ok(M && Object.values(M).every((v) => typeof v !== "number" || Number.isFinite(v) || v === Infinity), `${e.id}/${m.id}: finite model`);
      for (const v of m.variants ?? []) e.model.model({ ...start, ...v.set });
    }
  }
});

// Every visible string, found by walking the data of an experiment: pairs must be [fr, en] without em or en dashes.
function visibleStrings(e) {
  const out = [];
  const add = (p, where) => out.push([p, where]);
  for (const k of ["title", "short", "intro", "level", "prereq", "group", "conclusion"]) add(e[k], `${e.id}.${k}`);
  add(e.history.title, `${e.id}.history.title`); add(e.history.story, `${e.id}.history.story`);
  for (const [id, c] of Object.entries(e.controls)) { add(c.label, `${e.id}.${id}`); for (const o of c.options ?? []) add(o.label, `${e.id}.${id}.option`); }
  if (e.views.table) { add(e.views.table.caption, `${e.id}.table`); if (Array.isArray(e.views.table.head)) e.views.table.head.forEach((h) => add(h, `${e.id}.table.head`)); }
  for (const m of e.missions) {
    for (const k of ["prompt", "hint", "done", "because", "argument"]) if (m[k] !== undefined) add(m[k], `${e.id}/${m.id}.${k}`);
    for (const c of m.choices ?? []) add(c, `${e.id}/${m.id}.choice`);
    for (const v of m.variants ?? []) add(v.label, `${e.id}/${m.id}.variant`);
  }
  return out;
}
test("every string is a [fr, en] pair without em or en dashes, with decimal commas in French", () => {
  for (const e of EXPERIMENTS) {
    for (const [p, where] of visibleStrings(e)) {
      assert.ok(isPair(p), `${where} must be a [fr, en] pair`);
      for (const s of p) assert.ok(!DASH.test(s), `${where}: dash in "${s}"`);
      assert.ok(!/\d\.\d/.test(p[0]), `${where}: French uses a decimal comma: ${p[0]}`);
    }
    assert.match(e.history.source, /^https:\/\/mathshistory\.st-andrews\.ac\.uk\//);
  }
});

// Sample states for the formulas, readouts and tables: both languages, no NaN, no dash, decimal comma in French.
test("formula, readout, table and labels stay finite, bilingual and dash-free over the sampled states", () => {
  const samples = {
    quadratic: [{ a: 1, b: 0, c: -2 }, { a: -3, b: 6, c: -3 }, { a: 0.25, b: -1.5, c: 7 }, { a: 2, b: -8, c: 6 }, { a: -1, b: 0, c: 0 }],
    trig: [0, 30, 45, 90, 135, 150, 180, 225, 270, 305, 360].flatMap((deg) => ["none", "supplementary", "plusPi", "opposite", "complementary"].map((assoc) => ({ deg, assoc, fn: deg % 2 ? "cos" : "sin" }))),
    sequences: [{ mode: "arith", u0: 2, r: 3, q: 2, n: 6 }, { mode: "geom", u0: -3, q: -2.5, r: 0, n: 10 }, { mode: "geom", u0: 0.5, q: 0, r: 1, n: 1 }, { mode: "arith", u0: 5, r: -4, q: 1, n: 10 }],
    derivative: [{ x: 1, h: 1 }, { x: -3, h: -0.001 }, { x: 0, h: 0.05 }, { x: 3, h: 2 }],
    integral: [{ a: 0, b: 1, n: 1, method: "left" }, { a: -1, b: 2.5, n: 40, method: "mid" }, { a: 1, b: 1.25, n: 7, method: "right" }],
  };
  for (const e of EXPERIMENTS) {
    for (const lang of ["fr", "en"]) {
      const fmt = makeFormat(lang), ctx = { fmt, lang };
      for (const s of samples[e.id]) {
        const texts = [e.views.formula(s, ctx), ...e.views.readout(s, ctx).flat().map((x) => fmt.t(x))];
        if (e.views.table) {
          const head = typeof e.views.table.head === "function" ? e.views.table.head(s, ctx) : e.views.table.head;
          const data = e.views.table.data(s, ctx);
          texts.push(...head.map((h) => fmt.t(h)), ...data.rows.flat());
          assert.ok(data.rows.length >= 5 && data.rows.every((r) => r.length === head.length), `${e.id}: fixed table shape`);
        }
        const text = texts.join(" | ");
        assert.ok(!/NaN|undefined|null|\[object/.test(text), `${e.id} ${lang} ${JSON.stringify(s)}: ${text}`);
        assert.ok(!DASH.test(text), `${e.id}: dash in ${text}`);
        if (lang === "fr") assert.ok(!/\d\.\d/.test(text), `${e.id}: decimal comma in French: ${text}`);
        for (const [id, c] of Object.entries(e.controls)) if (c.kind === "handle") {
          const at = c.at(s);
          assert.ok(at.every(Number.isFinite), `${e.id}.${id}.at`);
          assert.ok(!c.valuetext || !/NaN|undefined/.test(c.valuetext(s, fmt)));
        }
        // the readout has a fixed number of slots for the whole experiment (no element is added while dragging)
        assert.equal(e.views.readout(s, ctx).length, e.views.readout(samples[e.id][0], ctx).length);
      }
    }
  }
});

// ---- the answers of the check missions, recomputed by other routes than the model
const independent = {
  // the parabola's lowest point found by scanning, its sign changes counted on a fine grid
  "quadratic/read": ({ a, b, c }) => { let best = Infinity; for (let i = -10000; i <= 10000; i++) { const x = i / 1000; best = Math.min(best, a * x * x + b * x + c); } return best; },
  // sine of 150 degrees from the Taylor series of sine at the reflected angle (pi - x), a different route than Math.sin(x)
  "trig/read": ({ deg }) => { const x = Math.PI - (deg * Math.PI) / 180; let term = x, sum = x; for (let k = 1; k < 25; k++) { term *= -(x * x) / ((2 * k) * (2 * k + 1)); sum += term; } return sum; },
  // the fifth term of a geometric sequence by repeated multiplication
  "sequences/formula": ({ u0, q }) => { let u = u0; for (let k = 0; k < 5; k++) u *= q; return u; },
  // tangent slope as the limit of symmetric difference quotients
  "derivative/slope": ({ x }) => { const h = 1e-5; return ((x + h) ** 2 - (x - h) ** 2) / (2 * h); },
  // area under x^2 on [a, b] by a very fine midpoint sum
  "integral/area": ({ a, b }) => { const n = 400000, w = (b - a) / n; let s = 0; for (let i = 0; i < n; i++) { const x = a + (i + 0.5) * w; s += x * x * w; } return s; },
};
test("every check answer equals the model quantity and an independent computation", () => {
  let checked = 0;
  for (const e of EXPERIMENTS) {
    for (const m of e.missions.filter((x) => x.kind === "check")) {
      const start = { ...e.state, ...m.set };
      assert.ok(m.quantity in e.model.quantities, `${e.id}/${m.id}: quantity ${m.quantity}`);
      const fromModel = e.model.quantity(m.quantity, start);
      near(fromModel, m.answer, m.tolerance ?? 1e-9, `${e.id}/${m.id} model`);
      const key = `${e.id}/${m.id}`, check = independent[key];
      assert.ok(check, `${key} needs an independent recomputation in this test`);
      near(check(start), m.answer, Math.max(m.tolerance ?? 0, 1e-6), `${key} independent`);
      assert.ok(m.tolerance === undefined || (m.tolerance > 0 && m.tolerance <= 0.01), `${key}: tolerance`);
      checked++;
    }
  }
  assert.equal(checked, 5);
});

test("every prediction has the correct answer according to the mathematics", () => {
  const truth = {
    // a < 0 with the vertex kept in place: the curve eventually falls
    quadratic: () => { const s = { a: -1, ...Q.fromVertex(-1, 0, -2) }, m = Q.model({ ...s, c: s.c }); return m.f(100) < m.f(0) ? "down" : "up"; },
    // cos 180 degrees
    trig: () => Math.round(T.trigValues(180).cos),
    // arithmetic terms lie on a line: equal second differences
    sequences: () => { const t = S.terms({ mode: "arith", u0: 2, r: 3 }, 8); return t.slice(2).every((v, i) => Math.abs(v - 2 * t[i + 1] + t[i]) < 1e-12) ? "line" : "other"; },
    // secant slopes settle
    derivative: () => (Math.abs(D.slope(1, 1e-7) - D.slope(1, -1e-7)) < 1e-6 && Math.abs(D.slope(1, 1e-6) - 2) < 1e-5 ? "settles" : "other"),
    // left rectangles of an increasing function lie below the area
    integral: () => (I.sum(0, 1, 4, "left") < I.exact(0, 1) ? "smaller" : "other"),
  };
  const expected = { quadratic: "down", trig: -1, sequences: "line", derivative: "settles", integral: "smaller" };
  for (const e of EXPERIMENTS) {
    assert.equal(truth[e.id](), expected[e.id], e.id);
    const m = e.missions[0];
    const right = m.choices[m.correct][0];
    const words = { quadratic: /bas/, trig: /^−1$/, sequences: /droite/, derivative: /stabilise/, integral: /petite/ }[e.id];
    assert.match(right, words, `${e.id}: the marked choice is the true one`);
  }
});

// A state at which each exploration goal holds, and the start state where it must not.
const witness = {
  "quadratic/sign": { a: -1, b: 0, c: -2 },
  "quadratic/vertex": { a: 1, b: -4, c: 3 },
  "trig/quadrants": { deg: 120 },
  "trig/exact": { deg: 60 },
  "sequences/difference": { r: -2 },
  "sequences/signs": { mode: "geom", q: -1.5, n: 6 },
  "derivative/approach": { h: 0.01 },
  "derivative/where": { x: 0 },
  "integral/finer": { n: 30 },
  "integral/bound": { b: 2 },
};
test("every exploration goal is false at the start and true at a reachable state", () => {
  let n = 0;
  for (const e of EXPERIMENTS) {
    for (const m of e.missions.filter((x) => x.kind === "explore")) {
      const start = { ...e.state, ...m.set }, key = `${e.id}/${m.id}`;
      assert.ok(typeof m.goal === "function" && isPair(m.done), key);
      assert.ok(!m.goal(start, e.model.model(start)), `${key}: goal false at start`);
      const goal = { ...start, ...witness[key] };
      assert.ok(witness[key], `${key} needs a witness`);
      assert.ok(m.goal(goal, e.model.model(goal)), `${key}: goal true at the witness`);
      n++;
    }
  }
  assert.equal(n, Object.keys(witness).length);
});

// Handles: dragging to a handle's own position leaves the state, and arrows move by one grid step either way.
test("handles are consistent with their models: round trip, clamping and keyboard steps", () => {
  for (const e of EXPERIMENTS) {
    const states = e.missions.map((m) => ({ ...e.state, ...m.set }));
    for (const [id, c] of Object.entries(e.controls).filter(([, x]) => x.kind === "handle")) {
      const g = Array.isArray(c.grid) ? c.grid : [c.grid || 0, c.grid || 0];
      for (const s of states) {
        const [x, y] = c.at(s), axis = c.axis || "xy";
        // a state off the grid (the derivative's h = 0.01 is smaller than the finest handle step) is not a round trip
        if ((axis.includes("x") && Math.abs(snap(x, g[0]) - x) > 1e-9) || (axis.includes("y") && Math.abs(snap(y, g[1]) - y) > 1e-9)) continue;
        const next = c.drag(s, snap(x, g[0]), snap(y, g[1]));
        const after = { ...s, ...(next ?? {}) };
        const [x2, y2] = c.at(after);
        near(x2, x, 1e-9, `${e.id}.${id} round trip x`);
        near(y2, y, 1e-9, `${e.id}.${id} round trip y`);
        // far away drags clamp and never produce NaN
        for (const [fx, fy] of [[100, 100], [-100, -100], [0, 100], [100, 0]]) {
          const far = c.drag(s, fx, fy);
          if (far) for (const v of Object.values(far)) assert.ok(Number.isFinite(v), `${e.id}.${id} far drag`);
        }
        // arrows: a step in one direction then back returns to the start (or the step is blocked at a limit)
        const stepOf = (st, dx, dy) => {
          if (c.nudge) return c.nudge(st, dx, dy);
          const axis = c.axis || "xy";
          if (axis === "x") { dx = dx || dy; dy = 0; } else if (axis === "y") { dy = dy || dx; dx = 0; }
          const [px, py] = c.at(st);
          return c.drag(st, snap(px + dx * g[0], g[0]), snap(py + dy * g[1], g[1]));
        };
        const up = { ...s, ...(stepOf(s, 1, 1) ?? {}) }, back = { ...up, ...(stepOf(up, -1, -1) ?? {}) };
        if (Object.keys(s).every((k) => up[k] === s[k])) continue;   // blocked at a limit of the range
        for (const k of Object.keys(s)) if (typeof s[k] === "number") near(back[k], s[k], 1e-9, `${e.id}.${id} step back ${k}`);
      }
    }
  }
});

test("scrubbers and sliders map to the state and back", () => {
  for (const e of EXPERIMENTS) {
    for (const [id, c] of Object.entries(e.controls).filter(([, x]) => x.kind === "slider" || x.kind === "scrubber")) {
      for (const s of e.missions.map((m) => ({ ...e.state, ...m.set }))) {
        const v = c.get ? c.get(s) : s[c.key];
        assert.ok(v >= c.min - 1e-9 && v <= c.max + 1e-9, `${e.id}.${id} value ${v} in range`);
        const back = { ...s, ...(c.set ? c.set(s, v) : { [c.key]: v }) };
        for (const k of Object.keys(s)) if (typeof s[k] === "number") near(back[k], s[k], 1e-6, `${e.id}.${id} ${k}`);
      }
      for (const p of [c.min, (c.min + c.max) / 2, c.max]) { const r = c.set ? c.set(e.state, p) : { [c.key]: p }; assert.ok(Object.values(r).every((x) => typeof x !== "number" || Number.isFinite(x))); }
    }
  }
});

test("a slider or scrubber of an experiment follows a monotone scale (the derivative scrubber shrinks |h|)", () => {
  const c = byId.derivative.controls.h, s = { x: 1, h: 1 };
  let last = Infinity;
  for (let p = c.min; p <= c.max + 1e-9; p += 0.25) { const h = Math.abs(c.set(s, p).h); assert.ok(h <= last + 1e-12); last = h; }
  near(Math.abs(c.set(s, c.max).h), 0.001, 1e-12);
  assert.ok(c.set({ x: 1, h: -1 }, 5).h < 0, "the side is kept");
});

// ---- the pure models
test("quadratic: vertex form, roots and discriminant agree with the coefficients", () => {
  for (const a of [-3, -1, -0.25, 0.5, 1, 2.75]) for (const alpha of [-4, -0.5, 0, 1.5, 5]) for (const beta of [-5, 0, 2.5, 7]) {
    const { b, c } = Q.fromVertex(a, alpha, beta), m = Q.model({ a, b, c });
    near(m.alpha, alpha, 1e-12); near(m.beta, beta, 1e-12);
    near(m.discriminant, b * b - 4 * a * c, 1e-9);
    for (const r of m.roots) near(a * r * r + b * r + c, 0, 1e-9);
    assert.equal(m.roots.length, m.discriminant > 0 ? 2 : m.discriminant === 0 ? 1 : 0);
    near(m.f(alpha + 0.7), m.f(alpha - 0.7), 1e-9, "symmetry about x = alpha");
  }
  assert.equal(Q.quantity("rootCount", { a: 1, b: 0, c: -4 }), 2);
  assert.equal(Q.quantity("rootCount", { a: 1, b: 0, c: 0 }), 1);
  assert.equal(Q.quantity("rootCount", { a: 1, b: 0, c: 3 }), 0);
  assert.equal(Q.model({ a: 1, b: 0, c: 0 }).alpha, 0);
  assert.ok(!Object.is(Q.fromVertex(1, 0, 0).b, -0));
});

test("trigonometry: exact values, associated angles, and the circle and graph share the angle", () => {
  const close = (a, b) => near(a, b, 1e-10);
  assert.deepEqual(T.trigValues(30).exact, ["√3/2", "1/2"]);
  assert.deepEqual(T.trigValues(225).exact, ["−√2/2", "−√2/2"]);
  assert.deepEqual(T.trigValues(-90).exact, ["0", "−1"]);
  assert.deepEqual(T.trigValues(720).exact, ["1", "0"]);
  assert.equal(T.trigValues(31).exact, null);
  const evaluate = (s) => ({ "0": 0, "1": 1, "−1": -1, "1/2": 0.5, "−1/2": -0.5, "√2/2": Math.SQRT1_2, "−√2/2": -Math.SQRT1_2, "√3/2": Math.sqrt(3) / 2, "−√3/2": -Math.sqrt(3) / 2 })[s];
  for (const d of T.remarkableAngles) { const q = T.trigValues(d); close(evaluate(q.exact[0]), Math.cos((d * Math.PI) / 180)); close(evaluate(q.exact[1]), Math.sin((d * Math.PI) / 180)); }
  assert.equal(T.radiansLabel(330), "11π/6"); assert.equal(T.radiansLabel(-135), "−3π/4"); assert.equal(T.radiansLabel(360), "2π");
  const expected = { plusPi: [(q) => -q.cos, (q) => -q.sin], minusPi: [(q) => -q.cos, (q) => -q.sin], plusHalfPi: [(q) => -q.sin, (q) => q.cos], minusHalfPi: [(q) => q.sin, (q) => -q.cos], opposite: [(q) => q.cos, (q) => -q.sin], supplementary: [(q) => -q.cos, (q) => q.sin], complementary: [(q) => q.sin, (q) => q.cos], fullTurn: [(q) => q.cos, (q) => q.sin] };
  for (const x of [-410, -90, 0, 30, 45, 60, 179, 225, 360, 721]) for (const [key, r] of Object.entries(T.relations)) {
    const q = T.trigValues(x), v = T.trigValues(r.transform(x));
    close(v.cos, expected[key][0](q)); close(v.sin, expected[key][1](q));
  }
  for (const assoc of Object.keys(T.relations)) for (const deg of [0, 15, 90, 200, 360]) {
    const m = T.model({ deg, assoc });
    close(m.p.cos ** 2 + m.p.sin ** 2, 1); close(m.q.cos ** 2 + m.q.sin ** 2, 1);
  }
  assert.equal(T.model({ deg: 40, assoc: "none" }).q, null);
});

test("derivative: the slope is the quotient, equal to 2x + h, and tends to 2x from both sides", () => {
  for (const x of [-3, -0.25, 0, 1, 2.5]) for (const h of [-2, -0.5, -0.001, 0.001, 0.05, 1, 2]) {
    near(D.slope(x, h), 2 * x + h, 1e-9);
    near(D.model({ x, h }).gap, h, 1e-9);
  }
  near(D.slope(1, 1e-7), 2, 1e-6); near(D.slope(1, -1e-7), 2, 1e-6);
  assert.throws(() => D.slope(1, 0));
  assert.equal(D.quantity("tangent", { x: 3, h: 1 }), 6);
});

test("integral: sums agree with closed forms, bracket the exact area, and converge", () => {
  const close = (a, b) => near(a, b, 1e-12);
  for (const n of [1, 2, 4, 10, 25, 40]) {
    close(I.sum(0, 1, n, "left"), 1 / 3 - 1 / (2 * n) + 1 / (6 * n * n));
    close(I.sum(0, 1, n, "right"), 1 / 3 + 1 / (2 * n) + 1 / (6 * n * n));
    close(I.sum(0, 1, n, "mid"), 1 / 3 - 1 / (12 * n * n));
    close(I.sum(0, 1, n, "right") - I.sum(0, 1, n, "left"), 1 / n);
  }
  for (const [a, b] of [[0, 1], [1, 2], [0, 2.5], [-1, 1], [-1, 2.25]]) {
    close(I.exact(a, b), (b ** 3 - a ** 3) / 3);
    for (const n of [3, 20]) { const l = I.sum(a, b, n, "left"), r = I.sum(a, b, n, "right"), e = I.exact(a, b); if (a >= 0) assert.ok(l <= e && e <= r, `${a},${b},${n}`); }
  }
  assert.equal(I.rectangles(0, 1, 5, "left").length, 5);
  assert.throws(() => I.sum(0, 1, 0, "left")); assert.throws(() => I.sum(1, 1, 3, "left")); assert.throws(() => I.sum(0, 1, 3, "top"));
  near(I.model({ a: 0, b: 1, n: 8, method: "left" }).error, I.sum(0, 1, 8, "left") - 1 / 3, 1e-12);
});

test("sequences: terms follow the closed forms, including negative and zero ratios", () => {
  for (const u0 of [-3, 0.5, 2]) for (const r of [-4, 0, 3]) {
    const t = S.terms({ mode: "arith", u0, r }, 10);
    t.forEach((v, k) => near(v, u0 + k * r, 1e-12));
    t.slice(1).forEach((v, k) => near(v - t[k], r, 1e-12));
  }
  for (const u0 of [-3, 0.5, 2]) for (const q of [-2.5, -1, 0, 0.25, 1.5]) {
    const t = S.terms({ mode: "geom", u0, q }, 10);
    t.forEach((v, k) => near(v, u0 * q ** k, 1e-9));
    if (q < 0) t.slice(1).forEach((v, k) => assert.ok(Math.sign(v) === -Math.sign(t[k]) || v === 0));
  }
  const m = S.model({ mode: "geom", u0: 3, q: 2, r: 0, n: 4 });
  assert.deepEqual(m.terms, [3, 6, 12, 24, 48]); assert.equal(m.last, 48); assert.equal(m.total, 93);
  assert.equal(S.quantity("u5", { mode: "geom", u0: 3, q: 2 }), 96);
});

test("number formatting follows the French and English conventions", () => {
  const fr = makeFormat("fr"), en = makeFormat("en");
  assert.equal(fr.num(1.5), "1,5"); assert.equal(en.num(1.5), "1.5");
  assert.equal(fr.num(-0.25), "−0,25"); assert.equal(fr.num(-0), "0"); assert.equal(fr.num(2), "2"); assert.equal(fr.num(0.1 + 0.2), "0,3");
  assert.equal(fr.pt(1, -2.5), "(1 ; −2,5)"); assert.equal(en.pt(1, -2.5), "(1, −2.5)");
  assert.equal(fr.iv(0, 1), "[0 ; 1]"); assert.equal(en.iv(0, 1), "[0, 1]");
  assert.equal(fr.t(["a", "b"]), "a"); assert.equal(en.t(["a", "b"]), "b");
  assert.equal(snap(0.3, 0.05), 0.3); assert.equal(snap(7.4, 0.5), 7.5);
});
