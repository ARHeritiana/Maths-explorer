// Hands-on activity of the konigsberg challenge: the learner tries, fails and notices; it never states the answer or the method.
import { onHintAction, svgEl } from "../common/kit.js";
import { graphFor, layoutOf, bridgeGeom } from "./maths.js";

/* ------------------------------------------------------------ konigsberg */
export function activity(root, { t, q }) {
  const W = 520, H = 300, graph = graphFor(q.g), pos = layoutOf(graph), E = graph.edges.length;
  const state = { removed: new Set(), walk: [], at: null, mode: "walk" };
  let showDeg = false;   // hint 1: the number of bridges at each district
  root.innerHTML = `
    <p class="act-help">${t(`${graph.names.length} quartiers (${graph.names.join(", ")}) reliés par ${E} ponts. Mode promenade : touche un pont pour le traverser, puis un autre pont qui part de là où tu es. Mode retrait : touche un pont pour le supprimer ou le rétablir.`, `${graph.names.length} districts (${graph.names.join(", ")}) joined by ${E} bridges. Walk mode: tap a bridge to cross it, then another bridge leaving the district you are in. Removal mode: tap a bridge to remove or restore it.`)}</p>
    <svg class="act-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="${t("Quartiers et ponts", "Districts and bridges")}"></svg>
    <div class="act-controls">
      <fieldset class="act-choice"><legend>${t("Mode", "Mode")}</legend>
        <label><input type="radio" name="kb-mode" value="walk" checked> ${t("Promenade", "Walk")}</label>
        <label><input type="radio" name="kb-mode" value="remove"> ${t("Retrait de ponts", "Remove bridges")}</label></fieldset>
      <button class="btn-quiet" id="kb-undo" type="button">${t("Annuler un pont", "Undo a bridge")}</button>
      <button class="btn-quiet" id="kb-reset" type="button">${t("Recommencer", "Start over")}</button>
    </div>
    <p class="act-readout" id="kb-read" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector("#kb-read"), nm = (i) => graph.names[i];
  const used = () => new Set(state.walk.map((w) => w.i));
  function draw(msg = "") {
    svg.replaceChildren();
    const u = used();
    graph.edges.forEach((b, i) => {
      const { d, mid } = bridgeGeom(graph, i, pos), gone = state.removed.has(i), crossed = u.has(i);
      const g = svgEl("g", { class: `kb-bridge${gone ? " gone" : ""}${crossed ? " crossed" : ""}`, "data-b": i, tabindex: 0, role: "button", "aria-label": `${t("Pont", "Bridge")} ${i + 1}, ${nm(b[0])} ${t("à", "to")} ${nm(b[1])}${gone ? `, ${t("retiré", "removed")}` : crossed ? `, ${t("traversé", "crossed")}` : ""}` }, svg);
      svgEl("path", { d, class: "hit" }, g);
      svgEl("path", { d, class: "ln" }, g);
      if (crossed) {
        const k = state.walk.findIndex((w) => w.i === i) + 1;
        svgEl("circle", { cx: mid[0], cy: mid[1], r: 11, class: "num-bg" }, svg);
        svgEl("text", { x: mid[0], y: mid[1] + 4, "text-anchor": "middle", class: "num" }, svg).textContent = k;
      }
    });
    graph.names.forEach((name, v) => {
      const [x, y] = pos[v];
      svgEl("circle", { cx: x, cy: y, r: 22, class: `kb-land${state.at === v ? " here" : ""}` }, svg);
      svgEl("text", { x, y: y + 6, "text-anchor": "middle", class: "kb-name" }, svg).textContent = name;
      if (showDeg) {
        const deg = graph.edges.filter((b, i) => !state.removed.has(i) && (b[0] === v || b[1] === v)).length;
        svgEl("circle", { cx: x + 24, cy: y - 22, r: 10, fill: deg % 2 ? "var(--neg)" : "var(--pos)", "pointer-events": "none" }, svg);
        svgEl("text", { x: x + 24, y: y - 17.5, "text-anchor": "middle", style: "font:700 13px var(--body);fill:#fff;pointer-events:none" }, svg).textContent = deg;
      }
    });
    const total = E - state.removed.size, k = state.walk.length;
    let status = `${t("Ponts restants", "Bridges left")} : <strong>${total}</strong> · ${t("traversés", "crossed")} : <strong>${k}</strong>.`;
    if (state.at !== null) {
      const free = graph.edges.filter((b, i) => !state.removed.has(i) && !u.has(i) && (b[0] === state.at || b[1] === state.at)).length;
      status += ` ${t("Tu es en", "You are in")} ${nm(state.at)}.`;
      if (k === total) status += ` ${t("Tous les ponts restants sont traversés exactement une fois.", "Every remaining bridge is crossed exactly once.")}`;
      else if (!free) status += ` ${t(`Bloqué : aucun pont libre ne part de ${nm(state.at)}, il en reste ${total - k}.`, `Stuck: no free bridge leaves ${nm(state.at)}, ${total - k} remain.`)}`;
    }
    read.innerHTML = `${status} ${msg}`.trim();
  }
  function tap(i) {
    if (state.mode === "remove") { state.removed.has(i) ? state.removed.delete(i) : state.removed.add(i); state.walk = []; state.at = null; return draw(); }
    if (state.removed.has(i)) return draw(t("Ce pont est retiré.", "That bridge is removed."));
    if (used().has(i)) return draw(t("Pont déjà traversé.", "Bridge already crossed."));
    const [a, b] = graph.edges[i];
    if (state.at === null) { state.at = b; state.walk.push({ i, from: a }); return draw(t(`Départ de ${nm(a)}.`, `Start from ${nm(a)}.`)); }
    if (state.at !== a && state.at !== b) return draw(t(`Ce pont ne part pas de ${nm(state.at)}.`, `That bridge does not leave ${nm(state.at)}.`));
    const from = state.at; state.at = from === a ? b : a; state.walk.push({ i, from }); draw();
  }
  svg.addEventListener("click", (e) => { const g = e.target.closest("[data-b]"); if (g) tap(Number(g.dataset.b)); });
  svg.addEventListener("keydown", (e) => { const g = e.target.closest?.("[data-b]"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); tap(Number(g.dataset.b)); } });
  root.querySelectorAll("[name=kb-mode]").forEach((r) => r.addEventListener("change", () => { state.mode = r.value; draw(); }));
  root.querySelector("#kb-undo").addEventListener("click", () => { const w = state.walk.pop(); if (w) state.at = state.walk.length ? w.from : null; draw(); });
  root.querySelector("#kb-reset").addEventListener("click", () => { state.walk = []; state.at = null; state.removed.clear(); draw(); });
  draw();
  return onHintAction("konigsberg", { degrees: () => { showDeg = true; draw(); } });
}
