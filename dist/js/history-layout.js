// Time geometry only. Each labelled period has its own linear scale, so sparse early dates remain explorable.
export const HISTORY_ERAS = [
 {id:'early',from:-1800,to:0,width:760,title:['Premiers écrits et Antiquité','Early records and antiquity']},
 {id:'exchange',from:0,to:1400,width:900,title:['Savoirs en circulation','Knowledge in circulation']},
 {id:'methods',from:1400,to:1700,width:820,title:['De nouvelles méthodes','New methods']},
 {id:'connections',from:1700,to:1850,width:1000,title:['Des idées qui se relient','Connecting ideas']},
 {id:'structures',from:1850,to:1950,width:1100,title:['Structures et fondements','Structures and foundations']},
 {id:'today',from:1950,to:2026,width:1050,title:['Une histoire qui continue','A continuing history']},
];
export function timePosition(year,zoom=1){
 let x=0;
 for(const era of HISTORY_ERAS){
  if(year<=era.to)return (x+Math.max(0,year-era.from)/(era.to-era.from)*era.width)*zoom;
  x+=era.width;
 }
 return x*zoom;
}
export function timelineLayout(items,zoom=1,cardWidth=184,gap=16){
 const ends=[],placed=[];
 for(const item of [...items].sort((a,b)=>a.start-b.start||a.id.localeCompare(b.id))){
  const x=timePosition(item.start,zoom);
  let lane=ends.findIndex(end=>end+gap<=x);
  if(lane<0)lane=ends.length;
  const end=timePosition(item.end??2026,zoom);
  ends[lane]=Math.max(x+cardWidth,item.dateType==='lifetime'?end:x);
  placed.push({item,x,lane,end});
 }
 return {placed,lanes:ends.length,width:timePosition(2026,zoom)+cardWidth+24};
}
