// Measurement panels next to a gallery figure (issue #37): a strip of labelled live values, each marked exact, approximate or
// observed, and one small plot drawn from the same state as the figure. Pure helpers (ticks, sampling) are tested in
// tests/gallery-panels.test.mjs.
import {canvasIn,palette} from '../object-kit.js';

// Round axis ticks 0, step, 2 step... covering max (1, 2 or 5 times a power of ten), at most about `count` of them.
export function niceTicks(max,count=4){
  if(!(max>0))return [0,1];
  const raw=max/count,p=10**Math.floor(Math.log10(raw)),step=[1,2,5,10].map(m=>m*p).find(s=>s>=raw);
  const out=[];for(let v=0;v<=max+step*1e-9;v+=step)out.push(+v.toPrecision(12));
  if(out.at(-1)<max)out.push(+(out.at(-1)+step).toPrecision(12));
  return out;
}
// Round ticks covering [lo, hi] when the axis should not start at 0 (a quantity that only moves a little, like a film's area).
export function niceRange(lo,hi,count=4){
  if(!(hi>lo))return [lo-1,lo,lo+1].map(v=>+v.toPrecision(12));
  const raw=(hi-lo)/count,p=10**Math.floor(Math.log10(raw)),step=[1,2,5,10].map(m=>m*p).find(v=>v>=raw),out=[];
  for(let v=Math.floor(lo/step)*step;v<hi+step*.999;v+=step)out.push(+v.toPrecision(12));
  return out;
}
// Indices to draw from n samples, at most `cap` of them: a fixed stride, always ending on the last sample, never an invented value.
export function sampleIndices(n,cap=600){
  const stride=Math.max(1,Math.ceil(n/cap)),out=[];for(let i=0;i<n;i+=stride)out.push(i);
  if(n&&out.at(-1)!==n-1)out.push(n-1);return out;
}

const KIND={exact:['exact','exact'],approx:['approché','approximate'],observed:['observé','observed']};
// The strip sits right under the figure. items: [{id, label, kind}]; set(id, text) changes one value only when it differs.
export function metricStrip(stage,t,items){
  const dl=stage.ownerDocument.createElement('dl');dl.className='exhibit-metrics';
  const cells=new Map();
  for(const {id,label,kind} of items){
    const div=stage.ownerDocument.createElement('div');
    div.innerHTML=`<dt>${label}${kind?` <span class="exhibit-kind">${t(...KIND[kind])}</span>`:''}</dt><dd>–</dd>`;
    dl.append(div);cells.set(id,div.querySelector('dd'));
  }
  dl.style.setProperty('--canvas-aspect',stage.style.getPropertyValue('--canvas-aspect')||'1.5');
  stage.after(dl);
  return {el:dl,set(id,text){const dd=cells.get(id);if(dd&&dd.textContent!==String(text))dd.textContent=String(text);}};
}

// A plot under the strip: a figure with its own canvas (no zoom), an accessible caption, and draw(spec) for line charts.
// Options: t (for the labels below), compare {label: () => text of the current run}: a button pins the first series of the
// current plot, drawn dotted under the next runs so two runs can be compared on the same axes; onEvent(event): the events
// of a plot (spec.events, [{x, label}]) are listed under it as buttons that take the figure to that moment.
export function plotPanel(after,caption,{aspect=640/250,t=(fr,en)=>fr,compare=null,onEvent=null}={}){
  const doc=after.ownerDocument,fig=doc.createElement('figure');fig.className='exhibit-plot';
  const host=doc.createElement('div');fig.append(host);
  const cap=doc.createElement('figcaption');cap.textContent=caption;fig.append(cap);fig.style.setProperty('--canvas-aspect',after.style.getPropertyValue('--canvas-aspect')||'1.5');after.after(fig);
  const p=canvasIn(host,aspect,{navigation:false});p.cv.setAttribute('role','img');p.cv.setAttribute('aria-label',caption);
  let last=null,pinned=null,eventKey='';
  const list=doc.createElement('ol');list.className='exhibit-events';list.hidden=true;fig.append(list);
  if(compare){
    const tools=doc.createElement('div');tools.className='exhibit-plot-tools';
    tools.innerHTML=`<button type="button" class="btn btn-secondary" aria-pressed="false">${t('Épingler cette courbe pour comparer','Pin this curve to compare')}</button><span class="exhibit-pin-legend" aria-live="polite"></span>`;
    fig.append(tools);const btn=tools.querySelector('button'),legend=tools.querySelector('span');
    btn.addEventListener('click',()=>{
      if(pinned){pinned=null;}else if(last?.series?.length){const pts=seriesPoints(last.series[0]);pinned={points:sampleIndices(pts.length).map(i=>pts[i]),label:compare.label()};}
      btn.setAttribute('aria-pressed',String(!!pinned));btn.textContent=pinned?t('Retirer la courbe épinglée','Remove the pinned curve'):t('Épingler cette courbe pour comparer','Pin this curve to compare');
      legend.textContent=pinned?t(`pointillés gris : ${pinned.label}`,`grey dots: ${pinned.label}`):'';p.redraw();});
    p.unpin=()=>{if(pinned)btn.click();};
  }
  function listEvents(events){
    const key=JSON.stringify(events.map(e=>[e.x,e.label]));if(key===eventKey)return;eventKey=key;list.hidden=!events.length;
    list.innerHTML=events.map((e,i)=>`<li>${onEvent?`<button type="button" class="btn btn-secondary" data-i="${i}">${e.label}</button>`:e.label}</li>`).join('');
    if(onEvent)list.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>onEvent(events[+b.dataset.i])));
  }
  p.redraw=()=>{if(last)lineChart(p,withPinned(last,pinned));};
  p.draw=spec=>{last=spec;lineChart(p,withPinned(spec,pinned));listEvents(spec.events||[]);};
  p.caption=text=>{if(cap.textContent!==text)cap.textContent=text;};
  p.show=on=>{fig.hidden=!on;};
  p.stop=()=>{p.disconnect?.();p.stopTouch?.();fig.remove();};
  return p;
}
const seriesPoints=s=>s.points||s.values.map((v,i)=>[i,v]);
// The spec with a pinned run added under the others (grey, dotted), the axes widened so that both runs fit. Pure.
export function withPinned(spec,pinned){
  if(!pinned?.points?.length)return spec;
  const xs=pinned.points.map(q=>q[0]),ys=pinned.points.map(q=>q[1]),out={...spec,series:[{points:pinned.points,color:'muted',dash:[5,4],width:1.8,dots:false},...(spec.series||[])]};
  if(!spec.xTicks)out.xMax=Math.max(spec.xMax||0,...xs);
  if(!spec.logY){out.yMax=Math.max(spec.yMax??0,...ys);if(spec.yMin!=null)out.yMin=Math.min(spec.yMin,...ys);}
  return out;
}

// spec: {events ([{x, label}]: numbered dotted lines), xMax, xTicks (optional: explicit ticks, the last one is the end of the axis), yMin (optional: axis not from 0), yMax, xLabel, yLabel, series:[{values|points, color (a palette() key such as 'ink', or a CSS colour), dots}], marker:[x,y], logY:[lo,hi], yFormat}
// values are y at x = 0, 1, 2...; points are [x, y] pairs. Samples are joined by straight segments; dots mark each sample when few.
export function lineChart(p,spec){
  // labels keep about 11 css pixels on a narrow screen: the logical canvas is 640 wide whatever its width on the page
  const k=Math.max(1,Math.min(2.2,640/(p.cv.clientWidth||640))),g=p.g,C=palette(),W=p.W,H=p.H,L=30+22*k,R=W-14,T=8+8*k,B=H-14-18*k,fmt=spec.yFormat||(v=>String(v));
  g.save();g.setTransform(p.scale,0,0,p.scale,0,0);g.clearRect(0,0,W,H);g.fillStyle=C.surface;g.fillRect(0,0,W,H);
  const xt=spec.xTicks||niceTicks(spec.xMax||1,6),xm=xt.at(-1),log=spec.logY;
  const yt=log?Array.from({length:Math.round(Math.log10(log[1]/log[0]))+1},(_,i)=>log[0]*10**i):spec.yMin!=null?niceRange(spec.yMin,spec.yMax,4):niceTicks(spec.yMax||1,4),y0=log?0:yt[0],ym=yt.at(-1);
  const X=x=>L+(R-L)*x/xm,Y=log?(v=>B-(B-T)*Math.log10(Math.max(v,log[0])/log[0])/Math.log10(log[1]/log[0])):(v=>B-(B-T)*(v-y0)/(ym-y0));
  g.font=`${Math.round(11*k)}px "IBM Plex Sans",system-ui,sans-serif`;g.lineWidth=1;g.strokeStyle=C.grid;g.fillStyle=C.muted;
  g.textAlign='right';g.textBaseline='middle';
  for(const v of yt){const y=Math.round(Y(v))+.5;g.beginPath();g.moveTo(L,y);g.lineTo(R,y);g.stroke();g.fillText(fmt(v),L-4*k,y);}
  g.textAlign='center';g.textBaseline='top';
  xt.forEach((v,i)=>{const x=Math.round(X(v))+.5;g.beginPath();g.moveTo(x,B);g.lineTo(x,B+4);g.stroke();g.textAlign=i===xt.length-1?'right':'center';g.fillText(String(v),i===xt.length-1?x+2:x,B+4*k);});
  g.strokeStyle=C.line;g.beginPath();g.moveTo(L+.5,T);g.lineTo(L+.5,B+.5);g.lineTo(R,B+.5);g.stroke();
  g.textAlign='right';g.textBaseline='bottom';g.fillText(spec.xLabel||'',R,B-4);
  g.textAlign='left';g.textBaseline='top';g.fillText(spec.yLabel||'',L+6,1);
  for(const s of spec.series||[]){
    const pts=s.points||s.values.map((v,i)=>[i,v]),idx=sampleIndices(pts.length);
    const col=C[s.color]||s.color;g.strokeStyle=col;g.lineWidth=s.width||2;g.lineJoin='round';g.setLineDash(s.dash||[]);g.beginPath();
    idx.forEach((i,j)=>{const x=X(pts[i][0]),y=Y(pts[i][1]);j?g.lineTo(x,y):g.moveTo(x,y);});g.stroke();g.setLineDash([]);
    if(s.dots??idx.length<=60){g.fillStyle=col;for(const i of idx){g.beginPath();g.arc(X(pts[i][0]),Y(pts[i][1]),2.6,0,2*Math.PI);g.fill();}}
  }
  (spec.events||[]).forEach((e,i)=>{if(!(e.x>=0&&e.x<=xm))return;const x=Math.round(X(e.x))+.5;g.strokeStyle=C.obj2;g.lineWidth=1.2;g.setLineDash([2,3]);g.beginPath();g.moveTo(x,T+10*k);g.lineTo(x,B);g.stroke();g.setLineDash([]);
    g.fillStyle=C.obj2;g.beginPath();g.arc(x,T+4*k,7*k,0,2*Math.PI);g.fill();g.fillStyle=C.surface;g.textAlign='center';g.textBaseline='middle';g.font=`600 ${Math.round(10*k)}px system-ui,sans-serif`;g.fillText(String(i+1),x,T+4.5*k);});
  if(spec.marker){const [x,y]=spec.marker;g.strokeStyle=C.ink;g.lineWidth=1;g.setLineDash([3,3]);g.beginPath();g.moveTo(X(x)+.5,T);g.lineTo(X(x)+.5,B);g.stroke();g.setLineDash([]);
    if(y!=null){g.fillStyle=C.object;g.beginPath();g.arc(X(x),Y(y),4.5,0,2*Math.PI);g.fill();}}
  g.restore();
}
