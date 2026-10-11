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
        : (() => {
            // Avoid cancellation when one root is much smaller than the other.
            const q = -0.5 * (b + (b < 0 ? -1 : 1) * Math.sqrt(d));
            return [q / a, c / q].sort((x, y) => x - y);
          })();
  return {
    kind: "quadratic",
    roots: roots.map(x => Object.is(x, -0) ? 0 : x),
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
    sd: Math.hypot(...values.map(x => x - mean)) / Math.sqrt(n),
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
export function riemann(n, method = "left") {
  if (!Number.isInteger(n) || n < 1 || n > 100000 ||
      !["left", "right", "midpoint"].includes(method))
    throw new RangeError("Invalid rectangle configuration");
  const offset = method === "right" ? 1 : method === "midpoint" ? 0.5 : 0;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += ((i + offset) / n) ** 2 / n;
  return sum;
}
export function squareSecant(x, h) {
  if (!Number.isFinite(x) || !Number.isFinite(h) || h === 0)
    throw new RangeError("A secant needs a finite, nonzero increment");
  return 2 * x + h;
}
export function formatNumber(n, lang = "en", digits = 3) {
  if (!Number.isFinite(n)) throw new RangeError("Expected a finite number");
  // Scientific notation preserves small nonzero values and large graph labels.
  const scientific = n !== 0 && (Math.abs(n) < Math.max(1e-4, 10 ** -digits) || Math.abs(n) >= 1e6);
  return new Intl.NumberFormat(lang, scientific
    ? { notation: "scientific", maximumSignificantDigits: 4 }
    : { maximumFractionDigits: digits }).format(Object.is(n, -0) ? 0 : n);
}
export function axisTicks(min, max) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || !(max > min))
    throw new RangeError("Invalid axis bounds");
  const rough = (max - min) / 6;
  const power = Math.max(Number.MIN_VALUE, 10 ** Math.floor(Math.log10(rough || Number.MIN_VALUE)));
  const step = [1, 2, 5, 10].map(v => v * power).find(v => v >= rough);
  const first = Math.ceil(min / step);
  const values = [];
  // Bounded by the chosen tick count, never by an absolute epsilon in data units.
  for (let i = 0; i < 8; i++) {
    const value = (first + i) * step;
    if (value > max + step * 1e-9) break;
    const normalized = Math.abs(value) < step * 1e-8 ? 0 : value;
    if (values.at(-1) !== normalized) values.push(normalized);
  }
  return { values, digits: Math.max(2, Math.min(15, -Math.floor(Math.log10(step)))) };
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
