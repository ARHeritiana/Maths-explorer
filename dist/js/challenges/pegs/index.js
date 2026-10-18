// The pegs challenge: card text, variations (checked answer, statement, solution text), original question, emblem and
// hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
import { choice, P } from "../common/helpers.js";
import { svg, dot } from "../common/icon.js";
import { PEG_TARGETS, pegsMin, pegTarget, pegsSolve, pegClass, pegsWithin } from "./maths.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";

export const card = {
  id: "pegs",
  type: "olympiad",
  title: ["Trois pions qui sautent", "Three jumping pegs"],
  topic: ["Invariants", "Invariants"],
  difficulty: 2,
  minutes: 12,
  hints: [],
  extension: ["Change les positions de départ, par exemple (0, 0), (2, 0), (0, 1) : quels points peut-on atteindre ? Que devient l’invariant ?", "Change the starting positions, for example (0, 0), (2, 0), (0, 1): which points can be reached? What becomes of the invariant?"],
};

export const variant = {
  params: [choice("target", "Point à atteindre", "Point to reach", PEG_TARGETS.map((s) => [s, `(${s.split(",").join(", ")})`, `(${s.split(",").join(", ")})`]), "1,1")],
  answer: (q) => pegsMin(pegTarget(q.target)),
  prompt: (q) => { const [x, y] = pegTarget(q.target); return P(`Trois pions sont posés aux points (0, 0), (1, 0) et (0, 1) d’un quadrillage. Un pion peut sauter par-dessus un autre pion et atterrir au point symétrique de sa place par rapport à ce pion, à condition que ce point soit libre. Quel est le plus petit nombre de sauts après lequel un pion se trouve au point (${x}, ${y}) ? Réponds 0 si c’est impossible.`, `Three pegs sit at the points (0, 0), (1, 0) and (0, 1) of a grid. A peg may jump over another peg and land on the point symmetric to its place about that peg, provided that point is free. What is the smallest number of jumps after which a peg is on the point (${x}, ${y})? Answer 0 if it is impossible.`); },
  hints: () => [P("Note les coordonnées des trois pions au départ, puis après quelques sauts. Regarde la parité (pair ou impair) de chaque coordonnée, pion par pion.", "Write down the coordinates of the three pegs at the start, then after a few jumps. Look at the parity (even or odd) of each coordinate, peg by peg."), P("Un pion en M qui saute par-dessus N arrive en 2N − M. Que devient la parité de ses coordonnées ? Et quelle est la parité du point visé ?", "A peg at M jumping over N lands on 2N − M. What happens to the parity of its coordinates? And what is the parity of the target point?")],
  solution: (q) => {
    const T = pegTarget(q.target), [x, y] = T, steps = pegsSolve(T), par = ([u, v]) => [`${u % 2 === 0 ? "pair" : "impair"}`, `${v % 2 === 0 ? "pair" : "impair"}`], parEn = ([u, v]) => [u % 2 === 0 ? "even" : "odd", v % 2 === 0 ? "even" : "odd"], cls = pegClass(T);
    const name = (k) => "ABC"[k], pt = (p) => `(${p.join(", ")})`;
    const seqFr = steps ? steps.map((s) => `${name(s.peg)} saute par-dessus ${name(s.over)} et arrive en ${pt(s.to)}`).join(" ; ") : "", seqEn = steps ? steps.map((s) => `${name(s.peg)} jumps over ${name(s.over)} and lands on ${pt(s.to)}`).join("; ") : "";
    const inv = P("Un pion en M qui saute par-dessus N arrive en 2N − M. Comme 2N a des coordonnées paires, 2N − M a les mêmes parités que M. Chaque pion garde donc pour toujours la parité de ses coordonnées : A reste (pair, pair), B reste (impair, pair), C reste (pair, impair). C’est un invariant.", "A peg at M jumping over N lands on 2N − M. Since 2N has even coordinates, 2N − M has the same parities as M. So every peg keeps the parity of its coordinates for ever: A stays (even, even), B stays (odd, even), C stays (even, odd). This is an invariant.");
    const list = (k) => { const own = new Set(["0,0", "1,0", "0,1"]); return [...pegsWithin(k)].filter((z) => !own.has(z)).map((z) => z.split(",").map(Number)).sort((u, v) => u[0] - v[0] || u[1] - v[1]).map(pt).join(", "); };
    const reach = P("Réciproquement, tout point de la classe d’un pion est atteignable par ce pion : A saute par-dessus B, B par-dessus A, C par-dessus A puis par-dessus B, et les trois pions ont glissé de (2, 0) ; de même, A par-dessus C, B par-dessus A, C par-dessus A, B par-dessus C les glisse de (0, 2). Un saut se défait par le même saut, donc on glisse aussi de (−2, 0) et (0, −2), et aucun atterrissage n’est jamais bloqué (il a la classe de son pion, et les trois classes sont différentes). Le pion X atteint donc tous les points X₀ + 2(m, n), c’est-à-dire toute sa classe.", "Conversely, every point of a peg’s class can be reached by that peg: A jumps over B, B over A, C over A then over B, and all three pegs have slid by (2, 0); likewise A over C, B over A, C over A, B over C slides them by (0, 2). A jump is undone by the same jump, so we can also slide by (−2, 0) and (0, −2), and no landing is ever blocked (it has its peg’s class, and the three classes are different). So peg X reaches every point X₀ + 2(m, n), that is, its whole class.");
    const k = steps ? steps.length : 0;
    const low = k === 1 ? P(`Un saut suffit, et zéro ne suffit pas : le point n’est pas occupé au départ.`, `One jump is enough, and none is not: the point is not occupied at the start.`) : k > 1 ? P(`Moins ne suffit pas : après au plus ${k - 1} saut${k > 2 ? "s" : ""}, les points occupés en plus des trois de départ sont ${list(k - 1)} (on les obtient en essayant les 6 sauts possibles à chaque étape), et (${x}, ${y}) n’y est pas.`, `Fewer is not enough: after at most ${k - 1} jump${k > 2 ? "s" : ""}, the points occupied besides the starting three are ${list(k - 1)} (found by trying the 6 possible jumps at each stage), and (${x}, ${y}) is not among them.`) : P("", "");
    return steps ? P(`${inv[0]} ${reach[0]} Le point (${x}, ${y}) est (${par(T).join(", ")}) : la classe d’un pion, donc il est atteignable. Suite de ${steps.length} saut${steps.length > 1 ? "s" : ""} : ${seqFr}. ${low[0]}`, `${inv[1]} ${reach[1]} The point (${x}, ${y}) is (${parEn(T).join(", ")}): the class of one peg, so it is reachable. A sequence of ${steps.length} jump${steps.length > 1 ? "s" : ""}: ${seqEn}. ${low[1]}`)
      : P(`${inv[0]} ${reach[0]} Le point (${x}, ${y}) est (${par(T).join(", ")}), classe (${cls.join(", ")}) modulo 2, qu’aucun pion n’occupe : il est impossible à atteindre, quel que soit le nombre de sauts. Réponse : 0.`, `${inv[1]} ${reach[1]} The point (${x}, ${y}) is (${parEn(T).join(", ")}), class (${cls.join(", ")}) modulo 2, which no peg occupies: it can never be reached, however many jumps are made. Answer: 0.`);
  },
};

export const original = (q) => { const [x, y] = String(q.target).split(","); return P(
`Trois pions sont aux points (0, 0), (1, 0) et (0, 1). Un pion peut sauter par-dessus un autre et atterrir au point symétrique, si ce point est libre. Peut-on amener un pion au point (${x}, ${y}) ? Si oui, décris une suite de sauts. Sinon, démontre que c’est impossible. Quels points du quadrillage un pion peut-il occuper un jour ?`,
`Three pegs sit at (0, 0), (1, 0) and (0, 1). A peg may jump over another and land on the symmetric point, if that point is free. Can a peg be brought to the point (${x}, ${y})? If so, describe a sequence of jumps. If not, prove it is impossible. Which points of the grid can a peg ever occupy?`); };

export const icon = svg(`<path d="M8 52h48M8 36h48M8 20h48M12 16v40M28 16v40M44 16v40" stroke-opacity=".28" stroke-width="1.6"/><circle cx="12" cy="52" r="5" fill="currentColor" fill-opacity=".35"/><circle cx="28" cy="52" r="5" fill="currentColor" fill-opacity=".35"/><g class="ci-bob"><circle cx="12" cy="36" r="5" fill="currentColor"/></g><path d="M12 31c5-12 16-12 21-2" stroke-dasharray="3 3"/>${dot(44, 52, 3, "ci-blink")}`);

export const hintActions = { 0: ["parity", "Afficher la parité (x, y) de chaque pion", "Show the parity (x, y) of each peg"], 1: ["classes", "Colorier les points selon la parité de (x, y)", "Colour the points by the parity of (x, y)"] };
