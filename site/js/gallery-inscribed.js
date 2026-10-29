// The inscribed square problem: draw a closed curve or reshape one, and the exhibit searches for squares (or rectangles
// of a chosen shape) with their four corners on it (gallery exhibit; maths in gallery-inscribed-model.js).
import {exhibit,button,field,bind,palette} from './gallery-kit.js';
import {curve,selfCrossing,inscribed,randomCurve,insertionIndex,PRESETS} from './gallery-inscribed-model.js';
const S=60,OX=20,OY=10;
export function inscribedSquare(root,opts){
  const {t,lang}=opts,num=(v,d=2)=>lang==='fr'?v.toFixed(d).replace('.',','):v.toFixed(d);
  let preset='blob',ctrl=PRESETS.blob.ctrl.map(p=>[...p]),corners=false,ratio=1,pts=[],found=[],pick=0,crossing=false,drag=null,stroke=null,dirty=true,pending=0;
  const names={blob:t('Une forme quelconque','Any shape'),ellipse:t('Ellipse','Ellipse'),acute:t('Triangle acutangle','Acute triangle'),obtuse:t('Triangle obtusangle','Obtuse triangle'),star:t('Étoile','Star'),spiral:t('Spirale carrée','Square spiral')};
  const o=exhibit(root,opts,t('Toute courbe fermée qui ne se croise pas contient-elle les quatre sommets d’un carré ? Dessine une courbe d’un seul trait, tire une courbe au hasard, ou déplace ses points ronds ; touche la courbe pour ajouter un point, Suppr efface le point choisi. La recherche se relance et montre les carrés trouvés. Au clavier, N choisit le point suivant et les flèches le déplacent.','Does every closed curve that does not cross itself contain the four corners of a square? Draw a curve in one stroke, pick a random curve, or move its round points; touch the curve to add a point, Delete removes the selected point. The search runs again and shows the squares found. With the keyboard, N selects the next point and arrow keys move it.'),
    `<label class="act-field exhibit-select"><span class="act-label">${t('Courbe','Curve')}</span><select id="is-preset">${Object.entries(names).map(([k,v])=>`<option value="${k}" ${k===preset?'selected':''}>${v}</option>`).join('')}</select></label>`+
    button('is-draw',t('Dessiner une courbe','Draw a curve'),true)+button('is-random',t('Courbe au hasard','Random curve'))+button('is-delete',t('Effacer le point choisi','Delete the selected point'))+button('is-next',t('Carré suivant','Next square'))+button('is-sides',t('Côtés droits','Straight sides'))+
    field('is-ratio',t('Rapport des côtés (1 = carré)','Ratio of the sides (1 = square)'),1,3,.1,1)+field('is-point',t('Point choisi','Selected point'),1,ctrl.length,1,1),
    `<p>${t('Otto Toeplitz pose la question en 1911. La réponse est oui pour les courbes convexes (Arnold Emch, 1913), pour les courbes lisses (Lev Schnirelmann, 1929) et pour bien d’autres familles ; pour une courbe continue quelconque, elle reste inconnue. Un triangle acutangle contient trois carrés inscrits, un triangle obtusangle un seul : essaie.','Otto Toeplitz asked the question in 1911. The answer is yes for convex curves (Arnold Emch, 1913), for smooth curves (Lev Schnirelmann, 1929) and for many other families; for an arbitrary continuous curve it is still unknown. An acute triangle contains three inscribed squares, an obtuse one only one: try it.')}</p><p>${t('En 2020, Joshua Greene et Andrew Lobb ont montré que toute courbe lisse contient des rectangles inscrits de n’importe quelle forme : règle le rapport des côtés pour les chercher. La recherche du site est numérique : elle essaie de nombreuses paires de points de la courbe et peut manquer un carré très petit.','In 2020 Joshua Greene and Andrew Lobb showed that every smooth curve contains inscribed rectangles of every shape: set the ratio of the sides to look for them. The site’s search is numerical: it tries many pairs of points of the curve and can miss a very small square.')}</p>`);
  const g=o.g,pointSel=root.querySelector('#is-point'),sidesBtn=root.querySelector('#is-sides');
  const X=([x,y])=>[OX+S*x,OY+S*y],W=([px,py])=>[(px-OX)/S,(py-OY)/S];
  function rebuild(search=true){pts=curve(ctrl,{corners,n:corners?40:24});crossing=selfCrossing(pts);pointSel.max=ctrl.length;sidesBtn.setAttribute('aria-pressed',String(corners));found=[];pick=0;dirty=true;
    if(search&&!crossing){clearTimeout(pending);pending=setTimeout(()=>{found=inscribed(pts,{angle:2*Math.atan(1/ratio)});pick=0;dirty=true;},30);}}
  function load(k){preset=k;ctrl=PRESETS[k].ctrl.map(p=>[...p]);corners=!!PRESETS[k].corners;rebuild();}
  o.on(root.querySelector('#is-preset'),'change',e=>load(e.target.value));
  o.on(root.querySelector('#is-draw'),'click',()=>{stroke=[];dirty=true;});
  o.on(root.querySelector('#is-random'),'click',()=>{ctrl=randomCurve(Math.random,{corners});sel=0;rebuild();});
  // a closed curve keeps at least three points
  const removePoint=()=>{if(ctrl.length>3){ctrl.splice(sel,1);sel=Math.min(sel,ctrl.length-1);pointSel.value=sel+1;root.querySelector('#is-point-out').textContent=sel+1;rebuild();}};
  o.on(root.querySelector('#is-delete'),'click',removePoint);
  o.on(root.querySelector('#is-next'),'click',()=>{if(found.length){pick=(pick+1)%found.length;dirty=true;}});
  o.on(sidesBtn,'click',()=>{corners=!corners;rebuild();});
  bind(root,'is-ratio',v=>{ratio=v;rebuild();},v=>v.toFixed(1));
  let sel=0;bind(root,'is-point',v=>{sel=v-1;dirty=true;});
  o.touchHit(at=>{const p=W(at);return !!stroke||ctrl.some(q=>Math.hypot(q[0]-p[0],q[1]-p[1])<.3)||insertionIndex(ctrl,p,{corners}).distance<=.25;});
  o.on(o.cv,'pointerdown',e=>{const p=W(o.point(e));
    if(stroke){stroke=[p];drag={stroke:true};}
    else{let best=-1,bd=.3;ctrl.forEach((q,i)=>{const d=Math.hypot(q[0]-p[0],q[1]-p[1]);if(d<bd){bd=d;best=i;}});if(best<0){const ins=insertionIndex(ctrl,p,{corners});if(ins.distance>.25)return;best=ins.after+1;ctrl.splice(best,0,p);}sel=best;pointSel.value=best+1;root.querySelector('#is-point-out').textContent=best+1;drag={i:best};}
    o.cv.setPointerCapture?.(e.pointerId);e.preventDefault();dirty=true;});
  o.on(o.cv,'pointermove',e=>{if(!drag)return;const p=W(o.point(e));if(drag.stroke)stroke.push(p);else{ctrl[drag.i]=[Math.max(0,Math.min(10.3,p[0])),Math.max(0,Math.min(7,p[1]))];rebuild(false);}dirty=true;});
  o.on(o.cv,'pointerup',()=>{if(drag?.stroke){if(stroke.length>8){const L=[0];for(let i=1;i<stroke.length;i++)L.push(L[i-1]+Math.hypot(stroke[i][0]-stroke[i-1][0],stroke[i][1]-stroke[i-1][1]));const m=14;ctrl=Array.from({length:m},(_,k)=>{const d=L.at(-1)*k/m;let j=L.findIndex(v=>v>=d);return stroke[Math.max(0,j)];});corners=false;}stroke=null;rebuild();}else if(drag)rebuild();drag=null;dirty=true;});
  o.cancelDrag=()=>{drag=null;};
  o.on(o.cv,'keydown',e=>{if(e.shiftKey)return;if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();removePoint();return;}if(e.key==='n'||e.key==='N'){e.preventDefault();sel=(sel+1)%ctrl.length;pointSel.value=sel+1;root.querySelector('#is-point-out').textContent=sel+1;dirty=true;return;}const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(d){e.preventDefault();ctrl[sel]=[ctrl[sel][0]+d[0]*.1,ctrl[sel][1]+d[1]*.1];rebuild();}});
  load(preset);
  o.animate(()=>{
    if(!dirty)return;dirty=false;const C=palette();
    g.clearRect(0,0,o.W,o.H);g.fillStyle=C.sunken;g.fillRect(-2000,-2000,4640,4440);
    if(stroke){g.strokeStyle=C.obj2;g.lineWidth=2.5;g.beginPath();stroke.forEach((p,i)=>i?g.lineTo(...X(p)):g.moveTo(...X(p)));g.stroke();}
    else{
      g.strokeStyle=crossing?C.neg:C.ink;g.lineWidth=2.5;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...X(p)):g.moveTo(...X(p)));g.closePath();g.stroke();
      found.forEach((f,i)=>{if(i===pick)return;g.strokeStyle=C.accent;g.globalAlpha=.25;g.lineWidth=1.5;g.beginPath();f.corners.forEach((p,k)=>k?g.lineTo(...X(p)):g.moveTo(...X(p)));g.closePath();g.stroke();g.globalAlpha=1;});
      const f=found[pick];if(f){g.fillStyle=C.accent;g.globalAlpha=.18;g.beginPath();f.corners.forEach((p,k)=>k?g.lineTo(...X(p)):g.moveTo(...X(p)));g.closePath();g.fill();g.globalAlpha=1;g.strokeStyle=C.accent;g.lineWidth=3;g.stroke();f.corners.forEach(p=>{g.fillStyle=C.pos;g.beginPath();g.arc(...X(p),6,0,2*Math.PI);g.fill();});}
      ctrl.forEach((p,i)=>{g.fillStyle=i===sel?C.obj2:C.surface;g.strokeStyle=C.ink;g.lineWidth=1.5;g.beginPath();g.arc(...X(p),i===sel?8:6,0,2*Math.PI);g.fill();g.stroke();});
    }
    const what=ratio===1?t('carré','square'):t('rectangle','rectangle'),many=found.length>1;
    o.read(stroke?t('Dessine une courbe fermée d’un seul trait.','Draw a closed curve in one stroke.'):crossing?t('La courbe se croise : ce n’est plus une courbe de Jordan. Déplace un point.','The curve crosses itself: it is no longer a Jordan curve. Move a point.'):
      found.length?`${found.length}${found.length>=40?'+':''} ${t(many?what+'s trouvés':what+' trouvé',many?what+'s found':what+' found')} · ${t('côté du '+what+' affiché :','side of the one shown:')} ${num(found[pick].side)} · ${t('écart à la courbe <','distance to the curve <')} ${num(Math.max(found[pick].error,1e-4)*100,2)} %`:t('Recherche… ou aucun trouvé : déplace un point.','Searching… or none found: move a point.'));
  });
  const stop=o.stop;return ()=>{clearTimeout(pending);stop();};
}
