// Pure mathematics of the konigsberg challenge (no DOM), checked by an independent method in tests/.

// Bridge networks. Index order defines the circle layout; `pos` overrides it (Königsberg keeps its familiar shape).
export const mulberry = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

export const LET = "ABCDEFGH";

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

export function connected(graph, removed) {
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

export const WORDS_FR = ["", "un", "deux", "trois"], WORDS_EN = ["", "one", "two", "three"];

export function describeBridges(graph) {
  const pairs = new Map();
  graph.edges.forEach(([a, b]) => pairs.set(`${a}-${b}`, (pairs.get(`${a}-${b}`) || 0) + 1));
  const n = graph.edges.length;
  const fr = [...pairs].map(([k, c]) => { const [a, b] = k.split("-").map(Number); return `${WORDS_FR[c]} entre ${graph.names[a]} et ${graph.names[b]}`; }).join(", ");
  const en = [...pairs].map(([k, c]) => { const [a, b] = k.split("-").map(Number); return `${WORDS_EN[c]} between ${graph.names[a]} and ${graph.names[b]}`; }).join(", ");
  return { fr: `${graph.names.length} quartiers ${graph.names.join(", ")} sont reliés par ${n} ponts : ${fr}`, en: `${graph.names.length} districts ${graph.names.join(", ")} are joined by ${n} bridges: ${en}` };
}
