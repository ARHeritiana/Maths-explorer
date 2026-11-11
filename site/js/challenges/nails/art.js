// Drawings of the nails challenge, shared by the activity and the solution: a wall, real nails (the head in front of the rope),
// a framed picture hanging from its two top corners, and the rope itself. Coordinates are those of a 100 x 100 scene (nails on
// the line y = 14, as the drawing gestures of activity.js expect).
// How the rope is laid out, so that one can read how it is attached: a turn is ONE arch over its nail (clockwise: up the left
// side, over the top, down the right side; anticlockwise: the other way), the k-th turn around a nail a little wider than the
// previous one, so arches are nested and never touch. Between two turns the rope runs horizontally below the nails, each run
// on a level of its own where runs would overlap. So the rope only ever meets itself at clean crossings (a run or a leg
// across a leg or a run), drawn like the strands of the "knots in 3D" exhibit: the later pass goes over, the earlier one is
// interrupted. A turn can be "collapsed" (0 = on its nail, 1 = slipped off, lying with the runs below): the animations only
// move this number.
import { svgEl, colour } from "../common/kit.js";

export const NAIL_Y = 14, SLACK_Y = 24, FLOOR_Y = 95, FRAME = { x: 30, y: 46, w: 40, h: 26 };
export const nailX = (i, n) => 50 + (i - (n - 1) / 2) * (70 / Math.max(n, 2));
export const WALL = "color-mix(in srgb, #d8c4a0 45%, var(--surface))";
const ROPE = "#b8782f", ROPE_W = 1.1, GAP = 0.6, R0 = 4, LANE_TOP = 22, LANE_BOTTOM = 40, CORNER = 1.4;

// radius of every turn: the k-th turn around a nail goes a little wider than the previous one. When a nail carries many
// turns the first arch tightens (down to 3) and the step shrinks, so the arches of neighbouring nails never meet; `step` tells
// how far apart they ended up (Infinity when no nail has two turns)
const CLEAR = 1.9;   // distance between two parallel passes at which the full-width rope still reads
export function radii(word, n = 4) {
  const total = {}; word.forEach((c) => { total[Math.abs(c)] = (total[Math.abs(c)] || 0) + 1; });
  const most = Math.max(1, ...Object.values(total)), room = 35 / Math.max(n, 2) - 1.1;
  const r0 = most > 1 ? Math.max(3, Math.min(R0, room - CLEAR * (most - 1))) : R0, step = most > 1 ? Math.min(2.4, (room - r0) / (most - 1)) : Infinity, count = {};
  const R = word.map((c) => { const i = Math.abs(c); count[i] = (count[i] || 0) + 1; return r0 + (most > 1 ? step : 0) * (count[i] - 1); });
  R.step = step;
  return R;
}

const lerp = (a, b, s) => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s];
// levels of the horizontal runs: run k joins turn k - 1 to turn k; it takes the first level no earlier overlapping run uses
function runLevels(spans) {
  const level = [];
  spans.forEach(([a, b], k) => {
    const lo = Math.min(a, b) - 1.2, hi = Math.max(a, b) + 1.2, used = new Set();
    for (let m = 0; m < k; m++) { const [c, e] = spans[m]; if (Math.min(c, e) - 1.2 < hi && Math.max(c, e) + 1.2 > lo) used.add(level[m]); }
    let l = 0; while (used.has(l)) l++;
    level.push(l);
  });
  return level;
}
// round the corners of a tagged polyline (points { p, j }) with radius rad, then cut it into short steps
function smooth(way, rad = CORNER, stepLen = 0.6) {
  const out = [way[0]];
  for (let i = 1; i + 1 < way.length; i++) {
    const a = way[i - 1].p, b = way[i].p, c = way[i + 1].p, la = Math.hypot(a[0] - b[0], a[1] - b[1]), lc = Math.hypot(c[0] - b[0], c[1] - b[1]);
    const turn = la && lc ? ((a[0] - b[0]) * (c[0] - b[0]) + (a[1] - b[1]) * (c[1] - b[1])) / (la * lc) : -1;
    if (turn < -0.97) { out.push(way[i]); continue; }   // nearly straight: keep the point
    const r = Math.min(rad, la / 2, lc / 2), p = lerp(b, a, r / la), q = lerp(b, c, r / lc);
    for (let k = 0; k <= 5; k++) { const t = k / 5, u = 1 - t; out.push({ j: way[i].j, p: [u * u * p[0] + 2 * u * t * b[0] + t * t * q[0], u * u * p[1] + 2 * u * t * b[1] + t * t * q[1]] }); }
  }
  out.push(way.at(-1));
  const fine = [out[0]];
  for (let i = 1; i < out.length; i++) {
    const a = out[i - 1].p, b = out[i].p, parts = Math.max(1, Math.ceil(Math.hypot(a[0] - b[0], a[1] - b[1]) / stepLen));
    for (let k = 1; k <= parts; k++) fine.push({ j: out[i].j, p: lerp(a, b, k / parts) });
  }
  return fine;
}
// The rope as pieces: { j, pts } with j = -1 the start (from the left corner of the frame), then one piece per letter (the
// run that leads to its nail, then its arch), then the end (j = word.length, to the right corner). `collapse[j]` slips turn j;
// `dy`, `rot` move the corners with a falling picture; `fall` brings every run down onto one slack line above the frame.
export function rope(word, n, { collapse = [], dy = 0, rot = 0, fall = 0 } = {}) {
  const R = radii(word, n), cx = FRAME.x + FRAME.w / 2, cy = FRAME.y + dy, f = Math.min(1, fall), m = word.length;
  const corner = (side) => { const x = FRAME.x + (side ? FRAME.w : 0) - cx, a = (rot * Math.PI) / 180; return [cx + x * Math.cos(a), cy + x * Math.sin(a)]; };
  const L = corner(0), Rc = corner(1);
  if (!m) return [{ j: -1, pts: [L, [L[0] + 4, cy - 3], [Rc[0] - 4, cy - 3], Rc] }];
  const X = word.map((c) => nailX(Math.abs(c) - 1, n)), side = word.map((c) => (c > 0 ? 1 : -1));
  const inX = word.map((_, j) => X[j] - side[j] * R[j]), outX = word.map((_, j) => X[j] + side[j] * R[j]);
  // runs 1 .. m - 1 between two turns; the two ends of the rope leave below every run
  const spans = []; for (let k = 1; k < m; k++) spans.push([outX[k - 1], inX[k]]);
  const level = runLevels(spans), top = Math.max(0, ...level), gap = Math.min(3.2, (LANE_BOTTOM - LANE_TOP) / Math.max(1, top + 1));
  const flatY = FRAME.y - 3 + dy, down = (y) => y + (flatY - y) * f;
  const runY = (k) => down(k < 1 || k >= m ? LANE_TOP + (top + 1) * gap + (spans.length ? 0.6 : 0) : LANE_TOP + level[k - 1] * gap);   // run k ends at turn k
  const way = [{ j: -1, p: L }];
  word.forEach((c, j) => {
    const s = collapse[j] || 0, yIn = runY(j), yOut = runY(j + 1), rest = [X[j], (yIn + yOut) / 2], put = (p, tag = j) => way.push({ j: tag, p: lerp(p, rest, s) });
    put([inX[j], yIn], j ? j : -1);
    put([inX[j], NAIL_Y]);
    for (let k = 1; k < 12; k++) { const a = (Math.PI * k) / 12; put([X[j] - side[j] * R[j] * Math.cos(a), NAIL_Y - R[j] * Math.sin(a)]); }
    put([outX[j], NAIL_Y]);
    put([outX[j], yOut]);
  });
  way.push({ j: m, p: Rc });
  const pieces = [];
  pieces.thin = Math.max(0.45, Math.min(1, R.step / CLEAR, gap / CLEAR));   // a crowded winding is drawn with a thinner rope
  smooth(way).forEach(({ j, p }, k, all) => { if (!pieces.length || pieces.at(-1).j !== j) pieces.push({ j, pts: k ? [all[k - 1].p, p] : [p] }); else pieces.at(-1).pts.push(p); });
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
  scale *= pieces.thin || 1;
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
