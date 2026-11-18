// The paradoxical decomposition behind Banach-Tarski, pure (no DOM). Two rotations of space by θ = arccos(1/3), a about the z axis
// and b about the x axis, generate a free group F₂: distinct reduced words give distinct rotations. Here every rotation is kept
// exactly: 3^k times a word of length k has entries x + y√2 with integers x, y (pairs of exact integers below 2^53 for k ≤ 20), so
// the distinctness of all reduced words up to a length is checked with no rounding at all.
// Pieces (capital = inverse): S(a), S(A), S(b), S(B) = words starting with that letter, and {e}. Then
//   F₂ = S(a) ∪ a·S(A)   and   F₂ = S(b) ∪ b·S(B),
// because a·(A u) = u, and the u are all reduced words not starting with a. Each piece holds a quarter of the words, yet turning
// S(A) by a gives three quarters: no additive volume can be given to these pieces. A point p not on any axis turns this into a
// decomposition of its orbit; choosing one such point in every orbit of the sphere needs the axiom of choice.
export const LETTERS = ['a', 'A', 'b', 'B'];
export const INVERSE = { a: 'A', A: 'a', b: 'B', B: 'b' };
export const COS = 1 / 3, SIN = 2 * Math.SQRT2 / 3, THETA = Math.acos(1 / 3);
// 3 x (rotation) with entries [x, y] = x + y√2
const Z = [0, 0], I3 = [[[1, 0], Z, Z], [Z, [1, 0], Z], [Z, Z, [1, 0]]];   // e, of length 0: 3^0 x identity
export const EXACT = {
  a: [[[1, 0], [0, -2], Z], [[0, 2], [1, 0], Z], [Z, Z, [3, 0]]],
  A: [[[1, 0], [0, 2], Z], [[0, -2], [1, 0], Z], [Z, Z, [3, 0]]],
  b: [[[3, 0], Z, Z], [Z, [1, 0], [0, -2]], [Z, [0, 2], [1, 0]]],
  B: [[[3, 0], Z, Z], [Z, [1, 0], [0, 2]], [Z, [0, -2], [1, 0]]],
};
const zmul = ([a, b], [c, d]) => [a * c + 2 * b * d, a * d + b * c];
const zadd = ([a, b], [c, d]) => [a + c, b + d];
export function exactMul(M, N) { return M.map((row) => [0, 1, 2].map((j) => row.reduce((s, x, k) => zadd(s, zmul(x, N[k][j])), [0, 0]))); }
export const toFloat = (M, k) => M.map((row) => row.map(([x, y]) => (x + y * Math.SQRT2) / 3 ** k));
export const ROT = Object.fromEntries(LETTERS.map((l) => [l, toFloat(EXACT[l], 1)]));
export const words = (n) => 2 * 3 ** n - 1;          // reduced words of length at most n (with e)
export const pieceSize = (n) => (3 ** n - 1) / 2;    // words of length 1..n starting with a given letter
// All reduced words of length ≤ n, breadth first. Each word w is built by prepending a letter to a shorter word u (w = s u), so
// its rotation is s·(rotation of u): left multiplication, the action that moves the pieces. Returns
// {list: [{w, first, len}], float: Float32Array of the 9 entries (row-major) of each rotation, exact: the 3^k scaled exact entries}.
export function freeGroup(n, { exact = true } = {}) {
  const list = [{ w: '', first: '', len: 0 }], mats = [I3], flo = [[1, 0, 0, 0, 1, 0, 0, 0, 1]];
  let level = [0];
  for (let k = 1; k <= n; k++) {
    const next = [];
    for (const i of level) {
      const u = list[i];
      for (const s of LETTERS) {
        if (u.w && u.w[0] === INVERSE[s]) continue;
        const j = list.length; list.push({ w: s + u.w, first: s, len: k }); next.push(j);
        if (exact) mats.push(exactMul(EXACT[s], mats[i]));
        const R = ROT[s], F = flo[i];
        flo.push([0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => R[r][0] * F[c] + R[r][1] * F[3 + c] + R[r][2] * F[6 + c])));
      }
    }
    level = next;
  }
  const float = new Float32Array(flo.length * 9); flo.forEach((m, i) => float.set(m, i * 9));
  return { list, float, exact: exact ? mats : null, n };
}
// Exact check that the rotations of all listed words are pairwise distinct (scaled to the common denominator 3^n).
export function distinctRotations(G) {
  const seen = new Set();
  G.list.forEach(({ len }, i) => { const f = 3 ** (G.n - len); seen.add(G.exact[i].flat().map(([x, y]) => `${x * f},${y * f}`).join(';')); });
  return seen.size;
}
export const piece = (w) => w ? w[0] : 'e';
// Where a word goes when its piece is moved: in copy 1, S(A) is turned by a; in copy 2, S(B) is turned by b. Returns the reduced word.
export function moved(w) { const p = piece(w); return (p === 'A' || p === 'B') ? w.slice(1) : w; }
// The words of copy 1 (S(a) ∪ a·S(A)) and copy 2 (S(b) ∪ b·S(B)) after the moves, and whether each covers every word of length ≤ n - 1.
export function copies(G) {
  const one = new Set(), two = new Set();
  for (const { w } of G.list) { const p = piece(w); if (p === 'a' || p === 'A') one.add(moved(w)); if (p === 'b' || p === 'B') two.add(moved(w)); }
  const shorter = G.list.filter((x) => x.len <= G.n - 1).map((x) => x.w);
  return { one: one.size, two: two.size, shorter: shorter.length, oneCovers: shorter.every((w) => one.has(w)), twoCovers: shorter.every((w) => two.has(w)) };
}
// the rotation (row-major 3x3, floats) about the unit axis u by angle t (Rodrigues)
export function axisRotation(u, t) {
  const [x, y, z] = u, c = Math.cos(t), s = Math.sin(t), C = 1 - c;
  return [c + x * x * C, x * y * C - z * s, x * z * C + y * s, y * x * C + z * s, c + y * y * C, y * z * C - x * s, z * x * C - y * s, z * y * C + x * s, c + z * z * C];
}
export const AXIS = { a: [0, 0, 1], b: [1, 0, 0] };
