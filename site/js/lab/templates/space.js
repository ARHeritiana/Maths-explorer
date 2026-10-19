// Template `space`: a 3D object you can turn. One orthographic view (the camera of js/camera3d.js, the same as the slide widgets),
// a floor grid, the three axes and the experiment's scene made of faces, segments and points. Dragging the empty background turns
// the view (arrow keys too, with the canvas focused); the camera belongs to the view and never depends on the state, so changing a
// parameter never turns or rescales it (Shift or Alt drag pans, the wheel zooms, 0 or a double click resets everything).
// Handles are points constrained to a line, a plane or an axis direction: a control gives `constraint(state)` = { o, e1, e2? }
// (the point is o + a e1 [+ b e2]), the pointer's view ray is intersected with it, the parameters are snapped to `grid` and the
// control's `drag(state, point, {a, b})` returns the partial state. A part of a segment that lies behind a face marked `occlude`
// is dashed, so the depth is readable. Nothing here is created during a drag or a rotation: the canvas is repainted, that is all.
import { cam3Project, cam3Ray, cam3HitPlane, cam3HitLine, cam3Turn, CAM3_DEFAULT } from "../../camera3d.js";
import { drawHandle, drawLabel, drawBadge } from "../plot.js";
import { snap, clamp } from "../models/num.js";

export const spins = true;   // the shell gives the stage an onSpin: a drag on the background calls view.spin(dx, dy)

const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const along = (o, e, a) => [o[0] + a * e[0], o[1] + a * e[1], o[2] + a * e[2]];

// Even-odd test of a screen point against a polygon of {X, Y}.
function inside(x, y, poly) {
  let w = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a.Y > y) !== (b.Y > y) && x < ((b.X - a.X) * (y - a.Y)) / (b.Y - a.Y) + a.X) w = !w;
  }
  return w;
}

export function mount(env) {
  const { exp, stage, fmt, getState, setState, ghost, isUnlocked } = env;
  const spec = exp.views.space, ctx = { fmt, lang: fmt.lang, stage, unlocked: isUnlocked };
  const cam = { yaw: CAM3_DEFAULT.yaw, pitch: CAM3_DEFAULT.pitch };
  stage.camera3 = cam;   // read by the tests: the view angles, independent of the state
  const [bx, by, bz] = spec.box;
  const centre = [(bx[0] + bx[1]) / 2, (by[0] + by[1]) / 2, (bz[0] + bz[1]) / 2];
  const radius = Math.hypot(bx[1] - bx[0], by[1] - by[0], bz[1] - bz[0]) / 2;   // the box fits the view whatever the angles

  // world -> stage pixels (before the zoom of the 2D camera)
  const scale = () => { const h = Math.min(stage.W || 640, stage.H || 420); return ((h < 420 ? 0.66 : 0.54) * h) / radius; };   // a short stage (a slide) uses more of its height
  const proj = (p) => {
    const q = cam3Project(cam.yaw, cam.pitch, p[0] - centre[0], p[1] - centre[1], p[2] - centre[2]), k = scale();
    return { X: stage.W / 2 + k * q.u, Y: stage.H / 2 - k * q.v, d: q.d };
  };
  const rayAt = (sx, sy) => {
    const k = scale(), r = cam3Ray(cam.yaw, cam.pitch, (sx - stage.W / 2) / k, -(sy - stage.H / 2) / k);
    return { p: [r.p[0] + centre[0], r.p[1] + centre[1], r.p[2] + centre[2]], w: r.w };
  };

  // ---- handles
  const handles = Object.entries(exp.controls).filter(([, c]) => c.kind === "handle").map(([id, c]) => {
    const g = c.grid || 0, params = (s) => {
      const k = c.constraint(s), p = c.at(s);
      return { k, a: dot3([p[0] - k.o[0], p[1] - k.o[1], p[2] - k.o[2]], k.e1) / dot3(k.e1, k.e1), b: k.e2 ? dot3([p[0] - k.o[0], p[1] - k.o[1], p[2] - k.o[2]], k.e2) / dot3(k.e2, k.e2) : 0 };
    };
    const move = (s, a, b) => {
      const k = c.constraint(s), p = along(along(k.o, k.e1, a), k.e2 || [0, 0, 0], b);
      const next = c.drag(s, p, { a, b });
      if (next) setState(next);
    };
    return {
      id, control: c, label: fmt.t(c.label), color: c.color || "accent", absolute: false,
      pos() {
        const q = proj(c.at(getState()));
        return [clamp(q.X, 6, stage.W - 6), clamp(q.Y, 6, stage.H - 6)];
      },
      drag(sx, sy) {
        const s = getState(), k = c.constraint(s), ray = rayAt(sx, sy);
        if (k.e2) {
          const hit = cam3HitPlane(ray, k.o, cross3(k.e1, k.e2));
          if (!hit) return;
          const d = [hit[0] - k.o[0], hit[1] - k.o[1], hit[2] - k.o[2]];
          move(s, snap(dot3(d, k.e1) / dot3(k.e1, k.e1), g), snap(dot3(d, k.e2) / dot3(k.e2, k.e2), g));
        } else {
          const hit = cam3HitLine(ray, k.o, k.e1);
          if (hit) move(s, snap(hit.s, g), 0);
        }
      },
      nudge(dx, dy) {
        const s = getState(), { k, a, b } = params(s), step = g || 1;
        if (c.nudge) { const next = c.nudge(s, dx, dy); if (next) setState(next); return; }
        if (k.e2) move(s, snap(a + dx * step, g), snap(b + dy * step, g)); else move(s, snap(a + (dx || dy) * step, g), 0);
      },
      valuetext: () => c.valuetext?.(getState(), fmt) || "",
    };
  });

  // ---- drawing
  function arrow(g, a, b) {
    const ang = Math.atan2(b.Y - a.Y, b.X - a.X), n = 9;
    g.beginPath(); g.moveTo(b.X, b.Y);
    g.lineTo(b.X - n * Math.cos(ang - 0.4), b.Y - n * Math.sin(ang - 0.4)); g.lineTo(b.X - n * Math.cos(ang + 0.4), b.Y - n * Math.sin(ang + 0.4));
    g.closePath(); g.fillStyle = g.strokeStyle; g.fill();
  }
  function line(g, a, b, color, width, dash) {
    g.save(); g.strokeStyle = stage.color(color); g.lineWidth = width; g.setLineDash(dash || []); g.beginPath(); g.moveTo(a.X, a.Y); g.lineTo(b.X, b.Y); g.stroke(); g.restore();
  }

  function floorAndAxes(g) {
    const pal = stage.pal, z0 = spec.floorZ ?? (bz[0] <= 0 && bz[1] >= 0 ? 0 : bz[0]);
    if (spec.floor !== false) {
      g.save(); g.strokeStyle = pal.grid; g.lineWidth = 1;
      for (let x = Math.ceil(bx[0]); x <= bx[1]; x++) { const a = proj([x, by[0], z0]), b = proj([x, by[1], z0]); g.beginPath(); g.moveTo(a.X, a.Y); g.lineTo(b.X, b.Y); g.stroke(); }
      for (let y = Math.ceil(by[0]); y <= by[1]; y++) { const a = proj([bx[0], y, z0]), b = proj([bx[1], y, z0]); g.beginPath(); g.moveTo(a.X, a.Y); g.lineTo(b.X, b.Y); g.stroke(); }
      g.restore();
    }
    const L = spec.axes ?? Math.max(bx[1], by[1], bz[1]) - 0.2, o = proj([0, 0, 0]);
    for (const [name, p] of [["x", [L, 0, 0]], ["y", [0, L, 0]], ["z", [0, 0, L]]]) {
      const e = proj(p);
      g.save(); g.strokeStyle = pal.line; g.lineWidth = 1.6; g.beginPath(); g.moveTo(o.X, o.Y); g.lineTo(e.X, e.Y); g.stroke(); arrow(g, o, e); g.restore();
      drawLabel(g, stage, name, e.X + 7, e.Y - 6, "muted", "left", 16);
    }
  }

  // One scene (the state's, or the ghost of the other case of a contrast) painted far to near.
  function paint(g, scene, faint, placed) {
    const faces = (scene.faces || []).map((f) => {
      const pts = f.pts.map(proj), n = cross3([f.pts[1][0] - f.pts[0][0], f.pts[1][1] - f.pts[0][1], f.pts[1][2] - f.pts[0][2]], [f.pts[2][0] - f.pts[0][0], f.pts[2][1] - f.pts[0][1], f.pts[2][2] - f.pts[0][2]]);
      return { ...f, poly: pts, n, k: dot3(n, f.pts[0]), d: pts.reduce((m, p) => m + p.d, 0) / pts.length };
    }).sort((a, b) => b.d - a.d);
    const w = cam3Ray(cam.yaw, cam.pitch, 0, 0).w, occluders = faces.filter((f) => f.occlude && Math.abs(dot3(f.n, w)) > 1e-6);
    const hidden = (p) => {
      if (!occluders.length) return false;
      const q = proj(p);
      return occluders.some((f) => (f.k - dot3(f.n, p)) / dot3(f.n, w) < -1e-6 && inside(q.X, q.Y, f.poly));
    };
    g.save();
    if (faint) g.globalAlpha = 0.38;
    for (const f of faces) {
      g.save();
      g.beginPath(); f.poly.forEach((p, i) => (i ? g.lineTo(p.X, p.Y) : g.moveTo(p.X, p.Y))); g.closePath();
      g.globalAlpha *= f.alpha ?? 0.2; g.fillStyle = stage.color(f.color || "accent"); g.fill();
      g.restore();
      if (f.line !== false) { g.save(); g.strokeStyle = stage.color(f.color || "accent"); g.lineWidth = 1.5; g.setLineDash(f.dash || []); g.lineJoin = "round"; g.beginPath(); f.poly.forEach((p, i) => (i ? g.lineTo(p.X, p.Y) : g.moveTo(p.X, p.Y))); g.closePath(); g.stroke(); g.restore(); }
    }
    for (const sg of scene.segs || []) {
      const color = stage.color(sg.color || "ink"), width = sg.width ?? 2.5;
      const n = occluders.length ? 40 : 1, pieces = [];
      for (let i = 0; i < n; i++) {
        const t0 = i / n, t1 = (i + 1) / n, mid = along(sg.a, [sg.b[0] - sg.a[0], sg.b[1] - sg.a[1], sg.b[2] - sg.a[2]], (t0 + t1) / 2);
        pieces.push({ t0, t1, hid: hidden(mid) });
      }
      const dir = [sg.b[0] - sg.a[0], sg.b[1] - sg.a[1], sg.b[2] - sg.a[2]];
      for (let i = 0; i < n;) {
        let j = i; while (j + 1 < n && pieces[j + 1].hid === pieces[i].hid) j++;
        const a = proj(along(sg.a, dir, pieces[i].t0)), b = proj(along(sg.a, dir, pieces[j].t1));
        g.save(); g.strokeStyle = color; g.lineWidth = width; g.lineCap = "round";
        if (pieces[i].hid) { g.setLineDash([5, 5]); g.globalAlpha *= 0.55; } else g.setLineDash(sg.dash || []);
        g.beginPath(); g.moveTo(a.X, a.Y); g.lineTo(b.X, b.Y); g.stroke(); g.restore();
        i = j + 1;
      }
      if (sg.arrow) { g.save(); g.strokeStyle = color; arrow(g, proj(sg.a), proj(sg.b)); g.restore(); }
    }
    for (const p of scene.points || []) {
      const q = proj(p.at), hid = hidden(p.at);
      g.save(); g.beginPath(); g.arc(q.X, q.Y, p.r ?? 5.5, 0, Math.PI * 2);
      if (p.hollow || hid) { g.lineWidth = 2; g.strokeStyle = stage.color(p.color || "ink"); g.fillStyle = stage.pal.surface; g.fill(); g.stroke(); }
      else { g.fillStyle = stage.color(p.color || "ink"); g.fill(); }
      g.restore();
      if (p.label && !faint) drawLabel(g, stage, p.label, q.X + (p.dx ?? 10), q.Y + (p.dy ?? -10), p.color, p.anchor || "left", 17, placed);
    }
    for (const t of scene.texts || []) if (!faint) drawLabel(g, stage, t.text, proj(t.at).X + (t.dx || 0), proj(t.at).Y + (t.dy || 0), t.color, t.anchor || "left", t.size || 16, placed);
    g.restore();
  }

  function draw(g) {
    const s = getState(), other = ghost(), placed = [];
    floorAndAxes(g);
    if (other) paint(g, spec.scene(other, ctx), true, placed);
    paint(g, spec.scene(s, ctx), false, placed);
    const m = spec.measure?.(s, ctx);
    if (m) drawBadge(g, stage, m);
    for (const h of handles) { const [x, y] = h.pos(); drawHandle(g, stage, x, y, { color: h.color, locked: !isUnlocked(h.id), focused: stage.focusId === h.id }); }
  }

  // The view: turning, and the reset of the 2D camera (key 0, double click) brings the angles back too.
  const resetAngles = () => { cam.yaw = CAM3_DEFAULT.yaw; cam.pitch = CAM3_DEFAULT.pitch; };
  const baseReset = stage.nav.camera.reset;
  stage.nav.camera.reset = () => { baseReset(); resetAngles(); };
  return {
    draw, handles,
    spin(dx, dy) { cam3Turn(cam, dx * 0.008, dy * 0.006); },
    destroy() { stage.nav.camera.reset = baseReset; },
  };
}
