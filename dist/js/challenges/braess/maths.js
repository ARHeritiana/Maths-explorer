// Pure mathematics of the braess challenge (no DOM), checked by an independent method in tests/braess.test.mjs.
// The town: N drivers go from A to B every morning. The streets A→C and D→B take (number of cars on them) / 100 minutes,
// the expressways C→B and A→D always take 45 minutes, and the new road C→D (when it is open) takes 0 minutes.
// Routes: "top" A→C→B, "bottom" A→D→B, "short" A→C→D→B.

export const ROUTES = ["top", "bottom", "short"];
export const SLOW = 100, FAST = 45;   // street: cars / 100 minutes; expressway: 45 minutes

// Minutes on each route for a split of the drivers {top, bottom, short}.
export function routeTimes({ top, bottom, short = 0 }) {
  const ac = (top + short) / SLOW, db = (bottom + short) / SLOW;
  return { top: ac + FAST, bottom: FAST + db, short: ac + db };
}

// The split where no driver can save time by changing route (each driver picks the fastest route for themselves).
// Closed road: the two routes are mirror images, so the drivers share them equally: N/2 each, N/200 + 45 minutes.
// Open road: the shortcut A→C→D→B costs 2x/100 when x cars use both streets; it beats the expressways while the
// streets take at most 45 minutes each, so for N ≤ 4500 everyone takes it. Beyond, the streets fill to 4500 cars
// (45 minutes each) and the rest overflow evenly onto the two other routes; from N = 9000 the shortcut is empty.
export function equilibrium(N, open) {
  if (!open) return { flows: { top: N / 2, bottom: N / 2, short: 0 }, time: N / (2 * SLOW) + FAST };
  const cap = FAST * SLOW;   // 4500 cars make a street take 45 minutes
  if (N <= cap) return { flows: { top: 0, bottom: 0, short: N }, time: (2 * N) / SLOW };
  if (N >= 2 * cap) return { flows: { top: N / 2, bottom: N / 2, short: 0 }, time: N / (2 * SLOW) + FAST };
  const side = N - cap;
  return { flows: { top: side, bottom: side, short: N - 2 * side }, time: 2 * FAST };
}

// The answer: minutes per trip once the new road is open, and the time before, for the solution text.
export const after = (N) => equilibrium(N, true).time;
export const before = (N) => equilibrium(N, false).time;

// Size of the groups of drivers the learner moves in the activity: N / 20 (50 to 400 drivers).
export const groupSize = (N) => N / 20;

// One step of selfish switching, in groups of g drivers: among the moves of one group from a route to another that
// make that group strictly faster (comparing its old time with its time after the move), take the one that saves the
// most. Returns the new split and the move, or null when nobody gains by changing: an equilibrium is reached.
export function switchOnce(flows, open, g) {
  const now = routeTimes(flows), allowed = ROUTES.filter((r) => open || r !== "short");
  let best = null;
  for (const from of allowed) {
    if (flows[from] < g) continue;
    for (const to of allowed) {
      if (to === from) continue;
      const next = { ...flows, [from]: flows[from] - g, [to]: flows[to] + g }, gain = now[from] - routeTimes(next)[to];
      if (gain > 1e-9 && (!best || gain > best.gain)) best = { from, to, gain, next };
    }
  }
  return best ? { flows: best.next, from: best.from, to: best.to } : null;
}

// Positions on the map (shared by the activity and the solution): the four places and the route through them.
export const PLACES = { A: [52, 160], B: [318, 160], C: [185, 62], D: [185, 258] };
export const PATH = { top: ["A", "C", "B"], bottom: ["A", "D", "B"], short: ["A", "C", "D", "B"] };
// Point at fraction u (0 to 1) of a route, and the heading there (radians), along straight segments.
export function along(route, u) {
  const pts = PATH[route].map((k) => PLACES[k]), L = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); total += d; }
  let s = Math.max(0, Math.min(1, u)) * total, i = 0;
  while (i < L.length - 1 && s > L[i]) { s -= L[i]; i++; }
  const a = pts[i], b = pts[i + 1], k = L[i] ? s / L[i] : 0;
  return { x: a[0] + (b[0] - a[0]) * k, y: a[1] + (b[1] - a[1]) * k, heading: Math.atan2(b[1] - a[1], b[0] - a[0]) };
}
