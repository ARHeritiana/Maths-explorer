// The star challenge: card text, variations (checked answer, statement, solution text), original question, emblem and
// hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
import { int, P } from "../common/helpers.js";
import { svg, soft, dot } from "../common/icon.js";
import { starSumDegrees, starK } from "./maths.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export { scene } from "./solution.js";

export const starPts = [0, 1, 2, 3, 4].map((i) => { const a = ((i * 144 - 90) * Math.PI) / 180; return `${(32 + 24 * Math.cos(a)).toFixed(1)},${(32 + 24 * Math.sin(a)).toFixed(1)}`; }).join(" ");

export const card = {
  id: "star",
  type: "olympiad",
  title: ["Les angles de l’étoile", "The angles of the star"],
  topic: ["Angles et cercle", "Angles and circles"],
  difficulty: 2,
  minutes: 10,
  hints: [],
  extension: ["Que devient la somme des angles aux pointes d’une étoile à 5 branches dessinée sans régularité (cinq points quelconques sur un cercle) ?", "What becomes of the sum of the tip angles of a 5-pointed star drawn without regularity (five arbitrary points on a circle)?"],
};

export const variant = {
  params: [int("n", "Nombre de sommets", "Number of vertices", 5, 13, 5), int("k", "Saut k", "Skip k", 2, 5, 2)],
  answer: (q) => starSumDegrees(q.n, starK(q.n, q.k)),
  prompt: (q) => { const k = starK(q.n, q.k); return P(`On place ${q.n} points régulièrement sur un cercle et on relie chacun au ${k === 1 ? "suivant" : `${k}-ième suivant`} : on obtient ${k === 1 ? "un polygone convexe" : `l’étoile {${q.n}/${k}}`}. On mesure l’angle en chacune des ${q.n} pointes. Quelle est la somme de ces ${q.n} angles, en degrés ?`, `Place ${q.n} points evenly on a circle and join each to the ${k === 1 ? "next one" : `${k}${k === 2 ? "nd" : k === 3 ? "rd" : "th"} next one`}: this gives ${k === 1 ? "a convex polygon" : `the star {${q.n}/${k}}`}. Measure the angle at each of the ${q.n} tips. What is the sum of these ${q.n} angles, in degrees?`); },
  hints: (q) => [P("Une pointe est formée de deux cordes issues du même point du cercle : c’est un angle inscrit.", "A tip is formed by two chords from the same point of the circle: it is an inscribed angle."), P("Un angle inscrit vaut la moitié de l’arc qu’il intercepte. Combien de « pas » de 360°/n contient l’arc intercepté par une pointe ?", "An inscribed angle is half the arc it intercepts. How many “steps” of 360°/n does the arc intercepted by a tip contain?")],
  solution: (q) => { const k = starK(q.n, q.k), n = q.n; return P(`Une pointe est l’angle inscrit entre les cordes qui vont aux sommets situés k = ${k} pas avant et après. Il intercepte l’arc qui ne contient pas la pointe, soit n − 2k = ${n - 2 * k} pas de 360°/${n}. Un angle inscrit vaut la moitié de l’arc intercepté : angle d’une pointe = ½ × ${n - 2 * k} × 360°/${n} = ${(180 * (n - 2 * k)) / n}°. Somme des ${n} pointes : ${n} × ${(180 * (n - 2 * k)) / n}° = 180° × ${n - 2 * k} = ${180 * (n - 2 * k)}°. Pour le pentagramme {5/2}, on retrouve 180° (36° par pointe).`, `A tip is the inscribed angle between the chords to the vertices k = ${k} steps before and after. It intercepts the arc not containing the tip, which is n − 2k = ${n - 2 * k} steps of 360°/${n}. An inscribed angle is half the intercepted arc: angle at a tip = ½ × ${n - 2 * k} × 360°/${n} = ${(180 * (n - 2 * k)) / n}°. Sum over the ${n} tips: ${n} × ${(180 * (n - 2 * k)) / n}° = 180° × ${n - 2 * k} = ${180 * (n - 2 * k)}°. For the pentagram {5/2} this gives 180° (36° per tip).`); },
};

export const original = (q) => P(
`Que vaut la somme des angles aux pointes de l’étoile {${q.n}/${q.k}} ? Démontre ton résultat, puis explore d’autres étoiles : la somme change-t-elle avec le nombre de points et avec le pas ?`,
`What is the sum of the point angles of the star {${q.n}/${q.k}}? Prove your result, then explore other stars: does the sum change with the number of points and with the step?`);

export const icon = svg(`<polygon class="ci-spin-slow" points="${starPts}" ${soft}/>${dot(32, 8, 3.2)}`);
