// The knight's tour, worked solution: an open tour drawn move by move (Warnsdorff's rule), what blocks the small
// boards, the colour argument against closed tours on odd boards, and a closed tour drawn on the even boards.
import { P } from "../common/helpers.js";
import { knightMoves, searchTour, closedTourExists, CLOSED_TOURS } from "./maths.js";

const cache = new Map();
// The open tour shown for an n × n board (null when none exists: n = 3 or 4), and, on 4 × 4, a greedy walk that gets stuck.
export function openTourOf(n) {
  if (!cache.has(n)) {
    const gen = searchTour(n, n, { limit: 100000 }); let r; do r = gen.next(); while (!r.done);
    let path = r.value.status === "found" ? r.value.path : null, stuck = null;
    if (!path) { stuck = [0]; const seen = new Set(stuck); for (;;) { const nx = knightMoves(stuck.at(-1), n).filter((w) => !seen.has(w)); if (!nx.length) break; nx.sort((a, b) => knightMoves(a, n).filter((w) => !seen.has(w)).length - knightMoves(b, n).filter((w) => !seen.has(w)).length || a - b); seen.add(nx[0]); stuck.push(nx[0]); } }
    cache.set(n, { path, stuck });
  }
  return cache.get(n);
}

export const diagram = {
  size: [520, 300],
  steps: ({ n }) => {
    const { path } = openTourOf(n), closed = closedTourExists(n);
    return [
      P(`Un cavalier sur un échiquier ${n} × ${n}. Une règle simple : à chaque coup, aller vers la case libre d’où l’on pourra repartir vers le moins de cases libres. Les cases difficiles d’accès sont ainsi visitées d’abord.`, `A knight on a ${n} × ${n} board. A simple rule: at every move, go to the free square from which the fewest free squares can then be reached. Hard-to-reach squares are thus visited first.`),
      path ? P(`Parcours ouvert : les ${n * n} cases, une seule fois chacune, en ${n * n - 1} coups.`, `An open tour: all ${n * n} squares, each exactly once, in ${n * n - 1} moves.`)
        : n === 3 ? P("Sur 3 × 3, aucun coup de cavalier ne mène à la case du centre ni n’en part : elle ne sera jamais visitée. Pas de parcours.", "On 3 × 3, no knight move leads to the centre square or leaves it: it can never be visited. No tour.")
        : P("Sur 4 × 4, le cavalier se bloque toujours avant la fin : en essayant tous les chemins possibles (un ordinateur le fait en un instant), aucun ne passe par les 16 cases. Pas de parcours.", "On 4 × 4 the knight always gets stuck before the end: trying every possible path (a computer does it in an instant), none passes through all 16 squares. No tour."),
      P("Colorions en damier : un coup de cavalier change toujours la couleur de la case. Un circuit fermé alterne donc les couleurs et passe par autant de cases de chaque couleur.", "Colour the board like a chessboard: a knight move always changes the colour of the square. So a closed tour alternates colours and visits as many squares of each colour."),
      n % 2 ? P(`Ici ${n * n} cases : ${(n * n + 1) / 2} d’une couleur, ${(n * n - 1) / 2} de l’autre. Pas de circuit fermé.`, `Here ${n * n} squares: ${(n * n + 1) / 2} of one colour, ${(n * n - 1) / 2} of the other. No closed tour.`)
        : closed ? P(`Côté pair : la couleur n’empêche rien, et voici un circuit fermé : le dernier coup ramène le cavalier sur sa case de départ.`, `Even side: colour rules nothing out, and here is a closed tour: the last move brings the knight back to its starting square.`)
        : P("Sur 4 × 4, la couleur n’empêche rien, mais il n’y a déjà pas de parcours ouvert, donc pas de circuit fermé non plus.", "On 4 × 4 colour rules nothing out, but there is not even an open tour, so there is no closed tour either."),
    ];
  },
  dur: () => 5200,
  draw(c, step, p, { n }) {
    const size = Math.min(260 / n, 44), x0 = 16, y0 = 16, ctr = (v) => [x0 + (v % n + 0.5) * size, y0 + (Math.floor(v / n) + 0.5) * size];
    const { path, stuck } = openTourOf(n), closedPath = n % 2 === 0 ? CLOSED_TOURS[n] : null;
    for (let v = 0; v < n * n; v++) {
      const x = x0 + (v % n) * size, y = y0 + Math.floor(v / n) * size, dark = (v % n + Math.floor(v / n)) % 2;
      c.rect(x, y, size, size, { fill: step >= 2 && dark ? "var(--sunken)" : "var(--surface)", stroke: "var(--line-strong)" });
    }
    // the route to draw: open tour (steps 0-2), then the closed tour (step 3)
    const route = step >= 3 && closedPath ? closedPath : path || stuck;
    const shown = step === 0 ? Math.max(1, Math.round(p * 6)) : step === 1 || (step === 3 && closedPath) ? Math.max(1, Math.round(p * route.length)) : route.length;
    const pts = route.slice(0, shown).map(ctr);
    if (pts.length > 1) c.path("M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L"), { fill: "none", stroke: "var(--accent)", "stroke-width": 2.2, "stroke-linejoin": "round", "stroke-linecap": "round" });
    if (step === 3 && closedPath && shown === route.length) { const [a, b] = [ctr(route.at(-1)), ctr(route[0])]; c.line(a[0], a[1], b[0], b[1], { stroke: "var(--accent)", "stroke-width": 3.2, "stroke-dasharray": "5 4" }); }
    pts.forEach(([x, y], i) => { if (size >= 24) c.text(x, y + 4, String(i + 1), { "text-anchor": "middle", "font-size": Math.min(13, size * 0.36), fill: "var(--ink)" }); else c.circ(x, y, 2.2, { fill: "var(--accent)" }); });
    const at = route[shown - 1]; if (at !== undefined) { const [x, y] = ctr(at); c.knight(x - size * 0.42, y - size * 0.42, size * 0.84); }
    if (n === 3 && step >= 1) { const [x, y] = ctr(4); c.line(x - size * .3, y - size * .3, x + size * .3, y + size * .3, { stroke: "var(--accent)", "stroke-width": 4 }); c.line(x + size * .3, y - size * .3, x - size * .3, y + size * .3, { stroke: "var(--accent)", "stroke-width": 4 }); }
    const label = step === 3 ? (n % 2 ? `${(n * n + 1) / 2} ≠ ${(n * n - 1) / 2}` : closedPath ? c.t("circuit fermé", "closed tour") : "") : path ? `${n * n} ${c.t("cases", "squares")} · ${n * n - 1} ${c.t("coups", "moves")}` : c.t("bloqué", "stuck");
    c.text(310, 150, label, { fill: "var(--ink)", "font-size": 20 });
  },
};
