// Pure mathematics of the reflect challenge (no DOM), checked by an independent method in tests/.

export const pathLength = (a, b, d, x) => Math.hypot(x, a) + Math.hypot(d - x, b);

// Reflect B in the river: the straight line from A to B' = (d, −b) has length √(d² + (a + b)²) and meets the river at x*.
export const shortestVia = (a, b, d) => Math.hypot(d, a + b);

export const bestContact = (a, b, d) => (a * d) / (a + b);

export const REFLECT_SETS = ["1,2,4", "2,3,12", "3,5,15", "4,4,6", "1,7,15", "5,7,9"];

export const reflectSet = (id) => String(id).split(",").map(Number);
