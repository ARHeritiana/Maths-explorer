// Independent checks of gallery geometry, physical timing, area descent and knot invariants.
import test from 'node:test';
import assert from 'node:assert/strict';
import {voronoiCells,polygonArea,polygonCentroid,cycloid,bezierTrack,descentTrack,pointAtTime,filmMesh,filmArea,relaxFilm} from '../site/js/gallery-models.js';
import {tileOutline,makeFamilyPatch} from '../site/js/gallery-hat-model.js';
import {KNOTS,braidMove,braidColors,colorings,knotComponents,mirrorSequence,moveStrands} from '../site/js/gallery-knot-model.js';
test('Voronoi cells partition a rectangle and every sampled interior belongs to its nearest seed',()=>{
  for(const seeds of [[[1,5],[9,5]],[[2,2],[8,2],[5,8]],[[2,2],[2,2],[8,8]]]){
    const cells=voronoiCells(seeds,[0,0,10,10]);assert.ok(Math.abs(cells.reduce((s,p)=>s+polygonArea(p),0)-100)<1e-7);
    cells.forEach((cell,i)=>{if(!cell.length)return;const p=polygonCentroid(cell),d=Math.hypot(p[0]-seeds[i][0],p[1]-seeds[i][1]);assert.ok(seeds.every(s=>d<=Math.hypot(p[0]-s[0],p[1]-s[1])+1e-8));});
  }
  assert.deepEqual(polygonCentroid([[0,0],[4,0],[4,2],[0,2]]),[2,1]);
});
test('Frictionless times agree with independently derived incline and cycloid formulas',()=>{
  const tr=descentTrack([[0,0],[4,2]]),length=Math.sqrt(20),acc=9.81*2/length,expected=Math.sqrt(2*length/acc);
  assert.ok(Math.abs(tr.total-expected)<1e-12);const p=pointAtTime(tr,tr.total/2);assert.ok(Math.abs(p[0]-1)<1e-12&&Math.abs(p[1]-.5)<1e-12);
  for(const end of [[4,2],[1,3],[7,1]]){const c=cycloid(end,480),numerical=descentTrack(c.points);assert.ok(Math.hypot(c.points.at(-1)[0]-end[0],c.points.at(-1)[1]-end[1])<1e-8);assert.ok(Math.abs(numerical.total-c.time)<1e-5);assert.ok(c.time<descentTrack([[0,0],end]).total);}
  assert.equal(descentTrack([[0,0],[1,0]]).total,Infinity);
  const custom=descentTrack(bezierTrack([[.8,2.6],[2.8,2.9]]));assert.ok(custom.total>cycloid().time);
});
test('Soap film derivative matches finite differences; relaxation fixes the boundary and decreases area',()=>{
  const flat=filmMesh([0,0,0,0],10,0);assert.ok(Math.abs(filmArea(flat)-4)<1e-12);
  const m=filmMesh([.7,-.7,.7,-.7],10,.8),k=45,analytic=filmArea(m,true).grad[k],z=m.pts[k][2],eps=1e-6;
  m.pts[k][2]=z+eps;const up=filmArea(m);m.pts[k][2]=z-eps;const down=filmArea(m);m.pts[k][2]=z;assert.ok(Math.abs(analytic-(up-down)/(2*eps))<1e-7);
  const edge=m.pts.map(p=>[...p]),initial=filmArea(m);let before=initial;
  for(let q=0;q<150;q++){const a=relaxFilm(m).area;assert.ok(a<=before+1e-12);before=a;}
  assert.ok(before<initial-.2);m.pts.forEach((p,i)=>{if(i%11===0||i%11===10||i<11||i>=110)assert.deepEqual(p,edge[i]);});
});
test('Hat family closes, remains congruent and shares edges throughout the continuous deformation',()=>{
  const family=makeFamilyPatch(2);for(const t of [0,.2,1/(1+Math.sqrt(3)),.5,.7,1]){
    const tiles=family(t),a=polygonArea(tileOutline(t,1-t)),edges=new Map();assert.equal(tiles.length,55);assert.ok(a>0);
    for(const tile of tiles){assert.ok(Math.abs(polygonArea(tile.vertices)-a)<1e-9);for(let i=0;i<tile.vertices.length;i++){const p=tile.vertices[i],q=tile.vertices[(i+1)%tile.vertices.length];if(Math.hypot(p[0]-q[0],p[1]-q[1])<1e-8)continue;const key=[p,q].map(v=>v.map(x=>Math.round(x*1e7)).join(',')).sort().join('|');edges.set(key,(edges.get(key)||0)+1);}}
    // At collapsed endpoints a long boundary may contain several collinear short edges.
    if(t!==0&&t!==1){assert.ok([...edges.values()].every(n=>n<=2));assert.ok([...edges.values()].filter(n=>n===2).length>100);}
  }
});
test('Knot colouring is invariant under every supported legal move and the complete mirror certificate',()=>{
  assert.equal(colorings(1,[]).length,3);assert.equal(colorings(2,[1,1,1]).length,9);assert.equal(colorings(3,[1,-2,1,-2]).length,3);
  for(const original of Object.values(KNOTS)){
    const count=colorings(original.n,original.word).length,components=knotComponents(original.n,original.word);
    for(const sign of [-1,1]){const add=braidMove(original,'RI+',0,sign);assert.equal(colorings(add.n,add.word).length,count);assert.equal(knotComponents(add.n,add.word),components);assert.deepEqual(braidMove(add,'RI-'),original);}
    if(original.n>1)for(let at=0;at<=original.word.length;at++){const add=braidMove(original,'RII+',at,1);assert.equal(colorings(add.n,add.word).length,count);assert.deepEqual(braidMove(add,'RII-',at),original);}
  }
  for(const sign of [-1,1]){const s={n:3,word:[sign,2*sign,sign]},next=braidMove(s,'RIII');for(let i=0;i<27;i++){const c=[i%3,Math.floor(i/3)%3,Math.floor(i/9)];assert.deepEqual(braidColors(3,s.word,c).end,braidColors(3,next.word,c).end);}}
  const seq=mirrorSequence();assert.equal(seq.length,17);assert.deepEqual(seq.at(-1).word,seq[0].word.map(x=>-x));for(const s of seq){assert.equal(colorings(s.n,s.word).length,3);assert.equal(knotComponents(s.n,s.word),1);}
  assert.equal(braidMove({n:3,word:[1,2,-1]},'RIII'),null);
});
test('Local I, II and III animations never merge strands in three-dimensional space',()=>{
  for(let p=0;p<=20;p++){
    const [curve]=moveStrands('RI',p/20);assert.ok(Math.hypot(curve[0][0]-.5,curve[0][1]+1,curve[0][2])<1e-12);assert.ok(Math.hypot(curve.at(-1)[0]-.5,curve.at(-1)[1]-1,curve.at(-1)[2])<1e-12);
    // Nonadjacent samples must remain separate, including the projected cusp/curl.
    for(let i=0;i<curve.length;i++)for(let j=i+3;j<curve.length;j++)assert.ok(Math.hypot(...curve[i].map((x,k)=>x-curve[j][k]))>1e-4);
  }
  for(const kind of ['RII','RIII'])for(let p=0;p<=20;p++){
    const strands=moveStrands(kind,p/20);for(let i=0;i<strands[0].length;i++)for(let a=0;a<strands.length;a++)for(let b=a+1;b<strands.length;b++)assert.ok(Math.hypot(...strands[a][i].map((v,j)=>v-strands[b][i][j]))>.1);
  }
});
