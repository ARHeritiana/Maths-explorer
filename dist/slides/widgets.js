// Interactive canvases for the slide player. Every canvas has draggable handles (pointer events, keyboard-free by design:
// the same quantities are mirrored by the readout so a teacher can talk through them). Pure 2D except space3d.
import { W2 } from "./widgets-2d.js";
import { W3 } from "./widgets-3d.js";

export const C = { bg: "#142024", grid: "#27393f", axis: "#6f8587", ink: "#eef3f1", muted: "#93a8a8", acc: "#6fd3b0", warn: "#e8b4a0", blue: "#8fb7ff" };

export function mount(spec, ctx) {
  const f = W2[spec.type] || W3[spec.type];
  if (!f) { ctx.host.textContent = "?"; return { destroy() {} }; }
  const cv = canvas(ctx.host);
  const api = Object.assign(cv, { ...ctx, spec, L: ctx.lang, num: n => fmt(n, ctx.lang), pair: (fr, en) => (ctx.lang ? en : fr) });
  ctx.hint.textContent = api.pair(spec.hintFr || "Interactif : glissez les points.", spec.hintEn || "Interactive: drag the points.");
  const inst = f(api) || {};
  cv.start(inst);
  return { destroy() { cv.stop(); ctx.controls.innerHTML = ""; ctx.readout.innerHTML = ""; } };
}

export function fmt(n, lang, d = 2) {
  if (!Number.isFinite(n)) return "∞";
  let s = (Math.round(n * 10 ** d) / 10 ** d).toFixed(d).replace(/\.?0+$/, "");
  if (s === "-0") s = "0";
  return lang ? s : s.replace(".", ",");
}

function canvas(host) {
  const c = document.createElement("canvas"); host.appendChild(c);
  const g = c.getContext("2d");
  const o = { c, g, W: 0, H: 0, handles: () => [], draw() {}, drag: null };
  const resize = () => {
    const r = host.getBoundingClientRect(), d = devicePixelRatio || 1;
    // The stage is scaled by CSS transform: use layout size (offsetWidth), not the scaled rect.
    o.W = host.clientWidth || r.width; o.H = host.clientHeight || r.height;
    c.width = Math.round(o.W * d); c.height = Math.round(o.H * d); g.setTransform(d, 0, 0, d, 0, 0); o.redraw();
  };
  o.redraw = () => { g.clearRect(0, 0, o.W, o.H); g.fillStyle = C.bg; g.fillRect(0, 0, o.W, o.H); o.draw(g); };
  const pt = e => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) / (r.width || 1) * o.W, (e.clientY - r.top) / (r.height || 1) * o.H]; };
  const hit = (x, y) => { let best = null, bd = 1e9; for (const h of o.handles()) { const d = Math.hypot(h.x - x, h.y - y); if (d < (h.r || 22) && d < bd) { best = h; bd = d; } } return best; };
  let t0 = 0, raf = 0;
  const pulse = () => { o.t = performance.now() / 1000; if (!matchMedia("(prefers-reduced-motion: reduce)").matches) o.redraw(); raf = requestAnimationFrame(pulse); };
  c.addEventListener("pointerdown", e => { const [x, y] = pt(e), h = hit(x, y); if (!h) { o.rotate?.start(e, pt); return; } o.drag = h; c.setPointerCapture(e.pointerId); c.style.cursor = "grabbing"; e.preventDefault(); h.move(x, y); o.redraw(); });
  c.addEventListener("pointermove", e => { const [x, y] = pt(e); if (o.drag) { o.drag.move(x, y); o.redraw(); } else if (o.rotate?.active) o.rotate.move(e, pt); else c.style.cursor = hit(x, y)?.cur || "default"; });
  const end = () => { o.drag = null; o.rotate?.end(); c.style.cursor = "default"; o.redraw(); };
  c.addEventListener("pointerup", end); c.addEventListener("pointercancel", end);
  const ro = new ResizeObserver(resize);
  o.start = inst => { Object.assign(o, inst); ro.observe(host); resize(); if (matchMedia("(prefers-reduced-motion: no-preference)").matches) raf = requestAnimationFrame(pulse); };
  o.stop = () => { ro.disconnect(); cancelAnimationFrame(raf); };
  return o;
}

// ---- drawing helpers shared by widgets
export function view(o, x0, x1, y0, y1, pad = 36) {
  const w = o.W - 2 * pad, h = o.H - 2 * pad;
  const v = { x0, x1, y0, y1, X: x => pad + (x - x0) / (x1 - x0) * w, Y: y => o.H - pad - (y - y0) / (y1 - y0) * h, iX: X => x0 + (X - pad) / w * (x1 - x0), iY: Y => y0 + (o.H - pad - Y) / h * (y1 - y0), pad };
  return v;
}
export function axes(g, v, o = {}) {
  const sx = o.sx || 1, sy = o.sy || 1;
  g.save(); g.lineWidth = 1; g.strokeStyle = C.grid; g.fillStyle = C.muted; g.font = "14px system-ui"; g.textAlign = "center";
  for (let x = Math.ceil(v.x0 / sx) * sx; x <= v.x1 + 1e-9; x += sx) { g.beginPath(); g.moveTo(v.X(x), v.Y(v.y0)); g.lineTo(v.X(x), v.Y(v.y1)); g.stroke(); if (!o.noLabels && Math.abs(x) > 1e-9) g.fillText(lab(x, o.lang), v.X(x), Math.min(v.Y(0), v.Y(v.y0)) + 16 > v.Y(v.y0) ? v.Y(v.y0) - 6 : v.Y(0) + 16); }
  g.textAlign = "right";
  for (let y = Math.ceil(v.y0 / sy) * sy; y <= v.y1 + 1e-9; y += sy) { g.beginPath(); g.moveTo(v.X(v.x0), v.Y(y)); g.lineTo(v.X(v.x1), v.Y(y)); g.stroke(); if (!o.noLabels && Math.abs(y) > 1e-9) g.fillText(lab(y, o.lang), v.X(0) - 6 < v.X(v.x0) + 24 ? v.X(v.x0) + 24 : v.X(0) - 6, v.Y(y) + 5); }
  g.strokeStyle = C.axis; g.lineWidth = 1.6;
  if (v.y0 <= 0 && v.y1 >= 0) { g.beginPath(); g.moveTo(v.X(v.x0), v.Y(0)); g.lineTo(v.X(v.x1), v.Y(0)); g.stroke(); }
  if (v.x0 <= 0 && v.x1 >= 0) { g.beginPath(); g.moveTo(v.X(0), v.Y(v.y0)); g.lineTo(v.X(0), v.Y(v.y1)); g.stroke(); }
  g.restore();
}
const lab = (x, lang) => fmt(x, lang, 2);
export function curve(g, v, f, a, b, color = C.acc, w = 3) {
  g.save(); g.strokeStyle = color; g.lineWidth = w; g.lineJoin = "round"; g.beginPath(); let pen = false;
  const n = 400;
  for (let i = 0; i <= n; i++) {
    const x = a + (b - a) * i / n, y = f(x);
    if (!Number.isFinite(y) || y > v.y1 * 4 || y < v.y0 * 4 && v.y0 < 0 || y < -1e6) { pen = false; continue; }
    const X = v.X(x), Y = v.Y(y);
    if (!pen) { g.moveTo(X, Y); pen = true; } else g.lineTo(X, Y);
  }
  g.stroke(); g.restore();
}
export function dot(o, x, y, color = C.acc, label = "", cur = "grab", draggable = true) {
  const g = o.g; g.save();
  if (draggable) { g.strokeStyle = color; g.lineWidth = 1.5; g.setLineDash([4, 4]); g.lineDashOffset = -(o.t || 0) * 8; g.beginPath(); g.arc(x, y, 15 + 2 * Math.sin((o.t || 0) * 3), 0, 7); g.stroke(); g.setLineDash([]); }
  g.fillStyle = color; g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill();
  if (label) { g.fillStyle = C.ink; g.font = "bold 18px system-ui"; g.fillText(label, x + 12, y - 12); }
  g.restore();
}
export function text(g, s, x, y, color = C.ink, size = 18, align = "left") { g.save(); g.fillStyle = color; g.font = `${size}px system-ui`; g.textAlign = align; g.fillText(s, x, y); g.restore(); }
export function slider(ctx, label, min, max, step, val, on, fmtv) {
  const l = document.createElement("label"), i = document.createElement("input"), s = document.createElement("span");
  i.type = "range"; i.min = min; i.max = max; i.step = step; i.value = val; s.textContent = fmtv ? fmtv(+val) : val;
  i.addEventListener("input", () => { s.textContent = fmtv ? fmtv(+i.value) : i.value; on(+i.value); });
  l.append(label + " ", i, s); ctx.controls.appendChild(l); return i;
}
export function choice(ctx, options, cur, on) {
  const wrap = document.createElement("div"); wrap.style.display = "flex"; wrap.style.gap = "8px";
  options.forEach(([id, fr, en]) => {
    const b = document.createElement("button"); b.textContent = ctx.L ? en : fr; b.setAttribute("aria-pressed", id === cur);
    b.onclick = () => { wrap.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", "false")); b.setAttribute("aria-pressed", "true"); on(id); };
    wrap.appendChild(b);
  });
  ctx.controls.appendChild(wrap);
}
export const snap = (v, s = .5) => Math.round(v / s) * s;
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
