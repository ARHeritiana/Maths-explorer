// Pure mathematics of the lighteggs challenge (no DOM), checked by an independent method in tests/.

/* ------------------------------------------------------------ light egg */
// Fewest weighings that always find the one lighter egg among n, on a two-pan balance: 3^k ≥ n.
export const eggWeighings = (n) => { let k = 0, cap = 1; while (cap < n) { cap *= 3; k++; } return k; };

// A weighing plan: sizes of the three groups (left pan, right pan, aside), as even as the capacity allows.
export function splitThree(n, weighingsLeft) {
  const cap = 3 ** (weighingsLeft - 1), a = Math.min(cap, Math.floor(n / 2));
  return [a, a, n - 2 * a];
}
