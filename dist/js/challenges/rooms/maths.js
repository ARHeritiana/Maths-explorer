// Five rooms A..E plus exterior O. Original drawing with two upper and three lower rooms.
export const ROOM_NAMES = ["A", "B", "C", "D", "E", "O"];
export const ROOM_POS = [[160, 80], [360, 80], [115, 230], [260, 230], [405, 230], [260, 330]];
export const FIVE_ROOM_EDGES = [[0, 1], [0, 2], [0, 3], [1, 3], [1, 4], [2, 3], [3, 4], [0, 5], [0, 5], [1, 5], [1, 5], [2, 5], [2, 5], [3, 5], [4, 5], [4, 5]];
export function roomDegrees(edges, n = 6) { const d = Array(n).fill(0); for (const [a, b] of edges) { d[a]++; d[b]++; } return d; }
export function eulerCriteria(edges, n = 6) {
  const degrees = roomDegrees(edges, n), odd = degrees.map((d, i) => d % 2 ? i : -1).filter((i) => i >= 0);
  const seen = new Set(edges.length ? [edges[0][0]] : []); let changed = true;
  while (changed) { changed = false; for (const [a, b] of edges) if (seen.has(a) !== seen.has(b)) { seen.add(a); seen.add(b); changed = true; } }
  const connected = degrees.every((d, i) => !d || seen.has(i));
  return { degrees, odd, connected, trail: connected && [0, 2].includes(odd.length), circuit: connected && odd.length === 0 };
}
export function eulerTrail(edges, n = 6) {
  const c = eulerCriteria(edges, n); if (!c.trail) return null;
  if (!edges.length) return [];
  const used = new Set(), stack = [{ v: c.odd[0] ?? edges[0][0], edge: null }], out = [];
  while (stack.length) {
    const v = stack.at(-1).v, i = edges.findIndex(([a, b], j) => !used.has(j) && (a === v || b === v));
    if (i < 0) { const x = stack.pop(); if (x.edge !== null) out.push(x.edge); }
    else { used.add(i); const [a, b] = edges[i]; stack.push({ v: a === v ? b : a, edge: i }); }
  }
  return out.reverse();
}
