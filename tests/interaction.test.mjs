import test from "node:test";
import assert from "node:assert/strict";
import { manipulate, snapParameter, graphPosition } from "../dist/js/interaction.js";
import { labs } from "../dist/js/content.js";

const configured = (id, handle, position, mode, direction) => {
  const lab = labs.find(l => l.id === id);
  const result = manipulate(id, handle, lab.params.map(p => p[4]), position, mode, direction);
  return { ...result, values: result.values.map((v, i) => snapParameter(v, lab.params[i])) };
};
test("screen coordinates map to graph coordinates on equal and adaptive scales", () => {
  const bounds = { xmin: -6, xmax: 6, ymin: -5, ymax: 7 };
  assert.deepEqual(graphPosition({x:48,y:314}, bounds), {x:-6,y:-5});
  assert.deepEqual(graphPosition({x:698,y:22}, bounds), {x:6,y:7});
  assert.deepEqual(graphPosition({x:373,y:168}, bounds), {x:0,y:1});
  const tiny = graphPosition({x:373,y:168}, {xmin:1e-10,xmax:3e-10,ymin:0,ymax:4});
  assert.ok(Math.abs(tiny.x / 2e-10 - 1) < 1e-14); assert.equal(tiny.y,2);
});
test("dragging quadratic handles changes the requested coefficient only", () => {
  assert.deepEqual(configured("quadratic","intercept",{x:0,y:3}).values,[1,0,3]);
  assert.deepEqual(configured("quadratic","bend",{x:2,y:-6}).values,[-1,0,-2]);
});
test("rotation and two-dimensional dragging preserve their mathematical models", () => {
  for (const [x,y,angle] of [[1,0,0],[0,1,90],[-1,0,180],[0,-1,270]])
    assert.equal(configured("trig","angle",{x,y}).values[0],angle);
  assert.deepEqual(configured("vectors","u",{x:-2,y:4}).values,[-2,4,-1,3]);
  assert.deepEqual(configured("vectors","v",{x:4,y:-3}).values,[3,1,4,-3]);
  assert.deepEqual(configured("complex","z",{x:-2,y:3}).values,[-2,3]);
});
test("sequence dragging uses the selected difference or ratio", () => {
  assert.deepEqual(configured("sequences","first",{x:0,y:4}).values,[4,1.5,10]);
  assert.equal(configured("sequences","second",{x:1,y:4},"arithmetic").values[1],2);
  assert.equal(configured("sequences","second",{x:1,y:4},"geometric").values[1],2);
  assert.equal(configured("sequences","second",{x:1,y:-2},"geometric").values[1],-1);
});
test("expectation, signed secant and partition dragging respect domains", () => {
  assert.deepEqual(configured("probability","expectation",{x:4.5,y:0}).values,[6,.75]);
  const left = configured("derivative","nearby",{x:.5,y:0});
  assert.deepEqual(left.values,[1,.5]); assert.equal(left.direction,-1);
  const equal = configured("derivative","nearby",{x:1,y:0});
  assert.equal(equal.values[1],.01); // Never allow a zero secant denominator.
  assert.deepEqual(configured("derivative","base",{x:-2,y:0}).values,[-2,1]);
  assert.equal(configured("integral","partition",{x:.1,y:0}).values[0],10);
  assert.equal(configured("integral","partition",{x:-1,y:0}).values[0],100);
});
test("out-of-view drags clamp and snap to the same grid as sliders", () => {
  for (const lab of labs) for (const param of lab.params) {
    assert.equal(snapParameter(-1e8,param),param[1]);
    assert.equal(snapParameter(1e8,param),param[2]);
    for (let n=0;n<20;n++) {
      const value = snapParameter(param[1] + (param[2]-param[1])*n/19,param);
      assert.ok(value >= param[1] && value <= param[2]);
      assert.ok(Math.abs((value-param[1])/param[3] - Math.round((value-param[1])/param[3])) < 1e-7);
    }
    assert.equal(snapParameter(NaN,param),null);
  }
});
