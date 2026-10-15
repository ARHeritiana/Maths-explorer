// Cartoon solutions, batch 1: the ostrich eggs, the snail and the pole. Same protocol as solution-bridge.js:
// mount(c, q) builds the scene once, update(S, step, p, q) poses it; a frame is a pure function of (step, p).
import { svgEl } from "./challenge-kit.js";
import { eggPlan, eggCover, eggDrops } from "./challenge-variants.js";
import { snailDown, snailTrace, snailDays, eggWeighings, splitThree, classicSample, minSample } from "./challenge-puzzles.js";
import { lerp, seg, easeInOut, clamp01 } from "./scene-kit.js";
import { dayScene, makeEgg, makeSnail, makeBalance, coinSvg } from "./scene-props.js";

const P = (fr, en) => [fr, en];
const el = svgEl;
const pill = (parent, x, y, w, h) => { const g = el("g", {}, parent); el("rect", { x, y, width: w, height: h, rx: h / 2, fill: "#0a0f2c", opacity: 0.74 }, g); return g; };
const white = (size) => `font:700 ${size}px var(--body);fill:#fff`;

/* ================================================================= the ostrich eggs */
const GROUND = 262, BX = 40, BW = 112, ROOF = 56;
const eggs = {
  size: [520, 300],
  dur: (s) => [3600, 6200, 7600, 4200, 3400][s] ?? 3000,
  steps: null,   // filled below from the previous definition, so the captions stay identical
  mount(c, q) {
    const svg = c.svg, F = Number(q.floors), plan = eggPlan(Number(q.eggs), F);
    dayScene(svg, { ground: GROUND });
    const fy = (f) => GROUND - (clamp01(f / F)) * (GROUND - ROOF - 4);      // y of the floor level f (0 = ground)
    // the building: a block with rows of windows, a roof, a door
    el("rect", { x: BX, y: ROOF, width: BW, height: GROUND - ROOF, rx: 3, fill: "#d9c3a0", stroke: "#6b5a3a", "stroke-width": 2 }, svg);
    el("rect", { x: BX - 6, y: ROOF - 8, width: BW + 12, height: 10, rx: 3, fill: "#b4533c", stroke: "#6b5a3a", "stroke-width": 2 }, svg);
    const rows = Math.min(F, 22);
    for (let r = 0; r < rows; r++) for (let k = 0; k < 3; k++) el("rect", { x: BX + 14 + k * 34, y: ROOF + 8 + r * ((GROUND - ROOF - 30) / rows), width: 20, height: Math.max(5, (GROUND - ROOF - 30) / rows - 5), rx: 2, fill: "#9fd3f2", stroke: "#5b7a90", "stroke-width": 1 }, svg);
    el("rect", { x: BX + BW / 2 - 12, y: GROUND - 26, width: 24, height: 26, rx: 3, fill: "#7a4a24", stroke: "#4b2d14", "stroke-width": 1.5 }, svg);
    // the elevator ledge the egg stands on, and the floor flags (one per planned floor)
    const ledge = el("g", {}, svg);
    el("rect", { x: BX + BW - 2, y: 0, width: 34, height: 6, rx: 2, fill: "#8a5a36", stroke: "#4b2d14", "stroke-width": 1.3 }, ledge);
    el("line", { x1: BX + BW + 14, y1: -300, x2: BX + BW + 14, y2: 0, stroke: "#4b2d14", "stroke-width": 1.2, "stroke-dasharray": "3 3", opacity: 0.55 }, ledge);
    const flags = plan.floors.map((f) => { const g = el("g", { transform: `translate(${BX - 1} ${fy(f)})`, opacity: 0 }, svg); el("line", { x1: 0, y1: 0, x2: 0, y2: -15, stroke: "#4b2d14", "stroke-width": 1.6 }, g); el("path", { d: "M0 -15 h-27 l6 6 l-6 6 h27z", fill: "#e8710a", stroke: "#7a3a05", "stroke-width": 1.1 }, g); const t = el("text", { x: -13, y: -6, "text-anchor": "middle", style: "font:700 9px var(--body);fill:#fff" }, g); t.textContent = f; return g; });
    const eggA = makeEgg(svg), eggB = makeEgg(svg, { shell: "#e8f4ff", spot: "#bcd3e6" });
    const board = pill(svg, 176, 12, 250, 34), label = el("text", { x: 301, y: 35, "text-anchor": "middle", style: white(17) }, board);
    // bars of the worst cases (steps 3 and 4)
    const panel = el("g", { opacity: 0 }, svg), bars = [];
    const rowsN = plan.floors.length, rh = Math.min(15, 136 / rowsN), W = 250 / plan.drops, panelH = 26 + rowsN * (rh + 2) + 30;
    el("rect", { x: 232, y: 56, width: 278, height: panelH, rx: 12, fill: "#0a0f2c", opacity: 0.74 }, panel);
    plan.floors.forEach((f, i) => {
      const y = 66 + i * (rh + 2), before = i ? plan.floors[i - 1] : 0, gap = Math.max(0, f - before - 1), extra = eggDrops(Number(q.eggs) - 1, gap);
      const a = el("rect", { x: 244, y, width: 1, height: rh, rx: 3, fill: "#6ea8ff" }, panel), b = el("rect", { x: 244, y, width: 1, height: rh, rx: 3, fill: "#ffa94d" }, panel);
      const t = el("text", { x: 248, y: y + rh * 0.74, style: `font:700 ${Math.min(11, rh * 0.8)}px var(--body);fill:#fff;paint-order:stroke;stroke:#0a0f2c;stroke-width:2px` }, panel);
      bars.push({ a, b, t, k: i + 1, extra, y });
    });
    const verdict = el("text", { x: 371, y: 56 + panelH - 12, "text-anchor": "middle", style: white(14) }, panel);
    return { c, F, plan, fy, ledge, flags, eggA, eggB, board, label, panel, bars, W, verdict, e: Number(q.eggs) };
  },
  update(S, step, p, q) {
    const { c, F, plan, fy, ledge, flags, eggA, eggB, label, panel, bars, W, verdict, e } = S, fl = plan.floors, n = plan.drops;
    const gap = (j) => (fl[j] ?? F) - (j ? fl[j - 1] : 0) - 1, cost = (j) => eggDrops(e - 1, Math.max(0, gap(j)));
    const ex = BX + BW + 16, groundY = GROUND + 10;
    const fall = (f, t) => lerp(fy(f) - 6, groundY, t * t);                // gravity: distance grows with t squared
    const state = { a: { x: ex, y: groundY, scale: 0 }, b: { x: ex + 52, y: groundY, scale: 0 } };
    let ledgeF = 0, text = "", flagShown = 0, panelOp = 0, bar = 0;
    const standOn = (f) => fy(f) - 6;

    if (step === 0) {
      const f = Math.max(1, Math.round(easeInOut(p) * F));
      ledgeF = f; Object.assign(state.a, { x: ex + 14, y: standOn(f), scale: 1, face: "ok" });
      text = `${c.t("lancers", "drops")} : ${f}`;
    } else if (step === 1 || step === 2) {
      // scenario 1: the first egg breaks at the first planned floor. Scenario 2: it survives there and breaks at the next.
      const seq = step === 1 ? [[0, true]] : [[0, false], [1, true]];
      const total = seq.length, per = 0.62 / total;
      let k = 0, tt = p;
      const idx = Math.min(total - 1, Math.floor(p / per)); tt = p - idx * per;
      const [j, breaks] = seq[Math.min(idx, total - 1)];
      const f = fl[j], prevDrops = idx;
      const upT = seg(tt, 0, per * 0.32), holdT = seg(tt, per * 0.32, per * 0.45), downT = seg(tt, per * 0.45, per * 0.72), impT = seg(tt, per * 0.72, per);
      if (p < per * total) {
        const fromF = j ? fl[j - 1] : 0;
        const level = lerp(idx === 0 ? 1 : fromF, f, easeInOut(upT)); ledgeF = level;
        let y = standOn(level), face = upT < 1 ? "ok" : "scared", sx = 1, sy = 1, crack = 0, splat = 0, rot = 0;
        if (holdT > 0 && downT === 0) rot = 6 * Math.sin(holdT * 24);
        if (downT > 0) { y = fall(f, downT); face = "scared"; rot = 18 * downT; }
        if (impT > 0) {
          y = groundY;
          if (breaks) { crack = clamp01(impT * 3); splat = clamp01((impT - 0.25) * 1.6); face = "dizzy"; rot = 0; }
          else { const b = Math.sin(impT * Math.PI); y = groundY - 14 * b * (1 - impT); sy = 1 - 0.18 * Math.max(0, 1 - impT * 5); sx = 1 + 0.12 * Math.max(0, 1 - impT * 5); face = "dizzy"; rot = 0; }
        }
        Object.assign(state.a, { x: ex + 14, y, scale: 1, face, sx, sy, crack, splat, rot });
        text = `${c.t("lancer", "drop")} ${prevDrops + 1} : ${c.t("étage", "floor")} ${f}`;
        flagShown = j + 1;
        if (impT > 0.4) text += breaks ? `  ${c.t("clac", "crack")}` : `  ${c.t("ouf", "phew")}`;
      } else {
        // the second egg climbs floor by floor under the floor where the first one broke
        const j2 = seq.at(-1)[0], g = gap(j2), t2 = easeInOut(seg(p, per * total + 0.04, 1));
        const lvl = Math.max(1, Math.round(t2 * Math.max(1, g)));
        ledgeF = lvl; flagShown = j2 + 1;
        Object.assign(state.a, { x: ex + 14, y: groundY, scale: 1, splat: 1, face: "dizzy" });
        Object.assign(state.b, { x: ex + 14, y: standOn(lvl), scale: easeInOut(seg(p, per * total, per * total + 0.05)), face: t2 >= 1 ? "happy" : "ok" });
        const extraDrops = Math.round(t2 * cost(j2));
        const tot = j2 + 1 + extraDrops; text = `${j2 + 1} + ${extraDrops} = ${tot} ${c.t(tot > 1 ? "lancers" : "lancer", tot > 1 ? "drops" : "drop")}`;
      }
      void k;
    } else {
      flagShown = fl.length; panelOp = easeInOut(seg(p, 0, 0.18));
      bar = step === 3 ? easeInOut(seg(p, 0.1, 0.9)) : 1;
      Object.assign(state.a, { x: ex + 14, y: standOn(fl[fl.length - 1]), scale: 1, face: "happy" });
      ledgeF = fl[fl.length - 1];
      text = step === 3 ? `${c.t("lancers", "drops")} ≤ ${n}` : `${c.t("pire cas", "worst case")} : ${n}`;
    }
    S.ledge.setAttribute("transform", `translate(0 ${fy(Math.max(ledgeF, 0.3)).toFixed(2)})`);
    eggA.set({ face: "ok", ...state.a }); eggB.set({ face: "ok", ...state.b });
    flags.forEach((g, i) => g.setAttribute("opacity", String(clamp01(flagShown - i))));
    label.textContent = text; S.board.setAttribute("opacity", text ? 1 : 0);
    panel.setAttribute("opacity", String(panelOp));
    bars.forEach((b) => { const a = b.k * W * clamp01(bar * 1.2), x = b.extra * W * clamp01(bar * 1.2); b.a.setAttribute("width", Math.max(1, a).toFixed(1)); b.b.setAttribute("x", (244 + a).toFixed(1)); b.b.setAttribute("width", Math.max(0.1, x).toFixed(1)); b.t.setAttribute("x", "248"); b.t.textContent = bar > 0.95 ? `${b.k} + ${b.extra} = ${b.k + b.extra}` : ""; });
    verdict.textContent = step === 4 ? `${eggCover(e, n - 1)} < ${q.floors} ≤ ${eggCover(e, n)}` : "";
  },
};

/* ================================================================= the snail */
const snail = {
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


/* ================================================================= the spoiled egg (three-way weighing) */
const eggDot = (g, x, y, r, fill, op = 1, glow = false) => {
  if (glow) el("circle", { cx: x, cy: y, r: r * 1.9, fill: "#5fd0a0", opacity: 0.5 * op }, g);
  el("ellipse", { cx: x, cy: y, rx: r * 0.8, ry: r, fill, stroke: "#7a6a48", "stroke-width": 1, opacity: op }, g);
  el("ellipse", { cx: x - r * 0.25, cy: y - r * 0.35, rx: r * 0.2, ry: r * 0.3, fill: "#fff", opacity: 0.55 * op }, g);
};
const lighteggs = {
  size: [520, 300],
  dur: (s, q) => { const K = eggWeighings(Number(q.n)); return s === 0 ? 4200 : s <= K ? 4600 : 3600; },
  steps: null,
  mount(c, q) {
    const svg = c.svg;
    dayScene(svg, { ground: 262 });
    el("rect", { x: 0, y: 214, width: 256, height: 86, fill: "#b9814a" }, svg); el("rect", { x: 0, y: 214, width: 256, height: 8, fill: "#d9a86a" }, svg);
    const hold = el("g", {}, svg), bal = makeBalance(svg, { x: 392, y: 118, arm: 78, post: 100 });
    const board = pill(svg, 240, 8, 270, 30), label = el("text", { x: 375, y: 30, "text-anchor": "middle", style: white(16) }, board);
    const tag = el("text", { x: 392, y: 262, "text-anchor": "middle", style: "font:700 14px var(--body);fill:#fff;paint-order:stroke;stroke:#3a5a3a;stroke-width:3px" }, svg);
    return { c, hold, bal, label, tag, board };
  },
  update(S, step, p, q) {
    const { c, hold, bal, label, tag } = S, N = Number(q.n), K = eggWeighings(N), cols = Math.min(N, Math.ceil(Math.sqrt(N * 1.4))), rows = Math.ceil(N / cols);
    const size = Math.min(30, 230 / cols, 170 / rows), ox = 14, oy = 212 - rows * (size + 3);
    let lo = 0, cur = N; const rangeAt = [];
    for (let i = 0; i < K; i++) { const [a, , r] = splitThree(cur, K - i); rangeAt.push({ lo, cur, a, r }); if (a >= r) cur = a; else { lo += 2 * a; cur = r; } }
    const lastLo = rangeAt.length ? (() => { const z = rangeAt.at(-1); return z.a >= z.r ? z.lo : z.lo + 2 * z.a; })() : 0;
    const w = step >= 1 && step <= K ? rangeAt[step - 1] : null, fin = step > K;
    // the eggs on the table, coloured by pile during a weighing
    hold.replaceChildren();
    const slot = (i) => [ox + (i % cols) * (size + 3) + size / 2, oy + Math.floor(i / cols) * (size + 3) + size / 2];
    for (let i = 0; i < N; i++) {
      const [x, y] = slot(i); let fill = "#fbf0d6", op = 1, glow = false;
      if (w) { const off = i - w.lo; if (off < 0 || off >= w.cur) op = 0.2; else fill = off < w.a ? "#9cc4ff" : off < 2 * w.a ? "#ffc58a" : "#a8e6b8"; }
      if (fin) { op = i === lastLo ? 1 : 0.16; fill = i === lastLo ? "#fff2a8" : fill; glow = i === lastLo; }
      eggDot(hold, x, y + (glow ? -4 * Math.abs(Math.sin(p * 9)) : 0), size * 0.46, fill, op, glow);
    }
    // balance: demo of the three outcomes at step 0, then the real weighing
    let angle = 0, left = null, right = null, text = "", tg = "";
    const pile = (cnt, col) => (g) => { const m = Math.min(cnt, 6); for (let i = 0; i < m; i++) eggDot(g, (i - (m - 1) / 2) * 11, -9, 7, col); if (cnt > 6) { const t = el("text", { y: -22, "text-anchor": "middle", style: "font:700 13px var(--body);fill:#222" }, g); t.textContent = `×${cnt}`; } };
    if (step === 0) {
      const ph = Math.min(2, Math.floor(p * 3)), t = p * 3 - ph, T = [13, 0, -13], prev = ph ? T[ph - 1] : 0;
      angle = lerp(prev, T[ph], easeInOut(seg(t, 0, 0.5))) + 2 * Math.sin(t * 16) * (1 - seg(t, 0.3, 0.95));
      left = pile(3, "#9cc4ff"); right = pile(3, "#ffc58a");
      text = c.t("une balance, trois issues", "one balance, three outcomes");
      tg = [c.t("gauche plus légère", "left lighter"), c.t("équilibre", "balanced"), c.t("droite plus légère", "right lighter")][ph];
    } else if (w) {
      const leftLight = w.a >= w.r;   // the spoiled egg is in the left pile when it is the larger suspect group
      const land = easeInOut(seg(p, 0.08, 0.38)), tilt = easeInOut(seg(p, 0.4, 0.62));
      const target = leftLight ? 13 : 0;
      angle = target * tilt + (target ? 2.2 * Math.sin(seg(p, 0.5, 0.9) * 18) * (1 - seg(p, 0.5, 0.9)) : 0);
      left = pile(Math.round(w.a * land), "#9cc4ff"); right = pile(Math.round(w.a * land), "#ffc58a");
      text = `${c.t("Pesée", "Weighing")} ${step} / ${K}`;
      tg = tilt > 0.9 ? (leftLight ? c.t(`gauche plus légère : ${w.a} suspect${w.a > 1 ? "s" : ""}`, `left lighter: ${w.a} suspect${w.a > 1 ? "s" : ""}`) : c.t(`équilibre : ${w.r} suspect${w.r > 1 ? "s" : ""}`, `balanced: ${w.r} suspect${w.r > 1 ? "s" : ""}`)) : `${w.a} + ${w.a} + ${w.r}`;
    } else {
      text = `${K} × 3 ⇒ ≤ ${3 ** K}`; tg = c.t("l’œuf abîmé est trouvé", "the spoiled egg is found");
      left = pile(1, "#fff2a8"); angle = 0;
    }
    bal.set({ angle, left, right });
    label.textContent = text; tag.textContent = tg;
  },
};

/* ================================================================= the piles of coins and one weighing */
const fakecoins = {
  size: [520, 300],
  dur: (s) => [3000, 6400, 4200, 4200, 5200][s] ?? 3000,
  steps: null,
  mount(c, q) {
    const svg = c.svg;
    dayScene(svg, { ground: 262 });
    el("rect", { x: 0, y: 252, width: 520, height: 48, fill: "#b9814a" }, svg); el("rect", { x: 0, y: 252, width: 520, height: 7, fill: "#d9a86a" }, svg);
    const piles = el("g", {}, svg), flying = el("g", {}, svg);
    // the precise scale: a platform with the coins, a screen with the weight
    const sx = 436, sy = 138;
    el("rect", { x: sx - 62, y: sy + 10, width: 124, height: 70, rx: 12, fill: "#cfd8e3", stroke: "#4b5563", "stroke-width": 2 }, svg);
    el("rect", { x: sx - 48, y: sy + 20, width: 96, height: 28, rx: 6, fill: "#13251a", stroke: "#4b5563", "stroke-width": 1.5 }, svg);
    const read = el("text", { x: sx + 42, y: sy + 41, "text-anchor": "end", style: "font:700 20px var(--math);fill:#7dff9a" }, svg);
    const heap = el("g", {}, svg);
    el("rect", { x: sx - 66, y: sy + 2, width: 132, height: 10, rx: 4, fill: "#e8edf3", stroke: "#4b5563", "stroke-width": 2 }, svg);
    const board = pill(svg, 150, 8, 220, 30), label = el("text", { x: 260, y: 30, "text-anchor": "middle", style: white(16) }, board);
    const note = el("g", { opacity: 0 }, svg), noteT = [0, 1].map((i) => el("text", { x: 408, y: 100 + i * 0, "text-anchor": "middle", style: white(13) }, note));
    return { c, piles, flying, heap, read, label, sx, sy, note, noteT };
  },
  update(S, step, p, q) {
    const { c, piles, flying, heap, read, label, sx, sy } = S, n = Number(q.n), tot = classicSample(n), k = Math.min(7, n), minimal = step === 4;
    const M = n + 3, gap = Math.min(34, 336 / n), cw = Math.min(26, gap - 4), base = 248, ch = Math.min(6, 150 / (M + 1)), x0 = 14, LAG = 12;
    piles.replaceChildren(); flying.replaceChildren(); heap.replaceChildren();
    const taken = (i) => (minimal ? i - 1 : i), total = minimal ? minSample(n) : tot;
    // N0 = number of coins that have left their pile so far (a continuous counter, in pile order)
    const N0 = step === 0 ? 0 : step === 1 ? easeInOut(seg(p, 0.1, 0.8)) * (tot + LAG) : total + LAG;
    let cum = 0; const fly = [];
    for (let i = 1; i <= n; i++) {
      const px = x0 + (i - 1) * gap + gap / 2, tk = taken(i), fakePile = (step >= 2 && step <= 3 && i === k) || (minimal && i === n);
      for (let j = 0; j < M; j++) {
        const rank = M - 1 - j, y = base - (j + 1) * ch + ch / 2;
        if (rank < tk) {
          const idx = cum + rank, a = (N0 - idx) / LAG;      // 0 = just left its pile, 1 = landed on the scale
          if (a >= 1) continue;
          if (a > 0) { fly.push([px, y, a, idx, fakePile]); continue; }
        }
        el("ellipse", { cx: px, cy: y, rx: cw / 2, ry: Math.max(2.4, ch * 0.62), fill: fakePile ? "#d98a4a" : "#f3c84a", stroke: fakePile ? "#7a3f10" : "#8a6a10", "stroke-width": 0.9 }, piles);
      }
      cum += tk;
      const t = el("text", { x: px, y: base + 14, "text-anchor": "middle", style: `font:700 ${Math.min(12, gap * 0.45)}px var(--body);fill:${fakePile ? "#ffe0c0" : "#fff"};paint-order:stroke;stroke:#5a3a1a;stroke-width:2.5px` }, piles); t.textContent = i;
    }
    fly.forEach(([px, py, a, idx, fakeP]) => { const slotX = sx - 34 + (idx % 6) * 13; coinSvg(flying, { x: lerp(px, slotX, a), y: lerp(py, sy - 4, a) - 80 * Math.sin(a * Math.PI), r: 5, fake: fakeP }); });
    const landed = Math.max(0, Math.min(total, Math.floor(N0 - LAG)));
    for (let i = 0; i < Math.min(40, landed); i++) coinSvg(heap, { x: sx - 40 + (i % 8) * 11.5, y: sy - 3 - Math.floor(i / 8) * 6, r: 5 });
    let grams = 10 * landed;
    if (step >= 2 && !minimal) grams = 10 * tot - k * easeInOut(step === 2 ? seg(p, 0.15, 0.85) : 1);
    if (minimal) grams = 10 * total - (n - 1) * easeInOut(seg(p, 0.5, 0.9));
    read.textContent = step === 0 ? "0 g" : `${Math.round(grams)} g`;
    label.textContent = step === 0 ? c.t("une seule pesée", "a single weighing") : step === 1 ? `${landed} ${c.t(landed > 1 ? "pièces" : "pièce", landed > 1 ? "coins" : "coin")}` : step === 2 ? `${c.t("attendu", "expected")} ${10 * tot} g` : step === 3 ? `${10 * tot} − ${10 * tot - k} = ${k}` : `0 + 1 + … + ${n - 1} = ${minSample(n)}`;
    if (step === 3) { const px = x0 + (k - 1) * gap + gap / 2; const a = easeInOut(seg(p, 0, 0.3)); el("path", { d: `M${px} ${base - ch * (M + 1) - 34} v22 m-8 -8 l8 8 l8 -8`, fill: "none", stroke: "#ffe08a", "stroke-width": 4, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: a, transform: `translate(0 ${(6 * Math.sin(p * 14)).toFixed(1)})` }, flying); }
  },
};

export const SCENES_1 = { eggs, snail, lighteggs, fakecoins };
