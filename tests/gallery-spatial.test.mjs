// Independent checks of the displayed spatial models, not just their menu metadata.
import test from 'node:test';
import assert from 'node:assert/strict';
import {KNOT_CATALOGUE} from '../site/js/knot-catalogue.js';
import {normaliseKnot,knotProjection,knotDeformation,cameraKnot,colouringErrors} from '../site/js/gallery-knot-geometry.js';
import {SOAP_FRAMES,makeSoapFrame,meshArea3D,relaxMesh3D,tetraFilm,relaxTetraNetwork} from '../site/js/gallery-soap-model.js';
import {makeFamilyWindow,makeExpandingFamilyWindow} from '../site/js/gallery-hat-model.js';
test('All 44 actual spatial curves produce consistent Fox colours in independent views',()=>{
  assert.equal(KNOT_CATALOGUE.length,44);assert.equal(KNOT_CATALOGUE.filter(x=>x.kind==='prime').length,35);assert.equal(KNOT_CATALOGUE.filter(x=>x.kind==='composite').length,8);
  for(const entry of KNOT_CATALOGUE){const points=normaliseKnot(entry),reference=knotProjection(points);
    assert.equal(reference.count>3,entry.determinant%3===0,entry.id);assert.equal(colouringErrors(reference,reference.witness),0,entry.id);
    for(const [yaw,tilt,mirror]of [[.271,.439,false],[-.614,.371,true]]){const p=knotProjection(cameraKnot(points,yaw,tilt,mirror));assert.equal(p.count,reference.count,entry.id);assert.equal(colouringErrors(p,p.witness),0);}
  }
});
test('Unknot isotopy removes two crossings without changing its colouring invariant',()=>{
  assert.equal(knotProjection(knotDeformation([],'unknot',0)).crossings.length,2);
  assert.equal(knotProjection(knotDeformation([],'unknot',1)).crossings.length,0);
  for(let i=0;i<=50;i++){const p=knotProjection(knotDeformation([],'unknot',i/50));assert.equal(p.count,3);}
  for(const [id,example]of [['3_1','shear'],['4_1','turn']])for(let i=0;i<=20;i++){const p=knotProjection(knotDeformation(normaliseKnot(KNOT_CATALOGUE.find(e=>e.id===id)),example,i/20));assert.equal(p.count,id==='3_1'?9:3);}
});
test('Every spatial film relaxes monotonically with exactly fixed wires',()=>{
  assert.equal(SOAP_FRAMES.length,13);
  for(const frame of SOAP_FRAMES){const m=makeSoapFrame(frame.id),wire=m.pts.filter((_,i)=>m.fixed[i]).map(p=>p.slice());let area=meshArea3D(m);for(let k=0;k<50;k++){const r=relaxMesh3D(m);assert.ok(r.area<=area+1e-10,frame.id);area=r.area;}assert.deepEqual(m.pts.filter((_,i)=>m.fixed[i]),wire);}
  const m=tetraFilm(),area=meshArea3D(m);for(let i=0;i<80;i++)relaxTetraNetwork(m);assert.ok(meshArea3D(m)<area);assert.ok(Math.hypot(...m.pts[4])<1e-7);
});
function inside([x,y],poly){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
test('Einstein hierarchy covers the complete visible window across shapes, zoom and pan',()=>{
  const f=makeFamilyWindow();for(const t of [0,.1,1/(1+Math.sqrt(3)),.5,1-1/(1+Math.sqrt(3)),.9,1])for(const [size,cx,cy]of [[1,0,0],[5,0,0],[2,35,-30]]){
    const tiles=f(t,[cx-11*size,cy-8*size,cx+11*size,cy+8*size]);
    for(let j=0;j<12;j++)for(let i=0;i<16;i++){const p=[cx+(-10.91+i*1.4)*size,cy+(-7.79+j*1.4)*size];assert.ok(tiles.some(tile=>inside(p,tile.vertices)),`uncovered ${t},${p}`);}
  }
});

test('Expanding the hat hierarchy preserves existing tiles instead of repeating a patch',()=>{
  const f=makeExpandingFamilyWindow();const a=f(.366,[-5,-4,5,4]),b=f(.366,[496,-4,504,4]);assert.ok(b.length>0);
  // Crossing the expansion threshold must leave every tile around the origin fixed.
  const c=f(.366,[-5,-4,501,4]);for(const tile of a){const centre=tile.vertices.reduce((s,p)=>[s[0]+p[0]/tile.vertices.length,s[1]+p[1]/tile.vertices.length],[0,0]);if(Math.abs(centre[0])>5||Math.abs(centre[1])>4)continue;const q=c.find(x=>x.id===tile.id);assert.ok(q);tile.vertices.forEach((p,i)=>assert.ok(Math.hypot(p[0]-q.vertices[i][0],p[1]-q.vertices[i][1])<1e-8));}
});
