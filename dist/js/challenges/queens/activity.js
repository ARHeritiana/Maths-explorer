// Hands-on activity of the queens challenge: the learner tries, fails and notices; it never states the answer or the method.
import { onHintAction } from "../common/kit.js";
import { queensK, QUEENS, unattacked } from "./maths.js";

/* ---------------------------------------------------------------- queens */
export function activity(root, { t, q }) {
  const n = q.n, k = queensK(n, q.k), [best, example] = QUEENS[`${n},${k}`], queensSet = new Set();
  let peeked = false, record = 0;
  root.innerHTML = `
    <p class="act-help">${t(`Touche une case pour poser ou retirer une dame (${k} au plus). Les cases vertes sont libres : ni occupées ni attaquées. Une dame est arrêtée par la première pièce rencontrée.`, `Tap a square to place or remove a queen (${k} at most). Green squares are free: neither occupied nor attacked. A queen's line of sight stops at the first piece.`)}</p>
    <div class="qn-board" id="qn-board" style="--n:${n}" role="grid" aria-label="${t("Échiquier", "Chessboard")}"></div>
    <div class="act-controls"><button class="btn-quiet" id="qn-clear" type="button">${t("Tout retirer", "Remove all")}</button></div>
    <p class="act-readout" id="qn-read" role="status" aria-live="polite"></p>`;
  const board = root.querySelector("#qn-board"), read = root.querySelector("#qn-read");
  function draw() {
    const free = new Set(unattacked(n, [...queensSet]));
    board.innerHTML = Array.from({ length: n * n }, (_, s) => `<button type="button" role="gridcell" class="qn-cell ${(Math.floor(s / n) + (s % n)) % 2 ? "dark" : ""}${queensSet.has(s) ? " queen" : free.has(s) ? " free" : ""}" data-s="${s}" aria-label="${t("ligne", "row")} ${Math.floor(s / n) + 1}, ${t("colonne", "column")} ${(s % n) + 1}${queensSet.has(s) ? `, ${t("dame", "queen")}` : free.has(s) ? `, ${t("libre", "free")}` : ""}">${queensSet.has(s) ? "♛" : ""}</button>`).join("");
    if (queensSet.size === k) record = Math.max(record, free.size);
    read.innerHTML = `${t("Dames posées", "Queens placed")} : <strong>${queensSet.size}</strong> / ${k} · ${t("Cases libres", "Free squares")} : <strong>${free.size}</strong>${record ? ` · ${t("Ton meilleur", "Your best")} : <strong>${record}</strong>` : ""}${peeked ? ` · ${t("Maximum possible", "Largest possible")} : <strong>${best}</strong>` : ""}${queensSet.size === k && free.size === best ? ` — ${t("c’est le maximum !", "that is the maximum!")}` : ""}`;
  }
  board.addEventListener("click", (e) => { const b = e.target.closest(".qn-cell"); if (!b) return; const s = Number(b.dataset.s); if (queensSet.has(s)) queensSet.delete(s); else if (queensSet.size < k) queensSet.add(s); draw(); board.querySelector(`[data-s="${s}"]`)?.focus(); });
  root.querySelector("#qn-clear").addEventListener("click", () => { queensSet.clear(); draw(); });
  draw();
  return onHintAction("queens", { peek: () => { const s = example.find((x) => !queensSet.has(x)); if (s !== undefined && queensSet.size < k) { queensSet.add(s); draw(); } } });
}
