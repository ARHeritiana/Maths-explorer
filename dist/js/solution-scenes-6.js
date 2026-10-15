// Cartoon solutions, batch 6: the cake, the queens, the damaged chessboard, the art gallery.
import { svgEl, colour } from "./challenge-kit.js";
import { squarePoint, cakeCream, QUEENS, queensK, unattacked } from "./challenge-puzzles.js";
import { comb } from "./challenge-variants.js";
import { triangulate, threeColour, visibility } from "./challenge-geometry.js";
import { lerp, seg, easeInOut, easeOutBack, clamp01, makeSoldier } from "./scene-kit.js";

const el = svgEl;
const white = (size) => `font:700 ${size}px var(--body);fill:#fff`;
const pillAt = (parent, x, y, w, h) => { const g = el("g", {}, parent); el("rect", { x, y, width: w, height: h, rx: h / 2, fill: "#0a0f2c", opacity: 0.74 }, g); return g; };
const bounce = (u) => { const k = clamp01(u); if (k < 1 / 2.75) return 7.5625 * k * k; if (k < 2 / 2.75) { const t = k - 1.5 / 2.75; return 7.5625 * t * t + 0.75; } if (k < 2.5 / 2.75) { const t = k - 2.25 / 2.75; return 7.5625 * t * t + 0.9375; } const t = k - 2.625 / 2.75; return 7.5625 * t * t + 0.984375; };

/* ================================================================= the cake */
const cake = {
  size: [520, 300],
  dur: (s, q) => [3200, 3600, 2200 + Number(q.n) * 700, 4200, 3800][s] ?? 3000,
  steps: null,
  mount(c, q) {
    const svg = c.svg, n = Number(q.n);
    el("rect", { width: 520, height: 300, fill: "#fbe9f0" }, svg);
    for (let i = 0; i < 12; i++) el("circle", { cx: (i * 83 + 20) % 520, cy: (i * 47 + 30) % 300, r: 3 + (i % 3), fill: ["#ffc2d6", "#c2e0ff", "#fff0a8"][i % 3], opacity: 0.7 }, svg);
    el("ellipse", { cx: 260, cy: 175, rx: 215, ry: 118, fill: "#fff", stroke: "#d8c4cc", "stroke-width": 2 }, svg);
    el("ellipse", { cx: 260, cy: 175, rx: 188, ry: 98, fill: "none", stroke: "#e9dde2", "stroke-width": 2 }, svg);
    const oblique = el("g", {}, svg), top = el("g", {}, svg);
    // oblique cube
    const w = 160, d = 62, x = 130, y = 118;
    el("path", { d: `M${x} ${y}L${x + w} ${y}L${x + w} ${y + w * 0.62}L${x} ${y + w * 0.62}Z`, fill: "#fff3c4", stroke: "#a38a4a", "stroke-width": 2 }, oblique);
    el("path", { d: `M${x + w} ${y}L${x + w + d} ${y - d * 0.6}L${x + w + d} ${y + w * 0.62 - d * 0.6}L${x + w} ${y + w * 0.62}Z`, fill: "#ffe38a", stroke: "#a38a4a", "stroke-width": 2 }, oblique);
    el("path", { d: `M${x} ${y}L${x + w} ${y}L${x + w + d} ${y - d * 0.6}L${x + d} ${y - d * 0.6}Z`, fill: "#fffdf2", stroke: "#a38a4a", "stroke-width": 2 }, oblique);
    for (let i = 0; i < 6; i++) el("path", { d: `M${x + 8 + i * 26} ${y} q6 18 12 0`, fill: "#fff", stroke: "#e8dcc0", "stroke-width": 1 }, oblique);
    el("circle", { cx: x + w / 2 + d / 2, cy: y - d * 0.3, r: 9, fill: "#d32f2f" }, oblique); el("path", { d: `M${x + w / 2 + d / 2} ${y - d * 0.3 - 9} q6 -12 12 -14`, stroke: "#3f8f4a", "stroke-width": 2.5, fill: "none", "stroke-linecap": "round" }, oblique);
    // top view
    const S = 210, X0 = 155, Y0 = 70; el("rect", { x: X0, y: Y0, width: S, height: S, rx: 6, fill: "#fff3c4", stroke: "#a38a4a", "stroke-width": 3 }, top);
    const T0 = 0.35, P2 = (pt) => [X0 + pt[0] * S, Y0 + (1 - pt[1]) * S], cuts = Array.from({ length: n }, (_, i) => T0 + (4 * i) / n);
    const poly = (k) => { const a = cuts[k], b = k + 1 < n ? cuts[k + 1] : cuts[0] + 4, pts = [[0.5, 0.5], squarePoint(a)]; for (let u = Math.floor(a) + 1; u < b; u++) pts.push(squarePoint(u)); pts.push(squarePoint(b)); return pts; };
    const slices = Array.from({ length: n }, (_, k) => { const g = el("g", {}, top), pg = el("path", { d: `M${poly(k).map((pt) => P2(pt).join(" ")).join("L")}Z`, fill: `color-mix(in srgb, ${colour(k)} 50%, #fff3c4)`, stroke: "#6b4a26", "stroke-width": 2, "stroke-linejoin": "round" }, g); return { g, pg, cx: poly(k).reduce((s, pt) => s + pt[0], 0) / poly(k).length, cy: poly(k).reduce((s, pt) => s + pt[1], 0) / poly(k).length }; });
    const cherries = cuts.map((t, k) => { const [px, py] = P2(squarePoint(t)), g = el("g", { transform: `translate(${px} ${py})` }, top); el("circle", { r: 8, fill: colour(k), stroke: "#2b2538", "stroke-width": 2 }, g); el("circle", { cx: -2.5, cy: -2.5, r: 2.5, fill: "#fff", opacity: 0.6 }, g); return g; });
    const centre = el("circle", { cx: X0 + S / 2, cy: Y0 + S / 2, r: 5, fill: "#2b2538" }, top);
    const knife = el("g", {}, top); el("path", { d: "M0 0 L46 -5 L46 5Z", fill: "#e8edf3", stroke: "#4b5563", "stroke-width": 1.6, "stroke-linejoin": "round" }, knife); el("rect", { x: 46, y: -5, width: 22, height: 10, rx: 4, fill: "#6b4423", stroke: "#2b2538", "stroke-width": 1.4 }, knife);
    const tris = Array.from({ length: 6 }, () => el("path", { fill: "none", stroke: "#2b2538", "stroke-width": 3, opacity: 0 }, top)), dashes = Array.from({ length: 6 }, () => el("line", { stroke: "#2b2538", "stroke-width": 2, "stroke-dasharray": "4 4", opacity: 0 }, top));
    const txtA = el("text", { x: 440, y: 120, "text-anchor": "middle", style: "font:700 22px var(--math);fill:#6b2a4a" }, svg), txtB = el("text", { x: 440, y: 146, "text-anchor": "middle", style: "font:600 14px var(--body);fill:#6b2a4a" }, svg);
    const board = pillAt(svg, 90, 8, 340, 30), label = el("text", { x: 260, y: 29, "text-anchor": "middle", style: white(14) }, board);
    return { c, n, oblique, top, slices, cherries, centre, knife, tris, dashes, P2, poly, cuts, txtA, txtB, label, S, X0, Y0 };
  },
  update(S, step, p, q) {
    const { c, n, oblique, top, slices, cherries, centre, knife, tris, dashes, P2, poly, cuts, txtA, txtB, label } = S, a = Number(q.a);
    oblique.setAttribute("opacity", step === 0 ? "1" : "0"); top.setAttribute("opacity", step === 0 ? "0" : "1");
    const cutT = step === 2 ? p : step > 2 ? 1 : 0, shownCh = step === 1 ? Math.floor(easeInOut(seg(p, 0.1, 0.9)) * n + 0.001) : n;
    cherries.forEach((g, k) => { const born = step === 1 ? easeOutBack(seg(p, 0.1 + (k / n) * 0.7, 0.1 + (k / n) * 0.7 + 0.2)) : step >= 2 ? 1 : 0; g.setAttribute("opacity", born > 0.01 || step >= 2 ? "1" : "0"); const [px, py] = P2(squarePoint(cuts[k])); g.setAttribute("transform", `translate(${px} ${py}) scale(${Math.max(0.01, born)})`); });
    void shownCh;
    slices.forEach((sl, k) => {
      const u = clamp01(cutT * n - k) , cut = step >= 2 ? 1 : 0, ex = step === 2 ? easeInOut(seg(cutT * n - k, 0.5, 1.2)) : step >= 3 ? 1 : 0;
      const dx = (sl.cx - 0.5) * 14 * ex * 1, dy = -(sl.cy - 0.5) * 14 * ex;
      sl.g.setAttribute("transform", `translate(${(dx * 2.2).toFixed(2)} ${(dy * 2.2).toFixed(2)})`); sl.pg.setAttribute("opacity", step >= 2 ? "1" : "0"); void u; void cut;
    });
    // the knife: moves out from the centre along each cut in turn
    if (step === 2) {
      const kk = Math.min(n - 1, Math.floor(cutT * n)), f = cutT * n - kk, [px, py] = P2(squarePoint(cuts[kk])), cx = S.X0 + S.S / 2, cy = S.Y0 + S.S / 2, ang = (Math.atan2(py - cy, px - cx) * 180) / Math.PI;
      knife.setAttribute("transform", `translate(${lerp(cx, px, easeInOut(f))} ${lerp(cy, py, easeInOut(f))}) rotate(${ang + 180}) translate(-46 0)`); knife.setAttribute("opacity", "1");
    } else knife.setAttribute("opacity", "0");
    centre.setAttribute("opacity", step >= 1 ? "1" : "0");
    // step 3: triangles of one portion
    const k0 = cuts.findIndex((_, i) => { const x = cuts[i], b = i + 1 < n ? cuts[i + 1] : cuts[0] + 4; return Math.floor(x) + 1 < b; }), kk = k0 < 0 ? 0 : k0, pts = poly(kk), prog = step === 3 ? easeInOut(p) : step > 3 ? 1 : 0;
    tris.forEach((t, i) => { const idx = i + 1; if (idx >= pts.length - 1) { t.setAttribute("opacity", "0"); return; } t.setAttribute("d", `M${P2(pts[0]).join(" ")}L${P2(pts[idx]).join(" ")}L${P2(pts[idx + 1]).join(" ")}Z`); t.setAttribute("opacity", String(step === 3 && idx / pts.length < prog ? 1 : 0)); });
    dashes.forEach((l, i) => { const idx = i + 1; if (idx >= pts.length - 1) { l.setAttribute("opacity", "0"); return; } const A = P2([0.5, 0.5]), B = P2(pts[idx]); l.setAttribute("x1", A[0]); l.setAttribute("y1", A[1]); l.setAttribute("x2", B[0]); l.setAttribute("y2", B[1]); l.setAttribute("opacity", String(step === 3 ? prog : 0)); });
    txtA.textContent = step === 3 ? "½ × ℓ × a/2" : step === 4 ? `${cakeCream(a, n)} cm²` : ""; txtB.textContent = step === 3 ? c.t("par triangle", "per triangle") : step === 4 ? c.t("de crème par part", "of cream per portion") : "";
    label.textContent = step === 0 ? `${a} cm : ${c.t("crème dessus et côtés", "cream on top and sides")}` : step === 1 ? `${n} × ${(4 * a) / n} cm = ${4 * a} cm` : step === 2 ? c.t("on coupe du centre à chaque point", "cut from the centre to every point") : step === 3 ? c.t("même hauteur a/2 pour chaque triangle", "same height a/2 for every triangle") : c.t("tout est proportionnel à la croûte", "everything is proportional to the crust");
  },
};

/* ================================================================= the queens */
const queens = {
  size: [520, 300],
  dur: (s, q) => [3000, 2400 + queensK(Number(q.n), Number(q.k)) * 900, 3600, 4200][s] ?? 3000,
  steps: null,
  mount(c, q) {
    const svg = c.svg, n = Number(q.n), k = queensK(n, Number(q.k)), C = Math.floor(260 / n), X0 = 30, Y0 = 30;
    el("rect", { width: 520, height: 300, fill: "#2b2f55" }, svg);
    el("rect", { x: X0 - 8, y: Y0 - 8, width: n * C + 16, height: n * C + 16, rx: 10, fill: "#6b4423", stroke: "#2a1a0a", "stroke-width": 2 }, svg);
    const cells = Array.from({ length: n * n }, (_, i) => el("rect", { x: X0 + (i % n) * C, y: Y0 + Math.floor(i / n) * C, width: C, height: C }, svg));
    const marks = Array.from({ length: n * n }, (_, i) => el("text", { x: X0 + (i % n) * C + C / 2, y: Y0 + Math.floor(i / n) * C + C * 0.66, "text-anchor": "middle", style: `font:700 ${C * 0.5}px var(--body);fill:#fff;opacity:0` }, svg));
    const queensG = Array.from({ length: k }, (_, i) => { const g = el("g", {}, svg), inner = el("g", {}, g); el("ellipse", { cy: 0, rx: C * 0.3, ry: C * 0.08, fill: "#000", opacity: 0.3 }, g); el("path", { d: `M${-C * 0.28} ${-2} L${-C * 0.17} ${-C * 0.5} L${C * 0.17} ${-C * 0.5} L${C * 0.28} ${-2}Z`, fill: colour(1), stroke: "#2b2538", "stroke-width": 1.4, "stroke-linejoin": "round" }, inner); el("circle", { cy: -C * 0.62, r: C * 0.17, fill: "#f1c27d", stroke: "#2b2538", "stroke-width": 1.2 }, inner); el("path", { d: `M${-C * 0.2} ${-C * 0.72} l${C * 0.07} ${-C * 0.2} l${C * 0.13} ${C * 0.12} l${C * 0.13} ${-C * 0.12} l${C * 0.07} ${C * 0.2}Z`, fill: "#ffd84a", stroke: "#8a6a10", "stroke-width": 1.2, "stroke-linejoin": "round" }, inner); el("circle", { cx: -C * 0.06, cy: -C * 0.64, r: 1.2, fill: "#222" }, inner); el("circle", { cx: C * 0.06, cy: -C * 0.64, r: 1.2, fill: "#222" }, inner); return { g, inner }; });
    const ring = el("circle", { fill: "none", stroke: "#ffd84a", "stroke-width": 3, opacity: 0 }, svg);
    const t1 = el("text", { x: 420, y: 90, "text-anchor": "middle", style: "font:700 34px var(--math);fill:#fff" }, svg), t2 = el("text", { x: 420, y: 114, "text-anchor": "middle", style: "font:600 14px var(--body);fill:#cfe3ff" }, svg), t3 = el("text", { x: 420, y: 176, "text-anchor": "middle", style: "font:700 44px var(--math);fill:#5fd0a0" }, svg), t4 = el("text", { x: 420, y: 202, "text-anchor": "middle", style: "font:600 14px var(--body);fill:#cfe3ff" }, svg), t5 = el("text", { x: 420, y: 246, "text-anchor": "middle", style: "font:700 17px var(--body);fill:#ffd84a" }, svg);
    return { c, n, k, C, X0, Y0, cells, marks, queensG, ring, t1, t2, t3, t4, t5, best: QUEENS[`${n},${k}`][0], ex: QUEENS[`${n},${k}`][1] };
  },
  update(S, step, p, q) {
    const { c, n, k, C, X0, Y0, cells, marks, queensG, ring, t1, t2, t3, t4, t5, best, ex } = S;
    const placedF = step === 0 ? 0 : step === 1 ? easeInOut(seg(p, 0.05, 0.9)) * k : k, placed = Math.floor(placedF + 1e-6);
    const qs = ex.slice(0, placed), free = new Set(unattacked(n, qs)), inUse = new Set(qs);
    cells.forEach((r, i) => {
      const row = Math.floor(i / n), col = i % n, isQ = inUse.has(i), isFree = free.has(i) && placed > 0, attacked = !isQ && !free.has(i) && placed > 0;
      r.setAttribute("fill", isQ ? "#f6c88a" : step >= 2 && isFree ? "#5fd0a0" : attacked ? ((row + col) % 2 ? "#b84a4a" : "#d96a6a") : (row + col) % 2 ? "#a8723f" : "#e8cfa0");
      r.setAttribute("stroke", "#2a1a0a"); r.setAttribute("stroke-width", "0.8");
      const m = marks[i]; m.textContent = attacked ? "×" : isFree && step >= 1 ? "·" : ""; m.style.opacity = attacked ? "0.75" : isFree ? "0.9" : "0";
    });
    queensG.forEach((o, i) => {
      const u = clamp01(placedF - i), sq = ex[i], row = Math.floor(sq / n), col = sq % n;
      const drop = (1 - bounce(u)) * -70, sc = u > 0 ? 1 : 0;
      o.g.setAttribute("transform", `translate(${X0 + col * C + C / 2} ${Y0 + row * C + C * 0.92 + (u < 1 ? drop : 0)}) scale(${sc})`);
      o.inner.setAttribute("transform", u < 1 && u > 0 ? `rotate(${(10 * Math.sin(u * 9)).toFixed(1)})` : "");
    });
    const lastI = Math.min(k - 1, Math.max(0, Math.ceil(placedF) - 1)), u2 = clamp01(placedF - lastI), sq0 = ex[lastI], rr = step === 1 && u2 > 0.6 && u2 < 1 ? (u2 - 0.6) / 0.4 : 0;
    ring.setAttribute("cx", X0 + (sq0 % n) * C + C / 2); ring.setAttribute("cy", Y0 + Math.floor(sq0 / n) * C + C / 2); ring.setAttribute("r", String(C * 0.3 + C * 1.2 * rr)); ring.setAttribute("opacity", String(rr > 0 ? 1 - rr : 0));
    t1.textContent = `${placed} / ${k}`; t2.textContent = c.t("dames posées", "queens placed");
    t3.textContent = step >= 1 ? String(free.size) : ""; t3.style.fill = step >= 2 ? "#5fd0a0" : "#fff"; t4.textContent = step >= 1 ? c.t("cases libres", "free squares") : "";
    t5.textContent = step === 3 ? c.t(`maximum : ${best}`, `maximum: ${best}`) : "";
  },
};

/* ================================================================= the damaged chessboard */
const chess = {
  size: [520, 300],
  dur: (s) => [3000, 3200, 3400, 4200, 5600][s] ?? 3000,
  steps: null,
  mount(c, q) {
    const svg = c.svg, N = Number(q.n), C = Math.floor(248 / N), X0 = 24, Y0 = 44;
    el("rect", { width: 520, height: 300, fill: "#e8d7bd" }, svg);
    el("rect", { x: X0 - 8, y: Y0 - 8, width: N * C + 16, height: N * C + 16, rx: 10, fill: "#6b4423", stroke: "#2a1a0a", "stroke-width": 2 }, svg);
    const gone = (i, j) => (i === 0 && j === 0) || (q.kind === "opp" ? i === N - 1 && j === N - 1 : i === N - 1 && j === 0);
    const cells = []; for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) cells.push({ i, j, r: el("rect", { x: X0 + i * C, y: Y0 + j * C, width: C, height: C }, svg), g: gone(i, j) });
    const rings = [0, 1].map(() => el("circle", { fill: "none", stroke: "#ffd84a", "stroke-width": 3, opacity: 0 }, svg));
    const doms = Array.from({ length: Math.ceil((N * N - 2) / 2) + 4 }, () => { const g = el("g", {}, svg), inner = el("g", {}, g); const rect = el("rect", { rx: 7, fill: "#fffdf2", stroke: "#2b2538", "stroke-width": 2 }, inner); const line = el("line", { stroke: "#2b2538", "stroke-width": 2 }, inner); const d1 = el("circle", { r: 3, fill: "#2b2538" }, inner), d2 = el("circle", { r: 3, fill: "#2b2538" }, inner); return { g, inner, rect, line, d1, d2 }; });
    const BX = 322, BW = 170, tx = [0, 1, 2, 3].map(() => el("text", { x: BX, "text-anchor": "start" }, svg));
    const bars = [el("rect", { x: BX, y: 82, height: 22, rx: 5, fill: "#2b2538" }, svg), el("rect", { x: BX, y: 140, height: 22, rx: 5, fill: "#e8b84a", stroke: "#2b2538", "stroke-width": 1.5 }, svg)];
    const board = pillAt(svg, 90, 8, 340, 30), label = el("text", { x: 260, y: 29, "text-anchor": "middle", style: white(14) }, board);
    return { c, N, C, X0, Y0, cells, rings, doms, tx, bars, BX, BW, label, gone };
  },
  update(S, step, p, q) {
    const { c, N, C, X0, Y0, cells, rings, doms, tx, bars, BX, BW, label, gone } = S, dark = (i, j) => (i + j) % 2 === 0, opp = q.kind === "opp";
    const wave = step === 1 ? easeInOut(seg(p, 0, 0.8)) : step >= 2 ? 1 : 0;
    cells.forEach(({ i, j, r, g }) => {
      const shade = dark(i, j), reach = clamp01(wave * (2 * N) - (i + j)), on = step >= 1 && shade && reach > 0;
      r.setAttribute("fill", g ? "#1b1427" : on ? `color-mix(in srgb, #6b4423 ${Math.round(70 * clamp01(reach))}%, #fff8e8)` : "#fff8e8"); r.setAttribute("stroke", "#2a1a0a"); r.setAttribute("stroke-width", "0.8");
    });
    // the two removed corners flash in steps 1-2
    [[0, 0], opp ? [N - 1, N - 1] : [N - 1, 0]].forEach(([i, j], idx) => { const r = rings[idx]; r.setAttribute("cx", X0 + i * C + C / 2); r.setAttribute("cy", Y0 + j * C + C / 2); r.setAttribute("r", String(C * 0.45 + 2.5 * Math.sin(p * 9))); r.setAttribute("opacity", step === 1 || step === 2 ? "0.95" : "0"); });
    // dominoes: step 3 a few examples, one dark + one light each; step 4 every row tiled horizontally
    const list = [];
    if (step === 3) { const spots = [[2, 1, "h"], [4, 3, "v"], [1, 4, "h"], [N - 3, 2, "v"]], k = Math.min(3, Math.floor(p * 4)), u = (p * 4) % 1; const [i, j, o] = spots[k]; list.push({ i, j, o, u: easeOutBack(clamp01(u * 1.6)) }); }
    if (step === 4) { const all = []; for (let j = 0; j < N; j++) { let i = 0; while (i < N - 1) { if (gone(i, j)) { i++; continue; } if (gone(i + 1, j)) { i += 2; continue; } all.push([i, j]); i += 2; } } const shown = easeInOut(seg(p, 0, 0.8)) * all.length; all.forEach(([i, j], idx) => { const u = clamp01(shown - idx); if (u > 0) list.push({ i, j, o: "h", u: easeOutBack(u) }); }); }
    doms.forEach((d, idx) => {
      const it = list[idx]; if (!it) { d.g.setAttribute("opacity", "0"); return; }
      const w = it.o === "h" ? 2 : 1, h = it.o === "h" ? 1 : 2, x = X0 + it.i * C + 2, y = Y0 + it.j * C + 2, ww = w * C - 4, hh = h * C - 4, drop = (1 - it.u) * -40;
      d.g.setAttribute("opacity", it.u > 0.02 ? "1" : "0"); d.g.setAttribute("transform", `translate(${x + ww / 2} ${y + hh / 2 + drop})`); d.inner.setAttribute("transform", `scale(${Math.max(0.01, 0.6 + 0.4 * Math.min(1, it.u))})`);
      d.rect.setAttribute("x", -ww / 2); d.rect.setAttribute("y", -hh / 2); d.rect.setAttribute("width", ww); d.rect.setAttribute("height", hh);
      if (it.o === "h") { d.line.setAttribute("x1", 0); d.line.setAttribute("x2", 0); d.line.setAttribute("y1", -hh / 2 + 6); d.line.setAttribute("y2", hh / 2 - 6); d.d1.setAttribute("cx", -C / 2); d.d1.setAttribute("cy", 0); d.d2.setAttribute("cx", C / 2); d.d2.setAttribute("cy", 0); }
      else { d.line.setAttribute("y1", 0); d.line.setAttribute("y2", 0); d.line.setAttribute("x1", -ww / 2 + 6); d.line.setAttribute("x2", ww / 2 - 6); d.d1.setAttribute("cx", 0); d.d1.setAttribute("cy", -C / 2); d.d2.setAttribute("cx", 0); d.d2.setAttribute("cy", C / 2); }
    });
    // counts of dark and light squares
    const h = (N * N) / 2, dk = opp ? h - 2 : h - 1, lt = opp ? h : h - 1, k = step === 2 ? easeInOut(p) : 1, show = step >= 2;
    bars[0].setAttribute("width", String(BW * (show ? dk / h : 0) * k)); bars[1].setAttribute("width", String(BW * (show ? lt / h : 0) * k)); bars[0].setAttribute("opacity", show ? "1" : "0"); bars[1].setAttribute("opacity", show ? "1" : "0");
    const set = (t, y, size, text, fill = "#2b2538") => { t.setAttribute("y", y); t.setAttribute("style", `font:${size};fill:${fill}`); t.textContent = text; };
    set(tx[0], 70, "600 14px var(--body)", `${c.t("Cases sombres", "Dark squares")}${show ? ` : ${dk}` : ""}`); set(tx[1], 128, "600 14px var(--body)", `${c.t("Cases claires", "Light squares")}${show ? ` : ${lt}` : ""}`);
    set(tx[2], 206, "600 15px var(--body)", step === 3 ? c.t("un domino couvre", "a domino covers") : step === 4 ? (opp ? c.t(`${dk} dominos au plus`, `${dk} dominoes at most`) : c.t(`${dk} dominos : tout le plateau`, `${dk} dominoes: the whole board`)) : "");
    set(tx[3], step === 3 ? 232 : 262, step === 3 ? "700 15px var(--body)" : "700 30px var(--math)", step === 3 ? c.t("1 sombre + 1 claire", "1 dark + 1 light") : step === 4 ? (opp ? `${dk} ≠ ${lt}` : `${dk} = ${lt}`) : "", step === 4 && opp ? "#b00020" : "#1f7a4a");
    label.textContent = [opp ? c.t("deux coins opposés retirés", "two opposite corners removed") : c.t("deux coins voisins retirés", "two neighbouring corners removed"), c.t("on colorie en damier", "colour it like a chessboard"), opp ? c.t("les deux coins ont la même couleur", "both corners have the same colour") : c.t("deux couleurs différentes", "two different colours"), c.t("un domino : une case de chaque couleur", "a domino: one square of each colour"), opp ? c.t("pas de pavage complet", "no complete tiling") : c.t("pavage complet possible", "a complete tiling exists")][step];
  },
};

/* ================================================================= the art gallery */
const GCOL = ["#5b8cff", "#ff9a3c", "#3fbf7f"];
const gal = new Map();
const galleryOf = (k) => { if (!gal.has(k)) { const poly = comb(k), tris = triangulate(poly), col = threeColour(poly.length, tris), sizes = [0, 1, 2].map((x) => col.filter((v) => v === x).length), best = sizes.indexOf(Math.min(...sizes)); gal.set(k, { poly, tris, col, sizes, best, tips: Array.from({ length: k }, (_, i) => 2 + 3 * i) }); } return gal.get(k); };
const artgallery = {
  size: [520, 300],
  dur: (s) => [3000, 4800, 4200, 3400, 3600, 4200][s] ?? 3000,
  steps: null,
  mount(c, q) {
    const svg = c.svg, k = Number(q.n) / 3, g = galleryOf(k), { poly, tris, col, best, tips } = g, WIDTH = 5 * k - 2, S = Math.min(24, 420 / WIDTH), OX = (520 - WIDTH * S) / 2, OY = 40;
    const X = (x) => OX + x * S, Y = (y) => OY + (10 - y) * S * 0.92 + 8, d = (pts) => pts.map((v, i) => `${i ? "L" : "M"}${X(v[0]).toFixed(1)} ${Y(v[1]).toFixed(1)}`).join("") + "Z";
    el("rect", { width: 520, height: 300, fill: "#3a2f4a" }, svg);
    el("path", { d: d(poly), fill: "#d9b48a", stroke: "none" }, svg);
    for (let x = 0; x < WIDTH; x += 2) el("line", { x1: X(x), y1: Y(10), x2: X(x), y2: Y(0), stroke: "#c4a074", "stroke-width": 1, opacity: 0.6 }, svg);
    const visG = el("g", {}, svg), vis = poly.map((v) => null);
    const visPaths = poly.map((v, i) => col[i] === best ? el("path", { d: d(visibility(poly, v)), fill: "#fff2a8", opacity: 0, stroke: "#e8c84a", "stroke-width": 1 }, visG) : null);
    const tipPaths = tips.map((i, kk) => el("path", { d: d(visibility(poly, poly[i])), fill: colour(kk), opacity: 0 }, visG));
    el("path", { d: d(poly), fill: "none", stroke: "#4b2d14", "stroke-width": 5, "stroke-linejoin": "round" }, svg);
    const diag = tris.map(([a, b, e]) => [[a, b], [b, e], [e, a]].map(([u, v]) => el("line", { x1: X(poly[u][0]), y1: Y(poly[u][1]), x2: X(poly[u][0]), y2: Y(poly[u][1]), stroke: "#fff", "stroke-width": 2, "stroke-dasharray": "5 4", opacity: 0.9 }, svg)));
    const dots = poly.map((v) => { const c2 = el("circle", { cx: X(v[0]), cy: Y(v[1]), r: 3.5, fill: "#2b2538", stroke: "#fff", "stroke-width": 1.4 }, svg); return c2; });
    const rings = poly.map((v, i) => col[i] === best ? el("circle", { cx: X(v[0]), cy: Y(v[1]), r: 14, fill: "none", stroke: "#ffd84a", "stroke-width": 3, opacity: 0 }, svg) : null);
    const guards = poly.map((v, i) => col[i] === best ? makeSoldier(svg, { uniform: GCOL[col[i]], hat: i % 4, size: 0.62, label: "" }) : null);
    const board = pillAt(svg, 90, 8, 340, 28), label = el("text", { x: 260, y: 27, "text-anchor": "middle", style: white(14) }, board), sizesT = el("text", { x: 504, y: 54, "text-anchor": "end", style: "font:700 14px var(--body);fill:#fff" }, svg);
    return { c, k, g, X, Y, d, visPaths, tipPaths, diag, dots, rings, guards, label, sizesT, poly, tris, col, best, tips };
  },
  update(S, step, p, q) {
    const { c, k, g, X, Y, visPaths, tipPaths, diag, dots, rings, guards, label, sizesT, poly, tris, col, best, tips } = S, n = 3 * k;
    diag.forEach((ls, i) => { const t = easeInOut(seg(step === 1 ? p : step > 1 ? 1 : 0, i / (tris.length + 1), i / (tris.length + 1) + 0.25)); const [a, b, e] = tris[i]; [[a, b], [b, e], [e, a]].forEach(([u, v], j) => { ls[j].setAttribute("x2", lerp(X(poly[u][0]), X(poly[v][0]), t)); ls[j].setAttribute("y2", lerp(Y(poly[u][1]), Y(poly[v][1]), t)); ls[j].setAttribute("opacity", step >= 1 ? "0.9" : "0"); }); });
    poly.forEach((v, i) => {
      const kk = step >= 2 ? (step === 2 ? easeOutBack(seg(p, i / (poly.length + 2), i / (poly.length + 2) + 0.3)) : 1) : 0;
      dots[i].setAttribute("r", String(step >= 2 ? Math.max(0.1, 8 * kk) : 3.5)); dots[i].setAttribute("fill", step >= 2 ? GCOL[col[i]] : "#2b2538");
      const isG = col[i] === best, up = step >= 3 && isG;
      if (rings[i]) rings[i].setAttribute("opacity", String(up ? 0.9 : 0)), rings[i].setAttribute("r", String(13 + (step === 3 ? 3 * Math.sin(p * 12) : 0)));
      if (guards[i]) { const u = step >= 3 ? easeOutBack(step === 3 ? seg(p, 0.1, 0.7) : 1) : 0; guards[i].set({ x: X(v[0]), y: Y(v[1]) + 6, dir: X(v[0]) < 260 ? 1 : -1, scale: Math.max(0.001, u), phase: p * 3, amp: 0, hop: step === 4 ? 4 * Math.abs(Math.sin(p * 10 + i)) : 0 }); }
      if (visPaths[i]) { const on = step === 4 ? easeInOut(p) * 0.65 : step >= 5 ? 0.18 : 0; visPaths[i].setAttribute("opacity", String(on * (0.85 + 0.15 * Math.sin(p * 16 + i)))); }
    });
    tipPaths.forEach((t, kk) => t.setAttribute("opacity", String(step === 5 ? 0.55 * easeInOut(p) : 0)));
    sizesT.textContent = step >= 3 ? `${g.sizes.join(" + ")} = ${n}` : "";
    label.textContent = [c.t(`galerie à ${n} murs en forme de peigne`, `a comb-shaped gallery with ${n} walls`), c.t(`${n - 2} triangles par des diagonales`, `${n - 2} triangles with diagonals`), c.t("trois couleurs, un triangle = trois couleurs", "three colours, every triangle shows all three"), c.t(`une couleur : au plus ⌊${n}/3⌋ = ${k} sommets`, `one colour: at most ⌊${n}/3⌋ = ${k} vertices`), c.t(`${k} gardiens suffisent`, `${k} guards suffice`), c.t(`et ${k} sont nécessaires`, `and ${k} are needed`)][step];
  },
};

export const SCENES_6 = { cake, queens, chess, artgallery };
