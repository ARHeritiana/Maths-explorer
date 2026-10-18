// Helpers of the 3D animated solutions (cake, box): stage size, caption pill, large text, camera interpolation.
import { svgEl } from "./kit.js";
import { lerp } from "./scene-kit.js";

export const el = svgEl, W = 640, H = 400;

export const pillAt = (svg, text, y = 8) => {
  const w = Math.min(W - 24, 24 + text.length * 7.4), g = el("g", {}, svg);
  el("rect", { x: (W - w) / 2, y, width: w, height: 30, rx: 15, fill: "#0a0f2c", opacity: 0.78 }, g);
  const tx = el("text", { x: W / 2, y: y + 20, "text-anchor": "middle", style: "font:700 14px var(--body);fill:#fff" }, g); tx.textContent = text;
};

export const bigText = (g, x, y, s, size = 26, fill = "#1d1b2e") => { const tx = el("text", { x, y, "text-anchor": "middle", style: `font:700 ${size}px var(--math);fill:${fill};paint-order:stroke;stroke:#fff;stroke-width:5px` }, g); tx.textContent = s; return tx; };

export const mix = (a, b, k) => ({ yaw: lerp(a.yaw, b.yaw, k), pitch: lerp(a.pitch, b.pitch, k), scale: lerp(a.scale, b.scale, k), cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k) });
