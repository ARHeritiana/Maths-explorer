// Pure mathematics of the cham challenge (no DOM), checked by an independent method in tests/.

/* ------------------------------------------------------- F: chameleons */
// (r, g, b): when two chameleons of different colours meet, both take the third colour.
export const CHAM_SETS = ["13,15,17", "8,5,2", "7,10,13", "4,7,9", "1,4,7", "3,5,7"];

export const chamSet = (id) => String(id).split(",").map(Number);

export const chamNext = (s) => [[0, 1, 2], [0, 2, 1], [1, 2, 0]].filter(([i, j]) => s[i] > 0 && s[j] > 0).map(([i, j, k]) => { const t = [...s]; t[i]--; t[j]--; t[k] += 2; return { state: t, meet: [i, j] }; });

// Shortest sequence of meetings leading to a single colour (null when impossible), by breadth-first search.
export function chamSolve(r, g, b) {
  const key = (s) => s.join(","), start = [r, g, b], prev = new Map([[key(start), null]]); let frontier = [start];
  const single = (s) => s.filter((x) => x > 0).length === 1;
  while (frontier.length) {
    const next = [];
    for (const s of frontier) for (const { state, meet } of chamNext(s)) {
      const kk = key(state); if (prev.has(kk)) continue;
      prev.set(kk, { from: s, meet });
      if (single(state)) { const steps = []; let cur = state; while (prev.get(key(cur))) { const { from, meet: m } = prev.get(key(cur)); steps.unshift({ from, to: cur, meet: m }); cur = from; } return steps; }
      next.push(state);
    }
    frontier = next;
  }
  return null;
}

export const chamMin = (r, g, b) => (chamSolve(r, g, b) || []).length;

// Invariant: the differences of the three counts modulo 3. All one colour needs two counts equal to 0, so two counts congruent mod 3.
export const chamPossible = (r, g, b) => (r - g) % 3 === 0 || (g - b) % 3 === 0 || (r - b) % 3 === 0;
