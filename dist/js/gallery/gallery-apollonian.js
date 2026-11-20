// The Apollonian gasket (gallery exhibit, issue #36; maths in gallery-apollonian-model.js): in every gap between three
// touching circles, put the circle that touches all three; repeat. Descartes' theorem gives the new curvature, which stays a
// whole number. Stage buttons, a touch picks a circle and shows Descartes' relation with the three circles it touches.
import {exhibit,palette} from './gallery-kit.js';
import {illuminateFeedback} from '../motion.js';
import {metricStrip,plotPanel} from './gallery-panels.js';
import {gasket,count,coverage,descartes,DIMENSION_ESTIMATE} from './gallery-apollonian-model.js';

const MAX=7;
export function apollonianGasket(root,opts){
  const {t,lang}=opts,loc=lang==='fr'?'fr-FR':'en-GB',num=(v,d=4)=>v.toLocaleString(loc,{maximumFractionDigits:d});
  let n=2,pick=null,answer=null;
  const o=exhibit(root,opts,t('Dans le grand cercle, quatre cercles se touchent deux à deux. Dans chaque espace entre trois cercles qui se touchent, on place le cercle qui touche les trois. On recommence dans les nouveaux espaces. Le nombre écrit dans un cercle est sa courbure : l’inverse de son rayon.','Inside the big circle, four circles touch each other in pairs. In every gap between three touching circles, place the circle that touches all three. Repeat in the new gaps. The number written in a circle is its curvature: one over its radius.'),
    `<fieldset class="act-choice"><legend>${t('Les premières courbures sont 2, 2, 3, 3. En continuant, les courbures…','The first curvatures are 2, 2, 3, 3. Going on, the curvatures…')}</legend>
       ${[t('ne sont bientôt plus des nombres entiers','soon stop being whole numbers'),t('restent toutes des nombres entiers','all stay whole numbers')].map((c,i)=>`<label><input type="radio" name="ap-guess" value="${i}"> ${c}</label>`).join('')}</fieldset>
     <p class="feedback" id="ap-verdict" role="status"></p>
     <div class="act-buttons"><button type="button" class="btn btn-secondary" id="ap-less">${t('Étape précédente','Previous stage')}</button><button type="button" class="btn btn-primary" id="ap-more">${t('Étape suivante','Next stage')}</button></div>`,
    `<ol>
      <li>${t('Théorème de Descartes (1643) : pour quatre cercles qui se touchent deux à deux, de courbures k₁, k₂, k₃, k₄ (le cercle extérieur compte négativement), (k₁ + k₂ + k₃ + k₄)² = 2(k₁² + k₂² + k₃² + k₄²). Touche un cercle : la relation est calculée avec les trois cercles qu’il touche.','Descartes’ theorem (1643): for four circles touching in pairs, with curvatures k₁, k₂, k₃, k₄ (the outer circle counts negative), (k₁ + k₂ + k₃ + k₄)² = 2(k₁² + k₂² + k₃² + k₄²). Touch a circle: the relation is computed with the three circles it touches.')}</li>
      <li>${t('Trois cercles fixés, l’équation en k₄ est du second degré : ses deux solutions k₄ et k₄′ vérifient k₄ + k₄′ = 2(k₁ + k₂ + k₃). Le nouveau cercle d’un espace a donc la courbure 2(k₁ + k₂ + k₃) − k₄ : en partant d’entiers, on ne fabrique que des entiers.','With three circles fixed, the equation in k₄ is quadratic: its two solutions k₄ and k₄′ satisfy k₄ + k₄′ = 2(k₁ + k₂ + k₃). So the new circle of a gap has curvature 2(k₁ + k₂ + k₃) − k₄: starting from whole numbers, only whole numbers are made.')}</li>
      <li>${t('Compter : 4 cercles au départ, 4 de plus à l’étape 1, puis chaque nouveau cercle ouvre 3 espaces : 4 + 2(3ⁿ − 1) cercles à l’étape n.','Count: 4 circles at the start, 4 more at stage 1, then each new circle opens 3 gaps: 4 + 2(3ⁿ − 1) circles at stage n.')}</li>
      <li>${t('L’aire couverte se rapproche de tout le disque : ce qui reste à la limite, la « baderne » d’Apollonius, a une aire nulle. Sa dimension n’a pas de formule ; McMullen (1998) l’a calculée numériquement : environ 1,3057. C’est une estimation, pas une valeur exacte.','The area covered gets closer and closer to the whole disc: what is left in the limit, the Apollonian gasket, has zero area. Its dimension has no formula; McMullen (1998) computed it numerically: about 1.3057. It is an estimate, not an exact value.')}</li>
      <li>${t('À toi : trois cercles de courbures −1, 2, 3 touchent un cercle de courbure 6. Quelle est l’autre solution ? (2(−1 + 2 + 3) − 6 = 2.)','Your turn: three circles of curvatures −1, 2, 3 touch a circle of curvature 6. What is the other solution? (2(−1 + 2 + 3) − 6 = 2.)')}</li>
    </ol>
    <p>${t('Voir aussi : ','See also: ')}<a href="#gallery/self-similar">${t('fractales construites étape par étape','fractals built stage by stage')}</a></p>`);
  const g=o.g,stage=root.querySelector('.exhibit-stage'),controls=root.querySelector('.exhibit-controls'),top=document.createElement('div');
  top.className='exhibit-band';controls.classList.add('exhibit-band');
  top.append(...[...controls.children].filter(el=>el.matches('fieldset, .feedback')));stage.before(top);stage.after(controls);
  const MS=metricStrip(controls,t,[{id:'c',label:t('Cercles','Circles'),kind:'exact'},{id:'k',label:t('Plus grande courbure ajoutée','Largest curvature added'),kind:'exact'},{id:'a',label:t('Part du disque couverte','Share of the disc covered'),kind:'exact'},{id:'p',label:t('Cercle choisi','Chosen circle'),kind:'exact'},{id:'d',label:t('Dimension de la limite','Dimension of the limit'),kind:'approx'}]);
  const PP=plotPanel(MS.el,t('Part du disque couverte à chaque étape, calculée exactement (somme des 1/k²). Elle tend vers 1 : la limite a une aire nulle.','Share of the disc covered at each stage, computed exactly (sum of 1/k²). It tends to 1: the limit has zero area.'),{t});
  const fb=root.querySelector('#ap-verdict');
  function verdict(){let text,cls='';
    if(answer==null)text=t('Choisis une réponse, puis construis les étapes.','Choose an answer, then build the stages.');
    else if(n<3)text=t('Réponse notée. Construis jusqu’à l’étape 3 et lis les courbures.','Answer noted. Build up to stage 3 and read the curvatures.');
    else{const ok=answer===1;cls=ok?'success':'error';text=(ok?t('Bien vu. ','Well spotted. '):t('Pas tout à fait. ','Not quite. '))+t('Le nouveau cercle d’un espace a la courbure 2(k₁ + k₂ + k₃) − k₄ (théorème de Descartes) : des entiers donnent des entiers, à toutes les étapes.','The new circle of a gap has curvature 2(k₁ + k₂ + k₃) − k₄ (Descartes’ theorem): whole numbers give whole numbers, at every stage.');}
    if(fb.textContent!==text){const was=fb.className;fb.className='feedback'+(cls?' '+cls:'');fb.textContent=text;if(cls&&was!==fb.className)illuminateFeedback(fb,opts.reduced);}}
  root.querySelectorAll('[name=ap-guess]').forEach(r=>o.on(r,'change',()=>{answer=+r.value;verdict();}));
  let C=gasket(n);
  function sync(){C=gasket(n);root.querySelector('#ap-less').disabled=n===0;root.querySelector('#ap-more').disabled=n===MAX;
    MS.set('c',`4 + 2 × (3${'⁰¹²³⁴⁵⁶⁷'[n]} − 1) = ${count(n).toLocaleString(loc)}`);MS.set('k',String(Math.max(...C.filter(c=>c.gen===n).map(c=>c.k))));
    MS.set('a',num(coverage(C)));MS.set('d',t(`≈ ${num(DIMENSION_ESTIMATE)} (estimation numérique publiée)`,`≈ ${num(DIMENSION_ESTIMATE)} (published numerical estimate)`));
    if(pick&&pick.touch){const ks=[pick.k,...pick.touch.map(c=>c.k)],s=ks.reduce((a,b)=>a+b,0),q=ks.reduce((a,b)=>a+b*b,0);
      MS.set('p',t(`k = ${pick.k}, touche ${pick.touch.map(c=>c.k).join(', ')} : (${ks.join(' + ').replace(/\+ -/g,'− ')})² = ${s*s} = 2 × ${q}`,`k = ${pick.k}, touches ${pick.touch.map(c=>c.k).join(', ')}: (${ks.join(' + ').replace(/\+ -/g,'− ')})² = ${s*s} = 2 × ${q}`));void descartes;}
    else MS.set('p',pick?t(`k = ${pick.k} (cercle de départ)`,`k = ${pick.k} (starting circle)`):t('touche un cercle','touch a circle'));
    PP.draw({xMax:MAX,xTicks:[0,1,2,3,4,5,6,7],yMin:.5,yMax:1,yFormat:v=>num(v,2),xLabel:t('étape n','stage n'),yLabel:t('part couverte','share covered'),
      series:[{points:[[0,1],[MAX,1]],color:'muted',dash:[4,4],width:1,dots:false},{points:Array.from({length:MAX+1},(_,k)=>[k,coverage(gasket(k))]),color:'object',dots:true}],marker:[n,coverage(C)]});
    verdict();o.redraw();}
  o.on(root.querySelector('#ap-less'),'click',()=>{if(n>0){n--;pick=null;sync();}});o.on(root.querySelector('#ap-more'),'click',()=>{if(n<MAX){n++;sync();}});
  o.on(o.cv,'keydown',e=>{if(e.key==='+'||e.key==='-'){e.preventDefault();n=Math.max(0,Math.min(MAX,n+(e.key==='+'?1:-1)));sync();}});
  const R=()=>Math.min(o.W,o.H)/2-12,X=z=>[o.W/2+z[0]*R(),o.H/2-z[1]*R()];
  o.touchHit(()=>true);
  o.on(o.cv,'pointerdown',e=>{const r=o.cv.getBoundingClientRect(),p=[(e.clientX-r.left)*o.W/r.width,(e.clientY-r.top)*o.H/r.height],z=[(p[0]-o.W/2)/R(),-(p[1]-o.H/2)/R()];
    pick=C.filter(c=>c.k>0&&Math.hypot(z[0]-c.z[0],z[1]-c.z[1])<1/c.k).sort((a,b)=>b.k-a.k)[0]||null;sync();});
  o.cv.setAttribute('aria-label',t('Baderne d’Apollonius. Plus et moins changent d’étape ; toucher un cercle affiche la relation de Descartes.','Apollonian gasket. Plus and minus change the stage; touching a circle shows Descartes’ relation.'));
  o.animate(()=>{
    const P=palette();g.clearRect(0,0,o.W,o.H);g.fillStyle=P.sunken;g.fillRect(0,0,o.W,o.H);
    const r0=R(),[cx,cy]=X([0,0]);g.fillStyle=P.surface;g.beginPath();g.arc(cx,cy,r0,0,6.3);g.fill();g.strokeStyle=P.ink;g.lineWidth=2;g.stroke();
    const z=Math.max(1,Math.min(2.2,640/(o.cv.clientWidth||640)));
    for(const c of C){if(c.k<0)continue;const r=r0/c.k;if(r<.3)continue;const [x,y]=X(c.z);
      g.beginPath();g.arc(x,y,r,0,6.3);g.globalAlpha=c.gen===n&&n>0?.55:.28;g.fillStyle=P.c[c.gen%6];g.fill();g.globalAlpha=1;g.strokeStyle=c===pick?P.object:P.ink;g.lineWidth=c===pick?3:r>6?1.2:.6;g.stroke();
      const fs=Math.min(r*.8,15*z);if(fs>=8){g.fillStyle=P.ink;g.font=`600 ${Math.round(fs)}px system-ui`;g.textAlign='center';g.textBaseline='middle';g.fillText(String(c.k),x,y);}}
    if(pick?.touch)for(const c of pick.touch){const [x,y]=X(c.z),r=r0/Math.abs(c.k);g.strokeStyle=P.object;g.setLineDash([5,4]);g.lineWidth=2;g.beginPath();g.arc(x,y,r,0,6.3);g.stroke();g.setLineDash([]);}
    o.read(t(`Étape ${n} : ${count(n)} cercles`,`Stage ${n}: ${count(n)} circles`));
    return false;
  });
  sync();
  return ()=>{o.stop();PP.stop();MS.el.remove();};
}
