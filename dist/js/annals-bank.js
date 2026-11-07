// Self-hosted exam exercises share the bank's cards, folded solutions, maths and print path.
import {annalsBank} from './catalogue-data.js';
import {assetHref,fetchJSON} from './data-loader.js';
import {typeset,printMarkup} from './exercises/ui-kit.js';
const E=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fold=x=>String(x).normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
export const ANNALS=annalsBank.records;
export const annalsFor=chapter=>ANNALS.filter(r=>r.chapters.includes(chapter));
export const selectAnnals=(records,{search='',family='',year='',topic='',course=''}={})=>records.filter(r=>(!course||r.cls===course)&&(!family||r.family===family)&&(!year||String(r.year)===String(year))&&(!topic||r.tags.includes(topic))&&(!search||fold([r.session,r.number,...r.tags,r.stream,r.year,r.family].join(' ')).includes(fold(search.trim()))));
const option=(value,label)=>`<option value="${E(value)}">${E(label)}</option>`;
const versioned=markup=>markup.replace(/src="(\.\/resources\/annals\/figures\/[^"]+)"/g,(_,path)=>`src="${E(assetHref(path))}"`);
const title=r=>`${r.family} ${r.year} · ${r.tags.slice(0,2).join(', ')||'Sujet transversal'} · ${r.number==='automatismes'?'Automatismes':'Exercice '+r.number}`;
const card=r=>`<details class="bank-ex annal-ex" data-annal="${E(r.id)}"><summary><strong>${E(title(r))}</strong>${!r.correction?'<span class="bank-meta">Énoncé seul, sans corrigé</span>':''}<span class="bank-meta">${E(r.session)} · ${E(r.stream)}${r.sample?' · Sujet zéro ou spécimen':''}</span></summary><div class="annal-content"></div></details>`;
export function annalsMarkup(records=ANNALS,{detail='',books=true}={}){
 const chosen=detail?records.filter(r=>r.id===detail):records;

 return `<section class="annals-bank" data-annals ${detail?'data-detail="'+E(detail)+'"':''}>${books?'':`<h2>Annales, exercices et problèmes d’examen</h2>`}
 ${!detail?`<form class="resource-filters annal-filters"><label>Rechercher<input name="search" type="search" placeholder="Une notion, un centre, une session…"></label><label>Examen<select name="family">${option('','Tous')}${[...new Set(chosen.map(r=>r.family))].sort().map(x=>option(x,x)).join('')}</select></label><label data-exam-filter hidden>Année<select name="year" disabled>${option('','Toutes')}</select></label><label data-exam-filter hidden>Notion<select name="topic" disabled>${option('','Toutes')}</select></label><button class="filter" type="reset">Effacer</button></form>`:''}
 <p data-annal-count role="status" aria-live="polite"></p><div data-annal-list></div><button type="button" class="filter" data-annal-more>Afficher la suite</button>
 ${books&&!detail?`<details class="annal-books"><summary>Banques PDF et sources LaTeX</summary><p>Éditions composées avec la présentation des cours, regroupées par chapitre principal. Chaque exercice conserve sa session d’origine.</p><ul>${['bac','eam','e3c'].map(f=>`<li>${f.toUpperCase()} : <a href="${E(assetHref('./resources/annals/books/'+f+'-enonces.pdf'))}" download>Énoncés PDF</a> · <a href="${E(assetHref('./resources/annals/books/'+f+'-corriges.pdf'))}" download>Corrigés PDF</a></li>`).join('')}</ul><a href="${E(assetHref('./resources/annals/books/sources.zip'))}" download>Sources complètes des banques PDF (LaTeX, classe et figures)</a></details>`:''}
 <details class="resource-origin"><summary>Attribution, sources et réutilisation</summary><p>Les sujets historiques restent liés à leur session et à leur voie. Les chapitres associés suivent les thèmes indiqués par la source ; ils ne certifient pas l’alignement avec le programme actuel.</p><p>${E(annalsBank.credit)}</p><p>Documents adaptés sous licence ${E(annalsBank.license)}, distincte de la licence du reste du site. La structure, la typographie et le format des illustrations ont été adaptés. Les corrections sont celles proposées par la source.</p><a href="${E(annalsBank.terms)}" target="_blank" rel="noopener noreferrer">Conditions et crédits de CoopMaths</a><p><a href="${E(assetHref('./resources/annals/sources.zip'))}" download>Télécharger toutes les sources LaTeX et les figures</a></p></details></section>`;
}
const cache=new Map();
async function read(r){
 if(!cache.has(r.id))cache.set(r.id,fetchJSON(`./resources/annals/${r.id}.json`).catch(e=>{cache.delete(r.id);throw e;}));
 return cache.get(r.id);
}
export function bindAnnals(root,records=ANNALS){
 const hosts=[...root.querySelectorAll('[data-annals]')];const cleanups=[];let disposed=false;
 for(const host of hosts){
  const detail=host.dataset.detail,chosen=detail?records.filter(r=>r.id===detail):records;
  const form=host.querySelector('form'),list=host.querySelector('[data-annal-list]'),more=host.querySelector('[data-annal-more]');let limit=30;
  const syncFilters=()=>{
   if(!form)return;
   const family=form.elements.family.value,subset=chosen.filter(r=>r.family===family);
   const options={year:[...new Set(subset.map(r=>String(r.year)))].sort((a,b)=>b-a),topic:[...new Set(subset.flatMap(r=>r.tags))].sort((a,b)=>a.localeCompare(b,'fr'))};
   for(const [name,values] of Object.entries(options)){
    const select=form.elements[name],previous=select.value;
    select.innerHTML=option('','Toutes')+values.map(v=>option(v,v)).join('');
    select.value=family&&values.includes(previous)?previous:'';
    select.disabled=!family;select.closest('[data-exam-filter]').hidden=!family;
   }
  };
  const paint=()=>{
   const matches=selectAnnals(chosen,form?Object.fromEntries(new FormData(form)):{});
   host.querySelector('[data-annal-count]').textContent=`${matches.length} exercices et problèmes`;
   list.innerHTML=matches.length?matches.slice(0,limit).map(card).join(''):'<p>Aucun sujet ne correspond à ces filtres.</p>';
   more.hidden=matches.length<=limit;
   if(detail){const d=list.querySelector('details');if(d){d.open=true;load(d);}}
  };
  const load=async d=>{
   if(d.dataset.loaded||!d.open)return;
   const r=chosen.find(x=>x.id===d.dataset.annal);if(!r)return;
   const content=d.querySelector('.annal-content');d.dataset.loaded='loading';content.innerHTML='<p role="status">Chargement de l’exercice…</p>';
   try{
    const data=await read(r);if(disposed||!d.isConnected)return;
    content.innerHTML=`<div class="bank-intro annal-statement">${versioned(data.question)}</div>${data.solution?`<details class="bank-sol"><summary>Correction</summary><div class="annal-solution">${versioned(data.solution)}</div></details>`:'<p>Corrigé non disponible dans la source.</p>'}<div class="resource-actions"><button class="filter" data-annal-print="student" type="button">Imprimer / PDF</button>${data.solution?'<button class="filter" data-annal-print="teacher" type="button">Imprimer avec correction</button>':''}<a href="${E(assetHref('./resources/annals/'+r.id+'.tex'))}" download>LaTeX de l’énoncé</a>${data.solution?`<a href="${E(assetHref('./resources/annals/'+r.id+'.cor.tex'))}" download>LaTeX du corrigé</a>`:''}<a href="#bank/annales/${E(r.id)}">Lien vers cet exercice</a></div><p class="bank-meta">Source : APMEP / CoopMaths · CC BY-SA. ${E(r.session)}. <a href="${E(r.sourceURL)}" target="_blank" rel="noopener noreferrer">Source originale</a></p>`;
    d.dataset.loaded='true';await typeset(content);
   }catch(error){if(disposed||!d.isConnected)return;delete d.dataset.loaded;content.innerHTML='<p role="alert">L’exercice n’a pas pu être chargé.</p><button class="filter" data-annal-retry type="button">Réessayer</button>';}
  };
  const toggle=e=>{const d=e.target.closest?.('[data-annal]');if(d&&e.target===d)load(d);};
  const input=()=>{syncFilters();limit=30;paint();};const reset=e=>{e.preventDefault();for(const control of form.querySelectorAll('input,select'))control.value='';input();};
  const submit=e=>e.preventDefault();const next=()=>{
   const matches=selectAnnals(chosen,form?Object.fromEntries(new FormData(form)):{}), start=limit;
   limit+=30;list.insertAdjacentHTML('beforeend',matches.slice(start,limit).map(card).join(''));
   more.hidden=matches.length<=limit;list.children[start]?.querySelector('summary')?.focus();
  };
  const click=async e=>{
   const d=e.target.closest('[data-annal]');if(!d)return;
   if(e.target.closest('[data-annal-retry]')){load(d);return;}
   const button=e.target.closest('[data-annal-print]');if(!button)return;
   const r=chosen.find(x=>x.id===d.dataset.annal);button.disabled=true;
   try{const data=await read(r);if(disposed)return;await printMarkup(`<div class="gen-paper bank-print annal-print"><h1>${E(title(r))}</h1><p>${E(r.session)} · ${E(r.stream)}</p>${versioned(data.question)}${button.dataset.annalPrint==='teacher'?'<h2>Correction</h2>'+versioned(data.solution):''}<p>APMEP / CoopMaths · CC BY-SA. Présentation adaptée par Maths Explorer.</p></div>`);}finally{button.disabled=false;}
  };
  form?.addEventListener('input',input);form?.addEventListener('reset',reset);form?.addEventListener('submit',submit);more.addEventListener('click',next);list.addEventListener('toggle',toggle,true);list.addEventListener('click',click);syncFilters();paint();
  cleanups.push(()=>{form?.removeEventListener('input',input);form?.removeEventListener('reset',reset);form?.removeEventListener('submit',submit);more.removeEventListener('click',next);list.removeEventListener('toggle',toggle,true);list.removeEventListener('click',click);});
 }
 return()=>{disposed=true;cleanups.forEach(f=>f());};
}
