// Variations of the challenges: the numbers are parameters, and the statement, the expected answer and the worked
// solution follow them. Pure functions, no DOM, so they can be tested in Node. Every pair is [French, English].
// With its default parameters a variant must reproduce the static text of the challenge in content.js
// (tests/challenges-variants.test.mjs checks the statement and the answer).
const P = (fr, en) => [fr, en];
const int = (id, fr, en, min, max, value, step = 1) => ({ kind: "int", id, label: P(fr, en), min, max, value, step });
const choice = (id, fr, en, options, value) => ({ kind: "choice", id, label: P(fr, en), options, value });

/* --------------------------------------------------------------- helpers */
export const josephusOrder = (n, k = 2) => {
  const ring = Array.from({ length: n }, (_, i) => i + 1), out = [];
  let i = 0;
  while (ring.length > 1) { i = (i + k - 1) % ring.length; out.push(ring.splice(i, 1)[0]); if (i >= ring.length) i = 0; }
  return { out, last: ring[0] };
};
// Floors that e eggs and d drops can settle: sum of C(d, i) for i = 1..e.
export const eggCover = (e, d) => { let sum = 0, c = 1; for (let i = 1; i <= e; i++) { c = (c * (d - i + 1)) / i; sum += c; } return Math.round(sum); };
export const eggDrops = (e, floors) => { let d = 0; while (eggCover(e, d) < floors) d++; return d; };
// Strategy of the first egg: floors where it is dropped (steps shrink as the remaining drops shrink).
export function eggPlan(e, floors) {
  const n = eggDrops(e, floors), out = [];
  let at = 0;
  for (let j = 1; j <= n && at < floors; j++) { at = Math.min(floors, at + eggCover(e - 1, n - j) + 1); out.push(at); }
  return { drops: n, floors: out };
}

// Bridge networks. Index order defines the circle layout; `pos` overrides it (Königsberg keeps its familiar shape).
const mulberry = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const LET = "ABCDEFGH";
export function graphFor(g) {
  const named = (n, edges, pos) => ({ names: LET.slice(0, n).split(""), edges, pos });
  if (g === 0) return named(4, [[0, 1], [0, 1], [0, 2], [0, 2], [0, 3], [1, 3], [2, 3]], [[95, 150], [260, 55], [260, 245], [425, 150]]);
  if (g === 1) return named(4, [[0, 1], [0, 1], [0, 2], [0, 2], [0, 3], [1, 3], [2, 3], [1, 2]], [[95, 150], [260, 55], [260, 245], [425, 150]]);
  if (g === 2) return named(4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]);
  if (g === 3) return named(6, [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5]]);
  if (g === 4) return named(6, [[0, 1], [1, 2], [3, 4], [4, 5], [0, 3], [1, 4], [2, 5]]);
  const rnd = mulberry(g * 7919 + 13), n = 4 + Math.floor(rnd() * 3), m = n + 2 + Math.floor(rnd() * 3), edges = [];
  for (let v = 1; v < n; v++) edges.push([Math.floor(rnd() * v), v]);   // a spanning tree keeps the network connected
  while (edges.length < m) { const a = Math.floor(rnd() * n), b = Math.floor(rnd() * n); if (a !== b && edges.filter((e) => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a)).length < 2) edges.push([Math.min(a, b), Math.max(a, b)]); }
  return named(n, edges);
}
export function layoutOf(graph, W = 520, H = 300) {
  if (graph.pos) return graph.pos;
  const n = graph.names.length;
  return graph.names.map((_, i) => { const a = Math.PI + (2 * Math.PI * i) / n; return [W / 2 + 190 * Math.cos(a), H / 2 + 92 * Math.sin(a)]; });
}
// Path of bridge i (a quadratic curve; parallel bridges bend apart) and the point where its number is written.
export function bridgeGeom(graph, i, pos = layoutOf(graph)) {
  const [a, b] = graph.edges[i], same = graph.edges.map((e, j) => [e, j]).filter(([e]) => e[0] === a && e[1] === b).map(([, j]) => j);
  const bend = same.length === 1 ? 0 : (same.indexOf(i) - (same.length - 1) / 2) * 72;
  const [x1, y1] = pos[a], [x2, y2] = pos[b], mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  return { d: `M${x1} ${y1}Q${mx - (dy / len) * bend} ${my + (dx / len) * bend} ${x2} ${y2}`, mid: [mx - (dy / len) * bend * 0.5, my + (dx / len) * bend * 0.5], ctrl: [mx - (dy / len) * bend, my + (dx / len) * bend] };
}
export const degrees = (graph, removed = new Set()) => { const d = graph.names.map(() => 0); graph.edges.forEach(([a, b], i) => { if (!removed.has(i)) { d[a]++; d[b]++; } }); return d; };
function connected(graph, removed) {
  const left = graph.edges.map((e, i) => [e, i]).filter(([, i]) => !removed.has(i)).map(([e]) => e);
  if (!left.length) return true;
  const seen = new Set([left[0][0]]); let grew = true;
  while (grew) { grew = false; for (const [a, b] of left) { if (seen.has(a) !== seen.has(b)) { seen.add(a); seen.add(b); grew = true; } } }
  return left.every(([a]) => seen.has(a));
}
// A walk crosses every remaining bridge exactly once iff the remaining network is connected and has 0 or 2 odd districts (Euler).
export const walkable = (graph, removed) => connected(graph, removed) && [0, 2].includes(degrees(graph, removed).filter((x) => x % 2).length);
export function minRemoval(graph) {
  const E = graph.edges.length; let best = null;
  for (let mask = 0; mask < 1 << E; mask++) {
    const removed = new Set(); for (let i = 0; i < E; i++) if (mask >> i & 1) removed.add(i);
    if ((best === null || removed.size < best.size) && walkable(graph, removed)) best = removed;
  }
  return best;
}
// Depth-first search for a walk over the remaining bridges: [[bridge, from, to], ...].
export function trailOf(graph, removed) {
  const ids = graph.edges.map((_, i) => i).filter((i) => !removed.has(i)), used = new Set(), walk = [];
  const go = (v) => {
    if (walk.length === ids.length) return true;
    for (const i of ids) { if (used.has(i)) continue; const [a, b] = graph.edges[i]; if (a !== v && b !== v) continue; used.add(i); walk.push([i, v, a === v ? b : a]); if (go(a === v ? b : a)) return true; walk.pop(); used.delete(i); }
    return false;
  };
  const odd = degrees(graph, removed).map((d, i) => [d, i]).filter(([d]) => d % 2).map(([, i]) => i);
  for (const s of odd.length ? odd.slice(0, 1) : graph.names.map((_, i) => i)) if (go(s)) return walk;
  return walk;
}
const WORDS_FR = ["", "un", "deux", "trois"], WORDS_EN = ["", "one", "two", "three"];
export function describeBridges(graph) {
  const pairs = new Map();
  graph.edges.forEach(([a, b]) => pairs.set(`${a}-${b}`, (pairs.get(`${a}-${b}`) || 0) + 1));
  const n = graph.edges.length;
  const fr = [...pairs].map(([k, c]) => { const [a, b] = k.split("-").map(Number); return `${WORDS_FR[c]} entre ${graph.names[a]} et ${graph.names[b]}`; }).join(", ");
  const en = [...pairs].map(([k, c]) => { const [a, b] = k.split("-").map(Number); return `${WORDS_EN[c]} between ${graph.names[a]} and ${graph.names[b]}`; }).join(", ");
  return { fr: `${graph.names.length} quartiers ${graph.names.join(", ")} sont reliés par ${n} ponts : ${fr}`, en: `${graph.names.length} districts ${graph.names.join(", ")} are joined by ${n} bridges: ${en}` };
}

// Comb gallery with k teeth: 3k walls. Tips are mutually hidden, so k guards are necessary; ⌊3k/3⌋ = k suffice.
export function comb(k) {
  const pts = [[0, 0], [5 * k - 2, 0]];
  const tip = (j) => (j === 1 ? 1.2 : j === k ? 5 * (k - 1) + 1.3 : 5 * (j - 1) + 1.5);
  for (let j = k; j >= 1; j--) {
    pts.push([tip(j), 10]);
    if (j > 1) { pts.push([5 * (j - 1) - 0.5, 3]); pts.push([5 * (j - 1) - 1.5, 3]); }
  }
  return pts;
}

/* -------------------------------------------------------------- variants */
export const VARIANTS = {
  doors: {
    params: [int("n", "Nombre de portes", "Number of doors", 10, 200, 100)],
    answer: (q) => Math.floor(Math.sqrt(q.n)),
    prompt: (q) => P(`${q.n} portes sont fermées. Au passage k, on change l’état des portes dont le numéro est un multiple de k, pour k = 1 à ${q.n}. Combien restent ouvertes ?`, `${q.n} doors start closed. On pass k, toggle every door whose number is a multiple of k, for k = 1 to ${q.n}. How many doors remain open?`),
    solution: (q) => { const m = Math.floor(Math.sqrt(q.n)); return P(`Seuls les carrés parfaits ont un nombre impair de diviseurs : le diviseur √n se retrouve seul. Les portes 1², 2², …, ${m}² restent ouvertes, soit ${m} portes.`, `Only perfect squares have an odd number of divisors: √n is unpaired. Doors 1², 2², …, ${m}² remain open, so there are ${m}.`); },
  },
  chess: {
    params: [int("n", "Côté du plateau", "Board side", 4, 12, 8, 2), choice("kind", "Cases retirées", "Squares removed", [["opp", "Deux coins opposés", "Two opposite corners"], ["adj", "Deux coins voisins", "Two neighbouring corners"]], "opp")],
    answer: (q) => (q.n * q.n) / 2 - (q.kind === "opp" ? 2 : 1),
    prompt: (q) => P(`Un plateau de ${q.n} × ${q.n} cases a perdu ${q.kind === "opp" ? "deux coins opposés" : "deux coins voisins (sur un même côté)"}. Quel est le plus grand nombre de dominos 2 × 1 que l’on peut poser sur le plateau sans chevauchement ?`, `A ${q.n} × ${q.n} board has lost ${q.kind === "opp" ? "two opposite corners" : "two neighbouring corners (on the same side)"}. What is the largest number of 2 × 1 dominoes you can place on the board without overlapping?`),
    solution: (q) => {
      const h = (q.n * q.n) / 2;
      return q.kind === "opp"
        ? P(`Les deux coins retirés ont la même couleur : il reste ${h - 2} cases de cette couleur et ${h} de l’autre. Chaque domino couvre une case de chaque couleur, donc il y a au plus ${h - 2} dominos. On les atteint : on pave horizontalement toutes les rangées sauf les deux rangées mutilées, où il reste une case libre chacune. Maximum : ${h - 2}.`, `The two removed corners share a colour: ${h - 2} squares of that colour and ${h} of the other remain. Every domino covers one of each, so there are at most ${h - 2} dominoes. This is reached: tile every row horizontally except the two damaged rows, which keep one free square each. Maximum: ${h - 2}.`)
        : P(`Deux coins voisins ont des couleurs différentes : il reste ${h - 1} cases de chaque couleur, le plafond est ${h - 1} dominos. Il est atteint par un pavage complet : on pave chaque rangée horizontalement (la rangée mutilée a ${q.n - 2} cases, un nombre pair). Maximum : ${h - 1}.`, `Two neighbouring corners have different colours: ${h - 1} squares of each colour remain, so the ceiling is ${h - 1} dominoes. A full tiling reaches it: tile every row horizontally (the damaged row has ${q.n - 2} squares, an even number). Maximum: ${h - 1}.`);
    },
  },
  nim: {
    params: [int("n", "Nombre de pierres", "Number of stones", 10, 60, 21), int("m", "Maximum retiré par coup", "Most removable per move", 2, 6, 3)],
    answer: (q) => q.n % (q.m + 1),
    prompt: (q) => P(`Il y a ${q.n} pierres. À tour de rôle, on en retire de 1 à ${q.m}. Prendre la dernière fait gagner. Tu commences : combien dois-tu en prendre pour garantir la victoire avec un jeu parfait ? (Réponds 0 si aucune stratégie ne la garantit.)`, `There are ${q.n} stones. Players take turns removing 1 to ${q.m}. Taking the last stone wins. You move first: how many should you take to guarantee victory with perfect play? (Answer 0 if no strategy guarantees it.)`),
    hints: (q) => [P(`Avec ${q.m + 1} pierres, le joueur qui doit jouer perd contre un adversaire parfait.`, `With ${q.m + 1} stones, the player to move loses against perfect play.`), P(`Après le premier coup, complète chaque coup adverse pour retirer ${q.m + 1} pierres au total.`, `After your first move, complement each opponent move to remove ${q.m + 1} stones in total.`)],
    solution: (q) => {
      const r = q.n % (q.m + 1), b = q.m + 1;
      return r
        ? P(`Prends ${r} pierre${r > 1 ? "s" : ""} pour en laisser ${q.n - r}, un multiple de ${b}. Si l’adversaire prend k pierres, prends ${b} − k : il reste toujours un multiple de ${b}, jusqu’à 0 et tu prends la dernière.`, `Take ${r} stone${r > 1 ? "s" : ""} to leave ${q.n - r}, a multiple of ${b}. If your opponent takes k, take ${b} − k: a multiple of ${b} always remains, down to 0, and you take the last stone.`)
        : P(`${q.n} est un multiple de ${b} : quoi que tu prennes, l’adversaire parfait complète à ${b} et garde un multiple de ${b}. Tu perds : la réponse est 0.`, `${q.n} is a multiple of ${b}: whatever you take, a perfect opponent completes to ${b} and keeps a multiple of ${b}. You lose: the answer is 0.`);
    },
  },
  pigeonhole: {
    params: [int("m", "Diviseur", "Divisor", 3, 12, 7)],
    answer: (q) => q.m + 1,
    prompt: (q) => P(`Quel est le plus petit nombre d’entiers distincts à choisir pour être certain que deux d’entre eux ont une différence divisible par ${q.m} ?`, `What is the smallest number of distinct integers you must choose to guarantee that two have a difference divisible by ${q.m}?`),
    hints: (q) => [P(`Classe les entiers selon leur reste dans la division par ${q.m}.`, `Sort integers by their remainder when divided by ${q.m}.`), P(`Il n’y a que ${q.m} restes possibles. Montre aussi que ${q.m} entiers ne suffisent pas toujours.`, `There are only ${q.m} possible remainders. Also show that ${q.m} integers do not always suffice.`)],
    solution: (q) => P(`Avec ${q.m + 1} entiers et ${q.m} restes, deux entiers ont le même reste, donc leur différence est divisible par ${q.m}. La liste 0, 1, …, ${q.m - 1} montre que ${q.m} ne suffisent pas. Le minimum est donc ${q.m + 1}.`, `Among ${q.m + 1} integers and ${q.m} remainders, two share a remainder, so their difference is divisible by ${q.m}. The list 0, 1, …, ${q.m - 1} shows that ${q.m} are not enough. The minimum is ${q.m + 1}.`),
  },
  squares: {
    params: [int("n", "Nombre de termes", "Number of terms", 3, 30, 20)],
    answer: (q) => q.n * q.n,
    prompt: (q) => P(`Combien vaut 1 + 3 + 5 + … + ${2 * q.n - 1} ? Cherche une méthode qui explique aussi le résultat pour k termes.`, `What is 1 + 3 + 5 + … + ${2 * q.n - 1}? Find a method that also explains the result for k terms.`),
    hints: (q) => [P("Le k-ième entier impair est 2k − 1. Combien de termes y a-t-il ?", "The kth odd integer is 2k − 1. How many terms are there?"), P("Pour passer d’un carré de côté k − 1 à un carré de côté k, ajoute une bordure de 2k − 1 points.", "To grow a square of side k − 1 into a square of side k, add a border of 2k − 1 dots.")],
    solution: (q) => P(`Il y a ${q.n} termes car ${2 * q.n - 1} = 2 × ${q.n} − 1. Les bordures successives de 1, 3, 5, … points construisent un carré : la somme des k premiers impairs vaut k². Le résultat est ${q.n}² = ${q.n * q.n}.`, `There are ${q.n} terms because ${2 * q.n - 1} = 2 × ${q.n} − 1. Successive borders of 1, 3, 5, … dots build a square: the first k odd numbers sum to k². The result is ${q.n}² = ${q.n * q.n}.`),
  },
  hanoi: {
    params: [int("n", "Nombre de disques", "Number of disks", 2, 8, 6)],
    answer: (q) => 2 ** q.n - 1,
    prompt: (q) => P(`Trois tiges. ${q.n} disques de tailles différentes sont empilés sur la première, le plus grand en bas. À chaque coup, on déplace un seul disque, sans jamais le poser sur un disque plus petit. Quel est le plus petit nombre de coups pour transférer toute la pile sur une autre tige ?`, `Three pegs. ${q.n} disks of different sizes are stacked on the first, the largest at the bottom. Each move shifts one disk, never onto a smaller disk. What is the smallest number of moves needed to transfer the whole stack to another peg?`),
    solution: (q) => P(`Pour libérer le plus grand disque, il faut déplacer les n − 1 autres sur la tige intermédiaire, déplacer le grand disque, puis ramener les n − 1 dessus : u(n) = 2u(n − 1) + 1 avec u(1) = 1. On obtient u(n) = 2<sup>n</sup> − 1 : 1, 3, 7, 15, 31, 63, … Le grand disque doit bouger au moins une fois, ce qui rend cette stratégie optimale. Pour ${q.n} disques : ${2 ** q.n - 1} coups.`, `To free the largest disk, move the other n − 1 to the spare peg, move the large disk, then bring the n − 1 back on top: u(n) = 2u(n − 1) + 1 with u(1) = 1. This gives u(n) = 2<sup>n</sup> − 1: 1, 3, 7, 15, 31, 63, … The large disk must move at least once, which makes the strategy optimal. For ${q.n} disks: ${2 ** q.n - 1} moves.`),
  },
  eggs: {
    params: [int("floors", "Nombre d’étages", "Number of floors", 20, 200, 100), choice("eggs", "Nombre d’œufs", "Number of eggs", [[2, "2 œufs", "2 eggs"], [3, "3 œufs", "3 eggs"]], 2)],
    answer: (q) => eggDrops(Number(q.eggs), q.floors),
    prompt: (q) => P(`Tu as ${q.eggs} œufs d’autruche identiques et un immeuble de ${q.floors} étages. Il existe un étage critique : d’un étage inférieur ou égal, un œuf ne se brise pas ; d’un étage supérieur, il se brise. Un œuf intact peut resservir, un œuf brisé non. Quel est le plus petit nombre de lancers qui suffit, dans le pire des cas, pour trouver l’étage critique ?`, `You have ${q.eggs} identical ostrich eggs and a ${q.floors}-floor building. There is a critical floor: from that floor or below an egg does not break, from above it does. An intact egg can be reused, a broken one cannot. What is the smallest number of drops that is enough, in the worst case, to find the critical floor?`),
    solution: (q) => {
      const e = Number(q.eggs), plan = eggPlan(e, q.floors), n = plan.drops, f = (d) => eggCover(e, d);
      if (e === 2) return P(`Lâche le premier œuf des étages ${plan.floors.join(", ")} : les pas diminuent de 1. S’il se brise au k-ième lancer, le second parcourt les étages restants un par un : au total toujours au plus ${n} lancers. Avec n lancers, on couvre n + (n − 1) + … + 1 = n(n + 1)/2 étages. Il faut n(n + 1)/2 ≥ ${q.floors} : ${n - 1} lancers couvrent ${f(n - 1)} étages, ${n} couvrent ${f(n)}. Réponse : ${n}.`, `Drop the first egg from floors ${plan.floors.join(", ")}: the steps shrink by 1. If it breaks on the kth drop, the second egg walks through the remaining floors one by one: the total is always at most ${n} drops. With n drops you cover n + (n − 1) + … + 1 = n(n + 1)/2 floors. You need n(n + 1)/2 ≥ ${q.floors}: ${n - 1} drops cover ${f(n - 1)} floors, ${n} cover ${f(n)}. Answer: ${n}.`);
      return P(`Avec k lancers et 3 œufs, on couvre C(k, 1) + C(k, 2) + C(k, 3) étages : le premier lancer teste un étage tel que, s’il se brise, les 2 œufs restants et k − 1 lancers suffisent, et s’il tient, il reste 3 œufs et k − 1 lancers. Il faut couvrir ${q.floors} étages : ${n - 1} lancers couvrent ${f(n - 1)} étages, ${n} couvrent ${f(n)}. Réponse : ${n}.`, `With k drops and 3 eggs you cover C(k, 1) + C(k, 2) + C(k, 3) floors: the first drop tests a floor such that if it breaks, the 2 remaining eggs and k − 1 drops suffice, and if it holds, 3 eggs and k − 1 drops remain. You must cover ${q.floors} floors: ${n - 1} drops cover ${f(n - 1)} floors, ${n} cover ${f(n)}. Answer: ${n}.`);
    },
  },
  konigsberg: {
    params: [int("g", "Réseau n°", "Network no.", 0, 99, 0)],
    answer: (q) => minRemoval(graphFor(q.g)).size,
    prompt: (q) => { const d = describeBridges(graphFor(q.g)); return P(`${d.fr}. Combien de ponts faut-il retirer, au minimum, pour qu’une promenade traverse chaque pont restant exactement une fois ?`, `${d.en}. What is the minimum number of bridges to remove so that a walk crosses every remaining bridge exactly once?`); },
    solution: (q) => {
      const g = graphFor(q.g), deg = degrees(g), odd = deg.filter((x) => x % 2).length, best = minRemoval(g), gone = [...best].map((i) => `${g.names[g.edges[i][0]]}${g.names[g.edges[i][1]]}`);
      const list = g.names.map((nm, i) => `${nm} ${deg[i]}`).join(", ");
      return P(`Nombre de ponts par quartier : ${list}. Il y a ${odd} quartier${odd > 1 ? "s" : ""} de degré impair. Un parcours qui traverse chaque pont une fois n’autorise que 0 ou 2 quartiers impairs (le départ et l’arrivée), car partout ailleurs les ponts vont par paires entrée et sortie, et il faut que le réseau reste connexe. ${best.size === 0 ? "Aucun pont à retirer." : `Retirer ${best.size} pont${best.size > 1 ? "s" : ""} (${gone.join(", ")}) suffit, et on ne peut pas faire moins : chaque retrait ne change que la parité de deux quartiers.`} Minimum : ${best.size}.`, `Bridges per district: ${list}. There ${odd === 1 ? "is" : "are"} ${odd} odd district${odd === 1 ? "" : "s"}. A route crossing every bridge once allows only 0 or 2 odd districts (the start and the end), since everywhere else bridges come in in-out pairs, and the network must stay connected. ${best.size === 0 ? "No bridge needs to go." : `Removing ${best.size} bridge${best.size > 1 ? "s" : ""} (${gone.join(", ")}) is enough, and fewer is impossible: each removal changes the parity of two districts only.`} Minimum: ${best.size}.`);
    },
  },
  josephus: {
    params: [int("n", "Nombre de personnes", "Number of people", 5, 100, 41), choice("k", "On élimine une personne sur", "Remove one person in", [[2, "2 (une sur deux)", "2 (every second)"], [3, "3 (une sur trois)", "3 (every third)"]], 2)],
    answer: (q) => josephusOrder(q.n, Number(q.k)).last,
    prompt: (q) => Number(q.k) === 2
      ? P(`${q.n} personnes, numérotées de 1 à ${q.n}, forment un cercle. On saute la personne 1, on élimine la 2, on saute la 3, on élimine la 4, et ainsi de suite en tournant et sans s’arrêter jusqu’à ce qu’il n’en reste qu’une. Quel est le numéro de la dernière personne restante ?`, `${q.n} people, numbered 1 to ${q.n}, stand in a circle. Skip person 1, remove 2, skip 3, remove 4, and so on around the circle without stopping until one person is left. What is the number of the last person standing?`)
      : P(`${q.n} personnes, numérotées de 1 à ${q.n}, forment un cercle. On saute les personnes 1 et 2, on élimine la 3, on saute les deux suivantes, on élimine la 6, et ainsi de suite en tournant jusqu’à ce qu’il n’en reste qu’une. Quel est le numéro de la dernière personne restante ?`, `${q.n} people, numbered 1 to ${q.n}, stand in a circle. Skip persons 1 and 2, remove 3, skip the next two, remove 6, and so on around the circle until one person is left. What is the number of the last person standing?`),
    solution: (q) => {
      const k = Number(q.k), last = josephusOrder(q.n, k).last;
      if (k === 2) { const m = 2 ** Math.floor(Math.log2(q.n)), l = q.n - m; return P(`Si le cercle compte 2<sup>m</sup> personnes, un tour élimine une personne sur deux et recommence au même point : la première personne sautée, la numéro 1, survit. Pour n = 2<sup>m</sup> + l avec 0 ≤ l &lt; 2<sup>m</sup>, après l éliminations (2, 4, …, 2l) il reste 2<sup>m</sup> personnes et la prochaine sautée est 2l + 1 : elle survit. Ici ${q.n} = ${m} + ${l}, donc le survivant est 2 × ${l} + 1 = ${last}.`, `If the circle has 2<sup>m</sup> people, one lap removes every second person and restarts at the same spot: the first person skipped survives. For n = 2<sup>m</sup> + l with 0 ≤ l &lt; 2<sup>m</sup>, after l removals (2, 4, …, 2l) there are 2<sup>m</sup> people left and the next one skipped is 2l + 1: that person survives. Here ${q.n} = ${m} + ${l}, so the survivor is 2 × ${l} + 1 = ${last}.`); }
      return P(`Avec une élimination sur ${k}, il n’y a pas de formule aussi simple, mais une récurrence : si J(n) est le survivant parmi n personnes, J(1) = 1 et J(n) = (J(n − 1) + ${k} − 1) mod n + 1. Après la première élimination, il reste n − 1 personnes et on recommence à compter après la personne éliminée : on se ramène au cas de n − 1. On calcule de proche en proche jusqu’à n = ${q.n} : J(${q.n}) = ${last}.`, `With one removal in ${k} there is no formula as simple, but there is a recurrence: if J(n) is the survivor among n people, J(1) = 1 and J(n) = (J(n − 1) + ${k} − 1) mod n + 1. After the first removal, n − 1 people remain and counting restarts after the removed one: this reduces to the case n − 1. Compute step by step up to n = ${q.n}: J(${q.n}) = ${last}.`);
    },
  },
  ramsey: {
    params: [choice("s", "Groupe d’inconnus recherché", "Group of strangers sought", [[3, "3 personnes", "3 people"], [4, "4 personnes", "4 people"]], 3)],
    answer: (q) => (Number(q.s) === 3 ? 6 : 9),
    prompt: (q) => P(`Dans un groupe de n personnes, deux personnes quelconques sont soit amies, soit non amies. Quel est le plus petit n qui garantit de trouver trois personnes deux à deux amies, ou ${q.s === 3 ? "trois" : "quatre"} personnes deux à deux non amies ?`, `In a group of n people, any two are either friends or not friends. What is the smallest n that guarantees three people who are pairwise friends, or ${Number(q.s) === 3 ? "three" : "four"} people who are pairwise not friends?`),
    solution: (q) => Number(q.s) === 3
      ? P("5 personnes ne suffisent pas : en pentagone, amis = côtés, non amis = diagonales, aucun trio n’est d’une seule couleur. Avec 6 personnes, la personne A a 5 relations, donc au moins 3 du même type (tiroirs), par exemple 3 amis B, C, D. Si deux d’entre eux sont amis, ils forment avec A un trio d’amis. Sinon B, C, D sont deux à deux non amis. Dans tous les cas il y a un trio d’une seule couleur : R(3, 3) = 6.", "5 people are not enough: arranged as a pentagon, friends = sides, not friends = diagonals, no trio is one colour. With 6 people, person A has 5 relations, so at least 3 of one kind (pigeonhole), say 3 friends B, C, D. If two of them are friends, they form a trio of friends with A. Otherwise B, C, D are pairwise not friends. Either way there is a one-colour trio: R(3, 3) = 6.")
      : P("8 personnes ne suffisent pas : place-les en cercle ; deux personnes sont amies si leurs places diffèrent de 1 ou de 4. Il n’y a ni trio d’amis ni groupe de 4 inconnus. Avec 9 personnes, supposons ni trio d’amis ni 4 inconnus. Chacun a au plus 3 amis (4 amis seraient deux à deux inconnus) et au plus 5 inconnus (parmi 6 inconnus, d’après R(3, 3) = 6, on trouverait un trio d’amis ou un trio d’inconnus, donc 4 inconnus avec lui). Comme 3 + 5 = 8, chacun a exactement 3 amis : 9 × 3 = 27 amitiés comptées deux fois, un nombre impair. Contradiction : R(3, 4) = 9.", "8 people are not enough: seat them in a circle; two people are friends if their seats differ by 1 or by 4. There is no trio of friends and no group of 4 strangers. With 9 people, suppose no trio of friends and no 4 strangers. Everyone has at most 3 friends (4 friends would be pairwise strangers) and at most 5 strangers (among 6 strangers, by R(3, 3) = 6, there would be a friend trio or a stranger trio, hence 4 strangers with them). Since 3 + 5 = 8, everyone has exactly 3 friends: 9 × 3 = 27 friendships counted twice, an odd number. Contradiction: R(3, 4) = 9."),
  },
  artgallery: {
    params: [int("k", "Nombre de dents du peigne", "Number of comb teeth", 2, 6, 4)],
    answer: (q) => q.k,
    prompt: (q) => P(`Une galerie d’art est un polygone simple à ${3 * q.k} côtés, pas forcément convexe. Un gardien immobile voit tout point qu’il peut joindre par un segment contenu dans la galerie. Quel est le plus petit nombre de gardiens qui suffit à surveiller toute galerie à ${3 * q.k} côtés, quelle que soit sa forme ?`, `An art gallery is a simple polygon with ${3 * q.k} sides, not necessarily convex. A guard standing still sees every point he can join by a segment lying inside the gallery. What is the smallest number of guards that is enough to watch every ${3 * q.k}-sided gallery, whatever its shape?`),
    solution: (q) => P(`Tout polygone à n côtés se découpe en n − 2 triangles. Ses sommets se colorient avec 3 couleurs de sorte que chaque triangle ait trois couleurs différentes. La couleur la moins fréquente est portée par au plus ⌊n/3⌋ sommets : des gardiens posés sur eux voient chaque triangle, donc toute la galerie. Pour n = ${3 * q.k} : ${q.k} gardiens suffisent. Ils sont nécessaires pour une galerie en peigne à ${q.k} dents : un point ne voit jamais deux pointes à la fois, donc chaque dent exige son gardien (théorème de Chvátal, preuve de Fisk).`, `Every polygon with n sides can be cut into n − 2 triangles. Its vertices can be coloured with 3 colours so that every triangle has three different colours. The least frequent colour sits on at most ⌊n/3⌋ vertices: guards standing on them see every triangle, hence the whole gallery. For n = ${3 * q.k}: ${q.k} guards are enough. They are necessary for a comb with ${q.k} teeth: no point sees two tips at once, so each tooth needs its own guard (Chvátal’s theorem, Fisk’s proof).`),
  },
};

export const hasVariants = (id) => Object.hasOwn(VARIANTS, id);
export const defaults = (id) => Object.fromEntries(VARIANTS[id].params.map((p) => [p.id, p.value]));
export function randomParams(id, rnd = Math.random) {
  const q = {};
  for (const p of VARIANTS[id].params) {
    if (p.kind === "int") { const slots = Math.floor((p.max - p.min) / p.step) + 1; q[p.id] = p.min + p.step * Math.floor(rnd() * slots); }
    else q[p.id] = p.options[Math.floor(rnd() * p.options.length)][0];
  }
  if (id === "konigsberg") q.g = 1 + Math.floor(rnd() * 98);
  return q;
}
// Clamp parameters to their ranges (values from number inputs may be empty or out of range).
export function normalise(id, q) {
  const out = {};
  for (const p of VARIANTS[id].params) {
    if (p.kind === "int") { const v = Math.round(Number(q[p.id])); out[p.id] = Number.isFinite(v) ? Math.min(p.max, Math.max(p.min, p.step > 1 ? p.min + Math.round((v - p.min) / p.step) * p.step : v)) : p.value; }
    else out[p.id] = p.options.some((o) => String(o[0]) === String(q[p.id])) ? (typeof p.options[0][0] === "number" ? Number(q[p.id]) : q[p.id]) : p.value;
  }
  return out;
}
