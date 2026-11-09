// The class and chapter chosen on this device (teacher-state.js), offered to the pages that can use them: recents on open,
// a visible "your chapter" strip on lessons and exercises, and the automatismes defaults. Never a hidden filter: every
// page shows what was preselected and lets the visitor change it. Storage failures are swallowed.
import {getClassroom,getTools,getRecent,addRecent,setChapter} from './teacher-state.js';
import {discoveryChapters} from './catalogue-data.js';
const P=(fr,en)=>[fr,en];
const E=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const AUTO_DEFAULTS={minutes:5,count:10,seedPolicy:'new'};
export const chapterTitle=id=>discoveryChapters.find(c=>c.id===id)?.title?.[0]||'';
export const classroom=()=>{try{return getClassroom();}catch{return {course:'',chapter:''};}};
// Remembered defaults of the one-click automatismes session, always inside the limits of the generator form.
export function autoDefaults(tools=null){
 let saved={};try{saved=(tools||getTools()).automatismes||{};}catch{}
 const n=(v,lo,hi,d)=>Number.isFinite(v)?Math.max(lo,Math.min(hi,Math.round(v))):d;
 return {minutes:n(saved.minutes,1,60,AUTO_DEFAULTS.minutes),count:n(saved.count,3,30,AUTO_DEFAULTS.count),seedPolicy:saved.seedPolicy==='keep'?'keep':'new'};
}
// Records a page or chapter that was opened. `item` = {type,id,title,href}; never throws.
export function noteOpen(item){try{if(getRecent()[0]?.href===item.href)return true;return addRecent(item);}catch{return false;}}
// Titles of the routes worth remembering. Returns null for the others (home, dashboard, missing page).
const TOOLS={automatismes:P('Automatismes','Starters'),sheets:P('Fiches et évaluations','Worksheets and tests'),slides:P('Diaporamas','Slides'),resources:P('Cours','Lessons'),bank:P('Exercices','Exercises'),pack:P('Lot de documents','Document pack'),sources:P('Sources LaTeX','LaTeX sources'),errors:P('Erreurs fréquentes','Common errors'),lab:P('Laboratoire','Laboratory'),gallery:P('Curiosités','Curiosities')};
export function recentFor(page,id,tab,t,extraTitle=''){
 if(page==='chapter'&&id){const title=chapterTitle(id);return title?{type:'chapter',id:'chapter-'+id,title,href:'#chapter/'+id}:null;}
 if(!TOOLS[page])return null;
 const base=t(TOOLS[page]),slug=id&&id!=='go'?'/'+id:'';
 const title=extraTitle||(id&&id!=='go'?base+' · '+id:base);
 return {type:'tool',id:page+slug,title,href:'#'+page+slug+(slug&&tab?'/'+tab:'')};
}
// A quiet strip on lessons and exercises: names the class and chapter and offers the way into that chapter or out of it.
export function contextStripHtml({page,t,course=''}){
 const c=classroom();
 if(!c.chapter||!c.course||(course&&course!==c.course))return '';
 const title=chapterTitle(c.chapter);if(!title)return '';
 const href=page==='bank'?`#bank/${c.course}/${c.chapter}`:`#chapter/${c.chapter}`;
 return `<aside class="ctx-strip" data-ctx-strip aria-label="${E(t(P('Chapitre de ta classe','Your class chapter')))}"><span>${E(t(P('Chapitre de ta classe','Your class chapter')))} : <strong>${E(title)}</strong></span><span class="ctx-actions"><a class="btn btn-secondary" href="${E(href)}">${E(t(P('Ouvrir ce chapitre','Open this chapter')))}</a><button type="button" class="btn-quiet" data-ctx-clear>${E(t(P('Voir tous les chapitres','Show all chapters')))}</button><a class="btn-quiet" href="#teacher">${E(t(P('Changer de classe ou de chapitre','Change class or chapter')))}</a></span></aside>`;
}
export function mountContextStrip(main,html){
 if(!main||!html)return;
 const anchor=main.querySelector('.page-intro')||main.querySelector('h1');
 if(!anchor)return;
 anchor.insertAdjacentHTML('afterend',html);
 const strip=main.querySelector('[data-ctx-strip]');
 strip?.querySelector('[data-ctx-clear]')?.addEventListener('click',()=>{try{setChapter('');}catch{}strip.remove();});
}
