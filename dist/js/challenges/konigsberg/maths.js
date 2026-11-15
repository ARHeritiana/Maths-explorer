// Pure mathematics of the konigsberg challenge (no DOM), checked by an independent method in tests/.

// Bridge networks: network 0 is Königsberg (A the Kneiphof island, B the north bank, C the south bank, D the eastern land);
// 1 to 98 are drawn by a seed. Their town maps are in plan.js.
export const mulberry = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

export const LET = "ABCDEFGH";

export function graphFor(g) {
  const named = (n, edges) => ({ names: LET.slice(0, n).split(""), edges });
  if (g === 0) return named(4, [[0, 1], [0, 1], [0, 2], [0, 2], [0, 3], [1, 3], [2, 3]]);
  if (g === 1) return named(4, [[0, 1], [0, 1], [0, 2], [0, 2], [0, 3], [1, 3], [2, 3], [1, 2]]);
  if (g === 2) return named(4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]);
  if (g === 3) return named(6, [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5]]);
  if (g === 4) return named(6, [[0, 1], [1, 2], [3, 4], [4, 5], [0, 3], [1, 4], [2, 5]]);
  const rnd = mulberry(g * 7919 + 13), n = 4 + Math.floor(rnd() * 3), m = n + 2 + Math.floor(rnd() * 3), edges = [];
  for (let v = 1; v < n; v++) edges.push([Math.floor(rnd() * v), v]);   // a spanning tree keeps the network connected
  while (edges.length < m) { const a = Math.floor(rnd() * n), b = Math.floor(rnd() * n); if (a !== b && edges.filter((e) => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a)).length < 2) edges.push([Math.min(a, b), Math.max(a, b)]); }
  return named(n, edges);
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
