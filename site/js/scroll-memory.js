// Keeps long lists where the reader left them. Every page is rebuilt on navigation, so a scrollable list (the gallery
// sidebar, the history timeline, tab strips) used to jump back to its first item: to open the exhibit next to the one just read,
// the reader had to scroll again through dozens of entries. `rememberScrolls` records the scroll position of every scrollable
// element before the rebuild, `restoreScrolls` puts it back on the matching element afterwards (same page, same list), then
// makes sure the current entry is inside the visible part of its list.
const SELECTED = '[aria-current], [aria-selected="true"], .is-current, .is-on';
const keyOf = (el, root) => {
  const cls = String(el.getAttribute('class') || '').split(/\s+/)[0] || '-', same = [...root.querySelectorAll(el.tagName.toLowerCase() + (cls === '-' ? '' : '.' + CSS.escape(cls)))];
  return el.tagName.toLowerCase() + '.' + cls + ':' + same.indexOf(el);
};
const scrollable = (el) => {
  if (el.scrollHeight <= el.clientHeight + 2 && el.scrollWidth <= el.clientWidth + 2) return false;
  const s = getComputedStyle(el);
  return /(auto|scroll)/.test(s.overflowY) || /(auto|scroll)/.test(s.overflowX);
};
export function rememberScrolls(root) {
  const saved = new Map();
  if (!root) return saved;
  for (const el of root.querySelectorAll('*')) if (scrollable(el) && (el.scrollTop || el.scrollLeft)) saved.set(keyOf(el, root), [el.scrollTop, el.scrollLeft]);
  return saved;
}
// Bring the selected entry of a list into view without moving the page itself.
export function revealSelected(el) {
  const target = el.querySelector(SELECTED); if (!target) return;
  const box = el.getBoundingClientRect(), t = target.getBoundingClientRect();
  if (t.top < box.top) el.scrollTop += t.top - box.top - 8; else if (t.bottom > box.bottom) el.scrollTop += t.bottom - box.bottom + 8;
  if (t.left < box.left) el.scrollLeft += t.left - box.left - 8; else if (t.right > box.right) el.scrollLeft += t.right - box.right + 8;
}
export function restoreScrolls(root, saved) {
  if (!root) return;
  const apply = () => {
    for (const el of root.querySelectorAll('*')) {
      if (!scrollable(el)) continue;
      const pos = saved?.get(keyOf(el, root));
      if (pos) { el.scrollTop = pos[0]; el.scrollLeft = pos[1]; }
      revealSelected(el);
    }
  };
  apply();
  // lists filled by the page's own script after the render are placed once more on the next frame
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(apply);
}
