// In-class dock: a slim bar fixed to the bottom of tool pages while the remembered mode is En classe. Loaded on demand
// by app.js only for a device in that mode, so students never download it. It hides in every full-screen projection
// (browser full screen, the automatismes stage, the CSS full-window fallback); the slide player is a separate document
// that never loads this module. Collapsed or expanded is remembered in the teacher tools key `dockCollapsed`.
import {fetchJSON} from './data-loader.js';
import {showDock,dockItems} from './dock-model.js';

const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let decks;                       // undefined: not asked yet, null: unreadable, array: the slides index
let asked=false;

export function mountDock({state,pair,getPage}){
 const el=document.createElement('nav');
 el.id='mx-dock';el.className='dock';
 document.body.append(el);
 let page='';
 const collapsed=()=>state.getTools().dockCollapsed===true;
 const hidden=()=>!!document.fullscreenElement||document.documentElement.classList.contains('is-presenting')||!!document.querySelector('.presenting');
 function draw(){
  const on=showDock({mode:state.getMode(),entry:state.getEntry(),page});
  document.documentElement.classList.toggle('has-dock',on);
  el.hidden=!on;
  if(!on){el.innerHTML='';return;}
  const {course,chapter}=state.getClassroom();
  const m=dockItems({course,chapter,decks:decks??null,seance:state.getSeance(),currentHash:location.hash});
  const L=p=>esc(pair(p[0],p[1]));
  const label=pair('En classe','In class');
  if(collapsed()){
   el.className='dock is-collapsed';
   el.setAttribute('aria-label',pair('Barre En classe','In-class bar'));
   el.innerHTML=`<button type="button" class="dock-tab" data-dock-toggle aria-expanded="false" aria-controls="mx-dock">${esc(label)} <span aria-hidden="true">▴</span></button>`;
  }else{
   el.className='dock';
   el.setAttribute('aria-label',pair('Barre En classe','In-class bar'));
   const link=i=>i.disabled
    ?`<span class="dock-link is-disabled" data-dock-phase="${i.id}" aria-disabled="true" title="${esc(i.why?pair(i.why[0],i.why[1]):'')}">${L(i.label)}</span>`
    :`<a class="dock-link" data-dock-phase="${i.id}" href="${esc(i.href)}"${i.active?' aria-current="page"':''}>${L(i.label)}</a>`;
   const step=(s,cls,sym,fr,en)=>s?`<a class="dock-step ${cls}" data-dock-${cls}="1" href="${esc(s.href)}" aria-label="${esc(pair(fr,en))} : ${L(s.label)}" title="${L(s.label)}"><span aria-hidden="true">${sym}</span></a>`:'';
   el.innerHTML=`<a class="dock-back" href="#teacher" data-teacher-mode="classe">${esc(label)}</a>${step(m.prev,'prev','‹','Précédent','Previous')}<ul class="dock-list">${m.items.map(i=>`<li>${link(i)}</li>`).join('')}</ul>${step(m.next,'next','›','Suivant','Next')}<button type="button" class="dock-fold" data-dock-toggle aria-expanded="true" aria-controls="mx-dock" aria-label="${esc(pair('Réduire la barre','Collapse the bar'))}"><span aria-hidden="true">▾</span></button>`;
   el.querySelector('[aria-current="page"]')?.scrollIntoView?.({block:'nearest',inline:'center'});
  }
  syncHidden();
 }
 function syncHidden(){el.classList.toggle('is-projecting',hidden());}
 el.addEventListener('click',e=>{
  if(e.target.closest('[data-dock-toggle]')){state.setTools({dockCollapsed:!collapsed()});draw();el.querySelector('[data-dock-toggle]')?.focus();}
 });
 const refresh=()=>{page=getPage();draw();};
 addEventListener('hashchange',refresh);
 addEventListener('mx-teacher-change',refresh);
 document.addEventListener('fullscreenchange',syncHidden);
 new MutationObserver(syncHidden).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 // the slides index tells which chapters have a deck; read once, the dock redraws when it arrives
 async function load(){
  if(asked)return;asked=true;
  decks=await fetchJSON('./slides/data/index.json').catch(()=>null);
  draw();
 }
 return {update(p){page=p;draw();if(el.hidden===false)load();}};
}
