// Give identical cookies to distinct children directly. Cookie identities exist only for DOM continuity, never for counting.
import { onHintAction } from '../common/kit.js';
import { code, NAMES } from './maths.js';

const cookieArt = '<svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="17" fill="#d99a51" stroke="#714018" stroke-width="2"/><g fill="#694025"><circle cx="16" cy="15" r="2.7"/><circle cx="28" cy="17" r="2.7"/><circle cx="22" cy="27" r="2.7"/><circle cx="13" cy="27" r="2"/><circle cx="31" cy="29" r="2"/></g></svg>';
function childArt(i){
  const skins=['#af7048','#e2aa77','#865132','#c68b5a','#f1c18e','#9a6241'],shirts=['#28749b','#b34260','#5a8040','#8154a5','#bd641e','#357a74'];
  const hair=[
    '<path d="M18 27 Q16 5 35 8 Q55 5 54 28 L48 18 Q34 25 23 18Z"/>',
    '<path d="M18 29 Q12 4 35 6 Q58 5 53 33 L47 24 L47 16 L23 16 L23 30Z"/><circle cx="15" cy="24" r="7"/><circle cx="56" cy="24" r="7"/>',
    '<path d="M17 24 Q15 3 36 6 Q56 5 54 25 L46 17 L40 22 L30 17 L21 25Z"/>',
    '<path d="M17 27 Q13 4 35 4 Q59 4 55 30 L48 20 Q37 17 22 20Z"/><circle cx="35" cy="5" r="6"/>',
    '<path d="M18 25 Q16 4 35 7 Q54 6 54 24 L45 16 L38 21 L30 17 L23 26Z"/>',
    '<path d="M17 30 Q12 4 35 6 Q59 5 55 33 L48 25 L48 18 L22 18 L22 31Z"/>',
  ];
  const trousers=['#344258','#4a3b5c','#3b4f3f','#5b4636','#2f4a5e','#4d3d3d'][i],skin=skins[i],shirt=shirts[i];
  // a whole child: two legs ending in shoes that point outwards, a torso, two arms with hands, a head
  return `<svg viewBox="0 0 72 92" aria-hidden="true"><path d="M28 64 V80 M44 64 V80" stroke="${trousers}" stroke-width="9" stroke-linecap="round"/><path d="M19 84.5 Q19 79.5 26 79.5 L31 79.5 Q33 85.5 29 87 L21 87 Q19 86 19 84.5Z M53 84.5 Q53 79.5 46 79.5 L41 79.5 Q39 85.5 43 87 L51 87 Q53 86 53 84.5Z" fill="#2a2230"/><path d="M19 48 Q9 56 10 67" fill="none" stroke="${shirt}" stroke-width="8.5" stroke-linecap="round"/><circle cx="10" cy="69.5" r="4.4" fill="${skin}"/><path d="M53 48 Q63 56 62 67" fill="none" stroke="${shirt}" stroke-width="8.5" stroke-linecap="round"/><circle cx="62" cy="69.5" r="4.4" fill="${skin}"/><path d="M17 66 Q17 44 36 44 Q55 44 55 66 Q55 70 50 70 L22 70 Q17 70 17 66Z" fill="${shirt}"/><circle cx="36" cy="27" r="18" fill="${skin}"/><g fill="#302322" transform="translate(1 0)">${hair[i]}</g><g fill="#201c1b"><circle cx="30" cy="28" r="1.9"/><circle cx="43" cy="28" r="1.9"/></g><g fill="#e98a78" opacity=".45"><circle cx="26" cy="34" r="3"/><circle cx="47" cy="34" r="3"/></g><path d="M30 36 Q36.5 41.5 43 35.5" fill="none" stroke="#743b2c" stroke-width="1.7" stroke-linecap="round"/>${i===2?'<g fill="none" stroke="#26394c" stroke-width="1.5"><circle cx="30" cy="28" r="5"/><circle cx="43" cy="28" r="5"/><path d="M35 28 H38"/></g>':''}${i===4?'<path d="M25 53 H48 M25 59 H48" stroke="#fff" stroke-width="3"/>':''}</svg>`;
}
export function activity(root,{t,q}){
  const n=q.n,k=q.k,min=q.rule==='one'?1:0,abort=new root.ownerDocument.defaultView.AbortController();
  const on=(el,type,fn,options={})=>el.addEventListener(type,fn,{...options,signal:abort.signal});
  let owners=Array(n).fill(-1),found=new Set(),level=0,notice='',selected=null,drag=null,ghost=null,suppressClick=false;
  root.innerHTML=`<p class="act-help">${t('Glisse les biscuits vers les enfants. Tu peux les déplacer d’un enfant à l’autre ou les remettre dans la réserve. Ou touche un biscuit, puis un enfant. Au clavier : Entrée pour choisir, Tab puis Entrée pour donner, Échap pour annuler.','Drag cookies to the children. Move them between children or return them to the tray. Or tap a cookie, then a child. Keyboard: Enter to select, Tab then Enter to give, Escape to cancel.')}</p>
    <div class="ck-sharing" role="group" aria-label="${t('Partager les biscuits','Share the cookies')}">
      <section class="ck-tray" data-cookie-destination="-1"><button type="button" class="ck-return btn-quiet">${t('Réserve','Tray')}</button><div class="ck-pile" data-pile="-1"></div></section>
      <div class="ck-children">${Array.from({length:k},(_,i)=>`<section class="ck-recipient" data-cookie-destination="${i}"><button type="button" class="ck-child" data-child="${i}">${childArt(i)}<span>${NAMES[i]} · <output data-count="${i}">0</output></span></button><div class="ck-pile" data-pile="${i}"></div></section>`).join('')}</div>
    </div><p class="act-readout ck-code" id="ck-code" aria-live="polite" hidden></p>
    <div class="act-controls"><button class="secondary" id="ck-note" type="button">${t('Noter ce partage','Note this sharing')}</button><button class="btn-quiet" id="ck-reset" type="button">${t('Recommencer','Restart')}</button></div>
    <p class="act-readout" id="ck-read" role="status" aria-live="polite"></p>`;
  const stage=root.querySelector('.ck-sharing'),tray=root.querySelector('[data-pile="-1"]'),read=root.querySelector('#ck-read'),codeEl=root.querySelector('#ck-code'),note=root.querySelector('#ck-note');
  const piles=Array.from({length:k},(_,i)=>root.querySelector(`[data-pile="${i}"]`));
  const cookies=Array.from({length:n},(_,i)=>{const b=document.createElement('button');b.type='button';b.className='ck-cookie';b.dataset.cookie=i;b.innerHTML=cookieArt;tray.append(b);return b;});
  function paint(){
    const parts=Array.from({length:k},(_,i)=>owners.filter(x=>x===i).length),left=owners.filter(x=>x===-1).length;
    cookies.forEach((b,i)=>{const parent=owners[i]===-1?tray:piles[owners[i]];if(b.parentNode!==parent)parent.append(b);b.setAttribute('aria-label',t('Biscuit dans ','Cookie in ')+(owners[i]===-1?t('la réserve','the tray'):NAMES[owners[i]]));b.setAttribute('aria-pressed',String(selected===i));});
    parts.forEach((p,i)=>{root.querySelector(`[data-count="${i}"]`).textContent=p;root.querySelector(`[data-child="${i}"]`).setAttribute('aria-label',`${NAMES[i]} : ${p} ${t('biscuits. Donner le biscuit choisi.','cookies. Give the selected cookie.')}`);});
    stage.dataset.parts=parts.join(',');stage.dataset.left=left;
    const row=code(parts);codeEl.hidden=level<1;
    if(level)codeEl.innerHTML=level>=2?`<span class="ck-row">${[...row].map((c,i)=>`<span><small>${i+1}</small>${c}</span>`).join('')}</span>`:`<span class="ck-row">${row||'·'}</span>`;
    const full=left===0,ok=full&&parts.every(p=>p>=min);note.disabled=!ok;
    read.textContent=`${t('Biscuits encore à donner : ','Cookies still to give: ')}${left} · ${t('partages différents notés : ','different sharings noted: ')}${found.size}${selected===null?'':` · ${t('Biscuit choisi : touche un enfant ou la réserve.','Cookie selected: tap a child or the tray.')}`}${notice?' · '+notice:''}${full&&!ok?' · '+t('chacun doit en recevoir au moins un','everyone must get at least one'):''}`;
  }
  function give(destination){if(selected===null)return;const i=selected;owners[i]=destination;selected=null;notice='';paint();cookies[i].focus({preventScroll:true});}
  function clearDrag(){if(drag)cookies[drag.id].style.visibility='';ghost?.remove();ghost=null;drag=null;}
  function cancel(){clearDrag();selected=null;paint();}
  function destinationAt(x,y){const el=document.elementFromPoint?.(x,y),zone=el?.closest?.('[data-cookie-destination]');if(zone&&stage.contains(zone))return Number(zone.dataset.cookieDestination);return null;}
  on(stage,'pointerdown',e=>{if(drag&&e.pointerId!==drag.pointer){cancel();return;}const b=e.target.closest?.('[data-cookie]');if(!b||e.button!==0)return;if(drag){cancel();return;}suppressClick=false;b.focus({preventScroll:true});drag={id:Number(b.dataset.cookie),pointer:e.pointerId,x:e.clientX,y:e.clientY,moved:false};stage.setPointerCapture?.(e.pointerId);e.preventDefault();});
  on(stage,'pointermove',e=>{if(!drag||e.pointerId!==drag.pointer)return;if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>6){drag.moved=true;ghost=cookies[drag.id].cloneNode(true);ghost.removeAttribute('data-cookie');ghost.tabIndex=-1;ghost.setAttribute('aria-hidden','true');ghost.classList.add('ck-cookie-ghost');document.body.append(ghost);cookies[drag.id].style.visibility='hidden';}if(ghost){ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';}e.preventDefault();});
  on(stage,'pointerup',e=>{if(!drag||e.pointerId!==drag.pointer)return;const {id,moved}=drag,destination=moved?destinationAt(e.clientX,e.clientY):null;clearDrag();suppressClick=true;if(moved){if(destination!==null){selected=id;give(destination);}else{selected=null;paint();}}else{selected=selected===id?null:id;paint();}e.preventDefault();});
  on(stage,'pointercancel',cancel);on(stage,'lostpointercapture',()=>{if(drag)cancel();});
  on(stage,'click',e=>{const cookie=e.target.closest?.('[data-cookie]');if(cookie){if(suppressClick&&e.detail!==0){suppressClick=false;return;}const id=Number(cookie.dataset.cookie);selected=selected===id?null:id;paint();return;}suppressClick=false;const child=e.target.closest?.('[data-child]');if(child)give(Number(child.dataset.child));else if(e.target.closest?.('.ck-return'))give(-1);});
  on(stage,'keydown',e=>{if(e.key==='Escape'){e.preventDefault();cancel();}else if((e.key==='Delete'||e.key==='Backspace')&&selected!==null){e.preventDefault();give(-1);}});
  on(note,'click',()=>{const parts=stage.dataset.parts,key=parts;notice=found.has(key)?t('déjà noté','already noted'):t('partage noté','sharing noted');found.add(key);paint();});
  on(root.querySelector('#ck-reset'),'click',()=>{clearDrag();owners=Array(n).fill(-1);found=new Set();selected=null;notice='';paint();});
  const off=onHintAction('cookies',{code:()=>{level=Math.max(level,1);paint();},places:()=>{level=2;paint();}});
  paint();return()=>{clearDrag();off();abort.abort();};
}
