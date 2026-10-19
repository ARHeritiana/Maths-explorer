// Pure maths of the nails challenge (picture hanging). A winding of the string is a word in the nails: letter i = once around
// nail i clockwise, −i = anticlockwise. Removing nails deletes their letters; the picture falls exactly when what is left
// cancels down to nothing (free reduction). The shortest windings below were found by an exhaustive search over all words of
// increasing length (first letter fixed by symmetry); tests/challenge-puzzles2.test.mjs repeats that search. No DOM.

export const NAMES = ["A", "B", "C", "D"];
// "n,k": n nails; the picture must fall as soon as k nails (any k) are removed, and stay up with fewer removed.
export const NAIL_VARIANTS = ["2,1", "3,2", "3,1", "3,3", "4,3", "4,4"];
export const SHORTEST = {
  "2,1": [1, 2, -1, -2],
  "3,2": [1, 2, 3, -1, -2, -3],
  "3,1": [1, 2, -1, -2, 3, 2, 1, -2, -1, -3],
  "3,3": [1, 2, 3],
  "4,3": [1, 2, 3, 4, -1, -2, -3, -4],
  "4,4": [1, 2, 3, 4],
};
export const parseNails = (s) => String(s).split(",").map(Number);

export function reduce(word) {
  const out = [];
  for (const c of word) { if (out.length && out.at(-1) === -c) out.pop(); else out.push(c); }
  return out;
}
// mask: bit i - 1 set when nail i is removed
export const remaining = (word, mask) => word.filter((c) => !((mask >> (Math.abs(c) - 1)) & 1));
export const falls = (word, mask) => reduce(remaining(word, mask)).length === 0;
export const popcount = (m) => { let c = 0; while (m) { c += m & 1; m >>= 1; } return c; };
// does the word meet the rule "falls exactly when at least k of the n nails are removed"?
export function meets(word, n, k) {
  if (!word.length) return false;
  for (let m = 0; m < 1 << n; m++) if (falls(word, m) !== popcount(m) >= k) return false;
  return true;
}
export const letter = (c) => NAMES[Math.abs(c) - 1] + (c < 0 ? "⁻¹" : "");
export const wordText = (w) => (w.length ? w.map(letter).join(" ") : "1");
