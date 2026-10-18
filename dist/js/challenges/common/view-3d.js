// The camera and shading of the tiny orthographic 3D renderer shared by the cake and the box (prisms drawn as SVG
// polygons, painter's order, no dependency); each draws its own object in its view-3d.js.
// The cake is the unit cube; the camera turns around the vertical axis through its centre (yaw) and tilts (pitch, 90° is
// the view from straight above, where screen x is world x and screen up is world y, so a 2D editor can sit on top of it).
import { svgEl } from "./kit.js";

export const RAD = Math.PI / 180;

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export const hex = (c) => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };

export const shade = (c, f) => `rgb(${hex(c).map((v) => clamp(Math.round(v * f), 0, 255)).join(",")})`;

export function makeView({ yaw = 0, pitch = 90, scale = 240, cx = 320, cy = 210 } = {}) {
  const psi = yaw * RAD, phi = pitch * RAD, cp = Math.cos(phi), sp = Math.sin(phi), cy_ = Math.cos(psi), sy = Math.sin(psi);
  // world point (unit-cube coordinates, plus an offset) -> [screenX, screenY, depth]; depth grows towards the viewer
  const P = (x, y, z, off = [0, 0, 0]) => {
    const px = x - 0.5 + off[0], py = y - 0.5 + off[1], pz = z - 0.5 + off[2];
    const x1 = px * cy_ + py * sy, y1 = -px * sy + py * cy_;
    return [cx + scale * x1, cy - scale * (pz * cp + y1 * sp), -y1 * cp + pz * sp];
  };
  const facing = (n) => { const y1 = -n[0] * sy + n[1] * cy_; return -y1 * cp + n[2] * sp; };   // > 0 when the face looks at the viewer
  return { yaw, pitch, scale, cx, cy, P, facing };
}

// Deterministic confetti: a pure function of the time since the burst, so frames can be scrubbed.
export function confetti(parent, t, { x = 320, y = 120, count = 46, seed = 5, spread = 190, ground = 400 } = {}) {
  if (t <= 0 || t > 3.2) return;
  const g = svgEl("g", { "pointer-events": "none" }, parent);
  let s = seed * 9301 + 49297;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const cols = ["#f5b700", "#e63946", "#2a9d8f", "#457b9d", "#c77dff", "#ff7f51"];
  for (let i = 0; i < count; i++) {
    const a = -Math.PI / 2 + (rnd() - 0.5) * 2.4, v = 120 + rnd() * spread, spin = rnd() * 720 - 360, w = 5 + rnd() * 5, col = cols[i % cols.length];
    const px = x + Math.cos(a) * v * t * 1.1, py = Math.min(ground, y + Math.sin(a) * v * t + 330 * t * t * 0.5), fade = clamp(1 - (t - 2.2) / 1.0, 0, 1);
    svgEl("rect", { x: -w / 2, y: -w / 3, width: w, height: w * 0.66, fill: col, opacity: fade, transform: `translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${(spin * t).toFixed(0)})` }, g);
  }
}
