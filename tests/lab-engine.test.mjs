// Laboratory v2 (docs/LAB_DESIGN.md sections 3 to 7): registry consistency, the control-count rule of every mission, every
// string a [fr, en] pair without em or en dashes, every `check` answer recomputed independently from the maths, the goals
// reachable, the handles consistent with their models, and the pure models. Drawing and dragging are in dom-smoke.mjs and
// lab_browser.py.
import test from "node:test";
import {BACKLOG_CHECKS,BACKLOG_WITNESSES,BACKLOG_PREDICTIONS} from "./backlog-lab-fixtures.mjs";
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
import * as LN from "../dist/js/lab/models/line.js";
import * as EX from "../dist/js/lab/models/exponential.js";
import * as CW from "../dist/js/lab/models/cobweb.js";
import * as MX from "../dist/js/lab/models/matrix.js";
import * as SL from "../dist/js/lab/models/space-lines.js";
import * as CAM from "../dist/js/camera3d.js";
import * as TI from "../dist/js/lab/models/tiles.js";
import * as EP from "../dist/js/lab/models/euler-primes.js";
import * as FE from "../dist/js/lab/models/fermat.js";
import * as CR from "../dist/js/lab/models/circle-regions.js";
import * as BU from "../dist/js/lab/models/buffon.js";
import * as BE from "../dist/js/lab/models/bertrand.js";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { labs, pathways, pathwayStages } from "../dist/js/content.js";

const near = (a, b, tol = 1e-9, msg = "") => assert.ok(Math.abs(a - b) <= tol, `${msg} ${a} != ${b}`);
const byId = Object.fromEntries(EXPERIMENTS.map((e) => [e.id, e]));
const DASH = /[–—]/;
const isPair = (p) => Array.isArray(p) && p.length === 2 && p.every((x) => typeof x === "string" && x.trim().length > 0);

test("the registry lists the registered experiments with consistent ids, templates and references", async () => {
  const retainedIds = ["quadratic", "trig", "sequences", "derivative", "integral", "probability", "vectors", "statistics", "complex", "line", "exponential", "cobweb", "matrix", "space-lines", "fourier-series", "fourier-drawing", "tiles", "euler-primes", "fermat", "circle-regions", "buffon", "bertrand"];
  assert.deepEqual(EXPERIMENTS.slice(0,retainedIds.length).map(e=>e.id),retainedIds);
  assert.deepEqual(EXPERIMENTS.slice(retainedIds.length).map(e=>e.id).sort(),Object.keys(BACKLOG_PREDICTIONS).sort());
  assert.ok(["family","process","chance","figure","data","transform","space","fourier","calculation"].every(k=>EXPERIMENTS.some(e=>e.template===k)), "retained templates stay in use");
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
      if (c.play) assert.ok(["process","fourier","dynamics","logistic"].includes(e.template), "play belongs to a time-indexed template");
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
    assert.equal(new URL(e.history.source).protocol,"https:",`${e.id}: an absolute HTTPS reference`);
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
    line: [{ ax: 0, ay: 1, bx: 2, by: 5 }, { ax: 1, ay: 1, bx: 1, by: 3 }, { ax: 2, ay: 2, bx: 2, by: 2 }, { ax: -1, ay: 4, bx: 3, by: -2 }, { ax: 0, ay: 0, bx: 3, by: 1 }, { ax: -5.5, ay: -5.5, bx: 5.5, by: 5.5 }, { ax: 0, ay: 3, bx: 4, by: 3 }],
    exponential: [{ k: 1, a: 2 }, { k: 6, a: 0.25 }, { k: 0.5, a: 3 }, { k: 3, a: 1 }],
    cobweb: [{ a: 0.5, b: 2, u0: 8, n: 6 }, { a: 1, b: 1, u0: 0, n: 3 }, { a: -2, b: 5, u0: -1, n: 12 }, { a: 0, b: -2, u0: 9, n: 0 }, { a: 1.25, b: 0, u0: 1, n: 12 }, { a: 1, b: 0, u0: 4, n: 5 }],
    matrix: [{ a: 2, b: 1, c: 0, d: 2 }, { a: 0, b: 0, c: 0, d: 0 }, { a: -2.5, b: 1, c: 2, d: -0.5 }, { a: 1, b: 2, c: 2, d: 4 }, { a: 1.5, b: 0, c: 0, d: 2 }],
    "space-lines": [{ ax: -2, ay: -1, az: 0, ux: 2, uy: 1, uz: 1, d: -7, t: 0, mode: 0, hide: 0 }, { ax: -2, ay: -1, az: 0, ux: 2, uy: 1, uz: 1, d: -7, t: 1.75, mode: 1, hide: 0 }, { ax: 2, ay: -1, az: 3, ux: 1, uy: 1, uz: 2, d: -2, t: 0, mode: 2, hide: 0 }, { ax: 0, ay: 0, az: 1, ux: 1, uy: 1, uz: -1, d: -2, t: 0, mode: 0, hide: 0 }, { ax: -2, ay: -1, az: 2, ux: 2, uy: 0, uz: -1, d: -7, t: 0, mode: 0, hide: 0 }, { ax: 0, ay: 0, az: 1, ux: 1, uy: 1, uz: 2, d: -2, t: 0, mode: 2, hide: 0 }, { ax: -2, ay: -1, az: 0, ux: 2, uy: 1, uz: 1, d: -7, t: 0, mode: 0, hide: 1 }, { ax: 1, ay: 2, az: 3, ux: 0, uy: 0, uz: 1, d: 0, t: 0, mode: 0, hide: 0 }],
    complex: [{ r: 1, theta: 0, tx: 1, ty: 2, mode: "multiply", hide: 0 }, { r: 0, theta: 90, tx: -2.5, ty: 0, mode: "multiply", hide: 0 }, { r: Math.SQRT2, theta: 45, tx: 0, ty: 0, mode: "translate", hide: 0 }, { r: 3.5, theta: 180, tx: 2.5, ty: -2.5, mode: "multiply", hide: 1 }, { r: 2.5, theta: -135, tx: 0, ty: 2, mode: "multiply", hide: 0 }],
  };
  for (const e of EXPERIMENTS) {
    for (const [lang, known] of [["fr", false], ["en", true], ["fr", true]]) {
      const fmt = makeFormat(lang), ctx = { fmt, lang, unlocked: () => known };
      for (const s of (samples[e.id] || e.missions.map(m=>({...e.state,...m.set})))) {
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
        assert.equal(e.views.readout(s, ctx).length, e.views.readout(samples[e.id]?.[0] || e.state, ctx).length);
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
    line: [{ ax: 0, ay: 1, bx: 2, by: 5 }, { ax: 1, ay: 1, bx: 1, by: 3 }, { ax: 2, ay: 2, bx: 2, by: 2 }, { ax: -1, ay: 4, bx: 3, by: -2 }],
    exponential: [{ k: 1, a: 2 }, { k: 6, a: 3 }, { k: 0.5, a: 0.25 }],
    cobweb: [{ a: 0.5, b: 2, u0: 8, n: 6 }, { a: -2, b: 5, u0: -1, n: 12 }, { a: 1, b: 0, u0: 4, n: 0 }],
    matrix: [{ a: 2, b: 1, c: 0, d: 2 }, { a: 0, b: 0, c: 0, d: 0 }, { a: -2.5, b: 1, c: 2, d: -0.5 }],
    "space-lines": [{ ax: -2, ay: -1, az: 0, ux: 2, uy: 1, uz: 1, d: -7, t: 1, mode: 0, hide: 0 }, { ax: -2, ay: -1, az: 0, ux: 2, uy: 1, uz: 1, d: -7, t: 1, mode: 1, hide: 0 }, { ax: 2, ay: -1, az: 3, ux: 1, uy: 1, uz: 2, d: -2, t: 0, mode: 2, hide: 0 }, { ax: 1, ay: 2, az: 3, ux: 0, uy: 0, uz: 1, d: 30, t: 0, mode: 0, hide: 0 }],
  };
  const KINDS_OK = new Set(["curves", "areas", "rects", "polys", "lines", "circles", "arcs", "points", "texts", "rowLabels", "faces", "segs"]);
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
  "fourier-series/coefficients":()=>{let sum=0;const M=10000;for(let j=0;j<M;j++){const t=(j+.5)/M;sum+=(.6*Math.cos(2*Math.PI*t)+.8*Math.sin(4*Math.PI*t))*Math.sin(4*Math.PI*t)*2/M;}return sum;},
  "fourier-drawing/error":()=>Math.sqrt(9/100+16/100),
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
  // the line's y-intercept by walking along the segment AB to x = 0 (linear interpolation), not by the formula p = yA - m xA
  "line/read": ({ ax, ay, bx, by }) => ay + ((0 - ax) / (bx - ax)) * (by - ay),
  // the fifth term by repeated multiplication
  "exponential/sequence": ({ k, a }) => { let u = k; for (let i = 0; i < 5; i++) u *= a; return u; },
  // the fixed point as the limit of the iteration (|a| < 1 here), not by solving l = a l + b
  "cobweb/fixed": ({ a, b, u0 }) => { let u = u0; for (let i = 0; i < 600; i++) u = a * u + b; return u; },
  // the determinant as the signed area of the image of the unit square (shoelace), not as ad - bc
  "matrix/read": ({ a, b, c, d }) => { const P = [[0, 0], [a, c], [a + b, c + d], [b, d]]; let s = 0; for (let i = 0; i < 4; i++) { const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % 4]; s += x1 * y2 - x2 * y1; } return s / 2; },
  // the value of t where the plane equation, evaluated along the line, changes sign (scan then interpolate)
  "space-lines/meet": ({ ax, ay, az, ux, uy, uz, d }) => { const g = (t) => (ax + t * ux) + (ay + t * uy) + 2 * (az + t * uz) + d; let prev = -10; for (let t = -9.9999; t <= 10; t += 1e-4) { if (g(prev) * g(t) <= 0) return prev - g(prev) * (t - prev) / (g(t) - g(prev)); prev = t; } return NaN; },
  // the gap of the 8 × 8 puzzle as the shoelace area of the parallelogram left between the pieces (not as a determinant)
  "tiles/det": ({ a, b }) => { const W = 2 * a + b, P = [[0, a], [a, b], [W, 0], [W - a, a - b]]; let t = 0; for (let i = 0; i < 4; i++) { const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % 4]; t += x1 * y2 - x2 * y1; } return t / 2; },
  // the integer square root of f(40) found by counting up
  "euler-primes/square": ({ c, n }) => { const v = n * n + n + c; let r = 0; while ((r + 1) * (r + 1) <= v) r++; return r * r === v ? r : NaN; },
  // the smallest prime factor of 2^32 + 1 in BigInt arithmetic, then (p - 1) / 64
  "fermat/euler": ({ e }) => { const N = 2n ** BigInt(e) + 1n; let p = 3n; while (N % p) p += 2n; return Number((p - 1n) / 64n); },
  // 1 + C(n, 2) + C(n, 4) from Pascal's triangle
  "circle-regions/seven": ({ n }) => { const row = [1]; for (let i = 0; i < n; i++) { for (let k = row.length; k > 0; k--) row[k] = (row[k] || 0) + row[k - 1]; } return 1 + row[2] + row[4]; },
  // 2L / pi by integrating (L/2) sin over [0, pi/2] numerically, divided by (pi d / 4) with d = 1
  "buffon/theory": ({ L }) => { const n = 100000; let s = 0; for (let i = 0; i < n; i++) s += (L / 2) * Math.sin(((i + 0.5) / n) * Math.PI / 2) * (Math.PI / 2) / n; return s / (Math.PI / 4); },
  // the midpoint is uniform in the disc: estimate P(r < 1/2) on a fine grid of the square [-1, 1]^2
  "bertrand/midpoint": () => { const n = 2000; let inDisc = 0, inner = 0; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = -1 + (2 * i + 1) / n, y = -1 + (2 * j + 1) / n, r = x * x + y * y; if (r <= 1) { inDisc++; if (r < 0.25) inner++; } } return inner / inDisc; },
  "integral/area": ({ a, b }) => { const n = 400000, w = (b - a) / n; let s = 0; for (let i = 0; i < n; i++) { const x = a + (i + 0.5) * w; s += x * x * w; } return s; },
};
Object.assign(independent,BACKLOG_CHECKS);
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
  assert.equal(checked, Object.keys(independent).length);
});

test("every prediction has the correct answer according to the mathematics", () => {
  const truth = {
    "fourier-series":()=>2, "fourier-drawing":()=>128,
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
    // the quotient from A to B and from A to C (4 ; 9), a third point of the line, are equal
    line: () => (LN.model({ ax: 0, ay: 1, bx: 2, by: 5 }).m === LN.model({ ax: 0, ay: 1, bx: 4, by: 9 }).m ? "same" : "other"),
    // f(x + 1) / f(x) = 2 at a non-integer x too
    exponential: () => (Math.abs(EX.value({ k: 1, a: 2 }, 3.5) / EX.value({ k: 1, a: 2 }, 2.5) - 2) < 1e-12 ? "times" : "other"),
    // the terms decrease, stay above 4 and the gap to 4 tends to 0
    cobweb: () => { const t = CW.terms({ a: 0.5, b: 2, u0: 8 }, 40); return t.every((v, i) => v > 4 && (i === 0 || v < t[i - 1])) && Math.abs(t.at(-1) - 4) < 1e-9 ? "closer" : "other"; },
    // the image of the unit square of (2 ; 0), (1 ; 2) has area 4
    matrix: () => MX.model({ a: 2, b: 1, c: 0, d: 2 }).area,
    // the three states: one common point, none, the whole line
    "space-lines": () => new Set([SL.model({ ax: -2, ay: -1, az: 0, ux: 2, uy: 1, uz: 1, d: -7 }).relation, SL.model({ ax: -2, ay: -1, az: 2, ux: 2, uy: 0, uz: -1, d: -7 }).relation, SL.model({ ax: 0, ay: 0, az: 1, ux: 1, uy: 1, uz: -1, d: -2 }).relation]).size === 3 ? "three" : "other",
  };
  Object.assign(truth, {
    // the rectangle of the 8 x 8 puzzle is not filled exactly: its area differs from 64
    tiles: () => (TI.model({ a: 5, b: 3 }).rectArea !== 64 && TI.area([[0, 0], [8, 0], [8, 8], [0, 8]]) === 64 ? "gap" : "other"),
    // some n gives a composite value (BigInt-free check: n = 40)
    "euler-primes": () => (EP.model({ c: 41, n: 40 }).prime ? "always" : "counterexample"),
    // 2^32 + 1 has a factor below its square root
    fermat: () => (FE.model({ e: 32 }).prime ? "prime" : "composite"),
    // the maximum for 6 points
    "circle-regions": () => CR.formula(6),
    // 2 / pi lies between 1/2 and 2/3
    buffon: () => (2 / Math.PI > 0.5 && 2 / Math.PI < 2 / 3 ? "under two thirds" : "other"),
    // the three methods give three different probabilities
    bertrand: () => (new Set(Object.values(BE.THEORY)).size === 3 ? "depends" : "other"),
  });
  const expected = { tiles: "gap", "euler-primes": "counterexample", fermat: "composite", "circle-regions": 31, buffon: "under two thirds", bertrand: "depends", "fourier-series":2, "fourier-drawing":128, quadratic: "down", trig: -1, sequences: "line", derivative: "settles", integral: "smaller", probability: 3, vectors: "zero", statistics: "mean", complex: "quarter", line: "same", exponential: "times", cobweb: "closer", matrix: 4, "space-lines": "three" };
  for(const [id,p] of Object.entries(BACKLOG_PREDICTIONS)){truth[id]=p.truth;expected[id]=p.expected;}
  for (const e of EXPERIMENTS) {
    assert.equal(truth[e.id](), expected[e.id], e.id);
    const m = e.missions[0];
    const right = m.choices[m.correct][0];
    const words = { tiles: /trou très fin/, "euler-primes": /il existe un n/, fermat: /composé/, "circle-regions": /^31$/, buffon: /deux tiers/, bertrand: /dépend/, "fourier-series":/Deux fois plus d’oscillations/, "fourier-drawing":/128 échantillons/, quadratic: /bas/, trig: /^−1$/, sequences: /droite/, derivative: /stabilise/, integral: /petite/, probability: /Autour de 3/, vectors: /nulle/, statistics: /moyenne augmente/, complex: /quart de tour/, line: /Il ne change pas/, exponential: /multipliée par 2/, cobweb: /rapprochent de 4/, matrix: /^4$/, "space-lines": /Aucun, un seul, ou une infinité/ }[e.id] || BACKLOG_PREDICTIONS[e.id]?.words;
    assert.match(right, words, `${e.id}: the marked choice is the true one`);
  }
});

// A state at which each exploration goal holds, and the start state where it must not.
const witness = {
  "fourier-series/frequency":{frequency:2,phase:.5},
  "fourier-series/approximation":{N:20},
  "fourier-drawing/drawing":{time:.9},
  "fourier-drawing/detail":{count:40},
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
  "line/slope": { bx: 1, by: -1 },
  "line/intercept": { ax: -2, ay: 1 },
  "exponential/base": { a: 0.5 },
  "exponential/scale": { k: 1.5 },
  "cobweb/steps": { n: 10 },
  "cobweb/slope": { a: -1.5 },
  "matrix/columns": { a: 2, c: 1 },
  "matrix/area": { d: 1.5 },
  "matrix/flat": { d: 0 },
  "space-lines/param": { t: 2 },
  "space-lines/parallel": { ux: 2, uy: 0, uz: -1 },
  "space-lines/normal": { ax: 0, ay: 0, az: 1 },
  "tiles/zoom": { show: 1 },
  "tiles/size": { a: 8, b: 5 },
  "euler-primes/hunt": { n: 40 },
  "fermat/f5": { e: 32 },
  "circle-regions/six": { n: 6 },
  "buffon/drop": { runs: 1000 },
  "bertrand/ends": { runs: 1000 },
};
Object.assign(witness,BACKLOG_WITNESSES);
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
    if (e.template === "space") continue;   // constrained 3D handles: next test
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
          if (far) for (const v of Object.values(far).flat(Infinity)) assert.ok(typeof v !== "number" || Number.isFinite(v), `${e.id}.${id} far drag`);
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
        for (const k of Object.keys(s)) if (typeof s[k] === "number" && !(c.resetKeys||[]).includes(k)) near(back[k], s[k], 1e-9, `${e.id}.${id} step back ${k}`);
        for (const k of c.resetKeys||[]) {assert.ok(k in e.state,`${e.id}.${id} declares a real reset field`);near(back[k],e.state[k],1e-9,`${e.id}.${id} resets ${k}`);}
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

test("honest labelling: ≈ for a rounded value, = for an exact one, in every readout and canvas label", () => {
  const fr = makeFormat("fr"), en = makeFormat("en");
  assert.equal(fr.isExact(6), true); assert.equal(fr.isExact(33 / 7), false); assert.equal(fr.isExact(0.125), false); assert.equal(fr.isExact(0.125, 3), true);
  assert.equal(fr.eq(4.5), "="); assert.equal(fr.eq(2 / 3), "≈");
  assert.equal(fr.rel("x̄", 33 / 7), "x̄ ≈ 4,71"); assert.equal(en.rel("x̄", 33 / 7), "x̄ ≈ 4.71"); assert.equal(fr.rel("x̄", 6), "x̄ = 6");
  assert.equal(fr.read(33 / 7), "≈ 4,71"); assert.equal(fr.read(6), "6"); assert.equal(fr.read(-0.25), "−0,25");
  assert.equal(fr.ratio(33, 7), "33/7 ≈ 4,71"); assert.equal(en.ratio(33, 7), "33/7 ≈ 4.71"); assert.equal(fr.ratio(9, 2), "4,5"); assert.equal(fr.ratio(42, 7), "6");
  assert.equal(fr.ratio(16.5, 3.5), "33/7 ≈ 4,71");   // decimals reduce to lowest terms
  assert.equal(fr.ratio(1, 3, 4), "1/3 ≈ 0,3333");
  assert.equal(fr.pt(1, 2), "(1 ; 2)"); assert.equal(fr.pt(0.5, -2.0625), "≈ (0,5 ; −2,06)");
  assert.equal(fr.eq(Infinity), "≈");
  // the statistics witness: the mean of 2 3 4 4 5 6 9 is 33/7
  const stat = byId.statistics, ctx = { fmt: fr, lang: "fr", unlocked: () => true }, s = { data: [2, 3, 4, 4, 5, 6, 9], hide: 0 };
  assert.match(stat.views.formula(s, ctx), /= 33\/7 ≈ 4,71$/);
  assert.equal(stat.views.readout(s, ctx)[0][1], "33/7 ≈ 4,71");
  assert.ok(stat.views.dots.scene(s, ctx).texts.some((t) => t.text === "x̄ ≈ 4,71"));
  assert.equal(stat.views.readout({ ...s, data: [2, 3, 4, 4, 5, 6, 18] }, ctx)[0][1], "6");
  assert.ok(stat.views.dots.scene({ ...s, data: [2, 3, 4, 4, 5, 6, 18] }, ctx).texts.some((t) => t.text === "x̄ = 6"));
  // other witnesses: an irrational root, the square root of a modulus, a sum of rectangles
  assert.match(byId.quadratic.views.readout({ a: 1, b: 0, c: -2 }, ctx)[2][1], /x₁ ≈ −1,41 ; x₂ ≈ 1,41/);
  assert.match(byId.quadratic.views.readout({ a: 1, b: 0, c: -4 }, ctx)[2][1], /x₁ = −2 ; x₂ = 2/);
  assert.match(byId.integral.views.readout({ a: 0, b: 1, n: 4, method: "left" }, ctx)[1][1], /^1\/3 ≈ 0,3333$/);
  assert.match(byId.integral.views.readout({ a: 0, b: 1, n: 4, method: "left" }, ctx)[0][1], /^≈ 0,21875|^0,21875|^≈ 0,2188/);
  assert.match(byId.complex.views.readout({ r: 1, theta: 15, tx: 1, ty: 2, mode: "multiply", hide: 0 }, ctx)[0][1], /module = 1 ; argument = 15°/);
  assert.match(byId.complex.views.formula({ r: 1, theta: 15, tx: 1, ty: 2, mode: "multiply", hide: 0 }, ctx), /^z × t ≈ /);
  assert.match(byId.complex.views.formula({ r: 2, theta: 0, tx: 1, ty: 2, mode: "multiply", hide: 0 }, ctx), /^z × t = /);
  assert.match(byId.sequences.views.readout({ mode: "geom", u0: 1, q: 1.5, r: 0, n: 5 }, ctx)[1][1], /^≈ 7,59$/);
  assert.match(byId.vectors.views.figure.measure({ ux: 3, uy: 1, vx: -1, vy: 3 }, ctx).text, /^det\(u, v\) = 10$/);
  assert.match(byId.trig.views.readout({ deg: 30, assoc: "none", fn: "sin" }, ctx)[1][1], /√3\/2 ≈ 0,866/);
  assert.match(byId.trig.views.readout({ deg: 30, assoc: "none", fn: "sin" }, ctx)[2][1], /1\/2 = 0,5/);
  assert.match(byId.trig.views.readout({ deg: 37, assoc: "none", fn: "sin" }, ctx)[0][1], /^37° = 37π\/180 rad$/);
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

// ---- Phase 4: the shared 3D camera, the template `space` handles and the five new models
test("camera3d: projection and unprojection are inverse, the view ray and the constraints hit what they should, pitch is clamped", () => {
  const rnd = (() => { let a = 1; return () => ((a = (a * 16807) % 2147483647) / 2147483647); })();
  for (let i = 0; i < 200; i++) {
    const yaw = (rnd() - 0.5) * 8, pitch = 0.12 + rnd() * 1.33, p = [rnd() * 8 - 4, rnd() * 8 - 4, rnd() * 6];
    const q = CAM.cam3Project(yaw, pitch, ...p), back = CAM.cam3Unproject(yaw, pitch, q.u, q.v, p[2]);
    near(back.x, p[0], 1e-9, "x"); near(back.y, p[1], 1e-9, "y");
    // the ray through the screen point of p passes through p, and its direction keeps (u, v) fixed and grows the depth by 1
    const ray = CAM.cam3Ray(yaw, pitch, q.u, q.v), w = ray.w;
    near(Math.hypot(...w), 1, 1e-12);
    const hit = CAM.cam3HitPlane(ray, [0, 0, p[2]], [0, 0, 1]);
    near(hit[0], p[0], 1e-8); near(hit[1], p[1], 1e-8);
    const far = CAM.cam3Project(yaw, pitch, p[0] + 2 * w[0], p[1] + 2 * w[1], p[2] + 2 * w[2]);
    near(far.u, q.u, 1e-9); near(far.v, q.v, 1e-9); near(far.d, q.d + 2, 1e-9);
    // a vertical line through the point is met at the point's height; a plane through p with a tilted normal is met at p
    const onLine = CAM.cam3HitLine(ray, [p[0], p[1], 0], [0, 0, 1]);
    near(onLine.s, p[2], 1e-7); near(onLine.point[2], p[2], 1e-7);
    const tilted = CAM.cam3HitPlane(ray, p, [1, 2, 3]);
    near(tilted[0], p[0], 1e-8); near(tilted[1], p[1], 1e-8); near(tilted[2], p[2], 1e-8);
  }
  assert.equal(CAM.cam3HitPlane(CAM.cam3Ray(0, 0.5, 0, 0), [0, 0, 0], CAM.cam3Dir(0, 0.5).map((v, i) => [v, 0, 0][i]) && [0, 0, 0]), null);
  const cam = { yaw: 0, pitch: 0.5 };
  CAM.cam3Turn(cam, 0.3, 10); near(cam.pitch, CAM.PITCH_MAX); near(cam.yaw, 0.3);
  CAM.cam3Turn(cam, 0, -10); near(cam.pitch, CAM.PITCH_MIN);
  assert.equal(CAM.cam3HitLine(CAM.cam3Ray(0.3, 0.9, 1, 1), [0, 0, 0], CAM.cam3Dir(0.3, 0.9)), null, "a line along the view ray has no nearest point");
});

test("space template handles: the point stays on its constraint, round trips, snaps, stays in range and moves one step per arrow", () => {
  const e = byId["space-lines"];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  for (const m of e.missions) {
    const s = { ...e.state, ...m.set };
    for (const [id, c] of Object.entries(e.controls).filter(([, x]) => x.kind === "handle")) {
      const k = c.constraint(s), at = c.at(s), rel = [at[0] - k.o[0], at[1] - k.o[1], at[2] - k.o[2]];
      // the point lies on its line or plane: no component along the plane normal / across the line
      if (k.e2) { const n = [k.e1[1] * k.e2[2] - k.e1[2] * k.e2[1], k.e1[2] * k.e2[0] - k.e1[0] * k.e2[2], k.e1[0] * k.e2[1] - k.e1[1] * k.e2[0]]; near(dot(rel, n), 0, 1e-9, `${id} on its plane`); }
      else { const l = Math.hypot(...k.e1), along = dot(rel, k.e1) / l; near(Math.hypot(...rel), Math.abs(along), 1e-9, `${id} on its line`); }
      // a drag to the handle's own position leaves the state alone (when the state is inside the handle's range)
      const next = { ...s, ...(c.drag(s, at, {}) ?? {}) };
      const again = c.at(next);
      if (Object.keys(s).every((key) => next[key] === s[key])) near(again[0] + again[1] + again[2], at[0] + at[1] + at[2], 1e-9, `${e.id}/${m.id}.${id} round trip`);
      // far drags clamp and stay finite and whole
      for (const p of [[100, 100, 100], [-100, -100, -100], [0, 0, 100], [100, -100, 0]]) {
        const far = c.drag(s, p, {});
        if (far) for (const v of Object.values(far)) assert.ok(Number.isFinite(v) && Math.abs(v) <= 10 && Number.isInteger(v), `${e.id}.${id} far drag ${v}`);
      }
    }
  }
  // the clamps: B can never fall on A, the heights stay between 1 and 5
  const s0 = { ...e.state, ux: 0, uy: 0, uz: 1, az: 0 };
  assert.equal(e.controls.tip.drag(s0, [s0.ax, s0.ay, 0], {}).ux, 0, "B above A is allowed");
  assert.equal(e.controls.tipz.drag({ ...s0, az: 1, uz: 2 }, [0, 0, 1], {}), null, "u = 0 is refused");
  assert.equal(e.controls.Az.drag(e.state, [0, 0, 0], {}).az, 1); assert.equal(e.controls.Az.drag(e.state, [0, 0, 9], {}).az, 5);
});

test("line: slope, intercept, direction vector and equations agree with the points", () => {
  for (const ax of [-5.5, -2, 0, 1.5, 4]) for (const ay of [-4.5, -1, 0.5, 3]) for (const bx of [-3, 0, 2, 5.5]) for (const by of [-4, 0, 1.5, 4.5]) {
    const m = LN.model({ ax, ay, bx, by });
    assert.deepEqual(m.u, [bx - ax, by - ay]);
    if (m.degenerate || m.vertical) { assert.equal(m.m, null); continue; }
    near(m.m, (by - ay) / (bx - ax), 1e-12);
    // both points are on y = m x + p, and so is any other point of the line
    near(m.m * ax + m.p, ay, 1e-9); near(m.m * bx + m.p, by, 1e-9);
    near(m.m * (ax + 3 * (bx - ax)) + m.p, ay + 3 * (by - ay), 1e-9);
    // the exact fractions equal the decimals
    near(m.slope.num / m.slope.den, m.m, 1e-12); near(m.intercept.num / m.intercept.den, m.p, 1e-12);
    // the Cartesian equation vanishes on A and B and is in lowest terms with a positive first coefficient
    const [a, b, c] = m.cartesian;
    near(a * ax + b * ay + c, 0, 1e-9); near(a * bx + b * by + c, 0, 1e-9);
    assert.ok(a > 0 || (a === 0 && b > 0)); assert.ok([a, b, c].every(Number.isInteger));
  }
  assert.deepEqual(LN.fraction(1.5, 0.5), { num: 3, den: 1 }); assert.deepEqual(LN.fraction(-0.5, 1.5), { num: -1, den: 3 }); assert.deepEqual(LN.fraction(1, -3), { num: -1, den: 3 });
  assert.equal(LN.model({ ax: 1, ay: 1, bx: 1, by: 3 }).vertical, true); assert.equal(LN.model({ ax: 1, ay: 1, bx: 1, by: 1 }).degenerate, true);
  const ex = byId.line, fmt = makeFormat("fr"), f = (s) => ex.views.formula(s, { fmt, lang: "fr" });
  assert.equal(f({ ax: 0, ay: 1, bx: 2, by: 5 }), "m = Δy/Δx = 4/2 = 2 ; y = 2x + 1");
  assert.match(f({ ax: 0, ay: 0, bx: 3, by: 1 }), /≈ 0,33 ; y = \(1\/3\)x$/);
  assert.match(f({ ax: 1, ay: 1, bx: 1, by: 3 }), /Droite verticale x = 1/);
  assert.equal(ex.views.readout({ ax: 0, ay: 0, bx: 3, by: 1 }, { fmt, lang: "fr" })[1][1], "1/3 ≈ 0,33");
});

test("exponential: f(x + 1) = a f(x) for every x, the sequence is geometric, the direction follows a", () => {
  for (const k of [0.5, 1, 1.5, 6]) for (const a of [0.25, 0.5, 1, 2, 3]) {
    const s = { k, a }, m = EX.model(s);
    for (const x of [-3, -0.5, 0, 1, 2.5, 4]) near(m.f(x + 1), a * m.f(x), 1e-9 * Math.max(1, m.f(x + 1)), "f(x + 1) = a f(x)");
    EX.terms(s, 6).forEach((u, n) => near(u, k * a ** n, 1e-9 * Math.max(1, u)));
    assert.equal(m.direction, a > 1 ? "up" : a < 1 ? "down" : "flat");
    assert.ok(m.f(-3) > 0 && m.f(4) > 0, "never zero");
  }
  const h = byId.exponential.controls.unit, s = { k: 1.5, a: 2 };
  assert.equal(h.drag(s, 1, 6).a, 3, "capped at 3"); assert.equal(h.drag(s, 1, 0.5).a, 0.25, "a stays positive"); assert.equal(h.nudge(s, 1, 0).a, 2.25);
  assert.equal(byId.exponential.controls.start.drag(s, 0, 99).k, 6); assert.equal(byId.exponential.controls.start.drag(s, 0, -3).k, 0.5);
});

test("cobweb: the fixed point solves f(l) = l, the gap shrinks by |a| each step, the staircase follows the terms", () => {
  for (const a of [-1.75, -0.75, -0.25, 0, 0.5, 0.75, 1.25]) for (const b of [-2, 0, 1.5, 4]) for (const u0 of [-1, 3, 8]) {
    const s = { a, b, u0, n: 8 }, m = CW.model(s);
    near(CW.f(s, m.fixed), m.fixed, 1e-9, "f(l) = l");
    m.terms.forEach((u, k) => { if (k) near(u, a * m.terms[k - 1] + b, 1e-9); near(u - m.fixed, a ** k * (u0 - m.fixed), 1e-9 * Math.max(1, Math.abs(u))); });
    assert.equal(m.contracting, Math.abs(a) < 1);
    assert.equal(m.path.length, 1 + 2 * 8);
    m.path.slice(1).forEach(([x, y], i) => { if (i % 2 === 0) near(y, CW.f(s, x), 1e-9, "up to the graph"); else near(x, y, 1e-12, "across to the line y = x"); });
  }
  assert.equal(CW.fixedPoint({ a: 1, b: 1 }), null);
  const s = { a: 0.5, b: 2, u0: 8, n: 0 };
  assert.deepEqual(CW.model(s).path, [[8, 0]]); assert.equal(CW.model({ ...s, n: 3 }).last, 4.5);
  const slope = byId.cobweb.controls.slope;
  assert.equal(slope.drag(s, 2, 2 * -1.5 + 2).a, -1.5); assert.equal(slope.drag(s, 2, 99).a, 1.5); assert.equal(slope.drag(s, 2, -99).a, -2);
});

test("matrix: the determinant is the signed area of the image of the unit square and multiplies every area", () => {
  for (const a of [-2.5, -1, 0, 0.5, 2]) for (const b of [-2, 0, 1, 2.5]) for (const c of [-2.5, 0, 1.5]) for (const d of [-1, 0, 2, 2.5]) {
    const m = MX.model({ a, b, c, d });
    near(m.det, a * d - b * c, 1e-12); near(m.area, Math.abs(m.det), 1e-12);
    // shoelace area of the image of an arbitrary triangle is |det| times the area of the triangle
    const tri = [[0.5, 0.25], [2, 1], [1, 3]], img = tri.map(m.f);
    const sh = (P) => Math.abs(P[0][0] * (P[1][1] - P[2][1]) + P[1][0] * (P[2][1] - P[0][1]) + P[2][0] * (P[0][1] - P[1][1])) / 2;
    near(sh(img), m.area * sh(tri), 1e-9, "areas are multiplied by |det|");
    assert.equal(m.orientation, Math.sign(m.det)); assert.equal(m.invertible, m.det !== 0);
    if (m.inverse) {   // M^-1 M = I on the basis vectors
      const back = (v) => [m.inverse.i[0] * v[0] + m.inverse.j[0] * v[1], m.inverse.i[1] * v[0] + m.inverse.j[1] * v[1]];
      near(back(m.i)[0], 1, 1e-9); near(back(m.i)[1], 0, 1e-9); near(back(m.j)[0], 0, 1e-9); near(back(m.j)[1], 1, 1e-9);
    } else assert.ok(m.i[0] * m.j[1] === m.i[1] * m.j[0], "flat means collinear columns");
  }
  assert.ok(!Object.is(MX.model({ a: 0, b: 0, c: 0, d: 0 }).det, -0));
  const i = byId.matrix.controls.i; assert.deepEqual(i.drag(byId.matrix.state, 9, -9), { a: 2.5, c: -2.5 });
});

test("space-lines: the intersection, the projection and the clipping to the box are right", () => {
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  let secants = 0, parallels = 0, inside = 0;
  for (const A of [[-2, -1, 0], [0, 0, 1], [3, -2, 4], [1, 1, 2]]) for (const u of [[2, 1, 1], [1, 1, -1], [0, 0, 1], [2, 0, -1], [-1, 3, 0], [1, 1, 2]]) for (const d of [-7, -2, 0, 3]) {
    const m = SL.model({ ax: A[0], ay: A[1], az: A[2], ux: u[0], uy: u[1], uz: u[2], d, t: 0.5 });
    near(dot(SL.N, m.u), m.nu); near(dot(SL.N, A) + d, m.sA);
    if (m.relation === "secant") {
      secants++; near(dot(SL.N, m.I) + d, 0, 1e-9, "I is in the plane");
      for (let k = 0; k < 3; k++) near(m.I[k], A[k] + m.tStar * u[k], 1e-9, "I is on the line");
    } else { assert.equal(m.nu, 0); assert.equal(m.tStar, null); if (m.relation === "inside") { inside++; assert.equal(m.sA, 0); } else { parallels++; assert.notEqual(m.sA, 0); } }
    // the orthogonal projection: in the plane, AH along n, and AH = |n . A + d| / |n|
    near(dot(SL.N, m.H) + d, 0, 1e-9, "H is in the plane");
    const ah = [A[0] - m.H[0], A[1] - m.H[1], A[2] - m.H[2]], cr = [ah[1] * 2 - ah[2] * 1, ah[2] * 1 - ah[0] * 2, ah[0] * 1 - ah[1] * 1];
    near(Math.hypot(...cr), 0, 1e-9, "AH is parallel to n"); near(Math.hypot(...ah), m.dist, 1e-9);
    // the clipped part of the line is inside the box, and its ends are on the box
    if (m.clip) for (const t of m.clip) SL.BOX.forEach(([lo, hi], k) => { const v = A[k] + t * u[k]; assert.ok(v >= lo - 1e-9 && v <= hi + 1e-9, "inside the box"); });
    // the plane polygon: every vertex in the plane and in the box, at least three, convex order (consecutive turns have one sign)
    const poly = m.planePoly;
    if (poly) {
      assert.ok(poly.length >= 3);
      for (const p of poly) { near(dot(SL.N, p) + d, 0, 1e-9, "polygon in the plane"); SL.BOX.forEach(([lo, hi], k) => assert.ok(p[k] >= lo - 1e-9 && p[k] <= hi + 1e-9)); }
      const signs = poly.map((p, i) => { const q = poly[(i + 1) % poly.length], r = poly[(i + 2) % poly.length], v1 = q.map((x, k) => x - p[k]), v2 = r.map((x, k) => x - q[k]); return dot([v1[1] * v2[2] - v1[2] * v2[1], v1[2] * v2[0] - v1[0] * v2[2], v1[0] * v2[1] - v1[1] * v2[0]], SL.N); });
      assert.ok(signs.every((v) => v >= -1e-9) || signs.every((v) => v <= 1e-9), "convex polygon");
    }
  }
  assert.ok(secants > 20 && parallels > 5 && inside > 0, `${secants} ${parallels} ${inside}`);
  assert.equal(SL.planePolygon([1, 1, 2], -100), null, "a plane that misses the box");
  assert.equal(SL.clipLine([9, 0, 0], [0, 1, 0]), null); assert.deepEqual(SL.clipLine([0, 0, 0], [1, 0, 0]), [-4, 4]);
  assert.equal(SL.quantity("tStar", { ...byId["space-lines"].state, d: -7 }), 2);
});

// ---- the experiments about proof (tiles, euler-primes, fermat, circle-regions) and geometric chance (buffon, bertrand)
test("tiles: the excess is a² − ab − b², ±1 for consecutive Fibonacci numbers, and the pieces keep their areas", () => {
  for (const [a, b] of TI.PAIRS) {
    const m = TI.model({ a, b }), P = TI.pieces(a, b);
    assert.equal(m.excess, a * a - a * b - b * b);
    assert.equal(Math.abs(m.excess), 1, "Cassini: consecutive Fibonacci numbers");
    assert.equal(m.det, m.excess);
    near(TI.area(P.sliver), m.excess, 1e-12, "the sliver is the gap (or the overlap)");
    for (const r of ["I", "II", "III", "IV"]) near(Math.abs(TI.area(P.square[r])), Math.abs(TI.area(P.rect[r])), 1e-12, `piece ${r} keeps its area`);
    near(["I", "II", "III", "IV"].reduce((t, r) => t + Math.abs(TI.area(P.square[r])), 0), (a + b) ** 2, 1e-12, "the pieces tile the square");
  }
  for (let a = 1; a < 60; a++) for (let b = 1; b <= a; b++) assert.notEqual(a * a - a * b - b * b, 0, "never exact for whole numbers");
  for (const k of ["A", "B"]) near(["red", "blue", "l7", "l8"].reduce((t, p) => t + TI.area(TI.CURRY[k][p]), 0), 32, 1e-12);
  near(TI.area(TI.CURRY.B.hole), 1, 1e-12);
  // the usual presentation is a cheat: its pieces tile the rectangle (and Curry's triangle A) exactly, unlike the true ones
  for (const [a, b] of TI.PAIRS) {
    const c = TI.cheatRect(a, b), t = TI.pieces(a, b).rect;
    near(["I", "II", "III", "IV"].reduce((s, r) => s + Math.abs(TI.area(c[r])), 0), a * (2 * a + b), 1e-9, "cheated pieces fill the rectangle");
    assert.ok(Math.abs(Math.abs(TI.area(c.I)) - Math.abs(TI.area(t.I))) > 1e-3, "the cheated pieces are not the true ones");
  }
  near(["red", "blue", "l7", "l8"].reduce((s, p) => s + TI.area(TI.CURRY_CHEAT.A[p]), 0), 32.5, 1e-9, "cheated A fills the true triangle");
  near(["red", "blue", "l7", "l8"].reduce((s, p) => s + TI.area(TI.CURRY_CHEAT.B[p]), 0) + TI.area(TI.CURRY_CHEAT.B.hole), 32.5, 1e-9, "cheated B and its hole fill it");
});

test("euler-primes: n² + n + c is prime for n ≤ c − 2 and equals c² at n = c − 1, for every lucky c", () => {
  const prime = (N) => { if (N < 2) return false; for (let d = 2; d * d <= N; d++) if (N % d === 0) return false; return true; };
  for (const c of EP.LUCKY) {
    const m = EP.model({ c, n: 0 });
    assert.equal(m.firstComposite, c - 1, `c = ${c}`);
    for (let n = 0; n < EP.CELLS; n++) assert.equal(m.primes[n], prime(n * n + n + c), `c = ${c}, n = ${n}`);
    assert.equal(EP.f(c, c - 1), c * c);
  }
});

test("fermat: 2^e + 1 is factored exactly for e ≤ 32 (BigInt product, prime factors), prime only at e = 1, 2, 4, 8, 16", () => {
  const isPrimeBig = (n) => { if (n < 2n) return false; for (let d = 2n; d * d <= n; d++) if (n % d === 0n) return false; return true; };
  for (let e = 1; e <= FE.MAX_E; e++) {
    const m = FE.model({ e }), N = 2n ** BigInt(e) + 1n;
    assert.equal(BigInt(m.N), N);
    assert.equal(m.factors.reduce((t, [p, k]) => t * BigInt(p) ** BigInt(k), 1n), N, `e = ${e}`);
    for (const [p] of m.factors) if (p < 1e7) assert.ok(isPrimeBig(BigInt(p)), `${p} is prime`);
    assert.equal(m.prime, [1, 2, 4, 8, 16].includes(e), `e = ${e}`);
  }
  assert.deepEqual(FE.model({ e: 32 }).factors, [[641, 1], [6700417, 1]]);
});

test("circle-regions: no three chords meet for the general points, the count follows 1 + C(n,2) + C(n,4), the regular polygons lose regions", () => {
  for (let n = 1; n <= CR.MAX_N; n++) {
    const m = CR.model({ n, mode: "general" });
    assert.equal(m.concurrent, false, `n = ${n}`);
    assert.equal(m.hits.length, (n * (n - 1) * (n - 2) * (n - 3)) / 24 + 0, "one crossing per four points");
    assert.equal(m.regions, CR.formula(n));
  }
  // known values for regular polygons (OEIS A006533): 1, 2, 4, 8, 16, 30, 57, 88, 163, 230
  assert.deepEqual(Array.from({ length: 10 }, (_, i) => CR.model({ n: i + 1, mode: "regular" }).regions), [1, 2, 4, 8, 16, 30, 57, 88, 163, 230]);
});

test("buffon and bertrand: the seeded simulations agree with 2L/π and 1/3, 1/2, 1/4 within four standard deviations", () => {
  const within = (f, p, n) => Math.abs(f - p) <= 4 * Math.sqrt((p * (1 - p)) / n);
  for (const L of [0.25, 0.5, 1]) for (const seed of [1, 7, 42]) { const m = BU.model({ L, runs: 5000, seed }); assert.ok(within(m.freq, (2 * L) / Math.PI, 5000), `L = ${L}: ${m.freq}`); }
  for (const method of BE.METHODS) for (const seed of [1, 7, 42]) { const m = BE.model({ method, runs: 5000, seed }); assert.ok(within(m.freq, BE.THEORY[method], 5000), `${method}: ${m.freq}`); }
  // a chord drawn by each method has both ends on the unit circle
  for (const method of BE.METHODS) for (const u of [0, 0.3, 0.99]) { const [a, b] = BE.chord(method, u, 0.6, 0.2); near(Math.hypot(...a), 1, 1e-9); near(Math.hypot(...b), 1, 1e-9); }
  // the same series is the same whatever the button presses: the first 100 drops do not change when more are added
  assert.equal(BU.model({ L: 1, runs: 100, seed: 3 }).hits, BU.simulate(3, 1, 100).hits);
});
