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

// Order of the catalogue. The experiments are plain data and small; the heavy part (templates) is imported on demand.
export const EXPERIMENTS = [quadratic, trig, sequences, derivative, integral, probability, vectors, statistics, complex];

export const TEMPLATES = {
  family: () => import("./templates/family.js"),
  process: () => import("./templates/process.js"),
  chance: () => import("./templates/chance.js"),
  figure: () => import("./templates/figure.js"),
  data: () => import("./templates/data.js"),
  transform: () => import("./templates/transform.js"),
};

// Type of activity, shown as the group titles of the #lab index.
export const TEMPLATE_INFO = {
  family: { title: ["Faire varier un paramètre", "Change a parameter"], blurb: ["Une famille de fonctions : que change chaque coefficient ?", "A family of functions: what does each coefficient change?"] },
  process: { title: ["Rapprocher jusqu’à la limite", "Approach the limit"], blurb: ["Un procédé indexé par n ou h : vers quoi tend-il ?", "A process indexed by n or h: what does it approach?"] },
  chance: { title: ["Répéter le hasard", "Repeat chance"], blurb: ["Une expérience aléatoire répétée : les fréquences se rapprochent-elles des probabilités ?", "A random experiment repeated: do frequencies come close to probabilities?"] },
  figure: { title: ["Une figure, un invariant", "A figure, an invariant"], blurb: ["Déplace les points d’une figure et cherche ce qui reste vrai.", "Move the points of a figure and look for what stays true."] },
  data: { title: ["Des données, des résumés", "Data and summaries"], blurb: ["Chaque valeur compte : comment réagissent la moyenne, la médiane et la boîte ?", "Every value counts: how do the mean, the median and the box react?"] },
  transform: { title: ["Transformer le plan", "Transform the plane"], blurb: ["Une opération appliquée à un point, à une figure, à un quadrillage.", "An operation applied to a point, a figure, a grid."] },
};

export const experimentById = (id) => EXPERIMENTS.find((e) => e.id === id) || null;

// "quadratic" or "quadratic/vertex" -> { id, mission }
export function parseRef(ref) {
  const [id, mission] = String(ref || "").split("/");
  return { id, mission: mission || null };
}
// The experiment and mission index of a reference, or null when it does not resolve.
export function resolveRef(ref) {
  const { id, mission } = parseRef(ref);
  const experiment = experimentById(id);
  if (!experiment) return null;
  if (!mission) return { experiment, index: 0 };
  const index = experiment.missions.findIndex((m) => m.id === mission);
  return index < 0 ? null : { experiment, index };
}
export const labRef = (id, mission) => (mission ? `${id}/${mission}` : id);
export const allRefs = () => EXPERIMENTS.flatMap((e) => [e.id, ...e.missions.map((m) => `${e.id}/${m.id}`)]);

// Entries of the shared catalogue (content.js `labs`): what the home page, the library and the pathways need to name a lab.
export const catalogue = () => EXPERIMENTS.map((e) => ({
  id: e.id, experiment: true, template: e.template, symbol: e.symbol, group: e.group, title: e.title, short: e.short, intro: e.intro,
  duration: e.duration, level: e.level, prereq: e.prereq,
  history: e.history.title, story: e.history.story, source: e.history.source,
}));
