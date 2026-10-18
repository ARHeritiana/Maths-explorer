// Pure mathematics of the snail challenge (no DOM), checked by an independent method in tests/.

/* ----------------------------------------------------------------- snail */
// Day on which a snail that climbs `up` metres each day and slips `down` metres each night first reaches height h.
export const snailDown = (up, down) => Math.min(Math.max(1, down), up - 1);

export const snailDays = (h, up, down) => { const d = snailDown(up, down); return h <= up ? 1 : Math.ceil((h - up) / (up - d)) + 1; };

export function snailTrace(h, up, down) {
  const d = snailDown(up, down), out = []; let y = 0, day = 0;
  while (day < 1000) { day++; y += up; out.push({ day, peak: Math.min(y, h), end: y >= h ? Math.min(y, h) : y - d, done: y >= h }); if (y >= h) break; y -= d; }
  return out;
}
