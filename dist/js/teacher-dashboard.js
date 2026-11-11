// Teacher area (#teacher): a compact dashboard over the existing resources. Loaded on demand by app.js.
// Class and chapter come from teacher-state.js (shared with the rest of the site, always changeable here), quick actions
// link only to routes that exist for that choice, and everything stays on this device. No account, no network except
// the deck index of the slides page.
import {liveCourses,liveChapterCourse,isLiveHash} from './live-curriculum.js';
import {discoveryChapters} from './catalogue-data.js';
import {fetchJSON} from './data-loader.js';
import {autoDefaults} from './classroom-context.js';
import {courseName,chapterOf,noClass,isKnownClass,resolveTargets,launchpad,resolveForSeance} from './launchpad-model.js';
import {defaultSeance,totals} from './seance-model.js';

const E=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const STATE_FILE='maths-explorer-espace-professeur.json';

// Live chapters of one class, in book order.
export const chaptersFor=course=>discoveryChapters.filter(c=>c.course===course&&liveChapterCourse(c.id)===course).sort((a,b)=>a.number-b.number);

// Pure: the quick actions for a class and chapter. href is null when the target does not exist, with the reason in `why`.
// `label` and `why` are [French, English] pairs. Targets come from launchpad-model.js (one source with the launch pad).
export function quickActions({course='',chapter='',decks=null}={}){
 const known=isKnownClass(course),name=course?courseName(course):'',T=resolveTargets({course,chapter,decks});
 const out=[];
 const add=(id,label,href,detail,why)=>out.push({id,label,href:href||null,detail:detail||null,why:href?null:why});
 add('starters',['Automatismes projetables','Projectable starters'],known?'#automatismes':'',
  course?[`Série chronométrée, réglée pour ${name}`,`Timed series for ${name}`]:['Série chronométrée à projeter','Timed series to project'],noClass);
 add('sheets',['Fiches et évaluations','Worksheets and tests'],known?'#sheets':'',
  course?[`Pour ${name}, avec corrigé`,`For ${name}, with answer key`]:['Avec corrigé et sujets A et B','With answer key and subjects A and B'],noClass);
 add('exercises',['Exercices','Exercises'],T.bank.href,T.bank.detail,T.bank.why);
 add('slides',['Diaporama','Slides'],T.slides.href,T.slides.detail,T.slides.why);
 add('lesson',['Cours et documents','Lessons and documents'],T.lesson.href,T.lesson.detail);
 if(T.lab.experiment)add('lab',['Expérience du chapitre','Chapter experiment'],T.lab.href,T.lab.detail);
 else add('lab',['Laboratoire','Laboratory'],T.lab.href,T.lab.detail);
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
export async function mountTeacherDashboard(main,{t,state,isGone=()=>false,decks,download:save=download,search=true}={}){
 const L=(fr,en)=>t([fr,en]),P=p=>t(p);
 if(decks===undefined)decks=await fetchJSON('./slides/data/index.json').catch(()=>null);
 if(isGone())return ()=>{};
 let confirmClear=false,message='',autoOpen=false;
 // The search box lives in one node that survives every redraw (typed text and results are kept).
 const searchHost=main.ownerDocument.createElement('div');searchHost.id='td-search-host';let stopSearch=()=>{};
 const live=href=>!href.startsWith('#')||isLiveHash(href);
// One tile of the launch pad. Projecteur view: the whole tile is the link. Tableau view: the board script, a paper tag
 // and the link kept as "Ouvrir".
 const tile=(p,i,view)=>{
  const title=P(p.label),detail=p.detail?P(p.detail):'';
  const rec=`data-recent-id="${E(p.id)}" data-recent-title="${E(title+' · '+detail)}"`;
  const head=`<span class="lp-n" aria-hidden="true">${i+1}</span>`;
  if(view!=='tableau')return p.href
   ?`<a class="lp-tile" href="${E(p.href)}" ${rec}>${head}<span class="lp-title">${E(title)}</span><span class="lp-detail">${E(detail)}</span></a>`
   :`<span class="lp-tile is-unavailable">${head}<span class="lp-title">${E(title)}</span><span class="lp-detail">${E(P(p.why))}</span></span>`;
  return `<div class="lp-tile lp-board${p.href?'':' is-unavailable'}">${head}<h3 class="lp-title">${E(title)}</h3><p class="lp-detail">${E(detail)}</p>
<ul class="lp-script">${p.board.map(l=>`<li>${E(P(l))}</li>`).join('')}</ul>
<p class="lp-tag${p.print?' is-print':''}">${p.print?L('fiche à imprimer','printed sheet'):L('sans papier','no paper')}</p>
${p.href?`<a class="btn btn-secondary lp-open" href="${E(p.href)}" ${rec}>${L('Ouvrir','Open')}<span class="sr-only"> : ${E(title)}</span></a>`:`<p class="lp-why">${E(P(p.why))}</p>`}</div>`;
 };
 const seanceStrip=(seance,tot)=>{
  const body=seance.blocks.length
   ?`<ol class="lp-blocks">${seance.blocks.map(b=>`<li>${live(b.href)?`<a class="lp-block" href="${E(b.href)}">`:'<span class="lp-block">'}<span class="lp-block-title">${E(b.title)}</span><span class="lp-block-min">${b.minutes} min</span>${live(b.href)?'</a>':'</span>'}</li>`).join('')}</ol>
<p class="lp-total">${tot.minutes} min${tot.over?` · ${L('au-delà de 55 minutes','over 55 minutes')}`:''}${tot.printCount?` · ${tot.printCount} ${L('à imprimer','to print')}`:''}</p>`
   :`<p class="muted">${L('Aucune séance préparée sur cet appareil.','No séance prepared on this device.')}</p>
<p><button type="button" class="btn btn-secondary" data-td="propose">${L('Proposer une séance type','Suggest a standard séance')}</button></p>`;
  return `<section class="td-section lp-seance" aria-labelledby="td-seance-h"><h2 tabindex="-1" id="td-seance-h">${L('Ma séance','My séance')}</h2>${body}
<p><a class="lp-build" href="#prepare">${seance.blocks.length?L('Modifier dans Préparer','Edit in Prepare'):L('La composer dans Préparer','Build it in Prepare')}</a></p></section>`;
 };
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
  const auto=autoDefaults(state.getTools());
  const memory=state.storageStatus()==='memory-only';
  const view=state.getTools().view==='tableau'?'tableau':'projecteur';
  const phases=launchpad({course,chapter,decks}),seance=state.getSeance();
  main.innerHTML=`<h1>${L('En classe','In class')}</h1>
${memory?`<p class="td-banner" role="status"><strong>${L('Stockage bloqué.','Storage blocked.')}</strong> ${L('Ce navigateur refuse d’enregistrer : tes choix ne sont gardés que pour cette session. Exporte-les ci-dessous pour les conserver.','This browser refuses to save: your choices only last for this session. Export them below to keep them.')}</p>`:''}
<section class="td-section td-class" aria-labelledby="td-class-h"><h2 tabindex="-1" id="td-class-h" class="sr-only">${L('Classe et chapitre','Class and chapter')}</h2>
<div class="td-selects"><label class="td-field"><span>${L('Classe','Class')}</span><select id="td-class"><option value="">${L('Aucune classe choisie','No class chosen')}</option>${liveCourses.map(c=>`<option value="${E(c.id)}"${c.id===course?' selected':''}>${E(courseName(c.id))}</option>`).join('')}</select></label>
<label class="td-field"><span>${L('Chapitre','Chapter')}</span><select id="td-chapter"${course?'':' disabled'}><option value="">${course?L('Aucun chapitre précis','No specific chapter'):L('Choisis d’abord une classe','Choose a class first')}</option>${chapters.map(c=>`<option value="${E(c.id)}"${c.id===chapter?' selected':''}>${String(c.number).padStart(2,'0')} · ${E(c.title[0])}</option>`).join('')}</select></label></div>
<p class="td-resume" id="td-resume">${course?`${L('Tu travailles avec','Working with')} <strong>${E(courseName(course))}</strong>${ch?` · <a href="#chapter/${E(chapter)}" data-recent-id="chapter-${E(chapter)}" data-recent-title="${E(ch.title[0])}" data-recent-type="chapter">${E(ch.title[0])}</a>`:''}.`:L('Aucune classe choisie sur cet appareil. Les actions ci-dessous couvrent toutes les classes.','No class chosen on this device. The actions below cover every class.')} <span class="muted">${L('Ce choix est partagé avec l’accueil, les cours, les exercices et les diaporamas.','This choice is shared with the home, lessons, exercises and slides.')}</span></p></section>
<div class="lp-switch" role="group" aria-label="${L('Affichage','Display')}"><button type="button" class="btn ${view==='projecteur'?'btn-primary':'btn-secondary'}" data-td="view" data-view="projecteur" aria-pressed="${view==='projecteur'}">${L('Projecteur','Projector')}</button><button type="button" class="btn ${view==='tableau'?'btn-primary':'btn-secondary'}" data-td="view" data-view="tableau" aria-pressed="${view==='tableau'}">${L('Tableau seul','Board only')}</button></div>
<section class="td-section lp-pad" aria-labelledby="td-pad-h"><h2 tabindex="-1" id="td-pad-h" class="sr-only">${L('Phases de la séance','Session phases')}</h2>
<ol class="lp-grid">${phases.map((p,i)=>`<li>${tile(p,i,view)}</li>`).join('')}</ol></section>
${seanceStrip(seance,totals(seance))}
<section class="td-section td-timed" aria-labelledby="td-timed-h"><h2 tabindex="-1" id="td-timed-h">${L('Automatismes en un clic','Timed starters in one click')}</h2>
<p><a class="btn btn-primary td-go" href="#automatismes/go">${L('Lancer la série projetée','Start the projected series')}</a> <span class="muted" id="td-timed-sum">${course?E(courseName(course))+(ch?' · '+E(ch.title[0]):''):L('Toutes les classes','Any class')} · ${auto.minutes} min · ${auto.count} ${L('questions','questions')} · ${auto.seedPolicy==='keep'?L('même série','same series'):L('nouvelle série','new series')}</span></p>
<details class="secondary-tools"${autoOpen?' open':''}><summary>${L('Réglages mémorisés sur cet appareil','Defaults remembered on this device')}</summary>
<div class="td-selects"><label class="td-field"><span>${L('Durée totale (minutes)','Total time (minutes)')}</span><input id="td-auto-minutes" type="number" min="1" max="60" value="${auto.minutes}"></label>
<label class="td-field"><span>${L('Nombre de questions','Number of questions')}</span><input id="td-auto-count" type="number" min="3" max="30" value="${auto.count}"></label>
<label class="td-field"><span>${L('Série','Series')}</span><select id="td-auto-seed"><option value="new"${auto.seedPolicy==='new'?' selected':''}>${L('Nouvelle série à chaque lancement','New series each time')}</option><option value="keep"${auto.seedPolicy==='keep'?' selected':''}>${L('Garder le code de la dernière série','Keep the last series code')}</option></select></label></div></details>
<p class="muted">${L('La classe et le chapitre viennent du choix ci-dessus. Sur la page, tout reste modifiable : chapitres, durée, code de la série, réponses, plein écran, impression et exports.','Class and chapter come from the choice above. On the page everything stays editable: chapters, time, series code, answers, full screen, printing and exports.')}</p></section>
<section class="td-section td-search" id="td-search-slot" aria-label="${L('Recherche','Search')}"></section>
<div class="td-columns">
<section class="td-section" aria-labelledby="td-rec-h"><h2 tabindex="-1" id="td-rec-h">${L('Récents','Recent')}</h2>
${recents.length?`<ul class="td-items">${recents.map(i=>itemRow(i,'recent')).join('')}</ul><button type="button" class="btn-quiet" data-td="clear-recent">${L('Effacer les récents','Clear recent items')}</button>`
 :`<p class="muted">${L('Aucun élément récent. Les tuiles et chapitres ouverts depuis cette page apparaîtront ici.','Nothing recent yet. Tiles and chapters opened from this page will appear here.')}</p>`}</section>
<section class="td-section" aria-labelledby="td-fav-h"><h2 tabindex="-1" id="td-fav-h">${L('Favoris','Favorites')}</h2>
${favorites.length?`<ul class="td-items">${favorites.map(i=>itemRow(i,'fav')).join('')}</ul>`
 :`<p class="muted">${L('Aucun favori. Ajoute un élément récent aux favoris pour le retrouver ici.','No favorites. Add a recent item to favorites to find it here.')}</p>`}</section></div>
<section class="td-section" aria-labelledby="td-jobs-h"><h2 tabindex="-1" id="td-jobs-h">${L('Par activité','By activity')}</h2><div class="td-jobs">${SECTIONS(course).map(([title,links])=>`<nav aria-label="${E(P(title))}"><h3>${E(P(title))}</h3><ul>${links.filter(([h])=>live(h)).map(([h,l])=>`<li><a href="${E(h)}">${E(P(l))}</a></li>`).join('')}</ul></nav>`).join('')}</div></section>
<section class="td-entry" aria-labelledby="td-entry-h"><h2 tabindex="-1" id="td-entry-h" class="sr-only">${L('Page d’accueil de cet appareil','Home page of this device')}</h2>
<p>${entry==='teacher'?L('Cet appareil s’ouvre sur l’Espace professeur.','This device opens on the Teacher area.'):L('Cet appareil s’ouvre sur l’accueil élèves.','This device opens on the student home.')}</p>
<span class="td-entry-actions">${entry==='teacher'
  ?`<a class="btn btn-secondary" href="#home" data-set-entry="student">${L('Revenir à l’accueil élèves','Back to the student home')}</a>`
  :`<button type="button" class="btn btn-secondary" data-td="entry-teacher">${L('Ouvrir l’Espace professeur au démarrage','Open the Teacher area at start-up')}</button><a class="btn-quiet" href="#home">${L('Accueil élèves','Student home')}</a>`}</span></section>
<section class="td-section" aria-labelledby="td-data-h"><h2 tabindex="-1" id="td-data-h">${L('Données de cet appareil','Data on this device')}</h2>
<p class="muted">${L('Ta classe, tes récents, tes favoris et tes réglages restent dans ce navigateur. Exporte-les pour les copier sur un autre appareil ou les sauvegarder.','Your class, recent items, favorites and settings stay in this browser. Export them to copy to another device or to back them up.')}</p>
<div class="td-data-actions"><button type="button" class="btn btn-secondary" data-td="export">${L('Exporter (.json)','Export (.json)')}</button>
<button type="button" class="btn btn-secondary" data-td="clear-ask">${L('Tout effacer…','Clear everything…')}</button></div>
<label class="td-field td-import"><span>${L('Importer un fichier exporté','Import an exported file')}</span><input id="td-import" type="file" accept="application/json,.json"></label>
${confirmClear?`<div class="td-confirm" role="alertdialog" aria-labelledby="td-confirm-t"><p id="td-confirm-t"><strong>${L('Tout effacer sur cet appareil ?','Clear everything on this device?')}</strong> ${L('Cela efface aussi la classe choisie (accueil, cours, exercices, diaporamas), les récents, les favoris et les réglages de l’Espace professeur.','This also forgets the chosen class (home, lessons, exercises, slides), recent items, favorites and Teacher area settings.')}</p><button type="button" class="btn btn-primary" data-td="clear-yes">${L('Oui, tout effacer','Yes, clear everything')}</button> <button type="button" class="btn btn-secondary" data-td="clear-no">${L('Annuler','Cancel')}</button></div>`:''}
<p id="td-message" class="td-message" role="status" aria-live="polite">${E(message)}</p></section>`;
 main.querySelector('#td-search-slot')?.append(searchHost);
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
  if(d==='view'){state.setTools({view:b.dataset.view==='tableau'?'tableau':'projecteur'});draw();main.querySelector(`[data-td="view"][data-view="${b.dataset.view}"]`)?.focus();}
  else if(d==='propose'){state.setSeance(defaultSeance({course:state.getClassroom().course,chapter:state.getClassroom().chapter},resolveForSeance(state.getClassroom().course,state.getClassroom().chapter,decks)));draw();focusAfter('td-seance-h');}
  else if(d==='entry-teacher'){state.setEntry('teacher');message=L('Cet appareil s’ouvrira sur l’Espace professeur.','This device will now open on the Teacher area.');draw();focusAfter('td-entry-h');}
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
  else if(el.id==='td-auto-minutes'||el.id==='td-auto-count'||el.id==='td-auto-seed'){
   const patch=el.id==='td-auto-seed'?{seedPolicy:el.value}:el.id==='td-auto-count'?{count:Number(el.value)}:{minutes:Number(el.value)};
   const keep=el.id;autoOpen=true;state.setTools({automatismes:autoDefaults({automatismes:{...autoDefaults(state.getTools()),...patch}})});message='';draw();main.querySelector('#'+keep)?.focus();
  }
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
 if(search)import('./resource-search.js').then(m=>m.mountResourceSearch(searchHost,{t,state,decks,isGone})).then(stop=>{stopSearch=stop;if(isGone())stop();}).catch(()=>{searchHost.innerHTML=`<p class="muted" role="status">${L('La recherche n’a pas pu se charger.','Search could not load.')}</p>`;});
 return ()=>{main.removeEventListener('click',click);main.removeEventListener('change',change);stopSearch();};
}
