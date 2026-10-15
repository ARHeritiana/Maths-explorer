import {workshopMarkup,bindWorkshop} from './quadratic-workshop.js';
import { libraryPage, bindLibrary, chapterPage, bindChapter, relatedChapters, resourceCatalog } from "./resource-library.js";
import { packPage, bindPack, sourcesPage, bindSources } from "./pack-builder.js";
import { slidesPage, bindSlides } from "./slides-page.js";
import { navigationButtons, observeSvgNavigation } from "./canvas-navigation.js";
import { manipulate, snapParameter, graphPosition } from "./interaction.js";
import { labs, challenges, pathways } from "./content.js";
import { mountObject } from "./lab-objects.js";
import { homePage, galleryPage as galleryIndex } from "./welcome.js";
import { mountArt } from "./home-art.js";
import { mountLibrary } from "./library.js";
import { icon } from "./icons.js";
import { mountActivity, hasActivity } from "./challenge-activities.js";
import { challengeIcon } from "./challenge-icons.js";
import { originalOf } from "./challenge-originals.js";
import { mountSolution, hasSolution } from "./challenge-solutions.js";
import { VARIANTS, hasVariants, defaults as variantDefaults, randomParams, normalise as normaliseVariant } from "./challenge-variants.js";
import { fullscreenButton } from "./visual-lessons.js";
import { currentTheme, toggleTheme, installPresenting } from "./ui.js";
import { createLabMotion, installInterfaceMotion, illuminateFeedback } from "./motion.js";
import { trigControls, trigDiagram } from "./trigonometry.js";
import {
  quadratic,
  sequence,
  binomial,
  sampleBinomial,
  statistics,
  parseData,
  riemann,
  isAnswer,
  squareSecant,
  formatNumber,
  axisTicks,
} from "./math.js";

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
let lang = saved.lang === "en" ? "en" : "fr";
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
let stopTrig = () => {};
let stopViews = [];
let plotBounds = null;
let activeDrag = null;
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
const reducedMotion = () => motionPreference.matches;
const labMotion = createLabMotion({
  paint: (values, moving) => updateLab(values, moving),
  reduced: reducedMotion,
  visible: () => !document.hidden,
});
document.addEventListener("visibilitychange", () => { if (document.hidden) labMotion.settle(); });
motionPreference.addEventListener?.("change", () => {
  if (reducedMotion()) {
    labMotion.settle();
    document.getAnimations?.().forEach(animation => animation.cancel());
  }
});
const t = (pair) => pair[lang === "fr" ? 0 : 1];
const fmt = (n, d = 3) => formatNumber(n, lang, d);
const pair = (fr, en) => t([fr, en]);
function save() {
  try {
    localStorage.setItem(
      "maths-explorer-v1",
      JSON.stringify({ lang, completed: [...completed], seen: [...seen], last }),
    );
  } catch {
    storageWorks = false;
  }
  if ($("footer")) $("footer").outerHTML = footer();
}
function state(lab) {
  return (states[lab.id] ??= {
    values: lab.params.map((p) => p[4]),
    mode: "arithmetic",
    direction: 1,
    method: "left",
    observation: "",
    conjecture: "",
    bins: null,
    trials: 0,
    data: "2 3 4 4 5 6 9",
    answer: "",
    result: null,
  });
}
function route() {
  const parts = location.hash.slice(1).split("/");
  return { page: parts[0] || "home", id: parts[1], tab: parts[2] };
}
function link(page, id = "") {
  return "#" + page + (id ? "/" + id : "");
}
const brandMark = `<svg class="brandmark" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><rect width="40" height="40" rx="10" class="bm-bg"/><path d="M9 11Q20 43 31 11" class="bm-curve"/><circle cx="10" cy="20" r="3.2" class="bm-dot"/><circle cx="30" cy="20" r="3.2" class="bm-dot"/></svg>`;
function header(page) {
  const nav = [
    ["resources", "Cours", "Lessons", "books"],
    ["slides", "Diaporamas", "Slides", "presentation-chart"],
    ["lab", "Laboratoire", "Laboratory", "flask"],
    ["gallery", "Galerie", "Gallery", "sparkle"],
    ["challenges", "Défis", "Challenges", "puzzle-piece"],
    ["pathways", "Parcours", "Pathways", "path"],
  ];
  const dark = currentTheme() === "nuit";
  const themeLabel = dark ? pair("Passer au thème clair", "Switch to light theme") : pair("Passer au thème sombre", "Switch to dark theme");
  return `<header class="topbar"><a class="brand" href="#home" aria-label="Maths Explorer">${brandMark}<span class="brand-name">Maths Explorer</span></a><nav class="mainnav" aria-label="${pair("Navigation principale", "Main navigation")}">${nav
    .map(
      ([id, fr, en, ic]) =>
        `<a href="#${id}" ${page === id || (["chapter", "library", "workshop"].includes(page) && id === "resources") ? 'aria-current="page"' : ""}>${icon(ic, 20)}<span>${pair(fr, en)}</span></a>`,
    )
    .join("")}</nav><div class="tools"><button class="icon-btn" data-theme-toggle aria-label="${themeLabel}" title="${themeLabel}">${icon(dark ? "sun" : "moon", 22)}</button><div class="language" role="group" aria-label="${pair("Langue", "Language")}"><button data-lang="fr" aria-pressed="${lang === "fr"}" lang="fr">FR</button><button data-lang="en" aria-pressed="${lang === "en"}" lang="en">EN</button></div></div></header>`;
}
function footer() {
  return `<footer><span class="foot-brand">Maths Explorer</span><span>${storageWorks ? pair("Progression enregistrée sur cet appareil.", "Progress saved on this device.") : pair("Stockage indisponible : progression conservée pour cette session.", "Storage unavailable: progress kept for this session.")}</span><nav class="foot-links" aria-label="${pair("Autres pages", "More pages")}"><a href="#pack">${pair("Dossier sur mesure", "Custom pack")}</a><a href="#sources">${pair("Sources LaTeX", "LaTeX sources")}</a><a href="#pathways">${pair("Programmes & sources", "Curricula & sources")}</a><a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.${lang}" rel="license noopener" target="_blank">${pair("Licence CC BY-NC-SA 4.0", "CC BY-NC-SA 4.0 licence")}</a></nav></footer>`;
}
function render() {
  stopViews.forEach(stop=>stop()); stopViews=[];
  stopTrig();
  stopTrig = () => {};
  stopChapter();
  stopChapter = () => {};
  stopObject();
  stopArt.forEach((f) => f());
  stopArt = [];
  stopObject = () => {};
  activeDrag = null;
  plotBounds = null;
  labMotion.reset();
  let r = route();
  // the curiosities live in the gallery, whatever link points at them
  if (r.page === "lab" && labs.some((l) => l.id === r.id && l.custom)) { history.replaceState(null, "", link("gallery", r.id)); r = route(); }
  document.documentElement.lang = lang;
  document.title = pair(
    "Maths Explorer · Laboratoire de mathématiques",
    "Maths Explorer · Mathematics laboratory",
  );
  const valid = (r.page === "lab" && (!r.id || labs.some(l => l.id === r.id && !l.custom))) || (r.page === "gallery" && (!r.id || labs.some(l => l.id === r.id && l.custom))) ||
    (r.page === "challenges" && (!r.id || challenges.some(c => c.id === r.id))) ||
    (r.page === "home" && !r.id) || (r.page === "pathways" && !r.id) || r.page === "library" || r.page === "pack" || r.page === "sources" || r.page === "slides" ||
    (r.page === "resources" && !r.id) || (r.page === "workshop" && r.id === "quadratic") ||
    (r.page === "chapter" && resourceCatalog.chapters.some(c => c.id === r.id));
  const page = valid ? r.page : "missing";
  $("#app").innerHTML =
    header(page) +
    (page === "home" ? homePage({ pair, t, link, labs }) : page === "workshop" ? workshopMarkup(t) : page === "pack" ? packPage(t, r.id) : page === "sources" ? sourcesPage(t) : page === "slides" ? slidesPage(t) : page === "resources" ? libraryPage(t, { challenges, completed, seen, last, labs })
      : page === "chapter" ? chapterPage(r.id, r.tab, t, labs)
      : page === "lab"
      ? labPage(r.id)
      : page === "gallery"
      ? (r.id ? labPage(r.id, "gallery") : galleryIndex({ pair, t, link, labs }))
      : page === "challenges"
        ? challengePage(r.id)
        : page === "library"
          ? `<main id="main" tabindex="-1" class="library-page"></main>`
        : page === "pathways"
          ? pathwayPage()
          : `<main id="main" tabindex="-1" class="page"><h1>${pair("Page introuvable", "Page not found")}</h1><a href="#lab">${pair("Ouvrir le laboratoire", "Open the laboratory")}</a></main>`) +
    footer();
  if (page === "lab" && $("#plot")) updateLab();
  if (page === "home" || (page === "gallery" && !r.id)) stopArt = [...document.querySelectorAll("canvas[data-art]")].map((cv) => mountArt(cv, cv.dataset.art, { reduced: reducedMotion }));
  if ((page === "lab" || page === "gallery") && $("#object-stage")) stopObject = mountObject($("#object-stage").dataset.object, $("#object-stage"), { lang, reduced: reducedMotion, initialValues: state(labs.find(x=>x.id===currentLab)).values, onChange: values => { state(labs.find(x=>x.id===currentLab)).values = values; } });
  $(".skip").textContent = pair("Aller au contenu", "Skip to content");
  bindCommon();
  if (page === "lab" || (page === "gallery" && r.id)) bindLab();
  if (page === "challenges") stopChapter = bindChallenges();
  if (page === "resources") stopChapter = bindLibrary(t, { fmt });
  if (page === "pack") bindPack(t);
  if (page === "sources") bindSources(t);
  if (page === "slides") bindSlides(t);
  if (page === "chapter") {
    stopChapter = bindChapter(r.id, t, fmt);
    if (last !== r.id || !seen.has(r.id)) {
      last = r.id;
      seen.add(r.id);
      save();
    }
  }
  if (page === "workshop") stopChapter = bindWorkshop($("#main"),t,lang);
  stopViews.push(observeSvgNavigation($("#main"), "svg.act-svg, #quadratic-graph svg, #plot.trig-plot svg",lang));
  if (page === "library") mountLibrary($("#main"), {lang,id:r.id});
  installInterfaceMotion($("#app"), reducedMotion);
  installPresenting();
}
function bindCommon() {
  $("[data-theme-toggle]")?.addEventListener("click", () => {
    toggleTheme();
    const dark = currentTheme() === "nuit";
    const label = dark ? pair("Passer au thème clair", "Switch to light theme") : pair("Passer au thème sombre", "Switch to dark theme");
    const button = $("[data-theme-toggle]");
    button.setAttribute("aria-label", label);
    button.title = label;
    button.innerHTML = icon(dark ? "sun" : "moon", 22);
  });
  document.querySelectorAll("[data-lang]").forEach((b) =>
    b.addEventListener("click", () => {
      lang = b.dataset.lang;
      save();
      render();
      $(`[data-lang="${lang}"]`).focus();
    }),
  );
}
const groupRank = (l) => ["Algèbre", "Géométrie", "Données & hasard", "Analyse"].indexOf(l.group[0]);
// The combining arrow in the vector symbol is missing from the maths font: show a plain arrow.
const glyph = (symbol) => (symbol.includes("\u20d7") ? "→" : symbol);
function labPage(id, mode = "lab") {
  const pool = labs.filter((x) => (mode === "gallery") === !!x.custom), navLabs = mode === "gallery" ? pool : [...pool].sort((p, q) => groupRank(p) - groupRank(q));
  const lab = pool.find((x) => x.id === id) || pool[0];
  currentLab = lab.id;
  const s = state(lab);
  return `<div class="lab-layout"><aside class="sidebar" aria-label="${mode === "gallery" ? pair("Galerie", "Gallery") : pair("Expériences", "Experiments")}"><label class="mobile-lab-picker" for="lab-picker">${mode === "gallery" ? pair("Choisir une merveille", "Choose a wonder") : pair("Choisir une expérience", "Choose an experiment")}<select id="lab-picker">${navLabs.map(x => `<option value="${x.id}" ${x.id === lab.id ? "selected" : ""}>${t(x.short)}</option>`).join("")}</select></label><div class="side-title">${mode === "gallery" ? pair("La galerie", "The gallery") : pair("Explorer", "Explore")} <span>${String(navLabs.length).padStart(2, "0")}</span></div><div class="lab-links">${navLabs.map((x, i) => `${i === 0 || t(x.group) !== t(navLabs[i - 1].group) ? `<p class="group-label">${t(x.group)}</p>` : ""}<a href="${link(mode, x.id)}" class="lab-link ${x.id === lab.id ? "selected" : ""}" ${x.id === lab.id ? 'aria-current="page"' : ""}><span class="lab-symbol" aria-hidden="true">${glyph(x.symbol)}</span><span>${t(x.short)}</span>${completed.has(x.id) ? '<span class="check" aria-label="' + pair("Question réussie", "Check completed") + '">✓</span>' : ""}</a>`).join("")}</div><div class="side-note"><span aria-hidden="true">✧</span><p>${pair("Une question est un bon point de départ.", "A question is a good place to start.")}</p></div></aside>
 <main id="main" class="lab-main" tabindex="-1"><div class="breadcrumb">${mode === "gallery" ? pair("La galerie", "The gallery") : pair("Le laboratoire", "The laboratory")}<span>/</span>${t(lab.group)}</div><div class="lab-heading"><div><h1>${t(lab.title)}</h1><p>${t(lab.intro)}</p></div><span class="level">${t(lab.level)}</span></div>
 <div class="workbench"><section class="experiment" data-fs-target aria-label="${pair("Expérience interactive", "Interactive experiment")}"><div class="experiment-top"><span class="eyebrow">${pair("À toi d’expérimenter", "Your turn to experiment")}</span><span class="experiment-actions">${fullscreenButton(pair)}<button id="reset" class="text-button">${pair("Réinitialiser", "Reset")}</button></span></div>${relatedChapters(lab.id, t)}${lab.id === "quadratic" ? `<a class="secondary quadratic-workshop-link" href="#workshop/quadratic">${pair("Présenter et explorer · 5 étapes", "Present and explore · 5 stages")}</a>` : ""}${lab.id === "trig" ? trigControls(s,t) : ""}${lab.custom || lab.id === "complex" ? `<div id="object-stage" class="object-stage" data-object="${lab.id}"></div>` : `<div class="formula" id="formula">${lab.formula}</div><p class="interaction-guide" id="interaction-guide">${interactionGuide(lab.id)}</p><div id="plot" class="plot ${lab.id === "trig" ? "trig-plot" : ""}" aria-describedby="interaction-guide"></div><div id="plot-navigation"></div><div class="plot-caption" id="plot-caption"></div><details class="chart-data"><summary>${pair("Lire les valeurs du graphique", "Read the chart values")}</summary><div id="chart-data"></div></details><div class="controls">
 ${
   lab.id === "sequences"
     ? `<fieldset class="mode"><legend>${pair("Type de suite", "Sequence type")}</legend>${[
         ["arithmetic", "Arithmétique", "Arithmetic"],
         ["geometric", "Géométrique", "Geometric"],
       ]
         .map(
           ([v, fr, en]) =>
             `<label><input type="radio" name="mode" value="${v}" ${s.mode === v ? "checked" : ""}>${pair(fr, en)}</label>`,
         )
         .join("")}</fieldset>`
     : ""
 }
 ${lab.id === "derivative" ? `<fieldset class="mode"><legend>${pair("Approcher par", "Approach from")}</legend>${[[1,"La droite (h > 0)","The right (h > 0)"],[-1,"La gauche (h < 0)","The left (h < 0)"]].map(([v,fr,en]) => `<label><input type="radio" name="direction" value="${v}" ${s.direction === v ? "checked" : ""}>${pair(fr,en)}</label>`).join("")}</fieldset>` : ""}
 ${lab.id === "integral" ? `<fieldset class="mode"><legend>${pair("Hauteur des rectangles", "Rectangle heights")}</legend>${[["left","À gauche","Left endpoint"],["right","À droite","Right endpoint"],["midpoint","Au milieu","Midpoint"]].map(([v,fr,en]) => `<label><input type="radio" name="method" value="${v}" ${s.method === v ? "checked" : ""}>${pair(fr,en)}</label>`).join("")}</fieldset>` : ""}
 ${lab.params.map(([name, min, max, step], i) => `<label class="slider-control" for="param-${i}"><span>${parameterLabel(lab.id, i, name)}<output id="value-${i}">${fmt(s.values[i])}${name === "θ" ? "°" : ""}</output></span><input id="param-${i}" data-param="${i}" type="range" min="${min}" max="${max}" step="${step}" value="${s.values[i]}"><span class="range-limits"><span>${fmt(min)}</span><span>${fmt(max)}</span></span></label>`).join("")}
 ${lab.id === "statistics" ? `<label class="data-label" for="data-input">${pair("Tes données", "Your data")}</label><textarea id="data-input" rows="2" aria-describedby="data-help data-error">${esc(s.data)}</textarea><p id="data-help" class="muted">${pair("1 à 100 valeurs séparées par des espaces ou des points-virgules. Décimales : 2,5 ou 2.5. Valeurs entre −10 000 et 10 000.", "1–100 values separated by spaces or semicolons. Decimals: 2.5 or 2,5. Values between −10,000 and 10,000.")}</p><p id="data-error" class="error" role="alert"></p>` : ""}
 ${lab.id === "probability" ? `<div class="simulation"><button class="primary" data-sim="100">${pair("Simuler 100 expériences", "Simulate 100 experiments")}</button><button class="secondary" data-sim="1000">${pair("En ajouter 1 000", "Add 1,000")}</button><p id="sim-status" class="muted" aria-live="polite"></p><div id="sim-tray" class="sim-tray" aria-label="${pair("Les dernières expériences : pièce pleine = succès", "The latest experiments: filled coin = success")}" role="img"></div></div>` : ""}</div><div id="results" class="results" aria-live="polite" aria-atomic="true"></div>`}</section>
 <aside class="learning"><div class="learning-label"><span aria-hidden="true">◷</span> ${pair("Temps d’apprentissage", "Learning time")} <span>${lab.duration} min</span></div><h2>${pair("De l’intuition à l’idée", "From intuition to insight")}</h2><p class="prereq"><strong>${pair("Avant de commencer", "Before you begin")}</strong><br>${t(lab.prereq)}</p><p class="muted">${lab.id === "trig" ? pair("Les valeurs sont exactes aux angles remarquables ; sinon, le signe ≈ indique une approximation. Les essais aident à conjecturer ; un argument général établit une preuve.", "Values are exact at remarkable angles; otherwise, ≈ indicates an approximation. Examples suggest a conjecture; a general argument establishes a proof.") : pair("Les mesures affichées sont arrondies. Des essais suggèrent une conjecture ; un argument général établit une preuve.", "Displayed measurements are rounded. Examples suggest a conjecture; a general argument establishes a proof.")}</p><ol class="steps">${lab.steps.map((x) => `<li>${t(x)}</li>`).join("")}</ol><div class="reasoning">${mode === "gallery" ? "" : `<details class="notes"><summary>${pair("Garder des notes (facultatif)", "Keep some notes (optional)")}</summary><label for="observation">${pair("Mon observation (avec les paramètres)", "My observation (including parameters)")}</label><textarea id="observation" data-note="observation" rows="2" maxlength="2000">${esc(s.observation)}</textarea><label for="conjecture">${pair("Ma conjecture et ses conditions", "My conjecture and its conditions")}</label><textarea id="conjecture" data-note="conjecture" rows="2" maxlength="2000">${esc(s.conjecture)}</textarea><p class="muted">${pair("Notes conservées pendant cette session seulement. Elles ne sont pas corrigées automatiquement.", "Notes stay in this session only. They are not marked automatically.")}</p></details>`}<details><summary>${pair("Comparer avec un argument", "Compare with an argument")}</summary><p><strong>${pair("Conjecture", "Conjecture")}</strong> ${t(lab.reasoning.conjecture)}</p><p><strong>${pair("Justification", "Justification")}</strong> ${t(lab.reasoning.proof)}</p><p>${t(lab.reasoning.transfer)}</p></details></div><div class="checkpoint"><span class="eyebrow">${pair("Le petit déclic", "Check your understanding")}</span><button id="quiz-preset" class="secondary">${pair("Régler l’expérience pour cette question", "Set the experiment for this question")}</button><form id="lab-quiz"><label for="quiz-answer">${t(lab.quiz)}</label><div class="answer-row"><input id="quiz-answer" name="answer" type="text" inputmode="text" autocomplete="off" placeholder="${pair("Ta réponse", "Your answer")}" required value="${esc(s.answer)}"><button class="primary" type="submit">${pair("Vérifier", "Check")}</button></div></form><p id="quiz-feedback" class="feedback ${s.result === true ? "success" : ""}" role="status">${s.result === true ? pair("Bien vu ! ", "That’s right! ") + t(lab.explain) : s.result === false ? pair("Pas encore. Reprends l’expérience et essaie à nouveau.", "Not yet. Revisit the experiment and try again.") : ""}</p><details><summary>${pair("Comprendre la réponse", "Understand the answer")}</summary><p>${t(lab.explain)}</p></details></div></aside></div>
 ${mode === "gallery" ? "" : `<section class="lab-resources"><h2>${pair("Poursuivre ce chapitre", "Continue this topic")}</h2><p>${pair("Passer de l’expérience aux notes, aux exercices et aux problèmes.", "Move from the experiment to notes, exercises and problems.")}</p><a class="secondary" href="#library/@${lab.id}">${pair("Ressources liées à cette expérience", "Resources linked to this experiment")}</a></section>`}
 <section class="history"><div class="history-icon" aria-hidden="true">H</div><div class="history-title"><span class="eyebrow">${pair("Repère historique", "History box")}</span><h2>${t(lab.history)}</h2></div><div><p>${t(lab.story)}</p><a href="${lab.source}" target="_blank" rel="noopener noreferrer">${pair("En savoir plus · MacTutor (anglais)", "Read more · MacTutor")} <span class="sr-only">${pair("(nouvel onglet)", "(new tab)")}</span></a></div></section></main></div>`;
}

function interactionGuide(id) {
  const guides = {
    quadratic: ["Déplace C verticalement pour changer c ; déplace A pour changer l’ouverture. Les curseurs règlent aussi b.", "Drag C vertically to change c; drag A to change the opening. Use the sliders to adjust b too."],
    trig: ["Fais glisser P autour du cercle pour changer l’angle.", "Drag P around the circle to change the angle."],
    sequences: ["Déplace u₀ et u₁ verticalement pour changer le terme initial et la raison.", "Drag u₀ and u₁ vertically to change the initial term and the difference or ratio."],
    probability: ["Déplace E horizontalement pour changer p. Lance une simulation pour comparer les barres.", "Drag E horizontally to change p. Run a simulation to compare the bars."],
    derivative: ["Déplace A le long de la parabole ; rapproche B de A pour observer la tangente.", "Drag A along the parabola; bring B closer to A to observe the tangent."],
    integral: ["Déplace la séparation S : vers la gauche, les rectangles deviennent plus nombreux.", "Drag boundary S: move left to increase the number of rectangles."],
    vectors: ["Déplace les extrémités u et v. Le vecteur bleu montre leur somme.", "Drag endpoints u and v. The blue vector shows their sum."],
    statistics: ["Déplace un point horizontalement pour changer une donnée et observer la moyenne.", "Drag a dot horizontally to change a data value and observe the mean."],
    complex: ["Déplace z dans le plan. Le point orange iz suit la rotation de 90°.", "Drag z in the plane. The orange point iz follows the 90° rotation."],
  };
  return t(guides[id]) + " " + pair("Au clavier : sélectionne un point avec Tab, puis utilise les flèches. Maj accélère.", "Keyboard: select a point with Tab, then use the arrow keys. Shift moves faster.");
}
function parameterLabel(id, i, name) {
  const labels = {
    quadratic: [["a · ouverture", "a · opening"], ["b · terme linéaire", "b · linear term"], ["c · ordonnée à l’origine", "c · y-intercept"]],
    trig: [["x · angle", "x · angle"]],
    sequences: [["u₀ · premier terme", "u₀ · first term"], ["r / q · raison", "r / q · difference / ratio"], ["N · nombre de termes", "N · number of terms"]],
    probability: [["n · nombre d’essais", "n · number of trials"], ["p · probabilité de succès", "p · success probability"]],
    derivative: [["x · point A", "x · point A"], ["|h| · distance entre A et B", "|h| · distance between A and B"]],
    integral: [["N · nombre de rectangles", "N · number of rectangles"]],
    complex: [["a · partie réelle", "a · real part"], ["b · partie imaginaire", "b · imaginary part"]],
  };
  return labels[id]?.[i] ? t(labels[id][i]) : name;
}
function handleAt(x, y, id, label, color = "teal") {
  // Keep the invisible target at least 44 CSS pixels across at narrow widths.
  const radius = Math.max(20, 22 * 720 / Math.max(1, Math.min(678, $("#plot").clientWidth)));
  return `<g data-handle="${id}" data-label="${esc(label)}" data-x="${x}" data-y="${y}" class="drag-handle ${color}" tabindex="0" role="button" aria-label="${esc(label)} · ${pair("déplacer avec les flèches", "move with arrow keys")}" aria-describedby="interaction-guide"><title>${esc(label)}</title><circle cx="${x}" cy="${y}" r="${radius}" class="handle-hit"/><circle cx="${x}" cy="${y}" r="10" class="handle-ring"/><circle cx="${x}" cy="${y}" r="5" class="handle-core"/><text x="${x > 660 ? x - 14 : x + 14}" y="${Math.max(18, y - 14)}" text-anchor="${x > 660 ? "end" : "start"}" class="handle-label">${esc(label)}</text></g>`;
}

// x + yi in algebraic form: "2 + i", "−1 − 2i", "3", "i" (a unit imaginary coefficient is implicit).
function algebraic(x, y) {
  const im = Math.abs(y) === 1 ? "i" : fmt(Math.abs(y)) + "i";
  if (y === 0) return fmt(x);
  if (x === 0) return (y < 0 ? "−" : "") + im;
  return `${fmt(x)} ${y < 0 ? "−" : "+"} ${im}`;
}
// Bounds that contain the origin and the given points, rounded to whole units so the frame stays still while a
// value changes inside the same unit; equal-scale charts then fill the panel instead of shrinking small vectors.
function fitBounds(xs, ys, margin = 1, minSpan = 4) {
  const range = (values) => {
    let lo = Math.floor(Math.min(0, ...values) - margin), hi = Math.ceil(Math.max(0, ...values) + margin);
    if (hi - lo < minSpan) { const grow = (minSpan - (hi - lo)) / 2; lo -= Math.ceil(grow); hi += Math.ceil(grow); }
    return [lo, hi];
  };
  const [xmin, xmax] = range(xs), [ymin, ymax] = range(ys);
  return { xmin, xmax, ymin, ymax };
}
// SVG is used only for mathematical diagrams and data visualization.
function chart({
  xmin = -6,
  xmax = 6,
  ymin = -5,
  ymax = 7,
  label = "",
  equal = false,
  draw,
  handles = () => "",
}) {
  const W = 720,
    H = 350,
    L = 48,
    R = 22,
    T = 22,
    B = 36,
    pw = W - L - R,
    ph = H - T - B;
  if (equal) {
    // One unit has the same length on both axes: widen whichever range is too short for the panel's shape.
    const unit = Math.max((xmax - xmin) / pw, (ymax - ymin) / ph),
      cx = (xmin + xmax) / 2,
      cy = (ymin + ymax) / 2;
    xmin = cx - (unit * pw) / 2;
    xmax = cx + (unit * pw) / 2;
    ymin = cy - (unit * ph) / 2;
    ymax = cy + (unit * ph) / 2;
  }
  const cameraState = state(labs.find(x=>x.id===currentLab));
  cameraState.homeView ??= {xmin,xmax,ymin,ymax};
  cameraState.view ??= {...cameraState.homeView};
  ({xmin,xmax,ymin,ymax} = activeDrag?.bounds || cameraState.view);
  plotBounds = { xmin, xmax, ymin, ymax };
  const X = (x) => L + ((x - xmin) / (xmax - xmin)) * pw,
    Y = (y) => H - B - ((y - ymin) / (ymax - ymin)) * ph;
  let grid = "";
  const xticks = axisTicks(xmin, xmax), yticks = axisTicks(ymin, ymax);
  for (const x of xticks.values)
    grid += `<path d="M${X(x)} ${T}V${H - B}" class="gridline"/><text x="${X(x)}" y="${H - 12}" text-anchor="middle">${fmt(x, xticks.digits)}</text>`;
  for (const y of yticks.values)
    grid += `<path d="M${L} ${Y(y)}H${W - R}" class="gridline"/><text x="${L - 9}" y="${Y(y) + 4}" text-anchor="end">${fmt(y, yticks.digits)}</text>`;
  const line = (x1, y1, x2, y2, color = "teal", dash = false, arrow = false) =>
    `<line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" class="curve ${color}" ${arrow ? `marker-end="url(#arrow-${color})"` : ""} ${dash ? 'stroke-dasharray="7 5"' : ""}/>`;
  const point = (x, y, color = "teal", r = 5) =>
    `<circle cx="${X(x)}" cy="${Y(y)}" r="${r}" class="point ${color}"/>`;
  const path = (fn, color = "teal") => {
    let d = "";
    for (let i = 0; i <= 400; i++) {
      const x = xmin + ((xmax - xmin) * i) / 400;
      const y = fn(x);
      if (Number.isFinite(y))
        d += `${i ? "L" : "M"}${X(x).toFixed(2)},${Y(y).toFixed(2)} `;
    }
    return `<path d="${d}" class="curve ${color}"/>`;
  };
  const rect = (x, y, w, h, color = "teal") =>
    `<rect x="${X(x)}" y="${Y(y + h)}" width="${Math.max(0.1, (w * pw) / (xmax - xmin))}" height="${Math.max(0, (h * ph) / (ymax - ymin))}" class="bar ${color}"/>`;
  const handle = (x,y,id,label,color) => {
    const outside=x<xmin||x>xmax||y<ymin||y>ymax;
    return handleAt(Math.max(L,Math.min(W-R,X(x))),Math.max(T,Math.min(H-B,Y(y))),id,label+(outside?pair(' (hors cadre)',' (offscreen)'):''),color);
  };
  return `<svg viewBox="0 0 ${W} ${H}" role="group" aria-label="${esc(label)}"><title>${esc(label)}</title><defs>${["teal","orange","blue"].map(c => `<marker id="arrow-${c}" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0L6 3L0 6" class="curve ${c}"/></marker>`).join("")}<clipPath id="plot-clip"><rect x="${L}" y="${T}" width="${pw}" height="${ph}"/></clipPath></defs>${grid}<g clip-path="url(#plot-clip)">${xmin <= 0 && xmax >= 0 ? `<path d="M${X(0)} ${T}V${H - B}" class="axis"/>` : ""}${ymin <= 0 && ymax >= 0 ? `<path d="M${L} ${Y(0)}H${W - R}" class="axis"/>` : ""}${draw({ X, Y, line, point, path, rect, pw, ph })}</g><g class="handle-layer">${handles({ handle, line })}</g></svg>`;
}
function dataTable(headers, rows) {
  return `<table><caption>${pair("Valeurs du graphique (arrondies)", "Chart values (rounded)")}</caption><thead><tr>${headers.map(h => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map(row => `<tr>${row.map((v,i) => i === 0 ? `<th scope="row">${esc(v)}</th>` : `<td>${esc(v)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}
function metric(label, value) {
  return `<div><span>${label}</span><strong>${value}</strong></div>`;
}
function updateLab(animatedValues, moving = false) {
  const lab = labs.find((x) => x.id === currentLab),
    s = state(lab),
    v = animatedValues || s.values;
  if (!animatedValues) labMotion.remember(v);
  // Slider readouts keep the chosen values; graph results follow the animation.
  s.values.forEach((x, i) => {
    $(`#value-${i}`).textContent =
      fmt(x) + (lab.params[i][0] === "θ" ? "°" : "");
    $(`#param-${i}`).setAttribute(
      "aria-valuetext",
      fmt(x) + (lab.params[i][0] === "θ" ? "°" : ""),
    );
  });
  let data = "";
  let plot = "",
    results = "",
    caption = "",
    formula = lab.formula;
  if (lab.id === "quadratic") {
    const [a, b, c] = v,
      q = quadratic(a, b, c);
    // Conventional writing: omit zero terms and unit coefficients.
    const terms = [[a, "x²"], [b, "x"], [c, ""]].filter(([k]) => k !== 0)
      .map(([k, x], i) => `${k < 0 ? (i ? " − " : "−") : i ? " + " : ""}${Math.abs(k) === 1 && x ? "" : fmt(Math.abs(k))}${x}`);
    formula = `f(x) = ${terms.join("") || "0"}`;
    plot = chart({
      ymin: Math.min(-5, c, 4*a + 2*b + c) - 1,
      ymax: Math.max(7, c, 4*a + 2*b + c) + 1,
      label: pair(
        "Courbe de la fonction et racines réelles",
        "Function graph and real roots",
      ),
      draw: ({ path, point }) =>
        path((x) => a * x * x + b * x + c) +
        q.roots.map((x) => point(x, 0, "orange")).join("") +
        (q.vertex ? point(...q.vertex) : ""),
      handles: ({ handle }) => handle(0, c, "intercept", "C") + handle(2, 4*a + 2*b + c, "bend", "A"),
    });
    data = dataTable([pair("Objet", "Object"),"x","y"], [
      ...q.roots.map((x,i) => [pair("Racine", "Root") + " " + (i+1),fmt(x,6),"0"]),
      ...(q.vertex ? [[pair("Sommet", "Vertex"),fmt(q.vertex[0],6),fmt(q.vertex[1],6)]] : []),
      [pair("Ordonnée à l’origine", "Y-intercept"),"0",fmt(c)]
    ]);
    results =
      metric(
        pair("Racines réelles", "Real roots"),
        q.allReal
          ? "ℝ"
          : q.roots.length
            ? q.roots.map((x) => fmt(x)).join(" ; ")
            : pair("Aucune", "None"),
      ) +
      metric(
        q.kind === "quadratic" ? "Δ" : pair("Type", "Type"),
        q.kind === "quadratic"
          ? fmt(q.discriminant)
          : q.kind === "linear"
            ? pair("Affine", "Linear")
            : pair("Constante", "Constant"),
      ) +
      metric(
        pair("Sommet", "Vertex"),
        q.vertex ? `(${fmt(q.vertex[0])} ; ${fmt(q.vertex[1])})` : "—",
      );
    caption = pair(
      "x ∈ [−6 ; 6]. L’échelle reste fixe. Utilise les boutons de zoom et les flèches pour cadrer la courbe. Certaines racines ou le sommet peuvent être hors champ.",
      "x ∈ [−6, 6]. The scale stays fixed. Use zoom and pan controls to frame the curve. Some roots or the vertex may be outside the view.",
    );
  } else if (lab.id === "trig") {
    const figure = trigDiagram(v[0],s,t,fmt,handleAt);
    plotBounds = null;
    plot = figure.svg;
    formula = figure.formula;
    caption = figure.caption;
    data = `<table><caption>${pair("Valeurs exactes aux angles remarquables ; sinon valeurs approchées", "Exact values at remarkable angles; otherwise approximate values")}</caption><thead><tr><th scope="col">${pair("Grandeur", "Quantity")}</th><th scope="col">${pair("Valeur", "Value")}</th></tr></thead><tbody>${figure.rows.map(([k,val])=>`<tr><th scope="row">${esc(k)}</th><td>${esc(val)}</td></tr>`).join("")}</tbody></table>`;
    results = metric("cos x",figure.cos)+metric("sin x",figure.sin)+metric(pair("Angle en radians","Angle in radians"),figure.q.radians || "≈ "+fmt(v[0]*Math.PI/180));
    if ($("#remarkable-angle")) $("#remarkable-angle").value = [...$("#remarkable-angle").options].some(o=>o.value===String(v[0])) ? String(v[0]) : "";
  } else if (lab.id === "sequences") {
    const [first, step, n] = v,
      values = sequence(first, step, n, s.mode === "geometric"),
      lo = Math.min(0, ...values),
      hi = Math.max(1, ...values),
      pad = (hi - lo) * 0.12;
    plot = chart({
      xmin: -0.5,
      xmax: n - 0.5,
      ymin: lo - pad,
      ymax: hi + pad,
      label: pair(
        "Termes de la suite, indices de 0 à N − 1",
        "Sequence terms, indices 0 to N − 1",
      ),
      draw: ({ point }) => values.map((y, i) => point(i, y)).join(""),
      handles: ({ handle }) => handle(0, values[0], "first", "u₀") + handle(1, values[1], "second", "u₁", "orange"),
    });
    formula =
      s.mode === "geometric"
        ? step === 0 ? `u₀ = ${fmt(first)} ; uₙ = 0 (n ≥ 1)` : `uₙ = ${fmt(first)} × (${fmt(step)})ⁿ`
        : `uₙ = ${fmt(first)} + n × (${fmt(step)})`;
    data = dataTable(["n", "uₙ"], values.map((y,i) => [i,fmt(y)]));
    results =
      metric("u₀", fmt(first)) +
      metric("u" + String(n - 1).replace(/\d/g, d => "₀₁₂₃₄₅₆₇₈₉"[d]), fmt(values.at(-1))) +
      metric(
        pair("Somme des N termes", "Sum of N terms"),
        fmt(values.reduce((a, b) => a + b, 0)),
      );
    caption = pair(
      "N termes, à partir de u₀. Les points sont discrets ; l’échelle reste fixe ; les boutons permettent de cadrer la suite.",
      "N terms, starting at u₀. Points are discrete; the scale stays fixed; use the view controls to frame the sequence.",
    );
  } else if (lab.id === "probability") {
    const [n, p] = v,
      probs = binomial(n, p),
      freq = s.bins ? s.bins.map((x) => x / s.trials) : [],
      max = Math.max(...probs, ...freq, 0.1);
    plot = chart({
      xmin: -0.75,
      xmax: n + 0.75,
      ymin: 0,
      ymax: max * 1.18,
      label: pair(
        "Probabilités binomiales et fréquences simulées",
        "Binomial probabilities and simulated frequencies",
      ),
      draw: ({ rect }) =>
        probs
          .map(
            (y, k) =>
              rect(k - 0.32, 0, 0.3, y) +
              (s.bins ? rect(k + 0.02, 0, 0.3, freq[k], "orange") : ""),
          )
          .join(""),
      handles: ({ handle, line }) => line(n*p, 0, n*p, max*1.1, "blue", true) + handle(n*p, max*1.1, "expectation", "E", "blue"),
    });
    data = dataTable(["k", "P(X = k)", pair("Effectif simulé", "Simulated count"), pair("Fréquence", "Frequency")], probs.map((y,k) => [k,fmt(y,6),s.bins ? s.bins[k] : "—", s.trials ? fmt(freq[k],6) : "—"]));
    results =
      metric("E(X) = np", fmt(n * p)) +
      metric(
        pair("Écart-type théorique", "Theoretical standard deviation"),
        fmt(Math.sqrt(n * p * (1 - p))),
      ) +
      metric(
        pair("Expériences simulées", "Simulated experiments"),
        fmt(s.trials, 0),
      );
    caption = pair(
      "Vert : probabilité théorique. Orange : fréquence observée. Axe horizontal : nombre de succès.",
      "Green: theoretical probability. Orange: observed frequency. Horizontal axis: number of successes.",
    );
    $("#sim-status").textContent = s.trials
      ? pair(
          "Les expériences s’ajoutent. Changer n ou p remet la simulation à zéro.",
          "Experiments accumulate. Changing n or p resets the simulation.",
        )
      : pair(
          "Lance la simulation pour comparer.",
          "Run the simulation to compare.",
        );
  } else if (lab.id === "derivative") {
    const [x, magnitude] = v,
      h = magnitude * s.direction,
      m = squareSecant(x, h);
    plot = chart({
      xmin: -6,
      xmax: 5,
      ymin: -3,
      ymax: Math.max(12, (x + h) ** 2 + 2),
      label: pair(
        "Parabole, sécante et tangente",
        "Parabola, secant and tangent",
      ),
      draw: ({ path, point }) =>
        path((t) => t * t) +
        path((t) => x * x + m * (t - x), "orange") +
        path((t) => x * x + 2 * x * (t - x), "blue") +
        point(x, x * x) +
        point(x + h, (x + h) ** 2, "orange"),
      handles: ({ handle }) => handle(x, x*x, "base", "A") + handle(x+h, (x+h)**2, "nearby", "B", "orange"),
    });
    data = dataTable([pair("Point", "Point"),"x","y"], [["A",fmt(x),fmt(x*x)],["B",fmt(x+h),fmt((x+h)**2)]]);
    results =
      metric(pair("Pente de la sécante", "Secant slope"), fmt(m)) +
      metric(pair("Pente de la tangente", "Tangent slope"), fmt(2 * x)) +
      metric(pair("Écart des pentes", "Slope difference"), fmt(Math.abs(h)));
    caption = pair(
      "Trait plein : f(x) = x². Tirets orange : sécante. Pointillés bleus : tangente. Change le côté d’approche : h = " + fmt(h) + ". La dérivée en un point intérieur exige une limite des deux côtés.",
      "Solid: f(x) = x². Orange dashes: secant. Blue dots: tangent. Switch approach sides: h = " + fmt(h) + ". At an interior point, differentiability requires a two-sided limit.",
    );
  } else if (lab.id === "integral") {
    const n = v[0],
      area = riemann(n, s.method),
      offset = s.method === "right" ? 1 : s.method === "midpoint" ? 0.5 : 0;
    plot = chart({
      xmin: 0,
      xmax: 1.05,
      ymin: 0,
      ymax: 1.15,
      label: pair(
        "Rectangles d’approximation pour x² entre 0 et 1",
        "Approximation rectangles for x² between 0 and 1",
      ),
      draw: ({ rect, path }) =>
        Array.from({ length: n }, (_, i) =>
          rect(i / n, 0, 1 / n, ((i + offset) / n) ** 2),
        ).join("") + path((x) => x * x, "orange"),
      handles: ({ handle, line }) => line(1/n, 0, 1/n, 0.12, "blue", true) + handle(1/n, 0.12, "partition", "S", "blue"),
    });
    results =
      metric(pair("Somme des rectangles", "Rectangle sum"), fmt(area, 5)) +
      metric(pair("Aire exacte", "Exact area"), "1/3 ≈ " + fmt(1 / 3, 5)) +
      metric(pair("Erreur absolue", "Absolute error"), fmt(Math.abs(1 / 3 - area), 5));
    caption = pair(
      "x² est croissante : somme à gauche ≤ aire ≤ somme à droite. Le milieu donne ici une approximation par défaut plus précise. L’encadrement gauche/droite a une largeur 1/N.",
      "x² is increasing: left sum ≤ area ≤ right sum. Midpoints give a more accurate lower estimate here. The left/right bound has width 1/N.",
    );
    data = dataTable([pair("Méthode", "Method"),pair("Somme", "Sum")], [[pair("Gauche", "Left"),fmt(riemann(n),6)],[pair("Droite", "Right"),fmt(riemann(n,"right"),6)],[pair("Milieu", "Midpoint"),fmt(riemann(n,"midpoint"),6)],[pair("Aire exacte", "Exact area"),"1/3"]]);
  } else if (lab.id === "vectors") {
    const [a, b, c, d] = v,
      norms = Math.hypot(a, b) * Math.hypot(c, d),
      dot = a * c + b * d,
      angle = norms
        ? (Math.acos(Math.max(-1, Math.min(1, dot / norms))) * 180) / Math.PI
        : null;
    plot = chart({
      ...fitBounds([a, c, a + c], [b, d, b + d]),
      equal: true,
      label: pair("Vecteurs u, v et leur somme", "Vectors u, v and their sum"),
      draw: ({ line, point }) =>
        line(0, 0, a, b, "teal", false, true) +
        line(0, 0, c, d, "orange", false, true) +
        line(a, b, a + c, b + d, "orange", true) +
        line(c, d, a + c, b + d, "teal", true) +
        line(0, 0, a + c, b + d, "blue", false, true) +
        point(a, b) +
        point(c, d, "orange") +
        point(a + c, b + d, "blue"),
      handles: ({ handle }) => handle(a, b, "u", "u") + handle(c, d, "v", "v", "orange"),
    });
    data = dataTable([pair("Vecteur", "Vector"),"x","y"], [["u",fmt(a),fmt(b)],["v",fmt(c),fmt(d)],["u + v",fmt(a+c),fmt(b+d)]]);
    results =
      metric("u + v", `(${fmt(a + c)} ; ${fmt(b + d)})`) +
      metric("u · v", fmt(dot)) +
      metric(
        pair("Angle entre u et v", "Angle between u and v"),
        angle === null
          ? pair("Indéfini (vecteur nul)", "Undefined (zero vector)")
          : fmt(angle, 1) + "°",
      );
    caption = pair(
      "Vert : u. Orange : v. Bleu : u + v. Les deux axes utilisent la même échelle.",
      "Green: u. Orange: v. Blue: u + v. Both axes use the same scale.",
    );
  } else if (lab.id === "statistics") {
    try {
      const values = parseData(s.data),
        stats = statistics(values),
        range = stats.max > stats.min ? stats.max - stats.min : Math.max(1, Math.abs(stats.mean) * 0.1),
        counts = {};
      values.forEach((x) => (counts[x] = (counts[x] || 0) + 1));
      const maxCount = Math.max(...Object.values(counts));
      plot = chart({
        xmin: stats.min - range * 0.15,
        xmax: stats.max + range * 0.15,
        ymin: 0,
        ymax: maxCount + 1,
        label: pair("Diagramme de points des données", "Dot plot of the data"),
        draw: ({ point, line }) =>
          Object.entries(counts)
            .map(([x, n]) =>
              Array.from({ length: n }, (_, i) => point(+x, i + 1)).join(""),
            )
            .join("") +
          line(stats.mean, 0, stats.mean, maxCount + 0.5, "orange", true) +
          line(stats.median, 0, stats.median, maxCount + 0.5, "blue", true),
        handles: ({ handle }) => {
          const seen = {};
          return values.map((x, i) => handle(x, seen[x] = (seen[x] || 0) + 1, `data-${i}`, `D${i+1}`)).join("");
        },
      });
      data = dataTable([pair("Valeur", "Value"),pair("Effectif", "Count")], Object.entries(counts).sort((a,b) => +a[0]-+b[0]).map(([x,n]) => [fmt(+x,6),n]));
      results =
        metric(pair("Moyenne", "Mean"), fmt(stats.mean)) +
        metric(pair("Médiane", "Median"), fmt(stats.median)) +
        metric(
          pair("Écart-type (population)", "Standard deviation (population)"),
          fmt(stats.sd),
        );
      caption = pair(
        "Un point par observation. Orange : moyenne. Bleu : médiane. Écart-type avec division par n.",
        "One dot per observation. Orange: mean. Blue: median. Standard deviation divides by n.",
      );
      $("#data-error").textContent = "";
      $("#data-input").removeAttribute("aria-invalid");
    } catch {
      $("#data-error").textContent = pair(
        "Saisis de 1 à 100 nombres valides entre −10 000 et 10 000. Sépare-les par des espaces ou des points-virgules.",
        "Enter 1–100 valid numbers between −10,000 and 10,000. Separate them with spaces or semicolons.",
      );
      $("#data-input").setAttribute("aria-invalid", "true");
      plot = `<div class="plot-empty">${pair("Ajoute des données valides pour afficher le graphique.", "Add valid data to display the chart.")}</div>`;
      results = metric(pair("Données", "Data"), "—");
    }
  } else if (lab.id === "complex") {
    const [a, b] = v;
    plot = chart({
      ...fitBounds([a, -b], [b, a]),
      equal: true,
      label: pair(
        "Nombres complexes z et iz dans le plan",
        "Complex numbers z and iz in the plane",
      ),
      draw: ({ line, point }) =>
        line(0, 0, a, b, "teal", false, true) +
        line(0, 0, -b, a, "orange") +
        point(a, b) +
        point(-b, a, "orange"),
      handles: ({ handle }) => handle(a, b, "z", "z"),
    });
    data = dataTable([pair("Nombre", "Number"),pair("Partie réelle", "Real part"),pair("Partie imaginaire", "Imaginary part")], [["z",fmt(a),fmt(b)],["iz",fmt(-b),fmt(a)]]);
    results =
      metric("z", algebraic(a, b)) +
      metric("iz", algebraic(-b, a)) +
      metric("|z|", fmt(Math.hypot(a, b)));
    caption = pair(
      "Vert : z. Orange : iz. La multiplication par i donne une rotation de 90° ; les axes ont la même échelle.",
      "Green: z. Orange: iz. Multiplication by i gives a 90° rotation; both axes use the same scale.",
    );
  }
  $("#chart-data").innerHTML = data || `<p>${pair("Les trois résultats numériques ci-dessous décrivent cette figure. La légende précise les objets représentés.", "The three numerical results below describe this figure. The caption identifies the objects shown.")}</p>`;
  updatePlot(plot);
  $("#results").setAttribute("aria-busy", String(moving || !!activeDrag));
  $("#results").innerHTML = results;
  $("#plot-caption").textContent = caption;
  $("#formula").textContent = formula;
}
function updatePlot(markup) {
  const container = $("#plot");
  const template = document.createElement("template");
  template.innerHTML = markup;
  const focusedHandle = container.contains(document.activeElement) ? document.activeElement.dataset.handle : null;
  const old = container.firstElementChild;
  const next = template.content.firstElementChild;
  // Reuse the SVG while dragging, avoiding DOM replacement/flicker. If a
  // model changes topology (roots, bars, ticks), replace only that subtree.
  function sync(a, b) {
    if (a.nodeType !== b.nodeType || a.nodeName !== b.nodeName) {
      a.replaceWith(b.cloneNode(true));
      return;
    }
    if (a.nodeType === Node.TEXT_NODE) {
      if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue;
      return;
    }
    for (const attr of [...a.attributes]) if (!b.hasAttribute(attr.name)) a.removeAttribute(attr.name);
    for (const attr of b.attributes) if (a.getAttribute(attr.name) !== attr.value) a.setAttribute(attr.name, attr.value);
    if (a.childNodes.length !== b.childNodes.length) {
      a.replaceChildren(...[...b.childNodes].map(node => node.cloneNode(true)));
    } else {
      [...a.childNodes].forEach((node, i) => sync(node, b.childNodes[i]));
    }
  }
  if (old && next) sync(old, next);
  else container.replaceChildren(...template.content.childNodes);
  if (focusedHandle && !container.contains(document.activeElement)) $(`[data-handle="${focusedHandle}"]`, container)?.focus({ preventScroll: true });
}
function bindPlot(lab, s) {
  const plot = $("#plot");
  let pendingPoint = null;
  let dragFrame = null;
  const svgPosition = e => {
    const svg = $("svg", plot), matrix = svg?.getScreenCTM();
    if (!matrix) return null;
    return new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse());
  };
  if (lab.id !== "trig") {
    const zoom = (factor, anchor) => {
      labMotion.settle(); const b=s.view, c=anchor || {x:(b.xmin+b.xmax)/2,y:(b.ymin+b.ymax)/2};
      const xspan=b.xmax-b.xmin, k=Math.max(1e-4,Math.min(1e7,xspan*factor))/xspan;
      s.view={xmin:c.x+(b.xmin-c.x)*k,xmax:c.x+(b.xmax-c.x)*k,ymin:c.y+(b.ymin-c.y)*k,ymax:c.y+(b.ymax-c.y)*k};updateLab();bar.update((s.homeView.xmax-s.homeView.xmin)/(s.view.xmax-s.view.xmin));
    };
    const action=id=>{if(id==='in'||id==='out'){zoom(id==='in'?.8:1.25);return;}if(id==='reset')s.view={...s.homeView};else{const b=s.view,d={left:[-1,0],right:[1,0],up:[0,1],down:[0,-1]}[id],dx=d[0]*(b.xmax-b.xmin)*.15,dy=d[1]*(b.ymax-b.ymin)*.15;s.view={xmin:b.xmin+dx,xmax:b.xmax+dx,ymin:b.ymin+dy,ymax:b.ymax+dy};}updateLab();bar.update((s.homeView.xmax-s.homeView.xmin)/(s.view.xmax-s.view.xmin));};
    const bar=navigationButtons($("#plot-navigation"),action,lang);
    const fit=document.createElement('button');fit.type='button';fit.textContent=pair('Cadrer les objets','Fit objects');fit.className='text-button';fit.addEventListener('click',()=>{s.homeView=null;s.view=null;updateLab();bar.update(1);});$('#plot-navigation').append(fit);

    plot.addEventListener('wheel',e=>{if(!(e.ctrlKey||e.metaKey))return;const p=svgPosition(e);if(!p)return;e.preventDefault();zoom(Math.exp(e.deltaY*.004),graphPosition(p,s.view));},{passive:false});
    const touches=new Map();let pinch=null,pan=null;
    plot.addEventListener('pointerdown',e=>{
      if(e.pointerType==='touch')touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(touches.size===2){const a=[...touches.values()];pinch={distance:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)};activeDrag=null;plot.classList.remove('dragging');}
      if(pinch||e.altKey||e.shiftKey||e.button===1){if(!pinch)pan={point:svgPosition(e),bounds:{...s.view}};plot.setPointerCapture(e.pointerId);e.preventDefault();e.stopImmediatePropagation();}
    },true);
    plot.addEventListener('pointermove',e=>{
      if(touches.has(e.pointerId))touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(pinch&&touches.size===2){const a=[...touches.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);zoom(pinch.distance/Math.max(1,d));pinch.distance=d;e.preventDefault();e.stopImmediatePropagation();}
      else if(pan){const p=svgPosition(e),b=pan.bounds,dx=(p.x-pan.point.x)/650*(b.xmax-b.xmin),dy=(p.y-pan.point.y)/292*(b.ymax-b.ymin);s.view={xmin:b.xmin-dx,xmax:b.xmax-dx,ymin:b.ymin+dy,ymax:b.ymax+dy};updateLab();e.preventDefault();e.stopImmediatePropagation();}
    },true);
    const endView=e=>{touches.delete(e.pointerId);if(touches.size<2)pinch=null;pan=null;};for(const ev of ['pointerup','pointercancel','lostpointercapture'])plot.addEventListener(ev,endView,true);
    plot.addEventListener('keydown',e=>{if(e.target.closest('[data-handle]'))return;if(['+','=','-','0'].includes(e.key)){e.preventDefault();action(e.key==='0'?'reset':e.key==='-'?'out':'in');}});plot.tabIndex=0;
  }
  const modelPosition = (point, bounds) => lab.id === "trig"
    ? { x: (point.x - 185) / 115, y: (171 - point.y) / 115 }
    : graphPosition(point, bounds);
  const anchorPosition = handle => {
    const v = s.values;
    if (lab.id === "quadratic") return { x: handle === "bend" ? 2 : 0, y: handle === "bend" ? 4*v[0]+2*v[1]+v[2] : v[2] };
    if (lab.id === "sequences") return { x: handle === "first" ? 0 : 1, y: handle === "first" ? v[0] : s.mode === "geometric" ? v[0]*v[1] : v[0]+v[1] };
    if (lab.id === "probability") return { x: v[0]*v[1], y: 0 };
    if (lab.id === "derivative") { const x = handle === "base" ? v[0] : v[0]+v[1]*s.direction; return { x, y: x*x }; }
    if (lab.id === "vectors") { const i = handle === "u" ? 0 : 2; return { x: v[i], y: v[i+1] }; }
    if (lab.id === "complex") return { x: v[0], y: v[1] };
    if (lab.id === "statistics") return { x: parseData(s.data)[+handle.slice(5)], y: 0 };
    return null;
  };
  const apply = (handle, position) => {
    labMotion.reset();
    if (lab.id === "statistics") {
      const values = parseData(s.data), index = +handle.slice(5);
      values[index] = Math.max(-10000, Math.min(10000, Number(position.x.toPrecision(8))));
      s.data = values.join(" ");
      $("#data-input").value = s.data;
    } else {
      const result = manipulate(lab.id, handle, s.values, position, s.mode, s.direction);
      const next = result.values.map((value, i) => snapParameter(value, lab.params[i]) ?? s.values[i]);
      if (next.some((value, i) => value !== s.values[i])) { s.bins = null; s.trials = 0; }
      s.values = next;
      s.direction = result.direction;
      document.querySelectorAll('[name="direction"]').forEach(input => { input.checked = +input.value === s.direction; });
      s.values.forEach((value, i) => { $(`#param-${i}`).value = value; });
    }
    updateLab();
  };
  plot.addEventListener("pointerdown", e => {
    if (e.button !== 0 || activeDrag || !e.target.closest("[data-handle]")) return;
    labMotion.settle();
    const point = svgPosition(e);
    if (!point) return;
    // Overlapping touch targets choose the closest visible point.
    const handle = [...plot.querySelectorAll("[data-handle]")].sort((a, b) =>
      Math.hypot(+a.dataset.x-point.x, +a.dataset.y-point.y) - Math.hypot(+b.dataset.x-point.x, +b.dataset.y-point.y))[0];
    e.preventDefault();
    handle.focus({ preventScroll: true });
    const origin = modelPosition(point, plotBounds);
    const displayed = modelPosition({ x: +handle.dataset.x, y: +handle.dataset.y }, plotBounds);
    const offset = { x: displayed.x - origin.x, y: displayed.y - origin.y };
    const anchor = anchorPosition(handle.dataset.handle);
    if (anchor) { offset.x = anchor.x - origin.x; offset.y = anchor.y - origin.y; }
    activeDrag = { id: e.pointerId, handle: handle.dataset.handle, bounds: plotBounds && { ...plotBounds }, offset };
    plot.classList.add("dragging");
    plot.setPointerCapture(e.pointerId);
  });
  const paintDrag = () => {
    dragFrame = null;
    if (!activeDrag || !pendingPoint || !plot.isConnected) return;
    const position = modelPosition(pendingPoint, activeDrag.bounds);
    pendingPoint = null;
    // An angle is absolute around the circle; other handles retain grab offset.
    if (lab.id !== "trig") { position.x += activeDrag.offset.x; position.y += activeDrag.offset.y; }
    apply(activeDrag.handle, position);
  };
  plot.addEventListener("pointermove", e => {
    if (!activeDrag || activeDrag.id !== e.pointerId) return;
    pendingPoint = svgPosition(e);
    if (pendingPoint && dragFrame === null) dragFrame = requestAnimationFrame(paintDrag);
  });
  const finish = e => {
    if (!activeDrag || activeDrag.id !== e.pointerId) return;
    if (dragFrame !== null) cancelAnimationFrame(dragFrame);
    paintDrag();
    activeDrag = null;
    plot.classList.remove("dragging");
    if (plot.hasPointerCapture(e.pointerId)) plot.releasePointerCapture(e.pointerId);
    updateLab();
  };
  for (const event of ["pointerup", "pointercancel", "lostpointercapture"]) plot.addEventListener(event, finish);
  plot.addEventListener("keydown", e => {
    const handle = e.target.closest("[data-handle]");
    if (!handle || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    e.preventDefault();
    labMotion.settle();
    const id = handle.dataset.handle;
    const sign = ["ArrowRight", "ArrowUp"].includes(e.key) ? 1 : -1;
    const speed = e.shiftKey ? 10 : 1;
    if (lab.id === "trig") {
      const angle = (s.values[0] + sign*speed + 360) % 360;
      apply(id, { x: Math.cos(angle*Math.PI/180), y: Math.sin(angle*Math.PI/180) });
      return;
    }
    if (lab.id === "integral") {
      const change = e.key === "ArrowLeft" ? 1 : e.key === "ArrowRight" ? -1 : sign;
      const n = snapParameter(s.values[0] + change*speed, lab.params[0]);
      apply(id, { x: 1/n, y: 0 });
      return;
    }
    let position = anchorPosition(id) || graphPosition({ x: +handle.dataset.x, y: +handle.dataset.y }, plotBounds);
    const horizontal = ["ArrowLeft", "ArrowRight"].includes(e.key);
    let step = .25;
    if (lab.id === "quadratic") {
      position.y = id === "bend" ? 4*s.values[0] + 2*s.values[1] + s.values[2] : s.values[2];
      step = id === "bend" ? 1 : .5;
    } else if (lab.id === "sequences") step = id === "first" ? 1 : s.mode === "geometric" ? .25*s.values[0] : .25;
    else if (lab.id === "probability") step = .05*s.values[0];
    else if (lab.id === "derivative") step = id === "base" ? .25 : .01;
    else if (lab.id === "vectors") step = .5;
    else if (lab.id === "statistics") step = (plotBounds.xmax-plotBounds.xmin)/100;
    const verticalOnly = ["quadratic", "sequences"].includes(lab.id);
    const horizontalOnly = ["probability", "derivative", "statistics"].includes(lab.id);
    position[verticalOnly ? "y" : horizontalOnly || horizontal ? "x" : "y"] += sign*step*speed;
    // Skip the undefined B = A position when taking the smallest keyboard step.
    if (lab.id === "derivative" && id === "nearby" && Math.abs(position.x-s.values[0]) < 1e-9)
      position.x += sign*step;
    apply(id, position);
  });
}
function bindTrigonometry(s) {
  document.querySelectorAll('[data-trig-view]').forEach(button=>button.addEventListener('click',()=>{
    s.trigView=button.dataset.trigView;
    render();
    $(`[data-trig-view="${s.trigView}"]`).focus();
  }));
  $('#remarkable-angle')?.addEventListener('change',e=>{
    if(e.target.value==='')return;
    labMotion.reset();
    s.values[0]=+e.target.value;
    $('#param-0').value=s.values[0];
    updateLab();
  });
  $('#trig-relation')?.addEventListener('change',e=>{s.trigRelation=e.target.value;updateLab();});
  $('#trig-graph-relation')?.addEventListener('change',e=>{s.trigGraphRelation=e.target.value;updateLab();});
  $('#trig-function')?.addEventListener('change',e=>{s.trigFunction=e.target.value;updateLab();});
  const play=$('#trig-play');
  if(!play)return;
  let frame=null,last=null,angle=s.values[0];
  const pause=()=>{
    if(frame!==null)cancelAnimationFrame(frame);
    frame=null;last=null;
    play.textContent=pair('Lire le mouvement','Play the motion');
    play.setAttribute('aria-pressed','false');
    $('#results')?.setAttribute('aria-live','polite');
  };
  const tick=now=>{
    if(document.hidden||reducedMotion()){pause();return;}
    if(last!==null)angle=(angle+Math.min(now-last,100)*.03)%360;
    last=now;
    s.values[0]=Math.round(angle);
    $('#param-0').value=s.values[0];
    updateLab([angle],true);
    frame=requestAnimationFrame(tick);
  };
  play.addEventListener('click',()=>{
    if(frame!==null){pause();updateLab();return;}
    if(reducedMotion()){
      s.values[0]=(s.values[0]+30)%360;
      $('#param-0').value=s.values[0];
      updateLab();return;
    }
    labMotion.reset();angle=s.values[0];
    play.textContent=pair('Pause','Pause');play.setAttribute('aria-pressed','true');
    $('#results').setAttribute('aria-live','off');
    frame=requestAnimationFrame(tick);
  });
  $('#param-0').addEventListener('input',pause);
  $('#plot').addEventListener('pointerdown',pause);
  $('#plot').addEventListener('keydown',pause);
  const visibility=()=>{if(document.hidden)pause();};
  document.addEventListener('visibilitychange',visibility);
  motionPreference.addEventListener?.('change',pause);
  stopTrig=()=>{pause();document.removeEventListener('visibilitychange',visibility);motionPreference.removeEventListener?.('change',pause);};
}
function bindLab() {
  const lab = labs.find((x) => x.id === currentLab),
    s = state(lab);
  if ($("#plot")) bindPlot(lab, s);
  if (lab.id === "trig") bindTrigonometry(s);
  $("#lab-picker")?.addEventListener("change", e => { location.hash = link(route().page === "gallery" ? "gallery" : "lab", e.target.value); });
  document.querySelectorAll("[data-param]").forEach((input) =>
    input.addEventListener("input", () => {
      s.values[+input.dataset.param] = +input.value;
      s.bins = null;
      s.trials = 0;
      labMotion.move(s.values, lab.params);
    }),
  );
  document.querySelectorAll("[data-param]").forEach(input => input.addEventListener("change", () => labMotion.settle()));
  document.querySelectorAll("[data-note]").forEach(input => input.addEventListener("input", () => { s[input.dataset.note] = input.value; }));
  for (const name of ["direction", "method"]) document.querySelectorAll(`[name="${name}"]`).forEach(input => input.addEventListener("change", () => { s[name] = name === "direction" ? +input.value : input.value; updateLab(); }));
  $("#quiz-preset")?.addEventListener("click", () => {
    Object.assign(s, lab.quizState, { bins: null, trials: 0 });
    if (lab.quizState.values) s.values = [...lab.quizState.values];
    render();
    $("#quiz-preset").focus();
  });
  $("#reset")?.addEventListener("click", () => {
    const notes = { observation: s.observation, conjecture: s.conjecture };
    delete states[lab.id];
    Object.assign(state(lab), notes);
    render();
    $("#reset").focus();
  });
  document.querySelectorAll('[name="mode"]').forEach((input) =>
    input.addEventListener("change", () => {
      s.mode = input.value;
      updateLab();
    }),
  );
  $("#data-input")?.addEventListener("input", (e) => {
    s.data = e.target.value;
    updateLab();
  });
  document.querySelectorAll("[data-sim]").forEach((b) =>
    b.addEventListener("click", () => {
      const count = +b.dataset.sim, [n, p] = s.values, bins = Array(n + 1).fill(0), tray = [];
      // each experiment is n trials: the last few are shown as rows of coins (filled = success) so the counts have a visible origin
      for (let i = 0; i < count; i++) { const row = Array.from({ length: n }, () => Math.random() < p); bins[row.filter(Boolean).length]++; if (i >= count - 8) tray.push(row); }
      const host = $("#sim-tray");
      if (host) host.innerHTML = tray.map((row) => `<div class="sim-row">${row.map((x) => `<span class="coin${x ? " on" : ""}"></span>`).join("")}<b>${row.filter(Boolean).length}</b></div>`).join("");
      s.bins = bins.map((x, i) => x + (s.bins?.[i] || 0));
      s.trials += count;
      updateLab();
    }),
  );
  $("#quiz-answer")?.addEventListener(
    "input",
    (e) => (s.answer = e.target.value),
  );
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
          "Pas encore. Utilise le bouton pour régler l’expérience sur cette question. Compare les valeurs et l’argument. Tu peux écrire une fraction, comme 1/3.",
          "Not yet. Use the button to set the experiment for this question. Compare the values and the argument. You can enter a fraction, such as 1/3.",
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
// Hints that carry a button acting on the experiment: { challenge id: { hint index: [action, French label, English label] } }.
// The activity listens for the "challenge-action" event, so the button can sit in the hint panel, away from the board.
const HINT_ACTIONS = {
  chess: { 0: ["colour", "Colorier les cases", "Colour the squares", true] },
  box: { 0: ["net", "Mettre deux faces à plat", "Lay two faces flat"], 1: ["line", "Tracer le segment droit", "Draw the straight segment"] },
  cake: { 0: ["top", "Voir le gâteau de dessus, avec le centre", "Show the top view, with the centre"], 1: ["grid", "Poser la grille", "Place the grid"] },
  reflect: { 1: ["mirror", "Montrer B′, le symétrique de B", "Show B′, the mirror image of B", true] },
  queens: { 1: ["peek", "Poser une dame d’un bon placement", "Place one queen of a good placement"] },
  fakecoins: { 1: ["fill", "Remplir 1, 2, 3, …", "Fill in 1, 2, 3, …"] },
  merge: { 1: ["invariant", "Afficher le produit des (nombre + 1)", "Show the product of the (number + 1)"] },
  cham: { 0: ["diff", "Afficher r − v, v − b, b − r", "Show r − v, v − b, b − r"], 1: ["mod", "Afficher ces différences modulo 3", "Show these differences modulo 3"] },
  doors: { 0: ["divisors", "Écrire le nombre de diviseurs sur chaque porte", "Write the number of divisors on each door"] },
  pigeonhole: { 0: ["remainders", "Colorier chaque nombre selon son reste", "Colour each number by its remainder"] },
  konigsberg: { 0: ["degrees", "Afficher le nombre de ponts de chaque quartier", "Show the number of bridges at each district"] },
  gridpaths: { 1: ["counts", "Afficher le nombre de chemins en chaque point", "Show the number of paths at every point"] },
  artgallery: { 0: ["triangulate", "Découper la galerie en triangles", "Cut the gallery into triangles"], 1: ["colour", "Colorier les sommets avec trois couleurs", "Colour the vertices with three colours"] },
  inversions: { 0: ["counter", "Afficher le compteur d’inversions", "Show the inversion counter"] },
};
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
    : `<fieldset class="var-choice"><legend>${t(prm.label)}</legend>${prm.options.map(([val, fr, en]) => `<label><input type="radio" name="var-${prm.id}" data-var="${prm.id}" value="${val}" ${String(q[prm.id]) === String(val) ? "checked" : ""}> ${pair(fr, en)}</label>`).join("")}</fieldset>`).join("");
  return `<section class="variation" aria-labelledby="variation-title"><div class="variation-head"><h2 id="variation-title">${pair("Change les données", "Change the data")}</h2><span class="variation-actions"><button class="secondary" id="var-random" type="button">${pair("Au hasard", "Surprise me")}</button><button class="text-button" id="var-reset" type="button">${pair("Valeurs d’origine", "Original values")}</button></span></div><p class="muted">${pair("Le problème, la solution et l’expérience suivent tes réglages.", "The problem, the solution and the experiment follow your settings.")}</p><div class="var-controls">${controls}</div></section>`;
}
function challengeDetail(c) {
  const v = variantText(c, paramsOf(c.id));
  return `<main id="main" class="page challenge-detail" tabindex="-1"><a class="backlink" href="#challenges">${pair("Tous les défis", "All challenges")}</a><div class="challenge-columns"><article><span class="section-kicker">${t(c.topic)} · ${c.minutes} min</span><h1>${t(c.title)}</h1>${v.original ? `<span class="section-kicker check-kicker">${pair("Énoncé et version vérifiable ici", "Statement and the version checked here")}</span>` : ""}<p class="problem" id="problem">${t(v.prompt)}</p>${v.original ? `<section class="original" aria-labelledby="original-title"><span class="section-kicker" id="original-title">${pair("Question d’origine · à traiter seul ou avec un enseignant, le site ne peut pas la vérifier", "Original question · to work out alone or with a teacher, the site cannot check it")}</span><p class="problem original-q" id="original">${t(v.original)}</p></section>` : ""}${variationPanel(c)}${hasActivity(c.id) ? `<section class="activity" aria-labelledby="activity-title"><h2 id="activity-title">${pair("À toi d’explorer", "Explore it yourself")}</h2><div id="activity" data-activity="${c.id}"></div></section>` : ""}<form id="challenge-form" data-id="${c.id}"><label for="challenge-answer">${pair("Ta réponse numérique", "Your numerical answer")}</label><div class="answer-row"><input type="text" id="challenge-answer" inputmode="text" required autocomplete="off" placeholder="${pair("Nombre ou fraction", "Number or fraction")}"><button class="primary">${pair("Vérifier", "Check")}</button></div><p id="challenge-feedback" class="feedback" role="status">${completed.has(c.id) ? pair("Tu as déjà trouvé cette réponse. Essaie maintenant de rédiger la preuve.", "You have already found this answer. Now try writing the proof.") : ""}</p></form></article><aside class="hint-panel"><h2>${pair("Un coup de pouce ?", "A little nudge?")}</h2>${v.hints.map((h, i) => `<details><summary>${pair("Indice", "Hint")} ${i + 1}</summary><p data-hint="${i}">${t(h)}</p>${hintAction(c.id, i)}</details>`).join("")}</aside></div><section class="solution-wide"><details class="solution"><summary>${pair("Voir la solution expliquée", "See the worked solution")}</summary>${hasSolution(c.id) ? `<div id="solution-anim" class="sol-host" data-solution="${c.id}"></div>` : ""}<p id="solution-text">${t(v.solution)}</p><div class="extension"><strong>${pair("Pour aller plus loin", "Take it further")}</strong><p>${t(c.extension)}</p></div></details></section></main>`;
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
      document.querySelectorAll("[data-var]").forEach((el) => { if (el.type === "radio") el.checked = String(q[el.dataset.var]) === el.value; else { el.value = q[el.dataset.var]; const o = $(`[data-out="${el.dataset.var}"]`); if (o) o.textContent = q[el.dataset.var]; } });
    };
    const read = () => { const q = {}; document.querySelectorAll("[data-var]").forEach((el) => { if (el.type !== "radio" || el.checked) q[el.dataset.var] = el.value; }); variantState[cid] = normaliseVariant(cid, q); };
    document.querySelectorAll("[data-var]").forEach((el) => {
      el.addEventListener("input", () => { const o = $(`[data-out="${el.dataset.var}"]`); if (o && el.type !== "radio") o.textContent = el.value; });
      el.addEventListener("change", () => { read(); refresh(); });
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
  return `${stages}<a class="source-link" href="${x.source}" target="_blank" rel="noopener noreferrer">${t(x.sourceName)} <span class="sr-only">${pair("(nouvel onglet)", "(new tab)")}</span></a>`;
}
function pathwayPage() {
  return `<main id="main" class="page" tabindex="-1"><h1>${pair("Les mêmes idées, plusieurs parcours.", "Shared ideas, different pathways.")}</h1><p class="page-intro">${pair("Pars de ton programme ou suis simplement ta curiosité. Chaque expérience précise ses prérequis.", "Start with your curriculum or simply follow your curiosity. Each experiment lists its prerequisites.")}</p><div class="pathway-grid">${pathways.map((p) => `<section class="pathway-card${p.programmes ? " has-programmes" : ""}"><div class="pathway-label">${p.icon ? icon(p.icon, 28) : p.label}</div><h2>${t(p.name)}</h2><p>${t(p.intro)}</p>${p.programmes ? `<div class="programmes">${p.programmes.map((x) => `<div class="programme"><h3 class="programme-title">${t(x.name)}</h3><p>${t(x.intro)}</p>${pathwayBlock(x, "h4")}</div>`).join("")}</div>` : pathwayBlock(p, "h3")}</section>`).join("")}</div><section class="curriculum-note"><h2>${pair("À propos de ces repères", "About these pathways")}</h2><p>${pair("Ce laboratoire est une sélection d’explorations, pas un programme exhaustif ni une certification d’alignement. Les placements sont pédagogiques et indicatifs ; vérifie la série, l’option et l’année avec ton enseignant. Les références ont été consultées en octobre 2026.", "This laboratory is a selection of explorations, not a complete syllabus or a certification of alignment. Placements are pedagogical suggestions; check your stream, option and year with your teacher. References were consulted in October 2026.")}</p><p>${pair("France : nouveaux programmes de seconde et première en 2026–2027, de terminale en 2027–2028. IB : première mise en œuvre en août 2027, première évaluation en mai 2029. Madagascar : références S/OSE/L datées de 2024–2025 ; l’application actuelle reste à confirmer.", "France: new seconde and première programmes in 2026–2027, terminale in 2027–2028. IB: first teaching August 2027, first assessment May 2029. Madagascar: S/OSE/L references date from 2024–2025; current applicability needs confirmation.")}</p><p>${pair("Les repères historiques renvoient aux notices du MacTutor History of Mathematics Archive de l’université de St Andrews. Le laboratoire conserve la langue et les réponses réussies dans ce navigateur ; les notes restent en mémoire pendant la session. Il n’envoie ni réponses ni notes et n’intègre aucun outil d’analyse. Ouvrir une source externe te conduit sur un autre site ; l’hébergeur gère l’accès privé.", "History boxes link to the University of St Andrews MacTutor History of Mathematics Archive. The laboratory keeps language and completed answers in this browser; notes stay in session memory. It sends no answers or notes and includes no analytics. Opening an external source takes you to another website; the host manages private access.")}</p></section></main>`;
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
