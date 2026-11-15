// Owner rule (15 November 2026): a curiosity asks its real question. When that question has a number for an answer,
// the site checks it; otherwise the question is open (no `answer`), the site checks nothing and the page shows a
// written explanation instead. No question may be a filler such as "three masses of 1: total mass?".
import test from "node:test";
import assert from "node:assert/strict";
import { labs } from "../dist/js/content.js";
import { isAnswer } from "../dist/js/math.js";

const gallery = [...new Map(labs.filter((x) => x.custom).map((x) => [x.id, x])).values()];

test("every curiosity has a real question in both languages and an explanation", () => {
  assert.ok(gallery.length >= 30, `${gallery.length} curiosities`);
  for (const g of gallery) {
    assert.ok(Array.isArray(g.quiz) && g.quiz[0].length > 30 && g.quiz[1].length > 30, `${g.id}: question`);
    assert.ok(g.explain && g.explain[0].length > 40 && g.explain[1].length > 40, `${g.id}: explanation`);
    for (const text of [...g.quiz, ...g.explain]) assert.ok(!/[—–]|undefined|NaN/.test(text), `${g.id}: ${text}`);
  }
});

test("the filler questions are gone, and open questions carry a full written explanation", () => {
  const filler = /combien de modèles|masse totale|total mass|dépliées bout à bout|end to end|combien en reste|how many remain|multiple rationnel de quelle constante|formes congruentes|congruence classes|aire du film plan|planar film/i;
  for (const g of gallery) assert.ok(!filler.test(g.quiz.join(" ")), `${g.id}: filler question`);
  const open = gallery.filter((g) => g.answer === undefined);
  assert.ok(open.length >= 8, `open: ${open.map((g) => g.id)}`);
  for (const g of open) assert.ok(g.explain[0].length > 200, `${g.id}: an open question needs a real explanation`);
});

test("checked curiosities accept their own answer, as an exact value or within their tolerance", () => {
  for (const g of gallery.filter((x) => x.answer !== undefined)) {
    assert.ok(Number.isFinite(g.answer), g.id);
    assert.ok(isAnswer(String(g.answer), g.answer, g.tolerance ?? 1e-6), g.id);
  }
  const monty = gallery.find((g) => g.id === "monty-gallery");
  assert.ok(isAnswer("2/3", monty.answer, monty.tolerance) && isAnswer("0,67", monty.answer, monty.tolerance) && !isAnswer("1/2", monty.answer, monty.tolerance));
});
