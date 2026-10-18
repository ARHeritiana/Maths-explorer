// Hands-on activity of the cham challenge: the learner tries, fails and notices; it never states the answer or the method.
import { makeChameleon } from "./art.js";
import { chamSet, chamMin } from "./maths.js";
import { colour, onHintAction } from "../common/kit.js";

/* ------------------------------------------------------------ chameleons */
export function activity(root, { t, q }) {
  const start = chamSet(q.set), NAMES = [t("rouges", "red"), t("verts", "green"), t("bleus", "blue")], COL = [colour(3), colour(2), colour(0)];
  let s, hist, level = 0;   // 0: nothing, 1: raw differences (hint 1), 2: differences modulo 3 (hint 2)
  const reset = () => { s = [...start]; hist = []; };
  root.innerHTML = `
    <p class="act-help">${t("Choisis quelles couleurs se rencontrent : les deux prennent la troisième couleur. Peux-tu rendre tous les caméléons de la même couleur ?", "Choose which colours meet: both take the third colour. Can you make all the chameleons the same colour?")}</p>
    <div class="cm-bars" id="cm-bars" aria-hidden="true"></div>
    <div class="act-buttons" id="cm-btns" role="group" aria-label="${t("Rencontres", "Meetings")}"></div>
    <div class="act-controls"><button class="btn-quiet" id="cm-undo" type="button">${t("Annuler", "Undo")}</button><button class="btn-quiet" id="cm-reset" type="button">${t("Recommencer", "Restart")}</button></div>
    <p class="act-readout" id="cm-read" role="status" aria-live="polite"></p>`;
  const bars = root.querySelector("#cm-bars"), btns = root.querySelector("#cm-btns"), read = root.querySelector("#cm-read");
  const PAIRS = [[0, 1, 2], [0, 2, 1], [1, 2, 0]], mod = (x) => ((x % 3) + 3) % 3;
  function draw() {
    const total = s[0] + s[1] + s[2];
    bars.innerHTML = s.map((v, i) => `<div class="cm-row"><svg class="cm-ic" viewBox="-6 -28 54 36" width="46" height="31" aria-hidden="true"></svg><span class="cm-name">${NAMES[i]}</span><span class="cm-bar" style="width:${(v / total) * 100}%;background:${COL[i]}"></span><strong>${v}</strong></div>`).join("");
    bars.querySelectorAll(".cm-ic").forEach((svg, i) => makeChameleon(svg).set({ x: 20, y: 0, from: COL[i] }));   // the chameleons of the worked solution, in their colour
    btns.innerHTML = PAIRS.map(([i, j, k]) => `<button type="button" class="btn btn-secondary cm-meet" data-i="${i}" data-j="${j}" data-k="${k}" ${s[i] > 0 && s[j] > 0 ? "" : "disabled"}>${NAMES[i]} + ${NAMES[j]} → ${NAMES[k]}</button>`).join("");
    root.querySelector("#cm-undo").disabled = !hist.length;
    const single = s.filter((x) => x > 0).length === 1;
    read.innerHTML = `${t("Rencontres", "Meetings")} : <strong>${hist.length}</strong>${level === 1 ? ` · r − v = <strong>${s[0] - s[1]}</strong>, v − b = <strong>${s[1] - s[2]}</strong>, b − r = <strong>${s[2] - s[0]}</strong>` : level === 2 ? ` · r − v ≡ <strong>${mod(s[0] - s[1])}</strong>, v − b ≡ <strong>${mod(s[1] - s[2])}</strong>, b − r ≡ <strong>${mod(s[2] - s[0])}</strong> (mod 3)` : ""}${single ? ` · <strong>${t("tous de la même couleur !", "all one colour!")}</strong> ${t(`En ${hist.length} rencontres ; le minimum possible est ${chamMin(...start)}.`, `In ${hist.length} meetings; the least possible is ${chamMin(...start)}.`)}` : ""}`;
  }
  btns.addEventListener("click", (e) => { const b = e.target.closest(".cm-meet"); if (!b) return; const [i, j, k] = [b.dataset.i, b.dataset.j, b.dataset.k].map(Number); hist.push([...s]); s[i]--; s[j]--; s[k] += 2; draw(); });
  root.querySelector("#cm-undo").addEventListener("click", () => { const p = hist.pop(); if (p) { s = p; draw(); } });
  root.querySelector("#cm-reset").addEventListener("click", () => { reset(); draw(); });
  reset(); draw();
  return onHintAction("cham", { diff: () => { level = Math.max(level, 1); draw(); }, mod: () => { level = 2; draw(); } });
}
