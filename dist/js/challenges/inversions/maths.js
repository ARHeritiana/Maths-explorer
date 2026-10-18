// Pure mathematics of the inversions challenge (no DOM), checked by an independent method in tests/.

/* ----------------------------------------------------------- G: inversions */
export const mulberry = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

export function permOf(n, seed) { const rnd = mulberry(seed * 7919 + 17 + n), p = Array.from({ length: n }, (_, i) => i + 1); for (let i = n - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } return p; }

export const inversions = (p) => { let c = 0; for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) if (p[i] > p[j]) c++; return c; };

// Bubble sort by adjacent swaps of out-of-order neighbours; returns the number of swaps and the list of swapped positions.
export function bubbleSwaps(p) { const a = [...p], log = []; let moved = true; while (moved) { moved = false; for (let i = 0; i + 1 < a.length; i++) if (a[i] > a[i + 1]) { [a[i], a[i + 1]] = [a[i + 1], a[i]]; log.push(i); moved = true; } } return { count: log.length, log, sorted: a }; }
