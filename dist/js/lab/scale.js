// Experiments that may use more resources on a capable device (device-capability.js): the ceilings the page offers, filled in once the
// shell has measured the device (the `scale` property of an experiment). Until then, and on every device that cannot do better, they
// are the basic ones: nothing more than the experiment always offered.
import { LIMITS } from '../device-capability.js';
export const deviceScale = { tier: 'basic', limits: LIMITS.basic };
// `scale` of an experiment: kind names the cached measurement, work does one slice of the real computation and returns its units.
export const scaleFor = (kind, work, apply) => ({ kind, share: 0.3, work, apply: (r) => { deviceScale.tier = r.tier; deviceScale.limits = r.limits; apply?.(r); } });
// An extra "+ N" button of a series, present only where the device allows a series that long.
export const drawOption = (value, fr, en) => ({ value, label: [fr, en], hidden: () => value > deviceScale.limits.draws });
