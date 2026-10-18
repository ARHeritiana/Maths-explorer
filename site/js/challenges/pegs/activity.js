// Hands-on activity of the pegs challenge: the learner tries, fails and notices; it never states the answer or the method.
import { colour, onHintAction, svgEl } from "../common/kit.js";
import { pegTarget, PEGS_START, pegClass, pegsMin, pegLanding } from "./maths.js";

/* ------------------------------------------------------------ three pegs */
export function activity(root, { t, q, reduced }) {
  const T = pegTarget(q.target), NAMES = ["A", "B", "C"], MIN_SPAN = 6.5, PAD = 2.2, HOP = 0.34, DUR = 320;
  let pos, hist, sel, bounds, level = 0, notice = "", fly = null, raf = 0;   // level 1: parity of each peg (hint 1), 2: points coloured by parity (hint 2)
  const reset = () => { pos = PEGS_START.map((p) => [...p]); hist = []; sel = null; bounds = null; notice = ""; };
  root.innerHTML = `
    <p class="act-help">${t("Touche un pion, puis un autre : le premier saute par-dessus le second et atterrit au point symétrique, si ce point est libre. Peux-tu amener un pion sur le point visé ?", "Tap a peg, then another: the first jumps over the second and lands on the symmetric point, if that point is free. Can you bring a peg onto the marked point?")}</p>
    <svg class="act-svg" viewBox="0 0 10 10" role="group" aria-label="${t("Quadrillage, trois pions et un point visé", "Grid, three pegs and a target point")}"></svg>
    <div class="act-controls"><button class="btn-quiet" id="pg-undo" type="button">${t("Annuler", "Undo")}</button><button class="btn-quiet" id="pg-reset" type="button">${t("Recommencer", "Restart")}</button></div>
    <p class="act-readout" id="pg-read" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector("#pg-read");
  // The camera only grows during a game, so the board never jumps back when a peg returns; Restart resets it.
  function fit() {
    const pts = [...pos, T], xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    let lo = [Math.min(...xs) - PAD, Math.min(...ys) - PAD], hi = [Math.max(...xs) + PAD, Math.max(...ys) + PAD];
    if (bounds) { lo = [Math.min(lo[0], bounds.lo[0]), Math.min(lo[1], bounds.lo[1])]; hi = [Math.max(hi[0], bounds.hi[0]), Math.max(hi[1], bounds.hi[1])]; }
    const span = Math.max(MIN_SPAN, hi[0] - lo[0], hi[1] - lo[1]), cx = (lo[0] + hi[0]) / 2, cy = (lo[1] + hi[1]) / 2;
    bounds = { lo: [cx - span / 2, cy - span / 2], hi: [cx + span / 2, cy + span / 2] };
    return { x0: bounds.lo[0], y0: bounds.lo[1], span };
  }
  const classOf = (x, y) => pegClass([x, y]).join();
  const CLASS_COLOUR = { "0,0": colour(0), "1,0": colour(1), "0,1": colour(2) };
  function draw(k = 1) {
    const { x0, y0, span } = fit();
    svg.setAttribute("viewBox", `${x0} ${y0} ${span} ${span}`);
    svg.replaceChildren();
    for (let x = Math.floor(x0); x <= Math.ceil(x0 + span); x++) for (let y = Math.floor(y0); y <= Math.ceil(y0 + span); y++) {
      const cl = classOf(x, y);
      if (level === 2) svgEl("circle", { cx: x, cy: y, r: cl === "1,1" ? 0.1 : 0.075, fill: cl === "1,1" ? "none" : CLASS_COLOUR[cl], stroke: cl === "1,1" ? "var(--ink)" : "none", "stroke-width": 0.03 }, svg);
      else svgEl("circle", { cx: x, cy: y, r: 0.045, fill: "var(--line-strong)" }, svg);
    }
    const tg = svgEl("g", { "aria-hidden": "true" }, svg);
    svgEl("circle", { cx: T[0], cy: T[1], r: 0.26, fill: "none", stroke: "var(--ink)", "stroke-width": 0.05, "stroke-dasharray": "0.09 0.08" }, tg);
    svgEl("line", { x1: T[0] - 0.12, y1: T[1], x2: T[0] + 0.12, y2: T[1], stroke: "var(--ink)", "stroke-width": 0.045 }, tg);
    svgEl("line", { x1: T[0], y1: T[1] - 0.12, x2: T[0], y2: T[1] + 0.12, stroke: "var(--ink)", "stroke-width": 0.045 }, tg);
    pos.forEach((p, i) => {
      let x = p[0], y = p[1];
      if (fly && fly.i === i) { x = fly.from[0] + (fly.to[0] - fly.from[0]) * k; y = fly.from[1] + (fly.to[1] - fly.from[1]) * k - Math.sin(Math.PI * k) * HOP; }
      const g = svgEl("g", { class: "toy-handle", tabindex: 0, role: "button", "data-i": i, "aria-pressed": sel === i ? "true" : "false", "aria-label": `${t("Pion", "Peg")} ${NAMES[i]} ${t("en", "at")} (${p[0]}, ${p[1]})` }, svg);
      svgEl("circle", { class: "hit", cx: x, cy: y, r: 0.5 }, g);
      if (sel === i) svgEl("circle", { cx: x, cy: y, r: 0.42, fill: "none", stroke: "var(--ink)", "stroke-width": 0.06 }, g);
      svgEl("circle", { cx: x, cy: y, r: 0.3, fill: `color-mix(in srgb, ${colour(i)} 70%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 0.05 }, g);
      svgEl("text", { x, y: y + 0.11, "text-anchor": "middle", "font-size": 0.32, "font-weight": 700, fill: "var(--ink)", "pointer-events": "none" }, g).textContent = NAMES[i];
      if (level >= 1) svgEl("text", { x, y: y + 0.72, "text-anchor": "middle", "font-size": 0.24, fill: "var(--ink)", "pointer-events": "none" }, g).textContent = `(${pegClass(p).join(", ")})`;
    });
    root.querySelector("#pg-undo").disabled = !hist.length || !!fly;
    const done = pos.findIndex((p) => p[0] === T[0] && p[1] === T[1]);
    const legend = level === 2 ? ` · ${t("couleur d’un point = couleur du pion qui garde cette parité ; cercle vide = parité qu’aucun pion n’a", "colour of a point = colour of the peg that keeps that parity; empty circle = a parity no peg has")}` : "";
    read.innerHTML = notice ? notice : `${t("Sauts", "Jumps")} : <strong>${hist.length}</strong>${done >= 0 ? ` · <strong>${t(`le pion ${NAMES[done]} est sur le point visé !`, `peg ${NAMES[done]} is on the target!`)}</strong> ${t(`En ${hist.length} saut${hist.length > 1 ? "s" : ""} ; le minimum possible est ${pegsMin(T)}.`, `In ${hist.length} jump${hist.length > 1 ? "s" : ""}; the least possible is ${pegsMin(T)}.`)}` : ""}${legend}`;
  }
  function jump(a, b) {
    const to = pegLanding(pos[a], pos[b]);
    if (pos.some((p, k) => k !== a && p[0] === to[0] && p[1] === to[1])) { notice = t("Ce saut atterrit sur un autre pion.", "That jump lands on another peg."); sel = null; draw(); return; }
    hist.push(pos.map((p) => [...p])); notice = ""; sel = null;
    const from = [...pos[a]]; pos[a] = to;
    if (reduced) { draw(); return; }
    fly = { i: a, from, to }; const start = performance.now();
    const step = (now) => { const k = Math.min(1, (now - start) / DUR); if (k < 1) { draw(k * k * (3 - 2 * k)); raf = requestAnimationFrame(step); } else { fly = null; raf = 0; draw(); } };
    raf = requestAnimationFrame(step);
  }
  function pick(i) {
    if (fly) return;
    notice = "";
    if (sel === null) sel = i; else if (sel === i) sel = null; else { jump(sel, i); return; }
    draw();
  }
  svg.addEventListener("click", (e) => { const g = e.target.closest(".toy-handle"); if (g) pick(Number(g.dataset.i)); });
  svg.addEventListener("keydown", (e) => { const g = e.target.closest?.(".toy-handle"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); pick(Number(g.dataset.i)); } });
  root.querySelector("#pg-undo").addEventListener("click", () => { if (fly) return; const p = hist.pop(); if (p) { pos = p; sel = null; notice = ""; draw(); } });
  root.querySelector("#pg-reset").addEventListener("click", () => { cancelAnimationFrame(raf); fly = null; reset(); draw(); });
  reset(); draw();
  const off = onHintAction("pegs", { parity: () => { level = Math.max(level, 1); draw(); }, classes: () => { level = 2; draw(); } });
  return () => { cancelAnimationFrame(raf); off(); };
}
