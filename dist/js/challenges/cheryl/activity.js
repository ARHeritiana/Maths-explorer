// Hands-on activity of Cheryl's birthday: the ten dates in a calendar grid; the learner crosses dates out sentence by
// sentence. Hint actions mark the days that appear only once and offer to cross out the dates of each sentence in turn.
import { onHintAction } from "../common/kit.js";
import { CHERYL_SETS, cherylSteps, uniqueDays, MONTHS } from "./maths.js";

export function activity(root, { t, q, lang }) {
  const D = CHERYL_SETS[q.set], L = lang === "fr" ? 0 : 1, steps = cherylSteps(D), u = uniqueDays(D);
  const months = [...new Set(D.map((d) => d[0]))], days = [...new Set(D.map((d) => d[1]))].sort((a, b) => a - b);
  let crossed = new Set(), level = 0, applied = 0;
  const key = (d) => d.join("-");
  root.innerHTML = `
    <p class="act-help">${t("Touche une date pour la barrer (ou la rétablir). Lis les trois phrases une par une et barre les dates qu’elles éliminent.", "Tap a date to cross it out (or bring it back). Read the three sentences one at a time and cross out the dates they rule out.")}</p>
    <ol class="ch-says">
      <li><strong>Albert</strong>${t(" : ", ": ")}${t("« Je ne sais pas, mais je sais que Bernard ne sait pas non plus. »", "“I don’t know, but I know that Bernard doesn’t know either.”")}</li>
      <li><strong>Bernard</strong>${t(" : ", ": ")}${t("« Au début, je ne savais pas, mais maintenant je sais. »", "“At first I didn’t know, but now I know.”")}</li>
      <li><strong>Albert</strong>${t(" : ", ": ")}${t("« Alors moi aussi, je sais. »", "“Then I also know.”")}</li>
    </ol>
    <div class="ch-grid" role="grid" aria-label="${t("Dates possibles", "Possible dates")}"></div>
    <div class="act-controls"><button class="secondary" id="ch-next" type="button" hidden></button><button class="btn-quiet" id="ch-reset" type="button">${t("Tout rétablir", "Bring all back")}</button></div>
    <p class="act-readout" id="ch-read" role="status" aria-live="polite"></p>`;
  const grid = root.querySelector(".ch-grid"), read = root.querySelector("#ch-read"), next = root.querySelector("#ch-next");
  function draw() {
    grid.style.gridTemplateColumns = `minmax(5.5em, auto) repeat(${days.length}, minmax(0, 1fr))`;
    let html = `<span></span>${days.map((d) => `<span class="ch-day${level >= 1 && u.includes(d) ? " is-unique" : ""}">${d}</span>`).join("")}`;
    for (const m of months) {
      html += `<span class="ch-month">${MONTHS[m][L]}</span>`;
      for (const d of days) {
        const has = D.some((x) => x[0] === m && x[1] === d), k = key([m, d]);
        html += has ? `<button type="button" class="ch-date${crossed.has(k) ? " is-crossed" : ""}${level >= 1 && u.includes(d) ? " is-unique" : ""}" data-k="${k}" aria-pressed="${crossed.has(k)}" aria-label="${L ? `${MONTHS[m][1]} ${d}` : `${d} ${MONTHS[m][0]}`}">${d}</button>` : `<span class="ch-empty"></span>`;
      }
    }
    grid.innerHTML = html;
    const left = D.filter((d) => !crossed.has(key(d)));
    next.hidden = level < 2 || applied >= 3;
    next.textContent = t(`Appliquer la phrase ${applied + 1}`, `Apply sentence ${applied + 1}`);
    read.innerHTML = `${t("Dates encore possibles : ", "Dates still possible: ")}<strong>${left.length}</strong>${left.length === 1 ? ` · ${t("une seule date reste !", "a single date is left!")}` : ""}${level >= 1 ? ` · ${t("jours uniques : ", "unique days: ")}${u.join(", ")}` : ""}`;
  }
  grid.addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (!b) return; const k = b.dataset.k; crossed.has(k) ? crossed.delete(k) : crossed.add(k); draw(); grid.querySelector(`[data-k="${k}"]`)?.focus(); });
  next.addEventListener("click", () => { applied++; crossed = new Set(D.filter((d) => !steps[applied].some((x) => key(x) === key(d))).map(key)); draw(); });
  root.querySelector("#ch-reset").addEventListener("click", () => { crossed = new Set(); applied = 0; draw(); });
  draw();
  const off = onHintAction("cheryl", { unique: () => { level = Math.max(level, 1); draw(); }, steps: () => { level = 2; draw(); } });
  return () => off();
}
