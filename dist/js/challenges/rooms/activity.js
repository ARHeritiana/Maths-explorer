import { svgEl, onHintAction } from "../common/kit.js";
import { ROOM_NAMES, eulerCriteria } from "./maths.js";
import { edgesFor } from "./index.js";
export function activity(root, { t, q }) {
  let edges = edgesFor(q).map((e) => e.slice()), walk = [], start = null, current = null, level = 0, selected = null;
  const pos = [[110, 65], [330, 65], [65, 205], [220, 205], [375, 205], [220, 330]];
  root.innerHTML = `<p class="act-help">${t("Choisis ton lieu de départ, puis touche les portes pour les traverser. En mode édition, touche deux lieux pour ajouter une porte, ou une porte pour la retirer. Entrée et Espace fonctionnent aussi.", "Choose a starting place, then tap doors to cross them. In edit mode, tap two places to add a door, or a door to remove it. Enter and Space work too.")}</p><label>${t("Mode", "Mode")} <select data-mode><option value="walk">${t("Marcher", "Walk")}</option><option value="edit">${t("Éditer les portes", "Edit doors")}</option></select></label><svg class="act-svg" viewBox="0 0 440 390" role="group" aria-label="${t("Pièces et portes", "Rooms and doors")}"></svg><div class="act-controls"><button type="button" data-undo>${t("Annuler un passage", "Undo crossing")}</button><button type="button" data-restart>${t("Recommencer le parcours", "Restart trail")}</button><button type="button" data-plan>${t("Restaurer le plan", "Restore plan")}</button></div><p class="act-readout" role="status" aria-live="polite"></p><p class="muted">${t("O est l’extérieur. Ce graphe est l’adaptation d’un plan à cinq pièces ; la longueur et la courbure des traits n’affectent pas le problème.", "O is the outside. This graph adapts a five-room plan; edge lengths and curves do not affect the problem.")}</p>`;
  const board = root.querySelector("svg"), mode = root.querySelector("select"), read = root.querySelector("[role=status]");
  function reset() { walk = []; current = start = null; selected = null; }
  function draw(message = "") {
    const active = document.activeElement?.getAttribute("data-room") ?? null, activeDoor = document.activeElement?.getAttribute("data-door") ?? null;
    board.replaceChildren(); const used = new Set(walk.map((w) => w.edge)), c = eulerCriteria(edges);
    edges.forEach(([a, b], i) => {
      const same = edges.map((e, j) => (e[0] === a && e[1] === b || e[0] === b && e[1] === a) ? j : -1).filter((j) => j >= 0), bend = (same.indexOf(i) - (same.length - 1) / 2) * 55;
      const [x1, y1] = pos[a], [x2, y2] = pos[b], dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), cx = (x1 + x2) / 2 - dy / len * bend, cy = (y1 + y2) / 2 + dx / len * bend;
      const g = svgEl("g", { "data-door": i, tabindex: 0, role: "button", "aria-label": `${t("Porte", "Door")} ${i + 1}: ${ROOM_NAMES[a]} ↔ ${ROOM_NAMES[b]}${used.has(i) ? `, ${t("utilisée", "used")}` : ""}`, class: "toy-handle" }, board);
      const d = `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`;
      svgEl("path", { d, fill: "none", stroke: "transparent", "stroke-width": 44, "vector-effect": "non-scaling-stroke" }, g);
      svgEl("path", { d, fill: "none", stroke: used.has(i) ? "var(--accent)" : "var(--ink-2)", "stroke-width": used.has(i) ? 5 : 2, "stroke-dasharray": used.has(i) ? "6 4" : "none", "pointer-events": "none" }, g);
      svgEl("text", { x: (x1 + 2 * cx + x2) / 4, y: (y1 + 2 * cy + y2) / 4 - 5, "font-size": 13, fill: "var(--ink)", "text-anchor": "middle", "pointer-events": "none" }, g).textContent = i + 1;
    });
    pos.forEach(([x, y], v) => {
      const g = svgEl("g", { "data-room": v, tabindex: 0, role: "button", class: "toy-handle", "aria-label": `${ROOM_NAMES[v]}${level ? `, ${t("degré", "degree")} ${c.degrees[v]}` : ""}`, "aria-pressed": String(current === v || selected === v) }, board);
      svgEl("circle", { cx: x, cy: y, r: 12, fill: "transparent", stroke: "transparent", "stroke-width": 44, "vector-effect": "non-scaling-stroke" }, g);
      svgEl("circle", { cx: x, cy: y, r: 23, fill: current === v || selected === v ? "var(--accent-soft)" : "var(--surface)", stroke: current === v ? "var(--accent)" : "var(--ink)", "stroke-width": 3 }, g);
      svgEl("text", { x, y: y + 6, fill: "var(--ink)", "text-anchor": "middle", "font-size": 19, "pointer-events": "none" }, g).textContent = ROOM_NAMES[v];
      if (level) svgEl("text", { x, y: y + 44, fill: "var(--ink)", "text-anchor": "middle", "font-size": 15 }, g).textContent = `${t("degré", "degree")} ${c.degrees[v]}`;
    });
    read.textContent = message || `${walk.length}/${edges.length} ${t("portes traversées", "doors crossed")}${walk.length === edges.length && edges.length ? ` · ${t("Terminé !", "Complete!")}` : ""}${level >= 2 ? ` · ${c.connected ? t("Connecté", "Connected") : t("Non connecté", "Disconnected")} ; ${c.odd.length} ${t("degrés impairs", "odd degrees")} ; ${c.trail ? t("parcours possible", "trail possible") : t("parcours impossible", "trail impossible")}` : ""}`;
    root.querySelector("[data-undo]").disabled = !walk.length;
    if (active !== null) board.querySelector(`[data-room="${active}"]`)?.focus(); else if (activeDoor !== null) board.querySelector(`[data-door="${activeDoor}"]`)?.focus();
  }
  function act(target) {
    const room = target.closest("[data-room]"), door = target.closest("[data-door]");
    if (room) { const v = Number(room.dataset.room); if (mode.value === "edit") { if (selected === null) selected = v; else { if (selected !== v && edges.length < 30) edges.push([selected, v]); selected = null; } resetWalk(); } else if (!walk.length) current = start = v; draw(); }
    else if (door) { const i = Number(door.dataset.door), [a, b] = edges[i]; if (mode.value === "edit") { edges.splice(i, 1); reset(); draw(); } else if (current === null) draw(t("Choisis d’abord un lieu de départ.", "Choose a starting place first.")); else if (walk.some((w) => w.edge === i) || a !== current && b !== current) draw(t("Cette porte est utilisée ou ne touche pas ton lieu actuel.", "This door is used or does not touch your current place.")); else { const from = current; current = a === current ? b : a; walk.push({ edge: i, from, to: current }); draw(); } }
  }
  function resetWalk() { walk = []; current = start = null; }
  board.onclick = (e) => act(e.target); board.onkeydown = (e) => { if (["Enter", " "].includes(e.key)) { e.preventDefault(); act(e.target); } };
  mode.onchange = () => { reset(); draw(); };
  root.querySelector("[data-undo]").onclick = () => { const last = walk.pop(); if (last) current = last.from; draw(); };
  root.querySelector("[data-restart]").onclick = () => { reset(); draw(); };
  root.querySelector("[data-plan]").onclick = () => { edges = edgesFor(q).map((e) => e.slice()); reset(); draw(); };
  const off = onHintAction("rooms", { counts: () => { level = Math.max(level, 1); draw(); }, degrees: () => { level = 2; draw(); } }); draw(); return off;
}
