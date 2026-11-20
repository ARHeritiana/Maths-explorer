// Polyhedra by transformation (gallery exhibit, issue #35; maths in gallery-polyhedra-model.js): one slider cuts the
// corners of a Platonic solid deeper and deeper, through the Archimedean solids, to its dual. Faces keep the colour of
// their origin (old face or cut), the strip counts V, E, F and the face types at every depth, and a question asks for
// the end shape before the learner gets there.
import {exhibit,palette,dragOrbit,drawFaces} from './gallery-kit.js';
import {illuminateFeedback} from '../motion.js';
import {metricStrip} from './gallery-panels.js';
import {FAMILIES,SOLID_IDS,family,cut,facts,stops,hAt} from './gallery-polyhedra-model.js';

const SNAP=.012;   // a slider value this close to a named stop lands on it
const KIND_SHADE={face:0,cut:1};
export function polyhedraFamily(root,opts){
  const {t,lang}=opts;
  let id='cube',depth=0,ghost=false;const view={yaw:-.6,pitch:.5},answer={};
  const name=k=>t(...FAMILIES[id].names[k]),an=w=>(/^[aeiou]/i.test(w)?'an ':'a ')+w;
  const o=exhibit(root,opts,`<span id="ph-rule"></span>`,
    `<fieldset class="act-choice"><legend>${t('Solide de départ','Starting solid')}</legend>${SOLID_IDS.map(k=>`<label><input type="radio" name="ph-id" value="${k}"${k===id?' checked':''}> ${t(...FAMILIES[k].names[0])}</label>`).join('')}</fieldset>
     <fieldset class="act-choice"><legend id="ph-q"></legend><span id="ph-choices"></span></fieldset>
     <p class="feedback" id="ph-verdict" role="status"></p>
     <div class="act-buttons ph-depth"><label class="ph-slider"><span>${t('Profondeur de la coupe','Depth of the cut')}</span>
       <input type="range" id="ph-t" min="0" max="1000" step="1" value="0"></label></div>
     <div class="act-buttons" id="ph-stops"></div>
     <div class="act-buttons"><button type="button" class="btn btn-secondary" id="ph-ghost" aria-pressed="false">${t('Montrer le dual en pointillés','Show the dual, dotted')}</button>
       <button type="button" class="btn btn-secondary" id="ph-turn">${t('Tourner la vue','Turn the view')}</button></div>`,
    `<ol>
      <li>${t('Chaque coupe est un plan perpendiculaire à la direction d’un sommet. Tant qu’elle est peu profonde, elle remplace le sommet par un petit polygone : q faces se rejoignaient au sommet, la coupe a q côtés.','Each cut is a plane perpendicular to the direction of a vertex. While it is shallow, it replaces the vertex by a small polygon: q faces met at the vertex, so the cut has q sides.')}</li>
      <li>${t('À une profondeur précise, toutes les arêtes ont la même longueur : c’est un solide archimédien (cube tronqué, icosaèdre tronqué…). Entre deux arrêts, les faces ne sont pas régulières.','At one precise depth, every edge has the same length: that is an Archimedean solid (truncated cube, truncated icosahedron…). Between two stops, the faces are not regular.')}</li>
      <li>${t('Quand les coupes se touchent au milieu des arêtes, les anciennes arêtes ont disparu : c’est le solide « rectifié » (cuboctaèdre, icosidodécaèdre).','When the cuts meet at the midpoints of the edges, the old edges are gone: this is the “rectified” solid (cuboctahedron, icosidodecahedron).')}</li>
      <li>${t('Les plans de coupe sont exactement les faces du solide dual. À la fin, les anciennes faces se réduisent à des points : il ne reste que le dual. Les sommets deviennent des faces et les faces des sommets : V et F s’échangent, E reste le même.','The cutting planes are exactly the faces of the dual solid. At the end, the old faces shrink to points: only the dual is left. Vertices become faces and faces become vertices: V and F swap, E stays the same.')}</li>
      <li>${t('Euler : V − E + F = 2 à chaque profondeur, même quand les faces ne sont pas régulières. À toi : le ballon de football est l’icosaèdre tronqué. Chaque sommet de l’icosaèdre (12, avec 5 faces) devient un pentagone. Combien de sommets, d’arêtes et de faces ? (60, 90, 32.)','Euler: V − E + F = 2 at every depth, even when the faces are not regular. Your turn: a football is a truncated icosahedron. Each vertex of the icosahedron (12, with 5 faces) becomes a pentagon. How many vertices, edges and faces? (60, 90, 32.)')}</li>
    </ol>
    <p>${t('Voir aussi : ','See also: ')}<a href="#gallery/platonic">${t('les cinq solides de Platon, leurs patrons et pourquoi il n’y en a que cinq','the five Platonic solids, their nets and why there are only five')}</a>.</p>`);
  const g=o.g,stage=root.querySelector('.exhibit-stage'),controls=root.querySelector('.exhibit-controls'),top=document.createElement('div');
  top.className='exhibit-band';controls.classList.add('exhibit-band');
  top.append(...[...controls.children].filter(el=>el.matches('fieldset, .feedback')));stage.before(top);stage.after(controls);
  const legend=document.createElement('p');legend.className='exhibit-band ph-legend';controls.after(legend);
  const MS=metricStrip(legend,t,[{id:'name',label:t('Solide','Solid')},{id:'vef',label:t('Sommets V, arêtes E, faces F','Vertices V, edges E, faces F'),kind:'exact'},
    {id:'euler',label:'V − E + F',kind:'exact'},{id:'types',label:t('Faces','Faces'),kind:'exact'},{id:'reg',label:t('Arêtes','Edges'),kind:'exact'}]);
  const slider=root.querySelector('#ph-t'),stopBox=root.querySelector('#ph-stops');
  let F=family(id),ST=stops(F),P=null,dual=null;
  const POLY=n=>t({3:'triangle',4:'carré',5:'pentagone',6:'hexagone',8:'octogone',10:'décagone'}[n]||`${n}-gone`,{3:'triangle',4:'square',5:'pentagon',6:'hexagon',8:'octagon',10:'decagon'}[n]||`${n}-gon`);
  const plural=(k,w)=>k>1?(lang==='fr'?w.replace(/^(\S+)/,m=>m+'s'):w+'s'):w;
  function build(){
    F=family(id);ST=stops(F);
    stopBox.innerHTML=ST.map((s,k)=>`<button type="button" class="btn btn-secondary" data-stop="${k}">${name(k)}</button>`).join('');
    stopBox.querySelectorAll('[data-stop]').forEach(b=>o.on(b,'click',()=>{depth=ST[+b.dataset.stop];sync();}));
    const D=cut(F,hAt(F,1));dual=D;
    root.querySelector('#ph-rule').textContent=t(`${name(0)} : fais glisser la profondeur, ou choisis un arrêt. Les faces d’origine et les faces de coupe ont deux couleurs.`,`${name(0)}: slide the depth, or choose a stop. The original faces and the cut faces have two colours.`);
    question(true);
  }
  // The question: which solid is left when the cuts go all the way?
  function question(fresh){
    const box=root.querySelector('#ph-choices'),fb=root.querySelector('#ph-verdict'),self=FAMILIES[id].dual===id;
    const choices=self?[[t('Un tétraèdre, retourné','A tetrahedron, upside down')],[t('Un octaèdre','An octahedron')],[t('Une boule','A ball')]]:[[t(`Un ${name(0).toLowerCase()} plus petit`,`A smaller ${name(0).toLowerCase()}`)],[name(4)],[t('Une boule','A ball')]];
    const good=self?0:1;
    if(fresh){root.querySelector('#ph-q').textContent=t('Si l’on coupe les coins jusqu’au bout, quel solide reste-t-il ?','If the corners are cut all the way, which solid is left?');
      box.innerHTML=choices.map((c,i)=>`<label><input type="radio" name="ph-guess" value="${i}"${answer[id]===i?' checked':''}> ${c[0]}</label>`).join('');
      box.querySelectorAll('input').forEach(r=>o.on(r,'change',()=>{answer[id]=+r.value;question(false);}));}
    const a=answer[id];let text,cls='';
    if(a==null)text=t('Choisis une réponse avant d’aller au bout.','Choose an answer before going all the way.');
    else if(depth<1-1e-9)text=t('Réponse notée. Va jusqu’au bout de la profondeur pour vérifier.','Answer noted. Go to the full depth to check.');
    else{const ok=a===good;cls=ok?'success':'error';
      text=(ok?t('Bien vu. ','Well spotted. '):t('Pas tout à fait. ','Not quite. '))+t(`Il reste ${self?'un tétraèdre retourné':'un '+name(4).toLowerCase()} : les plans de coupe sont les faces du dual. Au passage, chaque sommet est devenu une face.`,`What is left is ${self?'an upside-down tetrahedron':an(name(4).toLowerCase())}: the cutting planes are the faces of the dual. On the way, each vertex became a face.`);}
    if(fb.textContent!==text){const was=fb.className;fb.className='feedback'+(cls?' '+cls:'');fb.textContent=text;if(cls&&was!==fb.className)illuminateFeedback(fb,opts.reduced);}
  }
  function sync(){
    for(const s of ST)if(Math.abs(depth-s)<SNAP)depth=s;
    slider.value=String(Math.round(depth*1000));
    slider.setAttribute('aria-valuetext',`${Math.round(depth*100)} %`);
    P=cut(F,hAt(F,depth));const f=facts(P),k=ST.findIndex(s=>Math.abs(s-depth)<1e-9);
    stopBox.querySelectorAll('[data-stop]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.stop===k)));
    const between=ST.findIndex(s=>s>depth);
    MS.set('name',k>=0?name(k):t(`entre ${name(between-1)} et ${name(between)}`,`between ${name(between-1)} and ${name(between)}`));
    MS.set('vef',`${f.V} · ${f.E} · ${f.F}`);MS.set('euler',`${f.V} − ${f.E} + ${f.F} = ${f.euler}`);
    MS.set('types',Object.entries(f.types).sort((a,b)=>a[0]-b[0]).map(([n,c])=>`${c} ${plural(c,POLY(+n))}`).join(' + '));
    MS.set('reg',f.equal?t('toutes de même longueur','all the same length'):t('deux longueurs différentes','two different lengths'));
    legend.innerHTML=`<span class="ph-swatch" style="background:${palette().c[0]}"></span> ${t('faces d’origine','original faces')} <span class="ph-swatch" style="background:${palette().c[1]}"></span> ${t('faces de coupe','cut faces')}`;
    question(false);o.redraw();
  }
  o.on(slider,'input',()=>{depth=+slider.value/1000;sync();});
  root.querySelectorAll('[name=ph-id]').forEach(r=>o.on(r,'change',()=>{id=r.value;depth=0;build();sync();}));
  const gb=root.querySelector('#ph-ghost');o.on(gb,'click',()=>{ghost=!ghost;gb.setAttribute('aria-pressed',String(ghost));o.redraw();});
  o.on(root.querySelector('#ph-turn'),'click',()=>{view.yaw+=Math.PI/6;o.redraw();});
  dragOrbit(o,view);
  o.cv.setAttribute('aria-label',t('Polyèdre. Glisser ou les flèches font tourner la vue ; la profondeur se règle sous la figure.','Polyhedron. Drag or use the arrow keys to turn the view; the depth is set under the figure.'));
  const polys=Q=>Q.faces.map(f=>({pts:f.verts.map(i=>Q.verts[i]),normal:f.n,shade:KIND_SHADE[f.kind]}));
  o.animate(()=>{
    if(!P)return false;   // the first frame is asked for before build() and sync()
    const C=palette();g.clearRect(0,0,o.W,o.H);g.fillStyle=C.sunken;g.fillRect(0,0,o.W,o.H);
    const scale=175;
    drawFaces(g,C,polys(P),view,scale,{dy:0});
    if(ghost){g.strokeStyle=C.ink;g.lineWidth=1.2;const s=1/(Math.max(...dual.verts.map(v=>Math.hypot(...v))))*Math.max(...P.verts.map(v=>Math.hypot(...v)));
      drawFaces(g,C,dual.faces.map(f=>({pts:f.verts.map(i=>dual.verts[i].map(x=>x*s*1.06)),normal:f.n,shade:2})),view,scale,{dy:0,ghost:true});}
    o.read(`${MS.el.querySelector('dd').textContent} · ${Math.round(depth*100)} %`);
    return false;
  });
  build();sync();
  return ()=>{o.stop();MS.el.remove();legend.remove();};
}
