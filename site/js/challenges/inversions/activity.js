// Hands-on activity of the inversions challenge: the learner tries, fails and notices; it never states the answer or the method.
import { onHintAction, colour } from "../common/kit.js";
import { permOf, inversions, bubbleSwaps } from "./maths.js";

/* ------------------------------------------------------------ inversions */
export function activity(root, { t, q }) {
  const p0 = permOf(q.n, q.seed), N = q.n, total = inversions(p0);
  let row, swaps, showCounter = false;
  const reset = () => { row = [...p0]; swaps = 0; };
  root.innerHTML = `
    <p class="act-help">${t("Touche une personne pour la faire échanger sa place avec sa voisine de droite, si elle est plus grande. Combien d’échanges au total ?", "Tap a person to swap places with the neighbour on the right, if taller. How many swaps in all?")}</p>
    <div class="iv-row" id="iv-row" role="group" aria-label="${t("Rangée de personnes", "Row of people")}"></div>
    <div class="act-controls"><button class="btn btn-secondary" id="iv-one" type="button">${t("Un échange au hasard", "One random swap")}</button><button class="btn btn-secondary" id="iv-all" type="button">${t("Tout trier", "Sort it all")}</button><button class="btn-quiet" id="iv-reset" type="button">${t("Recommencer", "Restart")}</button></div>
    <p class="act-readout" id="iv-read" role="status" aria-live="polite"></p>`;
  const rowEl = root.querySelector("#iv-row"), read = root.querySelector("#iv-read");
  function draw(msg = "") {
    rowEl.innerHTML = row.map((h, i) => `<button type="button" class="iv-bar" data-i="${i}" style="height:${28 + (h / N) * 120}px;background:color-mix(in srgb, ${colour(h - 1)} 55%, var(--surface))" aria-label="${t("taille", "height")} ${h}">${h}</button>`).join("");
    const inv = inversions(row);
    root.querySelector("#iv-one").disabled = inv === 0; root.querySelector("#iv-all").disabled = inv === 0;
    read.innerHTML = msg || `${t("Échanges faits", "Swaps made")} : <strong>${swaps}</strong>${showCounter ? ` · ${t("inversions restantes", "inversions left")} : <strong>${inv}</strong> · ${t("somme", "sum")} <strong>${swaps + inv}</strong>` : ""}${inv === 0 ? ` · ${t(`rangée triée en ${swaps} échanges.`, `row sorted in ${swaps} swaps.`)}` : ""}`;
  }
  const swap = (i) => { [row[i], row[i + 1]] = [row[i + 1], row[i]]; swaps++; };
  rowEl.addEventListener("click", (e) => { const b = e.target.closest(".iv-bar"); if (!b) return; const i = Number(b.dataset.i); if (i + 1 < N && row[i] > row[i + 1]) { swap(i); draw(); } else draw(t("Pas d’échange : cette personne n’est pas plus grande que sa voisine de droite.", "No swap: this person is not taller than the neighbour on the right.")); });
  root.querySelector("#iv-one").addEventListener("click", () => { const c = row.map((_, i) => i).filter((i) => i + 1 < N && row[i] > row[i + 1]); if (c.length) { swap(c[Math.floor(Math.random() * c.length)]); draw(); } });
  root.querySelector("#iv-all").addEventListener("click", () => { for (const i of bubbleSwaps(row).log) swap(i); draw(); });
  root.querySelector("#iv-reset").addEventListener("click", () => { reset(); draw(); });
  void total;
  reset(); draw();
  return onHintAction("inversions", { counter: () => { showCounter = true; draw(); } });
}
