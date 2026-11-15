// Hands-on activity of the coffee challenge: the learner moves spoonfuls between the two mugs (tap a mug to scoop from
// it, tap a mug to pour into it) and may measure what each mug holds. Nothing compares the two mugs for them.
import { goalLine } from "../common/kit.js";
import { PRESS, installCartoon } from "../common/cartoon.js";
import { cupsOf, start, scoop, pour, volume, ml } from "./maths.js";
import { W, H, TABLE, CUP_X, drawKitchen, makeCup, poseCup, makeSpoon, poseSpoon, mixColour, makeCard, poseCard } from "./art.js";

const DUR = 1700, REST = { x: 260, y: 112 };   // DUR: one spoon move, ms

export function activity(root, { t, q, lang, reduced: reducedPref }) {
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
