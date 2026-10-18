// Hands-on activity of the horses challenge: the learner tries, fails and notices; it never states the answer or the method.
import { clamp } from "../common/kit.js";
import { horseRaces } from "./maths.js";

export const shuffled = (n) => { const a = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ---------------------------------------------------------------- horses */
export function activity(root, { t, q }) {
  const TOP = Number(q.top), NAMES = "ABCDEFGHIJKLMNOPQRSTUVWXY".split("");
  let speed, sel, log, podium, mode;
  const fresh = () => { const p = shuffled(25); speed = (h) => p[h]; sel = new Set(); log = []; podium = []; mode = "race"; };
  root.innerHTML = `
    <p class="act-help">${t(`Choisis de 2 à 5 chevaux et fais-les courir : tu vois seulement l’ordre d’arrivée, jamais les temps. Quand tu sais, propose ${TOP === 3 ? "le podium" : "le plus rapide"}. Glisse les chevaux pour les ranger comme tu veux sur le terrain (flèches du clavier aussi).`, `Pick 2 to 5 horses and race them: you only see the finishing order, never times. When you know, propose ${TOP === 3 ? "the podium" : "the fastest"}. Drag the horses to arrange them however you like on the field (arrow keys work too).`)}</p>
    <div class="cl-arena" id="hs-grid" role="group" aria-label="${t("Les 25 chevaux", "The 25 horses")}"></div>
    <div class="act-buttons" style="margin-top:10px">
      <button class="btn btn-primary" id="hs-race" type="button">${t("Faire courir", "Race them")}</button>
      <button class="btn btn-secondary" id="hs-podium" type="button" aria-pressed="false">${TOP === 3 ? t("Proposer le podium", "Propose the podium") : t("Proposer le plus rapide", "Propose the fastest")}</button>
      <button class="btn-quiet" id="hs-clear" type="button">${t("Désélectionner", "Deselect")}</button>
      <button class="btn-quiet" id="hs-home" type="button">${t("Replacer en grille", "Back to a grid")}</button>
      <button class="btn-quiet" id="hs-new" type="button">${t("Nouveaux chevaux", "New horses")}</button>
    </div>
    <p class="act-readout" id="hs-read" role="status" aria-live="polite"></p>
    <ol class="cl-log" id="hs-log" aria-label="${t("Historique des courses", "Race history")}"></ol>`;
  const grid = root.querySelector("#hs-grid"), read = root.querySelector("#hs-read"), logEl = root.querySelector("#hs-log");
  grid.innerHTML = NAMES.map((nm, i) => `<button type="button" class="cl-tok" data-h="${i}" aria-pressed="false">${nm}</button>`).join("");
  // The field is a free board of COLS x ROWS cells: horses can be dragged (or moved with the arrow keys) to any free
  // cell, so the learner can group them the way the plan of the races needs. Positions never affect the speeds.
  const COLS = 8, ROWS = 7;
  let pos = [], drag = null, suppressClick = false;
  const home = () => { pos = NAMES.map((_, i) => [i % 5, Math.floor(i / 5)]); };
  const place = (b) => { const [c, r] = pos[Number(b.dataset.h)]; b.style.setProperty("--c", c); b.style.setProperty("--r", r); b.style.left = b.style.top = ""; };
  const placeAll = () => grid.querySelectorAll(".cl-tok").forEach(place);
  const freeNear = (c, r, h) => {
    const taken = new Set(pos.filter((_, i) => i !== h).map((p) => `${p[0]},${p[1]}`));
    let best = [c, r], bd = Infinity;
    for (let cc = 0; cc < COLS; cc++) for (let rr = 0; rr < ROWS; rr++) if (!taken.has(`${cc},${rr}`)) { const d = (cc - c) ** 2 + (rr - r) ** 2; if (d < bd) { bd = d; best = [cc, rr]; } }
    return best;
  };
  home(); placeAll();
  grid.addEventListener("pointerdown", (e) => {
    const b = e.target.closest(".cl-tok");
    if (!b || e.button > 0) return;
    drag = { b, h: Number(b.dataset.h), x: e.clientX, y: e.clientY, moved: false, rect: grid.getBoundingClientRect() };
    b.setPointerCapture(e.pointerId);
  });
  grid.addEventListener("pointermove", (e) => {
    if (!drag) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6) { drag.moved = true; drag.b.classList.add("dragging"); }
    if (!drag.moved) return;
    const { rect } = drag, cw = rect.width / COLS, ch = rect.height / ROWS;
    drag.b.style.left = `${clamp(e.clientX - rect.left - cw / 2, 0, rect.width - cw)}px`;
    drag.b.style.top = `${clamp(e.clientY - rect.top - ch / 2, 0, rect.height - ch)}px`;
  });
  const drop = (e) => {
    if (!drag) return;
    const { b, h, rect, moved } = drag; drag = null;
    if (!moved) return;
    const c = clamp(Math.floor(((e.clientX - rect.left) / rect.width) * COLS), 0, COLS - 1), r = clamp(Math.floor(((e.clientY - rect.top) / rect.height) * ROWS), 0, ROWS - 1);
    pos[h] = freeNear(c, r, h); b.classList.remove("dragging"); place(b);
    suppressClick = true; setTimeout(() => { suppressClick = false; }, 0);   // the click that follows a drag must not select the horse
  };
  grid.addEventListener("pointerup", drop);
  grid.addEventListener("pointercancel", drop);
  grid.addEventListener("keydown", (e) => {
    const b = e.target.closest(".cl-tok"), d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!b || !d) return;
    e.preventDefault();
    const h = Number(b.dataset.h), c = clamp(pos[h][0] + d[0], 0, COLS - 1), r = clamp(pos[h][1] + d[1], 0, ROWS - 1);
    if (!pos.some((p, i) => i !== h && p[0] === c && p[1] === r)) { pos[h] = [c, r]; place(b); }
  });
  root.querySelector("#hs-home").addEventListener("click", () => { home(); placeAll(); });
  function render(msg = "") {
    grid.querySelectorAll(".cl-tok").forEach((b) => { const h = Number(b.dataset.h), k = podium.indexOf(h); b.setAttribute("aria-pressed", String(mode === "race" ? sel.has(h) : k >= 0)); b.dataset.rank = mode === "podium" && k >= 0 ? k + 1 : ""; });
    root.querySelector("#hs-race").disabled = mode !== "race" || sel.size < 2 || sel.size > 5;
    root.querySelector("#hs-podium").setAttribute("aria-pressed", String(mode === "podium"));
    logEl.innerHTML = log.map((l) => `<li>${t("Course", "Race")} ${l.n} : ${l.order.map((h) => NAMES[h]).join(" › ")}</li>`).join("");
    read.innerHTML = msg || (mode === "podium" ? t(`Touche ${TOP === 3 ? "dans l’ordre le 1er, le 2e puis le 3e" : "le cheval le plus rapide"}.`, `Tap ${TOP === 3 ? "the 1st, then the 2nd, then the 3rd in order" : "the fastest horse"}.`) : `${t("Chevaux choisis", "Horses picked")} : <strong>${sel.size}</strong> ${t("sur 5 au plus", "of 5 at most")} · ${t("Courses courues", "Races run")} : <strong>${log.length}</strong>`);
  }
  grid.addEventListener("click", (e) => {
    const b = e.target.closest(".cl-tok"); if (!b) return;
    if (suppressClick) { suppressClick = false; return; }
    const h = Number(b.dataset.h);
    if (mode === "race") { if (sel.has(h)) sel.delete(h); else if (sel.size < 5) sel.add(h); render(); return; }
    if (podium.includes(h) || podium.length >= TOP) return;
    podium.push(h);
    if (podium.length === TOP) {
      const truth = [...Array(25).keys()].sort((a, b2) => speed(b2) - speed(a)).slice(0, TOP), ok = podium.every((x, i) => x === truth[i]), best = horseRaces(TOP);
      render(ok ? `${t("Exact !", "Correct!")} ${t(`Tu l’as trouvé en ${log.length} course${log.length > 1 ? "s" : ""}.`, `You found it in ${log.length} race${log.length > 1 ? "s" : ""}.`)} ${log.length <= best ? t(`C’est le minimum (${best}) : bravo.`, `That is the minimum (${best}): well done.`) : t(`Il est possible de le faire en ${best}.`, `It can be done in ${best}.`)}` : `${t("Pas tout à fait. Le bon classement était", "Not quite. The right order was")} <strong>${truth.map((x) => NAMES[x]).join(" › ")}</strong>. ${t("Appuie sur « Nouveaux chevaux » pour réessayer.", "Press “New horses” to try again.")}`);
      return;
    }
    render();
  });
  root.querySelector("#hs-race").addEventListener("click", () => { const hs = [...sel], order = hs.sort((a, b) => speed(b) - speed(a)); log.push({ n: log.length + 1, order }); sel = new Set(); render(); });
  root.querySelector("#hs-podium").addEventListener("click", () => { mode = mode === "race" ? "podium" : "race"; podium = []; render(); });
  root.querySelector("#hs-clear").addEventListener("click", () => { sel = new Set(); podium = []; render(); });
  root.querySelector("#hs-new").addEventListener("click", () => { fresh(); render(); });
  fresh(); render();
  return () => {};
}
