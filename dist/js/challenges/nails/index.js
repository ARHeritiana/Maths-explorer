// The nails challenge (hanging a picture): card text, variations (checked answer, statement, solution text), original
// question, emblem and hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
import { choice, P } from "../common/helpers.js";
import { svg, dot } from "../common/icon.js";
import { NAIL_VARIANTS, SHORTEST, parseNails, wordText, NAMES } from "./maths.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";

const nailsOf = (n) => NAMES.slice(0, n).join(", ");
const rule = (n, k, fr) => (k === 1 ? (fr ? "dès qu’on retire n’importe lequel des clous" : "as soon as any one nail is removed") : k === n ? (fr ? `seulement quand on retire les ${n} clous, et pas avant` : `only when all ${n} nails are removed, not before`) : fr ? `dès qu’on retire ${k} clous quelconques, mais pas si on n’en retire que ${k - 1}` : `as soon as any ${k} nails are removed, but not if only ${k - 1} ${k - 1 > 1 ? "are" : "is"} removed`);

export const card = {
  id: "nails",
  type: "olympiad",
  title: ["Un tableau sur des clous", "A picture on nails"],
  topic: ["Raisonnement, groupes", "Reasoning, groups"],
  difficulty: 3,
  minutes: 15,
  hints: [],
  extension: ["Avec n clous, trouve un enroulement qui tombe dès qu’on retire un clou quelconque. Combien de lettres utilise ta méthode quand n double ?", "With n nails, find a winding that falls as soon as any nail is removed. How many letters does your method use when n doubles?"],
};

export const variant = {
  params: [choice("nails", "Clous et règle", "Nails and rule", NAIL_VARIANTS.map((s) => { const [n, k] = parseNails(s); return [s, `${n} clous, tombe si ${k} retiré${k > 1 ? "s" : ""}`, `${n} nails, falls if ${k} removed`]; }), "2,1")],
  answer: (q) => SHORTEST[q.nails].length,
  prompt: (q) => { const [n, k] = parseNails(q.nails); return P(
    `Un tableau est suspendu par une ficelle attachée à ses deux coins supérieurs, enroulée autour de ${n} clous alignés ${nailsOf(n)}. Un tour, c’est la ficelle qui fait une fois le tour d’un clou, dans un sens ou dans l’autre. On veut que le tableau tombe ${rule(n, k, true)}. Quel est le plus petit nombre de tours possible ?`,
    `A picture hangs from a string tied to its two top corners and wound around ${n} nails in a row, ${nailsOf(n)}. A turn is the string going once around one nail, in either direction. The picture must fall ${rule(n, k, false)}. What is the smallest possible number of turns?`); },
  hints: () => [
    P("Écris un enroulement comme un mot : A pour un tour de A dans le sens des aiguilles d’une montre, A⁻¹ dans l’autre sens. Que devient le mot quand on retire le clou A ? Quand le tableau tombe-t-il ?", "Write a winding as a word: A for a clockwise turn around A, A⁻¹ for the other direction. What happens to the word when nail A is removed? When does the picture fall?"),
    P("Le tableau tombe quand le mot qui reste se simplifie entièrement (A A⁻¹ s’annule). Essaie A B A⁻¹ B⁻¹ : que reste-t-il si on retire A ? si on retire B ? si on ne retire rien ?", "The picture falls when the word that is left cancels completely (A A⁻¹ cancels). Try A B A⁻¹ B⁻¹: what is left if A is removed? if B is removed? if nothing is removed?"),
  ],
  solution: (q) => {
    const [n, k] = parseNails(q.nails), w = SHORTEST[q.nails], L = w.length;
    const model = P("Écrivons l’enroulement comme un mot : A est un tour autour du clou A dans le sens des aiguilles d’une montre, A⁻¹ un tour en sens inverse. Retirer un clou revient à effacer ses lettres ; le tableau tombe exactement quand ce qui reste se simplifie entièrement, en supprimant les paires voisines comme A A⁻¹ (c’est le calcul dans le groupe libre, qui décrit les enroulements à déformation près).", "Write the winding as a word: A is a turn around nail A clockwise, A⁻¹ a turn the other way. Removing a nail erases its letters; the picture falls exactly when what is left cancels completely, deleting neighbouring pairs such as A A⁻¹ (this is computing in the free group, which describes windings up to deformation).");
    const why = k === n
      ? P(`Ici ${wordText(w)} convient : chaque lettre est seule de son clou, donc le mot ne se simplifie que s’il ne reste plus aucune lettre, c’est-à-dire quand les ${n} clous sont retirés. Il faut au moins un tour par clou, sinon retirer les autres clous ferait déjà tomber le tableau : ${L} est le minimum.`, `Here ${wordText(w)} works: each letter is the only one of its nail, so the word cancels only when no letter is left, that is when all ${n} nails are removed. At least one turn per nail is needed, otherwise removing the other nails would already make it fall: ${L} is the least.`)
      : k === n - 1
        ? P(`Ici ${wordText(w)} convient. ${k - 1 ? `Si on retire ${k - 1} clou${k - 1 > 1 ? "s" : ""}` : "Si on ne retire aucun clou"}, il reste au moins deux clous X, Y et un mot de la forme … X Y … X⁻¹ Y⁻¹ … où rien ne se simplifie entièrement ; si on en retire ${k}, il reste un seul clou X et le mot X X⁻¹, qui s’annule. Chaque clou doit apparaître avec une somme d’exposants égale à zéro (sinon il retiendrait seul le tableau), donc au moins deux fois : ${L} lettres au minimum, et une recherche exhaustive le confirme.`, `Here ${wordText(w)} works. If ${k - 1 || "no"} nail${k - 1 > 1 ? "s are" : " is"} removed, at least two nails X, Y remain and a word of the form … X Y … X⁻¹ Y⁻¹ … in which nothing cancels completely; if ${k} are removed, a single nail X remains and the word X X⁻¹, which cancels. Each nail must appear with exponents adding up to zero (otherwise it alone would hold the picture), so at least twice: ${L} letters at least, and an exhaustive search confirms it.`)
        : P(`Ici ${wordText(w)} convient (${L} lettres). ${n === 2 ? "Si on retire A, il reste B B⁻¹ : il tombe ; si on retire B, il reste A A⁻¹ : il tombe ; sans rien retirer, A B A⁻¹ B⁻¹ ne se simplifie pas : il tient. Chaque clou doit apparaître avec une somme d’exposants égale à zéro, donc au moins deux fois : 4 est le minimum." : "On le construit avec des commutateurs [X, Y] = X Y X⁻¹ Y⁻¹, qui s’annulent dès que X ou Y s’annule : [[A, B], C] tombe si on retire A, B ou C. Une recherche exhaustive de tous les mots plus courts confirme que 10 est le minimum."}`, `Here ${wordText(w)} works (${L} letters). ${n === 2 ? "If A is removed, B B⁻¹ is left: it falls; if B is removed, A A⁻¹ is left: it falls; with nothing removed, A B A⁻¹ B⁻¹ does not cancel: it holds. Each nail must appear with exponents adding up to zero, so at least twice: 4 is the least." : "It is built with commutators [X, Y] = X Y X⁻¹ Y⁻¹, which cancel as soon as X or Y cancels: [[A, B], C] falls if A, B or C is removed. An exhaustive search of all shorter words confirms that 10 is the least."}`);
    return P(`${model[0]} ${why[0]}`, `${model[1]} ${why[1]}`);
  },
};

export const original = () => P(
  "Accroche un tableau sur deux clous de sorte qu’il tombe si on retire l’un quelconque des deux. Puis sur trois clous, de sorte qu’il tombe si on en retire deux quelconques, mais pas si on n’en retire qu’un. Explique pourquoi tes enroulements marchent, et généralise à n clous.",
  "Hang a picture on two nails so that it falls if either nail is removed. Then on three nails, so that it falls if any two are removed but not if only one is. Explain why your windings work, and generalise to n nails.");

export const icon = svg(`<path d="M14 50h36V30H14z" ${'fill="currentColor" fill-opacity=".18"'}/><path d="M14 30L24 14M50 30L40 14" /><path class="ci-draw" d="M24 14c-6-6 6-8 4 0c4 6 10 6 12 0c-2-8 10-6 4 0"/>${dot(24, 12, 3)}${dot(40, 12, 3)}`);

export const hintActions = {
  0: ["word", "Écrire l’enroulement comme un mot", "Write the winding as a word"],
  1: ["table", "Afficher ce qui reste pour chaque choix de clous retirés", "Show what is left for every choice of removed nails"],
};
