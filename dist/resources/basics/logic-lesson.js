/* Shared engine of the four logic lessons (logic-*.html and logic-*.en.html): tabs, text filling, a Venn diagram of two
   propositions, a guided-challenge runner and the height message to the host page. No language lives here: every sentence
   comes from the T table of the lesson. */
'use strict';
const LX=(()=>{
const $=id=>document.getElementById(id);
const fmt=(s,...a)=>String(s).replace(/\{(\d+)\}/g,(m,i)=>a[+i]);
let TT=null;
const vf=b=>TT.vf[b?1:0];
const shuffle=a=>{const r=[...a];for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r;};
const pickOne=a=>a[Math.floor(Math.random()*a.length)];
// Keep keyboard focus on the same control after part of the page is redrawn.
function keepFocus(fn){
 const a=document.activeElement;let sel=null,root=null;
 if(a&&a!==document.body){root=a.closest('[id]');const attrs=[...a.attributes].filter(x=>x.name.startsWith('data-')).map(x=>`[${x.name}="${x.value}"]`).join('');if(root&&attrs)sel=attrs;}
 fn();
 if(sel&&root){const r=document.getElementById(root.id),t=r&&r.querySelector(sel);if(t&&!t.disabled)t.focus({preventScroll:true});}
}
function tabs(ids){
 const show=(id,focus)=>{ids.forEach(t=>{const b=$('tab-'+t),on=t===id;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;$('panel-'+t).hidden=!on;});if(focus)$('tab-'+id).focus();};
 ids.forEach((id,i)=>{
  const b=$('tab-'+id);
  b.addEventListener('click',()=>show(id,false));
  b.addEventListener('keydown',e=>{let j=null;
   if(e.key==='ArrowRight')j=(i+1)%ids.length;else if(e.key==='ArrowLeft')j=(i+ids.length-1)%ids.length;else if(e.key==='Home')j=0;else if(e.key==='End')j=ids.length-1;
   if(j===null)return;e.preventDefault();show(ids[j],true);});
 });
 show(ids[0],false);
 return show;
}
function notifySize(){try{parent.postMessage({type:'mx-basics-size',height:document.documentElement.scrollHeight},location.origin)}catch{}}
function init(T,tabIds){
 TT=T;
 document.querySelectorAll('[data-i]').forEach(e=>{e.innerHTML=T.ui[e.dataset.i];});
 document.querySelectorAll('[data-ia]').forEach(e=>{e.setAttribute('aria-label',T.ia[e.dataset.ia]);});
 const show=tabs(tabIds);
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(notifySize).observe(document.body);
 window.addEventListener('load',notifySize);
 document.fonts?.ready.then(notifySize);
 return show;
}
// ---- Venn diagram of two propositions P and Q over a finite universe (regions "10" = P only, "01" = Q only, "11", "00").
let vc=0;
const regionOf=(p,q)=>String(+!!p)+String(+!!q);
function venn2(o){
 const id='vn'+(++vc),C=[[205,140,100],[315,140,100]],names=o.names||['P','Q'],all=['10','01','11','00'],sel=o.sel||new Set();
 const masks=all.map(b=>`<mask id="${id}-m${b}" maskUnits="userSpaceOnUse" x="0" y="0" width="520" height="330"><rect width="520" height="330" fill="white"/>${[...b].map((v,i)=>v==='0'?`<circle cx="${C[i][0]}" cy="${C[i][1]}" r="${C[i][2]}" fill="black"/>`:'').join('')}</mask>`).join('');
 const clips=C.map((c,i)=>`<clipPath id="${id}-c${i}"><circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}"/></clipPath>`).join('');
 const regions=all.map(b=>{
  const on=sel.has(b),exp=o.expected,chk=!!(exp&&o.checked),wrong=chk&&on&&!exp.has(b),missed=chk&&!on&&exp.has(b);
  const colour=wrong?'var(--bad)':missed?'var(--ok)':'var(--vs)',opacity=on?'.5':missed?'.4':'0';
  const open=[...b].map((v,i)=>v==='1'?`<g clip-path="url(#${id}-c${i})">`:'').join(''),close='</g>'.repeat([...b].filter(v=>v==='1').length);
  const rect=`<rect class="rg${on?' on':''}" x="10" y="10" width="500" height="310" style="fill:${colour}" opacity="${opacity}" mask="url(#${id}-m${b})"${o.clickable?' pointer-events="visiblePainted"':''}/>`;
  return `<g${o.clickable?` data-region="${b}" role="button" tabindex="0" aria-pressed="${on}" aria-label="${o.regionLabel?o.regionLabel(b):b}"`:''}>${open}${rect}${close}</g>`;
 }).join('');
 const outlines=C.map((c,i)=>`<circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}" style="stroke:var(${i?'--vb':'--va'});fill:none;stroke-width:2.8"/>`).join('');
 const labels=[[130,50],[390,50]].map((p,i)=>`<text class="vlab" x="${p[0]}" y="${p[1]}" text-anchor="middle" style="fill:var(${i?'--vb':'--va'})">${names[i]}</text>`).join('');
 const spot={'10':[158,140,3],'01':[362,140,3],'11':[260,140,2],'00':[260,268,9]};
 const items=o.items?all.map(b=>{
  const v=o.items[b]||[];if(!v.length)return '';
  const [x,y,per]=spot[b],lines=[];for(let k=0;k<v.length;k+=per)lines.push(v.slice(k,k+per));
  const y0=y-(lines.length-1)*10;
  return `<text class="vel" x="${x}" y="${y0}" pointer-events="none" text-anchor="middle">${lines.map((l,k)=>`<tspan x="${x}" dy="${k?21:0}">${l.map(n=>n===o.ring?`<tspan class="hl">${n}</tspan>`:n).join(' ')}</tspan>`).join('')}</text>`;
 }).join(''):'';
 return `<svg viewBox="0 0 520 330" xmlns="http://www.w3.org/2000/svg" role="${o.clickable?'group':'img'}" aria-label="${o.aria||''}"><defs>${clips}${masks}</defs><rect class="vframe" x="10" y="10" width="500" height="310" rx="12"/><text class="vu" x="22" y="32">U</text>${regions}${outlines}${labels}${items}</svg>`;
}
// ---- Guided challenges. An item is {why, hint, reveal?, render(body, api)}; api.answer(ok, extra) reports one attempt.
function choice(o){
 const order=shuffle(o.opts.map((t,i)=>({t,ok:i===o.correct})));
 return {why:o.why,hint:o.hint,render(body,api){
  body.innerHTML=`<p>${o.q}</p><div class="answers" role="group" aria-label="${TT.q.group}">${order.map((x,i)=>`<button type="button" class="answer" data-k="${i}"><span class="ltr">${'ABCDEF'[i]}</span><span>${x.t}</span></button>`).join('')}</div>`;
  body.addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(!b||b.disabled)return;const x=order[+b.dataset.k];
   b.classList.add(x.ok?'correct':'wrong');
   b.disabled=true;
   if(x.ok)body.querySelectorAll('[data-k]').forEach(c=>{c.disabled=true;});
   api.answer(x.ok);});
 }};
}
function quiz(hostId,make,onDraw){
 const host=$(hostId),Q=TT.q;let items,i,score,results;
 const start=()=>{items=make();i=0;score=0;results=[];draw(false);};
 function draw(focus){
  if(i>=items.length)return finish();
  const it=items[i];let tries=0,done=false;
  host.innerHTML=`<h3 id="${hostId}-h" tabindex="-1">${fmt(Q.step,i+1,items.length)}</h3><div class="bar" aria-hidden="true"><i style="width:${Math.round(i/items.length*100)}%"></i></div><div class="qbody"></div><div class="fbox" aria-live="polite"></div><div class="row act"></div>`;
  const body=host.querySelector('.qbody'),fbox=host.querySelector('.fbox'),act=host.querySelector('.act');
  const next=()=>{const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=i+1<items.length?Q.next:Q.last;b.onclick=()=>{i++;draw(true);};act.appendChild(b);b.focus({preventScroll:true});};
  const api={answer(ok,extra=''){
   if(done)return;tries++;
   if(ok){done=true;if(tries===1)score++;results.push(tries===1);fbox.innerHTML=`<div class="fb good"><strong>${Q.good}</strong> ${extra}${it.why||''}</div>`;act.innerHTML='';next();}
   else{fbox.innerHTML=`<div class="fb bad"><strong>${Q.bad}</strong> ${extra}${it.hint||''}</div>`;
    if(it.reveal&&!act.querySelector('.rv')){const b=document.createElement('button');b.type='button';b.className='btn alt rv';b.textContent=Q.solution;b.onclick=()=>{done=true;results.push(false);it.reveal();fbox.innerHTML=`<div class="fb"><strong>${Q.solutionShown}</strong> ${it.why||''}</div>`;act.innerHTML='';next();};act.appendChild(b);}
   }
  }
  };
  it.render(body,api);
  if(focus)$(hostId+'-h').focus({preventScroll:true});
  if(onDraw)onDraw(i);
 }
 function finish(){
  host.innerHTML=`<h3 id="${hostId}-h" tabindex="-1">${Q.title}</h3><div class="bar" aria-hidden="true"><i style="width:100%"></i></div><p>${fmt(Q.result,score,items.length)}</p><div class="row"><button type="button" class="btn" id="${hostId}-again">${Q.again}</button></div>`;
  $(hostId+'-again').onclick=()=>{start();$(hostId+'-h').focus({preventScroll:true});};
  $(hostId+'-h').focus({preventScroll:true});
 }
 start();
 return {restart:start,score:()=>score,count:()=>items.length};
}
return {$,fmt,vf,shuffle,pickOne,keepFocus,tabs,init,venn2,regionOf,choice,quiz,notifySize};
})();
