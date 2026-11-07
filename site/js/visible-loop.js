// One shared scheduler for figures that animate. It runs requestAnimationFrame only while the figure is on screen, the tab is
// visible and motion is allowed, and it goes to sleep when a frame reports that nothing moves (tick returns false).
//   - offscreen / hidden tab: the frame is cancelled; it resumes when the figure comes back (IntersectionObserver, visibilitychange).
//   - prefers-reduced-motion (or reduced()): draw once, then only for a short while after an interaction (pointer, key, input,
//     click...), with dt = 0, so that a drag still follows the pointer but nothing runs by itself.
//   - asleep (tick() === false): nothing runs until an interaction, a resize, a theme change or wake().
// `scope` (default: the figure's #object-stage or host) is the element whose interactions wake the loop (use <main> when the controls live elsewhere).
// tick(dt, seconds) draws one frame; false = nothing moves, sleep; true = keep running even under reduced motion (a run the user started). Returns { stop, wake(ms), running() }.
const EVENTS = ["pointerdown", "pointermove", "pointerup", "keydown", "input", "change", "click", "wheel", "touchstart"];
export function animationLoop(host, tick, { reduced = () => false, grace = 1200, scope = null } = {}) {
  const el = host.closest?.("#object-stage") || host, sc = scope || el, doc = el.ownerDocument || document, win = doc.defaultView || window;
  const motion = win.matchMedia?.("(prefers-reduced-motion: reduce)");
  const still = () => !!(reduced() || motion?.matches);
  const now_ = () => (globalThis.performance || win.performance).now();
  let raf = 0, last = 0, alive = true, visible = true, until = 0, asleep = false;
  const may = () => alive && visible && !doc.hidden;
  function frame(now) {
    raf = 0;
    if (!may()) return;
    const still_ = still(), dt = Math.max(0, Math.min(0.05, (now - last) / 1000 || 0));
    last = now;
    const r = tick(still_ ? 0 : dt, now / 1000);
    if (r === false) { asleep = true; return; }
    if (still_ && now >= until && r !== true) return;   // reduced motion: only while the user is interacting (or when tick says true: a run the user asked for)
    raf = globalThis.requestAnimationFrame(frame);
  }
  function wake(ms = 0) {
    if (!alive) return;
    if (ms) until = Math.max(until, now_() + ms);
    asleep = false;
    if (!raf && may()) { last = now_(); raf = globalThis.requestAnimationFrame(frame); }
  }
  const touch = () => wake(grace);
  const sleep = () => { if (raf) globalThis.cancelAnimationFrame(raf); raf = 0; };
  const onVis = () => (doc.hidden ? sleep() : wake(still() ? grace : 0));
  const io = (globalThis.IntersectionObserver || win.IntersectionObserver) ? new (globalThis.IntersectionObserver || win.IntersectionObserver)((es) => { visible = es.some((e) => e.isIntersecting); visible ? wake(still() ? grace : 0) : sleep(); }) : null;
  io?.observe(el);
  const ro = (globalThis.ResizeObserver || win.ResizeObserver) ? new (globalThis.ResizeObserver || win.ResizeObserver)(() => wake(grace)) : null;
  ro?.observe(el);
  const mo = (globalThis.MutationObserver || win.MutationObserver) ? new (globalThis.MutationObserver || win.MutationObserver)(() => wake(grace)) : null;
  mo?.observe(doc.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-contrast"] });
  for (const e of EVENTS) sc.addEventListener(e, touch, { capture: true, passive: true });
  doc.addEventListener("visibilitychange", onVis);
  motion?.addEventListener?.("change", touch);
  wake(grace);
  return {
    wake,
    running: () => !!raf,
    asleep: () => asleep,
    stop() {
      alive = false; sleep(); io?.disconnect(); ro?.disconnect(); mo?.disconnect();
      for (const e of EVENTS) sc.removeEventListener(e, touch, { capture: true });
      doc.removeEventListener("visibilitychange", onVis); motion?.removeEventListener?.("change", touch);
    },
  };
}
