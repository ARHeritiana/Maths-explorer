// Cartoon solutions, batch 7: the shortest way via the river, Hippocrates' lunes, the star, the numbers that merge,
// the row of people sorted by neighbour swaps, the split piles.
import { svgEl, colour } from "./challenge-kit.js";
import { pathLength, shortestVia, bestContact, reflectSet, luneTotal, starK, starSumDegrees, mergeFinal, factorial, permOf, inversions, bubbleSwaps, splitTotal } from "./challenge-puzzles2.js";
import { lerp, seg, easeInOut, easeOutBack, clamp01, makeSoldier } from "./scene-kit.js";
import { dayScene, makeBalance } from "./scene-props.js";

const el = svgEl;
const TAU = Math.PI * 2;
const white = (size) => `font:700 ${size}px var(--body);fill:#fff`;
const pillAt = (parent, x, y, w, h) => { const g = el("g", {}, parent); el("rect", { x, y, width: w, height: h, rx: h / 2, fill: "#0a0f2c", opacity: 0.74 }, g); return g; };

/* ================================================================= the shortest way via the river */
const RY = 156;
const reflect = {
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

/* ================================================================= Hippocrates' lunes */
const lunes = {
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

/* ================================================================= the star */
const star = {
  size: [520, 300],
  dur: (s) => [4200, 3400, 3600, 3400, 4600][s] ?? 3000,
  steps: null,
  mount(c, q) {
    const svg = c.svg, n = Number(q.n), k = starK(n, Number(q.k)), CX = 190, CY = 158, R = 112, Pt = (i, r = R) => [CX + r * Math.cos((TAU * i) / n - Math.PI / 2), CY + r * Math.sin((TAU * i) / n - Math.PI / 2)];
    const id = "sg" + Math.floor(Math.random() * 1e6), defs = el("defs", {}, svg), gr = el("radialGradient", { id }, defs);
    [[0, "#2b2f7a"], [1, "#0e1336"]].forEach(([o, col]) => el("stop", { offset: o, "stop-color": col }, gr));
    el("rect", { width: 520, height: 300, fill: "#0e1336" }, svg);
    for (let i = 0; i < 26; i++) el("circle", { cx: (i * 191 + 33) % 520, cy: 10 + ((i * 97) % 280), r: 0.8 + (i % 3) * 0.4, fill: "#fff8d6", class: "sc-star", style: `--d:${(i % 7) * 0.45}s` }, svg);
    el("circle", { cx: CX, cy: CY, r: R + 14, fill: `url(#${id})`, stroke: "#4a5ab0", "stroke-width": 2 }, svg);
    const lines = Array.from({ length: n }, (_, i) => el("line", { stroke: "#ffd84a", "stroke-linecap": "round" }, svg));
    const wedge = el("path", { fill: "#ff6b3c", opacity: 0 }, svg), arc = el("path", { fill: "none", stroke: "#5fd0a0", "stroke-width": 7, "stroke-linecap": "round", opacity: 0 }, svg);
    const dots = Array.from({ length: n }, (_, i) => { const [x, y] = Pt(i), g = el("g", { transform: `translate(${x} ${y})` }, svg); el("circle", { r: 5, fill: "#6ea8ff", stroke: "#fff", "stroke-width": 1.6 }, g); return g; });
    const tip = el("circle", { r: 9, fill: "none", stroke: "#ff6b3c", "stroke-width": 3, opacity: 0 }, svg);
    const bar = el("g", {}, svg), segs = Array.from({ length: n }, () => el("rect", { height: 22, rx: 4, stroke: "#0e1336", "stroke-width": 1.5 }, bar)); const ticks = [0, 1, 2, 3, 4, 5, 6].map(() => el("g", {}, bar));
    const t1 = el("text", { x: 420, y: 80, "text-anchor": "middle", style: "font:700 28px var(--math);fill:#fff" }, svg), t2 = el("text", { x: 420, y: 106, "text-anchor": "middle", style: "font:600 14px var(--body);fill:#cfe3ff" }, svg);
    const board = pillAt(svg, 120, 8, 280, 30), label = el("text", { x: 260, y: 29, "text-anchor": "middle", style: white(15) }, board);
    return { c, n, k, CX, CY, R, Pt, lines, wedge, arc, dots, tip, bar, segs, ticks, t1, t2, label };
  },
  update(S, step, p, q) {
    const { c, n, k, CX, CY, R, Pt, lines, wedge, arc, dots, tip, bar, segs, ticks, t1, t2, label } = S, perTip = Math.round(((180 * (n - 2 * k)) / n) * 100) / 100, total = starSumDegrees(n, k);
    lines.forEach((ln, i) => { const [x1, y1] = Pt(i), [x2, y2] = Pt((i + k) % n), u = step === 0 ? easeInOut(seg(p, (i / n) * 0.75, (i / n) * 0.75 + 0.3)) : 1; ln.setAttribute("x1", x1); ln.setAttribute("y1", y1); ln.setAttribute("x2", lerp(x1, x2, u)); ln.setAttribute("y2", lerp(y1, y2, u)); ln.setAttribute("stroke-width", String(step === 0 ? 3.5 : 2.4)); ln.setAttribute("opacity", step >= 1 ? "0.55" : "1"); });
    dots.forEach((g, i) => { g.setAttribute("transform", `translate(${Pt(i)[0]} ${Pt(i)[1]}) scale(${1 + (i === 0 && step >= 1 ? 0.5 : 0)})`); });
    const o = Pt(0), u1 = Pt(k), v1 = Pt(n - k); tip.setAttribute("cx", o[0]); tip.setAttribute("cy", o[1]); tip.setAttribute("opacity", step >= 1 ? String(0.9 * (0.7 + 0.3 * Math.sin(p * 10))) : "0");
    // the tip angle as a wedge, and the intercepted arc
    const ang = (v) => Math.atan2(v[1] - o[1], v[0] - o[0]);
    const wk = step >= 1 ? easeInOut(step === 1 ? seg(p, 0, 0.7) : 1) : 0, rr = 34, a1 = ang(u1), a2 = ang(v1);
    wedge.setAttribute("d", `M${o[0]} ${o[1]}L${o[0] + rr * Math.cos(a1)} ${o[1] + rr * Math.sin(a1)}A${rr} ${rr} 0 0 ${((a2 - a1 + TAU) % TAU) < Math.PI ? 1 : 0} ${o[0] + rr * Math.cos(a1 + (a2 - a1) * wk)} ${o[1] + rr * Math.sin(a1 + (a2 - a1) * wk)}Z`); wedge.setAttribute("opacity", step >= 1 ? "0.9" : "0");
    if (step >= 2) { const k2 = step === 2 ? easeInOut(seg(p, 0, 0.9)) : 1, a0 = (TAU * k) / n - Math.PI / 2, steps = n - 2 * k, a1b = a0 + (TAU * steps * k2) / n, A0 = [CX + R * Math.cos(a0), CY + R * Math.sin(a0)], A1 = [CX + R * Math.cos(a1b), CY + R * Math.sin(a1b)]; arc.setAttribute("d", `M${A0.join(" ")}A${R} ${R} 0 ${steps * k2 > n / 2 ? 1 : 0} 1 ${A1.join(" ")}`); arc.setAttribute("opacity", "1"); } else arc.setAttribute("opacity", "0");
    // the n tip angles laid end to end on a bar with a tick every 180°
    const barOn = step === 4, maxDeg = Math.max(total, 180), W = 150, x0 = 346, y0 = 190, perW = (perTip / maxDeg) * W, grow = barOn ? easeInOut(seg(p, 0.1, 0.9)) : 0;
    segs.forEach((r, i) => { const on = grow * n - i; r.setAttribute("x", x0 + i * perW); r.setAttribute("y", y0); r.setAttribute("width", Math.max(0.1, perW * clamp01(on))); r.setAttribute("fill", i % 2 ? "#ff9a3c" : "#ff6b3c"); r.setAttribute("opacity", barOn && on > 0 ? "1" : "0"); });
    ticks.forEach((g, i) => { g.replaceChildren(); if (!barOn || i * 180 > maxDeg) return; const x = x0 + ((i * 180) / maxDeg) * W; el("line", { x1: x, y1: y0 - 6, x2: x, y2: y0 + 30, stroke: "#fff", "stroke-width": 1.5 }, g); const t = el("text", { x, y: y0 + 46, "text-anchor": "middle", style: "font:600 12px var(--body);fill:#cfe3ff" }, g); t.textContent = `${i * 180}°`; });
    t1.textContent = step <= 1 ? `{${n}/${k}}` : step === 2 ? `${n - 2 * k} × 360°/${n}` : step === 3 ? `${perTip}°` : `${total}°`; t1.style.fill = step === 4 ? "#ffd84a" : "#fff";
    t2.textContent = [c.t("l’étoile", "the star"), c.t("angle inscrit", "inscribed angle"), c.t("arc intercepté", "intercepted arc"), c.t("par pointe", "per tip"), c.t("somme des angles", "sum of the angles")][step];
    label.textContent = step === 4 ? `${n} × ${perTip}° = ${total}°` : [c.t(`${n} points, chacun relié au ${k}-ième suivant`, `${n} points, each joined to the ${k}th next`), c.t("la pointe est un angle inscrit", "the tip is an inscribed angle"), c.t("il intercepte l’arc opposé", "it intercepts the opposite arc"), c.t("moitié de l’arc : une pointe", "half the arc: one tip"), ""][step];
    label.parentNode.setAttribute("opacity", step === 4 ? "1" : "1");
  },
};

/* ================================================================= numbers that merge */
const merge = {
  size: [520, 300],
  dur: (s) => [3600, 4200, 4200, 4200, 4200][s] ?? 3000,
  steps: null,
  mount(c, q) {
    const svg = c.svg, n = Math.min(Number(q.n), 12);
    el("rect", { width: 520, height: 300, fill: "#e9f3ee" }, svg); el("rect", { x: 0, y: 240, width: 520, height: 60, fill: "#c9e3d4" }, svg);
    const blobs = Array.from({ length: n + 1 }, (_, i) => { const g = el("g", {}, svg), inner = el("g", {}, g); el("ellipse", { cy: 0, rx: 16, ry: 5, fill: "#000", opacity: 0.18 }, g); const body = el("circle", { cy: -18, r: 18, stroke: "#0004", "stroke-width": 1.6 }, inner); el("circle", { cx: -5, cy: -24, r: 3, fill: "#fff" }, inner); el("circle", { cx: 5, cy: -24, r: 3, fill: "#fff" }, inner); el("circle", { cx: -4.4, cy: -23.6, r: 1.4, fill: "#111" }, inner); el("circle", { cx: 5.6, cy: -23.6, r: 1.4, fill: "#111" }, inner); const num = el("text", { y: -6, "text-anchor": "middle", style: "font:700 13px var(--body);fill:#fff;paint-order:stroke;stroke:#0006;stroke-width:3px" }, inner); const tag = el("text", { y: 14, "text-anchor": "middle", style: "font:700 11px var(--body);fill:#2b2538" }, g); return { g, inner, body, num, tag }; });
    const t = [0, 1, 2, 3].map((i) => el("text", { x: 260, "text-anchor": "middle", style: "font:700 24px var(--math);fill:#2b2538" }, svg));
    const board = pillAt(svg, 90, 8, 340, 30), label = el("text", { x: 260, y: 29, "text-anchor": "middle", style: white(14) }, board);
    return { c, n, blobs, t, label };
  },
  update(S, step, p, q) {
    const { c, n, blobs, t, label } = S, cell = Math.min(44, 480 / n), x0 = 260 - (cell * n) / 2, Q = Number(q.n);
    const show = (b, x, y, num, tag, fill, sc = 1, sq = 0) => { b.g.setAttribute("opacity", "1"); b.g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${sc.toFixed(3)})`); b.inner.setAttribute("transform", `scale(${(1 + 0.12 * sq).toFixed(3)} ${(1 - 0.12 * sq).toFixed(3)})`); b.body.setAttribute("fill", fill); b.num.textContent = num; b.tag.textContent = tag; };
    const hide = (b) => b.g.setAttribute("opacity", "0");
    blobs.forEach(hide); t.forEach((x) => { x.textContent = ""; });
    const hue = (i) => `color-mix(in srgb, ${colour(i)} 78%, #fff)`;
    if (step === 0) for (let i = 1; i <= n; i++) show(blobs[i - 1], x0 + (i - 0.5) * cell, 180 - 8 * Math.abs(Math.sin(p * 6 + i)), i, "", hue(i - 1), cell / 40);
    else if (step === 1) {
      const k = easeInOut(seg(p, 0.15, 0.7)), sq = Math.sin(clamp01(seg(p, 0.6, 0.8)) * Math.PI);
      if (k < 0.99) { show(blobs[0], lerp(200, 250, k), 180, 1, "", hue(0), 1.3); show(blobs[1], lerp(320, 270, k), 180, 2, "", hue(1), 1.3); } else show(blobs[2], 260, 180 - 14 * Math.sin(seg(p, 0.7, 1) * Math.PI), 5, "5 + 1 = 6", hue(2), 1.5, sq);
      t[0].setAttribute("y", 110); t[0].textContent = k < 0.99 ? "1 + 2 + 1 × 2" : "= 5"; if (p > 0.8) { t[1].setAttribute("y", 250); t[1].textContent = "(1 + 1)(2 + 1) = 6 = 5 + 1"; t[1].style.fill = "#1f7a4a"; }
    } else if (step === 2) {
      show(blobs[0], 170, 214, "a", "a + 1", hue(0), 1.5); show(blobs[1], 350, 214, "b", "b + 1", hue(1), 1.5); t[0].setAttribute("y", 100); t[0].textContent = "a + b + ab + 1"; t[1].setAttribute("y", 140); t[1].textContent = "=  (a + 1)(b + 1)"; t[1].setAttribute("opacity", String(easeInOut(seg(p, 0.2, 0.7)))); t[2].setAttribute("y", 252); t[2].textContent = c.t("∏ (nombre + 1) est invariant", "∏ (number + 1) is invariant"); t[2].style.fill = "#1f7a4a"; t[2].setAttribute("opacity", String(easeInOut(seg(p, 0.5, 1))));
    } else if (step === 3) {
      for (let i = 1; i <= n; i++) show(blobs[i - 1], x0 + (i - 0.5) * cell, 170, i, String(i + 1), hue(i - 1), cell / 40);
      t[0].setAttribute("y", 238); t[0].textContent = `2 × 3 × … × ${Q + 1} = ${Q + 1}!`; t[0].setAttribute("opacity", String(easeInOut(seg(p, 0.2, 0.7)))); t[1].setAttribute("y", 272); t[1].textContent = factorial(Q + 1).toLocaleString(c.t("fr-FR", "en-US")); t[1].style.fill = "#1f7a4a"; t[1].setAttribute("opacity", String(easeInOut(seg(p, 0.5, 1))));
    } else {
      show(blobs[0], 260, 170 - 6 * Math.abs(Math.sin(p * 8)), "N", `N + 1 = ${Q + 1}!`, hue(3), 2); t[0].setAttribute("y", 90); t[0].textContent = `N = ${Q + 1}! − 1`; t[1].setAttribute("y", 252); t[1].textContent = mergeFinal(Q).toLocaleString(c.t("fr-FR", "en-US")); t[1].style.fill = "#1f7a4a"; t[1].setAttribute("opacity", String(easeInOut(seg(p, 0.2, 0.8))));
    }
    [0, 1, 2, 3].forEach((i) => { if (!(step === 1 && i === 1 && p > 0.8) && !(step === 2 && (i === 1 || i === 2)) && !(step === 3 && (i === 0 || i === 1)) && !(step === 4 && i === 1)) t[i].setAttribute("opacity", step === 0 ? "0" : i === 0 ? "1" : "0"); });
    label.textContent = [c.t(`au tableau : 1, 2, …, ${Q}`, `on the board: 1, 2, …, ${Q}`), c.t("1 et 2 fusionnent : 1 + 2 + 1×2 = 5", "1 and 2 merge: 1 + 2 + 1×2 = 5"), c.t("a + b + ab + 1 = (a + 1)(b + 1)", "a + b + ab + 1 = (a + 1)(b + 1)"), c.t("au départ : le produit des (nombre + 1)", "at the start: the product of the (number + 1)"), c.t("un seul nombre : N + 1 = (n + 1)!", "one number left: N + 1 = (n + 1)!")][step];
  },
};

/* ================================================================= the row of people */
const inversionsScene = {
  size: [520, 300],
  dur: (s, q) => { const tot = bubbleSwaps(permOf(Number(q.n), q.seed)).log.length; return s === 0 ? 3600 : s === 1 ? 2600 : s === 2 ? Math.min(14000, 1200 + tot * 700) : 3600; },
  steps: null,
  mount(c, q) {
    const svg = c.svg, N = Number(q.n);
    dayScene(svg, { ground: 244 });
    el("rect", { x: 20, y: 236, width: 480, height: 10, rx: 4, fill: "#a8723f", stroke: "#4b2d14", "stroke-width": 1.6 }, svg);
    const people = Array.from({ length: N }, (_, v) => makeSoldier(svg, { uniform: ["#3b82f6", "#e8710a", "#2fa866", "#c2185b"][v % 4], hat: v % 4, size: 0.72 + (v / N) * 0.55, skin: ["#f1c27d", "#e0ac69", "#f5d0a9", "#d8a47f"][v % 4], label: String(v + 1) }));
    const t1 = el("text", { x: 260, y: 66, "text-anchor": "middle", style: "font:700 38px var(--math);fill:#fff;paint-order:stroke;stroke:#2a4a2a;stroke-width:5px" }, svg), t2 = el("text", { x: 260, y: 286, "text-anchor": "middle", style: "font:700 14px var(--body);fill:#fff;paint-order:stroke;stroke:#2a4a2a;stroke-width:3px" }, svg);
    const board = pillAt(svg, 90, 8, 340, 28), label = el("text", { x: 260, y: 27, "text-anchor": "middle", style: white(14) }, board);
    return { c, N, people, t1, t2, label };
  },
  update(S, step, p, q) {
    const { c, N, people, t1, t2, label } = S, p0 = permOf(N, q.seed), log = bubbleSwaps(p0).log, W = Math.min(46, 460 / N), x0 = 260 - (W * N) / 2, total = log.length, inv0 = inversions(p0);
    const done = step === 0 ? 0 : step === 1 ? Math.min(1, total) * easeInOut(p) : step === 2 ? Math.min(total, 1 + easeInOut(p) * (total - 1)) : total, whole = Math.floor(done + 1e-9), frac = done - whole;
    const row = [...p0]; for (let i = 0; i < whole; i++) { const j = log[i]; [row[j], row[j + 1]] = [row[j + 1], row[j]]; }
    const swapping = frac > 0 && whole < total ? log[whole] : -1;
    row.forEach((v, i) => {
      let x = x0 + i * W + W / 2, hop = 0;
      if (swapping >= 0 && (i === swapping || i === swapping + 1)) { const e = easeInOut(frac); x = lerp(x0 + i * W + W / 2, x0 + (i === swapping ? i + 1 : i - 1) * W + W / 2, e); hop = 22 * Math.sin(e * Math.PI) * (i === swapping ? 1 : 0.6); }
      people[v - 1].set({ x, y: 232, dir: 1, phase: 0, amp: 0, hop, cheer: step === 3 ? easeInOut(seg(p, 0.3, 0.6)) : 0 });
    });
    const inv = inversions(row);
    t1.textContent = `${c.t("inversions", "inversions")} : ${inv}`; t2.textContent = `${c.t("échanges faits", "swaps made")} : ${whole}`;
    label.textContent = [`${c.t("la rangée", "the row")} : ${p0.join(", ")}`, c.t("un échange : −1 inversion", "one swap: −1 inversion"), c.t("chaque échange : −1, quel que soit le choix", "every swap: −1, whatever the choice"), `${inv0} ${c.t("échanges exactement", "swaps exactly")}`][step];
  },
};

/* ================================================================= split piles */
const piles = {
  size: [520, 300],
  dur: (s, q) => [3400, 3400, 6400, 4200][s] ?? 3000,
  steps: null,
  mount(c, q) {
    const svg = c.svg, m = Math.min(Number(q.n), 7);
    dayScene(svg, { ground: 262 });
    el("ellipse", { cx: 260, cy: 164, rx: 215, ry: 112, fill: "#d9c3a0", opacity: 0.75 }, svg);
    const lines = []; for (let i = 0; i < m; i++) for (let j = i + 1; j < m; j++) lines.push({ i, j, ln: el("line", { "stroke-linecap": "round" }, svg) });
    const pebbles = Array.from({ length: m }, (_, i) => { const g = el("g", {}, svg); el("ellipse", { cy: 6, rx: 13, ry: 4, fill: "#000", opacity: 0.2 }, g); el("ellipse", { rx: 13, ry: 11, fill: colour(i), stroke: "#0004", "stroke-width": 1.5 }, g); el("ellipse", { cx: -4, cy: -4, rx: 4, ry: 2.8, fill: "#fff", opacity: 0.5 }, g); return g; });
    const t1 = el("text", { x: 450, y: 74, "text-anchor": "middle", style: "font:700 38px var(--math);fill:#fff;paint-order:stroke;stroke:#2a4a2a;stroke-width:5px" }, svg), t2 = el("text", { x: 450, y: 100, "text-anchor": "middle", style: "font:600 13px var(--body);fill:#fff;paint-order:stroke;stroke:#2a4a2a;stroke-width:3px" }, svg), t3 = el("text", { x: 450, y: 140, "text-anchor": "middle", style: "font:700 20px var(--math);fill:#fff;paint-order:stroke;stroke:#2a4a2a;stroke-width:4px" }, svg);
    const board = pillAt(svg, 90, 8, 340, 28), label = el("text", { x: 260, y: 27, "text-anchor": "middle", style: white(14) }, board);
    // the fixed script of splits: halve the first pile with more than one pebble, again and again
    const splits = []; let groups = [Array.from({ length: m }, (_, i) => i)]; const layouts = [groups.map((g) => g.slice())];
    while (groups.some((g) => g.length > 1)) { const gi = groups.findIndex((g) => g.length > 1), g = groups[gi], a = Math.max(1, Math.floor(g.length / 2)); splits.push({ left: g.slice(0, a), right: g.slice(a) }); groups.splice(gi, 1, g.slice(0, a), g.slice(a)); layouts.push(groups.map((x) => x.slice())); }
    return { c, m, lines, pebbles, t1, t2, t3, label, splits, layouts };
  },
  update(S, step, p, q) {
    const { c, m, lines, pebbles, t1, t2, t3, label, splits, layouts } = S, Q = Number(q.n);
    const shown = step === 0 ? 0 : step === 1 ? 1 : step === 2 ? Math.min(splits.length, 1 + Math.floor(easeInOut(p) * (splits.length - 1) + 1e-9)) : splits.length;
    const frac = step === 2 ? clamp01(easeInOut(p) * (splits.length - 1) - Math.floor(easeInOut(p) * (splits.length - 1) + 1e-9)) : step === 1 ? easeInOut(seg(p, 0.1, 0.8)) : 0;
    const pos = (layoutIdx) => { const L = layouts[layoutIdx], res = []; const centres = L.map((g, gi) => 40 + ((gi + 0.5) / L.length) * 380); L.forEach((g, gi) => g.forEach((pi, k) => { const a = (TAU * k) / Math.max(1, g.length) - Math.PI / 2, r = g.length > 1 ? 14 + g.length * 5 : 0; res[pi] = [centres[gi] + r * Math.cos(a), 168 + (gi % 2 ? 12 : -12) + r * 0.8 * Math.sin(a)]; })); return res; };
    const prev = pos(Math.max(0, shown - 1)), cur = pos(shown), pr = shown === 0 ? cur : prev;
    const place = (pi) => [lerp(pr[pi][0], cur[pi][0], shown === 0 ? 1 : easeInOut(Math.min(1, step === 3 ? 1 : (step === 2 ? frac * 1.6 : step === 1 ? frac : 1)))), lerp(pr[pi][1], cur[pi][1], shown === 0 ? 1 : easeInOut(Math.min(1, step === 3 ? 1 : (step === 2 ? frac * 1.6 : step === 1 ? frac : 1))))];
    const pts = pebbles.map((g, pi) => { const pt = shown === 0 ? [40 + 190 + 105 * Math.cos((TAU * pi) / m - Math.PI / 2) - 40, 168 + 80 * Math.sin((TAU * pi) / m - Math.PI / 2)] : place(pi); g.setAttribute("transform", `translate(${pt[0].toFixed(1)} ${pt[1].toFixed(1)})`); return pt; });
    const sepSet = new Set(); for (let i = 0; i < shown; i++) for (const u of splits[i].left) for (const v of splits[i].right) sepSet.add(u < v ? `${u}-${v}` : `${v}-${u}`);
    const newest = shown > 0 ? new Set(splits[shown - 1].left.flatMap((u) => splits[shown - 1].right.map((v) => (u < v ? `${u}-${v}` : `${v}-${u}`)))) : new Set();
    lines.forEach(({ i, j, ln }) => { const key = `${i}-${j}`, on = sepSet.has(key); ln.setAttribute("x1", pts[i][0]); ln.setAttribute("y1", pts[i][1]); ln.setAttribute("x2", pts[j][0]); ln.setAttribute("y2", pts[j][1]); ln.setAttribute("stroke", on ? (newest.has(key) && step <= 2 ? "#3fbf7f" : "#e8710a") : "#7a6a48"); ln.setAttribute("stroke-width", on ? "3.2" : "1"); ln.setAttribute("opacity", on ? "1" : "0.55"); });
    t1.textContent = String(sepSet.size); t2.textContent = c.t("paires séparées", "pairs separated"); t3.textContent = `/ ${(m * (m - 1)) / 2}`; t1.style.fill = step === 3 ? "#ffd84a" : "#fff";
    label.textContent = [`${Q} ${c.t("cailloux", "pebbles")} : C(${m}, 2) = ${(m * (m - 1)) / 2} ${c.t("paires", "pairs")}`, c.t("a × b paires sont séparées", "a × b pairs are separated"), c.t("une paire séparée ne l’est qu’une fois", "a separated pair is counted once"), (Q > m ? `C(${m}, 2) = ${(m * (m - 1)) / 2} · ${c.t("pour", "for")} ${Q} : ${splitTotal(Q)}` : `C(${Q}, 2) = ${splitTotal(Q)}`)][step];
  },
};

export const SCENES_7 = { reflect, lunes, star, merge, inversions: inversionsScene, piles };
