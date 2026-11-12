// Launch pad model for En classe (#teacher): pure, no DOM, no storage. One place resolves where each classroom
// target of a class and chapter lives (bank, slides, lesson, laboratory); teacher-dashboard.js `quickActions` and the
// seven phases of seance-model.js both read it. Strings are [French, English] pairs.
import {liveCourses,liveChapterCourse} from './live-curriculum.js';
import {discoveryChapters} from './catalogue-data.js';
import {CLASSES,chaptersOf} from './exercises/bank.js';
import {resolveRef} from './lab/registry.js';
import {assetHref} from './data-loader.js';
import {PHASES} from './seance-model.js';

const SHORT={seconde:'Seconde',premiere:'Première spécialité',terminale:'Terminale spécialité',expertes:'Maths expertes',stmg:'Terminale STMG'};
export const courseName=id=>SHORT[id]||liveCourses.find(c=>c.id===id)?.title[0]||id;
export const chapterOf=id=>discoveryChapters.find(c=>c.id===id);
export const noClass=['Cette classe n’a pas de générateur.','No generator for this class.'];
export const deckHref=id=>{const base=assetHref('./slides/player.html');return base+(base.includes('?')?'&':'?')+'deck='+encodeURIComponent(id)+'&lang=fr';};
export const isKnownClass=course=>!course||CLASSES.some(c=>c.id===course);

// The classroom targets of a class and chapter: {bank,slides,lesson,lab}, each {href|'' ,detail|null,why|null}.
// `decks` is the slides index (array) or null when it could not be read.
export function resolveTargets({course='',chapter='',decks=null}={}){
 const name=course?courseName(course):'';
 const ch=chapter?chapterOf(chapter):null,chTitle=ch?ch.title[0]:'';
 const here=!!(course&&chapter&&ch&&ch.course===course);
 let bank='',bankDetail=null,bankWhy=null;
 if(here){
  if(chaptersOf(course).includes(chapter)){bank=`#bank/${course}/${chapter}`;bankDetail=[chTitle,chTitle];}
  else bankWhy=['Pas encore d’exercices corrigés pour ce chapitre.','No worked exercises for this chapter yet.'];
 }else if(course){bank=`#bank/${course}`;bankDetail=[name,name];}
 else{bank='#bank';bankDetail=['Banque d’exercices corrigés','Worked exercise bank'];}
 let slides='',slidesDetail=null,slidesWhy=null;
 if(here){
  if(decks===null){slides=`#slides/${course}`;slidesDetail=[name,name];}
  else if(decks.some(d=>d.id===chapter&&d.editions?.fr)){slides=deckHref(chapter);slidesDetail=[chTitle,chTitle];}
  else slidesWhy=['Pas de diaporama pour ce chapitre.','No slide deck for this chapter.'];
 }else if(course){
  if(decks===null||decks.some(d=>d.course===course)){slides=`#slides/${course}`;slidesDetail=[name,name];}
  else slidesWhy=['Pas encore de diaporama pour cette classe.','No slide deck for this class yet.'];
 }else{slides='#slides';slidesDetail=['Tous les diaporamas','All slide decks'];}
 let lesson='#resources',lessonDetail=['Tous les chapitres','All chapters'];
 if(here){lesson=`#chapter/${chapter}`;lessonDetail=[chTitle,chTitle];}
 else if(course){lesson=`#resources/${course}`;lessonDetail=[`Chapitres de ${name}`,`Chapters of ${name}`];}
 const ref=(ch?.labs||[]).find(r=>resolveRef(r));
 const lab=ref?{href:`#lab/${ref}`,detail:[chTitle,chTitle],experiment:true}:{href:'#lab',detail:['Expériences à manipuler','Experiments to handle'],experiment:false};
 const T=(href,detail,why)=>({href:href||'',detail:detail||null,why:href?null:why||null});
 return {bank:T(bank,bankDetail,bankWhy),slides:T(slides,slidesDetail,slidesWhy),lesson:T(lesson,lessonDetail),lab:{...T(lab.href,lab.detail),experiment:lab.experiment},
  here,name,chTitle,hasDeck:here&&slides.includes('player.html')};
}

const PRINT=new Set(['exercices','bilan']);
const pre=(p,d)=>d?[`${p[0]} : ${d[0]}`,`${p[1]}: ${d[1]}`]:null;

// The seven phases of seance-model.js, in order: {id,label,detail,href|null,why|null,print}.
// `view` is the En classe switch: 'projecteur' (default) opens the projectable form of each resource (timed series,
// slide player); 'tableau' opens the non-projected form (list of questions, chapter page). Other phases are the same.
export function launchpad({course='',chapter='',decks=null,view='projecteur'}={}){
 const T=resolveTargets({course,chapter,decks}),known=isKnownClass(course),board=view==='tableau';
 const auto=board
  ?{href:known?'#automatismes/list':'',detail:course?[`Liste des questions, réglée pour ${T.name}`,`List of questions, set for ${T.name}`]:['Liste des questions de la série','List of the series questions'],why:known?null:noClass}
  :{href:known?'#automatismes/go':'',
  detail:course?[`Série chronométrée, réglée pour ${T.name}`,`Timed series for ${T.name}`]:['Série chronométrée à projeter','Timed series to project'],why:known?null:noClass};
 const bank=T.bank,generic=(fr,en)=>[fr,en];
 const cours=T.hasDeck&&!board?{href:T.slides.href,detail:pre(['Diaporama','Slides'],T.slides.detail)}:{href:T.lesson.href,detail:T.lesson.detail};
 const by={
  automatismes:auto,
  correction:{href:bank.href,detail:pre(['Corrigés','Answer keys'],bank.detail)||generic('Exercices donnés, avec corrigés','Set exercises, with answer keys'),why:bank.why},
  activite:{href:T.lab.href,detail:T.lab.detail,why:null},
  cours:{...cours,why:null},
  exercices:{href:bank.href,detail:pre(['Par niveau','By level'],bank.detail)||generic('Exercices du chapitre, par niveau','Chapter exercises, by level'),why:bank.why},
  outils:{href:'#lab',detail:['Laboratoire, curiosités, erreurs à corriger','Laboratory, curiosities, errors to correct'],why:null},
  bilan:{href:bank.href,detail:pre(['Travail à donner','Homework to pick'],bank.detail)||generic('Choisir le travail à donner','Pick the homework'),why:bank.why},
 };
 return PHASES.map(p=>{
  const x=by[p.id];
  return {id:p.id,label:p.label,detail:x.detail,href:x.href||null,why:x.href?null:(x.why||generic('Non disponible.','Not available.')),print:PRINT.has(p.id)};
 });
}

// Resolver for seance-model.js defaultSeance: phases that cannot be reached are skipped.
export function resolveForSeance(course='',chapter='',decks=null){
 const phases=launchpad({course,chapter,decks});
 return phaseId=>{const p=phases.find(x=>x.id===phaseId);return p&&p.href?{href:p.href}:null;};
}
