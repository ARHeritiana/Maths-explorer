// Drawings of the ants challenge: the cartoon ant, the wooden stick and the garden, built once and posed every frame.
import { svgEl } from "../common/kit.js";

const INK = "var(--ink)";
const g = (p, attrs = {}) => svgEl("g", attrs, p);

// One ant, about 30 units long, feet at (0, 0), facing +x. Six legs (three per side, a tripod gait), antennae, a face.
export function makeAnt(parent, { fill, size = 1, ghost = false }) {
  const root = g(parent, ghost ? { opacity: 0.45 } : {}), shadow = svgEl("ellipse", { cx: 0, cy: 0.5, rx: 13, ry: 2.4, fill: INK, opacity: ghost ? 0 : 0.18 }, root);
  const fig = g(root), flip = g(fig), body = g(flip);
  const dark = `color-mix(in srgb, ${fill} 70%, #000)`, line = ghost ? "var(--muted, #888)" : INK;
  // legs: far side first (behind the body), near side last; each turns about its hip on the thorax
  const legs = [];
  const leg = (hx, far, tripod) => {
    const L = g(far ? flip : null);
    const path = svgEl("path", { d: `M${hx} -8 q${2.5} -5 ${5} -1 l${1} 9`, fill: "none", stroke: far ? dark : line, "stroke-width": far ? 1.5 : 1.9, "stroke-linecap": "round", "stroke-linejoin": "round" }, L);
    legs.push({ L, hx, tripod }); return path;
  };
  [[-5, true, 1], [-1, true, 0], [3, true, 1]].forEach(([hx, f, t]) => leg(hx, f, t));
  flip.append(body);   // body above the far legs
  svgEl("ellipse", { cx: -12, cy: -10, rx: 8.5, ry: 6.6, fill, stroke: line, "stroke-width": 1.4 }, body);   // abdomen
  svgEl("path", { d: "M-16 -15 q2 5 0 10 M-11.5 -16.4 q2 6.4 0 12.8", fill: "none", stroke: dark, "stroke-width": 1.1, opacity: 0.7 }, body);   // stripes
  svgEl("ellipse", { cx: -14.5, cy: -13, rx: 3.2, ry: 1.6, fill: "#fff", opacity: 0.35, transform: "rotate(-20 -14.5 -13)" }, body);   // shine
  svgEl("circle", { cx: -3.4, cy: -9.6, r: 1.8, fill: dark, stroke: line, "stroke-width": 0.8 }, body);   // waist
  svgEl("ellipse", { cx: 1, cy: -10.5, rx: 4.6, ry: 3.8, fill, stroke: line, "stroke-width": 1.2 }, body);   // thorax
  const head = g(body);
  const antennae = g(head);
  const ant1 = svgEl("path", { fill: "none", stroke: line, "stroke-width": 1.1, "stroke-linecap": "round" }, antennae);
  const ant2 = svgEl("path", { fill: "none", stroke: dark, "stroke-width": 1, "stroke-linecap": "round" }, antennae);
  const tips = [svgEl("circle", { r: 1.3, fill: line }, antennae), svgEl("circle", { r: 1.1, fill: dark }, antennae)];
  svgEl("circle", { cx: 9, cy: -14, r: 6, fill, stroke: line, "stroke-width": 1.4 }, head);
  svgEl("circle", { cx: 10.5, cy: -10.8, r: 1.6, fill: "#ff7b7b", opacity: ghost ? 0 : 0.45 }, head);   // cheek
  const eye = g(head);
  svgEl("ellipse", { cx: 10.8, cy: -15.4, rx: 2.4, ry: 2.8, fill: "#fff", stroke: line, "stroke-width": 0.8 }, eye);
  const pupil = svgEl("circle", { cx: 11.4, cy: -15.4, r: 1.3, fill: "#1d1d1d" }, eye);
  const mouth = svgEl("path", { stroke: line, "stroke-width": 0.9, "stroke-linecap": "round", "stroke-linejoin": "round" }, head);
  [[-3, false, 0], [1, false, 1], [5, false, 0]].forEach(([hx, f, t]) => { const p = leg(hx, f, t); flip.append(legs.at(-1).L); return p; });
  return { root, shadow, fig, flip, body, head, legs, ant1, ant2, tips, eye, pupil, mouth, size };
}

const MOUTHS = { smile: ["M10.6 -11.6 q1.5 1.4 3 0", "none"], o: ["M12 -11.9 a1.1 1.4 0 1 0 0.01 0 Z", "#7a2e2e"], grin: ["M10.2 -12 q2 3 4 0 Z", "#7a2e2e"], flat: ["M10.6 -11.2 h3", "none"] };

// Pose an ant: feet at (x, y); facing 1 right, -1 left; walk phase (from distance) and amp 0..1; squash 0..1 (a bump);
// tilt in degrees (a fall); mood smile, o, grin, flat; blink 0..1; gaze [dx, dy].
export function poseAnt(A, { x, y, facing = 1, phase = 0, amp = 0, squash = 0, tilt = 0, mood = "smile", blink = 0, gaze = [1, 0] }) {
  A.root.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${A.size})`);
  const bob = -Math.abs(Math.sin(phase)) * 1.2 * amp, sq = 1 - 0.25 * squash, wide = 1 + 0.18 * squash;
  A.fig.setAttribute("transform", `rotate(${tilt.toFixed(1)} 0 -10) translate(0 ${bob.toFixed(2)}) scale(${wide.toFixed(3)} ${sq.toFixed(3)})`);
  A.flip.setAttribute("transform", facing < 0 ? "scale(-1 1)" : "");
  A.shadow.setAttribute("opacity", tilt ? 0 : 0.18);
  // tripod gait: two groups of three legs swing in opposite phase
  for (const l of A.legs) l.L.setAttribute("transform", `rotate(${(22 * amp * Math.sin(phase + (l.tripod ? Math.PI : 0))).toFixed(1)} ${l.hx} -8)`);
  const w = Math.sin(phase * 0.5) * 1.6 * Math.max(amp, 0.3) + 2 * squash;   // antennae wobble, flick back on a bump
  A.ant1.setAttribute("d", `M11 -19 q1 -6 ${5 + w} -8`); A.ant2.setAttribute("d", `M8.5 -19.5 q-1 -6 ${2.5 + w} -9`);
  A.tips[0].setAttribute("cx", 16 + w); A.tips[0].setAttribute("cy", -27);
  A.tips[1].setAttribute("cx", 11 + w); A.tips[1].setAttribute("cy", -28.5);
  A.pupil.setAttribute("cx", (11.4 + 0.8 * Math.max(-1, Math.min(1, gaze[0] * facing))).toFixed(2));
  A.pupil.setAttribute("cy", (-15.4 + 0.9 * Math.max(-1, Math.min(1, gaze[1]))).toFixed(2));
  A.eye.setAttribute("transform", `translate(0 -15.4) scale(1 ${(1 - 0.9 * Math.min(1, blink)).toFixed(2)}) translate(0 15.4)`);
  const [d, f] = MOUTHS[mood] || MOUTHS.smile;
  A.mouth.setAttribute("d", d); A.mouth.setAttribute("fill", f);
}

// The garden: sky, sun, grass, two stones and the wooden stick from x0 to x1 with its top at y (tick every 10 cm).
export function drawGarden(svg, { W, H, x0, x1, y, L, ground }) {
  svgEl("rect", { x: 0, y: 0, width: W, height: ground, fill: "color-mix(in srgb, #9fd3ff 30%, var(--surface))" }, svg);
  const sun = g(svg); svgEl("circle", { cx: W - 60, cy: 46, r: 22, fill: "#ffd166", stroke: "#e9a400", "stroke-width": 1.5 }, sun);
  for (let k = 0; k < 10; k++) { const a = (k * Math.PI) / 5; svgEl("line", { x1: W - 60 + 28 * Math.cos(a), y1: 46 + 28 * Math.sin(a), x2: W - 60 + 36 * Math.cos(a), y2: 46 + 36 * Math.sin(a), stroke: "#e9a400", "stroke-width": 2, "stroke-linecap": "round" }, sun); }
  for (const [cx, cy, s] of [[90, 52, 1], [250, 34, 0.8]]) svgEl("path", { d: `M${cx - 30 * s} ${cy} q${4 * s} ${-16 * s} ${20 * s} ${-12 * s} q${10 * s} ${-14 * s} ${26 * s} ${-2 * s} q${16 * s} ${-2 * s} ${16 * s} ${14 * s} Z`, fill: "#fff", stroke: "color-mix(in srgb, var(--ink) 25%, transparent)", "stroke-width": 1 }, svg);
  svgEl("rect", { x: 0, y: ground, width: W, height: H - ground, fill: "color-mix(in srgb, #6fbf73 55%, var(--surface))" }, svg);
  for (let i = 0; i < W; i += 9) svgEl("path", { d: `M${i} ${ground + 2} q2 -7 ${3 + (i % 5)} -9`, fill: "none", stroke: "#3f8f46", "stroke-width": 1.2, "stroke-linecap": "round", opacity: 0.8 }, svg);
  for (const [fx, c] of [[30, "#ff7aa2"], [W - 30, "#ffd166"], [W / 2 + 40, "#b39ddb"]]) { svgEl("line", { x1: fx, y1: ground + 6, x2: fx, y2: ground - 10, stroke: "#3f8f46", "stroke-width": 1.5 }, svg); svgEl("circle", { cx: fx, cy: ground - 12, r: 4, fill: c, stroke: INK, "stroke-width": 0.8 }, svg); svgEl("circle", { cx: fx, cy: ground - 12, r: 1.5, fill: "#fff6" }, svg); }
  for (const sx of [x0 + 18, x1 - 18]) svgEl("path", { d: `M${sx - 22} ${ground + 4} q2 ${-(ground - y) + 8} 22 ${-(ground - y) + 10} q20 -2 22 ${ground - y - 10} Z`, fill: "#9e9e9e", stroke: INK, "stroke-width": 1.4 }, svg);
  svgEl("rect", { x: x0 - 6, y, width: x1 - x0 + 12, height: 14, rx: 7, fill: "#b07a43", stroke: INK, "stroke-width": 1.6 }, svg);
  svgEl("path", { d: `M${x0 + 10} ${y + 5} q${(x1 - x0) / 4} -3 ${(x1 - x0) / 2} 0 t${(x1 - x0) / 2 - 20} 0`, fill: "none", stroke: "#8a5a2b", "stroke-width": 1.1 }, svg);   // grain
  svgEl("ellipse", { cx: x0 + (x1 - x0) * 0.62, cy: y + 8, rx: 4, ry: 2, fill: "#8a5a2b" }, svg);   // knot
  for (let c = 0; c <= L; c += 10) { const X = x0 + ((x1 - x0) * c) / L; svgEl("line", { x1: X, y1: y + 10, x2: X, y2: y + 14, stroke: "#6b4420", "stroke-width": c % 50 ? 1 : 1.8 }, svg); }
  const lab = (X, s) => { const t = svgEl("text", { x: X, y: y + 30, "text-anchor": "middle", "font-size": 11, "font-weight": 700, fill: INK }, svg); t.textContent = s; };
  lab(x0, "0"); lab(x1, `${L} cm`);
}
