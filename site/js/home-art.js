// Small live drawings for the home page and the gallery cards. Each one draws on a canvas, pauses when it is off screen or the
// tab is hidden, and draws one still frame under prefers-reduced-motion. Mathematics comes from gallery-math.js and lab-objects.js.
import { escape, MADAGASCAR, resample, fourier, arms, COUNT_SCHEDULE, REVOLUTION } from "./gallery-math.js";
import { platonic, reuleaux, binomial } from "./lab-objects.js";
import {voronoiCells,cycloid,descentTrack,pointAtTime} from './gallery-models.js';
import {neighbours,colourWith} from './gallery-four-colour-model.js';
import {drawKnotStrand} from './gallery-knot-render.js';
import {spaceKnot} from './gallery-knot-model.js';
import {previewMesh as gombocMesh} from './gomboc-body.js';
import {cam3Project} from './camera3d.js';
import {makeFamilyPatch} from './gallery-hat-model.js';
import {presetSet,step,coords} from './gallery-life-model.js';
import {ten,vertices} from './gallery-squares-model.js';
import {hammersley,hammersleyPose,HAMMERSLEY_R,place} from './gallery-sofa-model.js';
import {curve,PRESETS as CURVES,inscribed} from './gallery-inscribed-model.js';
import {BARRIERS,lineAt} from './gallery-opaque-model.js';

const TAU = Math.PI * 2;
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || "#888";
const cols = () => ({ ink: css("--ink"), muted: css("--muted"), accent: css("--accent"), line: css("--line-strong"), surface: css("--surface"), c: [1, 2, 3, 4, 5, 6, 7, 8].map((i) => css(`--c${i}`)), neg: css("--neg") });

// Shared frame loop: sizes the canvas to its box, runs draw(g, W, H, time, C) only while visible.
function runner(cv, draw, { reduced = () => false, still = 6, trailing = false, pauseButton = null } = {}) {
  let paused = !!pauseButton, pausedAt = performance.now(), lastTime = 0;
  const pause = () => {
    paused = !paused; pauseButton.setAttribute("aria-pressed", String(paused));
    pauseButton.textContent = paused ? pauseButton.dataset.play : pauseButton.dataset.pause;
    if (paused) { pausedAt = performance.now(); cancelAnimationFrame(raf); raf = 0; }
    else { t0 += performance.now() - pausedAt; if (!raf) raf = requestAnimationFrame(frame); }
  };
  if (pauseButton) pauseButton.addEventListener("click", pause);
  const g = cv.getContext("2d"); let W = 0, H = 0, raf = 0, visible = true, alive = true, C = cols(), frames = 0, t0 = performance.now(), cleared = false;
  const size = () => { const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height)); cv.width = Math.round(W * d); cv.height = Math.round(H * d); g.setTransform(d, 0, 0, d, 0, 0); cleared = false; };
  size();
  const ro = new ResizeObserver(() => { size(); if (reduced() || paused || !visible) { cancelAnimationFrame(raf); frame(performance.now()); } }); ro.observe(cv);
  const io = new IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible && alive && !raf && !reduced() && !paused) raf = requestAnimationFrame(frame); }); io.observe(cv);
  function frame(now) {
    raf = 0; if (!alive) return;
    if (frames++ % 90 === 0) C = cols();
    const t = reduced() ? still : paused ? lastTime : (now - t0) / 1000; lastTime = t;
    if (!trailing || !cleared) { g.clearRect(0, 0, W, H); cleared = true; }
    draw(g, W, H, t, C, frames);
    if (!reduced() && !paused && visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  const onVis = () => { if (!document.hidden && visible && alive && !raf && !reduced() && !paused) raf = requestAnimationFrame(frame); };
  document.addEventListener("visibilitychange", onVis);
  const preference = pauseButton ? matchMedia("(prefers-reduced-motion: reduce)") : null;
  const refresh = () => { C = cols(); cancelAnimationFrame(raf); frame(performance.now()); };
  const syncMotion = () => {
    pauseButton.setAttribute("aria-pressed", String(paused));
    pauseButton.disabled = reduced();
    pauseButton.textContent = reduced() ? pauseButton.dataset.still : paused ? pauseButton.dataset.play : pauseButton.dataset.pause;
    refresh();
  };
  const themeObserver = pauseButton ? new MutationObserver(refresh) : null;
  themeObserver?.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  preference?.addEventListener("change", syncMotion);
  if (pauseButton) syncMotion(); else raf = requestAnimationFrame(frame);
  return () => { alive = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); document.removeEventListener("visibilitychange", onVis); pauseButton?.removeEventListener("click", pause); preference?.removeEventListener("change", syncMotion); themeObserver?.disconnect(); };
}

/* ------------------------------------------------------------ Madagascar by circles */
// centred on its mean, so that the constant term of the transform vanishes and every circle really turns
const OUTLINE = (() => { const raw = resample(MADAGASCAR, 256), mx = raw.reduce((q, p) => q + p[0] / raw.length, 0), my = raw.reduce((q, p) => q + p[1] / raw.length, 0), pts = raw.map((p) => [p[0] - mx, p[1] - my]); return { pts, co: fourier(pts) }; })();
function fourierArt(cv, opts) {
  const dark = !!opts.dark, { pts, co } = OUTLINE, xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), cxy = [(Math.max(...xs) + Math.min(...xs)) / 2, (Math.max(...ys) + Math.min(...ys)) / 2], span = [Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
  const FADE = 1.7 * REVOLUTION; let trail = [], prevRev = -1;
  const preview = opts.home ? Array.from({ length: 321 }, (_, i) => arms(co, i / 320, 40).at(-1)) : null;
  return runner(cv, (g, W, H, t, C0) => {
    const C = dark ? { ...C0, ink: "#ffffff", muted: "#cfd8ff", accent: "#ffd54a", line: "#9fb0ff", neg: "#ff6b9a" } : C0;
    const s = Math.min((W * 0.78) / span[0], (H * 0.9) / span[1]), P = (x, y) => [W / 2 + (x - cxy[0]) * s, H / 2 - (y - cxy[1]) * s], still = opts.reduced?.();
    // The tip traces the curve of the first `count` circles as it goes and the old trace fades slowly; a circle is added only
    // after a full turn. The shape is never drawn in advance: it appears, sharpens turn after turn, and the loop starts over.
    const loop = (COUNT_SCHEDULE.length + 2) * REVOLUTION, tt = still ? 0 : t % loop, rev = Math.floor(tt / REVOLUTION);
    const count = opts.home ? 40 : still ? 110 : COUNT_SCHEDULE[Math.min(rev, COUNT_SCHEDULE.length - 1)], phase = still ? 0 : (tt / REVOLUTION) % 1;
    if (rev < prevRev) trail = []; prevRev = rev;
    const chain = arms(co, phase, count), tip = chain[chain.length - 1];
    g.lineCap = "round"; g.lineJoin = "round";
    if (preview) {
      g.strokeStyle = C.accent; g.lineWidth = 2.4; g.globalAlpha = .45; g.beginPath();
      preview.forEach((q, i) => { const p = P(q[0], q[1]); i ? g.lineTo(...p) : g.moveTo(...p); }); g.stroke(); g.globalAlpha = 1;
    }
    if (still) { g.strokeStyle = C.accent; g.lineWidth = 3.2; g.beginPath(); for (let i = 0; i <= 260; i++) { const q = arms(co, i / 260, count).at(-1), [x, y] = P(q[0], q[1]); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
    else {
      trail.push({ x: tip[0], y: tip[1], ts: t, count }); while (trail.length && t - trail[0].ts > FADE) trail.shift();
      g.lineWidth = 3.4; g.strokeStyle = C.accent;
      for (let i = 1; i < trail.length; i++) { if (trail[i].count !== trail[i-1].count || trail[i].ts-trail[i-1].ts > .15) continue; const k = 1 - (t - trail[i].ts) / FADE; g.globalAlpha = Math.max(0, k) ** 1.4; const a = P(trail[i - 1].x, trail[i - 1].y), b = P(trail[i].x, trail[i].y); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
      g.globalAlpha = 1;
    }
    g.lineWidth = 1;
    for (let i = 1; i < chain.length; i++) { const a = P(chain[i - 1][0], chain[i - 1][1]), b = P(chain[i][0], chain[i][1]), r = chain[i][2] * s; g.strokeStyle = C.muted; g.globalAlpha = 0.4; if (r > 1) { g.beginPath(); g.arc(a[0], a[1], r, 0, TAU); g.stroke(); } g.globalAlpha = 0.8; g.strokeStyle = C.ink; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
    g.globalAlpha = 1; const [tx, ty] = P(tip[0], tip[1]); g.fillStyle = C.neg; g.beginPath(); g.arc(tx, ty, 4.5, 0, TAU); g.fill();
  }, { reduced: opts.reduced, pauseButton: opts.home ? cv.closest("figure")?.querySelector("[data-art-pause]") : null });
}

/* ------------------------------------------------------------ fractals */
const shade = (v, max) => {
  if (v >= max) return 0xff140c0a;
  const k = 0.045 * v + 0.2, r = 0.5 + 0.5 * Math.cos(TAU * k), g = 0.5 + 0.5 * Math.cos(TAU * (k + 0.12)), b = 0.5 + 0.5 * Math.cos(TAU * (k + 0.28));
  return (255 << 24) | ((b * 235 + 12) << 16) | ((g * 220 + 12) << 8) | (r * 215 + 20);
};
function fractalArt(cv, opts, field) {
  const off = document.createElement("canvas"), RW = 150, RH = 94; off.width = RW; off.height = RH; const oc = off.getContext("2d"), img = oc.createImageData(RW, RH), px = new Uint32Array(img.data.buffer);
  return runner(cv, (g, W, H, t) => { field(px, RW, RH, t); oc.putImageData(img, 0, 0); g.imageSmoothingEnabled = true; g.drawImage(off, 0, 0, W, H); }, { reduced: opts.reduced, still: 2 });
}
const dim = (c, f) => (255 << 24) | ((((c >> 16) & 255) * f) << 16) | ((((c >> 8) & 255) * f) << 8) | ((c & 255) * f);
const juliaArt = (cv, o) => fractalArt(cv, o, (px, w, h, t) => {
  const a = 0.6 + t * 0.25, cr = 0.7885 * Math.cos(a), ci = 0.7885 * Math.sin(a), W = 3.0, H = (W * h) / w, max = 70;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const c = shade(escape(((x + 0.5) / w - 0.5) * W, -((y + 0.5) / h - 0.5) * H, cr, ci, max, true), max); px[y * w + x] = o.dark ? dim(c, 0.42) : c; }
});
const mandelArt = (cv, o) => fractalArt(cv, o, (px, w, h, t) => {
  const k = ((t % 24) / 24), z = Math.exp(Math.log(3.4) + (Math.log(0.0035) - Math.log(3.4)) * (o.reduced?.() ? 0.62 : k * k * (3 - 2 * k))), cx = -0.5 + (-0.743643887037151 + 0.5) * Math.min(1, (1 - z / 3.4) * 1.3), cy = 0.13182590420533 * Math.min(1, (1 - z / 3.4) * 1.3), max = Math.round(80 + 40 * Math.log2(3.4 / z)), H = (z * h) / w;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) px[y * w + x] = shade(escape(0, 0, cx + ((x + 0.5) / w - 0.5) * z, cy - ((y + 0.5) / h - 0.5) * H, max, true), max);
});

/* ------------------------------------------------------------ chaos game */
function chaosArt(cv, opts) {
  let x = 0.3, y = 0.3, n = 0, ctxReset = false;
  const V = [[0.5, 0.06], [0.06, 0.94], [0.94, 0.94]];
  return runner(cv, (g, W, H, t, C, frames) => {
    if (!ctxReset || n > 60000) { g.clearRect(0, 0, W, H); n = 0; ctxReset = true; }
    const batch = opts.reduced?.() ? 14000 : 160;
    for (let i = 0; i < batch; i++) { const k = Math.floor(Math.random() * 3); x = (x + V[k][0]) / 2; y = (y + V[k][1]) / 2; g.fillStyle = C.c[(k * 2) % 8]; g.fillRect(x * W, y * H, 1.6, 1.6); n++; }
    void t; void frames;
  }, { reduced: opts.reduced, trailing: true });
}

/* ------------------------------------------------------------ Galton board */
function galtonArt(cv, opts) {
  const ROWS = 8, balls = [], bins = Array(ROWS + 1).fill(0); let acc = 0, last = 0;
  return runner(cv, (g, W, H, t, C) => {
    const dt = Math.min(0.05, t - last || 0.016); last = t; const dx = Math.min(W / (ROWS + 3), 34), top = 20, dy = (H * 0.5) / ROWS, bottom = H - 8, R = Math.max(2.2, dx * 0.15);
    if (opts.reduced?.()) { if (!bins.some(Boolean)) for (let i = 0; i < 160; i++) { let j = 0; for (let r = 0; r < ROWS; r++) if (Math.random() < 0.5) j++; bins[j]++; } }
    else { acc += dt; if (acc > 0.22 && balls.length < 14) { acc = 0; const path = Array.from({ length: ROWS }, () => Math.random() < 0.5), bin = path.filter(Boolean).length; balls.push({ path, tau: 0, bin, slot: bins[bin] }); } }
    for (const b of balls) b.tau += dt * 7; for (let i = balls.length - 1; i >= 0; i--) if (balls[i].tau >= ROWS + 1.2) { bins[balls[i].bin]++; balls.splice(i, 1); }
    if (bins.some((c) => c * R * 2 / 2 > H * 0.36)) bins.fill(0);
    const px = (r, j) => W / 2 + (j - r / 2) * dx, py = (r) => top + r * dy;
    g.fillStyle = C.muted; for (let r = 0; r < ROWS; r++) for (let j = 0; j <= r; j++) { g.beginPath(); g.arc(px(r, j), py(r), 2.2, 0, TAU); g.fill(); }
    const slotXY = (k, i) => { const per = Math.max(1, Math.floor((dx - 3) / (2 * R))); return [W / 2 + (k - ROWS / 2) * dx - per * R + R + (i % per) * 2 * R, bottom - R - Math.floor(i / per) * 2 * R]; };
    for (let k = 0; k <= ROWS; k++) for (let i = 0; i < bins[k]; i++) { const [x, y] = slotXY(k, i); g.fillStyle = C.c[k % 8]; g.beginPath(); g.arc(x, y, R * 0.92, 0, TAU); g.fill(); }
    for (const b of balls) {
      const s = Math.min(b.tau, ROWS), w = Math.floor(s), f = s - w; let j = 0; for (let r = 0; r < w; r++) if (b.path[r]) j++;
      let x, y; if (b.tau <= ROWS) { const nj = j + (w < ROWS && b.path[w] ? 1 : 0); x = px(w, j) + (px(w + 1, nj) - px(w, j)) * f; y = py(w) + (py(w + 1) - py(w)) * f - Math.sin(f * Math.PI) * 3; }
      else { const [sx, sy] = slotXY(b.bin, b.slot), k = Math.min(1, (b.tau - ROWS) / 1.2); x = px(ROWS, b.bin) + (sx - px(ROWS, b.bin)) * k; y = py(ROWS) + (sy - py(ROWS)) * k * k; }
      g.fillStyle = C.c[b.bin % 8]; g.beginPath(); g.arc(x, y, R * 0.92, 0, TAU); g.fill();
    }
    void binomial;
  }, { reduced: opts.reduced });
}

/* ------------------------------------------------------------ curve of constant width */
function reuleauxArt(cv, opts) {
  const shape = reuleaux(3, 1), pts = shape.pts, c0 = pts.reduce((a, p) => [a[0] + p[0] / pts.length, a[1] + p[1] / pts.length], [0, 0]);
  return runner(cv, (g, W, H, t, C) => {
    // the shape turns; two parallel lines in a fixed direction always touch it, and their distance never changes
    const s = Math.min(W, H) * 0.5, spin = t * 1.1, cs = Math.cos(spin), sn = Math.sin(spin), cx = W / 2, cy = H / 2;
    const R = pts.map((p) => { const x = p[0] - c0[0], y = p[1] - c0[1]; return [x * cs - y * sn, x * sn + y * cs]; });
    const th = 0.6, u = [Math.cos(th), Math.sin(th)], d = [-u[1], u[0]], proj = R.map((p) => p[0] * u[0] + p[1] * u[1]), hmax = Math.max(...proj), hmin = Math.min(...proj);
    const X = (x, y) => [cx + x * s, cy - y * s];
    g.fillStyle = C.accent; g.globalAlpha = 0.22; g.beginPath(); R.forEach((p, i) => { const [x, y] = X(p[0], p[1]); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.fill();
    g.globalAlpha = 1; g.strokeStyle = C.accent; g.lineWidth = 3; g.stroke();
    g.strokeStyle = C.ink; g.lineWidth = 1.6;
    for (const h of [hmax, hmin]) { const A = X(u[0] * h - d[0] * 0.75, u[1] * h - d[1] * 0.75), B = X(u[0] * h + d[0] * 0.75, u[1] * h + d[1] * 0.75); g.beginPath(); g.moveTo(...A); g.lineTo(...B); g.stroke(); }
    const m = X(u[0] * hmin, u[1] * hmin), n = X(u[0] * hmax, u[1] * hmax); g.setLineDash([4, 4]); g.beginPath(); g.moveTo(...m); g.lineTo(...n); g.stroke(); g.setLineDash([]);
  }, { reduced: opts.reduced });
}

/* ------------------------------------------------------------ Platonic solid */
function platonicArt(cv, opts) {
  const S = platonic("dodecahedron");
  return runner(cv, (g, W, H, t, C) => {
    const a = t * 0.5, b = 0.5 + 0.25 * Math.sin(t * 0.3), ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b), s = Math.min(W, H) * 0.36;
    const P = S.verts.map(([x, y, z]) => { const x1 = x * ca + z * sa, z1 = -x * sa + z * ca, y1 = y * cb - z1 * sb, z2 = y * sb + z1 * cb; return [W / 2 + x1 * s, H / 2 - y1 * s, z2]; });
    const faces = S.faces.map((f) => ({ f, d: f.verts.reduce((q, v) => q + P[v][2], 0) / f.verts.length })).sort((p, q) => p.d - q.d);
    faces.forEach(({ f, d }, i) => { g.globalAlpha = 0.18 + 0.4 * ((d + 1) / 2); g.fillStyle = C.c[i % 8]; g.beginPath(); f.verts.forEach((v, k) => (k ? g.lineTo(P[v][0], P[v][1]) : g.moveTo(P[v][0], P[v][1]))); g.closePath(); g.fill(); });
    g.globalAlpha = 0.9; g.strokeStyle = C.ink; g.lineWidth = 1.4; for (const [p, q] of S.edges) { g.beginPath(); g.moveTo(P[p][0], P[p][1]); g.lineTo(P[q][0], P[q][1]); g.stroke(); } g.globalAlpha = 1;
  }, { reduced: opts.reduced, still: 3 });
}

function newGalleryArt(kind,cv,opts){
  const family=kind==='einstein'?makeFamilyPatch(2):null,slide=kind==='fastest-slide'?cycloid([4,2],100):null,track=slide?descentTrack(slide.points):null;
  return runner(cv,(g,W,H,time,C)=>{
    const draw=(pts,color,fill=false,width=2)=>{g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));if(fill){g.closePath();g.fillStyle=color;g.globalAlpha=.23;g.fill();g.globalAlpha=1;}g.strokeStyle=color;g.lineWidth=width;g.stroke();};
    if(kind==='voronoi'){
      const seeds=Array.from({length:8},(_,i)=>[W*(.15+.7*(.5+.5*Math.sin(i*3.7+time*.14))),H*(.15+.7*(.5+.5*Math.cos(i*2.4+time*.12)))]);
      voronoiCells(seeds,[0,0,W,H]).forEach((p,i)=>draw(p,C.c[i%8],true,1.4));seeds.forEach(p=>{g.fillStyle=C.ink;g.beginPath();g.arc(...p,3,0,TAU);g.fill();});
    }else if(kind==='four-colours'){
      // a fixed map coloured with at most four colours by the solver (a moving map would change colours abruptly)
      const seeds=Array.from({length:11},(_,i)=>[W*(.1+.8*(.5+.5*Math.sin(i*2.9))),H*(.1+.8*(.5+.5*Math.cos(i*1.7)))]),cells=voronoiCells(seeds,[0,0,W,H]),col=colourWith(cells.length,neighbours(cells),4)||[];
      cells.forEach((p,i)=>draw(p,C.c[col[i]??0],true,1.4));
    }else if(kind==='fastest-slide'){
      const map=p=>[W*.1+p[0]*W*.2,H*.17+p[1]*H*.25];draw([[0,0],[4,2]].map(map),C.c[1],false,2);draw(slide.points.map(map),C.accent,false,3);const p=map(pointAtTime(track,time%track.total));g.fillStyle=C.accent;g.beginPath();g.arc(...p,6,0,TAU);g.fill();
    }else if(kind==='soap-films'){
      const proj=(x,y,z)=>[W/2+(x*.8-y*.45)*W*.24,H/2+(x*.18+y*.32-z*.55)*H*.4];
      for(let i=0;i<=12;i++){const u=-1+i/6;for(let k=0;k<2;k++)draw(Array.from({length:41},(_,j)=>{const v=-1+j/20,x=k?u:v,y=k?v:u;return proj(x,y,.75*x*y+.35*Math.sin(Math.PI*(x+1)/2)*Math.sin(Math.PI*(y+1)/2)*Math.exp(-time%5));}),C.accent,false,1.4);}
    }else if(kind==='knots'){
      const a=time*.22,points=Array.from({length:301},(_,i)=>{const[x,y,z]=spaceKnot('figure8',i/300),v=x*Math.sin(a)+z*Math.cos(a);return [W/2+(x*Math.cos(a)-z*Math.sin(a))*W*.22,H/2+(y*.75-v*.35)*H*.23,v];});
      drawKnotStrand(g,points.slice(0,-1),{ink:C.accent,background:C.surface});
    }else{
      const tiles=family(.5+.23*Math.sin(time*.22)),pts=tiles.flatMap(x=>x.vertices),xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2,s=Math.min(W,H)*.09;
      tiles.forEach(tile=>draw(tile.vertices.map(([x,y])=>[W/2+(x-cx)*s,H/2+(y-cy)*s]),tile.reflected?C.c[2]:C.accent,true,1));
    }
  },{reduced:opts.reduced});
}
/* ------------------------------------------------------- curiosities of the "Lire" section */
// Game of Life: a glider gun firing, one generation every 0.12 s (the generations are cached, so the frame is a function of time).
function lifeArt(cv, opts) {
  const gens = [presetSet('gun')];
  return runner(cv, (g, W, H, t, C) => {
    const k = Math.max(0, Math.floor(t / 0.12)) % 240; while (gens.length <= k) gens.push(step(gens.at(-1)));
    const cell = Math.max(3, Math.min(W / 64, H / 40)), ox = W / 2 - 4 * cell, oy = H * 0.32;
    g.fillStyle = C.accent; for (const key of gens[k]) { const [x, y] = coords(key); g.fillRect(ox + x * cell, oy + y * cell, cell - 1, cell - 1); }
  }, { reduced: opts.reduced, still: 6 });
}
// Ten unit squares in a square of side 3 + 1/sqrt 2, the turned square slowly glowing.
function squaresArt(cv, opts) {
  const sq = ten(), side = 3 + Math.SQRT1_2;
  return runner(cv, (g, W, H, t, C) => {
    const u = Math.min(W, H) * 0.8 / side, ox = (W - side * u) / 2, oy = (H - side * u) / 2;
    g.strokeStyle = C.accent; g.lineWidth = 2; g.setLineDash([6, 4]); g.strokeRect(ox, oy, side * u, side * u); g.setLineDash([]);
    sq.forEach((q, i) => { const p = vertices(q).map(([x, y]) => [ox + x * u, oy + y * u]); g.beginPath(); p.forEach((v, j) => j ? g.lineTo(...v) : g.moveTo(...v)); g.closePath();
      g.globalAlpha = q.a ? 0.45 + 0.35 * Math.sin(t * 2) : 0.3; g.fillStyle = C.c[i % 8]; g.fill(); g.globalAlpha = 1; g.strokeStyle = C.ink; g.lineWidth = 1.2; g.stroke(); });
  }, { reduced: opts.reduced, still: 0.8 });
}
// The Hammersley sofa going round the corner, back and forth.
function sofaArt(cv, opts) {
  const poly = hammersley(HAMMERSLEY_R, 24);
  return runner(cv, (g, W, H, t, C) => {
    const u = Math.min(W / 6.2, H / 4.6), X = (x) => W * 0.64 + u * x, Y = (y) => H * 0.18 + u * (1 - y), s = 1.5 + 1.5 * Math.sin(t * 0.6);
    g.strokeStyle = C.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(0, Y(1)); g.lineTo(X(1), Y(1)); g.lineTo(X(1), H); g.moveTo(0, Y(0)); g.lineTo(X(0), Y(0)); g.lineTo(X(0), H); g.stroke();
    const pts = place(poly, hammersleyPose(HAMMERSLEY_R, s, 1.5)); g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))); g.closePath();
    g.globalAlpha = 0.4; g.fillStyle = C.accent; g.fill(); g.globalAlpha = 1; g.strokeStyle = C.accent; g.stroke();
  }, { reduced: opts.reduced, still: 2.6 });
}
// A closed curve and the square found on it (computed once).
function inscribedArt(cv, opts) {
  const pts = curve(CURVES.blob.ctrl), sq = inscribed(pts, { samples: 90 })[0];
  return runner(cv, (g, W, H, t, C) => {
    const u = Math.min(W / 10.4, H / 7.4), X = ([x, y]) => [(W - 10 * u) / 2 + u * x, (H - 7 * u) / 2 + u * y];
    g.strokeStyle = C.ink; g.lineWidth = 2; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...X(p)) : g.moveTo(...X(p))); g.closePath(); g.stroke();
    if (sq) { g.strokeStyle = C.accent; g.lineWidth = 2.5; g.globalAlpha = 0.55 + 0.45 * Math.sin(t * 2); g.beginPath(); sq.corners.forEach((p, i) => i ? g.lineTo(...X(p)) : g.moveTo(...X(p))); g.closePath(); g.stroke(); g.globalAlpha = 1; sq.corners.forEach((p) => { g.fillStyle = C.accent; g.beginPath(); g.arc(...X(p), 4, 0, 2 * Math.PI); g.fill(); }); }
  }, { reduced: opts.reduced, still: 0.8 });
}
// The shortest known barrier of the square in a turning beam of light.
function opaqueArt(cv, opts) {
  const segs = BARRIERS.best.segs;
  return runner(cv, (g, W, H, t, C) => {
    const u = Math.min(W, H) * 0.55, X = ([x, y]) => [W / 2 + u * (x - 0.5), H / 2 - u * (y - 0.5)], th = (t * 0.3) % Math.PI, nx = -Math.sin(th), ny = Math.cos(th), cs = [[0, 0], [1, 0], [1, 1], [0, 1]].map(([x, y]) => x * nx + y * ny), lo = Math.min(...cs), hi = Math.max(...cs);
    for (let k = 0; k <= 24; k++) { const c = lo + (hi - lo) * (k + 0.5) / 25, [a, b] = lineAt(th, c, 2); g.strokeStyle = C.muted; g.globalAlpha = 0.25; g.beginPath(); g.moveTo(...X(a)); g.lineTo(...X(b)); g.stroke(); }
    g.globalAlpha = 1; g.strokeStyle = C.line; g.setLineDash([4, 4]); g.strokeRect(...X([0, 1]), u, u); g.setLineDash([]);
    g.strokeStyle = C.accent; g.lineWidth = 4; g.lineCap = 'round'; segs.forEach(([a, b]) => { g.beginPath(); g.moveTo(...X(a)); g.lineTo(...X(b)); g.stroke(); });
  }, { reduced: opts.reduced, still: 1 });
}
function gombocArt(cv,opts){const mesh=gombocMesh(1500);return runner(cv,(g,W,H,time,C)=>{const k=Math.min(W,H)*.36,points=mesh.vertices.map(p=>{const q=cam3Project(-.7+time*.15,.55,...p);return [W/2+q.u*k,H/2-q.v*k,q.d];});const faces=mesh.quads.map(ids=>ids.map(i=>points[i])).sort((a,b)=>b.reduce((s,p)=>s+p[2],0)-a.reduce((s,p)=>s+p[2],0));for(const p of faces){g.beginPath();p.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();g.globalAlpha=.65;g.fillStyle=C.accent;g.fill();g.strokeStyle=C.line;g.lineWidth=.6;g.stroke();}g.globalAlpha=1;},{reduced:opts.reduced,still:0});}
export const ART = { gomboc:gombocArt, fourier: fourierArt, "fourier-home": (cv, o) => fourierArt(cv, { ...o, home: true }), "fourier-dark": (cv, o) => fourierArt(cv, { ...o, dark: true }), julia: juliaArt, "julia-dark": (cv, o) => juliaArt(cv, { ...o, dark: true }), mandelbrot: mandelArt, chaos: chaosArt, galton: galtonArt, reuleaux: reuleauxArt, platonic: platonicArt,
  life: lifeArt, 'square-packing': squaresArt, 'moving-sofa': sofaArt, 'inscribed-square': inscribedArt, 'opaque-square': opaqueArt,
  ...Object.fromEntries(['voronoi','four-colours','fastest-slide','soap-films','knots','einstein'].map(id=>[id,(cv,o)=>newGalleryArt(id,cv,o)])) };
export function mountArt(cv, kind, opts = {}) { const f = ART[kind]; return f ? f(cv, opts) : () => {}; }
