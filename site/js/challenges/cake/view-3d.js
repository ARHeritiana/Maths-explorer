// 3D renderer of the cake challenge, shared by its activity and its solution.
import { svgEl } from "../common/kit.js";
import { shade } from "../common/view-3d.js";

// Inside of the cake, bottom to top: [fraction of the height, colour]. The outside is covered with cream (top and sides).
export const LAYERS = [[0.28, "#e2a94d"], [0.06, "#b3263f"], [0.28, "#e2a94d"], [0.08, "#fff3da"], [0.30, "#e2a94d"]];

export const CREAM = "#fff6e6", PLATE = "#f1ece4", LIGHT = (() => { const v = [-0.35, -0.55, 0.76], l = Math.hypot(...v); return v.map((x) => x / l); })();

// Area-weighted centroid of a polygon of the unit square (anticlockwise or not).
export function polyCentroid(poly) {
  let a = 0, x = 0, y = 0;
  for (let i = 0; i < poly.length; i++) { const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length], c = x1 * y2 - x2 * y1; a += c; x += (x1 + x2) * c; y += (y1 + y2) * c; }
  return Math.abs(a) < 1e-12 ? poly[0] : [x / (3 * a), y / (3 * a)];
}

export const path = (pts) => `M${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("L")}Z`;

export function faceList(poly, off, view, opts) {
  const faces = [], n = poly.length, whole = poly.length === 4 && !poly.some((p) => p[0] === 0.5 && p[1] === 0.5);
  const top = poly.map((p) => view.P(p[0], p[1], 1, off));
  if (view.facing([0, 0, 1]) > 1e-4) faces.push({ pts: top, depth: top.reduce((s, p) => s + p[2], 0) / n, fill: shade(CREAM, 1), top: true });
  for (let i = 0; i < n; i++) {
    const a = poly[i], b = poly[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
    if (len < 1e-9) continue;
    const nrm = [dy / len, -dx / len, 0];
    if (view.facing(nrm) < 1e-4) continue;
    const lit = 0.9 + 0.1 * Math.max(0, nrm[0] * LIGHT[0] + nrm[1] * LIGHT[1]);
    const inner = !whole && (i === 0 || i === n - 1);   // the two edges that touch the centre are the faces of the cuts
    const bands = inner && opts.layers !== false ? LAYERS : [[1, CREAM]];
    let z = 0;
    for (const [frac, col] of bands) {
      const z1 = z + frac, q = [view.P(a[0], a[1], z, off), view.P(b[0], b[1], z, off), view.P(b[0], b[1], z1, off), view.P(a[0], a[1], z1, off)];
      faces.push({ pts: q, depth: q.reduce((s, p) => s + p[2], 0) / 4, fill: shade(col, lit), inner });
      z = z1;
    }
  }
  return faces.sort((p, q) => p.depth - q.depth);
}

// Draw the cake into `parent`. pieces: [{ poly, off, tint, cherry }]; opts: { plate, layers, labels, lift }.
export function drawCake(parent, view, pieces, opts = {}) {
  const g = svgEl("g", {}, parent);
  if (opts.plate !== false) {
    const ring = Array.from({ length: 64 }, (_, i) => { const a = (i / 64) * 2 * Math.PI; return view.P(0.5 + 0.98 * Math.cos(a), 0.5 + 0.98 * Math.sin(a), -0.03); });
    svgEl("path", { d: path(ring), fill: PLATE, stroke: "#c9c0b3", "stroke-width": 1.5 }, g);
    const inner = Array.from({ length: 64 }, (_, i) => { const a = (i / 64) * 2 * Math.PI; return view.P(0.5 + 0.82 * Math.cos(a), 0.5 + 0.82 * Math.sin(a), -0.03); });
    svgEl("path", { d: path(inner), fill: "none", stroke: "#ddd5c8", "stroke-width": 1.2 }, g);
  }
  const order = pieces.map((p, k) => {
    const c = p.poly.reduce((s, q) => [s[0] + q[0] / p.poly.length, s[1] + q[1] / p.poly.length], [0, 0]);
    return { p, k, depth: view.P(c[0], c[1], 0.5, p.off || [0, 0, 0])[2] };
  }).sort((a, b) => a.depth - b.depth);
  const labels = [];
  for (const { p, k } of order) {
    const off = p.off || [0, 0, 0], faces = faceList(p.poly, off, view, opts);
    for (const f of faces) {
      svgEl("path", { d: path(f.pts), fill: f.fill, stroke: f.inner ? "rgba(90,45,15,.55)" : "rgba(110,80,40,.45)", "stroke-width": f.inner ? 0.6 : 1, "stroke-linejoin": "round" }, g);
      if (f.top && p.tint) svgEl("path", { d: path(f.pts), fill: p.tint, opacity: 0.38, "pointer-events": "none" }, g);
    }
    const m = polyCentroid(p.poly);
    if (p.cherry && view.facing([0, 0, 1]) > 0.15) {
      const [sx, sy] = view.P(m[0], m[1], 1.035, off), r = Math.max(3, view.scale * 0.042);
      svgEl("path", { d: `M${sx} ${sy - r * 0.6}q${r * 0.5} ${-r * 1.5} ${r * 1.4} ${-r * 1.9}`, stroke: "#3f7d3a", "stroke-width": Math.max(1.4, r * 0.28), fill: "none", "stroke-linecap": "round" }, g);
      svgEl("circle", { cx: sx, cy: sy, r, fill: "#c4182f", stroke: "#6e0f1c", "stroke-width": 1.2 }, g);
      svgEl("circle", { cx: sx - r * 0.32, cy: sy - r * 0.34, r: r * 0.3, fill: "#fff", opacity: 0.7 }, g);
    }
    if (opts.labels?.[k]) { const [lx, ly] = view.P(m[0], m[1], 1.0, [off[0], off[1], off[2] + (opts.lift ?? 0.0)]); labels.push([lx, ly, opts.labels[k], k]); }
  }
  for (const [lx, ly, text, k] of labels) {
    const w = 10 + text.length * 7.6, lg = svgEl("g", {}, g);
    svgEl("rect", { x: lx - w / 2, y: ly - 25, width: w, height: 22, rx: 11, fill: "#1d1b2e", opacity: 0.86 }, lg);
    svgEl("rect", { x: lx - w / 2, y: ly - 25, width: 6, height: 22, rx: 3, fill: `var(--c${(k % 8) + 1})` }, lg);
    const tx = svgEl("text", { x: lx + 2, y: ly - 9.5, "text-anchor": "middle", style: "font:700 13px var(--body);fill:#fff;pointer-events:none" }, lg);
    tx.textContent = text;
  }
  return g;
}
