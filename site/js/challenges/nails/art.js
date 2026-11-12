// Drawings of the nails challenge, shared by the activity and the solution: a wall, real nails (the head in front of the rope),
// a framed picture hanging from its two top corners, and the rope itself. Coordinates are those of a 100 x 100 scene (nails on
// the line y = 14, as the drawing gestures of activity.js expect). The geometry of the rope is in rope-path.js (pure);
// this file only draws it. Bold dark outlines and a little squash on nails and picture give the cartoon feel.
import { svgEl, colour } from "../common/kit.js";
import { FLOOR_Y, FRAME, NAIL_Y as NAIL_Y_, rope as ropeOf, nailX as nailAt } from "./rope-path.js";
export { NAIL_Y, SLACK_Y, FLOOR_Y, FRAME, nailX, radii, rope } from "./rope-path.js";

export const WALL = "color-mix(in srgb, #d8c4a0 45%, var(--surface))";
const ROPE = "#b8782f", ROPE_W = 1.1, GAP = 0.6;
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
    svgEl("path", { d: d(pts), fill: "none", stroke: (hot instanceof Set ? hot.has(piece.j) : piece.j === hot) ? "var(--accent)" : ROPE, "stroke-width": ROPE_W * scale, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
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
// a nail: the hole stays when it is pulled out (pull from 0 to 1: the nail comes out toward the viewer and vanishes);
// squash > 0 flattens it (pressed or about to pop), squash < 0 stretches it; lift moves it toward the viewer (a drag in progress)
export function drawNail(g, x, y, pull = 0, focus = false, squash = 0, lift = 0) {
  svgEl("circle", { cx: x, cy: y, r: 0.7, fill: "var(--ink)", opacity: 0.6 }, g);
  if (pull >= 1) return;
  const s = 1 + 0.9 * pull + lift, o = 1 - pull * pull, head = svgEl("g", { transform: `translate(${x} ${y - 2.5 * pull - 2 * lift}) scale(${(s * (1 + squash)).toFixed(3)} ${(s * (1 - squash)).toFixed(3)})`, opacity: o }, g);
  svgEl("ellipse", { cx: 0.6, cy: 0.9, rx: 1.9, ry: 1.3, fill: "#000", opacity: 0.22 }, head);
  svgEl("circle", { cx: 0, cy: 0, r: 2, fill: "#aeb6bf", stroke: "var(--ink)", "stroke-width": 0.7 }, head);
  svgEl("circle", { cx: -0.6, cy: -0.6, r: 0.7, fill: "#fff", opacity: 0.9 }, head);
  if (focus) svgEl("circle", { cx: 0, cy: 0, r: 3.4, fill: "none", stroke: "var(--accent)", "stroke-width": 0.5 }, head);
}
// the framed picture (wood frame, a small landscape) and its two rings; dy, rot: falling
export function drawPicture(g, { dy = 0, rot = 0, squash = 0 } = {}) {
  const { x, y, w, h } = FRAME, bottom = y + h, p = svgEl("g", { transform: `translate(0 ${dy}) rotate(${rot} ${x + w / 2} ${y}) translate(${x + w / 2} ${bottom}) scale(${1 + squash} ${1 - squash}) translate(${-(x + w / 2)} ${-bottom})` }, g);
  svgEl("rect", { x: x + 0.8, y: y + 1, width: w, height: h, fill: "#000", opacity: 0.15 }, p);
  svgEl("rect", { x, y, width: w, height: h, fill: "#8a5a2b", stroke: "var(--ink)", "stroke-width": 0.8, "stroke-linejoin": "round" }, p);
  svgEl("rect", { x: x + 2.4, y: y + 2.4, width: w - 4.8, height: h - 4.8, fill: "#f5efe2" }, p);
  const ix = x + 3.6, iy = y + 3.6, iw = w - 7.2, ih = h - 7.2;
  svgEl("rect", { x: ix, y: iy, width: iw, height: ih, fill: `color-mix(in srgb, ${colour(0)} 30%, #dbe9f7)` }, p);
  svgEl("circle", { cx: ix + iw * 0.78, cy: iy + ih * 0.3, r: 2, fill: "#f3c64b" }, p);
  svgEl("path", { d: `M${ix} ${iy + ih}L${ix + iw * 0.3} ${iy + ih * 0.45}L${ix + iw * 0.5} ${iy + ih * 0.7}L${ix + iw * 0.68} ${iy + ih * 0.5}L${ix + iw} ${iy + ih}Z`, fill: `color-mix(in srgb, ${colour(2)} 70%, #3d6b3d)` }, p);
  for (const cx of [x, x + w]) svgEl("circle", { cx, cy: y, r: 1, fill: "#e8edf2", stroke: "var(--ink)", "stroke-width": 0.6 }, p);
}
// where the picture is during a fall of progress s (gravity, then a small bounce on the floor and a tilt)
export function fallPose(s) {
  const ground = FLOOR_Y - FRAME.y - FRAME.h - 0.4;
  if (s <= 0) return { dy: 0, rot: 0, squash: 0 };
  if (s < 0.75) { const u = s / 0.75; return { dy: ground * u * u, rot: 9 * u * u, squash: -0.03 * u * u }; }   // stretches as it falls
  const u = (s - 0.75) / 0.25; return { dy: ground - 2.2 * Math.sin(Math.PI * u), rot: 9 - 3 * u, squash: 0.07 * Math.cos(Math.PI * u / 2) * (1 - u) };   // squashes on landing, then rebounds
}

// The whole scene for a pose (see timeline.js `poseAt`): wall, picture, rope, nails and their names. `lift[i]` raises a nail the
// pointer holds; `upTo` winds the rope in progressively; `hot` accents some turns.
export function drawScene(svg, { word, n, pose, upTo = Infinity, hot = -2, lift = [], held = -1, names = ["A", "B", "C", "D"], W = 100, H = 100 }) {
  const fp = fallPose(pose.fall), rot = fp.rot + (pose.sway ? 2.5 * Math.sin(pose.sway * Math.PI * 3) * (1 - pose.sway) : 0);
  drawWall(svg, W, H);
  drawPicture(svg, { dy: fp.dy, rot, squash: fp.squash });
  if (word.length) drawRope(svgEl("g", {}, svg), ropeOf(word, n, { collapse: pose.collapse, dy: fp.dy, rot, fall: pose.fall }), { upTo, hot });
  for (let i = 0; i < n; i++) drawNail(svg, nailAt(i, n), NAIL_Y_, pose.pull[i], held === i, pose.squash[i] + (held === i ? 0.18 : 0), lift[i] || 0);
  for (let i = 0; i < n; i++) {
    const out = pose.pull[i] > 0.5;
    const tx = svgEl("text", { x: nailAt(i, n), y: 6.5, "text-anchor": "middle", "font-size": 4.4, "font-weight": 700, fill: out ? "var(--muted)" : "var(--ink)" }, svg);
    tx.textContent = names[i];
  }
}
