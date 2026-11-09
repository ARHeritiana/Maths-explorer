// Teacher area (#teacher): a compact dashboard over the existing resources. Loaded on demand by app.js.
// Class and chapter come from teacher-state.js (shared with the rest of the site, always changeable here), quick actions
// link only to routes that exist for that choice, and everything stays on this device. No account, no network except
// the deck index of the slides page.
import {liveCourses,liveChapterCourse,isLiveHash} from './live-curriculum.js';
import {discoveryChapters} from './catalogue-data.js';
import {CLASSES,chaptersOf} from './exercises/bank.js';
import {resolveRef} from './lab/registry.js';
import {assetHref,fetchJSON} from './data-loader.js';

const E=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const STATE_FILE='maths-explorer-espace-professeur.json';
const SHORT={seconde:'Seconde',premiere:'Première spécialité',terminale:'Terminale spécialité',expertes:'Maths expertes',stmg:'Terminale STMG'};
const courseName=id=>SHORT[id]||liveCourses.find(c=>c.id===id)?.title[0]||id;

// Live chapters of one class, in book order.
export const chaptersFor=course=>discoveryChapters.filter(c=>c.course===course&&liveChapterCourse(c.id)===course).sort((a,b)=>a.number-b.number);
const chapterOf=id=>discoveryChapters.find(c=>c.id===id);

// The deck index lists {id (= chapter id), course, editions:{fr,...}}. null means it could not be read.
const deckHref=id=>{const base=assetHref('./slides/player.html');return base+(base.includes('?')?'&':'?')+'deck='+encodeURIComponent(id)+'&lang=fr';};

// Pure: the quick actions for a class and chapter. href is null when the target does not exist, with the reason in `why`.
// `label` and `why` are [French, English] pairs.
export function quickActions({course='',chapter='',decks=null}={}){
 const known=!course||CLASSES.some(c=>c.id===course);
 const name=course?courseName(course):'';
 const ch=chapter?chapterOf(chapter):null;
 const chTitle=ch?ch.title[0]:'';
 const out=[];
 const add=(id,label,href,detail,why)=>out.push({id,label,href:href||null,detail:detail||null,why:href?null:why});
 const noClass=['Cette classe n’a pas de générateur.','No generator for this class.'];
 add('starters',['Automatismes projetables','Projectable starters'],known?'#automatismes':'',
  course?[`Série chronométrée, réglée pour ${name}`,`Timed series for ${name}`]:['Série chronométrée à projeter','Timed series to project'],noClass);
 add('sheets',['Fiches et évaluations','Worksheets and tests'],known?'#sheets':'',
  course?[`Pour ${name}, avec corrigé`,`For ${name}, with answer key`]:['Avec corrigé et sujets A et B','With answer key and subjects A and B'],noClass);
 let bank='',bankDetail=null,bankWhy=null;
 if(course&&chapter&&ch&&ch.course===course){
  if(chaptersOf(course).includes(chapter)){bank=`#bank/${course}/${chapter}`;bankDetail=[chTitle,chTitle];}
  else bankWhy=['Pas encore d’exercices corrigés pour ce chapitre.','No worked exercises for this chapter yet.'];
 }else if(course){bank=`#bank/${course}`;bankDetail=[name,name];}
 else{bank='#bank';bankDetail=['Banque d’exercices corrigés','Worked exercise bank'];}
 add('exercises',['Exercices','Exercises'],bank,bankDetail,bankWhy);
 let slides='',slidesDetail=null,slidesWhy=null;
 if(course&&chapter&&ch&&ch.course===course){
  if(decks===null){slides=`#slides/${course}`;slidesDetail=[name,name];}
  else if(decks.some(d=>d.id===chapter&&d.editions?.fr)){slides=deckHref(chapter);slidesDetail=[chTitle,chTitle];}
  else slidesWhy=['Pas de diaporama pour ce chapitre.','No slide deck for this chapter.'];
 }else if(course){
  if(decks===null||decks.some(d=>d.course===course)){slides=`#slides/${course}`;slidesDetail=[name,name];}
  else slidesWhy=['Pas encore de diaporama pour cette classe.','No slide deck for this class yet.'];
 }else{slides='#slides';slidesDetail=['Tous les diaporamas','All slide decks'];}
 add('slides',['Diaporama','Slides'],slides,slidesDetail,slidesWhy);
 let lesson='#resources',lessonDetail=['Tous les chapitres','All chapters'];
 if(course&&chapter&&ch&&ch.course===course){lesson=`#chapter/${chapter}`;lessonDetail=[chTitle,chTitle];}
 else if(course){lesson=`#resources/${course}`;lessonDetail=[`Chapitres de ${name}`,`Chapters of ${name}`];}
 add('lesson',['Cours et documents','Lessons and documents'],lesson,lessonDetail);
 const ref=(ch?.labs||[]).find(r=>resolveRef(r));
 if(ref)add('lab',['Expérience du chapitre','Chapter experiment'],`#lab/${ref}`,[chTitle,chTitle]);
 else add('lab',['Laboratoire','Laboratory'],'#lab',['Expériences à manipuler','Experiments to handle']);
 return out;
}

const SECTIONS=(course)=>[
 [['Faire cours','Teach'],[['#automatismes',['Automatismes','Starters']],[course?`#slides/${course}`:'#slides',['Diaporamas','Slides']],['#lab',['Laboratoire','Laboratory']],['#gallery',['Curiosités','Curiosities']]]],
 [['Préparer','Prepare'],[[course?`#resources/${course}`:'#resources',['Cours','Lessons']],[course?`#bank/${course}`:'#bank',['Exercices','Exercises']],['#pack',['Composer un lot de documents','Build a document pack']],['#sources',['Sources LaTeX','LaTeX sources']]]],
 [['Évaluer','Assess'],[['#sheets',['Fiches et évaluations','Worksheets and tests']],['#bank/annales',['Annales d’examens','Past papers']],['#errors',['Erreurs fréquentes','Common errors']]]],
];

const download=(name,text)=>{
 const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');
 a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
};

const readText=f=>typeof f.text==='function'?f.text():new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(String(r.result));r.onerror=no;r.readAsText(f);});

// Renders into `main` and binds. `options.decks` (array or null) skips the network; `options.download(name, text)` replaces the file save.
export async function mountTeacherDashboard(main,{t,state,isGone=()=>false,decks,download:save=download}={}){
 const L=(fr,en)=>t([fr,en]),P=p=>t(p);
 if(decks===undefined)decks=await fetchJSON('./slides/data/index.json').catch(()=>null);
 if(isGone())return ()=>{};
 let confirmClear=false,message='';
 const live=href=>!href.startsWith('#')||isLiveHash(href);
 const link=(a)=>a.href?`<a class="td-action" href="${E(a.href)}" data-recent-id="${E(a.id)}" data-recent-title="${E(P(a.label)+(a.detail?' · '+P(a.detail):''))}"><span class="td-action-title">${E(P(a.label))}</span><span class="td-action-detail">${E(P(a.detail))}</span></a>`
  :`<span class="td-action is-unavailable"><span class="td-action-title">${E(P(a.label))}</span><span class="td-action-detail">${E(P(a.why))}</span></span>`;
 const itemRow=(it,kind)=>{
  const fav=state.isFavorite(it.type,it.id);
  const open=live(it.href)?`<a class="td-item-link" href="${E(it.href)}">${E(it.title)}</a>`:`<span class="td-item-link">${E(it.title)}</span>`;
  const star=kind==='recent'
   ?`<button type="button" class="btn-quiet" data-td="fav" data-type="${E(it.type)}" data-id="${E(it.id)}" aria-pressed="${fav}">${fav?L('Retirer des favoris','Remove from favorites'):L('Ajouter aux favoris','Add to favorites')}<span class="sr-only"> : ${E(it.title)}</span></button>`
   :`<button type="button" class="btn-quiet" data-td="unfav" data-type="${E(it.type)}" data-id="${E(it.id)}">${L('Retirer','Remove')}<span class="sr-only"> : ${E(it.title)}</span></button>`;
  return `<li>${open}${star}</li>`;
 };
 const draw=()=>{
  const {course,chapter}=state.getClassroom();
  const chapters=course?chaptersFor(course):[];
  const entry=state.getEntry();
  const recents=state.getRecent().filter(i=>live(i.href)),favorites=state.getFavorites().filter(i=>live(i.href));
  const ch=chapter?chapterOf(chapter):null;
  const actions=quickActions({course,chapter,decks});
  const memory=state.storageStatus()==='memory-only';
  main.innerHTML=`<h1>${L('Espace professeur','Teacher area')}</h1>
<p class="page-intro">${L('Tableau de bord de cet appareil : ta classe, tes derniers outils et des accès directs. Rien n’est envoyé ailleurs.','Dashboard for this device: your class, your latest tools and direct access. Nothing is sent elsewhere.')}</p>
${memory?`<p class="td-banner" role="status"><strong>${L('Stockage bloqué.','Storage blocked.')}</strong> ${L('Ce navigateur refuse d’enregistrer : tes choix ne sont gardés que pour cette session. Exporte-les ci-dessous pour les conserver.','This browser refuses to save: your choices only last for this session. Export them below to keep them.')}</p>`:''}
<section class="td-entry" aria-labelledby="td-entry-h"><h2 tabindex="-1" id="td-entry-h" class="sr-only">${L('Page d’accueil de cet appareil','Home page of this device')}</h2>
<p>${entry==='teacher'?L('Cet appareil s’ouvre sur l’Espace professeur.','This device opens on the Teacher area.'):L('Cet appareil s’ouvre sur l’accueil élèves.','This device opens on the student home.')}</p>
<span class="td-entry-actions">${entry==='teacher'
  ?`<a class="btn btn-secondary" href="#home" data-set-entry="student">${L('Revenir à l’accueil élèves','Back to the student home')}</a>`
  :`<button type="button" class="btn btn-secondary" data-td="entry-teacher">${L('Ouvrir l’Espace professeur au démarrage','Open the Teacher area at start-up')}</button><a class="btn-quiet" href="#home">${L('Accueil élèves','Student home')}</a>`}</span></section>
<section class="td-section" aria-labelledby="td-class-h"><h2 tabindex="-1" id="td-class-h">${L('Classe et chapitre','Class and chapter')}</h2>
<div class="td-selects"><label class="td-field"><span>${L('Classe','Class')}</span><select id="td-class"><option value="">${L('Aucune classe choisie','No class chosen')}</option>${liveCourses.map(c=>`<option value="${E(c.id)}"${c.id===course?' selected':''}>${E(courseName(c.id))}</option>`).join('')}</select></label>
<label class="td-field"><span>${L('Chapitre','Chapter')}</span><select id="td-chapter"${course?'':' disabled'}><option value="">${course?L('Aucun chapitre précis','No specific chapter'):L('Choisis d’abord une classe','Choose a class first')}</option>${chapters.map(c=>`<option value="${E(c.id)}"${c.id===chapter?' selected':''}>${String(c.number).padStart(2,'0')} · ${E(c.title[0])}</option>`).join('')}</select></label></div>
<p class="td-resume" id="td-resume">${course?`${L('Tu travailles avec','Working with')} <strong>${E(courseName(course))}</strong>${ch?` · <a href="#chapter/${E(chapter)}" data-recent-id="chapter-${E(chapter)}" data-recent-title="${E(ch.title[0])}" data-recent-type="chapter">${E(ch.title[0])}</a>`:''}.`:L('Aucune classe choisie sur cet appareil. Les actions ci-dessous couvrent toutes les classes.','No class chosen on this device. The actions below cover every class.')} <span class="muted">${L('Ce choix est partagé avec l’accueil, les cours, les exercices et les diaporamas.','This choice is shared with the home, lessons, exercises and slides.')}</span></p></section>
<section class="td-section" aria-labelledby="td-act-h"><h2 tabindex="-1" id="td-act-h">${L('Accès rapides','Quick actions')}</h2>
<ul class="td-actions">${actions.map(a=>`<li>${link(a)}</li>`).join('')}</ul></section>
<div class="td-columns">
<section class="td-section" aria-labelledby="td-rec-h"><h2 tabindex="-1" id="td-rec-h">${L('Récents','Recent')}</h2>
${recents.length?`<ul class="td-items">${recents.map(i=>itemRow(i,'recent')).join('')}</ul><button type="button" class="btn-quiet" data-td="clear-recent">${L('Effacer les récents','Clear recent items')}</button>`
 :`<p class="muted">${L('Aucun élément récent. Les accès rapides et chapitres ouverts depuis cette page apparaîtront ici.','Nothing recent yet. Quick actions and chapters opened from this page will appear here.')}</p>`}</section>
<section class="td-section" aria-labelledby="td-fav-h"><h2 tabindex="-1" id="td-fav-h">${L('Favoris','Favorites')}</h2>
${favorites.length?`<ul class="td-items">${favorites.map(i=>itemRow(i,'fav')).join('')}</ul>`
 :`<p class="muted">${L('Aucun favori. Ajoute un élément récent aux favoris pour le retrouver ici.','No favorites. Add a recent item to favorites to find it here.')}</p>`}</section></div>
<section class="td-section" aria-labelledby="td-jobs-h"><h2 tabindex="-1" id="td-jobs-h">${L('Par activité','By activity')}</h2><div class="td-jobs">${SECTIONS(course).map(([title,links])=>`<nav aria-label="${E(P(title))}"><h3>${E(P(title))}</h3><ul>${links.filter(([h])=>live(h)).map(([h,l])=>`<li><a href="${E(h)}">${E(P(l))}</a></li>`).join('')}</ul></nav>`).join('')}</div></section>
<section class="td-section" aria-labelledby="td-data-h"><h2 tabindex="-1" id="td-data-h">${L('Données de cet appareil','Data on this device')}</h2>
<p class="muted">${L('Ta classe, tes récents, tes favoris et tes réglages restent dans ce navigateur. Exporte-les pour les copier sur un autre appareil ou les sauvegarder.','Your class, recent items, favorites and settings stay in this browser. Export them to copy to another device or to back them up.')}</p>
<div class="td-data-actions"><button type="button" class="btn btn-secondary" data-td="export">${L('Exporter (.json)','Export (.json)')}</button>
<button type="button" class="btn btn-secondary" data-td="clear-ask">${L('Tout effacer…','Clear everything…')}</button></div>
<label class="td-field td-import"><span>${L('Importer un fichier exporté','Import an exported file')}</span><input id="td-import" type="file" accept="application/json,.json"></label>
${confirmClear?`<div class="td-confirm" role="alertdialog" aria-labelledby="td-confirm-t"><p id="td-confirm-t"><strong>${L('Tout effacer sur cet appareil ?','Clear everything on this device?')}</strong> ${L('Cela efface aussi la classe choisie (accueil, cours, exercices, diaporamas), les récents, les favoris et les réglages de l’Espace professeur.','This also forgets the chosen class (home, lessons, exercises, slides), recent items, favorites and Teacher area settings.')}</p><button type="button" class="btn btn-primary" data-td="clear-yes">${L('Oui, tout effacer','Yes, clear everything')}</button> <button type="button" class="btn btn-secondary" data-td="clear-no">${L('Annuler','Cancel')}</button></div>`:''}
<p id="td-message" class="td-message" role="status" aria-live="polite">${E(message)}</p></section>`;
 };
 const focusAfter=id=>main.querySelector('#'+id)?.focus();
 const click=e=>{
  const a=e.target.closest('a[data-recent-id]');
  if(a){
   state.addRecent({type:a.dataset.recentType||'tool',id:a.dataset.recentId+'|'+(state.getClassroom().chapter||state.getClassroom().course),title:a.dataset.recentTitle,href:a.getAttribute('href')});
   return;
  }
  const b=e.target.closest('[data-td]');if(!b)return;
  const d=b.dataset.td;
  if(d==='entry-teacher'){state.setEntry('teacher');message=L('Cet appareil s’ouvrira sur l’Espace professeur.','This device will now open on the Teacher area.');draw();focusAfter('td-entry-h');}
  else if(d==='fav'){state.toggleFavorite(state.getRecent().find(i=>i.type===b.dataset.type&&i.id===b.dataset.id));draw();[...main.querySelectorAll('[data-td="fav"]')].find(x=>x.dataset.id===b.dataset.id)?.focus();}
  else if(d==='unfav'){state.removeFavorite(b.dataset.type,b.dataset.id);draw();focusAfter('td-fav-h');}
  else if(d==='clear-recent'){state.clearRecent();draw();focusAfter('td-rec-h');}
  else if(d==='export'){save(STATE_FILE,JSON.stringify(state.exportState(),null,2));message=L('Fichier exporté.','File exported.');main.querySelector('#td-message').textContent=message;}
  else if(d==='clear-ask'){confirmClear=true;draw();main.querySelector('[data-td="clear-no"]')?.focus();}
  else if(d==='clear-no'){confirmClear=false;draw();main.querySelector('[data-td="clear-ask"]')?.focus();}
  else if(d==='clear-yes'){state.clearAll();confirmClear=false;message=L('Tout est effacé, y compris la classe choisie.','Everything is cleared, including the chosen class.');draw();focusAfter('td-data-h');}
 };
 const change=async e=>{
  const el=e.target;
  if(el.id==='td-class'){state.setClassroom({course:el.value});message='';draw();focusAfter('td-class');}
  else if(el.id==='td-chapter'){state.setChapter(el.value);message='';draw();focusAfter('td-chapter');}
  else if(el.id==='td-import'){
   const file=el.files?.[0];if(!file)return;
   let r;try{r=state.importState(await readText(file));}catch{r={ok:false,applied:[],rejected:1};}
   message=r.ok?`${L('Importé','Imported')} : ${r.applied.length} ${L('rubrique(s)','section(s)')}${r.rejected?`, ${r.rejected} ${L('élément(s) ignoré(s)','item(s) skipped')}`:''}.`
    :L('Fichier non reconnu : rien n’a été modifié.','File not recognised: nothing was changed.');
   draw();focusAfter('td-data-h');
  }
 };
 main.addEventListener('click',click);main.addEventListener('change',change);
 draw();
 return ()=>{main.removeEventListener('click',click);main.removeEventListener('change',change);};
}
