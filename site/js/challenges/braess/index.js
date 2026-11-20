// The braess challenge (Braess's paradox, issue #34): a free shortcut that makes every trip slower. Card text, the
// checked answer, the statement, the written solution, the proof version and the emblem.
import { int, P } from "../common/helpers.js";
import { svg, dot } from "../common/icon.js";
import { after, before, equilibrium } from "./maths.js";
export { activity } from "./activity.js";
export { diagram, scene } from "./solution.js";

export const card = {
  id: "braess",
  type: "play",
  title: P("La route de trop", "One road too many"),
  topic: P("Équilibre et trafic", "Equilibrium and traffic"),
  difficulty: 2,
  minutes: 12,
  extension: P("Pour quels nombres de conducteurs la nouvelle route fait-elle gagner du temps, et pour lesquels en fait-elle perdre ? Et si la ville faisait payer un péage sur la nouvelle route, quel montant (en minutes) rendrait le trajet à 65 minutes ?", "For which numbers of drivers does the new road save time, and for which does it cost time? And if the town charged a toll on the new road, what amount (in minutes) would bring the trip back to 65 minutes?"),
};

const n100 = (n) => n.toLocaleString("fr-FR"), nEn = (n) => n.toLocaleString("en-GB");

export const variant = {
  params: [int("n", "Nombre de conducteurs", "Number of drivers", 1000, 8000, 4000, 1000)],
  answer: (q) => after(q.n),
  prompt: (q) => P(
    `Chaque matin, ${n100(q.n)} conducteurs vont de A à B, en passant par C ou par D. Les rues A→C et D→B prennent (nombre de voitures dans la rue) ÷ 100 minutes ; les voies rapides C→B et A→D prennent toujours 45 minutes. Chacun prend le trajet le plus rapide pour lui. La ville ouvre une nouvelle route de C à D, parcourue en 0 minute. Une fois que plus personne ne gagne à changer de trajet, combien de minutes dure chaque trajet ?`,
    `Every morning, ${nEn(q.n)} drivers go from A to B, through C or through D. The streets A→C and D→B take (number of cars on the street) ÷ 100 minutes; the expressways C→B and A→D always take 45 minutes. Everyone takes the fastest route for themselves. The town opens a new road from C to D that takes 0 minutes. Once nobody gains by changing route, how many minutes does each trip take?`),
  solution: (q) => {
    const n = q.n, b = before(n), a = after(n), e = equilibrium(n, true).flows;
    const fr = [`Avant la nouvelle route, les deux trajets sont pareils, sauf la rue encombrée. Si l’un a plus de voitures, il est plus lent, et des conducteurs passent sur l’autre. Cela s’arrête quand chaque trajet a la moitié des voitures : ${n100(n / 2)} voitures, soit ${n / 200} + 45 = ${b} minutes.`];
    const en = [`Before the new road, the two routes are alike except for the busy street. If one has more cars, it is slower, and drivers move to the other. This stops when each route has half the cars: ${nEn(n / 2)} cars, so ${n / 200} + 45 = ${b} minutes.`];
    if (e.short === n) {
      fr.push(`Avec la nouvelle route, un conducteur qui fait A→C→D→B prend les deux rues sans aucune voie rapide. Tant qu’une rue prend moins de 45 minutes, c’est plus rapide qu’une voie rapide : tout le monde finit par passer par C et D. Les deux rues ont alors ${n100(n)} voitures chacune : ${n / 100} + ${n / 100} = ${a} minutes. Personne n’a intérêt à revenir : la voie rapide prend 45 minutes et la rue qui reste ${n / 100}, soit ${n / 100 + 45} minutes, plus que ${a}.`);
      en.push(`With the new road, a driver going A→C→D→B uses both streets and no expressway. As long as a street takes less than 45 minutes, that beats an expressway: everyone ends up going through C and D. Both streets then carry ${nEn(n)} cars: ${n / 100} + ${n / 100} = ${a} minutes. Nobody gains by going back: the expressway takes 45 minutes and the remaining street ${n / 100}, which makes ${n / 100 + 45} minutes, more than ${a}.`);
    } else {
      fr.push(`Avec la nouvelle route, les deux rues se remplissent jusqu’à prendre 45 minutes chacune (4 500 voitures) : le raccourci et les voies rapides font alors jeu égal. ${n100(e.short)} conducteurs prennent le raccourci, ${n100(e.top)} chacun des deux autres trajets, et tout le monde met 45 + 45 = ${a} minutes.`);
      en.push(`With the new road, both streets fill up until each takes 45 minutes (4,500 cars): the shortcut and the expressways are then level. ${nEn(e.short)} drivers take the shortcut, ${nEn(e.top)} each of the two other routes, and everyone takes 45 + 45 = ${a} minutes.`);
    }
    fr.push(a > b ? `Chacun a choisi le plus rapide pour lui, et pourtant tout le monde met ${a} minutes au lieu de ${b}.` : `Ici la nouvelle route fait gagner du temps : ${a} minutes au lieu de ${b}. Avec plus de voitures, ce n’est plus vrai.`);
    en.push(a > b ? `Everyone chose the fastest route for themselves, and yet everyone takes ${a} minutes instead of ${b}.` : `Here the new road saves time: ${a} minutes instead of ${b}. With more cars, this is no longer true.`);
    return P(fr.join(" "), en.join(" "));
  },
};

export const original = (q) => P(
  `Avec ${n100(q.n)} conducteurs, montre qu’ouvrir la route C→D, qu’on parcourt en 0 minute, change la durée de chaque trajet de ${before(q.n)} à ${after(q.n)} minutes quand chacun choisit le trajet le plus rapide pour lui, et explique pourquoi aucun conducteur n’a intérêt à changer de trajet ensuite.`,
  `With ${nEn(q.n)} drivers, show that opening the road C→D, which takes 0 minutes, changes the length of each trip from ${before(q.n)} to ${after(q.n)} minutes when everyone chooses the fastest route for themselves, and explain why no driver gains by changing route afterwards.`);

// Emblem: the four places, the two routes and the new road in the middle (it pulses).
export const icon = svg(`<path d="M10 32L32 12L54 32L32 52Z"/>${dot(10, 32, 3.5)}${dot(54, 32, 3.5)}${dot(32, 12, 3)}${dot(32, 52, 3)}<path d="M32 15V49" class="ci-pulse" stroke-dasharray="4 3"/>`);
