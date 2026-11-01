// The Olympiad pages: #olympiad (the ten strategies, the three levels) and #olympiad/<id> (one strategy: the question
// that starts the search, something to handle, the idea, a solved example, a ladder of problems with hints and
// solutions, links to the experiments and challenges). Content in olympiad-content.js; figures in olympiad-widgets.js.
// Bilingual: the page follows the interface language. Solutions stay folded until the reader opens them.
import { STRATEGIES, LEVELS } from './olympiad-content.js';
import { mountWidget } from './olympiad-widgets.js';
import { mountExperiment } from './lab/mount.js';
import { resolveRef } from './lab/registry.js';
import { CHALLENGES } from './challenges/registry.js';
import { typeset } from './exercises/ui-kit.js';
import { icon } from './icons.js';

const E = (x) => String(x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// text with maths: escape the text, keep \( \) and \[ \] for MathJax
const M = (s) => E(s);
const code = (s) => `<pre class="olymp-code"><code>${E(s)}</code></pre>`;
export const isOlympiadRoute = (id) => !id || STRATEGIES.some((s) => s.id === id);

function challengeTitle(id, t) { const c = CHALLENGES.find((x) => (x.card || x).id === id); const card = c?.card || c; return card ? t(card.title) : id; }
function linkList(s, t) {
  return s.links.map(([kind, ref]) => {
    if (kind === 'challenge') return `<li><a href="#challenges/${E(ref)}">${icon('puzzle-piece', 18)}<span>${E(challengeTitle(ref, t))}</span></a></li>`;
    const r = resolveRef(ref); if (!r) return '';
    return `<li><a href="#lab/${E(ref)}">${icon('flask', 18)}<span>${E(t(r.experiment.title))}</span></a></li>`;
  }).join('');
}

export function olympiadPage(id, t) {
  if (!id) {
    const byTheme = [...new Set(STRATEGIES.map((s) => t(s.theme)))];
    return `<main id="main" tabindex="-1" class="page olymp-page"><h1>${t(['Olympiades', 'Olympiads'])}</h1>
<p class="page-intro">${t(['Dix façons de penser qui reviennent dans tous les concours. Chacune commence par une question à manipuler, explique l’idée sur un exemple, puis propose une échelle de problèmes, de la sélection nationale au niveau international, avec des indices progressifs et des solutions complètes.', 'Ten ways of thinking that come back in every competition. Each one starts with a question to handle, explains the idea on an example, then offers a ladder of problems, from national selection to international level, with progressive hints and full solutions.'])}</p>
<ul class="olymp-levels">${Object.entries(LEVELS).map(([k, v]) => `<li class="olymp-level olymp-${k}">${E(t(v))}</li>`).join('')}</ul>
${byTheme.map((theme) => `<section class="olymp-theme"><h2>${E(theme)}</h2><ul class="olymp-grid">${STRATEGIES.filter((s) => t(s.theme) === theme).map((s) => `<li><a class="olymp-card" href="#olympiad/${s.id}">${icon(s.icon, 26)}<strong>${M(t(s.title))}</strong><span>${M(t(s.hook))}</span><small>${s.problems.length} ${t(['problèmes', 'problems'])}</small></a></li>`).join('')}</ul></section>`).join('')}
<p class="muted olymp-note">${t(['Les problèmes classiques sont reformulés ; la source est indiquée quand un problème vient d’un concours.', 'Classical problems are restated in our own words; the source is given when a problem comes from a competition.'])}</p></main>`;
  }
  const s = STRATEGIES.find((x) => x.id === id), i = STRATEGIES.indexOf(s);
  const prev = STRATEGIES[i - 1], next = STRATEGIES[i + 1];
  const lab = s.links.find(([k]) => k === 'lab');
  const handle = s.widget ? `<div class="olymp-widget" data-olymp-widget="${s.widget}"></div>`
    : lab ? `<div class="chapter-lab-host lab2-host olymp-lab" data-lab-ref="${E(lab[1])}"></div>` : '';
  const problem = (p, n) => `<article class="olymp-problem olymp-${p.level}" id="p${n + 1}"><header><span class="olymp-level olymp-${p.level}">${E(t(LEVELS[p.level]))}</span><h3>${t(['Problème', 'Problem'])} ${n + 1} · ${M(t(p.title))}</h3></header>
<p>${M(t(p.q))}</p>${p.hints.map((h, k) => `<details class="olymp-hint"><summary>${t(['Indice', 'Hint'])} ${k + 1}</summary><p>${M(t(h))}</p></details>`).join('')}
<details class="olymp-solution"><summary>${t(['Solution, après avoir cherché', 'Solution, after trying'])}</summary><p>${M(t(p.s))}</p>${p.code ? code(p.code) : ''}</details>${p.source ? `<p class="olymp-source">${t(['Source : ', 'Source: '])}${E(t(p.source))}</p>` : ''}</article>`;
  return `<main id="main" tabindex="-1" class="page olymp-page olymp-detail"><nav class="breadcrumb"><a href="#olympiad">${t(['Toutes les stratégies', 'All strategies'])}</a></nav>
<p class="muted">${E(t(s.theme))}</p><h1>${M(t(s.title))}</h1>
<section class="olymp-hook"><h2>${t(['La question', 'The question'])}</h2><p class="olymp-question">${M(t(s.hook))}</p>${handle}</section>
<section class="olymp-idea"><h2>${t(['L’idée', 'The idea'])}</h2>${s.idea.map((x) => `<p>${M(t(x))}</p>`).join('')}</section>
<section class="olymp-example"><h2>${t(['Un exemple résolu', 'A solved example'])}</h2><p><strong>${M(t(s.example.q))}</strong></p><p>${M(t(s.example.s))}</p>${s.example.code ? code(s.example.code) : ''}</section>
<section class="olymp-problems"><h2>${t(['À vous de chercher', 'Your turn'])}</h2><p class="muted">${t(['Cherchez d’abord seul, au moins quelques minutes, avec des petits cas et une figure. Les indices s’ouvrent un par un.', 'Try alone first, for a few minutes at least, with small cases and a figure. The hints open one at a time.'])}</p>${s.problems.map(problem).join('')}</section>
${s.links.length ? `<section class="olymp-links"><h2>${t(['Manipuler sur le site', 'Hands-on on this site'])}</h2><ul>${linkList(s, t)}</ul></section>` : ''}
<nav class="olymp-pager">${prev ? `<a href="#olympiad/${prev.id}">← ${M(t(prev.title))}</a>` : '<span></span>'}${next ? `<a href="#olympiad/${next.id}">${M(t(next.title))} →</a>` : ''}</nav></main>`;
}

export function bindOlympiad(root, lang) {
  const live = [];
  root.querySelectorAll('[data-olymp-widget]').forEach((el) => live.push(mountWidget(el.dataset.olympWidget, el, lang)));
  root.querySelectorAll('.olymp-lab').forEach((el) => live.push(mountExperiment(el, el.dataset.labRef, { mode: 'inline', lang })));
  typeset(root).catch(() => {});
  return () => live.forEach((x) => x?.destroy?.());
}
