// Fixed-topology numerical area descent. No rupture, reconnection or guarantee
// of global least area. Free vertices move in full xyz along surface normals.
const tau=2*Math.PI;
const add=(a,b)=>a.map((x,i)=>x+b[i]);
const sub=(a,b)=>a.map((x,i)=>x-b[i]);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>Math.hypot(...a);
export function meshArea3D(mesh,gradient=false){
  let area=0;const grad=mesh.pts.map(()=>[0,0,0]),mass=new Float64Array(mesh.pts.length);
  for(const f of mesh.faces){const [a,b,c]=f.map(i=>mesh.pts[i]),N=cross(sub(b,a),sub(c,a)),m=norm(N);area+=m/2;if(!gradient||m<1e-14)continue;
    const nh=N.map(x=>x/m),gs=[cross(sub(b,c),nh),cross(sub(c,a),nh),cross(sub(a,b),nh)];
    f.forEach((id,k)=>{mass[id]+=m/6;for(let d=0;d<3;d++)grad[id][d]+=gs[k][d]/2;});
  }return gradient?{area,grad,mass}:area;
}
export function relaxMesh3D(mesh){
  const {area,grad,mass}=meshArea3D(mesh,true),old=mesh.pts.map(p=>p.slice());let residual=0,maxSpeed=0;
  const vertexNormals=mesh.pts.map(()=>[0,0,0]);
  for(const [a,b,c] of mesh.faces){const N=cross(sub(old[b],old[a]),sub(old[c],old[a]));for(const i of [a,b,c])vertexNormals[i]=add(vertexNormals[i],N);}
  const delta=grad.map((g,i)=>{if(mesh.fixed[i])return [0,0,0];const nh=vertexNormals[i].map(x=>x/(norm(vertexNormals[i])||1)),normalGradient=g.reduce((s,x,d)=>s+x*nh[d],0);residual=Math.max(residual,Math.abs(normalGradient));const d=nh.map(x=>x*normalGradient/Math.max(mass[i],1e-6));maxSpeed=Math.max(maxSpeed,norm(d));return d;});
  let step=Math.min(.03,.045/Math.max(maxSpeed,1e-9));const normals=mesh.faces.map(([a,b,c])=>cross(sub(old[b],old[a]),sub(old[c],old[a])));
  for(let trial=0;trial<18;trial++,step/=2){mesh.pts=old.map((p,i)=>p.map((x,d)=>x-step*delta[i][d]));const healthy=mesh.faces.every(([a,b,c],i)=>{const N=cross(sub(mesh.pts[b],mesh.pts[a]),sub(mesh.pts[c],mesh.pts[a]));return norm(N)>norm(normals[i])*1e-5&&N.reduce((s,x,d)=>s+x*normals[i][d],0)>0;});const next=healthy?meshArea3D(mesh):Infinity;if(next<=area+1e-12)return {area:next,residual,drop:area-next};}
  mesh.pts=old;return {area,residual,drop:0};
}
function squareMesh(map,n=16){
  const pts=[],fixed=[],faces=[],wire=[];
  for(let j=0;j<=n;j++)for(let i=0;i<=n;i++){pts.push(map(2*i/n-1,2*j/n-1));fixed.push(i===0||i===n||j===0||j===n);}
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i,b=a+1,c=a+n+1,d=c+1;faces.push([a,b,d],[a,d,c]);}
  for(let i=0;i<n;i++)wire.push(i);for(let j=0;j<n;j++)wire.push(j*(n+1)+n);for(let i=n;i>0;i--)wire.push(n*(n+1)+i);for(let j=n;j>0;j--)wire.push(j*(n+1));
  return {pts,fixed,faces,wires:[wire],topology:'disk'};
}
function diskMesh(map,rings=8,sectors=48){
  const pts=[map(0,0)],fixed=[false],faces=[],wire=[];
  for(let j=1;j<=rings;j++)for(let i=0;i<sectors;i++){pts.push(map(j/rings,tau*i/sectors));fixed.push(j===rings);}
  const id=(j,i)=>1+(j-1)*sectors+(i+sectors)%sectors;
  for(let i=0;i<sectors;i++)faces.push([0,id(1,i),id(1,i+1)]);
  for(let j=1;j<rings;j++)for(let i=0;i<sectors;i++){const a=id(j,i),b=id(j,i+1),c=id(j+1,i),d=id(j+1,i+1);faces.push([a,c,d],[a,d,b]);}
  for(let i=0;i<sectors;i++)wire.push(id(rings,i));return {pts,fixed,faces,wires:[wire],topology:'disk'};
}
function annulusMesh(map,rows=12,sectors=48){
  const pts=[],fixed=[],faces=[],wires=[[],[]];
  for(let j=0;j<=rows;j++)for(let i=0;i<sectors;i++){pts.push(map(2*j/rows-1,tau*i/sectors));fixed.push(j===0||j===rows);if(j===0)wires[0].push(i);if(j===rows)wires[1].push(j*sectors+i);}
  const id=(j,i)=>j*sectors+(i+sectors)%sectors;
  for(let j=0;j<rows;j++)for(let i=0;i<sectors;i++){const a=id(j,i),b=id(j,i+1),c=id(j+1,i),d=id(j+1,i+1);faces.push([a,b,d],[a,d,c]);}
  return {pts,fixed,faces,wires,topology:'annulus'};
}
const polar=(r,t,z=0)=>[r*Math.cos(t),r*Math.sin(t),z];
export const SOAP_FRAMES=[
  {id:'circle',name:['Cercle plan','Planar circle'],family:'disk',build:()=>diskMesh((r,t)=>polar(r,t)),idea:['Un cercle plan donne un disque plat.','A planar circular wire supports a flat disk.']},
  {id:'ellipse',name:['Ellipse inclinée','Tilted ellipse'],family:'disk',build:()=>diskMesh((r,t)=>[1.3*r*Math.cos(t),.8*r*Math.sin(t),.4*r*Math.cos(t)])},
  {id:'skew-square',name:['Carré gauche','Skew square'],family:'disk',build:()=>squareMesh((u,v)=>[u,v,.5*u*v])},
  {id:'skew-trapezium',name:['Trapèze gauche','Skew trapezoid'],family:'disk',build:()=>squareMesh((u,v)=>[u*(1+.25*v),v,.55*u*v+.15*u])},
  {id:'wave-2',name:['Anneau ondulé, 2 vagues','Wavy ring, 2 waves'],family:'disk',build:()=>diskMesh((r,t)=>polar(r,t,.48*r*r*Math.cos(2*t)))},
  {id:'wave-3',name:['Anneau ondulé, 3 vagues','Wavy ring, 3 waves'],family:'disk',build:()=>diskMesh((r,t)=>polar(r,t,.42*r**3*Math.sin(3*t)))},
  {id:'wave-5',name:['Anneau ondulé, 5 vagues','Wavy ring, 5 waves'],family:'disk',build:()=>diskMesh((r,t)=>polar(r,t,.25*r**5*Math.sin(5*t)))},
  {id:'flower',name:['Cadre trilobé','Three-lobed wire'],family:'disk',build:()=>diskMesh((r,t)=>polar(r*(1+.19*Math.cos(3*t)),t,.35*r*r*Math.sin(2*t)))},
  {id:'enneper',name:["Bord d'Enneper",'Enneper boundary'],family:'disk',analytic:'Enneper patch, not a guarantee of stable least area',build:()=>diskMesh((r,t)=>{const u=.85*r*Math.cos(t),v=.85*r*Math.sin(t);return [u-u**3/3+u*v*v,-v+v**3/3-v*u*u,u*u-v*v];})},
  {id:'helicoid',name:['Double hélice et traverses','Double helix and crossbars'],family:'disk',analytic:'Helicoid patch',build:()=>squareMesh((u,v)=>[u*Math.cos(1.15*v),u*Math.sin(1.15*v),.58*v])},
  {id:'catenoid',name:['Deux anneaux circulaires','Two circular rings'],family:'annulus',analytic:'Stable catenoid branch',build:()=>annulusMesh((u,t)=>polar(.8*Math.cosh(.65*u),t,.52*u))},
  {id:'elliptic-bridge',name:['Deux anneaux elliptiques','Two elliptical rings'],family:'annulus',build:()=>annulusMesh((u,t)=>[1.25*.8*Math.cosh(.65*u)*Math.cos(t),.8*Math.cosh(.65*u)*Math.sin(t),.52*u])},
  {id:'square-bridge',name:['Deux cadres carrés','Two square frames'],family:'annulus',build:()=>annulusMesh((u,t)=>{const q=1/Math.max(Math.abs(Math.cos(t)),Math.abs(Math.sin(t))),r=.84+.18*u*u;return [r*q*Math.cos(t),r*q*Math.sin(t),.48*u];})},
];
export function perturbFilm(mesh,amount=.19){
  const normals=mesh.pts.map(()=>[0,0,0]);for(const [a,b,c] of mesh.faces){const N=cross(sub(mesh.pts[b],mesh.pts[a]),sub(mesh.pts[c],mesh.pts[a]));for(const i of [a,b,c])normals[i]=add(normals[i],N);}
  mesh.pts=mesh.pts.map((p,i)=>{if(mesh.fixed[i])return p;const N=normals[i],m=norm(N)||1,w=amount*Math.exp(-.65*(p[0]*p[0]+p[1]*p[1]))*(.7+.3*Math.cos(2*p[0]));return p.map((x,d)=>x+w*N[d]/m);});return mesh;
}
export function makeSoapFrame(id='skew-square',perturbation=.19){const frame=SOAP_FRAMES.find(f=>f.id===id)||SOAP_FRAMES[2],mesh=frame.build();mesh.frameId=frame.id;mesh.initialPts=mesh.pts.map(p=>p.slice());if(perturbation)perturbFilm(mesh,perturbation);return mesh;}

// Optional analytic Plateau T junction, separate from disk/annulus catalogue.
// Six sheets span tetrahedron edges, three at 120 degrees along each triple line.

export function tetraFilm(perturb=.18){
  const s=.7,pts=[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(p=>p.map(x=>s*x));pts.push([perturb,.7*perturb,-.6*perturb]);const faces=[],wires=[];
  for(let a=0;a<4;a++)for(let b=a+1;b<4;b++){faces.push([4,a,b]);wires.push([a,b]);}
  return {pts,faces,wires,fixed:[true,true,true,true,false],topology:'Plateau T network',analytic:true};
}
export function relaxTetraNetwork(mesh){
  const {area,grad}=meshArea3D(mesh,true),old=mesh.pts[4].slice();let step=.1;
  for(let trial=0;trial<18;trial++,step/=2){mesh.pts[4]=old.map((x,d)=>x-step*grad[4][d]);const next=meshArea3D(mesh);if(next<=area)return {area:next,residual:Math.hypot(...grad[4]),drop:area-next};}
  mesh.pts[4]=old;return {area,residual:Math.hypot(...grad[4]),drop:0};
}
