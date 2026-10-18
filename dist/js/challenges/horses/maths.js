// Pure mathematics of the horses challenge (no DOM), checked by an independent method in tests/.

/* ---------------------------------------------------------------- horses */
// The seven-race method for the three fastest of 25 horses (races of at most five, no clock: only the finishing
// order is seen). `speed(h)` is the hidden speed of horse h (0..24, larger = faster). Returns the answer and the log.
export function horsesTop3(speed) {
  const log = [], race = (hs, label) => { const order = [...hs].sort((a, b) => speed(b) - speed(a)); log.push({ label, horses: [...hs], order }); return order; };
  const heats = [0, 1, 2, 3, 4].map((g) => race([0, 1, 2, 3, 4].map((k) => 5 * g + k), `heat ${g + 1}`));
  const finalists = race(heats.map((h) => h[0]), "winners");
  const rank = finalists.map((w) => heats.findIndex((h) => h[0] === w));   // heat of the 1st, 2nd, ... fastest winner
  const [A, B, C] = [heats[rank[0]], heats[rank[1]], heats[rank[2]]];
  const last = race([A[1], A[2], B[0], B[1], C[0]], "candidates");
  return { top3: [A[0], last[0], last[1]], races: log.length, log, candidates: [A[1], A[2], B[0], B[1], C[0]] };
}

// With r = 1 only the winner is wanted: 24 horses must lose and a race of five creates at most 4 losers.
export const horseRaces = (top) => (Number(top) === 1 ? 6 : 7);

export function horsesTop1(speed) {
  const log = [], race = (hs, label) => { const order = [...hs].sort((a, b) => speed(b) - speed(a)); log.push({ label, horses: [...hs], order }); return order; };
  const heats = [0, 1, 2, 3, 4].map((g) => race([0, 1, 2, 3, 4].map((k) => 5 * g + k), `heat ${g + 1}`));
  const final = race(heats.map((h) => h[0]), "winners");
  return { top1: final[0], races: log.length, log };
}
