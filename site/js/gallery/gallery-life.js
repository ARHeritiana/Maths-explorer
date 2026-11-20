// Conway's Game of Life on the unbounded plane: presets, drawing cells by hand, play, step and speed (gallery exhibit).
import {exhibit,button,field,bind,palette} from './gallery-kit.js';
import {metricStrip,plotPanel} from './gallery-panels.js';
import {PRESETS,presetSet,step,key,coords,soup,bounds,fitView,trailAges,transition,shapeOf,observedRepeat,shipSpeed,lifeEvents} from './gallery-life-model.js';
const TRAIL=10,MAXGEN=6000,SHAPES=80;   // trail length in generations, length of the population record, shapes kept for the repeat
export function gameOfLife(root,opts){
  const {t}=opts;
  let cells=presetSet('glider'),start=new Set(cells),gen=0,pops=[cells.size],last=new Map([...cells].map(k=>[k,0])),follow=true,view={cx:0,cy:0,cs:14},snap=true,trail=true,playing=false,speed=8,acc=0,cursor=[0,0],paint=null,dirty=true,shapes=[shapeOf(cells)],tr=null;   // shapes: recent generations up to translation; tr: births and deaths of the last step
  const kinds={osc:t('Oscillateurs','Oscillators'),ship:t('Vaisseaux','Spaceships'),gun:t('Canons','Guns'),meth:t('Longues évolutions','Long evolutions')};
  const options=Object.entries(kinds).map(([k,label])=>`<optgroup label="${label}">${PRESETS.filter(p=>p.kind===k).map(p=>`<option value="${p.id}" ${p.id==='glider'?'selected':''}>${t(...p.name)}</option>`).join('')}</optgroup>`).join('');
  const o=exhibit(root,opts,t('Chaque case vit ou meurt selon ses huit voisines. Une case morte avec exactement 3 voisines vivantes naît ; une case vivante avec 2 ou 3 voisines survit ; toutes les autres meurent. Touche ou glisse sur la grille pour dessiner ; au clavier, les flèches déplacent le curseur et Espace change la case.','Each cell lives or dies according to its eight neighbours. A dead cell with exactly 3 live neighbours is born; a live cell with 2 or 3 neighbours survives; all the others die. Tap or drag on the grid to draw; with the keyboard, arrow keys move the cursor and Space toggles the cell.'),
    `<label class="act-field exhibit-select"><span class="act-label">${t('Configuration de départ','Starting pattern')}</span><select id="lf-preset">${options}<option value="soup">${t('Soupe aléatoire','Random soup')}</option></select></label>`+
    button('lf-play',t('Lancer','Play'),true)+button('lf-step',t('Une génération','One generation'))+button('lf-back',t('Revenir au départ','Back to the start'))+button('lf-clear',t('Effacer','Clear'))+`<button type="button" id="lf-trail" class="btn btn-secondary" aria-pressed="true">${t('Traînée','Trail')}</button>`+`<button type="button" id="lf-fit" class="btn btn-secondary" aria-pressed="true">${t('Cadrer le motif','Fit the pattern')}</button>`+
    field('lf-speed',t('Générations par seconde','Generations per second'),1,30,1,speed),
    `<p>${t('À essayer : avant de lancer, prédis la courbe P(g) du clignotant (3 cellules) puis celle du planeur (5 cellules). Les deux courbes sont plates. Qu’est-ce qui les distingue dans la mesure « Déplacement » ?','Try this: before playing, predict the curve P(g) of the blinker (3 cells), then of the glider (5 cells). Both curves are flat. What tells them apart in the “Movement” measurement?')}</p><p>${t('Le clignotant revient à sa forme toutes les 2 générations, le pulsar toutes les 3. Le planeur reprend sa forme au bout de 4 générations, décalé d’une case en diagonale : il se déplace. Le canon de Gosper lance un planeur toutes les 30 générations, donc la population peut croître sans limite. Une population constante ne veut pas dire une configuration immobile : le planeur garde 5 cellules à chaque génération tout en avançant. La répétition et la vitesse affichées dans les mesures sont lues sur les générations déjà calculées : elles ne prouvent rien pour la suite.','The blinker returns to its shape every 2 generations, the pulsar every 3. The glider takes its shape again after 4 generations, shifted one cell diagonally: it travels. The Gosper gun fires a glider every 30 generations, so the population can grow without bound. A steady population does not mean a motionless pattern: the glider keeps 5 cells in every generation while it moves. The repeat and speed shown in the measurements are read from the generations already computed; they prove nothing about later ones.')}</p><p>${t('Le R-pentomino n’a que cinq cellules, mais il évolue pendant 1 103 générations avant de se stabiliser avec 116 cellules ; le gland en met 5 206 et finit avec 633 cellules. Le diehard disparaît entièrement après 130 générations. Prévoir l’avenir d’une configuration est en général impossible sans la faire évoluer : le jeu de la vie peut simuler n’importe quel ordinateur.','The R-pentomino has only five cells, yet it evolves for 1,103 generations before settling with 116 cells; the acorn takes 5,206 and ends with 633 cells. Diehard vanishes completely after 130 generations. Predicting the future of a pattern is in general impossible without running it: the Game of Life can simulate any computer.')}</p>`);
  const M=metricStrip(root.querySelector('.exhibit-stage'),t,[
    {id:'gen',label:t('Génération','Generation'),kind:'exact'},{id:'pop',label:t('Cellules vivantes','Live cells'),kind:'exact'},
    {id:'bd',label:t('Dernier pas : naissances, morts','Last step: births, deaths'),kind:'exact'},{id:'peak',label:t('Maximum atteint','Peak so far'),kind:'exact'},
    {id:'rep',label:t('Même forme revue','Same shape seen again'),kind:'observed'},{id:'speed',label:t('Déplacement','Movement'),kind:'observed'}]);
  let repG=null;   // the generation at which the shape was first seen again (an event of the plot)
  const runName=()=>sel.value==='soup'?t('soupe aléatoire','random soup'):start.size&&sel.selectedOptions[0]?sel.selectedOptions[0].textContent:t('ton dessin','your drawing');
  // an event takes the grid to that generation: the run is replayed from its start (the rules are deterministic, so it is the same run)
  function jumpTo(gx){setPlaying(false);const keep=pops.slice();cells=new Set(start);gen=0;restart();for(let i=0;i<gx;i++)advance();if(keep.length>pops.length)pops=keep;dirty=true;o.redraw();}
  const P=plotPanel(M.el,t('Population P(g) à chaque génération g : un point par génération calculée, sans lissage. Les numéros marquent des événements ; leurs boutons ramènent la grille à ce moment.','Population P(g) at each generation g: one point per computed generation, no smoothing. Numbers mark events; their buttons take the grid back to that moment.'),
    {t,compare:{label:()=>`${runName()}, ${pops.length-1} ${t('générations','generations')}`},onEvent:e=>jumpTo(e.x)});
  const g=o.g,playBtn=root.querySelector('#lf-play'),sel=root.querySelector('#lf-preset'),trailBtn=root.querySelector('#lf-trail'),fitBtn=root.querySelector('#lf-fit');
  const target=()=>fitView(bounds(cells),o.W,o.H);
  // screen (logical canvas pixels, camera undone by o.point) <-> cell coordinates under the current view
  const cellAt=p=>[Math.floor(view.cx+(p[0]-o.W/2)/view.cs),Math.floor(view.cy+(p[1]-o.H/2)/view.cs)];
  const sx=x=>o.W/2+(x-view.cx)*view.cs,sy=y=>o.H/2+(y-view.cy)*view.cs;
  const resetMeasures=()=>{shapes=[shapeOf(cells)];tr=null;repG=null;};
  const record=()=>{if(gen<MAXGEN)pops[gen]=cells.size;};
  function load(id){cells=id==='soup'?soup(40,26,.32):presetSet(id);start=new Set(cells);gen=0;pops=[cells.size];last=new Map([...cells].map(k=>[k,0]));follow=true;snap=true;resetMeasures();o.navigation?.camera.reset();dirty=true;}
  function setPlaying(v){playing=v;playBtn.textContent=v?t('Pause','Pause'):t('Lancer','Play');}
  function advance(){const before=cells;cells=step(cells);gen++;tr=transition(before,cells);shapes.push(shapeOf(cells));if(shapes.length>SHAPES)shapes.shift();for(const k of cells)last.set(k,gen);if(gen%TRAIL===0)for(const [k,g0] of last)if(gen-g0>TRAIL)last.delete(k);if(gen<=MAXGEN){pops.length=gen;pops.push(cells.size);}if(repG===null&&observedRepeat(shapes))repG=gen;dirty=true;}
  function toggle([x,y],value){const k=key(x,y);const alive=value??!cells.has(k);if(alive){cells.add(k);last.set(k,gen);}else cells.delete(k);if(gen===0)start=new Set(cells);record();resetMeasures();dirty=true;return alive;}
  const restart=()=>{resetMeasures();pops=[cells.size];last=new Map([...cells].map(k=>[k,0]));follow=true;snap=true;o.navigation?.camera.reset();};
  o.on(sel,'change',()=>{load(sel.value);setPlaying(false);});
  o.on(playBtn,'click',()=>setPlaying(!playing));
  o.on(root.querySelector('#lf-step'),'click',()=>{setPlaying(false);advance();});
  o.on(root.querySelector('#lf-back'),'click',()=>{setPlaying(false);cells=new Set(start);gen=0;restart();dirty=true;});
  o.on(root.querySelector('#lf-clear'),'click',()=>{setPlaying(false);cells=new Set();start=new Set();gen=0;restart();dirty=true;});
  o.on(trailBtn,'click',()=>{trail=!trail;trailBtn.setAttribute('aria-pressed',String(trail));dirty=true;});
  o.on(root.querySelector('#lf-fit'),'click',()=>{follow=true;o.navigation?.camera.reset();o.navigation?.apply();dirty=true;});
  bind(root,'lf-speed',v=>{speed=v;});
  // Every cell of the grid area is editable (also outside the pattern: the view then frames the new drawing).
  o.touchHit(()=>true);
  o.on(o.cv,'pointerdown',e=>{const c=cellAt(o.point(e));cursor=c;paint=toggle(c);o.cv.setPointerCapture?.(e.pointerId);e.preventDefault();});
  o.on(o.cv,'pointermove',e=>{if(paint===null)return;const c=cellAt(o.point(e));if(c[0]!==cursor[0]||c[1]!==cursor[1]){cursor=c;toggle(c,paint);}});
  o.on(o.cv,'pointerup',()=>{paint=null;});o.cancelDrag=()=>{paint=null;};
  o.on(o.cv,'keydown',e=>{if(e.shiftKey)return;const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];
    if(d){e.preventDefault();cursor=[cursor[0]+d[0],cursor[1]+d[1]];dirty=true;}else if(e.key===' '||e.key==='Enter'){e.preventDefault();toggle(cursor);}});
  o.onResize=()=>{dirty=true;};o.busy=()=>playing;
  o.animate(dt=>{
    // real elapsed time: the simulation runs only when asked, so it also runs under reduced motion
    const now=performance.now(),real=Math.min(.1,(now-(o.last||now))/1000);o.last=now;
    if(playing){acc+=real*speed;let n=0;while(acc>=1&&n<4){advance();acc-=1;n++;}if(n===4)acc=0;}
    const cam=o.navigation?.camera;if(cam&&(cam.scale!==1||cam.x!==0||cam.y!==0))follow=false;   // the student took the view: stop reframing
    let moving=false;
    if(follow&&paint===null){const tg=target();
      if(snap||!dt){view={...tg};snap=false;}
      else{const k=1-Math.exp(-dt*7);view.cx+=(tg.cx-view.cx)*k;view.cy+=(tg.cy-view.cy)*k;view.cs*=Math.pow(tg.cs/view.cs,k);
        moving=Math.abs(tg.cx-view.cx)>.01||Math.abs(tg.cy-view.cy)>.01||Math.abs(tg.cs/view.cs-1)>.002;if(!moving)view={...tg};}
      if(moving)dirty=true;}
    if(fitBtn.getAttribute('aria-pressed')!==String(follow))fitBtn.setAttribute('aria-pressed',String(follow));   // on while the view follows the pattern, off once the student takes the view
    if(!dirty&&dt)return false;dirty=false;
    const C=palette(),sc=cam?cam.scale:1,cs=view.cs;
    g.clearRect(0,0,o.W,o.H);
    g.save();g.setTransform(o.scale,0,0,o.scale,0,0);o.navigation?.apply();
    const [x0,y0]=cam?cam.unproject([0,0]):[0,0],[x1,y1]=cam?cam.unproject([o.W,o.H]):[o.W,o.H];
    g.fillStyle=C.sunken;g.fillRect(x0,y0,x1-x0,y1-y0);
    if(cs*sc>=6){g.strokeStyle=C.grid;g.lineWidth=1/sc;g.beginPath();
      for(let x=Math.floor(view.cx+(x0-o.W/2)/cs);x<=Math.ceil(view.cx+(x1-o.W/2)/cs);x++){g.moveTo(sx(x),y0);g.lineTo(sx(x),y1);}
      for(let y=Math.floor(view.cy+(y0-o.H/2)/cs);y<=Math.ceil(view.cy+(y1-o.H/2)/cs);y++){g.moveTo(x0,sy(y));g.lineTo(x1,sy(y));}g.stroke();}
    const gap=cs>=7?1:0,vis=(px,py)=>px+cs>=x0&&px<=x1&&py+cs>=y0&&py<=y1;
    if(trail){g.fillStyle=C.object;for(const [k,age] of trailAges(last,gen,TRAIL)){if(cells.has(k))continue;const [x,y]=coords(k),px=sx(x),py=sy(y);if(!vis(px,py))continue;g.globalAlpha=.34*(1-(age-1)/TRAIL);g.fillRect(px+gap/2,py+gap/2,cs-gap,cs-gap);}g.globalAlpha=1;}
    g.fillStyle=C.object;
    for(const k of cells){const [x,y]=coords(k),px=sx(x),py=sy(y);if(!vis(px,py))continue;g.fillRect(px+gap/2,py+gap/2,cs-gap,cs-gap);}
    if(root.ownerDocument.activeElement===o.cv){g.strokeStyle=C.obj2;g.lineWidth=2/sc;g.strokeRect(sx(cursor[0]),sy(cursor[1]),cs,cs);}
    g.restore();
    const rep=observedRepeat(shapes),moved=rep&&(rep.dx||rep.dy),sp=shipSpeed(rep),peak=Math.max(0,...pops),dead=cells.size===0&&gen>0;
    M.set('gen',gen);M.set('pop',cells.size);M.set('bd',tr?`+${tr.born}  −${tr.died}`:'–');M.set('peak',peak);
    M.set('rep',rep?t(rep.period===1?'à chaque génération':`toutes les ${rep.period} générations`,rep.period===1?'every generation':`every ${rep.period} generations`):cells.size>200?t('motif trop grand pour comparer','pattern too large to compare'):t('pas encore','not yet'));
    M.set('speed',!rep?'–':moved?t(`(${rep.dx}, ${rep.dy}) par période, vitesse ${sp.label}`,`(${rep.dx}, ${rep.dy}) per period, speed ${sp.label}`):t('sur place','in place'));
    P.draw({xMax:Math.max(30,pops.length-1),yMax:Math.max(5,peak),xLabel:t('génération g','generation g'),yLabel:t('population P(g)','population P(g)'),
      series:[{values:pops,color:C.ink}],marker:[Math.min(pops.length-1,gen),pops[Math.min(pops.length-1,gen)]],events:lifeEvents(pops,repG,t)});
    if(gen>=MAXGEN)P.caption(t(`Population P(g) : seules les ${MAXGEN} premières générations sont enregistrées.`,`Population P(g): only the first ${MAXGEN} generations are recorded.`));
    o.read(`${t('Génération','Generation')} ${gen} · ${cells.size} ${t('cellules vivantes','live cells')}${dead?' · '+t('tout est mort','everything has died'):''}${rep&&moved?' · '+t('le motif se déplace','the pattern travels'):''}`);
    return moving;
  });
  o.on(o.cv,'focus',()=>{dirty=true;});o.on(o.cv,'blur',()=>{dirty=true;});
  const redraw=o.redraw;o.redraw=()=>{dirty=true;redraw();};
  return ()=>{P.stop();M.el.remove();o.stop();};
}
