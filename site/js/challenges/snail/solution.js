// Animated solution of the snail challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
import { el, pillAt as pill, white, P, ez, ink } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { easeInOut, seg, lerp } from "../common/scene-kit.js";
import { dayScene } from "../common/scene-props.js";
import { makeSnail } from "./art.js";
import { snailTrace, snailDown, snailDays } from "./maths.js";

/* ================================================================= the snail */
export const scene = {
  size: [520, 300],
  dur: (s, q) => { const tr = snailTrace(Number(q.h), Number(q.up), Number(q.down)); return [2800, Math.min(11000, 1400 + tr.length * 900), 4200, 4200][s] ?? 3000; },
  steps: null,
  mount(c, q) {
    const svg = c.svg, H = Number(q.h);
    const day = el("g", {}, svg), night = el("g", {}, svg);
    dayScene(day, { ground: 262 });
    el("rect", { width: 520, height: 300, fill: "#0e1336" }, night);
    for (let i = 0; i < 24; i++) el("circle", { cx: (i * 211 + 37) % 520, cy: 8 + ((i * 83) % 150), r: 0.9 + (i % 3) * 0.4, fill: "#fff8d6", class: "sc-star", style: `--d:${(i % 7) * 0.4}s` }, night);
    el("circle", { cx: 460, cy: 52, r: 22, fill: "#fff3c4" }, night); el("circle", { cx: 452, cy: 46, r: 4, fill: "#e9d89c", opacity: 0.7 }, night);
    el("path", { d: "M0 226 Q120 196 240 226 T520 222 V262 H0Z", fill: "#202658" }, night); el("rect", { x: 0, y: 262, width: 520, height: 38, fill: "#1d3b2c" }, night);
    // the pole
    const PX = 110, TOP = 70, BOT = 262, py = (h) => BOT - (h / H) * (BOT - TOP);
    el("rect", { x: PX - 9, y: TOP, width: 18, height: BOT - TOP, rx: 4, fill: "#a8723f", stroke: "#4b2d14", "stroke-width": 2 }, svg);
    for (let m = 1; m <= H; m++) if (H <= 24 || m % Math.ceil(H / 12) === 0) { el("line", { x1: PX - 9, y1: py(m), x2: PX + 3, y2: py(m), stroke: "#4b2d14", "stroke-width": 1.2 }, svg); const t = el("text", { x: PX - 14, y: py(m) + 3.5, "text-anchor": "end", style: "font:600 9px var(--body);fill:#4b2d14" }, svg); t.textContent = `${m} m`; }
    el("path", { d: `M${PX} ${TOP} v-16 h26 l-7 6 l7 6 h-26`, fill: "#d32f2f", stroke: "#7a1212", "stroke-width": 1.4 }, svg);
    // the climb graph (sawtooth) on the right
    const GX0 = 230, GX1 = 500, GY = (h) => py(h);
    el("rect", { x: GX0 - 14, y: 52, width: GX1 - GX0 + 28, height: BOT - 52 + 8, rx: 12, fill: "#0a0f2c", opacity: 0.62 }, svg);
    el("line", { x1: GX0, y1: py(H), x2: GX1, y2: py(H), stroke: "#5fd0a0", "stroke-width": 1.6, "stroke-dasharray": "6 5" }, svg);
    const hl = el("text", { x: GX1, y: py(H) - 5, "text-anchor": "end", style: "font:700 12px var(--body);fill:#5fd0a0" }, svg); hl.textContent = `${H} m`;
    const trail = el("path", { fill: "none", stroke: "#ffa94d", "stroke-width": 3, "stroke-linejoin": "round", "stroke-linecap": "round" }, svg);
    const dotG = el("circle", { r: 5, fill: "#fff" }, svg);
    const hi = el("path", { fill: "none", stroke: "#5fd0a0", "stroke-width": 6, "stroke-linecap": "round", opacity: 0 }, svg);
    const sn = makeSnail(svg), board = pill(svg, 214, 10, 220, 30), label = el("text", { x: 324, y: 32, "text-anchor": "middle", style: white(16) }, board);
    const card = el("rect", { x: 222, y: 58, width: 266, height: 100, rx: 10, fill: "#0a0f2c", opacity: 0 }, svg), info = el("g", {}, svg), lines = [0, 1, 2].map((i) => el("text", { x: 236, y: 82 + i * 28, style: i === 2 ? "font:700 16px var(--body);fill:#5fd0a0" : "font:600 14px var(--body);fill:#fff" }, info));
    const sun = el("text", { x: 150, y: 70, style: "font:700 22px var(--body)" }, svg);
    return { c, day, night, py, PX, GX0, GX1, trail, dotG, sn, label, sun, hi, lines, card, trace: snailTrace(H, Number(q.up), Number(q.down)), H, GY };
  },
  update(S, step, p, q) {
    const { c, day, night, py, PX, GX0, GX1, trail, dotG, sn, label, sun, hi, lines, card, trace, H } = S, up = Number(q.up), d = snailDown(up, Number(q.down));
    // the sequence of heights: day 1 start 0, peak, night end, ... (each entry is one half-day)
    const hs = [0]; for (const t of trace) { hs.push(t.peak); if (!t.done) hs.push(t.end); }
    const total = hs.length - 1;
    const px = (i) => GX0 + (i / Math.max(total, 1)) * (GX1 - GX0);
    let pos = step === 0 ? 0 : step === 1 ? easeInOut(seg(p, 0.04, 0.96)) * total : total, k = Math.min(total - 1, Math.floor(pos)), f = pos - k;
    if (step >= 2) { k = total - 1; f = 1; }
    const h = total ? lerp(hs[k], hs[k + 1], f) : 0, goingUp = k % 2 === 0;
    const dayNo = Math.floor(k / 2) + 1, isDay = step === 0 || goingUp || step >= 2;
    day.setAttribute("opacity", String(isDay ? 1 : 0)); night.setAttribute("opacity", String(isDay ? 0 : 1));
    sun.textContent = "";
    sn.set({ x: PX + 16, y: py(h) + 6, rot: -90, dir: 1, size: 1.5, stretch: 1 + 0.12 * Math.sin(pos * 6.283 * 3) * (step === 1 ? 1 : 0), mood: goingUp || step !== 1 ? "ok" : "scared" });
    // trail
    const idx = step === 0 ? 0 : step === 1 ? k + f : total;
    const pts = [[0, 0]]; for (let i = 1; i <= Math.floor(idx); i++) pts.push([i, hs[i]]);
    if (idx < total && step === 1) pts.push([idx, h]);
    trail.setAttribute("d", step === 0 ? "" : `M${pts.map(([i, v]) => `${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join("L")}`);
    const last = pts.at(-1); dotG.setAttribute("cx", px(last[0])); dotG.setAttribute("cy", py(last[1])); dotG.setAttribute("opacity", step === 0 ? 0 : 1);
    label.textContent = step === 0 ? `${H} m` : step === 1 ? `${c.t(isDay ? "jour" : "nuit", isDay ? "day" : "night")} ${dayNo} : ${h.toFixed(h % 1 ? 1 : 0)} m` : `${c.t("jour", "day")} ${snailDays(H, up, Number(q.down))}`;
    S.label.style.fill = step >= 2 ? "#5fd0a0" : "#fff";
    // texts inside the graph panel, and the highlight of the last day
    const g = up - d, start = Math.max(0, H - up), full = Math.ceil(start / g), dayLast = full + 1;
    const L = { 0: [c.t(`Le jour : +${up} m`, `By day: +${up} m`), c.t(`La nuit : −${d} m`, `By night: −${d} m`), c.t(`Net : +${g} m par jour complet`, `Net: +${g} m per full day`)],
      2: [c.t("Dernier jour : il part de", "Last day: it starts from"), c.t(`${(full * g).toFixed(0)} m et monte de ${up} m`, `${(full * g).toFixed(0)} m and climbs ${up} m`), c.t("Pas de nuit : il ne glisse pas", "No night: it cannot slip")],
      3: [c.t(`Jours complets : ⌈${start} ÷ ${g}⌉ = ${full}`, `Full days: ⌈${start} ÷ ${g}⌉ = ${full}`), c.t(`+ le jour de la montée finale`, `+ the final climbing day`), c.t(`Jour ${dayLast}`, `Day ${dayLast}`)] }[step];
    lines.forEach((t, i) => { t.textContent = L ? L[i] : ""; t.setAttribute("opacity", String(L ? easeInOut(seg(p, i * 0.18, i * 0.18 + 0.3)) : 0)); });
    if (step === 1) lines.forEach((t) => { t.textContent = ""; });
    card.setAttribute("opacity", String(L && step !== 1 ? 0.9 * easeInOut(seg(p, 0, 0.2)) : 0)); trail.setAttribute("opacity", step === 2 || step === 3 ? "0.5" : "1");
    const lastI = total - 1; hi.setAttribute("d", `M${px(lastI).toFixed(1)} ${py(hs[lastI]).toFixed(1)} L${px(total).toFixed(1)} ${py(hs[total]).toFixed(1)}`); hi.setAttribute("opacity", String(step === 2 ? easeInOut(seg(p, 0, 0.3)) : 0));
    void d; void GX1;
  },
};

/* ----------------------------------------------------------------- snail */
export const diagram = {
  size: [520, 300],
  steps: (q) => { const d = snailDown(q.up, q.down), g = q.up - d, days = snailDays(q.h, q.up, q.down); return [
    P(`Un poteau de ${q.h} m. Chaque jour l’escargot monte de ${q.up} m, chaque nuit il redescend de ${d} m. Que se passe-t-il au fil des jours ?`, `A ${q.h} m post. Each day the snail climbs ${q.up} m, each night it slips ${d} m. What happens as the days go by?`),
    P(`Jour après jour, la hauteur monte en dents de scie. Chaque jour complet fait gagner ${q.up} − ${d} = ${g} m.`, `Day after day the height rises like a saw blade. Each full day gains ${q.up} − ${d} = ${g} m.`),
    P(`Le dernier jour, l’escargot atteint le sommet : il n’y a pas de nuit pour le faire glisser. Il lui suffit de démarrer ce jour-là à au moins ${Math.max(0, q.h - q.up)} m.`, `On the last day the snail reaches the top: there is no night to make it slip. It is enough to start that day at ${Math.max(0, q.h - q.up)} m or more.`),
    P(`Il faut ⌈${Math.max(0, q.h - q.up)}/${g}⌉ = ${Math.ceil(Math.max(0, q.h - q.up) / g)} jour${Math.ceil(Math.max(0, q.h - q.up) / g) > 1 ? "s" : ""} complet${Math.ceil(Math.max(0, q.h - q.up) / g) > 1 ? "s" : ""}, puis le jour de la montée finale : jour ${days}.`, `It takes ⌈${Math.max(0, q.h - q.up)}/${g}⌉ = ${Math.ceil(Math.max(0, q.h - q.up) / g)} full day${Math.ceil(Math.max(0, q.h - q.up) / g) > 1 ? "s" : ""}, then the day of the final climb: day ${days}.`),
  ]; },
  draw(c, s, p, q) {
    const H = q.h, d = snailDown(q.up, q.down), tr = snailTrace(H, q.up, q.down), steps = []; tr.forEach((x) => { steps.push(x.peak); if (!x.done) steps.push(x.end); });
    const PY0 = 30, PY1 = 270, py = (h) => PY1 - (h / H) * (PY1 - PY0), total = steps.length, px = (i) => 130 + (i / Math.max(total, 1)) * 370;
    c.rect(52, PY0, 16, PY1 - PY0, { rx: 4, fill: "color-mix(in srgb, var(--c7) 45%, var(--surface))", stroke: "var(--ink)", "stroke-width": 1.5 });
    c.line(130, py(H), 505, py(H), { stroke: colour(2), "stroke-width": 2, "stroke-dasharray": "6 5" }); c.line(130, PY1, 505, PY1, { stroke: "var(--line-strong)" });
    c.text(505, py(H) - 6, `${H} m`, { "text-anchor": "end", class: "sol-label" });
    const half = s === 0 ? 0 : s === 1 ? ez(seg(p, 0, 0.95)) * total : total, k = Math.floor(half), f = half - k;
    const pts = [[0, 0], ...steps.slice(0, k).map((h, i) => [i + 1, h])];
    if (k < total) pts.push([k + f, lerp(k === 0 ? 0 : steps[k - 1], steps[k], f)]);
    if (s >= 1) c.path(`M${pts.map(([i, h]) => `${px(i)} ${py(h)}`).join("L")}`, { fill: "none", stroke: colour(0), "stroke-width": 4, "stroke-linejoin": "round" });
    if (s >= 1) { const [i, h] = pts.at(-1); c.circ(px(i), py(h), 6, { fill: colour(0) }); }
    if (s === 3) c.text(300, 292, `${c.t("jour", "day")} ${snailDays(H, q.up, q.down)}`, { ...ink, class: "sol-hot" });
    void d;
  },
};
