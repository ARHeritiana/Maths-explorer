// Drawing primitives shared by the templates: panels (a rectangle with fixed world ranges), axes and the data-driven scene
// that an experiment returns (curves, areas, rectangles, lines, circles, points, texts). Colours are palette names.
// The ranges never depend on the state: only the camera zooms (brief section 5).
import { axisTicks } from "../math.js";
import { snap, clamp } from "./models/num.js";

// Panels share the stage: side by side on a wide stage, stacked on a narrow one.
export function layoutPanels(W, H, specs, forceRow = false) {
  if (specs.length === 1) return [{ x: 0, y: 0, w: W, h: H }];
  const row = forceRow || W >= H * 1.25, share = specs[0].share ?? (row ? 0.42 : 0.5);
  if (row) { const w0 = Math.round(W * share); return [{ x: 0, y: 0, w: w0, h: H }, { x: w0, y: 0, w: W - w0, h: H }]; }
  const h0 = Math.round(H * share);
  return [{ x: 0, y: 0, w: W, h: h0 }, { x: 0, y: h0, w: W, h: H - h0 }];
}

// Grid values for the visible range [a, b] drawn over `px` pixels. The experiment's ticks give the anchor and the step (so π/2
// steps or a grid through ±1 survive); the step doubles or halves so that the grid stays readable at every zoom.
export function gridTicks(given, a, b, px, spacing = 40) {
  if (Array.isArray(given) && !given.length) return [];
  if (!(b > a)) return [];
  let anchor = 0, step = 0;
  if (Array.isArray(given) && given.length) {
    anchor = given[0];
    for (let i = 1; i < given.length; i++) { const d = Math.abs(given[i] - given[i - 1]); if (d > 1e-12 && (!step || d < step)) step = d; }
  }
  if (!step) {
    const rough = (b - a) / 6, power = 10 ** Math.floor(Math.log10(rough));
    step = [1, 2, 5, 10].map((v) => v * power).find((v) => v >= rough);
  }
  const most = Math.max(2, Math.floor(px / spacing));
  while ((b - a) / step > most) step *= 2;
  while ((b - a) / step < 2 && step > 1e-6) step /= 2;
  const out = [];
  for (let m = Math.ceil((a - anchor) / step - 1e-9); out.length < 400; m++) {
    let t = anchor + m * step;
    const tidy = Math.round(t * 1e6) / 1e6;   // 0.30000000000000004 -> 0.3, but a multiple of π stays exact
    if (Math.abs(t - tidy) < 1e-9) t = tidy;
    if (t > b + step * 1e-9) break;
    out.push(Math.abs(t) < 1e-12 ? 0 : t);
  }
  return out;
}

// World <-> stage pixels for one panel. With `equal` one unit has the same length on both axes, and the range of the axis that
// has room grows so that the panel is filled (never stretched). The range depends on the size of the stage only, never on the
// state. `cam` (the stage's view camera of this panel: zoom k and offset o) maps X to c + k (X - c) + o around the centre c of
// the frame; x0, x1, y0, y1 and the grid are then those of the visible part, so the grid always covers the whole panel.
export function makeView(rect, spec, cam = null) {
  const pad = { l: spec.pad?.[0] ?? 34, t: spec.pad?.[1] ?? 12, r: spec.pad?.[2] ?? 12, b: spec.pad?.[3] ?? 26 };
  const pw = Math.max(40, rect.w - pad.l - pad.r), ph = Math.max(40, rect.h - pad.t - pad.b);
  let [x0, x1] = spec.x, [y0, y1] = spec.y;
  const L = rect.x + pad.l, T = rect.y + pad.t, w = pw, h = ph;
  if (spec.equal) {
    const k0 = Math.min(pw / (x1 - x0), ph / (y1 - y0)), dx = pw / k0 - (x1 - x0), dy = ph / k0 - (y1 - y0);
    if (dx > 0) { x0 -= dx / 2; x1 += dx / 2; }
    if (dy > 0) { y0 -= dy / 2; y1 += dy / 2; }
  }
  const kx = cam?.kx ?? 1, ky = cam?.ky ?? 1, ox = cam?.ox ?? 0, oy = cam?.oy ?? 0, cx = L + w / 2, cy = T + h / 2;
  const X = (x) => cx + kx * (L + ((x - x0) / (x1 - x0)) * w - cx) + ox;
  const Y = (y) => cy + ky * (T + h - ((y - y0) / (y1 - y0)) * h - cy) + oy;
  const iX = (S) => x0 + (((S - ox - cx) / kx + cx - L) / w) * (x1 - x0);
  const iY = (S) => y0 + ((T + h - ((S - oy - cy) / ky + cy)) / h) * (y1 - y0);
  const vx0 = iX(L), vx1 = iX(L + w), vy0 = iY(T + h), vy1 = iY(T);
  return {
    x0: vx0, x1: vx1, y0: vy0, y1: vy1, left: L, top: T, width: w, height: h, rect, cx, cy, cam,
    xTicks: gridTicks(spec.xTicks, vx0, vx1, w, 44), yTicks: gridTicks(spec.yTicks, vy0, vy1, h, 30),
    X, Y, iX, iY,
  };
}

// A view registered with the stage: its camera (shared when `camId` names one used by another panel; `axis: "x"` zooms only
// horizontally) and its frame, so that a wheel, a pinch or a drag acts on the panel under the pointer.
export function panelView(stage, id, rect, spec, { camId = id, axis = "xy" } = {}) {
  const cam = stage.cam ? stage.cam(camId, axis) : null;
  const v = makeView(rect, spec, cam);
  stage.panel?.(id, { x: v.left, y: v.top, w: v.width, h: v.height }, cam, [v.cx, v.cy]);
  return v;
}

function clipTo(g, v) { g.save(); g.beginPath(); g.rect(v.left, v.top, v.width, v.height); g.clip(); }

// Grid, axes and tick labels. Lines are clipped to the frame; labels sit in the padding (left and bottom edges), so they stay
// readable whatever part of the plane the view shows.
export function drawAxes(g, v, spec, st, fmt) {
  const pal = st.pal;
  const xs = v.xTicks || spec.xTicks || axisTicks(v.x0, v.x1).values, ys = v.yTicks || spec.yTicks || axisTicks(v.y0, v.y1).values;
  const inX = (x) => v.X(x) >= v.left - 0.5 && v.X(x) <= v.left + v.width + 0.5, inY = (y) => v.Y(y) >= v.top - 0.5 && v.Y(y) <= v.top + v.height + 0.5;
  clipTo(g, v);
  g.lineWidth = 1; g.strokeStyle = pal.grid;
  g.beginPath();
  for (const x of xs) { const X = Math.round(v.X(x)) + 0.5; g.moveTo(X, v.top); g.lineTo(X, v.top + v.height); }
  for (const y of ys) { const Y = Math.round(v.Y(y)) + 0.5; g.moveTo(v.left, Y); g.lineTo(v.left + v.width, Y); }
  g.stroke();
  g.strokeStyle = pal.line; g.lineWidth = 1.6;
  if (v.y0 <= 0 && v.y1 >= 0) { g.beginPath(); g.moveTo(v.left, v.Y(0)); g.lineTo(v.left + v.width, v.Y(0)); g.stroke(); }
  if (!spec.noYAxis && v.x0 <= 0 && v.x1 >= 0) { g.beginPath(); g.moveTo(v.X(0), v.top); g.lineTo(v.X(0), v.top + v.height); g.stroke(); }
  g.restore();
  g.save();
  g.font = st.font(14); g.fillStyle = pal.muted;
  g.textAlign = "center";
  for (const x of xs) if (inX(x) && (Math.abs(x) > 1e-9 || spec.zeroLabel)) g.fillText(spec.xLabel ? spec.xLabel(x) : fmt.num(x), v.X(x), v.top + v.height + 17);
  g.textAlign = "right";
  for (const y of ys) if (inY(y) && (Math.abs(y) > 1e-9 || spec.zeroLabel)) g.fillText(spec.yLabel ? spec.yLabel(y) : fmt.num(y), v.left - 6, v.Y(y) + 5);
  g.restore();
}

function stroke(g, st, o, defaults = {}) {
  g.strokeStyle = st.color(o.color || defaults.color || "ink");
  g.lineWidth = o.width ?? defaults.width ?? 2;
  g.setLineDash(o.dash ? o.dash : []);
}

function arrowHead(g, x0, y0, x1, y1) {
  const a = Math.atan2(y1 - y0, x1 - x0), s = 9;
  g.beginPath(); g.moveTo(x1, y1);
  g.lineTo(x1 - s * Math.cos(a - 0.4), y1 - s * Math.sin(a - 0.4)); g.lineTo(x1 - s * Math.cos(a + 0.4), y1 - s * Math.sin(a + 0.4));
  g.closePath(); g.fillStyle = g.strokeStyle; g.fill();
}

function label(g, st, text, x, y, color, anchor = "left", size = 17, placed = null) {
  g.save();
  g.font = st.font(size, 600, true); g.textAlign = anchor; g.lineJoin = "round";
  if (placed) {
    // Labels of nearby points must not collide: try the asked place, then below, then the other side; skip if none is free.
    const w = g.measureText(text).width, box = (px, py, an) => {
      const left = an === "right" ? px - w : an === "center" ? px - w / 2 : px;
      return [left - 2, py - size, left + w + 2, py + 4];
    };
    const free = (b) => placed.every((o) => b[2] < o[0] || b[0] > o[2] || b[3] < o[1] || b[1] > o[3]);
    const tries = [[x, y], [x, y + size + 6], [x, y - size - 6]];
    const pick = tries.find(([px, py]) => free(box(px, py, anchor)));
    if (!pick) { g.restore(); return; }
    [x, y] = pick;
    placed.push(box(x, y, anchor));
  }
  g.lineWidth = 4; g.strokeStyle = st.pal.surface; g.strokeText(text, x, y);
  g.fillStyle = st.color(color || "ink"); g.fillText(text, x, y);
  g.restore();
}

// A row of labels at the x of the quantities they name (the five numbers of a box plot). The order of x is kept, labels that
// would touch spread sideways inside the panel, and a thin leader joins a displaced label to its true position.
function rowLabels(g, v, st, spec) {
  const size = spec.size || 15, gap = 6, y = v.Y(spec.y);
  g.save(); g.font = st.font(size, 600, true);
  const items = spec.items.map((it, i) => ({ ...it, i, p: v.X(it.x), home: v.X(it.x), w: g.measureText(it.text).width + 6 }));
  g.restore();
  items.sort((a, b) => a.p - b.p || a.i - b.i);
  const lo = v.left, hi = v.left + v.width;
  items.forEach((it, k) => { const min = k ? items[k - 1].p + (items[k - 1].w + it.w) / 2 + gap : lo + it.w / 2; if (it.p < min) it.p = min; });
  for (let k = items.length - 1; k >= 0; k--) {
    const max = k < items.length - 1 ? items[k + 1].p - (items[k + 1].w + items[k].w) / 2 - gap : hi - items[k].w / 2;
    if (items[k].p > max) items[k].p = max;
  }
  g.save(); g.setLineDash([]);
  for (const it of items) {
    if (Math.abs(it.p - it.home) > 2 && spec.to !== undefined) {
      g.strokeStyle = st.pal.muted; g.lineWidth = 1; g.beginPath(); g.moveTo(it.p, y + 6); g.lineTo(it.home, v.Y(spec.to)); g.stroke();
    }
    label(g, st, it.text, it.p, y, it.color, "center", size);
  }
  g.restore();
}

// Draws one scene object (see the experiment contract in docs/LAB_DESIGN.md section 5 and lab/CLAUDE.md).
export function drawScene(g, v, scene, st, { ghost = false } = {}) {
  g.save();
  if (ghost) g.globalAlpha = 0.38;
  clipTo(g, v);
  for (const a of scene.areas || []) {
    const from = Math.max(a.from, v.x0), to = Math.min(a.to, v.x1), n = 120;
    if (!(to > from)) continue;
    g.beginPath(); g.moveTo(v.X(from), v.Y(0));
    for (let i = 0; i <= n; i++) { const x = from + ((to - from) * i) / n; g.lineTo(v.X(x), v.Y(a.f(x))); }
    g.lineTo(v.X(to), v.Y(0)); g.closePath();
    g.globalAlpha *= a.alpha ?? 0.14; g.fillStyle = st.color(a.color || "accent"); g.fill();
    g.globalAlpha = ghost ? 0.38 : 1;
  }
  for (const r of scene.rects || []) {
    const x = v.X(r.x), x2 = v.X(r.x + r.w), y = v.Y(Math.max(0, r.h)), y2 = v.Y(Math.min(0, r.h));
    if (!r.hollow) {
      g.globalAlpha = (ghost ? 0.38 : 1) * (r.alpha ?? 0.3);
      g.fillStyle = st.color(r.color || "obj2"); g.fillRect(x, y, x2 - x, y2 - y);
      g.globalAlpha = ghost ? 0.38 : 1;
    }
    g.strokeStyle = st.color(r.color || "obj2"); g.lineWidth = r.hollow ? 2.2 : 1.2; g.setLineDash(r.dash || []); g.strokeRect(x, y, x2 - x, y2 - y);
  }
  for (const p of scene.polys || []) {
    // a closed or open polyline in world coordinates; `fill` shades it
    g.beginPath();
    p.pts.forEach(([x, y], i) => (i ? g.lineTo(v.X(x), v.Y(y)) : g.moveTo(v.X(x), v.Y(y))));
    if (p.close !== false && p.fill) g.closePath();
    if (p.fill) { g.globalAlpha = (ghost ? 0.38 : 1) * (p.alpha ?? 0.2); g.fillStyle = st.color(p.fill); g.fill(); g.globalAlpha = ghost ? 0.38 : 1; }
    if (p.width !== 0) { stroke(g, st, p, { color: "ink", width: 2 }); g.lineJoin = "round"; g.stroke(); }
  }
  for (const c of scene.curves || []) {
    stroke(g, st, c, { color: "accent", width: 3 });
    const a = Math.max(c.from ?? v.x0, v.x0), b = Math.min(c.to ?? v.x1, v.x1), n = c.samples || 240;
    g.lineJoin = "round"; g.beginPath();
    let pen = false;
    for (let i = 0; i <= n; i++) {
      const x = a + ((b - a) * i) / n, y = c.f(x);
      if (!Number.isFinite(y) || Math.abs(y) > 1e5) { pen = false; continue; }
      if (pen) g.lineTo(v.X(x), v.Y(y)); else { g.moveTo(v.X(x), v.Y(y)); pen = true; }
    }
    g.stroke();
  }
  for (const l of scene.lines || []) {
    g.globalAlpha = (ghost ? 0.38 : 1) * (l.alpha ?? 1);
    stroke(g, st, l, { color: "muted", width: 2 });
    let [ax, ay] = l.a, [bx, by] = l.b;
    if (l.extend) {
      const dx = bx - ax, dy = by - ay, far = 4 * Math.max(v.x1 - v.x0, v.y1 - v.y0) / (Math.hypot(dx, dy) || 1);
      [ax, ay, bx, by] = [ax - dx * far, ay - dy * far, bx + dx * far, by + dy * far];
    }
    g.beginPath(); g.moveTo(v.X(ax), v.Y(ay)); g.lineTo(v.X(bx), v.Y(by)); g.stroke();
    if (l.arrow) { g.setLineDash([]); arrowHead(g, v.X(ax), v.Y(ay), v.X(bx), v.Y(by)); }
    g.globalAlpha = ghost ? 0.38 : 1;
  }
  for (const c of scene.circles || []) {
    stroke(g, st, c, { color: "line", width: 2 });
    g.beginPath(); g.ellipse(v.X(c.c[0]), v.Y(c.c[1]), (c.r / (v.x1 - v.x0)) * v.width, (c.r / (v.y1 - v.y0)) * v.height, 0, 0, Math.PI * 2); g.stroke();
  }
  for (const a of scene.arcs || []) {
    stroke(g, st, a, { color: "accent", width: 2.5 });
    const rr = a.pixels ?? 26;
    g.beginPath(); g.arc(v.X(a.c[0]), v.Y(a.c[1]), rr, -(a.from * Math.PI) / 180, -(a.to * Math.PI) / 180, a.to > a.from); g.stroke();
  }
  g.restore();
  g.save();
  if (ghost) g.globalAlpha = 0.38;
  g.setLineDash([]);
  if (scene.rowLabels && !ghost) rowLabels(g, v, st, scene.rowLabels);
  const placed = [];
  for (const p of scene.points || []) {
    const x = v.X(p.at[0]), y = v.Y(p.at[1]);
    if (x < v.left - 2 || x > v.left + v.width + 2 || y < v.top - 2 || y > v.top + v.height + 2) continue;
    g.beginPath(); g.arc(x, y, p.r ?? 6, 0, Math.PI * 2);
    if (p.hollow) { g.lineWidth = 2; g.strokeStyle = st.color(p.color || "ink"); g.fillStyle = st.pal.surface; g.fill(); g.stroke(); }
    else { g.fillStyle = st.color(p.color || "ink"); g.fill(); }
    if (p.label && !ghost) {
      // a label that would leave the panel on the right is pulled back inside it
      let dx = p.dx ?? 10, anchor = p.anchor || "left";
      if (anchor === "left") { g.save(); g.font = st.font(17, 600, true); const w = g.measureText(p.label).width; g.restore(); if (x + dx + w > v.left + v.width + 8) dx = v.left + v.width + 8 - w - x; }
      label(g, st, p.label, x + dx, y + (p.dy ?? -10), p.color, anchor, 17, placed);
    }
  }
  for (const t of scene.texts || []) if (!ghost) label(g, st, t.text, v.X(t.at[0]) + (t.dx || 0), v.Y(t.at[1]) + (t.dy || 0), t.color, t.anchor || "left", t.size || 16, placed);
  g.restore();
}

// Handle marks: a free handle is a filled dot in a soft halo; the handle under the pointer, focused or dragged gets a ring.
// Locked handles (a gated mission) are a small hollow mark.
export function drawHandle(g, st, x, y, { color = "accent", locked = false, focused = false, id = null } = {}) {
  g.save();
  g.setLineDash([]);
  const c = st.color(color);
  const active = focused || (id !== null && (st.focusId === id || st.hoverId === id || st.dragId === id));
  if (locked) {
    g.globalAlpha = 0.6; g.lineWidth = 1.5; g.strokeStyle = st.pal.muted; g.fillStyle = st.pal.surface;
    g.beginPath(); g.arc(x, y, 5, 0, Math.PI * 2); g.fill(); g.stroke();
  } else {
    g.globalAlpha = active ? 0.24 : 0.14; g.fillStyle = c;
    g.beginPath(); g.arc(x, y, active ? 18 : 14, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 1;
    if (active) { g.lineWidth = 2.5; g.strokeStyle = c; g.beginPath(); g.arc(x, y, 18, 0, Math.PI * 2); g.stroke(); }
    g.fillStyle = c; g.beginPath(); g.arc(x, y, 7.5, 0, Math.PI * 2); g.fill();
    g.lineWidth = 2; g.strokeStyle = st.pal.surface; g.stroke();
  }
  g.restore();
}

// The handles of a template, in the stage's own drawing order (hidden ones skipped).
export function drawHandles(g, st, handles, isUnlocked) {
  for (const h of handles) {
    if (h.hidden?.()) continue;
    const [x, y] = h.pos();
    drawHandle(g, st, x, y, { color: h.color, locked: !isUnlocked(h.id), id: h.id });
  }
}

export { label as drawLabel };

// The measured quantity of a figure: a badge in the corner whose colour says what the figure is doing (positive, negative, zero).
export function drawBadge(g, st, m) {
  g.save();
  g.font = st.font(20, 700);
  const w = g.measureText(m.text).width + 24, x = 10, y = 8;   // the corner of the stage, outside the equal-scale frame when there is room
  g.fillStyle = st.pal.surface; g.globalAlpha = 0.92;
  g.beginPath(); g.roundRect(x, y, w, 34, 8); g.fill();
  g.globalAlpha = 1; g.lineWidth = 2; g.strokeStyle = st.color(m.color || "ink"); g.stroke();
  g.fillStyle = st.color(m.color || "ink"); g.textAlign = "left"; g.fillText(m.text, x + 12, y + 24);
  g.restore();
}

// The engine handles of a template: one per `handle` control of the experiment, locked or not (locked ones are only drawn).
// `views` maps a panel id to its current view; a control names its panel (default: the first one).
export function buildHandles({ exp, fmt, getState, setState, views, panels }) {
  const handles = [];
  for (const [id, c] of Object.entries(exp.controls)) {
    if (c.kind !== "handle") continue;
    const panel = c.panel || panels[0], axis = c.axis || "xy";
    const [gx, gy] = Array.isArray(c.grid) ? c.grid : [c.grid || 0, c.grid || 0];
    const view = () => views()[panel];
    handles.push({
      id, control: c, panel,
      label: fmt.t(c.label), color: c.color || "accent", absolute: !!c.absolute,
      pos() {
        const v = view(), [wx, wy] = c.at(getState());
        return [clamp(v.X(wx), v.left + 6, v.left + v.width - 6), clamp(v.Y(wy), v.top + 6, v.top + v.height - 6)];
      },
      // At the default view a handle just outside its panel is kept on the edge (reachable); once the learner has zoomed or
      // moved the view, a handle out of sight is out of sight: not drawn, not grabbed.
      hidden() {
        const v = view(), cam = v.cam, [wx, wy] = c.at(getState()), X = v.X(wx), Y = v.Y(wy);
        if (!cam || (cam.kx === 1 && cam.ky === 1 && !cam.ox && !cam.oy)) return false;
        return X < v.left - 2 || X > v.left + v.width + 2 || Y < v.top - 2 || Y > v.top + v.height + 2;
      },
      drag(sx, sy) {
        const v = view(), next = c.drag(getState(), snap(v.iX(sx), gx), snap(v.iY(sy), gy));
        if (next) setState(next);
      },
      nudge(dx, dy) {
        const s = getState();
        if (c.nudge) { const next = c.nudge(s, dx, dy); if (next) setState(next); return; }
        if (axis === "x") { dx = dx || dy; dy = 0; } else if (axis === "y") { dy = dy || dx; dx = 0; }
        const [wx, wy] = c.at(s), next = c.drag(s, snap(wx + dx * gx, gx), snap(wy + dy * gy, gy));
        if (next) setState(next);
      },
      valuetext: () => c.valuetext?.(getState(), fmt) || "",
    });
  }
  return handles;
}
