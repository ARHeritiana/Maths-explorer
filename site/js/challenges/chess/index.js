// The chess challenge: card text, variations (checked answer, statement, solution text), original question and emblem.
// Everything else about this challenge is in this folder; registry.js lists the folders.
import { int, choice, P } from "../common/helpers.js";
import { svg, soft } from "../common/icon.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export { scene } from "./solution.js";

export const card = {
  id: "chess",
  type: "play",
  title: ["Des dominos sur un plateau mutilé", "Dominoes on a damaged board"],
  topic: ["Pavages", "Tilings"],
  difficulty: 2,
  minutes: 10,
  extension: ["Si on retire deux cases de couleurs différentes quelconques, le plateau 8 × 8 reste-t-il toujours pavable ? Cherche avant de conclure.", "If two squares of different colours are removed, can the 8 × 8 board always be tiled? Investigate before concluding."],
};

export const variant = {
  params: [int("n", "Côté du plateau", "Board side", 4, 12, 8, 2), choice("kind", "Cases retirées", "Squares removed", [["opp", "Deux coins opposés", "Two opposite corners"], ["adj", "Deux coins voisins", "Two neighbouring corners"]], "opp")],
  open: true,   // open challenge: the classic statement asks "can it be tiled?" with a proof; the site checks nothing
  answer: (q) => (q.n * q.n) / 2 - (q.kind === "opp" ? 2 : 1),   // largest number of dominoes: a fact used by the tests, not asked
  prompt: (q) => P(
`Un plateau de ${q.n} × ${q.n} cases a perdu ${q.kind === "adj" ? "deux coins voisins (sur un même côté)" : "deux coins opposés"}. Peut-on le recouvrir exactement par des dominos 2 × 1, sans chevauchement ni débordement ? Si oui, décris un pavage. Sinon, démontre que c’est impossible, par un argument qui évite d’essayer tous les placements.`,
`A ${q.n} × ${q.n} board has lost ${q.kind === "adj" ? "two neighbouring corners (on the same side)" : "two opposite corners"}. Can it be covered exactly by 2 × 1 dominoes, with no overlap and nothing sticking out? If so, describe a tiling. If not, prove it is impossible, with an argument that avoids trying every placement.`),
  solution: (q) => {
    const h = (q.n * q.n) / 2;
    return q.kind === "opp"
      ? P(`Les deux coins retirés ont la même couleur : il reste ${h - 2} cases de cette couleur et ${h} de l’autre. Chaque domino couvre une case de chaque couleur, donc il y a au plus ${h - 2} dominos. Un pavage complet en demanderait ${h - 1} : c’est impossible. (En pavant horizontalement toutes les rangées, on pose bien ${h - 2} dominos ; il reste deux cases libres, une dans chaque rangée mutilée.)`, `The two removed corners share a colour: ${h - 2} squares of that colour and ${h} of the other remain. Every domino covers one of each, so there are at most ${h - 2} dominoes. A complete tiling would need ${h - 1}: it is impossible. (Tiling every row horizontally does place ${h - 2} dominoes; two squares stay free, one in each damaged row.)`)
      : P(`Deux coins voisins ont des couleurs différentes : il reste ${h - 1} cases de chaque couleur, la couleur n’empêche rien. Et un pavage existe : on pave chaque rangée horizontalement (la rangée mutilée a ${q.n - 2} cases, un nombre pair). C’est possible.`, `Two neighbouring corners have different colours: ${h - 1} squares of each colour remain, so colour rules nothing out. And a tiling exists: tile every row horizontally (the damaged row has ${q.n - 2} squares, an even number). It is possible.`);
  },
};


export const icon = svg(`<rect x="8" y="8" width="48" height="48" rx="3"/><path d="M8 24h48M8 40h48M24 8v48M40 8v48"/><rect class="ci-slide" x="11" y="11" width="26" height="10" rx="3" ${soft}/><rect x="43" y="27" width="10" height="26" rx="3" ${soft}/>`);
