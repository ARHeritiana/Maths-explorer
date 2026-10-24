// Additive private valuations: each row is one person's values, never interpersonal utility.
const EPS=1e-10;
function validate(values){
  if(!Array.isArray(values)||values.length<2||!values[0]?.length||values.some(row=>row.length!==values[0].length||row.some(x=>!Number.isFinite(x)||x<0)||!row.some(x=>x>0)))throw new RangeError('Nonnegative valuations with positive row totals required');
}
export function cakeValue(density,a,b){
  if(!Number.isFinite(a)||!Number.isFinite(b)||a<0||b>1||a>b)throw new RangeError('Cake interval must lie in [0,1]');
  const total=density.reduce((n,x)=>n+x,0),k=density.length;
  if(!total||density.some(x=>!Number.isFinite(x)||x<0))throw new RangeError('Invalid density');
  return density.reduce((n,h,j)=>n+h*Math.max(0,Math.min(b,(j+1)/k)-Math.max(a,j/k)),0)/(total/k);
}
export function fairness(matrix){
  const n=matrix.length;
  if(matrix.some(r=>r.length!==n))throw new RangeError('Square allocation value matrix required');
  const totals=matrix.map(r=>r.reduce((a,b)=>a+b,0)),own=matrix.map((r,i)=>r[i]);
  const proportional=own.map((x,i)=>x+EPS>=totals[i]/n);
  const envy=matrix.map((r,i)=>r.map(x=>Math.max(0,x-own[i])));
  return {matrix,totals,own,proportional,envy,allProportional:proportional.every(Boolean),envyFree:envy.every(r=>r.every(x=>x<=EPS)),maxEnvy:Math.max(...envy.flat())};
}
export function cakeAllocation(values,cuts){
  validate(values);
  if(cuts.length!==values.length-1||cuts.some((x,i)=>!Number.isFinite(x)||x<0||x>1||(i&&x<cuts[i-1])))throw new RangeError('Ordered cuts required');
  const edges=[0,...cuts,1];
  return fairness(values.map(row=>values.map((_,j)=>cakeValue(row,edges[j],edges[j+1]))));
}
export function goodsAllocation(values,owners){
  validate(values);
  if(owners.length!==values[0].length||owners.some(x=>!Number.isInteger(x)||x<0||x>=values.length))throw new RangeError('Each good must have one owner');
  const matrix=values.map(row=>values.map((_,owner)=>row.reduce((n,v,j)=>n+(owners[j]===owner?v:0),0)));
  const result=fairness(matrix);
  result.ef1=values.every((row,i)=>values.every((_,j)=>{
    const goods=row.filter((v,k)=>owners[k]===j);
    return result.own[i]+EPS>=result.matrix[i][j]-(goods.length?Math.max(...goods):0);
  }));
  return result;
}
export function cutAndChoose(values){
  validate(values);if(values.length!==2)throw new RangeError('Cut and choose needs two people');
  const row=values[0],target=row.reduce((a,b)=>a+b,0)/2;
  let accum=0,cut=0;
  for(let j=0;j<row.length;j++){if(accum+row[j]>=target&&row[j]>0){cut=(j+(target-accum)/row[j])/row.length;break;}accum+=row[j];}
  const left=cakeValue(values[1],0,cut),right=cakeValue(values[1],cut,1);
  const chooserLeft=left>=right;
  const matrix=values.map(r=>{const a=cakeValue(r,0,cut),b=cakeValue(r,cut,1);return chooserLeft?[b,a]:[a,b];});
  return {cut,chooserLeft,...fairness(matrix)};
}
export function roundRobin(values){
  validate(values);const remaining=new Set(values[0].map((_,j)=>j)),owners=values[0].map(()=>-1);let turn=0;
  while(remaining.size){const person=turn++%values.length;let best=-1;for(const j of remaining)if(best<0||values[person][j]>values[person][best])best=j;owners[best]=person;remaining.delete(best);}
  return owners;
}
export function model(s){return s.kind==='goods'?goodsAllocation(s.values,s.owners):cakeAllocation(s.values,[s.cut1,s.cut2]);}
export const quantities={ownA:s=>model(s).own[0],envy:s=>model(s).maxEnvy};
export const quantity=(key,s)=>quantities[key](s);
