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
