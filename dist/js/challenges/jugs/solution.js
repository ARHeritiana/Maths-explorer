// Animated solution of the jugs challenge, a pure function of (step, progress): the states (x, y) as points of a table, the
// moves as segments along its edges, the shortest sequence played on the jugs, and the gcd argument. See common/player.js.
import { P, ez, mid } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { parseJugs, jugsSolve, gcd, moveText } from "./maths.js";

export const diagram = {
  size: [520, 300],
  steps: (q) => {
    const [a, b, t] = parseJugs(q.jugs), path = jugsSolve(a, b, t), g = gcd(a, b);
    return [
      P(`Deux bidons de ${a} L et ${b} L. On note (x ; y) les litres contenus : on part de (0 ; 0) et on veut ${t} L dans un bidon.`, `Two jugs of ${a} L and ${b} L. Write (x, y) for the litres they hold: we start at (0, 0) and want ${t} L in a jug.`),
      P(`Chaque état est un point de la table, x de 0 à ${a}, y de 0 à ${b}. Après chaque opération, un bidon est vide ou plein : on est toujours sur le bord de la table.`, `Each state is a point of the table, x from 0 to ${a}, y from 0 to ${b}. After each operation a jug is empty or full: we are always on the edge of the table.`),
      P(`Remplir, vider ou transvaser ne fait qu’ajouter ou retirer ${a} ou ${b} litres au total : chaque quantité obtenue est un multiple de pgcd(${a} ; ${b}) = ${g}.`, `Filling, emptying or pouring only adds or removes ${a} or ${b} litres in total: every amount obtained is a multiple of gcd(${a}, ${b}) = ${g}.`),
      path ? P(`${t} est un multiple de ${g} : c’est possible. La suite la plus courte compte ${path.length} opérations.`, `${t} is a multiple of ${g}: it is possible. The shortest sequence has ${path.length} operations.`) : P(`${t} n’est pas un multiple de ${g}${t > Math.max(a, b) ? " ou ne tient dans aucun bidon" : ""} : c’est impossible. Réponse : 0.`, `${t} is not a multiple of ${g}${t > Math.max(a, b) ? " or fits in no jug" : ""}: it is impossible. Answer: 0.`),
    ];
  },
  draw(c, s, p, q) {
    const [a, b, t] = parseJugs(q.jugs), path = jugsSolve(a, b, t) || [];
    const sx = 230 / a, sy = 230 / b, X = (x) => 260 + x * sx, Y = (y) => 260 - y * sy;
    const states = [[0, 0], ...path.map((x) => x.state)];
    // jugs on the left
    const shown = s < 3 ? 0 : Math.min(states.length - 1, Math.floor(ez(p) * states.length));
    const [x, y] = states[s < 3 ? 0 : shown];
    const jug = (left, litres, size, i) => { const cap = Math.max(a, b), h = 200 * (size / cap), y0 = 260 - h; c.rect(left, y0 + h - h * (litres / size), 60, h * (litres / size), { fill: `color-mix(in srgb, ${colour(i)} 45%, var(--surface))` }); c.path(`M${left} ${y0}V260H${left + 60}V${y0}`, { fill: "none", stroke: "var(--ink)", "stroke-width": 2 }); c.text(left + 30, 285, `${litres} / ${size} L`, { ...mid, class: "sol-small" }); };
    jug(30, x, a, 0); jug(130, y, b, 2);
    if (s >= 1) {
      for (let i = 0; i <= a; i++) for (let j = 0; j <= b; j++) c.circ(X(i), Y(j), 2.4, { fill: s >= 2 && (i === t || j === t) ? "var(--pos)" : "var(--line-strong)" });
      c.path(`M${X(0)} ${Y(0)}H${X(a)}V${Y(b)}H${X(0)}Z`, { fill: "none", stroke: "var(--line-strong)" });
    }
    if (s >= 3 && path.length) {
      const pts = states.slice(0, shown + 1).map(([u, v]) => `${X(u)},${Y(v)}`).join(" ");
      c.path(`M${pts.replaceAll(" ", " L")}`, { fill: "none", stroke: colour(0), "stroke-width": 2.5 });
      c.circ(X(x), Y(y), 6, { fill: colour(0) });
      if (shown > 0) c.text(260, 24, moveText(path[shown - 1].move, a, b)[c.t(0, 1)], { ...mid, class: "sol-small" });
    }
    if (s === 3) c.text(470, 24, String(path.length), { ...mid, class: "sol-hot" });
  },
};
