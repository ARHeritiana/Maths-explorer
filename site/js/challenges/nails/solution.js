// Animated solution of the nails challenge, a pure function of (step, progress): the winding as a word, a nail pulled out
// erases its letters, the word cancels or not, and the shortest winding of the variation. See common/player.js.
import { P, mid } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { SHORTEST, parseNails, NAMES, reduce, remaining, wordText } from "./maths.js";

export const diagram = {
  size: [520, 300],
  steps: (q) => { const [n, k] = parseNails(q.nails), w = SHORTEST[q.nails]; return [
    P(`${n} clous ${NAMES.slice(0, n).join(", ")}. On note A un tour de A dans le sens des aiguilles d’une montre, A⁻¹ un tour dans l’autre sens : un enroulement devient un mot.`, `${n} nails ${NAMES.slice(0, n).join(", ")}. Write A for a clockwise turn around A, A⁻¹ for a turn the other way: a winding becomes a word.`),
    P("Retirer un clou efface ses lettres. Deux lettres voisines X X⁻¹ s’annulent : le tableau tombe quand tout s’annule.", "Removing a nail erases its letters. Two neighbouring letters X X⁻¹ cancel: the picture falls when everything cancels."),
    P(`Un enroulement de ${w.length} tours qui convient : ${wordText(w)}.`, `A winding of ${w.length} turns that works: ${wordText(w)}.`),
    P(`Vérifions chaque choix de clous retirés : il tombe exactement quand ${k === n ? `les ${n} sont retirés` : k === 1 ? "au moins un est retiré" : `au moins ${k} sont retirés`}.`, `Check every choice of removed nails: it falls exactly when ${k === n ? `all ${n} are removed` : k === 1 ? "at least one is removed" : `at least ${k} are removed`}.`),
    P(`Aucun mot plus court ne convient (raisonnement sur les exposants, confirmé par une recherche exhaustive) : réponse ${w.length}.`, `No shorter word works (an argument on the exponents, confirmed by an exhaustive search): answer ${w.length}.`),
  ]; },
  draw(c, s, p, q) {
    const [n] = parseNails(q.nails), w = SHORTEST[q.nails];
    const shown = s === 0 ? [1, 2, -1].filter((x) => Math.abs(x) <= n) : s === 1 ? [1, 2, -2, -1] : w;
    // the word as tiles
    const tile = 34, x0 = 260 - (shown.length * tile) / 2;
    shown.forEach((x, i) => {
      const gone = s === 1 && p > 0.5 && (i === 1 || i === 2);
      c.rect(x0 + i * tile + 2, 40, tile - 4, 34, { rx: 6, fill: `color-mix(in srgb, ${colour(Math.abs(x) - 1)} ${gone ? 10 : 35}%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 1.2, opacity: gone ? 0.35 : 1 });
      c.text(x0 + i * tile + tile / 2, 63, NAMES[Math.abs(x) - 1] + (x < 0 ? "⁻¹" : ""), { ...mid, class: "sol-label" });
    });
    if (s === 1) c.text(260, 100, p > 0.5 ? "A B B⁻¹ A⁻¹ → A A⁻¹ → 1" : "A B B⁻¹ A⁻¹", { ...mid, class: "sol-line" });
    if (s >= 3) {
      // table of removals
      const rows = Math.min(16, 1 << n), rh = Math.min(22, 170 / rows);
      for (let m = 0; m < rows; m++) {
        const y = 108 + m * rh, r = reduce(remaining(w, m)), off = NAMES.slice(0, n).filter((_, i) => (m >> i) & 1).join(" ") || c.t("aucun", "none");
        if (s === 3 && m / rows > p + 0.05) break;
        c.text(150, y, off, { ...mid, class: "sol-small" });
        c.text(280, y, wordText(r), { ...mid, class: "sol-small" });
        c.text(410, y, r.length ? c.t("tient", "holds") : c.t("tombe", "falls"), { ...mid, class: "sol-small", fill: r.length ? "var(--pos)" : "var(--neg)" });
      }
    }
    if (s === 4) c.text(470, 270, String(w.length), { ...mid, class: "sol-hot" });
  },
};
