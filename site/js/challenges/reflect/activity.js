// Hands-on activity of the reflect challenge: the learner tries, fails and notices; it never states the answer or the method.
import { f1 } from "../common/helpers.js";
import { lockTouch, onHintAction, svgEl, colour, toLocal, clamp } from "../common/kit.js";
import { reflectSet, pathLength, shortestVia, bestContact } from "./maths.js";

/* --------------------------------------------------- shortest path, mirror */
export function activity(root, { t, q }) {
  const [a, b, d] = reflectSet(q.set), W = 520, H = 300, s = Math.min(380 / d, 100 / Math.max(a, b), 36), X0 = 70, RY = 150;
  let x = d / 2, best = Infinity, mirror = false, grab = false;
  root.innerHTML = `
    <p class="act-help">${t("Fais glisser le point X le long de la rivière (ou utilise le curseur) : la longueur AX + XB change. Où est-elle la plus petite ?", "Drag the point X along the river (or use the slider): the length AX + XB changes. Where is it smallest?")}</p>
    <svg class="act-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="${t("Rivière, points A et B, point de puisage X", "River, points A and B, water point X")}"></svg>
    <div class="act-controls"><label class="act-field" for="rf-x"><span class="act-label">${t("Position de X", "Position of X")} <output id="rf-xout"></output></span><input id="rf-x" type="range" min="0" max="${d}" step="0.05" value="${x}"></label></div>
    <p class="act-readout" id="rf-read" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector("#rf-read"), slider = root.querySelector("#rf-x");
  const P = (u, v) => [X0 + u * s, RY - v * s];
  function draw() {
    svg.replaceChildren();
    svgEl("rect", { x: 0, y: RY, width: W, height: H - RY, fill: "color-mix(in srgb, var(--c6) 24%, var(--surface))" }, svg);
    svgEl("line", { x1: 0, y1: RY, x2: W, y2: RY, stroke: colour(5), "stroke-width": 3 }, svg);
    const A = P(0, a), B = P(d, b), X = P(x, 0), Bm = P(d, -b);
    if (mirror) { svgEl("line", { x1: A[0], y1: A[1], x2: Bm[0], y2: Bm[1], stroke: colour(3), "stroke-width": 2.5, "stroke-dasharray": "7 5" }, svg); svgEl("line", { x1: B[0], y1: B[1], x2: Bm[0], y2: Bm[1], stroke: "var(--muted)", "stroke-dasharray": "3 4" }, svg); svgEl("circle", { cx: Bm[0], cy: Bm[1], r: 6, fill: "var(--surface)", stroke: colour(3), "stroke-width": 2 }, svg); const m = svgEl("text", { x: Bm[0] + 12, y: Bm[1] + 5, style: "font:700 14px var(--body);fill:var(--ink)" }, svg); m.textContent = "B′"; }
    svgEl("polyline", { points: `${A.join(",")} ${X.join(",")} ${B.join(",")}`, fill: "none", stroke: colour(1), "stroke-width": 4, "stroke-linejoin": "round" }, svg);
    for (const [pt, lab, dx] of [[A, "A", -16], [B, "B", 14]]) { svgEl("circle", { cx: pt[0], cy: pt[1], r: 7, fill: colour(0), stroke: "var(--ink)", "stroke-width": 2 }, svg); const tx = svgEl("text", { x: pt[0] + dx, y: pt[1] - 8, "text-anchor": "middle", style: "font:700 15px var(--body);fill:var(--ink)" }, svg); tx.textContent = lab; }
    const gEl = svgEl("g", { class: "toy-handle", tabindex: 0, role: "slider", "aria-label": t("Point X", "Point X"), "aria-valuemin": 0, "aria-valuemax": d, "aria-valuenow": Math.round(x * 100) / 100 }, svg);
    svgEl("circle", { class: "hit", cx: X[0], cy: X[1], r: 24 }, gEl); svgEl("circle", { class: "ring", cx: X[0], cy: X[1], r: 10 }, gEl); svgEl("circle", { class: "core", cx: X[0], cy: X[1], r: 4 }, gEl);
    const L = pathLength(a, b, d, x); best = Math.min(best, L);
    root.querySelector("#rf-xout").textContent = `${f1(x)} m`; slider.value = x;
    read.innerHTML = `AX + XB = <strong>${(Math.round(L * 100) / 100).toString()} m</strong> · ${t("meilleur essai", "best try")} : <strong>${(Math.round(best * 100) / 100).toString()} m</strong>${mirror ? ` · AB′ = √(${d}² + ${a + b}²) = <strong>${shortestVia(a, b, d)} m</strong> ${t("(contact en", "(contact at")} ${f1(bestContact(a, b, d))} m)` : ""}`;
  }
  const move = (e) => { const p = toLocal(svg, e); x = clamp((p.x - X0) / s, 0, d); draw(); };
  svg.addEventListener("pointerdown", (e) => { if (!e.target.closest(".toy-handle")) return; grab = true; svg.setPointerCapture(e.pointerId); e.preventDefault(); });
  svg.addEventListener("pointermove", (e) => { if (grab) move(e); });
  const up = () => { grab = false; }; svg.addEventListener("pointerup", up); svg.addEventListener("pointercancel", up);
  lockTouch(svg, ".toy-handle");
  svg.addEventListener("keydown", (e) => { if (!e.target.closest?.(".toy-handle")) return; const dd = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key]; if (!dd) return; e.preventDefault(); x = clamp(x + dd * (e.shiftKey ? 0.5 : 0.1), 0, d); draw(); svg.querySelector(".toy-handle")?.focus(); });
  slider.addEventListener("input", () => { x = Number(slider.value); draw(); });
  draw();
  return onHintAction("reflect", { mirror: () => { mirror = !mirror; draw(); } });
}
