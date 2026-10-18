// 3D renderer of the box challenge, shared by its activity and its solution.
//
// Renderer for the ant-on-a-box challenge: a cardboard box in orthographic 3D that can be flattened two faces at a time,
// with routes drawn on its surface, the ant and the target. Shared by the lab and by the animated solution.
import { facesOf, hingePosition, faceNormal, faceCorners, FACE_AXIS, shareFace } from "./maths.js";
import { svgEl } from "../common/kit.js";
import { shade, makeView } from "../common/view-3d.js";

export const CARD = ["#dcb482", "#e8c898", "#caa36e"];

export const path = (pts) => `M${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("L")}Z`;

// Normalise the box into the unit cube the cake renderer's projection expects (longest side = 1).
export const boxScaler = (dims) => { const m = Math.max(...dims); return (p) => [0.5 + (p[0] - dims[0] / 2) / m, 0.5 + (p[1] - dims[1] / 2) / m, 0.5 + (p[2] - dims[2] / 2) / m]; };

// The ant: three body segments, six legs and two feelers, pointing along `ang` (radians, screen).
export function drawAnt(parent, x, y, ang, size, { glow = false } = {}) {
  const g = svgEl("g", { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${((ang * 180) / Math.PI).toFixed(1)}) scale(${(size / 10).toFixed(3)})`, "pointer-events": "none" }, parent);
  if (glow) svgEl("circle", { r: 15, fill: "#ffd54a", opacity: 0.4 }, g);
  for (const k of [-1, 0, 1]) for (const s of [-1, 1]) svgEl("path", { d: `M${k * 4.4} 0L${k * 4.4 + 3.2 * (k === 0 ? 0 : -k)} ${s * 8.2}`, stroke: "#2b1d12", "stroke-width": 1.3, "stroke-linecap": "round", fill: "none" }, g);
  svgEl("ellipse", { cx: -7.5, rx: 5.6, ry: 4.3, fill: "#3b2616" }, g);
  svgEl("ellipse", { cx: -0.5, rx: 3.6, ry: 3.2, fill: "#4a301b" }, g);
  svgEl("circle", { cx: 5.6, r: 3.4, fill: "#3b2616" }, g);
  svgEl("path", { d: "M8 -1.6Q11 -5 14 -4.4M8 1.6Q11 5 14 4.4", stroke: "#2b1d12", "stroke-width": 1.1, fill: "none", "stroke-linecap": "round" }, g);
  svgEl("circle", { cx: 6.6, cy: -1.3, r: 0.8, fill: "#fff" }, g); svgEl("circle", { cx: 6.6, cy: 1.3, r: 0.8, fill: "#fff" }, g);
  return g;
}

// Draw the box into `parent`.
// st: { net: { base, hinge, amount } | null, paths: [{ pts, colour, width, dash, glow, upTo }], markers: [{ p, kind }],
//       edgeLabels: bool, ant: { p, ang }, faceTint: { [face]: css colour } }
export function drawBox(parent, view, dims, st = {}) {
  const g = svgEl("g", {}, parent), N = boxScaler(dims), net = st.net;
  const move = (p) => (net && net.amount < 1 + 1e-9 && facesOf(dims, p).includes(net.hinge) && !facesOf(dims, p).includes(net.base) ? hingePosition(dims, net.base, net.hinge, p, net.amount) : p);
  const P = (p) => view.P(...N(move(p)));
  const normalOf = (f) => {
    if (net && f === net.hinge) { const nf = faceNormal(net.base), ng = faceNormal(f), th = (net.amount * Math.PI) / 2; return ng.map((v, i) => v * Math.cos(th) + nf[i] * Math.sin(th)); }
    return faceNormal(f);
  };
  const shown = (f) => !!net && (f === net.base || f === net.hinge) || view.facing(normalOf(f)) > 1e-4;
  const faces = [];
  for (let f = 0; f < 6; f++) {
    if (!shown(f)) continue;
    const pts = faceCorners(dims, f).map((v) => (net && f === net.hinge ? view.P(...N(hingePosition(dims, net.base, net.hinge, v, net.amount))) : view.P(...N(v))));
    const n = normalOf(f), lit = 0.8 + 0.2 * Math.max(0, -n[0] * 0.35 - n[1] * 0.55 + n[2] * 0.76);
    faces.push({ f, pts, depth: pts.reduce((s, p) => s + p[2], 0) / 4, fill: st.faceTint?.[f] ?? shade(CARD[FACE_AXIS[f]], lit) });
  }
  faces.sort((a, b) => a.depth - b.depth);
  for (const fc of faces) {
    svgEl("path", { d: path(fc.pts), fill: fc.fill, stroke: "#6b4a26", "stroke-width": 2, "stroke-linejoin": "round" }, g);
    // a strip of tape along the middle of every face, to read the box as cardboard
    const mid = (i, j) => [(fc.pts[i][0] + fc.pts[j][0]) / 2, (fc.pts[i][1] + fc.pts[j][1]) / 2];
    const A = mid(0, 3), B = mid(1, 2);
    svgEl("line", { x1: A[0], y1: A[1], x2: B[0], y2: B[1], stroke: "#fff", "stroke-opacity": 0.16, "stroke-width": Math.max(3, view.scale * 0.03), "stroke-linecap": "butt" }, g);
  }
  const faceShown = (f) => faces.some((x) => x.f === f);
  const pointShown = (p) => facesOf(dims, p).some(faceShown);
  // routes: only the parts lying on a face that is showing
  for (const r of st.paths ?? []) {
    const pts = r.pts, total = pts.slice(1).reduce((s, p, i) => s + Math.hypot(...p.map((x, k) => x - pts[i][k])), 0);
    let left = (r.upTo ?? 1) * total;
    for (let i = 0; i + 1 < pts.length && left > 1e-12; i++) {
      const a = pts[i], b = pts[i + 1], len = Math.hypot(...b.map((x, k) => x - a[k])), f = Math.min(1, left / (len || 1)), q = a.map((x, k) => x + (b[k] - x) * f);
      left -= len;
      const face = shareFace(dims, a, b);
      if (face < 0 || !faceShown(face)) continue;
      const A = P(a), B = P(q), attrs = { x1: A[0], y1: A[1], x2: B[0], y2: B[1], "stroke-linecap": "round", "pointer-events": "none" };
      if (r.glow) svgEl("line", { ...attrs, stroke: "#ffd54a", "stroke-width": (r.width ?? 4) + 8, opacity: 0.45 }, g);
      svgEl("line", { ...attrs, stroke: r.colour ?? "#d62828", "stroke-width": r.width ?? 4, ...(r.dash ? { "stroke-dasharray": r.dash } : {}) }, g);
    }
  }
  for (const m of st.markers ?? []) {
    if (!pointShown(m.p)) continue;
    const [x, y] = P(m.p);
    if (m.kind === "T") {
      svgEl("line", { x1: x, y1: y, x2: x, y2: y - 26, stroke: "#2b1d12", "stroke-width": 2, "pointer-events": "none" }, g);
      svgEl("path", { d: `M${x} ${y - 26}l16 6l-16 6z`, fill: "#e63946", stroke: "#7a1620", "stroke-width": 1.2, "pointer-events": "none" }, g);
      svgEl("circle", { cx: x, cy: y, r: 4.5, fill: "#2b1d12", "pointer-events": "none" }, g);
    } else if (m.kind === "S") svgEl("circle", { cx: x, cy: y, r: 4.5, fill: "#2b1d12", "pointer-events": "none" }, g);
    else svgEl("circle", { cx: x, cy: y, r: m.r ?? 5.5, fill: m.fill ?? "#fff", stroke: m.stroke ?? "#2b1d12", "stroke-width": 2.2, "pointer-events": "none" }, g);
    if (m.label) { const tx = svgEl("text", { x: x + 9, y: y - 8, style: "font:700 13px var(--body);fill:#2b1d12;paint-order:stroke;stroke:#fff;stroke-width:3px;pointer-events:none" }, g); tx.textContent = m.label; }
  }
  if (st.ant && pointShown(st.ant.p)) { const [x, y] = P(st.ant.p); drawAnt(g, x, y, st.ant.ang ?? 0, Math.max(11, view.scale * 0.075), { glow: st.ant.glow }); }
  if (st.edgeLabels) {
    const lab = ["a", "b", "c"];
    dims.forEach((d, i) => {
      const p = [0, 0, 0]; p[i] = d * 0.72;
      if (!pointShown(p)) return;
      const [x, y] = P(p), tx = svgEl("text", { x: x - 10, y: y + 16, "text-anchor": "middle", style: "font:700 13px var(--math);fill:#2b1d12;paint-order:stroke;stroke:#fff;stroke-width:3px;pointer-events:none" }, g);
      tx.textContent = `${lab[i]} = ${d}`;
    });
  }
  return { g, P, faceShown };
}

// Screen position of a 3D point of the (possibly flattened) box, for hit tests and the ant's heading.
export const projectBoxPoint = (view, dims, net, p) => {
  const N = boxScaler(dims), moved = net && facesOf(dims, p).includes(net.hinge) && !facesOf(dims, p).includes(net.base) ? hingePosition(dims, net.base, net.hinge, p, net.amount) : p;
  return view.P(...N(moved));
};

// Camera that looks straight at the two flattened faces of a net and fits them in a W x H stage.
export function flatCamera(dims, net, W, H) {
  const N = boxScaler(dims), yaw = 0, pitch = net.base === 2 ? 0 : 90, probe = makeView({ yaw, pitch, scale: 1, cx: 0, cy: 0 }), pts = [];
  for (const f of [net.base, net.hinge]) for (const v of faceCorners(dims, f)) {
    const moved = facesOf(dims, v).includes(net.hinge) && !facesOf(dims, v).includes(net.base) ? hingePosition(dims, net.base, net.hinge, v, 1) : v;
    pts.push(probe.P(...N(moved)));
  }
  const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]), ex = Math.max(...xs) - Math.min(...xs), ey = Math.max(...ys) - Math.min(...ys);
  const scale = Math.min((W - 110) / ex, (H - 110) / ey, 330);
  return { yaw, pitch, scale, cx: W / 2 - (scale * (Math.min(...xs) + Math.max(...xs))) / 2, cy: H / 2 + 4 - (scale * (Math.min(...ys) + Math.max(...ys))) / 2 };
}
