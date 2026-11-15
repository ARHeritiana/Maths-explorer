// Pure mathematics of the __ID__ challenge (no DOM), checked by an independent method in tests/__ID__.test.mjs.

// Number of handshakes among n people: n(n - 1) / 2.
export const handshakes = (n) => (n * (n - 1)) / 2;

// Points of the n people on a circle of radius r centred at (cx, cy), first one at the top.
export const seats = (n, cx, cy, r) => Array.from({ length: n }, (_, k) => { const a = -Math.PI / 2 + (2 * Math.PI * k) / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });

// Key of an unordered pair, so that (i, j) and (j, i) are the same handshake.
export const pairKey = (i, j) => (i < j ? `${i}-${j}` : `${j}-${i}`);
