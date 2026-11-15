// Hands-on activity of the konigsberg challenge: the learner tries, fails and notices; it never states the answer or the method.
// The town is drawn as a cartoon map (art.js): land, water, wooden bridges, a walker who really crosses the bridge you tap.
// No graph and no count of bridges per district is shown: seeing the network in the map is the learner's job.
const caf = (id) => globalThis.cancelAnimationFrame?.(id);
import { goalLine } from "../common/kit.js";
import { PRESS, installCartoon, pop } from "../common/cartoon.js";
import { makeSoldier, easeInOut } from "../common/scene-kit.js";
import { graphFor } from "./maths.js";
import { cityFor } from "./plan.js";
import { drawTown } from "./art.js";

const inland = (foot, other, k) => { const dx = foot[0] - other[0], dy = foot[1] - other[1], l = Math.hypot(dx, dy) || 1; return [foot[0] + (dx / l) * k, foot[1] + (dy / l) * k]; };

/* ------------------------------------------------------------ konigsberg */
export function activity(root, { t, q, reduced }) {
  installCartoon();
  const graph = graphFor(q.g), city = cityFor(q.g), E = graph.edges.length, nm = (i) => graph.names[i];
  const state = { removed: new Set(), walk: [], at: null, stand: null, mode: "walk" };
  const calm = () => (typeof reduced === "function" ? reduced() : !!reduced);
  let raf = 0, moving = false, msg = "";
  root.innerHTML = `
    ${goalLine(t, `Traverse chaque pont une seule fois.`, `Cross every bridge exactly once.`, `Plan d’une ville : ${graph.names.length} quartiers (${graph.names.join(", ")}) et ${E} ponts. Touche un quartier pour y poser le promeneur, puis un pont : il le traverse. Mode retrait : touche un pont pour le supprimer ou le rétablir.`, `Map of a town: ${graph.names.length} districts (${graph.names.join(", ")}) and ${E} bridges. Tap a district to place the walker, then a bridge: the walker crosses it. Removal mode: tap a bridge to remove or restore it.`)}
    <svg class="act-svg" viewBox="0 0 ${city.W} ${city.H}" role="group" aria-label="${t("Plan de la ville, ses quartiers et ses ponts", "Map of the town, its districts and bridges")}"></svg>
    <div class="act-controls">
      <fieldset class="act-choice"><legend>${t("Mode", "Mode")}</legend>
        <label><input type="radio" name="kb-mode" value="walk" checked> ${t("Promenade", "Walk")}</label>
        <label><input type="radio" name="kb-mode" value="remove"> ${t("Retrait de ponts", "Remove bridges")}</label></fieldset>
      <button class="btn-quiet ${PRESS}" id="kb-undo" type="button">${t("Annuler un pont", "Undo a bridge")}</button>
      <button class="btn-quiet ${PRESS}" id="kb-reset" type="button">${t("Recommencer", "Start over")}</button>
    </div>
    <p class="act-readout" id="kb-read" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector("#kb-read");
  const T = drawTown(svg, city, graph.names, "kba" + q.g);
  const walker = makeSoldier(T.layer, { uniform: "#e8710a", hat: 1, size: 0.8, label: "" });
  // every bridge and district is a button on the map
  T.bridges.forEach((br, i) => {
    Object.entries({ "data-b": i, tabindex: 0, role: "button", class: `kb-bridge ${PRESS}`, style: "cursor:pointer;outline:none;transform-box:fill-box;transform-origin:center" }).forEach(([k, v]) => br.g.setAttribute(k, v));
  });
  T.lands.forEach((ld, v) => { Object.entries({ tabindex: 0, role: "button", style: "cursor:pointer;outline:none", "aria-label": `${t("Quartier", "District")} ${nm(v)}` }).forEach(([k, val]) => ld.g.setAttribute(k, val)); });
  const used = () => new Set(state.walk.map((w) => w.i));
  const feet = (i, from) => { const br = city.bridges[i], [a] = graph.edges[i]; return from === a ? [br.a, br.b] : [br.b, br.a]; };
  function paint() {
    const u = used();
    graph.edges.forEach((b, i) => {
      const br = T.bridges[i], gone = state.removed.has(i), crossed = u.has(i);
      br.g.classList.toggle("crossed", crossed); br.g.setAttribute("opacity", gone ? "0.4" : "1"); br.cross.setAttribute("opacity", gone ? "1" : "0");
      br.done.setAttribute("opacity", crossed ? "1" : "0"); br.done.setAttribute("x", String(-br.L / 2 + 2)); br.done.setAttribute("width", String(br.L - 4));
      br.g.setAttribute("aria-label", `${t("Pont", "Bridge")} ${i + 1}, ${t("entre", "between")} ${nm(b[0])} ${t("et", "and")} ${nm(b[1])}${gone ? `, ${t("retiré", "removed")}` : crossed ? `, ${t("traversé", "crossed")}` : ""}`);
    });
    T.lands.forEach((ld, v) => ld.g.setAttribute("aria-pressed", String(state.at === v)));
  }
  function status() {
    const u = used(), total = E - state.removed.size, k = state.walk.length;
    let s = `${t("Ponts traversés", "Bridges crossed")} : <strong>${k}</strong> / ${total}.`;
    if (state.at !== null) {
      const free = graph.edges.filter((b, i) => !state.removed.has(i) && !u.has(i) && (b[0] === state.at || b[1] === state.at)).length;
      s += ` ${t("Tu es en", "You are in")} ${nm(state.at)}.`;
      if (k === total && total) s += ` ${t("Tous les ponts restants sont traversés exactement une fois.", "Every remaining bridge is crossed exactly once.")}`;
      else if (!free && k) s += ` ${t(`Bloqué : aucun pont libre ne part de ${nm(state.at)}.`, `Stuck: no free bridge leaves ${nm(state.at)}.`)}`;
    }
    read.innerHTML = `${s} ${msg}`.trim();
    root.querySelector("#kb-undo").disabled = !state.walk.length;
  }
  const stand = (p) => walker.set({ x: p[0], y: p[1], dir: 1, amp: 0, scale: 1 });
  function draw(m = "") { msg = m; caf(raf); moving = false; paint(); if (state.at === null) walker.set({ x: 0, y: 0, scale: 0 }); else stand(state.stand); status(); }
  // the walker goes to the foot of bridge i, crosses it, and steps onto the other land; the bridge turns green behind him
  function cross(i, from, after) {
    const [fa, fb] = feet(i, from), end = inland(fb, fa, 16), pts = [state.stand, inland(fa, fb, 6), inland(fb, fa, 6), end];
    const lens = pts.slice(1).map((p, k) => Math.hypot(p[0] - pts[k][0], p[1] - pts[k][1])), total = lens.reduce((a, b) => a + b, 0), dur = calm() ? 0 : Math.max(800, total * 8), t0 = performance.now();
    const br = T.bridges[i], fromA = from === graph.edges[i][0];
    if (!dur) return after(end);
    moving = true;
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / dur); let d = easeInOut(k) * total, s = 0; while (s < lens.length - 1 && d > lens[s]) { d -= lens[s]; s++; }
      const f = lens[s] ? d / lens[s] : 1, A = pts[s], B = pts[s + 1];
      walker.set({ x: A[0] + (B[0] - A[0]) * f, y: A[1] + (B[1] - A[1]) * f, dir: B[0] >= A[0] ? 1 : -1, phase: (k * total) / 36, amp: 1, scale: 1 });
      const on = s === 0 ? 0 : s === 1 ? f : 1, w = (br.L - 4) * on;
      br.done.setAttribute("opacity", on > 0 ? "1" : "0"); br.done.setAttribute("width", String(w)); br.done.setAttribute("x", String(fromA ? -br.L / 2 + 2 : br.L / 2 - 2 - w));
      if (k < 1) raf = requestAnimationFrame(tick); else { moving = false; after(end); }
    };
    raf = requestAnimationFrame(tick);
  }
  function tapBridge(i) {
    if (moving) return;
    if (state.mode === "remove") { state.removed.has(i) ? state.removed.delete(i) : state.removed.add(i); state.walk = []; state.at = null; return draw(); }
    if (state.removed.has(i)) return draw(t("Ce pont est retiré.", "That bridge is removed."));
    if (used().has(i)) return draw(t("Pont déjà traversé.", "Bridge already crossed."));
    const [a, b] = graph.edges[i];
    if (state.at === null) { state.at = a; state.walk = []; state.stand = inland(city.bridges[i].a, city.bridges[i].b, 16); }
    if (state.at !== a && state.at !== b) return draw(t(`Ce pont ne part pas de ${nm(state.at)}.`, `That bridge does not leave ${nm(state.at)}.`));
    const from = state.at, to = from === a ? b : a, before = state.stand;
    msg = ""; paint(); status();
    cross(i, from, (end) => { state.at = to; state.stand = end; state.walk.push({ i, from, stand: before }); draw(); });
  }
  function tapLand(v) {
    if (moving) return;
    if (state.mode === "walk" && !state.walk.length) { state.at = v; state.stand = city.spots[v].stand; draw(t(`Départ de ${nm(v)}.`, `Start from ${nm(v)}.`)); }
  }
  svg.addEventListener("click", (e) => { const b = e.target.closest("[data-b]"); if (b) { tapBridge(Number(b.dataset.b)); return pop(b, reduced); } const l = e.target.closest("[data-land]"); if (l) tapLand(Number(l.dataset.land)); });
  svg.addEventListener("keydown", (e) => { if (e.key !== "Enter" && e.key !== " ") return; const b = e.target.closest?.("[data-b]"), l = e.target.closest?.("[data-land]"); if (b || l) { e.preventDefault(); b ? tapBridge(Number(b.dataset.b)) : tapLand(Number(l.dataset.land)); } });
  root.querySelectorAll("[name=kb-mode]").forEach((r) => r.addEventListener("change", () => { state.mode = r.value; draw(); }));
  root.querySelector("#kb-undo").addEventListener("click", (e) => { if (moving) return; const w = state.walk.pop(); if (w) { state.at = w.from; state.stand = w.stand; } draw(); pop(e.currentTarget, reduced); });
  root.querySelector("#kb-reset").addEventListener("click", (e) => { state.walk = []; state.at = null; state.removed.clear(); draw(); pop(e.currentTarget, reduced); });
  draw();
  return () => caf(raf);
}
