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

// A shared hierarchy is traversed only where it meets the visible window.
// Depth eight describes millions of neighbours without allocating their polygons.
// A fixed leaf address anchors the family, so shape changes never refit the camera.
export function makeFamilyWindow(depth=8){
  const bounds=vertices=>[Math.min(...vertices.map(p=>p[0])),Math.min(...vertices.map(p=>p[1])),Math.max(...vertices.map(p=>p[0])),Math.max(...vertices.map(p=>p[1]))];
  const corners=b=>[[b[0],b[1]],[b[2],b[1]],[b[2],b[3]],[b[0],b[3]]];
  const transform=(p,m)=>[m[0]*p[0]-m[1]*p[1]+m[2],m[1]*p[0]+m[0]*p[1]+m[3]];
  const identity=[1,0,0,0];
  const compose=(a,b)=>[a[0]*b[0]-a[1]*b[1],a[1]*b[0]+a[0]*b[1],...transform([b[2],b[3]],a)];
  function tree(t){
    let clusters=initialClusters(t,1-t);
    for(const node of Object.values(clusters))node.bounds=bounds(node.tiles.flatMap(x=>x.vertices));
    for(let d=0;d<depth;d++){
      const parts=[{node:clusters.H8,m:identity,anchors:clusters.H8.anchors,bounds:clusters.H8.bounds}];
      for(const [kind,degrees,from,to]of ASSEMBLY){const node=clusters[kind],c=Math.cos(degrees*Math.PI/180),s=Math.sin(degrees*Math.PI/180),p=transform(node.anchors[from],[c,s,0,0]),target=parts.at(-1).anchors[to],m=[c,s,target[0]-p[0],target[1]-p[1]];parts.push({node,m,anchors:node.anchors.map(p=>transform(p,m)),bounds:bounds(corners(node.bounds).map(p=>transform(p,m)))});}
      const anchors=[parts[1].anchors[3],parts[2].anchors[0],parts[4].anchors[3],parts[6].anchors[0]];
      const make=ps=>({parts:ps,anchors,bounds:bounds(ps.flatMap(p=>corners(p.bounds)))});
      clusters={H8:make(parts),H7:make(parts.slice(0,-1))};
    }return clusters.H8;
  }
  // Repeatedly select the second H8 child. Unlike descent towards bounding-box
  // centres, this nesting stays inside the patch rather than an exterior fjord.
  // At depth eight its anchor is over 340 units from the outer boundary across
  // sampled family parameters, covering zoom .2 and pans of +/-100 units.
  // Keeping the address fixed also preserves tile identity throughout the morph.
  const address=Array(depth).fill(1);
  let parameter=null,root=null,anchor=null;
  return function visible(t,rect){
    if(t!==parameter){parameter=t;root=tree(t);let n=root,m=identity;for(const i of address){m=compose(m,n.parts[i].m);n=n.parts[i].node;}const v=n.tiles[0].vertices;anchor=transform([v.reduce((s,p)=>s+p[0],0)/v.length,v.reduce((s,p)=>s+p[1],0)/v.length],m);}
    const output=[];
    function visit(n,m,id){const b=bounds(corners(n.bounds).map(p=>transform(p,m)));if(b[2]<rect[0]||b[0]>rect[2]||b[3]<rect[1]||b[1]>rect[3])return;
      if(n.parts)n.parts.forEach((part,i)=>visit(part.node,compose(m,part.m),id+i));
      else n.tiles.forEach((tile,i)=>{const vertices=tile.vertices.map(p=>transform(p,m)),b=bounds(vertices);if(!(b[2]<rect[0]||b[0]>rect[2]||b[3]<rect[1]||b[1]>rect[3]))output.push({...tile,vertices,id:id+':'+i});});
    }
    visit(root,[1,0,-anchor[0],-anchor[1]],'');return output;
  };
}

// Expand the same nested patch when a pan exposes distant neighbours. Each
// added parent contains the old H8 as child 1, rotated by 60 degrees. Undoing
// that rotation retains every existing tile and the camera's fixed scale.
export function makeExpandingFamilyWindow(){
  const windows=new Map();
  return (t,rect)=>{
    const radius=Math.max(...rect.map(Math.abs));
    const extra=Math.max(0,Math.ceil(Math.log(Math.max(1,radius/500))/Math.log(2.5)));
    const depth=10+extra,angle=extra*Math.PI/3,c=Math.cos(angle),s=Math.sin(angle);
    if(!windows.has(depth))windows.set(depth,makeFamilyWindow(depth));
    const corners=[[rect[0],rect[1]],[rect[2],rect[1]],[rect[2],rect[3]],[rect[0],rect[3]]].map(([x,y])=>[c*x-s*y,s*x+c*y]);
    const box=[Math.min(...corners.map(p=>p[0])),Math.min(...corners.map(p=>p[1])),Math.max(...corners.map(p=>p[0])),Math.max(...corners.map(p=>p[1]))];
    return windows.get(depth)(t,box).map(tile=>({...tile,id:tile.id.replace(/^1+/,''),vertices:tile.vertices.map(([x,y])=>[c*x+s*y,-s*x+c*y])}));
  };
}
