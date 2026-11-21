// Encyclopedia article of a gallery curiosity (owner, 20 November 2026): the page describes the subject like an entry of
// an encyclopedia (lead, fact box, sections, history, sources, see also) and the figure beside it is a free exhibit to
// play with. No task, no quiz, no prediction, no imperative addressed to the visitor.
// An article is { facts: [[label, value], ...], lead: [pair, ...], sections: [{ h: pair, p: [pair, ...], explainer?: true }] }
// where pair = [fr, en]; `explainer: true` marks the section that holds the animated explanation (open curiosities).
// An article without an animated explanation gets a cartoon of its lead after the lead ("L’idée en dessin animé": a
// teacher and a student at a chalkboard, challenges/common/comic.js, mounted by app.js on the `data-comic-article` host).
// The text is trusted source text (same as every other page template); it is never built from user input.
import { ARTICLES } from "./articles/index.js";
export const articleOf = (id) => ARTICLES[id] || null;
export function articleHtml(lab, art, t, pair) {
  const paras = (list) => list.map((x) => `<p>${t(x)}</p>`).join("");
  const facts = (art.facts || []).length
    ? `<aside class="art-facts" aria-label="${pair("En bref", "At a glance")}"><h2>${pair("En bref", "At a glance")}</h2><dl>${art.facts.map(([k, v]) => `<dt>${t(k)}</dt><dd>${t(v)}</dd>`).join("")}</dl></aside>` : "";
  const sections = art.sections.map((s, i) => `<section class="art-section" id="s${i + 1}"><h2>${t(s.h)}</h2>${s.p ? paras(s.p) : ""}${s.explainer ? `<div class="sol-host art-explainer" data-explain="${lab.id}"></div>` : ""}</section>`).join("");
  const cartoon = art.sections.some((s) => s.explainer) ? "" : `<section class="art-section art-cartoon"><h2>${pair("L’idée en dessin animé", "The idea as a cartoon")}</h2><div class="sol-host art-comic" data-comic-article="${lab.id}"></div></section>`;
  return `<div class="art-layout"><article class="art-body"><div class="art-lead">${paras(art.lead)}</div>${cartoon}${sections}</article>${facts}</div>`;
}
