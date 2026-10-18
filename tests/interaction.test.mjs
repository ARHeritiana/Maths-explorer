import test from "node:test";
import assert from "node:assert/strict";
import { manipulate, snapParameter, graphPosition } from "../dist/js/interaction.js";
import { labs } from "../dist/js/content.js";
import { EXPERIMENTS } from "../dist/js/lab/registry.js";
import { snap } from "../dist/js/lab/models/num.js";

// Guided labs that still use sliders and `interaction.js` (probability, vectors, statistics, complex).
const guided = labs.filter((l) => !l.custom && !l.experiment);
const configured = (id, handle, position) => {
  const lab = labs.find(l => l.id === id);
  const result = manipulate(id, handle, lab.params.map(p => p[4]), position);
  return { ...result, values: result.values.map((v, i) => snapParameter(v, lab.params[i])) };
};
// The rebuilt experiments: a handle drag as the lab page does it (snap to the handle grid, then the control's `drag`).
const exp = (id) => EXPERIMENTS.find((e) => e.id === id);
const drag = (id, handle, state, x, y) => {
  const c = exp(id).controls[handle], g = Array.isArray(c.grid) ? c.grid : [c.grid || 0, c.grid || 0];
  return { ...state, ...(c.drag(state, snap(x, g[0]), snap(y, g[1])) ?? {}) };
};
test("screen coordinates map to graph coordinates on equal and adaptive scales", () => {
  const bounds = { xmin: -6, xmax: 6, ymin: -5, ymax: 7 };
  assert.deepEqual(graphPosition({x:48,y:314}, bounds), {x:-6,y:-5});
  assert.deepEqual(graphPosition({x:698,y:22}, bounds), {x:6,y:7});
  assert.deepEqual(graphPosition({x:373,y:168}, bounds), {x:0,y:1});
  const tiny = graphPosition({x:373,y:168}, {xmin:1e-10,xmax:3e-10,ymin:0,ymax:4});
  assert.ok(Math.abs(tiny.x / 2e-10 - 1) < 1e-14); assert.equal(tiny.y,2);
});
test("dragging quadratic handles changes the requested quantity only", () => {
  const s = exp("quadratic").state; // f(x) = x² − 2, vertex (0 ; −2)
  assert.deepEqual(drag("quadratic","yint",s,0,3), { a: 1, b: 0, c: 3 });
  // the vertex handle keeps a and moves (α ; β): f(x) = (x − 2)² − 1 = x² − 4x + 3
  assert.deepEqual(drag("quadratic","vertex",s,2,-1), { a: 1, b: -4, c: 3 });
  // the opening handle keeps the vertex in place and changes a: P is one unit right of the vertex
  const open = drag("quadratic","opening",s,1,-3);   // height above the vertex: -3 - (-2) = -1
  assert.equal(open.a, -1); assert.equal(open.b, 0); assert.equal(open.c, -2);
  const never0 = drag("quadratic","opening",s,1,-2);  // a = 0 is not a parabola: the handle stops at the smallest step
  assert.equal(Math.abs(never0.a), 0.25);
});
test("rotation and two-dimensional dragging preserve their mathematical models", () => {
  for (const [x,y,angle] of [[1,0,0],[0,1,90],[-1,0,180],[0,-1,270],[0.7,0.7,45]])
    assert.equal(drag("trig","angle",exp("trig").state,x,y).deg,angle);
  assert.equal(drag("trig","onGraph",exp("trig").state,Math.PI,0).deg,180);
  assert.equal(drag("trig","onGraph",exp("trig").state,100,0).deg,360);
  assert.deepEqual(configured("vectors","u",{x:-2,y:4}).values,[-2,4,-1,3]);
  assert.deepEqual(configured("vectors","v",{x:4,y:-3}).values,[3,1,4,-3]);
  assert.deepEqual(configured("complex","z",{x:-2,y:3}).values,[-2,3]);
});
test("sequence dragging uses the selected difference or ratio", () => {
  const s = exp("sequences").state; // arithmetic, u₀ = 2, r = 3
  assert.equal(drag("sequences","start",s,0,4).u0, 4);
  assert.equal(drag("sequences","start",s,0,0).u0, 0.5, "u₀ is never 0, so a ratio always exists");
  assert.equal(drag("sequences","step",s,1,4).r, 2);
  const g = { ...s, mode: "geom" };
  assert.equal(drag("sequences","step",g,1,4).q, 2);
  assert.equal(drag("sequences","step",g,1,-2).q, -1);
});
test("expectation, signed secant and bound dragging respect domains", () => {
  assert.deepEqual(configured("probability","expectation",{x:4.5,y:0}).values,[6,.75]);
  const s = exp("derivative").state; // x = 1, h = 1
  const left = drag("derivative","nearby",s,0.5,0);
  assert.equal(left.h, -0.5);
  const equal = drag("derivative","nearby",s,1,0);
  assert.equal(Math.abs(equal.h), 0.05); // Never allow a zero secant denominator.
  assert.equal(drag("derivative","base",s,-2,0).x, -2);
  assert.equal(drag("derivative","base",s,50,0).x, 3);
  const i = exp("integral").state; // [0 ; 1]
  assert.equal(drag("integral","upper",i,2,0).b, 2);
  assert.equal(drag("integral","upper",i,-5,0).b, 0.25, "b stays above a");
  assert.equal(drag("integral","lower",i,-9,0).a, -1);
  assert.equal(drag("integral","lower",i,5,0).a, 0.75, "a stays below b");
});
test("out-of-view drags clamp and snap to the same grid as sliders", () => {
  for (const lab of guided) for (const param of lab.params) {
    assert.equal(snapParameter(-1e8,param),param[1]);
    assert.equal(snapParameter(1e8,param),param[2]);
    for (let n=0;n<20;n++) {
      const value = snapParameter(param[1] + (param[2]-param[1])*n/19,param);
      assert.ok(value >= param[1] && value <= param[2]);
      assert.ok(Math.abs((value-param[1])/param[3] - Math.round((value-param[1])/param[3])) < 1e-7);
    }
    assert.equal(snapParameter(NaN,param),null);
  }
  // the same holds for every handle of every experiment: far drags stay inside the declared ranges
  for (const e of EXPERIMENTS) for (const [id, c] of Object.entries(e.controls).filter(([, x]) => x.kind === "handle"))
    for (const [x, y] of [[1e6, 1e6], [-1e6, -1e6], [1e6, -1e6]]) {
      const next = drag(e.id, id, e.state, x, y);
      for (const v of Object.values(next)) if (typeof v === "number") assert.ok(Math.abs(v) < 1e3, `${e.id}.${id}`);
    }
});
