// Dandelin's spheres (gallery exhibit, issue #31; maths in gallery-dandelin-model.js): a cone cut by a tilted plane, the
// two spheres that touch both, their points of contact F1, F2 with the plane, and a point P that runs round the ellipse.
// PF1 = PT1 and PF2 = PT2 (two tangents from P to the same sphere), so PF1 + PF2 = T1T2, the same on every generator.
// Turnable view (drag, arrow keys, a button); the tilt and the position of P are sliders.
import {exhibit,palette,orbitProject,dragOrbit,TAU} from './gallery-kit.js';
import {illuminateFeedback} from '../motion.js';
import {metricStrip} from './gallery-panels.js';
import {setup,ellipse,facts,majorAxis,generator} from './gallery-dandelin-model.js';

const DEG=Math.PI/180,ALPHA=25*DEG,MAXTILT=60;   // the cone's half-angle; the tilt stays below 90° − 25° = 65°, where the cut stops being an ellipse
export function dandelinSpheres(root,opts){
  const {t,lang}=opts,nf=new Intl.NumberFormat(lang==='fr'?'fr-FR':'en-GB',{minimumFractionDigits:2,maximumFractionDigits:2}),num=v=>nf.format(v);
  let beta=25*DEG,theta=40*DEG,showSpheres=true,answer=null,travel=0,lastTheta=theta;const view={yaw:-0.9,pitch:0.32};
  const o=exhibit(root,opts,t('Un plan coupe un cône : la trace est une ellipse. Deux sphères touchent à la fois le cône et le plan. Fais tourner la vue, incline le plan, promène P sur l’ellipse.','A plane cuts a cone: the cut is an ellipse. Two spheres touch both the cone and the plane. Turn the view, tilt the plane, move P along the ellipse.'),
    `<fieldset class="act-choice"><legend>${t('Quand P fait le tour de l’ellipse, la somme PF₁ + PF₂…','As P goes round the ellipse, the sum PF₁ + PF₂…')}</legend>
       ${[[t('change','changes')],[t('reste la même','stays the same')]].map((c,i)=>`<label><input type="radio" name="dd-guess" value="${i}"> ${c[0]}</label>`).join('')}</fieldset>
     <p class="feedback" id="dd-verdict" role="status"></p>
     <label class="ph-slider"><span>${t('Position de P sur l’ellipse','Position of P on the ellipse')}</span><input type="range" id="dd-p" min="0" max="359" step="1" value="40"></label>
     <label class="ph-slider"><span>${t('Inclinaison du plan','Tilt of the plane')}</span><input type="range" id="dd-tilt" min="0" max="${MAXTILT}" step="1" value="25"></label>
     <div class="act-buttons"><button type="button" class="btn btn-secondary" id="dd-spheres" aria-pressed="true">${t('Montrer les sphères','Show the spheres')}</button>
       <button type="button" class="btn btn-secondary" id="dd-turn">${t('Tourner la vue','Turn the view')}</button></div>`,
    `<ol>
      <li>${t('Chaque sphère touche le cône le long d’un cercle horizontal, et le plan en un seul point : F₁ pour la petite, F₂ pour la grande.','Each sphere touches the cone along a horizontal circle, and the plane at a single point: F₁ for the small one, F₂ for the large one.')}</li>
      <li>${t('Depuis un point P extérieur à une sphère, tous les segments tangents à la sphère ont la même longueur. PF₁ et PT₁ sont deux tangentes à la petite sphère (T₁ : là où la génératrice de P touche le petit cercle) : PF₁ = PT₁. De même PF₂ = PT₂.','From a point P outside a sphere, all tangent segments to the sphere have the same length. PF₁ and PT₁ are two tangents to the small sphere (T₁: where the generator through P meets the small circle): PF₁ = PT₁. Likewise PF₂ = PT₂.')}</li>
      <li>${t('Donc PF₁ + PF₂ = PT₁ + PT₂ = T₁T₂ : la longueur de la génératrice entre les deux cercles. Elle est la même pour toutes les génératrices, donc pour tous les points P.','So PF₁ + PF₂ = PT₁ + PT₂ = T₁T₂: the length of the generator between the two circles. It is the same for every generator, so for every point P.')}</li>
      <li>${t('Une courbe dont tous les points ont la même somme des distances à deux points fixes est une ellipse de foyers F₁ et F₂ : les sphères montrent où sont les foyers, et pourquoi.','A curve whose points all have the same sum of distances to two fixed points is an ellipse with foci F₁ and F₂: the spheres show where the foci are, and why.')}</li>
      <li>${t('À toi : deux punaises sont plantées à 6 cm l’une de l’autre, une ficelle de 10 cm est attachée à chacune. Un crayon tend la ficelle et fait le tour : PF₁ + PF₂ = 10. Quelle est la longueur de l’ellipse (grand axe) et sa demi-largeur ? (10 cm ; √(5² − 3²) = 4 cm.)','Your turn: two pins are 6 cm apart, a 10 cm string is tied to both. A pencil keeps the string tight and goes round: PF₁ + PF₂ = 10. What are the length of the ellipse (major axis) and its half-width? (10 cm; √(5² − 3²) = 4 cm.)')}</li>
    </ol>`);
  const g=o.g,stage=root.querySelector('.exhibit-stage'),controls=root.querySelector('.exhibit-controls'),top=document.createElement('div');
  top.className='exhibit-band';controls.classList.add('exhibit-band');
  top.append(...[...controls.children].filter(el=>el.matches('fieldset, .feedback')));stage.before(top);stage.after(controls);
  const MS=metricStrip(controls,t,[{id:'d',label:'PF₁ · PF₂',kind:'approx'},{id:'sum',label:'PF₁ + PF₂',kind:'approx'},{id:'gen',label:t('T₁T₂ sur la génératrice de P','T₁T₂ on the generator through P'),kind:'approx'},{id:'axis',label:t('Grand axe de l’ellipse','Major axis of the ellipse'),kind:'approx'}]);
  const fb=root.querySelector('#dd-verdict');
  function verdict(){
    let text,cls='';
    if(answer==null)text=t('Choisis une réponse, puis fais faire un bon bout de chemin à P.','Choose an answer, then move P a good way round.');
    else if(travel<150*DEG)text=t('Réponse notée. Fais parcourir à P au moins un demi-tour en lisant la somme.','Answer noted. Move P at least half way round while reading the sum.');
    else{const ok=answer===1;cls=ok?'success':'error';text=(ok?t('Bien vu. ','Well spotted. '):t('Pas tout à fait. ','Not quite. '))+t('PF₁ et PF₂ changent, mais leur somme reste égale à T₁T₂ : ouvre l’explication pour voir pourquoi.','PF₁ and PF₂ change, but their sum stays equal to T₁T₂: open the explanation to see why.');}
    if(fb.textContent!==text){const was=fb.className;fb.className='feedback'+(cls?' '+cls:'');fb.textContent=text;if(cls&&was!==fb.className)illuminateFeedback(fb,opts.reduced);}
  }
  root.querySelectorAll('[name=dd-guess]').forEach(r=>o.on(r,'change',()=>{answer=+r.value;verdict();}));
  o.on(root.querySelector('#dd-p'),'input',e=>{theta=+e.target.value*DEG;let d=Math.abs(theta-lastTheta);if(d>Math.PI)d=TAU-d;travel+=d;lastTheta=theta;verdict();o.redraw();});
  o.on(root.querySelector('#dd-tilt'),'input',e=>{beta=+e.target.value*DEG;o.redraw();});
  const sb=root.querySelector('#dd-spheres');o.on(sb,'click',()=>{showSpheres=!showSpheres;sb.setAttribute('aria-pressed',String(showSpheres));o.redraw();});
  o.on(root.querySelector('#dd-turn'),'click',()=>{view.yaw+=Math.PI/6;o.redraw();});
  dragOrbit(o,view);
  o.cv.setAttribute('aria-label',t('Cône, plan, ellipse et sphères de Dandelin. Glisser ou les flèches font tourner la vue.','Cone, plane, ellipse and Dandelin spheres. Drag or use the arrow keys to turn the view.'));
  o.animate(()=>{
    const C=palette(),S=setup({alpha:ALPHA,beta,c:1}),f=facts(S,theta),z0=(S.high.C[2]+S.low.C[2])/2;
    const zTop=S.high.C[2]+S.high.r+0.25,scale=Math.min(150,330/zTop);
    const P=v=>{const q=orbitProject([v[0],v[1],v[2]-z0],view.yaw,view.pitch,scale);return [q[0],q[1]+20];};
    const line=(a,b,col,w=1.5,dash=[])=>{const A=P(a),B=P(b);g.strokeStyle=col;g.lineWidth=w;g.setLineDash(dash);g.beginPath();g.moveTo(...A);g.lineTo(...B);g.stroke();g.setLineDash([]);};
    const poly=(pts,close=true)=>{g.beginPath();pts.map(P).forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));if(close)g.closePath();};
    const dot=(v,col,r=5,label='')=>{const p=P(v);g.fillStyle=col;g.beginPath();g.arc(p[0],p[1],r,0,TAU);g.fill();if(label){g.fillStyle=C.ink;g.font='600 14px system-ui';g.textAlign='left';g.fillText(label,p[0]+8,p[1]-8);}};
    g.clearRect(0,0,o.W,o.H);g.fillStyle=C.sunken;g.fillRect(0,0,o.W,o.H);
    // cone: generators from the apex, and its rim
    const rim=Array.from({length:64},(_,i)=>{const gg=generator(ALPHA,i*TAU/64),k=zTop/Math.cos(ALPHA);return [gg[0]*k,gg[1]*k,gg[2]*k];});
    for(let i=0;i<64;i+=4)line([0,0,0],rim[i],C.line,1);
    g.strokeStyle=C.line;g.lineWidth=1.5;poly(rim);g.stroke();
    // the plane: a translucent quadrilateral around the ellipse
    const E=ellipse(S,160),xs=E.map(p=>p[0]),ys=E.map(p=>p[1]),pad=0.35,X0=Math.min(...xs)-pad,X1=Math.max(...xs)+pad,Y0=Math.min(...ys)-pad,Y1=Math.max(...ys)+pad;
    const onPlane=(x,y)=>[x,y,1-Math.tan(beta)*y];
    poly([onPlane(X0,Y0),onPlane(X1,Y0),onPlane(X1,Y1),onPlane(X0,Y1)]);g.globalAlpha=.18;g.fillStyle=C.c[1];g.fill();g.globalAlpha=1;g.strokeStyle=C.c[1];g.lineWidth=1;g.stroke();
    // spheres (outline circles, orthographic) and their circles of contact with the cone
    if(showSpheres)for(const [s,col] of [[S.low,C.c[0]],[S.high,C.c[2]]]){
      const c=P(s.C);g.beginPath();g.arc(c[0],c[1],s.r*scale,0,TAU);g.globalAlpha=.16;g.fillStyle=col;g.fill();g.globalAlpha=1;g.strokeStyle=col;g.lineWidth=1.6;g.stroke();
      const ring=Array.from({length:64},(_,i)=>{const gg=generator(ALPHA,i*TAU/64);return [gg[0]*s.t,gg[1]*s.t,gg[2]*s.t];});
      g.strokeStyle=col;g.setLineDash([5,4]);g.lineWidth=1.4;poly(ring);g.stroke();g.setLineDash([]);
    }
    // the ellipse
    g.strokeStyle=C.object;g.lineWidth=3;poly(E);g.stroke();
    // P, its generator from T1 to T2, and the two distances to the foci
    if(showSpheres)line(f.T1,f.T2,C.ink,3);
    line(f.P,S.low.F,C.c[0],2.6);line(f.P,S.high.F,C.c[2],2.6);
    dot(S.low.F,C.c[0],5,'F₁');dot(S.high.F,C.c[2],5,'F₂');
    if(showSpheres){dot(f.T1,C.c[0],4,'T₁');dot(f.T2,C.c[2],4,'T₂');}
    dot(f.P,C.object,7,'P');
    MS.set('d',`${num(f.d1)} · ${num(f.d2)}`);MS.set('sum',num(f.sum));MS.set('gen',num(f.T1T2));MS.set('axis',num(majorAxis(S)));
    o.read(`PF₁ + PF₂ ≈ ${num(f.sum)}`);
    return false;
  });
  verdict();
  return ()=>{o.stop();MS.el.remove();};
}
