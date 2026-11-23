// Prince Rupert's cube (gallery exhibit, issue #27; maths in gallery-rupert-model.js). Two views of one pair of positions:
// the shadows (the outer block's shadow, and the largest copy of the piece's shadow that fits inside it, computed exactly
// by a linear programme) and the passage (the block drawn in outline, a straight tunnel along the view direction, the
// piece sliding through it). Dragging the shadows turns the piece or the block; a button loads a verified witness. A
// search that finds no passage proves nothing: the text says so, and gives the status of the shapes known not to pass.
import {exhibit,palette,orbitProject,dragOrbit} from './gallery-kit.js';
import {illuminateFeedback} from '../motion.js';
import {metricStrip} from './gallery-panels.js';
import {solid,rotation,apply,shadow,bestScale,WITNESSES,NIEUWLAND,SHAPES} from './gallery-rupert-model.js';

const NAMES={cube:['Cube','Cube'],tetrahedron:['Tétraèdre','Tetrahedron'],octahedron:['Octaèdre','Octahedron'],dodecahedron:['Dodécaèdre','Dodecahedron'],icosahedron:['Icosaèdre','Icosahedron'],rhombicosidodecahedron:['Rhombicosidodécaèdre','Rhombicosidodecahedron']};
export function rupertCubes(root,opts){
  const {t,lang}=opts,nf=new Intl.NumberFormat(lang==='fr'?'fr-FR':'en-GB',{minimumFractionDigits:4,maximumFractionDigits:4}),num=v=>nf.format(v);
  const nm=k=>t(...NAMES[k]);
  let shape='cube',S=solid(shape),outer=[0,0.35,0.5],inner=[0.4,0.9,0.3],turn='inner',view2='shadows',slide=0,answer=null,seen=false;
  const cam={yaw:-0.6,pitch:0.45};
  const o=exhibit(root,opts,t('Un cube est percé d’un tunnel droit. Un second cube, identique, peut-il passer par ce tunnel sans casser le premier ? Glisse sur les ombres pour tourner la pièce, compare les deux ombres, puis regarde le passage.','A cube has a straight tunnel drilled through it. Can a second, identical cube pass through that tunnel without breaking the first? Drag over the shadows to turn the piece, compare the two shadows, then watch the passage.'),
    `<fieldset class="act-choice"><legend>${t('Peut-on faire passer un cube par un trou percé dans un cube de même taille ?','Can a cube pass through a hole drilled in a cube of the same size?')}</legend>
       ${[t('non, c’est impossible','no, it is impossible'),t('oui, tout juste','yes, just about'),t('oui, et même un cube un peu plus grand','yes, and even a slightly larger cube')].map((c,i)=>`<label><input type="radio" name="rp-guess" value="${i}"> ${c}</label>`).join('')}</fieldset>
     <p class="feedback" id="rp-verdict" role="status"></p>
     <div class="act-buttons rp-shapes" role="group" aria-label="${t('Solide','Solid')}">${SHAPES.map(k=>`<button type="button" class="btn btn-secondary" data-shape="${k}" aria-pressed="${k===shape}">${nm(k)}</button>`).join('')}</div>
     <div class="act-buttons" role="group" aria-label="${t('Vue','View')}">
       <button type="button" class="btn btn-secondary" data-view="shadows" aria-pressed="true">${t('Les ombres','The shadows')}</button>
       <button type="button" class="btn btn-secondary" data-view="passage" aria-pressed="false">${t('Le passage','The passage')}</button></div>
     <div class="act-buttons" role="group" aria-label="${t('Ce que le glissé fait tourner','What dragging turns')}" id="rp-turn-group">
       <button type="button" class="btn btn-secondary" data-turn="inner" aria-pressed="true">${t('Tourner la pièce','Turn the piece')}</button>
       <button type="button" class="btn btn-secondary" data-turn="outer" aria-pressed="false">${t('Tourner le bloc percé','Turn the drilled block')}</button></div>
     <label class="ph-slider" id="rp-slide-row" hidden><span>${t('Faire passer la pièce','Move the piece through')}</span><input type="range" id="rp-slide" min="0" max="100" step="1" value="0"></label>
     <div class="act-buttons"><button type="button" class="btn btn-primary" id="rp-witness">${t('Montrer un passage vérifié','Show a verified passage')}</button></div>`,
    `<ol>
      <li>${t('Un tunnel droit laisse passer la pièce si, vue dans la direction du tunnel, l’ombre de la pièce tient à l’intérieur de l’ombre du bloc, avec un peu de place tout autour : le bloc garde alors un mur tout autour du trou et reste d’un seul morceau.','A straight tunnel lets the piece through if, seen along the tunnel, the shadow of the piece fits inside the shadow of the block with a little room all round: the block then keeps a wall all round the hole and stays in one piece.')}</li>
      <li>${t('Pour deux positions données, le plus grand agrandissement s de la pièce qui tient dans l’ombre du bloc se calcule exactement : chaque côté de l’ombre du bloc donne une inégalité, et on maximise s (un petit programme linéaire). Le solide est dit de Rupert si l’on trouve des positions avec s > 1.','For two given positions, the largest enlargement s of the piece that fits in the block’s shadow is computed exactly: each side of the block’s shadow gives an inequality, and s is maximised (a small linear programme). The solid is called Rupert if positions with s > 1 exist.')}</li>
      <li>${t('Pour le cube, le meilleur s est 3√2/4 ≈ 1,0607 (Nieuwland) : un cube 6 % plus grand passe. Le passage le plus simple, le long d’une grande diagonale (ombre hexagonale), n’est pas le meilleur.','For the cube the best s is 3√2/4 ≈ 1.0607 (Nieuwland): a cube 6% larger passes. The simplest passage, along a long diagonal (hexagonal shadow), is not the best one.')}</li>
      <li>${t('Les cinq solides de Platon sont de Rupert : l’exposition montre pour chacun un passage trouvé par une recherche et vérifié par deux calculs indépendants. Ce s n’est pas forcément le meilleur possible.','All five Platonic solids are Rupert: for each, the exhibit shows a passage found by a search and checked by two independent computations. That s is not necessarily the best possible.')}</li>
      <li>${t('Ne pas trouver de passage ne prouve rien. En 2025, Steininger et Yurkevich ont prouvé, avec l’aide d’un ordinateur, que le Noperthèdre (90 sommets, 152 faces) n’a aucun passage. En octobre 2026, un polyèdre à 7 sommets sans passage (le Septopert) a été annoncé avec un certificat vérifié en Lean, ainsi qu’une preuve que tout polyèdre convexe d’au plus 6 sommets est de Rupert. En 2026 aussi, une prépublication assistée par ordinateur annonce que le rhombicosidodécaèdre n’a pas de passage : ici, la recherche ne trouve jamais mieux que s = 1, la pièce posée exactement sur son ombre, sans aucune place. Ces deux derniers polyèdres ne sont pas dessinés ici.','Finding no passage proves nothing. In 2025 Steininger and Yurkevich proved, with the help of a computer, that the Noperthedron (90 vertices, 152 faces) has no passage. In October 2026 a polyhedron with 7 vertices and no passage (the Septopert) was announced with a certificate checked in Lean, together with a proof that every convex polyhedron with at most 6 vertices is Rupert. Also in 2026, a computer-assisted preprint announces that the rhombicosidodecahedron has no passage: here the search never finds better than s = 1, the piece placed exactly on its own shadow, with no room at all. Those last two polyhedra are not drawn here.')}</li>
      <li>${t('Une boule n’a jamais de passage : son ombre est toujours un disque de même rayon. La question ne se pose que pour les polyèdres convexes.','A ball never has a passage: its shadow is always a disc of the same radius. The question is only about convex polyhedra.')}</li>
    </ol>`);
  const g=o.g,stage=root.querySelector('.exhibit-stage'),controls=root.querySelector('.exhibit-controls'),top=document.createElement('div');
  top.className='exhibit-band';controls.classList.add('exhibit-band');
  top.append(...[...controls.children].filter(el=>el.matches('fieldset, .feedback')));stage.before(top);stage.after(controls);
  const MS=metricStrip(controls,t,[{id:'s',label:t('Plus grand agrandissement qui passe, dans ces positions','Largest enlargement that passes, in these positions'),kind:'approx'},{id:'pass',label:t('Dans ces positions','In these positions'),kind:'exact'},{id:'vef',label:t('Sommets · arêtes · faces','Vertices · edges · faces'),kind:'exact'},{id:'status',label:t('Ce que l’on sait','What is known'),kind:''}]);
  const fb=root.querySelector('#rp-verdict');
  function verdict(){
    let text,cls='';
    if(answer==null)text=t('Choisis une réponse, puis cherche un passage en tournant la pièce, ou demande un passage vérifié.','Choose an answer, then look for a passage by turning the piece, or ask for a verified passage.');
    else if(!seen)text=t('Réponse notée. Trouve une position du cube avec s > 1, ou regarde le passage vérifié jusqu’au bout.','Answer noted. Find a position of the cube with s > 1, or watch the verified passage to the end.');
    else{const ok=answer===2;cls=ok?'success':'error';text=(ok?t('Bien vu. ','Well spotted. '):t('Pas tout à fait. ','Not quite. '))+t(`Un cube passe, et même un cube agrandi jusqu’à 3√2/4 ≈ ${num(NIEUWLAND)} fois : son ombre tient dans celle du bloc avec de la place autour.`,`A cube passes, and even a cube enlarged up to 3√2/4 ≈ ${num(NIEUWLAND)} times: its shadow fits in the block’s with room all round.`);}
    if(fb.textContent!==text){const was=fb.className;fb.className='feedback'+(cls?' '+cls:'');fb.textContent=text;if(cls&&was!==fb.className)illuminateFeedback(fb,typeof opts.reduced==='function'?opts.reduced:()=>!!opts.reduced);}
  }
  let cache=null;
  const state=()=>{const key=shape+outer+inner;if(cache?.key===key)return cache;
    const Q=shadow(S,outer),P=shadow(S,inner),r=bestScale(P,Q);cache={key,Q,P,r};return cache;};
  const pressed=(sel,attr,val)=>root.querySelectorAll(sel).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset[attr]===val)));
  const turnGroup=root.querySelector('#rp-turn-group'),slideRow=root.querySelector('#rp-slide-row'),slideIn=root.querySelector('#rp-slide');
  function setView(v){view2=v;pressed('[data-view]','view',v);turnGroup.hidden=v!=='shadows';slideRow.hidden=v!=='passage';
    o.cv.setAttribute('aria-label',v==='shadows'?t('Les deux ombres. Glisser ou les flèches tournent la pièce ou le bloc.','The two shadows. Drag or use the arrow keys to turn the piece or the block.'):t('Le bloc percé et la pièce. Glisser ou les flèches tournent la vue ; le curseur fait passer la pièce.','The drilled block and the piece. Drag or use the arrow keys to turn the view; the slider moves the piece through.'));o.redraw();}
  root.querySelectorAll('[data-shape]').forEach(b=>o.on(b,'click',()=>{shape=b.dataset.shape;S=solid(shape);cache=null;pressed('[data-shape]','shape',shape);o.redraw();}));
  root.querySelectorAll('[data-view]').forEach(b=>o.on(b,'click',()=>setView(b.dataset.view)));
  root.querySelectorAll('[data-turn]').forEach(b=>o.on(b,'click',()=>{turn=b.dataset.turn;pressed('[data-turn]','turn',turn);}));
  root.querySelectorAll('[name=rp-guess]').forEach(r=>o.on(r,'change',()=>{answer=+r.value;verdict();}));
  o.on(slideIn,'input',e=>{slide=+e.target.value/100;if(slide>=1&&shape==='cube'&&state().r.s>1)seen=true;verdict();o.redraw();});
  o.on(root.querySelector('#rp-witness'),'click',()=>{const w=WITNESSES[shape];
    if(!w){o.read(t('Aucun passage connu pour ce solide : il n’en a pas (prépublication de 2026).','No passage is known for this solid: it has none (2026 preprint).'));return;}
    outer=[...w.outer];inner=[...w.inner];cache=null;setView('passage');slide=0;slideIn.value='0';
    if(typeof opts.reduced==='function'?opts.reduced():opts.reduced){slide=1;slideIn.value='100';if(shape==='cube')seen=true;verdict();o.redraw();return;}
    const t0=performance.now(),run=()=>{slide=Math.min(1,(performance.now()-t0)/2600);slideIn.value=String(Math.round(slide*100));o.redraw();
      if(slide<1)requestAnimationFrame(run);else{if(shape==='cube')seen=true;verdict();}};requestAnimationFrame(run);});
  // dragging: in the shadows view it turns the piece (or the block); in the passage view it turns the camera
  const angles={yaw:0,pitch:0};
  dragOrbit(o,angles);
  let last={yaw:0,pitch:0};   // dragOrbit writes into angles; each change is passed on, then angles go back to 0 (no clamp)
  o.on(o.cv,'pointermove',()=>sync());o.on(o.cv,'keydown',()=>sync());
  function sync(){const dy=angles.yaw-last.yaw,dp=angles.pitch-last.pitch;angles.yaw=angles.pitch=0;last={yaw:0,pitch:0};if(!dy&&!dp)return;
    if(view2==='passage'){cam.yaw+=dy;cam.pitch=Math.max(-1.45,Math.min(1.45,cam.pitch+dp));}
    else{const A=turn==='inner'?inner:outer;A[2]+=dy;A[1]+=dp;cache=null;if(shape==='cube'&&state().r.s>1)seen=true;verdict();}
    o.redraw();}

  function drawShadows(C){
    const {Q,P,r}=state(),k=Math.min(o.W,o.H)*0.4,cx=o.W/2,cy=o.H/2,X=p=>[cx+p[0]*k,cy-p[1]*k];
    const poly=(pts,fill,stroke,w,dash=[])=>{g.beginPath();pts.map(X).forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();if(fill){g.fillStyle=fill;g.fill();}g.strokeStyle=stroke;g.lineWidth=w;g.setLineDash(dash);g.stroke();g.setLineDash([]);};
    g.globalAlpha=.3;poly(Q,C.c[1],C.c[1],0);g.globalAlpha=1;poly(Q,null,C.ink,2.5);
    const ok=r.s>1+1e-9,fit=P.map(p=>[r.s*p[0]+r.t[0],r.s*p[1]+r.t[1]]),one=P.map(p=>[p[0]+r.t[0]/Math.max(r.s,1e-9),p[1]+r.t[1]/Math.max(r.s,1e-9)]);
    poly(fit,null,ok?C.object:C.c[3],1.6,[6,4]);
    g.globalAlpha=.55;poly(one,ok?C.object:C.c[3],ok?C.object:C.c[3],2.5);g.globalAlpha=1;
    const z=Math.max(1,Math.min(2.2,640/(o.cv.clientWidth||640)));g.font=`600 ${Math.round(14*z)}px system-ui`;g.fillStyle=C.ink;g.textAlign='left';
    g.fillText(t('ombre du bloc','shadow of the block'),12,22*z);g.fillStyle=ok?C.object:C.c[3];g.fillText(t('ombre de la pièce','shadow of the piece'),12,44*z);
    g.fillStyle=C.muted||C.ink;g.fillText(t(`pointillés : la pièce agrandie ${num(r.s)} fois`,`dotted: the piece enlarged ${num(r.s)} times`),12,o.H-12);
  }
  function drawPassage(C){
    const {P,r}=state(),ok=r.s>1+1e-9,Ro=rotation(outer),Ri=rotation(inner),scale=Math.min(o.W,o.H)*0.21;
    const off=ok?[r.t[0]/r.s,r.t[1]/r.s]:[0,0],zc=ok?2.3-4.6*slide:2.3-0.3*slide;   // a piece that does not fit stops above the block
    const piece=S.faces.map(f=>({pts:f.verts.map(i=>{const v=apply(Ri,S.verts[i]);return [v[0]+off[0],v[1]+off[1],v[2]+zc];}),normal:apply(Ri,f.n),shade:0}));
    const view={yaw:cam.yaw,pitch:cam.pitch},Pj=v=>{const q=orbitProject(v,view.yaw,view.pitch,scale);return [q[0]-(320-o.W/2),q[1]-(224-o.H/2)+8];};
    const seg=(a,b)=>{const A=Pj(a),B=Pj(b);g.beginPath();g.moveTo(...A);g.lineTo(...B);g.stroke();};
    // the block: every edge, hidden ones dotted (an edge is hidden when both its faces turn away from the viewer)
    const o0=orbitProject([0,0,0],view.yaw,view.pitch,1)[2],front=S.faces.map(f=>orbitProject(apply(Ro,f.n),view.yaw,view.pitch,1)[2]-o0>0);
    const B=S.verts.map(v=>apply(Ro,v)),edgeFront=new Map();
    S.faces.forEach((f,k)=>f.verts.forEach((a,i)=>{const b=f.verts[(i+1)%f.verts.length],key=a<b?a+'-'+b:b+'-'+a;edgeFront.set(key,(edgeFront.get(key)||false)||front[k]);}));
    const edges=(want)=>{g.strokeStyle=C.ink;for(const [key,f] of edgeFront){if(f!==want)continue;const [a,b]=key.split('-').map(Number);g.lineWidth=f?2:1;g.setLineDash(f?[]:[4,4]);g.globalAlpha=f?.95:.5;seg(B[a],B[b]);}g.setLineDash([]);g.globalAlpha=1;};
    edges(false);
    // the tunnel: the piece's shadow carried along the view direction, through the whole block
    if(ok){const top=P.map(p=>[p[0]+off[0],p[1]+off[1],1.02]),bot=top.map(p=>[p[0],p[1],-1.02]);
      g.strokeStyle=C.object;g.lineWidth=1.8;for(const ring of [top,bot]){g.beginPath();ring.map(Pj).forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.stroke();}
      g.globalAlpha=.45;g.lineWidth=1.2;top.forEach((p,i)=>seg(p,bot[i]));g.globalAlpha=1;}
    // the piece, translucent so the block and the tunnel stay readable through it: front faces, far to near
    const faces=piece.map(q=>({q,k:(orbitProject(q.normal,view.yaw,view.pitch,1)[2]-o0)/Math.hypot(...q.normal),s:q.pts.map(Pj),d:q.pts.reduce((a,v)=>a+orbitProject(v,view.yaw,view.pitch,1)[2],0)})).filter(f=>f.k>0).sort((a,b)=>a.d-b.d);
    for(const f of faces){g.beginPath();f.s.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.globalAlpha=.35+.3*f.k;g.fillStyle=C.c[0];g.fill();g.globalAlpha=1;g.strokeStyle=C.c[0];g.lineWidth=1.4;g.stroke();}
    edges(true);   // the block's front edges over the piece: it is seen inside the block
    if(!ok){const z=Math.max(1,Math.min(2.2,640/(o.cv.clientWidth||640)));g.font=`600 ${Math.round(15*z)}px system-ui`;g.fillStyle=C.c[3];g.textAlign='center';
      g.fillText(t('Dans ces positions, la pièce ne passe pas.','In these positions, the piece does not pass.'),o.W/2,o.H-14);}
  }
  o.animate(()=>{
    const C=palette();g.clearRect(0,0,o.W,o.H);g.fillStyle=C.sunken;g.fillRect(0,0,o.W,o.H);
    if(view2==='shadows')drawShadows(C);else drawPassage(C);
    const {r}=state(),ok=r.s>1+1e-9;
    MS.set('s',num(r.s));MS.set('pass',ok?t('elle passe, avec de la place','it passes, with room'):Math.abs(r.s-1)<1e-6?t('elle tient tout juste, sans place','it just fits, with no room'):t('elle ne passe pas','it does not pass'));
    MS.set('vef',`${S.V} · ${S.E} · ${S.F}`);
    MS.set('status',shape==='rhombicosidodecahedron'?t('sans passage, selon une prépublication de 2026 (preuve par ordinateur)','no passage, according to a 2026 preprint (computer proof)'):shape==='cube'?t('de Rupert ; meilleur s = 3√2/4 (Nieuwland)','Rupert; best s = 3√2/4 (Nieuwland)'):t('de Rupert (prouvé)','Rupert (proved)'));
    o.read(t(`${nm(shape)} : agrandissement ${num(r.s)}, ${ok?'la pièce passe':'la pièce ne passe pas'}.`,`${nm(shape)}: enlargement ${num(r.s)}, ${ok?'the piece passes':'the piece does not pass'}.`));
    return false;
  });
  setView('shadows');verdict();
  return ()=>{o.stop();MS.el.remove();};
}
