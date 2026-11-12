// The nails challenge (hanging a picture): card text, variations (checked answer, statement, solution text), original
// question, emblem and hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
import { choice, P } from "../common/helpers.js";
import { svg, dot } from "../common/icon.js";
import { NAIL_VARIANTS, SHORTEST, parseNails, turnText, NAMES } from "./maths.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";

const nailsOf = (n) => NAMES.slice(0, n).join(", ");
const rule = (n, k, fr) => (k === 1 ? (fr ? "dès qu’on retire n’importe lequel des clous" : "as soon as any one nail is removed") : k === n ? (fr ? `seulement quand on retire les ${n} clous, et pas avant` : `only when all ${n} nails are removed, not before`) : fr ? `dès qu’on retire ${k} clous quelconques, mais pas si on n’en retire que ${k - 1}` : `as soon as any ${k} nails are removed, but not if only ${k - 1} ${k - 1 > 1 ? "are" : "is"} removed`);

export const card = {
  id: "nails",
  type: "olympiad",
  title: ["Un tableau sur des clous", "A picture on nails"],
  topic: ["Raisonnement, enroulements", "Reasoning, windings"],
  difficulty: 3,
  minutes: 15,
  hints: [],
  extension: ["Avec n clous, trouve un enroulement qui tombe dès qu’on retire un clou quelconque. Combien de tours utilise ta méthode quand n double ?", "With n nails, find a winding that falls as soon as any nail is removed. How many turns does your method use when n doubles?"],
};

export const variant = {
  params: [choice("nails", "Clous et règle", "Nails and rule", NAIL_VARIANTS.map((s) => { const [n, k] = parseNails(s); return [s, `${n} clous, tombe si ${k} retiré${k > 1 ? "s" : ""}`, `${n} nails, falls if ${k} removed`]; }), "2,1")],
  answer: (q) => SHORTEST[q.nails].length,
  prompt: (q) => { const [n, k] = parseNails(q.nails); return P(
    `Un tableau est suspendu par une ficelle attachée à ses deux coins supérieurs, enroulée autour de ${n} clous alignés ${nailsOf(n)}. Un tour, c’est la ficelle qui fait une fois le tour d’un clou, dans un sens ou dans l’autre. On veut que le tableau tombe ${rule(n, k, true)}. Quel est le plus petit nombre de tours possible ?`,
    `A picture hangs from a string tied to its two top corners and wound around ${n} nails in a row, ${nailsOf(n)}. A turn is the string going once around one nail, in either direction. The picture must fall ${rule(n, k, false)}. What is the smallest possible number of turns?`); },
  hints: () => [
    P("Que devient la ficelle quand tu arraches un clou ? Quels tours restent accrochés, lesquels glissent ?", "What happens to the string when you pull a nail out? Which turns stay caught, which slip off?"),
    P("Si la ficelle fait le tour d’un clou dans un sens puis, juste après, le tour du même clou dans l’autre sens, que se passe-t-il quand on tire dessus ? Essaie de t’en servir avec deux clous, en entremêlant les tours.", "If the string goes round a nail one way and, right after, round the same nail the other way, what happens when you pull? Try to use that with two nails, by interleaving the turns."),
  ],
  solution: (q) => {
    const [n, k] = parseNails(q.nails), w = SHORTEST[q.nails], L = w.length, T = turnText(w);
    const idea = P("L’idée : quand on arrache un clou, tous les tours de ficelle autour de lui glissent et disparaissent. Et quand la ficelle fait le tour d’un clou dans un sens puis, sans rien accrocher entre les deux, le tour du même clou dans l’autre sens, elle se défait toute seule en tirant. Le tableau tombe quand il ne reste plus rien qui retienne la ficelle. (↻ : un tour dans le sens des aiguilles d’une montre, ↺ : dans l’autre sens.)", "The idea: when a nail is pulled out, every turn of string around it slips off. And when the string goes round a nail one way and then, with nothing caught in between, round the same nail the other way, it comes undone by itself when pulled. The picture falls when nothing is left to hold the string. (↻: one turn clockwise, ↺: the other way.)");
    const why = k === n
      ? P(`Ici ${T} convient : chaque clou a son tour, et tant qu’il reste un clou, son tour retient la ficelle ; le tableau ne tombe que lorsque les ${n} clous sont arrachés. Il faut au moins un tour par clou : si un clou n’avait aucun tour, on arracherait tous les autres et le tableau tomberait avant que les ${n} soient arrachés. La réponse est ${L}.`, `Here ${T} works: every nail has its turn, and as long as one nail is left its turn holds the string; the picture falls only when all ${n} nails are out. At least one turn per nail is needed: if a nail had no turn, pulling out all the others would make the picture fall before all ${n} are out. The answer is ${L}.`)
      : k === n - 1
        ? P(`Ici ${T} convient : chaque clou a un tour dans un sens et un tour dans l’autre, entremêlés. Si on arrache tous les clous sauf un, les deux tours du clou resté seul se défont l’un l’autre et le tableau tombe ; si on en laisse deux ou plus, les tours s’accrochent les uns aux autres et rien ne se défait. Un clou resté seul doit lâcher la ficelle : avec un seul tour (ou des tours tous dans le même sens) il la retiendrait. Il lui faut donc au moins un tour dans chaque sens, soit 2 tours par clou : ${L} en tout.`, `Here ${T} works: every nail has one turn each way, interleaved. If all nails but one are pulled out, the two turns of the nail left alone undo each other and the picture falls; if two or more are left, the turns catch on each other and nothing comes undone. A nail left alone must let the string go: with a single turn (or turns all the same way) it would hold it. So it needs at least one turn each way, that is 2 turns per nail: ${L} in all.`)
        : P(`Ici ${T} convient (${L} tours). On part du montage à 2 clous A, B (${turnText(SHORTEST["2,1"])}), qui tombe dès qu’on arrache A ou B : c’est un enchevêtrement. On le traite comme un gros clou : un tour de C, puis le même enchevêtrement dans l’autre sens, puis un tour de C dans l’autre sens. Si on arrache C, l’enchevêtrement va et revient autour de rien et se défait ; si on arrache A ou B, c’est l’enchevêtrement qui disparaît et les deux tours de C se défont. Une recherche par ordinateur de tous les montages plus courts confirme que ${L} est le minimum.`, `Here ${T} works (${L} turns). Start from the winding for 2 nails A, B (${turnText(SHORTEST["2,1"])}), which falls as soon as A or B is pulled out: it is a tangle. Use it like a fat nail: one turn of C, then the same tangle the other way round, then one turn of C the other way. If C is pulled out, the tangle goes there and back around nothing and comes undone; if A or B is pulled out, the tangle disappears and the two turns of C undo each other. A computer search of all shorter windings confirms that ${L} is the least.`);
    return P(`${idea[0]} ${why[0]}`, `${idea[1]} ${why[1]}`);
  },
};

export const original = () => P(
  "Accroche un tableau sur deux clous de sorte qu’il tombe si on retire l’un quelconque des deux. Puis sur trois clous, de sorte qu’il tombe si on en retire deux quelconques, mais pas si on n’en retire qu’un. Explique pourquoi tes enroulements marchent, et généralise à n clous.",
  "Hang a picture on two nails so that it falls if either nail is removed. Then on three nails, so that it falls if any two are removed but not if only one is. Explain why your windings work, and generalise to n nails.");

export const icon = svg(`<path d="M14 50h36V30H14z" ${'fill="currentColor" fill-opacity=".18"'}/><path d="M14 30L24 14M50 30L40 14" /><path class="ci-draw" d="M24 14c-6-6 6-8 4 0c4 6 10 6 12 0c-2-8 10-6 4 0"/>${dot(24, 12, 3)}${dot(40, 12, 3)}`);

// no hint button acts on the scene: the activity gives no help of its own
export const hintActions = {};
