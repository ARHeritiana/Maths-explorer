// Pure maths of the experiment `tiles`: a square of side a + b cut into two right trapezoids (parallel sides a and b) and two
// right triangles (legs b and a + b), put back together as a rectangle a × (2a + b); and Curry's triangle (legs 13 and 5) built
// twice from the same four pieces. The pieces are drawn with their true coordinates: the excess a² − ab − b² is the signed
// area of the thin parallelogram along the diagonal (gap when positive, overlap when negative). No DOM.

// Consecutive Fibonacci numbers: the sizes the slider offers (a, b) = (F(k+1), F(k)).
export const PAIRS = [[1, 1], [2, 1], [3, 2], [5, 3], [8, 5], [13, 8]];

// Curry's triangle, right angle at (13 ; 0). Arrangement A fills it except for its slightly bent long side; arrangement B
// swaps the two triangles and leaves a unit hole. Same four pieces, translated only.
export const CURRY = {
  A: {
    red: [[0, 0], [8, 0], [8, 3]],
    blue: [[8, 3], [13, 3], [13, 5]],
    l7: [[8, 0], [13, 0], [13, 1], [10, 1], [10, 2], [8, 2]],
    l8: [[10, 1], [13, 1], [13, 3], [8, 3], [8, 2], [10, 2]],
    hole: null,
  },
  B: {
    blue: [[0, 0], [5, 0], [5, 2]],
    red: [[5, 2], [13, 2], [13, 5]],
    l7: [[5, 0], [10, 0], [10, 1], [7, 1], [7, 2], [5, 2]],
    l8: [[10, 0], [13, 0], [13, 2], [8, 2], [8, 1], [10, 1]],
    hole: [[7, 1], [8, 1], [8, 2], [7, 2]],
  },
};

// Shoelace formula: signed area of a polygon.
export function area(pts) {
  let s = 0;
  for (let i = 0; i < pts.length; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length]; s += x1 * y2 - x2 * y1; }
  return s / 2;
}

// The four pieces in the square (side S = a + b, origin at the bottom left) and in the rectangle (width W = 2a + b, height a).
export function pieces(a, b) {
  const S = a + b, W = a + S;
  const square = {
    I: [[0, 0], [a, 0], [a, b], [0, a]],
    II: [[0, a], [a, b], [a, S], [0, S]],
    III: [[a, 0], [S, 0], [S, S]],
    IV: [[a, 0], [S, S], [a, S]],
  };
  const rect = {
    I: [[0, 0], [a, 0], [a, b], [0, a]],
    III: [[a, 0], [W, 0], [a, b]],
    II: [[W, a], [W - a, a], [W - a, a - b], [W, 0]],
    IV: [[W - a, a], [0, a], [W - a, a - b]],
  };
  // the parallelogram between the two slanted edges of each half of the rectangle
  const sliver = [[0, a], [a, b], [W, 0], [W - a, a - b]];
  return { S, W, square, rect, sliver };
}

export function model(s) {
  const a = s.a, b = s.b, S = a + b, W = 2 * a + b;
  const squareArea = S * S, rectArea = a * W, excess = rectArea - squareArea;
  // directions of the two slanted edges met along the "diagonal" of the rectangle
  const u = [S, b], v = [a, a - b];
  return {
    a, b, S, W, squareArea, rectArea, excess,
    det: u[0] * v[1] - u[1] * v[0],
    slopeTriangle: b / S, slopeTrapezoid: (a - b) / a,
    pieces: pieces(a, b),
    // Curry: the four pieces cover 32 unit squares in both arrangements, the true triangle has area 32,5
    curry: { pieces: Object.entries(CURRY.A).filter(([k, p]) => p && k !== "hole").reduce((t, [, p]) => t + area(p), 0), triangle: (13 * 5) / 2 },
  };
}

export const quantities = {
  excess: (s) => model(s).excess,
  det: (s) => model(s).det,
};
export const quantity = (name, s) => quantities[name](s);
