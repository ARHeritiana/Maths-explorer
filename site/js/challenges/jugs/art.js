// Drawings of the jugs challenge: the kitchen wall with its tap and sink, a chalkboard, and glass jugs (a can with a bail
// handle, so it pours from either side) with a face and one graduation per litre. Built once (make...), posed every
// frame (pose...): every pose is a pure function of its arguments, so the animated solution stays pure.
import { svgEl, colour } from "../common/kit.js";

const INK = "var(--ink)";
const g = (p, attrs = {}) => svgEl("g", attrs, p);
export const W = 520, H = 300, COUNTER = 236, TAP_X = 62, SINK_X = 362;
export const WATER = "color-mix(in srgb, #4aa3df 70%, var(--surface))";

// Tiled wall, the tap (pipe, handle, spout above TAP_X), the counter with the sink basin at SINK_X.
export function drawKitchen(svg) {
  svgEl("rect", { x: 0, y: 0, width: W, height: COUNTER, fill: "color-mix(in srgb, #e8f2ef 70%, var(--surface))" }, svg);
  for (let y = 0; y < COUNTER; y += 22) for (let x = (y / 22) % 2 ? -14 : 0; x < W; x += 28) svgEl("rect", { x: x + 1, y: y + 1, width: 26, height: 20, rx: 2, fill: "none", stroke: "color-mix(in srgb, #9cc5bb 55%, transparent)", "stroke-width": 1 }, svg);
  const tap = g(svg);
  svgEl("path", { d: `M0 34 H${TAP_X - 6} Q${TAP_X + 10} 34 ${TAP_X + 10} 50 V62`, fill: "none", stroke: INK, "stroke-width": 11, "stroke-linecap": "round" }, tap);
  svgEl("path", { d: `M0 34 H${TAP_X - 6} Q${TAP_X + 10} 34 ${TAP_X + 10} 50 V62`, fill: "none", stroke: "#c9a23f", "stroke-width": 8, "stroke-linecap": "round" }, tap);
  svgEl("path", { d: `M${TAP_X - 8} 30 h-2 M${TAP_X - 16} 22 h16`, stroke: INK, "stroke-width": 1.4 }, tap);
  svgEl("rect", { x: TAP_X - 18, y: 18, width: 20, height: 6, rx: 3, fill: "#c0392b", stroke: INK, "stroke-width": 1.2 }, tap);
  svgEl("rect", { x: TAP_X - 10, y: 23, width: 4, height: 9, fill: "#c9a23f", stroke: INK, "stroke-width": 1 }, tap);
  svgEl("path", { d: `M${TAP_X - 4} 44 q6 -4 12 0`, stroke: "#fff", "stroke-width": 1.6, fill: "none", opacity: 0.6 }, tap);
  svgEl("rect", { x: 0, y: COUNTER, width: W, height: H - COUNTER, fill: "#c58b52" }, svg);
  svgEl("rect", { x: 0, y: COUNTER, width: W, height: 8, fill: "#a8743a", stroke: INK, "stroke-width": 1.4 }, svg);
  for (let x = 30; x < W; x += 90) svgEl("path", { d: `M${x} ${COUNTER + 22} q30 -4 60 0`, fill: "none", stroke: "#a8743a", "stroke-width": 1.2 }, svg);
  // the sink: a steel basin cut into the counter, with a drain
  svgEl("path", { d: `M${SINK_X - 46} ${COUNTER} h92 l-8 30 h-76 Z`, fill: "#b9c2c8", stroke: INK, "stroke-width": 1.4 }, svg);
  svgEl("path", { d: `M${SINK_X - 38} ${COUNTER + 4} h76 l-5 20 h-66 Z`, fill: "#8e989f", opacity: 0.6 }, svg);
  svgEl("ellipse", { cx: SINK_X, cy: COUNTER + 20, rx: 6, ry: 2.4, fill: "#555", stroke: INK, "stroke-width": 0.8 }, svg);
}

// The chalkboard in the top right corner (x0, y0, w, h); returns the group to draw on.
export function makeBoard(parent, { x, y, w, h }) {
  const root = g(parent);
  svgEl("rect", { x: x - 6, y: y - 6, width: w + 12, height: h + 12, rx: 4, fill: "#8d5f2d", stroke: INK, "stroke-width": 1.4 }, root);
  svgEl("rect", { x, y, width: w, height: h, rx: 2, fill: "#2f4a3c", stroke: INK, "stroke-width": 1 }, root);
  svgEl("rect", { x: x + 10, y: y + h + 4, width: 18, height: 4, rx: 1.5, fill: "#fff" }, root);   // chalk on the ledge
  return { root, draw: g(root), x, y, w, h };
}

// A glass jug of `size` litres, `height` pixels tall, standing on (0, 0), with colour index i.
export function makeJug(parent, { size, height, i = 0 }) {
  const root = g(parent), body = g(root), wd = 52;
  const clip = `jug-${Math.random().toString(36).slice(2, 8)}`;
  const cp = svgEl("clipPath", { id: clip }, root);
  const outline = `M${-wd / 2} ${-height} L${-wd / 2 + 2} -6 Q${-wd / 2 + 2} 0 ${-wd / 2 + 8} 0 H${wd / 2 - 8} Q${wd / 2 - 2} 0 ${wd / 2 - 2} -6 L${wd / 2} ${-height}`;
  svgEl("path", { d: `${outline} Z` }, cp);
  svgEl("ellipse", { cx: 0, cy: 1, rx: wd / 2 + 6, ry: 4, fill: INK, opacity: 0.15 }, body);
  svgEl("path", { d: `M${-wd / 2 + 6} ${-height} Q0 ${-height - 26} ${wd / 2 - 6} ${-height}`, fill: "none", stroke: INK, "stroke-width": 4.4, "stroke-linecap": "round" }, body);   // bail handle
  svgEl("path", { d: `M${-wd / 2 + 6} ${-height} Q0 ${-height - 26} ${wd / 2 - 6} ${-height}`, fill: "none", stroke: "#9a9a9a", "stroke-width": 2.2, "stroke-linecap": "round" }, body);
  const inside = g(body, { "clip-path": `url(#${clip})` });   // clipped in the jug's frame; the water inside stays level
  const water = svgEl("rect", { x: -2 * wd, width: 4 * wd, fill: WATER }, inside);
  const surf = svgEl("path", { fill: "color-mix(in srgb, #bfe3ff 80%, var(--surface))" }, inside);
  svgEl("path", { d: outline, fill: "color-mix(in srgb, #cfe8ff 22%, transparent)", stroke: INK, "stroke-width": 1.8, "stroke-linejoin": "round" }, body);
  svgEl("path", { d: `M${-wd / 2} ${-height} H${wd / 2}`, stroke: INK, "stroke-width": 1.2 }, body);
  svgEl("path", { d: `M${-wd / 2 + 8} ${-height + 8} V-12`, stroke: "#fff", "stroke-width": 3.5, "stroke-linecap": "round", opacity: 0.5 }, body);
  for (let l = 1; l < size; l++) {   // one graduation per litre on the right side
    const y = -6 - (height - 6) * (l / size);
    svgEl("line", { x1: wd / 2 - 9, y1: y, x2: wd / 2 - 2, y2: y, stroke: INK, "stroke-width": l % 5 ? 0.9 : 1.6 }, body);
  }
  const band = svgEl("rect", { x: -wd / 2 + 4, y: -height + 3, width: 14, height: 7, rx: 2, fill: `color-mix(in srgb, ${colour(i)} 70%, var(--surface))`, stroke: INK, "stroke-width": 0.8 }, body);
  const face = g(body);
  const eyes = [-9, 5].map((ex) => { const e = g(face); svgEl("ellipse", { cx: ex, cy: 0, rx: 4, ry: 5, fill: "#fff", stroke: INK, "stroke-width": 1.1 }, e); const pu = svgEl("circle", { cx: ex, cy: 0.5, r: 2.1, fill: "#1d1d1d" }, e); return { e, pu, ex }; });
  const cheeks = [-15, 11].map((cx) => svgEl("ellipse", { cx, cy: 8, rx: 3.6, ry: 2, fill: "#ff7b7b", opacity: 0.45 }, face));
  const mouth = svgEl("path", { stroke: INK, "stroke-width": 1.4, "stroke-linecap": "round", "stroke-linejoin": "round" }, face);
  const tag = svgEl("text", { y: 22, "text-anchor": "middle", class: "sol-small", "font-weight": 700 }, root);
  return { root, body, water, surf, face, eyes, cheeks, mouth, tag, band, size, height, wd };
}

const MOUTHS = { smile: ["M-6 9 q4 4 8 0", "none"], grin: ["M-7 8 q5 8 10 0 Z", "#7a2e2e"], o: ["M-2 9 a2.6 3.2 0 1 0 0.01 0 Z", "#7a2e2e"], flat: ["M-6 10 h8", "none"], sad: ["M-6 12 q4 -4 8 0", "none"] };

// x, y: where the foot stands; litres (may be fractional while pouring); tilt: degrees (positive leans right, about the
// bottom corner on that side); lift: px; slosh: wave height; gaze: -1..1; mood; blink; label under the jug.
export function poseJug(J, { x, y = COUNTER, litres = 0, tilt = 0, lift = 0, slosh = 0, wave = 0, gaze = 0, mood = "smile", blink = 0, label = "" }) {
  const piv = tilt >= 0 ? J.wd / 2 : -J.wd / 2;
  J.root.setAttribute("transform", `translate(${x.toFixed(1)} ${(y - lift).toFixed(1)})`);
  J.body.setAttribute("transform", `rotate(${tilt.toFixed(1)} ${piv} 0)`);
  // the water stays level in the world: counter-rotate the water rectangle and its surface
  const lv = -6 - (J.height - 6) * Math.max(0, Math.min(1, litres / J.size));
  const k = litres <= 0.001 ? 0 : 1;
  J.water.setAttribute("y", (lv).toFixed(1)); J.water.setAttribute("height", (k ? -lv + 3 * J.wd : 0).toFixed(1));
  J.water.setAttribute("transform", `rotate(${(-tilt).toFixed(1)} 0 ${lv.toFixed(1)})`);
  const a = slosh * Math.sin(wave), w = 2 * J.wd;
  J.surf.setAttribute("d", k ? `M${-w} ${lv} Q${-w / 2} ${lv - a} 0 ${lv} T${w} ${lv} V${lv + 3} H${-w} Z` : "");
  J.surf.setAttribute("transform", `rotate(${(-tilt).toFixed(1)} 0 ${lv.toFixed(1)})`);
  J.face.setAttribute("transform", `translate(0 ${(-J.height * 0.62).toFixed(1)})`);
  for (const E of J.eyes) {
    E.pu.setAttribute("cx", (E.ex + 1.6 * gaze).toFixed(2));
    E.e.setAttribute("transform", `scale(1 ${(1 - 0.9 * Math.min(1, blink)).toFixed(2)})`);
  }
  const [d, f] = MOUTHS[mood] || MOUTHS.smile;
  J.mouth.setAttribute("d", d); J.mouth.setAttribute("fill", f);
  J.tag.textContent = label;
}

// Where the rim corner a jug pours from (on the side it leans to) is, in scene coordinates.
export function spoutAt(J, { x, y = COUNTER, tilt = 0, lift = 0 }) {
  const piv = tilt >= 0 ? J.wd / 2 : -J.wd / 2, a = (tilt * Math.PI) / 180;
  const sx = piv, sy = -J.height, dx = sx - piv, dy = sy;
  return [x + piv + dx * Math.cos(a) - dy * Math.sin(a), y - lift + dx * Math.sin(a) + dy * Math.cos(a)];
}
