// The opaque square: build a barrier of segments that every line through the square must meet, as short as you can.
// A beam of parallel light shows the lines that get through (gallery exhibit; maths in gallery-opaque-model.js).
import {exhibit,button,field,bind,palette} from './gallery-kit.js';
import {BARRIERS,length,gaps,check,lineAt} from './gallery-opaque-model.js';
const S=250,OX=195,OY=345;
export function opaqueSquare(root,opts){
  const {t,lang}=opts,num=(v,d=3)=>lang==='fr'?v.toFixed(d).replace('.',','):v.toFixed(d);
  let segs=BARRIERS.sides.segs.map(s=>s.map(p=>[...p])),preset='sides',theta=Math.PI/6,sweep=false,snap=true,sel=0,drag=null,result=check(segs),best=null,dirty=true;
  const names={sides:t('Trois côtés','Three sides'),diagonals:t('Les deux diagonales','The two diagonals'),steiner:t('Arbre de Steiner des quatre sommets','Steiner tree of the four corners'),best:t('Le plus court connu','The shortest known'),empty:t('Rien : à toi de construire','Nothing: build your own')};
  const o=exhibit(root,opts,t('Construis une barrière de segments que toute droite traversant le carré doit rencontrer. La lumière parallèle montre les droites qui passent : tourne-la. Glisse dans le vide pour tracer un segment, glisse une extrémité ou un segment pour le déplacer ; au clavier, N choisit le segment suivant, les flèches le déplacent et Suppr l’efface.','Build a barrier of segments that every line crossing the square must meet. The parallel light shows the lines that get through: turn it. Drag in empty space to draw a segment, drag an end or a segment to move it; with the keyboard, N selects the next segment, arrow keys move it and Delete removes it.'),
    `<label class="act-field exhibit-select"><span class="act-label">${t('Barrière','Barrier')}</span><select id="op-preset">${Object.entries(names).map(([k,v])=>`<option value="${k}" ${k===preset?'selected':''}>${v}</option>`).join('')}</select></label>`+
    field('op-theta',t('Direction de la lumière (°)','Direction of the light (°)'),0,179,1,30)+button('op-sweep',t('Faire tourner la lumière','Turn the light'),true)+button('op-leak',t('Trouver une fuite','Find a leak'))+button('op-delete',t('Effacer le segment choisi','Delete the selected segment'))+button('op-snap',t('Aimanter aux points remarquables','Snap to key points')),
    `<p>${t('Les quatre côtés bloquent tout (longueur 4), trois suffisent (3), les deux diagonales aussi (2√2 ≈ 2,83), l’arbre de Steiner qui relie les quatre sommets avec des angles de 120° encore mieux (1 + √3 ≈ 2,73). La barrière la plus courte connue, √2 + √6/2 ≈ 2,639, n’est pas d’un seul tenant : une demi-diagonale et l’arbre de Steiner des trois autres sommets.','The four sides block everything (length 4), three are enough (3), so are the two diagonals (2√2 ≈ 2.83), and the Steiner tree joining the four corners at 120° angles does better (1 + √3 ≈ 2.73). The shortest known barrier, √2 + √6/2 ≈ 2.639, is not in one piece: half a diagonal and the Steiner tree of the other three corners.')}</p><p>${t('Stefan Mazurkiewicz introduit ces ensembles « opaques » en 1916. Personne ne sait si 2,639 est le minimum. Une barrière ne peut pas faire moins de 2 (Jones, 1964), et en 2019 Akitoshi Kawamura, Sonoko Moriyama, Yota Otachi et János Pach ont relevé ce minorant à 2,00002 : l’écart reste grand.','Stefan Mazurkiewicz introduced these “opaque” sets in 1916. Nobody knows whether 2.639 is the minimum. A barrier cannot be shorter than 2 (Jones, 1964), and in 2019 Akitoshi Kawamura, Sonoko Moriyama, Yota Otachi and János Pach raised this lower bound to 2.00002: the gap is still wide.')}</p>`);
  const g=o.g,snapBtn=root.querySelector('#op-snap'),sweepBtn=root.querySelector('#op-sweep'),thetaIn=root.querySelector('#op-theta'),thetaOut=root.querySelector('#op-theta-out');
  const X=([x,y])=>[OX+S*x,OY-S*y],W=([px,py])=>[(px-OX)/S,(OY-py)/S];
  const KEY=[[0,0],[1,0],[1,1],[0,1],[.5,.5],[.5,0],[1,.5],[.5,1],[0,.5]];
  const snapped=p=>{if(!snap)return p;const k=KEY.find(q=>Math.hypot(q[0]-p[0],q[1]-p[1])<.04);return k?[...k]:p;};
  function changed(){result=check(segs);if(result.opaque&&segs.length&&!preset){const L=length(segs);if(!best||L<best)best=L;}dirty=true;}
  function setTheta(v){theta=v;thetaIn.value=Math.round(v*180/Math.PI)%180;thetaOut.textContent=thetaIn.value;dirty=true;}
  o.on(root.querySelector('#op-preset'),'change',e=>{preset=e.target.value;segs=BARRIERS[preset].segs.map(s=>s.map(p=>[...p]));sel=0;changed();});
  bind(root,'op-theta',v=>{theta=v*Math.PI/180;sweep=false;sweepBtn.setAttribute('aria-pressed','false');dirty=true;});
  o.on(sweepBtn,'click',()=>{sweep=!sweep;sweepBtn.setAttribute('aria-pressed',String(sweep));});sweepBtn.setAttribute('aria-pressed','false');
  o.on(root.querySelector('#op-leak'),'click',()=>{sweep=false;sweepBtn.setAttribute('aria-pressed','false');if(result.worst)setTheta(result.worst.theta);dirty=true;});
  const remove=()=>{if(segs.length){segs.splice(sel,1);sel=Math.max(0,Math.min(sel,segs.length-1));preset='';changed();}};
  o.on(root.querySelector('#op-delete'),'click',remove);
  o.on(snapBtn,'click',()=>{snap=!snap;snapBtn.setAttribute('aria-pressed',String(snap));});snapBtn.setAttribute('aria-pressed','true');
  o.on(o.cv,'pointerdown',e=>{const p=W(o.point(e)),near=.05;let hit=null;
    segs.forEach((s,i)=>s.forEach((q,k)=>{const d=Math.hypot(q[0]-p[0],q[1]-p[1]);if(d<near&&(!hit||d<hit.d))hit={d,i,k};}));
    if(hit){sel=hit.i;drag={end:hit.k};}
    else{const i=segs.findIndex(([a,b])=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy,u=l?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l)):0;return Math.hypot(p[0]-a[0]-u*dx,p[1]-a[1]-u*dy)<.025;});
      if(i>=0){sel=i;drag={move:p};}else{const q=snapped(p);segs.push([q,[...q]]);sel=segs.length-1;drag={end:1,fresh:true};}}
    preset='';o.cv.setPointerCapture?.(e.pointerId);e.preventDefault();dirty=true;});
  o.on(o.cv,'pointermove',e=>{if(!drag)return;const p=W(o.point(e)),s=segs[sel];
    if(drag.move){const d=[p[0]-drag.move[0],p[1]-drag.move[1]];s.forEach(q=>{q[0]+=d[0];q[1]+=d[1];});drag.move=p;}else s[drag.end]=snapped(p);
    changed();});
  o.on(o.cv,'pointerup',()=>{if(drag?.fresh){const [a,b]=segs[sel];if(Math.hypot(b[0]-a[0],b[1]-a[1])<.02)remove();}drag=null;changed();});o.cancelDrag=()=>{drag=null;};
  o.on(o.cv,'keydown',e=>{if(e.shiftKey)return;if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();remove();return;}
    const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1]}[e.key];if(d&&segs[sel]){e.preventDefault();segs[sel].forEach(q=>{q[0]+=d[0]*.01;q[1]+=d[1]*.01;});preset='';changed();}
    if((e.key==='n'||e.key==='N')&&segs.length){e.preventDefault();sel=(sel+1)%segs.length;dirty=true;}});
  o.animate(dt=>{
    // frame time, or real elapsed time under reduced motion (the motion runs only when asked)
    const now=performance.now(),real=dt||Math.min(.1,(now-(o.last||now))/1000);o.last=now;
    if(sweep){setTheta((theta+real*.35)%Math.PI);}
    if(!dirty)return;dirty=false;
    const C=palette(),open=gaps(segs,theta),nx=-Math.sin(theta),ny=Math.cos(theta),cs=[[0,0],[1,0],[1,1],[0,1]].map(([x,y])=>x*nx+y*ny),lo=Math.min(...cs),hi=Math.max(...cs);
    g.clearRect(0,0,o.W,o.H);g.fillStyle=C.sunken;g.fillRect(-2000,-2000,4640,4440);
    g.fillStyle=C.surface;g.strokeStyle=C.line;g.lineWidth=1.5;g.setLineDash([5,4]);g.beginPath();[[0,0],[1,0],[1,1],[0,1]].forEach((p,i)=>i?g.lineTo(...X(p)):g.moveTo(...X(p)));g.closePath();g.fill();g.stroke();g.setLineDash([]);
    // the beam: 48 parallel rays across the square, bright where they get through
    for(let k=0;k<=48;k++){const c=lo+(hi-lo)*(k+.5)/49,through=open.some(([u,v])=>c>u&&c<v),[a,b]=lineAt(theta,c,2.2);g.strokeStyle=through?C.obj2:C.muted;g.globalAlpha=through?.9:.18;g.lineWidth=through?2:1;g.beginPath();g.moveTo(...X(a));g.lineTo(...X(b));g.stroke();}
    g.globalAlpha=1;
    segs.forEach(([a,b],i)=>{g.strokeStyle=i===sel?C.accent:C.ink;g.lineWidth=i===sel?5:4;g.lineCap='round';g.beginPath();g.moveTo(...X(a));g.lineTo(...X(b));g.stroke();[a,b].forEach(p=>{g.fillStyle=i===sel?C.accent:C.ink;g.beginPath();g.arc(...X(p),5,0,2*Math.PI);g.fill();});});
    const L=length(segs),exact=BARRIERS[preset]?.exact,deg=(result.worst?result.worst.theta*180/Math.PI:0);
    o.read(`${t('Longueur :','Length:')} ${num(L)}${exact&&preset!=='empty'?` = ${exact}`:''} · ${result.opaque&&segs.length?t('Opaque : aucune droite ne traverse sans rencontrer la barrière.','Opaque: no line crosses without meeting the barrier.'):t(`Pas opaque : de la lumière passe, par exemple dans la direction ${num(deg,0)}°.`,`Not opaque: light gets through, for example in direction ${num(deg,0)}°.`)}${best?` · ${t('ta plus courte barrière opaque :','your shortest opaque barrier:')} ${num(best)}`:''} · ${t('record connu :','known record:')} ${num(Math.SQRT2+Math.sqrt(6)/2)}`);
  });
  return o.stop;
}
