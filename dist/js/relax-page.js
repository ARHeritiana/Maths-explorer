// #relax (Détente): stay sharp, read, wonder. Independent of the class. The four pages of the day (biography, story,
// curiosity, laboratory experiment), a "Surprends-moi" draw, and the collections. Logic: relax-model.js.
// Loaded on demand; its data (reading, gallery, laboratory) is imported only when the page opens, so the student
// bundle does not carry it. The call contract is app.js mountMode: mountRelaxPage(main, {t, state, isGone}).
import {pageOfTheDay, randomPage, liveCollections, buildPools} from './relax-model.js';
import {isLiveHash} from './live-curriculum.js';

const E = x => String(x).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

async function loadPools() {
 const [r, c] = await Promise.all([import('./reading-content.js'), import('./content.js')]);
 return buildPools({BIOGRAPHIES: r.BIOGRAPHIES, STORIES: r.STORIES, labs: c.labs});
}

export async function mountRelaxPage(main, {t, isGone = () => false, pools, today = new Date(), rng = Math.random, live = isLiveHash} = {}) {
 if (isGone()) return () => {};
 const L = (fr, en) => t ? t([fr, en]) : fr, P = p => t ? t(p) : p[0];
 main.innerHTML = `<h1>${L('Détente', 'Relax')}</h1><p class="muted">${L('Rester vif, lire, s’émerveiller, sans lien avec la classe.', 'Stay sharp, read, wonder, independent of the class.')}</p><p role="status">${L('Chargement…', 'Loading…')}</p>`;
 try { pools = pools || await loadPools(); } catch { pools = {}; }
 if (isGone()) return () => {};

 const card = (it, extra = '') => {
  return `<article class="rx-card${extra}" data-rx-kind="${it.kind}"><p class="rx-kind">${E(P(it.kindLabel))}</p><h3 class="rx-title">${E(P(it.title))}</h3><p class="rx-teaser">${E(P(it.teaser))}</p><a class="rx-go" href="${E(it.hash)}">${E(P(it.action))}<span class="sr-only"> : ${E(P(it.title))}</span></a></article>`;
 };
 const day = pageOfTheDay(today, pools, {live});
 const more = liveCollections(live);
 main.innerHTML = `<h1>${L('Détente', 'Relax')}</h1>
<p class="muted">${L('Rester vif, lire, s’émerveiller, sans lien avec la classe.', 'Stay sharp, read, wonder, independent of the class.')}</p>
<section class="td-section rx-section" aria-labelledby="rx-today-h"><h2 id="rx-today-h">${L('Aujourd’hui', 'Today')}</h2>
${day.length ? `<div class="rx-grid" id="rx-today">${day.map(it => card(it)).join('')}</div>` : `<p class="muted">${L('Rien à proposer pour le moment.', 'Nothing to suggest right now.')}</p>`}</section>
<section class="td-section rx-section" aria-labelledby="rx-surprise-h"><h2 id="rx-surprise-h">${L('Surprends-moi', 'Surprise me')}</h2>
<p><button type="button" class="btn btn-secondary rx-draw" id="rx-draw">${L('Surprends-moi', 'Surprise me')}</button></p>
<p id="rx-live" class="rx-live" role="status" aria-live="polite"></p><div id="rx-surprise"></div></section>
<section class="td-section rx-section" aria-labelledby="rx-more-h"><h2 id="rx-more-h">${L('Pour aller plus loin', 'Going further')}</h2>
<ul class="rx-more">${more.map(([h, fr, en]) => `<li><a href="${h}">${L(fr, en)}</a></li>`).join('')}</ul></section>`;

 const draw = main.querySelector('#rx-draw');
 const onDraw = () => {
  const it = randomPage(pools, rng, {live});
  main.querySelector('#rx-surprise').innerHTML = it ? card(it, ' rx-surprise-card') : '';
  main.querySelector('#rx-live').textContent = it ? `${L('Page proposée :', 'Suggested page:')} ${P(it.title)} (${P(it.kindLabel)})` : L('Rien à proposer.', 'Nothing to suggest.');
 };
 draw.addEventListener('click', onDraw);
 return () => draw.removeEventListener('click', onDraw);
}
