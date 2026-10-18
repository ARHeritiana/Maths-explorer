// The one entry point for an experiment, used by the lab page, chapter pages and slides:
//   mountExperiment(host, "quadratic/vertex", { mode: "full" | "inline" | "slide", lang, palette, onMission, onComplete })
// returns { ready, setMission, getState, setState, destroy }. 'full' is the lab page (all missions, argument, URL sync);
// 'inline' is the canvas with one mission and a link to the full page.
import { parseRef, experimentById, TEMPLATES } from "./registry.js";
import { createShell } from "./shell.js";

export function mountExperiment(host, ref, opts = {}) {
  const { id, mission } = parseRef(ref);
  const exp = experimentById(id);
  let inner = null, destroyed = false, wanted = opts.mission || mission;
  // 'slide' lays out like 'inline' for now. TODO(phase 3): the player passes its own palette, #wctl as the controls area
  // and #readout as the readout, and the widget registry dispatches `type: "lab"` here.
  const mode = opts.mode === "full" ? "full" : opts.mode === "slide" ? "slide" : "inline";
  const lang = opts.lang || document.documentElement.lang || "fr";
  const api = {
    ready: Promise.resolve(),
    get shell() { return inner; },
    setMission(m) { wanted = m; inner?.setMission(m); },
    getState: () => inner?.getState() ?? null,
    setState: (p) => inner?.setState(p),
    destroy() { destroyed = true; inner?.destroy(); inner = null; },
  };
  if (!exp) {
    const p = document.createElement("p");
    p.textContent = lang === "en" ? "This experiment does not exist." : "Cette expérience n’existe pas.";
    host.replaceChildren(p);
    return api;
  }
  api.ready = TEMPLATES[exp.template]().then((tpl) => {
    if (destroyed) return;
    inner = createShell(host, exp, tpl, { ...opts, mode, lang, mission: wanted });
  });
  return api;
}
