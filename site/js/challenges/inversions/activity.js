// Hands-on activity of the inversions challenge: the learner tries, fails and notices; it never states the answer or the method.
import { colour, goalLine } from "../common/kit.js";
import { PRESS, installCartoon, pop } from "../common/cartoon.js";
import { permOf, inversions } from "./maths.js";
import { mountBuddy } from "../common/buddy.js";

/* ------------------------------------------------------------ inversions */
export function activity(root, { t, q, reduced }) {
  installCartoon();
  const p0 = permOf(q.n, q.seed), N = q.n;
  let row, swaps;
  const reset = () => { row = [...p0]; swaps = 0; };
  root.innerHTML = `
    ${goalLine(t, `Trie la rangée en échangeant des voisines.`, `Sort the row by swapping neighbours.`, "Touche une personne pour la faire échanger sa place avec sa voisine de droite, si elle est plus grande.", "Tap a person to swap places with the neighbour on the right, if taller.")}
    <div class="iv-row" id="iv-row" role="group" aria-label="${t("Rangée de personnes", "Row of people")}"></div>
    <div class="act-controls"><button class="btn btn-secondary ${PRESS}" id="iv-one" type="button">${t("Un échange au hasard", "One random swap")}</button><button class="btn-quiet ${PRESS}" id="iv-reset" type="button">${t("Recommencer", "Restart")}</button></div>
    <p class="act-readout" id="iv-read" role="status" aria-live="polite"></p>`;
  // each person in the row has a face at the top of the bar (decorative)
  const FACE = `<svg viewBox="0 0 20 14" width="20" height="14" aria-hidden="true" style="display:block;margin:2px auto 0;pointer-events:none"><circle cx="6" cy="5" r="2.6" fill="#fff" stroke="currentColor" stroke-width=".8"/><circle cx="14" cy="5" r="2.6" fill="#fff" stroke="currentColor" stroke-width=".8"/><circle cx="6.4" cy="5.4" r="1.2" fill="#1d1d1d"/><circle cx="14.4" cy="5.4" r="1.2" fill="#1d1d1d"/><path d="M7 10 q3 2.6 6 0" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>`;
  const rowEl = root.querySelector("#iv-row"), read = root.querySelector("#iv-read");
  function draw(msg = "") {
    rowEl.innerHTML = row.map((h, i) => `<button type="button" class="iv-bar ${PRESS}" data-i="${i}" style="height:${28 + (h / N) * 120}px;background:color-mix(in srgb, ${colour(h - 1)} 55%, var(--surface))" aria-label="${t("taille", "height")} ${h}">${FACE}${h}</button>`).join("");
    const inv = inversions(row);
    root.querySelector("#iv-one").disabled = inv === 0;
    read.innerHTML = msg || `${t("Échanges faits", "Swaps made")} : <strong>${swaps}</strong>${inv === 0 ? ` · ${t(`rangée triée en ${swaps} échanges.`, `row sorted in ${swaps} swaps.`)}` : ""}`;
  }
  const swap = (i) => { [row[i], row[i + 1]] = [row[i + 1], row[i]]; swaps++; };
  rowEl.addEventListener("click", (e) => { const b = e.target.closest(".iv-bar"); if (!b) return; const i = Number(b.dataset.i); if (i + 1 < N && row[i] > row[i + 1]) { swap(i); draw(); } else draw(t("Pas d’échange : cette personne n’est pas plus grande que sa voisine de droite.", "No swap: this person is not taller than the neighbour on the right.")); });
  root.querySelector("#iv-one").addEventListener("click", () => { const c = row.map((_, i) => i).filter((i) => i + 1 < N && row[i] > row[i + 1]); if (c.length) { swap(c[Math.floor(Math.random() * c.length)]); draw(); } });
  root.querySelector("#iv-reset").addEventListener("click", () => { reset(); draw(); });
  // The bars are rebuilt on every draw: pop the fresh twin of the pressed button once the handlers above have redrawn.
  root.addEventListener("click", (e) => { const b = e.target.closest?.("button"); if (!b) return; const nb = b.id ? root.querySelector(`#${b.id}`) : root.querySelector(`.iv-bar[data-i="${b.dataset.i}"]`); if (nb && !nb.disabled) pop(nb, reduced); });
  reset(); draw();
  const buddy = mountBuddy(root, { t, reduced: reduced, cast: [{ kind: "person", look: 1 }, { kind: "person", look: 3 }], backdrop: "park" });
  const offActivity = () => {};
  return () => { if (typeof offActivity === "function") offActivity(); buddy.destroy(); };
}
