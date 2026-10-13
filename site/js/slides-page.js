// Slides index: classroom decks (French and English) opened in the standalone player.
const P = (fr, en) => [fr, en];
const E = x => String(x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const COURSES = [['seconde', P('Seconde', 'Seconde')], ['premiere', P('Première spécialité', 'Première specialty')], ['terminale', P('Terminale spécialité', 'Terminale specialty')], ['stmg', P('Terminale STMG', 'Terminale STMG')]];

export function slidesPage(t) {
  const L = t(['0', '1']) === '1' ? 1 : 0;
  return `<main id="main" tabindex="-1" class="page pack-page slides-page"><div class="pack-heading"><h1>${P('Diaporamas pour la classe', 'Classroom slides')[L]}</h1>
  <p>${P('Un diaporama par chapitre : notions, exemples, erreurs fréquentes, activités et canevas interactifs à manipuler en direct. Flèches pour avancer, R pour la réponse, G pour le plan, L pour la langue, F pour le plein écran.', 'One deck per chapter: notions, worked examples, common mistakes, activities and interactive canvases to manipulate live. Arrow keys to move, R for the answer, G for the outline, L for the language, F for full screen.')[L]}</p></div>
  <div id="slides-list" aria-live="polite"><p>${P('Chargement…', 'Loading…')[L]}</p></div></main>`;
}

export async function bindSlides(t) {
  const L = t(['0', '1']) === '1' ? 1 : 0, host = document.getElementById('slides-list');
  try {
    const r = await fetch('./slides/data/index.json'); if (!r.ok) throw new Error(r.status);
    const index = await r.json(), lang = L ? 'en' : 'fr';
    host.innerHTML = COURSES.map(([id, name]) => {
      const decks = index.filter(d => d.course === id).sort((a, b) => a.number - b.number);
      if (!decks.length) return '';
      return `<section class="source-course"><div class="source-head"><h2>${name[L]}</h2><span>${decks.length} ${P('diaporamas', 'decks')[L]} · ${decks.reduce((s, d) => s + d.slides, 0)} ${P('diapositives', 'slides')[L]}</span></div>
      <ul class="deck-list">${decks.map(d => `<li><a href="./slides/player.html?deck=${E(d.id)}&amp;lang=${lang}">${E(d.title[L])}</a> <span>${d.slides} ${P('diapositives', 'slides')[L]}</span></li>`).join('')}</ul></section>`;
    }).join('');
  } catch { host.innerHTML = `<p class="pack-error">${P('Impossible de charger la liste.', 'Could not load the list.')[L]}</p>`; }
}
