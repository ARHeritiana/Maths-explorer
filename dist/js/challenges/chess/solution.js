// Animated solution of the chess challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
import { el, pillAt, white, P, ez } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { easeInOut, seg, clamp01, easeOutBack } from "../common/scene-kit.js";

/* ================================================================= the damaged chessboard */
export const scene = {
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

/* ----------------------------------------------------------------- chess */
export const diagram = {
  size: [520, 300],
  steps: (q) => { const h = (q.n * q.n) / 2, opp = q.kind === "opp"; return [
    P(`Le plateau a perdu ${opp ? "deux coins opposés" : "deux coins voisins"} : il reste ${q.n * q.n - 2} cases.`, `The board lost ${opp ? "two opposite corners" : "two neighbouring corners"}: ${q.n * q.n - 2} squares remain.`),
    P(opp ? "On colorie en damier. Les deux coins opposés sont de la même couleur." : "On colorie en damier. Les deux coins voisins sont de couleurs différentes.", opp ? "Colour it like a chessboard. Opposite corners have the same colour." : "Colour it like a chessboard. Neighbouring corners have different colours."),
    opp ? P(`On retire deux cases sombres : il reste ${h - 2} cases sombres et ${h} cases claires.`, `Two dark squares are gone: ${h - 2} dark squares and ${h} light squares remain.`) : P(`On retire une case sombre et une claire : il reste ${h - 1} cases de chaque couleur.`, `One dark and one light square are gone: ${h - 1} squares of each colour remain.`),
    P("Un domino couvre toujours une case sombre et une case claire, où qu’on le pose.", "A domino always covers one dark and one light square, wherever it lies."),
    opp ? P(`Au plus ${h - 2} dominos (autant que de cases sombres). On y arrive en pavant chaque rangée à l’horizontale : deux cases claires restent libres. Pas de pavage complet.`, `At most ${h - 2} dominoes (as many as dark squares). Tiling every row horizontally reaches it: two light squares stay free. No complete tiling.`) : P(`Autant de cases de chaque couleur : ${h - 1} dominos, et en pavant chaque rangée à l’horizontale on couvre tout le plateau.`, `Equal numbers of each colour: ${h - 1} dominoes, and tiling every row horizontally covers the whole board.`),
  ]; },
  draw(c, s, p, q) {
    const N = q.n, C = Math.floor(264 / N), X0 = 20, Y0 = 24, gone = (i, j) => (i === 0 && j === 0) || (q.kind === "opp" ? i === N - 1 && j === N - 1 : i === N - 1 && j === 0), dark = (i, j) => (i + j) % 2 === 0;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const g = gone(i, j), shade = s >= 1 && dark(i, j);
      c.rect(X0 + i * C, Y0 + j * C, C, C, { class: `sol-cell${g ? " gone" : ""}`, style: g ? "" : `fill:${shade ? `color-mix(in srgb, var(--ink) ${Math.round(34 * (s === 1 ? ez(p) : 1))}%, var(--surface))` : "var(--surface)"}` });
    }
    if (s === 1 || s === 2) [[0, 0], q.kind === "opp" ? [N - 1, N - 1] : [N - 1, 0]].forEach(([i, j]) => c.circ(X0 + i * C + C / 2, Y0 + j * C + C / 2, C * 0.45 + 2 * Math.sin(p * 9), { class: "sol-ring" }));
    if (s === 3) {
      const spots = [[2, 1, "h"], [4, 3, "v"], [1, 4, "h"], [N - 3, 2, "v"]], k = Math.min(3, Math.floor(p * 4)), [i, j, o] = spots[k], w = o === "h" ? 2 : 1, h = o === "h" ? 1 : 2;
      c.rect(X0 + i * C + 2, Y0 + j * C + 2, w * C - 4, h * C - 4, { rx: 8, class: "sol-domino" });
      [[i, j], o === "h" ? [i + 1, j] : [i, j + 1]].forEach(([a, b]) => c.circ(X0 + a * C + C / 2, Y0 + b * C + C / 2, C * 0.2, { style: `fill:${dark(a, b) ? "var(--ink)" : "var(--surface)"};stroke:var(--ink);stroke-width:2` }));
    }
    if (s === 4) {   // tile every row horizontally
      const doms = []; for (let j = 0; j < N; j++) { let i = 0; while (i < N - 1) { if (gone(i, j)) { i++; continue; } if (gone(i + 1, j)) { i += 2; continue; } doms.push([i, j]); i += 2; } }
      const shown = Math.floor(ez(p) * doms.length);
      doms.slice(0, shown).forEach(([i, j]) => c.rect(X0 + i * C + 2, Y0 + j * C + 2, 2 * C - 4, C - 4, { rx: 6, class: "sol-domino" }));
      const covered = new Set(); doms.slice(0, shown).forEach(([i, j]) => { covered.add(`${i},${j}`); covered.add(`${i + 1},${j}`); });
      if (shown === doms.length) for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) if (!gone(i, j) && !covered.has(`${i},${j}`)) c.circ(X0 + i * C + C / 2, Y0 + j * C + C / 2, C * 0.4, { class: "sol-ring" });
    }
    const h = (N * N) / 2, dk = q.kind === "opp" ? h - 2 : h - 1, lt = q.kind === "opp" ? h : h - 1, k = s === 2 ? ez(p) : 1, BX = 300, BW = Math.min(150, 520 - BX - 30);
    c.text(BX, 62, `${c.t("Cases sombres", "Dark squares")}${s >= 2 ? ` : ${dk}` : ""}`, { class: "sol-sub" });
    c.rect(BX, 72, BW * (s >= 2 ? dk / h : 0) * k, 22, { rx: 4, style: "fill:var(--ink)" });
    c.text(BX, 120, `${c.t("Cases claires", "Light squares")}${s >= 2 ? ` : ${lt}` : ""}`, { class: "sol-sub" });
    c.rect(BX, 130, BW * (s >= 2 ? lt / h : 0) * k, 22, { rx: 4, style: `fill:${colour(2)}` });
    if (s === 4) { c.wrap(BX, 196, q.kind === "opp" ? c.t(`${dk} dominos au plus : ${dk} + ${dk} cases.`, `${dk} dominoes at most: ${dk} + ${dk} squares.`) : c.t(`${dk} dominos : tout le plateau.`, `${dk} dominoes: the whole board.`), 26, { class: "sol-line" }, 22); c.text(BX, 262, q.kind === "opp" ? `${dk} ≠ ${lt}` : `${dk} = ${lt}`, { class: "sol-big small", style: `fill:${q.kind === "opp" ? "var(--neg)" : "var(--pos)"}` }); }
  },
};
