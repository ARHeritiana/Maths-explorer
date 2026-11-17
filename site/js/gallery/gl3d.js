// Shared WebGL2 stage of the 3D gallery exhibits (hairy ball, Banach-Tarski, napkin ring): a GPU canvas with a transparent 2D
// overlay for labels, a turntable camera (z up) with inertia, pinch and Ctrl + wheel zoom, arrow keys, 0 to reset, picking rays,
// and drawing only while something moves (the shared scheduler of ../visible-loop.js). Returns null without WebGL2: the caller then
// mounts its 2D version. Pure matrix helpers are exported for the tests.
import {palette} from '../object-kit.js';
import {animationLoop} from '../visible-loop.js';

export const TAU = 2 * Math.PI;
// 4x4 matrices, column-major (the GL layout), in Float64Array; uploaded as Float32Array.
export function perspective(fovy, aspect, near, far) {
  const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far), m = new Float64Array(16);
  m[0] = f / aspect; m[5] = f; m[10] = (far + near) * nf; m[11] = -1; m[14] = 2 * far * near * nf; return m;
}
export function lookAt(eye, at, up) {
  const z = norm3(sub3(eye, at)), x = norm3(cross3(up, z)), y = cross3(z, x), m = new Float64Array(16);
  m[0] = x[0]; m[4] = x[1]; m[8] = x[2]; m[1] = y[0]; m[5] = y[1]; m[9] = y[2]; m[2] = z[0]; m[6] = z[1]; m[10] = z[2];
  m[12] = -dot3(x, eye); m[13] = -dot3(y, eye); m[14] = -dot3(z, eye); m[15] = 1; return m;
}
export function mul4(a, b) {
  const m = new Float64Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; m[c * 4 + r] = s; }
  return m;
}
export function invert4(a) {
  const m = new Float64Array(16), [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33] = a;
  const b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12;
  const b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
  const d = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);
  m[0] = (a11 * b11 - a12 * b10 + a13 * b09) * d; m[1] = (a02 * b10 - a01 * b11 - a03 * b09) * d; m[2] = (a31 * b05 - a32 * b04 + a33 * b03) * d; m[3] = (a22 * b04 - a21 * b05 - a23 * b03) * d;
  m[4] = (a12 * b08 - a10 * b11 - a13 * b07) * d; m[5] = (a00 * b11 - a02 * b08 + a03 * b07) * d; m[6] = (a32 * b02 - a30 * b05 - a33 * b01) * d; m[7] = (a20 * b05 - a22 * b02 + a23 * b01) * d;
  m[8] = (a10 * b10 - a11 * b08 + a13 * b06) * d; m[9] = (a01 * b08 - a00 * b10 - a03 * b06) * d; m[10] = (a30 * b04 - a31 * b02 + a33 * b00) * d; m[11] = (a21 * b02 - a20 * b04 - a23 * b00) * d;
  m[12] = (a11 * b07 - a10 * b09 - a12 * b06) * d; m[13] = (a00 * b09 - a01 * b07 + a02 * b06) * d; m[14] = (a31 * b01 - a30 * b03 - a32 * b00) * d; m[15] = (a20 * b03 - a21 * b01 + a22 * b00) * d;
  return m;
}
export const apply4 = (m, [x, y, z], w = 1) => [m[0] * x + m[4] * y + m[8] * z + m[12] * w, m[1] * x + m[5] * y + m[9] * z + m[13] * w, m[2] * x + m[6] * y + m[10] * z + m[14] * w, m[3] * x + m[7] * y + m[11] * z + m[15] * w];
export const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const scale3 = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
export const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const len3 = (a) => Math.hypot(a[0], a[1], a[2]);
export const norm3 = (a) => { const l = len3(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
// first hit of the ray o + s d (s > 0) with the sphere |x - c| = r, or null
export function raySphere(o, d, c = [0, 0, 0], r = 1) {
  const oc = sub3(o, c), b = dot3(oc, d), q = dot3(oc, oc) - r * r, disc = b * b - q;
  if (disc < 0) return null; const s = -b - Math.sqrt(disc); return s > 0 ? add3(o, scale3(d, s)) : null;
}
// a CSS colour (#rgb, #rrggbb, rgb(...)) as linear-light floats for the shaders
export function rgb(css, fallback = [0.5, 0.5, 0.5]) {
  let c = String(css || '').trim(), v = null;
  if (/^#([0-9a-f]{3})$/i.test(c)) c = '#' + c.slice(1).split('').map((x) => x + x).join('');
  if (/^#([0-9a-f]{6})/i.test(c)) v = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);
  else { const m = c.match(/rgba?\(([^)]+)\)/); if (m) v = m[1].split(/[ ,/]+/).slice(0, 3).map((x) => Number(x) / 255); }
  if (!v || v.some((x) => !Number.isFinite(x))) return fallback;
  return v.map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
}
export const isDark = () => { const s = palette().surface, v = rgb(s, [1, 1, 1]); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2] < 0.2; };

// GLSL shared by the exhibits: tone mapping to sRGB and a soft studio light (key, fill, rim, hemisphere sky).
export const GLSL_LIGHT = `
vec3 toSRGB(vec3 c){ c = c / (1.0 + 0.12 * c); return pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2)); }
vec3 studio(vec3 base, vec3 n, vec3 V, float gloss, float specAmt){
  vec3 L1 = normalize(vec3(0.45, -0.35, 0.82)), L2 = normalize(vec3(-0.7, 0.4, 0.25)), L3 = normalize(vec3(-0.2, 0.9, -0.3));
  float d1 = max(dot(n, L1), 0.0), d2 = max(dot(n, L2), 0.0), d3 = max(dot(n, L3), 0.0), nv = max(dot(n, V), 0.0);
  float hemi = mix(0.20, 0.42, n.z * 0.5 + 0.5);
  vec3 col = base * (hemi + 0.78 * d1 + 0.22 * d2 + 0.10 * d3);
  vec3 H1 = normalize(L1 + V), H2 = normalize(L2 + V);
  col += specAmt * (vec3(1.0, 0.97, 0.92) * pow(max(dot(n, H1), 0.0), gloss) + 0.35 * pow(max(dot(n, H2), 0.0), gloss * 0.5));
  col += base * 0.25 * pow(1.0 - nv, 3.0);
  return col;
}`;

export function compile(gl, vs, fs, feedback = null) {
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader'); return s; };
  const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
  if (feedback) gl.transformFeedbackVaryings(p, feedback, gl.INTERLEAVED_ATTRIBS);
  gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link');
  const cache = new Map();
  p.u = (name) => { if (!cache.has(name)) cache.set(name, gl.getUniformLocation(p, name)); return cache.get(name); };
  return p;
}
// A vertex array from named attributes {name: {data, size, divisor, buffer}} and optional 32-bit indices.
export function vao(gl, program, attribs, indices = null) {
  const a = gl.createVertexArray(), buffers = {}; gl.bindVertexArray(a);
  for (const [name, spec] of Object.entries(attribs)) {
    const loc = gl.getAttribLocation(program, name); if (loc < 0) continue;
    const b = spec.buffer || gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    if (!spec.buffer) gl.bufferData(gl.ARRAY_BUFFER, spec.data, spec.usage || gl.STATIC_DRAW);
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, spec.size, gl.FLOAT, false, spec.stride || 0, spec.offset || 0);
    if (spec.divisor) gl.vertexAttribDivisor(loc, spec.divisor); buffers[name] = b;
  }
  let count = 0;
  if (indices) { const b = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW); count = indices.length; }
  gl.bindVertexArray(null);
  return { vao: a, buffers, count };
}
// Latitude-longitude grid of (u, v) in [0,1]^2, (n+1) x (m+1) vertices, as triangles. The caller maps (u, v) to its surface.
export function gridMesh(n, m) {
  const uv = new Float32Array((n + 1) * (m + 1) * 2), idx = new Uint32Array(n * m * 6);
  for (let j = 0, k = 0; j <= m; j++) for (let i = 0; i <= n; i++, k += 2) { uv[k] = i / n; uv[k + 1] = j / m; }
  for (let j = 0, k = 0; j < m; j++) for (let i = 0; i < n; i++) { const a = j * (n + 1) + i, b = a + 1, c = a + n + 1, d = c + 1; idx.set([a, b, d, a, d, c], k); k += 6; }
  return { uv, idx };
}

// opts: {aspect, label (aria), view: {yaw, pitch, dist, target, fov}, minDist, maxDist}
// The exhibit supplies stage.draw(frame) (frame = {gl, view, proj, viewProj, eye, width, height, dpr, dark, C, t}),
// optional stage.update(dt) -> busy, stage.pick(ray, event) -> {move(ray, event), up()} | null, and stage.drawOverlay(g, frame).
export function glStage(host, { aspect = 640 / 440, label = '', view = {}, minDist = 1.5, maxDist = 40, reduced = () => false, scope = null } = {}) {
  const doc = host.ownerDocument, win = doc.defaultView;
  const canvas = doc.createElement('canvas'), overlay = doc.createElement('canvas');
  let gl = null;
  try { gl = canvas.getContext('webgl2', { antialias: true, alpha: false, depth: true, premultipliedAlpha: false, powerPreference: 'high-performance' }); } catch { gl = null; }
  if (!gl || typeof gl.createShader !== 'function') return null;
  host.classList.add('obj-viewport', 'gl-viewport'); host.style.setProperty('--canvas-aspect', String(aspect));
  canvas.className = 'obj-canvas gl-canvas'; canvas.tabIndex = 0; canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', label);
  canvas.style.aspectRatio = String(aspect); overlay.className = 'gl-overlay'; overlay.setAttribute('aria-hidden', 'true');
  host.append(canvas, overlay);
  const home = { yaw: -0.6, pitch: 0.42, dist: 6, target: [0, 0, 0], fov: 0.52, ...view };
  const cam = { ...home, target: [...home.target], vyaw: 0, vpitch: 0 };
  const og = overlay.getContext('2d');
  const stage = { gl, canvas, overlay, cam, home, W: 0, H: 0, dpr: 1, dirty: true, alive: true, draw: () => {}, update: null, pick: null, drawOverlay: null };
  const abort = new win.AbortController(), on = (el, type, fn, o = {}) => el.addEventListener(type, fn, { signal: abort.signal, ...o });
  stage.on = on;
  let frame = null;
  stage.frame = () => frame;
  function matrices() {
    const { yaw, pitch, dist, target, fov } = cam, cp = Math.cos(pitch);
    const eye = add3(target, [dist * cp * Math.cos(yaw), dist * cp * Math.sin(yaw), dist * Math.sin(pitch)]);
    const view = lookAt(eye, target, [0, 0, 1]), proj = perspective(fov, stage.W / Math.max(1, stage.H), Math.max(0.05, dist * 0.05), dist * 8 + 20);
    return { eye, view, proj, viewProj: mul4(proj, view) };
  }
  // world point -> CSS pixels of the overlay ([x, y, depth in 0..1, visible])
  stage.project = (p) => { const m = frame || matrices(), c = apply4(m.viewProj, p); return [(c[0] / c[3] * 0.5 + 0.5) * stage.W, (0.5 - c[1] / c[3] * 0.5) * stage.H, c[2] / c[3] * 0.5 + 0.5, c[3] > 0]; };
  stage.ray = (x, y) => {
    const m = frame || matrices(), inv = invert4(m.viewProj), nx = x / stage.W * 2 - 1, ny = 1 - y / stage.H * 2;
    const a = apply4(inv, [nx, ny, -1]), b = apply4(inv, [nx, ny, 1]), p0 = scale3(a, 1 / a[3]), p1 = scale3(b, 1 / b[3]);
    return { o: m.eye, d: norm3(sub3(p1, p0)) };
  };
  const pointer = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  function resize() {
    const r = canvas.getBoundingClientRect(), w = r.width > 0 ? r.width : 640, h = w / aspect, d = Math.min(win.devicePixelRatio || 1, 2);
    const bw = Math.max(1, Math.min(4096, Math.round(w * d))), bh = Math.max(1, Math.round(bw / aspect));
    stage.W = w; stage.H = h; stage.dpr = bw / w;
    if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; overlay.width = bw; overlay.height = bh; }
    stage.wake();
  }
  stage.wake = () => { stage.dirty = true; loop?.wake(0); };
  // ---- gestures: drag turns the view unless the exhibit claims the press; two fingers pinch; Ctrl + wheel zooms
  const pts = new Map(); let tool = null, orbit = null, pinch = null, lastMove = 0;
  on(canvas, 'pointerdown', (e) => {
    canvas.focus({ preventScroll: true }); canvas.setPointerCapture?.(e.pointerId); pts.set(e.pointerId, pointer(e));
    if (pts.size === 2) { tool?.up?.(); tool = null; orbit = null; const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), dist: cam.dist }; return; }
    const [x, y] = pointer(e), claimed = stage.pick?.(stage.ray(x, y), e, [x, y]);
    if (claimed) { tool = claimed; } else { orbit = { p: [x, y] }; cam.vyaw = cam.vpitch = 0; }
    e.preventDefault(); stage.wake();
  });
  on(canvas, 'pointermove', (e) => {
    if (!pts.has(e.pointerId)) { if (stage.hover) { const [x, y] = pointer(e); stage.hover(stage.ray(x, y), [x, y]); } return; }
    pts.set(e.pointerId, pointer(e));
    if (pinch && pts.size >= 2) { const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); cam.dist = clamp(pinch.dist * pinch.d / Math.max(1, d), minDist, maxDist); stage.wake(); return; }
    const [x, y] = pointer(e);
    if (tool) { tool.move?.(stage.ray(x, y), e, [x, y]); stage.wake(); return; }
    if (orbit) {
      const dx = x - orbit.p[0], dy = y - orbit.p[1], now = performance.now(), dt = Math.max(1, now - lastMove) / 1000; lastMove = now;
      const k = 3.2 / Math.max(240, stage.W);
      cam.yaw -= dx * k; cam.pitch = clamp(cam.pitch + dy * k, -1.5, 1.5);
      cam.vyaw = -dx * k / dt; cam.vpitch = dy * k / dt; orbit.p = [x, y]; stage.wake();
    }
  });
  const release = (e) => {
    pts.delete(e.pointerId); if (pts.size < 2) pinch = null;
    if (tool) { tool.up?.(); tool = null; }
    if (orbit) { if (performance.now() - lastMove > 80 || reduced()) cam.vyaw = cam.vpitch = 0; orbit = null; }
    stage.wake();
  };
  on(canvas, 'pointerup', release); on(canvas, 'pointercancel', release); on(canvas, 'lostpointercapture', (e) => { if (pts.has(e.pointerId)) release(e); });
  on(canvas, 'wheel', (e) => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); cam.dist = clamp(cam.dist * Math.exp(e.deltaY * 0.0022), minDist, maxDist); stage.wake(); }, { passive: false });
  on(canvas, 'dblclick', () => stage.reset());
  on(canvas, 'keydown', (e) => {
    if (stage.key?.(e)) { e.preventDefault(); stage.wake(); return; }
    const k = e.key; let used = true;
    if (k === 'ArrowLeft') cam.yaw += 0.1; else if (k === 'ArrowRight') cam.yaw -= 0.1;
    else if (k === 'ArrowUp') cam.pitch = clamp(cam.pitch - 0.08, -1.5, 1.5); else if (k === 'ArrowDown') cam.pitch = clamp(cam.pitch + 0.08, -1.5, 1.5);
    else if (k === '+' || k === '=') cam.dist = clamp(cam.dist / 1.12, minDist, maxDist); else if (k === '-') cam.dist = clamp(cam.dist * 1.12, minDist, maxDist);
    else if (k === '0') stage.reset(); else used = false;
    if (used) { e.preventDefault(); cam.vyaw = cam.vpitch = 0; stage.wake(); }
  });
  stage.reset = () => { Object.assign(cam, { ...home, target: [...home.target], vyaw: 0, vpitch: 0 }); stage.wake(); };
  canvas.style.touchAction = 'none';
  // ---- frame
  let lost = false;
  on(canvas, 'webglcontextlost', (e) => { e.preventDefault(); lost = true; });
  on(canvas, 'webglcontextrestored', () => { lost = false; stage.restore?.(); stage.wake(); });
  function tick(dt) {
    if (!stage.alive || lost) return false;
    let busy = false;
    if (!orbit && (Math.abs(cam.vyaw) > 1e-3 || Math.abs(cam.vpitch) > 1e-3) && dt > 0) {
      cam.yaw += cam.vyaw * dt; cam.pitch = clamp(cam.pitch + cam.vpitch * dt, -1.5, 1.5);
      const damp = Math.exp(-dt * 3.2); cam.vyaw *= damp; cam.vpitch *= damp; busy = true; stage.dirty = true;
    } else if (!orbit) { cam.vyaw = cam.vpitch = 0; }
    if (stage.update) { const b = stage.update(dt); if (b) { busy = true; stage.dirty = true; } }
    if (stage.dirty) {
      stage.dirty = false;
      const C = palette(), dark = isDark();
      frame = { gl, ...matrices(), width: canvas.width, height: canvas.height, dpr: stage.dpr, dark, C, W: stage.W, H: stage.H };
      gl.viewport(0, 0, canvas.width, canvas.height);
      const bg = rgb(C.sunken, dark ? [0.02, 0.02, 0.03] : [0.92, 0.9, 0.86]).map((x) => x ** (1 / 2.2));
      gl.clearColor(bg[0], bg[1], bg[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.disable(gl.BLEND); gl.depthMask(true);
      stage.draw(frame);
      og.setTransform(1, 0, 0, 1, 0, 0); og.clearRect(0, 0, overlay.width, overlay.height);
      if (stage.drawOverlay) { og.setTransform(stage.dpr, 0, 0, stage.dpr, 0, 0); stage.drawOverlay(og, frame); }
    }
    return busy || !!orbit || !!tool || !!pinch;
  }
  let loop = null;
  stage.start = () => { loop = animationLoop(host, tick, { reduced, scope }); resize(); };
  if (win.ResizeObserver) { const ro = new win.ResizeObserver(resize); ro.observe(canvas); stage.disconnect = () => ro.disconnect(); }
  on(win, 'resize', resize);
  const mq = win.matchMedia?.('(prefers-color-scheme: dark)'); mq?.addEventListener?.('change', () => stage.wake(), { signal: abort.signal });
  const mo = new win.MutationObserver(() => stage.wake()); mo.observe(doc.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-contrast'] });
  stage.destroy = () => { stage.alive = false; loop?.stop(); abort.abort(); mo.disconnect(); stage.disconnect?.(); try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch { /* gone */ } };
  return stage;
}
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

// The page around a 3D exhibit: help line, stage, measurement strip slot, controls, live readout, notes (same classes as gallery-kit.js).
export function glExhibit(root, { t }, help, controls = '', notes = '') {
  root.innerHTML = `<p class="act-help">${help}</p><div class="obj-stage exhibit-stage gl-stage"></div><div class="act-controls exhibit-controls">${controls}</div><p class="act-readout exhibit-readout" role="status" aria-live="polite"></p>${notes ? `<details class="exhibit-notes"><summary>${t('Observer, puis comprendre', 'Observe, then understand')}</summary>${notes}</details>` : ''}`;
  let last = '';
  return { host: root.querySelector('.exhibit-stage'), read: (s) => { if (s !== last) { last = s; root.querySelector('.exhibit-readout').textContent = s; } } };
}
export const webgl2 = (doc = globalThis.document) => { try { const c = doc.createElement('canvas'), g = c.getContext('webgl2'); const ok = !!g && typeof g.createShader === 'function'; g?.getExtension('WEBGL_lose_context')?.loseContext(); return ok; } catch { return false; } };
