const caf = (id) => globalThis.cancelAnimationFrame?.(id);
import { svgEl, onHintAction, makeCtx } from "../common/kit.js";
import { makeSoldier, easeInOut } from "../common/scene-kit.js";
import { colour } from "../common/kit.js";
import { ROOM_NAMES, eulerCriteria } from "./maths.js";
import { edgesFor } from "./index.js";
import { HOUSE, ROOM_RECTS, STAND, DOORS, doorway, standAfter, ringRoute } from "./art.js";

// Five rooms, drawn as a floor plan: tap a room to put the walker there, then tap a door he can use: he walks through it.
// Edit mode closes or reopens doors. The plan is the puzzle; the graph is not shown here (the solution reveals it).
export function activity(root, { t, q, reduced }) {
  const doors = (q.layout === "closed-door" ? DOORS.slice(1) : DOORS), edges = edgesFor(q), calm = () => (typeof reduced === "function" ? reduced() : !!reduced);
  const state = { closed: new Set(), walk: [], at: null, stand: STAND[5] }; let level = 0, raf = 0, moving = false, msg = "";
  root.innerHTML = `<p class="act-help">${t("Voici le plan d’une maison : cinq pièces A à E et l’extérieur O. Touche une pièce (ou l’extérieur) pour y poser le promeneur, puis une porte : il la traverse. Passe une fois par chaque porte. En mode « fermer des portes », touche une porte pour la fermer ou la rouvrir.", "Here is the plan of a house: five rooms A to E and the outside O. Tap a room (or the outside) to put the walker there, then a door: he walks through it. Pass through every door exactly once. In “close doors” mode, tap a door to close or reopen it.")}</p>
    <label>${t("Mode", "Mode")} <select data-mode><option value="walk">${t("Marcher", "Walk")}</option><option value="edit">${t("Fermer des portes", "Close doors")}</option></select></label>
    <svg class="act-svg" viewBox="0 0 520 350" role="group" aria-label="${t("Plan de la maison", "House plan")}"></svg>
    <div class="act-controls"><button class="btn-quiet" type="button" data-undo>${t("Annuler une porte", "Undo a door")}</button><button class="btn-quiet" type="button" data-restart>${t("Recommencer", "Start over")}</button><button class="btn-quiet" type="button" data-plan>${t("Rétablir le plan", "Restore the plan")}</button></div>
    <p class="act-readout" role="status" aria-live="polite"></p>`;
  const board = root.querySelector("svg"), mode = root.querySelector("select"), read = root.querySelector("[role=status]");
  // static plan, built once
  const grass = svgEl("rect", { x: 0, y: 0, width: 520, height: 350, fill: "var(--accent-soft)", opacity: 0.5, "data-room": 5, tabindex: 0, role: "button", "aria-label": t("Extérieur O", "Outside O"), class: "toy-handle" }, board);
  const house = svgEl("g", { transform: "translate(60 40)" }, board);
  svgEl("rect", { x: -6, y: -6, width: HOUSE.w + 12, height: HOUSE.h + 12, rx: 4, fill: "var(--surface)", stroke: "var(--ink)", "stroke-width": 2, "pointer-events": "none" }, house);
  const roomG = ROOM_RECTS.map((r, i) => { const g = svgEl("g", { "data-room": i, tabindex: 0, role: "button", class: "toy-handle" }, house); svgEl("rect", { x: r.x, y: r.y, width: r.w, height: r.h, fill: colour(i), "fill-opacity": 0.22, stroke: "var(--ink)", "stroke-width": 4 }, g); const nm = svgEl("text", { x: r.x + 14, y: r.y + 26, "font-size": 22, "font-weight": 700, fill: "var(--ink)", "pointer-events": "none" }, g); nm.textContent = ROOM_NAMES[i]; const badge = svgEl("g", { visibility: "hidden", "pointer-events": "none" }, g); svgEl("circle", { cx: r.x + r.w - 20, cy: r.y + 20, r: 13, fill: "var(--surface)", stroke: "var(--ink)", "stroke-width": 2 }, badge); const bt = svgEl("text", { x: r.x + r.w - 20, y: r.y + 25.5, "text-anchor": "middle", "font-size": 15, "font-weight": 700, fill: "var(--ink)" }, badge); return { g, badge, bt, ring: svgEl("rect", { x: r.x + 5, y: r.y + 5, width: r.w - 10, height: r.h - 10, fill: "none", stroke: "var(--accent)", "stroke-width": 4, "stroke-dasharray": "8 6", visibility: "hidden", "pointer-events": "none" }, g) }; });
  svgEl("text", { x: -40, y: -10, "text-anchor": "middle", "font-size": 22, "font-weight": 700, fill: "var(--ink)", "pointer-events": "none" }, house).textContent = "O";
  const doorG = doors.map((d, i) => { const g = svgEl("g", { "data-door": i, tabindex: 0, role: "button", class: "toy-handle" }, house), horiz = d.n[0] === 0, w = horiz ? 34 : 12, h = horiz ? 12 : 34; svgEl("rect", { x: d.x - w / 2 - 8, y: d.y - h / 2 - 8, width: w + 16, height: h + 16, fill: "transparent" }, g); const body = svgEl("rect", { x: d.x - w / 2, y: d.y - h / 2, width: w, height: h, rx: 3, "stroke-width": 2.5 }, g); const num = svgEl("text", { x: d.x + (horiz ? 0 : d.n[0] * 22), y: d.y + (horiz ? d.n[1] * 22 + 5 : 5), "text-anchor": "middle", "font-size": 14, "font-weight": 700, fill: "var(--ink)", "pointer-events": "none" }, g); return { g, body, num }; });
  const walker = makeSoldier(house, { uniform: "#e8710a", hat: 1, size: 0.95, label: "" });
  const place = (p, dir = 1, phase = 0, amp = 0) => walker.set({ x: p[0], y: p[1] + 14, dir, phase, amp, scale: state.at === null && !moving ? 0 : 1 });
  const usedSet = () => new Set(state.walk.map((w) => w.i));
  const live = () => edges.filter((_, i) => !state.closed.has(i));
  function paint() {
    const u = usedSet(), c = eulerCriteria(edges.filter((_, i) => !state.closed.has(i)));
    doorG.forEach((dg, i) => { const closed = state.closed.has(i), used = u.has(i); dg.body.setAttribute("fill", closed ? "var(--ink)" : used ? "var(--pos)" : "var(--surface)"); dg.body.setAttribute("stroke", closed ? "var(--ink)" : used ? "var(--pos)" : "var(--accent)"); dg.num.textContent = used ? state.walk.findIndex((w) => w.i === i) + 1 : ""; dg.g.setAttribute("aria-label", `${t("Porte", "Door")} ${i + 1}: ${ROOM_NAMES[edges[i][0]]} ↔ ${ROOM_NAMES[edges[i][1]]}${closed ? `, ${t("fermée", "closed")}` : used ? `, ${t("utilisée", "used")}` : ""}`); });
    roomG.forEach((r, v) => { r.badge.setAttribute("visibility", level ? "visible" : "hidden"); r.bt.textContent = c.degrees[v]; r.g.setAttribute("aria-label", `${ROOM_NAMES[v]}${level ? `, ${t("portes", "doors")} ${c.degrees[v]}` : ""}`); r.g.setAttribute("aria-pressed", String(state.at === v)); r.ring.setAttribute("visibility", state.at === v ? "visible" : "hidden"); });
    grass.setAttribute("aria-pressed", String(state.at === 5));
  }
  function status() {
    const u = usedSet(), total = edges.length - state.closed.size, k = state.walk.length, c = eulerCriteria(live());
    read.textContent = msg || `${k}/${total} ${t("portes traversées", "doors crossed")}${k === total && total ? ` · ${t("Terminé !", "Complete!")}` : ""}${level >= 2 ? ` · ${c.connected ? t("Connecté", "Connected") : t("Non connecté", "Disconnected")} ; ${c.odd.length} ${t("lieux à nombre impair de portes", "places with an odd number of doors")} ; ${c.trail ? t("parcours possible", "trail possible") : t("parcours impossible", "trail impossible")}` : ""}`;
    root.querySelector("[data-undo]").disabled = !state.walk.length || moving;
    void u;
  }
  function draw(m = "") { msg = m; caf(raf); moving = false; paint(); if (state.at === null) walker.set({ x: 0, y: 0, scale: 0 }); else place(state.stand); status(); }
  function walkThrough(i, from, to, after) {
    const way = doorway(i, from), pts = [...(from === 5 ? ringRoute(state.stand, way[0]) : [state.stand, way[0]]), way[1], way[2], standAfter(i, to)], lens = pts.slice(1).map((p, k) => Math.hypot(p[0] - pts[k][0], p[1] - pts[k][1])), total = lens.reduce((a, b) => a + b, 0), dur = calm() ? 0 : Math.max(700, total * 7), t0 = performance.now();
    if (!dur) return after(pts.at(-1));
    moving = true; status();
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / dur); let d = easeInOut(k) * total, s = 0; while (s < lens.length - 1 && d > lens[s]) { d -= lens[s]; s++; }
      const f = lens[s] ? d / lens[s] : 1, A = pts[s], B = pts[s + 1];
      walker.set({ x: A[0] + (B[0] - A[0]) * f, y: A[1] + (B[1] - A[1]) * f + 14, dir: B[0] >= A[0] ? 1 : -1, phase: k * total / 40, amp: 1, scale: 1 });
      if (k < 1) raf = requestAnimationFrame(tick); else { moving = false; after(pts.at(-1)); }
    };
    raf = requestAnimationFrame(tick);
  }
  function tapDoor(i) {
    if (moving) return;
    const [a, b] = edges[i];
    if (mode.value === "edit") { state.closed.has(i) ? state.closed.delete(i) : state.closed.add(i); state.walk = []; state.at = null; return draw(); }
    if (state.closed.has(i)) return draw(t("Cette porte est fermée.", "This door is closed."));
    if (state.at === null) { state.at = a; state.stand = STAND[a]; state.walk = []; }
    if (usedSet().has(i) || (a !== state.at && b !== state.at)) return draw(t("Cette porte est utilisée ou ne touche pas ton lieu actuel.", "This door is used or does not touch your current place."));
    const from = state.at, to = from === a ? b : a;
    msg = ""; walkThrough(i, from, to, (p) => { state.walk.push({ i, from, stand: state.stand }); state.at = to; state.stand = p; draw(); });
  }
  function tapRoom(v) { if (moving || mode.value === "edit") return; if (!state.walk.length) { state.at = v; state.stand = STAND[v]; draw(); } }
  const act = (target) => { const room = target.closest("[data-room]"), door = target.closest("[data-door]"); if (door) tapDoor(Number(door.dataset.door)); else if (room) tapRoom(Number(room.dataset.room)); };
  board.onclick = (e) => act(e.target); board.onkeydown = (e) => { if (["Enter", " "].includes(e.key)) { e.preventDefault(); act(e.target); } };
  mode.onchange = () => { state.walk = []; state.at = null; draw(); };
  root.querySelector("[data-undo]").onclick = () => { if (moving) return; const last = state.walk.pop(); if (last) { state.at = last.from; state.stand = last.stand; } draw(); };
  root.querySelector("[data-restart]").onclick = () => { state.walk = []; state.at = null; draw(); };
  root.querySelector("[data-plan]").onclick = () => { state.closed.clear(); state.walk = []; state.at = null; draw(); };
  draw();
  const off = onHintAction("rooms", { counts: () => { level = Math.max(level, 1); draw(); }, degrees: () => { level = 2; draw(); } });
  void makeCtx;
  return () => { caf(raf); off(); };
}
