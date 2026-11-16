// The napkin-ring paradox (gallery exhibit; maths in gallery-napkin-model.js): two spheres of different radii, each drilled through,
// side by side and cut open at a level you choose. With the same height the two rings have the same volume; with the same hole they do not.
import {exhibit,field,bind,palette,orbitProject,dragOrbit,TAU} from './gallery-kit.js';
import {holeRadius,height,sliceOuter,sliceArea,volume} from './gallery-napkin-model.js';
export function napkinRing(root,opts){
  const {t,lang}=opts,num=(v,d=2)=>lang==='fr'?v.toFixed(d).replace('.',','):v.toFixed(d);
  const st={yaw:-.5,pitch:.55,RA:4,RB:8,h:6,r:2,mode:'height',cut:.4};
  const o=exhibit(root,opts,t('Deux sphères de rayons différents sont percées de part en part : il reste un anneau. Compare leurs volumes avant de bouger quoi que ce soit, puis règle les rayons. Glisse sur la figure pour la tourner.','Two spheres of different radii are drilled right through, leaving a ring. Compare their volumes before touching anything, then set the radii. Drag the figure to turn it.'),
    `<label class="act-field exhibit-select"><span class="act-label">${t('On garde','Keep the same')}</span><select id="nr-mode"><option value="height">${t('la même hauteur h','height h')}</option><option value="hole">${t('le même trou (rayon r)','hole radius r')}</option></select></label>`+
    field('nr-ra',t('Rayon de la sphère de gauche (cm)','Radius of the left sphere (cm)'),3,8,.5,st.RA)+field('nr-rb',t('Rayon de la sphère de droite (cm)','Radius of the right sphere (cm)'),3,8,.5,st.RB)+
    field('nr-h',t('Hauteur h de l’anneau (cm)','Height h of the ring (cm)'),1,6,.5,st.h)+field('nr-r',t('Rayon r du trou (cm)','Radius r of the hole (cm)'),.5,2.9,.1,st.r)+field('nr-cut',t('Niveau de la coupe','Level of the cut'),-1,1,.05,st.cut),
    `<p>${t('Flèches : tourner la figure. Chaque coupe horizontale est une couronne ; sa surface est donnée sous chaque anneau.','Arrows: turn the figure. Each horizontal cut is an annulus; its area is written under each ring.')}</p>`);
  const g=o.g,root$=s=>root.querySelector(s);
  const dims=()=>{const same=st.mode==='height';const hs=[st.RA,st.RB].map(R=>same?Math.min(st.h,2*R-1e-6):height(R,Math.min(st.r,R-.05)));return [st.RA,st.RB].map((R,i)=>({R,h:hs[i],r:holeRadius(R,hs[i])}));};
  const sync=()=>{root$('#nr-h').disabled=st.mode!=='height';root$('#nr-r').disabled=st.mode!=='hole';o.redraw();};
  o.on(root$('#nr-mode'),'change',e=>{st.mode=e.target.value;sync();});
  bind(root,'nr-ra',v=>{st.RA=v;o.redraw();});bind(root,'nr-rb',v=>{st.RB=v;o.redraw();});bind(root,'nr-h',v=>{st.h=v;o.redraw();});bind(root,'nr-r',v=>{st.r=v;o.redraw();},v=>num(v,1));bind(root,'nr-cut',v=>{st.cut=v;o.redraw();},v=>num(v,2));
  dragOrbit(o,st);
  const light=[.4,-.5,.75],shade=(n,c)=>{const l=Math.hypot(...light),d=Math.max(0,(n[0]*light[0]+n[1]*light[1]+n[2]*light[2])/l);return .55+.45*d;};
  function quads(d,z0,S,cx,C){
    const out=[],N=36,M=8,P=(x,y,z)=>{const p=orbitProject([x,y,z],st.yaw,st.pitch,S);return [p[0]-320+cx,p[1]-224+190,p[2]];};
    const zs=Array.from({length:M+1},(_,k)=>-d.h/2+(z0+d.h/2)*k/M);
    for(let a=0;a<N;a++){const a0=a/N*TAU,a1=(a+1)/N*TAU,am=(a0+a1)/2;
      for(let k=0;k<M;k++){const za=zs[k],zb=zs[k+1],ra=sliceOuter(d.R,za),rb=sliceOuter(d.R,zb),zm=(za+zb)/2,rm=sliceOuter(d.R,zm);
        out.push({pts:[P(ra*Math.cos(a0),ra*Math.sin(a0),za),P(ra*Math.cos(a1),ra*Math.sin(a1),za),P(rb*Math.cos(a1),rb*Math.sin(a1),zb),P(rb*Math.cos(a0),rb*Math.sin(a0),zb)],f:shade([Math.cos(am)*rm,Math.sin(am)*rm,zm],C),col:C.accent});
        out.push({pts:[P(d.r*Math.cos(a0),d.r*Math.sin(a0),za),P(d.r*Math.cos(a1),d.r*Math.sin(a1),za),P(d.r*Math.cos(a1),d.r*Math.sin(a1),zb),P(d.r*Math.cos(a0),d.r*Math.sin(a0),zb)],f:shade([-Math.cos(am),-Math.sin(am),0],C)*.8,col:C.muted});}
      const ro=sliceOuter(d.R,z0);
      out.push({pts:[P(d.r*Math.cos(a0),d.r*Math.sin(a0),z0),P(ro*Math.cos(a0),ro*Math.sin(a0),z0),P(ro*Math.cos(a1),ro*Math.sin(a1),z0),P(d.r*Math.cos(a1),d.r*Math.sin(a1),z0)],f:1,col:C.obj2,cap:true});}
    return out;
  }
  o.onResize=()=>o.redraw();
  o.animate(()=>{
    const C=palette(),D=dims();g.clearRect(0,0,o.W,o.H);g.fillStyle=C.sunken;g.fillRect(-2000,-2000,4640,4440);
    const S=Math.min(17,270/(2*Math.max(...D.map(d=>d.R))));
    D.forEach((d,i)=>{
      const cx=i?480:160,z0=st.cut*d.h/2;
      const qs=quads(d,z0,S,cx,C).sort((p,q)=>(q.pts.reduce((s,x)=>s+x[2],0)-p.pts.reduce((s,x)=>s+x[2],0)));
      qs.forEach(q=>{g.beginPath();q.pts.forEach((p,k)=>k?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fillStyle=q.col;g.globalAlpha=1;g.fillStyle=q.col;g.fill();if(!q.cap){g.fillStyle='#10131a';g.globalAlpha=(1-Math.min(1,q.f))*.6;g.fill();g.globalAlpha=1;}g.globalAlpha=q.cap?.5:.12;g.strokeStyle=C.ink;g.lineWidth=.5;g.stroke();});
      g.globalAlpha=1;
      g.fillStyle=C.ink;g.font='bold 14px system-ui';g.textAlign='center';g.fillText(`${t('Sphère','Sphere')} R = ${num(d.R,1)} cm`,cx,28);
      g.font='13px system-ui';g.fillStyle=C.muted;g.fillText(`r = ${num(d.r,3)} cm · h = ${num(d.h,2)} cm`,cx,360);
      g.fillText(`${t('Coupe : aire','Cut: area')} = ${num(sliceArea(d.R,d.h,z0),2)} cm²`,cx,380);
      g.fillStyle=C.ink;g.font='bold 15px system-ui';g.fillText(`V = ${num(volume(d.h),2)} cm³`,cx,404);
    });
    const same=Math.abs(volume(D[0].h)-volume(D[1].h))<1e-9;
    g.textAlign='center';g.font='bold 16px system-ui';g.fillStyle=same?C.pos:C.neg;g.fillText(same?t('Même volume','Same volume'):t('Volumes différents','Different volumes'),320,430);
    o.read(`${t('Gauche','Left')} V = ${num(volume(D[0].h),3)} cm³ · ${t('droite','right')} V = ${num(volume(D[1].h),3)} cm³ · π h³ / 6`);
    return false;
  });
  sync();
  return o.stop;
}
