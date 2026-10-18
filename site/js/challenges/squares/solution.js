// Animated solution of the squares challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
import { el, pillAt, white, P, ez } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { clamp01, easeOutBack, easeInOut, seg } from "../common/scene-kit.js";

/* ================================================================= squares of odd numbers */
export const scene = {
  size: [520, 300],
  dur: (s) => [3200, 3200, 5200, 3200, 5200][s] ?? 3000,
  steps: null,
  mount(c, q) {
    const svg = c.svg, n = Number(q.n);
    el("rect", { width: 520, height: 300, fill: "#f1ecf8" }, svg);
    for (let i = 0; i < 14; i++) el("line", { x1: 0, y1: i * 22, x2: 520, y2: i * 22, stroke: "#e2dbef", "stroke-width": 1 }, svg);
    const mk = (count) => Array.from({ length: count }, () => { const g = el("g", {}, svg); const body = el("circle", { r: 10, stroke: "#0004", "stroke-width": 1 }, g), hi = el("circle", { r: 3, fill: "#fff", opacity: 0.55 }, g); return { g, body, hi }; });
    const A = mk(36), B = mk(n * n), frame = el("path", { fill: "none", stroke: "#e8710a", "stroke-width": 3.5, "stroke-linejoin": "round", opacity: 0 }, svg);
    const legend = [0, 1, 2, 3, 4, 5].map(() => { const g = el("g", {}, svg); const sw = el("rect", { width: 14, height: 14, rx: 3 }, g); const t = el("text", { x: 22, y: 12, style: "font:600 16px var(--math);fill:#2b2538" }, g); return { g, sw, t }; });
    const f1 = el("text", { "text-anchor": "start", style: "font:600 17px var(--math);fill:#2b2538" }, svg), f2 = el("text", { "text-anchor": "start", style: "font:700 30px var(--math);fill:#2b2538" }, svg), f3 = el("text", { "text-anchor": "start", style: "font:600 13px var(--body);fill:#5a5470" }, svg);
    const board = pillAt(svg, 130, 8, 260, 28), label = el("text", { x: 260, y: 28, "text-anchor": "middle", style: white(15) }, board);
    return { c, n, A, B, frame, legend, f1, f2, f3, label };
  },
  update(S, step, p, q) {
    const { c, n, A, B, frame, legend, f1, f2, f3, label } = S;
    const place = (pool, size, sp, ox, oy, r, upto) => {
      pool.forEach((d, idx) => {
        if (idx >= size * size) { d.g.setAttribute("opacity", "0"); return; }
        const i = Math.floor(idx / size), j = idx % size, layer = Math.max(i, j) + 1, along = i === layer - 1 ? j / Math.max(1, layer) : (layer - 1 - i) / Math.max(1, layer) * 0.8;
        const u = clamp01((upto - (layer - 1)) * 1.5 - along * 0.5), sc = easeOutBack(u);
        d.g.setAttribute("transform", `translate(${ox + j * sp} ${oy + i * sp}) scale(${Math.max(0.001, sc * r / 10)})`);
        d.g.setAttribute("opacity", u > 0 ? "1" : "0"); d.body.setAttribute("fill", colour(layer - 1));
      });
    };
    const small = step <= 3;
    if (small) {
      const upto = step === 0 ? 0.0001 + easeInOut(p) : step === 1 ? 1 + easeInOut(p) : step === 2 ? 2 + easeInOut(p) * 4 : 6;
      place(A, 6, 34, 44, 52, 13, Math.min(6, upto)); place(B, 0, 0, 0, 0, 0, 0);
      const L = Math.min(6, Math.ceil(upto - 1e-9));
      legend.forEach((l, i) => { const k = i + 1, on = k <= L; l.g.setAttribute("opacity", on ? String(k < upto ? 1 : easeInOut(upto - (k - 1))) : "0"); l.g.setAttribute("transform", `translate(270 ${50 + i * 33})`); l.sw.setAttribute("fill", colour(k - 1)); l.t.textContent = `${Array.from({ length: k }, (_, qq) => 2 * qq + 1).join(" + ")} = ${k * k}`; });
      f1.textContent = f2.textContent = f3.textContent = "";
      if (step === 3) { f1.setAttribute("x", 270); f1.setAttribute("y", 262); f1.textContent = "1 + 3 + 5 + … + (2k − 1) = k²"; }
      frame.setAttribute("opacity", "0");
    } else {
      const sp = Math.min(13.5, 250 / n), r = Math.max(2.6, sp * 0.46), ox = 34, oy = 52;
      place(A, 0, 0, 0, 0, 0, 0); place(B, n, sp, ox, oy, r * 1.05, step === 4 ? 1 + easeInOut(p) * (n - 1) : n);
      legend.forEach((l) => l.g.setAttribute("opacity", "0"));
      const x0 = ox - sp * 0.7, y0 = oy - sp * 0.7, e = ox + (n - 1) * sp + sp * 0.7, f = oy + (n - 1) * sp + sp * 0.7, ix = ox + (n - 2) * sp + sp * 0.7, iy = oy + (n - 2) * sp + sp * 0.7;
      frame.setAttribute("d", `M${x0} ${iy}H${ix}V${y0}H${e}V${f}H${x0}Z`); frame.setAttribute("opacity", String(step === 4 ? easeInOut(seg(p, 0.85, 1)) : 1));
      const X0 = ox + n * sp + 26;
      f1.setAttribute("x", X0); f1.setAttribute("y", 110); f1.textContent = `1 + 3 + 5 + … + ${2 * n - 1}`;
      f2.setAttribute("x", X0); f2.setAttribute("y", 156); f2.textContent = `= ${n}² = ${n * n}`;
      f3.setAttribute("x", X0); f3.setAttribute("y", 190); f3.textContent = c.t(`dernière bordure : ${2 * n - 1} points`, `last border: ${2 * n - 1} dots`);
    }
    label.textContent = small ? (step === 0 ? c.t("1 point au centre", "1 dot in the middle") : step === 1 ? "1 + 3 = 4 = 2²" : step === 2 ? "1 + 3 + 5 + … = 3², 4², 5², 6²" : "1 + 3 + … + (2k − 1) = k²") : `${n} ${c.t("bordures", "borders")}`;
  },
};

/* --------------------------------------------------------------- squares */
export const diagram = {
  size: [520, 300],
  steps: (q) => [
    P("On construit un carré de points bordure par bordure. 1 point au centre.", "Build a square of dots border by border. 1 dot in the middle."),
    P("On ajoute une bordure en L de 3 points : 1 + 3 = 4, un carré 2 × 2.", "Add an L-shaped border of 3 dots: 1 + 3 = 4, a 2 × 2 square."),
    P("Puis 5 points : 1 + 3 + 5 = 9, un carré 3 × 3. Puis 7 : 16. Puis 9 : 25. Puis 11 : 36.", "Then 5 dots: 1 + 3 + 5 = 9, a 3 × 3 square. Then 7: 16. Then 9: 25. Then 11: 36."),
    P("La k-ième bordure compte 2k − 1 points, et k bordures forment un carré k × k : 1 + 3 + 5 + … + (2k − 1) = k².", "The kth border has 2k − 1 dots, and k borders make a k × k square: 1 + 3 + 5 + … + (2k − 1) = k²."),
    P(`${2 * q.n - 1} = 2 × ${q.n} − 1 : il y a ${q.n} bordures, la dernière de ${2 * q.n - 1} points. 1 + 3 + … + ${2 * q.n - 1} = ${q.n}² = ${q.n * q.n}.`, `${2 * q.n - 1} = 2 × ${q.n} − 1: there are ${q.n} borders, the last one with ${2 * q.n - 1} dots. 1 + 3 + … + ${2 * q.n - 1} = ${q.n}² = ${q.n * q.n}.`),
  ],
  draw(c, s, p, q) {
    const dots = (n, sp, ox, oy, r, upto) => {
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const layer = Math.max(i, j) + 1, show = layer <= Math.floor(upto + 1e-9), part = layer === Math.floor(upto + 1e-9) + 1 ? upto - Math.floor(upto + 1e-9) : 0;
        if (!show && part < 0.03) continue;
        c.circ(ox + j * sp, oy + i * sp, r, { style: `fill:${colour(layer - 1)};opacity:${show ? 1 : 0.25 + 0.75 * ez(part)}`, class: "sol-sq-dot" });
      }
    };
    if (s <= 3) {
      const upto = s === 0 ? 0.001 + ez(p) : s === 1 ? 1 + ez(p) : s === 2 ? 2 + ez(p) * 4 : 6;
      dots(6, 34, 40, 40, 12, Math.min(6, upto));
      const L = Math.min(6, Math.ceil(upto - 1e-9));
      for (let k = 1; k <= L; k++) {
        const y = 44 + (k - 1) * 33;
        c.rect(268, y - 14, 14, 14, { rx: 3, style: `fill:${colour(k - 1)}` });
        const terms = Array.from({ length: k }, (_, qq) => 2 * qq + 1).join(" + ");
        c.text(290, y - 2, `${terms} = ${k * k}`, { class: "sol-line", style: `opacity:${k < upto ? 1 : ez(upto - (k - 1))}` });
      }
    } else {
      const n = q.n, sp = Math.min(13, 250 / n), r = Math.max(1.6, sp * 0.37), ox = 30, oy = 24;
      dots(n, sp, ox, oy, r, s === 4 ? 1 + ez(p) * (n - 1) : n);
      if (s >= 4) { const x0 = ox - sp * 0.7, y0 = oy - sp * 0.7, e = ox + (n - 1) * sp + sp * 0.7, f = oy + (n - 1) * sp + sp * 0.7, ix = ox + (n - 2) * sp + sp * 0.7, iy = oy + (n - 2) * sp + sp * 0.7; c.path(`M${x0} ${iy}H${ix}V${y0}H${e}V${f}H${x0}Z`, { class: "sol-last", style: `opacity:${s === 4 ? ez(seg(p, 0.85, 1)) : 1}` }); }
      const X0 = ox + n * sp + 24;
      c.rect(X0, 60, 14, 14, { rx: 3, style: `fill:${colour(n - 1)}` }); c.text(X0 + 22, 72, c.t(`dernière bordure : ${2 * n - 1} points`, `last border: ${2 * n - 1} dots`), { class: "sol-small" });
      c.text(X0, 130, s === 3 ? "1 + 3 + 5 + … + (2k − 1)" : `1 + 3 + 5 + … + ${2 * n - 1}`, { class: "sol-line" });
      c.text(X0, 170, s === 3 ? "= k²" : `= ${n}² = ${n * n}`, { class: "sol-big small" });
    }
  },
};
