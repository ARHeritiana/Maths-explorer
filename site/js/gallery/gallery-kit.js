// Shared accessible exhibit surface, input cleanup, theme-aware drawing and camera-independent 3D projection.
import {canvasIn,palette,field,bind,idleGuard,animationLoop} from '../object-kit.js';
export {palette,field,bind,idleGuard};
export const TAU=2*Math.PI;
export function exhibit(root,{t,reduced},help,controls='',notes=''){
  root.innerHTML=`<p class="act-help">${help}</p><div class="obj-stage exhibit-stage"></div><div class="act-controls exhibit-controls">${controls}</div><p class="act-readout exhibit-readout" role="status" aria-live="polite"></p>${notes?`<details class="exhibit-notes"><summary>${t('Observer, puis comprendre','Observe, then understand')}</summary>${notes}</details>`:''}`;
  const o=canvasIn(root.querySelector('.exhibit-stage'),640/440),abort=new root.ownerDocument.defaultView.AbortController(),signal=abort.signal;
  o.cv.setAttribute('aria-label',t('Figure interactive. Tab pour les réglages. Pincement ou Ctrl + pincement ou Ctrl + molette pour zoomer ; Maj-glisser pour déplacer la vue ; 0 pour la réinitialiser.','Interactive figure. Tab for controls. Pinch or Ctrl + wheel to zoom; Shift-drag to pan; 0 to reset the view.'));
  const on=(el,type,fn)=>el.addEventListener(type,fn,{signal});let alive=true,draw=()=>{},lastRead='';
  o.on=on;o.root=root;o.read=text=>{if(text!==lastRead){lastRead=text;root.querySelector('.exhibit-readout').textContent=text;}};
  let loop=null;o.wake=ms=>loop?.wake(ms);
  o.redraw=()=>{draw(0);loop?.wake(0);};o.animate=fn=>{draw=fn;draw(0);loop=animationLoop(root,(dt)=>{const r=draw(Math.min(dt,.04));return o.busy?.()?true:o.once?false:r;},{reduced});};
  o.stop=()=>{alive=false;loop?.stop();abort.abort();o.navigation?.destroy();o.disconnect?.();};
  // a press on the figure gives it the keyboard, so Delete and the arrow keys act on what was just touched
  on(o.cv,'pointerdown',()=>{if(root.ownerDocument.activeElement!==o.cv)o.cv.focus({preventScroll:true});});
  on(o.cv,'view-gesture',()=>o.cancelDrag?.());on(o.cv,'pointercancel',()=>o.cancelDrag?.());on(o.cv,'lostpointercapture',()=>o.cancelDrag?.());
  return o;
}
export function background(o){const C=palette();o.g.clearRect(0,0,o.W,o.H);o.g.fillStyle=C.sunken;o.g.fillRect(0,0,o.W,o.H);return C;}
export function path(g,pts,{close=false,fill=null,stroke=null,width=2,alpha=1}={}){if(!pts.length)return;g.globalAlpha=alpha;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));if(close)g.closePath();if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke();}g.globalAlpha=1;}
export function dot(g,p,color,r=7,label=''){g.fillStyle=color;g.beginPath();g.arc(p[0],p[1],r,0,TAU);g.fill();if(label){g.font='bold 14px system-ui';g.textAlign='center';g.fillText(label,p[0],p[1]-14);}}
export function orbitProject([x,y,z],yaw=-.5,pitch=.65,scale=125){const a=x*Math.cos(yaw)-y*Math.sin(yaw),b=x*Math.sin(yaw)+y*Math.cos(yaw);return [320+a*scale,224+(b*Math.sin(pitch)-z*Math.cos(pitch))*scale,b*Math.cos(pitch)+z*Math.sin(pitch)];}
// Convex 3D faces on a 2D canvas, turned by view {yaw, pitch}: back faces culled, the rest painted far to near. A fixed key
// light from the upper left (in screen space, so the lighting does not turn with the solid) darkens faces turned from it
// (Lambert, with an ambient floor) and a soft highlight brightens those facing the half-way vector, so neighbouring faces
// read apart. polys: [{pts:[[x,y,z]...], normal:[x,y,z], shade (index into C.c)}].
const KEY=(()=>{const L=[-.5,-.68,.55],n=Math.hypot(...L);return L.map(v=>v/n);})(),HALF=(()=>{const h=[KEY[0],KEY[1],KEY[2]+1],n=Math.hypot(...h);return h.map(v=>v/n);})();
export function drawFaces(g,C,polys,view,scale,{dy=8,ghost=false}={}){
  const O=orbitProject([0,0,0],view.yaw,view.pitch,1),P=[];
  for(const q of polys){const m=orbitProject(q.normal,view.yaw,view.pitch,1),len=Math.hypot(...q.normal),nv=[(m[0]-O[0])/len,(m[1]-O[1])/len,(m[2]-O[2])/len];if(nv[2]<=0)continue;
    const lam=Math.max(0,nv[0]*KEY[0]+nv[1]*KEY[1]+nv[2]*KEY[2]),spec=Math.max(0,nv[0]*HALF[0]+nv[1]*HALF[1]+nv[2]*HALF[2])**36;
    const s=q.pts.map(v=>orbitProject(v,view.yaw,view.pitch,scale));P.push({s,d:s.reduce((a,b)=>a+b[2],0)/s.length,shade:q.shade,dark:.5*(1-lam),light:.4*spec});}
  P.sort((a,b)=>a.d-b.d);
  const edges=P.length<1500;g.lineWidth=P.length<300?1.2:.5;g.lineJoin='round';g.strokeStyle=C.ink;
  for(const q of P){g.beginPath();q.s.forEach(([x,y],i)=>i?g.lineTo(x,y+dy):g.moveTo(x,y+dy));g.closePath();
    if(ghost){g.setLineDash([5,4]);g.stroke();g.setLineDash([]);continue;}
    g.fillStyle=C.c[q.shade];g.fill();
    if(q.dark>.01){g.globalAlpha=q.dark;g.fillStyle='#000';g.fill();}
    if(q.light>.01){g.globalAlpha=q.light;g.fillStyle='#fff';g.fill();}
    g.globalAlpha=1;
    if(edges)g.stroke();else{g.strokeStyle=C.c[q.shade];g.lineWidth=.6;g.stroke();g.strokeStyle=C.ink;}}
}
export const button=(id,label,primary=false)=>`<button type="button" id="${id}" class="btn ${primary?'btn-primary':'btn-secondary'}">${label}</button>`;
export function dragOrbit(o,state,hit=()=>null,moveHandle=()=>{}){
  let drag=null;
  o.touchHit(p=>hit(p)!==null);
  o.on(o.cv,'pointerdown',e=>{const p=o.point(e);drag={p,handle:hit(p)};o.cv.setPointerCapture?.(e.pointerId);e.preventDefault();});
  o.on(o.cv,'pointermove',e=>{if(!drag)return;const p=o.point(e),d=[p[0]-drag.p[0],p[1]-drag.p[1]];if(drag.handle!==null)moveHandle(drag.handle,d,p);else{state.yaw-=d[0]*.008;state.pitch=Math.max(-1.45,Math.min(1.45,state.pitch+d[1]*.008));}drag.p=p;o.redraw();});
  o.on(o.cv,'pointerup',()=>drag=null);o.cancelDrag=()=>drag=null;
  o.on(o.cv,'keydown',e=>{if(e.shiftKey)return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();state.yaw+=(e.key==='ArrowLeft'?.12:e.key==='ArrowRight'?-.12:0);state.pitch=Math.max(-1.45,Math.min(1.45,state.pitch+(e.key==='ArrowUp'?-.1:e.key==='ArrowDown'?.1:0)));o.redraw();}});
}
