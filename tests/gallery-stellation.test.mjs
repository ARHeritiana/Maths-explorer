// Stellation and the Kepler–Poinsot solids (issue #35): every stage against the published counts (V, E, F, Schläfli
// symbol, χ, density), regular faces (equal sides, vertices on a circle at equal angles), every edge on exactly two faces,
// the faces in the fixed planes, the drawable pieces: area weighted by winding equals the shoelace area of each face cycle
// (an independent formula: ∮ winding = signed area), pieces inside their own plane, and the stellation diagram.
import test from 'node:test';
import assert from 'node:assert/strict';
import {stellation,STAGES,SEQUENCES,pieces,density,facesAtVertex,diagram,winding,meetingPoints,normalsOf} from '../site/js/gallery/gallery-stellation-model.js';

const PUBLISHED={dodecahedron:[20,30,12,3,1],'small-stellated':[12,30,12,5,3],'great-dodecahedron':[12,30,12,5,3],'great-stellated':[20,30,12,3,7],icosahedron:[12,30,20,5,1],'great-icosahedron':[12,30,20,5,7]};
const d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];

test('counts, Euler characteristic and density against the published values', () => {
  for(const [id,[V,E,F,q,dens]] of Object.entries(PUBLISHED)){const S=stellation(id);
    assert.deepEqual([S.V,S.E,S.F],[V,E,F],id);assert.equal(S.chi,V-E+F);
    assert.deepEqual([...new Set(facesAtVertex(S))],[q],id);
    assert.equal(density(S),dens,id);assert.equal(density(S,[0.9,-0.2,0.38].map(x=>x/Math.hypot(0.9,0.2,0.38))),dens,id);}
  assert.equal(stellation('small-stellated').chi,-6);assert.equal(stellation('great-stellated').chi,2);
});

test('faces are regular polygons or regular stars {5/2} in the fixed planes, every edge on two faces', () => {
  for(const id of Object.keys(STAGES)){const S=stellation(id),st=STAGES[id];
    const L=S.edges.map(([a,b])=>d3(S.verts[a],S.verts[b]));assert.ok(Math.max(...L)-Math.min(...L)<1e-9,id);
    for(const f of S.faces){
      for(const k of f.verts)assert.ok(Math.abs(dot(f.normal,S.verts[k])-1)<1e-9);   // in the plane n·x = 1
      const r=f.verts.map(k=>d3(S.verts[k],f.centre));assert.ok(Math.max(...r)-Math.min(...r)<1e-9);
      // consecutive vertices of the cycle are step × 2π/n apart around the centre
      const n=f.verts.length,ang=(2*Math.PI*st.step)/n,chord=2*r[0]*Math.sin(ang/2);
      f.verts.forEach((a,i)=>assert.ok(Math.abs(d3(S.verts[a],S.verts[f.verts[(i+1)%n]])-chord)<1e-9));}
    const use=new Map();S.faces.forEach(f=>f.verts.forEach((a,i)=>{const b=f.verts[(i+1)%f.verts.length],k=a<b?a+'-'+b:b+'-'+a;use.set(k,(use.get(k)||0)+1);}));
    assert.ok([...use.values()].every(c=>c===2),id);}
  // the small stellated and the great dodecahedra share their 12 vertices; their edges differ by the golden ratio
  const a=stellation('small-stellated'),b=stellation('great-dodecahedron'),la=d3(...a.edges[0].map(k=>a.verts[k])),lb=d3(...b.edges[0].map(k=>b.verts[k]));
  assert.ok(Math.abs(la/lb-(1+Math.sqrt(5))/2)<1e-9);
});

test('drawable pieces: inside their plane, and area × winding adds up to the shoelace area of each face', () => {
  for(const id of Object.keys(STAGES)){const S=stellation(id),P=pieces(S);
    for(const f of S.faces){
      const mine=P.filter(p=>p.face===f.plane);assert.ok(mine.length>0);
      for(const p of mine)for(const v of p.pts)assert.ok(Math.abs(dot(f.normal,v)-1)<1e-9);
      const area3=pts=>{let s=[0,0,0];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];s=[s[0]+a[1]*b[2]-a[2]*b[1],s[1]+a[2]*b[0]-a[0]*b[2],s[2]+a[0]*b[1]-a[1]*b[0]];}return Math.abs(dot(s,f.normal))/2;};
      const weighted=mine.reduce((s,p)=>s+p.wind*area3(p.pts),0),shoelace=area3(f.verts.map(k=>S.verts[k]));
      assert.ok(Math.abs(weighted-shoelace)<1e-6*shoelace,`${id} ${weighted} ${shoelace}`);}}
});

test('winding of a pentagram: 2 at the centre, 1 in a point, 0 outside', () => {
  const star=[0,2,4,1,3].map(k=>[Math.cos(Math.PI/2+k*2*Math.PI/5),Math.sin(Math.PI/2+k*2*Math.PI/5)]);
  assert.equal(Math.abs(winding(star,[0,0])),2);assert.equal(Math.abs(winding(star,[0,.8])),1);assert.equal(winding(star,[2,2]),0);
});

test('stellation diagram: 10 lines in a dodecahedron face plane, 18 in an icosahedron face plane; stages grow outwards', () => {
  assert.equal(diagram('dod').lines.length,10);assert.equal(diagram('ico').lines.length,18);
  const r=d=>diagram(d).outlines.map(q=>Math.max(...q.map(p=>Math.hypot(...p))));
  const rd=r('dod');assert.ok(rd[0]<rd[1]&&Math.abs(rd[1]-rd[2])<1e-9&&rd[2]<rd[3]);
  const ri=r('ico');assert.ok(ri[0]<ri[1]);
  // the vertex groups: 20, 12, 20 points for the dodecahedron's planes
  assert.deepEqual(meetingPoints(normalsOf('dod')).map(g=>g.points.length),[20,12,20]);
  assert.deepEqual(SEQUENCES.dod.length,4);
});
