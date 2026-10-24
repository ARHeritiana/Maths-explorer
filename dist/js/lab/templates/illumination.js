// One retained mirrored-room editor, shared by the gallery and all laboratory missions.
export {createStage} from './inference.js';
import {exhibit,button,background,path,dot} from '../../gallery-kit.js';
import * as M from '../../illumination-model.js';
import {PRESETS} from '../../illumination-presets.js';
import {model,boundary} from '../experiments/illumination.js';
export function mount({stage,fmt,getState,setState}){
 const t=(fr,en)=>fmt.t([fr,en]),root=stage.wrap;
 const o=exhibit(root,{t,reduced:()=>stage.reduced()},t('Glisse la lampe. Dans un éditeur, touche un mur pour ajouter un sommet, puis glisse les sommets ; en mode courbe, glisse le milieu d’un mur. H : choisir lampe, sommet ou courbure ; flèches : déplacer ; Insérer : ajouter un sommet ; Suppr : supprimer.','Drag the lamp. In an editor, tap a wall to add a vertex, then drag vertices; in curve mode drag a wall midpoint. H: select lamp, vertex or curvature; arrows: move; Insert: add vertex; Delete: remove.'),
 `<label class="act-field"><span>${t('Manipuler','Edit')}</span><select data-edit><option value="lamp">${t('Lampe','Lamp')}</option><option value="vertices">${t('Sommets','Vertices')}</option><option value="curves">${t('Courbures','Curvature')}</option></select></label>`+button('light-play',t('Parcourir les rayons','Play rays'))+button('light-step',t('Un pas','One step'))+button('light-reset',t('Réinitialiser la pièce','Reset room'))+button('light-empty',t('Dessiner une pièce','Draw a room'))+button('light-close',t('Fermer la pièce','Close boundary'))+button('light-unfold',t('Déplier le premier rayon','Unfold first ray')),
 `<p>${t('Les zones non visitées après N réflexions ne sont pas déclarées sombres. Normales et intersections sont calculées sur les courbes, sans remplacer les miroirs par des facettes. La validation d’une pièce courbe utilise un échantillonnage fin du contour : évite les détails plus petits que 0,05 unité.','Unvisited regions after N reflections are not declared dark. Normals and intersections are calculated on the curves, without replacing mirrors by facets. Curved-room validation samples the boundary finely: avoid details smaller than 0.05 units.')}</p>`);
 o.cv.setAttribute('aria-label',root.querySelector('.act-help').textContent+' '+o.cv.getAttribute('aria-label'));
 const g=o.g,edit=root.querySelector('[data-edit]'),play=root.querySelector('#light-play'),close=root.querySelector('#light-close'),unfoldButton=root.querySelector('#light-unfold');let selected=0,drag=null,dirty=true,key='',elapsed=Infinity;
 const world=p=>{const b=PRESETS[getState().room].bounds,S=Math.min(o.W/(b[1]-b[0]),o.H/(b[3]-b[2]))*.88;return [(p[0]-o.W/2)/S+(b[0]+b[1])/2,(p[1]-o.H/2)/S+(b[2]+b[3])/2];};
 const screen=p=>{const b=PRESETS[getState().room].bounds,S=Math.min(o.W/(b[1]-b[0]),o.H/(b[3]-b[2]))*.88;return [o.W/2+(p[0]-(b[0]+b[1])/2)*S,o.H/2+(p[1]-(b[2]+b[3])/2)*S];};
 const custom=()=>['polygon','curved'].includes(getState().room);
 const handles=()=>{const s=getState();return [{type:'lamp',p:[s.sx,s.sy]},...(custom()?s.vertices.map((p,i)=>({type:'vertex',i,p})):[]),...(s.room==='curved'?s.vertices.map((p,i)=>({type:'bend',i,p:s.bends[i]||M.pointAt(M.line(p,s.vertices[(i+1)%s.vertices.length]),.5)})):[])];};
 function move(h,p){if(h.type==='lamp'){setState({sx:p[0],sy:p[1]});}else if(h.type==='vertex'){const s=getState(),vertices=s.vertices.map(q=>[...q]);vertices[h.i]=p;setState({vertices,playing:false});}else{const bends=getState().bends.map(q=>q&&[...q]);bends[h.i]=p;setState({bends,playing:false});}dirty=true;}
 function addVertex(){const s=getState();if(!custom()||s.vertices.length>=32)return;const i=Math.max(0,handles()[selected]?.i||0),a=s.vertices[i]||[-2,-2],b=s.vertices[(i+1)%s.vertices.length]||[2,2],p=a.map((x,k)=>(x+b[k])/2),vertices=s.vertices.map(q=>[...q]),insert=Math.min(vertices.length,i+1);vertices.splice(insert,0,p);setState({vertices,bends:vertices.map(()=>null)});selected=insert+1;dirty=true;}
 function removeVertex(){const s=getState(),h=handles()[selected];if(!custom()||h?.type!=='vertex'||s.vertices.length<=3)return;const vertices=s.vertices.filter((_,i)=>i!==h.i);setState({vertices,bends:vertices.map(()=>null)});selected=0;dirty=true;}
 o.on(edit,'change',()=>{dirty=true;});
 o.on(play,'click',()=>{const s=getState();if(stage.reduced()){elapsed=Infinity;setState({playing:false});}else{if(!s.playing&&!Number.isFinite(elapsed))elapsed=0;setState({playing:!s.playing});}dirty=true;});
 o.on(root.querySelector('#light-step'),'click',()=>{elapsed=Number.isFinite(elapsed)?elapsed+1:1;setState({playing:false});dirty=true;});
 o.on(root.querySelector('#light-reset'),'click',()=>{const s=getState(),p=PRESETS[s.room];setState({sx:p.source[0],sy:p.source[1],vertices:[[-4,-3],[4,-3],[4,3],[-4,3]],bends:[null,null,null,null],closed:true,playing:false,unfolding:false});elapsed=Infinity;selected=0;dirty=true;});
 o.on(root.querySelector('#light-empty'),'click',()=>{setState({room:custom()?getState().room:'polygon',vertices:[],bends:[],closed:false,playing:false});edit.value='vertices';selected=0;dirty=true;});
 o.on(close,'click',()=>{setState({closed:true});dirty=true;});
 o.on(unfoldButton,'click',()=>{setState({unfolding:!getState().unfolding});dirty=true;});
 o.on(o.cv,'pointerdown',e=>{
  const ps=o.point(e),p=world(ps),s=getState(),hs=handles(),allowed=h=>h.type==='lamp'||edit.value==='vertices'&&h.type==='vertex'||edit.value==='curves'&&h.type==='bend';
  const width=o.cv.getBoundingClientRect().width||o.W,hitRadius=22*o.W/width/(o.navigation?.camera.scale||1);
  let hit=null;hs.forEach((h,i)=>{const q=screen(h.p),d=Math.hypot(q[0]-ps[0],q[1]-ps[1]);if(allowed(h)&&d<hitRadius&&(!hit||d<hit.d))hit={h,i,d};});
  if(hit){selected=hit.i;drag=hit.h;}else if(custom()&&edit.value==='vertices'){
   let vertices=s.vertices.map(q=>[...q]),insert=vertices.length;if(!s.closed||vertices.length<3)vertices.push(p);else{const es=boundary(s);let nearest=0,best=Infinity;es.forEach((edge,i)=>{const q=M.pointAt(edge,.5),d=M.norm(q.map((x,k)=>x-p[k]));if(d<best){best=d;nearest=i;}});insert=nearest+1;vertices.splice(insert,0,p);}
   if(vertices.length<=32){setState({vertices,bends:vertices.map(()=>null)});selected=insert+1;drag={type:'vertex',i:insert,p};}
  }
  o.cv.setPointerCapture?.(e.pointerId);e.preventDefault();dirty=true;
 });
 o.on(o.cv,'pointermove',e=>{if(drag)move(drag,world(o.point(e)));});o.on(o.cv,'pointerup',()=>{drag=null;});o.cancelDrag=()=>{drag=null;};
 o.on(o.cv,'keydown',e=>{if(e.shiftKey||e.ctrlKey||e.metaKey)return;const hs=handles();if(e.key.toLowerCase()==='h'){selected=(selected+1)%hs.length;e.preventDefault();dirty=true;return;}if(e.key==='Insert'){addVertex();e.preventDefault();return;}if(['Delete','Backspace'].includes(e.key)){removeVertex();e.preventDefault();return;}const delta={ArrowLeft:[-.1,0],ArrowRight:[.1,0],ArrowUp:[0,-.1],ArrowDown:[0,.1]}[e.key];if(delta){const h=hs[selected]||hs[0];move(h,h.p.map((x,k)=>x+delta[k]));e.preventDefault();}});
 function drawRay(points,C,distance){let budget=distance;for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],L=M.norm(a.map((x,k)=>x-b[k]));if(budget<=0)break;const t=Math.min(1,budget/L),end=a.map((x,k)=>x+t*(b[k]-x));path(g,[screen(a),screen(end)],{stroke:C.accent,width:1.2,alpha:.5});budget-=L;}}
 o.animate(dt=>{
  const s=getState(),next=JSON.stringify(s);if(next!==key){key=next;dirty=true;}
  if(s.playing&&!stage.reduced()){elapsed+=dt*s.speed;dirty=true;}else if(s.playing&&stage.reduced()){setState({playing:false});elapsed=Infinity;dirty=true;}
  if(!dirty)return;dirty=false;const C=background(o),m=model(s),customRoom=custom(),hs=handles();
  edit.closest('label').hidden=!customRoom;close.hidden=!customRoom||s.closed;root.querySelector('#light-empty').hidden=!customRoom;unfoldButton.disabled=m.edges.some(e=>e.type!=='line');unfoldButton.setAttribute('aria-pressed',String(s.unfolding));play.setAttribute('aria-pressed',String(s.playing));play.textContent=s.playing?t('Pause','Pause'):t('Parcourir les rayons','Play rays');
  const poly=M.flatten(m.edges);path(g,poly.map(screen),{close:s.closed,fill:s.closed?C.surface:null,stroke:C.ink,width:2});
  if(s.unfolding&&m.paths[0]){const u=M.unfold(m.edges,m.paths[0]);if(u){u.copies.slice(1,9).forEach((p,i)=>path(g,p.map(screen),{close:true,stroke:C.muted,alpha:.5/(1+i*.1),width:1}));drawRay(u.points,C,elapsed);}}
  else m.paths.forEach(p=>drawRay(p.points,C,elapsed));
  const target=PRESETS[s.room].target;if(target)dot(g,screen(target),C.neg,6,'T');
  if(s.room==='penrose')for(const p of [[-4,-1],[4,-1],[-4,1],[4,1]])dot(g,screen(p),C.muted,3,'F');
  hs.forEach((h,i)=>{if(h.type==='lamp'||i===selected||customRoom&&(h.type==='vertex'||edit.value==='curves'))dot(g,screen(h.p),i===selected?C.pos:h.type==='lamp'?C.accent:C.obj2,h.type==='lamp'?9:5,h.type==='lamp'?'S':i===selected?String((h.i??0)+1):'');});
  const warning=!m.validation.ok?t('Contour invalide ou ouvert : pas de simulation.','Invalid or open boundary: simulation paused.'):!m.inRoom?t('Place la lampe strictement à l’intérieur de la pièce.','Place the lamp strictly inside the room.'):t(`${m.paths.length} rayons, ${m.segments} segments ; ${m.corners} arrêt(s) à un coin, ${m.tangencies} tangence(s).`,`${m.paths.length} rays, ${m.segments} segments; ${m.corners} corner stop(s), ${m.tangencies} tangencies.`);
  const chosen=hs[selected]||hs[0],name=chosen.type==='lamp'?t('Lampe S','Lamp S'):chosen.type==='vertex'?t('Sommet','Vertex'):t('Courbure','Curvature');
  o.read(warning+' '+name+' '+fmt.pt(...chosen.p)+'. '+(target?t('T est le point non éclairé depuis la position initiale S selon la construction publiée ; déplacer S retire cette garantie.','T is unilluminated from the initial S according to the published construction; moving S removes that guarantee.'):t('Les traces montrent seulement les directions échantillonnées.','Traces show only sampled directions.')));
 });
 return {handles:[],draw(){dirty=true;o.redraw();},destroy(){o.stop();}};
}
