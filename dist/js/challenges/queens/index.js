// The queens challenge: card text, variations (checked answer, statement, solution text), original question, emblem and
// hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
import { int, P } from "../common/helpers.js";
import { svg, soft, dot } from "../common/icon.js";
import { queensBest, queensK, QUEENS, unattacked } from "./maths.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export { scene } from "./solution.js";

export const card = {
  id: "queens",
  type: "play",
  title: ["Des dames qui laissent des cases libres", "Queens that leave free squares"],
  topic: ["Combinatoire", "Combinatorics"],
  difficulty: 3,
  minutes: 12,
  hints: [],
  extension: ["Compare avec le problème inverse : placer le plus petit nombre de dames qui attaquent toutes les cases d’un échiquier 5 × 5.", "Compare with the opposite problem: place the fewest queens that attack every square of a 5 × 5 board."],
};

export const variant = {
  params: [int("n", "Côté de l’échiquier", "Board side", 4, 6, 5), int("k", "Nombre de dames", "Number of queens", 1, 6, 5)],
  answer: (q) => queensBest(q.n, q.k),
  prompt: (q) => { const k = queensK(q.n, q.k); return P(`Sur un échiquier de ${q.n} × ${q.n} cases, on place ${k} dame${k > 1 ? "s" : ""}. Une dame attaque toutes les cases de sa ligne, de sa colonne et de ses diagonales, jusqu’à la première pièce rencontrée. Une case est libre si elle n’est ni occupée ni attaquée. Quel est le plus grand nombre de cases libres que l’on peut laisser ?`, `On a ${q.n} × ${q.n} chessboard, you place ${k} queen${k > 1 ? "s" : ""}. A queen attacks every square of its row, its column and its diagonals, up to the first piece in the way. A square is free if it is neither occupied nor attacked. What is the largest number of free squares you can leave?`); },
  hints: (q) => [P("Une dame au centre attaque davantage de cases qu’une dame dans un coin. Mais ce qui compte, c’est la réunion des cases attaquées par toutes les dames.", "A queen in the centre attacks more squares than one in a corner. But what counts is the union of the squares attacked by all the queens."), P("Les dames qui se gênent mutuellement et celles qui attaquent les mêmes lignes se partagent le travail : essaie de les regrouper plutôt que de les disperser.", "Queens that block each other, and queens covering the same lines, share the work: try to group them rather than scatter them.")],
  solution: (q) => { const k = queensK(q.n, q.k), [best, ex] = QUEENS[`${q.n},${k}`], at = (s) => `(${Math.floor(s / q.n) + 1}, ${(s % q.n) + 1})`, total = (() => { let c = 1; for (let i = 0; i < k; i++) c = (c * (q.n * q.n - i)) / (i + 1); return Math.round(c); })();
    return P(`Maximum : ${best} case${best > 1 ? "s" : ""} libre${best > 1 ? "s" : ""}. Un placement qui l’atteint (ligne, colonne) : ${ex.map(at).join(" ")} ; les cases libres sont ${unattacked(q.n, ex).map(at).join(" ")}. Qu’aucun placement ne fasse mieux est établi par l’énumération exhaustive des C(${q.n * q.n}, ${k}) = ${total} placements possibles, pas par un argument à la main.`, `Maximum: ${best} free square${best > 1 ? "s" : ""}. A placement that reaches it (row, column): ${ex.map(at).join(" ")}; the free squares are ${unattacked(q.n, ex).map(at).join(" ")}. That no placement does better is established by exhaustive enumeration of all C(${q.n * q.n}, ${k}) = ${total} possible placements, not by a hand argument.`); },
};

export const original = (q) => P(
`Comment placer ${q.k} dames sur l’échiquier de ${q.n} × ${q.n} pour laisser le plus de cases libres possible ? Décris ton placement, puis explique comment tu sais qu’on ne peut pas faire mieux.`,
`How should ${q.k} queens be placed on the ${q.n} × ${q.n} board to leave as many free squares as possible? Describe your placement, then explain how you know nothing better exists.`);

export const icon = svg(`<path d="M10 20l8 14 8-18 6 18 6-18 8 18 8-14-3 28H13z" ${soft} class="ci-bob"/><path d="M13 52h38"/>${dot(10, 20, 3)}${dot(54, 20, 3)}${dot(32, 12, 3)}`);

export const hintActions = { 1: ["peek", "Poser une dame d’un bon placement", "Place one queen of a good placement"] };
