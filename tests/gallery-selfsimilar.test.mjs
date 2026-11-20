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
  // below the dimension of the space, except the space-filling curves (D = 2 = E) and the fern (affine: no similarity dimension)
  for(const id of FRACTAL_IDS.filter(k=>!FRACTALS[k].curve&&!FRACTALS[k].affine))assert.ok(similarityDim(id)<FRACTALS[id].E,`${id}: dimension below the space it lives in`);
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

// #36 phase 2: dragon, Hilbert and Peano curves, Cantor dust, Barnsley fern
import {dragonPoints,hilbertCells,peanoCells,fernPieces,fernPoints,dustCells,FERN,FERN_DET,FERN_BOX,stageFacts as SF,similarityDim as SD} from '../site/js/gallery/gallery-selfsimilar-model.js';
const pathLen=P=>P.reduce((s,p,i)=>i?s+Math.hypot(p[0]-P[i-1][0],p[1]-P[i-1][1]):0,0);
const shoe=P=>{let s=0;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];s+=a[0]*b[1]-b[0]*a[1];}return Math.abs(s)/2;};

test('Heighway dragon: 2ⁿ equal steps from (0,0) to (1,0), turns of ±90°, never a segment twice, length (√2)ⁿ', () => {
  for(let n=0;n<=12;n++){const P=dragonPoints(n);assert.equal(P.length,2**n+1);
    assert.ok(Math.hypot(P.at(-1)[0]-1,P.at(-1)[1])<1e-9&&Math.hypot(...P[0])<1e-12);
    const L=P.slice(1).map((p,i)=>Math.hypot(p[0]-P[i][0],p[1]-P[i][1]));assert.ok(Math.max(...L)-Math.min(...L)<1e-9);
    assert.ok(Math.abs(pathLen(P)-SF('dragon',n).measure)<1e-9);
    for(let i=2;i<P.length;i++){const u=[P[i-1][0]-P[i-2][0],P[i-1][1]-P[i-2][1]],v=[P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]];assert.ok(Math.abs(u[0]*v[0]+u[1]*v[1])<1e-9);}
    const seen=new Set();for(let i=1;i<P.length;i++){const k=[P[i-1],P[i]].map(p=>p.map(v=>v.toFixed(7)).join()).sort().join('|');assert.ok(!seen.has(k),`stage ${n}`);seen.add(k);}}
  assert.ok(Math.abs(SD('dragon')-2)<1e-12);
});

test('Hilbert and Peano curves: every cell once, neighbours one step apart, length (m² − 1)/m', () => {
  for(const [cells,b,max] of [[hilbertCells,2,6],[peanoCells,3,4]])for(let n=0;n<=max;n++){const C=cells(n),m=b**n;
    assert.equal(C.length,m*m);assert.equal(new Set(C.map(p=>p.join())).size,m*m);
    C.forEach((p,i)=>{if(i)assert.equal(Math.abs(p[0]-C[i-1][0])+Math.abs(p[1]-C[i-1][1]),1);assert.ok(p.every(v=>v>=0&&v<m));});
    assert.ok(Math.abs(pathLen(C.map(p=>[p[0]/m,p[1]/m]))-SF(b===2?'hilbert':'peano',n).measure)<1e-9);}
  assert.deepEqual(peanoCells(2).at(-1),[8,8]);assert.deepEqual(hilbertCells(3).at(-1),[7,0]);   // ends at the opposite corner, and at the bottom right
  assert.ok(Math.abs(SD('hilbert')-2)<1e-12);assert.ok(Math.abs(SD('peano')-2)<1e-12);
});

test('Cantor dust: 8ⁿ cubes, every base-3 digit 0 or 2, volume (8/27)ⁿ, dimension log 8 / log 3', () => {
  for(let n=0;n<=3;n++){const C=dustCells(n);assert.equal(C.length,8**n);assert.equal(new Set(C.map(p=>p.join())).size,8**n);
    for(const p of C)for(let v of p){for(let k=0;k<n;k++){assert.ok(v%3!==1);v=Math.floor(v/3);}}
    assert.ok(Math.abs(C.length*(1/3**n)**3-SF('dust',n).measure)<1e-12);}
  assert.ok(Math.abs(SD('dust')-1.892789260714372)<1e-12);
});

test('Barnsley fern: Σ|det| = 0.9367, the pieces’ total area is 0.9367ⁿ times the box, chaos-game points stay in the box', () => {
  assert.ok(Math.abs(FERN_DET-0.9367)<1e-12);assert.ok(Math.abs(FERN.reduce((s,m)=>s+m.p,0)-1)<1e-12);
  const box=shoe(FERN_BOX);for(let n=0;n<=4;n++){const P=fernPieces(n);assert.equal(P.length,4**n);
    assert.ok(Math.abs(P.reduce((s,q)=>s+shoe(q),0)-box*FERN_DET**n)<1e-9*box);assert.ok(Math.abs(SF('fern',n).measure-FERN_DET**n)<1e-12);}
  for(const [x,y] of fernPoints(20000))assert.ok(x>=-2.2&&x<=2.7&&y>=0&&y<=10);
  assert.equal(SD('fern'),null);
});
