// Shared accessible exhibit surface, input cleanup, theme-aware drawing and camera-independent 3D projection.
import {canvasIn,palette,field,bind} from './object-kit.js';
export {palette,field,bind};
export const TAU=2*Math.PI;
export function exhibit(root,{t,reduced},help,controls='',notes=''){
  root.innerHTML=`<p class="act-help">${help}</p><div class="obj-stage exhibit-stage"></div><div class="act-controls exhibit-controls">${controls}</div><p class="act-readout exhibit-readout" role="status" aria-live="polite"></p>${notes?`<details class="exhibit-notes"><summary>${t('Observer, puis comprendre','Observe, then understand')}</summary>${notes}</details>`:''}`;
  const o=canvasIn(root.querySelector('.exhibit-stage'),640/440),abort=new root.ownerDocument.defaultView.AbortController(),signal=abort.signal;
  o.cv.setAttribute('aria-label',t('Figure interactive. Tab pour les réglages. Pincement ou Ctrl + pincement ou Ctrl + molette pour zoomer ; Maj-glisser pour déplacer la vue ; 0 pour la réinitialiser.','Interactive figure. Tab for controls. Pinch or Ctrl + wheel to zoom; Shift-drag to pan; 0 to reset the view.'));
  const on=(el,type,fn)=>el.addEventListener(type,fn,{signal});let raf=0,last=0,alive=true,draw=()=>{},lastRead='';
  o.on=on;o.root=root;o.read=text=>{if(text!==lastRead){lastRead=text;root.querySelector('.exhibit-readout').textContent=text;}};
  o.redraw=()=>draw(0);o.animate=fn=>{draw=fn;draw(0);const frame=now=>{if(!alive)return;const dt=Math.min(.04,(now-last)/1000||0);last=now;if(!document.hidden)draw(reduced()?0:dt);raf=requestAnimationFrame(frame);};raf=requestAnimationFrame(frame);};
  o.stop=()=>{alive=false;cancelAnimationFrame(raf);abort.abort();o.navigation?.destroy();};
  // a press on the figure gives it the keyboard, so Delete and the arrow keys act on what was just touched
  on(o.cv,'pointerdown',()=>{if(root.ownerDocument.activeElement!==o.cv)o.cv.focus({preventScroll:true});});
  on(o.cv,'view-gesture',()=>o.cancelDrag?.());on(o.cv,'pointercancel',()=>o.cancelDrag?.());on(o.cv,'lostpointercapture',()=>o.cancelDrag?.());
  return o;
}
export function background(o){const C=palette();o.g.clearRect(0,0,o.W,o.H);o.g.fillStyle=C.sunken;o.g.fillRect(0,0,o.W,o.H);return C;}
export function path(g,pts,{close=false,fill=null,stroke=null,width=2,alpha=1}={}){if(!pts.length)return;g.globalAlpha=alpha;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));if(close)g.closePath();if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke();}g.globalAlpha=1;}
export function dot(g,p,color,r=7,label=''){g.fillStyle=color;g.beginPath();g.arc(p[0],p[1],r,0,TAU);g.fill();if(label){g.font='bold 14px system-ui';g.textAlign='center';g.fillText(label,p[0],p[1]-14);}}
export function orbitProject([x,y,z],yaw=-.5,pitch=.65,scale=125){const a=x*Math.cos(yaw)-y*Math.sin(yaw),b=x*Math.sin(yaw)+y*Math.cos(yaw);return [320+a*scale,224+(b*Math.sin(pitch)-z*Math.cos(pitch))*scale,b*Math.cos(pitch)+z*Math.sin(pitch)];}
export const button=(id,label,primary=false)=>`<button type="button" id="${id}" class="btn ${primary?'btn-primary':'btn-secondary'}">${label}</button>`;
export function dragOrbit(o,state,hit=()=>null,moveHandle=()=>{}){
  let drag=null;
  o.touchHit(p=>hit(p)!==null);
  o.on(o.cv,'pointerdown',e=>{const p=o.point(e);drag={p,handle:hit(p)};o.cv.setPointerCapture?.(e.pointerId);e.preventDefault();});
  o.on(o.cv,'pointermove',e=>{if(!drag)return;const p=o.point(e),d=[p[0]-drag.p[0],p[1]-drag.p[1]];if(drag.handle!==null)moveHandle(drag.handle,d,p);else{state.yaw-=d[0]*.008;state.pitch=Math.max(-1.45,Math.min(1.45,state.pitch+d[1]*.008));}drag.p=p;o.redraw();});
  o.on(o.cv,'pointerup',()=>drag=null);o.cancelDrag=()=>drag=null;
  o.on(o.cv,'keydown',e=>{if(e.shiftKey)return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();state.yaw+=(e.key==='ArrowLeft'?.12:e.key==='ArrowRight'?-.12:0);state.pitch=Math.max(-1.45,Math.min(1.45,state.pitch+(e.key==='ArrowUp'?-.1:e.key==='ArrowDown'?.1:0)));o.redraw();}});
}
