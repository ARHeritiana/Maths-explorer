// Animated solution of the star challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
import { el, pillAt, white, P, mid, ez } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { TAU, easeInOut, seg, lerp, clamp01 } from "../common/scene-kit.js";
import { starK, starSumDegrees } from "./maths.js";

/* ================================================================= the star */
export const scene = {
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

/* ------------------------------------------------------------------ star */
export const diagram = {
  size: [520, 300],
  steps: (q) => { const n = q.n, k = starK(q.n, q.k); return [
    P(`${n} points réguliers sur un cercle, chacun relié au ${k}-ième suivant : l’étoile {${n}/${k}}.`, `${n} regular points on a circle, each joined to the ${k}th next one: the star {${n}/${k}}.`),
    P("Regardons une pointe : ses deux côtés sont deux cordes issues du même point du cercle. L’angle de la pointe est un angle inscrit.", "Look at one tip: its two sides are two chords from the same point of the circle. The tip angle is an inscribed angle."),
    P(`Il intercepte l’arc situé en face de la pointe : n − 2k = ${n - 2 * k} pas de 360°/${n} = ${Math.round((360 / n) * 100) / 100}°.`, `It intercepts the arc opposite the tip: n − 2k = ${n - 2 * k} steps of 360°/${n} = ${Math.round((360 / n) * 100) / 100}°.`),
    P(`Un angle inscrit vaut la moitié de l’arc intercepté : ½ × ${n - 2 * k} × 360°/${n} = ${Math.round(((180 * (n - 2 * k)) / n) * 100) / 100}° par pointe.`, `An inscribed angle is half the intercepted arc: ½ × ${n - 2 * k} × 360°/${n} = ${Math.round(((180 * (n - 2 * k)) / n) * 100) / 100}° per tip.`),
    P(`Pour les ${n} pointes : ${n} × ${Math.round(((180 * (n - 2 * k)) / n) * 100) / 100}° = 180° × ${n - 2 * k} = ${starSumDegrees(n, k)}°.`, `For the ${n} tips: ${n} × ${Math.round(((180 * (n - 2 * k)) / n) * 100) / 100}° = 180° × ${n - 2 * k} = ${starSumDegrees(n, k)}°.`),
  ]; },
  draw(c, s, p, q) {
    const n = q.n, k = starK(q.n, q.k), CX = 190, CY = 150, R = 125, Pt = (i, r = R) => [CX + r * Math.cos((TAU * i) / n - Math.PI / 2), CY + r * Math.sin((TAU * i) / n - Math.PI / 2)];
    c.circ(CX, CY, R, { fill: "none", stroke: "var(--line-strong)", "stroke-width": 1.5 });
    for (let i = 0; i < n; i++) c.line(...Pt(i), ...Pt((i + k) % n), { stroke: colour(1), "stroke-width": s === 0 ? 3 * ez(seg(p, i / n * 0.8, i / n * 0.8 + 0.25)) : 2, opacity: s >= 1 ? 0.45 : 1 });
    for (let i = 0; i < n; i++) c.circ(...Pt(i), 3.5, { fill: colour(0) });
    if (s >= 1) {
      const o = Pt(0), u = Pt(k), v = Pt(n - k);
      c.line(...o, ...u, { stroke: colour(1), "stroke-width": 5 }); c.line(...o, ...v, { stroke: colour(1), "stroke-width": 5 });
      c.circ(...o, 7, { fill: colour(2), stroke: "var(--ink)", "stroke-width": 2 });
      if (s >= 2) {   // the arc from vertex k to vertex n − k, the long way round from the bottom
        const k2 = s === 2 ? ez(seg(p, 0, 0.9)) : 1, a0 = (TAU * k) / n - Math.PI / 2, steps = n - 2 * k, a1 = a0 + (TAU * steps * k2) / n, A0 = [CX + R * Math.cos(a0), CY + R * Math.sin(a0)], A1 = [CX + R * Math.cos(a1), CY + R * Math.sin(a1)];
        c.path(`M${A0.join(" ")}A${R} ${R} 0 ${steps * k2 > n / 2 ? 1 : 0} 1 ${A1.join(" ")}`, { fill: "none", stroke: colour(3), "stroke-width": 7, "stroke-linecap": "round" });
      }
    }
    c.text(420, 90, s <= 1 ? `{${n}/${k}}` : s === 2 ? `${n - 2 * k} × 360°/${n}` : s === 3 ? `${Math.round(((180 * (n - 2 * k)) / n) * 100) / 100}°` : `${starSumDegrees(n, k)}°`, { ...mid, class: s === 4 ? "sol-hot" : "sol-big small" });
    c.text(420, 118, [c.t("l’étoile", "the star"), c.t("angle inscrit", "inscribed angle"), c.t("arc intercepté", "intercepted arc"), c.t("par pointe", "per tip"), c.t("somme des angles", "sum of the angles")][s], { ...mid, class: "sol-sub" });
  },
};
