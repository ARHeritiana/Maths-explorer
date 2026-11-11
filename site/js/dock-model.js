// In-class dock model: pure (no DOM, no storage). The dock is the slim bar of the seven launch pad phases shown on tool
// pages while the remembered mode is En classe. Strings shown to users are [French, English] pairs.
import {launchpad} from './launchpad-model.js';
import {showModeBar} from './modes.js';

// Pages that are never tool pages: the three mode homes, the student home, unknown routes.
const NOT_TOOLS=new Set(['','teacher','prepare','relax','home','missing']);
// True only for the remembered mode 'classe', when the mode bar shows, on a tool page.
export function showDock({mode='',entry='',page=''}={}){
 return mode==='classe'&&showModeBar({entry,page})&&!NOT_TOOLS.has(page);
}

const path=h=>String(h||'').replace(/^#/,'').split(/[?]/)[0];
const seg=h=>path(h).split('/').filter(Boolean);
const within=(hash,href)=>{const a=seg(hash),b=seg(href);return b.length>0&&b.length<=a.length&&b.every((s,i)=>s===a[i]);};

// Ids of the phases the page `hash` belongs to, primary match first. `items` are the launchpad phases.
export function phasesOfHash(hash,items){
 const s=seg(hash),page=s[0],out=[],by=id=>items.find(i=>i.id===id);
 if(page==='automatismes')out.push('automatismes');
 else if(page==='bank'){
  // exercices is the primary match, correction and bilan share the same bank
  out.push('exercices','correction','bilan');
 }else if(page==='lab'){
  const act=by('activite')?.href;
  if(act&&act!=='#lab'&&within(hash,act))out.push('activite');
  out.push('outils');
 }else if(page==='slides'||page==='chapter'||page==='resources')out.push('cours');
 return out;
}

const sameStop=(a,b)=>{
 const x=seg(a),y=seg(b);
 if(!x.length||!y.length)return false;
 if(x[0]==='automatismes'&&y[0]==='automatismes')return true; // '#automatismes/go' launches, the page then shows '#automatismes'
 return x.join('/')===y.join('/');
};

// {items,prev,next,current}. items: [{id,label,href,active,disabled,why}]; prev/next: {href,label}|null;
// current: the phase id or séance block id the page is at, or null.
export function dockItems({course='',chapter='',decks=null,seance=null,currentHash=''}={}){
 const pad=launchpad({course,chapter,decks});
 const ids=phasesOfHash(currentHash,pad),primary=ids[0]||null;
 const items=pad.map(p=>({id:p.id,label:p.label,href:p.href,active:p.id===primary,disabled:!p.href,why:p.why}));
 const blocks=Array.isArray(seance?.blocks)?seance.blocks:[];
 let prev=null,next=null,current=primary;
 if(blocks.length){
  const hits=blocks.map((b,i)=>i).filter(i=>sameStop(blocks[i].href,currentHash));
  const at=hits.find(i=>ids.includes(blocks[i].phase)&&blocks[i].phase===primary)??hits.find(i=>ids.includes(blocks[i].phase))??hits[0];
  if(at===undefined)current=null;
  else{
   current=blocks[at].id;
   const mk=b=>b?{href:b.href,label:[b.title,b.title]}:null;
   prev=mk(blocks[at-1]);next=mk(blocks[at+1]);
  }
 }else if(primary){
  const at=items.findIndex(i=>i.id===primary),here=items[at].href;
  const ok=i=>!i.disabled&&!sameStop(i.href,currentHash)&&i.href!==here;
  const mk=i=>i?{href:i.href,label:i.label}:null;
  prev=mk([...items.slice(0,at)].reverse().find(ok));
  next=mk(items.slice(at+1).find(ok));
 }
 return {items,prev,next,current};
}
