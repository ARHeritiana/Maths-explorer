// Small, deterministic illustrations of named models. No timers, canvas, network requests or simulation state.
import {quadratic,binomial} from './math.js';
import {secretaryProbability,maximumProbability,benfordProbability} from './lab/models/inference.js';
import {pendulumPoints,GRAVITY_PRESETS,simulateDynamics} from './lab/models/dynamics.js';
import {model as cobwebModel} from './lab/models/cobweb.js';
import {surfacePoint,spherePoint,tangentField} from './lab/models/topology.js';
import {TOKARSKY,PRESETS} from './illumination-presets.js';
import {trace} from './illumination-model.js';
import {previewMesh as gombocMesh} from './gomboc-body.js';
import {CURRY} from './lab/models/tiles.js';
import {voronoiCells,cycloid} from './gallery-models.js';
import {tileOutline} from './gallery-hat-model.js';
import {spaceKnot} from './gallery-knot-model.js';
import {hammersley,HAMMERSLEY_R} from './gallery-sofa-model.js';
import {BARRIERS} from './gallery-opaque-model.js';
import {mandelbrot} from './gallery-math.js';
const P=(fr,en)=>[fr,en], round=x=>Number(x.toFixed(3));
const path=(pts,closed=false)=>`<path d="${pts.map(([x,y],i)=>`${i?'L':'M'}${round(x)},${round(y)}`).join(' ')}${closed?'Z':''}"/>`;
const dot=(x,y,r=3)=>`<circle class="preview-fill" cx="${round(x)}" cy="${round(y)}" r="${r}"/>`;
const axis='<path class="preview-axis" d="M12 84H150M18 10V88"/>';
const plot=(f,a,b,n=60)=>path(Array.from({length:n+1},(_,i)=>{const x=a+(b-a)*i/n;return [16+128*i/n,f(x)];}));
const project=([x,y,z])=>[80+24*(.8*x-.6*y),51+18*(.3*x+.4*y-.86*z)];
const aliases={'mirrored-rooms':'illumination','banach-tarski':'banach-tarski-model','galton':'probability',
 'premiere-02':'quadratic','scalar':'vectors','matrices':'matrix','trigonometry':'trig','trig-functions':'trig',
 'complex-algebra':'complex','complex-plane':'complex','complex-exponential':'complex','complex-rotations':'complex',
 'sequence-limits':'sequences','function-limits':'limits','differential':'exponential','exponential-function':'exponential',
 'functions':'functions','convexity':'derivative','optimisation':'derivative','integration':'integral',
 'fourier-series':'fourier','fourier-drawing':'fourier','binomial':'probability','concentration':'statistics',
 'regression':'statistics','tables':'statistics','induction':'sequences','log10':'logarithm','space-equations':'space-lines',
 'orthogonality':'vectors','geometry':'vectors','space':'space-lines','circle':'inscribed-square','random':'random-variable',
 'congruences':'modular','diophantine':'bezout','conditional':'conditioning','bayes':'conditioning',
 'waiting-time':'random-variable','lattice-paths':'counting','euler-trails':'graphs','pigeonhole':'counting',
 'inequalities':'algebra','invariants':'logic','calculs-algebriques':'algebra','logique':'logic','ensembles':'sets',
 'applications':'sets','module-semaine-5':'space-lines','module-semaine-6':'matrix'};
const known=new Set(['quadratic','probability','trig','benford','secretary','tank','birthdays','monty','baker',
 'double-pendulum','three-body','logistic','illumination','fair-division','fair-goods','hairy-ball',
 'nonorientable-surfaces','banach-tarski-model','gomboc','derivative','integral','vectors','statistics','complex',
 'line','exponential','cobweb','matrix','space-lines','sequences','fourier','circle-regions','buffon','bertrand',
 'euler-primes','fermat','tiles','functions','limits','logarithm','reuleaux','platonic','chaos','life',
 'voronoi','fastest-slide','einstein','square-packing','inscribed-square','soap-films','knots','moving-sofa',
 'opaque-square','four-colours','mandelbrot','arithmetic','reals','algebra','percentages','conditioning',
 'random-variable','counting','polynomials','modular','bezout','primes','graphs','markov','logic','sets']);
// Topic names identify a chapter's mathematical model; broad field memberships do not.
export function previewKind(item) {
 if(['biography','story','timeline'].includes(item.format))return 'timeline';
 if(item.format==='challenge')return 'challenge';
 const raw=item.route?.split('/')[1]?.replace(/-gallery$/,'')||'';
 if(raw.startsWith('fourier-'))return 'fourier';
 const id=aliases[raw]||raw;
 if(known.has(id))return id;
 // The index places declared concepts/topic first and inferred field memberships afterwards.
 // A synthesis chapter with topic "review" must not acquire a figure from those broad inferred memberships.
 if(['chapter','lesson','workshop'].includes(item.format)){const concept=item.concepts?.[0],key=aliases[concept]||concept;if(known.has(key))return key;}
 return 'reading';
}
const cache=new Map();
export function modelPreview(kind) {
 if(cache.has(kind))return cache.get(kind);
 let drawing='',drawingEn,caption;
 if(kind==='quadratic') {
  const q=quadratic(1,0,-1);
  drawing='<path class="preview-axis" d="M12 67H150M80 10V88"/>'+plot(x=>67-15*(x*x-1),-2,2)+q.roots.map(x=>dot(80+32*x,67)).join('');
  caption=P('Exemple : y = x² − 1','Example: y = x² − 1');
 } else if(kind==='probability') {
  drawing=axis+binomial(10,.5).map((v,k)=>`<rect class="preview-fill" x="${14+k*12}" y="${84-v*230}" width="9" height="${v*230}"/>`).join('');
  caption=P('Loi binomiale : n = 10, p = 0,5','Binomial law: n = 10, p = 0.5');
 } else if(kind==='trig') {
  drawing='<path class="preview-axis" d="M10 50H150M80 8V90"/>'+plot(x=>50-28*Math.sin(x),-Math.PI,Math.PI);
  caption=P('Exemple : y = sin(x)','Example: y = sin(x)');
 } else if(kind==='benford') {
  drawing=Array.from({length:9},(_,i)=>{const p=benfordProbability(i+1);return `<rect class="preview-fill" x="${18+i*14}" y="${80-p*200}" width="10" height="${p*200}"/><text x="${23+i*14}" y="95" text-anchor="middle">${i+1}</text>`;}).join('');
  caption=P('Modèle : log₁₀(1 + 1/d)','Model: log₁₀(1 + 1/d)');
 } else if(kind==='secretary') {
  drawing=axis+path(Array.from({length:20},(_,r)=>[15+r*6.5,85-secretaryProbability(20,r)*160]));
  caption=P('Succès selon le seuil, n = 20','Success against skip threshold, n = 20');
 } else if(kind==='tank') {
  drawing=axis+Array.from({length:17},(_,j)=>{const p=maximumProbability(20,4,j+4);return `<rect class="preview-fill" x="${12+j*8}" y="${85-p*300}" width="6" height="${p*300}"/>`;}).join('');
  caption=P('Maximum observé : N = 20, k = 4','Observed maximum: N = 20, k = 4');
 } else if(kind==='birthdays') {
  drawing=[1,4,7,9,12,16,19,4].map((d,i)=>`${dot(24+i%4*36,30+Math.floor(i/4)*40,15)}<text x="${24+i%4*36}" y="${35+Math.floor(i/4)*40}" text-anchor="middle">${d}</text>`).join('');
  caption=P('Échantillon illustratif : deux « 4 »','Illustrative sample: two occurrences of 4');
 } else if(kind==='monty') {
  drawing=[1,2,3].map((d,i)=>`<path d="M${23+i*45} 80V22H${52+i*45}V80Z"/>${dot(45+i*45,52,2)}<text x="${37+i*45}" y="96" text-anchor="middle">${d}</text>`).join('');
  caption=P('Trois portes, un protocole à préciser','Three doors, rules to specify');
 } else if(kind==='baker') {
  drawing=axis+plot(x=>84-64*Math.exp(-.5*x*x),-3,3)+'<path class="preview-axis" d="M91 14V84"/><text x="80" y="98" text-anchor="middle">980 g</text>';
  caption=P('Exemple normal : μ = 980 g, σ = 40 g','Normal example: μ = 980 g, σ = 40 g');
 } else if(kind==='double-pendulum') {
  const points=[[0,0],...pendulumPoints({l1:1,l2:1},[1.1,-.5])].map(([x,y])=>[69+35*x,18-35*y]);
  drawing='<path class="preview-axis" d="M48 18H90"/>'+path(points)+points.map((p,i)=>dot(...p,i?5:2)).join('');
  caption=P('Deux tiges articulées, angles 1,1 et −0,5 rad','Two hinged rods, angles 1.1 and −0.5 rad');
 } else if(kind==='three-body') {
  const {masses,y}=GRAVITY_PRESETS.figure8, result=simulateDynamics('gravity',{masses,G:1,collision:.01},y,6.32,{tolerance:1e-7,maxStep:.03});
  drawing=[0,1,2].map(k=>path(result.samples.map(s=>[80+58*s.y[4*k],50-60*s.y[4*k+1]]))).join('')+[0,1,2].map(k=>dot(80+58*y[4*k],50-60*y[4*k+1],4)).join('');
  caption=P('Trajectoire numérique : trois corps en huit','Numerical trajectory: three bodies in a figure eight');
 } else if(kind==='logistic'||kind==='cobweb') {
  const logistic=kind==='logistic', s=logistic?{kind:'logistic',r:3.2,u0:.18,n:8}:{a:.6,b:.2,u0:.08,n:8}, m=cobwebModel(s), T=([x,y])=>[18+125*x,85-75*y];
  drawing=axis+path([[0,0],[1,1]].map(T))+path(Array.from({length:65},(_,i)=>T([i/64,m.f(i/64)])))+path(m.path.map(T));
  caption=logistic?P('Escalier logistique : r = 3,2','Logistic cobweb: r = 3.2'):P('Récurrence : uₙ₊₁ = 0,6uₙ + 0,2','Recurrence: uₙ₊₁ = 0.6uₙ + 0.2');
 } else if(kind==='illumination') {
  const T=([x,y])=>[16+16*x,82-16*y], p=PRESETS.tokarsky;
  drawing=path(TOKARSKY.map(T),true)+[.2,.8,2.2].map(a=>path(trace(p.edges,p.source,[Math.cos(a),Math.sin(a)],5).points.map(T))).join('')+dot(...T(p.source),3)+`<circle cx="${T(p.target)[0]}" cy="${T(p.target)[1]}" r="4"/>`;
  caption=P('Tokarsky : 26 côtés, rayons finis','Tokarsky: 26 sides, finite rays');
 } else if(kind==='fair-division') {
  drawing=[0,1].map(i=>[3,1].map((v,j)=>`<rect class="preview-fill" x="${20+j*60}" y="${40+i*45-(i?4-v:v)*8}" width="60" height="${(i?4-v:v)*8}"/>`).join('')).join('')+'<path d="M20 40H140M20 85H140M80 10V88"/>';
  caption=P('Même gâteau, deux profils de valeur','One cake, two value profiles');
 } else if(kind==='fair-goods') {
  drawing=[0,1,2,3,4,5].map(i=>`<rect class="preview-fill" x="${22+i%3*44}" y="${15+Math.floor(i/3)*43}" width="25" height="25"/>`).join('');
  caption=P('Six biens que l’on ne découpe pas','Six goods that cannot be cut');
 } else if(kind==='hairy-ball') {
  const Q=([x,y,z])=>[80+38*(.8*x-.6*y),50+38*(.3*x+.4*y-Math.sqrt(.75)*z)];
  drawing='<circle cx="80" cy="50" r="38"/>';
  for(let a=-2;a<=2;a++)for(let b=-1;b<=1;b++){const p=spherePoint(a*.5,b*.6),v=tangentField(p),q=p.map((x,i)=>x+.22*v[i]);drawing+=path([p,q].map(Q));}
  drawing+=dot(...Q([0,0,1]),4)+dot(...Q([0,0,-1]),4);
  caption=P('Champ tangent : deux zéros aux pôles','Tangent field: two zeros at the poles');
 } else if(kind==='nonorientable-surfaces') {
  drawing=[-.6,0,.6].map(v=>path(Array.from({length:81},(_,i)=>project(surfacePoint('mobius',2*Math.PI*i/80,v))))).join('');
  for(let i=0;i<12;i++)drawing+=path([-.6,.6].map(v=>project(surfacePoint('mobius',2*Math.PI*i/12,v))));
  caption=P('Ruban de Möbius : un demi-tour','Möbius strip: one half twist');
 } else if(kind==='banach-tarski-model') {
  const pts=[[80,18],[25,72],[62,72],[99,72],[136,72]];
  drawing=pts.slice(1).map(p=>path([pts[0],p])).join('')+pts.map((p,i)=>`${dot(...p,8)}<text x="${p[0]}" y="${p[1]+4}" text-anchor="middle">${['e','a','A','b','B'][i]}</text>`).join('');
  caption=P('Modèle fini : cinq mots distincts','Finite model: five distinct words');
 } else if(kind==='gomboc') {
  const mesh=gombocMesh(1500),pts=mesh.vertices.map(project);
  drawing=mesh.quads.map(ids=>path(ids.map(i=>pts[i]),true)).join('');
  caption=P('Gömböc, relief exagéré ×1500 (le corps réel est une sphère à 0,002 % près)','Gömböc, relief exaggerated ×1500 (the real body is a sphere to within 0.002 %)');
 } else if(kind==='derivative') {
  drawing=axis+plot(x=>82-16*x*x,-2,2)+path([[94,84],[145,33]])+dot(112,66);
  caption=P('Exemple : tangente à y = x² en x = 1','Example: tangent to y = x² at x = 1');
 } else if(kind==='integral') {
  drawing=axis+plot(x=>84-60*x*x,0,1)+Array.from({length:6},(_,i)=>`<rect class="preview-fill" x="${16+128*i/6}" y="${84-60*(i/6)**2}" width="${128/6}" height="${60*(i/6)**2}"/>`).join('');
  caption=P('Rectangles à gauche sous y = x²','Left rectangles under y = x²');
 } else if(kind==='vectors'||kind==='matrix') {
  drawing=path([[30,80],[95,65],[125,25],[60,40],[30,80]])+path([[30,80],[125,25]])+dot(30,80)+dot(95,65)+dot(60,40);
  caption=P('Deux vecteurs et leur parallélogramme','Two vectors and their parallelogram');
 } else if(kind==='complex') {
  drawing='<path class="preview-axis" d="M12 65H150M80 8V92"/><circle cx="80" cy="65" r="35"/>'+path([[80,65],[108,44],[59,37]])+dot(108,44)+dot(59,37);
  caption=P('Multiplier par i : un quart de tour','Multiply by i: one quarter turn');
 } else if(kind==='statistics') {
  drawing='<path class="preview-axis" d="M15 70H145"/>'+[1,2,2,3,7].map((v,i)=>dot(18+16*v,60-(i===2?12:0),4)).join('')+'<path d="M66 30V80"/>';
  caption=P('1, 2, 2, 3, 7 : moyenne 3','1, 2, 2, 3, 7: mean 3');
 } else if(kind==='sequences'||kind==='limits') {
  drawing=axis+Array.from({length:12},(_,n)=>dot(22+10*n,84-65/(n+1),2.5)).join('');
  caption=P('Exemple : uₙ = 1/(n + 1)','Example: uₙ = 1/(n + 1)');
 } else if(kind==='line') {
  drawing=axis+path([[15,85],[144,20]])+dot(40,72)+dot(110,37);
  caption=P('Deux points déterminent une droite','Two points determine a line');
 } else if(kind==='exponential') {
  drawing=axis+plot(x=>85-8*2**x,0,3);
  caption=P('Exemple : y = 2ˣ','Example: y = 2ˣ');
 } else if(kind==='logarithm') {
  drawing=axis+plot(x=>62-24*Math.log(x),.2,4);
  caption=P('Exemple : y = ln(x), x > 0','Example: y = ln(x), x > 0');
 } else if(kind==='fourier') {
  drawing='<path class="preview-axis" d="M10 50H150"/>'+plot(x=>50-24*(Math.sin(x)+Math.sin(3*x)/3+Math.sin(5*x)/5),-Math.PI,Math.PI);
  caption=P('Trois harmoniques : 1, 3 et 5','Three harmonics: 1, 3 and 5');
 } else if(kind==='space-lines') {
  drawing=path([[30,55],[96,35],[134,60],[66,80]],true)+path([[80,10],[80,92]])+dot(80,57);
  caption=P('Une droite traverse un plan','A line crosses a plane');
 } else if(kind==='circle-regions'||kind==='bertrand') {
  const pts=Array.from({length:5},(_,i)=>[80+37*Math.cos(i*2*Math.PI/5),50+37*Math.sin(i*2*Math.PI/5)]);
  drawing='<circle cx="80" cy="50" r="37"/>'+pts.flatMap((p,i)=>pts.slice(i+1).map(q=>path([p,q]))).join('');
  caption=P('Un cercle et ses cordes','A circle and its chords');
 } else if(kind==='buffon') {
  drawing=[20,50,80].map(y=>path([[12,y],[148,y]])).join('')+[[25,30,55,15],[60,40,90,65],[105,20,130,45]].map(([x,y,u,v])=>path([[x,y],[u,v]])).join('');
  caption=P('Aiguilles et droites parallèles','Needles and parallel lines');
 } else if(kind==='euler-primes'||kind==='fermat') {
  drawing=(kind==='fermat'?['3','5','17','257','65537']:['41','43','47','53','61']).map((n,i)=>`<text x="80" y="${17+17*i}" text-anchor="middle">${n}</text>`).join('');
  caption=kind==='fermat'?P('Les cinq premiers nombres de Fermat','The first five Fermat numbers'):P('n² + n + 41, pour n de 0 à 4','n² + n + 41, for n from 0 to 4');
 } else if(kind==='tiles') {
  drawing=Object.values(CURRY.A).filter(Boolean).map(points=>path(points.map(([x,y])=>[15+10*x,80-12*y]),true)).join('');
  caption=P('Pièces de Curry à leurs vraies dimensions','Curry pieces at their true dimensions');
 } else if(kind==='reuleaux') {
  const h=70*Math.sqrt(3)/2;
  drawing=`<path d="M80 ${75-h} A70 70 0 0 1 115 75 A70 70 0 0 1 45 75 A70 70 0 0 1 80 ${75-h}Z"/>`;
  caption=P('Triangle de Reuleaux : trois arcs de cercle','Reuleaux triangle: three circular arcs');
 } else if(kind==='platonic') {
  const v=Array.from({length:8},(_,i)=>[i&1?1:-1,i&2?1:-1,i&4?1:-1]);
  drawing=v.flatMap((p,i)=>v.slice(i+1).filter(q=>q.reduce((s,x,k)=>s+(x!==p[k]),0)===1).map(q=>path([p,q].map(project)))).join('');
  caption=P('Le cube, un des cinq solides réguliers','The cube, one of five regular solids');
 } else if(kind==='chaos') {
  let triangles=[[[80,10],[22,86],[138,86]]];
  for(let n=0;n<3;n++)triangles=triangles.flatMap(t=>t.map((p,i)=>[p,...t.filter((_,j)=>i!==j).map(q=>q.map((x,k)=>(x+p[k])/2))]));
  drawing=triangles.map(t=>path(t,true)).join('');
  caption=P('Triangle de Sierpiński : trois étapes','Sierpiński triangle: three steps');
 } else if(kind==='life') {
  drawing=Array.from({length:6},(_,i)=>path([[40+i*16,10],[40+i*16,90]])+path([[40,10+i*16],[120,10+i*16]])).join('')+[[1,0],[2,1],[0,2],[1,2],[2,2]].map(([x,y])=>`<rect class="preview-fill" x="${56+x*16}" y="${26+y*16}" width="16" height="16"/>`).join('');
  caption=P('Un planeur du jeu de la vie, état initial','A Game of Life glider, initial state');
 } else if(kind==='voronoi') {
  const sites=[[35,30],[120,25],[85,75]];
  drawing=voronoiCells(sites,[15,10,130,80]).map(p=>path(p,true)).join('')+sites.map(p=>dot(...p)).join('');
  caption=P('Trois sites, leurs cellules de Voronoï','Three sites and their Voronoi cells');
 } else if(kind==='fastest-slide') {
  const T=([x,y])=>[20+30*x,15+30*y];
  drawing=path([[0,0],[4,2]].map(T))+path(cycloid([4,2],60).points.map(T))+dot(...T([0,0]))+dot(...T([4,2]));
  caption=P('Même arrivée : droite et cycloïde','One destination: straight line and cycloid');
 } else if(kind==='einstein') {
  const pts=tileOutline(1,Math.sqrt(3)),xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),lo=[Math.min(...xs),Math.min(...ys)],s=Math.min(120/(Math.max(...xs)-lo[0]),76/(Math.max(...ys)-lo[1]));
  drawing=path(pts.map(([x,y])=>[20+(x-lo[0])*s,12+(y-lo[1])*s]),true);
  caption=P('Le contour du pavé « chapeau »','The outline of the hat tile');
 } else if(kind==='square-packing') {
  drawing='<path d="M40 10H120V90H40Z"/>'+[0,1].flatMap(x=>[0,1].map(y=>`<rect class="preview-fill" x="${40+x*40}" y="${10+y*40}" width="40" height="40"/>`)).join('');
  caption=P('Un exemple exact : quatre carrés','An exact example: four squares');
 } else if(kind==='inscribed-square') {
  drawing='<circle cx="80" cy="50" r="38"/>'+path([0,1,2,3].map(i=>[80+38*Math.cos(Math.PI/4+i*Math.PI/2),50+38*Math.sin(Math.PI/4+i*Math.PI/2)]),true);
  caption=P('Un cas simple : carré inscrit dans un cercle','A simple case: square inscribed in a circle');
 } else if(kind==='soap-films') {
  const Q=([x,y,z])=>[80+28*(x-.6*y),50+20*(.3*x+.6*y-z)];
  drawing=Array.from({length:9},(_,i)=>[-1,1].map(k=>path(Array.from({length:17},(_,j)=>{const a=-1+i/4,b=-1+j/8;return Q(k<0?[a,b,a*b*.6]:[b,a,a*b*.6]);}))).join('')).join('');
  caption=P('Surface illustrative z = 0,6xy, sans minimum certifié','Illustrative surface z = 0.6xy, no certified minimum');
 } else if(kind==='knots') {
  const points=Array.from({length:121},(_,i)=>spaceKnot('trefoil',i/120)), segments=points.slice(1).map((p,i)=>[points[i],p]).sort((a,b)=>a[0][2]+a[1][2]-b[0][2]-b[1][2]);
  drawing=segments.map(s=>{const d=path(s.map(project));return d.replace('<path ','<path style="stroke:var(--surface);stroke-width:5" ')+d;}).join('');
  caption=P('Projection d’un nœud de trèfle','Projection of a trefoil knot');
 } else if(kind==='moving-sofa') {
  drawing=path(hammersley(HAMMERSLEY_R,16).map(([x,y])=>[80+35*x,73-55*y]),true);
  caption=P('Un canapé de la famille de Hammersley','A sofa from Hammersley’s family');
 } else if(kind==='opaque-square') {
  const Q=([x,y])=>[45+70*x,85-70*y];
  drawing=path([[0,0],[1,0],[1,1],[0,1]].map(Q),true)+BARRIERS.best.segs.map(s=>path(s.map(Q))).join('');
  caption=P('Une barrière du carré, dessinée à l’échelle','A square barrier, drawn to scale');
 } else if(kind==='four-colours') {
  drawing=[[[20,15],[80,15],[80,50],[20,50]],[[80,15],[140,15],[140,50],[80,50]],[[20,50],[80,50],[80,85],[20,85]],[[80,50],[140,50],[140,85],[80,85]]].map((p,i)=>path(p,true).replace('<path ',`<path style="fill:var(--c${i+1});fill-opacity:.5" `)).join('');
  caption=P('Une carte, des frontières partagées','A map with shared boundaries');
 } else if(kind==='mandelbrot') {
  let d='';
  for(let row=0;row<36;row++)for(let col=0;col<60;col++)if(mandelbrot(-2.2+col/60*3.2,-1.2+row/36*2.4,36)>=36)d+=`M${20+col*2},${14+row*2}h2v2h-2Z`;
  drawing=`<path class="preview-fill" d="${d}"/>`;
  caption=P('Mandelbrot : approximation à 36 itérations','Mandelbrot: approximation with 36 iterations');
 } else if(kind==='reals') {
  drawing=path([[18,55],[145,55]])+path([[45,55],[115,55]])+dot(45,55,4)+dot(115,55,4)+'<text x="45" y="78" text-anchor="middle">−2</text><text x="115" y="78" text-anchor="middle">3</text>';
  caption=P('Exemple : intervalle fermé [−2 ; 3]','Example: closed interval [−2, 3]');
 } else if(kind==='conditioning') {
  drawing=path([[20,50],[65,24],[130,12]])+path([[65,24],[130,38]])+path([[20,50],[65,76],[130,62]])+path([[65,76],[130,88]])+'<text x="54" y="17">A</text><text x="54" y="96">Aᶜ</text><text x="138" y="16">B</text><text x="138" y="42">Bᶜ</text><text x="138" y="66">B</text><text x="138" y="94">Bᶜ</text>';
  caption=P('Arbre : distinguer B sachant A et A sachant B','Tree: distinguish B given A from A given B');
 } else if(kind==='random-variable') {
  drawing=axis+'<rect class="preview-fill" x="42" y="28" width="24" height="56"/><rect class="preview-fill" x="100" y="60" width="24" height="24"/><text x="54" y="98" text-anchor="middle">0</text><text x="112" y="98" text-anchor="middle">1</text>';
  caption=P('Exemple : Bernoulli de paramètre 0,3','Example: Bernoulli distribution with p = 0.3');
 } else if(kind==='counting') {
  drawing=Array.from({length:4},(_,x)=>path([[32+32*x,18],[32+32*x,82]])).join('')+Array.from({length:3},(_,y)=>path([[32,18+32*y],[128,18+32*y]])).join('')+path([[32,82],[64,82],[64,50],[96,50],[96,18],[128,18]]);
  caption=P('Un chemin : trois pas à droite, deux vers le haut','One path: three steps right, two steps up');
 } else if(kind==='graphs') {
  const v=[[25,55],[60,20],[100,75],[137,30]];
  drawing=[[0,1],[1,2],[2,3],[3,1],[0,2]].map(([a,b])=>path([v[a],v[b]])).join('')+v.map(p=>dot(...p,5)).join('');
  caption=P('Un graphe : quatre sommets, cinq arêtes','A graph: four vertices, five edges');
 } else if(kind==='polynomials') {
  drawing='<path class="preview-axis" d="M12 50H150M80 8V94"/>'+plot(x=>50-24*(x*x*x-x),-1.4,1.4);
  caption=P('Exemple : y = x³ − x','Example: y = x³ − x');
 } else if(['arithmetic','algebra','percentages','modular','bezout','primes','markov','logic','sets'].includes(kind)) {
  const examples={
   arithmetic:[['84 = 2 × 42','126 = 3 × 42','PGCD = 42'],P('Un diviseur commun à 84 et 126','A common divisor of 84 and 126')],
   algebra:[['(x + 2)(x + 3)','=','x² + 5x + 6'],P('Une identité de factorisation','A factorisation identity')],
   percentages:[['100 × 1,1 = 110','110 × 0,9 = 99'],P('Exemple : +10 %, puis −10 %','Example: +10%, then −10%')],
   modular:[['17 = 3 × 5 + 2','17 ≡ 2 (mod 5)'],P('Division euclidienne et reste','Euclidean division and remainder')],
   bezout:[['3 × 7 − 2 × 10 = 1'],P('Une identité de Bézout pour 7 et 10','A Bézout identity for 7 and 10')],
   primes:[['2, 3, 5, 7, 11'],P('Les cinq premiers nombres premiers','The first five prime numbers')],
   markov:[['0,8   0,2','0,3   0,7'],P('Exemple : matrice de transition à deux états','Example: a two-state transition matrix')],
   logic:[['4 est pair','↓','4² = 16 est pair'],P('Un exemple d’implication, pas une preuve générale','One implication example, not a general proof')],
   sets:[['A = {1, 2, 3}','B = {2, 3, 4}','A ∩ B = {2, 3}'],P('Deux ensembles et leur intersection','Two sets and their intersection')]
  };
  const [lines,label]=examples[kind];
  // Mathematical decimal notation in these examples is localised by the caption renderer below.
  const textLines=values=>values.map((text,i)=>`<text x="80" y="${50+(i-(values.length-1)/2)*24}" text-anchor="middle">${text}</text>`).join('');
  drawing=textLines(lines);
  drawingEn=textLines(kind==='logic'?['4 is even','↓','4² = 16 is even']:lines.map(text=>text.replace(/(\d),(\d)/g,'$1.$2').replace('PGCD','gcd')));
  caption=label;
 } else if(kind==='functions') {
  drawing=axis+plot(x=>75-12*x*x,-2,2);
  caption=P('Exemple de fonction : y = x²','Function example: y = x²');
 } else if(kind==='timeline') {
  drawing=path([[15,50],[145,50]])+[25,60,95,135].map((x,i)=>dot(x,50,4)+path([[x,50],[x,i%2?75:25]])).join('');
  caption=P('Relier les personnes et les idées','Connect people and ideas');
 } else { return null; }
 const result={kind,drawing,drawingEn,caption};cache.set(kind,result);return result;
}
