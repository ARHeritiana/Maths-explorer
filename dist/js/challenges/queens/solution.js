// Animated solution of the queens challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
import { el, P, ez, ink } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { clamp01, easeInOut, seg } from "../common/scene-kit.js";
import { queensK, QUEENS, unattacked } from "./maths.js";

export const bounce = (u) => { const k = clamp01(u); if (k < 1 / 2.75) return 7.5625 * k * k; if (k < 2 / 2.75) { const t = k - 1.5 / 2.75; return 7.5625 * t * t + 0.75; } if (k < 2.5 / 2.75) { const t = k - 2.25 / 2.75; return 7.5625 * t * t + 0.9375; } const t = k - 2.625 / 2.75; return 7.5625 * t * t + 0.984375; };

/* ================================================================= the queens */
export const scene = {
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

/* ---------------------------------------------------------------- queens */
export const diagram = {
  size: [520, 300],
  steps: (q) => { const k = queensK(q.n, q.k), [best, ex] = QUEENS[`${q.n},${k}`]; return [
    P(`Un échiquier de ${q.n} × ${q.n} cases et ${k} dame${k > 1 ? "s" : ""}. On veut laisser le plus de cases libres, c’est-à-dire ni occupées ni attaquées.`, `A ${q.n} × ${q.n} board and ${k} queen${k > 1 ? "s" : ""}. We want to leave as many free squares as possible, that is, neither occupied nor attacked.`),
    P("Posons les dames une à une : chacune attaque sa ligne, sa colonne et ses diagonales, jusqu’à la première pièce rencontrée. Les cases attaquées sont en rouge.", "Place the queens one by one: each attacks its row, column and diagonals, up to the first piece in the way. Attacked squares are red."),
    P(`Il reste ${best} case${best > 1 ? "s" : ""} libre${best > 1 ? "s" : ""} (en vert). Les dames sont groupées : elles se gênent mutuellement et attaquent peu de lignes différentes.`, `${best} free square${best > 1 ? "s" : ""} remain (green). The queens are grouped: they block each other and cover few different lines.`),
    P(`On ne peut pas faire mieux : un ordinateur a examiné les ${(() => { let cc = 1; for (let i = 0; i < k; i++) cc = (cc * (q.n * q.n - i)) / (i + 1); return Math.round(cc); })()} placements possibles et aucun ne laisse plus de ${best} case${best > 1 ? "s" : ""} libre${best > 1 ? "s" : ""}. Ce n’est pas une preuve à la main.`, `One cannot do better: a computer examined all ${(() => { let cc = 1; for (let i = 0; i < k; i++) cc = (cc * (q.n * q.n - i)) / (i + 1); return Math.round(cc); })()} possible placements and none leaves more than ${best} free square${best > 1 ? "s" : ""}. This is not a hand proof.`),
  ]; },
  draw(c, s, p, q) {
    const n = q.n, k = queensK(n, q.k), [best, ex] = QUEENS[`${n},${k}`], C = Math.floor(260 / n), X0 = 30, Y0 = 20;
    const placed = s === 0 ? 0 : s === 1 ? Math.min(k, Math.floor(ez(seg(p, 0, 0.85)) * k + 0.001)) : k, qs = ex.slice(0, placed), free = new Set(unattacked(n, qs));
    for (let r = 0; r < n; r++) for (let col = 0; col < n; col++) {
      const sq2 = r * n + col, isQ = qs.includes(sq2), isFree = free.has(sq2) && placed > 0, attacked = !isQ && !free.has(sq2);
      c.rect(X0 + col * C, Y0 + r * C, C, C, { fill: isQ ? colour(1) : s >= 2 && isFree ? `color-mix(in srgb, ${colour(2)} 60%, var(--surface))` : attacked && placed ? "color-mix(in srgb, var(--neg) 22%, var(--surface))" : (r + col) % 2 ? "var(--sunken)" : "var(--surface)", stroke: "var(--line-strong)", "stroke-width": 1 });
      if (isQ) c.text(X0 + col * C + C / 2, Y0 + r * C + C * 0.68, "♛", { ...ink, style: `font:${C * 0.7}px var(--body);fill:#fff` });
    }
    c.text(420, 90, `${placed} / ${k}`, { ...ink, class: "sol-big small" }); c.text(420, 112, c.t("dames posées", "queens placed"), { ...ink, class: "sol-sub" });
    if (s >= 1) { c.text(420, 170, String(free.size), { ...ink, class: s >= 2 ? "sol-hot" : "sol-big small" }); c.text(420, 192, c.t("cases libres", "free squares"), { ...ink, class: "sol-sub" }); }
    if (s === 3) c.text(420, 240, c.t(`maximum : ${best}`, `maximum: ${best}`), { ...ink, class: "sol-line" });
  },
};
