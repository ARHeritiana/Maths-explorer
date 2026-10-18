// Animated solution of the reflect challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
import { el, pillAt, white, P, mid, ez } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { makeSoldier, easeInOut, seg, TAU, lerp } from "../common/scene-kit.js";
import { dayScene } from "../common/scene-props.js";
import { reflectSet, bestContact, pathLength, shortestVia } from "./maths.js";

/* ================================================================= the shortest way via the river */
export const RY = 156;

export const scene = {
  size: [520, 300],
  dur: (s) => [3200, 6200, 3600, 3800, 6000][s] ?? 3000,
  steps: null,
  mount(c, q) {
    const svg = c.svg, [a, b, d] = reflectSet(q.set), sc = Math.min(400 / d, 92 / Math.max(a, b), 62), X0 = 60, Pt = (u, v) => [X0 + u * sc, RY - v * sc];
    dayScene(svg, { ground: RY });
    el("rect", { x: 0, y: RY, width: 520, height: 150, fill: "#3f8fd2" }, svg); el("rect", { x: 0, y: RY, width: 520, height: 5, fill: "#8fd0ff" }, svg);
    for (let i = 0; i < 10; i++) el("path", { d: `M${(i * 83) % 500} ${RY + 20 + ((i * 41) % 110)} q10 -6 20 0 t20 0`, fill: "none", stroke: "#fff", "stroke-width": 1.6, opacity: 0.45, "stroke-linecap": "round", class: "sc-wave", style: `--d:${(i % 5) * 0.4}s` }, svg);
    const A = Pt(0, a), B = Pt(d, b), Bm = Pt(d, -b);
    const ghost = el("g", { opacity: 0, transform: `translate(${Bm[0]} ${Bm[1]})` }, svg); el("path", { d: "M-16 0 L0 -26 L16 0Z", fill: "#e8710a", stroke: "#7a3a05", "stroke-width": 1.6, "stroke-linejoin": "round" }, ghost); el("path", { d: "M0 -26 v-12", stroke: "#4b2d14", "stroke-width": 1.6 }, ghost);
    const mirror = el("line", { x1: B[0], y1: B[1], x2: Bm[0], y2: Bm[1], stroke: "#fff", "stroke-width": 1.8, "stroke-dasharray": "3 4", opacity: 0 }, svg);
    const tent = el("g", { transform: `translate(${B[0]} ${B[1] + 0})` }, svg); el("path", { d: "M-18 0 L0 -28 L18 0Z", fill: "#e8710a", stroke: "#7a3a05", "stroke-width": 1.6, "stroke-linejoin": "round" }, tent); el("path", { d: "M0 -28 v-12 h14 l-4 5 l4 5 h-14", fill: "#d32f2f", stroke: "#7a1212", "stroke-width": 1.2 }, tent); el("path", { d: "M-5 0 L0 -12 L5 0Z", fill: "#7a3a05" }, tent);
    const house = el("g", { transform: `translate(${A[0]} ${A[1]})` }, svg); el("rect", { x: -14, y: -22, width: 28, height: 22, fill: "#e8d6a0", stroke: "#a38a4a", "stroke-width": 1.6 }, house); el("path", { d: "M-18 -22 L0 -38 L18 -22Z", fill: "#b4533c", stroke: "#6b3320", "stroke-width": 1.4, "stroke-linejoin": "round" }, house);
    const line = el("line", { stroke: "#fff", "stroke-width": 3, "stroke-dasharray": "8 5", opacity: 0 }, svg), path = el("path", { fill: "none", stroke: "#ff6b3c", "stroke-width": 4, "stroke-linejoin": "round", "stroke-linecap": "round", "stroke-dasharray": "2 7" }, svg), dash = el("path", { fill: "none", stroke: "#fff", "stroke-width": 2, "stroke-dasharray": "3 3", opacity: 0 }, svg);
    const bucket = el("g", {}, svg); el("path", { d: "M-8 -12 L-6 0 L6 0 L8 -12Z", fill: "#9aa7b4", stroke: "#4a5361", "stroke-width": 1.4 }, bucket); el("path", { d: "M-8 -12 q8 -10 16 0", fill: "none", stroke: "#4a5361", "stroke-width": 1.4 }, bucket);
    const hiker = makeSoldier(svg, { uniform: "#2fa866", hat: 1, size: 0.85, label: "" });
    const letters = [[A, "A", -20], [B, "B", 24]].map(([pt, ch, dx]) => { const t = el("text", { x: pt[0] + dx, y: pt[1] - 4, "text-anchor": "middle", style: "font:700 17px var(--body);fill:#fff;paint-order:stroke;stroke:#2a4a2a;stroke-width:4px" }, svg); t.textContent = ch; return t; });
    const bl = el("text", { "text-anchor": "middle", style: "font:700 14px var(--body);fill:#fff;paint-order:stroke;stroke:#1f4a7a;stroke-width:4px" }, svg); bl.textContent = "B′";
    const xl = el("text", { "text-anchor": "middle", style: "font:700 16px var(--body);fill:#fff;paint-order:stroke;stroke:#1f4a7a;stroke-width:4px" }, svg); xl.textContent = "X";
    const board = pillAt(svg, 70, 8, 380, 30), label = el("text", { x: 260, y: 29, "text-anchor": "middle", style: white(15) }, board);
    return { c, a, b, d, sc, Pt, A, B, Bm, ghost, mirror, line, path, dash, bucket, hiker, bl, xl, label, best: bestContact(a, b, d) };
  },
  update(S, step, p, q) {
    const { c, a, b, d, Pt, A, B, Bm, ghost, mirror, line, path, dash, bucket, hiker, bl, xl, label, best } = S;
    const x = step === 1 ? 0.5 * d + 0.45 * d * Math.sin(easeInOut(seg(p, 0, 1)) * TAU * 1.25) : step >= 2 ? (step === 2 ? lerp(d / 2, best, 0) : best) : d / 2;
    const xs = step === 2 ? lerp(d * 0.5, best, easeInOut(seg(p, 0.5, 1))) : x, X = Pt(step === 2 ? xs : x, 0);
    path.setAttribute("d", `M${A.join(" ")}L${X.join(" ")}L${B.join(" ")}`);
    const o = easeInOut(seg(step === 2 ? p : 1, 0, 0.5)); const mir = step >= 2 ? o : 0;
    ghost.setAttribute("opacity", String(0.5 * mir)); mirror.setAttribute("opacity", String(mir * 0.9));
    line.setAttribute("x1", A[0]); line.setAttribute("y1", A[1]); line.setAttribute("x2", Bm[0]); line.setAttribute("y2", Bm[1]); line.setAttribute("opacity", step >= 3 ? String(step === 3 ? easeInOut(seg(p, 0, 0.5)) : 1) : "0");
    dash.setAttribute("d", `M${X.join(" ")}L${Bm.join(" ")}`); dash.setAttribute("opacity", String(mir * 0.8));
    bucket.setAttribute("transform", `translate(${X[0]} ${X[1] + 2})`);
    bl.setAttribute("x", Bm[0] + 22); bl.setAttribute("y", Bm[1] + 6); bl.setAttribute("opacity", String(mir)); xl.setAttribute("x", X[0]); xl.setAttribute("y", X[1] + 26);
    // the hiker walks the current route A -> X -> B
    const len1 = Math.hypot(X[0] - A[0], X[1] - A[1]), len2 = Math.hypot(B[0] - X[0], B[1] - X[1]), tot = len1 + len2;
    const walk = step === 1 ? easeInOut(seg(p, 0.02, 0.98)) * 2 % 1 : step === 4 ? easeInOut(seg(p, 0.1, 0.95)) : step === 3 ? easeInOut(seg(p, 0.5, 1)) : 0, u = walk * tot;
    const pos = u < len1 ? [lerp(A[0], X[0], u / len1), lerp(A[1], X[1], u / len1)] : [lerp(X[0], B[0], (u - len1) / len2), lerp(X[1], B[1], (u - len1) / len2)], dirR = u < len1 ? X[0] >= A[0] : B[0] >= X[0];
    hiker.set({ x: pos[0], y: pos[1] + 10, dir: dirR ? 1 : -1, phase: walk * 14, amp: step === 1 || (step >= 3 && walk > 0 && walk < 1) ? 1 : 0, scale: step >= 1 ? 1 : 1 });
    const L = pathLength(a, b, d, step === 2 ? xs : x);
    label.textContent = step === 0 ? `A ${a} m, B ${b} m, ${c.t("pieds à", "feet")} ${d} m` : `${step <= 2 ? "AX + XB" : step === 3 ? "AX + XB′ ≥ AB′" : "AB′"} = ${Math.round((step === 4 ? shortestVia(a, b, d) : L) * 100) / 100} m`;
  },
};

/* --------------------------------------------------------------- reflect */
export const diagram = {
  size: [520, 300],
  steps: (q) => { const [a, b, d] = reflectSet(q.set), L = shortestVia(a, b, d); return [
    P(`A est à ${a} m de la rivière, B à ${b} m, du même côté ; leurs pieds sont distants de ${d} m. On cherche le point X de la rivière qui rend AX + XB minimal.`, `A is ${a} m from the river, B is ${b} m away, on the same side; their feet are ${d} m apart. We look for the point X of the river that makes AX + XB smallest.`),
    P("Essayons plusieurs positions de X : la longueur varie, avec un minimum quelque part au milieu.", "Try several positions of X: the length changes, with a minimum somewhere in the middle."),
    P("Astuce : remplaçons B par son symétrique B′ par rapport à la rivière. Pour tout X, XB = XB′.", "Trick: replace B by its mirror image B′ in the river. For every X, XB = XB′."),
    P("Alors AX + XB = AX + XB′ ≥ AB′, avec égalité quand X est sur le segment AB′ : le chemin optimal est la droite AB′, repliée sur la rivière.", "Then AX + XB = AX + XB′ ≥ AB′, with equality when X is on the segment AB′: the best route is the straight line AB′, folded back at the river."),
    P(`AB′ = √(${d}² + (${a} + ${b})²) = √${d * d + (a + b) ** 2} = ${L} m. Au point X les deux parties du trajet font le même angle avec la rivière.`, `AB′ = √(${d}² + (${a} + ${b})²) = √${d * d + (a + b) ** 2} = ${L} m. At X the two parts of the route make the same angle with the river.`),
  ]; },
  draw(c, s, p, q) {
    const [a, b, d] = reflectSet(q.set), sc = Math.min(400 / d, 100 / Math.max(a, b), 36), X0 = 60, RY = 150, Pt = (u, v) => [X0 + u * sc, RY - v * sc];
    c.rect(0, RY, 520, 150, { fill: "color-mix(in srgb, var(--c6) 24%, var(--surface))" }); c.line(0, RY, 520, RY, { stroke: colour(5), "stroke-width": 3 });
    const A = Pt(0, a), B = Pt(d, b), Bm = Pt(d, -b), best = bestContact(a, b, d);
    const x = s === 1 ? (0.5 + 0.5 * Math.sin(p * 2 * Math.PI)) * d : s >= 3 || s === 2 ? best : d / 2;
    const X = Pt(x, 0);
    if (s >= 2) { c.line(...B, ...Bm, { stroke: "var(--muted)", "stroke-dasharray": "3 4", opacity: ez(seg(p, 0, 0.5)) }); c.circ(...Bm, 7, { fill: "var(--surface)", stroke: colour(3), "stroke-width": 2, opacity: ez(seg(p, 0, 0.5)) }); c.text(Bm[0] + 14, Bm[1] + 5, "B′", { class: "sol-label", opacity: ez(seg(p, 0, 0.5)) }); }
    if (s >= 3) c.line(...A, ...Bm, { stroke: colour(3), "stroke-width": 3, "stroke-dasharray": "8 5" });
    c.path(`M${A.join(" ")}L${X.join(" ")}L${B.join(" ")}`, { fill: "none", stroke: colour(1), "stroke-width": 4, "stroke-linejoin": "round" });
    if (s >= 2) c.path(`M${X.join(" ")}L${Bm.join(" ")}`, { fill: "none", stroke: colour(3), "stroke-width": 2, "stroke-dasharray": "3 3" });
    c.circ(...X, 7, { fill: colour(2), stroke: "var(--ink)", "stroke-width": 2 }); c.text(X[0], X[1] + 22, "X", { ...mid, class: "sol-label" });
    for (const [pt, lab, dx] of [[A, "A", -16], [B, "B", 14]]) { c.circ(...pt, 7, { fill: colour(0), stroke: "var(--ink)", "stroke-width": 2 }); c.text(pt[0] + dx, pt[1] - 8, lab, { ...mid, class: "sol-label" }); }
    const L = pathLength(a, b, d, x);
    c.text(430, 40, `${s <= 2 ? "AX + XB" : s === 3 ? "AX + XB′ ≥ AB′" : "AB′"} = ${Math.round((s === 4 ? shortestVia(a, b, d) : L) * 100) / 100} m`, { ...mid, class: s === 4 ? "sol-hot" : "sol-line" });
  },
};
