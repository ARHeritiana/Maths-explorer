export function quadratic(a, b, c) {
  if (a === 0)
    return {
      kind: b === 0 ? "constant" : "linear",
      roots: b === 0 ? [] : [-c / b],
      allReal: b === 0 && c === 0,
      vertex: null,
      discriminant: null,
    };
  const d = b * b - 4 * a * c;
  const roots =
    d < 0
      ? []
      : d === 0
        ? [-b / (2 * a)]
        : [(-b - Math.sqrt(d)) / (2 * a), (-b + Math.sqrt(d)) / (2 * a)].sort(
            (x, y) => x - y,
          );
  return {
    kind: "quadratic",
    roots,
    allReal: false,
    vertex: [-b / (2 * a), c - (b * b) / (4 * a)],
    discriminant: d,
  };
}
export function sequence(first, step, count, geometric = false) {
  return Array.from({ length: count }, (_, i) =>
    geometric ? first * step ** i : first + step * i,
  );
}
export function binomial(n, p) {
  let choose = 1;
  return Array.from({ length: n + 1 }, (_, k) => {
    if (k) choose = (choose * (n - k + 1)) / k;
    return choose * p ** k * (1 - p) ** (n - k);
  });
}
export function sampleBinomial(n, p, count, random = Math.random) {
  const bins = Array(n + 1).fill(0);
  for (let i = 0; i < count; i++) {
    let k = 0;
    for (let j = 0; j < n; j++) if (random() < p) k++;
    bins[k]++;
  }
  return bins;
}
export function statistics(values) {
  if (!values.length || values.some((v) => !Number.isFinite(v)))
    throw new Error("Invalid data");
  const sorted = [...values].sort((a, b) => a - b),
    n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  return {
    n,
    mean,
    median:
      n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2,
    sd: Math.sqrt(values.reduce((s, x) => s + (x - mean) ** 2, 0) / n),
    min: sorted[0],
    max: sorted[n - 1],
  };
}
export function parseData(raw) {
  const parts = raw
    .trim()
    .split(/[;\s]+/)
    .filter(Boolean);
  if (!parts.length || parts.length > 100) throw new Error("Use 1–100 values");
  const numbers = parts.map((v) =>
    /^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(v)
      ? Number(v.replace(",", "."))
      : NaN,
  );
  if (numbers.some((x) => !Number.isFinite(x) || Math.abs(x) > 10000))
    throw new Error("Invalid values");
  return numbers;
}
export function riemann(n) {
  let sum = 0;
  for (let i = 0; i < n; i++) sum += (i / n) ** 2 / n;
  return sum;
}
export function gcd(a, b) {
  while (b) {
    [a, b] = [b, a % b];
  }
  return Math.abs(a);
}
export function isAnswer(raw, expected, tolerance = 1e-6) {
  const clean = raw.trim().replace(",", ".");
  if (
    !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:\s*\/\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+))?$/.test(
      clean,
    )
  )
    return false;
  const [a, b] = clean.split("/").map(Number),
    value = b === undefined ? a : a / b;
  return Number.isFinite(value) && Math.abs(value - expected) <= tolerance;
}
