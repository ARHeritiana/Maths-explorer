// Morley's triangle (gallery exhibit; maths in gallery-morley-model.js): drag the three vertices of any triangle, the trisectors of its
// angles meet in three points, and those points always form an equilateral triangle.
import {exhibit,button,palette,TAU} from './gallery-kit.js';
import {morley,area2,interiorAngle} from './gallery-morley-model.js';
const PX=45;                                                   // pixels per unit of length
export function morleyTriangle(root,opts){
  const {t,lang}=opts,num=(v,d=3)=>lang==='fr'?v.toFixed(d).replace('.',','):v.toFixed(d);
  const START=[[110,360],[520,360],[250,90]];
  let V=START.map(p=>[...p]),sel=0,drag=null,show=true;
  const o=exhibit(root,opts,t('Glisse les trois sommets. Chaque angle est coupé en trois angles égaux ; les trisectrices voisines se coupent en trois points. Avant de regarder les mesures, devine : quelle sorte de triangle forment ces trois points ?','Drag the three vertices. Each angle is cut into three equal angles; neighbouring trisectors meet in three points. Before reading the measures, guess: what kind of triangle do these three points form?'),
    button('mo-show',t('Montrer les trisectrices','Show the trisectors'))+button('mo-reset',t('Triangle de départ','Starting triangle'))+button('mo-random',t('Triangle au hasard','Random triangle')),
    `<p>${t('Au clavier : [ et ] choisissent un sommet, les flèches le déplacent. Le résultat vaut pour tout triangle non aplati, mais sa démonstration complète n’est pas élémentaire.','Keyboard: [ and ] choose a vertex, arrow keys move it. The result holds for every non-degenerate triangle, but a complete proof is not elementary.')}</p>`);
  const g=o.g,showBtn=root.querySelector('#mo-show');showBtn.setAttribute('aria-pressed','true');
  const ok=P=>Math.abs(area2(...P))>1500;
  const setV=(i,p)=>{const W=V.map(q=>[...q]);W[i]=[Math.max(14,Math.min(o.W-14,p[0])),Math.max(14,Math.min(o.H-14,p[1]))];if(ok(W)){V=W;o.redraw();}};
  o.on(showBtn,'click',()=>{show=!show;showBtn.setAttribute('aria-pressed',String(show));o.redraw();});
  o.on(root.querySelector('#mo-reset'),'click',()=>{V=START.map(p=>[...p]);o.redraw();});
  o.on(root.querySelector('#mo-random'),'click',()=>{for(let k=0;k<50;k++){const W=[0,0,0].map(()=>[40+Math.random()*(o.W-80),40+Math.random()*(o.H-80)]);if(ok(W)&&Math.min(...[0,1,2].map(i=>interiorAngle(W[i],W[(i+1)%3],W[(i+2)%3])))>.12){V=W;break;}}o.redraw();});
  const near=p=>{let b=null;V.forEach((q,i)=>{const d=Math.hypot(q[0]-p[0],q[1]-p[1]);if(d<28&&(!b||d<b.d))b={d,i};});return b?b.i:null;};
  o.touchHit(p=>near(p)!==null);
  o.on(o.cv,'pointerdown',e=>{const i=near(o.point(e));if(i!==null){sel=i;drag=i;o.cv.setPointerCapture?.(e.pointerId);e.preventDefault();o.redraw();}});
  o.on(o.cv,'pointermove',e=>{if(drag!==null)setV(drag,o.point(e));});
  o.on(o.cv,'pointerup',()=>{drag=null;});o.cancelDrag=()=>{drag=null;};
  o.on(o.cv,'keydown',e=>{if(e.shiftKey)return;
    if(e.key===']'||e.key==='['){e.preventDefault();sel=(sel+(e.key===']'?1:2))%3;o.redraw();return;}
    const d={ArrowLeft:[-6,0],ArrowRight:[6,0],ArrowUp:[0,-6],ArrowDown:[0,6]}[e.key];if(d){e.preventDefault();setV(sel,[V[sel][0]+d[0],V[sel][1]+d[1]]);}});
  o.cv.setAttribute('aria-label',t('Triangle : [ et ] pour choisir un sommet, flèches pour le déplacer.','Triangle: [ and ] select a vertex, arrow keys move it.'));
  o.onResize=()=>o.redraw();
  o.animate(()=>{
    const C=palette(),[A,B,Cc]=V,m=morley(A,B,Cc);
    g.clearRect(0,0,o.W,o.H);g.fillStyle=C.sunken;g.fillRect(-2000,-2000,4640,4440);
    g.fillStyle=C.surface;g.strokeStyle=C.ink;g.lineWidth=2.5;g.beginPath();V.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();g.stroke();
    if(show){g.lineWidth=1.5;m.lines.forEach(([a,b],i)=>{g.strokeStyle=C.c[(i>>1)%3];g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();});}
    g.fillStyle=C.accent;g.globalAlpha=.35;g.beginPath();[m.D,m.E,m.F].forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();g.globalAlpha=1;g.strokeStyle=C.accent;g.lineWidth=3;g.stroke();
    [m.D,m.E,m.F].forEach(p=>{g.fillStyle=C.accent;g.beginPath();g.arc(p[0],p[1],4,0,TAU);g.fill();});
    V.forEach((p,i)=>{g.fillStyle=i===sel?C.neg:C.ink;g.beginPath();g.arc(p[0],p[1],i===sel?9:7,0,TAU);g.fill();g.fillStyle=C.ink;g.font='bold 15px system-ui';g.textAlign='center';g.fillText('ABC'[i],p[0]+(p[0]<o.W/2?-18:18),p[1]+(p[1]<o.H/2?-12:20));});
    const ang=[0,1,2].map(i=>interiorAngle(V[i],V[(i+1)%3],V[(i+2)%3])*180/Math.PI),inner=m.angles.map(a=>a*180/Math.PI);
    o.read(`${t('Triangle ABC : angles','Triangle ABC: angles')} ${ang.map(a=>num(a,1)+'°').join(', ')} · ${t('triangle de Morley : côtés','Morley triangle: sides')} ${m.sides.map(s=>num(s/PX)).join(' ; ')} · ${t('angles','angles')} ${inner.map(a=>num(a,2)+'°').join(', ')}`);
    return false;
  });
  return o.stop;
}
