// Cavalieri's principle (gallery exhibit, issue #30; maths in gallery-cavalieri-model.js). Warm-up: two stacks of cards,
// one pushed sideways, cut by the same horizontal plane. Main view: a hemisphere of radius R beside a cylinder of radius R
// and height R with a cone removed (apex at the bottom, base the top disc), both turnable, cut by one plane at height z:
// the disc π(R² − z²) and the ring πR² − πz² are equal. The question asks which solid is larger; the verdict comes after
// the plane has swept most of the height, and says that a few heights prove nothing: the algebra does, for every z.
import {exhibit,palette,orbitProject,dragOrbit,TAU} from './gallery-kit.js';
import {illuminateFeedback} from '../motion.js';
import {metricStrip} from './gallery-panels.js';
import {stack,cardAt,hemisphereRadius,volumeBelow} from './gallery-cavalieri-model.js';

const N=24,CARD={w:9,d:6,e:0.5};   // cards per stack, and the size of one card in cm (thick, to be seen)
export function cavalieriSolids(root,opts){
  const {t,lang}=opts,nf=new Intl.NumberFormat(lang==='fr'?'fr-FR':'en-GB',{minimumFractionDigits:2,maximumFractionDigits:2}),num=v=>nf.format(v);
  let mode='solids',z=0.4,shear=0,wave=false,answer=null,zMin=z,zMax=z;const view={yaw:-0.5,pitch:0.42};
  const o=exhibit(root,opts,t('Deux solides de même rayon R et de même hauteur R : une demi-boule, et un cylindre creusé d’un cône. Déplace le plan de coupe et compare les deux sections.','Two solids with the same radius R and the same height R: a hemisphere, and a cylinder with a cone dug out. Move the cutting plane and compare the two sections.'),
    `<fieldset class="act-choice"><legend>${t('Lequel a le plus grand volume ?','Which one has the larger volume?')}</legend>
       ${[t('la demi-boule','the hemisphere'),t('le cylindre creusé','the dug-out cylinder'),t('ils ont le même volume','they have the same volume')].map((c,i)=>`<label><input type="radio" name="cv-guess" value="${i}"> ${c}</label>`).join('')}</fieldset>
     <p class="feedback" id="cv-verdict" role="status"></p>
     <div class="act-buttons" role="group" aria-label="${t('Ce que montre la figure','What the figure shows')}">
       <button type="button" class="btn btn-secondary" data-mode="solids" aria-pressed="true">${t('Demi-boule et cylindre','Hemisphere and cylinder')}</button>
       <button type="button" class="btn btn-secondary" data-mode="cards" aria-pressed="false">${t('Échauffement : deux piles de cartes','Warm-up: two stacks of cards')}</button></div>
     <label class="ph-slider"><span>${t('Hauteur du plan de coupe','Height of the cutting plane')}</span><input type="range" id="cv-z" min="0" max="100" step="1" value="40"></label>
     <label class="ph-slider" id="cv-push-row" hidden><span>${t('Pousser la seconde pile','Push the second stack')}</span><input type="range" id="cv-push" min="-6" max="6" step="0.5" value="0"></label>
     <div class="act-buttons"><button type="button" class="btn btn-secondary" id="cv-wave" aria-pressed="false" hidden>${t('Onduler la pile','Make the stack wavy')}</button>
       <button type="button" class="btn btn-secondary" id="cv-turn">${t('Tourner la vue','Turn the view')}</button></div>`,
    `<ol>
      <li>${t('Le principe de Cavalieri : deux solides de même hauteur dont les sections, à chaque hauteur, ont la même aire, ont le même volume. Les cartes le font sentir : pousser une pile ne change aucune carte, donc ni l’aire coupée à chaque hauteur, ni le volume.','Cavalieri’s principle: two solids of the same height whose sections at every height have the same area have the same volume. The cards make it felt: pushing a stack changes no card, so neither the area cut at each height nor the volume.')}</li>
      <li>${t('Demi-boule : à la hauteur z, la section est un disque de rayon r, et Pythagore dans le triangle centre, centre du disque, bord donne r² + z² = R². Son aire est π(R² − z²).','Hemisphere: at height z the section is a disc of radius r, and Pythagoras in the triangle centre, centre of the disc, edge gives r² + z² = R². Its area is π(R² − z²).')}</li>
      <li>${t('Cylindre creusé : le cône a son sommet en bas et le rayon R à la hauteur R, donc le rayon z à la hauteur z (triangles semblables). La section est un anneau entre les rayons z et R, d’aire πR² − πz².','Dug-out cylinder: the cone has its apex at the bottom and radius R at height R, so radius z at height z (similar triangles). The section is a ring between the radii z and R, of area πR² − πz².')}</li>
      <li>${t('π(R² − z²) = πR² − πz² pour toutes les hauteurs z entre 0 et R. C’est ce calcul qui prouve l’égalité : les hauteurs essayées avec le curseur ne sont que des exemples, et des exemples ne prouvent rien.','π(R² − z²) = πR² − πz² for every height z between 0 and R. This computation is what proves the equality: the heights tried with the slider are only examples, and examples prove nothing.')}</li>
      <li>${t('Donc volume de la demi-boule = cylindre − cône = πR²·R − πR²·R/3 = 2πR³/3, et la boule entière a pour volume 4πR³/3.','So volume of the hemisphere = cylinder − cone = πR²·R − πR²·R/3 = 2πR³/3, and the whole ball has volume 4πR³/3.')}</li>
      <li>${t('Application : une boule percée d’un trou cylindrique, de hauteur h, a pour volume πh³/6, quel que soit le rayon de la boule. Les sections de l’anneau ont la même aire que celles d’une boule de diamètre h : voir l’anneau de serviette.','Application: a ball drilled through by a cylindrical hole, of height h, has volume πh³/6, whatever the radius of the ball. The sections of the ring have the same area as those of a ball of diameter h: see the napkin ring.')} <a href="#gallery/napkin-ring">${t('L’anneau de serviette','The napkin ring')}</a></li>
      <li>${t('À toi : un cylindre de rayon 3 et de hauteur 3 est creusé d’un cône de même base, sommet en bas. Quel est son volume ? (27π − 9π = 18π, le volume d’une demi-boule de rayon 3.)','Your turn: a cylinder of radius 3 and height 3 has a cone with the same base dug out, apex at the bottom. What is its volume? (27π − 9π = 18π, the volume of a hemisphere of radius 3.)')}</li>
    </ol>`);
  const g=o.g,stage=root.querySelector('.exhibit-stage'),controls=root.querySelector('.exhibit-controls'),top=document.createElement('div');
  top.className='exhibit-band';controls.classList.add('exhibit-band');
  top.append(...[...controls.children].filter(el=>el.matches('fieldset, .feedback')));stage.before(top);stage.after(controls);
  const hidden=t('à trouver','to find');
  const SS=metricStrip(controls,t,[{id:'z',label:t('Hauteur z du plan','Height z of the plane'),kind:'exact'},{id:'disc',label:t('Section de la demi-boule','Section of the hemisphere'),kind:'approx'},{id:'ring',label:t('Section du cylindre creusé','Section of the dug-out cylinder'),kind:'approx'},{id:'below',label:t('Volume sous le plan (les deux)','Volume below the plane (both)'),kind:'approx'}]);
  const SC=metricStrip(controls,t,[{id:'cw',label:t('Carte coupée, pile droite · pile poussée','Card cut, straight stack · pushed stack'),kind:'exact'},{id:'cv',label:t('Volume de chaque pile','Volume of each stack'),kind:'exact'},{id:'cf',label:t('Largeur au sol de la pile poussée','Width taken by the pushed stack'),kind:'exact'}]);
  const fb=root.querySelector('#cv-verdict'),swept=()=>zMax-zMin>=0.7;
  function verdict(){
    let text,cls='';
    if(answer==null)text=t('Choisis une réponse, puis fais monter et descendre le plan de coupe.','Choose an answer, then move the cutting plane up and down.');
    else if(!swept())text=t('Réponse notée. Promène le plan sur presque toute la hauteur en comparant les deux sections.','Answer noted. Move the plane over almost the whole height while comparing the two sections.');
    else{const ok=answer===2;cls=ok?'success':'error';text=(ok?t('Bien vu. ','Well spotted. '):t('Pas tout à fait. ','Not quite. '))+t('Les deux sections ont eu la même aire à chaque hauteur essayée, mais quelques hauteurs ne prouvent rien : le calcul π(R² − z²) = πR² − πz² le montre pour toutes. Même volume, 2πR³/3 : ouvre l’explication.','The two sections had the same area at every height tried, but a few heights prove nothing: the computation π(R² − z²) = πR² − πz² shows it for all of them. Same volume, 2πR³/3: open the explanation.');}
    if(fb.textContent!==text){const was=fb.className;fb.className='feedback'+(cls?' '+cls:'');fb.textContent=text;if(cls&&was!==fb.className)illuminateFeedback(fb,opts.reduced);}
  }
  const modeButtons=[...root.querySelectorAll('[data-mode]')],pushRow=root.querySelector('#cv-push-row'),waveBtn=root.querySelector('#cv-wave'),turnBtn=root.querySelector('#cv-turn');
  function setMode(m){mode=m;modeButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===m)));
    const cards=m==='cards';pushRow.hidden=!cards;waveBtn.hidden=!cards;turnBtn.hidden=cards;SS.el.hidden=cards;SC.el.hidden=!cards;
    o.cv.setAttribute('aria-label',cards?t('Deux piles de cartes coupées par un même plan horizontal ; la seconde est poussée de côté.','Two stacks of cards cut by one horizontal plane; the second is pushed sideways.'):t('Demi-boule et cylindre creusé d’un cône, coupés par un même plan. Glisser ou les flèches font tourner la vue.','Hemisphere and cylinder with a cone dug out, cut by one plane. Drag or use the arrow keys to turn the view.'));o.redraw();}
  modeButtons.forEach(b=>o.on(b,'click',()=>setMode(b.dataset.mode)));
  root.querySelectorAll('[name=cv-guess]').forEach(r=>o.on(r,'change',()=>{answer=+r.value;verdict();o.redraw();}));
  o.on(root.querySelector('#cv-z'),'input',e=>{z=+e.target.value/100;if(mode==='solids'){zMin=Math.min(zMin,z);zMax=Math.max(zMax,z);}verdict();o.redraw();});
  o.on(root.querySelector('#cv-push'),'input',e=>{shear=+e.target.value;o.redraw();});
  o.on(waveBtn,'click',()=>{wave=!wave;waveBtn.setAttribute('aria-pressed',String(wave));o.redraw();});
  o.on(turnBtn,'click',()=>{view.yaw+=Math.PI/6;o.redraw();});
  dragOrbit(o,view);

  // labels keep a readable size when the canvas is drawn smaller than 640 px (phones)
  const zoom=()=>Math.max(1,Math.min(2.2,640/(o.cv.clientWidth||640))),font=px=>`600 ${Math.round(px*zoom())}px system-ui`;
  const ring=(r,h,n=56)=>Array.from({length:n},(_,i)=>[r*Math.cos(i*TAU/n),r*Math.sin(i*TAU/n),h]);
  function drawSolids(C){
    const scale=Math.min(124,(o.W-24)/5.1),gap=1.3,lift=0;
    const P=(v,cx)=>{const q=orbitProject([v[0],v[1],v[2]-0.5],view.yaw,view.pitch,scale);return [q[0]+cx*scale-(320-o.W/2),q[1]+lift-(224-o.H/2)];};
    const poly=(pts,cx,close=true)=>{g.beginPath();pts.map(v=>P(v,cx)).forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));if(close)g.closePath();};
    const seg=(a,b,cx,col,w=1,dash=[])=>{const A=P(a,cx),B=P(b,cx);g.strokeStyle=col;g.lineWidth=w;g.setLineDash(dash);g.beginPath();g.moveTo(...A);g.lineTo(...B);g.stroke();g.setLineDash([]);};
    const sil=[-view.yaw,Math.PI-view.yaw];   // angles of the generators on the outline of the view
    const L=-gap,Rt=gap;
    // hemisphere: base, latitude rings, meridians
    g.strokeStyle=C.line;g.lineWidth=1;
    for(const h of [0.3,0.6,0.85]){poly(ring(hemisphereRadius(1,h),h),L);g.stroke();}
    for(let k=0;k<10;k++){const a=k*TAU/10;poly(Array.from({length:25},(_,i)=>{const u=i*Math.PI/48;return [Math.cos(u)*Math.cos(a),Math.cos(u)*Math.sin(a),Math.sin(u)];}),L,false);g.stroke();}
    g.strokeStyle=C.ink;g.lineWidth=2;poly(ring(1,0),L);g.stroke();
    for(const a of sil){poly(Array.from({length:25},(_,i)=>{const u=i*Math.PI/48;return [Math.cos(u)*Math.cos(a),Math.cos(u)*Math.sin(a),Math.sin(u)];}),L,false);g.stroke();}
    // cylinder and cone
    for(let k=0;k<10;k++){const a=k*TAU/10,c=Math.cos(a),s=Math.sin(a);seg([c,s,0],[c,s,1],Rt,C.line,1);seg([0,0,0],[c,s,1],Rt,C.c[2],1,[4,4]);}
    for(const a of sil){const c=Math.cos(a),s=Math.sin(a);seg([c,s,0],[c,s,1],Rt,C.ink,2);seg([0,0,0],[c,s,1],Rt,C.c[2],2);}
    g.strokeStyle=C.ink;g.lineWidth=2;poly(ring(1,0),Rt);g.stroke();poly(ring(1,1),Rt);g.stroke();
    // the cutting plane, one square around each solid at the same height
    for(const cx of [L,Rt]){poly([[-1.15,-1.15,z],[1.15,-1.15,z],[1.15,1.15,z],[-1.15,1.15,z]],cx);g.globalAlpha=.14;g.fillStyle=C.c[1];g.fill();g.globalAlpha=1;g.strokeStyle=C.c[1];g.lineWidth=1;g.stroke();}
    // the two sections: a disc, and a ring (even-odd fill between the radii z and R)
    g.globalAlpha=.7;g.fillStyle=C.object;poly(ring(hemisphereRadius(1,z),z),L);g.fill();
    g.beginPath();for(const r of [1,z]){ring(r,z).map(v=>P(v,Rt)).forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();}g.fill('evenodd');g.globalAlpha=1;
    g.strokeStyle=C.object;g.lineWidth=2.5;poly(ring(hemisphereRadius(1,z),z),L);g.stroke();poly(ring(1,z),Rt);g.stroke();if(z>0.02){poly(ring(z,z),Rt);g.stroke();}
    // labels under each solid
    g.fillStyle=C.ink;g.font=font(15);g.textAlign='center';
    const lab=(cx,s)=>{const p=P([0,0,-0.12],cx),q=P([0,1.1,-0.12],cx),y=Math.max(p[1],q[1])+22*zoom();g.fillText(s,p[0],Math.min(o.H-10,y));};
    lab(L,'π(R² − z²)');lab(Rt,'πR² − πz²');
  }
  function drawCards(C){
    const e=Math.min(12,(o.H-40-22*zoom())/N),w=Math.min(120,o.W*0.2),ground=o.H-16-22*zoom(),H=N*e;
    const A=stack({n:N,w,d:1,e,shear:0}),B=stack({n:N,w,d:1,e,shear:shear*e/12,wave:wave?w*0.3:0});
    const zz=Math.min(z*H,H-1e-6),cut=[cardAt(A,zz),cardAt(B,zz)];
    const x0=[o.W*0.27-w/2,o.W*0.66-w/2-(B.cards.at(-1).x+B.cards[0].x)/2];
    [A,B].forEach((S,j)=>S.cards.forEach((c,k)=>{const x=x0[j]+c.x,y=ground-c.y-c.h,hit=c===cut[j];
      g.fillStyle=hit?C.object:C.c[0];g.globalAlpha=hit?1:k%2?.4:.6;g.fillRect(x,y,c.w,c.h);g.globalAlpha=1;g.strokeStyle=C.ink;g.lineWidth=.8;g.strokeRect(x,y,c.w,c.h);}));
    g.strokeStyle=C.ink;g.lineWidth=2;g.beginPath();g.moveTo(16,ground);g.lineTo(o.W-16,ground);g.stroke();
    const yz=ground-zz;g.strokeStyle=C.c[1];g.lineWidth=2;g.setLineDash([7,5]);g.beginPath();g.moveTo(16,yz);g.lineTo(o.W-16,yz);g.stroke();g.setLineDash([]);
    g.fillStyle=C.ink;g.font=font(15);g.textAlign='center';
    g.fillText(t('pile droite','straight stack'),x0[0]+w/2,ground+20*zoom());g.fillText(t('pile poussée','pushed stack'),o.W*0.66,ground+20*zoom());
    return {A,B,cut};
  }
  o.animate(()=>{
    const C=palette();g.clearRect(0,0,o.W,o.H);g.fillStyle=C.sunken;g.fillRect(0,0,o.W,o.H);
    if(mode==='solids'){drawSolids(C);
      const s=1-z*z;SS.set('z',`${num(z)} R`);SS.set('disc',`${num(s)} πR²`);SS.set('ring',`${num(1-z*z)} πR²`);
      SS.set('below',answer==null?hidden:`${num(volumeBelow(1,z)/Math.PI)} πR³`);
      o.read(t(`À la hauteur ${num(z)} R, les deux sections valent ${num(s)} πR².`,`At height ${num(z)} R, both sections are ${num(s)} πR².`));
    }else{const {A,B,cut}=drawCards(C),cm=CARD.w/A.cards[0].w;   // the drawing in pixels, read in centimetres
      SC.set('cw',`${num(cut[0].w*cm)} cm · ${num(cut[1].w*cm)} cm`);SC.set('cv',`${N} × ${num(CARD.w)} × ${num(CARD.d)} × ${num(CARD.e)} = ${num(N*CARD.w*CARD.d*CARD.e)} cm³`);SC.set('cf',`${num(B.footprint*cm)} cm`);
      o.read(t('Les deux piles ont les mêmes cartes : même largeur coupée à chaque hauteur, même volume.','Both stacks have the same cards: the same width cut at every height, the same volume.'));}
    return false;
  });
  setMode('solids');verdict();
  return ()=>{o.stop();SS.el.remove();SC.el.remove();};
}
