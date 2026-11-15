// The animated explanations of the open curiosities (site/js/gallery/curiosity-explainers.js): every open curiosity has
// one, every step draws without NaN in both languages, and the claims the captions make are true of the models drawn.
import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { labs } from "../dist/js/content.js";
import { makeCtx } from "../dist/js/challenges/common/kit.js";
import { EXPLAINERS, GOODS, goodsPlan, pendulumRuns, threeBodyRuns, bakerData } from "../dist/js/gallery/curiosity-explainers.js";
import { trace } from "../dist/js/illumination-model.js";
import { PENROSE } from "../dist/js/illumination-presets.js";

const { window } = new JSDOM("<!doctype html><svg></svg>");
globalThis.document = window.document;

test("every open curiosity has an animated explanation, and every one belongs to an open curiosity", () => {
  const open = [...new Set(labs.filter((x) => x.custom && x.answer === undefined).map((x) => x.id))].sort();
  assert.deepEqual(Object.keys(EXPLAINERS).sort(), open);
});

test("every step of every explanation draws in both languages, with no NaN, and has a caption in each language", () => {
  for (const [id, def] of Object.entries(EXPLAINERS)) {
    const steps = def.steps();
    assert.ok(steps.length >= 3, id);
    for (const [fr, en] of steps) { assert.ok(fr.length > 30 && en.length > 30, id); assert.ok(!/[—–]/.test(fr + en), `${id}: dash`); }
    for (const lang of ["fr", "en"]) steps.forEach((_, s) => {
      if (def.dur) assert.ok(def.dur(s) >= 1000 && def.dur(s) <= 20000, `${id} pace ${s}`);
      for (const p of [0, 0.13, 0.5, 0.87, 1]) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        def.draw(makeCtx(svg, lang), s, p, {});
        assert.ok(svg.childNodes.length >= 2, `${id} ${s} ${p}: something is drawn`);
        assert.ok(!/NaN|undefined|Infinity/.test(svg.innerHTML), `${id} ${lang} step ${s} p ${p}`);
      }
    });
  }
});

test("indivisible goods: the one-by-one rule ends envy-free up to one good", () => {
  const { own } = goodsPlan(), v = (who, set) => set.reduce((t, g) => t + GOODS[who][g], 0);
  assert.equal(own.A.length + own.B.length, 5);
  for (const [x, y] of [["A", "B"], ["B", "A"]]) {
    if (v(x, own[y]) <= v(x, own[x])) continue;
    assert.ok(own[y].some((g) => v(x, own[y].filter((h) => h !== g)) <= v(x, own[x])), `${x} envies ${y} by more than one good`);
  }
});

test("pendulums: together at first (gap < 0.001 rad for 2 s), far apart by 8 s; three bodies: the ghost drifts away", () => {
  const { a, b, dt } = pendulumRuns(), gap = (i) => Math.hypot(a[i][0] - b[i][0], a[i][1] - b[i][1]);
  assert.ok(gap(Math.round(2 / dt)) < 1e-3);
  assert.ok(gap(Math.round(8 / dt)) > 0.5);
  const { chaos, ghost, eight } = threeBodyRuns(), last = chaos.snaps.length - 1;
  assert.ok(Math.hypot(chaos.snaps[0][0][0] - ghost.snaps[0][0][0], chaos.snaps[0][0][1] - ghost.snaps[0][0][1]) < 1e-5);
  assert.ok(Math.hypot(chaos.snaps[last][0][0] - ghost.snaps[last][0][0], chaos.snaps[last][0][1] - ghost.snaps[last][0][1]) > 0.1);
  const E = eight.E; assert.ok(Math.max(...E.map((e) => Math.abs(e - E[0]))) / Math.abs(E[0]) < 1e-3, "the figure eight keeps its energy");
  const end = eight.snaps.at(-1), start = eight.snaps[0];   // one period of the eight (about 6.33) brings the bodies back
  start.forEach((q, k) => assert.ok(Math.hypot(q[0] - end[k][0], q[1] - end[k][1]) < 0.05, `body ${k} back after one period`));
});

test("Penrose room: from the candle in the upper left recess, no ray ever goes below the middle band", () => {
  for (let i = 0; i < 720; i++) {
    const a = ((i + 0.5) / 720) * 2 * Math.PI, pts = trace(PENROSE, [-4.5, 0.6], [Math.cos(a), Math.sin(a)], 60).points;
    assert.ok(pts.every(([, y]) => y > -1.05), `ray ${i} reached the lower half`);
  }
});

test("baker: honest loaves average about 950 g; the picked loaves look near 1000 g", () => {
  const { honest, picked, mean } = bakerData();
  assert.ok(Math.abs(mean(honest) - 950) < 8, mean(honest));
  assert.ok(mean(picked) > 990 && mean(picked) < 1020, mean(picked));
});
