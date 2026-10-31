import {galleryContext} from './gallery-context.js';
import {installControlPolicy} from "./control-policy.js";
import {preferredLanguage,routeLanguage} from "./content-language.js";
import {workshopMarkup,bindWorkshop} from './quadratic-workshop.js';
import { libraryPage, bindLibrary, chapterPage, bindChapter, relatedChapters, resourceCatalog } from "./resource-library.js";
import { packPage, bindPack, sourcesPage, bindSources } from "./pack-builder.js";
import { slidesPage, bindSlides } from "./slides-page.js";
import { universityPage, bindUniversity } from "./university.js";
import { observeSvgNavigation } from "./canvas-navigation.js";
import { labs, challenges, pathways } from "./content.js";
import { mountObject } from "./lab-objects.js";
import { homePage, bindHome, galleryPage as galleryIndex } from "./welcome.js";
import { isReading, readingPage, readAlso } from "./reading.js";
import { mountArt } from "./home-art.js";
import { mountHomeSlides } from "./home-slides.js";
import { mountLibrary } from "./library.js";
import { icon } from "./icons.js";
import { VARIANTS, HINT_ACTIONS, hasVariants, defaults as variantDefaults, randomParams, normalise as normaliseVariant, mountActivity, hasActivity, challengeIcon, originalOf, mountSolution, hasSolution } from "./challenges/registry.js";
import { fullscreenButton } from "./visual-lessons.js";
import { currentTheme, toggleTheme, installPresenting } from "./ui.js";
import { assetHref } from "./data-loader.js";
import { illuminateFeedback } from "./motion.js";
import { mountExperiment } from "./lab/mount.js";
import { resolveRef, labRef } from "./lab/registry.js";
import { indexPage as labIndexPage, experimentPage, bindLabIndex } from "./lab/page.js";
import { isAnswer, formatNumber } from "./math.js";
import {discoveryIndex,discoveryPage,bindDiscovery,discoveryContext,isTopicRoute} from './discovery.js';
import {historyPage,bindHistory,isHistoryRoute} from './history.js';

const $ = (s, root = document) => root.querySelector(s);
const esc = (x) =>
  String(x).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let storageWorks = true;
let saved = {};
try {
  saved = JSON.parse(localStorage.getItem("maths-explorer-v1") || "{}") || {};
} catch { storageWorks = false; }
if (!saved || typeof saved !== "object" || Array.isArray(saved)) saved = {};
let preferredLang = preferredLanguage(saved.lang);
let lang = preferredLang;
installControlPolicy(document.getElementById("app"));
const completed = new Set(
  Array.isArray(saved.completed)
    ? saved.completed.filter((id) =>
        [...labs, ...challenges].some((x) => x.id === id),
      )
    : [],
);
const chapterIds = new Set(resourceCatalog.chapters.map((c) => c.id));
const seen = new Set(Array.isArray(saved.seen) ? saved.seen.filter((id) => chapterIds.has(id)) : []);
let last = chapterIds.has(saved.last) ? saved.last : "";
const states = {};
let challengeFilter = "all";
let currentLab = "quadratic";
let stopChapter = () => {};
let stopObject = () => {};
let stopArt = [];
let homeSlides = null;
let stopLab = () => {};
let stopViews = [];
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
const reducedMotion = () => motionPreference.matches;
motionPreference.addEventListener?.("change", () => {
  if (reducedMotion()) document.getAnimations?.().forEach(animation => animation.cancel());
});
const t = (pair) => pair[lang === "fr" ? 0 : 1];
const fmt = (n, d = 3) => formatNumber(n, lang, d);
const pair = (fr, en) => t([fr, en]);
function save() {
  try {
    localStorage.setItem(
      "maths-explorer-v1",
      JSON.stringify({ lang:preferredLang, completed: [...completed], seen: [...seen], last }),
    );
  } catch {
    storageWorks = false;
  }
  if ($("footer")) $("footer").outerHTML = footer();
}
// What a gallery exhibit remembers while the visitor browses: the values of its controls and the answer to its question.
function state(lab) {
  return (states[lab.id] ??= { values: (lab.params || []).map((p) => p[4]), answer: "", result: null });
}
function route() {
  const parts = location.hash.slice(1).split("/");
  return { page: parts[0] || "home", id: parts[1], tab: parts[2] };
}
function link(page, id = "") {
  return "#" + page + (id ? "/" + id : "");
}
const brandMark = `<svg class="brandmark" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><rect width="40" height="40" rx="10" class="bm-bg"/><path d="M9 11Q20 43 31 11" class="bm-curve"/><circle cx="10" cy="20" r="3.2" class="bm-dot"/><circle cx="30" cy="20" r="3.2" class="bm-dot"/></svg>`;
// Three sections: "Apprendre" (courses, slides, pathways), "Explorer" (laboratory, challenges) and "Lire" (biographies,
// stories, and the curiosities of the gallery).
// The main bar names the sections; a row of tabs under it names the pages of the current section.
const SECTIONS = [
  ["learn", "Apprendre", "Learn", "books", [
    ["basics", "Bases", "Foundations", "books"],
    ["resources", "Cours", "Lessons", "books"],
    ["slides", "Diaporamas", "Slides", "presentation-chart"],
    ["pathways", "Parcours", "Pathways", "path"],
  ]],
  ["explore", "Explorer", "Explore", "flask", [
    ["topics", "Domaines", "Topics", "magnifying-glass"],
    ["lab", "Laboratoire", "Laboratory", "flask"],
    ["challenges", "Défis", "Challenges", "puzzle-piece"],
  ]],
  ["read", "Lire", "Read", "book-open", [
    ["history", "Chronologies", "Timelines", "scroll"],
    ["biographies", "Biographies", "Biographies", "user"],
    ["stories", "Histoires", "Stories", "scroll"],
    ["gallery", "Curiosités", "Curiosities", "sparkle"],
  ]],
];
// pages reached from a tab count as that tab
const TAB_OF = { chapter: "resources", library: "resources", workshop: "resources", pack: "resources", sources: "resources", university: "pathways" };
function header(page) {
  const tab = TAB_OF[page] || page;
  const section = SECTIONS.find(([, , , , tabs]) => tabs.some(([id]) => id === tab));
  const dark = currentTheme() === "nuit";
  const themeLabel = dark ? pair("Passer au thème clair", "Switch to light theme") : pair("Passer au thème sombre", "Switch to dark theme");
  const sectionLinks = SECTIONS.map(([id, fr, en, ic, tabs]) =>
    `<a href="#${tabs[0][0]}" data-section="${id}" ${section?.[0] === id ? 'aria-current="true"' : ""}>${icon(ic, 20)}<span>${pair(fr, en)}</span></a>`).join("");
  const subnav = section ? `<nav class="subnav" aria-label="${pair(section[1], section[2])}"><div class="subnav-inner">${section[4].map(([id, fr, en, ic]) =>
    `<a href="#${id}" ${tab === id ? 'aria-current="page"' : ""}>${icon(ic, 18)}<span>${pair(fr, en)}</span></a>`).join("")}</div></nav>` : "";
  return `<header class="topbar"><a class="brand" href="#home" aria-label="Maths Explorer">${brandMark}<span class="brand-name">Maths Explorer</span></a><button class="nav-toggle" aria-expanded="false" aria-controls="primary-nav">${pair("Menu","Menu")}</button><nav id="primary-nav" class="mainnav" aria-label="${pair("Navigation principale", "Main navigation")}">${sectionLinks}</nav><div class="tools"><button class="icon-btn" data-theme-toggle aria-label="${themeLabel}" title="${themeLabel}">${icon(dark ? "sun" : "moon", 22)}</button><div class="language" ${(["chapter","university","workshop"].includes(route().page)||(route().page==="library"&&route().id))?"hidden":""} role="group" aria-label="${pair("Langue", "Language")}"><button data-lang="fr" aria-pressed="${lang === "fr"}" lang="fr">FR</button><button data-lang="en" aria-pressed="${lang === "en"}" lang="en">EN</button></div></div></header>${subnav}`;
}
function footer() {
  return `<footer><span class="foot-brand">Maths Explorer</span><span>${storageWorks ? pair("Progression enregistrée sur cet appareil.", "Progress saved on this device.") : pair("Stockage indisponible : progression conservée pour cette session.", "Storage unavailable: progress kept for this session.")}</span><nav class="foot-links" aria-label="${pair("Autres pages", "More pages")}"><a href="#pack">${pair("Dossier sur mesure", "Custom pack")}</a><a href="#sources">${pair("Sources LaTeX", "LaTeX sources")}</a><a href="#pathways">${pair("Programmes & sources", "Curricula & sources")}</a><a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.${lang}" rel="license noopener" target="_blank">${pair("Licence CC BY-NC-SA 4.0", "CC BY-NC-SA 4.0 licence")}</a></nav></footer>`;
}
function render() {
  stopViews.forEach(stop=>stop()); stopViews=[];
  stopLab();
  stopLab = () => {};
  stopChapter();
  stopChapter = () => {};
  stopObject();
  stopArt.forEach((f) => f());
  stopArt = [];
  homeSlides?.destroy(); homeSlides = null;
  stopObject = () => {};
  let r = route();
  lang=routeLanguage(r,resourceCatalog.chapters,preferredLang);
  // the curiosities live in the gallery, whatever link points at them
  if (r.page === "lab" && labs.some((l) => l.id === r.id && l.custom)) { history.replaceState(null, "", link("gallery", r.id)); r = route(); }
  document.documentElement.lang = lang;
  document.title = pair(
    "Maths Explorer · Laboratoire de mathématiques",
    "Maths Explorer · Mathematics laboratory",
  );
  const experiment = r.page === "lab" && r.id ? (resolveRef(labRef(r.id, r.tab)) || resolveRef(r.id))?.experiment || null : null;
  const discovery=discoveryIndex({labs,challenges,chapters:resourceCatalog.chapters});
  const valid = (r.page === "lab" && (!r.id || !!experiment)) || (r.page === "gallery" && (!r.id || labs.some(l => l.id === r.id && l.custom))) ||
    (r.page === 'history' && isHistoryRoute(r.id,r.tab)) ||
    (r.page === 'topics' && isTopicRoute(r.id,r.tab)) ||
    (r.page === "challenges" && (!r.id || challenges.some(c => c.id === r.id))) ||
    (r.page === "home" && !r.id) || (r.page === "basics" && (!r.id || r.id === "place-value" || r.id === "addition" || r.id === "subtraction" || r.id === "multiplication" || r.id === "division")) || isReading(r.page, r.id) || (r.page === "pathways" && !r.id) || r.page === "library" || r.page === "pack" || r.page === "sources" || r.page === "slides" ||
    r.page === "university" || (r.page === "resources" && !r.id) || (r.page === "workshop" && r.id === "quadratic") ||
    (r.page === "chapter" && resourceCatalog.chapters.some(c => c.id === r.id));
  const page = valid ? r.page : "missing";
  $("#app").innerHTML =
    header(page) +
    (page === "basics" ? basicsPage(r.id) : page === "home" ? homePage({ pair, t, link, index:discovery, last }) : page === "workshop" ? workshopMarkup(t) : page === "pack" ? packPage(t, r.id) : page === "sources" ? sourcesPage(t) : page === "slides" ? slidesPage(t) : page === "resources" ? libraryPage(t, { challenges, completed, seen, last, labs })
      : page === "university" ? universityPage(lang)
      : page === "topics" ? discoveryPage(discovery,r.id,r.tab,t)
      : page === "history" ? historyPage(r.id,r.tab,t,discovery)
      : page === "chapter" ? chapterPage(r.id, r.tab, t, labs)
      : page === "lab"
      ? (experiment ? experimentPage(experiment, { t, pair, link, completed, mission: r.tab || "" }) : labIndexPage({ t, pair, link, completed }))
      : page === "gallery"
      ? (r.id ? galleryDetail(r.id) : galleryIndex({ pair, t, link, labs }))
      : page === "biographies" || page === "stories"
      ? readingPage(page, r.id, t)
      : page === "challenges"
        ? challengePage(r.id)
        : page === "library"
          ? `<main id="main" tabindex="-1" class="library-page"></main>`
        : page === "pathways"
          ? pathwayPage()
          : `<main id="main" tabindex="-1" class="page"><h1>${pair("Page introuvable", "Page not found")}</h1><a href="#lab">${pair("Ouvrir le laboratoire", "Open the laboratory")}</a></main>`) +
    footer();
  if(r.id && page!=='topics') {
    const context=discoveryContext(discovery,`#${page}/${r.id}${page==='history'&&r.tab?'/'+r.tab:''}`,t);
    if(context) $('#main')?.insertAdjacentHTML('beforeend',context);
  }
  if (experiment) {
    // The mission is part of the address (#lab/<experiment>/<mission>); replaceState keeps the history clean.
    stopLab = mountExperiment($("#lab2-host"), labRef(experiment.id, r.tab), {
      mode: "full", lang,
      onMission: (id, mission) => { const hash = link("lab", id) + "/" + mission; if (location.hash !== hash) history.replaceState(null, "", hash); },
      onComplete: (id) => { completed.add(id); save(); },
    }).destroy;
  }
  if (page === "home") homeSlides = mountHomeSlides($("#main"), { lang, reduced: reducedMotion() });
  if (page === "home" || (page === "gallery" && !r.id)) stopArt = [...document.querySelectorAll("canvas[data-art]")].map((cv) => mountArt(cv, cv.dataset.art, { reduced: reducedMotion }));
  if (page === "gallery" && $("#object-stage")) stopObject = mountObject($("#object-stage").dataset.object, $("#object-stage"), { lang, reduced: reducedMotion, initialValues: state(labs.find(x=>x.id===currentLab)).values, onChange: values => { state(labs.find(x=>x.id===currentLab)).values = values; } });
  $(".skip").textContent = pair("Aller au contenu", "Skip to content");
  bindCommon();
  if (page === "gallery" && r.id) bindGallery();
  if (page === "lab" && !experiment) bindLabIndex($("#main"), pair);
  if (page === "challenges") stopChapter = bindChallenges();
  if (page === "home") stopChapter = bindHome($("#main"),discovery,t);
  if (page === "basics" && r.id) stopChapter = bindBasics();
  if (page === "resources") stopChapter = bindLibrary(t, { fmt });
  if (page === "pack") bindPack(t);
  if (page === "sources") bindSources(t);
  if (page === "slides") bindSlides(t);
  if (page === "university") bindUniversity(r.id, lang);
  if (page === "chapter") {
    stopChapter = bindChapter(r.id, t, fmt);
    if (last !== r.id || !seen.has(r.id)) {
      last = r.id;
      seen.add(r.id);
      save();
    }
  }
  if (page === "workshop") stopChapter = bindWorkshop($("#main"),t,lang);
  if (page === 'topics') stopChapter = bindDiscovery($('#main'),discovery,r.id,r.tab,t);
  if (page === 'history') stopChapter = bindHistory($('#main'),r.id,t,discovery);
  stopViews.push(observeSvgNavigation($("#main"), "svg.act-svg, #quadratic-graph svg",lang));
  if (page === "library") mountLibrary($("#main"), {lang,id:r.id});
  installPresenting();
}
function bindCommon() {
 const navButton=$(".nav-toggle"), nav=$("#primary-nav");
 const closeMenu=()=>{navButton.setAttribute("aria-expanded","false");nav.classList.remove("is-open");};
 navButton.addEventListener("click",()=>{const open=navButton.getAttribute("aria-expanded")!=="true";navButton.setAttribute("aria-expanded",String(open));nav.classList.toggle("is-open",open);});
 $(".topbar").addEventListener("keydown",e=>{if(e.key==="Escape"&&navButton.getAttribute("aria-expanded")==="true"){closeMenu();navButton.focus();}});

  $("[data-theme-toggle]")?.addEventListener("click", () => {
    toggleTheme();
    homeSlides?.retheme();
    const dark = currentTheme() === "nuit";
    const label = dark ? pair("Passer au thème clair", "Switch to light theme") : pair("Passer au thème sombre", "Switch to dark theme");
    const button = $("[data-theme-toggle]");
    button.setAttribute("aria-label", label);
    button.title = label;
    button.innerHTML = icon(dark ? "sun" : "moon", 22);
  });
  document.querySelectorAll("[data-lang]").forEach((b) =>
    b.addEventListener("click", () => {
      preferredLang = b.dataset.lang;
      lang = preferredLang;
      save();
      render();
      const selected = $(`[data-lang="${lang}"]`);
      (selected?.offsetParent ? selected : $(".nav-toggle"))?.focus();
    }),
  );
}
// The gallery page of one exhibit: the exhibit itself (lab-objects.js), what to try, a question, the history box and the
// reading paths. The guided experiments of the laboratory are in lab/ (mountExperiment); nothing here draws a chart.
function galleryDetail(id) {
  const pool = labs.filter((x) => x.custom), lab = pool.find((x) => x.id === id) || pool[0];
  currentLab = lab.id;
  const s = state(lab);
  return `<div class="lab-layout"><aside class="sidebar" aria-label="${pair("Galerie", "Gallery")}"><label class="mobile-lab-picker" for="lab-picker">${pair("Choisir une merveille", "Choose a wonder")}<select id="lab-picker">${pool.map(x => `<option value="${x.id}" ${x.id === lab.id ? "selected" : ""}>${t(x.short)}</option>`).join("")}</select></label><div class="side-title">${pair("La galerie", "The gallery")} <span>${String(pool.length).padStart(2, "0")}</span></div><div class="lab-links">${pool.map((x, i) => `${i === 0 || t(x.group) !== t(pool[i - 1].group) ? `<p class="group-label">${t(x.group)}</p>` : ""}<a href="${link("gallery", x.id)}" class="lab-link ${x.id === lab.id ? "selected" : ""}" ${x.id === lab.id ? 'aria-current="page"' : ""}><span class="lab-symbol" aria-hidden="true">${glyph(x.symbol)}</span><span>${t(x.short)}</span>${completed.has(x.id) ? '<span class="check" aria-label="' + pair("Question réussie", "Check completed") + '">✓</span>' : ""}</a>`).join("")}</div><div class="side-note"><span aria-hidden="true">✧</span><p>${pair("Une question est un bon point de départ.", "A question is a good place to start.")}</p></div></aside>
 <main id="main" class="lab-main" tabindex="-1"><div class="breadcrumb">${pair("La galerie", "The gallery")}<span>/</span>${t(lab.group)}</div><div class="lab-heading"><div><h1>${t(lab.title)}</h1><p>${t(lab.intro)}</p></div><span class="level">${t(lab.level)}</span></div>
 <div class="workbench"><section class="experiment" data-fs-target aria-label="${pair("Expérience interactive", "Interactive experiment")}"><div class="experiment-top"><span class="eyebrow">${pair("À toi d’expérimenter", "Your turn to experiment")}</span><span class="experiment-actions">${fullscreenButton(pair)}<button id="reset" class="text-button">${pair("Réinitialiser", "Reset")}</button></span></div>${relatedChapters(lab.id, t)}<div id="object-stage" class="object-stage" data-object="${lab.id}"></div></section>
 <aside class="learning"><div class="learning-label"><span aria-hidden="true">◷</span> ${pair("Temps d’apprentissage", "Learning time")} <span>${lab.duration} min</span></div><h2>${pair("De l’intuition à l’idée", "From intuition to insight")}</h2><p class="prereq"><strong>${pair("Avant de commencer", "Before you begin")}</strong><br>${t(lab.prereq)}</p><p class="muted">${pair("Les mesures affichées sont arrondies. Des essais suggèrent une conjecture ; un argument général établit une preuve.", "Displayed measurements are rounded. Examples suggest a conjecture; a general argument establishes a proof.")}</p><ol class="steps">${lab.steps.map((x) => `<li>${t(x)}</li>`).join("")}</ol><div class="reasoning"><details><summary>${pair("Comparer avec un argument", "Compare with an argument")}</summary><p><strong>${pair("Conjecture", "Conjecture")}</strong> ${t(lab.reasoning.conjecture)}</p><p><strong>${pair("Justification", "Justification")}</strong> ${t(lab.reasoning.proof)}</p><p>${t(lab.reasoning.transfer)}</p></details></div><div class="checkpoint"><span class="eyebrow">${pair("Le petit déclic", "Check your understanding")}</span>${Object.keys(lab.quizState || {}).length ? `<button id="quiz-preset" class="secondary">${pair("Régler l’expérience pour cette question", "Set the experiment for this question")}</button>` : ""}<form id="lab-quiz"><label for="quiz-answer">${t(lab.quiz)}</label><div class="answer-row"><input id="quiz-answer" name="answer" type="text" inputmode="text" autocomplete="off" placeholder="${pair("Ta réponse", "Your answer")}" required value="${esc(s.answer)}"><button class="primary" type="submit">${pair("Vérifier", "Check")}</button></div></form><p id="quiz-feedback" class="feedback ${s.result === true ? "success" : ""}" role="status">${s.result === true ? pair("Bien vu ! ", "That’s right! ") + t(lab.explain) : s.result === false ? pair("Pas encore. Reprends l’expérience et essaie à nouveau.", "Not yet. Revisit the experiment and try again.") : ""}</p><details><summary>${pair("Comprendre la réponse", "Understand the answer")}</summary><p>${t(lab.explain)}</p></details></div></aside></div>
 <section class="history"><div class="history-icon" aria-hidden="true">H</div><div class="history-title"><span class="eyebrow">${pair("Repère historique", "History box")}</span><h2>${t(lab.history)}</h2></div><div><p>${t(lab.story)}</p><a href="${lab.source}" target="_blank" rel="noopener noreferrer">${lab.sourceLabel ? t(lab.sourceLabel) : lab.source.includes("mathshistory.st-andrews.ac.uk") ? pair("En savoir plus · MacTutor (anglais)", "Read more · MacTutor") : pair("Source et explications", "Source and explanation")} <span class="sr-only">${pair("(nouvel onglet)", "(new tab)")}</span></a></div></section>${galleryContext(lab.id, pair)}${readAlso(link("gallery", lab.id), lab.links, t)}</main></div>`;
}
// The vector symbol (combining arrow) is missing from the maths font: show a plain arrow.
const glyph = (symbol) => (symbol.includes("\u20d7") ? "→" : symbol);
function bindGallery() {
  const lab = labs.find((x) => x.id === currentLab), s = state(lab);
  $("#lab-picker")?.addEventListener("change", e => { location.hash = link("gallery", e.target.value); });
  $("#quiz-preset")?.addEventListener("click", () => {
    Object.assign(s, lab.quizState);
    render();
    $("#quiz-preset").focus();
  });
  $("#reset")?.addEventListener("click", () => {
    delete states[lab.id];
    state(lab);
    render();
    $("#reset").focus();
  });
  $("#quiz-answer")?.addEventListener("input", (e) => (s.answer = e.target.value));
  $("#lab-quiz")?.addEventListener("submit", (e) => {
    e.preventDefault();
    s.result = isAnswer(s.answer, lab.answer);
    if (s.result) {
      completed.add(lab.id);
      save();
      const active = $(".lab-link.selected");
      if (active && !$(".check", active)) active.insertAdjacentHTML("beforeend", `<span class="check" aria-label="${pair("Question réussie", "Check completed")}">✓</span>`);
    }
    $("#quiz-feedback").textContent = s.result
      ? pair("Bien vu ! ", "That’s right! ") + t(lab.explain)
      : pair(
          "Pas encore. Compare les valeurs et l’argument. Tu peux écrire une fraction, comme 1/3.",
          "Not yet. Compare the values and the argument. You can enter a fraction, such as 1/3.",
        );
    $("#quiz-feedback").classList.toggle("success", s.result);
    illuminateFeedback($("#quiz-feedback"), reducedMotion);
  });
}
function challengePage(id) {
  const c = challenges.find((x) => x.id === id);
  if (c) return challengeDetail(c);
  const filtered = challenges.filter(
    (x) => challengeFilter === "all" || x.type === challengeFilter,
  );
  return `<main id="main" class="page" tabindex="-1"><div class="page-heading"><div><h1>${pair("À chaque problème, une découverte.", "A discovery in every problem.")}</h1><p>${pair("Prends un crayon. Essaie une idée. Les indices sont là si tu en as besoin.", "Grab a pencil. Try an idea. Hints are here when you need them.")}</p></div><div class="progress-badge"><strong>${challenges.filter((x) => completed.has(x.id)).length} / ${challenges.length}</strong><span>${pair("réponses trouvées", "answers found")}</span></div></div><div class="filter-row" role="group" aria-label="${pair("Type de défi", "Challenge type")}">${[
    ["all", "Tous les défis", "All challenges"],
    ["play", "Maths récréatives", "Recreational maths"],
    ["olympiad", "Esprit olympiade", "Olympiad thinking"],
  ]
    .map(
      ([v, fr, en]) =>
        `<button class="filter" data-filter="${v}" aria-pressed="${challengeFilter === v}">${pair(fr, en)}</button>`,
    )
    .join(
      "",
    )}</div><div class="challenge-grid">${filtered.map((x, i) => `<a class="challenge-card" href="${link("challenges", x.id)}"><div class="card-top"><span class="tag ${x.type}">${x.type === "play" ? pair("Récréatif", "Recreational") : pair("Olympiade", "Olympiad")}</span><span class="card-number">${String(challenges.indexOf(x) + 1).padStart(2, "0")}</span></div><span class="challenge-motif" aria-hidden="true">${challengeIcon(x.id)}</span><h2>${t(x.title)}</h2><p>${t(x.topic)}</p><div class="card-bottom"><span>${"●".repeat(x.difficulty)}${"○".repeat(3 - x.difficulty)} <span class="sr-only">${pair("Difficulté", "Difficulty")} ${x.difficulty}/3</span></span><span>${completed.has(x.id) ? pair("✓ Réponse trouvée", "✓ Answer found") : x.minutes + " min"}</span></div></a>`).join("")}</div><p class="editorial-note">${pair("Problèmes classiques reformulés pour le laboratoire. « Esprit olympiade » désigne le type de raisonnement, pas une provenance officielle. Une réponse numérique ne remplace pas une preuve.", "Classic problems adapted for the laboratory. “Olympiad thinking” describes the reasoning style, not official contest provenance. A numerical answer does not replace a proof.")}</p></main>`;
}
// Parameters of the variation currently shown, per challenge (kept while the visitor browses; not stored).
const variantState = {};
const paramsOf = (id) => (variantState[id] ??= hasVariants(id) ? variantDefaults(id) : {});
// Hints that carry a button acting on the experiment (hintActions in each challenge folder): { hint index: [action, French label, English label] }.
// The activity listens for the "challenge-action" event, so the button can sit in the hint panel, away from the board.
const hintAction = (id, i) => { const a = HINT_ACTIONS[id]?.[i]; return a ? `<button class="btn btn-secondary hint-action" type="button" data-hint-act="${a[0]}"${a[3] ? ' aria-pressed="false"' : ""}>${pair(a[1], a[2])}</button>` : ""; };
const variantText = (c, q) => {
  const v = VARIANTS[c.id];
  return v ? { prompt: v.prompt(q), original: originalOf(c.id, q), answer: v.answer(q), solution: v.solution(q), hints: v.hints ? v.hints(q) : c.hints } : { prompt: c.prompt, original: null, answer: c.answer, solution: c.solution, hints: c.hints };
};
function variationPanel(c) {
  if (!hasVariants(c.id)) return "";
  const q = paramsOf(c.id);
  const controls = VARIANTS[c.id].params.map((prm) => prm.kind === "int"
    ? `<label class="var-field"><span class="var-label">${t(prm.label)} <output data-out="${prm.id}">${c.id === "konigsberg" && q[prm.id] === 0 ? pair("0 (Königsberg)", "0 (Königsberg)") : q[prm.id]}</output></span><input type="range" data-var="${prm.id}" min="${prm.min}" max="${prm.max}" step="${prm.step}" value="${q[prm.id]}"></label>`
    : `<div class="var-field"><label for="var-${prm.id}">${t(prm.label)}${prm.fields ? ' · ' + pair('Exemples facultatifs', 'Optional examples') : ''}</label><select id="var-${prm.id}" data-var="${prm.id}">${prm.fields ? `<option value="custom">${pair('Mes valeurs', 'My values')}</option>` : ''}${prm.options.map(([val, fr, en]) => `<option value="${val}" ${String(q[prm.id]) === String(val) ? 'selected' : ''}>${pair(fr, en)}</option>`).join('')}</select>${prm.fields ? `<div class="var-numbers">${prm.fields.map((field, i) => `<label>${t(field.label)}<input type="number" inputmode="numeric" min="${field.min}" max="${field.max}" step="1" required data-custom="${prm.id}" data-part="${i}" value="${String(q[prm.id]).split(',')[i]}"></label>`).join('')}</div><button class="secondary" type="button" data-apply="${prm.id}">${pair('Appliquer mes valeurs', 'Apply my values')}</button>` : ''}</div>`).join("");
  return `<details class="variation" aria-labelledby="variation-title"><summary id="variation-title">${pair("Modifier les données", "Change the data")}</summary><p class="muted">${pair("Choisis tes valeurs. Le problème, la solution et l’expérience suivront tes réglages.", "Choose your own values. The problem, solution and experiment will follow your settings.")}</p><div class="var-controls">${controls}</div><div class="variation-actions"><button class="text-button" id="var-random" type="button">${pair("Au hasard", "Surprise me")}</button><button class="text-button" id="var-reset" type="button">${pair("Valeurs d’origine", "Original values")}</button></div></details>`;
}
function challengeDetail(c) {
  const v = variantText(c, paramsOf(c.id));
  return `<main id="main" class="page challenge-detail" tabindex="-1"><a class="backlink" href="#challenges">${pair("Tous les défis", "All challenges")}</a><div class="challenge-columns"><article><span class="section-kicker">${t(c.topic)} · ${c.minutes} min</span><h1>${t(c.title)}</h1>${v.original ? `<span class="section-kicker check-kicker">${pair("Énoncé et version vérifiable ici", "Statement and the version checked here")}</span>` : ""}<p class="problem" id="problem">${t(v.prompt)}</p>${v.original ? `<section class="original" aria-labelledby="original-title"><span class="section-kicker" id="original-title">${pair("Question d’origine · à traiter seul ou avec un enseignant, le site ne peut pas la vérifier", "Original question · to work out alone or with a teacher, the site cannot check it")}</span><p class="problem original-q" id="original">${t(v.original)}</p></section>` : ""}${variationPanel(c)}${hasActivity(c.id) ? `<section class="activity" aria-labelledby="activity-title"><h2 id="activity-title">${pair("À toi d’explorer", "Explore it yourself")}</h2><div id="activity" data-activity="${c.id}"></div></section>` : ""}<form id="challenge-form" data-id="${c.id}"><label for="challenge-answer">${pair("Ta réponse numérique", "Your numerical answer")}</label><div class="answer-row"><input type="text" id="challenge-answer" inputmode="text" required autocomplete="off" placeholder="${pair("Nombre ou fraction", "Number or fraction")}"><button class="primary">${pair("Vérifier", "Check")}</button></div><p id="challenge-feedback" class="feedback" role="status">${completed.has(c.id) ? pair("Tu as déjà trouvé cette réponse. Essaie maintenant de rédiger la preuve.", "You have already found this answer. Now try writing the proof.") : ""}</p></form></article><aside class="hint-panel"><h2>${pair("Un coup de pouce ?", "A little nudge?")}</h2>${v.hints.map((h, i) => `<details><summary>${pair("Indice", "Hint")} ${i + 1}</summary><p data-hint="${i}">${t(h)}</p>${hintAction(c.id, i)}</details>`).join("")}</aside></div>${readAlso(link("challenges", c.id), [], t)}<section class="solution-wide"><details class="solution"><summary>${pair("Voir la solution expliquée", "See the worked solution")}</summary>${hasSolution(c.id) ? `<div id="solution-anim" class="sol-host" data-solution="${c.id}"></div>` : ""}<p id="solution-text">${t(v.solution)}</p><div class="extension"><strong>${pair("Pour aller plus loin", "Take it further")}</strong><p>${t(c.extension)}</p></div></details></section></main>`;
}
function bindChallenges() {
  const host = $("#activity"), solHost = $("#solution-anim"), form = $("#challenge-form"), cid = form?.dataset.id;
  let stopActivity = () => {}, sol = null;
  // (Re)mount the experiment and the animated solution for the parameters now chosen.
  function mountAll() {
    stopActivity(); sol?.stop();
    const q = cid ? paramsOf(cid) : {};
    stopActivity = host ? mountActivity(host.dataset.activity, host, { lang, reduced: reducedMotion, params: q }) : () => {};
    sol = solHost ? mountSolution(solHost.dataset.solution, solHost, { lang, reduced: reducedMotion, params: q }) : null;
    if (solHost) solHost.__solution = sol;   // handle for the browser tests (seek to any frame)
    if ($(".solution")?.open) sol?.start();
  }
  // The animated solution starts the first time the worked solution is opened and stops when it is closed.
  $(".solution")?.addEventListener("toggle", (e) => (e.target.open ? sol?.start() : sol?.stop()));
  document.querySelectorAll("[data-hint-act]").forEach((b) => b.addEventListener("click", () => document.dispatchEvent(new CustomEvent("challenge-action", { detail: { id: cid, act: b.dataset.hintAct } }))));
  mountAll();
  const stop = () => { stopActivity(); sol?.stop(); };
  if (cid && hasVariants(cid)) {
    const c = challenges.find((x) => x.id === cid);
    const refresh = () => {
      const q = paramsOf(cid), v = variantText(c, q);
      $("#problem").innerHTML = t(v.prompt);
      if ($("#original") && v.original) $("#original").innerHTML = t(v.original);
      document.querySelectorAll("[data-hint]").forEach((el) => { el.innerHTML = t(v.hints[+el.dataset.hint]); });
      $("#solution-text").innerHTML = t(v.solution);
      $("#challenge-feedback").textContent = ""; $("#challenge-feedback").classList.remove("success");
      $("#challenge-answer").value = "";
      mountAll();
    };
    const syncControls = () => {
      const q = paramsOf(cid);
      document.querySelectorAll("[data-var]").forEach((el) => {
        el.value = q[el.dataset.var]; if (el.tagName === 'SELECT' && el.selectedIndex < 0) el.value = 'custom';
        const o = $(`[data-out="${el.dataset.var}"]`); if (o) o.textContent = q[el.dataset.var];
      });
      document.querySelectorAll('[data-custom]').forEach((el) => { el.value = String(q[el.dataset.custom]).split(',')[Number(el.dataset.part)]; el.setCustomValidity(''); });
    };
    const read = () => { const q = {}; document.querySelectorAll("[data-var]").forEach((el) => { if (el.type !== "radio" || el.checked) q[el.dataset.var] = el.value; }); variantState[cid] = normaliseVariant(cid, q); };
    document.querySelectorAll("[data-var]").forEach((el) => {
      el.addEventListener("input", () => { const o = $(`[data-out="${el.dataset.var}"]`); if (o && el.type !== "radio") o.textContent = el.value; });
      el.addEventListener("change", () => { if (el.value === 'custom') { document.querySelector(`[data-custom="${el.dataset.var}"]`)?.focus(); return; } read(); syncControls(); refresh(); });
    });
    const applyCustom = (id) => {
      const prm = VARIANTS[cid].params.find((p) => p.id === id), fields = [...document.querySelectorAll(`[data-custom="${id}"]`)];
      fields.forEach((el) => el.setCustomValidity(''));
      const invalid = fields.find((el) => !el.checkValidity()); if (invalid) { invalid.reportValidity(); return; }
      const values = fields.map((el) => Number(el.value));
      if (prm.validate && !prm.validate(values)) { fields.at(-1).setCustomValidity(t(prm.error)); fields.at(-1).reportValidity(); return; }
      variantState[cid] = normaliseVariant(cid, { ...paramsOf(cid), [id]: values.join(',') }); syncControls(); refresh();
    };
    document.querySelectorAll('[data-apply]').forEach((el) => el.addEventListener('click', () => applyCustom(el.dataset.apply)));
    document.querySelectorAll('[data-custom]').forEach((el) => {
      el.addEventListener('input', () => { el.setCustomValidity(''); $(`[data-var="${el.dataset.custom}"]`).value = 'custom'; });
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); applyCustom(el.dataset.custom); } });
    });
    $("#var-random")?.addEventListener("click", () => { variantState[cid] = randomParams(cid); syncControls(); refresh(); $("#var-random").focus(); });
    $("#var-reset")?.addEventListener("click", () => { variantState[cid] = variantDefaults(cid); syncControls(); refresh(); $("#var-reset").focus(); });
  }
  document.querySelectorAll("[data-filter]").forEach((b) =>
    b.addEventListener("click", () => {
      challengeFilter = b.dataset.filter;
      render();
      $(`[data-filter="${challengeFilter}"]`).focus();
    }),
  );
  $("#challenge-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const c = challenges.find((x) => x.id === e.target.dataset.id),
      correct = isAnswer($("#challenge-answer").value, variantText(c, paramsOf(c.id)).answer);
    if (correct) {
      completed.add(c.id);
      save();
    }
    $("#challenge-feedback").textContent = correct
      ? pair(
          "C’est la bonne valeur. Maintenant, justifie-la : la solution t’aide à comparer ton raisonnement.",
          "That is the correct value. Now justify it: use the solution to compare your reasoning.",
        )
      : pair(
          "Pas encore. Essaie un cas plus simple ou ouvre le premier indice.",
          "Not yet. Try a simpler case or open the first hint.",
        );
    $("#challenge-feedback").classList.toggle("success", correct);
    illuminateFeedback($("#challenge-feedback"), reducedMotion);
  });
  return stop;
}
// Foundation lessons are deliberately distinct from official curriculum chapters.
const basicsLessons = [
  {id: "place-value", number: "01", title: ["Numération et regroupements", "Place value and grouping"],
   description: ["Construire les nombres avec des jetons, échanger les unités contre des dizaines et découvrir les bases.", "Build numbers with counters, group place values, and explore different bases."],
   frameTitle: ["Activité interactive sur la numération", "Interactive place-value activity"]},
  {id: "addition", number: "02", title: ["Addition et retenues", "Addition and carrying"],
   description: ["Additionner colonne par colonne, puis comprendre la retenue comme un regroupement, même dans d’autres bases.", "Add column by column and see how regrouping creates a carry in different bases."],
   frameTitle: ["Activité interactive sur l’addition et les retenues", "Interactive addition and carrying activity"]},
  {id: "subtraction", number: "03", title: ["Soustraction et emprunts", "Subtraction and borrowing"],
   description: ["Retirer des jetons colonne par colonne et comprendre les emprunts comme des dégroupements, même dans d’autres bases.", "Subtract counters column by column and understand borrowing as ungrouping in different bases."],
   frameTitle: ["Activité interactive sur la soustraction et les emprunts", "Interactive subtraction and borrowing activity"]},
  {id: "multiplication", number: "04", title: ["Multiplication par regroupements", "Multiplication as grouping"],
   description: ["Construire les produits avec des jetons, puis comprendre les produits partiels et les retenues.", "Use counters to understand partial products, place value, and carrying."],
   frameTitle: ["Activité interactive sur la multiplication", "Interactive multiplication activity"]},
  {id: "division", number: "05", title: ["Division par partage", "Division as sharing"],
   description: ["Partager les jetons équitablement, échanger les restes et découvrir le quotient et le reste.", "Share counters equally, trade leftovers, and discover the quotient and remainder."],
   frameTitle: ["Activité interactive sur le partage et la division", "Interactive division and sharing activity"]},
];
function basicsPage(id) {
  if (!id) return '<main id="main" class="page" tabindex="-1"><div class="section-kicker">'+pair("Apprendre", "Learn")+'</div><h1>'+pair("Les bases des mathématiques", "Mathematical foundations")+'</h1><p class="page-intro">'+pair("Pour comprendre les idées de départ en manipulant, avant de mémoriser les règles.", "Explore starting ideas with your hands before memorising rules.")+'</p><div class="pathway-grid" style="margin-top:24px">'+basicsLessons.map(l=>'<article class="pathway-card"><div class="section-kicker">'+l.number+' · '+pair("Nombres", "Numbers")+'</div><h2><a href="#basics/'+l.id+'">'+t(l.title)+'</a></h2><p>'+t(l.description)+'</p><a class="btn btn-primary" href="#basics/'+l.id+'">'+pair("Explorer la leçon", "Open the lesson")+'</a></article>').join("")+'</div></main>';
  const lesson = basicsLessons.find(l=>l.id===id);
  if (!lesson) return "";
  const related = id === "division"
    ? '<p class="muted"><a href="#basics/multiplication">'+pair("Leçon précédente : multiplication", "Previous lesson: multiplication")+'</a></p>'
    : id === "multiplication"
    ? '<p class="muted"><a href="#basics/subtraction">'+pair("Leçon précédente : soustraction", "Previous lesson: subtraction")+'</a> · <a href="#basics/division">'+pair("Leçon suivante : division", "Next lesson: division")+'</a></p>'
    : id === "subtraction"
    ? '<p class="muted"><a href="#basics/addition">'+pair("Revoir l’addition et les retenues", "Review addition and carrying")+'</a> · <a href="#basics/multiplication">'+pair("Leçon suivante : multiplication", "Next lesson: multiplication")+'</a></p>'
    : id === "addition"
      ? '<p class="muted"><a href="#basics/place-value">'+pair("Revoir d’abord les regroupements et la numération", "Review place value and grouping first")+'</a> · <a href="#basics/subtraction">'+pair("Leçon suivante : soustraction et emprunts", "Next lesson: subtraction and borrowing")+'</a></p>'
      : '<p class="muted"><a href="#basics/addition">'+pair("Leçon suivante : addition et retenues", "Next lesson: addition and carrying")+'</a></p>';
  return '<main id="main" class="page" tabindex="-1"><a class="backlink" href="#basics">'+pair("Toutes les bases", "All foundations")+'</a>'+related+'<iframe id="basics-frame" lang="'+lang+'" title="'+t(lesson.frameTitle)+'" src="'+assetHref("./resources/basics/"+lesson.id+(lang==="en"?".en":"")+".html")+'" style="width:100%;display:block;border:1px solid var(--line);border-radius:12px;background:var(--surface);min-height:560px" scrolling="no"></iframe></main>';
}
function bindBasics(){
  const frame=$("#basics-frame"); if(!frame)return ()=>{};
  let alive=true;
  const sync=()=>{try{const d=frame.contentDocument;if(!d)return;d.documentElement.dataset.theme=currentTheme()==="nuit"?"dark":"light";const h=d.documentElement.scrollHeight;if(h>0&&Math.abs(h-frame.getBoundingClientRect().height)>3)frame.style.height=h+"px";}catch{}};
  const message=e=>{if(e.origin!==location.origin||e.source!==frame.contentWindow||e.data?.type!=="mx-basics-size")return;if(alive&&Number.isFinite(e.data.height)&&e.data.height>0&&e.data.height<20000)frame.style.height=e.data.height+"px";};
  const load=()=>sync();frame.addEventListener("load",load);window.addEventListener("message",message);
  const obs=typeof MutationObserver==="undefined"?null:new MutationObserver(sync);obs?.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
  return ()=>{alive=false;window.removeEventListener("message",message);frame.removeEventListener("load",load);obs?.disconnect();};
}

// Stages (with their explorations) and the source link of a pathway or of one of its programmes.
function pathwayBlock(x, heading) {
  const stages = x.stages
    .map(
      (s) =>
        `<div class="stage"><${heading}>${t(s.name)}</${heading}>${s.note ? `<p class="muted">${t(s.note)}</p>` : ""}${s.ids.length ? `<ul>${s.ids
          .map((id) => {
            const l = labs.find((y) => y.id === id);
            return `<li><a href="${link("lab", id)}"><span aria-hidden="true">${glyph(l.symbol)}</span>${t(l.short)}${completed.has(id) ? '<span class="check">✓</span>' : ""}</a></li>`;
          })
          .join("")}</ul>` : ""}</div>`,
    )
    .join("");
  const resources = (x.resources || []).map(r => `<a class="btn btn-secondary" href="${r.href}">${t(r.title)}</a>`).join('');
  return `${stages}${resources}${x.source ? `<a class="source-link" href="${x.source}" target="_blank" rel="noopener noreferrer">${t(x.sourceName)} <span class="sr-only">${pair("(nouvel onglet)", "(new tab)")}</span></a>` : ''}`;
}
function pathwayPage() {
  return `<main id="main" class="page" tabindex="-1"><h1>${pair("Les mêmes idées, plusieurs parcours.", "Shared ideas, different pathways.")}</h1><p class="page-intro">${pair("Pars de ton programme ou suis simplement ta curiosité. Chaque expérience précise ses prérequis.", "Start with your curriculum or simply follow your curiosity. Each experiment lists its prerequisites.")}</p><div class="pathway-grid">${pathways.map((p) => `<section class="pathway-card${p.programmes ? " has-programmes" : ""}"><div class="pathway-label">${p.icon ? icon(p.icon, 28) : p.label}</div><h2>${t(p.name)}</h2><p>${t(p.intro)}</p>${p.programmes ? `<div class="programmes">${p.programmes.map((x) => `<details class="programme"><summary><h3 class="programme-title">${t(x.name)}</h3><p>${t(x.intro)}</p></summary>${pathwayBlock(x, "h4")}</details>`).join("")}</div>` : pathwayBlock(p, "h3")}</section>`).join("")}</div><details class="curriculum-note"><summary><h2>${pair("À propos de ces repères", "About these pathways")}</h2></summary><p>${pair("Ce laboratoire est une sélection d’explorations, pas un programme exhaustif ni une certification d’alignement. Les placements sont pédagogiques et indicatifs ; vérifie la série, l’option et l’année avec ton enseignant. Les références ont été consultées en octobre 2026.", "This laboratory is a selection of explorations, not a complete syllabus or a certification of alignment. Placements are pedagogical suggestions; check your stream, option and year with your teacher. References were consulted in October 2026.")}</p><p>${pair("France : nouveaux programmes de seconde et première en 2026–2027, de terminale en 2027–2028. IB : première mise en œuvre en août 2027, première évaluation en mai 2029. Madagascar : références S/OSE/L datées de 2024–2025 ; l’application actuelle reste à confirmer.", "France: new seconde and première programmes in 2026–2027, terminale in 2027–2028. IB: first teaching August 2027, first assessment May 2029. Madagascar: S/OSE/L references date from 2024–2025; current applicability needs confirmation.")}</p><p>${pair("Les repères historiques renvoient aux notices du MacTutor History of Mathematics Archive de l’université de St Andrews. Le laboratoire conserve la langue et les réponses réussies dans ce navigateur ; les notes restent en mémoire pendant la session. Il n’envoie ni réponses ni notes et n’intègre aucun outil d’analyse. Ouvrir une source externe te conduit sur un autre site ; l’hébergeur gère l’accès privé.", "History boxes link to the University of St Andrews MacTutor History of Mathematics Archive. The laboratory keeps language and completed answers in this browser; notes stay in session memory. It sends no answers or notes and includes no analytics. Opening an external source takes you to another website; the host manages private access.")}</p></details></main>`;
}

$(".skip").addEventListener("click", e => {
  e.preventDefault();
  $("#main")?.focus();
  $("#main")?.scrollIntoView({ block: "start" });
});
window.addEventListener("hashchange", () => {
  render();
  $("#main")?.focus({ preventScroll: true });
  window.scrollTo(0, 0);
});
render();

// Optional browser-standard agent access; ordinary browsers need no polyfill or service.
if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  const register = (tool) => {
    try {
      Promise.resolve(
        document.modelContext.registerTool(tool, { signal: lifecycle.signal }),
      ).catch(() => {});
    } catch {}
  };
  register({
    name: "list_math_experiments",
    description: "List the available mathematics experiments.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: () => labs.map((l) => ({ id: l.id, title: t(l.title) })),
  });
  register({
    name: "configure_math_experiment",
    description:
      "Open an experiment and optionally set its numeric sliders. This does not submit a learning answer.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", enum: labs.map((l) => l.id) },
        values: { type: "array", items: { type: "number" } },
      },
      required: ["id"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false },
    execute: (input) => {
      const l = labs.find((x) => x.id === input?.id);
      if (!l) throw new Error("Unknown experiment");
      if (input.values !== undefined) {
        if (
          !Array.isArray(input.values) ||
          input.values.length !== l.params.length ||
          input.values.some(
            (v, i) =>
              !Number.isFinite(v) ||
              v < l.params[i][1] ||
              v > l.params[i][2] ||
              Math.abs(
                (v - l.params[i][1]) / l.params[i][3] -
                  Math.round((v - l.params[i][1]) / l.params[i][3]),
              ) > 1e-7,
          )
        )
          throw new Error("Invalid slider values");
        state(l).values = [...input.values];
        state(l).bins = null;
        state(l).trials = 0;
      }
      history.replaceState(null, "", link("lab", l.id));
      render();
      $("#main")?.focus({ preventScroll: true });
      return { id: l.id, values: state(l).values };
    },
  });
  window.addEventListener("pagehide", () => lifecycle.abort(), { once: true });
}
