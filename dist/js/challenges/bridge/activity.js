// Hands-on activity of the bridge challenge: the learner tries, fails and notices; it never states the answer or the method.
import { bridgeTimes, bridgeBest, bridgePlans } from "./maths.js";
import { makeSoldier } from "../common/scene-kit.js";

/* ---------------------------------------------------------------- bridge */
// Looks of the four soldiers (the same as in the animated solution), fastest first.
export const SOLDIERS = [{ uniform: "#3b82f6", size: 0.86 * 1.1, skin: "#f1c27d" }, { uniform: "#e8710a", size: 0.94 * 1.1, skin: "#e0ac69" }, { uniform: "#2fa866", size: 1.1, skin: "#f5d0a9" }, { uniform: "#c2185b", size: 1.1 * 1.1, skin: "#d8a47f", moustache: true, top: 80 }];

export function activity(root, { t, q }) {
  const times = bridgeTimes(q.set).sort((a, b) => a - b), best = bridgeBest(times), NAMES = ["A", "B", "C", "D"];
  let side, torch, elapsed, hist, sel;
  const reset = () => { side = [0, 0, 0, 0]; torch = 0; elapsed = 0; hist = []; sel = new Set(); };
  root.innerHTML = `
    <p class="act-help">${t("Choisis une ou deux personnes du côté de la lampe, puis fais-les traverser : le temps compté est celui du plus lent.", "Pick one or two people on the lamp's side, then send them across: the time counted is the slower one's.")}</p>
    <div class="br-scene"><div class="br-bank" id="br-left"></div><div class="br-river" aria-hidden="true">≈ ≈ ≈</div><div class="br-bank" id="br-right"></div></div>
    <div class="act-buttons"><button class="btn btn-primary" id="br-go" type="button">${t("Faire traverser", "Send across")}</button><button class="btn-quiet" id="br-undo" type="button">${t("Annuler", "Undo")}</button><button class="btn-quiet" id="br-reset" type="button">${t("Recommencer", "Restart")}</button></div>
    <p class="act-readout" id="br-read" role="status" aria-live="polite"></p>
    <ol class="cl-log" id="br-log" aria-label="${t("Traversées", "Crossings")}"></ol>`;
  const read = root.querySelector("#br-read"), logEl = root.querySelector("#br-log");
  function draw(msg = "") {
    for (const [id, s] of [["#br-left", 0], ["#br-right", 1]]) root.querySelector(id).innerHTML = `<span class="br-lamp ${torch === s ? "on" : ""}" aria-label="${torch === s ? t("lampe ici", "lamp here") : ""}">${torch === s ? "🔦" : ""}</span>${times.map((tm, i) => side[i] === s ? `<button type="button" class="cl-tok br-man" data-i="${i}" aria-pressed="${sel.has(i)}" ${torch === s ? "" : "disabled"}><svg class="br-sd" viewBox="-22 -84 44 90" width="38" height="78" aria-hidden="true"></svg>${NAMES[i]}<small>${tm} min</small></button>` : "").join("")}`;
    // each person is the soldier of the worked solution: same look, slower people are bigger and wear different colours
    root.querySelectorAll(".br-man").forEach((b) => { const k = Number(b.dataset.i), look = SOLDIERS[k % 4]; makeSoldier(b.querySelector(".br-sd"), { ...look, label: "" }).set({ x: 0, y: 4, dir: 1, amp: 0 }); });
    root.querySelector("#br-go").disabled = sel.size < 1 || sel.size > 2;
    root.querySelector("#br-undo").disabled = !hist.length;
    logEl.innerHTML = hist.map((h) => `<li>${h.who.map((i) => NAMES[i]).join(" + ")} ${h.dir === "over" ? "→" : "←"} (${h.cost} min)</li>`).join("");
    const done = side.every((s) => s === 1);
    read.innerHTML = msg || `${t("Temps écoulé", "Time elapsed")} : <strong>${elapsed} min</strong>${done ? ` · ${t("Tout le monde a traversé. Peux-tu faire mieux ?", "Everyone is across. Can you do better?")}` : ""}`;
  }
  root.addEventListener("click", (e) => {
    const m = e.target.closest(".br-man"); if (m) { const i = Number(m.dataset.i); if (sel.has(i)) sel.delete(i); else if (sel.size < 2) sel.add(i); draw(); return; }
  });
  root.querySelector("#br-go").addEventListener("click", () => { const who = [...sel], cost = Math.max(...who.map((i) => times[i])), dir = torch === 0 ? "over" : "back"; who.forEach((i) => { side[i] = 1 - side[i]; }); torch = 1 - torch; elapsed += cost; hist.push({ who, dir, cost }); sel = new Set(); draw(); });
  root.querySelector("#br-undo").addEventListener("click", () => { const h = hist.pop(); if (!h) return; h.who.forEach((i) => { side[i] = 1 - side[i]; }); torch = 1 - torch; elapsed -= h.cost; sel = new Set(); draw(); });
  root.querySelector("#br-reset").addEventListener("click", () => { reset(); draw(); });
  void bridgePlans;
  reset(); draw();
  return () => {};
}
