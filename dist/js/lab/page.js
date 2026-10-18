// Markup of the two laboratory pages: the index (experiments grouped by type of activity) and one experiment page (heading,
// the host that mount.js fills, related lessons, history). No drawing and no state here.
import { EXPERIMENTS, TEMPLATE_INFO, labRef } from "./registry.js";
import { relatedChapters } from "../resource-library.js";

const esc = (x) => String(x).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const card = (e, { t, pair, link, completed }) => `<a class="lab2-card-link" href="${link("lab", e.id)}"><span class="lab2-card-symbol" aria-hidden="true">${esc(e.symbol)}</span><span class="lab2-card-body"><strong>${esc(t(e.title))}</strong><span>${esc(t(e.short))}</span><span class="lab2-card-meta">${esc(t(e.level))} · ${e.duration} min · ${e.missions.length} ${pair("missions", "missions")}</span></span>${completed.has(e.id) ? `<span class="check" aria-label="${pair("Expérience terminée", "Experiment completed")}">✓</span>` : ""}</a>`;

export function indexPage({ t, pair, link, completed }) {
  const groups = Object.entries(TEMPLATE_INFO).map(([id, info]) => {
    const list = EXPERIMENTS.filter((e) => e.template === id);
    return list.length ? `<section class="lab2-group"><h2>${esc(t(info.title))}</h2><p>${esc(t(info.blurb))}</p><div class="lab2-cards">${list.map((e) => card(e, { t, pair, link, completed })).join("")}</div></section>` : "";
  }).join("");
  return `<main id="main" class="page lab2-index" tabindex="-1"><div class="breadcrumb">${pair("Le laboratoire", "The laboratory")}</div><h1>${pair("Le laboratoire", "The laboratory")}</h1><p class="page-intro">${pair("Chaque expérience est une suite de missions courtes : prédire, explorer, comparer, vérifier, expliquer. Les commandes se déverrouillent mission après mission, et l’argument arrive à la fin.", "Each experiment is a short sequence of missions: predict, explore, compare, check, explain. Controls unlock mission by mission, and the argument comes at the end.")}</p>${groups}</main>`;
}

export function experimentPage(exp, { t, pair, link, completed, mission = "" }) {
  const chips = EXPERIMENTS.map((e) => `<a href="${link("lab", e.id)}" ${e.id === exp.id ? 'aria-current="page"' : ""}><span aria-hidden="true">${esc(e.symbol)}</span> ${esc(t(e.short))}${completed.has(e.id) ? ' <span class="check" aria-hidden="true">✓</span>' : ""}</a>`).join("");
  const workshop = exp.id === "quadratic" ? `<a class="secondary quadratic-workshop-link" href="#workshop/quadratic">${pair("Présenter et explorer · 5 étapes", "Present and explore · 5 stages")}</a>` : "";
  return `<main id="main" class="page lab2-page" tabindex="-1" data-experiment="${exp.id}">
<div class="breadcrumb"><a href="${link("lab")}">${pair("Le laboratoire", "The laboratory")}</a><span>/</span>${esc(t(exp.group))}</div>
<div class="lab-heading"><div><h1>${esc(t(exp.title))}</h1><p>${esc(t(exp.intro))}</p></div><span class="level">${esc(t(exp.level))}</span></div>
<p class="lab2-meta"><span aria-hidden="true">◷</span> ${exp.duration} min · <strong>${pair("Avant de commencer", "Before you begin")}</strong> ${esc(t(exp.prereq))}</p>
<div id="lab2-host" class="lab2-host" data-ref="${esc(labRef(exp.id, mission))}"></div>
<nav class="lab2-chips" aria-label="${pair("Autres expériences", "Other experiments")}">${chips}</nav>
<section class="lab-resources"><h2>${pair("Poursuivre ce chapitre", "Continue this topic")}</h2>${relatedChapters(exp.id, t)}<p>${pair("Passer de l’expérience aux notes, aux exercices et aux problèmes.", "Move from the experiment to notes, exercises and problems.")}</p><a class="secondary" href="#library/@${exp.id}">${pair("Ressources liées à cette expérience", "Resources linked to this experiment")}</a> ${workshop}</section>
<section class="history"><div class="history-icon" aria-hidden="true">H</div><div class="history-title"><span class="eyebrow">${pair("Repère historique", "History box")}</span><h2>${esc(t(exp.history.title))}</h2></div><div><p>${esc(t(exp.history.story))}</p><a href="${exp.history.source}" target="_blank" rel="noopener noreferrer">${pair("En savoir plus · MacTutor (anglais)", "Read more · MacTutor")} <span class="sr-only">${pair("(nouvel onglet)", "(new tab)")}</span></a></div></section></main>`;
}
