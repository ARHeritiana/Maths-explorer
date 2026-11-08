// Small helpers shared by the laboratory objects and the gallery: canvas sized for the screen, theme colours, sliders, loop.
export const NS = "http://www.w3.org/2000/svg";
export const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#888";
// The palette is read from the CSS tokens once per theme (getComputedStyle on a dozen custom properties every frame forces a style
// recalculation); it is rebuilt when the theme attribute or the system colour scheme changes.
let paletteKey = "", paletteValue = null;
const themeKey = () => `${document.documentElement.dataset.theme || ""}|${globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches ? 1 : 0}|${document.documentElement.dataset.contrast || ""}`;
export const palette = () => { const k = themeKey(); if (paletteValue && k === paletteKey) return paletteValue; paletteKey = k; return (paletteValue = buildPalette()); };
const buildPalette = () => ({ ink: css("--ink"), muted: css("--muted"), line: css("--line-strong"), surface: css("--surface"), sunken: css("--sunken"), accent: css("--accent"), obj2: css("--obj2"), obj3: css("--obj3"), pos: css("--pos"), neg: css("--neg"), grid: css("--grid"), c: [1, 2, 3, 4, 5, 6, 7, 8].map((i) => css(`--c${i}`)) });
import { canvasNavigation, canvasTouch } from './canvas-navigation.js';
export function canvasIn(host, aspect, options = {}) {
  host.classList.add("obj-viewport");
  host.style.setProperty("--canvas-aspect", String(aspect));
  const cv = document.createElement("canvas"); cv.className = "obj-canvas"; host.append(cv);
  const g = cv.getContext("2d"), o = { cv, g, W: 640, H: Math.round(640 / aspect) };
  const resize = () => { const d = devicePixelRatio || 1; cv.width = Math.round(o.W * d); cv.height = Math.round(o.H * d); g.setTransform(d, 0, 0, d, 0, 0); o.redraw?.(); };
  cv.style.aspectRatio = `${o.W} / ${o.H}`; resize();
  o.point = (e) => { const r = cv.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * o.W, ((e.clientY - r.top) / r.height) * o.H]; };
  if (options.navigation !== false) { o.navigation = canvasNavigation(cv,g,()=>[o.W,o.H],()=>o.redraw?.()); o.point = o.navigation.point; }
  else { o.stopTouch = canvasTouch(cv, e => cv.touchHit?.(e)); }
  o.touchHit = test => { cv.touchHit = e => test(o.point(e)); };
  return o;
}
export const field = (id, label, min, max, step, value) => `<label class="act-field" for="${id}"><span class="act-label">${label} <output id="${id}-out"></output></span><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
export const bind = (root, id, fn, fmt = (v) => v) => { const el = root.querySelector(`#${id}`), out = root.querySelector(`#${id}-out`); const run = () => { out.textContent = fmt(Number(el.value)); fn(Number(el.value)); }; el.addEventListener("input", run); out.textContent = fmt(Number(el.value)); return el; };
// One frame loop for every animated exhibit. It runs only while the canvas is on screen, the tab is visible and the node is still in the page
// (a page change that forgot to call the stop function cannot leak a loop); under reduced motion it keeps ticking with dt = 0, so sliders and clicks
// still redraw at once but nothing moves. `target` is the canvas (or its host); without one only the tab state is used.
export const frameLoop = (draw, { reduced = () => false, target = null, maxDt = 0.05 } = {}) => {
  let raf = 0, last = 0, alive = true, visible = true;
  const run = () => !!(alive && visible && !document.hidden);
  const tick = (now) => {
    raf = 0; if (!alive) return;
    if (target && !target.isConnected) { alive = false; return; }
    if (!run()) return;
    const dt = reduced() ? 0 : Math.max(0, Math.min(maxDt, (now - last) / 1000 || 0)); last = now; draw(dt, now / 1000);
    raf = requestAnimationFrame(tick);
  };
  const wake = () => { if (!raf && run()) { last = performance.now(); raf = requestAnimationFrame(tick); } };
  const sleep = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };
  const onVis = () => (document.hidden ? sleep() : wake());
  document.addEventListener("visibilitychange", onVis);
  const io = target && typeof IntersectionObserver === "function" ? new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; visible ? wake() : sleep(); }) : null;
  io?.observe(target);
  wake();
  return () => { alive = false; sleep(); io?.disconnect(); document.removeEventListener("visibilitychange", onVis); };
};
export const loopFor = (draw, reduced, target = null) => frameLoop(draw, { reduced, target });


// Idle guard for canvases that redraw on a timer: `idle(busy, key)` is true when nothing is moving (busy false) and the picture would be
// the same as the last one drawn (same key, canvas size, theme and zoom/pan), so the frame can be skipped. Idle exhibits then cost nothing.
export const idleGuard = (o) => {
  let last = "";
  return (busy, key = "") => {
    const c = o.navigation?.camera, k = `${key}|${o.cv.width}|${document.documentElement.dataset.theme}|${c ? `${c.scale},${c.x},${c.y}` : ""}`;
    if (busy || k !== last) { last = k; return false; }
    return true;
  };
};
