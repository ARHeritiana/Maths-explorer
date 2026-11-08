// Conway's Game of Life on the unbounded plane: presets, drawing cells by hand, play, step and speed (gallery exhibit).
import {exhibit,button,field,bind,palette} from './gallery-kit.js';
import {PRESETS,presetSet,step,key,coords,soup,bounds,fitView,trailAges} from './gallery-life-model.js';
const GH=346,TRAIL=10,MAXGEN=6000;   // grid area height (the population curve takes the strip below), trail length in generations
export function gameOfLife(root,opts){
  const {t}=opts;
  let cells=presetSet('glider'),start=new Set(cells),gen=0,pops=[cells.size],last=new Map([...cells].map(k=>[k,0])),follow=true,view={cx:0,cy:0,cs:14},snap=true,trail=true,playing=false,speed=8,acc=0,cursor=[0,0],paint=null,dirty=true;
  const kinds={osc:t('Oscillateurs','Oscillators'),ship:t('Vaisseaux','Spaceships'),gun:t('Canons','Guns'),meth:t('Longues évolutions','Long evolutions')};
  const options=Object.entries(kinds).map(([k,label])=>`<optgroup label="${label}">${PRESETS.filter(p=>p.kind===k).map(p=>`<option value="${p.id}" ${p.id==='glider'?'selected':''}>${t(...p.name)}</option>`).join('')}</optgroup>`).join('');
  const o=exhibit(root,opts,t('Chaque case vit ou meurt selon ses huit voisines. Une case morte avec exactement 3 voisines vivantes naît ; une case vivante avec 2 ou 3 voisines survit ; toutes les autres meurent. Touche ou glisse sur la grille pour dessiner ; au clavier, les flèches déplacent le curseur et Espace change la case.','Each cell lives or dies according to its eight neighbours. A dead cell with exactly 3 live neighbours is born; a live cell with 2 or 3 neighbours survives; all the others die. Tap or drag on the grid to draw; with the keyboard, arrow keys move the cursor and Space toggles the cell.'),
    `<label class="act-field exhibit-select"><span class="act-label">${t('Configuration de départ','Starting pattern')}</span><select id="lf-preset">${options}<option value="soup">${t('Soupe aléatoire','Random soup')}</option></select></label>`+
    button('lf-play',t('Lancer','Play'),true)+button('lf-step',t('Une génération','One generation'))+button('lf-back',t('Revenir au départ','Back to the start'))+button('lf-clear',t('Effacer','Clear'))+`<button type="button" id="lf-trail" class="btn btn-secondary" aria-pressed="true">${t('Traînée','Trail')}</button>`+button('lf-fit',t('Cadrer le motif','Fit the pattern'))+
    field('lf-speed',t('Générations par seconde','Generations per second'),1,30,1,speed),
    `<p>${t('Le clignotant revient à sa forme toutes les 2 générations, le pulsar toutes les 3. Le planeur reprend sa forme au bout de 4 générations, décalé d’une case en diagonale : il se déplace. Le canon de Gosper lance un planeur toutes les 30 générations, donc la population peut croître sans limite.','The blinker returns to its shape every 2 generations, the pulsar every 3. The glider takes its shape again after 4 generations, shifted one cell diagonally: it travels. The Gosper gun fires a glider every 30 generations, so the population can grow without bound.')}</p><p>${t('Le R-pentomino n’a que cinq cellules, mais il évolue pendant 1 103 générations avant de se stabiliser avec 116 cellules ; le gland en met 5 206 et finit avec 633 cellules. Le diehard disparaît entièrement après 130 générations. Prévoir l’avenir d’une configuration est en général impossible sans la faire évoluer : le jeu de la vie peut simuler n’importe quel ordinateur.','The R-pentomino has only five cells, yet it evolves for 1,103 generations before settling with 116 cells; the acorn takes 5,206 and ends with 633 cells. Diehard vanishes completely after 130 generations. Predicting the future of a pattern is in general impossible without running it: the Game of Life can simulate any computer.')}</p>`);
  const g=o.g,playBtn=root.querySelector('#lf-play'),sel=root.querySelector('#lf-preset'),trailBtn=root.querySelector('#lf-trail');
  const target=()=>fitView(bounds(cells),o.W,GH);
  // screen (logical canvas pixels, camera undone by o.point) <-> cell coordinates under the current view
  const cellAt=p=>[Math.floor(view.cx+(p[0]-o.W/2)/view.cs),Math.floor(view.cy+(p[1]-GH/2)/view.cs)];
  const sx=x=>o.W/2+(x-view.cx)*view.cs,sy=y=>GH/2+(y-view.cy)*view.cs;
  const record=()=>{if(gen<MAXGEN)pops[gen]=cells.size;};
  function load(id){cells=id==='soup'?soup(40,26,.32):presetSet(id);start=new Set(cells);gen=0;pops=[cells.size];last=new Map([...cells].map(k=>[k,0]));follow=true;snap=true;o.navigation?.camera.reset();dirty=true;}
  function setPlaying(v){playing=v;playBtn.textContent=v?t('Pause','Pause'):t('Lancer','Play');}
  function advance(){cells=step(cells);gen++;for(const k of cells)last.set(k,gen);if(gen%TRAIL===0)for(const [k,g0] of last)if(gen-g0>TRAIL)last.delete(k);if(gen<=MAXGEN){pops.length=gen;pops.push(cells.size);}dirty=true;}
  function toggle([x,y],value){const k=key(x,y);const alive=value??!cells.has(k);if(alive){cells.add(k);last.set(k,gen);}else cells.delete(k);if(gen===0)start=new Set(cells);record();dirty=true;return alive;}
  const restart=()=>{pops=[cells.size];last=new Map([...cells].map(k=>[k,0]));follow=true;snap=true;o.navigation?.camera.reset();};
  o.on(sel,'change',()=>{load(sel.value);setPlaying(false);});
  o.on(playBtn,'click',()=>setPlaying(!playing));
  o.on(root.querySelector('#lf-step'),'click',()=>{setPlaying(false);advance();});
  o.on(root.querySelector('#lf-back'),'click',()=>{setPlaying(false);cells=new Set(start);gen=0;restart();dirty=true;});
  o.on(root.querySelector('#lf-clear'),'click',()=>{setPlaying(false);cells=new Set();start=new Set();gen=0;restart();dirty=true;});
  o.on(trailBtn,'click',()=>{trail=!trail;trailBtn.setAttribute('aria-pressed',String(trail));dirty=true;});
  o.on(root.querySelector('#lf-fit'),'click',()=>{follow=true;o.navigation?.camera.reset();o.navigation?.apply();dirty=true;});
  bind(root,'lf-speed',v=>{speed=v;});
  // Every cell of the grid area is editable (also outside the pattern: the view then frames the new drawing).
  o.touchHit(p=>p[1]<GH);
  o.on(o.cv,'pointerdown',e=>{const p=o.point(e);if(p[1]>=GH)return;const c=cellAt(p);cursor=c;paint=toggle(c);o.cv.setPointerCapture?.(e.pointerId);e.preventDefault();});
  o.on(o.cv,'pointermove',e=>{if(paint===null)return;const c=cellAt(o.point(e));if(c[0]!==cursor[0]||c[1]!==cursor[1]){cursor=c;toggle(c,paint);}});
  o.on(o.cv,'pointerup',()=>{paint=null;});o.cancelDrag=()=>{paint=null;};
  o.on(o.cv,'keydown',e=>{if(e.shiftKey)return;const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];
    if(d){e.preventDefault();cursor=[cursor[0]+d[0],cursor[1]+d[1]];dirty=true;}else if(e.key===' '||e.key==='Enter'){e.preventDefault();toggle(cursor);}});
  o.onResize=()=>{dirty=true;};o.busy=()=>playing;
  const fmtN=n=>n>=10000?`${Math.round(n/1000)}k`:String(n);
  function curve(C){
    const Y0=GH+1,H=o.H-GH-1,L=44,R=o.W-12,T=Y0+22,B=o.H-18;
    g.fillStyle=C.surface;g.fillRect(0,Y0,o.W,H);g.strokeStyle=C.line;g.lineWidth=1;g.beginPath();g.moveTo(0,Y0-.5);g.lineTo(o.W,Y0-.5);g.stroke();
    const n=pops.length,gx=Math.max(30,n-1),py=Math.max(5,...pops),X=i=>L+(R-L)*i/gx,Yp=v=>B-(B-T)*v/py;
    g.font='11px "IBM Plex Sans",sans-serif';g.textBaseline='alphabetic';
    g.strokeStyle=C.grid;g.beginPath();g.moveTo(L,B+.5);g.lineTo(R,B+.5);g.moveTo(L+.5,T);g.lineTo(L+.5,B);g.stroke();
    g.fillStyle=C.muted;g.textAlign='right';g.fillText(fmtN(py),L-5,T+4);g.fillText('0',L-5,B+3);
    g.textAlign='left';g.fillText(t('population','population'),L,Y0+14);g.textAlign='right';g.fillText(`${t('génération','generation')} →  ${gx}`,R,o.H-4);
    g.strokeStyle=C.ink;g.lineWidth=1.5;g.beginPath();const stride=Math.max(1,Math.floor(n/600));
    for(let i=0;i<n;i+=stride){const x=X(i),y=Yp(pops[i]);i?g.lineTo(x,y):g.moveTo(x,y);}
    if((n-1)%stride)g.lineTo(X(n-1),Yp(pops[n-1]));g.stroke();
    g.fillStyle=C.accent;g.beginPath();g.arc(X(Math.min(n-1,gen)),Yp(pops[Math.min(n-1,gen)]),4,0,Math.PI*2);g.fill();
  }
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
    if(!dirty&&dt)return false;dirty=false;
    const C=palette(),sc=cam?cam.scale:1,cs=view.cs;
    g.clearRect(0,0,o.W,o.H);
    g.save();g.setTransform(o.scale,0,0,o.scale,0,0);g.beginPath();g.rect(0,0,o.W,GH);g.clip();o.navigation?.apply();
    const [x0,y0]=cam?cam.unproject([0,0]):[0,0],[x1,y1]=cam?cam.unproject([o.W,GH]):[o.W,GH];
    g.fillStyle=C.sunken;g.fillRect(x0,y0,x1-x0,y1-y0);
    if(cs*sc>=6){g.strokeStyle=C.grid;g.lineWidth=1/sc;g.beginPath();
      for(let x=Math.floor(view.cx+(x0-o.W/2)/cs);x<=Math.ceil(view.cx+(x1-o.W/2)/cs);x++){g.moveTo(sx(x),y0);g.lineTo(sx(x),y1);}
      for(let y=Math.floor(view.cy+(y0-GH/2)/cs);y<=Math.ceil(view.cy+(y1-GH/2)/cs);y++){g.moveTo(x0,sy(y));g.lineTo(x1,sy(y));}g.stroke();}
    const gap=cs>=7?1:0,vis=(px,py)=>px+cs>=x0&&px<=x1&&py+cs>=y0&&py<=y1;
    if(trail){g.fillStyle=C.accent;for(const [k,age] of trailAges(last,gen,TRAIL)){if(cells.has(k))continue;const [x,y]=coords(k),px=sx(x),py=sy(y);if(!vis(px,py))continue;g.globalAlpha=.34*(1-(age-1)/TRAIL);g.fillRect(px+gap/2,py+gap/2,cs-gap,cs-gap);}g.globalAlpha=1;}
    g.fillStyle=C.accent;
    for(const k of cells){const [x,y]=coords(k),px=sx(x),py=sy(y);if(!vis(px,py))continue;g.fillRect(px+gap/2,py+gap/2,cs-gap,cs-gap);}
    if(root.ownerDocument.activeElement===o.cv){g.strokeStyle=C.obj2;g.lineWidth=2/sc;g.strokeRect(sx(cursor[0]),sy(cursor[1]),cs,cs);}
    g.restore();
    g.save();g.setTransform(o.scale,0,0,o.scale,0,0);
    g.font='600 13px "IBM Plex Sans",sans-serif';g.textBaseline='top';g.textAlign='left';
    const label=`${t('Génération','Generation')} ${gen} · ${t('population','population')} ${cells.size}`,lw=(g.measureText(label)||{}).width||label.length*7;g.fillStyle=C.surface;g.fillRect(6,6,lw+12,22);g.strokeStyle=C.line;g.lineWidth=1;g.strokeRect(6.5,6.5,lw+11,21);g.fillStyle=C.ink;g.fillText(label,12,11);
    curve(C);g.restore();
    o.read(`${t('Génération','Generation')} ${gen} · ${t('cellules vivantes :','live cells:')} ${cells.size} · ${t('maximum atteint :','peak so far:')} ${Math.max(0,...pops)}${cells.size===0&&gen>0?' · '+t('tout est mort','everything has died'):''}`);
    return moving;
  });
  o.on(o.cv,'focus',()=>{dirty=true;});o.on(o.cv,'blur',()=>{dirty=true;});
  const redraw=o.redraw;o.redraw=()=>{dirty=true;redraw();};
  return o.stop;
}
