import test from "node:test";
import assert from "node:assert/strict";
import { EXPERIMENTS } from "../dist/js/lab/registry.js";
import { snap } from "../dist/js/lab/models/num.js";

// Handle dragging as the lab page does it (snap to the handle grid, then the control's `drag`), for every experiment.
const exp = (id) => EXPERIMENTS.find((e) => e.id === id);
const drag = (id, handle, state, x, y) => {
  const c = exp(id).controls[handle], g = Array.isArray(c.grid) ? c.grid : [c.grid || 0, c.grid || 0];
  return { ...state, ...(c.drag(state, snap(x, g[0]), snap(y, g[1])) ?? {}) };
};
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
  // probability: the expectation marker E = np moves p on the 0,05 grid
  const pr = exp("probability").state; // n = 10, p = 0,3
  assert.equal(drag("probability","expectation",pr,5,0).p, 0.5);
  assert.equal(drag("probability","expectation",{ ...pr, n: 6 },4.5,0).p, 0.75);
  assert.equal(drag("probability","expectation",pr,-4,0).p, 0); assert.equal(drag("probability","expectation",pr,40,0).p, 1);
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
test("vectors, statistics and complex handles move only what they name, and stay on their grids", () => {
  const v = exp("vectors").state; // u = (3 ; 1), v = (-1 ; 3)
  assert.deepEqual(drag("vectors","u",v,-2,4), { ...v, ux: -2, uy: 4 });
  assert.deepEqual(drag("vectors","v",v,2.3,-3.2), { ...v, vx: 2.5, vy: -3 }, "the tip snaps to the 0,5 grid");
  assert.deepEqual(drag("vectors","u",v,9,-9), { ...v, ux: 4, uy: -4 }, "tips stay in the frame");
  const st = exp("statistics").state;
  const moved = drag("statistics","d6",st,7.3,0);
  assert.deepEqual(moved.data, [2, 3, 4, 4, 5, 6, 7.5]); assert.deepEqual(st.data, [2, 3, 4, 4, 5, 6, 9]);
  assert.equal(drag("statistics","d0",st,-3,0).data[0], 0); assert.equal(drag("statistics","d0",st,99,0).data[0], 20);
  const cx = exp("complex").state; // z = 1 (modulus 1, argument 0), t = (1 ; 2)
  assert.deepEqual(drag("complex","z",cx,-2,3), { ...cx, r: 3.5, theta: 120 }, "polar grid: modulus 0,25, argument 15 degrees");
  assert.deepEqual(drag("complex","z",cx,0,-2), { ...cx, r: 2, theta: -90 });
  assert.deepEqual(drag("complex","t",cx,-0.6,9), { ...cx, tx: -0.5, ty: 2.5 });
});
test("far drags clamp and stay finite for every handle of every experiment", () => {
  for (const e of EXPERIMENTS) for (const [id, c] of Object.entries(e.controls).filter(([, x]) => x.kind === "handle")) {
    // a 3D handle (template space) receives the constrained point, not a screen position
    const spots = e.template === "space" ? [[1e6, 1e6, 1e6], [-1e6, -1e6, -1e6], [1e6, -1e6, 0]] : [[1e6, 1e6], [-1e6, -1e6], [1e6, -1e6]];
    for (const p of spots) {
      const next = e.template === "space" ? { ...e.state, ...(c.drag(e.state, p, {}) ?? {}) } : drag(e.id, id, e.state, ...p);
      for (const v of Object.values(next).flat()) if (typeof v === "number") assert.ok(Math.abs(v) < 1e3, `${e.id}.${id}`);
    }
  }
});
test("space-lines handles move whole numbers of the point they name", () => {
  const c = exp("space-lines").controls, s = exp("space-lines").state;   // A = (-2 ; -1 ; 0), u = (2 ; 1 ; 1)
  assert.deepEqual(c.A.drag(s, [1, 3, 0], {}), { ax: 1, ay: 3 });
  assert.deepEqual(c.A.drag(s, [9, -9, 0], {}), { ax: 4, ay: -4 }, "A stays in the frame");
  assert.deepEqual(c.tip.drag(s, [0, 0, 0], {}), { ux: 2, uy: 1 }, "u = B - A, so B at the origin shadow gives u = (2 ; 1)");
  assert.deepEqual(c.tipz.drag(s, [0, 0, 4], {}), { uz: 4 });
  assert.deepEqual(c.Az.drag({ ...s, az: 1 }, [-2, -1, 3], {}), { az: 3 });
});
