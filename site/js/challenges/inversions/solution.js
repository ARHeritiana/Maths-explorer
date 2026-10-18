// Animated solution of the inversions challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
import { el, pillAt, white, P, ez, mid } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { makeSoldier, easeInOut, seg, lerp } from "../common/scene-kit.js";
import { dayScene } from "../common/scene-props.js";
import { bubbleSwaps, permOf, inversions } from "./maths.js";

/* ================================================================= the row of people */
export const scene = {
  size: [520, 300],
  dur: (s, q) => { const tot = bubbleSwaps(permOf(Number(q.n), q.seed)).log.length; return s === 0 ? 3600 : s === 1 ? 2600 : s === 2 ? Math.min(14000, 1200 + tot * 700) : 3600; },
  steps: null,
  mount(c, q) {
    const svg = c.svg, N = Number(q.n);
    dayScene(svg, { ground: 244 });
    el("rect", { x: 20, y: 236, width: 480, height: 10, rx: 4, fill: "#a8723f", stroke: "#4b2d14", "stroke-width": 1.6 }, svg);
    const people = Array.from({ length: N }, (_, v) => makeSoldier(svg, { uniform: ["#3b82f6", "#e8710a", "#2fa866", "#c2185b"][v % 4], hat: v % 4, size: 0.72 + (v / N) * 0.55, skin: ["#f1c27d", "#e0ac69", "#f5d0a9", "#d8a47f"][v % 4], label: String(v + 1) }));
    const t1 = el("text", { x: 260, y: 66, "text-anchor": "middle", style: "font:700 38px var(--math);fill:#fff;paint-order:stroke;stroke:#2a4a2a;stroke-width:5px" }, svg), t2 = el("text", { x: 260, y: 286, "text-anchor": "middle", style: "font:700 14px var(--body);fill:#fff;paint-order:stroke;stroke:#2a4a2a;stroke-width:3px" }, svg);
    const board = pillAt(svg, 90, 8, 340, 28), label = el("text", { x: 260, y: 27, "text-anchor": "middle", style: white(14) }, board);
    return { c, N, people, t1, t2, label };
  },
  update(S, step, p, q) {
    const { c, N, people, t1, t2, label } = S, p0 = permOf(N, q.seed), log = bubbleSwaps(p0).log, W = Math.min(46, 460 / N), x0 = 260 - (W * N) / 2, total = log.length, inv0 = inversions(p0);
    const done = step === 0 ? 0 : step === 1 ? Math.min(1, total) * easeInOut(p) : step === 2 ? Math.min(total, 1 + easeInOut(p) * (total - 1)) : total, whole = Math.floor(done + 1e-9), frac = done - whole;
    const row = [...p0]; for (let i = 0; i < whole; i++) { const j = log[i]; [row[j], row[j + 1]] = [row[j + 1], row[j]]; }
    const swapping = frac > 0 && whole < total ? log[whole] : -1;
    row.forEach((v, i) => {
      let x = x0 + i * W + W / 2, hop = 0;
      if (swapping >= 0 && (i === swapping || i === swapping + 1)) { const e = easeInOut(frac); x = lerp(x0 + i * W + W / 2, x0 + (i === swapping ? i + 1 : i - 1) * W + W / 2, e); hop = 22 * Math.sin(e * Math.PI) * (i === swapping ? 1 : 0.6); }
      people[v - 1].set({ x, y: 232, dir: 1, phase: 0, amp: 0, hop, cheer: step === 3 ? easeInOut(seg(p, 0.3, 0.6)) : 0 });
    });
    const inv = inversions(row);
    t1.textContent = `${c.t("inversions", "inversions")} : ${inv}`; t2.textContent = `${c.t("échanges faits", "swaps made")} : ${whole}`;
    label.textContent = [`${c.t("la rangée", "the row")} : ${p0.join(", ")}`, c.t("un échange : −1 inversion", "one swap: −1 inversion"), c.t("chaque échange : −1, quel que soit le choix", "every swap: −1, whatever the choice"), `${inv0} ${c.t("échanges exactement", "swaps exactly")}`][step];
  },
};

/* ------------------------------------------------------------ inversions */
export const diagram = {
  size: [520, 300],
  steps: (q) => { const p0 = permOf(q.n, q.seed), inv = inversions(p0); return [
    P(`La rangée : ${p0.join(", ")}. Une inversion est une paire (pas forcément voisine) où la plus grande est à gauche : il y en a ${inv}.`, `The row: ${p0.join(", ")}. An inversion is a pair (not necessarily neighbours) where the taller is on the left: there are ${inv}.`),
    P("On échange deux voisines mal rangées : leur paire n’est plus une inversion, et aucune autre paire ne change. Le nombre d’inversions baisse exactement de 1.", "Swap two neighbours in the wrong order: their pair stops being an inversion, and no other pair changes. The number of inversions drops by exactly 1."),
    P("On recommence : chaque échange fait baisser le compteur de 1, quel que soit l’échange choisi.", "Again and again: every swap lowers the counter by 1, whichever swap is chosen."),
    P(`La rangée est triée quand le compteur vaut 0. Il fallait donc exactement ${inv} échanges, quels que soient les choix.`, `The row is sorted when the counter reaches 0. So exactly ${inv} swaps were needed, whatever the choices.`),
  ]; },
  draw(c, s, p, q) {
    const p0 = permOf(q.n, q.seed), N = q.n, log = bubbleSwaps(p0).log, W = Math.min(46, 440 / N), x0 = 260 - (W * N) / 2, base = 250;
    const total = log.length, done = s === 0 ? 0 : s === 1 ? Math.min(1, total) * ez(p) : s === 2 ? Math.min(total, 1 + ez(p) * (total - 1)) : total, whole = Math.floor(done + 1e-9), frac = done - whole;
    const row = [...p0]; for (let i = 0; i < whole; i++) { const j = log[i]; [row[j], row[j + 1]] = [row[j + 1], row[j]]; }
    const slot = (i) => x0 + i * W, h = (v) => 24 + (v / N) * 150;
    row.forEach((v, i) => {
      let x = slot(i); if (frac > 0 && whole < total) { const j = log[whole]; if (i === j) x = lerp(slot(i), slot(i + 1), ez(frac)); if (i === j + 1) x = lerp(slot(i), slot(i - 1), ez(frac)); }
      c.rect(x + 2, base - h(v), W - 4, h(v), { rx: 5, fill: `color-mix(in srgb, ${colour(v - 1)} 55%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 1.5 }); c.text(x + W / 2, base - h(v) + 18, v, { ...mid, class: "sol-small", style: "font-weight:700" });
    });
    const inv = inversions(row); c.text(260, 34, `${c.t("inversions", "inversions")} : ${Math.max(0, inv - (frac > 0 && whole < total ? 1 : 0) * 0)}`, { ...mid, class: s === 3 ? "sol-hot" : "sol-big small" });
    c.text(260, 285, `${c.t("échanges faits", "swaps made")} : ${whole}`, { ...mid, class: "sol-sub" });
  },
};
