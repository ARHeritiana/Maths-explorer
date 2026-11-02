import {mountMandelbrotPreview} from './mandelbrot-preview.js';
// Small live drawings for the home page and the gallery cards. Each one draws on a canvas, pauses when it is off screen or the
// tab is hidden, and draws one still frame under prefers-reduced-motion. Mathematics comes from gallery/gallery-math.js and lab-objects.js.
import { escape, MADAGASCAR, resample, fourier, arms, COUNT_SCHEDULE, REVOLUTION } from "./gallery/gallery-math.js";
import { platonic, reuleaux, binomial } from "./lab-objects.js";
import {voronoiCells,cycloid,descentTrack,pointAtTime} from './gallery/gallery-models.js';
import {neighbours,colourWith} from './gallery/gallery-four-colour-model.js';
import {drawKnotStrand} from './gallery/gallery-knot-render.js';
import {spaceKnot} from './gallery/gallery-knot-model.js';
import {makeSupportBody} from './gomboc-support.js';
import {VISIBLE_TERMS} from './gomboc-support-data.js';
import {cam3Project} from './camera3d.js';
import {makeFamilyPatch} from './gallery/gallery-hat-model.js';
import {presetSet,step,coords} from './gallery/gallery-life-model.js';
import {ten,vertices} from './gallery/gallery-squares-model.js';
import {hammersley,hammersleyPose,HAMMERSLEY_R,place} from './gallery/gallery-sofa-model.js';
import {curve,PRESETS as CURVES,inscribed} from './gallery/gallery-inscribed-model.js';
import {BARRIERS,lineAt} from './gallery/gallery-opaque-model.js';
import {preset as eqPreset,buildChain as eqChain,frame as eqFrame} from './gallery/gallery-equidecomposition-model.js';

import {PENROSE} from './illumination-presets.js';
import {flatten as roomOutline, trace as traceRoom} from './illumination-model.js';

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
const mandelArt = (cv, opts) => mountMandelbrotPreview(cv, opts);

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
// Hexagon cut into pieces that slide into a square and back (computed once).
function equidecompositionArt(cv, opts) {
  const CH = eqChain(eqPreset('hexagon').pts, eqPreset('square').pts), xs = CH.bbox.map((p) => p[0]), ys = CH.bbox.map((p) => p[1]), x0 = Math.min(...xs), y0 = Math.min(...ys), bw = Math.max(...xs) - x0, bh = Math.max(...ys) - y0;
  return runner(cv, (g, W, H, t, C) => {
    const u = Math.min(W / (bw * 1.08), H / (bh * 1.08)), X = ([x, y]) => [(W - bw * u) / 2 + (x - x0) * u, (H - bh * u) / 2 + (y - y0) * u], T = 4 + 4 * Math.sin(t * 0.5 - Math.PI / 2) * 0.999;
    eqFrame(CH, T).pieces.forEach((pc) => { g.beginPath(); pc.poly.map(X).forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.globalAlpha = 0.75; g.fillStyle = C.c[pc.colour]; g.fill(); g.globalAlpha = 1; g.strokeStyle = C.ink; g.lineWidth = 1; g.stroke(); });
  }, { reduced: opts.reduced, still: 1.2 });
}
// The exhibit's visibly shaped support-function body, without exaggerated geometry.
// Cache the mesh; opaque lit faces reveal its silhouette without a distracting wire grid.
let cardGombocMesh;
function gombocArt(cv, opts) {
  const m = cardGombocMesh ||= makeSupportBody(VISIBLE_TERMS).buildMesh(64, 32);
  return runner(cv, (g,W,H,t,C) => {
    const yaw = -.9 + .12*Math.sin(t*.3), pitch = .28;
    const pts = Array.from({length:m.vertices}, (_,i) => cam3Project(yaw,pitch,...m.pos.slice(i*3,i*3+3)));
    const xs=pts.map(p=>p.u), ys=pts.map(p=>p.v), lo=Math.min(...xs), hi=Math.max(...xs), bottom=Math.min(...ys), top=Math.max(...ys);
    const k=Math.min(W*.66/(hi-lo),H*.74/(top-bottom)), cx=(lo+hi)/2,cy=(bottom+top)/2;
    g.fillStyle=C.ink; g.globalAlpha=.08;g.beginPath();g.ellipse(W/2,H*.88,W*.24,H*.025,0,0,TAU);g.fill();g.globalAlpha=1;
    const faces=[];
    for(let i=0;i<m.indices.length;i+=3){const ids=Array.from(m.indices.slice(i,i+3));faces.push({ids,d:ids.reduce((v,j)=>v+pts[j].d,0)});}
    faces.sort((a,b)=>b.d-a.d);
    for(const {ids} of faces){
      const n=ids.map(j=>Array.from(m.normals.slice(j*3,j*3+3))).reduce((a,b)=>a.map((v,i)=>v+b[i]),[0,0,0]);
      const q=cam3Project(yaw,pitch,...n),len=Math.hypot(q.u,q.v,q.d),light=Math.max(0,(-q.u*.35+q.v*.55-q.d*.75)/len);
      const shade=26+light*48;
      g.fillStyle=`hsl(18 54% ${shade}%)`;g.strokeStyle=g.fillStyle;g.lineWidth=.6;
      g.beginPath();ids.forEach((j,i)=>{const p=pts[j],x=W/2+(p.u-cx)*k,y=H*.47-(p.v-cy)*k;i?g.lineTo(x,y):g.moveTo(x,y);});g.closePath();g.fill();g.stroke();
    }
  },{reduced:opts.reduced,still:0});
}

// The exact Penrose boundary and its reflected paths are shared with the exhibit.
let penroseCard;
function penrosePreview() {
  return penroseCard ||= {
    outline: roomOutline(PENROSE, 72),
    rays: Array.from({length:480},(_,i)=>{
      const a=(i+.5)*TAU/480;
      return traceRoom(PENROSE,[0,0],[Math.cos(a),Math.sin(a)],12).points;
    })
  };
}

// Illustrated miniatures: common line weight and palette, with recognizable subject matter.
function subjectArt(kind, cv, opts) {
  return runner(cv,(g,W,H,t,C)=>{
    const s=Math.min(W/240,H/140), X=x=>W/2+(x-120)*s,Y=y=>H/2+(y-70)*s;
    const ink=C.ink, accent=C.accent, blue=C.c[0],gold=C.c[1];
    g.lineCap='round';g.lineJoin='round';
    const path=(pts,color=ink,width=2,fill=null)=>{g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(X(x),Y(y)):g.moveTo(X(x),Y(y)));if(fill){g.closePath();g.fillStyle=fill;g.fill();}g.strokeStyle=color;g.lineWidth=width*s;g.stroke();};
    const ellipse=(x,y,rx,ry,fill,color=ink,width=1.5)=>{g.beginPath();g.ellipse(X(x),Y(y),rx*s,ry*s,0,0,TAU);if(fill){g.fillStyle=fill;g.fill();}if(color){g.strokeStyle=color;g.lineWidth=width*s;g.stroke();}};
    const rect=(x,y,w,h,fill,color=ink)=>{path([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],color,1.5,fill);};
    const text=(v,x,y,size=13,color=ink)=>{g.font=`600 ${size*s}px sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillStyle=color;g.fillText(v,X(x),Y(y));};
    const arrow=(a,b,color=accent)=>{path([a,b],color,2);const angle=Math.atan2(b[1]-a[1],b[0]-a[0]);path([[b[0]-7*Math.cos(angle-.5),b[1]-7*Math.sin(angle-.5)],b,[b[0]-7*Math.cos(angle+.5),b[1]-7*Math.sin(angle+.5)]],color,2);};
    const floor=()=>{g.globalAlpha=.13;ellipse(120,117,88,5,ink,null);g.globalAlpha=1;};
    const sphere=(x,y,r,color)=>{const grad=g.createRadialGradient(X(x-r*.35),Y(y-r*.4),r*.05*s,X(x),Y(y),r*s);grad.addColorStop(0,C.surface);grad.addColorStop(.35,color);grad.addColorStop(1,ink);ellipse(x,y,r,r,grad,null);};
    if(kind==='monty-gallery'){
      floor();[34,99,164].forEach((x,i)=>{rect(x,26,43,85,C.surface);rect(x+4,30,35,77,i===1?gold:blue);ellipse(x+31,71,2,2,ink,null);text(String(i+1),x+21,43,10);});
      // Open the middle door to reveal a little car.
      rect(103,55,35,52,C.surface);path([[104,55],[117,61],[117,107],[104,107]],ink,1.5,gold);
      path([[122,81],[125,73],[133,73],[136,81]],ink,1.5,accent);rect(120,81,18,8,accent);ellipse(124,90,2.5,2.5,ink,null);ellipse(134,90,2.5,2.5,ink,null);
      arrow([55,19],[183,19]);
    }else if(kind==='birthdays-gallery'){
      // A crowd with one matching pair; the card title supplies the context.
      for(let row=0;row<3;row++)for(let col=0;col<5;col++){
        const x=42+col*39,y=23+row*38;
        const matched=(row===0&&col===1)||(row===2&&col===3);
        const colour=matched?accent:ink;
        g.globalAlpha=matched?1:.24;
        ellipse(x,y,6,6,colour,null);
        g.beginPath();g.moveTo(X(x-11),Y(y+26));g.lineTo(X(x-11),Y(y+16));
        g.bezierCurveTo(X(x-11),Y(y+7),X(x+11),Y(y+7),X(x+11),Y(y+16));
        g.lineTo(X(x+11),Y(y+26));g.closePath();g.fillStyle=colour;g.fill();
      }
      g.globalAlpha=1;
    }else if(kind==='benford-gallery'){
      path([[29,112],[215,112]],C.line,1);for(let i=1;i<=9;i++){let h=83*Math.log10(1+1/i)/Math.log10(2);rect(25+i*19,111-h,12,h,i===1?accent:blue,null);text(String(i),31+i*19,124,10);}
      text('30.1%',50,17,12,accent);
    }else if(kind==='secretary-gallery'){
      const heights=[20,40,27,54,38,71];floor();for(let i=0;i<6;i++){const x=37+i*32,h=heights[i];rect(x-9,109-h,18,h,i===5?accent:C.surface);ellipse(x,99-h,6,6,i===5?accent:blue,null);}
      g.setLineDash([4*s,4*s]);path([[128,21],[128,115]],C.line,1);g.setLineDash([]);text('1/e',90,22,17);arrow([149,28],[197,28]);
    }else if(kind==='tank-gallery'){
      floor();[43,91,139,187].forEach((x,i)=>{path([[x-15,49],[x+17,49],[x+20,85],[x-18,85]],ink,1.5,i===2?gold:C.surface);ellipse(x-17,62,2,2,ink,null);text(['12','38','68','?'][i],x,69,16);});
      path([[27,37],[27,28],[206,28],[206,37]],C.line,1.5);text('N?',120,111,18,accent);
    }else if(kind==='baker-gallery'){
      floor();
      // Traditional balance, with a loaf on the left and a cast-metal mass on the right.
      path([[100,109],[120,96],[140,109]],ink,1.5,gold);
      path([[120,101],[120,37]],ink,3);
      path([[62,49],[176,49]],ink,2.5);
      ellipse(120,49,4,4,gold);
      [65,175].forEach(x=>{
        path([[x,50],[x-24,91]],C.line,1.2);
        path([[x,50],[x+24,91]],C.line,1.2);
        path([[x-25,91],[x-17,97],[x+17,97],[x+25,91]],ink,1.5,gold);
      });
      ellipse(65,84,19,10,gold);
      for(let k=-1;k<=1;k++)path([[62+k*9,78],[67+k*9,85]],ink,1.3);
      // Rounded handle with a clear hole, sloping shoulders and an engraved mass.
      ellipse(175,65,6,6,C.surface,ink,2.5);
      path([[165,72],[185,72],[191,90],[159,90]],ink,1.5,blue);
      path([[165,72],[185,72],[181,76],[169,76]],ink,.8,C.surface);
      text('1 kg',175,84,9,C.surface);
    }else if(kind==='fair-division-gallery'){
      floor();ellipse(120,95,52,16,gold);rect(68,70,104,24,gold,null);ellipse(120,70,52,17,C.surface);for(const a of [-Math.PI/2,Math.PI/6,5*Math.PI/6])path([[120,70],[120+51*Math.cos(a),70+17*Math.sin(a)]],accent,2);[[95,63],[145,67],[117,79]].forEach(([x,y])=>ellipse(x,y,4,2.5,accent,null));
    }else if(kind==='fair-goods-gallery'){
      floor();[58,182].forEach((x,i)=>{ellipse(x,37,10,10,i?accent:blue,null);path([[x-18,68],[x-12,53],[x+12,53],[x+18,68]],ink,1.5,C.surface);});
      path([[38,96],[79,96],[73,113],[43,113],[38,96]],ink,1.5);path([[161,96],[202,96],[196,113],[166,113],[161,96]],ink,1.5);
      rect(105,55,27,30,gold);path([[118,55],[118,85],[105,65],[132,65]],ink,1);arrow([103,91],[77,91],blue);arrow([139,91],[164,91]);
    }else if(kind==='hairy-ball-gallery'){
      sphere(120,70,47,blue);for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const r=Math.hypot(i,j);if(r<.5||r>2.6)continue;const x=120+i*15,y=70+j*15,a=Math.atan2(j,i)+Math.PI/2;arrow([x,y],[x+8*Math.cos(a),y+8*Math.sin(a)],C.surface);}ellipse(120,70,4,4,accent,C.surface);
    }else if(kind==='nonorientable-surfaces-gallery'){
      // A half-twisted ribbon: draw its rear half before its front half.
      const strips=[];for(let i=0;i<120;i++){let a=i*TAU/120,b=(i+1)*TAU/120;const point=(u,v)=>{const r=49+v*Math.cos(u/2);const q=cam3Project(.25,.5,r*Math.cos(u),r*Math.sin(u),v*Math.sin(u/2));return [120+q.u*1.3,70-q.v*1.3];};strips.push({d:Math.sin(a),p:[point(a,-12),point(b,-12),point(b,12),point(a,12)],c:Math.cos(a/2)>0?blue:gold});}strips.sort((a,b)=>a.d-b.d);for(const q of strips)path(q.p,q.c,1,q.c);
    }else if(kind==='banach-tarski-gallery'){
      sphere(54,72,28,blue);sphere(174,45,25,blue);sphere(174,102,25,blue);arrow([91,72],[132,72]);path([[132,72],[140,45]],accent);path([[132,72],[140,102]],accent);
    }else if(kind==='double-pendulum-gallery'){
      floor();const draw=(a,b,color)=>{const p=[113+39*Math.sin(a),23+39*Math.cos(a)],q=[p[0]+43*Math.sin(b),p[1]+43*Math.cos(b)];path([[113,23],p,q],color,2.5);ellipse(...p,6,6,color,null);ellipse(...q,8,8,color,null);};g.globalAlpha=.2;draw(.75,-.2,blue);draw(.9,.05,blue);g.globalAlpha=1;draw(.65+.1*Math.sin(t*.5),-.6+.15*Math.sin(t*.7),accent);path([[94,21],[132,21]],ink,3);
    }else if(kind==='three-body-gallery'){
      const orbit=(phase,n=100)=>Array.from({length:n+1},(_,i)=>{let a=i*TAU/n+phase;return [120+75*Math.sin(a),70+34*Math.sin(2*a)];});path(orbit(0),C.line,1.4);for(let i=0;i<3;i++){let a=t*.25+i*TAU/3;sphere(120+75*Math.sin(a),70+34*Math.sin(2*a),7+i*2,[blue,gold,accent][i]);}
    }else if(kind==='logistic-gallery'){
      // Bifurcation diagram of x -> r*x*(1-x), computed, not decorative noise.
      g.fillStyle=accent;for(let i=0;i<160;i++){let r=2.8+1.2*i/159,x=.37;for(let k=0;k<180;k++)x=r*x*(1-x);for(let k=0;k<32;k++){x=r*x*(1-x);g.fillRect(X(30+i*1.13),Y(114-x*90),s,s);}}path([[27,20],[27,117],[216,117]],C.line,1);
    }else if(kind==='mirrored-rooms'){
      const room=penrosePreview(), map=([x,y])=>[120+x*17,70+y*12];
      const outline=room.outline.map(map);
      // Dark mirror chamber: rays leave the recessed end pockets unlit.
      path(outline,'#53657b',1.8,'#111b2d');
      g.save();g.beginPath();outline.forEach(([x,y],i)=>i?g.lineTo(X(x),Y(y)):g.moveTo(X(x),Y(y)));g.closePath();g.clip();
      g.globalAlpha=.035;
      for(const ray of room.rays)path(ray.map(map),'#f2bf60',1.1);
      g.globalAlpha=.75;
      for(const index of [17,161,257,401])path(room.rays[index].slice(0,5).map(map),'#ffd781',.8);
      g.globalAlpha=1;
      const glow=g.createRadialGradient(X(120),Y(70),s,X(120),Y(70),17*s);
      glow.addColorStop(0,'#fff9db');glow.addColorStop(.2,'#ffce6b');glow.addColorStop(1,'rgba(255,206,107,0)');
      ellipse(120,70,17,17,glow,null);
      ellipse(120,70,2.5,2.5,'#fff9db',null);
      g.restore();
    }
  },{reduced:opts.reduced,still:1});
}

export const ART = { gomboc:gombocArt, fourier: fourierArt, "fourier-home": (cv, o) => fourierArt(cv, { ...o, home: true }), "fourier-dark": (cv, o) => fourierArt(cv, { ...o, dark: true }), julia: juliaArt, "julia-dark": (cv, o) => juliaArt(cv, { ...o, dark: true }), mandelbrot: mandelArt, chaos: chaosArt, galton: galtonArt, reuleaux: reuleauxArt, platonic: platonicArt,
  life: lifeArt, 'square-packing': squaresArt, 'moving-sofa': sofaArt, 'inscribed-square': inscribedArt, 'opaque-square': opaqueArt, equidecomposition: equidecompositionArt,
  ...Object.fromEntries(['secretary-gallery','tank-gallery','benford-gallery','baker-gallery','birthdays-gallery','monty-gallery','fair-division-gallery','fair-goods-gallery','hairy-ball-gallery','nonorientable-surfaces-gallery','banach-tarski-gallery','double-pendulum-gallery','three-body-gallery','logistic-gallery','mirrored-rooms'].map(id => [id, (cv, o) => subjectArt(id, cv, o)])),
  ...Object.fromEntries(['voronoi','four-colours','fastest-slide','soap-films','knots','einstein'].map(id=>[id,(cv,o)=>newGalleryArt(id,cv,o)])) };
export function mountArt(cv, kind, opts = {}) { const f = ART[kind]; return f ? f(cv, opts) : () => {}; }
