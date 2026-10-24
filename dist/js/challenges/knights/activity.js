import { svgEl, onHintAction, lockTouch } from "../common/kit.js";
import { knightMoves, validTour, searchTour } from "./maths.js";
export function activity(root, { t, q }) {
  const n = q.n; let path = [], legal = false, timer = 0, generation = 0, focus = 0, drag = null, suppressClick = false;
  root.innerHTML = `<p class="act-help">${t("Touche une case pour commencer, puis joue les coups du cavalier. Flèches : choisir une case ; Entrée ou Espace : jouer. Glisser le cavalier vers une case fonctionne aussi.", "Tap a square to begin, then make knight moves. Arrows: choose a square; Enter or Space: move. You may also drag the knight to a square.")}</p><svg class="act-svg" viewBox="0 0 ${n * 44} ${n * 44}" role="group" aria-label="${t("Échiquier du cavalier", "Knight board")}"></svg><div class="act-controls"><button type="button" data-action="undo">${t("Annuler", "Undo")}</button><button type="button" data-action="reset">${t("Recommencer", "Restart")}</button><label>${t("But", "Goal")} <select data-goal><option value="open">${t("Ouvert", "Open")}</option><option value="closed">${t("Fermé", "Closed")}</option></select></label></div><div class="act-controls" data-search hidden><label>${t("Ordre de recherche", "Search order")} <select data-order><option value="warnsdorff">Warnsdorff</option><option value="fixed">${t("Ordre fixe", "Fixed order")}</option></select></label><button type="button" data-action="search">${t("Chercher depuis ce parcours", "Search from this path")}</button><button type="button" data-action="cancel">${t("Arrêter", "Cancel")}</button></div><p class="act-readout" role="status" aria-live="polite"></p>`;
  const board = root.querySelector("svg"), read = root.querySelector("[role=status]"), goal = root.querySelector("[data-goal]"), cells = [];
  lockTouch(board, '[data-cell][aria-pressed="true"]');
  for (let v = 0; v < n * n; v++) {
    const x = v % n * 44, y = Math.floor(v / n) * 44, g = svgEl("g", { "data-cell": v, tabindex: v ? -1 : 0, role: "button", class: "toy-handle" }, board);
    svgEl("rect", { x, y, width: 44, height: 44, fill: (v % n + Math.floor(v / n)) % 2 ? "var(--sunken)" : "var(--surface)", stroke: "var(--line-strong)" }, g);
    const ring = svgEl("rect", { x: x + 3, y: y + 3, width: 38, height: 38, fill: "none", stroke: "var(--accent)", "stroke-width": 3, visibility: "hidden" }, g);
    const text = svgEl("text", { x: x + 22, y: y + 28, "text-anchor": "middle", fill: "var(--ink)", "font-size": 17, "pointer-events": "none" }, g); cells.push({ g, ring, text });
  }
  function cancel() { generation++; clearTimeout(timer); timer = 0; drag = null; }
  function draw(message = "") {
    const moves = path.length ? knightMoves(path.at(-1), n).filter((v) => !path.includes(v)) : [];
    cells.forEach(({ g, ring, text }, v) => { const i = path.indexOf(v); text.textContent = i < 0 ? "" : v === path.at(-1) ? "♞" : String(i + 1); ring.setAttribute("visibility", legal && moves.includes(v) ? "visible" : "hidden"); g.setAttribute("aria-label", `${v % n + 1}, ${Math.floor(v / n) + 1}: ${i < 0 ? t("libre", "free") : `${t("visite", "visit")} ${i + 1}`}`); g.setAttribute("aria-pressed", String(v === path.at(-1))); });
    const done = validTour(path, n, n, goal.value === "closed");
    read.textContent = message || `${t("Cases visitées", "Visited squares")}: ${path.length}/${n * n}${done ? ` · ${t("Parcours complet !", "Complete tour!")}` : ""}`;
    root.querySelector('[data-action="undo"]').disabled = !path.length;
  }
  function play(v) { cancel(); if (!path.length || (!path.includes(v) && knightMoves(path.at(-1), n).includes(v))) { path.push(v); draw(); } else draw(t("Ce coup est interdit ou cette case est déjà visitée.", "That move is illegal or the square has already been visited.")); }
  board.addEventListener("click", (e) => { if (suppressClick) { suppressClick = false; return; } const g = e.target.closest("[data-cell]"); if (g) play(Number(g.dataset.cell)); });
  board.addEventListener("keydown", (e) => { const g = e.target.closest("[data-cell]"); if (!g) return; focus = Number(g.dataset.cell); const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -n, ArrowDown: n }; if (e.key in offsets) { e.preventDefault(); const next = focus + offsets[e.key]; if (next >= 0 && next < n * n && (Math.abs(offsets[e.key]) !== 1 || Math.floor(next / n) === Math.floor(focus / n))) { cells[focus].g.tabIndex = -1; focus = next; cells[focus].g.tabIndex = 0; cells[focus].g.focus(); } } else if (["Enter", " "].includes(e.key)) { e.preventDefault(); play(focus); } });
  board.addEventListener("pointerdown", (e) => { drag = null; suppressClick = false; const g = e.target.closest("[data-cell]"); if (path.length && Number(g?.dataset.cell) === path.at(-1)) { drag = { x: e.clientX, y: e.clientY }; } });
  board.addEventListener("pointerup", (e) => { if (!drag) return; const moved = Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8; drag = null; if (moved) { const g = e.target.closest("[data-cell]"); if (g) { play(Number(g.dataset.cell)); suppressClick = true; } } });
  board.addEventListener("pointercancel", () => { drag = null; });
  root.querySelector('[data-action="undo"]').onclick = () => { cancel(); path.pop(); draw(); };
  root.querySelector('[data-action="reset"]').onclick = () => { cancel(); path = []; draw(); };
  root.querySelector('[data-action="cancel"]').onclick = () => { cancel(); draw(t("Recherche arrêtée.", "Search cancelled.")); };
  goal.onchange = () => { cancel(); draw(); };
  root.querySelector('[data-action="search"]').onclick = () => {
    cancel(); const run = generation, search = searchTour(n, n, { prefix: path.length ? path : [0], closed: goal.value === "closed", order: root.querySelector("[data-order]").value });
    function tick() { if (run !== generation) return; const result = search.next(), r = result.value; if (!result.done) { draw(`${t("Recherche", "Searching")}: ${r.nodes}`); timer = setTimeout(tick, 0); return; } timer = 0; if (r.status === "found") { path = r.path; draw(); } else draw(r.status === "limit" ? t("Limite atteinte : existence indéterminée.", "Limit reached: existence remains undetermined.") : t("Aucun prolongement pour ce départ et ce but.", "No completion for this start and goal.")); }
    tick();
  };
  const off = onHintAction("knights", { legal: () => { legal = !legal; draw(); }, search: () => { root.querySelector("[data-search]").hidden = false; } }); draw();
  return () => { cancel(); off(); };
}
