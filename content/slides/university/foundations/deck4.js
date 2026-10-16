// ===== DECK 4: Opérations sur C =====
function bar(s,x,y,col,b){txt(s,x,y,col,22,'center');if(b)seg(x-6,y-15,x+6,y-15,col,2)}
function vec(w,a,col,dash){var X=w.X(a.x),Y=w.Y(a.y);if(dash){seg(w.X(0),w.Y(0),X,Y,col,2.5,[6,5])}else arrow(w.X(0),w.Y(0),X,Y,col,3)}
var W41=win(600,40,640,480,-4,4,-3,3);
var W42=win(600,40,640,480,-4,8,-3,6);
var W43=win(600,40,640,480,-6,6,-4.5,4.5);
var W44L=win(600,90,300,300,-3,3,-3,3),W44R=win(940,90,300,300,-4,4,-4,4);
S=[
{title:'Plan complexe',hint:'Interactif : glissez z (ambre) et w (bleu) ; choisissez l’opération à visualiser.',
 init:function(){return{z:{x:1.5,y:1},w:{x:-1,y:1.5},op:0}},
 sel:[{k:'op',opts:[[0,'z + w'],[1,'conjugué'],[2,'produit par i'],[3,'opposé']]}],
 steps:[
  {hd:'1 · Forme algébrique',f:function(){return[{t:'z='+cs(P.z)+',\\quad w='+cs(P.w),c:AMB},{h:1,t:'Unicité : $a+\\mathrm ib=a\'+\\mathrm ib\'\\iff a=a\'$ et $b=b\'$.',c:MUT}]}},
  {hd:'2 · L’opération choisie',f:function(){var z=P.z,w=P.w;return P.op===0?[{t:'z+w='+cs({x:z.x+w.x,y:z.y+w.y}),c:GRN},{h:1,t:'Somme de vecteurs : diagonale du parallélogramme.',c:MUT}]:
    P.op===1?[{t:'\\bar z='+cs({x:z.x,y:-z.y}),c:GRN},{h:1,t:'Symétrie par rapport à l’axe réel.',c:MUT}]:
    P.op===2?[{t:'\\mathrm i\\,z='+cs({x:-z.y,y:z.x}),c:GRN},{h:1,t:'Quart de tour direct autour de $0$.',c:MUT}]:[{t:'-z='+cs({x:-z.x,y:-z.y}),c:GRN},{h:1,t:'Symétrie par rapport à $0$.',c:MUT}]}},
  {hd:'3 · Partie réelle, partie imaginaire',f:function(){return[{t:'\\operatorname{Re}z='+nf(P.z.x)+',\\quad\\operatorname{Im}z='+nf(P.z.y),c:AMB},{t:'\\operatorname{Re}z=\\dfrac{z+\\bar z}{2},\\quad\\operatorname{Im}z=\\dfrac{z-\\bar z}{2\\mathrm i}',c:INK}]}}],
 fix:function(){P.z.x=clamp(P.z.x,-2,2);P.z.y=clamp(P.z.y,-1.5,1.5);P.w.x=clamp(P.w.x,-2,2);P.w.y=clamp(P.w.y,-1.5,1.5)},
 draw:function(){var w=W41,z=P.z,v=P.w;pan(w);grid(w,1,1,1);txt('Re',w.x+w.w-18,w.Y(0)-14,MUT,15,'center');txt('Im',w.X(0)+16,w.y+14,MUT,15,'center');
  var op=P.op;
  if(op===0){var s={x:z.x+v.x,y:z.y+v.y};seg(w.X(z.x),w.Y(z.y),w.X(s.x),w.Y(s.y),'rgba(106,169,255,.6)',2,[6,5]);seg(w.X(v.x),w.Y(v.y),w.X(s.x),w.Y(s.y),'rgba(232,163,61,.6)',2,[6,5]);arrow(w.X(0),w.Y(0),w.X(s.x),w.Y(s.y),GRN,3);txt('z+w',w.X(s.x)+16,w.Y(s.y)-14,GRN,20,'left')}
  if(op===1){var c={x:z.x,y:-z.y};seg(w.X(z.x),w.Y(z.y),w.X(c.x),w.Y(c.y),MUT,1.5,[4,4]);arrow(w.X(0),w.Y(0),w.X(c.x),w.Y(c.y),GRN,3);bar('z',w.X(c.x)+16,w.Y(c.y)+14,GRN,true);
    var d={x:v.x,y:-v.y};arrow(w.X(0),w.Y(0),w.X(d.x),w.Y(d.y),'rgba(106,169,255,.55)',2)}
  if(op===2){var q={x:-z.y,y:z.x};ctx.strokeStyle='rgba(95,208,160,.5)';ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.beginPath();var a0=Math.atan2(z.y,z.x),R=cabs(z)*w.w/8;ctx.arc(w.X(0),w.Y(0),R,-a0-1.5708,-a0,false);ctx.stroke();ctx.setLineDash([]);
    arrow(w.X(0),w.Y(0),w.X(q.x),w.Y(q.y),GRN,3);txt('i z',w.X(q.x)+14,w.Y(q.y)-12,GRN,20,'left')}
  if(op===3){var m={x:-z.x,y:-z.y};arrow(w.X(0),w.Y(0),w.X(m.x),w.Y(m.y),GRN,3);txt('−z',w.X(m.x)+14,w.Y(m.y)-12,GRN,20,'left')}
  arrow(w.X(0),w.Y(0),w.X(z.x),w.Y(z.y),AMB,3);arrow(w.X(0),w.Y(0),w.X(v.x),w.Y(v.y),BLU,3);txt('z',w.X(z.x)+14,w.Y(z.y)-12,AMB,22,'left');txt('w',w.X(v.x)+14,w.Y(v.y)-12,BLU,22,'left');
  handle(w.X(z.x),w.Y(z.y),AMB);handle(w.X(v.x),w.Y(v.y),BLU);unpan()},
 hit:function(x,y){var w=W41;
  if(nr(x,y,w.X(P.z.x),w.Y(P.z.y),22))return{cur:'move',move:function(X,Y){P.z.x=rs(w.iX(X),.25,-2,2);P.z.y=rs(w.iY(Y),.25,-1.5,1.5)}};
  if(nr(x,y,w.X(P.w.x),w.Y(P.w.y),22))return{cur:'move',move:function(X,Y){P.w.x=rs(w.iX(X),.25,-2,2);P.w.y=rs(w.iY(Y),.25,-1.5,1.5)}};return null}},

{title:'Module et inégalités',hint:'Interactif : glissez z (et w en mode « triangulaire ») ; les carrés montrent les aires.',
 init:function(){return{mode:0,z:{x:2,y:1.5},t:{z:{x:1.5,y:1},w:{x:1,y:1.5}}}},
 sel:[{k:'mode',opts:[[0,'Pythagore : z z̄ = |z|²'],[1,'Inégalité triangulaire']]}],
 steps:[
  {hd:'1 · Les données',f:function(){if(P.mode===0)return[{t:'z=a+\\mathrm ib,\\ a='+nf(P.z.x)+',\\ b='+nf(P.z.y),c:AMB},{t:'|z|=\\sqrt{a^2+b^2}='+nf(cabs(P.z),3),c:GRN}];
    var z=P.t.z,w=P.t.w;return[{t:'|z|='+nf(cabs(z),3)+',\\quad|w|='+nf(cabs(w),3),c:AMB},{t:'|z+w|='+nf(cabs({x:z.x+w.x,y:z.y+w.y}),3),c:GRN}]}},
  {hd:'2 · L’égalité ou l’inégalité',f:function(){if(P.mode===0){var a=P.z.x,b=P.z.y;return[{t:'a^2+b^2='+nf(a*a)+'+'+nf(b*b)+'='+nf(a*a+b*b),c:AMB},{t:'|z|^2='+nf(a*a+b*b),c:GRN}]}
    var z=P.t.z,w=P.t.w,s=cabs({x:z.x+w.x,y:z.y+w.y}),t=cabs(z)+cabs(w);return[{t:'|z+w|\\leq|z|+|w|',c:INK},{t:nf(s,3)+'\\leq'+nf(t,3),c:s<=t+1e-9?GRN:RED},{h:1,t:Math.abs(s-t)<1e-6?'Égalité : un vecteur nul, ou deux vecteurs de même direction et de même sens.':'Inégalité stricte : les vecteurs ne sont pas positivement colinéaires.',c:MUT}]}},
  {hd:'3 · Preuve en une ligne',f:function(){return P.mode===0?[{t:'z\\bar z=(a+\\mathrm ib)(a-\\mathrm ib)=a^2+b^2=|z|^2',c:GRN},{h:1,t:'Aire du carré sur l’hypoténuse = somme des aires des deux autres.',c:MUT}]:
    [{t:'|z+w|^2=|z|^2+2\\operatorname{Re}(z\\bar w)+|w|^2',c:INK},{t:'\\leq|z|^2+2|z||w|+|w|^2=(|z|+|w|)^2',c:GRN},{h:1,t:'Car $\\operatorname{Re}u\\leq|u|$ et $|z\\bar w|=|z||w|$.',c:MUT}]}}],
 fix:function(){P.z.x=clamp(P.z.x,.5,2.5);P.z.y=clamp(P.z.y,.5,2.5);['z','w'].forEach(function(k){P.t[k].x=clamp(P.t[k].x,-2,2);P.t[k].y=clamp(P.t[k].y,-1.5,1.5)})},
 draw:function(){var w=W42;pan(w);grid(w,1,1,2);
  if(P.mode===0){var a=P.z.x,b=P.z.y;function quad(pts,col,al){ctx.fillStyle=col.replace(')',','+al+')').replace('rgb','rgba');ctx.beginPath();pts.forEach(function(p,i){if(i)ctx.lineTo(w.X(p[0]),w.Y(p[1]));else ctx.moveTo(w.X(p[0]),w.Y(p[1]))});ctx.closePath();ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=2;ctx.stroke()}
    quad([[0,0],[a,0],[a,-a],[0,-a]],'rgb(232,163,61)',.25);quad([[a,0],[a,b],[a+b,b],[a+b,0]],'rgb(106,169,255)',.25);quad([[0,0],[a,b],[a-b,b+a],[-b,a]],'rgb(95,208,160)',.25);
    ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(w.X(0),w.Y(0));ctx.lineTo(w.X(a),w.Y(0));ctx.lineTo(w.X(a),w.Y(b));ctx.closePath();ctx.stroke();
    txt('a²='+nf(a*a,2).replace('{,}',','),w.X(a/2),w.Y(-a/2),AMB,18,'center');txt('b²='+nf(b*b,2).replace('{,}',','),w.X(a+b/2),w.Y(b/2),BLU,18,'center');txt('|z|²='+nf(a*a+b*b,2).replace('{,}',','),w.X((a-b)/2),w.Y((a+b)/2),GRN,18,'center');
    arrow(w.X(0),w.Y(0),w.X(a),w.Y(b),INK,3);txt('z',w.X(a)+14,w.Y(b)+4,INK,22,'left');handle(w.X(a),w.Y(b),AMB)}
  else{var z=P.t.z,v=P.t.w,s={x:z.x+v.x,y:z.y+v.y};arrow(w.X(0),w.Y(0),w.X(z.x),w.Y(z.y),AMB,3);arrow(w.X(z.x),w.Y(z.y),w.X(s.x),w.Y(s.y),BLU,3);arrow(w.X(0),w.Y(0),w.X(s.x),w.Y(s.y),GRN,3);
    txt('|z| = '+nf(cabs(z),2).replace('{,}',','),w.x+14,w.y+22,AMB,19,'left');txt('|w| = '+nf(cabs(v),2).replace('{,}',','),w.x+14,w.y+46,BLU,19,'left');txt('|z+w| = '+nf(cabs(s),2).replace('{,}',','),w.x+14,w.y+70,GRN,19,'left');
    handle(w.X(z.x),w.Y(z.y),AMB);handle(w.X(s.x),w.Y(s.y),BLU)}
  unpan()},
 hit:function(x,y){var w=W42;if(P.mode===0){if(nr(x,y,w.X(P.z.x),w.Y(P.z.y),22))return{cur:'move',move:function(X,Y){P.z.x=rs(w.iX(X),.25,.5,2.5);P.z.y=rs(w.iY(Y),.25,.5,2.5)}};return null}
  var z=P.t.z,v=P.t.w;if(nr(x,y,w.X(z.x),w.Y(z.y),22))return{cur:'move',move:function(X,Y){P.t.z.x=rs(w.iX(X),.25,-2,2);P.t.z.y=rs(w.iY(Y),.25,-1.5,1.5)}};
  if(nr(x,y,w.X(z.x+v.x),w.Y(z.y+v.y),22))return{cur:'move',move:function(X,Y){P.t.w.x=rs(w.iX(X)-P.t.z.x,.25,-2,2);P.t.w.y=rs(w.iY(Y)-P.t.z.y,.25,-1.5,1.5)}};return null}},

{title:'Inverse et quotient',hint:'Interactif : glissez z (et w) ; le bouton « Balise » retrouve une entrée de la transformation T.',
 init:function(){return{mode:0,pre:0,z:{x:2,y:1},w:{x:3,y:-2}}},
 sel:[{k:'mode',opts:[[0,'Inverse 1/z'],[1,'Quotient w/z']]},{k:'pre',opts:[[0,'Libre'],[1,'Balise']]}],
 on:function(k,v){if(k==='pre'&&v){P.mode=1;P.w={x:3,y:3};P.z={x:1,y:1}}if(k==='pre'&&!v){}},
 steps:[
  {hd:'1 · Multiplier par le conjugué',f:function(){return P.mode===0?[{t:'\\dfrac1z=\\dfrac{\\bar z}{z\\bar z}=\\dfrac{\\bar z}{|z|^2}',c:GRN}]:[{t:'\\dfrac wz=\\dfrac{w\\bar z}{z\\bar z}=\\dfrac{w\\bar z}{|z|^2}',c:GRN}]}},
  {hd:'2 · Calcul avec vos valeurs',f:function(){var z=P.z,w=P.w,d=z.x*z.x+z.y*z.y;if(P.mode===0){var q={x:z.x/d,y:-z.y/d};return[{t:'z='+cs(z)+',\\ |z|^2='+nf(d),c:AMB},{t:'\\dfrac1z=\\dfrac{'+cx(z.x,-z.y)+'}{'+nf(d)+'}\\approx '+cs(q),c:GRN}]}
    var n={x:w.x*z.x+w.y*z.y,y:w.y*z.x-w.x*z.y},q2=cdiv(w,z);return[{t:'w\\bar z=('+cs(w)+')('+cx(z.x,-z.y)+')='+cs(n),c:AMB},{t:'\\dfrac wz=\\dfrac{'+cs(n)+'}{'+nf(d)+'}\\approx '+cs(q2),c:GRN}]}},
  {hd:'3 · Contrôle',f:function(){var z=P.z,w=P.w;if(P.mode===0){var q=cdiv({x:1,y:0},z),p=cmul(z,q);return[{t:'z\\times\\dfrac1z\\approx '+cs(p),c:GRN},{h:1,t:'$\\dfrac1z$ : direction de $\\bar z$, module $\\dfrac1{|z|}$.',c:MUT}]}
    var q2=cdiv(w,z),p2=cmul(z,q2);return[{t:'z\\times\\dfrac wz\\approx '+cs(p2)+'=w',c:Math.abs(p2.x-w.x)<1e-9&&Math.abs(p2.y-w.y)<1e-9?GRN:RED}]}}],
 fix:function(){P.z.x=clamp(P.z.x,-5.5,5.5);P.z.y=clamp(P.z.y,-4,4);if(Math.hypot(P.z.x,P.z.y)<.5){P.z.x=.5;P.z.y=0}P.w.x=clamp(P.w.x,-5.5,5.5);P.w.y=clamp(P.w.y,-4,4)},
 draw:function(){var w=W43,z=P.z,v=P.w;pan(w);grid(w,1,1,2);ring(w.X(0),w.Y(0),w.w/12,'rgba(143,166,196,.5)',1.5,[5,5]);
  var zb={x:z.x,y:-z.y};seg(w.X(z.x),w.Y(z.y),w.X(zb.x),w.Y(zb.y),MUT,1.2,[4,4]);vec(w,zb,'rgba(143,166,196,.8)',true);
  arrow(w.X(0),w.Y(0),w.X(z.x),w.Y(z.y),AMB,3);txt('z',w.X(z.x)+14,w.Y(z.y)-12,AMB,22,'left');bar('z',w.X(zb.x)+14,w.Y(zb.y)+14,MUT,true);
  var q;if(P.mode===0){q=cdiv({x:1,y:0},z)}else{q=cdiv(v,z);arrow(w.X(0),w.Y(0),w.X(v.x),w.Y(v.y),BLU,3);txt('w',w.X(v.x)+14,w.Y(v.y)-12,BLU,22,'left')}
  arrow(w.X(0),w.Y(0),w.X(q.x),w.Y(q.y),GRN,3);txt(P.mode===0?'1/z':'w/z',w.X(q.x)+14,w.Y(q.y)-12,GRN,22,'left');
  handle(w.X(z.x),w.Y(z.y),AMB);if(P.mode===1)handle(w.X(v.x),w.Y(v.y),BLU);unpan()},
 hit:function(x,y){var w=W43;if(nr(x,y,w.X(P.z.x),w.Y(P.z.y),22))return{cur:'move',move:function(X,Y){P.z.x=rs(w.iX(X),.5,-5.5,5.5);P.z.y=rs(w.iY(Y),.5,-4,4)}};
  if(P.mode===1&&nr(x,y,w.X(P.w.x),w.Y(P.w.y),22))return{cur:'move',move:function(X,Y){P.w.x=rs(w.iX(X),.5,-5.5,5.5);P.w.y=rs(w.iY(Y),.5,-4,4)}};return null}}
];
