// Pure mathematics of the piles challenge (no DOM), checked by an independent method in tests/.

/* ------------------------------------------------------------ H: split piles */
// Split a pile of n stones into two, scoring the product of the sizes, until only single stones remain: the total
// is n(n − 1)/2 whatever the splits, because each pair of stones is separated exactly once.
export const splitTotal = (n) => (n * (n - 1)) / 2;

export function randomSplitTotal(n, rnd = Math.random) { const piles = [n]; let total = 0; while (piles.some((x) => x > 1)) { const i = piles.findIndex((x) => x > 1), s = piles[i], a = 1 + Math.floor(rnd() * (s - 1)); piles.splice(i, 1, a, s - a); total += a * (s - a); } return total; }
