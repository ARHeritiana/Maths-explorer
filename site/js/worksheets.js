// "Fiches" (#sheets): a generator of worksheets, quizzes (interros) and supervised tests (devoirs). The teacher chooses the
// class, chapters, topics, levels, size, and whether to include a marking scheme (barème); the page builds a student
// version and a teacher version (same exercises, with corrections), optionally two subjects A and B, printable or as
// LaTeX source. Same seed, same document.
import { CLASSES, buildSheet, describeLevels } from './exercises/bank.js';
import { html, esc, sheetHtml, sheetTex, kindLabel } from './exercises/export.js';
import { P, contextNote, bindContextNote, stepSeed, loadSettings, saveSettings, typeset, download, printMarkup, stamp, classOptions, chapterChips, domainChips, levelChips, checked } from './exercises/ui-kit.js';

const KEY = 'maths-explorer-sheets-v1';
const DEFAULTS = { cls: 'premiere', kind: 'interro', chapters: [], domains: [], levels: [1, 2, 3], count: 3, parts: 3, authored: true, bareme: false, total: 20, two: false, seed: '' };
const SIZES = { sheet: [5, 3], interro: [3, 3], devoir: [4, 3] };
const newSeed = () => Math.random().toString(36).slice(2, 8);

export function sheetsPage(t) {
  const s = loadSettings(KEY, DEFAULTS);
  const kinds = [['sheet', P('Fiche d’exercices', 'Worksheet')], ['interro', P('Interrogation', 'Short quiz')], ['devoir', P('Devoir surveillé', 'Supervised test')]];
  return `<main id="main" tabindex="-1" class="page gen-page" data-gen="sheet"><h1>${t(P('Fiches, interros et devoirs', 'Worksheets, quizzes and tests'))}</h1>
<p class="page-intro">${t(P('Choisis ta classe et le type de fiche. Vérifie l’aperçu, puis imprime ; les corrigés et les autres téléchargements sont regroupés à côté.', 'Choose your class and worksheet type. Check the preview, then print; solutions and other downloads are grouped alongside.'))}</p>
<div class="gen-layout">
<form class="gen-form" id="gen-form" aria-label="${t(P('Réglages du document', 'Document settings'))}" onsubmit="return false">
<div class="gen-row">
<label class="gen-field"><span>${t(P('Classe', 'Class'))}</span><select name="cls">${classOptions(s.cls)}</select></label>
<label class="gen-field"><span>${t(P('Type de document', 'Document type'))}</span><select name="kind">${kinds.map(([id, l]) => `<option value="${id}"${id === s.kind ? ' selected' : ''}>${t(l)}</option>`).join('')}</select></label>
</div>
<div id="gen-context">${contextNote(s, t)}</div><div id="gen-chapters"></div><div id="gen-domains"></div><div id="gen-levels">${levelChips(s.levels, t)}</div>
<div class="gen-row">
<label class="gen-field"><span>${t(P('Nombre d’exercices', 'Number of exercises'))}</span><input type="number" name="count" min="1" max="10" value="${s.count}"></label>
<label class="gen-field"><span>${t(P('Questions par exercice généré', 'Questions per generated exercise'))}</span><input type="number" name="parts" min="1" max="5" value="${s.parts}"></label>
</div>
<label class="gen-check"><input type="checkbox" name="authored"${s.authored ? ' checked' : ''}> ${t(P('Inclure des exercices rédigés (avec correction détaillée) quand il y en a', 'Include written exercises (with a detailed correction) when available'))}</label>
<label class="gen-check"><input type="checkbox" name="bareme"${s.bareme ? ' checked' : ''}> ${t(P('Afficher un barème', 'Show a marking scheme'))}</label>
<label class="gen-field gen-total"><span>${t(P('Total des points', 'Total points'))}</span><input type="number" name="total" min="1" max="100" value="${s.total}"></label>
<label class="gen-check"><input type="checkbox" name="two"${s.two ? ' checked' : ''}> ${t(P('Deux sujets (A et B) pour limiter la copie', 'Two subjects (A and B) to limit copying'))}</label>
<div class="gen-row"><label class="gen-field"><span>${t(P('Code de la variante', 'Variant code'))}</span><input type="text" name="seed" value="${esc(s.seed)}" maxlength="24" autocomplete="off" spellcheck="false"></label><button type="button" class="btn btn-secondary" id="gen-new">${t(P('Nouvelle variante', 'New variant'))}</button><button type="button" class="btn btn-secondary" id="gen-prev" aria-label="${t(P('Variante précédente', 'Previous variant'))}">←</button><button type="button" class="btn btn-secondary" id="gen-next" aria-label="${t(P('Variante suivante', 'Next variant'))}">→</button></div>
<p class="muted">${t(P('La même graine redonne exactement le même document ; n’importe quel texte est une graine, donc le nombre de variantes est illimité.', 'The same seed gives exactly the same document; any text is a seed, so the number of variants is unlimited.'))}</p>
</form>
<section class="gen-output" aria-label="${t(P('Document généré', 'Generated document'))}">
<div class="gen-actions" role="group" aria-label="${t(P('Exports', 'Exports'))}">
<button type="button" class="btn btn-primary" data-act="print-student">${t(P('Imprimer (élèves)', 'Print (students)'))}</button>
<button type="button" class="btn btn-secondary" data-act="print-teacher">${t(P('Imprimer le corrigé', 'Print answer key'))}</button>
<button type="button" class="btn btn-secondary" data-act="tex-student">${t(P('LaTeX élèves (.tex)', 'LaTeX students (.tex)'))}</button>
<button type="button" class="btn btn-secondary" data-act="tex-teacher">${t(P('LaTeX corrigé (.tex)', 'LaTeX key (.tex)'))}</button>
</div>
<div class="gen-tabs" role="group" aria-label="${t(P('Aperçu', 'Preview'))}"><button type="button" class="btn-quiet" data-subject="A" aria-pressed="true">${t(P('Sujet A', 'Subject A'))}</button><button type="button" class="btn-quiet" data-subject="B" aria-pressed="false" hidden>${t(P('Sujet B', 'Subject B'))}</button><span class="gen-sep"></span><button type="button" class="btn-quiet" data-version="student" aria-pressed="true">${t(P('Élèves', 'Students'))}</button><button type="button" class="btn-quiet" data-version="teacher" aria-pressed="false">${t(P('Corrigé', 'Answer key'))}</button></div>
<p id="gen-summary" class="muted" role="status" aria-live="polite"></p>
<div id="gen-preview" class="gen-preview"></div>
</section></div></main>`;
}

export function bindSheets(root, t, { chapterTitle = (id) => id } = {}) {
  const form = root.querySelector('#gen-form'), $ = (sel) => root.querySelector(sel);
  const s = loadSettings(KEY, DEFAULTS);
  if (!s.seed) s.seed = newSeed();
  form.elements.seed.value = s.seed;
  bindContextNote(form, () => s);
  let docs = {}, subject = 'A', version = 'student', opts = null;

  const read = () => ({ cls: form.elements.cls.value, kind: form.elements.kind.value, chapters: checked(form, 'chapter'), domains: checked(form, 'domain'), levels: checked(form, 'level').map(Number).sort(), count: Math.max(1, Math.min(10, Number(form.elements.count.value) || 3)), parts: Math.max(1, Math.min(5, Number(form.elements.parts.value) || 3)), authored: form.elements.authored.checked, bareme: form.elements.bareme.checked, total: Math.max(1, Math.min(100, Number(form.elements.total.value) || 20)), two: form.elements.two.checked, seed: form.elements.seed.value.trim() || s.seed });
  const drawChips = (cls) => { $('#gen-chapters').innerHTML = chapterChips(cls, s.chapters.filter((c) => c.startsWith(cls)), chapterTitle, t); $('#gen-domains').innerHTML = domainChips(cls, s.domains, t); };
  drawChips(s.cls);
  const subtitle = (o) => `${CLASSES.find((c) => c.id === o.cls).label}${o.chapters.length ? ` · ${o.chapters.map(chapterTitle).join(', ')}` : ''} · ${describeLevels(o.levels.length ? o.levels : [1, 2, 3])}`;

  function show() {
    const doc = docs[subject] || docs.A, o = opts;
    root.querySelectorAll('[data-subject]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.subject === subject)));
    root.querySelectorAll('[data-version]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.version === version)));
    const holder = $('#gen-preview');
    holder.innerHTML = doc.exercises.length ? sheetHtml(doc, { teacher: version === 'teacher', bareme: o.bareme, title: `${kindLabel(doc.kind)}${o.two ? ` ${subject}` : ''}`, subtitle: subtitle(o) }) : `<p>${t(P('Aucun exercice ne correspond à ces réglages : élargis les chapitres, thèmes ou niveaux.', 'No exercise matches these settings: widen the chapters, topics or levels.'))}</p>`;
    typeset(holder);
  }
  function rebuild() {
    const o = read();
    Object.assign(s, o); saveSettings(KEY, s);
    opts = o;
    const levels = o.levels.length ? o.levels : [1, 2, 3];
    const make = (tag) => buildSheet({ kind: o.kind, cls: o.cls, chapters: o.chapters, domains: o.domains, levels, count: o.count, parts: o.parts, includeAuthored: o.authored, total: o.total, seed: `${o.seed}${tag}`, chapterTitle });
    docs = { A: make('A') };
    if (o.two) docs.B = make('B');
    if (!o.two) subject = 'A';
    root.querySelector('[data-subject="B"]').hidden = !o.two;
    root.querySelector('.gen-total').hidden = !o.bareme;
    const d = docs.A;
    $('#gen-summary').textContent = d.exercises.length ? `${d.exercises.length} ${t(P('exercices', 'exercises'))} · ${t(P('durée indicative', 'estimated time'))} ${d.minutes} min${o.bareme ? ` · ${t(P('barème sur', 'marked out of'))} ${d.total}` : ''}` : '';
    show();
  }

  form.addEventListener('change', (e) => {
    if (e.target.name === 'cls') { s.chapters = []; s.domains = []; drawChips(e.target.value); }
    if (e.target.name === 'kind') { const [c, p] = SIZES[e.target.value]; form.elements.count.value = c; form.elements.parts.value = p; }
    rebuild();
  });
  for (const n of ['count', 'parts', 'total', 'seed']) form.elements[n].addEventListener('input', rebuild);
  $('#gen-new').addEventListener('click', () => { form.elements.seed.value = newSeed(); rebuild(); });
  $('#gen-prev').addEventListener('click', () => { form.elements.seed.value = stepSeed(form.elements.seed.value.trim() || s.seed, -1); rebuild(); });
  $('#gen-next').addEventListener('click', () => { form.elements.seed.value = stepSeed(form.elements.seed.value.trim() || s.seed, 1); rebuild(); });
  root.addEventListener('click', (e) => {
    const sb = e.target.closest('[data-subject]'); if (sb) { subject = sb.dataset.subject; show(); return; }
    const vb = e.target.closest('[data-version]'); if (vb) { version = vb.dataset.version; show(); return; }
    const b = e.target.closest('[data-act]'); if (!b || !docs.A?.exercises.length) return;
    const doc = docs[subject] || docs.A, o = opts, title = `${kindLabel(doc.kind)}${o.two ? ` ${subject}` : ''}`, name = `${doc.kind}-${stamp(o.cls, o.seed)}${o.two ? subject.toLowerCase() : ''}`, act = b.dataset.act;
    const tp = { bareme: o.bareme, title, subtitle: subtitle(o) };
    if (act === 'print-student') printMarkup(sheetHtml(doc, { ...tp }));
    else if (act === 'print-teacher') printMarkup(sheetHtml(doc, { ...tp, teacher: true }));
    else if (act === 'tex-student') download(`${name}.tex`, sheetTex(doc, { ...tp, version: 'student' }), 'application/x-tex');
    else if (act === 'tex-teacher') download(`${name}-corrige.tex`, sheetTex(doc, { ...tp, version: 'teacher' }), 'application/x-tex');
  });
  rebuild();
  return () => { document.querySelector('.print-doc')?.remove(); };
}
