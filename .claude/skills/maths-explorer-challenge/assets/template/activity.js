// Hands-on activity of the __ID__ challenge: the learner tries, fails and notices; it never states the answer or the method.
// Contract: activity(root, { t, q, reduced, lang }) draws into root and returns a cleanup function.
// The world is the solution's world: the same cartoon people (art.js), so the animated solution feels familiar.
import { colour, svgEl, goalLine } from "../common/kit.js";
import { PRESS, installCartoon } from "../common/cartoon.js";
import { seats, pairKey, handshakes } from "./maths.js";
import { makePerson, posePerson } from "./art.js";

const CX = 150, CY = 160, R = 110, HOP = 420;   // HOP: length of the little jump of a handshake, in ms

export function activity(root, { t, q, reduced: reducedPref }) {
  installCartoon();
  const reduced = () => (typeof reducedPref === "function" ? !!reducedPref() : !!reducedPref);
  const n = q.n, S = seats(n, CX, CY, R), done = new Set();
  let sel = null, shake = null, raf = 0;   // shake: { i, j, start } while two people hop
  root.innerHTML = `
    ${goalLine(t, "Fais serrer la main à tout le monde.", "Get everyone to shake hands.", "Touche une personne puis une autre pour qu’elles se serrent la main.", "Tap one person then another to make them shake hands.")}
    <svg class="act-svg" viewBox="0 0 300 300" role="group" aria-label="${t("Personnes autour d’une table", "People around a table")}"></svg>
    <div class="act-controls"><button class="btn-quiet ${PRESS}" type="button" data-a="reset">${t("Recommencer", "Restart")}</button></div>
    <p class="act-readout" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector(".act-readout");
  const centre = (i) => Math.atan2(CY - S[i][1], CX - S[i][0]);
  function draw(now = 0) {
    svg.replaceChildren();
    for (const k of done) { const [i, j] = k.split("-").map(Number); svgEl("line", { x1: S[i][0], y1: S[i][1] - 12, x2: S[j][0], y2: S[j][1] - 12, stroke: "var(--accent)", "stroke-width": 1.6, opacity: 0.8 }, svg); }
    const k = shake ? Math.min(1, (now - shake.start) / HOP) : 0;
    S.forEach(([x, y], i) => {
      const g = svgEl("g", { class: "toy-handle", tabindex: 0, role: "button", "data-i": i, "aria-pressed": String(sel === i), "aria-label": `${t("Personne", "Person")} ${i + 1}` }, svg);
      svgEl("circle", { class: "hit", cx: x, cy: y - 12, r: 17 }, g);
      if (sel === i) svgEl("circle", { cx: x, cy: y - 12, r: 16, fill: "none", stroke: "var(--ink)", "stroke-width": 1.2, "stroke-dasharray": "3 3" }, g);
      const P = makePerson(g, { fill: `color-mix(in srgb, ${colour(i)} 70%, var(--surface))` });
      const inShake = shake && (shake.i === i || shake.j === i);
      const towards = inShake ? Math.atan2(S[shake.i === i ? shake.j : shake.i][1] - y, S[shake.i === i ? shake.j : shake.i][0] - x) : centre(i);
      posePerson(P, { x, y, angle: towards, reach: sel === i || inShake ? 1 : 0, hop: inShake ? k : 0 });
    });
    // a neutral end message only; no running count that would hand over the method
    read.textContent = done.size === handshakes(n) ? t("Tout le monde s’est serré la main.", "Everyone has shaken hands.") : "";
  }
  const animate = (now) => { draw(now); if (shake && now - shake.start < HOP) raf = requestAnimationFrame(animate); else { shake = null; raf = 0; draw(); } };
  const pick = (i) => {
    if (sel === null || sel === i) { sel = sel === i ? null : i; draw(); return; }
    done.add(pairKey(sel, i)); const a = sel; sel = null;
    if (reduced()) { draw(); return; }
    cancelAnimationFrame(raf); shake = { i: a, j: i, start: performance.now() }; raf = requestAnimationFrame(animate);
  };
  svg.addEventListener("click", (e) => { const g = e.target.closest(".toy-handle"); if (g) pick(Number(g.dataset.i)); });
  svg.addEventListener("keydown", (e) => { const g = e.target.closest?.(".toy-handle"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); pick(Number(g.dataset.i)); } });
  root.querySelector('[data-a="reset"]').addEventListener("click", () => { cancelAnimationFrame(raf); shake = null; done.clear(); sel = null; draw(); });
  draw();
  return () => cancelAnimationFrame(raf);   // cancel every timer and animation frame here
}
