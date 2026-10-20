// The welcome page and the gallery index. Neutral on purpose: nothing here assumes a school programme, which lives under
// "Cours" and "Parcours". The drawings are live canvases mounted by app.js (data-art) with home-art.js.
const WONDERS = ["fourier", "mandelbrot", "galton", "chaos", "platonic", "reuleaux"];

const card = (l, href, t, pair, link) => `<a class="wonder" href="${link(href, l.id)}"><canvas data-art="${l.id}" role="img" aria-label="${t(l.title)}"></canvas><span class="wonder-body"><strong>${t(l.title)}</strong><span>${t(l.intro)}</span><span class="wonder-go">${pair("Entrer", "Enter")} →</span></span></a>`;

export function homePage({ pair, link }) {
  return `<main id="main" class="welcome" tabindex="-1">
  <section class="welcome-stage" aria-label="${pair("Accueil", "Welcome")}">
    <canvas class="stage-bg" data-art="julia-dark" role="presentation"></canvas>
    <canvas class="stage-fg" data-art="fourier-dark" role="img" aria-label="${pair("Des cercles qui tournent redessinent le contour de Madagascar, devant un ensemble de Julia qui se transforme", "Turning circles redraw the outline of Madagascar in front of a Julia set that keeps changing")}"></canvas>
    <div class="stage-text">
      <h1><span lang="mg">Tonga soa</span></h1>
      <p>${pair("Bienvenue", "Welcome")}</p>
      <a class="btn btn-primary stage-cta" href="${link("gallery")}">${pair("Entrer", "Enter")}</a>
    </div>
  </section>
</main>`;
}

export function galleryPage({ pair, t, link, labs }) {
  const items = labs.filter((l) => l.custom);
  return `<main id="main" class="page gallery-page" tabindex="-1">
  <div class="page-heading"><div><h1>${pair("Curiosités", "Curiosities")}</h1><p>${pair("Des idées de mathématiques qui se regardent d’abord. Touche, glisse, change un réglage : chaque pièce se manipule.", "Mathematical ideas that you look at first. Touch, drag, change a setting: every piece can be handled.")}</p></div></div>
  <div class="wonder-grid">${items.map((l) => card(l, "gallery", t, pair, link)).join("")}</div>
  <p class="editorial-note">${pair("Pour des expériences guidées autour de formules, de courbes et de données, voir le laboratoire.", "For guided experiments with formulas, curves and data, see the laboratory.")} <a href="${link("lab")}">${pair("Ouvrir le laboratoire", "Open the laboratory")}</a></p>
</main>`;
}
