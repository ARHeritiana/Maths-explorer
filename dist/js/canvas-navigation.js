// A camera is independent of the mathematical parameters. Moving an object never changes it.
export function camera2D() {
  const c = { scale: 1, x: 0, y: 0 };
  c.project = ([x,y]) => [c.x+c.scale*x,c.y+c.scale*y];
  c.unproject = ([x,y]) => [(x-c.x)/c.scale,(y-c.y)/c.scale];
  c.zoomAt = (factor,[x,y]) => { const p=c.unproject([x,y]); c.scale=Math.max(.2,Math.min(12,c.scale*factor)); c.x=x-p[0]*c.scale;c.y=y-p[1]*c.scale; };
  c.reset=()=>{c.scale=1;c.x=c.y=0;};return c;
}
export function navigationButtons(host,action,lang='fr') {
  const en=lang==='en',bar=document.createElement('div');bar.className='canvas-navigation';bar.setAttribute('role','group');bar.setAttribute('aria-label',en?'View controls':'Commandes de la vue');
  for(const [id,text,fr,english] of [['in','+','Agrandir','Zoom in'],['out','−','Réduire','Zoom out'],['reset','↺','Vue initiale','Reset view'],['left','←','Vue vers la gauche','Pan left'],['right','→','Vue vers la droite','Pan right'],['up','↑','Vue vers le haut','Pan up'],['down','↓','Vue vers le bas','Pan down']]) {
    const b=document.createElement('button');b.type='button';b.textContent=text;b.dataset.view=id;b.title=en?english:fr;b.setAttribute('aria-label',b.title);b.addEventListener('click',()=>action(id));bar.append(b);
  }
  const label=document.createElement('output');label.setAttribute('aria-live','polite');bar.append(label);host.append(bar);bar.update=scale=>{label.textContent=`${Math.round(scale*100)} %`;};bar.update(1);return bar;
}
export function canvasNavigation(c,g,size,redraw,{host=c.parentElement,lang=document.documentElement.lang}={}) {
  const camera=camera2D(),rawClear=g.clearRect.bind(g);let last=null,gesture=null;
  const pointers=new Map(),point=e=>{const r=c.getBoundingClientRect(),[w,h]=size();return [(e.clientX-r.left)/r.width*w,(e.clientY-r.top)/r.height*h];};
  const apply=()=>{const [w]=size(),d=c.width/w;g.setTransform(d*camera.scale,0,0,d*camera.scale,d*camera.x,d*camera.y);};
  g.clearRect=()=>{g.save();g.setTransform(1,0,0,1,0,0);rawClear(0,0,c.width,c.height);g.restore();apply();};
  const refresh=()=>{apply();bar.update(camera.scale);redraw();};
  const action=id=>{const [w,h]=size();if(id==='reset')camera.reset();else if(id==='in'||id==='out')camera.zoomAt(id==='in'?1.25:.8,[w/2,h/2]);else{const d={left:[40,0],right:[-40,0],up:[0,40],down:[0,-40]}[id];camera.x+=d[0];camera.y+=d[1];}refresh();};
  const bar=navigationButtons(host,action,lang);c.style.touchAction='none';if(c.tabIndex<0)c.tabIndex=0;
  const down=e=>{if(e.pointerType==='touch')pointers.set(e.pointerId,point(e));if(pointers.size===2){const a=[...pointers.values()];gesture={distance:Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]),mid:[(a[0][0]+a[1][0])/2,(a[0][1]+a[1][1])/2]};c.dispatchEvent(new CustomEvent('view-gesture'));}if(gesture||e.button===1||e.altKey||e.shiftKey){if(!gesture)last=point(e);c.setPointerCapture?.(e.pointerId);e.preventDefault();e.stopImmediatePropagation();}};
  const move=e=>{if(pointers.has(e.pointerId))pointers.set(e.pointerId,point(e));if(gesture&&pointers.size===2){const a=[...pointers.values()],mid=[(a[0][0]+a[1][0])/2,(a[0][1]+a[1][1])/2],d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);camera.zoomAt(d/Math.max(1,gesture.distance),gesture.mid);camera.x+=mid[0]-gesture.mid[0];camera.y+=mid[1]-gesture.mid[1];gesture={distance:d,mid};refresh();e.preventDefault();e.stopImmediatePropagation();}else if(last){const q=point(e);camera.x+=q[0]-last[0];camera.y+=q[1]-last[1];last=q;refresh();e.preventDefault();e.stopImmediatePropagation();}};
  const end=e=>{const handled=!!last||!!gesture;pointers.delete(e.pointerId);last=null;if(pointers.size<2)gesture=null;if(handled){e.preventDefault();e.stopImmediatePropagation();}};
  const wheel=e=>{if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();e.stopImmediatePropagation();camera.zoomAt(Math.exp(-e.deltaY*.005),point(e));refresh();};
  const key=e=>{if(['+','=','-','0'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();action(e.key==='0'?'reset':e.key==='-'?'out':'in');}};
  const events=[['pointerdown',down],['pointermove',move],['pointerup',end],['pointercancel',end],['wheel',wheel],['keydown',key]];
  for(const [name,fn] of events)c.addEventListener(name,fn,{capture:true,passive:false});
  return {camera,point:e=>camera.unproject(point(e)),apply,destroy(){bar.remove();g.clearRect=rawClear;for(const[n,f]of events)c.removeEventListener(n,f,true);}};
}
// Changing viewBox preserves the inverse screen transform used by the SVG editors for picking.
export function svgNavigation(svg,{lang=document.documentElement.lang,host=svg.parentElement,state={}}={}) {
  const original=state.original??=(svg.getAttribute('viewBox')||'0 0 640 400').split(/[ ,]+/).map(Number);let box=[...(state.box||original)],drag=null;
  const paint=()=>{state.box=[...box];svg.setAttribute('viewBox',box.join(' '));bar.update(original[2]/box[2]);};
  const zoom=(k,fx=.5,fy=.5)=>{const w=Math.max(original[2]/12,Math.min(original[2]*5,box[2]*k)),h=w*original[3]/original[2];box=[box[0]+(box[2]-w)*fx,box[1]+(box[3]-h)*fy,w,h];paint();};
  const action=id=>{if(id==='reset'){box=[...original];paint();}else if(id==='in'||id==='out')zoom(id==='in'?.8:1.25);else{const d={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]}[id];box[0]+=d[0]*box[2]*.12;box[1]+=d[1]*box[3]*.12;paint();}};
  const bar=navigationButtons(host,action,lang);svg.style.touchAction='none';
  const observer=new MutationObserver(()=>{if(svg.getAttribute('viewBox')!==box.join(' '))paint();});observer.observe(svg,{attributes:true,attributeFilter:['viewBox']});
  const wheel=e=>{if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();const r=svg.getBoundingClientRect();zoom(Math.exp(e.deltaY*.005),(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);};
  const down=e=>{if(!(e.altKey||e.shiftKey||e.button===1))return;e.preventDefault();e.stopImmediatePropagation();drag={x:e.clientX,y:e.clientY,box:[...box]};svg.setPointerCapture(e.pointerId);};
  const move=e=>{if(!drag)return;const r=svg.getBoundingClientRect();box[0]=drag.box[0]-(e.clientX-drag.x)/r.width*box[2];box[1]=drag.box[1]-(e.clientY-drag.y)/r.height*box[3];paint();e.stopImmediatePropagation();};const end=()=>{drag=null;};
  svg.addEventListener('wheel',wheel,{passive:false});svg.addEventListener('pointerdown',down,true);svg.addEventListener('pointermove',move,true);svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
  paint();
  const stop=()=>{observer.disconnect();bar.remove();svg.removeEventListener('wheel',wheel);svg.removeEventListener('pointerdown',down,true);svg.removeEventListener('pointermove',move,true);svg.removeEventListener('pointerup',end);svg.removeEventListener('pointercancel',end);};stop.bar=bar;return stop;
}

export function observeSvgNavigation(root,selector,lang) {
  const mounted=new Map(),states=new Map();let alive=true;
  const scan=()=>{if(!alive)return;for(const [svg,stop]of mounted)if(!svg.isConnected||!stop.bar.isConnected){stop();mounted.delete(svg);}
    [...root.querySelectorAll(selector)].forEach((svg,i)=>{if(mounted.has(svg))return;const key=`${svg.closest('[id]')?.id||'figure'}-${i}`;if(!states.has(key))states.set(key,{});mounted.set(svg,svgNavigation(svg,{lang,state:states.get(key)}));});};
  const observer=new MutationObserver(scan);observer.observe(root,{childList:true,subtree:true});scan();
  return()=>{alive=false;observer.disconnect();for(const stop of mounted.values())stop();mounted.clear();};
}
