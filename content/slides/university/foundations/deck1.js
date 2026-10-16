// ===== DECK 1: Calculs algébriques (sommes, produits, binomiaux) =====
function sumRange(m,n,f){var s=0;for(var k=m;k<=n;k++)s+=f(k);return s}
function prodRange(m,n,f){var s=1;for(var k=m;k<=n;k++)s*=f(k);return s}
function kterm(s){return s===0?'k':'k'+(s<0?'-':'+')+Math.abs(s)}
function expandBin(n){var t=[];for(var k=0;k<=n;k++){var c=C(n,k),ap=n-k,bp=k;
  t.push(((c>1||(ap===0&&bp===0))?c:'')+(ap?'a'+(ap>1?'^{'+ap+'}':''):'')+(bp?'b'+(bp>1?'^{'+bp+'}':''):''))}
  return n<=5?t.join('+'):t.slice(0,3).join('+')+'+\\cdots+'+t[n]}
var W1=win(600,40,640,480,0.5,12.5,-1.8,13.2);
var W2=win(600,40,640,480,-2,15,0,10);
var W5a=win(600,40,640,290,-.8,8.8,-1,1),W5b=win(620,350,170,170,-2,2,-2,2);
var W6=win(600,40,640,480,-1.2,2.2,0,10);
var PS=34,PX0=640,PY0=80;
var WP=win(600,40,640,480,0,1,0,1);

S=[
{title:'Sommes et bornes',hint:'Interactif : glissez les deux poignées ambre (bornes m et n) ; le curseur fait de même.',
 init:function(){return{m:2,n:7}},
 sl:[{k:'m',l:'m',min:1,max:12,step:1},{k:'n',l:'n',min:0,max:12,step:1}],
 steps:[
  {hd:'1 · Notation',f:function(){return[{t:'\\displaystyle\\sum_{k=m}^{n}u_k=u_m+u_{m+1}+\\cdots+u_n'},{h:1,t:'Ici $u_k=k$ ; $m='+P.m+'$, $n='+P.n+'$.',c:MUT}]}},
  {hd:'2 · Nombre de termes, somme, produit',f:function(){var m=P.m,n=P.n;if(n<m)return[{h:1,t:'Aucun indice $k$ ne vérifie $'+m+'\\leq k\\leq '+n+'$.',c:RED}];
    return[{t:'n-m+1='+n+'-'+m+'+1='+(n-m+1),c:AMB},{t:'\\sum_{k='+m+'}^{'+n+'}k='+sumRange(m,n,function(k){return k}),c:GRN},{t:'\\prod_{k='+m+'}^{'+n+'}k='+big(prodRange(m,n,function(k){return k})),c:BLU}]}},
  {hd:'3 · Somme vide, produit vide',f:function(){var e=P.n<P.m;return[{t:'m>n\\ \\Longrightarrow\\ \\sum_{k=m}^{n}u_k=0,\\quad\\prod_{k=m}^{n}u_k=1',c:e?GRN:INK},
    {h:1,t:e?'Vous y êtes : $n<m$, aucune barre n’est sélectionnée.':'Faites passer $n$ sous $m$ pour l’observer.',c:e?GRN:MUT}]}}],
 draw:function(){var m=P.m,n=P.n;pan(W1);grid(W1,1,100,0,false);ctx.strokeStyle=MUT;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(W1.x,W1.Y(0));ctx.lineTo(W1.x+W1.w,W1.Y(0));ctx.stroke();
  for(var k=1;k<=12;k++){var on=k>=m&&k<=n;ctx.fillStyle=on?AMB:'#2a3d57';ctx.fillRect(W1.X(k-.38),W1.Y(k),W1.X(k+.38)-W1.X(k-.38),W1.Y(0)-W1.Y(k));
    txt(String(k),W1.X(k),W1.Y(-.55),on?AMB:MUT,18,'center');if(on&&k>1)txt(String(k),W1.X(k),W1.Y(k)+16,'#0d1117',17,'center')}
  seg(W1.X(m-.5),W1.Y(13),W1.X(m-.5),W1.Y(-1.2),AMB,2,[6,5]);seg(W1.X(n+.5),W1.Y(13),W1.X(n+.5),W1.Y(-1.2),GRN,2,[6,5]);
  txt('m',W1.X(m-.5)-12,W1.Y(12.4),AMB,22,'center');txt('n',W1.X(n+.5)+12,W1.Y(12.4),GRN,22,'center');
  handle(W1.X(m-.5),W1.Y(-1.2),AMB);handle(W1.X(n+.5),W1.Y(-1.2),GRN);unpan()},
 hit:function(x,y){if(nr(x,y,W1.X(P.m-.5),W1.Y(-1.2),22))return{cur:'ew-resize',move:function(X){P.m=clamp(Math.round(W1.iX(X)+.5),1,12)}};
  if(nr(x,y,W1.X(P.n+.5),W1.Y(-1.2),22))return{cur:'ew-resize',move:function(X){P.n=clamp(Math.round(W1.iX(X)-.5),0,12)}};return null}},

{title:'Changement d’indice',hint:'Interactif : faites glisser la rangée du bas (ou le curseur) pour changer le décalage s.',
 init:function(){return{m:3,n:8,s:2}},
 sl:[{k:'s',l:'s',min:-3,max:4,step:1},{k:'n',l:'n',min:4,max:10,step:1}],
 steps:[
  {hd:'1 · On pose j = k + s',f:function(){return[{t:'j=k+s',c:AMB},{t:'k='+P.m+'\\Rightarrow j='+(P.m+P.s)},{t:'k='+P.n+'\\Rightarrow j='+(P.n+P.s)}]}},
  {hd:'2 · Propriété',f:function(){return[{t:'\\sum_{k=m}^{n}u_{k+s}=\\sum_{j=m+s}^{n+s}u_j',c:GRN},{h:1,t:'avec $m='+P.m+'$, $n='+P.n+'$, $s='+P.s+'$ et $u_j=j^2$.',c:MUT}]}},
  {hd:'3 · Contrôle numérique',f:function(){var m=P.m,n=P.n,s=P.s,L=sumRange(m,n,function(k){return (k+s)*(k+s)}),R=sumRange(m+s,n+s,function(j){return j*j});
    return[{t:'\\sum_{k='+m+'}^{'+n+'}('+kterm(s)+')^2='+L,c:AMB},{t:'\\sum_{j='+(m+s)+'}^{'+(n+s)+'}j^2='+R,c:BLU},{t:L===R?'\\text{Égalité vérifiée}':'\\text{Différent !}',c:L===R?GRN:RED}]}}],
 fix:function(){P.s=clamp(Math.round(P.s),-3,4);P.n=clamp(Math.round(P.n),4,10)},
 draw:function(){var m=P.m,n=P.n,s=P.s,u=W2.X(1)-W2.X(0);pan(W2);
  txt('k',W2.X(-1.5),150,AMB,24,'center');txt('j = k+s',W2.X(-1.2)+14,300,BLU,22,'center');
  for(var k=m;k<=n;k++){var j=k+s;seg(W2.X(k),176,W2.X(j),284,'#3b5273',1.5,[3,4])}
  for(k=m;k<=n;k++){var v=(k+s)*(k+s);ctx.fillStyle='#22364f';ctx.fillRect(W2.X(k)-u*.42,150,u*.84,46);ctx.strokeStyle=AMB;ctx.lineWidth=2;ctx.strokeRect(W2.X(k)-u*.42,150,u*.84,46);
    txt(String(k),W2.X(k),136,AMB,16,'center');txt(String(v),W2.X(k),173,INK,16,'center')}
  for(var j=m+s;j<=n+s;j++){ctx.fillStyle='#22364f';ctx.fillRect(W2.X(j)-u*.42,284,u*.84,46);ctx.strokeStyle=BLU;ctx.lineWidth=2;ctx.strokeRect(W2.X(j)-u*.42,284,u*.84,46);
    txt(String(j),W2.X(j),346,BLU,16,'center');txt(String(j*j),W2.X(j),307,INK,16,'center')}
  txt('chaque case contient la valeur (k+s)\u00b2',W2.x+12,100,MUT,18,'left');txt('mêmes valeurs, indexées par j',W2.x+12,390,MUT,18,'left');
  handle(W2.X(m+s)-u*.42-14,307,BLU);txt('\u25c0 \u25b6',W2.X(m+s)-u*.42-14,336,BLU,14,'center');unpan()},
 hit:function(x,y){var sc=S[1];if(y>=270&&y<=345&&x>=W2.x&&x<=W2.x+W2.w){var x0=x,s0=P.s,u=W2.X(1)-W2.X(0);return{cur:'ew-resize',move:function(X){P.s=clamp(s0+Math.round((X-x0)/u),-3,4)}}}return null}},

{title:'Renversement, télescopage',hint:'Interactif : glissez le coin bas-droit du rectangle pour changer n.',
 init:function(){return{n:6}},
 sl:[{k:'n',l:'n',min:1,max:12,step:1}],
 steps:[
  {hd:'1 · Écrire S dans les deux sens',f:function(){return[{t:'S=1+2+\\cdots+n',c:AMB},{t:'S=n+(n-1)+\\cdots+1',c:BLU}]}},
  {hd:'2 · Additionner colonne par colonne',f:function(){var n=P.n;return[{t:'2S=\\underbrace{(n+1)+\\cdots+(n+1)}_{n\\ \\text{termes}}'},{t:'S=\\dfrac{n(n+1)}{2}='+(n*(n+1)/2),c:GRN}]}},
  {hd:'3 · Télescopage pour les carrés',f:function(){var n=P.n;return[{t:'(k+1)^3-k^3=3k^2+3k+1'},{t:'\\sum_{k=1}^{n}\\bigl((k+1)^3-k^3\\bigr)=(n+1)^3-1'},{t:'\\sum_{k=1}^{n}k^2=\\dfrac{n(n+1)(2n+1)}{6}='+(n*(n+1)*(2*n+1)/6),c:GRN},{t:'\\sum_{k=1}^{n}k^3='+Math.pow(n*(n+1)/2,2)+'=S^2',c:VIO}]}}],
 fix:function(){P.n=clamp(Math.round(P.n),1,12)},
 draw:function(){var n=P.n;pan(WP);for(var r=1;r<=n;r++)for(var c=1;c<=n+1;c++){var on=c<=r;dot(PX0+(c-.5)*PS,PY0+(r-.5)*PS,PS*.36,on?AMB:BLU)}
  ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.strokeRect(PX0,PY0,(n+1)*PS,n*PS);ctx.setLineDash([]);
  txt('n+1',PX0+(n+1)*PS/2,PY0-14,INK,20,'center');txt('n',PX0-16,PY0+n*PS/2,INK,20,'center');
  txt('\u25cf S = 1+2+\u2026+n',WP.x+14,WP.y+WP.h-44,AMB,19,'left');txt('\u25cf S renversée = n+\u2026+1',WP.x+14,WP.y+WP.h-18,BLU,19,'left');
  handle(PX0+(n+1)*PS,PY0+n*PS,GRN);unpan()},
 hit:function(x,y){if(nr(x,y,PX0+(P.n+1)*PS,PY0+P.n*PS,24))return{cur:'nwse-resize',move:function(X,Y){P.n=clamp(Math.round(((X-PX0)/PS-1+(Y-PY0)/PS)/2),1,12)}};return null}},

{title:'Triangle de Pascal',hint:'Interactif : cliquez ou glissez sur une case pour choisir (n, k).',
 init:function(){return{n:5,k:2}},
 steps:[
  {hd:'1 · Symétrie',f:function(){var n=P.n,k=P.k;return[{t:'\\dbinom{'+n+'}{'+k+'}='+C(n,k),c:AMB},{t:'\\dbinom{n}{k}=\\dbinom{n}{n-k}:\\ \\dbinom{'+n+'}{'+(n-k)+'}='+C(n,n-k),c:GRN}]}},
  {hd:'2 · Relation de Pascal',f:function(){var n=P.n,k=P.k;if(n===0)return[{h:1,t:'Choisissez une ligne $n\\geq1$.',c:MUT}];
    return[{t:'\\dbinom{n-1}{k-1}+\\dbinom{n-1}{k}=\\dbinom nk'},{t:'\\dbinom{'+(n-1)+'}{'+(k-1)+'}+\\dbinom{'+(n-1)+'}{'+k+'}='+C(n-1,k-1)+'+'+C(n-1,k)+'='+C(n,k),c:BLU}]}},
  {hd:'3 · Somme d’une ligne, formule',f:function(){var n=P.n,k=P.k;return[{t:'\\sum_{k=0}^{'+n+'}\\dbinom{'+n+'}{k}=2^{'+n+'}='+Math.pow(2,n),c:AMB},{t:'\\dbinom nk=\\dfrac{n!}{k!\\,(n-k)!}=\\dfrac{'+(function(){var f=1;for(var i=2;i<=n;i++)f*=i;return f})()+'}{'+(function(){var f=1;for(var i=2;i<=k;i++)f*=i;return f})()+'\\times '+(function(){var f=1;for(var i=2;i<=n-k;i++)f*=i;return f})()+'}='+C(n,k),c:GRN}]}}],
 fix:function(){P.n=clamp(Math.round(P.n),0,9);P.k=clamp(Math.round(P.k),0,P.n)},
 draw:function(){var n=P.n,k=P.k;pan(WP);
  function cxp(r,c){return 920+(c-r/2)*56}function cyp(r){return 80+r*44}
  ctx.fillStyle='rgba(232,163,61,.12)';ctx.fillRect(WP.x,cyp(n)-20,WP.w,40);
  for(var r=0;r<=9;r++)for(var c=0;c<=r;c++){var col2='#22364f',tc=INK;
    if(r===n&&c===k){col2=AMB;tc='#0d1117'}else if(r===n&&c===n-k){col2=GRN;tc='#0d1117'}
    else if(r===n-1&&(c===k-1||c===k)&&n>0){col2=BLU;tc='#0d1117'}
    dot(cxp(r,c),cyp(r),19,col2);txt(String(C(r,c)),cxp(r,c),cyp(r),tc,r>=8?15:17,'center')}
  txt('ligne n = '+n+'  \u2192  somme = '+Math.pow(2,n),WP.x+14,WP.y+WP.h-18,AMB,19,'left');
  txt('\u25cf (n,k)',WP.x+14,WP.y+22,AMB,18,'left');txt('\u25cf (n,n\u2212k)',WP.x+14,WP.y+44,GRN,18,'left');txt('\u25cf parents',WP.x+14,WP.y+66,BLU,18,'left');unpan()},
 hit:function(x,y){if(!WP.has(x,y))return null;return{cur:'pointer',move:function(X,Y){var r=clamp(Math.round((Y-80)/44),0,9),c=clamp(Math.round((X-920)/56+r/2),0,r);P.n=r;P.k=c}}}},

{title:'Formule du binôme',hint:'Déplacez (a,b) et n. La graduation reste fixe ; double-cliquez pour réinitialiser la vue.',
 init:function(){return{n:4,a:1,b:1,viewY:19.2}},
 sl:[{k:'n',l:'n',min:1,max:8,step:1}],
 steps:[
  {hd:'1 · Énoncé',f:function(){return[{t:'(a+b)^n=\\sum_{k=0}^{n}\\dbinom nk a^{n-k}b^k',c:GRN}]}},
  {hd:'2 · Développement',f:function(){return[{t:'(a+b)^{'+P.n+'}='+expandBin(P.n),c:AMB}]}},
  {hd:'3 · Contrôle numérique',f:function(){var n=P.n,a=P.a,b=P.b,tot=Math.pow(a+b,n),sm=0;for(var k=0;k<=n;k++)sm+=C(n,k)*Math.pow(a,n-k)*Math.pow(b,k);
    var l=[{t:'(a+b)^{'+n+'}=('+nf(a)+(b<0?'-':'+')+nf(Math.abs(b))+')^{'+n+'}='+nf(tot),c:AMB},{t:'\\sum_{k=0}^{'+n+'}\\dbinom{'+n+'}{k}a^{'+n+'-k}b^k='+nf(sm),c:GRN}];
    if(a===1&&b===1)l.push({h:1,t:'$a=b=1$ : on retrouve $2^n$.',c:MUT});if(a===1&&b===-1)l.push({h:1,t:'$a=1,\\ b=-1$ : somme alternée nulle.',c:MUT});return l}}],
 fit:function(){var n=P.n,mx=Math.max(1,Math.abs(Math.pow(P.a+P.b,n)));for(var k=0;k<=n;k++)mx=Math.max(mx,Math.abs(C(n,k)*Math.pow(P.a,n-k)*Math.pow(P.b,k)));P.viewY=mx*1.2},
 viewReset:function(){P.viewY=19.2},
 fix:function(){P.n=clamp(Math.round(P.n),1,8);P.a=clamp(P.a,-2,2);P.b=clamp(P.b,-2,2)},
 draw:function(){var n=P.n,a=P.a,b=P.b,t=[],mx=1e-9;for(var k=0;k<=n;k++){t.push(C(n,k)*Math.pow(a,n-k)*Math.pow(b,k));mx=Math.max(mx,Math.abs(t[k]))}
  var tot=Math.pow(a+b,n);mx=P.viewY;var w=win(W5a.x,W5a.y,W5a.w,W5a.h,-.8,8.8,-mx,mx);
  pan(w);grid(w,1,1e9,0,false);seg(w.x,w.Y(0),w.x+w.w,w.Y(0),MUT,2);
  for(k=0;k<=n;k++){var v=t[k];ctx.fillStyle=v>=0?GRN:RED;ctx.fillRect(w.X(k-.35),Math.min(w.Y(0),w.Y(v)),w.X(k+.35)-w.X(k-.35),Math.abs(w.Y(v)-w.Y(0)));
    txt('k='+k,w.X(k),w.y+w.h-34,MUT,15,'center');txt(nf(v,1).replace('{,}',','),w.X(k),v>=0?w.Y(v)-12:w.Y(v)+12,INK,15,'center')}
  seg(w.x,w.Y(tot),w.x+w.w,w.Y(tot),AMB,2,[8,5]);txt('total (a+b)\u207f = '+nf(tot,2).replace('{,}',','),w.x+w.w-8,w.Y(tot)-14,AMB,17,'right');
  seg(w.X(n+.5),w.y,w.X(n+.5),w.y+w.h,AMB,2,[5,5]);handle(w.X(n+.5),w.y+w.h-12,AMB);unpan();
  pan(W5b);grid(W5b,1,1,0);dot(W5b.X(a),W5b.Y(b),8,AMB);handle(W5b.X(a),W5b.Y(b),AMB);txt('a',W5b.x+W5b.w-10,W5b.Y(0)-12,MUT,16,'center');txt('b',W5b.X(0)+12,W5b.y+10,MUT,16,'center');unpan();
  txt('a = '+nf(a,1).replace('{,}',','),830,380,INK,22,'left');txt('b = '+nf(b,1).replace('{,}',','),830,414,INK,22,'left');txt('n = '+n,830,448,AMB,22,'left');
  txt('barres : les termes de la somme',830,490,MUT,16,'left')},
 hit:function(x,y){var n=P.n,mx=1,wn=W5a;
  if(nr(x,y,W5b.X(P.a),W5b.Y(P.b),22))return{cur:'move',move:function(X,Y){P.a=rs(W5b.iX(X),.5,-2,2);P.b=rs(W5b.iY(Y),.5,-2,2)}};
  var hx=wn.X(n+.5);if(nr(x,y,hx,wn.y+wn.h-12,22))return{cur:'ew-resize',move:function(X){P.n=clamp(Math.round(wn.iX(X)-.5),1,8)}};return null}}
];
