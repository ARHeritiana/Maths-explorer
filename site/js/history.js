// Visual history atlas and its accessible chronological reading view share the existing sourced records.
import {PEOPLE,ADVANCES,DATE_KINDS,dateLabel,historyRecord,historyLinks,queryHistory,historyRoute} from './history-data.js';
import {HISTORY_IMAGES} from './history-images.js';
import {HISTORY_ERAS,timePosition,timelineLayout} from './history-layout.js';
import {TOPICS} from './topic-registry.js';
import {assetHref} from './data-loader.js';
const E=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const language=t=>t(['fr','en']);
// Raw attribution stays in the register; display copy follows the site punctuation policy.
const attribution=x=>E(String(x).replace(/[–—]/g,'-').replace(/Unknown authorUnknown author/g,'Unknown author'));
const name=(item,t)=>item.name||t(item.title);
const year=(n,t)=>n<0?t([`${-n} av. n. è.`,`${-n} BCE`]):String(n);
export function isHistoryRoute(kind,id){return !kind&&!id || ['people','advances'].includes(kind)&&(!id||!!historyRecord(kind,id));}
const title=(kind,t)=>t(kind==='people'?['Personnes et traditions','People and traditions']:['Idées, découvertes et preuves','Ideas, discoveries and proofs']);
const imageFor=(kind,item)=>HISTORY_IMAGES[item.id]||(kind==='people'&&item.id==='ahmes'?HISTORY_IMAGES.rhind:null)||(kind==='people'&&item.id==='euclid'?HISTORY_IMAGES.elements:null);
function picture(kind,item,t,large=false){
 const img=imageFor(kind,item);
 if(!img)return `<span class="history-monogram" aria-hidden="true">${E((item.name||t(item.title)).split(/\s+/).slice(0,2).map(w=>w[0]).join(''))}</span>`;
 const alt=img.type==='artifact'?t(['Document associé, pas un portrait','Related document, not a portrait']):t(['Portrait de ','Portrait of '])+name(item,t);
 return `<img class="history-image" src="${E(assetHref(img.src))}" width="${img.width}" height="${img.height}" alt="${E(alt)}" loading="lazy" decoding="async"${large?' sizes="(max-width: 600px) 90vw, 320px"':''}>`;
}
function credit(kind,item,t){
 const img=imageFor(kind,item);if(!img)return '';
 return `<details class="history-credit"><summary>${t(['Image : source et licence','Image: source and licence'])}</summary><p><a href="${E(img.source)}" target="_blank" rel="noopener noreferrer">${attribution(img.title)}</a></p><p>${attribution(img.creator)}</p>${img.credit?`<p>${attribution(img.credit)}</p>`:''}<p><a href="${E(img.licenseUrl)}" target="_blank" rel="noopener noreferrer">${E(img.license)}</a> · ${t(['Redimensionnée, convertie en WebP ; recadrage d’affichage.','Resized, converted to WebP; cropped for display.'])}</p>${img.type==='artifact'?`<p>${t(['Ce document illustre la tradition écrite, pas l’apparence de son auteur.','This document illustrates the written tradition, not its author’s appearance.'])}</p>`:''}</details>`;
}
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
const date=(kind,item,t)=>E(dateLabel(item,language(t)))+(kind==='advances'?` · ${E(t(DATE_KINDS[item.kind]))}`:item.dateType==='documentary'?` · ${t(['Repère documentaire','Documentary milestone'])}`:'');
export function historyCards(kind,items,t,index){
 return items.length?`<ol class="history-list">${items.map(item=>`<li><article><a class="history-card-picture" href="${historyRoute(kind,item.id)}" tabindex="-1" aria-hidden="true">${picture(kind,item,t)}</a><div class="history-card-text"><p class="history-date">${date(kind,item,t)}</p><h2><a href="${historyRoute(kind,item.id)}">${E(name(item,t))}</a></h2>${item.context?`<p class="history-context">${E(t(item.context))}</p>`:''}<p>${E(t(item.summary))}</p>${links(kind,item,t,index)}<p class="history-source"><a href="${E(item.source)}" target="_blank" rel="noopener noreferrer">${t(['Source documentaire','Documentary source'])}<span class="sr-only"> ${t(['(nouvel onglet)','(new tab)'])}</span></a></p>${credit(kind,item,t)}</div></article></li>`).join('')}</ol>`:`<div class="history-empty"><h2>${t(['Aucun repère trouvé','No milestones found'])}</h2><p>${t(['Essaie un autre nom, un autre domaine ou une période plus large.','Try another name, another field or a wider date range.'])}</p><button type="button" class="secondary" data-history-reset>${t(['Effacer les filtres','Clear filters'])}</button></div>`;
}
function atlas(kind,items,t,zoom,textScale=1){
 const layout=timelineLayout(items,zoom,184*textScale,16*textScale),rowHeight=148*textScale;
 const ticks=HISTORY_ERAS.flatMap(era=>{
  const step=era.from<0?500:era.from<1400?200:era.from<1700?100:era.from<1850?50:25;
  const values=[];for(let y=Math.ceil(era.from/step)*step;y<era.to;y+=step)values.push(y);
  return values;
 });
 return `<div class="history-atlas" style="--atlas-width:${layout.width}px;--atlas-height:${Math.max(1,layout.lanes)*rowHeight+112*textScale}px"><div class="history-era-bands" aria-hidden="true">${HISTORY_ERAS.map(era=>`<div style="left:${timePosition(era.from,zoom)}px;width:${era.width*zoom}px"><strong>${E(t(era.title))}</strong><span>${year(era.from,t)} / ${year(era.to,t)}</span></div>`).join('')}</div><div class="history-ruler" aria-hidden="true">${ticks.map(y=>`<span style="left:${timePosition(y,zoom)}px">${year(y,t)}</span>`).join('')}</div><div class="history-gridlines" aria-hidden="true">${ticks.map(y=>`<i style="left:${timePosition(y,zoom)}px"></i>`).join('')}</div>${layout.placed.map(({item,x,lane,end})=>`<a class="history-node ${kind==='advances'?'history-node-event':''} ${item.approximate?'is-approximate':''}" href="${historyRoute(kind,item.id)}" data-history-id="${item.id}" data-history-lane="${lane}" style="left:${x}px;top:${112*textScale+lane*rowHeight}px" aria-label="${E(name(item,t))}, ${date(kind,item,t)}"><span class="history-node-body">${picture(kind,item,t)}<span><strong>${E(name(item,t))}</strong><small>${E(dateLabel(item,language(t)))}</small></span></span>${kind==='people'&&item.dateType==='lifetime'?`<span class="history-lifetime" style="width:${Math.max(3,end-x)}px" aria-hidden="true"></span>`:`<span class="history-document-marker" aria-hidden="true"></span>`}</a>`).join('')}</div>`;
}
function detail(kind,item,t,index){
 const related=kind==='people'?ADVANCES.filter(a=>a.people.includes(item.id)):PEOPLE.filter(p=>item.people.includes(p.id));
 return `<article class="history-detail"><header><figure>${picture(kind,item,t,true)}${credit(kind,item,t)}</figure><div><p class="history-date">${date(kind,item,t)}</p><h1>${E(name(item,t))}</h1>${item.context?`<p class="history-context">${E(t(item.context))}</p>`:''}<p class="history-dek">${E(t(item.summary))}</p><a class="history-source" href="${E(item.source)}" target="_blank" rel="noopener noreferrer">${t(['Consulter la source documentaire','Read the documentary source'])}</a></div></header>${links(kind,item,t,index)}${related.length?`<section class="history-related"><h2>${t(kind==='people'?['Suivre les idées','Follow the ideas']:['Les personnes liées','Related people'])}</h2>${historyCards(kind==='people'?'advances':'people',related,t,index)}</section>`:''}</article>`;
}
export function historyPage(kind='people',id,t,index){
 kind=kind||'people';const item=id?historyRecord(kind,id):null;
 const crumb=`<nav class="discovery-breadcrumb" aria-label="${t(['Fil d’Ariane','Breadcrumb'])}"><a href="#home">${t(['Accueil','Home'])}</a> / <a href="#topics/history">${t(['Histoire des mathématiques','History of mathematics'])}</a> / <a href="#history/${kind}">${title(kind,t)}</a></nav>`;
 if(item)return `<main id="main" class="page history-page" tabindex="-1">${crumb}<a class="backlink" href="#history/${kind}">${t(['Revenir à la chronologie','Back to the timeline'])}</a>${detail(kind,item,t,index)}</main>`;
 return `<main id="main" class="page history-page" tabindex="-1" data-history-view="atlas">${crumb}<header class="history-heading"><h1>${t(['Les mathématiques, une histoire vivante','Mathematics, a living history'])}</h1><p>${t(['Des personnes, des idées, des échanges. Parcours les siècles, puis explore les mathématiques par toi-même.','Meet the people behind the ideas. Follow discoveries across centuries, then explore the mathematics for yourself.'])}</p></header><nav class="history-tabs" aria-label="${t(['Deux chronologies liées','Two linked timelines'])}"><a href="#history/people" ${kind==='people'?'aria-current="page"':''}>${t(['Personnes et traditions','People and traditions'])}<span>${PEOPLE.length}</span></a><a href="#history/advances" ${kind==='advances'?'aria-current="page"':''}>${t(['Idées et résultats','Ideas and results'])}<span>${ADVANCES.length}</span></a></nav><form id="history-filters" class="history-filters" role="search"><label>${t(['Rechercher','Search'])}<input type="search" name="query" autocomplete="off" placeholder="${t(['Un nom, une idée…','A name, an idea…'])}"></label><label>${t(['Domaine','Field'])}<select name="topic"><option value="">${t(['Tous les domaines','All fields'])}</option>${TOPICS.filter(x=>x.id!=='history').map(x=>`<option value="${x.id}">${E(t(x.title))}</option>`).join('')}</select></label><details class="history-date-filter"><summary>${t(['Dates','Dates'])}</summary><div><label>${t(['À partir de l’année','From year'])}<input type="number" name="from" min="-3000" max="2100" placeholder="-1800"></label><label>${t(['Jusqu’à l’année','Through year'])}<input type="number" name="to" min="-3000" max="2100" placeholder="2026"></label></div></details><button type="reset" class="text-button">${t(['Réinitialiser','Reset'])}</button></form><div class="history-toolbar"><p id="history-count" role="status" aria-live="polite" aria-atomic="true"></p><div class="history-view-switch" role="group" aria-label="${t(['Affichage','View'])}"><button type="button" data-history-view="atlas" aria-pressed="true">${t(['Frise','Timeline'])}</button><button type="button" data-history-view="list" aria-pressed="false">${t(['Lecture','Reading'])}</button></div></div><section class="history-visual" aria-label="${t(['Frise chronologique interactive','Interactive timeline'])}"><nav class="history-era-nav" aria-label="${t(['Aller à une période','Jump to a period'])}">${HISTORY_ERAS.map(era=>`<button type="button" data-history-era="${era.id}"><span>${year(era.from,t)}</span>${E(t(era.title))}</button>`).join('')}</nav><div class="history-atlas-toolbar"><p>${t(['Chaque période a sa propre échelle. Les barres indiquent les vies ; les traits pointillés, des dates approximatives.','Each period has its own scale. Bars show lifetimes; dashed lines mark approximate dates.'])}</p><label>${t(['Échelle','Scale'])}<select id="history-zoom"><option value="0.7">${t(['Compacte','Compact'])}</option><option value="1" selected>${t(['Normale','Normal'])}</option><option value="1.6">${t(['Détaillée','Detailed'])}</option></select></label></div><div id="history-viewport" class="history-viewport" tabindex="0" role="region" aria-label="${t(['Frise : défilement horizontal, touches fléchées ou choix d’une période','Timeline: scroll horizontally, use arrow keys or choose a period'])}" aria-describedby="history-scale-note"></div><p id="history-scale-note" class="history-scale-note">${t(['Fais glisser le fond ou utilise les touches fléchées. Les images et leurs licences figurent sur chaque notice.','Drag the background or use the arrow keys. Each detail page includes image sources and licences.'])}</p></section><div id="history-results"></div><details class="history-notes"><summary>${t(['Lire les dates et les images','Reading dates and images'])}</summary><p>${t(['« Vers » indique une approximation. « Documents » indique une période de recherche attestée, jamais une naissance supposée. Une publication, une preuve et une découverte sont des repères distincts.','“c.” marks an approximation. “Documents” denotes an attested research period, never an assumed birth. Publication, proof and discovery are distinct milestones.'])}</p><p>${t(['Les périodes servent à naviguer, pas à séparer les cultures. Cette sélection n’est pas une histoire exhaustive : les savoirs circulent et se construisent collectivement. Aucun portrait imaginaire n’est utilisé pour les auteurs anciens. Les initiales indiquent une entrée sans image. Les images conservent leur propre licence, indiquée sur la notice.','Periods are navigation aids, not divisions between cultures. This selection is not a complete history: knowledge travels and is built collectively. No imaginary portraits are used for ancient authors. Initials indicate an entry without an image. Images retain their own licences, linked on the detail page.'])}</p></details></main>`;
}
export function bindHistory(root,kind='people',t,index){
 const form=root.querySelector('#history-filters');if(!form)return()=>{};
 kind=kind||'people';const viewport=root.querySelector('#history-viewport'),zoomControl=root.querySelector('#history-zoom');let zoom=1,items=[];
 const win=root.ownerDocument.defaultView;
 let textScale=1,boardWidth=0;
 const measure=()=>Math.max(1,(parseFloat(win.getComputedStyle(root.ownerDocument.documentElement).fontSize)||16)/16);
 const effectiveZoom=()=>zoom*textScale;
 let disposed=false;
 const draw=()=>{
  textScale=measure();boardWidth=viewport.clientWidth;viewport.innerHTML=atlas(kind,items,t,effectiveZoom(),textScale);
  // Names and translated discovery titles have no fixed line count. Measure all bodies before writing positions.
  const nodes=[...viewport.querySelectorAll('.history-node')];
  const bodyHeight=Math.max(104*textScale,...nodes.map(node=>node.querySelector('.history-node-body').getBoundingClientRect().height));
  const rowHeight=bodyHeight+44*textScale;
  const board=viewport.querySelector('.history-atlas');
  board.style.setProperty('--node-body-height',bodyHeight+'px');
  board.style.setProperty('--atlas-height',(112*textScale+Math.max(1,...nodes.map(node=>Number(node.dataset.historyLane)+1))*rowHeight)+'px');
  for(const node of nodes){node.style.top=(112*textScale+Number(node.dataset.historyLane)*rowHeight)+'px';const marker=node.querySelector('.history-lifetime,.history-document-marker');marker.style.top=(bodyHeight+6*textScale)+'px';}
 };
 const update=()=>{
   const from=form.elements.from.value===''?-Infinity:Number(form.elements.from.value),to=form.elements.to.value===''?Infinity:Number(form.elements.to.value);
   items=from>to?[]:queryHistory(kind,{query:form.elements.query.value,topic:form.elements.topic.value,from,to});
   root.querySelector('#history-count').textContent=from>to?t(['La première année doit précéder la dernière.','The first year must precede the last.']):t([`${items.length} ${items.length===1?'repère':'repères'} à explorer`,`${items.length} ${items.length===1?'milestone':'milestones'} to explore`]);
   root.querySelector('#history-results').innerHTML=historyCards(kind,items,t,index);root.classList.toggle('history-no-results',!items.length);draw();
   // Bring filtered matches into view without moving keyboard focus away from the form.
   const filtered=['query','topic','from','to'].some(k=>form.elements[k].value!=='');
   viewport.scrollLeft=filtered&&items.length?Math.max(0,timePosition(items[0].start,effectiveZoom())-24):0;
 };
 const reset=()=>{for(const field of ['query','topic','from','to'])form.elements[field].value='';update();};
 const submit=e=>e.preventDefault();
 const click=e=>{
  const view=e.target.closest('button[data-history-view]');
  if(view){root.dataset.historyView=view.dataset.historyView;root.querySelectorAll('button[data-history-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===view)));if(view.dataset.historyView==='atlas')draw();}
  const jump=e.target.closest('[data-history-era]');
  if(jump){const era=HISTORY_ERAS.find(x=>x.id===jump.dataset.historyEra);viewport.scrollLeft=timePosition(era.from,effectiveZoom());viewport.scrollTop=0;root.querySelectorAll('[data-history-era]').forEach(b=>b.setAttribute('aria-pressed',String(b===jump)));}
  if(e.target.closest('[data-history-reset]'))form.reset();
 };
 const scale=()=>{const previous=zoom;zoom=Number(zoomControl.value);const left=viewport.scrollLeft;draw();viewport.scrollLeft=left/previous*zoom;};
 const key=e=>{if(e.target!==viewport)return;let x;const step=Math.max(120,viewport.clientWidth*.7);if(e.key==='ArrowRight')x=viewport.scrollLeft+step;if(e.key==='ArrowLeft')x=viewport.scrollLeft-step;if(e.key==='Home')x=0;if(e.key==='End')x=viewport.scrollWidth;if(x!==undefined){e.preventDefault();viewport.scrollLeft=x;}};
 // Mouse background dragging complements native touch/trackpad scrolling; links keep their ordinary click behaviour.
 let drag=null;
 const pointerDown=e=>{if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('a,button,select'))return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};viewport.setPointerCapture(e.pointerId);viewport.classList.add('is-dragging');};
 const pointerMove=e=>{if(!drag||e.pointerId!==drag.id)return;viewport.scrollLeft=drag.left+drag.x-e.clientX;viewport.scrollTop=drag.top+drag.y-e.clientY;};
 const pointerEnd=e=>{if(!drag||e.pointerId!==drag.id)return;if(viewport.hasPointerCapture(e.pointerId))viewport.releasePointerCapture(e.pointerId);drag=null;viewport.classList.remove('is-dragging');};
 viewport.addEventListener('pointerdown',pointerDown);viewport.addEventListener('pointermove',pointerMove);for(const type of ['pointerup','pointercancel','lostpointercapture'])viewport.addEventListener(type,pointerEnd);
 const observer=win.ResizeObserver?new win.ResizeObserver(()=>{if(textScale!==measure()||boardWidth!==viewport.clientWidth){const left=viewport.scrollLeft/textScale;draw();viewport.scrollLeft=left*textScale;}}):null;
 observer?.observe(form.elements.query);observer?.observe(viewport);
 form.addEventListener('input',update);form.addEventListener('reset',reset);form.addEventListener('submit',submit);root.addEventListener('click',click);zoomControl.addEventListener('change',scale);viewport.addEventListener('keydown',key);update();
 win.document.fonts?.ready.then(()=>{if(!disposed)draw();});
 return()=>{disposed=true;observer?.disconnect();viewport.removeEventListener('pointerdown',pointerDown);viewport.removeEventListener('pointermove',pointerMove);for(const type of ['pointerup','pointercancel','lostpointercapture'])viewport.removeEventListener(type,pointerEnd);if(drag&&viewport.hasPointerCapture(drag.id))viewport.releasePointerCapture(drag.id);drag=null;form.removeEventListener('input',update);form.removeEventListener('reset',reset);form.removeEventListener('submit',submit);root.removeEventListener('click',click);zoomControl.removeEventListener('change',scale);viewport.removeEventListener('keydown',key);};
}
