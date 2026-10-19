// Pure maths of the sum and product puzzle (Freudenthal, 1969): two whole numbers 1 < x < y with x + y ≤ N; S knows the sum,
// P the product. P: "I don't know them." S: "I knew you didn't." P: "Now I know them." S: "Now I know them too." Each
// sentence filters the pairs; for N from 65 upwards (checked up to 300) only (4, 13) survives, for N ≤ 62 nothing does. No DOM.

export const SP_BOUNDS = [100, 65, 200, 62];

export function pairsUpTo(N) {
  const out = [];
  for (let x = 2; x < N; x++) for (let y = x + 1; x + y <= N; y++) out.push([x, y]);
  return out;
}
const group = (list, f) => { const m = new Map(); for (const p of list) { const k = f(p); if (!m.has(k)) m.set(k, []); m.get(k).push(p); } return m; };
const sum = ([x, y]) => x + y, prod = ([x, y]) => x * y;

// [all pairs, after P1, after S1, after P2, after S2]
export function spSteps(N) {
  const all = pairsUpTo(N), byP = group(all, prod), byS = group(all, sum);
  const p1 = all.filter((q) => byP.get(prod(q)).length > 1);
  const s1 = all.filter((q) => byS.get(sum(q)).every((r) => byP.get(prod(r)).length > 1));
  const byP1 = group(s1, prod), p2 = s1.filter((q) => byP1.get(prod(q)).length === 1);
  const byS2 = group(p2, sum), s2 = p2.filter((q) => byS2.get(sum(q)).length === 1);
  return [all, p1, s1, p2, s2];
}
export const spSolution = (N) => { const s = spSteps(N)[4]; return s.length === 1 ? s[0] : null; };
// sums S could have after "I knew you didn't" (every split of the sum has an ambiguous product)
export const goodSums = (N) => [...new Set(spSteps(N)[2].map(sum))].sort((a, b) => a - b);
export const splitsOfSum = (s, N) => pairsUpTo(N).filter((q) => sum(q) === s);
export const splitsOfProduct = (p, N) => pairsUpTo(N).filter((q) => prod(q) === p);
