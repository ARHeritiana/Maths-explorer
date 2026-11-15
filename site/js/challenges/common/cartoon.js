// Shared cartoon press feedback: a control squashes when pressed and pops when released. Hoisted from nails/activity.js so
// every challenge (and the shared page layer around it) can reuse it. `installCartoon()` injects the style once;
// `PRESS` is the class name to put on a control; `pop(el, reduced)` replays the pop; `cartoonPress(root, reduced)` marks the
// buttons under `root` and pops them on click. `reduced` is a boolean or a function returning one (prefers-reduced-motion
// is also honoured by the stylesheet itself).
export const PRESS = "cartoon-press";
const EASE = "cubic-bezier(.3,1.9,.5,1)";
export const CARTOON_CSS = `
.${PRESS}{transition:transform .22s ${EASE}}
.${PRESS}:active{transform:scale(.88,.8)}
.${PRESS}.is-pop{animation:cartoon-pop .35s ${EASE}}
@keyframes cartoon-pop{0%{transform:scale(1)}35%{transform:scale(.86,.78)}70%{transform:scale(1.08,1.12)}100%{transform:scale(1)}}
@media (prefers-reduced-motion:reduce){.${PRESS}{transition:none}.${PRESS}:active{transform:none}.${PRESS}.is-pop{animation:none}}`;

export function installCartoon(doc = typeof document === "undefined" ? null : document) {
  if (!doc || doc.getElementById("cartoon-style")) return;
  const style = doc.createElement("style");
  style.id = "cartoon-style";
  style.textContent = CARTOON_CSS;
  doc.head.append(style);
}

const isReduced = (r) => (typeof r === "function" ? !!r() : !!r);

export function pop(el, reduced) {
  el.classList.remove("is-pop");
  if (isReduced(reduced)) return;
  void el.offsetWidth;
  el.classList.add("is-pop");
}

// Mark every button under root (or matching `selector`) with the press class and pop it on click; returns a cleanup function.
export function cartoonPress(root, reduced, selector = "button") {
  installCartoon();
  const mark = () => root.querySelectorAll(selector).forEach((b) => b.classList.add(PRESS));
  mark();
  const onClick = (e) => { const b = e.target.closest?.(selector); if (b && root.contains(b) && !b.disabled) pop(b, reduced); };
  root.addEventListener("click", onClick);
  return () => root.removeEventListener("click", onClick);
}
