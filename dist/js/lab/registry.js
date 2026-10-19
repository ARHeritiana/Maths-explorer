// The experiments of the laboratory: id -> experiment module, the templates (loaded when an experiment is mounted) and the
// lab reference "<experiment>" or "<experiment>/<mission>" that the lab page, chapter pages and slides share.
import quadratic from "./experiments/quadratic.js";
import trig from "./experiments/trig.js";
import sequences from "./experiments/sequences.js";
import derivative from "./experiments/derivative.js";
import integral from "./experiments/integral.js";
import probability from "./experiments/probability.js";
import vectors from "./experiments/vectors.js";
import statistics from "./experiments/statistics.js";
import complex from "./experiments/complex.js";
import fourier from "./experiments/fourier.js";
import { drawingExperiment } from "./experiments/fourier.js";
import line from "./experiments/line.js";
import exponential from "./experiments/exponential.js";
import cobweb from "./experiments/cobweb.js";
import matrix from "./experiments/matrix.js";
import spaceLines from "./experiments/space-lines.js";
import tiles from "./experiments/tiles.js";
import eulerPrimes from "./experiments/euler-primes.js";
import fermat from "./experiments/fermat.js";
import circleRegions from "./experiments/circle-regions.js";
import buffon from "./experiments/buffon.js";
import bertrand from "./experiments/bertrand.js";

// Order of the catalogue. The experiments are plain data and small; the heavy part (templates) is imported on demand.
export const EXPERIMENTS = [quadratic, trig, sequences, derivative, integral, probability, vectors, statistics, complex, line, exponential, cobweb, matrix, spaceLines, fourier, drawingExperiment, tiles, eulerPrimes, fermat, circleRegions, buffon, bertrand];

export const TEMPLATES = {
  fourier: () => import("./templates/fourier.js"),
  family: () => import("./templates/family.js"),
  process: () => import("./templates/process.js"),
  chance: () => import("./templates/chance.js"),
  figure: () => import("./templates/figure.js"),
  data: () => import("./templates/data.js"),
  transform: () => import("./templates/transform.js"),
  space: () => import("./templates/space.js"),
};

// Type of activity, shown as the group titles of the #lab index.
export const TEMPLATE_INFO = {
  fourier: {title:['Décomposer et reconstruire','Decompose and reconstruct'],blurb:['Des signaux périodiques aux contours tracés par des cercles.','From periodic signals to outlines drawn by circles.']},
  family: { title: ["Faire varier un paramètre", "Change a parameter"], blurb: ["Une famille de fonctions : que change chaque coefficient ?", "A family of functions: what does each coefficient change?"] },
  process: { title: ["Rapprocher jusqu’à la limite", "Approach the limit"], blurb: ["Un procédé indexé par n ou h : vers quoi tend-il ?", "A process indexed by n or h: what does it approach?"] },
  chance: { title: ["Répéter le hasard", "Repeat chance"], blurb: ["Une expérience aléatoire répétée : les fréquences se rapprochent-elles des probabilités ?", "A random experiment repeated: do frequencies come close to probabilities?"] },
  figure: { title: ["Une figure, un invariant", "A figure, an invariant"], blurb: ["Déplace les points d’une figure et cherche ce qui reste vrai.", "Move the points of a figure and look for what stays true."] },
  data: { title: ["Des données, des résumés", "Data and summaries"], blurb: ["Chaque valeur compte : comment réagissent la moyenne, la médiane et la boîte ?", "Every value counts: how do the mean, the median and the box react?"] },
  transform: { title: ["Transformer le plan", "Transform the plane"], blurb: ["Une opération appliquée à un point, à une figure, à un quadrillage.", "An operation applied to a point, a figure, a grid."] },
  space: { title: ["Explorer l’espace", "Explore space"], blurb: ["Une figure en trois dimensions que l’on fait tourner, avec des points qui restent sur une droite ou un plan.", "A three-dimensional figure you can turn, with points that stay on a line or a plane."] },
};

// Groups of the #lab index that are about an idea rather than a template: an experiment with `section` is listed there (with its
// `sub` title as a subsection) instead of under its template. The index shows the groups in this order.
export const SECTION_INFO = {
  tiles: { title: ["Une figure n’est pas une preuve", "A figure is not a proof"], blurb: ["Des pièces qui semblent changer d’aire : la démonstration dit où est l’erreur.", "Pieces that seem to change their area: the proof says where the error is."] },
  patterns: { title: ["Une régularité n’est pas une preuve", "A pattern is not a proof"], blurb: ["Des observations vraies pendant 5 ou 40 cas, puis fausses.", "Observations true for 5 or 40 cases, then false."] },
  geochance: { title: ["Probabilités géométriques", "Geometric probability"], blurb: ["Le hasard dans le plan : une aiguille, une corde.", "Chance in the plane: a needle, a chord."] },
};
export const INDEX_ORDER = ["family", "process", "chance", "geochance", "figure", "tiles", "patterns", "data", "transform", "space", "fourier"];
export const groupOf = (e) => e.section || e.template;

export const experimentById = (id) => EXPERIMENTS.find((e) => e.id === id) || null;

// "quadratic" or "quadratic/vertex" -> { id, mission }
export function parseRef(ref) {
  const [id, mission] = String(ref || "").split("/");
  return { id, mission: mission || null };
}
// THE resolver of a lab reference (lab page, chapter pages, slides, tests): { experiment, mission, index, ref } or null when it
// does not resolve. `mission` is the mission object ("quadratic/vertex") or the first mission when the reference names only the
// experiment; `ref` is the normal form "<experiment>/<mission>"; `explicit` says whether the reference named a mission.
export function resolveRef(ref) {
  if (typeof ref !== "string") return null;
  const { id, mission } = parseRef(ref);
  const experiment = experimentById(id);
  if (!experiment || ref.split("/").length > 2) return null;
  const index = mission ? experiment.missions.findIndex((m) => m.id === mission) : 0;
  if (index < 0) return null;
  return { experiment, mission: experiment.missions[index], index, ref: `${experiment.id}/${experiment.missions[index].id}`, explicit: !!mission };
}
export const labRef = (id, mission) => (mission ? `${id}/${mission}` : id);
export const allRefs = () => EXPERIMENTS.flatMap((e) => [e.id, ...e.missions.map((m) => `${e.id}/${m.id}`)]);

// Entries of the shared catalogue (content.js `labs`): what the home page, the library and the pathways need to name a lab.
export const catalogue = () => EXPERIMENTS.map((e) => ({
  id: e.id, experiment: true, template: e.template, section: groupOf(e), symbol: e.symbol, group: e.group, title: e.title, short: e.short, intro: e.intro,
  duration: e.duration, level: e.level, prereq: e.prereq,
  history: e.history.title, story: e.history.story, source: e.history.source,
}));

