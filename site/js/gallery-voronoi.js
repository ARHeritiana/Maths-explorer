// Drag, grow and relax Voronoi territories; exact polygon clipping rather than a pixel approximation.
import {voronoiCells,polygonArea,polygonCentroid,clamp} from './gallery-models.js';
import {exhibit,background,path,dot,button,field,bind} from './gallery-kit.js';
export function voronoiWorld(root,opts){
  const {t}=opts;let seeds=[[100,100],[285,80],[500,115],[150,315],[365,285],[540,350]],selected=0,plant=null,drag=false,growth=1,playing=false,relax=false;
  const o=exhibit(root,opts,t('Déplace les graines. Touche un espace vide pour en planter une autre. Tab puis les flèches déplacent la graine choisie ; Entrée en plante une autre et Suppr la retire. Les territoires appartiennent à la graine la plus proche.','Drag the seeds. Tap empty space to plant another. Tab then arrow keys move the selected seed; Enter plants another and Delete removes it. Each territory belongs to its nearest seed.'),
    button('vo-grow',t('Faire grandir les territoires','Grow the territories'),true)+button('vo-relax',t('Répartir les graines','Spread the seeds'))+button('vo-delete',t('Retirer la graine choisie','Remove selected seed'))+field('vo-seed',t('Graine choisie','Selected seed'),1,seeds.length,1,1),
    `<p>${t('Deux graines à égale distance ? Leur frontière est une médiatrice. Trois territoires se rencontrent généralement en un point équidistant de trois graines.','Two equally distant seeds? Their boundary is a perpendicular bisector. Three territories generally meet at a point equidistant from three seeds.')}</p><p>${t('La répartition déplace chaque graine vers le centre de son territoire : c’est une itération de Lloyd. Elle tend à répartir les graines, sans garantir le meilleur arrangement global.','Spreading moves each seed towards its cell centroid: this is Lloyd’s iteration. It tends to spread the seeds, without guaranteeing a globally optimal arrangement.')}</p>`);
  const g=o.g,sel=root.querySelector('#vo-seed'),num=root.querySelector('#vo-seed-out');let cells=[];
  function update(){sel.max=seeds.length;sel.value=selected+1;num.textContent=selected+1;root.querySelector('#vo-relax').textContent=relax?t('Arrêter la répartition','Stop spreading'):t('Répartir les graines','Spread the seeds');}
  bind(root,'vo-seed',v=>{selected=v-1;o.redraw();});
  o.touchHit(p=>seeds.some(s=>Math.hypot(s[0]-p[0],s[1]-p[1])<40));
  o.on(o.cv,'pointerdown',e=>{const p=o.point(e),dist=seeds.map(s=>Math.hypot(s[0]-p[0],s[1]-p[1])),near=dist.indexOf(Math.min(...dist));if(e.pointerType==='touch'&&dist[near]>=40){plant={p,id:e.pointerId};return;}playing=relax=false;growth=1;
    if(dist[near]<(e.pointerType==='touch'?40:24))selected=near;else if(seeds.length<24){seeds.push([clamp(p[0],12,628),clamp(p[1],12,428)]);selected=seeds.length-1;}
    drag=true;o.cv.setPointerCapture?.(e.pointerId);update();o.redraw();});
  o.on(o.cv,'pointermove',e=>{if(!drag)return;const p=o.point(e);seeds[selected]=[clamp(p[0],12,628),clamp(p[1],12,428)];o.redraw();});
  o.on(o.cv,'pointerup',e=>{if(plant?.id===e.pointerId&&Math.hypot(...o.point(e).map((v,i)=>v-plant.p[i]))<8&&seeds.length<24){seeds.push([clamp(plant.p[0],12,628),clamp(plant.p[1],12,428)]);selected=seeds.length-1;playing=relax=false;growth=1;update();o.redraw();}plant=null;drag=false;});o.cancelDrag=()=>{plant=null;drag=false;};
  const remove=()=>{if(seeds.length>1){seeds.splice(selected,1);selected=Math.min(selected,seeds.length-1);update();o.redraw();}};
  o.on(root.querySelector('#vo-delete'),'click',remove);
  o.on(root.querySelector('#vo-grow'),'click',()=>{growth=0;playing=true;relax=false;update();o.redraw();});
  o.on(root.querySelector('#vo-relax'),'click',()=>{growth=1;relax=!relax;playing=false;root.querySelector('#vo-relax').textContent=relax?t('Arrêter la répartition','Stop spreading'):t('Répartir les graines','Spread the seeds');if(opts.reduced()){for(let i=0;i<12;i++)seeds=voronoiCells(seeds,[0,0,640,440]).map(polygonCentroid);relax=false;}update();o.redraw();});
  o.on(o.cv,'keydown',e=>{if(e.shiftKey)return;if(e.key==='Enter'&&seeds.length<24){e.preventDefault();const candidates=Array.from({length:48},(_,i)=>[40+(i%8)*80,35+Math.floor(i/8)*74]);candidates.sort((a,b)=>Math.min(...seeds.map(p=>Math.hypot(b[0]-p[0],b[1]-p[1])))-Math.min(...seeds.map(p=>Math.hypot(a[0]-p[0],a[1]-p[1]))));seeds.push(candidates[0]);selected=seeds.length-1;relax=false;growth=1;update();o.redraw();return;}const d={ArrowLeft:[-5,0],ArrowRight:[5,0],ArrowUp:[0,-5],ArrowDown:[0,5]}[e.key];if(d){e.preventDefault();seeds[selected]=[clamp(seeds[selected][0]+d[0],12,628),clamp(seeds[selected][1]+d[1],12,428)];relax=false;update();o.redraw();}else if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();remove();}else if(e.key===']'||e.key==='['){selected=(selected+(e.key===']'?1:seeds.length-1))%seeds.length;update();o.redraw();}});
  let frame=0;
  o.animate(dt=>{if(playing){growth=opts.reduced()?1:Math.min(1,growth+dt*.36);if(growth===1)playing=false;}
    cells=voronoiCells(seeds,[0,0,640,440]);if(relax&&dt){const centres=cells.map(polygonCentroid);seeds=seeds.map((s,i)=>s.map((v,k)=>v+(centres[i][k]-v)*Math.min(1,dt*2)));}
    const C=background(o),colors=[C.accent,C.obj2,C.obj3,C.pos,C.neg];
    cells.forEach((p,i)=>{g.save();if(growth<1){g.beginPath();g.arc(...seeds[i],growth*800,0,2*Math.PI);g.clip();}path(g,p,{close:true,fill:colors[i%5],alpha:.16});path(g,p,{close:true,stroke:C.line,width:1.5});g.restore();});
    seeds.forEach((p,i)=>{dot(g,p,i===selected?C.ink:colors[i%5],i===selected?9:6,String(i+1));if(i===selected){g.strokeStyle=C.surface;g.lineWidth=2;g.beginPath();g.arc(...p,5,0,2*Math.PI);g.stroke();}});
    if(++frame%12===0||!dt)o.read(`${seeds.length} ${t('graines','seeds')} · ${t('territoire choisi','selected territory')} ${selected+1}: ${(polygonArea(cells[selected])/(640*440)*100).toFixed(1)} % · ${t('Les points de la frontière sont à égale distance.','Boundary points are equally distant.')}`);
  });return o.stop;
}
