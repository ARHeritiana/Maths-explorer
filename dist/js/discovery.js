// Topic browser and contextual links. Each preview is also a link to its resource (CSS-only hover motion, no timers).
import {TOPICS,topicById,membershipByKey,TOPIC_FIGURES,TOPIC_STARTERS,DIFFICULTY_BANDS} from './topic-registry.js';
import {buildDiscoveryIndex,filterDiscovery,topicCounts,recommendations,FORMAT_LABELS} from './discovery-index.js';
import {BIOGRAPHIES,STORIES} from './reading-content.js';
import {university,courses,discoveryChapters} from './catalogue-data.js';
import {challengeIcon} from './challenges/registry.js';
import {PEOPLE,ADVANCES} from './history-data.js';
import {previewKind,modelPreview} from './discovery-previews.js';
import {all as ERROR_RECORDS} from './errors-model.js';
import {discoveryLessons} from './basics-page.js';
const E=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Foundations lessons indexed in the topic browser; older arithmetic lessons remain outside it.
const FOUNDATION_LESSONS=[{id:'sets',title:['Ensembles','Sets and operations'],summary:['Diagrammes de Venn, réunion, intersection, différence, complémentaire, questions et lois sur les ensembles.','Venn diagrams, union, intersection, difference, complement, questions and the laws of sets.'],topics:['foundations/sets'],concepts:['sets','venn'],links:['#basics/logic-propositions']}];
FOUNDATION_LESSONS.push({id:'fractions',title:['Le laboratoire des fractions','The fractions lab'],summary:['Construire, comparer et calculer avec les fractions : barres, droite graduée, aires et parcours guidé.','Explore fractions with bars, a number line, areas and guided challenges.'],topics:['arithmetic/calculation'],concepts:['fractions','proportions']});
FOUNDATION_LESSONS.push(...discoveryLessons());
export const discoveryIndex = data => buildDiscoveryIndex({...data,lessons:FOUNDATION_LESSONS,libraryChapters:discoveryChapters,biographies:BIOGRAPHIES,stories:STORIES,people:PEOPLE,advances:ADVANCES,university,courses,errors:ERROR_RECORDS()});
export function previewSVG(item,t) {
  const kind=previewKind(item);
  if(kind==='challenge')return `<figure class="discovery-preview discovery-emblem" data-preview="challenge">${challengeIcon(item.route.split('/')[1])}<figcaption>${E(t(item.title))}</figcaption></figure>`;
  const preview=modelPreview(kind);
  // When the data does not identify a model, show the actual title rather than an invented mathematical picture.
  if(!preview)return `<figure class="discovery-preview" data-preview="reading"><figcaption>${E(t(item.title))}</figcaption></figure>`;
  return `<figure class="discovery-preview" data-preview="${kind}"><svg viewBox="0 0 160 100" aria-hidden="true" focusable="false">${t([preview.drawing,preview.drawingEn||preview.drawing])}</svg><figcaption>${E(t(preview.caption))}</figcaption></figure>`;
}
// Field menu figure: the model preview of the field (static SVG, decorative; the field name is the link text).
function topicFigure(id,t) {
  const preview=modelPreview(TOPIC_FIGURES[id]);
  return preview?`<svg class="topic-figure" viewBox="0 0 160 100" aria-hidden="true" focusable="false">${t([preview.drawing,preview.drawingEn||preview.drawing])}</svg>`:'';
}
// Landing selection: a few doors of different kinds before the full list (routes missing from the index are skipped).
export function topicStarters(index) {return TOPIC_STARTERS.map(route=>index.find(x=>x.route===route)).filter(Boolean);}
function startersBlock(index,t) {
  const items=topicStarters(index);
  return items.length?`<section class="topics-starters" aria-labelledby="topics-start"><h2 class="topics-heading" id="topics-start">${t(['Pour commencer','Where to start'])}</h2><div class="discovery-results">${discoveryCards(items,t)}</div></section>`:'';
}
export function isTopicRoute(id,subtopic) {return !id&&!subtopic || !!topicById(id)&&(!subtopic||!!membershipByKey(`${id}/${subtopic}`));}
const topicLink=(id,title)=>`<a href="#topics/${id}">${E(title)}</a>`;
export function discoveryPage(index,id,subtopic,t) {
  const topic=topicById(id), sub=topic?.subtopics.find(s=>s.id===subtopic), counts=topicCounts(index);
  const levels=[...new Set(index.flatMap(x=>x.level))].sort();
  const formats=[...new Set(index.flatMap(x=>[x.format,...x.formats]))];
  return `<main id="main" tabindex="-1" class="page discovery-page"><nav class="discovery-breadcrumb" aria-label="${t(['Fil d’Ariane','Breadcrumb'])}"><a href="#home">${t(['Accueil','Home'])}</a><span aria-hidden="true"> / </span>${topic?`<a href="#topics">${t(['Domaines','Topics'])}</a><span aria-hidden="true"> / </span>${sub?topicLink(topic.id,t(topic.title)):E(t(topic.title))}${sub?`<span aria-hidden="true"> / </span>${E(t(sub.title))}`:''}`:t(['Domaines','Topics'])}</nav>
  <div class="page-heading"><div><h1>${E(t(sub?.title || topic?.title || ['Explorer les mathématiques','Explore mathematics']))}</h1><p>${t(['Une idée, plusieurs chemins : manipuler, résoudre un problème, puis approfondir.','One idea, several paths: experiment, solve a problem, then study further.'])}</p></div></div>
  ${topic?`<details class="secondary-tools topic-switch"><summary>${t(['Changer de domaine','Choose another field'])}</summary>`:`<h2 class="topics-heading topics-field-heading">${t(['Choisir un domaine','Choose a field'])}</h2>`}<nav class="topic-menu topic-menu-figures${topic?'':' topic-menu-landing'}" aria-label="${t(['Domaines mathématiques','Mathematical fields'])}">${TOPICS.map(x=>`<a href="#topics/${x.id}" ${id===x.id?'aria-current="page"':''}>${topicFigure(x.id,t)}<span class="topic-name">${E(t(x.title))}</span><span class="topic-count" aria-label="${t([`${counts[x.id]} ressources`,`${counts[x.id]} resources`])}">${counts[x.id]}</span></a>`).join('')}</nav>${topic?'</details>':''}
  ${topic?`<nav class="topic-subtopics" aria-label="${t(['Sous-domaines','Subtopics'])}">${topic.subtopics.map(s=>`<a href="#topics/${topic.id}/${s.id}" ${subtopic===s.id?'aria-current="page"':''}>${E(t(s.title))} <span>${filterDiscovery(index,{topic:topic.id,subtopic:s.id}).length}</span></a>`).join('')}</nav>`:''}
  <form class="discovery-filters" role="search" id="discovery-filters"><label>${t(['Rechercher une idée','Find an idea'])}<input type="search" name="query" autocomplete="off"></label><details class="secondary-tools discovery-more-filters"><summary>${t(['Affiner la recherche','Refine the search'])}</summary><div class="discovery-extra-filters"><label>${t(['Format','Format'])}<select name="format"><option value="">${t(['Tous les formats','All formats'])}</option>${formats.map(f=>`<option value="${f}">${E(t(FORMAT_LABELS[f]))}</option>`).join('')}</select></label><label>${t(['Difficulté','Difficulty'])}<select name="difficulty"><option value="">${t(['Toutes les difficultés','All difficulties'])}</option>${DIFFICULTY_BANDS.map(b=>`<option value="${b.id}">${'★'.repeat(b.id)} ${E(t(b.title))}</option>`).join('')}</select></label><label>${t(['Niveau','Level'])}<select name="level"><option value="">${t(['Tous les niveaux','All levels'])}</option>${levels.map(l=>`<option value="${E(l)}">${E(l)}</option>`).join('')}</select></label><button type="reset" class="secondary">${t(['Réinitialiser','Reset'])}</button></div></details></form>
  ${topic?'':startersBlock(index,t)}
  <details class="topic-catalogue secondary-tools" ${topic?'open':''}><summary>${t(topic?['Les ressources de ce domaine','Resources in this field']:['Tout parcourir','Browse everything'])}</summary><p id="discovery-count" role="status" aria-live="polite" aria-atomic="true"></p><div id="discovery-results" class="discovery-results"></div></details></main>`;
}
export function discoveryCards(items,t) {
  return items.length?items.map(x=>`<article class="discovery-card"><a class="discovery-thumb" href="${E(x.route)}" tabindex="-1" aria-hidden="true">${previewSVG(x,t)}</a><div><p class="section-kicker">${E(t(FORMAT_LABELS[x.format]))} · ${E(t(x.level))}</p><h2><a href="${E(x.route)}">${E(t(x.title))}</a></h2>${t(x.summary)?`<p>${E(t(x.summary))}</p>`:''}<div class="discovery-tags">${[...new Set(x.memberships.map(m=>m.split('/')[0]))].map(id=>`<span>${E(t(topicById(id).title))}</span>`).join(' · ')}</div></div></article>`).join(''):`<p>${t(['Aucune ressource ne correspond à ces critères.','No resources match these filters.'])}</p>`;
}
export function bindDiscovery(root,index,id,subtopic,t) {
  const form=root.querySelector('#discovery-filters');
  const BATCH=24,box=root.querySelector('#discovery-results');let result=[],shown=BATCH;
  const draw=()=>{const rest=result.length-shown;box.innerHTML=discoveryCards(result.slice(0,shown),t)+(rest>0?`<button type="button" class="btn btn-secondary discovery-more">${t([`Afficher la suite (${rest} de plus)`,`Show more (${rest} left)`])}</button>`:'');};
  const update=()=>{const searching=Boolean(form.elements.query.value.trim()||form.elements.format.value||form.elements.level.value||form.elements.difficulty.value);(root.querySelector('.discovery-page')||root).classList?.toggle('is-searching',searching);const catalogue=root.querySelector('.topic-catalogue');if(searching&&catalogue)catalogue.open=true;result=filterDiscovery(index,{topic:id,subtopic,query:form.elements.query.value,format:form.elements.format.value,level:form.elements.level.value,difficulty:form.elements.difficulty.value});shown=BATCH;root.querySelector('#discovery-count').textContent=t([`${result.length} ressources`,`${result.length} resources`]);draw();};
  const more=e=>{if(!e.target.closest('.discovery-more'))return;const first=shown;shown+=BATCH;draw();box.querySelectorAll('.discovery-card')[first]?.querySelector('a')?.focus();};
  box.addEventListener('click',more);
  const reset=()=>{form.elements.query.value='';form.elements.format.value='';form.elements.level.value='';form.elements.difficulty.value='';update();};
  const submit=e=>e.preventDefault();
  form.addEventListener('input',update);form.addEventListener('reset',reset);form.addEventListener('submit',submit);update();
  return ()=>{box.removeEventListener('click',more);form.removeEventListener('input',update);form.removeEventListener('reset',reset);form.removeEventListener('submit',submit);};
}
export function discoveryContext(index,route,t) {
  const item=index.find(x=>x.route===route);if(!item)return '';
  const related=recommendations(index,route);
  return `<aside class="discovery-context" aria-label="${t(['Cette idée dans le site','This idea across the site'])}"><nav aria-label="${t(['Domaines de cette ressource','Fields of this resource'])}"><a href="#topics">${t(['Explorer par domaine','Browse by field'])}</a>${item.memberships.slice(0,1).map(m=>{const k=membershipByKey(m);return ` / <a href="#topics/${m}">${E(t(k.topic.title))} : ${E(t(k.subtopic.title))}</a>`;}).join('')}</nav>${related.length?`<details><summary>${t(['Poursuivre cette idée','Follow this idea'])}</summary><ul>${related.map(x=>`<li><a href="${E(x.route)}">${E(t(x.title))}</a> <span class="muted">${E(t(FORMAT_LABELS[x.format]))}</span></li>`).join('')}</ul></details>`:''}</aside>`;
}
