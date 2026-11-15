// Hands-on activity of the piles challenge: the learner tries, fails and notices; it never states the answer or the method.
import { MINUS, clamp, goalLine } from "../common/kit.js";
import { PRESS, installCartoon, pop } from "../common/cartoon.js";
import { splitTotal } from "./maths.js";

/* ----------------------------------------------------------------- piles */
export function activity(root, { t, q, reduced }) {
  installCartoon();
  const N = q.n;
  let ps, log, total, sel, cut;
  const reset = () => { ps = [N]; log = []; total = 0; sel = 0; cut = 1; };
  root.innerHTML = `
    ${goalLine(t, `Sépare le tas jusqu’à ce que chaque tas n’ait plus qu’un caillou.`, `Split the pile until every pile has a single pebble.`, "Choisis un tas d’au moins 2 cailloux, règle la coupure, puis sépare : le produit est noté.", "Choose a pile of at least 2 pebbles, set the cut, then split: the product is written down.")}
    <div class="cl-grid cl-piles" id="pl-piles" role="group" aria-label="${t("Tas de cailloux", "Piles of pebbles")}"></div>
    <div class="act-controls"><label class="act-field" for="pl-cut"><span class="act-label">${t("Coupure", "Cut")} <output id="pl-cutout"></output></span><input id="pl-cut" type="range" min="1" max="2" step="1" value="1"></label>
      <button class="btn btn-primary ${PRESS}" id="pl-split" type="button">${t("Séparer", "Split")}</button><button class="btn btn-secondary ${PRESS}" id="pl-rand" type="button">${t("Tout séparer au hasard", "Split everything at random")}</button><button class="btn-quiet ${PRESS}" id="pl-reset" type="button">${t("Recommencer", "Restart")}</button></div>
    <p class="act-readout" id="pl-read" role="status" aria-live="polite"></p>
    <ol class="cl-log" id="pl-log" aria-label="${t("Produits notés", "Products written down")}"></ol>`;
  const box2 = root.querySelector("#pl-piles"), read = root.querySelector("#pl-read"), logEl = root.querySelector("#pl-log"), slider = root.querySelector("#pl-cut");
  function draw() {
    if (sel >= ps.length || ps[sel] < 2) sel = Math.max(0, ps.findIndex((x) => x > 1));
    const s = ps[sel] ?? 1; cut = clamp(cut, 1, Math.max(1, s - 1));
    box2.innerHTML = ps.map((x, i) => `<button type="button" class="cl-tok ${PRESS}" data-i="${i}" aria-pressed="${i === sel && x > 1}" ${x > 1 ? "" : "disabled"}>${x}</button>`).join("");
    slider.max = Math.max(1, s - 1); slider.value = cut; slider.disabled = s < 2;
    root.querySelector("#pl-cutout").textContent = s > 1 ? `${cut} + ${s - cut} → ${cut * (s - cut)}` : "—";
    root.querySelector("#pl-split").disabled = s < 2; root.querySelector("#pl-rand").disabled = !ps.some((x) => x > 1);
    logEl.innerHTML = log.map((l) => `<li>${l.a} × ${l.b} = ${l.a * l.b}</li>`).join("");
    const done = !ps.some((x) => x > 1);
    read.innerHTML = `${t("Total des produits", "Total of the products")} : <strong>${total}</strong>${done ? ` · ${t("Tous les tas sont réduits à un caillou.", "Every pile is down to one pebble.")}` : ""}`;
  }
  function split(i, a) { const s = ps[i], b = s - a; ps.splice(i, 1, a, b); log.push({ a, b }); total += a * b; }
  box2.addEventListener("click", (e) => { const b = e.target.closest(".cl-tok"); if (b && !b.disabled) { sel = Number(b.dataset.i); draw(); } });
  slider.addEventListener("input", () => { cut = Number(slider.value); draw(); });
  root.querySelector("#pl-split").addEventListener("click", () => { if (ps[sel] > 1) { split(sel, cut); cut = 1; draw(); } });
  root.querySelector("#pl-rand").addEventListener("click", () => { while (ps.some((x) => x > 1)) { const i = ps.findIndex((x) => x > 1); split(i, 1 + Math.floor(Math.random() * (ps[i] - 1))); } draw(); });
  root.querySelector("#pl-reset").addEventListener("click", () => { reset(); draw(); });
  // The piles are rebuilt on every draw: pop the fresh twin of the pressed button once the handlers above have redrawn.
  root.addEventListener("click", (e) => { const b = e.target.closest?.("button"); if (!b) return; const nb = b.id ? root.querySelector(`#${b.id}`) : root.querySelector(`.cl-tok[data-i="${b.dataset.i}"]`); if (nb && !nb.disabled) pop(nb, reduced); });
  void MINUS;
  reset(); draw();
  return () => {};
}
