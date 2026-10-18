// Hands-on activity of the hanoi challenge: the learner tries, fails and notices; it never states the answer or the method.
import { svgEl, colour, toLocal } from "../common/kit.js";

/* ----------------------------------------------------------------- hanoi */
export function activity(root, { t, reduced, q }) {
  const W = 480, H = 250, PEG = [90, 240, 390], BASE = 220, DH = 20;
  let n = Math.min(q.n, 8), pegs, moves, from = null, best = {};
  const reset = () => { pegs = [Array.from({ length: n }, (_, i) => n - i), [], []]; moves = 0; from = null; };
  root.innerHTML = `
    <p class="act-help">${t("Choisis une tige de départ puis une tige d’arrivée pour déplacer le disque du dessus. Un disque ne se pose jamais sur un disque plus petit.", "Pick a source peg then a target peg to move the top disk. A disk never sits on a smaller disk.")}</p>
    <svg class="act-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${t("Trois tiges et des disques", "Three pegs and some disks")}"></svg>
    <div class="act-buttons hn-pegs" role="group" aria-label="${t("Tiges", "Pegs")}">
      ${[1, 2, 3].map((i) => `<button class="btn btn-secondary hn-peg" data-peg="${i - 1}" type="button" aria-pressed="false">${t("Tige", "Peg")} ${i}</button>`).join("")}
    </div>
    <div class="act-controls">
      <label class="act-field" for="hn-n"><span class="act-label">${t("Nombre de disques", "Number of disks")} <output id="hn-out"></output></span><input id="hn-n" type="range" min="1" max="8" step="1" value="${n}"></label>
      <button class="btn-quiet" id="hn-undo" type="button">${t("Annuler le dernier coup", "Undo last move")}</button>
      <button class="btn-quiet" id="hn-reset" type="button">${t("Recommencer", "Restart")}</button>
    </div>
    <p class="act-readout" id="hn-read" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector("#hn-read"), history = [];
  function draw(msg = "") {
    svg.replaceChildren();
    svgEl("rect", { x: 20, y: BASE, width: W - 40, height: 8, rx: 4, class: "hn-base" }, svg);
    PEG.forEach((x, i) => {
      svgEl("rect", { x: x - 4, y: BASE - DH * 8.4, width: 8, height: DH * 8.4, rx: 4, class: `hn-pole${from === i ? " from" : ""}` }, svg);
      pegs[i].forEach((d, k) => {
        const w = 26 + d * 16, y = BASE - DH * (k + 1);
        const lift = from === i && k === pegs[i].length - 1;
        svgEl("rect", { x: x - w / 2, y: lift ? y - 22 : y, width: w, height: DH - 3, rx: 6, class: "hn-disk", style: `fill:${colour(d - 1)}` }, svg);
      });
    });
    root.querySelector("#hn-out").textContent = n;
    root.querySelectorAll(".hn-peg").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.peg) === from)));
    const done = pegs[1].length === n || pegs[2].length === n;
    const bt = best[n] ? ` ${t("Meilleur essai", "Best try")} : ${best[n]}.` : "";
    read.innerHTML = `${t("Coups", "Moves")} : <strong>${moves}</strong>.${done ? ` ${t("Pile déplacée en", "Stack moved in")} ${moves} ${t("coups.", "moves.")}` : ""}${bt} ${msg}`.trim();
  }
  function pick(i) {
    if (from === null) {
      if (!pegs[i].length) return draw(t("Cette tige est vide.", "That peg is empty."));
      from = i; return draw(t(`Disque ${pegs[i].at(-1)} soulevé. Choisis la tige d’arrivée.`, `Disk ${pegs[i].at(-1)} lifted. Choose the target peg.`));
    }
    if (i === from) { from = null; return draw(); }
    const d = pegs[from].at(-1);
    if (pegs[i].length && pegs[i].at(-1) < d) { const msg = t("Interdit : un disque ne se pose pas sur un plus petit.", "Not allowed: a disk cannot sit on a smaller one."); from = null; return draw(msg); }
    pegs[i].push(pegs[from].pop()); history.push([from, i]); from = null; moves += 1;
    const done = pegs[1].length === n || pegs[2].length === n;
    if (done) best[n] = Math.min(best[n] ?? Infinity, moves);
    draw();
  }
  root.querySelectorAll(".hn-peg").forEach((b) => b.addEventListener("click", () => pick(Number(b.dataset.peg))));
  svg.addEventListener("click", (e) => { const p = toLocal(svg, e); pick(PEG.reduce((bi, x, i) => (Math.abs(x - p.x) < Math.abs(PEG[bi] - p.x) ? i : bi), 0)); });
  root.querySelector("#hn-n").addEventListener("input", (e) => { n = Number(e.target.value); history.length = 0; reset(); draw(); });
  root.querySelector("#hn-reset").addEventListener("click", () => { history.length = 0; reset(); draw(); });
  root.querySelector("#hn-undo").addEventListener("click", () => {
    const m = history.pop(); if (!m) return;
    pegs[m[0]].push(pegs[m[1]].pop()); moves -= 1; from = null; draw();
  });
  void reduced;
  reset();
  draw();
  return () => {};
}
