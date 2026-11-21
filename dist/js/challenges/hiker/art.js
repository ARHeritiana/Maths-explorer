// Drawings of the hiker challenge, seen from the side: the sky by the hour with the sun, faint axes and grid lines (the
// mountain is the graph of its profile), the mountain filled under the profile with the trail along its crest, the hut
// at the foot and the flag on the summit. Built once (drawLandscape); setProfile reshapes the mountain, poseSky moves
// the sun and colours the sky for a time of day.
import { svgEl } from "../common/kit.js";
import { W, H, BASE, TOP, LEFT, RIGHT, profilePoints, trailPoint, sunAt } from "./plan.js";

const INK = "var(--ink)";
const mixHex = (a, b, k) => { const p = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `#${A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, "0")).join("")}`; };

export function drawLandscape(svg) {
  const g = (attrs = {}, p = svg) => svgEl("g", attrs, p);
  const sky = svgEl("rect", { x: 0, y: 0, width: W, height: H }, svg);
  const sun = g();
  svgEl("circle", { r: 30, fill: "#ffd166", opacity: 0.25 }, sun);
  svgEl("circle", { r: 15, fill: "#ffd166", stroke: "#e9a400", "stroke-width": 1.5 }, sun);
  for (const [cx, cy, s] of [[150, 40, 0.9], [380, 54, 0.7]]) svgEl("path", { d: `M${cx - 30 * s} ${cy} q${4 * s} ${-16 * s} ${20 * s} ${-12 * s} q${10 * s} ${-14 * s} ${26 * s} ${-2 * s} q${16 * s} ${-2 * s} ${16 * s} ${14 * s} Z`, fill: "#fff", opacity: 0.85 }, svg);
  // the graph paper behind the mountain: faint grid, an altitude axis and a distance axis, without numbers
  const grid = g({ opacity: 0.35 });
  for (let i = 1; i <= 4; i++) svgEl("line", { x1: LEFT, y1: BASE - ((BASE - TOP) * i) / 4, x2: RIGHT, y2: BASE - ((BASE - TOP) * i) / 4, stroke: INK, "stroke-width": 0.6, "stroke-dasharray": "3 5" }, grid);
  for (let i = 1; i <= 8; i++) svgEl("line", { x1: LEFT + ((RIGHT - LEFT) * i) / 8, y1: TOP - 10, x2: LEFT + ((RIGHT - LEFT) * i) / 8, y2: BASE, stroke: INK, "stroke-width": 0.6, "stroke-dasharray": "3 5" }, grid);
  svgEl("path", { d: `M${LEFT - 14} ${BASE} V${TOP - 22} m-4 8 l4 -8 l4 8`, fill: "none", stroke: INK, "stroke-width": 1.4, opacity: 0.6 }, svg);
  const ground = svgEl("path", { fill: "#8d8f7a", stroke: INK, "stroke-width": 1.8, "stroke-linejoin": "round" }, svg);
  const shade = svgEl("path", { fill: "#000", opacity: 0.1 }, svg);
  svgEl("rect", { x: 0, y: BASE, width: W, height: H - BASE, fill: "color-mix(in srgb, #6fbf73 60%, var(--surface))" }, svg);
  svgEl("path", { d: `M${LEFT - 14} ${BASE} H${RIGHT + 22} m-8 -4 l8 4 l-8 4`, fill: "none", stroke: INK, "stroke-width": 1.4, opacity: 0.6 }, svg);
  const trail = svgEl("path", { fill: "none", stroke: "#e9d3a8", "stroke-width": 4, "stroke-linecap": "round", "stroke-linejoin": "round" }, svg);
  const dashes = svgEl("path", { fill: "none", stroke: "#8a6a3a", "stroke-width": 1.2, "stroke-dasharray": "4 4", "stroke-linecap": "round" }, svg);
  // the hut at the foot, with smoke
  const hut = g({ transform: `translate(${LEFT - 18} ${BASE})` });
  svgEl("rect", { x: -16, y: -18, width: 30, height: 18, fill: "#c58b52", stroke: INK, "stroke-width": 1.3 }, hut);
  svgEl("path", { d: "M-20 -16 L-1 -32 L18 -16 Z", fill: "#a33b2b", stroke: INK, "stroke-width": 1.3, "stroke-linejoin": "round" }, hut);
  svgEl("rect", { x: -4, y: -11, width: 8, height: 11, fill: "#6b4420", stroke: INK, "stroke-width": 0.9 }, hut);
  svgEl("rect", { x: 7, y: -30, width: 5, height: 8, fill: "#7a6a5a", stroke: INK, "stroke-width": 0.9 }, hut);
  const smoke = svgEl("path", { fill: "none", stroke: "#bbb", "stroke-width": 3, "stroke-linecap": "round", opacity: 0.8 }, hut);
  const pine = (x, y, s) => { const t = g({ transform: `translate(${x} ${y}) scale(${s})` }); svgEl("rect", { x: -2, y: -6, width: 4, height: 8, fill: "#6b4420" }, t); for (const [w, yy] of [[13, -6], [10, -14], [7, -21]]) svgEl("path", { d: `M${-w} ${yy} L0 ${yy - 12} L${w} ${yy} Z`, fill: "#3f8f4f", stroke: INK, "stroke-width": 0.9 }, t); };
  [[14, 290, 1.1], [500, 292, 1.1], [120, 296, 0.9], [300, 294, 0.8], [430, 297, 0.9]].forEach(([x, y, s]) => pine(x, y, s));
  // the summit flag, moved to the top of the profile by setProfile
  const flagPole = g();
  svgEl("line", { x1: 0, y1: 0, x2: 0, y2: -30, stroke: INK, "stroke-width": 2 }, flagPole);
  const flag = svgEl("path", { fill: "#e2557a", stroke: INK, "stroke-width": 1, "stroke-linejoin": "round" }, flagPole);
  return { sky, sun, smoke, flag, flagPole, ground, shade, trail, dashes };
}

// Reshape the mountain to the profile h (heights at evenly spaced knots, see plan.js).
export function setProfile(S, h) {
  const pts = profilePoints(h), line = pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  S.ground.setAttribute("d", `${line} L${RIGHT + 30} ${BASE} L${LEFT - 30} ${BASE} Z`);
  S.shade.setAttribute("d", `${pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${(p.y + (BASE - p.y) * 0.45).toFixed(1)}`).join(" ")} L${RIGHT + 30} ${BASE} L${LEFT - 30} ${BASE} Z`);
  const crest = pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${(p.y - 1.5).toFixed(1)}`).join(" ");
  S.trail.setAttribute("d", crest); S.dashes.setAttribute("d", crest);
  const top = trailPoint(h, 1);
  S.flagPole.setAttribute("transform", `translate(${(top.x + 8).toFixed(1)} ${top.y.toFixed(1)})`);
}

// Sky colour, sun and the little motions (smoke, flag) for a number of minutes after 08:00 and a free-running phase.
export function poseSky(S, min, phase = 0) {
  const k = Math.min(1, Math.max(0, min / 720)), morning = "#ffd9a8", noon = "#9fd3ff", evening = "#ff9e7a";
  const c = k < 0.5 ? mixHex(morning, noon, k * 2) : mixHex(noon, evening, (k - 0.5) * 2);
  S.sky.setAttribute("fill", `color-mix(in srgb, ${c} 45%, var(--surface))`);
  const s = sunAt(min); S.sun.setAttribute("transform", `translate(${s.x.toFixed(1)} ${(s.y - 20).toFixed(1)})`);
  const w = Math.sin(phase * 2) * 3;
  S.smoke.setAttribute("d", `M9.5 -30 q${-4 + w} -8 ${1 + w} -14 q${5 - w} -6 ${0 + w} -14`);
  S.flag.setAttribute("d", `M0 -30 q8 ${-3 + w * 0.6} 16 0 q-3 4 0 9 q-8 ${3 - w * 0.6} -16 0 Z`);
}
