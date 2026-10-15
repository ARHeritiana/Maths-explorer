// Curiosity gallery, objects that are not a formula with sliders: circles that redraw any closed curve (Madagascar, a heart,
// a star or your own drawing) and a Mandelbrot explorer with a live Julia set. Mounted into #object-stage like the other
// laboratory objects; the mathematics lives in gallery-math.js.
import { canvasIn, palette, loopFor } from "./object-kit.js";
import { escape, MADAGASCAR, planar, resample, fourier, arms, heart, star } from "./gallery-math.js";

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const SHAPES = {
  madagascar: () => planar(MADAGASCAR).map(([x, y]) => [x, y]),
  heart: () => heart(160),
  star: () => star(160),
};

/* ============================================================ Fourier */
function fourierLab(root, { t, reduced, lang }) {
  const N = 160, fmt = (v, d = 1) => (lang === "fr" ? String(Math.round(v * 10 ** d) / 10 ** d).replace(".", ",") : String(Math.round(v * 10 ** d) / 10 ** d));
  let shape = "madagascar", pts = [], co = [], count = 1, auto = true, showCircles = true, showFull = true, phase = 0, trail = [], drawing = null, userCurve = null, scale = 1, centre = [0, 0], acc = 0;
  root.innerHTML = `
    <p class="act-help">${t("Chaque cercle tourne à vitesse constante, centré sur le bout du précédent. Ensemble, ils redessinent une forme fermée. Ajoute des cercles : la forme se précise. Tu peux aussi dessiner la tienne.", "Each circle turns at a constant speed, centred on the tip of the previous one. Together they redraw a closed shape. Add circles: the shape sharpens. You can also draw your own.")}</p>
    <div class="obj-stage" id="fr-stage"></div>
    <div class="act-controls">
      <fieldset class="act-choice"><legend>${t("Forme", "Shape")}</legend>
        ${[["madagascar", "Madagascar", "Madagascar"], ["heart", "Cœur", "Heart"], ["star", "Étoile", "Star"], ["mine", "Ma forme", "My shape"]].map(([v, fr, en]) => `<label><input type="radio" name="fr-shape" value="${v}" ${v === shape ? "checked" : ""}> ${t(fr, en)}</label>`).join("")}</fieldset>
    </div>
    <div class="act-controls">
      <label class="act-field" for="fr-n"><span class="act-label">${t("Nombre de cercles", "Number of circles")} <output id="fr-n-out">1</output></span><input id="fr-n" type="range" min="1" max="80" step="1" value="1"></label>
      <label class="act-check"><input id="fr-circles" type="checkbox" checked> ${t("Montrer les cercles", "Show the circles")}</label>
      <label class="act-check"><input id="fr-full" type="checkbox" checked> ${t("Montrer la forme à atteindre", "Show the target shape")}</label>
    </div>
    <p class="act-readout" id="fr-read" role="status" aria-live="polite"></p>`;
  const o = canvasIn(root.querySelector("#fr-stage"), 640 / 420), g = o.g, read = root.querySelector("#fr-read"), slider = root.querySelector("#fr-n"), out = root.querySelector("#fr-n-out");
  o.cv.style.touchAction = "none"; o.cv.style.cursor = "crosshair";
  const setShape = (name, raw) => {
    const r0 = resample(raw ?? SHAPES[name](), N), mx = r0.reduce((q, p) => q + p[0] / N, 0), my = r0.reduce((q, p) => q + p[1] / N, 0);
    pts = r0.map((p) => [p[0] - mx, p[1] - my]); co = fourier(pts);   // centred: the constant term vanishes and every circle turns
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
    scale = Math.min((o.W - 120) / w, (o.H - 80) / h); centre = [(Math.max(...xs) + Math.min(...xs)) / 2, (Math.max(...ys) + Math.min(...ys)) / 2];
    trail = []; phase = 0; auto = shape !== "mine" || !!raw;
    if (name !== "mine" || raw) { count = 1; slider.value = 1; }
    update();
  };
  const toScreen = (x, y) => [o.W / 2 + (x - centre[0]) * scale, o.H / 2 - (y - centre[1]) * scale];
  const rms = () => Math.sqrt(co.reduce((s, c) => s + c.amp ** 2, 0));
  function update() {
    out.textContent = count; slider.value = count;
    if (reduced()) frame(0, 0);
    if (!co.length) { read.textContent = t("Dessine une forme fermée avec le doigt ou la souris.", "Draw a closed shape with your finger or the mouse."); return; }
    const left = Math.sqrt(co.slice(count).reduce((s, c) => s + c.amp ** 2, 0)), pct = (100 * left) / rms();
    read.innerHTML = `${count} ${t(count > 1 ? "cercles" : "cercle", count > 1 ? "circles" : "circle")} · ${t("écart moyen avec la forme", "mean gap from the shape")} : <strong>${fmt(pct)} %</strong> ${t("de sa taille", "of its size")}${count < co.length ? "" : ` · ${t("tous les cercles : la forme est exacte", "all the circles: the shape is exact")}`}`;
  }
  function frame(dt, now) {
    const C = palette();
    if (auto && count < 60) { acc += dt; if (acc > 0.32) { acc = 0; count++; update(); } }
    if (!reduced() && !drawing) phase = (phase + dt / 14) % 1;
    g.clearRect(0, 0, o.W, o.H); g.fillStyle = C.sunken; g.fillRect(0, 0, o.W, o.H);
    if (drawing) {
      g.strokeStyle = C.accent; g.lineWidth = 3; g.lineCap = "round"; g.beginPath(); drawing.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke();
      g.fillStyle = C.muted; g.font = "600 13px system-ui"; g.textAlign = "center"; g.fillText(t("Lâche pour fermer la forme", "Release to close the shape"), o.W / 2, o.H - 14);
      return;
    }
    if (!co.length) { g.fillStyle = C.muted; g.font = "600 16px system-ui"; g.textAlign = "center"; g.fillText(t("Dessine une forme fermée ici", "Draw a closed shape here"), o.W / 2, o.H / 2); return; }
    if (showFull) { g.strokeStyle = C.line; g.lineWidth = 2; g.setLineDash([4, 5]); g.beginPath(); pts.forEach((p, i) => { const [x, y] = toScreen(p[0], p[1]); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.stroke(); g.setLineDash([]); }
    // the whole curve drawn by the first `count` circles, then the arms and the moving tip
    const chain = arms(co, phase, count), tip = chain[chain.length - 1];
    g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = C.accent; g.lineWidth = 3.2; g.beginPath();
    for (let i = 0; i <= 240; i++) { const q = arms(co, i / 240, count).at(-1), [x, y] = toScreen(q[0], q[1]); i ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke(); g.lineWidth = 1;
    if (showCircles) for (let i = 1; i < chain.length; i++) {
      const [px, py] = toScreen(chain[i - 1][0], chain[i - 1][1]), [qx, qy] = toScreen(chain[i][0], chain[i][1]), r = chain[i][2] * scale;
      g.strokeStyle = C.muted; g.globalAlpha = 0.55; g.lineWidth = 1; if (r > 0.5) { g.beginPath(); g.arc(px, py, r, 0, TAU); g.stroke(); }
      g.globalAlpha = 0.9; g.strokeStyle = C.ink; g.beginPath(); g.moveTo(px, py); g.lineTo(qx, qy); g.stroke();
    }
    g.globalAlpha = 1; const [tx, ty] = toScreen(tip[0], tip[1]); g.fillStyle = C.neg; g.beginPath(); g.arc(tx, ty, 5, 0, TAU); g.fill();
    void now;
  }
  const stop = loopFor((dt, now) => frame(reduced() ? 0 : dt, now), reduced);
  o.redraw = () => frame(0, 0);
  // controls
  slider.addEventListener("input", () => { count = Number(slider.value); auto = false; trail = []; update(); });
  root.querySelectorAll('[name="fr-shape"]').forEach((r) => r.addEventListener("change", () => {
    shape = r.value;
    if (shape !== "mine") setShape(shape); else if (userCurve) setShape("mine", userCurve); else { pts = []; co = []; trail = []; update(); }
  }));
  root.querySelector("#fr-circles").addEventListener("change", (e) => (showCircles = e.target.checked));
  root.querySelector("#fr-full").addEventListener("change", (e) => (showFull = e.target.checked));
  // freehand drawing, in any mode: a stroke becomes the new shape
  o.cv.addEventListener("pointerdown", (e) => { drawing = [o.point(e)]; o.cv.setPointerCapture(e.pointerId); e.preventDefault(); });
  o.cv.addEventListener("pointermove", (e) => { if (drawing) drawing.push(o.point(e)); });
  const finish = () => {
    if (!drawing) return;
    const stroke = drawing; drawing = null;
    if (stroke.length < 12) return;
    userCurve = stroke.map(([x, y]) => [x, -y]); shape = "mine"; root.querySelector('[name="fr-shape"][value="mine"]').checked = true;
    setShape("mine", userCurve);
  };
  o.cv.addEventListener("pointerup", finish); o.cv.addEventListener("pointercancel", () => (drawing = null));
  o.cv.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });
  setShape("madagascar");
  if (reduced()) { count = 40; auto = false; update(); }
  return stop;
}

/* =========================================================== Mandelbrot */
function mandelbrotLab(root, { t, reduced, lang }) {
  const SEAHORSE = [-0.743643887037151, 0.13182590420533], W0 = 3.4;
  let cx = -0.5, cy = 0, w = W0, cSel = [-0.4, 0.6], drag = null, flying = null, dirty = true, hq = true, last = "";
  root.innerHTML = `
    <p class="act-help">${t("Chaque point c du plan est testé : on répète z → z² + c depuis 0. S’il ne s’échappe jamais, c est noir. Déplace le pointeur : l’ensemble de Julia de c change à droite. Glisse pour te déplacer, molette ou boutons pour zoomer.", "Every point c of the plane is tested: repeat z → z² + c from 0. If it never escapes, c is black. Move the pointer: the Julia set of c changes on the right. Drag to pan, wheel or buttons to zoom.")}</p>
    <div class="mb-grid"><div class="obj-stage" id="mb-stage"></div><div class="obj-stage mb-julia" id="mb-julia"></div></div>
    <div class="act-controls">
      <button class="btn btn-secondary" id="mb-in" type="button">${t("Zoomer", "Zoom in")}</button>
      <button class="btn btn-secondary" id="mb-out" type="button">${t("Dézoomer", "Zoom out")}</button>
      <button class="btn btn-primary" id="mb-fly" type="button">${t("Voyage vers la vallée des hippocampes", "Fly to the seahorse valley")}</button>
      <button class="btn-quiet" id="mb-reset" type="button">${t("Revenir au début", "Back to the start")}</button>
    </div>
    <p class="act-readout" id="mb-read" role="status" aria-live="polite"></p>`;
  const o = canvasIn(root.querySelector("#mb-stage"), 640 / 400), j = canvasIn(root.querySelector("#mb-julia"), 640 / 400), read = root.querySelector("#mb-read");
  o.cv.style.touchAction = "none"; o.cv.style.cursor = "crosshair";
  const maxIt = () => clamp(Math.round(90 + 38 * Math.log2(W0 / w)), 90, 1500);
  // cosine palette on the smooth escape time; the inside of the set is dark
  const colour = (v, max) => {
    if (v >= max) return 0xff140c0a;
    const k = 0.045 * v + 0.2, r = 0.5 + 0.5 * Math.cos(TAU * (k + 0.0)), gg = 0.5 + 0.5 * Math.cos(TAU * (k + 0.12)), b = 0.5 + 0.5 * Math.cos(TAU * (k + 0.28));
    return (255 << 24) | ((b * 235 + 12) << 16) | ((gg * 220 + 12) << 8) | (r * 215 + 20);
  };
  const off = document.createElement("canvas"), oj = document.createElement("canvas");
  function renderMain(res) {
    const pw = Math.round(o.W / res), ph = Math.round(o.H / res); off.width = pw; off.height = ph;
    const c2 = off.getContext("2d"), img = c2.createImageData(pw, ph), px = new Uint32Array(img.data.buffer), max = maxIt(), h = (w * o.H) / o.W;
    for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) {
      const cr = cx + ((x + 0.5) / pw - 0.5) * w, ci = cy - ((y + 0.5) / ph - 0.5) * h;
      px[y * pw + x] = colour(escape(0, 0, cr, ci, max, true), max);
    }
    c2.putImageData(img, 0, 0); o.g.imageSmoothingEnabled = true; o.g.drawImage(off, 0, 0, o.W, o.H);
    const [sx, sy] = [(0.5 + (cSel[0] - cx) / w) * o.W, (0.5 - (cSel[1] - cy) / h) * o.H];
    o.g.strokeStyle = "#fff"; o.g.lineWidth = 2; o.g.beginPath(); o.g.arc(sx, sy, 8, 0, TAU); o.g.moveTo(sx - 13, sy); o.g.lineTo(sx + 13, sy); o.g.moveTo(sx, sy - 13); o.g.lineTo(sx, sy + 13); o.g.stroke();
  }
  function renderJulia() {
    const res = 2, pw = Math.round(j.W / res), ph = Math.round(j.H / res); oj.width = pw; oj.height = ph;
    const c2 = oj.getContext("2d"), img = c2.createImageData(pw, ph), px = new Uint32Array(img.data.buffer), W = 3.2, h = (W * j.H) / j.W;
    for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) px[y * pw + x] = colour(escape(((x + 0.5) / pw - 0.5) * W, -((y + 0.5) / ph - 0.5) * h, cSel[0], cSel[1], 110, true), 110);
    c2.putImageData(img, 0, 0); j.g.drawImage(oj, 0, 0, j.W, j.H);
  }
  const f = (v) => (lang === "fr" ? String(Math.round(v * 1e6) / 1e6).replace(".", ",") : String(Math.round(v * 1e6) / 1e6));
  function readout() {
    const max = 300, n = escape(0, 0, cSel[0], cSel[1], max), sign = cSel[1] < 0 ? "−" : "+", txt = `c = ${f(cSel[0])} ${sign} ${f(Math.abs(cSel[1]))} i`;
    const s = n >= max ? t(`${txt} : la suite ne s’échappe pas (au moins ${max} itérations) : c est dans l’ensemble de Mandelbrot.`, `${txt}: the sequence does not escape (at least ${max} iterations): c is in the Mandelbrot set.`) : t(`${txt} : |z| dépasse 2 après ${n} itérations : c n’est pas dans l’ensemble.`, `${txt}: |z| exceeds 2 after ${n} iterations: c is not in the set.`);
    if (s !== last) { read.textContent = s; last = s; }
  }
  const view = () => ({ h: (w * o.H) / o.W });
  const toC = (e) => { const [x, y] = o.point(e), { h } = view(); return [cx + (x / o.W - 0.5) * w, cy - (y / o.H - 0.5) * h]; };
  const draw = () => { if (!dirty) return; dirty = false; renderMain(hq ? 2 : 4); renderJulia(); readout(); };
  const stop = loopFor((dt) => {
    if (flying) {
      flying.t = Math.min(1, flying.t + dt / 16); const k = flying.t * flying.t * (3 - 2 * flying.t);
      w = Math.exp(Math.log(W0) + (Math.log(4e-4) - Math.log(W0)) * k); cx = -0.5 + (SEAHORSE[0] + 0.5) * Math.min(1, k * 1.6); cy = SEAHORSE[1] * Math.min(1, k * 1.6);
      hq = false; dirty = true; if (flying.t >= 1) { flying = null; hq = true; }
    }
    draw();
  }, () => false);
  o.redraw = () => { dirty = true; }; j.redraw = () => { dirty = true; };
  const setSel = (c) => { cSel = c; dirty = true; };
  o.cv.addEventListener("pointermove", (e) => { if (drag) { const { h } = view(), dx = ((e.clientX - drag.x) / o.cv.getBoundingClientRect().width) * w, dy = ((e.clientY - drag.y) / o.cv.getBoundingClientRect().height) * h; cx = drag.cx - dx; cy = drag.cy + dy; hq = false; dirty = true; return; } if (e.pointerType === "mouse") setSel(toC(e)); });
  o.cv.addEventListener("pointerdown", (e) => { flying = null; drag = { x: e.clientX, y: e.clientY, cx, cy, moved: false, id: e.pointerId }; o.cv.setPointerCapture(e.pointerId); });
  o.cv.addEventListener("pointerup", (e) => { if (!drag) return; const moved = Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 5; drag = null; hq = true; if (!moved) setSel(toC(e)); dirty = true; });
  o.cv.addEventListener("pointercancel", () => { drag = null; hq = true; dirty = true; });
  o.cv.addEventListener("wheel", (e) => { e.preventDefault(); const c = toC(e), k = e.deltaY < 0 ? 0.7 : 1 / 0.7; w = clamp(w * k, 2e-13, 6); cx = c[0] + (cx - c[0]) * k; cy = c[1] + (cy - c[1]) * k; dirty = true; }, { passive: false });
  const zoom = (k) => { w = clamp(w * k, 2e-13, 6); dirty = true; };
  root.querySelector("#mb-in").addEventListener("click", () => zoom(0.5));
  root.querySelector("#mb-out").addEventListener("click", () => zoom(2));
  root.querySelector("#mb-reset").addEventListener("click", () => { flying = null; cx = -0.5; cy = 0; w = W0; hq = true; dirty = true; });
  root.querySelector("#mb-fly").addEventListener("click", () => { if (reduced()) { cx = SEAHORSE[0]; cy = SEAHORSE[1]; w = 0.02; hq = true; dirty = true; return; } cx = -0.5; cy = 0; w = W0; flying = { t: 0 }; });
  o.cv.tabIndex = 0; o.cv.setAttribute("role", "application"); o.cv.setAttribute("aria-label", t("Ensemble de Mandelbrot : flèches pour se déplacer, + et − pour zoomer", "Mandelbrot set: arrow keys to pan, + and − to zoom"));
  o.cv.addEventListener("keydown", (e) => { const s = w * 0.1, d = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, s], ArrowDown: [0, -s] }[e.key]; if (d) { e.preventDefault(); cx += d[0]; cy += d[1]; dirty = true; } else if (e.key === "+" || e.key === "=") zoom(0.7); else if (e.key === "-") zoom(1 / 0.7); });
  void stop; return stop;
}

export const GALLERY_OBJECTS = { fourier: fourierLab, mandelbrot: mandelbrotLab };
