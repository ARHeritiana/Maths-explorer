// Hands-on activity of the gauss-sum challenge: add the terms one by one (and feel how long it takes), pair any two
// terms, and look at the sum as a staircase. It never states the answer; the flipped copy is a hint action.
import { colour, onHintAction, svgEl } from "../common/kit.js";
import { parseSeries, term, lastTerm, groupDigits } from "./maths.js";

const SHOWN = 8;   // terms shown at each end of a long series

export function activity(root, { t, q, lang }) {
  const [a, d, k] = parseSeries(q.series), l = lastTerm(a, d, k), g = (n) => groupDigits(n, lang);
  // indices of the terms shown as tiles: all of them, or the first and last SHOWN
  const shown = k <= 2 * SHOWN + 2 ? Array.from({ length: k }, (_, i) => i) : [...Array.from({ length: SHOWN }, (_, i) => i), null, ...Array.from({ length: SHOWN }, (_, i) => k - SHOWN + i)];
  let added = 0, total = 0, pick = null, pairs = [], flip = false;
  root.innerHTML = `
    <p class="act-help">${t("Additionne les termes un par un, ou touche deux nombres pour voir leur somme. Essaie plusieurs paires : que remarques-tu ?", "Add the terms one by one, or tap two numbers to see their sum. Try several pairs: what do you notice?")}</p>
    <div class="cl-grid gs-tiles" id="gs-tiles" role="group" aria-label="${t("Les termes de la somme", "The terms of the sum")}"></div>
    <div class="act-controls"><button class="btn btn-primary" id="gs-add" type="button">${t("Ajouter le terme suivant", "Add the next term")}</button><button class="btn btn-secondary" id="gs-add10" type="button">${t("Ajouter dix termes", "Add ten terms")}</button><button class="btn-quiet" id="gs-reset" type="button">${t("Recommencer", "Restart")}</button></div>
    <p class="act-readout" id="gs-read" role="status" aria-live="polite"></p>
    <ul class="cl-log" id="gs-pairs" aria-label="${t("Paires essayées", "Pairs tried")}"></ul>
    <svg class="act-svg gs-stairs" id="gs-svg" viewBox="0 0 520 240" role="img" aria-label="${t("La somme dessinée en escalier : une colonne par terme", "The sum drawn as a staircase: one column per term")}"></svg>
    <p class="act-note" id="gs-note"></p>`;
  const tiles = root.querySelector("#gs-tiles"), read = root.querySelector("#gs-read"), list = root.querySelector("#gs-pairs"), svg = root.querySelector("#gs-svg"), note = root.querySelector("#gs-note");
  const pairColour = (i) => pairs.findIndex((p) => p.includes(i));
  function drawTiles() {
    tiles.innerHTML = shown.map((i) => i === null ? `<span class="cl-gap" aria-hidden="true">…</span>` : `<button type="button" class="cl-tok" data-i="${i}" aria-pressed="${pick === i}" ${pairColour(i) >= 0 ? `style="border-color:${colour(pairColour(i))};box-shadow:inset 0 -4px 0 ${colour(pairColour(i))}"` : ""}>${g(term(a, d, i))}</button>`).join("");
  }
  function drawPairs() {
    list.innerHTML = pairs.map(([i, j], n) => `<li style="color:${colour(n)}"><span style="color:var(--ink)">${g(term(a, d, i))} + ${g(term(a, d, j))} = <strong>${g(term(a, d, i) + term(a, d, j))}</strong></span></li>`).join("");
  }
  function drawStairs() {
    svg.textContent = "";
    // a schematic staircase of at most 24 columns: column heights follow the terms
    const m = Math.min(k, 24), base = 220, top = 20, w = 440 / m, hi = (v) => ((v - a + d) / (l - a + 2 * d)) * (base - top) * (flip ? 0.5 : 0.92);
    const val = (i) => (m === k ? term(a, d, i) : a + (i * (l - a)) / (m - 1));
    for (let i = 0; i < m; i++) {
      const h = hi(val(i)), x = 40 + i * w;
      svgEl("rect", { x: x + 1, y: base - h, width: w - 2, height: h, fill: colour(0), opacity: 0.55, stroke: "var(--ink)", "stroke-width": 0.8 }, svg);
      if (flip) { const h2 = hi(val(m - 1 - i)); svgEl("rect", { x: x + 1, y: base - h - h2, width: w - 2, height: h2, fill: colour(1), opacity: 0.55, stroke: "var(--ink)", "stroke-width": 0.8 }, svg); }
    }
    svgEl("line", { x1: 30, y1: base, x2: 490, y2: base, stroke: "var(--line-strong)", "stroke-width": 2 }, svg);
    note.textContent = m < k ? t(`Dessin schématique : ${m} colonnes pour ${k} termes.`, `Schematic drawing: ${m} columns for ${k} terms.`) : "";
    if (flip) note.textContent += (note.textContent ? " " : "") + t("En orange, la même somme écrite à l’envers.", "In orange, the same sum written backwards.");
  }
  function drawRead() {
    read.innerHTML = added < k
      ? `${t("Termes additionnés :", "Terms added:")} <strong>${added}</strong> / ${k} · ${t("total provisoire :", "running total:")} <strong>${g(total)}</strong>`
      : `${t("Tous les termes sont additionnés :", "All the terms are added:")} <strong>${g(total)}</strong>. ${t("Peux-tu retrouver ce nombre sans tout additionner ?", "Can you find this number without adding everything?")}`;
    root.querySelector("#gs-add").disabled = root.querySelector("#gs-add10").disabled = added >= k;
  }
  const addTerms = (n) => { for (let s = 0; s < n && added < k; s++) { total += term(a, d, added); added++; } drawRead(); };
  tiles.addEventListener("click", (e) => {
    const b = e.target.closest(".cl-tok"); if (!b) return;
    const i = Number(b.dataset.i);
    if (pick === null) pick = i;
    else { if (pick !== i) { pairs = pairs.filter((p) => !p.includes(pick) && !p.includes(i)); pairs.push([pick, i]); if (pairs.length > 8) pairs.shift(); } pick = null; }
    drawTiles(); drawPairs();
    tiles.querySelector(`[data-i="${i}"]`)?.focus();
  });
  root.querySelector("#gs-add").addEventListener("click", () => addTerms(1));
  root.querySelector("#gs-add10").addEventListener("click", () => addTerms(10));
  root.querySelector("#gs-reset").addEventListener("click", () => { added = 0; total = 0; pick = null; pairs = []; drawTiles(); drawPairs(); drawRead(); });
  const off = onHintAction("gauss-sum", { flip: () => { flip = !flip; document.querySelector('[data-hint-act="flip"]')?.setAttribute("aria-pressed", String(flip)); drawStairs(); } });
  drawTiles(); drawPairs(); drawRead(); drawStairs();
  return off;
}
