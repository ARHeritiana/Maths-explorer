// Animated solution of the lighteggs challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
import { el, pillAt as pill, white, P, ink } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { lerp, easeInOut, seg } from "../common/scene-kit.js";
import { dayScene, makeBalance } from "../common/scene-props.js";
import { eggWeighings, splitThree } from "./maths.js";

/* ================================================================= the spoiled egg (three-way weighing) */
export const eggDot = (g, x, y, r, fill, op = 1, glow = false) => {
  if (glow) el("circle", { cx: x, cy: y, r: r * 1.9, fill: "#5fd0a0", opacity: 0.5 * op }, g);
  el("ellipse", { cx: x, cy: y, rx: r * 0.8, ry: r, fill, stroke: "#7a6a48", "stroke-width": 1, opacity: op }, g);
  el("ellipse", { cx: x - r * 0.25, cy: y - r * 0.35, rx: r * 0.2, ry: r * 0.3, fill: "#fff", opacity: 0.55 * op }, g);
};

export const scene = {
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

/* ------------------------------------------------------------ light egg */
export const diagram = {
  size: [520, 300],
  steps: (q) => { const k = eggWeighings(q.n); let size = q.n; const out = [P(`${q.n} œufs, un seul plus léger. Une balance à deux plateaux a trois issues : gauche plus léger, droite plus léger, équilibre.`, `${q.n} eggs, one lighter. A two-pan balance has three outcomes: left lighter, right lighter, balanced.`)];
    for (let i = 0; i < k; i++) { const [a, , r] = splitThree(size, k - i); out.push(P(`Pesée ${i + 1} : ${size} œufs suspects, en trois paquets : ${a} à gauche, ${a} à droite, ${r} à côté. Au pire il reste ${Math.max(a, r)} suspect${Math.max(a, r) > 1 ? "s" : ""}.`, `Weighing ${i + 1}: ${size} suspect eggs in three piles: ${a} on the left, ${a} on the right, ${r} aside. At worst ${Math.max(a, r)} suspect${Math.max(a, r) > 1 ? "s" : ""} remain.`)); size = Math.max(a, r); }
    out.push(P(`Après ${k} pesée${k > 1 ? "s" : ""}, un seul œuf reste : l’abîmé. On ne peut pas faire moins : ${k} pesées distinguent au plus 3^${k} = ${3 ** k} cas, et il en faut ${q.n}.`, `After ${k} weighing${k > 1 ? "s" : ""}, one egg is left: the spoiled one. One cannot do fewer: ${k} weighings tell apart at most 3^${k} = ${3 ** k} cases, and ${q.n} are needed.`)); return out; },
  draw(c, s, p, q) {
    const N = q.n, K = eggWeighings(N), cols = Math.min(N, Math.ceil(Math.sqrt(N * 1.4))), rows = Math.ceil(N / cols), size = Math.min(34, 270 / cols, 250 / rows), ox = 20, oy = 30;
    let lo = 0, cur = N; const rangeAt = []; for (let i = 0; i < K; i++) { const [a, , r] = splitThree(cur, K - i); rangeAt.push({ lo, cur, a, r }); if (a >= r) { cur = a; } else { lo += 2 * a; cur = r; } }
    const w = s >= 1 && s <= K ? rangeAt[s - 1] : null, last = s > K ? { lo: rangeAt.length ? (() => { const z = rangeAt.at(-1); return z.a >= z.r ? z.lo : z.lo + 2 * z.a; })() : 0 } : null;
    for (let i = 0; i < N; i++) {
      const x = ox + (i % cols) * (size + 4), y = oy + Math.floor(i / cols) * (size + 4);
      let fill = "var(--surface)", op = 1;
      if (w) { const off = i - w.lo; if (off < 0 || off >= w.cur) op = 0.18; else fill = off < w.a ? colour(0) : off < 2 * w.a ? colour(1) : colour(2); }
      if (s > K) op = i === last.lo ? 1 : 0.15;
      c.circ(x + size / 2, y + size / 2, size / 2 - 1, { fill: s > K && i === last.lo ? colour(3) : `color-mix(in srgb, ${fill} 70%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 1.2, opacity: op });
    }
    void rows;
    if (w) {
      const cx = 395, cy = 120, a = 0;
      c.line(cx, cy + 50, cx, cy - 10, { stroke: "var(--ink)", "stroke-width": 4 }); c.line(cx - 70, cy - 10 + a, cx + 70, cy - 10 - a, { stroke: "var(--ink)", "stroke-width": 4 });
      c.path(`M${cx - 95} ${cy + 10}Q${cx - 70} ${cy + 38} ${cx - 45} ${cy + 10}Z`, { fill: colour(0), opacity: 0.7, stroke: "var(--ink)" }); c.path(`M${cx + 45} ${cy + 10}Q${cx + 70} ${cy + 38} ${cx + 95} ${cy + 10}Z`, { fill: colour(1), opacity: 0.7, stroke: "var(--ink)" });
      c.text(cx - 70, cy + 4, w.a, { ...ink, class: "sol-label", style: "fill:#fff" }); c.text(cx + 70, cy + 4, w.a, { ...ink, class: "sol-label", style: "fill:#fff" });
      c.text(cx, cy + 90, `${w.r} ${c.t("à côté", "aside")}`, { ...ink, class: "sol-sub", style: `fill:${colour(2)}` });
    }
    c.text(395, 250, s === 0 ? "3 issues" : s > K ? `${K} × 3 ⇒ ≤ ${3 ** K}` : `${c.t("Pesée", "Weighing")} ${s} / ${K}`, { ...ink, class: s > K ? "sol-hot" : "sol-line" });
  },
};
