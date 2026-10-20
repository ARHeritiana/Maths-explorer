// Packing unit squares in the smallest square: drag and turn the squares, the frame follows; the best known packings
// that can be drawn exactly are one button away (gallery exhibit; maths in gallery-squares-model.js).
import {exhibit,button,field,bind,palette} from './gallery-kit.js';
import {RECORDS,MAX_N,grid,bestPacking,frame,overlaps,vertices} from './gallery-squares-model.js';
export function squarePacking(root,opts){
  const {t,lang}=opts,num=(v,d=3)=>lang==='fr'?v.toFixed(d).replace('.',','):v.toFixed(d);
  let n=5,squares=grid(n),selected=0,drag=null,u=80,ox=0,oy=0;
  const sizes=Array.from({length:MAX_N-1},(_,i)=>i+2);
  const o=exhibit(root,opts,t('Range n carrés de côté 1 dans le plus petit carré possible, sans chevauchement. Glisse un carré pour le déplacer, tire sa poignée ronde pour le faire tourner. Au clavier : choisis un carré avec le curseur, puis les flèches le déplacent et les touches [ et ] le font tourner. Le cadre en pointillés est le plus petit carré qui contient tout.','Fit n squares of side 1 into the smallest possible square, without overlaps. Drag a square to move it, pull its round handle to turn it. With the keyboard: choose a square with the slider, then arrow keys move it and the [ and ] keys turn it. The dashed frame is the smallest square that contains everything.'),
    `<label class="act-field exhibit-select"><span class="act-label">${t('Nombre de carrés','Number of squares')}</span><select id="sq-n">${sizes.map(k=>`<option value="${k}" ${k===n?'selected':''}>${k}</option>`).join('')}</select></label>`+
    field('sq-pick',t('Carré choisi','Selected square'),1,n,1,1)+button('sq-best',t('Meilleure disposition connue','Best known packing'),true)+button('sq-grid',t('Remettre en grille','Back to a grid')),
    `<p>${t('Avec 4 carrés, un carré de côté 2 suffit, et c’est le mieux possible. Avec 5, on pourrait croire qu’il faut un côté 3 : en tournant le carré du milieu de 45°, un côté 2 + 1/√2 ≈ 2,707 suffit, et Frits Göbel a démontré en 1979 qu’on ne peut pas faire mieux. Pour 10 carrés, le côté 3 + 1/√2 est optimal (démontré par Walter Stromquist en 2003) : la disposition montrée ici place celle de 5 carrés dans un coin.','With 4 squares, a square of side 2 is enough, and it is the best possible. With 5 you might think side 3 is needed: turning the middle square by 45°, side 2 + 1/√2 ≈ 2.707 is enough, and Frits Göbel proved in 1979 that nothing better exists. For 10 squares, side 3 + 1/√2 is optimal (proved by Walter Stromquist in 2003): the packing shown here puts the 5-square one in a corner.')}</p><p>${t('Pour 11 carrés, la meilleure disposition connue (Walter Trump, 1979) a un côté d’environ 3,877, avec des carrés inclinés d’angles irréguliers ; une démonstration qu’on ne peut pas faire mieux a été annoncée en 2026. Pour 17, le record (John Bidwell, 1998) est d’environ 4,676. Une disposition se vérifie (aucun chevauchement) ; son optimalité demande une démonstration. Les meilleures dispositions connues pour n = 1 à 28, et ce qui en est démontré au 20 octobre 2026, viennent du projet de recherche ouvert « the squares project » (Joshua Levy, licence CC BY 4.0), qui reprend les dispositions réunies par Erich Friedman.','For 11 squares, the best known packing (Walter Trump, 1979) has side about 3.877, with squares tilted at irregular angles; a proof that it cannot be beaten was announced in 2026. For 17 the record (John Bidwell, 1998) is about 4.676. A packing can be checked (no overlaps); its optimality needs a proof. The best known packings for n = 1 to 28, and what is proved about them as of 20 October 2026, come from the open research project “the squares project” (Joshua Levy, CC BY 4.0 licence), which builds on the packings collected by Erich Friedman.')}</p>`);
  const g=o.g,pick=root.querySelector('#sq-pick'),pickOut=root.querySelector('#sq-pick-out'),bestBtn=root.querySelector('#sq-best');
  const toPx=([x,y])=>[ox+x*u,oy+y*u],toUnit=([px,py])=>[(px-ox)/u,(py-oy)/u];
  function layout(){const k=Math.ceil(Math.sqrt(n))+1.4;u=Math.min(600,400)/k;ox=(640-k*u)/2+.2*u;oy=(440-k*u)/2+.2*u;}
  function load(list){squares=list.map(s=>({...s}));selected=Math.min(selected,n-1);pick.max=n;pick.value=selected+1;pickOut.textContent=selected+1;o.redraw();}
  function setN(k){n=k;selected=0;layout();load(grid(n));}
  const handle=sq=>{const v=vertices(sq)[2],d=Math.hypot(v[0]-sq.x,v[1]-sq.y);return [sq.x+(v[0]-sq.x)*(d+.28)/d,sq.y+(v[1]-sq.y)*(d+.28)/d];};
  const inside=(sq,[x,y])=>{const c=Math.cos(sq.a),s=Math.sin(sq.a),dx=x-sq.x,dy=y-sq.y;return Math.abs(dx*c+dy*s)<=.5&&Math.abs(-dx*s+dy*c)<=.5;};
  o.on(root.querySelector('#sq-n'),'change',e=>setN(Number(e.target.value)));
  o.on(bestBtn,'click',()=>{const p=bestPacking(n);if(p)load(p);});
  o.on(root.querySelector('#sq-grid'),'click',()=>load(grid(n)));
  bind(root,'sq-pick',v=>{selected=v-1;o.redraw();});
  o.on(o.cv,'pointerdown',e=>{const p=toUnit(o.point(e)),sel=squares[selected],h=handle(sel);
    if(Math.hypot(p[0]-h[0],p[1]-h[1])<.22)drag={rotate:true,start:Math.atan2(p[1]-sel.y,p[0]-sel.x)-sel.a};
    else{let i=-1;for(let k=squares.length-1;k>=0;k--)if(inside(squares[k],p)){i=k;break;}
      if(i<0)return;selected=i;pick.value=i+1;pickOut.textContent=i+1;drag={dx:p[0]-squares[i].x,dy:p[1]-squares[i].y};}
    o.cv.setPointerCapture?.(e.pointerId);e.preventDefault();o.redraw();});
  o.on(o.cv,'pointermove',e=>{if(!drag)return;const p=toUnit(o.point(e)),sq=squares[selected];
    if(drag.rotate)sq.a=Math.atan2(p[1]-sq.y,p[0]-sq.x)-drag.start;else{sq.x=p[0]-drag.dx;sq.y=p[1]-drag.dy;}o.redraw();});
  o.on(o.cv,'pointerup',()=>{drag=null;});o.cancelDrag=()=>{drag=null;};
  o.on(o.cv,'keydown',e=>{if(e.shiftKey)return;const sq=squares[selected],d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];
    if(d){e.preventDefault();sq.x+=d[0]*.02;sq.y+=d[1]*.02;o.redraw();}else if(e.key==='['||e.key===']'){e.preventDefault();sq.a+=(e.key===']'?1:-1)*Math.PI/180;o.redraw();}});
  layout();load(squares);
  o.animate(()=>{
    const C=palette(),bad=overlaps(squares),hit=new Set(bad.flat()),[fx,fy,side]=frame(squares),rec=RECORDS[n];
    g.clearRect(0,0,o.W,o.H);g.fillStyle=C.sunken;g.fillRect(-2000,-2000,4640,4440);
    if(rec){const [px,py]=toPx([fx,fy]);g.strokeStyle=C.pos;g.globalAlpha=.55;g.lineWidth=1.5;g.setLineDash([2,4]);g.strokeRect(px,py,rec.side*u,rec.side*u);g.globalAlpha=1;}
    const [px,py]=toPx([fx,fy]);g.strokeStyle=C.accent;g.lineWidth=2;g.setLineDash([7,5]);g.strokeRect(px,py,side*u,side*u);g.setLineDash([]);
    squares.forEach((sq,i)=>{const pts=vertices(sq).map(toPx);g.beginPath();pts.forEach((p,k)=>k?g.lineTo(...p):g.moveTo(...p));g.closePath();
      g.fillStyle=hit.has(i)?C.neg:C.c[i%8];g.globalAlpha=hit.has(i)?.45:.3;g.fill();g.globalAlpha=1;g.strokeStyle=hit.has(i)?C.neg:C.ink;g.lineWidth=i===selected?3:1.4;g.stroke();});
    const sel=squares[selected],h=toPx(handle(sel)),v=toPx(vertices(sel)[2]);g.strokeStyle=C.ink;g.lineWidth=1.5;g.beginPath();g.moveTo(...v);g.lineTo(...h);g.stroke();
    g.fillStyle=C.obj2;g.beginPath();g.arc(...h,7,0,2*Math.PI);g.fill();
    const deg=((sel.a*180/Math.PI)%90+90)%90;
    const state={proved:t('optimal, démontré','proved optimal'),claimed:t('optimalité annoncée en 2026, pas encore publiée','optimality announced in 2026, not yet published'),open:t('on ne sait pas si l’on peut faire mieux','nobody knows whether it can be beaten')}[rec?.status];
    const record=rec?`${t('meilleur côté connu :','best known side:')} ${rec.exact?rec.exact+(Number.isInteger(rec.side)?'':' ≈ '+num(rec.side)):'≈ '+num(rec.side,4)} (${state}${rec.status!=='open'&&rec.ref?', '+rec.ref:''})${rec.by?' · '+t('disposition :','packing:')+' '+rec.by:''}`:'';
    const status=bad.length?`${bad.length} ${t(bad.length>1?'chevauchements':'chevauchement',bad.length>1?'overlaps':'overlap')}`:rec&&side<=rec.side+1e-3?t('Aucun chevauchement : tu atteins le meilleur côté connu.','No overlaps: you reach the best known side.'):t('Aucun chevauchement.','No overlaps.');
    o.read(`${t('Côté du cadre :','Frame side:')} ${num(side)} · ${record} · ${status} · ${t('carré choisi tourné de','selected square turned by')} ${num(deg,1)}°`);
  });
  return o.stop;
}
