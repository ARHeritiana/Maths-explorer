// Small kit for cartoon scenes inside the animated solutions: a night landscape, articulated characters and a lantern.
// Everything is plain SVG built once; a scene is then posed by calling set() on its parts, so a frame is a pure function
// of the step and its progress (scrubbable, reproducible). Ambient motion (twinkling stars, water, flame) is CSS only
// and is switched off by prefers-reduced-motion (see the "scene kit" block of pages.css).
import { svgEl } from "./challenge-kit.js";

export const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const seg = (p, a, b) => clamp01((p - a) / (b - a));
export const easeInOut = (x) => { const k = clamp01(x); return k * k * (3 - 2 * k); };
export const easeOutBack = (x) => { const k = clamp01(x), c = 1.70158; return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2; };
const TAU = Math.PI * 2;
let uid = 0;

const el = (name, attrs, parent) => svgEl(name, attrs, parent);

/* ------------------------------------------------------------------ night landscape with a rope bridge */
// Geometry is exported because the characters have to match it: feet of a waiting soldier at WAIT_Y, feet on the
// walking lane (cliff front edge and bridge deck) at LANE_Y, so a walker passes in front of those who wait.
export const SCENE = { W: 520, H: 300, WAIT_Y: 196, LANE_Y: 208, LEFT_EDGE: 132, RIGHT_EDGE: 388 };

export function nightBridge(svg) {
  const id = `sk${++uid}`, { W, H, LEFT_EDGE: L, RIGHT_EDGE: R } = SCENE;
  const defs = el("defs", {}, svg);
  const sky = el("linearGradient", { id: `${id}-sky`, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  [[0, "#0e1336"], [0.55, "#2b3578"], [1, "#8a5f9c"]].forEach(([o, c]) => el("stop", { offset: o, "stop-color": c }, sky));
  const water = el("linearGradient", { id: `${id}-water`, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  [[0, "#1c2a5c"], [1, "#080c22"]].forEach(([o, c]) => el("stop", { offset: o, "stop-color": c }, water));
  el("rect", { width: W, height: H, fill: `url(#${id}-sky)` }, svg);

  // stars (deterministic so the picture never jumps) and the moon
  for (let i = 0; i < 26; i++) {
    const x = (i * 197 + 41) % W, y = 8 + ((i * 89) % 120), r = 0.8 + (i % 3) * 0.45;
    el("circle", { cx: x, cy: y, r, fill: "#fff8d6", class: "sc-star", style: `--d:${(i % 7) * 0.45}s` }, svg);
  }
  el("circle", { cx: 70, cy: 52, r: 34, fill: "#fff3c4", opacity: 0.12 }, svg);
  el("circle", { cx: 70, cy: 52, r: 21, fill: "#fff3c4" }, svg);
  el("circle", { cx: 62, cy: 46, r: 4.5, fill: "#e9d89c", opacity: 0.7 }, svg);
  el("circle", { cx: 78, cy: 58, r: 3.2, fill: "#e9d89c", opacity: 0.7 }, svg);
  el("circle", { cx: 80, cy: 42, r: 2.2, fill: "#e9d89c", opacity: 0.7 }, svg);

  // two ranges of far mountains and a drifting mist
  el("path", { d: "M0 180 L40 128 L78 160 L128 104 L182 168 L236 120 L292 172 L350 112 L410 166 L462 124 L520 170 V200 H0Z", fill: "#2a3068" }, svg);
  el("path", { d: "M0 196 L58 156 L110 186 L170 146 L232 190 L300 150 L362 188 L430 152 L520 192 V220 H0Z", fill: "#202658" }, svg);
  const mist = el("g", { class: "sc-mist" }, svg);
  el("ellipse", { cx: 150, cy: 214, rx: 120, ry: 9, fill: "#c9c3ff", opacity: 0.1 }, mist);
  el("ellipse", { cx: 390, cy: 222, rx: 130, ry: 8, fill: "#c9c3ff", opacity: 0.09 }, mist);

  // the chasm with a river
  el("rect", { x: 0, y: 214, width: W, height: H - 214, fill: `url(#${id}-water)` }, svg);
  for (let i = 0; i < 9; i++) {
    el("path", { d: `M${L + 8 + i * 28} ${252 + (i % 3) * 14} q8 -5 16 0 t16 0`, fill: "none", stroke: "#7e8cd6", "stroke-width": 1.6, "stroke-linecap": "round", opacity: 0.35, class: "sc-wave", style: `--d:${i * 0.3}s` }, svg);
  }

  // rope behind the walkers (supporting verticals and the sagging hand rope), then the deck
  const sag = (t) => (1 - t) * (1 - t) * 178 + 2 * t * (1 - t) * 202 + t * t * 178;
  for (let i = 1; i < 10; i++) { const t = i / 10, x = lerp(L + 6, R - 6, t); el("line", { x1: x, y1: sag(t), x2: x, y2: 206, stroke: "#b9885a", "stroke-width": 1.4, opacity: 0.8 }, svg); }
  el("path", { d: `M${L + 6} 178 Q${(L + R) / 2} 202 ${R - 6} 178`, fill: "none", stroke: "#d8a56e", "stroke-width": 2.4, "stroke-linecap": "round" }, svg);
  const deck = el("g", {}, svg);
  el("rect", { x: L - 4, y: 202, width: R - L + 8, height: 11, rx: 2, fill: "#8a5a36" }, deck);
  for (let x = L; x < R; x += 11) el("line", { x1: x, y1: 202, x2: x, y2: 213, stroke: "#5e3a20", "stroke-width": 1.2 }, deck);
  el("rect", { x: L - 4, y: 213, width: R - L + 8, height: 4, fill: "#5e3a20" }, deck);

  // cliffs: lit grass on top, rock face below, and the bridge posts
  for (const flip of [false, true]) {
    const fx = (x) => (flip ? W - x : x), P = (...pts) => pts.map(([x, y], i) => `${i ? "L" : "M"}${fx(x)} ${y}`).join("") + "Z";
    el("path", { d: P([0, 188], [L, 188], [L + 6, 218], [0, 218]), fill: "#5f8f60" }, svg);
    el("path", { d: P([0, 188], [L, 188], [L + 2, 194], [0, 194]), fill: "#7fb06d" }, svg);
    el("path", { d: P([0, 218], [L + 6, 218], [L - 2, 246], [L + 8, 270], [L - 8, 300], [0, 300]), fill: "#3e3558" }, svg);
    el("path", { d: P([20, 232], [48, 222], [70, 250], [36, 262]), fill: "#4b4068", opacity: 0.9 }, svg);
    el("path", { d: P([62, 268], [92, 252], [104, 282], [70, 290]), fill: "#2f2748", opacity: 0.9 }, svg);
    for (const gx of [18, 44, 78]) el("path", { d: `M${fx(gx)} 192 l-2 -7 M${fx(gx)} 192 l2 -8 M${fx(gx)} 192 l5 -5`, stroke: "#9fd28a", "stroke-width": 1.6, "stroke-linecap": "round", fill: "none" }, svg);
    el("rect", { x: flip ? W - L - 3 : L - 3, y: 174, width: 6, height: 40, rx: 2, fill: "#6b4423" }, svg);
  }
  return svg;
}

/* ------------------------------------------------------------------ a soldier made of separate parts */
const HATS = [
  // scout: red beret with a pom-pom
  () => `<path d="M-9 -43 Q-1 -57 9.5 -44 Q3 -46 -9 -43Z" fill="#d32f2f"/><circle cx="1" cy="-53" r="1.8" fill="#8f1b1b"/>`,
  // plain helmet with a brim
  () => `<path d="M-9 -41 A9 9 0 0 1 9 -41Z" fill="#6b7a4f"/><rect x="-11" y="-42" width="22" height="3" rx="1.5" fill="#55623e"/>`,
  // peaked cap
  () => `<path d="M-9 -41 A9 9 0 0 1 9 -41Z" fill="#35507a"/><rect x="2" y="-42" width="12" height="3" rx="1.5" fill="#22344f"/><circle cx="0" cy="-47" r="1.8" fill="#f3c84a"/>`,
  // tall fur hat with a plume, for the old sergeant
  () => `<rect x="-7.5" y="-61" width="15" height="19" rx="3" fill="#6d2c2c"/><rect x="-7.5" y="-45" width="15" height="2.6" fill="#f3c84a"/><path d="M0 -61 q-3 -9 4 -10 q1 6 -4 10Z" fill="#f1f1f1"/>`,
];

export function makeSoldier(parent, { uniform, hat = 0, size = 1, skin = "#f1c27d", moustache = false, label = "", top = 66 }) {
  const root = el("g", { class: "sd" }, parent);
  const shadow = el("ellipse", { cx: 0, cy: 0.5, rx: 11 * size, ry: 3.2, fill: "#000", opacity: 0.28 }, root);
  const flip = el("g", {}, root), bob = el("g", {}, flip);
  const dark = "#2b2538";
  const mk = (cls, x, y, body) => { const g = el("g", { class: cls, transform: `translate(${x} ${y})` }, bob); g.innerHTML = body; return g; };
  const legBody = `<rect x="-3" y="0" width="6" height="14" rx="3" fill="${dark}"/><ellipse cx="1.8" cy="15.5" rx="5.2" ry="2.6" fill="#1b1727"/>`;
  const armBody = `<rect x="-2.7" y="-1" width="5.4" height="15" rx="2.7" fill="${uniform}" stroke="#0003" stroke-width=".6"/><circle cy="14.5" r="2.7" fill="${skin}"/>`;
  const legB = mk("sd-leg", -3.5, -16, legBody);
  const armB = mk("sd-arm", -7, -30, armBody);
  const body = el("g", {}, bob);
  body.innerHTML = `<rect x="-8.5" y="-34" width="17" height="20" rx="6" fill="${uniform}" stroke="#0003" stroke-width=".7"/><rect x="-8.5" y="-22" width="17" height="3" fill="#2b2538" opacity=".55"/><circle cx="0" cy="-27" r="1.2" fill="#f3c84a"/><circle cx="0" cy="-17" r="1.2" fill="#f3c84a"/>`;
  const head = el("g", { class: "sd-head" }, bob);
  head.innerHTML = `<circle cx="0" cy="-40" r="8.2" fill="${skin}" stroke="#0002" stroke-width=".6"/><circle cx="3.2" cy="-41" r="1.15" fill="#222"/><circle cx="6.6" cy="-41" r="1.15" fill="#222"/><circle cx="8.3" cy="-38.6" r="1.7" fill="#d9a066"/><path d="M3.6 -36.2 q2.4 1.8 4.6 0" fill="none" stroke="#7a3b2a" stroke-width="1" stroke-linecap="round"/>${moustache ? `<path d="M2.5 -37.4 q3 -1.6 6 0 q-3 2.2 -6 0Z" fill="#eee"/>` : ""}${HATS[hat]()}`;
  const legF = mk("sd-leg", 3.5, -16, legBody);
  const armF = mk("sd-arm", 7, -30, armBody);
  const badge = el("g", {}, root);
  el("circle", { r: 9, fill: "#fff", stroke: uniform, "stroke-width": 2.4 }, badge);
  const txt = el("text", { y: 4.4, "text-anchor": "middle", style: "font:700 12px var(--math, serif);fill:#1a1a2e" }, badge);
  txt.textContent = label;

  return {
    root,
    // Pose the character. phase: walk cycle in turns; amp: stride size (0 = standing); carry: lantern arm raised;
    // cheer 0..1: both arms up; hop: height of a jump; scale: pop-in factor (0 hides it).
    set({ x, y, dir = 1, phase = 0, amp = 0, carry = false, cheer = 0, hop = 0, scale = 1 }) {
      root.setAttribute("visibility", scale <= 0.01 ? "hidden" : "visible");
      root.setAttribute("transform", `translate(${x.toFixed(2)} ${(y - hop).toFixed(2)})`);
      shadow.setAttribute("rx", (11 * size * (1 - Math.min(0.5, hop / 50))).toFixed(2));
      shadow.setAttribute("transform", `translate(0 ${hop.toFixed(2)})`);
      flip.setAttribute("transform", `scale(${(dir * size * scale).toFixed(3)} ${(size * scale).toFixed(3)})`);
      const s = Math.sin(phase * TAU), c = Math.abs(Math.cos(phase * TAU)), a = amp;
      bob.setAttribute("transform", `translate(0 ${(-a * 2.3 * c).toFixed(2)}) rotate(${(a * 3.2).toFixed(2)})`);
      legF.setAttribute("transform", `translate(3.5 -16) rotate(${(32 * a * s).toFixed(2)})`);
      legB.setAttribute("transform", `translate(-3.5 -16) rotate(${(-32 * a * s).toFixed(2)})`);
      const wave = Math.sin(phase * TAU * 2);
      armF.setAttribute("transform", `translate(7 -30) rotate(${(carry ? -66 + 4 * s : cheer ? lerp(0, -150 + 10 * wave, cheer) : -28 * a * s - 2).toFixed(2)})`);
      armB.setAttribute("transform", `translate(-7 -30) rotate(${(cheer ? lerp(0, 150 - 10 * wave, cheer) : 28 * a * s + 3).toFixed(2)})`);
      badge.setAttribute("transform", `translate(0 ${(-(top * size * scale) - a * 2).toFixed(2)}) scale(${Math.min(1, scale).toFixed(3)})`);
      root.classList.toggle("sd-idle", a === 0 && !cheer);
    },
    // Where the carried lantern hangs, in the scene's coordinates.
    hand({ x, y, dir = 1, scale = 1 }) { return [x + dir * size * scale * 19.5, y - size * scale * 24]; },
  };
}

/* ------------------------------------------------------------------ the lantern */
export function makeLantern(parent) {
  const id = `lg${++uid}`;
  const root = el("g", { class: "lt" }, parent);
  const defs = el("defs", {}, root), g = el("radialGradient", { id }, defs);
  [[0, "#ffe9a0", 0.85], [0.45, "#ffd36a", 0.32], [1, "#ffd36a", 0]].forEach(([o, c, a]) => el("stop", { offset: o, "stop-color": c, "stop-opacity": a }, g));
  const swing = el("g", {}, root);
  const glow = el("circle", { cx: 0, cy: 10, r: 46, fill: `url(#${id})`, class: "sc-flame" }, swing);
  el("path", { d: "M-3 5 Q0 -3 3 5", fill: "none", stroke: "#3b2b17", "stroke-width": 1.6, "stroke-linecap": "round" }, swing);
  el("rect", { x: -5.5, y: 4, width: 11, height: 3, rx: 1, fill: "#3b2b17" }, swing);
  el("rect", { x: -4.4, y: 7, width: 8.8, height: 11, rx: 2, fill: "#ffd04d", stroke: "#3b2b17", "stroke-width": 1.2 }, swing);
  el("rect", { x: -5.5, y: 17, width: 11, height: 2.6, rx: 1, fill: "#3b2b17" }, swing);
  return {
    root,
    set({ x, y, angle = 0 }) {
      root.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
      swing.setAttribute("transform", `rotate(${angle.toFixed(2)})`);
    },
  };
}
