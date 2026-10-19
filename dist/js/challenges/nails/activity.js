// Hands-on activity of the nails challenge: wind the string around the nails turn by turn, pull nails out and watch whether
// the picture holds. Hint actions write the winding as a word and list what is left for every choice of removed nails; the
// activity never states the shortest winding.
import { colour, onHintAction, svgEl } from "../common/kit.js";
import { parseNails, NAMES, falls, remaining, reduce, wordText, popcount } from "./maths.js";

export function activity(root, { t, q, reduced }) {
  const [n, k] = parseNails(q.nails), W = 100, H = 74, nx = (i) => 50 + (i - (n - 1) / 2) * (70 / Math.max(n, 2)), ny = 14;
  let word = [1, 2], removed = 0, level = 0, drop = 0, raf = 0;
  root.innerHTML = `
    <p class="act-help">${t("Ajoute des tours de ficelle autour des clous (↻ sens des aiguilles d’une montre, ↺ sens inverse), puis retire des clous pour tester : le tableau tient-il ?", "Add turns of string around the nails (↻ clockwise, ↺ anticlockwise), then pull nails out to test: does the picture hold?")}</p>
    <svg class="act-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${t("Clous, ficelle et tableau", "Nails, string and picture")}"></svg>
    <div class="act-controls nl-turns">${NAMES.slice(0, n).map((N, i) => `<button class="secondary" type="button" data-c="${i + 1}">↻ ${N}</button><button class="secondary" type="button" data-c="${-(i + 1)}">↺ ${N}</button>`).join("")}</div>
    <div class="act-controls nl-remove" role="group" aria-label="${t("Clous retirés", "Removed nails")}">${NAMES.slice(0, n).map((N, i) => `<button class="btn-quiet" type="button" data-r="${i}" aria-pressed="false">${t("Retirer", "Remove")} ${N}</button>`).join("")}<button class="btn-quiet" id="nl-undo" type="button">${t("Annuler le dernier tour", "Undo last turn")}</button><button class="btn-quiet" id="nl-clear" type="button">${t("Tout défaire", "Unwind all")}</button></div>
    <p class="act-readout" id="nl-read" role="status" aria-live="polite"></p>
    <div class="nl-table" id="nl-table" hidden></div>`;
  const svg = root.querySelector("svg"), read = root.querySelector("#nl-read"), table = root.querySelector("#nl-table");
  // the string: from the left corner of the frame, one loop per turn around its nail, to the right corner
  function stringPath(w) {
    const count = Array(n).fill(0);
    let d = "M30 44";
    w.forEach((c) => {
      const i = Math.abs(c) - 1, r = 3.2 + 1.1 * (count[i]++ % 4), x = nx(i), y = ny;
      // reach the left of the nail, go round it (clockwise: over the top first), come back to the left side
      d += ` L${x - r} ${y}`;
      d += c > 0 ? ` A${r} ${r} 0 1 1 ${x + r} ${y} A${r} ${r} 0 1 1 ${x - r} ${y}` : ` A${r} ${r} 0 1 0 ${x + r} ${y} A${r} ${r} 0 1 0 ${x - r} ${y}`;
    });
    return d + " L70 44";
  }
  function draw() {
    svg.replaceChildren();
    const fall = !word.length || falls(word, removed), y0 = fall ? drop : 0;
    for (let i = 0; i < n; i++) {
      const off = (removed >> i) & 1;
      svgEl("circle", { cx: nx(i), cy: ny, r: 1.6, fill: off ? "none" : "var(--ink)", stroke: "var(--ink)", "stroke-width": 0.4, "stroke-dasharray": off ? "0.8 0.6" : "" }, svg);
      svgEl("text", { x: nx(i), y: 6, "text-anchor": "middle", "font-size": 4, "font-weight": 700, fill: off ? "var(--muted)" : "var(--ink)" }, svg).textContent = NAMES[i];
    }
    const g = svgEl("g", { transform: `translate(0 ${y0})` }, svg);
    svgEl("path", { d: stringPath(fall || !removed ? word : remaining(word, removed)), fill: "none", stroke: colour(1), "stroke-width": 0.7, "stroke-linejoin": "round", opacity: 0.9 }, g);
    svgEl("rect", { x: 30, y: 44, width: 40, height: 26, rx: 1, fill: `color-mix(in srgb, ${colour(0)} 22%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 0.8 }, g);
    svgEl("path", { d: "M36 64l8-10 6 6 5-4 9 8z", fill: `color-mix(in srgb, ${colour(2)} 50%, var(--surface))` }, g);
    const left = remaining(word, removed);
    const state = !word.length ? t("La ficelle ne passe autour d’aucun clou : le tableau tombe.", "The string goes round no nail: the picture falls.") : fall ? t("Le tableau tombe !", "The picture falls!") : t("Le tableau tient.", "The picture holds.");
    read.innerHTML = `${t("Tours : ", "Turns: ")}<strong>${word.length}</strong> · ${t("clous retirés : ", "nails removed: ")}<strong>${popcount(removed)}</strong> · ${state}${level >= 1 ? ` · ${t("mot : ", "word: ")}<strong>${wordText(word)}</strong>${removed ? ` → ${wordText(left)} → ${wordText(reduce(left))}` : ""}` : ""}`;
    table.hidden = level < 2;
    if (level >= 2) {
      const rows = [];
      for (let m = 0; m < 1 << n; m++) {
        const off = NAMES.slice(0, n).filter((_, i) => (m >> i) & 1).join(" ") || "-", r = reduce(remaining(word, m)), want = popcount(m) >= k, got = word.length > 0 && r.length === 0;
        rows.push(`<tr class="${want === got ? "" : "nl-bad"}"><td>${off}</td><td>${wordText(r)}</td><td>${got ? t("tombe", "falls") : t("tient", "holds")}</td><td>${want ? t("doit tomber", "must fall") : t("doit tenir", "must hold")}</td></tr>`);
      }
      table.innerHTML = `<table><thead><tr><th>${t("Retirés", "Removed")}</th><th>${t("Ce qui reste", "What is left")}</th><th>${t("Tableau", "Picture")}</th><th>${t("Règle", "Rule")}</th></tr></thead><tbody>${rows.join("")}</tbody></table>`;
    }
  }
  function animateFall() {
    cancelAnimationFrame(raf); drop = 0;
    if (word.length && !falls(word, removed)) { draw(); return; }
    if (reduced) { drop = 30; draw(); return; }
    const start = performance.now();
    const step = (now) => { const s = Math.min(1, (now - start) / 600); drop = 30 * s * s; draw(); if (s < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  }
  root.querySelector(".nl-turns").addEventListener("click", (e) => { const c = Number(e.target.closest("[data-c]")?.dataset.c); if (!c) return; word = [...word, c]; animateFall(); });
  root.querySelector(".nl-remove").addEventListener("click", (e) => { const b = e.target.closest("[data-r]"); if (!b) return; removed ^= 1 << Number(b.dataset.r); b.setAttribute("aria-pressed", String(!!((removed >> Number(b.dataset.r)) & 1))); animateFall(); });
  root.querySelector("#nl-undo").addEventListener("click", () => { word = word.slice(0, -1); animateFall(); });
  root.querySelector("#nl-clear").addEventListener("click", () => { word = []; animateFall(); });
  root.querySelector("#nl-reset")?.addEventListener("click", () => { word = [1, 2]; animateFall(); });
  draw();
  const off = onHintAction("nails", { word: () => { level = Math.max(level, 1); draw(); }, table: () => { level = 2; draw(); } });
  return () => { cancelAnimationFrame(raf); off(); };
}
