// The canvas engine of the home figures (design v6). A scene (figure-scenes.js) describes the mathematics and the
// drawing; this file owns the canvas, the camera and the pointer. Principles: every degree of freedom is free; the
// parameters and the camera follow their targets with an exponential spring (nothing jumps); a soft magnet pulls to
// integers instead of a hard grid; pan, wheel and pinch zoom toward the pointer; keyboard: H cycles the points, arrows
// move the selected one, + - 0 zoom and recentre. Under reduced motion nothing animates by itself and moves are instant.
const TAU = Math.PI * 2;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lab = (v) => String(+v.toFixed(8)).replace('-', '−');

const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
// Colours are read from the design tokens at draw time (cached until the theme changes).
export const readColors = () => ({
  paper: css('--bg'), ink: css('--ink'), ink2: css('--ink-2'), muted: css('--muted'), grid: css('--grid'), grid2: css('--line'),
  q1: css('--accent'), q2: css('--ink'), q3: css('--q3'), line: css('--line'), ui: css('--ui') || 'sans-serif',
});

export function FigureEngine(stage, first, o = {}) {
  const reduced = !!o.reduced, say = o.say || (() => {});
  const cv = document.createElement('canvas'); cv.tabIndex = 0; cv.setAttribute('role', 'application');
  cv.setAttribute('aria-label', o.label || 'Interactive figure');
  stage.append(cv); const g = cv.getContext('2d');
  let sc = first, cam = { x: 0, y: 0, s: 60 }, camT = { ...cam }, COL = null;
  let W = 0, H = 0, dpr = 1, raf = 0, last = 0, t0 = performance.now(), drag = null, ptr = null, sel = 0, userCam = false, destroyed = false;
  const hintEl = stage.querySelector('.figure-hint'), pts = new Map();
  const V = { g, X: (x) => W / 2 + (x - cam.x) * cam.s, Y: (y) => H / 2 - (y - cam.y) * cam.s, ux: (px, c = cam) => (px - W / 2) / c.s + c.x, uy: (py, c = cam) => c.y - (py - H / 2) / c.s, s: () => cam.s };
  Object.defineProperties(V, { W: { get: () => W }, H: { get: () => H }, ptr: { get: () => ptr }, drag: { get: () => drag }, left: { get: () => V.ux(0) }, right: { get: () => V.ux(W) } });
  // A curve sampled every 1.5 px, flat stroke, no glow.
  V.curve = (fn, x0, x1, col, w = 2.4) => {
    if (x1 <= x0) return; const a = Math.max(x0, V.left - 2 / cam.s), b = Math.min(x1, V.right + 2 / cam.s); if (b <= a) return;
    g.beginPath(); for (let px = V.X(a); px <= V.X(b) + 1.5; px += 1.5) { const x = clamp(V.ux(px), a, b), py = clamp(V.Y(fn(x)), -6000, H + 6000); if (px === V.X(a)) g.moveTo(px, py); else g.lineTo(px, py); }
    g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = col; g.lineWidth = w; g.stroke();
  };
  V.tangent = (px, py, m) => { const len = 110, nx = 1 / Math.hypot(1, m); g.strokeStyle = V.C.ink; g.lineWidth = 1; g.beginPath(); g.moveTo(px - len * nx, py + m * len * nx); g.lineTo(px + len * nx, py - m * len * nx); g.stroke(); g.fillStyle = V.C.ink; g.beginPath(); g.arc(px, py, 3.5, 0, TAU); g.fill(); };
  V.tip = (px, py, txt) => {
    g.font = '14px "STIX Two Text", serif'; const tw = g.measureText(txt).width + 20, bx = clamp(px + 14, 8, W - tw - 8), by = clamp(py - 44, 8, H - 40);
    g.fillStyle = V.C.paper; g.strokeStyle = V.C.ink; g.lineWidth = 1; g.fillRect(bx, by, tw, 26); g.strokeRect(bx + 0.5, by + 0.5, tw, 26);
    g.fillStyle = V.C.ink; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(txt, bx + 10, by + 14);
  };

  function home() { const v = sc.view, bw = v.x1 - v.x0, bh = v.y1 - v.y0; camT.s = clamp(Math.min((W * 0.94) / bw, (H * 0.86) / bh), 18, 420); camT.y = (v.y0 + v.y1) / 2; camT.x = (v.x0 + v.x1) / 2; }
  function resize() { dpr = Math.min(window.devicePixelRatio || 1, 2.5); W = stage.clientWidth; H = stage.clientHeight; if (!W || !H) return; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); if (!userCam) { home(); Object.assign(cam, camT); } wake(); }
  const ro = new ResizeObserver(resize); ro.observe(stage);

  const hit = (px, py, touch) => { let best = null, bd = (touch ? 30 : 20) ** 2; for (const h of sc.handles()) { const d = (V.X(h.x) - px) ** 2 + (V.Y(h.y) - py) ** 2; if (d < bd) { bd = d; best = h; } } return best; };
  function wake() { if (!raf && !destroyed) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  function frame(now) {
    raf = 0; if (destroyed) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
    const k = (rate) => (reduced ? 1 : 1 - Math.exp(-dt * rate)), dragging = drag && drag.k !== 'pan', anim = sc.animating(reduced);
    if (anim) sc.tick(dt, (now - t0) / 1000);
    let moving = sc.settle(k, dragging);
    for (const key of ['x', 'y', 's']) { const d = camT[key] - cam[key]; if (Math.abs(d) > (key === 's' ? 1e-3 : 1e-5)) { cam[key] += d * k(13); moving = true; } else cam[key] = camT[key]; }
    draw(); o.onFrame && o.onFrame(sc);
    if (moving || anim || ptr) raf = requestAnimationFrame(frame);
  }
  function draw() {
    const C = V.C = COL || (COL = readColors()); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    const left = V.left, right = V.right, top = V.uy(0), bot = V.uy(H);
    const raw = 80 / cam.s, p10 = 10 ** Math.floor(Math.log10(raw)); let step = p10; for (const m of [1, 2, 5, 10]) { step = m * p10; if (step >= raw) break; }
    const sub = Math.round(step / p10) === 2 ? 4 : 5, minor = step / sub;
    const lines = (st, col) => {
      g.strokeStyle = col; g.lineWidth = 1; g.beginPath();
      for (let x = Math.floor(left / st) * st; x <= right; x += st) { const px = Math.round(V.X(x)) + 0.5; g.moveTo(px, 0); g.lineTo(px, H); }
      for (let y = Math.floor(bot / st) * st; y <= top; y += st) { const py = Math.round(V.Y(y)) + 0.5; g.moveTo(0, py); g.lineTo(W, py); } g.stroke();
    };
    g.globalAlpha = 0.55; lines(minor, C.grid2); g.globalAlpha = 1; lines(step, C.grid2);
    if (sc.axes) {
      const ax = clamp(V.Y(0), 0, H), ay = clamp(V.X(0), 0, W);
      g.strokeStyle = C.ink; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, Math.round(ax) + 0.5); g.lineTo(W, Math.round(ax) + 0.5); g.moveTo(Math.round(ay) + 0.5, 0); g.lineTo(Math.round(ay) + 0.5, H); g.stroke();
      g.font = '13px ' + C.ui; g.fillStyle = C.muted; g.textAlign = 'center'; g.textBaseline = 'top'; const ty = clamp(ax + 6, 4, H - 18);
      for (let x = Math.ceil(left / step) * step; x <= right; x += step) { if (Math.abs(x) < step / 1e3) continue; g.fillText(lab(x), V.X(x), ty); }
      g.textAlign = ay < 40 ? 'left' : 'right'; g.textBaseline = 'middle'; const tx = ay < 40 ? ay + 7 : ay - 7;
      for (let y = Math.ceil(bot / step) * step; y <= top; y += step) { if (Math.abs(y) < step / 1e3) continue; g.fillText(lab(y), clamp(tx, 6, W - 6), V.Y(y)); }
    }
    V.hov = ptr && !drag ? hit(ptr.x, ptr.y, ptr.touch) : null;
    sc.draw(V);
    g.font = '14px "STIX Two Text", serif';
    sc.handles().forEach((h, i) => {
      const px = V.X(h.x), py = V.Y(h.y), active = (drag && drag.k === h.k) || (V.hov && V.hov.k === h.k), focus = document.activeElement === cv && i === sel;
      if (px < -30 || px > W + 30 || py < -30 || py > H + 30) return;
      if (active || focus) { g.strokeStyle = C.ink; g.lineWidth = 1.5; g.beginPath(); g.arc(px, py, h.root ? 13 : 16, 0, TAU); g.stroke(); }
      g.beginPath(); g.arc(px, py, h.root ? 6.5 : 9, 0, TAU); g.fillStyle = h.root ? C.paper : C[h.c]; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 2; g.stroke();
      if (h.root) { g.fillStyle = C.ink; g.textAlign = 'center'; g.textBaseline = 'bottom'; g.fillText(h.t, px, py - 12); }
      if (sc.labelV && h.k === 'V') { g.fillStyle = C.ink; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText(sc.labelV(), px + 14, py + (sc.below() ? 12 : -28)); }
      if (sc.labels && sc.labels[h.k]) { g.font = 'italic 15px "STIX Two Text", serif'; g.fillStyle = C.ink; g.textAlign = 'center'; g.textBaseline = 'bottom'; g.fillText(sc.labels[h.k], px, py - 14); g.font = '14px "STIX Two Text", serif'; }
    });
    cv.style.cursor = drag ? 'grabbing' : V.hov ? 'grab' : 'crosshair';
  }

  /* ---- input ---- */
  const pos = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, touch: e.pointerType === 'touch' }; };
  let pinch = null;
  const touch = () => { sc.touch(); stage.classList.add('touched'); o.onUser && o.onUser(); };
  cv.addEventListener('keydown', () => stage.classList.add('kbd'), true); cv.addEventListener('pointerdown', () => stage.classList.remove('kbd'), true);
  cv.addEventListener('pointerdown', (e) => {
    cv.setPointerCapture(e.pointerId); const q = pos(e); pts.set(e.pointerId, q); cv.focus({ preventScroll: true }); o.onUser && o.onUser();
    if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: camT.s, wx: V.ux((a.x + b.x) / 2, camT), wy: V.uy((a.y + b.y) / 2, camT) }; drag = null; return; }
    const h = hit(q.x, q.y, q.touch);
    if (h) { touch(); sel = sc.handles().findIndex((x) => x.k === h.k); drag = { k: h.k, ox: h.x - V.ux(q.x), oy: h.y - V.uy(q.y), other: sc.grab(h.k) }; }
    else { drag = { k: 'pan', sx: q.x, sy: q.y, cx: camT.x, cy: camT.y }; userCam = true; }
    wake();
  });
  cv.addEventListener('pointermove', (e) => {
    const q = pos(e); ptr = q; if (pts.has(e.pointerId)) pts.set(e.pointerId, q);
    if (pinch && pts.size === 2) {
      const [a, b] = [...pts.values()], d = Math.hypot(a.x - b.x, a.y - b.y), s = clamp(pinch.s * d / pinch.d, 12, 420), cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
      camT.s = s; camT.x = pinch.wx - (cx - W / 2) / s; camT.y = pinch.wy + (cy - H / 2) / s; Object.assign(cam, camT); userCam = true;
    } else if (drag && drag.k === 'pan') { camT.x = drag.cx - (q.x - drag.sx) / camT.s; camT.y = drag.cy + (q.y - drag.sy) / camT.s; cam.x = camT.x; cam.y = camT.y; }
    else if (drag) { sc.drag(drag.k, V.ux(q.x) + drag.ox, V.uy(q.y) + drag.oy, drag.other, !e.altKey, V); o.onUser && o.onUser(); }
    wake();
  });
  const up = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; drag = null; if (e.pointerType === 'touch') ptr = null; wake(); };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('pointerleave', () => { if (!drag) { ptr = null; wake(); } });
  // The wheel zooms the figure only with Ctrl (or a pinch gesture); a plain wheel scrolls the page, as everywhere on the site.
  cv.addEventListener('wheel', (e) => {
    if (!e.ctrlKey) return; e.preventDefault(); const q = pos(e), s = clamp(camT.s * Math.exp(-e.deltaY * 0.01), 12, 420), wx = V.ux(q.x, camT), wy = V.uy(q.y, camT);
    camT.s = s; camT.x = wx - (q.x - W / 2) / s; camT.y = wy + (q.y - H / 2) / s; userCam = true; o.onUser && o.onUser(); wake();
  }, { passive: false });
  cv.addEventListener('dblclick', () => { userCam = false; home(); wake(); });
  cv.addEventListener('focus', wake); cv.addEventListener('blur', wake);
  cv.addEventListener('keydown', (e) => {
    o.onUser && o.onUser();
    if (e.key === 'h' || e.key === 'H') { sel = (sel + 1) % sc.handles().length; say(sc.names[sel]); wake(); e.preventDefault(); return; }
    if (e.key === '+' || e.key === '=') { camT.s = clamp(camT.s * 1.2, 12, 420); userCam = true; wake(); e.preventDefault(); return; }
    if (e.key === '-') { camT.s = clamp(camT.s / 1.2, 12, 420); userCam = true; wake(); e.preventDefault(); return; }
    if (e.key === '0') { userCam = false; home(); wake(); e.preventDefault(); return; }
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key]; if (!d) return; e.preventDefault(); touch();
    const stp = e.shiftKey ? 1 : 0.1, hs = sc.handles(), k = (hs[sel] || hs[0]).k; sc.nudge(k, d[0] * stp, d[1] * stp, V); say(sc.say(k)); wake();
  });
  function setScene(next) { sc = next; sel = 0; userCam = false; t0 = performance.now(); stage.classList.remove('touched'); if (hintEl) hintEl.textContent = sc.hint; home(); Object.assign(cam, camT); o.onScene && o.onScene(sc); wake(); }
  resize(); if (hintEl) hintEl.textContent = sc.hint; o.onScene && o.onScene(sc); wake();
  return { destroy() { destroyed = true; cancelAnimationFrame(raf); ro.disconnect(); cv.remove(); }, wake, setScene, retheme() { COL = null; wake(); }, get scene() { return sc; } };
}

// Numbers under the figure: built once per set of labels, then only changed cells are rewritten.
export function readouts(host) {
  let built = null, els = [];
  return (sc) => {
    const f = sc.fields(), key = f.map((x) => x[0]).join('|');
    if (key !== built) { built = key; host.innerHTML = f.map(([l]) => `<div><b>${l}</b><span class="val"></span></div>`).join(''); els = [...host.querySelectorAll('.val')]; }
    f.forEach(([, v], i) => { if (els[i].dataset.v !== v) { els[i].dataset.v = v; els[i].innerHTML = v; } });
  };
}
