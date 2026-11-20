// Owner rule (20 November 2026): every gallery curiosity reads as an encyclopedia article (lead, facts, sections, history,
// sources), never as homework: no order to the visitor, both languages, no dashes, open ones keep their
// animated explanation. See site/js/gallery/article.js.
import test from "node:test";
import assert from "node:assert/strict";
import { labs } from "../dist/js/content.js";
import { ARTICLES } from "../dist/js/gallery/articles/index.js";
import { EXPLAINERS } from "../dist/js/gallery/curiosity-explainers.js";

const ids = [...new Set(labs.filter((x) => x.custom).map((x) => x.id))];
const pairs = (a) => [...a.lead, ...a.facts.flat(), ...a.sections.flatMap((s) => [s.h, ...(s.p || [])])];
const ORDER = /\b(essaie|glisse|fais|observe|dessine|trouve|prédis|regarde|clique|déplace|try|drag|find|predict|watch|click|draw|observe)\b/i;

test("every curiosity has an article", () => {
  assert.deepEqual(ids.filter((id) => !ARTICLES[id]), []);
  assert.deepEqual(Object.keys(ARTICLES).filter((id) => !ids.includes(id)), []);
});

test("articles are complete, bilingual and free of dashes and orders to the visitor (a historical problem may be stated as a question)", () => {
  for (const id of ids) {
    const a = ARTICLES[id];
    assert.ok(a.lead.length >= 1 && a.facts.length >= 3 && a.sections.length >= 4, `${id}: shape`);
    for (const pair of pairs(a)) {
      assert.ok(Array.isArray(pair) && pair.length === 2 && pair.every((x) => typeof x === "string" && x.length > 1), `${id}: pair ${JSON.stringify(pair)}`);
      for (const text of pair) {
        assert.ok(!/[—–]|undefined|NaN/.test(text), `${id}: dash or placeholder in ${text.slice(0, 60)}`);
        assert.ok(!ORDER.test(text.split(/[.;]/)[0].slice(0, 12)), `${id}: an order in ${text.slice(0, 60)}`);
      }
    }
    const words = (i) => a.sections.flatMap((s) => s.p || []).concat(a.lead).map((x) => x[i]).join(" ").split(/\s+/).length;
    assert.ok(words(0) > 250 && words(1) > 250, `${id}: too short (${words(0)} / ${words(1)} words)`);
  }
});

test("open curiosities keep their animated explanation inside the article, and only they", () => {
  for (const id of ids) {
    const has = ARTICLES[id].sections.some((s) => s.explainer);
    assert.equal(has, id in EXPLAINERS, `${id}: explainer section`);
  }
});
