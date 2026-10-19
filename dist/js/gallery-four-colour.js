// Colour a map so that neighbouring countries differ: pick a colour, tap countries, see clashes on shared borders. The
// solver answers "can this map be coloured with 3? with 4?" for the map shown; the theorem says 4 always suffice.
import { randomMap, wheelMap, pizzaMap, neighbours, colourWith, chromatic, conflicts, pointIn } from './gallery-four-colour-model.js';
import { polygonCentroid } from './gallery-models.js';
import { exhibit, background, path, button, field, bind } from './gallery-kit.js';

export function fourColours(root, opts) {
  const { t } = opts;
  let kind = 'random', n = 14, seed = 7, map, edges, col, current = 0, selected = 0, message = '', best = null;
  const o = exhibit(root, opts,
    t('Choisis une couleur, puis touche les pays. Deux pays voisins (qui partagent une frontière) doivent avoir des couleurs différentes ; se toucher en un point ne compte pas. Clavier : Tab jusqu’à la carte, flèches pour changer de pays, 1 à 4 pour la couleur, Entrée pour colorier.',
      'Pick a colour, then tap countries. Two neighbouring countries (sharing a border) must have different colours; touching at a point does not count. Keyboard: Tab to the map, arrows to change country, 1 to 4 for the colour, Enter to colour.'),
    `<div class="fc-palette" role="radiogroup" aria-label="${t('Couleur', 'Colour')}">${[0, 1, 2, 3].map((i) => `<button type="button" class="fc-swatch" data-c="${i}" role="radio" aria-label="${t('Couleur', 'Colour')} ${i + 1}" style="--fc:var(--c${i + 1})">${i + 1}</button>`).join('')}<button type="button" class="fc-swatch fc-erase" data-c="-1" role="radio" aria-label="${t('Gomme', 'Eraser')}">×</button></div>`
      + button('fc-new', t('Nouvelle carte', 'New map'), true) + button('fc-wheel', t('Carte en roue', 'Wheel map')) + button('fc-pizza', t('Carte en pizza', 'Pizza map'))
      + button('fc-three', t('3 couleurs suffisent-elles ?', 'Are 3 colours enough?')) + button('fc-auto', t('Colorier avec 4', 'Colour with 4')) + button('fc-clear', t('Effacer', 'Clear'))
      + field('fc-n', t('Pays de la carte aléatoire', 'Countries of the random map'), 6, 30, 1, n),
    `<p>${t('Théorème des quatre couleurs : toute carte plane, dont les pays sont d’un seul tenant, se colorie avec quatre couleurs au plus. La carte en roue montre que trois ne suffisent pas toujours : un anneau impair de pays demande trois couleurs, et le centre, voisin de tous, une quatrième.', 'Four colour theorem: every planar map whose countries are each in one piece can be coloured with at most four colours. The wheel map shows that three are not always enough: an odd ring of countries needs three colours, and the centre, a neighbour of all of them, a fourth.')}</p><p>${t('Essayer des cartes ne démontre rien : il y en a une infinité. La preuve d’Appel et Haken (1976) ramène le problème à un nombre fini de configurations vérifiées par ordinateur ; elle a été simplifiée en 1997 puis vérifiée formellement en 2005. En revanche, cinq couleurs suffisent avec une démonstration courte (Heawood, 1890).', 'Trying maps proves nothing: there are infinitely many. The proof by Appel and Haken (1976) reduces the problem to a finite number of configurations checked by computer; it was simplified in 1997 and formally verified in 2005. Five colours, on the other hand, are enough with a short proof (Heawood, 1890).')}</p>`);
  const g = o.g;
  function load() {
    map = kind === 'wheel' ? wheelMap() : kind === 'pizza' ? pizzaMap() : randomMap(n, seed);
    edges = neighbours(map); col = Array(map.length).fill(-1); selected = 0; message = ''; best = null;
    o.redraw();
  }
  const paint = (i) => { col[i] = current; message = ''; o.redraw(); };
  const swatches = [...root.querySelectorAll('.fc-swatch')];
  const choose = (c) => { current = c; swatches.forEach((b) => b.setAttribute('aria-checked', String(Number(b.dataset.c) === c))); };
  swatches.forEach((b) => o.on(b, 'click', () => choose(Number(b.dataset.c))));
  choose(0);
  bind(root, 'fc-n', (v) => { n = v; if (kind === 'random') load(); });
  o.on(root.querySelector('#fc-new'), 'click', () => { kind = 'random'; seed = (seed * 7919 + 13) % 100003; load(); });
  o.on(root.querySelector('#fc-wheel'), 'click', () => { kind = 'wheel'; load(); });
  o.on(root.querySelector('#fc-pizza'), 'click', () => { kind = 'pizza'; load(); });
  o.on(root.querySelector('#fc-clear'), 'click', () => { col.fill(-1); message = ''; o.redraw(); });
  o.on(root.querySelector('#fc-three'), 'click', () => {
    best ??= chromatic(map.length, edges);
    message = best <= 3 ? t(`Oui : cette carte se colorie avec ${best} couleur${best > 1 ? 's' : ''}. À toi de trouver comment.`, `Yes: this map can be coloured with ${best} colour${best > 1 ? 's' : ''}. Your turn to find how.`) : t('Non : pour cette carte, trois couleurs ne suffisent pas (toutes les possibilités ont été essayées).', 'No: for this map three colours are not enough (every possibility was tried).');
    o.redraw();
  });
  o.on(root.querySelector('#fc-auto'), 'click', () => { const c = colourWith(map.length, edges, 4); if (c) col = c; message = t('Une coloration avec quatre couleurs au plus, trouvée par essais et retours en arrière.', 'A colouring with at most four colours, found by trial and backtracking.'); o.redraw(); });
  o.on(o.cv, 'pointerdown', (e) => { const p = o.point(e), i = map.findIndex((poly) => pointIn(p, poly)); if (i >= 0) { selected = i; paint(i); } });
  o.on(o.cv, 'keydown', (e) => {
    if (e.shiftKey) return;
    if (/^[1-4]$/.test(e.key)) { choose(Number(e.key) - 1); return; }
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); choose(-1); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); paint(selected); return; }
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (d) { e.preventDefault(); selected = (selected + d + map.length) % map.length; o.redraw(); }
  });
  load();
  o.animate(() => {
    const C = background(o), bad = conflicts(edges, col);
    map.forEach((poly, i) => {
      path(g, poly, { close: true, fill: col[i] >= 0 ? C.c[col[i]] : C.surface, alpha: col[i] >= 0 ? 0.62 : 1 });
      path(g, poly, { close: true, stroke: C.ink, width: 1.4 });
    });
    for (const [, , segs] of bad) for (const s of segs) path(g, s, { stroke: C.neg, width: 6 });
    const sel = map[selected];
    if (sel) { path(g, sel, { close: true, stroke: C.ink, width: 3.5 }); const [x, y] = polygonCentroid(sel); g.fillStyle = C.ink; g.beginPath(); g.arc(x, y, 4, 0, 2 * Math.PI); g.fill(); }
    const done = col.every((c) => c >= 0), used = new Set(col.filter((c) => c >= 0)).size;
    o.read(`${map.length} ${t('pays', 'countries')} · ${t('coloriés', 'coloured')} ${col.filter((c) => c >= 0).length} · ${t('couleurs utilisées', 'colours used')} ${used} · ${bad.length ? t(`${bad.length} frontière${bad.length > 1 ? 's' : ''} en conflit`, `${bad.length} clashing border${bad.length > 1 ? 's' : ''}`) : done ? t('carte bien coloriée !', 'map properly coloured!') : t('aucun conflit', 'no clash')}${message ? ' · ' + message : ''}`);
  });
  return o.stop;
}
