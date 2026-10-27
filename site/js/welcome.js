// Useful home entrances reuse the shared discovery catalogue and mathematical previews.
import {filterDiscovery, FORMAT_LABELS} from './discovery-index.js';
import {previewSVG} from './discovery.js';
import {discoveryChapters, courses, university} from './catalogue-data.js';
const languageLabel = item => {
 const chapter=discoveryChapters.find(c=>item.route==='#chapter/'+c.id||item.route==='#library/'+c.id);
 if(chapter)return (courses.find(c=>c.id===chapter.course)?.contentLanguage||'fr').toUpperCase();
 if(item.route.startsWith('#university/'))return (university.sections.find(s=>s.sequences.some(q=>item.route==='#university/'+q.id))?.language||'fr').toUpperCase();
 return 'FR / EN';
};
const E=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const TOOLS=[
['quadratic',['Explorer une fonction','Explore a function'],['Change les coefficients et observe la parabole.','Change coefficients and observe the parabola.'],['Tracer une parabole','Plot a parabola']],
['derivative',['Comprendre une dérivée','Understand a derivative'],['Rapproche deux points pour observer la tangente.','Bring two points closer to observe the tangent.'],['Explorer la tangente','Explore the tangent']],
['integral',['Comprendre une intégrale','Understand an integral'],['Compare les rectangles et l’aire sous une courbe.','Compare rectangles and the area under a curve.'],['Approcher une aire','Approximate an area']],
['probability',['Simuler le hasard','Simulate chance'],['Répète une expérience et compare les fréquences.','Repeat an experiment and compare frequencies.'],['Lancer une simulation','Run a simulation']],
['sequences',['Étudier une suite','Explore a sequence'],['Observe les termes et fais varier les paramètres.','Observe terms and vary the parameters.'],['Explorer les termes','Explore the terms']],
['space-lines',['Manipuler la géométrie dans l’espace','Explore spatial geometry'],['Fais tourner une figure et observe droites et plans.','Rotate a figure and inspect lines and planes.'],['Ouvrir la figure 3D','Open the 3D figure']]
];
export function homePage({pair,t,link,index=[],last=''}) {
 const featured=['fourier','mandelbrot','platonic'].map(id=>index.find(x=>x.route==='#gallery/'+id)).filter(Boolean);
 const resume=index.find(x=>x.route==='#chapter/'+last);
 return `<main id="main" class="page entrance" tabindex="-1">
 <section class="entrance-intro"><div><p class="home-greeting" lang="mg">Tonga soa</p>
 <h1>${pair('Comprendre les maths','Understand maths')} <span class="home-highlight">${pair('en les explorant.','through exploration.')}</span></h1>
 <p>${pair('Des cours, des figures à manipuler et des exercices pour passer de l’intuition au raisonnement.','Lessons, hands-on figures and exercises to move from intuition to reasoning.')}</p>
 <form id="home-search" role="search"><label for="home-query">${pair('Que veux-tu comprendre ?','What would you like to understand?')}</label><div class="home-search-row"><input id="home-query" type="search" autocomplete="off" placeholder="${pair('Une idée : dérivée, hasard, géométrie…','An idea: derivative, chance, geometry…')}"><button class="btn btn-primary" type="submit">${pair('Rechercher','Search')}</button></div></form>
 <div class="entrance-actions"><a class="btn btn-primary" href="${link('resources')}">${pair('Trouver un cours','Find a lesson')}</a><a class="btn btn-secondary" href="${link('lab')}">${pair('Explorer les outils','Explore the tools')}</a></div>
 ${resume?`<a class="home-resume" href="${E(resume.route)}">${pair('Reprendre :','Continue:')} ${E(t(resume.title))}</a>`:''}
 </div><div class="entrance-art">${previewSVG(index.find(x=>x.route==='#lab/quadratic'),t)}</div></section>
 <section id="home-search-panel" hidden aria-label="${pair('Résultats de recherche','Search results')}"><p id="home-search-count" role="status" aria-live="polite"></p><div id="home-results" class="home-results"></div></section>
 <section id="home-tools" class="entrance-section"><h2>${pair('Les outils pour comprendre','Tools for understanding')}</h2><p>${pair('Une question, une figure, à toi d’essayer.','A question, a figure, your turn to try.')}</p><div class="tool-grid">${TOOLS.filter(([id])=>index.some(x=>x.route==='#lab/'+id)).map(([id,title,description,action])=>`<a class="tool-card" href="#lab/${id}">${previewSVG(index.find(x=>x.route==='#lab/'+id),t)}<div><h3>${E(t(title))}</h3><p>${E(t(description))}</p><span class="task-link">${E(t(action))} →</span></div></a>`).join('')}</div><a class="text-link" href="#lab">${pair('Tous les outils','All tools')} →</a></section>
 <section class="entrance-section"><h2>${pair('Explorer une idée','Explore an idea')}</h2><div class="idea-grid">${featured.map(x=>`<a class="idea-card" href="${E(x.route)}">${previewSVG(x,t)}<h3>${E(t(x.title))}</h3><span class="task-link">${pair('Voir et manipuler','View and explore')} →</span></a>`).join('')}</div></section>
 <section class="home-reading"><h2>${pair('Les idées ont une histoire','Ideas have a history')}</h2><p>${pair('Relie les découvertes aux personnes et aux questions qui les ont fait naître.','Connect discoveries to the people and questions behind them.')}</p><a class="text-link" href="#history">${pair('Parcourir les chronologies','Browse the timelines')} →</a><a class="text-link" href="#stories">${pair('Lire une histoire mathématique','Read a mathematical story')} →</a></section>
 </main>`;
}
export function bindHome(root,index,t) {
 root.querySelectorAll('.tool-card svg path:not(.preview-axis), .idea-card svg path:not(.preview-axis)').forEach(path=>path.setAttribute('pathLength','1'));
 const form=root.querySelector('#home-search'),input=form.querySelector('input'),panel=root.querySelector('#home-search-panel'),results=root.querySelector('#home-results'),count=root.querySelector('#home-search-count');
 const update=()=>{
 const query=input.value.trim();panel.hidden=!query;
 if(!query){results.replaceChildren();count.textContent='';return;}
 const aliases={hasard:'probabil',chance:'probabil',parabole:'quadratic',parabola:'quadratic',trinome:'quadratic',quadratics:'quadratic',derivee:'deriv',integrale:'integral'};
 const key=query.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const found=filterDiscovery(index,{query:aliases[key]||query});
 count.textContent=t([`${found.length} résultats`,`${found.length} results`]);
 results.innerHTML=found.length?found.map(x=>`<a class="home-result" href="${E(x.route)}"><strong>${E(t(x.title))}</strong><span>${E(t(FORMAT_LABELS[x.format]))} · ${E(t(x.level))} · ${languageLabel(x)}</span></a>`).join(''):`<p>${t(['Aucun résultat. Essaie un autre mot ou parcours les domaines.','No results. Try another word or browse the topics.'])} <a class="text-link" href="#topics">${t(['Voir les domaines','Browse topics'])}</a></p>`;
 };
 const submit=e=>{e.preventDefault();update();panel.scrollIntoView({block:'nearest'});};
 form.addEventListener('submit',submit);input.addEventListener('input',update);
 return ()=>{form.removeEventListener('submit',submit);input.removeEventListener('input',update);};
}
const card = (l, href, t, pair, link) => `<a class="wonder" href="${link(href,l.id)}"><canvas data-art="${l.id}" role="img" aria-label="${t(l.title)}"></canvas><span class="wonder-body"><strong>${t(l.title)}</strong><span>${t(l.intro)}</span><span class="wonder-go">${pair("Explorer","Explore")} →</span></span></a>`;
export function galleryPage({ pair, t, link, labs }) {
  const items = labs.filter((l) => l.custom);
  return `<main id="main" class="page gallery-page" tabindex="-1">
  <div class="page-heading"><div><h1>${pair("Curiosités", "Curiosities")}</h1><p>${pair("Des idées de mathématiques qui se regardent d’abord. Touche, glisse, change un réglage : chaque pièce se manipule.", "Mathematical ideas that you look at first. Touch, drag, change a setting: every piece can be handled.")}</p></div></div>
  <div class="wonder-grid">${items.map((l) => card(l, "gallery", t, pair, link)).join("")}</div>
  <p class="editorial-note">${pair("Pour des expériences guidées autour de formules, de courbes et de données, voir le laboratoire.", "For guided experiments with formulas, curves and data, see the laboratory.")} <a href="${link("lab")}">${pair("Ouvrir le laboratoire", "Open the laboratory")}</a></p>
</main>`;
}
