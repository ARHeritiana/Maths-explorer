// Polyhedra by transformation (issue #35): the corner-cutting family of each Platonic solid, checked against the published
// counts of the Archimedean solids and of the duals, Euler's formula all along the way, convexity, and the exact depth of
// the cube's truncation.
import test from 'node:test';
import assert from 'node:assert/strict';
import {FAMILIES,SOLID_IDS,family,cut,facts,stops,hAt} from '../site/js/gallery/gallery-polyhedra-model.js';

// V, E, F and face types of the solids (MathWorld, "Archimedean Solid" and "Platonic Solid" tables)
const KNOWN={
  'Tétraèdre':[4,6,4,{3:4}],'Cube':[8,12,6,{4:6}],'Octaèdre':[6,12,8,{3:8}],'Dodécaèdre':[20,30,12,{5:12}],'Icosaèdre':[12,30,20,{3:20}],
  'Tétraèdre tronqué':[12,18,8,{3:4,6:4}],'Cube tronqué':[24,36,14,{3:8,8:6}],'Octaèdre tronqué':[24,36,14,{4:6,6:8}],'Cuboctaèdre':[12,24,14,{3:8,4:6}],
  'Dodécaèdre tronqué':[60,90,32,{3:20,10:12}],'Icosaèdre tronqué':[60,90,32,{5:12,6:20}],'Icosidodécaèdre':[30,60,32,{3:20,5:12}],
};

test('the five stops of every family are the named solids, with all edges equal', () => {
  for(const id of SOLID_IDS){
    const F=family(id),st=stops(F);
    st.forEach((t,k)=>{
      const f=facts(cut(F,hAt(F,t))),[V,E,Fc,types]=KNOWN[FAMILIES[id].names[k][0]];
      assert.deepEqual([f.V,f.E,f.F],[V,E,Fc],`${id} stop ${k}`);assert.deepEqual(f.types,types,`${id} stop ${k} faces`);
      assert.ok(f.equal,`${id} stop ${k}: edges equal`);
    });
    for(let k=1;k<st.length;k++)assert.ok(st[k]>st[k-1],`${id}: stops in order`);
  }
});

test('Euler V - E + F = 2 at every depth, and the solid stays convex', () => {
  for(const id of SOLID_IDS){const F=family(id);
    for(let i=0;i<=40;i++){const P=cut(F,hAt(F,i/40)),f=facts(P);assert.equal(f.euler,2,`${id} t=${i/40}`);
      // convex: every vertex lies on the inner side of every face plane
      for(const fc of P.faces){const d=fc.n[0]*P.verts[fc.verts[0]][0]+fc.n[1]*P.verts[fc.verts[0]][1]+fc.n[2]*P.verts[fc.verts[0]][2];
        for(const v of P.verts)assert.ok(fc.n[0]*v[0]+fc.n[1]*v[1]+fc.n[2]*v[2]<=d+1e-7);}}
  }
});

test('the cube is truncated into a regular octagon at depth t = 1 - 1/sqrt(2), and the end of the cube family is the octahedron', () => {
  const F=family('cube'),st=stops(F);
  assert.ok(Math.abs(st[1]-(1-1/Math.SQRT2))<1e-6,String(st[1]));
  assert.ok(Math.abs(st[2]-0.5)<1e-9);
  // duality: the end shape's vertices point along the cube's face normals (6 of them)
  const P=cut(F,hAt(F,1));for(const v of P.verts){const a=v.map(Math.abs).sort((x,y)=>y-x);assert.ok(a[1]<1e-7&&a[2]<1e-7);}
});

test('dual pairs read the same chain backwards', () => {
  for(const [a,b] of [['cube','octahedron'],['dodecahedron','icosahedron'],['tetrahedron','tetrahedron']]){
    const na=FAMILIES[a].names.map(x=>x[0]),nb=FAMILIES[b].names.map(x=>x[0]);assert.deepEqual(na,[...nb].reverse());
    assert.equal(FAMILIES[a].dual,b);
  }
});
