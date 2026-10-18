// Pure mathematics of the pegs challenge (no DOM), checked by an independent method in tests/.

/* --------------------------------------------------------- I: three pegs */
// Pegs a, b, c start at (0, 0), (1, 0), (0, 1). A peg jumps over another peg and lands on the point symmetric to its
// place about that peg (2B − A), if that point is free. Invariant: 2B − A ≡ A (mod 2) in both coordinates, so every
// peg keeps its parity class (x mod 2, y mod 2) for ever; a point of the fourth class, (1, 1), can never be reached.
export const PEGS_START = [[0, 0], [1, 0], [0, 1]];

export const PEG_TARGETS = ["1,1", "-1,1", "3,1", "2,0", "2,1", "3,0", "2,2", "4,0"];

export const pegTarget = (id) => String(id).split(",").map(Number);

export const mod2 = (x) => ((x % 2) + 2) % 2;

export const pegClass = ([x, y]) => [mod2(x), mod2(y)];

export const pegLanding = (from, over) => [2 * over[0] - from[0], 2 * over[1] - from[1]];

// Every legal jump from a position: { peg, over, to } (indices into the position).
export function pegJumps(pos) {
  const out = [];
  for (let i = 0; i < pos.length; i++) for (let j = 0; j < pos.length; j++) {
    if (i === j) continue;
    const to = pegLanding(pos[i], pos[j]);
    if (!pos.some((p, k) => k !== i && p[0] === to[0] && p[1] === to[1])) out.push({ peg: i, over: j, to });
  }
  return out;
}

// Necessary condition from the invariant: the target must lie in the parity class of one of the three pegs.
export const pegsPossible = (target) => PEGS_START.some((p) => pegClass(p).join() === pegClass(target).join());

// Shortest sequence of jumps that puts some peg on the target, by breadth-first search (null when the invariant forbids it).
export const pegCache = new Map();

export function pegsSolve(target, limit = 9) {
  const id = target.join(",");
  if (pegCache.has(id)) return pegCache.get(id);
  let result = null;
  if (pegsPossible(target)) {
    const key = (s) => s.map((p) => p.join(",")).join(";"), prev = new Map([[key(PEGS_START), null]]);
    let frontier = [PEGS_START];
    const on = (s) => s.some((p) => p[0] === target[0] && p[1] === target[1]);
    if (on(PEGS_START)) result = [];
    for (let d = 0; d < limit && !result; d++) {
      const next = [];
      for (const s of frontier) {
        for (const { peg, over, to } of pegJumps(s)) {
          const t = s.map((p) => [...p]); t[peg] = to;
          const kk = key(t); if (prev.has(kk)) continue;
          prev.set(kk, { from: s, peg, over });
          if (on(t)) {
            const steps = []; let cur = t;
            while (prev.get(key(cur))) { const { from, peg: pg, over: ov } = prev.get(key(cur)); steps.unshift({ peg: pg, over: ov, from: from[pg], to: cur[pg], state: cur }); cur = from; }
            result = steps; break;
          }
          next.push(t);
        }
        if (result) break;
      }
      frontier = next;
    }
  }
  pegCache.set(id, result);
  return result;
}

export const pegsMin = (target) => (pegsSolve(target) || []).length;

// Play a list of [peg, over] jumps from a position; each step records the peg's move and the position after it.
export function pegsRun(moves, start = PEGS_START) {
  let s = start.map((p) => [...p]); const steps = [];
  for (const [peg, over] of moves) { const from = s[peg], to = pegLanding(s[peg], s[over]); s = s.map((p, k) => (k === peg ? to : p)); steps.push({ peg, over, from, to, state: s }); }
  return steps;
}

// Four jumps that slide the whole triple by (2, 0), and four that slide it by (0, 2). Undoing a jump is the same jump again,
// so the reversed lists slide it back; a landing point never meets another peg (it has its mover's parity class), so every
// jump is always legal. Hence peg X reaches every point X0 + 2(m, n): exactly the points of its own parity class.
export const PEGS_SHIFTS = { x: [[0, 1], [1, 0], [2, 0], [2, 1]], y: [[0, 2], [1, 0], [2, 0], [1, 2]] };

// The points a peg occupies after at most k jumps (start included), breadth-first.
export function pegsWithin(k) {
  const key = (s) => s.map((p) => p.join(",")).join(";"), seen = new Set([key(PEGS_START)]), pts = new Set(PEGS_START.map((p) => p.join(",")));
  let frontier = [PEGS_START];
  for (let d = 0; d < k; d++) {
    const next = [];
    for (const s of frontier) for (const { peg, to } of pegJumps(s)) { const t = s.map((p) => [...p]); t[peg] = to; const kk = key(t); if (!seen.has(kk)) { seen.add(kk); next.push(t); pts.add(to.join(",")); } }
    frontier = next;
  }
  return pts;
}
