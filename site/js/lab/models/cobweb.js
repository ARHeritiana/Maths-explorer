// Pure maths of the cobweb experiment: the recurrence u_{n+1} = f(u_n) with f(x) = a x + b, its terms, its fixed point
// (f(l) = l, so l = b / (1 - a) when a != 1) and the staircase between the graph of f and the line y = x. No DOM.
export const f = (s, x) => s.a * x + s.b;
export function terms(s, count) {
  const out = [s.u0];
  for (let i = 1; i < count; i++) out.push(f(s, out[i - 1]));
  return out;
}
// null when a = 1 (u_{n+1} = u_n + b has no fixed point if b != 0, and every point is fixed if b = 0)
export const fixedPoint = (s) => (s.a === 1 ? null : s.b / (1 - s.a));
export function model(s) {
  const list = terms(s, s.n + 1), fixed = fixedPoint(s);
  // the staircase: (u0 ; 0), then up to the graph, across to the line y = x, up again ...
  const path = [[list[0], 0]];
  for (let i = 0; i < s.n; i++) path.push([list[i], list[i + 1]], [list[i + 1], list[i + 1]]);
  return {
    ...s, f: (x) => f(s, x), terms: list, last: list[s.n], fixed, path,
    gap: fixed === null ? null : Math.abs(list[s.n] - fixed),
    contracting: Math.abs(s.a) < 1,
  };
}
export const quantities = {
  fixed: (s) => fixedPoint(s),
  term: (s) => model(s).last,
  gap: (s) => model(s).gap,
};
export const quantity = (name, s) => quantities[name](s);
