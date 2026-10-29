// Conway's Game of Life on the unbounded plane: presets, drawing cells by hand, play, step and speed (gallery exhibit).
import {exhibit,button,field,bind,palette} from './gallery-kit.js';
import {PRESETS,presetSet,step,key,coords,soup} from './gallery-life-model.js';
const CELL=12,CX=320,CY=220;
export function gameOfLife(root,opts){
  const {t}=opts;
  let cells=presetSet('glider'),start=new Set(cells),gen=0,playing=false,speed=8,acc=0,cursor=[0,0],paint=null,dirty=true;
  const kinds={osc:t('Oscillateurs','Oscillators'),ship:t('Vaisseaux','Spaceships'),gun:t('Canons','Guns'),meth:t('Longues évolutions','Long evolutions')};
  const options=Object.entries(kinds).map(([k,label])=>`<optgroup label="${label}">${PRESETS.filter(p=>p.kind===k).map(p=>`<option value="${p.id}" ${p.id==='glider'?'selected':''}>${t(...p.name)}</option>`).join('')}</optgroup>`).join('');
  const o=exhibit(root,opts,t('Chaque case vit ou meurt selon ses huit voisines. Une case morte avec exactement 3 voisines vivantes naît ; une case vivante avec 2 ou 3 voisines survit ; toutes les autres meurent. Touche ou glisse sur la grille pour dessiner ; au clavier, les flèches déplacent le curseur et Espace change la case.','Each cell lives or dies according to its eight neighbours. A dead cell with exactly 3 live neighbours is born; a live cell with 2 or 3 neighbours survives; all the others die. Tap or drag on the grid to draw; with the keyboard, arrow keys move the cursor and Space toggles the cell.'),
    `<label class="act-field exhibit-select"><span class="act-label">${t('Configuration de départ','Starting pattern')}</span><select id="lf-preset">${options}<option value="soup">${t('Soupe aléatoire','Random soup')}</option></select></label>`+
    button('lf-play',t('Lancer','Play'),true)+button('lf-step',t('Une génération','One generation'))+button('lf-back',t('Revenir au départ','Back to the start'))+button('lf-clear',t('Effacer','Clear'))+
    field('lf-speed',t('Générations par seconde','Generations per second'),1,30,1,speed),
    `<p>${t('Le clignotant revient à sa forme toutes les 2 générations, le pulsar toutes les 3. Le planeur reprend sa forme au bout de 4 générations, décalé d’une case en diagonale : il se déplace. Le canon de Gosper lance un planeur toutes les 30 générations, donc la population peut croître sans limite.','The blinker returns to its shape every 2 generations, the pulsar every 3. The glider takes its shape again after 4 generations, shifted one cell diagonally: it travels. The Gosper gun fires a glider every 30 generations, so the population can grow without bound.')}</p><p>${t('Le R-pentomino n’a que cinq cellules, mais il évolue pendant 1 103 générations avant de se stabiliser avec 116 cellules ; le gland en met 5 206 et finit avec 633 cellules. Le diehard disparaît entièrement après 130 générations. Prévoir l’avenir d’une configuration est en général impossible sans la faire évoluer : le jeu de la vie peut simuler n’importe quel ordinateur.','The R-pentomino has only five cells, yet it evolves for 1,103 generations before settling with 116 cells; the acorn takes 5,206 and ends with 633 cells. Diehard vanishes completely after 130 generations. Predicting the future of a pattern is in general impossible without running it: the Game of Life can simulate any computer.')}</p>`);
  const g=o.g,playBtn=root.querySelector('#lf-play'),sel=root.querySelector('#lf-preset');
  const cellAt=p=>[Math.floor((p[0]-CX)/CELL),Math.floor((p[1]-CY)/CELL)];
  function load(id){cells=id==='soup'?soup(40,26,.32):presetSet(id);start=new Set(cells);gen=0;dirty=true;}
  function setPlaying(v){playing=v;playBtn.textContent=v?t('Pause','Pause'):t('Lancer','Play');}
  function advance(){cells=step(cells);gen++;dirty=true;}
  function toggle([x,y],value){const k=key(x,y);const alive=value??!cells.has(k);if(alive)cells.add(k);else cells.delete(k);if(gen===0)start=new Set(cells);dirty=true;return alive;}
  o.on(sel,'change',()=>{load(sel.value);setPlaying(false);});
  o.on(playBtn,'click',()=>setPlaying(!playing));
  o.on(root.querySelector('#lf-step'),'click',()=>{setPlaying(false);advance();});
  o.on(root.querySelector('#lf-back'),'click',()=>{setPlaying(false);cells=new Set(start);gen=0;dirty=true;});
  o.on(root.querySelector('#lf-clear'),'click',()=>{setPlaying(false);cells=new Set();start=new Set();gen=0;dirty=true;});
  bind(root,'lf-speed',v=>{speed=v;});
  // Every grid cell is editable; this bounded board is a drawing surface.
  o.touchHit(()=>true);
  o.on(o.cv,'pointerdown',e=>{const c=cellAt(o.point(e));cursor=c;paint=toggle(c);o.cv.setPointerCapture?.(e.pointerId);e.preventDefault();});
  o.on(o.cv,'pointermove',e=>{if(paint===null)return;const c=cellAt(o.point(e));if(c[0]!==cursor[0]||c[1]!==cursor[1]){cursor=c;toggle(c,paint);}});
  o.on(o.cv,'pointerup',()=>{paint=null;});o.cancelDrag=()=>{paint=null;};
  o.on(o.cv,'keydown',e=>{if(e.shiftKey)return;const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];
    if(d){e.preventDefault();cursor=[cursor[0]+d[0],cursor[1]+d[1]];dirty=true;}else if(e.key===' '||e.key==='Enter'){e.preventDefault();toggle(cursor);}});
  o.animate(dt=>{
    // real elapsed time: the simulation runs only when asked, so it also runs under reduced motion
    const now=performance.now(),real=Math.min(.1,(now-(o.last||now))/1000);o.last=now;
    if(playing){acc+=real*speed;let n=0;while(acc>=1&&n<4){advance();acc-=1;n++;}if(n===4)acc=0;}
    if(!dirty&&dt)return;dirty=false;
    const C=palette(),cam=o.navigation?.camera,sc=cam?cam.scale:1;
    g.clearRect(0,0,o.W,o.H);
    const [x0,y0]=cam?cam.unproject([0,0]):[0,0],[x1,y1]=cam?cam.unproject([o.W,o.H]):[o.W,o.H];
    g.fillStyle=C.sunken;g.fillRect(x0,y0,x1-x0,y1-y0);
    if(CELL*sc>=5){g.strokeStyle=C.grid;g.lineWidth=1/sc;g.beginPath();
      for(let x=Math.floor((x0-CX)/CELL);x<=Math.ceil((x1-CX)/CELL);x++){g.moveTo(CX+x*CELL,y0);g.lineTo(CX+x*CELL,y1);}
      for(let y=Math.floor((y0-CY)/CELL);y<=Math.ceil((y1-CY)/CELL);y++){g.moveTo(x0,CY+y*CELL);g.lineTo(x1,CY+y*CELL);}g.stroke();}
    g.fillStyle=C.accent;
    for(const k of cells){const [x,y]=coords(k),px=CX+x*CELL,py=CY+y*CELL;if(px+CELL<x0||px>x1||py+CELL<y0||py>y1)continue;g.fillRect(px+.5,py+.5,CELL-1,CELL-1);}
    if(root.ownerDocument.activeElement===o.cv){g.strokeStyle=C.obj2;g.lineWidth=2/sc;g.strokeRect(CX+cursor[0]*CELL,CY+cursor[1]*CELL,CELL,CELL);}
    o.read(`${t('Génération','Generation')} ${gen} · ${t('cellules vivantes :','live cells:')} ${cells.size}${cells.size===0&&gen>0?' · '+t('tout est mort','everything has died'):''}`);
  });
  o.on(o.cv,'focus',()=>{dirty=true;});o.on(o.cv,'blur',()=>{dirty=true;});
  const redraw=o.redraw;o.redraw=()=>{dirty=true;redraw();};
  return o.stop;
}
