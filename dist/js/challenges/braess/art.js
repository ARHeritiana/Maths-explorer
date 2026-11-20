// Drawings of the braess challenge, shared by the activity and the solution: the town (houses at A, the stadium at B,
// cobbled streets that jam, wide expressways, the new road C→D behind a ribbon) and a little car seen from above with
// its driver. Built once; frames only move the cars and the ribbon.
import { svgEl, colour } from "../common/kit.js";
import { PLACES } from "./maths.js";

const INK = "var(--ink)";
const [A, B, C, D] = ["A", "B", "C", "D"].map((k) => PLACES[k]);

// A road between two points: an expressway is wide with a dashed middle line, a street narrow with cobbles.
function road(parent, a, b, kind) {
  const g = svgEl("g", {}, parent), w = kind === "fast" ? 22 : 14;
  svgEl("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: INK, "stroke-width": w + 3, "stroke-linecap": "round" }, g);
  svgEl("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: kind === "fast" ? "#6f737a" : "#b59a7a", "stroke-width": w, "stroke-linecap": "round" }, g);
  if (kind === "fast") svgEl("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: "#f4f1e8", "stroke-width": 1.6, "stroke-dasharray": "7 7" }, g);
  else svgEl("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: "#8a6f52", "stroke-width": w - 4, "stroke-dasharray": "2 4", opacity: 0.7 }, g);   // cobbles
  return g;
}
function house(parent, x, y, roofCol) {
  const g = svgEl("g", { transform: `translate(${x} ${y})` }, parent);
  svgEl("rect", { x: -9, y: -6, width: 18, height: 13, fill: "#f2e3c6", stroke: INK, "stroke-width": 1.2 }, g);
  svgEl("path", { d: "M-11 -6L0 -15L11 -6Z", fill: roofCol, stroke: INK, "stroke-width": 1.2, "stroke-linejoin": "round" }, g);
  svgEl("rect", { x: -2.5, y: 0, width: 5, height: 7, fill: "#8d5f2d", stroke: INK, "stroke-width": 0.8 }, g);
}
function tree(parent, x, y, r = 8) {
  svgEl("ellipse", { cx: x + 2, cy: y + r * 0.9, rx: r * 0.9, ry: r * 0.3, fill: INK, opacity: 0.12 }, parent);
  svgEl("rect", { x: x - 1.5, y: y, width: 3, height: r * 0.8, fill: "#7a4a24", stroke: INK, "stroke-width": 0.8 }, parent);
  svgEl("circle", { cx: x, cy: y - r * 0.2, r, fill: "#4f9a4a", stroke: INK, "stroke-width": 1.2 }, parent);
  svgEl("circle", { cx: x - r * 0.35, cy: y - r * 0.55, r: r * 0.35, fill: "#fff", opacity: 0.2 }, parent);
}

// The whole town. Returns the layers the caller fills (cars, people) and the parts that change (the new road, ribbon).
export function drawTown(svg, t) {
  svgEl("rect", { x: 0, y: 0, width: 370, height: 320, fill: "color-mix(in srgb, #7fbf6a 26%, var(--surface))" }, svg);   // grass
  for (const [x, y, r] of [[110, 40, 9], [262, 38, 8], [95, 278, 8], [270, 282, 9], [24, 60, 7], [345, 70, 7], [30, 262, 7], [348, 262, 8], [150, 160, 6], [222, 205, 6]]) tree(svg, x, y, r);
  const roads = svgEl("g", {}, svg);
  road(roads, A, C, "slow"); road(roads, C, B, "fast"); road(roads, A, D, "fast"); road(roads, D, B, "slow");
  const shortcut = road(roads, C, D, "fast");
  // the closed new road: a barrier and the mayor's ribbon at its middle
  const closed = svgEl("g", {}, svg), mid = [(C[0] + D[0]) / 2, (C[1] + D[1]) / 2];
  for (const y of [C[1] + 26, D[1] - 26]) { svgEl("rect", { x: mid[0] - 15, y: y - 3, width: 30, height: 6, fill: "#f4f1e8", stroke: INK, "stroke-width": 1.2 }, closed); svgEl("path", { d: `M${mid[0] - 12} ${y - 3}l5 6M${mid[0] - 2} ${y - 3}l5 6M${mid[0] + 8} ${y - 3}l5 6`, stroke: "#d6402f", "stroke-width": 2.4 }, closed); }
  const ribbonL = svgEl("path", { fill: "none", stroke: "#d6402f", "stroke-width": 3, "stroke-linecap": "round" }, svg), ribbonR = svgEl("path", { fill: "none", stroke: "#d6402f", "stroke-width": 3, "stroke-linecap": "round" }, svg);
  const bow = svgEl("path", { d: `M${mid[0]} ${mid[1]}l-6 -5v10zM${mid[0]} ${mid[1]}l6 -5v10z`, fill: "#d6402f", stroke: INK, "stroke-width": 0.8 }, svg);
  // places: houses at A, the stadium at B, two crossroads signs at C and D
  for (const [dx, dy, k] of [[-30, -26, 0], [-34, 4, 1], [-24, 30, 2], [-6, -40, 3]]) house(svg, A[0] + dx, A[1] + dy, colour(k));
  const st = svgEl("g", { transform: `translate(${B[0] + 26} ${B[1]})` }, svg);
  svgEl("ellipse", { cx: 0, cy: 0, rx: 22, ry: 34, fill: "#e9e4d6", stroke: INK, "stroke-width": 1.6 }, st);
  svgEl("ellipse", { cx: 0, cy: 0, rx: 13, ry: 23, fill: "#6cae5b", stroke: INK, "stroke-width": 1.2 }, st);
  svgEl("line", { x1: -13, y1: 0, x2: 13, y2: 0, stroke: "#fff", "stroke-width": 1.2 }, st);
  svgEl("circle", { cx: 0, cy: 0, r: 4, fill: "none", stroke: "#fff", "stroke-width": 1.2 }, st);
  const label = (k, [x, y], dx, dy) => { svgEl("circle", { cx: x + dx, cy: y + dy, r: 10, fill: "var(--surface)", stroke: INK, "stroke-width": 1.6 }, svg); svgEl("text", { x: x + dx, y: y + dy + 4.5, "text-anchor": "middle", "font-size": 13, "font-weight": 700, fill: INK }, svg).textContent = k; };
  label("A", A, -4, 46); label("B", B, 0, 50); label("C", C, 0, -26); label("D", D, 0, 26);
  const cars = svgEl("g", {}, svg), people = svgEl("g", {}, svg), over = svgEl("g", {}, svg);
  return { shortcut, closed, ribbonL, ribbonR, bow, cars, people, over, mid };
}

// Open the new road by an amount k (0 closed, 1 open): the ribbon parts, the barrier fades, the road brightens.
export function poseRoad(T, k) {
  const [x, y] = T.mid, gap = 28 * k, droop = 10 * k;
  T.ribbonL.setAttribute("d", `M${x - 34} ${y}Q${x - 20 - gap / 2} ${y + droop} ${x - 4 - gap} ${y + droop * 1.6}`);
  T.ribbonR.setAttribute("d", `M${x + 34} ${y}Q${x + 20 + gap / 2} ${y + droop} ${x + 4 + gap} ${y + droop * 1.6}`);
  T.bow.setAttribute("opacity", 1 - k);
  T.closed.setAttribute("opacity", 1 - k);
  T.shortcut.setAttribute("opacity", 0.35 + 0.65 * k);
}

// A car seen from above, about 16 long, pointing along +x; the driver's head shows through the roof window.
export function makeCar(parent, i) {
  const g = svgEl("g", {}, parent), body = `color-mix(in srgb, ${colour(i)} 80%, var(--surface))`;
  svgEl("ellipse", { cx: 1, cy: 1.5, rx: 9, ry: 5, fill: INK, opacity: 0.15 }, g);
  for (const [x, y] of [[-5, -5], [5, -5], [-5, 5], [5, 5]]) svgEl("rect", { x: x - 2, y: y - 1, width: 4, height: 2, rx: 0.8, fill: INK }, g);
  svgEl("rect", { x: -8, y: -4.5, width: 16, height: 9, rx: 3, fill: body, stroke: INK, "stroke-width": 1 }, g);
  svgEl("rect", { x: 1.5, y: -3.4, width: 4, height: 6.8, rx: 1.2, fill: "#bfe3f2", stroke: INK, "stroke-width": 0.6 }, g);   // windscreen
  svgEl("circle", { cx: -1.5, cy: 0, r: 2.3, fill: ["#f2c9a0", "#c68b59", "#e0ac7e", "#8d5a3b"][i % 4], stroke: INK, "stroke-width": 0.6 }, g);   // the driver
  svgEl("rect", { x: 7, y: -3.5, width: 1.4, height: 2, fill: "#ffe680" }, g); svgEl("rect", { x: 7, y: 1.5, width: 1.4, height: 2, fill: "#ffe680" }, g);   // lights
  return g;
}
export const poseCar = (g, { x, y, heading, scale = 1, opacity = 1 }) => { g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${((heading * 180) / Math.PI).toFixed(1)}) scale(${scale})`); g.setAttribute("opacity", opacity); };

// A stopwatch beside the commuter at B: a dial and the minutes in large figures.
export function makeWatch(parent, x, y) {
  const g = svgEl("g", { transform: `translate(${x} ${y})` }, parent);
  svgEl("rect", { x: -3, y: -24, width: 6, height: 5, fill: INK }, g);
  svgEl("circle", { cx: 0, cy: 0, r: 19, fill: "var(--surface)", stroke: INK, "stroke-width": 2.2 }, g);
  const hand = svgEl("line", { x1: 0, y1: 0, x2: 0, y2: -14, stroke: "#d6402f", "stroke-width": 2, "stroke-linecap": "round" }, g);
  const text = svgEl("text", { x: 0, y: 5, "text-anchor": "middle", "font-size": 13, "font-weight": 700, fill: INK }, g);
  svgEl("text", { x: 0, y: 14, "text-anchor": "middle", "font-size": 7, fill: INK }, g).textContent = "min";
  return { g, hand, text };
}
// label: the minutes only (the dial prints "min" under them)
export const poseWatch = (W, minutes, label) => { W.hand.setAttribute("transform", `rotate(${(minutes / 90) * 360})`); W.text.textContent = label; };
