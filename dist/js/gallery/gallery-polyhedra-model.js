// Polyhedra by transformation (issue #35): cut the corners of a Platonic solid deeper and deeper. Pure: the solid is the
// intersection of the half-spaces of its own faces and of planes perpendicular to its vertex directions at distance h;
// as h goes from the circumradius down, the shape runs through the truncated solid, the rectified solid and the truncated
// dual, and ends on the dual (the cutting planes are the faces of the dual). Tested in tests/gallery-polyhedra.test.mjs.
import {platonic} from '../lab-objects.js';

const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],len=a=>Math.hypot(...a);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=a=>{const l=len(a);return a.map(x=>x/l);};

// The family of a Platonic solid: its face planes {n, d} (unit normal, distance), its vertex directions, and the special
// values of h. The solid has circumradius 1 (lab-objects.js platonic).
export const FAMILIES={
  tetrahedron:{dual:'tetrahedron',names:[['Tétraèdre','Tetrahedron'],['Tétraèdre tronqué','Truncated tetrahedron'],['Octaèdre','Octahedron'],['Tétraèdre tronqué','Truncated tetrahedron'],['Tétraèdre','Tetrahedron']]},
  cube:{dual:'octahedron',names:[['Cube','Cube'],['Cube tronqué','Truncated cube'],['Cuboctaèdre','Cuboctahedron'],['Octaèdre tronqué','Truncated octahedron'],['Octaèdre','Octahedron']]},
  octahedron:{dual:'cube',names:[['Octaèdre','Octahedron'],['Octaèdre tronqué','Truncated octahedron'],['Cuboctaèdre','Cuboctahedron'],['Cube tronqué','Truncated cube'],['Cube','Cube']]},
  dodecahedron:{dual:'icosahedron',names:[['Dodécaèdre','Dodecahedron'],['Dodécaèdre tronqué','Truncated dodecahedron'],['Icosidodécaèdre','Icosidodecahedron'],['Icosaèdre tronqué','Truncated icosahedron'],['Icosaèdre','Icosahedron']]},
  icosahedron:{dual:'dodecahedron',names:[['Icosaèdre','Icosahedron'],['Icosaèdre tronqué','Truncated icosahedron'],['Icosidodécaèdre','Icosidodecahedron'],['Dodécaèdre tronqué','Truncated dodecahedron'],['Dodécaèdre','Dodecahedron']]},
};
export const SOLID_IDS=Object.keys(FAMILIES);

const cache={};
export function family(id){
  if(cache[id])return cache[id];
  const S=platonic(id),faces=S.faces.map(f=>({n:unit(f.n),d:dot(unit(f.n),S.verts[f.verts[0]])})),dirs=S.verts.map(unit);
  const R=len(S.verts[0]),[a,b]=S.edges[0],mid=S.verts[a].map((x,i)=>(x+S.verts[b][i])/2);
  // h at which the cuts pass through the edge midpoints (rectified), and h at which the face planes stop mattering (dual)
  const hMid=dot(mid,dirs[a]);
  const f0=faces.find(f=>Math.abs(dot(f.n,S.verts[a])-f.d)<1e-9),hDual=f0.d*dot(f0.n,dirs[a]);
  const out={S,faces,dirs,R,hMid,hDual};
  out.hTrunc=solveRegular(out,hMid,R);out.hTruncDual=solveRegular(out,hDual,hMid);
  return cache[id]=out;
}
// Between lo and hi, the h at which every edge has the same length (the Archimedean truncation), by bisection. Two kinds
// of edges: those between a face and a cut (mixed), and those between two faces of the same kind; their lengths cross.
function solveRegular(F,lo,hi){
  const gap=h=>{const P=cut(F,h),m=[],o=[];
    for(const [i,j] of P.edges){const k=P.faces.filter(f=>f.verts.includes(i)&&f.verts.includes(j)).map(f=>f.kind),l=len(sub(P.verts[i],P.verts[j]));(k[0]!==k[1]?m:o).push(l);}
    return (m.length?Math.max(...m):0)-(o.length?Math.max(...o):0);};
  let a=lo+1e-7,b=hi-1e-7,ga=gap(a);
  for(let k=0;k<70;k++){const c=(a+b)/2,gc=gap(c);if(Math.sign(gc)===Math.sign(ga)){a=c;ga=gc;}else b=c;}
  return (a+b)/2;
}

// The polyhedron for depth h: vertices, faces (vertex indices in order, kind 'face' or 'cut', its plane), edges.
export function cut(F,h){
  const planes=[...F.faces.map(f=>({n:f.n,d:f.d,kind:'face'})),...F.dirs.map(v=>({n:v,d:h,kind:'cut'}))];
  const eps=1e-9,inside=p=>planes.every(q=>dot(q.n,p)<=q.d+1e-7);
  const verts=[],key=new Map();
  const add=p=>{const k=p.map(x=>Math.round(x*1e7)).join(',');if(!key.has(k)){key.set(k,verts.length);verts.push(p);}return key.get(k);};
  for(let i=0;i<planes.length;i++)for(let j=i+1;j<planes.length;j++)for(let k=j+1;k<planes.length;k++){
    const A=planes[i],B=planes[j],C=planes[k],det=dot(A.n,cross(B.n,C.n));if(Math.abs(det)<eps)continue;
    const p=[0,1,2].map(c=>(A.d*cross(B.n,C.n)[c]+B.d*cross(C.n,A.n)[c]+C.d*cross(A.n,B.n)[c])/det);
    if(inside(p))add(p);
  }
  const faces=[];
  for(const q of planes){
    const on=verts.map((p,i)=>[p,i]).filter(([p])=>Math.abs(dot(q.n,p)-q.d)<1e-7).map(([,i])=>i);
    if(on.length<3)continue;
    const c=on.reduce((s,i)=>s.map((x,k)=>x+verts[i][k]/on.length),[0,0,0]),u=unit(sub(verts[on[0]],c)),w=cross(q.n,u);
    on.sort((i,j)=>Math.atan2(dot(sub(verts[i],c),w),dot(sub(verts[i],c),u))-Math.atan2(dot(sub(verts[j],c),w),dot(sub(verts[j],c),u)));
    faces.push({verts:on,n:q.n,kind:q.kind});
  }
  const E=new Set();for(const f of faces)f.verts.forEach((a,i)=>{const b=f.verts[(i+1)%f.verts.length];E.add(a<b?`${a}-${b}`:`${b}-${a}`);});
  return {verts,faces,edges:[...E].map(e=>e.split('-').map(Number))};
}

// Depth parameter t in [0, 1] (0: the solid, 1: its dual) to h, and the five named stops as values of t.
export const hAt=(F,t)=>F.R-(F.R-F.hDual)*t;
export const stops=F=>[0,(F.R-F.hTrunc)/(F.R-F.hDual),(F.R-F.hMid)/(F.R-F.hDual),(F.R-F.hTruncDual)/(F.R-F.hDual),1];

// Counts and face types of a polyhedron: V, E, F, V − E + F and a histogram {sides: number of faces}; equal: whether all
// edges have the same length (with every face a regular polygon here, this is what makes the solid uniform).
export function facts(P){
  const types={};for(const f of P.faces)types[f.verts.length]=(types[f.verts.length]||0)+1;
  const L=P.edges.map(([i,j])=>len(sub(P.verts[i],P.verts[j]))),equal=Math.max(...L)-Math.min(...L)<1e-6*Math.max(...L);
  return {V:P.verts.length,E:P.edges.length,F:P.faces.length,euler:P.verts.length-P.edges.length+P.faces.length,types,equal};
}
