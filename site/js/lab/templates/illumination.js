// The mirrored room in the laboratory: the shared canvas of ../../illumination-view.js (light, dark zones, rays, room editor)
// with a compact toolbar; the shell's controls (room, reflections, rays, direction, speed) and missions drive the same state.
export {createStage} from './inference.js';
import {createRoomView,isCustom,lightBounces} from '../../illumination-view.js';
import {PRESETS} from '../../illumination-presets.js';
export function mount({stage,fmt,getState,setState,refresh}){
 const t=(fr,en)=>fmt.t([fr,en]),root=stage.wrap,lang=t('fr','en'),locale=lang==='fr'?'fr-FR':'en-GB',n=x=>x.toLocaleString(locale,{maximumFractionDigits:2});
 const b=(id,label,pressed)=>`<button type="button" class="btn btn-secondary" data-act="${id}"${pressed===undefined?'':` aria-pressed="${pressed}"`}>${label}</button>`;
 root.innerHTML=`<div class="room-lab"><div class="room-lab-bar" role="toolbar" aria-label="${t('Outils de la pièce','Room tools')}">
  <span class="room-lab-tools" role="radiogroup" aria-label="${t('Outil','Tool')}"><button type="button" role="radio" data-tool="lamp">${t('Lampe','Lamp')}</button><button type="button" role="radio" data-tool="draw">${t('Murs','Walls')}</button><button type="button" role="radio" data-tool="curve">${t('Courber','Curve')}</button></span>
  ${b('light',t('Lumière','Light'),true)}${b('rays',t('Rayons','Rays'),true)}${b('play',t('Faire voyager les rayons','Send the rays travelling'))}${b('step',t('Un pas','One step'))}${b('lightplay',t('Allumer réflexion par réflexion','Light up reflection by reflection'))}${b('unfold',t('Déplier le premier rayon','Unfold the first ray'),false)}${b('new',t('Nouvelle pièce','New room'))}${b('close',t('Fermer la pièce','Close the room'))}${b('undo',t('Annuler','Undo'))}
 </div><div class="exh-stage room-lab-stage"><div class="exh-canvas"></div></div>
 <p class="act-readout" role="status" aria-live="polite" data-status></p><p class="exh-detail" data-detail></p></div>`;
 const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
 let last='';
 const view=createRoomView($('.exh-canvas'),{t,fmt,get:getState,set:p=>setState(p),reduced:()=>stage.reduced(),onStats:st=>{
  const s=getState();
  const status=!st.valid?(st.reason==='crossing'?t('Deux murs se croisent (en rouge) : déplace un sommet.','Two walls cross (in red): move a vertex.'):st.reason==='open'||st.reason==='few'?t('Pièce ouverte : pose au moins trois sommets puis clique sur le premier.','Open room: put down at least three vertices, then click the first one.'):t('Contour invalide : pas de simulation.','Invalid boundary: simulation paused.'))
   :!st.inRoom?t('Place la lampe strictement à l’intérieur de la pièce.','Place the lamp strictly inside the room.')
   :st.litShare===null?(st.computing?t('Calcul de la lumière…','Computing the light…'):t(`${st.rays} rayons, ${st.segments} segments ; ${st.corners} arrêt(s) à un coin, ${st.tangencies} tangence(s).`,`${st.rays} rays, ${st.segments} segments; ${st.corners} corner stop(s), ${st.tangencies} tangencies.`))
   :t(`Sol éclairé ≈ ${n(100*st.litShare)} % après ${st.lightBounces} réflexion(s) ; ${st.patches.length} zone(s) hachurée(s) jamais atteinte(s) dans ce calcul.`,`Lit floor ≈ ${n(100*st.litShare)}% after ${st.lightBounces} reflection(s); ${st.patches.length} hatched zone(s) never reached in this computation.`);
  if(status!==last&&!st.coarse){last=status;$('[data-status]').textContent=status;}
  const target=PRESETS[s.room]?.target;
  $('[data-detail]').textContent=(st.farm?t(`${st.farm.rays} rayons sur ${st.rays}, ${st.farm.segments} segments${st.farm.capped?' ; limite de mémoire atteinte : le tracé s’arrête là.':st.farm.done?'':' ; calcul en cours…'} Niveau de l’appareil : ${st.tier}.`,`${st.farm.rays} of ${st.rays} rays, ${st.farm.segments} segments${st.farm.capped?'; memory limit reached: the trace stops here.':st.farm.done?'':'; computing…'} Device level: ${st.tier}.`):`${st.rays} ${t('rayons','rays')}, ${st.segments} segments.`)+' '+(target?t('T n’est jamais éclairé depuis la position initiale de S (construction publiée) ; déplacer S retire cette garantie.','T is never lit from the initial S (published construction); moving S removes that guarantee.'):t('Une zone hachurée n’est atteinte par aucun rayon calculé : c’est un indice, pas une preuve.','A hatched zone is reached by no computed ray: evidence, not a proof.'));
  $('[data-act=unfold]').setAttribute('aria-pressed',String(!!s.unfolding));$('[data-act=play]').textContent=s.playing?t('Pause','Pause'):t('Faire voyager les rayons','Send the rays travelling');
  $('[data-act=close]').hidden=!(st.custom&&!st.closed);$('[data-act=undo]').disabled=!view.canUndo;
 }});
 view.onDevice=()=>refresh?.();
 const tools=$$('[data-tool]');view.onTool=tool=>tools.forEach(x=>{x.setAttribute('aria-checked',String(x.dataset.tool===tool));x.tabIndex=x.dataset.tool===tool?0:-1;});view.onTool('lamp');
 tools.forEach((x,i)=>{x.addEventListener('click',()=>view.setTool(x.dataset.tool));x.addEventListener('keydown',e=>{const d={ArrowRight:1,ArrowLeft:-1}[e.key];if(d){e.preventDefault();const nb=tools[(i+d+tools.length)%tools.length];view.setTool(nb.dataset.tool);nb.focus();}});});
 const layer=(name,btn)=>{const on=btn.getAttribute('aria-pressed')!=='true';btn.setAttribute('aria-pressed',String(on));view.setLayer(name,on);};
 const acts={light:e=>layer('light',e.currentTarget),rays:e=>layer('rays',e.currentTarget),play:()=>view.playRays(),step:()=>view.stepRays(),lightplay:()=>view.playLight(),unfold:()=>setState({unfolding:!getState().unfolding}),new:()=>view.newRoom(),close:()=>view.close(),undo:()=>view.undo()};
 $$('[data-act]').forEach(x=>x.addEventListener('click',e=>acts[x.dataset.act](e)));
 void isCustom;void lightBounces;
 return {handles:[],draw(){view.redraw();},destroy(){view.destroy();}};
}
