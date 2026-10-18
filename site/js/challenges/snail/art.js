// Characters and props drawn only by the snail challenge (built on common/scene-kit.js).
import { el } from "../common/scene-props.js";

/* ------------------------------------------------------------------ the snail */
// Drawn crawling to the right at (x, y) = base of the foot; rotate it with rot (-90 climbs a post).
export function makeSnail(parent, { shell = "#e8710a" } = {}) {
  const root = el("g", { class: "sn" }, parent), body = el("g", {}, root);
  el("ellipse", { cx: 0, cy: -4, rx: 24, ry: 5, fill: "#cfe3a0", stroke: "#7a8c4a", "stroke-width": 1.4 }, body);
  el("path", { d: "M16 -6 q6 -2 8 -10 q1 -6 -3 -8", fill: "#cfe3a0", stroke: "#7a8c4a", "stroke-width": 1.4, "stroke-linecap": "round" }, body);
  el("path", { d: "M22 -7 q9 -2 11 -12 q1 -5 -3 -7", fill: "#cfe3a0", stroke: "#7a8c4a", "stroke-width": 1.4, "stroke-linecap": "round" }, body);
  const eyes = el("g", {}, body);
  el("circle", { cx: 21, cy: -25, r: 3, fill: "#fff", stroke: "#7a8c4a", "stroke-width": 1 }, eyes);
  el("circle", { cx: 29, cy: -27, r: 3, fill: "#fff", stroke: "#7a8c4a", "stroke-width": 1 }, eyes);
  const pupils = el("g", {}, eyes);
  el("circle", { cx: 22, cy: -25, r: 1.3, fill: "#222" }, pupils); el("circle", { cx: 30, cy: -27, r: 1.3, fill: "#222" }, pupils);
  el("circle", { cx: -2, cy: -17, r: 14, fill: shell, stroke: "#7a3a05", "stroke-width": 1.6 }, body);
  el("path", { d: "M-2 -17 m-3 0 a3 3 0 1 1 3 3 a7 7 0 1 1 -7 -7 a11 11 0 1 1 11 11", fill: "none", stroke: "#7a3a05", "stroke-width": 1.4, "stroke-linecap": "round" }, body);
  return {
    root,
    set({ x, y, rot = 0, dir = 1, stretch = 1, mood = "ok", size = 1 }) {
      root.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rot.toFixed(2)}) scale(${dir * size}, ${size})`);
      body.setAttribute("transform", `scale(${stretch.toFixed(3)} ${(2 - stretch).toFixed(3)})`);
      pupils.setAttribute("transform", `translate(${mood === "scared" ? -1.2 : 0.6} ${mood === "scared" ? 1 : 0})`);
    },
  };
}
