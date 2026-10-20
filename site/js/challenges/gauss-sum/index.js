// The gauss-sum challenge: card text, variations (checked answer, statement, solution text), original question, emblem and
// hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
import { choice, int, P } from "../common/helpers.js";
import { svg, soft } from "../common/icon.js";
import { SERIES_PRESETS, parseSeries, lastTerm, seriesSum, groupDigits } from "./maths.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";

const g = groupDigits;
// "1 + 2 + 3 + … + 100", written with the first three terms and the last one
export function written(a, d, k, lang) {
  const terms = k <= 4 ? Array.from({ length: k }, (_, i) => g(a + i * d, lang)) : [g(a, lang), g(a + d, lang), g(a + 2 * d, lang), "…", g(lastTerm(a, d, k), lang)];
  return terms.join(" + ");
}

export const card = {
  id: "gauss-sum",
  type: "play",
  title: ["La somme du petit Gauss", "Young Gauss’s sum"],
  topic: ["Suites arithmétiques", "Arithmetic series"],
  difficulty: 1,
  minutes: 8,
  hints: [],
  extension: ["Que vaut 1² + 2² + … + n² ? Calcule les premières valeurs et compare-les avec n(n + 1)(2n + 1)/6, puis démontre la formule par récurrence.", "What is 1² + 2² + … + n²? Compute the first values and compare them with n(n + 1)(2n + 1)/6, then prove the formula by induction."],
};

export const variant = {
  params: [{ ...choice("series", "La somme", "The sum", SERIES_PRESETS.map((s) => { const [a, d, k] = parseSeries(s); return [s, written(a, d, k, "fr"), written(a, d, k, "en")]; }), "1,1,100"),
    fields: [int("first", "Premier terme", "First term", 1, 100000, 1), int("step", "Écart entre deux termes", "Difference between terms", 1, 1000, 1), int("count", "Nombre de termes", "Number of terms", 2, 1000, 100)] }],
  answer: (q) => { const [a, d, k] = parseSeries(q.series); return seriesSum(a, d, k); },
  prompt: (q) => { const [a, d, k] = parseSeries(q.series); return P(
    `Le maître demande à la classe de calculer ${written(a, d, k, "fr")} : ${g(k, "fr")} nombres, chacun ${d === 1 ? "suivi du nombre suivant" : `augmenté de ${d} par rapport au précédent`}, jusqu’à ${g(lastTerm(a, d, k), "fr")}. Quelle est cette somme ?`,
    `The schoolmaster asks the class to work out ${written(a, d, k, "en")}: ${g(k, "en")} numbers, each ${d === 1 ? "followed by the next whole number" : `${d} more than the one before`}, up to ${g(lastTerm(a, d, k), "en")}. What is the sum?`); },
  hints: (q) => { const [a, d, k] = parseSeries(q.series), l = lastTerm(a, d, k); return [
    P(`N’additionne pas dans l’ordre. Que vaut le premier terme plus le dernier, ${g(a, "fr")} + ${g(l, "fr")} ? Et le deuxième plus l’avant-dernier ?`, `Do not add in order. What is the first term plus the last, ${g(a, "en")} + ${g(l, "en")}? And the second plus the second to last?`),
    P(`Écris la somme une deuxième fois, à l’envers, sous la première. Chaque colonne vaut ${g(a + l, "fr")}, et il y a ${k} colonnes : que vaut le double de la somme ?`, `Write the sum a second time, backwards, under the first. Every column makes ${g(a + l, "en")}, and there are ${k} columns: what is twice the sum?`),
  ]; },
  solution: (q) => { const [a, d, k] = parseSeries(q.series), l = lastTerm(a, d, k), S = seriesSum(a, d, k); return P(
    `Notons S la somme. Écrivons-la à l’endroit, puis à l’envers : S = ${g(a, "fr")} + ${g(a + d, "fr")} + … + ${g(l, "fr")} et S = ${g(l, "fr")} + ${g(l - d, "fr")} + … + ${g(a, "fr")}. Additionnons colonne par colonne : quand on avance d’un terme, le terme du haut augmente de ${d} et celui du bas diminue de ${d}, donc chaque colonne vaut ${g(a, "fr")} + ${g(l, "fr")} = ${g(a + l, "fr")}. Il y a ${k} colonnes, donc 2S = ${k} × ${g(a + l, "fr")} et S = ${k} × ${g(a + l, "fr")} / 2 = ${g(S, "fr")}. En général, la somme de k termes d’une suite arithmétique vaut k × (premier + dernier) / 2.`,
    `Call the sum S. Write it forwards, then backwards: S = ${g(a, "en")} + ${g(a + d, "en")} + … + ${g(l, "en")} and S = ${g(l, "en")} + ${g(l - d, "en")} + … + ${g(a, "en")}. Add column by column: moving one term along, the top term goes up by ${d} and the bottom one goes down by ${d}, so every column makes ${g(a, "en")} + ${g(l, "en")} = ${g(a + l, "en")}. There are ${k} columns, so 2S = ${k} × ${g(a + l, "en")} and S = ${k} × ${g(a + l, "en")} / 2 = ${g(S, "en")}. In general, the sum of k terms of an arithmetic series is k × (first + last) / 2.`); },
};

export const original = () => P(
  "Calcule la somme sans additionner les nombres un par un. Puis trouve une formule pour la somme de n’importe quelle liste de nombres qui augmentent toujours du même écart, et démontre-la.",
  "Work out the sum without adding the numbers one by one. Then find a formula for the sum of any list of numbers that always go up by the same step, and prove it.");

export const icon = svg(`${[0, 1, 2, 3, 4].map((i) => `<rect x="${10 + i * 9}" y="${50 - (i + 1) * 7}" width="7" height="${(i + 1) * 7}" ${soft}/>`).join("")}<g class="ci-bob">${[0, 1, 2, 3, 4].map((i) => `<rect x="${10 + i * 9}" y="${8 + 0}" width="7" height="${(5 - i) * 7}" fill="currentColor" fill-opacity=".5" stroke="none"/>`).join("")}</g><path d="M6 54h52"/>`);

export const hintActions = {
  1: ["flip", "Poser la copie retournée", "Place the flipped copy", true],
};
