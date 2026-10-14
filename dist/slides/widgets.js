// Interactive canvases for the slide player. Every canvas has draggable handles, keyboard movement and explicit controls.
// The same quantities are mirrored by the readout; space scenes use true 3D.
import { W2 } from "./widgets-2d.js";
import { W3 } from "./widgets-3d.js";

export const C = { bg: "#13243b", grid: "#24364f", axis: "#8fa6c4", ink: "#f4f1ea", muted: "#8fa6c4", acc: "#e8a33d", warn: "#ff7a7a", blue: "#8fb7ff" };
export const SERIF = '"STIX Two Text","Latin Modern Roman",Georgia,serif';

// ---- mathematics: every formula is TeX, typeset by MathJax (tex-svg), never Unicode look-alikes.
// Readouts are HTML strings whose formulas sit between \( and \); canvas labels may be a whole \( ... \) string.
export const inl = t => "\\(" + t + "\\)";
const mj = () => (typeof MathJax !== "undefined" && MathJax.tex2svg && MathJax.startup && MathJax.startup.document ? MathJax : null);
const svgCache = new Map();
function mathSvg(tex) {
  let n = svgCache.get(tex);
  if (!n) {
    n = mj().tex2svg(tex, { display: false });
    n.querySelectorAll("mjx-assistive-mml").forEach(e => e.remove());
    if (svgCache.size > 600) svgCache.clear();
    svgCache.set(tex, n);
  }
  return n;
}
const MATH_RE = /\\\((.*?)\\\)/g;
const stripTeX = h => h.replace(MATH_RE, (_, t) => t);
function paint(el, html) {
  if (!mj()) { el.innerHTML = stripTeX(html); return; }
  const tpl = document.createElement("template"); tpl.innerHTML = html;
  const w = document.createTreeWalker(tpl.content, NodeFilter.SHOW_TEXT), texts = [];
  while (w.nextNode()) texts.push(w.currentNode);
  for (const t of texts) {
    if (!t.nodeValue.includes("\\(")) continue;
    const frag = document.createDocumentFragment(); let last = 0, m; MATH_RE.lastIndex = 0;
    while ((m = MATH_RE.exec(t.nodeValue))) {
      if (m.index > last) frag.append(t.nodeValue.slice(last, m.index));
      frag.append(mathSvg(m[1]).cloneNode(true)); last = m.index + m[0].length;
    }
    if (last < t.nodeValue.length) frag.append(t.nodeValue.slice(last));
    t.replaceWith(frag);
  }
  el.replaceChildren(...tpl.content.childNodes);
}
// Cached by string, and throttled while a handle is dragged: the formulas are rebuilt only when the text changes.
export function rich(el, html) {
  if (el._html === html) return;
  el._html = html;
  const now = performance.now();
  if (!el._t0 || now - el._t0 > 110) { el._t0 = now; paint(el, html); return; }
  if (!el._timer) el._timer = setTimeout(() => { el._timer = 0; el._t0 = performance.now(); paint(el, el._html); }, 110);
}
// Formula as an image for canvas labels: TeX -> MathJax SVG -> Image, colour and size fixed at creation.
const EX = .431;   // MathJax ex-height in em
const imgs = new Map();
let repaint = () => {};
function mathImage(tex, color, size) {
  const key = tex + "|" + color + "|" + size; let e = imgs.get(key);
  if (e) return e.ok ? e : null;
  if (!mj()) return null;
  const svg = mathSvg(tex).querySelector("svg").cloneNode(true);
  const ex = a => parseFloat(svg.getAttribute(a)), va = parseFloat((svg.getAttribute("style") || "").replace(/.*vertical-align:\s*([-\d.]+)ex.*/, "$1")) || 0;
  e = { w: ex("width") * EX * size, h: ex("height") * EX * size, va: va * EX * size, ok: false, img: new Image() };
  svg.setAttribute("width", e.w + "px"); svg.setAttribute("height", e.h + "px"); svg.removeAttribute("style"); svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const xml = new XMLSerializer().serializeToString(svg).replace(/currentColor/g, color);
  e.img.onload = () => { e.ok = true; repaint(); };
  e.img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
  imgs.set(key, e); return null;
}
const isMath = s => /^\\\(.*\\\)$/.test(s);
function drawMath(g, s, x, y, color, size, align) {
  const e = mathImage(s.slice(2, -2), color, size);
  if (!e) return;
  const left = align === "right" ? x - e.w : align === "center" ? x - e.w / 2 : x;
  g.drawImage(e.img, left, y - e.h - e.va, e.w, e.h);
}
// ---- TeX builders for the numbers and objects the readouts show
export const tnum = (n, lang, d = 2) => { if (!Number.isFinite(n)) return "?"; const s = fmt(n, lang, d); return lang ? s : s.replace(",", "{,}"); };
export const tpar = (N, x) => (x < 0 ? `(${N(x)})` : N(x));
export const tpt = (o, ...c) => "(" + c.map(v => (typeof v === "number" ? o.tn(v) : v)).join(o.L ? "," : "\\,;") + ")";
export const tiv = (o, a, b, closedA = true, closedB = true) => {
  const f = v => (typeof v === "number" ? o.tn(v) : v);
  return o.L ? `${closedA ? "[" : "("}${f(a)},${f(b)}${closedB ? "]" : ")"}` : `${closedA ? "[" : "]"}${f(a)}\\,;${f(b)}${closedB ? "]" : "["}`;
};
// "x^2-2x-1": coefficients 1 and -1 are implicit, zero terms are dropped, signs are written as operators.
export const tpoly = (parts, N) => { let s = ""; for (const [c, v] of parts) { if (Math.abs(c) < 1e-9) continue; const ab = Math.abs(c), body = ab === 1 && v ? v : N(ab) + v; s += s ? (c < 0 ? "-" : "+") + body : (c < 0 ? "-" : "") + body; } return s || "0"; };
export const tshift = (x, al, N) => (Math.abs(al) < 1e-9 ? x : `(${x}${al < 0 ? "+" : "-"}${N(Math.abs(al))})`);
export const tlin = (n, N) => { let s = ""; n.forEach((c, i) => { if (!c) return; const v = "xyz"[i], body = (Math.abs(c) === 1 ? "" : N(Math.abs(c))) + v; s += s ? (c < 0 ? "-" : "+") + body : (c < 0 ? "-" : "") + body; }); return s || "0"; };
export const sgn = c => (c < 0 ? "-" : "+");

export function mount(spec, ctx) {
  const f = W2[spec.type] || W3[spec.type];
  if (!f) { ctx.host.textContent = "?"; return { destroy() {} }; }
  const cv = canvas(ctx.host); repaint = () => cv.redraw();
  const api = Object.assign(cv, { ...ctx, spec, L: ctx.lang, num: n => fmt(n, ctx.lang), tn: (n, d) => tnum(n, ctx.lang, d), pair: (fr, en) => (ctx.lang ? en : fr) });
  ctx.hint.textContent = api.pair(spec.hintFr || "Interactif : glissez les points.", spec.hintEn || "Interactive: drag the points.");
  const inst = f(api) || {};
  cv.start(inst);
  const handles=()=>cv.handles();
  if(handles().length){
    const group=document.createElement('div');group.className='canvas-keyboard';
    const pick=document.createElement('select');pick.setAttribute('aria-label',api.pair('Point à déplacer','Point to move'));
    handles().forEach((h,i)=>{const option=document.createElement('option');option.value=i;option.textContent=api.pair('Point ','Point ')+(i+1);pick.append(option);});group.append(pick);
    let selected=0;pick.onchange=()=>{selected=+pick.value;};
    const move=(dx,dy)=>{const h=handles()[selected];if(!h)return;h.move(h.x+dx,h.y+dy);cv.redraw();};
    for(const [label,dx,dy,fr,en] of [['←',-14,0,'Déplacer vers la gauche','Move left'],['→',14,0,'Déplacer vers la droite','Move right'],['↑',0,-14,'Déplacer vers le haut','Move up'],['↓',0,14,'Déplacer vers le bas','Move down']]){
      const button=document.createElement('button');button.textContent=label;button.setAttribute('aria-label',api.pair(fr,en));button.onclick=()=>move(dx,dy);group.append(button);
    }
    cv.c.tabIndex=0;cv.c.setAttribute('role','group');cv.c.setAttribute('aria-label',api.pair('Figure interactive : flèches pour déplacer le point choisi','Interactive figure: arrow keys move the selected point'));
    cv.c.onkeydown=e=>{const deltas={ArrowLeft:[-14,0],ArrowRight:[14,0],ArrowUp:[0,-14],ArrowDown:[0,14]};if(deltas[e.key]){e.preventDefault();e.stopPropagation();const d=deltas[e.key],k=e.shiftKey?3:1;move(d[0]*k,d[1]*k);}};
    ctx.controls.append(group);
  }
  return { destroy() { cv.stop(); ctx.controls.innerHTML = ""; ctx.readout.innerHTML = ""; } };
}

// Coordinates and intervals follow the language convention, as the TeX class does: (x ; y) and [a ; b[ in French,
// (x, y) and [a, b) in English. Values are already formatted strings or numbers formatted with o.num.
export function pt(o, ...c) { return "(" + c.map(v => (typeof v === "number" ? o.num(v) : v)).join(o.L ? ", " : " ; ") + ")"; }
export function iv(o, a, b, closedA = true, closedB = true) {
  const f = v => (typeof v === "number" ? o.num(v) : v);
  return o.L ? `${closedA ? "[" : "("}${f(a)}, ${f(b)}${closedB ? "]" : ")"}` : `${closedA ? "[" : "]"}${f(a)} ; ${f(b)}${closedB ? "]" : "["}`;
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
  g.save(); g.lineWidth = 1; g.strokeStyle = C.grid; g.fillStyle = C.muted; g.font = `400 16px ${SERIF}`; g.textAlign = "center";
  for (let x = Math.ceil(v.x0 / sx) * sx; x <= v.x1 + 1e-9; x += sx) { g.beginPath(); g.moveTo(v.X(x), v.Y(v.y0)); g.lineTo(v.X(x), v.Y(v.y1)); g.stroke(); if (!o.noLabels && Math.abs(x) > 1e-9) g.fillText(lab(x, o.lang), v.X(x), Math.min(v.Y(0), v.Y(v.y0)) + 16 > v.Y(v.y0) ? v.Y(v.y0) - 6 : v.Y(0) + 16); }
  g.textAlign = "right";
  for (let y = Math.ceil(v.y0 / sy) * sy; y <= v.y1 + 1e-9; y += sy) { g.beginPath(); g.moveTo(v.X(v.x0), v.Y(y)); g.lineTo(v.X(v.x1), v.Y(y)); g.stroke(); if (!o.noLabels && Math.abs(y) > 1e-9) g.fillText(lab(y, o.lang), v.X(0) - 6 < v.X(v.x0) + 24 ? v.X(v.x0) + 24 : v.X(0) - 6, v.Y(y) + 5); }
  g.strokeStyle = C.axis; g.lineWidth = 1.6;
  if (v.y0 <= 0 && v.y1 >= 0) { g.beginPath(); g.moveTo(v.X(v.x0), v.Y(0)); g.lineTo(v.X(v.x1), v.Y(0)); g.stroke(); }
  if (v.x0 <= 0 && v.x1 >= 0) { g.beginPath(); g.moveTo(v.X(0), v.Y(v.y0)); g.lineTo(v.X(0), v.Y(v.y1)); g.stroke(); }
  g.restore();
}
const lab = (x, lang) => fmt(x, lang, 2).replace("-", "\u2212");
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
export function dot(o, x, y, color = C.acc, label = "", cur = "grab", draggable = true, side = 1) {
  const g = o.g; g.save();
  if (draggable) { g.strokeStyle = color; g.lineWidth = 1.5; g.setLineDash([4, 4]); g.lineDashOffset = -(o.t || 0) * 8; g.beginPath(); g.arc(x, y, 15 + 2 * Math.sin((o.t || 0) * 3), 0, 7); g.stroke(); g.setLineDash([]); }
  g.fillStyle = color; g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill();
  // side = -1 writes the label to the left, so two nearby points keep readable labels.
  if (label) { const x0 = x + 14 * side, al = side < 0 ? "right" : "left"; if (isMath(label)) drawMath(g, label, x0, y - 12, C.ink, 20, al); else { g.fillStyle = C.ink; g.font = `italic 600 20px ${SERIF}`; g.textAlign = al; g.fillText(label, x0, y - 12); } }
  g.restore();
}
export function text(g, s, x, y, color = C.ink, size = 18, align = "left") { if (isMath(s)) { drawMath(g, s, x, y, color, size + 2, align); return; } g.save(); g.fillStyle = color; g.font = `${size + 2}px ${SERIF}`; g.textAlign = align; g.fillText(s, x, y); g.restore(); }
export function slider(ctx, label, min, max, step, val, on, fmtv) {
  const l = document.createElement("label"), i = document.createElement("input"), s = document.createElement("span");
  i.type = "range"; i.min = min; i.max = max; i.step = step; i.value = val; s.textContent = fmtv ? fmtv(+val) : val;
  i.addEventListener("input", () => { s.textContent = fmtv ? fmtv(+i.value) : i.value; on(+i.value); });
  const lb = document.createElement("span"); rich(lb, label); lb._t0 = 0; l.append(lb, " ", i, s); ctx.controls.appendChild(l); return i;
}
export function choice(ctx, options, cur, on) {
  const wrap = document.createElement("div"); wrap.style.display = "flex"; wrap.style.gap = "8px";
  options.forEach(([id, fr, en]) => {
    const b = document.createElement("button"); rich(b, ctx.L ? en : fr); b.setAttribute("aria-pressed", id === cur);
    b.onclick = () => { wrap.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", "false")); b.setAttribute("aria-pressed", "true"); on(id); };
    wrap.appendChild(b);
  });
  ctx.controls.appendChild(wrap);
}
export const snap = (v, s = .5) => Math.round(v / s) * s;
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
