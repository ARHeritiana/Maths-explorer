// The __ID__ challenge, pure parts: every answer recomputed by an independent method over the whole parameter range.
// TEMPLATE: copy to tests/__ID__.test.mjs, then list it in tests/CLAUDE.md.
import test from "node:test";
import assert from "node:assert/strict";
import { variant } from "../site/js/challenges/__ID__/index.js";

test("__ID__: brute force over every pair of people gives the answer", () => {
  const p = variant.params.find((x) => x.id === "n");
  for (let n = p.min; n <= p.max; n++) {
    let count = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) count++;   // independent of the formula in maths.js
    assert.equal(variant.answer({ n }), count, `n = ${n}`);
  }
});
