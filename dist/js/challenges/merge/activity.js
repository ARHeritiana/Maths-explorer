// Hands-on activity of the merge challenge: the learner tries, fails and notices; it never states the answer or the method.
import { onHintAction } from "../common/kit.js";
import { mergeFinal, mergeProduct } from "./maths.js";

/* ----------------------------------------------------------------- merge */
export function activity(root, { t, q }) {
  const N = q.n;
  let nums, history, sel, showInv = false;
  const reset = () => { nums = Array.from({ length: N }, (_, i) => i + 1); history = []; sel = []; };
  root.innerHTML = `
    <p class="act-help">${t("Touche deux nombres pour les remplacer par a + b + ab.", "Tap two numbers to replace them by a + b + ab.")}</p>
    <div class="cl-grid cl-merge" id="mg-board" role="group" aria-label="${t("Nombres au tableau", "Numbers on the board")}"></div>
    <div class="act-controls"><button class="btn btn-secondary" id="mg-rand" type="button">${t("Fusion au hasard", "Random merge")}</button><button class="btn-quiet" id="mg-undo" type="button">${t("Annuler", "Undo")}</button><button class="btn-quiet" id="mg-reset" type="button">${t("Recommencer", "Restart")}</button></div>
    <p class="act-readout" id="mg-read" role="status" aria-live="polite"></p>
    <ol class="cl-log" id="mg-log" aria-label="${t("Étapes", "Steps")}"></ol>`;
  const board = root.querySelector("#mg-board"), read = root.querySelector("#mg-read"), logEl = root.querySelector("#mg-log");
  function draw() {
    board.innerHTML = nums.map((x, i) => `<button type="button" class="cl-tok" data-i="${i}" aria-pressed="${sel.includes(i)}">${x}</button>`).join("");
    logEl.innerHTML = history.map((h) => `<li>${h.a} + ${h.b} + ${h.a}×${h.b} = <strong>${h.r}</strong></li>`).join("");
    const prod = mergeProduct(nums);
    read.innerHTML = `${t("Étapes", "Steps")} : <strong>${history.length}</strong>${showInv ? ` · ${t("Produit de tous les (nombre + 1)", "Product of all the (number + 1)")} = <strong>${prod.toLocaleString(t("fr-FR", "en-US"))}</strong>` : ""}${nums.length === 1 ? ` · ${t("il reste", "left")} <strong>${nums[0]}</strong>${showInv ? `, ${t("soit", "that is")} ${prod.toLocaleString(t("fr-FR", "en-US"))} − 1` : ""}.` : ""}`;
    root.querySelector("#mg-undo").disabled = !history.length; root.querySelector("#mg-rand").disabled = nums.length < 2;
  }
  function doMerge(i, j) { const a = nums[i], b = nums[j], r = a + b + a * b; history.push({ a, b, r, nums: [...nums] }); nums = nums.filter((_, k) => k !== i && k !== j); nums.push(r); sel = []; draw(); }
  board.addEventListener("click", (e) => { const b = e.target.closest(".cl-tok"); if (!b) return; const i = Number(b.dataset.i); if (sel.includes(i)) sel = sel.filter((x) => x !== i); else sel.push(i); if (sel.length === 2) doMerge(sel[0], sel[1]); else draw(); });
  root.querySelector("#mg-rand").addEventListener("click", () => { const i = Math.floor(Math.random() * nums.length); let j; do j = Math.floor(Math.random() * nums.length); while (j === i); doMerge(i, j); });
  root.querySelector("#mg-undo").addEventListener("click", () => { const h = history.pop(); if (h) { nums = h.nums; sel = []; draw(); } });
  root.querySelector("#mg-reset").addEventListener("click", () => { reset(); draw(); });
  void mergeFinal;
  reset(); draw();
  return onHintAction("merge", { invariant: () => { showInv = true; draw(); } });
}
