// Characters and props drawn only by the pigeonhole challenge (built on common/scene-kit.js).
import { el } from "../common/scene-props.js";

/* ------------------------------------------------------------------ a pigeon */
// Facing right, feet at y = 0. set({ x, y, dir, flap, scale, label, tilt }): flap is the wing cycle in turns.
export function makePigeon(parent, { body = "#8aa0b8", wing = "#6a809a" } = {}) {
  const root = el("g", { class: "pg" }, parent), inner = el("g", {}, root);
  el("path", { d: "M-8 -14 L-20 -18 L-18 -10Z", fill: wing, stroke: "#0003", "stroke-width": 0.8 }, inner);
  el("path", { d: "M-1 -2 v-5 M3 -2 v-5", stroke: "#d9824a", "stroke-width": 1.6, "stroke-linecap": "round" }, inner);
  el("ellipse", { cx: 0, cy: -14, rx: 12, ry: 8.5, fill: body, stroke: "#0003", "stroke-width": 0.9 }, inner);
  el("circle", { cx: 11, cy: -22, r: 5.4, fill: body, stroke: "#0003", "stroke-width": 0.9 }, inner);
  el("path", { d: "M15.5 -22.5 L21 -21 L15.5 -19.5Z", fill: "#f0a050", stroke: "#8a5a20", "stroke-width": 0.7 }, inner);
  el("circle", { cx: 12.5, cy: -23.5, r: 1.2, fill: "#111" }, inner);
  el("path", { d: "M5 -20 Q9 -17 12 -17", fill: "none", stroke: "#b9d0a8", "stroke-width": 2.2, "stroke-linecap": "round", opacity: 0.9 }, inner);
  const wingG = el("g", { transform: "translate(-2 -17)" }, inner); el("path", { d: "M0 0 Q-12 -14 -22 -6 Q-12 -4 0 4Z", fill: wing, stroke: "#0003", "stroke-width": 0.9 }, wingG);
  const txt = el("text", { x: 2, y: -11.5, "text-anchor": "middle", style: "font:700 8px var(--body);fill:#fff;paint-order:stroke;stroke:#34506e;stroke-width:1.6px" }, root);
  return {
    root,
    set({ x, y, dir = 1, flap = 0, scale = 1, label = "", tilt = 0 }) {
      root.setAttribute("visibility", scale <= 0.01 ? "hidden" : "visible");
      root.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(tilt * dir).toFixed(1)}) scale(${(dir * scale).toFixed(3)} ${scale.toFixed(3)})`);
      wingG.setAttribute("transform", `translate(-2 -17) rotate(${(Math.sin(flap * Math.PI * 2) * 42 - 8).toFixed(1)})`);
      txt.textContent = label;
    },
  };
}
