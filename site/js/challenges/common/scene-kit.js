// Small kit for cartoon scenes inside the animated solutions: easing and the articulated soldier (the night landscape
// and the lantern of the bridge are in bridge/art.js).
// Everything is plain SVG built once; a scene is then posed by calling set() on its parts, so a frame is a pure function
// of the step and its progress (scrubbable, reproducible). Ambient motion (twinkling stars, water, flame) is CSS only
// and is switched off by prefers-reduced-motion (see the "scene kit" block of pages.css).
import { svgEl } from "./kit.js";

export const clamp01 = (x) => Math.min(1, Math.max(0, x));

export const lerp = (a, b, k) => a + (b - a) * k;

export const seg = (p, a, b) => clamp01((p - a) / (b - a));

export const easeInOut = (x) => { const k = clamp01(x); return k * k * (3 - 2 * k); };

export const easeOutBack = (x) => { const k = clamp01(x), c = 1.70158; return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2; };

export const TAU = Math.PI * 2;

export const el = (name, attrs, parent) => svgEl(name, attrs, parent);

/* ------------------------------------------------------------------ a soldier made of separate parts */
export const HATS = [
  // scout: red beret with a pom-pom
  () => `<path d="M-9 -43 Q-1 -57 9.5 -44 Q3 -46 -9 -43Z" fill="#d32f2f"/><circle cx="1" cy="-53" r="1.8" fill="#8f1b1b"/>`,
  // plain helmet with a brim
  () => `<path d="M-9 -41 A9 9 0 0 1 9 -41Z" fill="#6b7a4f"/><rect x="-11" y="-42" width="22" height="3" rx="1.5" fill="#55623e"/>`,
  // peaked cap
  () => `<path d="M-9 -41 A9 9 0 0 1 9 -41Z" fill="#35507a"/><rect x="2" y="-42" width="12" height="3" rx="1.5" fill="#22344f"/><circle cx="0" cy="-47" r="1.8" fill="#f3c84a"/>`,
  // tall fur hat with a plume, for the old sergeant
  () => `<rect x="-7.5" y="-61" width="15" height="19" rx="3" fill="#6d2c2c"/><rect x="-7.5" y="-45" width="15" height="2.6" fill="#f3c84a"/><path d="M0 -61 q-3 -9 4 -10 q1 6 -4 10Z" fill="#f1f1f1"/>`,
];

export function makeSoldier(parent, { uniform, hat = 0, size = 1, skin = "#f1c27d", moustache = false, label = "", top = 66 }) {
  const root = el("g", { class: "sd" }, parent);
  const shadow = el("ellipse", { cx: 0, cy: 0.5, rx: 11 * size, ry: 3.2, fill: "#000", opacity: 0.28 }, root);
  const flip = el("g", {}, root), bob = el("g", {}, flip);
  const dark = "#2b2538";
  const mk = (cls, x, y, body) => { const g = el("g", { class: cls, transform: `translate(${x} ${y})` }, bob); g.innerHTML = body; return g; };
  const legBody = `<rect x="-3" y="0" width="6" height="14" rx="3" fill="${dark}"/><ellipse cx="1.8" cy="15.5" rx="5.2" ry="2.6" fill="#1b1727"/>`;
  const armBody = `<rect x="-2.7" y="-1" width="5.4" height="15" rx="2.7" fill="${uniform}" stroke="#0003" stroke-width=".6"/><circle cy="14.5" r="2.7" fill="${skin}"/>`;
  const legB = mk("sd-leg", -3.5, -16, legBody);
  const armB = mk("sd-arm", -7, -30, armBody);
  const body = el("g", {}, bob);
  body.innerHTML = `<rect x="-8.5" y="-34" width="17" height="20" rx="6" fill="${uniform}" stroke="#0003" stroke-width=".7"/><rect x="-8.5" y="-22" width="17" height="3" fill="#2b2538" opacity=".55"/><circle cx="0" cy="-27" r="1.2" fill="#f3c84a"/><circle cx="0" cy="-17" r="1.2" fill="#f3c84a"/>`;
  const head = el("g", { class: "sd-head" }, bob);
  head.innerHTML = `<circle cx="0" cy="-40" r="8.2" fill="${skin}" stroke="#0002" stroke-width=".6"/><circle cx="3.2" cy="-41" r="1.15" fill="#222"/><circle cx="6.6" cy="-41" r="1.15" fill="#222"/><circle cx="8.3" cy="-38.6" r="1.7" fill="#d9a066"/><path d="M3.6 -36.2 q2.4 1.8 4.6 0" fill="none" stroke="#7a3b2a" stroke-width="1" stroke-linecap="round"/>${moustache ? `<path d="M2.5 -37.4 q3 -1.6 6 0 q-3 2.2 -6 0Z" fill="#eee"/>` : ""}${HATS[hat]()}`;
  const legF = mk("sd-leg", 3.5, -16, legBody);
  const armF = mk("sd-arm", 7, -30, armBody);
  const badge = el("g", { visibility: label === "" ? "hidden" : "visible" }, root);
  el("circle", { r: 9, fill: "#fff", stroke: uniform, "stroke-width": 2.4 }, badge);
  const txt = el("text", { y: 4.4, "text-anchor": "middle", style: "font:700 12px var(--math, serif);fill:#1a1a2e" }, badge);
  txt.textContent = label;

  return {
    root,
    // Pose the character. phase: walk cycle in turns; amp: stride size (0 = standing); carry: lantern arm raised;
    // cheer 0..1: both arms up; hop: height of a jump; scale: pop-in factor (0 hides it).
    set({ x, y, dir = 1, phase = 0, amp = 0, carry = false, cheer = 0, hop = 0, scale = 1 }) {
      root.setAttribute("visibility", scale <= 0.01 ? "hidden" : "visible");
      root.setAttribute("transform", `translate(${x.toFixed(2)} ${(y - hop).toFixed(2)})`);
      shadow.setAttribute("rx", (11 * size * (1 - Math.min(0.5, hop / 50))).toFixed(2));
      shadow.setAttribute("transform", `translate(0 ${hop.toFixed(2)})`);
      flip.setAttribute("transform", `scale(${(dir * size * scale).toFixed(3)} ${(size * scale).toFixed(3)})`);
      const s = Math.sin(phase * TAU), c = Math.abs(Math.cos(phase * TAU)), a = amp;
      bob.setAttribute("transform", `translate(0 ${(-a * 2.3 * c).toFixed(2)}) rotate(${(a * 3.2).toFixed(2)})`);
      legF.setAttribute("transform", `translate(3.5 -16) rotate(${(32 * a * s).toFixed(2)})`);
      legB.setAttribute("transform", `translate(-3.5 -16) rotate(${(-32 * a * s).toFixed(2)})`);
      const wave = Math.sin(phase * TAU * 2);
      armF.setAttribute("transform", `translate(7 -30) rotate(${(carry ? -66 + 4 * s : cheer ? lerp(0, -150 + 10 * wave, cheer) : -28 * a * s - 2).toFixed(2)})`);
      armB.setAttribute("transform", `translate(-7 -30) rotate(${(cheer ? lerp(0, 150 - 10 * wave, cheer) : 28 * a * s + 3).toFixed(2)})`);
      badge.setAttribute("transform", `translate(0 ${(-(top * size * scale) - a * 2).toFixed(2)}) scale(${Math.min(1, scale).toFixed(3)})`);
      root.classList.toggle("sd-idle", a === 0 && !cheer);
    },
    // Where the carried lantern hangs, in the scene's coordinates.
    hand({ x, y, dir = 1, scale = 1 }) { return [x + dir * size * scale * 19.5, y - size * scale * 24]; },
  };
}
