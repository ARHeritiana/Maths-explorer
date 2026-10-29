// Inspect and perturb the certified polyhedral analogue of the Gömböc. Full geometry loads only on this page.
import { exhibit, button, field, palette, path, dot as drawDot } from './gallery-kit.js';
import { CAM3_DEFAULT, cam3Project, cam3Turn } from './camera3d.js';
import * as G from './gallery-gomboc-model.js';
import {assetHref} from './data-loader.js';

export function gomboc(root,opts){
  const {t,lang}=opts,reduced=typeof opts.reduced==='function'?opts.reduced:()=>!!opts.reduced;
  let alive=true,body=null,s=null,playing=false,dirty=true,drag=null,accumulator=0,error='',check=null,baseline=0,keyboardBody=false;
  const cam={...CAM3_DEFAULT},scale=132,num=(v,d=3)=>Number(v).toLocaleString(lang,{maximumFractionDigits:d});
  const o=exhibit(root,{...opts,reduced},t(
    'Glisse le corps pour le pencher, le pousser ou le lancer. Glisse le fond pour tourner la caméra. Au clavier : H sélectionne le corps ; les flèches le penchent. Échap rend les flèches à la caméra ; Maj + flèches déplace la vue ; P pousse ; Espace lance la lecture.',
    'Drag the body to tip, push or throw it. Drag the background to orbit the camera. Keyboard: H selects the body and arrows tip it. Escape returns arrows to the camera; Shift + arrows pan the view; P pushes; Space toggles playback.'),
    `<label class="act-field"><span class="act-label">${t('Geste sur le corps','Body gesture')}</span><select id="go-mode"><option value="tip">${t('Pencher','Tip')}</option><option value="push">${t('Pousser','Push')}</option><option value="throw">${t('Lancer','Throw')}</option><option value="inspect">${t('Inspecter','Inspect')}</option></select></label>`+
    `<label class="act-field"><span class="act-label">${t('Départ','Start')}</span><select id="go-preset"><option value="tip">${t('Corps penché','Tipped body')}</option><option value="stable">${t('Face stable','Stable face')}</option><option value="unstable">${t('Sommet instable','Unstable vertex')}</option><option value="throw">${t('Chute avec rotation','Falling with spin')}</option></select></label>`+
    button('go-play',t('Lecture','Play'),true)+button('go-step',t('Un pas','One step'))+button('go-reset',t('Recommencer','Restart'))+
    `<label><input id="go-follow" type="checkbox" checked> ${t('Suivre le centre de masse','Follow the centre of mass')}</label>`+
    field('go-speed',t('Vitesse de lecture','Playback speed'),.25,4,.25,1)+
    `<details><summary>${t('Contact et précision','Contact and precision')}</summary>`+
    field('go-friction',t('Frottement de glissement μ','Sliding friction μ'),0,1,.05,.35)+
    field('go-rolling',t('Résistance au roulement c','Rolling resistance c'),0,.3,.01,.1)+
    `<label class="act-field"><span class="act-label">${t('Pas de calcul','Time step')}</span><select id="go-dt"><option value="240">1/240 s</option><option value="480">1/480 s</option><option value="960">1/960 s</option></select></label>`+
    button('go-check',t('Comparer avec un pas deux fois plus petit','Compare with half the time step'))+`</details>`,
    `<p>${t('Le corps homogène de cette expérience est le polyèdre à 56 946 faces de Schettini Gherardini, présenté dans une prépublication de 2026. Ce n’est pas la forme lisse originale de Domokos et Várkonyi (2006). Son certificat en arithmétique exacte donne un équilibre stable, aucun équilibre selle et un équilibre instable, relativement à son propre centre de masse.','This homogeneous body is Schettini Gherardini’s 56,946-face polyhedron, presented in a 2026 preprint. It is distinct from the original smooth shape of Domokos and Várkonyi (2006). Its exact-arithmetic certificate gives one stable equilibrium, no saddle and one unstable equilibrium relative to its own centre of mass.')}</p>`+
    `<p>${t('Le dessin utilise une enveloppe allégée. Les contacts numériques utilisent les 113 888 sommets du corps certifié, arrondis en double précision, et son tenseur d’inertie intégré sur le volume complet. La preuve du nombre d’équilibres appartient aux demi-espaces rationnels originaux, pas au dessin ni à cette simulation.','The drawing uses a lighter hull. Numerical contacts use all 113,888 vertices of the certified body, rounded to double precision, and its inertia tensor integrated over the complete volume. The equilibrium proof concerns the original rational halfspaces, not the drawing or this simulation.')}</p>`+
    `<p>${t('Le modèle applique la pesanteur, des impulsions de contact avec le sol, un frottement de Coulomb et une résistance au roulement visqueuse : pendant le contact, un couple −cNω s’oppose à la rotation (N force normale, ω vitesse angulaire). Ce couple dissipe l’énergie tant que le corps tourne en touchant le sol, et ne peut pas, à lui seul, le retenir hors d’un équilibre ; avec c = 0, le mouvement peut ne jamais s’amortir. Le modèle ignore la déformation et le bruit réel du contact. Pour certaines orientations, le centre de masse passe presque à la verticale du contact : le couple de pesanteur est alors minuscule ; freiné aussi par la résistance au roulement, le corps peut ramper longtemps avant de rejoindre la face stable. Accélère la lecture pour le voir. Un calcul à pas fini garde un léger tremblement au repos, et le retour à la face stable n’est pas garanti pour tout lancer numérique. Le sommet instable exactement posé peut rester immobile : penche-le légèrement.','The model applies gravity, ground-contact impulses, Coulomb friction and viscous rolling resistance: during contact a couple −cNω opposes the rotation (N the normal force, ω the angular velocity). This couple dissipates energy while the body turns in contact with the floor, and cannot by itself hold it away from an equilibrium; with c = 0 the motion may never die down. The model omits deformation and real contact noise. For some orientations the centre of mass is almost vertically above the contact: the gravity torque is then tiny; slowed as well by rolling resistance, the body can creep for a long time before it reaches the stable face. Raise the playback speed to see it. A finite-step calculation keeps a slight jitter at rest, and return to the stable face is not guaranteed for every numerical throw. The exactly balanced unstable vertex may remain still: tip it slightly.')}</p>`+
    `<p><a href="https://arxiv.org/abs/2609.07827" target="_blank" rel="noopener">${t('Construction et certificat (prépublication 2026)','Construction and certificate (2026 preprint)')}</a> · <a href="data/gomboc/polytope.npz" download>${t('Demi-espaces originaux (1,8 Mo)','Original halfspaces (1.8 MB)')}</a> · <a href="data/gomboc/LICENSE.txt">${t('Licence MIT des données','Data MIT licence')}</a></p>`);
  const play=root.querySelector('#go-play'),inputs=Object.fromEntries(['mode','preset','speed','friction','rolling','dt'].map(k=>[k,root.querySelector('#go-'+k)]));
  const abort=new AbortController(),options=()=>({friction:+inputs.friction.value,rolling:+inputs.rolling.value});
  function reset(){if(!body)return;s=G.state(body,inputs.preset.value);baseline=G.energy(body,s);check=null;playing=false;dirty=true;accumulator=0;updatePlay();}
  function updatePlay(){play.textContent=playing?t('Pause','Pause'):t('Lecture','Play');play.setAttribute('aria-pressed',String(playing));}
  function run(){if(!body)return;if(reduced()){playing=false;s=G.simulate(body,s,1/60,options(),1/+inputs.dt.value);}else playing=!playing;dirty=true;updatePlay();}
  function tick(seconds){if(!body)return;s=G.simulate(body,s,seconds,options(),1/+inputs.dt.value);dirty=true;}
  o.on(play,'click',run);o.on(root.querySelector('#go-step'),'click',()=>tick(1/60));
  o.on(root.querySelector('#go-reset'),'click',reset);o.on(inputs.preset,'change',reset);
  for(const k of ['speed','friction','rolling']){const el=inputs[k],out=root.querySelector('#go-'+k+'-out');out.textContent=num(el.value);o.on(el,'input',()=>{out.textContent=num(el.value);check=null;dirty=true;});}
  o.on(inputs.dt,'change',()=>{check=null;dirty=true;});
  o.on(root.querySelector('#go-check'),'click',()=>{if(!body)return;playing=false;updatePlay();check=G.convergence(body,s,.2,options(),1/+inputs.dt.value);dirty=true;});
  const project=p=>{const q=cam3Project(cam.yaw,cam.pitch,...p);return [320+q.u*scale,340-q.v*scale,q.d];};
  function worldScreen(dx,dy){const cy=Math.cos(cam.yaw),sy=Math.sin(cam.yaw);return [(cy*dx+sy*dy)*.01,(-sy*dx+cy*dy)*.01,0];}
  function tip(dx,dy){s.q=G.qmul(G.qaxis([1,0,0],dy*.009),G.qmul(G.qaxis([0,1,0],dx*.009),s.q));s.v=[0,0,0];s.L=[0,0,0];s.p[2]=0;G.liftToPlane(body,s);baseline=G.energy(body,s);check=null;dirty=true;}
  const follow=root.querySelector('#go-follow');o.on(follow,'change',()=>{dirty=true;});
  function displayOffset(){if(!follow.checked)return [0,0];const p=project([s.p[0],s.p[1],0]),base=project([0,0,0]);return [base[0]-p[0],base[1]-p[1]];}
  function nearest(p){const R=G.rotation(s.q),offset=displayOffset();let best=null;for(const index of body.drawingIds){const r=G.matvec(R,G.vertex(body,index)),q=project(G.add(r,s.p)),d=Math.hypot(q[0]+offset[0]-p[0],q[1]+offset[1]-p[1]);if(!best||d<best.d)best={d,r};}return best;}
  o.touchHit(p=>!!body&&nearest(p).d<75);
  o.on(o.cv,'pointerdown',e=>{if(!body)return;const p=o.point(e),hit=nearest(p),mode=inputs.mode.value;drag={p,last:p,mode:hit.d<75&&mode!=='inspect'?mode:'camera',r:hit.r,time:performance.now()};playing=false;updatePlay();o.cv.setPointerCapture?.(e.pointerId);e.preventDefault();});
  o.on(o.cv,'pointermove',e=>{if(!drag)return;const p=o.point(e),dx=p[0]-drag.last[0],dy=p[1]-drag.last[1];
    if(drag.mode==='camera')cam3Turn(cam,dx*.008,-dy*.008);
    if(drag.mode==='tip')tip(dx,dy);
    if(drag.mode==='throw'){const d=worldScreen(dx,0);s.p=G.add(s.p,[d[0],d[1],-dy*.01]);G.liftToPlane(body,s);}
    drag.last=p;dirty=true;});
  o.on(o.cv,'pointerup',()=>{if(!drag)return;const dx=drag.last[0]-drag.p[0],dy=drag.last[1]-drag.p[1];
    if(drag.mode==='push'){const J=worldScreen(dx,dy);s.v=G.add(s.v,J);s.L=G.add(s.L,G.cross(drag.r,J));baseline=G.energy(body,s);}
    if(drag.mode==='throw'){const elapsed=Math.max(.15,(performance.now()-drag.time)/1000),v=worldScreen(dx,0);s.v=[...v.slice(0,2).map(x=>Math.max(-4,Math.min(4,x/elapsed))),Math.max(-4,Math.min(4,-dy*.01/elapsed))];baseline=G.energy(body,s);}
    if(drag.mode!=='camera'&&!reduced())playing=true;drag=null;updatePlay();dirty=true;});
  o.cancelDrag=()=>{drag=null;};
  o.cv.setAttribute('aria-label',t('Corps en trois dimensions. H sélectionne le corps, flèches pour le pencher ; Échap puis flèches tourne la caméra ; P pousse ; Espace lance la lecture.','Three-dimensional body. H selects the body, arrows tip it; Escape then arrows orbit the camera; P pushes; Space toggles playback.'));
  o.on(o.cv,'keydown',e=>{if(!body)return;const arrow={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[e.key];
    if(e.key.toLowerCase()==='h'){e.preventDefault();keyboardBody=true;dirty=true;}
    if(e.key==='Escape'){e.preventDefault();keyboardBody=false;dirty=true;}
    if(arrow){e.preventDefault();if(keyboardBody)tip(...arrow);else cam3Turn(cam,arrow[0]*.012,-arrow[1]*.012);dirty=true;}
    if(e.code==='Space'){e.preventDefault();run();}
    if(e.key.toLowerCase()==='p'){e.preventDefault();const J=worldScreen(30,-10),R=G.rotation(s.q),r=G.matvec(R,G.vertex(body,s.support));s.v=G.add(s.v,J);s.L=G.add(s.L,G.cross(r,J));baseline=G.energy(body,s);dirty=true;}
  });
  function draw(){const C=palette(),g=o.g;g.clearRect(0,0,o.W,o.H);g.fillStyle=C.sunken;g.fillRect(0,0,o.W,o.H);
    if(!body){g.fillStyle=C.ink;g.font='18px system-ui';g.fillText(error||t('Chargement de la géométrie (4 Mo)…','Loading geometry (4 MB)…'),24,200);o.read(error||t('La géométrie complète se charge uniquement pour cette expérience.','Full geometry loads only for this experiment.'));return;}
    const offset=displayOffset(),P=p=>{const q=project(p);return [q[0]+offset[0],q[1]+offset[1],q[2]];};
    // The optional follow mode changes only translation. Camera scale and orientation stay independent of physics.
    const floor=[[-3,-3,0],[3,-3,0],[3,3,0],[-3,3,0]].map(p=>P([p[0]+s.p[0],p[1]+s.p[1],0]));path(g,floor,{close:true,fill:C.surface,stroke:C.line,width:1});
    const R=G.rotation(s.q),world=Array.from(body.drawingIds,i=>G.matvec(R,G.vertex(body,i))),points=world.map(w=>P(G.add(w,s.p))),faces=[];
    // Opaque faces shaded by their angle to a fixed light, so the relief of the body is readable; light only, no claim.
    // Direction towards the light, in view coordinates (u right, v up, d away from the viewer): upper left, viewer side.
    const light=[-.45,.55,-.7],facing=n=>cam3Project(cam.yaw,cam.pitch,...n).d<0;
    for(let i=0;i<body.triangles.length;i+=3){const ids=[body.triangles[i],body.triangles[i+1],body.triangles[i+2]],p=ids.map(j=>points[j]);
      // Cull by the outward normal (screen y points down, so a screen-area sign test would keep the far side).
      const w=ids.map(j=>world[j]),n=G.cross(G.add(w[1],G.scale(w[0],-1)),G.add(w[2],G.scale(w[0],-1))),m=cam3Project(cam.yaw,cam.pitch,...n);
      if(m.d<0){const lit=Math.max(0,G.dot([m.u,m.v,m.d],light))/(G.norm(n)*G.norm(light)||1);faces.push({p,lit,depth:p.reduce((sum,q)=>sum+q[2],0)/3});}}
    faces.sort((a,b)=>b.depth-a.depth);for(const f of faces){path(g,f.p,{close:true,fill:C.accent,stroke:C.accent,width:.6});path(g,f.p,{close:true,fill:'#000',stroke:'#000',width:.6,alpha:.5*(1-f.lit)});path(g,f.p,{close:true,fill:'#fff',alpha:.3*f.lit*f.lit});}
    const stableNormal=G.matvec(R,body.meta.stableNormal),unstable=G.matvec(R,G.vertex(body,body.meta.unstableVertex));
    if(facing(stableNormal))drawDot(g,P(G.add(s.p,G.scale(stableNormal,body.meta.stableOffset))),C.pos,6,t('face stable','stable face'));
    if(facing(unstable))drawDot(g,P(G.add(s.p,unstable)),C.obj2,6,t('sommet instable','unstable vertex'));
    const cc=P(s.p);drawDot(g,cc,C.ink,4,t('G','G'));const r=G.matvec(R,G.vertex(body,s.support)),touch=P(G.add(s.p,r));drawDot(g,touch,C.neg,5);
    const angle=Math.acos(Math.max(-1,Math.min(1,-stableNormal[2]))),E=G.energy(body,s);
    let text=`${t('Temps','Time')} ${num(s.time,2)} s · ${t('Énergie','Energy')} ≈ ${num(E)} · ${t('Énergie au départ','Initial energy')} ≈ ${num(baseline)} · ${t('Angle de la face stable','Stable-face angle')} ≈ ${num(angle*180/Math.PI,1)}° · Δt = 1/${inputs.dt.value} s`;
    if(check)text+=` · ${t('Écart après 0,2 s avec Δt/2 : position','Difference after 0.2 s with Δt/2: position')} ≈ ${num(check.position,6)}, ${t('angle','angle')} ≈ ${num(check.angle,6)} rad, ${t('énergie','energy')} ≈ ${num(check.energy,6)}`;
    if(keyboardBody)text+=` · ${t('Corps sélectionné : les flèches le penchent.','Body selected: arrows tip it.')}`;
    if(reduced())text+=` · ${t('Mouvement réduit : avance avec Un pas.','Reduced motion: use One step.')}`;o.read(text);
  }
  o.animate(dt=>{if(reduced()&&playing){playing=false;updatePlay();}if(playing&&dt&&body){accumulator+=dt*+inputs.speed.value;const h=1/+inputs.dt.value;let n=0;while(accumulator>=h&&n++<240){s=G.advance(body,s,h,options());accumulator-=h;}dirty=true;}if(dirty||playing){dirty=false;draw();}});
  const dataURL=name=>new URL(assetHref('data/gomboc/'+name),new URL('../',import.meta.url));
  Promise.all([fetch(dataURL('body.json'),{signal:abort.signal}).then(r=>{if(!r.ok)throw new Error();return r.json();}),fetch(dataURL('body.bin'),{signal:abort.signal}).then(r=>{if(!r.ok)throw new Error();return r.arrayBuffer();})]).then(([meta,buffer])=>{if(!alive)return;body=G.decodeGeometry(buffer,meta);reset();o.redraw();}).catch(e=>{if(e.name==='AbortError'||!alive)return;error=t('Géométrie indisponible. Recharge la page pour réessayer.','Geometry unavailable. Reload the page to retry.');dirty=true;o.redraw();});
  root.__gomboc={getState:()=>s,getBody:()=>body,setPreset:value=>{inputs.preset.value=value;reset();},step:tick};
  return ()=>{alive=false;abort.abort();o.stop();delete root.__gomboc;};
}
