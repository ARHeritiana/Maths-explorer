// The pigeonhole challenge: card text, variations (checked answer, statement, solution text), original question, emblem and
// hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
import { int, P } from "../common/helpers.js";
import { svg, dot } from "../common/icon.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export { scene } from "./solution.js";

export const card = {
  id: "pigeonhole",
  type: "olympiad",
  title: ["Une différence multiple de 7", "A difference that is a multiple of 7"],
  topic: ["Arithmétique", "Number theory"],
  difficulty: 2,
  minutes: 10,
  hints: [["Classe les entiers selon leur reste dans la division par 7.", "Sort integers by their remainder when divided by 7."], ["Il n’y a que sept restes possibles. Montre aussi que sept entiers ne suffisent pas toujours.", "There are only seven possible remainders. Also show that seven integers do not always suffice."]],
  extension: ["Généralise à la divisibilité par m et rédige les deux parties de la preuve.", "Generalize to divisibility by m and write both parts of the proof."],
};

export const variant = {
  params: [int("m", "Diviseur", "Divisor", 3, 12, 7)],
  answer: (q) => q.m + 1,
  prompt: (q) => P(`Quel est le plus petit nombre d’entiers distincts à choisir pour être certain que deux d’entre eux ont une différence divisible par ${q.m} ?`, `What is the smallest number of distinct integers you must choose to guarantee that two have a difference divisible by ${q.m}?`),
  hints: (q) => [P(`Classe les entiers selon leur reste dans la division par ${q.m}.`, `Sort integers by their remainder when divided by ${q.m}.`), P(`Il n’y a que ${q.m} restes possibles. Montre aussi que ${q.m} entiers ne suffisent pas toujours.`, `There are only ${q.m} possible remainders. Also show that ${q.m} integers do not always suffice.`)],
  solution: (q) => P(`Avec ${q.m + 1} entiers et ${q.m} restes, deux entiers ont le même reste, donc leur différence est divisible par ${q.m}. La liste 0, 1, …, ${q.m - 1} montre que ${q.m} ne suffisent pas. Le minimum est donc ${q.m + 1}.`, `Among ${q.m + 1} integers and ${q.m} remainders, two share a remainder, so their difference is divisible by ${q.m}. The list 0, 1, …, ${q.m - 1} shows that ${q.m} are not enough. The minimum is ${q.m + 1}.`),
};

export const original = (q) => P(
`Démontre qu’en choisissant assez d’entiers distincts, deux d’entre eux ont forcément une différence divisible par ${q.m}. À partir de combien d’entiers est-ce garanti ? Prouve les deux faits : c’est garanti à partir de ce nombre, et ce n’est pas garanti avec un entier de moins.`,
`Prove that if you choose enough distinct integers, two of them must have a difference divisible by ${q.m}. From how many integers on is this guaranteed? Prove both facts: it is guaranteed from that number on, and it is not guaranteed with one integer fewer.`);

export const icon = svg(`<path d="M6 30v20h16V30M24 30v20h16V30M42 30v20h16V30"/>${dot(14, 44)}${dot(32, 44)}${dot(50, 44)}${dot(32, 20, 3.8, "ci-bob")}${dot(23, 40, 3.2, "ci-bob2")}`);

export const hintActions = { 0: ["remainders", "Colorier chaque nombre selon son reste", "Colour each number by its remainder"] };
