// Préparer (#prepare) model: pure helpers (no DOM, no storage). Maps a search item to a séance phase and a block,
// and words the totals. Strings shown to users are [French, English] pairs.
import {PHASES,MAX_BLOCKS,TARGET_MINUTES,PRINT_WARNING_ABOVE} from './seance-model.js';

// Phase a resource of this index type usually belongs to; the teacher can change it before adding.
const PHASE_OF_TYPE=Object.freeze({exercise:'exercices',exercises:'exercices',annales:'exercices',slides:'cours',deck:'cours',chapter:'cours',lesson:'cours',
 lab:'activite',misconception:'outils',errors:'outils',error:'outils',gallery:'outils',tool:'outils',challenge:'outils',history:'outils',automatismes:'automatismes',starters:'automatismes'});
export const phaseForType=type=>PHASE_OF_TYPE[type]||'outils';
export const isPhase=id=>PHASES.some(p=>p.id===id);

// A séance block from a search item (title pair, actions) in a phase; null when the item has no address.
export function blockFromItem(item,phase,lang=0){
 const a=item?.actions||{},href=(a.open||a.manipulate||a.project)?.href||'';
 const title=Array.isArray(item?.title)?item.title[lang]||item.title[0]:String(item?.title||'');
 if(!href||!title)return null;
 return {phase:isPhase(phase)?phase:phaseForType(item.type),resourceId:item.id,title,href,print:false};
}
// A block from a chapter sheet row (launchpad phase with an href).
export function blockFromPhase(p,lang=0){
 if(!p?.href)return null;
 const label=p.label[lang]||p.label[0],detail=p.detail?(p.detail[lang]||p.detail[0]):'';
 return {phase:p.id,title:detail?`${label} : ${detail}`:label,href:p.href,print:false};
}
// What to say about the totals: {minutesText:[fr,en], over, printText:[fr,en], warn:[fr,en]|null, full}.
export function describeTotals(tot,count=0){
 const gap=Math.abs(tot.minutes-TARGET_MINUTES);
 const minutesText=tot.over?[`${tot.minutes} min sur ${TARGET_MINUTES} : ${gap} min de trop`,`${tot.minutes} min of ${TARGET_MINUTES}: ${gap} min too many`]
  :[`${tot.minutes} min sur ${TARGET_MINUTES} : ${gap} min libres`,`${tot.minutes} min of ${TARGET_MINUTES}: ${gap} min free`];
 const printText=[`${tot.printCount} fiche${tot.printCount>1?'s':''} à imprimer`,`${tot.printCount} sheet${tot.printCount>1?'s':''} to print`];
 const warn=tot.printCount>PRINT_WARNING_ABOVE?['Beaucoup de papier : plus de 3 fiches à imprimer.','A lot of paper: more than 3 sheets to print.']:null;
 return {minutesText,over:tot.over,printText,warn,full:count>=MAX_BLOCKS};
}
// Titles of the blocks to print, in order.
export const printList=seance=>seance.blocks.filter(b=>b.print).map(b=>b.title);
// Live-route filter for a list of [hash,fr,en].
export const liveLinks=(links,isLive)=>links.filter(([h])=>!h.startsWith('#')||isLive(h));
