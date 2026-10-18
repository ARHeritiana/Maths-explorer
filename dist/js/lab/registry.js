// The experiments of the laboratory: id -> experiment module, the templates (loaded when an experiment is mounted) and the
// lab reference "<experiment>" or "<experiment>/<mission>" that the lab page, chapter pages and slides share.
import quadratic from "./experiments/quadratic.js";
import trig from "./experiments/trig.js";
import sequences from "./experiments/sequences.js";
import derivative from "./experiments/derivative.js";
import integral from "./experiments/integral.js";

// Order of the catalogue. The experiments are plain data and small; the heavy part (templates) is imported on demand.
export const EXPERIMENTS = [quadratic, trig, sequences, derivative, integral];

export const TEMPLATES = {
  family: () => import("./templates/family.js"),
  process: () => import("./templates/process.js"),
};

// Type of activity, shown as the group titles of the #lab index.
export const TEMPLATE_INFO = {
  family: { title: ["Faire varier un paramètre", "Change a parameter"], blurb: ["Une famille de fonctions : que change chaque coefficient ?", "A family of functions: what does each coefficient change?"] },
  process: { title: ["Rapprocher jusqu’à la limite", "Approach the limit"], blurb: ["Un procédé indexé par n ou h : vers quoi tend-il ?", "A process indexed by n or h: what does it approach?"] },
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
