// Colliding blocks that count digits of pi (gallery exhibit; maths in gallery-collisions-model.js).
// A real simulation in physical time: the exact event list (no time step) is played at the speed of the blocks, so the collisions
// come in a burst near the wall, as fast as they really happen, with a click for each; slow motion shows them one by one. The count
// lights up the digits of pi, and the same motion is read as a point turning on a circle of velocities.
import {exhibit,button,field,palette,TAU,transport} from './gallery-kit.js';
import {metricStrip} from './gallery-panels.js';
import {simulate,theta,velocityPoint,energy,momentum,angleCount} from './gallery-collisions-model.js';
const X0=40,UNIT=44,FLOOR=228,XMAX=13.4;                 // world x (in units) to pixels; the right edge of the track
const PI_DIGITS='314159265358979';
export function collisions(root,opts){
  const {t,lang}=opts,loc=lang==='fr'?'fr-FR':'en-US',num=(v,d=3)=>v.toLocaleString(loc,{minimumFractionDigits:d,maximumFractionDigits:d}),int=v=>v.toLocaleString(loc).replace(/\s/g,' ');
  let e=2,xA=2,xB=7,sim,tEnd=1,s=0,playing=false,drag=null,speed=1,sound=true,audio=null,lastCount=0,hits=[];
  const ratio=()=>10**e,hA=.5,hB=()=>.5+.12*e;
  const o=exhibit(root,opts,t('Le bloc léger repose près du mur ; le bloc lourd arrive. Choisis le rapport des masses, devine le nombre de chocs, puis lance : la simulation se déroule en temps réel, chaque choc fait un clic. Tout est élastique et sans frottement.','The light block rests near the wall; the heavy block arrives. Choose the mass ratio, guess the number of collisions, then run: the simulation plays in real time, each collision clicks. Everything is elastic and frictionless.'),
    transport(button('co-reset','↺'),button('co-play',t('Lancer','Run'),true),button('co-step','▶|'),
      field('co-e',t('Rapport des masses M/m','Mass ratio M/m'),0,6,1,e))+
    `<label class="act-field" for="co-speed"><span class="act-label">${t('Vitesse','Speed')}</span><select id="co-speed"><option value="1">${t('Temps réel','Real time')}</option><option value="0.1">${t('Ralenti × 10','Slow motion × 10')}</option><option value="0.01">${t('Ralenti × 100','Slow motion × 100')}</option></select></label>`+
    `<button type="button" id="co-sound" class="btn btn-secondary" aria-pressed="true">${t('Son des chocs','Collision sound')}</button>`,
    `<p>${t('Glisse un bloc avant le départ : sa position ne change pas le nombre de chocs. Au clavier : Espace lance ou arrête, flèche droite avance jusqu’au choc suivant, R recommence, + et − changent le rapport.','Drag a block before the start: its position does not change the number of collisions. Keyboard: Space runs or pauses, right arrow goes to the next collision, R restarts, + and − change the ratio.')}</p>`);
  const g=o.g,el=id=>root.querySelector('#'+id),playBtn=el('co-play'),eIn=el('co-e'),soundBtn=el('co-sound');
  el('co-reset').setAttribute('aria-label',t('Recommencer','Restart'));el('co-step').setAttribute('aria-label',t('Choc suivant','Next collision'));
  const M=metricStrip(root.querySelector('.exhibit-stage'),t,[
    {id:'pred',label:t('Prévu : ⌈π/θ⌉ − 1','Predicted: ⌈π/θ⌉ − 1'),kind:'exact'},
    {id:'theta',label:t('Angle θ = arctan √(m/M)','Angle θ = arctan √(m/M)'),kind:'approx'},
    {id:'split',label:t('Chocs bloc/bloc · mur','Block/block · wall'),kind:'observed'},
    {id:'energy',label:t('Énergie / départ','Energy / start'),kind:'approx'},
    {id:'mom',label:t('Quantité de mouvement / départ','Momentum / start'),kind:'approx'},
    {id:'time',label:t('Temps simulé','Simulated time'),kind:'approx'}]);
  const fmtRatio=v=>`1 : ${int(10**v)}`;
  // index of the last event at or before time s (binary search; events are sorted by time)
  const eventAt=x=>{const ev=sim.events;if(x>=ev.at(-1).t)return ev.length-1;let lo=0,hi=ev.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(ev[m].t<=x)lo=m;else hi=m;}return lo;};
  const posAt=x=>{const i=eventAt(x),ev=sim.events[i],d=x-ev.t;return {i,ev,pA:ev.xA+ev.vA*d,pB:ev.xB+ev.vB*d};};
  function build(){
    sim=simulate({ratio:ratio(),xA,xB,hA,hB:hB()});const last=sim.events.at(-1);
    tEnd=last.t+Math.min(8,Math.max(.5,(XMAX+hB()-last.xB)/Math.max(.05,last.vB)));
    s=0;lastCount=0;hits=[];setPlay(false);o.redraw();
  }
  const done=()=>s>=tEnd-1e-9;
  function setPlay(v){playing=v;playBtn.textContent=v?t('Pause','Pause'):done()?t('Rejouer','Replay'):s>0?t('Reprendre','Resume'):t('Lancer','Run');playBtn.setAttribute('aria-pressed',String(v));if(v)o.wake(0);}
  const setE=v=>{e=Math.max(0,Math.min(6,Math.round(v)));eIn.value=e;el('co-e-out').textContent=fmtRatio(e);xB=Math.max(xB,xA+hA+hB()+.8);build();};
  eIn.addEventListener('input',()=>setE(Number(eIn.value)));
  // the click of a collision: a short knock synthesised on the spot (no file), at most one per frame
  const clack=n=>{if(!sound||!audio)return;const a=audio,now=a.currentTime,os=a.createOscillator(),gn=a.createGain();os.type='triangle';os.frequency.setValueAtTime(1500+Math.random()*300,now);
    gn.gain.setValueAtTime(Math.min(.25,.08+.03*Math.log2(1+n)),now);gn.gain.exponentialRampToValueAtTime(.0001,now+.035);os.connect(gn).connect(a.destination);os.start(now);os.stop(now+.04);};
  const ensureAudio=()=>{if(!sound||audio)return;const AC=globalThis.AudioContext||globalThis.webkitAudioContext;if(AC)try{audio=new AC();}catch{audio=null;}};
  o.on(playBtn,'click',()=>{ensureAudio();audio?.resume?.();if(done()){s=0;lastCount=0;hits=[];}setPlay(!playing);});
  o.on(el('co-step'),'click',()=>{setPlay(false);const i=eventAt(s),nx=sim.events[i+1];s=nx?nx.t:tEnd;o.redraw();});
  o.on(el('co-reset'),'click',()=>build());
  o.on(el('co-speed'),'change',ev=>{speed=Number(ev.target.value);});
  o.on(soundBtn,'click',()=>{sound=!sound;soundBtn.setAttribute('aria-pressed',String(sound));if(sound){ensureAudio();audio?.resume?.();}});
  // dragging a block (only before the start; the count does not depend on where they start)
  const box=(who)=>{const h=who==='A'?hA:hB(),cx=who==='A'?xA:xB;return [X0+(cx-h)*UNIT,FLOOR-2*h*UNIT,2*h*UNIT,2*h*UNIT];};
  const hit=p=>{if(s>0)return null;for(const w of ['B','A']){const [x,y,wd,ht]=box(w);if(p[0]>=x-10&&p[0]<=x+wd+10&&p[1]>=y-10&&p[1]<=y+ht+10)return w;}return null;};
  o.touchHit(p=>hit(p)!==null);
  o.on(o.cv,'pointerdown',ev=>{const w=hit(o.point(ev));if(w){drag=w;o.cv.setPointerCapture?.(ev.pointerId);ev.preventDefault();}});
  o.on(o.cv,'pointermove',ev=>{if(!drag)return;const wx=(o.point(ev)[0]-X0)/UNIT;if(drag==='A')xA=Math.max(hA+.2,Math.min(wx,xB-hB()-hA-.6));else xB=Math.max(xA+hA+hB()+.6,Math.min(wx,10.5));build();});
  o.on(o.cv,'pointerup',()=>{drag=null;});o.cancelDrag=()=>{drag=null;};
  o.on(o.cv,'keydown',ev=>{if(ev.shiftKey)return;
    if(ev.key===' '||ev.key==='Enter'){ev.preventDefault();playBtn.click();}
    else if(ev.key==='ArrowRight'){ev.preventDefault();el('co-step').click();}
    else if(ev.key==='r'||ev.key==='R'){ev.preventDefault();build();}
    else if(ev.key==='+'||ev.key==='='){ev.preventDefault();setE(e+1);}
    else if(ev.key==='-'){ev.preventDefault();setE(e-1);}
    else if(s===0&&(ev.key==='ArrowUp'||ev.key==='ArrowDown')){ev.preventDefault();xB=Math.max(xA+hA+hB()+.6,Math.min(xB+(ev.key==='ArrowUp'?.2:-.2),10.5));build();}});
  o.onResize=()=>o.redraw();o.busy=()=>playing||hits.length>0;
  function face(cx,cy,r,lookRight,ouch){const ex=r*.32,ey=r*.18,look=lookRight?1:-1;g.fillStyle='#fff';[-1,1].forEach(k=>{g.beginPath();g.arc(cx+k*ex,cy-ey,r*.2,0,TAU);g.fill();});
    g.fillStyle='#111';[-1,1].forEach(k=>{g.beginPath();g.arc(cx+k*ex+look*r*.07,cy-ey,r*.09,0,TAU);g.fill();});
    g.strokeStyle='#111';g.lineWidth=2;g.beginPath();if(ouch)g.ellipse(cx,cy+r*.38,r*.12,r*.16,0,0,TAU);else g.arc(cx,cy+r*.2,r*.22,.15*Math.PI,.85*Math.PI);g.stroke();}
  build();
  o.animate(dt=>{
    if(playing&&dt>0)s=Math.min(tEnd,s+dt*speed);
    else if(playing&&dt===0&&o.cv.dataset.still)s=tEnd;          // reduced motion: go straight to the end
    if(playing&&done())setPlay(false);
    const {i,ev,pA,pB}=posAt(s),count=ev.block+ev.wall,fresh=count-lastCount;
    if(fresh>0&&playing){clack(fresh);const rate=fresh/Math.max(dt,1e-3);if(rate<25)hits.push({x:sim.events[i].kind==='wall'?X0:X0+(pA+hA)*UNIT,life:.25});}
    lastCount=count;hits=hits.filter(h=>(h.life-=dt)>0);
    const C=palette(),ink=C.ink,css=(n,f)=>(globalThis.getComputedStyle?.(root.ownerDocument.documentElement)?.getPropertyValue(n)||'').trim()||f,UI=css('--ui','system-ui'),DISPLAY=css('--display','Impact, sans-serif'),MATH=css('--math','serif'),small=(o.cv.clientWidth||640)<520,F=v=>Math.round(v*(small?1.75:1));   // phone: larger lettering, fewer words
    g.clearRect(0,0,o.W,o.H);g.fillStyle=C.surface;g.fillRect(0,0,o.W,o.H);
    // track: floor and wall
    g.fillStyle=ink;g.fillRect(X0-14,FLOOR,620,4);g.fillRect(X0-14,FLOOR-190,14,194);
    g.strokeStyle=C.muted;g.lineWidth=1.5;for(let k=0;k<10;k++){g.beginPath();g.moveTo(X0-14,FLOOR-180+k*19);g.lineTo(X0-26,FLOOR-168+k*19);g.stroke();}
    // blocks (the heavy one is clipped at the right edge as it leaves)
    const draw=(who,cx,h,col)=>{const w=2*h*UNIT,x=X0+(cx-h)*UNIT;if(x>o.W+10)return;g.fillStyle=col;g.strokeStyle=ink;g.lineWidth=3;g.beginPath();g.rect(x,FLOOR-w,w,w);g.fill();g.stroke();
      face(x+w/2,FLOOR-w*.55,Math.min(w,64)/2.2,who==='A',hits.length>0);
      g.fillStyle=ink;g.font=`700 ${F(13)}px ${UI}`;g.textAlign='center';g.fillText(who==='A'?'m = 1 kg':`M = ${int(ratio())} kg`,x+w/2,FLOOR-w-8);};
    draw('B',pB,hB(),C.c?.[1]||C.object);draw('A',pA,hA,C.c?.[0]||C.obj2);
    for(const h of hits){const k=1-h.life/.25;g.strokeStyle=C.neg||'#e11d2e';g.lineWidth=3;for(let a=0;a<6;a++){const ang=-Math.PI/2+(a-2.5)*.45,r1=10+12*k,r2=22+14*k;g.beginPath();g.moveTo(h.x+Math.cos(ang)*r1,FLOOR-24+Math.sin(ang)*r1);g.lineTo(h.x+Math.cos(ang)*r2,FLOOR-24+Math.sin(ang)*r2);g.stroke();}}
    // the count, top left above the track: its digits turn red where they agree with pi (even powers of ten: the count is written
    // with pi's digits), and pi itself on the same line
    const digits=String(count),even=e%2===0,W=k=>g.measureText(k)?.width??20;
    g.textAlign='left';g.font=`700 ${F(13)}px ${UI}`;g.fillStyle=C.muted;g.fillText(t('CHOCS','COLLISIONS'),70,small?30:24);
    g.font=`60px ${DISPLAY}`;let x=70;
    for(let k=0;k<digits.length;k++){g.fillStyle=even&&digits[k]===PI_DIGITS[k]?C.object:ink;g.fillText(digits[k],x,86);x+=W(digits[k])+2;}
    x=Math.max(x+28,250);g.font=`${F(small?20:24)}px ${MATH}`;
    if(even){const pi=['3',lang==='fr'?',':'.',...PI_DIGITS.slice(1,9),'…'];g.fillStyle=ink;g.fillText('π = ',x,84);x+=W('π = ');
      let d=0;for(const k of pi){const isDigit=/\d/.test(k),lit=isDigit&&d<digits.length&&digits[d]===PI_DIGITS[d];g.fillStyle=lit?C.object:ink;g.fillText(k,x,84);x+=W(k);if(isDigit)d++;}}
    else{g.fillStyle=ink;g.fillText(`π × √(M/m) ≈ ${num(Math.PI*Math.sqrt(ratio()),1)}`,x,84);}
    // lower band: the velocity circle (left), what its two mirrors are and where the run stands (right)
    g.fillStyle=C.sunken;g.fillRect(0,FLOOR+18,o.W,o.H-FLOOR-18);g.fillStyle=ink;g.fillRect(0,FLOOR+18,o.W,2);
    const cx=120,cy=FLOOR+122,R=70,Q=([x,y])=>[cx+R*x,cy-R*y],th=theta(ratio());
    g.strokeStyle=C.line;g.lineWidth=1.5;g.beginPath();g.arc(cx,cy,R,0,TAU);g.stroke();
    g.setLineDash([5,4]);g.strokeStyle=ink;g.lineWidth=2;g.beginPath();g.moveTo(...Q([0,-1.12]));g.lineTo(...Q([0,1.12]));g.stroke();
    const mx=Math.sin(th),my=Math.cos(th);g.strokeStyle=C.object;g.beginPath();g.moveTo(...Q([-mx*1.12,-my*1.12]));g.lineTo(...Q([mx*1.12,my*1.12]));g.stroke();g.setLineDash([]);
    g.strokeStyle=ink;g.lineWidth=1.5;g.beginPath();const stride=Math.max(1,Math.floor(i/500));for(let k=0;k<=i;k+=stride){const q=Q(velocityPoint(sim.events[k],ratio()));k?g.lineTo(...q):g.moveTo(...q);}g.lineTo(...Q(velocityPoint(ev,ratio())));g.stroke();
    {const q=Q(velocityPoint(ev,ratio()));g.fillStyle=C.object;g.beginPath();g.arc(q[0],q[1],6,0,TAU);g.fill();g.strokeStyle=ink;g.lineWidth=2;g.stroke();}
    const tx=232,line=(y,col,text,dash)=>{g.setLineDash(dash?[5,4]:[]);g.strokeStyle=col;g.lineWidth=2;g.beginPath();g.moveTo(tx,y-5);g.lineTo(tx+26,y-5);g.stroke();g.setLineDash([]);g.fillStyle=ink;g.fillText(text,tx+36,y);};
    g.textAlign='left';g.font=`700 15px ${UI}`;g.fillStyle=ink;if(!small)g.fillText(t('Le même mouvement, vu dans les vitesses (√m·v, √M·V)','The same motion, seen in the velocities (√m·v, √M·V)'),tx,FLOOR+50);
    g.font=`15px ${UI}`;
    if(!small){line(FLOOR+80,ink,t('choc contre le mur : symétrie d’axe vertical','wall collision: reflection in the vertical axis'),true);
    line(FLOOR+106,C.object,t('choc entre blocs : symétrie d’axe incliné de θ','block collision: reflection in an axis tilted by θ'),true);
    g.fillStyle=C.muted;g.fillText(t('L’énergie reste la même : le point reste sur le cercle.','Energy is conserved: the point stays on the circle.'),tx,FLOOR+132);}
    g.font=`700 ${F(16)}px ${UI}`;const sy=small?FLOOR+110:FLOOR+170,wrap=(text,y)=>{if(!small){g.fillText(text,tx,y);return;}const words=text.split(' ');let lineText='',yy=y-30;for(const w of words){const tryText=lineText?lineText+' '+w:w;if(g.measureText(tryText)?.width>390&&lineText){g.fillText(lineText,tx,yy);yy+=32;lineText=w;}else lineText=tryText;}g.fillText(lineText,tx,yy);};
    if(done()){g.fillStyle=even?C.object:ink;wrap(even?t(`${int(count)} chocs : les ${e/2+1} premiers chiffres de π.`,`${int(count)} collisions: the first ${e/2+1} digits of π.`):t(`${int(count)} chocs en tout.`,`${int(count)} collisions in all.`),sy);}
    else if(s>0){g.fillStyle=ink;wrap(playing?t('Les blocs se heurtent…','The blocks keep colliding…'):t('En pause.','Paused.'),sy);}
    else{g.fillStyle=ink;wrap(t('Devine le nombre de chocs, puis lance.','Guess the number of collisions, then run.'),sy);}
    // console values
    M.set('pred',int(angleCount(ratio())));M.set('theta',`${num(th,5)} rad`);M.set('split',`${int(ev.block)} · ${int(ev.wall)}`);
    M.set('energy',num(energy(ev,ratio())/energy(sim.events[0],ratio()),4));M.set('mom',num(momentum(ev,ratio())/momentum(sim.events[0],ratio()),4));M.set('time',`${num(s,2)} s`);
    o.read(`${t('Rapport','Ratio')} ${fmtRatio(e)} · ${t('chocs','collisions')} : ${int(count)}${done()?` (${t('total','total')} ${int(sim.total)})`:''}`);
    return playing||hits.length>0||drag!==null;
  });
  setE(e);
  return ()=>{o.stop();audio?.close?.();};
}
