// Drawings of the nails challenge, shared by the activity and the solution: a wall, real nails (the head in front of the rope),
// a framed picture hanging from its two top corners, and the rope itself, wound turn by turn. Coordinates are those of a
// 100 x 100 scene (nails on the line y = 14, as the drawing gestures of activity.js expect). Each turn is one piece of rope,
// drawn in order with a halo of the wall's colour, so a later pass visibly crosses over an earlier one. A turn can be
// "collapsed" (0 = wound, 1 = slipped off its nail onto the slack line below the nails): the animations only move this number.
import { svgEl, colour } from "../common/kit.js";

export const NAIL_Y = 14, SLACK_Y = 24, FLOOR_Y = 95, FRAME = { x: 30, y: 46, w: 40, h: 26 };
export const nailX = (i, n) => 50 + (i - (n - 1) / 2) * (70 / Math.max(n, 2));
export const WALL = "color-mix(in srgb, #d8c4a0 45%, var(--surface))";
const ROPE = "#b8782f", ROPE_W = 1.05, GAP = 0.5;

// radius of every turn: the k-th turn around a nail goes a little wider than the previous one, so the loops never overlap
export function radii(word) { const count = {}; return word.map((c) => { const i = Math.abs(c); count[i] = (count[i] || 0) + 1; return 3.2 + 1.8 * (count[i] - 1); }); }

const lerp = (a, b, s) => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s];
// the points a turn passes through, clockwise (c > 0: up the left side, over the top, down the right side, under the nail) or
// anticlockwise (under first); collapsed by s toward the slack line under the nail
function turnPoints(c, n, r, s, flatY = SLACK_Y) {
  const x = nailX(Math.abs(c) - 1, n), y = NAIL_Y, k = Math.SQRT1_2;
  const ring = c > 0
    ? [[x - r * 1.15, y + r * 1.25], [x - r, y], [x - r * k, y - r * k], [x, y - r], [x + r * k, y - r * k], [x + r, y], [x + r * k, y + r * k], [x, y + r], [x - r * 0.55, y + r * 1.9]]
    : [[x - r * 0.95, y + r * 1.5], [x - r * 0.4, y + r * 1.05], [x + r * k, y + r * k], [x + r, y], [x + r * k, y - r * k], [x, y - r], [x - r * k, y - r * k], [x - r, y], [x - r * 1.1, y + r * 1.6]];
  const flat = [x, flatY];
  return ring.map((p) => lerp(p, flat, s));
}
// Catmull-Rom through the points, as a polyline
function spline(pts, per = 7) {
  if (pts.length < 3) return pts.slice();
  const out = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 1; k <= per; k++) {
      const t = k / per, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3)));
    }
  }
  return out;
}
// The rope as pieces: { j, pts } with j = -1 the start (left corner of the frame), then one piece per letter, then the end
// (j = word.length, to the right corner). `collapse[j]` slips turn j; `dy` moves the corners with a falling picture.
export function rope(word, n, { collapse = [], dy = 0, rot = 0, fall = 0 } = {}) {
  const R = radii(word), cx = FRAME.x + FRAME.w / 2, cy = FRAME.y + dy, f = Math.min(1, fall);
  // with the picture falling, the slack line comes down with it and lies just above the frame
  const flatY = SLACK_Y + (FRAME.y - 3 - SLACK_Y) * f + dy, sideY = SLACK_Y + 6 + (FRAME.y - 2 - SLACK_Y - 6) * f + dy;
  const corner = (side) => { const x = FRAME.x + (side ? FRAME.w : 0) - cx, a = (rot * Math.PI) / 180; return [cx + x * Math.cos(a), cy + x * Math.sin(a)]; };
  const L = corner(0), Rc = corner(1);
  const way = [{ j: -1, p: L }, { j: -1, p: [Math.min(L[0] + 2, 30), sideY] }];
  word.forEach((c, j) => turnPoints(c, n, R[j], collapse[j] || 0, flatY).forEach((p) => way.push({ j, p })));
  way.push({ j: word.length, p: [Math.max(Rc[0] - 2, 70), sideY] }, { j: word.length, p: Rc });
  const line = [], owner = [];
  const per = 6;
  const pts = way.map((w) => w.p), dense = spline(pts, per);
  dense.forEach((p, k) => { line.push(p); owner.push(k ? way[Math.floor((k - 1) / per) + 1].j : way[0].j); });   // a span belongs to the turn it ends in
  const pieces = [];
  line.forEach((p, k) => { const j = owner[k]; if (!pieces.length || pieces.at(-1).j !== j) pieces.push({ j, pts: k ? [line[k - 1], p] : [p] }); else pieces.at(-1).pts.push(p); });
  return pieces;
}
const d = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join("");

// do the segments a-b and c-e cross?
function crosses(a, b, c, e) {
  const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  return o(a, b, c) * o(a, b, e) < 0 && o(c, e, a) * o(c, e, b) < 0;
}
// the runs of a piece (as index pairs) that pass over an earlier piece; the ends shared with the previous piece are ignored
function overRuns(pts, before) {
  const hit = new Array(pts.length).fill(false);
  for (let i = 0; i + 1 < pts.length; i++) {
    for (let m = 0; m < before.length && !hit[i]; m++) {
      const q = before[m], last = m === before.length - 1, from = last ? 0 : 0, to = last ? q.length - 4 : q.length - 1;
      if (last && i < 3) continue;
      for (let k = from; k + 1 < q.length && k < to; k++) if (crosses(pts[i], pts[i + 1], q[k], q[k + 1])) { hit[i] = true; break; }
    }
  }
  const mark = hit.slice();
  hit.forEach((h, i) => { if (h) for (let k = i - 2; k <= i + 2; k++) if (k >= 0 && k < mark.length) mark[k] = true; });
  const runs = []; let start = -1;
  mark.forEach((m, i) => { if (m && start < 0) start = i; if ((!m || i === mark.length - 1) && start >= 0) { runs.push(pts.slice(start, m ? i + 1 : i + 1)); start = -1; } });
  return runs.filter((r) => r.length > 1);
}

// Draw the rope into `g`; `upTo` (a number of pieces, fractional) draws it progressively; `hot` is the letter highlighted.
// Like the strands of the "knots in 3D" exhibit: one solid, uniform strand, and wherever it goes under an earlier turn that
// turn is interrupted by a margin of the wall's colour (drawn with butt ends, then the strand itself with round ends).
export function drawRope(g, pieces, { upTo = Infinity, hot = -2, scale = 1 } = {}) {
  let shown = 0; const before = [];
  for (const piece of pieces) {
    if (shown >= upTo) break;
    const frac = Math.min(1, upTo - shown), pts = frac < 1 ? piece.pts.slice(0, Math.max(2, Math.ceil(piece.pts.length * frac))) : piece.pts; shown++;
    for (const run of overRuns(pts, before)) svgEl("path", { d: d(run), fill: "none", stroke: WALL, "stroke-width": (ROPE_W + 2 * GAP) * scale, "stroke-linecap": "butt", "stroke-linejoin": "round" }, g);
    svgEl("path", { d: d(pts), fill: "none", stroke: piece.j === hot ? "var(--accent)" : ROPE, "stroke-width": ROPE_W * scale, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    before.push(pts);
  }
}

// the wall, the skirting board and the floor
export function drawWall(g, W = 100, H = 100) {
  svgEl("rect", { x: 0, y: 0, width: W, height: H, fill: WALL }, g);
  for (let i = 0; i < 26; i++) { const x = (i * 37.3) % W, y = (i * 23.9) % (FLOOR_Y - 4); svgEl("circle", { cx: x, cy: y, r: 0.25, fill: "var(--ink)", opacity: 0.06 }, g); }
  svgEl("rect", { x: 0, y: FLOOR_Y, width: W, height: H - FLOOR_Y, fill: "color-mix(in srgb, #8a6a43 55%, var(--surface))" }, g);
  svgEl("rect", { x: 0, y: FLOOR_Y - 1.4, width: W, height: 1.4, fill: "color-mix(in srgb, #fff 60%, var(--surface))", stroke: "var(--line)", "stroke-width": 0.2 }, g);
}
// a nail: the hole stays when it is pulled out (pull from 0 to 1: the nail comes out toward the viewer and vanishes)
export function drawNail(g, x, y, pull = 0, focus = false) {
  svgEl("circle", { cx: x, cy: y, r: 0.55, fill: "var(--ink)", opacity: 0.55 }, g);
  if (pull >= 1) return;
  const s = 1 + 0.9 * pull, o = 1 - pull, head = svgEl("g", { transform: `translate(${x} ${y - 2.5 * pull}) scale(${s})`, opacity: o }, g);
  svgEl("ellipse", { cx: 0.5, cy: 0.7, rx: 1.6, ry: 1.1, fill: "#000", opacity: 0.18 }, head);
  svgEl("circle", { cx: 0, cy: 0, r: 1.8, fill: "#9aa3ad", stroke: "#4b535b", "stroke-width": 0.35 }, head);
  svgEl("circle", { cx: -0.55, cy: -0.55, r: 0.65, fill: "#e8edf2", opacity: 0.85 }, head);
  if (focus) svgEl("circle", { cx: 0, cy: 0, r: 3.2, fill: "none", stroke: "var(--accent)", "stroke-width": 0.5 }, head);
}
// the framed picture (wood frame, a small landscape) and its two rings; dy, rot: falling
export function drawPicture(g, { dy = 0, rot = 0 } = {}) {
  const { x, y, w, h } = FRAME, p = svgEl("g", { transform: `translate(0 ${dy}) rotate(${rot} ${x + w / 2} ${y})` }, g);
  svgEl("rect", { x: x + 0.8, y: y + 1, width: w, height: h, fill: "#000", opacity: 0.15 }, p);
  svgEl("rect", { x, y, width: w, height: h, fill: "#8a5a2b", stroke: "#4a2f13", "stroke-width": 0.4 }, p);
  svgEl("rect", { x: x + 2.4, y: y + 2.4, width: w - 4.8, height: h - 4.8, fill: "#f5efe2" }, p);
  const ix = x + 3.6, iy = y + 3.6, iw = w - 7.2, ih = h - 7.2;
  svgEl("rect", { x: ix, y: iy, width: iw, height: ih, fill: `color-mix(in srgb, ${colour(0)} 30%, #dbe9f7)` }, p);
  svgEl("circle", { cx: ix + iw * 0.78, cy: iy + ih * 0.3, r: 2, fill: "#f3c64b" }, p);
  svgEl("path", { d: `M${ix} ${iy + ih}L${ix + iw * 0.3} ${iy + ih * 0.45}L${ix + iw * 0.5} ${iy + ih * 0.7}L${ix + iw * 0.68} ${iy + ih * 0.5}L${ix + iw} ${iy + ih}Z`, fill: `color-mix(in srgb, ${colour(2)} 70%, #3d6b3d)` }, p);
  for (const cx of [x, x + w]) svgEl("circle", { cx, cy: y, r: 0.9, fill: "none", stroke: "#4b535b", "stroke-width": 0.45 }, p);
}
// where the picture is during a fall of progress s (gravity, then a small bounce on the floor and a tilt)
export function fallPose(s) {
  const ground = FLOOR_Y - FRAME.y - FRAME.h - 0.4;
  if (s <= 0) return { dy: 0, rot: 0 };
  if (s < 0.75) { const u = s / 0.75; return { dy: ground * u * u, rot: 9 * u * u }; }
  const u = (s - 0.75) / 0.25; return { dy: ground - 2.2 * Math.sin(Math.PI * u), rot: 9 - 3 * u };
}
