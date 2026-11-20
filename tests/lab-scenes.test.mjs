// Owner rule (20 November 2026): the lab page is free exploration. Every experiment names its scenes (starting states with a
// descriptive caption); no scene text asks, orders or grades. The missions themselves stay for slides and chapters.
import test from "node:test";
import assert from "node:assert/strict";
import { EXPERIMENTS } from "../dist/js/lab/registry.js";

const ORDER = /^(essaie|glisse|fais|observe|dessine|trouve|pr[ée]dis|regarde|clique|d[ée]place|choisis|cherche|compare|try|drag|find|predict|watch|click|draw|observe|choose|look|compare|move|set)\b/i;
const texts = (e) => [e.intro, ...e.missions.filter((m) => m.scene).flatMap((m) => [m.scene.title, m.scene.caption])];

test("every experiment lists scenes, each a titled and captioned state", () => {
  for (const e of EXPERIMENTS) {
    const scenes = e.missions.filter((m) => m.scene);
    assert.ok(scenes.length >= 1, `${e.id}: no scene`);
    assert.ok(scenes.length >= 2 || e.id === "illumination", `${e.id}: ${scenes.length} scene`);
    for (const m of scenes) {
      assert.ok(m.scene.title[0].length > 2 && m.scene.title[1].length > 2, `${e.id}/${m.id}: title`);
      assert.ok(m.scene.caption[0].length > 30 && m.scene.caption[1].length > 30, `${e.id}/${m.id}: caption`);
    }
  }
});

test("scene captions and introductions are descriptive: no question, no order, no dash", () => {
  for (const e of EXPERIMENTS) for (const pair of texts(e)) {
    assert.ok(Array.isArray(pair) && pair.length === 2, `${e.id}: pair`);
    for (const text of pair) {
      assert.ok(!/[—–]|undefined|NaN/.test(text), `${e.id}: ${text.slice(0, 50)}`);
      assert.ok(!text.includes("?"), `${e.id}: a question in ${text.slice(0, 60)}`);
      assert.ok(!ORDER.test(text.trim()), `${e.id}: an order in ${text.slice(0, 60)}`);
    }
  }
});
