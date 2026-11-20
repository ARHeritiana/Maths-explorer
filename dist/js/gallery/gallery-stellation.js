// Stellation and the Kepler–Poinsot solids (gallery exhibit, issue #35; maths in gallery-stellation-model.js). Keep the
// face planes of the dodecahedron (or the icosahedron) and extend the faces until they meet again: the stages are the
// four regular star polyhedra. The turnable figure paints the faces cut into pieces, far to near (faces cross each
// other); under it, the stellation diagram of one face plane shows the face of every stage in that plane. A question on
// Euler's relation is answered once the three stellations of the dodecahedron have been seen.
import {exhibit,palette,orbitProject,dragOrbit} from './gallery-kit.js';
import {illuminateFeedback} from '../motion.js';
import {metricStrip} from './gallery-panels.js';
import {stellation,STAGES,SEQUENCES,pieces,density,facesAtVertex,diagram,dot} from './gallery-stellation-model.js';

export function stellatedSolids(root,opts){
  const {t}=opts;
  let family='dod',stage='small-stellated',showFace=true,answer=null;const view={yaw:-.5,pitch:.42},seen=new Set([stage]);
  const nm=id=>t(...STAGES[id].names);
  const o=exhibit(root,opts,t('Garde les plans des faces d’un dodécaèdre et prolonge les faces : elles se recoupent et dessinent de nouveaux solides, dont les faces se traversent. Fais tourner la figure ; sous elle, le plan d’une face montre jusqu’où elle s’étend.','Keep the face planes of a dodecahedron and extend the faces: they meet again and draw new solids whose faces pass through each other. Turn the figure; under it, the plane of one face shows how far that face reaches.'),
    `<fieldset class="act-choice"><legend>${t('Pour un polyèdre convexe, V − E + F = 2. Pour ces solides étoilés, en comptant chaque étoile comme une face…','For a convex polyhedron, V − E + F = 2. For these star solids, counting each star as one face…')}</legend>
       ${[t('on trouve encore toujours 2','we still always get 2'),t('on ne trouve pas toujours 2','we do not always get 2')].map((c,i)=>`<label><input type="radio" name="st-guess" value="${i}"> ${c}</label>`).join('')}</fieldset>
     <p class="feedback" id="st-verdict" role="status"></p>
     <div class="act-buttons" role="group" aria-label="${t('Plans de départ','Starting planes')}">
       <button type="button" class="btn btn-secondary" data-family="dod" aria-pressed="true">${t('Faces du dodécaèdre','Faces of the dodecahedron')}</button>
       <button type="button" class="btn btn-secondary" data-family="ico" aria-pressed="false">${t('Faces de l’icosaèdre','Faces of the icosahedron')}</button></div>
     <div class="act-buttons st-stages" role="group" aria-label="${t('Étape','Stage')}" id="st-stages"></div>
     <div class="act-buttons"><button type="button" class="btn btn-secondary" id="st-face" aria-pressed="true">${t('Distinguer une face','Pick out one face')}</button>
       <button type="button" class="btn btn-secondary" id="st-turn">${t('Tourner la vue','Turn the view')}</button></div>`,
    `<ol>
      <li>${t('Stellation : on garde les plans des faces et on prolonge chaque face dans son plan jusqu’à ce qu’elle rencontre de nouveau les autres. Dans le plan d’une face du dodécaèdre, les 10 autres plans non parallèles tracent 10 droites ; elles découpent des régions de plus en plus grandes autour du pentagone de départ (le schéma sous la figure).','Stellation: keep the face planes and extend each face in its plane until it meets the others again. In the plane of one face of the dodecahedron, the 10 other non-parallel planes draw 10 lines; they cut out larger and larger regions around the starting pentagon (the diagram under the figure).')}</li>
      <li>${t('Les faces deviennent des pentagrammes {5/2} (petit et grand dodécaèdres étoilés), ou de grands pentagones qui se traversent (grand dodécaèdre). Avec les faces de l’icosaèdre on obtient le grand icosaèdre, aux faces triangulaires. Chacun a des faces régulières toutes identiques et le même nombre de faces à chaque sommet : ce sont des polyèdres réguliers, mais pas convexes.','The faces become pentagrams {5/2} (small and great stellated dodecahedra), or large pentagons that pass through each other (great dodecahedron). With the faces of the icosahedron one gets the great icosahedron, with triangular faces. Each has identical regular faces and the same number of faces at every vertex: they are regular polyhedra, but not convex.')}</li>
      <li>${t('Euler : V − E + F = 2 pour tout polyèdre convexe, car sa surface est comme une sphère. Le petit dodécaèdre étoilé donne 12 − 30 + 12 = −6 : en comptant chaque pentagramme comme une seule face, sa surface n’est pas une sphère déformée. Le grand dodécaèdre étoilé et le grand icosaèdre donnent 2.','Euler: V − E + F = 2 for every convex polyhedron, because its surface is like a sphere. The small stellated dodecahedron gives 12 − 30 + 12 = −6: counting each pentagram as one face, its surface is not a deformed sphere. The great stellated dodecahedron and the great icosahedron give 2.')}</li>
      <li>${t('La densité compte combien de fois la surface fait le tour du centre : sur une demi-droite partant du centre, on compte les traversées (le cœur d’un pentagramme compte deux fois). Elle vaut 1 pour un solide convexe, 3 ou 7 ici.','Density counts how many times the surface wraps round the centre: along a half-line from the centre, count the crossings (the core of a pentagram counts twice). It is 1 for a convex solid, 3 or 7 here.')}</li>
      <li>${t('Kepler décrit les deux dodécaèdres étoilés en 1619, Poinsot les deux autres en 1809. Cauchy prouve en 1813 qu’il n’y a pas d’autre polyèdre régulier étoilé : 5 convexes et 4 étoilés, 9 en tout.','Kepler described the two stellated dodecahedra in 1619, Poinsot the other two in 1809. Cauchy proved in 1813 that there is no other regular star polyhedron: 5 convex and 4 star ones, 9 in all.')}</li>
      <li>${t('À toi : le grand dodécaèdre a les mêmes 12 sommets et les mêmes 30 arêtes que l’icosaèdre. Combien de faces se rejoignent à chacun de ses sommets ? (5, comme l’icosaèdre, mais ses faces sont des pentagones.)','Your turn: the great dodecahedron has the same 12 vertices and 30 edges as the icosahedron. How many faces meet at each of its vertices? (5, like the icosahedron, but its faces are pentagons.)')}</li>
    </ol>
    <p>${t('Voir aussi : ','See also: ')}<a href="#gallery/polyhedra">${t('couper les sommets d’un solide de Platon','cutting the corners of a Platonic solid')}</a> · <a href="#gallery/wythoff">${t('le triangle de Wythoff et les solides archimédiens','the Wythoff triangle and the Archimedean solids')}</a></p>`);
  const g=o.g,stage0=root.querySelector('.exhibit-stage'),controls=root.querySelector('.exhibit-controls'),top=document.createElement('div');
  top.className='exhibit-band';controls.classList.add('exhibit-band');
  top.append(...[...controls.children].filter(el=>el.matches('fieldset, .feedback')));stage0.before(top);stage0.after(controls);
  const fig=document.createElement('figure');fig.className='exhibit-band st-diagram';controls.after(fig);
  const MS=metricStrip(fig,t,[{id:'name',label:t('Solide','Solid')},{id:'vef',label:t('Sommets V, arêtes E, faces F','Vertices V, edges E, faces F'),kind:'exact'},{id:'chi',label:'V − E + F',kind:'exact'},
    {id:'vert',label:t('Faces à chaque sommet','Faces at each vertex'),kind:'exact'},{id:'dens',label:t('Densité','Density'),kind:'exact'}]);
  const fb=root.querySelector('#st-verdict'),stageBox=root.querySelector('#st-stages');
  function verdict(){
    const need=SEQUENCES.dod.slice(1).filter(id=>!seen.has(id));let text,cls='';
    if(answer==null)text=t('Choisis une réponse, puis regarde les trois étapes étoilées du dodécaèdre et lis V − E + F.','Choose an answer, then look at the three star stages of the dodecahedron and read V − E + F.');
    else if(need.length)text=t(`Réponse notée. Il reste à voir : ${need.map(nm).join(', ')}.`,`Answer noted. Still to see: ${need.map(nm).join(', ')}.`);
    else{const ok=answer===1;cls=ok?'success':'error';text=(ok?t('Bien vu. ','Well spotted. '):t('Pas tout à fait. ','Not quite. '))+t('Le petit dodécaèdre étoilé et le grand dodécaèdre donnent 12 − 30 + 12 = −6 ; le grand dodécaèdre étoilé donne 2. La formule d’Euler demande une surface comme une sphère, ce que ces solides n’ont pas tous.','The small stellated dodecahedron and the great dodecahedron give 12 − 30 + 12 = −6; the great stellated dodecahedron gives 2. Euler’s formula needs a surface like a sphere, which not all of these solids have.');}
    if(fb.textContent!==text){const was=fb.className;fb.className='feedback'+(cls?' '+cls:'');fb.textContent=text;if(cls&&was!==fb.className)illuminateFeedback(fb,opts.reduced);}
  }
  function buttons(){stageBox.innerHTML=SEQUENCES[family].map(id=>`<button type="button" class="btn btn-secondary" data-stage="${id}" aria-pressed="${id===stage}">${nm(id)}</button>`).join('');
    stageBox.querySelectorAll('[data-stage]').forEach(b=>o.on(b,'click',()=>{stage=b.dataset.stage;seen.add(stage);buttons();update();}));}
  root.querySelectorAll('[data-family]').forEach(b=>o.on(b,'click',()=>{family=b.dataset.family;root.querySelectorAll('[data-family]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));stage=SEQUENCES[family][1];seen.add(stage);buttons();update();}));
  root.querySelectorAll('[name=st-guess]').forEach(r=>o.on(r,'change',()=>{answer=+r.value;verdict();}));
  const fbtn=root.querySelector('#st-face');o.on(fbtn,'click',()=>{showFace=!showFace;fbtn.setAttribute('aria-pressed',String(showFace));update();});
  o.on(root.querySelector('#st-turn'),'click',()=>{view.yaw+=Math.PI/6;o.redraw();});
  dragOrbit(o,view);
  // the stellation diagram of plane 0: the lines, the faces of the earlier stages dashed, the current face filled
  function drawDiagram(){
    const D=diagram(family,0),idx=SEQUENCES[family].indexOf(stage),R=Math.max(...D.outlines.flat().map(p=>Math.hypot(...p)))*1.08,k=100/R,P=p=>`${(p[0]*k).toFixed(2)},${(-p[1]*k).toFixed(2)}`;
    const lines=D.lines.map(([a,b])=>{const n=Math.hypot(...a),u=[a[0]/n,a[1]/n],c=b/n,p0=[u[0]*c,u[1]*c],d=[-u[1]*R*2,u[0]*R*2];return `<line x1="${((p0[0]-d[0])*k).toFixed(2)}" y1="${(-(p0[1]-d[1])*k).toFixed(2)}" x2="${((p0[0]+d[0])*k).toFixed(2)}" y2="${(-(p0[1]+d[1])*k).toFixed(2)}"/>`;}).join('');
    const outs=D.outlines.map((q,i)=>i===idx?`<polygon class="st-now" points="${q.map(P).join(' ')}"/>`:`<polygon class="st-was${i<idx?' st-before':''}" points="${q.map(P).join(' ')}"/>`).join('');
    fig.innerHTML=`<svg viewBox="-104 -104 208 208" role="img" aria-label="${t('Schéma de stellation du plan d’une face','Stellation diagram of one face plane')}"><g class="st-lines">${lines}</g>${outs}</svg><figcaption>${t(`Le plan d’une face. Traits fins : les droites où les autres plans le coupent. En couleur : la face du ${nm(stage).toLowerCase()} dans ce plan ; en pointillés : les faces des autres étapes.`,`The plane of one face. Thin lines: where the other planes cut it. In colour: the face of the ${nm(stage).toLowerCase()} in this plane; dotted: the faces of the other stages.`)}</figcaption>`;
    fig.append(MS.el);
  }
  function update(){
    const S=stellation(stage),fv=[...new Set(facesAtVertex(S))];
    MS.set('name',`${nm(stage)} ${S.schlafli}`);MS.set('vef',`${S.V} · ${S.E} · ${S.F}`);MS.set('chi',`${S.V} − ${S.E} + ${S.F} = ${S.chi}`);
    MS.set('vert',fv.join(', '));MS.set('dens',String(density(S)));
    o.cv.setAttribute('aria-label',t(`${nm(stage)} : ${S.F} faces ${S.step===2?'en pentagramme':S.faces[0].verts.length===3?'triangulaires':'pentagonales'}. Glisser ou les flèches font tourner la vue.`,`${nm(stage)}: ${S.F} ${S.step===2?'pentagram':S.faces[0].verts.length===3?'triangular':'pentagonal'} faces. Drag or use the arrow keys to turn the view.`));
    drawDiagram();verdict();o.redraw();
  }
  o.animate(()=>{
    const C=palette(),S=stellation(stage),P=pieces(S),R=Math.max(...S.verts.map(v=>Math.hypot(...v))),scale=Math.min(o.W,o.H)*.44/R;
    g.clearRect(0,0,o.W,o.H);g.fillStyle=C.sunken;g.fillRect(0,0,o.W,o.H);
    const o0=orbitProject([0,0,0],view.yaw,view.pitch,1)[2],shift=[o.W/2-320,o.H/2-224];
    const list=P.map(q=>{const s=q.pts.map(v=>orbitProject(v,view.yaw,view.pitch,scale));return {q,s,d:s.reduce((a,b)=>a+b[2],0)/s.length,k:(orbitProject(q.normal,view.yaw,view.pitch,1)[2]-o0)};}).sort((a,b)=>a.d-b.d);
    g.lineJoin='round';
    for(const {q,s,k} of list){g.beginPath();s.forEach(([x,y],i)=>i?g.lineTo(x+shift[0],y+shift[1]):g.moveTo(x+shift[0],y+shift[1]));g.closePath();
      const mine=showFace&&q.face===0;g.fillStyle=mine?C.object:C.c[q.face%4];g.fill();
      const dark=.5*(1-Math.abs(k));if(dark>.01){g.globalAlpha=dark;g.fillStyle='#000';g.fill();g.globalAlpha=1;}
      g.strokeStyle=mine?C.object:C.c[q.face%4];g.lineWidth=.8;g.stroke();}
    o.read(`${nm(stage)} ${S.schlafli} · V − E + F = ${S.chi}`);
    return false;
  });
  buttons();update();void dot;
  return ()=>{o.stop();MS.el.remove();fig.remove();};
}
