// Hands-on activity of the factorials challenge: the factors 1 to n as tiles; tapping a tile removes one factor p from it.
import { goalLine } from "../common/kit.js";
import { cartoonPress } from "../common/cartoon.js";
import { primeFactors } from "./maths.js";
export function activity(root, { t, q, reduced }) {
  const relevant = q.kind === 'zeros' ? primeFactors(q.base).map(([p]) => Number(p)) : [];
  let prime = relevant.length ? relevant.at(-1) : q.p;
  let removed = 0; const n = Math.min(q.n, 100), values = Array.from({ length: n }, (_, i) => BigInt(i + 1));
  root.innerHTML = `${goalLine(t, `Retire de la factorielle tous les facteurs ${prime}.`, `Remove every factor ${prime} from the factorial.`, `Touche un facteur divisible par ${prime} pour en retirer un facteur ${prime}. Entrée ou Espace fonctionne aussi. Les valeurs changent, pas les autres facteurs.`, `Tap a factor divisible by ${prime} to remove one factor ${prime}. Enter or Space works too. Values change; other factors do not.`)}${relevant.length > 1 ? `<label class="act-field"><span>${t("Nombre premier de la base à observer", "Prime divisor of the base to inspect")}</span><select data-prime>${relevant.map(p => `<option value="${p}" ${p === prime ? "selected" : ""}>${p}</option>`).join("")}</select></label>` : ""}<div class="act-controls" data-factors style="display:flex;flex-wrap:wrap"></div><button type="button" data-reset>${t("Restaurer les facteurs", "Restore factors")}</button><p class="act-readout" data-count role="status" aria-live="polite"></p><p class="muted">${q.n > 100 ? t("La manipulation affiche les 100 premiers facteurs seulement ; le calcul exact utilise tout n.", "The activity shows the first 100 factors only; exact calculation uses all of n.") : ""}</p>`;
  const tiles = root.querySelector("[data-factors]"), count = root.querySelector("[data-count]"), buttons = [];
  values.forEach((_, i) => { const b = document.createElement("button"); b.type = "button"; b.style.minWidth = "44px"; b.style.minHeight = "44px"; b.onclick = () => { if (values[i] % BigInt(prime) === 0n) { values[i] /= BigInt(prime); removed++; draw(); } else count.textContent = t("Ce facteur n’est pas divisible par le nombre premier choisi.", "This factor is not divisible by the chosen prime."); }; tiles.append(b); buttons.push(b); });
  function draw() {
    root.querySelector(".act-help .sr-only").textContent = t(`Touche un facteur divisible par ${prime} pour en retirer un facteur ${prime}. Entrée ou Espace fonctionne aussi. Les valeurs changent, pas les autres facteurs.`, `Tap a factor divisible by ${prime} to remove one factor ${prime}. Enter or Space works too. Values change; other factors do not.`);
    buttons.forEach((b, i) => { b.textContent = String(values[i]); b.setAttribute("aria-label", `${t("Facteur initial", "Original factor")} ${i + 1}: ${values[i]}`); });
    count.textContent = `${t("Facteurs retirés par toi", "Factors you removed")}: ${removed}${!n ? ` · 0! = 1` : ""}`;
  }
  const primeChoice = root.querySelector("[data-prime]");
  if (primeChoice) primeChoice.onchange = () => { prime = Number(primeChoice.value); values.forEach((_, i) => { values[i] = BigInt(i + 1); }); removed = 0; draw(); };
  root.querySelector("[data-reset]").onclick = () => { values.forEach((_, i) => { values[i] = BigInt(i + 1); }); removed = 0; draw(); };
  const unpress = cartoonPress(root, reduced); draw(); return unpress;
}
