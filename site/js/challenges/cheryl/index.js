// The Cheryl's birthday challenge: card text, variations (checked answer, statement, solution text), original question,
// emblem and hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
import { choice, P } from "../common/helpers.js";
import { svg, dot } from "../common/icon.js";
import { CHERYL_SETS, cherylSteps, cherylAnswer, uniqueDays, dateText, MONTHS } from "./maths.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";

const list = (dates, lang) => dates.map((d) => dateText(d, lang)).join(", ");
const months = (dates, lang) => [...new Set(dates.map((d) => d[0]))].map((m) => MONTHS[m][lang]).join(lang ? " and " : " et ");

export const card = {
  id: "cheryl",
  type: "olympiad",
  title: ["L’anniversaire de Cheryl", "Cheryl’s birthday"],
  topic: ["Logique", "Logic"],
  difficulty: 2,
  minutes: 15,
  hints: [],
  extension: ["Invente une liste de dix dates pour laquelle le dialogue mène encore à une seule réponse. Que se passe-t-il si Bernard parle en premier ?", "Invent a list of ten dates for which the dialogue still leads to a single answer. What happens if Bernard speaks first?"],
};

export const variant = {
  params: [choice("set", "Liste de dates", "List of dates", [["orig", "La liste publiée", "The published list"], ["b", "Liste 2", "List 2"], ["c", "Liste 3", "List 3"], ["d", "Liste 4", "List 4"]], "orig")],
  answer: (q) => cherylAnswer(CHERYL_SETS[q.set])[1],
  prompt: (q) => { const D = CHERYL_SETS[q.set]; return P(
    `Albert et Bernard veulent connaître l’anniversaire de Cheryl. Elle leur donne dix dates possibles : ${list(D, 0)}. Elle dit le mois seulement à Albert, et le jour seulement à Bernard. Albert : « Je ne sais pas quand est l’anniversaire de Cheryl, mais je sais que Bernard ne le sait pas non plus. » Bernard : « Au début, je ne savais pas, mais maintenant je sais. » Albert : « Alors moi aussi, je sais. » Quel est le jour (le numéro dans le mois) de l’anniversaire de Cheryl ?`,
    `Albert and Bernard want to know Cheryl’s birthday. She gives them ten possible dates: ${list(D, 1)}. She tells only the month to Albert, and only the day to Bernard. Albert: “I don’t know when Cheryl’s birthday is, but I know that Bernard doesn’t know either.” Bernard: “At first I didn’t know, but now I know.” Albert: “Then I also know.” What is the day (the number in the month) of Cheryl’s birthday?`); },
  hints: () => [
    P("Si Bernard avait un jour qui n’apparaît qu’une fois dans la liste, il connaîtrait la date. Quels mois Albert peut-il donc avoir, pour être sûr que Bernard ne sait pas ?", "If Bernard had a day that appears only once in the list, he would know the date. Which months can Albert have, then, to be sure that Bernard doesn’t know?"),
    P("Barre les mois exclus par la première phrase. Parmi les dates qui restent, lesquelles ont un jour qui n’apparaît plus qu’une fois ? Puis : laquelle est seule dans son mois ?", "Cross out the months excluded by the first sentence. Among the remaining dates, which have a day that now appears only once? Then: which one is alone in its month?"),
  ],
  solution: (q) => {
    const D = CHERYL_SETS[q.set], [, s1, s2, s3] = cherylSteps(D), u = uniqueDays(D), a = cherylAnswer(D);
    const out = (lang) => {
      const fr = !lang;
      return fr
        ? `Les jours ${u.join(" et ")} n’apparaissent qu’une fois : si Bernard avait l’un d’eux, il saurait. Albert est sûr que Bernard ne sait pas, donc son mois ne contient aucun de ces jours : il reste ${months(s1, 0)}, soit ${list(s1, 0)}. Bernard sait maintenant : son jour n’apparaît qu’une fois dans cette liste réduite. Il reste ${list(s2, 0)}. Albert sait alors : son mois ne contient qu’une de ces dates. Il reste ${list(s3, 0)}. L’anniversaire est le ${dateText(a, 0)} : la réponse est ${a[1]}.`
        : `The days ${u.join(" and ")} appear only once: if Bernard had one of them, he would know. Albert is sure Bernard doesn’t know, so his month contains none of these days: ${months(s1, 1)} remain, that is ${list(s1, 1)}. Bernard now knows: his day appears only once in this shorter list. What remains is ${list(s2, 1)}. Albert then knows: his month contains only one of these dates. What remains is ${list(s3, 1)}. The birthday is ${dateText(a, 1)}: the answer is ${a[1]}.`;
    };
    return P(out(0), out(1));
  },
};

export const original = (q) => P(
  `Retrouve la date complète de l’anniversaire de Cheryl et explique, phrase par phrase, ce que chacune apprend aux autres. Pourquoi la dernière phrase d’Albert est-elle nécessaire ?`,
  `Find the full date of Cheryl’s birthday and explain, sentence by sentence, what each one tells the others. Why is Albert’s last sentence needed?`);

export const icon = svg(`<path d="M12 22h40v32H12z" ${'fill="currentColor" fill-opacity=".14"'}/><path d="M12 30h40M22 16v10M42 16v10"/><path class="ci-draw" d="M20 38l6 8 14-12"/>${dot(46, 46, 2.6, "ci-blink")}`);

export const hintActions = {
  0: ["unique", "Repérer les jours qui n’apparaissent qu’une fois", "Mark the days that appear only once"],
  1: ["steps", "Barrer les dates phrase par phrase", "Cross out the dates sentence by sentence"],
};
