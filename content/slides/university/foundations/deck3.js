// ===== DECK 3: Ensembles =====
var W31=win(600,40,640,480,0,16,0,12);
var CIR=[{x:5.8,y:7.2,r:3.3},{x:10.2,y:7.2,r:3.3},{x:8,y:4.7,r:3.3}];
var EXPR=[
 {tex:'(A\\cup B)\\setminus C',f:function(a,b,c){return (a||b)&&!c}},
 {tex:'A\\cap B\\cap C',f:function(a,b,c){return a&&b&&c}},
 {tex:'(A\\setminus B)\\cup(B\\setminus A)',f:function(a,b,c){return a!==b}},
 {tex:'C\\setminus(A\\cup B)',f:function(a,b,c){return c&&!a&&!b}},
 {tex:'A\\cap(B\\setminus C)',f:function(a,b,c){return a&&b&&!c}},
 {tex:'(A\\cup C)\\setminus B',f:function(a,b,c){return (a||c)&&!b}}];
var TGT=[[0,3,6],[5,6,7,8],[1,3,5,7]];
function sig31(x,y){return[inD(CIR[0],x,y),inD(CIR[1],x,y),inD(CIR[2],x,y)]}
function setStr(a){return a.length?'\\{'+a.join(',')+'\\}':'\\varnothing'}
function sets31(){var s=[[],[],[]],all=[];for(var i=0;i<9;i++){var g=sig31(P.pos[i].x,P.pos[i].y);for(var k=0;k<3;k++)if(g[k])s[k].push(i)}return s}
function member31(i){return sig31(P.pos[i].x,P.pos[i].y)}
var SOL31=null;
function sol31(){if(SOL31)return SOL31;var placed=[],out=[];
  for(var i=0;i<9;i++){var want=[TGT[0].indexOf(i)>=0,TGT[1].indexOf(i)>=0,TGT[2].indexOf(i)>=0],best=null,bs=-1e9;
    for(var x=.8;x<=15.2;x+=.2)for(var y=.8;y<=11.2;y+=.2){var g=sig31(x,y);if(g[0]!==want[0]||g[1]!==want[1]||g[2]!==want[2])continue;
      var bd=3;CIR.forEach(function(c){bd=Math.min(bd,Math.abs(Math.hypot(x-c.x,y-c.y)-c.r))});bd=Math.min(bd,x-.2,15.8-x,y-.2,11.8-y);
      var dp=2;placed.forEach(function(p){dp=Math.min(dp,Math.hypot(x-p.x,y-p.y))});var sc=Math.min(bd,1.1)+1.2*Math.min(dp,1.6);if(sc>bs){bs=sc;best={x:x,y:y}}}
    placed.push(best);out.push(best)}
  SOL31=out;return out}
var SH31={};
function shade31(e){if(SH31[e])return SH31[e];var r=[],f=EXPR[e].f;for(var X=W31.x;X<W31.x+W31.w;X+=8)for(var Y=W31.y;Y<W31.y+W31.h;Y+=8){var g=sig31(W31.iX(X+4),W31.iY(Y+4));if(f(g[0],g[1],g[2]))r.push([X,Y])}SH31[e]=r;return r}

var WL=win(600,90,310,300,0,10,0,9.68),WR=win(930,90,310,300,0,10,0,9.68);
var LAW=[
 {l:'(A\\cap B)^c',r:'A^c\\cup B^c',lf:function(a,b){return !(a&&b)},rf:function(a,b){return !a||!b}},
 {l:'(A\\cup B)^c',r:'A^c\\cap B^c',lf:function(a,b){return !(a||b)},rf:function(a,b){return !a&&!b}},
 {l:'A\\cup B',r:'B',lf:function(a,b){return a||b},rf:function(a,b){return b}}];
function cmp32(){var mm=0,ab=0,tot=0;for(var X=0;X<10;X+=.2)for(var Y=0;Y<9.68;Y+=.2){var a=inD(P.A,X,Y),b=inD(P.B,X,Y),L=LAW[P.law].lf(a,b),R=LAW[P.law].rf(a,b);tot++;if(L!==R)mm++;if(a&&!b)ab++}return{mm:mm,ab:ab,tot:tot}}
var SH32={};
function shade32(w,fn,key){if(SH32[key])return SH32[key];var r=[];for(var X=w.x;X<w.x+w.w;X+=6)for(var Y=w.y;Y<w.y+w.h;Y+=6){var u=w.iX(X+3),v=w.iY(Y+3);if(fn(inD(P.A,u,v),inD(P.B,u,v)))r.push([X-w.x,Y-w.y])}SH32[key]=r;if(Object.keys(SH32).length>300)SH32={};return r}

var W33=win(600,40,640,480,0,1,0,1);
function p33(){return P3(W33.x,W33.y,W33.w,W33.h,P.n===4?180:P.n===3?170:200,[0,0,0],P.cam)}
function sub(mask,n){var L='abcd',a=[];for(var i=0;i<n;i++)if(mask&(1<<i))a.push(L[i]);return a}
function subTex(mask,n){var a=sub(mask,n);return a.length?'\\{'+a.join(',')+'\\}':'\\varnothing'}
function subTxt(mask,n){var a=sub(mask,n);return a.length?'{'+a.join(',')+'}':'∅'}
function pts33(){var n=P.n,o=[];for(var m=0;m<(1<<n);m++){var v=[0,0,0,0];for(var i=0;i<n;i++)v[i]=((m>>i)&1)-.5;
  if(n===4){var th=P.th,c=Math.cos(th),s=Math.sin(th),c2=Math.cos(th*.6),s2=Math.sin(th*.6);var x=c*v[0]-s*v[3],w4=s*v[0]+c*v[3],z=c2*v[2]-s2*w4,w5=s2*v[2]+c2*w4;var f=1.9/(1.9-w5*.9);v=[x*f,v[1]*f,z*f,w5]}
  o.push([v[0],v[1],v[2]])}return o}

var W34=win(600,40,640,480,-5,7,-3.5,5.5);
var PRE34=[null,{a:1,b:4,c:-1,d:2,la:1,lb:1,lc:0,ld:1,ia:0,ib:0,ic:0,id:0},{a:-1,b:5,c:1,d:3,la:1,lb:0,lc:0,ld:1,ia:0,ib:1,ic:0,id:0},{a:-3,b:3,c:-2,d:2,la:0,lb:0,lc:1,ld:1,ia:1,ib:1,ic:0,id:0}];
function ex34(){var l=P.ia?']-\\infty':(P.la?'['+nf(P.a):']'+nf(P.a)),r=P.ib?'+\\infty[':(P.lb?nf(P.b)+']':nf(P.b)+'['),
  d=P.ic?']-\\infty':(P.lc?'['+nf(P.c):']'+nf(P.c)),u=P.id?'+\\infty[':(P.ld?nf(P.d)+']':nf(P.d)+'[');return l+'\\,;'+r+'\\times'+d+'\\,;'+u}

var W35=W31;
var SM35=(function(){var o=[[0,0]];[.45,.8,1].forEach(function(f){for(var k=0;k<40;k++){var a=k/40*6.283185;o.push([f*Math.cos(a),f*Math.sin(a)])}});return o})();
function diskSubset(X,A){return Math.hypot(X.x-A.x,X.y-A.y)+X.r<=A.r+1e-10}
// For two disks there is no hole in their union. Covering the boundary circle
// of X therefore covers X; check the union of their closed angular arcs exactly.
function diskUnionSubset(X,A,B){
 var tau=2*Math.PI,arcs=[];
 if(X.r===0)return inD(A,X.x,X.y)||inD(B,X.x,X.y);
 for(var C of [A,B]){
  var dx=C.x-X.x,dy=C.y-X.y,d=Math.hypot(dx,dy);
  if(d+X.r<=C.r+1e-10)return true;
  if(d===0||d>=X.r+C.r||X.r>=d+C.r)continue;
  var v=(X.r*X.r+d*d-C.r*C.r)/(2*X.r*d),a=Math.acos(clamp(v,-1,1)),t=Math.atan2(dy,dx);
  t=(t+tau)%tau;var lo=t-a,hi=t+a;
  if(lo<0){arcs.push([0,hi],[lo+tau,tau]);}else if(hi>tau){arcs.push([lo,tau],[0,hi-tau]);}else arcs.push([lo,hi]);
 }
 arcs.sort(function(a,b){return a[0]-b[0]});var end=0;
 for(var ab of arcs){if(ab[0]>end+1e-10)return false;end=Math.max(end,ab[1]);if(end>=tau-1e-10)return true;}
 return false;
}
function samp35(){var ia=diskSubset(P.X,P.A),ib=diskSubset(P.X,P.B);return{A:ia,B:ib,U:diskUnionSubset(P.X,P.A,P.B),I:ia&&ib}}
function unique34(a){return Array.from(new Set(a))}


S=[
{title:'Éléments et ensembles',hint:'Interactif : glissez les neuf tickets entre les cercles ; l’expression choisie s’ombre et s’énumère.',
 init:function(){var p=[];for(var i=0;i<9;i++)p.push({x:1.1+1.35*i,y:.75});return{pos:p,e:0}},
 sel:[{k:'e',tex:true,lab:'Expression',opts:EXPR.map(function(x,i){return[i,x.tex]})},{k:'pre',lab:'Éléments',opts:[[0,'En bas'],[1,'Classer les tickets']]}],selRows:3,
 on:function(k,v){if(k==='pre'){var s=v?sol31():null;for(var i=0;i<9;i++){P.pos[i].x=s?s[i].x:1.1+1.35*i;P.pos[i].y=s?s[i].y:.75}}},
 steps:[
  {hd:'1 · Lire A, B, C sur la figure',f:function(){var s=sets31(),ok=[0,1,2].map(function(k){return s[k].join()===TGT[k].join()});
    return[{t:'A='+setStr(s[0]),c:ok[0]?GRN:AMB},{t:'B='+setStr(s[1]),c:ok[1]?GRN:AMB},{t:'C='+setStr(s[2]),c:ok[2]?GRN:AMB},{h:1,t:(ok[0]&&ok[1]&&ok[2])?'Les trois critères de classement sont satisfaits.':'Cibles : A = multiples de 3 ; B = numéros de 5 à 8 ; C = numéros impairs.',c:(ok[0]&&ok[1]&&ok[2])?GRN:MUT}]}},
  {hd:'2 · L’expression choisie',f:function(){var res=[];for(var i=0;i<9;i++){var g=member31(i);if(EXPR[P.e].f(g[0],g[1],g[2]))res.push(i)}return[{t:EXPR[P.e].tex+'='+setStr(res),c:GRN}]}},
  {hd:'3 · Justifier un classement',f:function(){return[{h:1,t:'Choisissez un ticket. Écrivez pour chacun des trois critères : satisfait ou non satisfait.',c:AMB},{h:1,t:'Traduisez ensuite chaque opération : « au moins un », « tous les deux », « sans ». La règle doit expliquer le classement de chaque ticket.',c:MUT}]}}],
 draw:function(){pan(W31);ctx.fillStyle='rgba(95,208,160,.28)';ctx.beginPath();shade31(P.e).forEach(function(r){ctx.rect(r[0],r[1],8,8)});ctx.fill();
  var cols=[AMB,BLU,VIO],nm=['A','B','C'];CIR.forEach(function(c,i){ring(W31.X(c.x),W31.Y(c.y),c.r/16*W31.w,cols[i],3);txt(nm[i],W31.X(c.x+(i===0?-2.6:i===1?2.6:0)),W31.Y(c.y+(i===2?-2.7:2.7)),cols[i],26,'center')});
  txt('E',W31.x+14,W31.y+16,MUT,22,'left');
  for(var i=0;i<9;i++){var g=member31(i),inE=EXPR[P.e].f(g[0],g[1],g[2]),X=W31.X(P.pos[i].x),Y=W31.Y(P.pos[i].y);dot(X,Y,15,inE?GRN:'#3b5273');ring(X,Y,15,INK,1.5);txt(String(i),X,Y,inE?'#0d1117':INK,17,'center')}
  unpan()},
 hit:function(x,y){for(var i=8;i>=0;i--){if(nr(x,y,W31.X(P.pos[i].x),W31.Y(P.pos[i].y),19)){var k=i;return{cur:'grab',move:function(X,Y){P.pos[k].x=clamp(W31.iX(X),.6,15.4);P.pos[k].y=clamp(W31.iY(Y),.6,11.4)}}}}return null}},

{title:'Opérations et De Morgan',hint:'Interactif : glissez les cercles A, B (centre et poignée de rayon) et le point x ; comparez gauche et droite.',
 init:function(){return{A:{x:3.6,y:5,r:2.6},B:{x:6.4,y:5,r:2.6},x:{x:5,y:1.6},law:0}},
 sel:[{k:'law',tex:true,opts:[[0,'(A\\cap B)^c=A^c\\cup B^c'],[1,'(A\\cup B)^c=A^c\\cap B^c'],[2,'A\\cup B=B']]}],
 steps:[
  {hd:'1 · Dictionnaire',f:function(){return[{tb:[['\\text{Ensembles}','\\text{Logique}'],['\\cap','\\wedge\\ (\\text{et})'],['\\cup','\\vee\\ (\\text{ou})'],['A^c','\\neg\\,(x\\in A)'],['A\\subset B','x\\in A\\Rightarrow x\\in B']]}]}},
  {hd:'2 · Double inclusion, élément par élément',f:function(){return P.law===0?[{t:'x\\in(A\\cap B)^c\\iff\\neg(x\\in A\\wedge x\\in B)'},{t:'\\iff x\\notin A\\ \\vee\\ x\\notin B\\iff x\\in A^c\\cup B^c',c:GRN}]:
    P.law===1?[{t:'x\\in(A\\cup B)^c\\iff\\neg(x\\in A\\vee x\\in B)'},{t:'\\iff x\\notin A\\ \\wedge\\ x\\notin B\\iff x\\in A^c\\cap B^c',c:GRN}]:
    [{t:'A\\cup B=B\\iff A\\subset B'},{t:'(\\Leftarrow):\\ A\\subset B\\Rightarrow A\\cup B\\subset B\\ \\text{et}\\ B\\subset A\\cup B',c:GRN}]}},
  {hd:'3 · Vérification sur la figure',f:function(){var c=cmp32(),inL=LAW[P.law].lf(inD(P.A,P.x.x,P.x.y),inD(P.B,P.x.x,P.x.y)),inR=LAW[P.law].rf(inD(P.A,P.x.x,P.x.y),inD(P.B,P.x.x,P.x.y));
    var l=[{t:'x\\in '+LAW[P.law].l+':\\ '+VF(inL),c:AMB},{t:'x\\in '+LAW[P.law].r+':\\ '+VF(inR),c:BLU}];
    if(P.law<2)l.push({t:c.mm===0?'\\text{Identité démontrée par les équivalences}':'\\text{Écart ?}',c:c.mm===0?GRN:RED});
    else l.push({t:'A\\subset B:\\ '+VF(diskSubset(P.A,P.B))+'\\quad A\\cup B=B:\\ '+VF(diskSubset(P.A,P.B)),c:(c.ab===0)===(c.mm===0)?GRN:RED});return l}}],
 fix:function(){['A','B'].forEach(function(k){P[k].x=clamp(P[k].x,.5,9.5);P[k].y=clamp(P[k].y,.5,9.2);P[k].r=clamp(P[k].r,.8,3.6)});P.x.x=clamp(P.x.x,.2,9.8);P.x.y=clamp(P.x.y,.2,9.4)},
 draw:function(){var L=LAW[P.law];[[WL,L.lf,'L','l'],[WR,L.rf,'R','r']].forEach(function(o){var w=o[0],key=o[2]+P.law+'|'+[P.A.x,P.A.y,P.A.r,P.B.x,P.B.y,P.B.r].map(function(v){return v.toFixed(2)}).join(',');
    pan(w);ctx.fillStyle='rgba(232,163,61,.35)';ctx.beginPath();shade32(w,o[1],key).forEach(function(r){ctx.rect(w.x+r[0],w.y+r[1],6,6)});ctx.fill();
    [[P.A,AMB,'A'],[P.B,BLU,'B']].forEach(function(c){var X=w.X(c[0].x),Y=w.Y(c[0].y),R=c[0].r/10*w.w;ring(X,Y,R,c[1],2.5);txt(c[2],X,Y,c[1],22,'center')});
    var a=inD(P.A,P.x.x,P.x.y),b=inD(P.B,P.x.x,P.x.y),ok=o[1](a,b);dot(w.X(P.x.x),w.Y(P.x.y),6,ok?GRN:RED);txt('x',w.X(P.x.x)+11,w.Y(P.x.y)-11,INK,18,'left');unpan()});
  txt(P.law===2?'A \u222a B':P.law===0?'(A\u2229B)ᶜ':'(A\u222aB)ᶜ',WL.x+WL.w/2,WL.y-24,AMB,22,'center');txt(P.law===2?'B':P.law===0?'Aᶜ ∪ Bᶜ':'Aᶜ ∩ Bᶜ',WR.x+WR.w/2,WR.y-24,AMB,22,'center');
  [WL,WR].forEach(function(w){[[P.A,AMB],[P.B,BLU]].forEach(function(c,i){var ang=i?-.7:2.6;handle(w.X(c[0].x+c[0].r*Math.cos(ang)),w.Y(c[0].y+c[0].r*Math.sin(ang)),c[1],5)})});
  [WL,WR].forEach(function(w){handle(w.X(P.x.x),w.Y(P.x.y),GRN,5)})},
 hit:function(x,y){var ws=[WL,WR];for(var q=0;q<2;q++){var w=ws[q];
   if(nr(x,y,w.X(P.x.x),w.Y(P.x.y),18))return{cur:'move',move:function(X,Y){var ww=X>=915?WR:WL;P.x.x=ww.iX(X);P.x.y=ww.iY(Y)}};
   var ks=['A','B'],an=[2.6,-.7];for(var i=0;i<2;i++){var c=P[ks[i]];if(nr(x,y,w.X(c.x+c.r*Math.cos(an[i])),w.Y(c.y+c.r*Math.sin(an[i])),18)){var cc=c;return{cur:'nesw-resize',move:function(X,Y){var ww=X>=915?WR:WL;cc.r=Math.hypot(ww.iX(X)-cc.x,ww.iY(Y)-cc.y)}}}}
   for(i=0;i<2;i++){c=P[ks[i]];if(nr(x,y,w.X(c.x),w.Y(c.y),20)){var c3=c;return{cur:'move',move:function(X,Y){var ww=X>=915?WR:WL;c3.x=ww.iX(X);c3.y=ww.iY(Y)}}}}}return null}},

{title:'Cube des parties',hint:'Interactif : glissez pour tourner ; touchez un sommet = une partie ; le curseur tourne dans la 4ᵉ dimension.',
 init:function(){return{n:3,cam:{yaw:-.7,pitch:.5},sel:5,th:.5}},tw:[],
 sel:[{k:'n',lab:'|E| =',opts:[[2,'2 (carré)'],[3,'3 (cube)'],[4,'4 (tesseract)']]}],
 on:function(k){if(k==='n')P.sel=Math.min(P.sel,(1<<P.n)-1)},
 sl:[{k:'th',l:'\\theta',min:0,max:6.28,step:.02}],
 steps:[
  {hd:'1 · Sommet = partie de E',f:function(){var n=P.n;return[{t:'\\operatorname{card}\\mathcal P(E)=2^{'+n+'}='+(1<<n),c:AMB},{h:1,t:'Arête = on ajoute ou retire un élément.',c:MUT}]}},
  {hd:'2 · La partie sélectionnée',f:function(){var s=subTex(P.sel,P.n),k=sub(P.sel,P.n).length;return[{t:s+'\\in\\mathcal P(E)',c:GRN},{t:s+'\\subset E',c:GRN},{t:'\\operatorname{card}='+k+',\\quad\\{a\\}\\neq a',c:MUT}]}},
  {hd:'3 · P(P(S)) : le tesseract',f:function(){return[{t:'E=\\mathcal P(S),\\ S=\\{a,b\\}\\ \\Rightarrow\\ \\operatorname{card}E=4',c:INK},{t:'\\operatorname{card}\\mathcal P(\\mathcal P(S))=2^{2^2}=16',c:P.n===4?GRN:MUT},{h:1,t:P.n===4?'Les 16 sommets du tesseract.':'Passez à |E| = 4 pour le voir.',c:MUT}]}}],
 fix:function(){P.th=clamp(P.th,0,6.28)},
 draw:function(){var n=P.n,p3=p33(),pts=pts33(),pr=pts.map(function(p){return p3.pr(p[0],p[1],p[2])});pan(W33);
  if(n<=3){var fs=[];if(n===2)fs.push({pts:[0,1,3,2].map(function(m){return pts[m]}),f:[120,150,190],a:.18,s:null});
    else[[0,1,3,2],[4,5,7,6],[0,1,5,4],[2,3,7,6],[0,2,6,4],[1,3,7,5]].forEach(function(q){fs.push({pts:q.map(function(m){return pts[m]}),f:[120,150,190],a:.12,s:null})});flush(fs,p3)}
  for(var m=0;m<(1<<n);m++)for(var b=0;b<n;b++)if(!(m&(1<<b))){var m2=m|(1<<b),hl=(m===P.sel||m2===P.sel);seg(pr[m].X,pr[m].Y,pr[m2].X,pr[m2].Y,hl?AMB:'#5f7ba3',hl?3:1.6)}
  var order=[];for(m=0;m<(1<<n);m++)order.push(m);order.sort(function(a,b){return pr[b].d-pr[a].d});
  var cc=['#6aa9ff','#5fd0a0','#e8a33d','#ff7a7a','#b48cff'];
  order.forEach(function(m){var k=sub(m,n).length;dot(pr[m].X,pr[m].Y,m===P.sel?13:10,cc[k]);if(m===P.sel){ctx.globalAlpha=.5+.5*Math.sin(TT*4);ring(pr[m].X,pr[m].Y,22,AMB,3,[5,4]);ctx.globalAlpha=1}
    txt(subTxt(m,n),pr[m].X,pr[m].Y-(m===P.sel?26:19),m===P.sel?AMB:INK,m===P.sel?19:14,'center')});
  txt('couleur = cardinal de la partie (0 à '+n+')',W33.x+12,W33.y+W33.h-16,MUT,16,'left');unpan()},
 hit:function(x,y){var p3=p33(),pts=pts33(),best=null,bd=26;pts.forEach(function(p,m){var q=p3.pr(p[0],p[1],p[2]),d=Math.hypot(q.X-x,q.Y-y);if(d<bd){bd=d;best=m}});
  if(best!==null){var bv=best;return{cur:'pointer',start:function(){P.sel=bv}}}return rotHit(W33,P.cam)(x,y)}},

{title:'Produit cartésien',hint:'Interactif : glissez les bords du rectangle (ou les éléments sur les axes) ; basculez bord ouvert / fermé.',
 init:function(){return{mode:1,a:1,b:4,c:-1,d:2,la:1,lb:1,lc:0,ld:1,ia:0,ib:0,ic:0,id:0,ax:[-3,-1,1,4],by:[-3,-1,1,3]}},
 sel:[{k:'mode',lab:'Cas',opts:[[0,'A×B fini'],[1,'[1,4]×]−1,2]'],[2,'[−1,+∞[×]1,3]'],[3,'ℝ×[−2,2]']]},
  {k:'la',lab:'gauche',opts:[[1,'fermé'],[0,'ouvert']]},{k:'lb',lab:'droite',opts:[[1,'fermé'],[0,'ouvert']]},{k:'lc',lab:'bas',opts:[[1,'fermé'],[0,'ouvert']]},{k:'ld',lab:'haut',opts:[[1,'fermé'],[0,'ouvert']]}],selRows:3,
 on:function(k,v){if(k==='mode'&&PRE34[v]){var q=PRE34[v];Object.keys(q).forEach(function(z){P[z]=q[z]})}},
 steps:[
  {hd:'1 · Définition',f:function(){return[{t:'A\\times B=\\{(x,y)\\mid x\\in A,\\ y\\in B\\}',c:AMB},{h:1,t:P.mode===0?'Ici $A$ a '+unique34(P.ax).length+' éléments, $B$ en a '+unique34(P.by).length+' : '+(unique34(P.ax).length*unique34(P.by).length)+' couples.':'Un couple $(x,y)$ : $x$ dans le premier intervalle, $y$ dans le second.',c:MUT}]}},
  {hd:'2 · Lire la figure',f:function(){return P.mode===0?[{t:'\\operatorname{card}(A\\times B)='+unique34(P.ax).length+'\\times'+unique34(P.by).length+'='+unique34(P.ax).length*unique34(P.by).length,c:GRN},{t:'A=\\{'+unique34(P.ax).map(function(v){return nf(v)}).join(',')+'\\}',c:AMB},{t:'B=\\{'+unique34(P.by).map(function(v){return nf(v)}).join(',')+'\\}',c:BLU}]:
    [{t:ex34(),c:GRN},{h:1,t:'Bord plein = fermé (inclus) ; pointillé = ouvert.',c:MUT}]}},
  {hd:'3 · Pièges',f:function(){return[{t:'A\\times B\\neq B\\times A\\ \\text{(en général)}',c:RED},{t:'\\mathbb R\\times[0,1]:\\ \\text{bande horizontale}',c:INK}]}}],
 fix:function(){if(P.mode!==0){P.a=clamp(P.a,-4.9,P.b-.5);P.b=clamp(P.b,P.a+.5,6.9);P.c=clamp(P.c,-3.4,P.d-.5);P.d=clamp(P.d,P.c+.5,5.4)}},
 draw:function(){pan(W34);grid(W34,1,1,1);
  if(P.mode===0){P.ax.forEach(function(x){P.by.forEach(function(y){dot(W34.X(x),W34.Y(y),7,AMB)})});P.ax.forEach(function(x,i){handle(W34.X(x),W34.Y(0),AMB,6);txt('a'+(i+1),W34.X(x),W34.Y(0)+24,AMB,15,'center')});P.by.forEach(function(y,j){handle(W34.X(0),W34.Y(y),BLU,6);txt('b'+(j+1),W34.X(0)+24,W34.Y(y),BLU,15,'left')})}
  else{var xl=P.ia?W34.xa-1:P.a,xr=P.ib?W34.xb+1:P.b,yb=P.ic?W34.ya-1:P.c,yt=P.id?W34.yb+1:P.d;
    ctx.fillStyle='rgba(232,163,61,.25)';ctx.fillRect(W34.X(xl),W34.Y(yt),W34.X(xr)-W34.X(xl),W34.Y(yb)-W34.Y(yt));
    function edge(x1,y1,x2,y2,closed){seg(W34.X(x1),W34.Y(y1),W34.X(x2),W34.Y(y2),AMB,4,closed?[]:[9,7])}
    if(!P.ia)edge(xl,yb,xl,yt,P.la);if(!P.ib)edge(xr,yb,xr,yt,P.lb);if(!P.ic)edge(xl,yb,xr,yb,P.lc);if(!P.id)edge(xl,yt,xr,yt,P.ld);
    [[xl,yb,P.la&&P.lc,P.ia||P.ic],[xr,yb,P.lb&&P.lc,P.ib||P.ic],[xl,yt,P.la&&P.ld,P.ia||P.id],[xr,yt,P.lb&&P.ld,P.ib||P.id]].forEach(function(q){if(q[3])return;if(q[2])dot(W34.X(q[0]),W34.Y(q[1]),7,AMB);else{dot(W34.X(q[0]),W34.Y(q[1]),7,PAN);ring(W34.X(q[0]),W34.Y(q[1]),7,AMB,3)}});
    var xm=(Math.max(xl,W34.xa)+Math.min(xr,W34.xb))/2,ym=(Math.max(yb,W34.ya)+Math.min(yt,W34.yb))/2;
    if(!P.ia)handle(W34.X(xl),W34.Y(ym),AMB);if(!P.ib)handle(W34.X(xr),W34.Y(ym),AMB);if(!P.ic)handle(W34.X(xm),W34.Y(yb),BLU);if(!P.id)handle(W34.X(xm),W34.Y(yt),BLU)}
  unpan()},
 hit:function(x,y){var w=W34;
  if(P.mode===0){for(var i=0;i<4;i++){if(nr(x,y,w.X(P.ax[i]),w.Y(0),20)){var ii=i;return{cur:'ew-resize',move:function(X){P.ax[ii]=rs(w.iX(X),.5,-4.5,6.5)}}}}
    for(var j=0;j<4;j++){if(nr(x,y,w.X(0),w.Y(P.by[j]),20)){var jj=j;return{cur:'ns-resize',move:function(X,Y){P.by[jj]=rs(w.iY(Y),.5,-3,5)}}}}return null}
  var xl=P.ia?w.xa-1:P.a,xr=P.ib?w.xb+1:P.b,yb=P.ic?w.ya-1:P.c,yt=P.id?w.yb+1:P.d,xm=(Math.max(xl,w.xa)+Math.min(xr,w.xb))/2,ym=(Math.max(yb,w.ya)+Math.min(yt,w.yb))/2;
  if(!P.ia&&nr(x,y,w.X(xl),w.Y(ym),22))return{cur:'ew-resize',move:function(X){P.a=rs(w.iX(X),.5,-4.5,P.b-.5)}};
  if(!P.ib&&nr(x,y,w.X(xr),w.Y(ym),22))return{cur:'ew-resize',move:function(X){P.b=rs(w.iX(X),.5,P.a+.5,6.5)}};
  if(!P.ic&&nr(x,y,w.X(xm),w.Y(yb),22))return{cur:'ns-resize',move:function(X,Y){P.c=rs(w.iY(Y),.5,-3,P.d-.5)}};
  if(!P.id&&nr(x,y,w.X(xm),w.Y(yt),22))return{cur:'ns-resize',move:function(X,Y){P.d=rs(w.iY(Y),.5,P.c+.5,5)}};return null}},

{title:'Couverture par deux capteurs',hint:'Interactif : glissez A, B (centres) et le disque X (centre, rayon) pour chercher un contre-exemple.',
 init:function(){return{mode:0,A:{x:6,y:6.2,r:3.4},B:{x:10,y:6.2,r:3.4},X:{x:8,y:6.2,r:2.2}}},
 sel:[{k:'mode',opts:[[0,'Couverture combinée'],[1,'Double couverture']]}],
 steps:[
  {hd:'1 · Une zone de mesure',f:function(){return P.mode===0?[{t:'(X\\subset A\\ \\vee\\ X\\subset B)\\Rightarrow X\\subset A\\cup B',c:GRN}]:[{t:'(X\\subset A\\ \\wedge\\ X\\subset B)\\Rightarrow X\\subset A\\cap B',c:GRN}]}},
  {hd:'2 · Tester le disque mobile',f:function(){var s=samp35();if(P.mode===0){var cex=s.U&&!s.A&&!s.B;return[{t:'X\\subset A:\\ '+VF(s.A)+',\\ X\\subset B:\\ '+VF(s.B),c:MUT},{t:'X\\subset A\\cup B:\\ '+VF(s.U),c:AMB},{t:cex?'\\text{Contre-exemple : réciproque fausse}':'\\text{Pas (encore) de contre-exemple}',c:cex?RED:MUT}]}
    return[{t:'X\\subset A\\wedge X\\subset B:\\ '+VF(s.A&&s.B),c:MUT},{t:'X\\subset A\\cap B:\\ '+VF(s.I),c:AMB},{t:(s.A&&s.B)===s.I?'\\text{Équivalence vérifiée}':'\\text{Écart ?}',c:(s.A&&s.B)===s.I?GRN:RED}]}},
  {hd:'3 · Interpréter les zones',f:function(){var nested=diskSubset(P.A,P.B)||diskSubset(P.B,P.A),s=samp35();return[
 {h:1,t:P.mode===0?'La zone X doit être couverte par au moins un capteur en chaque point.':'Chaque point de X doit être couvert simultanément par les deux capteurs.',c:MUT},
 {h:1,t:nested?'Capteurs emboîtés : égalité entre la couverture combinée et le plus grand disque.':'Deux capteurs non emboîtés : leur couverture combinée peut dépasser chacune des zones seules.',c:AMB},
 {h:1,t:'Le verdict utilise la géométrie exacte des disques, pas seulement des points échantillonnés.',c:MUT}]}}],
 fix:function(){['A','B'].forEach(function(k){P[k].x=clamp(P[k].x,1,15);P[k].y=clamp(P[k].y,1,11)});P.X.x=clamp(P.X.x,.5,15.5);P.X.y=clamp(P.X.y,.5,11.5);P.X.r=clamp(P.X.r,.3,4)},
 draw:function(){pan(W35);var s=samp35();[[P.A,AMB,'A'],[P.B,BLU,'B']].forEach(function(c){var X=W35.X(c[0].x),Y=W35.Y(c[0].y),R=c[0].r/16*W35.w;ctx.fillStyle=c[1]+'22';ctx.beginPath();ctx.arc(X,Y,R,0,7);ctx.fill();ring(X,Y,R,c[1],3);txt(c[2],X+(c[2]==='A'?-R*.75:R*.75),Y-R*.8,c[1],26,'center');handle(X,Y,c[1],5)});
  var cex=P.mode===0&&s.U&&!s.A&&!s.B,good=P.mode===0?s.U:(s.A&&s.B),col=cex?RED:(good?GRN:MUT);
  ctx.fillStyle=(cex?'rgba(255,122,122,.25)':'rgba(95,208,160,.2)');ctx.beginPath();ctx.arc(W35.X(P.X.x),W35.Y(P.X.y),P.X.r/16*W35.w,0,7);ctx.fill();ring(W35.X(P.X.x),W35.Y(P.X.y),P.X.r/16*W35.w,col,3,[8,5]);txt('X',W35.X(P.X.x),W35.Y(P.X.y),col,26,'center');
  handle(W35.X(P.X.x+P.X.r*Math.cos(.7)),W35.Y(P.X.y+P.X.r*Math.sin(.7)),col,6);
  if(cex)txt('X ⊂ A∪B, X ⊄ A, X ⊄ B',W35.x+W35.w/2,W35.y+W35.h-20,RED,20,'center');unpan()},
 hit:function(x,y){var X=P.X;if(nr(x,y,W35.X(X.x+X.r*Math.cos(.7)),W35.Y(X.y+X.r*Math.sin(.7)),20))return{cur:'nesw-resize',move:function(Xp,Yp){P.X.r=Math.hypot(W35.iX(Xp)-P.X.x,W35.iY(Yp)-P.X.y)}};
  if(nr(x,y,W35.X(X.x),W35.Y(X.y),22))return{cur:'move',move:function(Xp,Yp){P.X.x=W35.iX(Xp);P.X.y=W35.iY(Yp)}};
  var ks=['A','B'];for(var i=0;i<2;i++){var c=P[ks[i]];if(nr(x,y,W35.X(c.x),W35.Y(c.y),22)){var cc=c;return{cur:'move',move:function(Xp,Yp){cc.x=W35.iX(Xp);cc.y=W35.iY(Yp)}}}}return null}}
];
