// The "Lire" section: biographies (#biographies[/<id>]) and stories (#stories[/<id>]); the curiosities are the gallery.
// Cross-references are written once, as `links` of a text or a curiosity; `readAlso` shows them on the page that
// declares them and, reversed, on every page they point to (challenges, gallery, laboratory, other texts).
import { BIOGRAPHIES, STORIES } from "./reading-content.js";
import { labs, challenges } from "./content.js";
import {PEOPLE,ADVANCES,historyRecord,historyLinks,historyRoute} from './history-data.js';
import {discoveryChapters} from './catalogue-data.js';

const esc = (x) => String(x).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const initials = (name) => { const caps = name.split(" ").filter((w) => /^[A-ZÉ]/.test(w)); return caps.length ? caps[0][0] + (caps.length > 1 ? caps.at(-1)[0] : "") : ""; };

// Every entry that can carry links: the texts and the gallery curiosities.
const sources = () => [
  ...BIOGRAPHIES.map((b) => ({ hash: "#biographies/" + b.id, links: b.links || [] })),
  ...STORIES.map((s) => ({ hash: "#stories/" + s.id, links: s.links || [] })),
  ...labs.filter((l) => l.custom && l.links).map((l) => ({ hash: "#gallery/" + l.id, links: l.links })),
  ...PEOPLE.map(p=>({hash:historyRoute('people',p.id),links:historyLinks('people',p)})),
  ...ADVANCES.map(p=>({hash:historyRoute('advances',p.id),links:historyLinks('advances',p)})),
];
// Addresses that point at `hash`.
export const relatedTo = (hash) => sources().filter((s) => s.links.includes(hash)).map((s) => s.hash);

// Kind and title of a site address, or null when it names nothing (tests use this to catch broken links).
export function describe(hash) {
  const [page, id, detail] = hash.replace(/^#/, "").split("/");
  if(page==='history'){const x=historyRecord(id,detail);return x&&{kind:['Chronologie','Timeline'],title:x.title||[x.name,x.name]};}
  if(page==='chapter'){const c=discoveryChapters.find(x=>x.id===id);return c&&{kind:['Chapitre','Chapter'],title:c.title};}
  if (page === "biographies") { const b = BIOGRAPHIES.find((x) => x.id === id); return b && { kind: ["Biographie", "Biography"], title: [b.name, b.name] }; }
  if (page === "stories") { const s = STORIES.find((x) => x.id === id); return s && { kind: s.kind==='lesson'?["Lecture mathématique", "Mathematical reading"]:["Histoire", "Story"], title: s.title }; }
  if (page === "challenges") { const c = challenges.find((x) => x.id === id); return c && { kind: ["Défi", "Challenge"], title: c.title }; }
  if (page === "gallery") { const l = labs.find((x) => x.custom && x.id === id); return l && { kind: ["Curiosité", "Curiosity"], title: l.title }; }
  if (page === "lab") { const l = labs.find((x) => !x.custom && x.id === id); return l && { kind: ["Laboratoire", "Laboratory"], title: l.title }; }
  return null;
}

// The "À lire aussi" box of a page: its own links first, then the pages that link to it.
export function readAlso(hash, own, t) {
  const seen = new Set([hash]), items = [];
  for (const h of [...(own || []), ...relatedTo(hash)]) { const d = !seen.has(h) && describe(h); seen.add(h); if (d) items.push([h, d]); }
  if (!items.length) return "";
  return `<section class="read-also" aria-labelledby="read-also-title"><h2 id="read-also-title">${t(["À lire, à essayer", "Read and try next"])}</h2><ul>${items.map(([h, d]) => `<li><a href="${h}"><span class="read-kind">${t(d.kind)}</span><span>${esc(t(d.title))}</span></a></li>`).join("")}</ul></section>`;
}

const sourcesList = (list, t) => `<section class="read-sources"><h2>${t(["Sources", "Sources"])}</h2><ul>${list.map(([url, label]) => `<li><a href="${url}" target="_blank" rel="noopener noreferrer">${esc(t(label))} <span class="sr-only">${t(["(nouvel onglet)", "(new tab)"])}</span></a></li>`).join("")}</ul></section>`;
const body = (sections, t) => sections.map(([h, ps]) => `<section><h2>${t(h)}</h2>${ps.map((p) => `<p>${esc(t(p))}</p>`).join("")}</section>`).join("");
const plate = (name) => `<span class="read-plate" aria-hidden="true">${esc(initials(name))}</span>`;

function biographyIndex(t) {
  return `<main id="main" class="page read-page" tabindex="-1"><div class="page-heading"><div><h1>${t(["Biographies", "Biographies"])}</h1><p>${t(["Des vies de mathématiciens, les idées qu’ils ont laissées et les pages du site où les manipuler.", "Lives of mathematicians, the ideas they left, and the pages of the site where you can handle them."])}</p></div></div>
  <div class="read-grid">${BIOGRAPHIES.map((b) => `<a class="read-card" href="#biographies/${b.id}">${plate(b.name)}<span class="read-card-body"><strong>${esc(b.name)}</strong><span class="read-dates">${b.dates} · ${esc(t(b.places))}</span><span>${esc(t(b.dek))}</span></span></a>`).join("")}</div></main>`;
}
function biographyPage(b, t) {
  const hash = "#biographies/" + b.id;
  return `<main id="main" class="page read-page" tabindex="-1"><a class="backlink" href="#biographies">${t(["Toutes les biographies", "All biographies"])}</a>
  <article class="read-article"><header class="read-header">${plate(b.name)}<div><span class="section-kicker">${t(["Biographie", "Biography"])} · ${b.dates}</span><h1>${esc(b.name)}</h1><p class="read-dek">${esc(t(b.dek))}</p></div></header>
  <div class="read-columns"><div class="read-text">${body(b.sections, t)}</div>
  <aside class="read-timeline" aria-label="${t(["Repères", "Milestones"])}"><h2>${t(["Repères", "Milestones"])}</h2><ol>${b.facts.map(([y, f]) => `<li><span class="read-year">${y}</span><span>${esc(t(f))}</span></li>`).join("")}</ol></aside></div>
  ${readAlso(hash, b.links, t)}${sourcesList(b.sources, t)}</article></main>`;
}
function storyIndex(t) {
  return `<main id="main" class="page read-page" tabindex="-1"><div class="page-heading"><div><h1>${t(["Histoires et lectures", "Stories and readings"])}</h1><p>${t(["Des anecdotes dont on examine les sources, et des lectures pour comprendre les expériences.", "Stories whose sources are examined, and readings that explain the experiments."])}</p></div></div>
  <div class="read-grid">${STORIES.map((s) => { const who = BIOGRAPHIES.find((b) => b.id === s.who), person = who ? who.name : s.figure || ""; return `<a class="read-card" href="#stories/${s.id}">${plate(person)}<span class="read-card-body"><strong>${esc(t(s.title))}</strong>${person ? `<span class="read-dates">${esc(person)}</span>` : ""}<span>${esc(t(s.dek))}</span></span></a>`; }).join("")}</div></main>`;
}
function storyPage(s, t) {
  const hash = "#stories/" + s.id, who = BIOGRAPHIES.find((b) => b.id === s.who);
  return `<main id="main" class="page read-page" tabindex="-1"><a class="backlink" href="#stories">${t(["Toutes les histoires", "All stories"])}</a>
  <article class="read-article"><header class="read-header">${plate(who ? who.name : s.figure || "")}<div><span class="section-kicker">${t(s.kind==='lesson'?["Lecture mathématique", "Mathematical reading"]:["Histoire", "Story"])}${who ? ` · <a href="#biographies/${who.id}">${esc(who.name)}</a>` : s.figure ? ` · ${esc(s.figure)}` : ""}</span><h1>${esc(t(s.title))}</h1><p class="read-dek">${esc(t(s.dek))}</p></div></header>
  <div class="read-text read-story">${body(s.sections, t)}</div>
  ${readAlso(hash, s.links, t)}${sourcesList(s.sources, t)}</article></main>`;
}

export const isReading = (page, id) => (page === "biographies" && (!id || BIOGRAPHIES.some((b) => b.id === id))) || (page === "stories" && (!id || STORIES.some((s) => s.id === id)));
export function readingPage(page, id, t) {
  if (page === "biographies") { const b = BIOGRAPHIES.find((x) => x.id === id); return b ? biographyPage(b, t) : biographyIndex(t); }
  const s = STORIES.find((x) => x.id === id); return s ? storyPage(s, t) : storyIndex(t);
}
