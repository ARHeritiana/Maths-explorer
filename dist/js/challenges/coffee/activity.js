// Hands-on activity of the coffee challenge: the learner moves spoonfuls between the two mugs (tap a mug to scoop from
// it, tap a mug to pour into it) and may measure what each mug holds. Nothing compares the two mugs for them.
// The discrete version (parameter "b<N>,<k>"): two sacks of white and red beans and a bowl for a handful; the learner
// grabs a handful (or picks the beans one by one), pours it into the other sack, shakes, and may count the beans.
import { goalLine } from "../common/kit.js";
import { PRESS, installCartoon } from "../common/cartoon.js";
import { cupsOf, start, scoop, pour, volume, ml, isBeans, beansOf, bagsStart, grab, count } from "./maths.js";
import { W, H, TABLE, CUP_X, drawKitchen, makeCup, poseCup, makeSpoon, poseSpoon, mixColour, makeCard, poseCard, WHITE, RED, SACK_X, makeSack, poseSack, makeBowl, poseBowl } from "./art.js";

const DUR = 1700, REST = { x: 260, y: 112 };   // DUR: one spoon move, ms

export function activity(root, opts) {
  return isBeans(opts.q.cups) ? beansActivity(root, opts) : mugsActivity(root, opts);
}

function beansActivity(root, { t, q }) {
  installCartoon();
  const [N, k] = beansOf(q.cups);
  let bags = bagsStart(N), hand = { w: 0, r: 0 }, from = null, seeds = [1, 2], counted = false, note = "";
  root.innerHTML = `
    ${goalLine(t, "Fais passer des poignées d’un sac à l’autre, puis compare.", "Move handfuls from one sack to the other, then compare.", `Touche un sac pour prendre une poignée de ${k} haricots au hasard, ou touche les haricots un par un pour les choisir ; touche ensuite l’autre sac pour y verser la poignée.`, `Tap a sack to grab a handful of ${k} beans at random, or tap beans one by one to choose them; then tap the other sack to pour the handful in.`)}
    <svg class="act-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="${t("Deux sacs de haricots et un bol", "Two sacks of beans and a bowl")}"></svg>
    <div class="act-controls"><button class="btn-quiet ${PRESS}" type="button" data-a="count" aria-pressed="false">${t("Compter les haricots", "Count the beans")}</button><button class="btn-quiet ${PRESS}" type="button" data-a="shake">${t("Secouer les sacs", "Shake the sacks")}</button><button class="btn-quiet ${PRESS}" type="button" data-a="reset">${t("Recommencer", "Restart")}</button></div>
    <p class="act-readout" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector(".act-readout"), countBtn = root.querySelector('[data-a="count"]');
  drawKitchen(svg);
  const names = [t("sac des blancs", "white beans’ sack"), t("sac des rouges", "red beans’ sack")];
  const handles = SACK_X.map((x, i) => { const h = document.createElementNS("http://www.w3.org/2000/svg", "g"); h.setAttribute("class", "toy-handle"); h.setAttribute("tabindex", "0"); h.setAttribute("role", "button"); h.dataset.i = i; svg.append(h); return h; });
  const sacks = SACK_X.map((x, i) => makeSack(handles[i], { x }));
  handles.forEach((h, i) => { const hit = document.createElementNS("http://www.w3.org/2000/svg", "rect"); Object.entries({ class: "hit", x: SACK_X[i] - 86, y: TABLE - 150, width: 172, height: 160 }).forEach(([key, val]) => hit.setAttribute(key, val)); h.prepend(hit); });
  const bowl = makeBowl(svg), cards = [makeCard(svg), makeCard(svg)];
  const lines = (bag) => [[WHITE, `${t("blancs", "white")} : ${bag.w}`], [RED, `${t("rouges", "red")} : ${bag.r}`]];
  const inHand = () => hand.w + hand.r;
  function draw() {
    sacks.forEach((S, i) => {
      poseSack(S, bags[i], seeds[i], { pick: true });
      S.tag.textContent = names[i];
      handles[i].setAttribute("aria-label", `${names[i]}${counted ? ` : ${lines(bags[i]).map((l) => l[1]).join(", ")}` : `, ${count(bags[i])} ${t("haricots", "beans")}`}`);
      poseCard(cards[i], { x: SACK_X[i], y: TABLE - 170, lines: counted ? lines(bags[i]) : [], appear: 1 });
    });
    poseBowl(bowl, { x: 260, y: 44, hand });
    read.textContent = note || (inHand() ? t(`Le bol contient ${inHand()} haricots sur ${k}.`, `The bowl holds ${inHand()} of ${k} beans.`) : t("Le bol est vide.", "The bowl is empty."));
    note = "";
  }
  const takeBean = (i, c) => {
    if (from !== null && from !== i) { note = inHand() === k ? "" : t(`Finis la poignée dans le même sac.`, `Finish the handful from the same sack.`); if (inHand() === k) return pourInto(i); return draw(); }
    if (inHand() >= k) { note = t("La poignée est complète : verse-la dans l’autre sac.", "The handful is complete: pour it into the other sack."); return draw(); }
    const one = c === "w" ? { w: 1, r: 0 } : { w: 0, r: 1 };
    bags = bags.map((b, j) => (j === i ? { w: b.w - one.w, r: b.r - one.r } : b));   // into the bowl, not yet into the other sack
    hand = { w: hand.w + one.w, r: hand.r + one.r }; from = i; draw();
  };
  const pourInto = (i) => { bags[i] = { w: bags[i].w + hand.w, r: bags[i].r + hand.r }; hand = { w: 0, r: 0 }; from = null; seeds[i] = (seeds[i] * 48271) % 2147483647; draw(); };
  const sackAction = (i) => {
    if (inHand() === k && from !== i) return pourInto(i);
    if (inHand() === k) { note = t("La poignée est complète : verse-la dans l’autre sac.", "The handful is complete: pour it into the other sack."); return draw(); }
    if (from !== null && from !== i) { note = t("Finis la poignée dans le même sac.", "Finish the handful from the same sack."); return draw(); }
    const more = grab(bags[i], k - inHand());
    bags[i] = { w: bags[i].w - more.w, r: bags[i].r - more.r };
    hand = { w: hand.w + more.w, r: hand.r + more.r }; from = i; draw();
  };
  svg.addEventListener("click", (e) => { const bean = e.target.closest(".bean"), h = e.target.closest(".toy-handle"); if (!h) return; const i = Number(h.dataset.i); if (bean) takeBean(i, bean.dataset.c); else sackAction(i); });
  svg.addEventListener("keydown", (e) => { const h = e.target.closest?.(".toy-handle"); if (h && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); sackAction(Number(h.dataset.i)); } });
  countBtn.addEventListener("click", () => { counted = !counted; countBtn.setAttribute("aria-pressed", String(counted)); draw(); });
  root.querySelector('[data-a="shake"]').addEventListener("click", () => { seeds = seeds.map((s) => (s * 69621) % 2147483647); draw(); });
  root.querySelector('[data-a="reset"]').addEventListener("click", () => { bags = bagsStart(N); hand = { w: 0, r: 0 }; from = null; draw(); });
  draw();
  return () => {};
}

function mugsActivity(root, { t, q, lang, reduced: reducedPref }) {
  installCartoon();
  const reduced = () => (typeof reducedPref === "function" ? !!reducedPref() : !!reducedPref);
  const [V, v] = cupsOf(q.cups);
  let cups = start(V), spoon = null, anim = null, measured = false, raf = 0;
  const poured = [-1e9, -1e9], jolt = [-1e9, -1e9];   // times of the last pour and of the last dip, per mug
  root.innerHTML = `
    ${goalLine(t, "Fais des allers et retours à la cuillère, puis compare.", "Move spoonfuls back and forth, then compare.", "Touche une tasse pour y puiser une cuillerée, puis une tasse pour l’y verser.", "Tap a mug to take a spoonful from it, then a mug to pour it in.")}
    <svg class="act-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="${t("Une tasse de café, une tasse de lait et une cuillère", "A mug of coffee, a mug of milk and a spoon")}"></svg>
    <div class="act-controls"><button class="btn-quiet ${PRESS}" type="button" data-a="measure" aria-pressed="false">${t("Mesurer les tasses", "Measure the mugs")}</button><button class="btn-quiet ${PRESS}" type="button" data-a="reset">${t("Recommencer", "Restart")}</button></div>
    <p class="act-readout" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector(".act-readout"), measure = root.querySelector('[data-a="measure"]');
  drawKitchen(svg);
  const handles = CUP_X.map((x, i) => { const h = document.createElementNS("http://www.w3.org/2000/svg", "g"); h.setAttribute("class", "toy-handle"); h.setAttribute("tabindex", "0"); h.setAttribute("role", "button"); h.dataset.i = i; svg.append(h); return h; });
  const mugs = CUP_X.map((x, i) => makeCup(handles[i], { x, side: i === 0 ? -1 : 1 }));
  handles.forEach((h, i) => { const hit = document.createElementNS("http://www.w3.org/2000/svg", "rect"); Object.entries({ class: "hit", x: CUP_X[i] - 80, y: TABLE - 170, width: 160, height: 180 }).forEach(([k, val]) => hit.setAttribute(k, val)); h.prepend(hit); });
  const sp = makeSpoon(svg), cards = [makeCard(svg), makeCard(svg)];
  const names = [t("tasse de café", "coffee mug"), t("tasse de lait", "milk mug")];
  const lines = (cup) => [[mixColour(1), `${t("café", "coffee")} : ${ml(cup.c, lang)}`], [mixColour(0), `${t("lait", "milk")} : ${ml(cup.m, lang)}`]];
  const spoonAt = (k, i, pourMove) => {   // where the spoon is during a move to mug i (k from 0 to 1)
    const cx = CUP_X[i], low = pourMove ? 108 : TABLE - 10 - 72 * (volume(cups[i]) / V) + 4, seg = (a, b) => Math.min(1, Math.max(0, (k - a) / (b - a))), e = (x) => x * x * (3 - 2 * x);
    const out = e(seg(0, 0.3)), down = e(seg(0.3, 0.5)) - e(seg(0.5, 0.7)), back = e(seg(0.7, 1));
    const x = REST.x + (cx - REST.x) * out - (cx - REST.x) * back, y = REST.y + (88 - REST.y) * (out - back) + (low - 88) * down;
    return { x, y, tilt: pourMove ? (i === 0 ? -1 : 1) * 70 * down : 0 };
  };
  function frame(now = 0) {
    const sec = reduced() ? 0 : now / 1000;
    let pos = { x: REST.x, y: REST.y + (reduced() ? 0 : 3 * Math.sin(sec * 2)), tilt: 0 };
    if (anim) {
      const k = Math.min(1, (now - anim.start) / DUR);
      if (!anim.done && k >= 0.5) { anim.done = true; anim.act(); }
      pos = spoonAt(k, anim.i, anim.pour);
      if (k >= 1) { anim = null; announce(); }
    }
    poseSpoon(sp, { x: pos.x, y: pos.y, tilt: pos.tilt, fill: spoon, grin: anim ? 1 : 0 });
    mugs.forEach((M, i) => {
      const cup = cups[i], vol = volume(cup), f = vol > 0 ? cup.c / vol : 0, sw = (now - poured[i]) / 1400, jo = (now - jolt[i]) / 600;
      const looking = anim ? [Math.sign(pos.x - CUP_X[i]) * 0.8, -0.8] : [Math.sign(REST.x - CUP_X[i]) * 0.6, -0.6];
      poseCup(M, { level: vol / V, f, swirl: !reduced() && sw >= 0 && sw < 1 ? sw : 0, phase: sec, hot: Math.min(1, f * 1.2) * (reduced() ? 0.6 : 1), wobble: !reduced() && jo >= 0 && jo < 1 ? jo : 0, gaze: looking, mood: !reduced() && jo >= 0 && jo < 1 ? "o" : sw >= 0 && sw < 1 ? "grin" : "smile", blink: !reduced() && ((sec + i * 1.3) % 3.9) < 0.12 ? 1 : 0 });
      handles[i].setAttribute("aria-label", `${names[i]}${measured ? ` : ${lines(cup).map((l) => l[1]).join(", ")}` : ""}`);
      poseCard(cards[i], { x: CUP_X[i], y: TABLE - 150, lines: measured ? lines(cup) : [], appear: 1 });
    });
  }
  const announce = () => { read.textContent = spoon ? t(`La cuillère porte ${ml(spoon.c + spoon.m, lang)}.`, `The spoon carries ${ml(spoon.c + spoon.m, lang)}.`) : t("La cuillère est vide.", "The spoon is empty."); };
  const act = (i) => {
    if (anim) return;
    const pourMove = !!spoon;
    if (!pourMove && volume(cups[i]) < v - 1e-9) { read.textContent = t("Cette tasse est presque vide.", "This mug is nearly empty."); return; }
    const doIt = () => {
      if (pourMove) { cups[i] = pour(cups[i], spoon); spoon = null; poured[i] = performance.now(); }
      else { const r = scoop(cups[i], v); cups[i] = r.cup; spoon = r.spoon; jolt[i] = performance.now(); }
    };
    if (reduced()) { doIt(); frame(); announce(); return; }
    anim = { i, pour: pourMove, start: performance.now(), done: false, act: doIt };
  };
  svg.addEventListener("click", (e) => { const h = e.target.closest(".toy-handle"); if (h) act(Number(h.dataset.i)); });
  svg.addEventListener("keydown", (e) => { const h = e.target.closest?.(".toy-handle"); if (h && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); act(Number(h.dataset.i)); } });
  measure.addEventListener("click", () => { measured = !measured; measure.setAttribute("aria-pressed", String(measured)); frame(); });
  root.querySelector('[data-a="reset"]').addEventListener("click", () => { cups = start(V); spoon = null; anim = null; frame(); announce(); });
  const loop = (now) => { frame(now); raf = requestAnimationFrame(loop); };
  frame(); announce();
  raf = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(raf);
}
