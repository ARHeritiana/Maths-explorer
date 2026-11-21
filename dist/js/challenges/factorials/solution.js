// Animated solution of the factorials challenge. `diagram` holds the captions; `scene` builds the picture once (mount)
// and poses it as a pure function of (step, p) (update): the factors 1, 2, ..., n as numbered tiles, every multiple of p
// drops a coin p onto the first shelf, every multiple of p² a second coin onto the next shelf, and so on, while a
// counter with a clipboard watches; the shelves are then added up (and, for trailing zeros, the scarcest prime of the
// base decides). See common/player.js.
import { P, mid } from "../common/helpers.js";
import { colour, svgEl } from "../common/kit.js";
import { seg, easeInOut } from "../common/scene-kit.js";
import { makePerson, posePerson } from "../common/person.js";
import { makeBubble, poseBubble } from "../common/bubble.js";
import { valuationTerms, factorialValuation, primeFactors, trailingZeros } from "./maths.js";

// The prime the picture counts: the one asked for, or, for trailing zeros, the prime of the base that runs out first.
export function shownPrime(q) {
  if (q.kind !== "zeros") return Number(q.p);
  let best = null;
  for (const [p, e] of primeFactors(q.base)) { const z = factorialValuation(q.n, p) / e; if (!best || z <= best.z) best = { p: Number(p), z }; }
  return best.p;
}

export const diagram = {
  size: [520, 300],
  dur: (step) => [3600, 7000, 4200, 4800][step],
  steps: (q) => {
    const { n } = q, p = shownPrime(q), v = factorialValuation(n, p), terms = valuationTerms(n, p);
    const out = [
      P(`On compte les facteurs ${p} dans le produit 1 × 2 × … × ${n}.`, `Count factors of ${p} in the product 1 × 2 × … × ${n}.`),
      P(`Chaque multiple de ${p} donne un facteur ; ceux de ${p ** 2} en donnent un autre.`, `Every multiple of ${p} supplies one factor; multiples of ${p ** 2} supply another.`),
      P(`La somme des couches donne le nombre de facteurs ${p} de ${n}! : ${terms.length ? terms.map((x) => String(x.count)).join(" + ") + " = " : ""}${v}.`, `The layer sum gives the number of factors ${p} in ${n}!: ${terms.length ? terms.map((x) => String(x.count)).join(" + ") + " = " : ""}${v}.`),
    ];
    if (q.kind === "zeros") {
      const f = primeFactors(q.base), parts = f.map(([pp, e]) => `${pp}${e > 1n ? `^${e}` : ""}`).join(" × "), z = trailingZeros(n, q.base);
      out.push(P(`Un zéro final en base ${q.base} demande un facteur ${q.base} = ${parts} entier. Le premier qui manque décide : ${z} zéro${z > 1n ? "s" : ""}.`, `Each trailing zero in base ${q.base} needs a whole factor ${q.base} = ${parts}. The one that runs out first decides: ${z} zero${z === 1n ? "" : "s"}.`));
    }
    return out;
  },
};

const TILES = { x: 14, y: 26, w: 378, h: 116 }, SHELF0 = 166, SHELF_X = 30, SHELF_W = 352;
const HALO = "paint-order:stroke;stroke:var(--surface);stroke-width:5px;stroke-linejoin:round";
const blinkAt = (p) => (Math.abs(Math.sin(9 * p + 1.3)) > 0.997 ? 1 : 0);

export const scene = {
  mount(c, q) {
    const n = Number(q.n), p = shownPrime(q), terms = valuationTerms(n, p).map((x) => Number(x.count)), L = Math.max(1, terms.length);
    // tiles 1..n in a grid that fits the top band
    const cols = Math.max(1, Math.ceil(Math.sqrt((n * TILES.w) / TILES.h))), rows = Math.max(1, Math.ceil(n / cols)), cell = Math.min(34, TILES.w / cols, TILES.h / rows);
    const ox = TILES.x + (TILES.w - cols * cell) / 2, tileAt = (k) => [ox + ((k - 1) % cols) * cell + cell / 2, TILES.y + Math.floor((k - 1) / cols) * cell + cell / 2];
    svgEl("rect", { x: 0, y: 0, width: 520, height: 300, fill: "color-mix(in srgb, #f3ead8 60%, var(--surface))" }, c.svg);
    svgEl("rect", { x: 0, y: 252, width: 520, height: 48, fill: "#c58b52" }, c.svg);
    svgEl("rect", { x: 0, y: 252, width: 520, height: 5, fill: "#a8743a", stroke: "var(--ink)", "stroke-width": 1 }, c.svg);
    const tiles = [];
    for (let k = 1; k <= n; k++) {
      const [x, y] = tileAt(k), g = svgEl("g", { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` }, c.svg);
      const box = svgEl("rect", { x: -cell / 2 + 1, y: -cell / 2 + 1, width: cell - 2, height: cell - 2, rx: Math.min(4, cell / 5), fill: "var(--surface)", stroke: "var(--ink)", "stroke-width": 0.8 }, g);
      const tx = svgEl("text", { y: cell * 0.16, "text-anchor": "middle", "font-size": Math.max(5, cell * 0.42), "font-weight": 700, fill: "var(--ink)" }, g); tx.textContent = String(k);
      tiles.push({ g, box, k, x, y });
    }
    // the shelves: one per power of p, with room for its coins
    const gap = Math.min(26, 82 / L), shelfY = (i) => SHELF0 + i * gap;
    const shelves = terms.map((cnt, i) => {
      const y = shelfY(i), g = svgEl("g", {}, c.svg);
      svgEl("rect", { x: SHELF_X - 4, y: y + gap * 0.32, width: SHELF_W + 8, height: 3.5, rx: 1.5, fill: "#8d5f2d", stroke: "var(--ink)", "stroke-width": 0.8 }, g);
      const lab = svgEl("text", { x: SHELF_X - 8, y: y + gap * 0.3, "text-anchor": "end", "font-size": Math.min(11, gap * 0.55), "font-weight": 700, fill: "var(--ink)" }, g);
      lab.textContent = `${p}${i ? ["", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸"][i] ?? `^${i + 1}` : ""}`;
      const num = svgEl("text", { x: SHELF_X + SHELF_W + 14, y: y + gap * 0.3, "text-anchor": "start", "font-size": Math.min(13, gap * 0.6), "font-weight": 700, fill: "var(--ink)", style: HALO }, g);
      num.textContent = String(cnt);
      return { g, num, y, cnt };
    });
    // the coins: multiple j·p^(i+1) gives a coin on shelf i, in its turn
    const coins = [];
    terms.forEach((cnt, i) => {
      const r = Math.min(8, (SHELF_W / Math.max(1, cnt)) * 0.45, gap * 0.36), step = Math.min(2 * r + 2, SHELF_W / Math.max(1, cnt));
      for (let j = 1; j <= cnt; j++) {
        const k = j * p ** (i + 1), g = svgEl("g", {}, c.svg);
        svgEl("circle", { r, fill: "#f2c14e", stroke: "#8a6212", "stroke-width": Math.max(0.6, r * 0.14) }, g);
        if (r >= 5) { const t = svgEl("text", { y: r * 0.38, "text-anchor": "middle", "font-size": r * 1.05, "font-weight": 700, fill: "#6b4a0a" }, g); t.textContent = String(p); }
        coins.push({ g, i, j, cnt, from: tileAt(k), to: [SHELF_X + step * (j - 0.5), shelfY(i) + gap * 0.32 - r], r });
      }
    });
    const person = makePerson(c.svg, { fill: `color-mix(in srgb, ${colour(5)} 70%, var(--surface))`, look: 4, size: 1.35 });
    const board = svgEl("g", {}, c.svg);   // the clipboard in the counter's hand
    svgEl("rect", { x: -9, y: -12, width: 18, height: 24, rx: 2, fill: "#b07a43", stroke: "var(--ink)", "stroke-width": 1 }, board);
    svgEl("rect", { x: -7, y: -9, width: 14, height: 19, fill: "#fff" }, board);
    const tally = svgEl("text", { y: 5, "text-anchor": "middle", "font-size": 8, "font-weight": 700, fill: "var(--ink)" }, board);
    const bubble = makeBubble(c.svg);
    const sum = c.text(260, 286, `${terms.join(" + ") || "0"} = ${factorialValuation(n, p)}`, { ...mid, class: "sol-line", style: HALO });
    const zerosLine = c.text(456, 120, "", { ...mid, class: "sol-small", "font-weight": 700, style: HALO });
    const hot = c.text(456, 96, "", { ...mid, class: "sol-hot", style: HALO });
    return { n, p, q, terms, L, tiles, shelves, coins, person, board, tally, bubble, sum, zerosLine, hot, lang: c.t("fr", "en") };
  },
  update(S, s, pr) {
    const { n, p, q, terms, L, tiles, shelves, coins, person, board, tally, bubble, sum, zerosLine, hot, lang } = S;
    // tiles: the multiples of p light up in step 0, those of p², p³... glow in turn during step 1
    const layerNow = s === 1 ? Math.min(L - 1, Math.floor(pr * L)) : -1;
    tiles.forEach((T) => {
      let e = 0, k = T.k; while (k % p === 0 && k > 0) { k /= p; e++; }
      const lit = s === 0 ? (e > 0 ? seg(pr, 0.3, 0.6) : 0) : e > 0 ? 1 : 0, hotNow = s === 1 && e > layerNow;
      T.box.setAttribute("fill", lit ? `color-mix(in srgb, #f2c14e ${Math.round(20 + 40 * lit + (hotNow ? 20 : 0))}%, var(--surface))` : "var(--surface)");
      T.box.setAttribute("stroke-width", hotNow ? 1.8 : 0.8);
      T.g.setAttribute("opacity", s >= 1 && !e ? 0.45 : 1);
    });
    // coins: layer i drops during its share of step 1, coin after coin; all rest on the shelves afterwards
    let landed = 0, falling = null;
    coins.forEach((C) => {
      let k = s >= 2 ? 1 : 0;
      if (s === 1) { const a = C.i / L, b = (C.i + 1) / L, t0 = a + ((b - a) * 0.8 * (C.j - 1)) / C.cnt; k = seg(pr, t0, t0 + (b - a) * 0.35); }
      const ek = easeInOut(k), x = C.from[0] + (C.to[0] - C.from[0]) * ek, y = C.from[1] + (C.to[1] - C.from[1]) * ek - 30 * Math.sin(Math.PI * ek);
      C.g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(k > 0 ? 1 : 0.001)})`);
      if (k >= 1) landed++; else if (k > 0 && !falling) falling = C;
    });
    shelves.forEach((Sh, i) => Sh.num.setAttribute("opacity", s >= 2 ? seg(pr, 0.1 * i, 0.1 * i + 0.3) + (s > 2 ? 1 : 0) : 0));
    // the counter: watches the falling coin, ticks the clipboard, says "one more" when a new layer starts
    const aim = falling ? [falling.to[0] - 456, -1] : [-1, -0.4];
    const pose = { x: 456, y: 250, facing: -1, gaze: [aim[0] < 0 ? 1 : -1, 0.4], breathe: 6 * pr, blink: blinkAt(pr), mood: falling ? "o" : "smile", reach: 0.85, reachAngle: 40 };
    if (s === 2 && pr > 0.6) Object.assign(pose, { mood: "grin", hop: seg(pr, 0.7, 0.9) });
    if (s === 3) Object.assign(pose, { mood: "grin", wave: seg(pr, 0.5, 1) });
    posePerson(person, pose);
    board.setAttribute("transform", `translate(${430} ${200 - (pose.hop ? 5 * Math.sin(Math.PI * pose.hop) : 0)}) rotate(-8)`);
    tally.textContent = String(s === 0 ? 0 : landed);
    let say = null;
    if (s === 1 && L > 1 && layerNow >= 1) { const t0 = layerNow / L; say = { text: lang === "fr" ? `Encore un ${p} !` : `One more ${p}!`, appear: seg(pr, t0, t0 + 0.05) * (1 - seg(pr, t0 + 0.2, t0 + 0.26)) }; }
    if (s === 0) say = { text: `${n}! = 1 × 2 × … × ${n}`, appear: seg(pr, 0.05, 0.2) * (1 - seg(pr, 0.85, 0.98)) };
    poseBubble(bubble, say ? { x: 440, y: 150, text: say.text, appear: say.appear } : { x: 0, y: 0, text: "", appear: 0 });
    sum.setAttribute("opacity", s === 2 ? seg(pr, 0.5, 0.7) : s > 2 ? 1 : 0);
    const v = factorialValuation(n, p);
    if (q.kind === "zeros" && s === 3) {
      const parts = primeFactors(q.base).map(([pp, e]) => `⌊${factorialValuation(n, pp)}/${e}⌋`).join(", ");
      zerosLine.textContent = `min(${parts})`;
      zerosLine.setAttribute("opacity", seg(pr, 0.1, 0.4));
      hot.textContent = String(trailingZeros(n, q.base));
      hot.setAttribute("opacity", seg(pr, 0.5, 0.8));
    } else {
      zerosLine.setAttribute("opacity", 0);
      hot.textContent = String(v);
      hot.setAttribute("opacity", s === 2 && q.kind !== "zeros" ? seg(pr, 0.7, 0.9) : 0);
    }
  },
};
