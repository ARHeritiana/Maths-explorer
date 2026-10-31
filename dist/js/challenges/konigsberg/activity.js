// Hands-on activity of the konigsberg challenge: the learner tries, fails and notices; it never states the answer or the method.
// The network is drawn as the river map of the animated solution (islands, wooden bridges, a walker who really crosses the
// bridge you tap), so the graph itself is not shown: it is what the learner has to see in the map.
const caf = (id) => globalThis.cancelAnimationFrame?.(id);
import { onHintAction, svgEl, makeCtx } from "../common/kit.js";
import { graphFor, layoutOf, bridgeGeom } from "./maths.js";
import { scene } from "./solution.js";
import { easeInOut } from "../common/scene-kit.js";

/* ------------------------------------------------------------ konigsberg */
export function activity(root, { t, q, reduced, lang }) {
  const W = 520, H = 300, graph = graphFor(q.g), pos = layoutOf(graph), E = graph.edges.length;
  const state = { removed: new Set(), walk: [], at: null, mode: "walk" };
  const calm = () => (typeof reduced === "function" ? reduced() : !!reduced);
  let showDeg = false, raf = 0, moving = false, msg = "";   // hint 1: the number of bridges at each district
  root.innerHTML = `
    <p class="act-help">${t(`${graph.names.length} quartiers (${graph.names.join(", ")}) reliés par ${E} ponts. Touche un quartier pour y poser le promeneur, puis un pont qui en part : il le traverse. Mode retrait : touche un pont pour le supprimer ou le rétablir.`, `${graph.names.length} districts (${graph.names.join(", ")}) joined by ${E} bridges. Tap a district to place the walker, then tap a bridge leaving it: the walker crosses it. Removal mode: tap a bridge to remove or restore it.`)}</p>
    <svg class="act-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="${t("Carte des quartiers et des ponts", "Map of the districts and bridges")}"></svg>
    <div class="act-controls">
      <fieldset class="act-choice"><legend>${t("Mode", "Mode")}</legend>
        <label><input type="radio" name="kb-mode" value="walk" checked> ${t("Promenade", "Walk")}</label>
        <label><input type="radio" name="kb-mode" value="remove"> ${t("Retrait de ponts", "Remove bridges")}</label></fieldset>
      <button class="btn-quiet" id="kb-undo" type="button">${t("Annuler un pont", "Undo a bridge")}</button>
      <button class="btn-quiet" id="kb-reset" type="button">${t("Recommencer", "Start over")}</button>
    </div>
    <p class="act-readout" id="kb-read" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector("#kb-read"), nm = (i) => graph.names[i];
  const S = scene.mount(makeCtx(svg, lang), q);
  S.label.parentNode.remove();
  const { bridges, islands, walker } = S;
  const bridgeAt = (i, k) => { const { ctrl } = bridgeGeom(graph, i, pos), [from, to] = k >= 0 ? [graph.edges[i][0], graph.edges[i][1]] : [graph.edges[i][1], graph.edges[i][0]]; return { ctrl, A: pos[from], B: pos[to] }; };
  // every bridge and district is a button on the map
  graph.edges.forEach((_, i) => { const br = bridges[i]; br.gp.setAttribute("data-b", i); br.gp.setAttribute("tabindex", "0"); br.gp.setAttribute("role", "button"); br.gp.style.cursor = "pointer"; br.gp.style.outline = "none"; svgEl("path", { d: br.d, fill: "none", stroke: "transparent", "stroke-width": 30, "stroke-linecap": "round" }, br.gp); });
  islands.forEach((il, v) => { il.gp.setAttribute("data-land", v); il.gp.setAttribute("tabindex", "0"); il.gp.setAttribute("role", "button"); il.gp.style.cursor = "pointer"; il.gp.style.outline = "none"; il.gp.setAttribute("aria-label", `${t("Quartier", "District")} ${nm(v)}`); });
  const used = () => new Set(state.walk.map((w) => w.i));
  const standAt = (v) => { const [x, y] = pos[v]; walker.set({ x, y: y + 14, dir: 1, amp: 0, scale: 1 }); };
  function paint() {
    const u = used(), deg = graph.names.map((_, v) => graph.edges.filter((b, i) => !state.removed.has(i) && (b[0] === v || b[1] === v)).length);
    graph.edges.forEach((b, i) => {
      const br = bridges[i], gone = state.removed.has(i), crossed = u.has(i);
      br.gp.classList.add("kb-bridge"); br.gp.classList.toggle("crossed", crossed); br.gp.setAttribute("opacity", gone ? "0.35" : "1"); br.gp.setAttribute("transform", gone ? "translate(0 8)" : ""); br.cross.setAttribute("opacity", gone ? "1" : "0");
      br.done.setAttribute("pathLength", "999"); br.done.setAttribute("opacity", crossed ? "1" : "0"); br.done.setAttribute("stroke-dashoffset", "0");
      br.gp.setAttribute("aria-label", `${t("Pont", "Bridge")} ${i + 1}, ${nm(b[0])} ${t("à", "to")} ${nm(b[1])}${gone ? `, ${t("retiré", "removed")}` : crossed ? `, ${t("traversé", "crossed")}` : ""}`);
    });
    islands.forEach((il, v) => {
      il.badge.setAttribute("opacity", showDeg ? "1" : "0"); il.bt.textContent = deg[v]; il.bc.setAttribute("fill", deg[v] % 2 ? "#ff8a8a" : "#fff"); il.bc.setAttribute("stroke", deg[v] % 2 ? "#b00020" : "#222");
      il.gp.setAttribute("transform", `translate(${pos[v][0]} ${pos[v][1]})`);
    });
  }
  function status() {
    const u = used(), total = E - state.removed.size, k = state.walk.length;
    let s = `${t("Ponts restants", "Bridges left")} : <strong>${total}</strong> · ${t("traversés", "crossed")} : <strong>${k}</strong>.`;
    if (state.at !== null) {
      const free = graph.edges.filter((b, i) => !state.removed.has(i) && !u.has(i) && (b[0] === state.at || b[1] === state.at)).length;
      s += ` ${t("Tu es en", "You are in")} ${nm(state.at)}.`;
      if (k === total) s += ` ${t("Tous les ponts restants sont traversés exactement une fois.", "Every remaining bridge is crossed exactly once.")}`;
      else if (!free) s += ` ${t(`Bloqué : aucun pont libre ne part de ${nm(state.at)}, il en reste ${total - k}.`, `Stuck: no free bridge leaves ${nm(state.at)}, ${total - k} remain.`)}`;
    }
    read.innerHTML = `${s} ${msg}`.trim();
  }
  function draw(m = "") { msg = m; caf(raf); moving = false; paint(); if (state.at === null) walker.set({ x: 0, y: 0, scale: 0 }); else standAt(state.at); status(); }
  // the walker crosses bridge i from `from` to `to`; the bridge turns green when he arrives
  function cross(i, from, to, after) {
    const [a] = graph.edges[i], { ctrl } = bridgeGeom(graph, i, pos), A = pos[from], B = pos[to], dur = calm() ? 0 : 950, t0 = performance.now();
    if (!dur) return after();
    moving = true;
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / dur), e = easeInOut(k), x = (1 - e) ** 2 * A[0] + 2 * (1 - e) * e * ctrl[0] + e * e * B[0], y = (1 - e) ** 2 * A[1] + 2 * (1 - e) * e * ctrl[1] + e * e * B[1];
      walker.set({ x, y: y + 14, dir: B[0] >= A[0] ? 1 : -1, phase: k * 3, amp: 1, scale: 1 });
      bridges[i].done.setAttribute("opacity", "1"); bridges[i].done.setAttribute("pathLength", "999"); bridges[i].done.setAttribute("stroke-dashoffset", String(a === from ? 999 * (1 - k) : -999 * (1 - k)));
      if (k < 1) raf = requestAnimationFrame(tick); else { moving = false; after(); }
    };
    raf = requestAnimationFrame(tick);
  }
  function tapBridge(i) {
    if (moving) return;
    if (state.mode === "remove") { state.removed.has(i) ? state.removed.delete(i) : state.removed.add(i); state.walk = []; state.at = null; return draw(); }
    if (state.removed.has(i)) return draw(t("Ce pont est retiré.", "That bridge is removed."));
    if (used().has(i)) return draw(t("Pont déjà traversé.", "Bridge already crossed."));
    const [a, b] = graph.edges[i];
    if (state.at === null) { state.at = a; state.walk = []; }
    if (state.at !== a && state.at !== b) return draw(t(`Ce pont ne part pas de ${nm(state.at)}.`, `That bridge does not leave ${nm(state.at)}.`));
    const from = state.at, to = from === a ? b : a;
    msg = ""; paint(); status();
    cross(i, from, to, () => { state.at = to; state.walk.push({ i, from }); draw(); });
  }
  function tapLand(v) {
    if (moving) return;
    if (state.mode === "walk" && !state.walk.length) { state.at = v; draw(t(`Départ de ${nm(v)}.`, `Start from ${nm(v)}.`)); }
  }
  svg.addEventListener("click", (e) => { const b = e.target.closest("[data-b]"); if (b) return tapBridge(Number(b.dataset.b)); const l = e.target.closest("[data-land]"); if (l) tapLand(Number(l.dataset.land)); });
  svg.addEventListener("keydown", (e) => { if (e.key !== "Enter" && e.key !== " ") return; const b = e.target.closest?.("[data-b]"), l = e.target.closest?.("[data-land]"); if (b || l) { e.preventDefault(); b ? tapBridge(Number(b.dataset.b)) : tapLand(Number(l.dataset.land)); } });
  root.querySelectorAll("[name=kb-mode]").forEach((r) => r.addEventListener("change", () => { state.mode = r.value; draw(); }));
  root.querySelector("#kb-undo").addEventListener("click", () => { if (moving) return; const w = state.walk.pop(); if (w) state.at = w.from; draw(); });
  root.querySelector("#kb-reset").addEventListener("click", () => { state.walk = []; state.at = null; state.removed.clear(); draw(); });
  draw();
  const off = onHintAction("konigsberg", { degrees: () => { showDeg = true; draw(); } });
  return () => { caf(raf); off(); };
}
