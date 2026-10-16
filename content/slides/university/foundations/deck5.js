// ===== DECK 5: Second degré dans C =====
function csub(a,b){return{x:a.x-b.x,y:a.y-b.y}}
function cadd(a,b){return{x:a.x+b.x,y:a.y+b.y}}
var W51L=win(600,90,300,300,-4,4,-4,4),W51R=win(940,90,300,300,-20,20,-20,20);
function setD(x,y){P.d={x:x,y:y};P.w={x:x*x-y*y,y:2*x*y}}
function setW(x,y){P.w={x:x,y:y};P.d=sqrtc(P.w)}
var PR51=[[3,2,'5+12\\mathrm i'],[2,.5,'15/4+2\\mathrm i'],[.5,-2,'-15/4-2\\mathrm i'],[0,2,'-4'],[0,0,'0']];
var W52=win(600,40,640,480,-4,4,-3,3);
var PR52=[{b:{x:-1,y:-3},c:{x:-4,y:3}},{b:{x:-2,y:0},c:{x:2,y:0}},{b:{x:0,y:0},c:{x:-4,y:0}},{b:{x:-2,y:-2},c:{x:0,y:2}}];
function roots52(b,c){var Dl=csub(cmul(b,b),{x:4*c.x,y:4*c.y}),d=sqrtc(Dl);return[{x:(-b.x+d.x)/2,y:(-b.y+d.y)/2},{x:(-b.x-d.x)/2,y:(-b.y-d.y)/2}]}
var W53=win(600,40,640,480,0,1,0,1);
function p53(){return P3(W53.x,W53.y,W53.w,W53.h,40,[0,0,1.6],P.cam)}
function bc53(){var a=cmul(P.r1,P.r1),b=cmul(P.r2,P.r2);return{Z1:a,Z2:b,b:{x:-(a.x+b.x),y:-(a.y+b.y)},c:cmul(a,b)}}
function hgt(x,y,Z1,Z2){var z2=cmul({x:x,y:y},{x:x,y:y}),p=cmul(csub(z2,Z1),csub(z2,Z2));return .7*Math.log(1+cabs(p))}

S=[
{title:'Racines carrées',hint:'Interactif : glissez δ (gauche) ou w (droite) ; les boutons placent des carrés construits dans le plan.',
 init:function(){return{d:{x:3,y:2},w:{x:5,y:12},pre:0}},
 sel:[{k:'pre',tex:true,lab:'w =',opts:PR51.map(function(p,i){return[i,p[2]]})}],
 on:function(k,v){if(k==='pre')setD(PR51[v][0],PR51[v][1])},
 steps:[
  {hd:'1 · Définition',f:function(){return[{t:'\\delta^2=w',c:AMB},{t:'w='+cs(P.w)+'\\ \\Rightarrow\\ \\delta=\\pm('+cs(P.d)+')',c:GRN},{h:1,t:'Un complexe non nul a deux racines carrées, opposées.',c:MUT}]}},
  {hd:'2 · Le système en a et b',f:function(){var w=P.w,m=cabs(w);return[{t:'\\delta=a+\\mathrm ib:\\quad\\begin{cases}a^2-b^2=u\\\\2ab=v\\\\a^2+b^2=|w|\\end{cases}',c:INK},{t:'u='+nf(w.x)+',\\ v='+nf(w.y)+',\\ |w|='+nf(m,3),c:MUT}]}},
  {hd:'3 · Résolution',f:function(){var w=P.w,m=cabs(w),a2=(m+w.x)/2,b2=(m-w.x)/2,d=sqrtc(w),chk=cmul(d,d);
    return[{t:'a^2=\\dfrac{|w|+u}{2}='+nf(a2,3)+',\\quad b^2=\\dfrac{|w|-u}{2}='+nf(b2,3),c:AMB},{h:1,t:'$ab$ a le signe de $v='+nf(w.y)+'$.',c:MUT},{t:'\\delta=\\pm('+cs(d)+'),\\ \\delta^2='+cs(chk),c:Math.abs(chk.x-w.x)<1e-9&&Math.abs(chk.y-w.y)<1e-9?GRN:RED}]}}],
 fix:function(){},
 draw:function(){var L=W51L,R=W51R,d=P.d,w=P.w;pan(L);grid(L,1,1,1);arrow(L.X(0),L.Y(0),L.X(d.x),L.Y(d.y),AMB,3);arrow(L.X(0),L.Y(0),L.X(-d.x),L.Y(-d.y),'rgba(232,163,61,.55)',3);
  txt('δ',L.X(d.x)+14,L.Y(d.y)-12,AMB,22,'left');txt('−δ',L.X(-d.x)+14,L.Y(-d.y)-12,'rgba(232,163,61,.8)',22,'left');handle(L.X(d.x),L.Y(d.y),AMB);unpan();
  pan(R);grid(R,5,5,10);arrow(R.X(0),R.Y(0),R.X(w.x),R.Y(w.y),BLU,3);txt('w = δ²',R.X(w.x)+14,R.Y(w.y)-12,BLU,20,'left');handle(R.X(w.x),R.Y(w.y),BLU);unpan();
  txt('plan de δ',L.x+L.w/2,L.y-20,AMB,19,'center');txt('plan de w',R.x+R.w/2,R.y-20,BLU,19,'center');
  txt('|w| = '+nf(cabs(w),2).replace('{,}',','),L.x,430,MUT,19,'left')},
 hit:function(x,y){var L=W51L,R=W51R;
  if(nr(x,y,L.X(P.d.x),L.Y(P.d.y),22))return{cur:'move',move:function(X,Y){setD(rs(L.iX(X),.5,-3,3),rs(L.iY(Y),.5,-3,3));P.pre=-1}};
  if(nr(x,y,R.X(P.w.x),R.Y(P.w.y),22))return{cur:'move',move:function(X,Y){setW(rs(R.iX(X),1,-18,18),rs(R.iY(Y),1,-18,18));P.pre=-1}};return null}},

{title:'Second degré dans ℂ',hint:'Interactif : glissez les racines z₁ et z₂ ; b et c suivent. Comparez deux racines distinctes et une racine double.',
 init:function(){var r=roots52(PR52[2].b,PR52[2].c);return{z1:r[0],z2:r[1],pre:2}},
 sel:[{k:'pre',tex:true,lab:'Équation',opts:[[0,'z^2-(1+3\\mathrm i)z-4+3\\mathrm i'],[1,'z^2-2z+2'],[2,'z^2-4'],[3,'(z-(1+\\mathrm i))^2']]}],
 on:function(k,v){if(k==='pre'){var r=roots52(PR52[v].b,PR52[v].c);P.z1=r[0];P.z2=r[1]}},
 steps:[
  {hd:'1 · Coefficients et racines',f:function(){var s=cadd(P.z1,P.z2),p=cmul(P.z1,P.z2);return[{t:'z_1='+cs(P.z1)+',\\ z_2='+cs(P.z2),c:MUT},{t:'b=-(z_1+z_2)='+cs({x:-s.x,y:-s.y}),c:AMB},{t:'c=z_1z_2='+cs(p),c:BLU}]}},
  {hd:'2 · Discriminant et racine carrée',f:function(){var dl=csub(P.z1,P.z2),Dl=cmul(dl,dl);return[{t:'\\Delta=b^2-4c=(z_1-z_2)^2='+cs(Dl),c:AMB},{t:'\\delta=z_1-z_2='+cs(dl)+',\\ \\ z=\\dfrac{-b\\pm\\delta}{2}',c:GRN}]}},
  {hd:'3 · Viète et factorisation',f:function(){var s=cadd(P.z1,P.z2),p=cmul(P.z1,P.z2);return[{t:'z_1+z_2=-\\dfrac ba='+cs(s),c:AMB},{t:'z_1z_2=\\dfrac ca='+cs(p),c:BLU},{t:'z^2+bz+c=(z-z_1)(z-z_2)',c:GRN}]}}],
 fix:function(){['z1','z2'].forEach(function(k){P[k].x=clamp(P[k].x,-3.75,3.75);P[k].y=clamp(P[k].y,-2.75,2.75)})},
 draw:function(){var w=W52,a=P.z1,b=P.z2,m={x:(a.x+b.x)/2,y:(a.y+b.y)/2};pan(w);grid(w,1,1,2);
  seg(w.X(a.x),w.Y(a.y),w.X(b.x),w.Y(b.y),'rgba(143,166,196,.7)',1.5,[6,5]);dot(w.X(m.x),w.Y(m.y),5,GRN);
  arrow(w.X(m.x),w.Y(m.y),w.X(a.x),w.Y(a.y),AMB,2.5);arrow(w.X(m.x),w.Y(m.y),w.X(b.x),w.Y(b.y),BLU,2.5);
  txt('z₁',w.X(a.x)+14,w.Y(a.y)-14,AMB,22,'left');txt('z₂',w.X(b.x)-14,w.Y(b.y)+16,BLU,22,'right');txt('z₁,₂ = −b/2 ± δ/2  (flèches depuis −b/2)',w.x+10,w.y+w.h-14,MUT,16,'left');
  handle(w.X(a.x),w.Y(a.y),AMB);handle(w.X(b.x),w.Y(b.y),BLU);unpan()},
 hit:function(x,y){var w=W52;
  if(nr(x,y,w.X(P.z1.x),w.Y(P.z1.y),22))return{cur:'move',move:function(X,Y){P.z1.x=rs(w.iX(X),.25,-3.75,3.75);P.z1.y=rs(w.iY(Y),.25,-2.75,2.75);P.pre=-1}};
  if(nr(x,y,w.X(P.z2.x),w.Y(P.z2.y),22))return{cur:'move',move:function(X,Y){P.z2.x=rs(w.iX(X),.25,-3.75,3.75);P.z2.y=rs(w.iY(Y),.25,-2.75,2.75);P.pre=-1}};return null}},

{title:'Paysage de |p(z)|',hint:'Interactif : tournez le paysage ; glissez les racines r₁ (ambre) et r₂ (bleu) sur le sol.',
 init:function(){return{r1:{x:1,y:1},r2:{x:2,y:-1},cam:{yaw:-.6,pitch:.75},pre:1}},
 sel:[{k:'pre',tex:true,lab:'Polynôme',opts:[[1,'z^4-(3-2\\mathrm i)z^2+8+6\\mathrm i'],[0,'\\text{Libre}']]}],
 on:function(k,v){if(k==='pre'&&v===1){P.r1={x:1,y:1};P.r2={x:2,y:-1}}},
 steps:[
  {hd:'1 · Polynôme bicarré',f:function(){var q=bc53();return[{t:'p(z)=(z^2-r_1^2)(z^2-r_2^2)=z^4+bz^2+c',c:INK},{t:'b='+cs(q.b)+',\\quad c='+cs(q.c),c:AMB}]}},
  {hd:'2 · On pose Z = z²',f:function(){var q=bc53();return[{t:'Z^2+bZ+c=0',c:INK},{t:'Z_1=r_1^2='+cs(q.Z1)+',\\ Z_2=r_2^2='+cs(q.Z2),c:BLU}]}},
  {hd:'3 · Au plus quatre racines distinctes',f:function(){var q=bc53(),pv=function(r){var z2=cmul(r,r),p=cadd(cadd(cmul(z2,z2),cmul(q.b,z2)),q.c);return cabs(p)};
    return[{t:'\\pm r_1=\\pm('+cs(P.r1)+')',c:AMB},{t:'\\pm r_2=\\pm('+cs(P.r2)+')',c:BLU},{t:'|p(r_1)|='+nf(pv(P.r1),4)+',\\ |p(r_2)|='+nf(pv(P.r2),4),c:GRN}]}}],
 fix:function(){['r1','r2'].forEach(function(k){P[k].x=clamp(P[k].x,-2.9,2.9);P[k].y=clamp(P[k].y,-2.9,2.9)})},
 draw:function(){var p3=p53(),q=bc53(),N=34,hs=[],fs=[],i,j;pan(W53);
  for(i=0;i<=3;i++){}
  for(var g=-3;g<=3;g++){var a=p3.pr(g,-3,-.15),b=p3.pr(g,3,-.15),c=p3.pr(-3,g,-.15),d=p3.pr(3,g,-.15);seg(a.X,a.Y,b.X,b.Y,'#24364f',1);seg(c.X,c.Y,d.X,d.Y,'#24364f',1)}
  for(i=0;i<=N;i++){hs.push([]);for(j=0;j<=N;j++){var x=-3+6*i/N,y=-3+6*j/N;hs[i].push(hgt(x,y,q.Z1,q.Z2))}}
  for(i=0;i<N;i++)for(j=0;j<N;j++){var x0=-3+6*i/N,x1=-3+6*(i+1)/N,y0=-3+6*j/N,y1=-3+6*(j+1)/N,h=(hs[i][j]+hs[i+1][j]+hs[i][j+1]+hs[i+1][j+1])/4,t=clamp(h/3.6,0,1);
    fs.push({pts:[[x0,y0,hs[i][j]],[x1,y0,hs[i+1][j]],[x1,y1,hs[i+1][j+1]],[x0,y1,hs[i][j+1]]],f:[95+(70-95)*t,208+(110-208)*t,160+(200-160)*t],a:1,s:'rgba(255,255,255,.10)',sh:true})}
  flush(fs,p3);
  [[P.r1,AMB,1],[P.r2,BLU,1],[{x:-P.r1.x,y:-P.r1.y},AMB,0],[{x:-P.r2.x,y:-P.r2.y},BLU,0]].forEach(function(o){var pp=p3.pr(o[0].x,o[0].y,0),fl=p3.pr(o[0].x,o[0].y,-.15);seg(pp.X,pp.Y,fl.X,fl.Y,o[1],1.5,[3,3]);
    if(o[2])handle(pp.X,pp.Y,o[1]);else{dot(pp.X,pp.Y,6,PAN);ring(pp.X,pp.Y,6,o[1],2.5)}});
  txt('hauteur = 0,7 · ln(1 + |p(z)|) ; les racines sont les creux',W53.x+12,W53.y+W53.h-16,MUT,16,'left');unpan()},
 hit:function(x,y){var p3=p53(),ks=['r1','r2'];for(var i=0;i<2;i++){var r=P[ks[i]],q=p3.pr(r.x,r.y,0);
   if(nr(x,y,q.X,q.Y,24)){var k=ks[i],f0=p3.un(x,y,0),r0={x:r.x,y:r.y};return{cur:'move',move:function(X,Y){var f=p3.un(X,Y,0);P[k].x=rs(r0.x+f.x-f0.x,.1,-2.9,2.9);P[k].y=rs(r0.y+f.y-f0.y,.1,-2.9,2.9);P.pre=0}}}}
  return rotHit(W53,P.cam)(x,y)}}
];
