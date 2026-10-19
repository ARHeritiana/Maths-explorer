// Every challenge is one folder, site/js/challenges/<id>/: index.js (card, variations, original question, emblem, hint
// actions), maths.js (pure, tested), activity.js (hands-on canvas), solution.js (animated solution), and view-3d.js or
// art.js when it draws its own 3D objects or characters. Shared building blocks are in common/.
// To add a challenge: create its folder (copy a recent one, such as pegs/), then add it to the two lists below.
import { playSolution } from "./common/player.js";
import { svg, dot } from "./common/icon.js";
import * as doors from "./doors/index.js";
import * as chess from "./chess/index.js";
import * as nim from "./nim/index.js";
import * as pigeonhole from "./pigeonhole/index.js";
import * as squares from "./squares/index.js";
import * as hanoi from "./hanoi/index.js";
import * as eggs from "./eggs/index.js";
import * as konigsberg from "./konigsberg/index.js";
import * as josephus from "./josephus/index.js";
import * as ramsey from "./ramsey/index.js";
import * as artgallery from "./artgallery/index.js";
import * as gridpaths from "./gridpaths/index.js";
import * as horses from "./horses/index.js";
import * as cake from "./cake/index.js";
import * as queens from "./queens/index.js";
import * as snail from "./snail/index.js";
import * as bridge from "./bridge/index.js";
import * as lighteggs from "./lighteggs/index.js";
import * as fakecoins from "./fakecoins/index.js";
import * as reflect from "./reflect/index.js";
import * as lunes from "./lunes/index.js";
import * as star from "./star/index.js";
import * as box from "./box/index.js";
import * as merge from "./merge/index.js";
import * as cham from "./cham/index.js";
import * as pegs from "./pegs/index.js";
import * as inversions from "./inversions/index.js";
import * as piles from "./piles/index.js";
import * as cookies from "./cookies/index.js";
import * as jugs from "./jugs/index.js";

// Order of the cards on the challenges page.
export const CHALLENGES = [doors, chess, nim, pigeonhole, squares, hanoi, eggs, konigsberg, josephus, ramsey, artgallery, gridpaths, cookies, jugs, horses, cake, queens, snail, bridge, lighteggs, fakecoins, reflect, lunes, star, box, merge, cham, pegs, inversions, piles];

const byId = Object.fromEntries(CHALLENGES.map((c) => [c.card.id, c]));
const table = (field) => Object.fromEntries(CHALLENGES.filter((c) => c[field] !== undefined).map((c) => [c.card.id, c[field]]));

export const challengeBase = CHALLENGES.map((c) => c.card);
export const VARIANTS = table("variant");
export const HINT_ACTIONS = table("hintActions");
export const ORIGINALS = table("original");

/* ------------------------------------------------------------- variants */
export const hasVariants = (id) => Object.hasOwn(VARIANTS, id);
export const defaults = (id) => Object.fromEntries(VARIANTS[id].params.map((p) => [p.id, p.value]));
export function randomParams(id, rnd = Math.random) {
  const q = {};
  for (const p of VARIANTS[id].params) {
    if (p.kind === "int") { const slots = Math.floor((p.max - p.min) / p.step) + 1; q[p.id] = p.min + p.step * Math.floor(rnd() * slots); }
    else q[p.id] = p.options[Math.floor(rnd() * p.options.length)][0];
  }
  VARIANTS[id].random?.(q, rnd);   // a variation may draw more than its listed parameters (Königsberg: the graph seed)
  return q;
}
// Clamp parameters to their ranges (values from number inputs may be empty or out of range).
export function normalise(id, q) {
  const out = {};
  for (const p of VARIANTS[id].params) {
    if (p.kind === "int") { const v = Math.round(Number(q[p.id])); out[p.id] = Number.isFinite(v) ? Math.min(p.max, Math.max(p.min, p.step > 1 ? p.min + Math.round((v - p.min) / p.step) * p.step : v)) : p.value; }
    else out[p.id] = p.options.some((o) => String(o[0]) === String(q[p.id])) ? (typeof p.options[0][0] === "number" ? Number(q[p.id]) : q[p.id]) : p.value;
  }
  return out;
}

/* ------------------------------------------------------- original, emblem */
export const originalOf = (id, q) => (ORIGINALS[id] ? ORIGINALS[id](q) : null);
export const challengeIcon = (id) => byId[id]?.icon || svg(`<circle cx="32" cy="32" r="20"/>${dot(32, 32, 4, "ci-pulse")}`);

/* ------------------------------------------------------------- activity */
export const hasActivity = (id) => typeof byId[id]?.activity === "function";
export function mountActivity(id, root, { lang, reduced, params = {} }) {
  const t = (fr, en) => (lang === "fr" ? fr : en);
  // Each mount gets a fresh inner element: activities attach listeners to their root, and the host element survives a
  // change of variation, so listeners from the previous parameters would otherwise keep running on the new content.
  const inner = document.createElement("div");
  root.replaceChildren(inner);
  const stop = byId[id]?.activity?.(inner, { t, lang, reduced, q: params });
  return stop || (() => {});
}

/* ------------------------------------------------------------- solution */
// A cartoon or 3D scene (mount/update) replaces the drawing of the diagram but keeps its captions (steps).
export const SOLUTIONS = Object.fromEntries(CHALLENGES.filter((c) => c.diagram).map((c) => {
  const old = c.diagram, sc = c.scene;
  return [c.card.id, sc ? { ...old, ...sc, steps: sc.steps ?? old.steps, draw: undefined } : old];
}));
export const hasSolution = (id) => Object.hasOwn(SOLUTIONS, id);
export const stepsOf = (id, q) => SOLUTIONS[id].steps(q);
export const mountSolution = (id, root, options) => (SOLUTIONS[id] ? playSolution(SOLUTIONS[id], root, options) : null);
