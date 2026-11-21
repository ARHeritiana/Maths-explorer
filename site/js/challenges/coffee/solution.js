// Animated solution of the coffee challenge. `diagram` holds the captions; `scene` builds the kitchen, the mugs, the spoon,
// the cards and the bars once (mount) and poses them as a pure function of (step, p) (update). For the discrete version
// (sacks of white and red beans) the same kitchen holds two sacks and a bowl, and the foreign beans pair up one for one.
import { P, ez, mid } from "../common/helpers.js";
import { svgEl } from "../common/kit.js";
import { seg } from "../common/scene-kit.js";
import { makeBubble, poseBubble } from "../common/bubble.js";
import { cupsOf, start, scoop, pour, volume, ml, answerOf, isBeans, beansOf, bagsStart } from "./maths.js";
import { W, H, TABLE, CUP_X, drawKitchen, makeCup, poseCup, makeSpoon, poseSpoon, mixColour, makeCard, poseCard, WHITE, RED, SACK_X, makeSack, poseSack, makeBowl, poseBowl } from "./art.js";

const REST = { x: 260, y: 112 };
const fr = (x) => String(Math.round(x * 100) / 100).replace(".", ",");

const mugDiagram = {
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

const mugScene = {
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

/* --------------------------------------------------------- the beans (discrete version) */
// The handful that comes back holds `a` white beans and k − a red ones (a close to the average k² / (N + k)).
const backWhite = (N, k) => Math.max(1, Math.min(k - 1, Math.round((k * k) / (N + k))));
const beanSteps = ([N, k]) => { const a = backWhite(N, k), r = k - a; return [
  P(`Un sac de ${N} haricots blancs, un sac de ${N} haricots rouges, une poignée de ${k} haricots.`, `A sack of ${N} white beans, a sack of ${N} red beans, a handful of ${k} beans.`),
  P(`Une poignée de ${k} haricots blancs passe dans le sac des rouges, et on secoue.`, `A handful of ${k} white beans goes into the red sack, and we shake it.`),
  P(`Une poignée de ${k} haricots revient : par exemple ${a} blanc${a > 1 ? "s" : ""} et ${r} rouge${r > 1 ? "s" : ""}.`, `A handful of ${k} beans comes back: for instance ${a} white and ${r} red.`),
  P(`Chaque sac contient de nouveau ${N} haricots. Les ${r} rouges arrivés chez les blancs ont pris la place de ${r} blancs, et ces ${r} blancs sont restés chez les rouges : un pour un.`, `Each sack holds ${N} beans again. The ${r} red beans that came into the white sack took the place of ${r} white ones, and those ${r} white beans stayed in the red sack: one for one.`),
  P(`Quelle que soit la poignée qui revient, au hasard ou choisie, il y a autant de rouges chez les blancs que de blancs chez les rouges. Le café et le lait, c’est la même chose avec des grains minuscules.`, `Whatever handful comes back, at random or chosen, there are as many red beans among the white as white beans among the red. Coffee and milk are the same thing with tiny grains.`),
]; };
// the sacks and the bowl at each step and progress: [white sack, red sack], the bowl's handful and where it is
function beanState(N, k, s, p) {
  const a = backWhite(N, k), r = k - a, B0 = bagsStart(N), go = { w: k, r: 0 }, back = { w: a, r };
  const B1 = [{ w: N - k, r: 0 }, { w: k, r: N }], B2 = [{ w: N - k + a, r }, { w: k - a, r: N - r }];
  const trip = (from, to, bagsBefore, bagsMid, bagsAfter, hand) => {   // fill over `from`, travel, pour over `to`
    const x = SACK_X[from] + (SACK_X[to] - SACK_X[from]) * Math.min(1, Math.max(0, (p - 0.3) / 0.3)), tilt = seg(p, 0.6, 0.72) * (to > from ? 50 : -50) * (1 - seg(p, 0.82, 0.9));
    if (p < 0.15) return { bags: bagsBefore, hand: { w: 0, r: 0 }, x: SACK_X[from], y: 44, tilt: 0 };
    if (p < 0.72) return { bags: bagsMid, hand, x, y: 44 - 14 * Math.sin(Math.PI * Math.min(1, Math.max(0, (p - 0.3) / 0.3))), tilt };
    return { bags: bagsAfter, hand: { w: 0, r: 0 }, x: SACK_X[to], y: 44, tilt };
  };
  if (s === 0) return { bags: B0, hand: { w: 0, r: 0 }, x: 260, y: 44, tilt: 0 };
  if (s === 1) return { ...trip(0, 1, B0, [{ w: N - k, r: 0 }, B0[1]], B1, go), shaken: p > 0.82 ? 1 : 0 };
  if (s === 2) return { ...trip(1, 0, B1, [B1[0], { w: k - a, r: N - r }], B2, back), shaken: p > 0.82 ? 2 : 1 };
  return { bags: B2, hand: { w: 0, r: 0 }, x: 260, y: 44, tilt: 0, shaken: 2 };
}
const beanScene = {
  mount(c, q) {
    const [N, k] = beansOf(q.cups), L = c.t(0, 1);
    drawKitchen(c.svg);
    const sacks = SACK_X.map((x) => makeSack(c.svg, { x })), bowl = makeBowl(c.svg), cards = [makeCard(c.svg), makeCard(c.svg)];
    sacks[0].tag.textContent = c.t("sac des blancs", "white sack"); sacks[1].tag.textContent = c.t("sac des rouges", "red sack");
    const pairs = svgEl("g", {}, c.svg), eq = c.text(260, 150, "=", { ...mid, class: "sol-hot" });
    return { N, k, L, sacks, bowl, cards, pairs, eq };
  },
  update(S, s, p) {
    const { N, k, L, sacks, bowl, cards, pairs, eq } = S, st = beanState(N, k, s, p), r = k - backWhite(N, k);
    st.bags.forEach((bag, i) => poseSack(sacks[i], bag, 1 + i + 7 * ((st.shaken || 0) > i ? 3 : 0) + (st.shaken === 2 ? 11 : 0)));
    poseBowl(bowl, { x: st.x, y: st.y, hand: st.hand, tilt: st.tilt });
    bowl.root.setAttribute("opacity", s >= 3 ? 0 : 1);
    const lines = (bag) => [[WHITE, `${["blancs", "white"][L]} : ${bag.w}`], [RED, `${["rouges", "red"][L]} : ${bag.r}`]];
    cards.forEach((K, i) => poseCard(K, { x: SACK_X[i], y: TABLE - 170, lines: s === 0 || s >= 3 ? lines(st.bags[i]) : [], appear: 1 }));
    // steps 3 and 4: the beans of the other colour rise out of each sack and pair up one for one
    pairs.replaceChildren();
    const rise = s === 3 ? seg(p, 0.1, 0.6) : s === 4 ? 1 : 0;
    if (rise > 0) for (let j = 0; j < r; j++) {
      const y = TABLE - 112 - 10 * rise - (j % 2) * 4, xs = [SACK_X[0] - ((r - 1) * 12) / 2 + j * 12, SACK_X[1] - ((r - 1) * 12) / 2 + j * 12];
      xs.forEach((x, i) => svgEl("ellipse", { cx: x, cy: y, rx: 5.6, ry: 3.6, fill: i === 0 ? RED : WHITE, stroke: "var(--ink)", "stroke-width": 0.9 }, pairs));
      const link = s === 3 ? seg(p, 0.55 + (0.35 * j) / r, 0.62 + (0.35 * j) / r) : 1;
      if (link > 0) svgEl("path", { d: `M${xs[0]} ${y + 5} Q260 ${y + 50} ${xs[0] + (xs[1] - xs[0]) * link} ${y + 5 + (1 - link) * 20}`, fill: "none", stroke: "var(--object-ink)", "stroke-width": 1.4, "stroke-dasharray": "4 3" }, pairs);
    }
    eq.textContent = `${r} = ${r}`;
    eq.setAttribute("opacity", s === 4 ? seg(p, 0.2, 0.5) : 0);
    eq.setAttribute("y", TABLE - 90);
  },
};

// one challenge, two worlds: the mugs (liquid) and the sacks of beans (discrete), chosen by the parameter
export const diagram = {
  size: [W, H],
  dur: (step, q) => (q && isBeans(q.cups) ? [3600, 5200, 5600, 6000, 5000][step] : mugDiagram.dur(step)),
  steps: (q) => (isBeans(q.cups) ? beanSteps(beansOf(q.cups)) : mugDiagram.steps(q)),
};
export const scene = {
  mount(c, q) { const beans = isBeans(q.cups); return { beans, S: (beans ? beanScene : mugScene).mount(c, q) }; },
  update(X, s, p, q) { (X.beans ? beanScene : mugScene).update(X.S, s, p, q); },
};
