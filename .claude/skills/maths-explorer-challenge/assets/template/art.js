// Drawings of the __ID__ challenge: a small cartoon person, built once and posed every frame (references/design.md section 3).
import { svgEl } from "../common/kit.js";

// Build a person inside `parent`: nested groups with their pivots, so posing only sets transforms.
export function makePerson(parent, { fill, size = 1 }) {
  const root = svgEl("g", {}, parent), body = svgEl("g", {}, root);
  root.dataset.size = size;
  svgEl("path", { d: "M-7 0 Q-7 -14 0 -14 Q7 -14 7 0 Z", fill, stroke: "var(--ink)", "stroke-width": 1.4 }, body);   // body
  const arm = svgEl("g", {}, body);   // the arm turns about the shoulder at (4, -10), on the edge of the body
  svgEl("line", { x1: 4, y1: -10, x2: 15, y2: -10, stroke: "var(--ink)", "stroke-width": 2.2, "stroke-linecap": "round" }, arm);
  svgEl("circle", { cx: 0, cy: -20, r: 6.5, fill: "#f2c9a0", stroke: "var(--ink)", "stroke-width": 1.4 }, body);    // head (skin colour is the object's own)
  svgEl("circle", { cx: 2.4, cy: -21, r: 0.9, fill: "var(--ink)" }, body);                                           // eye
  const mouth = svgEl("path", { d: "M0.5 -18 q1.8 1.4 3.6 0", fill: "none", stroke: "var(--ink)", "stroke-width": 0.9, "stroke-linecap": "round" }, body);
  return { root, body, arm, mouth };
}

// Pose a person: position, facing angle (radians, where the arm points), arm reach 0..1, a little hop 0..1 on a handshake.
export function posePerson(P, { x, y, angle = 0, reach = 0, hop = 0 }) {
  const deg = (angle * 180) / Math.PI, flip = Math.cos(angle) < 0;   // keep the face upright: mirror instead of rotating past 90 degrees
  P.root.setAttribute("transform", `translate(${x.toFixed(1)} ${(y - 4 * Math.sin(Math.PI * hop)).toFixed(1)}) scale(${P.root.dataset.size})`);
  P.body.setAttribute("transform", flip ? "scale(-1 1)" : "");
  const a = flip ? 180 - deg : deg;   // arm direction in the (possibly mirrored) body frame
  P.arm.setAttribute("transform", `rotate(${(a * reach + 78 * (1 - reach)).toFixed(1)} 4 -10)`);   // hanging along the body (78 degrees) to pointing
  P.mouth.setAttribute("d", hop > 0.05 ? "M0.5 -18.6 q1.8 2.4 3.6 0" : "M0.5 -18 q1.8 1.4 3.6 0");   // a bigger smile on the shake
}
