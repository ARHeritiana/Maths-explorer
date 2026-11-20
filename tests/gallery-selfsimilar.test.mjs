// Self-similar fractals (issue #36): every stage fact of gallery-selfsimilar-model.js is checked against the pieces
// actually built (counted, measured), and the dimensions against independently known values.
import test from 'node:test';
import assert from 'node:assert/strict';
import {FRACTALS,FRACTAL_IDS,similarityDim,stageFacts,cantorIntervals,kochSnowflake,polyArea,carpetHoles,mengerCells,mengerFaces,tetrixPieces,tetraVolume,TETRA} from '../site/js/gallery/gallery-selfsimilar-model.js';

const near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),`${a} versus ${b}`);

test('similarity dimensions match the published values', () => {
  near(similarityDim('cantor'),0.6309297535714574);
  near(similarityDim('koch'),1.2618595071429148);
  near(similarityDim('carpet'),1.8927892607143721);
  near(similarityDim('menger'),2.7268330278608417);   // log 20 / log 3 ≈ 2.726833 (MathWorld)
  near(similarityDim('tetrix'),2);
  for(const id of FRACTAL_IDS)assert.ok(similarityDim(id)<FRACTALS[id].E,`${id}: dimension below the space it lives in`);
});

test('Cantor set: 2^n intervals of length 3^-n, total length (2/3)^n, disjoint and in order', () => {
  for(let n=0;n<=8;n++){
    const I=cantorIntervals(n),f=stageFacts('cantor',n);
    assert.equal(I.length,f.pieces);
    near(I.reduce((s,[a,b])=>s+b-a,0),f.measure);
    for(const [a,b] of I)near(b-a,f.scale);
    for(let i=1;i<I.length;i++)assert.ok(I[i][0]>I[i-1][1]);
  }
});

test('Koch snowflake: 3*4^n sides, perimeter 3(4/3)^n, area 8/5 - 3/5 (4/9)^n times the triangle, no self-crossing at stage 3', () => {
  const A0=Math.sqrt(3)/4;
  for(let n=0;n<=6;n++){
    const P=kochSnowflake(n),f=stageFacts('koch',n);
    assert.equal(P.length,f.pieces);
    let per=0;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];per+=Math.hypot(b[0]-a[0],b[1]-a[1]);near(Math.hypot(b[0]-a[0],b[1]-a[1]),f.scale,1e-9);}
    near(per/3,f.measure,1e-9);
    near(polyArea(P)/A0,f.area,1e-9);   // positive: the bumps point outwards
  }
  near(stageFacts('koch',60).area,8/5,1e-12);
  // simple polygon: no two non-adjacent sides cross
  const P=kochSnowflake(3),cross=(a,b,c,d)=>{const o=(p,q,r)=>Math.sign((q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]));return o(a,b,c)*o(a,b,d)<0&&o(c,d,a)*o(c,d,b)<0;};
  for(let i=0;i<P.length;i++)for(let j=i+2;j<P.length;j++){if(i===0&&j===P.length-1)continue;assert.ok(!cross(P[i],P[(i+1)%P.length],P[j],P[(j+1)%P.length]));}
});

test('Sierpinski carpet: (8^n - 1)/7 holes, remaining area (8/9)^n', () => {
  for(let n=0;n<=5;n++){
    const H=carpetHoles(n),f=stageFacts('carpet',n);
    assert.equal(H.length,(8**n-1)/7);
    near(1-H.reduce((s,h)=>s+h[2]**2,0),f.measure);
    assert.equal(f.pieces,8**n);
  }
});

test('Menger sponge: 20^n cubes, volume (20/27)^n; visible faces add up to the right surface', () => {
  for(let n=0;n<=3;n++){const f=stageFacts('menger',n);assert.equal(mengerCells(n).length,f.pieces);near(f.pieces*f.scale**3,f.measure);}
  assert.equal(mengerFaces(0).length,6);
  // stage 1: the 20 cubes have 6*20 = 120 faces, of which 2 * (number of shared faces) are hidden. Shared faces: 24 (each
  // of the 12 edge cubes touches 2 corner cubes). So 120 - 48 = 72 visible faces.
  assert.equal(mengerFaces(1).length,72);
  // surface area of stage n (unit cube): S(n) = 2(20/9)^n + 4(8/9)^n, a known closed form (stage 1: 72 faces of area 1/9 = 8)
  for(let n=0;n<=3;n++){const F=mengerFaces(n);near(F.length*F[0].s**2,2*(20/9)**n+4*(8/9)**n,1e-9);}
});

test('Sierpinski tetrahedron: 4^n tetrahedra, volume (1/2)^n, dimension exactly 2', () => {
  const V0=tetraVolume(TETRA);near(V0,Math.sqrt(2)/12);
  for(let n=0;n<=5;n++){const T=tetrixPieces(n),f=stageFacts('tetrix',n);assert.equal(T.length,f.pieces);near(T.reduce((s,t)=>s+tetraVolume(t),0)/V0,f.measure);}
  assert.equal(stageFacts('tetrix',7).surface,1);
});
