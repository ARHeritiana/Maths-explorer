// Pure mathematics of the josephus challenge (no DOM), checked by an independent method in tests/.

/* --------------------------------------------------------------- helpers */
export const josephusOrder = (n, k = 2) => {
  const ring = Array.from({ length: n }, (_, i) => i + 1), out = [];
  let i = 0;
  while (ring.length > 1) { i = (i + k - 1) % ring.length; out.push(ring.splice(i, 1)[0]); if (i >= ring.length) i = 0; }
  return { out, last: ring[0] };
};
