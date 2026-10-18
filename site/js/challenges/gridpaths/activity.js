// Hands-on activity of the gridpaths challenge: the learner tries, fails and notices; it never states the answer or the method.
import { onHintAction, svgEl, colour } from "../common/kit.js";
import { pascalGrid, gridPaths } from "./maths.js";

/* ------------------------------------------------------------ grid paths */
export function activity(root, { t, q }) {
  const m = q.m, n = q.n, W = 520, H = 300, X0 = 40, Y0 = 20, DX = Math.min(44, 440 / m), DY = Math.min(44, 250 / n), found = new Set();
  let walk = [], counts = false;
  const px = (i) => X0 + i * DX, py = (j) => Y0 + (n - j) * DY, g = pascalGrid(m, n);
  root.innerHTML = `
    <p class="act-help">${t("Avance du coin en bas à gauche (A) jusqu’au coin en haut à droite (B) avec les boutons ou en touchant le prochain point. Chaque chemin complet est mémorisé : combien de chemins différents trouves-tu ?", "Walk from the bottom-left corner (A) to the top-right corner (B) with the buttons or by tapping the next point. Every complete path is remembered: how many different paths can you find?")}</p>
    <svg class="act-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${t("Quadrillage", "Grid")}"></svg>
    <div class="act-buttons">
      <button class="btn btn-secondary" id="gp-r" type="button">${t("Droite →", "Right →")}</button>
      <button class="btn btn-secondary" id="gp-u" type="button">${t("Haut ↑", "Up ↑")}</button>
      <button class="btn-quiet" id="gp-undo" type="button">${t("Annuler un pas", "Undo a step")}</button>
      <button class="btn-quiet" id="gp-clear" type="button">${t("Nouveau chemin", "New path")}</button>
      <button class="btn btn-secondary" id="gp-rand" type="button">${t("Chemin au hasard", "Random path")}</button>
    </div>
    <p class="act-readout" id="gp-read" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector("#gp-read"), pos = () => walk.reduce(([i, j], s) => (s === "R" ? [i + 1, j] : [i, j + 1]), [0, 0]);
  const word = (w) => w.join("");
  function draw() {
    svg.replaceChildren();
    for (let j = 0; j <= n; j++) svgEl("line", { x1: px(0), y1: py(j), x2: px(m), y2: py(j), stroke: "var(--line-strong)", "stroke-width": 1 }, svg);
    for (let i = 0; i <= m; i++) svgEl("line", { x1: px(i), y1: py(0), x2: px(i), y2: py(n), stroke: "var(--line-strong)", "stroke-width": 1 }, svg);
    let [ci, cj] = [0, 0]; const pts = [[0, 0]]; for (const s of walk) { s === "R" ? ci++ : cj++; pts.push([ci, cj]); }
    svgEl("polyline", { points: pts.map(([i, j]) => `${px(i)},${py(j)}`).join(" "), fill: "none", stroke: colour(1), "stroke-width": 6, "stroke-linecap": "round", "stroke-linejoin": "round" }, svg);
    for (let j = 0; j <= n; j++) for (let i = 0; i <= m; i++) {
      const here = i === ci && j === cj, next = (i === ci + 1 && j === cj) || (i === ci && j === cj + 1);
      const dot = svgEl("circle", { cx: px(i), cy: py(j), r: counts ? 11 : here ? 8 : 5, fill: here ? colour(1) : "var(--surface)", stroke: next ? colour(2) : "var(--ink)", "stroke-width": next ? 3 : 1.5, "data-i": i, "data-j": j, style: next ? "cursor:pointer" : "" }, svg);
      void dot;
      if (counts) { const tx = svgEl("text", { x: px(i), y: py(j) + 4, "text-anchor": "middle", style: `font:700 ${g[j][i] > 999 ? 8 : g[j][i] > 99 ? 9 : 11}px var(--body);fill:${here ? "#fff" : "var(--ink)"};pointer-events:none` }, svg); tx.textContent = g[j][i]; }
    }
    for (const [lab, i, j] of [["A", 0, 0], ["B", m, n]]) { const tx = svgEl("text", { x: px(i) + (i ? 16 : -16), y: py(j) + (j ? -10 : 22), "text-anchor": "middle", style: "font:700 16px var(--body);fill:var(--ink)" }, svg); tx.textContent = lab; }
    const total = gridPaths(m, n), done = walk.length === m + n;
    read.innerHTML = `${t("Chemin en cours", "Current path")} : <strong>${word(walk) || "—"}</strong>. ${t("Chemins différents trouvés", "Different paths found")} : <strong>${found.size}</strong>${counts ? ` ${t("sur", "out of")} <strong>${total}</strong>` : ""}.${done ? ` ${t("Chemin complet !", "Complete path!")}` : ""}`;
    root.querySelector("#gp-r").disabled = pos()[0] >= m; root.querySelector("#gp-u").disabled = pos()[1] >= n;
  }
  function step(s) { const [i, j] = pos(); if ((s === "R" && i >= m) || (s === "U" && j >= n)) return; walk.push(s); if (walk.length === m + n) found.add(word(walk)); draw(); }
  root.querySelector("#gp-r").addEventListener("click", () => step("R")); root.querySelector("#gp-u").addEventListener("click", () => step("U"));
  root.querySelector("#gp-undo").addEventListener("click", () => { walk.pop(); draw(); });
  root.querySelector("#gp-clear").addEventListener("click", () => { walk = []; draw(); });
  root.querySelector("#gp-rand").addEventListener("click", () => { const w = [...Array(m).fill("R"), ...Array(n).fill("U")]; for (let i = w.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [w[i], w[j]] = [w[j], w[i]]; } walk = w; found.add(word(w)); draw(); });
  svg.addEventListener("click", (e) => { const c = e.target.closest("circle"); if (!c) return; const [i, j] = pos(), ti = Number(c.dataset.i), tj = Number(c.dataset.j); if (ti === i + 1 && tj === j) step("R"); else if (ti === i && tj === j + 1) step("U"); });
  draw();
  return onHintAction("gridpaths", { counts: () => { counts = true; draw(); } });
}
