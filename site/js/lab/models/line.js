// Pure maths of the line experiment: the line through A(ax ; ay) and B(bx ; by), its direction vector AB, its slope m, its
// reduced equation y = mx + p and a Cartesian equation with integer coefficients. The points sit on a grid of 0,5, so every
// quotient is a ratio of multiples of 1/4 and can be written exactly as a fraction. No DOM.
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const clean = (x) => (Object.is(x, -0) || Math.abs(x) < 1e-12 ? 0 : x);

// p / q in lowest terms, p and q being multiples of 1/4 (q != 0): { num, den } with den > 0
export function fraction(p, q) {
  let a = Math.round(p * 4), b = Math.round(q * 4);
  const g = gcd(a, b) || 1;
  a /= g; b /= g;
  if (b < 0) { a = -a; b = -b; }
  return { num: clean(a), den: b };
}

export function model(s) {
  const { ax, ay, bx, by } = s;
  const dx = clean(bx - ax), dy = clean(by - ay);
  const degenerate = dx === 0 && dy === 0, vertical = dx === 0 && dy !== 0;
  const m = degenerate || vertical ? null : dy / dx;
  const p = m === null ? null : ay - m * ax;
  // a x + b y + c = 0 through A and B, scaled to integers without a common factor, first coefficient positive
  let cartesian = null;
  if (!degenerate) {
    let A = Math.round(4 * dy), B = Math.round(-4 * dx), C = Math.round(4 * (dx * ay - dy * ax));
    const g = gcd(gcd(A, B), C) || 1;
    A /= g; B /= g; C /= g;
    if (A < 0 || (A === 0 && B < 0)) { A = -A; B = -B; C = -C; }
    cartesian = [clean(A), clean(B), clean(C)];
  }
  return {
    A: [ax, ay], B: [bx, by], u: [dx, dy], dx, dy, degenerate, vertical, m, p, cartesian,
    slope: m === null ? null : fraction(dy, dx),
    intercept: m === null ? null : fraction(dx * ay - dy * ax, dx),
    increasing: m !== null && m > 0, decreasing: m !== null && m < 0,
  };
}

export const quantities = {
  slope: (s) => model(s).m,
  intercept: (s) => model(s).p,
  dx: (s) => model(s).dx,
  dy: (s) => model(s).dy,
};
export const quantity = (name, s) => quantities[name](s);
