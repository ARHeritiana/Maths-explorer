// Independent geometric implementation of the H7/H8 construction in Fig. 2.11,
// Smith, Myers, Kaplan & Goodman-Strauss, "An aperiodic monotile" (2023/2024).
// Source: https://cs.uwaterloo.ca/~csk/hat/
// Coordinates and attachment incidences are mathematical data. No p5.js or
// source code from the reference application is included here.
const TAU = Math.PI * 2;
const STEPS = [[0,0],[0,2],[1,11],[1,1],[0,4],[0,2],
  [1,5],[1,3],[0,6],[0,8],[0,8],[0,10],[1,7],[1,9]];

export function tileOutline(a, b) {
  const vertices = [];
  let x = 0, y = 0;
  for (const [kind, angle] of STEPS) {
    vertices.push([x,y]);
    const distance = kind ? b : a;
    x += distance * Math.cos(angle * TAU / 12);
    y += distance * Math.sin(angle * TAU / 12);
  }
  return vertices;
}

function initialClusters(a,b) {
  const vertices = tileOutline(a,b);
  const anchors = [1,3,9,13].map(i=>vertices[i]);
  const reflected = [...vertices].reverse().map(([x,y])=>[x,-y]);
  const [dx,dy] = reflected[5];
  const partner = reflected.map(([x,y])=>[x-dx,y-dy]);
  const tile = {vertices, reflected:false};
  return {
    H8: {tiles:[tile],anchors},
    H7: {tiles:[tile,{vertices:partner,reflected:true}],anchors},
  };
}

function place(cluster, degrees, anchor, target) {
  const theta = degrees * Math.PI / 180, c = Math.cos(theta), s=Math.sin(theta);
  const turn=([x,y])=>[c*x-s*y,s*x+c*y];
  const origin=turn(cluster.anchors[anchor]);
  const map = point => { const p=turn(point); return [p[0]+target[0]-origin[0],p[1]+target[1]-origin[1]]; };
  return {anchors:cluster.anchors.map(map),tiles:cluster.tiles.map(t=>({...t,vertices:t.vertices.map(map)}))};
}

// Each new cluster is assembled along a chain of six anchor coincidences.
// Row fields: cluster kind, rotation degrees, own anchor, previous anchor.
const ASSEMBLY = [
  ['H8',60,2,0], ['H8',120,2,0], ['H7',0,1,1],
  ['H8',-120,2,2], ['H8',-60,2,0], ['H8',0,2,0],
];
function enlarge(clusters) {
  const parts = [clusters.H8];
  for (const [kind,rotation,from,to] of ASSEMBLY) {
    parts.push(place(clusters[kind],rotation,from,parts.at(-1).anchors[to]));
  }
  const anchors=[parts[1].anchors[3],parts[2].anchors[0],parts[4].anchors[3],parts[6].anchors[0]];
  return {
    H8:{tiles:parts.flatMap(p=>p.tiles),anchors},
    H7:{tiles:parts.slice(0,-1).flatMap(p=>p.tiles),anchors},
  };
}

export function coordinatePatch(a,b,depth=3) {
  let clusters=initialClusters(a,b);
  for(let i=0;i<depth;i++) clusters=enlarge(clusters);
  return clusters.H8.tiles;
}

// Compute once; interpolate linearly on each animation frame. Depth 2: 55
// tiles; depth 3: 377; depth 4: 2584. Stable ordering preserves tile identity.
export function makeFamilyPatch(depth=3) {
  const aPatch=coordinatePatch(1,0,depth), bPatch=coordinatePatch(0,1,depth);
  const coefficients=aPatch.map((tile,i)=>({
    reflected:tile.reflected,
    vertices:tile.vertices.map((p,j)=>[p[0],p[1],...bPatch[i].vertices[j]]),
  }));
  return function evaluate(t) {
    // 0=chevron, 1/(1+sqrt(3))=hat, 1/2=equilateral,
    // sqrt(3)/(1+sqrt(3))=turtle, 1=comet.
    const a=t,b=1-t;
    return coefficients.map(tile=>({reflected:tile.reflected,
      vertices:tile.vertices.map(([ax,ay,bx,by])=>[a*ax+b*bx,a*ay+b*by]),
    }));
  };
}
