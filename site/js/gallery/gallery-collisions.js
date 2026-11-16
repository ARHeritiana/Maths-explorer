// Colliding blocks that count digits of pi (gallery exhibit; maths in gallery-collisions-model.js).
// A light block rests between a wall and a heavy block that arrives. Choose the mass ratio, predict the number of collisions, run the
// motion (exact event-driven, never a time step) and read the same motion as a point turning on a circle of velocities.
import {exhibit,button,field,bind,palette,TAU} from './gallery-kit.js';
import {simulate,theta,velocityPoint,energy,momentum} from './gallery-collisions-model.js';
const X0=40,UNIT=48,FLOOR=190,WALL=34;                      // world x (in blocks) to pixels
export function collisions(root,opts){
  const {t,lang}=opts,num=(v,d=3)=>lang==='fr'?v.toFixed(d).replace('.',','):v.toFixed(d);
  let e=2,xA=2,xB=8,sim,prog=0,playing=false,dirty=true,drag=null,flash=0,lastEvent=-1,tail=0;
  const ratio=()=>10**e,hA=.5,hB=()=>.5+.1*e;
  const o=exhibit(root,opts,t('Le bloc léger repose près du mur ; le bloc lourd arrive. Choisis le rapport des masses, devine combien de chocs auront lieu, puis lance. Tout est élastique et sans frottement.','The light block rests near the wall; the heavy block arrives. Choose the mass ratio, guess how many collisions will happen, then run it. Everything is elastic and frictionless.'),
    field('co-e',t('Rapport des masses : 1 pour 10 puissance','Mass ratio: 1 to 10 to the power'),0,6,1,e)+button('co-play',t('Lancer','Run'),true)+button('co-step',t('Choc suivant','Next collision'))+button('co-reset',t('Recommencer','Restart')),
    `<p>${t('Glisse un bloc avant le départ : sa position ne change pas le nombre de chocs. Au clavier : Espace lance ou arrête, flèche droite avance d’un choc, R recommence, + et − changent le rapport.','Drag a block before the start: its position does not change the number of collisions. Keyboard: Space runs or stops, right arrow goes to the next collision, R restarts, + and − change the ratio.')}</p>`);
  const g=o.g,playBtn=root.querySelector('#co-play'),eIn=root.querySelector('#co-e');
  const fmtRatio=v=>`1 : ${(10**v).toLocaleString(lang==='fr'?'fr-FR':'en-US').replace(/ /g,' ')}`;
  function build(){sim=simulate({ratio:ratio(),xA,xB,hA,hB:hB()});prog=0;lastEvent=-1;tail=0;playing=false;playBtn.textContent=t('Lancer','Run');playBtn.setAttribute('aria-pressed','false');dirty=true;}
  const setPlay=v=>{playing=v;playBtn.textContent=v?t('Arrêter','Pause'):prog>=sim.events.length-1&&tail>=1?t('Rejouer','Replay'):t('Lancer','Run');playBtn.setAttribute('aria-pressed',String(v));o.wake(0);};
  const setE=v=>{e=Math.max(0,Math.min(6,v));eIn.value=e;root.querySelector('#co-e-out').textContent=fmtRatio(e);build();};
  bind(root,'co-e',v=>setE(v),fmtRatio);
  const N=()=>sim.events.length-1;
  o.on(playBtn,'click',()=>{if(prog>=N()&&tail>=1){build();}setPlay(!playing);});
  o.on(root.querySelector('#co-step'),'click',()=>{setPlay(false);if(prog>=N()){tail=1;}else prog=Math.floor(prog+1e-9)+1;flash=.35;dirty=true;o.wake(0);});
  o.on(root.querySelector('#co-reset'),'click',()=>{build();});
  // dragging a block (only before the start; the count does not depend on where they start)
  const blockBox=(who,s)=>{const h=who==='A'?hA:hB(),cx=who==='A'?s.xA:s.xB;return [X0+(cx-h)*UNIT,FLOOR-2*h*UNIT,2*h*UNIT,2*h*UNIT];};
  const hit=p=>{if(prog>0)return null;const s={xA,xB};for(const w of ['B','A']){const [x,y,wd,ht]=blockBox(w,s);if(p[0]>=x-10&&p[0]<=x+wd+10&&p[1]>=y-10&&p[1]<=y+ht+10)return w;}return null;};
  o.touchHit(p=>hit(p)!==null);
  o.on(o.cv,'pointerdown',ev=>{const w=hit(o.point(ev));if(w){drag=w;o.cv.setPointerCapture?.(ev.pointerId);ev.preventDefault();}});
  o.on(o.cv,'pointermove',ev=>{if(!drag)return;const wx=(o.point(ev)[0]-X0)/UNIT;if(drag==='A')xA=Math.max(hA+.2,Math.min(wx,xB-hB()-hA-.8));else xB=Math.max(xA+hA+hB()+.8,Math.min(wx,11.3));build();});
  o.on(o.cv,'pointerup',()=>{drag=null;});o.cancelDrag=()=>{drag=null;};
  o.on(o.cv,'keydown',ev=>{if(ev.shiftKey)return;
    if(ev.key===' '||ev.key==='Enter'){ev.preventDefault();playBtn.click();}
    else if(ev.key==='ArrowRight'){ev.preventDefault();root.querySelector('#co-step').click();}
    else if(ev.key==='r'||ev.key==='R'){ev.preventDefault();build();}
    else if(ev.key==='+'||ev.key==='='){ev.preventDefault();setE(e+1);}
    else if(ev.key==='-'){ev.preventDefault();setE(e-1);}
    else if(drag===null&&prog===0&&(ev.key==='ArrowUp'||ev.key==='ArrowDown')){ev.preventDefault();xB=Math.max(xA+hA+hB()+.8,Math.min(xB+(ev.key==='ArrowUp'?.2:-.2),11.3));build();}});
  o.onResize=()=>{dirty=true;};o.busy=()=>playing||flash>0;
  const digits=n=>String(n);
  function face(cx,cy,r,lookRight,bump,C){const ex=r*.32,ey=r*.18,look=lookRight?1:-1;g.fillStyle='#fff';[-1,1].forEach(k=>{g.beginPath();g.arc(cx+k*ex,cy-ey,r*.2,0,TAU);g.fill();});
    g.fillStyle='#1b1f27';[-1,1].forEach(k=>{g.beginPath();g.arc(cx+k*ex+look*r*.07,cy-ey,r*.09,0,TAU);g.fill();});
    g.strokeStyle='#1b1f27';g.lineWidth=2;g.beginPath();if(bump){g.ellipse(cx,cy+r*.38,r*.12,r*.16,0,0,TAU);}else{g.arc(cx,cy+r*.2,r*.22,.15*Math.PI,.85*Math.PI);}g.stroke();}
  build();
  o.animate(dt=>{
    const n=N(),seg=Math.max(.0035,Math.min(.8,9/n));
    if(playing&&dt>0){
      if(prog<n)prog=Math.min(n,prog+dt/(prog<1?1.1:seg));else{tail=Math.min(1,tail+dt/1.2);if(tail>=1)setPlay(false);}
    }else if(playing&&dt===0&&prog<n&&o.cv.dataset.still)prog=n;
    const i=Math.min(n,Math.floor(prog)),f=Math.min(1,prog-i);
    if(i!==lastEvent){if(lastEvent>=0&&seg>=.1&&i>0)flash=.35;lastEvent=i;}
    if(flash>0&&dt>0)flash=Math.max(0,flash-dt);
    const ev=sim.events[i],nx=sim.events[Math.min(n,i+1)];
    // positions: along the segment from event i to event i+1 (linear in real time between collisions)
    const dtReal=i<n?nx.t-ev.t:0,d=i<n?f*dtReal:tail*3;
    let pA=ev.xA+ev.vA*d,pB=ev.xB+ev.vB*d;
    const C=palette();
    g.clearRect(0,0,o.W,o.H);g.fillStyle=C.sunken;g.fillRect(-2000,-2000,4640,4440);
    // floor, wall, ground
    g.fillStyle=C.surface;g.fillRect(X0-10,FLOOR,610,10);g.strokeStyle=C.line;g.lineWidth=1.5;g.strokeRect(X0-10,FLOOR,610,10);
    g.fillStyle=C.ink;g.fillRect(WALL-14,FLOOR-170,14,180);g.globalAlpha=.5;g.strokeStyle=C.muted;g.lineWidth=1.5;for(let k=0;k<9;k++){g.beginPath();g.moveTo(WALL-14,FLOOR-160+k*20);g.lineTo(WALL-26,FLOOR-148+k*20);g.stroke();}g.globalAlpha=1;
    // blocks
    const now=i>0&&flash>0,sq=now?1-.12*Math.sin(flash/.35*Math.PI):1;
    const draw=(who,cx,h,col,bump)=>{const w=2*h*UNIT,ht=w,x=X0+(cx-h)*UNIT;g.save();g.translate(x+w/2,FLOOR);g.scale(1/sq,sq);g.translate(-w/2,0);
      g.fillStyle=col;g.strokeStyle=C.ink;g.lineWidth=2.5;g.beginPath();g.roundRect(0,-ht,w,ht,Math.min(14,w/4));g.fill();g.stroke();
      face(w/2,-ht*.55,Math.min(w,60)/2.2,who==='A',bump,C);
      g.fillStyle=C.ink;g.font='bold 13px system-ui';g.textAlign='center';g.fillText(who==='A'?'1 kg':`${ratio().toLocaleString(lang==='fr'?'fr-FR':'en-US').replace(/ /g,' ')} kg`,w/2,-ht-6);g.restore();};
    draw('A',pA,hA,C.c?.[0]||C.obj2,now);draw('B',pB,hB(),C.c?.[1]||C.accent,now);
    if(now){const bx=X0+(pA+hA)*UNIT;g.strokeStyle=C.neg;g.lineWidth=3;for(let k=0;k<6;k++){const a=-Math.PI/2+(k-2.5)*.5,r1=14,r2=14+16*(1-flash/.35);g.beginPath();g.moveTo(bx+Math.cos(a)*r1,FLOOR-30+Math.sin(a)*r1);g.lineTo(bx+Math.cos(a)*r2,FLOOR-30+Math.sin(a)*r2);g.stroke();}}
    // counter
    const cnt=ev.block+ev.wall,done=prog>=n;
    g.textAlign='right';g.fillStyle=C.ink;g.font='bold 54px system-ui';g.fillText(digits(cnt),618,70);g.font='13px system-ui';g.fillStyle=C.muted;g.fillText(t('collisions','collisions'),618,90);
    // velocity space
    const cx=150,cy=312,R=88;
    g.strokeStyle=C.line;g.lineWidth=1.5;g.beginPath();g.arc(cx,cy,R,0,TAU);g.stroke();
    g.globalAlpha=.35;g.beginPath();g.moveTo(cx-R-10,cy);g.lineTo(cx+R+10,cy);g.moveTo(cx,cy-R-10);g.lineTo(cx,cy+R+10);g.stroke();g.globalAlpha=1;
    const th=theta(ratio());
    const Q=([x,y])=>[cx+R*x,cy-R*y];
    // mirrors: the vertical axis (wall) and the line at angle theta from it (blocks)
    g.strokeStyle=C.accent;g.lineWidth=2;g.setLineDash([6,4]);g.beginPath();g.moveTo(...Q([0,-1.12]));g.lineTo(...Q([0,1.12]));g.stroke();
    const mx=Math.sin(th),my=Math.cos(th);g.strokeStyle=C.obj2;g.beginPath();g.moveTo(...Q([-mx*1.12,-my*1.12]));g.lineTo(...Q([mx*1.12,my*1.12]));g.stroke();g.setLineDash([]);
    // trail of the point (one point per collision so far)
    g.strokeStyle=C.ink;g.lineWidth=2;g.beginPath();const step=Math.max(1,Math.floor(i/400));for(let k=0;k<=i;k+=step){const [px,py]=velocityPoint(sim.events[k],ratio());const q=Q([px,py]);k?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]);}
    {const [px,py]=velocityPoint(ev,ratio());const q=Q([px,py]);g.lineTo(q[0],q[1]);}g.stroke();
    {const [px,py]=velocityPoint(ev,ratio()),q=Q([px,py]);g.fillStyle=C.neg;g.beginPath();g.arc(q[0],q[1],6,0,TAU);g.fill();}
    g.fillStyle=C.muted;g.font='12px system-ui';g.textAlign='center';g.fillText(t('Espace des vitesses (√m·v)','Velocity space (√m·v)'),cx,cy+R+22);
    g.textAlign='right';g.fillStyle=C.accent;g.fillText(t('mur','wall'),cx-6,cy-R-8);g.textAlign='left';g.fillStyle=C.obj2;const lab=Q([mx*1.2,my*1.2]);g.fillText(t('chocs entre blocs','block collisions'),lab[0]+4,Math.max(lab[1],cy-R-8));
    // text block: angle, pi
    const tx=300;g.textAlign='left';g.fillStyle=C.ink;g.font='bold 15px system-ui';
    g.fillText(`${t('Angle entre les deux miroirs','Angle between the two mirrors')} : ${num(th*180/Math.PI,4)}°`,tx,270);
    g.font='14px system-ui';g.fillStyle=C.muted;g.fillText(`${t('Il tient π / angle ≈','π / angle fits about')} ${num(Math.PI/th,3)} ${t('fois','times')}`,tx,294);
    g.fillText(`${t('Énergie cinétique','Kinetic energy')} : ${num(energy(ev,ratio())/energy(sim.events[0],ratio()),4)} ${t('de l’énergie de départ','of the starting energy')}`,tx,318);
    g.fillText(`${t('Quantité de mouvement','Momentum')} : ${num(momentum(ev,ratio())/momentum(sim.events[0],ratio()),4)} ${t('de celle de départ','of the starting value')}`,tx,342);
    g.fillText(`${t('Chocs bloc/bloc','Block/block')} : ${ev.block} · ${t('mur','wall')} : ${ev.wall}`,tx,366);
    g.font='bold 15px system-ui';g.fillStyle=done&&tail>0||done?C.pos:C.muted;
    g.fillText(done?t('Plus aucun choc possible.','No more collisions possible.'):t('Les blocs continuent de se heurter…','The blocks keep colliding…'),tx,396);
    o.read(`${t('Rapport 1 :','Ratio 1:')} ${ratio().toLocaleString(lang==='fr'?'fr-FR':'en-US').replace(/ /g,' ')} · ${t('chocs','collisions')} : ${cnt}${done?` (${t('total','total')} ${sim.total})`:''}`);
    return playing||flash>0||drag!==null;
  });
  setE(e);
  return o.stop;
}
