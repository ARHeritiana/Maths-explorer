// Laboratory objects that are not a formula with sliders: the Galton board, Reuleaux polygons, the Platonic solids
// (with an animated explanation of why there are only five) and the chaos game. Each one is a small interactive
// scene mounted into #object-stage. The first part is pure mathematics (no DOM) so that it can be tested in Node.
const TAU = Math.PI * 2;
const PHI = (1 + Math.sqrt(5)) / 2;
export const clampN = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/* =============================================================== maths */
// Binomial distribution of the Galton board: bin k of n rows with probability p of going right.
export const binomial = (n, p) => { const out = []; let c = 1; for (let k = 0; k <= n; k++) { out.push(c * p ** k * (1 - p) ** (n - k)); c = (c * (n - k)) / (k + 1); } return out; };
export const pascalRow = (n) => { const out = [1]; for (let k = 0; k < n; k++) out.push((out[k] * (n - k)) / (k + 1)); return out.map(Math.round); };

// Reuleaux polygon with n (odd) vertices and constant width w. Vertices of the regular n-gon, arcs of radius w.
export function reuleaux(n, w = 1) {
  const R = w / (2 * Math.cos(Math.PI / (2 * n))), verts = Array.from({ length: n }, (_, k) => [R * Math.cos((TAU * k) / n + Math.PI / 2), R * Math.sin((TAU * k) / n + Math.PI / 2)]);
  const pts = [];
  const per = 90;
  for (let k = 0; k < n; k++) {
    const centre = (TAU * k) / n + Math.PI / 2 + Math.PI;   // arc centred on vertex k, facing away from it
    for (let i = 0; i <= per; i++) { const a = centre - Math.PI / (2 * n) + (Math.PI / n) * (i / per); pts.push([verts[k][0] + w * Math.cos(a), verts[k][1] + w * Math.sin(a), a]); }
  }
  pts.sort((u, v) => Math.atan2(u[1], u[0]) - Math.atan2(v[1], v[0]));
  const area = (n / 2) * R * R * Math.sin(TAU / n) + n * ((w * w) / 2) * (Math.PI / n - Math.sin(Math.PI / n));
  return { n, w, R, verts, pts: pts.map((p) => [p[0], p[1]]), perimeter: Math.PI * w, area, diskArea: (Math.PI * w * w) / 4 };
}
// Support function h(theta) = max over the boundary of p . u(theta), and the point reaching it.
export function support(shape, theta) {
  const ux = Math.cos(theta), uy = Math.sin(theta); let best = -Infinity, at = null;
  for (const p of shape.pts) { const v = p[0] * ux + p[1] * uy; if (v > best) { best = v; at = p; } }
  return { h: best, at };
}
export const widthAt = (shape, theta) => support(shape, theta).h + support(shape, theta + Math.PI).h;
// Radius of curvature of the boundary in direction theta (shape frame): w on arcs, 0 on vertex cones.
export function radiusAt(shape, theta) {
  const n = shape.n, a = (((theta - Math.PI / 2) % TAU) + TAU) % TAU, cone = TAU / (2 * n), idx = Math.floor((a + cone / 2) / cone);   // intervals of width pi/n centred on vertex directions (even) and arc directions (odd)
  return idx % 2 === 0 ? 0 : shape.w;
}
// Centre of the shape when it turns by angle psi inside a square of side w, touching its four sides.
export function inSquare(shape, psi) { const th = (t) => t - psi; return [support(shape, th(Math.PI)).h, support(shape, th(1.5 * Math.PI)).h]; }
// Rolling on the line y = 0 (turning clockwise): pre-integrate the distance travelled by the contact point.
export function rolling(shape, steps = 1440) {
  const dx = TAU / steps, cum = [0];
  for (let i = 0; i < steps * 2; i++) { const psi = -(i + 0.5) * dx; cum.push(cum[i] + radiusAt(shape, 1.5 * Math.PI - psi) * dx); }
  return (turn) => { const t = clampN(turn, 0, 2) * steps; const i = Math.min(Math.floor(t), steps * 2 - 1); return cum[i] + (cum[i + 1] - cum[i]) * (t - i); };
}

// The five Platonic solids from their classical coordinates; faces found as the planes with every vertex on one side.
const sign = [-1, 1];
const perm3 = (a, b, c) => [[a, b, c], [c, a, b], [b, c, a]];
function coordinates(name) {
  switch (name) {
    case "tetrahedron": return [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];
    case "cube": return sign.flatMap((x) => sign.flatMap((y) => sign.map((z) => [x, y, z])));
    case "octahedron": return [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    case "icosahedron": return sign.flatMap((s) => sign.flatMap((t) => perm3(0, s, t * PHI)));
    default: return [...sign.flatMap((x) => sign.flatMap((y) => sign.map((z) => [x, y, z]))), ...sign.flatMap((s) => sign.flatMap((t) => perm3(0, s / PHI, t * PHI)))];
  }
}
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => Math.hypot(...a);
export const SOLIDS = ["tetrahedron", "cube", "octahedron", "dodecahedron", "icosahedron"];
export const SCHLAFLI = { tetrahedron: [3, 3], cube: [4, 3], octahedron: [3, 4], dodecahedron: [5, 3], icosahedron: [3, 5] };
export function platonic(name) {
  const raw = coordinates(name), r = Math.max(...raw.map(norm)), verts = raw.map((v) => v.map((x) => x / r)), eps = 1e-9;
  const planes = new Map();
  for (let i = 0; i < verts.length; i++) for (let j = i + 1; j < verts.length; j++) for (let k = j + 1; k < verts.length; k++) {
    let n = cross(sub(verts[j], verts[i]), sub(verts[k], verts[i])); const len = norm(n); if (len < eps) continue;
    n = n.map((x) => x / len); let d = dot(n, verts[i]); if (d < 0) { n = n.map((x) => -x); d = -d; }
    if (verts.some((v) => dot(n, v) > d + 1e-7)) continue;
    const key = [...n, d].map((x) => Math.round(x * 1e6)).join(",");
    if (!planes.has(key)) planes.set(key, { n, d, idx: verts.map((v, m) => [v, m]).filter(([v]) => Math.abs(dot(n, v) - d) < 1e-7).map(([, m]) => m) });
  }
  const faces = [...planes.values()].map(({ n, idx }) => {
    const c = idx.reduce((s, m) => s.map((x, q) => x + verts[m][q] / idx.length), [0, 0, 0]), u = norm(sub(verts[idx[0]], c)) ? sub(verts[idx[0]], c).map((x) => x / norm(sub(verts[idx[0]], c))) : [1, 0, 0], v = cross(n, u);
    return { n, verts: idx.sort((a, b) => Math.atan2(dot(sub(verts[a], c), v), dot(sub(verts[a], c), u)) - Math.atan2(dot(sub(verts[b], c), v), dot(sub(verts[b], c), u))) };
  });
  const edges = new Set(); faces.forEach((f) => f.verts.forEach((a, i) => { const b = f.verts[(i + 1) % f.verts.length]; edges.add(a < b ? `${a}-${b}` : `${b}-${a}`); }));
  const [p, q] = SCHLAFLI[name];
  return { name, verts, faces, edges: [...edges].map((e) => e.split("-").map(Number)), p, q, V: verts.length, E: edges.size, F: faces.length };
}
// Why only five: q regular p-gons around a vertex. Their angles must add up to less than 360 degrees.
export const interiorAngle = (p) => (180 * (p - 2)) / p;
export function vertexVerdict(p, q) { const total = q * interiorAngle(p); return total < 360 - 1e-9 ? "solid" : Math.abs(total - 360) < 1e-9 ? "flat" : "overlap"; }
export const PLATONIC_CASES = [3, 4, 5, 6].flatMap((p) => [3, 4, 5, 6].map((q) => ({ p, q, verdict: vertexVerdict(p, q) })));

// Chaos game: contraction ratio of the regular k-gon fractal (1/2 for the triangle, 0.382 for the pentagon, ...).
export const gonContraction = (k) => { let s = 1; for (let j = 1; j <= Math.floor(k / 4); j++) s += Math.cos((TAU * j) / k); return 1 / (2 * s); };
export const sierpinskiCount = (level) => 3 ** level;
export const sierpinskiArea = (level) => 0.75 ** level;

/* ================================================================= UI */
import { NS, css, palette, canvasIn, field, bind, loopFor, idleGuard } from "./object-kit.js";
import { mountPlatonic } from "./platonic-explorer.js";
import { GALLERY_OBJECTS } from "./gallery-objects.js";
import { dynamicsGallery } from './gallery-dynamics.js';
import { voronoiWorld } from './gallery-voronoi.js';
import { fourColours } from './gallery-four-colour.js';
import { fastestSlide } from './gallery-fastest.js';
import { soapFilm } from './gallery-soap.js';
import { knotsInSpace } from './gallery-knots.js';
import { einsteinTiles } from './gallery-hat.js';
import { gameOfLife } from './gallery-life.js';
import { squarePacking } from './gallery-squares.js';
import { movingSofa } from './gallery-sofa.js';
import { inscribedSquare } from './gallery-inscribed.js';
import { opaqueSquare } from './gallery-opaque.js';
import { inferenceGallery } from './gallery-inference.js';
import { fairGallery } from './gallery-fair-division.js';
import { topologyGallery } from './gallery-topology.js';
import { illuminationGallery } from './illumination-content.js';
import { gomboc } from './gallery-gomboc.js';

/* ---------------------------------------------------------------- Galton */
function galton(root, { t, reduced, lang }) {
  let rows = 10, p = 0.5, counts = [], pending = [], total = 0, balls = [], continuous = false, pascal = false, theory = true, acc = 0;
  const reset = () => { counts = Array(rows + 1).fill(0); pending = Array(rows + 1).fill(0); total = 0; balls = []; };
  root.innerHTML = `
    <p class="act-help">${t("Chaque bille rencontre une rangée de clous : à chaque clou, elle part à droite avec la probabilité p, à gauche sinon. Lâche des billes et compare l’histogramme à la loi binomiale.", "Each ball meets a row of pegs: at each peg it goes right with probability p, left otherwise. Drop balls and compare the histogram with the binomial law.")}</p>
    <div class="obj-stage" id="gb-stage"></div>
    <div class="act-controls">${field("gb-rows", t("Rangées", "Rows"), 1, 15, 1, rows)}${field("gb-p", t("Probabilité p d’aller à droite", "Probability p of going right"), 0.05, 0.95, 0.05, p)}</div>
    <div class="act-controls">
      <button class="btn btn-primary" id="gb-one" type="button">${t("Lâcher une bille", "Drop one ball")}</button>
      <button class="btn btn-secondary" id="gb-run" type="button" aria-pressed="false">${t("En continu", "Keep dropping")}</button>
      <button class="btn btn-secondary" id="gb-100" type="button">${t("+ 100 d’un coup", "+ 100 at once")}</button>
      <button class="btn-quiet" id="gb-clear" type="button">${t("Vider", "Clear")}</button>
      <label class="act-check"><input id="gb-pascal" type="checkbox"> ${t("Nombres de chemins", "Path counts")}</label>
      <label class="act-check"><input id="gb-theory" type="checkbox" checked> ${t("Loi binomiale", "Binomial law")}</label>
    </div>
    <p class="act-readout" id="gb-read" role="status" aria-live="polite"></p>`;
  const o = canvasIn(root.querySelector("#gb-stage"), 640 / 470), g = o.g, read = root.querySelector("#gb-read");
  const geo = () => { const dx = Math.min(38, 580 / (rows + 1)), top = 30, dy = Math.min(24, 250 / (rows + 1)), cx = o.W / 2, base = top + rows * dy + 14; return { dx, dy, top, cx, base, bottom: o.H - 18, hmax: o.H - 18 - base - 26 }; };
  const pegX = (r, j, G) => G.cx + (j - r / 2) * G.dx, pegY = (r, G) => G.top + r * G.dy;
  const drop = (instant) => {
    const path = []; let j = 0; for (let r = 0; r < rows; r++) { const right = Math.random() < p; path.push(right); if (right) j++; }
    if (instant || reduced()) { counts[j]++; total++; return; }
    balls.push({ path, tau: 0, bin: j, slot: counts[j] + pending[j]++ });   // the slot it will take on the stack of its column
  };
  function stats() {
    if (!total) return t("Aucune bille pour l’instant. Théorie : moyenne np et écart type √(np(1−p)).", "No ball yet. Theory: mean np and standard deviation √(np(1−p)).");
    let m = 0; counts.forEach((c, k) => (m += c * k)); m /= total; let v = 0; counts.forEach((c, k) => (v += c * (k - m) ** 2)); v /= total;
    const f = (x) => (lang === "fr" ? String(Math.round(x * 100) / 100).replace(".", ",") : String(Math.round(x * 100) / 100));
    return `${total} ${t("billes", "balls")} · ${t("moyenne", "mean")} <strong>${f(m)}</strong> (${t("théorie", "theory")} ${f(rows * p)}) · ${t("écart type", "standard deviation")} <strong>${f(Math.sqrt(v))}</strong> (${t("théorie", "theory")} ${f(Math.sqrt(rows * p * (1 - p)))}).`;
  }
  let lastText = "";
  function draw(dt) {
    const C = palette(), G = geo();
    acc += dt; if (continuous && acc > 0.1 && balls.length < 70) { acc = 0; drop(false); }
    balls.forEach((b) => { b.tau += dt * 9; });
    for (const b of balls) if (b.tau >= rows + 1.4) { counts[b.bin]++; pending[b.bin]--; total++; b.done = true; }
    balls = balls.filter((b) => !b.done);
    g.clearRect(0, 0, o.W, o.H); g.fillStyle = C.sunken; g.fillRect(0, 0, o.W, o.H);
    // columns: the balls that have landed stay balls, packed from the floor of their column; the radius shrinks when a
    // column gets tall so that the fullest one still fits (a ball never turns into a bar)
    const pr = binomial(rows, p), fullest = Math.max(1, ...counts.map((c, k) => c + pending[k]));
    let R = 5, cols = Math.max(1, Math.floor((G.dx - 4) / (2 * R)));
    while (R > 1.2 && Math.ceil(fullest / cols) * 2 * R > G.hmax) { R -= 0.2; cols = Math.max(1, Math.floor((G.dx - 4) / (2 * R))); }
    const perBall = (2 * R) / cols, slot = (k, i) => [G.cx + (k - rows / 2) * G.dx - cols * R + R + (i % cols) * 2 * R, G.bottom - R - Math.floor(i / cols) * 2 * R];
    for (let k = 0; k <= rows; k++) {
      const x = G.cx + (k - rows / 2) * G.dx - G.dx / 2;
      g.strokeStyle = C.line; g.lineWidth = 1; g.strokeRect(x, G.base, G.dx, G.bottom - G.base);
      g.fillStyle = C.c[k % 8]; g.strokeStyle = C.ink; g.lineWidth = 0.8;
      for (let i = 0; i < counts[k]; i++) { const [bx, by] = slot(k, i); g.beginPath(); g.arc(bx, by, R * 0.92, 0, TAU); g.fill(); g.stroke(); }
      if (counts[k] && G.dx > 22) { const top = slot(k, counts[k] - 1)[1] - R; g.fillStyle = C.ink; g.font = "600 12px system-ui"; g.textAlign = "center"; g.fillText(counts[k], G.cx + (k - rows / 2) * G.dx, top - 4); }
    }
    if (theory && total) {
      g.strokeStyle = C.ink; g.lineWidth = 2; g.setLineDash([5, 4]); g.beginPath();
      for (let k = 0; k <= rows; k++) { const X = G.cx + (k - rows / 2) * G.dx, Y = G.bottom - pr[k] * total * perBall; k ? g.lineTo(X, Y) : g.moveTo(X, Y); }
      g.stroke(); g.setLineDash([]);
    }
    // pegs
    const pas = pascal ? pascalRow : null;
    for (let r = 0; r < rows; r++) for (let j = 0; j <= r; j++) {
      const x = pegX(r, j, G), y = pegY(r, G);
      g.fillStyle = C.muted; g.beginPath(); g.arc(x, y, 3.2, 0, TAU); g.fill();
      if (pas && G.dx > 20) { g.fillStyle = C.ink; g.font = "600 10px system-ui"; g.textAlign = "center"; g.fillText(pas(r)[j], x, y - 6); }
    }
    if (pas && G.dx > 20) for (let k = 0; k <= rows; k++) { g.fillStyle = C.accent; g.font = "700 11px system-ui"; g.textAlign = "center"; g.fillText(pas(rows)[k], G.cx + (k - rows / 2) * G.dx, G.base - 4); }
    // falling balls
    for (const b of balls) {
      const s = Math.min(b.tau, rows + 1.4); let j = 0, x, y;
      const whole = Math.floor(Math.min(s, rows)), frac = Math.min(s, rows) - whole;
      for (let r = 0; r < whole; r++) if (b.path[r]) j++;
      const nextJ = j + (whole < rows && b.path[whole] ? 1 : 0), x0 = pegX(whole, j, G) - (whole === 0 ? 0 : 0), x1 = pegX(whole + 1, nextJ, G);
      if (s <= rows) { x = lerp(pegX(whole, j - (whole ? 0 : 0), G), x1, frac); y = lerp(pegY(whole, G) - (whole === 0 ? 14 : 0), pegY(whole + 1, G), frac) - Math.sin(frac * Math.PI) * 5; void x0; }
      else { const [sx, sy] = slot(b.bin, b.slot), k = clampN(s - rows, 0, 1.4) / 1.4; x = lerp(G.cx + (b.bin - rows / 2) * G.dx, sx, k); y = lerp(pegY(rows, G) - 8, sy, k * k); }
      g.fillStyle = C.c[b.bin % 8]; g.strokeStyle = C.ink; g.lineWidth = 0.8; g.beginPath(); g.arc(x, y, R * 0.92, 0, TAU); g.fill(); g.stroke();
    }
    const text = stats(); if (text !== lastText && (!balls.length || total % 5 === 0)) { read.innerHTML = text; lastText = text; }
  }
  const lerp = (a, b, k) => a + (b - a) * k;
  bind(root, "gb-rows", (v) => { rows = v; reset(); lastText = ""; });
  bind(root, "gb-p", (v) => { p = v; reset(); lastText = ""; }, (v) => (lang === "fr" ? String(v).replace(".", ",") : String(v)));
  root.querySelector("#gb-one").addEventListener("click", () => drop(false));
  root.querySelector("#gb-100").addEventListener("click", () => { for (let i = 0; i < 100; i++) drop(true); lastText = ""; });
  root.querySelector("#gb-clear").addEventListener("click", () => { reset(); lastText = ""; });
  root.querySelector("#gb-pascal").addEventListener("change", (e) => (pascal = e.target.checked));
  root.querySelector("#gb-theory").addEventListener("change", (e) => (theory = e.target.checked));
  root.querySelector("#gb-run").addEventListener("click", (e) => { if (reduced()) return; continuous = !continuous; e.currentTarget.setAttribute("aria-pressed", String(continuous)); e.currentTarget.textContent = continuous ? t("Arrêter", "Stop") : t("En continu", "Keep dropping"); });
  o.cv.addEventListener('click',()=>drop(false));
  o.cv.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();drop(false);}});
  o.cv.setAttribute('aria-label',t('Planche de Galton : toucher ou Entrée pour lâcher une bille.','Galton board: tap or press Enter to drop a ball.'));
  reset(); o.redraw = () => draw(0);
  const stop = loopFor((dt) => draw(reduced() ? 0 : dt), reduced);
  return () => { stop(); o.navigation?.destroy(); };
}

/* -------------------------------------------------------------- Reuleaux */
function reuleauxLab(root, { t, reduced, lang }) {
  let n = 3, w = 6, mode = "square", psi = 0, playing = !reduced(), speed = 0.6;
  root.innerHTML = `
    <p class="act-help">${t("Un polygone de Reuleaux est un « rond » qui n’en est pas un : sa largeur est constante, comme celle d’un disque. Fais-le tourner et vérifie qu’il touche toujours les côtés.", "A Reuleaux polygon is a “round” shape that is not a circle: its width is constant, like a disk’s. Turn it and check that it always touches the sides.")}</p>
    <div class="obj-stage" id="rl-stage"></div>
    <div class="act-controls">
      <fieldset class="act-choice"><legend>${t("Nombre de sommets", "Number of vertices")}</legend>${[3, 5, 7, 9].map((k) => `<label><input type="radio" name="rl-n" value="${k}" ${k === 3 ? "checked" : ""}> ${k}</label>`).join("")}</fieldset>
      <fieldset class="act-choice"><legend>${t("Scène", "Scene")}</legend>
        <label><input type="radio" name="rl-mode" value="square" checked> ${t("Dans un carré", "In a square")}</label>
        <label><input type="radio" name="rl-mode" value="roll"> ${t("Il roule", "Rolling")}</label>
        <label><input type="radio" name="rl-mode" value="width"> ${t("Largeur mesurée", "Measured width")}</label></fieldset>
    </div>
    <div class="act-controls">${field("rl-w", t("Largeur w (cm)", "Width w (cm)"), 2, 10, 1, w)}${field("rl-psi", t("Rotation", "Rotation"), 0, 360, 1, 0)}
      <button class="btn btn-secondary" id="rl-play" type="button" aria-pressed="${playing}">${playing ? t("Pause", "Pause") : t("Lecture", "Play")}</button></div>
    <p class="act-readout" id="rl-read" role="status" aria-live="polite"></p>`;
  const o = canvasIn(root.querySelector("#rl-stage"), 640 / 420), g = o.g, read = root.querySelector("#rl-read");
  let shape = reuleaux(n, 1), roll = rolling(shape), paintedShape = [];
  const hitShape = ([x,y]) => { let yes=false;for(let i=0,j=paintedShape.length-1;i<paintedShape.length;j=i++){const a=paintedShape[i],b=paintedShape[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;};
  o.touchHit(hitShape);
  const f = (x, d = 2) => { const s = (Math.round(x * 10 ** d) / 10 ** d).toFixed(d); return lang === "fr" ? s.replace(".", ",") : s; };
  const fill = (C) => { g.fillStyle = C.accent; g.globalAlpha = 0.28; g.fill(); g.globalAlpha = 1; g.strokeStyle = C.accent; g.lineWidth = 3; g.stroke(); };
  function drawShape(C, cx, cy, S, rot) {   // S pixels per unit of width
    paintedShape = shape.pts.map(([x,y])=>[cx+S*(x*Math.cos(rot)-y*Math.sin(rot)),cy-S*(x*Math.sin(rot)+y*Math.cos(rot))]);
    g.beginPath(); shape.pts.forEach(([x, y], i) => { const X = cx + S * (x * Math.cos(rot) - y * Math.sin(rot)), Y = cy - S * (x * Math.sin(rot) + y * Math.cos(rot)); i ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.closePath(); fill(C);
    g.fillStyle = C.ink; shape.verts.forEach(([x, y]) => { g.beginPath(); g.arc(cx + S * (x * Math.cos(rot) - y * Math.sin(rot)), cy - S * (x * Math.sin(rot) + y * Math.cos(rot)), 4, 0, TAU); g.fill(); });
  }
  const idle = idleGuard(o);
  let lastDeg = -1;
  function draw(dt) {
    if (idle(playing, `${n}|${w}|${mode}|${psi}`)) return;
    const C = palette(); if (playing) { psi = (psi + dt * speed * 60 * (Math.PI / 180)) % TAU; const deg = Math.round((psi * 180) / Math.PI) % 360; if (deg !== lastDeg) { lastDeg = deg; root.querySelector("#rl-psi").value = deg; root.querySelector("#rl-psi-out").textContent = deg; } }
    g.clearRect(0, 0, o.W, o.H); g.fillStyle = C.sunken; g.fillRect(0, 0, o.W, o.H);
    const S = 250;
    if (mode === "square") {
      const x0 = (o.W - S) / 2, y0 = (o.H - S) / 2, [cx, cy] = inSquare(shape, psi);
      g.strokeStyle = C.ink; g.lineWidth = 3; g.strokeRect(x0, y0, S, S);
      drawShape(C, x0 + cx * S, y0 + S - cy * S, S, psi);
      // the four touching points
      g.fillStyle = C.neg; [[Math.PI, 0], [0, 0], [1.5 * Math.PI, 1], [0.5 * Math.PI, 1]].forEach(([a]) => { const s = support(shape, a - psi), px = s.at[0] * Math.cos(psi) - s.at[1] * Math.sin(psi) + cx, py = s.at[0] * Math.sin(psi) + s.at[1] * Math.cos(psi) + cy; g.beginPath(); g.arc(x0 + px * S, y0 + S - py * S, 5, 0, TAU); g.fill(); });
    } else if (mode === "roll") {
      const turn = psi / TAU, X = roll(turn), gy = o.H - 70, S2 = 180, th = 1.5 * Math.PI + psi;   // clockwise rotation: shape angle -psi
      const rot = -psi, sup = support(shape, 1.5 * Math.PI - rot), contact = [sup.at[0] * Math.cos(rot) - sup.at[1] * Math.sin(rot), sup.at[0] * Math.sin(rot) + sup.at[1] * Math.cos(rot)];
      const cy = -contact[1], cxw = X - contact[0], scroll = o.W * 0.5 - cxw * S2;
      g.strokeStyle = C.ink; g.lineWidth = 3; g.beginPath(); g.moveTo(0, gy); g.lineTo(o.W, gy); g.stroke();
      g.strokeStyle = C.muted; g.setLineDash([8, 6]); g.lineWidth = 2; g.beginPath(); g.moveTo(0, gy - S2); g.lineTo(o.W, gy - S2); g.stroke(); g.setLineDash([]);
      for (let k = -10; k < 40; k++) { const x = scroll + k * S2 * 0.5; if (x > -10 && x < o.W + 10) { g.strokeStyle = C.line; g.lineWidth = 1; g.beginPath(); g.moveTo(x, gy); g.lineTo(x, gy + 8); g.stroke(); } }
      drawShape(C, o.W * 0.5, gy - cy * S2, S2, rot); void th;
      g.fillStyle = C.neg; g.beginPath(); g.arc(o.W * 0.5 + (contact[0]) * S2, gy, 5, 0, TAU); g.fill();
      g.fillStyle = C.muted; g.font = "13px system-ui"; g.textAlign = "left"; g.fillText(t("Le haut de la forme reste à la même hauteur w : la ligne pointillée la touche toujours.", "The top of the shape stays at height w: the dashed line always touches it."), 14, 24);
    } else {
      const cx = o.W / 2, cy = o.H / 2, S2 = 210, th = psi, d = [Math.cos(th), Math.sin(th)];
      drawShape(C, cx, cy, S2, 0);
      // two parallel support lines perpendicular to direction th (shape rotated in the frame: rotate the direction instead)
      const hA = support(shape, th), hB = support(shape, th + Math.PI);
      g.strokeStyle = C.ink; g.lineWidth = 2.5;
      [hA, -hB.h].forEach((v, i) => { const h = i === 0 ? v.h : v; const px = cx + S2 * h * d[0], py = cy - S2 * h * d[1], nx = -d[1], ny = -d[0]; g.beginPath(); g.moveTo(px - nx * 190, py - ny * 190 * -1 * -1); g.lineTo(px + nx * 190, py + ny * 190 * -1 * -1); g.stroke(); });
      g.fillStyle = C.neg; [hA.at, hB.at].forEach((q) => { g.beginPath(); g.arc(cx + S2 * q[0], cy - S2 * q[1], 5, 0, TAU); g.fill(); });
    }
    read.innerHTML = `${t("Largeur", "Width")} w = <strong>${f(w)}</strong> cm · ${t("largeur mesurée", "measured width")} (${Math.round((psi * 180) / Math.PI) % 360}°) : <strong>${f(w * widthAt(shape, mode === "width" ? psi : psi + 0.7), 3)}</strong> cm · ${t("périmètre", "perimeter")} πw = <strong>${f(Math.PI * w)}</strong> cm (${t("celui du disque de même largeur", "the same as the disk of equal width")}) · ${t("aire", "area")} <strong>${f(shape.area * w * w)}</strong> cm² ${t("contre", "against")} ${f(shape.diskArea * w * w)} cm² ${t("pour le disque", "for the disk")}.`;
  }
  const set = () => { shape = reuleaux(n, 1); roll = rolling(shape); };
  root.querySelectorAll("[name=rl-n]").forEach((r) => r.addEventListener("change", () => { n = Number(r.value); set(); }));
  root.querySelectorAll("[name=rl-mode]").forEach((r) => r.addEventListener("change", () => { mode = r.value; }));
  bind(root, "rl-w", (v) => { w = v; });
  const psiEl = bind(root, "rl-psi", (v) => { psi = (v * Math.PI) / 180; playing = false; root.querySelector("#rl-play").textContent = t("Lecture", "Play"); root.querySelector("#rl-play").setAttribute("aria-pressed", "false"); });
  void psiEl;
  root.querySelector("#rl-play").addEventListener("click", (e) => { playing = !playing; e.currentTarget.textContent = playing ? t("Pause", "Pause") : t("Lecture", "Play"); e.currentTarget.setAttribute("aria-pressed", String(playing)); });
  let dragging=false;
  o.cv.addEventListener('pointerdown',e=>{if(e.button!==0||(e.pointerType==='touch'&&!hitShape(o.point(e))))return;dragging=true;playing=false;o.cv.setPointerCapture(e.pointerId);});
  o.cv.addEventListener('pointermove',e=>{if(!dragging)return;const [x,y]=o.point(e);psi=Math.atan2(o.H/2-y,x-o.W/2);root.querySelector('#rl-psi').value=((psi*180/Math.PI)%360+360)%360;root.querySelector('#rl-psi-out').textContent=Math.round(((psi*180/Math.PI)%360+360)%360);root.querySelector('#rl-play').setAttribute('aria-pressed','false');root.querySelector('#rl-play').textContent=t('Lecture','Play');draw(0);});
  for(const ev of ['pointerup','pointercancel','lostpointercapture','view-gesture'])o.cv.addEventListener(ev,()=>dragging=false);
  o.cv.style.cursor='grab';o.redraw=()=>draw(0);
  draw(0);
  const stop = loopFor((dt) => draw(reduced() ? 0 : dt), reduced);
  return () => { stop(); o.navigation?.destroy(); };
}

/* -------------------------------------------------------------- Platonic */
function platonicLab(root, options) {
  const names = {tetrahedron:['Tétraèdre','Tetrahedron'],cube:['Cube','Cube'],octahedron:['Octaèdre','Octahedron'],dodecahedron:['Dodécaèdre','Dodecahedron'],icosahedron:['Icosaèdre','Icosahedron']};
  return mountPlatonic(root, options, Object.fromEntries(SOLIDS.map(id=>[id,platonic(id)])), names, SCHLAFLI, interiorAngle, vertexVerdict);
}

/* ------------------------------------------------------------ Chaos game */
function chaos(root, { t, reduced, lang }) {
  let k = 3, ratio = 0.5, mode = "game", level = 3, pts = [], cur = [0.3, 0.3], playing = !reduced(), verts = [], blank = false;
  root.innerHTML = `
    <p class="act-help">${t("Jeu du chaos : on part d’un point, puis on avance à chaque fois d’une fraction r du chemin vers un sommet choisi au hasard. Les points dessinent une figure qui ne dépend pas du départ. Fais glisser les sommets.", "Chaos game: start from a point, then each time move a fraction r of the way towards a randomly chosen vertex. The points draw a figure that does not depend on the start. Drag the vertices.")}</p>
    <div class="obj-stage" id="ch-stage"></div>
    <div class="act-controls">
      <fieldset class="act-choice"><legend>${t("Mode", "Mode")}</legend>
        <label><input type="radio" name="ch-mode" value="game" checked> ${t("Jeu du chaos", "Chaos game")}</label>
        <label><input type="radio" name="ch-mode" value="level"> ${t("Construction par niveaux", "Built level by level")}</label></fieldset>
      <fieldset class="act-choice" id="ch-k"><legend>${t("Sommets", "Vertices")}</legend>${[3, 4, 5, 6].map((v) => `<label><input type="radio" name="ch-k" value="${v}" ${v === 3 ? "checked" : ""}> ${v}</label>`).join("")}</fieldset>
    </div>
    <div class="act-controls" id="ch-game">${field("ch-r", t("Fraction r du chemin", "Fraction r of the way"), 0.2, 0.8, 0.01, ratio)}
      <button class="btn btn-secondary" id="ch-best" type="button">${t("Valeur qui donne un joli motif", "Value that gives a clean pattern")}</button>
      <button class="btn btn-secondary" id="ch-play" type="button" aria-pressed="${playing}">${playing ? t("Pause", "Pause") : t("Lecture", "Play")}</button>
      <button class="btn-quiet" id="ch-clear" type="button">${t("Effacer", "Clear")}</button></div>
    <div class="act-controls" id="ch-lvl" hidden>${field("ch-level", t("Niveau", "Level"), 0, 6, 1, level)}</div>
    <p class="act-readout" id="ch-read" role="status" aria-live="polite"></p>`;
  const o = canvasIn(root.querySelector("#ch-stage"), 640 / 460), g = o.g, read = root.querySelector("#ch-read");
  const layout = () => { verts = Array.from({ length: k }, (_, i) => { const a = -Math.PI / 2 + (TAU * i) / k, R = 190; return [o.W / 2 + R * Math.cos(a) * (k === 3 ? 1.05 : 1), o.H / 2 + 12 + R * Math.sin(a) * (k === 3 ? 1.05 : 1) - (k === 3 ? 18 : 0)]; }); pts = []; cur = [o.W / 2, o.H / 2]; g.clearRect(0, 0, o.W, o.H); };
  const f = (x) => (lang === "fr" ? String(Math.round(x * 1000) / 1000).replace(".", ",") : String(Math.round(x * 1000) / 1000));
  let layer = null; // offscreen accumulation of points
  const ensureLayer = () => { if (!layer) { layer = document.createElement("canvas"); layer.width = o.W; layer.height = o.H; } return layer; };
  function step(count) { const lg = ensureLayer().getContext("2d"), C = palette(); lg.fillStyle = C.accent; for (let i = 0; i < count; i++) { const v = verts[Math.floor(Math.random() * k)]; cur = [cur[0] + (v[0] - cur[0]) * ratio, cur[1] + (v[1] - cur[1]) * ratio]; if (pts.length++ > 12) lg.fillRect(cur[0], cur[1], 1.6, 1.6); } }
  function triangle(lg, a, b, c, lv) { if (lv === 0) { lg.beginPath(); lg.moveTo(...a); lg.lineTo(...b); lg.lineTo(...c); lg.closePath(); lg.fill(); return; } const mid = (u, v) => [(u[0] + v[0]) / 2, (u[1] + v[1]) / 2]; const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a); triangle(lg, a, ab, ca, lv - 1); triangle(lg, ab, b, bc, lv - 1); triangle(lg, ca, bc, c, lv - 1); }
  const idle = idleGuard(o);
  let lastRead = "";
  const setRead = (h) => { if (h !== lastRead) { lastRead = h; read.innerHTML = h; } };
  function draw() {
    if (idle(playing && mode === "game" && !reduced(), `${mode}|${level}|${k}|${ratio}|${pts.length}|${blank}|${verts.join()}`)) return;
    const C = palette(); g.clearRect(0, 0, o.W, o.H); g.fillStyle = C.sunken; g.fillRect(0, 0, o.W, o.H);
    if (mode === "game") {
      // A move of a vertex (or of r, or of the number of vertices) empties the layer: refill it at once with a burst of
      // points, whether or not the animation is playing, so that the figure never vanishes while the vertex is dragged.
      if (!pts.length && !blank) step(20000); else if (playing && !reduced()) { blank = false; step(900); }
      if (layer) g.drawImage(layer, 0, 0);
      verts.forEach((v, i) => { g.fillStyle = C.obj2; g.strokeStyle = C.ink; g.lineWidth = 2; g.beginPath(); g.arc(v[0], v[1], 9, 0, TAU); g.fill(); g.stroke(); g.fillStyle = C.ink; g.font = "700 13px system-ui"; g.textAlign = "center"; g.fillText("ABCDEF"[i], v[0], v[1] - 15); });
      setRead(`${pts.length.toLocaleString(lang === "fr" ? "fr-FR" : "en-US")} ${t("points", "points")} · r = <strong>${f(ratio)}</strong> · ${t("pour", "for")} ${k} ${t("sommets, la valeur", "vertices, the value")} <strong>${f(1 - gonContraction(k))}</strong> ${t("donne une figure de type fractal (r = 1/2 pour le triangle)", "gives a fractal figure (r = 1/2 for the triangle)")}.`);
    } else {
      g.fillStyle = C.accent; const R = 200, cx = o.W / 2, cy = o.H / 2 + 20; triangle(g, [cx, cy - R * 0.95], [cx - R * 1.05, cy + R * 0.7], [cx + R * 1.05, cy + R * 0.7], level);
      setRead(`${t("Niveau", "Level")} <strong>${level}</strong> : ${t("triangles pleins", "filled triangles")} 3<sup>${level}</sup> = <strong>${sierpinskiCount(level)}</strong> · ${t("aire restante", "remaining area")} (3/4)<sup>${level}</sup> ≈ <strong>${f(sierpinskiArea(level) * 100)} %</strong> ${t("de l’aire du grand triangle", "of the big triangle’s area")}.`);
    }
  }
  const restart = () => { layer = null; blank = false; layout(); };
  root.querySelectorAll("[name=ch-mode]").forEach((r) => r.addEventListener("change", () => { mode = r.value; root.querySelector("#ch-game").hidden = mode !== "game"; root.querySelector("#ch-lvl").hidden = mode === "game"; root.querySelector("#ch-k").hidden = mode !== "game"; }));
  root.querySelectorAll("[name=ch-k]").forEach((r) => r.addEventListener("change", () => { k = Number(r.value); ratio = k === 3 ? 0.5 : Math.round((1 - gonContraction(k)) * 100) / 100; root.querySelector("#ch-r").value = ratio; root.querySelector("#ch-r-out").textContent = ratio; restart(); }));
  bind(root, "ch-r", (v) => { ratio = v; restart(); }, (v) => (lang === "fr" ? String(v).replace(".", ",") : String(v)));
  bind(root, "ch-level", (v) => { level = v; });
  root.querySelector("#ch-best").addEventListener("click", () => { ratio = Math.round((1 - gonContraction(k)) * 100) / 100; root.querySelector("#ch-r").value = ratio; root.querySelector("#ch-r-out").textContent = ratio; restart(); });
  root.querySelector("#ch-play").addEventListener("click", (e) => { playing = !playing; e.currentTarget.textContent = playing ? t("Pause", "Pause") : t("Lecture", "Play"); e.currentTarget.setAttribute("aria-pressed", String(playing)); if (reduced()) { restart(); } });
  root.querySelector("#ch-clear").addEventListener("click", () => { restart(); blank = true; });
  let grab = -1, selectedVertex = 0;
  const vertexAt = (p,r) => verts.findIndex(v=>Math.hypot(v[0]-p[0],v[1]-p[1])<r);
  o.touchHit(p=>mode==="game"&&vertexAt(p,40)>=0);
  o.cv.addEventListener("pointerdown", (e) => { if (mode !== "game") return; const [x, y] = o.point(e); grab = vertexAt([x,y],e.pointerType==="touch"?40:24); if (grab >= 0) { selectedVertex=grab;o.cv.setPointerCapture(e.pointerId); } });
  o.cv.addEventListener("pointermove", (e) => { if (grab < 0) return; const [x, y] = o.point(e); verts[grab] = [clampN(x, 10, o.W - 10), clampN(y, 10, o.H - 10)]; layer = null; blank = false; pts = []; cur = [o.W / 2, o.H / 2]; });
  const up = () => { grab = -1; }; o.cv.addEventListener("pointerup", up); o.cv.addEventListener("pointercancel", up); o.cv.addEventListener("lostpointercapture", up); o.cv.addEventListener("view-gesture", up);
  o.cv.addEventListener("keydown",e=>{if(e.shiftKey||mode!=="game")return;if(e.key==='['||e.key===']'){selectedVertex=(selectedVertex+(e.key===']'?1:k-1))%k;e.preventDefault();return;}const d={ArrowLeft:[-5,0],ArrowRight:[5,0],ArrowUp:[0,-5],ArrowDown:[0,5]}[e.key];if(!d)return;e.preventDefault();selectedVertex%=k;verts[selectedVertex]=[clampN(verts[selectedVertex][0]+d[0],10,o.W-10),clampN(verts[selectedVertex][1]+d[1],10,o.H-10)];layer=null;blank=false;pts=[];cur=[o.W/2,o.H/2];draw();});
  o.cv.setAttribute('aria-label',t('Sommets : [ et ] pour choisir, flèches pour déplacer.','Vertices: [ and ] select, arrow keys move.'));
  layout(); o.redraw = () => draw();
  const stop = loopFor(() => draw(), reduced);
  return () => { stop(); o.navigation?.destroy(); };
}

export const OBJECTS = { ...Object.fromEntries(["double-pendulum", "three-body", "logistic"].map(id => [id + "-gallery", dynamicsGallery(id)])), "mirrored-rooms":illuminationGallery, gomboc, ...Object.fromEntries(["secretary", "tank", "benford", "baker", "birthdays", "monty"].map(id => [id + "-gallery", inferenceGallery(id)])), galton, reuleaux: reuleauxLab, platonic: platonicLab, chaos, ...GALLERY_OBJECTS, voronoi:voronoiWorld, 'fastest-slide':fastestSlide, 'soap-films':soapFilm, knots:knotsInSpace, einstein:einsteinTiles, 'four-colours':fourColours, life:gameOfLife, 'square-packing':squarePacking, 'moving-sofa':movingSofa, 'inscribed-square':inscribedSquare, 'opaque-square':opaqueSquare };
Object.assign(OBJECTS, {'fair-division-gallery':fairGallery('fair-division'),'fair-goods-gallery':fairGallery('fair-goods'),'hairy-ball-gallery':topologyGallery('hairy-ball'),'nonorientable-surfaces-gallery':topologyGallery('nonorientable-surfaces'),'banach-tarski-gallery':topologyGallery('banach-tarski-model')});
export const isObject = (id) => Object.hasOwn(OBJECTS, id);
export function mountObject(id, root, { lang, reduced, ...options }) {
  const t = (fr, en) => (lang === "fr" ? fr : en);
  const stop = OBJECTS[id](root, { ...options, t, reduced: typeof reduced === "function" ? reduced : () => !!reduced, lang });
  return stop || (() => {});
}
void NS;
