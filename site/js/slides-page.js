import { courses, university } from './catalogue-data.js';
import { assetHref, fetchJSON } from './data-loader.js';
import { universitySlideLinks } from './university-model.js';
// Slides index: classroom decks (French and English) opened in the standalone player.
const P = (fr, en) => [fr, en];
const E = x => String(x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function slidesPage(t) {
  const L = t(['0', '1']) === '1' ? 1 : 0;
  return `<main id="main" tabindex="-1" class="page pack-page slides-page"><div class="pack-heading"><h1>${P('Diaporamas pour la classe', 'Classroom slides')[L]}</h1>
  <p>${P('Un diaporama par chapitre : notions, exemples, erreurs fréquentes, activités et canevas interactifs à manipuler en direct. Flèches pour avancer, R pour la réponse, G pour le plan, F pour le plein écran.', 'One deck per chapter: notions, worked examples, common mistakes, activities and interactive canvases to manipulate live. Arrow keys to move, R for the answer, G for the outline, F for full screen.')[L]}</p></div>
  <div class="slide-type-toggle" role="group" aria-label="${P('Usage du diaporama','Slide purpose')[L]}"><button type="button" data-slide-type="explore" aria-pressed="true"><strong>${P('Explorer · HTML','Explore · HTML')[L]}</strong><span>${P('Manipuler, essayer, conjecturer','Manipulate, test, conjecture')[L]}</span></button><button type="button" data-slide-type="lecture" aria-pressed="false"><strong>${P('Présenter · PDF','Lecture · PDF')[L]}</strong><span>${P('Cours, démonstrations et exemples','Definitions, proofs and examples')[L]}</span></button></div>
  <p id="slide-purpose">${P('Les figures HTML se manipulent en direct. Les supports PDF sont des diaporamas Beamer Metropolis 16:9 pour le cours, avec des corrections séparées des questions.','HTML figures can be manipulated live. The PDFs are 16:9 Metropolis Beamer lecture decks, with worked answers following their questions.')[L]}</p>
  <div id="slides-list" aria-live="polite"><p>${P('Chargement…', 'Loading…')[L]}</p></div>${universitySlideLinks(university,L)}</main>`;
}

export async function bindSlides(t) {
  const L = t(['0', '1']) === '1' ? 1 : 0, host = document.getElementById('slides-list');
  try {
    const index = await fetchJSON('./slides/data/index.json'), lang = L ? 'en' : 'fr';
    const lectureIndex = await fetchJSON('./slides/lectures/index.json').catch(()=>[]);
    const lectures = new Map(lectureIndex.map(d=>[d.id,d]));
    let mode = 'explore';
    const paint = () => {
    if (!host.isConnected) return;
    host.innerHTML = courses.map(({id, title: name, contentLanguage}) => {
      const decks = index.filter(d => d.course === id).sort((a, b) => a.number - b.number);
      if (!decks.length) return '';
      return `<section class="source-course"><div class="source-head"><h2>${name[L]}</h2><span>${decks.length} ${P('diaporamas', 'decks')[L]} · ${decks.reduce((s, d) => s + d.slides, 0)} ${P('diapositives', 'slides')[L]}</span></div>
      <ul class="deck-list">${decks.map(d => {
        const lang=contentLanguage || (L?'en':'fr');
        const edition=lectures.get(d.id)?.editions?.[lang];
        return mode==='lecture' && !edition ? `<li><strong>${E(d.title[L])}</strong><span>${P('Édition PDF indisponible','PDF edition unavailable')[L]}</span></li>` : mode==='lecture' ? `<li><a href="./slides/lectures/${E(edition.pdf)}?v=${E(edition.sha256)}">${E(d.title[L])}</a><span>${edition.pages} ${P('diapositives · cours','slides · lecture')[L]}</span><a class="deck-download" href="./slides/lectures/${E(edition.pdf)}?v=${E(edition.sha256)}" download>${P('Télécharger PDF','Download PDF')[L]}</a><a class="deck-source" href="${E(assetHref('./slides/lectures/'+edition.source))}" download>${P('Source Beamer','Beamer source')[L]}</a></li>` : `<li><a href="${E(assetHref("./slides/player.html"))}&amp;deck=${E(d.id)}">${E(d.title[L])}</a> <span>${d.slides} ${P('diapositives · exploration', 'slides · exploration')[L]}</span> <a class="deck-download" href="${E(assetHref('./slides/export/'+d.id+'.html'))}" download="${E(d.id)}.html" aria-label="${P('Télécharger en HTML : ', 'Download as HTML: ')[L]}${E(d.title[L])}">${P('Télécharger HTML', 'Download HTML')[L]}</a></li>`;
      }).join('')}</ul></section>`;
    }).join('');
    };
    document.querySelectorAll('[data-slide-type]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.slideType;document.querySelectorAll('[data-slide-type]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));paint();}));
    paint();
  } catch { host.innerHTML = `<p class="pack-error">${P('Impossible de charger la liste.', 'Could not load the list.')[L]}</p>`; }
}
