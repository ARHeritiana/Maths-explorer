// Hands-on activity of the josephus challenge: the learner tries, fails and notices; it never states the answer or the method.
import { svgEl } from "../common/kit.js";
import { josephusOrder } from "./maths.js";

/* -------------------------------------------------------------- josephus */
export function activity(root, { t, reduced, q }) {
  const W = 360, H = 360, CX = 180, CY = 180, K = Number(q.k);
  let n = q.n, killed, order, timer = 0;
  root.innerHTML = `
    <p class="act-help">${K === 2 ? t("Les personnes sont en cercle. On saute la première, on élimine la deuxième, on saute la troisième, on élimine la quatrième, et ainsi de suite en tournant. Avance pas à pas ou lance la partie.", "People stand in a circle. Skip the first, remove the second, skip the third, remove the fourth, and so on around the circle. Step through or run the whole game.") : t(`Les personnes sont en cercle. On saute ${K - 1} personnes, on élimine la suivante, et ainsi de suite en tournant. Avance pas à pas ou lance la partie.`, `People stand in a circle. Skip ${K - 1} people, remove the next one, and so on around the circle. Step through or run the whole game.`)}</p>
    <svg class="act-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${t("Cercle de personnes numérotées", "Circle of numbered people")}"></svg>
    <div class="act-controls">
      <label class="act-field" for="js-n"><span class="act-label">${t("Nombre de personnes", "Number of people")} <output id="js-out"></output></span><input id="js-n" type="range" min="1" max="100" step="1" value="${n}"></label>
      <div class="act-buttons"><button class="btn btn-secondary" id="js-step" type="button">${t("Éliminer la suivante", "Remove the next one")}</button>
      <button class="btn btn-primary" id="js-run" type="button">${t("Jouer jusqu’au bout", "Play to the end")}</button>
      <button class="btn-quiet" id="js-reset" type="button">${t("Recommencer", "Restart")}</button></div>
    </div>
    <p class="act-readout" id="js-read" role="status" aria-live="polite"></p>
    <p class="act-score" id="js-table"></p>`;
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
      if (n <= 45 || win) svgEl("text", { x, y: y + 3.5, "text-anchor": "middle", class: `js-n${isDead ? " dead" : ""}` }, svg).textContent = i;
    }
    root.querySelector("#js-out").textContent = n;
    const left = n - killed;
    read.innerHTML = finished ? `${t("Dernière personne restante", "Last person standing")} : <strong>${order.last}</strong>.` : `${left} ${t(left > 1 ? "personnes restent" : "personne reste", "remain")}${killed ? `. ${t("Dernière éliminée", "Last removed")} : ${order.out[killed - 1]}` : ""}.`;
    root.querySelector("#js-step").disabled = finished;
    root.querySelector("#js-run").disabled = finished;
    root.querySelector("#js-table").textContent = `${t("Survivante pour n = 1, 2, …, 20", "Survivor for n = 1, 2, …, 20")} : ${Array.from({ length: 20 }, (_, k) => josephusOrder(k + 1, K).last).join(", ")}`;
  }
  root.querySelector("#js-n").addEventListener("input", (e) => { n = Number(e.target.value); setup(); });
  root.querySelector("#js-step").addEventListener("click", () => { stop(); if (killed < order.out.length) killed += 1; draw(); });
  root.querySelector("#js-run").addEventListener("click", () => {
    stop();
    if (reduced()) { killed = order.out.length; draw(); return; }
    timer = setInterval(() => { if (killed >= order.out.length) return stop(); killed += 1; draw(); }, n > 45 ? 70 : 140);
  });
  root.querySelector("#js-reset").addEventListener("click", setup);
  setup();
  return stop;
}
