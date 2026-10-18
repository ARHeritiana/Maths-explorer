// Knot space, a closed-braid Reidemeister workbench, a verified mirror movie, and interactive Fox tricolourings.
import {KNOTS,braidColors,colorings,knotComponents,braidMove,mirrorSequence,MIRROR_MOVES,moveStrands,spaceKnot} from './gallery-knot-model.js';
import {exhibit,background,path,dot,button,field,bind,orbitProject,dragOrbit} from './gallery-kit.js';
export function knotsInSpace(root,opts){
  const {t}=opts;let kind='figure8',state=copy(KNOTS.figure8),mode='space',mirrored=false,colors=[0,0,0],index=0,generator=1,timeline=false,stage=0,phase=0,playing=false,manualMove=null,message='',dirty=true,cachedColors=[];
  const view={yaw:-.4,pitch:.6},states=mirrorSequence();
  const names={unknot:t('Cercle non noué 0₁','Unknot 0₁'),trefoil:t('Trèfle 3₁','Trefoil 3₁'),figure8:t('Nœud en huit 4₁','Figure-eight 4₁')};
  function copy(s){return {n:s.n,word:[...s.word]};}
  const o=exhibit(root,opts,t('Tourne le nœud dans l’espace, puis passe aux diagrammes. Un fil ne traverse jamais un autre fil pendant une déformation autorisée. Dans l’atelier, choisis un emplacement et applique un mouvement ; dans la vue couleurs, touche les pastilles pour tenter une tricoloration.','Rotate the knot in space, then explore diagrams. A strand never passes through another during an allowed deformation. In the workbench, choose a position and apply a move; in the colour view, tap the swatches to attempt a tricolouring.'),
    `<label class="act-field"><span class="act-label">${t('Nœud','Knot')}</span><select id="kn-knot">${Object.entries(names).map(([id,name])=>`<option value="${id}" ${id===kind?'selected':''}>${name}</option>`).join('')}</select></label><label class="act-field"><span class="act-label">${t('Explorer','Explore')}</span><select id="kn-mode"><option value="space">${t('Dans l’espace','In space')}</option><option value="moves">${t('Mouvements de Reidemeister','Reidemeister moves')}</option><option value="colors">${t('Tricoloration','Tricolouring')}</option></select></label><label class="act-check"><input type="checkbox" id="kn-mirror">${t('Image dans un miroir','Mirror image')}</label>`+
    button('kn-movie',t('Le huit devient son miroir','Turn the figure-eight into its mirror'),true)+
    `<div id="kn-work" class="exhibit-subcontrols" hidden>${field('kn-index',t('Emplacement dans le diagramme','Position in the diagram'),0,4,1,0)}<label class="act-field"><span class="act-label">${t('Paire de brins','Strand pair')}</span><select id="kn-generator"></select></label><div class="exhibit-presets">${[['RI+',t('I : ajouter une boucle','I: add a curl')],['RI-',t('I : enlever une boucle','I: remove a curl')],['RII+',t('II : ajouter deux croisements','II: add two crossings')],['RII-',t('II : enlever deux croisements','II: remove two crossings')],['RIII',t('III : faire glisser un brin','III: slide a strand')],['seam',t('Déplacer la couture','Move the seam')]].map(([id,label])=>button(`kn-${id}`,label)).join('')}${button('kn-undo',t('Annuler','Undo'))}</div></div>`+
    `<div id="kn-colors" class="exhibit-subcontrols" hidden><p>${t('Choisis la couleur de chaque entrée. Les autres couleurs sont déduites de la règle aux croisements.','Choose the colour of each input. The remaining colours follow the crossing rule.')}</p><div id="kn-swatches" class="exhibit-presets"></div>${button('kn-find',t('Montrer une coloration possible','Show a possible colouring'))}</div>`+
    `<div id="kn-timeline" class="exhibit-subcontrols" hidden>${field('kn-frame',t('Étape de la transformation','Transformation step'),0,16,1,0)}${button('kn-play',t('Lire / suspendre','Play / pause'))}${button('kn-next',t('Étape suivante','Next step'))}</div>`,
    `<p>${t('I ajoute ou retire une boucle. II ajoute ou retire une paire de croisements opposés. III fait passer un brin au-dessus ou au-dessous d’un croisement, sans couper. Les mouvements sont appliqués à un diagramme de tresse refermée ; déplacer sa couture est une déformation du même nœud, distincte des trois mouvements.','I adds or removes a curl. II adds or removes a pair of opposite crossings. III slides a strand over or under a crossing without cutting. Moves act on a closed braid diagram; moving its seam is a deformation of the same knot, distinct from the three moves.')}</p><p>${t('Le film du huit comporte 12 mouvements II/III et 4 déplacements de couture. À droite, le gros plan montre la déformation locale en trois dimensions ; à gauche, les diagrammes successifs montrent où elle s’applique. La projection peut avoir une tangence ou un point triple, mais les fils restent séparés en profondeur.','The figure-eight movie contains 12 II/III moves and 4 seam shifts. At right, the close-up shows the local three-dimensional deformation; at left, successive diagrams show where it applies. The projection can have a tangency or triple point while strands stay separated in depth.')}</p><p>${t('Tricoloration : à chaque croisement, les trois arcs sont tous de même couleur ou tous de couleurs différentes. Une coloration non constante utilise plusieurs couleurs et respecte la fermeture. Les nombres de colorations, y compris les trois monochromes, valent 3 pour le cercle, 9 pour le trèfle, 3 pour le huit. Donc le trèfle diffère des deux autres. Le même nombre ne prouve pas que deux nœuds sont équivalents ; cet invariant ne distingue pas un nœud de son miroir.','Tricolouring: at each crossing the three arcs are all the same colour or all different. A nonconstant colouring uses several colours and respects closure. Counts, including the three monochrome colourings, are 3 for the unknot, 9 for the trefoil, 3 for the figure-eight. Therefore the trefoil differs from the other two. Equal counts do not prove equivalence; this invariant cannot distinguish a knot from its mirror.')}</p><p>2c<sub>${t('dessus','over')}</sub> ≡ c<sub>${t('dessous 1','under 1')}</sub> + c<sub>${t('dessous 2','under 2')}</sub> (mod 3).</p><p><a href="https://knotinfo.org/" target="_blank" rel="noopener noreferrer">KnotInfo : ${t('tables de nœuds','knot tables')}</a> · <a href="https://katlas.org/wiki/The_Rolfsen_Knot_Table" target="_blank" rel="noopener noreferrer">${t('Table de Rolfsen','Rolfsen table')}</a> · <a href="https://katlas.org/wiki/4_1" target="_blank" rel="noopener noreferrer">4₁</a> · <a href="https://homepages.math.uic.edu/~kauffman/Tots/Knots.htm" target="_blank" rel="noopener noreferrer">${t('Mouvements et couleurs · Kauffman','Moves and colours · Kauffman')}</a></p>`);
  const g=o.g,undo=[];
  function changed(){dirty=true;index=Math.min(index,state.word.length);colors=Array.from({length:state.n},(_,i)=>colors[i]??0);sync();o.redraw();}
  function sync(){
    root.querySelector('#kn-mode').value=mode;root.querySelector('#kn-work').hidden=mode!=='moves'||timeline;root.querySelector('#kn-colors').hidden=mode!=='colors';root.querySelector('#kn-timeline').hidden=!timeline;
    root.querySelector('#kn-index').max=state.word.length;root.querySelector('#kn-index').value=index;root.querySelector('#kn-index-out').textContent=index;
    const select=root.querySelector('#kn-generator');select.innerHTML=Array.from({length:Math.max(0,state.n-1)},(_,i)=>[i+1,-i-1]).flat().map(v=>`<option value="${v}">${Math.abs(v)} ↔ ${Math.abs(v)+1} (${v>0?'+':'−'})</option>`).join('');if(Math.abs(generator)>=state.n)generator=1;select.value=generator;select.disabled=state.n<2;select.closest('label').hidden=state.n<2;
    const focused=root.contains(document.activeElement)?document.activeElement?.dataset?.color:null;const C=backgroundPalette();root.querySelector('#kn-swatches').innerHTML=colors.map((c,i)=>`<button type="button" class="btn kn-swatch" data-color="${i}" style="border-color:${C[c]};color:${C[c]}" aria-label="${t('Couleur de l’entrée','Input colour')} ${i+1}: ${c+1}">${i+1} : ${c+1}</button>`).join('');
    if(focused!==null&&focused!==undefined)root.querySelector(`[data-color="${focused}"]`)?.focus({preventScroll:true});
    root.querySelector('#kn-frame').value=stage;root.querySelector('#kn-frame-out').textContent=`${stage} / 16`;root.querySelector('#kn-next').disabled=stage>=16;
    for(const type of ['RI+','RI-','RII+','RII-','RIII','seam'])root.querySelector(`[id="kn-${type}"]`).disabled=!braidMove(state,type,index,generator);
    root.querySelector('#kn-undo').disabled=!undo.length;
  }
  function backgroundPalette(){const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();return [css('--accent'),css('--obj2'),css('--pos')];}
  function pick(){state=copy(KNOTS[kind]);if(mirrored)state.word=state.word.map(x=>-x);colors=Array(state.n).fill(0);timeline=playing=false;stage=index=0;undo.length=0;message='';manualMove=null;changed();}
  o.on(root.querySelector('#kn-knot'),'change',e=>{kind=e.target.value;pick();});
  o.on(root.querySelector('#kn-mode'),'change',e=>{mode=e.target.value;playing=false;timeline=false;sync();o.redraw();});
  o.on(root.querySelector('#kn-mirror'),'change',e=>{mirrored=e.target.checked;pick();});
  bind(root,'kn-index',v=>{index=v;sync();o.redraw();});
  o.on(root.querySelector('#kn-generator'),'change',e=>{generator=Number(e.target.value);sync();});
  for(const type of ['RI+','RI-','RII+','RII-','RIII','seam'])o.on(root.querySelector(`[id="kn-${type}"]`),'click',()=>{const next=braidMove(state,type,index,generator);if(!next)return;undo.push({state:copy(state),colors:[...colors]});manualMove={type,index,g:generator,before:copy(state)};if(type==='RI+')colors.push(colors.at(-1));if(type==='RI-')colors.pop();if(type==='seam')colors=braidColors(state.n,state.word.slice(0,index),colors).end;phase=0;state=next;playing=false;message=t('Mouvement autorisé appliqué.','Legal move applied.');changed();});
  o.on(root.querySelector('#kn-undo'),'click',()=>{const prev=undo.pop();if(prev){state=prev.state;colors=prev.colors;manualMove=null;changed();}});
  o.on(root.querySelector('#kn-swatches'),'click',e=>{const b=e.target.closest('[data-color]');if(!b)return;const k=Number(b.dataset.color);colors[k]=(colors[k]+1)%3;sync();o.redraw();});
  o.on(root.querySelector('#kn-find'),'click',()=>{const all=colorings(state.n,state.word);colors=[...(all.find(c=>new Set(c).size>1)||all[0])];message=all.some(c=>new Set(c).size>1)?t('Voici une coloration non constante.','Here is a nonconstant colouring.'):t('Seules les trois colorations monochromes existent pour ce nœud.','Only the three monochrome colourings exist for this knot.');sync();o.redraw();});
  function setStage(v){stage=Math.max(0,Math.min(16,v));state=copy(states[stage]);phase=0;manualMove=null;changed();}
  bind(root,'kn-frame',v=>{playing=false;setStage(v);});
  o.on(root.querySelector('#kn-movie'),'click',()=>{kind='figure8';message='';mirrored=false;root.querySelector('#kn-knot').value=kind;root.querySelector('#kn-mirror').checked=false;mode='moves';timeline=true;playing=!opts.reduced();setStage(0);});
  o.on(root.querySelector('#kn-play'),'click',()=>{if(stage===16)setStage(0);playing=!playing;if(opts.reduced()){playing=false;setStage(stage+1);}sync();});
  o.on(root.querySelector('#kn-next'),'click',()=>{playing=false;setStage(stage+1);});
  dragOrbit(o,view);
  function tube(points,colors,C,width=7){
    const segments=points.slice(1).map((p,i)=>({a:points[i],b:p,z:(points[i][2]+p[2])/2,i})).sort((a,b)=>a.z-b.z);
    g.lineCap='round';for(const s of segments){path(g,[s.a,s.b],{stroke:C.sunken,width:width+4});path(g,[s.a,s.b],{stroke:colors[s.i%colors.length],width});}
  }
  function braidDiagram(C){
    const w=state.word,n=state.n,m=Math.max(1,w.length),top=66,height=300,row=height/m,spacing=Math.min(68,180/Math.max(1,n-1)),left=90,col=braidColors(n,w,colors),pal=mode==='colors'?backgroundPalette():Array(3).fill(C.accent),X=j=>left+j*spacing;
    // Closing arcs are nested outside the braid, with the leftmost arc outermost.
    for(let j=0;j<n;j++){const outer=left+(n-1)*spacing+28+(n-j)*13,up=top-12-(n-j)*5,down=top+height+12+(n-j)*5;path(g,[[X(j),top],[X(j),up],[outer,up],[outer,down],[X(j),down],[X(j),top+height]],{stroke:pal[colors[j]],width:2.3,alpha:.55});}
    for(let r=0;r<m;r++){
      const v=w[r]||0,k=Math.abs(v)-1,y0=top+r*row,y1=y0+row,inputs=col.rows[r]||colors,outputs=col.rows[r+1]||colors;
      const move=timeline&&stage<16?MIRROR_MOVES[stage]:manualMove?[manualMove.type,manualMove.index]:null,active=move&&r>=move[1]&&r<move[1]+(move[0]==='RIII'?3:2);
      if(active){g.fillStyle=C.obj2;g.globalAlpha=.12;g.fillRect(55,y0,260,row);g.globalAlpha=1;}
      for(let j=0;j<n;j++)if(j!==k&&j!==k+1)path(g,[[X(j),y0],[X(j),y1]],{stroke:pal[inputs[j]],width:5});
      if(v){const over=v>0?k:k+1,under=v>0?k+1:k,a=[[X(k),y0],[X(k+1),y1]],b=[[X(k+1),y0],[X(k),y1]],lerp=(p,q,u)=>p.map((x,i)=>x+(q[i]-x)*u),underPath=under===k?a:b,overPath=over===k?a:b;
        path(g,[underPath[0],lerp(...underPath,.39)],{stroke:pal[inputs[under]],width:5});path(g,[lerp(...underPath,.61),underPath[1]],{stroke:pal[outputs[under===k?k+1:k]],width:5});path(g,overPath,{stroke:C.sunken,width:10});path(g,overPath,{stroke:pal[inputs[over]],width:5});
      }else path(g,[[X(0),y0],[X(0),y1]],{stroke:pal[colors[0]],width:5});
      g.fillStyle=C.muted;g.font='11px system-ui';g.textAlign='right';g.fillText(String(r),49,y0+row*.6);
    }
    for(let j=0;j<n;j++){dot(g,[X(j),top-3],pal[colors[j]],5);dot(g,[X(j),top+height+3],mode==='colors'&&!col.closed?C.neg:pal[col.end[j]],5);}
    if(mode==='colors'){g.fillStyle=col.closed?C.pos:C.neg;g.font='bold 14px system-ui';g.textAlign='left';g.fillText(col.closed?t('Fermeture cohérente','Closure agrees'):t('Couleurs différentes à la fermeture','Colours disagree at closure'),30,427);}
    return col;
  }
  function localMovie(C,move){
    const type=move[0];g.fillStyle=C.ink;g.font='bold 16px system-ui';g.textAlign='center';g.fillText(type==='seam'?t('Déplacer la couture','Move the seam'):type.startsWith('RI')&&!type.startsWith('RII')?t('I : une boucle','I: a curl'):`${type.replace(/[+-]/g,'')} : ${t('gros plan 3D','3D close-up')}`,470,63);
    if(type==='seam'){const a=phase*2*Math.PI;path(g,Array.from({length:101},(_,i)=>[470+80*Math.cos(i/100*2*Math.PI),225+95*Math.sin(i/100*2*Math.PI)]),{stroke:C.accent,width:7});dot(g,[470+80*Math.cos(a),225+95*Math.sin(a)],C.obj2,10);g.fillStyle=C.muted;g.font='13px system-ui';g.fillText(t('Même boucle, autre point de départ','Same loop, another starting point'),470,368);return;}
    const before=timeline?states[stage]:(manualMove?.before||state),sgn=type==='RIII'?Math.sign(before.word[move[1]]||1):Math.sign(((type==='RII+'||type==='RI+')?move[2]:type==='RI-'?before.word.at(-1):before.word[move[1]])||1);let p=Math.min(1,phase/1.7);
    if(type==='RII-'||type==='RI-')p=1-p;if(type==='RIII'&&Math.abs(before.word[move[1]])===2)p=1-p;
    const strands=moveStrands(type==='RIII'?'RIII':(type==='RI+'||type==='RI-')?'RI':'RII',p,sgn),pal=[C.accent,C.obj2,C.obj3],all=[];
    strands.forEach((s,j)=>s.slice(1).forEach((b,i)=>{const transform=([x,y,z])=>[470+65*x+25*z,220+108*y-42*z,z];all.push({a:transform(s[i]),b:transform(b),z:(s[i][2]+b[2])/2,color:pal[j]});}));all.sort((a,b)=>a.z-b.z);g.lineCap='round';for(const s of all){path(g,[s.a,s.b],{stroke:C.sunken,width:12});path(g,[s.a,s.b],{stroke:s.color,width:7});}
    g.fillStyle=C.muted;g.font='13px system-ui';g.fillText(t('Les profondeurs séparent les brins.','Depth separates the strands.'),470,368);
  }
  let frame=0;
  o.animate(dt=>{
    if(timeline&&playing&&dt&&stage<16){phase+=dt;if(phase>=2.7){const keep=playing;setStage(stage+1);playing=keep&&stage<16;}}
    else if(manualMove&&dt)phase=Math.min(2.7,phase+dt);
    if(dirty){cachedColors=colorings(state.n,state.word);dirty=false;}
    const C=background(o);g.textAlign='center';g.font='bold 17px system-ui';g.fillStyle=C.ink;
    if(mode==='space'){
      const P=Array.from({length:501},(_,i)=>orbitProject(spaceKnot(kind,i/500,mirrored),view.yaw,view.pitch,99));tube(P,[C.accent],C,9);g.fillText(names[kind],320,30);o.read(t('Glisse pour tourner. La profondeur conserve les passages dessus et dessous.','Drag to rotate. Depth preserves overpasses and underpasses.'));
    }else{
      const col=braidDiagram(C),move=timeline&&stage<16?MIRROR_MOVES[stage]:manualMove;
      if(mode==='moves'&&move)localMovie(C,Array.isArray(move)?move:[move.type,move.index,move.g]);else if(mode==='moves'&&stage===16&&timeline){g.fillStyle=C.pos;g.fillText(t('Image miroir obtenue','Mirror image reached'),468,210);g.font='14px system-ui';g.fillText(t('Sans couper ni traverser un fil.','Without cutting or crossing through a strand.'),468,242);}
      else if(mode==='colors'){g.fillStyle=C.ink;g.font='bold 18px system-ui';g.fillText(`${cachedColors.length} ${t('colorations','colourings')}`,480,170);g.font='14px system-ui';g.fillText(`${cachedColors.filter(c=>new Set(c).size>1).length} ${t('non constantes','nonconstant')}`,480,202);g.fillText(t('Cercle : 3 · Trèfle : 9 · Huit : 3','Unknot: 3 · Trefoil: 9 · Figure-eight: 3'),460,260);}
      if(++frame%12===0||!dt)o.read(`${timeline?`${t('Étape','Step')} ${stage}/16 · `:''}${state.word.length} ${t('croisements dans ce diagramme','crossings in this diagram')} · ${knotComponents(state.n,state.word)} ${t('composante','component')} · ${cachedColors.length} ${t('colorations, dont','colourings, including')} ${cachedColors.length-3} ${t('non constantes','nonconstant')}. ${mode==='colors'?(col.closed?(col.nonconstant?t('Coloration non constante valide.','Valid nonconstant colouring.'):t('Coloration monochrome valide.','Valid monochrome colouring.')):t('La fermeture ne respecte pas les couleurs.','Closure does not respect the colours.')):message}`);
    }
  });changed();return o.stop;
}
