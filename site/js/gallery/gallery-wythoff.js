// The Wythoff triangle (gallery exhibit, issue #35; maths in gallery-wythoff-model.js). Drag a point in the triangle of
// mirrors: its reflected copies are the vertices of a polyhedron, whose edges are twice the point's distances to the
// three sides. The seven points with equal distances give the Platonic and Archimedean solids; a twist (rotations only)
// gives the snub solids. The dual shows the Catalan solids, face for vertex. A second mode asks the visitor to classify
// a solid; the verdict comes from properties computed on it (convex, regular faces, identical vertices, congruent faces).
import {exhibit,palette,orbitProject,dragOrbit,drawFaces} from './gallery-kit.js';
import {illuminateFeedback} from '../motion.js';
import {metricStrip} from './gallery-panels.js';
import {FAMILIES,STOPS,NAMES,wythoff,snubPoint,dual,signature,uniformEdges,edgeLengths,vertexConfig,classify,prism,antiprism,pyramid,bipyramid,norm} from './gallery-wythoff-model.js';
import {stellation,pieces} from './gallery-stellation-model.js';

const SIZE_SHADE={3:0,4:1,5:2,6:3,8:4,10:5};
const KINDS={platonic:['Solide de Platon','Platonic solid'],archimedean:['Solide d’Archimède','Archimedean solid'],prism:['Prisme ou antiprisme','Prism or antiprism'],johnson:['Solide de Johnson','Johnson solid'],catalan:['Solide de Catalan','Catalan solid'],kepler:['Solide de Kepler-Poinsot','Kepler-Poinsot solid']};
export function wythoffTriangle(root,opts){
  const {t,lang}=opts,nf=new Intl.NumberFormat(lang==='fr'?'fr-FR':'en-GB',{maximumFractionDigits:3}),num=v=>nf.format(v);
  let fam='O',d=[1,1,0],twist=false,show='solid',mode='explore',answer=null,moved=false,mystery=null,score=[0,0];const view={yaw:-.55,pitch:.45},visited=new Set();
  const o=exhibit(root,opts,t('Le triangle est découpé par trois miroirs. Glisse le point dans le triangle : ses reflets dans tous les miroirs sont les sommets d’un solide. Chaque arête mesure deux fois la distance du point à un côté du triangle.','The triangle is cut out by three mirrors. Drag the point in the triangle: its reflections in all the mirrors are the vertices of a solid. Each edge is twice the distance from the point to one side of the triangle.'),
    `<fieldset class="act-choice" id="wy-q"><legend>${t('Où placer le point pour que toutes les arêtes aient la même longueur ?','Where should the point go for every edge to have the same length?')}</legend>
       ${[t('seulement aux trois coins','only at the three corners'),t('aux coins, sur chaque côté et à l’intérieur, à des endroits précis','at the corners, on each side and inside, at precise places'),t('n’importe où','anywhere')].map((c,i)=>`<label><input type="radio" name="wy-guess" value="${i}"> ${c}</label>`).join('')}</fieldset>
     <p class="feedback" id="wy-verdict" role="status"></p>
     <div class="act-buttons" role="group" aria-label="${t('Ce que l’on fait','What to do')}">
       <button type="button" class="btn btn-secondary" data-mode="explore" aria-pressed="true">${t('Explorer le triangle','Explore the triangle')}</button>
       <button type="button" class="btn btn-secondary" data-mode="challenge" aria-pressed="false">${t('Défi : classer un solide','Challenge: classify a solid')}</button></div>
     <div id="wy-explore">
       <div class="act-buttons" role="group" aria-label="${t('Symétrie','Symmetry')}">${Object.keys(FAMILIES).map(k=>`<button type="button" class="btn btn-secondary" data-fam="${k}" aria-pressed="${k===fam}">${t(...FAMILIES[k].names)}</button>`).join('')}</div>
       <figure class="wy-tri" data-fig-inset><svg viewBox="-10 -12 220 200" role="group" aria-label="${t('Triangle de Wythoff : glisse le point','Wythoff triangle: drag the point')}"></svg></figure>
       <div class="act-buttons" id="wy-stops" role="group" aria-label="${t('Points où toutes les arêtes sont égales','Points where every edge is equal')}"></div>
       <div class="act-buttons"><button type="button" class="btn btn-secondary" id="wy-twist" aria-pressed="false">${t('Torsion : solide adouci','Twist: snub solid')}</button>
         <button type="button" class="btn btn-secondary" id="wy-turn">${t('Tourner la vue','Turn the view')}</button></div>
       <div class="act-buttons" role="group" aria-label="${t('Solide ou dual','Solid or dual')}">${[['solid',t('Le solide','The solid')],['dual',t('Son dual (Catalan)','Its dual (Catalan)')],['both',t('Les deux','Both')]].map(([k,l])=>`<button type="button" class="btn btn-secondary" data-show="${k}" aria-pressed="${k===show}">${l}</button>`).join('')}</div>
     </div>
     <div id="wy-challenge" hidden>
       <p id="wy-c-q">${t('Quelle famille ? Regarde les faces (régulières ?), les sommets (tous pareils ?) et la forme (convexe ?).','Which family? Look at the faces (regular?), the vertices (all alike?) and the shape (convex?).')}</p>
       <div class="act-buttons" id="wy-kinds">${Object.entries(KINDS).map(([k,l])=>`<button type="button" class="btn btn-secondary" data-kind="${k}">${t(...l)}</button>`).join('')}</div>
       <p class="feedback" id="wy-c-verdict" role="status"></p>
       <div class="act-buttons"><button type="button" class="btn btn-primary" id="wy-next">${t('Un autre solide','Another solid')}</button></div>
     </div>`,
    `<ol>
      <li>${t('Les symétries d’un solide de Platon sont faites de réflexions dans des miroirs. Ces miroirs découpent la sphère en triangles identiques ; le triangle dessiné est l’un d’eux. Ses coins sont sur les axes de rotation d’ordre 3, 4 ou 5 (sommets et faces) et 2 (milieux d’arêtes).','The symmetries of a Platonic solid are made of reflections in mirrors. The mirrors cut the sphere into identical triangles; the drawn triangle is one of them. Its corners lie on the rotation axes of order 3, 4 or 5 (vertices and faces) and 2 (midpoints of edges).')}</li>
      <li>${t('Un point à distances a, b, c des trois côtés a des reflets voisins à 2a, 2b, 2c. Les arêtes sont donc toutes égales quand les distances non nulles sont égales : un coin (une seule distance non nulle), un point d’un côté à égale distance des deux autres, ou le centre du cercle inscrit. Cela fait 7 points, et 7 solides uniformes pour chaque symétrie (certains se répètent pour le tétraèdre).','A point at distances a, b, c from the three sides has neighbouring reflections at 2a, 2b, 2c. So every edge is equal when the non-zero distances are equal: a corner (one non-zero distance), a point of a side equally far from the other two, or the centre of the inscribed circle. That makes 7 points, and 7 uniform solids for each symmetry (some repeat for the tetrahedron).')}</li>
      <li>${t('La torsion ne garde que les rotations : chaque point a moitié moins de reflets, et l’on trouve, par le calcul, l’endroit où toutes les arêtes sont égales. Cela donne le cube adouci et le dodécaèdre adouci ; pour le tétraèdre, la torsion donne l’icosaèdre. Avec les 13 solides d’Archimède, les 5 de Platon et les prismes et antiprismes, ce sont tous les polyèdres convexes uniformes.','The twist keeps only the rotations: each point has half as many reflections, and the place where every edge is equal is found by computation. That gives the snub cube and the snub dodecahedron; for the tetrahedron, the twist gives the icosahedron. With the 13 Archimedean solids, the 5 Platonic ones and the prisms and antiprisms, these are all the convex uniform polyhedra.')}</li>
      <li>${t('Le dual remplace chaque face par un sommet (dans la direction de la face) et chaque sommet par une face. Les duaux des solides d’Archimède sont les 13 solides de Catalan : toutes leurs faces sont identiques, mais elles ne sont pas régulières, et leurs sommets ne sont pas tous pareils.','The dual replaces each face by a vertex (in the direction of the face) and each vertex by a face. The duals of the Archimedean solids are the 13 Catalan solids: all their faces are identical, but they are not regular, and their vertices are not all alike.')}</li>
      <li>${t('Classer : convexe, faces régulières et sommets tous pareils donne Platon (une seule sorte de face), Archimède, ou un prisme ou antiprisme. Faces régulières mais sommets différents : un des 92 solides de Johnson. Faces identiques non régulières : Catalan. Non convexe avec faces régulières et sommets pareils : Kepler-Poinsot.','To classify: convex, regular faces and all vertices alike gives Platonic (one kind of face), Archimedean, or a prism or antiprism. Regular faces but different vertices: one of the 92 Johnson solids. Identical non-regular faces: Catalan. Non-convex with regular faces and alike vertices: Kepler-Poinsot.')}</li>
      <li>${t('À toi : au centre du triangle du cube, les distances sont égales. Combien de sommets a le solide ? (48 : un point par triangle, et la sphère en compte 48.)','Your turn: at the centre of the cube’s triangle, the distances are equal. How many vertices does the solid have? (48: one point per triangle, and the sphere has 48 of them.)')}</li>
    </ol>
    <p>${t('Voir aussi : ','See also: ')}<a href="#gallery/polyhedra">${t('couper les sommets','cutting the corners')}</a> · <a href="#gallery/star-polyhedra">${t('les solides étoilés','the star solids')}</a> · <a href="#gallery/rupert">${t('le cube du prince Rupert','Prince Rupert’s cube')}</a></p>`);
  const g=o.g,stage=root.querySelector('.exhibit-stage'),controls=root.querySelector('.exhibit-controls'),top=document.createElement('div');
  top.className='exhibit-band';controls.classList.add('exhibit-band');
  const quiz=document.createElement('div');quiz.className='exhibit-band wy-quiz';
  quiz.append(...[...controls.children].filter(el=>el.matches('fieldset, .feedback')));
  top.append(...[...controls.children].filter(el=>el.matches('[role=group]:not(#wy-stops)')&&!el.closest('#wy-explore,#wy-challenge')));stage.before(top);stage.after(controls,quiz);
  const MS=metricStrip(controls,t,[{id:'faces',label:t('Faces','Faces'),kind:'exact'},
    {id:'cfg',label:t('Autour d’un sommet','Around a vertex'),kind:'exact'},{id:'edges',label:t('Arêtes','Edges'),kind:'approx'},{id:'dual',label:t('Dual','Dual')}]);
  const svg=root.querySelector('.wy-tri svg'),stopBox=root.querySelector('#wy-stops'),fb=root.querySelector('#wy-verdict'),cfb=root.querySelector('#wy-c-verdict');
  // the triangle drawn flat: corners A (top), B (bottom left), C (bottom right); d is used as barycentric weights
  const TP=[[100,8],[8,168],[192,168]],toXY=w=>{const s=w[0]+w[1]+w[2]||1;return [0,1].map(q=>(w[0]*TP[0][q]+w[1]*TP[1][q]+w[2]*TP[2][q])/s);};
  const fromXY=([x,y])=>{const [a,b,c]=TP,D=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]),l1=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/D,l2=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/D;return [l1,l2,1-l1-l2].map(v=>Math.max(0,v));};
  let S=null,D=null,label='';   // label: the name the caption gives (the panel does not repeat it)
  const POLY={3:['triangles','triangles'],4:['carrés','squares'],5:['pentagones','pentagons'],6:['hexagones','hexagons'],8:['octogones','octagons'],10:['décagones','decagons']};
  const faceWords=sig=>sig.split(',').map(p=>{const [k,c]=p.split(':');return `${c} ${POLY[k]?t(...POLY[k]):k+t('-gones','-gons')}`;}).join(', ');
  const nameOf=(sig,which=0)=>NAMES[sig]?t(...NAMES[sig][which]):null;
  function rebuild(){
    S=wythoff(fam,twist?snubPoint(fam):d,twist);D=dual(S);
    const sig=signature(S),uni=uniformEdges(S),L=edgeLengths(S),lo=Math.min(...L),hi=Math.max(...L);
    const nm=uni?nameOf(sig):null;
    label=(nm||(nameOf(sig)?t(`mêmes faces que : ${nameOf(sig)}, arêtes inégales`,`same faces as: ${nameOf(sig)}, unequal edges`):t('non uniforme','not uniform')));
    MS.set('faces',faceWords(sig));
    MS.set('cfg',vertexConfig(S,0));MS.set('edges',uni?t('toutes égales','all equal'):t(`de ${num(lo/hi)} à 1 (rapport)`,`from ${num(lo/hi)} to 1 (ratio)`));
    MS.set('dual',uni&&nameOf(sig,1)?nameOf(sig,1):t('dual d’un solide non uniforme','dual of a non-uniform solid'));
    if(uni&&nm)visited.add(sig+fam);
    drawTriangle();verdict();o.redraw();
  }
  function drawTriangle(){
    const F=FAMILIES[fam],labels=F.orders,p=toXY(twist?snubPoint(fam):d);
    svg.innerHTML=`<polygon points="${TP.map(q=>q.join(',')).join(' ')}" class="wy-face"/>`+
      STOPS.map(s=>{const q=toXY(s);return `<circle cx="${q[0]}" cy="${q[1]}" r="4.5" class="wy-stop"/>`;}).join('')+
      TP.map((q,i)=>`<text x="${q[0]+(i===0?0:i===1?-4:4)}" y="${q[1]+(i===0?-1:14)}" text-anchor="${i===0?'middle':i===1?'start':'end'}" class="wy-label">${t('ordre','order')} ${labels[i]}</text>`).join('')+
      `<circle cx="${p[0]}" cy="${p[1]}" r="9" class="wy-handle${twist?' wy-twist':''}" tabindex="0" role="slider" aria-label="${t('Point du triangle (flèches pour le déplacer)','Point in the triangle (arrow keys move it)')}" aria-valuetext="a = ${num(d[0])}, b = ${num(d[1])}, c = ${num(d[2])}"/>`;
    const h=svg.querySelector('.wy-handle');o.on(h,'keydown',e=>{const k={ArrowLeft:[-4,0],ArrowRight:[4,0],ArrowUp:[0,-4],ArrowDown:[0,4]}[e.key];if(!k)return;e.preventDefault();const q=toXY(d);setD(fromXY([q[0]+k[0],q[1]+k[1]]));svg.querySelector('.wy-handle')?.focus();});
  }
  function setD(w){const s=w[0]+w[1]+w[2];if(!(s>0))return;d=w.map(v=>v/s);if(twist){twist=false;tw.setAttribute('aria-pressed','false');}
    if(!STOPS.some(st=>{const ss=st.reduce((a,b)=>a+b,0);return st.every((v,i)=>Math.abs(v/ss-d[i])<.02);}))moved=true;rebuild();}
  let dragging=false;const local=e=>{const r=svg.getBoundingClientRect(),vb=svg.viewBox.baseVal;return [vb.x+(e.clientX-r.left)*vb.width/r.width,vb.y+(e.clientY-r.top)*vb.height/r.height];};
  o.on(svg,'pointerdown',e=>{dragging=true;svg.setPointerCapture?.(e.pointerId);setD(fromXY(local(e)));e.preventDefault();});
  o.on(svg,'pointermove',e=>{if(dragging)setD(fromXY(local(e)));});o.on(svg,'pointerup',()=>{dragging=false;});
  // a small snap to the uniform points while dragging, so they can be reached with a finger
  stopBox.innerHTML=STOPS.map((s,i)=>`<button type="button" class="btn btn-secondary" data-stop="${i}"></button>`).join('');
  function labelStops(){stopBox.querySelectorAll('[data-stop]').forEach(b=>{const s=STOPS[+b.dataset.stop],sig=signature(wythoff(fam,s));b.textContent=nameOf(sig)||sig;});}
  stopBox.querySelectorAll('[data-stop]').forEach(b=>o.on(b,'click',()=>{const s=STOPS[+b.dataset.stop];d=s.map(v=>v/s.reduce((a,c)=>a+c,0));if(twist){twist=false;tw.setAttribute('aria-pressed','false');}rebuild();}));
  root.querySelectorAll('[data-fam]').forEach(b=>o.on(b,'click',()=>{fam=b.dataset.fam;root.querySelectorAll('[data-fam]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));labelStops();rebuild();}));
  const tw=root.querySelector('#wy-twist');o.on(tw,'click',()=>{twist=!twist;tw.setAttribute('aria-pressed',String(twist));rebuild();});
  root.querySelectorAll('[data-show]').forEach(b=>o.on(b,'click',()=>{show=b.dataset.show;root.querySelectorAll('[data-show]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));o.redraw();}));
  o.on(root.querySelector('#wy-turn'),'click',()=>{view.yaw+=Math.PI/6;o.redraw();});
  root.querySelectorAll('[name=wy-guess]').forEach(r=>o.on(r,'change',()=>{answer=+r.value;verdict();}));
  function verdict(){
    let text,cls='';
    if(answer==null)text=t('Choisis une réponse, puis glisse le point et essaie les points marqués.','Choose an answer, then drag the point and try the marked points.');
    else if(!moved||visited.size<4)text=t('Réponse notée. Glisse le point hors des points marqués, puis visite au moins quatre solides aux arêtes égales.','Answer noted. Drag the point away from the marked points, then visit at least four solids with equal edges.');
    else{const ok=answer===1;cls=ok?'success':'error';text=(ok?t('Bien vu. ','Well spotted. '):t('Pas tout à fait. ','Not quite. '))+t('Les arêtes valent 2a, 2b, 2c : elles sont égales aux 7 points où les distances non nulles sont égales (coins, un point sur chaque côté, centre du cercle inscrit). Ailleurs, le solide a les mêmes faces mais des arêtes inégales.','The edges are 2a, 2b, 2c: they are equal at the 7 points where the non-zero distances are equal (corners, one point on each side, the centre of the inscribed circle). Elsewhere the solid has the same faces but unequal edges.');}
    if(fb.textContent!==text){const was=fb.className;fb.className='feedback'+(cls?' '+cls:'');fb.textContent=text;if(cls&&was!==fb.className)illuminateFeedback(fb,opts.reduced);}
  }
  // the classification challenge: a solid from a pool, turned at random
  const POOL=[()=>wythoff('O',[0,1,0]),()=>wythoff('I',[1,0,0]),()=>wythoff('O',[1,1,0]),()=>wythoff('I',[1,0,1]),()=>wythoff('T',[0,1,1]),()=>wythoff('O',snubPoint('O'),true),
    ()=>dual(wythoff('O',[0,0,1])),()=>dual(wythoff('I',[1,0,1])),()=>dual(wythoff('O',[1,1,0])),()=>prism(5),()=>prism(6),()=>antiprism(5),()=>antiprism(4),()=>pyramid(4),()=>pyramid(5),()=>bipyramid(),
    ...['small-stellated','great-dodecahedron','great-stellated','great-icosahedron'].map(id=>()=>{const T=stellation(id);return {...T,faces:T.faces.map(f=>({...f,d:1})),star:true};})];
  let last=-1;
  function next(){let k;do k=Math.floor(Math.random()*POOL.length);while(k===last);last=k;const s=POOL[k]();const c=classify(s);mystery={S:s,kind:s.star?'kepler':c.kind==='other'?'kepler':c.kind,props:c};view.yaw=Math.random()*6;view.pitch=.3+Math.random()*.4;
    cfb.className='feedback';cfb.textContent='';label='';MS.set('faces','?');MS.set('cfg','?');MS.set('edges','?');MS.set('dual','?');o.redraw();}
  root.querySelectorAll('[data-kind]').forEach(b=>o.on(b,'click',()=>{if(!mystery)return;const ok=b.dataset.kind===mystery.kind,p=mystery.props;score=[score[0]+(ok?1:0),score[1]+1];
    const yes=v=>v?t('oui','yes'):t('non','no');
    cfb.className='feedback '+(ok?'success':'error');cfb.textContent=(ok?t('Bien vu. ','Well spotted. '):t(`Non : ${t(...KINDS[mystery.kind])}. `,`No: ${t(...KINDS[mystery.kind])}. `))+t(`Convexe : ${yes(p.convex)} ; faces régulières : ${yes(p.regular)} ; sommets tous pareils : ${yes(p.sameVertices)} ; faces toutes identiques : ${yes(p.oneFace)}. Score : ${score[0]} sur ${score[1]}.`,`Convex: ${yes(p.convex)}; regular faces: ${yes(p.regular)}; all vertices alike: ${yes(p.sameVertices)}; all faces identical: ${yes(p.oneFace)}. Score: ${score[0]} out of ${score[1]}.`);
    illuminateFeedback(cfb,opts.reduced);
    const sig=signature(mystery.S);MS.set('faces',faceWords(sig));MS.set('cfg',mystery.S.star?'–':vertexConfig(mystery.S,0));label=(nameOf(sig)&&!mystery.S.star&&mystery.kind!=='catalan'?nameOf(sig):mystery.S.names?t(...mystery.S.names):t(...KINDS[mystery.kind]));o.redraw();}));
  o.on(root.querySelector('#wy-next'),'click',next);
  root.querySelectorAll('[data-mode]').forEach(b=>o.on(b,'click',()=>{mode=b.dataset.mode;root.querySelectorAll('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
    root.querySelector('#wy-explore').hidden=mode!=='explore';root.querySelector('#wy-challenge').hidden=mode!=='challenge';root.querySelector('#wy-q').hidden=mode!=='explore';fb.hidden=mode!=='explore';
    if(mode==='challenge')next();else rebuild();}));
  dragOrbit(o,view);
  o.cv.setAttribute('aria-label',t('Le solide engendré par le point du triangle. Glisser ou les flèches font tourner la vue.','The solid generated by the point in the triangle. Drag or use the arrow keys to turn the view.'));
  const shaded=X=>X.faces.map(f=>({pts:f.verts.map(k=>X.verts[k]),normal:f.normal,shade:SIZE_SHADE[f.verts.length]??6}));
  o.animate(()=>{
    const C=palette();g.clearRect(0,0,o.W,o.H);g.fillStyle=C.sunken;g.fillRect(0,0,o.W,o.H);
    const shift=(sc)=>{g.save();g.translate(o.W/2-320,o.H/2-224);return sc;};
    if(mode==='challenge'&&mystery){
      const X=mystery.S,R=Math.max(...X.verts.map(norm)),sc=Math.min(o.W,o.H)*.42/R;shift();
      if(X.star){const o0=orbitProject([0,0,0],view.yaw,view.pitch,1)[2];
        pieces(X).map(q=>{const s=q.pts.map(v=>orbitProject(v,view.yaw,view.pitch,sc));return {q,s,dd:s.reduce((a,b)=>a+b[2],0)/s.length,k:orbitProject(q.normal,view.yaw,view.pitch,1)[2]-o0};}).sort((a,b)=>a.dd-b.dd)
          .forEach(({q,s,k})=>{g.beginPath();s.forEach(([x,y],i)=>i?g.lineTo(x,y+8):g.moveTo(x,y+8));g.closePath();g.fillStyle=C.c[q.face%4];g.fill();const dk=.5*(1-Math.abs(k));if(dk>.01){g.globalAlpha=dk;g.fillStyle='#000';g.fill();g.globalAlpha=1;}g.strokeStyle=C.c[q.face%4];g.lineWidth=.8;g.stroke();});}
      else drawFaces(g,C,shaded(X),view,sc);
      g.restore();o.read(label?`${label} · V ${X.V}, E ${X.E}, F ${X.F}`:t(`Solide mystère (V ${X.V}, E ${X.E}, F ${X.F}) : choisis sa famille.`,`Mystery solid (V ${X.V}, E ${X.E}, F ${X.F}): choose its family.`));return false;}
    if(!S)return false;
    const R=Math.max(...S.verts.map(norm),...(show!=='solid'?D.verts.map(norm):[])),sc=Math.min(o.W,o.H)*.42/R;shift();
    if(show==='dual')drawFaces(g,C,shaded(D),view,sc);
    else{drawFaces(g,C,shaded(S),view,sc);if(show==='both'){g.strokeStyle=C.ink;drawFaces(g,C,shaded(D),view,sc,{ghost:true});
      // the dual vertex of the face facing the viewer, on the same line through the centre
      const o0=orbitProject([0,0,0],view.yaw,view.pitch,1)[2];let best=0,bi=0;S.faces.forEach((f,i)=>{const k=orbitProject(f.normal,view.yaw,view.pitch,1)[2]-o0;if(k>best){best=k;bi=i;}});
      const v=orbitProject(D.verts[bi],view.yaw,view.pitch,sc);g.fillStyle=C.object;g.beginPath();g.arc(v[0],v[1]+8,6,0,2*Math.PI);g.fill();}}
    g.restore();
    o.read(`${label} · V ${S.V}, E ${S.E}, F ${S.F}`);
    return false;
  });
  labelStops();rebuild();
  return ()=>{o.stop();MS.el.remove();};
}
