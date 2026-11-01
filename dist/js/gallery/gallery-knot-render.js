// The preview's solid strand and crossing gaps, shared by the card and rotatable explorer.
// Points are [screen x, screen y, camera depth]; larger depth is closer to the viewer.
export function drawKnotStrand(g,points,{ink,background,width=5,gap=2}){
  if(points.length<2)return;
  const segments=points.map((a,i)=>{
    const b=points[(i+1)%points.length];return {a,b,z:(a[2]+b[2])/2};
  }).sort((a,b)=>a.z-b.z);
  g.save();g.lineCap='butt';g.lineJoin='round';
  for(const {a,b} of segments){
    // Paint each near segment over the far strand with the actual canvas background.
    // The narrow background margin leaves a readable underpass without tube facets.
    g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);
    g.lineCap='butt';g.strokeStyle=background;g.lineWidth=width+2*gap;g.stroke();
    g.lineCap='round';g.strokeStyle=ink;g.lineWidth=width;g.stroke();
  }
  g.restore();
}
