// Animated solution of the nails challenge, a pure function of (step, progress): small experiments on the rope. A nail is pulled
// out (it presses flat, then pops), the turns around it slip off, turns that go back round the same nail come undone, and the
// picture falls and bounces or stays caught. Plan and captions in plan.js, motion in timeline.js, drawing in art.js.
import { plan, stepTimeline } from "./plan.js";
import { poseAt, poseOf, easeInOut, clamp01 } from "./timeline.js";
import { drawScene } from "./art.js";
import { svgEl } from "../common/kit.js";

const cache = new Map();
const planOf = (v) => { if (!cache.has(v)) cache.set(v, plan(v)); return cache.get(v); };
const WIND = 0.3;   // share of a step spent winding the rope in, in the steps that start with a new rope

export const diagram = {
  size: [100, 100],
  steps: (q) => planOf(q.nails).map((s) => s.caption),
  dur: (s, q) => { const st = planOf(q.nails)[s], tl = stepTimeline(st); return (st.draw ? 1700 : 0) + (st.add.length || st.from !== st.prev ? 650 * tl.total : 900) + 300; },
  draw(c, s, p, q) {
    const st = planOf(q.nails)[s], tl = stepTimeline(st), m = st.word.length;
    const q2 = st.draw ? clamp01((p - WIND) / (1 - WIND)) : p;
    const pose = st.draw && p < WIND ? poseOf(st.word, st.n, st.from) : poseAt(tl, q2);
    drawScene(c.svg, { word: st.word, n: st.n, pose, upTo: st.draw && p < WIND ? (m + 2) * easeInOut(p / WIND) : Infinity, hot: st.hot ?? -2 });
    if (st.answer) {
      const g = svgEl("g", { transform: "translate(86 62)" }, c.svg);
      svgEl("circle", { r: 8.5, fill: "var(--surface)", stroke: "var(--ink)", "stroke-width": 0.9 }, g);
      const tx = svgEl("text", { "text-anchor": "middle", y: 3.2, "font-size": 9, "font-weight": 800, fill: "var(--accent)", transform: `scale(${1 + 0.15 * Math.sin(Math.PI * clamp01(p * 2))})` }, g);
      tx.textContent = String(st.answer);
    }
  },
};
