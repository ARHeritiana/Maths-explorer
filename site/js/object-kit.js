// Small helpers shared by the laboratory objects and the gallery: canvas sized for the screen, theme colours, sliders, loop.
export const NS = "http://www.w3.org/2000/svg";
export const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#888";
// The palette is read from the CSS tokens once per theme (getComputedStyle on a dozen custom properties every frame forces a style
// recalculation); it is rebuilt when the theme attribute or the system colour scheme changes.
let paletteKey = "", paletteValue = null;
const themeKey = () => `${document.documentElement.dataset.theme || ""}|${globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches ? 1 : 0}|${document.documentElement.dataset.contrast || ""}`;
export const palette = () => { const k = themeKey(); if (paletteValue && k === paletteKey) return paletteValue; paletteKey = k; return (paletteValue = buildPalette()); };
const buildPalette = () => ({ ink: css("--ink"), muted: css("--muted"), line: css("--line-strong"), surface: css("--surface"), sunken: css("--sunken"), accent: css("--accent"), obj2: css("--obj2"), obj3: css("--obj3"), pos: css("--pos"), neg: css("--neg"), grid: css("--grid"), c: [1, 2, 3, 4, 5, 6, 7, 8].map((i) => css(`--c${i}`)) });
import { animationLoop } from './visible-loop.js';
export { animationLoop };
import { canvasNavigation, canvasTouch } from './canvas-navigation.js';
// A canvas whose backing store follows its layout box: css width x min(devicePixelRatio, 2), re-measured by a ResizeObserver, so that it
// is sharp on a desktop and not oversized on a phone. Drawing code keeps the logical size o.W x o.H (the transform scales it).
export function canvasIn(host, aspect, options = {}) {
  host.classList.add("obj-viewport");
  host.style.setProperty("--canvas-aspect", String(aspect));
  const cv = document.createElement("canvas"); cv.className = "obj-canvas"; host.append(cv);
  const g = cv.getContext("2d"), o = { cv, g, W: 640, H: Math.round(640 / aspect), scale: 1 };
  let bw = 0, bh = 0;
  const resize = () => {
    const r = cv.getBoundingClientRect(), d = Math.min(globalThis.devicePixelRatio || 1, 2), cssW = r.width > 0 ? r.width : o.W;
    // never above the 3840 px canvas limits of phones, never below the logical size at dpr 1 (the layout is not known yet in tests)
    const w = Math.max(1, Math.min(3840, Math.round(cssW * d))), h = Math.max(1, Math.round(w * o.H / o.W));
    if (w === bw && h === bh) return;
    bw = w; bh = h; cv.width = w; cv.height = h; o.scale = w / o.W; g.setTransform(w / o.W, 0, 0, h / o.H, 0, 0); o.navigation?.apply?.(); o.onResize?.(); o.redraw?.();
  };
  cv.style.aspectRatio = `${o.W} / ${o.H}`; resize();
  if (globalThis.ResizeObserver) { const ro = new ResizeObserver(resize); ro.observe(cv); o.disconnect = () => ro.disconnect(); }
  o.resize = resize;
  o.point = (e) => { const r = cv.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * o.W, ((e.clientY - r.top) / r.height) * o.H]; };
  if (options.navigation !== false) { o.navigation = canvasNavigation(cv,g,()=>[o.W,o.H],()=>o.redraw?.()); o.point = o.navigation.point; }
  else { o.stopTouch = canvasTouch(cv, e => cv.touchHit?.(e)); }
  o.touchHit = test => { cv.touchHit = e => test(o.point(e)); };
  return o;
}
export const field = (id, label, min, max, step, value) => `<label class="act-field" for="${id}"><span class="act-label">${label} <output id="${id}-out"></output></span><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
export const bind = (root, id, fn, fmt = (v) => v) => { const el = root.querySelector(`#${id}`), out = root.querySelector(`#${id}-out`); const run = () => { out.textContent = fmt(Number(el.value)); fn(Number(el.value)); }; el.addEventListener("input", run); out.textContent = fmt(Number(el.value)); return el; };
// loopFor(draw, reduced, host): one animation loop per figure, shared scheduler (visible-loop.js): no frames offscreen, in a hidden tab
// or under reduced motion (drawn once, then only while interacting); draw(dt) returning false puts it to sleep until the next interaction.
// The returned stop() also has .wake(ms) to force frames (a timer or a long computation that changes the picture without any event).
export const loopFor = (draw, reduced, host) => { const l = animationLoop(host, (dt, now) => draw(dt, now), { reduced }); const stop = () => l.stop(); stop.wake = l.wake; stop.loop = l; return stop; };

// Idle guard for canvases that redraw on a timer: `idle(busy, key)` is true when nothing is moving (busy false) and the picture would be
// the same as the last one drawn (same key, canvas size, theme and zoom/pan), so the frame can be skipped. Idle exhibits then cost nothing.
export const idleGuard = (o) => {
  let last = "";
  return (busy, key = "") => {
    const c = o.navigation?.camera, k = `${key}|${o.cv.width}|${document.documentElement.dataset.theme}|${c ? `${c.scale},${c.x},${c.y}` : ""}`;
    if (busy || k !== last) { last = k; return false; }
    return true;   // callers return false from their frame on this, which lets the loop sleep (visible-loop.js)
  };
};
