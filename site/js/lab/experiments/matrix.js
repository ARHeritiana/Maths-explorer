// Experiment `matrix` (template transform): a 2 by 2 matrix M = (a b ; c d) acting on a grid and on the unit square. State {a, b, c, d}:
// the handles are the images of i and j, that is the columns of M (a ; c) and (b ; d), in the plane of arrival. The determinant
// ad - bc is the factor by which every area is multiplied (with its sign). Pure maths: models/matrix.js.
import * as X from "../models/matrix.js";
import { clamp } from "../models/num.js";

const { model } = X;
const LIM = 2.5, RANGE = 5.5;
const wrap = (num, x) => (x < 0 ? `(${num(x)})` : num(x));

export default {
  id: "matrix", template: "transform",
  symbol: "M", group: ["Algèbre", "Algebra"],
  title: ["Une matrice transforme le plan", "A matrix transforms the plane"],
  short: ["Matrices 2 × 2 et déterminant", "2 × 2 matrices and the determinant"],
  intro: [
    "Les colonnes d’une matrice 2 × 2 sont les images de i et de j. Déplace-les : le carré unité devient un parallélogramme, et le déterminant dit par combien l’aire est multipliée.",
    "The columns of a 2 × 2 matrix are the images of i and j. Move them: the unit square becomes a parallelogram, and the determinant says by how much the area is multiplied.",
  ],
  duration: 9,
  level: ["Maths expertes", "Further maths"],
  prereq: ["Coordonnées, aire d’un parallélogramme, déterminant de deux vecteurs", "Coordinates, area of a parallelogram, determinant of two vectors"],
  model: X,
  state: { a: 2, b: 1, c: 0, d: 2 },
  controls: {
    i: {
      kind: "handle", panel: "after", color: "accent", grid: 0.5, label: ["Image de i (première colonne de M)", "Image of i (first column of M)"],
      at: (s) => [s.a, s.c],
      drag: (s, x, y) => ({ a: clamp(x, -LIM, LIM), c: clamp(y, -LIM, LIM) }),
      valuetext: (s, f) => f.pt(s.a, s.c),
    },
    j: {
      kind: "handle", panel: "after", color: "obj2", grid: 0.5, label: ["Image de j (deuxième colonne de M)", "Image of j (second column of M)"],
      at: (s) => [s.b, s.d],
      drag: (s, x, y) => ({ b: clamp(x, -LIM, LIM), d: clamp(y, -LIM, LIM) }),
      valuetext: (s, f) => f.pt(s.b, s.d),
    },
  },
  views: {
    panels: ["before", "after"],
    before: {
      x: [-RANGE, RANGE], y: [-RANGE, RANGE], equal: true, xTicks: [-4, -2, 0, 2, 4], yTicks: [-4, -2, 0, 2, 4],
      scene(s, { fmt }) {
        return {
          polys: [{ pts: [[0, 0], [1, 0], [1, 1], [0, 1]], fill: "muted", alpha: 0.2, color: "muted", width: 2 }],
          lines: [
            { a: [0, 0], b: [1, 0], color: "accent", width: 3.5, arrow: true },
            { a: [0, 0], b: [0, 1], color: "obj2", width: 3.5, arrow: true },
          ],
          points: [
            { at: [1, 0], color: "accent", r: 4, label: "i", dx: 4, dy: 20 },
            { at: [0, 1], color: "obj2", r: 4, label: "j", dx: -14, dy: 6, anchor: "right" },
          ],
          texts: [{ at: [-RANGE + 0.2, RANGE - 0.7], text: fmt.t(["Départ : carré unité", "Before: unit square"]), color: "muted", size: 15 }],
        };
      },
    },
    after: {
      x: [-RANGE, RANGE], y: [-RANGE, RANGE], equal: true, xTicks: [-4, -2, 0, 2, 4], yTicks: [-4, -2, 0, 2, 4],
      scene(s, { fmt }) {
        const m = model(s), tone = m.orientation > 0 ? "pos" : m.orientation < 0 ? "neg" : "muted", grid = [];
        for (let k = -8; k <= 8; k++) grid.push({ a: m.f([-9, k]), b: m.f([9, k]), color: "accent", alpha: 0.28, width: 1.1 }, { a: m.f([k, -9]), b: m.f([k, 9]), color: "accent", alpha: 0.28, width: 1.1 });
        const mid = [(s.a + s.b) / 2, (s.c + s.d) / 2];
        return {
          lines: [...grid, { a: [0, 0], b: m.i, color: "accent", width: 3.5, arrow: true }, { a: [0, 0], b: m.j, color: "obj2", width: 3.5, arrow: true }],
          polys: [{ pts: m.polygon, fill: tone, alpha: m.invertible ? 0.22 : 0, color: tone, width: 2.2 }],
          points: [
            { at: m.i, color: "accent", r: 4.5, label: "M(i)", dx: 10, dy: 20 },
            { at: m.j, color: "obj2", r: 4.5, label: "M(j)", dx: 10, dy: -10 },
          ],
          texts: [
            ...(m.invertible ? [{ at: mid, text: fmt.rel(fmt.fr ? "aire" : "area", m.area), color: tone, anchor: "center", size: 17 }] : []),
            { at: [-RANGE + 0.2, RANGE - 0.7], text: fmt.t(m.invertible ? ["Arrivée : image par M", "After: image by M"] : ["Arrivée : aplati sur une droite", "After: flattened onto a line"]), color: "muted", size: 15 },
          ],
        };
      },
    },
    formula(s, { fmt }) {
      const m = model(s), num = fmt.num;
      return `det M = a × d − b × c = ${num(s.a)} × ${wrap(num, s.d)} − ${wrap(num, s.b)} × ${wrap(num, s.c)} ${fmt.eq(m.det)} ${num(m.det)}`;
    },
    readout(s, { fmt }) {
      const m = model(s), fr = fmt.fr, sep = fr ? " ; " : ", ";
      return [
        [["Colonnes de M", "Columns of M"], `i ↦ ${fmt.pt(s.a, s.c)}${sep}j ↦ ${fmt.pt(s.b, s.d)}`],
        [["Déterminant et aire", "Determinant and area"], `${fmt.rel("det M", m.det)}${sep}${fmt.rel(fr ? "aire" : "area", m.area)}`],
        [["Inverse de M (images de i et de j)", "Inverse of M (images of i and j)"], m.inverse ? `i ↦ ${fmt.pt(...m.inverse.i)}${sep}j ↦ ${fmt.pt(...m.inverse.j)}` : fr ? "aucun : det M = 0" : "none: det M = 0"],
      ];
    },
  },
  missions: [
    {
      id: "open", kind: "predict", set: { a: 2, b: 1, c: 0, d: 2 }, correct: 0,
      prompt: [
        "La matrice M = (a b ; c d) a pour colonnes (2 ; 0) et (1 ; 2) : elle envoie i sur (2 ; 0) et j sur (1 ; 2). Le carré unité a une aire de 1. Quelle sera l’aire de son image, le parallélogramme construit sur ces deux colonnes ?",
        "The matrix M = (a b ; c d) has columns (2, 0) and (1, 2): it sends i to (2, 0) and j to (1, 2). The unit square has area 1. What will be the area of its image, the parallelogram built on these two columns?",
      ],
      choices: [
        ["4", "4"],
        ["5", "5"],
        ["3", "3"],
      ],
    },
    {
      id: "columns", kind: "explore", set: { a: 1, b: 0, c: 0, d: 1 }, unlock: ["i"],
      prompt: [
        "On part de la matrice identité : i et j sont envoyés sur eux-mêmes. Fais glisser l’image de i jusqu’au point (2 ; 1). Quelle colonne de M lis-tu ? Et que devient l’image de j ?",
        "We start from the identity matrix: i and j are sent to themselves. Drag the image of i to the point (2, 1). Which column of M do you read? And what happens to the image of j?",
      ],
      hint: [
        "Les coordonnées de l’image de i sont la première colonne (a ; c) de M.",
        "The coordinates of the image of i are the first column (a, c) of M.",
      ],
      goal: (s) => s.a === 2 && s.c === 1,
      done: [
        "La première colonne est (2 ; 1) : a = 2 et c = 1. L’image de j n’a pas bougé : la deuxième colonne (b ; d) = (0 ; 1) ne dépend que de l’image de j.",
        "The first column is (2, 1): a = 2 and c = 1. The image of j has not moved: the second column (b, d) = (0, 1) depends only on the image of j.",
      ],
    },
    {
      id: "area", kind: "explore", set: { a: 2, b: 0, c: 0, d: 1 }, unlock: ["j"],
      prompt: [
        "L’image de i reste en (2 ; 0). Fais glisser l’image de j pour que l’image du carré unité ait une aire de 3. Quel est le déterminant de M ? Plusieurs positions conviennent : quel signe peut-il avoir ?",
        "The image of i stays at (2, 0). Drag the image of j so that the image of the unit square has area 3. What is the determinant of M? Several positions work: what sign can it have?",
      ],
      hint: [
        "Avec c = 0, det M = 2 × d. Il faut |2 d| = 3.",
        "With c = 0, det M = 2 × d. We need |2 d| = 3.",
      ],
      goal: (s, m) => m.area === 3,
      done: [
        "det M = 2 d = 3 donne d = 1,5, et d = −1,5 donne det M = −3. L’aire de l’image est |det M| = 3 dans les deux cas ; le signe dit si l’orientation est conservée (positif) ou renversée (négatif).",
        "det M = 2 d = 3 gives d = 1.5, and d = −1.5 gives det M = −3. The area of the image is |det M| = 3 in both cases; the sign says whether the orientation is kept (positive) or reversed (negative).",
      ],
    },
    {
      id: "flat", kind: "explore", set: { a: 1, b: 0, c: 0, d: 1 }, unlock: ["i", "j"],
      prompt: [
        "Trouve une matrice qui n’est pas la matrice nulle et qui écrase le carré unité sur un segment : fais glisser les images de i et de j. Que vaut alors le déterminant ? Que devient l’inverse de M ?",
        "Find a matrix that is not the zero matrix and flattens the unit square onto a segment: drag the images of i and j. What is the determinant then? What happens to the inverse of M?",
      ],
      hint: [
        "Les deux images doivent être sur une même droite passant par l’origine : les colonnes sont colinéaires.",
        "Both images must lie on one line through the origin: the columns are collinear.",
      ],
      goal: (s, m) => m.det === 0 && (s.a !== 0 || s.b !== 0 || s.c !== 0 || s.d !== 0),
      done: [
        "det M = 0 : les deux colonnes sont colinéaires et le plan entier est écrasé sur une droite. M n’a pas d’inverse : des points différents ont la même image, on ne peut pas revenir en arrière.",
        "det M = 0: the two columns are collinear and the whole plane is flattened onto a line. M has no inverse: different points have the same image, so you cannot go back.",
      ],
    },
    {
      id: "read", kind: "check", set: { a: 2, b: 1, c: -1, d: 2 }, quantity: "det", answer: 5, tolerance: 0.01,
      prompt: [
        "Lis sur la figure les images de i et de j, c’est-à-dire les colonnes (a ; c) et (b ; d) de M. Calcule ensuite le déterminant ad − bc. Que vaut-il ?",
        "Read on the figure the images of i and j, that is the columns (a, c) and (b, d) of M. Then compute the determinant ad − bc. What is it?",
      ],
      hint: [
        "Ici a = 2, b = 1, c = −1 et d = 2 : 2 × 2 − 1 × (−1).",
        "Here a = 2, b = 1, c = −1 and d = 2: 2 × 2 − 1 × (−1).",
      ],
      because: [
        "det M = 2 × 2 − 1 × (−1) = 4 + 1 = 5 : le carré unité est envoyé sur un parallélogramme d’aire 5, orienté comme le carré de départ car le déterminant est positif.",
        "det M = 2 × 2 − 1 × (−1) = 4 + 1 = 5: the unit square is sent to a parallelogram of area 5, oriented like the starting square because the determinant is positive.",
      ],
    },
    {
      id: "why", kind: "explain",
      prompt: [
        "Pourquoi l’aire de l’image du carré unité vaut-elle |ad − bc|, et pourquoi M multiplie-t-elle par ce même nombre l’aire de n’importe quelle figure ?",
        "Why is the area of the image of the unit square |ad − bc|, and why does M multiply the area of any figure by this same number?",
      ],
      argument: [
        "L’image du carré unité est le parallélogramme construit sur les vecteurs (a ; c) et (b ; d), dont l’aire est la valeur absolue du déterminant |ad − bc| (voir l’expérience sur les vecteurs). Pour une figure quelconque, on la recouvre de petits carrés du quadrillage de côté h : M les envoie sur des parallélogrammes de même forme, d’aire h² |ad − bc|, car M agit de la même façon sur tous les carrés (elle est linéaire). Les aires sont donc toutes multipliées par |ad − bc|. Quelques figures illustrent ce résultat ; le calcul de l’aire du parallélogramme le démontre.",
        "The image of the unit square is the parallelogram built on the vectors (a, c) and (b, d), whose area is the absolute value of the determinant |ad − bc| (see the vectors experiment). For any figure, cover it with small grid squares of side h: M sends them to parallelograms of the same shape, of area h² |ad − bc|, because M acts the same way on every square (it is linear). So all areas are multiplied by |ad − bc|. A few figures illustrate this; computing the area of the parallelogram proves it.",
      ],
    },
  ],
  conclusion: [
    "Une matrice M = (a b ; c d) envoie i sur (a ; c) et j sur (b ; d). Le carré unité devient le parallélogramme construit sur ces deux colonnes, d’aire |ad − bc|, et M multiplie toutes les aires par |ad − bc|. Si ad − bc = 0, le plan est écrasé sur une droite et M n’est pas inversible ; sinon M⁻¹ = (1/(ad − bc)) (d −b ; −c a). Quelques matrices illustrent ces faits ; le calcul de l’aire d’un parallélogramme les démontre.",
    "A matrix M = (a b ; c d) sends i to (a, c) and j to (b, d). The unit square becomes the parallelogram built on those two columns, of area |ad − bc|, and M multiplies every area by |ad − bc|. If ad − bc = 0 the plane is flattened onto a line and M is not invertible; otherwise M⁻¹ = (1/(ad − bc)) (d −b ; −c a). A few matrices illustrate these facts; computing the area of a parallelogram proves them.",
  ],
  history: {
    title: ["Cayley · 1858", "Cayley · 1858"],
    story: [
      "Arthur Cayley publia en 1858 un mémoire sur la théorie des matrices, où les tableaux de nombres sont additionnés, multipliés et inversés comme des objets à part entière.",
      "Arthur Cayley published a memoir on the theory of matrices in 1858, in which arrays of numbers are added, multiplied and inverted as objects in their own right.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Cayley/",
  },
};
