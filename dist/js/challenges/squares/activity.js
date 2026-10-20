// Hands-on activity of the squares challenge: the learner tries, fails and notices; it never states the answer or the method.
import { svgEl, colour, clamp } from "../common/kit.js";

/* ---------------------------------------------------------------- squares */
// Each border (an L of 1, 3, 5, … dots) has its own colour, an outline that wraps the whole L, and a matching line in
// the legend, so the grouping "1 + 3 + 5 + …" is visible on the picture itself. Colour is never the only cue: the
// newest border is outlined thick and every legend line states its dot count.
export function activity(root, { t }) {
  let n = 5;
  root.innerHTML = `
    <p class="act-help">${t("Ajoute des bordures de points une à une et compte les points de chacune. Chaque bordure a sa couleur et son contour.", "Add borders of dots one at a time and count the dots in each. Every border has its own colour and outline.")}</p>
    <div class="sq-layout">
      <svg class="act-svg" id="sq-svg" viewBox="0 0 300 300" role="img" aria-label="${t("Points disposés en carré, une couleur par bordure", "Dots arranged in a square, one colour per border")}"></svg>
      <details><summary>${t("Afficher les comptages", "Show counts")}</summary><ol class="sq-legend" id="sq-legend" aria-label="${t("Bordures et nombre de points", "Borders and dot counts")}"></ol></details>
    </div>
    <div class="act-controls">
      <label class="act-field" for="sq-n"><span class="act-label">${t("Nombre de bordures", "Number of borders")} <output id="sq-out"></output></span><input id="sq-n" type="range" min="1" max="12" step="1" value="5"></label>
      <div class="act-buttons">
        <button class="btn btn-secondary" id="sq-minus" type="button">${t("Retirer une bordure", "Remove a border")}</button>
        <button class="btn btn-primary" id="sq-plus" type="button">${t("Ajouter une bordure", "Add a border")}</button>
      </div>
    </div>
    <details><summary>${t("Afficher la somme", "Show the sum")}</summary><p class="act-readout" id="sq-read" role="status" aria-live="polite"></p></details>`;
  const svg = root.querySelector("#sq-svg"), legend = root.querySelector("#sq-legend");
  const SP = 23, R = 8;
  function draw() {
    svg.replaceChildren();
    legend.replaceChildren();
    const OX = (300 - (n - 1) * SP) / 2, OY = OX, P = (i, j) => [OX + j * SP, OY + i * SP];
    for (let k = 1; k <= n; k++) {
      // outline of border k: the L made of row k − 1 and column k − 1, drawn as one rounded polygon around the dots
      const pad = R + 3, a = k - 1, c0 = P(0, 0), x0 = c0[0] - pad, y0 = c0[1] - pad, ex = c0[0] + a * SP + pad, ey = c0[1] + a * SP + pad, ix = c0[0] + (a - 1) * SP + pad, iy = c0[1] + (a - 1) * SP + pad;
      const d = k === 1 ? `M${x0} ${y0}H${ex}V${ey}H${x0}Z` : `M${x0} ${iy}H${ix}V${y0}H${ex}V${ey}H${x0}Z`;
      svgEl("path", { d, class: `sq-border${k === n ? " newest" : ""}`, style: `stroke:${colour(k - 1)};fill:${colour(k - 1)}` }, svg);
    }
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const layer = Math.max(i, j) + 1, [cx, cy] = P(i, j);
        svgEl("circle", { cx, cy, r: R, class: "sq-dot", style: `fill:${colour(layer - 1)}` }, svg);
      }
    // border numbers along the left column of the picture
    for (let k = 1; k <= n; k++) { const [cx, cy] = P(k - 1, 0); void cx; if (n <= 8) svgEl("text", { x: P(0, 0)[0] - 22, y: cy + 4, "text-anchor": "end", class: "sq-k" }, svg).textContent = k; }
    let sum = 0;
    for (let k = 1; k <= n; k++) {
      sum += 2 * k - 1;
      const li = document.createElement("li");
      li.className = k === n ? "newest" : "";
      li.innerHTML = `<span class="sw" style="background:${colour(k - 1)}"></span><span>${t("Bordure", "Border")} ${k} : <strong>${2 * k - 1}</strong> ${t(k > 1 ? "points" : "point", k > 1 ? "dots" : "dot")}</span><span class="tot">${t("total", "total")} ${sum}</span>`;
      legend.append(li);
    }
    const terms = Array.from({ length: n }, (_, k) => 2 * k + 1);
    const shown = n > 8 ? `${terms.slice(0, 4).join(" + ")} + … + ${terms.slice(-2).join(" + ")}` : terms.join(" + ");
    root.querySelector("#sq-out").textContent = n;
    root.querySelector("#sq-n").value = n;
    root.querySelector("#sq-read").innerHTML = `${shown} = <strong>${n * n}</strong><br>${t("La dernière bordure compte", "The last border has")} ${2 * n - 1} ${t(n > 1 ? "points" : "point", n > 1 ? "dots" : "dot")}. ${t("Le carré a", "The square has")} ${n} × ${n} ${t("points", "dots")}.`;
    root.querySelector("#sq-minus").disabled = n <= 1;
    root.querySelector("#sq-plus").disabled = n >= 12;
  }
  const set = (v) => {
    n = clamp(v, 1, 12);
    draw();
  };
  root.querySelector("#sq-n").addEventListener("input", (e) => set(Number(e.target.value)));
  root.querySelector("#sq-minus").addEventListener("click", () => set(n - 1));
  root.querySelector("#sq-plus").addEventListener("click", () => set(n + 1));
  draw();
  return () => {};
}
