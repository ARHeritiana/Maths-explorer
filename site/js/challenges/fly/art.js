// Drawings of the fly challenge: the countryside with its railway, two cartoon locomotives with a face, a driver and
// turning wheels, the fly (striped body, flapping wings, big eyes) and a stopwatch. Built once (make...), posed every
// frame (pose...): every pose is a pure function of its arguments, so the animated solution stays pure.
import { svgEl, colour } from "../common/kit.js";

const INK = "var(--ink)";
const g = (p, attrs = {}) => svgEl("g", attrs, p);
export const W = 520, H = 300, RAIL = 214;

// Sky, far hills, a few trees, the embankment and the track with its sleepers.
export function drawCountryside(svg) {
  svgEl("rect", { x: 0, y: 0, width: W, height: RAIL, fill: "color-mix(in srgb, #bfe3ff 55%, var(--surface))" }, svg);
  svgEl("circle", { cx: 470, cy: 44, r: 20, fill: "#ffd34d", stroke: INK, "stroke-width": 1.2, opacity: 0.9 }, svg);
  for (const [x, y, s] of [[60, 40, 1], [350, 22, 0.7], [410, 96, 0.6]]) {   // clouds
    const c = g(svg, { transform: `translate(${x} ${y}) scale(${s})`, opacity: 0.85 });
    svgEl("path", { d: "M0 14 q-2 -14 14 -12 q6 -12 20 -2 q14 -4 14 10 q8 4 0 10 H4 q-10 0 -4 -6 Z", fill: "#fff", stroke: INK, "stroke-width": 1 }, c);
  }
  svgEl("path", { d: `M0 ${RAIL - 40} q70 -46 150 -14 q80 -40 170 -4 q90 -36 200 4 V${RAIL} H0 Z`, fill: "color-mix(in srgb, #8fcf7a 70%, var(--surface))", stroke: INK, "stroke-width": 1 }, svg);
  for (const x of [34, 128, 392, 488]) {   // trees
    svgEl("rect", { x: x - 2.5, y: RAIL - 30, width: 5, height: 16, fill: "#7a4a24", stroke: INK, "stroke-width": 0.8 }, svg);
    svgEl("circle", { cx: x, cy: RAIL - 36, r: 11, fill: "#4f9a46", stroke: INK, "stroke-width": 1 }, svg);
    svgEl("circle", { cx: x - 3, cy: RAIL - 40, r: 3.5, fill: "#fff", opacity: 0.25 }, svg);
  }
  svgEl("rect", { x: 0, y: RAIL, width: W, height: H - RAIL, fill: "color-mix(in srgb, #c9a46b 60%, var(--surface))" }, svg);
  for (let x = 4; x < W; x += 16) svgEl("rect", { x, y: RAIL + 2, width: 10, height: 5, rx: 1, fill: "#8d5f2d", stroke: INK, "stroke-width": 0.6 }, svg);
  svgEl("line", { x1: 0, y1: RAIL + 2, x2: W, y2: RAIL + 2, stroke: "#6b6b6b", "stroke-width": 2.4 }, svg);
  svgEl("line", { x1: 0, y1: RAIL + 2, x2: W, y2: RAIL + 2, stroke: INK, "stroke-width": 0.6 }, svg);
}

// A locomotive whose nose is at x = 0 (rails at y = 0), facing +x when dir = 1. Colour index i for the body.
export function makeTrain(parent, { i = 0, dir = 1 }) {
  const root = g(parent), flip = g(root, { transform: dir < 0 ? "scale(-1 1)" : "" }), body = g(flip);
  const paint = `color-mix(in srgb, ${colour(i)} 70%, var(--surface))`, dark = `color-mix(in srgb, ${colour(i)} 70%, #000)`;
  svgEl("rect", { x: -82, y: -46, width: 30, height: 34, rx: 3, fill: paint, stroke: INK, "stroke-width": 1.4 }, body);   // cab
  svgEl("rect", { x: -86, y: -52, width: 38, height: 7, rx: 2, fill: dark, stroke: INK, "stroke-width": 1.2 }, body);   // roof
  svgEl("rect", { x: -76, y: -42, width: 16, height: 13, rx: 2, fill: "#dff1ff", stroke: INK, "stroke-width": 1 }, body);   // cab window
  const driver = g(body);   // the driver's head and cap in the window
  svgEl("circle", { cx: -66, cy: -34, r: 5, fill: "#f2c9a0", stroke: INK, "stroke-width": 0.9 }, driver);
  svgEl("path", { d: "M-71.5 -36 q5.5 -7 11 0 Z", fill: "#3d4b6b", stroke: INK, "stroke-width": 0.8 }, driver);
  svgEl("circle", { cx: -64, cy: -34, r: 0.9, fill: INK }, driver);
  svgEl("rect", { x: -54, y: -34, width: 50, height: 22, rx: 10, fill: paint, stroke: INK, "stroke-width": 1.4 }, body);   // boiler
  svgEl("rect", { x: -50, y: -31, width: 40, height: 4, rx: 2, fill: "#fff", opacity: 0.3 }, body);
  svgEl("rect", { x: -40, y: -48, width: 9, height: 15, fill: dark, stroke: INK, "stroke-width": 1.2 }, body);   // chimney
  svgEl("rect", { x: -43, y: -52, width: 15, height: 5, rx: 1.5, fill: dark, stroke: INK, "stroke-width": 1.1 }, body);
  svgEl("rect", { x: -86, y: -13, width: 86, height: 5, rx: 2, fill: "#3b3b3b", stroke: INK, "stroke-width": 1 }, body);   // chassis
  svgEl("path", { d: "M0 -12 L8 -2 L-2 -2 Z", fill: "#c0392b", stroke: INK, "stroke-width": 1 }, body);   // cow-catcher
  // the face on the front of the boiler
  const face = g(body);
  const eyes = [-12, -4].map((ex) => { const e = g(face); svgEl("ellipse", { cx: ex, cy: -26, rx: 3, ry: 3.6, fill: "#fff", stroke: INK, "stroke-width": 0.9 }, e); const pu = svgEl("circle", { cx: ex + 0.8, cy: -25.6, r: 1.5, fill: "#1d1d1d" }, e); return { e, pu, ex }; });
  svgEl("circle", { cx: -14, cy: -19, r: 2, fill: "#ff7b7b", opacity: 0.5 }, face);
  const mouth = svgEl("path", { stroke: INK, "stroke-width": 1.1, "stroke-linecap": "round", "stroke-linejoin": "round" }, face);
  const wheels = [-72, -46, -20].map((cx, k) => {
    const w = g(body, { transform: `translate(${cx} -6)` });
    const r = k === 0 ? 8 : 6.5;
    svgEl("circle", { r, fill: "#444", stroke: INK, "stroke-width": 1.2 }, w);
    const spokes = g(w);
    for (let a = 0; a < 3; a++) svgEl("line", { x1: -r + 1.5, y1: 0, x2: r - 1.5, y2: 0, stroke: "#bbb", "stroke-width": 1.1, transform: `rotate(${a * 60})` }, spokes);
    svgEl("circle", { r: 1.6, fill: "#bbb" }, w);
    return { w, spokes, r, cx };
  });
  const rod = svgEl("line", { stroke: "#9a9a9a", "stroke-width": 2, "stroke-linecap": "round" }, body);
  const smoke = g(flip);
  const puffs = [0, 1, 2, 3].map(() => svgEl("circle", { fill: "#fff", stroke: "#aaa", "stroke-width": 1 }, smoke));
  return { root, body, eyes, mouth, wheels, rod, puffs, dir };
}

const TRAIN_MOUTHS = { smile: "M-15 -18 q4 4 9 0", grin: "M-16 -19 q5 7 11 0 Z", o: "M-10.5 -19.5 a2.4 2.8 0 1 0 0.01 0 Z", flat: "M-15 -18 h8" };

// x: nose position; roll: distance travelled (px) for the wheels; puff: smoke phase (any number, grows with time);
// steam: 0..1 strength of the smoke; squash: 0..1 impact; mood; blink; look: -1..1 where the eyes look (along the travel).
export function poseTrain(T, { x, y = RAIL, roll = 0, puff = 0, steam = 1, squash = 0, mood = "smile", blink = 0, look = 0 }) {
  const sq = 1 - 0.12 * squash;
  T.root.setAttribute("transform", `translate(${x.toFixed(1)} ${y}) scale(${(1 / sq).toFixed(3)} ${sq.toFixed(3)})`);
  T.body.setAttribute("transform", `translate(0 ${(-1.2 * Math.abs(Math.sin(roll / 9))).toFixed(2)})`);
  T.wheels.forEach(({ spokes, r }) => spokes.setAttribute("transform", `rotate(${((roll / r) * 57.3).toFixed(1)})`));
  const a = roll / 6.5, w0 = T.wheels[1], w2 = T.wheels[2];
  T.rod.setAttribute("x1", (w0.cx + 4 * Math.cos(a)).toFixed(1)); T.rod.setAttribute("y1", (-6 + 4 * Math.sin(a)).toFixed(1));
  T.rod.setAttribute("x2", (w2.cx + 4 * Math.cos(a)).toFixed(1)); T.rod.setAttribute("y2", (-6 + 4 * Math.sin(a)).toFixed(1));
  for (const E of T.eyes) {
    E.pu.setAttribute("cx", (E.ex + 1.2 * look).toFixed(2));
    E.e.setAttribute("transform", `translate(0 -26) scale(1 ${(1 - 0.9 * Math.min(1, blink)).toFixed(2)}) translate(0 26)`);
  }
  const d = TRAIN_MOUTHS[mood] || TRAIN_MOUTHS.smile;
  T.mouth.setAttribute("d", d); T.mouth.setAttribute("fill", mood === "grin" || mood === "o" ? "#7a2e2e" : "none");
  // smoke: four puffs rising from the chimney and drifting backwards, each on its own phase
  T.puffs.forEach((c, k) => {
    const u = (((puff + k / 4) % 1) + 1) % 1, s = steam * (1 - u);
    c.setAttribute("cx", (-36 - 30 * u).toFixed(1)); c.setAttribute("cy", (-56 - 34 * u).toFixed(1));
    c.setAttribute("r", (3 + 8 * u).toFixed(1)); c.setAttribute("opacity", (0.85 * s).toFixed(2));
  });
}

// The fly: about 22 units long, centred at (0, 0), facing +x.
export function makeFly(parent) {
  const root = g(parent), shadow = svgEl("ellipse", { rx: 6, ry: 1.6, fill: INK, opacity: 0.15 }, parent);
  const flip = g(root), body = g(flip);
  const wings = [g(body), g(body)];
  wings.forEach((w, k) => svgEl("ellipse", { cx: -2, cy: -7, rx: 4.6, ry: 8, fill: "color-mix(in srgb, #dff1ff 70%, transparent)", stroke: INK, "stroke-width": 0.8, transform: `rotate(${k ? 28 : -18} -2 0)` }, w));
  svgEl("ellipse", { cx: -3, cy: 0, rx: 7, ry: 5, fill: "#3b3b3b", stroke: INK, "stroke-width": 1 }, body);   // abdomen
  for (const x of [-6, -3]) svgEl("path", { d: `M${x} -4.6 v9.2`, stroke: "#d9a441", "stroke-width": 1.3 }, body);
  svgEl("circle", { cx: 5, cy: -0.5, r: 4.4, fill: "#3b3b3b", stroke: INK, "stroke-width": 1 }, body);   // head
  const eye = g(body);
  svgEl("circle", { cx: 6.6, cy: -2.6, r: 2.8, fill: "#c0392b", stroke: INK, "stroke-width": 0.8 }, eye);
  svgEl("circle", { cx: 7.4, cy: -3.3, r: 0.9, fill: "#fff" }, eye);
  const mouth = svgEl("path", { fill: "none", stroke: "#fff", "stroke-width": 0.8, "stroke-linecap": "round" }, body);
  for (const x of [-4, 0, 3]) svgEl("path", { d: `M${x} 4 l-1.5 3.5`, stroke: INK, "stroke-width": 0.8, "stroke-linecap": "round" }, body);   // legs
  return { root, flip, body, wings, mouth, shadow };
}

// x, y: centre; facing ±1; flap: wing phase (radians); tilt: degrees; ground: y of the shadow; grin: open smile.
export function poseFly(F, { x, y, facing = 1, flap = 0, tilt = 0, ground = RAIL, grin = false }) {
  F.root.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(tilt * facing).toFixed(1)})`);
  F.flip.setAttribute("transform", facing < 0 ? "scale(-1 1)" : "");
  const s = Math.sin(flap);
  F.wings[0].setAttribute("transform", `translate(-2 0) scale(1 ${(0.35 + 0.65 * Math.abs(s)).toFixed(2)}) translate(2 0)`);
  F.wings[1].setAttribute("transform", `translate(-2 0) scale(1 ${(0.35 + 0.65 * Math.abs(Math.cos(flap))).toFixed(2)}) translate(2 0)`);
  F.mouth.setAttribute("d", grin ? "M5 1.5 q2.4 2.2 4.4 0" : "M5.5 1.8 h3");
  F.shadow.setAttribute("cx", x.toFixed(1)); F.shadow.setAttribute("cy", ground + 6);
}

// A stopwatch centred at (x, y) with a dial of radius r.
export function makeStopwatch(parent, { x, y, r = 24 }) {
  const root = g(parent, { transform: `translate(${x} ${y})` });
  svgEl("rect", { x: -4, y: -r - 9, width: 8, height: 6, rx: 1.5, fill: "#9a9a9a", stroke: INK, "stroke-width": 1 }, root);
  svgEl("circle", { r: r + 3, fill: "#9a9a9a", stroke: INK, "stroke-width": 1.4 }, root);
  svgEl("circle", { r, fill: "var(--surface)", stroke: INK, "stroke-width": 1 }, root);
  for (let k = 0; k < 12; k++) svgEl("line", { x1: 0, y1: -r + 2, x2: 0, y2: -r + (k % 3 ? 4 : 6), stroke: INK, "stroke-width": 1, transform: `rotate(${k * 30})` }, root);
  const sweep = svgEl("path", { fill: "color-mix(in srgb, var(--object-ink) 30%, transparent)" }, root);
  const hand = svgEl("line", { x1: 0, y1: 2, x2: 0, y2: -r + 4, stroke: "#c0392b", "stroke-width": 1.8, "stroke-linecap": "round" }, root);
  svgEl("circle", { r: 2, fill: INK }, root);
  const label = svgEl("text", { y: r + 18, "text-anchor": "middle", class: "sol-small", "font-weight": 700 }, root);
  return { root, sweep, hand, label, r };
}

// k: 0..1 of a full turn; text under the dial.
export function poseStopwatch(S, { k, text = "", opacity = 1 }) {
  const a = Math.min(0.9999, Math.max(0, k)) * 2 * Math.PI, r = S.r - 1;
  S.root.setAttribute("opacity", opacity.toFixed(2));
  S.hand.setAttribute("transform", `rotate(${((a * 180) / Math.PI).toFixed(1)})`);
  S.sweep.setAttribute("d", k <= 0 ? "" : `M0 0 L0 ${-r} A${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${(r * Math.sin(a)).toFixed(2)} ${(-r * Math.cos(a)).toFixed(2)} Z`);
  S.label.textContent = text;
}
