import {currentCourse,rememberCourse} from './navigation-state.js';
import {organizePage} from './page-ergonomics.js';
import {isLiveRoute, isLiveHash, liveDiscovery, livePathways, FULL_EDITION} from './live-curriculum.js';
import {galleryContext} from './gallery/gallery-context.js';
import {installControlPolicy} from "./control-policy.js";
import {preferredLanguage,routeLanguage} from "./content-language.js";
import {workshopMarkup,bindWorkshop} from './quadratic-workshop.js';
import { errorsPage, bindErrors } from "./errors.js";
import { olympiadPage, bindOlympiad, isOlympiadRoute } from "./olympiad.js";
import { rememberScrolls, restoreScrolls } from "./scroll-memory.js";
import { withEntryNav } from "./entry-nav.js";
import { isErrorRoute } from "./errors-model.js";
import { libraryPage, bindLibrary, chapterPage, bindChapter, relatedChapters, resourceCatalog } from "./resource-library.js";
import { packPage, bindPack, sourcesPage, bindSources } from "./pack-builder.js";
import { automatismesPage, bindAutomatismes } from "./automatismes.js";
import { sheetsPage, bindSheets } from "./worksheets.js";
import { bankPage, bindBank, isBankRoute } from "./bank-page.js";
import { slidesPage, bindSlides } from "./slides-page.js";
import { universityPage, bindUniversity } from "./university.js";
import { observeSvgNavigation } from "./canvas-navigation.js";
import { labs, challenges, pathways } from "./content.js";
import { pathwayPage as pathwayPageView, bindPathways } from "./pathways-view.js";
import { mountObject } from "./lab-objects.js";
import { homePage, bindHome, mountHomeFigure, galleryPage as galleryIndex } from "./welcome.js";
import { isReading, readingPage, readAlso } from "./reading.js";
import { mountArt } from "./home-art.js";
import { mountLibrary } from "./library.js";
import { icon } from "./icons.js";
import { VARIANTS, HINT_ACTIONS, hasVariants, defaults as variantDefaults, randomParams, normalise as normaliseVariant, mountActivity, hasActivity, challengeIcon, originalOf, mountSolution, hasSolution } from "./challenges/registry.js";
import { fullscreenButton } from "./visual-lessons.js";
import { basicsPage, bindBasics, isBasicsRoute } from "./basics-page.js";
import { currentTheme, toggleTheme, installPresenting } from "./ui.js";
import { assetHref } from "./data-loader.js";
import { illuminateFeedback } from "./motion.js";
import { mountExperiment } from "./lab/mount.js";
import { resolveRef, labRef } from "./lab/registry.js";
import { indexPage as labIndexPage, experimentPage, bindLabIndex } from "./lab/page.js";
import { isAnswer, formatNumber } from "./math.js";
import {discoveryIndex,discoveryPage,bindDiscovery,discoveryContext,isTopicRoute} from './discovery.js';
import {historyPage,bindHistory,isHistoryRoute,mathematiciansTimelineUrl} from './history.js';

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
let homeFigure = null;
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
// Three sections: "Apprendre" (courses and classroom tools), "Explorer" (laboratory, challenges) and "Lire" (biographies,
// stories, and the curiosities of the gallery).
// The main bar names the sections; a row of tabs under it names the pages of the current section.
const SECTIONS = [
  ["learn", "Apprendre", "Learn", "books", [
    ["resources", "Cours", "Lessons", "books"],
    ["bank", "Exercices", "Exercises", "seal-check"],
    ["bank/annales", "Annales", "Past papers", "scroll"],
    ["slides", "Diaporamas", "Slides", "presentation-chart"],
    ["basics", "Bases", "Foundations", "books"],
    ["automatismes", "Automatismes", "Starters", "lightbulb"],
    ["sheets", "Fiches", "Worksheets", "pencil-simple-line"],
    ...(FULL_EDITION ? [["pathways", "Parcours", "Pathways", "path"]] : []),
  ]],
  ["explore", "Explorer", "Explore", "flask", [
    ["topics", "Domaines", "Topics", "magnifying-glass"],
    ["lab", "Laboratoire", "Laboratory", "flask"],
    ["challenges", "Défis", "Challenges", "puzzle-piece"],
    ...(FULL_EDITION ? [["olympiad", "Olympiades", "Olympiads", "trophy"]] : []),
    ["errors", "Erreurs", "Errors", "warning"],
  ]],
  ["read", "Lire", "Read", "book-open", [
    ["stories", "Histoires", "Stories", "scroll"],
    ["biographies", "Biographies", "Biographies", "user"],
    ["history", "Chronologies", "Timelines", "scroll"],
    ["gallery", "Curiosités", "Curiosities", "sparkle"],
  ]],
];
// pages reached from a tab count as that tab
const TAB_OF = { chapter: "resources", library: "resources", workshop: "resources", pack: "resources", sources: "resources", university: "pathways" };
function header(page) {
  const tab = page === "bank" && route().id === "annales" ? "bank/annales" : TAB_OF[page] || page;
  const section = SECTIONS.find(([, , , , tabs]) => tabs.some(([id]) => id === tab));
  const dark = currentTheme() === "nuit";
  const themeLabel = dark ? pair("Passer au thème clair", "Switch to light theme") : pair("Passer au thème sombre", "Switch to dark theme");
  const destination=id=>['resources','bank','slides'].includes(id)&&currentCourse()?link(id,currentCourse()):link(id);
  const sectionLinks = SECTIONS.map(([id, fr, en, ic, tabs]) =>
    `<a href="${destination(tabs[0][0])}" data-section="${id}" ${['resources','bank','slides'].includes(tabs[0][0])?`data-course-page="${tabs[0][0]}"`:''} ${section?.[0] === id ? 'aria-current="true"' : ""}>${icon(ic, 20)}<span>${pair(fr, en)}</span></a>`).join("");
  const subnav = section ? `<nav class="subnav" aria-label="${pair(section[1], section[2])}"><div class="subnav-inner">${section[4].map(([id, fr, en, ic]) =>
    `<a href="${destination(id)}" ${['resources','bank','slides'].includes(id)?`data-course-page="${id}"`:''} ${tab === id ? 'aria-current="page"' : ""}>${icon(ic, 18)}<span>${pair(fr, en)}</span></a>`).join("")}${section[0]==='learn'?`<details class="section-tools secondary-tools"><summary>${pair('Pour enseigner','For teaching')}</summary><div><a href="#pack">${pair('Dossier sur mesure','Custom pack')}</a><a href="#workshop/quadratic">${pair('Atelier du second degré','Quadratic workshop')}</a></div></details>`:''}</div></nav>` : "";
  return `<header class="topbar"><a class="brand" href="#home" aria-label="Maths Explorer">${brandMark}<span class="brand-name">Maths Explorer</span></a><button class="nav-toggle" aria-expanded="false" aria-controls="primary-nav">${pair("Menu","Menu")}</button><nav id="primary-nav" class="mainnav" aria-label="${pair("Navigation principale", "Main navigation")}">${sectionLinks}</nav><div class="tools"><button class="icon-btn" data-theme-toggle aria-label="${themeLabel}" title="${themeLabel}">${icon(dark ? "sun" : "moon", 22)}</button><div class="language" ${(["chapter","university","workshop"].includes(route().page)||(route().page==="library"&&route().id))?"hidden":""} role="group" aria-label="${pair("Langue", "Language")}"><button data-lang="fr" aria-pressed="${lang === "fr"}" lang="fr">FR</button><button data-lang="en" aria-pressed="${lang === "en"}" lang="en">EN</button></div></div></header>${subnav}`;
}
function footer() {
  return `<footer><span class="foot-brand">Maths Explorer</span><span>${storageWorks ? pair("Progression enregistrée sur cet appareil.", "Progress saved on this device.") : pair("Stockage indisponible : progression conservée pour cette session.", "Storage unavailable: progress kept for this session.")}</span><nav class="foot-links" aria-label="${pair("Autres pages", "More pages")}"><a href="#pack">${pair("Dossier sur mesure", "Custom pack")}</a><a href="#sources">${pair("Sources LaTeX", "LaTeX sources")}</a>${FULL_EDITION?`<a href="#pathways">${pair("Programmes & sources", "Curricula & sources")}</a>`:""}<a href="https://github.com/Heritiana-Ankatso/Mikajy-Free/releases/latest" target="_blank" rel="noopener noreferrer">Mikajy Free (Android)</a><a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.${lang}" rel="license noopener" target="_blank">${pair("Licence CC BY-NC-SA 4.0", "CC BY-NC-SA 4.0 licence")}</a></nav></footer>`;
}
// French title of a chapter, for the generators (their content is French)
const chapterTitleFr = (id) => resourceCatalog.chapters.find((c) => c.id === id)?.title?.[0] || id;
let lastPage = null;
function render() {
  const keptScrolls = rememberScrolls($("#app")), cameFrom = lastPage;
  stopViews.forEach(stop=>stop()); stopViews=[];
  stopLab();
  stopLab = () => {};
  stopChapter();
  stopChapter = () => {};
  stopObject();
  stopArt.forEach((f) => f());
  stopArt = [];
  homeFigure?.destroy(); homeFigure = null;
  stopObject = () => {};
  let r = route();
  if (!isLiveRoute(r)) {
    history.replaceState(null, '', '#resources');
    r = route();
  }
  lang=routeLanguage(r,resourceCatalog.chapters,preferredLang);
  // The mathematicians' chronology owns its viewport and its own navigation.
  if (r.page === 'history' && (!r.id || r.id === 'people') && !r.tab) {
    window.location.replace(mathematiciansTimelineUrl(lang));
    return;
  }
  // the curiosities live in the gallery, whatever link points at them
  if (r.page === "lab" && labs.some((l) => l.id === r.id && l.custom)) { history.replaceState(null, "", link("gallery", r.id)); r = route(); }
  document.documentElement.lang = lang;
  document.title = pair(
    "Maths Explorer · Laboratoire de mathématiques",
    "Maths Explorer · Mathematics laboratory",
  );
  const experiment = r.page === "lab" && r.id ? (resolveRef(labRef(r.id, r.tab)) || resolveRef(r.id))?.experiment || null : null;
  const discovery=liveDiscovery(discoveryIndex({labs,challenges,chapters:resourceCatalog.chapters}));
  const valid = (r.page === "lab" && (!r.id || !!experiment)) || (r.page === "gallery" && (!r.id || labs.some(l => l.id === r.id && l.custom))) ||
    (r.page === 'history' && isHistoryRoute(r.id,r.tab)) ||
    (r.page === 'topics' && isTopicRoute(r.id,r.tab)) ||
    (r.page === "errors" && isErrorRoute(r.id)) ||
    (r.page === "olympiad" && isOlympiadRoute(r.id)) ||
    (r.page === "challenges" && (!r.id || challenges.some(c => c.id === r.id))) ||
    (r.page === "home" && !r.id) || (r.page === "basics" && isBasicsRoute(r.id)) || isReading(r.page, r.id) || (r.page === "pathways" && !r.id) || r.page === "library" || r.page === "pack" || r.page === "sources" || r.page === "slides" || r.page === "automatismes" || r.page === "sheets" || (r.page === "bank" && isBankRoute(r.id, r.tab)) ||
    r.page === "university" || (r.page === "resources" && isLiveRoute(r)) || (r.page === "workshop" && r.id === "quadratic") ||
    (r.page === "chapter" && resourceCatalog.chapters.some(c => c.id === r.id));
  const page = valid ? r.page : "missing";
  if(['resources','slides','bank'].includes(page))rememberCourse(r.id);
  if(page==='chapter')rememberCourse(resourceCatalog.chapters.find(c=>c.id===r.id)?.course);
  document.body.dataset.page=page;
  $("#app").innerHTML =
    header(page) +
    (page === "basics" ? basicsPage(r.id, { t, pair, lang, assetHref }) : page === "home" ? homePage({ pair, t, link, index:discovery, last }) : page === "workshop" ? workshopMarkup(t) : page === "pack" ? packPage(t, r.id) : page === "bank" ? bankPage(t, r.id, r.tab) : page === "sources" ? sourcesPage(t) : page === "slides" ? slidesPage(t) : page === "automatismes" ? automatismesPage(t, pair) : page === "sheets" ? sheetsPage(t) : page === "resources" ? libraryPage(t, { challenges, completed, seen, last, labs })
      : page === "university" ? universityPage(lang)
      : page === "topics" ? discoveryPage(discovery,r.id,r.tab,t)
      : page === "history" ? historyPage(r.id,r.tab,t,discovery)
      : page === "chapter" ? chapterPage(r.id, r.tab, t, labs)
      : page === "errors" ? errorsPage(r.id, t)
      : page === "olympiad" ? olympiadPage(r.id, t)
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
  if (page === "home") homeFigure = mountHomeFigure($("#main"), { lang, reduced: reducedMotion() });
  if (page === "home" || (page === "gallery" && !r.id)) stopArt = [...document.querySelectorAll("canvas[data-art]")].map((cv) => mountArt(cv, cv.dataset.art, { reduced: reducedMotion }));
  if (page === "gallery" && $("#object-stage")) stopObject = mountObject($("#object-stage").dataset.object, $("#object-stage"), { lang, reduced: reducedMotion, initialValues: state(labs.find(x=>x.id===currentLab)).values, onChange: values => { state(labs.find(x=>x.id===currentLab)).values = values; } });
  $(".skip").textContent = pair("Aller au contenu", "Skip to content");
  document.querySelectorAll('#app a[href^="#"]').forEach(a => {
    if (!isLiveHash(a.getAttribute('href'))) a.remove();
  });
  bindCommon();
  if (page === "gallery" && r.id) bindGallery();
  if (page === "lab" && !experiment) bindLabIndex($("#main"), pair);
  if (page === "challenges") stopChapter = bindChallenges();
  if (page === "errors") stopChapter = bindErrors($("#main"), t, r.id);
  if (page === "olympiad") stopChapter = bindOlympiad($("#main"), lang);
  if (page === "home") stopChapter = bindHome($("#main"),discovery,t);
  if (page === "basics" && r.id) stopChapter = bindBasics({ $, currentTheme });
  if (page === "resources") stopChapter = bindLibrary(t, { fmt });
  if (page === "pathways") stopChapter = bindPathways({ root: $("#main"), pathways: livePathways, labs, t, pair, link, glyph, completed });
  if (page === "pack") bindPack(t);
  if (page === "sources") bindSources(t);
  if (page === "slides") bindSlides(t);
  if (page === "automatismes") stopChapter = bindAutomatismes($("#main"), t, { chapterTitle: chapterTitleFr });
  if (page === "bank") stopChapter = bindBank($("#main"), t, r.id, r.tab);
  if (page === "sheets") stopChapter = bindSheets($("#main"), t, { chapterTitle: chapterTitleFr });
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
  stopViews.push(organizePage($("#main"),t));
  installPresenting();
  // the lists of the previous page of the same kind keep their scroll position (gallery sidebar, timelines, strips)
  restoreScrolls($("#app"), cameFrom === page ? keptScrolls : null);
  lastPage = page;
}
function bindCommon() {
 const syncCourseLinks=()=>document.querySelectorAll('[data-course-page]').forEach(a=>{const c=currentCourse();a.href=link(a.dataset.coursePage,c);});
 window.addEventListener('mx-course-change',syncCourseLinks);
 stopViews.push(()=>window.removeEventListener('mx-course-change',syncCourseLinks));
 const navButton=$(".nav-toggle"), nav=$("#primary-nav");
 const closeMenu=()=>{navButton.setAttribute("aria-expanded","false");nav.classList.remove("is-open");};
 navButton.addEventListener("click",()=>{const open=navButton.getAttribute("aria-expanded")!=="true";navButton.setAttribute("aria-expanded",String(open));nav.classList.toggle("is-open",open);});
 $(".topbar").addEventListener("keydown",e=>{if(e.key==="Escape"&&navButton.getAttribute("aria-expanded")==="true"){closeMenu();navButton.focus();}});

  $("[data-theme-toggle]")?.addEventListener("click", () => {
    toggleTheme();
    homeFigure?.retheme();
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
  const content = ` <main id="main" class="lab-main" tabindex="-1"><div class="breadcrumb">${pair("La galerie", "The gallery")}<span>/</span>${t(lab.group)}</div><div class="lab-heading"><div><h1>${t(lab.title)}</h1><p>${t(lab.intro)}</p></div><span class="level">${t(lab.level)}</span></div>
 <div class="workbench${lab.layout === "exhibit" ? " workbench-exhibit" : ""}"><section class="experiment" data-fs-target aria-label="${pair("Expérience interactive", "Interactive experiment")}"><div class="experiment-top"><span class="eyebrow">${pair("À toi d’expérimenter", "Your turn to experiment")}</span><span class="experiment-actions">${fullscreenButton(pair)}<button id="reset" class="text-button">${pair("Réinitialiser", "Reset")}</button></span></div>${relatedChapters(lab.id, t)}<div id="object-stage" class="object-stage" data-object="${lab.id}"></div></section>
 <aside class="learning"><div class="learning-label"><span aria-hidden="true">◷</span> ${pair("Temps d’apprentissage", "Learning time")} <span>${lab.duration} min</span></div><h2>${pair("De l’intuition à l’idée", "From intuition to insight")}</h2><p class="prereq"><strong>${pair("Avant de commencer", "Before you begin")}</strong><br>${t(lab.prereq)}</p><p class="muted">${pair("Les mesures affichées sont arrondies. Des essais suggèrent une conjecture ; un argument général établit une preuve.", "Displayed measurements are rounded. Examples suggest a conjecture; a general argument establishes a proof.")}</p><ol class="steps">${lab.steps.map((x) => `<li>${t(x)}</li>`).join("")}</ol>${lab.reasoning ? `<div class="reasoning"><details><summary>${pair("Comparer avec un argument", "Compare with an argument")}</summary><p><strong>${pair("Conjecture", "Conjecture")}</strong> ${t(lab.reasoning.conjecture)}</p><p><strong>${pair("Justification", "Justification")}</strong> ${t(lab.reasoning.proof)}</p><p>${t(lab.reasoning.transfer)}</p></details></div>` : ""}<div class="checkpoint"><span class="eyebrow">${pair("Le petit déclic", "Check your understanding")}</span>${Object.keys(lab.quizState || {}).length ? `<button id="quiz-preset" class="secondary">${pair("Régler l’expérience pour cette question", "Set the experiment for this question")}</button>` : ""}<form id="lab-quiz"><label for="quiz-answer">${t(lab.quiz)}</label><div class="answer-row"><input id="quiz-answer" name="answer" type="text" inputmode="text" autocomplete="off" placeholder="${pair("Ta réponse", "Your answer")}" required value="${esc(s.answer)}"><button class="primary" type="submit">${pair("Vérifier", "Check")}</button></div></form><p id="quiz-feedback" class="feedback ${s.result === true ? "success" : ""}" role="status">${s.result === true ? pair("Bien vu ! ", "That’s right! ") + t(lab.explain) : s.result === false ? pair("Pas encore. Reprends l’expérience et essaie à nouveau.", "Not yet. Revisit the experiment and try again.") : ""}</p><details><summary>${pair("Comprendre la réponse", "Understand the answer")}</summary><p>${t(lab.explain)}</p></details></div></aside></div>
 <section class="history"><div class="history-icon" aria-hidden="true">H</div><div class="history-title"><span class="eyebrow">${pair("Repère historique", "History box")}</span><h2>${t(lab.history)}</h2></div><div><p>${t(lab.story)}</p><a href="${lab.source}" target="_blank" rel="noopener noreferrer">${lab.sourceLabel ? t(lab.sourceLabel) : lab.source.includes("mathshistory.st-andrews.ac.uk") ? pair("En savoir plus · MacTutor (anglais)", "Read more · MacTutor") : pair("Source et explications", "Source and explanation")} <span class="sr-only">${pair("(nouvel onglet)", "(new tab)")}</span></a></div></section>${galleryContext(lab.id, pair)}${readAlso(link("gallery", lab.id), lab.links, t)}</main>`;
  const groups=[...new Set(pool.map(x=>t(x.group)))].map(label=>({label:[label,label],items:pool.filter(x=>t(x.group)===label).map(x=>({id:x.id,href:link('gallery',x.id),title:x.short||x.title}))}));
  return withEntryNav(content,{t,label:['Curiosités','Curiosities'],title:['La galerie','The gallery'],groups,current:lab.id});
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
  if (c) {
    // the list of challenges, grouped by topic, beside the open one
    const groups = [];
    for (const x of challenges) { const key = x.topic[0]; let g = groups.find((y) => y.key === key); if (!g) groups.push((g = { key, label: x.topic, items: [] })); g.items.push({ id: x.id, href: link("challenges", x.id), title: x.title }); }
    return withEntryNav(challengeDetail(c), { t, label: ["Défis", "Challenges"], title: ["Les défis", "The challenges"], groups, current: c.id });
  }
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
// Pathways page: curriculum rail, level tabs, topic filters and tile grid (js/pathways-view.js).
function pathwayPage() { return pathwayPageView({ pathways: livePathways, labs, t, pair, icon }); }

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
