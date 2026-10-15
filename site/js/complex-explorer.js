import {canvasIn,palette,field,bind} from './object-kit.js';
export const multiply=(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]];
export function complexMap(mode,z,a=[0,1]) {
  if(mode==='translate')return[z[0]+a[0],z[1]+a[1]];
  if(mode==='multiply')return multiply(a,z);
  if(mode==='square')return multiply(z,z);
  if(mode==='conjugate')return[z[0],-z[1]];
  const n=z[0]**2+z[1]**2;return n<1e-12?null:[z[0]/n,-z[1]/n];
}
export function complexDerivative(mode,z,a=[0,1]) {
  if(mode==='translate')return[1,0];if(mode==='multiply')return a;if(mode==='square')return[2*z[0],2*z[1]];
  if(mode==='conjugate')return null;const inv=complexMap('inverse',multiply(z,z));return inv?inv.map(x=>-x):null;
}
export function complexInverse(mode,w,a,near) {
  if(mode==='translate')return[w[0]-a[0],w[1]-a[1]];
  if(mode==='multiply'){const inv=complexMap('inverse',a);return inv?multiply(w,inv):null;}
  if(mode==='square'){const r=Math.hypot(...w),x=Math.sqrt(Math.max(0,(r+w[0])/2)),y=(w[1]<0?-1:1)*Math.sqrt(Math.max(0,(r-w[0])/2));const z=[x,y];return Math.hypot(z[0]-near[0],z[1]-near[1])<=Math.hypot(z[0]+near[0],z[1]+near[1])?z:z.map(x=>-x);}
  return complexMap(mode,w);
}
export function mountComplex(root,{t,lang,initialValues=[2,1],onChange=()=>{}}) {
  let z=[...initialValues],a=[0,1],mode='multiply',step=1,small=.35,drag=null;
  const fmt=(x,d=2)=>Number(x.toFixed(d)).toLocaleString(lang,{maximumFractionDigits:d}),repr=([x,y])=>`${fmt(x)} ${y<0?'−':'+'} ${fmt(Math.abs(y))}i`;
  const options=[['multiply','Multiplier : tourner et agrandir','Multiply: rotate and scale'],['translate','Ajouter : déplacer','Add: translate'],['square','Élever au carré : doubler les angles','Square: double the angles'],['inverse','Inverser : 1/z','Invert: 1/z'],['conjugate','Conjuguer : réfléchir','Conjugate: reflect']];
  root.innerHTML=`<p class="act-help">${t('Un nombre complexe est un point ; une opération transforme tout le plan. Glisse z ou a dans le plan de départ, puis glisse son image w dans le plan d’arrivée. Les grilles gardent une échelle fixe.','A complex number is a point; an operation transforms the whole plane. Drag z or a in the input plane, then drag its image w in the output plane. The grids keep a fixed scale.')}</p>
    <label class="complex-mode">${t('Transformation','Transformation')} <select id="cx-mode">${options.map(([id,fr,en])=>`<option value="${id}">${t(fr,en)}</option>`).join('')}</select></label>
    <div class="complex-planes"><section><h3>${t('Départ : plan de z','Input: z plane')}</h3><div class="obj-stage" id="cx-input"></div></section><section><h3>${t('Arrivée : plan de w','Output: w plane')}</h3><div class="obj-stage" id="cx-output"></div></section></div>
    <div class="act-controls" id="cx-parameter">${field('cx-ar',t('Re(a)','Re(a)'),-3,3,.1,0)}${field('cx-ai',t('Im(a)','Im(a)'),-3,3,.1,1)}</div>
    <div class="act-buttons" id="cx-presets">${[[0,1,'i : +90°'],[-1,0,'−1 : 180°'],[2,0,'2 : ×2'],[1,1,'1 + i']].map(([x,y,s])=>`<button type="button" class="btn btn-secondary" data-a="${x},${y}">${s}</button>`).join('')}</div>
    <div class="act-controls">${field('cx-zr',t('Re(z)','Re(z)'),-5,5,.1,z[0])}${field('cx-zi',t('Im(z)','Im(z)'),-5,5,.1,z[1])}</div>
    <nav class="complex-steps" aria-label="${t('Explorer par étapes','Explore in steps')}">${[[1,'Un point','One point'],[2,'Une figure et le quadrillage','A shape and the grid'],[3,'Autour d’un point','Around one point']].map(([n,fr,en])=>`<button type="button" class="btn btn-secondary" data-cx-step="${n}" aria-pressed="${n===1}">${n}. ${t(fr,en)}</button>`).join('')}</nav>
    <div id="cx-local" hidden><p>${t('Pour aller plus loin : rapproche le petit cercle de z. Compare son image exacte et l’approximation par une rotation et un agrandissement locaux.','Further exploration: shrink the small circle around z. Compare its exact image with the approximation by a local rotation and scaling.')}</p>${field('cx-small',t('Rayon du petit cercle','Small-circle radius'),.02,.8,.02,small)}</div>
    <p class="act-readout" id="cx-read" role="status" aria-live="polite"></p><p id="cx-explain"></p>
    <p class="muted">${t('Approche géométrique inspirée de','Geometric approach inspired by')} <a href="https://academic.oup.com/book/45765" target="_blank" rel="noopener">Visual Complex Analysis</a>, Tristan Needham. ${t('Figures et activités originales.','Original figures and activities.')}</p>`;
  const inputs=[canvasIn(root.querySelector('#cx-input'),640/480),canvasIn(root.querySelector('#cx-output'),640/480)];
  const S=47,origin=[320,240],P=p=>[origin[0]+S*p[0],origin[1]-S*p[1]],un=([x,y])=>[(x-origin[0])/S,(origin[1]-y)/S];
  const map=p=>complexMap(mode,p,a),near=(p,q,r=24)=>Math.hypot(p[0]-q[0],p[1]-q[1])<r;
  function trace(g,points,color,width=2,dash=[]) {g.strokeStyle=color;g.lineWidth=width;g.setLineDash(dash);g.beginPath();let last=null;for(const p of points){if(!p||!p.every(Number.isFinite)){last=null;continue;}const q=P(p);if(Math.abs(q[0])>6000||Math.abs(q[1])>6000){last=null;continue;}if(!last||(points.length>2&&Math.hypot(q[0]-last[0],q[1]-last[1])>120))g.moveTo(...q);else g.lineTo(...q);last=q;}g.stroke();g.setLineDash([]);}
  const circle=(c,r)=>Array.from({length:161},(_,i)=>[c[0]+r*Math.cos(i/160*2*Math.PI),c[1]+r*Math.sin(i/160*2*Math.PI)]);
  function dot(g,p,color,label){if(!p)return;const [x,y]=P(p);g.fillStyle=color;g.strokeStyle=color;g.lineWidth=2;g.setLineDash([4,4]);g.beginPath();g.arc(x,y,14,0,2*Math.PI);g.stroke();g.setLineDash([]);g.beginPath();g.arc(x,y,6,0,2*Math.PI);g.fill();g.fillStyle=palette().ink;g.font='600 20px serif';g.textAlign='left';g.fillText(label,x+17,y-14);}
  function draw(){const C=palette(),w=map(z),D=complexDerivative(mode,z,a);for(let index=0;index<2;index++){
    const o=inputs[index],g=o.g;g.clearRect(0,0,o.W,o.H);g.fillStyle=C.sunken;g.fillRect(0,0,o.W,o.H);
    for(let k=-7;k<=7;k++){trace(g,[[k,-6],[k,6]],C.grid,1);trace(g,[[-8,k],[8,k]],C.grid,1);if(k&&k%2===0){g.fillStyle=C.muted;g.font='14px system-ui';g.fillText(String(k),P([k,0])[0]+3,origin[1]+18);g.fillText(String(k),origin[0]+6,P([0,k])[1]-3);}}
    trace(g,[[-8,0],[8,0]],C.ink,1.5);trace(g,[[0,-6],[0,6]],C.ink,1.5);
    if(step>=2){if(index===1)for(let k=-4;k<=4;k++){const H=Array.from({length:121},(_,j)=>[-4+j/15,k]),V=Array.from({length:121},(_,j)=>[k,-4+j/15]);trace(g,H.map(map),C.line,1);trace(g,V.map(map),C.line,1);}
      const shape=[[-1,-1],[1,-1],[1,1],[0,2],[-1,1],[-1,-1]];const sampled=shape.flatMap((p,i)=>i===shape.length-1?[p]:Array.from({length:30},(_,j)=>[p[0]+(shape[i+1][0]-p[0])*j/30,p[1]+(shape[i+1][1]-p[1])*j/30]));trace(g,index?sampled.map(map):sampled,C.obj2,3);trace(g,index?circle([0,0],1).map(map):circle([0,0],1),C.obj3,2);}
    if(step===3){const smallCircle=circle(z,small);trace(g,index?smallCircle.map(map):smallCircle,C.accent,3);if(index&&D&&w)trace(g,smallCircle.map(p=>{const d=multiply(D,[p[0]-z[0],p[1]-z[1]]);return[w[0]+d[0],w[1]+d[1]];}),C.pos,2,[6,4]);}
    trace(g,[[0,0],index?w:z],index?C.obj2:C.accent,2);dot(g,index?w:z,index?C.obj2:C.accent,index?'w':'z');if(!index&&['translate','multiply'].includes(mode))dot(g,a,C.obj3,'a');
  }
  const angle0=Math.atan2(z[1],z[0])*180/Math.PI,alpha=Math.atan2(a[1],a[0])*180/Math.PI;
  let message=mode==='multiply'?t(`Multiplier par a = ${repr(a)}, c’est agrandir par |a| = ${fmt(Math.hypot(...a))} et tourner de ${fmt(alpha)}°. Les longueurs sont multipliées ; les angles sont conservés si a ≠ 0.`,`Multiplying by a = ${repr(a)} scales lengths by |a| = ${fmt(Math.hypot(...a))} and rotates by ${fmt(alpha)}°. Angles are preserved when a ≠ 0.`):mode==='translate'?t('Ajouter a déplace tous les points du même vecteur. Longueurs et angles sont conservés.','Adding a moves every point by the same vector. Lengths and angles are preserved.'):mode==='square'?t(`Le carré remplace le module r par r² et l’angle θ par 2θ. ${Math.hypot(...z)>1e-9?'Ici θ ≈ '+fmt(angle0)+'°.':'En z = 0, l’argument n’est pas défini.'} z et −z ont la même image. En 0, la dérivée est nulle.`,`Squaring replaces radius r by r² and angle θ by 2θ. ${Math.hypot(...z)>1e-9?'Here θ ≈ '+fmt(angle0)+'°.':'At z = 0, the argument is undefined.'} z and −z have the same image. At 0 the derivative vanishes.`):mode==='inverse'?t('Pour z ≠ 0 : le module r devient 1/r, l’angle θ devient −θ. Les points proches de 0 partent loin. Les segments de grille sont interrompus au pôle.','For z ≠ 0: radius r becomes 1/r and angle θ becomes −θ. Points near 0 go far away. Grid strokes break at the pole.'):t('La conjugaison est une réflexion par rapport à l’axe réel. Elle conserve les longueurs mais inverse l’orientation : ce n’est pas une rotation locale.','Conjugation reflects across the real axis. It preserves lengths but reverses orientation: it is not a local rotation.');
  if(mode==='multiply'&&Math.hypot(...a)<1e-9)message=t('a = 0 : tout le plan est envoyé sur 0. Il n’y a plus de rotation ni d’inverse.','a = 0: the whole plane collapses to 0. There is no rotation or inverse.');
  root.querySelector('#cx-read').textContent=`z = ${repr(z)} ; |z| = ${fmt(Math.hypot(...z))} ; w = ${w?repr(w):t('non défini en z = 0','undefined at z = 0')}${step===3&&D?' ; '+t('facteur local','local factor')+' = '+repr(D):''}`;
  root.querySelector('#cx-explain').textContent=message+(step===3&&D&&w?t(' La courbe pleine est l’image exacte du petit cercle ; la courbe verte pointillée utilise w + f′(z)h. Réduis le rayon pour les comparer.',' The solid curve is the exact image of the small circle; the dashed green curve uses w + f′(z)h. Shrink the radius to compare them.'):'');
  }
  const sync=()=>{for(const [id,value]of [['ar',a[0]],['ai',a[1]],['zr',z[0]],['zi',z[1]]]){root.querySelector(`#cx-${id}`).value=value;root.querySelector(`#cx-${id}-out`).textContent=fmt(value);}onChange([...z]);draw();};
  for(const id of ['ar','ai','zr','zi'])bind(root,`cx-${id}`,value=>{(id[0]==='a'?a:z)[id[1]==='r'?0:1]=value;sync();},fmt);
  bind(root,'cx-small',value=>{small=value;draw();},fmt);
  root.querySelector('#cx-mode').onchange=e=>{mode=e.target.value;root.querySelector('#cx-parameter').hidden=root.querySelector('#cx-presets').hidden=!['translate','multiply'].includes(mode);draw();};
  root.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{a=b.dataset.a.split(',').map(Number);sync();});
  root.querySelectorAll('[data-cx-step]').forEach(b=>b.onclick=()=>{step=+b.dataset.cxStep;root.querySelectorAll('[data-cx-step]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));root.querySelector('#cx-local').hidden=step!==3;draw();});
  for(let index=0;index<2;index++){const o=inputs[index];o.redraw=draw;o.cv.setAttribute('aria-label',t('Plan complexe interactif : flèches pour déplacer le point, plus et moins pour zoomer.','Interactive complex plane: arrow keys move the point, plus and minus zoom.'));
    o.cv.addEventListener('pointerdown',e=>{if(e.button!==0)return;const at=o.point(e),w=map(z);if(!index&&near(at,P(z)))drag={index,which:'z'};else if(!index&&['translate','multiply'].includes(mode)&&near(at,P(a)))drag={index,which:'a'};else if(index&&w&&near(at,P(w)))drag={index,which:'w'};if(drag){o.cv.setPointerCapture(e.pointerId);o.cv.style.cursor='grabbing';e.preventDefault();}});
    const setPoint=point=>{const value=drag.which==='w'?complexInverse(mode,point,a,z):point;if(!value)return;const target=drag.which==='a'?a:z;target[0]=Math.max(-5,Math.min(5,Math.round(value[0]*10)/10));target[1]=Math.max(-5,Math.min(5,Math.round(value[1]*10)/10));if(drag.which==='a'){target[0]=Math.max(-3,Math.min(3,target[0]));target[1]=Math.max(-3,Math.min(3,target[1]));}sync();};
    o.cv.addEventListener('pointermove',e=>{if(drag&&drag.index===index)setPoint(un(o.point(e)));else{o.cv.style.cursor='grab';}});
    for(const ev of ['pointerup','pointercancel','view-gesture','lostpointercapture'])o.cv.addEventListener(ev,()=>{drag=null;o.cv.style.cursor='grab';});
    o.cv.addEventListener('keydown',e=>{const d={ArrowLeft:[-.1,0],ArrowRight:[.1,0],ArrowUp:[0,.1],ArrowDown:[0,-.1]}[e.key];if(d){e.preventDefault();const w=index?map(z):z;if(!w)return;drag={index,which:index?'w':'z'};setPoint([w[0]+d[0],w[1]+d[1]]);drag=null;}});
  }sync();return()=>inputs.forEach(o=>o.navigation?.destroy());
}
