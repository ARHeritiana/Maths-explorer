// Fourteen spatial wire frames: constrained area descent and a separate tetrahedral junction model.
import {SOAP_FRAMES,makeSoapFrame,meshArea3D,relaxMesh3D,perturbFilm,tetraFilm,relaxTetraNetwork,frameHandleIds,moveFrameHandle} from './gallery-soap-model.js';
import {exhibit,background,path,button,orbitProject,dragOrbit} from './gallery-kit.js';
export function soapFilm(root,opts){
  const {t}=opts;let id='skew-square',mesh=makeSoapFrame(id),running=false,iterations=0,residual=0,history=[meshArea3D(mesh)],dirty=true,handles=frameHandleIds(mesh),hot=-1,sel=0;
  const view={yaw:-.55,pitch:.65},names=[...SOAP_FRAMES,{id:'tetrahedron',name:['Tétraèdre : six nappes','Tetrahedron: six sheets']}];
  const name=f=>t(...f.name);
  const o=exhibit(root,opts,t('Choisis un cadre, puis déforme-le : tire un point rond du fil, le film se réajuste aussitôt. Glisse ailleurs pour tourner la figure (la surface suit le curseur), puis gonfle le film et observe sa détente. Au clavier : les flèches tournent la vue ; [ et ] choisissent un point du fil ; x, y, z (ou X, Y, Z) le déplacent.','Choose a wire frame, then reshape it: drag a round point of the wire and the film readjusts at once. Drag elsewhere to orbit the figure (the surface follows the cursor), then bulge the film and watch it relax. Keyboard: arrow keys orbit the view; [ and ] choose a point of the wire; x, y, z (or X, Y, Z) move it.'),
    `<label class="act-field exhibit-select"><span class="act-label">${t('Cadre dans l’espace','Spatial wire frame')}</span><select id="sf-frame">${names.map(f=>`<option value="${f.id}"${f.id===id?' selected':''}>${name(f)}</option>`).join('')}</select></label>`+button('sf-relax',t('Détendre le film','Relax the film'),true)+button('sf-bulge',t('Gonfler puis relâcher','Bulge and release'))+button('sf-step',t('Un pas de détente','One relaxation step'))+button('sf-restore',t('Rétablir le cadre','Restore the frame')),
    `<p>${t('La tension superficielle tend à réduire l’aire. Chaque pas déplace les sommets libres en trois dimensions et vérifie que l’aire totale des triangles diminue. Le fil ne bouge que si tu tires l’un de ses points ; pendant la détente, il reste fixé.','Surface tension tends to reduce area. Each step moves free vertices in three dimensions and checks that total triangle area decreases. The wire moves only when you drag one of its points; during relaxation it stays fixed.')}</p><p>${t('Les films en disque ou en anneau gardent leur topologie. Le calcul ne simule ni rupture, ni reconnexion, ni pression des bulles et ne garantit pas le minimum global. Entre deux anneaux, un caténoïde peut être localement stable même si deux disques séparés ont une aire inférieure.','Disk and annular films retain their topology. The calculation models neither rupture, reconnection nor bubble pressure and does not guarantee a global minimum. Between two rings, a catenoid can be locally stable even when two separate disks have less area.')}</p><p>${t('Le tétraèdre utilise un modèle distinct : six nappes planes se rencontrent le long de quatre lignes. À l’équilibre, trois nappes font des angles de 120° ; les quatre lignes se rencontrent à environ 109,47°. Les modèles d’Enneper et d’hélicoïde commencent sur des approximations de surfaces minimales classiques.','The tetrahedron uses a separate model: six planar sheets meet along four lines. At equilibrium three sheets meet at 120°; the four lines meet at about 109.47°. Enneper and helicoid models start from approximations of classical minimal surfaces.')}</p><p><a href="https://www.kenbrakke.com/evolver/examples/cat/catenoids.html" target="_blank" rel="noopener noreferrer">${t('Caténoïdes et stabilité · Brakke','Catenoids and stability · Brakke')}</a> · <a href="https://pi.math.cornell.edu/~meadows/create/" target="_blank" rel="noopener noreferrer">${t('Géométrie des films · Cornell','Soap-film geometry · Cornell')}</a></p>`);
  const g=o.g,project=p=>orbitProject(p,view.yaw,view.pitch,133),toggle=root.querySelector('#sf-relax');
  // the two sides of a film have two colours (seen from the front or the back of its orientation); the tetrahedral network keeps height colouring
  const side=(f,P)=>id==='tetrahedron'?mesh.pts[f[0]][2]>0:(P[f[1]][0]-P[f[0]][0])*(P[f[2]][1]-P[f[0]][1])-(P[f[1]][1]-P[f[0]][1])*(P[f[2]][0]-P[f[0]][0])>0;
  function label(){toggle.textContent=running?t('Suspendre la détente','Pause relaxation'):t('Détendre le film','Relax the film');}
  function reset(bulge=.19){mesh=id==='tetrahedron'?tetraFilm(bulge):makeSoapFrame(id,bulge);handles=frameHandleIds(mesh);hot=-1;sel=0;history=[meshArea3D(mesh)];iterations=0;residual=0;running=false;dirty=true;label();o.redraw();}
  function step(count=1){for(let i=0;i<count;i++){const r=id==='tetrahedron'?relaxTetraNetwork(mesh):relaxMesh3D(mesh);residual=r.residual;iterations++;history.push(r.area);if(history.length>240)history.shift();dirty=true;if(r.drop<1e-10){running=false;label();break;}}}
  o.on(root.querySelector('#sf-frame'),'change',e=>{id=e.target.value;reset();});
  o.on(toggle,'click',()=>{if(opts.reduced()){step(24);}else running=!running;label();dirty=true;o.redraw();});
  o.on(root.querySelector('#sf-bulge'),'click',()=>{if(id==='tetrahedron')mesh=tetraFilm(.28);else perturbFilm(mesh,.27);history=[meshArea3D(mesh)];iterations=0;running=!opts.reduced();if(opts.reduced())step(24);dirty=true;label();o.redraw();});
  o.on(root.querySelector('#sf-step'),'click',()=>{running=false;label();step();o.redraw();});
  // frame handles: a press near one grabs it (it moves in the plane of the screen, so it follows the cursor), anywhere else turns the view
  const HIT=20,handlePoint=k=>project(mesh.pts[handles[k].id]);
  const nearHandle=p=>{let best=null,bd=HIT;handles.forEach((h,k)=>{const q=handlePoint(k),d=Math.hypot(q[0]-p[0],q[1]-p[1]);if(d<bd){bd=d;best=k;}});return best;};
  const moveHandle=(k,[dx,dy])=>{const cy=Math.cos(view.yaw),sy=Math.sin(view.yaw),sp=Math.sin(view.pitch),cp=Math.cos(view.pitch),S=133;
    nudge(k,[(dx*cy+dy*sy*sp)/S,(-dx*sy+dy*cy*sp)/S,-dy*cp/S]);hot=k;sel=k;};
  function nudge(k,d){const P=mesh.pts[handles[k].id];moveFrameHandle(mesh,handles,k,[P[0]+d[0],P[1]+d[1],P[2]+d[2]]);history=[meshArea3D(mesh)];iterations=0;if(!opts.reduced())running=true;label();dirty=true;o.redraw();}
  dragOrbit(o,view,nearHandle,moveHandle);
  o.on(o.cv,'pointermove',e=>{const k=nearHandle(o.point(e));if(k!==hot){hot=k===null?-1:k;o.cv.style.cursor=k===null?'':'pointer';dirty=true;}});
  o.on(o.cv,'keydown',e=>{if(e.shiftKey&&!/^[XYZ]$/.test(e.key))return;
    if(e.key==='['||e.key===']'){e.preventDefault();sel=(sel+(e.key===']'?1:handles.length-1))%handles.length;hot=sel;dirty=true;o.redraw();return;}
    const axis={x:0,y:1,z:2}[e.key.toLowerCase()];if(axis===undefined||e.ctrlKey||e.metaKey||e.altKey)return;e.preventDefault();
    const d=[0,0,0];d[axis]=(e.key===e.key.toLowerCase()?1:-1)*.05;nudge(sel,d);});
  o.on(root.querySelector('#sf-restore'),'click',()=>reset());
  let lastView='';
  o.animate(dt=>{
    if(running&&dt)step(2);
    const key=`${view.yaw},${view.pitch},${o.navigation.camera.scale},${o.navigation.camera.x},${o.navigation.camera.y},${document.documentElement.dataset.theme}`;
    if(!dirty&&key===lastView)return;lastView=key;dirty=false;
    const C=background(o),P=mesh.pts.map(project),faces=mesh.faces.map(f=>({f,z:f.reduce((s,i)=>s+P[i][2],0)})).sort((a,b)=>a.z-b.z);
    for(const {f}of faces){path(g,f.map(i=>P[i]),{close:true,fill:side(f,P)?C.accent:C.obj3,alpha:.34});path(g,f.map(i=>P[i]),{close:true,stroke:C.line,width:.35,alpha:.42});}
    for(const wire of mesh.wires)path(g,wire.map(i=>P[i]),{close:wire.length>2,stroke:C.ink,width:4});
    handles.forEach((h,k)=>{const q=P[h.id];if(!q)return;const on=k===hot,r=on?9:7;g.beginPath();g.arc(q[0],q[1],r,0,Math.PI*2);g.fillStyle=on?C.obj2:C.surface;g.fill();g.lineWidth=2.5;g.strokeStyle=C.ink;g.stroke();});
    if(history.length>1){const max=history[0],min=Math.min(...history),span=Math.max(.02,max-min);path(g,history.map((v,i)=>[22+i/(history.length-1)*130,410-(v-min)/span*45]),{stroke:C.pos,width:2});}
    g.fillStyle=C.muted;g.font='13px system-ui';g.textAlign='left';g.fillText(t('Aire au fil des pas','Area over iterations'),22,435);
    o.read(`${name(names.find(f=>f.id===id))} · ${t('Aire','Area')}: ${meshArea3D(mesh).toFixed(5)} · ${t('pas','steps')}: ${iterations} · ${t('gradient projeté maximal','maximum projected gradient')}: ${residual.toExponential(1)}. ${t('Aire en unités de longueur au carré.','Area in squared length units.')}`);
  });return o.stop;
}
