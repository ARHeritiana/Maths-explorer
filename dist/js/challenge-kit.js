// Shared helpers for the challenge activities and the animated solutions.
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
