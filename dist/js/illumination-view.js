// The mirrored room on a canvas, shared by the gallery exhibit (js/gallery/gallery-room.js) and the laboratory template
// (js/lab/templates/illumination.js). It draws the room as a night scene: the floor the lamp lights (beams of
// illumination-light.js, traced in a worker), the dark patches hatched and numbered, the rays (up to the device ceiling of
// device-capability.js; beyond 1,440 rays a worker farm and a GPU density map), the mirrors, the lamp, and an editor for one's
// own room (grid snapping, add, insert, drag, delete, close, curved walls, undo). State lives in the caller (get/set), so the
// gallery and the laboratory share deep links and missions. Dark patches are evidence from finitely many directions and
// reflections, never a proof of darkness: every text that shows them says so.
import * as M from './illumination-model.js';
import { PRESETS } from './illumination-presets.js';
import { lightMap, litUpTo, coverage, crossings, nearestOnSegment, snapTo, NEVER } from './illumination-light.js';
import { model, boundary, device, SYNC_MAX } from './lab/experiments/illumination.js';
import { createDensityMap } from './illumination-gl.js';
import { createFarm, moduleWorker, inlineWorker, traceChunk } from './illumination-farm.js';
import { capability, LIMITS } from './device-capability.js';
import { assetHref } from './data-loader.js';

// A night scene in both themes (a picture of a dark room), with its own contrast-checked colours.
export const NIGHT = { outside: '#0f1217', floor: '#1d2431', light: '#f6d36b', direct: '#fff1b8', ray: '#ff7a2f', rayDark: '#ffb24a', wall: '#e9edf3', bad: '#ff4d5e',
  dark: '#69d2ff', grid: 'rgba(255,255,255,0.13)', vertex: '#ffffff', selected: '#ff5560', text: '#f4f6fa', lamp: '#ffe066' };
export const CUSTOM = ['polygon', 'curved'];
export const SNAP = 0.5;
const MAX_VERTICES = 40;
// Light budget (rays traced for the beams) by device tier, at rest; while something is dragged a coarse light is computed here.
const LIGHT = { basic: 2500, standard: 3500, high: 5000, extreme: 8000 };
const RES = 320, COARSE_RES = 140;   // cells along the longer side of the room
const COARSE = { rays: 120, depth: 3, budget: 600, bounces: 10 };
export const bboxOf = (edges) => { const q = M.flatten(edges, 24); let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; for (const [x, y] of q) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } return [x0, x1, y0, y1]; };
export const isCustom = (s) => CUSTOM.includes(s.room);
export const frameOf = (s) => (isCustom(s) ? (s.frame || PRESETS.polygon.bounds) : PRESETS[s.room].bounds);
export const lightBounces = (s) => Math.max(0, Math.min(s.bounces, device.limits.bounces, 200));

export function createRoomView(host, { t, fmt, get, set, reduced = () => false, onStats = () => {}, label = '' }) {
  host.classList.add('room-canvas-host');
  const cv = document.createElement('canvas'); cv.className = 'room-canvas'; cv.tabIndex = 0; cv.setAttribute('role', 'application');
  cv.setAttribute('aria-roledescription', t('pièce de miroirs interactive', 'interactive mirrored room'));
  cv.setAttribute('aria-label', label || t('Pièce de miroirs. Flèches : déplacer la lampe ou le point choisi ; N : point suivant ; Suppr : retirer un sommet ; Ctrl+Z : annuler ; + et − : zoom ; 0 : vue entière.', 'Mirrored room. Arrows: move the lamp or the chosen point; N: next point; Delete: remove a vertex; Ctrl+Z: undo; + and −: zoom; 0: whole view.'));
  host.append(cv);
  const g = cv.getContext('2d'), listeners = [], on = (el, type, fn, o = false) => { el.addEventListener(type, fn, o); listeners.push([el, type, fn, o]); };
  let W = 640, H = 440, dpr = 1, alive = true, raf = 0, dirty = true;
  const view = { tool: 'lamp', light: true, rays: true, snap: true, upTo: Infinity, cam: { s: 1, x: 0, y: 0 } };
  let selected = { type: 'lamp' }, drag = null, hover = null, history = [], future = [], elapsed = Infinity, lastT = 0, lightTimer = 0, playTimer = 0;
  // ---- geometry: room units to canvas pixels
  const fit = () => { const b = frameOf(get()), S = Math.min(W / (b[1] - b[0]), H / (b[3] - b[2])) * 0.9; return { S: S * view.cam.s, cx: (b[0] + b[1]) / 2, cy: (b[2] + b[3]) / 2 }; };
  const screen = (p, f = fit()) => [W / 2 + view.cam.x + (p[0] - f.cx) * f.S, H / 2 + view.cam.y + (p[1] - f.cy) * f.S];
  const world = (q, f = fit()) => [(q[0] - W / 2 - view.cam.x) / f.S + f.cx, (q[1] - H / 2 - view.cam.y) / f.S + f.cy];
  const pointer = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
  const resize = () => { const r = host.getBoundingClientRect(); const w = Math.max(200, Math.round(r.width)), h = Math.max(160, Math.round(r.height)); dpr = Math.min(2.5, globalThis.devicePixelRatio || 1); if (w === W && h === H && cv.width === Math.round(w * dpr)) return; W = w; H = h; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); dirty = true; };
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => { resize(); }) : null; ro?.observe(host); resize();
  // ---- the room in the state
  const edgesOf = (s) => boundary(s);
  const validation = (s) => {
    const edges = edgesOf(s), custom = isCustom(s);
    if (custom && s.vertices.length < 3) return { ok: false, reason: 'few', edges, bad: [] };
    const bad = custom ? crossings(s.closed ? edges : edges.slice(0, -1), s.closed) : [];   // an open outline has no closing wall yet
    if (custom && bad.length) return { ok: false, reason: 'crossing', edges, bad };
    if (custom && !s.closed) return { ok: false, reason: 'open', edges, bad };
    const v = custom ? M.validate(edges) : { ok: true };
    return { ok: v.ok, reason: v.ok ? '' : v.reason, edges, bad };
  };
  const lampIn = (s, edges) => M.inside([s.sx, s.sy], M.flatten(edges, 48)) && !edges.some((e) => M.onBoundary([s.sx, s.sy], e, 1e-6));
  // ---- undo
  const snapshot = () => { const s = get(); return { room: s.room, vertices: s.vertices.map((p) => [...p]), bends: s.bends.map((p) => p && [...p]), closed: s.closed, frame: s.frame, sx: s.sx, sy: s.sy }; };
  const remember = () => { history.push(snapshot()); if (history.length > 80) history.shift(); future = []; };
  const apply = (snap) => { set({ ...snap, playing: false, unfolding: false }); dirty = true; };
  const roomFor = (bends) => (bends.some(Boolean) ? 'curved' : 'polygon');
  // ---- the light: beams in a worker at rest, a coarse version here while dragging
  let light = null, lightKey = '', lightJob = 0, worker = null, workerFailed = false, computing = false, stats = null, raster = null;
  const lightOptions = (s, coarse, edges) => {
    const b = bboxOf(edges), diag = Math.hypot(b[1] - b[0], b[3] - b[2]);
    if (coarse) return { rays: COARSE.rays, bounces: Math.min(lightBounces(s), COARSE.bounces), angle: s.angle, depth: COARSE.depth, budget: COARSE.budget, gap: diag / 30 };
    return { rays: 720, bounces: lightBounces(s), angle: s.angle, depth: 8, budget: LIGHT[device.tier] || LIGHT.basic, gap: diag / 110 };
  };
  const makeWorker = () => { if (workerFailed || typeof Worker !== 'function') return null; try { const w = new Worker(assetHref('./js/illumination-light-worker.js'), { type: 'module' }); w.onerror = () => { workerFailed = true; w.terminate(); worker = null; if (computing) { lightKey = ''; dirty = true; } }; return w; } catch { workerFailed = true; return null; } };
  function requestLight(s, edges, key) {
    const id = ++lightJob, options = lightOptions(s, false, edges), source = [s.sx, s.sy];
    computing = true;
    const done = (r) => { if (!alive || id !== lightJob) return; light = { grid: r.grid, level: r.level, traced: r.traced, exhausted: r.exhausted, bounces: r.bounces, coarse: false, key }; computing = false; raster = null; dirty = true; };
    if (!worker) worker = makeWorker();
    if (worker) { worker.onmessage = (e) => { if (e.data.id === id) done(e.data); }; worker.postMessage({ id, edges, source, options, res: RES }); }
    else setTimeout(() => { if (id === lightJob) done(lightMap(edges, source, options, RES)); }, 0);
  }
  function updateLight(s, valid) {
    if (!valid) { light = null; computing = false; lightKey = ''; return; }
    const edges = valid.edges, key = JSON.stringify([s.room, s.vertices, s.bends, s.closed, s.sx, s.sy, s.angle, lightBounces(s), device.tier]);
    if (key === lightKey) return;
    lightKey = key; clearTimeout(lightTimer);
    if (drag) {   // a coarse light at once, the fine one when the hand stops
      const r = lightMap(edges, [s.sx, s.sy], lightOptions(s, true, edges), COARSE_RES);
      light = { ...r, coarse: true, key }; raster = null; computing = true; lightJob++;
      lightTimer = setTimeout(() => { if (alive && !drag && lightKey === key) requestLight(get(), edges, key); }, 160);
    } else requestLight(s, edges, key);
  }
  // Lit cells after the reflections shown, the dark patches, and two pictures of the grid: the lit floor (direct light paler than
  // reflected light) and the mask of the listed dark patches (for the hatching). Cached until the light or the reflections change.
  const rgb255 = (c) => { const v = parseInt(c.slice(1), 16); return [v >> 16, v >> 8 & 255, v & 255]; };
  const DIRECT = rgb255(NIGHT.direct), REFLECTED = rgb255(NIGHT.light);
  function measure() {
    if (!light) return null;
    const upTo = Math.min(view.upTo, light.bounces), key = light.key + '|' + light.coarse + '|' + upTo;
    if (raster && raster.key === key) return raster.value;
    const grid = light.grid, lit = litUpTo(light.level, upTo), c = coverage(grid, lit, { minCells: light.coarse ? 3 : 8, marks: true });
    const picture = (paint) => { const m = document.createElement('canvas'); m.width = grid.cols; m.height = grid.rows; const mg = m.getContext('2d'), img = mg.createImageData(grid.cols, grid.rows); for (let i = 0; i < lit.length; i++) { const col = paint(i); if (col) { img.data[4 * i] = col[0]; img.data[4 * i + 1] = col[1]; img.data[4 * i + 2] = col[2]; img.data[4 * i + 3] = 255; } } mg.putImageData(img, 0, 0); return m; };
    const WHITE = [255, 255, 255];
    raster = { key, value: { ...c, grid, upTo, mask: picture((i) => (c.dark[i] ? WHITE : null)), litPicture: picture((i) => (lit[i] ? (light.level[i] === 0 ? DIRECT : REFLECTED) : null)) } };
    return raster.value;
  }
  const gridAt = (pic, grid, f, k) => { const o = screen([grid.x0, grid.y0], f), sc = f.S * grid.h; k.imageSmoothingEnabled = true; k.drawImage(pic, o[0], o[1], grid.cols * sc, grid.rows * sc); };
  // ---- many rays: worker farm and density map (unchanged method, now drawn on the night floor)
  let density = null, densityTried = false, farm = null, farmKey = '', farmStats = null, farmDone = false, chunks = [], affineKey = '';
  const makeFarmWorker = () => { if (typeof Worker === 'function') { try { return moduleWorker(assetHref('./js/illumination-worker.js')); } catch { /* fall back */ } } return inlineWorker(); };
  const rgb = (c) => { const v = parseInt(c.slice(1), 16); return [(v >> 16) / 255, (v >> 8 & 255) / 255, (v & 255) / 255]; };
  function drawMany(s, m) {
    const f = fit(), o = screen([0, 0], f), ax = screen([1, 0], f), ay = screen([0, 1], f), affine = { ox: o[0], oy: o[1], sx: ax[0] - o[0], sy: ay[1] - o[1] };
    const rays = drag ? Math.min(m.rays, 3000) : m.rays, bounces = Math.min(drag ? Math.min(s.bounces, 100) : s.bounces, device.limits.bounces);
    const jobKey = JSON.stringify([s.room, s.sx, s.sy, s.vertices, s.bends, s.angle, rays, bounces]), aKey = JSON.stringify([affine, cv.width, cv.height]);
    if (jobKey !== farmKey) {
      farmKey = jobKey; affineKey = aKey; chunks = []; farmDone = false; farmStats = { rays: 0, segments: 0, corners: 0, tangents: 0, length: 0, capped: false };
      if (!density.reset(cv.width, cv.height)) return;
      if (!farm) farm = createFarm({ make: makeFarmWorker, workers: Math.max(1, device.workers) });
      const mine = jobKey, area = Math.abs(roomArea(m.edges) * affine.sx * affine.sy);
      farm.run({ edges: m.edges, source: m.source, angle: s.angle, rays, bounces, segmentCap: device.limits.segments,
        onChunk: (c) => { if (mine !== farmKey || !alive) return; chunks.push(c.segments); density.add({ segments: c.segments, count: c.count, size: [W, H], world: affine }); for (const k of ['rays', 'corners', 'tangents', 'length']) farmStats[k] += c[k]; farmStats.segments += c.count; farmStats.area = area; dirty = true; },
        onDone: (st) => { if (mine !== farmKey || !alive) return; farmStats.capped = st.capped; farmDone = true; dirty = true; } });
    } else if (aKey !== affineKey) { affineKey = aKey; if (density.reset(cv.width, cv.height)) for (const c of chunks) density.add({ segments: c, count: c.length / 4, size: [W, H], world: affine }); }
    const fs = farmStats, expected = fs.rays ? fs.length / fs.rays * rays * Math.abs(affine.sx) / Math.max(1, fs.area || 1) : 1;
    const img = density.present({ color: rgb(NIGHT.rayDark), gain: Math.min(40, Math.max(0.0005, 2.2 / Math.max(1e-6, expected))) });
    if (img) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = view.light ? 0.75 : 1; g.drawImage(img, 0, 0, cv.width, cv.height); g.restore(); }
  }
  const roomArea = (edges) => { const q = M.flatten(edges); let a = 0; for (let i = 0; i < q.length; i++) { const p = q[i], r = q[(i + 1) % q.length]; a += p[0] * r[1] - r[0] * p[1]; } return Math.abs(a) / 2; };
  // ---- device measurement (once per session, shared with the laboratory)
  const probeWork = () => { const p = PRESETS.tokarsky; return traceChunk(p.edges, p.source, 0.1, 24, 0, 24, 80).count; };
  capability({ kind: 'illumination', work: probeWork }).then((r) => { if (!alive) return; Object.assign(device, { tier: r.tier, limits: r.limits, workers: r.workers, reasons: r.reasons, ready: true }); lightKey = ''; dirty = true; api.onDevice?.(); }).catch(() => { device.ready = true; });
  // ---- drawing
  const hatch = (() => { const c = document.createElement('canvas'); c.width = c.height = 12; const h = c.getContext('2d'); h.fillStyle = 'rgba(105,210,255,0.22)'; h.fillRect(0, 0, 12, 12); h.strokeStyle = NIGHT.dark; h.lineWidth = 2.2; h.beginPath(); for (const d of [-12, 0, 12]) { h.moveTo(d, 12); h.lineTo(d + 12, 0); } h.stroke(); return c; })();
  const tmp = document.createElement('canvas');
  function roomPath(edges, f, close = true) { const pts = M.flatten(edges, 64).map((p) => screen(p, f)); g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); if (close) g.closePath(); }
  function drawRay(points, distance, f, alpha, color) {
    let budget = distance; g.beginPath(); const a0 = screen(points[0], f); g.moveTo(a0[0], a0[1]);
    for (let i = 1; i < points.length && budget > 0; i++) { const a = points[i - 1], b = points[i], L = Math.hypot(a[0] - b[0], a[1] - b[1]), k = Math.min(1, budget / L), q = screen([a[0] + k * (b[0] - a[0]), a[1] + k * (b[1] - a[1])], f); g.lineTo(q[0], q[1]); budget -= L; }
    g.globalAlpha = alpha; g.strokeStyle = color; g.lineWidth = 1.3; g.stroke(); g.globalAlpha = 1;
  }
  function label(text, p, color = NIGHT.text, bg = 'rgba(15,18,23,0.82)') {
    g.font = '600 13px system-ui, sans-serif'; const w = g.measureText(text).width + 10; g.fillStyle = bg; g.fillRect(p[0] - w / 2, p[1] - 10, w, 20); g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, p[0], p[1] + 0.5);
  }
  function handles(s) {
    const out = [{ type: 'lamp', p: [s.sx, s.sy] }];
    if (isCustom(s) && view.tool !== 'lamp') {
      if (view.tool === 'draw') s.vertices.forEach((p, i) => out.push({ type: 'vertex', i, p }));
      if (view.tool === 'curve' && s.closed) s.vertices.forEach((p, i) => { const q = s.vertices[(i + 1) % s.vertices.length]; out.push({ type: 'bend', i, p: s.bends[i] || [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2] }); });
    }
    return out;
  }
  const same = (a, b) => a && b && a.type === b.type && (a.i ?? -1) === (b.i ?? -1);
  function frame(now) {
    if (!alive) return; raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - lastT) / 1000 || 0); lastT = now; const s = get();
    if (s.playing) { if (reduced()) { set({ playing: false }); elapsed = Infinity; } else { elapsed += dt * s.speed; dirty = true; } }
    const key = JSON.stringify(s); if (key !== frame.key) { frame.key = key; dirty = true; }
    if (!dirty || document.hidden) return; dirty = false; draw(s);
  }
  function draw(s) {
    const f = fit(), v = validation(s), edges = v.edges, custom = isCustom(s), inRoom = v.ok && lampIn(s, edges);
    updateLight(s, v.ok && inRoom ? v : null);
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = NIGHT.outside; g.fillRect(0, 0, W, H);
    // floor
    if (v.ok || (custom && s.closed && s.vertices.length >= 3)) { roomPath(edges, f); g.fillStyle = NIGHT.floor; g.fill(); }
    const cov = v.ok && inRoom && view.light ? measure() : null;
    if (view.tool !== 'lamp' && custom) {   // grid of the editor
      const a = world([0, 0], f), b = world([W, H], f); g.fillStyle = NIGHT.grid;
      for (let x = Math.ceil(a[0] / SNAP) * SNAP; x <= b[0]; x += SNAP) for (let y = Math.ceil(a[1] / SNAP) * SNAP; y <= b[1]; y += SNAP) { const p = screen([x, y], f), r = Math.abs(x % 1) < 1e-9 && Math.abs(y % 1) < 1e-9 ? 1.8 : 1.1; g.fillRect(p[0] - r / 2, p[1] - r / 2, r, r); }
    }
    if (v.ok && inRoom && view.light && light) {
      g.save(); roomPath(edges, f); g.clip();
      g.globalAlpha = light.coarse ? 0.85 : 1; if (cov) gridAt(cov.litPicture, cov.grid, f, g); g.globalAlpha = 1;
      if (cov && cov.patches.length) {   // dark patches: hatched through the mask of the grid, numbered
        tmp.width = cv.width; tmp.height = cv.height; const k = tmp.getContext('2d'); k.setTransform(dpr, 0, 0, dpr, 0, 0); k.imageSmoothingEnabled = true;
        gridAt(cov.mask, cov.grid, f, k);
        k.globalCompositeOperation = 'source-in'; k.setTransform(1, 0, 0, 1, 0, 0); k.fillStyle = k.createPattern(hatch, 'repeat') || NIGHT.dark; k.fillRect(0, 0, tmp.width, tmp.height);
        g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(tmp, 0, 0); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      g.restore();
    }
    // rays
    const m = v.ok && inRoom ? model(s) : null;
    if (m && view.rays && !s.unfolding) {
      if (m.deferred) { if (!densityTried) { densityTried = true; density = createDensityMap(); if (!density) { device.limits = LIMITS.basic; device.tier = 'basic'; device.reasons = ['no float GPU buffer']; } } if (density && !density.lost) { g.save(); roomPath(edges, f); g.clip(); drawMany(s, m); g.restore(); } }
      else { const n = Math.max(1, m.segments), alpha = Math.max(0.05, Math.min(0.9, (view.light ? 6 : 16) / Math.sqrt(n))), color = view.light ? NIGHT.ray : NIGHT.rayDark; g.save(); roomPath(edges, f); g.clip(); for (const p of m.paths) drawRay(p.points, elapsed, f, alpha, color); g.restore(); }
    }
    if (m && s.unfolding && m.paths[0]) { const u = M.unfold(m.edges, m.paths[0]); if (u) { u.copies.slice(1, 10).forEach((c) => { g.beginPath(); c.forEach((p, i) => { const q = screen(p, f); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.closePath(); g.strokeStyle = 'rgba(233,237,243,0.35)'; g.lineWidth = 1; g.stroke(); }); g.beginPath(); u.points.forEach((p, i) => { const q = screen(p, f); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.strokeStyle = NIGHT.rayDark; g.lineWidth = 2; g.stroke(); } }
    // walls
    if (edges.length) {
      roomPath(edges, f, !custom || s.closed); g.strokeStyle = NIGHT.wall; g.lineWidth = 3; g.lineJoin = 'round'; g.stroke();
      const badEdges = new Set(v.bad.flat()); for (const i of badEdges) { const e = edges[i]; if (!e) continue; g.beginPath(); M.flatten([e], 32).concat([M.pointAt(e, 1)]).forEach((p, k) => { const q = screen(p, f); k ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.strokeStyle = NIGHT.bad; g.lineWidth = 5; g.stroke(); }
      if (custom && !s.closed && s.vertices.length) {   // the wall that closing would add, and the next wall under the pointer
        const a = screen(s.vertices.at(-1), f), z = screen(s.vertices[0], f); g.setLineDash([6, 6]); g.strokeStyle = 'rgba(233,237,243,0.5)'; g.lineWidth = 2;
        if (s.vertices.length >= 3) { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(z[0], z[1]); g.stroke(); }
        if (hover && view.tool === 'draw' && !drag) { const h = screen(hover, f); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(h[0], h[1]); g.stroke(); }
        g.setLineDash([]);
      }
    }
    // marks of the presets: foci, the unlit point T of the polygonal constructions
    const preset = PRESETS[s.room];
    if (preset?.foci && !custom) for (const p of preset.foci) { const q = screen(p, f); g.fillStyle = NIGHT.text; g.beginPath(); g.arc(q[0], q[1], 2.6, 0, 7); g.fill(); g.font = '600 11px system-ui, sans-serif'; g.textAlign = 'left'; g.fillText('F', q[0] + 5, q[1] - 6); }
    if (preset?.target) { const q = screen(preset.target, f); g.strokeStyle = NIGHT.dark; g.lineWidth = 2.5; g.beginPath(); g.arc(q[0], q[1], 9, 0, 7); g.stroke(); g.fillStyle = NIGHT.dark; g.beginPath(); g.arc(q[0], q[1], 3, 0, 7); g.fill(); label('T', [q[0], q[1] - 22], NIGHT.dark); }
    if (cov) cov.patches.slice(0, 9).forEach((p, i) => { const q = screen(p.centre, f); g.fillStyle = NIGHT.dark; g.beginPath(); g.arc(q[0], q[1], 11, 0, 7); g.fill(); g.fillStyle = '#06121a'; g.font = '700 12px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(i + 1), q[0], q[1] + 0.5); });
    // handles
    for (const h of handles(s)) {
      const q = screen(h.p, f), chosen = same(h, selected);
      if (h.type === 'lamp') {
        const r = 10, glow = g.createRadialGradient(q[0], q[1], 0, q[0], q[1], 34);
        if (glow) { glow.addColorStop(0, 'rgba(255,224,102,0.75)'); glow.addColorStop(1, 'rgba(255,224,102,0)'); g.fillStyle = glow; g.beginPath(); g.arc(q[0], q[1], 34, 0, 7); g.fill(); }
        g.fillStyle = inRoom || !v.ok ? NIGHT.lamp : NIGHT.bad; g.beginPath(); g.arc(q[0], q[1], r, 0, 7); g.fill(); g.lineWidth = 2.5; g.strokeStyle = chosen ? NIGHT.selected : '#2a2207'; g.stroke();
        g.fillStyle = '#2a2207'; g.font = '700 11px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('S', q[0], q[1] + 0.5);
      } else if (h.type === 'vertex') {
        const first = h.i === 0 && !s.closed && s.vertices.length >= 3, r = first ? 8 : 6; g.fillStyle = chosen ? NIGHT.selected : NIGHT.vertex; g.fillRect(q[0] - r, q[1] - r, 2 * r, 2 * r); g.strokeStyle = '#0f1217'; g.lineWidth = 1.5; g.strokeRect(q[0] - r, q[1] - r, 2 * r, 2 * r);
        if (first) { g.strokeStyle = NIGHT.dark; g.lineWidth = 2; g.strokeRect(q[0] - r - 4, q[1] - r - 4, 2 * r + 8, 2 * r + 8); }
      } else {
        const a = screen(s.vertices[h.i], f), b = screen(s.vertices[(h.i + 1) % s.vertices.length], f); g.setLineDash([4, 4]); g.strokeStyle = 'rgba(233,237,243,0.45)'; g.lineWidth = 1; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(q[0], q[1]); g.lineTo(b[0], b[1]); g.stroke(); g.setLineDash([]);
        g.save(); g.translate(q[0], q[1]); g.rotate(Math.PI / 4); g.fillStyle = chosen ? NIGHT.selected : (s.bends[h.i] ? NIGHT.dark : NIGHT.vertex); g.fillRect(-6, -6, 12, 12); g.restore();
      }
    }
    // what the caller shows (chips, readout)
    const farm = m?.deferred && view.rays && farmStats ? { ...farmStats, done: farmDone } : null;
    stats = { valid: v.ok, reason: v.reason, crossings: v.bad.length, inRoom, custom, closed: s.closed, vertices: s.vertices.length, computing, coarse: !!light?.coarse,
      litShare: cov ? cov.litShare : null, patches: cov ? cov.patches : [], area: cov ? cov.area : null, traced: light?.traced || 0, never: NEVER, exhausted: !!light?.exhausted, lightBounces: light ? Math.min(view.upTo, light.bounces) : null,
      rays: m ? m.rays : 0, segments: m ? m.segments : 0, corners: m ? m.corners : 0, tangencies: m ? m.tangencies : 0, deferred: !!m?.deferred, farm, selected: { ...selected, p: handles(s).find((h) => same(h, selected))?.p }, tier: device.tier };
    onStats(stats);
  }
  // ---- pointer editing
  const hitRadius = (e) => (e.pointerType === 'touch' ? 26 : 16);
  function hit(s, q, r) { let best = null; for (const h of handles(s)) { if (h.type === 'lamp' && view.tool === 'draw' && isCustom(s) && !s.closed) continue; const p = screen(h.p), d = Math.hypot(p[0] - q[0], p[1] - q[1]); if (d < r && (!best || d < best.d || (h.type !== 'lamp' && best.h.type === 'lamp' && d < r * 0.6))) best = { h, d }; } return best?.h || null; }
  // a point well inside the room (the centroid when it is inside, else the sampled point farthest from the walls)
  function interiorPoint(edges) {
    const poly = M.flatten(edges, 24), b = bboxOf(edges), c = poly.reduce((a, p) => [a[0] + p[0] / poly.length, a[1] + p[1] / poly.length], [0, 0]);
    const clearance = (p) => Math.min(...poly.map((a, i) => nearestOnSegment(p, a, poly[(i + 1) % poly.length]).distance));
    if (M.inside(c, poly) && clearance(c) > 0.3) return c;
    let best = null; for (let i = 1; i < 24; i++) for (let j = 1; j < 24; j++) { const p = [b[0] + (b[1] - b[0]) * i / 24, b[2] + (b[3] - b[2]) * j / 24]; if (!M.inside(p, poly)) continue; const d = clearance(p); if (!best || d > best.d) best = { p, d }; }
    return best ? best.p : c;
  }
  function closeRoom() {
    const s = get(); remember(); set({ closed: true });
    const v = validation(get()); if (v.ok && !lampIn(get(), v.edges)) { const p = interiorPoint(v.edges); set({ sx: Math.round(p[0] * 100) / 100, sy: Math.round(p[1] * 100) / 100 }); }
    void s; dirty = true;
  }
  const snapped = (p, e) => (view.snap && !e?.shiftKey ? snapTo(p, SNAP) : p);
  function startCustom(fromPreset) {
    const s = get(); remember();
    const b = PRESETS[s.room]?.bounds || frameOf(s), verts = fromPreset && !isCustom(s) && !PRESETS[s.room].edges.some((e) => e.type !== 'line') ? PRESETS[s.room].edges.map((e) => [...e.a]) : null;
    if (verts) set({ room: 'polygon', vertices: verts, bends: verts.map(() => null), closed: true, frame: b, playing: false, unfolding: false });
    else set({ room: 'polygon', vertices: [], bends: [], closed: false, frame: PRESETS.polygon.bounds, playing: false, unfolding: false, sx: 0, sy: 0 });
    view.tool = 'draw'; selected = { type: 'lamp' }; dirty = true; api.onTool?.(view.tool);
  }
  on(cv, 'pointerdown', (e) => {
    if (e.button > 0) return; cv.focus({ preventScroll: true }); e.preventDefault();
    const s = get(), q = pointer(e), p = world(q), h = hit(s, q, hitRadius(e));
    if (h) {
      selected = { type: h.type, i: h.i };
      if (h.type === 'vertex' && h.i === 0 && !s.closed && s.vertices.length >= 3) { closeRoom(); drag = null; e.preventDefault(); return; }
      drag = { h: { type: h.type, i: h.i }, moved: false, pointerId: e.pointerId };
    } else if (view.tool === 'draw' && isCustom(s)) {
      if (!s.closed) { if (s.vertices.length >= MAX_VERTICES) return; remember(); const vertices = [...s.vertices.map((r) => [...r]), snapped(p, e)]; set({ vertices, bends: vertices.map((_, i) => s.bends[i] || null), playing: false }); selected = { type: 'vertex', i: vertices.length - 1 }; drag = { h: selected, moved: true, pointerId: e.pointerId }; }
      else {   // a press on a wall inserts a vertex there
        const f = fit(); let best = null; s.vertices.forEach((a, i) => { const b = s.vertices[(i + 1) % s.vertices.length], r = nearestOnSegment(q, screen(a, f), screen(b, f)); if (!best || r.distance < best.distance) best = { ...r, i }; });
        if (best && best.distance < hitRadius(e) && s.vertices.length < MAX_VERTICES) { remember(); const vertices = s.vertices.map((r) => [...r]), bends = s.bends.slice(); vertices.splice(best.i + 1, 0, snapped(world(best.point), e)); bends[best.i] = null; bends.splice(best.i + 1, 0, null); set({ vertices, bends, room: roomFor(bends), playing: false }); selected = { type: 'vertex', i: best.i + 1 }; drag = { h: selected, moved: true, pointerId: e.pointerId }; }
        else { selected = { type: 'lamp' }; if (view.cam.s > 1) drag = { pan: q, cam: { ...view.cam }, pointerId: e.pointerId }; }
      }
    } else if (view.tool === 'lamp') {
      const v = validation(s);
      if (v.ok && M.inside(p, M.flatten(v.edges, 48))) { remember(); set({ sx: p[0], sy: p[1] }); selected = { type: 'lamp' }; drag = { h: { type: 'lamp' }, moved: true, pointerId: e.pointerId }; }
      else if (view.cam.s > 1) drag = { pan: q, cam: { ...view.cam }, pointerId: e.pointerId };
    } else if (view.cam.s > 1) drag = { pan: q, cam: { ...view.cam }, pointerId: e.pointerId };
    if (drag) { cv.setPointerCapture?.(e.pointerId); e.preventDefault(); }
    dirty = true; api.onAction?.();
  });
  function moveHandle(h, p, e) {
    const s = get();
    if (h.type === 'lamp') set({ sx: p[0], sy: p[1] });
    else if (h.type === 'vertex') { const vertices = s.vertices.map((r) => [...r]); vertices[h.i] = snapped(p, e); set({ vertices, playing: false }); }
    else { const bends = s.bends.map((r) => r && [...r]); bends[h.i] = p; set({ bends, room: 'curved', playing: false }); }
    dirty = true;
  }
  on(cv, 'pointermove', (e) => {
    const q = pointer(e);
    if (drag?.pan) { view.cam.x = drag.cam.x + q[0] - drag.pan[0]; view.cam.y = drag.cam.y + q[1] - drag.pan[1]; dirty = true; return; }
    if (drag) { if (!drag.moved) { remember(); drag.moved = true; } moveHandle(drag.h, world(q), e); return; }
    if (view.tool === 'draw') { hover = snapped(world(q), e); dirty = true; }
    const h = hit(get(), q, 16); cv.style.cursor = h ? 'grab' : view.tool === 'draw' ? 'crosshair' : view.cam.s > 1 ? 'move' : 'default';
  });
  const end = () => { if (drag) { drag = null; lightKey = ''; dirty = true; api.onAction?.(); } };
  on(cv, 'pointerup', end); on(cv, 'pointercancel', end); on(cv, 'lostpointercapture', end); on(cv, 'pointerleave', () => { hover = null; dirty = true; });
  on(cv, 'dblclick', (e) => {
    const s = get(), h = hit(s, pointer(e), 18); if (!h) return;
    if (h.type === 'vertex') { selected = h; api.removeVertex(); } else if (h.type === 'bend' && s.bends[h.i]) { remember(); const bends = s.bends.slice(); bends[h.i] = null; set({ bends, room: roomFor(bends) }); dirty = true; }
  });
  on(cv, 'wheel', (e) => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); zoomAt(pointer(e), e.deltaY < 0 ? 1.15 : 1 / 1.15); }, { passive: false });
  function zoomAt(q, k) { const s0 = view.cam.s, s1 = Math.max(1, Math.min(12, s0 * k)), r = s1 / s0; view.cam.x = (view.cam.x + W / 2 - q[0]) * r + q[0] - W / 2; view.cam.y = (view.cam.y + H / 2 - q[1]) * r + q[1] - H / 2; view.cam.s = s1; if (s1 === 1) { view.cam.x = 0; view.cam.y = 0; } dirty = true; }
  on(cv, 'keydown', (e) => {
    const s = get(), mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? api.redo() : api.undo(); return; }
    if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); api.redo(); return; }
    if (mod) return;
    if (e.key === '+' || e.key === '=') { zoomAt([W / 2, H / 2], 1.25); e.preventDefault(); return; }
    if (e.key === '-') { zoomAt([W / 2, H / 2], 0.8); e.preventDefault(); return; }
    if (e.key === '0') { api.resetView(); e.preventDefault(); return; }
    const hs = handles(s), at = Math.max(0, hs.findIndex((h) => same(h, selected)));
    if (e.key.toLowerCase() === 'n' || e.key.toLowerCase() === 'h') { selected = { ...hs[(at + 1) % hs.length] }; delete selected.p; dirty = true; e.preventDefault(); return; }
    if (['Delete', 'Backspace'].includes(e.key) && selected.type === 'vertex') { api.removeVertex(); e.preventDefault(); return; }
    if (e.key === 'Insert' || e.key.toLowerCase() === 'i') { api.insertVertex(); e.preventDefault(); return; }
    if (e.key.toLowerCase() === 'c' && isCustom(s) && !s.closed) { api.close(); e.preventDefault(); return; }
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (d) { const h = hs[at] || hs[0], step = selected.type === 'vertex' && view.snap ? SNAP : e.shiftKey ? 0.5 : 0.1; remember(); moveHandle({ type: h.type, i: h.i }, [h.p[0] + d[0] * step, h.p[1] + d[1] * step], { shiftKey: true }); lightKey = ''; e.preventDefault(); api.onAction?.(); }
  });
  // ---- the API the panels use
  const api = {
    canvas: cv, get stats() { return stats; }, get view() { return { ...view, cam: { ...view.cam } }; },
    setTool(tool) { view.tool = tool; const s = get(); if (tool !== 'lamp' && !isCustom(s)) startCustom(true); if (tool === 'curve' && !get().closed) view.tool = 'draw'; selected = { type: 'lamp' }; dirty = true; api.onTool?.(view.tool); },
    setLayer(name, on) { view[name] = !!on; dirty = true; },
    setSnap(on) { view.snap = !!on; dirty = true; },
    newRoom() { startCustom(false); }, editPreset() { startCustom(true); },
    canEditPreset() { const s = get(); return !isCustom(s) && !PRESETS[s.room].edges.some((e) => e.type !== 'line'); },
    close() { const s = get(); if (isCustom(s) && !s.closed && s.vertices.length >= 3) closeRoom(); },
    removeVertex() { const s = get(); if (selected.type !== 'vertex' || !isCustom(s)) return; if (s.closed && s.vertices.length <= 3) return; remember(); const vertices = s.vertices.filter((_, i) => i !== selected.i), bends = s.bends.filter((_, i) => i !== selected.i).map((b, i) => (i === selected.i - 1 ? null : b)); set({ vertices, bends, room: roomFor(bends), closed: s.closed && vertices.length >= 3 }); selected = vertices.length ? { type: 'vertex', i: Math.min(selected.i, vertices.length - 1) } : { type: 'lamp' }; dirty = true; },
    insertVertex() { const s = get(); if (!isCustom(s) || s.vertices.length < 2 || s.vertices.length >= MAX_VERTICES) return; const i = selected.type === 'vertex' ? selected.i : s.vertices.length - 1, a = s.vertices[i], b = s.vertices[(i + 1) % s.vertices.length]; remember(); const vertices = s.vertices.map((r) => [...r]), bends = s.bends.slice(); vertices.splice(i + 1, 0, snapTo([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], view.snap ? SNAP / 2 : 0)); bends[i] = null; bends.splice(i + 1, 0, null); set({ vertices, bends, room: roomFor(bends) }); selected = { type: 'vertex', i: i + 1 }; dirty = true; },
    straighten() { const s = get(); if (!s.bends.some(Boolean)) return; remember(); set({ bends: s.bends.map(() => null), room: 'polygon' }); dirty = true; },
    undo() { const last = history.pop(); if (!last) return; future.push(snapshot()); apply(last); selected = { type: 'lamp' }; },
    redo() { const next = future.pop(); if (!next) return; history.push(snapshot()); apply(next); selected = { type: 'lamp' }; },
    get canUndo() { return history.length > 0; }, get canRedo() { return future.length > 0; },
    remember,
    zoom(k) { zoomAt([W / 2, H / 2], k); }, resetView() { view.cam = { s: 1, x: 0, y: 0 }; dirty = true; },
    // the light reflection by reflection: 0, 1, 2... then all (a step each press under reduced motion)
    playLight() { clearInterval(playTimer); view.upTo = 0; dirty = true; if (reduced()) return; playTimer = setInterval(() => { const K = light?.bounces ?? 0; if (view.upTo >= K) { clearInterval(playTimer); view.upTo = Infinity; } else view.upTo++; dirty = true; api.onAction?.(); }, 600); },
    stepLight() { clearInterval(playTimer); const K = light?.bounces ?? 0; view.upTo = !Number.isFinite(view.upTo) ? 0 : view.upTo + 1 > K ? Infinity : view.upTo + 1; dirty = true; },
    stopLight() { clearInterval(playTimer); view.upTo = Infinity; dirty = true; },
    playRays() { const s = get(); if (reduced()) { elapsed = Infinity; set({ playing: false }); } else { if (!s.playing && (!Number.isFinite(elapsed) || elapsed > 400)) elapsed = 0; set({ playing: !s.playing }); } dirty = true; },
    stepRays() { elapsed = Number.isFinite(elapsed) ? elapsed + 1 : 1; set({ playing: false }); dirty = true; },
    showAllRays() { elapsed = Infinity; set({ playing: false }); dirty = true; },
    redraw() { dirty = true; }, resetHistory() { history = []; future = []; },
    destroy() { alive = false; cancelAnimationFrame(raf); clearTimeout(lightTimer); clearInterval(playTimer); listeners.forEach(([el, type, fn, o]) => el.removeEventListener(type, fn, o)); ro?.disconnect(); worker?.terminate(); farm?.destroy(); density?.destroy(); },
  };
  void fmt; raf = requestAnimationFrame(frame);
  return api;
}
