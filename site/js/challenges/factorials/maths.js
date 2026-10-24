// Exact BigInt arithmetic throughout, including inputs beyond Number's integer range.
const natural = (n) => { const v = BigInt(n); if (v < 0n) throw new RangeError("Nonnegative integer required"); return v; };
export function primeFactors(base) {
  let b = natural(base); if (b < 2n) throw new RangeError("Base must be at least two");
  const factors = [];
  for (let p = 2n; p * p <= b; p += p === 2n ? 1n : 2n) if (b % p === 0n) {
    let e = 0n; while (b % p === 0n) { b /= p; e++; } factors.push([p, e]);
  }
  if (b > 1n) factors.push([b, 1n]); return factors;
}
export function valuationTerms(n, p) {
  let q = natural(n); p = BigInt(p);
  if (p < 2n || primeFactors(p).length !== 1 || primeFactors(p)[0][1] !== 1n) throw new RangeError("Prime required");
  const terms = []; let power = p;
  while ((q /= p) > 0n) { terms.push({ power, count: q }); power *= p; }
  return terms;
}
export const factorialValuation = (n, p) => valuationTerms(n, p).reduce((a, t) => a + t.count, 0n);
export function trailingZeros(n, base = 10n) {
  const factors = primeFactors(base), values = factors.map(([p, e]) => factorialValuation(n, p) / e);
  return values.reduce((a, b) => a < b ? a : b);
}
export function factorValuation(n, p) { let v = natural(n), count = 0n; p = BigInt(p); if (v === 0n || p < 2n) throw new RangeError("Positive integer and divisor required"); while (v % p === 0n) { v /= p; count++; } return count; }
