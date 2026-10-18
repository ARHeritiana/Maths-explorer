// Pure mathematics of the merge challenge (no DOM), checked by an independent method in tests/.

/* ------------------------------------------- E: erase two, write a+b+ab */
export const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));

export const mergeFinal = (n) => factorial(n + 1) - 1;

// ∏(x + 1) does not change when a, b are replaced by a + b + ab: the product of (x + 1) is the invariant.
export const mergeProduct = (nums) => nums.reduce((p, x) => p * (x + 1), 1);
