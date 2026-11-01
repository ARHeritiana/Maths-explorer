// Cutting and regluing polygons: any two simple polygons of equal area are cut into pieces that move (no reflection)
// through a common rectangle R from one to the other (Wallace-Bolyai-Gerwien). Presets, a gallery of pairs, polygons
// drawn on the canvas or typed as x,y pairs (same validator). Gallery exhibit; maths in gallery/gallery-equidecomposition-model.js.
import {exhibit,button,field,palette,idleGuard} from './gallery-kit.js';
import {PRESETS,GALLERY,AREA,MAX_VERTICES,STAGES,preset,buildChain,frame,pieceCount,parseVertices,validatePolygon} from './gallery-equidecomposition-model.js';
const WIDTH=640,HEIGHT=440,MARGIN=18;
export function equidecomposition(root,opts){
  const {t,lang,reduced}=opts,num=(v,d=1)=>lang==='fr'?v.toFixed(d).replace('.',','):v.toFixed(d);
  const name=id=>t(...preset(id).name);
  const LABELS=[
    t('Étape 1 · P : on triangule, puis chaque triangle devient un rectangle (coupe à mi-hauteur, deux morceaux tournent d’un demi-tour)','Step 1 · P: triangulate; each triangle becomes a rectangle (cut at mid-height, rotate two pieces by 180°)'),
    t('Étape 2 · P : chaque rectangle devient un parallélogramme dont le côté oblique mesure W (on fait glisser des bandes)','Step 2 · P: each rectangle is sheared into a parallelogram with slanted side W (slide strips)'),
    t('Étape 3 · P : on relit le parallélogramme avec la base W ; en faisant glisser des bandes, on obtient un rectangle de largeur W','Step 3 · P: re-read the parallelogram with base W; slide strips to get a rectangle of width W'),
    t('Étape 4 · P : on empile les rectangles de largeur W pour former R = W × A/W','Step 4 · P: stack the width-W rectangles into R = W × A/W'),
    t('Étape 5 · Q à l’envers : on dépile R en rectangles de largeur W','Step 5 · Q reversed: unstack R into rectangles of width W'),
    t('Étape 6 · Q à l’envers : chaque rectangle devient un parallélogramme','Step 6 · Q reversed: each rectangle becomes a parallelogram'),
    t('Étape 7 · Q à l’envers : chaque parallélogramme devient le rectangle d’un triangle de Q','Step 7 · Q reversed: each parallelogram becomes the rectangle of a triangle of Q'),
    t('Étape 8 · Q à l’envers : les rectangles redeviennent des triangles, qui forment Q','Step 8 · Q reversed: the rectangles become triangles again, which make up Q')];
  const MESSAGES={
    numbers:t('Écris les sommets par paires séparées par des points-virgules, par exemple 0,0; 10,0; 10,6; 0,6. Le point ou la virgule fait la décimale ; avec une virgule décimale, sépare x et y par une espace : 2,5 3,5; 10 6.','Type vertices as pairs separated by semicolons, for example 0,0; 10,0; 10,6; 0,6. A point or a comma is the decimal mark; with a decimal comma, separate x and y by a space: 2,5 3,5; 10 6.'),
    few:t('Il faut au moins trois sommets distincts.','At least three distinct vertices are needed.'),
    many:t(`Trop de sommets (au plus ${MAX_VERTICES}).`,`Too many vertices (at most ${MAX_VERTICES}).`),
    thin:t('Trop fin : la boîte englobante est plus de 40 fois plus longue que large, les morceaux seraient illisibles. Annule un sommet ou recommence.','Too thin: the bounding box is more than 40 times longer than wide, which would make the pieces unreadable. Undo or cancel.'),
    invalid:t('Polygone refusé : il doit être simple (aucun côté ne croise, ne touche ni ne recouvre un autre côté). Annule un sommet ou recommence.','Polygon refused: it must be simple (no side may cross, touch or overlap another side). Undo or cancel.')};
  const options=(sel,withCustom)=>PRESETS.map(p=>`<option value="${p.id}" ${p.id===sel?'selected':''}>${name(p.id)}</option>`).join('')+(withCustom?`<option value="custom">${t('Personnalisé','Custom')}</option>`:'');
  let pid='hexagon',qid='square',P=preset(pid).pts,Q=preset(qid).pts,cus={P:null,Q:null},CH=buildChain(P,Q),T=0,playing=false,drawing=null,pts=[],msg='',ver=0,view=null,viewBox=null,tap=null,last=0;
  const o=exhibit(root,opts,t('Choisis deux polygones P et Q (ils sont remis à la même aire, 500) : la figure découpe P en morceaux qui se déplacent, sans symétrie, jusqu’à un rectangle commun R, puis passe de R à Q. Lance l’animation ou avance étape par étape. Tu peux aussi dessiner un polygone en cliquant sur la figure, ou en écrivant ses sommets.','Choose two polygons P and Q (they are rescaled to the same area, 500): the figure cuts P into pieces that move, without reflection, into a common rectangle R, then goes from R to Q. Play the animation or go step by step. You can also draw a polygon by clicking the figure, or by typing its vertices.'),
    `<label class="act-field"><span class="act-label">P</span><select id="eq-p">${options(pid)}</select></label><label class="act-field"><span class="act-label">Q</span><select id="eq-q">${options(qid)}</select></label>`+
    button('eq-dp',t('Dessiner P','Draw P'))+button('eq-dq',t('Dessiner Q','Draw Q'))+
    `<div class="exhibit-subcontrols eq-draw" id="eq-draw" hidden>${button('eq-close',t('Fermer le polygone','Close the polygon'),true)}${button('eq-undo',t('Annuler le dernier sommet','Undo last vertex'))}${button('eq-cancel',t('Abandonner','Cancel'))}<label class="act-field eq-vertices"><span class="act-label">${t('Écrire des sommets (alternative au clavier)','Type vertices (keyboard alternative)')}</span><input id="eq-vertices" type="text" inputmode="text" autocomplete="off" placeholder="0,0; 10,0; 10,6; 0,6"></label>${button('eq-add',t('Ajouter ces sommets','Add these vertices'))}</div>`+
    button('eq-prev','◀')+button('eq-play',t('Lancer','Play'),true)+button('eq-next','▶|')+
    field('eq-t',t('Avancement (étapes 1 à 8)','Progress (steps 1 to 8)'),0,STAGES,.05,0)+
    `<div class="exhibit-presets" role="group" aria-label="${t('Exemples de paires','Example pairs')}">${GALLERY.map(([a,b],i)=>button('eq-g'+i,`${name(a)} → ${name(b)}`)).join('')}</div>`,
    `<p>${t('Théorème de Wallace-Bolyai-Gerwien : deux polygones ont la même aire si et seulement si l’un se découpe en un nombre fini de polygones qui, déplacés par des rotations et des translations, se rassemblent en l’autre. Une figure n’est pas une preuve : l’animation en montre le principe, la démonstration est la suite de lemmes ci-dessous.','Wallace-Bolyai-Gerwien theorem: two polygons have the same area if and only if one can be cut into finitely many polygons that, moved by rotations and translations, reassemble into the other. A figure is not a proof: the animation shows the idea, the proof is the sequence of lemmas below.')}</p>
    <ol><li>${t('<b>Polygone → triangles.</b> La triangulation par oreilles existe pour tout polygone simple : on coupe un sommet convexe dont le triangle ne contient aucun autre sommet.','<b>Polygon → triangles.</b> Ear clipping works for every simple polygon: cut off a convex vertex whose triangle contains no other vertex.')}</li>
    <li>${t('<b>Triangle → rectangle</b> (3 morceaux). On prend le plus grand côté pour base, on coupe à mi-hauteur, puis on partage le triangle du haut par sa hauteur et on fait tourner chaque moitié d’un demi-tour autour du milieu d’un côté oblique. On obtient un rectangle de base × h/2.','<b>Triangle → rectangle</b> (3 pieces). Take the longest side as base, cut at mid-height, split the top triangle by its altitude and rotate each half by 180° about the midpoint of a slanted side. The result is a rectangle base × h/2.')}</li>
    <li>${t('<b>Rectangle a × b → rectangle W × (ab/W).</b> (i) On fait glisser des bandes de largeur a pour cisailler le rectangle en un parallélogramme dont le côté oblique mesure W. (ii) On relit ce parallélogramme avec la base W et on fait glisser des bandes de largeur W pour obtenir un rectangle.','<b>Rectangle a × b → rectangle W × (ab/W).</b> (i) Slide strips of width a to shear the rectangle into a parallelogram whose slanted side has length W. (ii) Re-read the same parallelogram with base W and slide strips of width W to get a rectangle.')}</li>
    <li>${t('<b>Empilement.</b> Tous les rectangles de largeur W s’empilent en un seul rectangle R de dimensions W × A/W, où A est l’aire commune.','<b>Stack.</b> All rectangles of width W stack into one rectangle R of size W × A/W, with A the common area.')}</li></ol>
    <p>${t('<b>Transitivité.</b> Si P ~ R et Q ~ R, alors P ~ Q : on superpose les découpes de P → R et de R → Q (raffinement commun), ce qui donne un nombre fini de morceaux qui envoient P sur Q. L’animation joue la chaîne P → R, puis la chaîne Q → R à l’envers.','<b>Transitivity.</b> If P ~ R and Q ~ R then P ~ Q: superpose the cut patterns of P → R and R → Q (common refinement), which gives finitely many pieces mapping P onto Q. The animation plays the chain P → R, then the chain Q → R in reverse.')}</p>
    <p>${t('Cette construction vise la clarté, pas le plus petit nombre de morceaux. Elle ne se généralise pas à l’espace : Max Dehn a montré en 1900 qu’un cube et un tétraèdre régulier de même volume ne sont pas équidécomposables, ce qui règle le troisième problème de Hilbert. Pour « carrer le disque », il faut des morceaux qui ne sont plus polygonaux (problème de Tarski, résolu par Laczkovich en 1990).','The construction favours clarity over the least number of pieces. It does not extend to space: Max Dehn showed in 1900 that a cube and a regular tetrahedron of equal volume are not equidecomposable, which settles Hilbert’s third problem. Squaring the disc needs pieces that are no longer polygonal (Tarski’s problem, solved by Laczkovich in 1990).')}</p>`);
  const g=o.g,C0=()=>palette(),el=id=>root.querySelector('#'+id),cv=o.cv;
  cv.setAttribute('role','img');
  cv.setAttribute('aria-label',t('Dissection animée du polygone P en un rectangle R puis en un polygone Q ; l’étape en cours est décrite sous la figure. Ctrl + molette ou pincement pour zoomer, Maj-glisser pour déplacer la vue, 0 pour la réinitialiser.','Animated dissection of polygon P into a rectangle R and then into polygon Q; the current step is described below the figure. Ctrl + wheel or pinch to zoom, Shift-drag to pan, 0 to reset the view.'));
  el('eq-prev').setAttribute('aria-label',t('Étape précédente','Previous step'));el('eq-next').setAttribute('aria-label',t('Étape suivante','Next step'));
  const selP=el('eq-p'),selQ=el('eq-q'),playBtn=el('eq-play'),slider=el('eq-t'),sliderOut=el('eq-t-out'),panel=el('eq-draw');
  const boxOf=pointsList=>{const xs=pointsList.map(p=>p[0]),ys=pointsList.map(p=>p[1]);return [Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];};
  function fit(box){const [x0,y0,x1,y1]=box,bw=Math.max(x1-x0,1e-9),bh=Math.max(y1-y0,1e-9),s=Math.min((WIDTH-2*MARGIN)/bw,(HEIGHT-2*MARGIN)/bh);view={s,ox:MARGIN+(WIDTH-2*MARGIN-bw*s)/2-x0*s,oy:MARGIN+(HEIGHT-2*MARGIN-bh*s)/2-y0*s};}
  const X=p=>[view.ox+view.s*p[0],view.oy+view.s*p[1]],unX=p=>[(p[0]-view.ox)/view.s,(p[1]-view.oy)/view.s];
  function rebuild(){CH=buildChain(P,Q);viewBox=boxOf(CH.bbox);fit(viewBox);T=0;ver++;}
  function setPlaying(on){playing=on;playBtn.textContent=on?t('Pause','Pause'):T>=STAGES?t('Rejouer','Replay'):t('Lancer','Play');}
  function endDraw(){drawing=null;pts=[];msg='';panel.hidden=true;el('eq-dp').setAttribute('aria-pressed','false');el('eq-dq').setAttribute('aria-pressed','false');viewBox=boxOf(CH.bbox);fit(viewBox);ver++;}
  function startDraw(w){setPlaying(false);drawing=w;pts=[];msg='';panel.hidden=false;el('eq-dp').setAttribute('aria-pressed',String(w==='P'));el('eq-dq').setAttribute('aria-pressed',String(w==='Q'));ver++;}
  const addCustom=sel=>{if(![...sel.options].some(x=>x.value==='custom')){const op=root.ownerDocument.createElement('option');op.value='custom';op.textContent=t('Personnalisé','Custom');sel.append(op);}sel.value='custom';};
  function setPair(a,b){pid=a;qid=b;P=preset(a).pts;Q=preset(b).pts;selP.value=a;selQ.value=b;endDraw();rebuild();setPlaying(!reduced());}
  o.on(selP,'change',()=>{if(selP.value==='custom'&&cus.P)P=cus.P;else{pid=selP.value;P=preset(pid).pts;}endDraw();rebuild();setPlaying(false);});
  o.on(selQ,'change',()=>{if(selQ.value==='custom'&&cus.Q)Q=cus.Q;else{qid=selQ.value;Q=preset(qid).pts;}endDraw();rebuild();setPlaying(false);});
  GALLERY.forEach(([a,b],i)=>o.on(el('eq-g'+i),'click',()=>setPair(a,b)));
  o.on(playBtn,'click',()=>{if(T>=STAGES)T=0;setPlaying(!playing);last=performance.now();ver++;});
  o.on(slider,'input',()=>{T=Number(slider.value);setPlaying(false);ver++;});
  o.on(el('eq-prev'),'click',()=>{setPlaying(false);T=Math.max(0,Math.ceil(T-1e-9)-1);ver++;});
  o.on(el('eq-next'),'click',()=>{setPlaying(false);T=Math.min(STAGES,Math.floor(T+1e-9)+1);ver++;});
  o.on(el('eq-dp'),'click',()=>startDraw('P'));o.on(el('eq-dq'),'click',()=>startDraw('Q'));
  o.on(el('eq-cancel'),'click',endDraw);
  o.on(el('eq-undo'),'click',()=>{pts.pop();msg='';ver++;});
  function addTyped(){
    if(!drawing)return;const v=parseVertices(el('eq-vertices').value);
    if(!v){msg=MESSAGES.numbers;ver++;return;}
    pts.push(...v);el('eq-vertices').value='';msg=t(`${pts.length} sommets pour l’instant. Ferme le polygone quand tu as fini : les mêmes vérifications s’appliquent qu’au clic.`,`${pts.length} vertices so far. Close the polygon when done: the same checks apply as for clicks.`);
    const b=boxOf(pts),c=viewBox;viewBox=[Math.min(b[0],c[0]),Math.min(b[1],c[1]),Math.max(b[2],c[2]),Math.max(b[3],c[3])];fit(viewBox);ver++;
  }
  o.on(el('eq-add'),'click',addTyped);
  o.on(el('eq-vertices'),'keydown',e=>{if(e.key==='Enter'){e.preventDefault();addTyped();}});
  o.on(el('eq-close'),'click',()=>{
    const r=validatePolygon(pts);if(!r.ok){msg=MESSAGES[r.code];ver++;return;}
    if(drawing==='P'){P=r.poly;cus.P=r.poly;addCustom(selP);}else{Q=r.poly;cus.Q=r.poly;addCustom(selQ);}
    endDraw();rebuild();setPlaying(!reduced());
  });
  // A click (not a drag, not a pan) adds a vertex. While drawing, the figure owns the touch so the page does not scroll.
  o.touchHit(()=>drawing!==null);
  o.on(cv,'pointerdown',e=>{if(!drawing||e.shiftKey||(e.button&&e.button!==0))return;tap={x:e.clientX,y:e.clientY};e.preventDefault();});
  o.on(cv,'pointerup',e=>{if(!tap||!drawing){tap=null;return;}const moved=Math.hypot(e.clientX-tap.x,e.clientY-tap.y);tap=null;if(moved>8)return;
    pts.push(unX(o.point(e)));msg='';ver++;});
  o.cancelDrag=()=>{tap=null;};
  rebuild();setPlaying(!reduced());
  const idle=idleGuard(o);
  o.animate(dt=>{
    // frame time, or real elapsed time under reduced motion (nothing starts by itself, but Play still plays)
    const now=performance.now(),real=dt||Math.min(.1,(now-(o.last||now))/1000);o.last=now;
    if(playing){T=Math.min(STAGES,T+real/3.2);if(T>=STAGES)setPlaying(false);ver++;}
    const step=Math.min(STAGES-1,Math.floor(T));
    if(idle(false,`${ver}`))return;
    const C=C0(),fr=frame(CH,T);
    g.clearRect(0,0,o.W,o.H);g.fillStyle=C.sunken;g.fillRect(-2000,-2000,4640,4440);g.lineJoin='round';
    const trace=poly=>{g.beginPath();poly.map(X).forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();};
    g.lineWidth=1.5;g.setLineDash([6,5]);g.strokeStyle=C.muted;g.fillStyle=C.muted;g.font='14px system-ui, sans-serif';
    [[CH.AP,'P'],[CH.AQ,'Q'],[CH.R,'R']].forEach(([A,label])=>{trace(A);g.stroke();const m=X([Math.min(...A.map(p=>p[0])),Math.min(...A.map(p=>p[1]))]);g.fillText(label,m[0],m[1]-5);});
    g.setLineDash([]);
    if(drawing){
      g.strokeStyle=C.accent;g.fillStyle=C.accent;g.lineWidth=2;g.beginPath();pts.map(X).forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();
      pts.map(X).forEach(p=>{g.beginPath();g.arc(p[0],p[1],4,0,2*Math.PI);g.fill();});
      o.read(msg||t(`Tu dessines ${drawing} (${pts.length} sommet${pts.length>1?'s':''}) : clique pour ajouter des sommets (au moins 3, sans auto-intersection), ou écris-les, puis ferme le polygone.`,`You are drawing ${drawing} (${pts.length} vert${pts.length===1?'ex':'ices'}): click to add vertices (at least 3, no self-intersection), or type them, then close the polygon.`));
      return;
    }
    fr.pieces.forEach(pc=>{trace(pc.poly);g.globalAlpha=.8;g.fillStyle=C.c[pc.colour];g.fill();g.globalAlpha=1;g.strokeStyle=C.ink;g.lineWidth=1;g.stroke();});
    slider.value=String(T);sliderOut.textContent=num(Math.min(STAGES,T+0),2);slider.setAttribute('aria-valuetext',t(`Étape ${step+1} sur ${STAGES}`,`Step ${step+1} of ${STAGES}`));
    o.read(`${LABELS[step]} · ${t('Aire commune','Common area')} A = ${AREA} u² · W = ${num(CH.W)} · ${t('triangles : ','triangles: ')}P ${CH.nP}, Q ${CH.nQ} · ${t('morceaux dans cette étape : ','pieces in this step: ')}${pieceCount(CH,step)}`);
  });
  return o.stop;
}
