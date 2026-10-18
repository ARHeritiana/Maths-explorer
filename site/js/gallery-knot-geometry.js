// Actual spatial curves, generic projections and Fox colour equations over F_3.
export const mod3=x=>((x%3)+3)%3;
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
export function normaliseKnot(entry){
  const mean=[0,1,2].map(d=>entry.points.reduce((s,p)=>s+p[d],0)/entry.points.length);
  const matrix=entry.preferredViewMatrix||[[1,0,0],[0,1,0],[0,0,1]];
  const pts=entry.points.map(p=>matrix.map(row=>dot(row,p.map((v,d)=>v-mean[d]))));
  const radius=Math.max(...pts.map(p=>Math.hypot(...p)));
  return pts.map(p=>p.map(x=>2*x/radius));
}
export function knotDeformation(base,example,phase){
  const a=1-Math.max(0,Math.min(1,phase));
  if(example==='unknot')return Array.from({length:192},(_,i)=>{const t=2*Math.PI*i/192;return [1.25*(Math.cos(t)+a*Math.cos(3*t)),1.5*Math.sin(t),.75*Math.cos(t)];});
  // Triangular shears have explicit inverses, so every intermediate curve stays embedded.
  if(example==='shear')return base.map(([x,y,z])=>[x+.65*a*y*z,y,z]);
  if(example==='turn')return base.map(([x,y,z])=>{const c=Math.cos(a*1.1),s=Math.sin(a*1.1);return [c*x+s*z,y,-s*x+c*z];});
  return base;
}
export function cameraKnot(points,yaw,tilt,mirror=false){
  const cy=Math.cos(yaw),sy=Math.sin(yaw),ct=Math.cos(tilt),st=Math.sin(tilt);
  return points.map(([x,y,z])=>{if(mirror)z=-z;const a=x*cy-y*sy,b=x*sy+y*cy;return [a,b*ct-z*st,b*st+z*ct];});
}
export function knotProjection(points){
  const n=points.length,crossings=[];let generic=true;
  for(let i=0;i<n;i++)for(let j=i+2;j<n;j++){
    if(i===0&&j===n-1)continue;
    const a=points[i],b=points[(i+1)%n],c=points[j],d=points[(j+1)%n];
    const u=[b[0]-a[0],b[1]-a[1]],v=[d[0]-c[0],d[1]-c[1]],den=u[0]*v[1]-u[1]*v[0];
    if(Math.abs(den)<1e-12)continue;
    const q=[c[0]-a[0],c[1]-a[1]],s=(q[0]*v[1]-q[1]*v[0])/den,t=(q[0]*u[1]-q[1]*u[0])/den;
    if(s<=0||s>=1||t<=0||t>=1)continue;
    const zi=a[2]+s*(b[2]-a[2]),zj=c[2]+t*(d[2]-c[2]);
    if(Math.min(s,1-s,t,1-t)<1e-6||Math.abs(zi-zj)<1e-7)generic=false;
    crossings.push({over:zi>zj?i+s:j+t,under:zi>zj?j+t:i+s,p:[a[0]+s*u[0],a[1]+s*u[1]],depth:Math.max(zi,zj)});
  }
  const cuts=crossings.map(c=>c.under).sort((a,b)=>a-b),m=Math.max(1,cuts.length);
  const arcAt=t=>{let a=0,b=cuts.length;while(a<b){const c=(a+b)>>1;if(cuts[c]<=t)a=c+1;else b=c;}return a%m;};
  const equations=crossings.map(c=>{const row=Array(m).fill(0);row[arcAt(c.over)]+=2;row[arcAt(c.under-1e-8)]--;row[arcAt(c.under+1e-8)]--;return row.map(mod3);});
  const solution=foxNullspace(equations,m);
  return {crossings,cuts,arcAt,equations,generic,...solution};
}
export function foxNullspace(equations,n){
  const rows=equations.map(r=>r.map(mod3)),pivots=[];let rank=0;
  for(let c=0;c<n&&rank<rows.length;c++){
    const p=rows.findIndex((r,i)=>i>=rank&&r[c]);if(p<0)continue;
    [rows[p],rows[rank]]=[rows[rank],rows[p]];
    if(rows[rank][c]===2)rows[rank]=rows[rank].map(x=>mod3(2*x));
    for(let i=0;i<rows.length;i++)if(i!==rank&&rows[i][c]){const f=rows[i][c];rows[i]=rows[i].map((x,j)=>mod3(x-f*rows[rank][j]));}
    pivots.push(c);rank++;
  }
  const free=Array.from({length:n},(_,i)=>i).filter(i=>!pivots.includes(i));
  const basis=free.map(f=>{const v=Array(n).fill(0);v[f]=1;pivots.forEach((c,i)=>v[c]=mod3(-rows[i][f]));return v;});
  const witness=basis.find(v=>v.some(x=>x!==v[0]))||Array(n).fill(0);
  return {count:3**free.length,witness,arcCount:n};
}
export function colouringErrors(projection,colors){return projection.equations.reduce((s,r)=>s+(mod3(dot(r,colors))!==0?1:0),0);}
