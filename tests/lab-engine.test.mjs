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
import * as P from "../dist/js/lab/models/probability.js";
import * as V from "../dist/js/lab/models/vectors.js";
import * as ST from "../dist/js/lab/models/statistics.js";
import * as C from "../dist/js/lab/models/complex.js";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { labs, pathways, pathwayStages } from "../dist/js/content.js";

const near = (a, b, tol = 1e-9, msg = "") => assert.ok(Math.abs(a - b) <= tol, `${msg} ${a} != ${b}`);
const byId = Object.fromEntries(EXPERIMENTS.map((e) => [e.id, e]));
const DASH = /[–—]/;
const isPair = (p) => Array.isArray(p) && p.length === 2 && p.every((x) => typeof x === "string" && x.trim().length > 0);

test("the registry lists nine experiments with consistent ids, templates and references", async () => {
  assert.deepEqual(EXPERIMENTS.map((e) => e.id), ["quadratic", "trig", "sequences", "derivative", "integral", "probability", "vectors", "statistics", "complex"]);
  assert.deepEqual([...new Set(EXPERIMENTS.map((e) => e.template))], ["family", "process", "chance", "figure", "data", "transform"], "six templates are in use");
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
      // the buttons of an action (run 10 experiments) count as the mission's one choice, like the A / B buttons of a contrast
      assert.ok(count("choice") + count("action") + (m.variants ? 1 : 0) <= 1, `${e.id}/${m.id}: choices`);
      assert.equal(new Set(ids).size, ids.length);
      if (m.kind === "predict") assert.equal(ids.length, 0);
      if (m.kind === "explore") assert.ok(ids.length > 0, `${e.id}/${m.id}: an exploration unlocks something`);
    }
    for (const [id, c] of Object.entries(e.controls)) {
      assert.ok(["handle", "slider", "scrubber", "choice", "action"].includes(c.kind), `${e.id}.${id}`);
      assert.ok(isPair(c.label), `${e.id}.${id}.label`);
      if (c.kind === "handle") assert.ok(typeof c.at === "function" && typeof c.drag === "function");
      if (c.kind === "slider" || c.kind === "scrubber") assert.ok(c.key in e.state || (c.get && c.set), `${e.id}.${id}`);
      if (c.kind === "choice" || c.kind === "action") for (const o of c.options) assert.ok(isPair(o.label) && "value" in o);
      if (c.kind === "action") assert.equal(typeof c.act, "function", `${e.id}.${id}.act`);
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
    probability: [{ n: 10, p: 0.3, runs: 0, seed: 2, theory: 0 }, { n: 1, p: 1, runs: 1000, seed: 5, theory: 1 }, { n: 12, p: 0, runs: 10, seed: 9, theory: 1 }, { n: 8, p: 0.25, runs: 5000, seed: 21, theory: 0 }],
    vectors: [{ ux: 3, uy: 1, vx: -1, vy: 3 }, { ux: 0, uy: 0, vx: 0, vy: 0 }, { ux: 2, uy: 1, vx: -4, vy: -2 }, { ux: -4, uy: 4, vx: 4, vy: -3.5 }, { ux: 1, uy: 0, vx: 0, vy: -1 }],
    statistics: [{ data: [2, 3, 4, 4, 5, 6, 9], hide: 0 }, { data: [1, 2, 4, 5, 7, 8, 12], hide: 1 }, { data: [0, 0, 0, 0, 0, 0, 0], hide: 0 }, { data: [20, 0.5, 20, 7.5, 7.5, 7.5, 3], hide: 0 }],
    complex: [{ r: 1, theta: 0, tx: 1, ty: 2, mode: "multiply", hide: 0 }, { r: 0, theta: 90, tx: -2.5, ty: 0, mode: "multiply", hide: 0 }, { r: Math.SQRT2, theta: 45, tx: 0, ty: 0, mode: "translate", hide: 0 }, { r: 3.5, theta: 180, tx: 2.5, ty: -2.5, mode: "multiply", hide: 1 }, { r: 2.5, theta: -135, tx: 0, ty: 2, mode: "multiply", hide: 0 }],
  };
  for (const e of EXPERIMENTS) {
    for (const [lang, known] of [["fr", false], ["en", true], ["fr", true]]) {
      const fmt = makeFormat(lang), ctx = { fmt, lang, unlocked: () => known };
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

// Every scene object a template draws (curves, polygons, lines, points, texts, rectangles, arcs) has finite coordinates.
test("the scenes of every panel are finite over the sampled states and stay inside the declared object kinds", () => {
  const samples = {
    probability: [{ n: 10, p: 0.3, runs: 1000, seed: 2, theory: 1 }, { n: 1, p: 1, runs: 0, seed: 1, theory: 0 }],
    vectors: [{ ux: 3, uy: 1, vx: -1, vy: 3 }, { ux: 0, uy: 0, vx: 0, vy: 0 }, { ux: 2, uy: 1, vx: -4, vy: -2 }],
    statistics: [{ data: [2, 3, 4, 4, 5, 6, 9], hide: 0 }, { data: [0, 0, 0, 0, 0, 0, 0], hide: 0 }],
    complex: [{ r: 1, theta: 0, tx: 1, ty: 2, mode: "multiply", hide: 0 }, { r: 0, theta: 90, tx: 1, ty: 1, mode: "multiply", hide: 0 }, { r: 2, theta: 90, tx: 0, ty: 0, mode: "translate", hide: 0 }],
  };
  const KINDS_OK = new Set(["curves", "areas", "rects", "polys", "lines", "circles", "arcs", "points", "texts"]);
  const finite = (x) => (typeof x === "number" ? Number.isFinite(x) : Array.isArray(x) ? x.every(finite) : x && typeof x === "object" ? Object.entries(x).every(([k, v]) => typeof v === "function" || finite(v)) : true);
  for (const [id, list] of Object.entries(samples)) {
    const e = byId[id], fmt = makeFormat("fr");
    for (const s of list) for (const panel of e.views.panels) {
      const scene = e.views[panel].scene(s, { fmt, lang: "fr", unlocked: () => true });
      for (const [kind, objects] of Object.entries(scene)) { assert.ok(KINDS_OK.has(kind), `${id}.${panel}: ${kind}`); assert.ok(finite(objects), `${id}.${panel}.${kind} ${JSON.stringify(s)}`); }
    }
  }
});

test("the quadratic readout never prints the same writing twice and keeps conventional forms", () => {
  const f = (s, lang = "fr") => byId.quadratic.views.formula(s, { fmt: makeFormat(lang), lang });
  assert.equal(f({ a: 1, b: 0, c: 0 }), "f(x) = x²");
  assert.equal(f({ a: 1, b: 0, c: -2 }), "f(x) = x² − 2");
  assert.equal(f({ a: -1, b: 0, c: 0 }), "f(x) = −x²");
  assert.equal(f({ a: 1, b: -4, c: 3 }), "f(x) = x² − 4x + 3 = (x − 2)² − 1");
  assert.equal(f({ a: 2, b: 0, c: 0 }), "f(x) = 2x²");
  assert.equal(f({ a: 0.5, b: 1, c: 0 }), "f(x) = 0,5x² + x = 0,5(x + 1)² − 0,5");
  for (const a of [-3, -1, -0.25, 0.25, 1, 2]) for (const b of [-4, -1, 0, 2]) for (const c of [-3, 0, 1.5]) {
    const parts = f({ a, b, c }).replace("f(x) = ", "").split(" = ");
    assert.equal(new Set(parts).size, parts.length, `${a} ${b} ${c}: ${parts}`);
    for (const p of parts) assert.ok(!/(^|[^\d])1x|\+ −|− −|\+ \+|(^|[^\d,])0x|[+−] 0(?![,\d])/.test(p), `conventional writing: ${p}`);
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
  // the most frequent number of successes of the binomial law, from the closed formula with integer binomial coefficients
  "probability/read": ({ n, p }) => { const C = (k) => { let c = 1; for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i; return c; }; let best = 0, top = -1; for (let k = 0; k <= n; k++) { const v = C(k) * p ** k * (1 - p) ** (n - k); if (v > top + 1e-15) { top = v; best = k; } } return best; },
  // signed area of the parallelogram O, u, u + v, v by the shoelace formula (not by the determinant)
  "vectors/read": ({ ux, uy, vx, vy }) => { const P = [[0, 0], [ux, uy], [ux + vx, uy + vy], [vx, vy]]; let a = 0; for (let i = 0; i < 4; i++) { const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % 4]; a += x1 * y2 - x2 * y1; } return a / 2; },
  // third quartile by the definition: the smallest value with at least 75 % of the series at or below it
  "statistics/read": ({ data }) => { for (const x of [...data].sort((a, b) => a - b)) if (data.filter((y) => y <= x).length / data.length >= 0.75) return x; },
  // the modulus of a product is the product of the moduli (not the hypotenuse of the product's coordinates)
  "complex/read": ({ r, tx, ty }) => r * Math.hypot(tx, ty),
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
  assert.equal(checked, 9);
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
    // the mode of B(10 ; 0,3) from the probabilities themselves
    probability: () => { const pr = P.model({ n: 10, p: 0.3, runs: 0, seed: 1 }).probs; return pr.indexOf(Math.max(...pr)); },
    // v = k u gives a zero determinant
    vectors: () => (V.model({ ux: 3, uy: 1, vx: 6, vy: 2 }).det === 0 && V.model({ ux: 3, uy: 1, vx: -1.5, vy: -0.5 }).det === 0 ? "zero" : "other"),
    // replacing 9 by 18: the sum grows, the middle value does not
    statistics: () => { const a = ST.model({ data: [2, 3, 4, 4, 5, 6, 9] }), b = ST.model({ data: [2, 3, 4, 4, 5, 6, 18] }); return b.mean > a.mean && b.median === a.median ? "mean" : "other"; },
    // i times a point: same modulus, argument plus 90 degrees
    complex: () => { const p = [2, 1], w = C.multiply([0, 1], p); return Math.abs(Math.hypot(...w) - Math.hypot(...p)) < 1e-12 && Math.abs(C.arg(w) - C.arg(p) - 90) < 1e-9 ? "quarter" : "other"; },
  };
  const expected = { quadratic: "down", trig: -1, sequences: "line", derivative: "settles", integral: "smaller", probability: 3, vectors: "zero", statistics: "mean", complex: "quarter" };
  for (const e of EXPERIMENTS) {
    assert.equal(truth[e.id](), expected[e.id], e.id);
    const m = e.missions[0];
    const right = m.choices[m.correct][0];
    const words = { quadratic: /bas/, trig: /^−1$/, sequences: /droite/, derivative: /stabilise/, integral: /petite/, probability: /Autour de 3/, vectors: /nulle/, statistics: /moyenne augmente/, complex: /quart de tour/ }[e.id];
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
  "probability/run": { runs: 1000 },
  "probability/mean": { p: 0.5 },
  "vectors/collinear": { vx: -3, vy: -1 },
  "vectors/area": { ux: 2, uy: 0 },
  "statistics/box": { data: [2, 4, 4, 4, 5, 5, 9] },
  "statistics/mean": { data: [11, 3, 4, 4, 5, 6, 9] },
  "complex/scale": { r: 2 },
  "complex/angles": { tx: 1, ty: 1 },
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
        // a handle on a polar or other lattice (the complex z) only round-trips from a state that lies on it
        if (c.lattice && !c.lattice(s)) continue;
        const next = c.drag(s, snap(x, g[0]), snap(y, g[1]));
        const after = { ...s, ...(next ?? {}) };
        const [x2, y2] = c.at(after);
        near(x2, x, 1e-9, `${e.id}.${id} round trip x`);
        near(y2, y, 1e-9, `${e.id}.${id} round trip y`);
        // far away drags clamp and never produce NaN
        for (const [fx, fy] of [[100, 100], [-100, -100], [0, 100], [100, 0]]) {
          const far = c.drag(s, fx, fy);
          if (far) for (const v of Object.values(far).flat()) assert.ok(Number.isFinite(v), `${e.id}.${id} far drag`);
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

test("probability: the binomial law is consistent and the seeded simulation is reproducible and statistically sound", () => {
  for (const n of [1, 4, 10, 12]) for (const p of [0, 0.05, 0.3, 0.5, 0.95, 1]) {
    const m = P.model({ n, p, runs: 0, seed: 1 });
    near(m.probs.reduce((a, b) => a + b, 0), 1, 1e-12, `sum n=${n} p=${p}`);
    near(m.probs.reduce((a, v, k) => a + k * v, 0), n * p, 1e-9, "E(X) = np");
    near(m.probs.reduce((a, v, k) => a + (k - n * p) ** 2 * v, 0), n * p * (1 - p), 1e-9, "V(X) = np(1 - p)");
    near(m.sd, Math.sqrt(n * p * (1 - p)), 1e-12);
    assert.equal(m.runs, 0); assert.equal(m.observedMean, null); assert.equal(m.rows.length, 0);
  }
  // the generator: same seed, same sequence; values in [0, 1); mean 1/2 and variance 1/12 over a long run
  const a = P.rng(7), b = P.rng(7), c = P.rng(8);
  const xs = Array.from({ length: 20000 }, () => a());
  assert.deepEqual(xs.slice(0, 5), Array.from({ length: 5 }, () => b()));
  assert.notDeepEqual(xs.slice(0, 5), Array.from({ length: 5 }, () => c()));
  assert.ok(xs.every((x) => x >= 0 && x < 1));
  const mean = xs.reduce((s, x) => s + x, 0) / xs.length, variance = xs.reduce((s, x) => s + (x - mean) ** 2, 0) / xs.length;
  near(mean, 0.5, 0.01, "uniform mean"); near(variance, 1 / 12, 0.005, "uniform variance");
  // the series: counts add up to the number of runs; the first N runs do not depend on how the button presses led to N
  for (const runs of [1, 10, 100, 1000, 1111]) {
    const m = P.model({ n: 10, p: 0.3, runs, seed: 2 });
    assert.equal(m.counts.reduce((x, y) => x + y, 0), runs); assert.equal(m.rows.length, Math.min(runs, P.SHOWN_ROWS));
    assert.ok(m.rows.every((row) => row.length === 10 && row.every((v) => v === 0 || v === 1)));
    assert.equal(m.rows.at(-1).reduce((x, y) => x + y, 0) >= 0, true);
  }
  const first = P.model({ n: 10, p: 0.3, runs: 1000, seed: 2 }), again = P.model({ n: 10, p: 0.3, runs: 1000, seed: 2 });
  assert.deepEqual(first.counts, again.counts);
  assert.notDeepEqual(first.counts, P.model({ n: 10, p: 0.3, runs: 1000, seed: 3 }).counts);
  // prefix property: the counts of N runs equal those recomputed from the first N rows of the same generator
  const next = P.rng(2); const replay = Array(11).fill(0);
  for (let i = 0; i < 300; i++) { let k = 0; for (let j = 0; j < 10; j++) if (next() < 0.3) k++; replay[k]++; }
  assert.deepEqual(P.model({ n: 10, p: 0.3, runs: 300, seed: 2 }).counts, replay);
  // coupling: with the same draws, a larger p never gives fewer successes in total
  const total = (p) => P.model({ n: 10, p, runs: 500, seed: 4 }).counts.reduce((s, c, k) => s + k * c, 0);
  assert.ok(total(0.2) <= total(0.5) && total(0.5) <= total(0.8));
  assert.equal(total(0), 0); assert.equal(total(1), 5000);
  // statistics of the simulation: over 5000 runs every observed frequency is within 4 standard deviations of its probability
  for (const [n, p, seed] of [[10, 0.3, 2], [8, 0.25, 5], [6, 0.5, 9], [12, 0.7, 11]]) {
    const m = P.model({ n, p, runs: P.MAX_RUNS, seed });
    m.freq.forEach((f, k) => { const sd = Math.sqrt((m.probs[k] * (1 - m.probs[k])) / P.MAX_RUNS); assert.ok(Math.abs(f - m.probs[k]) <= 4 * sd + 1e-12, `n=${n} p=${p} k=${k}: ${f} vs ${m.probs[k]}`); });
    assert.ok(Math.abs(m.observedMean - n * p) <= 4 * Math.sqrt((n * p * (1 - p)) / P.MAX_RUNS), "the observed mean is close to np");
    assert.ok(m.gap < 0.03);
  }
  // the gap shrinks as the series grows (averaged over several seeds, so one lucky series cannot decide)
  const gap = (runs) => [1, 2, 3, 4, 5, 6, 7, 8].reduce((s, seed) => s + P.model({ n: 10, p: 0.3, runs, seed }).gap, 0) / 8;
  assert.ok(gap(10) > gap(100) && gap(100) > gap(1000) && gap(1000) > gap(5000));
  assert.equal(P.quantity("mode", { n: 10, p: 0.3, runs: 0, seed: 1 }), 3);
  near(P.quantity("sd", { n: 10, p: 0.3, runs: 0, seed: 1 }), Math.sqrt(2.1), 1e-12);
});

test("probability: the run buttons add experiments up to the cap, and 'new series' starts again", () => {
  const run = byId.probability.controls.run, s = { n: 10, p: 0.3, runs: 0, seed: 2, theory: 0 };
  assert.deepEqual(run.options.map((o) => o.value), [1, 10, 100, 1000, "new"]);
  let state = s;
  for (const v of [1, 10, 100, 1000]) state = { ...state, ...run.act(state, v) };
  assert.equal(state.runs, 1111);
  assert.equal(run.act({ ...state, runs: 4800 }, 1000).runs, P.MAX_RUNS, "the series is capped");
  const fresh = run.act(state, "new");
  assert.equal(fresh.runs, 0); assert.ok(Number.isInteger(fresh.seed) && fresh.seed >= 1);
  // the expectation handle moves p on a 0,05 grid and keeps it in [0, 1]
  const h = byId.probability.controls.expectation;
  assert.equal(h.drag(s, 5, 0).p, 0.5); assert.equal(h.drag(s, -3, 0).p, 0); assert.equal(h.drag(s, 99, 0).p, 1); assert.equal(h.drag(s, 2.9, 0).p, 0.3);
});

test("vectors: the determinant is the signed area, zero exactly for collinear vectors", () => {
  const dets = [];
  for (const ux of [-4, -2.5, 0, 1, 3.5]) for (const uy of [-3, 0, 0.5, 4]) for (const vx of [-4, -1, 0, 2, 4]) for (const vy of [-4, 0, 1.5, 3]) {
    const m = V.model({ ux, uy, vx, vy }), swapped = V.model({ ux: vx, uy: vy, vx: ux, vy: uy });
    near(m.det, ux * vy - uy * vx, 1e-12);
    near(swapped.det, -m.det, 1e-12, "swapping u and v changes the sign");
    near(m.area, Math.abs(m.det), 1e-12);
    near(m.det ** 2 + m.dot ** 2, (ux * ux + uy * uy) * (vx * vx + vy * vy), 1e-9, "Lagrange identity");
    // scaling one vector scales the area; adding a multiple of u to v does not change it
    near(V.model({ ux, uy, vx: 2 * vx, vy: 2 * vy }).det, 2 * m.det, 1e-12);
    near(V.model({ ux, uy, vx: vx + 3 * ux, vy: vy + 3 * uy }).det, m.det, 1e-9, "shear keeps the area");
    // collinear exactly when v is a multiple of u (or u = 0)
    const multiple = (ux === 0 && uy === 0) || (vx === 0 && vy === 0) || (ux * vy === uy * vx);
    assert.equal(m.collinear, multiple);
    assert.equal(m.orientation, Math.sign(m.det));
    dets.push(m.det);
  }
  assert.ok(dets.some((d) => d > 0) && dets.some((d) => d < 0) && dets.some((d) => d === 0));
  const m = V.model({ ux: 3, uy: 1, vx: -1, vy: 3 });
  assert.equal(m.det, 10); assert.deepEqual(m.polygon, [[0, 0], [3, 1], [2, 4], [-1, 3]]); assert.deepEqual(m.sum, [2, 4]);
  assert.ok(!Object.is(V.model({ ux: 0, uy: 0, vx: 1, vy: 1 }).det, -0));
  assert.equal(V.quantity("det", { ux: 2, uy: -1, vx: 1, vy: 3 }), 7);
});

test("statistics: mean, median and quartiles follow the definitions; one value moves the mean by d/n and not the median", () => {
  // quartiles from the definition, by counting, on many series
  const brute = (data, q) => { for (const x of [...data].sort((a, b) => a - b)) if (data.filter((y) => y <= x).length / data.length >= q) return x; };
  const series = [[2, 3, 4, 4, 5, 6, 9], [1, 2, 4, 5, 7, 8, 12], [5, 5, 5, 5, 5, 5, 5], [0, 20, 0, 20, 0, 20, 0], [3.5, 1, 7.5, 2, 2, 19.5, 0], [1, 2, 3, 4], [1, 2, 3, 4, 5, 6, 7, 8], [4]];
  for (const data of series) {
    const m = ST.model({ data }), n = data.length;
    assert.equal(m.q1, brute(data, 0.25), `Q1 of ${data}`); assert.equal(m.q3, brute(data, 0.75), `Q3 of ${data}`);
    near(m.mean, data.reduce((a, b) => a + b, 0) / n, 1e-12);
    const below = data.filter((x) => x < m.median).length, above = data.filter((x) => x > m.median).length;
    assert.ok(below <= n / 2 && above <= n / 2, "no more than half the values on each side of the median");
    assert.ok(m.min <= m.q1 && m.q1 <= m.median && m.median <= m.q3 && m.q3 <= m.max);
    near(m.iqr, m.q3 - m.q1, 1e-12); near(m.range, m.max - m.min, 1e-12);
    // the standard deviation is the root of the mean square gap
    near(m.sd ** 2, data.reduce((a, x) => a + (x - m.mean) ** 2, 0) / n, 1e-9);
    assert.deepEqual(m.sorted, [...data].sort((a, b) => a - b));
  }
  assert.equal(ST.model({ data: [2, 3, 4, 4, 5, 6, 9] }).median, 4); assert.equal(ST.model({ data: [1, 2, 3, 4] }).median, 2.5);
  // moving one value by d moves the mean by d / n; moving the largest value further away leaves the median and the box alone
  const base = { data: [2, 3, 4, 4, 5, 6, 9] }, a = ST.model(base);
  for (const d of [-1, 0.5, 4, 9]) { const moved = ST.model({ data: [2, 3, 4, 4, 5, 6, 9 + d] }); near(moved.mean - a.mean, d / 7, 1e-12); if (d > 0) { assert.equal(moved.median, a.median); assert.equal(moved.q1, a.q1); assert.equal(moved.q3, a.q3); } }
  // the first value passing over the middle changes the median by one rank only
  assert.equal(ST.model({ data: [11, 3, 4, 4, 5, 6, 9] }).median, 5);
  assert.deepEqual(ST.stack([2, 3, 4, 4, 5, 4, 9]), [0, 0, 0, 1, 0, 2, 0]);
  const h = byId.statistics.controls.d3, s = { data: [2, 3, 4, 4, 5, 6, 9] };
  assert.deepEqual(h.drag(s, 7, 0).data, [2, 3, 4, 7, 5, 6, 9], "only the dragged value changes"); assert.deepEqual(s.data, [2, 3, 4, 4, 5, 6, 9], "the state is not mutated");
  assert.equal(h.drag(s, 99, 0).data[3], 20); assert.equal(h.drag(s, -5, 0).data[3], 0);
  near(h.at(s)[0], 4, 1e-12); assert.notEqual(h.at(s)[1], byId.statistics.controls.d2.at(s)[1], "equal values are stacked");
  assert.equal(Object.keys(byId.statistics.controls).length, 7);
});

test("complex: multiplication multiplies moduli and adds arguments; translation adds; the figure follows", () => {
  const norm = (d) => ((((d + 180) % 360) + 360) % 360) - 180;
  for (const r of [0.5, 1, 2, 3.5]) for (const theta of [-135, -90, 0, 15, 45, 90, 180]) for (const [tx, ty] of [[1, 2], [-2, 0.5], [2.5, -2.5], [0, 2]]) {
    const m = C.model({ r, theta, tx, ty, mode: "multiply" });
    near(m.modW, r * Math.hypot(tx, ty), 1e-9, "|z t| = |z| |t|");
    near(m.z[0], r * Math.cos((theta * Math.PI) / 180), 1e-12); near(m.z[1], r * Math.sin((theta * Math.PI) / 180), 1e-12);
    near(Math.abs(norm(m.argW - (m.argT + theta))), 0, 1e-9, "arg(z t) = arg z + arg t");
    // by the algebraic formula
    near(m.w[0], m.z[0] * tx - m.z[1] * ty, 1e-12); near(m.w[1], m.z[0] * ty + m.z[1] * tx, 1e-12);
    // distances scale by |z| and the figure is carried by the same map
    m.house.forEach((p, i) => near(Math.hypot(...p), r * Math.hypot(...C.HOUSE[i]), 1e-9, "house vertex"));
    // the map is linear: its local factor is z (the derivative of the old explorer), and dividing by z undoes it
    const h = [1e-3, -2e-3], p0 = [tx, ty], out = [m.f([p0[0] + h[0], p0[1] + h[1]])[0] - m.w[0], m.f([p0[0] + h[0], p0[1] + h[1]])[1] - m.w[1]], local = C.multiply(m.z, h);
    near(out[0], local[0], 1e-12); near(out[1], local[1], 1e-12);
    const inv = [m.z[0] / (r * r), -m.z[1] / (r * r)], back = C.multiply(inv, m.w);
    near(back[0], tx, 1e-9, "division undoes the product"); near(back[1], ty, 1e-9);
    const t = C.model({ r, theta, tx, ty, mode: "translate" });
    near(t.w[0], tx + m.z[0], 1e-12); near(t.w[1], ty + m.z[1], 1e-12);
    t.house.forEach((p, i) => { near(p[0] - C.HOUSE[i][0], m.z[0], 1e-12); near(p[1] - C.HOUSE[i][1], m.z[1], 1e-12); });
  }
  const zero = C.model({ r: 0, theta: 90, tx: 1, ty: 1, mode: "multiply" });
  assert.deepEqual(zero.w, [0, 0]); assert.equal(zero.argZ, null); assert.equal(zero.argW, null);
  assert.deepEqual(C.multiply([0, 1], [0, 1]), [-1, 0], "i squared is -1");
  assert.deepEqual(C.multiply([0, 1], [2, 0]), [0, 2]);
  assert.equal(C.quantity("modW", { r: 2.5, theta: Math.atan2(2, 1.5) * 180 / Math.PI, tx: 0, ty: 2, mode: "multiply" }) > 4.999, true);
  // the z handle: polar grid (0,25 and 15 degrees), arrows change the modulus (up, down) and the argument (left, right)
  const z = byId.complex.controls.z, s = byId.complex.state;
  assert.deepEqual(z.drag(s, 2, 0), { r: 2, theta: 0 }); assert.deepEqual(z.drag(s, 0, 1), { r: 1, theta: 90 }); assert.deepEqual(z.drag(s, -1, 0), { r: 1, theta: 180 });
  assert.equal(z.drag(s, 0, -1).theta, -90); assert.equal(z.drag(s, 5, 5).r, 3.5, "the modulus is capped");
  assert.equal(z.drag(s, 0.01, 0.01).r, 0); assert.equal(z.drag(s, 0.01, 0.01).theta, s.theta, "at the origin the argument is kept");
  assert.deepEqual(z.nudge(s, 0, 1), { r: 1.25, theta: 0 }); assert.equal(z.nudge(s, 1, 0).theta, -15); assert.equal(z.nudge({ ...s, theta: 180 }, -1, 0).theta, -165);
  assert.ok(z.lattice(s) && !z.lattice({ ...s, r: Math.SQRT2 }));
  const t = byId.complex.controls.t;
  assert.deepEqual(t.drag(s, 9, -9), { tx: 2.5, ty: -2.5 });
});

// ---- every link into the laboratory from the site resolves
function sources(dir) {
  return readdirSync(dir).flatMap((f) => { const p = `${dir}/${f}`; return statSync(p).isDirectory() ? sources(p) : p.endsWith(".js") ? [p] : []; });
}
test("every link into #lab/<id>[/<mission>] in the site, the pathways and the manifest resolves", () => {
  const custom = new Set(labs.filter((l) => l.custom).map((l) => l.id));   // gallery curiosities: #lab/<id> redirects to #gallery/<id>
  const ok = (ref) => resolveRef(ref) !== null || custom.has(ref.split("/")[0]);
  let found = 0;
  for (const file of sources("site/js")) {
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/#lab\/([a-z0-9-]+(?:\/[a-z0-9-]+)?)(?![a-z0-9-]*\$\{)/g)) { assert.ok(ok(m[1]), `${file}: #lab/${m[1]}`); found++; }
    for (const m of text.matchAll(/\blink\(\s*["']lab["']\s*,\s*["']([a-z0-9-]+)["']/g)) { assert.ok(ok(m[1]), `${file}: link("lab", "${m[1]}")`); found++; }
  }
  assert.ok(found >= 1);
  for (const p of pathways) for (const stage of pathwayStages(p)) for (const id of stage.ids || []) assert.ok(ok(id) || labs.some((l) => l.id === id), `pathway ${p.id}: ${id}`);
  const manifest = JSON.parse(readFileSync("content/data/manifest.json", "utf8")), refs = [];
  const walk = (x) => { if (Array.isArray(x)) x.forEach(walk); else if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) { if (k === "labs" && Array.isArray(v)) refs.push(...v); else walk(v); } };
  walk(manifest);
  assert.ok(refs.length > 0);
  for (const ref of refs) assert.ok(resolveRef(ref), `manifest lab reference ${ref}`);
  // every experiment of the catalogue is reachable from at least one chapter, pathway or the index
  assert.deepEqual(new Set(["probability", "vectors", "statistics", "complex"].filter((id) => refs.includes(id))), new Set(["probability", "vectors", "statistics", "complex"]));
});
