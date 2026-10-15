// More props for the cartoon solutions, built on scene-kit.js: a daylight backdrop, a character egg, a snail, a balance
// with pans, and coins. Same rules as the kit: build once, then pose with set(); ambient motion is CSS (pages.css).
import { svgEl } from "./challenge-kit.js";
import { lerp } from "./scene-kit.js";

const el = (name, attrs, parent) => svgEl(name, attrs, parent);
let uid = 0;

/* ------------------------------------------------------------------ daylight backdrop */
// Sky, sun, drifting clouds, far hills and a grass strip whose top edge is at `ground`.
export function dayScene(svg, { W = 520, H = 300, ground = 262 } = {}) {
  const id = `dy${++uid}`;
  const defs = el("defs", {}, svg), g = el("linearGradient", { id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  [[0, "#6ec3ff"], [1, "#d8f1ff"]].forEach(([o, c]) => el("stop", { offset: o, "stop-color": c }, g));
  el("rect", { width: W, height: H, fill: `url(#${id})` }, svg);
  const sun = el("g", { class: "sc-sun" }, svg);
  el("circle", { cx: W - 56, cy: 52, r: 38, fill: "#fff4b0", opacity: 0.35 }, sun);
  el("circle", { cx: W - 56, cy: 52, r: 24, fill: "#ffd84a" }, sun);
  const clouds = el("g", { class: "sc-cloud" }, svg);
  for (const [x, y, k] of [[W * 0.5, 44, 1], [W * 0.22, 84, 0.7]]) {
    el("ellipse", { cx: x, cy: y, rx: 34 * k, ry: 12 * k, fill: "#fff", opacity: 0.9 }, clouds);
    el("ellipse", { cx: x + 18 * k, cy: y - 8 * k, rx: 20 * k, ry: 11 * k, fill: "#fff", opacity: 0.9 }, clouds);
    el("ellipse", { cx: x - 20 * k, cy: y - 5 * k, rx: 18 * k, ry: 10 * k, fill: "#fff", opacity: 0.9 }, clouds);
  }
  el("path", { d: `M0 ${ground - 36} Q${W * 0.18} ${ground - 84} ${W * 0.38} ${ground - 40} T${W * 0.72} ${ground - 46} T${W} ${ground - 34} V${ground} H0Z`, fill: "#9bd09a" }, svg);
  el("path", { d: `M0 ${ground - 14} Q${W * 0.25} ${ground - 40} ${W * 0.5} ${ground - 14} T${W} ${ground - 18} V${ground} H0Z`, fill: "#7fbf7a" }, svg);
  el("rect", { x: 0, y: ground, width: W, height: H - ground, fill: "#5fa85e" }, svg);
  el("rect", { x: 0, y: ground, width: W, height: 5, fill: "#79c276" }, svg);
  return svg;
}

/* ------------------------------------------------------------------ an egg with a face */
// set({ x, y, rot, sx, sy, face, crack, splat, scale }): (x, y) is the middle of the egg's base.
// face: "ok" | "scared" | "dizzy" | "happy". crack 0..1 draws a zig-zag; splat 0..1 spills the yolk and hides the shell.
export function makeEgg(parent, { shell = "#fbf0d6", spot = "#e4cf9f", size = 1 } = {}) {
  const root = el("g", { class: "eg" }, parent), body = el("g", {}, root);
  const yolk = el("g", { opacity: 0 }, root);
  el("ellipse", { cx: 0, cy: -2, rx: 22, ry: 6, fill: "#fffbe8", stroke: "#e8d9a5", "stroke-width": 1 }, yolk);
  el("circle", { cx: 2, cy: -4, r: 6.5, fill: "#ffc83a" }, yolk);
  const shellG = el("g", {}, body);
  el("ellipse", { cx: 0, cy: -19, rx: 15, ry: 19, fill: shell, stroke: "#8a7a58", "stroke-width": 1.6 }, shellG);
  for (const [x, y] of [[-6, -26], [7, -12], [-4, -9], [5, -28]]) el("circle", { cx: x, cy: y, r: 1.3, fill: spot }, shellG);
  const crack = el("path", { d: "M-12 -26 L-6 -22 L-9 -17 L-2 -13 L-5 -7 L2 -4", fill: "none", stroke: "#5b4a2a", "stroke-width": 1.8, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, shellG);
  const face = el("g", {}, shellG);
  const set = {
    root,
    set({ x, y, rot = 0, sx = 1, sy = 1, face: f = "ok", crack: c = 0, splat = 0, scale = 1 }) {
      root.setAttribute("visibility", scale <= 0.01 ? "hidden" : "visible");
      root.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${(size * scale).toFixed(3)})`);
      body.setAttribute("transform", `rotate(${rot.toFixed(2)} 0 -19) scale(${sx.toFixed(3)} ${sy.toFixed(3)})`);
      body.setAttribute("opacity", String(1 - Math.min(1, splat * 1.4)));
      yolk.setAttribute("opacity", String(Math.min(1, splat * 1.6)));
      yolk.setAttribute("transform", `scale(${(0.5 + 0.5 * splat).toFixed(3)} ${(0.4 + 0.6 * splat).toFixed(3)})`);
      crack.setAttribute("opacity", String(c > 0 ? 1 : 0));
      crack.setAttribute("stroke-dasharray", "60");
      crack.setAttribute("stroke-dashoffset", String(60 * (1 - Math.min(1, c))));
      const eyes = { ok: `<circle cx="-5" cy="-22" r="2.2" fill="#222"/><circle cx="5" cy="-22" r="2.2" fill="#222"/><path d="M-5 -14 q5 4 10 0" fill="none" stroke="#6b3a2a" stroke-width="1.5" stroke-linecap="round"/>`,
        happy: `<path d="M-8 -22 q3 -4 6 0 M2 -22 q3 -4 6 0" fill="none" stroke="#222" stroke-width="1.8" stroke-linecap="round"/><path d="M-6 -15 q6 7 12 0 z" fill="#8a3a2a"/>`,
        scared: `<circle cx="-5" cy="-22" r="3.4" fill="#fff" stroke="#222" stroke-width="1"/><circle cx="5" cy="-22" r="3.4" fill="#fff" stroke="#222" stroke-width="1"/><circle cx="-5" cy="-22" r="1.3" fill="#222"/><circle cx="5" cy="-22" r="1.3" fill="#222"/><ellipse cx="0" cy="-13" rx="3" ry="3.6" fill="#7a2f22"/><path d="M-9 -29 l5 2 M9 -29 l-5 2" stroke="#222" stroke-width="1.5" stroke-linecap="round"/>`,
        dizzy: `<path d="M-8 -25 l6 6 M-2 -25 l-6 6 M2 -25 l6 6 M8 -25 l-6 6" stroke="#222" stroke-width="1.6" stroke-linecap="round"/><path d="M-6 -13 q3 -3 6 0 t6 0" fill="none" stroke="#6b3a2a" stroke-width="1.5" stroke-linecap="round"/>` }[f] || "";
      if (face.dataset.f !== f) { face.innerHTML = eyes; face.dataset.f = f; }
    },
  };
  return set;
}

/* ------------------------------------------------------------------ the snail */
// Drawn crawling to the right at (x, y) = base of the foot; rotate it with rot (-90 climbs a post).
export function makeSnail(parent, { shell = "#e8710a" } = {}) {
  const root = el("g", { class: "sn" }, parent), body = el("g", {}, root);
  el("ellipse", { cx: 0, cy: -4, rx: 24, ry: 5, fill: "#cfe3a0", stroke: "#7a8c4a", "stroke-width": 1.4 }, body);
  el("path", { d: "M16 -6 q6 -2 8 -10 q1 -6 -3 -8", fill: "#cfe3a0", stroke: "#7a8c4a", "stroke-width": 1.4, "stroke-linecap": "round" }, body);
  el("path", { d: "M22 -7 q9 -2 11 -12 q1 -5 -3 -7", fill: "#cfe3a0", stroke: "#7a8c4a", "stroke-width": 1.4, "stroke-linecap": "round" }, body);
  const eyes = el("g", {}, body);
  el("circle", { cx: 21, cy: -25, r: 3, fill: "#fff", stroke: "#7a8c4a", "stroke-width": 1 }, eyes);
  el("circle", { cx: 29, cy: -27, r: 3, fill: "#fff", stroke: "#7a8c4a", "stroke-width": 1 }, eyes);
  const pupils = el("g", {}, eyes);
  el("circle", { cx: 22, cy: -25, r: 1.3, fill: "#222" }, pupils); el("circle", { cx: 30, cy: -27, r: 1.3, fill: "#222" }, pupils);
  el("circle", { cx: -2, cy: -17, r: 14, fill: shell, stroke: "#7a3a05", "stroke-width": 1.6 }, body);
  el("path", { d: "M-2 -17 m-3 0 a3 3 0 1 1 3 3 a7 7 0 1 1 -7 -7 a11 11 0 1 1 11 11", fill: "none", stroke: "#7a3a05", "stroke-width": 1.4, "stroke-linecap": "round" }, body);
  return {
    root,
    set({ x, y, rot = 0, dir = 1, stretch = 1, mood = "ok", size = 1 }) {
      root.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rot.toFixed(2)}) scale(${dir * size}, ${size})`);
      body.setAttribute("transform", `scale(${stretch.toFixed(3)} ${(2 - stretch).toFixed(3)})`);
      pupils.setAttribute("transform", `translate(${mood === "scared" ? -1.2 : 0.6} ${mood === "scared" ? 1 : 0})`);
    },
  };
}

/* ------------------------------------------------------------------ a coin */
export const coinSvg = (parent, { x, y, r = 7, fake = false, label = "" }) => {
  const g = el("g", { transform: `translate(${x} ${y})` }, parent);
  el("circle", { r, fill: fake ? "#d98a4a" : "#f3c84a", stroke: fake ? "#7a3f10" : "#8a6a10", "stroke-width": 1.3 }, g);
  el("circle", { r: r * 0.62, fill: "none", stroke: fake ? "#7a3f10" : "#8a6a10", "stroke-width": 0.9, opacity: 0.7 }, g);
  if (label !== "") { const t = el("text", { y: r * 0.36, "text-anchor": "middle", style: `font:700 ${Math.max(7, r * 0.95)}px var(--body);fill:#3a2a05` }, g); t.textContent = label; }
  return g;
};

/* ------------------------------------------------------------------ a two-pan balance */
// set({ angle, left, right }): angle in degrees (negative: left pan goes down is positive? see below), left/right are
// functions (g, cx) that draw the contents of a pan into group g, centred on x = 0 and resting on y = 0.
export function makeBalance(parent, { x = 260, y = 150, arm = 86, post = 70 } = {}) {
  const root = el("g", { transform: `translate(${x} ${y})` }, parent);
  el("path", { d: `M-26 ${post} L26 ${post} L8 ${post - 10} L-8 ${post - 10}Z`, fill: "#8a5a36", stroke: "#4b2d14", "stroke-width": 1.6 }, root);
  el("rect", { x: -4, y: 0, width: 8, height: post - 8, rx: 3, fill: "#a8723f", stroke: "#4b2d14", "stroke-width": 1.4 }, root);
  const beam = el("g", {}, root);
  el("rect", { x: -arm - 6, y: -4, width: 2 * arm + 12, height: 8, rx: 4, fill: "#c98f52", stroke: "#4b2d14", "stroke-width": 1.6 }, beam);
  el("circle", { r: 6, fill: "#f3c84a", stroke: "#4b2d14", "stroke-width": 1.4 }, root);
  const pans = [el("g", {}, root), el("g", {}, root)];
  return {
    root, arm,
    // angle > 0 tilts the RIGHT end down.
    set({ angle = 0, left, right }) {
      beam.setAttribute("transform", `rotate(${angle.toFixed(2)})`);
      const a = (angle * Math.PI) / 180, ends = [[-arm * Math.cos(a), -arm * Math.sin(a)], [arm * Math.cos(a), arm * Math.sin(a)]];
      [left, right].forEach((draw, i) => {
        const g = pans[i], [ex, ey] = ends[i], drop = 34;
        g.replaceChildren();
        g.setAttribute("transform", `translate(${ex.toFixed(2)} ${ey.toFixed(2)})`);
        el("path", { d: `M0 0 L-22 ${drop} M0 0 L22 ${drop}`, stroke: "#4b2d14", "stroke-width": 1.2, fill: "none" }, g);
        const contents = el("g", { transform: `translate(0 ${drop})` }, g);
        draw?.(contents);
        el("path", { d: `M-27 ${drop - 1} Q0 ${drop + 18} 27 ${drop - 1}Z`, fill: "#e6b873", stroke: "#4b2d14", "stroke-width": 1.5 }, g);
      });
    },
    lerp,
  };
}
