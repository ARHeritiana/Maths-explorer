// Shared speech bubble for the challenges: makeBubble once, then poseBubble every frame (pops in with an overshoot).
import { svgEl } from "./kit.js";
const INK = "var(--ink)";

// A speech bubble with a tail, anchored by its tail tip.
export function makeBubble(parent) {
  const root = svgEl("g", { "pointer-events": "none" }, parent);
  const box = svgEl("path", { fill: "var(--surface)", stroke: INK, "stroke-width": 1.3, "stroke-linejoin": "round" }, root);
  const text = svgEl("text", { "text-anchor": "middle", "font-size": 11, "font-weight": 700, fill: INK }, root);
  return { root, box, text };
}

// Pose a bubble: tail tip at (x, y), text, appear 0..1 (pops in with a small overshoot).
export function poseBubble(B, { x, y, text, appear = 1 }) {
  const k = Math.max(0, Math.min(1, appear)), pop = k <= 0 ? 0 : 1 + 0.15 * Math.sin(Math.PI * k) * (1 - k);
  B.root.setAttribute("opacity", k.toFixed(2));
  B.root.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${pop.toFixed(3)})`);
  const w = Math.max(40, text.length * 6.4 + 14), h = 20, top = -7 - h, L = -w / 2, R = w / 2, B0 = top + h;   // tail tip at (0, 0)
  B.box.setAttribute("d", `M${L + 8} ${top} H${R - 8} Q${R} ${top} ${R} ${top + 8} V${B0 - 8} Q${R} ${B0} ${R - 8} ${B0} H6 L0 0 L-2 ${B0} H${L + 8} Q${L} ${B0} ${L} ${B0 - 8} V${top + 8} Q${L} ${top} ${L + 8} ${top} Z`);
  B.text.setAttribute("x", 0); B.text.setAttribute("y", top + 14); B.text.textContent = text;
}
