// Four-colour examples and straight-border map editor. Shared-border maths and country grouping live in the pure model.
import { MAP_EXAMPLES, countryEdges, splitCountry, colourWith, chromatic, conflicts, pointIn } from './gallery-four-colour-model.js';
import { polygonCentroid } from './gallery-models.js';
import { exhibit, background, path, button, field, bind, dot } from './gallery-kit.js';

export function fourColours(root, opts) {
  const { t } = opts;
  let kind = 'random', n = 14, seed = 7, map, groups, edges, col, current = 0, selected = 0;
  let message = '', best = null, mode = 'paint', drag = null, cursor = [320, 220], history = [];
  const o = exhibit(root, opts,
    t('Choisis une carte, puis une couleur et touche les pays. Les pays voisins doivent avoir des couleurs différentes ; un contact en un point ne compte pas. Pour créer ta carte, choisis « Créer ma carte ». Clavier : flèches pour choisir un pays, 1 à 4 pour une couleur, Entrée pour colorier, Suppr pour la gomme.',
      'Choose a map, pick a colour and tap countries. Neighbours must have different colours; a point contact does not count. To make your own map, choose “Design my map”. Keyboard: arrows select a country, 1 to 4 choose a colour, Enter paints, Delete selects the eraser.'),
    `<label class="fc-example">${t('Exemples et faux contre-exemples', 'Examples and apparent counterexamples')}<select id="fc-example">${MAP_EXAMPLES.map((ex) => `<option value="${ex.id}">${t(...ex.label)}</option>`).join('')}</select></label>`
      + '<p id="fc-description" class="fc-description"></p>'
      + `<div class="fc-tools"><label>${t('Outil', 'Tool')}<select id="fc-tool"><option value="paint">${t('Colorier', 'Colour')}</option><option value="draw">${t('Tracer une frontière', 'Draw a border')}</option></select></label>`
      + button('fc-undo', t('Annuler la frontière', 'Undo border')) + button('fc-blank', t('Carte vierge', 'Blank map')) + button('fc-new', t('Autre carte aléatoire', 'Another random map')) + '</div>'
      + `<p id="fc-draw-help" class="fc-description" hidden>${t('Glisse dans un pays pour tracer une frontière droite : elle se prolonge jusqu’aux bords de ce pays. Jusqu’à 30 pays. Clavier : les flèches déplacent la croix ; Entrée fixe les deux points de la frontière ; Échap annule. Puis passe à « Colorier ».', 'Drag inside a country to draw a straight border: it extends to that country’s edges. Up to 30 countries. Keyboard: arrows move the crosshair; Enter sets the two border points; Escape cancels. Then switch to “Colour”.')}</p>`
      + `<div class="fc-palette" role="group" aria-label="${t('Couleurs et gomme', 'Colours and eraser')}">${[0, 1, 2, 3, 4].map((i) => `<button type="button" class="fc-swatch" data-c="${i}" aria-pressed="false" aria-label="${t('Couleur', 'Colour')} ${i + 1}" style="--fc:var(--c${i + 1})"${i === 4 ? ' hidden' : ''}>${i + 1}</button>`).join('')}<button type="button" class="fc-swatch fc-erase" data-c="-1" aria-pressed="false" aria-label="${t('Gomme', 'Eraser')}">×</button></div>`
      + button('fc-three', t('3 couleurs suffisent-elles ?', 'Are 3 colours enough?')) + button('fc-auto', t('Colorier avec 4', 'Colour with 4'))
      + `<span id="fc-five-wrap" hidden>${button('fc-five', t('Colorier avec 5', 'Colour with 5'))}</span>` + button('fc-clear', t('Effacer les couleurs', 'Clear colours'))
      + `<span id="fc-random-options">${field('fc-n', t('Pays de la carte aléatoire', 'Countries of the random map'), 6, 30, 1, n)}</span>`,
    `<p>${t('Théorème des quatre couleurs : toute carte plane dont les pays sont d’un seul tenant se colorie avec quatre couleurs au plus. Il n’existe pas de contre-exemple dans ces hypothèses. La mer et l’extérieur des figures ne sont pas des pays à colorier ici.', 'Four colour theorem: every planar map whose countries are each connected can be coloured with at most four colours. There is no counterexample under these hypotheses. The sea and the area outside the figures are not countries to colour here.')}</p><p>${t('L’exemple des pays morcelés impose la même couleur à tous les morceaux portant une même lettre. Cette contrainte sort des hypothèses du théorème. En séparant ces morceaux en pays indépendants, quatre couleurs suffisent à nouveau.', 'The disconnected-country example requires the same colour for every piece bearing the same letter. This constraint falls outside the theorem’s hypotheses. Treat those pieces as separate countries and four colours suffice again.')}</p><p>${t('Essayer des cartes ne démontre pas le théorème : il y en a une infinité. La preuve d’Appel et Haken (1976) réduit le problème à une liste finie de configurations vérifiées par ordinateur.', 'Trying maps does not prove the theorem: there are infinitely many. Appel and Haken’s proof (1976) reduces the problem to a finite list of configurations checked by computer.')}</p><p><a href="https://thomas.math.gatech.edu/PAP/update.pdf" target="_blank" rel="noopener">${t('Robin Thomas : le théorème et ses hypothèses (en anglais)', 'Robin Thomas: the theorem and its hypotheses')}</a></p>`);
  const g = o.g, exampleSelect = root.querySelector('#fc-example'), toolSelect = root.querySelector('#fc-tool');
  const undoButton = root.querySelector('#fc-undo'), swatches = [...root.querySelectorAll('.fc-swatch')];
  const editable = () => kind !== 'disconnected';
  const choose = (c) => { current = c; swatches.forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.c) === c))); };
  function updateTools() {
    toolSelect.value = mode; toolSelect.querySelector('[value="draw"]').disabled = !editable();
    root.querySelector('#fc-draw-help').hidden = mode !== 'draw'; root.querySelector('.fc-palette').hidden = mode === 'draw';
    root.querySelector('#fc-random-options').hidden = kind !== 'random'; root.querySelector('#fc-new').hidden = kind !== 'random';
    root.querySelector('#fc-blank').hidden = kind !== 'custom';
    root.querySelector('#fc-five-wrap').hidden = editable(); swatches.find((b) => b.dataset.c === '4').hidden = editable();
    undoButton.hidden = !editable(); undoButton.disabled = !history.length;
    o.cv.style.cursor = mode === 'draw' ? 'crosshair' : 'pointer'; exampleSelect.value = kind;
  }
  function refreshGraph() { edges = countryEdges(map, groups); best = null; selected = Math.min(selected, map.length - 1); }
  function load() {
    const ex = MAP_EXAMPLES.find((ex) => ex.id === kind), result = ex.make(n, seed);
    map = result.map; groups = result.groups || map.map((_, i) => i); col = Array(new Set(groups).size).fill(-1);
    history = []; selected = 0; drag = null; message = ''; cursor = [320, 220]; mode = kind === 'custom' ? 'draw' : 'paint';
    root.querySelector('#fc-description').textContent = t(...ex.description);
    refreshGraph(); if (current === 4 && editable()) choose(0); updateTools(); o.redraw();
  }
  function paint(i) { col[groups[i]] = current; message = ''; o.redraw(); }
  function undo() {
    if (!history.length) return;
    ({ map, groups, col } = history.pop()); drag = null; message = ''; refreshGraph(); updateTools(); o.redraw();
  }
  function cut(a, b) {
    if (map.length >= 30) { message = t('Limite de 30 pays : annule une frontière pour continuer.', '30-country limit: undo a border to continue.'); o.redraw(); return; }
    const i = map.findIndex((p) => pointIn(a, p)), parts = i >= 0 ? splitCountry(map[i], a, b) : null;
    if (!parts) { message = t('Commence dans un pays et trace une frontière plus longue, loin d’un bord.', 'Start inside a country and draw a longer border, away from an edge.'); o.redraw(); return; }
    history.push({ map, groups, col: [...col] }); map = [...map.slice(0, i), ...parts, ...map.slice(i + 1)];
    col = [...col.slice(0, i), -1, -1, ...col.slice(i + 1)]; groups = map.map((_, j) => j);
    kind = 'custom'; selected = i; refreshGraph();
    root.querySelector('#fc-description').textContent = t('Ta carte : chaque nouvelle frontière partage un pays en deux. Les deux nouveaux pays sont à colorier.', 'Your map: each new border divides one country in two. The two new countries are ready to colour.');
    message = t('Frontière ajoutée.', 'Border added.'); updateTools(); o.redraw();
  }
  swatches.forEach((b) => o.on(b, 'click', () => choose(Number(b.dataset.c)))); choose(0);
  o.on(exampleSelect, 'change', () => { kind = exampleSelect.value; load(); });
  o.on(toolSelect, 'change', () => { mode = toolSelect.value; drag = null; updateTools(); o.redraw(); });
  bind(root, 'fc-n', (v) => { n = v; if (kind === 'random') load(); });
  o.on(root.querySelector('#fc-new'), 'click', () => { seed = (seed * 7919 + 13) % 100003; load(); });
  o.on(root.querySelector('#fc-blank'), 'click', () => { kind = 'custom'; load(); });
  o.on(undoButton, 'click', undo);
  o.on(root.querySelector('#fc-clear'), 'click', () => { col.fill(-1); message = ''; o.redraw(); });
  o.on(root.querySelector('#fc-three'), 'click', () => {
    best ??= chromatic(col.length, edges);
    message = best <= 3 ? t(`Oui : cette carte se colorie avec ${best} couleur${best > 1 ? 's' : ''}. À toi de trouver comment.`, `Yes: this map can be coloured with ${best} colour${best > 1 ? 's' : ''}. Your turn to find how.`)
      : t(`Non : cette carte demande au moins ${best} couleurs.`, `No: this map needs at least ${best} colours.`); o.redraw();
  });
  function auto(k) {
    const c = colourWith(col.length, edges, k);
    if (c) { col = c; message = t(`Une coloration avec ${k} couleurs au plus.`, `A colouring with at most ${k} colours.`); }
    else message = t('Impossible avec quatre couleurs : chaque paire de pays A à E est voisine. Il en faut cinq, car ces pays sont morcelés ; le théorème ne s’applique pas.', 'Impossible with four colours: every pair of countries A to E is adjacent. Five are necessary because these countries are disconnected; the theorem does not apply.');
    o.redraw();
  }
  o.on(root.querySelector('#fc-auto'), 'click', () => auto(4)); o.on(root.querySelector('#fc-five'), 'click', () => auto(5));
  o.touchHit(p=>mode==='draw'&&map.some(poly=>pointIn(p,poly)));
  o.on(o.cv, 'pointerdown', (e) => {
    if (e.button !== 0) return;
    const p = o.point(e), i = map.findIndex((poly) => pointIn(p, poly)); if (i < 0) return;
    selected = i; cursor = p; o.cv.focus();
    if (mode === 'draw') { drag = { a: p, b: p, pointer: e.pointerId }; o.cv.setPointerCapture?.(e.pointerId); e.preventDefault(); }
    else paint(i); o.redraw();
  });
  o.on(o.cv, 'pointermove', (e) => { if (drag?.pointer === e.pointerId && drag.pointer !== undefined) { drag.b = o.point(e); cursor = drag.b; o.redraw(); } });
  o.on(o.cv, 'pointerup', (e) => {
    if (drag?.pointer !== e.pointerId || drag?.pointer === undefined) return;
    const a = drag.a, b = o.point(e); drag = null; cut(a, b);
    if (o.cv.hasPointerCapture?.(e.pointerId)) o.cv.releasePointerCapture(e.pointerId);
  });
  o.cancelDrag = () => { drag = null; o.redraw(); };
  o.on(o.cv, 'keydown', (e) => {
    if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Escape') { drag = null; o.redraw(); return; }
    if (mode === 'draw') {
      const d = { ArrowRight: [8, 0], ArrowLeft: [-8, 0], ArrowDown: [0, 8], ArrowUp: [0, -8] }[e.key];
      if (d) { e.preventDefault(); cursor = cursor.map((x, i) => Math.max(1, Math.min(i ? 439 : 639, x + d[i]))); if (drag) drag.b = [...cursor]; o.redraw(); }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (drag) { const a = drag.a; drag = null; cut(a, cursor); } else drag = { a: [...cursor], b: [...cursor] }; o.redraw(); }
      return;
    }
    if (/^[1-5]$/.test(e.key) && (e.key !== '5' || !editable())) { choose(Number(e.key) - 1); return; }
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); choose(-1); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); paint(selected); return; }
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (d) { e.preventDefault(); selected = (selected + d + map.length) % map.length; o.redraw(); }
  });
  load();
  o.animate(() => {
    const C = background(o), bad = conflicts(edges, col);
    map.forEach((poly, i) => {
      const c = col[groups[i]];
      path(g, poly, { close: true, fill: c >= 0 ? C.c[c] : C.surface, alpha: c >= 0 ? 0.62 : 1 }); path(g, poly, { close: true, stroke: C.ink, width: 1.4 });
      const [x, y] = polygonCentroid(poly); g.fillStyle = C.ink; g.font = 'bold 16px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(editable() ? String(i + 1) : String.fromCharCode(65 + groups[i]), x, y);
    });
    for (const [, , segments] of bad) for (const s of segments) path(g, s, { stroke: C.neg, width: 6 });
    if (map[selected]) path(g, map[selected], { close: true, stroke: C.ink, width: 3.5 });
    if (mode === 'draw') {
      path(g, [[cursor[0] - 9, cursor[1]], [cursor[0] + 9, cursor[1]]], { stroke: C.accent }); path(g, [[cursor[0], cursor[1] - 9], [cursor[0], cursor[1] + 9]], { stroke: C.accent });
      if (drag) {
        const i = map.findIndex((p) => pointIn(drag.a, p)), parts = i >= 0 ? splitCountry(map[i], drag.a, drag.b) : null;
        if (parts) for (const [, , segments] of countryEdges(parts)) for (const s of segments) path(g, s, { stroke: C.accent, width: 4 });
        else path(g, [drag.a, drag.b], { stroke: C.accent, width: 3 }); dot(g, drag.a, C.accent, 4);
      }
    }
    const done = col.every((c) => c >= 0), used = new Set(col.filter((c) => c >= 0)).size;
    o.read(`${col.length} ${t('pays', 'countries')} · ${t('coloriés', 'coloured')} ${col.filter((c) => c >= 0).length} · ${t('couleurs utilisées', 'colours used')} ${used} · ${bad.length ? t(`${bad.length} frontière${bad.length > 1 ? 's' : ''} en conflit`, `${bad.length} clashing border${bad.length > 1 ? 's' : ''}`) : done ? t('carte bien coloriée !', 'map properly coloured!') : t('aucun conflit', 'no clash')}${message ? ' · ' + message : ''}`);
  });
  return o.stop;
}
