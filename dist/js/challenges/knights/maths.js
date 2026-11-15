// Knight graph: exact integer coordinates, bounded cooperative backtracking.
export function knightMoves(v, width, height = width) {
  const x = v % width, y = Math.floor(v / width);
  return [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]]
    .map(([dx, dy]) => [x + dx, y + dy]).filter(([a, b]) => a >= 0 && a < width && b >= 0 && b < height).map(([a, b]) => b * width + a);
}
export function validTour(path, width, height = width, closed = false) {
  return path.length === width * height && new Set(path).size === path.length && path.every((v) => Number.isInteger(v) && v >= 0 && v < width * height)
    && path.slice(1).every((v, i) => knightMoves(path[i], width, height).includes(v))
    && (!closed || knightMoves(path.at(-1), width, height).includes(path[0]));
}
// Schwenk's theorem applies to closed rectangular tours only.
export function closedTourExists(width, height = width) {
  const m = Math.min(width, height), n = Math.max(width, height);
  return !((m % 2 && n % 2) || [1, 2, 4].includes(m) || (m === 3 && [4, 6, 8].includes(n)));
}
export function* searchTour(width, height = width, { prefix = [0], closed = false, order = "warnsdorff", limit = 200000, batch = 1000 } = {}) {
  const total = width * height, path = prefix.slice(), seen = new Set(path), graph = Array.from({ length: total }, (_, i) => knightMoves(i, width, height));
  if (!path.length || seen.size !== path.length || path.some((v) => !Number.isInteger(v) || v < 0 || v >= total) || path.slice(1).some((v, i) => !graph[path[i]].includes(v))) return { status: "invalid", nodes: 0 };
  if (closed && !closedTourExists(width, height)) return { status: "impossible", nodes: 0 };
  let nodes = 0, exhausted = false;
  const choices = (v) => {
    const a = graph[v].filter((w) => !seen.has(w));
    return order === "warnsdorff" ? a.sort((u, v) => graph[u].filter((w) => !seen.has(w)).length - graph[v].filter((w) => !seen.has(w)).length || u - v) : a.sort((a, b) => a - b);
  };
  const stack = [];
  while (true) {
    if (path.length === total) {
      if (!closed || graph[path.at(-1)].includes(path[0])) return { status: "found", path: path.slice(), nodes };
      exhausted = true;
    }
    if (nodes >= limit) return { status: "limit", nodes };
    if (!exhausted && stack.length < path.length - prefix.length + 1) stack.push(choices(path.at(-1)));
    const options = stack.at(-1);
    if (exhausted || !options?.length) {
      if (path.length === prefix.length) return { status: "impossible", nodes };
      if (!exhausted) stack.pop();
      seen.delete(path.pop()); exhausted = false;
      continue;
    }
    const v = options.shift(); seen.add(v); path.push(v); nodes++;
    if (nodes % batch === 0) yield { status: "searching", nodes, path: path.slice() };
  }
}
// One closed tour per even board side shown in the worked solution (found offline by a backtracking search; checked by
// validTour(path, n, n, true) in tests/challenge-backlog.test.mjs).
export const CLOSED_TOURS = {
  6: [0,8,4,15,2,6,14,1,9,5,16,29,33,25,12,20,31,18,7,3,11,22,35,27,19,30,26,34,23,10,21,17,28,32,24,13],
  8: [0,17,32,49,59,53,63,46,61,55,38,23,6,12,2,8,25,40,57,42,48,58,52,62,47,30,15,5,22,7,13,3,9,24,41,56,50,60,54,39,45,51,36,19,34,44,29,35,18,28,11,1,16,33,43,26,20,14,31,37,27,21,4,10],
  10: [0,12,4,16,8,29,17,9,28,7,19,38,59,78,99,87,95,83,91,70,51,30,11,3,15,27,6,18,39,47,68,49,37,58,79,98,86,94,82,90,71,50,31,10,2,23,35,14,26,5,24,43,22,1,20,41,62,81,60,72,80,92,84,96,88,69,48,36,57,76,97,89,77,56,64,45,66,85,93,74,55,67,75,63,44,52,73,65,46,25,33,54,42,34,53,61,40,32,13,21],
};
