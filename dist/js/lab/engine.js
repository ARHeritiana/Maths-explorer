// Laboratory stage: one canvas, one requestAnimationFrame scheduler that draws only when something changed, handle
// hit-testing (22 px radius = 44 px target) with pointer capture, keyboard handles, the shared camera, theme colours and
// text writes that touch a node only when the string changed. No element is created or replaced during a drag.
import { canvasNavigation } from "../canvas-navigation.js";
import { palette as themePalette } from "../object-kit.js";

export const HIT = 22;
const MINUS = "−";

// ---- number and text formatting: French conventions by default (decimal comma, (x ; y), [a ; b]).
export function makeFormat(lang = "fr") {
  const fr = lang !== "en";
  const num = (n, d = 2) => {
    if (!Number.isFinite(n)) return n > 0 ? "∞" : n < 0 ? MINUS + "∞" : "?";
    let s = (Math.round(n * 10 ** d) / 10 ** d).toFixed(d);
    if (s.includes(".")) s = s.replace(/\.?0+$/, "");
    if (s === "-0" || s === "") s = "0";
    s = s.replace("-", MINUS);
    return fr ? s.replace(".", ",") : s;
  };
  const pt = (...c) => "(" + c.map((v) => (typeof v === "number" ? num(v) : v)).join(fr ? " ; " : ", ") + ")";
  const iv = (a, b) => `[${typeof a === "number" ? num(a) : a}${fr ? " ; " : ", "}${typeof b === "number" ? num(b) : b}]`;
  const t = (pair) => (Array.isArray(pair) ? pair[fr ? 0 : 1] : pair);
  return { fr, lang: fr ? "fr" : "en", num, pt, iv, t };
}

// ---- DOM text that is written only when it changed (a Text node is updated in place: no childList mutation).
export function textNode(el) {
  if (!el._text) { el.textContent = ""; el._text = el.appendChild(document.createTextNode("")); el._v = ""; }
  return el._text;
}
export function setText(el, value) {
  const s = String(value);
  const node = textNode(el);
  if (el._v !== s) { el._v = s; node.data = s; }
}
export function setAttr(el, name, value) {
  const key = "_a_" + name;
  if (el[key] !== value) { el[key] = value; el.setAttribute(name, value); }
}
export function setClass(el, name, on) {
  const key = "_c_" + name;
  if (el[key] !== !!on) { el[key] = !!on; el.classList.toggle(name, !!on); }
}

// Readout: fixed slots [label, value] built once; later updates change text only.
export function createReadout(host, className = "lab2-readout") {
  const dl = document.createElement("dl");
  dl.className = className;
  host.append(dl);
  let slots = [];
  return {
    el: dl,
    update(items) {
      if (items.length !== slots.length) {
        dl.replaceChildren();
        slots = items.map(() => {
          const row = document.createElement("div"), dt = document.createElement("dt"), dd = document.createElement("dd");
          row.append(dt, dd); dl.append(row); textNode(dt); textNode(dd);
          return { dt, dd };
        });
      }
      items.forEach(([label, value], i) => { setText(slots[i].dt, label); setText(slots[i].dd, value); });
    },
  };
}

// Table of the values of a process: header built once, cells updated in place, one row may be highlighted.
export function createTable(host, caption) {
  const table = document.createElement("table");
  table.className = "lab2-table";
  const cap = document.createElement("caption"); cap.textContent = caption; table.append(cap);
  const thead = document.createElement("thead"), tbody = document.createElement("tbody");
  table.append(thead, tbody); host.append(table);
  let shape = "";
  let rows = [];
  return {
    el: table,
    update({ head, rows: data, highlight = -1 }) {
      const key = head.length + "x" + data.length;
      if (key !== shape) {
        shape = key;
        thead.replaceChildren(); tbody.replaceChildren();
        const hr = document.createElement("tr");
        head.forEach(() => { const th = document.createElement("th"); th.scope = "col"; textNode(th); hr.append(th); });
        thead.append(hr);
        rows = data.map(() => {
          const tr = document.createElement("tr");
          const cells = head.map((_, c) => { const cell = document.createElement(c === 0 ? "th" : "td"); if (c === 0) cell.scope = "row"; textNode(cell); tr.append(cell); return cell; });
          tbody.append(tr);
          return { tr, cells };
        });
      }
      [...thead.firstChild.children].forEach((th, i) => setText(th, head[i]));
      data.forEach((row, r) => { row.forEach((v, c) => setText(rows[r].cells[c], v)); setClass(rows[r].tr, "is-current", r === highlight); });
    },
  };
}

const reducedQuery = () => (typeof matchMedia === "function" ? matchMedia("(prefers-reduced-motion: reduce)") : { matches: false });

// ---- the stage
export function createStage(host, options = {}) {
  const { palette: paletteOption, label = "", onFrame, onDragEnd, onNudge } = options;
  const wrap = document.createElement("div");
  wrap.className = "lab2-stage";
  const canvas = document.createElement("canvas");
  canvas.className = "lab2-canvas";
  canvas.setAttribute("role", "group");
  if (label) canvas.setAttribute("aria-label", label);
  wrap.append(canvas);
  host.append(wrap);
  const g = canvas.getContext("2d");
  const reducedMq = reducedQuery();

  const stage = { canvas, wrap, g, W: 0, H: 0, handles: [], pal: null, focusId: null };
  const resolvePalette = () => (typeof paletteOption === "function" ? paletteOption() : paletteOption) || themePalette();
  stage.pal = resolvePalette();
  stage.reduced = () => !!reducedMq.matches;
  const rootStyle = typeof getComputedStyle === "function" ? getComputedStyle(document.documentElement) : null;
  const family = () => (rootStyle?.getPropertyValue("--math").trim() || '"STIX Two Text", Georgia, serif');
  stage.font = (size, weight = 400, italic = false) => `${italic ? "italic " : ""}${weight} ${size}px ${family()}`;
  stage.sans = (size, weight = 400) => `${weight} ${size}px ${rootStyle?.getPropertyValue("--body").trim() || "system-ui, sans-serif"}`;
  // A colour name from the palette ("accent", "obj2", "c3" ...) or any CSS colour.
  stage.color = (name) => {
    const p = stage.pal;
    if (!name) return p.ink;
    if (/^c[1-8]$/.test(name)) return p.c[+name[1] - 1];
    return p[name] || name;
  };

  let dirty = true, raf = 0, alive = true, pending = null, drag = null;
  const anims = new Set();
  const size = () => [stage.W || 640, stage.H || 420];

  const hitAt = ([x, y]) => {
    const k = nav.camera.scale || 1;
    let best = null, bd = Infinity;
    for (const h of stage.handles) {
      const [hx, hy] = h.pos();
      const d = Math.hypot(hx - x, hy - y);
      if (d < (h.r || HIT) / k && d < bd) { best = h; bd = d; }
    }
    return best;
  };
  const nav = canvasNavigation(canvas, g, size, () => invalidate(), { host: wrap, lang: options.lang === "en" ? "en" : "fr", canPan: (p) => !hitAt(p) });

  function schedule() { if (!raf && alive) raf = requestAnimationFrame(frame); }
  function invalidate() { dirty = true; schedule(); }
  function frame(now) {
    raf = 0;
    if (!alive) return;
    if (drag && pending) { const p = pending; pending = null; drag.h.drag(p[0] + drag.ox, p[1] + drag.oy); dirty = true; }
    for (const a of [...anims]) { if (a(now) === false) anims.delete(a); dirty = true; }
    if (dirty) { dirty = false; paint(); }
    if (anims.size) schedule();
  }
  function paint() {
    g.clearRect(0, 0, stage.W, stage.H);
    if (stage.pal.bg) { g.save(); g.fillStyle = stage.pal.bg; g.fillRect(-4000, -4000, 9000, 9000); g.restore(); }
    onFrame?.(g, stage);
    placeButtons();
  }
  const flush = () => { if (drag && pending) { const p = pending; pending = null; drag.h.drag(p[0] + drag.ox, p[1] + drag.oy); } invalidate(); };

  // Focusable twins of the handles: Tab reaches them, arrows move by one grid step. Created when the unlocked set changes.
  const buttons = new Map();
  function setHandles(list) {
    stage.handles = list;
    for (const b of buttons.keys()) b.remove();
    buttons.clear();
    for (const h of list) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "lab2-handle";
      b.setAttribute("aria-label", h.label);
      b.addEventListener("focus", () => { stage.focusId = h.id; invalidate(); });
      b.addEventListener("blur", () => { stage.focusId = null; invalidate(); });
      wrap.append(b); buttons.set(b, h); h.button = b;
    }
    invalidate();
  }
  function placeButtons() {
    for (const [b, h] of buttons) {
      const [x, y] = h.pos(), [px, py] = nav.camera.project([x, y]);
      const tx = `translate(${Math.round(px * 10) / 10 - HIT}px, ${Math.round(py * 10) / 10 - HIT}px)`;
      if (b._tx !== tx) { b._tx = tx; b.style.transform = tx; }
      const text = h.valuetext ? `${h.label}: ${h.valuetext()}` : h.label;
      setAttr(b, "aria-label", text);
    }
  }

  canvas.addEventListener("pointerdown", (e) => {
    if ((e.pointerType === "mouse" && e.button !== 0) || e.shiftKey || e.altKey) return;
    const p = nav.point(e), h = hitAt(p);
    if (!h) return;
    e.preventDefault();
    try { canvas.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
    const [hx, hy] = h.pos();
    drag = { id: e.pointerId, h, ox: h.absolute ? 0 : hx - p[0], oy: h.absolute ? 0 : hy - p[1] };
    h.button?.focus({ preventScroll: true });
    canvas.style.cursor = "grabbing";
    pending = p;
    schedule();
  });
  canvas.addEventListener("pointermove", (e) => {
    if (drag) { if (e.pointerId === drag.id) { pending = nav.point(e); schedule(); } return; }
    if (e.pointerType !== "mouse") return;
    const c = hitAt(nav.point(e)) ? "grab" : "";
    if (canvas._cursor !== c) { canvas._cursor = c; canvas.style.cursor = c; }
  });
  const end = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    flush();
    drag = null; pending = null;
    canvas.style.cursor = canvas._cursor || "";
    onDragEnd?.();
  };
  for (const name of ["pointerup", "pointercancel", "lostpointercapture"]) canvas.addEventListener(name, end);
  // A second finger starts a pinch: the drag stops (the camera owns the gesture).
  canvas.addEventListener("view-gesture", () => { drag = null; pending = null; });

  wrap.addEventListener("keydown", (e) => {
    const b = e.target.closest?.(".lab2-handle");
    if (!b) return;
    const arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
    if ((e.shiftKey && arrows[e.key]) || ["+", "=", "-", "0"].includes(e.key)) {
      e.preventDefault();
      canvas.dispatchEvent(new KeyboardEvent("keydown", { key: e.key, shiftKey: e.shiftKey, bubbles: true, cancelable: true }));
      return;
    }
    if (arrows[e.key]) {
      e.preventDefault();
      buttons.get(b).nudge(...arrows[e.key]);
      invalidate();
      onNudge?.();
    }
  });

  let observer = null;
  const resize = () => {
    const r = wrap.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2.5);
    const w = wrap.clientWidth || r.width || 640, h = wrap.clientHeight || r.height || 420;
    if (w === stage.W && h === stage.H && canvas.width === Math.round(w * d)) return;
    stage.W = w; stage.H = h;
    canvas.width = Math.round(w * d); canvas.height = Math.round(h * d);
    invalidate();
  };
  if (typeof ResizeObserver === "function") { observer = new ResizeObserver(resize); observer.observe(wrap); }
  resize();

  // The theme button changes data-theme; the canvas follows without a new mount.
  const themeWatch = typeof MutationObserver === "function" && typeof paletteOption !== "object" ? new MutationObserver(() => { stage.pal = resolvePalette(); invalidate(); }) : null;
  themeWatch?.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  Object.assign(stage, {
    nav,
    invalidate,
    setHandles,
    // A frame callback for user-started motion (play): returns false to stop. Runs inside the one scheduler.
    animate(fn) { anims.add(fn); schedule(); return () => anims.delete(fn); },
    get dragging() { return !!drag; },
    resize,
    destroy() {
      alive = false;
      cancelAnimationFrame(raf);
      nav.destroy();
      observer?.disconnect();
      themeWatch?.disconnect();
      wrap.remove();
    },
  });
  return stage;
}

export { snap, clamp } from "./models/num.js";
