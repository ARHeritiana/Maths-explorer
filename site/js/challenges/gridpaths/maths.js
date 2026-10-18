// Pure mathematics of the gridpaths challenge (no DOM), checked by an independent method in tests/.

export function pascalGrid(m, n) {
  const g = Array.from({ length: n + 1 }, () => Array(m + 1).fill(1));
  for (let j = 1; j <= n; j++) for (let i = 1; i <= m; i++) g[j][i] = g[j - 1][i] + g[j][i - 1];
  return g;
}

export const gridPaths = (m, n) => pascalGrid(m, n)[n][m];
