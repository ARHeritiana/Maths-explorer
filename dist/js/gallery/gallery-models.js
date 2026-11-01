// Exact clipped Voronoi cells, frictionless descent timing, and area descent for a triangulated soap-film graph.
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function voronoiCells(seeds,bounds=[0,0,640,420]) {
  const [x,y,w,h]=bounds;
  return seeds.map((a,i)=>{
    let poly=[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
    for(let j=0;j<seeds.length&&poly.length;j++)if(i!==j){
      const b=seeds[j],nx=b[0]-a[0],ny=b[1]-a[1],c=(b[0]**2+b[1]**2-a[0]**2-a[1]**2)/2;
      if(Math.hypot(nx,ny)<1e-9){if(j<i)poly=[];continue;}
      const out=[];
      for(let k=0;k<poly.length;k++){
        const p=poly[k],q=poly[(k+1)%poly.length],u=p[0]*nx+p[1]*ny-c,v=q[0]*nx+q[1]*ny-c;
        if(u<=1e-8)out.push(p);
        if((u<0&&v>0)||(u>0&&v<0)){const t=u/(u-v);out.push([p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])]);}
      }poly=out;
    }return poly;
  });
}
export const polygonArea=p=>Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-a[1]*b[0];},0))/2;
export function polygonCentroid(p){
  let a=0,x=0,y=0;for(let i=0;i<p.length;i++){const u=p[i],v=p[(i+1)%p.length],d=u[0]*v[1]-v[0]*u[1];a+=d;x+=(u[0]+v[0])*d;y+=(u[1]+v[1])*d;}
  return Math.abs(a)<1e-9?(p[0]||[0,0]):[x/(3*a),y/(3*a)];
}
export function cycloid(end=[4,2],n=240){
  const [X,Y]=end;let lo=1e-7,hi=2*Math.PI-1e-7;
  for(let i=0;i<70;i++){const t=(lo+hi)/2;if((t-Math.sin(t))/(1-Math.cos(t))<X/Y)lo=t;else hi=t;}
  const theta=(lo+hi)/2,a=Y/(1-Math.cos(theta));
  return {theta,a,points:Array.from({length:n+1},(_,i)=>{const t=theta*i/n;return [a*(t-Math.sin(t)),a*(1-Math.cos(t))];}),time:theta*Math.sqrt(a/9.81)};
}
export function bezierTrack(handles,end=[4,2],n=240){return Array.from({length:n+1},(_,i)=>{const u=i/n,v=1-u;return [3*v*v*u*handles[0][0]+3*v*u*u*handles[1][0]+u**3*end[0],3*v*v*u*handles[0][1]+3*v*u*u*handles[1][1]+u**3*end[1]];});}
// Exact travel time on each straight segment from energy v²=2gy, including the integrable initial singularity.
export function descentTrack(points,g=9.81){
  let total=0,length=0;const times=[0];
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],s=Math.hypot(b[0]-a[0],b[1]-a[1]);length+=s;
    const sum=Math.sqrt(2*g*Math.max(0,a[1]))+Math.sqrt(2*g*Math.max(0,b[1]));
    total+=Math.min(a[1],b[1])<0||sum<1e-12?Infinity:2*s/sum;times.push(total);
  }return {points,times,total,length};
}
export function pointAtTime(track,time){
  const {points,times}=track;if(time<=0)return points[0];if(time>=track.total)return points.at(-1);
  let lo=0,hi=times.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(times[m]<time)lo=m;else hi=m;}
  const a=points[lo],b=points[hi],s=Math.hypot(b[0]-a[0],b[1]-a[1]),dt=time-times[lo];
  const v0=Math.sqrt(2*9.81*a[1]),acc=9.81*(b[1]-a[1])/s,u=clamp((v0*dt+acc*dt*dt/2)/s,0,1);
  return [a[0]+u*(b[0]-a[0]),a[1]+u*(b[1]-a[1])];
}
export function filmMesh(corners=[.8,-.8,.8,-.8],n=16,bulge=.8){
  const pts=[];
  for(let j=0;j<=n;j++)for(let i=0;i<=n;i++){
    const u=i/n,v=j/n,z=corners[0]*(1-u)*(1-v)+corners[1]*u*(1-v)+corners[2]*u*v+corners[3]*(1-u)*v;
    pts.push([2*u-1,2*v-1,z+bulge*Math.sin(Math.PI*u)*Math.sin(Math.PI*v)]);
  }
  const faces=[];for(let j=0;j<n;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i,b=a+1,c=a+n+1,d=c+1;faces.push([a,b,d],[a,d,c]);}
  return {pts,faces,n};
}
export function filmArea(mesh,gradient=false){
  const grad=new Float64Array(mesh.pts.length);let area=0;
  for(const f of mesh.faces){const [a,b,c]=f.map(i=>mesh.pts[i]),u=b.map((v,i)=>v-a[i]),v=c.map((x,i)=>x-a[i]);
    const N=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],norm=Math.hypot(...N);area+=norm/2;
    if(gradient&&norm>1e-12){const nx=N[0]/norm,ny=N[1]/norm;
      grad[f[0]]+=(nx*(c[1]-b[1])+ny*(b[0]-c[0]))/2;
      grad[f[1]]+=(nx*(a[1]-c[1])+ny*(c[0]-a[0]))/2;
      grad[f[2]]+=(nx*(b[1]-a[1])+ny*(a[0]-b[0]))/2;
    }
  }return gradient?{area,grad}:area;
}
export function relaxFilm(mesh){
  const {area,grad}=filmArea(mesh,true),n=mesh.n,old=mesh.pts.map(p=>p[2]);let step=.8,max=0;
  for(let j=1;j<n;j++)for(let i=1;i<n;i++)max=Math.max(max,Math.abs(grad[j*(n+1)+i]));
  for(let attempt=0;attempt<15;attempt++){
    for(let j=1;j<n;j++)for(let i=1;i<n;i++){const k=j*(n+1)+i;mesh.pts[k][2]=old[k]-step*grad[k];}
    const next=filmArea(mesh);if(next<=area)return {area:next,residual:max,drop:area-next};step/=2;
  }mesh.pts.forEach((p,i)=>p[2]=old[i]);return {area,residual:max,drop:0};
}
