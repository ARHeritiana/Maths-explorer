// Pure layout of the hiker challenge: the mountain, its zigzag trail and the signposts, in a 520 x 300 scene.
// Used by the activity and the solution so that both show the same mountain.
export const W = 520, H = 300;
export const TRAIL = [[78, 262], [214, 244], [138, 214], [246, 190], [184, 158], [272, 132], [236, 104], [300, 74]];
const LEN = TRAIL.slice(1).map((p, i) => Math.hypot(p[0] - TRAIL[i][0], p[1] - TRAIL[i][1]));
export const TRAIL_LENGTH = LEN.reduce((a, b) => a + b, 0);

// The point at fraction s of the trail (0 foot, 1 summit) and the sign of dx of its segment (1 right, -1 left).
export function trailAt(s) {
  let d = Math.min(1, Math.max(0, s)) * TRAIL_LENGTH;
  for (let i = 0; i < LEN.length; i++) {
    if (d <= LEN[i] || i === LEN.length - 1) { const k = Math.min(1, d / LEN[i]), [a, b] = [TRAIL[i], TRAIL[i + 1]]; return { x: a[0] + (b[0] - a[0]) * k, y: a[1] + (b[1] - a[1]) * k, dx: Math.sign(b[0] - a[0]) }; }
    d -= LEN[i];
  }
}

// Facing of a walker at s going up (dir 1) or down (dir -1).
export const facingAt = (s, dir) => trailAt(s).dx * dir || 1;

// Signposts at the bends of the trail (fractions of its length).
export const POSTS = LEN.slice(0, -1).map((_, i) => LEN.slice(0, i + 1).reduce((a, b) => a + b, 0) / TRAIL_LENGTH);

// Sun position for a number of minutes after 08:00 (rises on the left, sets on the right at about 20:00).
export const sunAt = (min) => { const k = Math.min(1, Math.max(0, min / 720)), a = Math.PI * (0.92 - 0.84 * k); return { x: 260 + 230 * Math.cos(a), y: 150 - 120 * Math.sin(a) }; };
