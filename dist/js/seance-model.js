// Séance model: pure logic (no DOM, no storage) for the teacher's lesson plan. All updates are immutable.
// A séance is {blocks:[{id,phase,resourceId?,title,href,minutes,print}]}. Strings shown to users are [fr,en] pairs.
export const MAX_BLOCKS=30,MAX_MINUTES=90,TARGET_MINUTES=55,PRINT_WARNING_ABOVE=3;
// Default minutes are a convention (a 55 minute lesson), not an official text; the UI must never present them as rules.
export const PHASES=Object.freeze([
 {id:'automatismes',label:['Automatismes','Warm-up drills'],minutes:5},
 {id:'correction',label:['Correction','Correction'],minutes:8},
 {id:'activite',label:['Activité','Activity'],minutes:12},
 {id:'cours',label:['Cours','Lesson'],minutes:15},
 {id:'exercices',label:['Exercices','Exercises'],minutes:15},
 {id:'outils',label:['Outils','Tools'],minutes:0},
 {id:'bilan',label:['Bilan','Wrap-up'],minutes:5},
].map(p=>Object.freeze({...p,label:Object.freeze(p.label)})));
const PHASE_IDS=PHASES.map(p=>p.id);
export const phaseById=id=>PHASES.find(p=>p.id===id)||null;
const str=(v,n)=>typeof v==='string'&&v.length>0&&v.length<=n;
const safeHref=h=>str(h,500)&&!h.startsWith('//')&&/^(#|\/|\.\/|\.\.\/|https?:\/\/)/.test(h);
const clampMin=m=>Number.isFinite(m)?Math.min(MAX_MINUTES,Math.max(0,Math.round(m))):0;
export const emptySeance=()=>({blocks:[]});
// Returns a clean block or null.
function cleanBlock(x){
 if(!x||typeof x!=='object'||!str(x.id,100)||!PHASE_IDS.includes(x.phase)||!str(x.title,200)||!safeHref(x.href))return null;
 const b={id:x.id,phase:x.phase,title:x.title,href:x.href,minutes:clampMin(x.minutes),print:x.print===true};
 if(str(x.resourceId,200))b.resourceId=x.resourceId;
 return b;
}
// Validates any input; drops bad blocks and repeated ids, caps at MAX_BLOCKS.
export function cleanSeance(x){
 const out=[],seen=new Set();
 for(const raw of Array.isArray(x?.blocks)?x.blocks:[]){
  const b=cleanBlock(raw);if(!b||seen.has(b.id))continue;
  seen.add(b.id);out.push(b);if(out.length>=MAX_BLOCKS)break;
 }
 return {blocks:out};
}
const uniqueId=(blocks,phase)=>{let n=blocks.length+1;const ids=new Set(blocks.map(b=>b.id));while(ids.has(phase+'-'+n))n++;return phase+'-'+n;};
// resolve(phaseId,{course,chapter}) returns {href,title?,resourceId?,minutes?} or a href string; nothing skips the phase.
export function defaultSeance({course='',chapter=''}={},resolve=()=>null){
 const blocks=[];
 for(const p of PHASES){
  const r=resolve(p.id,{course,chapter}),o=typeof r==='string'?{href:r}:r;
  if(!o)continue;
  const b=cleanBlock({id:p.id+'-'+(blocks.length+1),phase:p.id,resourceId:o.resourceId,title:o.title||p.label[0],href:o.href,minutes:o.minutes??p.minutes,print:false});
  if(b)blocks.push(b);
 }
 return {blocks};
}
// Adds a block at the end. Returns the same séance when the block is invalid or the cap is reached.
export function addBlock(seance,block){
 const s=cleanSeance(seance);
 if(s.blocks.length>=MAX_BLOCKS)return s;
 const phase=phaseById(block?.phase);
 const b=cleanBlock({...block,id:str(block?.id,100)&&!s.blocks.some(x=>x.id===block.id)?block.id:uniqueId(s.blocks,String(block?.phase)),minutes:block?.minutes??phase?.minutes??0});
 return b?{blocks:[...s.blocks,b]}:s;
}
export const removeBlock=(seance,id)=>{const s=cleanSeance(seance);return {blocks:s.blocks.filter(b=>b.id!==id)};};
// Moves the block at index `from` so that it ends at index `to` (clamped to the list). Same séance when nothing changes.
export function moveBlockTo(seance,from,to){
 const s=cleanSeance(seance),n=s.blocks.length;
 if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||from>=n)return s;
 const t=Math.min(n-1,Math.max(0,to));
 if(t===from)return s;
 const a=[...s.blocks],[b]=a.splice(from,1);a.splice(t,0,b);return {blocks:a};
}
// Moves the block at index by delta places (negative = earlier), staying inside the list.
export const moveBlock=(seance,index,delta)=>Number.isInteger(index)&&Number.isInteger(delta)?moveBlockTo(seance,index,index+delta):cleanSeance(seance);
const patch=(seance,id,f)=>{const s=cleanSeance(seance);return {blocks:s.blocks.map(b=>b.id===id?f(b):b)};};
export const setMinutes=(seance,id,minutes)=>patch(seance,id,b=>({...b,minutes:clampMin(minutes)}));
export const togglePrint=(seance,id)=>patch(seance,id,b=>({...b,print:!b.print}));
export function totals(seance,{target=TARGET_MINUTES}={}){
 const s=cleanSeance(seance);
 const minutes=s.blocks.reduce((t,b)=>t+b.minutes,0),printCount=s.blocks.filter(b=>b.print).length;
 return {minutes,over:minutes>target,printCount,printWarning:printCount>PRINT_WARNING_ABOVE};
}
