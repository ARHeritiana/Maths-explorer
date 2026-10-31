// Topic browser and contextual links. Static model-based previews need no timers or hover interaction.
import {TOPICS,topicById,membershipByKey} from './topic-registry.js';
import {buildDiscoveryIndex,filterDiscovery,topicCounts,recommendations,FORMAT_LABELS} from './discovery-index.js';
import {BIOGRAPHIES,STORIES} from './reading-content.js';
import {university,courses,discoveryChapters} from './catalogue-data.js';
import {challengeIcon} from './challenges/registry.js';
import {PEOPLE,ADVANCES} from './history-data.js';
import {previewKind,modelPreview} from './discovery-previews.js';
const E=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const discoveryIndex = data => buildDiscoveryIndex({...data,libraryChapters:discoveryChapters,biographies:BIOGRAPHIES,stories:STORIES,people:PEOPLE,advances:ADVANCES,university,courses});
export function previewSVG(item,t) {
  const kind=previewKind(item);
  if(kind==='challenge')return `<figure class="discovery-preview discovery-emblem" data-preview="challenge">${challengeIcon(item.route.split('/')[1])}<figcaption>${E(t(item.title))}</figcaption></figure>`;
  const preview=modelPreview(kind);
  // When the data does not identify a model, show the actual title rather than an invented mathematical picture.
  if(!preview)return `<figure class="discovery-preview" data-preview="reading"><figcaption>${E(t(item.title))}</figcaption></figure>`;
  return `<figure class="discovery-preview" data-preview="${kind}"><svg viewBox="0 0 160 100" aria-hidden="true" focusable="false">${t([preview.drawing,preview.drawingEn||preview.drawing])}</svg><figcaption>${E(t(preview.caption))}</figcaption></figure>`;
}
export function isTopicRoute(id,subtopic) {return !id&&!subtopic || !!topicById(id)&&(!subtopic||!!membershipByKey(`${id}/${subtopic}`));}
const topicLink=(id,title)=>`<a href="#topics/${id}">${E(title)}</a>`;
export function discoveryPage(index,id,subtopic,t) {
  const topic=topicById(id), sub=topic?.subtopics.find(s=>s.id===subtopic), counts=topicCounts(index);
  const levels=[...new Set(index.flatMap(x=>x.level))].sort();
  const formats=[...new Set(index.flatMap(x=>[x.format,...x.formats]))];
  return `<main id="main" tabindex="-1" class="page discovery-page"><nav class="discovery-breadcrumb" aria-label="${t(['Fil d’Ariane','Breadcrumb'])}"><a href="#home">${t(['Accueil','Home'])}</a><span aria-hidden="true"> / </span>${topic?`<a href="#topics">${t(['Domaines','Topics'])}</a><span aria-hidden="true"> / </span>${sub?topicLink(topic.id,t(topic.title)):E(t(topic.title))}${sub?`<span aria-hidden="true"> / </span>${E(t(sub.title))}`:''}`:t(['Domaines','Topics'])}</nav>
  <div class="page-heading"><div><h1>${E(t(sub?.title || topic?.title || ['Explorer les mathématiques','Explore mathematics']))}</h1><p>${t(['Une idée, plusieurs chemins : manipuler, résoudre un problème, puis approfondir.','One idea, several paths: experiment, solve a problem, then study further.'])}</p></div></div>
  <nav class="topic-menu" aria-label="${t(['Domaines mathématiques','Mathematical fields'])}">${TOPICS.map(x=>`<a href="#topics/${x.id}" data-topic="${x.id}" ${id===x.id?'aria-current="page"':''}><span>${E(t(x.title))}</span><span>${counts[x.id]}</span></a>`).join('')}</nav>
  ${topic?`<nav class="topic-subtopics" aria-label="${t(['Sous-domaines','Subtopics'])}">${topic.subtopics.map(s=>`<a href="#topics/${topic.id}/${s.id}" data-topic="${topic.id}" ${subtopic===s.id?'aria-current="page"':''}>${E(t(s.title))} <span>${filterDiscovery(index,{topic:topic.id,subtopic:s.id}).length}</span></a>`).join('')}</nav>`:''}
  <form class="discovery-filters" role="search" id="discovery-filters"><label>${t(['Rechercher une idée','Find an idea'])}<input type="search" name="query" autocomplete="off"></label><label>${t(['Format','Format'])}<select name="format"><option value="">${t(['Tous les formats','All formats'])}</option>${formats.map(f=>`<option value="${f}">${E(t(FORMAT_LABELS[f]))}</option>`).join('')}</select></label><label>${t(['Niveau','Level'])}<select name="level"><option value="">${t(['Tous les niveaux','All levels'])}</option>${levels.map(l=>`<option value="${E(l)}">${E(l)}</option>`).join('')}</select></label><button type="reset" class="secondary">${t(['Réinitialiser','Reset'])}</button></form>
  <p id="discovery-count" role="status" aria-live="polite" aria-atomic="true"></p><div id="discovery-results" class="discovery-results"></div></main>`;
}
export function discoveryCards(items,t) {
  return items.length?items.map(x=>`<article class="discovery-card" data-topic="${x.memberships[0].split('/')[0]}">${previewSVG(x,t)}<div><p class="section-kicker">${E(t(FORMAT_LABELS[x.format]))} · ${E(t(x.level))}</p><h2><a href="${E(x.route)}">${E(t(x.title))}</a></h2>${t(x.summary)?`<p>${E(t(x.summary))}</p>`:''}<div class="discovery-tags">${[...new Set(x.memberships.map(m=>m.split('/')[0]))].map(id=>topicLink(id,t(topicById(id).title))).join('')}</div></div></article>`).join(''):`<p>${t(['Aucune ressource ne correspond à ces critères.','No resources match these filters.'])}</p>`;
}
export function bindDiscovery(root,index,id,subtopic,t) {
  const form=root.querySelector('#discovery-filters');
  const update=()=>{const result=filterDiscovery(index,{topic:id,subtopic,query:form.elements.query.value,format:form.elements.format.value,level:form.elements.level.value});root.querySelector('#discovery-count').textContent=t([`${result.length} ressources`,`${result.length} resources`]);root.querySelector('#discovery-results').innerHTML=discoveryCards(result,t);};
  const reset=()=>{form.elements.query.value='';form.elements.format.value='';form.elements.level.value='';update();};
  const submit=e=>e.preventDefault();
  form.addEventListener('input',update);form.addEventListener('reset',reset);form.addEventListener('submit',submit);update();
  return ()=>{form.removeEventListener('input',update);form.removeEventListener('reset',reset);form.removeEventListener('submit',submit);};
}
export function discoveryContext(index,route,t) {
  const item=index.find(x=>x.route===route);if(!item)return '';
  const related=recommendations(index,route);
  return `<aside class="discovery-context" aria-label="${t(['Cette idée dans le site','This idea across the site'])}"><nav aria-label="${t(['Domaines de cette ressource','Fields of this resource'])}"><a href="#topics">${t(['Explorer par domaine','Browse by field'])}</a>${item.memberships.slice(0,4).map(m=>{const k=membershipByKey(m);return ` / <a href="#topics/${m}">${E(t(k.topic.title))} : ${E(t(k.subtopic.title))}</a>`;}).join('')}</nav>${related.length?`<details><summary>${t(['Poursuivre cette idée','Follow this idea'])}</summary><ul>${related.map(x=>`<li><a href="${E(x.route)}">${E(t(x.title))}</a> <span class="muted">${E(t(FORMAT_LABELS[x.format]))}</span></li>`).join('')}</ul></details>`:''}</aside>`;
}
