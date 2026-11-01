// What this device can afford. Some exhibits (the mirrored rooms, Monte Carlo) can use enormous budgets: hundreds of thousands of
// rays, thousands of bounces, millions of trials. They do so only where the device proves it can, and never by guessing:
//  1. a few facts that forbid it (data saver, low battery, a phone, no Web Worker, no float GPU buffer) cap the tier;
//  2. a short benchmark of the real computation measures the speed of this device;
//  3. memory and the time to fill a budget (about 6 s on all workers) cap the tier again.
// The answer is a tier with ceilings. The page offers the choices up to those ceilings and nothing above, runs the heavy work
// off the main thread in slices, and stops at the memory ceiling instead of freezing the tab. The pure decision (`decide`) takes
// plain numbers, so it is tested without a browser.
export const TIERS = ['basic', 'standard', 'high', 'extreme'];
// ceilings per tier: rays and bounces offered, segments kept (16 bytes each on the GPU side), trials per second for sampling,
// runs (sampling), draws (series of animated experiments), solver steps and the smallest solver tolerance offered
export const LIMITS = {
  basic: { draws: 5e3, steps: 1e5, tolerance: 1e-10, runs: 1e4, rays: 1440, bounces: 100, segments: 3e5, trialsPerSecond: 6000, workers: 0 },
  standard: { draws: 5e4, steps: 4e5, tolerance: 1e-11, runs: 1e5, rays: 5000, bounces: 200, segments: 1.5e6, trialsPerSecond: 60000, workers: 2 },
  high: { draws: 5e5, steps: 2e6, tolerance: 1e-12, runs: 1e6, rays: 50000, bounces: 500, segments: 8e6, trialsPerSecond: 400000, workers: 4 },
  extreme: { draws: 5e6, steps: 8e6, tolerance: 1e-13, runs: 1e7, rays: 500000, bounces: 2000, segments: 2.4e7, trialsPerSecond: 2000000, workers: 8 },
};
const TARGET_SECONDS = 6;      // a full budget must be reachable in about this long on all workers
const SEGMENTS_PER_GB = 1.2e6; // memory share an exhibit may take per GB reported

export function readEnvironment(env = globalThis) {
  const nav = env.navigator || {}, conn = nav.connection || {};
  const media = (q) => { try { return !!env.matchMedia?.(q).matches; } catch { return false; } };
  return {
    cores: Number.isFinite(nav.hardwareConcurrency) ? nav.hardwareConcurrency : 2,
    memoryGB: Number.isFinite(nav.deviceMemory) ? nav.deviceMemory : null,   // reported in steps up to 8 (absent in Firefox and Safari)
    saveData: conn.saveData === true || media('(prefers-reduced-data: reduce)'),
    coarsePointer: media('(pointer: coarse)'),
    smallScreen: Math.min(env.screen?.width || 9999, env.screen?.height || 9999) < 700,
    workers: typeof env.Worker === 'function',
  };
}
// Float colour buffer + blending: needed to count hundreds of thousands of crossings per pixel on the GPU.
export function probeFloatBuffer(makeCanvas = () => globalThis.document?.createElement('canvas')) {
  try {
    const gl = makeCanvas()?.getContext('webgl2'); if (!gl) return { webgl2: false, floatBlend: false };
    const floatBuffer = !!gl.getExtension('EXT_color_buffer_float'), floatBlend = !!gl.getExtension('EXT_float_blend');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return { webgl2: true, floatBuffer, floatBlend };
  } catch { return { webgl2: false, floatBuffer: false, floatBlend: false }; }
}

// facts: readEnvironment() + { webgl2, floatBuffer, battery: { level, charging } | null }; speed: segments per second, one thread.
export function decide(facts, speed, { gpu = true, share = 0 } = {}) {
  const reasons = []; let max = TIERS.length - 1;
  const cap = (tier, why) => { const i = TIERS.indexOf(tier); if (i < max) { max = i; reasons.push(why); } };
  if (gpu && (!facts.webgl2 || !facts.floatBuffer)) cap('basic', 'no float GPU buffer');
  if (facts.saveData) cap('standard', 'data saver');
  if (facts.battery && !facts.battery.charging && facts.battery.level < 0.2) cap('standard', 'low battery');
  if ((facts.coarsePointer && facts.smallScreen) && facts.cores < 8) cap('standard', 'phone');
  else if (facts.coarsePointer && facts.smallScreen) cap('high', 'phone');
  if (!Number.isFinite(speed) || speed <= 0) cap('basic', 'no measurement');
  const workers = facts.workers ? Math.max(1, Math.min(8, facts.cores - 1)) : 0;
  if (gpu && !facts.workers) cap('standard', 'no Web Worker');
  // heavy tiers need spare cores: the page must stay answering while the workers run
  if (gpu && workers < 2) cap('standard', 'fewer than 2 spare cores'); else if (gpu && workers < 4) cap('high', 'fewer than 4 spare cores');
  const memoryGB = facts.memoryGB ?? (facts.cores >= 10 ? 8 : 4);
  const throughput = (speed || 0) * Math.max(1, workers), memCap = memoryGB * SEGMENTS_PER_GB * (memoryGB >= 8 ? 2.5 : 1);
  let tier = 'basic';
  // share > 0: work done on the page itself (sampling): the speed offered may use only this share of what one thread measured
  if (share > 0) { for (let i = 1; i <= max; i++) { if (LIMITS[TIERS[i]].trialsPerSecond <= speed * share) tier = TIERS[i]; else break; } }
  else for (let i = 1; i <= max; i++) { const L = LIMITS[TIERS[i]]; if (L.segments <= throughput * TARGET_SECONDS && L.segments <= memCap) tier = TIERS[i]; else break; }
  if (TIERS.indexOf(tier) < max) reasons.push(`speed or memory (${Math.round(throughput / 1e3)}k segments per second, ${memoryGB} GB)`);
  return { tier, limits: LIMITS[tier], workers: Math.min(workers, LIMITS[tier].workers), reasons, speed, memoryGB };
}

// Run `work()` repeatedly for about `ms`; returns work units per second (work returns the units it did).
export function measure(work, ms = 40, now = () => globalThis.performance.now()) {
  const t0 = now(); let units = 0, t = t0;
  do { units += work(); t = now(); } while (t - t0 < ms);
  return units / ((t - t0) / 1000);
}

// The capability of this device for a given kind of work, measured once per session and cached.
// `work` does one slice of the real computation and returns its units; options.storage defaults to sessionStorage.
export async function capability({ kind, work, env = globalThis, floatProbe = probeFloatBuffer, ms = 40, storage = env.sessionStorage, gpu = true, share = 0 } = {}) {
  const key = 'mx-capability-' + kind;
  try { const hit = JSON.parse(storage?.getItem(key) || 'null'); if (hit?.tier) return hit; } catch { /* storage blocked */ }
  await new Promise((resolve) => (env.requestIdleCallback ? env.requestIdleCallback(resolve, { timeout: 800 }) : setTimeout(resolve, 0)));
  const facts = { ...readEnvironment(env), ...floatProbe(), battery: null };
  try { const b = await env.navigator?.getBattery?.(); if (b) facts.battery = { level: b.level, charging: b.charging }; } catch { /* not available */ }
  const speed = work ? measure(work, ms, () => env.performance.now()) : NaN;
  const result = decide(facts, speed, { gpu, share });
  try { storage?.setItem(key, JSON.stringify(result)); } catch { /* storage blocked */ }
  return result;
}
// Choices up to the ceiling only: options is a list of numbers, the ones above `max` are dropped.
export const upTo = (options, max) => options.filter((x) => x <= max);
