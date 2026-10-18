// Pure mathematics of the bridge challenge (no DOM), checked by an independent method in tests/.

/* ---------------------------------------------------------------- bridge */
// Four people with crossing times a ≤ b ≤ c ≤ d, one torch, at most two at a time. Two classical plans:
//   A: a+b go, a returns, c+d go, b returns, a+b go            → a + 3b + d
//   B: a+d go, a returns, a+c go, a returns, a+b go            → 2a + b + c + d
export function bridgePlans(times) {
  const [a, b, c, d] = [...times].sort((x, y) => x - y);
  return {
    A: { total: a + 3 * b + d, moves: [[[a, b], "over", b], [[a], "back", a], [[c, d], "over", d], [[b], "back", b], [[a, b], "over", b]] },
    B: { total: 2 * a + b + c + d, moves: [[[a, d], "over", d], [[a], "back", a], [[a, c], "over", c], [[a], "back", a], [[a, b], "over", b]] },
  };
}

export const bridgeBest = (times) => { const p = bridgePlans(times); return Math.min(p.A.total, p.B.total); };

export const bridgeBestPlan = (times) => { const p = bridgePlans(times); return p.A.total <= p.B.total ? "A" : "B"; };

export const BRIDGE_SETS = ["1,2,5,10", "1,3,6,8", "1,2,7,8", "1,4,5,6", "2,3,8,9", "3,4,5,6"];

export const bridgeTimes = (id) => String(id).split(",").map(Number);
