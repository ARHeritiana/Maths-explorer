// Animated solution of the gauss-sum challenge, a pure function of (step, progress): the sum as a staircase, the same
// staircase turned over and placed on top, the rectangle they form, and the sum as half of it. See common/player.js.
import { P, mid, ez } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { parseSeries, lastTerm, seriesSum, groupDigits } from "./maths.js";

export const diagram = {
  size: [520, 300],
  dur: (step) => (step === 1 ? 4200 : 3400),
  steps: (q) => { const [a, d, k] = parseSeries(q.series), l = lastTerm(a, d, k), S = seriesSum(a, d, k), f = (n) => groupDigits(n, "fr"), e = (n) => groupDigits(n, "en"); return [
    P(`La somme dessinée en escalier : une colonne par terme, de ${f(a)} à ${f(l)}${k > 12 ? " (dessin schématique)" : ""}.`, `The sum drawn as a staircase: one column per term, from ${e(a)} to ${e(l)}${k > 12 ? " (schematic drawing)" : ""}.`),
    P("On retourne une copie de l’escalier et on la pose dessus : la plus haute colonne de la copie tombe sur la plus basse de l’original.", "Turn a copy of the staircase upside down and place it on top: the tallest column of the copy lands on the shortest one of the original."),
    P(`Chaque colonne mesure maintenant ${f(a)} + ${f(l)} = ${f(a + l)} : les deux escaliers forment un rectangle de ${k} colonnes, d’aire ${k} × ${f(a + l)}.`, `Every column is now ${e(a)} + ${e(l)} = ${e(a + l)} tall: the two staircases make a rectangle of ${k} columns, of area ${k} × ${e(a + l)}.`),
    P(`La somme est la moitié du rectangle : ${k} × ${f(a + l)} / 2 = ${f(S)}.`, `The sum is half the rectangle: ${k} × ${e(a + l)} / 2 = ${e(S)}.`),
  ]; },
  draw(c, s, p, q) {
    const [a, d, k] = parseSeries(q.series), l = lastTerm(a, d, k), m = Math.min(k, 12), base = 250, w = 360 / m;
    const val = (i) => (m === k ? a + i * d : a + (i * (l - a)) / (m - 1)), H = 200 / (a + l), hgt = (v) => v * H;
    const lift = s === 0 ? 0 : s === 1 ? ez(p) : 1;
    for (let i = 0; i < m; i++) {
      const x = 60 + i * w, h = hgt(val(i));
      c.rect(x + 1, base - h, w - 2, h, { fill: colour(0), opacity: 0.6, stroke: "var(--ink)", "stroke-width": 1 });
      if (s >= 1) {
        const h2 = hgt(val(m - 1 - i)), y = base - h - h2 - (1 - lift) * 40;
        c.rect(x + 1, y, w - 2, h2, { fill: colour(1), opacity: 0.6 * Math.max(0.3, lift), stroke: "var(--ink)", "stroke-width": 1 });
      }
    }
    c.line(40, base, 440, base, { stroke: "var(--line-strong)", "stroke-width": 2 });
    if (s >= 2) { c.rect(60, base - 200, 360, 200, { fill: "none", stroke: "var(--accent)", "stroke-width": 3, "stroke-dasharray": "8 5" }); c.text(470, base - 100, groupDigits(a + l, c.t("fr", "en")), { ...mid, class: "sol-line" }); c.text(240, 30, `${k} ${c.t("colonnes", "columns")}`, { ...mid, class: "sol-sub" }); }
    if (s === 3) c.text(470, 60, groupDigits(seriesSum(a, d, k), c.t("fr", "en")), { ...mid, class: "sol-hot" });
  },
};
