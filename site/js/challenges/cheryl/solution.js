// Animated solution of Cheryl's birthday, a pure function of (step, progress): the calendar grid, the unique days, then the
// dates crossed out by each sentence until one is left. See common/player.js.
import { P, ez, mid } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { CHERYL_SETS, cherylSteps, uniqueDays, cherylAnswer, MONTHS, dateText } from "./maths.js";

export const diagram = {
  size: [520, 300],
  steps: (q) => { const D = CHERYL_SETS[q.set], u = uniqueDays(D), a = cherylAnswer(D); return [
    P("Les dix dates, mois en lignes, jours en colonnes. Albert connaît la ligne, Bernard la colonne.", "The ten dates, months in rows, days in columns. Albert knows the row, Bernard the column."),
    P(`Les jours ${u.join(" et ")} sont seuls dans leur colonne : avec l’un d’eux, Bernard saurait tout de suite.`, `The days ${u.join(" and ")} are alone in their column: with one of them, Bernard would know at once.`),
    P("Phrase 1 : Albert sait que Bernard ne sait pas, donc sa ligne ne contient aucun de ces jours. On barre ces lignes entières.", "Sentence 1: Albert knows Bernard doesn’t know, so his row contains none of these days. Cross out those whole rows."),
    P("Phrase 2 : Bernard sait maintenant, donc sa colonne n’a plus qu’une date. On barre les colonnes qui en ont encore plusieurs.", "Sentence 2: Bernard now knows, so his column has a single date left. Cross out the columns that still have several."),
    P(`Phrase 3 : Albert sait aussi, donc sa ligne n’a plus qu’une date : le ${dateText(a, 0)}.`, `Sentence 3: Albert knows too, so his row has a single date left: ${dateText(a, 1)}.`),
  ]; },
  draw(c, s, p, q) {
    const D = CHERYL_SETS[q.set], st = cherylSteps(D), u = uniqueDays(D), L = c.t(0, 1);
    const months = [...new Set(D.map((d) => d[0]))], days = [...new Set(D.map((d) => d[1]))].sort((a, b) => a - b);
    const cw = Math.min(52, 360 / days.length), rh = 46, x0 = 140, y0 = 64;
    days.forEach((d, j) => c.text(x0 + j * cw + cw / 2, y0 - 14, String(d), { ...mid, class: "sol-label", fill: s >= 1 && u.includes(d) ? colour(3) : "var(--ink)" }));
    months.forEach((m, i) => c.text(x0 - 12, y0 + i * rh + 28, MONTHS[m][L], { class: "sol-label", "text-anchor": "end" }));
    const alive = s <= 1 ? st[0] : st[Math.min(3, s - 1)], before = s <= 2 ? st[0] : st[s - 2];
    for (const d of D) {
      const i = months.indexOf(d[0]), j = days.indexOf(d[1]), x = x0 + j * cw, y = y0 + i * rh;
      const keep = alive.some((a) => a[0] === d[0] && a[1] === d[1]), was = before.some((a) => a[0] === d[0] && a[1] === d[1]);
      const fade = keep ? 1 : was ? 1 - 0.75 * ez(p) : 0.25;
      c.rect(x + 3, y + 6, cw - 6, rh - 10, { rx: 6, fill: `color-mix(in srgb, ${colour(0)} ${keep ? 30 : 8}%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 1.2, opacity: fade });
      c.text(x + cw / 2, y + 32, String(d[1]), { ...mid, class: "sol-label", opacity: fade });
      if (!keep && (!was || p > 0.5)) c.line(x + 6, y + 10, x + cw - 6, y + rh - 8, { stroke: "var(--neg)", "stroke-width": 2, opacity: was ? ez(p) : 0.6 });
    }
    if (s === 4) c.text(470, 280, String(cherylAnswer(D)[1]), { ...mid, class: "sol-hot" });
  },
};
