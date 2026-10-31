// The one orthographic 3D camera of the site: z up, a yaw (turn about the vertical) and a pitch (tilt, clamped), pure functions.
// Used by the laboratory template `space` (js/lab/templates/space.js) and by the slide widgets in slides/widgets-3d.js, so both
// project, unproject and turn the same way. The camera belongs to the view, never to the mathematical state.
//
//   cam3Project(yaw, pitch, x, y, z)       -> { u, v, d }  screen u (right), v (up), depth d (larger = farther from the viewer)
//   cam3Unproject(yaw, pitch, u, v, z)     -> { x, y }     the point of the horizontal plane z that projects on (u, v)
//   cam3Dir(yaw, pitch)                    -> [x, y, z]    unit vector along the view ray, pointing away from the viewer
//   cam3Ray(yaw, pitch, u, v)              -> { p, w }     the view ray through screen (u, v): p + t w
//   cam3HitPlane(ray, o, n)                -> point | null where the ray meets the plane through o with normal n
//   cam3HitLine(ray, o, e)                 -> { s, point } | null the point o + s e of a line nearest to the ray
//   cam3Turn(cam, dYaw, dPitch)            turns a { yaw, pitch } camera in place; the pitch stays in [PITCH_MIN, PITCH_MAX]
//   cam3TurnFree(cam, dYaw, dPitch)        the same without a floor: the yaw is free and the pitch runs from straight below to
//                                          straight above (±FREE_PITCH), so an object can be seen from every direction
export const PITCH_MIN = 0.12, PITCH_MAX = 1.45;
export const CAM3_DEFAULT = { yaw: -0.7, pitch: 0.55 };

export function cam3Project(yaw, pitch, x, y, z) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), x1 = cy * x - sy * y, y1 = sy * x + cy * y;
  return { u: x1, v: z * cp + y1 * sp, d: y1 * cp - z * sp };
}
export function cam3Unproject(yaw, pitch, u, v, z) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), y1 = (v - z * cp) / sp;
  return { x: cy * u + sy * y1, y: -sy * u + cy * y1 };
}
export function cam3Dir(yaw, pitch) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  return [sy * cp, cy * cp, -sp];
}
export function cam3Ray(yaw, pitch, u, v) {
  const p = cam3Unproject(yaw, pitch, u, v, 0);
  return { p: [p.x, p.y, 0], w: cam3Dir(yaw, pitch) };
}
const v3dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const v3sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export function cam3HitPlane(ray, o, n) {
  const k = v3dot(n, ray.w);
  if (Math.abs(k) < 1e-9) return null;
  const t = v3dot(n, v3sub(o, ray.p)) / k;
  return [ray.p[0] + t * ray.w[0], ray.p[1] + t * ray.w[1], ray.p[2] + t * ray.w[2]];
}
export function cam3HitLine(ray, o, e) {
  const a = v3dot(e, e), b = v3dot(e, ray.w), r0 = v3sub(o, ray.p), den = a - b * b;
  if (a < 1e-12 || Math.abs(den) < 1e-9 * a) return null;
  const s = (b * v3dot(ray.w, r0) - v3dot(e, r0)) / den;
  return { s, point: [o[0] + s * e[0], o[1] + s * e[1], o[2] + s * e[2]] };
}
export function cam3Turn(cam, dYaw, dPitch) {
  cam.yaw += dYaw;
  cam.pitch = Math.min(PITCH_MAX, Math.max(PITCH_MIN, cam.pitch + dPitch));
  return cam;
}
export const FREE_PITCH = Math.PI / 2 - 0.02;
export function cam3TurnFree(cam, dYaw, dPitch) {
  cam.yaw += dYaw;
  cam.pitch = Math.min(FREE_PITCH, Math.max(-FREE_PITCH, cam.pitch + dPitch));
  return cam;
}
