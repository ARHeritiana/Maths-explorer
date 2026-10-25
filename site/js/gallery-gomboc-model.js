// Full-vertex convex support, inertia and rigid-body plane contacts. Geometry is loaded separately on demand.
export const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
export const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const add=(a,b)=>a.map((x,i)=>x+b[i]);
export const scale=(a,s)=>a.map(x=>x*s);
export const norm=a=>Math.hypot(...a);
const unit=a=>scale(a,1/(norm(a)||1));
export function qmul(a,b){return [a[0]*b[0]-dot(a.slice(1),b.slice(1)),...add(add(scale(b.slice(1),a[0]),scale(a.slice(1),b[0])),cross(a.slice(1),b.slice(1)))];}
export function qaxis(axis,theta){const a=unit(axis),s=Math.sin(theta/2);return [Math.cos(theta/2),...scale(a,s)];}
export function qbetween(a,b){a=unit(a);b=unit(b);const d=dot(a,b);if(d<-.999999999){const ax=cross(a,Math.abs(a[0])<.8?[1,0,0]:[0,1,0]);return qaxis(ax,Math.PI);}const q=[1+d,...cross(a,b)],n=Math.hypot(...q);return q.map(x=>x/n);}
export function rotation(q){const [w,x,y,z]=q;return [1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w),2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w),2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)];}
export const matvec=(m,v)=>[m[0]*v[0]+m[1]*v[1]+m[2]*v[2],m[3]*v[0]+m[4]*v[1]+m[5]*v[2],m[6]*v[0]+m[7]*v[1]+m[8]*v[2]];
export const transpose=m=>[m[0],m[3],m[6],m[1],m[4],m[7],m[2],m[5],m[8]];
export function inverse(m){const [a,b,c,d,e,f,g,h,i]=m,A=e*i-f*h,B=c*h-b*i,C=b*f-c*e,D=f*g-d*i,E=a*i-c*g,F=c*d-a*f,G=d*h-e*g,H=b*g-a*h,I=a*e-b*d,det=a*A+b*D+c*G;if(!(Math.abs(det)>1e-16))throw new RangeError('singular inertia');return [A,B,C,D,E,F,G,H,I].map(x=>x/det);}
export function decodeGeometry(buffer,meta){
  const v=new DataView(buffer),magic=new TextDecoder().decode(new Uint8Array(buffer,0,8));if(magic!=='MXGOM01\0')throw new Error('Unrecognised body data');
  const n=v.getUint32(8,true),r=v.getUint32(12,true),t=v.getUint32(16,true),bytes=24+n*36+r*4+t*12;
  if(n!==meta.vertices||r!==meta.drawingVertices||t!==meta.drawingTriangles||buffer.byteLength!==bytes)throw new Error('Incomplete body data');
  let o=24;const vertices=new Float64Array(buffer,o,n*3);o+=n*24;const neighbours=new Uint32Array(buffer,o,n*3);o+=n*12;const drawingIds=new Uint32Array(buffer,o,r);o+=r*4;const triangles=new Uint32Array(buffer,o,t*3);
  if([...meta.inertia.flat(),...meta.stableNormal].some(x=>!Number.isFinite(x)))throw new Error('Invalid body metadata');
  return {vertices,neighbours,drawingIds,triangles,meta,inertia:meta.inertia.flat(),inverseInertia:inverse(meta.inertia.flat()),count:n};
}
export const vertex=(body,i)=>[body.vertices[3*i],body.vertices[3*i+1],body.vertices[3*i+2]];
export function support(body,direction,start=0){
  let i=Math.max(0,Math.min(body.count-1,start)),value=dot(vertex(body,i),direction),walk=0;
  while(walk++<body.count){let next=i,best=value;for(let k=0;k<3;k++){const j=body.neighbours[i*3+k],v=dot(vertex(body,j),direction);if(v>best+1e-15){best=v;next=j;}}if(next===i)return {index:i,value,walk};i=next;value=best;}
  throw new Error('Invalid convex adjacency');
}
function inertiaApply(body,R,vector,inverted=false){return matvec(R,matvec(inverted?body.inverseInertia:body.inertia,matvec(transpose(R),vector)));}
export function angularVelocity(body,s){return inertiaApply(body,rotation(s.q),s.L,true);}
export function energy(body,s,gravity=9.81){const w=angularVelocity(body,s);return dot(s.v,s.v)/2+dot(w,s.L)/2+gravity*s.p[2];}
export function state(body,preset='tip'){
  let q=qbetween(body.meta.stableNormal,[0,0,-1]);
  if(preset==='tip')q=qmul(qaxis([1,0,0],1.25),q);
  if(preset==='unstable')q=qbetween(vertex(body,body.meta.unstableVertex),[0,0,-1]);
  const s={p:[0,0,2],v:[0,0,0],L:[0,0,0],q,time:0,support:body.meta.stableVertex,impulses:0,penetration:0};
  const R=rotation(q),hit=support(body,matvec(transpose(R),[0,0,-1]),s.support);s.support=hit.index;s.p[2]=hit.value+(preset==='throw'?.7:0);
  if(preset==='throw'){s.v=[1,0,2.5];s.L=[.8,.35,.1];}
  return s;
}
export function liftToPlane(body,s){const hit=support(body,matvec(transpose(rotation(s.q)),[0,0,-1]),s.support);s.support=hit.index;s.p[2]=Math.max(s.p[2],hit.value);return hit;}
function contactManifold(body,R,hit,tolerance=2e-7){
  const direction=matvec(transpose(R),[0,0,-1]),visited=new Set([hit.index]),todo=[hit.index],ids=[];
  while(todo.length&&visited.size<5000){const i=todo.pop();ids.push(i);for(let k=0;k<3;k++){const j=body.neighbours[3*i+k];if(!visited.has(j)&&dot(vertex(body,j),direction)>=hit.value-tolerance){visited.add(j);todo.push(j);}}}
  if(ids.length<=4)return ids.map(i=>matvec(R,vertex(body,i)));
  const points=ids.map(i=>matvec(R,vertex(body,i))),chosen=new Set();
  for(const axis of [[1,1,0],[1,-1,0],[-1,1,0],[-1,-1,0]]){let best=0;for(let i=1;i<points.length;i++)if(dot(points[i],axis)>dot(points[best],axis))best=i;chosen.add(best);}
  return [...chosen].map(i=>points[i]);
}
export function advance(body,input,dt,{gravity=9.81,friction=.35,restitution=.15,rolling=.1,iterations=8,ground=true}={}){
  if(!(dt>0&&dt<=.02&&Number.isFinite(dt)))throw new RangeError('Use a substep between zero and 0.02');
  const s={...input,p:[...input.p],v:[...input.v],L:[...input.L],q:[...input.q],time:input.time+dt,penetration:0};
  s.v[2]-=gravity*dt;
  // Contact is solved on velocities before the pose moves (speculative contact): a contact point may close its gap
  // within the step but not cross the floor. This removes the systematic positional push that used to add potential
  // energy every step; a small residue remains (see the end of this function).
  if(ground){
    const R=rotation(s.q),hit=support(body,matvec(transpose(R),[0,0,-1]),s.support);s.support=hit.index;
    const gap=Math.max(0,s.p[2]-hit.value),omega0=angularVelocity(body,s),fall=-Math.min(0,add(s.v,cross(omega0,matvec(R,vertex(body,hit.index))))[2]);
    if(gap<=fall*dt+2e-7){
      const contacts=contactManifold(body,R,hit),n=[0,0,1];
      const apply=(r,J)=>{s.v=add(s.v,J);s.L=add(s.L,cross(r,J));};
      const denominator=(r,d)=>1+dot(d,cross(inertiaApply(body,R,cross(r,d),true),r));
      let normal=0;
      for(let it=0;it<iterations;it++)for(const r of contacts){
        const w=inertiaApply(body,R,s.L,true),vn=add(s.v,cross(w,r))[2],free=-Math.max(0,s.p[2]+r[2])/dt;
        const target=it===0&&vn<-.3&&vn*dt<free*dt?Math.max(free,-restitution*vn):free;
        if(vn>=target)continue;
        const j=(target-vn)/denominator(r,n);apply(r,[0,0,j]);s.impulses++;normal+=j;
        const after=add(s.v,cross(inertiaApply(body,R,s.L,true),r)),tangent=[after[0],after[1],0],v=norm(tangent);
        if(v>1e-12){const t=scale(tangent,1/v),jt=Math.min(friction*j,v/denominator(r,t));apply(r,scale(t,-jt));}
      }
      // Viscous rolling resistance: a couple -c N ω during contact (N the normal force, c = rolling). Unlike a
      // threshold law it cannot hold the body still away from an equilibrium. It never reverses the rotation; the slip it
      // creates is removed by Coulomb friction at the next step.
      const w=angularVelocity(body,s),spin=norm(w);
      if(spin>1e-12&&normal>0){const u=scale(w,1/spin),cap=spin/dot(u,inertiaApply(body,R,u,true));s.L=add(s.L,scale(u,-Math.min(Math.max(0,rolling)*normal*spin,cap)));}
    }
  }
  s.p=add(s.p,scale(s.v,dt));
  const omega=angularVelocity(body,s),speed=norm(omega);
  if(speed){s.q=qmul(qaxis(omega,speed*dt),s.q);const n=Math.hypot(...s.q);s.q=s.q.map(x=>x/n);}
  if(!ground)return s;
  // Rotation, or the rolling couple, can bring a vertex slightly below the floor; that residue is lifted out and reported
  // in s.penetration. The lift adds a little potential energy (about 1e-3 at most over seconds at rest), not a drift.
  const after=support(body,matvec(transpose(rotation(s.q)),[0,0,-1]),s.support);s.support=after.index;
  s.penetration=Math.max(0,after.value-s.p[2]);s.p[2]+=s.penetration;
  return s;
}
export function simulate(body,s,seconds,options={},dt=1/240){let out=s;const count=Math.ceil(seconds/dt),h=seconds/count;for(let i=0;i<count;i++)out=advance(body,out,h,options);return out;}
export function convergence(body,s,seconds=.2,options={},dt=1/120){const a=simulate(body,s,seconds,options,dt),b=simulate(body,s,seconds,options,dt/2),q=Math.abs(a.q.reduce((sum,x,i)=>sum+x*b.q[i],0));return {coarse:a,fine:b,position:norm(add(a.p,scale(b.p,-1))),angle:2*Math.acos(Math.min(1,q)),energy:Math.abs(energy(body,a,options.gravity)-energy(body,b,options.gravity))};}
