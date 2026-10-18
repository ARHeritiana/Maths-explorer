// The one entry point for an experiment, used by the lab page, chapter pages and slides:
//   mountExperiment(host, "quadratic/vertex", { mode: "full" | "inline" | "slide", lang, palette, onMission, onComplete,
//                                                controls, readout, hint })
// returns { ready, setMission, getState, setState, destroy }.
//   full    the lab page: all missions, argument, URL sync
//   inline  a chapter page: the canvas with one mission (the one the reference names) and a link to the full page
//   slide   the player: the canvas fills `host`; the unlocked controls, the answer area and the mission stepper go to `controls`,
//           the formula and the readout to `readout`, the mission prompt to `hint`; dark `palette`, larger fonts, N and P
//           change mission when the canvas has focus (the player's own arrow keys are not touched)
import { resolveRef, TEMPLATES } from "./registry.js";
import { createShell } from "./shell.js";

export function mountExperiment(host, ref, opts = {}) {
  // a reference whose mission is unknown falls back to the experiment (an old deep link still opens the page)
  const resolved = resolveRef(ref) || resolveRef(String(ref || "").split("/")[0]);
  const exp = resolved?.experiment || null;
  let inner = null, destroyed = false, wanted = opts.mission || (resolved?.explicit ? resolved.mission.id : null);
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
