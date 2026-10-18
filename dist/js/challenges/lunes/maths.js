// Pure mathematics of the lunes challenge (no DOM), checked by an independent method in tests/.

/* ------------------------------------------------- B: Hippocrates' lunes */
// Right angle at C = (0, 0), A = (a, 0), B = (0, b). Semicircles on the legs are drawn away from the triangle; the
// big circle has the hypotenuse AB as diameter (it passes through C). A lune is a point of a leg semi-disc outside
// the big circle. Area by counting grid cells, independently of the theorem (area of both lunes = area of ABC).
export function luneArea(a, b, N = 1400) {
  const cx = a / 2, cy = b / 2, R2 = (a * a + b * b) / 4, x0 = -b / 2, x1 = a, y0 = -a / 2, y1 = b, dx = (x1 - x0) / N, dy = (y1 - y0) / N;
  let hits = 0;
  for (let i = 0; i < N; i++) {
    const x = x0 + (i + 0.5) * dx;
    for (let j = 0; j < N; j++) {
      const y = y0 + (j + 0.5) * dy;
      const inLegA = y < 0 && (x - a / 2) ** 2 + y * y <= (a / 2) ** 2, inLegB = x < 0 && x * x + (y - b / 2) ** 2 <= (b / 2) ** 2;
      if ((inLegA || inLegB) && (x - cx) ** 2 + (y - cy) ** 2 > R2) hits++;
    }
  }
  return hits * dx * dy;
}

export const luneTotal = (a, b) => (a * b) / 2;
