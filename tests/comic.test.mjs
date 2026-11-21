// The cartoon explainer (site/js/challenges/common/comic.js): sentences are cut and merged to the step limit, and only
// real formulas (a relation or an operator with a digit, no ordinary words) are written on the board.
import { test } from "node:test";
import assert from "node:assert/strict";
import { sentences, mathBits, comic, hasFormulas } from "../site/js/challenges/common/comic.js";

test("sentences are cut at the end of each sentence and merged down to the limit", () => {
  assert.deepEqual(sentences("Un. Deux ! Trois ? Quatre."), ["Un.", "Deux !", "Trois ?", "Quatre."]);
  assert.equal(sentences("A. B. C. D. E. F. G. H. I.", 4).length, 4);
  assert.equal(sentences("A. B. C. D. E. F. G. H. I.", 4).join(" "), "A. B. C. D. E. F. G. H. I.");
  assert.deepEqual(sentences("2<sup>n</sup> − 1 coups."), ["2^n − 1 coups."]);
});

test("formulas are kept whole, words are left out", () => {
  assert.deepEqual(mathBits("Une rangée est fixée : C(14, 4) = 1001."), ["C(14, 4) = 1001"]);
  assert.deepEqual(mathBits("donc S = 100 × 101 / 2 = 5 050."), ["S = 100 × 101 / 2 = 5 050"]);
  assert.deepEqual(mathBits("The vertex has x-coordinate −b/(2a) = 3."), ["−b/(2a) = 3"]);
  assert.deepEqual(mathBits("Il n’y a aucune formule ici, seulement des mots."), []);
  assert.deepEqual(mathBits("a = b + c sans chiffre"), []);
});

test("a comic has one step per sentence in both languages", () => {
  const def = comic(["Un. Deux. Trois.", "One. Two. Three."]);
  assert.equal(def.steps().length, 3);
  assert.deepEqual(def.steps()[1], ["Deux.", "Two."]);
  assert.ok(def.dur(0) >= 3600 && def.dur(0) <= 9000);
});

test("a cartoon is offered only when the board gets an equation or an estimate", () => {
  assert.equal(hasFormulas(["Donc C(14, 4) = 1001.", "So C(14, 4) = 1001."]), true);
  assert.equal(hasFormulas("La moyenne vaut environ √365 ≈ 19 fois moins."), true);
  assert.equal(hasFormulas(["Il reste k + 1 boules.", "There are k + 1 balls left."]), false);
  assert.equal(hasFormulas(["Rien que des mots.", "Only words."]), false);
});
