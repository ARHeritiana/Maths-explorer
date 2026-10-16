// ===== DECK 2: Logique =====
var ASSERT=[
 {tex:'(P\\wedge Q)\\vee R',f:function(p,q,r){return (p&&q)||r}},
 {tex:'P\\Rightarrow(Q\\wedge R)',f:function(p,q,r){return !p||(q&&r)}},
 {tex:'(P\\vee Q)\\wedge\\neg R',f:function(p,q,r){return (p||q)&&!r}},
 {tex:'P\\Leftrightarrow(Q\\vee R)',f:function(p,q,r){return p===(q||r)}},
 {tex:'(P\\Rightarrow Q)\\vee(Q\\Rightarrow P)',f:function(p,q,r){return (!p||q)||(!q||p)}},
 {tex:'(P\\wedge\\neg P)\\wedge R',f:function(p,q,r){return (p&&!p)&&r}}];
function cubeCount(i){var c=0;for(var v=0;v<8;v++)if(ASSERT[i].f(!!(v&1),!!(v&2),!!(v&4)))c++;return c}
var W21=win(600,40,640,480,0,1,0,1),P21=null;
function p21(){return P3(W21.x,W21.y,W21.w,W21.h,185,[0,0,0],P.cam)}
function vtx(v){return[(v&1)-.5,((v>>1)&1)-.5,((v>>2)&1)-.5]}
var W22=win(600,40,640,480,0,16,0,12);
var inC=inD;
var W23=win(600,40,640,480,-3,3,-6,10);
function f23(i,x){return i===0?x*x:i===1?x*x*x:i===2?Math.abs(x):i===3?-x:Math.floor(x+1e-9)}
function cex23(i){for(var a=-3;a<=3;a+=.25)for(var b=a;b<=3;b+=.25)if(f23(i,a)>f23(i,b)+1e-9)return[a,b];return null}
var W24=win(620,60,420,420,0,1,0,1);
function qa(r){var N=100,fe=true,ef=false;for(var i=0;i<=N&&fe;i++){var x=i/N,ok=false;for(var j=0;j<=N&&!ok;j++)if(Math.abs(x-j/N)<=r+1e-9)ok=true;if(!ok)fe=false}
  for(var j2=0;j2<=N&&!ef;j2++){var all2=true;for(var i2=0;i2<=N;i2++)if(Math.abs(i2/N-j2/N)>r+1e-9){all2=false;break}if(all2)ef=true}return{fe:fe,ef:ef}}
var CELL=30,OX=660,OY=100;

S=[
{title:'Cube des assertions',hint:'Interactif : glissez dans le vide pour tourner le cube ; touchez un sommet pour choisir (P, Q, R).',
 init:function(){return{cam:{yaw:-.42,pitch:.36},f:0,sel:5}},
 sel:[{k:'f',tex:true,opts:ASSERT.map(function(a,i){return[i,a.tex]})}],selRows:2,
 steps:[
  {hd:'1 · Une valuation = un sommet',f:function(){var v=P.sel,p=v&1,q=(v>>1)&1,r=(v>>2)&1,val=ASSERT[P.f].f(!!p,!!q,!!r);
    return[{t:ASSERT[P.f].tex,c:AMB},{t:'(P,Q,R)=('+p+','+q+','+r+')\\quad(1=\\text{vrai})',c:MUT},{t:'\\text{Valeur : }'+VF(val),c:val?GRN:RED}]}},
  {hd:'2 · Compter les sommets verts',f:function(){var c=cubeCount(P.f);return[{t:c+'\\ \\text{sommets verts sur }8',c:GRN},{h:1,t:c===8?'Tautologie : vraie pour toute valuation.':c===0?'Contradiction : fausse partout.':'Ni tautologie ni contradiction.',c:c===8?GRN:MUT}]}},
  {hd:'3 · Négation = échange des couleurs',f:function(){var c=cubeCount(P.f);return[{t:'\\neg\\bigl('+ASSERT[P.f].tex+'\\bigr):\\ '+(8-c)+'\\ \\text{sommets verts}',c:RED},{h:1,t:'Les sommets verts de $\\neg A$ sont les rouges de $A$.',c:MUT}]}}],
 draw:function(){var p3=p21(),fs=[];pan(W21);
  var F=[[0,1,3,2],[4,5,7,6],[0,1,5,4],[2,3,7,6],[0,2,6,4],[1,3,7,5]];F.forEach(function(q){fs.push({pts:q.map(function(v){return vtx(v)}),f:[120,150,190],a:.13,s:'rgba(143,166,196,.6)'})});flush(fs,p3);
  var E=[];for(var v=0;v<8;v++)for(var b=0;b<3;b++){if(!(v&(1<<b)))E.push([v,v|(1<<b)])}
  E.forEach(function(e){var a=p3.pr.apply(p3,vtx(e[0])),c=p3.pr.apply(p3,vtx(e[1]));seg(a.X,a.Y,c.X,c.Y,'#5f7ba3',2)});
  var vs=[];for(v=0;v<8;v++){var q=p3.pr.apply(p3,vtx(v));vs.push({v:v,X:q.X,Y:q.Y,d:q.d})}vs.sort(function(a,b){return b.d-a.d});
  vs.forEach(function(o){var val=ASSERT[P.f].f(!!(o.v&1),!!(o.v&2),!!(o.v&4));dot(o.X,o.Y,17,val?GRN:RED);if(o.v===P.sel){ctx.globalAlpha=.5+.5*Math.sin(TT*4);ring(o.X,o.Y,24,AMB,3,[5,4]);ctx.globalAlpha=1}
    txt(String(o.v&1)+String((o.v>>1)&1)+String((o.v>>2)&1),o.X,o.Y,'#0d1117',14,'center')});
  var ax=[[1,0,0,'P'],[0,1,0,'Q'],[0,0,1,'R']];ax.forEach(function(a){var b=p3.pr(-.5+a[0]*1.25,-.5+a[1]*1.25,-.5+a[2]*1.25),o=p3.pr(-.5,-.5,-.5);arrow(o.X,o.Y,b.X,b.Y,AMB,2);txt(a[3],b.X+(b.X>o.X?10:-10),b.Y-8,AMB,20,'center')});
  txt('\u25cf vrai   \u25cf faux  (sommet = (P,Q,R), 1 = vrai)',W21.x+12,W21.y+W21.h-16,MUT,16,'left');unpan()},
 hit:function(x,y){var p3=p21(),best=null,bd=26;for(var v=0;v<8;v++){var q=p3.pr.apply(p3,vtx(v)),d=Math.hypot(q.X-x,q.Y-y);if(d<bd){bd=d;best=v}}
  if(best!==null){var bv=best;return{cur:'pointer',start:function(){P.sel=bv}}}return rotHit(W21,P.cam)(x,y)}},

{title:'Implication et inclusion',hint:'Interactif : glissez les centres, les poignées de rayon et le point x ; cherchez un contre-exemple.',
 init:function(){return{p:{x:7,y:6,r:2.4},q:{x:8.5,y:6,r:4.5},x:{x:5.5,y:6.6}}},
 steps:[
  {hd:'1 · Table de vérité de P ⇒ Q',f:function(){return[{tb:[['P','Q','P\\Rightarrow Q'],['\\mathrm V','\\mathrm V','\\mathrm V'],['\\mathrm V','\\mathrm F','\\mathrm F'],['\\mathrm F','\\mathrm V','\\mathrm V'],['\\mathrm F','\\mathrm F','\\mathrm V']]}]}},
  {hd:'2 · Pour le point x choisi',f:function(){var a=inC(P.p,P.x.x,P.x.y),b=inC(P.q,P.x.x,P.x.y);return[{t:'x\\in P:\\ '+VF(a),c:AMB},{t:'x\\in Q:\\ '+VF(b),c:BLU},{t:'P(x)\\Rightarrow Q(x):\\ '+VF(!a||b),c:(!a||b)?GRN:RED}]}},
  {hd:'3 · Pour tous les x',f:function(){var d=Math.hypot(P.p.x-P.q.x,P.p.y-P.q.y),ok=d+P.p.r<=P.q.r+1e-9;
    return[{t:'\\forall x,\\ (P(x)\\Rightarrow Q(x))\\iff P\\subset Q',c:INK},{t:ok?'P\\subset Q:\\ \\text{implication vraie}':'\\exists x\\in P\\setminus Q:\\ \\text{contre-exemple}',c:ok?GRN:RED},
      {h:1,t:'Contraposée : $\\neg Q\\Rightarrow\\neg P$ ⇔ $Q^c\\subset P^c$ ; même verdict.',c:MUT}]}}],
 fix:function(){['p','q'].forEach(function(k){P[k].x=clamp(P[k].x,1,15);P[k].y=clamp(P[k].y,1,11);P[k].r=clamp(P[k].r,.8,5)});P.x.x=clamp(P.x.x,.2,15.8);P.x.y=clamp(P.x.y,.2,11.8)},
 draw:function(){pan(W22);function circ(c,col,nm){var X=W22.X(c.x),Y=W22.Y(c.y),R=c.r/16*W22.w;ctx.fillStyle=col+'33';ctx.beginPath();ctx.arc(X,Y,R,0,7);ctx.fill();ring(X,Y,R,col,3);txt(nm,X,Y-R*.55,col,26,'center')}
  circ(P.q,BLU,'Q');circ(P.p,AMB,'P');
  var d=Math.hypot(P.p.x-P.q.x,P.p.y-P.q.y),ux=d>1e-9?(P.p.x-P.q.x)/d:1,uy=d>1e-9?(P.p.y-P.q.y)/d:0,cex={x:P.p.x+P.p.r*ux,y:P.p.y+P.p.r*uy};
  if(!(Math.hypot(cex.x-P.q.x,cex.y-P.q.y)<=P.q.r+1e-9)){dot(W22.X(cex.x),W22.Y(cex.y),7,RED);txt('contre-exemple',W22.X(cex.x),W22.Y(cex.y)-16,RED,16,'center')}
  var a=inC(P.p,P.x.x,P.x.y),b=inC(P.q,P.x.x,P.x.y);handle(W22.X(P.x.x),W22.Y(P.x.y),(!a||b)?GRN:RED,7);txt('x',W22.X(P.x.x)+14,W22.Y(P.x.y)-14,INK,20,'left');
  [['p',AMB,-.8],['q',BLU,2.3]].forEach(function(o){var c=P[o[0]];handle(W22.X(c.x),W22.Y(c.y)-0,o[1],5);var ang=o[2];handle(W22.X(c.x+c.r*Math.cos(ang)),W22.Y(c.y+c.r*Math.sin(ang)),o[1],6)});unpan()},
 hit:function(x,y){var o=[['p',-.8],['q',2.3]];
  if(nr(x,y,W22.X(P.x.x),W22.Y(P.x.y),20))return{cur:'move',move:function(X,Y){P.x.x=W22.iX(X);P.x.y=W22.iY(Y)}};
  for(var i=0;i<2;i++){var c=P[o[i][0]],ang=o[i][1];
    if(nr(x,y,W22.X(c.x+c.r*Math.cos(ang)),W22.Y(c.y+c.r*Math.sin(ang)),20)){var cc=c;return{cur:'nesw-resize',move:function(X,Y){cc.r=Math.hypot(W22.iX(X)-cc.x,W22.iY(Y)-cc.y)}}}}
  for(i=0;i<2;i++){c=P[o[i][0]];if(nr(x,y,W22.X(c.x),W22.Y(c.y),20)){var cc2=c;return{cur:'move',move:function(X,Y){cc2.x=W22.iX(X);cc2.y=W22.iY(Y)}}}}return null}},

{title:'Monotonie, contre-exemple',hint:'Interactif : glissez les points x (ambre) et y (bleu) le long de la courbe ; choisissez f.',
 init:function(){return{f:0,x:-2,y:1}},
 sel:[{k:'f',tex:true,opts:[[0,'x^2'],[1,'x^3'],[2,'|x|'],[3,'-x'],[4,'\\lfloor x\\rfloor']]}],
 steps:[
  {hd:'1 · L’assertion',f:function(){return[{t:'\\forall x\\in\\mathbb R,\\ \\forall y\\in\\mathbb R,',c:INK},{t:'(x\\leq y)\\Rightarrow\\bigl(f(x)\\leq f(y)\\bigr)',c:AMB}]}},
  {hd:'2 · Pour ce couple (x, y)',f:function(){var fx=f23(P.f,P.x),fy=f23(P.f,P.y),h=P.x<=P.y,c=fx<=fy;
    return[{t:'x='+nf(P.x)+',\\ y='+nf(P.y)},{t:'f(x)='+nf(fx)+',\\ f(y)='+nf(fy),c:MUT},{t:h?(c?'x\\leq y\\ \\text{et}\\ f(x)\\leq f(y)':'x\\leq y\\ \\text{mais}\\ f(x)>f(y)'):'x>y:\\ \\text{hypothèse fausse, implication vraie}',c:(h&&!c)?RED:GRN}]}},
  {hd:'3 · Négation et contre-exemple',f:function(){var c=cex23(P.f);return[{t:'\\exists x,\\exists y,\\ x\\leq y\\ \\wedge\\ f(x)>f(y)',c:INK},
    c?{t:'\\text{Contre-exemple : }x='+nf(c[0])+',\\ y='+nf(c[1]),c:RED}:{t:'\\text{Aucun contre-exemple sur la grille}',c:GRN},{h:1,t:'Un seul contre-exemple suffit à réfuter ∀ ; aucun exemple ne prouve ∀.',c:MUT}]}}],
 fix:function(){P.x=clamp(P.x,-3,3);P.y=clamp(P.y,-3,3)},
 draw:function(){var i=P.f;pan(W23);grid(W23,1,1,2);
  ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();var st=false;for(var k=0;k<=240;k++){var xx=-3+6*k/240,yy=f23(i,xx);if(i===4&&k>0&&f23(4,-3+6*(k-1)/240)!==yy){st=false}if(!st){ctx.moveTo(W23.X(xx),W23.Y(yy));st=true}else ctx.lineTo(W23.X(xx),W23.Y(yy))}ctx.stroke();
  var c=cex23(i);if(c){[c[0],c[1]].forEach(function(u){ring(W23.X(u),W23.Y(f23(i,u)),9,RED,2,[3,3])});txt('couple en défaut',W23.x+W23.w-10,W23.y+20,RED,16,'right')}
  var ok=P.x<=P.y,bad=ok&&f23(i,P.x)>f23(i,P.y)+1e-9;
  seg(W23.X(P.x),W23.Y(0),W23.X(P.x),W23.Y(f23(i,P.x)),AMB,1.5,[4,4]);seg(W23.X(P.y),W23.Y(0),W23.X(P.y),W23.Y(f23(i,P.y)),BLU,1.5,[4,4]);
  seg(W23.x,W23.Y(f23(i,P.x)),W23.x+W23.w,W23.Y(f23(i,P.x)),'rgba(232,163,61,.35)',1.5,[4,4]);seg(W23.x,W23.Y(f23(i,P.y)),W23.x+W23.w,W23.Y(f23(i,P.y)),'rgba(106,169,255,.35)',1.5,[4,4]);
  handle(W23.X(P.x),W23.Y(f23(i,P.x)),AMB);handle(W23.X(P.y),W23.Y(f23(i,P.y)),BLU);
  txt(bad?'contre-exemple : x \u2264 y mais f(x) > f(y)':(ok?'x \u2264 y : f(x) \u2264 f(y) ici':'x > y : l\u2019hypothèse est fausse'),W23.x+12,W23.y+W23.h-16,bad?RED:GRN,18,'left');unpan()},
 hit:function(x,y){var i=P.f;
  if(nr(x,y,W23.X(P.x),W23.Y(f23(i,P.x)),24))return{cur:'ew-resize',move:function(X){P.x=rs(W23.iX(X),.25,-3,3)}};
  if(nr(x,y,W23.X(P.y),W23.Y(f23(i,P.y)),24))return{cur:'ew-resize',move:function(X){P.y=rs(W23.iX(X),.25,-3,3)}};return null}},

{title:'Ordre des quantificateurs',hint:'Interactif : glissez la poignée du bord de bande (r), la droite verticale (x₀) et l’horizontale (y₀).',
 init:function(){return{r:.3,x0:.7,y0:.4}},
 sl:[{k:'r',l:'r',min:0,max:1,step:.025}],
 steps:[
  {hd:'1 · Deux assertions',f:function(){return[{t:'\\forall x\\in[0,1],\\ \\exists y\\in[0,1],\\ |x-y|\\leq r',c:AMB},{t:'\\exists y\\in[0,1],\\ \\forall x\\in[0,1],\\ |x-y|\\leq r',c:BLU}]}},
  {hd:'2 · Vraies ou fausses ?',f:function(){var q=qa(P.r);return[{t:'r='+nf(P.r,3)},{t:'\\forall x\\,\\exists y:\\ '+VF(q.fe),c:q.fe?GRN:RED},{t:'\\exists y\\,\\forall x:\\ '+VF(q.ef),c:q.ef?GRN:RED}]}},
  {hd:'3 · Négation et conséquence',f:function(){return[{t:'\\neg(\\exists y\\,\\forall x\\ \\ldots)\\iff\\forall y\\,\\exists x,\\ |x-y|>r',c:INK},{t:'\\exists y\\forall x\\ \\Rightarrow\\ \\forall x\\exists y\\ \\text{ (réciproque non valable en général)}',c:GRN},{h:1,t:'Seuil : $\\exists y\\,\\forall x$ est vraie ⇔ $r\\geq\\tfrac12$.',c:MUT}]}}],
 fix:function(){P.r=clamp(P.r,0,1);P.x0=clamp(P.x0,0,1);P.y0=clamp(P.y0,0,1)},
 draw:function(){var r=P.r,w=W24;pan(w);grid(w,.25,.25,.5);
  ctx.fillStyle='rgba(95,208,160,.22)';ctx.beginPath();
  ctx.moveTo(w.X(0),w.Y(Math.min(1,r)));ctx.lineTo(w.X(Math.max(0,1-r)),w.Y(1));ctx.lineTo(w.X(1),w.Y(1));ctx.lineTo(w.X(1),w.Y(Math.max(0,1-r)));ctx.lineTo(w.X(Math.min(1,r)),w.Y(0));ctx.lineTo(w.X(0),w.Y(0));ctx.closePath();ctx.fill();
  seg(w.X(0),w.Y(r),w.X(1-r),w.Y(1),GRN,2);seg(w.X(r),w.Y(0),w.X(1),w.Y(1-r),GRN,2);
  var lo=Math.max(0,P.x0-r),hi=Math.min(1,P.x0+r);seg(w.X(P.x0),w.Y(0),w.X(P.x0),w.Y(1),'rgba(232,163,61,.4)',1.5,[5,4]);seg(w.X(P.x0),w.Y(lo),w.X(P.x0),w.Y(hi),AMB,6);
  var lo2=Math.max(0,P.y0-r),hi2=Math.min(1,P.y0+r);seg(w.X(0),w.Y(P.y0),w.X(1),w.Y(P.y0),'rgba(106,169,255,.4)',1.5,[5,4]);seg(w.X(lo2),w.Y(P.y0),w.X(hi2),w.Y(P.y0),BLU,6);
  if(r>=.5-1e-9){seg(w.X(0),w.Y(.5),w.X(1),w.Y(.5),GRN,3,[10,6]);txt('y = ½ convient pour tout x',w.x+10,w.Y(.5)-12,GRN,16,'left')}
  txt('x',w.x+w.w-12,w.y+w.h-12,MUT,18,'center');txt('y',w.x+12,w.y+12,MUT,18,'center');
  unpan();handle(w.X(1),w.Y(1-r),GRN);handle(w.X(P.x0),w.Y(0),AMB);handle(w.X(0),w.Y(P.y0),BLU);
  txt('x₀ = '+nf(P.x0,2).replace('{,}',','),1060,150,AMB,20,'left');txt('{y : |x₀−y| ≤ r}',1060,180,AMB,17,'left');txt('= ['+nf(lo,2).replace('{,}',',')+' ; '+nf(hi,2).replace('{,}',',')+']',1060,206,AMB,17,'left');
  txt('y₀ = '+nf(P.y0,2).replace('{,}',','),1060,290,BLU,20,'left');txt('{x : |x−y₀| ≤ r}',1060,320,BLU,17,'left');txt('= ['+nf(lo2,2).replace('{,}',',')+' ; '+nf(hi2,2).replace('{,}',',')+']',1060,346,BLU,17,'left')},
 hit:function(x,y){var w=W24;
  if(nr(x,y,w.X(1),w.Y(1-P.r),22))return{cur:'ns-resize',move:function(X,Y){P.r=rs(1-w.iY(Y),.025,0,1)}};
  if(nr(x,y,w.X(P.x0),w.Y(0),22))return{cur:'ew-resize',move:function(X){P.x0=rs(w.iX(X),.05,0,1)}};
  if(nr(x,y,w.X(0),w.Y(P.y0),22))return{cur:'ns-resize',move:function(X,Y){P.y0=rs(w.iY(Y),.05,0,1)}};return null}}
];
