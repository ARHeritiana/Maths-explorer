import { P } from "../common/helpers.js";
import { knightMoves } from "./maths.js";
export const diagram = {
  size: [520, 300],
  steps: ({ n }) => [P("Une case de départ est déjà visitée avant le premier coup.", "The starting square is already visited before the first move."), P(`Chaque nouveau coup visite une nouvelle case : ${n * n} cases demandent ${n * n - 1} coups.`, `Every new move visits a new square: ${n * n} squares require ${n * n - 1} moves.`), P("Les couleurs alternent. Un circuit exige autant de cases de chaque couleur ; ce n’est pas une condition suffisante.", "Colours alternate. A circuit requires equally many squares of each colour; this is not sufficient.")],
  draw(c, step, p, { n }) { const size = Math.min(250 / n, 40), x0 = 20, y0 = 20, current = step ? knightMoves(0, n)[Math.min(1, Math.floor(p * 2))] : 0; for (let v = 0; v < n * n; v++) { const x = x0 + v % n * size, y = y0 + Math.floor(v / n) * size; c.rect(x, y, size, size, { fill: (v % n + Math.floor(v / n)) % 2 ? "var(--sunken)" : "var(--surface)", stroke: "var(--line-strong)" }); if (v === current) c.knight(x + size * .08, y + size * .08, size * .84); } c.text(330, 100, `${n}² − 1 = ${n * n - 1}`, { fill: "var(--ink)", "font-size": 20 }); },
};
