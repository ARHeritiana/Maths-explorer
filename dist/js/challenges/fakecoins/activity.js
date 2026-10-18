// Hands-on activity of the fakecoins challenge: the learner tries, fails and notices; it never states the answer or the method.
import { onHintAction, MINUS, clamp } from "../common/kit.js";
import { minSample, identifies } from "./maths.js";

/* ------------------------------------------------------------ fake coins */
export function activity(root, { t, q }) {
  const N = q.n;
  let counts, fake, weighed, reading, solved;
  const fresh = () => { counts = Array(N).fill(0); fake = Math.floor(Math.random() * N); weighed = 0; reading = null; solved = false; };
  root.innerHTML = `
    <p class="act-help">${t("Choisis combien de pièces prendre dans chaque pile, puis pèse (les vraies pèsent 10 g, les fausses 9 g). Un seul pesage est autorisé dans l’énoncé : ici on les compte. Ensuite, désigne la pile fausse.", "Choose how many coins to take from each pile, then weigh (genuine coins weigh 10 g, fake ones 9 g). The problem allows one weighing: here they are counted. Then name the fake pile.")}</p>
    <div class="fc-piles" id="fc-piles"></div>
    <div class="act-buttons" style="margin-top:10px"><button class="btn btn-primary" id="fc-weigh" type="button">${t("Peser", "Weigh")}</button><button class="btn-quiet" id="fc-zero" type="button">${t("Tout à zéro", "All to zero")}</button><button class="btn-quiet" id="fc-new" type="button">${t("Nouvelle pile fausse", "New fake pile")}</button></div>
    <p class="act-readout" id="fc-read" role="status" aria-live="polite"></p>
    <div class="act-buttons" id="fc-guess" role="group" aria-label="${t("Quelle pile est fausse ?", "Which pile is fake?")}"></div>`;
  const piles = root.querySelector("#fc-piles"), read = root.querySelector("#fc-read"), guess = root.querySelector("#fc-guess");
  piles.innerHTML = Array.from({ length: N }, (_, i) => `<div class="fc-row"><span class="fc-name">${t("Pile", "Pile")} ${i + 1}</span><button type="button" class="btn-quiet fc-step" data-i="${i}" data-d="-1" aria-label="${t("Une pièce de moins, pile", "One coin fewer, pile")} ${i + 1}">${MINUS}</button><output class="fc-count" id="fc-c${i}">0</output><button type="button" class="btn-quiet fc-step" data-i="${i}" data-d="1" aria-label="${t("Une pièce de plus, pile", "One coin more, pile")} ${i + 1}">+</button></div>`).join("");
  function draw(msg = "") {
    counts.forEach((c, i) => { root.querySelector(`#fc-c${i}`).textContent = c; });
    const total = counts.reduce((a, b) => a + b, 0);
    guess.innerHTML = reading === null || solved ? "" : Array.from({ length: N }, (_, i) => `<button type="button" class="btn btn-secondary fc-g" data-i="${i}">${i + 1}</button>`).join("");
    read.innerHTML = msg || `${t("Pièces sur la balance", "Coins on the scale")} : <strong>${total}</strong>${reading !== null ? ` · ${t("balance", "scale")} : <strong>${reading} g</strong> (${t("attendu si tout est vrai", "expected if all genuine")} : ${total * 10} g)` : ""}${weighed ? ` · ${t("Pesées", "Weighings")} : ${weighed}` : ""}`;
  }
  root.addEventListener("click", (e) => {
    const s = e.target.closest(".fc-step"); if (s) { const i = Number(s.dataset.i); counts[i] = clamp(counts[i] + Number(s.dataset.d), 0, N); reading = null; draw(); root.querySelector(`.fc-step[data-i="${i}"][data-d="${s.dataset.d}"]`)?.focus(); return; }
    const g = e.target.closest(".fc-g"); if (g) {
      const i = Number(g.dataset.i); solved = i === fake;
      const total = counts.reduce((a, b) => a + b, 0);
      draw(solved ? `<strong>${t("Exact !", "Correct!")}</strong> ${t(`C’était la pile ${fake + 1} : le manque était de ${counts[fake]} g.`, `It was pile ${fake + 1}: the shortfall was ${counts[fake]} g.`)} ${total === minSample(N) ? t(`Avec ${total} pièces, c’est le minimum.`, `With ${total} coins, that is the minimum.`) : total > minSample(N) ? t(`Tu as utilisé ${total} pièces ; on peut en utiliser seulement ${minSample(N)}.`, `You used ${total} coins; ${minSample(N)} are enough.`) : ""}` : `${t("Non.", "No.")} ${identifies(counts) ? "" : t("Ta répartition donne le même manque pour deux piles : essaie des nombres tous différents.", "Your design gives the same shortfall for two piles: try numbers that are all different.")}`);
    }
  });
  root.querySelector("#fc-weigh").addEventListener("click", () => { weighed++; reading = 10 * counts.reduce((a, b) => a + b, 0) - counts[fake]; solved = false; draw(); });
  root.querySelector("#fc-zero").addEventListener("click", () => { counts = Array(N).fill(0); reading = null; draw(); });
  root.querySelector("#fc-new").addEventListener("click", () => { fresh(); draw(); });
  fresh(); draw();
  return onHintAction("fakecoins", { fill: () => { counts = Array.from({ length: N }, (_, i) => i + 1); reading = null; draw(); } });
}
