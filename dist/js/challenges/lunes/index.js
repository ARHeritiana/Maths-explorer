// The lunes challenge: card text, variations (checked answer, statement, solution text), original question, emblem and
// hint actions. Everything else about this challenge is in this folder; registry.js lists the folders.
import { int, P } from "../common/helpers.js";
import { svg, soft } from "../common/icon.js";
import { luneTotal } from "./maths.js";
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export { scene } from "./solution.js";

export const card = {
  id: "lunes",
  type: "play",
  title: ["Les lunules d’Hippocrate", "Hippocrates’ lunes"],
  topic: ["Aires et cercles", "Areas and circles"],
  difficulty: 2,
  minutes: 10,
  hints: [],
  extension: ["Que devient la somme des aires des lunules si le triangle n’est plus rectangle ? Compare avec l’aire du triangle.", "What becomes of the total area of the lunes if the triangle is no longer right-angled? Compare it with the area of the triangle."],
};

export const variant = {
  params: [int("a", "Côté CA (cm)", "Side CA (cm)", 2, 20, 6, 2), int("b", "Côté CB (cm)", "Side CB (cm)", 2, 20, 8)],
  answer: (q) => luneTotal(q.a, q.b),
  prompt: (q) => P(`Un triangle ABC est rectangle en C, avec CA = ${q.a} cm et CB = ${q.b} cm. On trace le demi-disque de diamètre CA et le demi-disque de diamètre CB, à l’extérieur du triangle, ainsi que le cercle de diamètre AB (qui passe par C). Les deux « lunules » sont les parties de ces deux demi-disques situées à l’extérieur du cercle de diamètre AB. Quelle est l’aire totale des deux lunules, en cm² ?`, `A triangle ABC has a right angle at C, with CA = ${q.a} cm and CB = ${q.b} cm. Draw the half-disc on diameter CA and the half-disc on diameter CB, outside the triangle, and the circle with diameter AB (which passes through C). The two “lunes” are the parts of these two half-discs lying outside the circle of diameter AB. What is the total area of the two lunes, in cm²?`),
  hints: (q) => [P("Compare les aires des deux petits demi-disques avec celle du demi-disque de diamètre AB (théorème de Pythagore).", "Compare the areas of the two small half-discs with that of the half-disc on diameter AB (Pythagoras’ theorem)."), P("Chaque lunule, c’est un petit demi-disque privé d’un segment circulaire du grand cercle. Que reste-t-il quand on enlève ces deux segments du demi-disque de l’hypoténuse ?", "Each lune is a small half-disc minus a circular segment of the big circle. What is left when these two segments are removed from the half-disc on the hypotenuse?")],
  solution: (q) => { const c2 = q.a * q.a + q.b * q.b; return P(`Notons D₁ et D₂ les petits demi-disques, H le demi-disque de diamètre AB situé du côté de C, T le triangle, S₁ et S₂ les segments circulaires entre les côtés CA, CB et l’arc. Chaque petit demi-disque est une lunule plus un segment : D₁ = L₁ + S₁ et D₂ = L₂ + S₂. Par ailleurs H = T + S₁ + S₂. Pythagore donne D₁ + D₂ = (π/8)(CA² + CB²) = (π/8)AB² = H. Donc L₁ + L₂ = D₁ + D₂ − (S₁ + S₂) = H − (H − T) = T. L’aire des lunules est celle du triangle : ${q.a} × ${q.b} / 2 = ${(q.a * q.b) / 2} cm² (AB² = ${c2}, mais l’aire des lunules n’en dépend pas, et π disparaît).`, `Call D₁ and D₂ the small half-discs, H the half-disc on diameter AB on the side of C, T the triangle, S₁ and S₂ the circular segments between the sides CA, CB and the arc. Each small half-disc is a lune plus a segment: D₁ = L₁ + S₁ and D₂ = L₂ + S₂. Also H = T + S₁ + S₂. Pythagoras gives D₁ + D₂ = (π/8)(CA² + CB²) = (π/8)AB² = H. So L₁ + L₂ = D₁ + D₂ − (S₁ + S₂) = H − (H − T) = T. The area of the lunes is that of the triangle: ${q.a} × ${q.b} / 2 = ${(q.a * q.b) / 2} cm² (AB² = ${c2}, but the lunes’ area does not depend on it, and π cancels).`); },
};

export const original = () => P(
"Compare l’aire totale des deux lunules à l’aire du triangle ABC. Que remarques-tu ? Démontre-le sans utiliser de valeur approchée de π.",
"Compare the total area of the two lunes with the area of triangle ABC. What do you notice? Prove it without using an approximate value of π.");

export const icon = svg(`<circle cx="26" cy="34" r="20"/><circle class="ci-pulse" cx="40" cy="30" r="16" ${soft}/><path d="M6 34h40" stroke-opacity=".4"/>`);
