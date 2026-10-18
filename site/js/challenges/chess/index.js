// The chess challenge: card text, variations (checked answer, statement, solution text), original question, emblem and
// hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
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
  hints: [["Colorie les cases en noir et blanc.", "Colour the squares black and white."], ["Chaque domino couvre une case de chaque couleur. Que dire des deux cases retirées ?", "Every domino covers one square of each colour. What can you say about the two removed squares?"]],
  extension: ["Si on retire deux cases de couleurs différentes quelconques, le plateau 8 × 8 reste-t-il toujours pavable ? Cherche avant de conclure.", "If two squares of different colours are removed, can the 8 × 8 board always be tiled? Investigate before concluding."],
};

export const variant = {
  params: [int("n", "Côté du plateau", "Board side", 4, 12, 8, 2), choice("kind", "Cases retirées", "Squares removed", [["opp", "Deux coins opposés", "Two opposite corners"], ["adj", "Deux coins voisins", "Two neighbouring corners"]], "opp")],
  answer: (q) => (q.n * q.n) / 2 - (q.kind === "opp" ? 2 : 1),
  prompt: (q) => P(`Un plateau de ${q.n} × ${q.n} cases a perdu ${q.kind === "opp" ? "deux coins opposés" : "deux coins voisins (sur un même côté)"}. Quel est le plus grand nombre de dominos 2 × 1 que l’on peut poser sur le plateau sans chevauchement ?`, `A ${q.n} × ${q.n} board has lost ${q.kind === "opp" ? "two opposite corners" : "two neighbouring corners (on the same side)"}. What is the largest number of 2 × 1 dominoes you can place on the board without overlapping?`),
  solution: (q) => {
    const h = (q.n * q.n) / 2;
    return q.kind === "opp"
      ? P(`Les deux coins retirés ont la même couleur : il reste ${h - 2} cases de cette couleur et ${h} de l’autre. Chaque domino couvre une case de chaque couleur, donc il y a au plus ${h - 2} dominos. On les atteint : on pave horizontalement toutes les rangées sauf les deux rangées mutilées, où il reste une case libre chacune. Maximum : ${h - 2}.`, `The two removed corners share a colour: ${h - 2} squares of that colour and ${h} of the other remain. Every domino covers one of each, so there are at most ${h - 2} dominoes. This is reached: tile every row horizontally except the two damaged rows, which keep one free square each. Maximum: ${h - 2}.`)
      : P(`Deux coins voisins ont des couleurs différentes : il reste ${h - 1} cases de chaque couleur, le plafond est ${h - 1} dominos. Il est atteint par un pavage complet : on pave chaque rangée horizontalement (la rangée mutilée a ${q.n - 2} cases, un nombre pair). Maximum : ${h - 1}.`, `Two neighbouring corners have different colours: ${h - 1} squares of each colour remain, so the ceiling is ${h - 1} dominoes. A full tiling reaches it: tile every row horizontally (the damaged row has ${q.n - 2} squares, an even number). Maximum: ${h - 1}.`);
  },
};

export const original = (q) => P(
`Peut-on recouvrir exactement ce plateau de ${q.n} × ${q.n} cases, privé de ${q.kind === "adj" ? "deux coins voisins" : "deux coins opposés"}, par des dominos 2 × 1, sans chevauchement ni débordement ? Si oui, décris un pavage. Sinon, démontre que c’est impossible par un argument qui évite d’essayer tous les placements.`,
`Can this ${q.n} × ${q.n} board, missing ${q.kind === "adj" ? "two neighbouring corners" : "two opposite corners"}, be covered exactly by 2 × 1 dominoes, with no overlap and nothing sticking out? If so, describe a tiling. If not, prove it is impossible with an argument that avoids trying every placement.`);

export const icon = svg(`<rect x="8" y="8" width="48" height="48" rx="3"/><path d="M8 24h48M8 40h48M24 8v48M40 8v48"/><rect class="ci-slide" x="11" y="11" width="26" height="10" rx="3" ${soft}/><rect x="43" y="27" width="10" height="26" rx="3" ${soft}/>`);

export const hintActions = { 0: ["colour", "Colorier les cases", "Colour the squares", true] };
