// Hands-on activity of the lighteggs challenge: the learner tries, fails and notices; it never states the answer or the method.
import { svgEl } from "../common/kit.js";
import { makeEgg } from "../common/scene-props.js";
import { eggWeighings } from "./maths.js";

/* ------------------------------------------------------------ light egg */
export function activity(root, { t, q }) {
  const N = q.n, K = eggWeighings(N);
  let light, state, used, mode, over;   // state: 0 aside, 1 left pan, 2 right pan, 3 set aside (cleared)
  const fresh = () => { light = Math.floor(Math.random() * N); state = Array(N).fill(0); used = 0; mode = "weigh"; over = false; };
  root.innerHTML = `
    <p class="act-help">${t("Touche un œuf pour le changer de place : à côté, plateau de gauche, plateau de droite, ou écarté (hors de cause). Pèse, puis désigne l’œuf abîmé, plus léger que les autres.", "Tap an egg to move it: aside, left pan, right pan, or cleared (ruled out). Weigh, then name the spoiled egg, which is lighter than the others.")}</p>
    <svg class="act-svg" id="eg-scale" style="max-width:360px" viewBox="0 0 360 120" role="img" aria-label="${t("Balance", "Balance")}"></svg>
    <div class="cl-grid cl-eggs" id="eg-grid" role="group" aria-label="${t("Les œufs", "The eggs")}"></div>
    <div class="act-buttons" style="margin-top:10px"><button class="btn btn-primary" id="eg-weigh" type="button">${t("Peser", "Weigh")}</button><button class="btn btn-secondary" id="eg-name" type="button" aria-pressed="false">${t("Désigner l’œuf abîmé", "Name the spoiled egg")}</button><button class="btn-quiet" id="eg-new" type="button">${t("Nouvelle partie", "New game")}</button></div>
    <p class="act-readout" id="eg-read" role="status" aria-live="polite"></p>`;
  const grid = root.querySelector("#eg-grid"), scale = root.querySelector("#eg-scale"), read = root.querySelector("#eg-read");
  grid.innerHTML = Array.from({ length: N }, (_, i) => `<button type="button" class="cl-tok cl-egg" data-i="${i}"><svg class="eg-ic" viewBox="-17 -44 34 48" width="30" height="42" aria-hidden="true"></svg><span>${i + 1}</span></button>`).join("");
  // the eggs of the worked solution: a ruled-out egg smiles
  const eggIcons = [...grid.querySelectorAll(".eg-ic")].map((svg) => makeEgg(svg));
  let tilt = 0;
  function drawScale() {
    scale.replaceChildren();
    const a = tilt * 12, lx = 90, rx = 270, ly = 70 - a, ry = 70 + a;   // tilt > 0 : right pan lower (right heavier)
    svgEl("line", { x1: 180, y1: 105, x2: 180, y2: 40, stroke: "var(--ink)", "stroke-width": 5 }, scale);
    svgEl("line", { x1: lx, y1: ly - 20, x2: rx, y2: ry - 20, stroke: "var(--ink)", "stroke-width": 5, "stroke-linecap": "round" }, scale);
    for (const [x, y, n] of [[lx, ly, state.filter((s) => s === 1).length], [rx, ry, state.filter((s) => s === 2).length]]) { svgEl("path", { d: `M${x - 40} ${y - 20} Q${x} ${y + 20} ${x + 40} ${y - 20}Z`, fill: "var(--surface)", stroke: "var(--ink)", "stroke-width": 2 }, scale); const tx = svgEl("text", { x, y: y - 2, "text-anchor": "middle", style: "font:700 15px var(--body);fill:var(--ink)" }, scale); tx.textContent = n; }
  }
  function draw(msg = "") {
    grid.querySelectorAll(".cl-egg").forEach((b) => { const s = state[Number(b.dataset.i)]; b.dataset.s = s; eggIcons[Number(b.dataset.i)].set({ x: 0, y: 0, face: s === 3 ? "happy" : "ok" }); b.setAttribute("aria-label", `${t("Œuf", "Egg")} ${Number(b.dataset.i) + 1}: ${[t("à côté", "aside"), t("plateau gauche", "left pan"), t("plateau droit", "right pan"), t("écarté", "cleared")][s]}`); });
    drawScale();
    root.querySelector("#eg-name").setAttribute("aria-pressed", String(mode === "name"));
    root.querySelector("#eg-weigh").disabled = over || mode === "name" || state.filter((s) => s === 1).length === 0 || state.filter((s) => s === 1).length !== state.filter((s) => s === 2).length;
    read.innerHTML = msg || (mode === "name" ? t("Touche l’œuf que tu désignes.", "Tap the egg you name.") : `${t("Pesées", "Weighings")} : <strong>${used}</strong> ${t("(il faut deux plateaux avec autant d’œufs)", "(both pans need the same number of eggs)")}`);
  }
  grid.addEventListener("click", (e) => {
    const b = e.target.closest(".cl-egg"); if (!b || over) return; const i = Number(b.dataset.i);
    if (mode === "name") { over = true; mode = "weigh"; const ok = i === light; draw(ok ? `<strong>${t("Exact !", "Correct!")}</strong> ${t(`Tu l’as trouvé en ${used} pesée${used > 1 ? "s" : ""}.`, `You found it in ${used} weighing${used > 1 ? "s" : ""}.`)} ${used <= K ? t(`C’est le minimum (${K}) : bravo.`, `That is the minimum (${K}): well done.`) : t(`Il est possible de le faire en ${K}.`, `It can be done in ${K}.`)}` : `${t("Non : l’œuf abîmé était le numéro", "No: the spoiled egg was number")} <strong>${light + 1}</strong>.`); return; }
    state[i] = (state[i] + 1) % 4; tilt = 0; draw();
  });
  root.querySelector("#eg-weigh").addEventListener("click", () => {
    used++; const L = state.map((s, i) => (s === 1 ? i : -1)).filter((i) => i >= 0), R = state.map((s, i) => (s === 2 ? i : -1)).filter((i) => i >= 0);
    tilt = L.includes(light) ? -1 : R.includes(light) ? 1 : 0;   // the lighter side rises
    draw(tilt === 0 ? t("Les plateaux sont en équilibre.", "The pans balance.") : tilt < 0 ? t("Le plateau de gauche est plus léger.", "The left pan is lighter.") : t("Le plateau de droite est plus léger.", "The right pan is lighter."));
  });
  root.querySelector("#eg-name").addEventListener("click", () => { if (!over) { mode = mode === "name" ? "weigh" : "name"; draw(); } });
  root.querySelector("#eg-new").addEventListener("click", () => { fresh(); tilt = 0; draw(); });
  fresh(); draw();
  return () => {};
}
