// Error correction collection ("Erreurs"): the pure mathematics, no DOM. The records are in errors-data.js.
// Every activity starts from a false claim a learner might write. What the page tells the learner is computed here,
// never stored: a counterexample is found by evaluation, a proposed repair is accepted only if it holds on a grid of
// values of the claim's domain (`holds`), and the faulty step of a derivation is the first step whose equation fails.
import { ERRORS, DERIVATIONS, ROUTE, FAMILIES } from './errors-data.js';
export { ERRORS, DERIVATIONS, ROUTE, FAMILIES };
export const all = () => [...ERRORS, ...DERIVATIONS];
export const find = (id) => all().find((e) => e.id === id) || null;
export const isErrorRoute = (id) => !id || !!find(id);

const EPS = 1e-9;
export const close = (u, v) => Math.abs(u - v) <= EPS * Math.max(1, Math.abs(u), Math.abs(v));
// A relation between the two sides: '=' (default), '<', '>', '<=', '>='.
const slack = (u, v) => EPS * Math.max(1, Math.abs(u), Math.abs(v));
export const holdsAt = (rel, u, v) => ({
  '=': () => close(u, v), '<': () => u < v - slack(u, v), '>': () => u > v + slack(u, v),
  '<=': () => u <= v + slack(u, v), '>=': () => u >= v - slack(u, v),
}[rel || '='])();
export const relOf = (error) => error.rel || '=';

// Integer grid over the domain of a claim: every value of x, and y when there is one, filtered by the hypothesis `when`.
export function grid(error, when = error.when) {
  const [x0, x1] = error.range.x, ys = error.vars.includes('y') ? error.range.y : [0, 0], points = [];
  for (let x = x0; x <= x1; x++) for (let y = ys[0]; y <= ys[1]; y++) if (!when || when(x, y)) points.push([x, y]);
  return points;
}
// First point of the grid where `rel` fails for (L, R), or null when it holds everywhere.
export function counterexample(error, L = error.L, R = error.R, rel = relOf(error), when = error.when) {
  for (const [x, y] of grid(error, when)) if (!holdsAt(rel, L(x, y), R(x, y))) return { x, y, left: L(x, y), right: R(x, y) };
  return null;
}
// A repair is accepted only if it holds on the whole grid (of its own hypothesis, if it has one); otherwise the learner
// gets the point where it fails.
export function checkRepair(error, repair) {
  const when = repair.when || error.when, cx = counterexample(error, repair.L, repair.R, repair.rel, when);
  return cx ? { ok: false, counterexample: cx } : { ok: true, points: grid(error, when).length };
}
// Values at which the faulty claim happens to hold: an example never proves a general claim.
export function coincidences(error) {
  return grid(error).filter(([x, y]) => holdsAt(relOf(error), error.L(x, y), error.R(x, y)));
}
// Does the claim hold at this point? `null` when the hypothesis of the claim is not met there.
export function claimAt(error, x, y) {
  if (error.when && !error.when(x, y)) return null;
  return holdsAt(relOf(error), error.L(x, y), error.R(x, y));
}
// Errors that point at a site address (a chapter, for instance): the reverse of `links`, for lessons, exercises and slides.
export const errorsFor = (hash) => all().filter((e) => (e.links || []).includes(hash));

// Derivation: each step's two sides at a = b = t, whether it holds, the first false step (index) and the divisors.
export function evaluateDerivation(d, t) {
  const rows = d.steps.map((s, i) => {
    const left = s.L(t, t), right = s.R(t, t), divisor = d.divisor[i] ? d.divisor[i](t, t) : null;
    return { i, left, right, holds: close(left, right), divisor };
  });
  const firstFalse = rows.findIndex((r) => !r.holds);
  return { rows, firstFalse };
}

// Exact for integers, otherwise rounded (≈ marks a rounded value, = an exact one, as in the laboratory).
export function show(v, lang = 'fr') {
  if (Number.isInteger(v)) return String(v).replace('-', '−');
  const s = (Math.round(v * 1e4) / 1e4).toLocaleString(lang === 'en' ? 'en-GB' : 'fr-FR', { maximumFractionDigits: 4 }).replace('-', '−');
  return '≈ ' + s;
}
