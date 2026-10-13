// True 3D with the 2D canvas: orthographic camera, z up, painter's algorithm. Dragging empty space rotates (pitch clamped).
import { C, text, dot, slider, snap, clamp, pt } from "./widgets.js";

const pj = (yw, pt, x, y, z) => { const cy = Math.cos(yw), sy = Math.sin(yw), cp = Math.cos(pt), sp = Math.sin(pt), x1 = cy * x - sy * y, y1 = sy * x + cy * y; return { u: x1, v: z * cp + y1 * sp, d: y1 * cp - z * sp }; };
const upj = (yw, pt, u, v, z) => { const cy = Math.cos(yw), sy = Math.sin(yw), cp = Math.cos(pt), sp = Math.sin(pt), y1 = (v - z * cp) / sp; return { x: cy * u + sy * y1, y: -sy * u + cy * y1 }; };
const set = (o, html) => { o.readout.innerHTML = html; };
const lines = (...a) => a.filter(Boolean).join("<br>");

function cam(o, s = 38, c = [0, 0, 1]) {
  const k = { yaw: -.7, pitch: .55 };
  o.rotate = {
    active: false, last: null,
    start(e, pt) { this.active = true; this.last = pt(e); },
    move(e, pt) { const p = pt(e); k.yaw += (p[0] - this.last[0]) * .008; k.pitch = clamp(k.pitch + (p[1] - this.last[1]) * .006, .12, 1.45); this.last = p; o.redraw(); },
    end() { this.active = false; },
  };
  const P = (x, y, z) => { const q = pj(k.yaw, k.pitch, x - c[0], y - c[1], z - c[2]); return { X: o.W / 2 + s * q.u, Y: o.H / 2 - s * q.v, d: q.d }; };
  const un = (X, Y, zf) => { const q = upj(k.yaw, k.pitch, (X - o.W / 2) / s, -(Y - o.H / 2) / s, zf - c[2]); return { x: q.x + c[0], y: q.y + c[1] }; };
  return { k, P, un };
}
function poly(g, pts, fill, alpha, stroke) { g.save(); g.globalAlpha = alpha; g.fillStyle = fill; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p.X, p.Y) : g.moveTo(p.X, p.Y))); g.closePath(); g.fill(); g.globalAlpha = 1; if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1; g.stroke(); } g.restore(); }
function seg(g, a, b, col, w = 2.5, dash) { g.save(); g.strokeStyle = col; g.lineWidth = w; if (dash) g.setLineDash(dash); g.beginPath(); g.moveTo(a.X, a.Y); g.lineTo(b.X, b.Y); g.stroke(); g.restore(); }
function floor(g, V, half = 4) { const f = []; for (let i = -half; i <= half; i++) { seg(g, V(i, -half, 0), V(i, half, 0), C.grid, 1); seg(g, V(-half, i, 0), V(half, i, 0), C.grid, 1); } }
function axes3(g, V, L = 4.5) { [["x", [L, 0, 0]], ["y", [0, L, 0]], ["z", [0, 0, L]]].forEach(([n, p]) => { const a = V(0, 0, 0), b = V(...p); seg(g, a, b, C.axis, 1.6); text(g, n, b.X + 6, b.Y - 6, C.muted, 16); }); }

// "x + y + 2z = 2": unit coefficients are implicit, zero terms dropped, signs written as operators.
const lin = (n, N) => { let s = ""; n.forEach((c, i) => { if (!c) return; const v = "xyz"[i], body = (Math.abs(c) === 1 ? "" : N(Math.abs(c))) + v; s += s ? (c < 0 ? " − " : " + ") + body : (c < 0 ? "−" : "") + body; }); return s || "0"; };
const inside = (q, poly) => { let w = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a.Y > q.Y) !== (b.Y > q.Y) && q.X < (b.X - a.X) * (q.Y - a.Y) / (b.Y - a.Y) + a.X) w = !w; } return w; };
// "= 0,5" when the value is exact at two decimals, "≈ 0,54" otherwise.
const exact = v => Math.abs(v - Math.round(v * 100) / 100) < 1e-9;
const rel = (vs, N, o) => (vs.every(exact) ? "= " : "≈ ") + (vs.length > 1 ? pt(o, ...vs) : N(vs[0]));

export const W3 = {
  // Point M in space with its orthogonal projection on a plane: distance and formula.
  plane3d(o) {
    const n = o.spec.normal || [1, 1, 2]; let M = [2, -1, 3], d = 2; const { k, P, un } = cam(o, 38, [0, 0, 1.5]);
    const nn = Math.hypot(...n);
    slider(o, "d", -3, 6, 1, d, v => { d = v; o.redraw(); });
    const planePt = (x, y) => [x, y, (d - n[0] * x - n[1] * y) / n[2]];
    return {
      handles() { const sh = P(M[0], M[1], 0), tp = P(...M); return [{ x: sh.X, y: sh.Y, cur: "move", move(X, Y) { const q = un(X, Y, 0); M[0] = clamp(snap(q.x), -4, 4); M[1] = clamp(snap(q.y), -4, 4); } }, { x: tp.X, y: tp.Y, cur: "ns-resize", move(X, Y) { const base = P(M[0], M[1], 0); M[2] = clamp(snap((base.Y - Y) / (38 * Math.cos(k.pitch))), -1, 6); } }]; },
      draw(g) {
        floor(g, P); axes3(g, P);
        const h = 4, q = [[-h, -h], [h, -h], [h, h], [-h, h]].map(([x, y]) => P(...planePt(x, y))); poly(g, q, C.acc, .18, C.acc);
        const t = (n[0] * M[0] + n[1] * M[1] + n[2] * M[2] - d) / (nn * nn), H = [M[0] - t * n[0], M[1] - t * n[1], M[2] - t * n[2]];
        const Mp = P(...M), Hp = P(...H), sh = P(M[0], M[1], 0);
        seg(g, sh, Mp, C.muted, 1.5, [4, 4]); seg(g, Mp, Hp, C.warn, 3); dot(o, Hp.X, Hp.Y, C.acc, "H", "default", false); dot(o, Mp.X, Mp.Y, C.warn, "M"); dot(o, sh.X, sh.Y, C.muted, "", "move");
        const N = o.num, val = n[0] * M[0] + n[1] * M[1] + n[2] * M[2] - d;
        set(o, lines(o.pair(`Plan : ${lin(n, N)} = ${N(d)}`, `Plane: ${lin(n, N)} = ${N(d)}`), `n = ${pt(o, ...n)}`, `M${pt(o, ...M)}`, o.pair(`Distance MH = |${N(val)}| / ${N(nn, 3)} = ${N(Math.abs(val) / nn, 3)}`, `Distance MH = |${N(val)}| / ${N(nn, 3)} = ${N(Math.abs(val) / nn, 3)}`), o.pair(`H${pt(o, ...H)}  (MH ⟂ plan)`, `H${pt(o, ...H)}  (MH ⟂ plane)`), o.pair("Glissez le fond pour tourner.", "Drag the background to rotate.")));
      },
    };
  },

  // Line given by a point and a direction vector: parametric equations, parameter t.
  line3d(o) {
    let A = [-2, -1, 0], B = [1, 2, 3], t = 1; const { k, P, un } = cam(o, 38, [0, 0, 1.5]);
    slider(o, "t", -1.5, 2, .25, t, v => { t = v; o.redraw(); }, v => o.num(v));
    return {
      handles() { const a = P(...A), b = P(...B); return [{ x: a.X, y: a.Y, cur: "move", move(X, Y) { const q = un(X, Y, A[2]); A[0] = clamp(snap(q.x), -4, 4); A[1] = clamp(snap(q.y), -4, 4); } }, { x: b.X, y: b.Y, cur: "move", move(X, Y) { const q = un(X, Y, B[2]); B[0] = clamp(snap(q.x), -4, 4); B[1] = clamp(snap(q.y), -4, 4); } }]; },
      draw(g) {
        floor(g, P); axes3(g, P); const u = [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
        const far = s => P(A[0] + s * u[0], A[1] + s * u[1], A[2] + s * u[2]); seg(g, far(-3), far(3), C.acc, 2.5);
        const Mt = [A[0] + t * u[0], A[1] + t * u[1], A[2] + t * u[2]], m = P(...Mt), a = P(...A), b = P(...B);
        seg(g, a, b, C.warn, 3); dot(o, a.X, a.Y, C.ink, "A"); dot(o, b.X, b.Y, C.warn, "B"); dot(o, m.X, m.Y, C.acc, "M(t)", "default", false);
        const N = o.num; set(o, lines(`u = AB = ${pt(o, ...u)}`, `x = ${N(A[0])} ${u[0] < 0 ? "−" : "+"} ${N(Math.abs(u[0]))}t`, `y = ${N(A[1])} ${u[1] < 0 ? "−" : "+"} ${N(Math.abs(u[1]))}t`, `z = ${N(A[2])} ${u[2] < 0 ? "−" : "+"} ${N(Math.abs(u[2]))}t`, `M${pt(o, ...Mt)}`));
      },
    };
  },

  // Line D = (AB) and plane P: n·M = d. Drag A and B (floor shadows), the plane's z-intercept, and B's height.
  // The part of D hidden by the plane is dashed: orthographic view, the side of P facing away from the viewer.
  lineplane(o) {
    const n = o.spec.normal || [1, 1, 2]; let A = [-3, -2, 0], B = [1, 1, 3], d = 2; const { k, P, un } = cam(o, 36, [0, 0, 1.5]);
    const zb = slider(o, o.pair("hauteur de B", "height of B"), -1, 5, .5, B[2], v => { B[2] = v; o.redraw(); }, v => o.num(v));
    const dotn = q => n[0] * q[0] + n[1] * q[1] + n[2] * q[2];
    return {
      handles() {
        const a = P(A[0], A[1], 0), b = P(B[0], B[1], 0), c = P(0, 0, d / n[2]);
        return [{ x: a.X, y: a.Y, cur: "move", move(X, Y) { const q = un(X, Y, 0); A[0] = clamp(snap(q.x), -4, 4); A[1] = clamp(snap(q.y), -4, 4); } },
          { x: b.X, y: b.Y, cur: "move", move(X, Y) { const q = un(X, Y, 0); B[0] = clamp(snap(q.x), -4, 4); B[1] = clamp(snap(q.y), -4, 4); } },
          { x: c.X, y: c.Y, cur: "ns-resize", move(X, Y) { const base = P(0, 0, 0); d = clamp(snap((base.Y - Y) / (36 * Math.cos(k.pitch)) * n[2], 1), -4, 10); } }];
      },
      draw(g) {
        floor(g, P); axes3(g, P);
        const h = 4, sq = [[-h, -h], [h, -h], [h, h], [-h, h]].map(([x, y]) => P(x, y, (d - n[0] * x - n[1] * y) / n[2])); poly(g, sq, C.acc, .2, C.acc);
        const u = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], at = t => [A[0] + t * u[0], A[1] + t * u[1], A[2] + t * u[2]];
        const cy = Math.cos(k.yaw), sy = Math.sin(k.yaw), cp = Math.cos(k.pitch), sp = Math.sin(k.pitch), toViewer = dotn([-sy * cp, -cy * cp, sp]);
        // Hidden: on the far side of P from the viewer and covered by the drawn piece of the plane.
        const hidden = q => (dotn(q) - d) * toViewer < -1e-9 && inside(P(...q), sq);
        for (let i = 0; i < 60; i++) { const t0 = -2 + 5 * i / 60, t1 = -2 + 5 * (i + 1) / 60, mid = at((t0 + t1) / 2); seg(g, P(...at(t0)), P(...at(t1)), C.warn, 2.5, hidden(mid) ? [5, 5] : null); }
        [A, B].forEach(q => seg(g, P(q[0], q[1], 0), P(...q), C.muted, 1.2, [3, 4]));
        const nu = dotn(u), N = o.num, rows = [o.pair(`P : ${lin(n, N)} = ${N(d)}`, `P: ${lin(n, N)} = ${N(d)}`), `n = ${pt(o, ...n)}, u = AB = ${pt(o, ...u)}`, `n · u = ${N(nu)}`];
        if (Math.abs(nu) > 1e-9) {
          const t = (d - dotn(A)) / nu, I = at(t), ip = P(...I); dot(o, ip.X, ip.Y, C.blue, "I", "default", false);
          rows.push(o.pair(`n · u ≠ 0 : D coupe P en un seul point, t ${rel([t], N)}.`, `n · u ≠ 0: D meets P at exactly one point, t ${rel([t], N)}.`), `I ${rel(I, N, o)}`);
        } else rows.push(Math.abs(dotn(A) - d) < 1e-9 ? o.pair("n · u = 0 et A ∈ P : D est contenue dans P.", "n · u = 0 and A ∈ P: D lies in P.") : o.pair("n · u = 0 et A ∉ P : D est strictement parallèle à P.", "n · u = 0 and A ∉ P: D is strictly parallel to P."));
        const a = P(...A), b = P(...B), sa = P(A[0], A[1], 0), sb = P(B[0], B[1], 0), c = P(0, 0, d / n[2]);
        dot(o, a.X, a.Y, C.ink, "A", "default", false); dot(o, b.X, b.Y, C.warn, "B", "default", false);
        dot(o, sa.X, sa.Y, C.muted, "", "move"); dot(o, sb.X, sb.Y, C.muted, "", "move"); dot(o, c.X, c.Y, C.acc, "d");
        rows.push(o.pair("Glissez les ombres de A et B, le point d du plan ; tournez avec le fond.", "Drag the shadows of A and B and the plane point d; rotate with the background."));
        set(o, lines(...rows)); zb.value = B[2];
      },
    };
  },

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
        set(o, lines("z = 3 − (x² + y²)/3", `f${pt(o, px, py)} = ${o.num(f(px, py), 3)}`, o.pair("Glissez le fond pour tourner.", "Drag the background to rotate.")));
      },
    };
  },
};
