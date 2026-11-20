// Self-similar fractals built stage by stage (gallery exhibit, issue #36; maths in gallery-selfsimilar-model.js): Cantor set,
// Koch snowflake, Sierpiński carpet, Menger sponge and Sierpiński tetrahedron. The learner predicts, adds one stage at a time,
// reads exact counts and measures in the strip under the figure and follows the measure on a plot; the 3D ones turn by drag.
import {exhibit,palette,dragOrbit,drawFaces} from './gallery-kit.js';
import {illuminateFeedback} from '../motion.js';
import {metricStrip,plotPanel} from './gallery-panels.js';
import {FRACTALS,FRACTAL_IDS,stageFacts,cantorIntervals,kochSnowflake,carpetHoles,mengerFaces,tetrixPieces} from './gallery-selfsimilar-model.js';

const NAMES={cantor:['Ensemble de Cantor','Cantor set'],koch:['Flocon de Koch','Koch snowflake'],carpet:['Tapis de Sierpiński','Sierpiński carpet'],
  menger:['Éponge de Menger','Menger sponge'],tetrix:['Tétraèdre de Sierpiński','Sierpiński tetrahedron']};
// short chip labels (the full name is read in the rule above the figure)
const SHORT={cantor:['Cantor','Cantor'],koch:['Koch','Koch'],carpet:['Tapis','Carpet'],menger:['Éponge','Sponge'],tetrix:['Tétraèdre','Tetrahedron']};
const RULES={cantor:['On coupe chaque segment en trois et on enlève le tiers du milieu.','Cut each segment into three and remove the middle third.'],
  koch:['Sur chaque côté, on remplace le tiers du milieu par deux côtés d’un triangle équilatéral tourné vers l’extérieur.','On each side, replace the middle third by two sides of an equilateral triangle pointing outwards.'],
  carpet:['On coupe chaque carré en 9 et on enlève le carré du centre.','Cut each square into 9 and remove the centre square.'],
  menger:['On coupe chaque cube en 27 et on enlève les 7 cubes qui ne touchent aucune arête : le centre et le centre de chaque face.','Cut each cube into 27 and remove the 7 cubes that touch no edge: the centre and the centre of each face.'],
  tetrix:['On garde, dans chaque tétraèdre, les 4 tétraèdres de moitié taille posés sur ses sommets ; le milieu est vide.','In each tetrahedron, keep the 4 half-size tetrahedra at its corners; the middle is empty.']};
// One question per fractal, answered before building (predict, then check). good: index of the right choice; check: the
// stage from which the figure lets the learner see the answer; why: what the strip shows then.
const PREDICT={
  cantor:{q:['Si l’on recommence sans fin, quelle longueur reste-t-il ?','If this goes on forever, how much length is left?'],choices:[['Une partie de la longueur','Some of the length'],['Aucune','None']],good:1,check:4,
    why:['La longueur gardée est (2/3)ⁿ, qui tend vers 0 ; pourtant il reste une infinité de points (0, 1, 1/3, 2/3…).','The length kept is (2/3)ⁿ, which tends to 0; yet infinitely many points are left (0, 1, 1/3, 2/3…).']},
  koch:{q:['Le périmètre et l’aire grandissent-ils sans limite ?','Do the perimeter and the area grow without limit?'],choices:[['Les deux','Both'],['Le périmètre seulement','Only the perimeter'],['Aucun des deux','Neither']],good:1,check:3,
    why:['Le périmètre est multiplié par 4/3 à chaque étape et tend vers l’infini ; l’aire reste sous 8/5 de celle du triangle.','The perimeter is multiplied by 4/3 at each stage and tends to infinity; the area stays below 8/5 of the triangle’s.']},
  carpet:{q:['À la limite, quelle part de l’aire reste-t-il ?','In the limit, what share of the area is left?'],choices:[['Environ la moitié','About half'],['Rien','Nothing']],good:1,check:4,
    why:['L’aire gardée est (8/9)ⁿ, qui tend vers 0, même si elle diminue lentement.','The area kept is (8/9)ⁿ, which tends to 0, even though it shrinks slowly.']},
  menger:{q:['À force de percer, le volume finit-il par disparaître ?','By drilling again and again, does the volume vanish?'],choices:[['Oui','Yes'],['Non','No']],good:0,check:3,
    why:['Le volume est (20/27)ⁿ et tend vers 0. L’éponge limite n’est pas vide pour autant : elle contient toutes les arêtes du cube.','The volume is (20/27)ⁿ and tends to 0. The limit sponge is not empty though: it contains every edge of the cube.']},
  tetrix:{q:['Un objet de l’espace peut-il avoir une dimension égale à 2 ?','Can an object in space have dimension equal to 2?'],choices:[['Oui','Yes'],['Non','No']],good:0,check:3,
    why:['4 copies au rapport 1/2 : 4 = 2², donc D = 2. Son volume tend vers 0 mais l’aire de ses faces ne change jamais.','4 copies at ratio 1/2: 4 = 2², so D = 2. Its volume tends to 0 but the area of its faces never changes.']}};

export function selfSimilar(root,opts){
  const {t,lang}=opts,loc=lang==='fr'?'fr-FR':'en-GB';
  const nf={},num=(v,d=4)=>(nf[d]||=new Intl.NumberFormat(loc,{maximumSignificantDigits:d})).format(v),big=v=>v.toLocaleString(loc);
  const VIEWS={menger:{yaw:-.55,pitch:.55},tetrix:{yaw:.45,pitch:.15}};
  let id='menger',n=0;const view={...VIEWS.menger},answer={};   // answer[id]: the choice made before building
  const chips=FRACTAL_IDS.map(k=>`<label><input type="radio" name="ss-id" value="${k}"${k===id?' checked':''}> ${t(...SHORT[k])}</label>`).join('');
  const o=exhibit(root,opts,`<span id="ss-rule"></span>`,
    `<fieldset class="act-choice"><legend>${t('Fractale','Fractal')}</legend>${chips}</fieldset>
     <fieldset class="act-choice ss-predict"><legend id="ss-q"></legend><span id="ss-choices"></span></fieldset>
     <p class="feedback" id="ss-verdict" role="status"></p>
     <div class="act-buttons"><button type="button" class="btn btn-secondary" id="ss-less">${t('Étape précédente','Previous stage')}</button>
     <button type="button" class="btn btn-primary" id="ss-more">${t('Étape suivante','Next stage')}</button>
     <button type="button" class="btn btn-secondary" id="ss-turn">${t('Tourner la vue','Turn the view')}</button></div>`,
    `<ol>
      <li>${t('Compter : à l’étape n, combien de morceaux ? Chacun est N fois plus nombreux à l’étape suivante, d’où Nⁿ.','Count: at stage n, how many pieces? There are N times more at the next stage, hence Nⁿ.')}</li>
      <li>${t('Mesurer : chaque morceau est réduit du rapport r, donc sa longueur, son aire ou son volume est multiplié par r, r² ou r³. La mesure totale est (N·r^E)ⁿ, une suite géométrique : elle tend vers 0 si N·r^E < 1.','Measure: each piece is scaled by r, so its length, area or volume is multiplied by r, r² or r³. The total measure is (N·r^E)ⁿ, a geometric sequence: it tends to 0 when N·r^E < 1.')}</li>
      <li>${t('Dimension : un carré coupé au rapport 1/3 donne 9 = 3² copies, un cube 27 = 3³. Pour une figure faite de N copies au rapport r, on cherche D avec N = (1/r)^D, soit D = log N / log(1/r).','Dimension: a square scaled by 1/3 gives 9 = 3² copies, a cube 27 = 3³. For a figure made of N copies at ratio r, look for D with N = (1/r)^D, that is D = log N / log(1/r).')}</li>
      <li>${t('Théorème (Moran 1946, Hutchinson 1981) : quand les copies ne se chevauchent pas (condition de l’ouvert, vérifiée par les cinq figures), la dimension de Hausdorff de la figure limite est exactement ce D. Une étape finie n’est pas la fractale : c’est la limite qui a cette dimension.','Theorem (Moran 1946, Hutchinson 1981): when the copies do not overlap (the open set condition, which holds for all five figures), the Hausdorff dimension of the limit figure is exactly this D. A finite stage is not the fractal: the limit has this dimension.')}</li>
      <li>${t('À toi : un fractal fait de 5 copies au rapport 1/3 (croix de Vicsek). Quelle est sa dimension, et quelle aire reste-t-il à l’étape 3 ? (log 5 / log 3 ≈ 1,465 ; (5/9)³ ≈ 0,171.)','Your turn: a fractal made of 5 copies at ratio 1/3 (Vicsek cross). What is its dimension, and how much area is left at stage 3? (log 5 / log 3 ≈ 1.465; (5/9)³ ≈ 0.171.)')}</li>
    </ol>
    <p>${t('Autres fractales du site : ','Other fractals on this site: ')}<a href="#gallery/mandelbrot">${t('Mandelbrot et Julia (itération dans le plan complexe)','Mandelbrot and Julia (iteration in the complex plane)')}</a> · <a href="#gallery/chaos">${t('jeu du chaos (le triangle de Sierpiński tiré au hasard)','chaos game (the Sierpiński triangle drawn at random)')}</a>.</p>`);
  // Layout (phone first): choice and question above the figure, stage buttons right under it, then the measures, so the
  // learner never scrolls away from the figure to build the next stage.
  const g=o.g,stage=root.querySelector('.exhibit-stage'),controls=root.querySelector('.exhibit-controls'),top=document.createElement('div');
  top.className='exhibit-band ss-top';controls.classList.add('exhibit-band');top.append(...[...controls.children].filter(el=>!el.matches('.act-buttons')));stage.before(top);stage.after(controls);
  const MS=metricStrip(controls,t,[{id:'p',label:t('Morceaux','Pieces'),kind:'exact'},{id:'s',label:t('Taille d’un morceau','Size of a piece'),kind:'exact'},
    {id:'m',label:t('Mesure gardée','Measure kept'),kind:'exact'},{id:'x',label:t('À noter','Worth noting'),kind:'exact'},{id:'d',label:t('Dimension de la limite','Dimension of the limit'),kind:'exact'}]);
  const PP=plotPanel(MS.el,t('Mesure de l’étape n rapportée à l’étape 0, un point par étape, calculée exactement. La ligne pointillée est la limite quand elle est finie.','Measure of stage n relative to stage 0, one point per stage, computed exactly. The dotted line is the limit when it is finite.'));
  let faces=null,facesKey='';
  const sync=()=>{
    const F=FRACTALS[id],f=stageFacts(id,n),meas=t(...F.measure);
    root.querySelector('#ss-rule').textContent=`${t(...NAMES[id])} : ${t(...RULES[id])}`.replace(' : ',lang==='fr'?' : ':': ');
    root.querySelector('#ss-turn').hidden=FRACTALS[id].E<3;root.querySelector('#ss-less').disabled=n===0;root.querySelector('#ss-more').disabled=n===F.max;
    question();
    const rr=F.r===1/3?'1/3':'1/2',den=F.r===1/3?3:2;
    MS.set('p',id==='koch'?`3 × 4${sup(n)} = ${big(f.pieces)} ${t('côtés','sides')}`:`${F.N}${sup(n)} = ${big(f.pieces)}`);
    MS.set('s',n?`(${rr})${sup(n)} = 1/${big(den**n)}`:'1');
    MS.set('m',id==='koch'?`${meas} × (4/3)${sup(n)} ≈ ${num(f.measure)} → ∞`:`${meas} × (${id==='tetrix'?'1/2':`${F.N}/${den**F.E}`})${sup(n)} ≈ ${num(f.measure)} → 0`);
    MS.set('x',id==='koch'?t(`aire × ${num(f.area)} → 8/5`,`area × ${num(f.area)} → 8/5`):id==='tetrix'?t('aire des faces : toujours la même','face area: always the same'):id==='menger'?t(`aire des faces × ${num((2*(20/9)**n+4*(8/9)**n)/6)} → ∞`,`face area × ${num((2*(20/9)**n+4*(8/9)**n)/6)} → ∞`):id==='carpet'?t(`${big((8**n-1)/7)} trous`,`${big((8**n-1)/7)} holes`):t('à la limite : une infinité de points','in the limit: infinitely many points'));
    MS.set('d',`log ${F.N} / log ${den} ${id==='tetrix'?'=':'≈'} ${num(f.dim,5)} (${t('espace','space')} ${F.E})`);
    const pts=Array.from({length:F.max+1},(_,k)=>[k,stageFacts(id,k).measure]),ymax=Math.max(...pts.map(q=>q[1]));
    const series=[{points:pts,color:'object',dots:true}];
    if(id==='koch')series.push({points:Array.from({length:F.max+1},(_,k)=>[k,stageFacts('koch',k).area]),color:'muted',dots:true},{points:[[0,1.6],[F.max,1.6]],color:'muted',dash:[4,4],width:1,dots:false});
    else series.unshift({points:[[0,0],[F.max,0]],color:'muted',dash:[4,4],width:1,dots:false});
    PP.draw({xMax:F.max,xTicks:Array.from({length:F.max+1},(_,k)=>k),yMax:ymax,xLabel:'n',yLabel:id==='koch'?t('périmètre (points pleins) et aire','perimeter (filled dots) and area'):meas,yFormat:v=>num(v,3),marker:[n,stageFacts(id,n).measure],series});
    o.redraw();
  };
  // The question: asked before building, answered from the stage `check` on, with the strip as evidence.
  let asked='';
  function question(){
    const P=PREDICT[id],box=root.querySelector('#ss-choices'),fb=root.querySelector('#ss-verdict'),a=answer[id];
    if(asked!==id){asked=id;root.querySelector('#ss-q').textContent=t(...P.q);
      box.innerHTML=P.choices.map((c,i)=>`<label><input type="radio" name="ss-guess" value="${i}"${a===i?' checked':''}> ${t(...c)}</label>`).join('');
      box.querySelectorAll('input').forEach(r=>o.on(r,'change',()=>{answer[id]=Number(r.value);question();}));}
    let text='',cls='';
    if(a==null)text=t('Choisis une réponse avant de construire les étapes.','Choose an answer before building the stages.');
    else if(n<P.check)text=t(`Réponse notée. Construis jusqu’à l’étape ${P.check} et lis la mesure pour vérifier.`,`Answer noted. Build up to stage ${P.check} and read the measure to check.`);
    else{const ok=a===P.good;cls=ok?'success':'error';text=(ok?t('Bien vu. ','Well spotted. '):t('Pas tout à fait. ','Not quite. '))+t(...P.why);}
    if(fb.textContent!==text){const was=fb.className;fb.className='feedback'+(cls?' '+cls:'');fb.textContent=text;if(cls&&was!==fb.className)illuminateFeedback(fb,opts.reduced);}
  }
  const sup=k=>String(k).split('').map(d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('');
  root.querySelectorAll('[name=ss-id]').forEach(r=>o.on(r,'change',()=>{id=r.value;n=0;Object.assign(view,VIEWS[id]||{});sync();}));
  o.on(root.querySelector('#ss-less'),'click',()=>{if(n>0){n--;sync();}});
  o.on(root.querySelector('#ss-more'),'click',()=>{if(n<FRACTALS[id].max){n++;sync();}});
  dragOrbit(o,view);
  o.on(root.querySelector('#ss-turn'),'click',()=>{view.yaw+=Math.PI/6;o.redraw();});   // the tap alternative to dragging
  o.on(o.cv,'keydown',e=>{if(e.key==='+'||e.key==='-'){e.preventDefault();n=Math.max(0,Math.min(FRACTALS[id].max,n+(e.key==='+'?1:-1)));sync();}});
  o.cv.setAttribute('aria-label',t('Fractale. Plus et moins changent d’étape ; pour les figures en 3D, glisser ou les flèches font tourner la vue.','Fractal. Plus and minus change the stage; for the 3D figures, drag or use the arrow keys to turn the view.'));

  const draw3D=(C,polys,scale)=>drawFaces(g,C,polys,view,scale);
  o.animate(()=>{
    const C=palette();g.clearRect(0,0,o.W,o.H);g.fillStyle=C.sunken;g.fillRect(0,0,o.W,o.H);
    if(id==='cantor'){
      const x0=40,w=o.W-80,rows=n+1,h=Math.min(26,300/rows),gap=Math.min(22,(o.H-60-rows*h)/Math.max(1,rows-1));
      for(let k=0;k<=n;k++){g.fillStyle=k===n?C.object:C.muted;for(const [a,b] of cantorIntervals(k))g.fillRect(x0+a*w,30+k*(h+gap),Math.max(.6,(b-a)*w),h);}
    }else if(id==='koch'){
      const P=kochSnowflake(n),S=300,cx=o.W/2-S/2,cy=o.H/2+S*Math.sqrt(3)/6;
      g.beginPath();P.forEach(([x,y],i)=>i?g.lineTo(cx+x*S,cy-y*S):g.moveTo(cx+x*S,cy-y*S));g.closePath();g.fillStyle=C.objectSoft||C.surface;g.fill();g.strokeStyle=C.object;g.lineWidth=n>4?1:2;g.stroke();
    }else if(id==='carpet'){
      const S=380,x0=(o.W-S)/2,y0=(o.H-S)/2;g.fillStyle=C.object;g.fillRect(x0,y0,S,S);g.fillStyle=C.sunken;
      for(const [x,y,s] of carpetHoles(n))g.fillRect(x0+x*S,y0+y*S,s*S,s*S);
    }else if(id==='menger'){
      const key=`m${n}`;if(facesKey!==key){facesKey=key;faces=mengerFaces(n).map(F=>{const h=F.s/2,pts=[[-h,-h],[h,-h],[h,h],[-h,h]].map(([u,v])=>{const p=[...F.c],ax=[0,1,2].filter(a=>a!==F.ax);p[ax[0]]+=u;p[ax[1]]+=v;return p;});const nn=[0,0,0];nn[F.ax]=F.sg;return {pts,normal:nn,shade:F.ax};});}
      draw3D(C,faces,230);
    }else{
      const key=`t${n}`;if(facesKey!==key){facesKey=key;faces=[];const c=[.5,Math.sqrt(3)/6,Math.sqrt(2/3)/4];
        for(const T of tetrixPieces(n))for(let i=0;i<4;i++){const tri=T.filter((_,j)=>j!==i).map(v=>[v[0]-c[0],v[1]-c[1],v[2]-c[2]]),opp=T[i].map((v,k)=>v-c[k]);
          const u=tri[1].map((v,k)=>v-tri[0][k]),w=tri[2].map((v,k)=>v-tri[0][k]);let nn=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]];
          const toOpp=opp.map((v,k)=>v-tri[0][k]);if(nn[0]*toOpp[0]+nn[1]*toOpp[1]+nn[2]*toOpp[2]>0)nn=nn.map(x=>-x);faces.push({pts:tri,normal:nn,shade:i});}}
      draw3D(C,faces,330);
    }
    o.read(`${t(...NAMES[id])} · ${t('étape','stage')} ${n}`);
    return false;
  });
  sync();
  const stop=o.stop;
  return ()=>{stop();PP.stop();MS.el.remove();};
}
