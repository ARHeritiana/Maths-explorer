// Animated solution of the cookies challenge, a pure function of (step, progress): a sharing becomes a row of cookies and
// separators, the row is read back as a sharing, and the separators' places are counted. See common/player.js.
import { P, ez, mid } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { sharings, binom, NAMES } from "./maths.js";

// A sharing used as the example: as even as possible, with one person left out when the rule allows it.
function example(q) {
  const parts = Array(q.k).fill(0), skip = q.rule !== "one" && q.k >= 3 ? 1 : -1, who = parts.map((_, i) => i).filter((i) => i !== skip);
  for (let i = 0; i < q.n; i++) parts[who[i % who.length]]++;
  return parts;
}

export const diagram = {
  size: [520, 300],
  steps: (q) => {
    const m = q.n + q.k - 1, e = example(q);
    return [
      P(`${q.n} biscuits identiques pour ${q.k} personnes. Un partage dit seulement combien chacun reçoit, par exemple (${e.join(" ; ")}).`, `${q.n} identical cookies for ${q.k} people. A sharing only says how many each person gets, for example (${e.join(", ")}).`),
      P(`Alignons les biscuits dans l’ordre A, B, C… et mettons un séparateur entre deux personnes : ${q.k - 1} séparateur${q.k > 2 ? "s" : ""}.`, `Line up the cookies in the order A, B, C… and put a separator between two people: ${q.k - 1} separator${q.k > 2 ? "s" : ""}.`),
      P(`Réciproquement, toute rangée de ${q.n} ● et ${q.k - 1} | se lit comme un partage : on compte les ● entre les |. Deux partages différents donnent deux rangées différentes.`, `Conversely, every row of ${q.n} ● and ${q.k - 1} | reads as a sharing: count the ● between the |. Two different sharings give two different rows.`),
      P(`Une rangée a ${m} places ; elle est fixée dès qu’on choisit les ${q.k - 1} places des séparateurs : C(${m}, ${q.k - 1}) = ${binom(m, q.k - 1)}.`, `A row has ${m} places; it is fixed once the ${q.k - 1} places of the separators are chosen: C(${m}, ${q.k - 1}) = ${binom(m, q.k - 1)}.`),
      q.rule === "one"
        ? P(`Avec « au moins un chacun », on donne d’abord un biscuit à chacun, puis on partage librement les ${Math.max(0, q.n - q.k)} restants : C(${q.n - 1}, ${q.k - 1}) = ${sharings(q.n, q.k, true)}.`, `With “at least one each”, first give everyone one cookie, then share the ${Math.max(0, q.n - q.k)} left freely: C(${q.n - 1}, ${q.k - 1}) = ${sharings(q.n, q.k, true)}.`)
        : P(`Réponse : ${sharings(q.n, q.k)} partages. La méthode vaut pour n biscuits et k personnes : C(n + k − 1, k − 1).`, `Answer: ${sharings(q.n, q.k)} sharings. The method works for n cookies and k people: C(n + k − 1, k − 1).`),
    ];
  },
  draw(c, s, p, q) {
    const e = example(q), m = q.n + q.k - 1, cell = Math.min(30, 480 / m), x0 = 260 - (m * cell) / 2, yRow = 170;
    // the row: cookies and separators in order
    const row = [];
    e.forEach((v, i) => { for (let j = 0; j < v; j++) row.push({ type: "c", owner: i }); if (i < e.length - 1) row.push({ type: "s" }); });
    // step 0: plates; from step 1 the cookies slide into the row
    const k = s === 0 ? 0 : s === 1 ? ez(p) : 1, plateW = 480 / q.k;
    let seen = Array(q.k).fill(0);
    row.forEach((o, idx) => {
      const rx = x0 + idx * cell + cell / 2;
      if (o.type === "c") {
        const i = o.owner, px = 20 + plateW * (i + 0.5) + ((seen[i] % 3) - 1) * 12, py = 120 - Math.floor(seen[i] / 3) * 13;
        seen[i]++;
        const x = px + (rx - px) * k, y = py + (yRow - py) * k;
        c.circ(x, y, Math.min(11, cell * 0.38), { fill: `color-mix(in srgb, ${colour(i)} 60%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 1.2 });
      } else if (s >= 1) {
        c.line(rx, yRow - 18, rx, yRow + 18, { stroke: "var(--ink)", "stroke-width": 3, opacity: s === 1 ? ez(p) : 1 });
      }
      if (s >= 3) c.text(rx, yRow - 26, String(idx + 1), { ...mid, class: "sol-small" });
    });
    if (s === 0) for (let i = 0; i < q.k; i++) { const cx = 20 + plateW * (i + 0.5); c.line(cx - plateW * 0.35, 134, cx + plateW * 0.35, 134, { stroke: "var(--line-strong)", "stroke-width": 3 }); c.text(cx, 158, `${NAMES[i]}${c.t(" : ", ": ")}${e[i]}`, { ...mid, class: "sol-label" }); }
    if (s >= 2) { let a = 0; e.forEach((v, i) => { const from = x0 + a * cell, w = v * cell; if (v) c.text(from + w / 2, yRow + 44, `${NAMES[i]}${c.t(" : ", ": ")}${v}`, { ...mid, class: "sol-small" }); a += v + 1; }); }
    if (s >= 3) c.text(260, 260, `C(${m}, ${q.k - 1}) = ${binom(m, q.k - 1)}`, { ...mid, class: "sol-line" });
    if (s === 4) c.text(260, 60, String(sharings(q.n, q.k, q.rule === "one")), { ...mid, class: "sol-hot" });
  },
};
