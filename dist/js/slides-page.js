import {currentCourse,rememberCourse} from './navigation-state.js';
import { liveCourses as courses } from './live-curriculum.js';
import { assetHref, fetchJSON } from './data-loader.js';
import { icon } from './icons.js';
import { errorsFor } from './errors-model.js';
// Slides index (#slides[/<course>]): a rail of curricula, then levels (owner request, 1 November 2026: curriculum first,
// deck counts only); the decks of the chosen level fill the panel, in the HTML (explore) or PDF (lecture) edition.
const P = (fr, en) => [fr, en];
const E = x => String(x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SHORT = { seconde: P('Seconde', 'Seconde'), premiere: P('Première spécialité', 'Première'), terminale: P('Terminale spécialité', 'Terminale'), expertes: P('Maths expertes', 'Further maths'), stmg: P('Terminale STMG', 'Terminale STMG'), t10: P('T10', 'T10'), t11s: P('T11 série S', 'T11 S') };
const slideCourses = () => courses.filter(c => c.curriculum === 'fr' || c.curriculum === 'mg');
const chosen = () => {
  const id = location.hash.split('/')[1];
  if (slideCourses().some(c => c.id === id)) return id;
  try { const saved = currentCourse(); if (slideCourses().some(c => c.id === saved)) return saved; } catch { /* storage blocked */ }
  return slideCourses()[0].id;
};

export function slidesPage(t) {
  const L = t(['0', '1']) === '1' ? 1 : 0;
  const pick = c => `<li><button type="button" class="pw-pick" data-course="${E(c.id)}" aria-pressed="false"><span>${E((SHORT[c.id] || c.title)[L])}</span><small data-deck-count="${E(c.id)}"></small></button></li>`;
  const families = `<div class="pw-family"><ul>${slideCourses().map(pick).join('')}</ul></div>`;
  return `<main id="main" tabindex="-1" class="page slides-page"><div class="res-top"><div><h1>${P('Diaporamas pour la classe', 'Classroom slides')[L]}</h1>
  <p class="page-intro">${P('Choisis ta classe, puis ouvre un diaporama. Les téléchargements sont disponibles à côté du lien d’ouverture.', 'Choose your class, then open a deck. Downloads stay beside the opening link.')[L]}</p></div>
  <div class="slide-type-toggle" role="group" aria-label="${P('Usage du diaporama', 'Slide purpose')[L]}"><button type="button" data-slide-type="explore" aria-pressed="true"><strong>${P('Explorer · HTML', 'Explore · HTML')[L]}</strong><span>${P('Manipuler, essayer, conjecturer', 'Manipulate, test, conjecture')[L]}</span></button><button type="button" data-slide-type="lecture" aria-pressed="false"><strong>${P('Présenter · PDF', 'Lecture · PDF')[L]}</strong><span>${P('Cours, démonstrations et exemples', 'Definitions, proofs and examples')[L]}</span></button></div></div>
  <div class="pw-layout res-layout"><nav class="pw-rail res-rail" aria-label="${P('Classes', 'Classes')[L]}">${families}</nav>
  <section class="pw-panel" id="slides-list" aria-live="polite"><p>${P('Chargement…', 'Loading…')[L]}</p></section></div></main>`;
}

export async function bindSlides(t) {
  const L = t(['0', '1']) === '1' ? 1 : 0, host = document.getElementById('slides-list');
  try {
    const index = await fetchJSON('./slides/data/index.json');
    const lectureIndex = await fetchJSON('./slides/lectures/index.json').catch(() => []);
    const lectures = new Map(lectureIndex.map(d => [d.id, d]));
    let mode = 'explore', course = chosen();
    document.querySelectorAll('[data-deck-count]').forEach(s => { s.textContent = index.filter(d => d.course === s.dataset.deckCount).length || ''; });
    const paint = () => {
      if (!host.isConnected) return;
      const c = courses.find(x => x.id === course), lang = c.contentLanguage || (L ? 'en' : 'fr');
      const decks = index.filter(d => d.course === course).sort((a, b) => a.number - b.number);
      document.querySelectorAll('.slides-page [data-course]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.course === course)));
      const card = d => {
        const edition = lectures.get(d.id)?.editions?.[lang], htmlEdition = d.editions?.[lang];
        const title = d.title[L] || d.title[lang === 'en' ? 1 : 0] || d.title.find(Boolean);
        const errors = errorsFor('#chapter/' + d.id).length;
        let main, actions = '';
        if (mode === 'lecture') {
          if (!edition) { main = `<span class="deck-title">${E(title)}</span>`; actions = `<span class="deck-meta">${P('Édition PDF indisponible', 'PDF edition unavailable')[L]}</span>`; }
          else {
            const pdf = `./slides/lectures/${E(edition.pdf)}?v=${E(edition.sha256)}`;
            main = `<a class="deck-title" href="${pdf}">${E(title)}</a>`;
            actions = `<a href="${pdf}" download>${icon('download-simple', 16)}PDF</a><a href="${E(assetHref('./slides/lectures/' + edition.source))}" download>LaTeX</a>`;
          }
        } else if (!htmlEdition) {
          main = `<span class="deck-title">${E(title)}</span>`; actions = `<span class="deck-meta">${P('Édition HTML indisponible dans cette langue', 'HTML edition unavailable in this language')[L]}</span>`;
        } else {
          main = `<a class="deck-title" href="${E(assetHref('./slides/player.html'))}&amp;deck=${E(d.id)}&amp;lang=${E(lang)}">${E(title)}</a>`;
          actions = `<a href="${E(assetHref('./slides/export/' + d.id + '.html'))}" download="${E(d.id)}.html">${icon('download-simple',16)}HTML</a>${errors?`<a class="deck-source" href="#chapter/${E(d.id)}/cours/errors">${P('Erreurs fréquentes','Common errors')[L]} (${errors})</a>`:''}`;
        }
        return `<li class="deck-card"><span class="deck-no">${String(d.number).padStart(2, '0')}</span>${main}<details class="deck-downloads secondary-tools"><summary>${P('Télécharger / autres supports','Downloads / other resources')[L]}</summary><div class="deck-actions">${actions}</div></details></li>`;
      };
      host.innerHTML = `<div class="res-head"><h2>${E(c.title[L])}</h2><span class="pw-count">${decks.length} ${P('diaporamas', 'decks')[L]}</span></div>${decks.length ? `<ol class="deck-grid">${decks.map(card).join('')}</ol>` : `<p class="pw-empty">${P('Pas encore de diaporama pour ce niveau.', 'No deck for this level yet.')[L]}</p>`}`;
    };
    const root = document.querySelector('.slides-page');
    root.addEventListener('click', e => {
      const pick = e.target.closest('[data-course]');
      if (pick) { course = pick.dataset.course; try { rememberCourse(course); } catch { /* storage blocked */ } history.replaceState(null, '', '#slides/' + course); paint(); return; }
      const type = e.target.closest('[data-slide-type]');
      if (type) { mode = type.dataset.slideType; root.querySelectorAll('[data-slide-type]').forEach(b => b.setAttribute('aria-pressed', String(b === type))); paint(); }
    });
    paint();
  } catch { host.innerHTML = `<p class="pack-error">${P('Impossible de charger la liste.', 'Could not load the list.')[L]}</p>`; }
}
