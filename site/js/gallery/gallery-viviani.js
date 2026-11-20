// Viviani's theorem (gallery exhibit, issue #33; maths in gallery-viviani-model.js): drag a point P inside an
// equilateral triangle and watch the three perpendicular distances to the sides; their sum never moves and equals the
// height. Then free the triangle: the plain sum moves, but a·d1 + b·d2 + c·d3 = 2 × area still holds, which is the
// area proof itself, shown on demand as the three small triangles PBC, PCA, PAB.
import {exhibit,palette,TAU} from './gallery-kit.js';
import {illuminateFeedback} from '../motion.js';
import {metricStrip} from './gallery-panels.js';
import {facts,foot,clampInside,equilateralFrom,centroid,inside} from './gallery-viviani-model.js';

const PX=40;   // pixels per unit of length: the strip reads lengths in units
const START=()=>equilateralFrom([320,250],[320,62],0);
export function vivianiTriangle(root,opts){
  const {t,lang}=opts,loc=lang==='fr'?'fr-FR':'en-GB',nf=new Intl.NumberFormat(loc,{minimumFractionDigits:2,maximumFractionDigits:2}),num=v=>nf.format(v);
  let T=START(),P=centroid(T),mode='equi',sel=0,drag=null,showAreas=false,answer=null,moves=0,lastSpot=null;   // sel: 0 = P, 1 to 3 = vertex
  const o=exhibit(root,opts,t('Fais glisser le point P dans le triangle. Les trois traits de couleur sont ses distances aux trois côtés.','Drag the point P inside the triangle. The three coloured segments are its distances to the three sides.'),
    `<fieldset class="act-choice"><legend>${t('Triangle','Triangle')}</legend>
       <label><input type="radio" name="vv-mode" value="equi" checked> ${t('Équilatéral','Equilateral')}</label>
       <label><input type="radio" name="vv-mode" value="free"> ${t('Quelconque','Any triangle')}</label></fieldset>
     <fieldset class="act-choice"><legend>${t('Où placer P pour que d₁ + d₂ + d₃ soit le plus petit ?','Where should P go to make d₁ + d₂ + d₃ as small as possible?')}</legend>
       ${[[t('Au centre','At the centre')],[t('Contre un côté','Against a side')],[t('C’est partout pareil','It is the same everywhere')]].map((c,i)=>`<label><input type="radio" name="vv-guess" value="${i}"> ${c[0]}</label>`).join('')}</fieldset>
     <p class="feedback" id="vv-verdict" role="status"></p>
     <div class="act-buttons"><button type="button" class="btn btn-secondary" id="vv-areas" aria-pressed="false">${t('Voir les trois triangles','Show the three triangles')}</button>
       <button type="button" class="btn btn-secondary" id="vv-centre">${t('P au centre','P at the centre')}</button>
       <button type="button" class="btn btn-secondary" id="vv-reset">${t('Triangle de départ','Starting triangle')}</button></div>`,
    `<ol>
      <li>${t('Relie P aux trois sommets : le triangle est coupé en trois petits triangles PBC, PCA et PAB.','Join P to the three vertices: the triangle is cut into three small triangles PBC, PCA and PAB.')}</li>
      <li>${t('Chaque petit triangle a pour base un côté a du grand et pour hauteur la distance de P à ce côté : son aire vaut a × d ÷ 2.','Each small triangle has a side a of the big one as its base and the distance from P to that side as its height: its area is a × d ÷ 2.')}</li>
      <li>${t('Les trois aires font l’aire du grand triangle, a × h ÷ 2. Donc a × d₁ ÷ 2 + a × d₂ ÷ 2 + a × d₃ ÷ 2 = a × h ÷ 2, et en divisant par a ÷ 2 : d₁ + d₂ + d₃ = h.','The three areas make the area of the big triangle, a × h ÷ 2. So a × d₁ ÷ 2 + a × d₂ ÷ 2 + a × d₃ ÷ 2 = a × h ÷ 2, and dividing by a ÷ 2: d₁ + d₂ + d₃ = h.')}</li>
      <li>${t('Dans un triangle quelconque, les côtés a, b, c sont différents : on ne peut plus diviser. Ce qui reste vrai, c’est a × d₁ + b × d₂ + c × d₃ = 2 × aire, partout dans le triangle.','In any triangle, the sides a, b, c differ: we can no longer divide. What stays true is a × d₁ + b × d₂ + c × d₃ = 2 × area, everywhere in the triangle.')}</li>
      <li>${t('À toi : un triangle équilatéral a pour côté 6. P est à 1 d’un côté et à 2 d’un autre. À quelle distance du troisième côté est-il ? (3√3 − 3 ≈ 2,20.)','Your turn: an equilateral triangle has side 6. P is 1 from one side and 2 from another. How far is it from the third side? (3√3 − 3 ≈ 2.20.)')}</li>
    </ol>`);
  const g=o.g,stage=root.querySelector('.exhibit-stage'),controls=root.querySelector('.exhibit-controls'),top=document.createElement('div');
  top.className='exhibit-band';controls.classList.add('exhibit-band');
  top.append(...[...controls.children].filter(el=>el.matches('fieldset, .feedback')));stage.before(top);stage.after(controls);
  const MS=metricStrip(controls,t,[{id:'d',label:'d₁ · d₂ · d₃',kind:'approx'},{id:'sum',label:'d₁ + d₂ + d₃',kind:'approx'},{id:'h',label:t('Hauteur(s)','Height(s)'),kind:'approx'},
    {id:'w',label:t('a·d₁ + b·d₂ + c·d₃ et 2 × aire','a·d₁ + b·d₂ + c·d₃ and 2 × area'),kind:'approx'},
    {id:'parts',label:t('Aires de PBC, PCA, PAB et du triangle','Areas of PBC, PCA, PAB and of the triangle'),kind:'approx'}]);
  const fb=root.querySelector('#vv-verdict');
  function verdict(){
    let text,cls='';
    if(answer==null)text=t('Choisis une réponse, puis promène P dans le triangle.','Choose an answer, then move P around the triangle.');
    else if(mode!=='equi')text=t('La question porte sur le triangle équilatéral : reviens-y pour vérifier.','The question is about the equilateral triangle: go back to it to check.');
    else if(moves<3)text=t('Réponse notée. Place P à trois endroits bien différents et lis la somme.','Answer noted. Put P in three quite different places and read the sum.');
    else{const ok=answer===2;cls=ok?'success':'error';text=(ok?t('Bien vu. ','Well spotted. '):t('Pas tout à fait. ','Not quite. '))+t('La somme ne bouge pas : elle vaut toujours la hauteur du triangle. Ouvre « Voir les trois triangles » pour comprendre pourquoi.','The sum does not move: it always equals the height of the triangle. Open “Show the three triangles” to see why.');}
    if(fb.textContent!==text){const was=fb.className;fb.className='feedback'+(cls?' '+cls:'');fb.textContent=text;if(cls&&was!==fb.className)illuminateFeedback(fb,opts.reduced);}
  }
  // a "move" counts when P ends up far from where the last one ended (so wiggling does not count three times)
  const noteMove=()=>{if(!lastSpot||Math.hypot(P[0]-lastSpot[0],P[1]-lastSpot[1])>40){moves++;lastSpot=[...P];}verdict();};
  root.querySelectorAll('[name=vv-guess]').forEach(r=>o.on(r,'change',()=>{answer=+r.value;verdict();}));
  root.querySelectorAll('[name=vv-mode]').forEach(r=>o.on(r,'change',()=>{mode=r.value;if(mode==='equi'){const G=centroid(T);T=equilateralFrom(G,T[0],0);P=clampInside(T,P);}sel=0;verdict();o.redraw();}));
  const ab=root.querySelector('#vv-areas');o.on(ab,'click',()=>{showAreas=!showAreas;ab.setAttribute('aria-pressed',String(showAreas));o.redraw();});
  o.on(root.querySelector('#vv-centre'),'click',()=>{P=centroid(T);noteMove();o.redraw();});
  o.on(root.querySelector('#vv-reset'),'click',()=>{T=START();P=centroid(T);if(mode!=='equi'){T=[[150,350],[540,370],[260,80]];P=centroid(T);}o.redraw();});
  // moving a vertex: in equilateral mode the triangle turns and grows about its centre; in free mode only that vertex moves
  const ok=W=>{const f=facts(W,W[0]);return f.area>4000&&Math.min(...f.L)>60;};
  const setVertex=(i,p)=>{p=[Math.max(14,Math.min(o.W-14,p[0])),Math.max(14,Math.min(o.H-14,p[1]))];
    let W;if(mode==='equi')W=equilateralFrom(centroid(T),p,i);else{W=T.map(q=>[...q]);W[i]=p;}
    if(W.every(q=>q[0]>=4&&q[0]<=o.W-4&&q[1]>=4&&q[1]<=o.H-4)&&ok(W)){T=W;P=clampInside(T,P);o.redraw();}};
  const setP=p=>{P=inside(T,p)?p:clampInside(T,p);o.redraw();};
  const hit=p=>{if(Math.hypot(p[0]-P[0],p[1]-P[1])<26)return 0;for(let i=0;i<3;i++)if(Math.hypot(p[0]-T[i][0],p[1]-T[i][1])<24)return i+1;return inside(T,p)?0:null;};
  o.touchHit(p=>hit(p)!==null);
  o.on(o.cv,'pointerdown',e=>{const p=o.point(e),h=hit(p);if(h===null)return;sel=h;drag=h;if(h===0)setP(p);o.cv.setPointerCapture?.(e.pointerId);e.preventDefault();o.redraw();});
  o.on(o.cv,'pointermove',e=>{if(drag===null)return;const p=o.point(e);drag===0?setP(p):setVertex(drag-1,p);});
  o.on(o.cv,'pointerup',()=>{if(drag===0)noteMove();drag=null;});o.cancelDrag=()=>{drag=null;};
  o.on(o.cv,'keydown',e=>{if(e.shiftKey)return;
    if(e.key===']'||e.key==='['){e.preventDefault();sel=(sel+(e.key===']'?1:3))%4;o.redraw();return;}
    const d={ArrowLeft:[-8,0],ArrowRight:[8,0],ArrowUp:[0,-8],ArrowDown:[0,8]}[e.key];if(!d)return;e.preventDefault();
    if(sel===0){setP([P[0]+d[0],P[1]+d[1]]);noteMove();}else setVertex(sel-1,[T[sel-1][0]+d[0],T[sel-1][1]+d[1]]);});
  o.cv.setAttribute('aria-label',t('Triangle et point P. Flèches : déplacer ; [ et ] : choisir P ou un sommet.','Triangle and point P. Arrow keys: move; [ and ]: choose P or a vertex.'));
  o.onResize=()=>o.redraw();
  o.animate(()=>{
    // labels keep a readable size on a narrow screen (the logical canvas is 640 wide whatever its width on the page)
    const z=Math.max(1,Math.min(2.2,640/(o.cv.clientWidth||640))),font=(w,px)=>`${w} ${Math.round(px*z)}px system-ui`;
    const C=palette(),f=facts(T,P),sides=[[T[1],T[2]],[T[2],T[0]],[T[0],T[1]]],col=[C.c[0],C.c[1],C.c[2]];
    g.clearRect(0,0,o.W,o.H);g.fillStyle=C.sunken;g.fillRect(-2000,-2000,4640,4440);
    const tri=(pts,fill,alpha=1)=>{g.globalAlpha=alpha;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fillStyle=fill;g.fill();g.globalAlpha=1;};
    tri(T,C.surface);
    if(showAreas)sides.forEach(([U,V],k)=>{tri([P,U,V],col[k],.32);g.strokeStyle=col[k];g.lineWidth=1.5;g.beginPath();g.moveTo(P[0],P[1]);g.lineTo(U[0],U[1]);g.stroke();});   // their areas are in the strip, where every number of the page is
    g.strokeStyle=C.ink;g.lineWidth=2.5;g.beginPath();T.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.stroke();
    // the height from the top vertex, dashed (equilateral only: all three are equal)
    if(mode==='equi'){const F=foot(T[0],T[1],T[2]);g.setLineDash([6,5]);g.strokeStyle=C.muted;g.lineWidth=1.5;g.beginPath();g.moveTo(T[0][0],T[0][1]);g.lineTo(F[0],F[1]);g.stroke();g.setLineDash([]);
      g.fillStyle=C.muted;g.font=font('italic',14);g.textAlign='left';g.fillText('h',(T[0][0]+F[0])/2+6,(T[0][1]+F[1])/2);}
    // the three distances with right-angle marks
    sides.forEach(([U,V],k)=>{const F=foot(P,U,V),u=[(V[0]-U[0]),(V[1]-U[1])],L=Math.hypot(...u),e=[u[0]/L,u[1]/L],n=[P[0]-F[0],P[1]-F[1]],nl=Math.hypot(...n)||1,m=[n[0]/nl,n[1]/nl],s=9;
      g.strokeStyle=col[k];g.lineWidth=3;g.beginPath();g.moveTo(P[0],P[1]);g.lineTo(F[0],F[1]);g.stroke();
      if(nl>12){g.lineWidth=1.5;g.beginPath();g.moveTo(F[0]+e[0]*s,F[1]+e[1]*s);g.lineTo(F[0]+e[0]*s+m[0]*s,F[1]+e[1]*s+m[1]*s);g.lineTo(F[0]+m[0]*s,F[1]+m[1]*s);g.stroke();}
      g.fillStyle=col[k];g.beginPath();g.arc(F[0],F[1],4,0,TAU);g.fill();
      g.fillStyle=C.ink;g.font=font('600',14);g.textAlign='center';const mid=[(P[0]+F[0])/2-m[1]*14*z,(P[1]+F[1])/2+m[0]*14*z];g.fillText(`d${'₁₂₃'[k]}`,mid[0],mid[1]+4);});
    // vertices and P
    T.forEach((p,i)=>{g.fillStyle=sel===i+1?C.neg:C.ink;g.beginPath();g.arc(p[0],p[1],(sel===i+1?8:6)*Math.min(z,1.6),0,TAU);g.fill();const c=centroid(T),v=[p[0]-c[0],p[1]-c[1]],l=Math.hypot(...v)||1;
      g.fillStyle=C.ink;g.font=font('bold',15);g.textAlign='center';g.fillText('ABC'[i],p[0]+v[0]/l*20*z,p[1]+v[1]/l*20*z+5);});
    g.fillStyle=C.object;g.strokeStyle=C.ink;g.lineWidth=2;g.beginPath();g.arc(P[0],P[1],(sel===0?10:8)*Math.min(z,1.6),0,TAU);g.fill();g.stroke();
    g.fillStyle=C.ink;g.font=font('bold',15);g.textAlign='left';g.fillText('P',P[0]+12*z,P[1]-10*z);
    // the strip, in units
    const d=f.d.map(x=>x/PX),hs=f.heights.map(x=>x/PX);
    MS.set('d',d.map(num).join(' · '));MS.set('sum',num(d[0]+d[1]+d[2]));
    MS.set('h',mode==='equi'?`h ≈ ${num(hs[0])}`:hs.map(num).join(' · '));
    MS.set('w',`${num(f.weighted/PX/PX)} · ${num(2*f.area/PX/PX)}`);
    MS.set('parts',`${f.parts.map(a=>num(a/PX/PX)).join(' + ')} = ${num(f.area/PX/PX)}`);
    o.read(t(`d₁ + d₂ + d₃ ≈ ${num(d[0]+d[1]+d[2])}`,`d₁ + d₂ + d₃ ≈ ${num(d[0]+d[1]+d[2])}`));
    return false;
  });
  verdict();
  return ()=>{o.stop();MS.el.remove();};
}
