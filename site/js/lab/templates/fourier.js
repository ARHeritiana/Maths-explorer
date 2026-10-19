// Fourier shares the retained canvas, camera, scheduler, keyboard handles and mission shell of every laboratory.
import {panelView,drawAxes,drawHandle} from '../plot.js';
import * as F from '../../fourier-model.js';
import {arms} from '../../gallery-math.js';
export function mount(env){
  const {stage,getState,setState,advance,isUnlocked,fmt}=env;
  let v=null,w=null,co=[],pts=[],cache='',curve=[],stroke=null;
  const cv=stage.canvas,g=stage.g;
  const help=document.createElement('p');help.className='lab2-keys';help.id='fourier-draw-help-'+env.exp.id;
  help.textContent=fmt.t(['Contour personnel : glisse pour dessiner. Au clavier : choisis Dessiner, puis sur le canevas utilise les flèches pour déplacer le crayon, Espace pour poser un point, Entrée pour fermer (au moins 3 points), Échap pour annuler.','Custom outline: drag to draw. Keyboard: choose Draw, then focus the canvas; arrows move the pen, Space adds a point, Enter closes (at least 3 points), Escape cancels.']);
  stage.wrap.after(help);cv.setAttribute('aria-describedby',help.id);
  const penStatus=document.createElement('p');penStatus.className='sr-only';penStatus.setAttribute('role','status');penStatus.setAttribute('aria-live','polite');help.after(penStatus);
  let pen=[0,0],strokePointer=null;

  const spec=()=>getState().mode==='shape'?{x:[-15,15],y:[-15,15],equal:true,xTicks:[-10,0,10],yTicks:[-10,0,10]}:{x:[0,1],y:[-1.7,1.7],xTicks:[0,.25,.5,.75,1],yTicks:[-1,0,1]};
  function layout(){const wave=getState().mode==='wave',split=wave?stage.W*.35:0;v=panelView(stage,'signal',{x:split,y:0,w:stage.W-split,h:stage.H},spec(),{camId:'signal-'+getState().mode});w=panelView(stage,'phasor',{x:0,y:0,w:split||stage.W,h:stage.H},{x:[-1.7,1.7],y:[-1.7,1.7],equal:true});if(!wave)stage.panel('phasor',{x:0,y:0,w:0,h:0},stage.cam('phasor'));}
  const line=(points,color,width=2,dash=[])=>{g.save();g.strokeStyle=stage.color(color);g.lineWidth=width;g.setLineDash(dash);g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(v.X(x),v.Y(y)):g.moveTo(v.X(x),v.Y(y)));g.stroke();g.restore();};
  function prepare(s){
    const key=JSON.stringify([s.shape,s.custom,s.count]);if(cache===key)return;cache=key;
    const data=F.outline(s);pts=data.points;co=data.coefficients;
    curve=Array.from({length:1025},(_,i)=>F.reconstruct(co,i/1024,s.count));
  }
  function draw(){
    layout();const s=getState();help.hidden=!(s.mode==='shape'&&s.shape==='custom'&&isUnlocked('shape'));drawAxes(g,v,spec(),stage,fmt);
    g.save();g.beginPath();g.rect(v.left,v.top,v.width,v.height);g.clip();
    if(s.mode==='shape'&&s.shape==='custom'&&!s.custom){if(stroke)line(stroke,'obj3',3);drawHandle(g,stage,v.X(pen[0]),v.Y(pen[1]),{color:'obj3'});g.restore();return;}
    if(s.mode==='shape'){
      prepare(s);line([...pts,pts[0]],'muted',1,[4,5]);line(curve.slice(0,Math.max(2,Math.floor(s.time*1024)+1)),'accent',3);
      const chain=arms(co,s.time,s.count);for(let i=1;i<chain.length;i++){
        const [x,y]=chain[i-1],[X,Y,r]=chain[i];g.strokeStyle=stage.color('muted');g.lineWidth=1;
        if(r>1e-8){g.beginPath();g.arc(v.X(x),v.Y(y),Math.abs(v.X(r)-v.X(0)),0,F.TAU);g.stroke();}line([[x,y],[X,Y]],'obj2',1.5);
      }
      const tip=chain.at(-1);g.fillStyle=stage.color('neg');g.beginPath();g.arc(v.X(tip[0]),v.Y(tip[1]),4,0,F.TAU);g.fill();
      if(stroke)line(stroke,'obj3',3);
    }else if(s.mode==='wave'){
      const wave=Array.from({length:501},(_,i)=>[i/500,s.amplitude*Math.cos(F.TAU*s.frequency*i/500+s.phase)]);line(wave,'accent',3);
      // A small rotating vector is paired with the wave at t = 0. The draggable tip controls A and φ.
      const x=s.amplitude*Math.sin(s.phase),y=s.amplitude*Math.cos(s.phase);g.restore();g.save();g.strokeStyle=stage.color('muted');g.lineWidth=1;g.beginPath();g.arc(w.X(0),w.Y(0),Math.abs(w.X(s.amplitude)-w.X(0)),0,F.TAU);g.stroke();g.strokeStyle=stage.color('obj2');g.lineWidth=2;g.beginPath();g.moveTo(w.X(0),w.Y(0));g.lineTo(w.X(x),w.Y(y));g.stroke();g.setLineDash([4,5]);g.beginPath();g.moveTo(w.X(x),w.Y(y));g.lineTo(v.X(0),v.Y(y));g.stroke();g.setLineDash([]);drawHandle(g,stage,w.X(x),w.Y(y),{color:'obj2',locked:!isUnlocked('waveTip'),id:'waveTip'});
    }else{
      const samples=Array.from({length:801},(_,i)=>i/800);
      // Break at jumps rather than joining opposite limits with a fictitious segment.
      let segment=[];for(const t of samples){const y=F.signal(s.signal,t);if(segment.length&&Math.abs(y-segment.at(-1)[1])>1){line(segment,'muted',1.8,[5,5]);segment=[];}segment.push([t,y]);}line(segment,'muted',1.8,[5,5]);
      if(s.mode==='coefficient')line(samples.map(t=>[t,F.signal(s.signal,t)*Math.sin(F.TAU*s.n*t)]),'obj2',2.5);
      else {line(samples.map(t=>[t,F.partial(s.signal,s.N,t)]),'accent',2.8);if(s.method==='fejer')line(samples.map(t=>[t,F.partial(s.signal,s.N,t,true)]),'obj3',2.8);}
    }
    g.restore();
    if(s.mode==='shape'){
      const err=Math.sqrt(F.sampleError(co,s.count));g.fillStyle=stage.color('ink');g.font=stage.sans(13);g.textAlign='left';
      g.fillText((fmt.fr?'Erreur RMS sur les échantillons ≈ ':'Sample RMS error ≈ ')+fmt.num(err,4),v.left,v.top+16);
      if(s.shape==='custom'){drawHandle(g,stage,v.X(pen[0]),v.Y(pen[1]),{color:'obj3'});}
    }
  }
  layout();
  const handles=[{id:'waveTip',label:fmt.t(['Amplitude et phase','Amplitude and phase']),color:'obj2',
    pos(){layout();const s=getState();return [w.X(s.amplitude*Math.sin(s.phase)),w.Y(s.amplitude*Math.cos(s.phase))];},
    drag(x,y){if(getState().mode!=='wave')return;const a=w.iX(x),b=w.iY(y);setState({amplitude:Math.min(1.5,Math.hypot(a,b)),phase:Math.atan2(a,b)});},
    nudge(dx,dy){const s=getState();setState({amplitude:Math.max(0,Math.min(1.5,s.amplitude+dy*.05)),phase:Math.max(-3.14,Math.min(3.14,s.phase+dx*.05))});},
  }];
  const point=e=>{const r=cv.getBoundingClientRect(),p=[(e.clientX-r.left)*stage.W/r.width,(e.clientY-r.top)*stage.H/r.height];return [v.iX(p[0]),v.iY(p[1])];};
  const down=e=>{const s=getState();if(s.mode!=='shape'||s.shape!=='custom'||!isUnlocked('shape'))return;e.stopImmediatePropagation();e.preventDefault();stroke=[point(e)];strokePointer=e.pointerId;cv.setPointerCapture(e.pointerId);stage.invalidate();};
  const move=e=>{if(stroke&&e.pointerId===strokePointer){stroke.push(point(e));stage.invalidate();}};
  const end=e=>{if(!stroke||(strokePointer!=null&&e?.pointerId!==strokePointer))return;const p=stroke;stroke=null;strokePointer=null;if(p.length>=3&&p.some(q=>Math.hypot(q[0]-p[0][0],q[1]-p[0][1])>.1))setState({custom:p,time:0});stage.invalidate();};
  // Capture phase takes drawing priority over the camera; multi-touch remains a view gesture.
  cv.addEventListener('pointerdown',down,true);cv.addEventListener('pointermove',move,true);cv.addEventListener('pointerup',end,true);cv.addEventListener('pointercancel',end,true);
  const key=e=>{const s=getState();if(s.mode!=='shape'||s.shape!=='custom'||!isUnlocked('shape')||e.shiftKey||e.altKey||e.ctrlKey||e.metaKey)return;
    const dirs={ArrowLeft:[-.5,0],ArrowRight:[.5,0],ArrowUp:[0,.5],ArrowDown:[0,-.5]};
    if(dirs[e.key]){const d=dirs[e.key];pen=[Math.max(-12,Math.min(12,pen[0]+d[0])),Math.max(-12,Math.min(12,pen[1]+d[1]))];}
    else if(e.key===' '){stroke=[...(stroke||[]),[...pen]];}
    else if(e.key==='Enter'){end();}
    else if(e.key==='Escape'){stroke=null;}
    else return;
    e.preventDefault();e.stopPropagation();penStatus.textContent=fmt.t(['Crayon','Pen'])+' '+fmt.num(pen[0])+' ; '+fmt.num(pen[1])+' · '+(stroke?.length||0)+' '+fmt.t(['points','points']);stage.invalidate();
  };
  cv.addEventListener('keydown',key);
  const gesture=()=>{stroke=null;strokePointer=null;stage.invalidate();};cv.addEventListener('view-gesture',gesture);cv.removeEventListener('pointercancel',end,true);cv.addEventListener('pointercancel',gesture,true);cv.addEventListener('lostpointercapture',gesture);
  function player(c,onChange){let stop=null;const api={stop(){stop?.();stop=null;onChange(false);},toggle(){if(stop)return api.stop();if(stage.reduced()){advance({time:(getState().time+.1)%1});return;}let previous=null;stop=stage.animate(now=>{if(previous!==null)advance({time:(getState().time+Math.min(.05,(now-previous)/1000)/9)%1});previous=now;});onChange(true);}};return api;}
  return {draw,handles,player,destroy(){help.remove();penStatus.remove();cv.removeEventListener('keydown',key);cv.removeEventListener('view-gesture',gesture);cv.removeEventListener('pointercancel',gesture,true);cv.removeEventListener('lostpointercapture',gesture);cv.removeEventListener('pointerdown',down,true);cv.removeEventListener('pointermove',move,true);cv.removeEventListener('pointerup',end,true);cv.removeEventListener('pointercancel',end,true);}};
}
