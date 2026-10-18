// Animated solution of the pigeonhole challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
import { el, pillAt, white, P, ez } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { seg, easeOutBack, clamp01, lerp, easeInOut } from "../common/scene-kit.js";
import { dayScene } from "../common/scene-props.js";
import { makePigeon } from "./art.js";

/* ================================================================= pigeons in the holes of a dovecote */
export const scene = {
  size: [520, 300],
  dur: (s, q) => [3200, 2400 + Number(q.m) * 520, 4200, 4200][s] ?? 3000,
  steps: null,
  mount(c, q) {
    const svg = c.svg, m = Number(q.m);
    dayScene(svg, { ground: 262 });
    const bw = Math.min(54, 470 / m - 6), step = 480 / m, top = 168, boxes = [];
    el("rect", { x: 8, y: top + 70, width: 504, height: 10, rx: 3, fill: "#6b4423" }, svg);
    for (let r = 0; r < m; r++) {
      const x = 20 + r * step, g = el("g", {}, svg);
      el("rect", { x, y: top, width: bw, height: 72, rx: 6, fill: "#c98f52", stroke: "#4b2d14", "stroke-width": 2 }, g);
      el("path", { d: `M${x + bw / 2 - bw * 0.26} ${top + 60} v-22 a${bw * 0.26} ${bw * 0.26} 0 0 1 ${bw * 0.52} 0 v22z`, fill: "#3a2410" }, g);
      el("path", { d: `M${x - 3} ${top + 2} L${x + bw / 2} ${top - 16} L${x + bw + 3} ${top + 2}Z`, fill: "#b4533c", stroke: "#4b2d14", "stroke-width": 1.6, "stroke-linejoin": "round" }, g);
      const t = el("text", { x: x + bw / 2, y: top + 92, "text-anchor": "middle", style: `font:700 ${bw < 40 ? 10 : 12}px var(--body);fill:#2b2538` }, svg); t.textContent = `${c.t("reste", "rem.")} ${r}`;
      boxes.push({ g, x, hot: el("rect", { x: x - 4, y: top - 20, width: bw + 8, height: 98, rx: 8, fill: "none", stroke: "#ffd84a", "stroke-width": 4, opacity: 0 }, svg) });
    }
    const pigeons = Array.from({ length: m + 1 }, (_, i) => makePigeon(svg, i === m ? { body: "#e0b08a", wing: "#c98a5a" } : {}));
    const bang = el("text", { "text-anchor": "middle", style: "font:700 26px var(--body);fill:#d32f2f;paint-order:stroke;stroke:#fff;stroke-width:4px" }, svg); bang.textContent = "!";
    const board = pillAt(svg, 90, 8, 340, 30), label = el("text", { x: 260, y: 29, "text-anchor": "middle", style: white(15) }, board);
    return { c, m, bw, step, top, boxes, pigeons, bang, label };
  },
  update(S, step, p, q) {
    const { c, m, bw, step: stp, top, boxes, pigeons, bang, label } = S, e = 2 * m + 1;
    const cx = (r) => 20 + r * stp + bw / 2;
    boxes.forEach((b, r) => { b.g.setAttribute("transform", `translate(0 ${(step === 0 ? (1 - easeOutBack(seg(p, (r / m) * 0.7, (r / m) * 0.7 + 0.3))) * -40 : 0).toFixed(1)})`); b.g.setAttribute("opacity", String(step === 0 ? clamp01(seg(p, (r / m) * 0.7, (r / m) * 0.7 + 0.15) * 2) : 1)); b.hot.setAttribute("opacity", "0"); });
    // pigeons 0..m-1: one per hole; the last one is the extra integer
    pigeons.forEach((pg, i) => {
      const isExtra = i === m, target = isExtra ? 1 : i;
      const startX = i % 2 ? 560 : -40, startY = 20 + (i * 17) % 60;
      let x, y, flap = 0, scale = 1, tilt = 0, dir = 1;
      const landY = top + 62, perchY = top - 16;
      if (!isExtra) {
        if (step === 0) { scale = 0; x = cx(i); y = landY; }
        else if (step === 1) {
          const a = i / (m + 1), u = clamp01((p - a * 0.8) / 0.22);
          if (u <= 0) { scale = 0; x = startX; y = startY; } else { x = lerp(startX, cx(target), easeInOut(u)); y = lerp(startY, landY, easeInOut(u)) - 60 * Math.sin(u * Math.PI); flap = u * 5 * (u < 1 ? 1 : 0); dir = cx(target) >= startX ? 1 : -1; scale = u < 1 ? 1.1 : 0.92; tilt = u < 1 ? -10 * Math.sin(u * Math.PI) : 0; }
        } else { x = cx(target); y = landY; scale = 0.92; }
      } else {
        if (step <= 1) { scale = 0; x = startX; y = startY; }
        else { const u = step === 2 ? easeInOut(seg(p, 0.05, 0.75)) : 1; x = lerp(560, cx(1), u); y = lerp(30, perchY, u) - 60 * Math.sin(u * Math.PI) * (u < 1 ? 1 : 0); flap = u < 1 ? p * 6 : 0; dir = -1; scale = u < 1 ? 0.95 : 0.85; tilt = u < 1 ? 8 : 0; }
      }
      pg.set({ x, y, dir, flap, scale, tilt, label: isExtra ? String(e) : String(i) });
    });
    const arrived = step === 2 ? seg(p, 0.75, 1) : step === 3 ? 1 : 0;
    boxes[1].hot.setAttribute("opacity", String(arrived * (0.6 + 0.4 * Math.sin(p * 18))));
    bang.setAttribute("x", cx(1) + 28); bang.setAttribute("y", top - 24); bang.setAttribute("opacity", String(arrived));
    label.textContent = step === 0 ? `${m} ${c.t("restes possibles : de 0 à", "possible remainders: from 0 to")} ${m - 1}` : step === 1 ? `${m} ${c.t("entiers : un par case", "integers: one per box")}` : step === 2 ? `${c.t("un de plus :", "one more:")} ${e} ${c.t("a le reste 1", "has remainder 1")}` : `${e} − 1 = ${e - 1} = 2 × ${m}`;
  },
};

/* ------------------------------------------------------------- pigeonhole */
export const diagram = {
  size: [520, 300],
  steps: (q) => [
    P(`Il y a ${q.m} restes possibles dans la division par ${q.m} : ${q.m} cases, de 0 à ${q.m - 1}.`, `There are ${q.m} possible remainders on division by ${q.m}: ${q.m} boxes, from 0 to ${q.m - 1}.`),
    P(`${q.m} entiers 0, 1, …, ${q.m - 1} : un par case, aucun reste commun. ${q.m} ne suffisent donc pas.`, `${q.m} integers 0, 1, …, ${q.m - 1}: one per box, no shared remainder. So ${q.m} are not enough.`),
    P(`Un entier de plus, par exemple ${2 * q.m + 1}, doit aller dans une case déjà occupée : ${2 * q.m + 1} a le reste 1, comme 1.`, `One more integer, say ${2 * q.m + 1}, has to go into an occupied box: ${2 * q.m + 1} has remainder 1, like 1.`),
    P(`${2 * q.m + 1} − 1 = ${2 * q.m} = 2 × ${q.m} : deux entiers de même reste ont une différence divisible par ${q.m}. Le minimum est ${q.m + 1}.`, `${2 * q.m + 1} − 1 = ${2 * q.m} = 2 × ${q.m}: two integers with the same remainder differ by a multiple of ${q.m}. The minimum is ${q.m + 1}.`),
  ],
  draw(c, s, p, q) {
    const m = q.m, bw = Math.min(58, 480 / m - 8), step = 480 / m, e = 2 * m + 1;
    for (let r = 0; r < m; r++) {
      const x = 22 + r * step, hot = s >= 2 && r === 1;
      c.rect(x, 150, bw, 100, { rx: 8, class: `sol-box${hot ? " hot" : ""}` });
      c.text(x + bw / 2, 270, `${c.t("reste", "rem.")} ${r}`, { class: "sol-small", "text-anchor": "middle", style: bw < 40 ? "font-size:10px" : "" });
      if (s >= 1) { c.circ(x + bw / 2, 224, Math.min(17, bw / 2 - 2), { class: "sol-ball", style: `fill:${colour(r)};opacity:${s === 1 ? ez(seg(p, r / (m + 1), r / (m + 1) + 0.25)) : 1}` }); c.text(x + bw / 2, 230, r, { class: "sol-ball-n", "text-anchor": "middle", style: bw < 40 ? "font-size:11px" : "" }); }
    }
    if (s >= 2) { const k = s === 2 ? ez(p) : 1, x = 22 + step + bw / 2, y = lerp(50, 188, k); c.circ(x, y, 17, { class: "sol-ball", style: `fill:${colour(7)}` }); c.text(x, y + 6, e, { class: "sol-ball-n", "text-anchor": "middle" }); }
    if (s === 3) c.text(260, 110, `${e} − 1 = ${e - 1} = 2 × ${m}`, { class: "sol-hot", "text-anchor": "middle" });
  },
};
