// Template `process`: a process indexed by n or h that approaches a limit. It is the `family` figure plus a scrubber with
// play (the index control of the experiment) and the table of the process that the shell shows next to the figure.
import { mount as mountFamily } from "./family.js";

export function mount(env) {
  const base = mountFamily(env);
  const { stage, getState, advance: setState } = env;

  // Play moves the scrubber of control `c` (get/set on a scale p in [min, max]) towards its end inside the one scheduler.
  // Under reduced motion there is no animation: each press jumps one step.
  function player(c, onChange) {
    let stop = null;
    const spec = c.play || {}, lo = spec.from ?? c.min, hi = spec.to ?? c.max;
    const api = {
      get playing() { return !!stop; },
      stop() { if (stop) { stop(); stop = null; onChange?.(false); } },
      toggle() {
        if (stop) return api.stop();
        let p = c.get(getState());
        if (stage.reduced()) {
          const jump = spec.step ?? (hi - lo) / 6;
          setState(c.set(getState(), p + jump > hi + 1e-9 ? lo : p + jump));
          return;
        }
        if (p >= hi - 1e-9) p = lo;
        const seconds = spec.seconds ?? 4, from = p;
        let t0 = null;
        stop = stage.animate((now) => {
          t0 ??= now;
          const k = Math.min(1, (now - t0) / (seconds * 1000));
          setState(c.set(getState(), from + (hi - from) * k));
          if (k >= 1) { stop = null; onChange?.(false); return false; }
        });
        onChange?.(true);
      },
    };
    return api;
  }
  return { ...base, player };
}
