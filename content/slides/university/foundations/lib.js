// ===== LIB: constants, helpers, 3D, engine core (no boot call) =====
var INK='#f4f1ea',MUT='#8fa6c4',AMB='#e8a33d',GRN='#5fd0a0',RED='#ff7a7a',GRID='#24364f',PAN='#13243b',BLU='#6aa9ff',VIO='#b48cff';
var $=function(i){return document.getElementById(i)};
var ctx=$('c').getContext('2d'),cvs=$('c'),col=$('col');
var CAM={k:1,x:0,y:0};
var P={},D={},step=1,all=false,si=0,NS=1,DRG=null,TT=0,blk=[],lastU=0,pend=false,S=[];
var FONT='"STIX Two Text","Latin Modern Roman",Georgia,serif';
function vis(n){return all||step>=n}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function rs(v,s,a,b){return +clamp(Math.round(v/s)*s,a,b).toFixed(6)}
function nr(x,y,X,Y,r){return (x-X)*(x-X)+(y-Y)*(y-Y)<=r*r}
function nf(x,d){d=d==null?2:d;var k=Math.pow(10,d);x=Math.round(x*k)/k;if(x===0)x=0;return String(x).replace('.','{,}')}
function sgn(x){return x<0?'-':'+'}
function cx(re,im){var r=Math.round(re*100)/100,i=Math.round(im*100)/100;if(r===0)r=0;if(i===0)i=0;
  if(i===0)return nf(r);var is=Math.abs(i)===1?'':nf(Math.abs(i));
  if(r===0)return (i<0?'-':'')+is+'\\mathrm{i}';return nf(r)+(i<0?'-':'+')+is+'\\mathrm{i}'}
function big(n){var s=String(Math.round(n)),o='';while(s.length>3){o='\\,'+s.slice(-3)+o;s=s.slice(0,-3)}return s+o}
function C(n,k){if(k<0||k>n)return 0;var r=1;for(var i=1;i<=k;i++)r=r*(n-k+i)/i;return Math.round(r)}
function VF(b){return b?'\\text{Vrai}':'\\text{Faux}'}
function inD(c,x,y){return Math.hypot(x-c.x,y-c.y)<=c.r+1e-12}
function cmul(a,b){return{x:a.x*b.x-a.y*b.y,y:a.x*b.y+a.y*b.x}}
function cdiv(a,b){var d=b.x*b.x+b.y*b.y;return{x:(a.x*b.x+a.y*b.y)/d,y:(a.y*b.x-a.x*b.y)/d}}
function cabs(a){return Math.hypot(a.x,a.y)}
function cs(a){return cx(a.x,a.y)}
function sqrtc(w){var m=Math.hypot(w.x,w.y),a=Math.sqrt(Math.max(0,(m+w.x)/2)),b=Math.sqrt(Math.max(0,(m-w.x)/2));return{x:a,y:w.y<0?-b:b}}
function mn(s){return String(s).replace(/-/g,'−')}
// ---- canvas helpers
function win(x,y,w,h,xa,xb,ya,yb){var o={x:x,y:y,w:w,h:h,xa:xa,xb:xb,ya:ya,yb:yb};
  o.X=function(u){return x+(u-xa)/(xb-xa)*w};o.Y=function(v){return y+(yb-v)/(yb-ya)*h};
  o.iX=function(X){return xa+(X-x)/w*(xb-xa)};o.iY=function(Y){return yb-(Y-y)/h*(yb-ya)};
  o.has=function(X,Y){return X>=x&&X<=x+w&&Y>=y&&Y<=y+h};return o}
function pan(wn,fill){ctx.save();ctx.fillStyle=fill||PAN;ctx.fillRect(wn.x,wn.y,wn.w,wn.h);ctx.beginPath();ctx.rect(wn.x,wn.y,wn.w,wn.h);ctx.clip()}
function unpan(){ctx.restore()}
function txt(s,x,y,col,size,al){ctx.font=(size||18)+'px '+FONT;ctx.textAlign=al||'left';ctx.textBaseline='middle';if(col!=='#0d1117'){ctx.lineJoin='round';ctx.lineWidth=4;ctx.strokeStyle='rgba(19,36,59,.88)';ctx.strokeText(s,x,y)}ctx.fillStyle=col||INK;ctx.fillText(s,x,y)}
function seg(x1,y1,x2,y2,col,w,dash){ctx.strokeStyle=col;ctx.lineWidth=w||2;ctx.setLineDash(dash||[]);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.setLineDash([])}
function dot(x,y,r,col){ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill()}
function ring(x,y,r,col,w,dash){ctx.strokeStyle=col;ctx.lineWidth=w||2;ctx.setLineDash(dash||[]);ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.stroke();ctx.setLineDash([])}
function arrow(x1,y1,x2,y2,col,w){seg(x1,y1,x2,y2,col,w||3);var a=Math.atan2(y2-y1,x2-x1),h=11;
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-h*Math.cos(a-.4),y2-h*Math.sin(a-.4));ctx.lineTo(x2-h*Math.cos(a+.4),y2-h*Math.sin(a+.4));ctx.closePath();ctx.fill()}
function handle(x,y,col,r){r=r||8;dot(x,y,r,col);ctx.globalAlpha=.45+.45*Math.sin(TT*3.2);ring(x,y,r+8,col,2,[4,4]);ctx.globalAlpha=1}
function grid(wn,sx,sy,lab,axes){ctx.lineWidth=1;ctx.strokeStyle=GRID;ctx.beginPath();
  var u,v;for(u=Math.ceil(wn.xa/sx-1e-9)*sx;u<=wn.xb+1e-9;u+=sx){ctx.moveTo(wn.X(u),wn.y);ctx.lineTo(wn.X(u),wn.y+wn.h)}
  for(v=Math.ceil(wn.ya/sy-1e-9)*sy;v<=wn.yb+1e-9;v+=sy){ctx.moveTo(wn.x,wn.Y(v));ctx.lineTo(wn.x+wn.w,wn.Y(v))}ctx.stroke();
  if(axes!==false){ctx.strokeStyle=MUT;ctx.lineWidth=2;ctx.beginPath();
    if(wn.ya<=0&&wn.yb>=0){ctx.moveTo(wn.x,wn.Y(0));ctx.lineTo(wn.x+wn.w,wn.Y(0))}
    if(wn.xa<=0&&wn.xb>=0){ctx.moveTo(wn.X(0),wn.y);ctx.lineTo(wn.X(0),wn.y+wn.h)}ctx.stroke()}
  if(lab){var yy=clamp(wn.Y(0),wn.y+12,wn.y+wn.h-12),xx=clamp(wn.X(0),wn.x+14,wn.x+wn.w-14);
    for(u=Math.ceil(wn.xa/lab-1e-9)*lab;u<=wn.xb+1e-9;u+=lab){if(Math.abs(u)<1e-9)continue;txt(mn(nf(u,1).replace('{,}',',')),wn.X(u),yy+(yy>wn.y+wn.h-20?-10:12),MUT,14,'center')}
    for(v=Math.ceil(wn.ya/lab-1e-9)*lab;v<=wn.yb+1e-9;v+=lab){if(Math.abs(v)<1e-9)continue;txt(mn(nf(v,1).replace('{,}',',')),xx+(xx<wn.x+30?14:-12),wn.Y(v),MUT,14,xx<wn.x+30?'left':'right')}}}
// ---- interval sets (closed intervals as [a,b]); used by decks 3 and 6
function inorm(a){a=a.filter(function(q){return q[0]<=q[1]+1e-12}).map(function(q){return [q[0],q[1]]}).sort(function(p,q){return p[0]-q[0]});
  var o=[];a.forEach(function(q){if(o.length&&q[0]<=o[o.length-1][1]+1e-12){o[o.length-1][1]=Math.max(o[o.length-1][1],q[1])}else o.push(q)});return o}
function iint(a,b){var o=[];a.forEach(function(p){b.forEach(function(q){var l=Math.max(p[0],q[0]),r=Math.min(p[1],q[1]);if(l<=r+1e-12)o.push([l,Math.max(l,r)])})});return inorm(o)}
function iin(a,x){return a.some(function(q){return x>=q[0]-1e-12&&x<=q[1]+1e-12})}
// ---- 3D (orthographic, z up)
var M={};
M.pj=function(yw,pt,x,y,z){var cy=Math.cos(yw),sy=Math.sin(yw),cp=Math.cos(pt),sp=Math.sin(pt),x1=cy*x-sy*y,y1=sy*x+cy*y;return{u:x1,v:z*cp+y1*sp,d:y1*cp-z*sp}};
M.upj=function(yw,pt,u,v,z){var cy=Math.cos(yw),sy=Math.sin(yw),cp=Math.cos(pt),sp=Math.sin(pt),y1=(v-z*cp)/sp;return{x:cy*u+sy*y1,y:-sy*u+cy*y1}};
function P3(x0,y0,w,h,s,c,cam){return{x0:x0,y0:y0,w:w,h:h,s:s,c:c,cam:cam,
  has:function(X,Y){return X>=x0&&X<=x0+w&&Y>=y0&&Y<=y0+h},
  pr:function(x,y,z){var q=M.pj(cam.yaw,cam.pitch,x-c[0],y-c[1],z-c[2]);return{X:x0+w/2+s*q.u,Y:y0+h/2-s*q.v,d:q.d}},
  un:function(X,Y,zf){var q=M.upj(cam.yaw,cam.pitch,(X-x0-w/2)/s,-(Y-y0-h/2)/s,zf-c[2]);return{x:q.x+c[0],y:q.y+c[1]}}}}
var L3=[-0.35,-0.55,0.76];
function shade(n){var m=Math.hypot(n[0],n[1],n[2])||1;return .5+.5*Math.abs((n[0]*L3[0]+n[1]*L3[1]+n[2]*L3[2])/m)}
function flush(fs,p3){fs.forEach(function(f){f._p=f.pts.map(function(p){return p3.pr(p[0],p[1],p[2])});var d=0;f._p.forEach(function(p){d+=p.d});f._d=d/f._p.length});
  fs.sort(function(a,b){return b._d-a._d});
  fs.forEach(function(f){ctx.beginPath();f._p.forEach(function(p,i){if(i)ctx.lineTo(p.X,p.Y);else ctx.moveTo(p.X,p.Y)});ctx.closePath();
    var k=1;if(f.sh){var a=f.pts[0],b=f.pts[1],c=f.pts[2],u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],v=[c[0]-a[0],c[1]-a[1],c[2]-a[2]];k=shade([u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]])}
    ctx.fillStyle='rgba('+Math.round(f.f[0]*k)+','+Math.round(f.f[1]*k)+','+Math.round(f.f[2]*k)+','+(f.a==null?1:f.a)+')';ctx.fill();
    if(f.s){ctx.strokeStyle=f.s;ctx.lineWidth=1;ctx.stroke()}})}
function rotHit(wn,cam){return function(x,y){if(!wn.has(x,y))return null;var x0=x,y0=y,yw=cam.yaw,pt=cam.pitch;
  return{cur:'grab',move:function(X,Y){cam.yaw=yw+(X-x0)*.01;cam.pitch=clamp(pt+(Y-y0)*.01,.12,1.45)}}}}
// ---- DOM / MathJax
function build(h){var d=document.createDocumentFragment();h.split('$').forEach(function(p,i){if(!p)return;
  if(i%2){var m=MathJax.tex2svg(p,{display:false});m.querySelectorAll('mjx-assistive-mml').forEach(function(e){e.remove()});d.appendChild(m)}
  else{var s=document.createElement('span');s.textContent=p;d.appendChild(s)}});return d}
function tbl(r){var t=document.createElement('table');t.className='sg';r.forEach(function(row){var tr=document.createElement('tr');
  row.forEach(function(c){var td=document.createElement('td');if(c)td.appendChild(build('$'+c+'$'));tr.appendChild(td)});t.appendChild(tr)});return t}
function setLines(i,arr){var cont=blk[i].l;while(cont.children.length>arr.length)cont.removeChild(cont.lastChild);
  while(cont.children.length<arr.length){var d=document.createElement('div');d.className='ln';cont.appendChild(d)}
  arr.forEach(function(o,k){var d=cont.children[k],key=(o.tb?JSON.stringify(o.tb):o.t)+'|'+o.c+'|'+o.h;if(d._k===key)return;d._k=key;d.style.color=o.c||INK;d.innerHTML='';
    d.appendChild(o.tb?tbl(o.tb):build(o.h?o.t:'$'+o.t+'$'))})}
// ---- scene control
function fixP(){var sc=S[si];if(sc.fix)sc.fix()}
function snapD(){var sc=S[si];if(matchMedia('(prefers-reduced-motion: reduce)').matches)TT=0;
  if(sc.tw)sc.tw.forEach(function(k){D[k]=P[k]})}
function upd(){var sc=S[si];
  for(var i=0;i<NS;i++){var on=all||i<step,b=blk[i];
    if(on){setLines(i,sc.steps[i].f());if(b.style.display!=='block'){b.style.display='block';b.style.animation='none';void b.offsetWidth;b.style.animation=''}}else b.style.display='none'}
  $('st').textContent='Scène '+(si+1)+'/'+S.length+' · étape '+Math.min(step,NS)+'/'+NS;
  Array.prototype.forEach.call($('top').children,function(c,i){c.classList.toggle('on',i===si)});
  (sc.sel||[]).forEach(function(g,gi){Array.prototype.forEach.call($('sel').querySelectorAll('[data-g="'+gi+'"]'),function(b){b.classList.toggle('on',String(P[g.k])===b.getAttribute('data-v'))})});
  ctlSync()}
function ctlSync(){var sc=S[si];(sc.sl||[]).forEach(function(s,i){var r=$('s'+i),v=$('v'+i);if(!r)return;if(document.activeElement!==r)r.value=P[s.k];v.textContent=(s.fmt?s.fmt(P[s.k]):String(nf(+P[s.k],2)).replace('{,}',','))})}
function after(){if(pend)return;pend=true;requestAnimationFrame(function(){pend=false;upd()})}
function loadScene(i,st){si=clamp(i,0,S.length-1);var sc=S[si];
  if(!sc.P){sc.P=sc.init();sc.D={};(sc.tw||[]).forEach(function(k){sc.D[k]=sc.P[k]})}
  P=sc.P;D=sc.D;NS=sc.steps.length;step=st==null?1:st;all=false;$('al').classList.remove('on');DRG=null;
  if($('fit-objects'))$('fit-objects').hidden=!sc.fit;
  $('ttl').textContent=sc.title;$('hint').textContent=sc.hint;
  col.innerHTML='';blk=[];sc.steps.forEach(function(s){var b=document.createElement('div');b.className='blk';var h=document.createElement('div');h.className='hd';h.textContent=s.hd;var l=document.createElement('div');b.appendChild(h);b.appendChild(l);b.l=l;col.appendChild(b);blk.push(b)});
  var se=$('sel'),sl=$('sl');se.innerHTML='';sl.innerHTML='';
  var rows=Math.max(0,sc.selRows==null?((sc.sel&&sc.sel.length)?1:0):sc.selRows);
  se.style.height=rows*40+'px';sl.style.top=(528+rows*40+6)+'px';
  (sc.sel||[]).forEach(function(g,gi){var grp=document.createElement('div');grp.className='grp';if(g.lab){var lb=document.createElement('span');lb.className='gl';lb.textContent=g.lab;grp.appendChild(lb)}
    g.opts.forEach(function(o){var b=document.createElement('button');b.className='b sm';b.setAttribute('data-g',gi);b.setAttribute('data-v',String(o[0]));
      if(g.tex)b.appendChild(build('$'+o[1]+'$'));else b.textContent=o[1];
      b.onclick=function(){if(typeof o[0]==='number'||typeof o[0]==='boolean')P[g.k]=o[0];else P[g.k]=o[0];if(sc.on)sc.on(g.k,o[0]);fixP();upd()};grp.appendChild(b)});se.appendChild(grp)});
  (sc.sl||[]).forEach(function(s,k){var r=document.createElement('div');r.className='row';var lb=document.createElement('div');lb.className='lb';lb.appendChild(build('$'+s.l+'$'));
    var inp=document.createElement('input');inp.type='range';inp.id='s'+k;inp.min=s.min;inp.max=s.max;inp.step=s.step;inp.value=P[s.k];
    inp.oninput=function(){var v=+this.value;if(s.snap)v=s.snap(v);P[s.k]=v;if(sc.on)sc.on(s.k,v);fixP();snapD();after()};
    var v=document.createElement('div');v.className='v';v.id='v'+k;r.appendChild(lb);r.appendChild(inp);r.appendChild(v);sl.appendChild(r)});
  upd();col.scrollTop=0}
function go(n){var sc=S[si];if(n<1){if(si>0){loadScene(si-1,S[si-1].steps.length);col.scrollTop=col.scrollHeight}return}
  if(n>NS){if(si<S.length-1)loadScene(si+1,1);return}
  step=n;all=false;$('al').classList.remove('on');upd();col.scrollTop=col.scrollHeight}
function frame(now){TT=(now||0)/1000;var sc=S[si];
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)TT=0;
  if(sc.tw)sc.tw.forEach(function(k){var d=P[k]-D[k];D[k]+=d*.22;if(Math.abs(d)<.003)D[k]=P[k]});
  ctx.clearRect(0,0,1280,720);
  ctx.save();ctx.beginPath();ctx.rect(580,40,680,484);ctx.clip();ctx.translate(920+CAM.x,280+CAM.y);ctx.scale(CAM.k,CAM.k);ctx.translate(-920,-280);
  try{if(sc.pre)sc.pre();sc.draw()}catch(e){if(!frame.err){frame.err=1;console.error(e)}}finally{ctx.restore()}
  if(DRG&&now-lastU>110){lastU=now;upd()}
  requestAnimationFrame(frame)}
function rawptr(e){var r=cvs.getBoundingClientRect();return[(e.clientX-r.left)/(r.width||1280)*1280,(e.clientY-r.top)/(r.height||720)*720]}
function ptr(e){var q=rawptr(e);return[(q[0]-920-CAM.x)/CAM.k+920,(q[1]-280-CAM.y)/CAM.k+280]}
function zoomAt(f,q){var x=(q[0]-920-CAM.x)/CAM.k,y=(q[1]-280-CAM.y)/CAM.k;CAM.k=clamp(CAM.k*f,.3,8);CAM.x=q[0]-920-x*CAM.k;CAM.y=q[1]-280-y*CAM.k;$('zoom-level').textContent=Math.round(CAM.k*100)+' %'}
[['in','+','Agrandir'],['out','−','Réduire'],['reset','↺','Vue initiale'],['left','←','Déplacer à gauche'],['right','→','Déplacer à droite'],['up','↑','Déplacer vers le haut'],['down','↓','Déplacer vers le bas']].forEach(function(v){var b=document.createElement('button');b.type='button';b.textContent=v[1];b.title=v[2];b.setAttribute('aria-label',v[2]);b.onclick=function(){if(v[0]==='reset'){if(S[si].viewReset)S[si].viewReset();CAM.k=1;CAM.x=CAM.y=0;zoomAt(1,[920,280])}else if(v[0]==='in'||v[0]==='out')zoomAt(v[0]==='in'?1.25:.8,[920,280]);else{var d={left:[40,0],right:[-40,0],up:[0,40],down:[0,-40]}[v[0]];CAM.x+=d[0];CAM.y+=d[1]}};$('zoom').appendChild(b)});
var fitObjects=document.createElement('button');fitObjects.id='fit-objects';fitObjects.type='button';fitObjects.textContent='⊙';fitObjects.title='Ajuster les objets';fitObjects.setAttribute('aria-label','Ajuster les objets');fitObjects.onclick=function(){if(S[si].fit)S[si].fit();CAM.k=1;CAM.x=CAM.y=0;zoomAt(1,[920,280])};$('zoom').appendChild(fitObjects);
var zoomLabel=document.createElement('output');zoomLabel.id='zoom-level';zoomLabel.textContent='100 %';$('zoom').appendChild(zoomLabel);
cvs.addEventListener('wheel',function(e){if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();zoomAt(Math.exp(-e.deltaY*.005),rawptr(e))},{passive:false});
var VIEWPAN=null,TOUCHES=new Map(),PINCH=null;
cvs.addEventListener('pointerdown',function(e){var q=rawptr(e);if(e.pointerType==='touch')TOUCHES.set(e.pointerId,q);if(TOUCHES.size===2){var a=Array.from(TOUCHES.values());PINCH={d:Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]),mid:[(a[0][0]+a[1][0])/2,(a[0][1]+a[1][1])/2]};DRG=null}if(PINCH||e.shiftKey||e.altKey||e.button===1){if(!PINCH)VIEWPAN=q;cvs.setPointerCapture(e.pointerId);e.preventDefault();e.stopImmediatePropagation()}},true);
cvs.addEventListener('pointermove',function(e){var q=rawptr(e);if(TOUCHES.has(e.pointerId))TOUCHES.set(e.pointerId,q);if(PINCH&&TOUCHES.size===2){var a=Array.from(TOUCHES.values()),mid=[(a[0][0]+a[1][0])/2,(a[0][1]+a[1][1])/2],d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);zoomAt(d/Math.max(PINCH.d,1),PINCH.mid);CAM.x+=mid[0]-PINCH.mid[0];CAM.y+=mid[1]-PINCH.mid[1];PINCH={d:d,mid:mid};e.stopImmediatePropagation()}else if(VIEWPAN){CAM.x+=q[0]-VIEWPAN[0];CAM.y+=q[1]-VIEWPAN[1];VIEWPAN=q;e.stopImmediatePropagation()}},true);
function endView(e){TOUCHES.delete(e.pointerId);if(TOUCHES.size<2)PINCH=null;VIEWPAN=null}
cvs.addEventListener('pointerup',endView,true);cvs.addEventListener('pointercancel',endView,true);cvs.addEventListener('lostpointercapture',endView,true);
cvs.addEventListener('pointerdown',function(e){var sc=S[si];if(!sc.hit||e.button>0)return;var q=ptr(e),h=sc.hit(q[0],q[1]);if(!h)return;
  DRG=h;try{cvs.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault();cvs.style.cursor='grabbing';if(h.start)h.start();if(h.move){h.move(q[0],q[1]);fixP();snapD()}upd()});
cvs.addEventListener('pointermove',function(e){var q=ptr(e);if(DRG){if(DRG.move){DRG.move(q[0],q[1]);fixP();snapD()}return}
  var sc=S[si],h=sc.hit?sc.hit(q[0],q[1]):null;cvs.style.cursor=h?(h.cur||'pointer'):'default'});
function endDrag(){if(!DRG)return;DRG=null;cvs.style.cursor='default';upd()}
cvs.addEventListener('pointerup',endDrag);cvs.addEventListener('pointercancel',endDrag);
$('pv').onclick=function(){go(step-1)};$('nx').onclick=function(){go(step+1)};
$('al').onclick=function(){all=!all;this.classList.toggle('on',all);upd();col.scrollTop=col.scrollHeight};
document.addEventListener('keydown',function(e){if(e.key==='ArrowRight')go(step+1);if(e.key==='ArrowLeft')go(step-1)});
var de=document.documentElement,tt;
function toast(m){var t=$('toast');t.textContent=m;t.style.display='block';clearTimeout(tt);tt=setTimeout(function(){t.style.display='none'},5000)}
$('fs').onclick=function(){var rq=de.requestFullscreen||de.webkitRequestFullscreen,msg='Plein écran bloqué par l’application. Ouvrez le lien dans le navigateur, puis touchez ⛶.';
  if(document.fullscreenElement){document.exitFullscreen();return}if(!rq){toast(msg);return}
  var r;try{r=rq.call(de)}catch(e){toast(msg);return}
  Promise.resolve(r).then(function(){try{screen.orientation.lock('landscape').catch(function(){})}catch(e){}}).catch(function(){toast(msg)})};
function fit(){var k=Math.min(innerWidth/1280,innerHeight/720),w=$('wrap');w.style.width=1280*k+'px';w.style.height=720*k+'px';$('stage').style.transform='scale('+k+')'}
addEventListener('resize',fit);addEventListener('fullscreenchange',function(){setTimeout(fit,100)});fit();
function boot(){
  if(!(window.MathJax&&MathJax.startup&&MathJax.startup.promise)){setTimeout(boot,100);return}
  Promise.all([MathJax.startup.promise,document.fonts.load('400 20px "STIX Two Text"').catch(function(){})]).then(function(){
    var tp=$('top');S.forEach(function(sc,i){var b=document.createElement('button');b.className='b chip';b.textContent=String(i+1);b.title=sc.title;b.onclick=function(){loadScene(i,1)};tp.appendChild(b)});
    $('load').remove();loadScene(0,1);requestAnimationFrame(frame)});
}
window.__E={camera:function(){return CAM},point:ptr,S:function(){return S},load:loadScene,go:go,state:function(){return{si:si,step:step,NS:NS,P:P,D:D}},setAll:function(v){all=v;upd()}};
