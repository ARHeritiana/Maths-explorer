import {canvasIn,palette,field,bind,loopFor} from './object-kit.js';
import {makeNet} from './platonic-fold.js';
const TAU=2*Math.PI;
export function mountPlatonic(root,{t,reduced},solids,names,schlafli,angle,verdict) {
  let name='cube',fold=1,yaw=-.6,pitch=.65,drag=null,playing=false,p=4,q=3,selected=-1;
  const nets=Object.fromEntries(Object.entries(solids).map(([id,s])=>[id,makeNet(s)]));
  root.innerHTML=`<p class="act-help">${t('Ouvre le patron, puis replie les faces. Elles tournent autour de leurs arêtes sans se déformer. Glisse le fond pour tourner la vue ; touche une face pour la repérer.','Open the net, then fold the faces. Each face turns around an edge without changing shape. Drag the background to rotate; tap a face to identify it.')}</p>
  <div class="obj-stage" id="pl-stage"></div>
  <div class="act-buttons">${Object.keys(solids).map(id=>`<button type="button" class="btn btn-secondary" data-solid="${id}" aria-pressed="${id===name}">${t(...names[id])}</button>`).join('')}</div>
  <div class="act-controls">${field('pl-fold',t('Pliage : patron → solide','Fold: net → solid'),0,100,1,100)}<button class="btn btn-secondary" id="pl-open" type="button">${t('Ouvrir le patron','Open net')}</button><button class="btn btn-primary" id="pl-play" type="button">${t('Replier','Fold')}</button></div>
  <p class="act-readout" id="pl-read" aria-live="polite"></p>
  <details class="platonic-proof" open><summary>${t('Pourquoi exactement cinq solides réguliers convexes ?','Why exactly five convex regular solids?')}</summary>
    <ol class="fold-reason"><li>${t('À un sommet, au moins trois faces se rejoignent. Si chaque face a p côtés, son angle vaut α = (p − 2) × 180° / p.','At least three faces meet at a vertex. If each face has p sides, its angle is α = (p − 2) × 180° / p.')}</li>
    <li>${t('Pour former un coin convexe, la somme qα doit être strictement inférieure à 360°. À 360°, les faces restent plates ; au-delà, elles se chevauchent. Le vide angulaire permet de relever les faces.','A convex corner requires qα strictly below 360°. At 360° the faces stay flat; beyond 360° they overlap. The angle gap lets the faces lift.')}</li></ol>
    <div class="pl-why-grid"><div class="obj-stage" id="pl-fan-stage"></div><div id="pl-table"></div></div>
    <div class="act-controls">${field('pl-p',t('Côtés par face p','Sides per face p'),3,8,1,p)}${field('pl-q',t('Faces au sommet q','Faces at a vertex q'),3,7,1,q)}<button id="pl-build-case" class="btn btn-primary" type="button">${t('Former ce solide','Build this solid')}</button></div>
    <p class="act-readout" id="pl-fan-read" aria-live="polite"></p>
    <p>${t('Triangles : 3, 4 ou 5 par sommet. Carrés : 3. Pentagones : 3. Dès l’hexagone, trois angles font au moins 360° : aucun p ≥ 6 ne convient. Il reste cinq couples (p, q). Les cinq patrons ci-dessus prouvent leur existence ; la classification des polyèdres réguliers convexes les détermine à une similitude près.','Triangles: 3, 4 or 5 per vertex. Squares: 3. Pentagons: 3. From hexagons onward, three angles total at least 360°, so no p ≥ 6 works. Five pairs (p, q) remain. The five nets above establish their existence; the classification of convex regular polyhedra determines them up to similarity.')}</p></details>`;
  const o=canvasIn(root.querySelector('#pl-stage'),640/430),g=o.g,fo=canvasIn(root.querySelector('#pl-fan-stage'),1),fg=fo.g;
  const read=root.querySelector('#pl-read'),fanRead=root.querySelector('#pl-fan-read'),foldInput=root.querySelector('#pl-fold');let projected=[];
  const rot=([x,y,z])=>{const a=x*Math.cos(yaw)-y*Math.sin(yaw),b=x*Math.sin(yaw)+y*Math.cos(yaw);return[a,z*Math.cos(pitch)+b*Math.sin(pitch),b*Math.cos(pitch)-z*Math.sin(pitch)];};
  const sync=()=>{foldInput.value=Math.round(fold*100);root.querySelector('#pl-fold-out').textContent=`${Math.round(fold*100)} %`;const S=solids[name];read.textContent=`${t(...names[name])} · ${S.F} ${t('faces','faces')} · ${S.E} ${t('arêtes','edges')} · ${S.V} ${t('sommets','vertices')}. ${t('Faces par sommet','Faces at each vertex')} : ${S.q}. ${selected>=0?t('Face choisie','Selected face')+' '+(selected+1):''}`;root.querySelectorAll('[data-solid]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.solid===name)));};
  function draw(dt=0) {
    if(playing){fold=Math.min(1,fold+dt/3.5);if(fold===1)playing=false;sync();}
    const C=palette(),net=nets[name],polys=net.faces(fold),scale=Math.min(280/net.radius,175/net.radius),screen=polys.map(poly=>poly.map(v=>{const r=rot(v);return[o.W/2+scale*r[0],o.H/2-scale*r[1],r[2]];}));
    g.clearRect(0,0,o.W,o.H);g.fillStyle=C.sunken;g.fillRect(0,0,o.W,o.H);
    projected=screen.map((pts,i)=>({pts,i,depth:pts.reduce((s,p)=>s+p[2]/pts.length,0)})).sort((a,b)=>b.depth-a.depth);
    for(const {pts,i}of projected){g.beginPath();pts.forEach(([x,y],j)=>j?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.globalAlpha=i===selected?1:.85;g.fillStyle=C.c[i%8];g.fill();g.globalAlpha=1;g.lineWidth=i===selected?4:1.8;g.strokeStyle=i===selected?C.accent:C.ink;g.stroke();
      const x=pts.reduce((s,p)=>s+p[0]/pts.length,0),y=pts.reduce((s,p)=>s+p[1]/pts.length,0);g.fillStyle=C.ink;g.font='600 13px system-ui';g.textAlign='center';g.fillText(String(i+1),x,y+4);
    }
  }
  const fmt=x=>String(Math.round(x*100)/100);
  function fan() {
    const C=palette(),alpha=angle(p)*Math.PI/180,total=q*alpha,R=65,center=[fo.W/2,fo.H/2+40];
    fg.clearRect(0,0,fo.W,fo.H);fg.fillStyle=C.sunken;fg.fillRect(0,0,fo.W,fo.H);
    for(let k=0;k<q;k++){let x=0,y=0,dir=-Math.PI/2+k*alpha;fg.beginPath();fg.moveTo(...center);for(let j=0;j<p-1;j++){x+=R*Math.cos(dir);y+=R*Math.sin(dir);fg.lineTo(center[0]+x,center[1]+y);dir+=TAU/p;}fg.closePath();fg.fillStyle=k*alpha>=TAU?C.neg:C.c[k%8];fg.globalAlpha=.6;fg.fill();fg.globalAlpha=1;fg.strokeStyle=C.ink;fg.lineWidth=2;fg.stroke();}
    if(total<TAU){fg.beginPath();fg.moveTo(...center);fg.arc(...center,35,-Math.PI/2+total,TAU-Math.PI/2);fg.closePath();fg.fillStyle=C.pos;fg.globalAlpha=.5;fg.fill();fg.globalAlpha=1;}
    fg.fillStyle=C.ink;fg.textAlign='left';fg.font='600 21px system-ui';fg.fillText(`${q} × ${fmt(angle(p))}° = ${fmt(q*angle(p))}°`,18,32);
    const valid=verdict(p,q)==='solid';fanRead.textContent=valid?t(`Il reste ${fmt(360-q*angle(p))}° de vide. Clique sur « Former ce solide », puis replie le patron.`,`An angle gap of ${fmt(360-q*angle(p))}° remains. Choose “Build this solid”, then fold the net.`):verdict(p,q)==='flat'?t('360° : aucun relief. Ces faces restent dans le plan.','360°: no corner. These faces stay in the plane.'):t('Plus de 360° : les angles se chevauchent. Impossible pour un sommet convexe.','More than 360°: the angles overlap. A convex vertex is impossible.');
    root.querySelector('#pl-build-case').disabled=!valid;
    root.querySelector('#pl-table').innerHTML=`<table class="act-table pl-table"><caption>${t('Les cinq couples possibles','The five possible pairs')}</caption><thead><tr><th>p</th><th>q</th><th>${t('Solide','Solid')}</th></tr></thead><tbody>${Object.keys(solids).map(id=>`<tr><td>${schlafli[id][0]}</td><td>${schlafli[id][1]}</td><td><button type="button" class="pl-cell${schlafli[id][0]===p&&schlafli[id][1]===q?' sel':''}" data-case="${id}">${t(...names[id])}</button></td></tr>`).join('')}</tbody></table>`;
  }
  const choose=id=>{name=id;[p,q]=schlafli[id];selected=-1;playing=false;root.querySelector('#pl-p').value=p;root.querySelector('#pl-q').value=q;root.querySelector('#pl-p-out').textContent=p;root.querySelector('#pl-q-out').textContent=q;sync();fan();draw();};
  root.querySelectorAll('[data-solid]').forEach(b=>b.onclick=()=>choose(b.dataset.solid));
  root.querySelector('#pl-table').onclick=e=>{const b=e.target.closest('[data-case]');if(b)choose(b.dataset.case);};
  bind(root,'pl-fold',v=>{fold=v/100;playing=false;sync();draw();},v=>`${v} %`);
  for(const id of ['p','q'])bind(root,`pl-${id}`,value=>{if(id==='p')p=value;else q=value;fan();});
  root.querySelector('#pl-open').onclick=()=>{fold=0;playing=false;pitch=1.45;sync();draw();};
  root.querySelector('#pl-play').onclick=()=>{pitch=.65;if(reduced()){fold=1;playing=false;}else{if(fold===1)fold=0;playing=true;}sync();draw();};
  root.querySelector('#pl-build-case').onclick=()=>{const id=Object.keys(solids).find(id=>schlafli[id][0]===p&&schlafli[id][1]===q);if(id){choose(id);fold=0;playing=!reduced();if(reduced())fold=1;pitch=.65;sync();draw();o.cv.focus();}};
  const inside=(pt,poly)=>{let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>pt[1])!==(b[1]>pt[1])&&pt[0]<(b[0]-a[0])*(pt[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;};
  o.cv.addEventListener('pointerdown',e=>{if(e.button!==0)return;playing=false;drag={x:e.clientX,y:e.clientY,start:[e.clientX,e.clientY]};o.cv.setPointerCapture(e.pointerId);});
  o.cv.addEventListener('pointermove',e=>{if(!drag)return;yaw+=(e.clientX-drag.x)*.01;pitch=Math.max(.12,Math.min(1.45,pitch+(e.clientY-drag.y)*.008));drag={...drag,x:e.clientX,y:e.clientY};draw();});
  o.cv.addEventListener('pointerup',e=>{if(drag&&Math.hypot(e.clientX-drag.start[0],e.clientY-drag.start[1])<5){const at=o.point(e);selected=[...projected].reverse().find(f=>inside(at,f.pts))?.i??-1;sync();draw();}drag=null;});
  for(const ev of ['pointercancel','view-gesture','lostpointercapture'])o.cv.addEventListener(ev,()=>drag=null);
  o.cv.addEventListener('keydown',e=>{const d={ArrowLeft:[-.1,0],ArrowRight:[.1,0],ArrowUp:[0,.08],ArrowDown:[0,-.08]}[e.key];if(d){e.preventDefault();yaw+=d[0];pitch=Math.max(.12,Math.min(1.45,pitch+d[1]));draw();}});
  o.cv.setAttribute('aria-label',t('Solide et patron 3D. Flèches pour tourner ; plus et moins pour zoomer.','3D solid and net. Arrow keys rotate; plus and minus zoom.'));o.cv.style.cursor='grab';
  o.redraw=()=>draw();fo.redraw=fan;sync();fan();draw();const stop=loopFor(dt=>{if(playing)draw(dt);},reduced);
  return()=>{stop();o.navigation?.destroy();fo.navigation?.destroy();};
}
