// Pure layout of the __ID__ challenge: the room, the round table and where each person stands. Used by the activity
// and the solution so that both show the same scene.

// Seats on an ellipse around the table; the first person stands at the back (top), the others clockwise.
export function layout(n, { cx, cy, rx, ry }) {
  const size = n <= 6 ? 1.1 : n <= 10 ? 0.86 : n <= 16 ? 0.74 : n <= 22 ? 0.62 : 0.52;
  const seats = Array.from({ length: n }, (_, k) => { const a = -Math.PI / 2 + (2 * Math.PI * k) / n; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; });
  return { seats, size, table: { cx, cy: cy - 6, rx: rx * 0.45, ry: ry * 0.42 } };
}

// Where a person's hand is, roughly, for the lines that stand for handshakes.
export const handAt = ([x, y], size) => [x, y - 34 * size];

// Facing (1 or -1) and the arm angle in the body frame (degrees, 0 ahead, negative up) to point at (tx, ty).
export function aimAt([x, y], [tx, ty], size) {
  const facing = tx >= x ? 1 : -1, dx = Math.abs(tx - x) || 1e-6, dy = ty - (y - 41 * size);
  return { facing, angle: Math.max(-45, Math.min(60, (Math.atan2(dy, dx) * 180) / Math.PI)) };
}
