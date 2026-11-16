// Colliding blocks that count digits of pi (Galperin, 2003). Pure maths, no DOM.
// A block of mass m rests between a wall and a block of mass M that arrives at speed 1. Every collision is elastic and
// frictionless. The count never depends on positions, only on the order of the velocities: a block collision happens exactly when
// the left block is faster to the right than the right block (vA > vB), a wall collision exactly when vA < 0. So the count and the
// velocities are computed event by event (no time step, no penetration); positions only date the events for the animation.
// Velocity space: with x = sqrt(m) vA and y = sqrt(M) vB, kinetic energy x^2 + y^2 is conserved, a wall hit is the reflection
// (x, y) -> (-x, y) (mirror: the y axis) and a block hit moves the point along the line of constant momentum x + sqrt(M) y, which is
// the reflection across the line of direction (1, sqrt(M)). The angle between the two mirrors is theta = atan(sqrt(m / M)); two
// reflections turn the point by 2 theta, and the point leaves the collision zone after about pi / theta turns of theta, so the count
// is ceil(pi / theta) - 1.
export const MAX_EVENTS = 20000;

// start: { ratio (M/m >= 1), gap (distance between the blocks), xA, speed }
export function simulate({ratio = 100, xA = 2, xB = 7, speed = 1, hA = 0.5, hB = 0.5} = {}) {
  const mA = 1, mB = ratio;
  let vA = 0, vB = -speed, pA = xA, pB = xB, t = 0, block = 0, wall = 0;
  const events = [{t: 0, kind: 'start', xA: pA, xB: pB, vA, vB, block, wall}];
  while (events.length < MAX_EVENTS) {
    let dtBlock = Infinity, dtWall = Infinity;
    if (vA > vB) dtBlock = (pB - hB - pA - hA) / (vA - vB);
    if (vA < 0) dtWall = (pA - hA) / -vA;
    if (dtBlock === Infinity && dtWall === Infinity) break;
    const toWall = dtWall < dtBlock;           // a tie cannot happen for the starts used here
    const dt = Math.max(0, toWall ? dtWall : dtBlock);
    t += dt; pA += vA * dt; pB += vB * dt;
    if (toWall) { vA = -vA; wall++; }
    else {
      const nA = ((mA - mB) * vA + 2 * mB * vB) / (mA + mB), nB = ((mB - mA) * vB + 2 * mA * vA) / (mA + mB);
      vA = nA; vB = nB; block++;
    }
    events.push({t, kind: toWall ? 'wall' : 'block', xA: pA, xB: pB, vA, vB, block, wall});
  }
  return {events, total: block + wall, block, wall, ratio, mA, mB};
}
export const collisionCount = (ratio) => { const r = simulate({ratio}); return r.total; };

// The same count from the angle, as a cross-check: ceil(pi / theta) - 1 with theta = atan(1 / sqrt(ratio)).
export const angleCount = (ratio) => { const theta = Math.atan(1 / Math.sqrt(ratio)); return Math.ceil(Math.PI / theta - 1e-12) - 1; };
export const theta = (ratio) => Math.atan(1 / Math.sqrt(ratio));

// Point of velocity space (energy 1 when the heavy block arrives at speed 1 and ratio is large; normalised here to the circle).
export function velocityPoint(ev, ratio) {
  const x = ev.vA, y = Math.sqrt(ratio) * ev.vB, r = Math.hypot(x, y) || 1;
  return [x / r, y / r];
}
// Kinetic energy and momentum of the pair (momentum is not conserved at the wall).
export const energy = (ev, ratio) => 0.5 * ev.vA * ev.vA + 0.5 * ratio * ev.vB * ev.vB;
export const momentum = (ev, ratio) => ev.vA + ratio * ev.vB;
// State of the blocks at time s (s between events): positions and velocities, from the event list.
export function stateAt(events, s) {
  let lo = 0, hi = events.length - 1;
  if (s >= events[hi].t) { const e = events[hi]; const d = s - e.t; return {i: hi, xA: e.xA + e.vA * d, xB: e.xB + e.vB * d, vA: e.vA, vB: e.vB}; }
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (events[mid].t <= s) lo = mid; else hi = mid; }
  const e = events[lo], d = s - e.t;
  return {i: lo, xA: e.xA + e.vA * d, xB: e.xB + e.vB * d, vA: e.vA, vB: e.vB};
}
