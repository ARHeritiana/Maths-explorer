// Animated solution of the coffee challenge. `diagram` holds the captions; `scene` builds the kitchen, the mugs, the spoon,
// the cards and the bars once (mount) and poses them as a pure function of (step, p) (update).
import { P, ez, mid } from "../common/helpers.js";
import { svgEl } from "../common/kit.js";
import { seg } from "../common/scene-kit.js";
import { makeBubble, poseBubble } from "../common/bubble.js";
import { cupsOf, start, scoop, pour, volume, ml, answerOf } from "./maths.js";
import { W, H, TABLE, CUP_X, drawKitchen, makeCup, poseCup, makeSpoon, poseSpoon, mixColour, makeCard, poseCard } from "./art.js";

const REST = { x: 260, y: 112 };
const fr = (x) => String(Math.round(x * 100) / 100).replace(".", ",");

export const diagram = {
  size: [W, H],
  dur: (step) => [3600, 4600, 5200, 5600, 5600][step],
  steps: (q) => {
    const [V, v] = cupsOf(q.cups), a = answerOf(V, v);
    return [
      P(`Une tasse de ${V} mL de café, une tasse de ${V} mL de lait, une cuillère de ${v} mL.`, `A mug of ${V} mL of coffee, a mug of ${V} mL of milk, a spoon of ${v} mL.`),
      P(`Une cuillerée de café passe dans le lait, et on remue : le lait contient maintenant ${v} mL de café.`, `A spoonful of coffee goes into the milk, and we stir: the milk now holds ${v} mL of coffee.`),
      P(`Une cuillerée du mélange revient dans le café. Elle contient un peu de café et un peu de lait.`, `A spoonful of the mixture goes back into the coffee. It holds a little coffee and a little milk.`),
      P(`Chaque tasse a retrouvé ${V} mL. Le café qui manque dans la tasse de café a été remplacé par du lait, et ce café manquant est dans la tasse de lait : il y a autant de lait dans le café que de café dans le lait.`, `Each mug is back to ${V} mL. The coffee missing from the coffee mug has been replaced by milk, and that missing coffee is in the milk mug: there is as much milk in the coffee as coffee in the milk.`),
      P(`Combien ? Le café dans le lait : ${v} mL, moins ce que la cuillère a repris, soit ${v} − ${v} × ${v} ÷ ${V + v} = ${V} × ${v} ÷ ${V + v} = ${a} mL.`, `How much? The coffee in the milk: ${v} mL, minus what the spoon took back, that is ${v} − ${v} × ${v} ÷ ${V + v} = ${V} × ${v} ÷ ${V + v} = ${a} mL.`),
    ];
  },
};

// the mugs and the spoon at each step and progress, from the model
function stateAt(V, v, s, p) {
  const c0 = start(V), a = scoop(c0[0], v), b1 = [a.cup, pour(c0[1], a.spoon)], r = scoop(b1[1], v), b2 = [pour(b1[0], r.spoon), r.cup];
  if (s === 0) return { cups: c0, spoon: null };
  if (s === 1) return p < 0.5 ? { cups: c0, spoon: null } : p < 0.82 ? { cups: [a.cup, c0[1]], spoon: a.spoon } : { cups: b1, spoon: null };
  if (s === 2) return p < 0.5 ? { cups: b1, spoon: null } : p < 0.82 ? { cups: [b1[0], r.cup], spoon: r.spoon } : { cups: b2, spoon: null };
  return { cups: b2, spoon: null, back: r.spoon };
}

export const scene = {
  mount(c, q) {
    const [V, v] = cupsOf(q.cups), lang = c.t("fr", "en");
    drawKitchen(c.svg);
    const mugs = CUP_X.map((x, i) => makeCup(c.svg, { x, side: i === 0 ? -1 : 1 }));
    const sp = makeSpoon(c.svg), spoonCard = makeCard(c.svg), cards = [makeCard(c.svg), makeCard(c.svg)];
    // bars on the front of the counter: each mug's V mL, coffee and milk
    const bars = CUP_X.map((x) => { const gg = svgEl("g", { opacity: 0 }, c.svg); return { gg, c: svgEl("rect", { y: TABLE + 18, height: 14, fill: mixColour(1), stroke: "var(--ink)", "stroke-width": 0.8 }, gg), m: svgEl("rect", { y: TABLE + 18, height: 14, fill: mixColour(0), stroke: "var(--ink)", "stroke-width": 0.8 }, gg), x }; });
    const link = svgEl("path", { fill: "none", stroke: "#d92d20", "stroke-width": 2.2, "stroke-dasharray": "5 4", opacity: 0 }, c.svg);
    const same = makeBubble(c.svg), big = c.text(W / 2, 40, `${answerOf(V, v)} mL`, { ...mid, class: "sol-hot" });
    return { V, v, lang, mugs, sp, spoonCard, cards, bars, link, same, big };
  },
  update(S, s, p) {
    const { V, v, lang, mugs, sp, spoonCard, cards, bars, link, same, big } = S, st = stateAt(V, v, s, p);
    const tt = (a, b) => (lang === "fr" ? a : b);
    // the spoon's path: out to the source mug, dip, across to the other mug, pour, back to rest
    let pos = { x: REST.x, y: REST.y + 3 * Math.sin(p * 9), tilt: 0 };
    if (s === 1 || s === 2) {
      const from = s === 1 ? 0 : 1, to = 1 - from, e = (x) => x * x * (3 - 2 * x), k = (a, b) => e(seg(p, a, b));
      const lowFrom = TABLE - 10 - 72 * (volume((s === 1 ? start(V) : stateAt(V, v, 2, 0).cups)[from]) / V) + 4;
      const x = REST.x + (CUP_X[from] - REST.x) * k(0.05, 0.3) + (CUP_X[to] - CUP_X[from]) * k(0.55, 0.72) + (REST.x - CUP_X[to]) * k(0.9, 1);
      const y = REST.y + (88 - REST.y) * k(0.05, 0.3) + (lowFrom - 88) * (k(0.32, 0.45) - k(0.5, 0.58)) + (108 - 88) * (k(0.74, 0.8) - k(0.84, 0.9)) + (REST.y - 88) * k(0.9, 1);
      pos = { x, y, tilt: (to === 0 ? -1 : 1) * 70 * (k(0.74, 0.8) - k(0.84, 0.9)) };
    }
    poseSpoon(sp, { x: pos.x, y: pos.y, tilt: pos.tilt, fill: st.spoon, grin: st.spoon ? 1 : 0 });
    const carried = st.spoon;
    poseCard(spoonCard, { x: W / 2, y: 52, lines: carried ? [[mixColour(1), `${tt("café", "coffee")} : ${ml(carried.c, lang)}`], ...(carried.m > 0.01 ? [[mixColour(0), `${tt("lait", "milk")} : ${ml(carried.m, lang)}`]] : [])] : [], appear: 1 });
    mugs.forEach((M, i) => {
      const cup = st.cups[i], vol = volume(cup), f = cup.c / vol, justPoured = (s === 1 && i === 1 && p >= 0.82) || (s === 2 && i === 0 && p >= 0.82);
      const dipped = (s === 1 && i === 0 && p > 0.32 && p < 0.58) || (s === 2 && i === 1 && p > 0.32 && p < 0.58);
      poseCup(M, { level: vol / V, f, swirl: justPoured ? seg(p, 0.82, 1) : 0, phase: p * 8, hot: Math.min(1, f * 1.2), wobble: dipped ? seg(p, 0.32, 0.58) : 0, gaze: [Math.sign(pos.x - CUP_X[i]) * 0.8, -0.7], mood: dipped ? "o" : s >= 3 ? "grin" : "smile" });
      poseCard(cards[i], { x: CUP_X[i], y: TABLE - 150, lines: s >= 3 ? [[mixColour(1), `${tt("café", "coffee")} : ${ml(cup.c, lang)}`], [mixColour(0), `${tt("lait", "milk")} : ${ml(cup.m, lang)}`]] : [], appear: s >= 3 ? seg(p, 0, 0.2) : 0 });
    });
    // the bars: V mL each, split into coffee and milk; the two equal parts are linked
    const BW = 170, a = answerOf(V, v);
    bars.forEach((B, i) => {
      B.gg.setAttribute("opacity", s >= 3 ? seg(p, 0.15, 0.35) : 0);
      const cup = st.cups[i], x0 = B.x - BW / 2, wc = (BW * cup.c) / V;
      B.c.setAttribute("x", x0); B.c.setAttribute("width", wc.toFixed(1)); B.m.setAttribute("x", (x0 + wc).toFixed(1)); B.m.setAttribute("width", (BW - wc).toFixed(1));
    });
    const milkMid = CUP_X[0] - BW / 2 + (BW * (V - a)) / V + (BW * a) / V / 2, coffeeMid = CUP_X[1] - BW / 2 + (BW * a) / V / 2;
    link.setAttribute("d", `M${milkMid.toFixed(1)} ${TABLE + 16} Q${((milkMid + coffeeMid) / 2).toFixed(1)} ${TABLE - 26} ${coffeeMid.toFixed(1)} ${TABLE + 16}`);
    link.setAttribute("opacity", s >= 3 ? seg(p, 0.4, 0.6) : 0);
    poseBubble(same, { x: (milkMid + coffeeMid) / 2, y: TABLE - 12, text: tt(`Autant : ${fr(a)} mL !`, `The same: ${fr(a).replace(",", ".")} mL!`), appear: s === 3 ? seg(p, 0.55, 0.7) : s === 4 ? 1 : 0 });
    big.setAttribute("opacity", s === 4 ? seg(p, 0.5, 0.8) : 0);
  },
};
