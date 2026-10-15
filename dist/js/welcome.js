// The welcome page and the gallery index. Neutral on purpose: nothing here assumes a school programme, which lives under
// "Cours" and "Parcours". The drawings are live canvases mounted by app.js (data-art) with home-art.js.
const WONDERS = ["fourier", "mandelbrot", "galton", "chaos", "platonic", "reuleaux"];

const card = (l, href, t, pair, link) => `<a class="wonder" href="${link(href, l.id)}"><canvas data-art="${l.id}" role="img" aria-label="${t(l.title)}"></canvas><span class="wonder-body"><strong>${t(l.title)}</strong><span>${t(l.intro)}</span><span class="wonder-go">${pair("Entrer", "Enter")} →</span></span></a>`;

export function homePage({ pair, t, link, labs }) {
  const wonders = WONDERS.map((id) => labs.find((l) => l.id === id)).filter(Boolean);
  return `<main id="main" class="welcome" tabindex="-1">
  <section class="welcome-hero">
    <div class="welcome-text">
      <p class="welcome-greet"><span lang="mg">Tonga soa</span> · ${pair("Bienvenue", "Welcome")}</p>
      <h1>${pair("Les mathématiques, à voir et à toucher.", "Mathematics to see and to touch.")}</h1>
      <p class="welcome-lead">${pair("Des cercles qui redessinent une île, un ensemble infiniment détaillé, des billes qui dessinent une cloche. Entre, regarde, et change un nombre pour voir ce qui se passe.", "Circles that redraw an island, an endlessly detailed set, marbles that draw a bell. Come in, look, and change a number to see what happens.")}</p>
      <div class="welcome-cta"><a class="btn btn-primary" href="${link("gallery")}">${pair("Entrer dans la galerie", "Enter the gallery")}</a><a class="btn btn-secondary" href="${link("lab")}">${pair("Expérimenter", "Experiment")}</a></div>
    </div>
    <figure class="welcome-art"><canvas data-art="fourier" role="img" aria-label="${pair("Des cercles qui tournent redessinent le contour de Madagascar", "Turning circles redraw the outline of Madagascar")}"></canvas><figcaption>${pair("Madagascar, redessinée par des cercles qui tournent (silhouette stylisée).", "Madagascar, redrawn by turning circles (stylised silhouette).")} <a href="${link("gallery", "fourier")}">${pair("Essaie avec ta propre forme", "Try your own shape")}</a></figcaption></figure>
  </section>
  <section class="welcome-section" aria-labelledby="wonders-title">
    <div class="welcome-head"><h2 id="wonders-title">${pair("Quelques merveilles", "A few wonders")}</h2><a href="${link("gallery")}">${pair("Toute la galerie", "The whole gallery")} →</a></div>
    <div class="wonder-grid">${wonders.map((l) => card(l, "gallery", t, pair, link)).join("")}</div>
  </section>
  <section class="welcome-section" aria-labelledby="doors-title">
    <h2 id="doors-title">${pair("Trois façons d’entrer", "Three ways in")}</h2>
    <div class="door-grid">
      <a class="door-card" href="${link("lab")}"><strong>${pair("Expérimenter", "Experiment")}</strong><span>${pair("Déplace un point, change un nombre, regarde la courbe répondre. Une idée à la fois.", "Move a point, change a number, watch the curve respond. One idea at a time.")}</span></a>
      <a class="door-card" href="${link("gallery")}"><strong>${pair("S’émerveiller", "Wonder")}</strong><span>${pair("Fractales, formes de largeur constante, solides parfaits : des idées qui surprennent.", "Fractals, shapes of constant width, perfect solids: ideas that surprise.")}</span></a>
      <a class="door-card" href="${link("challenges")}"><strong>${pair("Chercher", "Puzzle")}</strong><span>${pair("Des problèmes à résoudre, des indices si tu en as besoin, une solution animée à la fin.", "Problems to solve, hints if you need them, an animated solution at the end.")}</span></a>
    </div>
  </section>
  <section class="welcome-school" aria-label="${pair("Cours et programmes", "Lessons and programmes")}">
    <p><strong>${pair("Tu suis un programme scolaire ?", "Following a school programme?")}</strong> ${pair("Les cours, les diaporamas et les parcours par niveau ont leur place à part.", "Lessons, slides and pathways by level have a place of their own.")}</p>
    <p class="welcome-school-links"><a href="${link("resources")}">${pair("Cours", "Lessons")}</a><a href="${link("slides")}">${pair("Diaporamas", "Slides")}</a><a href="${link("pathways")}">${pair("Parcours", "Pathways")}</a></p>
  </section>
</main>`;
}

export function galleryPage({ pair, t, link, labs }) {
  const items = labs.filter((l) => l.custom);
  return `<main id="main" class="page gallery-page" tabindex="-1">
  <div class="page-heading"><div><h1>${pair("La galerie de curiosités", "The gallery of curiosities")}</h1><p>${pair("Des idées de mathématiques qui se regardent d’abord. Touche, glisse, change un réglage : chaque pièce se manipule.", "Mathematical ideas that you look at first. Touch, drag, change a setting: every piece can be handled.")}</p></div></div>
  <div class="wonder-grid">${items.map((l) => card(l, "gallery", t, pair, link)).join("")}</div>
  <p class="editorial-note">${pair("Pour des expériences guidées autour de formules, de courbes et de données, voir le laboratoire.", "For guided experiments with formulas, curves and data, see the laboratory.")} <a href="${link("lab")}">${pair("Ouvrir le laboratoire", "Open the laboratory")}</a></p>
</main>`;
}
