// Closed braid moves and Fox 3-colourings, with a finite legal certificate for figure-eight achirality.
export const mod3=x=>((x%3)+3)%3;
export const KNOTS={unknot:{n:1,word:[]},trefoil:{n:2,word:[1,1,1]},figure8:{n:3,word:[1,-2,1,-2]}};
export function braidColors(n,word,start){
  const rows=[[...start]],v=[...start];for(const x of word){const k=Math.abs(x)-1,a=v[k],b=v[k+1];if(x>0){v[k]=mod3(2*a-b);v[k+1]=a;}else{v[k]=b;v[k+1]=mod3(2*b-a);}rows.push([...v]);}
  return {rows,end:v,closed:v.every((c,i)=>c===start[i]),nonconstant:new Set(start).size>1};
}
export function colorings(n,word){const found=[];for(let i=0;i<3**n;i++){let q=i;const start=Array.from({length:n},()=>{const v=q%3;q=Math.floor(q/3);return v;});if(braidColors(n,word,start).closed)found.push(start);}return found;}
export function knotComponents(n,word){const p=Array.from({length:n},(_,i)=>i);for(const x of word){const k=Math.abs(x)-1;[p[k],p[k+1]]=[p[k+1],p[k]];}let count=0;const seen=new Set();for(let i=0;i<n;i++)if(!seen.has(i)){count++;for(let j=i;!seen.has(j);j=p[j])seen.add(j);}return count;}
export function braidMove(state,type,index=0,g=1){
  const s={n:state.n,word:[...state.word]},w=s.word,k=Math.max(0,Math.min(index,w.length));
  if(type==='RII+'&&Math.abs(g)<s.n&&w.length<20){w.splice(k,0,g,-g);return s;}
  if(type==='RII-'&&w[k]===-w[k+1]){w.splice(k,2);return s;}
  if(type==='RIII'&&w[k]===w[k+2]&&Math.abs(Math.abs(w[k])-Math.abs(w[k+1]))===1&&Math.sign(w[k])===Math.sign(w[k+1])){w.splice(k,3,w[k+1],w[k],w[k+1]);return s;}
  if(type==='RI+'&&s.n<5){w.push((g<0?-1:1)*s.n);s.n++;return s;}
  if(type==='RI-'&&s.n>1&&Math.abs(w.at(-1))===s.n-1&&w.slice(0,-1).every(x=>Math.abs(x)<s.n-1)){w.pop();s.n--;return s;}
  if(type==='seam'&&w.length){s.word=w.slice(k).concat(w.slice(0,k));return s;}
  return null;
}
// Each row is a move, its position and (for pair insertion) generator. No crossing changes are used.
export const MIRROR_MOVES=[['seam',1],['RII+',0,2],['seam',1],['RII+',0,1],['seam',2],['RIII',4],['RII+',7,1],['RII-',3],['RIII',3],['RII+',5,1],['RIII',2],['RII-',1],['RIII',1],['RII-',0],['seam',4],['RII-',1]];
export function mirrorSequence(){const states=[{...KNOTS.figure8,word:[...KNOTS.figure8.word]}];for(const [type,index,g]of MIRROR_MOVES){const next=braidMove(states.at(-1),type,index,g);if(!next)throw new Error('Invalid mirror certificate');states.push(next);}return states;}
// Local collision-free embeddings. At a projected tangency/triple point, strands have different spatial heights.
export function moveStrands(type,p,sign=1){
  if(type==='RI')return [Array.from({length:121},(_,i)=>{const u=-1+i/60,a=.9*p-.45;return [.5+1.4*(u*u-1),(u*u*u-a*u)/(1-a),sign*.65*u*(1-u*u)];})];
  return Array.from({length:type==='RIII'?3:2},(_,strand)=>Array.from({length:81},(_,i)=>{const u=i/80,s=Math.sin(Math.PI*u);if(type==='RIII'){const d=.7*(p-.5);return [strand===0?-1+2*u:strand===1?d*s:1-2*u,2*u-1,sign*(1-strand)*.42*s];}const x=-1+2*p*s*s;return [strand===0?x:-x,2*u-1,sign*(strand===0?1:-1)*.42*s];}));
}
export function spaceKnot(kind,u,mirror=false){const t=u*Math.PI*2;let p;
  if(kind==='trefoil')p=[Math.sin(t)+2*Math.sin(2*t),Math.cos(t)-2*Math.cos(2*t),-Math.sin(3*t)];
  else if(kind==='figure8')p=[(2+Math.cos(2*t))*Math.cos(3*t),(2+Math.cos(2*t))*Math.sin(3*t),Math.sin(4*t)];
  else p=[2.2*Math.cos(t),2.2*Math.sin(t),0];if(mirror)p[2]*=-1;return p.map(x=>x*.55);
}
