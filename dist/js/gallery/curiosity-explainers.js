// Animated, cartoon-like explanations of the open curiosities (questions the site does not check). Each one is a
// solution definition for the challenges' player (`challenges/common/player.js`): { size, steps(), draw(c, step, p) },
// a pure function of the step and of the progress p in [0, 1], so every frame can be replayed and tested. The drawings
// reuse the exhibits' own models: the sofa motions (gallery-sofa-model.js, Gerver's data), the hat patch
// (gallery-hat-model.js), the Penrose room and its ray tracer (illumination-*.js); the pendulums and the three bodies
// are integrated here (RK4 and leapfrog) once, on first use. Loaded on demand by app.js when "Comprendre la réponse"
// is opened.
import { playSolution } from "../challenges/common/player.js";
import { svgEl } from "../challenges/common/kit.js";
import { hammersley, hammersleyPose, gerverPose, HAMMERSLEY_R, RECORDS, centroid } from "./gallery-sofa-model.js";
import { GERVER } from "./gallery-sofa-gerver.js";
import { coordinatePatch, tileOutline } from "./gallery-hat-model.js";
import { trace, flatten } from "../illumination-model.js";
import { PENROSE, TOKARSKY } from "../illumination-presets.js";

const P = (fr, en) => [fr, en];
const W = 520, H = 300, INK = "var(--ink)";
const cl = (x) => Math.max(0, Math.min(1, x)), ez = (x) => 1 - (1 - cl(x)) ** 3, seg = (p, a, b) => cl((p - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };
const d = (pts, close = true) => "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L") + (close ? " Z" : "");
const OUT = { stroke: INK, "stroke-width": 2.2, "stroke-linejoin": "round", "stroke-linecap": "round" };
const poly = (c, pts, attrs = {}) => c.path(d(pts), { ...OUT, ...attrs });
const say = (c, x, y, s, size = 15, attrs = {}) => c.text(x, y, s, { "font-size": size, "font-weight": 700, fill: INK, "text-anchor": "middle", ...attrs });
const bg = (c, fill) => c.rect(0, 0, W, H, { fill });
const ellipse = (c, cx, cy, rx, ry, attrs) => svgEl("ellipse", { cx, cy, rx, ry, ...attrs }, c.svg);

// A cartoon face of size s centred at (x, y): two eyes looking in direction `look`, pink cheeks, a mouth for the mood.
function face(c, x, y, s, { mood = "smile", look = [0, 0], blink = 0 } = {}) {
  for (const ex of [-0.33, 0.33]) {
    ellipse(c, x + ex * s, y - 0.12 * s, 0.17 * s, 0.21 * s * (1 - 0.9 * blink), { fill: "#fff", stroke: INK, "stroke-width": 1.4 });
    if (blink < 0.5) c.circ(x + ex * s + 0.07 * s * look[0], y - 0.1 * s + 0.07 * s * look[1], 0.085 * s, { fill: "#1d1d1d" });
  }
  for (const cx of [-0.55, 0.55]) ellipse(c, x + cx * s, y + 0.12 * s, 0.12 * s, 0.07 * s, { fill: "#ff7b7b", opacity: 0.5 });
  const m = { stroke: INK, "stroke-width": 1.8, "stroke-linecap": "round", fill: "none" };
  if (mood === "o") ellipse(c, x, y + 0.22 * s, 0.09 * s, 0.11 * s, { fill: "#7a2e2e", stroke: INK, "stroke-width": 1.4 });
  else if (mood === "sad") c.path(`M${x - 0.2 * s} ${y + 0.3 * s} q${0.2 * s} ${-0.16 * s} ${0.4 * s} 0`, m);
  else if (mood === "flat") c.path(`M${x - 0.16 * s} ${y + 0.24 * s} h${0.32 * s}`, m);
  else if (mood === "grin") c.path(`M${x - 0.24 * s} ${y + 0.14 * s} q${0.24 * s} ${0.3 * s} ${0.48 * s} 0 Z`, { ...m, fill: "#7a2e2e" });
  else c.path(`M${x - 0.22 * s} ${y + 0.16 * s} q${0.22 * s} ${0.2 * s} ${0.44 * s} 0`, m);
}
const arrow = (c, x1, y1, x2, y2, colour = INK, w = 2.4) => {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 8;
  c.line(x1, y1, x2, y2, { stroke: colour, "stroke-width": w, "stroke-linecap": "round" });
  c.path(`M${x2} ${y2} L${x2 - h * Math.cos(a - 0.45)} ${y2 - h * Math.sin(a - 0.45)} L${x2 - h * Math.cos(a + 0.45)} ${y2 - h * Math.sin(a + 0.45)} Z`, { fill: colour });
};
const once = (make) => { let v; return () => (v ??= make()); };

/* ------------------------------------------------------------------ soap films */
const soapP = (x, y, z) => [250 + 125 * x + 55 * y, 165 + 42 * y - 80 * z];
function film(c, zf) {
  const edges = [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]], bd = [];
  for (const [x0, y0, x1, y1] of edges) for (let i = 0; i < 12; i++) { const t = i / 12, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; bd.push(soapP(x, y, zf(x, y))); }
  c.path(d(bd), { fill: "color-mix(in srgb, #9fd8ff 40%, transparent)", stroke: "none" });
  for (let i = 1; i < 8; i++) {
    const u = -1 + i / 4, row = [], col = [];
    for (let j = 0; j <= 16; j++) { const v = -1 + j / 8; row.push(soapP(u, v, zf(u, v))); col.push(soapP(v, u, zf(v, u))); }
    c.path(d(row, false), { fill: "none", stroke: "#4ea3e0", "stroke-width": 1, opacity: 0.55 });
    c.path(d(col, false), { fill: "none", stroke: "#4ea3e0", "stroke-width": 1, opacity: 0.55 });
  }
  c.path(d(bd), { fill: "none", stroke: INK, "stroke-width": 5, "stroke-linejoin": "round" });
  c.path(d(bd), { fill: "none", stroke: "#d4a017", "stroke-width": 2.6, "stroke-linejoin": "round" });
}
const CATENOID_R = 55, catenoidA = (half) => { let lo = 1.2 * half, hi = 200; if (lo * Math.cosh(half / lo) > CATENOID_R) return null; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (m * Math.cosh(half / m) > CATENOID_R) hi = m; else lo = m; } return lo; };
const soap = {
  size: [W, H], dur: (s) => (s === 4 ? 4200 : 3200),
  steps: () => [
    P("Un cadre plat trempé dans l’eau savonneuse. Soufflons : le film se bombe.", "A flat frame dipped in soapy water. Blow: the film bulges."),
    P("Lâché, il revient à plat : la tension tire sur chaque petit morceau tant que l’aire peut encore diminuer.", "Released, it goes back flat: tension pulls on every small piece as long as the area can still shrink."),
    P("Tordons le cadre : deux coins montent, deux descendent. Aucun plan ne passe par tout le bord : le film devient une selle.", "Twist the frame: two corners go up, two go down. No plane fits the whole edge: the film becomes a saddle."),
    P("En chaque point, il se courbe vers le haut dans une direction et vers le bas dans l’autre, autant : courbure moyenne nulle. C’est la marque d’une surface minimale.", "At every point it bends up in one direction and down in the other, by the same amount: zero mean curvature. That is the mark of a minimal surface."),
    P("Deux anneaux proches : le film fait un tube creusé. Écartons-les : le tube casse, il reste deux disques. Un même bord peut porter plusieurs films stables.", "Two close rings: the film makes a waisted tube. Pull them apart: the tube snaps, two discs remain. One boundary can carry several stable films."),
  ],
  draw(c, s, p) {
    bg(c, "color-mix(in srgb, #e8f6ff 70%, var(--surface))");
    if (s <= 1) {
      const b = s === 0 ? 0.6 * ez(seg(p, 0.1, 0.7)) : 0.6 * (1 - ez(p)), zf = (x, y) => b * (1 - x * x) * (1 - y * y);
      film(c, zf);
      if (s === 1 && b > 0.05) for (const [x, y] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) { const [x1, y1] = soapP(x, y, 0), [x2, y2] = soapP(x * 0.55, y * 0.55, zf(x * 0.55, y * 0.55)); arrow(c, x1, y1, lerp(x1, x2, 0.75), lerp(y1, y2, 0.75), "#e76f51"); }
      const [fx, fy] = soapP(0, 0, zf(0, 0)); face(c, fx, fy - 6, 34, { mood: b > 0.3 ? "o" : "smile" });
      say(c, 460, 50, s === 0 ? "aire ↑" : "aire ↓", 20, { fill: s === 0 ? "#e76f51" : "#2a9d8f" });
      return;
    }
    if (s <= 3) {
      const k = s === 2 ? 0.7 * ez(p) : 0.7, zf = (x, y) => k * x * y;
      film(c, zf);
      if (s === 3) {
        const n = Math.max(2, Math.round(24 * ez(p))), up = [], down = [];
        for (let i = 0; i <= n; i++) { const t = -1 + (2 * i) / 24; up.push(soapP(t, t, zf(t, t))); down.push(soapP(t, -t, zf(t, -t))); }
        c.path(d(up, false), { fill: "none", stroke: "#e63946", "stroke-width": 4.5, "stroke-linecap": "round" });
        c.path(d(down, false), { fill: "none", stroke: "#1d70b8", "stroke-width": 4.5, "stroke-linecap": "round" });
        if (p > 0.7) { say(c, 455, 40, c.t("vers le haut", "upwards"), 15, { fill: "#e63946" }); say(c, 455, 62, c.t("vers le bas", "downwards"), 15, { fill: "#1d70b8" }); say(c, 455, 88, c.t("autant !", "same amount!"), 17); }
      }
      const [fx, fy] = soapP(0, 0, 0); face(c, fx, fy - 6, 34, { mood: s === 2 && p < 0.6 ? "o" : "grin", look: [0.5, 0] });
      return;
    }
    // two rings: a catenoid while they are close enough, two discs once it snaps
    const half = 26 + 40 * ez(seg(p, 0.15, 0.85)), a = catenoidA(half), cx = 260, cy = 160, R = CATENOID_R;
    if (a) {
      const top = [], bot = [];
      for (let i = 0; i <= 30; i++) { const x = -half + (2 * half * i) / 30, y = a * Math.cosh(x / a); top.push([cx + x, cy - y]); bot.push([cx + x, cy + y]); }
      c.path(d([...top, ...bot.reverse()]), { fill: "color-mix(in srgb, #9fd8ff 45%, transparent)", stroke: "#4ea3e0", "stroke-width": 1.5 });
      face(c, cx, cy, 30, { mood: half > 33 ? "o" : "smile" });
    } else {
      for (const sx of [-1, 1]) ellipse(c, cx + sx * half, cy, 12, R, { fill: "color-mix(in srgb, #9fd8ff 55%, transparent)", stroke: "#4ea3e0", "stroke-width": 1.5 });
      face(c, cx - half, cy, 18, { mood: "grin" }); face(c, cx + half, cy, 18, { mood: "grin" });
      say(c, cx, cy + 4, "pop !", 18, { fill: "#e76f51" });
    }
    for (const sx of [-1, 1]) { ellipse(c, cx + sx * half, cy, 12, R, { fill: "none", stroke: INK, "stroke-width": 5 }); ellipse(c, cx + sx * half, cy, 12, R, { fill: "none", stroke: "#d4a017", "stroke-width": 2.6 }); }
  },
};

/* ------------------------------------------------------------------ the hat (Einstein tile) */
const hatData = once(() => {
  const tiles = coordinatePatch(1, Math.sqrt(3), 2), all = tiles.flatMap((t) => t.vertices);
  const xs = all.map((v) => v[0]), ys = all.map((v) => v[1]), mx = (Math.min(...xs) + Math.max(...xs)) / 2, my = (Math.min(...ys) + Math.max(...ys)) / 2;
  const k = Math.min(500 / (Math.max(...xs) - Math.min(...xs)), 290 / (Math.max(...ys) - Math.min(...ys))) * 1.35;
  const map = ([x, y]) => [260 + (x - mx) * k, 150 - (y - my) * k];
  const shaped = tiles.map((t, i) => { const v = t.vertices.map(map), cx = v.reduce((s, q) => s + q[0], 0) / v.length, cy = v.reduce((s, q) => s + q[1], 0) / v.length; return { v, cx, cy, reflected: t.reflected, i }; });
  shaped.sort((a, b) => Math.hypot(a.cx - 260, a.cy - 150) - Math.hypot(b.cx - 260, b.cy - 150));
  return { tiles: shaped, k };
});
const HAT_COLOURS = ["#8ecae6", "#90be6d", "#f9c74f"];
const kite = [[0, 0], [Math.cos(Math.PI / 5), Math.sin(Math.PI / 5)], [1, 0], [Math.cos(Math.PI / 5), -Math.sin(Math.PI / 5)]];
const dart = [[0, 0], [Math.cos(Math.PI / 5), Math.sin(Math.PI / 5)], [2 * Math.cos(Math.PI / 5) - 1, 0], [Math.cos(Math.PI / 5), -Math.sin(Math.PI / 5)]];
const hat = {
  size: [W, H], dur: () => 3400,
  steps: () => [
    P("Le « chapeau », trouvé en 2023 : un seul polygone, à 13 côtés.", "The “hat”, found in 2023: one single polygon, with 13 sides."),
    P("Ses copies, tournées, s’emboîtent et recouvrent le plan : sans trou, sans chevauchement.", "Its copies, turned, fit together and cover the plane: no gap, no overlap."),
    P("Les copies orange sont retournées, comme une crêpe : c’est toujours la même forme.", "The orange copies are flipped over, like a pancake: it is still the same shape."),
    P("Faisons glisser une copie du pavage : quel que soit le glissement, elle ne retombe jamais exactement sur l’original. Le pavage n’est jamais périodique (c’est le théorème de 2023).", "Slide a copy of the tiling: whatever the shift, it never lands exactly on the original. The tiling is never periodic (that is the 2023 theorem)."),
    P("Avant 2023, il fallait au moins deux formes, comme le cerf-volant et la fléchette de Penrose. Le « spectre », cousin du chapeau, se passe même des copies retournées.", "Before 2023 at least two shapes were needed, like Penrose’s kite and dart. The “spectre”, a cousin of the hat, even does without flipped copies."),
  ],
  draw(c, s, p) {
    bg(c, "color-mix(in srgb, #fff6e0 70%, var(--surface))");
    const { tiles } = hatData(), fill = (t) => (t.reflected ? "#f4a259" : HAT_COLOURS[t.i % 3]);
    if (s === 0) {
      const v = tileOutline(1, Math.sqrt(3)), cx = v.reduce((a, q) => a + q[0], 0) / v.length, cy = v.reduce((a, q) => a + q[1], 0) / v.length, sc = 34 * (0.6 + 0.4 * ez(p)), wob = 0.12 * Math.sin(p * Math.PI * 4) * (1 - p);
      const pts = v.map(([x, y]) => { const u = x - cx, w = y - cy; return [260 + sc * (u * Math.cos(wob) - w * Math.sin(wob)), 150 - sc * (u * Math.sin(wob) + w * Math.cos(wob))]; });
      poly(c, pts, { fill: HAT_COLOURS[0], "stroke-width": 3 });
      face(c, 262, 150, 34, { mood: p > 0.5 ? "grin" : "smile" });
      if (p > 0.6) say(c, 430, 70, c.t("13 côtés", "13 sides"), 18);
      return;
    }
    const n = s === 1 ? Math.max(1, Math.ceil(tiles.length * ez(p))) : tiles.length;
    tiles.slice(0, n).forEach((t, j) => {
      const pop = s === 1 && j === n - 1 ? 0.75 + 0.25 * ez((p * tiles.length) % 1) : 1;
      const v = pop === 1 ? t.v : t.v.map(([x, y]) => [t.cx + (x - t.cx) * pop, t.cy + (y - t.cy) * pop]);
      const dim = s === 2 && !t.reflected ? 0.35 + 0.65 * (1 - ez(p)) : 1;
      poly(c, v, { fill: fill(t), "stroke-width": 1.4, opacity: dim });
    });
    if (s === 2) tiles.filter((t) => t.reflected).forEach((t) => face(c, t.cx, t.cy, 12 + 3 * Math.sin(p * 12), { mood: "grin" }));
    if (s === 3) {
      const ang = p * Math.PI * 1.5, r = 60 * Math.sin(p * Math.PI) + 10, dx = r * Math.cos(ang), dy = r * Math.sin(ang);
      tiles.forEach((t) => c.path(d(t.v.map(([x, y]) => [x + dx, y + dy])), { fill: "none", stroke: "#d62828", "stroke-width": 1.4, "stroke-dasharray": "4 3" }));
      c.rect(150, 10, 220, 30, { fill: "var(--surface)", rx: 8, opacity: 0.9 }); say(c, 260, 31, c.t("ça ne recolle jamais", "it never matches"), 18, { fill: "#d62828" });
    }
    if (s === 4) {
      c.rect(0, 0, W, H, { fill: "var(--surface)", opacity: 0.82 * ez(p) });
      if (p > 0.15) {
        const k = 70, at = (shape, x0, y0) => shape.map(([x, y]) => [x0 + k * x, y0 - k * y]);
        poly(c, at(kite, 40, 140), { fill: "#8ecae6" }); poly(c, at(dart, 40, 230), { fill: "#f4a259" });
        say(c, 100, 60, "Penrose : 2", 18);
        const v = tileOutline(1, Math.sqrt(3)), cx = v.reduce((a, q) => a + q[0], 0) / v.length, cy = v.reduce((a, q) => a + q[1], 0) / v.length;
        poly(c, v.map(([x, y]) => [380 + 30 * (x - cx), 165 - 30 * (y - cy)]), { fill: HAT_COLOURS[1], "stroke-width": 2.6 });
        face(c, 382, 165, 30, { mood: "grin" }); say(c, 380, 60, c.t("2023 : 1 forme", "2023: 1 shape"), 18);
      }
    }
  },
};

/* ------------------------------------------------------------------ the moving sofa */
const SU = 58, SX = 222, SY = 44;   // hallway units to pixels: y = 1 at the top, the vertical arm leaves downwards
const sofaPx = ([x, y]) => [SX + SU * x, SY + SU * (1 - y)];
const gerverOutline = once(() => GERVER.outline.filter((_, i) => i % 6 === 0));
const halfDisc = hammersley(0), hammer = hammersley(HAMMERSLEY_R);
function hallway(c) {
  bg(c, "color-mix(in srgb, #f1e3c8 60%, var(--surface))");
  const floor = [[-3.8, 1], [1, 1], [1, -2.4], [0, -2.4], [0, 0], [-3.8, 0]].map(sofaPx);
  poly(c, floor, { fill: "color-mix(in srgb, #fff 70%, var(--surface))", stroke: "none" });
  c.path(d([[-3.8, 1], [1, 1], [1, -2.4]].map(sofaPx), false), { ...OUT, fill: "none", "stroke-width": 5 });
  c.path(d([[-3.8, 0], [0, 0], [0, -2.4]].map(sofaPx), false), { ...OUT, fill: "none", "stroke-width": 5 });
}
function drawSofa(c, shape, pose, colour, mood) {
  const co = Math.cos(pose.a), si = Math.sin(pose.a), placed = shape.map(([u, v]) => [pose.x + co * u - si * v, pose.y + si * u + co * v]);
  poly(c, placed.map(sofaPx), { fill: colour, "stroke-width": 2.6 });
  const [gx, gy] = sofaPx(centroid(placed)); face(c, gx, gy, 24, { mood });
}
const sofaBars = (c, upto, p) => {
  const bars = [[c.t("demi-disque", "half disc"), Math.PI / 2, "#8ecae6"], ["Hammersley", RECORDS.hammersley, "#90be6d"], ["Gerver", RECORDS.gerver, "#f4a259"], [c.t("plafond connu", "known ceiling"), RECORDS.upper, "#ccc"]];
  bars.slice(0, upto).forEach(([name, a, col], i) => {
    const y = 60 + i * 52, w = 140 * (a / 2.4) * (i === upto - 1 ? ez(p) : 1);
    c.rect(346, y, w, 24, { fill: col, stroke: INK, "stroke-width": 1.6, rx: 6 });
    c.text(346, y - 6, `${name} ${String(+a.toFixed(4)).replace(".", c.t(",", "."))}`, { "font-size": 13, "font-weight": 700, fill: INK });
  });
};
const sofa = {
  size: [W, H], dur: (s) => (s === 3 ? 3600 : 5200),
  steps: () => [
    P("Un demi-disque de rayon 1 passe : il glisse, tourne sur place autour du coin intérieur, et repart. Aire π/2 ≈ 1,57.", "A half disc of radius 1 gets through: it slides, turns on the spot around the inner corner, and leaves. Area π/2 ≈ 1.57."),
    P("Hammersley (1968) le coupe en deux et glisse entre les moitiés un bloc creusé d’un demi-cercle : il passe encore. Aire π/2 + 2/π ≈ 2,2074.", "Hammersley (1968) cuts it in two and slips between the halves a block hollowed out by a half circle: it still gets through. Area π/2 + 2/π ≈ 2.2074."),
    P("Gerver (1992) arrondit les bords en 18 morceaux de courbes : aire ≈ 2,2195. Personne n’a trouvé mieux.", "Gerver (1992) rounds the edges with 18 pieces of curves: area ≈ 2.2195. Nobody has found better."),
    P("On sait qu’aucun canapé ne dépasse 2,37. En 2024, Jineon Baek a annoncé une preuve que Gerver est le maximum ; elle est en cours de vérification.", "No sofa can exceed 2.37. In 2024 Jineon Baek announced a proof that Gerver’s sofa is the maximum; it is being checked."),
  ],
  draw(c, s, p) {
    hallway(c);
    const sp = 3 * p;
    if (s === 0) drawSofa(c, halfDisc, hammersleyPose(0, sp), "#8ecae6", sp > 1 && sp < 2 ? "o" : "smile");
    if (s === 1) drawSofa(c, hammer, hammersleyPose(HAMMERSLEY_R, sp), "#90be6d", sp > 1 && sp < 2 ? "o" : "grin");
    if (s === 2) drawSofa(c, gerverOutline(), gerverPose(GERVER.path, sp), "#f4a259", sp > 1 && sp < 2 ? "o" : "grin");
    if (s === 3) drawSofa(c, gerverOutline(), gerverPose(GERVER.path, 1), "#f4a259", "grin");
    sofaBars(c, s + 1, s === 3 ? p : 1);
  },
};

/* ------------------------------------------------------------------ cutting and regluing */
const EU = 46, EX = 40, EY = 250, ep = ([x, y]) => [EX + EU * x, EY - EU * y];
const rot180 = ([x, y], [mx, my], t) => { const a = Math.PI * t, co = Math.cos(a), si = Math.sin(a), u = x - mx, v = y - my; return [mx + co * u - si * v, my + si * u + co * v]; };
const equi = {
  size: [W, H], dur: () => 3400,
  steps: () => [
    P("Un triangle. Peut-on le découper et recoller les morceaux en un rectangle ?", "A triangle. Can it be cut and the pieces reglued into a rectangle?"),
    P("On coupe à mi-hauteur, puis on coupe le petit triangle du haut par sa hauteur.", "Cut at half height, then cut the small top triangle along its height."),
    P("Chaque petit morceau pivote d’un demi-tour autour du milieu d’un côté : voilà un rectangle, de même aire.", "Each small piece swings half a turn around the midpoint of a side: here is a rectangle, with the same area."),
    P("Tout rectangle se recoupe en un rectangle de largeur fixée, et tout polygone se découpe en triangles. Deux polygones de même aire arrivent donc au même rectangle : on va de l’un à l’autre en passant par lui.", "Any rectangle can be recut into a rectangle of a set width, and any polygon cuts into triangles. Two polygons of the same area reach the same rectangle: go from one to the other through it."),
    P("En dimension 3, c’est faux : un cube et un tétraèdre de même volume ne se découpent pas l’un en l’autre (Dehn, 1900).", "In three dimensions it is false: a cube and a tetrahedron of the same volume cannot be cut into each other (Dehn, 1900)."),
  ],
  draw(c, s, p) {
    bg(c, "color-mix(in srgb, #f0f7e8 70%, var(--surface))");
    const b = 5, cx = 1.6, h = 4, A = [0, 0], B = [b, 0], C = [cx, h], M1 = [cx / 2, h / 2], M2 = [(b + cx) / 2, h / 2], F = [cx, h / 2];
    if (s <= 2) {
      const t = s === 2 ? ez(p) : 0;
      poly(c, [A, B, M2, M1].map(ep), { fill: "#90be6d" });
      poly(c, [M1, F, C].map((q) => rot180(q, M1, t)).map(ep), { fill: "#f9c74f" });
      poly(c, [F, M2, C].map((q) => rot180(q, M2, -t)).map(ep), { fill: "#f4a259" });
      if (s === 1) { const k = ez(p); c.line(...ep(M1), ...ep([lerp(M1[0], M2[0], k), h / 2]), { stroke: "#d62828", "stroke-width": 3, "stroke-dasharray": "6 4" }); if (p > 0.5) c.line(...ep(C), ...ep([cx, lerp(h, h / 2, ez(seg(p, 0.5, 1)))]), { stroke: "#d62828", "stroke-width": 3, "stroke-dasharray": "6 4" }); }
      if (s === 2) for (const m of [M1, M2]) c.circ(...ep(m), 5, { fill: "#d62828" });
      face(c, ...ep([b / 2, 0.9]), 30, { mood: s === 2 && p > 0.8 ? "grin" : s === 1 ? "o" : "smile" });
      say(c, 420, 80, c.t("aire", "area") + " = 10", 20);
      if (s === 2 && p > 0.8) say(c, 420, 110, `5 × 2 = 10 ✓`, 18, { fill: "#2a9d8f" });
      return;
    }
    if (s === 3) {
      const k = ez(p), r1 = [lerp(5, 2.5, k), lerp(2, 4, k)], r2 = [lerp(Math.sqrt(10), 2.5, k), lerp(Math.sqrt(10), 4, k)];
      poly(c, [[0, 0], [r1[0], 0], r1, [0, r1[1]]].map(ep), { fill: "#90be6d" });
      poly(c, [[0, 0], [r2[0], 0], r2, [0, r2[1]]].map(([x, y]) => [x + 5.6, y]).map(ep), { fill: "#8ecae6" });
      face(c, ...ep([r1[0] / 2, r1[1] / 2]), 24, { mood: k > 0.9 ? "grin" : "smile" }); face(c, ...ep([5.6 + r2[0] / 2, r2[1] / 2]), 24, { mood: k > 0.9 ? "grin" : "smile" });
      if (k > 0.9) say(c, 260, 40, c.t("le même rectangle !", "the same rectangle!"), 19, { fill: "#2a9d8f" });
      return;
    }
    // cube and tetrahedron in line drawing
    const q = (x, y, z) => [130 + 70 * (x - 0.6 * z), 220 - 70 * (y + 0.35 * z)];
    const cube = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    poly(c, [0, 1, 2, 3].map((i) => q(...cube[i])), { fill: "#8ecae6" }); poly(c, [1, 5, 6, 2].map((i) => q(...cube[i])), { fill: "#6fb1d6" }); poly(c, [3, 2, 6, 7].map((i) => q(...cube[i])), { fill: "#b9e0f2" });
    E.forEach(([i, j]) => c.line(...q(...cube[i]), ...q(...cube[j]), { stroke: INK, "stroke-width": 2 }));
    const T = [[360, 230], [470, 230], [420, 205], [418, 110]];
    poly(c, [T[0], T[1], T[3]], { fill: "#f4a259" }); poly(c, [T[1], T[2], T[3]], { fill: "#e07b39" });
    face(c, 165, 180, 28, { mood: "flat" }); face(c, 415, 195, 24, { mood: "flat" });
    say(c, 290, 160, "≠", 60 * (0.5 + 0.5 * ez(p)), { fill: "#d62828" });
  },
};

/* ------------------------------------------------------------------ Banach-Tarski */
const btDots = once(() => {
  const r = rng(7), dots = [];
  while (dots.length < 220) { const x = 2 * r() - 1, y = 2 * r() - 1; if (x * x + y * y > 1) continue; const k = Math.floor(r() * 5); let tx, ty; do { tx = 2 * r() - 1; ty = 2 * r() - 1; } while (tx * tx + ty * ty > 1); dots.push({ x, y, k, tx, ty }); }
  return dots;
});
const BT_COL = ["#e63946", "#f4a259", "#2a9d8f", "#457b9d", "#9b5de5"], BT_DIR = [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 1.3]];
const banach = {
  size: [W, H], dur: () => 3400,
  steps: () => [
    P("Une boule pleine de points. On la découpe en cinq morceaux…", "A ball full of points. Cut it into five pieces…"),
    P("… mais pas au couteau : chaque morceau est un nuage de points éparpillés partout, si dispersé qu’on ne peut pas lui donner de volume.", "… but not with a knife: each piece is a cloud of points scattered everywhere, so spread out that it cannot be given a volume."),
    P("On les déplace et on les tourne, sans les déformer : ils forment deux boules identiques à la première ! (Banach et Tarski, 1924, grâce à l’axiome du choix.)", "Move and turn them, without stretching: they form two balls identical to the first! (Banach and Tarski, 1924, thanks to the axiom of choice.)"),
    P("Avec des morceaux ordinaires, découpés au couteau, impossible : déplacer ne change pas le volume, deux moitiés ne font qu’une boule.", "With ordinary pieces, cut with a knife, impossible: moving does not change volume, two halves make only one ball."),
    P("Et avec un nombre fini de points ? On les déplace sans copie : il en reste toujours 12. Le paradoxe ne vit que dans l’infini.", "And with finitely many points? Move them without copying: there are always 12 left. The paradox lives only in the infinite."),
  ],
  draw(c, s, p) {
    bg(c, "color-mix(in srgb, #f3eefe 70%, var(--surface))");
    const R = 78, O = [130, 150], B1 = [300, 150], B2 = [430, 150], r2 = 62;
    if (s <= 2) {
      const spread = s === 0 ? 0 : s === 1 ? ez(p) : 1, gather = s === 2 ? ez(p) : 0;
      if (s === 0 || (s === 1 && p < 0.3)) c.circ(...O, R, { fill: "color-mix(in srgb, #cdb4db 40%, transparent)", ...OUT, opacity: s === 1 ? 1 - p / 0.3 : 1 });
      for (const q of btDots()) {
        const [dx, dy] = BT_DIR[q.k], x0 = O[0] + R * q.x + 60 * spread * dx, y0 = O[1] + R * q.y + 45 * spread * dy;
        const tgt = q.k < 2 ? B1 : B2, x1 = tgt[0] + r2 * q.tx, y1 = tgt[1] + r2 * q.ty;
        c.circ(lerp(x0, x1, gather), lerp(y0, y1, gather), 2.6, { fill: BT_COL[q.k] });
      }
      if (s === 0) face(c, O[0], O[1], 40, { mood: "smile" });
      if (s === 2 && p > 0.85) { for (const b of [B1, B2]) { c.circ(...b, r2, { fill: "none", ...OUT }); face(c, b[0], b[1], 30, { mood: "o" }); } }
      return;
    }
    if (s === 3) {
      const k = ez(p), half = (a0) => { const pts = []; for (let i = 0; i <= 24; i++) { const a = a0 + (Math.PI * i) / 24; pts.push([R * Math.cos(a), R * Math.sin(a)]); } return pts; };
      poly(c, half(Math.PI / 2).map(([x, y]) => [O[0] + x, O[1] + y]), { fill: "#cdb4db" });
      poly(c, half(-Math.PI / 2).map(([x, y]) => [O[0] + 6 + x + 200 * k, O[1] + y]), { fill: "#cdb4db" });
      say(c, 300, 270, c.t("V/2 + V/2 = V, jamais 2V", "V/2 + V/2 = V, never 2V"), 18);
      face(c, O[0] - 38, O[1], 24, { mood: "flat" }); face(c, O[0] + 44 + 200 * k, O[1], 24, { mood: "flat" });
      // a knife
      c.path(`M${O[0] - 1} 40 l8 0 l0 220 l-8 -14 Z`, { fill: "#cfd6dc", ...OUT, opacity: 1 - k });
      return;
    }
    const r = rng(11), from = Array.from({ length: 12 }, (_, i) => [130 + 60 * Math.cos((i * Math.PI) / 6), 150 + 60 * Math.sin((i * Math.PI) / 6)]);
    from.forEach(([x, y], i) => { const tx = 300 + 180 * r(), ty = 60 + 180 * r(); c.circ(lerp(x, tx, ez(p)), lerp(y, ty, ez(p)), 9, { fill: BT_COL[i % 5], ...OUT }); });
    say(c, 260, 40, c.t("toujours 12 points", "still 12 points"), 20);
  },
};

/* ------------------------------------------------------------------ mirrored rooms (Penrose) */
const MU = 33, MX = 260, MY = 150, mp = ([x, y]) => [MX + MU * x, MY - MU * y];
const CANDLE = [-4.5, 0.6];
const penroseRays = once(() => {
  const rays = [];
  for (let i = 0; i < 180; i++) {
    const a = ((i + 0.5) / 180) * 2 * Math.PI, pts = trace(PENROSE, CANDLE, [Math.cos(a), Math.sin(a)], 24).points;
    let L = 0; const acc = [0]; for (let k = 1; k < pts.length; k++) acc.push((L += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1])));
    rays.push({ pts, acc });
  }
  return { rays, outline: flatten(PENROSE, 40) };
});
const cut = ({ pts, acc }, len) => { const out = [pts[0]]; for (let k = 1; k < pts.length; k++) { if (acc[k] <= len) { out.push(pts[k]); continue; } const f = (len - acc[k - 1]) / (acc[k] - acc[k - 1]); out.push([lerp(pts[k - 1][0], pts[k][0], f), lerp(pts[k - 1][1], pts[k][1], f)]); break; } return out; };
function candle(c, [x, y], mood) {
  c.rect(x - 7, y - 4, 14, 26, { fill: "#fff3c4", ...OUT, rx: 3 });
  c.path(`M${x} ${y - 22} q8 10 0 16 q-8 -6 0 -16 Z`, { fill: "#ffb703", stroke: "#e85d04", "stroke-width": 1.5 });
  face(c, x, y + 9, 13, { mood });
}
const mirrors = {
  size: [W, H], dur: (s) => (s === 2 ? 5200 : 3400),
  steps: () => [
    P("La pièce de Penrose (1958) : deux demi-ellipses et deux petits renfoncements, murs couverts de miroirs. On allume une bougie dans un renfoncement.", "Penrose’s room (1958): two half ellipses and two small recesses, walls covered with mirrors. A candle is lit in one recess."),
    P("La lumière part dans toutes les directions…", "Light leaves in every direction…"),
    P("… et rebondit sur les miroirs, encore et encore. Pourtant toute une moitié de la pièce reste noire.", "… and bounces off the mirrors, again and again. Yet a whole half of the room stays dark."),
    P("Le secret de l’ellipse : un rayon qui passe à l’extérieur de ses deux foyers repasse toujours à l’extérieur après un reflet. Partie de là, la lumière ne passe jamais entre les foyers pour descendre.", "The ellipse’s secret: a ray passing outside its two foci always passes outside them again after a reflection. Starting from there, light never goes between the foci to get down."),
    P("Avec des murs droits, Tokarsky (1995) a trouvé une pièce où deux points ne s’éclairent pas l’un l’autre ; mais ce sont des points isolés, jamais une zone entière.", "With straight walls, Tokarsky (1995) found a room where two points do not light each other; but they are isolated points, never a whole region."),
  ],
  draw(c, s, p) {
    bg(c, "#141a2e");
    if (s === 4) {
      const xs = TOKARSKY.map((v) => v[0]), ys = TOKARSKY.map((v) => v[1]), k = Math.min(440 / (Math.max(...xs) - Math.min(...xs)), 240 / (Math.max(...ys) - Math.min(...ys)));
      poly(c, TOKARSKY.map(([x, y]) => [260 + k * (x - (Math.min(...xs) + Math.max(...xs)) / 2), 150 - k * (y - (Math.min(...ys) + Math.max(...ys)) / 2)]), { fill: "#2b3352", stroke: "#cfe8ff", "stroke-width": 3 });
      say(c, 260, 30, c.t("murs droits : seulement des points isolés", "straight walls: only isolated points"), 16, { fill: "#fff" });
      return;
    }
    const { rays, outline } = penroseRays();
    poly(c, outline.map(mp), { fill: "#1f2740", stroke: "#cfe8ff", "stroke-width": 4 });
    if (s >= 1) {
      const len = s === 1 ? 6 * ez(p) : s === 2 ? 6 + 90 * ez(p) : 96;
      for (const r of rays) c.path(d(cut(r, len).map(mp), false), { fill: "none", stroke: "#ffd166", "stroke-width": 1, opacity: s === 1 ? 0.6 : 0.16 });
    }
    if (s === 2 && p > 0.7) say(c, MX, MY + 70, c.t("jamais éclairé", "never lit"), 18, { fill: "#fff" });
    if (s === 3) {
      for (const f of [[-4, 1], [4, 1]]) c.circ(...mp(f), 6, { fill: "#ef476f", stroke: "#fff", "stroke-width": 2 });
      say(c, MX, mp([0, 1])[1] - 8, c.t("foyers", "foci"), 15, { fill: "#ef476f" });
      c.line(...mp([-5.2, 1]), ...mp([5.2, 1]), { stroke: "#ef476f", "stroke-width": 1.5, "stroke-dasharray": "5 4", opacity: ez(p) });
    }
    candle(c, mp(CANDLE), s === 2 && p > 0.7 ? "o" : "smile");
  },
};

/* ------------------------------------------------------------------ the double pendulum */
const G = 9.81, pAcc = ([a1, a2, w1, w2]) => { const dd = a1 - a2, den = 3 - Math.cos(2 * dd); return [w1, w2, (-G * 3 * Math.sin(a1) - G * Math.sin(a1 - 2 * a2) - 2 * Math.sin(dd) * (w2 * w2 + w1 * w1 * Math.cos(dd))) / den, (2 * Math.sin(dd) * (2 * w1 * w1 + 2 * G * Math.cos(a1) + w2 * w2 * Math.cos(dd))) / den]; };
const rk4 = (f, st, h) => { const k1 = f(st), k2 = f(st.map((v, i) => v + (h / 2) * k1[i])), k3 = f(st.map((v, i) => v + (h / 2) * k2[i])), k4 = f(st.map((v, i) => v + h * k3[i])); return st.map((v, i) => v + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])); };
export const pendulumRuns = once(() => {
  const TH = 2.4, DT = 0.002, EVERY = 10, a = [], b = [];
  let x = [TH, TH, 0, 0], y = [TH + (1e-3 * Math.PI) / 180, TH, 0, 0];
  for (let i = 0; i <= 12 / DT; i++) { if (i % EVERY === 0) { a.push(x); b.push(y); } x = rk4(pAcc, x, DT); y = rk4(pAcc, y, DT); }
  return { a, b, dt: DT * EVERY };
});
const PEND_T = [[0, 2], [2, 5], [5, 12], [12, 12]];
const pendulum = {
  size: [W, H], dur: (s) => [3000, 4000, 7000, 3200][s],
  steps: () => [
    P("Deux pendules doubles, lâchés à un millième de degré près. Au début, impossible de les distinguer.", "Two double pendulums, released a thousandth of a degree apart. At first they cannot be told apart."),
    P("L’écart grandit, invisible encore : il est multiplié à peu près par le même nombre chaque seconde.", "The gap grows, still invisible: it is multiplied by about the same number every second."),
    P("Après quelques secondes, plus rien à voir : les équations sont exactes, mais la moindre erreur de départ explose.", "After a few seconds, nothing in common: the equations are exact, but the slightest starting error blows up."),
    P("Sur une échelle de puissances de 10, l’écart monte en ligne droite : c’est la sensibilité aux conditions initiales. Aucune mesure n’étant exacte, l’avenir lointain est imprévisible.", "On a scale of powers of 10 the gap climbs in a straight line: this is sensitivity to initial conditions. No measurement being exact, the distant future is unpredictable."),
  ],
  draw(c, s, p) {
    bg(c, "color-mix(in srgb, #eef4ff 70%, var(--surface))");
    const { a, b, dt } = pendulumRuns(), [t0, t1] = PEND_T[s], t = lerp(t0, t1, s === 3 ? 1 : p), n = Math.min(a.length - 1, Math.round(t / dt));
    const O = [170, 110], L = 58, ends = (st) => { const p1 = [O[0] + L * Math.sin(st[0]), O[1] + L * Math.cos(st[0])]; return [p1, [p1[0] + L * Math.sin(st[1]), p1[1] + L * Math.cos(st[1])]]; };
    const trail = (run, col) => { const pts = []; for (let i = Math.max(0, n - 60); i <= n; i++) pts.push(ends(run[i])[1]); c.path(d(pts, false), { fill: "none", stroke: col, "stroke-width": 2, opacity: 0.5 }); };
    trail(a, "#e63946"); trail(b, "#1d70b8");
    c.rect(O[0] - 40, O[1] - 8, 80, 8, { fill: "#b07a43", ...OUT });
    for (const [run, col] of [[b, "#1d70b8"], [a, "#e63946"]]) {
      const [p1, p2] = ends(run[n]);
      c.line(...O, ...p1, { stroke: INK, "stroke-width": 3 }); c.line(...p1, ...p2, { stroke: INK, "stroke-width": 3 });
      c.circ(...p1, 9, { fill: col, ...OUT }); c.circ(...p2, 15, { fill: col, ...OUT });
      face(c, p2[0], p2[1], 13, { mood: s >= 2 && p > 0.3 ? "o" : "smile" });
    }
    // the gap on a logarithmic scale, from 10^-5 to 10^1 rad
    const gx = 330, gy = 40, gw = 170, gh = 200, gap = (i) => Math.log10(Math.hypot(a[i][0] - b[i][0], a[i][1] - b[i][1]) + 1e-12);
    c.rect(gx, gy, gw, gh, { fill: "var(--surface)", stroke: INK, "stroke-width": 1.5, rx: 6 });
    const pts = []; for (let i = 0; i <= n; i += 5) pts.push([gx + (gw * i * dt) / 12, gy + gh - (gh * cl((gap(i) + 5) / 6))]);
    if (pts.length > 1) c.path(d(pts, false), { fill: "none", stroke: "#7b2cbf", "stroke-width": 2.6 });
    c.text(gx + 6, gy + 16, c.t("écart (×10 par cran)", "gap (×10 per notch)"), { "font-size": 12, fill: INK });
    for (let k = 0; k <= 6; k++) c.line(gx, gy + gh - (gh * k) / 6, gx + 6, gy + gh - (gh * k) / 6, { stroke: INK, "stroke-width": 1.2 });
    c.text(gx + gw - 4, gy + gh + 16, `${t.toFixed(1).replace(".", c.t(",", "."))} s`, { "font-size": 13, "font-weight": 700, fill: INK, "text-anchor": "end" });
  },
};

/* ------------------------------------------------------------------ three bodies */
const nbody = (P0, V0, T, dt = 0.001, every = 20, eps = 0.05) => {
  let p = P0.map((x) => x.slice()), v = V0.map((x) => x.slice());
  const acc = () => p.map((pi, i) => { let ax = 0, ay = 0; p.forEach((pj, j) => { if (i === j) return; const dx = pj[0] - pi[0], dy = pj[1] - pi[1], r2 = dx * dx + dy * dy + eps * eps, r3 = r2 * Math.sqrt(r2); ax += dx / r3; ay += dy / r3; }); return [ax, ay]; });
  const energy = () => { let e = 0; v.forEach((vi) => (e += 0.5 * (vi[0] ** 2 + vi[1] ** 2))); for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) e -= 1 / Math.sqrt((p[i][0] - p[j][0]) ** 2 + (p[i][1] - p[j][1]) ** 2 + eps * eps); return e; };
  let a = acc(); const snaps = [], E = [];
  for (let i = 0; i <= T / dt; i++) {
    if (i % every === 0) { snaps.push(p.map((x) => x.slice())); E.push(energy()); }
    v = v.map((vi, k) => [vi[0] + (dt / 2) * a[k][0], vi[1] + (dt / 2) * a[k][1]]); p = p.map((pi, k) => [pi[0] + dt * v[k][0], pi[1] + dt * v[k][1]]); a = acc(); v = v.map((vi, k) => [vi[0] + (dt / 2) * a[k][0], vi[1] + (dt / 2) * a[k][1]]);
  }
  return { snaps, E };
};
const CHAOS_START = [[-1.2, -0.3], [0.9, 0.5], [0.2, -0.8]], REST = [[0, 0], [0, 0], [0, 0]];
const EIGHT_P = [[0.97000436, -0.24308753], [-0.97000436, 0.24308753], [0, 0]], EIGHT_V = [[0.466203685, 0.43236573], [0.466203685, 0.43236573], [-0.93240737, -0.86473146]];
export const threeBodyRuns = once(() => ({
  two: nbody([[-0.6, 0], [0.6, 0]], [[0, -0.42], [0, 0.42]], 8, 0.001, 20, 0),
  chaos: nbody(CHAOS_START, REST, 12), ghost: nbody([[-1.2 + 1e-6, -0.3], CHAOS_START[1], CHAOS_START[2]], REST, 12),
  eight: nbody(EIGHT_P, EIGHT_V, 6.33, 0.0005, 20, 0),
}));
const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
const sci = (x) => { const [m, e] = x.toExponential(0).split("e"); return `${m} × 10${[...String(Number(e))].map((ch) => SUP[ch]).join("")}`; };
const BODY_COL = ["#e63946", "#2a9d8f", "#f4a259"];
const threeBody = {
  size: [W, H], dur: (s) => [4200, 6000, 4200, 3200][s],
  steps: () => [
    P("Deux astres seuls : chacun tourne sur une ellipse, toujours la même. Kepler l’a décrit par une formule.", "Two bodies alone: each goes round an ellipse, always the same one. Kepler described it with a formula."),
    P("Trois astres : le mouvement devient imprévisible. Un fantôme parti d’un millionième plus loin finit sur un tout autre chemin.", "Three bodies: the motion becomes unpredictable. A ghost started a millionth further away ends on a completely different path."),
    P("Il existe pourtant des danses parfaites, comme le huit (Chenciner et Montgomery, 2000) : les trois astres se poursuivent sur une même courbe.", "Yet there are perfect dances, like the figure eight (Chenciner and Montgomery, 2000): the three bodies chase each other along one curve."),
    P("Sans formule, on calcule pas à pas. L’énergie doit rester constante : son écart mesure l’erreur du calcul.", "Without a formula, the motion is computed step by step. Energy must stay constant: its drift measures the error of the computation."),
  ],
  draw(c, s, p) {
    bg(c, "#0f1530");
    for (let i = 0; i < 40; i++) c.circ((i * 97) % W, (i * 53) % H, 1.1, { fill: "#fff", opacity: 0.5 });
    const R = threeBodyRuns(), run = s === 0 ? R.two : s === 1 ? R.chaos : R.eight, sc = s === 1 ? 70 : 110, O = [s === 3 ? 180 : 260, 150];
    const n = Math.min(run.snaps.length - 1, Math.round((s === 3 ? 1 : p) * (run.snaps.length - 1))), at = ([x, y]) => [O[0] + sc * x, O[1] - sc * y];
    const draw = (rn, ghost) => {
      rn.snaps[0].forEach((_, k) => { const pts = []; for (let i = Math.max(0, n - (s === 1 ? 140 : 400)); i <= n; i++) pts.push(at(rn.snaps[i][k])); c.path(d(pts, false), { fill: "none", stroke: BODY_COL[k], "stroke-width": ghost ? 1.2 : 2, opacity: ghost ? 0.45 : 0.75, "stroke-dasharray": ghost ? "3 3" : "none" }); });
      rn.snaps[n].forEach((q, k) => { const [x, y] = at(q); c.circ(x, y, ghost ? 7 : 13, { fill: BODY_COL[k], stroke: ghost ? "#fff" : INK, "stroke-width": 1.6, opacity: ghost ? 0.5 : 1 }); if (!ghost) face(c, x, y, 11, { mood: s === 1 && p > 0.6 ? "o" : "smile" }); });
    };
    if (s === 1) draw(R.ghost, true);
    draw(run, false);
    if (s === 3) {
      const E = R.eight.E, e0 = E[0], drift = Math.max(...E.map((e) => Math.abs(e - e0))) / Math.abs(e0);
      c.rect(380, 60, 40, 180, { fill: "#1f2a50", stroke: "#cfe8ff", "stroke-width": 2, rx: 6 });
      c.rect(384, 64 + 172 * (1 - ez(p) * 0.98), 32, 172 * ez(p) * 0.98, { fill: "#90be6d", rx: 4 });
      say(c, 400, 50, c.t("énergie", "energy"), 14, { fill: "#fff" });
      say(c, 400, 265, `${c.t("écart", "drift")} ≈ ${sci(drift)}`, 13, { fill: "#fff" });
    }
  },
};

/* ------------------------------------------------------------------ indivisible goods */
// Values of the five goods for A and for B, and who gets each one: the next good goes to someone nobody envies now
// (the one who values it more when both qualify). The result is envy-free up to one good (checked in the tests).
export const GOODS = { A: [1, 2, 3, 4, 5], B: [2, 1, 4, 3, 5] };
export const goodsPlan = once(() => {
  const own = { A: [], B: [] }, val = (who, set) => set.reduce((t, g) => t + GOODS[who][g], 0), envies = (x, y) => val(x, own[y]) > val(x, own[x]);
  const order = [];
  for (let g = 0; g < 5; g++) {
    const free = ["A", "B"].filter((x) => !envies(x === "A" ? "B" : "A", x));
    const who = free.length === 1 ? free[0] : GOODS.A[g] >= GOODS.B[g] ? "A" : "B";
    own[who].push(g); order.push(who);
  }
  return { order, own, val, envies };
});
const ICONS = ["⚽", "📘", "🪁", "🥁", "🧸"];
const goods = {
  size: [W, H], dur: (s) => (s === 1 ? 6000 : 3400),
  steps: () => [
    P("Un seul ours en peluche, et tous les deux le veulent. Celui qui ne l’a pas envie l’autre, quoi qu’on fasse.", "One single teddy bear, and both want it. Whoever does not get it envies the other, whatever we do."),
    P("Avec plusieurs objets, on les distribue un par un : chaque objet va à quelqu’un que personne n’envie pour l’instant.", "With several goods, hand them out one at a time: each goes to someone whom nobody envies at that moment."),
    P("Il peut rester un peu d’envie. Mais retire un seul objet du lot envié, et l’envie disparaît : c’est « sans envie à un objet près », et cette règle marche toujours.", "Some envy may remain. But remove a single good from the envied bundle and the envy disappears: this is “envy-free up to one good”, and the rule always works."),
  ],
  draw(c, s, p) {
    bg(c, "color-mix(in srgb, #fff0f3 70%, var(--surface))");
    const PA = [110, 190], PB = [410, 190];
    const person = ([x, y], col, mood, name) => { c.path(`M${x - 46} ${y + 80} q46 -110 92 0 Z`, { fill: col, ...OUT }); c.circ(x, y - 22, 40, { fill: "#ffd6a5", ...OUT }); face(c, x, y - 22, 40, { mood }); say(c, x, y + 100, name, 16); };
    if (s === 0) {
      const k = ez(p), x = lerp(260, PA[0] + 50, k), y = lerp(80, PA[1] - 70, k);
      person(PA, "#8ecae6", k > 0.8 ? "grin" : "smile", "A"); person(PB, "#f4a259", k > 0.8 ? "sad" : "smile", "B");
      c.text(x, y, ICONS[4], { "font-size": 38, "text-anchor": "middle" });
      if (k > 0.8) { c.circ(PB[0] - 60, PB[1] - 110, 30, { fill: "#fff", ...OUT }); c.circ(PB[0] - 26, PB[1] - 76, 6, { fill: "#fff", ...OUT }); c.text(PB[0] - 60, PB[1] - 98, ICONS[4], { "font-size": 26, "text-anchor": "middle" }); }
      return;
    }
    const { order, val } = goodsPlan(), shown = s === 1 ? Math.min(5, Math.floor(p * 5.999)) : 5, mine = { A: [], B: [] };
    for (let g = 0; g < shown; g++) mine[order[g]].push(g);
    const vv = (who, set) => set.reduce((t, g) => t + GOODS[who][g], 0), env = (x, y) => vv(x, mine[y]) > vv(x, mine[x]);
    let removed = null;
    if (s === 2) { for (const [x, y] of [["A", "B"], ["B", "A"]]) if (env(x, y)) { const best = [...mine[y]].sort((g, h) => GOODS[x][h] - GOODS[x][g])[0]; removed = { x, y, g: best }; } }
    const after = (x, y) => vv(x, mine[y].filter((g) => !(removed && removed.y === y && removed.g === g))) > vv(x, mine[x]);
    const moodOf = (x, y) => (s === 2 && p > 0.5 ? (after(x, y) ? "sad" : "grin") : env(x, y) ? "sad" : "smile");
    person(PA, "#8ecae6", moodOf("A", "B"), "A"); person(PB, "#f4a259", moodOf("B", "A"), "B");
    // the goods still waiting, with each person's value
    for (let g = 0; g < 5; g++) {
      const who = order[g], idx = mine[who]?.indexOf(g) ?? -1, given = g < shown, fly = s === 1 && g === shown - 1 ? ez((p * 5.999) % 1) : 1;
      const home = [150 + g * 55, 50], dest = who === "A" ? [178 + idx * 36, PA[1] + 20] : [342 - idx * 36, PB[1] + 20], [x, y] = given ? [lerp(home[0], dest[0], fly), lerp(home[1], dest[1], fly)] : home;
      c.text(x, y, ICONS[g], { "font-size": 28, "text-anchor": "middle", opacity: removed && removed.g === g && p > 0.3 ? 0.25 : 1 });
      if (!given) c.text(x, y + 22, `A${GOODS.A[g]} · B${GOODS.B[g]}`, { "font-size": 11, "text-anchor": "middle", fill: INK });
      if (removed && removed.g === g && p > 0.3) c.line(x - 16, y - 24, x + 16, y + 6, { stroke: "#d62828", "stroke-width": 4, "stroke-linecap": "round" });
    }
    for (const [x, pos] of [["A", PA], ["B", PB]]) say(c, pos[0], pos[1] - 80, `${x} : ${vv(x, mine.A)} | ${vv(x, mine.B)}`, 14);
    say(c, 260, 130, c.t("chacun voit : lot de A | lot de B", "each sees: A’s bundle | B’s bundle"), 12, { "font-weight": 400 });
  },
};

/* ------------------------------------------------------------------ the baker */
export const bakerData = once(() => {
  const r = rng(4), normal = () => { const u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const honest = Array.from({ length: 365 }, () => 950 + 50 * normal()), picked = Array.from({ length: 365 }, () => Math.max(...Array.from({ length: 4 }, () => 950 + 50 * normal())));
  const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
  return { honest, picked, mean };
});
function histogram(c, data, n, x0, y0, w, h, col, lo = 780, hi = 1160, bins = 19) {
  const count = (m) => { const out = Array(bins).fill(0); data.slice(0, m).forEach((v) => { const k = Math.floor(((v - lo) / (hi - lo)) * bins); if (k >= 0 && k < bins) out[k]++; }); return out; };
  const counts = count(n), top = 1.15 * Math.max(...count(data.length));   // the scale of the whole year, so bars only grow
  const bw = w / bins; counts.forEach((k, i) => { if (k) c.rect(x0 + i * bw + 1, y0 - (h * k) / top, bw - 2, (h * k) / top, { fill: col, stroke: INK, "stroke-width": 1, rx: 2 }); });
  return (v) => x0 + (w * (v - lo)) / (hi - lo);
}
function poincare(c, x, y, mood) {
  c.rect(x - 22, y - 92, 44, 30, { fill: "#222", rx: 3 }); c.rect(x - 32, y - 64, 64, 6, { fill: "#222", rx: 3 });
  c.circ(x, y - 30, 30, { fill: "#ffd6a5", ...OUT }); face(c, x, y - 34, 30, { mood });
  c.path(`M${x - 20} ${y - 22} q10 -8 20 -2 q10 -6 20 2 q-10 6 -20 0 q-10 6 -20 0 Z`, { fill: "#5b3317" });
  c.path(`M${x - 34} ${y + 60} q34 -70 68 0 Z`, { fill: "#2b2d42", ...OUT });
}
const baker = {
  size: [W, H], dur: (s) => (s === 1 ? 6000 : 3600),
  steps: () => [
    P("Chaque jour, Poincaré pèse son pain « d’un kilo ». Un pain léger, ce n’est pas une preuve : le poids varie.", "Every day Poincaré weighs his “one kilo” loaf. One light loaf is no proof: the weight varies."),
    P("Mais jour après jour, les pesées s’accumulent, et leur moyenne se stabilise… vers 950 g, pas 1 000 g.", "But day after day the weighings pile up, and their mean settles… at 950 g, not 1,000 g."),
    P("Un pain varie d’environ 50 g ; la moyenne de 365 pains varie √365 ≈ 19 fois moins, environ 2,6 g. 50 g d’écart, c’est bien trop pour du hasard : le boulanger triche.", "One loaf varies by about 50 g; the mean of 365 loaves varies √365 ≈ 19 times less, about 2.6 g. A 50 g gap is far too much for chance: the baker cheats."),
    P("Suite de l’histoire : le boulanger lui donne alors le plus gros de plusieurs pains. La moyenne paraît honnête, mais la forme penchée de l’histogramme trahit le tri. (Anecdote non attestée.)", "The story goes on: the baker then hands him the biggest of several loaves. The mean looks honest, but the lopsided shape of the histogram betrays the choice. (Anecdote not attested.)"),
  ],
  draw(c, s, p) {
    bg(c, "color-mix(in srgb, #fff4e0 70%, var(--surface))");
    const { honest, picked, mean } = bakerData();
    poincare(c, 70, 170, s === 2 && p > 0.5 ? "grin" : s === 3 ? "o" : "flat");
    c.rect(30, 236, 80, 14, { fill: "#cfd6dc", ...OUT, rx: 4 });
    c.path("M44 226 q26 -26 52 0 Z", { fill: "#d4a373", ...OUT });
    const n = s === 0 ? 1 : s === 1 ? Math.max(1, Math.round(365 * ez(p))) : 365, data = s === 3 ? picked : honest, nn = s === 3 ? Math.max(1, Math.round(365 * ez(p))) : n;
    c.text(70, 274, `${Math.round(data[nn - 1])} g`, { "font-size": 15, "font-weight": 700, "text-anchor": "middle", fill: INK });
    const X = histogram(c, data, nn, 150, 250, 350, 190, s === 3 ? "#f4a259" : "#90be6d");
    c.line(X(1000), 36, X(1000), 254, { stroke: "#d62828", "stroke-width": 2.4, "stroke-dasharray": "6 4" }); c.text(X(1000), 28, "1 000 g", { "font-size": 13, "font-weight": 700, fill: "#d62828", "text-anchor": "middle" });
    const m = mean(data.slice(0, nn)); c.path(`M${X(m)} 258 l-7 12 h14 Z`, { fill: INK });
    c.text(X(m), 290, `${c.t("moyenne", "mean")} ${Math.round(m)} g`, { "font-size": 13, "font-weight": 700, fill: INK, "text-anchor": "middle" });
    c.text(156, 44, `${nn} ${nn > 1 ? c.t("jours", "days") : c.t("jour", "day")}`, { "font-size": 14, "font-weight": 700, fill: INK });
    if (s === 2) {
      const k = ez(p);
      c.line(X(950 - 50), 50, X(950 + 50), 50, { stroke: "#457b9d", "stroke-width": 6, "stroke-linecap": "round", opacity: k });
      c.line(X(950 - 2.6), 66, X(950 + 2.6), 66, { stroke: "#7b2cbf", "stroke-width": 6, "stroke-linecap": "round", opacity: k });
      c.text(X(1005), 54, c.t("un pain : ± 50 g", "one loaf: ± 50 g"), { "font-size": 12, fill: "#457b9d", opacity: k });
      c.text(X(1005), 70, c.t("moyenne : ± 2,6 g", "mean: ± 2.6 g"), { "font-size": 12, fill: "#7b2cbf", opacity: k });
    }
  },
};

export const EXPLAINERS = {
  "soap-films": soap, einstein: hat, "moving-sofa": sofa, equidecomposition: equi, "banach-tarski-gallery": banach,
  "mirrored-rooms": mirrors, "double-pendulum-gallery": pendulum, "three-body-gallery": threeBody, "fair-goods-gallery": goods, "baker-gallery": baker,
};
export const mountExplainer = (id, root, options) => (EXPLAINERS[id] ? playSolution(EXPLAINERS[id], root, options) : null);
