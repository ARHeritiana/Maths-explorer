// The moving sofa: push a sofa of your choice (rectangle, Hammersley's family, or one you draw) round the corner of a
// hallway of width 1; walls stop it. Hammersley's motion can be played (gallery exhibit; maths in gallery-sofa-model.js).
import {exhibit,button,field,bind,palette} from './gallery-kit.js';
import {hammersley,hammersleyArea,HAMMERSLEY_R,rectangle,area,place,fits,through,hammersleyPose,fromStroke,RECORDS} from './gallery-sofa-model.js';
const S=52,OX=450,OY=40;   // world (y up) to canvas: X = OX + S x, Y = OY + S (1 - y)
export function movingSofa(root,opts){
  const {t,lang}=opts,num=(v,d=3)=>lang==='fr'?v.toFixed(d).replace('.',','):v.toFixed(d);
  let kind='hammersley',r=HAMMERSLEY_R,w=1,len=1.8,poly=hammersley(r),pose={x:-5,y:0,a:0},drag=null,drawing=null,play=null,auto=false,best=0,dirty=true;
  const o=exhibit(root,opts,t('Pousse le canapé dans le couloir, de gauche à droite puis vers le bas, sans traverser les murs. Glisse-le pour le déplacer, tire la poignée ronde pour le faire tourner ; au clavier, les flèches le déplacent et les touches [ et ] le font tourner. Choisis une forme, change ses dimensions ou dessine ton propre canapé.','Push the sofa along the hallway, left to right then down, without going through the walls. Drag it to move it, pull the round handle to turn it; with the keyboard, arrow keys move it and the [ and ] keys turn it. Choose a shape, change its size or draw your own sofa.'),
    `<label class="act-field exhibit-select"><span class="act-label">${t('Forme','Shape')}</span><select id="so-kind"><option value="hammersley" selected>${t('Famille de Hammersley','Hammersley’s family')}</option><option value="rect">${t('Rectangle','Rectangle')}</option><option value="own">${t('Mon dessin','My drawing')}</option></select></label>`+
    field('so-r',t('Rayon de l’encoche r','Notch radius r'),0,1,.01,r.toFixed(2))+field('so-w',t('Largeur','Width'),.2,1,.01,w)+field('so-l',t('Longueur','Length'),.2,3,.01,len)+
    button('so-draw',t('Dessiner mon canapé','Draw my sofa'))+button('so-play',t('Montrer le mouvement de Hammersley','Show Hammersley’s motion'),true)+button('so-reset',t('Revenir au départ','Back to the start')),
    `<p>${t('Un rectangle de largeur 1 ne tourne que s’il est assez court ; un demi-disque de rayon 1 tourne en pivotant autour du coin extérieur, avec une aire π/2 ≈ 1,571. En 1968, John Hammersley creuse une encoche en demi-cercle et écarte les deux quarts de disque : avec r = 2/π, l’aire atteint π/2 + 2/π ≈ 2,2074. En 1992, Joseph Gerver arrondit ce canapé avec 18 morceaux de courbes et atteint environ 2,2195.','A rectangle of width 1 only turns if it is short enough; a half disc of radius 1 turns by pivoting about the outer corner, with area π/2 ≈ 1.571. In 1968 John Hammersley cut a half-disc notch and moved the two quarter discs apart: with r = 2/π the area reaches π/2 + 2/π ≈ 2.2074. In 1992 Joseph Gerver rounded this sofa with 18 pieces of curves and reached about 2.2195.')}</p><p>${t('Le problème, posé par Leo Moser en 1966, demande l’aire la plus grande possible. Hammersley a montré qu’aucun canapé ne dépasse 2√2 ≈ 2,83 ; Yoav Kallus et Dan Romik ont abaissé cette borne à 2,37 en 2018, avec l’aide de l’ordinateur. En 2024, Jineon Baek a proposé une démonstration de plus de cent pages : le canapé de Gerver serait le meilleur. Elle est en cours de vérification par les spécialistes.','The problem, posed by Leo Moser in 1966, asks for the largest possible area. Hammersley showed that no sofa exceeds 2√2 ≈ 2.83; Yoav Kallus and Dan Romik lowered this bound to 2.37 in 2018, with computer help. In 2024 Jineon Baek proposed a proof of more than a hundred pages that Gerver’s sofa is the best. Specialists are still checking it.')}</p>`);
  const g=o.g,kindSel=root.querySelector('#so-kind'),playBtn=root.querySelector('#so-play'),drawBtn=root.querySelector('#so-draw');
  const X=x=>OX+S*x,Y=y=>OY+S*(1-y),W=([px,py])=>[(px-OX)/S,1-(py-OY)/S];
  const start=()=>{if(kind==='hammersley')return hammersleyPose(r,0,1.5);const xs=poly.map(p=>p[0]);return {x:-1.5-Math.max(...xs),y:.5,a:0};};
  function shapeChanged(){poly=kind==='hammersley'?hammersley(r):kind==='rect'?rectangle(w,len):poly;pose=start();play=null;show();dirty=true;}
  function show(){root.querySelector('#so-r').closest('.act-field').hidden=kind!=='hammersley';root.querySelectorAll('#so-w,#so-l').forEach(el=>el.closest('.act-field').hidden=kind!=='rect');playBtn.hidden=kind!=='hammersley';drawBtn.hidden=kind!=='own';}
  // Move towards a target pose; when the walls block, keep the largest fraction of the move that fits (a push).
  function moveTo(target){
    auto=false;
    if(!fits(poly,pose,1e-6)){pose=target;dirty=true;return;}
    if(fits(poly,target,1e-6)){pose=target;dirty=true;return;}
    for(const t2 of [{...target,y:pose.y},{...target,x:pose.x}])if(t2.a===target.a&&fits(poly,t2,1e-6)&&(t2.x!==pose.x||t2.y!==pose.y)){pose=t2;dirty=true;return;}
    let lo=0,hi=1;for(let i=0;i<14;i++){const m=(lo+hi)/2,p={x:pose.x+(target.x-pose.x)*m,y:pose.y+(target.y-pose.y)*m,a:pose.a+(target.a-pose.a)*m};if(fits(poly,p,1e-6))lo=m;else hi=m;}
    if(lo>0){pose={x:pose.x+(target.x-pose.x)*lo,y:pose.y+(target.y-pose.y)*lo,a:pose.a+(target.a-pose.a)*lo};dirty=true;}
  }
  const handle=()=>{const c=Math.cos(pose.a),s=Math.sin(pose.a),d=.9;return [pose.x-s*d,pose.y+c*d];};
  o.on(kindSel,'change',()=>{kind=kindSel.value;if(kind==='own'){drawing=[];drawBtn.textContent=t('Dessine dans le couloir…','Draw in the hallway…');}shapeChanged();});
  bind(root,'so-r',v=>{r=v;shapeChanged();},v=>v.toFixed(2));bind(root,'so-w',v=>{w=v;shapeChanged();},v=>v.toFixed(2));bind(root,'so-l',v=>{len=v;shapeChanged();},v=>v.toFixed(2));
  o.on(drawBtn,'click',()=>{drawing=[];drawBtn.textContent=t('Dessine dans le couloir…','Draw in the hallway…');dirty=true;});
  o.on(playBtn,'click',()=>{play=play===null?0:null;auto=true;dirty=true;});
  o.on(root.querySelector('#so-reset'),'click',()=>{pose=start();play=null;dirty=true;});
  o.on(o.cv,'pointerdown',e=>{const p=W(o.point(e));play=null;
    if(drawing){drawing=[p];drag={draw:true};}
    else{const h=handle();if(Math.hypot(p[0]-h[0],p[1]-h[1])<.25)drag={rotate:true};else drag={dx:p[0]-pose.x,dy:p[1]-pose.y};}
    o.cv.setPointerCapture?.(e.pointerId);e.preventDefault();dirty=true;});
  o.on(o.cv,'pointermove',e=>{if(!drag)return;const p=W(o.point(e));
    if(drag.draw){drawing.push(p);}else if(drag.rotate){const a=Math.atan2(p[1]-pose.y,p[0]-pose.x)-Math.PI/2;let da=a-pose.a;da=Math.atan2(Math.sin(da),Math.cos(da));moveTo({...pose,a:pose.a+Math.max(-.2,Math.min(.2,da))});}
    else{const tx=p[0]-drag.dx,ty=p[1]-drag.dy,dx=tx-pose.x,dy=ty-pose.y,n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/.05));for(let i=1;i<=n;i++)moveTo({...pose,x:pose.x+dx/n*1,y:pose.y+dy/n*1});}
    dirty=true;});
  const up=()=>{if(drag?.draw&&drawing.length>8){const s=fromStroke(drawing);if(s&&area(s.poly)>.02){poly=s.poly;pose={x:s.at[0],y:s.at[1],a:0};kind='own';kindSel.value='own';}drawing=null;drawBtn.textContent=t('Dessiner mon canapé','Draw my sofa');show();}drag=null;dirty=true;};
  o.on(o.cv,'pointerup',up);o.cancelDrag=()=>{drag=null;};
  o.on(o.cv,'keydown',e=>{if(e.shiftKey)return;const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1]}[e.key];
    if(d){e.preventDefault();play=null;moveTo({...pose,x:pose.x+d[0]*.05,y:pose.y+d[1]*.05});}else if(e.key==='['||e.key===']'){e.preventDefault();play=null;moveTo({...pose,a:pose.a+(e.key===']'?-1:1)*Math.PI/90});}});
  show();shapeChanged();
  o.animate(dt=>{
    // frame time, or real elapsed time under reduced motion (the motion runs only when asked)
    const now=performance.now(),real=dt||Math.min(.1,(now-(o.last||now))/1000);o.last=now;
    if(play!==null){play=Math.min(3,play+real*.45);pose=hammersleyPose(r,play,1.5);dirty=true;if(play>=3)play=null;}
    if(!dirty)return;dirty=false;
    const C=palette(),ok=fits(poly,pose,1e-6),done=ok&&through(poly,pose),A=area(poly);if(done&&!auto)best=Math.max(best,A);
    g.clearRect(0,0,o.W,o.H);g.fillStyle=C.line;g.globalAlpha=.35;g.fillRect(-2000,-2000,4640,4440);g.globalAlpha=1;
    g.fillStyle=C.sunken;g.fillRect(-2000,Y(1),X(1)+2000,S);g.fillRect(X(0),Y(1),S,3000);
    g.strokeStyle=C.ink;g.lineWidth=2;g.beginPath();g.moveTo(-2000,Y(1));g.lineTo(X(1),Y(1));g.lineTo(X(1),3000);g.moveTo(-2000,Y(0));g.lineTo(X(0),Y(0));g.lineTo(X(0),3000);g.stroke();
    if(drawing){g.strokeStyle=C.obj2;g.lineWidth=2;g.beginPath();drawing.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));g.stroke();}
    else{const pts=place(poly,pose);g.beginPath();pts.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));g.closePath();
      g.fillStyle=ok?(done?C.pos:C.accent):C.neg;g.globalAlpha=.4;g.fill();g.globalAlpha=1;g.strokeStyle=ok?C.ink:C.neg;g.lineWidth=2;g.stroke();
      const h=handle();g.strokeStyle=C.ink;g.lineWidth=1.5;g.beginPath();g.moveTo(X(pose.x),Y(pose.y));g.lineTo(X(h[0]),Y(h[1]));g.stroke();g.fillStyle=C.obj2;g.beginPath();g.arc(X(h[0]),Y(h[1]),7,0,2*Math.PI);g.fill();}
    const status=drawing?t('Dessine le contour de ton canapé d’un seul trait.','Draw the outline of your sofa in one stroke.'):!ok?t('Le canapé traverse un mur : ramène-le dans le couloir.','The sofa goes through a wall: bring it back into the hallway.'):done?t('Le canapé a passé le coin !','The sofa is round the corner!'):t('Dans le couloir.','In the hallway.');
    o.read(`${t('Aire :','Area:')} ${num(A)}${kind==='hammersley'?` (π/2 + 2r − πr²/2 = ${num(hammersleyArea(r))})`:''} · ${status}${best?` · ${t('ta meilleure aire passée :','your best area through:')} ${num(best)}`:''} · ${t('record connu :','known record:')} ${num(RECORDS.gerver,4)}`);
  });
  return o.stop;
}
