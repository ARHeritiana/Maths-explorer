// ===== DECK 6: Applications, image directe et réciproque =====
function itex(a){if(!a.length)return '\\varnothing';return a.map(function(q){return Math.abs(q[1]-q[0])<1e-9?'\\{'+nf(q[0])+'\\}':'['+nf(q[0])+'\\,;'+nf(q[1])+']'}).join('\\cup ')}
function img2(a){return inorm(a.map(function(q){var l=q[0]-1,r=q[1]-1,hi=Math.max(l*l,r*r),lo=(l<=0&&r>=0)?0:Math.min(l*l,r*r);return[lo+2,hi+2]}))}
function pre2(b){var o=[];b.forEach(function(q){var c=q[0]-2,d=q[1]-2;if(d<0)return;var sd=Math.sqrt(d);if(c<=0)o.push([1-sd,1+sd]);else{var sc=Math.sqrt(c);o.push([1-sd,1-sc]);o.push([1+sc,1+sd])}});return inorm(o)}
function img3(a){return inorm(a.map(function(q){return[Math.pow(q[0],3),Math.pow(q[1],3)]}))}
function pre3(b){return inorm(b.map(function(q){return[Math.cbrt(q[0]),Math.cbrt(q[1])]}))}
function eqs(a,b){if(a.length!==b.length)return false;for(var i=0;i<a.length;i++)if(Math.abs(a[i][0]-b[i][0])>1e-9||Math.abs(a[i][1]-b[i][1])>1e-9)return false;return true}
function sub6(a,b){return a.every(function(q){return b.some(function(r){return q[0]>=r[0]-1e-9&&q[1]<=r[1]+1e-9})})}
var W61=win(600,40,640,480,-3,3,-2,10);
var W62=win(600,40,640,480,-3,3,-3,9);
var W64=win(620,60,420,420,0,1,0,1);
S=[
{title:'Composition',hint:'Interactif : glissez le point x sur l’axe (ou le curseur) ; comparez f∘g et g∘f.',
 init:function(){return{x:1}},
 sl:[{k:'x',l:'x',min:-3,max:3,step:.25}],
 steps:[
  {hd:'1 · Deux applications',f:function(){return[{t:'f(x)=x^2-1,\\qquad g(x)=x+2',c:INK}]}},
  {hd:'2 · Deux composées',f:function(){return[{t:'(f\\circ g)(x)=(x+2)^2-1=x^2+4x+3',c:AMB},{t:'(g\\circ f)(x)=x^2+1',c:BLU}]}},
  {hd:'3 · f∘g = g∘f ?',f:function(){var x=P.x,a=Math.pow(x+2,2)-1,b=x*x+1;return[{t:'x='+nf(x)+':\\ (f\\circ g)(x)='+nf(a)+',\\ (g\\circ f)(x)='+nf(b),c:a===b?GRN:RED},{t:'x^2+4x+3=x^2+1\\iff 4x+2=0',c:INK},{h:1,t:'Égalité seulement pour $x=-1/2$ : $f\\circ g\\neq g\\circ f$.',c:MUT}]}}],
 fix:function(){P.x=clamp(P.x,-3,3)},
 draw:function(){var w=W61,x=P.x;pan(w);grid(w,1,1,2);
  function cv(fn,col,lw,al){ctx.globalAlpha=al;ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.beginPath();for(var i=0;i<=120;i++){var u=-3+6*i/120;if(i)ctx.lineTo(w.X(u),w.Y(fn(u)));else ctx.moveTo(w.X(u),w.Y(fn(u)))}ctx.stroke();ctx.globalAlpha=1}
  cv(function(u){return u*u-1},AMB,2,.45);cv(function(u){return u+2},BLU,2,.45);cv(function(u){return Math.pow(u+2,2)-1},AMB,4,1);cv(function(u){return u*u+1},BLU,4,1);
  [-.5].forEach(function(u){dot(w.X(u),w.Y(u*u+1),6,GRN)});
  var gx=x+2,a=gx*gx-1,b=x*x+1;seg(w.X(x),w.Y(0),w.X(x),w.Y(Math.max(a,b)),'rgba(244,241,234,.35)',1.5,[4,4]);dot(w.X(x),w.Y(gx),5,'rgba(106,169,255,.8)');dot(w.X(x),w.Y(a),7,AMB);dot(w.X(x),w.Y(b),7,BLU);
  txt('f∘g',w.X(.55),w.Y(9.4),AMB,18,'left');txt('g∘f',w.X(1.7),w.Y(7.6),BLU,18,'left');txt('(points verts : f∘g = g∘f)',w.x+10,w.y+w.h-14,GRN,16,'left');
  handle(w.X(x),w.Y(0),INK);unpan()},
 hit:function(x,y){if(nr(x,y,W61.X(P.x),W61.Y(0),24))return{cur:'ew-resize',move:function(X){P.x=rs(W61.iX(X),.25,-3,3)}};return null}},

{title:'Image directe et réciproque',hint:'Interactif : glissez A sur l’axe des x (ambre) et B sur l’axe des y (bleu) ; choisissez f.',
 init:function(){return{f:0,A:[-2,2],B:[3,6]}},
 sel:[{k:'f',tex:true,opts:[[0,'f(x)=(x-1)^2+2'],[1,'f(x)=x^3']]}],
 steps:[
  {hd:'1 · Définitions',f:function(){return[{t:'f(A)=\\{f(x)\\mid x\\in A\\}',c:AMB},{t:'f^{-1}(B)=\\{x\\mid f(x)\\in B\\}',c:BLU}]}},
  {hd:'2 · Image directe',f:function(){var A=[[P.A[0],P.A[1]]],I=P.f?img3(A):img2(A);return[{t:'A='+itex(A),c:AMB},{t:'f(A)='+itex(I),c:GRN}]}},
  {hd:'3 · Image réciproque',f:function(){var B=[[P.B[0],P.B[1]]],R=P.f?pre3(B):pre2(B);return[{t:'B='+itex(B),c:BLU},{t:'f^{-1}(B)='+itex(R),c:GRN},{h:1,t:P.f?'$x\\mapsto x^3$ est bijective : un seul antécédent.':'$x\\mapsto (x-1)^2+2$ : deux, un ou aucun antécédent selon la sortie (arrondis à 0,01).',c:MUT}]}}],
 fix:function(){P.A[0]=Math.min(P.A[0],P.A[1]);P.B[0]=Math.min(P.B[0],P.B[1])},
 draw:function(){var w=W62,fn=P.f?function(u){return u*u*u}:function(u){return (u-1)*(u-1)+2};pan(w);grid(w,1,1,2);
  ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();for(var i=0;i<=200;i++){var u=-3+6*i/200;if(i)ctx.lineTo(w.X(u),w.Y(fn(u)));else ctx.moveTo(w.X(u),w.Y(fn(u)))}ctx.stroke();
  var A=[[P.A[0],P.A[1]]],B=[[P.B[0],P.B[1]]],I=P.f?img3(A):img2(A),R=P.f?pre3(B):pre2(B);
  ctx.fillStyle='rgba(232,163,61,.15)';ctx.fillRect(w.X(P.A[0]),w.y,w.X(P.A[1])-w.X(P.A[0]),w.h);ctx.fillStyle='rgba(106,169,255,.15)';ctx.fillRect(w.x,w.Y(P.B[1]),w.w,w.Y(P.B[0])-w.Y(P.B[1]));
  P.A.forEach(function(a){seg(w.X(a),w.Y(0),w.X(a),w.Y(fn(a)),AMB,1.5,[5,4]);seg(w.X(a),w.Y(fn(a)),w.X(0),w.Y(fn(a)),AMB,1.5,[5,4])});
  P.B.forEach(function(b){seg(w.X(0),w.Y(b),w.x+w.w,w.Y(b),'rgba(106,169,255,.5)',1.2,[5,4])});
  R.forEach(function(q){seg(w.X(q[0]),w.Y(0)+0,w.X(q[1]),w.Y(0),GRN,7)});I.forEach(function(q){seg(w.X(0),w.Y(q[0]),w.X(0),w.Y(q[1]),GRN,7)});
  seg(w.X(P.A[0]),w.Y(0),w.X(P.A[1]),w.Y(0),AMB,4);seg(w.X(0),w.Y(P.B[0]),w.X(0),w.Y(P.B[1]),BLU,4);
  handle(w.X(P.A[0]),w.Y(0),AMB);handle(w.X(P.A[1]),w.Y(0),AMB);handle(w.X(0),w.Y(P.B[0]),BLU);handle(w.X(0),w.Y(P.B[1]),BLU);
  txt('A',w.X((P.A[0]+P.A[1])/2),w.Y(0)+20,AMB,20,'center');txt('B',w.X(0)+16,w.Y((P.B[0]+P.B[1])/2),BLU,20,'left');
  txt('vert : f(A) sur l’axe y, f⁻¹(B) sur l’axe x',w.x+10,w.y+w.h-14,GRN,16,'left');unpan()},
 hit:function(x,y){var w=W62;for(var i=0;i<2;i++){if(nr(x,y,w.X(P.A[i]),w.Y(0),22)){var ii=i;return{cur:'ew-resize',move:function(X){P.A[ii]=rs(w.iX(X),.5,-3,3)}}}}
  for(i=0;i<2;i++){if(nr(x,y,w.X(0),w.Y(P.B[i]),22)){var jj=i;return{cur:'ns-resize',move:function(X,Y){P.B[jj]=rs(w.iY(Y),.5,-3,9)}}}}return null}},

{title:'Compatibilités',hint:'Interactif : glissez les bords des intervalles ; cherchez quand l’inclusion est stricte.',
 init:function(){return{m:0,A:[-2,0],A2:[2,3],B:[3,6],B2:[4,8]}},
 sel:[{k:'m',tex:true,opts:[[0,'f(A\\cap A\')\\ \\text{vs}\\ f(A)\\cap f(A\')'],[1,'f^{-1}(B\\cap B\')\\ \\text{vs}\\ f^{-1}(B)\\cap f^{-1}(B\')']]}],
 steps:[
  {hd:'1 · Ce qu’on sait démontrer',f:function(){return P.m===0?[{t:'f(A\\cap A\')\\subset f(A)\\cap f(A\')',c:GRN},{t:'f(A\\cup A\')=f(A)\\cup f(A\')',c:GRN}]:[{t:'f^{-1}(B\\cap B\')=f^{-1}(B)\\cap f^{-1}(B\')',c:GRN},{t:'f^{-1}(B\\cup B\')=f^{-1}(B)\\cup f^{-1}(B\')',c:GRN}]}},
  {hd:'2 · Avec f(x) = (x−1)²+2 et vos intervalles',f:function(){if(P.m===0){var A=[P.A],A2=[P.A2],I=iint(A,A2),L=img2(I),R=iint(img2(A),img2(A2));return[{t:'A='+itex(A)+',\\ A\'='+itex(A2),c:MUT},{t:'A\\cap A\'='+itex(I)+'\\Rightarrow f(A\\cap A\')='+itex(L),c:GRN},{t:'f(A)\\cap f(A\')='+itex(R),c:RED}]}
    var B=[P.B],B2=[P.B2],J=iint(B,B2),L2=pre2(J),R2=iint(pre2(B),pre2(B2));return[{t:'B='+itex(B)+',\\ B\'='+itex(B2),c:MUT},{t:'f^{-1}(B\\cap B\')='+itex(L2),c:GRN},{t:'f^{-1}(B)\\cap f^{-1}(B\')='+itex(R2),c:AMB}]}},
  {hd:'3 · Verdict',f:function(){if(P.m===0){var I=iint([P.A],[P.A2]),L=img2(I),R=iint(img2([P.A]),img2([P.A2])),eq=eqs(L,R);return[{t:eq?'f(A\\cap A\')=f(A)\\cap f(A\')':'f(A\\cap A\')\\subsetneq f(A)\\cap f(A\')',c:eq?AMB:RED},{h:1,t:eq?'Égalité ici. Elle est garantie si $f$ est injective.':'Inclusion stricte : $f$ n’est pas injective ($f(1-x)=f(1+x)$).',c:MUT}]}
    var L2=pre2(iint([P.B],[P.B2])),R2=iint(pre2([P.B]),pre2([P.B2]));return[{t:eqs(L2,R2)?'\\text{Égalité (toujours)}':'\\text{Écart ?}',c:eqs(L2,R2)?GRN:RED},{h:1,t:'Pour l’image réciproque, l’égalité vaut pour toute application.',c:MUT}]}}],
 fix:function(){['A','A2','B','B2'].forEach(function(k){P[k][0]=Math.min(P[k][0],P[k][1])})},
 draw:function(){var w=W62;pan(w);grid(w,1,1,2);ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();for(var i=0;i<=200;i++){var u=-3+6*i/200;if(i)ctx.lineTo(w.X(u),w.Y((u-1)*(u-1)+2));else ctx.moveTo(w.X(u),w.Y((u-1)*(u-1)+2))}ctx.stroke();
  function hbar(a,y,col,lw){if(Math.abs(a[1]-a[0])<1e-9)dot(w.X(a[0]),w.Y(y),7,col);else seg(w.X(a[0]),w.Y(y),w.X(a[1]),w.Y(y),col,lw||5)}
  function vbar(a,x,col,lw){if(Math.abs(a[1]-a[0])<1e-9)dot(w.X(x),w.Y(a[0]),7,col);else seg(w.X(x),w.Y(a[0]),w.X(x),w.Y(a[1]),col,lw||5)}
  function hset(s,y,col){s.forEach(function(q){hbar(q,y,col,6)})}
  function vset(s,x,col){s.forEach(function(q){vbar(q,x,col,6)})}
  if(P.m===0){var A=[P.A],A2=[P.A2],I=iint(A,A2);hbar(P.A,-.5,AMB);hbar(P.A2,-1,BLU);hset(I,-1.5,GRN);
    vset(img2(A),-2.7,AMB);vset(img2(A2),-2.5,BLU);vset(img2(I),-2.3,GRN);vset(iint(img2(A),img2(A2)),-2.1,RED);
    txt('A',w.X(P.A[0])-10,w.Y(-.5),AMB,17,'right');txt('A′',w.X(P.A2[0])-10,w.Y(-1),BLU,17,'right');txt('A∩A′',w.X(I.length?I[0][0]:0)-10,w.Y(-1.5),GRN,15,'right');
    txt('f(A)',w.x+10,w.y+18,AMB,16,'left');txt('f(A′)',w.x+70,w.y+18,BLU,16,'left');txt('f(A∩A′)',w.x+138,w.y+18,GRN,16,'left');txt('f(A)∩f(A′)',w.x+230,w.y+18,RED,16,'left');
    handle(w.X(P.A[0]),w.Y(-.5),AMB,6);handle(w.X(P.A[1]),w.Y(-.5),AMB,6);handle(w.X(P.A2[0]),w.Y(-1),BLU,6);handle(w.X(P.A2[1]),w.Y(-1),BLU,6)}
  else{var B=[P.B],B2=[P.B2],J=iint(B,B2);vbar(P.B,2.4,AMB);vbar(P.B2,2.7,BLU);vset(J,2.1,GRN);
    hset(pre2(B),-1.0,AMB);hset(pre2(B2),-1.3,BLU);hset(pre2(J),-1.6,GRN);hset(iint(pre2(B),pre2(B2)),-1.9,RED);
    txt('f⁻¹(B)',w.x+10,w.y+18,AMB,16,'left');txt('f⁻¹(B′)',w.x+90,w.y+18,BLU,16,'left');txt('f⁻¹(B∩B′)',w.x+180,w.y+18,GRN,16,'left');txt('f⁻¹(B)∩f⁻¹(B′)',w.x+300,w.y+18,RED,16,'left');
    handle(w.X(2.4),w.Y(P.B[0]),AMB,6);handle(w.X(2.4),w.Y(P.B[1]),AMB,6);handle(w.X(2.7),w.Y(P.B2[0]),BLU,6);handle(w.X(2.7),w.Y(P.B2[1]),BLU,6)}
  unpan()},
 hit:function(x,y){var w=W62;
  if(P.m===0){var spec=[['A',-.5],['A2',-1]];for(var s=0;s<2;s++)for(var e=0;e<2;e++){if(nr(x,y,w.X(P[spec[s][0]][e]),w.Y(spec[s][1]),20)){var k=spec[s][0],ee=e;return{cur:'ew-resize',move:function(X){P[k][ee]=rs(w.iX(X),.5,-3,3)}}}}return null}
  var sp=[['B',2.4],['B2',2.7]];for(s=0;s<2;s++)for(e=0;e<2;e++){if(nr(x,y,w.X(sp[s][1]),w.Y(P[sp[s][0]][e]),20)){var k2=sp[s][0],e2=e;return{cur:'ns-resize',move:function(X,Y){P[k2][e2]=rs(w.iY(Y),.5,0,9)}}}}return null}},

{title:'Facture progressive',hint:'Déplacez la durée x ; comparez facture brute et facture finale après réduction.',
 init:function(){return{x:1}},
 sl:[{k:'x',l:'Durée x',min:0,max:4,step:.05}],
 steps:[
 {hd:'1 · Deux traitements',f:function(){return[{t:'c(x)=\\begin{cases}x+2&0\\leq x\\leq2\\\\2x&2<x\\leq4\\end{cases}',c:AMB},{h:1,t:'La réduction conserve les 5 premières unités, puis divise le surplus par deux.',c:MUT}]}},
 {hd:'2 · Suivre la facture',f:function(){var c=P.x<=2?P.x+2:2*P.x,q=c<=5?c:5+(c-5)/2;return[{t:'x='+nf(P.x)+',\\quad c(x)='+nf(c),c:AMB},{t:'q(x)=d(c(x))='+nf(q),c:GRN}]}},
 {hd:'3 · Les seuils transportés',f:function(){return[{t:'q(x)=\\begin{cases}x+2&x\\leq2\\\\2x&2<x\\leq5/2\\\\x+5/2&5/2<x\\leq4\\end{cases}',c:GRN},{h:1,t:'Le tarif change à 2 h ; la réduction débute à 2,5 h, car c(x) atteint 5.',c:MUT}]}}],
 draw:function(){var w=win(620,60,600,420,0,4,0,8);pan(w);grid(w,1,1,2);
 function cv(fn,col){ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();for(var i=0;i<=160;i++){var x=i/40,y=fn(x);if(i)ctx.lineTo(w.X(x),w.Y(y));else ctx.moveTo(w.X(x),w.Y(y))}ctx.stroke()}
 cv(function(x){return x<=2?x+2:2*x},AMB);cv(function(x){return x<=2?x+2:x<=2.5?2*x:x+2.5},GRN);
 [2,2.5].forEach(function(x){seg(w.X(x),w.Y(0),w.X(x),w.Y(8),MUT,1,[4,4])});
 var c=P.x<=2?P.x+2:2*P.x,q=c<=5?c:5+(c-5)/2;
 seg(w.X(P.x),w.Y(0),w.X(P.x),w.Y(c),MUT,1,[4,4]);dot(w.X(P.x),w.Y(c),7,AMB);dot(w.X(P.x),w.Y(q),7,GRN);handle(w.X(P.x),w.Y(0),INK);
 txt('ambre : brut ; vert : final',w.x+12,w.y+18,INK,18,'left');unpan()},
 hit:function(x,y){var w=win(620,60,600,420,0,4,0,8);if(nr(x,y,w.X(P.x),w.Y(0),24))return{cur:'ew-resize',move:function(X){P.x=rs(w.iX(X),.05,0,4)}};return null}}
];
