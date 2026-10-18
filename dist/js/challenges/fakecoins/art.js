// Characters and props drawn only by the fakecoins challenge (built on common/scene-kit.js).
import { el } from "../common/scene-props.js";

/* ------------------------------------------------------------------ a coin */
export const coinSvg = (parent, { x, y, r = 7, fake = false, label = "" }) => {
  const g = el("g", { transform: `translate(${x} ${y})` }, parent);
  el("circle", { r, fill: fake ? "#d98a4a" : "#f3c84a", stroke: fake ? "#7a3f10" : "#8a6a10", "stroke-width": 1.3 }, g);
  el("circle", { r: r * 0.62, fill: "none", stroke: fake ? "#7a3f10" : "#8a6a10", "stroke-width": 0.9, opacity: 0.7 }, g);
  if (label !== "") { const t = el("text", { y: r * 0.36, "text-anchor": "middle", style: `font:700 ${Math.max(7, r * 0.95)}px var(--body);fill:#3a2a05` }, g); t.textContent = label; }
  return g;
};
