import { int, P } from "../common/helpers.js";
import { svg, soft } from "../common/icon.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export const card = { id: "knights", type: "play", title: P("Le tour du cavalier", "The knight’s tour"), topic: P("Graphes", "Graph theory"), difficulty: 2, minutes: 15, extension: P("Compare les échiquiers pairs et impairs. Un parcours peut-il revenir à son départ ?", "Compare even and odd boards. Can a tour return to its start?") };
export const variant = {
  params: [int("n", "Côté de l’échiquier", "Board side", 3, 10, 8)],
  open: true,   // open challenge: "can you visit every square once?", open then closed tours; the site checks nothing
  answer: ({ n }) => n * n - 1,   // moves of an open tour: a fact used by the tests, not asked
  prompt: ({ n }) => P(`Peux-tu visiter chaque case d’un échiquier ${n} × ${n} exactement une fois par des coups de cavalier ? Cherche un parcours ouvert, puis un parcours fermé, qui revient sur sa case de départ. Quels obstacles peux-tu démontrer ?`, `Can you visit every square of a ${n} × ${n} board exactly once using knight moves? Look for an open tour, then a closed tour, which comes back to its starting square. Which obstructions can you prove?`),
  solution: ({ n }) => {
    const open = n >= 5, closed = n % 2 === 0 && n >= 6;
    const fr = [open ? `Un parcours ouvert existe : une règle simple (aller toujours vers la case d’où l’on pourra repartir vers le moins de cases libres) en trouve un sans retour en arrière ; l’animation le trace, ${n * n} cases en ${n * n - 1} coups.`
        : n === 3 ? "Aucun parcours : aucun coup de cavalier ne mène à la case du centre, elle ne peut jamais être visitée."
        : "Aucun parcours : le cavalier se bloque toujours avant la 16e case ; on le vérifie en essayant tous les chemins (un ordinateur le fait en un instant).",
      "Pour un circuit fermé, colorie l’échiquier en damier : chaque coup de cavalier change de couleur, donc un circuit alterne les couleurs et passe par autant de cases de chaque couleur.",
      n % 2 ? `Ici ${n * n} cases, un nombre impair : une couleur a une case de plus que l’autre, donc aucun circuit fermé.`
        : closed ? "Ici le côté est pair, la couleur n’empêche rien, et un circuit fermé existe : l’animation en trace un."
        : "Ici le côté est pair, mais comme il n’y a pas même de parcours ouvert, il n’y a pas de circuit fermé."];
    const en = [open ? `An open tour exists: a simple rule (always move to the square from which the fewest free squares can then be reached) finds one without backtracking; the animation draws it, ${n * n} squares in ${n * n - 1} moves.`
        : n === 3 ? "No tour: no knight move leads to the centre square, so it can never be visited."
        : "No tour: the knight always gets stuck before the 16th square; this is checked by trying every path (a computer does it in an instant).",
      "For a closed tour, colour the board like a chessboard: every knight move changes colour, so a closed tour alternates colours and visits as many squares of each colour.",
      n % 2 ? `Here there are ${n * n} squares, an odd number: one colour has one square more than the other, so there is no closed tour.`
        : closed ? "Here the side is even, colour rules nothing out, and a closed tour exists: the animation draws one."
        : "Here the side is even, but as there is not even an open tour, there is no closed tour."];
    return P(fr.join(" "), en.join(" "));
  },
};
export const icon = svg(`<path d="M18 52C17 43 21 37 27 32C24 32 20 34 16 38C13 40 9 39 9 36C9 32 14 27 18 23L21 12L27 18C31 15 36 14 40 15C49 18 54 30 52 52Z" ${soft}/><path d="M15 52h40v6H15z" ${soft}/><circle cx="22" cy="27" r="1.8" fill="currentColor" stroke="none"/>`);
