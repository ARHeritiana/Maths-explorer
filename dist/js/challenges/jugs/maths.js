// Pure maths of the jugs challenge: two jugs of a and b litres, a tap and a sink. A state is (x, y), the litres in each jug;
// the six moves fill a jug, empty it, or pour one into the other until the source is empty or the target full. The fewest
// moves to get exactly t litres in one jug come from a breadth-first search; t can be reached only if gcd(a, b) divides t
// and t ≤ max(a, b) (Bézout). No DOM.

import { P } from "../common/helpers.js";

// Presets "a,b,t" of the challenge (the first is the classic 3 L, 5 L, 4 L).
export const JUG_PRESETS = ["3,5,4", "3,5,1", "4,9,6", "5,7,6", "7,11,8", "6,9,4", "4,6,5"];
export const parseJugs = (s) => String(s).split(",").map(Number);

export const gcd = (x, y) => (y ? gcd(y, x % y) : x);

// The six moves: [name, function (x, y, a, b) -> [x', y']].
export const MOVES = [
  ["fillA", (x, y, a) => [a, y]],
  ["fillB", (x, y, a, b) => [x, b]],
  ["emptyA", (x, y) => [0, y]],
  ["emptyB", (x, y) => [x, 0]],
  ["pourAB", (x, y, a, b) => { const d = Math.min(x, b - y); return [x - d, y + d]; }],
  ["pourBA", (x, y, a) => { const d = Math.min(y, a - x); return [x + d, y - d]; }],
];
export const apply = (move, [x, y], a, b) => MOVES.find(([n]) => n === move)[1](x, y, a, b);

// Shortest list of moves from (0, 0) to a state with t litres in a jug, or null.
export function jugsSolve(a, b, t) {
  const key = (s) => s.join(","), prev = new Map([["0,0", null]]);
  let frontier = [[0, 0]];
  const done = ([x, y]) => x === t || y === t;
  if (done([0, 0])) return [];
  while (frontier.length) {
    const next = [];
    for (const s of frontier) for (const [name, f] of MOVES) {
      const n = f(s[0], s[1], a, b), k = key(n);
      if (prev.has(k)) continue;
      prev.set(k, { from: key(s), move: name });
      if (done(n)) {
        const path = [];
        for (let cur = k; prev.get(cur); cur = prev.get(cur).from) path.unshift({ move: prev.get(cur).move, state: cur.split(",").map(Number) });
        return path;
      }
      next.push(n);
    }
    frontier = next;
  }
  return null;
}
export const jugsMin = (a, b, t) => { const p = jugsSolve(a, b, t); return p ? p.length : 0; };
export const reachable = (a, b, t) => t <= Math.max(a, b) && t % gcd(a, b) === 0;

// The name of a move, for the solution texts and captions.
const MOVE_TEXT = {
  fillA: (a) => P(`remplir le bidon de ${a} L`, `fill the ${a} L jug`),
  fillB: (a, b) => P(`remplir le bidon de ${b} L`, `fill the ${b} L jug`),
  emptyA: (a) => P(`vider le bidon de ${a} L`, `empty the ${a} L jug`),
  emptyB: (a, b) => P(`vider le bidon de ${b} L`, `empty the ${b} L jug`),
  pourAB: (a, b) => P(`verser le ${a} L dans le ${b} L`, `pour the ${a} L into the ${b} L`),
  pourBA: (a, b) => P(`verser le ${b} L dans le ${a} L`, `pour the ${b} L into the ${a} L`),
};
export const moveText = (move, a, b) => MOVE_TEXT[move](a, b);
