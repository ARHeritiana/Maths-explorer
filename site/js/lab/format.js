// Number formatting of the laboratory, with honest labelling: a value that is rounded for display is written with ≈, an exact
// one with =. French conventions by default (decimal comma, (x ; y), [a ; b]). Pure: no DOM, tested in tests/lab-engine.test.mjs.
//
//   num(n, d)        the number rounded to d decimals (default 2), trailing zeros removed
//   isExact(n, d)    true when num(n, d) is the value itself (0,25 and 6 are exact at two decimals, 33/7 and 0,125 are not)
//   eq(n, d)         "=" or "≈"
//   rel(label, n, d) "x̄ ≈ 4,71" or "x̄ = 6"
//   read(n, d)       a value on its own (a readout card, a table cell): "≈ 4,71" when rounded, "6" when exact
//   ratio(p, q, d)   p / q: "33/7 ≈ 4,71" when the quotient is rounded, "4,5" when it is exact (p and q are decimals)
//   full(n)          enough decimals (6) to write an intermediate value of a calculation without rounding it visibly
//   pt(...)          "(x ; y)", written "≈ (x ; y)" when a coordinate is rounded
const MINUS = "−";
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));

export function makeFormat(lang = "fr") {
  const fr = lang !== "en";
  const round = (n, d) => Math.round(n * 10 ** d) / 10 ** d;
  const num = (n, d = 2) => {
    if (!Number.isFinite(n)) return n > 0 ? "∞" : n < 0 ? MINUS + "∞" : "?";
    let s = round(n, d).toFixed(d);
    if (s.includes(".")) s = s.replace(/\.?0+$/, "");
    if (s === "-0" || s === "") s = "0";
    s = s.replace("-", MINUS);
    return fr ? s.replace(".", ",") : s;
  };
  const isExact = (n, d = 2) => Number.isFinite(n) && Math.abs(round(n, d) - n) <= 1e-9 * Math.max(1, Math.abs(n));
  const eq = (n, d = 2) => (isExact(n, d) ? "=" : "≈");
  const rel = (label, n, d = 2) => `${label} ${eq(n, d)} ${num(n, d)}`;
  const read = (n, d = 2) => (isExact(n, d) ? num(n, d) : "≈ " + num(n, d));
  const full = (n) => num(n, 6);
  const ratio = (p, q, d = 2) => {
    const v = p / q;
    if (isExact(v, d) || !Number.isFinite(v)) return num(v, d);
    // an integer fraction p/q in lowest terms, when p and q are decimals with at most two places
    const k = [1, 10, 100].find((m) => Math.abs(p * m - Math.round(p * m)) < 1e-9 && Math.abs(q * m - Math.round(q * m)) < 1e-9);
    if (!k) return read(v, d);
    let a = Math.round(p * k), b = Math.round(q * k);
    const g = gcd(a, b) || 1; a /= g; b /= g;
    if (b < 0) { a = -a; b = -b; }
    return `${num(a, 0)}/${num(b, 0)} ≈ ${num(v, d)}`;
  };
  const coord = (v) => (typeof v === "number" ? num(v) : v);
  const pt = (...c) => (c.every((v) => typeof v !== "number" || isExact(v)) ? "" : "≈ ") + "(" + c.map(coord).join(fr ? " ; " : ", ") + ")";
  const iv = (a, b) => `[${coord(a)}${fr ? " ; " : ", "}${coord(b)}]`;
  const t = (pair) => (Array.isArray(pair) ? pair[fr ? 0 : 1] : pair);
  return { fr, lang: fr ? "fr" : "en", num, isExact, eq, rel, read, ratio, full, pt, iv, t };
}
