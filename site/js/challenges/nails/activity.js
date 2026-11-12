// Hands-on activity of the nails challenge: a picture hangs on a wall from a rope wound around the nails. Wind turns around the
// nails (buttons, or draw a loop around them), and pull nails out: a nail presses flat, pops out of the wall, the turns around it
// slip off and the picture falls and bounces or stays caught. No words, counters or tables: the scene is the only feedback (a
// hidden status line serves screen readers). Motion in timeline.js, the stroke in gesture.js, drawings in art.js.
import { colour, svgEl, toLocal } from "../common/kit.js";
import { parseNails, NAMES } from "./maths.js";
import { NAIL_Y, nailX, drawScene } from "./art.js";
import { timeline, poseAt, poseOf, settled, easeInOut, clamp01 } from "./timeline.js";
import { startStroke, extendStroke, previewPoints, finishStroke } from "./gesture.js";

const STYLE = `
.nl-stage{display:grid;gap:12px}
.nl-stage .act-svg{width:100%;height:auto;max-height:72vh;border:2px solid var(--ink);touch-action:none;display:block}
.nl-controls{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center}
.nl-turns{display:flex;flex-wrap:wrap;gap:8px}
.nl-turns button,.nl-tools button{min-height:48px;min-width:48px;font-size:1.1rem;font-weight:700;border:2px solid var(--ink);transition:transform .22s cubic-bezier(.3,1.9,.5,1)}
.nl-turns button:active,.nl-tools button:active{transform:scale(.88,.8)}
.nl-turns button.is-pop{animation:nl-pop .35s cubic-bezier(.3,1.9,.5,1)}
.nl-tools{display:flex;flex-wrap:wrap;gap:8px}
@keyframes nl-pop{0%{transform:scale(1)}35%{transform:scale(.86,.78)}70%{transform:scale(1.08,1.12)}100%{transform:scale(1)}}
.nl-stage [data-nail]{cursor:grab}.nl-stage [data-nail]:focus-visible circle{stroke:var(--accent);stroke-width:.6}
@media (prefers-reduced-motion:reduce){.nl-turns button,.nl-tools button{transition:none}.nl-turns button:active,.nl-tools button:active{transform:none}.nl-turns button.is-pop{animation:none}}`;

export function activity(root, { t, q, reduced: reducedPref }) {
  const reduced = () => (typeof reducedPref === "function" ? !!reducedPref() : !!reducedPref);
  const [n] = parseNails(q.nails), W = 100, H = 100, ny = NAIL_Y;
  let word = [], removed = 0, raf = 0, gesture = null, blocked = false, upTo = Infinity, held = null, show = poseOf(word, n, 0);
  const pointers = new Set();
  root.innerHTML = `<style>${STYLE}</style>
    <div class="nl-stage">
      <svg class="act-svg" viewBox="0 0 ${W} ${H}" tabindex="0" role="group" aria-label="${t("Mur, clous, ficelle et tableau", "Wall, nails, string and picture")}"></svg>
      <div class="nl-controls">
        <div class="nl-turns" role="group" aria-label="${t("Tours de ficelle", "Turns of string")}">${NAMES.slice(0, n).map((N, i) => `<button class="secondary" type="button" data-c="${i + 1}" style="border-color:var(--ink);background:color-mix(in srgb,${colour(i)} 22%,var(--surface))" aria-label="${t(`Un tour autour de ${N} dans le sens des aiguilles d’une montre`, `A clockwise turn around ${N}`)}">↻ ${N}</button><button class="secondary" type="button" data-c="${-(i + 1)}" style="background:color-mix(in srgb,${colour(i)} 22%,var(--surface))" aria-label="${t(`Un tour autour de ${N} dans l’autre sens`, `An anticlockwise turn around ${N}`)}">↺ ${N}</button>`).join("")}</div>
        <div class="nl-tools"><button class="btn-quiet" id="nl-undo" type="button">${t("Annuler", "Undo")}</button><button class="btn-quiet" id="nl-clear" type="button">${t("Recommencer", "Start over")}</button></div>
      </div>
    </div>
    <p class="sr-only" id="nl-read" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector("#nl-read");
  const resting = () => poseOf(word, n, removed);
  const settle = () => { cancelAnimationFrame(raf); show = resting(); upTo = Infinity; held = null; draw(); announce(); };
  const announce = () => { read.textContent = word.length ? (settled(word, removed).falls ? t("Le tableau tombe.", "The picture falls.") : t("Le tableau tient.", "The picture holds.")) : t("Le tableau est à terre : la ficelle ne fait le tour d’aucun clou.", "The picture is on the floor: the string goes round no nail."); };

  function draw() {
    const focusNail = svg.contains(document.activeElement) ? document.activeElement.dataset.nail : undefined;
    svg.replaceChildren();
    drawScene(svg, { word, n, pose: show, upTo, lift: held ? Array.from({ length: n }, (_, i) => (held.i === i ? held.amt * 0.7 : 0)) : [], held: held ? held.i : -1 });
    for (let i = 0; i < n; i++) {
      const off = (removed >> i) & 1;
      const hit = svgEl("g", { "data-nail": i, tabindex: 0, role: "button", "aria-pressed": String(!!off), "aria-label": `${t(off ? "Remettre le clou" : "Arracher le clou", off ? "Put back nail" : "Pull out nail")} ${NAMES[i]}` }, svg);
      svgEl("circle", { cx: nailX(i, n), cy: ny, r: 4.8, fill: "transparent", stroke: "transparent" }, hit);
    }
    const pts = previewPoints(gesture);
    if (pts.length > 1) svgEl("polyline", { points: pts.map((p) => `${p.x},${p.y}`).join(" "), fill: "none", stroke: "var(--accent)", "stroke-width": 0.9, "stroke-dasharray": "1.5 1", "stroke-linecap": "round" }, svg);
    if (focusNail !== undefined) svg.querySelector(`[data-nail="${focusNail}"]`)?.focus({ preventScroll: true });
  }

  // a run of events from the timeline module, then the resting pose
  function play(tl) {
    cancelAnimationFrame(raf);
    if (reduced() || !tl.events.length) { settle(); return; }
    const dur = 520 * tl.total, t0 = performance.now();
    const tick = (now) => { const p = Math.min(1, (now - t0) / dur); show = poseAt(tl, p); draw(); if (p < 1) raf = requestAnimationFrame(tick); else settle(); };
    raf = requestAnimationFrame(tick);
  }
  // glide from what is shown to the resting pose (nails put back, turns changed); `wind` winds the rope in from that many turns
  function glide(wind = -1, dur = 520) {
    cancelAnimationFrame(raf);
    if (reduced()) { settle(); return; }
    const a = show, b = resting(), t0 = performance.now(), total = word.length + 2;
    const tick = (now) => {
      const s = Math.min(1, (now - t0) / (wind >= 0 ? Math.max(dur, 380 * (word.length - wind)) : dur)), e = easeInOut(s);
      show = { pull: b.pull.map((v, i) => (a.pull[i] ?? v) + (v - (a.pull[i] ?? v)) * e), squash: b.pull.map((v, i) => ((a.pull[i] ?? v) > v ? 0.2 * Math.sin(Math.PI * s) : 0)), collapse: b.collapse.map((v, j) => (a.collapse[j] ?? v) + (v - (a.collapse[j] ?? v)) * e), fall: a.fall + (b.fall - a.fall) * e, sway: 0, focus: -1 };
      upTo = wind >= 0 ? wind + 1 + (total - wind - 1) * s : Infinity;
      draw();
      if (s < 1) raf = requestAnimationFrame(tick); else settle();
    };
    raf = requestAnimationFrame(tick);
  }
  function pullOut(i) { const tl = timeline(word, n, { from: removed, add: [i], prev: removed }); upTo = Infinity; removed |= 1 << i; play(tl); }
  function putBack(i) { removed &= ~(1 << i); glide(); }
  const toggle = (i) => ((removed >> i) & 1 ? putBack(i) : pullOut(i));
  function addTurns(cs) { const before = word.length; word = [...word, ...cs]; glide(before, 380 * cs.length); }
  const changed = () => glide();

  const bounce = (b) => { b.classList.remove("is-pop"); void b.offsetWidth; if (!reduced()) b.classList.add("is-pop"); };
  root.querySelector(".nl-turns").addEventListener("click", (e) => { const b = e.target.closest("[data-c]"), c = Number(b?.dataset.c); if (!c) return; bounce(b); addTurns([c]); });
  root.querySelector("#nl-undo").addEventListener("click", () => { word = word.slice(0, -1); changed(); });
  root.querySelector("#nl-clear").addEventListener("click", () => { word = []; removed = 0; changed(); });

  // a nail follows the pointer a little (it lifts toward you); let go far enough, or just tap, and it pops out (or goes back in)
  function release(i, amt) { if (amt > 0.3 || amt < 0.001) { held = null; toggle(i); return; } held = null; show = { ...show, squash: show.squash.map((v, k) => (k === i ? -0.2 : v)) }; draw(); setTimeout(() => settle(), reduced() ? 0 : 120); }

  svg.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    pointers.add(e.pointerId);
    if (pointers.size > 1) { blocked = true; gesture = null; held = null; draw(); return; }
    if (blocked) return;
    cancelAnimationFrame(raf); const p = toLocal(svg, e), nail = e.target.closest?.("[data-nail]");
    svg.setPointerCapture?.(e.pointerId); svg.focus({ preventScroll: true });
    if (nail) { held = { id: e.pointerId, i: Number(nail.dataset.nail), x: p.x, y: p.y, amt: 0 }; if (!reduced()) show = { ...resting(), squash: resting().squash.map(() => 0) }; draw(); return; }
    gesture = { id: e.pointerId, ...startStroke(p) };
    draw();
  });
  svg.addEventListener("pointermove", (e) => {
    if (blocked) return;
    const p = toLocal(svg, e);
    if (held && held.id === e.pointerId) { held.amt = clamp01(Math.hypot(p.x - held.x, p.y - held.y) / 5); draw(); return; }
    if (!gesture || gesture.id !== e.pointerId) return;
    if (Math.hypot(p.x - gesture.points.at(-1).x, p.y - gesture.points.at(-1).y) < 0.2) return;
    extendStroke(gesture, p, n); draw();
  });
  svg.addEventListener("pointerup", (e) => {
    pointers.delete(e.pointerId);
    if (blocked) { if (!pointers.size) blocked = false; return; }
    if (held && held.id === e.pointerId) { const h = held; release(h.i, h.amt); return; }
    if (!gesture || gesture.id !== e.pointerId) return;
    extendStroke(gesture, toLocal(svg, e), n);
    const g = gesture; gesture = null;
    const r = finishStroke(g, n);
    if (!r.moved) { draw(); return; }
    if (r.invalid) { read.textContent = t("Le tracé traverse un clou.", "The stroke crosses a nail."); draw(); }
    else if (r.turns.length) addTurns(r.turns); else draw();
  });
  const cancel = (e) => { pointers.delete(e.pointerId); if (!pointers.size) blocked = false; if (gesture?.id === e.pointerId) { gesture = null; draw(); } if (held?.id === e.pointerId) { held = null; settle(); } };
  for (const event of ["pointercancel", "lostpointercapture"]) svg.addEventListener(event, cancel);
  svg.addEventListener("view-gesture", () => { gesture = null; held = null; blocked = pointers.size > 0; draw(); });
  svg.addEventListener("keydown", (e) => {
    const nail = e.target.closest?.("[data-nail]");
    if (nail && ["Enter", " "].includes(e.key)) { e.preventDefault(); toggle(Number(nail.dataset.nail)); }
    if (e.key === "Escape") { gesture = null; held = null; draw(); }
  });
  settle();
  return () => { cancelAnimationFrame(raf); gesture = null; pointers.clear(); };
}
