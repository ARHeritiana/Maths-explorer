// Drawings of the konigsberg challenge: the cartoon town map (water, land with houses and trees, wooden bridges, a letter
// sign on each district) shared by the activity and the animated solution. Geometry comes from plan.js; no graph is drawn here.
import { svgEl as el } from "../common/kit.js";
import { HIT } from "./plan.js";

// a closed polygon with rounded corners, as an SVG path
export function roundPath(poly, r = 14) {
  const n = poly.length, pts = [];
  for (let i = 0; i < n; i++) {
    const p = poly[i], a = poly[(i + n - 1) % n], b = poly[(i + 1) % n], la = Math.hypot(a[0] - p[0], a[1] - p[1]), lb = Math.hypot(b[0] - p[0], b[1] - p[1]), k = Math.min(r, la / 2.2, lb / 2.2);
    pts.push([[p[0] + ((a[0] - p[0]) * k) / la, p[1] + ((a[1] - p[1]) * k) / la], p, [p[0] + ((b[0] - p[0]) * k) / lb, p[1] + ((b[1] - p[1]) * k) / lb]]);
  }
  const f = (q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
  return `M${f(pts[0][2])}` + pts.slice(1).map(([s, c, e]) => `L${f(s)}Q${f(c)} ${f(e)}`).join("") + `L${f(pts[0][0])}Q${f(pts[0][1])} ${f(pts[0][2])}Z`;
}

const WALLS = ["#f4e1c1", "#f7c59f", "#e9d8a6", "#fde2e4"], ROOFS = ["#c0504d", "#8c4a2f", "#d9822b", "#7b5ea7"];
function house(g, x, y, k) {
  const h = el("g", { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` }, g);
  el("rect", { x: -8, y: -7, width: 16, height: 12, rx: 1.5, fill: WALLS[k % 4], stroke: "#5b4636", "stroke-width": 1.2 }, h);
  el("path", { d: "M-10 -6L0 -15L10 -6Z", fill: ROOFS[(k * 3) % 4], stroke: "#5b4636", "stroke-width": 1.2, "stroke-linejoin": "round" }, h);
  el("rect", { x: -2, y: -1, width: 4, height: 6, fill: "#6b4423" }, h);
}
function tree(g, x, y, k) {
  const t = el("g", { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` }, g);
  el("rect", { x: -1.6, y: 0, width: 3.2, height: 6, fill: "#6b4423" }, t);
  el("circle", { cy: -4, r: 8 + (k % 3), fill: k % 2 ? "#3f8f4a" : "#4fa35a", stroke: "#2d6b36", "stroke-width": 1.2 }, t);
}
function cathedral(g, x, y) {
  const c = el("g", { transform: `translate(${x} ${y})` }, g);
  el("rect", { x: -20, y: -10, width: 34, height: 18, rx: 1.5, fill: "#efe3cf", stroke: "#5b4636", "stroke-width": 1.3 }, c);
  el("path", { d: "M-22 -10L-3 -20L16 -10Z", fill: "#a0442f", stroke: "#5b4636", "stroke-width": 1.3, "stroke-linejoin": "round" }, c);
  el("rect", { x: 14, y: -24, width: 10, height: 32, fill: "#efe3cf", stroke: "#5b4636", "stroke-width": 1.3 }, c);
  el("path", { d: "M12 -24L19 -38L26 -24Z", fill: "#4c7a6a", stroke: "#5b4636", "stroke-width": 1.3 }, c);
  el("path", { d: "M-1 8v-8a3 3 0 0 1 6 0v8", fill: "#6b4423" }, c);
}

// Draws the town into svg. Returns the handles the activity and the solution animate:
// { water, lands: [{ g, shape }], signs: [g], bridges: [{ g, body, done, cross, hit }], layer } where layer is a group above the map.
export function drawTown(svg, city, names, uid = "kb") {
  const defs = el("defs", {}, svg), gr = el("linearGradient", { id: `${uid}-w`, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  [[0, "#86cdf3"], [1, "#3f8fcf"]].forEach(([o, col]) => el("stop", { offset: o, "stop-color": col }, gr));
  const water = el("g", {}, svg);
  el("rect", { width: city.W, height: city.H, fill: `url(#${uid}-w)` }, water);
  for (let i = 0; i < 16; i++) el("path", { d: `M${(i * 97) % city.W} ${20 + ((i * 71) % (city.H - 30))} q8 -5 16 0 t16 0`, fill: "none", stroke: "#fff", "stroke-width": 1.5, opacity: 0.45, "stroke-linecap": "round", class: "sc-wave", style: `--d:${(i % 5) * 0.4}s` }, water);
  const landLayer = el("g", {}, svg);
  const lands = city.lands.map((poly, v) => {
    const g = el("g", { "data-land": v }, landLayer), d = roundPath(poly);
    el("path", { d, fill: "#ead9a2", stroke: "#ead9a2", "stroke-width": 9, "stroke-linejoin": "round" }, g);
    const shape = el("path", { d, fill: "#9fd27a", stroke: "#7fb85c", "stroke-width": 1.5 }, g);
    const deco = el("g", { "pointer-events": "none" }, g);
    city.deco[v].forEach(([kind, x, y], k) => (kind === "h" ? house(deco, x, y, k + v) : kind === "t" ? tree(deco, x, y, k + v) : cathedral(deco, x, y)));
    return { g, shape };
  });
  const bridgeLayer = el("g", {}, svg);
  const bridges = city.bridges.map((br) => {
    const g = el("g", { "data-bridge": "" }, bridgeLayer), L = br.span + 18, [mx, my] = br.mid;
    const body = el("g", { transform: `translate(${mx.toFixed(1)} ${my.toFixed(1)}) rotate(${br.angle.toFixed(1)})` }, g);
    const hit = el("rect", { x: -Math.max(L, HIT) / 2, y: -HIT / 2, width: Math.max(L, HIT), height: HIT, fill: "transparent" }, body);
    el("rect", { x: -L / 2, y: -7, width: L, height: 18, rx: 3, fill: "#1d3b5a", opacity: 0.25 }, body);
    el("rect", { x: -L / 2, y: -9, width: L, height: 18, rx: 3, fill: "#c08a52", stroke: "#5a3a1c", "stroke-width": 1.6 }, body);
    let planks = ""; for (let x = -L / 2 + 5; x < L / 2 - 2; x += 5.5) planks += `M${x.toFixed(1)} -8V8`;
    el("path", { d: planks, stroke: "#8a5a2e", "stroke-width": 1.1 }, body);
    el("path", { d: `M${-L / 2} -9H${L / 2}M${-L / 2} 9H${L / 2}`, stroke: "#5a3a1c", "stroke-width": 3, "stroke-linecap": "round" }, body);
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sy]) => el("circle", { cx: (sx * L) / 2, cy: sy * 9, r: 2.6, fill: "#5a3a1c" }, body));
    const done = el("rect", { x: -L / 2 + 2, y: -3.5, width: L - 4, height: 7, rx: 3.5, fill: "#5fd0a0", stroke: "#1f7a52", "stroke-width": 1, opacity: 0 }, body);
    const cross = el("text", { x: mx, y: my + 9, "text-anchor": "middle", opacity: 0, "pointer-events": "none", style: "font:700 28px var(--body);fill:#ff4d4d;paint-order:stroke;stroke:#fff;stroke-width:3px" }, g);
    cross.textContent = "×";
    return { g, body, done, cross, hit, L };
  });
  const signs = city.spots.map((s, v) => {
    const g = el("g", { transform: `translate(${s.label[0].toFixed(1)} ${s.label[1].toFixed(1)})`, "pointer-events": "none" }, svg);
    el("circle", { r: 15, fill: "#fffdf5", stroke: "#3b2a1a", "stroke-width": 2 }, g);
    el("text", { y: 7, "text-anchor": "middle", style: "font:700 20px var(--body);fill:#3b2a1a" }, g).textContent = names[v];
    return g;
  });
  const layer = el("g", {}, svg);
  return { water, lands, bridges, signs, layer };
}
