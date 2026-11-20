// Iteration in the complex plane (gallery exhibit, issue #36; maths in gallery-basins-model.js): the Multibrot sets
// z → z^d + c, and the basins of Newton's method. The image is computed on the processor, a few rows per frame; a click
// picks a point (its escape step, or its Newton path to a root), the zoom buttons zoom around it. A question per mode.
import {exhibit,palette} from './gallery-kit.js';
import {illuminateFeedback} from '../motion.js';
import {metricStrip} from './gallery-panels.js';
import {multibrotEscape,symmetryOrder,boundRadius,POLYS,rootsFor,newton} from './gallery-basins-model.js';

const rgbOf=(()=>{const c=typeof document!=='undefined'?document.createElement('canvas'):null,x=c?.getContext?.('2d');return css=>{if(!x)return [128,128,128];x.clearRect(0,0,1,1);x.fillStyle='#000';x.fillStyle=css;x.fillRect(0,0,1,1);const d=x.getImageData(0,0,1,1).data;return [d[0],d[1],d[2]];};})();
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);

export function complexBasins(root,opts){
  const {t,lang}=opts,nf=new Intl.NumberFormat(lang==='fr'?'fr-FR':'en-GB',{maximumFractionDigits:4}),num=v=>nf.format(v),cx=z=>`${num(z[0])} ${z[1]<0?'−':'+'} ${num(Math.abs(z[1]))} i`;
  let mode='multibrot',d=2,poly='z3-1',N=120,pick=null,answers={},seenD=new Set([2]),seenPoly=new Set(['z3-1']);
  const HOME={multibrot:{c:[-.3,0],span:3.4},newton:{c:[0,0],span:3.6}};let view={...HOME.multibrot};
  const o=exhibit(root,opts,t('On itère une même opération sur un nombre complexe. Touche l’image pour choisir un point : on voit ce que devient son itération. Les boutons de zoom agrandissent autour du point choisi.','The same operation is repeated on a complex number. Touch the image to choose a point: you see what its iteration does. The zoom buttons enlarge around the chosen point.'),
    `<div class="act-buttons" role="group" aria-label="${t('Itération','Iteration')}">
       <button type="button" class="btn btn-secondary" data-mode="multibrot" aria-pressed="true">${t('Multibrot : z ↦ zᵈ + c','Multibrot: z ↦ zᵈ + c')}</button>
       <button type="button" class="btn btn-secondary" data-mode="newton" aria-pressed="false">${t('Méthode de Newton','Newton’s method')}</button></div>
     <fieldset class="act-choice"><legend id="bs-q"></legend><span id="bs-choices"></span></fieldset>
     <p class="feedback" id="bs-verdict" role="status"></p>
     <label class="ph-slider" id="bs-d-row"><span>${t('Puissance d','Power d')} : <output id="bs-d-out">2</output></span><input type="range" id="bs-d" min="2" max="8" step="1" value="2"></label>
     <div class="act-buttons" id="bs-polys" role="group" aria-label="${t('Polynôme','Polynomial')}" hidden>${Object.entries(POLYS).map(([k,P])=>`<button type="button" class="btn btn-secondary" data-poly="${k}" aria-pressed="${k===poly}">${P.names[0]}</button>`).join('')}</div>
     <div class="act-buttons"><button type="button" class="btn btn-secondary" id="bs-in">${t('Zoom +','Zoom in')}</button><button type="button" class="btn btn-secondary" id="bs-out">${t('Zoom −','Zoom out')}</button><button type="button" class="btn btn-secondary" id="bs-home">${t('Vue de départ','Starting view')}</button>
       <label class="act-field bs-n"><span class="act-label">${t('Étapes au plus','Steps at most')}</span><select id="bs-n"><option>60</option><option selected>120</option><option>400</option></select></label></div>`,
    `<ol>
      <li>${t('Multibrot : on part de z = 0 et on répète z ↦ zᵈ + c. Si |z| dépasse 2 et |c|, il grandit ensuite sans limite : c est hors de l’ensemble, et la couleur dit à quelle étape il est sorti. Un point resté dedans après N étapes n’est pas prouvé dans l’ensemble : il est peut-être sorti plus tard.','Multibrot: start from z = 0 and repeat z ↦ zᵈ + c. If |z| exceeds 2 and |c|, it then grows without limit: c is outside the set, and the colour tells at which step it left. A point still inside after N steps is not proved to be in the set: it may leave later.')}</li>
      <li>${t('Symétrie : si ω^(d−1) = 1, en remplaçant c par ωc chaque terme de la suite est multiplié par ω, donc garde le même module. La figure revient sur elle-même après un tour de 2π/(d − 1) : d − 1 copies identiques autour de 0 (une seule pour d = 2, où l’on voit seulement la symétrie par rapport à l’axe réel).','Symmetry: if ω^(d−1) = 1, replacing c by ωc multiplies every term of the sequence by ω, so its modulus stays the same. The figure comes back onto itself after a turn of 2π/(d − 1): d − 1 identical copies around 0 (only one for d = 2, where only the symmetry about the real axis shows).')}</li>
      <li>${t('Newton : pour résoudre p(z) = 0, on répète z ↦ z − p(z)/p′(z). Près d’une racine, la convergence est très rapide. Chaque point de l’image prend la couleur de la racine atteinte, plus foncée quand il faut plus d’étapes ; en noir, aucune racine après N étapes.','Newton: to solve p(z) = 0, repeat z ↦ z − p(z)/p′(z). Near a root it converges very fast. Each point of the image takes the colour of the root it reaches, darker when more steps are needed; in black, no root after N steps.')}</li>
      <li>${t('Théorème (Fatou, Julia, vers 1918) : la frontière du bassin d’une racine est la même pour toutes les racines. Tout point de la frontière entre deux couleurs touche donc aussi la troisième, si près qu’on zoome. Pour z³ − 2z + 2, la suite partie de 0 alterne 0, 1, 0, 1… : la méthode échoue sur toute une région autour de 0, et pas seulement en quelques points.','Theorem (Fatou, Julia, around 1918): the boundary of the basin of a root is the same for every root. So every point on the boundary between two colours also touches the third, however far you zoom. For z³ − 2z + 2, the sequence starting at 0 alternates 0, 1, 0, 1…: the method fails on a whole region around 0, not only at a few points.')}</li>
      <li>${t('À toi : pour z ↦ z⁵ + c, combien de copies identiques autour de 0 ? (4.) Et pour Newton sur z⁴ − 1, combien de couleurs ? (4, une par racine 1, i, −1, −i.)','Your turn: for z ↦ z⁵ + c, how many identical copies around 0? (4.) And for Newton on z⁴ − 1, how many colours? (4, one per root 1, i, −1, −i.)')}</li>
    </ol>
    <p>${t('Voir aussi : ','See also: ')}<a href="#gallery/mandelbrot">${t('Mandelbrot et Julia','Mandelbrot and Julia')}</a> · <a href="#gallery/self-similar">${t('fractales construites étape par étape','fractals built stage by stage')}</a></p>`);
  const g=o.g,stage=root.querySelector('.exhibit-stage'),controls=root.querySelector('.exhibit-controls'),top=document.createElement('div');
  top.className='exhibit-band';controls.classList.add('exhibit-band');
  top.append(...[...controls.children].filter(el=>el.matches('fieldset, .feedback, [role=group]:first-child')));stage.before(top);stage.after(controls);
  const MS=metricStrip(controls,t,[{id:'what',label:t('Itération','Iteration')},{id:'fact',label:t('Symétrie ou racines','Symmetry or roots'),kind:'exact'},{id:'pt',label:t('Point choisi','Chosen point')},{id:'res',label:t('Ce qu’il devient','What becomes of it'),kind:'observed'},{id:'share',label:t('Sur l’image','On the image'),kind:'observed'}]);
  const fb=root.querySelector('#bs-verdict'),dIn=root.querySelector('#bs-d'),dOut=root.querySelector('#bs-d-out');
  const QUEST={
    multibrot:{q:['Pour z ↦ zᵈ + c, combien de copies identiques de la figure tournent autour de 0 ?','For z ↦ zᵈ + c, how many identical copies of the figure turn around 0?'],choices:['d − 1','d','d + 1'],good:0,
      ready:()=>seenD.size>=3,todo:['Essaie au moins trois valeurs de d.','Try at least three values of d.'],
      why:['Remplacer c par ωc, avec ω^(d−1) = 1, multiplie toute la suite par ω : d − 1 copies. Pour d = 3, deux moitiés ; pour d = 5, quatre.','Replacing c by ωc, with ω^(d−1) = 1, multiplies the whole sequence by ω: d − 1 copies. For d = 3, two halves; for d = 5, four.']},
    newton:{q:['La méthode de Newton finit-elle toujours sur une racine, si on part d’un point au hasard ?','Does Newton’s method always end on a root, starting from a random point?'],choices:[['Oui, presque toujours','Yes, almost always'],['Non : pour certains polynômes, toute une région échoue','No: for some polynomials, a whole region fails']],good:1,
      ready:()=>seenPoly.has('z3-2z+2')&&seenPoly.size>=2,todo:['Essaie au moins deux polynômes, dont z³ − 2z + 2.','Try at least two polynomials, including z³ − 2z + 2.'],
      why:['Pour z³ − 1, presque tout point converge (les points qui échouent sont sur la frontière, d’aire nulle). Pour z³ − 2z + 2, toute une région autour de 0 tombe dans le cycle 0, 1, 0, 1… et n’atteint jamais de racine.','For z³ − 1, almost every point converges (those that fail lie on the boundary, of zero area). For z³ − 2z + 2, a whole region around 0 falls into the cycle 0, 1, 0, 1… and never reaches a root.']}};
  let asked='';
  function question(){const Q=QUEST[mode];
    if(asked!==mode){asked=mode;root.querySelector('#bs-q').textContent=t(...Q.q);const box=root.querySelector('#bs-choices');
      box.innerHTML=Q.choices.map((c,i)=>`<label><input type="radio" name="bs-guess" value="${i}"${answers[mode]===i?' checked':''}> ${Array.isArray(c)?t(...c):c}</label>`).join('');
      box.querySelectorAll('input').forEach(r=>o.on(r,'change',()=>{answers[mode]=+r.value;question();}));}
    const a=answers[mode];let text,cls='';
    if(a==null)text=t('Choisis une réponse, puis explore.','Choose an answer, then explore.');
    else if(!Q.ready())text=t('Réponse notée. ','Answer noted. ')+t(...Q.todo);
    else{const ok=a===Q.good;cls=ok?'success':'error';text=(ok?t('Bien vu. ','Well spotted. '):t('Pas tout à fait. ','Not quite. '))+t(...Q.why);}
    if(fb.textContent!==text){const was=fb.className;fb.className='feedback'+(cls?' '+cls:'');fb.textContent=text;if(cls&&was!==fb.className)illuminateFeedback(fb,opts.reduced);}}
  // the image, computed a few rows at a time into an offscreen buffer
  const off=document.createElement('canvas'),ox=off.getContext('2d');let img=null,row=0,stats=[0,0],colours=null;
  const W=()=>Math.round(o.W),H=()=>Math.round(o.H);
  const toC=(px,py)=>{const s=view.span/W();return [view.c[0]+(px-W()/2)*s,view.c[1]-(py-H()/2)*s];};
  function restart(){off.width=W();off.height=H();img=ox.createImageData(W(),H());row=0;stats=[0,0];const C=palette();
    colours={sunken:rgbOf(C.sunken),ink:rgbOf(C.ink),obj:rgbOf(C.object),mid:rgbOf(C.c[1]),roots:[0,1,2,3,4].map(i=>rgbOf(C.c[i]))};sync();o.redraw();}
  function pixel(px,py){const c=toC(px,py);
    if(mode==='multibrot'){const k=multibrotEscape(c,d,N);if(k===null)return colours.ink;stats[1]++;const s=Math.sqrt(k/N);return s<.5?mix(colours.sunken,colours.mid,s*2):mix(colours.mid,colours.obj,s*2-1);}
    const r=newton(poly,c,N,1e-6);if(r.root<0)return colours.ink;stats[1]++;return mix(colours.roots[r.root],[0,0,0],Math.min(.65,r.steps/(N>100?40:25)));}
  function compute(){if(!img||row>=H())return false;const t0=performance.now(),w=W();
    while(row<H()&&performance.now()-t0<24){for(let px=0;px<w;px++){const col=pixel(px,row),i=(row*w+px)*4;img.data[i]=col[0];img.data[i+1]=col[1];img.data[i+2]=col[2];img.data[i+3]=255;stats[0]++;}row++;}
    ox.putImageData(img,0,0);if(row>=H())sync();return row<H();}
  function sync(){
    dIn.closest('label').hidden=mode!=='multibrot';root.querySelector('#bs-polys').hidden=mode!=='newton';
    if(mode==='multibrot'){MS.set('what',`z ↦ z${'⁰¹²³⁴⁵⁶⁷⁸⁹'[d]} + c`);MS.set('fact',t(`${symmetryOrder(d)} copie${symmetryOrder(d)>1?'s':''} autour de 0 ; tout dans |c| ≤ ${num(boundRadius(d))}`,`${symmetryOrder(d)} cop${symmetryOrder(d)>1?'ies':'y'} around 0; all within |c| ≤ ${num(boundRadius(d))}`));}
    else{const R=rootsFor(poly);MS.set('what',`z ↦ z − p(z)/p′(z), p = ${POLYS[poly].names[0]}`);MS.set('fact',t(`${R.length} racines : `,`${R.length} roots: `)+R.map(cx).join(' ; '));}
    if(pick){MS.set('pt',cx(pick));
      if(mode==='multibrot'){const k=multibrotEscape(pick,d,N);MS.set('res',k===null?t(`pas sorti après ${N} étapes (ce n’est pas une preuve)`,`not out after ${N} steps (not a proof)`):t(`sorti à l’étape ${k}`,`out at step ${k}`));}
      else{const r=newton(poly,pick,N,1e-9);MS.set('res',r.root<0?t(`aucune racine après ${N} étapes`,`no root after ${N} steps`):t(`racine ${cx(rootsFor(poly)[r.root])} en ${r.steps} étapes`,`root ${cx(rootsFor(poly)[r.root])} in ${r.steps} steps`));}}
    else{MS.set('pt',t('touche l’image','touch the image'));MS.set('res','–');}
    MS.set('share',row>=H()?(mode==='multibrot'?t(`${num(100*stats[1]/stats[0])} % des points sortis`,`${num(100*stats[1]/stats[0])}% of the points out`):t(`${num(100*stats[1]/stats[0])} % des points sur une racine`,`${num(100*stats[1]/stats[0])}% of the points on a root`)):t('calcul…','computing…'));
    question();}
  root.querySelectorAll('[data-mode]').forEach(b=>o.on(b,'click',()=>{mode=b.dataset.mode;root.querySelectorAll('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));view={...HOME[mode]};pick=null;restart();}));
  o.on(dIn,'input',()=>{d=+dIn.value;dOut.textContent=d;seenD.add(d);restart();});
  root.querySelectorAll('[data-poly]').forEach(b=>o.on(b,'click',()=>{poly=b.dataset.poly;seenPoly.add(poly);root.querySelectorAll('[data-poly]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));pick=null;restart();}));
  o.on(root.querySelector('#bs-n'),'change',e=>{N=+e.target.value;restart();});
  const zoom=k=>{if(pick)view.c=[...pick];view.span*=k;restart();};
  o.on(root.querySelector('#bs-in'),'click',()=>zoom(.4));o.on(root.querySelector('#bs-out'),'click',()=>zoom(2.5));o.on(root.querySelector('#bs-home'),'click',()=>{view={...HOME[mode]};restart();});
  o.touchHit(()=>true);
  o.on(o.cv,'pointerdown',e=>{const r=o.cv.getBoundingClientRect();pick=toC((e.clientX-r.left)*W()/r.width,(e.clientY-r.top)*H()/r.height);sync();o.redraw();});
  o.on(o.cv,'keydown',e=>{const k={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1]}[e.key];if(!k)return;e.preventDefault();pick=pick||[...view.c];pick=[pick[0]+k[0]*view.span/40,pick[1]+k[1]*view.span/40];sync();o.redraw();});
  o.cv.setAttribute('aria-label',t('Image de l’itération. Toucher ou les flèches choisissent un point ; les boutons de zoom agrandissent autour de lui.','Image of the iteration. Touch or the arrow keys choose a point; the zoom buttons enlarge around it.'));
  o.animate(()=>{
    const busy=compute(),C=palette();g.clearRect(0,0,o.W,o.H);g.drawImage(off,0,0,o.W,o.H);
    if(pick){const s=view.span/W(),P=z=>[W()/2+(z[0]-view.c[0])/s,H()/2-(z[1]-view.c[1])/s];
      if(mode==='newton'){const r=newton(poly,pick,40,1e-9,true);g.strokeStyle=C.surface;g.lineWidth=2.5;g.beginPath();r.path.forEach((z,i)=>{const p=P(z);i?g.lineTo(...p):g.moveTo(...p);});g.stroke();g.strokeStyle=C.ink;g.lineWidth=1.2;g.stroke();
        for(const z of r.path){const p=P(z);g.fillStyle=C.surface;g.beginPath();g.arc(p[0],p[1],3,0,6.3);g.fill();}}
      const p=P(pick);g.strokeStyle=C.surface;g.lineWidth=3;g.beginPath();g.arc(p[0],p[1],7,0,6.3);g.stroke();g.strokeStyle=C.ink;g.lineWidth=1.5;g.stroke();}
    if(mode==='newton'&&rootsFor(poly)){const s=view.span/W();for(const z of rootsFor(poly)){const p=[W()/2+(z[0]-view.c[0])/s,H()/2-(z[1]-view.c[1])/s];g.fillStyle=C.surface;g.beginPath();g.arc(p[0],p[1],4.5,0,6.3);g.fill();g.strokeStyle=C.ink;g.lineWidth=1.5;g.stroke();}}
    o.read(row<H()?t('Calcul de l’image…','Computing the image…'):`${MS.el.querySelector('dd')?.textContent||''}`);
    return busy;
  });
  o.busy=()=>row<H();
  restart();
  return ()=>{o.stop();MS.el.remove();};
}
