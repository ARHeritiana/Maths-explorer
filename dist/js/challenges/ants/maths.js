// Pure mathematics of the ants challenge (no DOM), checked by a step-by-step simulation in tests/ants.test.mjs.
// Ants walk at 1 cm/s on a stick of L cm; two ants that meet both turn back; an ant that reaches an end falls.
// Exact model: seen from afar, two ants turning back look exactly like two ants passing through each other. So the
// "ghosts" x + d t walk straight on, the ants keep their order, and at every moment the ants occupy the ghosts' places.

// Starting positions (integer cm, distinct, inside the stick) and directions (1 right, -1 left) for n ants on L cm.
export function antStart(L, n) {
  let seed = (L * 7919 + n * 104729) % 2147483647 || 1;
  const rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
  const xs = new Set(), out = [];
  for (let k = 0; k < n; k++) {
    let x = Math.round(((k + 0.5) / n) * L + (rnd() - 0.5) * (L / n) * 0.6);
    x = Math.min(L - 1, Math.max(1, x));
    while (xs.has(x)) x = x < L - 1 ? x + 1 : 1;
    xs.add(x); out.push({ x, d: rnd() < 0.5 ? -1 : 1 });
  }
  return out;
}

// Time for a ghost to leave the stick: it walks straight on.
export const ghostTime = ({ x, d }, L) => (d > 0 ? L - x : x);

// Time until every ant has fallen: the last ghost to leave.
export const lastFall = (ants, L) => Math.max(0, ...ants.map((a) => ghostTime(a, L)));

// The answer: the longest possible time, over every start (an ant at an end facing inward walks the whole stick).
export const longestTime = (L) => L;

// The state of each ant (in the input order) at time t: { x, d, fallen: 0 | -1 | 1 (left or right end), fallT }.
export function antsAt(ants, L, t) {
  const n = ants.length, order = ants.map((a, i) => i).sort((i, j) => ants[i].x - ants[j].x);
  const ghosts = ants.map((a) => ({ g: a.x + a.d * t, d: a.d, leave: ghostTime(a, L), side: a.d }));
  const leftTimes = ghosts.filter((G) => G.side < 0).map((G) => G.leave).sort((a, b) => a - b);
  const rightTimes = ghosts.filter((G) => G.side > 0).map((G) => G.leave).sort((a, b) => a - b);
  const nl = leftTimes.length, alive = ghosts.filter((G) => G.leave > t).sort((a, b) => a.g - b.g || a.d - b.d);
  const goneLeft = leftTimes.filter((x) => x <= t).length;
  const out = new Array(n);
  order.forEach((i, rank) => {
    // the nl leftmost ants fall off the left end, in order; the others off the right end, the rightmost first
    const fallT = rank < nl ? leftTimes[rank] : rightTimes[n - 1 - rank];
    if (fallT <= t) out[i] = { x: rank < nl ? 0 : L, d: rank < nl ? -1 : 1, fallen: rank < nl ? -1 : 1, fallT };
    else { const G = alive[rank - goneLeft]; out[i] = { x: G.g, d: G.d, fallen: 0, fallT }; }
  });
  return out;
}

// Every meeting before all ants have fallen: { t, x } (two ghosts cross; the two ants there turn back).
export function bumps(ants, L) {
  const out = [];
  for (const a of ants) for (const b of ants) if (a.d > 0 && b.d < 0 && b.x > a.x) out.push({ t: (b.x - a.x) / 2, x: (a.x + b.x) / 2 });
  return out.filter((m) => m.x > 0 && m.x < L).sort((u, v) => u.t - v.t);
}
