// Hands-on activity of the __ID__ challenge: the learner tries, fails and notices; it never states the answer or the method.
// Contract: activity(root, { t, q, reduced, lang }) draws into root and returns a cleanup function.
import { colour, svgEl, goalLine } from "../common/kit.js";
import { PRESS, installCartoon } from "../common/cartoon.js";
import { seats, pairKey, handshakes } from "./maths.js";

export function activity(root, { t, q }) {
  installCartoon();
  const n = q.n, P = seats(n, 50, 50, 40), done = new Set();
  let sel = null;
  root.innerHTML = `
    ${goalLine(t, "Fais serrer la main à tout le monde.", "Get everyone to shake hands.", "Touche une personne puis une autre pour qu’elles se serrent la main.", "Tap one person then another to make them shake hands.")}
    <svg class="act-svg" viewBox="0 0 100 100" role="group" aria-label="${t("Personnes autour d’une table", "People around a table")}"></svg>
    <div class="act-controls"><button class="btn-quiet ${PRESS}" type="button" data-a="reset">${t("Recommencer", "Restart")}</button></div>
    <p class="act-readout" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector(".act-readout");
  function draw() {
    svg.replaceChildren();
    for (const k of done) { const [i, j] = k.split("-").map(Number); svgEl("line", { x1: P[i][0], y1: P[i][1], x2: P[j][0], y2: P[j][1], stroke: "var(--accent)", "stroke-width": 0.6 }, svg); }
    P.forEach(([x, y], i) => {
      const g = svgEl("g", { class: "toy-handle", tabindex: 0, role: "button", "data-i": i, "aria-pressed": String(sel === i), "aria-label": `${t("Personne", "Person")} ${i + 1}` }, svg);
      svgEl("circle", { class: "hit", cx: x, cy: y, r: 5 }, g);
      svgEl("circle", { cx: x, cy: y, r: sel === i ? 3.6 : 2.8, fill: `color-mix(in srgb, ${colour(i)} 70%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 0.4 }, g);
    });
    // a neutral end message only; no running count that would hand over the method
    read.textContent = done.size === handshakes(n) ? t("Tout le monde s’est serré la main.", "Everyone has shaken hands.") : "";
  }
  const pick = (i) => { if (sel === null || sel === i) sel = sel === i ? null : i; else { done.add(pairKey(sel, i)); sel = null; } draw(); };
  svg.addEventListener("click", (e) => { const g = e.target.closest(".toy-handle"); if (g) pick(Number(g.dataset.i)); });
  svg.addEventListener("keydown", (e) => { const g = e.target.closest?.(".toy-handle"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); pick(Number(g.dataset.i)); } });
  root.querySelector('[data-a="reset"]').addEventListener("click", () => { done.clear(); sel = null; draw(); });
  draw();
  return () => {};   // cancel timers and animation frames here
}
