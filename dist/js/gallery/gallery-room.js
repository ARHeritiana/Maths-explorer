// The unilluminable room, gallery exhibit (`#gallery/mirrored-rooms`): the stage first and large (stat chips above, tools,
// hint and zoom over the canvas, a readout and a legend below) and a side panel with tabs Explorer, Dessiner, Comprendre, Défis.
// The canvas, the light and the editor are ../illumination-view.js (shared with the laboratory); the state and the exact
// reflection model are those of ../lab/experiments/illumination.js.
import * as M from '../illumination-model.js';
import { PRESETS } from '../illumination-presets.js';
import { initial, device, RAY_OPTIONS } from '../lab/experiments/illumination.js';
import { createRoomView, NIGHT, isCustom, lightBounces, bboxOf } from '../illumination-view.js';

const ROOMS = [
  ['penrose', 'Penrose', 'Penrose', 'miroirs elliptiques', 'elliptical mirrors'],
  ['tokarsky', 'Tokarsky', 'Tokarsky', '26 côtés', '26 sides'],
  ['wolecki', 'Wolecki', 'Wolecki', '22 côtés', '22 sides'],
  ['lroom', 'En L', 'L-shaped', 'un coin rentrant', 'one inner corner'],
  ['star', 'Étoile', 'Star', 'cinq pointes', 'five points'],
  ['ellipse', 'Ellipse', 'Ellipse', 'deux foyers', 'two foci'],
  ['custom', 'Ma pièce', 'My room', 'à dessiner', 'to draw'],
];
const RAY_STEPS = [1, 2, 4, 8, 12, 24, 48, 96, 180, 360, 720, 1440, 5000, 20000, 100000, 500000];
const QUICK_RAYS = [1, 12, 48, 360, 1440];

export function roomExplorer(root, { lang, reduced = () => false }) {
  const fr = lang === 'fr', t = (a, b) => (fr ? a : b), locale = fr ? 'fr-FR' : 'en-GB';
  const n0 = (x) => x.toLocaleString(locale, { maximumFractionDigits: 0 }), n1 = (x) => x.toLocaleString(locale, { maximumFractionDigits: 1 }), n2 = (x) => x.toLocaleString(locale, { maximumFractionDigits: 2 });
  const state = { ...initial, vertices: initial.vertices.map((p) => [...p]), bends: [...initial.bends], room: 'penrose', sx: 0, sy: 0, bounces: 30, rays: 24 };
  const get = () => state, set = (patch) => { Object.assign(state, patch); sync(); };
  const tabs = [['explore', t('Explorer', 'Explore')], ['draw', t('Dessiner', 'Draw')], ['understand', t('Comprendre', 'Understand')], ['challenges', t('Défis', 'Challenges')]];
  const tools = [['lamp', t('Lampe', 'Lamp')], ['draw', t('Murs', 'Walls')], ['curve', t('Courber', 'Curve')]];
  root.innerHTML = `<div class="exh room-exh">
  <div class="exh-main">
    <div class="exh-chips" aria-label="${t('En bref', 'At a glance')}"><span class="exh-chip exh-chip-lit" data-chip="lit"></span><span class="exh-chip exh-chip-dark" data-chip="dark"></span><span class="exh-chip" data-chip="rays"></span><span class="exh-chip" data-chip="bounces"></span></div>
    <div class="exh-stage">
      <div class="exh-canvas"></div>
      <p class="exh-hint" data-hint></p>
      <div class="exh-zoom" role="group" aria-label="${t('Vue', 'View')}"><button type="button" data-zoom="in" aria-label="${t('Zoomer', 'Zoom in')}">+</button><button type="button" data-zoom="out" aria-label="${t('Dézoomer', 'Zoom out')}">−</button><button type="button" data-zoom="reset" aria-label="${t('Vue entière', 'Whole view')}">⤢</button></div>
      <div class="exh-tools" role="radiogroup" aria-label="${t('Outil', 'Tool')}">${tools.map(([id, name]) => `<button type="button" role="radio" data-tool="${id}">${name}</button>`).join('')}</div>
      <p class="exh-busy" data-busy hidden>${t('Calcul de la lumière…', 'Computing the light…')}</p>
    </div>
    <div class="exh-readout"><p class="exh-status" data-status role="status" aria-live="polite"></p><p class="exh-detail" data-detail></p>
      <ul class="exh-legend" aria-label="${t('Légende', 'Legend')}">
        <li><i class="sw sw-direct"></i>${t('lumière directe', 'direct light')}</li><li><i class="sw sw-light"></i>${t('lumière réfléchie', 'reflected light')}</li><li><i class="sw sw-dark"></i>${t('jamais atteint (dans ce calcul)', 'never reached (in this computation)')}</li>
        <li><i class="sw sw-ray"></i>${t('rayons', 'rays')}</li><li><i class="sw sw-wall"></i>${t('miroirs', 'mirrors')}</li><li><i class="sw sw-lamp"></i>${t('lampe S', 'lamp S')}</li><li><b>F</b> ${t('foyer', 'focus')}</li><li><b>T</b> ${t('point jamais éclairé (prouvé)', 'point never lit (proved)')}</li>
      </ul></div>
  </div>
  <aside class="exh-panel">
    <div class="exh-tabs" role="tablist" aria-label="${t('Panneau', 'Panel')}">${tabs.map(([id, name], i) => `<button type="button" role="tab" id="room-tab-${id}" aria-controls="room-pane-${id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-tab="${id}">${name}</button>`).join('')}</div>
    <section class="exh-pane" role="tabpanel" id="room-pane-explore" aria-labelledby="room-tab-explore">
      <h3 class="exh-h">${t('Choisir une pièce', 'Choose a room')}</h3>
      <div class="room-thumbs">${ROOMS.map(([id, f, e, cf, ce]) => `<button type="button" class="room-thumb" data-room="${id}" aria-pressed="false"><canvas width="132" height="92" aria-hidden="true"></canvas><span><b>${t(f, e)}</b><small>${t(cf, ce)}</small></span></button>`).join('')}</div>
      <h3 class="exh-h"><label for="room-rays">${t('Nombre de rayons', 'Number of rays')}</label> <output data-out="rays"></output></h3>
      <input id="room-rays" type="range" min="0" step="1" data-input="rays">
      <div class="exh-quick" role="group" aria-label="${t('Rayons', 'Rays')}" data-quick></div>
      <p class="exh-note" data-ceiling></p>
      <h3 class="exh-h"><label for="room-bounces">${t('Réflexions au plus', 'Reflections at most')}</label> <output data-out="bounces"></output></h3>
      <input id="room-bounces" type="range" min="0" step="1" data-input="bounces">
      <h3 class="exh-h"><label for="room-angle">${t('Direction du premier rayon', 'Direction of the first ray')}</label> <output data-out="angle"></output></h3>
      <input id="room-angle" type="range" min="0" max="6.28" step="0.01" data-input="angle">
      <fieldset class="exh-layers"><legend>${t('Afficher', 'Show')}</legend><label><input type="checkbox" data-layer="light" checked> ${t('la lumière', 'the light')}</label><label><input type="checkbox" data-layer="rays" checked> ${t('les rayons', 'the rays')}</label></fieldset>
      <div class="exh-buttons">
        <button type="button" class="btn btn-secondary" data-act="light-play">${t('Allumer réflexion par réflexion', 'Light up reflection by reflection')}</button>
        <button type="button" class="btn btn-secondary" data-act="light-step">${t('Réflexion suivante', 'Next reflection')}</button>
        <button type="button" class="btn btn-secondary" data-act="rays-play">${t('Faire voyager les rayons', 'Send the rays travelling')}</button>
        <button type="button" class="btn btn-secondary" data-act="rays-step">${t('Un pas', 'One step')}</button>
        <button type="button" class="btn btn-secondary" data-act="unfold" aria-pressed="false">${t('Déplier le premier rayon', 'Unfold the first ray')}</button>
      </div>
    </section>
    <section class="exh-pane" role="tabpanel" id="room-pane-draw" aria-labelledby="room-tab-draw" hidden>
      <div class="exh-buttons"><button type="button" class="btn btn-primary" data-act="new">${t('Nouvelle pièce', 'New room')}</button><button type="button" class="btn btn-secondary" data-act="edit-preset">${t('Modifier cette pièce', 'Edit this room')}</button></div>
      <ol class="exh-howto">
        <li>${t('Outil <b>Murs</b> : un clic pose un sommet sur la grille.', '<b>Walls</b> tool: a click puts a vertex on the grid.')}</li>
        <li>${t('Un clic sur le premier sommet (encadré) ferme la pièce.', 'A click on the first vertex (framed) closes the room.')}</li>
        <li>${t('Glisse un sommet pour le déplacer ; un clic sur un mur y ajoute un sommet ; un double-clic sur un sommet le retire.', 'Drag a vertex to move it; a click on a wall adds a vertex there; a double click on a vertex removes it.')}</li>
        <li>${t('Outil <b>Courber</b> : glisse le losange au milieu d’un mur ; double-clic pour le redresser.', '<b>Curve</b> tool: drag the diamond in the middle of a wall; double click to straighten it.')}</li>
        <li>${t('Maj pendant un glissement : sans aimant. Clavier : N choisit un point, flèches, Suppr, Ctrl+Z.', 'Shift while dragging: no snapping. Keyboard: N picks a point, arrows, Delete, Ctrl+Z.')}</li>
      </ol>
      <label class="exh-check"><input type="checkbox" data-snap checked> ${t('Aimanter à la grille (pas de 0,5)', 'Snap to the grid (step 0.5)')}</label>
      <div class="exh-buttons">
        <button type="button" class="btn btn-secondary" data-act="undo">${t('Annuler', 'Undo')}</button><button type="button" class="btn btn-secondary" data-act="redo">${t('Rétablir', 'Redo')}</button>
        <button type="button" class="btn btn-secondary" data-act="close">${t('Fermer la pièce', 'Close the room')}</button><button type="button" class="btn btn-secondary" data-act="insert">${t('Insérer un sommet', 'Insert a vertex')}</button>
        <button type="button" class="btn btn-secondary" data-act="remove">${t('Retirer le sommet choisi', 'Remove the chosen vertex')}</button><button type="button" class="btn btn-secondary" data-act="straighten">${t('Murs droits', 'Straight walls')}</button>
      </div>
      <p class="exh-check-room" data-validation></p>
    </section>
    <section class="exh-pane exh-text" role="tabpanel" id="room-pane-understand" aria-labelledby="room-tab-understand" hidden>
      <p><b>${t('La règle.', 'The rule.')}</b> ${t('Un rayon repart du miroir avec le même angle : <span class="formula">v′ = v − 2(v · n)n</span>, où n est la normale unitaire. Dans un coin la normale n’est pas définie : le rayon s’arrête.', 'A ray leaves the mirror at the same angle: <span class="formula">v′ = v − 2(v · n)n</span>, where n is the unit normal. At a corner the normal is not defined: the ray stops.')}</p>
      <p><b>${t('Ce que montre la figure.', 'What the figure shows.')}</b> ${t('Entre deux rayons voisins qui touchent les mêmes miroirs dans le même ordre, toute la bande est éclairée. Les zones hachurées ne sont atteintes par aucune bande après le nombre de réflexions choisi. C’est un indice, pas une preuve : il reste une infinité de directions et de réflexions.', 'Between two neighbouring rays that meet the same mirrors in the same order, the whole band is lit. The hatched zones are reached by no band after the chosen number of reflections. This is evidence, not a proof: infinitely many directions and reflections remain.')}</p>
      <p><b>Penrose (1958).</b> ${t('Un rayon qui passe entre les deux foyers d’une ellipse y repasse après chaque réflexion sur elle. Lampe au centre : la lumière ne sort jamais de la bande des foyers et les quatre poches restent noires, quel que soit le nombre de réflexions.', 'A ray passing between the two foci of an ellipse passes between them again after each reflection on it. Lamp at the centre: the light never leaves the band of the foci and the four pockets stay dark, whatever the number of reflections.')}</p>
      <p><b>${t('Tokarsky (1995), Wolecki.', 'Tokarsky (1995), Wolecki.')}</b> ${t('Dans ces polygones, depuis la lampe placée en S, le point T n’est jamais éclairé. Un point n’a pas d’aire : la figure paraît toute claire, car des rayons passent aussi près de T qu’on veut.', 'In these polygons, from the lamp placed at S, the point T is never lit. A point has no area: the figure looks fully lit, because rays pass as close to T as you like.')}</p>
      <p><b>${t('Le théorème.', 'The theorem.')}</b> ${t('Lelièvre, Monteil et Weiss (2016) : dans un polygone dont les angles sont des multiples rationnels de π, une lampe laisse au plus un nombre fini de points dans le noir. Aucune zone d’aire non nulle ne reste sombre : il faut des murs courbes pour cela.', 'Lelièvre, Monteil and Weiss (2016): in a polygon whose angles are rational multiples of π, a lamp leaves at most finitely many points in the dark. No region of positive area stays dark: that needs curved walls.')}</p>
      <p class="exh-links"><a href="#stories/illumination">${t('Lire l’histoire', 'Read the story')}</a> <a href="#lab/illumination">${t('Missions au laboratoire', 'Missions in the laboratory')}</a></p>
    </section>
    <section class="exh-pane" role="tabpanel" id="room-pane-challenges" aria-labelledby="room-tab-challenges" hidden><ol class="exh-challenges" data-challenges></ol></section>
  </aside>
</div>`;
  const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
  const view = createRoomView($('.exh-canvas'), { t, get, set, reduced, onStats: (s) => show(s) });
  // ---- tabs (arrow keys move between them)
  const tabButtons = $$('[data-tab]');
  const openTab = (id, focus) => { tabButtons.forEach((b) => { const on = b.dataset.tab === id; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); }); $$('.exh-pane').forEach((p) => { p.hidden = p.id !== `room-pane-${id}`; }); };
  tabButtons.forEach((b, i) => { b.addEventListener('click', () => openTab(b.dataset.tab)); b.addEventListener('keydown', (e) => { const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (d) { e.preventDefault(); openTab(tabButtons[(i + d + tabButtons.length) % tabButtons.length].dataset.tab, true); } }); });
  // ---- thumbnails
  function thumb(cv, id) {
    const g = cv.getContext('2d'), w = cv.width, h = cv.height; g.fillStyle = NIGHT.outside; g.fillRect(0, 0, w, h);
    const custom = id === 'custom', edges = custom ? (isCustom(state) && state.closed && state.vertices.length >= 3 ? M.polygonEdges(state.vertices) : null) : PRESETS[id].edges;
    if (!edges) { g.strokeStyle = NIGHT.wall; g.setLineDash([4, 4]); g.lineWidth = 1.5; g.strokeRect(w / 2 - 28, h / 2 - 20, 56, 40); g.setLineDash([]); g.fillStyle = NIGHT.wall; g.font = '600 22px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('+', w / 2, h / 2 + 1); return; }
    const b = bboxOf(edges), S = Math.min((w - 16) / (b[1] - b[0]), (h - 14) / (b[3] - b[2])), P = (p) => [w / 2 + (p[0] - (b[0] + b[1]) / 2) * S, h / 2 + (p[1] - (b[2] + b[3]) / 2) * S];
    g.beginPath(); M.flatten(edges, 40).forEach((p, i) => { const q = P(p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.closePath(); g.fillStyle = NIGHT.floor; g.fill(); g.strokeStyle = NIGHT.wall; g.lineWidth = 1.6; g.stroke();
    const src = custom ? [state.sx, state.sy] : PRESETS[id].source, q = P(src); g.fillStyle = NIGHT.lamp; g.beginPath(); g.arc(q[0], q[1], 3.5, 0, 7); g.fill();
    const tgt = !custom && PRESETS[id].target; if (tgt) { const r = P(tgt); g.strokeStyle = NIGHT.dark; g.lineWidth = 1.5; g.beginPath(); g.arc(r[0], r[1], 4, 0, 7); g.stroke(); }
  }
  const drawThumbs = () => $$('.room-thumb').forEach((b) => thumb(b.querySelector('canvas'), b.dataset.room));
  drawThumbs();
  $$('.room-thumb').forEach((b) => b.addEventListener('click', () => {
    const id = b.dataset.room;
    if (id === 'custom') { if (!isCustom(state)) view.newRoom(); openTab('draw'); }
    else { view.remember(); set({ room: id, sx: PRESETS[id].source[0], sy: PRESETS[id].source[1], playing: false, unfolding: false }); view.setTool('lamp'); view.resetView(); }
    acted();
  }));
  // ---- rays, reflections, direction
  const raysInput = $('[data-input=rays]'), bouncesInput = $('[data-input=bounces]'), angleInput = $('[data-input=angle]');
  const steps = () => RAY_STEPS.filter((x) => x <= device.limits.rays);
  function limits() {
    const st = steps(); raysInput.max = String(st.length - 1); raysInput.value = String(Math.max(0, st.findIndex((x) => x >= Math.min(state.rays, st.at(-1)))));
    bouncesInput.max = String(device.limits.bounces); bouncesInput.value = String(Math.min(state.bounces, device.limits.bounces));
    const quick = [...QUICK_RAYS.filter((x) => x <= device.limits.rays), ...(device.limits.rays > 1440 ? [device.limits.rays] : [])];
    $('[data-quick]').innerHTML = quick.map((x) => `<button type="button" data-rays="${x}" aria-pressed="${x === state.rays}">${n0(x)}</button>`).join('');
    $$('[data-rays]').forEach((b) => b.addEventListener('click', () => { set({ rays: +b.dataset.rays }); limits(); acted(); }));
    $('[data-ceiling]').textContent = t(`Cet appareil : jusqu’à ${n0(device.limits.rays)} rayons et ${n0(device.limits.bounces)} réflexions.${device.ready ? '' : ' Mesure en cours.'} Au-delà de 1 440 rayons, ils sont tracés en arrière-plan et montrés comme une densité.`, `This device: up to ${n0(device.limits.rays)} rays and ${n0(device.limits.bounces)} reflections.${device.ready ? '' : ' Measuring.'} Beyond 1,440 rays they are traced in the background and shown as a density.`);
  }
  view.onDevice = limits;
  raysInput.addEventListener('input', () => { set({ rays: steps()[+raysInput.value] }); $$('[data-rays]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.rays === state.rays))); acted(); });
  bouncesInput.addEventListener('input', () => { set({ bounces: +bouncesInput.value }); view.stopLight(); acted(); });
  angleInput.addEventListener('input', () => { set({ angle: +angleInput.value }); acted(); });
  $$('[data-layer]').forEach((c) => c.addEventListener('change', () => { view.setLayer(c.dataset.layer, c.checked); acted(); }));
  $('[data-snap]').addEventListener('change', (e) => view.setSnap(e.target.checked));
  // ---- tools and zoom over the stage
  const toolButtons = $$('[data-tool]');
  view.onTool = (tool) => { root.querySelector('.exh-stage').classList.remove('has-acted'); toolButtons.forEach((b) => { b.setAttribute('aria-checked', String(b.dataset.tool === tool)); b.tabIndex = b.dataset.tool === tool ? 0 : -1; }); hint(); };
  toolButtons.forEach((b, i) => { b.addEventListener('click', () => { view.setTool(b.dataset.tool); acted(); }); b.addEventListener('keydown', (e) => { const d = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 1, ArrowUp: -1 }[e.key]; if (d) { e.preventDefault(); const nb = toolButtons[(i + d + toolButtons.length) % toolButtons.length]; view.setTool(nb.dataset.tool); nb.focus(); } }); });
  view.onTool('lamp');
  $$('[data-zoom]').forEach((b) => b.addEventListener('click', () => { const z = b.dataset.zoom; if (z === 'in') view.zoom(1.3); else if (z === 'out') view.zoom(1 / 1.3); else view.resetView(); }));
  // ---- actions
  const acts = {
    'light-play': () => view.playLight(), 'light-step': () => view.stepLight(), 'rays-play': () => { view.setLayer('rays', true); $('[data-layer=rays]').checked = true; view.playRays(); }, 'rays-step': () => view.stepRays(),
    unfold: () => set({ unfolding: !state.unfolding }), new: () => view.newRoom(), 'edit-preset': () => view.editPreset(), undo: () => view.undo(), redo: () => view.redo(),
    close: () => view.close(), insert: () => view.insertVertex(), remove: () => view.removeVertex(), straighten: () => view.straighten(),
  };
  $$('[data-act]').forEach((b) => b.addEventListener('click', () => { acts[b.dataset.act](); acted(); }));
  // ---- challenges
  const CHALLENGES = [
    { id: 'penrose-dark', text: t('Penrose : place la lampe pour que plus de la moitié du sol reste dans le noir.', 'Penrose: place the lamp so that more than half of the floor stays dark.'), done: (s, st) => s.room === 'penrose' && !st.coarse && st.litShare !== null && st.litShare < 0.5 },
    { id: 'l-room', text: t('Pièce en L, lampe à sa place : quel est le plus petit nombre de réflexions qui ne laisse aucune zone hachurée ?', 'L-shaped room, lamp in its place: what is the smallest number of reflections that leaves no hatched zone?'), done: (s, st) => s.room === 'lroom' && s.sx === PRESETS.lroom.source[0] && s.sy === PRESETS.lroom.source[1] && !st.coarse && st.litShare !== null && st.patches.length === 0 && lightBounces(s) === 2, hint: t('Essaie 0, 1, 2… réflexions.', 'Try 0, 1, 2… reflections.') },
    { id: 'my-dark', text: t('Dessine une pièce où une zone reste hachurée après 10 réflexions.', 'Draw a room where a zone is still hatched after 10 reflections.'), done: (s, st) => isCustom(s) && st.valid && st.inRoom && !st.coarse && lightBounces(s) >= 10 && st.patches.length > 0, hint: t('Des murs courbes aident ; un polygone n’y arrivera pas pour de bon (voir Comprendre).', 'Curved walls help; a polygon cannot do it for good (see Understand).') },
    { id: 'tokarsky-t', text: t('Tokarsky : la figure paraît toute éclairée, pourtant T ne l’est jamais. Pourquoi l’image ne peut-elle pas le montrer ?', 'Tokarsky: the figure looks fully lit, yet T never is. Why can the picture not show it?'), answer: t('T est un seul point, sans aire. Les bandes de lumière passent aussi près de T qu’on veut sans jamais l’atteindre ; aucune grille ni aucun dessin fini ne peut séparer T de ses voisins éclairés.', 'T is a single point, with no area. The bands of light come as close to T as you like without ever reaching it; no grid and no finite drawing can separate T from its lit neighbours.') },
  ];
  const solved = new Set();
  $('[data-challenges]').innerHTML = CHALLENGES.map((c) => `<li data-ch="${c.id}"><p>${c.text}</p>${c.hint ? `<p class="exh-note">${c.hint}</p>` : ''}${c.answer ? `<details><summary>${t('Voir une réponse', 'See an answer')}</summary><p>${c.answer}</p></details>` : `<p class="exh-done" data-done>${t('Pas encore.', 'Not yet.')}</p>`}</li>`).join('');
  // ---- readouts
  let lastStatus = '', lastChips = '';
  const pct = (x) => `${n1(100 * x)} %`.replace(' %', fr ? ' %' : '%');
  function show(st) {
    const s = state, chips = {
      lit: st.litShare === null ? t('Sol éclairé : –', 'Lit floor: –') : `${t('Sol éclairé', 'Lit floor')} ${st.coarse ? '≈ ' : '≈ '}${pct(st.litShare)}`,
      dark: st.litShare === null ? t('Zones sombres : –', 'Dark zones: –') : `${t('Zones hachurées', 'Hatched zones')} ${st.patches.length}`,
      rays: `${n0(st.rays || s.rays)} ${t('rayons', 'rays')}`,
      bounces: st.lightBounces !== null && st.lightBounces < lightBounces(s) ? `${t('Lumière après', 'Light after')} ${st.lightBounces} / ${lightBounces(s)} ${t('réflexions', 'reflections')}` : `${lightBounces(s)} ${lightBounces(s) === 1 ? t('réflexion', 'reflection') : t('réflexions', 'reflections')}`,
    };
    const ck = JSON.stringify(chips); if (ck !== lastChips) { lastChips = ck; for (const k in chips) $(`[data-chip=${k}]`).textContent = chips[k]; }
    $('[data-busy]').hidden = !st.computing;
    let status;
    if (!st.valid) status = st.reason === 'few' || (st.custom && st.vertices < 3) ? t('Pose au moins trois sommets, puis ferme la pièce.', 'Put down at least three vertices, then close the room.') : st.reason === 'open' ? t('Pièce ouverte : clique sur le premier sommet ou sur « Fermer la pièce ».', 'Open room: click the first vertex or “Close the room”.') : st.reason === 'crossing' ? t('Deux murs se croisent (en rouge) : déplace un sommet.', 'Two walls cross (in red): move a vertex.') : t('Ce contour n’est pas une pièce (murs confondus ou aire nulle).', 'This outline is not a room (overlapping walls or zero area).');
    else if (!st.inRoom) status = t('Place la lampe strictement à l’intérieur de la pièce.', 'Place the lamp strictly inside the room.');
    else if (st.litShare === null) status = st.computing ? t('Calcul de la lumière…', 'Computing the light…') : t('Lumière masquée : coche « la lumière » pour voir les zones sombres.', 'Light hidden: tick “the light” to see the dark zones.');
    else status = st.patches.length ? t(`${st.patches.length} zone(s) jamais atteinte(s) après ${st.lightBounces} réflexion(s) : ${st.patches.slice(0, 4).map((p, i) => `${i + 1}) ${n2(p.area)} u²`).join(', ')}${st.patches.length > 4 ? '…' : ''}.`, `${st.patches.length} zone(s) never reached after ${st.lightBounces} reflection(s): ${st.patches.slice(0, 4).map((p, i) => `${i + 1}) ${n2(p.area)} u²`).join(', ')}${st.patches.length > 4 ? '…' : ''}.`)
      : t(`Aucune zone hachurée après ${st.lightBounces} réflexion(s) à cette résolution.`, `No hatched zone after ${st.lightBounces} reflection(s) at this resolution.`);
    if (status !== lastStatus && !st.coarse) { lastStatus = status; $('[data-status]').textContent = status; }
    const lamp = `S = (${n2(s.sx)} ; ${n2(s.sy)})`.replace(' ; ', fr ? ' ; ' : ', ');
    const how = st.litShare === null ? '' : st.coarse ? t('Aperçu grossier pendant le geste.', 'Rough preview during the gesture.') : t(`Lumière estimée avec ${n0(st.traced)} directions (affinées près des coins)${st.exhausted ? ', budget de l’appareil atteint' : ''}.`, `Light estimated with ${n0(st.traced)} directions (refined near corners)${st.exhausted ? ', device budget reached' : ''}.`);
    const rays = st.farm ? t(`${n0(st.farm.rays)} rayons sur ${n0(st.rays)} tracés${st.farm.capped ? ', limite de mémoire atteinte' : st.farm.done ? '' : ', calcul en cours…'}.`, `${n0(st.farm.rays)} of ${n0(st.rays)} rays traced${st.farm.capped ? ', memory limit reached' : st.farm.done ? '' : ', computing…'}.`) : st.rays ? t(`${n0(st.corners)} rayon(s) arrêté(s) dans un coin.`, `${n0(st.corners)} ray(s) stopped at a corner.`) : '';
    $('[data-detail]').textContent = `${lamp}. ${how} ${rays}`.trim();
    // draw tab
    const vtext = !st.custom ? t('Une pièce du catalogue : « Modifier cette pièce » en fait une copie à toi (polygones seulement), ou commence une « Nouvelle pièce ».', 'A catalogue room: “Edit this room” makes your own copy (polygons only), or start a “New room”.') : st.valid ? t(`Pièce valide : ${st.vertices} sommets${st.area ? `, aire ≈ ${n2(st.area)} u²` : ''}.`, `Valid room: ${st.vertices} vertices${st.area ? `, area ≈ ${n2(st.area)} u²` : ''}.`) : status;
    $('[data-validation]').textContent = vtext; $('[data-validation]').classList.toggle('is-bad', st.custom && !st.valid);
    $('[data-act=edit-preset]').disabled = !view.canEditPreset(); $('[data-act=undo]').disabled = !view.canUndo; $('[data-act=redo]').disabled = !view.canRedo;
    $('[data-act=close]').disabled = !(st.custom && !st.closed && st.vertices >= 3); $('[data-act=insert]').disabled = $('[data-act=straighten]').disabled = !st.custom;
    $('[data-act=remove]').disabled = !(st.custom && st.selected?.type === 'vertex'); $('[data-act=straighten]').disabled = !st.custom || !s.bends.some(Boolean);
    $('[data-act=unfold]').disabled = !st.valid || boundaryCurved(); $('[data-act=unfold]').setAttribute('aria-pressed', String(!!s.unfolding));
    $('[data-act=rays-play]').textContent = s.playing ? t('Pause', 'Pause') : t('Faire voyager les rayons', 'Send the rays travelling');
    $$('.room-thumb').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.room === s.room || (b.dataset.room === 'custom' && isCustom(s)))));
    $('[data-out=rays]').textContent = n0(s.rays); $('[data-out=bounces]').textContent = n0(s.bounces); $('[data-out=angle]').textContent = `${n2(s.angle)} rad`;
    for (const c of CHALLENGES) if (c.done && !solved.has(c.id) && c.done(s, st)) { solved.add(c.id); const li = $(`[data-ch="${c.id}"]`); li.classList.add('is-done'); li.querySelector('[data-done]').textContent = t('Réussi.', 'Solved.'); }
    if (st.custom !== show.custom || st.closed !== show.closed) { show.custom = st.custom; show.closed = st.closed; drawThumbs(); }
  }
  const boundaryCurved = () => (isCustom(state) ? state.room === 'curved' : PRESETS[state.room].edges.some((e) => e.type !== 'line'));
  function hint() {
    const tool = view.view.tool, s = state;
    $('[data-hint]').textContent = tool === 'lamp' ? t('Glisse la lampe S. Les zones hachurées ne reçoivent aucune lumière.', 'Drag the lamp S. Hatched zones receive no light.')
      : tool === 'draw' ? (isCustom(s) && !s.closed ? t('Clique pour poser les sommets ; clique sur le premier pour fermer.', 'Click to put down vertices; click the first one to close.') : t('Glisse un sommet, clique sur un mur pour en ajouter un.', 'Drag a vertex, click a wall to add one.'))
      : t('Glisse un losange pour courber un mur.', 'Drag a diamond to curve a wall.');
  }
  // the hint fades once the visitor has acted, and comes back with a new tool
  const acted = () => { root.querySelector('.exh-stage').classList.add('has-acted'); hint(); };
  view.onAction = () => { root.querySelector('.exh-stage').classList.add('has-acted'); };
  function sync() { view.redraw(); }
  angleInput.value = String(state.angle); limits(); hint();
  return () => view.destroy();
}
