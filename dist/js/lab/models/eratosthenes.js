// Pure maths of the Eratosthenes experiment (issue #32): the Earth is a circle (a section of a sphere through the two
// towns), the Sun's rays are parallel. Syène S is at the top of the circle, Alexandria A at a central angle phi (degrees)
// from it; the rays come from a direction at sigma degrees from the vertical at S (both angles counted towards A).
// The angle between a vertical stick and the rays is |sigma − angle of the town|, so the difference of the two shadow
// angles is the central angle, and the circumference is C = 360 × s / theta. The state holds the distance s as k, in
// thousands (k = 5 for 5,000 stadia). No DOM, no randomness.

export const RAD = Math.PI / 180;
// Position of a town at angle a (degrees from the top, towards the left) on the unit circle, and its "up" direction.
export const town = (a) => [-Math.sin(a * RAD), Math.cos(a * RAD)];
// Angle between the vertical stick of a town at angle a and the Sun's direction sigma (degrees, at least 0).
export const shadowAngle = (a, sigma) => Math.abs(sigma - a);
// The central angle seen from the shadows: the difference of the two shadow angles when the Sun is on the same side of
// both verticals (sigma ≤ 0 or sigma ≥ phi), the sum otherwise; equal to phi in every case.
export const angleFromShadows = (phi, sigma) => { const zS = shadowAngle(0, sigma), zA = shadowAngle(phi, sigma); return sigma > 0 && sigma < phi ? zS + zA : Math.abs(zA - zS); };
export const circumference = (s, theta) => (360 * s) / theta;
export const radius = (s, theta) => s / (theta * RAD);
// Tip of the shadow of a stick of length L planted at the town at angle a: along the ground, away from the Sun.
export function shadowTip(a, sigma, L) {
  const p = town(a), z = (sigma - a) * RAD, len = Math.min(1, L * Math.tan(Math.abs(z))), t = [-Math.cos(a * RAD), -Math.sin(a * RAD)], side = sigma > a ? -1 : 1;
  return [p[0] + side * t[0] * len, p[1] + side * t[1] * len];
}

export function model(s) {
  const zS = shadowAngle(0, s.sigma), zA = shadowAngle(s.phi, s.sigma), theta = angleFromShadows(s.phi, s.sigma);
  return { zS, zA, theta, C: circumference(s.k * 1000, theta), R: radius(s.k * 1000, theta), S: town(0), A: town(s.phi) };
}
export const quantities = {
  shadowA: (s) => shadowAngle(s.phi, s.sigma),
  theta: (s) => angleFromShadows(s.phi, s.sigma),
  circumference: (s) => circumference(s.k * 1000, angleFromShadows(s.phi, s.sigma)),
  radius: (s) => radius(s.k * 1000, angleFromShadows(s.phi, s.sigma)),
};
export const quantity = (name, s) => quantities[name](s);
