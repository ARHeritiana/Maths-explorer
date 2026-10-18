// Characters and props drawn only by the horses challenge (built on common/scene-kit.js).
import { el } from "../common/scene-props.js";

/* ------------------------------------------------------------------ a racehorse */
// Drawn facing right with its hooves at y = 0. set({ x, y, dir, phase, amp, scale, label, dim, glow }): phase is the gallop
// cycle in turns, amp the stride (0 = standing), label is written on the saddle cloth.
export function makeHorse(parent, { coat = "#9a5b2e", mane = "#3b2312", cloth = "#2563eb" } = {}) {
  const root = el("g", { class: "hs" }, parent), glow = el("ellipse", { cx: 4, cy: -28, rx: 34, ry: 28, fill: "#ffe08a", opacity: 0 }, root), flip = el("g", {}, root), bob = el("g", {}, flip);
  const leg = (x) => { const g = el("g", { transform: `translate(${x} -21)` }, bob); el("rect", { x: -2.6, y: 0, width: 5.2, height: 21, rx: 2.4, fill: coat, stroke: "#0003", "stroke-width": 0.6 }, g); el("rect", { x: -3, y: 17.5, width: 6, height: 4, rx: 1.6, fill: mane }, g); return g; };
  const legs = [leg(-14), leg(-10), leg(12), leg(16)];
  el("path", { d: "M-21 -30 Q-34 -26 -31 -10 Q-27 -20 -20 -24", fill: mane }, bob);
  el("ellipse", { cx: 0, cy: -27, rx: 23, ry: 10.5, fill: coat, stroke: "#0003", "stroke-width": 0.8 }, bob);
  el("path", { d: "M12 -33 L22 -48 L32 -44 L24 -28Z", fill: coat, stroke: "#0003", "stroke-width": 0.8, "stroke-linejoin": "round" }, bob);
  el("ellipse", { cx: 32, cy: -45, rx: 10, ry: 5.2, fill: coat, stroke: "#0003", "stroke-width": 0.8, transform: "rotate(24 32 -45)" }, bob);
  el("path", { d: "M24 -50 L27 -57 L30 -49Z", fill: coat, stroke: "#0003", "stroke-width": 0.6 }, bob);
  el("path", { d: "M14 -34 Q20 -50 24 -50 Q20 -42 17 -33Z", fill: mane }, bob);
  el("circle", { cx: 30, cy: -47, r: 1.5, fill: "#111" }, bob);
  el("rect", { x: -10, y: -34, width: 18, height: 13, rx: 4, fill: cloth, stroke: "#0004", "stroke-width": 0.8 }, bob);
  const txt = el("text", { x: -1, y: -24.5, "text-anchor": "middle", style: "font:700 10px var(--body);fill:#fff" }, root);
  return {
    root,
    set({ x, y, dir = 1, phase = 0, amp = 0, scale = 1, label = "", dim = 0, glow: gl = 0, cloth: c }) {
      root.setAttribute("visibility", scale <= 0.01 ? "hidden" : "visible");
      root.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${(scale * dir).toFixed(3)} ${scale.toFixed(3)})`);
      root.setAttribute("opacity", String(1 - 0.72 * dim));
      glow.setAttribute("opacity", String(0.42 * gl));
      const s = Math.sin(phase * Math.PI * 2), s2 = Math.sin(phase * Math.PI * 2 + 1.6);
      bob.setAttribute("transform", `translate(0 ${(-Math.abs(s) * 3.5 * amp).toFixed(2)})`);
      legs[0].setAttribute("transform", `translate(-14 -21) rotate(${(-38 * amp * s2).toFixed(1)})`); legs[1].setAttribute("transform", `translate(-10 -21) rotate(${(38 * amp * s).toFixed(1)})`);
      legs[2].setAttribute("transform", `translate(12 -21) rotate(${(38 * amp * s2).toFixed(1)})`); legs[3].setAttribute("transform", `translate(16 -21) rotate(${(-38 * amp * s).toFixed(1)})`);
      if (c) bob.children[bob.children.length - 1].setAttribute("fill", c);
      txt.textContent = label; txt.setAttribute("transform", dir < 0 ? "scale(-1 1) translate(2 0)" : "");
    },
  };
}
