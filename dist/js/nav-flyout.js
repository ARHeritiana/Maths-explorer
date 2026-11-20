// Hover and focus flyouts of the main menu (owner request, 20 November 2026): resting the pointer on Lessons, Practice,
// Lab or Library shows that section's pages in a panel under the header, like the menus of a professional site. The panels
// are rendered by `header()` in app.js (`.nav-flyout[data-for]`, hidden); this module only shows and hides them.
// Desktop only (the phone has a tab bar); keyboard: focus on a main link opens its panel, Escape closes, Tab moves in.
// Touch input never opens a flyout (a tap just follows the link).
const OPEN_DELAY = 120, CLOSE_DELAY = 260;
export function installNavFlyout(root = document) {
  const links = [...root.querySelectorAll(".mainnav a[data-section]")], panels = new Map([...root.querySelectorAll(".nav-flyout[data-for]")].map((p) => [p.dataset.for, p]));
  if (!links.length || !panels.size) return () => {};
  const wide = () => matchMedia("(min-width: 961px)").matches;
  let openId = null, timer = 0;
  const show = (id) => {
    clearTimeout(timer);
    if (!wide() || openId === id) return;
    hide(true);
    const p = panels.get(id), a = links.find((l) => l.dataset.section === id);
    if (!p || !a) return;
    p.hidden = false; openId = id;
    const r = a.getBoundingClientRect();
    p.style.left = `${Math.max(8, Math.min(r.left, innerWidth - p.offsetWidth - 8))}px`;
    a.setAttribute("aria-expanded", "true");
  };
  function hide(now) {
    clearTimeout(timer);
    const go = () => {
      for (const [id, p] of panels) { p.hidden = true; links.find((l) => l.dataset.section === id)?.removeAttribute("aria-expanded"); }
      openId = null;
    };
    if (now) go(); else timer = setTimeout(go, CLOSE_DELAY);
  }
  const later = (id) => { clearTimeout(timer); timer = setTimeout(() => show(id), OPEN_DELAY); };
  const ac = new AbortController(), o = { signal: ac.signal };
  for (const a of links) {
    a.setAttribute("aria-haspopup", "true");
    a.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") later(a.dataset.section); }, o);
    a.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") hide(false); }, o);
    a.addEventListener("focus", () => { if (a.matches(":focus-visible")) show(a.dataset.section); }, o);
  }
  for (const p of panels.values()) {
    p.addEventListener("pointerenter", () => clearTimeout(timer), o);
    p.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") hide(false); }, o);
    p.addEventListener("focusout", (e) => { if (!p.contains(e.relatedTarget) && !links.includes(e.relatedTarget)) hide(false); }, o);
    p.addEventListener("click", () => hide(true), o);
  }
  root.addEventListener("keydown", (e) => { if (e.key === "Escape" && openId) { const a = links.find((l) => l.dataset.section === openId); hide(true); a?.focus(); } }, o);
  root.addEventListener("pointerdown", (e) => { if (openId && !e.target.closest(".nav-flyout, .mainnav")) hide(true); }, o);
  return () => ac.abort();
}

// The folding menus of the header (profile, "Pour enseigner") also open when a mouse rests on them and close when it leaves,
// unless a click kept them open. Touch and keyboard behave as before (a plain <details>).
export function installHoverDetails(root = document) {
  const ac = new AbortController(), o = { signal: ac.signal };
  for (const d of root.querySelectorAll("details.audience-menu, details.section-tools")) {
    let timer = 0, byHover = false;
    d.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse") return;
      clearTimeout(timer);
      if (!d.open) { d.open = true; byHover = true; }
    }, o);
    d.addEventListener("pointerleave", (e) => {
      if (e.pointerType !== "mouse" || !byHover) return;
      timer = setTimeout(() => { if (byHover) { d.open = false; byHover = false; } }, 320);
    }, o);
    d.querySelector("summary")?.addEventListener("click", (e) => { if (byHover) { e.preventDefault(); byHover = false; } }, o);
  }
  return () => ac.abort();
}
