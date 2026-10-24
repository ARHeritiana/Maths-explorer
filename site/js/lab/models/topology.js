// Topology models: tangent fields, smooth surface maps and quotient-cell invariants.
export const TAU=2*Math.PI;
export const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
export const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const norm=a=>Math.hypot(...a);
export function unit(a){const n=norm(a);if(!(n>1e-12))throw new RangeError('A direction must be nonzero');return a.map(x=>x/n);}
export function spherePoint(longitude,latitude){return [Math.cos(latitude)*Math.cos(longitude),Math.cos(latitude)*Math.sin(longitude),Math.sin(latitude)];}
export function tangentField(point,axis=[0,0,1],kind='projected'){
 const a=unit(axis),p=unit(point);
 if(kind==='rotation')return cross(a,p);
 const d=dot(a,p);return a.map((x,i)=>x-d*p[i]);
}
export function circleField(point){return [-point[1],point[0],0];}
export function hairyModel(s){
 const axis=unit([s.ax??0,s.ay??0,s.az??1]),p=spherePoint(s.longitude??.6,s.latitude??.3);
 const vector=s.field==='circle'?circleField([Math.cos(s.longitude??.6),Math.sin(s.longitude??.6),0]):tangentField(p,axis,s.field);
 return {axis,p,vector,tangency:dot(s.field==='circle'?[Math.cos(s.longitude??.6),Math.sin(s.longitude??.6),0]:p,vector),length:norm(vector),zeros:s.field==='circle'?[]:[axis,axis.map(x=>-x)],boundary:0};
}
export function surfacePoint(kind,u,v){
 if(kind==='mobius'){const radius=2+v*Math.cos(u/2);return [radius*Math.cos(u),radius*Math.sin(u),v*Math.sin(u/2)];}
 if(kind==='klein'){
  const radius=2.4+Math.cos(u/2)*Math.sin(v)-Math.sin(u/2)*Math.sin(2*v);
  return [radius*Math.cos(u),radius*Math.sin(u),Math.sin(u/2)*Math.sin(v)+Math.cos(u/2)*Math.sin(2*v)];
 }
 throw new RangeError('Unknown surface');
}
export function surfaceFrame(kind,u,v){
 const h=1e-5,p=surfacePoint(kind,u,v),diff=(a,b)=>a.map((x,i)=>(x-b[i])/(2*h));
 const du=diff(surfacePoint(kind,u+h,v),surfacePoint(kind,u-h,v)),dv=diff(surfacePoint(kind,u,v+h),surfacePoint(kind,u,v-h));
 return {p,du,dv,normal:unit(cross(du,dv))};
}

// The surface is a rectangle with reversed u-edge gluing. Klein also glues the v-edges.
// Cutting duplicates the corresponding vertices before gluing; drawing intersections never identify points.
export function surfaceComplex(kind='mobius',cut='none',n=24,m=12){
 if(!['mobius','klein'].includes(kind)||!Number.isInteger(n)||n<4||!Number.isInteger(m)||m<6||m%6)throw new RangeError('Invalid surface grid');
 if(!['none',...(kind==='mobius'?['centre','thirds']:['meridian'])].includes(cut))throw new RangeError('Invalid cut');
 const parent=[],raw=[],ids=new Map(),quads=[];
 const region=j=>cut==='centre'?(j<m/2?0:1):cut==='thirds'?(j<m/3?0:j<2*m/3?1:2):0;
 const mirrored=r=>cut==='centre'?1-r:cut==='thirds'?2-r:r;
 const key=(i,j,r)=>`${i},${j},${r}`;
 const id=(i,j,r)=>{const k=key(i,j,r);if(!ids.has(k)){ids.set(k,parent.length);parent.push(parent.length);raw.push([i,j,r]);}return ids.get(k);};
 const find=x=>parent[x]===x?x:(parent[x]=find(parent[x]));
 const join=(a,b)=>{if(b!==undefined)parent[find(a)]=find(b);};
 for(let i=0;i<n;i++)for(let j=0;j<m;j++){const r=region(j);quads.push([id(i,j,r),id(i+1,j,r),id(i+1,j+1,r),id(i,j+1,r)]);}
 raw.forEach(([i,j,r],a)=>{
  if(i===n&&cut!=='meridian')join(a,ids.get(key(0,m-j,mirrored(r))));
  if(kind==='klein'&&j===m)join(a,ids.get(key(i,0,r)));
 });
 const compact=new Map(),vertex=a=>{const r=find(a);if(!compact.has(r))compact.set(r,compact.size);return compact.get(r);};
 const faces=quads.flatMap(q=>[[q[0],q[1],q[2]],[q[0],q[2],q[3]]].map(f=>f.map(vertex))),edges=new Map();
 faces.forEach((f,index)=>f.forEach((a,k)=>{const b=f[(k+1)%3],key=a<b?`${a},${b}`:`${b},${a}`,sign=a<b?1:-1;const e=edges.get(key)||{a:Math.min(a,b),b:Math.max(a,b),faces:[]};e.faces.push({index,sign});edges.set(key,e);}));
 const adjacency=faces.map(()=>[]),boundary=[];
 for(const e of edges.values()){
  if(e.faces.length===1)boundary.push(e);
  else if(e.faces.length===2){const [a,b]=e.faces;adjacency[a.index].push([b.index,-a.sign*b.sign]);adjacency[b.index].push([a.index,-a.sign*b.sign]);}
  else throw new Error('Not a triangulated surface');
 }
 const orientation=Array(faces.length).fill(0),faceComponent=Array(faces.length).fill(-1),components=[];
 for(let f=0;f<faces.length;f++)if(!orientation[f]){
  const comp={orientable:true,faces:[],boundary:0},ci=components.length,queue=[f];orientation[f]=1;components.push(comp);
  for(let at=0;at<queue.length;at++){const current=queue[at];faceComponent[current]=ci;comp.faces.push(current);for(const [next,sign]of adjacency[current]){const expected=orientation[current]*sign;if(!orientation[next]){orientation[next]=expected;queue.push(next);}else if(orientation[next]!==expected)comp.orientable=false;}}
 }
 const boundaryAt=new Map();boundary.forEach((e,i)=>{for(const p of [e.a,e.b]){const a=boundaryAt.get(p)||[];a.push(i);boundaryAt.set(p,a);}});
 const visited=new Set();let boundaryComponents=0;
 boundary.forEach((e,index)=>{if(visited.has(index))return;boundaryComponents++;components[faceComponent[e.faces[0].index]].boundary++;const stack=[index];while(stack.length){const a=stack.pop();if(visited.has(a))continue;visited.add(a);for(const p of [boundary[a].a,boundary[a].b])for(const b of boundaryAt.get(p))if(!visited.has(b))stack.push(b);}});
 return {vertices:compact.size,edges:edges.size,faces:faces.length,euler:compact.size-edges.size+faces.length,boundaryComponents,components:components.map(c=>({orientable:c.orientable,boundary:c.boundary})),manifoldBoundary:[...boundaryAt.values()].every(a=>a.length===2)};
}
const topologyCache=new Map();
export function surfaceTopology(kind,cut){const key=kind+'/'+cut;if(!topologyCache.has(key))topologyCache.set(key,surfaceComplex(kind,cut));return topologyCache.get(key);}
export function surfacesModel(s){const topology=surfaceTopology(s.surface,s.cut);return {...topology,componentCount:topology.components.length,orientable:topology.components.every(c=>c.orientable),frame:surfaceFrame(s.surface,s.u,s.surface==='mobius'?0:0)};}

// A finite word illustration of cancellation. It is deliberately not a Banach-Tarski decomposition.
const inverse={a:'A',A:'a',b:'B',B:'b'};
export function reduceWord(word){const out=[];for(const c of word){if(!inverse[c])throw new RangeError('Unknown letter');if(out.at(-1)===inverse[c])out.pop();else out.push(c);}return out.join('');}
export function reducedWords(depth){if(!Number.isInteger(depth)||depth<0||depth>6)throw new RangeError('Depth');const words=[''];let layer=[''];for(let k=0;k<depth;k++){const next=[];for(const w of layer)for(const c of ['a','A','b','B'])if(!w||inverse[c]!==w.at(-1))next.push(w+c);words.push(...next);layer=next;}return words;}
