// Hands-on activity of the lunes challenge: the learner tries, fails and notices; it never states the answer or the method.
import { f1 } from "../common/helpers.js";
import { svgEl, colour } from "../common/kit.js";
import { luneArea, luneTotal } from "./maths.js";

/* ----------------------------------------------------------------- lunes */
export function activity(root, { t, q }) {
  let a = q.a, b = q.b;
  root.innerHTML = `
    <p class="act-help">${t("Les deux lunules (en orange) sont à l’extérieur du cercle de diamètre AB. Change les côtés CA et CB : compare leur aire, comptée par quadrillage, à l’aire du triangle.", "The two lunes (orange) lie outside the circle on diameter AB. Change the sides CA and CB: compare their area, counted on a grid, with the area of the triangle.")}</p>
    <svg class="act-svg" viewBox="0 0 520 300" role="img" aria-label="${t("Triangle rectangle, demi-cercles et lunules", "Right triangle, semicircles and lunes")}"></svg>
    <div class="act-controls">
      <label class="act-field" for="ln-a"><span class="act-label">CA <output id="ln-aout"></output></span><input id="ln-a" type="range" min="2" max="20" step="1" value="${a}"></label>
      <label class="act-field" for="ln-b"><span class="act-label">CB <output id="ln-bout"></output></span><input id="ln-b" type="range" min="2" max="20" step="1" value="${b}"></label>
    </div>
    <details class="act-measurements"><summary>${t("Afficher les aires", "Show areas")}</summary><p class="act-readout" id="ln-read" role="status" aria-live="polite"></p></details>`;
  const svg = root.querySelector("svg"), read = root.querySelector("#ln-read");
  function draw() {
    svg.replaceChildren();
    const c = Math.hypot(a, b), cx = a / 2, cy = b / 2, R = c / 2, xmin = Math.min(-b / 2, cx - R), xmax = Math.max(a, cx + R), ymin = Math.min(-a / 2, cy - R), ymax = Math.max(b, cy + R);
    const sc = Math.min(480 / (xmax - xmin), 270 / (ymax - ymin)), ox = 20 + (480 - sc * (xmax - xmin)) / 2 - sc * xmin, oy = 15 + sc * ymax + (270 - sc * (ymax - ymin)) / 2;
    const P = (u, v) => [ox + u * sc, oy - v * sc];
    const [Cx, Cy] = P(0, 0), [Ax, Ay] = P(a, 0), [Bx, By] = P(0, b), [Mx, My] = P(cx, cy);
    svgEl("path", { d: `M${Cx} ${Cy}A${(a / 2) * sc} ${(a / 2) * sc} 0 0 0 ${Ax} ${Ay}Z`, fill: colour(1), opacity: 0.85 }, svg);
    svgEl("path", { d: `M${Cx} ${Cy}A${(b / 2) * sc} ${(b / 2) * sc} 0 0 1 ${Bx} ${By}Z`, fill: colour(1), opacity: 0.85 }, svg);
    svgEl("circle", { cx: Mx, cy: My, r: R * sc, fill: "var(--sunken)", stroke: "var(--ink)", "stroke-width": 2 }, svg);
    svgEl("polygon", { points: `${Cx},${Cy} ${Ax},${Ay} ${Bx},${By}`, fill: `color-mix(in srgb, ${colour(0)} 40%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 2.5 }, svg);
    svgEl("path", { d: `M${Cx} ${Cy}A${(a / 2) * sc} ${(a / 2) * sc} 0 0 0 ${Ax} ${Ay}`, fill: "none", stroke: "var(--ink)", "stroke-width": 2 }, svg);
    svgEl("path", { d: `M${Cx} ${Cy}A${(b / 2) * sc} ${(b / 2) * sc} 0 0 1 ${Bx} ${By}`, fill: "none", stroke: "var(--ink)", "stroke-width": 2 }, svg);
    for (const [pt, lab, dx, dy] of [[[Cx, Cy], "C", -14, 18], [[Ax, Ay], "A", 14, 18], [[Bx, By], "B", -14, -6]]) { const tx = svgEl("text", { x: pt[0] + dx, y: pt[1] + dy, "text-anchor": "middle", style: "font:700 15px var(--body);fill:var(--ink)" }, svg); tx.textContent = lab; }
    root.querySelector("#ln-aout").textContent = `${a} cm`; root.querySelector("#ln-bout").textContent = `${b} cm`;
    const est = luneArea(a, b, 360), tri = luneTotal(a, b);
    read.innerHTML = `${t("Aire des lunules (comptage)", "Area of the lunes (counted)")} ≈ <strong>${f1(est)} cm²</strong> · ${t("aire du triangle", "area of the triangle")} ${a} × ${b} / 2 = <strong>${tri} cm²</strong>`;
  }
  root.querySelector("#ln-a").addEventListener("input", (e) => { a = Number(e.target.value); draw(); });
  root.querySelector("#ln-b").addEventListener("input", (e) => { b = Number(e.target.value); draw(); });
  draw();
  return () => {};
}
