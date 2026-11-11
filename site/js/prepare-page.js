// #prepare (Préparer): the teacher has time, so choose and assemble. Class and chapter (shared state), the chapter sheet by
// phase, a search over the shared resource index, the "Ma séance" builder (saved at once, offered in class) and Évaluer.
// Pure logic: seance-model.js, launchpad-model.js, prepare-model.js. The index is the one of resource-sources.js.
// Not sourced, so left out: prerequisites of a chapter (they live in per-chapter deck files, not in the catalogue).
import {liveCourses,isLiveHash} from './live-curriculum.js';
import {fetchJSON} from './data-loader.js';
import {courseName,chapterOf,launchpad,resolveForSeance} from './launchpad-model.js';
import {PHASES,phaseById,addBlock,removeBlock,moveBlock,setMinutes,togglePrint,totals,defaultSeance,emptySeance,MAX_MINUTES,TARGET_MINUTES} from './seance-model.js';
import {phaseForType,blockFromItem,blockFromPhase,describeTotals,printList,liveLinks} from './prepare-model.js';
import {searchResources,typeLabel} from './resource-index.js';
import {errorsFor} from './errors-model.js';
import {chaptersFor} from './teacher-dashboard.js';

const E=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const EVALUATE=[['#sheets','Fiches et évaluations','Worksheets and tests'],['#bank/annales','Annales d’examens','Past papers'],['#errors','Erreurs fréquentes','Common errors']];
const RESULTS=12;

export async function mountPreparePage(main,{t,state,isGone=()=>false,decks,index}={}){
 if(isGone())return ()=>{};
 const L=(fr,en)=>t([fr,en]),P=p=>t(p),lang=t(['fr','en'])==='en'?1:0;
 if(decks===undefined&&!index)decks=await fetchJSON('./slides/data/index.json').catch(()=>null);
 if(isGone())return ()=>{};
 decks=decks||null;
 let idx=index||null,idxFailed=false,query='',message='';
 const live=href=>!href.startsWith('#')||isLiveHash(href);
 const ctx=()=>state.getClassroom();
 const announce=m=>{message=m;const n=main.querySelector('#pp-live');if(n)n.textContent=m;};

 main.innerHTML=`<h1>${L('Préparer','Prepare')}</h1>
<p class="muted">${L('Choisir et assembler les ressources de la prochaine séance. Tout est enregistré sur cet appareil, à chaque changement.','Choose and assemble the resources for the next session. Everything is saved on this device at each change.')}</p>
<p id="pp-live" class="pp-live" role="status" aria-live="polite"></p>
<div class="pp-selects" id="pp-selects"></div>
<div class="pp-layout">
<section class="td-section pp-sheet" aria-labelledby="pp-sheet-h"><h2 tabindex="-1" id="pp-sheet-h">${L('Fiche du chapitre','Chapter sheet')}</h2><div id="pp-sheet"></div></section>
<section class="td-section pp-search" aria-labelledby="pp-search-h"><h2 tabindex="-1" id="pp-search-h">${L('Chercher une ressource','Find a resource')}</h2>
<form id="pp-form" role="search"><label class="td-field"><span>${L('Mots à chercher','Words to search')}</span><input id="pp-q" type="search" autocomplete="off" placeholder="${E(L('Ex. : second degré, Thalès, pourcentage','E.g. quadratics, Thales, percentage'))}"></label></form>
<p id="pp-status" class="muted" aria-live="polite"></p><div id="pp-results"></div></section>
<section class="td-section pp-builder" aria-labelledby="pp-builder-h"><h2 tabindex="-1" id="pp-builder-h">${L('Ma séance','My séance')}</h2><div id="pp-builder"></div></section>
<section class="td-section pp-eval" aria-labelledby="pp-eval-h"><h2 tabindex="-1" id="pp-eval-h">${L('Évaluer','Assess')}</h2><div id="pp-eval"></div></section>
</div>`;
 const $=s=>main.querySelector(s);

 const drawSelects=()=>{
  const {course,chapter}=ctx(),chapters=course?chaptersFor(course):[];
  $('#pp-selects').innerHTML=`<label class="td-field"><span>${L('Classe','Class')}</span><select id="pp-class"><option value="">${L('Aucune classe choisie','No class chosen')}</option>${liveCourses.map(c=>`<option value="${E(c.id)}"${c.id===course?' selected':''}>${E(courseName(c.id))}</option>`).join('')}</select></label>
<label class="td-field"><span>${L('Chapitre','Chapter')}</span><select id="pp-chapter"${course?'':' disabled'}><option value="">${course?L('Aucun chapitre précis','No specific chapter'):L('Choisis d’abord une classe','Choose a class first')}</option>${chapters.map(c=>`<option value="${E(c.id)}"${c.id===chapter?' selected':''}>${String(c.number).padStart(2,'0')} · ${E(c.title[lang])}</option>`).join('')}</select></label>`;
 };
 const drawSheet=()=>{
  const {course,chapter}=ctx(),ch=chapter?chapterOf(chapter):null;
  const phases=launchpad({course,chapter,decks});
  const errs=chapter?errorsFor('#chapter/'+chapter).filter(e=>live('#errors/'+e.id)):[];
  $('#pp-sheet').innerHTML=`<p class="muted">${ch?`${E(courseName(course))} · ${E(ch.title[lang])}`:course?`${E(courseName(course))} · ${L('aucun chapitre précis : ressources de la classe','no specific chapter: class resources')}`:L('Aucune classe choisie : ressources générales. Choisis une classe et un chapitre pour une fiche précise.','No class chosen: general resources. Pick a class and a chapter for a precise sheet.')}</p>
<ol class="pp-phases">${phases.map(p=>`<li class="pp-phase"><div class="pp-phase-text"><strong>${E(P(p.label))}</strong><span class="muted">${p.detail?E(P(p.detail)):''}</span>${p.href?'':`<span class="pp-why">${E(P(p.why))}</span>`}</div>
<div class="pp-phase-actions">${p.href&&live(p.href)?`<a class="btn-quiet" href="${E(p.href)}">${L('Ouvrir','Open')}<span class="sr-only"> : ${E(P(p.label))}</span></a><button type="button" class="btn btn-secondary" data-pp="add-phase" data-phase="${E(p.id)}">${L('Ajouter à la séance','Add to the séance')}<span class="sr-only"> : ${E(P(p.label))}</span></button>`:''}</div></li>`).join('')}</ol>
${chapter?`<h3 class="pp-sub">${L('Erreurs à prévoir','Errors to expect')}</h3>${errs.length?`<ul class="td-items">${errs.map(e=>`<li><a class="td-item-link" href="#errors/${E(e.id)}">${E(P(e.title))}</a></li>`).join('')}</ul>`:`<p class="muted">${L('Aucune erreur fréquente liée à ce chapitre pour le moment.','No common error is linked to this chapter yet.')}</p>`}`:''}`;
 };
 const ensureIndex=async()=>{
  if(idx||idxFailed)return;
  try{const m=await import('./resource-sources.js');idx=m.buildLiveResourceIndex({decks});}catch{idxFailed=true;}
 };
 const drawResults=()=>{
  const status=$('#pp-status'),box=$('#pp-results');
  if(idxFailed){status.textContent='';box.innerHTML=`<p class="muted" role="status">${L('La recherche n’a pas pu se charger.','Search could not load.')}</p>`;return;}
  if(!query.trim()){status.textContent='';box.innerHTML=`<p class="muted">${L('Tape un mot pour voir les ressources du site.','Type a word to see the site resources.')}</p>`;return;}
  if(!idx){status.textContent=L('Chargement de l’index…','Loading the index…');box.innerHTML='';return;}
  const {course}=ctx();
  const list=searchResources(idx,{query,cls:course,limit:RESULTS});
  status.textContent=list.length?`${list.length>=RESULTS?RESULTS+'+':list.length} ${list.length>1?L('résultats','results'):L('résultat','result')}`:L('Aucun résultat.','No results.');
  box.innerHTML=list.length?`<ul class="pp-results">${list.map(it=>{
   const dflt=phaseForType(it.type),title=P(it.title),can=!!blockFromItem(it,dflt,lang);
   return `<li class="pp-result"><div class="pp-phase-text"><strong>${E(title)}</strong><span class="muted">${E(P(typeLabel(it.type)))}</span></div>
${can?`<div class="pp-phase-actions"><label class="td-field pp-phase-select"><span>${L('Phase','Phase')}<span class="sr-only"> : ${E(title)}</span></span><select data-pp-phase="${E(it.id)}">${PHASES.map(p=>`<option value="${E(p.id)}"${p.id===dflt?' selected':''}>${E(P(p.label))}</option>`).join('')}</select></label>
<button type="button" class="btn btn-secondary" data-pp="add-result" data-id="${E(it.id)}">${L('Ajouter à la séance','Add to the séance')}<span class="sr-only"> : ${E(title)}</span></button></div>`:''}</li>`;}).join('')}</ul>`:`<p class="muted">${L('Rien n’est inventé : si le site n’a pas ce contenu, il n’apparaît pas.','Nothing is invented: if the site does not have this content, it does not appear.')}</p>`;
 };
 const drawBuilder=()=>{
  const s=state.getSeance(),tot=totals(s),d=describeTotals(tot,s.blocks.length),prints=printList(s);
  const n=s.blocks.length;
  $('#pp-builder').innerHTML=`${n?`<ol class="pp-blocks">${s.blocks.map((b,i)=>`<li class="pp-block" data-block="${E(b.id)}"><div class="pp-block-head"><span class="pp-block-n" aria-hidden="true">${i+1}</span><div class="pp-phase-text"><strong>${live(b.href)?`<a href="${E(b.href)}">${E(b.title)}</a>`:E(b.title)}</strong><span class="muted">${E(P(phaseById(b.phase)?.label||['',''])) }</span></div></div>
<div class="pp-block-tools"><button type="button" class="btn btn-secondary pp-icon" data-pp="up" data-id="${E(b.id)}"${i===0?' disabled':''}>${L('Monter','Move up')}<span class="sr-only"> : ${E(b.title)}</span></button><button type="button" class="btn btn-secondary pp-icon" data-pp="down" data-id="${E(b.id)}"${i===n-1?' disabled':''}>${L('Descendre','Move down')}<span class="sr-only"> : ${E(b.title)}</span></button>
<label class="td-field pp-min"><span>${L('Minutes','Minutes')}<span class="sr-only"> : ${E(b.title)}</span></span><input type="number" min="0" max="${MAX_MINUTES}" step="1" inputmode="numeric" data-pp-min="${E(b.id)}" value="${b.minutes}"></label>
<label class="rs-check pp-print"><input type="checkbox" data-pp-print="${E(b.id)}"${b.print?' checked':''}><span>${L('fiche à imprimer','sheet to print')}<span class="sr-only"> : ${E(b.title)}</span></span></label>
<button type="button" class="btn-quiet" data-pp="remove" data-id="${E(b.id)}">${L('Retirer','Remove')}<span class="sr-only"> : ${E(b.title)}</span></button></div></li>`).join('')}</ol>`
  :`<p class="muted">${L('La séance est vide. Ajoute des ressources depuis la fiche du chapitre ou la recherche, ou pars d’une séance type.','The séance is empty. Add resources from the chapter sheet or the search, or start from a standard séance.')}</p>`}
<div class="pp-totals"><p class="pp-total${d.over?' is-over':''}"><strong>${E(P(d.minutesText))}</strong></p>
<meter class="pp-meter" min="0" max="${TARGET_MINUTES}" value="${Math.min(tot.minutes,TARGET_MINUTES)}" aria-label="${E(L('Minutes prévues sur 55','Planned minutes out of 55'))}">${tot.minutes} / ${TARGET_MINUTES}</meter>
<p class="pp-print-count"><strong>${E(P(d.printText))}</strong>. ${L('Imprimer avec modération : chaque fiche cochée est comptée.','Print in moderation: each ticked sheet is counted.')}</p>
${d.warn?`<p class="pp-warn" role="status">${E(P(d.warn))}</p>`:''}
<p class="pp-print-list muted">${prints.length?`${L('À imprimer','To print')} : ${prints.map(E).join(' ; ')}.`:L('Aucune fiche cochée.','No sheet ticked.')}</p></div>
<div class="pp-builder-actions"><button type="button" class="btn btn-secondary" data-pp="standard">${L('Séance type','Standard séance')}</button><button type="button" class="btn btn-secondary" data-pp="clear"${n?'':' disabled'}>${L('Vider','Clear')}</button><a class="btn btn-primary" id="pp-launch" href="#teacher">${L('Lancer en classe','Start in class')}</a></div>`;
 };
 const drawEval=()=>{
  $('#pp-eval').innerHTML=`<ul class="td-items">${liveLinks(EVALUATE,isLiveHash).map(([h,fr,en])=>`<li><a class="td-item-link" href="${E(h)}">${L(fr,en)}</a></li>`).join('')}</ul>
<p class="muted">${L('Fiches pour un devoir surveillé (DS) ou une interrogation, annales pour s’entraîner, erreurs fréquentes pour la remédiation.','Worksheets for a class test or a quiz, past papers for practice, common errors for remediation.')}</p>`;
 };
 const drawAll=()=>{drawSelects();drawSheet();drawResults();drawBuilder();drawEval();};

 const save=(s,msg,focus)=>{state.setSeance(s);drawBuilder();announce(msg);(typeof focus==='function'?focus():focus&&main.querySelector(focus))?.focus();};
 const added=title=>`${L('Ajouté à la séance','Added to the séance')} : ${title}`;
 const byAttr=(a,id)=>[...main.querySelectorAll(`[${a}]`)].find(n=>n.getAttribute(a)===id)||null;
 const btn=(act,id)=>[...main.querySelectorAll(`[data-pp="${act}"]`)].find(n=>n.dataset.id===id)||null;
 const click=e=>{
  if(e.target.closest('#pp-launch')){try{state.setMode('classe');}catch{}return;}
  const b=e.target.closest('[data-pp]');if(!b)return;
  const d=b.dataset.pp,s=state.getSeance(),id=b.dataset.id,i=s.blocks.findIndex(x=>x.id===id);
  if(d==='add-phase'){
   const {course,chapter}=ctx(),p=launchpad({course,chapter,decks}).find(x=>x.id===b.dataset.phase),blk=blockFromPhase(p,lang);
   if(!blk)return;
   const next=addBlock(s,blk);
   if(next.blocks.length===s.blocks.length)announce(L('Séance pleine : 30 blocs au plus.','Séance full: 30 blocks at most.'));
   else{state.setSeance(next);drawBuilder();announce(added(blk.title));}
  }else if(d==='add-result'){
   const it=idx?.find(x=>x.id===id),ph=byAttr('data-pp-phase',id)?.value,blk=blockFromItem(it,ph,lang);
   if(!blk)return;
   const next=addBlock(s,blk);
   if(next.blocks.length===s.blocks.length)announce(L('Séance pleine : 30 blocs au plus.','Séance full: 30 blocks at most.'));
   else{state.setSeance(next);drawBuilder();announce(added(blk.title));}
  }else if(d==='up'||d==='down'){
   const delta=d==='up'?-1:1;if(i<0)return;
   const next=moveBlock(s,i,delta),j=i+delta;
   // keep focus on the same kind of button; when the block reaches an end that button is disabled, so use the other one
   const other=d==='up'?'down':'up',atEnd=j===0||j===s.blocks.length-1;
   save(next,`${s.blocks[i].title} : ${L('position','position')} ${j+1} ${L('sur','of')} ${s.blocks.length}`,()=>btn(atEnd?other:d,id));
  }else if(d==='remove'){
   const t0=s.blocks[i]?.title,after=s.blocks[i+1]||s.blocks[i-1];
   save(removeBlock(s,id),`${L('Retiré de la séance','Removed from the séance')} : ${t0}`,after?()=>btn('remove',after.id):'#pp-builder-h');
  }else if(d==='standard'){
   const {course,chapter}=ctx(),next=defaultSeance({course,chapter},resolveForSeance(course,chapter,decks));
   save(next,next.blocks.length?`${L('Séance type posée','Standard séance set')} : ${next.blocks.length} ${L('blocs','blocks')}`:L('Aucune phase disponible pour ce choix.','No phase available for this choice.'),'[data-pp="standard"]');
  }else if(d==='clear'){
   save(emptySeance(),L('Séance vidée.','Séance cleared.'),'#pp-builder-h');
  }
 };
 const change=async e=>{
  const el=e.target;
  if(el.id==='pp-class'){state.setClassroom({course:el.value});drawSelects();drawSheet();drawResults();$('#pp-class')?.focus();}
  else if(el.id==='pp-chapter'){state.setChapter(el.value);drawSheet();$('#pp-chapter')?.focus();}
  else if(el.dataset.ppMin!==undefined){
   const id=el.dataset.ppMin,v=Math.round(Number(el.value));
   save(setMinutes(state.getSeance(),id,Number.isFinite(v)?v:0),`${L('Durée mise à jour','Minutes updated')} : ${Math.min(MAX_MINUTES,Math.max(0,Number.isFinite(v)?v:0))} min`,()=>byAttr('data-pp-min',id));
  }else if(el.dataset.ppPrint!==undefined){
   const id=el.dataset.ppPrint,s=togglePrint(state.getSeance(),id),on=s.blocks.find(b=>b.id===id)?.print;
   save(s,on?L('Fiche cochée à imprimer.','Sheet ticked to print.'):L('Fiche décochée.','Sheet unticked.'),()=>byAttr('data-pp-print',id));
  }
 };
 const input=async e=>{
  if(e.target.id!=='pp-q')return;
  query=e.target.value;
  if(query.trim()&&!idx&&!idxFailed){drawResults();await ensureIndex();if(isGone())return;}
  drawResults();
 };
 const submit=e=>e.preventDefault();
 main.addEventListener('click',click);main.addEventListener('change',change);main.addEventListener('input',input);main.addEventListener('submit',submit);
 drawAll();
 return ()=>{main.removeEventListener('click',click);main.removeEventListener('change',change);main.removeEventListener('input',input);main.removeEventListener('submit',submit);};
}
