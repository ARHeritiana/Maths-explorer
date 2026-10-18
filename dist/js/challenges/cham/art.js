// Characters and props drawn only by the cham challenge (built on common/scene-kit.js).
import { el } from "../common/scene-props.js";

/* ------------------------------------------------------------------ a chameleon */
// Facing right, feet at y = 0. set({ x, y, dir, scale, from, to, t, hop, eye }): the skin is `from` mixed `t` towards `to`.
export function makeChameleon(parent) {
  const root = el("g", { class: "cm" }, parent), skin = [];
  const part = (name, attrs) => { const e = el(name, { stroke: "#0003", "stroke-width": 1, ...attrs }, root); skin.push(e); return e; };
  part("path", { d: "M-12 -9 C-26 -9 -30 -20 -22 -24 C-16 -26 -14 -19 -19 -18", fill: "none", "stroke-width": 4.5, "stroke-linecap": "round", stroke: "#fff0" }).setAttribute("stroke", "currentColor");
  el("path", { d: "M-6 0 L-8 -6 M6 0 L8 -6", stroke: "#2a2a2a", "stroke-width": 2.4, "stroke-linecap": "round" }, root);
  part("ellipse", { cx: 0, cy: -10, rx: 15, ry: 8.5 });
  part("path", { d: "M-8 -17 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4", "stroke-width": 1.4 });
  part("ellipse", { cx: 14, cy: -13, rx: 7.5, ry: 6 });
  el("circle", { cx: 16, cy: -15, r: 3.4, fill: "#fff", stroke: "#222", "stroke-width": 1 }, root); const pupil = el("circle", { cx: 17, cy: -15, r: 1.5, fill: "#111" }, root);
  el("path", { d: "M-8 -3 l-2 5 M7 -3 l2 5", stroke: "#2a2a2a", "stroke-width": 2.4, "stroke-linecap": "round" }, root);
  return {
    root,
    set({ x, y, dir = 1, scale = 1, from = "#c2185b", to = from, t = 0, hop = 0, glance = 0 }) {
      root.setAttribute("transform", `translate(${x.toFixed(2)} ${(y - hop).toFixed(2)}) scale(${(dir * scale).toFixed(3)} ${scale.toFixed(3)})`);
      root.setAttribute("visibility", scale <= 0.01 ? "hidden" : "visible");
      const fill = t <= 0 ? from : t >= 1 ? to : `color-mix(in srgb, ${to} ${(t * 100).toFixed(0)}%, ${from})`;
      skin.forEach((e) => { if (e.tagName === "path" && e.getAttribute("stroke") === "currentColor") e.style.stroke = fill; else e.setAttribute("fill", fill); });
      pupil.setAttribute("cx", String(17 + glance));
    },
  };
}
