// Animated solution of the fakecoins challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
import { el, pillAt as pill, white, P, ez, ink } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { easeInOut, seg, lerp } from "../common/scene-kit.js";
import { dayScene } from "../common/scene-props.js";
import { coinSvg } from "./art.js";
import { classicSample, minSample } from "./maths.js";

/* ================================================================= the piles of coins and one weighing */
export const scene = {
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

/* ------------------------------------------------------------ fake coins */
export const diagram = {
  size: [520, 300],
  steps: (q) => { const n = q.n, tot = classicSample(n), k = Math.min(7, n); return [
    P(`${n} piles de pièces, une seule pile est fausse (9 g au lieu de 10 g). Une seule pesée sur une balance de précision.`, `${n} piles of coins, exactly one is fake (9 g instead of 10 g). A single weighing on a precise scale.`),
    P(`Prenons 1 pièce de la pile 1, 2 de la pile 2, …, ${n} de la pile ${n} : ${tot} pièces. Chaque pile est reconnaissable à son nombre de pièces.`, `Take 1 coin from pile 1, 2 from pile 2, …, ${n} from pile ${n}: ${tot} coins. Each pile is recognisable by its number of coins.`),
    P(`Si tout était vrai, la balance indiquerait ${10 * tot} g. Supposons la pile ${k} fausse : ses ${k} pièces pèsent chacune 1 g de moins, la balance indique ${10 * tot - k} g.`, `If all were genuine the scale would show ${10 * tot} g. Suppose pile ${k} is fake: its ${k} coins each weigh 1 g less, the scale shows ${10 * tot - k} g.`),
    P(`Le manque, ${k} g, est exactement le numéro de la pile fausse : ${10 * tot} − ${10 * tot - k} = ${k}.`, `The shortfall, ${k} g, is exactly the number of the fake pile: ${10 * tot} − ${10 * tot - k} = ${k}.`),
    P(`Minimum : deux piles dont on prend autant de pièces seraient indiscernables, donc les nombres sont tous différents, de somme au moins 0 + 1 + … + ${n - 1} = ${minSample(n)} (aucune pièce de la pile 1). La version classique en prend ${tot}.`, `Minimum: two piles with the same number of coins taken would be indistinguishable, so the numbers are all different, with sum at least 0 + 1 + … + ${n - 1} = ${minSample(n)} (no coin from pile 1). The classic version takes ${tot}.`),
  ]; },
  draw(c, s, p, q) {
    const n = q.n, W = 480, gap = W / n, cw = Math.min(30, gap - 4), k = Math.min(7, n), ch = Math.min(12, 190 / (n + 1)), base = 230;
    const shown = s === 0 ? 0 : s === 1 ? Math.min(n, Math.floor(ez(p) * (n + 1))) : n, minimal = s === 4;
    for (let i = 1; i <= n; i++) {
      const x = 20 + (i - 1) * gap + (gap - cw) / 2, taken = minimal ? i - 1 : i;
      for (let j = 0; j < Math.max(n - 1, 1) + 1; j++) { const isTaken = s >= 1 && j < taken && (minimal || i <= shown), isFakePile = s >= 2 && i === k && s < 4; c.rect(x, base - (j + 1) * ch, cw, ch - 1.5, { rx: 3, fill: isTaken ? colour(2) : isFakePile ? `color-mix(in srgb, ${colour(3)} 35%, var(--surface))` : "var(--surface)", stroke: "var(--ink)", "stroke-width": 0.8, opacity: isTaken || !minimal ? 1 : 0.7 }); }
      c.text(x + cw / 2, base + 16, i, { ...ink, class: "sol-small", style: i === k && s >= 2 && s < 4 ? "font-weight:700;fill:var(--neg)" : "" });
    }
    if (s >= 2 && s <= 3) { const tot = classicSample(n); c.rect(330, 20, 170, 54, { rx: 8, fill: "var(--surface)", stroke: "var(--ink)", "stroke-width": 2 }); c.text(415, 46, `${10 * tot - k} g`, { ...ink, class: "sol-big small" }); c.text(415, 66, `(${c.t("attendu", "expected")} ${10 * tot} g)`, { ...ink, class: "sol-small" }); }
    if (s === 3) c.text(260, 285, `${10 * classicSample(n)} − ${10 * classicSample(n) - k} = ${k}`, { ...ink, class: "sol-hot" });
    if (s === 4) c.text(260, 285, `0 + 1 + … + ${n - 1} = ${minSample(n)}`, { ...ink, class: "sol-hot" });
  },
};
