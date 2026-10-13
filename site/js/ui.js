// Small interface helpers: theme choice and full-screen presenting.
// Both degrade quietly: blocked storage keeps the choice for this visit only,
// and a browser without the Fullscreen API gets a CSS full-window fallback.
const KEY = "maths-explorer-theme";
const COLORS = { jour: "#f5f6f8", nuit: "#0c111b" };

export function currentTheme() {
  return document.documentElement.dataset.theme === "nuit" ? "nuit" : "jour";
}

export function toggleTheme() {
  const next = currentTheme() === "nuit" ? "jour" : "nuit";
  document.documentElement.dataset.theme = next;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", COLORS[next]);
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* the choice lasts for this visit */
  }
  return next;
}

let installed = false;
export function installPresenting() {
  if (installed) return;
  installed = true;
  const sync = () => {
    const active = document.fullscreenElement || document.querySelector(".presenting");
    document.querySelectorAll("[data-fullscreen]").forEach((button) => {
      const target = button.closest("[data-fs-target]");
      const on = !!target && (target === document.fullscreenElement || target.classList.contains("presenting"));
      button.setAttribute("aria-pressed", String(on));
      button.querySelector(".fs-label").textContent = on ? button.dataset.labelOff : button.dataset.labelOn;
    });
    document.documentElement.classList.toggle("is-presenting", !!active);
  };
  document.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-fullscreen]");
    if (!button) return;
    const target = button.closest("[data-fs-target]");
    if (!target) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else if (target.classList.contains("presenting")) target.classList.remove("presenting");
    else if (target.requestFullscreen) target.requestFullscreen().catch(() => target.classList.add("presenting"));
    else target.classList.add("presenting");
    sync();
  });
  document.addEventListener("fullscreenchange", sync);
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const target = document.querySelector(".presenting");
    if (target) {
      target.classList.remove("presenting");
      sync();
    }
  });
}
