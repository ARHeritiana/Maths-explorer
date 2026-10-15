// A net is a tree of face hinges. Each face moves rigidly, never by interpolating its vertices.
const sub=(a,b)=>a.map((x,i)=>x-b[i]),add=(a,b)=>a.map((x,i)=>x+b[i]),mul=(a,k)=>a.map(x=>x*k);
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=a=>mul(a,1/Math.hypot(...a));
export function rotateHinge(point,a,b,angle) {
  const u=unit(sub(b,a)),v=sub(point,a),c=Math.cos(angle),s=Math.sin(angle);
  return add(a,add(add(mul(v,c),mul(cross(u,v),s)),mul(u,dot(u,v)*(1-c))));
}
// Strict interior overlap via the separating-axis theorem; shared edges are allowed.
export function polygonOverlap(a,b) {
  for(const polygon of [a,b])for(let i=0;i<polygon.length;i++) {
    const p=polygon[i],q=polygon[(i+1)%polygon.length],axis=[p[1]-q[1],q[0]-p[0]];
    const A=a.map(v=>v[0]*axis[0]+v[1]*axis[1]),B=b.map(v=>v[0]*axis[0]+v[1]*axis[1]);
    if(Math.min(Math.max(...A),Math.max(...B))-Math.max(Math.min(...A),Math.min(...B))<1e-7)return false;
  }return true;
}
export function makeNet(solid) {
  const {faces,verts}=solid,base=faces[0],origin=verts[base.verts[0]],u=unit(sub(verts[base.verts[1]],origin)),v=cross(base.n,u);
  const basis=p=>{const d=sub(p,origin);return [dot(d,u),dot(d,v),dot(d,base.n)];};
  const links=faces.map((face,i)=>faces.flatMap((other,j)=>{
    if(j===i)return [];const common=face.verts.filter(x=>other.verts.includes(x));if(common.length!==2)return [];
    const [a,b]=common.map(x=>verts[x]),axis=unit(sub(b,a));
    const angle=Math.atan2(dot(axis,cross(other.n,face.n)),dot(other.n,face.n));return [{child:j,parent:i,a,b,angle}];
  }));
  const placed=new Map([[0,{parent:null,path:[],flat:base.verts.map(i=>basis(verts[i]))}]]);let attempts=0;
  const apply=(point,path,t)=>{let p=[...point];for(let i=path.length-1;i>=0;i--)p=rotateHinge(p,path[i].a,path[i].b,path[i].angle*(1-t));return basis(p);};
  function search() {
    if(placed.size===faces.length)return true;if(++attempts>15000)return false;
    const candidates=[];
    for(const [parent,node]of placed)for(const hinge of links[parent])if(!placed.has(hinge.child)){
      const path=[...node.path,hinge],flat=faces[hinge.child].verts.map(i=>apply(verts[i],path,0));
      if([...placed.values()].some(f=>polygonOverlap(flat,f.flat)))continue;
      const c=flat.reduce((a,p)=>add(a,mul(p,1/flat.length)),[0,0,0]);candidates.push({hinge,path,flat,score:Math.hypot(c[0],c[1])});
    }
    candidates.sort((a,b)=>a.score-b.score||a.hinge.child-b.hinge.child);
    for(const c of candidates){placed.set(c.hinge.child,{parent:c.hinge.parent,path:c.path,flat:c.flat});if(search())return true;placed.delete(c.hinge.child);}return false;
  }
  if(!search())throw new Error(`No non-overlapping net found: ${solid.name}`);
  const nodes=faces.map((f,i)=>placed.get(i));
  const sample=t=>faces.map((f,i)=>f.verts.map(vertex=>apply(verts[vertex],nodes[i].path,t)));
  // A fixed scale fits every intermediate fold. Only the object's centre is translated during folding.
  const radius=Math.max(...Array.from({length:21},(_,k)=>sample(k/20)).map(polys=>{
    const ps=polys.flat(),c=ps.reduce((a,p)=>add(a,mul(p,1/ps.length)),[0,0,0]);return Math.max(...ps.map(p=>Math.hypot(...sub(p,c))));
  }));
  return {solid,nodes,radius,faces(t){const polys=sample(Math.max(0,Math.min(1,t))),ps=polys.flat(),c=ps.reduce((a,p)=>add(a,mul(p,1/ps.length)),[0,0,0]);return polys.map(poly=>poly.map(p=>sub(p,c)));}};
}
