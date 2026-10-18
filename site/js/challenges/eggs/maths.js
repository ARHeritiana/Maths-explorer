// Pure mathematics of the eggs challenge (no DOM), checked by an independent method in tests/.

// Floors that e eggs and d drops can settle: sum of C(d, i) for i = 1..e.
export const eggCover = (e, d) => { let sum = 0, c = 1; for (let i = 1; i <= e; i++) { c = (c * (d - i + 1)) / i; sum += c; } return Math.round(sum); };

export const eggDrops = (e, floors) => { let d = 0; while (eggCover(e, d) < floors) d++; return d; };

// Strategy of the first egg: floors where it is dropped (steps shrink as the remaining drops shrink).
export function eggPlan(e, floors) {
  const n = eggDrops(e, floors), out = [];
  let at = 0;
  for (let j = 1; j <= n && at < floors; j++) { at = Math.min(floors, at + eggCover(e - 1, n - j) + 1); out.push(at); }
  return { drops: n, floors: out };
}
