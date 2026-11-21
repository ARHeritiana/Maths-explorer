// Drawings of the hiker challenge: the mountain scene (sky by the hour, sun, pines, hut, trail, signposts, summit flag)
// built once; poseSky moves the sun and colours the sky for a time of day.
import { svgEl } from "../common/kit.js";
import { W, H, TRAIL, trailAt, sunAt } from "./plan.js";

const INK = "var(--ink)";
const mixHex = (a, b, k) => { const p = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `#${A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, "0")).join("")}`; };

export function drawMountain(svg) {
  const g = (attrs = {}, p = svg) => svgEl("g", attrs, p);
  const sky = svgEl("rect", { x: 0, y: 0, width: W, height: H }, svg);
  const sun = g();
  svgEl("circle", { r: 34, fill: "#ffd166", opacity: 0.25 }, sun);
  svgEl("circle", { r: 18, fill: "#ffd166", stroke: "#e9a400", "stroke-width": 1.5 }, sun);
  for (const [cx, cy, s] of [[120, 46, 1], [400, 62, 0.8]]) svgEl("path", { d: `M${cx - 30 * s} ${cy} q${4 * s} ${-16 * s} ${20 * s} ${-12 * s} q${10 * s} ${-14 * s} ${26 * s} ${-2 * s} q${16 * s} ${-2 * s} ${16 * s} ${14 * s} Z`, fill: "#fff", opacity: 0.9 }, svg);
  svgEl("path", { d: `M0 230 L90 150 L150 190 L210 140 L300 200 L380 120 L460 170 L520 140 L520 300 L0 300 Z`, fill: "color-mix(in srgb, #8fa8c8 55%, var(--surface))" }, svg);   // far range
  svgEl("path", { d: `M10 300 L300 66 L520 300 Z`, fill: "#8d8f7a", stroke: INK, "stroke-width": 1.8, "stroke-linejoin": "round" }, svg);   // the mountain
  svgEl("path", { d: `M300 66 L520 300 L360 300 Q350 220 300 66 Z`, fill: "#000", opacity: 0.14 }, svg);   // shaded face
  svgEl("path", { d: `M300 66 L268 92 L282 88 L292 100 L304 90 L318 102 L326 86 L334 92 Z`, fill: "#fff", stroke: INK, "stroke-width": 1.2, "stroke-linejoin": "round" }, svg);   // snow cap
  for (const [x, y, l] of [[120, 250, 26], [330, 160, 20], [380, 230, 30], [200, 120, 14]]) svgEl("path", { d: `M${x} ${y} l${l} ${-l / 3} M${x + 6} ${y + 6} l${l * 0.7} ${-l / 4}`, stroke: "#5f614f", "stroke-width": 1.2, fill: "none" }, svg);   // rock strokes
  svgEl("rect", { x: 0, y: 270, width: W, height: 30, fill: "color-mix(in srgb, #6fbf73 60%, var(--surface))" }, svg);
  const pine = (x, y, s) => { const t = g({ transform: `translate(${x} ${y}) scale(${s})` }); svgEl("rect", { x: -2, y: -6, width: 4, height: 8, fill: "#6b4420" }, t); for (const [w, yy] of [[13, -6], [10, -14], [7, -21]]) svgEl("path", { d: `M${-w} ${yy} L0 ${yy - 12} L${w} ${yy} Z`, fill: "#2e7d4f", stroke: INK, "stroke-width": 0.9, "stroke-linejoin": "round" }, t); };
  [[30, 282, 1.3], [440, 280, 1.4], [480, 288, 1.1], [350, 250, 0.9], [395, 262, 1], [150, 278, 0.9], [100, 232, 0.8], [36, 260, 0.9], [500, 262, 0.8]].forEach(([x, y, s]) => pine(x, y, s));
  // the hut at the foot, with smoke
  const hut = g({ transform: "translate(32 262)" });
  svgEl("rect", { x: -18, y: -20, width: 36, height: 20, fill: "#c58b52", stroke: INK, "stroke-width": 1.4 }, hut);
  svgEl("path", { d: "M-23 -18 L0 -36 L23 -18 Z", fill: "#a33b2b", stroke: INK, "stroke-width": 1.4, "stroke-linejoin": "round" }, hut);
  svgEl("rect", { x: -5, y: -12, width: 9, height: 12, fill: "#6b4420", stroke: INK, "stroke-width": 1 }, hut);
  svgEl("rect", { x: 8, y: -15, width: 7, height: 6, fill: "#ffe8a3", stroke: INK, "stroke-width": 0.9 }, hut);
  svgEl("rect", { x: 9, y: -34, width: 5, height: 9, fill: "#7a6a5a", stroke: INK, "stroke-width": 1 }, hut);
  const smoke = svgEl("path", { fill: "none", stroke: "#bbb", "stroke-width": 3, "stroke-linecap": "round", opacity: 0.8 }, hut);
  // the trail, a dashed path
  svgEl("polyline", { points: TRAIL.map((p) => p.join(",")).join(" "), fill: "none", stroke: "#e9d3a8", "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" }, svg);
  svgEl("polyline", { points: TRAIL.map((p) => p.join(",")).join(" "), fill: "none", stroke: "#8a6a3a", "stroke-width": 1.4, "stroke-dasharray": "4 4", "stroke-linecap": "round", "stroke-linejoin": "round" }, svg);
  // summit flag
  const flagPole = g({ transform: "translate(306 72)" });
  svgEl("line", { x1: 0, y1: 0, x2: 0, y2: -30, stroke: INK, "stroke-width": 2 }, flagPole);
  const flag = svgEl("path", { fill: "#e2557a", stroke: INK, "stroke-width": 1, "stroke-linejoin": "round" }, flagPole);
  return { sky, sun, smoke, flag };
}

// Sky colour, sun and the little motions (smoke, flag) for a number of minutes after 08:00 and a free-running phase.
export function poseSky(S, min, phase = 0) {
  const k = Math.min(1, Math.max(0, min / 720)), morning = "#ffd9a8", noon = "#9fd3ff", evening = "#ff9e7a";
  const c = k < 0.5 ? mixHex(morning, noon, k * 2) : mixHex(noon, evening, (k - 0.5) * 2);
  S.sky.setAttribute("fill", `color-mix(in srgb, ${c} 45%, var(--surface))`);
  const s = sunAt(min); S.sun.setAttribute("transform", `translate(${s.x.toFixed(1)} ${s.y.toFixed(1)})`);
  const w = Math.sin(phase * 2) * 3;
  S.smoke.setAttribute("d", `M11.5 -36 q${-4 + w} -8 ${1 + w} -14 q${5 - w} -6 ${0 + w} -14`);
  S.flag.setAttribute("d", `M0 -30 q8 ${-3 + w * 0.6} 16 0 q-3 4 0 9 q-8 ${3 - w * 0.6} -16 0 Z`);
}

// A signpost on the trail at fraction s: a landmark only, with no time written on it (the times on the way are unknown).
export function makePost(svg, s) {
  const p = trailAt(s), g = svgEl("g", { transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})` }, svg);
  svgEl("line", { x1: 0, y1: 0, x2: 0, y2: -16, stroke: "#6b4420", "stroke-width": 2.4, "stroke-linecap": "round" }, g);
  svgEl("rect", { x: -5, y: -19, width: 10, height: 5, rx: 1, fill: "#c58b52", stroke: INK, "stroke-width": 0.8 }, g);
  return { g };
}
