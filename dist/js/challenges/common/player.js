// Animated solutions: each challenge explains its answer as a short sequence of steps, drawn as SVG.
// A solution is { size: [w, h], steps(q): [[fr, en], ...], draw(ctx, step, p, q) } where q holds the parameters of the
// variation being solved, and draw is a pure function of the step index and the progress p in [0, 1] inside that step,
// so any frame can be reproduced and scrubbed.
// Controls: restart, previous, play or pause, next. With reduced motion nothing plays by itself: each step shows its
// finished state. The caption of the current step is announced in a polite live region.
import { makeCtx } from "./kit.js";

export const ctxFor = makeCtx;

/* ----------------------------------------------------------------- player */
export function playSolution(def, root, { lang, reduced: reducedPref, params = {} }) {
  const reduced = () => (typeof reducedPref === "function" ? reducedPref() : !!reducedPref);   // the app passes a function
  const t = (fr, en) => (lang === "fr" ? fr : en);
  const [w, h] = def.size, HOLD = 900, steps = def.steps(params), nSteps = steps.length;
  const durOf = () => (def.dur ? def.dur(step, params) : 2600);   // a solution may pace each step itself
  let step = 0, p = reduced() ? 1 : 0, auto = false, raf = 0, started = false, scene = null;
  root.innerHTML = `
    <div class="sol-anim">
      <svg class="sol-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${t("Animation de la solution", "Solution animation")}"></svg>
      <p class="sol-cap" role="status" aria-live="polite"></p>
      <div class="sol-controls">
        <button class="btn-quiet" data-a="restart" type="button" aria-label="${t("Revenir au début", "Back to the start")}">⏮</button>
        <button class="btn btn-secondary" data-a="prev" type="button">${t("Précédent", "Previous")}</button>
        <button class="btn btn-primary" data-a="play" type="button" aria-pressed="false">${t("Lecture", "Play")}</button>
        <button class="btn btn-secondary" data-a="next" type="button">${t("Suivant", "Next")}</button>
        <span class="sol-count"></span>
      </div>
    </div>`;
  const svg = root.querySelector("svg"), cap = root.querySelector(".sol-cap"), count = root.querySelector(".sol-count");
  const btn = (a) => root.querySelector(`[data-a="${a}"]`), playBtn = btn("play");
  function paint() {
    if (def.mount) { scene ||= (svg.replaceChildren(), def.mount(ctxFor(svg, lang), params)); def.update(scene, step, p, params); }   // built once, then posed
    else { svg.replaceChildren(); def.draw(ctxFor(svg, lang), step, p, params); }
    cap.textContent = steps[step][lang === "fr" ? 0 : 1];
    count.textContent = `${t("Étape", "Step")} ${step + 1} / ${nSteps}`;
    btn("prev").disabled = step === 0;
    btn("next").disabled = step === nSteps - 1 && p >= 1;
    playBtn.textContent = auto ? t("Pause", "Pause") : step === nSteps - 1 && p >= 1 ? t("Rejouer", "Replay") : t("Lecture", "Play");
    playBtn.setAttribute("aria-pressed", String(auto));
  }
  const halt = () => { auto = false; cancelAnimationFrame(raf); raf = 0; };
  // Animate the current step from its progress p to 1; with auto, carry on to the next steps.
  function run() {
    cancelAnimationFrame(raf);
    let start = performance.now() - p * durOf();
    const tick = (now) => {
      const e = now - start, DUR = durOf();
      p = Math.min(1, Math.max(0, e / DUR));   // a frame timestamp can predate the start by a few ms
      paint();
      if (p < 1) { raf = requestAnimationFrame(tick); return; }
      if (auto && step < nSteps - 1) {
        if (e < DUR + HOLD) { raf = requestAnimationFrame(tick); return; }
        step += 1; p = 0; start = now; paint(); raf = requestAnimationFrame(tick); return;
      }
      auto = false; raf = 0; paint();
    };
    raf = requestAnimationFrame(tick);
  }
  const show = (k, animated) => { halt(); step = clamp(k, 0, nSteps - 1); p = animated && !reduced() ? 0 : 1; paint(); if (p < 1) run(); };
  // These controls are replaced when variation data changes; discarded players must not receive new clicks.
  root.querySelector(".sol-controls").addEventListener("click", (e) => {
    const b = e.target.closest("[data-a]");
    if (!b) return;
    const a = b.dataset.a;
    if (a === "restart") show(0, true);
    else if (a === "prev") show(step - 1, false);
    else if (a === "next") { if (p < 1) { halt(); p = 1; paint(); } else show(step + 1, true); }
    else if (auto) { halt(); paint(); }
    else if (reduced()) show(step === nSteps - 1 ? 0 : step + 1, false);
    else { if (step === nSteps - 1 && p >= 1) { step = 0; p = 0; } auto = true; paint(); run(); }
  });
  paint();
  // seek: show the frame at (step, p) without playing; used by the browser tests and for scrubbing
  return { stop: halt, seek: (k, pp = 1) => { halt(); step = clamp(k, 0, nSteps - 1); p = clamp(pp, 0, 1); paint(); }, steps: nSteps, start: () => { if (!started && !reduced()) { started = true; auto = true; paint(); run(); } } };
}

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
