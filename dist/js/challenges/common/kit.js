// Shared helpers for the challenge activities and the animated solutions.

import { knightInner } from "./knight-piece.js";
export const NS = "http://www.w3.org/2000/svg";

export const MINUS = "−";

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export function svgEl(name, attrs = {}, parent) {
  const el = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (parent) parent.append(el);
  return el;
}

export function toLocal(svg, event) {
  const p = svg.createSVGPoint();
  p.x = event.clientX;
  p.y = event.clientY;
  return p.matrixTransform(svg.getScreenCTM().inverse());
}

// Eight colours that stay distinguishable in both themes (defined as --c1 .. --c8 in pages.css).
export const colour = (i) => `var(--c${(((i % 8) + 8) % 8) + 1})`;

// touch-action is ignored on SVG child elements, so a finger dragging a piece would scroll the page.
// Cancelling touchstart on the pieces (not on the empty board) keeps the page scrollable everywhere else.
export function lockTouch(svg, selector) {
  svg.addEventListener("touchstart", (e) => { if (e.target.closest?.(selector)) e.preventDefault(); }, { passive: false });
}

// Drawing helpers bound to an SVG element (or group) for the animated solutions; t picks the language.
export function makeCtx(svg, lang) {
  const t = (fr, en) => (lang === "fr" ? fr : en);
  const line = (x1, y1, x2, y2, attrs = {}) => svgEl("line", { x1, y1, x2, y2, ...attrs }, svg);
  const circ = (cx, cy, r, attrs = {}) => svgEl("circle", { cx, cy, r, ...attrs }, svg);
  const rect = (x, y, width, height, attrs = {}) => svgEl("rect", { x, y, width, height, ...attrs }, svg);
  const text = (x, y, s, attrs = {}) => { const el = svgEl("text", { x, y, ...attrs }, svg); el.textContent = s; return el; };
  const path = (d, attrs = {}) => svgEl("path", { d, ...attrs }, svg);
  // greedy word wrap into several <text> lines of at most `max` characters
  const wrap = (x, y, str, max, attrs = {}, dy = 17) => { const words = String(str).split(" "); let ln = "", k = 0; for (const w of words) { if ((ln + " " + w).trim().length > max) { text(x, y + k++ * dy, ln, attrs); ln = w; } else ln = (ln + " " + w).trim(); } if (ln) text(x, y + k * dy, ln, attrs); };
  // a drawn chess knight in a size x size square at (x, y)
  const knight = (x, y, size, fill = "var(--accent)") => { const g = svgEl("g", { transform: `translate(${x} ${y}) scale(${size / 64})`, fill, stroke: "var(--ink)", "stroke-width": Math.max(1.6, 90 / size), "stroke-linejoin": "round", "stroke-linecap": "round" }, svg); g.innerHTML = knightInner; return g; };
  return { svg, t, line, circ, rect, text, path, wrap, knight };
}

// Hints can act on the canvas: the hint panel dispatches "challenge-action" ({ id, act }); an activity registers its handlers
// here and calls the returned function when it stops.
export function onHintAction(id, handlers) {
  const fn = (e) => { if (e.detail?.id === id) handlers[e.detail.act]?.(); };
  document.addEventListener("challenge-action", fn);
  return () => document.removeEventListener("challenge-action", fn);
}
