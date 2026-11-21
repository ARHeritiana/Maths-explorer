// Hands-on activity of the josephus challenge: the learner tries, fails and notices; it never states the answer or the method.
import { svgEl, goalLine } from "../common/kit.js";
import { cartoonPress } from "../common/cartoon.js";
import { josephusOrder } from "./maths.js";
import { mountBuddy } from "../common/buddy.js";

/* -------------------------------------------------------------- josephus */
export function activity(root, { t, reduced, q }) {
  const W = 360, H = 360, CX = 180, CY = 180, K = Number(q.k);
  let n = q.n, killed, order, timer = 0;
  root.innerHTML = `
    ${goalLine(t, "Trouve qui reste en dernier.", "Find who is left last.")}<span class="sr-only">${K === 2 ? t("Les personnes sont en cercle. On saute la première, on élimine la deuxième, on saute la troisième, on élimine la quatrième, et ainsi de suite en tournant. Avance pas à pas ou lance la partie.", "People stand in a circle. Skip the first, remove the second, skip the third, remove the fourth, and so on around the circle. Step through or run the whole game.") : t(`Les personnes sont en cercle. On saute ${K - 1} personnes, on élimine la suivante, et ainsi de suite en tournant. Avance pas à pas ou lance la partie.`, `People stand in a circle. Skip ${K - 1} people, remove the next one, and so on around the circle. Step through or run the whole game.`)}</span>
    <svg class="act-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${t("Cercle de personnes numérotées", "Circle of numbered people")}"></svg>
    <div class="act-controls">
      <label class="act-field" for="js-n"><span class="act-label">${t("Nombre de personnes", "Number of people")} <output id="js-out"></output></span><input id="js-n" type="range" min="1" max="100" step="1" value="${n}"></label>
      <div class="act-buttons"><button class="btn btn-secondary" id="js-step" type="button">${t("Éliminer la suivante", "Remove the next one")}</button>
      <button class="btn btn-primary" id="js-run" type="button">${t("Jouer jusqu’au bout", "Play to the end")}</button>
      <button class="btn-quiet" id="js-reset" type="button">${t("Recommencer", "Restart")}</button></div>
    </div>
    <p class="act-readout" id="js-read" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector("#js-read");
  const pos = (i) => { const a = ((-90 + (360 * (i - 1)) / n) * Math.PI) / 180, r = 150; return [CX + r * Math.cos(a), CY + r * Math.sin(a)]; };
  const stop = () => { clearInterval(timer); timer = 0; };
  function setup() { stop(); order = josephusOrder(n, K); killed = 0; draw(); }
  function draw() {
    svg.replaceChildren();
    const dead = new Set(order.out.slice(0, killed)), finished = killed >= order.out.length;
    const r = n > 70 ? 4 : n > 45 ? 6 : n > 30 ? 9 : 12;
    for (let i = 1; i <= n; i++) {
      const [x, y] = pos(i), isDead = dead.has(i), win = finished && i === order.last;
      svgEl("circle", { cx: x, cy: y, r: win ? r + 5 : r, class: `js-p${isDead ? " dead" : ""}${win ? " win" : ""}` }, svg);
      // a little face on each person while there is room: eyes (crossed out once eliminated) and a mouth; the last one grins
      if (r >= 9) {
        const ink = { stroke: "var(--ink)", "stroke-width": 0.9, fill: "none", "stroke-linecap": "round", "pointer-events": "none" };
        for (const ex of [-r * 0.36, r * 0.36]) {
          if (isDead) svgEl("path", { d: `M${x + ex - 1.6} ${y - r * 0.42} l3.2 3.2 m0 -3.2 l-3.2 3.2`, ...ink }, svg);
          else svgEl("circle", { cx: x + ex, cy: y - r * 0.28, r: Math.max(1, r * 0.1), fill: "#1d1d1d", "pointer-events": "none" }, svg);
        }
        if (win) svgEl("path", { d: `M${x - r * 0.4} ${y + r * 0.42} q${r * 0.4} ${r * 0.45} ${r * 0.8} 0`, ...ink, "stroke-width": 1.3 }, svg);
        if (win) svgEl("path", { d: `M${x - r * 0.6} ${y - r - 2} l${r * 0.3} ${-r * 0.6} l${r * 0.3} ${r * 0.4} l${r * 0.3} ${-r * 0.5} l${r * 0.3} ${r * 0.5} l${r * 0.3} ${-r * 0.4} l${r * 0.1} ${r * 0.6} Z`, fill: "#ffd34d", stroke: "var(--ink)", "stroke-width": 1, "pointer-events": "none" }, svg);
      }
      if (n <= 45 || win) svgEl("text", { x, y: y + (r >= 9 ? r * 0.62 : 3.5), "text-anchor": "middle", class: `js-n${isDead ? " dead" : ""}`, style: r >= 9 ? `font-size:${Math.max(7, r * 0.75)}px` : "" }, svg).textContent = i;
    }
    root.querySelector("#js-out").textContent = n;
    const left = n - killed;
    read.innerHTML = finished ? `${t("Dernière personne restante", "Last person standing")} : <strong>${order.last}</strong>.` : `${left} ${t(left > 1 ? "personnes restent" : "personne reste", "remain")}${killed ? `. ${t("Dernière éliminée", "Last removed")} : ${order.out[killed - 1]}` : ""}.`;
    root.querySelector("#js-step").disabled = finished;
    root.querySelector("#js-run").disabled = finished;
  }
  root.querySelector("#js-n").addEventListener("input", (e) => { n = Number(e.target.value); setup(); });
  root.querySelector("#js-step").addEventListener("click", () => { stop(); if (killed < order.out.length) killed += 1; draw(); });
  root.querySelector("#js-run").addEventListener("click", () => {
    stop();
    if (reduced()) { killed = order.out.length; draw(); return; }
    timer = setInterval(() => { if (killed >= order.out.length) return stop(); killed += 1; draw(); }, n > 45 ? 70 : 140);
  });
  root.querySelector("#js-reset").addEventListener("click", setup);
  const unpress = cartoonPress(root, reduced);
  setup();
  const buddy = mountBuddy(root, { t, reduced: reduced, cast: [{ kind: "person", look: 0 }, { kind: "person", look: 4 }], backdrop: "camp" });
  const offActivity = () => { stop(); unpress(); };
  return () => { if (typeof offActivity === "function") offActivity(); buddy.destroy(); };
}
