import test from "node:test";
import assert from "node:assert/strict";
import {
  quadratic,
  sequence,
  binomial,
  sampleBinomial,
  statistics,
  parseData,
  riemann,
  isAnswer,
} from "../dist/js/math.js";
import { labs, challenges, pathways, pathwayStages } from "../dist/js/content.js";

test("quadratics handle two, one and no roots and degenerate equations", () => {
  assert.deepEqual(quadratic(1, 0, -4).roots, [-2, 2]);
  assert.deepEqual(quadratic(1, 2, 1).roots, [-1]);
  assert.deepEqual(quadratic(1, 0, 1).roots, []);
  assert.deepEqual(quadratic(0, 2, -4).roots, [2]);
  assert.equal(quadratic(0, 0, 0).allReal, true);
  assert.equal(quadratic(0, 0, 1).allReal, false);
  for (let a = -3; a <= 3; a += 0.25)
    for (let b = -6; b <= 6; b += 0.5) {
      const q = quadratic(a, b, -2);
      for (const x of q.roots)
        assert.ok(Math.abs(a * x * x + b * x - 2) < 1e-8);
    }
});
test("sequence indexing begins at zero, including negative and zero ratios", () => {
  assert.deepEqual(sequence(3, 2, 5, true), [3, 6, 12, 24, 48]);
  assert.deepEqual(sequence(2, -2, 4, true), [2, -4, 8, -16]);
  assert.deepEqual(sequence(2, 0, 4, true), [2, 0, 0, 0]);
  assert.deepEqual(sequence(2, -1, 4), [2, 1, 0, -1]);
});
test("binomial distributions normalize and have the correct expected value across slider domain", () => {
  for (let n = 1; n <= 12; n++)
    for (let i = 0; i <= 20; i++) {
      const p = i / 20,
        b = binomial(n, p);
      assert.ok(Math.abs(b.reduce((a, x) => a + x, 0) - 1) < 1e-10);
      assert.ok(Math.abs(b.reduce((a, x, k) => a + k * x, 0) - n * p) < 1e-10);
      assert.ok(b.every((x) => x >= 0 && x <= 1));
    }
  assert.deepEqual(sampleBinomial(3, 0, 5), [5, 0, 0, 0]);
  assert.deepEqual(sampleBinomial(3, 1, 5), [0, 0, 0, 5]);
  assert.deepEqual(
    sampleBinomial(3, 0.5, 4, () => 0.4),
    [0, 0, 0, 4],
  );
});
test("statistics support bilingual decimals and reject malformed or unbounded inputs", () => {
  assert.deepEqual(parseData("2,5; -3.2 4"), [2.5, -3.2, 4]);
  assert.equal(statistics([2, 3, 4, 5, 100]).median, 4);
  assert.equal(statistics([2, 3, 4, 5, 100]).mean, 22.8);
  assert.equal(statistics([1, 2, 3, 4]).median, 2.5);
  assert.equal(statistics([7]).sd, 0);
  for (const input of [
    "",
    "2 nope 3",
    "Infinity",
    "10001",
    "1/2",
    "0x10",
    Array(101).fill(1).join(" "),
  ])
    assert.throws(() => parseData(input));
});
test("left Riemann sums underestimate and converge to integral of x² on [0,1]", () => {
  assert.equal(riemann(2), 0.125);
  let last = 0;
  for (let n = 2; n <= 100; n++) {
    const area = riemann(n);
    assert.ok(area > last && area < 1 / 3);
    last = area;
  }
  assert.ok(1 / 3 - last < 0.005);
});
test("answer parsing accepts fractions and decimal commas without executing expressions", () => {
  assert.ok(isAnswer("1/3", 1 / 3));
  assert.ok(isAnswer("0,5", 0.5));
  assert.ok(isAnswer("-2 / 4", -0.5));
  for (const input of ["", "1/0", "0/0", "2+2", "Infinity", "alert(1)", "0x10"])
    assert.equal(isAnswer(input, 0), false);
});
test("content links resolve and all learning content has two language versions", () => {
  assert.equal(
    new Set([...labs, ...challenges].map((x) => x.id)).size,
    labs.length + challenges.length,
  );
  for (const l of labs) {
    if (l.experiment) {
      // lab/experiments/ holds the text of the rebuilt experiments; lab-engine.test.mjs checks every string.
      for (const key of ["title", "group", "short", "intro", "prereq", "history", "story"])
        assert.ok(l[key].length === 2 && l[key].every((x) => typeof x === "string" && x.length > 0), l.id + "." + key);
      continue;
    }
    for (const key of [
      "title",
      "group",
      "short",
      "intro",
      "prereq",
      "quiz",
      "explain",
      "history",
      "story",
    ])
      assert.ok(
        l[key].length === 2 &&
          l[key].every((x) => typeof x === "string" && x.length > 0),
      );
    assert.ok(l.steps.length > 0, `${l.id}: exploration steps`);
    for (const step of l.steps)
      assert.ok(step.length === 2 && step.every(text => typeof text === 'string' && text.length > 0), `${l.id}: bilingual step`);
    assert.ok(Number.isFinite(l.answer));
  }
  for (const c of challenges) {
    for (const key of ["title", "topic", "prompt", "solution", "extension"])
      assert.ok(c[key].length === 2 && c[key].every(Boolean));
    assert.equal(c.hints.length, 2);
  }
  for (const p of pathways)
    for (const stage of pathwayStages(p))
      for (const id of stage.ids) assert.ok(labs.some((l) => l.id === id));
});
