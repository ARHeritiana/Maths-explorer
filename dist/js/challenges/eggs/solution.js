// Animated solution of the eggs challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
import { el, pillAt as pill, white, P, ez } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { clamp01, lerp, easeInOut, seg } from "../common/scene-kit.js";
import { dayScene, makeEgg } from "../common/scene-props.js";
import { eggPlan, eggDrops, eggCover } from "./maths.js";

/* ================================================================= the ostrich eggs */
export const GROUND = 262, BX = 40, BW = 112, ROOF = 56;

export const scene = {
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

/* ------------------------------------------------------------------ eggs */
export const diagram = {
  size: [520, 300],
  steps: (q) => {
    const e = Number(q.eggs), plan = eggPlan(e, q.floors), n = plan.drops, f = (d) => eggCover(e, d), fl = plan.floors, gap = (j) => (fl[j] ?? q.floors) - (j ? fl[j - 1] : 0) - 1, cost = (j) => eggDrops(e - 1, Math.max(0, gap(j)));
    return [
      P(`Avec un seul œuf, il faut monter un étage à la fois : jusqu’à ${q.floors} lancers. Avec ${e}, on peut sauter.`, `With one egg you must climb one floor at a time: up to ${q.floors} drops. With ${e} you can skip.`),
      P(`Premier œuf à l’étage ${fl[0]}. S’il se brise, il reste ${e - 1} œuf${e > 2 ? "s" : ""} pour les ${gap(0)} étages en dessous : ${cost(0)} lancers de plus, soit ${1 + cost(0)} en tout.`, `First egg at floor ${fl[0]}. If it breaks, ${e - 1} egg${e > 2 ? "s" : ""} remain for the ${gap(0)} floors below: ${cost(0)} more drops, ${1 + cost(0)} in all.`),
      P(`S’il survit, deuxième lancer à l’étage ${fl[1] ?? q.floors}. S’il se brise là : 2 lancers + ${cost(1)} = ${2 + cost(1)}.`, `If it survives, second drop at floor ${fl[1] ?? q.floors}. If it breaks there: 2 drops + ${cost(1)} = ${2 + cost(1)}.`),
      P(`On diminue le pas à chaque lancer. Étages visés : ${fl.join(", ")}. Chaque cas coûte au plus ${n} lancers.`, `Reduce the step each time. Floors dropped from: ${fl.join(", ")}. Every case costs at most ${n} drops.`),
      e === 2 ? P(`Avec k lancers on couvre k + (k − 1) + … + 1 = k(k + 1) ÷ 2 étages. ${n - 1} lancers : ${f(n - 1)} étages, ${n} lancers : ${f(n)} ≥ ${q.floors}. Minimum : ${n}.`, `With k drops you cover k + (k − 1) + … + 1 = k(k + 1) ÷ 2 floors. ${n - 1} drops: ${f(n - 1)} floors, ${n} drops: ${f(n)} ≥ ${q.floors}. Minimum: ${n}.`) : P(`Avec k lancers et 3 œufs on couvre C(k, 1) + C(k, 2) + C(k, 3) étages. ${n - 1} lancers : ${f(n - 1)} étages, ${n} lancers : ${f(n)} ≥ ${q.floors}. Minimum : ${n}.`, `With k drops and 3 eggs you cover C(k, 1) + C(k, 2) + C(k, 3) floors. ${n - 1} drops: ${f(n - 1)} floors, ${n} drops: ${f(n)} ≥ ${q.floors}. Minimum: ${n}.`),
    ];
  },
  draw(c, s, p, q) {
    const e = Number(q.eggs), plan = eggPlan(e, q.floors), n = plan.drops, fl = plan.floors;
    if (s === 0) {
      const per = 25, rows = Math.ceil(q.floors / per), cw = 450 / per, ch = Math.min(22, 120 / rows), shown = Math.round(ez(p) * q.floors);
      for (let f = 1; f <= q.floors; f++) c.rect(20 + ((f - 1) % per) * cw, 40 + Math.floor((f - 1) / per) * ch, cw - 2.5, ch - 3, { rx: 3, class: "sol-floor", style: `fill:${f <= shown ? colour(0) : "var(--surface)"}` });
      c.text(260, 190, `${c.t("lancers", "drops")} : ${shown}`, { class: "sol-big small", "text-anchor": "middle" });
      c.text(260, 224, c.t("un étage à la fois", "one floor at a time"), { class: "sol-sub", "text-anchor": "middle" });
      return;
    }
    const rows = fl.length, rh = Math.min(20, 250 / rows), W = Math.min(17, 310 / n);
    const reveal = s === 1 ? ez(p) : s === 2 ? 1 + ez(p) : s === 3 ? 2 + ez(p) * Math.max(0, rows - 2) : rows;
    for (let k = 1; k <= rows; k++) {
      const a = clamp01(reveal - (k - 1)); if (a <= 0 && s !== 4) continue;
      const y = 20 + (k - 1) * (rh + 2), f = fl[k - 1], before = k === 1 ? 0 : fl[k - 2], g = f - before - 1, extra = eggDrops(e - 1, Math.max(0, g));
      c.text(34, y + rh * 0.75, `${f}`, { class: "sol-small", "text-anchor": "end", style: `opacity:${a};font-size:${Math.min(13, rh * 0.8)}px` });
      c.rect(40, y, k * W * a, rh - 2, { rx: 3, style: `fill:${colour(0)}` });
      c.rect(40 + k * W, y, extra * W * a, rh - 2, { rx: 3, style: `fill:${colour(1)}` });
      if (rh >= 12) c.text(46 + (k + extra) * W * a, y + rh * 0.75, `${k} + ${extra} = ${k + extra}`, { class: "sol-small", style: `opacity:${a};font-size:${Math.min(13, rh * 0.8)}px` });
    }
    const xn = 40 + n * W; c.line(xn, 14, xn, 20 + rows * (rh + 2), { class: "sol-guide", style: `stroke:${colour(2)};opacity:${s >= 3 ? 1 : 0.6}` });
    c.rect(380, 28, 12, 12, { rx: 3, style: `fill:${colour(0)}` }); c.text(398, 38, c.t("lancers du 1er œuf", "drops of egg 1"), { class: "sol-small" });
    c.rect(380, 50, 12, 12, { rx: 3, style: `fill:${colour(1)}` }); c.text(398, 60, c.t(`lancers avec ${e - 1} œuf${e > 2 ? "s" : ""}`, `drops with ${e - 1} egg${e > 2 ? "s" : ""}`), { class: "sol-small" });
    if (s === 4) { c.text(380, 110, `${c.t("pire cas", "worst case")} : ${n}`, { class: "sol-hot" }); c.text(380, 150, `${eggCover(e, n - 1)} < ${q.floors} ≤ ${eggCover(e, n)}`, { class: "sol-line" }); }
  },
};
