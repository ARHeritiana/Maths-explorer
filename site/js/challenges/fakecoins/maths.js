// Pure mathematics of the fakecoins challenge (no DOM), checked by an independent method in tests/.

/* ------------------------------------------------------------ fake coins */
// One weighing on a precise scale: the counts taken from the piles must be pairwise different, so the sum is at least
// 0 + 1 + … + (n − 1). The classical choice 1, 2, …, n uses n(n + 1)/2 coins.
export const minSample = (n) => (n * (n - 1)) / 2;

export const classicSample = (n) => (n * (n + 1)) / 2;

// Which pile (0-based) does a design identify from the deficit? Returns null when two piles give the same reading.
export const identifies = (counts) => new Set(counts).size === counts.length;
