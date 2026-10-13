// Exact models behind the animated companion diagrams; no expression evaluation.
import {trigValues, remarkableAngles, radiansLabel} from './trigonometry.js';
const P=(fr,en)=>[fr,en];
export const scenes={
euclid:{range:[1,12,1,6],label:P('Unité commune','Common unit'),steps:[P('Deux quantités à partager','Two quantities to divide'),P('Découper avec une même unité','Divide into the same unit'),P('Lire le plus grand diviseur commun','Read the greatest common divisor')]},
vector:{range:[-180,180,1,45],label:P('Angle θ (degrés)','Angle θ (degrees)'),steps:[P('Fixer le vecteur u','Fix vector u'),P('Tourner le vecteur v','Rotate vector v'),P('Comparer angle et produit scalaire','Compare angle and dot product')]},
line:{range:[-3,3,.1,2],label:P('Pente m','Slope m'),steps:[P('Partir de l’ordonnée à l’origine','Start at the intercept'),P('Avancer de deux unités','Move two units horizontally'),P('Relier montée et pente','Connect rise and slope')]},
interval:{range:[0,4,.1,3],label:P('Distance maximale r','Maximum distance r'),steps:[P('Placer le centre 2','Place the centre at 2'),P('S’éloigner d’au plus r','Move at most r away'),P('Trouver l’intersection avec ]2 ; 7]','Find the intersection with (2,7]')]},
counterexample:{range:[-2,2,.05,.5],label:P('Valeur de x','Value of x'),steps:[P('Comparer y = x et y = x²','Compare y = x and y = x²'),P('Choisir une valeur de x','Choose a value of x'),P('Tester la conjecture x² ≥ x','Test the conjecture x² ≥ x')]},
quadratic:{range:[.25,2,.05,1],label:P('Coefficient a','Coefficient a'),steps:[P('Tracer a(x − 2)² − 1','Draw a(x − 2)² − 1'),P('Placer le sommet','Place the vertex'),P('Lire les deux racines','Read the two roots')]},
mean:{range:[0,30,1,16],label:P('Cinquième valeur','Fifth value'),steps:[P('Placer les observations','Place the observations'),P('Calculer le point d’équilibre','Calculate the balance point'),P('Comparer moyenne et médiane','Compare mean and median')]},
balance:{range:[0,6,.1,3],label:P('Valeur de x','Value of x'),steps:[P('Comparer les deux membres','Compare the two sides'),P('Retirer 2 aux deux membres','Subtract 2 from both sides'),P('Diviser par 3','Divide by 3')]},
growth:{range:[0,80,1,20],label:P('Taux t (%)','Rate t (%)'),steps:[P('Partir de 100','Start at 100'),P('Augmenter de t %','Increase by t%'),P('Diminuer ensuite de t %','Then decrease by t%')]},
derivative:{range:[.02,2,.02,1],label:P('Écart h','Gap h'),steps:[P('Choisir A sur y = x²','Choose A on y = x²'),P('Construire la sécante AB','Construct secant AB'),P('Comparer à la tangente en A','Compare with the tangent at A')]},
conditional:{range:[0,1,.01,.75],label:P('P(B | A)','P(B | A)'),steps:[P('Séparer A et non A','Separate A and not A'),P('Conditionner à l’intérieur de A','Condition inside A'),P('Revenir à la population totale','Return to the full population')]},
sequence:{range:[1,12,1,6],label:P('Nombre de termes après u₀','Number of terms after u₀'),steps:[P('Partir de u₀ = 2','Start at u₀ = 2'),P('Appliquer uₙ₊₁ = uₙ/2 + 3','Apply uₙ₊₁ = uₙ/2 + 3'),P('Observer l’écart à 6','Observe the gap to 6')]},
dice:{range:[0,1,.01,.3],label:P('Probabilité de recevoir 10','Probability of receiving 10'),steps:[P('Deux montants possibles : 0 ou 10','Two possible payouts: 0 or 10'),P('Pondérer chaque montant','Weight each payout'),P('Lire l’espérance','Read the expectation')]},
exponential:{range:[-.5,.5,.01,.2],label:P('Taux relatif k','Relative rate k'),steps:[P('Partir de exp(0) = 1','Start at exp(0) = 1'),P('Tracer exp(kx)','Draw exp(kx)'),P('Comparer deux durées consécutives','Compare consecutive time intervals')]},
circle:{range:[-180,180,1,60],label:P('Angle θ (degrés)','Angle θ (degrees)'),steps:[P('Tracer le cercle unité','Draw the unit circle'),P('Placer le point d’angle θ','Place the point at angle θ'),P('Projeter sur les deux axes','Project onto both axes')]},
space:{range:[-2,2,.1,1],label:P('Paramètre t','Parameter t'),steps:[P('Placer A et le vecteur directeur u','Place A and direction vector u'),P('Former M = A + tu','Form M = A + tu'),P('Vérifier les trois coordonnées','Check all three coordinates')]},
reciprocal:{range:[.1,3,.05,1],label:P('Distance positive à zéro','Positive distance from zero'),steps:[P('Tracer y = 1/x, x ≠ 0','Draw y = 1/x, x ≠ 0'),P('Comparer x et −x','Compare x and −x'),P('Observer les deux limites en zéro','Observe the two limits at zero')]},
pascal:{range:[2,8,1,5],label:P('Nombre n d’objets','Number n of objects'),steps:[P('Choisir le premier objet','Choose the first object'),P('Choisir un second objet différent','Choose a different second object'),P('Retirer le double comptage','Remove double counting')]},
binomial:{range:[0,1,.01,.5],label:P('Probabilité de succès p','Success probability p'),steps:[P('Trois essais indépendants','Three independent trials'),P('Regrouper par nombre de succès','Group by number of successes'),P('Lire la loi et l’espérance','Read the distribution and expectation')]},
log:{range:[.2,5,.05,2],label:P('Entrée positive x','Positive input x'),steps:[P('Tracer y = ln x','Draw y = ln x'),P('Placer (x ; ln x)','Place (x,ln x)'),P('Échanger les coordonnées avec exp','Swap coordinates with exp')]},
log10:{range:[-2,3,.05,1],label:P('Exposant k','Exponent k'),steps:[P('Une échelle en puissances de 10','A scale in powers of 10'),P('Former x = 10ᵏ','Form x = 10ᵏ'),P('Lire log(x) = k','Read log(x) = k')]},
projection:{range:[-2,6,.1,5],label:P('Coordonnée z de A','z coordinate of A'),steps:[P('Fixer le plan z = 1','Fix the plane z = 1'),P('Projeter A verticalement vers H','Project A vertically onto H'),P('Lire la distance |z − 1|','Read the distance |z − 1|')]},
primitive:{range:[-2,3,.1,1],label:P('Constante C','Constant C'),steps:[P('Fixer la dérivée f(x) = 2x','Fix the derivative f(x) = 2x'),P('Tracer F(x) = x² + C','Draw F(x) = x² + C'),P('Changer C sans changer F′','Change C without changing F′')]},
integral:{range:[2,30,1,8],label:P('Nombre de rectangles N','Number of rectangles N'),steps:[P('Tracer x² sur [0 ; 2]','Draw x² on [0,2]'),P('Ajouter les rectangles à gauche','Add left rectangles'),P('Comparer la somme à 8/3','Compare the sum to 8/3')]},
concentration:{range:[100,5000,100,1000],label:P('Nombre d’observations n','Number of observations n'),steps:[P('Une Bernoulli de paramètre 0,5','A Bernoulli variable with p = 0.5'),P('Moyenner n observations indépendantes','Average n independent observations'),P('Majorer la probabilité d’un écart ≥ 0,1','Bound the probability of a deviation ≥ 0.1')]},
regression:{range:[0,10,.1,5],label:P('Ordonnée du troisième point','Third point’s y coordinate'),steps:[P('Placer trois observations','Place three observations'),P('Construire la droite des moindres carrés','Construct the least-squares line'),P('Tracer les écarts verticaux','Draw the vertical residuals')]},
};
export function sceneValues(id,v){
 switch(id){
 case 'euclid':return {a:2*v,b:3*v,gcd:v};
 case 'vector':return {x:3*Math.cos(v*Math.PI/180),y:3*Math.sin(v*Math.PI/180),dot:6*Math.cos(v*Math.PI/180)};
 case 'line':return {m:v,b:1,rise:2*v};
 case 'interval':return {left:2-v,right:2+v};
 case 'counterexample':return {x:v,square:v*v,difference:v*v-v};
 case 'quadratic':return {a:v,left:2-1/Math.sqrt(v),right:2+1/Math.sqrt(v)};
 case 'mean':{const a=[2,3,4,5,v].sort((a,b)=>a-b);return {mean:(14+v)/5,median:a[2]};}
 case 'balance':return {left:3*v+2,right:11,afterLeft:3*v,afterRight:9};
 case 'growth':return {up:100*(1+v/100),end:100*(1-v*v/10000)};
 case 'derivative':return {x:2,h:v,bx:2+v,by:(2+v)**2,slope:4+v,tangent:4};
 case 'conditional':return {a:.4,bGivenA:v,bGivenNotA:.25,joint:.4*v,b:.4*v+.6*.25};
 case 'sequence':return {n:v,term:6-4*2**(-v),gap:4*2**(-v)};
 case 'dice':return {p:v,mean:10*v,variance:100*v*(1-v)};
 case 'exponential':return {k:v,factor:Math.exp(v),at2:Math.exp(2*v)};
 case 'circle':return {cos:Math.cos(v*Math.PI/180),sin:Math.sin(v*Math.PI/180),radians:v*Math.PI/180};
 case 'space':return {x:1+2*v,y:2-v,z:3+v};
 case 'reciprocal':return {positive:1/v,negative:-1/v};
 case 'pascal':return {ordered:v*(v-1),groups:v*(v-1)/2};
 case 'binomial':return {p:v,probabilities:[(1-v)**3,3*v*(1-v)**2,3*v*v*(1-v),v**3],mean:3*v};
 case 'log':return {x:v,y:Math.log(v),back:Math.exp(Math.log(v))};
 case 'log10':return {k:v,x:10**v};
 case 'projection':return {z:v,distance:Math.abs(v-1)};
 case 'primitive':return {c:v,at0:v,derivativeAt1:2};
 case 'integral':{let sum=0;const w=2/v;for(let i=0;i<v;i++)sum+=(i*w)**2*w;return {n:v,sum,exact:8/3,error:8/3-sum};}
 case 'concentration':return {n:v,variance:.25/v,bound:Math.min(1,25/v),sd:.5/Math.sqrt(v)};
 case 'regression':return {slope:(v-2)/2,intercept:(5+v)/3-v+2,mean:(5+v)/3};
 default:throw new Error('Unknown scene: '+id);
 }
}
const E=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
import { icon } from './icons.js';
export function fullscreenButton(say){return `<button type="button" class="btn-quiet" data-fullscreen data-label-on="${say('Plein écran','Full screen')}" data-label-off="${say('Quitter le plein écran','Exit full screen')}" aria-pressed="false">${icon('arrows-out',18)}<span class="fs-label">${say('Plein écran','Full screen')}</span></button>`;}
export function visualMarkup(id,t){const s=scenes[id];return `<section class="visual-lesson" data-fs-target aria-label="${E(t(P('Explication visuelle','Visual explanation')))}"><div class="visual-heading"><span class="eyebrow">${t(P('Voir le raisonnement','See the reasoning'))}</span><span class="step-count"></span>${fullscreenButton((fr,en)=>t(P(fr,en)))}</div><div class="lesson-diagram"></div><p class="scene-caption" aria-live="polite"></p><div class="story-controls"><button data-story="back" aria-label="${t(P('Étape précédente','Previous step'))}">‹</button><button data-story="play">${t(P('Lire l’animation','Play animation'))}</button><button data-story="next" aria-label="${t(P('Étape suivante','Next step'))}">›</button><label class="story-timeline">${t(P('Étape','Step'))}<input type="range" min="1" max="3" step="1" value="1" data-story="timeline"></label><button data-story="reset">${t(P('Recommencer','Restart'))}</button></div><label class="scene-parameter">${E(t(s.label))}<output></output><input data-scene="value" type="range" min="${s.range[0]}" max="${s.range[1]}" step="${s.range[2]}" value="${s.range[3]}"></label><details class="scene-data"><summary>${t(P('Valeurs et équations','Values and equations'))}</summary><div></div></details><p class="scene-note">${t(P('Déplace le curseur pour tester une prédiction. Le graphique aide à comprendre ; il ne remplace pas une démonstration.','Move the slider to test a prediction. The diagram supports understanding; it does not replace a proof.'))}</p></section>`;}
export function diagram(id,v,step,t,fmt){
 const q=sceneValues(id,v),rows=[];const add=(a,b)=>rows.push([a,typeof b==='number'?fmt(b,4):b]);
 let xmin=-1,xmax=6,ymin=-2,ymax=10;
 if(['circle','vector'].includes(id)){xmin=-620/280*3;xmax=620/280*3;ymin=-3;ymax=3;}
 if(id==='line'){ymin=-7;ymax=9;}
 if(id==='log'){xmin=-2;xmax=6;ymin=-3;ymax=6;}
 if(id==='circle'){xmin=-620/280*1.5;xmax=620/280*1.5;ymin=-1.5;ymax=1.5;}
 if(id==='reciprocal'){xmin=-4;xmax=4;ymin=-10;ymax=10;}
 if(id==='counterexample'){xmin=-2;xmax=2;ymin=-2;ymax=4;}
 if(id==='regression'){xmin=0;xmax=4;ymin=-1;ymax=11;}
 if(id==='exponential'){xmin=-1;xmax=5;ymin=0;ymax=13;}
 if(id==='primitive'){xmin=-3;xmax=3;ymin=-3;ymax=12;}
 if(id==='derivative'){xmin=0;xmax=4.5;ymin=-1;ymax=21;}
 if(id==='integral'){xmin=0;xmax=2.2;ymin=0;ymax=4.5;}
 if(id==='sequence'){xmin=0;xmax=12;ymin=0;ymax=7;}
 const X=x=>48+(x-xmin)*620/(xmax-xmin),Y=y=>320-(y-ymin)*280/(ymax-ymin);
 const line=(x1,y1,x2,y2,c='mint',dash=false)=>`<line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" class="ink ${c}" ${dash?'stroke-dasharray="5 5"':''}/>`;
 const point=(x,y,c='mint',r=5)=>`<circle cx="${X(x)}" cy="${Y(y)}" r="${r}" class="dot ${c}"/>`;
 const text=(x,y,s,c='')=>`<text x="${X(x)}" y="${Y(y)}" class="${c}">${E(s)}</text>`;
 const path=(fn,c='mint',lo=xmin,hi=xmax)=>{let d='';for(let i=0;i<=150;i++){let x=lo+(hi-lo)*i/150,y=fn(x);d+=(i?'L':'M')+X(x)+','+Y(y);}return `<path d="${d}" pathLength="1" class="ink ${c} reveal-stroke"/>`;};
 const bar=(x,y,w,h,c='mint')=>`<rect x="${X(x)}" y="${Y(y+h)}" width="${w*620/(xmax-xmin)}" height="${h*280/(ymax-ymin)}" class="area ${c}"/>`;
 let base='',build='',finish='';
 const axis=line(xmin,0,xmax,0,'axis')+line(0,ymin,0,ymax,'axis');
 for(let x=Math.ceil(xmin);x<=xmax;x++){base+=line(x,ymin,x,ymax,'grid')+text(x,ymin-.3,fmt(x,0));}
 for(let y=Math.ceil(ymin);y<=ymax;y+=Math.max(1,Math.ceil((ymax-ymin)/6)))base+=line(xmin,y,xmax,y,'grid')+text(xmin-.25,y,fmt(y,0));
 base+=axis;
 switch(id){
 case 'quadratic':base+=path(x=>v*(x-2)**2-1);build+=point(2,-1,'gold')+text(2.2,-.7,'S(2, −1)');finish+=point(q.left,0)+point(q.right,0)+line(q.left,0,q.right,0,'gold');add('f(x)',`${fmt(v)}(x − 2)² − 1`);add('x₁',q.left);add('x₂',q.right);break;
 case 'counterexample':base+=path(x=>x*x)+path(x=>x,'gold');build+=line(v,v,v,v*v,'violet')+point(v,v,'gold')+point(v,v*v);finish+=text(-1.8,3.4,`x² − x = ${fmt(q.difference)}`);add('x',v);add('x²',q.square);add('x² − x',q.difference);break;
 case 'line':base+=path(x=>v*x+1)+point(0,1);build+=line(0,1,2,1,'gold')+line(2,1,2,2*v+1,'violet')+point(2,2*v+1);finish+=text(.3,7,`Δy/Δx = ${fmt(q.rise)}/2 = ${fmt(v)}`);add('y',`${fmt(v)}x + 1`);add('Δx',2);add('Δy',q.rise);break;
 case 'derivative':base+=path(x=>x*x)+point(2,4,'gold');build+=path(x=>4+q.slope*(x-2),'violet')+point(q.bx,q.by,'violet')+line(2,4,q.bx,4,'gold',true)+line(q.bx,4,q.bx,q.by,'gold',true);finish+=path(x=>4*x-4,'gold')+text(.2,18,`m = 4 + h = ${fmt(q.slope)}`);add('h',v);add(t(P('Pente sécante','Secant slope')),q.slope);add(t(P('Pente tangente','Tangent slope')),4);break;
 case 'primitive':base+=path(x=>2*x,'gold');build+=path(x=>x*x+v)+point(0,v);finish+=text(-2.6,10,`F′(x) = 2x ; F(0) = ${fmt(v)}`);add('F(x)',`x² + ${fmt(v)}`);add('F′(x)','2x');break;
 case 'integral':base+=path(x=>x*x,'mint',0,2);for(let i=0;i<v;i++)build+=bar(i*2/v,0,2/v,(i*2/v)**2);finish+=text(.1,4,`S = ${fmt(q.sum)} ; I = 8/3`);add('N',v);add(t(P('Somme à gauche','Left sum')),q.sum);add(t(P('Intégrale exacte','Exact integral')),q.exact);add(t(P('Erreur','Error')),q.error);break;
 case 'exponential':base+=point(0,1,'gold');build+=path(x=>Math.exp(v*x));finish+=point(1,Math.exp(v),'gold')+point(2,q.at2,'violet')+text(1,11,`f(2)/f(1) = exp(k) = ${fmt(q.factor)}`);add('k',v);add('f(1)',q.factor);add('f(2)',q.at2);break;
 case 'log':base+=path(x=>Math.log(x),'mint',.08,6)+path(x=>x,'axis');build+=point(v,q.y)+line(v,0,v,q.y,'mint',true);finish+=path(x=>Math.exp(x),'gold',-2,Math.log(6))+point(q.y,v,'gold')+line(v,q.y,q.y,v,'violet',true);add('x',v);add('ln(x)',q.y);add('exp(ln x)',q.back);break;
 case 'reciprocal':base+=path(x=>1/x,'mint',-4,-.08)+path(x=>1/x,'mint',.08,4);build+=point(v,q.positive)+point(-v,q.negative,'gold');finish+=line(v,0,v,q.positive,'mint',true)+line(-v,0,-v,q.negative,'gold',true);add('x',v);add('1/x',q.positive);add('1/(−x)',q.negative);break;
 case 'circle':{const exact=trigValues(v);base=`<circle cx="${X(0)}" cy="${Y(0)}" r="${280/(ymax-ymin)}" class="ink mint"/>`+axis+text(2.9,-.2,'cos')+text(.12,1.4,'sin');base+=remarkableAngles.slice(0,-1).map(a=>{const d=a*Math.PI/180;return point(Math.cos(d),Math.sin(d),'mint',2)+text(1.24*Math.cos(d)-.08,1.24*Math.sin(d),a===0?'0 · 2π':radiansLabel(a));}).join('');build+=line(0,0,q.cos,q.sin,'gold')+point(q.cos,q.sin,'gold');finish+=line(q.cos,q.sin,q.cos,0,'violet',true)+line(q.cos,q.sin,0,q.sin,'violet',true)+text(-3.1,-1.35,`cos θ = ${exact.exact?exact.exact[0]:'≈ '+fmt(q.cos)} ; sin θ = ${exact.exact?exact.exact[1]:'≈ '+fmt(q.sin)}`);add('θ (rad)',exact.radians||q.radians);add('cos θ',exact.exact?exact.exact[0]:q.cos);add('sin θ',exact.exact?exact.exact[1]:q.sin);break;}
 case 'vector':base+=line(0,0,2,0,'gold')+point(2,0,'gold')+text(2.2,.2,'u');build+=line(0,0,q.x,q.y)+point(q.x,q.y)+text(q.x+.1,q.y+.15,'v');finish+=line(q.x,q.y,q.x,0,'violet',true)+text(-4,2.6,`u · v = ${fmt(q.dot)}`);add('u','(2, 0)');add('v',`(${fmt(q.x)}, ${fmt(q.y)})`);add('u · v',q.dot);break;
 case 'sequence':base+=point(0,2,'gold');for(let n=1;n<=v;n++)build+=point(n,6-4*2**(-n))+line(n-1,6-4*2**(-(n-1)),n,6-4*2**(-n));finish+=line(0,6,12,6,'gold',true)+line(v,q.term,v,6,'violet')+text(1,6.6,`6 − uₙ = ${fmt(q.gap)}`);add('n',v);add('uₙ',q.term);add('6 − uₙ',q.gap);break;
 case 'regression':base+=point(1,2)+point(2,3)+point(3,v);build+=path(x=>q.slope*x+q.intercept,'gold')+point(2,q.mean,'gold');for(const [x,y] of [[1,2],[2,3],[3,v]])finish+=line(x,y,x,q.slope*x+q.intercept,'violet',true);add(t(P('Pente','Slope')),q.slope);add(t(P('Ordonnée à l’origine','Intercept')),q.intercept);add('ȳ',q.mean);break;
 // Screen-space diagrams for quantities and 3D projections.
 default:{base='';const txt=(x,y,s)=>`<text x="${x}" y="${y}">${E(s)}</text>`;const ln=(x,y,a,b,c='mint',dash=false)=>`<line x1="${x}" y1="${y}" x2="${a}" y2="${b}" class="ink ${c}" ${dash?'stroke-dasharray="5 5"':''}/>`;const dot=(x,y,c='mint',open=false)=>`<circle cx="${x}" cy="${y}" r="6" class="${open?'open':'dot'} ${c}"/>`;const rect=(x,y,w,h,c='mint')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" class="area ${c}"/>`;
 switch(id){
 case 'euclid':base=txt(48,45,`a = ${q.a} ; b = ${q.b}`)+rect(48,80,300,40)+rect(48,160,450,40,'gold');build=ln(198,80,198,120,'axis')+ln(198,160,198,200,'axis')+ln(348,160,348,200,'axis')+txt(60,105,String(v))+txt(210,105,String(v))+txt(60,185,String(v))+txt(210,185,String(v))+txt(360,185,String(v));finish=txt(48,270,`PGCD / GCD (${q.a}, ${q.b}) = ${v}`);add('a',q.a);add('b',q.b);add('PGCD / GCD',v);break;
 case 'interval':{const px=x=>80+(x+2)*55;for(let x=-2;x<=8;x++)base+=txt(px(x),245,String(x));base+=ln(60,220,660,220,'axis')+dot(px(2),220,'gold');build=ln(px(q.left),140,px(q.right),140)+dot(px(q.left),140)+dot(px(q.right),140)+txt(60,95,`|x − 2| ≤ ${fmt(v)}`);finish=ln(px(2),180,px(7),180,'gold')+dot(px(2),180,'gold',true)+dot(px(7),180,'gold')+txt(60,290,v===0?'∩ = ∅':`∩ = ]2 ; ${fmt(Math.min(q.right,7))}]`);add(t(P('Borne gauche','Left endpoint')),q.left);add(t(P('Borne droite','Right endpoint')),q.right);break;}
 case 'mean':{const px=x=>70+x*18;for(const n of [2,3,4,5,v])base+=dot(px(n),130);base+=ln(48,130,650,130,'axis');build=ln(px(q.mean),90,px(q.mean),190,'gold')+txt(48,250,`${t(P('Moyenne','Mean'))} = ${fmt(q.mean)}`);finish=ln(px(q.median),160,px(q.median),210,'violet')+txt(48,290,`${t(P('Médiane','Median'))} = ${fmt(q.median)}`);add(t(P('Moyenne','Mean')),q.mean);add(t(P('Médiane','Median')),q.median);break;}
 case 'balance':base=rect(50,80,q.left*25,35)+rect(50,150,11*25,35,'gold')+txt(50,60,`3x + 2 = ${fmt(q.left)} ; 11`);build=rect(50,220,3*v*25,35)+rect(50,280,9*25,35,'gold');finish=txt(370,240,`x = ${fmt(v)} ; 3x ${Math.abs(3*v-9)<1e-8?'=':'≠'} 9`)+txt(370,285,'3x = 9 ⇔ x = 3');add('3x + 2',q.left);add('11',11);break;
 case 'growth':base=rect(60,70,300,35)+txt(60,60,'100');build=rect(60,150,q.up*3,35,'gold')+txt(60,140,fmt(q.up));finish=rect(60,230,q.end*3,35)+txt(60,220,fmt(q.end))+txt(60,300,'(1 + t)(1 − t) = 1 − t²');add(t(P('Après hausse','After increase')),q.up);add(t(P('Après baisse','After decrease')),q.end);break;
 case 'conditional':base=rect(60,70,240,170)+rect(300,70,360,170,'gold')+txt(70,60,'A : 0.4')+txt(310,60,'non A / not A : 0.6');build=rect(60,70,240,170*v,'violet')+txt(70,275,`P(A ∩ B) = ${fmt(q.joint)}`);finish=rect(300,70,360,42.5,'violet')+txt(70,310,`P(B) = ${fmt(q.b)}`);add('P(A)',.4);add('P(B | A)',v);add('P(B | non A)',.25);add('P(A ∩ B)',q.joint);add('P(B)',q.b);break;
 case 'dice':base=txt(70,75,'X = 0')+txt(390,75,'X = 10');build=rect(70,110,120,150*(1-v))+rect(390,110,120,150*v,'gold')+txt(70,290,`P(0) = ${fmt(1-v)}`)+txt(390,290,`P(10) = ${fmt(v)}`);finish=txt(70,330,`E(X) = 0(1 − p) + 10p = ${fmt(q.mean)}`);add('E(X)',q.mean);add('V(X)',q.variance);break;
 case 'binomial':base=txt(60,45,'X ~ B(3, p)');q.probabilities.forEach((p,k)=>{base+=txt(100+k*150,310,String(k));build+=rect(80+k*150,280-p*210,70,p*210,k%2?'gold':'mint');});finish=txt(60,345,`E(X) = 3p = ${fmt(q.mean)}`);q.probabilities.forEach((p,k)=>add(`P(X = ${k})`,p));add('E(X)',q.mean);break;
 case 'pascal':base=txt(60,70,`n = ${v}`);for(let i=0;i<v;i++)base+=dot(80+i*75,120);build=txt(60,200,`${v} × ${v-1} = ${q.ordered}`);finish=txt(60,290,`C(${v}, 2) = ${q.ordered}/2 = ${q.groups}`);add(t(P('Choix ordonnés','Ordered choices')),q.ordered);add(t(P('Groupes non ordonnés','Unordered groups')),q.groups);break;
 case 'log10':base=ln(65,190,650,190,'axis');for(let k=-2;k<=3;k++)base+=dot(80+(k+2)*110,190)+txt(80+(k+2)*110-15,230,`10^${k}`);build=dot(80+(v+2)*110,160,'gold')+txt(65,90,`x = 10^${fmt(v)} = ${fmt(q.x)}`);finish=txt(65,300,`log(x) = ${fmt(v)}`);add('x',q.x);add('log(x)',v);break;
 case 'concentration':base=txt(60,70,'p = 0.5 ; σ² = 0.25 ; ε = 0.1');build=txt(60,145,`V(Mₙ) = 0.25/n = ${fmt(q.variance,6)}`)+rect(60,180,Math.min(590,q.bound*590),35);finish=txt(60,290,`P(|Mₙ − 0.5| ≥ 0.1) ≤ ${fmt(q.bound)}`);add('n',v);add('V(Mₙ)',q.variance);add(t(P('Écart-type','Standard deviation')),q.sd);add(t(P('Borne de probabilité','Probability bound')),q.bound);break;
 case 'space':case 'projection':{const proj=([x,y,z])=>[270+x*42-y*28,270-x*12-y*20-z*25];const A=id==='space'?[1,2,3]:[1,2,v],B=id==='space'?[q.x,q.y,q.z]:[1,2,1];const a=proj(A),b=proj(B);for(const [c,label] of [[[5,0,0],'x'],[[0,5,0],'y'],[[0,0,6],'z']]){const p=proj(c);base+=ln(270,270,...p,'axis')+txt(p[0],p[1],label);}if(id==='projection'){const pts=[[0,0,1],[4,0,1],[4,4,1],[0,4,1]].map(proj);base+=`<polygon points="${pts.map(p=>p.join(',')).join(' ')}" class="area mint"/>`+txt(470,260,'z = 1');}base+=dot(...a,'gold')+txt(a[0]+10,a[1],'A');build=ln(...a,...b,'mint',true)+dot(...b)+txt(b[0]+10,b[1],id==='space'?'M':'H');finish=txt(45,325,id==='space'?`M = (${fmt(q.x)}, ${fmt(q.y)}, ${fmt(q.z)})`:`AH = |${fmt(v)} − 1| = ${fmt(q.distance)}`);add(t(P('Vue','View')),t(P('Projection oblique ; angles non conservés','Oblique projection; angles not preserved')));if(id==='space'){add('x',q.x);add('y',q.y);add('z',q.z);}else add('AH',q.distance);break;}
 }
 }
 }
 const caption=t(scenes[id].steps[step-1]);
 return {svg:`<svg viewBox="0 0 720 370" role="img" aria-label="${E(caption)}"><title>${E(caption)}</title><defs><clipPath id="lesson-clip"><rect x="0" y="0" width="720" height="370"/></clipPath></defs><g clip-path="url(#lesson-clip)">${base}${step>=2?`<g class="scene-build">${build}</g>`:''}${step>=3?`<g class="scene-build">${finish}</g>`:''}</g></svg>`,rows,caption};
}
export function bindVisual(root,id,t,fmt){
 const s=scenes[id];let step=1,v=s.range[3],timer=null;const $=sel=>root.querySelector(sel),preference=matchMedia('(prefers-reduced-motion: reduce)'),reduced=()=>preference.matches;
 function stop(){if(timer!==null)clearInterval(timer);timer=null;$('[data-story="play"]').textContent=reduced()?t(P('Avancer d’une étape','Advance one step')):t(P('Lire l’animation','Play animation'));$('[data-story="play"]').setAttribute('aria-pressed','false');}
 function paint(animate=true){root.classList.toggle('animate-diagram',animate&&!reduced());const d=diagram(id,v,step,t,fmt);$('.lesson-diagram').innerHTML=d.svg;$('.scene-caption').textContent=d.caption;$('.step-count').textContent=`${step} / 3`;$('.scene-parameter output').textContent=fmt(v);$('[data-story="timeline"]').value=step;$('[data-story="back"]').disabled=step===1;$('[data-story="next"]').disabled=step===3;$('.scene-data div').innerHTML=`<table><caption>${E(t(P('Valeurs du modèle','Model values')))}</caption><tbody>${d.rows.map(([a,b])=>`<tr><th scope="row">${E(a)}</th><td>${E(b)}</td></tr>`).join('')}</tbody></table>`;}
 root.querySelectorAll('[data-story]').forEach(b=>b.addEventListener(b.tagName==='INPUT'?'input':'click',()=>{const action=b.dataset.story;if(action==='play'){if(timer!==null){stop();return;}if(reduced()){step=step===3?1:step+1;paint();return;}if(step===3)step=1;paint();b.textContent=t(P('Pause','Pause'));b.setAttribute('aria-pressed','true');timer=setInterval(()=>{if(step<3){step++;paint();}else stop();},2400);}else{stop();if(action==='back')step=Math.max(1,step-1);if(action==='next')step=Math.min(3,step+1);if(action==='timeline')step=Number(b.value);if(action==='reset'){step=1;v=s.range[3];$('[data-scene="value"]').value=v;}paint();}}));
 $('[data-scene="value"]').addEventListener('input',e=>{v=Number(e.target.value);stop();paint(false);});
 function visibility(){if(document.hidden)stop();}document.addEventListener('visibilitychange',visibility);const motionChange=()=>{if(reduced()){stop();root.classList.remove('animate-diagram');}};preference.addEventListener?.('change',motionChange);stop();paint(false);
 return ()=>{stop();document.removeEventListener('visibilitychange',visibility);preference.removeEventListener?.('change',motionChange);};
}
