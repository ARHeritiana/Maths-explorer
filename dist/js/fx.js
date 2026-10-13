// Interface effects that answer the reader: theme choice, reveal on scroll,
// pointer spotlight on tiles. Everything here is optional; with reduced motion,
// storage blocked or no IntersectionObserver the page is fully usable.
export const themes = [
  { id: "marine", name: ["Marine", "Marine"], color: "#0f1b2d" },
  { id: "charbon", name: ["Charbon", "Charcoal"], color: "#16181d" },
  { id: "jour", name: ["Jour", "Daylight"], color: "#f3f5f8" },
];

export function currentTheme() {
  const id = document.documentElement.dataset.theme;
  return themes.find((x) => x.id === id) || themes[0];
}

export function cycleTheme() {
  const next = themes[(themes.indexOf(currentTheme()) + 1) % themes.length];
  document.documentElement.dataset.theme = next.id;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next.color);
  try {
    localStorage.setItem("maths-explorer-theme", next.id);
  } catch {
    /* choice stays for this visit only */
  }
  return next;
}

let observer = null;

export function installFx(root, reduced) {
  observer?.disconnect();
  observer = null;
  const items = [...root.querySelectorAll("[data-reveal]")];
  if (reduced() || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
  } else {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    items.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < innerHeight && rect.bottom > 0) el.classList.add("in", "now");
      else observer.observe(el);
    });
  }
  // Spotlight: one delegated listener; writes two CSS variables, nothing else.
  root.onpointermove = (event) => {
    const tile = event.target.closest?.(".tile, .toy-card, .challenge-card, .pathway-card, .gesture");
    if (!tile || event.pointerType === "touch") return;
    const box = tile.getBoundingClientRect();
    tile.style.setProperty("--mx", `${event.clientX - box.left}px`);
    tile.style.setProperty("--my", `${event.clientY - box.top}px`);
  };
}

// Header gains a hairline once the page has scrolled (state change, not decoration).
let scrolled = false;
let watching = false;
const markHeader = () => document.querySelector(".topbar")?.classList.toggle("scrolled", scrolled);

export function watchScroll() {
  markHeader();
  if (watching || !("IntersectionObserver" in window)) return;
  watching = true;
  const sentinel = document.createElement("div");
  sentinel.className = "scroll-sentinel";
  sentinel.setAttribute("aria-hidden", "true");
  document.body.prepend(sentinel);
  new IntersectionObserver(([entry]) => {
    scrolled = !entry.isIntersecting;
    markHeader();
  }).observe(sentinel);
}
