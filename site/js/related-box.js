// "Related resources" box of a chapter, gallery exhibit or laboratory experiment page. Loaded on demand by app.js (`mountRelated`)
// once the end of the page nears the viewport: it pulls in the one resource index (resource-sources.js), so students never pay
// for it unless they read down. Fed by `relatedForPage` of resource-index.js (the shared RELATIONS registry); nothing is listed
// twice on a page, and when nothing survives nothing is rendered (the slot is removed). No slides: the deck index is never fetched.
import {relatedForPage, primaryHref, typeLabel, routeBase} from './resource-index.js';
import {buildLiveResourceIndex} from './resource-sources.js';

const E = x => String(x).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const CLASS_NAMES = {seconde: 'Seconde', premiere: 'Première spécialité', terminale: 'Terminale spécialité', expertes: 'Maths expertes', stmg: 'Terminale STMG'};

// Every in-page address already shown outside the slot (read-also, related lessons, the chapter's lab block, discovery links...).
export const shownHrefs = (main, slot) => [...main.querySelectorAll('a[href^="#"]')].filter(a => !slot.contains(a)).map(a => a.getAttribute('href'));

export function relatedBoxHtml(items, t) {
  if (!items.length) return '';
  const L = (fr, en) => t([fr, en]);
  return `<aside class="related-box" aria-labelledby="related-box-title"><h2 id="related-box-title">${L('Ressources liées', 'Related resources')}</h2><ul class="related-list">${items.map(it => {
    const cls = it.type === 'chapter' && it.classes.length ? ' · ' + E(CLASS_NAMES[it.classes[0]] || it.classes[0]) : '';
    return `<li><a href="${E(primaryHref(it))}"><span class="related-title">${E(t(it.title))}</span><span class="related-type">${E(t(typeLabel(it.type)))}${cls}</span></a></li>`;
  }).join('')}</ul></aside>`;
}

// Fills `slot` (a placeholder at the end of `main`) for the page at `hash`; returns nothing, removes the slot when empty.
export function fillRelatedBox(slot, {main, hash, t, index}) {
  index ||= buildLiveResourceIndex({decks: null});
  const own = routeBase(hash);
  const items = relatedForPage(index, hash, {excludeHrefs: [...shownHrefs(main, slot), own]}).filter(it => routeBase(primaryHref(it)) !== own);
  const html = relatedBoxHtml(items, t);
  if (html) slot.innerHTML = html; else slot.remove();
  return items;
}
