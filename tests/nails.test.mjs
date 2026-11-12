// The nails challenge, pure parts: geometry of the rope (no dip between two consecutive over-crossings), timeline of a pulled nail,
// the drawn stroke (a click alone draws nothing) and the plan and captions of the worked solution (no group-theory vocabulary).
import test from "node:test";
import assert from "node:assert/strict";
import { rope, nailX, NAIL_Y, FRAME, isFlatJoin } from "../dist/js/challenges/nails/rope-path.js";
import { timeline, poseAt, poseOf, settled } from "../dist/js/challenges/nails/timeline.js";
import { startStroke, extendStroke, previewPoints, finishStroke, BASE, CORNERS } from "../dist/js/challenges/nails/gesture.js";
import { plan, stepTimeline } from "../dist/js/challenges/nails/plan.js";
import { NAIL_VARIANTS, SHORTEST, parseNails, falls, meets } from "../dist/js/challenges/nails/maths.js";
import { diagram } from "../dist/js/challenges/nails/solution.js";
import { variant } from "../dist/js/challenges/nails/index.js";

const all = (word, n) => rope(word, n).flatMap((p) => p.pts);
const R_MAX = 5;
// the points of the rope strictly between the two nails' arches on the nail line

test("rope path: the two ends are the corners of the frame", () => {
  for (const [w, n] of [[[1, 2], 2], [[1, -2, -1, 2], 2], [[1, 2, 3], 3], [[], 3]]) {
    const p = rope(w, n), first = p[0].pts[0], last = p.at(-1).pts.at(-1);
    assert.deepEqual(first.map(Math.round), [FRAME.x, FRAME.y]); assert.deepEqual(last.map(Math.round), [FRAME.x + FRAME.w, FRAME.y]);
  }
});
// the points of turn t's piece before its arch starts (what the rope does just before going over nail t)
const approach = (word, n, t) => { const piece = rope(word, n).find((p) => p.j === t), out = []; for (const pt of piece.pts) { if (pt[1] < NAIL_Y - 1) break; out.push(pt); } return out; };
test("rope path: over one nail then directly over the next, no dip between them (straight along the nail line)", () => {
  for (const [w, n] of [[[1, 2], 2], [[-2, -1], 2], [[1, 2, 3], 3], [[-3, -2, -1], 3], [[1, 2, 3, 4], 4]]) {
    for (let t = 1; t < w.length; t++) {
      const pts = approach(w, n, t);
      assert.ok(pts.length > 2, "the join exists");
      for (const [, y] of pts) assert.ok(Math.abs(y - NAIL_Y) < 1e-6 || y < NAIL_Y, `no dip below the nail line in ${w} before turn ${t} (y=${y})`);
    }
  }
});
test("rope path: over then under, and under then under, go below the nails", () => {
  for (const [w, n, a, b] of [[[1, -2], 2, 0, 1], [[-1, -2], 2, 0, 1], [[2, 1], 2, 0, 1], [[-1, 2], 2, 0, 1], [[1, 1], 2, 0, 1]]) {
    const dips = all(w, n).filter(([x, y]) => x > nailX(a, n) - R_MAX && x < nailX(b, n) + R_MAX && y > NAIL_Y + 5);
    assert.ok(dips.length > 0, `${w} passes under a nail`);
  }
});
test("rope path: a join is straight exactly when no nail lies between its ends", () => {
  assert.equal(isFlatJoin(nailX(0, 3) + 4, nailX(1, 3) - 4, 3), true);
  assert.equal(isFlatJoin(nailX(0, 3) + 4, nailX(2, 3) - 4, 3), false, "nail B lies between");
  assert.equal(isFlatJoin(nailX(1, 3) + 4, nailX(1, 3) - 4, 3), false, "round the same nail, under it");
});
test("rope path: continuous (no jump between neighbouring points) for every stored winding", () => {
  for (const v of NAIL_VARIANTS) {
    const [n] = parseNails(v), pts = all(SHORTEST[v], n);
    for (let i = 1; i < pts.length; i++) assert.ok(Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) < 8, `${v} jump at ${i}`);
  }
});
test("rope path: a collapsed rope has every turn on its rest line", () => {
  const w = SHORTEST["2,1"], flat = rope(w, 2, { collapse: w.map(() => 1), fall: 1 }).flatMap((p) => p.pts);
  assert.ok(flat.every(([, y]) => y > NAIL_Y + 3));
});

test("timeline: starts at the resting pose of `from`, ends at the resting pose of the new mask", () => {
  for (const v of NAIL_VARIANTS) {
    const [n] = parseNails(v), w = SHORTEST[v];
    for (let mask = 0; mask < 1 << n; mask++) for (let i = 0; i < n; i++) {
      if ((mask >> i) & 1) continue;
      const tl = timeline(w, n, { from: mask, add: [i], prev: mask }), a = poseAt(tl, 0), b = poseAt(tl, 1), want = poseOf(w, n, tl.to);
      assert.deepEqual(a.pull, poseOf(w, n, mask).pull);
      assert.deepEqual(b.pull, want.pull); assert.deepEqual(b.collapse, want.collapse); assert.equal(b.fall, want.fall); assert.equal(b.sway, 0);
      assert.equal(want.fall === 1, falls(w, tl.to));
    }
  }
});
test("timeline: the picture falls only when nothing is left, collapse never decreases, pull stays within 0..1", () => {
  const w = SHORTEST["3,2"], n = 3, tl = timeline(w, n, { from: 0, add: [0, 1] });
  let last = poseAt(tl, 0).collapse;
  for (let k = 0; k <= 200; k++) {
    const p = poseAt(tl, k / 200);
    p.collapse.forEach((c, j) => { assert.ok(c >= last[j] - 1e-9 && c <= 1 + 1e-9); });
    p.pull.forEach((v) => assert.ok(v >= 0 && v <= 1)); assert.ok(p.fall >= 0 && p.fall <= 1);
    last = p.collapse;
  }
  assert.equal(tl.events.at(-1).type, "fall");
  assert.equal(poseAt(timeline(w, n, { from: 0, add: [0] }), 0.999).fall, 0, "one nail out: still caught");
  assert.equal(timeline(w, n, { from: 0, add: [0] }).events.at(-1).type, "sway");
});
test("timeline: a nail presses flat before it pops, and slips follow it", () => {
  const tl = timeline(SHORTEST["2,1"], 2, { from: 0, add: [0] }), types = tl.events.map((e) => e.type);
  assert.deepEqual(types.slice(0, 2), ["pull", "slip"]); assert.ok(types.includes("undo") && types.at(-1) === "fall");
  const early = poseAt(tl, 0.05); assert.ok(early.squash[0] > 0 && early.pull[0] === 0, "pressed flat first");
});
test("timeline: settled agrees with free reduction on every mask", () => {
  for (const v of NAIL_VARIANTS) { const [n] = parseNails(v); for (let m = 0; m < 1 << n; m++) assert.equal(settled(SHORTEST[v], m).falls, falls(SHORTEST[v], m)); }
});

test("stroke: a click, even on a corner of the frame, draws and moves nothing", () => {
  for (const c of CORNERS) {
    const g = startStroke({ x: c.x + 1, y: c.y - 1 });
    assert.deepEqual(previewPoints(g), [], "no preview before the pointer moves");
    assert.deepEqual(g.points[1], c, "the rope starts exactly at the corner");
    assert.equal(g.turns.length, 0); assert.equal(g.moved, false);
    const r = finishStroke(g, 3); assert.equal(r.moved, false);
  }
  assert.deepEqual(BASE, { x: 50, y: 40 });
});
test("stroke: the preview starts where the pointer went down, never at the base point", () => {
  const g = startStroke({ x: 30, y: 46 }); extendStroke(g, { x: 35, y: 40 }, 2);
  const pts = previewPoints(g); assert.deepEqual(pts[0], { x: 30, y: 46 }); assert.ok(pts.every((p) => p !== BASE));
});
test("stroke: a loop round one nail is one turn, round it the other way the opposite turn, through a nail is invalid", () => {
  const loop = (dir) => { const x = nailX(0, 2), g = startStroke({ x: x - 6, y: 30 }); const pts = [[x - 6, 8], [x + 6, 8], [x + 6, 30]]; (dir > 0 ? pts : pts.reverse()).forEach(([px, py]) => extendStroke(g, { x: px, y: py }, 2)); return finishStroke(g, 2); };
  assert.deepEqual(loop(1).turns.length, 1); assert.equal(loop(1).turns[0], -loop(-1).turns[0]);
  const g = startStroke({ x: nailX(0, 2), y: 30 }); extendStroke(g, { x: nailX(0, 2), y: 8 }, 2); assert.equal(finishStroke(g, 2).invalid, true);
});

const BAD = /group|groupe|g[ée]n[ée]rateur|generator|commutat|inverse|invers|mot\b|word|lettre|letter|r[ée]duit|libre|free|abélien|abelian/i;
test("plan: every variant, every step: consistent with the rule, ends on the answer, no dashes", () => {
  for (const v of NAIL_VARIANTS) {
    const [n, k] = parseNails(v), steps = plan(v);
    assert.equal(steps.at(-1).answer, SHORTEST[v].length);
    assert.ok(meets(SHORTEST[v], n, k));
    for (const st of steps) {
      for (const text of st.caption) { assert.ok(text.length > 8); assert.ok(!/[—–]/.test(text), text); assert.ok(!BAD.test(text), `group vocabulary in: ${text}`); }
      const tl = stepTimeline(st); assert.ok(tl.total > 0);
    }
    // the chain: pulling k nails one after the other holds until the k-th, which makes it fall
    const chain = steps.filter((s) => s.add.length === 1 && s.from === s.prev && s.word === SHORTEST[v]).slice(0, k);
    chain.forEach((s, i) => assert.equal(stepTimeline(s).events.at(-1).type, i === k - 1 ? "fall" : "sway", `${v} step ${i}`));
  }
});
test("plan: the counter-examples really break the rule (a nail with no turn, a nail with one turn only)", () => {
  for (const v of ["3,3", "4,4"]) { const [n] = parseNails(v), st = plan(v).find((s) => s.word.length < SHORTEST[v].length); assert.ok(falls(st.word, (1 << (n - 1)) - 1), "falls with only n-1 nails out"); }
  for (const v of ["2,1", "3,2", "4,3"]) { const [n] = parseNails(v), st = plan(v).find((s) => s.word.length === n), mask = ((1 << n) - 1) & ~1; assert.ok(!falls(st.word, mask), "a single turn still holds"); }
});
test("solution text and hints have no group-theory vocabulary", () => {
  for (const v of NAIL_VARIANTS) {
    const q = { nails: v };
    for (const text of [...variant.solution(q), ...variant.hints(q).flat()]) { assert.ok(!BAD.test(text), `vocabulary in: ${text.slice(0, 80)}`); assert.ok(!/[—–]/.test(text)); }
  }
});
test("solution diagram: steps follow the plan, durations are positive", () => {
  for (const v of NAIL_VARIANTS) { const q = { nails: v }, st = diagram.steps(q); assert.equal(st.length, plan(v).length); st.forEach((_, i) => assert.ok(diagram.dur(i, q) > 600)); }
});
