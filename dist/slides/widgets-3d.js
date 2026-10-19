// True 3D with the 2D canvas: orthographic camera, z up, painter's algorithm. Dragging empty space rotates (pitch clamped).
import { C, text, dot, slider, snap, clamp, inl, rich, tpt } from "./widgets.js";
// the one camera of the site (also the laboratory template `space`)
import { cam3Project, cam3Unproject, cam3Turn } from "../js/camera3d.js";

const set = (o, html) => rich(o.readout, html);
const lines = (...a) => a.filter(Boolean).join("<br>");

function cam(o, s = 38, c = [0, 0, 1]) {
  const k = { yaw: -.7, pitch: .55 };
  o.rotate = {
    active: false, last: null,
    start(e, pt) { this.active = true; this.last = pt(e); },
    move(e, pt) { const p = pt(e); cam3Turn(k, (p[0] - this.last[0]) * .008, (p[1] - this.last[1]) * .006); this.last = p; o.redraw(); },
    end() { this.active = false; },
  };
  const P = (x, y, z) => { const q = cam3Project(k.yaw, k.pitch, x - c[0], y - c[1], z - c[2]); return { X: o.W / 2 + s * q.u, Y: o.H / 2 - s * q.v, d: q.d }; };
  const un = (X, Y, zf) => { const q = cam3Unproject(k.yaw, k.pitch, (X - o.W / 2) / s, -(Y - o.H / 2) / s, zf - c[2]); return { x: q.x + c[0], y: q.y + c[1] }; };
  return { k, P, un };
}
function poly(g, pts, fill, alpha, stroke) { g.save(); g.globalAlpha = alpha; g.fillStyle = fill; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p.X, p.Y) : g.moveTo(p.X, p.Y))); g.closePath(); g.fill(); g.globalAlpha = 1; if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1; g.stroke(); } g.restore(); }
function seg(g, a, b, col, w = 2.5, dash) { g.save(); g.strokeStyle = col; g.lineWidth = w; if (dash) g.setLineDash(dash); g.beginPath(); g.moveTo(a.X, a.Y); g.lineTo(b.X, b.Y); g.stroke(); g.restore(); }
function floor(g, V, half = 4) { const f = []; for (let i = -half; i <= half; i++) { seg(g, V(i, -half, 0), V(i, half, 0), C.grid, 1); seg(g, V(-half, i, 0), V(half, i, 0), C.grid, 1); } }
function axes3(g, V, L = 4.5) { [["x", [L, 0, 0]], ["y", [0, L, 0]], ["z", [0, 0, L]]].forEach(([n, p]) => { const a = V(0, 0, 0), b = V(...p); seg(g, a, b, C.axis, 1.6); text(g, inl(n), b.X + 6, b.Y - 6, C.muted, 16); }); }



export const W3 = {
  // Surface z = f(x, y) patch with a draggable point on the floor (integration / level curves): painter's algorithm.
  surface3d(o) {
    let px = 1, py = 1; const f = (x, y) => 3 - (x * x + y * y) / 3; const { k, P, un } = cam(o, 36, [0, 0, 1.5]); const n = 18, h = 3;
    return {
      handles() { const s = P(px, py, 0); return [{ x: s.X, y: s.Y, cur: "move", move(X, Y) { const q = un(X, Y, 0); px = clamp(snap(q.x, .25), -h, h); py = clamp(snap(q.y, .25), -h, h); } }]; },
      draw(g) {
        floor(g, P, 3); axes3(g, P, 3.5); const facets = [];
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
          const x0 = -h + 2 * h * i / n, x1 = -h + 2 * h * (i + 1) / n, y0 = -h + 2 * h * j / n, y1 = -h + 2 * h * (j + 1) / n;
          const pts = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => P(x, y, f(x, y))), z = f((x0 + x1) / 2, (y0 + y1) / 2);
          facets.push({ pts, d: pts.reduce((s, p) => s + p.d, 0) / 4, z });
        }
        facets.sort((a, b) => b.d - a.d).forEach(F => { const sh = .45 + .1 * Math.min(1, F.z / 3); poly(g, F.pts, `rgb(${Math.round(60 + 60 * sh)},${Math.round(150 + 80 * sh)},${Math.round(130 + 60 * sh)})`, .95, "rgba(20,32,36,.6)"); });
        const s = P(px, py, 0), t = P(px, py, f(px, py)); seg(g, s, t, C.warn, 2, [4, 4]); dot(o, t.X, t.Y, C.warn, "", "default", false); dot(o, s.X, s.Y, C.acc, o.L ? "(x, y)" : "(x ; y)");
        set(o, lines(inl("z=3-\\dfrac{x^2+y^2}{3}"), inl(`f${tpt(o, px, py)}=${o.tn(f(px, py), 3)}`), o.pair("Glissez le fond pour tourner.", "Drag the background to rotate.")));
      },
    };
  },
};
