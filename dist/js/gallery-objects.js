// Curiosity gallery, objects that are not a formula with sliders: circles that redraw any closed curve (Madagascar, a heart,
// a star or your own drawing) and a Mandelbrot explorer with a live Julia set. Mounted into #object-stage like the other
// laboratory objects; the mathematics lives in gallery-math.js.
import { navigationButtons } from "./canvas-navigation.js";
import { canvasIn, palette, loopFor } from "./object-kit.js";
import { escape, MADAGASCAR, resample, fourier, arms, heart, star, COUNT_SCHEDULE, REVOLUTION } from "./gallery-math.js";

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const SHAPES = {
  madagascar: () => MADAGASCAR,
  heart: () => heart(160),
  star: () => star(160),
};

/* ============================================================ Fourier */
function fourierLab(root, { t, reduced, lang }) {
  const N = 256, fmt = (v, d = 1) => (lang === "fr" ? String(Math.round(v * 10 ** d) / 10 ** d).replace(".", ",") : String(Math.round(v * 10 ** d) / 10 ** d));
  let shape = "madagascar", pts = [], co = [], count = 1, auto = true, showCircles = true, showFull = false, clock = 0, trail = [], drawing = null, userCurve = null, scale = 1, centre = [0, 0], lastCount = 0;
  root.innerHTML = `
    <p class="act-help">${t("Chaque cercle tourne à vitesse constante, centré sur le bout du précédent. Ensemble, ils redessinent une forme fermée. Ajoute des cercles : la forme se précise. Tu peux aussi dessiner la tienne.", "Each circle turns at a constant speed, centred on the tip of the previous one. Together they redraw a closed shape. Add circles: the shape sharpens. You can also draw your own.")}</p>
    <div class="obj-stage" id="fr-stage"></div>
    <div class="act-controls">
      <fieldset class="act-choice"><legend>${t("Forme", "Shape")}</legend>
        ${[["madagascar", "Madagascar", "Madagascar"], ["heart", "Cœur", "Heart"], ["star", "Étoile", "Star"], ["mine", "Ma forme", "My shape"]].map(([v, fr, en]) => `<label><input type="radio" name="fr-shape" value="${v}" ${v === shape ? "checked" : ""}> ${t(fr, en)}</label>`).join("")}</fieldset>
    </div>
    <div class="act-controls">
      <label class="act-field" for="fr-n"><span class="act-label">${t("Nombre de cercles", "Number of circles")} <output id="fr-n-out">1</output></span><input id="fr-n" type="range" min="1" max="150" step="1" value="1"></label>
      <label class="act-check"><input id="fr-circles" type="checkbox" checked> ${t("Montrer les cercles", "Show the circles")}</label>
      <label class="act-check"><input id="fr-full" type="checkbox"> ${t("Montrer la forme à atteindre", "Show the target shape")}</label>
      <button class="btn btn-secondary" id="fr-build" type="button">${t("Reconstruire peu à peu", "Build up again")}</button>
    </div>
    <p class="act-readout" id="fr-read" role="status" aria-live="polite"></p>`;
  const o = canvasIn(root.querySelector("#fr-stage"), 640 / 420), g = o.g, read = root.querySelector("#fr-read"), slider = root.querySelector("#fr-n"), out = root.querySelector("#fr-n-out");
  o.cv.style.touchAction = "none"; o.cv.style.cursor = "crosshair";
  const setShape = (name, raw) => {
    const r0 = resample(raw ?? SHAPES[name](), N), mx = r0.reduce((q, p) => q + p[0] / N, 0), my = r0.reduce((q, p) => q + p[1] / N, 0);
    pts = r0.map((p) => [p[0] - mx, p[1] - my]); co = fourier(pts);   // centred: the constant term vanishes and every circle turns
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
    scale = Math.min((o.W - 120) / w, (o.H - 80) / h); centre = [(Math.max(...xs) + Math.min(...xs)) / 2, (Math.max(...ys) + Math.min(...ys)) / 2];
    trail = []; clock = 0; auto = shape !== "mine" || !!raw;
    if (name !== "mine" || raw) { count = 1; slider.value = 1; }
    update();
  };
  const toScreen = (x, y) => [o.W / 2 + (x - centre[0]) * scale, o.H / 2 - (y - centre[1]) * scale];
  const rms = () => Math.sqrt(co.reduce((s, c) => s + c.amp ** 2, 0));
  function update() {
    out.textContent = count; slider.value = count;
    if (reduced()) frame(0);
    if (!co.length) { read.textContent = t("Dessine une forme fermée avec le doigt ou la souris.", "Draw a closed shape with your finger or the mouse."); return; }
    const left = Math.sqrt(co.slice(count).reduce((s, c) => s + c.amp ** 2, 0)), pct = (100 * left) / rms();
    read.innerHTML = `${count} ${t(count > 1 ? "cercles" : "cercle", count > 1 ? "circles" : "circle")} · ${t("écart moyen avec la forme", "mean gap from the shape")} : <strong>${fmt(pct)} %</strong> ${t("de sa taille", "of its size")}${count < co.length ? "" : ` · ${t("tous les cercles : la forme est exacte", "all the circles: the shape is exact")}`}`;
  }
  // The tip traces the curve of the first `count` circles as it goes; the old trace fades slowly. A circle is added only
  // when the tip has completed a full turn (COUNT_SCHEDULE), so each turn sharpens the picture a little more.
  const FADE = 1.7 * REVOLUTION;
  function frame(dt) {
    const C = palette();
    if (!reduced() && !drawing) clock += dt;
    if (auto && !reduced() && co.length) {
      const rev = Math.floor(clock / REVOLUTION), next = Math.min(COUNT_SCHEDULE[Math.min(rev, COUNT_SCHEDULE.length - 1)], co.length);
      if (rev > COUNT_SCHEDULE.length + 1) { clock = 0; trail = []; count = 1; update(); }
      else if (next !== count) { count = next; update(); }
    }
    const phase = reduced() ? 0 : (clock / REVOLUTION) % 1;
    g.clearRect(0, 0, o.W, o.H); g.fillStyle = C.sunken; g.fillRect(0, 0, o.W, o.H);
    if (drawing) {
      g.strokeStyle = C.accent; g.lineWidth = 3; g.lineCap = "round"; g.beginPath(); drawing.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke();
      g.fillStyle = C.muted; g.font = "600 13px system-ui"; g.textAlign = "center"; g.fillText(t("Lâche pour fermer la forme", "Release to close the shape"), o.W / 2, o.H - 14);
      return;
    }
    if (!co.length) { g.fillStyle = C.muted; g.font = "600 16px system-ui"; g.textAlign = "center"; g.fillText(t("Dessine une forme fermée ici", "Draw a closed shape here"), o.W / 2, o.H / 2); return; }
    if (showFull) { g.strokeStyle = C.line; g.lineWidth = 2; g.setLineDash([4, 5]); g.beginPath(); pts.forEach((p, i) => { const [x, y] = toScreen(p[0], p[1]); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.stroke(); g.setLineDash([]); }
    const chain = arms(co, phase, count), tip = chain[chain.length - 1];
    g.lineCap = "round"; g.lineJoin = "round";
    if (reduced()) {   // no motion: the whole curve of the current circles, once
      g.strokeStyle = C.accent; g.lineWidth = 3.2; g.beginPath();
      for (let i = 0; i <= 240; i++) { const q = arms(co, i / 240, count).at(-1), [x, y] = toScreen(q[0], q[1]); i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
    } else {
      trail.push({ x: tip[0], y: tip[1], ts: clock, count }); while (trail.length && clock - trail[0].ts > FADE) trail.shift();
      g.lineWidth = 3.4; g.strokeStyle = C.accent;
      for (let i = 1; i < trail.length; i++) { if (trail[i].count !== trail[i-1].count || trail[i].ts-trail[i-1].ts > .15) continue; const k = 1 - (clock - trail[i].ts) / FADE; g.globalAlpha = Math.max(0, k) ** 1.4; const a = toScreen(trail[i - 1].x, trail[i - 1].y), b = toScreen(trail[i].x, trail[i].y); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
      g.globalAlpha = 1;
    }
    g.lineWidth = 1;
    if (showCircles) for (let i = 1; i < chain.length; i++) {
      const [px, py] = toScreen(chain[i - 1][0], chain[i - 1][1]), [qx, qy] = toScreen(chain[i][0], chain[i][1]), r = chain[i][2] * scale;
      g.strokeStyle = C.muted; g.globalAlpha = 0.55; g.lineWidth = 1; if (r > 0.5) { g.beginPath(); g.arc(px, py, r, 0, TAU); g.stroke(); }
      g.globalAlpha = 0.9; g.strokeStyle = C.ink; g.beginPath(); g.moveTo(px, py); g.lineTo(qx, qy); g.stroke();
    }
    g.globalAlpha = 1; const [tx, ty] = toScreen(tip[0], tip[1]); g.fillStyle = C.neg; g.beginPath(); g.arc(tx, ty, 5, 0, TAU); g.fill();
    void lastCount;
  }
  const stop = loopFor((dt) => frame(reduced() ? 0 : dt), reduced);
  o.redraw = () => frame(0);
  // controls
  slider.addEventListener("input", () => { count = Number(slider.value); auto = false; trail = []; update(); });
  root.querySelector("#fr-build").addEventListener("click", () => { auto = co.length > 0; clock = 0; trail = []; count = 1; update(); });
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
  if (reduced()) { count = 80; auto = false; update(); }
  return stop;
}

/* =========================================================== Mandelbrot */
function mandelbrotLab(root, { t, reduced, lang }) {
  const SEAHORSE = [-0.743643887037151, 0.13182590420533], W0 = 3.4;
  let jx=0,jy=0,jw=3.2;
  let cx = -0.5, cy = 0, w = W0, cSel = [-0.4, 0.6], drag = null, flying = null, dirty = true, hq = true, last = "";
  root.innerHTML = `
    <p class="act-help">${t("Chaque point c du plan est testé : on répète z → z² + c depuis 0. S’il ne s’échappe jamais, c est noir. Déplace le pointeur : l’ensemble de Julia de c change à droite. Glisse pour te déplacer, utilise la molette ou pince pour zoomer. Double-clique pour réinitialiser la vue.", "Every point c of the plane is tested: repeat z → z² + c from 0. If it never escapes, c is black. Move the pointer: the Julia set of c changes on the right. Drag to pan, use the wheel or pinch to zoom. Double-click to reset the view.")}</p>
    <div class="mb-grid"><div class="obj-stage" id="mb-stage"></div><div class="obj-stage mb-julia" id="mb-julia"></div></div>
    <div class="act-controls">
      <button class="btn btn-primary" id="mb-fly" type="button">${t("Voyage vers la vallée des hippocampes", "Fly to the seahorse valley")}</button>
    </div>
    <p class="act-readout" id="mb-read" role="status" aria-live="polite"></p>`;
  const o = canvasIn(root.querySelector("#mb-stage"), 640 / 400, {navigation:false}), j = canvasIn(root.querySelector("#mb-julia"), 640 / 400, {navigation:false}), read = root.querySelector("#mb-read");
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
    const c2 = oj.getContext("2d"), img = c2.createImageData(pw, ph), px = new Uint32Array(img.data.buffer), W = jw, h = (W * j.H) / j.W;
    for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) px[y * pw + x] = colour(escape(jx+((x + 0.5) / pw - 0.5) * W, jy-((y + 0.5) / ph - 0.5) * h, cSel[0], cSel[1], 160, true), 110);
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
  o.cv.addEventListener("wheel", (e) => { e.preventDefault(); flying = null; const c = toC(e), old = w; w = clamp(w * (e.deltaY < 0 ? 0.7 : 1 / 0.7), 2e-13, 6); const k = w / old; cx = c[0] + (cx - c[0]) * k; cy = c[1] + (cy - c[1]) * k; dirty = true; }, { passive: false });
  root.querySelector("#mb-fly").addEventListener("click", () => { if (reduced()) { cx = SEAHORSE[0]; cy = SEAHORSE[1]; w = 0.02; hq = true; dirty = true; return; } cx = -0.5; cy = 0; w = W0; flying = { t: 0 }; });
  o.cv.setAttribute("role", "application");
  const fractalView=(panel,get,set,initial)=>{
    const action=id=>{let [x,y,width]=get();if(id==='reset')[x,y,width]=initial;else if(id==='in'||id==='out')width=clamp(width*(id==='in'?.7:1/.7),2e-13,6);else{const d={left:[-1,0],right:[1,0],up:[0,1],down:[0,-1]}[id];x+=d[0]*width*.12;y+=d[1]*width*.12;}set([x,y,width]);bar.update(initial[2]/width);};
    const bar=navigationButtons(panel.cv.parentElement,action,lang);panel.cv.style.touchAction='none';panel.cv.tabIndex=0;
    const pointers=new Map();let pinch=null;
    panel.cv.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch')return;pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===2){const a=[...pointers.values()];pinch=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);drag=null;panel.cv.dispatchEvent(new CustomEvent('view-gesture'));e.preventDefault();e.stopImmediatePropagation();}},true);
    panel.cv.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pinch&&pointers.size===2){const a=[...pointers.values()],d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]),[x,y,width]=get();const next=clamp(width*pinch/Math.max(1,d),2e-13,6);set([x,y,next]);bar.update(initial[2]/next);pinch=d;e.preventDefault();e.stopImmediatePropagation();}},true);
    for(const ev of ['pointerup','pointercancel'])panel.cv.addEventListener(ev,e=>{pointers.delete(e.pointerId);if(pointers.size<2)pinch=null;},true);
    panel.cv.addEventListener('keydown',e=>{const arrow={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'}[e.key];if(arrow||['+','=','-','0'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();action(arrow||(e.key==='0'?'reset':e.key==='-'?'out':'in'));}},true);
    panel.cv.addEventListener('dblclick',()=>action('reset'));
    panel.cv.setAttribute('aria-label',t('Figure fractale : glisser pour déplacer, molette ou pincement pour zoomer, double-clic ou 0 pour réinitialiser, flèches pour déplacer la vue.', 'Fractal figure: drag to pan, wheel or pinch to zoom, double-click or 0 to reset, arrow keys to pan.'));
    return bar;
  };
  fractalView(o,()=>[cx,cy,w],v=>{[cx,cy,w]=v;flying=null;dirty=true;},[-.5,0,W0]);
  fractalView(j,()=>[jx,jy,jw],v=>{[jx,jy,jw]=v;dirty=true;},[0,0,3.2]);
  let jdrag=null;j.cv.style.cursor='grab';
  j.cv.addEventListener('pointerdown',e=>{if(e.button!==0)return;jdrag={x:e.clientX,y:e.clientY,jx,jy};j.cv.setPointerCapture(e.pointerId);});
  j.cv.addEventListener('pointermove',e=>{if(!jdrag)return;const r=j.cv.getBoundingClientRect();jx=jdrag.jx-(e.clientX-jdrag.x)/r.width*jw;jy=jdrag.jy+(e.clientY-jdrag.y)/r.height*jw*j.H/j.W;dirty=true;});
  for(const ev of ['pointerup','pointercancel','view-gesture'])j.cv.addEventListener(ev,()=>jdrag=null);
  j.cv.addEventListener('wheel',e=>{e.preventDefault();const [px,py]=j.point(e),at=[jx+(px/j.W-.5)*jw,jy-(py/j.H-.5)*jw*j.H/j.W],old=jw;jw=clamp(jw*Math.exp(e.deltaY*.005),2e-13,6);const k=jw/old;jx=at[0]+(jx-at[0])*k;jy=at[1]+(jy-at[1])*k;dirty=true;},{passive:false});
  return stop;
}

export const GALLERY_OBJECTS = { fourier: fourierLab, mandelbrot: mandelbrotLab };
