// Specular billiards: analytic segments, elliptical arcs and quadratic Bezier boundaries.
// Geometry is independent of display, cameras and the number of sampled rays.
export const TAU = 2 * Math.PI;
export const EPS = 1e-8;
const add=(a,b)=>a.map((x,i)=>x+b[i]), sub=(a,b)=>a.map((x,i)=>x-b[i]), mul=(a,k)=>a.map(x=>x*k);
export const dot=(a,b)=>a[0]*b[0]+a[1]*b[1];
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
export const norm=a=>Math.hypot(...a);
export const unit=a=>{const n=norm(a);if(!n)throw new RangeError('zero direction');return mul(a,1/n);};
export const reflect=(d,n)=>{const u=unit(n);return sub(d,mul(u,2*dot(d,u)));};
export const line=(a,b)=>({type:'line',a,b});
export const arc=(c,rx,ry,start,sweep)=>({type:'arc',c,rx,ry,start,sweep});
export const bezier=(a,c,b)=>({type:'bezier',a,c,b});
const mod=x=>((x%TAU)+TAU)%TAU;
function roots(a,b,c){
  if(Math.abs(a)<1e-14){return Math.abs(b)<1e-14?[]:[-c/b];}
  let D=b*b-4*a*c;if(D < -1e-12*(b*b+Math.abs(4*a*c)+1))return [];
  D=Math.sqrt(Math.max(0,D));const q=-.5*(b+(b>=0?D:-D));
  return q===0?[-b/(2*a)]:[q/a,c/q];
}
export function pointAt(e,t){
  if(e.type==='line')return add(e.a,mul(sub(e.b,e.a),t));
  if(e.type==='arc'){const a=e.start+e.sweep*t;return add(e.c,[e.rx*Math.cos(a),e.ry*Math.sin(a)]);}
  return add(add(mul(e.a,(1-t)**2),mul(e.c,2*t*(1-t))),mul(e.b,t*t));
}
export function derivativeAt(e,t){
  if(e.type==='line')return sub(e.b,e.a);
  if(e.type==='arc'){const a=e.start+e.sweep*t;return [-e.rx*Math.sin(a)*e.sweep,e.ry*Math.cos(a)*e.sweep];}
  return mul(add(mul(sub(e.c,e.a),1-t),mul(sub(e.b,e.c),t)),2);
}
export function intersections(origin,direction,e){
  const d=unit(direction),out=[];
  const accept=(u,p)=>{const t=dot(sub(p,origin),d);if(t>EPS&&u>=-EPS&&u<=1+EPS){const tangent=derivativeAt(e,u);if(norm(tangent)>EPS)out.push({t,u,p,normal:unit([-tangent[1],tangent[0]])});}};
  if(e.type==='line'){
    const v=sub(e.b,e.a),den=cross(d,v);if(Math.abs(den)<1e-12)return [];
    const w=sub(e.a,origin),t=cross(w,v)/den,u=cross(w,d)/den;
    if(t>EPS&&u>=-EPS&&u<=1+EPS)accept(u,add(origin,mul(d,t)));
  }else if(e.type==='arc'){
    const o=sub(origin,e.c),A=(d[0]/e.rx)**2+(d[1]/e.ry)**2,B=2*(o[0]*d[0]/e.rx**2+o[1]*d[1]/e.ry**2),C=(o[0]/e.rx)**2+(o[1]/e.ry)**2-1;
    for(const t of roots(A,B,C)){if(t<=EPS)continue;const p=add(origin,mul(d,t)),theta=Math.atan2((p[1]-e.c[1])/e.ry,(p[0]-e.c[0])/e.rx),angle=e.sweep>0?mod(theta-e.start):mod(e.start-theta);if(angle<=Math.abs(e.sweep)+EPS)accept(angle/Math.abs(e.sweep),p);}
  }else{
    const A=add(sub(e.a,mul(e.c,2)),e.b),B=mul(sub(e.c,e.a),2),C=sub(e.a,origin);
    for(const u of roots(cross(A,d),cross(B,d),cross(C,d)))if(u>=-EPS&&u<=1+EPS)accept(u,pointAt(e,u));
  }
  return out.sort((a,b)=>a.t-b.t).filter((x,i,a)=>!i||Math.abs(x.t-a[i-1].t)>EPS);
}
export function onBoundary(p,e,tolerance=EPS){
  if(e.type==='line'){
    const v=sub(e.b,e.a),w=sub(p,e.a),L=norm(v);if(L<tolerance)return norm(w)<tolerance;
    const u=dot(w,v)/(L*L);return u>=-tolerance&&u<=1+tolerance&&Math.abs(cross(w,v))/L<tolerance;
  }
  if(e.type==='arc'){
    const q=sub(p,e.c),x=q[0]/e.rx,y=q[1]/e.ry;if(Math.abs(x*x+y*y-1)>tolerance)return false;
    const theta=Math.atan2(y,x),angle=e.sweep>0?mod(theta-e.start):mod(e.start-theta);return angle<=Math.abs(e.sweep)+tolerance;
  }
  const A=add(sub(e.a,mul(e.c,2)),e.b),B=mul(sub(e.c,e.a),2),C=sub(e.a,p),axis=Math.abs(A[0])+Math.abs(B[0])>=Math.abs(A[1])+Math.abs(B[1])?0:1;
  return [0,1,...roots(A[axis],B[axis],C[axis])].some(t=>t>=0&&t<=1&&norm(sub(pointAt(e,t),p))<tolerance);
}
export function trace(edges,source,direction,bounces=30){
  if(!Number.isInteger(bounces)||bounces<0||bounces>300)throw new RangeError('bounces');
  let p=[...source],d=unit(direction),length=0;const points=[p],hits=[];
  for(let bounce=0;bounce<=bounces;bounce++){
    const candidates=edges.flatMap((e,i)=>intersections(p,d,e).map(h=>({...h,edge:i}))).sort((a,b)=>a.t-b.t);
    if(!candidates.length)return {points,hits,length,reason:'escaped'};
    const h=candidates[0];length+=h.t;points.push(h.p);
    const coincident=candidates.filter(q=>Math.abs(q.t-h.t)<EPS*20);
    const endpoint=h.u<EPS||h.u>1-EPS;
    const smoothJoin=coincident.length>1&&coincident.every(q=>Math.abs(dot(q.normal,h.normal))>1-1e-9);
    const singular=(coincident.length>1||endpoint)&&!smoothJoin;
    if(singular)return {points,hits,length,reason:'corner'};
    if(Math.abs(dot(d,h.normal))<1e-7)return {points,hits,length,reason:'tangent'};
    if(bounce===bounces)return {points,hits,length,reason:'limit'};
    hits.push(h.edge);p=h.p;d=unit(reflect(d,h.normal));
  }
  return {points,hits,length,reason:'limit'};
}
export const polygonEdges=vertices=>vertices.map((a,i)=>line(a,vertices[(i+1)%vertices.length]));
export function flatten(edges,steps=40){return edges.flatMap(e=>Array.from({length:e.type==='line'?1:steps},(_,i)=>pointAt(e,i/(e.type==='line'?1:steps))));}
export function inside(point,vertices){
  let result=false;const [x,y]=point;
  for(let i=0,j=vertices.length-1;i<vertices.length;j=i++){
    const a=vertices[i],b=vertices[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])result=!result;
  }return result;
}
export function validate(edges){
  if(edges.length<3)return {ok:false,reason:'too-few'};
  if(edges.some(e=>!Object.values(e).flat().every(x=>typeof x==='string'||Number.isFinite(x))))return {ok:false,reason:'nonfinite'};
  for(let i=0;i<edges.length;i++){
    if(norm(sub(pointAt(edges[i],1),pointAt(edges[(i+1)%edges.length],0)))>EPS)return {ok:false,reason:'open'};
    if(norm(derivativeAt(edges[i],0))<EPS||norm(derivativeAt(edges[i],1))<EPS)return {ok:false,reason:'degenerate'};
  }
  // Curves are conservatively flattened for editor validation only. Reflection itself stays analytic.
  const ps=flatten(edges,80);let area=0;
  for(let i=0;i<ps.length;i++)area+=cross(ps[i],ps[(i+1)%ps.length]);
  if(Math.abs(area)<EPS)return {ok:false,reason:'zero-area'};
  for(let i=0;i<ps.length;i++)for(let j=i+2;j<ps.length;j++){
    if(i===0&&j===ps.length-1)continue;
    const a=ps[i],b=ps[(i+1)%ps.length],c=ps[j],d=ps[(j+1)%ps.length],v=sub(b,a),w=sub(d,c),den=cross(v,w);
    if(Math.abs(den)<EPS){if(Math.abs(cross(sub(c,a),v))<EPS){const vv=dot(v,v),lo=dot(sub(c,a),v)/vv,hi=dot(sub(d,a),v)/vv;if(Math.min(1,Math.max(lo,hi))-Math.max(0,Math.min(lo,hi))>EPS)return {ok:false,reason:'overlap'};}continue;}
    const u=cross(sub(c,a),w)/den,t=cross(sub(c,a),v)/den;
    if(u>=-EPS&&u<=1+EPS&&t>=-EPS&&t<=1+EPS)return {ok:false,reason:'crossing'};
  }
  return {ok:true,area:Math.abs(area)/2};
}
export function unfold(edges,path){
  if(edges.some(e=>e.type!=='line'))return null;
  let A=[[1,0],[0,1]],b=[0,0];const apply=p=>add(A.map(row=>dot(row,p)),b),copies=[edges.map(e=>apply(e.a))],points=[apply(path.points[0])];
  for(let i=0;i<path.hits.length;i++){
    points.push(apply(path.points[i+1]));const e=edges[path.hits[i]],v=unit(sub(e.b,e.a)),R=[[2*v[0]*v[0]-1,2*v[0]*v[1]],[2*v[0]*v[1],2*v[1]*v[1]-1]],rb=sub(e.a,R.map(row=>dot(row,e.a)));
    b=add(A.map(row=>dot(row,rb)),b);A=A.map(row=>[dot(row,[R[0][0],R[1][0]]),dot(row,[R[0][1],R[1][1]])]);copies.push(edges.map(e=>apply(e.a)));
  }
  if(path.points.length>path.hits.length+1)points.push(apply(path.points.at(-1)));
  return {copies,points};
}
