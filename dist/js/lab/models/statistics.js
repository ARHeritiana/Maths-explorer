// Pure maths of the statistics experiment: a series of values, its mean, median and quartiles, and the stacking of equal
// values on the number line. Quartiles follow the usual lycée convention: Q1 is the smallest value of the series such that
// at least 25 % of the values are less than or equal to it, Q3 the same with 75 %. No DOM.
export const sortedAsc = (a) => [...a].sort((x, y) => x - y);

export function median(sorted) {
  const n = sorted.length;
  return n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
}
// The smallest value with at least a share q of the series at or below it.
export function quantile(sorted, q) {
  return sorted[Math.max(1, Math.ceil(q * sorted.length - 1e-9)) - 1];
}

export function model(s) {
  const data = s.data, n = data.length, sorted = sortedAsc(data);
  const mean = data.reduce((a, b) => a + b, 0) / n;
  const q1 = quantile(sorted, 0.25), q3 = quantile(sorted, 0.75);
  return {
    n, sorted, mean,
    median: median(sorted), q1, q3, iqr: q3 - q1,
    min: sorted[0], max: sorted[n - 1], range: sorted[n - 1] - sorted[0],
    sd: Math.sqrt(data.reduce((a, x) => a + (x - mean) ** 2, 0) / n),
    levels: stack(data),
  };
}

// Level of each value in its stack of equal values (0 for the first one with that value, 1 for the next ...).
export function stack(data) {
  return data.map((x, i) => data.slice(0, i).filter((y) => y === x).length);
}

export const quantities = {
  mean: (s) => model(s).mean,
  median: (s) => model(s).median,
  q1: (s) => model(s).q1,
  q3: (s) => model(s).q3,
  iqr: (s) => model(s).iqr,
};
export const quantity = (name, s) => quantities[name](s);
