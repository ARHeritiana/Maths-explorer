// Small helpers shared by several challenges: bilingual pairs, easing, SVG text styles, parameter builders.
import { svgEl } from "./kit.js";
import { clamp01 } from "./scene-kit.js";

export const P = (fr, en) => [fr, en];

export const int = (id, fr, en, min, max, value, step = 1) => ({ kind: "int", id, label: P(fr, en), min, max, value, step });

export const choice = (id, fr, en, options, value) => ({ kind: "choice", id, label: P(fr, en), options, value });

export const f1 = (x) => String(Math.round(x * 10) / 10);

export const el = svgEl;

export const pillAt = (parent, x, y, w, h) => { const g = el("g", {}, parent); el("rect", { x, y, width: w, height: h, rx: h / 2, fill: "#0a0f2c", opacity: 0.74 }, g); return g; };

export const white = (size) => `font:700 ${size}px var(--body);fill:#fff`;

export const ez = (x) => 1 - (1 - clamp01(x)) ** 3;

export const ink = { "text-anchor": "middle" };

export const mid = { "text-anchor": "middle" };
