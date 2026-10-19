// Laboratory stage: one canvas, one requestAnimationFrame scheduler that draws only when something changed, handle
// grabbing (the nearest handle within a forgiving radius) with pointer capture, keyboard handles, the view camera, theme colours and
// text writes that touch a node only when the string changed. No element is created or replaced during a drag.
import { palette as themePalette } from "../object-kit.js";
import { makeFormat } from "./format.js";
import { clamp } from "./models/num.js";

export const HIT = 22;

// ---- number formatting lives in format.js (≈ for a rounded value, = for an exact one)
export { makeFormat };

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
export function createReadout(host, className = "lab2-readout", write = setText) {
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
          return { dt, dd, row };
        });
      }
      // a long value (a sentence) takes the whole row on a phone, where the cards sit three to a row
      items.forEach(([label, value], i) => { write(slots[i].dt, label); write(slots[i].dd, value); setClass(slots[i].row, "is-long", String(value).length > 24); });
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
// Pointer policy (owner request of 19 October 2026: "difficult to click on points, the canvas moves when it shouldn't"):
//   a press grabs the nearest handle within GRAB pixels (larger for a finger); a plain wheel scrolls the page, the view zooms
//   only with Ctrl or Cmd + wheel, a pinch, the + and - buttons or keys; a drag on the empty background moves the view only once
//   the view has been zoomed or moved (Shift, Alt or middle drag always pans); a double click on the background resets it.
// The view camera acts on the world ranges of each panel (plot.js makeView), never on the bitmap: the grid is recomputed for
// what is visible, and text, lines and handles keep their size at every zoom.
export const GRAB = { mouse: 26, pen: 34, touch: 40 };
const ZOOM = [0.25, 8];

export function createStage(host, options = {}) {
  // `onSpin(dx, dy)`: a drag on the empty background (or the arrow keys with the canvas focused) turns a 3D view instead of
  // moving it (template `space`); Shift or Alt drag still pans.
  const { palette: paletteOption, label = "", onFrame, onDragEnd, onNudge, fontScale = 1, canvasKeys = false, onSpin, zoomButtons = true } = options;
  const fr = options.lang !== "en";
  const wrap = document.createElement("div");
  wrap.className = "lab2-stage";
  const canvas = document.createElement("canvas");
  canvas.className = "lab2-canvas";
  canvas.setAttribute("role", "group");
  canvas.tabIndex = 0;
  canvas.style.touchAction = "none";
  if (label) canvas.setAttribute("aria-label", label);
  wrap.append(canvas);
  host.append(wrap);
  const g = canvas.getContext("2d");
  const reducedMq = reducedQuery();

  const stage = { canvas, wrap, g, W: 0, H: 0, handles: [], pal: null, focusId: null, hoverId: null, dragId: null };
  const resolvePalette = () => (typeof paletteOption === "function" ? paletteOption() : paletteOption) || themePalette();
  stage.pal = resolvePalette();
  stage.reduced = () => !!reducedMq.matches;
  const rootStyle = typeof getComputedStyle === "function" ? getComputedStyle(document.documentElement) : null;
  const family = () => (rootStyle?.getPropertyValue("--math").trim() || '"STIX Two Text", Georgia, serif');
  // fontScale > 1 for projection (the slide player): every text of the canvas grows, the handles and lines do not
  stage.font = (size, weight = 400, italic = false) => `${italic ? "italic " : ""}${weight} ${Math.round(size * fontScale * 10) / 10}px ${family()}`;
  stage.sans = (size, weight = 400) => `${weight} ${Math.round(size * fontScale * 10) / 10}px ${rootStyle?.getPropertyValue("--body").trim() || "system-ui, sans-serif"}`;
  // A colour name from the palette ("accent", "obj2", "c3" ...) or any CSS colour.
  stage.color = (name) => {
    const p = stage.pal;
    if (!name) return p.ink;
    if (/^c[1-8]$/.test(name)) return p.c[+name[1] - 1];
    return p[name] || name;
  };

  // ---- view cameras: one per panel (or shared by panels that must stay aligned). A panel registers its frame every layout.
  // X_screen = c + k (X_base - c) + o on each axis, where c is the centre of the panel's frame; `axis: "x"` zooms x only.
  const cams = new Map(), panels = new Map(), resetHooks = new Set();
  stage.cam = (id, axis = "xy") => {
    let c = cams.get(id);
    if (!c) { c = { kx: 1, ky: 1, ox: 0, oy: 0, axis }; cams.set(id, c); }
    return c;
  };
  // frame = {x, y, w, h} (the area where the panel draws), centre = [cx, cy]
  stage.panel = (id, frame, cam, centre) => { panels.set(id, { frame, cam, c: centre || [frame.x + frame.w / 2, frame.y + frame.h / 2] }); };
  const panelAt = ([x, y]) => {
    for (const p of panels.values()) { const f = p.frame; if (x >= f.x && x <= f.x + f.w && y >= f.y && y <= f.y + f.h) return p; }
    return null;
  };
  const isMoved = (c) => c.kx !== 1 || c.ky !== 1 || c.ox !== 0 || c.oy !== 0;
  const bound = (p) => {
    // the designed range never leaves the panel completely
    const c = p.cam, f = p.frame, mx = (c.kx * f.w + f.w) / 2, my = (c.ky * f.h + f.h) / 2;
    c.ox = clamp(c.ox, -mx, mx); c.oy = clamp(c.oy, -my, my);
  };
  function zoomPanel(p, factor, at) {
    const c = p.cam, [px, py] = at || p.c;
    const kx = clamp(c.kx * factor, ZOOM[0], ZOOM[1]), ky = c.axis === "x" ? 1 : clamp(c.ky * factor, ZOOM[0], ZOOM[1]);
    c.ox = px - p.c[0] - (kx / c.kx) * (px - p.c[0] - c.ox);
    if (c.axis !== "x") c.oy = py - p.c[1] - (ky / c.ky) * (py - p.c[1] - c.oy);
    c.kx = kx; c.ky = ky;
    bound(p);
    viewChanged();
  }
  const uniquePanels = () => { const seen = new Set(), out = []; for (const p of panels.values()) if (!seen.has(p.cam)) { seen.add(p.cam); out.push(p); } return out; };
  function panBy(p, dx, dy) { p.cam.ox += dx; if (p.cam.axis !== "x") p.cam.oy += dy; bound(p); viewChanged(); }
  function resetView() {
    for (const c of cams.values()) Object.assign(c, { kx: 1, ky: 1, ox: 0, oy: 0 });
    for (const f of resetHooks) f();
    viewChanged();
  }
  stage.view = {
    get scale() { let k = 1; for (const c of cams.values()) if (Math.abs(Math.log(c.kx)) > Math.abs(Math.log(k))) k = c.kx; return k; },
    get moved() { return [...cams.values()].some(isMoved); },
    zoom(factor) { for (const p of uniquePanels()) zoomPanel(p, factor); },
    pan(dx, dy) { for (const p of uniquePanels()) panBy(p, dx, dy); },
    reset: resetView,
    onReset(fn) { resetHooks.add(fn); return () => resetHooks.delete(fn); },
  };

  let dirty = true, raf = 0, alive = true, pending = null, drag = null, spin = null, pan = null, pinch = null;
  const touches = new Map();
  const anims = new Set();

  // stage pixels of a pointer event
  const local = (e) => {
    const r = canvas.getBoundingClientRect(), kx = r.width ? (stage.W || r.width) / r.width : 1, ky = r.height ? (stage.H || r.height) / r.height : 1;
    return [(e.clientX - r.left) * kx, (e.clientY - r.top) * ky];
  };
  // the nearest handle within the grab radius of this kind of pointer
  const grab = ([x, y], kind = "mouse") => {
    const R = GRAB[kind] || GRAB.mouse;
    let best = null, bd = Infinity;
    for (const h of stage.handles) {
      if (h.hidden?.()) continue;
      const [hx, hy] = h.pos(), d = Math.hypot(hx - x, hy - y);
      if (d <= (h.r || R) && d < bd) { best = h; bd = d; }
    }
    return best;
  };

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
    const d = canvas.width / (stage.W || 1);
    g.setTransform(d, 0, 0, d, 0, 0);
    g.clearRect(0, 0, stage.W, stage.H);
    if (stage.pal.bg) { g.save(); g.fillStyle = stage.pal.bg; g.fillRect(0, 0, stage.W, stage.H); g.restore(); }
    onFrame?.(g, stage);
    placeButtons();
  }
  const flush = () => { if (drag && pending) { const p = pending; pending = null; drag.h.drag(p[0] + drag.ox, p[1] + drag.oy); } invalidate(); };

  // ---- zoom buttons (built once): zoom in, zoom out, reset; the reset button shows only when the view has moved
  let resetBtn = null, zoomBar = null;
  if (zoomButtons) {
    const bar = zoomBar = document.createElement("div");
    bar.className = "lab2-zoom";
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", fr ? "Vue" : "View");
    const button = (text, title, act) => {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = text; b.title = title; b.setAttribute("aria-label", title);
      b.addEventListener("click", act);
      bar.append(b);
      return b;
    };
    button("+", fr ? "Zoomer" : "Zoom in", () => stage.view.zoom(1.25));
    button("−", fr ? "Dézoomer" : "Zoom out", () => stage.view.zoom(0.8));
    resetBtn = button("⟲", fr ? "Recentrer la vue" : "Reset the view", () => resetView());
    resetBtn.className = "lab2-zoom-reset";
    resetBtn.hidden = true;
    wrap.append(bar);
  }
  function viewChanged() {
    if (resetBtn) resetBtn.hidden = !stage.view.moved;
    invalidate();
  }

  // Focusable twins of the handles: Tab reaches them, arrows move by one grid step. Created when the set of handles changes.
  const buttons = new Map();
  function setHandles(list) {
    const same = list.length === stage.handles.length && list.every((h, i) => h === stage.handles[i]);
    stage.handles = list;
    if (same && buttons.size === list.length) { invalidate(); return; }
    for (const b of buttons.keys()) b.remove();
    buttons.clear();
    for (const h of list) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "lab2-handle";
      b.setAttribute("aria-label", h.label);
      b.addEventListener("focus", () => { stage.focusId = h.id; invalidate(); });
      b.addEventListener("blur", () => { stage.focusId = null; invalidate(); });
      wrap.insertBefore(b, zoomBar);   // Tab order: canvas, the handles, then the view buttons
      buttons.set(b, h); h.button = b;
    }
    invalidate();
  }
  function placeButtons() {
    for (const [b, h] of buttons) {
      const [px, py] = h.pos();
      const tx = `translate(${Math.round(px * 10) / 10 - HIT}px, ${Math.round(py * 10) / 10 - HIT}px)`;
      if (b._tx !== tx) { b._tx = tx; b.style.transform = tx; }
      const text = h.valuetext ? `${h.label}: ${h.valuetext()}` : h.label;
      setAttr(b, "aria-label", text);
    }
  }
  const setCursor = (c) => { if (canvas._cursor !== c) { canvas._cursor = c; canvas.style.cursor = c; } };
  const restCursor = () => { canvas.style.cursor = canvas._cursor || ""; };

  function stopAll() { drag = null; pending = null; spin = null; pan = null; stage.dragId = null; }

  canvas.addEventListener("pointerdown", (e) => {
    const p = local(e);
    if (e.pointerType === "touch") {
      touches.set(e.pointerId, p);
      if (touches.size === 2) {
        // a second finger: the view owns the gesture (the drag of the first finger stops)
        const [a, b] = [...touches.values()];
        stopAll();
        pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], panel: panelAt([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]) };
        canvas.dispatchEvent(new CustomEvent("view-gesture"));
        e.preventDefault();
        invalidate();
        return;
      }
      if (touches.size > 2) return;
    }
    if (e.pointerType === "mouse" && e.button !== 0 && e.button !== 1) return;
    const wantsPan = e.button === 1 || e.shiftKey || e.altKey;
    const h = wantsPan ? null : grab(p, e.pointerType);
    if (h) {
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
      const [hx, hy] = h.pos();
      drag = { id: e.pointerId, h, ox: h.absolute ? 0 : hx - p[0], oy: h.absolute ? 0 : hy - p[1] };
      stage.dragId = h.id;
      h.button?.focus({ preventScroll: true });
      canvas.style.cursor = "grabbing";
      pending = p;
      schedule();
      return;
    }
    if (options.reservePointer?.()) return;
    if (onSpin && !wantsPan) {
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
      spin = { id: e.pointerId, x: e.clientX, y: e.clientY };
      canvas.focus({ preventScroll: true });   // the arrow keys then turn the view too
      canvas.style.cursor = "grabbing";
      return;
    }
    const panel = panelAt(p);
    if (panel && (wantsPan || isMoved(panel.cam))) {
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
      pan = { id: e.pointerId, last: p, panel };
      canvas.style.cursor = "grabbing";
    }
  });
  canvas.addEventListener("pointermove", (e) => {
    const p = local(e);
    if (touches.has(e.pointerId)) touches.set(e.pointerId, p);
    if (pinch) {
      if (touches.size === 2) {
        const [a, b] = [...touches.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]), mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const targets = pinch.panel ? [pinch.panel] : uniquePanels();
        for (const t of targets) { zoomPanel(t, d / Math.max(1, pinch.d), pinch.mid); panBy(t, mid[0] - pinch.mid[0], mid[1] - pinch.mid[1]); }
        pinch.d = d; pinch.mid = mid;
        e.preventDefault();
      }
      return;
    }
    if (spin) {
      if (e.pointerId === spin.id) { const dx = e.clientX - spin.x, dy = e.clientY - spin.y; spin.x = e.clientX; spin.y = e.clientY; if (dx || dy) { onSpin(dx, dy); invalidate(); } }
      return;
    }
    if (pan) {
      if (e.pointerId === pan.id) { panBy(pan.panel, p[0] - pan.last[0], p[1] - pan.last[1]); pan.last = p; }
      return;
    }
    if (drag) { if (e.pointerId === drag.id) { pending = p; schedule(); } return; }
    if (e.pointerType !== "mouse") return;
    const h = grab(p, "mouse");
    if ((h?.id ?? null) !== stage.hoverId) { stage.hoverId = h?.id ?? null; invalidate(); }
    const panel = h ? null : panelAt(p);
    setCursor(h ? "grab" : panel && isMoved(panel.cam) ? "move" : "");
  });
  const end = (e) => {
    touches.delete(e.pointerId);
    if (pinch) { if (touches.size < 2) pinch = null; return; }
    if (spin && e.pointerId === spin.id) { spin = null; restCursor(); return; }
    if (pan && e.pointerId === pan.id) { pan = null; restCursor(); return; }
    if (!drag || e.pointerId !== drag.id) return;
    flush();
    drag = null; pending = null; stage.dragId = null;
    restCursor();
    onDragEnd?.();
  };
  for (const name of ["pointerup", "pointercancel", "lostpointercapture"]) canvas.addEventListener(name, end);
  canvas.addEventListener("pointerleave", () => { if (stage.hoverId !== null && !drag) { stage.hoverId = null; invalidate(); } });
  // A plain wheel scrolls the page; Ctrl or Cmd + wheel (and a trackpad pinch, which the browser reports with ctrlKey) zooms.
  canvas.addEventListener("wheel", (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    const p = local(e), panel = panelAt(p);
    const f = Math.exp(-clamp(e.deltaY, -60, 60) * 0.01);
    if (panel) zoomPanel(panel, f, p); else stage.view.zoom(f);
  }, { passive: false });
  canvas.addEventListener("dblclick", (e) => { if (!grab(local(e))) resetView(); });

  // keys of the view, from the canvas or from a focused handle: + and - zoom, 0 resets, Shift + arrows move the view
  const PAN_KEY = 40;
  const viewKey = (e) => {
    const arrows = { ArrowLeft: [PAN_KEY, 0], ArrowRight: [-PAN_KEY, 0], ArrowUp: [0, PAN_KEY], ArrowDown: [0, -PAN_KEY] };
    if (e.ctrlKey || e.metaKey || e.altKey) return false;
    if (e.shiftKey && arrows[e.key]) { stage.view.pan(...arrows[e.key]); return true; }
    if (e.key === "+" || e.key === "=") { stage.view.zoom(1.25); return true; }
    if (e.key === "-") { stage.view.zoom(0.8); return true; }
    if (e.key === "0") { resetView(); return true; }
    return false;
  };
  canvas.addEventListener("keydown", (e) => { if (e.target === canvas && viewKey(e)) { e.preventDefault(); e.stopPropagation(); } });

  wrap.addEventListener("keydown", (e) => {
    const b = e.target.closest?.(".lab2-handle");
    if (!b) return;
    if (viewKey(e)) { e.preventDefault(); return; }
    const arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
    if (arrows[e.key] && !e.shiftKey) {
      e.preventDefault();
      buttons.get(b).nudge(...arrows[e.key]);
      invalidate();
      onNudge?.();
    }
  });

  // The player's convention (canvasKeys): with the canvas itself focused, H picks the next handle and the arrow keys move it by one
  // grid step. With a 3D view (onSpin) no handle is picked at first and the arrow keys turn the view; H cycles handle by handle
  // and back to the view. Outside the player, a 3D view turns with the arrow keys when the canvas has focus.
  const SPIN_KEY = 12;   // pixels of drag that one key press stands for
  const arrowsOf = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
  let picked = onSpin ? -1 : 0;
  if (canvasKeys || onSpin) {
    canvas.addEventListener("keydown", (e) => {
      if (e.target !== canvas || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
      const list = stage.handles;
      if (canvasKeys && (e.key === "h" || e.key === "H") && list.length) {
        picked = onSpin ? (picked + 1 >= list.length ? -1 : picked + 1) : (picked + 1) % list.length;
        stage.focusId = picked >= 0 ? list[picked].id : null;
        e.preventDefault(); e.stopPropagation(); invalidate(); return;
      }
      const a = arrowsOf[e.key];
      if (!a) return;
      if (canvasKeys && picked >= 0 && list.length) { e.preventDefault(); e.stopPropagation(); list[picked % list.length].nudge(...a); invalidate(); onNudge?.(); return; }
      if (onSpin) { e.preventDefault(); e.stopPropagation(); onSpin(a[0] * SPIN_KEY, -a[1] * SPIN_KEY); invalidate(); }
    });
    canvas.addEventListener("blur", () => { stage.focusId = null; invalidate(); });
  }

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
    invalidate,
    setHandles,
    // A frame callback for user-started motion (play): returns false to stop. Runs inside the one scheduler.
    animate(fn) { anims.add(fn); schedule(); return () => anims.delete(fn); },
    get dragging() { return !!drag; },
    resize,
    destroy() {
      alive = false;
      cancelAnimationFrame(raf);
      observer?.disconnect();
      themeWatch?.disconnect();
      wrap.remove();
    },
  });
  return stage;
}

export { snap, clamp } from "./models/num.js";

