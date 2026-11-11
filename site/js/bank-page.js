import {currentCourse,rememberCourse} from './navigation-state.js';
// Online exercise bank (#bank[/<course>[/<chapter>]]): worked exercises to do on screen, chapter by chapter, with hints
// and corrections revealed on demand, seeded problems whose numbers can be renewed, and a quick series of generated
// questions. Data: js/exercises/bank.js (generators, authored exercises, seeded problems) and js/exercises/bank-mada.js
// (exercises of the Malagasy books). Printing reuses the worksheet print path.
import { resourceCatalog as completeCatalog } from './resources-data.js';
import { liveCompanionCatalog } from './live-curriculum.js';
const resourceCatalog = liveCompanionCatalog(completeCatalog);
import { liveCourses as primaryCourses } from './live-curriculum.js';
import { AUTHORED, TEMPLATES, instance } from './exercises/bank.js';
import { exercisesOf, LEVEL as LEVEL_PAIRS } from './exercises/bank-select.js';
import { rng } from './exercises/engine.js';
import { typeset, printMarkup } from './exercises/ui-kit.js';
import { html as H } from './exercises/export.js';
import { icon } from './icons.js';
import {ANNALS,annalsFor,annalsMarkup,bindAnnals} from './annals-bank.js';

const P = (fr, en) => [fr, en];
const E = (x) => String(x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SHORT = { seconde: P('Seconde', 'Seconde'), premiere: P('Première spécialité', 'Première'), terminale: P('Terminale spécialité', 'Terminale'), expertes: P('Maths expertes', 'Further maths'), stmg: P('Terminale STMG', 'Terminale STMG'), t10: P('T10', 'T10'), t11s: P('T11 série S', 'T11 S') };
const LEVEL = LEVEL_PAIRS;
const courses = primaryCourses.filter((c) => c.curriculum === 'fr' || c.curriculum === 'mg');
const chaptersOf = (course) => resourceCatalog.chapters.filter((c) => c.course === course).sort((a, b) => a.number - b.number);
const generatorsOf = (chapter) => TEMPLATES.filter((t) => t.chapter === chapter);
export const bankCount = (chapter) => exercisesOf(chapter).length;
// #bank[/<course>[/<chapter>[/<exercise id>]]]; #bank/annales[/<paper id>]. An exercise id must be one the chapter page shows.
export const isBankRoute = (course, chapter, exercise) => course==='annales'?(!chapter||ANNALS.some(r=>r.id===chapter)): (!course || courses.some((c) => c.id === course)) && (!chapter || chaptersOf(course).some((c) => c.id === chapter)) && (!exercise || (!!chapter && exercisesOf(chapter).some((e) => e.id === exercise)));

const stars = (n) => `<span class="bank-level" data-level="${n}">${'●'.repeat(n)}${'○'.repeat(3 - n)}</span>`;
// One exercise: statement, then each part with its hint and its correction folded.
function exerciseCard(e, k, seed, t) {
  const body = e.make ? e.make(rng(`${seed}|${e.id}`)) : e;
  const parts = body.parts || [];
  return `<article class="bank-ex" id="ex-${E(e.id)}" data-ex="${E(e.id)}"><header class="bank-ex-head"><span class="bank-no">${k}</span><div><h3 tabindex="-1">${E(e.title)}</h3><p class="bank-meta">${stars(e.level)} ${t(LEVEL[e.level])} · ${e.minutes || 10} min${e.make ? ` · ${t(P('valeurs tirées au hasard', 'random values'))}` : ''}${e.source ? ` · ${E(e.source)}` : ''}</p></div>${e.make ? `<button type="button" class="bank-renew" data-renew="${E(e.id)}">${icon('arrows-clockwise', 16)}${t(P('Nouvelles valeurs', 'New values'))}</button>` : ''}</header>
  <div class="bank-intro">${H(body.intro || '')}</div>
  ${parts.length ? `<ol class="bank-parts">${parts.map((p) => `<li><div class="bank-q">${H(p.q)}</div>${p.hint ? `<details class="bank-hint"><summary>${t(P('Indice', 'Hint'))}</summary><div>${H(p.hint)}</div></details>` : ''}<details class="bank-sol"><summary>${t(P('Correction', 'Solution'))}</summary><div>${H(p.a)}</div></details></li>`).join('')}</ol>` : ''}
  ${body.solution ? `<details class="bank-sol"><summary>${t(P('Correction', 'Solution'))}</summary><div>${H(body.solution)}</div></details>` : ''}</article>`;
}
function quickSeries(chapter, seed, t) {
  const gens = generatorsOf(chapter);
  if (!gens.length) return '';
  const r = rng(`${seed}|quick|${chapter}`), items = [];
  for (let i = 0; i < 8; i++) { const g = gens[i % gens.length], level = 1 + Math.floor((i * 3) / 8); items.push(instance(g, level, `${seed}-${i}-${r.int(1, 1e6)}`)); }
  return `<section class="bank-quick" aria-labelledby="bank-quick-title"><div class="bank-section-head"><h2 id="bank-quick-title">${t(P('Entraînement express', 'Quick practice'))}</h2><button type="button" class="bank-renew" data-quick>${icon('arrows-clockwise', 16)}${t(P('Nouvelle série', 'New series'))}</button></div><p class="group-note">${t(P('Huit questions courtes, de la routine à l’exigeant. Les nombres changent à chaque série.', 'Eight short questions, from routine to demanding. The numbers change with every series.'))}</p><ol class="bank-quick-list">${items.map((x) => `<li><div class="bank-q">${H(x.q)}</div><details class="bank-sol"><summary>${t(P('Réponse', 'Answer'))}</summary><div>${H(x.a)}${x.s ? `<p>${H(x.s)}</p>` : ''}</div></details></li>`).join('')}</ol></section>`;
}
function rail(course, t) {
  const pick = (c) => `<li><a class="pw-pick" href="#bank/${c.id}" ${c.id === course ? 'aria-current="page" aria-pressed="true"' : 'aria-pressed="false"'}><span>${E(t(SHORT[c.id] || c.title))}</span><small>${chaptersOf(c.id).reduce((a, ch) => a + bankCount(ch.id), 0)}</small></a></li>`;
  return `<nav class="pw-rail res-rail" aria-label="${t(P('Niveaux', 'Levels'))}"><div class="pw-family"><ul>${courses.filter((c) => c.curriculum === 'fr').map(pick).join('')}</ul></div></nav>`;
}
function chapterIndex(course, t) {
  return `<div class="res-head"><h2>${E(t(primaryCourses.find((c) => c.id === course).title))}</h2><span class="pw-count">${t(P('Choisis un chapitre', 'Pick a chapter'))}</span></div><ol class="bank-chapters">${chaptersOf(course).map((c) => { const n = bankCount(c.id), g = generatorsOf(c.id).length, a = annalsFor(c.id).length; return `<li><a href="#bank/${course}/${c.id}"><span class="bank-ch-no">${String(c.number).padStart(2, '0')}</span><span class="bank-ch-title">${E(t(c.title))}</span><span class="bank-ch-meta">${n} ${t(n > 1 ? P('exercices corrigés', 'worked exercises') : P('exercice corrigé', 'worked exercise'))}${g ? ` · ${t(P('entraînement express', 'quick practice'))}` : ''}${a ? `<br>${a} ${t(P('exercices d’annales', 'past-paper exercises'))}` : ''}</span></a></li>`; }).join('')}</ol>`;
}
function chapterView(course, chapter, seed, t) {
  const c = resourceCatalog.chapters.find((x) => x.id === chapter), list = exercisesOf(chapter), chapters = chaptersOf(course), i = chapters.findIndex((x) => x.id === chapter);
  const prev = chapters[i - 1], next = chapters[i + 1];
  return `<nav class="discovery-breadcrumb" aria-label="${t(P('Fil d’Ariane', 'Breadcrumb'))}"><a href="#bank">${t(P('Banque d’exercices', 'Exercise bank'))}</a> / <a href="#bank/${course}">${E(t(SHORT[course]))}</a></nav>
  <div class="res-head"><h2>${t(P('Chapitre', 'Chapter'))} ${c.number} · ${E(t(c.title))}</h2><nav class="res-quick"><a href="#chapter/${chapter}">${icon('books', 16)}${t(P('Le cours', 'The lesson'))}</a><a href="#slides/${course}">${icon('presentation-chart', 16)}${t(P('Diaporama', 'Slides'))}</a></nav></div>
  <div class="bank-tools" role="toolbar" aria-label="${t(P('Affichage', 'Display'))}"><div class="bank-filter" role="group" aria-label="${t(P('Niveau', 'Level'))}">${[0, 1, 2, 3].map((l) => `<button type="button" class="filter" data-level-filter="${l}" aria-pressed="${l === 0}">${l ? t(LEVEL[l]) : t(P('Tous les niveaux', 'All levels'))}</button>`).join('')}</div><details class="secondary-tools bank-print-options"><summary>${t(P('Imprimer / afficher les corrections','Print / show solutions'))}</summary><div class="secondary-tools-body"><button type="button" class="filter" data-open-all>${t(P('Déplier toutes les corrections', 'Show every solution'))}</button><button type="button" class="filter" data-print="student">${t(P('Imprimer l’énoncé', 'Print the questions'))}</button><button type="button" class="filter" data-print="teacher">${t(P('Imprimer avec corrections', 'Print with solutions'))}</button></div></details></div>
  <section aria-labelledby="bank-ex-title"><h2 id="bank-ex-title" class="sr-only">${t(P('Exercices corrigés', 'Worked exercises'))}</h2>${list.length ? `<div class="bank-list">${list.map((e, k) => exerciseCard(e, k + 1, seed, t)).join('')}</div>` : `<p class="pw-empty">${t(P('Les exercices corrigés de ce chapitre sont en préparation. L’entraînement express ci-dessous est déjà disponible.', 'The worked exercises of this chapter are being written. The quick practice below is already available.'))}</p>`}</section>
  ${annalsFor(chapter).length ? `<details class="bank-annals"><summary>${t(P('Annales de ce chapitre', 'Past papers for this chapter'))} (${annalsFor(chapter).length})</summary>${annalsMarkup(annalsFor(chapter), {books:false})}</details>` : ""}<div id="bank-quick">${quickSeries(chapter, seed, t)}</div>
  <nav class="bank-pager">${prev ? `<a href="#bank/${course}/${prev.id}">${icon('caret-left', 16)} ${E(t(prev.title))}</a>` : '<span></span>'}${next ? `<a href="#bank/${course}/${next.id}">${E(t(next.title))} ${icon('caret-right', 16)}</a>` : ''}</nav>`;
}

function bankNav(t, annals) {
  return `<nav class="bank-sections" aria-label="${t(P('Type d’exercices', 'Exercise collection'))}"><a href="#bank" ${!annals ? 'aria-current="page"' : ''}>${t(P('Par chapitre', 'By chapter'))}</a><a href="#bank/annales" ${annals ? 'aria-current="page"' : ''}>${t(P('Annales d’examens', 'Past papers'))} <small>${ANNALS.length}</small></a></nav>`;
}

export function bankPage(t, course, chapter) {
  if(course==='annales')return `<main id="main" tabindex="-1" class="page bank-page"><h1>Annales d’examens</h1><p class="page-intro">Sujets de bac, E3C et EAM avec leurs corrigés : cherche une notion ou filtre par examen.</p>${bankNav(t,true)}${annalsMarkup(ANNALS,{detail:chapter||''})}</main>`;
  let saved = ''; try { saved = currentCourse(); } catch { /* storage blocked */ }
  const id = course || (courses.some((c) => c.id === saved) ? saved : courses[0].id);
  return `<main id="main" tabindex="-1" class="page bank-page"><div class="res-top"><div><h1>${t(P('Banque d’exercices', 'Exercise bank'))}</h1><p class="page-intro">${t(P('Choisis ta classe et ton chapitre. Cherche, demande un indice, puis ouvre la correction. Pour préparer un examen, retrouve les sujets dans les annales.', 'Choose your class and chapter. Try, ask for a hint, then open the solution. To prepare for an exam, browse the past papers.'))}</p></div></div>
  ${bankNav(t,false)}<div class="pw-layout res-layout">${rail(id, t)}<section class="pw-panel" id="bank-panel">${chapter ? chapterView(id, chapter, 'bank', t) : chapterIndex(id, t)}</section></div></main>`;
}

export function bindBank(root, t, course, chapter, exercise) {
  const stopAnnals=bindAnnals(root,chapter&&course!=='annales'?annalsFor(chapter):ANNALS);
  if(course==='annales')return stopAnnals;
  const panel = root.querySelector('#bank-panel');
  if (course) try { rememberCourse(course); } catch { /* storage blocked */ }
  const typeset_ = typeset(panel);
  if (!chapter) return stopAnnals;
  // A direct link to one exercise (#bank/<course>/<chapter>/<id>): bring it into view and focus its heading once the page has
  // settled (app.js resets the scroll and focus after rendering; MathJax changes the heights). No level filter hides it on arrival.
  let stopJump = () => {};
  if (exercise) {
    let gone = false, timer = 0;
    const jump = () => {
      if (gone) return;
      const card = panel.querySelector(`[data-ex="${CSS.escape(exercise)}"]`);
      if (!card) return;
      card.scrollIntoView({ block: 'start' });
      card.querySelector('h3')?.focus({ preventScroll: true });
    };
    timer = setTimeout(() => { jump(); Promise.resolve(typeset_).then(() => { if (!gone) { jump(); } }); }, 0);
    stopJump = () => { gone = true; clearTimeout(timer); };
  }
  let quick = 1;
  const click = async (e) => {
    const renew = e.target.closest('[data-renew]'), lf = e.target.closest('[data-level-filter]'), pr = e.target.closest('[data-print]');
    if (renew) {
      const ex = AUTHORED.find((x) => x.id === renew.dataset.renew), card = renew.closest('.bank-ex'), k = card.querySelector('.bank-no').textContent;
      const tmp = document.createElement('div'); tmp.innerHTML = exerciseCard(ex, k, `bank-${Date.now()}`, t);
      const fresh = tmp.firstElementChild; card.replaceWith(fresh); typeset(fresh); fresh.querySelector('[data-renew]')?.focus();
    } else if (e.target.closest('[data-quick]')) {
      const host = panel.querySelector('#bank-quick'); host.innerHTML = quickSeries(chapter, `bank-q${++quick}`, t); typeset(host); host.querySelector('[data-quick]')?.focus();
    } else if (lf) {
      const l = Number(lf.dataset.levelFilter);
      panel.querySelectorAll('[data-level-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === lf)));
      panel.querySelectorAll('.bank-list .bank-ex').forEach((card) => { card.hidden = !!l && card.querySelector('.bank-level')?.dataset.level !== String(l); });
    } else if (e.target.closest('[data-open-all]')) {
      const all = [...panel.querySelectorAll('.bank-list details, .bank-quick details')], open = !all.every((d) => d.open);
      all.forEach((d) => { d.open = open; });
    } else if (pr) {
      const teacher = pr.dataset.print === 'teacher', c = resourceCatalog.chapters.find((x) => x.id === chapter);
      const clone = panel.querySelector('.bank-list')?.cloneNode(true) || document.createElement('div');
      clone.querySelectorAll('.bank-renew').forEach((b) => b.remove());
      clone.querySelectorAll('[hidden]').forEach((b) => b.remove());
      clone.querySelectorAll('details').forEach((d) => { if (!teacher || d.classList.contains('bank-hint')) d.remove(); else { d.open = true; } });
      await printMarkup(`<div class="gen-paper bank-print"><h1>${E(t(c.title))}</h1><p>${E(t(SHORT[course]))} · ${teacher ? t(P('avec corrections', 'with solutions')) : t(P('énoncés', 'questions'))}</p>${clone.outerHTML}</div>`);
    }
  };
  panel.addEventListener('click', click);
  return () => {stopJump();stopAnnals();panel.removeEventListener('click', click);};
}
