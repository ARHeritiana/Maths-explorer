// Pure mathematics of the nim challenge (no DOM), checked by an independent method in tests/.

/* ------------------------------------------------------------------ nim: a scripted game for the animated solution */
// A scripted game. With r = n mod (m + 1) > 0 you open with r, then answer each opponent move k with m + 1 − k.
// With r = 0 you open with 1 and the opponent answers so that a multiple of m + 1 is left to you.
export function nimScript(q) {
  const b = q.m + 1, r = q.n % b, moves = [];
  let left = q.n, i = 0;
  if (r > 0) { moves.push([1, r]); left -= r; } else { moves.push([1, 1]); left -= 1; }
  while (left > 0) {
    const k = r > 0 ? Math.min(left, ((i * 2) % q.m) + 1) : left % b === 0 ? Math.min(left, 1) : left % b;   // opponent move (the perfect one when r = 0)
    i++; moves.push([2, k]); left -= k;
    if (left > 0) { const reply = Math.min(left, r > 0 ? b - k : 1 + ((i * 3) % q.m)); moves.push([1, reply]); left -= reply; }
  }
  return moves;
}
