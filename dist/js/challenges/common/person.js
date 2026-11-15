// Shared cartoon person for the challenges (handshakes, hiker, ...): built once with makePerson, posed every frame
// with posePerson. Every pose is a pure function of its arguments, so an animated solution stays pure.
// Speech bubbles are in bubble.js.
import { svgEl } from "./kit.js";

// Material colours are the person's own (skin, hair, trousers, shoes), not the theme's; outlines follow var(--ink).
export const SKINS = ["#f2c9a0", "#e0ac7e", "#c68b59", "#8d5a3b", "#f6d7bd", "#b97a50"];
export const HAIRS = ["#3b2a20", "#7a4a24", "#d9a441", "#1d1d1d", "#a0522d", "#5a5a5a"];
const TROUSERS = "#3d4b6b", SHOES = "#3b2a20", INK = "var(--ink)";

// One person, about 66 units tall, feet at (0, 0), facing +x. `look` picks the outfit: skin, hair, accessory.
// gear: "hiker" adds a backpack and a sun hat (and drops the look's accessory).
export function makePerson(parent, { fill, look = 0, size = 1, gear = null }) {
  const skin = SKINS[look % SKINS.length], hair = HAIRS[(look * 5 + 1) % HAIRS.length], extra = gear ? 0 : look % 4;   // 0 none, 1 cap, 2 glasses, 3 bow
  const g = (p, attrs = {}) => svgEl("g", attrs, p);
  const root = g(parent);
  const shadow = svgEl("ellipse", { cx: 0, cy: 0, rx: 14, ry: 3.4, fill: INK, opacity: 0.16 }, root);
  const fig = g(root), flip = g(fig);
  // a limb: two segments, each a <g> turning about its joint, drawn as an outlined capsule
  const limb = (p, x, y, len, colour, width, endPart) => {
    const upper = g(p), lower = g(upper);
    const seg = (q, x0) => { svgEl("line", { x1: x0, y1: y, x2: x0 + len, y2: y, stroke: INK, "stroke-width": width + 2, "stroke-linecap": "round" }, q); svgEl("line", { x1: x0, y1: y, x2: x0 + len, y2: y, stroke: colour, "stroke-width": width, "stroke-linecap": "round" }, q); };
    seg(upper, x); seg(lower, x + len); endPart(lower, x + 2 * len, y);
    return { upper, lower, x, y, len };
  };
  const hand = (q, x, y) => svgEl("circle", { cx: x, cy: y, r: 2.7, fill: skin, stroke: INK, "stroke-width": 1 }, q);
  // the shin points down when posed, so the shoe is long along the local -y axis (world forward)
  const shoe = (q, x, y) => svgEl("ellipse", { cx: x + 1.2, cy: y - 1.6, rx: 2.3, ry: 3.6, fill: SHOES, stroke: INK, "stroke-width": 1 }, q);
  const shade = `color-mix(in srgb, ${fill} 75%, #000)`;
  const backArm = limb(flip, -3, -41, 9, shade, 4.4, hand);
  const backLeg = limb(flip, -2, -21, 10, `color-mix(in srgb, ${TROUSERS} 80%, #000)`, 5, shoe);
  const frontLeg = limb(flip, 2, -21, 10, TROUSERS, 5, shoe);
  const body = g(flip);   // torso and head breathe together
  if (gear === "hiker") {   // backpack behind the torso, with a rolled mat on top
    svgEl("rect", { x: -15, y: -43, width: 9, height: 20, rx: 3, fill: "#7a5230", stroke: INK, "stroke-width": 1.3 }, body);
    svgEl("rect", { x: -14, y: -35, width: 7, height: 6, rx: 1.5, fill: "#5e3d22", stroke: INK, "stroke-width": 0.8 }, body);
    svgEl("rect", { x: -16.5, y: -47, width: 12, height: 4.6, rx: 2.3, fill: "#c0392b", stroke: INK, "stroke-width": 1 }, body);
  }
  svgEl("path", { d: "M-9 -19 Q-10.5 -37 -6.5 -43 Q0 -46.5 6.5 -43 Q10.5 -37 9 -19 Z", fill, stroke: INK, "stroke-width": 1.4, "stroke-linejoin": "round" }, body);
  svgEl("path", { d: "M-9 -19 Q-10.5 -37 -6.5 -43 Q-4 -44.6 -2 -45 Q-5 -33 -3 -19 Z", fill: shade, opacity: 0.55 }, body);   // shade on the back
  svgEl("path", { d: "M-3 -44.5 L0.5 -40.5 L4 -44.5", fill: "none", stroke: INK, "stroke-width": 1, "stroke-linejoin": "round" }, body);   // collar
  svgEl("rect", { x: -9.2, y: -22, width: 18.4, height: 3.2, rx: 1.2, fill: "#5b3a29", stroke: INK, "stroke-width": 0.8 }, body);   // belt
  svgEl("rect", { x: -2.2, y: -49, width: 5, height: 6, fill: skin, stroke: INK, "stroke-width": 1 }, body);   // neck
  const head = g(body);
  svgEl("circle", { cx: 1, cy: -56, r: 9.6, fill: skin, stroke: INK, "stroke-width": 1.4 }, head);
  svgEl("path", { d: "M-8.6 -55 Q-10 -67 1.5 -66.4 Q11.2 -66 10.8 -57.5 Q7 -62.5 2.5 -60.6 Q-1.5 -62.4 -3.6 -58 Q-6 -55.6 -8.6 -55 Z", fill: hair, stroke: INK, "stroke-width": 1.2, "stroke-linejoin": "round" }, head);
  svgEl("ellipse", { cx: -3.4, cy: -54.5, rx: 2, ry: 2.8, fill: skin, stroke: INK, "stroke-width": 1 }, head);   // ear
  svgEl("circle", { cx: 6.8, cy: -51.8, r: 1.9, fill: "#ff7b7b", opacity: 0.4 }, head);   // cheek
  svgEl("path", { d: "M9.6 -55 q2.4 1.6 0.2 3", fill: "none", stroke: INK, "stroke-width": 1, "stroke-linecap": "round" }, head);   // nose
  const eye = (cx, rx) => {
    const e = g(head);
    svgEl("ellipse", { cx, cy: -57, rx, ry: 2.9, fill: "#fff", stroke: INK, "stroke-width": 0.8 }, e);
    const pupil = svgEl("circle", { cx, cy: -57, r: 1.35, fill: "#1d1d1d" }, e);
    return { e, pupil, cx };
  };
  const eyes = [eye(1.6, 1.9), eye(6.2, 2.4)];
  const brows = svgEl("path", { fill: "none", stroke: INK, "stroke-width": 1.1, "stroke-linecap": "round" }, head);
  const mouth = svgEl("path", { stroke: INK, "stroke-width": 1, "stroke-linecap": "round", "stroke-linejoin": "round" }, head);
  if (gear === "hiker") svgEl("path", { d: "M-12 -61.5 Q-11 -60 1 -60.4 Q13 -60 14.5 -61.5 Q12 -63.5 9 -63.4 Q8.5 -70.5 1 -70.6 Q-6.5 -70.5 -7 -63.4 Q-10 -63.5 -12 -61.5 Z", fill: "#d4b26a", stroke: INK, "stroke-width": 1.2, "stroke-linejoin": "round" }, head);
  if (gear === "hiker") svgEl("path", { d: "M-6.8 -64 Q1 -65.6 8.8 -64", fill: "none", stroke: "#8b2c1f", "stroke-width": 1.6 }, head);
  if (extra === 1) svgEl("path", { d: "M-8.8 -60 Q-8 -69 2 -68.5 Q10.5 -68 10.5 -61 L16 -60.4 Q15 -58.6 10 -59.2 Z", fill: `color-mix(in srgb, ${fill} 60%, #fff)`, stroke: INK, "stroke-width": 1.1, "stroke-linejoin": "round" }, head);
  if (extra === 2) svgEl("path", { d: "M-0.6 -57 a2.5 2.5 0 1 0 5 0 a2.5 2.5 0 1 0 -5 0 M4.4 -57 h0.8 M5.2 -57 a2.8 2.8 0 1 0 5.6 0 a2.8 2.8 0 1 0 -5.6 0", fill: "none", stroke: INK, "stroke-width": 1 }, head);
  if (extra === 3) svgEl("path", { d: "M-6 -64 l-3.5 -3 v6 Z M-6 -64 l3.5 -3 v6 Z", fill: "#e2557a", stroke: INK, "stroke-width": 0.9, "stroke-linejoin": "round" }, head);
  const frontArm = limb(flip, 3, -41, 9, fill, 4.6, hand);
  return { root, shadow, fig, flip, body, head, eyes, brows, mouth, backArm, frontArm, backLeg, frontLeg, size };
}

const turn = (part, deg, x, y) => part.setAttribute("transform", `rotate(${deg.toFixed(1)} ${x} ${y})`);
const lerp = (a, b, k) => a + (b - a) * k;
const MOUTHS = {
  smile: ["M3.2 -51.2 q2.6 2.2 5.2 0", "none"],
  grin: ["M2.8 -51.6 q3 4.6 6 0 Z", "#7a2e2e"],
  o: ["M5.6 -51.6 a1.5 1.9 0 1 0 0.01 0 Z", "#7a2e2e"],
  flat: ["M3.4 -50.6 h4.6", "none"],
};

// Pose a person. All arguments are plain numbers, so a frame depends only on them:
//   x, y: feet; facing: 1 right, -1 left; gaze: [dx, dy] in -1..1 (where the pupils look, in screen directions);
//   walk: { phase, amp } (phase from distance walked, amp 0..1); reach: 0..1 front arm out to `reachAngle` (degrees,
//   0 = straight ahead, negative = up); wave: 0..1; hop: 0..1; breathe: phase in radians; blink: 0..1; mood: smile, grin, o, flat.
export function posePerson(P, { x, y, facing = 1, gaze = [0, 0], walk = { phase: 0, amp: 0 }, reach = 0, reachAngle = 0, wave = 0, hop = 0, breathe = 0, blink = 0, mood = "smile" }) {
  const lift = 5 * Math.sin(Math.PI * Math.min(1, Math.max(0, hop)));
  P.root.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${P.size})`);
  P.shadow.setAttribute("rx", (14 - lift * 1.2).toFixed(1));
  P.fig.setAttribute("transform", `translate(0 ${(-lift).toFixed(2)})`);
  P.flip.setAttribute("transform", facing < 0 ? "scale(-1 1)" : "");
  P.body.setAttribute("transform", `translate(0 ${(0.6 * Math.sin(breathe)).toFixed(2)})`);
  // legs swing in opposite phase with a knee bend on the way forward; arms counter-swing
  const s = Math.sin(walk.phase) * walk.amp;
  const leg = (L, sign) => { turn(L.upper, 90 + 24 * s * sign, L.x, L.y); turn(L.lower, Math.max(0, 30 * Math.sin(walk.phase + (sign > 0 ? 0 : Math.PI))) * walk.amp, L.x + L.len, L.y); };
  leg(P.frontLeg, 1); leg(P.backLeg, -1);
  turn(P.backArm.upper, 88 + 20 * s, P.backArm.x, P.backArm.y); turn(P.backArm.lower, -14, P.backArm.x + P.backArm.len, P.backArm.y);
  // front arm: hanging (88 deg), swinging, reaching out, or waving above the head
  const hang = 88 - 20 * s, out = reachAngle, up = -70 + 18 * Math.sin(wave * Math.PI * 6);
  const shoulder = wave > 0 ? lerp(hang, up, Math.min(1, wave * 4)) : lerp(hang, out, reach);
  turn(P.frontArm.upper, shoulder, P.frontArm.x, P.frontArm.y);
  turn(P.frontArm.lower, wave > 0 ? -40 : lerp(-16, 0, reach), P.frontArm.x + P.frontArm.len, P.frontArm.y);
  // eyes: pupils follow the gaze (mirrored with the body), lids close with blink
  const gx = Math.max(-1, Math.min(1, gaze[0])) * facing, gy = Math.max(-1, Math.min(1, gaze[1]));
  for (const E of P.eyes) {
    E.pupil.setAttribute("cx", (E.cx + 0.9 * gx).toFixed(2)); E.pupil.setAttribute("cy", (-57 + 1.1 * gy).toFixed(2));
    E.e.setAttribute("transform", `translate(0 -57) scale(1 ${(1 - 0.92 * Math.min(1, blink)).toFixed(2)}) translate(0 57)`);
  }
  const raised = mood === "o" || mood === "grin" ? -1.4 : 0;
  P.brows.setAttribute("d", `M0 ${-61.2 + raised} q1.6 -1 3.2 0 M5 ${-61.6 + raised} q1.8 -1.1 3.6 0`);
  const [d, f] = MOUTHS[mood] || MOUTHS.smile;
  P.mouth.setAttribute("d", d); P.mouth.setAttribute("fill", f);
}
