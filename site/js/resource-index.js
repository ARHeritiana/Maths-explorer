// One search index over the resources the site really has and publishes, with stable ids, honest actions and a small shared
// topic/relationship registry. Pure: no DOM, no storage, no network. Callers pass plain data (see resource-sources.js for the
// real wiring) and an `isLive(hash)` predicate, so nothing unpublished can leak in. Actions that do not exist are absent.
const pair = v => Array.isArray(v) ? [String(v[0] ?? ''), String(v[1] ?? v[0] ?? '')] : [String(v ?? ''), String(v ?? '')];

// Accent, case and punctuation folding. "Dérivée", "derivee" and "DERIVÉE" are one word.
export const fold = value => String(value ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/œ/g, 'oe').replace(/æ/g, 'ae').replace(/[’'`]/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
// Light plural folding shared by queries and resources: suites = suite, vecteurs = vecteur.
const stem = w => w.length > 3 && /[sx]$/.test(w) ? w.slice(0, -1) : w;
export const tokens = value => fold(value).split(' ').filter(Boolean).map(stem);

export const TYPES = [
  ['chapter', ['Chapitre', 'Chapter']], ['slides', ['Diaporama', 'Slides']], ['exercises', ['Exercices corrigés', 'Worked exercises']],
  ['automatismes', ['Automatismes', 'Starters']], ['lab', ['Expérience', 'Experiment']], ['gallery', ['Curiosité', 'Curiosity']],
  ['challenge', ['Défi', 'Challenge']], ['history', ['Histoire', 'History']], ['misconception', ['Erreur à corriger', 'Error to correct']],
  ['annales', ['Annale', 'Past paper']], ['lesson', ['Leçon', 'Lesson']], ['tool', ['Outil', 'Tool']],
];
export const TYPE_IDS = TYPES.map(t => t[0]);
export const typeLabel = type => TYPES.find(t => t[0] === type)?.[1] || [type, type];
const FORMAT_TYPE = {chapter: 'chapter', lab: 'lab', gallery: 'gallery', challenge: 'challenge', error: 'misconception', biography: 'history', story: 'history', timeline: 'history', lesson: 'lesson', workshop: 'lesson'};

// Single-word synonym groups, French and English, folded and stemmed. A query word also finds its group mates (lower weight).
export const SYNONYMS = [
  ['suite', 'sequence', 'progression', 'recurrence'], ['derivee', 'derivation', 'derivative', 'derive', 'tangente', 'tangent'],
  ['integrale', 'integral', 'primitive', 'integration'], ['exponentielle', 'exponential', 'exponentiel'], ['logarithme', 'logarithm', 'ln'],
  ['probabilite', 'probability', 'hasard', 'aleatoire', 'chance', 'random'], ['statistique', 'statistics', 'donnee', 'data'],
  ['vecteur', 'vector', 'scalaire', 'scalar'], ['complexe', 'complex', 'imaginaire'], ['matrice', 'matrix'], ['graphe', 'graph', 'reseau', 'network'],
  ['trigonometrie', 'trigonometry', 'sinus', 'cosinus', 'sine', 'cosine', 'cercle', 'circle'], ['fonction', 'function'],
  ['trinome', 'quadratic', 'parabole', 'parabola', 'polynome', 'polynomial'], ['equation', 'inequation', 'inequality', 'inequalities'],
  ['diaporama', 'slides', 'slide', 'presentation', 'projection', 'projeter', 'project', 'projecteur'], ['exercice', 'exercise', 'probleme', 'problem', 'entrainement', 'practice'],
  ['correction', 'corrige', 'solution', 'answer'], ['annale', 'past', 'bac', 'e3c', 'eam', 'sujet', 'exam', 'examen'],
  ['demographie', 'demographique', 'demographic', 'population', 'natalite'], ['croissance', 'growth', 'taux', 'rate'],
  ['erreur', 'error', 'misconception', 'piege', 'mistake', 'faute'], ['defi', 'challenge', 'enigme', 'puzzle'], ['histoire', 'history', 'biographie', 'biography', 'mathematicien'],
  ['automatisme', 'starter', 'starters', 'calcul', 'flash'], ['evaluation', 'devoir', 'interro', 'test', 'quiz', 'fiche', 'worksheet'],
  ['premiere', 'first'], ['terminale', 'final'], ['seconde', 'tenth'], ['espace', 'space', 'solide', 'solid', 'volume'], ['aire', 'area', 'surface'],
  ['denombrement', 'counting', 'combinatoire', 'combinatorics'], ['arithmetique', 'arithmetic', 'divisibilite', 'divisibility', 'premier', 'prime'],
  ['chaos', 'chaotique', 'logistique', 'logistic', 'iteration'], ['frequence', 'frequency', 'proportion', 'pourcentage', 'percentage'],
].map(g => [...new Set(g.map(w => stem(fold(w))))]);
const synonymsOf = word => [...new Set(SYNONYMS.filter(g => g.includes(word)).flat())].filter(w => w !== word);

// Shared topic/relationship registry. Stable ids, bilingual title, synonyms, and how resources join it: `concepts` match the
// topics, concepts and titles of a resource (folded words), `routes` pin resources by hash. A resource may belong to several.
// Teacher workflows, the student pages and the museum read the same ids; nothing is copied.
export const RELATIONS = [
  {id: 'rel.population-growth', title: ['Croissance démographique', 'Population growth'], synonyms: ['population', 'démographie', 'natalité', 'croissance exponentielle', 'taux de croissance', 'modèle logistique', 'growth', 'demographic'],
   concepts: ['sequences', 'sequence', 'exponential', 'exponentielle', 'logistic', 'cobweb', 'suites geometriques'], routes: ['#lab/exponential', '#lab/logistic', '#lab/cobweb', '#gallery/logistic-gallery', '#lab/sequences']},
  {id: 'rel.rate-of-change', title: ['Taux de variation et dérivation', 'Rates of change and derivatives'], synonyms: ['vitesse', 'tangente', 'optimisation', 'pente', 'speed', 'slope', 'tangent', 'optimization'],
   concepts: ['derivative', 'derivation', 'optimisation', 'optimization', 'tangent'], routes: ['#lab/derivative']},
  {id: 'rel.chance-and-conditioning', title: ['Hasard et conditionnement', 'Chance and conditioning'], synonyms: ['aléatoire', 'arbre', 'bayes', 'monty hall', 'tirage', 'random', 'tree'],
   concepts: ['probability', 'conditional', 'conditioning', 'random', 'binomial', 'bayes'], routes: ['#lab/probability', '#lab/monty', '#lab/bertrand']},
  {id: 'rel.periodic-phenomena', title: ['Phénomènes périodiques', 'Periodic phenomena'], synonyms: ['onde', 'roue', 'oscillation', 'wave', 'wheel', 'cycle'],
   concepts: ['trigonometry', 'trig', 'fourier', 'periodic'], routes: ['#lab/trig', '#lab/ferris-wheel', '#lab/fourier-series', '#lab/fourier-drawing', '#gallery/fourier']},
  {id: 'rel.vectors-and-space', title: ['Vecteurs et espace', 'Vectors and space'], synonyms: ['repérage', 'droites', 'plans', 'orthogonalité', 'lines', 'planes', 'orthogonality'],
   concepts: ['vectors', 'scalar', 'space-lines', 'space-equations'], routes: ['#lab/vectors', '#lab/space-lines', '#lab/line']},
  {id: 'rel.graphs-and-networks', title: ['Graphes et réseaux', 'Graphs and networks'], synonyms: ['parcours', 'chemin', 'sommet', 'arête', 'path', 'vertex', 'edge', 'network'],
   concepts: ['graphs', 'graph', 'markov', 'euler-trails'], routes: []},
  {id: 'rel.reasoning-and-proof', title: ['Raisonnement et démonstration', 'Reasoning and proof'], synonyms: ['preuve', 'récurrence', 'contre-exemple', 'induction', 'proof', 'counterexample'],
   concepts: ['reasoning', 'induction', 'logic', 'invariants', 'proof'], routes: []},
  {id: 'rel.complex-numbers', title: ['Nombres complexes', 'Complex numbers'], synonyms: ['imaginaire', 'module', 'argument', 'imaginary', 'modulus'],
   concepts: ['complex', 'complex-algebra', 'complex-plane'], routes: ['#lab/complex']},
];
const relationText = r => [...r.title, ...r.synonyms, ...r.concepts].join(' ');
// Relations a query talks about: every word of the query appears in the relation's words (or a synonym of it).
export function relationsForQuery(query) {
  const words = tokens(query);
  if (!words.length) return [];
  return RELATIONS.filter(r => {
    const have = tokens(relationText(r));
    return words.every(w => have.some(h => h === w || (w.length >= 4 && h.startsWith(w))) || synonymsOf(w).some(s => have.includes(s)));
  }).map(r => r.id);
}

const hashParts = href => String(href || '').replace(/^#/, '').split('/');
const hrefOf = a => a?.href || '';
const hasAction = it => Object.keys(it.actions).length > 0;

// sources: {discovery, chapters:[{id,course,title}], classes:[{id,title}], decks:[]|null, deckHref(id), exerciseChapters:{class:[id]},
//   automatismes:{chapterId:[domain labels]}, annals:[], isLive(hash)}
export function buildResourceIndex({discovery = [], chapters = [], classes = [], decks = null, deckHref = id => '', exerciseChapters = {}, automatismes = {}, annals = [], isLive = () => true} = {}) {
  const classIds = new Set(classes.map(c => c.id));
  const className = id => pair(classes.find(c => c.id === id)?.title || id);
  const chapterOf = new Map(chapters.map(c => [c.id, c]));
  const items = new Map();
  const live = href => !href || !href.startsWith('#') || isLive(href);
  const add = item => {
    const actions = {};
    for (const [k, a] of Object.entries(item.actions)) if (a?.href && live(a.href)) actions[k] = a;
    const full = {...item, actions, id: item.id};
    if (!hasAction(full) || items.has(full.id)) return null;
    full.projectable = !!actions.project; full.printable = !!actions.print; full.manipulable = !!actions.manipulate;
    items.set(full.id, full);
    return full;
  };
  const tagsOfChapter = new Map();
  // 1. Everything the discovery index already knows (chapters, laboratory, gallery, challenges, errors, history, lessons).
  const chapterRoute = new Map();
  for (const d of discovery) if (d.route.startsWith('#chapter/')) chapterRoute.set(d.route, d);
  const typeOf = d => d.route.startsWith('#library/explore-') ? 'lesson' : FORMAT_TYPE[d.format];
  for (const d of discovery) {
    const type = typeOf(d);
    if (!type || (d.route.startsWith('#library/') && !d.route.startsWith('#library/explore-') && !chapterOf.has(d.route.split('/')[1]))) continue;
    const [page, ...rest] = hashParts(d.route);
    const key = type === 'history' ? [page, ...rest].join('/') : rest.join('/');
    const chap = page === 'chapter' ? chapterOf.get(rest[0]) : null;
    const rel = d.related.filter(r => r.startsWith('#chapter/')).map(r => chapterOf.get(r.split('/')[1])?.course).filter(c => classIds.has(c));
    const cls = chap ? (classIds.has(chap.course) ? [chap.course] : []) : [...new Set(rel)];
    const a = {};
    if (type === 'lab' || type === 'gallery') a.manipulate = {href: d.route};
    else a.open = {href: d.route};
    if (chap) {tagsOfChapter.set(chap.id, d.memberships);}
    add({id: `${type}:${key}`, type, route: d.route, title: pair(d.title), summary: pair(d.summary), classes: cls, tags: d.memberships, concepts: d.concepts.map(String), synonyms: [], actions: a, related: d.related.slice(), chapter: chap?.id || ''});
  }
  // 2. Slides: one HTML deck per live chapter, only when the deck index lists it (null: index unreadable, so no claim).
  for (const dk of Array.isArray(decks) ? decks : []) {
    const ch = chapterOf.get(dk.id);
    if (!ch || !classIds.has(ch.course) || !dk.editions?.fr) continue;
    add({id: `slides:${dk.id}`, type: 'slides', route: `#slides/${ch.course}`, title: [`Diaporama : ${ch.title[0]}`, `Slides: ${ch.title[1] || ch.title[0]}`], summary: className(ch.course),
      classes: [ch.course], tags: tagsOfChapter.get(dk.id) || [], concepts: [ch.topic].filter(Boolean), synonyms: [], chapter: dk.id,
      actions: {open: {href: `#slides/${ch.course}`}, project: {href: deckHref(dk.id)}}, related: []});
  }
  // 3. Worked exercises (online bank, printable) and automatismes (timed series, projectable, printable) per live chapter.
  for (const [cls, ids] of Object.entries(exerciseChapters)) for (const id of ids) {
    const ch = chapterOf.get(id);
    if (!ch || !classIds.has(cls)) continue;
    add({id: `exercises:${id}`, type: 'exercises', route: `#bank/${cls}/${id}`, title: [`Exercices : ${ch.title[0]}`, `Exercises: ${ch.title[1] || ch.title[0]}`], summary: className(cls),
      classes: [cls], tags: tagsOfChapter.get(id) || [], concepts: [ch.topic].filter(Boolean), synonyms: [], chapter: id,
      actions: {open: {href: `#bank/${cls}/${id}`}, print: {href: `#bank/${cls}/${id}`, via: 'page'}}, related: []});
  }
  for (const [id, domains] of Object.entries(automatismes)) {
    const ch = chapterOf.get(id);
    if (!ch || !classIds.has(ch.course)) continue;
    add({id: `automatismes:${id}`, type: 'automatismes', route: '#automatismes', title: [`Automatismes : ${ch.title[0]}`, `Starters: ${ch.title[1] || ch.title[0]}`], summary: className(ch.course),
      classes: [ch.course], tags: tagsOfChapter.get(id) || [], concepts: [ch.topic, ...domains].filter(Boolean), synonyms: [], chapter: id,
      actions: {open: {href: '#automatismes', prepare: {chapter: id}}, project: {href: '#automatismes/go', prepare: {chapter: id}}, print: {href: '#automatismes', prepare: {chapter: id}, via: 'page'}}, related: []});
  }
  // 4. Past papers: one record per exercise (opens its own page). They are never claimed printable or projectable here.
  for (const r of annals) {
    const cls = classIds.has(r.cls) ? [r.cls] : [];
    const tags = [...new Set((r.chapters || []).flatMap(c => tagsOfChapter.get(c) || []))];
    add({id: `annales:${r.id}`, type: 'annales', route: `#bank/annales/${r.id}`, title: [`${r.session} · exercice ${r.number}`, `${r.session} · exercise ${r.number}`],
      summary: pair((r.tags || []).join(', ')), classes: cls, tags, concepts: (r.tags || []).map(String), synonyms: [r.family, String(r.year)], chapter: '', actions: {open: {href: `#bank/annales/${r.id}`}}, related: []});
  }
  // 5. Worksheets and tests (one tool for every class).
  add({id: 'tool:sheets', type: 'tool', route: '#sheets', title: ['Fiches et évaluations', 'Worksheets and tests'], summary: ['Fiches, interros et devoirs avec corrigé, sujets A et B.', 'Worksheets, quizzes and tests with answer key, subjects A and B.'],
    classes: [], tags: [], concepts: [], synonyms: ['interro', 'devoir', 'évaluation', 'quiz', 'test'], chapter: '', actions: {open: {href: '#sheets'}, print: {href: '#sheets', via: 'page'}}, related: []});
  // Relations and sibling links. A resource of a chapter inherits the chapter's relations through its tags, and a resource names
  // its siblings (same chapter) and the resources it is linked to, when they survived the live filter.
  const byRoute = new Map([...items.values()].filter(i => i.route && !i.id.startsWith('slides:') && !i.id.startsWith('exercises:') && !i.id.startsWith('automatismes:')).map(i => [i.route, i.id]));
  const chapterWords = new Map();
  for (const it of items.values()) {
    const words = new Set([...it.tags.flatMap(t => t.split('/')), ...it.concepts, ...tokens(it.title[0]), ...tokens(it.title[1])].map(w => stem(fold(w))));
    const own = it.route.replace(/\/$/, '');
    it.relations = RELATIONS.filter(r => r.routes.includes(own) || r.concepts.some(c => words.has(stem(fold(c))) || (c.includes('-') === false && c.includes(' ') && fold(it.title[0]).includes(fold(c))))).map(r => r.id);
    it.related = it.related.map(r => byRoute.get(r.split('/').slice(0, 2).join('/'))).filter(Boolean);
    if (it.chapter) chapterWords.set(it.chapter, [...(chapterWords.get(it.chapter) || []), it.id]);
  }
  // Chapter-linked kinds share the relations of their chapter, so a topic found through a chapter reaches its slides too.
  for (const it of items.values()) if (it.chapter && !it.id.startsWith('chapter:')) {
    const chapterItem = items.get(`chapter:${it.chapter}`);
    if (chapterItem) it.relations = [...new Set([...it.relations, ...chapterItem.relations])];
  }
  for (const it of items.values()) {
    const sib = it.chapter ? chapterWords.get(it.chapter).filter(x => x !== it.id) : [];
    it.related = [...new Set([...it.related, ...sib])].filter(x => x !== it.id && items.has(x));
    it.synonyms = [...it.synonyms, ...typeLabel(it.type), ...it.relations.flatMap(id => RELATIONS.find(r => r.id === id).synonyms)];
    it.search = {title: tokens(it.title.join(' ')), tags: [...new Set(tokens([...it.tags.flatMap(t => t.split('/')), ...it.concepts].join(' ')))], synonyms: [...new Set(tokens(it.synonyms.join(' ')))], summary: tokens(it.summary.join(' ')),
      relations: tokens(it.relations.map(id => relationText(RELATIONS.find(r => r.id === id))).join(' '))};
    it.titleFold = fold(it.title.join(' '));
  }
  return [...items.values()];
}

// Stable, public view of an item (drops the internal search tokens).
export const publicItem = it => ({id: it.id, type: it.type, title: it.title, class: it.classes, classes: it.classes, topics: it.relations, tags: it.tags, concepts: it.concepts, synonyms: it.synonyms,
  projectable: it.projectable, printable: it.printable, manipulable: it.manipulable, hrefs: Object.fromEntries(Object.entries(it.actions).map(([k, a]) => [k, a.href]))});

// Actions in display order, never duplicated: a "Manipuler" that opens the same page as "Ouvrir" replaces it.
export const ACTION_ORDER = [['open', ['Ouvrir', 'Open']], ['project', ['Projeter', 'Project']], ['manipulate', ['Manipuler', 'Manipulate']], ['print', ['Imprimer', 'Print']]];
export function actionsOf(item) {
  const out = [];
  for (const [key, label] of ACTION_ORDER) {
    const a = item.actions[key];
    if (!a?.href) continue;
    if (key === 'open' && item.actions.manipulate?.href === a.href) continue;
    out.push({key, label, href: a.href, prepare: a.prepare || null});
  }
  return out;
}
// The one address a favorite or a recent item points to.
export const primaryHref = item => (item.actions.open || item.actions.manipulate || item.actions.project)?.href || '';

const FIELD_WEIGHT = {title: 10, tags: 5, synonyms: 3, relations: 2, summary: 1.5};
function fieldHit(word, list, exactOnly = false) {
  let best = 0;
  for (const w of list) {
    if (w === word) return 1;
    if (!exactOnly && word.length >= 3 && w.startsWith(word)) best = Math.max(best, .7);
  }
  return best;
}
const TYPE_RANK = Object.fromEntries(TYPE_IDS.map((t, i) => [t, i]));
// Search with filters. Every query word must be found (itself or a synonym) in the title, topics, synonyms, relations or summary.
// A query that names a shared relation also brings in that relation's members. Without query, filters alone browse the index.
export function searchResources(index, {query = '', cls = '', topic = '', type = '', projectable = false, printable = false, limit = 0} = {}) {
  const words = tokens(query);
  const rels = new Set(relationsForQuery(query));
  const clauses = words.map(w => [{w, k: 1}, ...synonymsOf(w).map(s => ({w: s, k: .6}))]);
  const topicId = topic;
  const out = [];
  for (const it of index) {
    if (type && it.type !== type) continue;
    if (cls && it.classes.length && !it.classes.includes(cls)) continue;
    if (topicId && !(it.relations.includes(topicId) || it.tags.some(t => t === topicId || t.startsWith(topicId + '/')))) continue;
    if (projectable && !it.projectable) continue;
    if (printable && !it.printable) continue;
    let score = 0, ok = true;
    for (const alts of clauses) {
      let best = 0;
      for (const {w, k} of alts) for (const [f, weight] of Object.entries(FIELD_WEIGHT)) best = Math.max(best, k * weight * fieldHit(w, it.search[f], f === 'summary'));
      if (!best) {ok = false; break;}
      score += best;
    }
    const inRelation = rels.size && it.relations.some(r => rels.has(r));
    if (!ok && !inRelation) continue;
    if (!ok) score = 4;
    else if (inRelation) score += 3;
    if (words.length && it.titleFold.includes(fold(query))) score += 6;
    if (cls && it.classes.includes(cls)) score += 2;
    out.push({item: it, score});
  }
  out.sort((a, b) => b.score - a.score || TYPE_RANK[a.item.type] - TYPE_RANK[b.item.type] || a.item.title[0].localeCompare(b.item.title[0], 'fr') || (a.item.id < b.item.id ? -1 : 1));
  const list = out.map(x => x.item);
  return limit ? list.slice(0, limit) : list;
}
// A lab address with a mission, or a chapter address with a tab, is one page: such addresses compare by their first two segments, others whole.
export const routeBase = href => {const h = String(href || '').split('?')[0].replace(/\/$/, ''), p = h.split('/'); return /^#(lab|chapter|gallery)$/.test(p[0]) ? p.slice(0, 2).join('/') : h;};
// Related resources of one item: siblings of its chapter, linked pages, then anything sharing a registry relation.
// Options (all off by default, so the search page is unchanged): `types` (allow-list), `excludeTypes`, `excludeSameChapter`
// (no sibling of the item's own chapter), `otherClassChapters` (no chapter of the item's own class), `excludeHrefs` (addresses
// the page already shows), `perType` (at most that many of one type, for variety).
export function relatedTo(index, id, {limit = 6, types = null, excludeTypes = [], excludeSameChapter = false, otherClassChapters = false, excludeHrefs = [], perType = 0} = {}) {
  const it = index.find(x => x.id === id);
  if (!it) return [];
  const skip = new Set(excludeHrefs.map(routeBase)), banned = new Set(excludeTypes);
  const keep = x => !(types && !types.includes(x.type)) && !banned.has(x.type)
    && !(excludeSameChapter && it.chapter && x.chapter === it.chapter)
    && !(otherClassChapters && x.type === 'chapter' && x.classes.some(c => it.classes.includes(c)))
    && !Object.values(x.actions).some(a => skip.has(routeBase(a.href)));
  const scored = index.filter(x => x.id !== id && keep(x)).map(x => ({x, s: (it.related.includes(x.id) ? 10 : 0) + x.relations.filter(r => it.relations.includes(r)).length * 4 + (x.type !== it.type ? 1 : 0) - (x.type === 'annales' ? 3 : 0)}))
    .filter(o => o.s >= 4).sort((a, b) => b.s - a.s || (a.x.id < b.x.id ? -1 : 1));
  const out = [], count = {};
  for (const o of scored) {
    if (out.length >= limit) break;
    if (perType && (count[o.x.type] || 0) >= perType) continue;
    count[o.x.type] = (count[o.x.type] || 0) + 1;
    out.push(o.x);
  }
  return out;
}
// The index item a page address stands for: #chapter/<id>[/tab], #gallery/<id>, #lab/<experiment>[/<mission>]. Null for anything else.
const PAGE_TYPE = {chapter: 'chapter', gallery: 'gallery', lab: 'lab'};
export function itemForRoute(index, hash) {
  const base = routeBase(String(hash || '').startsWith('#') ? hash : '#' + hash), type = PAGE_TYPE[base.slice(1).split('/')[0]];
  return type ? index.find(x => x.type === type && x.route.replace(/\/$/, '') === base) || null : null;
}
// What a chapter, exhibit or experiment page shows in its "related resources" box: widening resources only (never the chapter's own
// slides, exercises or starters, never past papers), a few of each type, and nothing the page already links to (`excludeHrefs`).
const WIDEN = ['chapter', 'lab', 'gallery', 'challenge', 'history', 'misconception', 'lesson'];
export function relatedForPage(index, hash, {excludeHrefs = [], limit = 6} = {}) {
  const it = itemForRoute(index, hash);
  if (!it) return [];
  const own = it.type === 'chapter';
  return relatedTo(index, it.id, {limit, perType: 2, excludeHrefs, types: own ? WIDEN : WIDEN.filter(x => x !== 'misconception' && x !== 'lesson'), excludeSameChapter: own, otherClassChapters: own});
}
export const relationTitle = id => RELATIONS.find(r => r.id === id)?.title || [id, id];
