import {courseLanguage} from "./content-language.js";
import { courses, university } from './catalogue-data.js';
import { assetHref, fetchJSON } from './data-loader.js';
// Custom pack builder and LaTeX sources browser.
// PDFs are merged in the browser from the files the site already serves; nothing is uploaded.
import { resourceCatalog } from './resources-data.js';

const P = (fr, en) => [fr, en];
const E = x => String(x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const COURSES = Object.fromEntries(courses.map(c=>[c.id,c.title]));
// Order and labels of the parts a visitor can include. Keys are the resource-id suffixes in catalog.json.
const PARTS = [
  ['chapter', P('Chapitre complet', 'Complete chapter'), 'student'],
  ['activities', P('Diagnostic et recherche', 'Diagnostic and investigation'), 'student'],
  ['notes', P('Cours et exemples', 'Notes and examples'), 'student'],
  ['practice', P('Applications guidées', 'Guided practice'), 'student'],
  ['exercises', P('Exercices', 'Exercises'), 'student'],
  ['problems', P('Problèmes de synthèse', 'Synthesis problems'), 'student'],
  ['assessment', P('QCM et bilan', 'Quizzes and review'), 'student'],
  ['fluency-student', P('Automatismes', 'Fluency sheets'), 'student'],
  ['teacher', P('Chapitre professeur complet', 'Complete teacher chapter'), 'teacher'],
  ['corrections', P('Corrigés et accompagnement', 'Solutions and guidance'), 'teacher'],
  ['solutions', P('Corrigés', 'Solutions'), 'teacher'],
  ['fluency-teacher', P('Automatismes, professeur', 'Fluency sheets, teacher'), 'teacher'],
  ['matrix', P('Matrice de couverture (professeur)', 'Coverage matrix (teacher)'), 'teacher'],
  ['schedule', P('Conduite annuelle (professeur)', 'Annual schedule (teacher)'), 'teacher'],
];
// A complete chapter already contains its excerpts: the page warns when both are ticked.
const OVERLAPS = { chapter: ['activities', 'notes', 'practice', 'exercises', 'problems', 'assessment'], teacher: ['corrections'] };

let catalog = null;
const state = { course: 'premiere', chapters: new Set(), parts: new Set(['chapter']), lang: 'fr', cover: true };
const libs = {};

const load = src => libs[src] ||= new Promise((ok, fail) => {
  const s = document.createElement('script');
  s.src = src; s.onload = ok; s.onerror = () => fail(new Error('Could not load ' + src));
  document.head.append(s);
});
async function loadCatalog() {
  if (catalog) return;
  catalog = await fetchJSON('./resources/catalog.json');
}
const fmtBytes = b => b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' kB';

function chaptersOf(course) {
  const own = resourceCatalog.chapters.filter(c => c.course === course);
  if (own.length) return own.map(c => ({ id: c.id, title: c.title, number: c.number }));
  const ids = [...new Set(catalog.resources.filter(r => r.course === course).map(r => r.chapter))];
  return ids.map(id => {
    const ch = catalog.chapters.find(c => c.id === id);
    return { id, title: ch?.title || [id, id], number: ch?.number ?? 0 };
  });
}
const suffix = r => r.id.slice(r.chapter.length + 1);
const partKey = r => suffix(r);
function pick() {
  const out = [];
  for (const id of state.chapters) {
    const mine = catalog.resources.filter(r => r.chapter === id);
    for (const [key] of PARTS) {
      if (!state.parts.has(key)) continue;
      const r = mine.find(r => partKey(r) === key);
      if (r) out.push(r);
    }
  }
  return out;
}
const urlFor = (r, lang) => './' + (lang === 'en' ? r.url[1] : r.url[0]).replace(/^\.\//, '');

export function packPage(t, id) {
  return `<main id="main" tabindex="-1" class="page pack-page">
  <div class="pack-heading"><h1>${t(P('Compose ton dossier', 'Build your own pack'))}</h1>
  <p>${t(P('Choisis des chapitres et les parties dont tu as besoin : un seul PDF, dans ta langue, prêt à imprimer. Tout est assemblé sur ton appareil.', 'Choose chapters and the parts you need: one PDF, in your language, ready to print. Everything is assembled on your device.'))}</p></div>
  <div id="pack-app" data-initial="${E(id || '')}"><p role="status">${t(P('Chargement du catalogue…', 'Loading the catalogue…'))}</p></div></main>`;
}

export async function bindPack(t) {
  const root = document.querySelector('#pack-app');
  if (!root) return;
  try { await loadCatalog(); } catch {
    root.innerHTML = `<p class="pack-error" role="alert">${t(P('Le catalogue est introuvable. Recharge la page.', 'The catalogue could not be loaded. Reload the page.'))}</p>`;
    return;
  }
  const initial = root.dataset.initial;
  if (initial && COURSES[initial]) state.course = initial;
  else if (initial) {
    const hit = catalog.resources.find(r => r.chapter === initial);
    if (hit) { state.course = hit.course; state.chapters = new Set([initial]); }
  }
  const lang = t(P('fr', 'en'));
  state.lang = lang;
  paint(root, t);
}

function paint(root, t) {
  state.lang=courseLanguage(state.course,t(P("fr","en")));
  const chapters = chaptersOf(state.course);
  const available = new Set(catalog.resources.filter(r => chapters.some(c => c.id === r.chapter)).map(partKey));
  const items = pick();
  const pages = items.reduce((n, r) => n + r.pages, 0);
  const size = items.reduce((n, r) => n + (state.lang === 'en' ? r.englishBytes : r.bytes), 0);
  const overlap = [...state.parts].filter(k => OVERLAPS[k]?.some(o => state.parts.has(o)));
  const partBox = ([key, label, audience]) => available.has(key) ? `<label class="pack-check"><input type="checkbox" name="part" value="${key}" ${state.parts.has(key) ? 'checked' : ''}> <span>${E(t(label))}</span></label>` : '';
  const groups = ['student', 'teacher'].map(a => {
    const boxes = PARTS.filter(p => p[2] === a).map(partBox).join('');
    return boxes ? `<fieldset class="pack-group"><legend>${t(a === 'student' ? P('Pour l’élève', 'For students') : P('Pour le professeur', 'For teachers'))}</legend>${boxes}</fieldset>` : '';
  }).join('');
  root.innerHTML = `
  <div class="pack-grid">
    <section class="pack-step" aria-labelledby="pack-h-course">
      <h2 id="pack-h-course">${t(P('1. Cours', '1. Course'))}</h2>
      <div class="pack-courses" role="radiogroup" aria-label="${t(P('Cours', 'Course'))}">${Object.entries(COURSES).filter(([k]) => catalog.resources.some(r => r.course === k)).map(([k, v]) =>
        `<label class="pack-pill"><input type="radio" name="course" value="${k}" ${state.course === k ? 'checked' : ''}><span>${E(t(v))}</span></label>`).join('')}</div>
    </section>
    <section class="pack-step" aria-labelledby="pack-h-ch">
      <h2 id="pack-h-ch">${t(P('2. Chapitres', '2. Chapters'))}</h2>
      <div class="pack-tools"><button type="button" data-act="all">${t(P('Tout cocher', 'Select all'))}</button><button type="button" data-act="none">${t(P('Tout décocher', 'Clear'))}</button></div>
      <ul class="pack-chapters">${chapters.map(c => `<li><label class="pack-check"><input type="checkbox" name="chapter" value="${c.id}" ${state.chapters.has(c.id) ? 'checked' : ''}> <span>${c.number ? c.number + '. ' : ''}${E(t(c.title))}</span></label></li>`).join('')}</ul>
    </section>
    <section class="pack-step" aria-labelledby="pack-h-parts">
      <h2 id="pack-h-parts">${t(P('3. Parties', '3. Parts'))}</h2>${groups}
      ${overlap.length ? `<p class="pack-note" role="note">${t(P('Le chapitre complet contient déjà ses extraits : les pages seraient en double.', 'A complete chapter already contains its excerpts: pages would appear twice.'))}</p>` : ''}
    </section>
    <section class="pack-step pack-output" aria-labelledby="pack-h-out">
      <h2 id="pack-h-out">${t(P('4. Ton dossier', '4. Your pack'))}</h2>

      <label class="pack-check"><input type="checkbox" name="cover" ${state.cover ? 'checked' : ''}> <span>${t(P('Ajouter une page de sommaire', 'Add a contents page'))}</span></label>
      <p class="pack-summary" role="status">${items.length ? `${items.length} ${t(P('documents', 'documents'))} · ${pages} ${t(P('pages', 'pages'))} · ${fmtBytes(size)}${state.lang === 'both' ? ' ×2' : ''}` : t(P('Aucun document sélectionné. Coche au moins un chapitre et une partie.', 'Nothing selected yet. Tick at least one chapter and one part.'))}</p>
      <div class="pack-actions"><button type="button" class="pack-primary" data-act="merge" ${items.length ? '' : 'disabled'}>${t(P('Télécharger le PDF', 'Download the PDF'))}</button>
      <button type="button" data-act="zip" ${items.length ? '' : 'disabled'}>${t(P('Fichiers séparés (ZIP)', 'Separate files (ZIP)'))}</button></div>
      <p class="pack-progress" id="pack-progress" role="status" aria-live="polite"></p>
    </section>
  </div>`;
  root.querySelectorAll('[name=course]').forEach(i => i.addEventListener('change', () => { state.course = i.value; state.chapters = new Set(); paint(root, t); root.querySelector('[name=course]:checked')?.focus(); }));
  root.querySelectorAll('[name=chapter]').forEach(i => i.addEventListener('change', () => { i.checked ? state.chapters.add(i.value) : state.chapters.delete(i.value); paint(root, t); root.querySelector(`[name=chapter][value="${i.value}"]`)?.focus(); }));
  root.querySelectorAll('[name=part]').forEach(i => i.addEventListener('change', () => { i.checked ? state.parts.add(i.value) : state.parts.delete(i.value); paint(root, t); root.querySelector(`[name=part][value="${i.value}"]`)?.focus(); }));
  root.querySelectorAll('[name=lang]').forEach(i => i.addEventListener('change', () => { state.lang = i.value; paint(root, t); root.querySelector('[name=lang]:checked')?.focus(); }));
  root.querySelector('[name=cover]')?.addEventListener('change', e => { state.cover = e.target.checked; });
  root.querySelector('[data-act=all]')?.addEventListener('click', () => { chapters.forEach(c => state.chapters.add(c.id)); paint(root, t); });
  root.querySelector('[data-act=none]')?.addEventListener('click', () => { state.chapters = new Set(); paint(root, t); });
  root.querySelector('[data-act=merge]')?.addEventListener('click', () => run(root, t, 'merge'));
  root.querySelector('[data-act=zip]')?.addEventListener('click', () => run(root, t, 'zip'));
}

function saveBlob(bytes, name, type) {
  const url = URL.createObjectURL(new Blob([bytes], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
const fetchBytes = async url => { const r = await fetch(assetHref(url)); if (!r.ok) throw new Error(url); return new Uint8Array(await r.arrayBuffer()); };

async function mergeOne(items, lang, t, say) {
  const { PDFDocument, StandardFonts, rgb } = PDFLib;
  const out = await PDFDocument.create({ updateMetadata: false });
  const parts = [];
  for (const [i, r] of items.entries()) {
    say(`${i + 1} / ${items.length}`);
    const src = await PDFDocument.load(await fetchBytes(urlFor(r, lang)), { updateMetadata: false });
    const pages = await out.copyPages(src, src.getPageIndices());
    parts.push({ r, start: out.getPageCount() + 1, n: pages.length, pages });
    pages.forEach(p => out.addPage(p));
  }
  if (state.cover) {
    const font = await out.embedFont(StandardFonts.Helvetica), bold = await out.embedFont(StandardFonts.HelveticaBold);
    const safe = s => [...s].map(c => { try { font.encodeText(c); return c; } catch { return '?'; } }).join('');
    const cover = out.insertPage(0, [595, 842]);
    cover.drawText('Maths Explorer', { x: 56, y: 770, size: 26, font: bold, color: rgb(0.06, 0.1, 0.2) });
    cover.drawText(lang === 'en' ? 'Custom pack' : 'Dossier sur mesure', { x: 56, y: 742, size: 14, font, color: rgb(0.2, 0.3, 0.4) });
    let y = 700;
    for (const p of parts) {
      if (y < 60) break;
      const ch = catalog.chapters.find(c => c.id === p.r.chapter);
      const title = safe(`${(ch?.title || [p.r.chapter, p.r.chapter])[lang === 'en' ? 1 : 0]}: ${p.r.title[lang === 'en' ? 1 : 0]}`);
      cover.drawText(title.length > 100 ? title.slice(0, 97) + '...' : title, { x: 56, y, size: 9, font, color: rgb(0.1, 0.12, 0.2) });
      cover.drawText(String(p.start + 1), { x: 520, y, size: 10.5, font, color: rgb(0.2, 0.3, 0.4) });
      y -= 17;
    }
  }
  out.setTitle(lang === 'en' ? 'Maths Explorer: custom pack' : 'Maths Explorer : dossier sur mesure');
  out.setAuthor('Maths Explorer'); out.setProducer('Maths Explorer'); out.setCreator('Maths Explorer');
  out.setSubject(''); out.setKeywords([]);
  return out.save();
}

async function run(root, t, mode) {
  const say = s => { root.querySelector('#pack-progress').textContent = s; };
  const items = pick();
  if (!items.length) return;
  const buttons = root.querySelectorAll('button'); buttons.forEach(b => b.disabled = true);
  const langs = state.lang === 'both' ? ['fr', 'en'] : [state.lang];
  try {
    say(t(P('Préparation…', 'Preparing…')));
    await Promise.all([load('./vendor/pdf-lib.min.js'), mode === 'zip' || langs.length > 1 ? load('./vendor/jszip.min.js') : null]);
    if (mode === 'merge' && langs.length === 1) {
      saveBlob(await mergeOne(items, langs[0], t, say), `maths-explorer-pack-${langs[0]}.pdf`, 'application/pdf');
    } else {
      const zip = new JSZip();
      if (mode === 'merge') for (const l of langs) zip.file(`maths-explorer-pack-${l}.pdf`, await mergeOne(items, l, t, say));
      else for (const [i, r] of items.entries()) for (const l of langs) {
        say(`${i + 1} / ${items.length}`);
        zip.file(`${l}/${urlFor(r, l).split('/').pop().replace(/^/, r.chapter + '-')}`, await fetchBytes(urlFor(r, l)));
      }
      saveBlob(await zip.generateAsync({ type: 'uint8array' }), 'maths-explorer-pack.zip', 'application/zip');
    }
    say(t(P('Terminé. Le téléchargement démarre.', 'Done. Your download is starting.')));
  } catch (e) {
    say(t(P('Échec de l’assemblage. Réessaie, ou télécharge les fichiers séparément.', 'The pack could not be assembled. Try again, or download the files separately.')));
  } finally {
    buttons.forEach(b => { b.disabled = false; });
  }
}

// ---------------------------------------------------------------- LaTeX sources
let manifest = null;
export function sourcesPage(t) {
  return `<main id="main" tabindex="-1" class="page pack-page sources-page">
  <div class="pack-heading"><h1>${t(P('Sources LaTeX', 'LaTeX sources'))}</h1>
  <p>${t(P('Télécharge les sources modifiables de chaque collection. Suis son guide de compilation : le moteur et les langues disponibles dépendent de la collection.', 'Download the editable sources for each collection. Follow its compilation guide; the engine and available languages depend on the collection.'))}</p></div>
  <div id="sources-app"><p role="status">${t(P('Chargement…', 'Loading…'))}</p></div></main>`;
}
export async function bindSources(t) {
  const root = document.querySelector('#sources-app');
  if (!root) return;
  try { manifest ||= await fetchJSON('./sources/manifest.json'); } catch {
    root.innerHTML = `<p class="pack-error" role="alert">${t(P('La liste des sources est introuvable.', 'The source list could not be loaded.'))}</p>`; return;
  }
  const kinds = { tex: P('Fichiers TeX', 'TeX files'), style: P('Classes et styles', 'Classes and styles'), figure: P('Figures', 'Figures') };
  root.innerHTML = manifest.courses.map(c => {
    const total = c.files.reduce((n, f) => n + f.bytes, 0);
    const entries = c.files.filter(f => f.entry);
    return `<section class="source-course" id="src-${c.id}"><div class="source-head"><h2>${E(t(c.title))}</h2>
      <p>${c.files.length} ${t(P('fichiers', 'files'))} · ${fmtBytes(total)}</p>
      <button type="button" data-zip="${c.id}">${t(P('Télécharger le cours (ZIP)', 'Download the course (ZIP)'))}</button></div>
      ${entries.length ? `<p class="source-entries">${t(P('Points d’entrée : ', 'Entry points: '))}${entries.map(f => `<code>${E(f.path.split('/').pop())}</code> (${f.entry.lang.toUpperCase()}, ${E(f.entry.edition)})`).join(', ')}</p>` : ''}
      ${Object.entries(kinds).map(([k, label]) => {
        const files = c.files.filter(f => f.kind === k);
        return files.length ? `<details><summary>${t(label)} (${files.length})</summary><ul class="source-files">${files.map(f => `<li><a href="${E(assetHref('./sources/'+f.path))}" download>${E(f.path.split('/').slice(1).join('/'))}</a> <span>${fmtBytes(f.bytes)}</span></li>`).join('')}</ul></details>` : '';
      }).join('')}</section>`;
  }).join('') + university.sections.map(section=>`<section class="source-course"><h2>${E(t(section.title))}</h2><ul>${section.documents.filter(d=>d.path.endsWith('.zip')).map(d=>`<li><a href="${E(assetHref('./'+d.path))}" download>${E(t(d.label))}</a></li>`).join('')}</ul></section>`).join('') + `<p class="source-note">${t(P('Guide de compilation : ', 'Compilation guide: '))}<a href="./sources/README.md">README</a></p><p class="pack-progress" id="src-progress" role="status" aria-live="polite"></p>`;
  root.querySelectorAll('[data-zip]').forEach(b => b.addEventListener('click', async () => {
    const say = s => { root.querySelector('#src-progress').textContent = s; };
    const course = manifest.courses.find(c => c.id === b.dataset.zip);
    b.disabled = true;
    try {
      await load('./vendor/jszip.min.js');
      const zip = new JSZip();
      for (const [i, f] of course.files.entries()) { say(`${i + 1} / ${course.files.length}`); zip.file(f.path, await fetchBytes('./sources/' + f.path)); }
      zip.file('README.md', await fetchBytes('./sources/README.md'));
      saveBlob(await zip.generateAsync({ type: 'uint8array' }), `maths-explorer-${course.id}-latex.zip`, 'application/zip');
      say(t(P('Terminé.', 'Done.')));
    } catch { say(t(P('Échec du téléchargement. Réessaie.', 'Download failed. Try again.'))); }
    finally { b.disabled = false; }
  }));
}
