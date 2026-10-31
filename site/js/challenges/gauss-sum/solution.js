// Animated solution of the gauss-sum challenge, a pure function of (step, progress): the sum as a staircase, the same
// staircase turned over and placed on top, the rectangle they form, and the sum as half of it. See common/player.js.
import { P, mid, ez } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { seg } from "../common/scene-kit.js";
import { parseSeries, lastTerm, seriesSum, groupDigits } from "./maths.js";

export const diagram = {
  size: [520, 360],
  dur: (step) => (step === 1 ? 4200 : step === 2 ? 6500 : 3600),
  steps: (q) => { const [a, d, k] = parseSeries(q.series), l = lastTerm(a, d, k), S = seriesSum(a, d, k), f = (n) => groupDigits(n, "fr"), e = (n) => groupDigits(n, "en"); return [
    P(`La somme dessinée en escalier : une colonne par terme, de ${f(a)} à ${f(l)}${k > 12 ? " (dessin schématique)" : ""}.`, `The sum drawn as a staircase: one column per term, from ${e(a)} to ${e(l)}${k > 12 ? " (schematic drawing)" : ""}.`),
    P("On retourne une copie de l’escalier et on la pose dessus : la plus haute colonne de la copie tombe sur la plus basse de l’original.", "Turn a copy of the staircase upside down and place it on top: the tallest column of the copy lands on the shortest one of the original."),
    P(`Chaque colonne mesure maintenant ${f(a)} + ${f(l)} = ${f(a + l)} : les deux escaliers forment un rectangle de ${k} colonnes, d’aire ${k} × ${f(a + l)}.`, `Every column is now ${e(a)} + ${e(l)} = ${e(a + l)} tall: the two staircases make a rectangle of ${k} columns, of area ${k} × ${e(a + l)}.`),
    P(`La somme est la moitié du rectangle : ${k} × ${f(a + l)} / 2 = ${f(S)}.`, `The sum is half the rectangle: ${k} × ${e(a + l)} / 2 = ${e(S)}.`),
  ]; },
  // The geometric staircase above, the same computation written in algebra below: line by line, in step with the drawing.
  draw(c, s, p, q) {
    const [a, d, k] = parseSeries(q.series), l = lastTerm(a, d, k), m = Math.min(k, 12), base = 172, w = 360 / m, g = (n) => groupDigits(n, c.t("fr", "en"));
    const val = (i) => (m === k ? a + i * d : a + (i * (l - a)) / (m - 1)), H = 128 / (a + l), hgt = (v) => v * H;
    const lift = s === 0 ? 0 : s === 1 ? ez(p) : 1, sweep = s === 2 ? Math.min(m - 1, Math.floor(seg01(p, 0.12, 0.9) * m)) : -1;
    for (let i = 0; i < m; i++) {
      const x = 60 + i * w, h = hgt(val(i)), on = i === sweep;
      c.rect(x + 1, base - h, w - 2, h, { fill: colour(0), opacity: 0.6, stroke: "var(--ink)", "stroke-width": 1 });
      if (s >= 1) {
        const h2 = hgt(val(m - 1 - i)), y = base - h - h2 - (1 - lift) * 30;
        c.rect(x + 1, y, w - 2, h2, { fill: colour(1), opacity: 0.6 * Math.max(0.3, lift), stroke: "var(--ink)", "stroke-width": 1 });
      }
      if (on) { c.rect(x + 1, base - 128, w - 2, 128, { fill: "none", stroke: "var(--accent)", "stroke-width": 3 }); c.text(x + w / 2, base - 134, g(a + l), { ...mid, class: "sol-line" }); }
    }
    c.line(40, base, 440, base, { stroke: "var(--line-strong)", "stroke-width": 2 });
    if (s >= 2) { c.rect(60, base - 128, 360, 128, { fill: "none", stroke: "var(--accent)", "stroke-width": 3, "stroke-dasharray": "8 5" }); c.text(480, base - 64, g(a + l), { ...mid, class: "sol-line" }); c.text(240, 22, `${k} ${c.t("colonnes", "columns")}`, { ...mid, class: "sol-sub" }); }
    // algebra
    const terms = (list) => (k <= 4 ? list : [list[0], list[1], list[2], "…", list.at(-1)]).join(" + ");
    const fwd = Array.from({ length: k }, (_, i) => g(a + i * d)), bwd = Array.from({ length: k }, (_, i) => g(l - i * d));
    const pairs = Array.from({ length: k }, (_, i) => `(${g(a + i * d)} + ${g(l - i * d)})`), sums = Array.from({ length: k }, () => g(a + l));
    const lines = [
      ["S", terms(fwd), 1],
      ["S", terms(bwd), s === 0 ? 0 : s === 1 ? seg01(p, 0.1, 0.7) : 1],
      ["2S", terms(pairs), s < 2 ? 0 : s === 2 ? seg01(p, 0, 0.35) : 1],
      ["2S", `${terms(sums)} = ${k} × ${g(a + l)}`, s < 2 ? 0 : s === 2 ? seg01(p, 0.4, 0.75) : 1],
      ["S", `${k} × ${g(a + l)} / 2 = ${g(seriesSum(a, d, k))}`, s < 3 ? 0 : s === 3 ? seg01(p, 0, 0.6) : 1],
    ];
    const longest = Math.max(...lines.map((ln) => ln[1].length)), size = Math.max(9, Math.min(15, 440 / (0.56 * longest)));
    lines.forEach(([lab, body, o], i) => {
      if (o <= 0) return; const y = 212 + i * 30, hot = i === 4;
      c.text(30, y, lab + " =", { opacity: o, style: `font:600 ${size}px var(--math, serif);fill:var(--ink)` });
      c.text(72, y, body, { opacity: o, style: `font:${hot ? 700 : 600} ${size}px var(--math, serif);fill:${hot ? "var(--accent)" : "var(--ink)"}` });
    });
  },
};
const seg01 = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
