// Three synchronized views of the same logistic recurrence, using the shared stage and per-panel cameras.
import { panelView,drawAxes,drawScene,drawHandles,buildHandles } from '../plot.js';
import { bifurcation } from '../models/cobweb.js';
export function mount(env){
 const {exp,stage,fmt,getState,setState,advance,isUnlocked}=env;let views={};
 stage.wrap.style.height='660px';
 function layout(){const W=stage.W,H=stage.H,wide=W>650;
  const rects=wide?[{x:0,y:0,w:W/2,h:H/2},{x:W/2,y:0,w:W/2,h:H/2},{x:0,y:H/2,w:W,h:H/2}]:[0,1,2].map(i=>({x:0,y:i*H/3,w:W,h:H/3}));
  views={};exp.views.panels.forEach((id,i)=>views[id]=panelView(stage,id,rects[i],exp.views[id]));
 }layout();
 const handles=buildHandles({exp,fmt,getState,setState,views:()=>views,panels:exp.views.panels});
 function draw(g){layout();const s=getState(),ctx={fmt,lang:fmt.lang,stage};
  for(const id of exp.views.panels){const v=views[id],spec=exp.views[id];drawAxes(g,v,spec,stage,fmt);drawScene(g,v,spec.scene(s,ctx),stage);}
  const v=views.bifurcation,lo=Math.max(0,v.x0),hi=Math.min(4,v.x1);
  if(hi>lo){g.save();g.beginPath();g.rect(v.left,v.top,v.width,v.height);g.clip();g.fillStyle=stage.color('obj3');g.globalAlpha=.45;for(const[r,x]of bifurcation(lo,hi,Math.min(600,Math.max(80,Math.floor(v.width))),32,900)){const Y=v.Y(x);if(Y>=v.top&&Y<=v.top+v.height)g.fillRect(v.X(r),Y,1.2,1.2);}g.restore();}
  drawHandles(g,stage,handles,isUnlocked);
 }
 const players=[];
 function player(c,onChange){let stop=null;const api={get playing(){return!!stop;},stop(){if(stop){stop();stop=null;onChange?.(false);}},toggle(){if(stop)return api.stop();let n=c.get(getState());if(n>=c.max)n=0;if(stage.reduced()){advance(c.set(getState(),Math.min(c.max,n+1)));return;}let last=null,carry=0;advance(c.set(getState(),n));stop=stage.animate(now=>{last??=now;carry+=Math.min(.1,(now-last)/1000)*8;last=now;const steps=Math.floor(carry);if(steps){carry-=steps;n=Math.min(c.max,n+steps);advance(c.set(getState(),n));}if(n>=c.max){stop=null;onChange?.(false);return false;}});onChange?.(true);}};players.push(api);return api;}
 return{draw,handles,player,destroy(){players.forEach(p=>p.stop());}};
}
