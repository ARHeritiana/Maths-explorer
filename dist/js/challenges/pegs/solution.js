// Animated solution of the pegs challenge, a pure function of (step, progress). `diagram` holds the captions (steps) and,
// without a `scene`, draws the frames; a `scene` (mount once, then update) replaces the drawing. See common/player.js.
import { P, ez, mid } from "../common/helpers.js";
import { colour } from "../common/kit.js";
import { seg } from "../common/scene-kit.js";
import { pegTarget, pegsSolve, pegClass, PEGS_START, pegsRun, PEGS_SHIFTS } from "./maths.js";

/* ------------------------------------------------------------ three pegs */
export const diagram = {
  size: [520, 300],
  steps: (q) => { const T = pegTarget(q.target), sol = pegsSolve(T), cls = pegClass(T).join(", "); return [
    P(`Trois pions A, B, C en (0, 0), (1, 0), (0, 1). Un pion saute par-dessus un autre et atterrit au point symétrique. Peut-on mettre un pion en (${T.join(", ")}) ?`, `Three pegs A, B, C at (0, 0), (1, 0), (0, 1). A peg jumps over another and lands on the symmetric point. Can a peg be put on (${T.join(", ")})?`),
    P("A saute par-dessus B : il arrive en 2B − A, tel que B soit le milieu du saut. Ici (2, 0).", "A jumps over B: it lands on 2B − A, so that B is the middle of the jump. Here (2, 0)."),
    P("2B a des coordonnées paires, donc 2B − A a les mêmes parités que A : (2, 0) et (0, 0) sont tous deux (pair, pair). Un saut ne change jamais la parité d’un pion.", "2B has even coordinates, so 2B − A has the same parities as A: (2, 0) and (0, 0) are both (even, even). A jump never changes a peg’s parity."),
    P("Colorions chaque point selon la parité de (x, y). A reste sur les points de sa couleur, B sur les siens, C sur les siens. Les points du quatrième type, cercles vides, n’appartiennent à personne.", "Colour each point by the parity of (x, y). A stays on points of its colour, B on its own, C on its own. Points of the fourth type, empty circles, belong to nobody."),
    P("Réciproquement : A saute sur B, B sur A, C sur A puis sur B, et les trois pions ont glissé de (2, 0). De même de (0, 2), et en sens inverse en défaisant les sauts. Un pion atteint donc toute sa classe.", "Conversely: A over B, B over A, C over A then over B, and all three pegs have slid by (2, 0). Likewise by (0, 2), and backwards by undoing the jumps. So a peg reaches its whole class."),
    sol ? P(`Le point visé est de la classe (${cls}) modulo 2, celle d’un pion : l’invariant ne l’interdit pas. La recherche exhaustive trouve ${sol.length} saut${sol.length > 1 ? "s" : ""} au minimum (ci-contre).`, `The target is of class (${cls}) modulo 2, the class of one peg: the invariant does not forbid it. The exhaustive search finds ${sol.length} jump${sol.length > 1 ? "s" : ""} at least (shown).`) : P(`Le point visé est de la classe (${cls}) modulo 2 : aucun pion ne l’a, il est inatteignable. Réponse : 0.`, `The target is of class (${cls}) modulo 2: no peg has it, so it is unreachable. Answer: 0.`),
  ]; },
  draw(c, s, p, q) {
    const T = pegTarget(q.target), sol = pegsSolve(T), X = (x) => 40 + (x + 2) * 52, Y = (y) => 246 - (y + 1) * 52, pt = ([x, y]) => [X(x), Y(y)];
    const cc = { "0,0": colour(0), "1,0": colour(1), "0,1": colour(2) }, names = ["A", "B", "C"];
    for (let x = -2; x <= 6; x++) for (let y = -1; y <= 3; y++) {
      const cl = pegClass([x, y]).join();
      if (s >= 3) c.circ(X(x), Y(y), cl === "1,1" ? 4.5 : 3.5, cl === "1,1" ? { fill: "none", stroke: "var(--ink)", "stroke-width": 1.2, opacity: 0.8 } : { fill: cc[cl], opacity: 0.85 });
      else c.circ(X(x), Y(y), 2, { fill: "var(--line-strong)" });
    }
    // target mark
    const [tx, ty] = pt(T);
    c.circ(tx, ty, 13, { fill: "none", stroke: s === 5 ? (sol ? "var(--pos)" : "var(--neg)") : "var(--ink)", "stroke-width": 2, "stroke-dasharray": "4 4" });
    c.line(tx - 6, ty, tx + 6, ty, { stroke: "var(--ink)", "stroke-width": 1.8 }); c.line(tx, ty - 6, tx, ty + 6, { stroke: "var(--ink)", "stroke-width": 1.8 });
    let pos = PEGS_START.map((a) => [...a]), hop = null;   // hop: { i, from, to, k }
    const play = (list) => {   // replay a list of jumps as p goes from 0 to 1
      const n = list.length, u = Math.min(n - 1e-9, ez(p) * n), idx = Math.floor(u);
      if (p >= 1) { pos = list.at(-1).state.map((a) => [...a]); return; }
      pos = (idx === 0 ? PEGS_START : list[idx - 1].state).map((a) => [...a]);
      hop = { i: list[idx].peg, from: list[idx].from, to: list[idx].to, k: u - idx };
    };
    if (s === 1) hop = { i: 0, from: [0, 0], to: [2, 0], k: ez(seg(p, 0.1, 0.9)) };
    if (s === 4) play(pegsRun(PEGS_SHIFTS.x));
    if (s === 5 && sol) play(sol);
    if (s === 1 || s === 2) { const [a, b] = [pt([0, 0]), pt([1, 0])]; c.line(a[0], a[1], pt([2, 0])[0], pt([2, 0])[1], { stroke: "var(--muted)", "stroke-dasharray": "3 4" }); if (s === 1) c.text(b[0], b[1] + 34, `B = ${c.t("milieu", "midpoint")}`, { ...mid, class: "sol-small" }); }
    if (s === 2) {
      const g = pt([2, 0]); c.circ(g[0], g[1], 11, { fill: "none", stroke: colour(0), "stroke-width": 2, "stroke-dasharray": "3 3" }); c.text(g[0], g[1] + 32, "(2, 0) ≡ (0, 0)", { ...mid, class: "sol-line" });
      c.text(pt([0, 0])[0], pt([0, 0])[1] + 32, `(${c.t("pair, pair", "even, even")})`, { ...mid, class: "sol-small" });
    }
    pos.forEach((a, i) => {
      let [x, y] = a;
      if (hop && hop.i === i) { x = hop.from[0] + (hop.to[0] - hop.from[0]) * hop.k; y = hop.from[1] + (hop.to[1] - hop.from[1]) * hop.k - Math.sin(Math.PI * hop.k) * 0.34; }
      const [px, py] = [X(x), Y(y)];
      c.circ(px, py, 13, { fill: `color-mix(in srgb, ${colour(i)} 70%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 2 }); c.text(px, py + 5, names[i], { ...mid, class: "sol-label" });
    });
    if (s === 5) { c.text(494, 36, sol ? `${sol.length}` : "0", { ...mid, class: "sol-hot" }); c.text(494, 56, c.t(sol ? (sol.length > 1 ? "sauts" : "saut") : "impossible", sol ? (sol.length > 1 ? "jumps" : "jump") : "impossible"), { ...mid, class: "sol-small" }); }
  },
};
