// Experiment `quadratic` (template family): the parabola workshop. State {a, b, c}; the handles act on the vertex, on the
// opening (point P, one unit right of the vertex) and on the y-intercept. Pure maths: models/quadratic.js.
import * as Q from "../models/quadratic.js";
import { clamp } from "../models/num.js";

const { model, fromVertex } = Q;

// Change a and keep the vertex where it is (b and c follow); a is never 0 here.
function setA(s, v) {
  let a = clamp(Math.round(v * 4) / 4, -3, 3);
  if (a === 0) a = v < 0 ? -0.25 : 0.25;
  const m = model(s);
  return { a, ...fromVertex(a, m.alpha, m.beta) };
}
const sgn = (v) => (v < 0 ? "−" : "+");
function expanded(s, num) {
  const parts = [[s.a, "x²"], [s.b, "x"], [s.c, ""]].filter(([k]) => k !== 0);
  return parts.map(([k, x], i) => `${i ? ` ${sgn(k)} ` : k < 0 ? "−" : ""}${Math.abs(k) === 1 && x ? "" : num(Math.abs(k))}${x}`).join("") || "0";
}
function canonical(m, num) {
  const lead = Math.abs(m.a) === 1 ? (m.a < 0 ? "−" : "") : num(m.a);
  const sq = m.alpha === 0 ? "x²" : `(x ${m.alpha < 0 ? "+" : "−"} ${num(Math.abs(m.alpha))})²`;
  return `${lead}${sq}${m.beta === 0 ? "" : ` ${sgn(m.beta)} ${num(Math.abs(m.beta))}`}`;
}

export default {
  id: "quadratic", template: "family",
  symbol: "ƒ", group: ["Algèbre", "Algebra"],
  title: ["La fabrique des paraboles", "The parabola workshop"],
  short: ["Fonctions du second degré", "Quadratic functions"],
  intro: [
    "Que change chaque coefficient ? Déplace le sommet, l’ouverture et l’ordonnée à l’origine, et regarde les formules suivre la courbe.",
    "What does each coefficient change? Move the vertex, the opening and the y-intercept, and watch the formulas follow the curve.",
  ],
  duration: 8,
  level: ["Seconde · Première", "Foundation · Intermediate"],
  prereq: ["Coordonnées, carrés, équations", "Coordinates, squares, equations"],
  model: Q,
  state: { a: 1, b: 0, c: -2 },
  ease: ['a', 'b', 'c'],   // continuous keys the figure glides toward (shell.js); handles marked `soft` are free with a magnet
  presentationControls: ["a", "form", "coordinate1", "coordinate2", "orientation", "rootCase"],
  controls: {
    form: {
      kind: "choice", label: ["Paramètres", "Parameters"], get: Q.inputForm,
      options: [{value:"abc",label:["a, b, c","a, b, c"]},{value:"vertex",label:["a, α, β","a, α, β"]},{value:"roots",label:["a, x₁, x₂","a, x₁, x₂"]}],
      set: (s, form) => form === "roots" && !model(s).roots.length ? {form:"vertex", modeWarning:true} : {form, modeWarning:false},
    },
    coordinate1: {
      kind:"slider", min:-96, max:96, step:0.25, label:["b / α / x₁", "b / α / x₁"],
      range:s=>Q.inputForm(s)==="abc"?[-96,96]:[-6,6],
      get:s=>Q.coordinates(s)[0], set:(s,v)=>Q.editCoordinate(s,0,v),
    },
    coordinate2: {
      kind:"slider", min:-96, max:96, step:0.25, label:["c / β / x₂", "c / β / x₂"],
      range:s=>Q.inputForm(s)==="abc"?[-96,96]:Q.inputForm(s)==="roots"?[-6,6]:[-6,8],
      get:s=>Q.coordinates(s)[1], set:(s,v)=>Q.editCoordinate(s,1,v),
    },
    orientation: {
      kind:"choice", label:["Ouverture", "Opening"], get:s=>Math.sign(s.a),
      options:[{value:1,label:["a > 0","a > 0"]},{value:-1,label:["a < 0","a < 0"]}],
      set:(s,sign)=>Math.sign(s.a)===sign?null:Q.orientation(s,sign),
    },
    rootCase: {
      kind:"choice", label:["Discriminant", "Discriminant"], get:s=>Math.sign(model(s).discriminant),
      options:[{value:1,label:["Δ > 0","Δ > 0"]},{value:0,label:["Δ = 0","Δ = 0"]},{value:-1,label:["Δ < 0","Δ < 0"]}],
      set:Q.rootCase,
    },
    vertex: {
      kind: "handle", soft: true, color: "accent", label: ["Sommet S", "Vertex S"], grid: 0.5,
      at: (s) => { const m = model(s); return [m.alpha, m.beta]; },
      drag: (s, x, y) => fromVertex(s.a, clamp(x, -6, 6), clamp(y, -6, 8)),
      valuetext: (s, f) => { const m = model(s); return f.pt(m.alpha, m.beta); },
    },
    opening: {
      kind: "handle", soft: true, color: "obj2", axis: "y", grid: [1, 0.25], label: ["Point P (à une unité du sommet)", "Point P (one unit from the vertex)"],
      at: (s) => { const m = model(s); return [m.alpha + 1, m.beta + s.a]; },
      drag: (s, x, y) => setA(s, y - model(s).beta),
      valuetext: (s, f) => `a = ${f.num(s.a)}`,
    },
    yint: {
      kind: "handle", soft: true, color: "obj3", axis: "y", grid: [1, 0.5], label: ["Point C (ordonnée à l’origine)", "Point C (y-intercept)"],
      at: (s) => [0, s.c],
      drag: (s, x, y) => ({ c: clamp(y, -6, 8) }),
      valuetext: (s, f) => `c = ${f.num(s.c)}`,
    },
    a: {
      kind: "slider", min: -3, max: 3, step: 0.25, label: ["a (ouverture)", "a (opening)"],
      get: (s) => s.a, set: (s, v) => {
        const a = v === 0 ? (s.a < 0 ? -0.25 : 0.25) : v;
        return Q.inputForm(s) === "abc" ? {a} : Q.inputForm(s) === "roots" ? {a, ...Q.fromRoots(a,...Q.coordinates(s))} : setA(s,a);
      },
    },
  },
  views: {
    panels: ["graph"],
    graph: {
      x: [-6, 6], y: [-6, 8], xTicks: [-6, -4, -2, 0, 2, 4, 6], yTicks: [-6, -4, -2, 0, 2, 4, 6, 8],
      scene(s, { fmt }) {
        const m = model(s), num = fmt.num;
        return {
          curves: [{ f: m.f, color: "accent", width: 3 }],
          lines: [{ a: [m.alpha, -6], b: [m.alpha, 8], color: "muted", dash: [6, 5], width: 1.5 }],
          points: [
            // a double root is the vertex itself, which already carries its coordinates
            ...m.roots.map((r) => ({ at: [r, 0], color: "pos", r: 6, label: m.roots.length === 2 ? fmt.read(r) : undefined, dy: -12 })),
            { at: [0, s.c], color: "obj3", r: 5 },
            { at: [m.alpha, m.beta], color: "accent", r: 5, label: fmt.pt(m.alpha, m.beta), dx: 16, dy: 32 },
          ],
        };
      },
    },
    formula(s, { fmt }) {
      // Two decimals, marked ≈ whenever a coefficient was rounded: a point placed freely gives long decimals that nobody reads.
      const m = model(s), num = (v) => fmt.num(v, 2);
      const first = expanded(s, num), second = canonical(m, num);
      const exactFirst = [s.a,s.b,s.c].every(v=>fmt.isExact(v,2));
      const exactSecond = [m.a,m.alpha,m.beta].every(v=>fmt.isExact(v,2));
      return `f(x) ${exactFirst ? "=" : "≈"} ${first}${first === second ? "" : ` ${exactSecond ? "=" : "≈"} ${second}`}`;
    },
    readout(s, { fmt }) {
      const m = model(s), num = fmt.num, fr = fmt.fr;
      const roots = m.roots.length === 0 ? (fr ? "aucune racine réelle" : "no real root")
        : m.roots.length === 1 ? (fr ? `racine double ${fmt.rel("x₀", m.roots[0])}` : `double root ${fmt.rel("x₀", m.roots[0])}`)
        : `${fmt.rel("x₁", m.roots[0])}${fr ? " ; " : ", "}${fmt.rel("x₂", m.roots[1])}`;
      return [
        [["a ; b ; c", "a, b, c"], fr ? `${fmt.read(s.a)} ; ${fmt.read(s.b)} ; ${fmt.read(s.c)}` : `${fmt.read(s.a)}, ${fmt.read(s.b)}, ${fmt.read(s.c)}`],
        [["Sommet (α ; β)", "Vertex (α, β)"], fmt.pt(m.alpha, m.beta)],
        [["Δ et racines", "Δ and roots"], `${fmt.rel("Δ", m.discriminant, 4)} ; ${roots}`],
        [["Paramètres actifs", "Active parameters"], s.modeWarning || s.form === "roots" && !m.roots.length
          ? (fr ? "Pas de racine réelle : utiliser a, α, β." : "No real roots: use a, α, β.")
          : Q.inputForm(s) === "abc" ? "a, b, c" : Q.inputForm(s) === "roots" ? "a, x₁, x₂" : "a, α, β"],
      ];
    },
  },
  missions: [
    {
      id: "open", kind: "predict", set: { a: 1, b: 0, c: -2 }, correct: 0,
      prompt: [
        "La parabole f(x) = x² − 2 s’ouvre vers le haut ; son sommet est S(0 ; −2). On rend a négatif sans déplacer le sommet. Que fait la parabole ?",
        "The parabola f(x) = x² − 2 opens upward; its vertex is S(0, −2). We make a negative without moving the vertex. What does the parabola do?",
      ],
      choices: [
        ["Elle s’ouvre vers le bas.", "It opens downward."],
        ["Elle s’ouvre toujours vers le haut, mais plus étroite.", "It still opens upward, but narrower."],
        ["On ne peut pas le savoir sans calculer.", "You cannot tell without calculating."],
      ],
    },
    {
      id: "sign", kind: "explore", set: { a: 1, b: 0, c: -2 }, unlock: ["opening", "a"],
      prompt: [
        "Fais glisser le point P (ou le curseur) jusqu’à ce que la parabole s’ouvre vers le bas. Le sommet S ne bouge pas : est-ce un minimum ou un maximum de la fonction ?",
        "Drag the point P (or the slider) until the parabola opens downward. The vertex S does not move: is it a minimum or a maximum of the function?",
      ],
      hint: [
        "Le point P est à une unité à droite du sommet : sa hauteur au-dessus du sommet vaut a.",
        "Point P is one unit to the right of the vertex: its height above the vertex equals a.",
      ],
      goal: (s, m) => m.a < 0,
      done: [
        "Quand a < 0, la parabole s’ouvre vers le bas et le sommet est son point le plus haut : un maximum. Quand a > 0, c’est un minimum.",
        "When a < 0 the parabola opens downward and the vertex is its highest point: a maximum. When a > 0 it is a minimum.",
      ],
    },
    {
      id: "vertex", kind: "explore", set: { a: 1, b: 0, c: 0 }, unlock: ["vertex"],
      prompt: [
        "Déplace le sommet S jusqu’au point (2 ; −1). Sous la figure, la formule affiche les deux écritures de f(x) : comment le sommet se lit-il dans l’écriture (x − 2)² − 1 ?",
        "Move the vertex S to the point (2, −1). Under the figure, the formula shows both ways of writing f(x): how is the vertex read in the form (x − 2)² − 1?",
      ],
      hint: [
        "Dans a(x − α)² + β, le sommet est (α ; β). Les coefficients b et c s’en déduisent : b = −2aα et c = aα² + β.",
        "In a(x − α)² + β the vertex is (α, β). The coefficients follow: b = −2aα and c = aα² + β.",
      ],
      goal: (s, m) => m.alpha === 2 && m.beta === -1,
      done: [
        "Avec a = 1, f(x) = (x − 2)² − 1 = x² − 4x + 3. Le sommet (α ; β) se lit tout de suite dans la forme canonique ; il faut développer pour retrouver b et c.",
        "With a = 1, f(x) = (x − 2)² − 1 = x² − 4x + 3. The vertex (α, β) is read at once from the canonical form; you must expand to recover b and c.",
      ],
    },
    {
      id: "roots", kind: "contrast", set: { a: 1, b: 0, c: -2 }, unlock: ["yint"],
      variants: [
        { label: ["Cas A : c = −2", "Case A: c = −2"], set: { c: -2 } },
        { label: ["Cas B : c = 3", "Case B: c = 3"], set: { c: 3 } },
      ],
      prompt: [
        "Compare les deux cas (boutons A et B), puis fais glisser le point C. Quel lien vois-tu entre le signe de Δ = b² − 4ac et le nombre de points où la parabole coupe l’axe des abscisses ?",
        "Compare the two cases (buttons A and B), then drag the point C. What link do you see between the sign of Δ = b² − 4ac and the number of points where the parabola meets the x-axis?",
      ],
      done: [
        "Δ > 0 : deux points d’intersection. Δ = 0 : un seul, le sommet est sur l’axe. Δ < 0 : aucun.",
        "Δ > 0: two intersection points. Δ = 0: just one, the vertex is on the axis. Δ < 0: none.",
      ],
    },
    {
      id: "read", kind: "check", set: { a: 2, b: -8, c: 6 }, quantity: "beta", answer: -2, tolerance: 0.01,
      prompt: [
        "La figure montre f(x) = 2x² − 8x + 6. Lis les coordonnées du sommet sur le graphique : quelle est son ordonnée β ?",
        "The figure shows f(x) = 2x² − 8x + 6. Read the vertex coordinates on the graph: what is its y-coordinate β?",
      ],
      hint: [
        "Cherche le point le plus bas de la courbe. Son abscisse est α = −b/(2a) = 2 ; son ordonnée est f(2).",
        "Look for the lowest point of the curve. Its x-coordinate is α = −b/(2a) = 2; its y-coordinate is f(2).",
      ],
      because: ["Ici f(x) = 2(x − 2)² − 2, donc β = −2.", "Here f(x) = 2(x − 2)² − 2, so β = −2."],
    },
    {
      id: "why", kind: "explain",
      prompt: [
        "Pourquoi le sommet est-il exactement au milieu des deux racines quand la parabole en a deux ?",
        "Why is the vertex exactly halfway between the two roots when the parabola has two?",
      ],
      argument: [
        "La parabole est symétrique par rapport à la droite d’équation x = α : f(α + u) = au² + β = f(α − u). Si α + u est une racine, α − u en est une aussi, donc α est le milieu des deux racines. En développant, α = −b/(2a), qui est aussi la demi-somme (x₁ + x₂)/2.",
        "The parabola is symmetric about the line x = α: f(α + u) = au² + β = f(α − u). If α + u is a root, so is α − u, hence α is the midpoint of the two roots. Expanding, α = −b/(2a), which is also the half-sum (x₁ + x₂)/2.",
      ],
    },
  ],
  conclusion: [
    "Pour tout x, f(x) = a(x + b/(2a))² − Δ/(4a) : c’est la forme canonique. Le sommet a pour abscisse −b/(2a). L’équation f(x) = 0 équivaut à (x + b/(2a))² = Δ/(4a²) : deux, une ou aucune solution réelle selon le signe de Δ. Ce raisonnement suppose a ≠ 0.",
    "For every x, f(x) = a(x + b/(2a))² − Δ/(4a): this is the canonical form. The vertex has x-coordinate −b/(2a). The equation f(x) = 0 is equivalent to (x + b/(2a))² = Δ/(4a²): two, one or no real solutions depending on the sign of Δ. This argument assumes a ≠ 0.",
  ],
  history: {
    title: ["Al-Khwarizmi · IXe siècle", "Al-Khwarizmi · 9th century"],
    story: [
      "Al-Khwarizmi présentait des méthodes de résolution d’équations du second degré par des arguments géométriques. Le mot « algèbre » vient d’al-jabr, dans le titre de son traité.",
      "Al-Khwarizmi presented methods for solving quadratic equations using geometric arguments. “Algebra” comes from al-jabr in the title of his treatise.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Al-Khwarizmi/",
  },
};
