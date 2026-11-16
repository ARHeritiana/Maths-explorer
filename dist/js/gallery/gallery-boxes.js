// The hundred boxes problem (gallery exhibit; maths in gallery-boxes-model.js). Open boxes yourself as one prisoner, then let all the
// prisoners play with two strategies and look at the permutation as cycles. The boxes are real buttons (keyboard, touch, scrolling).
import {exhibit,button,field,bind,palette,TAU} from './gallery-kit.js';
import {rng,randomPermutation,cycles,cycleSearch,randomSearch,runAll,simulate,cycleWinProbability,randomWinProbability} from './gallery-boxes-model.js';
const COLS={10:5,20:10,50:10,100:10};
export function hundredBoxes(root,opts){
  const {t,lang}=opts,pct=(v,d=2)=>(100*v).toFixed(d).replace('.',lang==='fr'?',':'.')+' %';
  let n=10,seed=1,perm,me=0,opened=[],found=false,view='boxes',note='',cyc=[];
  const limit=()=>n/2;
  const o=exhibit(root,opts,t('Des prisonniers numérotés, autant de boîtes fermées qui cachent les numéros dans un ordre inconnu. Chacun peut ouvrir la moitié des boîtes, seul, et doit trouver son propre numéro ; ils gagnent seulement si tous réussissent. Joue un prisonnier, puis compare ce que donnent deux manières de chercher.','Numbered prisoners, as many closed boxes hiding the numbers in an unknown order. Each may open half of the boxes, alone, and must find his own number; they win only if all succeed. Play one prisoner, then compare two ways of searching.'),
    `<label class="act-field exhibit-select"><span class="act-label">${t('Nombre de prisonniers','Number of prisoners')}</span><select id="hb-n">${[10,20,50,100].map(v=>`<option value="${v}">${v}</option>`).join('')}</select></label>`+
    field('hb-me',t('Prisonnier numéro','Prisoner number'),1,10,1,1)+
    `<label class="act-field exhibit-select"><span class="act-label">${t('Affichage','View')}</span><select id="hb-view"><option value="boxes">${t('Les boîtes','The boxes')}</option><option value="cycles">${t('Les cycles de la permutation','The cycles of the permutation')}</option></select></label>`+
    button('hb-new',t('Nouvelle permutation','New permutation'),true)+button('hb-again',t('Recommencer ce prisonnier','Restart this prisoner'))+button('hb-rand',t('Tous : au hasard','All: at random'))+button('hb-follow',t('Tous : en suivant les numéros','All: following the numbers'))+button('hb-1000',t('1 000 parties de chaque','1,000 games of each')),
    `<p>${t('Une simulation donne une fréquence, pas une preuve : elle peut confirmer le calcul exact, jamais le remplacer.','A simulation gives a frequency, not a proof: it can confirm the exact computation, never replace it.')}</p>`);
  const g=o.g,$=s=>root.querySelector(s);
  const grid=root.ownerDocument.createElement('div');grid.className='hb-grid';grid.setAttribute('role','group');
  root.insertBefore(grid,$('.exhibit-stage'));
  function newGame(keepSeed){if(!keepSeed)seed++;perm=randomPermutation(n,rng(seed*7919+n));cyc=cycles(perm);reset();}
  function reset(){opened=[];found=false;note='';buildGrid();status();o.redraw();}
  function buildGrid(){
    grid.style.setProperty('--cols',COLS[n]);grid.setAttribute('aria-label',t('Les boîtes fermées','The closed boxes'));
    grid.innerHTML=Array.from({length:n},(_,k)=>{const idx=opened.indexOf(k),open=idx>=0;
      return `<button type="button" class="hb-box${open?' hb-open':''}${open&&perm[k]===me?' hb-hit':''}" data-k="${k}" aria-label="${t('Boîte','Box')} ${k+1}${open?`, ${t('contient','contains')} ${perm[k]+1}`:`, ${t('fermée','closed')}`}"${open||found||opened.length>=limit()?' aria-disabled="true"':''}><span class="hb-lid">${k+1}</span>${open?`<span class="hb-num">${perm[k]+1}</span>`:''}</button>`;}).join('');
  }
  function status(){const left=limit()-opened.length;
    o.read(`${t('Prisonnier','Prisoner')} ${me+1} : ${opened.length} ${t('boîte(s) ouverte(s) sur','box(es) opened out of')} ${limit()}${found?` · ${t('tu as trouvé ton numéro','you found your number')} !`:left<=0?` · ${t('numéro non trouvé : échec','number not found: failure')}`:''}${note?' · '+note:''}`);}
  o.on(grid,'click',e=>{const b=e.target.closest('.hb-box');if(!b)return;const k=Number(b.dataset.k);if(found||opened.includes(k)||opened.length>=limit())return;opened.push(k);if(perm[k]===me)found=true;
    buildGrid();status();grid.querySelector(`[data-k="${k}"]`)?.focus({preventScroll:true});});
  o.on($('#hb-n'),'change',e=>{n=Number(e.target.value);me=Math.min(me,n-1);const m=$('#hb-me');m.max=n;m.value=me+1;$('#hb-me-out').textContent=me+1;newGame(true);});
  bind(root,'hb-me',v=>{me=v-1;reset();});$('#hb-me').max=n;
  o.on($('#hb-view'),'change',e=>{view=e.target.value;grid.hidden=view!=='boxes';$('.exhibit-stage').hidden=view!=='cycles';o.redraw();});
  o.on($('#hb-new'),'click',()=>newGame(false));o.on($('#hb-again'),'click',reset);
  const all=s=>{const r=rng(seed*31+(s==='cycle'?1:2));const res=runAll(perm,s,r);note=`${s==='cycle'?t('En suivant les numéros','Following the numbers'):t('Au hasard','At random')} : ${res.ok} ${t('prisonniers sur','prisoners out of')} ${n} ${t('trouvent leur numéro','find their number')} ${res.win?t('(tous : victoire)','(all: victory)'):t('(pas tous : défaite)','(not all: defeat)')}`;status();o.redraw();};
  o.on($('#hb-rand'),'click',()=>all('random'));o.on($('#hb-follow'),'click',()=>all('cycle'));
  o.on($('#hb-1000'),'click',()=>{const w1=simulate(n,'cycle',1000,seed+11),w2=simulate(n,'random',1000,seed+12);
    note=`${t('1 000 parties','1,000 games')} : ${t('en suivant les numéros','following the numbers')} ${w1} ${t('victoires','wins')} (${pct(w1/1000,1)}) · ${t('au hasard','at random')} ${w2} · ${t('calcul exact','exact value')} ${pct(cycleWinProbability(n))} ${t('et','and')} ${pct(randomWinProbability(n),n>20?0:4)}`;status();});
  o.onResize=()=>o.redraw();
  o.animate(()=>{
    if(view!=='cycles')return false;
    const C=palette();g.clearRect(0,0,o.W,o.H);g.fillStyle=C.sunken;g.fillRect(-2000,-2000,4640,4440);
    const cx=190,cy=220,R=170,P=k=>[cx+R*Math.cos(-Math.PI/2+k/n*TAU),cy+R*Math.sin(-Math.PI/2+k/n*TAU)];
    const longest=cyc.reduce((m,c)=>Math.max(m,c.length),0);
    cyc.forEach((c,i)=>{const col=C.c[i%C.c.length];g.strokeStyle=col;g.lineWidth=c.length===longest?3:1.6;g.globalAlpha=.85;
      c.forEach((k,j)=>{const a=P(k),b=P(c[(j+1)%c.length]);if(c.length===1){g.beginPath();g.arc(a[0],a[1],5,0,TAU);g.stroke();return;}g.beginPath();g.moveTo(...a);g.lineTo(...b);g.stroke();});});
    g.globalAlpha=1;for(let k=0;k<n;k++){const p=P(k);g.fillStyle=k===me?C.neg:C.ink;g.beginPath();g.arc(p[0],p[1],k===me?5.5:n>50?2.2:3.4,0,TAU);g.fill();}
    g.textAlign='left';g.fillStyle=C.ink;g.font='bold 15px system-ui';g.fillText(t('Cycles de la permutation','Cycles of the permutation'),390,60);
    g.font='14px system-ui';g.fillStyle=C.muted;
    const lines=[`${t('Nombre de cycles','Number of cycles')} : ${cyc.length}`,`${t('Cycle le plus long','Longest cycle')} : ${longest}`,`${t('Boîtes ouvrables par chacun','Boxes each may open')} : ${limit()}`,longest<=limit()?t('Aucun cycle ne dépasse ce nombre.','No cycle exceeds this number.'):t('Un cycle dépasse ce nombre.','A cycle exceeds this number.'),
      `${t('Prisonnier','Prisoner')} ${me+1} : ${t('son cycle compte','his cycle has')} ${(cyc.find(c=>c.includes(me))||[]).length} ${t('boîtes','boxes')}`];
    lines.forEach((s,i)=>g.fillText(s,390,92+i*26));
    g.fillStyle=longest<=limit()?C.pos:C.neg;g.font='bold 15px system-ui';g.fillText(longest<=limit()?t('Cette permutation fait gagner les prisonniers qui suivent les numéros.','This permutation lets the number-following prisoners win.'):t('Cette permutation les fait perdre.','This permutation makes them lose.'),390,240,240);
    return false;});
  grid.hidden=false;$('.exhibit-stage').hidden=true;
  newGame(true);
  return ()=>{o.stop();grid.remove();};
}
