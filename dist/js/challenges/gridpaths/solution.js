// Animated solution of the gridpaths challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
import { el, pillAt, white, P, ez, ink } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { makeSoldier, easeInOut, seg, easeOutBack, clamp01 } from "../common/scene-kit.js";
import { dayScene } from "../common/scene-props.js";
import { pascalGrid, gridPaths } from "./maths.js";

/* ================================================================= paths in a city grid */
export const SAMPLE = (m, n) => { const w = []; let r = m, u = n; while (r || u) { if (r && (w.length % 2 === 0 || !u)) { w.push("R"); r--; } else { w.push("U"); u--; } } return w; };

export const scene = {
  size: [520, 300],
  dur: (s) => [3200, 5200, 4200, 5600, 3800][s] ?? 3000,
  steps: null,
  mount(c, q) {
    const svg = c.svg, m = Number(q.m), n = Number(q.n), X0 = 50, Y0 = 52, DX = Math.min(44, 420 / m), DY = Math.min(38, 200 / n), px = (i) => X0 + i * DX, py = (j) => Y0 + (n - j) * DY;
    dayScene(svg, { ground: 280 });
    el("rect", { x: X0 - 22, y: Y0 - 22, width: m * DX + 44, height: n * DY + 44, rx: 14, fill: "#cfd8c4", stroke: "#8a9a7a", "stroke-width": 2 }, svg);
    for (let j = 0; j < n; j++) for (let i = 0; i < m; i++) { const hgt = 6 + ((i * 7 + j * 11) % 5) * 2.4; el("rect", { x: px(i) + 7, y: py(j + 1) + 7, width: DX - 14, height: DY - 14, rx: 4, fill: ["#d9a86a", "#e8b0a0", "#a8c8e8", "#cfe0a0"][(i + 2 * j) % 4], stroke: "#0002", "stroke-width": 1 }, svg); void hgt; }
    for (let j = 0; j <= n; j++) el("line", { x1: px(0), y1: py(j), x2: px(m), y2: py(j), stroke: "#6b6f78", "stroke-width": 7, "stroke-linecap": "round" }, svg);
    for (let i = 0; i <= m; i++) el("line", { x1: px(i), y1: py(0), x2: px(i), y2: py(n), stroke: "#6b6f78", "stroke-width": 7, "stroke-linecap": "round" }, svg);
    for (let j = 0; j <= n; j++) el("line", { x1: px(0), y1: py(j), x2: px(m), y2: py(j), stroke: "#fff", "stroke-width": 1.2, "stroke-dasharray": "5 6" }, svg);
    for (let i = 0; i <= m; i++) el("line", { x1: px(i), y1: py(0), x2: px(i), y2: py(n), stroke: "#fff", "stroke-width": 1.2, "stroke-dasharray": "5 6" }, svg);
    const trail = el("path", { fill: "none", stroke: "#e8710a", "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0.9 }, svg);
    const nodes = []; for (let j = 0; j <= n; j++) for (let i = 0; i <= m; i++) { const g = el("g", { transform: `translate(${px(i)} ${py(j)})` }, svg); const b = el("circle", { r: 12, fill: "#fff", stroke: "#2b2538", "stroke-width": 1.6 }, g); const t = el("text", { y: 4, "text-anchor": "middle", style: "font:700 11px var(--body);fill:#2b2538" }, g); nodes.push({ g, b, t, i, j }); }
    const hl = el("path", { fill: "none", stroke: "#e8710a", "stroke-width": 3.5, "stroke-linecap": "round" }, svg);
    const flagA = el("g", {}, svg), flagB = el("g", {}, svg);
    for (const [g, x, y, ch, col] of [[flagA, px(0) - 22, py(0) + 8, "A", "#2fa866"], [flagB, px(m) + 22, py(n) - 8, "B", "#d32f2f"]]) { g.setAttribute("transform", `translate(${x} ${y})`); el("circle", { r: 13, fill: col, stroke: "#fff", "stroke-width": 2 }, g); const t = el("text", { y: 5, "text-anchor": "middle", style: "font:700 15px var(--body);fill:#fff" }, g); t.textContent = ch; }
    const walker = makeSoldier(svg, { uniform: "#e8710a", hat: 0, size: 0.7, label: "" });
    const wordG = el("g", {}, svg), word = Array.from({ length: m + n }, () => { const g = el("g", {}, wordG); const r = el("rect", { height: 22, rx: 5, stroke: "#2b2538", "stroke-width": 1 }, g); const t = el("text", { y: 16, "text-anchor": "middle", style: "font:700 13px var(--body)" }, g); return { g, r, t }; });
    const board = pillAt(svg, 110, 8, 300, 30), label = el("text", { x: 260, y: 29, "text-anchor": "middle", style: white(15) }, board);
    const eq = el("text", { x: 260, y: 296, "text-anchor": "middle", style: "font:700 19px var(--math);fill:#fff;paint-order:stroke;stroke:#2a4a2a;stroke-width:4px" }, svg);
    return { c, m, n, px, py, trail, nodes, hl, walker, word, wordG, label, eq, g: pascalGrid(m, n) };
  },
  update(S, step, p, q) {
    const { c, m, n, px, py, trail, nodes, hl, walker, word, wordG, label, eq, g } = S, w = SAMPLE(m, n);
    const shown = step === 1 ? easeInOut(seg(p, 0.05, 0.95)) * w.length : step === 2 ? w.length : 0;
    // the courier's route
    let i = 0, j = 0; const pts = [[0, 0]];
    for (let k = 0; k < Math.floor(shown); k++) { w[k] === "R" ? i++ : j++; pts.push([i, j]); }
    let cur = [i, j];
    if (shown < w.length && step >= 1) { const k = Math.floor(shown), f = shown - k; if (k < w.length) { cur = [i + (w[k] === "R" ? f : 0), j + (w[k] === "U" ? f : 0)]; pts.push(cur); } }
    trail.setAttribute("d", step >= 1 && step <= 2 ? `M${pts.map(([a, b]) => `${px(a)} ${py(b)}`).join("L")}` : "");
    const dirR = shown < w.length ? w[Math.min(w.length - 1, Math.floor(shown))] === "R" : true;
    walker.set({ x: px(cur[0]), y: py(cur[1]) + 14, dir: 1, phase: shown * 1.2, amp: step === 1 && p > 0.05 && p < 0.95 ? 1 : 0, scale: step <= 2 ? 1 : 0, hop: 0 });
    void dirR;
    const diagShown = step === 3 ? Math.floor(easeInOut(p) * (m + n + 1) + 0.0001) : step === 4 ? m + n + 1 : 0;
    nodes.forEach((nd) => {
      const on = nd.i + nd.j < diagShown, big = g[nd.j][nd.i], last = nd.i === m && nd.j === n, born = on ? easeOutBack(clamp01((diagShown - (nd.i + nd.j)) * 1.6)) : 0;
      nd.g.setAttribute("transform", `translate(${px(nd.i)} ${py(nd.j)}) scale(${step >= 3 ? (on ? Math.max(0.01, 1 + (born - 1) * 0.6) : 0.55) : 0.34})`);
      nd.b.setAttribute("fill", on && last && step === 4 ? "#2fa866" : "#fff"); nd.b.setAttribute("stroke", on ? "#2b2538" : "#9aa0a8");
      nd.t.textContent = on ? String(big) : ""; nd.t.style.fontSize = `${big > 9999 ? 6.5 : big > 999 ? 8 : big > 99 ? 9.5 : 11}px`; nd.t.style.fill = on && last && step === 4 ? "#fff" : "#2b2538";
    });
    // highlight of the two neighbours added at the current diagonal
    let d3 = "";
    if (step === 3 && diagShown >= 2 && diagShown <= m + n) { const d = diagShown - 1; for (let ii = 0; ii <= m; ii++) { const jj = d - ii; if (jj >= 1 && jj <= n && ii >= 1) d3 += `M${px(ii - 1)} ${py(jj)}L${px(ii)} ${py(jj)}M${px(ii)} ${py(jj - 1)}L${px(ii)} ${py(jj)}`; } }
    hl.setAttribute("d", d3);
    // the word of the path
    const cell = Math.min(24, 440 / w.length), x0 = 260 - (cell * w.length) / 2, kk = Math.floor(easeInOut(p) * w.length + 0.001);
    word.forEach((o, idx) => { const on = step === 2 && idx < kk + 1, isU = w[idx] === "U"; o.g.setAttribute("transform", `translate(${x0 + idx * cell} 252)`); o.r.setAttribute("width", cell - 2); o.r.setAttribute("fill", on ? (isU ? "#2fa866" : "#3b82f6") : "#fff"); o.t.setAttribute("x", (cell - 2) / 2); o.t.textContent = step === 2 ? (w[idx] === "R" ? c.t("D", "R") : c.t("H", "U")) : ""; o.t.style.fill = on ? "#fff" : "#2b2538"; o.g.setAttribute("opacity", step === 2 ? "1" : "0"); });
    eq.textContent = step === 4 ? `C(${m + n}, ${n}) = ${gridPaths(m, n)}` : step === 2 ? `C(${m + n}, ${n})` : "";
    label.textContent = step === 0 ? `${m} × ${n}` : step === 1 ? `${c.t("un chemin", "one path")} : ${m} ${c.t("pas à droite", "right")} + ${n} ${c.t("en haut", "up")}` : step === 2 ? c.t("un mot de D et de H", "a word of R and U") : step === 3 ? c.t("on additionne les deux voisins", "add the two neighbours") : c.t("deux méthodes, même nombre", "two methods, same number");
  },
};

export const diagram = {
  size: [520, 300],
  steps: (q) => [
    P(`Une grille de ${q.m} × ${q.n} carrés : on va de A (en bas à gauche) à B (en haut à droite), en n’allant que vers la droite ou vers le haut.`, `A grid of ${q.m} × ${q.n} squares: we go from A (bottom left) to B (top right), moving only right or up.`),
    P(`Voici un chemin. Quel qu’il soit, il comporte exactement ${q.m} pas vers la droite et ${q.n} pas vers le haut : ${q.m + q.n} pas en tout.`, `Here is one path. Whatever it is, it has exactly ${q.m} steps to the right and ${q.n} steps up: ${q.m + q.n} steps in all.`),
    P(`Écrivons-le comme un mot de ${q.m + q.n} lettres (D = droite, H = haut). Choisir un chemin, c’est choisir les ${q.n} places des lettres H parmi les ${q.m + q.n} : C(${q.m + q.n}, ${q.n}) possibilités.`, `Write it as a word of ${q.m + q.n} letters (R = right, U = up). Choosing a path means choosing the ${q.n} places of the U’s among the ${q.m + q.n}: C(${q.m + q.n}, ${q.n}) possibilities.`),
    P("Autre méthode : écrivons en chaque point le nombre de chemins qui y mènent. On y arrive de la gauche ou d’en dessous : on additionne les deux voisins.", "Another method: write at every point the number of paths leading to it. You arrive from the left or from below: add the two neighbours."),
    P(`Ces nombres sont ceux du triangle de Pascal, lus en diagonale. En B on lit C(${q.m + q.n}, ${q.n}) = ${gridPaths(q.m, q.n)} : les deux méthodes concordent.`, `These are the numbers of Pascal’s triangle, read along diagonals. At B we read C(${q.m + q.n}, ${q.n}) = ${gridPaths(q.m, q.n)}: both methods agree.`),
  ],
  draw(c, s, p, q) {
    const m = q.m, n = q.n, X0 = 50, Y0 = 36, DX = Math.min(44, 420 / m), DY = Math.min(40, 220 / n), px = (i) => X0 + i * DX, py = (j) => Y0 + (n - j) * DY, g = pascalGrid(m, n);
    for (let j = 0; j <= n; j++) c.line(px(0), py(j), px(m), py(j), { stroke: "var(--line-strong)", "stroke-width": 1 });
    for (let i = 0; i <= m; i++) c.line(px(i), py(0), px(i), py(n), { stroke: "var(--line-strong)", "stroke-width": 1 });
    const w = SAMPLE(m, n), shown = s === 1 ? ez(p) * w.length : s === 2 ? w.length : 0;
    if (s >= 1 && s <= 2) {
      let i = 0, j = 0; const pts = [[0, 0]];
      for (let k = 0; k < Math.floor(shown); k++) { w[k] === "R" ? i++ : j++; pts.push([i, j]); }
      if (shown < w.length) { const k = Math.floor(shown), f = shown - k; if (k < w.length) pts.push([i + (w[k] === "R" ? f : 0), j + (w[k] === "U" ? f : 0)]); }
      c.path(`M${pts.map(([a, b]) => `${px(a)} ${py(b)}`).join("L")}`, { fill: "none", stroke: colour(1), "stroke-width": 6, "stroke-linecap": "round", "stroke-linejoin": "round" });
    }
    if (s <= 2) { for (let j = 0; j <= n; j++) for (let i = 0; i <= m; i++) c.circ(px(i), py(j), 4, { fill: "var(--surface)", stroke: "var(--ink)", "stroke-width": 1.5 }); }
    if (s === 2) {
      const word = w.map((x) => (x === "R" ? c.t("D", "R") : c.t("H", "U"))), cell = Math.min(24, 440 / word.length), x0 = 260 - (cell * word.length) / 2, k = Math.floor(ez(p) * word.length + 0.001);
      word.forEach((ch, i) => { const on = i < k + 1, isU = w[i] === "U"; c.rect(x0 + i * cell, 266, cell - 2, 20, { rx: 4, fill: on ? (isU ? colour(2) : colour(0)) : "var(--surface)", stroke: "var(--ink)", "stroke-width": 1 }); c.text(x0 + i * cell + cell / 2 - 1, 281, ch, { ...ink, class: "sol-small", style: `fill:${on ? "#fff" : "var(--ink)"}` }); });
    }
    if (s >= 3) {
      const diagShown = s === 3 ? Math.floor(ez(p) * (m + n + 1) + 0.0001) : m + n + 1;
      for (let j = 0; j <= n; j++) for (let i = 0; i <= m; i++) {
        const on = i + j < diagShown, big = g[j][i], last = i === m && j === n;
        c.circ(px(i), py(j), 12, { fill: on ? (last && s === 4 ? colour(2) : "var(--surface)") : "var(--surface)", stroke: on ? "var(--ink)" : "var(--line-strong)", "stroke-width": on ? 1.5 : 1 });
        if (on) c.text(px(i), py(j) + 4, big, { ...ink, style: `font:700 ${big > 9999 ? 7 : big > 999 ? 8 : big > 99 ? 9 : 11}px var(--body);fill:${last && s === 4 ? "#fff" : "var(--ink)"}` });
      }
      if (s === 3 && diagShown >= 2 && diagShown <= m + n) { const d = diagShown - 1; for (let i = 0; i <= m; i++) { const j = d - i; if (j >= 1 && j <= n && i >= 1) c.path(`M${px(i - 1)} ${py(j)}L${px(i)} ${py(j)}M${px(i)} ${py(j - 1)}L${px(i)} ${py(j)}`, { fill: "none", stroke: colour(1), "stroke-width": 2.5, "stroke-linecap": "round" }); } }
    }
    c.text(px(0) - 14, py(0) + 22, "A", { ...ink, class: "sol-label" }); c.text(px(m) + 14, py(n) - 10, "B", { ...ink, class: "sol-label" });
    if (s === 4) c.text(260, 288, `C(${m + n}, ${n}) = ${gridPaths(m, n)}`, { ...ink, class: "sol-hot" });
  },
};
