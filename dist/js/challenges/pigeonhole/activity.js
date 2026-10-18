// Hands-on activity of the pigeonhole challenge: the learner tries, fails and notices; it never states the answer or the method.
import { formatNumber } from "../../math.js";
import { MINUS, onHintAction, colour } from "../common/kit.js";

export const fmtFor = (lang) => (n, d = 2) => formatNumber(Math.abs(n) < 1e-12 ? 0 : n, lang, d).replace(/-/g, MINUS);

/* -------------------------------------------------------------- pigeonhole */
export function activity(root, { t, lang, q }) {
  const MAX = 60, MOD = q.m;
  const fmt = fmtFor(lang);
  const sel = new Set();
  let best = 0;
  root.innerHTML = `
    <p class="act-help">${t(`Choisis des nombres en les touchant. Le but : en choisir le plus possible sans qu’aucune paire n’ait une différence multiple de ${MOD}.`, `Pick numbers by tapping them. The aim: pick as many as you can without any pair having a difference that is a multiple of ${MOD}.`)}</p>
    <div class="pick-grid" id="pg-grid" role="group" aria-label="${t("Entiers de 1 à 60", "Integers from 1 to 60")}">${Array.from({ length: MAX }, (_, i) => `<button type="button" class="pick" data-n="${i + 1}" aria-pressed="false">${i + 1}</button>`).join("")}</div>
    <p class="act-readout" id="pg-read" role="status" aria-live="polite"></p>
    <div class="act-controls">
      <button class="btn btn-secondary" id="pg-clear" type="button">${t("Tout effacer", "Clear all")}</button>
      <label class="act-field" for="pg-k"><span class="act-label">${t("Tirage au hasard de", "Random draw of")} <output id="pg-kout">6</output> ${t("nombres", "numbers")}</span><input id="pg-k" type="range" min="2" max="10" value="6"></label>
      <button class="btn btn-secondary" id="pg-sim" type="button">${t("Faire 1 000 tirages", "Run 1,000 draws")}</button>
    </div>
    <p class="act-readout" id="pg-sim-read" role="status" aria-live="polite"></p>`;
  const grid = root.querySelector("#pg-grid");
  const pairOf = (set) => {
    const a = [...set].sort((x, y) => x - y);
    const bad = new Set();
    let first = null;
    for (let i = 0; i < a.length; i++)
      for (let j = i + 1; j < a.length; j++)
        if ((a[j] - a[i]) % MOD === 0) {
          bad.add(a[i]);
          bad.add(a[j]);
          first ??= [a[i], a[j]];
        }
    return { bad, first };
  };
  let showRem = false;   // hint 1: colour every number by its remainder
  function render() {
    const { bad, first } = pairOf(sel);
    grid.querySelectorAll(".pick").forEach((b) => {
      const n = Number(b.dataset.n);
      if (showRem) { b.dataset.rem = n % MOD; b.style.setProperty("--rem", colour(n % MOD)); }
      b.setAttribute("aria-pressed", String(sel.has(n)));
      b.classList.toggle("clash", bad.has(n));
    });
    if (!first && sel.size > best) best = sel.size;
    const count = sel.size;
    root.querySelector("#pg-read").textContent = first
      ? `${count} ${t("nombres choisis.", "numbers chosen.")} ${t("Paire trouvée", "Pair found")} : ${first[1]} ${MINUS} ${first[0]} = ${first[1] - first[0]} = ${MOD} × ${(first[1] - first[0]) / MOD}.`
      : `${count} ${t(`nombres choisis, aucune paire dont la différence soit un multiple de ${MOD}.`, `numbers chosen, no pair whose difference is a multiple of ${MOD}.`)}${best ? ` ${t("Ton record sans paire", "Your best without a pair")} : ${best}.` : ""}`;
  }
  grid.addEventListener("click", (e) => {
    const b = e.target.closest(".pick");
    if (!b) return;
    const n = Number(b.dataset.n);
    if (sel.has(n)) sel.delete(n);
    else sel.add(n);
    render();
  });
  root.querySelector("#pg-clear").addEventListener("click", () => {
    sel.clear();
    render();
  });
  root.querySelector("#pg-k").addEventListener("input", (e) => (root.querySelector("#pg-kout").textContent = e.target.value));
  root.querySelector("#pg-sim").addEventListener("click", () => {
    const k = Number(root.querySelector("#pg-k").value);
    let free = 0;
    for (let run = 0; run < 1000; run++) {
      const pool = Array.from({ length: MAX }, (_, i) => i + 1);
      const draw = new Set();
      while (draw.size < k) draw.add(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
      if (!pairOf(draw).first) free++;
    }
    root.querySelector("#pg-sim-read").textContent = `${t("Sur 1 000 tirages de", "Out of 1,000 draws of")} ${k} ${t("nombres", "numbers")} : ${free} ${t("sans aucune paire de ce type", "with no such pair")} (${fmt((free / 1000) * 100, 1)} %). ${t("Une simulation suggère, elle ne prouve pas.", "A simulation suggests; it does not prove.")}`;
  });
  render();
  return onHintAction("pigeonhole", { remainders: () => { showRem = true; render(); } });
}
