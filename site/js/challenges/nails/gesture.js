// Pure model of the loop drawn on the nail scene (no DOM; tests/nails-gesture.test.mjs). A stroke is read as turns by counting its
// crossings of the rays going up from each nail; every stroke is joined to the base point below the nails, so strokes compose.
// The base point is only part of the reading, never of what is shown: the preview of a stroke starts where the pointer went down
// and is empty until the pointer moves, so a click alone draws nothing and moves nothing.
import { FRAME, NAIL_Y } from "./rope-path.js";
export const BASE = { x: 50, y: 40 };
export const CORNERS = [{ x: FRAME.x, y: FRAME.y }, { x: FRAME.x + FRAME.w, y: FRAME.y }];
const nx = (i, n) => 50 + (i - (n - 1) / 2) * (70 / Math.max(n, 2));

// a pointer going down near a corner of the frame starts the rope exactly at that corner
export const snapStart = (p) => CORNERS.find((c) => Math.hypot(c.x - p.x, c.y - p.y) < 4) || p;
// a stroke that starts with the pointer going down at p: only the start is recorded, no segment, no motion
export function startStroke(p) { const from = snapStart(p); return { points: [BASE, from], from, turns: [], invalid: false, moved: false }; }

// add the segment from the previous point to p: crossings become turns, a segment through a nail invalidates the stroke
export function extendStroke(g, p, n) {
  const prev = g.points.at(-1), hits = [];
  for (let i = 0; i < n; i++) {
    const x = nx(i, n), dx = p.x - prev.x, dy = p.y - prev.y;
    const u = Math.max(0, Math.min(1, ((x - prev.x) * dx + (NAIL_Y - prev.y) * dy) / (dx * dx + dy * dy || 1)));
    if (Math.hypot(prev.x + u * dx - x, prev.y + u * dy - NAIL_Y) < 1.7) g.invalid = true;
    if ((prev.x <= x && p.x > x) || (p.x <= x && prev.x > x)) {
      const k = (x - prev.x) / (p.x - prev.x), y = prev.y + k * (p.y - prev.y);
      if (y < NAIL_Y) hits.push({ k, c: (p.x > prev.x ? 1 : -1) * (i + 1) });
    }
  }
  hits.sort((a, b) => a.k - b.k).forEach((h) => g.turns.push(h.c));
  g.points.push(p);
  if (Math.hypot(p.x - g.from.x, p.y - g.from.y) > 1.5) g.moved = true;
  return g;
}
// the points to display: from where the pointer went down, nothing at all until it has moved
export function previewPoints(g) { return g && g.moved ? g.points.slice(1) : []; }
// close the stroke through the base point and read it
export function finishStroke(g, n) { const moved = g.moved; extendStroke(g, BASE, n); return { turns: g.turns, invalid: g.invalid, moved }; }
