// Illustrated (graphic) starters of the automatismes: read a vector, a line, a parabola, a scatter plot with its fitted
// line, the graph of f' or f'' or a point of the complex plane. Each generator returns its figure as data ({kind, ...});
// starterFigureHtml draws it as SVG (page, print, projection file) and starterFigureTex as TikZ (LaTeX export). Starters
// only: bank.js adds them to the starter pool of their class, never to TEMPLATES, so worksheets and the exercise bank
// are unchanged. Main competency of each id: competencies.js (VISUAL lines). Ported on 14 November 2026 from the unmerged
// branch work/automatismes-diversifies-2026-11-06 (archive in the private repository).
const tex = (s) => `\\(${s}\\)`;
const signed = (n) => (n < 0 ? `-${Math.abs(n)}` : `+${n}`);
const slopeTex = (n) => {
  if (n === 2) return ''; // slope 1
  if (n === -2) return '-';
  return n % 2 === 0 ? `${n / 2}` : `${n < 0 ? '-' : ''}\\dfrac{${Math.abs(n)}}{2}`;
};
const equation = (numerator, b) => `y=${slopeTex(numerator)}x${b === 0 ? '' : signed(b)}`;

function vectorData(r) {
  const dx = r.int(1, 3), dy = r.int(1, 2), sx = r.sign(), sy = r.sign();
  const transform = ([x,y]) => [sx * x, sy * y];
  const points = {
    A: transform([-4,-3]), B: transform([-4+dx,-3+dy]),
    C: transform([1,-3]), D: transform([1+dx,-3+dy]),
    E: transform([-4,1]), F: transform([-4+dx,1+dy]),
    G: transform([1,1]), H: transform([1+dx,2+dy]),
  };
  return { kind: 'vectors', points, pairs: [['A','B'],['C','D'],['E','F'],['G','H']] };
}
function lineData(r) {
  const slope2 = r.pick([-3,-2,-1,1,2,3]), intercept = r.int(-2,2);
  return { kind: 'line', slope2, intercept, points: { A:[0,intercept], B:[2, intercept+slope2] } };
}
function parabolaData(r, allowed = ['two','touch','none']) {
  const orientation = r.sign(), relation = r.pick(allowed), h = r.int(-2,2);
  const d = relation === 'two' ? r.int(1,2) : 0;
  const k = relation === 'two' ? -orientation*d*d : relation === 'touch' ? 0 : orientation*r.int(1,3);
  return { kind:'parabola', orientation, relation, h, k, d };
}
const parabolaY = (f,x) => f.orientation*(x-f.h)**2+f.k;
function diagramResult(q,a,fig,ok,skill,activity='lecture-graphique') { return { q,a,figure:fig,ok,s:'',skill,activity }; }

function vectorEquality(r) {
  const figure = vectorData(r), pairs = figure.pairs;
  const q = `Sur le quadrillage, quels vecteurs sont égaux à ${tex('\\overrightarrow{AB}')} parmi ${tex('\\overrightarrow{CD}')}, ${tex('\\overrightarrow{EF}')} et ${tex('\\overrightarrow{GH}')} ?`;
  const answer = `${tex('\\overrightarrow{AB}=\\overrightarrow{CD}=\\overrightarrow{EF}')}.`;
  const v = ([a,b]) => [b[0]-a[0],b[1]-a[1]];
  const eq = (p,q) => v([figure.points[p[0]],figure.points[p[1]]]).every((n,i)=>n===v([figure.points[q[0]],figure.points[q[1]]])[i]);
  return diagramResult(q,answer,figure,()=>eq(pairs[0],pairs[1])&&eq(pairs[0],pairs[2])&&!eq(pairs[0],pairs[3]),'Vecteurs égaux');
}
function vectorCoords(r) {
  const figure=vectorData(r), a=figure.points.A, b=figure.points.B;
  const q=`Lire les coordonnées du vecteur ${tex('\\overrightarrow{AB}')} sur le quadrillage.`;
  const answer=tex(`\\overrightarrow{AB}=\\begin{pmatrix}${b[0]-a[0]}\\\\${b[1]-a[1]}\\end{pmatrix}`);
  return diagramResult(q,answer,{...figure,pairs:[['A','B']]},()=>b[0]-a[0]!==0&&b[1]-a[1]!==0,'Coordonnées de vecteurs');
}
function lineEquation(r) {
  const figure=lineData(r), q='Lire graphiquement l’équation réduite de la droite (AB).';
  return diagramResult(q,tex(equation(figure.slope2,figure.intercept)),figure,()=>2*(figure.points.B[1]-figure.points.A[1])===2*figure.slope2,'Équation réduite');
}
function lineSlope(r) {
  const figure=lineData(r), q='Déterminer le coefficient directeur de la droite (AB) à partir des deux points marqués.';
  const a=tex(figure.slope2%2===0?String(figure.slope2/2):`${figure.slope2<0?'-':''}\\dfrac{${Math.abs(figure.slope2)}}{2}`);
  return diagramResult(q,a,figure,()=>figure.points.B[0]-figure.points.A[0]===2 && figure.points.B[1]-figure.points.A[1]===figure.slope2,'Coefficient directeur');
}
function lineIntercept(r) {
  const figure=lineData(r),q='Lire sur le graphique l’ordonnée à l’origine de la droite (AB).';
  return diagramResult(q,tex(`b=${figure.intercept}`),figure,()=>figure.points.A[0]===0&&figure.points.A[1]===figure.intercept,'Ordonnée à l’origine');
}
function adjustedLine(r) {
  const f=lineData(r), m=f.slope2/2, b=f.intercept;
  // Data points are near the fitted line but deliberately not all on it.
  const samples=[-2,-1,0,1,2].map((x,i)=>[x,m*x+b+([-0.65,0.3,0.5,-0.3,0.45][i])]);
  return {...f,kind:'adjustment',samples};
}
function adjustmentEquation(r){
  const fig=adjustedLine(r);
  const q='Le nuage de points et sa droite d’ajustement sont donnés. Quelle est l’équation réduite de cette droite ?';
  return diagramResult(q,tex(equation(fig.slope2,fig.intercept)),fig,()=>fig.points.B[1]-fig.points.A[1]===fig.slope2,'Équation de la droite d’ajustement');
}
function adjustmentSlope(r){
  const fig=adjustedLine(r);
  const n=fig.slope2;
  const q='Lire le coefficient directeur de la droite d’ajustement.';
  const ans=n%2===0?String(n/2):`${n<0?'-':''}\\dfrac{${Math.abs(n)}}{2}`;
  return diagramResult(q,tex(ans),fig,()=>fig.points.B[1]-fig.points.A[1]===n,'Coefficient directeur d’un ajustement');
}
function adjustmentImage(r){
  const fig=adjustedLine(r), x=r.pick([-2,-1,1,2].filter(x=>Math.abs(fig.slope2*x/2+fig.intercept)<=4));
  const y=fig.slope2*x/2+fig.intercept;
  const q=`Avec la droite d’ajustement, estimer la valeur de ${tex('y')} pour ${tex(`x=${x}`)}.`;
  const ans=y%1===0?String(y):`${y<0?'-':''}\\dfrac{${Math.abs(2*y)}}{2}`;
  return diagramResult(q,tex(ans),{...fig,highlightX:x},()=>2*y===fig.slope2*x+2*fig.intercept,'Estimation sur une droite d’ajustement');
}
function lineImage(r) {
  const figure=lineData(r), target=r.pick([-2,-1,1,2].filter(x=>Math.abs(figure.slope2*x/2+figure.intercept)<=4));
  const y=figure.slope2*target/2+figure.intercept;
  const q=`À l’aide du graphique, déterminer l’image de ${tex(target)} par la fonction affine représentée.`;
  return diagramResult(q,tex(`f(${target})=${y%1===0?y:`${y<0?'-':''}\\dfrac{${Math.abs(2*y)}}{2}`}`),{...figure,highlightX:target},()=>2*y===figure.slope2*target+2*figure.intercept,'Lire une image');
}
function parabolaSigns(r) {
  let figure;
  // The intercept at x=0 must be visible to read the sign of c, not inferred from an unseen portion.
  do { figure = parabolaData(r); } while (Math.abs(parabolaY(figure,0))>4);
  const a=figure.orientation, b=-2*a*figure.h, c=parabolaY(figure,0);
  const sign=(x)=>x<0?'<0':x>0?'>0':'=0';
  const q='La courbe représente '+tex('f(x)=ax^{2}+bx+c')+'. Donner les signes de '+tex('a')+', '+tex('b')+' et '+tex('c')+'.';
  const answer=tex(`a${sign(a)}\\;,\\;b${sign(b)}\\;,\\;c${sign(c)}`);
  return diagramResult(q,answer,figure,()=>a===figure.orientation&&b===-2*a*figure.h&&c===parabolaY(figure,0),'Signes des coefficients a, b et c');
}
function parabolaShape(r) {
  const figure=parabolaData(r);
  const q='La courbe représente '+tex('f(x)=ax^{2}+bx+c')+'. Quel est le signe de '+tex('a')+' ?';
  const a=tex(figure.orientation>0?'a>0':'a<0');
  return diagramResult(q,a,figure,()=>Math.sign(parabolaY(figure,figure.h+1)-parabolaY(figure,figure.h))===figure.orientation,'Signe du coefficient a');
}
function parabolaVariations(r) {
  const figure=parabolaData(r);
  const kind=figure.orientation>0?'minimum':'maximum';
  const q='Indiquer les variations du trinôme représenté et les coordonnées de son sommet.';
  const a=`Sommet ${tex(`S(${figure.h}\\,;\\,${figure.k})`)} ; ${figure.orientation>0?'décroissante puis croissante':'croissante puis décroissante'}, avec un ${kind} égal à ${tex(figure.k)}.`;
  return diagramResult(q,a,figure,()=>parabolaY(figure,figure.h)===figure.k&&parabolaY(figure,figure.h+1)-figure.k===figure.orientation,'Variations et sommet');
}
function parabolaRoots(r) {
  const figure=parabolaData(r,['two','touch','none']);
  const q='Résoudre graphiquement '+tex('f(x)=0')+'.';
  const roots = figure.relation==='two'?[figure.h-figure.d,figure.h+figure.d]:figure.relation==='touch'?[figure.h]:[];
  const a=roots.length===0?'Aucune solution réelle.':roots.length===1?`Une solution : ${tex(`x=${roots[0]}`)}.`:`Deux solutions : ${tex(`x=${roots[0]}`)} et ${tex(`x=${roots[1]}`)}.`;
  return diagramResult(q,a,figure,()=>roots.every(x=>parabolaY(figure,x)===0)&&((figure.relation==='none'&&figure.orientation*figure.k>0)||figure.relation!=='none'),'Racines d’un trinôme');
}
function parabolaSignTable(r) {
  const figure=parabolaData(r);
  const q='Décrire le signe du trinôme représenté sur '+tex('\\mathbb{R}')+'.';
  const s=figure.orientation>0?'positif':'négatif', inv=figure.orientation>0?'négatif':'positif';
  let a;
  if(figure.relation==='none') a=`Strictement ${s} sur ${tex('\\mathbb{R}')}.`;
  else if(figure.relation==='touch') a=`${s[0].toUpperCase()+s.slice(1)} ou nul sur ${tex('\\mathbb{R}')}, nul seulement pour ${tex(`x=${figure.h}`)}.`;
  else { const lo=figure.h-figure.d,hi=figure.h+figure.d;
    a=`${s[0].toUpperCase()+s.slice(1)} pour ${tex(`x<${lo}`)} ou ${tex(`x>${hi}`)}, ${inv} pour ${tex(`${lo}<x<${hi}`)}, nul aux deux racines.`;
  }
  return diagramResult(q,a,figure,()=>Math.sign(parabolaY(figure,figure.h))===(figure.relation==='touch'?0:figure.relation==='two'?-figure.orientation:figure.orientation),'Signe du trinôme');
}
function derivativeDiagram(r, second=false) {
  const figure=parabolaData(r);
  const roots=figure.relation==='two' ? [figure.h-figure.d, figure.h+figure.d] : [];
  const positive=figure.orientation>0;
  let answer;
  if(figure.relation==='two') {
    const [lo,hi]=roots;
    answer=positive
      ? `sur \\(]-\\infty\\,;\\,${lo}]\\) et \\([${hi}\\,;\\,+\\infty[\\)`
      : `sur \\([${lo}\\,;\\,${hi}]\\)`;
  } else if(positive) answer='sur tout \\(\\mathbb{R}\\)';
  else answer='sur aucun intervalle non réduit à un point';
  const figureLabel=second?'f″':'f′';
  const q=`La courbe représente ${tex(second?"f''":"f'")}. Sur quel(s) intervalle(s) la fonction ${tex('f')} est-elle ${second?'convexe':'croissante'} ?`;
  const a=`${second?'Convexe':'Croissante'} ${answer}.`;
  return diagramResult(q,a,{...figure,caption:`Courbe de ${figureLabel}`},
    ()=>figure.orientation*parabolaY(figure,figure.h)>=0 ? (figure.relation!=='two') : (figure.relation==='two'),
    second?'Convexité lue sur la dérivée seconde':'Variations lues sur la dérivée','interpretation');
}
function vectorComplex(r) {
  const figure=vectorData(r), a=figure.points.A,b=figure.points.B;
  const dx=b[0]-a[0],dy=b[1]-a[1];
  const q='Dans le plan complexe, quelle est l’affixe du vecteur '+tex('\\overrightarrow{AB}')+' ?';
  const z=`${dx}${dy<0?'-':'+'}${Math.abs(dy)===1?'':Math.abs(dy)}i`;
  return diagramResult(q,tex(z),{...figure,kind:'complex',pairs:[['A','B']]},()=>dx!==0&&dy!==0,'Affixe d’un vecteur');
}

function complexMidpoint(r){
  const x=r.int(-2,1), y=r.int(-2,1), dx=r.int(1,2), dy=r.int(1,2)*r.sign();
  const A=[x-dx,y-dy], B=[x+dx,y+dy];
  const figure={kind:'complex',points:{A,B},pairs:[]};
  const q='Dans le plan complexe, donner l’affixe du milieu de '+tex('[AB]')+'.';
  const aff= x===0?(y===0?'0':`${y===1?'':y===-1?'-':y}i`):`${x}${y===0?'':(y<0?'-':'+')+(Math.abs(y)===1?'':Math.abs(y))+'i'}`;
  return diagramResult(q,tex(aff),figure,()=>A[0]+B[0]===2*x&&A[1]+B[1]===2*y,'Affixe du milieu');
}

const T = (id,cls,chap,domain,skill,activity,make) => ({ id,cls,chapter:chap,domain,skill,activity,fast:true,visual:true,make });
// A template represents a kind of mathematical thinking, not merely a different parameter range.
export const VISUAL_STARTERS = [
  T('v-s-vectors-equal','seconde','seconde-02','geometrie','Repérer des vecteurs égaux','lecture-graphique',vectorEquality),
  T('v-s-vector-coords','seconde','seconde-02','geometrie','Lire les coordonnées d’un vecteur','lecture-graphique',vectorCoords),
  T('v-s-line-equation','seconde','seconde-03','geometrie','Trouver une équation réduite sur un graphique','lecture-graphique',lineEquation),
  T('v-s-line-slope','seconde','seconde-03','geometrie','Calculer une pente lue sur une figure','lecture-graphique',lineSlope),
  T('v-s-line-intercept','seconde','seconde-03','geometrie','Lire l’ordonnée à l’origine','lecture-graphique',lineIntercept),
  T('v-s-parabola-shape','seconde','seconde-15','fonctions','Déterminer le signe de a','interpretation',parabolaShape),
  T('v-s-parabola-variations','seconde','seconde-15','fonctions','Lire le sommet et les variations','lecture-graphique',parabolaVariations),
  T('v-s-parabola-roots','seconde','seconde-15','fonctions','Déterminer les racines graphiquement','lecture-graphique',parabolaRoots),
  T('v-s-parabola-table','seconde','seconde-15','fonctions','Décrire le signe d’un trinôme','interpretation',parabolaSignTable),
  T('v-p-parabola-signs','premiere','premiere-02','algebre','Lire les signes de a, b et c','interpretation',parabolaSigns),
  T('v-p-parabola-variations','premiere','premiere-02','algebre','Lire le sommet et les variations','lecture-graphique',parabolaVariations),
  T('v-p-parabola-roots','premiere','premiere-02','algebre','Déterminer les racines graphiquement','lecture-graphique',parabolaRoots),
  T('v-p-parabola-table','premiere','premiere-02','algebre','Décrire le signe d’un trinôme','interpretation',parabolaSignTable),
  T('v-m-line-equation','stmg','stmg-05','stats-proba','Équation d’une droite d’ajustement','lecture-graphique',adjustmentEquation),
  T('v-m-line-slope','stmg','stmg-05','stats-proba','Coefficient directeur d’un ajustement','lecture-graphique',adjustmentSlope),
  T('v-m-line-image','stmg','stmg-05','stats-proba','Lire une valeur estimée','lecture-graphique',adjustmentImage),
  T('v-e-complex-vector','expertes','expertes-05','complexes','Affixe d’un vecteur','lecture-graphique',vectorComplex),
  T('v-e-complex-equal','expertes','expertes-05','complexes','Affixe du milieu de deux points','lecture-graphique',complexMidpoint),
  T('v-t-derivative','terminale','terminale-06','analyse','Variations via une dérivée graphique','interpretation',r => derivativeDiagram(r,false)),
  T('v-t-second-derivative','terminale','terminale-06','analyse','Convexité via une dérivée seconde graphique','interpretation',r => derivativeDiagram(r,true)),
];
export const visualStartersFor = (cls) => VISUAL_STARTERS.filter(t=>t.cls===cls);

// Figure rendering is data-only and neither depends on the UI framework nor on MathJax.
const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const W=440,H=350,scale=29,cx=218,cy=172;
const px=(x)=>cx+scale*x, py=(y)=>cy-scale*y;
const line=(x1,y1,x2,y2,cls='')=>`<line x1="${px(x1)}" y1="${py(y1)}" x2="${px(x2)}" y2="${py(y2)}"${cls?` class="${cls}"`:''}/>`;
const labels=(coords)=>Object.entries(coords).map(([name,[x,y]])=>`<circle cx="${px(x)}" cy="${py(y)}" r="5" class="mx-point"/><text x="${px(x)+7}" y="${py(y)-8}" class="mx-label">${esc(name)}</text>`).join('');
function baseSvg(body, opts={}) {
  const dots=opts.dots===true;
  const grid=[];
  for(let i=-5;i<=5;i++) {
    if(dots) for(let j=-5;j<=5;j++) grid.push(`<circle cx="${px(i)}" cy="${py(j)}" r="1.35" class="mx-grid-dot"/>`);
    else {grid.push(`<line x1="${px(i)}" y1="${py(-5)}" x2="${px(i)}" y2="${py(5)}" class="mx-grid"/>`);grid.push(`<line x1="${px(-5)}" y1="${py(i)}" x2="${px(5)}" y2="${py(i)}" class="mx-grid"/>`);}
  }
  const axes=opts.axes===false?'':`${line(-5,0,5,0,'mx-axis')}${line(0,-5,0,5,'mx-axis')}`;
  const ticks=opts.axes===false?'':Array.from({length:11},(_,i)=>i-5).filter(i=>i!==0).map(i=>`<text class="mx-tick" x="${px(i)}" y="${py(0)+16}" text-anchor="middle">${i}</text><text class="mx-tick" x="${px(0)-9}" y="${py(i)+4}" text-anchor="end">${i}</text>`).join('');
  return `<svg class="mx-starter-figure" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(opts.alt||'Figure mathématique sur un repère')}" style="width:min(100%,510px);max-height:min(340px,42vh);height:auto;display:block;margin:.4em auto;overflow:visible;color:inherit"><style>.mx-starter-figure .mx-grid{stroke:currentColor;stroke-opacity:.09;stroke-width:1}.mx-starter-figure .mx-grid-dot{fill:currentColor;opacity:.3}.mx-starter-figure .mx-axis{stroke:currentColor;stroke-width:1.65;stroke-opacity:.65}.mx-starter-figure .mx-point{fill:var(--accent,#b4531a);stroke:var(--bg,#fff);stroke-width:1.5}.mx-starter-figure .mx-label{font:bold 15px system-ui,sans-serif;fill:currentColor;paint-order:stroke;stroke:var(--bg,#fff);stroke-width:3}.mx-starter-figure .mx-tick{font:11px system-ui,sans-serif;fill:currentColor;opacity:.82}.mx-starter-figure .mx-curve{stroke:var(--accent,#b4531a);stroke-width:3.8;fill:none;stroke-linecap:round;stroke-linejoin:round}.mx-starter-figure .mx-direction{stroke:var(--accent,#b4531a);stroke-width:2.7;stroke-linecap:round}.mx-starter-figure .mx-vertex{stroke:currentColor;stroke-width:1.5;stroke-dasharray:5 4;opacity:.8}.mx-starter-figure .mx-mark{fill:currentColor}.mx-starter-figure .mx-head{fill:var(--accent,#b4531a)}.mx-starter-figure .mx-sample{fill:currentColor;opacity:.55}</style>${grid.join('')}${axes}${ticks}${opts.complex?`<text class="mx-label" x="${px(5)-38}" y="${py(0)-7}">Re</text><text class="mx-label" x="${px(0)+7}" y="${py(5)+15}">Im</text>`:''}${body}</svg>`;
}
function segmentClipped(m,b){
  let pts=[[-5,-5*m+b],[5,5*m+b]];
  if(m===0)return pts;
  const cs=[[-5,-5*m+b],[5,5*m+b],[(-5-b)/m,-5],[(5-b)/m,5]].filter(([x,y])=>x>=-5-1e-8&&x<=5+1e-8&&y>=-5-1e-8&&y<=5+1e-8);
  return [cs[0],cs[cs.length-1]];
}
// Draw only the visible portions of the parabola. A new SVG subpath begins on re-entry;
// never close a subpath, which would incorrectly join the two arms at the plot boundary.
function curvePath(f) {
  const xmin=-5, xmax=5, ymin=-5, ymax=5, step=1/64;
  const fmt=(x,y)=>`${px(x).toFixed(2)},${py(y).toFixed(2)}`;
  let path='', prevEnd=null;
  for(let i=0;i<Math.round((xmax-xmin)/step);i++) {
    const x0=xmin+i*step, x1=x0+step;
    const y0=parabolaY(f,x0), y1=parabolaY(f,x1), dy=y1-y0;
    let begin=0,end=1;
    if(Math.abs(dy)<1e-12) { if(y0<ymin || y0>ymax) { prevEnd=null; continue; } }
    else {
      const a=(ymin-y0)/dy, b=(ymax-y0)/dy;
      begin=Math.max(0,Math.min(a,b));
      end=Math.min(1,Math.max(a,b));
      if(begin>=end) { prevEnd=null; continue; }
    }
    const from=[x0+(x1-x0)*begin,y0+dy*begin];
    const to=[x0+(x1-x0)*end,y0+dy*end];
    if(!prevEnd || Math.hypot(from[0]-prevEnd[0],from[1]-prevEnd[1])>1e-6) {
      path+=`M${fmt(...from)} `;
    }
    path+=`L${fmt(...to)} `;
    prevEnd=to;
  }
  return path.trim();
}
export function starterFigureHtml(f) {
  if(!f)return '';
  if(f.kind==='vectors'||f.kind==='complex'){
    const ids=f.pairs.map(([a,b])=>{const p=f.points[a],q=f.points[b], ux=q[0]-p[0],uy=q[1]-p[1],len=Math.hypot(ux,uy),ex=q[0]-ux/len*0.18,ey=q[1]-uy/len*0.18;const head=0.26;const a1=Math.atan2(uy,ux);const tri=[[ex,ey],[ex-head*Math.cos(a1-0.45),ey-head*Math.sin(a1-0.45)],[ex-head*Math.cos(a1+0.45),ey-head*Math.sin(a1+0.45)]];return `${line(...p,...q,'mx-direction')}<polygon points="${tri.map(([x,y])=>`${px(x)},${py(y)}`).join(' ')}" class="mx-head"/>`;}).join('');
    return baseSvg(ids+labels(f.points),{axes:f.kind==='complex',complex:f.kind==='complex',dots:f.kind==='vectors',alt:f.kind==='complex'?'Plan complexe : parties réelle et imaginaire graduées':'Points nommés sur un quadrillage à points, flèches représentant des vecteurs'});
  }
  if(f.kind==='line'||f.kind==='adjustment'){
    const m=f.slope2/2, ps=segmentClipped(m,f.intercept);
    let hl='';if(f.highlightX!==undefined){const x=f.highlightX,y=m*x+f.intercept;if(y>=-5&&y<=5)hl=`${line(x,0,x,y,'mx-vertex')}${line(0,y,x,y,'mx-vertex')}<circle cx="${px(x)}" cy="${py(y)}" r="5.5" class="mx-mark"/>`;}
    const scatter=f.kind==='adjustment'?f.samples.filter(([x,y])=>Math.abs(y)<=4.7).map(([x,y])=>`<circle cx="${px(x)}" cy="${py(y)}" r="4.1" class="mx-sample"/>`).join(''):'';
    return baseSvg(scatter+`<path class="mx-curve" d="M${ps.map(([x,y])=>`${px(x)},${py(y)}`).join(' L')}"/>`+hl+labels(f.points),{alt:f.kind==='adjustment'?'Nuage de points et droite d’ajustement avec deux points repères':'Droite dans un repère orthonormé avec deux points A et B, dont A est sur l’axe des ordonnées'});
  }
  if(f.kind==='parabola'){
    const roots=f.relation==='two'?[f.h-f.d,f.h+f.d]:f.relation==='touch'?[f.h]:[];
    const rootMarks=roots.map((x)=>`<circle cx="${px(x)}" cy="${py(0)}" r="5" class="mx-point"/>`).join('');
    const vertex=`${line(f.h,0,f.h,f.k,'mx-vertex')}<circle cx="${px(f.h)}" cy="${py(f.k)}" r="5.5" class="mx-mark"/><text class="mx-label" x="${px(f.h)+10}" y="${py(f.k)-10}">S</text>`;
    const caption=f.caption?`<text x="${px(4.3)}" y="${py(5.25)}" class="mx-label" text-anchor="end">${esc(f.caption)}</text>`:'';
    return baseSvg(`<path class="mx-curve" d="${curvePath(f)}"/>${vertex}${rootMarks}${caption}`,{alt:'Parabole avec axes gradués, sommet S et intersections éventuelles avec l’axe des abscisses'});
  }
  return '';
}

const tikzPoint=([x,y],label)=>`\\filldraw[draw=white,fill=orange!75!black] (${x},${y}) circle (2.0pt) node[above right,text=black] {${label}};`;
const tikzGrid=(dots=false)=>dots?'\\foreach \\x in {-5,...,5} \\foreach \\y in {-5,...,5} \\fill[gray!60] (\\x,\\y) circle (1pt);':'\\draw[step=1,gray!20,very thin] (-5,-5) grid (5,5);';
export function starterFigureTex(f){
  if(!f)return '';
  let s=`\\begin{center}\\begin{tikzpicture}[scale=.36,line cap=round,line join=round]\n${tikzGrid(f.kind==='vectors')}\n`;
  if(f.kind!=='vectors')s+='\\draw[->,gray!75] (-5,0)--(5.25,0); \\draw[->,gray!75] (0,-5)--(0,5.25);\n\\foreach \\x in {-4,...,-1,1,...,4} \\node[below,font=\\tiny] at (\\x,0) {\\x};\n\\foreach \\y in {-4,...,-1,1,...,4} \\node[left,font=\\tiny] at (0,\\y) {\\y};\n';
  if((f.kind==='vectors'||f.kind==='complex')) {
    if(f.kind==='complex')s+='\\node[above] at (4.8,0) {Re};\\node[right] at (0,4.8) {Im};\n';
    for(const [a,b] of f.pairs){const p=f.points[a],q=f.points[b];s+=`\\draw[->,very thick,orange!75!black] (${p.join(',')})--(${q.join(',')});\n`;}
    for(const [n,p] of Object.entries(f.points)) s+=tikzPoint(p,n)+'\n';
  } else if(f.kind==='line'||f.kind==='adjustment'){
    const ps=segmentClipped(f.slope2/2,f.intercept);
    if(f.kind==='adjustment')for(const [x,y] of f.samples.filter(([,y])=>Math.abs(y)<=4.7))s+=`\\fill[cyan!65!black] (${x},${y}) circle (2pt);\n`;
    s+=`\\draw[very thick,orange!75!black] (${ps[0].join(',')})--(${ps[1].join(',')});\n`;
    for(const [n,p] of Object.entries(f.points))s+=tikzPoint(p,n)+'\n';
  }else if(f.kind==='parabola'){
    // TikZ's plot clips the curve to the visible axes; the exact vertex and roots are marked.
    const a=f.orientation,h=f.h,k=f.k;
    if(f.caption)s+=`\\node[anchor=east,font=\\small] at (5,5.8) {$${f.caption.includes('″')?"f''":"f'"}$};\n`;
    s+=`\\begin{scope}\\clip (-5,-5) rectangle (5,5);\\draw[very thick,orange!75!black,samples=90,smooth,domain=-5:5] plot (\\x,{(${a})*(\\x-(${h}))*(\\x-(${h}))+(${k})});\\end{scope}\n`;
    s+=`\\filldraw[fill=cyan!70!black,draw=white] (${h},${k}) circle (2.2pt) node[above right,text=black] {S};\n`;
    for(const x of (f.relation==='two'?[h-f.d,h+f.d]:f.relation==='touch'?[h]:[]))s+=`\\filldraw[fill=orange!75!black,draw=white] (${x},0) circle (2pt);\n`;
  }
  return s+'\\end{tikzpicture}\\end{center}';
}