// Escape-time sets in space (gallery exhibit, issue #36; maths in gallery-escape3d-model.js): the Mandelbulb, the Mandelbox
// and a 3D slice of a quaternion Julia set, drawn by ray marching with a distance estimate (WebGL2 shader; without it, a
// coarser image computed on the processor with the same formulas). Each is labelled as what it is: a chosen formula, a
// fold, or a slice of a 4D set; none has an established dimension.
import {exhibit,palette,dragOrbit} from './gallery-kit.js';
import {illuminateFeedback} from '../motion.js';
import {metricStrip} from './gallery-panels.js';
import {SETS,DE} from './gallery-escape3d-model.js';
import {createProgressive,raymarchShader,RAY_UNIFORMS,setCamera,setColours} from './gl-progressive.js';
import {GLSL,BOUNDS} from './fractal-sdf.js';

const toRGB=(()=>{const c=typeof document!=='undefined'?document.createElement('canvas'):null,x=c?.getContext?.('2d');return css=>{if(!x)return [.5,.5,.5];x.fillStyle='#000';x.fillStyle=css;x.fillRect(0,0,1,1);const d=x.getImageData(0,0,1,1).data;return [d[0]/255,d[1]/255,d[2]/255];};})();

export function escapeSets3D(root,opts){
  const {t,lang}=opts,nf=new Intl.NumberFormat(lang==='fr'?'fr-FR':'en-GB',{maximumFractionDigits:2}),num=v=>nf.format(v);
  const bound=()=>set==='box'?BOUNDS.box(param):BOUNDS[set],home=()=>bound()*(set==='box'?3.1:4.6);
  let set='bulb',param=SETS.bulb.param.value,iters=12,dist=0,answer=null;const view={yaw:-.7,pitch:.35},seen=new Set(['bulb']),touched=new Set();
  const o=exhibit(root,opts,t('Trois objets de l’espace obtenus en répétant une formule, comme l’ensemble de Mandelbrot dans le plan. Glisse pour les faire tourner ; change le paramètre de chacun.','Three objects in space obtained by repeating a formula, like the Mandelbrot set in the plane. Drag to turn them; change the parameter of each.'),
    `<fieldset class="act-choice"><legend>${t('La Mandelbulb est-elle « l’ensemble de Mandelbrot en 3D », avec des nombres à trois dimensions qui se multiplient comme les complexes ?','Is the Mandelbulb “the Mandelbrot set in 3D”, with three-dimensional numbers that multiply like complex numbers?')}</legend>
       ${[t('oui','yes'),t('non : de tels nombres n’existent pas, la formule est un choix','no: such numbers do not exist, the formula is a choice')].map((c,i)=>`<label><input type="radio" name="e3-guess" value="${i}"> ${c}</label>`).join('')}</fieldset>
     <p class="feedback" id="e3-verdict" role="status"></p>
     <div class="act-buttons" role="group" aria-label="${t('Objet','Object')}">${Object.keys(SETS).map(k=>`<button type="button" class="btn btn-secondary" data-set="${k}" aria-pressed="${k===set}">${t(...SETS[k].names)}</button>`).join('')}</div>
     <label class="ph-slider"><span id="e3-plabel"></span><input type="range" id="e3-p"></label>
     <div class="act-buttons"><button type="button" class="btn btn-secondary" id="e3-in">${t('Zoom +','Zoom in')}</button><button type="button" class="btn btn-secondary" id="e3-out">${t('Zoom −','Zoom out')}</button><button type="button" class="btn btn-secondary" id="e3-turn">${t('Tourner la vue','Turn the view')}</button>
       <label class="act-field"><span class="act-label">${t('Itérations','Iterations')}</span><select id="e3-it"><option>8</option><option selected>12</option><option>20</option></select></label></div>`,
    `<ol>
      <li>${t('Dans le plan, l’ensemble de Mandelbrot vient de z ↦ z² + c avec des nombres complexes. Pour l’espace, il faudrait des nombres à trois dimensions qu’on sait multiplier et diviser comme les complexes. Frobenius a prouvé en 1878 qu’il n’en existe pas : seuls les réels, les complexes et les quaternions (dimension 4) le permettent.','In the plane, the Mandelbrot set comes from z ↦ z² + c with complex numbers. For space one would need three-dimensional numbers that can be multiplied and divided like complex numbers. Frobenius proved in 1878 that there are none: only the reals, the complex numbers and the quaternions (dimension 4) allow it.')}</li>
      <li>${t('Mandelbulb (White et Nylander, 2009) : une formule choisie. En coordonnées sphériques, on élève la distance au centre à la puissance n et on multiplie les deux angles par n, puis on ajoute le point de départ. Avec n = 8, l’objet est plus détaillé ; il a n − 1 copies identiques autour de l’axe vertical.','Mandelbulb (White and Nylander, 2009): a chosen formula. In spherical coordinates, raise the distance to the centre to the power n and multiply both angles by n, then add the starting point. With n = 8 the object is more detailed; it has n − 1 identical copies around the vertical axis.')}</li>
      <li>${t('Mandelbox (Lowe, 2010) : on replie le cube [−1, 1]³ sur lui-même, on retourne les points proches du centre par rapport à une sphère, on multiplie par l’échelle s et on ajoute le point de départ.','Mandelbox (Lowe, 2010): fold the cube [−1, 1]³ onto itself, turn the points near the centre inside out through a sphere, multiply by the scale s and add the starting point.')}</li>
      <li>${t('Julia quaternionique : q ↦ q² + c avec des quaternions, de vrais nombres de dimension 4. L’ensemble vit dans un espace à 4 dimensions ; on en montre une tranche, la quatrième coordonnée fixée à w. Changer w, c’est déplacer la tranche.','Quaternion Julia: q ↦ q² + c with quaternions, true numbers of dimension 4. The set lives in a four-dimensional space; a slice is shown, with the fourth coordinate fixed at w. Changing w moves the slice.')}</li>
      <li>${t('Ce que l’on voit est approché : chaque rayon avance tant qu’une estimation de la distance à l’objet est plus grande qu’un pixel. Aucune dimension n’est établie pour ces trois objets ; la page n’en affiche donc pas.','What you see is approximate: each ray moves on while an estimate of the distance to the object is larger than a pixel. No dimension is established for these three objects, so the page shows none.')}</li>
    </ol>
    <p>${t('Voir aussi : ','See also: ')}<a href="#gallery/mandelbrot">${t('Mandelbrot et Julia dans le plan','Mandelbrot and Julia in the plane')}</a> · <a href="#gallery/basins">${t('Multibrot et bassins de Newton','Multibrot and Newton basins')}</a></p>`);
  const g=o.g,stage=root.querySelector('.exhibit-stage'),controls=root.querySelector('.exhibit-controls'),top=document.createElement('div');
  top.className='exhibit-band';controls.classList.add('exhibit-band');
  top.append(...[...controls.children].filter(el=>el.matches('fieldset, .feedback, [role=group]')));stage.before(top);stage.after(controls);
  const MS=metricStrip(controls,t,[{id:'f',label:t('Formule','Formula')},{id:'p',label:t('Paramètre','Parameter'),kind:'exact'},{id:'what',label:t('Ce que c’est','What it is')},{id:'dim',label:t('Dimension','Dimension')},{id:'how',label:t('Dessin','Drawing')}]);
  // one program per object, compiled when first shown; null without WebGL2 (then the coarse processor drawing is used)
  const programs={};let glOK=true;
  const GL=()=>{if(!glOK)return null;if(!(set in programs)){try{programs[set]=createProgressive(raymarchShader(GLSL[set]),RAY_UNIFORMS);}catch(e){console.warn(e);programs[set]=null;}if(!programs[set])glOK=false;}return programs[set];};
  const changed=()=>{cpuRow=0;GL()?.reset();};dist=home();
  const fb=root.querySelector('#e3-verdict'),pIn=root.querySelector('#e3-p'),pLab=root.querySelector('#e3-plabel');
  function verdict(){let text,cls='';
    if(answer==null)text=t('Choisis une réponse, puis regarde les trois objets.','Choose an answer, then look at the three objects.');
    else if(seen.size<3||!touched.has('bulb'))text=t('Réponse notée. Regarde les trois objets et change la puissance de la Mandelbulb.','Answer noted. Look at the three objects and change the power of the Mandelbulb.');
    else{const ok=answer===1;cls=ok?'success':'error';text=(ok?t('Bien vu. ','Well spotted. '):t('Pas tout à fait. ','Not quite. '))+t('Il n’existe pas de nombres à trois dimensions qui se multiplient comme les complexes (Frobenius, 1878). La Mandelbulb imite les complexes en coordonnées sphériques : c’est une belle formule choisie, pas une extension naturelle.','There are no three-dimensional numbers that multiply like complex numbers (Frobenius, 1878). The Mandelbulb imitates complex numbers in spherical coordinates: it is a fine chosen formula, not a natural extension.');}
    if(fb.textContent!==text){const was=fb.className;fb.className='feedback'+(cls?' '+cls:'');fb.textContent=text;if(cls&&was!==fb.className)illuminateFeedback(fb,opts.reduced);}}
  function sync(){const P=SETS[set].param;pIn.min=P.min;pIn.max=P.max;pIn.step=P.step;pIn.value=param;
    pLab.textContent=set==='bulb'?t(`Puissance n = ${param}`,`Power n = ${param}`):set==='box'?t(`Échelle s = ${num(param)}`,`Scale s = ${num(param)}`):t(`Tranche w = ${num(param)}`,`Slice w = ${num(param)}`);
    MS.set('f',set==='bulb'?t('rayon à la puissance n, angles × n, + point de départ','radius to the power n, angles × n, + starting point'):set==='box'?t('repli du cube, repli de la sphère, × s, + point de départ','fold the cube, fold the sphere, × s, + starting point'):'q ↦ q² + c, c = −0,291 − 0,399 i + 0,339 j + 0,437 k'.replace(/,/g,lang==='fr'?',':'.'));
    MS.set('p',set==='bulb'?`n = ${param} : ${param-1} ${t('copies autour de l’axe','copies around the axis')}`:set==='box'?`s = ${num(param)}`:`w = ${num(param)}`);
    MS.set('what',set==='bulb'?t('une formule choisie, pas des nombres 3D','a chosen formula, not 3D numbers'):set==='box'?t('une suite de replis','a sequence of folds'):t('une tranche 3D d’un ensemble de dimension 4','a 3D slice of a four-dimensional set'));
    MS.set('dim',t('non établie','not established'));MS.set('how',GL()?t('rayons sur la carte graphique, distance estimée','rays on the graphics card, estimated distance'):t('calcul sur le processeur, image grossière','computed on the processor, coarse image'));
    verdict();changed();o.redraw();}
  root.querySelectorAll('[data-set]').forEach(b=>o.on(b,'click',()=>{set=b.dataset.set;seen.add(set);param=SETS[set].param.value;dist=home();root.querySelectorAll('[data-set]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));sync();}));
  o.on(pIn,'input',()=>{param=+pIn.value;touched.add(set);if(set==='box')dist=home();sync();});
  root.querySelectorAll('[name=e3-guess]').forEach(r=>o.on(r,'change',()=>{answer=+r.value;verdict();}));
  o.on(root.querySelector('#e3-it'),'change',e=>{iters=+e.target.value;sync();});
  o.on(root.querySelector('#e3-in'),'click',()=>{dist*=.8;changed();o.redraw();});o.on(root.querySelector('#e3-out'),'click',()=>{dist*=1.25;changed();o.redraw();});
  o.on(root.querySelector('#e3-turn'),'click',()=>{view.yaw+=Math.PI/6;changed();o.redraw();});
  dragOrbit(o,view);o.on(o.cv,'pointermove',e=>{if(e.buttons)changed();});o.on(o.cv,'keydown',changed);
  o.cv.setAttribute('aria-label',t('Objet fractal en 3D. Glisser ou les flèches font tourner la vue.','Fractal object in 3D. Drag or use the arrow keys to turn the view.'));
  const camera=()=>{const cy=Math.cos(view.yaw),sy=Math.sin(view.yaw),cp=Math.cos(view.pitch),sp=Math.sin(view.pitch),eye=[dist*cp*cy,dist*cp*sy,dist*sp],f=eye.map(v=>-v/dist),r=[sy,-cy,0],rl=Math.hypot(...r),R=r.map(v=>v/rl),U=[R[1]*f[2]-R[2]*f[1],R[2]*f[0]-R[0]*f[2],R[0]*f[1]-R[1]*f[0]];return {eye,f,R,U};};
  // processor fallback: a coarse image, a few rows per frame
  const low=document.createElement('canvas'),lx=low.getContext('2d');let cpuRow=0,cpuImg=null;
  function cpuStep(C){const w=160,h=Math.round(160*o.H/o.W);if(low.width!==w){low.width=w;low.height=h;}if(cpuRow===0)cpuImg=lx.createImageData(w,h);
    const {eye,f,R,U}=camera(),bg=toRGB(C.sunken),ob=toRGB(C.object),t0=performance.now();
    while(cpuRow<h&&performance.now()-t0<20){for(let x=0;x<w;x++){const u=(x-w/2)/h,v=-(cpuRow-h/2)/h,d=[0,1,2].map(k=>f[k]*1.6+R[k]*u+U[k]*v),l=Math.hypot(...d),rd=d.map(q=>q/l);let tt=0,hit=false,st=0;
      for(let i=0;i<90;i++){const p=eye.map((e,k)=>e+rd[k]*tt),dd=DE[set](p,param);if(dd<.003*tt){hit=true;st=i;break;}tt+=dd*.9;if(tt>dist+8)break;}
      const col=hit?ob.map(c=>c*(1-st/90)*255):bg.map(c=>c*255),i4=(cpuRow*w+x)*4;cpuImg.data[i4]=col[0];cpuImg.data[i4+1]=col[1];cpuImg.data[i4+2]=col[2];cpuImg.data[i4+3]=255;}cpuRow++;}
    lx.putImageData(cpuImg,0,0);return cpuRow<h;}
  o.animate(()=>{const C=palette(),R=GL();
    if(R){const w=o.cv.width,h=o.cv.height,more=R.frame(w,h,(gl,U)=>{setCamera(gl,U,view,dist,bound(),w,h,1);setColours(gl,U,C);gl.uniform4f(U.uP,param,0,0,0);gl.uniform4fv(U.uC,SETS.julia.c);gl.uniform1i(U.uIters,iters);gl.uniform1i(U.uStage,0);});
      R.blit(g,o.W,o.H);o.read(`${t(...SETS[set].names)} · ${pLab.textContent}`);return more||R.busy();}
    const busy=cpuStep(C);g.clearRect(0,0,o.W,o.H);g.imageSmoothingEnabled=true;g.drawImage(low,0,0,o.W,o.H);o.read(busy?t('Calcul de l’image…','Computing the image…'):`${t(...SETS[set].names)} · ${pLab.textContent}`);return busy;});
  o.busy=()=>GL()?GL().busy():cpuRow<Math.round(160*o.H/o.W);
  sync();
  return ()=>{o.stop();Object.values(programs).forEach(r=>r?.destroy());MS.el.remove();};
}
