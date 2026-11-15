// Drawings of the coffee challenge: the kitchen, two glass mugs with faces (the liquid's colour and level show the mix),
// the steam and a spoon with a face. Built once (make...), posed every frame (pose...).
import { svgEl } from "../common/kit.js";

const INK = "var(--ink)", COFFEE = [91, 51, 23], MILK = [243, 237, 226];
const g = (p, attrs = {}) => svgEl("g", attrs, p);
// colour of a mix with a fraction f of coffee
export const mixColour = (f) => `rgb(${COFFEE.map((c, i) => Math.round(c * f + MILK[i] * (1 - f))).join(",")})`;
export const W = 520, H = 300, TABLE = 246, CUP_X = [150, 370];

export function drawKitchen(svg) {
  svgEl("rect", { x: 0, y: 0, width: W, height: TABLE, fill: "color-mix(in srgb, #f7e6c4 50%, var(--surface))" }, svg);
  for (let x = 0; x < W; x += 26) for (let y = 0; y < TABLE; y += 26) svgEl("rect", { x: x + 1, y: y + 1, width: 24, height: 24, rx: 2, fill: "none", stroke: "color-mix(in srgb, #d9b98a 60%, transparent)", "stroke-width": 1 }, svg);
  const win = g(svg, { transform: "translate(392 24)" });   // window with a plant
  svgEl("rect", { x: 0, y: 0, width: 96, height: 70, rx: 4, fill: "color-mix(in srgb, #9fd3ff 55%, var(--surface))", stroke: INK, "stroke-width": 1.6 }, win);
  svgEl("path", { d: "M48 0 V70 M0 35 H96", stroke: INK, "stroke-width": 1.4 }, win);
  svgEl("path", { d: "M8 70 q20 -14 40 -4 q20 -12 40 4", fill: "#6fbf73", opacity: 0.7 }, win);
  const shelf = g(svg, { transform: "translate(30 58)" });   // shelf with jars
  svgEl("rect", { x: 0, y: 26, width: 150, height: 6, rx: 2, fill: "#b07a43", stroke: INK, "stroke-width": 1.2 }, shelf);
  [[14, "#e9a400"], [62, "#c0392b"], [110, "#5b3317"]].forEach(([x, c]) => {
    svgEl("rect", { x: x - 14, y: -6, width: 28, height: 32, rx: 5, fill: "color-mix(in srgb, #fff 70%, transparent)", stroke: INK, "stroke-width": 1.2 }, shelf);
    svgEl("rect", { x: x - 14, y: 8, width: 28, height: 18, rx: 4, fill: c, opacity: 0.75 }, shelf);
    svgEl("rect", { x: x - 16, y: -10, width: 32, height: 6, rx: 2, fill: "#8d5f2d", stroke: INK, "stroke-width": 1 }, shelf);
  });
  svgEl("rect", { x: 0, y: TABLE, width: W, height: H - TABLE, fill: "#c58b52" }, svg);   // counter
  svgEl("rect", { x: 0, y: TABLE, width: W, height: 8, fill: "#a8743a", stroke: INK, "stroke-width": 1.4 }, svg);
  for (let x = 30; x < W; x += 90) svgEl("path", { d: `M${x} ${TABLE + 16} q30 -4 60 0`, fill: "none", stroke: "#a8743a", "stroke-width": 1.2 }, svg);
}

// A glass mug standing at (x, TABLE): handle on the right (side 1) or left (-1).
export function makeCup(parent, { x, side = 1 }) {
  const root = g(parent, { transform: `translate(${x} ${TABLE})` }), body = g(root);
  svgEl("ellipse", { cx: 0, cy: 2, rx: 72, ry: 8, fill: "#fff", stroke: INK, "stroke-width": 1.3 }, body);   // saucer
  svgEl("ellipse", { cx: 0, cy: 6, rx: 60, ry: 5, fill: INK, opacity: 0.12 }, body);
  svgEl("path", { d: side > 0 ? "M52 -96 q36 4 30 34 q-6 28 -30 26" : "M-52 -96 q-36 4 -30 34 q6 28 30 26", fill: "none", stroke: INK, "stroke-width": 9, "stroke-linecap": "round" }, body);
  svgEl("path", { d: side > 0 ? "M52 -96 q36 4 30 34 q-6 28 -30 26" : "M-52 -96 q-36 4 -30 34 q6 28 30 26", fill: "none", stroke: "#dfeffb", "stroke-width": 6, "stroke-linecap": "round" }, body);
  const clip = `cup-${Math.random().toString(36).slice(2, 8)}`;
  const cp = svgEl("clipPath", { id: clip }, root); svgEl("path", { d: "M-52 -122 L-50 -10 Q-50 0 -40 0 L40 0 Q50 0 50 -10 L52 -122 Z" }, cp);
  const liquid = svgEl("rect", { x: -60, width: 120, "clip-path": `url(#${clip})` }, body);
  const surface = svgEl("ellipse", { cx: 0, rx: 50, ry: 6, "clip-path": `url(#${clip})` }, body);
  const swirl = svgEl("path", { fill: "none", "stroke-width": 2, "stroke-linecap": "round", opacity: 0, "clip-path": `url(#${clip})` }, body);
  svgEl("path", { d: "M-52 -122 L-50 -10 Q-50 0 -40 0 L40 0 Q50 0 50 -10 L52 -122", fill: "color-mix(in srgb, #cfe8ff 25%, transparent)", stroke: INK, "stroke-width": 2 }, body);   // glass
  svgEl("ellipse", { cx: 0, cy: -122, rx: 52, ry: 7, fill: "none", stroke: INK, "stroke-width": 1.8 }, body);   // rim
  svgEl("path", { d: "M-40 -110 L-39 -20", stroke: "#fff", "stroke-width": 5, "stroke-linecap": "round", opacity: 0.55 }, body);   // shine
  const face = g(body);
  const eyes = [-16, 16].map((ex) => { const e = g(face); svgEl("ellipse", { cx: ex, cy: -64, rx: 6, ry: 7.5, fill: "#fff", stroke: INK, "stroke-width": 1.4 }, e); const pu = svgEl("circle", { cx: ex, cy: -63, r: 3.2, fill: "#1d1d1d" }, e); svgEl("circle", { cx: ex + 1.4, cy: -65, r: 1, fill: "#fff" }, e); return { e, pu, ex }; });
  [-28, 28].forEach((cx) => svgEl("ellipse", { cx, cy: -52, rx: 6, ry: 3.4, fill: "#ff7b7b", opacity: 0.45 }, face));
  const mouth = svgEl("path", { stroke: INK, "stroke-width": 1.8, "stroke-linecap": "round", "stroke-linejoin": "round" }, face);
  const steam = g(root);
  const curls = [-18, 0, 18].map(() => svgEl("path", { fill: "none", stroke: "#bbb", "stroke-width": 3, "stroke-linecap": "round" }, steam));
  return { root, body, liquid, surface, swirl, eyes, mouth, steam, curls };
}

const MOUTHS = { smile: ["M-10 -46 q10 9 20 0", "none"], grin: ["M-12 -47 q12 14 24 0 Z", "#7a2e2e"], o: ["M0 -48 a5 6 0 1 0 0.01 0 Z", "#7a2e2e"], flat: ["M-8 -45 h16", "none"] };

// level: liquid volume in units of V (1 = full start); f: coffee fraction; swirl 0..1 after a pour; phase for steam;
// hot: 0..1 strength of the steam; wobble: a small jolt; gaze [dx, dy]; mood; blink 0..1.
export function poseCup(C, { level = 1, f = 0, swirl = 0, phase = 0, hot = 0, wobble = 0, gaze = [0, 0], mood = "smile", blink = 0 }) {
  const top = -10 - 72 * level, col = mixColour(f);
  C.liquid.setAttribute("y", top); C.liquid.setAttribute("height", -top + 2); C.liquid.setAttribute("fill", col);
  C.surface.setAttribute("cy", top); C.surface.setAttribute("fill", mixColour(Math.min(1, f * 0.85 + 0.05)));
  C.swirl.setAttribute("opacity", swirl > 0 ? (1 - swirl) * 0.9 : 0);
  if (swirl > 0) { const a = swirl * 12; C.swirl.setAttribute("d", `M${-30 * Math.cos(a)} ${top + 2} q${20} ${-6 * Math.sin(a)} ${30 * Math.cos(a)} 0`); C.swirl.setAttribute("stroke", mixColour(f > 0.5 ? f - 0.4 : f + 0.4)); }
  C.body.setAttribute("transform", `rotate(${(4 * Math.sin(wobble * Math.PI * 3) * (1 - wobble)).toFixed(2)} 0 0)`);
  C.eyes.forEach(({ e, pu, ex }) => { pu.setAttribute("cx", (ex + 2.4 * Math.max(-1, Math.min(1, gaze[0]))).toFixed(2)); pu.setAttribute("cy", (-63 + 2.4 * Math.max(-1, Math.min(1, gaze[1]))).toFixed(2)); e.setAttribute("transform", `translate(0 -64) scale(1 ${(1 - 0.92 * Math.min(1, blink)).toFixed(2)}) translate(0 64)`); });
  const [d, fill] = MOUTHS[mood] || MOUTHS.smile; C.mouth.setAttribute("d", d); C.mouth.setAttribute("fill", fill);
  C.steam.setAttribute("opacity", hot);
  C.curls.forEach((p, i) => { const s = Math.sin(phase * 2 + i * 2), y0 = -130; p.setAttribute("d", `M${-18 + 18 * i} ${y0} q${-8 + 6 * s} -10 ${0 + 4 * s} -20 q${8 - 6 * s} -10 ${0 - 4 * s} -20`); });
}

// The spoon: a long handle with a little face, and a bowl that shows what it carries.
export function makeSpoon(parent) {
  const root = g(parent), body = g(root);
  svgEl("path", { d: "M0 0 L0 -64", stroke: INK, "stroke-width": 9, "stroke-linecap": "round" }, body);
  svgEl("path", { d: "M0 0 L0 -64", stroke: "#cfd6dc", "stroke-width": 6.5, "stroke-linecap": "round" }, body);
  svgEl("ellipse", { cx: 0, cy: 10, rx: 17, ry: 12, fill: "#cfd6dc", stroke: INK, "stroke-width": 1.8 }, body);
  const content = svgEl("ellipse", { cx: 0, cy: 8, rx: 13, ry: 7.5 }, body);
  svgEl("path", { d: "M-9 4 q4 -5 9 -5", stroke: "#fff", "stroke-width": 2, fill: "none", opacity: 0.7 }, body);
  const face = g(body, { transform: "translate(0 -48)" });
  const eyes = [-5, 5].map((ex) => svgEl("circle", { cx: ex, cy: 0, r: 2.2, fill: "#1d1d1d" }, face));
  const mouth = svgEl("path", { d: "M-4 5 q4 4 8 0", fill: "none", stroke: INK, "stroke-width": 1.2, "stroke-linecap": "round" }, face);
  return { root, body, content, eyes, mouth };
}

// x, y: bottom of the bowl; tilt in degrees (a pour); fill: { c, m } carried (null: empty); grin 0..1.
export function poseSpoon(Sp, { x, y, tilt = 0, fill = null, grin = 0 }) {
  Sp.root.setAttribute("transform", `translate(${x.toFixed(1)} ${(y - 10).toFixed(1)}) rotate(${tilt.toFixed(1)} 0 10)`);
  const tot = fill ? fill.c + fill.m : 0;
  Sp.content.setAttribute("opacity", tot > 0.01 ? 1 : 0);
  if (tot > 0.01) Sp.content.setAttribute("fill", mixColour(fill.c / tot));
  Sp.mouth.setAttribute("d", grin > 0.5 ? "M-5 4 q5 7 10 0 Z" : "M-4 5 q4 4 8 0"); Sp.mouth.setAttribute("fill", grin > 0.5 ? "#7a2e2e" : "none");
}

// A small card with coloured swatches: lines [[colour, text], ...], anchored at its bottom centre (x, y).
export function makeCard(parent) {
  const root = g(parent, { "pointer-events": "none" }), box = svgEl("rect", { rx: 7, fill: "var(--surface)", stroke: INK, "stroke-width": 1.4 }, root);
  const rows = [0, 1, 2].map(() => ({ sw: svgEl("rect", { width: 10, height: 10, rx: 2, stroke: INK, "stroke-width": 0.8 }, root), tx: svgEl("text", { "font-size": 11, "font-weight": 700, fill: INK }, root) }));
  return { root, box, rows };
}
export function poseCard(K, { x, y, lines = [], appear = 1 }) {
  K.root.setAttribute("opacity", lines.length ? appear : 0);
  if (!lines.length) return;
  const w = Math.max(...lines.map(([, t]) => t.length)) * 6.3 + 30, h = lines.length * 16 + 8, x0 = x - w / 2, y0 = y - h;
  K.box.setAttribute("x", x0); K.box.setAttribute("y", y0); K.box.setAttribute("width", w); K.box.setAttribute("height", h);
  K.rows.forEach((r, i) => { const on = i < lines.length; r.sw.setAttribute("opacity", on ? 1 : 0); r.tx.setAttribute("opacity", on ? 1 : 0); if (!on) return; r.sw.setAttribute("x", x0 + 8); r.sw.setAttribute("y", y0 + 7 + i * 16); r.sw.setAttribute("fill", lines[i][0]); r.tx.setAttribute("x", x0 + 24); r.tx.setAttribute("y", y0 + 16 + i * 16); r.tx.textContent = lines[i][1]; });
}
