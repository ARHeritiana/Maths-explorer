// One model drives the circle, its exact coordinates, and the function graph.
export const remarkableAngles = [0,30,45,60,90,120,135,150,180,210,225,240,270,300,315,330,360];
const gcd=(a,b)=>b?gcd(b,a%b):a;
export function radiansLabel(degrees){
  const n=Math.round(degrees);
  if(Math.abs(degrees-n)>1e-8)return null;
  if(n===0)return '0';
  const d=gcd(Math.abs(n),180),a=n/d,b=180/d;
  return `${a<0?'−':''}${Math.abs(a)===1?'':Math.abs(a)}π${b===1?'':'/'+b}`;
}
const norm=d=>((d%360)+360)%360;
export function trigValues(degrees){
  const a=norm(degrees),rad=degrees*Math.PI/180;
  const table={0:['1','0'],30:['√3/2','1/2'],45:['√2/2','√2/2'],60:['1/2','√3/2'],90:['0','1'],120:['−1/2','√3/2'],135:['−√2/2','√2/2'],150:['−√3/2','1/2'],180:['−1','0'],210:['−√3/2','−1/2'],225:['−√2/2','−√2/2'],240:['−1/2','−√3/2'],270:['0','−1'],300:['1/2','−√3/2'],315:['√2/2','−√2/2'],330:['√3/2','−1/2']};
  const key=Object.keys(table).find(k=>Math.abs(+k-a)<1e-8),exact=key===undefined?null:table[key];
  const c=Math.cos(rad),s=Math.sin(rad);
  return {cos:Math.abs(c)<1e-12?0:c,sin:Math.abs(s)<1e-12?0:s,exact,radians:radiansLabel(degrees)};
}
export const relations={
  plusPi:{angle:'x + π',transform:x=>x+180,cos:'−cos x',sin:'−sin x',explain:['Un demi-tour change le signe des deux coordonnées.','A half-turn changes the sign of both coordinates.']},
  minusPi:{angle:'x − π',transform:x=>x-180,cos:'−cos x',sin:'−sin x',explain:['Un demi-tour dans l’autre sens donne aussi le point opposé.','A half-turn in the other direction also gives the opposite point.']},
  plusHalfPi:{angle:'x + π/2',transform:x=>x+90,cos:'−sin x',sin:'cos x',explain:['Un quart de tour direct transforme (a, b) en (−b, a).','A counterclockwise quarter-turn maps (a, b) to (−b, a).']},
  minusHalfPi:{angle:'x − π/2',transform:x=>x-90,cos:'sin x',sin:'−cos x',explain:['Un quart de tour horaire transforme (a, b) en (b, −a).','A clockwise quarter-turn maps (a, b) to (b, −a).']},
  opposite:{angle:'−x',transform:x=>-x,cos:'cos x',sin:'−sin x',explain:['La symétrie par rapport à l’axe cos conserve l’abscisse et change l’ordonnée.','Reflection in the cos axis keeps the horizontal coordinate and reverses the vertical one.']},
  supplementary:{angle:'π − x',transform:x=>180-x,cos:'−cos x',sin:'sin x',explain:['La symétrie par rapport à l’axe sin change l’abscisse et conserve l’ordonnée.','Reflection in the sin axis reverses the horizontal coordinate and keeps the vertical one.']},
  complementary:{angle:'π/2 − x',transform:x=>90-x,cos:'sin x',sin:'cos x',explain:['La symétrie par rapport à y = x échange les coordonnées.','Reflection in y = x swaps the coordinates.']},
  fullTurn:{angle:'x + 2π',transform:x=>x+360,cos:'cos x',sin:'sin x',explain:['Un tour complet ramène au même point : sinus et cosinus sont 2π-périodiques.','A full turn returns to the same point: sine and cosine are 2π-periodic.']},
};
const E=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function graphValues(degrees,relation='identity'){
  const r=relations[relation];
  const angle=r?r.transform(degrees):degrees;
  return {...trigValues(angle),angle,expression:r?r.angle:'x'};
}
function relationSelect(id,selected,t,includeIdentity=false){
  return `<label>${t(['Angle à explorer','Angle to explore'])}<select id="${id}">${includeIdentity?`<option value="identity" ${selected==='identity'?'selected':''}>x</option>`:''}${Object.entries(relations).map(([key,r])=>`<option value="${key}" ${selected===key?'selected':''}>${r.angle}</option>`).join('')}</select></label>`;
}
export function trigControls(s,t){
  const view=s.trigView||'angles';
  return `<section class="trig-tools" aria-label="${t(['Choisir une vue de trigonométrie','Choose a trigonometry view'])}"><div class="trig-tabs" role="group">${[['angles','Angles remarquables','Remarkable angles'],['identities','Angles associés','Associated angles'],['graphs','Cercle et courbes','Circle and graphs']].map(([id,fr,en])=>`<button data-trig-view="${id}" aria-pressed="${view===id}">${t([fr,en])}</button>`).join('')}</div>${view==='angles'?`<label>${t(['Choisir un angle remarquable','Choose a remarkable angle'])}<select id="remarkable-angle"><option value="">${t(['Angle libre avec le curseur','Free angle using the slider'])}</option>${remarkableAngles.map(d=>`<option value="${d}" ${s.values[0]===d?'selected':''}>${d}° = ${radiansLabel(d)}</option>`).join('')}</select></label>`:view==='identities'?`<label>${t(['Transformation de l’angle x','Transform angle x'])}<select id="trig-relation">${Object.entries(relations).map(([key,r])=>`<option value="${key}" ${(s.trigRelation||'plusPi')===key?'selected':''}>${r.angle}</option>`).join('')}</select></label><p class="muted">${t(['P correspond à x ; Q correspond à l’angle transformé. Les identités sont vraies pour tout réel x.','P represents x; Q represents the transformed angle. The identities hold for every real x.'])}</p>`:`${relationSelect("trig-graph-relation",s.trigGraphRelation||"identity",t,true)}<div class="trig-playback"><label>${t(['Fonction à tracer','Function to plot'])}<select id="trig-function">${[['sin','sin'],['cos','cos'],['both',t(['Les deux fonctions','Both functions'])]].map(([key,title])=>`<option value="${key}" ${(s.trigFunction||'sin')===key?'selected':''}>${title}</option>`).join('')}</select></label><button id="trig-play" class="secondary" aria-pressed="false">${t(['Lire le mouvement','Play the motion'])}</button></div>`}</section>`;
}
export function trigDiagram(degrees,s,t,fmt,handleAt){
  const view=s.trigView||'angles',q=trigValues(degrees),cx=185,cy=171,r=115,px=cx+r*q.cos,py=cy-r*q.sin;
  const value=(n,i)=>q.exact?q.exact[i]:'≈ '+fmt(n);
  const line=(x,y,a,b,c,dash=false)=>`<path d="M${x} ${y}L${a} ${b}" class="curve ${c}" ${dash?'stroke-dasharray="5 5"':''}/>`;
  const txt=(x,y,text,cl='',anchor='start')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cl}">${E(text)}</text>`;
  const fn=s.trigFunction||'sin',g=graphValues(degrees,s.trigGraphRelation),gx=cx+r*g.cos,gy=cy-r*g.sin;
  const graphValue=(n,i)=>g.exact?g.exact[i]:'≈ '+fmt(n);
  const ax=view==='graphs'?gx:px,ay=view==='graphs'?gy:py;
  const projection=(view!=='graphs'||fn!=='sin'?line(cx,cy,ax,cy,'orange'):'')+(view!=='graphs'||fn!=='cos'?line(ax,cy,ax,ay,'blue'):'');
  let figure=`<circle cx="${cx}" cy="${cy}" r="${r}" class="circle-grid"/><path d="M43 ${cy}H337M${cx} 25V320" class="axis"/>${txt(329,189,'cos','trig-axis')}${txt(197,22,'sin','trig-axis')}${txt(cx-12,cy+18,'O')}${txt(303,190,'1')}${txt(52,190,'−1')}${txt(197,62,'1')}${txt(197,294,'−1')}${line(cx,cy,px,py,'teal')}${projection}`;
  let formula='P = (cos x, sin x)',caption=t(['Le rayon vaut 1. L’abscisse est cos x ; l’ordonnée est sin x.','The radius is 1. The horizontal coordinate is cos x; the vertical coordinate is sin x.']);
  let rows=[[t(['Angle (degrés)','Angle (degrees)']),fmt(degrees)+'°'],['x (rad)',q.radians||'≈ '+fmt(degrees*Math.PI/180)],['cos x',value(q.cos,0)],['sin x',value(q.sin,1)]];
  if(view==='angles'){
    figure+=remarkableAngles.slice(0,-1).map(d=>{const a=d*Math.PI/180,x=cx+r*Math.cos(a),y=cy-r*Math.sin(a);return `<circle cx="${x}" cy="${y}" r="3" class="trig-mark"/>`+txt(cx+139*Math.cos(a),cy-139*Math.sin(a)+4,d===0?'0 · 2π':radiansLabel(d),'trig-angle','middle');}).join('');
    figure+=txt(390,69,t(q.exact?['Coordonnées exactes','Exact coordinates']:['Coordonnées du point','Point coordinates']),'svg-heading')+txt(390,113,`cos x = ${value(q.cos,0)}`,'trig-coordinate orange')+txt(390,151,`sin x = ${value(q.sin,1)}`,'trig-coordinate blue')+txt(390,208,`x = ${q.radians||fmt(degrees)+'π/180'} rad`)+txt(390,249,'cos² x + sin² x = 1')+txt(390,292,q.exact?t(['Valeurs exactes à cet angle.','Exact values at this angle.']):t(['Valeurs approchées à cet angle.','Approximate values at this angle.']));
  }else if(view==='identities'){
    const relation=relations[s.trigRelation||'plusPi'],a=relation.transform(degrees),v=trigValues(a),x=cx+r*v.cos,y=cy-r*v.sin;
    figure+=line(cx,cy,x,y,'blue',true)+`<circle cx="${x}" cy="${y}" r="6" class="point blue"/>`+txt(x+9,y+18,'Q','trig-axis')+txt(378,68,'Q = P('+relation.angle+')','svg-heading')+txt(378,118,`cos(${relation.angle}) = ${relation.cos}`,'trig-identity')+txt(378,163,`sin(${relation.angle}) = ${relation.sin}`,'trig-identity')+txt(378,218,`Q = (${v.exact?v.exact[0]:'≈ '+fmt(v.cos)} ; ${v.exact?v.exact[1]:'≈ '+fmt(v.sin)})`)+txt(378,266,t(['Angle de Q : ','Q angle: '])+(v.radians||'≈ '+fmt(a*Math.PI/180))+' rad');
    formula=`cos(${relation.angle}) = ${relation.cos} ; sin(${relation.angle}) = ${relation.sin}`;
    caption=t(relation.explain);
    rows.push([t(['Angle de Q (rad)','Q angle (rad)']),v.radians||'≈ '+fmt(a*Math.PI/180)],['cos('+relation.angle+')',v.exact?v.exact[0]:'≈ '+fmt(v.cos)],['sin('+relation.angle+')',v.exact?v.exact[1]:'≈ '+fmt(v.sin)]);
  }else{
    const L=390,R=690,Y=y=>cy-r*y,X=a=>L+(R-L)*a/360;
    figure+=txt(L,27,t(['Un angle, deux mouvements liés','One angle, two linked motions']),'svg-heading');
    if(g.expression!=='x')figure+=line(cx,cy,gx,gy,'blue',true)+`<circle cx="${gx}" cy="${gy}" r="6" class="point blue"/>`+txt(gx+9,gy+18,'Q','trig-axis');
    figure+=txt(cx,347,`${g.expression==='x'?'P':'Q'} : ${g.expression}`,'','middle');
    for(const [d,label] of [[0,'0'],[90,'π/2'],[180,'π'],[270,'3π/2'],[360,'2π']])figure+=`<path d="M${X(d)} 50V${cy+r}" class="gridline"/>`+txt(X(d),310,label,'','middle');
    for(const n of [-1,0,1])figure+=`<path d="M${L} ${Y(n)}H${R}" class="${n===0?'axis':'gridline'}"/>`+txt(L-9,Y(n)+4,n,'','end');
    figure+=txt(690,330,'x (rad)','trig-axis','end');
    for(const [name,color,i] of [['sin','blue',1],['cos','orange',0]]){
      if(fn!=='both'&&fn!==name)continue;
      const transform=relations[s.trigGraphRelation]?.transform||((a)=>a);
      const f=a=>{const v=Math[name](transform(a)*Math.PI/180);return Math.abs(v)<1e-12?0:v;},path=end=>{const count=Math.max(1,Math.ceil(end));return Array.from({length:count+1},(_,j)=>`${j?'L':'M'}${X(end*j/count).toFixed(2)} ${Y(f(end*j/count)).toFixed(2)}`).join(' ');};
      figure+=`<path d="${path(360)}" class="curve ${color} trig-future"/><path d="${path(degrees)}" class="curve ${color}"/><circle cx="${X(degrees)}" cy="${Y(f(degrees))}" r="5" class="point ${color}" data-curve="${name}" data-angle="${degrees}" data-value="${f(degrees)}"/>`+txt(L,339+i*26,`${name}(${g.expression}) = ${graphValue(f(degrees),i)}`,color);
      if(name==='sin')figure+=line(gx,gy,X(degrees),Y(g.sin),'blue',true);
      if(name==='cos')figure+=`<circle cx="${gx}" cy="${cy}" r="4" class="point orange"/><path d="M${gx} ${cy}L352 ${Y(g.cos)}H${X(degrees)}" class="curve orange" stroke-dasharray="5 5"/>`;
      rows.push([`y = ${name}(${g.expression})`,graphValue(f(degrees),i)]);
    }
    figure+=`<path d="M${X(degrees)} 45V${cy+r}" class="axis" stroke-dasharray="3 4"/>`;
    formula=(fn==='both'?['sin','cos']:[fn]).map(name=>`y = ${name}(${g.expression})`).join(' ; ');
    caption=t(['Sur la courbe, l’abscisse est x en radians. L’ordonnée reprend la coordonnée choisie sur le cercle : horizontale pour cos, verticale pour sin. P suit x ; Q suit l’angle transformé. Fais glisser P ou lance la lecture.','On the graph, the horizontal coordinate is x in radians. The vertical coordinate copies the selected circle coordinate: horizontal for cos, vertical for sin. P follows x; Q follows the transformed angle. Drag P or play the motion.']);
  }
  const title=t({angles:['angles remarquables','remarkable angles'],identities:['angles associés','associated angles'],graphs:['cercle et courbes','circle and graphs']}[view]);
  const pointHandle=handleAt(px,py,'angle','P').replace(/<text[^>]*class="handle-label"[^>]*>[\s\S]*?<\/text>/,`<text x="${cx+(r-24)*q.cos}" y="${cy-(r-24)*q.sin+4}" text-anchor="middle" class="handle-label">P</text>`);
  // Two coordinated panels can stack on a phone without shrinking the labels.
  const svg=`<div class="trig-diagram"><svg viewBox="0 0 365 380" role="group" aria-label="${t(['Cercle trigonométrique : ','Unit circle: '])}${E(title)}"><title>${E(formula)}</title>${figure}<g class="handle-layer">${pointHandle}</g></svg><svg viewBox="365 0 355 380" role="img" aria-label="${E(title)}"><title>${E(formula)}</title>${figure}</svg></div>`;
  return {svg,formula,caption,rows,q,graph:g,cos:value(q.cos,0),sin:value(q.sin,1)};
}
