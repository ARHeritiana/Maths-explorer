// Pure arithmetic shared by the experiments `euler-primes` and `fermat`: primality and factorisation by trial division, exact for
// every number below 2^53 (the largest one used is 2^32 + 1, whose trial division stops at 641). No DOM.

export function smallestFactor(N) {
  if (N < 2) return null;
  if (N % 2 === 0) return 2;
  for (let d = 3; d * d <= N; d += 2) if (N % d === 0) return d;
  return N;
}
export const isPrime = (N) => N >= 2 && smallestFactor(N) === N;

// [[p, k], ...] with p increasing.
export function factor(N) {
  const out = [];
  while (N > 1) {
    const p = smallestFactor(N);
    let k = 0;
    while (N % p === 0) { N /= p; k++; }
    out.push([p, k]);
  }
  return out;
}

const SUP = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
export const sup = (k) => String(k).split("").map((d) => SUP[d]).join("");
// "3⁴ × 19 × 87 211" (French) or "3⁴ × 19 × 87,211"
export const group = (N, fr) => String(N).replace(/\B(?=(\d{3})+(?!\d))/g, fr ? " " : ",");
export const writeFactors = (N, fr) => factor(N).map(([p, k]) => group(p, fr) + (k > 1 ? sup(k) : "")).join(" × ");
