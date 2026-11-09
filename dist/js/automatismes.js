// "Automatismes" (#automatismes): a generator of short fluency series. The teacher chooses the class, chapters, topics,
// levels, number of questions and total time; the series can be projected from the page, printed (students, teacher),
// or exported as LaTeX source or as a standalone projection page. Same seed, same series.
import { CLASSES, buildStarter, describeLevels } from './exercises/bank.js';
import { html, esc, starterHtml, starterTex, projectionHtml } from './exercises/export.js';
import { P, loadSettings, saveSettings, typeset, download, printMarkup, stamp, classOptions, chapterChips, domainChips, levelChips, checked } from './exercises/ui-kit.js';
import { fullscreenButton } from './visual-lessons.js';

const KEY = 'maths-explorer-automatismes-v1';
const DEFAULTS = { cls: 'premiere', chapters: [], domains: [], levels: [1, 2], count: 10, minutes: 5, order: 'progressive', fast: true, qcm: false, seed: '' };
const newSeed = () => Math.random().toString(36).slice(2, 8);

export function automatismesPage(t, pair) {
  const s = loadSettings(KEY, DEFAULTS);
  return `<main id="main" tabindex="-1" class="page gen-page" data-gen="starter"><h1>${t(P('Automatismes', 'Fluency starters'))}</h1>
<p class="page-intro">${t(P('Choisis ta classe et la durée, puis projette la série. Tu peux préciser les chapitres et ajuster les réglages si nécessaire.', 'Choose your class and duration, then project the series. You can select chapters and adjust settings if needed.'))}</p>
<div class="gen-layout">
<form class="gen-form" id="gen-form" aria-label="${t(P('Réglages de la série', 'Series settings'))}" onsubmit="return false">
<label class="gen-field"><span>${t(P('Classe', 'Class'))}</span><select name="cls">${classOptions(s.cls)}</select></label>
<div id="gen-chapters"></div><div id="gen-domains"></div><div id="gen-levels">${levelChips(s.levels, t)}</div>
<div class="gen-row">
<label class="gen-field"><span>${t(P('Questions', 'Questions'))}</span><input type="number" name="count" min="3" max="30" value="${s.count}"></label>
<label class="gen-field"><span>${t(P('Durée totale (minutes)', 'Total time (minutes)'))}</span><input type="number" name="minutes" min="1" max="60" value="${s.minutes}"></label>
<label class="gen-field"><span>${t(P('Ordre', 'Order'))}</span><select name="order"><option value="progressive"${s.order === 'progressive' ? ' selected' : ''}>${t(P('Progressif (du plus simple au plus dur)', 'Progressive (easiest first)'))}</option><option value="mixed"${s.order === 'mixed' ? ' selected' : ''}>${t(P('Mélangé', 'Mixed'))}</option></select></label>
</div>
<label class="gen-check"><input type="checkbox" name="fast"${s.fast ? ' checked' : ''}> ${t(P('Questions courtes seulement (adaptées à un automatisme)', 'Short questions only (suited to a starter)'))}</label>
<label class="gen-check"><input type="checkbox" name="qcm"${s.qcm ? ' checked' : ''}> ${t(P('Inclure des QCM (à quatre choix, plus longs à lire)', 'Include four-choice questions (longer to read)'))}</label>
<div class="gen-row"><label class="gen-field"><span>${t(P('Code de la série', 'Series code'))}</span><input type="text" name="seed" value="${esc(s.seed)}" maxlength="24" autocomplete="off" spellcheck="false"></label><button type="button" class="btn btn-secondary" id="gen-new">${t(P('Nouvelle série', 'New series'))}</button></div>
<p class="muted">${t(P('La même graine redonne exactement la même série ; n’importe quel texte est une graine, donc le nombre de séries est illimité.', 'The same seed gives exactly the same series; any text is a seed, so the number of series is unlimited.'))}</p>
</form>
<section class="gen-output" aria-label="${t(P('Série générée', 'Generated series'))}">
<div class="gen-actions" role="group" aria-label="${t(P('Exports', 'Exports'))}">
<button type="button" class="btn btn-primary" data-act="project">${t(P('Projeter', 'Project'))}</button>
<button type="button" class="btn btn-secondary" data-act="print-student">${t(P('Imprimer (élèves)', 'Print (students)'))}</button>
<button type="button" class="btn btn-secondary" data-act="print-teacher">${t(P('Imprimer le corrigé', 'Print answer key'))}</button>
<button type="button" class="btn btn-secondary" data-act="tex-student">${t(P('LaTeX élèves (.tex)', 'LaTeX students (.tex)'))}</button>
<button type="button" class="btn btn-secondary" data-act="tex-teacher">${t(P('LaTeX corrigé (.tex)', 'LaTeX key (.tex)'))}</button>
<button type="button" class="btn btn-secondary" data-act="projection-file">${t(P('Page de projection (.html)', 'Projection page (.html)'))}</button>
</div>
<p id="gen-summary" class="muted" role="status" aria-live="polite"></p>
<section class="auto-stage" id="auto-stage" data-fs-target aria-label="${t(P('Projection', 'Projection'))}" tabindex="-1">
<div class="auto-head"><span id="st-count"></span><span id="st-timer" role="timer" aria-live="off"></span><span id="st-level"></span></div>
<div class="auto-bar" aria-hidden="true"><i id="st-fill"></i></div>
<div class="auto-body"><div id="st-q" class="auto-q" aria-live="polite"></div><div id="st-a" class="auto-a"></div></div>
<div class="auto-controls"><button type="button" class="btn btn-secondary" id="st-prev">${t(P('Précédent', 'Previous'))}</button><button type="button" class="btn btn-secondary" id="st-next">${t(P('Suivant', 'Next'))}</button><button type="button" class="btn btn-secondary" id="st-reveal" aria-pressed="false">${t(P('Réponse', 'Answer'))}</button><button type="button" class="btn btn-primary" id="st-play" aria-pressed="false">${t(P('Départ', 'Start'))}</button>${fullscreenButton(pair)}<span class="muted auto-keys">${t(P('Touches : ← → A Espace', 'Keys: ← → A Space'))}</span></div>
</section>
<details class="gen-answers"><summary>${t(P('Voir la liste des questions et des réponses', 'Show the list of questions and answers'))}</summary><ol id="gen-list" class="gen-list"></ol></details>
</section></div></main>`;
}

export function bindAutomatismes(root, t, { chapterTitle = (id) => id } = {}) {
  const form = root.querySelector('#gen-form'), $ = (sel) => root.querySelector(sel);
  const s = loadSettings(KEY, DEFAULTS);
  if (!s.seed) s.seed = newSeed();
  form.elements.seed.value = s.seed;
  let doc = null, i = 0, showAnswer = false, running = false, left = 0, tick = null;

  const read = () => ({ cls: form.elements.cls.value, chapters: checked(form, 'chapter'), domains: checked(form, 'domain'), levels: checked(form, 'level').map(Number).sort(), count: Math.max(3, Math.min(30, Number(form.elements.count.value) || 10)), minutes: Math.max(1, Math.min(60, Number(form.elements.minutes.value) || 5)), order: form.elements.order.value, fast: form.elements.fast.checked, qcm: form.elements.qcm.checked, seed: form.elements.seed.value.trim() || s.seed });
  const drawChips = (cls) => { $('#gen-chapters').innerHTML = chapterChips(cls, s.chapters.filter((c) => c.startsWith(cls)), chapterTitle, t); $('#gen-domains').innerHTML = domainChips(cls, s.domains, t); };
  drawChips(s.cls);

  const subtitle = (o) => `${CLASSES.find((c) => c.id === o.cls).label}${o.chapters.length ? ` · ${o.chapters.map(chapterTitle).join(', ')}` : ''} · ${describeLevels(o.levels.length ? o.levels : [1, 2, 3])} · série ${o.seed}`;
  const stopTimer = () => { running = false; clearInterval(tick); tick = null; };
  function drawStage() {
    const stage = $('#auto-stage');
    if (!doc || doc.empty) { $('#st-q').textContent = t(P('Aucune question ne correspond à ces réglages : élargis les chapitres, thèmes ou niveaux.', 'No question matches these settings: widen the chapters, topics or levels.')); $('#st-a').textContent = ''; $('#st-count').textContent = ''; $('#st-timer').textContent = ''; $('#st-level').textContent = ''; return; }
    const it = doc.items[i];
    $('#st-q').innerHTML = stageQuestion(it);
    $('#st-a').innerHTML = showAnswer && !it.choices ? html(it.a) : '';   // a four-choice item shows its answer by highlighting the right choice   // the stage shows the answer only; the list below keeps the explanation
    $('#st-count').textContent = `${t(P('Question', 'Question'))} ${it.n} / ${doc.items.length}`;
    $('#st-timer').textContent = clock(left);
    $('#st-level').textContent = `${t(P('niveau', 'level'))} ${it.level}`;
    $('#st-fill').style.width = `${(100 * it.n) / doc.items.length}%`;
    $('#st-reveal').setAttribute('aria-pressed', String(showAnswer));
    $('#st-play').setAttribute('aria-pressed', String(running));
    $('#st-play').textContent = running ? t(P('Pause', 'Pause')) : t(P('Départ', 'Start'));
    typeset(stage).then(fit);
  }
  // one stem, then the choices as a grid of short lines (a four-choice item is never one long paragraph)
  const stageQuestion = (it) => it.choices
    ? `<strong>${it.n}.</strong> ${html(it.stem)}<ul class="auto-choices">${it.choices.map((c, k) => `<li${showAnswer && k === it.correct ? ' class="is-right"' : ''}><b>${'ABCD'[k]}</b><span>${html(c)}</span></li>`).join('')}</ul>`
    : `<strong>${it.n}.</strong> ${html(it.q)}`;
  // presented: shrink the text until question and answer fit the screen (the factor --fit scales both)
  const fit = () => {
    const stage = $('#auto-stage'), body = stage?.querySelector('.auto-body'); if (!body) return;
    stage.style.removeProperty('--fit'); if (!stage.classList.contains('presenting') && document.fullscreenElement !== stage) return;
    let f = 1;
    while (f > 0.3 && (body.scrollHeight > body.clientHeight + 1 || body.scrollWidth > body.clientWidth + 1)) { f -= 0.06; stage.style.setProperty('--fit', f.toFixed(2)); }
  };
  const clock = (n) => `${Math.floor(Math.max(0, n) / 60)}:${String(Math.max(0, n) % 60).padStart(2, '0')}`;
  const go = (n) => { if (!doc?.items.length) return; i = Math.max(0, Math.min(doc.items.length - 1, n)); showAnswer = false; left = doc.secondsPerItem; drawStage(); };
  const toggle = () => {
    if (!doc?.items.length) return;
    if (running) { stopTimer(); drawStage(); return; }
    running = true;
    tick = setInterval(() => { left -= 1; if (left <= 0) { if (i < doc.items.length - 1) go(i + 1); else { stopTimer(); left = 0; drawStage(); } } else $('#st-timer').textContent = clock(left); }, 1000);
    drawStage();
  };

  function rebuild(keepPosition = false) {
    const o = read();
    Object.assign(s, o, { seed: o.seed });
    saveSettings(KEY, s);
    stopTimer();
    doc = buildStarter({ cls: o.cls, chapters: o.chapters, domains: o.domains, levels: o.levels.length ? o.levels : [1, 2, 3], count: o.count, minutes: o.minutes, order: o.order, fastOnly: o.fast, qcm: o.qcm, seed: o.seed });
    if (!keepPosition) i = 0;
    showAnswer = false; left = doc.secondsPerItem || 0;
    const sum = $('#gen-summary');
    sum.textContent = doc.empty ? '' : `${doc.items.length} ${t(P('questions', 'questions'))} · ${doc.minutes} min · ${doc.secondsPerItem} s ${t(P('par question', 'per question'))}`;
    const list = $('#gen-list');
    list.innerHTML = doc.items.map((it) => `<li><div>${html(it.q)}</div><div class="gen-answer"><span class="muted">${t(P('Réponse', 'Answer'))} :</span> ${html(it.a)}${it.s ? ` <em class="muted">${html(it.s)}</em>` : ''}</div></li>`).join('');
    typeset(list);
    drawStage();
    return o;
  }

  form.addEventListener('change', (e) => {
    if (e.target.name === 'cls') { s.chapters = []; s.domains = []; drawChips(e.target.value); }
    rebuild();
  });
  form.elements.count.addEventListener('input', () => rebuild());
  form.elements.minutes.addEventListener('input', () => rebuild());
  form.elements.seed.addEventListener('input', () => rebuild());
  $('#gen-new').addEventListener('click', () => { form.elements.seed.value = newSeed(); rebuild(); });
  $('#st-prev').addEventListener('click', () => go(i - 1));
  $('#st-next').addEventListener('click', () => go(i + 1));
  $('#st-reveal').addEventListener('click', () => { showAnswer = !showAnswer; drawStage(); });
  $('#st-play').addEventListener('click', toggle);

  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]'); if (!b || !doc || doc.empty) return;
    const o = read(), sub = subtitle(o), name = stamp(o.cls, doc.seed), act = b.dataset.act;
    if (act === 'project') { const stage = $('#auto-stage'); stage.classList.add('presenting'); document.documentElement.classList.add('is-presenting'); stage.requestFullscreen?.().catch(() => {}); stage.focus(); }
    else if (act === 'print-student') printMarkup(starterHtml(doc, { subtitle: sub }));
    else if (act === 'print-teacher') printMarkup(starterHtml(doc, { teacher: true, subtitle: sub }));
    else if (act === 'tex-student') download(`automatismes-${name}.tex`, starterTex(doc, { version: 'student', subtitle: sub }), 'application/x-tex');
    else if (act === 'tex-teacher') download(`automatismes-${name}-corrige.tex`, starterTex(doc, { version: 'teacher', subtitle: sub }), 'application/x-tex');
    else if (act === 'projection-file') download(`automatismes-${name}-projection.html`, projectionHtml(doc, { title: 'Automatismes', subtitle: sub }), 'text/html;charset=utf-8');
  });
  const onKey = (e) => {
    const stage = $('#auto-stage'); if (!stage) return;
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
    const active = stage.classList.contains('presenting') || document.fullscreenElement === stage || stage.contains(document.activeElement);
    if (!active) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go(i + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(i - 1); }
    else if (e.key === 'a' || e.key === 'A') { showAnswer = !showAnswer; drawStage(); }
    else if (e.key === ' ' && e.target.tagName !== 'BUTTON') { e.preventDefault(); toggle(); }
  };
  document.addEventListener('keydown', onKey);
  window.addEventListener('resize', fit); document.addEventListener('fullscreenchange', fit);
  rebuild();
  return () => { stopTimer(); document.removeEventListener('keydown', onKey); window.removeEventListener('resize', fit); document.removeEventListener('fullscreenchange', fit); document.querySelector('.print-doc')?.remove(); };
}
