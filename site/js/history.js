// Linked chronological views. Data and dates are shared by discovery, reading and this page.
import {PEOPLE,ADVANCES,DATE_KINDS,dateLabel,historyRecord,historyLinks,queryHistory,personById,historyRoute} from './history-data.js';
import {TOPICS} from './topic-registry.js';
const E=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function isHistoryRoute(kind,id){return !kind&&!id || ['people','advances'].includes(kind)&&(!id||!!historyRecord(kind,id));}
const title=(kind,t)=>t(kind==='people'?['Personnes et traditions','People and traditions']:['Idées, découvertes et preuves','Ideas, discoveries and proofs']);
const language=t=>t(['fr','en']);
function links(kind,item,t,index){
 const valid=index?new Set(index.map(x=>x.route)):null;
 const internal=historyLinks(kind,item).filter(route=>route.startsWith('#history/')||!valid||valid.has(route));
 if(!internal.length)return '';
 return `<nav class="history-links" aria-label="${t(['Personnes, idées et expériences liées','Related people, ideas and experiments'])}">${internal.map(route=>{
   let label;const [,k,id]=route.slice(1).split('/');
   if(route.startsWith('#history/')){const r=historyRecord(k,id);label=r?.name||t(r?.title||[id,id]);}
   else label=t(index?.find(x=>x.route===route)?.title||[route,route]);
   return `<a href="${E(route)}">${E(label)}</a>`;
 }).join('')}</nav>`;
}
export function historyCards(kind,items,t,index){
 return items.length?`<ol class="history-list">${items.map(item=>`<li><article><p class="history-date">${E(dateLabel(item,language(t)))}${kind==='advances'?` · ${E(t(DATE_KINDS[item.kind]))}`:item.dateType==='documentary'?` · ${t(['Repère de recherche','Research milestone'])}`:''}</p><h2><a href="${historyRoute(kind,item.id)}">${E(item.name||t(item.title))}</a></h2>${item.context?`<p class="history-context">${E(t(item.context))}</p>`:''}<p>${E(t(item.summary))}</p>${links(kind,item,t,index)}<p class="history-source"><a href="${E(item.source)}" target="_blank" rel="noopener noreferrer">${t(['Source documentaire','Documentary source'])}<span class="sr-only"> ${t(['(nouvel onglet)','(new tab)'])}</span></a></p></article></li>`).join('')}</ol>`:`<p>${t(['Aucun repère ne correspond à cette recherche.','No milestones match this search.'])}</p>`;
}
export function historyPage(kind='people',id,t,index){
 kind=kind||'people';const item=id?historyRecord(kind,id):null;
 return `<main id="main" class="page history-page" tabindex="-1"><nav class="discovery-breadcrumb" aria-label="${t(['Fil d’Ariane','Breadcrumb'])}"><a href="#home">${t(['Accueil','Home'])}</a> / <a href="#topics/history">${t(['Histoire des mathématiques','History of mathematics'])}</a> / ${item?`<a href="#history/${kind}">${title(kind,t)}</a>`:title(kind,t)}</nav><div class="page-heading"><div><h1>${E(item?.name||item&&t(item.title)||t(['Repères dans l’histoire des mathématiques','Milestones in mathematical history']))}</h1><p>${t(['Une sélection extensible de personnes, traditions et idées. Les dates de documents, découvertes, preuves et publications sont distinguées. Les connaissances circulent et se construisent collectivement.','An extensible selection of people, traditions and ideas. Document, discovery, proof and publication dates are distinguished. Knowledge travels and is built collectively.'])}</p></div></div><nav class="history-tabs" aria-label="${t(['Deux chronologies liées','Two linked timelines'])}"><a href="#history/people" ${kind==='people'?'aria-current="page"':''}>${t(['Personnes et traditions','People and traditions'])} (${PEOPLE.length})</a><a href="#history/advances" ${kind==='advances'?'aria-current="page"':''}>${t(['Idées et résultats','Ideas and results'])} (${ADVANCES.length})</a></nav>${item?historyCards(kind,[item],t,index):`<p class="muted">${t(['« Vers » indique une approximation. « Documents » indique une période de recherche attestée, jamais une naissance supposée. La sélection couvre plusieurs traditions sans prétendre raconter toute l’histoire.','“c.” marks an approximation. “Documents” denotes an attested research period, never an assumed birth. The selection covers several traditions without claiming to tell the whole history.'])}</p><form id="history-filters" class="discovery-filters" role="search"><label>${t(['Personne ou idée','Person or idea'])}<input type="search" name="query" autocomplete="off"></label><label>${t(['Domaine','Field'])}<select name="topic"><option value="">${t(['Tous les domaines','All fields'])}</option>${TOPICS.filter(x=>x.id!=='history').map(x=>`<option value="${x.id}">${E(t(x.title))}</option>`).join('')}</select></label><label>${t(['À partir de l’année','From year'])}<input type="number" name="from" min="-3000" max="2100" placeholder="-3000"></label><label>${t(['Jusqu’à l’année','Through year'])}<input type="number" name="to" min="-3000" max="2100" placeholder="2026"></label><button type="reset" class="secondary">${t(['Réinitialiser','Reset'])}</button></form><p id="history-count" role="status" aria-live="polite" aria-atomic="true"></p><div id="history-results"></div>`}</main>`;
}
export function bindHistory(root,kind='people',t,index){
 const form=root.querySelector('#history-filters');if(!form)return()=>{};
 const update=()=>{
   const from=form.elements.from.value===''?-Infinity:Number(form.elements.from.value),to=form.elements.to.value===''?Infinity:Number(form.elements.to.value);
   const items=from>to?[]:queryHistory(kind||'people',{query:form.elements.query.value,topic:form.elements.topic.value,from,to});
   root.querySelector('#history-count').textContent=from>to?t(['La première année doit précéder la dernière.','The first year must precede the last.']):t([`${items.length} repères`,`${items.length} milestones`]);
   root.querySelector('#history-results').innerHTML=historyCards(kind||'people',items,t,index);
 };
 const reset=()=>{for(const field of ['query','topic','from','to'])form.elements[field].value='';update();};
 const submit=e=>e.preventDefault();form.addEventListener('input',update);form.addEventListener('reset',reset);form.addEventListener('submit',submit);update();
 return()=>{form.removeEventListener('input',update);form.removeEventListener('reset',reset);form.removeEventListener('submit',submit);};
}
