// #prepare (Préparer): the teacher has time, so choose and assemble. Class and chapter (shared state), the chapter sheet by
// phase, a search over the shared resource index, the "Ma séance" builder (saved at once, offered in class) and Évaluer.
// Pure logic: seance-model.js, launchpad-model.js, prepare-model.js. The index is the one of resource-sources.js.
// Not sourced, so left out: prerequisites of a chapter (they live in per-chapter deck files, not in the catalogue).
import {liveCourses,isLiveHash} from './live-curriculum.js';
import {fetchJSON} from './data-loader.js';
import {courseName,chapterOf,launchpad,resolveForSeance} from './launchpad-model.js';
import {PHASES,phaseById,addBlock,removeBlock,moveBlockTo,setMinutes,togglePrint,totals,defaultSeance,emptySeance,MAX_MINUTES,TARGET_MINUTES} from './seance-model.js';
import {phaseForType,blockFromItem,blockFromPhase,describeTotals,printList,liveLinks,dropIndex,movedText} from './prepare-model.js';
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
  $('#pp-builder').innerHTML=`${n?`${n>1?`<p class="pp-hint muted">${L('Glisse la poignée pour réordonner (ou flèches haut et bas sur la poignée).','Drag the handle to reorder (or Up and Down arrows on the handle).')}</p>`:''}<ol class="pp-blocks">${s.blocks.map(b=>`<li class="pp-block" data-block="${E(b.id)}"><button type="button" class="pp-grip" data-pp-grip="${E(b.id)}" aria-label="${E(L('Déplacer','Move'))} : ${E(b.title)}"><svg viewBox="0 0 10 16" width="10" height="16" aria-hidden="true" focusable="false"><g fill="currentColor"><circle cx="2" cy="3" r="1.4"/><circle cx="8" cy="3" r="1.4"/><circle cx="2" cy="8" r="1.4"/><circle cx="8" cy="8" r="1.4"/><circle cx="2" cy="13" r="1.4"/><circle cx="8" cy="13" r="1.4"/></g></svg></button>
<div class="pp-block-text"><span class="pp-phase-tag">${E(P(phaseById(b.phase)?.label||['','']))}</span><strong>${live(b.href)?`<a href="${E(b.href)}">${E(b.title)}</a>`:E(b.title)}</strong></div>
<label class="pp-min"><input type="number" min="0" max="${MAX_MINUTES}" step="1" inputmode="numeric" data-pp-min="${E(b.id)}" value="${b.minutes}" aria-label="${E(L('Minutes','Minutes'))} : ${E(b.title)}"><span aria-hidden="true">min</span></label>
<label class="pp-print"><input type="checkbox" data-pp-print="${E(b.id)}"${b.print?' checked':''}><span class="pp-box" aria-hidden="true"><svg viewBox="0 0 12 12" width="12" height="12" focusable="false"><path d="M2 6.5l2.6 2.6L10 3.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"/></svg></span><span class="pp-print-word">${L('Imprimer','Print')}<span class="sr-only"> : ${E(b.title)}</span></span></label>
<button type="button" class="pp-remove" data-pp="remove" data-id="${E(b.id)}" aria-label="${E(L('Retirer','Remove'))} : ${E(b.title)}"><span aria-hidden="true">×</span></button></li>`).join('')}</ol>`
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
 const grip=id=>byAttr('data-pp-grip',id),btn=(act,id)=>[...main.querySelectorAll(`[data-pp="${act}"]`)].find(n=>n.dataset.id===id)||null;
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

 // Reordering: pointer events on the grip (mouse, pen, touch), Arrow keys on the focused grip. Pure part: dropIndex, moveBlockTo.
 let drag=null;
 const endDrag=()=>{if(!drag)return;const {li,ol,line,g,pid}=drag;li.classList.remove('is-lifted');li.style.transform='';ol.classList.remove('is-dragging');line?.remove();try{g.releasePointerCapture(pid);}catch{}drag=null;};
 const down=e=>{
  const g=e.target.closest?.('[data-pp-grip]');if(!g||drag||(e.pointerType==='mouse'&&e.button!==0))return;
  const li=g.closest('.pp-block'),ol=li.parentNode,blocks=[...ol.children].filter(n=>n.classList.contains('pp-block'));
  drag={id:g.dataset.ppGrip,g,li,ol,blocks,pid:e.pointerId,y0:e.clientY,from:blocks.indexOf(li),to:blocks.indexOf(li),on:false,line:null};
  try{g.setPointerCapture(e.pointerId);}catch{}
  g.focus();e.preventDefault();
 };
 const move=e=>{
  if(!drag||e.pointerId!==drag.pid)return;
  const dy=e.clientY-drag.y0;
  if(!drag.on){if(Math.abs(dy)<4)return;drag.on=true;drag.li.classList.add('is-lifted');drag.ol.classList.add('is-dragging');drag.line=drag.ol.ownerDocument.createElement('div');drag.line.className='pp-drop-line';drag.line.setAttribute('aria-hidden','true');drag.ol.appendChild(drag.line);}
  const {blocks,from,ol}=drag,y=e.clientY-ol.getBoundingClientRect().top;
  drag.li.style.transform=`translateY(${dy}px)`;
  drag.to=dropIndex(blocks.map(b=>b.offsetTop+b.offsetHeight/2),from,y);
  const others=blocks.filter((_,i)=>i!==from),at=drag.to<others.length?others[drag.to].offsetTop-4:others.length?others.at(-1).offsetTop+others.at(-1).offsetHeight+1:0;
  drag.line.style.top=at+'px';
 };
 const up=e=>{
  if(!drag||e.pointerId!==drag.pid)return;
  const {on,from,to,id}=drag;endDrag();
  if(!on||from===to)return;
  const s=state.getSeance(),next=moveBlockTo(s,from,to);
  save(next,t(movedText(s.blocks[from].title,to+1,s.blocks.length)),()=>grip(id));
 };
 const cancel=e=>{if(drag&&e.pointerId===drag.pid)endDrag();};
 const key=e=>{
  const g=e.target.closest?.('[data-pp-grip]');if(!g)return;
  if(e.key==='Escape'&&drag){endDrag();return;}
  if(e.key!=='ArrowUp'&&e.key!=='ArrowDown')return;
  e.preventDefault();
  const s=state.getSeance(),id=g.dataset.ppGrip,i=s.blocks.findIndex(x=>x.id===id);if(i<0)return;
  const j=Math.min(s.blocks.length-1,Math.max(0,i+(e.key==='ArrowUp'?-1:1)));
  if(j===i){announce(t(movedText(s.blocks[i].title,i+1,s.blocks.length)));return;}
  save(moveBlockTo(s,i,j),t(movedText(s.blocks[i].title,j+1,s.blocks.length)),()=>grip(id));
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
 const ev=[['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',cancel],['keydown',key]];for(const [n,f] of ev)main.addEventListener(n,f);
 drawAll();
 return ()=>{main.removeEventListener('click',click);main.removeEventListener('change',change);main.removeEventListener('input',input);main.removeEventListener('submit',submit);for(const [n,f] of ev)main.removeEventListener(n,f);endDrag();};
}
