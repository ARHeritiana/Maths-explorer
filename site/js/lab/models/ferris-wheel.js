// Pure maths of the idealised observation wheel: a marked point on the rim of a circle of radius 60 whose lowest point is 15
// above the reference level, turning uniformly once in 30 minutes from the lowest point. No DOM, no randomness.
// Time t is in minutes, heights in metres. h(t) = 75 - 60 cos(pi t / 15).
export const RADIUS = 60, CENTRE = 75, PERIOD = 30, TOP = 135, BOTTOM = 15, LEVEL = 120, T_MAX = 30;
export const A = -RADIUS, B = Math.PI / 15, D = CENTRE;

export const angle = (t) => (2 * Math.PI * t) / PERIOD;                 // turned angle, radians, from the lowest point
export const height = (t) => D + A * Math.cos(B * t);
export const rate = (t) => -A * B * Math.sin(B * t);                  // h'(t) = 4 pi sin(pi t / 15), m per minute
export const MAX_RATE = RADIUS * B;                                  // 4 pi, reached at t = 7.5 and (with a minus sign) at 22.5

// The seat on the wheel, clockwise as seen from the front: at t = 7.5 it is level with the hub, on the left.
export const seat = (t) => ({ x: -RADIUS * Math.sin(angle(t)), y: CENTRE - RADIUS * Math.cos(angle(t)) });
// Inverse of `seat`: the time in [0, 30) of the point of the wheel under the pointer (x, y), measured from the hub.
export const timeAt = (x, y) => {
  const a = Math.atan2(-x, CENTRE - y), turn = a < 0 ? a + 2 * Math.PI : a;
  return (turn * PERIOD) / (2 * Math.PI);
};

// First time the height reaches `level` (TOP >= level > BOTTOM), and the return crossing by symmetry about t = 15.
export const firstCrossing = (level = LEVEL) => (15 / Math.PI) * Math.acos((CENTRE - level) / RADIUS);
export const secondCrossing = (level = LEVEL) => PERIOD - firstCrossing(level);
// Duration, within one revolution, for which the height is at least `level`.
export const timeAtOrAbove = (level = LEVEL) => (level > TOP ? 0 : level <= BOTTOM ? PERIOD : secondCrossing(level) - firstCrossing(level));

// Where the height stands against the level: 1 above, 0 at, -1 below (a tolerance only for float noise).
export const sideOf = (h, level = LEVEL) => (Math.abs(h - level) < 1e-9 ? 0 : h > level ? 1 : -1);

export function model(s) {
  const t = s.t, h = height(t);
  return { t, h, rate: rate(t), seat: seat(t), side: sideOf(h), t1: firstCrossing(), t2: secondCrossing(), above: timeAtOrAbove() };
}
export const quantities = {
  height: (s) => height(s.t),
  rate: (s) => rate(s.t),
  maxRate: () => MAX_RATE,
  first: () => firstCrossing(),
  second: () => secondCrossing(),
  above: () => timeAtOrAbove(),
};
export const quantity = (name, s) => quantities[name](s);
