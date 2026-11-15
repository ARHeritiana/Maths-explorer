// Hands-on activity of the ants challenge: the learner sets the ants (drag along the stick, tap to turn one round),
// launches them and times the fall. Nothing points to the worst start; an ant put at an end facing inward shows it.
import { colour, svgEl, goalLine, toLocal, lockTouch } from "../common/kit.js";
import { PRESS, installCartoon } from "../common/cartoon.js";
import { makeBubble, poseBubble } from "../common/bubble.js";
import { antStart, antsAt, bumps, lastFall } from "./maths.js";
import { makeAnt, poseAnt, drawGarden } from "./art.js";

const W = 600, H = 300, X0 = 50, X1 = 550, Y = 182, GROUND = 236, REAL = 6;   // REAL: seconds of animation for the whole stick
const fmt = (s) => String(Math.round(s * 10) / 10).replace(".", ",");

export function activity(root, { t, q, reduced: reducedPref }) {
  installCartoon();
  const reduced = () => (typeof reducedPref === "function" ? !!reducedPref() : !!reducedPref);
  const L = q.L, n = q.n, X = (c) => X0 + ((X1 - X0) * c) / L, cmOf = (px) => Math.round(((px - X0) / (X1 - X0)) * L);
  const size = n <= 6 ? 1.3 : n <= 9 ? 1.05 : 0.85;
  let ants = antStart(L, n), mode = "set", clock = 0, startAt = 0, raf = 0, drag = null, result = null;
  root.innerHTML = `
    ${goalLine(t, "Trouve le départ qui garde des fourmis le plus longtemps sur le bâton.", "Find the start that keeps ants on the stick for as long as possible.", "Fais glisser une fourmi le long du bâton, touche-la pour la retourner, puis lance le chronomètre.", "Drag an ant along the stick, tap it to turn it round, then start the stopwatch.")}
    <svg class="act-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="${t("Un bâton dans un jardin, avec des fourmis", "A stick in a garden, with ants")}"></svg>
    <div class="act-controls"><button class="btn-quiet ${PRESS}" type="button" data-a="go">${t("Lancer", "Start")}</button><button class="btn-quiet ${PRESS}" type="button" data-a="reset">${t("Recommencer", "Restart")}</button></div>
    <p class="act-readout" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector(".act-readout"), go = root.querySelector('[data-a="go"]');
  drawGarden(svg, { W, H, x0: X0, x1: X1, y: Y, L, ground: GROUND });
  const watch = svgEl("g", {}, svg);
  svgEl("circle", { cx: 52, cy: 46, r: 26, fill: "var(--surface)", stroke: "var(--ink)", "stroke-width": 2 }, watch);
  svgEl("rect", { x: 47, y: 14, width: 10, height: 6, rx: 2, fill: "var(--ink)" }, watch);
  const hand = svgEl("line", { x1: 52, y1: 46, x2: 52, y2: 26, stroke: "#c0392b", "stroke-width": 2.4, "stroke-linecap": "round" }, watch);
  const watchText = svgEl("text", { x: 52, y: 62, "text-anchor": "middle", "font-size": 10, "font-weight": 700, fill: "var(--ink)" }, watch);
  const layer = svgEl("g", {}, svg), over = svgEl("g", {}, svg);
  const handles = ants.map((_, i) => {
    const h = svgEl("g", { class: "toy-handle", tabindex: 0, role: "button", "data-i": i }, layer);
    svgEl("ellipse", { class: "hit", cx: 0, cy: -12, rx: 20, ry: 18 }, h);
    return h;
  });
  const sprites = ants.map((_, i) => makeAnt(handles[i], { fill: `color-mix(in srgb, ${colour(i)} 55%, #3a2a20)`, size }));
  const bubbles = [makeBubble(over), makeBubble(over)];
  lockTouch(svg, ".toy-handle");
  const label = (i) => `${t("Fourmi", "Ant")} ${i + 1}, ${ants[i].x} cm, ${ants[i].d > 0 ? t("vers la droite", "facing right") : t("vers la gauche", "facing left")}`;
  // one frame: the clock (simulated seconds) gives everything; falls and bumps are timed from it
  function frame(now = 0) {
    const tSim = mode === "set" ? 0 : clock, state = antsAt(ants, L, tSim), list = mode === "set" ? [] : bumps(ants, L);
    const secReal = now / 1000, speed = L / REAL;
    state.forEach((s, i) => {
      const h = handles[i];
      h.setAttribute("transform", "");
      if (mode === "set") { h.setAttribute("aria-label", label(i)); h.setAttribute("aria-pressed", String(drag?.i === i)); }
      let x = X(s.x), y = Y, tilt = 0, mood = "smile", squash = 0;
      if (s.fallen) {   // tumble off the end and land in the grass, dizzy
        const k = Math.min(1, ((tSim - s.fallT) / speed) * 1.6);
        x += s.fallen * (18 + 30 * k); y = Y + (GROUND + 30 - Y) * k * k; tilt = s.fallen * 200 * k; mood = k < 1 ? "o" : "flat";
      }
      const near = list.find((b) => tSim >= b.t && tSim - b.t < speed * 0.35 && Math.abs(b.x - s.x) < (tSim - b.t) + 0.5);
      if (near && !s.fallen) { squash = 1 - (tSim - near.t) / (speed * 0.35); mood = "o"; }
      const moving = mode === "run" && !s.fallen;
      poseAnt(sprites[i], { x, y, facing: s.d, phase: moving ? (X(s.x + s.d * tSim) - X0) / 4 : 0, amp: moving ? 1 : 0, squash, tilt, mood, blink: !reduced() && ((secReal + i * 0.41) % 3.3) < 0.1 ? 1 : 0, gaze: [s.d, 0] });
    });
    // "Demi-tour !" on the latest bumps
    const recent = list.filter((b) => tSim >= b.t && tSim - b.t < speed * 0.45).slice(-2);
    bubbles.forEach((B, k) => { const b = recent[k]; poseBubble(B, b ? { x: X(b.x), y: Y - 34 * size, text: t("Demi-tour !", "Turn back!"), appear: Math.min(1, ((tSim - b.t) / speed) * 12) * (1 - Math.max(0, ((tSim - b.t) / (speed * 0.45) - 0.7) / 0.3)) } : { x: 0, y: 0, text: "", appear: 0 }); });
    const shown = Math.min(tSim, lastFall(ants, L));   // the stopwatch stops at the last fall; the tumbles play on
    hand.setAttribute("transform", `rotate(${((shown / L) * 360).toFixed(1)} 52 46)`);
    watchText.textContent = `${fmt(shown)} s`;
  }
  function finish() {
    result = lastFall(ants, L);
    read.textContent = t(`Toutes les fourmis sont tombées après ${fmt(result)} s.`, `All the ants have fallen after ${fmt(result)} s.`);
  }
  const loop = (now) => {
    if (mode === "run") {
      clock = ((now - startAt) / 1000) * (L / REAL);
      if (result === null && clock >= lastFall(ants, L)) finish();
      if (clock >= lastFall(ants, L) + (L / REAL) * 0.8) { clock = lastFall(ants, L) + (L / REAL) * 0.8; mode = "done"; }   // all landed
    }
    frame(now);
    raf = requestAnimationFrame(loop);
  };
  const start = () => {
    if (mode !== "set") return;
    read.textContent = "";
    if (reduced()) { mode = "done"; clock = lastFall(ants, L) + L; finish(); go.disabled = true; frame(0); return; }
    mode = "run"; startAt = performance.now(); go.disabled = true;
  };
  const reset = () => { mode = "set"; clock = 0; result = null; go.disabled = false; read.textContent = ""; frame(); };
  // setting the ants: drag along the stick (snaps to whole centimetres, never onto another ant), tap to turn round
  const place = (i, c) => { c = Math.max(0, Math.min(L, c)); if (!ants.some((a, k) => k !== i && a.x === c)) ants[i] = { ...ants[i], x: c }; };
  svg.addEventListener("pointerdown", (e) => { const h = e.target.closest(".toy-handle"); if (!h || mode !== "set") return; drag = { i: Number(h.dataset.i), x: e.clientX, moved: false }; h.setPointerCapture?.(e.pointerId); frame(); });
  svg.addEventListener("pointermove", (e) => { if (!drag) return; if (Math.abs(e.clientX - drag.x) > 4) drag.moved = true; if (drag.moved) { place(drag.i, cmOf(toLocal(svg, e).x)); frame(); } });
  const up = () => { if (!drag) return; if (!drag.moved) ants[drag.i] = { ...ants[drag.i], d: -ants[drag.i].d }; drag = null; frame(); };
  svg.addEventListener("pointerup", up); svg.addEventListener("pointercancel", () => { drag = null; frame(); });
  svg.addEventListener("keydown", (e) => {
    const h = e.target.closest?.(".toy-handle"); if (!h || mode !== "set") return;
    const i = Number(h.dataset.i), step = e.shiftKey ? 10 : 1;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); place(i, ants[i].x + (e.key === "ArrowLeft" ? -step : step)); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ants[i] = { ...ants[i], d: -ants[i].d }; }
    else return;
    frame();
  });
  go.addEventListener("click", start);
  root.querySelector('[data-a="reset"]').addEventListener("click", reset);
  frame();
  raf = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(raf);
}
