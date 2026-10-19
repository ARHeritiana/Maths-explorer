// Animated solution of the sum and product puzzle, a pure function of (step, progress): the map of all pairs (x, y), then the
// pairs kept by each sentence of the dialogue. See common/player.js.
import { P, ez, mid } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { spSteps, spSolution } from "./maths.js";

export const diagram = {
  size: [520, 300],
  steps: (q) => { const st = spSteps(q.N), s = spSolution(q.N); return [
    P(`Tous les couples 1 < x < y avec x + y ≤ ${q.N} : ${st[0].length} points.`, `All pairs 1 < x < y with x + y ≤ ${q.N}: ${st[0].length} dots.`),
    P(`Paula ne sait pas : son produit a plusieurs décompositions. Il reste ${st[1].length} couples.`, `Paula doesn’t know: her product has several splits. ${st[1].length} pairs remain.`),
    P(`Sam savait : toutes les décompositions de sa somme ont un produit ambigu. Il reste ${st[2].length} couples, sur quelques sommes seulement.`, `Sam knew: every split of his sum has an ambiguous product. ${st[2].length} pairs remain, on a few sums only.`),
    P(`Paula sait maintenant : parmi ses décompositions, une seule a une somme permise. Il reste ${st[3].length} couples.`, `Paula now knows: among her splits only one has an allowed sum. ${st[3].length} pairs remain.`),
    s ? P(`Sam sait aussi : sa somme n’a plus qu’une décomposition, (${s[0]} ; ${s[1]}). Produit ${s[0] * s[1]}.`, `Sam knows too: his sum has a single split left, (${s[0]}, ${s[1]}). Product ${s[0] * s[1]}.`) : P("Aucun couple ne survit : le dialogue est impossible avec cette borne. Réponse 0.", "No pair survives: the dialogue is impossible with this bound. Answer 0."),
  ]; },
  draw(c, s, p, q) {
    const N = q.N, st = spSteps(N), xmax = Math.floor((N - 1) / 2), ymax = N - 2;
    const PX = (v) => 40 + ((v - 2) / (xmax - 2 || 1)) * 440, PY = (v) => 270 - ((v - 3) / (ymax - 3 || 1)) * 240;
    const now = new Set(st[s].map(String)), prev = new Set(st[Math.max(0, s - 1)].map(String)), r = N > 120 ? 1.1 : 1.8;
    // the first two sets have thousands of pairs: draw their region (the triangle of the constraints), dots from step 2 on
    if (s <= 1) {
      c.path(`M${PX(2)},${PY(3)} L${PX(xmax)},${PY(N - xmax)} L${PX(2)},${PY(ymax)} Z`, { fill: `color-mix(in srgb, ${colour(0)} ${s ? 22 : 32}%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 1.2 });
      c.text(PX(2) + 70, PY(ymax) + 60, `${st[s].length} ${c.t("couples", "pairs")}`, { class: "sol-line" });
    }
    for (const pt of s <= 1 ? [] : s === 2 ? st[2] : st[s - 1]) {
      const k = String(pt), on = now.has(k), was = prev.has(k);
      if (!was && !on) continue;
      const a = on ? 1 : 1 - ez(p);
      c.circ(PX(pt[0]), PY(pt[1]), on && s >= 3 ? r * 2.2 : r, { fill: on ? colour(0) : "var(--muted)", opacity: a });
    }
    c.text(500, 286, "x", { ...mid, class: "sol-small" }); c.text(26, 24, "y", { ...mid, class: "sol-small" });
    const sol = spSolution(N);
    if (s === 4 && sol) { c.circ(PX(sol[0]), PY(sol[1]), 9, { fill: "none", stroke: "var(--ink)", "stroke-width": 2 }); c.text(470, 40, String(sol[0] * sol[1]), { ...mid, class: "sol-hot" }); }
    if (s === 4 && !sol) c.text(470, 40, "0", { ...mid, class: "sol-hot" });
  },
};
