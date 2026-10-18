// Animated solution of the lunes challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
import { el, pillAt, white, P, mid, ez } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { easeInOut, seg } from "../common/scene-kit.js";
import { makeBalance } from "../common/scene-props.js";
import { luneTotal } from "./maths.js";

/* ================================================================= Hippocrates' lunes */
export const scene = {
  size: [520, 300],
  dur: (s) => [3400, 3800, 4200, 3800, 4800][s] ?? 3000,
  steps: null,
  mount(c, q) {
    const svg = c.svg, a = Number(q.a), b = Number(q.b), cc = Math.hypot(a, b), cx = a / 2, cy = b / 2, R = cc / 2;
    const xmin = Math.min(-b / 2, cx - R), xmax = Math.max(a, cx + R), ymin = Math.min(-a / 2, cy - R), ymax = Math.max(b, cy + R), sc = Math.min(250 / (xmax - xmin), 225 / (ymax - ymin)), ox = 14 + (250 - sc * (xmax - xmin)) / 2 - sc * xmin, oy = 48 + sc * ymax + (225 - sc * (ymax - ymin)) / 2, Pt = (u, v) => [ox + u * sc, oy - v * sc];
    el("rect", { width: 520, height: 300, fill: "#f3efe4" }, svg); for (let i = 0; i < 14; i++) el("line", { x1: 0, y1: i * 22, x2: 520, y2: i * 22, stroke: "#e7e0cd", "stroke-width": 1 }, svg);
    const [Cx, Cy] = Pt(0, 0), [Ax, Ay] = Pt(a, 0), [Bx, By] = Pt(0, b), [Mx, My] = Pt(cx, cy), id = `cp${Math.floor(Math.random() * 1e6)}`;
    const defs = el("defs", {}, svg), mk = (name, x, y, w, h) => { const cp = el("clipPath", { id: name }, defs); el("rect", { x, y, width: w, height: h }, cp); };
    mk(`${id}a`, 0, Cy, 520, 300); mk(`${id}b`, 0, 0, Cx, 300);
    const d1 = el("path", { d: `M${Cx} ${Cy}A${(a / 2) * sc} ${(a / 2) * sc} 0 0 0 ${Ax} ${Ay}Z`, fill: "#6ea8ff", stroke: "#2b2538", "stroke-width": 2 }, svg), d2 = el("path", { d: `M${Cx} ${Cy}A${(b / 2) * sc} ${(b / 2) * sc} 0 0 1 ${Bx} ${By}Z`, fill: "#6ea8ff", stroke: "#2b2538", "stroke-width": 2 }, svg);
    const big = el("circle", { cx: Mx, cy: My, r: R * sc, fill: "#e9e2f5", stroke: "#2b2538", "stroke-width": 2 }, svg), seg1 = el("circle", { cx: Mx, cy: My, r: R * sc, fill: "#3fbf7f", opacity: 0, "clip-path": `url(#${id}a)` }, svg), seg2 = el("circle", { cx: Mx, cy: My, r: R * sc, fill: "#3fbf7f", opacity: 0, "clip-path": `url(#${id}b)` }, svg);
    const tri = el("path", { d: `M${Cx} ${Cy}L${Ax} ${Ay}L${Bx} ${By}Z`, fill: "#ffd84a", stroke: "#2b2538", "stroke-width": 2.5, opacity: 0.55 }, svg);
    const hi1 = el("path", { d: `M${Cx} ${Cy}A${(a / 2) * sc} ${(a / 2) * sc} 0 0 0 ${Ax} ${Ay}`, fill: "none", stroke: "#ff6b3c", "stroke-width": 0, "stroke-linecap": "round" }, svg), hi2 = el("path", { d: `M${Cx} ${Cy}A${(b / 2) * sc} ${(b / 2) * sc} 0 0 1 ${Bx} ${By}`, fill: "none", stroke: "#ff6b3c", "stroke-width": 0, "stroke-linecap": "round" }, svg);
    for (const [pt, ch, dx, dy] of [[[Cx, Cy], "C", -14, 18], [[Ax, Ay], "A", 14, 18], [[Bx, By], "B", -14, -6]]) { const t = el("text", { x: pt[0] + dx, y: pt[1] + dy, "text-anchor": "middle", style: "font:700 17px var(--body);fill:#2b2538" }, svg); t.textContent = ch; }
    const bal = makeBalance(svg, { x: 392, y: 150, arm: 66, post: 88 });
    const board = pillAt(svg, 90, 8, 340, 30), label = el("text", { x: 260, y: 29, "text-anchor": "middle", style: white(15) }, board), cap = el("text", { x: 392, y: 282, "text-anchor": "middle", style: "font:700 20px var(--math);fill:#2b2538" }, svg);
    return { c, a, b, d1, d2, big, seg1, seg2, tri, hi1, hi2, bal, label, cap };
  },
  update(S, step, p, q) {
    const { c, a, b, d1, d2, big, seg1, seg2, tri, hi1, hi2, bal, label, cap } = S;
    d1.setAttribute("opacity", step >= 2 ? "0.45" : "0.9"); d2.setAttribute("opacity", step >= 2 ? "0.45" : "0.9");
    big.setAttribute("fill", step === 1 || step === 3 ? "#d9d0f0" : "#eee8f8");
    const gs = step >= 2 ? (step === 2 ? easeInOut(seg(p, 0, 0.5)) : 1) : 0; seg1.setAttribute("opacity", String(0.85 * gs)); seg2.setAttribute("opacity", String(0.85 * gs));
    tri.setAttribute("fill", step >= 3 ? "#ffa94d" : "#ffd84a");
    const k = step === 4 ? easeInOut(seg(p, 0, 0.8)) : 0; hi1.setAttribute("stroke-width", String(6 * k)); hi2.setAttribute("stroke-width", String(6 * k));
    // the equation as a balance of area blocks
    const block = (txt, fill, w = 30) => (g, x0 = 0) => { const r = el("rect", { x: x0 - w / 2, y: -26, width: w, height: 24, rx: 6, fill, stroke: "#2b2538", "stroke-width": 1.4 }, g); const t = el("text", { x: x0, y: -9, "text-anchor": "middle", style: "font:700 13px var(--math);fill:#2b2538" }, g); t.textContent = txt; void r; };
    const group = (...parts) => (g) => { const total = parts.reduce((s2, [, , w = 30]) => s2 + w + 3, 0); let x = -total / 2; parts.forEach(([txt, fill, w = 30]) => { block(txt, fill, w)(g, x + w / 2); x += w + 3; }); };
    let left = null, right = null, angle = 0, text = "";
    if (step === 1) { left = group(["D₁", "#6ea8ff"], ["D₂", "#6ea8ff"]); right = group(["H", "#c9b8f0", 40]); text = "D₁ + D₂ = H"; }
    else if (step === 2) { const second = p > 0.55; left = group([second ? "D₂" : "D₁", "#6ea8ff"]); right = group([second ? "L₂" : "L₁", "#ff9a3c"], [second ? "S₂" : "S₁", "#3fbf7f"]); text = second ? "D₂ = L₂ + S₂" : "D₁ = L₁ + S₁"; }
    else if (step === 3) { left = group(["H", "#c9b8f0", 40]); right = group(["T", "#ffd84a", 26], ["S₁", "#3fbf7f", 26], ["S₂", "#3fbf7f", 26]); text = "H = T + S₁ + S₂"; }
    else if (step === 4) { left = group(["L₁", "#ff9a3c", 30], ["L₂", "#ff9a3c", 30]); right = group(["T", "#ffd84a", 40]); text = "L₁ + L₂ = T"; }
    angle = step >= 1 ? 7 * Math.sin(easeInOut(seg(p, 0, 0.5)) * 12) * (1 - easeInOut(seg(p, 0, 0.5))) : 0;
    bal.set({ angle, left, right });
    cap.textContent = step === 4 ? `${luneTotal(q.a, q.b)} cm²` : text;
    label.textContent = [c.t("deux demi-disques sur les côtés de l’angle droit", "two half-discs on the legs"), c.t("Pythagore : D₁ + D₂ = H", "Pythagoras: D₁ + D₂ = H"), c.t("demi-disque = lunule + segment", "half-disc = lune + segment"), c.t("le grand demi-disque : triangle + segments", "the big half-disc: triangle + segments"), c.t("les lunules ont l’aire du triangle", "the lunes have the area of the triangle")][step];
  },
};

/* ---------------------------------------------------------------- lunes */
export const diagram = {
  size: [520, 300],
  steps: (q) => [
    P(`Triangle rectangle en C (CA = ${q.a}, CB = ${q.b}). Les deux demi-disques sur les côtés de l’angle droit (bleu) dépassent du cercle de diamètre AB : les parties qui dépassent sont les lunules.`, `Right triangle at C (CA = ${q.a}, CB = ${q.b}). The two half-discs on the legs (blue) stick out of the circle on diameter AB: the parts that stick out are the lunes.`),
    P("Pythagore : l’aire du demi-disque de diamètre AB est égale à la somme des aires des deux petits demi-disques (π/8 × AB² = π/8 × CA² + π/8 × CB²).", "Pythagoras: the area of the half-disc on diameter AB equals the sum of the areas of the two small half-discs (π/8 × AB² = π/8 × CA² + π/8 × CB²)."),
    P("Chaque petit demi-disque = une lunule + un segment circulaire du grand cercle (en vert) : D₁ = L₁ + S₁, D₂ = L₂ + S₂.", "Each small half-disc = a lune + a circular segment of the big circle (green): D₁ = L₁ + S₁, D₂ = L₂ + S₂."),
    P("Le grand demi-disque, lui, = le triangle + les deux segments : H = T + S₁ + S₂.", "The big half-disc, in turn, = the triangle + the two segments: H = T + S₁ + S₂."),
    P(`Donc L₁ + L₂ = (D₁ + D₂) − (S₁ + S₂) = H − (H − T) = T : l’aire des lunules égale l’aire du triangle, ${q.a} × ${q.b} / 2 = ${luneTotal(q.a, q.b)} cm².`, `So L₁ + L₂ = (D₁ + D₂) − (S₁ + S₂) = H − (H − T) = T: the area of the lunes equals the area of the triangle, ${q.a} × ${q.b} / 2 = ${luneTotal(q.a, q.b)} cm².`),
  ],
  draw(c, s, p, q) {
    const a = q.a, b = q.b, cc = Math.hypot(a, b), cx = a / 2, cy = b / 2, R = cc / 2, xmin = Math.min(-b / 2, cx - R), xmax = Math.max(a, cx + R), ymin = Math.min(-a / 2, cy - R), ymax = Math.max(b, cy + R);
    const sc = Math.min(470 / (xmax - xmin), 270 / (ymax - ymin)), ox = 25 + (470 - sc * (xmax - xmin)) / 2 - sc * xmin, oy = 15 + sc * ymax + (270 - sc * (ymax - ymin)) / 2, Pt = (u, v) => [ox + u * sc, oy - v * sc];
    const [Cx, Cy] = Pt(0, 0), [Ax, Ay] = Pt(a, 0), [Bx, By] = Pt(0, b), [Mx, My] = Pt(cx, cy);
    const id = `clip${s}`, defs = c.svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "defs"));
    const mk = (name, x, y, w, h) => { const cp = document.createElementNS("http://www.w3.org/2000/svg", "clipPath"); cp.setAttribute("id", name); const r = document.createElementNS("http://www.w3.org/2000/svg", "rect"); for (const [k, v] of Object.entries({ x, y, width: w, height: h })) r.setAttribute(k, v); cp.appendChild(r); defs.appendChild(cp); };
    mk(`${id}a`, 0, Cy, 520, 300); mk(`${id}b`, 0, 0, Cx, 300);   // below chord CA / left of chord CB
    c.path(`M${Cx} ${Cy}A${(a / 2) * sc} ${(a / 2) * sc} 0 0 0 ${Ax} ${Ay}Z`, { fill: colour(0), opacity: s >= 2 ? 0.35 : 0.85 }); c.path(`M${Cx} ${Cy}A${(b / 2) * sc} ${(b / 2) * sc} 0 0 1 ${Bx} ${By}Z`, { fill: colour(0), opacity: s >= 2 ? 0.35 : 0.85 });
    const big = c.circ(Mx, My, R * sc, { fill: s === 1 || s === 3 ? `color-mix(in srgb, ${colour(5)} 22%, var(--surface))` : "var(--sunken)", stroke: "var(--ink)", "stroke-width": 2 }); void big;
    if (s >= 2) { c.circ(Mx, My, R * sc, { fill: colour(2), opacity: 0.8, "clip-path": `url(#${id}a)` }); c.circ(Mx, My, R * sc, { fill: colour(2), opacity: 0.8, "clip-path": `url(#${id}b)` }); }
    c.path(`M${Cx} ${Cy}L${Ax} ${Ay}L${Bx} ${By}Z`, { fill: `color-mix(in srgb, ${s >= 3 ? colour(4) : colour(0)} 45%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 2.5 });
    if (s === 4) { const k = ez(seg(p, 0, 0.8)); c.path(`M${Cx} ${Cy}A${(a / 2) * sc} ${(a / 2) * sc} 0 0 0 ${Ax} ${Ay}`, { fill: "none", stroke: colour(1), "stroke-width": 5 * k }); c.path(`M${Cx} ${Cy}A${(b / 2) * sc} ${(b / 2) * sc} 0 0 1 ${Bx} ${By}`, { fill: "none", stroke: colour(1), "stroke-width": 5 * k }); }
    c.path(`M${Cx} ${Cy}A${(a / 2) * sc} ${(a / 2) * sc} 0 0 0 ${Ax} ${Ay}`, { fill: "none", stroke: "var(--ink)", "stroke-width": 2 }); c.path(`M${Cx} ${Cy}A${(b / 2) * sc} ${(b / 2) * sc} 0 0 1 ${Bx} ${By}`, { fill: "none", stroke: "var(--ink)", "stroke-width": 2 });
    for (const [pt, lab, dx, dy] of [[[Cx, Cy], "C", -14, 18], [[Ax, Ay], "A", 14, 18], [[Bx, By], "B", -14, -6]]) c.text(pt[0] + dx, pt[1] + dy, lab, { ...mid, class: "sol-label" });
    const msg = [`D₁ + D₂`, `D₁ + D₂ = H`, `D = L + S`, `H = T + S₁ + S₂`, `L₁ + L₂ = T`][s];
    c.text(450, 36, msg, { ...mid, class: s === 4 ? "sol-hot" : "sol-line" });
    if (s === 4) c.text(450, 62, `${luneTotal(q.a, q.b)} cm²`, { ...mid, class: "sol-hot" });
  },
};
