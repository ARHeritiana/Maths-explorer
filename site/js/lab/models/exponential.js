// Pure maths of the exponential experiment: f(x) = k a^x with k > 0 and a > 0, and the sequence u_n = f(n) it carries, which is
// geometric with first term k and ratio a. No DOM.
export const value = (s, x) => s.k * s.a ** x;
// u_0 .. u_{count-1} by repeated multiplication (exact for the dyadic k and a of the handles)
export function terms(s, count) {
  const out = [];
  let u = s.k;
  for (let i = 0; i < count; i++) { out.push(u); u *= s.a; }
  return out;
}
export function model(s) {
  return {
    k: s.k, a: s.a, f: (x) => value(s, x),
    direction: s.a > 1 ? "up" : s.a < 1 ? "down" : "flat",
    terms: terms(s, 6),
  };
}
export const quantities = {
  u4: (s) => terms(s, 5)[4],
  u5: (s) => terms(s, 6)[5],
  ratio: (s) => s.a,
  initial: (s) => s.k,
};
export const quantity = (name, s) => quantities[name](s);
