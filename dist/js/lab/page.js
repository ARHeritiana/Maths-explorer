// Markup of the two laboratory pages: the index (experiments grouped by type of activity or by idea, with subsections) and one
// experiment page (heading, the host that mount.js fills, previous / next experiment, related lessons, history). No drawing and
// no state here.
import { EXPERIMENTS, TEMPLATE_INFO, SECTION_INFO, INDEX_ORDER, groupOf, labRef } from "./registry.js";
import { relatedChapters } from "../resource-library.js";
import { fourierLinks } from "../fourier-links.js";

const esc = (x) => String(x).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const infoOf = (id) => SECTION_INFO[id] || TEMPLATE_INFO[id];

// Experiments in the order of the index (group by group), so that "next" follows what the learner saw on the index.
export const ordered = () => INDEX_ORDER.flatMap((g) => EXPERIMENTS.filter((e) => groupOf(e) === g));

const card = (e, { t, pair, link, completed }) => `<a class="lab2-card-link" href="${link("lab", e.id)}"><span class="lab2-card-symbol" aria-hidden="true">${esc(e.symbol)}</span><span class="lab2-card-body"><strong>${esc(t(e.title))}</strong><span>${esc(t(e.short))}</span><span class="lab2-card-meta">${esc(t(e.level))} · ${e.duration} min</span></span>${completed.has(e.id) ? `<span class="check" aria-label="${pair("Expérience terminée", "Experiment completed")}">✓</span>` : ""}</a>`;

export function indexPage(ctx) {
  const { t, pair } = ctx;
  const groups = INDEX_ORDER.map((id) => {
    const list = EXPERIMENTS.filter((e) => groupOf(e) === id), info = infoOf(id);
    if (!list.length || !info) return "";
    // an experiment with a `sub` title is a subsection of its group: the title sits above its card
    const items = list.map((e) => (e.sub ? `<div class="lab2-sub"><h3>${esc(t(e.sub))}</h3>${card(e, ctx)}</div>` : card(e, ctx))).join("");
    return `<section class="lab2-group" id="lab-${id}"><div class="lab2-group-head"><h2>${esc(t(info.title))}</h2><p>${esc(t(info.blurb))}</p></div><div class="lab2-cards">${items}</div></section>`;
  }).join("");
  return `<main id="main" class="page lab2-index" tabindex="-1"><h1>${pair("Le laboratoire", "The laboratory")}</h1><p class="page-intro">${pair("Prédire, explorer, vérifier, puis démontrer : chaque expérience tient en quelques missions courtes.", "Predict, explore, check, then prove: each experiment fits in a few short missions.")}</p>${groups}</main>`;
}

export function experimentPage(exp, { t, pair, link, completed, mission = "" }) {
  const list = ordered(), i = list.indexOf(exp), prev = list[(i - 1 + list.length) % list.length], next = list[(i + 1) % list.length];
  const step = (e, dir) => `<a class="lab2-step-link" href="${link("lab", e.id)}" rel="${dir}"><span class="lab2-step-dir">${dir === "prev" ? pair("← Précédente", "← Previous") : pair("Suivante →", "Next →")}</span><span>${esc(t(e.title))}</span></a>`;
  const others = list.map((e) => `<a href="${link("lab", e.id)}" ${e === exp ? 'aria-current="page"' : ""}><span aria-hidden="true">${esc(e.symbol)}</span> ${esc(t(e.short))}${completed.has(e.id) ? ' <span class="check" aria-hidden="true">✓</span>' : ""}</a>`).join("");
  const workshop = exp.id === "quadratic" ? `<a href="#workshop/quadratic">${pair("Présenter et explorer · 5 étapes", "Present and explore · 5 stages")}</a>` : "";
  const info = infoOf(groupOf(exp));
  return `<main id="main" class="page lab2-page" tabindex="-1" data-experiment="${exp.id}">
<div class="breadcrumb"><a href="${link("lab")}">${pair("Le laboratoire", "The laboratory")}</a><span>/</span>${esc(t(info?.title || exp.group))}</div>
<div class="lab-heading"><div><h1>${esc(t(exp.title))}</h1><p>${esc(t(exp.intro))}</p></div><span class="level">${esc(t(exp.level))}</span></div>
<p class="lab2-meta"><span aria-hidden="true">◷</span> ${exp.duration} min · <strong>${pair("Avant de commencer", "Before you begin")}</strong> ${esc(t(exp.prereq))}</p>
<div id="lab2-host" class="lab2-host" data-ref="${esc(labRef(exp.id, mission))}"></div>
${exp.template === 'fourier' ? fourierLinks(exp.id === 'fourier-drawing' ? 'drawing' : 'lab', pair('fr','en')) : ''}
<nav class="lab2-steps" aria-label="${pair("Autres expériences", "Other experiments")}">${step(prev, "prev")}${step(next, "next")}<details class="lab2-all"><summary>${pair(`Toutes les expériences (${list.length})`, `All experiments (${list.length})`)}</summary><div class="lab2-chips">${others}</div></details></nav>
<div class="lab2-after">
<section class="lab-resources"><h2>${pair("Poursuivre", "Continue")}</h2>${relatedChapters(exp.id, t)}<p class="lab2-links"><a href="#library/@${exp.id}">${pair("Ressources liées à cette expérience", "Resources linked to this experiment")}</a>${workshop}</p></section>
<section class="history"><div class="history-icon" aria-hidden="true">H</div><div><span class="eyebrow">${pair("Repère historique", "History box")}</span><h2>${esc(t(exp.history.title))}</h2><p>${esc(t(exp.history.story))}</p><a href="${exp.history.source}" target="_blank" rel="noopener noreferrer">${pair("En savoir plus · MacTutor (anglais)", "Read more · MacTutor")} <span class="sr-only">${pair("(nouvel onglet)", "(new tab)")}</span></a></div></section>
</div></main>`;
}
