// Pure maths of the matrix experiment: M = (a b ; c d) acts on the plane. Its first column (a ; c) is the image of i = (1 ; 0)
// and its second column (b ; d) the image of j = (0 ; 1). The unit square becomes the parallelogram on those two columns,
// whose signed area is det M = ad - bc, the factor by which M multiplies every area. No DOM.
const clean = (x) => (Object.is(x, -0) || Math.abs(x) < 1e-12 ? 0 : x);

export function model(s) {
  const { a, b, c, d } = s;
  const det = clean(a * d - b * c);
  return {
    a, b, c, d, det, area: Math.abs(det),
    orientation: det > 0 ? 1 : det < 0 ? -1 : 0,
    invertible: det !== 0,
    i: [a, c], j: [b, d],
    polygon: [[0, 0], [a, c], [a + b, c + d], [b, d]],
    // M^-1 = 1/det (d -b ; -c a): its columns are the images of i and j by the inverse
    inverse: det === 0 ? null : { i: [clean(d / det), clean(-c / det)], j: [clean(-b / det), clean(a / det)] },
    f: ([x, y]) => [a * x + b * y, c * x + d * y],
  };
}
export const quantities = {
  det: (s) => model(s).det,
  area: (s) => model(s).area,
};
export const quantity = (name, s) => quantities[name](s);
