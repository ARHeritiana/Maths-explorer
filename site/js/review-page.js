// #review (Réviser): spaced repetition of the objectives of the exercise bank, on this device only. Loaded on demand
// by app.js (mountMode). Today's session (one question at a time, self-graded with four grades), the choice of chapters
// and objectives, progress per chapter, and the data tools (export, import, reset). Rule and data: review-model.js;
// storage: review-state.js. Classes, chapters and objectives all come from the data (liveCourses, the catalogue,
// TEMPLATES): nothing about a level is written here. The call contract is app.js mountMode:
// mountReviewPage(main, {t, isGone}); the other options are for tests.
import { TEMPLATES, instance } from './exercises/bank.js';
import { html, esc } from './exercises/export.js';
import { liveCourses } from './live-curriculum.js';
import { discoveryChapters } from './catalogue-data.js';
import { currentCourse, rememberCourse } from './navigation-state.js';
import * as sharedStore from './review-state.js';
import * as M from './review-model.js';

const GRADE_LABELS = [['Raté', 'Missed'], ['Difficile', 'Hard'], ['Bien', 'Good'], ['Facile', 'Easy']];
const ERRORS = {
  'too-large': ['Le fichier est trop gros pour être un fichier de révisions.', 'The file is too large to be a review file.'],
  'not-json': ['Ce fichier n’est pas un fichier de révisions lisible.', 'This file is not a readable review file.'],
  'not-object': ['Ce fichier n’est pas un fichier de révisions.', 'This file is not a review file.'],
  'wrong-app': ['Ce fichier ne vient pas de la page Réviser.', 'This file does not come from the Review page.'],
  'wrong-version': ['Ce fichier vient d’une autre version de la page Réviser.', 'This file comes from another version of the Review page.'],
  'bad-cards': ['Ce fichier ne contient pas de liste de révisions.', 'This file contains no list of reviews.'],
  'bad-card': ['Une révision du fichier est abîmée :', 'One review of the file is damaged:'],
  'bad-settings': ['Les réglages du fichier sont abîmés.', 'The settings of the file are damaged.'],
  'bad-mode': ['Choisis d’abord fusionner ou remplacer.', 'Choose merge or replace first.'],
  unreadable: ['Le fichier n’a pas pu être lu.', 'The file could not be read.'],
};

export async function mountReviewPage(main, { t, isGone = () => false, now = () => new Date(), store = sharedStore, templates = TEMPLATES, courses = liveCourses, chapters = discoveryChapters, typesetMath, save } = {}) {
  if (isGone()) return () => {};
  const T = (p) => (t ? t(p) : p[0]), L = (fr, en) => T([fr, en]), en = L('fr', 'en') === 'en';
  const doc = main.ownerDocument, win = doc.defaultView, $ = (s) => main.querySelector(s);
  const kit = () => import('./exercises/ui-kit.js');
  const typeset = typesetMath || ((root) => kit().then((m) => m.typeset(root)).catch(() => {}));
  const download = save || ((name, text) => kit().then((m) => m.download(name, text, 'application/json;charset=utf-8')));

  // The objectives: the generators of the classes that are live here, in the order of the bank.
  const live = new Set(courses.map((c) => c.id));
  const objectives = templates.filter((o) => live.has(o.cls) && M.validId(o.id));
  const byId = new Map(objectives.map((o, i) => [o.id, { ...o, rank: i }]));
  const known = new Set(byId.keys()), rank = (id) => byId.get(id)?.rank;
  const classes = courses.filter((c) => objectives.some((o) => o.cls === c.id));
  const chapterTitle = (id) => { const c = chapters.find((x) => x.id === id); return c?.title ? T(c.title) : id; };
  const courseTitle = (id) => { const c = courses.find((x) => x.id === id); return c ? (Array.isArray(c.title) ? c.title[0] : String(c.title || id)) : id; };
  const today = () => M.dayNumber(now());
  const dayText = (day) => (day === today() + 1 ? L('demain', 'tomorrow') : M.dayDate(day).toLocaleDateString(en ? 'en-GB' : 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }));
  const days = (n) => (n === 0 ? L('aujourd’hui', 'today') : en ? `${n} d` : `${n} j`);
  const plural = (n, fr, frs, e, es) => `${n} ${n > 1 ? L(frs, es) : L(fr, e)}`;
  const nObj = (n) => plural(n, 'objectif', 'objectifs', 'objective', 'objectives');
  const statsText = (s) => `${s.due} ${L('à revoir', 'to review')}, ${s.learning} ${L('en apprentissage', 'learning')}, ${plural(s.mastered, 'acquis', 'acquis', 'mastered', 'mastered')}`;

  let cls = currentCourse('');
  if (!classes.some((c) => c.id === cls)) cls = classes[0]?.id || '';
  let state = store.load(), queue = [], done = 0, current = null, revealed = false, wipe = false;

  main.classList.add('rv-page');
  main.innerHTML = `<h1>${L('Réviser', 'Review')}</h1>
<p class="page-intro">${L('Quelques questions par jour sur les chapitres que tu choisis. Une question réussie revient plus tard, une question ratée revient vite. Les nombres changent à chaque fois.', 'A few questions a day on the chapters you choose. A question you get right comes back later, a missed one comes back soon. The numbers change every time.')}</p>
<div id="rv-notes"></div>
<section class="rv-section" aria-labelledby="rv-session-h"><h2 id="rv-session-h">${L('Séance du jour', 'Today’s session')}</h2>
<p id="rv-status" class="rv-status" role="status" aria-live="polite"></p><div id="rv-stage"></div></section>
<section class="rv-section" aria-labelledby="rv-choose-h"><h2 id="rv-choose-h">${L('Choisir ce que je révise', 'Choose what I review')}</h2>
<div class="rv-row"><label class="rv-field"><span>${L('Classe', 'Class')}</span><select id="rv-class">${classes.map((c) => `<option value="${esc(c.id)}"${c.id === cls ? ' selected' : ''}>${esc(courseTitle(c.id))}</option>`).join('')}</select></label>
<label class="rv-field"><span>${L('Nouvelles questions par jour', 'New questions per day')}</span><input type="number" id="rv-new" min="0" max="${M.MAX_NEW_PER_DAY}" step="1" inputmode="numeric" value="${state.settings.newPerDay}"></label></div>
<p class="rv-hint">${L('Coche un chapitre entier, ou ouvre-le pour choisir ses objectifs un par un. Un objectif décoché garde son historique : il revient tel quel si tu le recoches.', 'Tick a whole chapter, or open it to choose its objectives one by one. An unticked objective keeps its history: it comes back as it was if you tick it again.')}</p>
<ul id="rv-chapters" class="rv-chapters"></ul></section>
<section class="rv-section" aria-labelledby="rv-progress-h"><h2 id="rv-progress-h">${L('Mes progrès', 'My progress')}</h2><div id="rv-progress"></div></section>
<section class="rv-section" aria-labelledby="rv-data-h"><h2 id="rv-data-h">${L('Mes données', 'My data')}</h2>
<p class="rv-hint">${L('Tes révisions restent sur cet appareil : pas de compte, rien n’est envoyé. Exporte un fichier pour les garder ou les passer sur un autre appareil.', 'Your reviews stay on this device: no account, nothing is sent. Export a file to keep them or to move them to another device.')}</p>
<p><button type="button" class="btn btn-secondary" id="rv-export">${L('Exporter mes révisions', 'Export my reviews')}</button></p>
<fieldset class="rv-import"><legend>${L('Importer un fichier de révisions', 'Import a review file')}</legend>
<label class="rv-field"><span>${L('Fichier (.json)', 'File (.json)')}</span><input type="file" id="rv-file" accept="application/json,.json"></label>
<div class="rv-modes"><label class="rv-check"><input type="radio" name="rv-mode" value="merge" checked><span>${L('Fusionner : pour chaque objectif, garder la révision la plus récente', 'Merge: for each objective, keep the latest review')}</span></label>
<label class="rv-check"><input type="radio" name="rv-mode" value="replace"><span>${L('Remplacer : effacer mes révisions et prendre celles du fichier', 'Replace: erase my reviews and take those of the file')}</span></label></div>
<p><button type="button" class="btn btn-secondary" id="rv-import">${L('Importer', 'Import')}</button></p></fieldset>
<p><button type="button" class="btn btn-secondary" id="rv-reset">${L('Tout effacer', 'Erase everything')}</button></p>
<div id="rv-confirm" class="rv-confirm" hidden><p>${L('Effacer toutes mes révisions sur cet appareil ? On ne peut pas revenir en arrière.', 'Erase all my reviews on this device? This cannot be undone.')}</p>
<p class="rv-actions"><button type="button" class="btn btn-secondary" id="rv-reset-no">${L('Annuler', 'Cancel')}</button><button type="button" class="btn btn-primary" id="rv-reset-yes">${L('Oui, tout effacer', 'Yes, erase everything')}</button></p></div>
<p id="rv-data-msg" class="rv-msg" role="status" aria-live="polite"></p></section>`;

  // ---- notes about storage ----
  function notes() {
    const out = [];
    let info = { dropped: 0, damaged: false }; try { info = store.inspect?.() || info; } catch { /* keep the default */ }
    if (store.storageStatus?.() === 'memory-only') out.push(L('Attention : cet appareil refuse d’enregistrer. Tes révisions seront perdues en fermant la page ; exporte-les avant de partir.', 'Warning: this device refuses to save. Your reviews will be lost when the page closes; export them before leaving.'));
    if (info.damaged) out.push(L('Les révisions enregistrées étaient illisibles : la page repart de zéro. Si tu as un fichier exporté, importe-le.', 'The saved reviews could not be read: the page starts again from nothing. If you have an exported file, import it.'));
    else if (info.dropped) out.push(L(`${info.dropped} révision(s) abîmée(s) ont été ignorée(s) ; les autres sont intactes.`, `${info.dropped} damaged review(s) were ignored; the others are intact.`));
    $('#rv-notes').innerHTML = out.map((x) => `<p class="rv-note" role="note">${esc(x)}</p>`).join('');
  }

  // ---- session ----
  const total = () => done + queue.length;
  const commit = (fn, kind) => { state = store.update ? store.update(fn, kind) : store.save(fn(store.load()), kind); return state; };
  function refill() { queue = M.dueToday(state, today(), { known, rank }); current = null; revealed = false; }
  function stage() {
    const host = $('#rv-stage'), status = $('#rv-status'), d = today();
    if (!queue.length) {
      current = null; revealed = false;
      const s = M.stats(state, d, { known }), next = s.nextDue === null ? '' : `${L('Prochaine révision :', 'Next review:')} ${dayText(s.nextDue)}.`;
      const waiting = s.fresh ? ` ${L(`Il reste ${s.fresh} question(s) nouvelle(s) pour les jours suivants.`, `${s.fresh} new question(s) remain for the following days.`)}` : '';
      status.textContent = done ? L(`Séance terminée : ${done} / ${done}.`, `Session finished: ${done} / ${done}.`) : '';
      host.innerHTML = !s.total
        ? `<div class="rv-empty"><p><strong>${L('Tu n’as encore rien choisi.', 'You have not chosen anything yet.')}</strong></p><p>${L('Coche un chapitre juste en dessous. Les premières questions arrivent ici tout de suite, puis quelques-unes chaque jour.', 'Tick a chapter just below. The first questions arrive here at once, then a few every day.')}</p></div>`
        : done
          ? `<div class="rv-empty" id="rv-summary" tabindex="-1"><p><strong>${L('Séance terminée.', 'Session finished.')}</strong> ${L(`Tu as travaillé ${plural(done, 'question', 'questions', 'question', 'questions')} aujourd’hui.`, `You worked on ${plural(done, 'question', 'questions', 'question', 'questions')} today.`)}</p><p>${next}${waiting}</p></div>`
          : `<div class="rv-empty"><p><strong>${L('Rien à réviser aujourd’hui.', 'Nothing to review today.')}</strong></p><p>${next}${waiting} ${L('Tu peux aussi cocher un autre chapitre.', 'You can also tick another chapter.')}</p></div>`;
      return;
    }
    const id = queue[0], o = byId.get(id), card = M.cardOf(state, id);
    const item = instance(o, M.levelFor(card), M.seedFor(id, card, d)), ivl = M.preview(card, d);
    current = { id, item }; revealed = false;
    status.textContent = `${L('Question', 'Question')} ${done + 1} / ${total()}`;
    host.innerHTML = `<article class="rv-card"><p class="rv-meta">${esc(chapterTitle(o.chapter))} · ${esc(o.skill || '')}</p>
<div class="rv-q" id="rv-q" tabindex="-1">${html(item.q)}</div>
<div class="rv-a" id="rv-a" tabindex="-1" hidden></div>
<p class="rv-actions" id="rv-reveal-row"><button type="button" class="btn btn-primary rv-big" id="rv-reveal">${L('Voir la réponse', 'Show the answer')}</button></p>
<div id="rv-grade" hidden><p class="rv-ask" id="rv-ask">${L('Compare avec ta réponse, puis note-toi honnêtement.', 'Compare with your answer, then grade yourself honestly.')}</p>
<div class="rv-grades" role="group" aria-labelledby="rv-ask">${GRADE_LABELS.map((g, i) => `<button type="button" class="btn btn-secondary rv-grade" data-grade="${i}"><span class="rv-key" aria-hidden="true">${i + 1}</span><span class="rv-glabel">${T(g)}</span><span class="rv-when">${i === 0 ? L('revient aujourd’hui', 'back today') : `${L('dans', 'in')} ${days(ivl[i])}`}</span></button>`).join('')}</div></div>
<p class="rv-hint rv-keys">${L('Clavier : Espace ou Entrée pour voir la réponse, puis 1, 2, 3 ou 4 pour noter.', 'Keyboard: Space or Enter to show the answer, then 1, 2, 3 or 4 to grade.')}</p></article>`;
    typeset($('#rv-q'));
  }
  function reveal() {
    if (!current || revealed) return;
    revealed = true;
    const a = $('#rv-a'), x = current.item;
    a.innerHTML = `<h3>${L('Réponse', 'Answer')}</h3><div>${html(x.a)}</div>${x.s ? `<p>${html(x.s)}</p>` : ''}`;
    a.hidden = false; $('#rv-reveal-row').hidden = true; $('#rv-grade').hidden = false;
    typeset(a); a.focus({ preventScroll: true });
  }
  function doGrade(g) {
    if (!current || !revealed) return;
    const id = current.id, d = today();
    commit((s) => M.grade(s, id, g, d), 'grade');
    queue = queue.filter((x) => x !== id);
    if (g === 0 && M.isEnrolled(state, id)) queue.push(id); else done++;
    stage(); progress(); syncChoose();
    ($('#rv-q') || $('#rv-summary'))?.focus({ preventScroll: true });
  }

  // ---- choosing ----
  function chooseList() {
    const list = M.chaptersOf(objectives, cls);
    $('#rv-chapters').innerHTML = list.length ? list.map(({ chapter, ids }) => `<li class="rv-chapter" data-row="${esc(chapter)}">
<label class="rv-check rv-whole"><input type="checkbox" data-chapter="${esc(chapter)}"><span><strong>${esc(chapterTitle(chapter))}</strong> <span class="rv-count" data-count></span></span></label>
<details class="rv-objectives"><summary>${L('Choisir les objectifs', 'Choose the objectives')}<span class="sr-only"> : ${esc(chapterTitle(chapter))}</span></summary><ul>${ids.map((id) => `<li><label class="rv-check"><input type="checkbox" data-objective="${esc(id)}"><span>${esc(byId.get(id).skill || id)}</span></label></li>`).join('')}</ul></details></li>`).join('')
      : `<li class="rv-hint">${L('Aucun objectif pour cette classe pour le moment.', 'No objective for this class yet.')}</li>`;
    syncChoose();
  }
  function syncChoose() {
    for (const row of main.querySelectorAll('[data-row]')) {
      const boxes = [...row.querySelectorAll('[data-objective]')]; let on = 0;
      for (const b of boxes) { b.checked = M.isEnrolled(state, b.dataset.objective); if (b.checked) on++; }
      const whole = row.querySelector('[data-chapter]');
      whole.checked = on === boxes.length && on > 0; whole.indeterminate = on > 0 && on < boxes.length;
      row.querySelector('[data-count]').textContent = on === 0 || on === boxes.length ? `(${L('tout le chapitre', 'whole chapter')} : ${nObj(boxes.length)})` : `(${on} / ${nObj(boxes.length)})`;
    }
    const n = $('#rv-new'); if (doc.activeElement !== n) n.value = state.settings.newPerDay;
  }
  function chosen(next) {   // after a change of the chosen objectives or of the daily number: the session is recomputed
    state = next; refill(); stage(); progress(); syncChoose();
  }

  // ---- progress ----
  function progress() {
    const d = today(), all = M.stats(state, d, { known });
    if (!all.total) { $('#rv-progress').innerHTML = `<p class="rv-hint">${L('Tes progrès apparaîtront ici, chapitre par chapitre, dès que tu auras choisi quoi réviser.', 'Your progress will appear here, chapter by chapter, as soon as you have chosen what to review.')}</p>`; return; }
    const rows = classes.flatMap((c) => M.chapterStats(state, objectives, c.id, d).filter((r) => r.enrolled).map((r) => ({ ...r, course: c.id })));
    const seg = (kind, n) => (n ? `<i class="rv-seg rv-seg-${kind}" style="flex-grow:${n}"></i>` : '');
    $('#rv-progress').innerHTML = `<p><strong>${nObj(all.total)}</strong> : ${statsText(all)}.${all.nextDue !== null && !all.due ? ` ${L('Prochaine révision :', 'Next review:')} ${dayText(all.nextDue)}.` : ''}</p>
<p class="rv-legend" aria-hidden="true"><span><i class="rv-seg rv-seg-due"></i>${L('à revoir', 'to review')}</span><span><i class="rv-seg rv-seg-learning"></i>${L('en apprentissage', 'learning')}</span><span><i class="rv-seg rv-seg-mastered"></i>${L('acquis', 'mastered')}</span></p>
<ul class="rv-bars">${rows.map((r) => `<li><p class="rv-bar-title"><strong>${esc(chapterTitle(r.chapter))}</strong>${classes.length > 1 ? ` <span class="rv-count">${esc(courseTitle(r.course))}</span>` : ''}</p>
<p class="rv-bar-text">${r.enrolled} / ${nObj(r.objectives)} : ${statsText(r)}</p>
<div class="rv-bar" aria-hidden="true">${seg('due', r.due)}${seg('learning', r.learning)}${seg('mastered', r.mastered)}</div></li>`).join('')}</ul>
<p class="rv-hint">${L(`« Acquis » : la prochaine révision est à ${M.MASTERED_IVL} jours ou plus. « À revoir » compte aussi les questions jamais vues.`, `“Mastered”: the next review is ${M.MASTERED_IVL} days away or more. “To review” also counts the questions never seen.`)}</p>`;
  }

  // ---- data ----
  const say = (text, bad = false) => { const m = $('#rv-data-msg'); m.classList.toggle('rv-error', bad); m.textContent = text; };
  function exportNow() {
    const name = `revisions-${M.dayISO(today())}.json`, data = M.exportReview(state, now());
    download(name, JSON.stringify(data, null, 1));
    const n = Object.keys(data.cards).length;
    say(n ? L(`Fichier ${name} créé : ${n} objectif(s).`, `File ${name} created: ${n} objective(s).`) : L(`Fichier ${name} créé, mais il est vide : tu n’as encore rien choisi.`, `File ${name} created, but it is empty: you have not chosen anything yet.`));
  }
  async function importNow() {
    const file = $('#rv-file').files?.[0], mode = main.querySelector('input[name="rv-mode"]:checked')?.value;
    if (!file) { say(L('Choisis d’abord un fichier.', 'Choose a file first.'), true); $('#rv-file').focus(); return; }
    let res;
    if (file.size > M.MAX_BYTES) res = { ok: false, error: 'too-large' };
    else { try { res = M.importReview(await file.text(), store.load(), mode, { known }); } catch { res = { ok: false, error: 'unreadable' }; } }
    if (isGone()) return;
    if (!res.ok) { say(`${L('Import refusé, rien n’a changé.', 'Import refused, nothing changed.')} ${T(ERRORS[res.error] || ERRORS['not-object'])}${res.error === 'bad-card' && res.detail ? ` ${res.detail}` : ''}`, true); return; }
    done = 0; chosen(store.save(res.state, 'import')); notes();
    const drop = res.dropped ? L(` ${res.dropped} objectif(s) inconnu(s) ici ont été laissés de côté.`, ` ${res.dropped} objective(s) unknown here were left out.`) : '';
    say(mode === 'replace'
      ? L(`Import terminé : tes révisions ont été remplacées par les ${res.imported} du fichier.${drop}`, `Import done: your reviews were replaced by the ${res.imported} of the file.${drop}`)
      : L(`Import terminé : ${res.imported} objectif(s) repris du fichier, ${res.kept} gardé(s) tels quels car plus récents ici.${drop}`, `Import done: ${res.imported} objective(s) taken from the file, ${res.kept} kept as they were because more recent here.${drop}`));
  }
  const confirmBox = (open) => { wipe = open; $('#rv-confirm').hidden = !open; $('#rv-reset').setAttribute('aria-expanded', String(open)); (open ? $('#rv-reset-no') : $('#rv-reset')).focus(); };

  // ---- events ----
  const onClick = (e) => {
    const b = e.target.closest?.('button'); if (!b || !main.contains(b)) return;
    if (b.id === 'rv-reveal') reveal();
    else if (b.dataset.grade !== undefined) doGrade(Number(b.dataset.grade));
    else if (b.id === 'rv-export') exportNow();
    else if (b.id === 'rv-import') importNow();
    else if (b.id === 'rv-reset') confirmBox(!wipe);
    else if (b.id === 'rv-reset-no') confirmBox(false);
    else if (b.id === 'rv-reset-yes') { store.clear(); done = 0; confirmBox(false); chosen(store.load()); notes(); say(L('Toutes tes révisions ont été effacées de cet appareil.', 'All your reviews were erased from this device.')); }
  };
  const onChange = (e) => {
    const x = e.target, d = today();
    if (x.id === 'rv-class') { cls = x.value; rememberCourse(cls); chooseList(); }
    else if (x.dataset?.chapter) chosen(commit((s) => (x.checked ? M.enrolChapter(s, objectives, x.dataset.chapter, d) : M.unenrolChapter(s, objectives, x.dataset.chapter)), 'choose'));
    else if (x.dataset?.objective) chosen(commit((s) => (x.checked ? M.enrol(s, [x.dataset.objective], d) : M.unenrol(s, [x.dataset.objective])), 'choose'));
    else if (x.id === 'rv-new') { const n = Math.max(0, Math.min(M.MAX_NEW_PER_DAY, Math.round(Number(x.value)) || 0)); x.value = n; chosen(commit((s) => M.setNewPerDay(s, n), 'settings')); }
  };
  const onKey = (e) => {
    if (e.defaultPrevented || e.repeat || e.ctrlKey || e.metaKey || e.altKey || !current) return;
    const tag = e.target?.tagName || '';
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(tag) || e.target?.isContentEditable) return;
    if (!revealed && (e.key === ' ' || e.key === 'Enter')) { if (/^(BUTTON|A|SUMMARY)$/.test(tag)) return; e.preventDefault(); reveal(); }
    else if (revealed && /^[1-4]$/.test(e.key)) { e.preventDefault(); doGrade(Number(e.key) - 1); }
  };
  // Another tab changed the reviews: the lists follow; a question on screen stays until it is graded.
  const onStorage = (e) => { if (e.key && e.key !== sharedStore.KEY) return; state = store.load(); if (!current) { refill(); stage(); } progress(); syncChoose(); };
  main.addEventListener('click', onClick); main.addEventListener('change', onChange); doc.addEventListener('keydown', onKey); win?.addEventListener('storage', onStorage);

  notes(); refill(); stage(); chooseList(); progress();
  return () => { main.removeEventListener('click', onClick); main.removeEventListener('change', onChange); doc.removeEventListener('keydown', onKey); win?.removeEventListener('storage', onStorage); };
}
