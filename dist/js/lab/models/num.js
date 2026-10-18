// Tiny numeric helpers shared by experiments, templates and tests.
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
// Snap to a grid without float noise.
export const snap = (v, step) => (step ? Number((Math.round(v / step) * step).toFixed(10)) : v);
