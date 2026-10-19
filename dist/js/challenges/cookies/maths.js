// Pure maths of the cookies challenge: n identical cookies shared among k named people. With no rule, a sharing is a row of
// n cookies and k − 1 separators, so there are C(n + k − 1, k − 1); if everyone gets at least one, C(n − 1, k − 1). No DOM.

// The people are named by letters.
export const NAMES = ["A", "B", "C", "D", "E", "F"];

export function binom(n, k) {
  if (k < 0 || n < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let c = 1;
  for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i;
  return Math.round(c);
}

export const sharings = (n, k, atLeastOne = false) => (atLeastOne ? binom(n - 1, k - 1) : binom(n + k - 1, k - 1));

// The row of cookies (●) and separators (|) that codes a sharing [3, 0, 2, ...].
export const code = (parts) => parts.map((p) => "●".repeat(p)).join("|");

// Every sharing of n among k (for small n and k only: the activity lists the ones the learner found).
export function allSharings(n, k, atLeastOne = false) {
  const out = [], min = atLeastOne ? 1 : 0;
  const rec = (left, i, acc) => {
    if (i === k - 1) { if (left >= min) out.push([...acc, left]); return; }
    for (let v = min; v <= left - min * (k - 1 - i); v++) rec(left - v, i + 1, [...acc, v]);
  };
  rec(n, 0, []);
  return out;
}
