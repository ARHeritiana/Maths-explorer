// The moving sofa: push a sofa of your choice (Hammersley's family, Gerver's sofa, a rectangle, or one you draw) round
// the corner of a hallway of width 1. The walls stop it and it slides along them; it turns about its centre. The
// motions of Hammersley and Gerver can be played (gallery exhibit; maths in gallery-sofa-model.js).
import {exhibit,button,field,bind,palette} from './gallery-kit.js';
import {hammersley,hammersleyArea,HAMMERSLEY_R,rectangle,area,place,fits,through,hammersleyPose,gerverPose,hammersleyTurn,gerverTurn,fromStroke,centroid,turnAbout,resolve,RECORDS} from './gallery-sofa-model.js';
import {GERVER} from './gallery-sofa-gerver.js';
const S=52,OX=450,OY=40,EPS=1e-5;   // world (y up) to canvas: X = OX + S x, Y = OY + S (1 - y)
export function movingSofa(root,opts){
  const {t,lang}=opts,num=(v,d=3)=>lang==='fr'?v.toFixed(d).replace('.',','):v.toFixed(d);
  let kind='hammersley',r=HAMMERSLEY_R,w=1,len=1.8,poly=[],hit=[],c0=[0,0],reachR=1,pose={x:0,y:0,a:0},drag=null,drawing=null,play=null,auto=false,best=0,dirty=true,own=null;
  const o=exhibit(root,opts,t('Pousse le canapé dans le couloir, de gauche à droite puis vers le bas, sans traverser les murs : contre un mur, il glisse. Glisse-le pour le déplacer, tire la poignée ronde pour le faire tourner autour de son centre ; au clavier, les flèches le déplacent et les touches [ et ] le font tourner. Pour zoomer, pince l’écran ou utilise Ctrl + molette.','Push the sofa along the hallway, left to right then down, without going through the walls: against a wall it slides. Drag it to move it, pull the round handle to turn it about its centre; with the keyboard, arrow keys move it and the [ and ] keys turn it. To zoom, pinch or use Ctrl + wheel.'),
    `<label class="act-field exhibit-select"><span class="act-label">${t('Forme','Shape')}</span><select id="so-kind"><option value="hammersley" selected>${t('Famille de Hammersley','Hammersley’s family')}</option><option value="gerver">${t('Canapé de Gerver','Gerver’s sofa')}</option><option value="rect">${t('Rectangle','Rectangle')}</option><option value="own">${t('Mon dessin','My drawing')}</option></select></label>`+
    field('so-r',t('Rayon de l’encoche r','Notch radius r'),0,1,.01,r.toFixed(2))+field('so-w',t('Largeur','Width'),.2,1,.01,w)+field('so-l',t('Longueur','Length'),.2,3,.01,len)+
    button('so-draw',t('Dessiner mon canapé','Draw my sofa'))+button('so-play',t('Montrer le mouvement','Show the motion'),true)+button('so-reset',t('Revenir au départ','Back to the start')),
    `<p>${t('Un rectangle de largeur 1 ne tourne que s’il est assez court ; un demi-disque de rayon 1 tourne en pivotant autour du coin intérieur, avec une aire π/2 ≈ 1,571. En 1968, John Hammersley creuse une encoche en demi-cercle et écarte les deux quarts de disque : avec r = 2/π, l’aire atteint π/2 + 2/π ≈ 2,2074. En 1992, Joseph Gerver arrondit ce canapé ; son contour est fait de 18 morceaux de courbes et son aire vaut environ 2,2195. Celui qui est dessiné ici est calculé à partir des équations de Dan Romik (2018) : il est l’intersection de tous les couloirs vus depuis le canapé pendant qu’il tourne.','A rectangle of width 1 only turns if it is short enough; a half disc of radius 1 turns by pivoting about the inner corner, with area π/2 ≈ 1.571. In 1968 John Hammersley cut a half-disc notch and moved the two quarter discs apart: with r = 2/π the area reaches π/2 + 2/π ≈ 2.2074. In 1992 Joseph Gerver rounded this sofa; its outline is made of 18 pieces of curves and its area is about 2.2195. The one drawn here is computed from Dan Romik’s equations (2018): it is the intersection of all the hallways seen from the sofa while it turns.')}</p><p>${t('Le problème, posé par Leo Moser en 1966, demande l’aire la plus grande possible. Hammersley a montré qu’aucun canapé ne dépasse 2√2 ≈ 2,83 ; Yoav Kallus et Dan Romik ont abaissé cette borne à 2,37 en 2018, avec l’aide de l’ordinateur. En 2024, Jineon Baek a proposé une démonstration de plus de cent pages : le canapé de Gerver serait le meilleur. Au 20 octobre 2026, cette démonstration n’est pas encore publiée dans une revue ; elle est en cours de vérification, y compris sous forme formelle avec l’assistant de preuve Lean.','The problem, posed by Leo Moser in 1966, asks for the largest possible area. Hammersley showed that no sofa exceeds 2√2 ≈ 2.83; Yoav Kallus and Dan Romik lowered this bound to 2.37 in 2018, with computer help. In 2024 Jineon Baek proposed a proof of more than a hundred pages that Gerver’s sofa is the best. As of 20 October 2026 the proof has not yet appeared in a journal; it is being checked, including in formal form with the Lean proof assistant.')}</p>`);
  const g=o.g,kindSel=root.querySelector('#so-kind'),playBtn=root.querySelector('#so-play'),drawBtn=root.querySelector('#so-draw');
  const X=x=>OX+S*x,Y=y=>OY+S*(1-y),W=([px,py])=>[(px-OX)/S,1-(py-OY)/S];
  // the whole outline is used for the wall test: a thinned copy would cut across the concave notch
  function setPoly(p){poly=p;hit=p;c0=centroid(p);reachR=Math.max(...p.map(q=>Math.hypot(q[0]-c0[0],q[1]-c0[1])));}
  // for Hammersley's and Gerver's sofas, their own motion gives the position at each angle in the corner
  const guide=a=>kind==='gerver'?gerverTurn(GERVER.path,a):kind==='hammersley'?hammersleyTurn(r,a):null;
  const motion=s=>kind==='gerver'?gerverPose(GERVER.path,s):hammersleyPose(r,s,1.5);
  const start=()=>{if(kind==='hammersley'||kind==='gerver')return motion(0);const xs=poly.map(p=>p[0]),ys=poly.map(p=>p[1]);return {x:-1.5-Math.max(...xs),y:.5-(Math.max(...ys)+Math.min(...ys))/2,a:0};};
  function shapeChanged(){setPoly(kind==='hammersley'?hammersley(r):kind==='gerver'?GERVER.outline:kind==='rect'?rectangle(w,len):own||rectangle(.8,.8));pose=kind==='own'&&own?.pose?{...own.pose}:start();play=null;show();dirty=true;}
  function show(){root.querySelector('#so-r').closest('.act-field').hidden=kind!=='hammersley';root.querySelectorAll('#so-w,#so-l').forEach(el=>el.closest('.act-field').hidden=kind!=='rect');playBtn.hidden=!(kind==='hammersley'||kind==='gerver');drawBtn.hidden=kind!=='own';}
  function moveTo(target){auto=false;pose=resolve(hit,pose,target,{eps:EPS,guide});dirty=true;}
  const centre=()=>place([c0],pose)[0];
  // the turning handle stays close to the centre, so that it is on screen in the corner
  const handle=()=>{const [cx,cy]=centre(),d=.65;return [cx-Math.sin(pose.a)*d,cy+Math.cos(pose.a)*d];};
  o.on(kindSel,'change',()=>{kind=kindSel.value;if(kind==='own'&&!own){drawing=[];drawBtn.textContent=t('Dessine dans le couloir…','Draw in the hallway…');}shapeChanged();});
  bind(root,'so-r',v=>{r=v;shapeChanged();},v=>v.toFixed(2));bind(root,'so-w',v=>{w=v;shapeChanged();},v=>v.toFixed(2));bind(root,'so-l',v=>{len=v;shapeChanged();},v=>v.toFixed(2));
  o.on(drawBtn,'click',()=>{drawing=[];drawBtn.textContent=t('Dessine dans le couloir…','Draw in the hallway…');dirty=true;});
  o.on(playBtn,'click',()=>{play=play===null?0:null;auto=true;dirty=true;});
  o.on(root.querySelector('#so-reset'),'click',()=>{pose=start();play=null;dirty=true;});
  o.on(o.cv,'pointerdown',e=>{const p=W(o.point(e));play=null;
    if(drawing){drawing=[p];drag={draw:true};}
    else{const h=handle(),[cx,cy]=centre();if(Math.hypot(p[0]-h[0],p[1]-h[1])<.3)drag={rotate:true,offset:Math.atan2(p[1]-cy,p[0]-cx)-pose.a};else drag={dx:p[0]-pose.x,dy:p[1]-pose.y};}
    o.cv.setPointerCapture?.(e.pointerId);e.preventDefault();dirty=true;});
  o.on(o.cv,'pointermove',e=>{if(!drag)return;const p=W(o.point(e));
    if(drag.draw)drawing.push(p);
    else if(drag.rotate){const [cx,cy]=centre();let target=Math.atan2(p[1]-cy,p[0]-cx)-drag.offset,da=Math.atan2(Math.sin(target-pose.a),Math.cos(target-pose.a));
      // turn in small steps so that the sofa can slide along the walls as it turns
      const n=Math.max(1,Math.ceil(Math.abs(da)/.03));for(let i=0;i<n;i++)moveTo(turnAbout(pose,c0,pose.a+da/n));}
    else{const dx=p[0]-drag.dx-pose.x,dy=p[1]-drag.dy-pose.y,n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/.04));for(let i=0;i<n;i++)moveTo({...pose,x:pose.x+dx/n,y:pose.y+dy/n});}
    dirty=true;});
  const up=()=>{if(drag?.draw&&drawing.length>8){const s=fromStroke(drawing);if(s&&area(s.poly)>.02){own=s.poly;own.pose={x:s.at[0],y:s.at[1],a:0};kind='own';kindSel.value='own';shapeChanged();}}if(drag?.draw){drawing=null;drawBtn.textContent=t('Dessiner mon canapé','Draw my sofa');show();}drag=null;dirty=true;};
  o.on(o.cv,'pointerup',up);o.cancelDrag=()=>{drag=null;};
  o.on(o.cv,'keydown',e=>{if(e.shiftKey)return;const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1]}[e.key];
    if(d){e.preventDefault();play=null;moveTo({...pose,x:pose.x+d[0]*.05,y:pose.y+d[1]*.05});}else if(e.key==='['||e.key===']'){e.preventDefault();play=null;moveTo(turnAbout(pose,c0,pose.a+(e.key===']'?-1:1)*Math.PI/90));}});
  shapeChanged();
  root.__sofa=()=>({pose:{...pose},handle:handle(),centre:centre(),kind});   // read by the browser tests
  o.animate(dt=>{
    // frame time, or real elapsed time under reduced motion (the motion runs only when asked)
    const now=performance.now(),real=dt||Math.min(.1,(now-(o.last||now))/1000);o.last=now;
    if(play!==null){play=Math.min(3,play+real*.45);pose=motion(play);dirty=true;if(play>=3)play=null;}
    if(!dirty)return;dirty=false;
    const C=palette(),ok=fits(poly,pose,EPS),done=ok&&through(poly,pose),A=kind==='gerver'?GERVER.area:kind==='hammersley'?hammersleyArea(r):area(poly);if(done&&!auto)best=Math.max(best,A);
    g.clearRect(0,0,o.W,o.H);g.fillStyle=C.line;g.globalAlpha=.35;g.fillRect(-2000,-2000,4640,4440);g.globalAlpha=1;
    g.fillStyle=C.sunken;g.fillRect(-2000,Y(1),X(1)+2000,S);g.fillRect(X(0),Y(1),S,3000);
    g.strokeStyle=C.ink;g.lineWidth=2;g.beginPath();g.moveTo(-2000,Y(1));g.lineTo(X(1),Y(1));g.lineTo(X(1),3000);g.moveTo(-2000,Y(0));g.lineTo(X(0),Y(0));g.lineTo(X(0),3000);g.stroke();
    if(drawing){g.strokeStyle=C.obj2;g.lineWidth=2;g.beginPath();drawing.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));g.stroke();}
    else{const pts=place(poly,pose);g.beginPath();pts.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));g.closePath();
      g.fillStyle=ok?(done?C.pos:C.accent):C.neg;g.globalAlpha=.4;g.fill();g.globalAlpha=1;g.strokeStyle=ok?C.ink:C.neg;g.lineWidth=2;g.stroke();
      const h=handle(),[cx,cy]=centre();g.strokeStyle=C.ink;g.lineWidth=1.5;g.setLineDash([4,3]);g.beginPath();g.moveTo(X(cx),Y(cy));g.lineTo(X(h[0]),Y(h[1]));g.stroke();g.setLineDash([]);
      g.fillStyle=C.ink;g.beginPath();g.arc(X(cx),Y(cy),3.5,0,2*Math.PI);g.fill();g.fillStyle=C.obj2;g.beginPath();g.arc(X(h[0]),Y(h[1]),8,0,2*Math.PI);g.fill();}
    const status=drawing?t('Dessine le contour de ton canapé d’un seul trait.','Draw the outline of your sofa in one stroke.'):!ok?t('Le canapé traverse un mur : ramène-le dans le couloir.','The sofa goes through a wall: bring it back into the hallway.'):done?t('Le canapé a passé le coin !','The sofa is round the corner!'):t('Dans le couloir.','In the hallway.');
    const turned=Math.round(-pose.a*180/Math.PI);
    o.read(`${t('Aire :','Area:')} ${num(A,kind==='gerver'?4:3)}${kind==='hammersley'?` (π/2 + 2r − πr²/2 = ${num(hammersleyArea(r))})`:''} · ${t('tourné de','turned by')} ${turned}° · ${status}${best?` · ${t('ta meilleure aire passée :','your best area through:')} ${num(best,4)}`:''} · ${t('record connu :','known record:')} ${num(RECORDS.gerver,4)}`);
  });
  return o.stop;
}
