// The hundred boxes problem (Gal and Miltersen 2003; the cycle strategy is due to Sven Skyum). Pure maths, no DOM.
// n prisoners numbered 1..n, n boxes hiding a random permutation sigma of the numbers. Each prisoner may open n/2 boxes, alone, and
// every prisoner must find his own number. Cycle strategy: open box i (your number), read sigma(i), open that box, and so on.
// It succeeds for everybody iff no cycle of sigma is longer than n/2. Boxes and numbers are 0-based inside the code (box k, number k).

export function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function randomPermutation(n, r) { const p = Array.from({length: n}, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } return p; }

// Cycles of the permutation as lists of boxes in the order a prisoner would follow them.
export function cycles(p) {
  const seen = new Array(p.length).fill(false), out = [];
  for (let s = 0; s < p.length; s++) { if (seen[s]) continue; const c = []; for (let k = s; !seen[k]; k = p[k]) { seen[k] = true; c.push(k); } out.push(c); }
  return out;
}
export const longestCycle = (p) => Math.max(...cycles(p).map((c) => c.length));
// Boxes opened by the cycle strategy for prisoner i, stopping at the limit or when the number is found.
export function cycleSearch(p, i, limit) { const opened = []; let k = i; while (opened.length < limit) { opened.push(k); if (p[k] === i) return {opened, found: true}; k = p[k]; } return {opened, found: false}; }
export function randomSearch(p, i, limit, r) {
  const idx = Array.from({length: p.length}, (_, k) => k), opened = [];
  for (let t = 0; t < limit; t++) { const j = t + Math.floor(r() * (idx.length - t)); [idx[t], idx[j]] = [idx[j], idx[t]]; opened.push(idx[t]); if (p[idx[t]] === i) return {opened, found: true}; }
  return {opened, found: false};
}
// All prisoners on one permutation: returns the number of prisoners who succeed and whether everybody does.
export function runAll(p, strategy, r) {
  const limit = p.length / 2; let ok = 0;
  for (let i = 0; i < p.length; i++) if ((strategy === 'cycle' ? cycleSearch(p, i, limit) : randomSearch(p, i, limit, r)).found) ok++;
  return {ok, win: ok === p.length};
}
// Repeated games with a seeded generator (a simulation, not a proof).
export function simulate(n, strategy, games, seed) {
  const r = rng(seed); let wins = 0;
  for (let g = 0; g < games; g++) { const p = randomPermutation(n, r); if (runAll(p, strategy, r).win) wins++; }
  return wins;
}
// Exact probabilities. Cycle strategy: 1 - (1/(m+1) + ... + 1/n) with m = n/2; random choices: 2^-n.
export const cycleWinProbability = (n) => { let s = 0; for (let k = n / 2 + 1; k <= n; k++) s += 1 / k; return 1 - s; };
export const randomWinProbability = (n) => 2 ** -n;
