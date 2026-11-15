// Hands-on activity of the cham challenge: the learner tries, fails and notices; it never states the answer or the method.
import { makeChameleon } from "./art.js";
import { chamSet } from "./maths.js";
import { colour, goalLine } from "../common/kit.js";
import { PRESS, installCartoon, pop } from "../common/cartoon.js";

/* ------------------------------------------------------------ chameleons */
export function activity(root, { t, q, reduced }) {
  installCartoon();
  const start = chamSet(q.set), NAMES = [t("rouges", "red"), t("verts", "green"), t("bleus", "blue")], COL = [colour(3), colour(2), colour(0)];
  let s, hist;
  const reset = () => { s = [...start]; hist = []; };
  root.innerHTML = `
    ${goalLine(t, `Rends tous les caméléons de la même couleur.`, `Make all the chameleons the same colour.`, "Choisis quelles couleurs se rencontrent : les deux prennent la troisième couleur.", "Choose which colours meet: both take the third colour.")}
    <div class="cm-bars" id="cm-bars" aria-hidden="true"></div>
    <div class="act-buttons" id="cm-btns" role="group" aria-label="${t("Rencontres", "Meetings")}"></div>
    <div class="act-controls"><button class="btn-quiet ${PRESS}" id="cm-undo" type="button">${t("Annuler", "Undo")}</button><button class="btn-quiet ${PRESS}" id="cm-reset" type="button">${t("Recommencer", "Restart")}</button></div>
    <p class="act-readout" id="cm-read" role="status" aria-live="polite"></p>`;
  const bars = root.querySelector("#cm-bars"), btns = root.querySelector("#cm-btns"), read = root.querySelector("#cm-read");
  const PAIRS = [[0, 1, 2], [0, 2, 1], [1, 2, 0]];
  function draw() {
    const total = s[0] + s[1] + s[2];
    bars.innerHTML = s.map((v, i) => `<div class="cm-row"><svg class="cm-ic" viewBox="-6 -28 54 36" width="46" height="31" aria-hidden="true"></svg><span class="cm-name">${NAMES[i]}</span><span class="cm-bar" style="width:${(v / total) * 100}%;background:${COL[i]}"></span><strong>${v}</strong></div>`).join("");
    bars.querySelectorAll(".cm-ic").forEach((svg, i) => makeChameleon(svg).set({ x: 20, y: 0, from: COL[i] }));   // the chameleons of the worked solution, in their colour
    btns.innerHTML = PAIRS.map(([i, j, k]) => `<button type="button" class="btn btn-secondary cm-meet ${PRESS}" data-i="${i}" data-j="${j}" data-k="${k}" ${s[i] > 0 && s[j] > 0 ? "" : "disabled"}>${NAMES[i]} + ${NAMES[j]} → ${NAMES[k]}</button>`).join("");
    root.querySelector("#cm-undo").disabled = !hist.length;
    const single = s.filter((x) => x > 0).length === 1;
    read.innerHTML = `${t("Rencontres", "Meetings")} : <strong>${hist.length}</strong>${single ? ` · <strong>${t("tous de la même couleur !", "all one colour!")}</strong>` : ""}`;
  }
  btns.addEventListener("click", (e) => { const b = e.target.closest(".cm-meet"); if (!b) return; const [i, j, k] = [b.dataset.i, b.dataset.j, b.dataset.k].map(Number); hist.push([...s]); s[i]--; s[j]--; s[k] += 2; draw(); });
  root.querySelector("#cm-undo").addEventListener("click", () => { const p = hist.pop(); if (p) { s = p; draw(); } });
  root.querySelector("#cm-reset").addEventListener("click", () => { reset(); draw(); });
  // The buttons are rebuilt on every draw: after the handlers above have redrawn, pop the fresh twin of the pressed button.
  root.addEventListener("click", (e) => { const b = e.target.closest?.("button"); if (!b) return; const nb = b.id ? root.querySelector(`#${b.id}`) : root.querySelector(`.cm-meet[data-i="${b.dataset.i}"][data-j="${b.dataset.j}"]`); if (nb && !nb.disabled) pop(nb, reduced); });
  reset(); draw();
  return () => {};
}
