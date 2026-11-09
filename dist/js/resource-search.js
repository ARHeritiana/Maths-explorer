// Resource search UI: one box over every live resource (chapters, slides, exercises, starters, experiments, curiosities, challenges,
// history, errors, past papers). Results show only the actions that exist (Ouvrir, Projeter, Manipuler, Imprimer) and a favorite
// toggle backed by teacher-state.js. Mounted by the #search page and by the teacher dashboard. Cahier tokens only (styles/teacher.css).
import {searchResources, relatedTo, actionsOf, primaryHref, typeLabel, TYPES, RELATIONS, relationTitle, publicItem} from './resource-index.js';
import {buildLiveResourceIndex} from './resource-sources.js';
import {TOPICS} from './topic-registry.js';
import {fetchJSON} from './data-loader.js';

const E = x => String(x).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const PER_GROUP = 5;
export {publicItem};

// Renders into `root`; returns a stop function. `options.index` (built items) or `options.decks` (array or null) skip the network.
export async function mountResourceSearch(root, {t, state, index, decks, query = '', isGone = () => false} = {}) {
  const L = (fr, en) => t([fr, en]);
  if (!index) {
    if (decks === undefined) decks = await fetchJSON('./slides/data/index.json').catch(() => null);
    if (isGone()) return () => {};
    index = buildLiveResourceIndex({decks});
  }
  const classes = [...new Set(index.flatMap(i => i.classes))];
  let course = ''; try {course = state.getClassroom().course || '';} catch {}
  if (!classes.includes(course)) course = '';
  const f = {query, cls: course, topic: '', type: '', projectable: false, printable: false};
  const expanded = new Set();
  const uid = 'rs' + Math.random().toString(36).slice(2, 7);
  const CLASS_NAMES = {seconde: 'Seconde', premiere: 'Première spécialité', terminale: 'Terminale spécialité', expertes: 'Maths expertes', stmg: 'Terminale STMG'};
  const suggestions = RELATIONS.slice(0, 5);

  root.innerHTML = `<section class="rs" aria-labelledby="${uid}-h"><h2 id="${uid}-h" class="rs-title">${L('Chercher une ressource', 'Find a resource')}</h2>
<form class="rs-form" role="search" aria-label="${L('Chercher une ressource', 'Find a resource')}"><label class="td-field rs-q"><span>${L('Une notion, un chapitre, un outil', 'A topic, a chapter, a tool')}</span>
<input id="${uid}-q" type="search" autocomplete="off" value="${E(f.query)}" placeholder="${E(L('croissance démographique, dérivée, probabilités…', 'population growth, derivative, probability…'))}" aria-describedby="${uid}-status"></label>
<details class="secondary-tools rs-filters"${course ? ' open' : ''}><summary>${L('Filtres', 'Filters')}</summary><div class="td-selects">
<label class="td-field"><span>${L('Classe', 'Class')}</span><select data-rs="cls"><option value="">${L('Toutes les classes', 'All classes')}</option>${classes.map(c => `<option value="${E(c)}"${c === course ? ' selected' : ''}>${E(CLASS_NAMES[c] || c)}</option>`).join('')}</select></label>
<label class="td-field"><span>${L('Thème', 'Topic')}</span><select data-rs="topic"><option value="">${L('Tous les thèmes', 'All topics')}</option><optgroup label="${E(L('Domaines', 'Fields'))}">${TOPICS.map(x => `<option value="${E(x.id)}">${E(t(x.title))}</option>`).join('')}</optgroup><optgroup label="${E(L('Sujets liés', 'Linked subjects'))}">${RELATIONS.map(r => `<option value="${E(r.id)}">${E(t(r.title))}</option>`).join('')}</optgroup></select></label>
<label class="td-field"><span>${L('Type', 'Type')}</span><select data-rs="type"><option value="">${L('Tous les types', 'All types')}</option>${TYPES.filter(([id]) => index.some(i => i.type === id)).map(([id, l]) => `<option value="${id}">${E(t(l))}</option>`).join('')}</select></label></div>
<div class="rs-checks"><label class="rs-check"><input type="checkbox" data-rs="projectable"> <span>${L('Projetable en classe', 'Projectable in class')}</span></label><label class="rs-check"><input type="checkbox" data-rs="printable"> <span>${L('Imprimable', 'Printable')}</span></label></div></details></form>
<p class="muted rs-status" id="${uid}-status" role="status" aria-live="polite"></p><div class="rs-results" id="${uid}-results"></div>
${decks === null ? `<p class="muted rs-note">${L('L’index des diaporamas n’a pas pu être lu : ils ne sont pas proposés pour l’instant.', 'The slides index could not be read: slides are not offered for now.')}</p>` : ''}</section>`;
  const $ = s => root.querySelector(s), results = $('#' + uid + '-results'), status = $('#' + uid + '-status');

  const favState = it => {try {return state.isFavorite('resource', it.id);} catch {return false;}};
  const itemHtml = it => {
    const acts = actionsOf(it), fav = favState(it), title = t(it.title), related = relatedTo(index, it.id, {limit: 4});
    const cls = it.classes.map(c => CLASS_NAMES[c] || c).join(', ');
    return `<li class="rs-item" data-id="${E(it.id)}"><div class="rs-head"><span class="rs-title-line">${E(title)}</span><span class="rs-meta">${E(t(typeLabel(it.type)))}${cls ? ' · ' + E(cls) : ''}</span></div>
<div class="rs-actions">${acts.map(a => `<a class="btn btn-secondary rs-act" data-act="${a.key}" data-id="${E(it.id)}"${a.prepare?.chapter ? ` data-chapter="${E(a.prepare.chapter)}"` : ''} href="${E(a.href)}">${E(t(a.label))}<span class="sr-only"> : ${E(title)}</span></a>`).join('')}<button type="button" class="btn-quiet rs-fav" data-fav="${E(it.id)}" aria-pressed="${fav}">${fav ? L('Retirer des favoris', 'Remove from favorites') : L('Ajouter aux favoris', 'Add to favorites')}<span class="sr-only"> : ${E(title)}</span></button></div>
${related.length ? `<details class="rs-related"><summary>${L('Ressources liées', 'Related resources')} (${related.length})</summary><ul>${related.map(r => { const h = primaryHref(r); return `<li><a href="${E(h)}">${E(t(r.title))}</a> <span class="muted">${E(t(typeLabel(r.type)))}</span></li>`; }).join('')}</ul></details>` : ''}</li>`;
  };
  const filtered = () => searchResources(index, f);
  function draw() {
    const any = f.query.trim() || f.cls || f.topic || f.type || f.projectable || f.printable;
    if (!any) {
      status.textContent = '';
      results.innerHTML = `<p class="muted">${L('Tape un mot, ou choisis un sujet :', 'Type a word, or pick a subject:')}</p><p class="rs-suggest">${suggestions.map(r => `<button type="button" class="btn-quiet rs-chip" data-suggest="${E(t([r.title[0], r.title[1]]))}">${E(t(r.title))}</button>`).join('')}</p>`;
      return;
    }
    const list = filtered();
    if (!list.length) {
      status.textContent = L('Aucun résultat.', 'No results.');
      results.innerHTML = `<div class="rs-empty"><p><strong>${L('Aucune ressource ne correspond.', 'No resource matches.')}</strong> ${L('Rien n’est inventé : si le site n’a pas ce contenu, il n’apparaît pas. Essaie un mot plus court, ou retire un filtre.', 'Nothing is made up: if the site does not have it, it is not listed. Try a shorter word or remove a filter.')}</p><button type="button" class="btn btn-secondary" data-reset>${L('Effacer la recherche et les filtres', 'Clear the search and filters')}</button></div>`;
      return;
    }
    status.textContent = `${list.length} ${list.length > 1 ? L('résultats', 'results') : L('résultat', 'result')}`;
    const groups = TYPES.map(([id, l]) => [id, l, list.filter(i => i.type === id)]).filter(g => g[2].length);
    results.innerHTML = groups.map(([id, l, items]) => {
      const open = expanded.has(id), shown = open ? items : items.slice(0, PER_GROUP);
      return `<section class="rs-group" aria-labelledby="${uid}-g-${id}"><h3 id="${uid}-g-${id}">${E(t(l))} <span class="muted">(${items.length})</span></h3><ul class="rs-list">${shown.map(itemHtml).join('')}</ul>${items.length > PER_GROUP ? `<button type="button" class="btn-quiet" data-more="${id}">${open ? L('Réduire', 'Show fewer') : L(`Afficher les ${items.length - PER_GROUP} autres`, `Show the other ${items.length - PER_GROUP}`)}</button>` : ''}</section>`;
    }).join('');
  }
  const refreshFavs = () => results.querySelectorAll('[data-fav]').forEach(b => {
    const it = index.find(i => i.id === b.dataset.fav), fav = it && favState(it);
    if (!it) return;
    b.setAttribute('aria-pressed', String(fav));
    b.firstChild.textContent = fav ? L('Retirer des favoris', 'Remove from favorites') : L('Ajouter aux favoris', 'Add to favorites');
  });
  const input = e => {
    const el = e.target;
    if (el.id === uid + '-q' && e.type === 'change') return; // blur must not redraw under a pending click
    if (el.id === uid + '-q') f.query = el.value;
    else if (el.dataset.rs) f[el.dataset.rs] = el.type === 'checkbox' ? el.checked : el.value;
    else return;
    expanded.clear(); draw();
  };
  const click = e => {
    const act = e.target.closest('a.rs-act');
    if (act) {
      const it = index.find(i => i.id === act.dataset.id);
      try {
        if (act.dataset.chapter) state.setChapter(act.dataset.chapter);
        if (it) state.addRecent({type: 'resource', id: it.id, title: t(it.title), href: primaryHref(it)});
      } catch {}
      return;
    }
    const fav = e.target.closest('[data-fav]');
    if (fav) {
      const it = index.find(i => i.id === fav.dataset.fav);
      if (it) {try {state.toggleFavorite({type: 'resource', id: it.id, title: t(it.title), href: primaryHref(it)});} catch {}}
      refreshFavs(); return;
    }
    const more = e.target.closest('[data-more]');
    if (more) {const id = more.dataset.more; expanded.has(id) ? expanded.delete(id) : expanded.add(id); draw(); results.querySelector(`[data-more="${id}"]`)?.focus(); return;}
    const chip = e.target.closest('[data-suggest]');
    if (chip) {f.query = chip.dataset.suggest; $('#' + uid + '-q').value = f.query; draw(); return;}
    if (e.target.closest('[data-reset]')) {
      Object.assign(f, {query: '', cls: '', topic: '', type: '', projectable: false, printable: false});
      root.querySelectorAll('[data-rs]').forEach(el => {if (el.type === 'checkbox') el.checked = false; else el.value = '';});
      $('#' + uid + '-q').value = ''; draw(); $('#' + uid + '-q').focus();
    }
  };
  const onState = () => refreshFavs();
  root.addEventListener('input', input); root.addEventListener('change', input); root.addEventListener('click', click);
  root.addEventListener('submit', e => e.preventDefault());
  try {globalThis.addEventListener?.('mx-teacher-change', onState);} catch {}
  draw();
  return () => {root.removeEventListener('input', input); root.removeEventListener('change', input); root.removeEventListener('click', click); try {globalThis.removeEventListener?.('mx-teacher-change', onState);} catch {}};
}

// Standalone page #search[/<query>].
export const searchPageMarkup = t => `<main id="main" class="page teacher-page rs-page" tabindex="-1"><h1>${t(['Rechercher', 'Search'])}</h1><p class="page-intro">${t(['Un seul champ pour les chapitres, diaporamas, exercices, automatismes, expériences, curiosités, défis, histoires, erreurs et annales de ce site.', 'One field for the chapters, slides, exercises, starters, experiments, curiosities, challenges, stories, errors and past papers of this site.'])}</p><div id="rs-host"><p role="status">${t(['Chargement…', 'Loading…'])}</p></div></main>`;
export function mountSearchPage(main, {t, state, query = ''}) {
  let stop = () => {}, gone = false;
  mountResourceSearch(main.querySelector('#rs-host'), {t, state, query, isGone: () => gone}).then(s => {stop = s; if (gone) s(); main.querySelector('#' + 'rs-host input[type=search]')?.focus();})
    .catch(() => {if (!gone) main.querySelector('#rs-host').innerHTML = `<p role="alert">${t(['La recherche n’a pas pu se charger. Recharge la page.', 'Search could not load. Reload the page.'])}</p>`;});
  return () => {gone = true; stop();};
}
