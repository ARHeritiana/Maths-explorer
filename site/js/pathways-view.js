// Pathways page (#pathways): a curriculum rail, a level selector, topic filters and a tile grid, so that a long
// curriculum is browsed one level or one topic at a time instead of being listed in one go.
// Data: content.js `pathways` (unchanged). Markup is built here, state lives in the closure of bindPathways.

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// One entry per browsable curriculum: a flat pathway (MG, FR) or one programme of a pathway with programmes (IB, SAT, university).
export function curriculumEntries(pathways) {
  return pathways.flatMap((p) =>
    p.programmes
      ? p.programmes.map((x) => ({ key: p.id + "/" + x.id, family: p, ...x }))
      : [{ key: p.id, family: p, ...p }],
  );
}

const topicOf = (lab) => (lab.group ? lab.group : ["Autres", "Other"]);

export function pathwayPage({ pathways, labs, t, pair, icon }) {
  const entries = curriculumEntries(pathways);
  const families = pathways.map((p) => {
    const items = entries.filter((e) => e.family === p);
    return `<div class="pw-family"><p class="pw-family-name">${p.icon ? icon(p.icon, 18) : ""}${esc(t(p.name))}</p><ul>${items
      .map(
        (e) =>
          `<li><button type="button" class="pw-pick" data-key="${esc(e.key)}" aria-pressed="false">${esc(t(items.length > 1 ? e.name : p.name))}</button></li>`,
      )
      .join("")}</ul></div>`;
  });
  return `<main id="main" class="page pw-page" tabindex="-1">
<div class="pw-head"><h1>${pair("Le programme français, par niveau.", "The French curriculum, by level.")}</h1><p class="page-intro">${pair("Choisis ton niveau ou un thème. Chaque expérience précise ses prérequis.", "Pick a level or a topic. Each experiment lists its prerequisites.")}</p></div>
<div class="pw-layout"><nav class="pw-rail" aria-label="${pair("Programmes", "Curricula")}">${families.join("")}</nav><section class="pw-panel" id="pw-panel" aria-live="polite"></section></div>
<details class="curriculum-note"><summary><h2>${pair("À propos de ces repères", "About these pathways")}</h2></summary><p>${pair("Ce laboratoire est une sélection d’explorations, pas un programme exhaustif ni une certification d’alignement. Les placements sont pédagogiques et indicatifs ; vérifie la série, l’option et l’année avec ton enseignant. Les références ont été consultées en octobre 2026.", "This laboratory is a selection of explorations, not a complete syllabus or a certification of alignment. Placements are pedagogical suggestions; check your stream, option and year with your teacher. References were consulted in October 2026.")}</p><p>${pair("France : nouveaux programmes de seconde et première en 2026–2027, de terminale en 2027–2028.", "France: new seconde and première programmes in 2026–2027, terminale in 2027–2028.")}</p><p>${pair("Les repères historiques renvoient aux notices du MacTutor History of Mathematics Archive de l’université de St Andrews. Le laboratoire conserve la langue et les réponses réussies dans ce navigateur ; les notes restent en mémoire pendant la session. Il n’envoie ni réponses ni notes et n’intègre aucun outil d’analyse. Ouvrir une source externe te conduit sur un autre site ; l’hébergeur gère l’accès privé.", "History boxes link to the University of St Andrews MacTutor History of Mathematics Archive. The laboratory keeps language and completed answers in this browser; notes stay in session memory. It sends no answers or notes and includes no analytics. Opening an external source takes you to another website; the host manages private access.")}</p></details></main>`;
}

export function bindPathways({ root, pathways, labs, t, pair, link, glyph, completed }) {
  const entries = curriculumEntries(pathways);
  const panel = root.querySelector("#pw-panel");
  const labOf = (id) => labs.find((l) => l.id === id);
  let key = entries[0].key, level = 0, topic = "all";
  const firstLevel = (e) => (e.stages.length > 1 ? 0 : "all");
  try { const saved = sessionStorage.getItem("mx-pathway"); if (saved && entries.some((e) => e.key === saved)) key = saved; } catch { /* storage may be blocked */ }

  const tile = (id) => {
    const l = labOf(id);
    const done = completed.has(id);
    return `<a class="pw-tile${done ? " is-done" : ""}" href="${link("lab", id)}"><span class="pw-glyph" aria-hidden="true">${glyph(l.symbol)}</span><span class="pw-tile-title">${esc(t(l.short))}</span><span class="pw-tile-topic">${esc(t(topicOf(l)))}</span>${done ? `<span class="pw-done"><span aria-hidden="true">✓</span><span class="sr-only">${pair("terminé", "completed")}</span></span>` : ""}</a>`;
  };

  function render() {
    const e = entries.find((x) => x.key === key);
    // Topics present in this curriculum, in order of first appearance, with their experiment count.
    const topics = [];
    for (const s of e.stages) for (const id of s.ids) {
      const name = t(topicOf(labOf(id)));
      if (!topics.includes(name)) topics.push(name);
    }
    if (topic !== "all" && !topics.includes(topic)) topic = "all";
    if (level !== "all" && !e.stages[level]) level = "all";
    const keep = (id) => topic === "all" || t(topicOf(labOf(id))) === topic;
    const shown = e.stages.map((s, i) => ({ s, i, ids: s.ids.filter(keep) })).filter((x) => (level === "all" || x.i === level) && (x.ids.length || (topic === "all" && !x.s.ids.length)));
    const total = new Set(e.stages.flatMap((s) => s.ids)).size;
    const levelTabs = e.stages.length > 1
      ? `<div class="pw-levels" role="group" aria-label="${pair("Niveau", "Level")}"><button type="button" class="pw-level" data-level="all" aria-pressed="${level === "all"}">${pair("Tous les niveaux", "All levels")}</button>${e.stages
          .map((s, i) => `<button type="button" class="pw-level" data-level="${i}" aria-pressed="${level === i}">${esc(t(s.name))}</button>`)
          .join("")}</div>`
      : "";
    const topicChips = topics.length > 1
      ? `<div class="pw-topics" role="group" aria-label="${pair("Thème", "Topic")}"><span class="pw-label">${pair("Thème", "Topic")}</span><button type="button" class="filter" data-topic="all" aria-pressed="${topic === "all"}">${pair("Tous", "All")}</button>${topics
          .map((n) => `<button type="button" class="filter" data-topic="${esc(n)}" aria-pressed="${topic === n}">${esc(n)}</button>`)
          .join("")}</div>`
      : "";
    const body = shown.length
      ? shown
          .map(({ s, ids }) => `<div class="pw-stage">${e.stages.length > 1 && level === "all" ? `<h3>${esc(t(s.name))}</h3>` : ""}${s.note ? `<p class="pw-note">${esc(t(s.note))}</p>` : ""}${ids.length ? `<div class="pw-grid">${ids.map(tile).join("")}</div>` : ""}</div>`)
          .join("")
      : `<p class="pw-empty">${pair("Aucune exploration pour ce niveau et ce thème. Essaie « Tous les niveaux » ou « Tous » les thèmes.", "No exploration for this level and topic. Try “All levels” or “All” topics.")}</p>`;
    const resources = (e.resources || []).map((r) => `<a class="btn btn-secondary" href="${r.href}">${esc(t(r.title))}</a>`).join("");
    const source = e.source ? `<a class="source-link" href="${e.source}" target="_blank" rel="noopener noreferrer">${esc(t(e.sourceName))} <span class="sr-only">${pair("(nouvel onglet)", "(new tab)")}</span></a>` : "";
    panel.innerHTML = `<header class="pw-title"><h2>${esc(t(e.name))}</h2>${total ? `<span class="pw-count">${total} ${pair(total > 1 ? "explorations" : "exploration", total > 1 ? "explorations" : "exploration")}</span>` : ""}</header>
<details class="pw-intro"><summary>${pair("À propos de ce programme", "About this curriculum")}</summary><p>${esc(t(e.intro))}</p></details>
${levelTabs}${topicChips}<div class="pw-body">${body}</div><div class="pw-foot">${resources}${source}</div>`;
    root.querySelectorAll(".pw-pick").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.key === key)));
  }

  const onClick = (ev) => {
    const pick = ev.target.closest(".pw-pick"), lv = ev.target.closest(".pw-level"), tp = ev.target.closest("[data-topic]");
    if (pick) { key = pick.dataset.key; level = firstLevel(entries.find((x) => x.key === key)); topic = "all"; try { sessionStorage.setItem("mx-pathway", key); } catch { /* ignore */ } }
    else if (lv) level = lv.dataset.level === "all" ? "all" : Number(lv.dataset.level);
    else if (tp) topic = tp.dataset.topic;
    else return;
    render();
    // Keep the focus on the control the visitor used.
    const sel = pick ? `.pw-pick[data-key="${CSS.escape(key)}"]` : lv ? `.pw-level[data-level="${lv.dataset.level}"]` : `[data-topic="${CSS.escape(tp.dataset.topic)}"]`;
    root.querySelector(sel)?.focus({ preventScroll: true });
  };
  root.addEventListener("click", onClick);
  render();
  return () => root.removeEventListener("click", onClick);
}
