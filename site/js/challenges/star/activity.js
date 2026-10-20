// Hands-on activity of the star challenge: the learner tries, fails and notices; it never states the answer or the method.
import { f1 } from "../common/helpers.js";
import { svgEl, colour, clamp } from "../common/kit.js";
import { starK, starSumDegrees } from "./maths.js";

export const TAU = Math.PI * 2;

/* ------------------------------------------------------------------ star */
export function activity(root, { t, q }) {
  let n = q.n, k = starK(q.n, q.k), irregular = false, angles = [];
  const regular = () => Array.from({ length: n }, (_, i) => (TAU * i) / n);
  root.innerHTML = `
    <p class="act-help">${t("Choisis le nombre de points et le saut. Les angles aux pointes sont mesurés à partir des coordonnées. Le bouton « Points au hasard » déplace les points sur le cercle.", "Choose the number of points and the skip. The tip angles are measured from the coordinates. The “Random points” button moves the points on the circle.")}</p>
    <svg class="act-svg" viewBox="0 0 520 320" role="img" aria-label="${t("Étoile à n branches", "Star with n points")}"></svg>
    <div class="act-controls">
      <label class="act-field" for="st-n"><span class="act-label">${t("Points", "Points")} <output id="st-nout"></output></span><input id="st-n" type="range" min="5" max="13" step="1" value="${n}"></label>
      <label class="act-field" for="st-k"><span class="act-label">${t("Saut k", "Skip k")} <output id="st-kout"></output></span><input id="st-k" type="range" min="1" max="6" step="1" value="${k}"></label>
      <button class="btn btn-secondary" id="st-rand" type="button">${t("Points au hasard", "Random points")}</button><button class="btn-quiet" id="st-reg" type="button">${t("Régulier", "Regular")}</button>
    </div>
    <details class="act-measurements"><summary>${t("Afficher les mesures", "Show measurements")}</summary><p class="act-readout" id="st-read" role="status" aria-live="polite"></p></details>`;
  const svg = root.querySelector("svg"), read = root.querySelector("#st-read");
  function draw() {
    k = starK(n, k); const ang = irregular ? angles : regular(), CX = 260, CY = 160, R = 140, P = (i) => [CX + R * Math.cos(ang[i] - Math.PI / 2), CY + R * Math.sin(ang[i] - Math.PI / 2)];
    svg.replaceChildren();
    svgEl("circle", { cx: CX, cy: CY, r: R, fill: "none", stroke: "var(--line-strong)", "stroke-width": 1.5 }, svg);
    for (let i = 0; i < n; i++) { const [x1, y1] = P(i), [x2, y2] = P((i + k) % n); svgEl("line", { x1, y1, x2, y2, stroke: colour(1), "stroke-width": 3, "stroke-linecap": "round" }, svg); }
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const o = P(i), u = P((i + k) % n), v = P((i - k + n) % n), a1 = [u[0] - o[0], u[1] - o[1]], b1 = [v[0] - o[0], v[1] - o[1]];
      const tip = (Math.acos(clamp((a1[0] * b1[0] + a1[1] * b1[1]) / (Math.hypot(...a1) * Math.hypot(...b1)), -1, 1)) * 180) / Math.PI; sum += tip;
      svgEl("circle", { cx: o[0], cy: o[1], r: 4, fill: colour(0) }, svg);
      const mx = CX + (R + 16) * Math.cos(ang[i] - Math.PI / 2), my = CY + (R + 16) * Math.sin(ang[i] - Math.PI / 2), tx = svgEl("text", { x: mx, y: my + 4, "text-anchor": "middle", style: "font:600 11px var(--body);fill:var(--ink)" }, svg); tx.textContent = root.querySelector(".act-measurements").open ? `${Math.round(tip)}°` : "";
    }
    root.querySelector("#st-nout").textContent = n; root.querySelector("#st-kout").textContent = k;
    root.querySelector("#st-k").value = k;
    read.innerHTML = `${t("Somme des angles aux pointes", "Sum of the tip angles")} = <strong>${f1(sum)}°</strong>${irregular ? ` (${t("points quelconques", "arbitrary points")})` : ""}`;
  }
  root.querySelector("#st-n").addEventListener("input", (e) => { n = Number(e.target.value); irregular = false; draw(); });
  root.querySelector("#st-k").addEventListener("input", (e) => { k = Number(e.target.value); irregular = false; draw(); });
  root.querySelector("#st-rand").addEventListener("click", () => { angles = Array.from({ length: n }, () => Math.random() * TAU).sort((u, v) => u - v); irregular = true; draw(); });
  root.querySelector("#st-reg").addEventListener("click", () => { irregular = false; draw(); });
  root.querySelector(".act-measurements").addEventListener("toggle", draw);
  void starSumDegrees;
  draw();
  return () => {};
}
